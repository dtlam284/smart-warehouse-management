import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import type { IPaginatedResponse } from '@/models/common/CommonInterface'
import type {
    IGetPackageDetailsRequest,
    IGetPackingListRequest,
    IGetPackingStatsRequest,
    IRemovePackingRequest,
    IUpdatePackingRequest,
} from '@/models/packing/PackingDTO'
import type {
    IPackingDetail,
    IPackingListResult,
    IPackingProduct,
    IPackingRecord,
    IPackingStats,
} from '@/models/packing/PackingInterface'

//#region backend dtos
interface IBackendEnvelope<TData> {
    Code?: number
    Message?: string
    Detail?: string | null
    Data?: TData | null
}

interface IBackendPaginationResponse<TItem> {
    Items?: TItem[]
    Data?: TItem[]
    Result?: TItem[]
    Total?: number
    TotalRows?: number
    TotalCount?: number
    PageIndex?: number
    PageSize?: number
}

interface IBackendPackingProduct {
    GroupServiceName?: string | null
    ListingPropertyCode?: string
    Quantity?: number

    Name?: string | null
    ProductName?: string | null
    Code?: string
    ProductCode?: string
    SKU?: string
    Sku?: string
    Count?: number
    TotalQuantity?: number
}

interface IBackendPackingDetail {
    Name?: string
    PackageName?: string
    Code?: string
    DeliveryCode?: string
    PackageCode?: string
    PackageDetails?: IBackendPackingProduct[]
    Items?: IBackendPackingProduct[]
    ListItems?: IBackendPackingProduct[]
    Products?: IBackendPackingProduct[]
}

interface IBackendPackingRecord {
    Id?: string
    OrderCode?: string
    DeliveryCode?: string | null
    PackageCode?: string | null
    Code?: string | null
    PackerByName?: string | null
    PackingDate?: string | null
    ShippingUnitName?: string | null
    TotalRows?: number
}
//#endregion backend dtos

//#region helpers
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function isBackendEnvelope(value: unknown): value is IBackendEnvelope<unknown> {
    return isRecord(value) && 'Code' in value && 'Message' in value
}

function unwrapApiData(response: unknown): unknown {
    if (!isBackendEnvelope(response)) {
        return response
    }

    if (response.Code !== undefined && response.Code !== 1) {
        throw new Error(response.Message || 'Thao tác đóng gói thất bại')
    }

    return response.Data
}

