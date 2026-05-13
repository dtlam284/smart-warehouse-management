import type { ISODateString } from '../common/CommonInterface'

export interface PackingProduct {
    GroupServiceName: string | null
    ListingPropertyCode: string
    Quantity: number
}

export interface PackingDetail {
    Name: string
    Code: string
    PackageDetails: PackingProduct[]
}

export interface PackingRecord {
    Id: string
    OrderCode: string
    DeliveryCode: string
    PackageCode?: string
    PackerByName: string
    PackingDate: ISODateString
    ShippingUnitName: string
    TotalRows: number
}

export interface PackingFilters {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    PackageCode?: string
    OrderCodeRef?: string
}

export interface PackingStats {
    FromDate: string
    ToDate: string
    TotalPacking: number
    TotalSalesOrder: number
}

export interface PackingListResult {
    Data: PackingRecord[]
    TotalRows: number
    PageIndex: number
    PageSize: number
}
