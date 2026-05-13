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
    IReturnRecord, 
    IReturnStats 
} from '@/models/return/ReturnInterface'

//#region types
interface IBackendPaginationResponse<TItem> {
    Items?: TItem[]
    Data?: TItem[]
    TotalRows?: number
    TotalCount?: number
    PageIndex?: number
    PageSize?: number
}
//#endregion types

//#region helpers
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function normalizeReturnRecords(response: IReturnRecord[] | unknown): IReturnRecord[] {
    if (!Array.isArray(response)) {
        return []
    }

    return response.filter((item): item is IReturnRecord => {
        return isRecord(item) && typeof item.DeliveryCode === 'string'
    })
}

function normalizeRemoveReturnResponse(response: string[] | unknown): string[] {
    if (Array.isArray(response)) {
        return response.filter((item): item is string => typeof item === 'string')
    }

    return []
}

function normalizeReturnListResponse(
    response: IPaginatedResponse<IReturnRecord> | IBackendPaginationResponse<IReturnRecord> | IReturnRecord[],
    fallbackRequest: IGetReturnListRequest,
): IReturnListResult {
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
//#endregion helpers

//#region service
export const returnService = {
    getReturnDetail(request: IGetReturnDetailRequest): Promise<IReturnDetail> {
        return apiClient.get<IReturnDetail>(API_ENDPOINTS.returnDelivery.getReturnDetail, {
            query: { ...request },
        })
    },

    async confirmReturn(request: IConfirmReturnRequest): Promise<IReturnRecord[]> {
        const response = await apiClient.put<IReturnRecord[] | unknown>(
            API_ENDPOINTS.returnDelivery.confirmReturn,
            request,
        )

        return normalizeReturnRecords(response)
    },

    async confirmReturnNoLayout(request: IConfirmReturnRequest): Promise<IReturnRecord[]> {
        const response = await apiClient.put<IReturnRecord[] | unknown>(
            API_ENDPOINTS.returnDelivery.confirmReturnNoLayout,
            request,
        )

        return normalizeReturnRecords(response)
    },

    async removeReturnRecord(request: IRemoveReturnRequest): Promise<string[]> {
        const response = await apiClient.request<string[] | unknown>(
            'DELETE',
            API_ENDPOINTS.returnDelivery.removeReturn,
            {
                body: request,
            },
        )

        return normalizeRemoveReturnResponse(response)
    },

    async getReturnList(request: IGetReturnListRequest): Promise<IReturnListResult> {
        const response = await apiClient.get<
            IPaginatedResponse<IReturnRecord> | IBackendPaginationResponse<IReturnRecord> | IReturnRecord[]
        >(API_ENDPOINTS.returnDelivery.returnList, {
            query: { ...request },
        })

        return normalizeReturnListResponse(response, request)
    },

    getReturnStats(request: IGetReturnStatsRequest = {}): Promise<IReturnStats> {
        return apiClient.get<IReturnStats>(API_ENDPOINTS.returnDelivery.statistics, {
            query: { ...request },
        })
    },
}
//#endregion service
