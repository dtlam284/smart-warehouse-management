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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function isWarehouseContainer(value: unknown): value is IWarehouseContainer {
    if (!isRecord(value)) {
        return false
    }

    return typeof value.Id === 'number' && typeof value.Code === 'string'
}

function getStringField(source: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
        const value = source[key]

        if (typeof value === 'string' && value.trim().length > 0) {
            return value
        }
    }

    return null
}

function normalizeWarehouseContainer(container: IWarehouseContainer): IWarehouseContainer {
    const record = container as unknown as Record<string, unknown>

    const warehouseItemId = getStringField(record, [
        'WarehouseItemId',
        'WareHouseItemId',
        'warehouseItemId',
        'wareHouseItemId',
        'WarehouseItemID',
        'WareHouseItemID',
        'warehouseItemID',
        'wareHouseItemID',
        'warehouse_item_id',
    ])

    const warehouseItemLayoutId = getStringField(record, [
        'WarehouseItemLayoutId',
        'WareHouseItemLayoutId',
        'warehouseItemLayoutId',
        'wareHouseItemLayoutId',
    ])

    const warehouseItemLayoutCode = getStringField(record, [
        'WarehouseItemLayoutCode',
        'WareHouseItemLayoutCode',
        'warehouseItemLayoutCode',
        'wareHouseItemLayoutCode',
    ])

    const warehouseItemLayoutPath = getStringField(record, [
        'WarehouseItemLayoutPath',
        'WareHouseItemLayoutPath',
        'warehouseItemLayoutPath',
        'wareHouseItemLayoutPath',
    ])

    return {
        ...container,
        WarehouseItemId: warehouseItemId ?? container.WarehouseItemId ?? container.WareHouseItemId ?? null,
        WareHouseItemId: warehouseItemId ?? container.WareHouseItemId ?? container.WarehouseItemId ?? null,
        WarehouseItemLayoutId:
            warehouseItemLayoutId ??
            container.WarehouseItemLayoutId ??
            container.WareHouseItemLayoutId ??
            null,
        WareHouseItemLayoutId:
            warehouseItemLayoutId ??
            container.WareHouseItemLayoutId ??
            container.WarehouseItemLayoutId ??
            null,
        WarehouseItemLayoutCode:
            warehouseItemLayoutCode ??
            container.WarehouseItemLayoutCode ??
            container.WareHouseItemLayoutCode ??
            null,
        WareHouseItemLayoutCode:
            warehouseItemLayoutCode ??
            container.WareHouseItemLayoutCode ??
            container.WarehouseItemLayoutCode ??
            null,
        WarehouseItemLayoutPath:
            warehouseItemLayoutPath ??
            container.WarehouseItemLayoutPath ??
            container.WareHouseItemLayoutPath ??
            null,
        WareHouseItemLayoutPath:
            warehouseItemLayoutPath ??
            container.WareHouseItemLayoutPath ??
            container.WarehouseItemLayoutPath ??
            null,
    }
}

function unwrapContainerResponse(response: unknown): unknown {
    if (!isRecord(response)) {
        return response
    }

    if ('Data' in response) {
        return response.Data
    }

    if ('data' in response) {
        return response.data
    }

    if ('Result' in response) {
        return response.Result
    }

    if ('result' in response) {
        return response.result
    }

    return response
}

function getResponseMessage(response: unknown): string | null {
    if (!isRecord(response)) {
        return null
    }

    const message = response.Message ?? response.message ?? response.Detail ?? response.detail

    return typeof message === 'string' && message.trim().length > 0 ? message : null
}

function normalizeContainerResponse(
    response: IWarehouseContainer | IWarehouseContainerResponse | unknown,
): IWarehouseContainer {
    const unwrapped = unwrapContainerResponse(response)

    if (!unwrapped) {
        throw new Error(getResponseMessage(response) ?? 'Không tìm thấy thông tin thùng chứa')
    }

    if (isWarehouseContainer(unwrapped)) {
        return normalizeWarehouseContainer(unwrapped)
    }

    throw new Error(getResponseMessage(response) ?? 'Không tìm thấy thông tin thùng chứa')
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
        const response = await apiClient.get<IShippingProvidersResponse | IShippingProvider[]>(
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
