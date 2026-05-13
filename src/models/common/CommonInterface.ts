export type ISODateString = string
export type ID = string

export type ScanInputType = 'DELIVERYCODE' | 'PACKAGECODE' | 'ORDERCODEREF' | 'ORDERCODE'

export type WorkMode = 'PACKING' | 'HANDOVER' | 'RETURN_DELIVERY' | 'NONE'

export interface IDataResponse<TData> {
    Code: number
    Message: string
    Data:TData
}

export interface IPaginatedResponse<TData> {
    Data: TData[]
    TotalRows: number
    PageIndex: number
    PageSize: number
}

export interface IScanCodePayload {
    DeliveryCode?: string
    OrderCode?: string
    OrderCodeRef?: string
    PackageCode?: string
    Type:ScanInputType
}

export function buildScanPayload(code: string, type: ScanInputType): IScanCodePayload {
    switch (type) {
        case 'DELIVERYCODE':
            return {
                DeliveryCode: code,
                Type: type,
            }

        case 'PACKAGECODE':
            return {
                PackageCode: code,
                Type: type,
            }

        case 'ORDERCODEREF':
            return {
                OrderCodeRef: code,
                Type: type,
            }

        case 'ORDERCODE':
            return {
                OrderCode: code,
                Type: type,
            }
    }
}

export interface IRoleRef {
    id: number
    name: string
}

export interface IStatusRef {
    id: number
    name: string
}

export interface IPaginationQuery {
    page?: number
    limit?: number
}

export interface IDateRangeQuery {
    from?: string
    to?: string
    startDate?: string
    endDate?: string
}

export interface IPaginatedQuery extends IPaginationQuery {
    search?: string
}
