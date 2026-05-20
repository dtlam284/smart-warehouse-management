import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
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
    IReturnStats,
} from '@/models/return/ReturnInterface'

//#region helpers
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function unwrapApiData(response: unknown): unknown {
    if (!isRecord(response)) {
        return response
    }

    if ('Data' in response) {
        return response.Data
    }

    return response
}

function normalizeReturnRecords(response: unknown): IReturnRecord[] {
    const data = unwrapApiData(response)

    if (Array.isArray(data)) {
        return data.filter((item): item is IReturnRecord => {
            return isRecord(item) && typeof item.OrderCode === 'string'
        })
    }

    if (isRecord(data) && Array.isArray(data.Result)) {
        return data.Result.filter((item): item is IReturnRecord => {
            return isRecord(item) && typeof item.OrderCode === 'string'
        })
    }

    return []
}

function normalizeRemoveReturnResponse(response: unknown): string[] {
    const data = unwrapApiData(response)

    if (!Array.isArray(data)) {
        return []
    }

    return data.filter((item): item is string => typeof item === 'string')
}

function normalizeReturnListResponse(
    response: unknown,
    fallbackRequest: IGetReturnListRequest,
): IReturnListResult {
    const data = unwrapApiData(response)

    if (Array.isArray(data)) {
        return {
            Data: data as IReturnRecord[],
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

    if (Array.isArray(data.Result)) {
        return {
            Data: data.Result as IReturnRecord[],
            TotalRows:
                typeof data.Total === 'number'
                    ? data.Total
                    : typeof data.TotalRows === 'number'
                      ? data.TotalRows
                      : data.Result.length,
            PageIndex:
                typeof data.PageIndex === 'number' ? data.PageIndex : fallbackRequest.PageIndex,
            PageSize:
                typeof data.PageSize === 'number' ? data.PageSize : fallbackRequest.PageSize,
        }
    }

    if (Array.isArray(data.Data)) {
        return {
            Data: data.Data as IReturnRecord[],
            TotalRows:
                typeof data.TotalRows === 'number'
                    ? data.TotalRows
                    : typeof data.Total === 'number'
                      ? data.Total
                      : data.Data.length,
            PageIndex:
                typeof data.PageIndex === 'number' ? data.PageIndex : fallbackRequest.PageIndex,
            PageSize:
                typeof data.PageSize === 'number' ? data.PageSize : fallbackRequest.PageSize,
        }
    }

    if (Array.isArray(data.Items)) {
        return {
            Data: data.Items as IReturnRecord[],
            TotalRows:
                typeof data.TotalRows === 'number'
                    ? data.TotalRows
                    : typeof data.TotalCount === 'number'
                      ? data.TotalCount
                      : data.Items.length,
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

function buildLayoutRequest(request: IConfirmReturnRequest): IConfirmReturnRequest {
    const { ContainerCode: _containerCode, WarehouseItemId: _warehouseItemId, WareHouseItemId: _wareHouseItemId, ...payload } =
        request

    return payload
}

function buildNoLayoutRequest(request: IConfirmReturnRequest): IConfirmReturnRequest {
    const {
        ContainerCode: _containerCode,
        ContainerId: _containerId,
        WarehouseItemId: _warehouseItemId,
        WareHouseItemId: _wareHouseItemId,
        Container: _container,
        ...payload
    } = request

    return payload
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
        const response = await apiClient.put<unknown>(
            API_ENDPOINTS.returnDelivery.confirmReturn,
            buildLayoutRequest(request),
        )

        return normalizeReturnRecords(response)
    },

    async confirmReturnNoLayout(request: IConfirmReturnRequest): Promise<IReturnRecord[]> {
        const response = await apiClient.put<unknown>(
            API_ENDPOINTS.returnDelivery.confirmReturnNoLayout,
            buildNoLayoutRequest(request),
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

    getReturnStats(request: IGetReturnStatsRequest = {}): Promise<IReturnStats> {
        return apiClient.get<IReturnStats>(API_ENDPOINTS.returnDelivery.statistics, {
            query: { ...request },
        })
    },
}
//#endregion service
