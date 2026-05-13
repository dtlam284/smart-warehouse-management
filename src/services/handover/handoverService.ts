import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import type { 
    PaginatedResponse 
} from '@/models/common/CommonInterface'
import type {
    GetHandoverListRequest,
    GetHandoverStatsRequest,
    RemoveHandoverRequest,
    UpdateHandoverRequest,
} from '@/models/handover/HandoverDTO'
import type {
    HandoverListResult,
    HandoverRecord,
    HandoverStats,
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

function normalizeHandoverRecords(response: HandoverRecord[] | unknown): HandoverRecord[] {
    if (!Array.isArray(response)) {
        return []
    }

    return response.filter((item): item is HandoverRecord => {
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
    response: PaginatedResponse<HandoverRecord> | BackendPaginationResponse<HandoverRecord> | HandoverRecord[],
    fallbackRequest: GetHandoverListRequest,
): HandoverListResult {
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
    async addHandoverRecord(request: UpdateHandoverRequest): Promise<HandoverRecord[]> {
        const response = await apiClient.put<HandoverRecord[] | unknown>(
            API_ENDPOINTS.handover.updateHandover,
            request,
        )

        return normalizeHandoverRecords(response)
    },

    async removeHandoverRecord(request: RemoveHandoverRequest): Promise<string[]> {
        const response = await apiClient.post<string[] | unknown>(
            API_ENDPOINTS.handover.removeHandover,
            request,
        )

        return normalizeRemoveHandoverResponse(response)
    },

    async getHandoverList(request: GetHandoverListRequest): Promise<HandoverListResult> {
        const response = await apiClient.get<
            PaginatedResponse<HandoverRecord> | BackendPaginationResponse<HandoverRecord> | HandoverRecord[]
        >(API_ENDPOINTS.handover.handoverList, {
            query: { ...request },
        })

        return normalizeHandoverListResponse(response, request)
    },

    getHandoverStats(request: GetHandoverStatsRequest = {}): Promise<HandoverStats> {
        return apiClient.get<HandoverStats>(API_ENDPOINTS.handover.statistics, {
            query: { ...request },
        })
    },
}
//#endregion services
