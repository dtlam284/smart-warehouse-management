//#region types
export type ApiRecord = Record<string, unknown>

export type PrimitiveQueryValue = string | number | boolean | null | undefined | Date

export type QueryValue =
  | PrimitiveQueryValue
  | PrimitiveQueryValue[]
  | IQueryObjectValue
  | IQueryObjectValue[]

export type QueryParams = Record<string, QueryValue>

export type EntityId = string | number
//#endregion types

//#region interfaces
export interface IQueryObjectValue {
  [key: string]: QueryValue
}

export interface IDataResponse<TData> {
  data: TData
}

export interface IPaginatedResponse<TData> {
  data: TData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ISuccessResponse {
  success: boolean
  [key: string]: unknown
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
  tokenExpires?: number
}

export interface ITokenStorage {
  getTokens(): IAuthTokens | null
  setTokens(tokens: IAuthTokens): void
  clearTokens(): void
}

export interface ILoginResponse {
  token: string
  refreshToken: string
  tokenExpires?: number
  [key: string]: unknown
}
//#endregion interfaces
