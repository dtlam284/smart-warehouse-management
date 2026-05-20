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
    IndexDisplay?: number
    Priority?: number
}

export interface IShippingProvidersResponse {
    Code?: number
    Message?: string
    Data?: IShippingProvider[]
    Result?: IShippingProvider[]
}

export interface IWarehouseContainer {
    Id: number
    WarehouseItemId?: string | null
    WareHouseItemId?: string | null
    CustomerId?: string | null
    CustomerName?: string | null
    Type: string
    Code: string
    QRCode?: string | null
    WarehouseItemLayoutId?: string | null
    WarehouseItemLayoutCode?: string | null
    WarehouseItemLayoutPath?: string | null
    WareHouseItemLayoutId?: string | null
    WareHouseItemLayoutCode?: string | null
    WareHouseItemLayoutPath?: string | null
    Status?: string | null
    Usage?: string | null
    Putaway?: boolean
    Description?: string | null
    HasProduct?: boolean
    FreezeStatus?: boolean
    ContainerDetail?: unknown[]
}

export interface IWarehouseContainerResponse {
    Code?: number
    Message?: string
    Detail?: string | null
    Data?: IWarehouseContainer | null
    Result?: IWarehouseContainer | null
    data?: IWarehouseContainer | null
    result?: IWarehouseContainer | null
}
