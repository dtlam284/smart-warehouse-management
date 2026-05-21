import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import type { IPaginatedResponse } from '@/models/common/CommonInterface'
import type {
    IGetHandoverListRequest,
    IGetHandoverStatsRequest,
    IRemoveHandoverRequest,
    IUpdateHandoverRequest,
} from '@/models/handover/HandoverDTO'
import type {
    IHandoverListResult,
    IHandoverRecord,
    IHandoverStats,
} from '@/models/handover/HandoverInterface'

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

interface IBackendHandoverRecord {
    Id?: string
    OrderCode?: string
    DeliveryCode?: string | null
    PackageCode?: string | null
    Code?: string | null
    HandoverByName?: string | null
    HandoverDate?: string | null
    DeliveryStatus?: number
    ShippingUnitId?: string | null
    ShippingUnitName?: string | null
    CustomerName?: string | null
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
        throw new Error(response.Message || 'Thao tác bàn giao thất bại')
    }

    return response.Data
}

function getStringValue(value: unknown, fallback = ''): string {
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function getNumberValue(value: unknown, fallback = 0): number {
    return typeof value === 'number' ? value : fallback
}

function normalizeHandoverRecord(item: unknown): IHandoverRecord | null {
    if (!isRecord(item)) {
        return null
    }

    const backendRecord = item as IBackendHandoverRecord

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
        HandoverByName: getStringValue(backendRecord.HandoverByName, '-'),
        HandoverDate: getStringValue(backendRecord.HandoverDate),
        DeliveryStatus: getNumberValue(backendRecord.DeliveryStatus),
        ShippingUnitId: getStringValue(backendRecord.ShippingUnitId),
        ShippingUnitName: getStringValue(backendRecord.ShippingUnitName, '-'),
        CustomerName:
            typeof backendRecord.CustomerName === 'string'
                ? backendRecord.CustomerName
                : null,
        TotalRows: getNumberValue(backendRecord.TotalRows),
    }
}

function normalizeHandoverRecords(response: unknown): IHandoverRecord[] {
    const data = unwrapApiData(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data
        .map(normalizeHandoverRecord)
        .filter((record): record is IHandoverRecord => record !== null)
}

function normalizeRemoveHandoverResponse(response: unknown): string[] {
    const data = unwrapApiData(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data.filter((item): item is string => typeof item === 'string')
}

function normalizeHandoverListResponse(
    response:
        | IPaginatedResponse<IHandoverRecord>
        | IBackendPaginationResponse<IHandoverRecord>
        | IHandoverRecord[]
        | unknown,
    fallbackRequest: IGetHandoverListRequest,
): IHandoverListResult {
    const data = unwrapApiData(response)

    if (Array.isArray(data)) {
        const records = data
            .map(normalizeHandoverRecord)
            .filter((record): record is IHandoverRecord => record !== null)

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
            .map(normalizeHandoverRecord)
            .filter((record): record is IHandoverRecord => record !== null)

        return {
            Data: records,
            TotalRows:
                typeof data.Total === 'number'
                    ? data.Total
                    : typeof data.TotalRows === 'number'
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

    if ('Data' in data && Array.isArray(data.Data)) {
        const records = data.Data
            .map(normalizeHandoverRecord)
            .filter((record): record is IHandoverRecord => record !== null)

        return {
            Data: records,
            TotalRows:
                typeof data.TotalRows === 'number'
                    ? data.TotalRows
                    : typeof data.Total === 'number'
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

    if ('Items' in data && Array.isArray(data.Items)) {
        const records = data.Items
            .map(normalizeHandoverRecord)
            .filter((record): record is IHandoverRecord => record !== null)

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

function normalizeHandoverStats(response: unknown): IHandoverStats {
    const data = unwrapApiData(response)

    if (!isRecord(data)) {
        return {
            FromDate: '',
            ToDate: '',
            Statistics: [],
        }
    }

    return {
        FromDate: typeof data.FromDate === 'string' ? data.FromDate : '',
        ToDate: typeof data.ToDate === 'string' ? data.ToDate : '',
        Statistics: Array.isArray(data.Statistics)
            ? (data.Statistics as IHandoverStats['Statistics'])
            : [],
    }
}
//#endregion helpers

//#region services
export const handoverService = {
    async addHandoverRecord(request: IUpdateHandoverRequest): Promise<IHandoverRecord[]> {
        const response = await apiClient.put<unknown>(
            API_ENDPOINTS.handover.updateHandover,
            request,
        )

        return normalizeHandoverRecords(response)
    },

    async removeHandoverRecord(request: IRemoveHandoverRequest): Promise<string[]> {
        const response = await apiClient.post<unknown>(
            API_ENDPOINTS.handover.removeHandover,
            request,
        )

        return normalizeRemoveHandoverResponse(response)
    },

    async getHandoverList(request: IGetHandoverListRequest): Promise<IHandoverListResult> {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.handover.handoverList, {
            query: { ...request },
        })

        return normalizeHandoverListResponse(response, request)
    },

    async getHandoverStats(request: IGetHandoverStatsRequest = {}): Promise<IHandoverStats> {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.handover.statistics, {
            query: { ...request },
        })

        return normalizeHandoverStats(response)
    },
}
//#endregion services
