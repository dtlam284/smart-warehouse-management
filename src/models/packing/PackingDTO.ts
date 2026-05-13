import type { ScanInputType } from '../common/CommonInterface'

export interface IGetPackageDetailsRequest {
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
    SkippingUnitId?: string
}

export interface IUpdatePackingRequest {
    DeliveryCodes?: string[]
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
}

export interface IRemovePackingRequest {
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
    ShippingUnitId: string
}

export interface IGetPackingListRequest {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    ShippingUnitId?: string
}

export interface IGetPackingStatsRequest {
    Date?: string
}
