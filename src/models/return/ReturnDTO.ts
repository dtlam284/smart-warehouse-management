import type { ScanInputType } from '@/models/common/CommonInterface'
import type { IWarehouseContainer } from '@/models/warehouse/WarehouseInterface'
import type { IReturnItemPayload, ReturnType } from './ReturnInterface'

export interface IGetReturnDetailRequest {
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
    ShippingUnitId?: string
}

export interface IConfirmReturnRequest {
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
    ShippingUnitId: string
    ReturnType: ReturnType
    ListItems: IReturnItemPayload[]
    WarehouseItemId?: string
    WareHouseItemId?: string
    ContainerId?: number
    Container?: IWarehouseContainer
    ContainerCode?: string
}

export interface IRemoveReturnRequest {
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
    ShippingUnitId: string
}

export interface IGetReturnListRequest {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    ShippingUnitId?: string
}

export interface IGetReturnStatsRequest {
    Date?: string
}
