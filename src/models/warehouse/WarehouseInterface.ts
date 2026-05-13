export type ConfigModel = {
    Key: string
    Description: string
    Values: string
    Child?: ConfigModel[]
}

export type GetConfigResponse = ConfigModel[]

export type GetConfigRequest = {
    Key?: string
}

export interface WarehouseOperationConfig {
    HasLayout: boolean
}

export interface ShippingProvider {
    Id: string
    Name: string
}

export interface ShippingProvidersResponse {
    Result: ShippingProvider[]
}
