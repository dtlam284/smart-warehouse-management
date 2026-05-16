import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import type { 
    IPaginatedResponse 
} from '@/models/common/CommonInterface'
import type {
    IConfirmReturnRequest,
    IGetReturnDetailRequest,
    IGetReturnListRequest,
    IGetReturnStatsRequest,
    IRemoveReturnRequest,
} from '@/models/return/ReturnDTO'
import type {
    IReturnDetail,
    IReturnListResult,
    IReturnProduct,
    IReturnProviderStats,
    IReturnRecord,
    IReturnStats,
    ReturnType,
} from '@/models/return/ReturnInterface'

//#region backend types
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

interface IBackendReturnProduct {
    GroupServiceId?: string
    GroupServiceCode?: string | null
    GroupServiceName?: string | null
    Quantity?: number
    DamagedQuantity?: number
    TotalQuantity?: number
    Count?: number
    ProductCode?: string
    ProductName?: string | null
}

interface IBackendReturnRecord {
    Id?: string
    OrderCode?: string
    DeliveryCode?: string | null
    PackageCode?: string | null
    Code?: string | null
    OrderDate?: string
    ReturnByName?: string | null
    ReturnDate?: string | null
    HandoverDate?: string | null
    LastEditedDate?: string | null
    ShippingUnitId?: string | null
    ShippingUnitName?: string | null
    CustomerName?: string | null
    DistributorName?: string | null
    ReturnType?: ReturnType
    ListItem?: IBackendReturnProduct[]
    OrderTickets?: IBackendReturnProduct[]
    TotalRows?: number
}
//#endregion backend types

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
        throw new Error(response.Message || 'Thao tác hàng hoàn thất bại')
    }

    return response.Data
}

