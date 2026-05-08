export type ISODateString = string
export type ID = string

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
