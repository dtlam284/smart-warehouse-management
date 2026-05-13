import type { ISODateString } from '@/models/common/CommonInterface'

export type ReturnType = 'FULL_RETURN' | 'PARTIAL_RETURN' | 'DEFECTIVE_RETURN'

export interface IReturnProduct {
    GroupServiceId: string
    GroupServiceCode: string
    GroupServiceName: string
    Quantity: number
    DamagedQuantity: number
    TotalQuantity: number
}

export interface IReturnDetail {
    OrderCode: string
    DeliveryCode: string
    OrderDate: ISODateString
    DistributorName: string
    ShippingUnitId: string
    ShippingUnitName: string
    CustomerId?: string
    CustomerName?: string
    ReturnType: ReturnType
    ListItem: IReturnProduct[]
}

export interface IReturnRecord {
    Id?: string
    OrderCode: string
    DeliveryCode: string
    PackageCode?: string
    OrderDate: ISODateString
    ReturnByName: string
    ReturnDate: ISODateString
    ShippingUnitId: string
    ShippingUnitName: string
    CustomerName: string
    DistributorName: string
    ReturnType: ReturnType
    ListItem: IReturnProduct[]
    TotalRows?: number
}

export interface IReturnFilters {
    PageIndex: number
    PageSize: number
    Date?: string
    DeliveryCode?: string
    OrderCode?: string
    PackageCode?: string
    OrderCodeRef?: string
    ShippingUnitId?: string
}

export interface IReturnItemPayload {
    GroupServiceId: string
    Quantity: number
    DamagedQuantity: number
}

export interface IReturnProviderStats {
    Name: string
    ShippingUnitId: string
    TotalReturn: number
}

export interface IReturnStats {
    FromDate: string
    ToDate: string
    Statistics: IReturnProviderStats[]
}

export interface IReturnListResult {
    Data: IReturnRecord[]
    TotalRows: number
    PageIndex: number
    PageSize: number
}
