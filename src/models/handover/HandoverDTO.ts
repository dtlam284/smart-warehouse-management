import type { ScanInputType } from '@/models/common/CommonInterface'

export interface IUpdateHandoverRequest {
    ShippingUnitId: string
    DeliveryCodes?: string[]
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
}

export interface IRemoveHandoverRequest {
    ShippingUnitId: string
    DeliveryCodes?: string[]
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
}

export interface IGetHandoverListRequest {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    ShippingUnitId?: string
}

export interface IGetHandoverStatsRequest {
    Date?: string
}
