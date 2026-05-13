import type { ISODateString } from '@/models/common/CommonInterface'

export interface IHandoverRecord {
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

export interface IProviderProgress {
    Name: string
    ShippingUnitId: string
    TotalHandover: number
    TotalSalesOrder: number
}

export interface IHandoverFilters {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    PackageCode?: string
    OrderCodeRef?: string
    ShippingUnitId?: string
}

export interface IHandoverStats {
    FromDate: string
    ToDate: string
    Statistics: IProviderProgress[]
}

export interface IHandoverListResult {
    Data: IHandoverRecord[]
    TotalRows: number
    PageIndex: number
    PageSize: number
}
