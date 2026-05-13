import type { ScanInputType } from '@/models/common/CommonInterface'

export interface UpdateHandoverRequest {
    ShippingUnitId: string
    DeliveryCodes?: string[]
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
}

export interface RemoveHandoverRequest {
    ShippingUnitId: string
    DeliveryCodes?: string[]
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type: ScanInputType
}

export interface GetHandoverListRequest {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    ShippingUnitId?: string
}

export interface GetHandoverStatsRequest {
    Date?: string
}
