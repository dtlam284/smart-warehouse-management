import type { ISODateString } from '../common/CommonInterface'

export interface IPackingProduct {
    GroupServiceName: string | null
    ListingPropertyCode: string
    Quantity: number
}

export interface IPackingDetail {
    Name: string
    Code: string
    PackageDetails: IPackingProduct[]
}

export interface IPackingRecord {
    Id: string
    OrderCode: string
    DeliveryCode: string
    PackageCode?: string
    PackerByName: string
    PackingDate: ISODateString
    ShippingUnitName: string
    TotalRows: number
}

export interface IPackingFilters {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    PackageCode?: string
    OrderCodeRef?: string
    ShippingUnitId?: string
}

export interface IPackingStats {
    FromDate: string
    ToDate: string
    TotalPacking: number
    TotalSalesOrder: number
}

export interface IPackingListResult {
    Data: IPackingRecord[]
    TotalRows: number
    PageIndex: number
    PageSize: number
}
