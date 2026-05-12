import { API_ENDPOINTS } from '@/constants/api'
import { env } from '@/config/env'
import { apiClient } from '@/services/core/apiClient'
import {
    clearPersistedAuthTokens,
    getRootAuthToken,
    persistAuthTokensFromResponse,
} from '@/services/core/authTokenPersistence'
import type {
    IAuthActivateRequest,
    IAuthActivateResponse,
    IAuthForgotPasswordRequest,
    IAuthForgotPasswordResponse,
    IAuthLoginRequest,
    IAuthLoginResponse,
    IAuthLogoutResponse,
    IAuthRegisterRequest,
    IAuthRegisterResponse,
    IAuthResendOtpRequest,
    IAuthResendOtpResponse,
    IAuthResetPasswordRequest,
    IAuthResetPasswordResponse,
    IAdminUser,
    IAuthMeResponse,
} from '@/models'

//#region backend requests
interface IAuthLoginApiRequest {
    Host: string
    Code: string
    Function: string
    UserName: string
    Password: string
}

interface IAuthRegisterApiRequest {
    Username: string
    DisplayName: string
    Password: string
    ConfirmPassword: string
}

interface IAuthActivateApiRequest {
    Username: string
    Code: string
}

interface IAuthResendOtpApiRequest {
    Username: string
}

interface IAuthForgotPasswordApiRequest {
    UserName: string
    TypeVerification: string
    ContinueUrl: string
}

interface IAuthResetPasswordApiRequest {
    UserName: string
    Password: string
    ConfirmPassword: string
    Code: string
    ContinueUrl: string
}
//#endregion backend requests

//#region constants
const DEFAULT_TYPE_VERIFICATION = 'Email'
//#endregion constants

//#region browser helpers
const getBrowserHost = (): string => {
    if (typeof window === 'undefined') {
        return ''
    }

    return window.location.host
}

const getBrowserOrigin = (): string => {
    if (typeof window === 'undefined') {
        return ''
    }

    return window.location.origin
}

const getDefaultContinueUrl = (path: string): string => {
    const origin = getBrowserOrigin()

    if (!origin) {
        return path
    }

    return `${origin}${path}`
}

const getFirstNonEmptyString = (...values: Array<string | undefined>): string => {
    return values.find((value) => value !== undefined && value.trim().length > 0) ?? ''
}
//#endregion browser helpers

//#region requests
const toLoginApiRequest = (payload: IAuthLoginRequest): IAuthLoginApiRequest => {
    return {
        Host: getFirstNonEmptyString(payload.host, env.authLoginHost, getBrowserHost()),
        Code: getFirstNonEmptyString(payload.code, env.authLoginCode),
        Function: getFirstNonEmptyString(payload.functionPath, env.authLoginFunction),
        UserName: payload.username,
        Password: payload.password,
    }
}

const toRegisterApiRequest = (payload: IAuthRegisterRequest): IAuthRegisterApiRequest => {
    return {
        Username: payload.username,
        DisplayName: payload.fullName,
        Password: payload.password,
        ConfirmPassword: payload.confirmPassword,
    }
}

const toActivateApiRequest = (payload: IAuthActivateRequest): IAuthActivateApiRequest => {
    return {
        Username: payload.username,
        Code: payload.code,
    }
}

const toResendOtpApiRequest = (payload: IAuthResendOtpRequest): IAuthResendOtpApiRequest => {
    return {
        Username: payload.username,
    }
}

const toForgotPasswordApiRequest = (
    payload: IAuthForgotPasswordRequest,
): IAuthForgotPasswordApiRequest => {
    return {
        UserName: payload.username,
        TypeVerification: payload.typeVerification ?? DEFAULT_TYPE_VERIFICATION,
        ContinueUrl: payload.continueUrl ?? getDefaultContinueUrl('/auth/reset-password'),
    }
}

const toResetPasswordApiRequest = (
    payload: IAuthResetPasswordRequest,
): IAuthResetPasswordApiRequest => {
    return {
        UserName: payload.username,
        Password: payload.password,
        ConfirmPassword: payload.confirmPassword,
        Code: payload.code,
        ContinueUrl: payload.continueUrl ?? getDefaultContinueUrl('/auth/login'),
    }
}
//#endregion requests

//#region Response Mappers
type LoginResponseRecord = Record<string, unknown>

