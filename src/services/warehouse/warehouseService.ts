import { API_ENDPOINTS } from '@/constants/api'
import { apiClient, configApiClient } from '@/services/core'
import type {
    GetConfigRequest,
    GetConfigResponse,
    ShippingProvider,
    ShippingProvidersResponse,
    WarehouseOperationConfig,
} from '@/models/warehouse/WarehouseInterface'

const WAREHOUSE_CONFIG_KEY = 'WAREHOUSE'
const LAYOUT_CONFIG_KEY = 'LAYOUT'

function parseWarehouseOperationConfig(configs: GetConfigResponse): WarehouseOperationConfig {
    const warehouseConfig = configs.find((item) => item.Key === WAREHOUSE_CONFIG_KEY)

    const layoutConfig = warehouseConfig?.Child?.find((item) => item.Key === LAYOUT_CONFIG_KEY)

    return {
        HasLayout: layoutConfig?.Values === '1',
    }
}

export const warehouseService = {
    async getConfig(request: GetConfigRequest = { Key: WAREHOUSE_CONFIG_KEY }): Promise<WarehouseOperationConfig> {
        const response = await configApiClient.get<GetConfigResponse>(API_ENDPOINTS.config.getConfig, {
            query: request,
        })

        return parseWarehouseOperationConfig(response)
    },

    async getShippingProviders(keyword?: string): Promise<ShippingProvider[]> {
        const response = await apiClient.get<ShippingProvidersResponse>(API_ENDPOINTS.shippingProviders.list, {
            query: {
                keyword,
            },
        })

        return response.Result
    },
}
