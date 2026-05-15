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

//#region backend DTOs
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
//#endregion backend DTOs

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
        throw new Error(response.Message || 'Thao tác bàn giao thất bại')
    }

    return response.Data
}

function normalizeHandoverRecords(response: IHandoverRecord[] | unknown): IHandoverRecord[] {
    const data = assertSuccessfulEnvelope(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data.filter((item): item is IHandoverRecord => {
        return isRecord(item) && typeof item.DeliveryCode === 'string'
    })
}

function normalizeRemoveHandoverResponse(response: string[] | unknown): string[] {
    const data = assertSuccessfulEnvelope(response)

    if (Array.isArray(data)) {
        return data.filter((item): item is string => typeof item === 'string')
    }

    return []
}

function normalizeHandoverListResponse(
    response:
        | IPaginatedResponse<IHandoverRecord>
        | IBackendPaginationResponse<IHandoverRecord>
        | IHandoverRecord[]
        | unknown,
    fallbackRequest: IGetHandoverListRequest,
): IHandoverListResult {
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
            Data: data.Data,
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
            Data: data.Items,
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

        const data = assertSuccessfulEnvelope(response)

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
    },
}
//#endregion services
