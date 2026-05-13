import type { ScanInputType } from '../common/CommonInterface'

export interface GetPackageDetailsRequest {
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
    SkippingUnitId?: string
}

export interface UpdatePackingRequest {
    DeliveryCodes?: string[]
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
}

export interface RemovePackingRequest {
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
    ShippingUnitId: string
}

export interface GetPackingListRequest {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    ShippingUnitId?: string
}

export interface GetPackingStatsRequest {
    Date?: string
}
