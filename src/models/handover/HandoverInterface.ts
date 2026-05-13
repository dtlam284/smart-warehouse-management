import type { ISODateString } from '@/models/common/CommonInterface'

export interface HandoverRecord {
    Id?: string
    OrderCode: string
    DeliveryCode: string
    PackageCode?: string
    HandoverByName: string
    HandoverDate: ISODateString
    DeliveryStatus: number
    ShippingUnitId: string
    ShippingUnitName: string
    CustomerName: string | null
    TotalRows: number
}

export interface ProviderProgress {
    Name: string
    ShippingUnitId: string
    TotalHandover: number
    TotalSalesOrder: number
}

export interface HandoverFilters {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    PackageCode?: string
    OrderCodeRef?: string
    ShippingUnitId?: string
}

export interface HandoverStats {
    FromDate: string
    ToDate: string
    Statistics: ProviderProgress[]
}

export interface HandoverListResult {
    Data: HandoverRecord[]
    TotalRows: number
    PageIndex: number
    PageSize: number
}
