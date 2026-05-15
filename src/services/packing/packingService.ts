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
    SKU?: string
    Sku?: string
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
//#endregion backend dtos

//#region helpers
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function isBackendEnvelope(value: unknown): value is IBackendEnvelope<unknown> {
    return isRecord(value) && 'Code' in value && 'Message' in value
}

function assertSuccessfulEnvelope(response: unknown): unknown {
    if (!isBackendEnvelope(response)) {
        return response
    }

    if (response.Code !== undefined && response.Code !== 1) {
        throw new Error(response.Message || 'Thao tác đóng gói thất bại')
    }

    return response.Data
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
            item.Code ??
            item.SKU ??
            item.Sku ??
            '',
        Quantity: item.Quantity ?? item.TotalQuantity ?? 0,
    }
}

function normalizePackageDetail(
    response: unknown,
    request: IGetPackageDetailsRequest,
): IPackingDetail {
    const data = assertSuccessfulEnvelope(response)

    if (!data || typeof data !== 'object') {
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

function normalizePackingListResponse(
    response:
        | IPaginatedResponse<IPackingRecord>
        | IBackendPaginationResponse<IPackingRecord>
        | IPackingRecord[]
        | unknown,
    fallbackRequest: IGetPackingListRequest,
): IPackingListResult {
    const data = assertSuccessfulEnvelope(response)

    if (Array.isArray(data)) {
        return {
            Data: data,
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

    if ('Data' in data && Array.isArray(data.Data)) {
        return {
            Data: data.Data as IPackingRecord[],
            TotalRows:
                typeof data.TotalRows === 'number'
                    ? data.TotalRows
                    : data.Data.length,
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
        return {
            Data: data.Items as IPackingRecord[],
            TotalRows:
                typeof data.TotalRows === 'number'
                    ? data.TotalRows
                    : typeof data.TotalCount === 'number'
                      ? data.TotalCount
                      : data.Items.length,
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

function normalizePackingRecords(response: unknown): IPackingRecord[] {
    const data = assertSuccessfulEnvelope(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data.filter((item): item is IPackingRecord => {
        return isRecord(item) && typeof item.DeliveryCode === 'string'
    })
}

function normalizeRemovePackingResponse(response: unknown): string[] {
    const data = assertSuccessfulEnvelope(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data.filter((item): item is string => typeof item === 'string')
}

function normalizePackingStats(response: unknown): IPackingStats {
    const data = assertSuccessfulEnvelope(response)

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
