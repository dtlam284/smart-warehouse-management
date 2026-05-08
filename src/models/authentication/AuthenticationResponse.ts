import type { IAdminUser } from '@/models/account'

export interface IAuthLoginResponse {
  token: string
  refreshToken: string
  tokenExpires: number
  user: IAdminUser
  message?: string
}

export interface IAuthRegisterResponse {
  message: string
}

export interface IAuthActivateResponse {
  user?: IAdminUser
  message: string
}

export interface IAuthResendOtpResponse {
  message: string
}

export interface IAuthForgotPasswordResponse {
  message: string
}

export interface IAuthResetPasswordResponse {
  message: string
}

export interface IAuthMeResponse {
  user: IAdminUser
}

export interface IAuthRefreshResponse {
  token: string
  refreshToken: string
  tokenExpires: number
}

export interface IAuthLogoutResponse {
  success: true
}

export type IAuthLogoutAllResponse = void

export type AuthLoginResponse = IAuthLoginResponse
export type AuthRegisterResponse = IAuthRegisterResponse
export type AuthActivateResponse = IAuthActivateResponse
export type AuthResendOtpResponse = IAuthResendOtpResponse
export type AuthForgotPasswordResponse = IAuthForgotPasswordResponse
export type AuthResetPasswordResponse = IAuthResetPasswordResponse
export type AuthMeResponse = IAuthMeResponse
export type AuthRefreshResponse = IAuthRefreshResponse
export type AuthLogoutResponse = IAuthLogoutResponse
export type AuthLogoutAllResponse = IAuthLogoutAllResponse