function getStringValue(value: unknown, fallback = ''): string {
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function getNumberValue(value: unknown, fallback = 0): number {
    return typeof value === 'number' ? value : fallback
}

function normalizeReturnType(value: unknown): ReturnType {
    if (value === 'FULL_RETURN' || value === 'PARTIAL_RETURN' || value === 'DEFECTIVE_RETURN') {
        return value
    }

    return 'PARTIAL_RETURN'
}

function normalizeReturnProduct(item: unknown): IReturnProduct {
    const record = isRecord(item) ? (item as IBackendReturnProduct) : {}

    const groupServiceId =
        getStringValue(record.GroupServiceId) ||
        getStringValue(record.ProductCode) ||
        getStringValue(record.GroupServiceCode)

    const totalQuantity =
        record.TotalQuantity ??
        record.Quantity ??
        record.Count ??
        0

    return {
        GroupServiceId: groupServiceId,
        GroupServiceCode: getStringValue(record.GroupServiceCode ?? record.ProductCode, groupServiceId),
        GroupServiceName: getStringValue(record.GroupServiceName ?? record.ProductName, 'Không có tên sản phẩm'),
        Quantity: getNumberValue(record.Quantity),
        DamagedQuantity: getNumberValue(record.DamagedQuantity),
        TotalQuantity: getNumberValue(totalQuantity),
    }
}

function normalizeReturnDetail(response: unknown): IReturnDetail {
    const data = unwrapApiData(response)

    if (!isRecord(data)) {
        throw new Error('Không tìm thấy thông tin đơn hoàn')
    }

    const record = data as IBackendReturnRecord
    const deliveryCode = getStringValue(record.DeliveryCode, getStringValue(record.PackageCode ?? record.Code))

    return {
        OrderCode: getStringValue(record.OrderCode),
        DeliveryCode: deliveryCode,
        OrderDate: getStringValue(record.OrderDate, new Date().toISOString()),
        DistributorName: getStringValue(record.DistributorName, '-'),
        ShippingUnitId: getStringValue(record.ShippingUnitId),
        ShippingUnitName: getStringValue(record.ShippingUnitName, '-'),
        CustomerName: getStringValue(record.CustomerName, '-'),
        ReturnType: normalizeReturnType(record.ReturnType),
        ListItem: (record.ListItem ?? record.OrderTickets ?? []).map(normalizeReturnProduct),
    }
}

function normalizeReturnRecord(item: unknown): IReturnRecord | null {
    if (!isRecord(item)) {
        return null
    }

    const record = item as IBackendReturnRecord
    const orderCode = getStringValue(record.OrderCode)
    const packageCode = getStringValue(record.PackageCode ?? record.Code)
    const deliveryCode = getStringValue(record.DeliveryCode, packageCode || orderCode)

    if (!orderCode && !deliveryCode) {
        return null
    }

    return {
        Id: getStringValue(record.Id, orderCode || deliveryCode),
        OrderCode: orderCode,
        DeliveryCode: deliveryCode,
        PackageCode: packageCode || undefined,
        OrderDate: getStringValue(record.OrderDate, new Date().toISOString()),
        ReturnByName: getStringValue(record.ReturnByName, '-'),
        ReturnDate: getStringValue(
            record.ReturnDate ?? record.HandoverDate ?? record.LastEditedDate,
            new Date().toISOString(),
        ),
        ShippingUnitId: getStringValue(record.ShippingUnitId),
        ShippingUnitName: getStringValue(record.ShippingUnitName, '-'),
        CustomerName: getStringValue(record.CustomerName, '-'),
        DistributorName: getStringValue(record.DistributorName, '-'),
        ReturnType: normalizeReturnType(record.ReturnType),
        ListItem: (record.ListItem ?? record.OrderTickets ?? []).map(normalizeReturnProduct),
        TotalRows: getNumberValue(record.TotalRows),
    }
}

function normalizeReturnRecords(response: unknown): IReturnRecord[] {
    const data = unwrapApiData(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data
        .map(normalizeReturnRecord)
        .filter((record): record is IReturnRecord => record !== null)
}

function normalizeRemoveReturnResponse(response: unknown): string[] {
    const data = unwrapApiData(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data.filter((item): item is string => typeof item === 'string')
}

function normalizeReturnListResponse(
    response:
        | IPaginatedResponse<IReturnRecord>
        | IBackendPaginationResponse<IReturnRecord>
        | IReturnRecord[]
        | unknown,
    fallbackRequest: IGetReturnListRequest,
): IReturnListResult {
    const data = unwrapApiData(response)

    if (Array.isArray(data)) {
        const records = data
            .map(normalizeReturnRecord)
            .filter((record): record is IReturnRecord => record !== null)

        return {
            Data: records,
            TotalRows: records.length,
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
            .map(normalizeReturnRecord)
            .filter((record): record is IReturnRecord => record !== null)

        return {
            Data: records,
            TotalRows: typeof data.Total === 'number' ? data.Total : records.length,
            PageIndex:
                typeof data.PageIndex === 'number' ? data.PageIndex : fallbackRequest.PageIndex,
            PageSize:
                typeof data.PageSize === 'number' ? data.PageSize : fallbackRequest.PageSize,
        }
    }

    if ('Data' in data && Array.isArray(data.Data)) {
        const records = data.Data
            .map(normalizeReturnRecord)
            .filter((record): record is IReturnRecord => record !== null)

        return {
            Data: records,
            TotalRows:
                typeof data.TotalRows === 'number'
                    ? data.TotalRows
                    : records.length,
            PageIndex:
                typeof data.PageIndex === 'number' ? data.PageIndex : fallbackRequest.PageIndex,
            PageSize:
                typeof data.PageSize === 'number' ? data.PageSize : fallbackRequest.PageSize,
        }
    }

    if ('Items' in data && Array.isArray(data.Items)) {
        const records = data.Items
            .map(normalizeReturnRecord)
            .filter((record): record is IReturnRecord => record !== null)

        return {
            Data: records,
            TotalRows:
                typeof data.TotalRows === 'number'
                    ? data.TotalRows
                    : typeof data.TotalCount === 'number'
                      ? data.TotalCount
                      : records.length,
            PageIndex:
                typeof data.PageIndex === 'number' ? data.PageIndex : fallbackRequest.PageIndex,
            PageSize:
                typeof data.PageSize === 'number' ? data.PageSize : fallbackRequest.PageSize,
        }
    }

    return {
        Data: [],
        TotalRows: 0,
        PageIndex: fallbackRequest.PageIndex,
        PageSize: fallbackRequest.PageSize,
    }
}

function normalizeReturnStats(response: unknown): IReturnStats {
    const data = unwrapApiData(response)

    if (!isRecord(data)) {
        return {
            FromDate: '',
            ToDate: '',
            Statistics: [],
        }
    }

    const rawStatistics = Array.isArray(data.Statistics) ? data.Statistics : []

    const statistics = rawStatistics
        .filter(isRecord)
        .map((item): IReturnProviderStats => {
            return {
                Name: getStringValue(item.Name ?? item.ShippingUnitName, '-'),
                ShippingUnitId: getStringValue(item.ShippingUnitId),
                TotalReturn: getNumberValue(item.TotalReturn ?? item.Total),
            }
        })

    return {
        FromDate: getStringValue(data.FromDate),
        ToDate: getStringValue(data.ToDate),
        Statistics: statistics,
    }
}
//#endregion helpers

//#region service
export const returnService = {
    async getReturnDetail(request: IGetReturnDetailRequest): Promise<IReturnDetail> {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.returnDelivery.getReturnDetail, {
            query: { ...request },
        })

        return normalizeReturnDetail(response)
    },

    async confirmReturn(request: IConfirmReturnRequest): Promise<IReturnRecord[]> {
        const response = await apiClient.put<unknown>(
            API_ENDPOINTS.returnDelivery.confirmReturn,
            request,
        )

        return normalizeReturnRecords(response)
    },

    async confirmReturnNoLayout(request: IConfirmReturnRequest): Promise<IReturnRecord[]> {
        const response = await apiClient.put<unknown>(
            API_ENDPOINTS.returnDelivery.confirmReturnNoLayout,
            request,
        )

        return normalizeReturnRecords(response)
    },

    async removeReturnRecord(request: IRemoveReturnRequest): Promise<string[]> {
        const response = await apiClient.request<unknown>(
            'DELETE',
            API_ENDPOINTS.returnDelivery.removeReturn,
            {
                body: request,
            },
        )

        return normalizeRemoveReturnResponse(response)
    },

    async getReturnList(request: IGetReturnListRequest): Promise<IReturnListResult> {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.returnDelivery.returnList, {
            query: { ...request },
        })

        return normalizeReturnListResponse(response, request)
    },

    async getReturnStats(request: IGetReturnStatsRequest = {}): Promise<IReturnStats> {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.returnDelivery.statistics, {
            query: { ...request },
        })

        return normalizeReturnStats(response)
    },
}
//#endregion service