const getStringValue = (record: LoginResponseRecord, keys: string[]): string | undefined => {
    for (const key of keys) {
        const value = record[key]

        if (typeof value === 'string' && value.trim().length > 0) {
            return value
        }
    }

    return undefined
}

const getNumberValue = (record: LoginResponseRecord, keys: string[]): number | undefined => {
    for (const key of keys) {
        const value = record[key]

        if (typeof value === 'number' && Number.isFinite(value)) {
            return value
        }

        if (typeof value === 'string' && value.trim().length > 0) {
            const parsedNumber = Number(value)

            if (Number.isFinite(parsedNumber)) {
                return parsedNumber
            }

            const parsedDate = Date.parse(value)

            if (Number.isFinite(parsedDate)) {
                return parsedDate
            }
        }
    }

    return undefined
}

const persistLoginTokens = (response: IAuthLoginResponse): void => {
    const responseRecord = response as unknown as LoginResponseRecord

    const accessToken = getStringValue(responseRecord, [
        'accessToken',
        'AccessToken',
        'token',
        'Token',
        'access_token',
    ])

    const refreshToken = getStringValue(responseRecord, [
        'refreshToken',
        'RefreshToken',
        'refresh_token',
    ])

    const tokenExpires = getNumberValue(responseRecord, [
        'tokenExpires',
        'TokenExpires',
        'expiresAt',
        'ExpiresAt',
        'ExpiredAt',
    ])

    if (!accessToken) {
        return
    }

    apiClient.setTokens({
        accessToken,
        refreshToken: refreshToken ?? '',
        tokenExpires,
    })
}
//#endregion Response Mappers

//#region auth services
export const authService = {
    async login(payload: IAuthLoginRequest): Promise<IAuthLoginResponse> {
        const response = await apiClient.post<IAuthLoginResponse>(API_ENDPOINTS.auth.login, {
            Host: env.authLoginHost,
            Code: env.authLoginCode,
            Function: env.authLoginFunction,
            UserName: payload.username.trim(),
            Password: payload.password,
        })

        persistAuthTokensFromResponse(response, {
            persistRootToken: true,
        })

        return response
    },

    register(payload: IAuthRegisterRequest): Promise<IAuthRegisterResponse> {
        return apiClient.post<IAuthRegisterResponse>(
            API_ENDPOINTS.auth.register,
            toRegisterApiRequest(payload),
            {
                requiresAuth: false,
            },
        )
    },

    activate(payload: IAuthActivateRequest): Promise<IAuthActivateResponse> {
        return apiClient.post<IAuthActivateResponse>(
            API_ENDPOINTS.auth.activate,
            toActivateApiRequest(payload),
            {
                requiresAuth: false,
            },
        )
    },

    resendOtp(payload: IAuthResendOtpRequest): Promise<IAuthResendOtpResponse> {
        return apiClient.post<IAuthResendOtpResponse>(
            API_ENDPOINTS.auth.resendOtp,
            toResendOtpApiRequest(payload),
            {
                requiresAuth: false,
            },
        )
    },

    forgotPassword(payload: IAuthForgotPasswordRequest): Promise<IAuthForgotPasswordResponse> {
        return apiClient.post<IAuthForgotPasswordResponse>(
            API_ENDPOINTS.auth.forgotPassword,
            toForgotPasswordApiRequest(payload),
            {
                requiresAuth: false,
            },
        )
    },

    resetPassword(payload: IAuthResetPasswordRequest): Promise<IAuthResetPasswordResponse> {
        return apiClient.post<IAuthResetPasswordResponse>(
            API_ENDPOINTS.auth.resetPassword,
            toResetPasswordApiRequest(payload),
            {
                requiresAuth: false,
            },
        )
    },

    async getMe(): Promise<IAdminUser> {
        await apiClient.get<IAuthMeResponse>(API_ENDPOINTS.auth.me, {
            retryOnUnauthorized: false,
        })

        return await authService.getMe()
    },

    async logout(): Promise<IAuthLogoutResponse> {
        const rootToken = getRootAuthToken()

        try {
            if (rootToken) {
                await apiClient.post<IAuthLogoutResponse>(API_ENDPOINTS.auth.logout, undefined, {
                    authToken: rootToken,
                    retryOnUnauthorized: false,
                })
            }
        } finally {
            clearPersistedAuthTokens()
        }

        return {
            success: true,
        }
    },

    getStoredTokens() {
        return apiClient.tokens
    },

    clearStoredTokens(): void {
        apiClient.clearTokens()
    },
}
//#endregion auth services
