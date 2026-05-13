import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import type { 
    IPaginatedResponse 
} from '@/models/common/CommonInterface'
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
    IPackingRecord,
    IPackingStats } from '@/models/packing/PackingInterface'

//#region backend DTOs
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

function normalizePackingListResponse(
    response: IPaginatedResponse<IPackingRecord> | IBackendPaginationResponse<IPackingRecord> | IPackingRecord[],
    fallbackRequest: IGetPackingListRequest,
): IPackingListResult {
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

function normalizePackingRecords(response: IPackingRecord[] | unknown): IPackingRecord[] {
    if (!Array.isArray(response)) {
        return []
    }

    return response.filter((item): item is IPackingRecord => {
        return isRecord(item) && typeof item.DeliveryCode === 'string'
    })
}
//#endregion helpers

//#region services
export const packingService = {
    getPackageDetails(request: IGetPackageDetailsRequest): Promise<IPackingDetail> {
        return apiClient.get<IPackingDetail>(API_ENDPOINTS.packing.getPackageDetails, {
            query: { ...request },
        })
    },

    async completePacking(request: IUpdatePackingRequest): Promise<IPackingRecord[]> {
        const response = await apiClient.put<IPackingRecord[] | unknown>(API_ENDPOINTS.packing.updatePacking, request)

        return normalizePackingRecords(response)
    },

    async cancelPacking(request: IRemovePackingRequest): Promise<string[]> {
        const response = await apiClient.post<string[] | unknown>(API_ENDPOINTS.packing.removePacking, request)

        return normalizeRemovePackingResponse(response)
    },

    async getPackingList(request: IGetPackingListRequest): Promise<IPackingListResult> {
        const response = await apiClient.get<
            IPaginatedResponse<IPackingRecord> | IBackendPaginationResponse<IPackingRecord> | IPackingRecord[]
        >(API_ENDPOINTS.packing.packingList, {
            query: { ...request },
        })

        return normalizePackingListResponse(response, request)
    },

    getPackingStats(request: IGetPackingStatsRequest = {}): Promise<IPackingStats> {
        return apiClient.get<IPackingStats>(API_ENDPOINTS.packing.statistics, {
            query: { ...request },
        })
    },
}
//#endregion services
