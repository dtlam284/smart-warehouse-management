export interface IAuthLoginRequest {
    username: string
    password: string
    host?: string
    code?: string
    functionPath?: string
}

export interface IAuthRegisterRequest {
    username: string
    fullName: string
    password: string
    confirmPassword: string
}

export interface IAuthActivateRequest {
    username: string
    code: string
}

export interface IAuthResendOtpRequest {
    username: string
}

export interface IAuthForgotPasswordRequest {
    username: string
    typeVerification?: string
    continueUrl?: string
}

export interface IAuthResetPasswordRequest {
    username: string
    code: string
    password: string
    confirmPassword: string
    continueUrl?: string
}

export interface IAuthRefreshRequest {
    refreshToken: string
}

export interface IAuthLogoutRequest {
    refreshToken?: string
}

export interface IUpdateMyProfileRequest {
    firstName?: string
    lastName?: string
    photo?: string
}

export type AuthLoginRequest = IAuthLoginRequest
export type AuthRegisterRequest = IAuthRegisterRequest
export type AuthActivateRequest = IAuthActivateRequest
export type AuthResendOtpRequest = IAuthResendOtpRequest
export type AuthForgotPasswordRequest = IAuthForgotPasswordRequest
export type AuthResetPasswordRequest = IAuthResetPasswordRequest
export type AuthRefreshRequest = IAuthRefreshRequest
export type AuthLogoutRequest = IAuthLogoutRequest
export type UpdateMyProfileRequest = IUpdateMyProfileRequest
