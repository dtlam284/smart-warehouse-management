import { API_ENDPOINTS } from '@/constants/api'
import { apiClient, configApiClient } from '@/services/core'
import type {
    GetConfigRequest,
    GetConfigResponse,
    IShippingProvider,
    IShippingProvidersResponse,
    IWarehouseContainer,
    IWarehouseContainerResponse,
    IWarehouseOperationConfig,
} from '@/models/warehouse/WarehouseInterface'

//#region constants
const WAREHOUSE_CONFIG_KEY = 'WAREHOUSE'
const LAYOUT_CONFIG_KEY = 'LAYOUT'
//#endregion constants

//#region helpers
function parseWarehouseOperationConfig(configs: GetConfigResponse): IWarehouseOperationConfig {
    const warehouseConfig = configs.find((item) => item.Key === WAREHOUSE_CONFIG_KEY)

    const layoutConfig = warehouseConfig?.Child?.find((item) => item.Key === LAYOUT_CONFIG_KEY)

    return {
        HasLayout: layoutConfig?.Values === '1',
    }
}

function normalizeContainerResponse(
    response: IWarehouseContainer | IWarehouseContainerResponse,
): IWarehouseContainer {
    if ('Data' in response) {
        if (!response.Data) {
            throw new Error(response.Message || 'Không tìm thấy thông tin thùng chứa')
        }

        return response.Data
    }

    if ('Id' in response && 'Code' in response) {
        return response
    }

    throw new Error('Không tìm thấy thông tin thùng chứa')
}
//#endregion helpers

//#region services
export const warehouseService = {
    async getConfig(
        request: GetConfigRequest = {
            Key: WAREHOUSE_CONFIG_KEY,
        },
    ): Promise<IWarehouseOperationConfig> {
        const response = await configApiClient.get<GetConfigResponse>(
            API_ENDPOINTS.config.getConfig,
            {
                query: { ...request },
            },
        )

        return parseWarehouseOperationConfig(response)
    },

    async getShippingProviders(keyword?: string): Promise<IShippingProvider[]> {
        const response = await apiClient.get<IShippingProvidersResponse>(
            API_ENDPOINTS.shippingProviders.list,
            {
                query: {
                    Keyword: keyword,
                },
            },
        )

        if (Array.isArray(response)) {
            return response
        }

        if (Array.isArray(response.Data)) {
            return response.Data
        }

        if (Array.isArray(response.Result)) {
            return response.Result
        }

        return []
    },

    async getContainerByCode(code: string): Promise<IWarehouseContainer> {
        const normalizedCode = code.trim().toUpperCase()

        if (!normalizedCode) {
            throw new Error('Vui lòng quét barcode container')
        }

        const response = await apiClient.get<IWarehouseContainer | IWarehouseContainerResponse>(
            API_ENDPOINTS.containers.getByCode(normalizedCode),
            {
                query: {
                    Code: normalizedCode,
                },
            },
        )

        return normalizeContainerResponse(response)
    },
}
//#endregion services
