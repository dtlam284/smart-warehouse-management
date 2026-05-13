import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import type { 
    IPaginatedResponse 
} from '@/models/common/CommonInterface'
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
interface BackendPaginationResponse<TItem> {
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

function normalizeHandoverRecords(response: IHandoverRecord[] | unknown): IHandoverRecord[] {
    if (!Array.isArray(response)) {
        return []
    }

    return response.filter((item): item is IHandoverRecord => {
        return isRecord(item) && typeof item.DeliveryCode === 'string'
    })
}

function normalizeRemoveHandoverResponse(response: string[] | unknown): string[] {
    if (Array.isArray(response)) {
        return response.filter((item): item is string => typeof item === 'string')
    }

    return []
}

function normalizeHandoverListResponse(
    response: IPaginatedResponse<IHandoverRecord> | BackendPaginationResponse<IHandoverRecord> | IHandoverRecord[],
    fallbackRequest: IGetHandoverListRequest,
): IHandoverListResult {
    if (Array.isArray(response)) {
        return {
            Data: response,
            TotalRows: response.length,
            PageIndex: fallbackRequest.PageIndex,
            PageSize: fallbackRequest.PageSize,
        }
    }

    if ('Data' in response && Array.isArray(response.Data)) {
        return {
            Data: response.Data,
            TotalRows: response.TotalRows ?? response.Data.length,
            PageIndex: response.PageIndex ?? fallbackRequest.PageIndex,
            PageSize: response.PageSize ?? fallbackRequest.PageSize,
        }
    }

    if ('Items' in response && Array.isArray(response.Items)) {
        return {
            Data: response.Items,
            TotalRows: response.TotalRows ?? response.TotalCount ?? response.Items.length,
            PageIndex: response.PageIndex ?? fallbackRequest.PageIndex,
            PageSize: response.PageSize ?? fallbackRequest.PageSize,
        }
    }

    return {
        Data: [],
        TotalRows: 0,
        PageIndex: fallbackRequest.PageIndex,
        PageSize: fallbackRequest.PageSize,
    }
}
//#region helpers

//#region services
export const handoverService = {
    async addHandoverRecord(request: IUpdateHandoverRequest): Promise<IHandoverRecord[]> {
        const response = await apiClient.put<IHandoverRecord[] | unknown>(
            API_ENDPOINTS.handover.updateHandover,
            request,
        )

        return normalizeHandoverRecords(response)
    },

    async removeHandoverRecord(request: IRemoveHandoverRequest): Promise<string[]> {
        const response = await apiClient.post<string[] | unknown>(
            API_ENDPOINTS.handover.removeHandover,
            request,
        )

        return normalizeRemoveHandoverResponse(response)
    },

    async getHandoverList(request: IGetHandoverListRequest): Promise<IHandoverListResult> {
        const response = await apiClient.get<
            IPaginatedResponse<IHandoverRecord> | BackendPaginationResponse<IHandoverRecord> | IHandoverRecord[]
        >(API_ENDPOINTS.handover.handoverList, {
            query: { ...request },
        })

        return normalizeHandoverListResponse(response, request)
    },

    getHandoverStats(request: IGetHandoverStatsRequest = {}): Promise<IHandoverStats> {
        return apiClient.get<IHandoverStats>(API_ENDPOINTS.handover.statistics, {
            query: { ...request },
        })
    },
}
//#endregion services
