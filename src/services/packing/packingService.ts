import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import type { 
    PaginatedResponse 
} from '@/models/common/CommonInterface'
import type {
    GetPackageDetailsRequest,
    GetPackingListRequest,
    GetPackingStatsRequest,
    RemovePackingRequest,
    UpdatePackingRequest,
} from '@/models/packing/PackingDTO'
import type { 
    PackingDetail, 
    PackingListResult, 
    PackingRecord,
    PackingStats } from '@/models/packing/PackingInterface'

interface BackendPaginationResponse<TItem> {
    Items?: TItem[]
    Data?: TItem[]
    TotalRows?: number
    TotalCount?: number
    PageIndex?: number
    PageSize?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function normalizePackingListResponse(
    response: PaginatedResponse<PackingRecord> | BackendPaginationResponse<PackingRecord> | PackingRecord[],
    fallbackRequest: GetPackingListRequest,
): PackingListResult {
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

function normalizeRemovePackingResponse(response: string[] | unknown): string[] {
    if (Array.isArray(response)) {
        return response.filter((item): item is string => typeof item === 'string')
    }

    return []
}

function normalizePackingRecords(response: PackingRecord[] | unknown): PackingRecord[] {
    if (!Array.isArray(response)) {
        return []
    }

    return response.filter((item): item is PackingRecord => {
        return isRecord(item) && typeof item.DeliveryCode === 'string'
    })
}

export const packingService = {
    getPackageDetails(request: GetPackageDetailsRequest): Promise<PackingDetail> {
        return apiClient.get<PackingDetail>(API_ENDPOINTS.packing.getPackageDetails, {
            query: { ...request },
        })
    },

    async completePacking(request: UpdatePackingRequest): Promise<PackingRecord[]> {
        const response = await apiClient.put<PackingRecord[] | unknown>(API_ENDPOINTS.packing.updatePacking, request)

        return normalizePackingRecords(response)
    },

    async cancelPacking(request: RemovePackingRequest): Promise<string[]> {
        const response = await apiClient.post<string[] | unknown>(API_ENDPOINTS.packing.removePacking, request)

        return normalizeRemovePackingResponse(response)
    },

    async getPackingList(request: GetPackingListRequest): Promise<PackingListResult> {
        const response = await apiClient.get<
            PaginatedResponse<PackingRecord> | BackendPaginationResponse<PackingRecord> | PackingRecord[]
        >(API_ENDPOINTS.packing.packingList, {
            query: { ...request },
        })

        return normalizePackingListResponse(response, request)
    },

    getPackingStats(request: GetPackingStatsRequest = {}): Promise<PackingStats> {
        return apiClient.get<PackingStats>(API_ENDPOINTS.packing.statistics, {
            query: { ...request },
        })
    },
}
