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

export interface IWarehouseOperationConfig {
    HasLayout: boolean
}

export interface IShippingProvider {
    Id: string
    Name: string
    Code?: string
    LadingCode?: string
}

export interface IShippingProvidersResponse {
    Code?: number
    Message?: string
    Data?: IShippingProvider[]
    Result: IShippingProvider[]
}