function getStringValue(value: unknown, fallback = ''): string {
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function getNumberValue(value: unknown, fallback = 0): number {
    return typeof value === 'number' ? value : fallback
}

function getScanCodeFromRequest(request: IGetPackageDetailsRequest): string {
    return (
        request.DeliveryCode ??
        request.PackageCode ??
        request.OrderCode ??
        request.OrderCodeRef ??
        ''
    )
}

function normalizePackingProduct(item: IBackendPackingProduct): IPackingProduct {
    return {
        GroupServiceName:
            item.GroupServiceName ??
            item.ProductName ??
            item.Name ??
            'Không có tên sản phẩm',
        ListingPropertyCode:
            item.ListingPropertyCode ??
            item.ProductCode ??
            item.Code ??
            item.SKU ??
            item.Sku ??
            '',
        Quantity: item.Quantity ?? item.Count ?? item.TotalQuantity ?? 0,
    }
}

function normalizePackageDetail(
    response: unknown,
    request: IGetPackageDetailsRequest,
): IPackingDetail {
    const data = unwrapApiData(response)

    if (!isRecord(data)) {
        throw new Error(`Không tìm thấy kiện với mã ${getScanCodeFromRequest(request)}`)
    }

    const detail = data as IBackendPackingDetail

    const packageDetails =
        detail.PackageDetails ??
        detail.Items ??
        detail.ListItems ??
        detail.Products ??
        []

    return {
        Name:
            detail.Name ??
            detail.PackageName ??
            detail.Code ??
            detail.DeliveryCode ??
            'Kiện hàng',
        Code:
            detail.Code ??
            detail.DeliveryCode ??
            detail.PackageCode ??
            getScanCodeFromRequest(request),
        PackageDetails: packageDetails
            .map(normalizePackingProduct)
            .filter((item) => item.ListingPropertyCode.trim().length > 0),
    }
}

function normalizePackingRecord(item: unknown): IPackingRecord | null {
    if (!isRecord(item)) {
        return null
    }

    const backendRecord = item as IBackendPackingRecord

    const orderCode = getStringValue(backendRecord.OrderCode)
    const packageCode = getStringValue(backendRecord.PackageCode ?? backendRecord.Code)
    const deliveryCode = getStringValue(
        backendRecord.DeliveryCode,
        packageCode || orderCode,
    )

    if (!orderCode && !deliveryCode) {
        return null
    }

    return {
        Id: getStringValue(backendRecord.Id, orderCode || deliveryCode),
        OrderCode: orderCode,
        DeliveryCode: deliveryCode,
        PackageCode: packageCode || undefined,
        PackerByName: getStringValue(backendRecord.PackerByName, '-'),
        PackingDate: getStringValue(backendRecord.PackingDate, new Date().toISOString()),
        ShippingUnitName: getStringValue(backendRecord.ShippingUnitName, '-'),
        TotalRows: getNumberValue(backendRecord.TotalRows),
    }
}

function normalizePackingRecords(response: unknown): IPackingRecord[] {
    const data = unwrapApiData(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data
        .map(normalizePackingRecord)
        .filter((record): record is IPackingRecord => record !== null)
}

function normalizePackingListResponse(
    response:
        | IPaginatedResponse<IPackingRecord>
        | IBackendPaginationResponse<IPackingRecord>
        | IPackingRecord[]
        | unknown,
    fallbackRequest: IGetPackingListRequest,
): IPackingListResult {
    const data = unwrapApiData(response)

    if (Array.isArray(data)) {
        return {
            Data: data
                .map(normalizePackingRecord)
                .filter((record): record is IPackingRecord => record !== null),
            TotalRows: data.length,
            PageIndex: fallbackRequest.PageIndex,
            PageSize: fallbackRequest.PageSize,
        }
    }

    if (!isRecord(data)) {
        return {
            Data: [],
            TotalRows: 0,
            PageIndex: fallbackRequest.PageIndex,
            PageSize: fallbackRequest.PageSize,
        }
    }

    if ('Result' in data && Array.isArray(data.Result)) {
        const records = data.Result
            .map(normalizePackingRecord)
            .filter((record): record is IPackingRecord => record !== null)

        return {
            Data: records,
            TotalRows:
                typeof data.Total === 'number'
                    ? data.Total
                    : records.length,
            PageIndex:
                typeof data.PageIndex === 'number'
                    ? data.PageIndex
                    : fallbackRequest.PageIndex,
            PageSize:
                typeof data.PageSize === 'number'
                    ? data.PageSize
                    : fallbackRequest.PageSize,
        }
    }

    if ('Data' in data && Array.isArray(data.Data)) {
        const records = data.Data
            .map(normalizePackingRecord)
            .filter((record): record is IPackingRecord => record !== null)

        return {
            Data: records,
            TotalRows:
                typeof data.TotalRows === 'number'
                    ? data.TotalRows
                    : records.length,
            PageIndex:
                typeof data.PageIndex === 'number'
                    ? data.PageIndex
                    : fallbackRequest.PageIndex,
            PageSize:
                typeof data.PageSize === 'number'
                    ? data.PageSize
                    : fallbackRequest.PageSize,
        }
    }

    if ('Items' in data && Array.isArray(data.Items)) {
        const records = data.Items
            .map(normalizePackingRecord)
            .filter((record): record is IPackingRecord => record !== null)

        return {
            Data: records,
            TotalRows:
                typeof data.TotalRows === 'number'
                    ? data.TotalRows
                    : typeof data.TotalCount === 'number'
                      ? data.TotalCount
                      : records.length,
            PageIndex:
                typeof data.PageIndex === 'number'
                    ? data.PageIndex
                    : fallbackRequest.PageIndex,
            PageSize:
                typeof data.PageSize === 'number'
                    ? data.PageSize
                    : fallbackRequest.PageSize,
        }
    }

    return {
        Data: [],
        TotalRows: 0,
        PageIndex: fallbackRequest.PageIndex,
        PageSize: fallbackRequest.PageSize,
    }
}

function normalizeRemovePackingResponse(response: unknown): string[] {
    const data = unwrapApiData(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data.filter((item): item is string => typeof item === 'string')
}

function normalizePackingStats(response: unknown): IPackingStats {
    const data = unwrapApiData(response)

    if (!isRecord(data)) {
        return {
            FromDate: '',
            ToDate: '',
            TotalPacking: 0,
            TotalSalesOrder: 0,
        }
    }

    return {
        FromDate: typeof data.FromDate === 'string' ? data.FromDate : '',
        ToDate: typeof data.ToDate === 'string' ? data.ToDate : '',
        TotalPacking: typeof data.TotalPacking === 'number' ? data.TotalPacking : 0,
        TotalSalesOrder:
            typeof data.TotalSalesOrder === 'number' ? data.TotalSalesOrder : 0,
    }
}
//#endregion helpers

//#region services
export const packingService = {
    async getPackageDetails(request: IGetPackageDetailsRequest): Promise<IPackingDetail> {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.packing.getPackageDetails, {
            query: { ...request },
        })

        return normalizePackageDetail(response, request)
    },

    async completePacking(request: IUpdatePackingRequest): Promise<IPackingRecord[]> {
        const response = await apiClient.put<unknown>(
            API_ENDPOINTS.packing.updatePacking,
            request,
        )

        return normalizePackingRecords(response)
    },

    async cancelPacking(request: IRemovePackingRequest): Promise<string[]> {
        const response = await apiClient.post<unknown>(
            API_ENDPOINTS.packing.removePacking,
            request,
        )

        return normalizeRemovePackingResponse(response)
    },

    async getPackingList(request: IGetPackingListRequest): Promise<IPackingListResult> {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.packing.packingList, {
            query: { ...request },
        })

        return normalizePackingListResponse(response, request)
    },

    async getPackingStats(request: IGetPackingStatsRequest = {}): Promise<IPackingStats> {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.packing.statistics, {
            query: { ...request },
        })

        return normalizePackingStats(response)
    },
}
//#endregion services
