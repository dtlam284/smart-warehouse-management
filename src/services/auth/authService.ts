import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import {
    clearPersistedAuthTokens,
    getActiveAuthToken,
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
    IAuthMeResponse,
    IAuthRegisterRequest,
    IAuthRegisterResponse,
    IAuthResendOtpRequest,
    IAuthResendOtpResponse,
    IAuthResetPasswordRequest,
    IAuthResetPasswordResponse,
} from '@/models'

//#region backend request models
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
//#endregion backend request models

//#region constants
const DEFAULT_AUTH_LOGIN_FUNCTION = ''
const DEFAULT_AUTH_LOGIN_DOMAIN = 'sagacom.io'
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

const getEnvString = (value: string | undefined): string => {
    return value?.trim() ?? ''
}

const normalizeOrganizationCode = (value: string): string => {
    return value.trim().toUpperCase()
}

const buildTenantHostFromCode = (organizationCode: string): string => {
    const normalizedCode = organizationCode.trim().toLowerCase()

    if (!normalizedCode) {
        return ''
    }

    return `${normalizedCode}.${DEFAULT_AUTH_LOGIN_DOMAIN}`
}
//#endregion browser helpers

//#region env helpers
const getAuthLoginHost = (): string => {
    return getEnvString(import.meta.env.VITE_AUTH_LOGIN_HOST)
}

const getAuthLoginCode = (): string => {
    return getEnvString(import.meta.env.VITE_AUTH_LOGIN_CODE)
}

const getAuthLoginFunction = (): string => {
    return getEnvString(import.meta.env.VITE_AUTH_LOGIN_FUNCTION)
}
//#endregion env helpers

//#region request mappers
const toLoginApiRequest = (payload: IAuthLoginRequest): IAuthLoginApiRequest => {
    const payloadCode = getEnvString(payload.code)
    const envCode = getAuthLoginCode()
    const loginCode = normalizeOrganizationCode(getFirstNonEmptyString(payloadCode, envCode))

    const payloadHost = getEnvString(payload.host)
    const hostFromPayloadCode = payloadCode ? buildTenantHostFromCode(payloadCode) : ''
    const hostFromEnvCode = envCode ? buildTenantHostFromCode(envCode) : ''
    const loginHost = getFirstNonEmptyString(
        payloadHost,
        hostFromPayloadCode,
        getAuthLoginHost(),
        hostFromEnvCode,
        getBrowserHost(),
    ).toLowerCase()

    return {
        Host: loginHost,
        Code: loginCode,
        Function: getFirstNonEmptyString(
            payload.functionPath,
            getAuthLoginFunction(),
            DEFAULT_AUTH_LOGIN_FUNCTION,
        ),
        UserName: payload.username.trim(),
        Password: payload.password,
    }
}

const toRegisterApiRequest = (payload: IAuthRegisterRequest): IAuthRegisterApiRequest => {
    return {
        Username: payload.username.trim(),
        DisplayName: payload.fullName.trim(),
        Password: payload.password,
        ConfirmPassword: payload.confirmPassword,
    }
}

const toActivateApiRequest = (payload: IAuthActivateRequest): IAuthActivateApiRequest => {
    return {
        Username: payload.username.trim(),
        Code: payload.code.trim(),
    }
}

const toResendOtpApiRequest = (payload: IAuthResendOtpRequest): IAuthResendOtpApiRequest => {
    return {
        Username: payload.username.trim(),
    }
}

const toForgotPasswordApiRequest = (
    payload: IAuthForgotPasswordRequest,
): IAuthForgotPasswordApiRequest => {
    return {
        UserName: payload.username.trim(),
        TypeVerification: payload.typeVerification ?? DEFAULT_TYPE_VERIFICATION,
        ContinueUrl: payload.continueUrl ?? getDefaultContinueUrl('/auth/reset-password'),
    }
}

const toResetPasswordApiRequest = (
    payload: IAuthResetPasswordRequest,
): IAuthResetPasswordApiRequest => {
    return {
        UserName: payload.username.trim(),
        Password: payload.password,
        ConfirmPassword: payload.confirmPassword,
        Code: payload.code.trim(),
        ContinueUrl: payload.continueUrl ?? getDefaultContinueUrl('/auth/login'),
    }
}
//#endregion request mappers

//#region auth service
export const authService = {
    //#region login
    async login(payload: IAuthLoginRequest): Promise<IAuthLoginResponse> {
        const response = await apiClient.post<IAuthLoginResponse>(
            API_ENDPOINTS.auth.login,
            toLoginApiRequest(payload),
            {
                requiresAuth: false,
                retryOnUnauthorized: false,
            },
        )

        persistAuthTokensFromResponse(response, {
            persistRootToken: true,
        })

        return response
    },
    //#endregion login

    //#region registration
    register(payload: IAuthRegisterRequest): Promise<IAuthRegisterResponse> {
        return apiClient.post<IAuthRegisterResponse>(
            API_ENDPOINTS.auth.register,
            toRegisterApiRequest(payload),
            {
                requiresAuth: false,
                retryOnUnauthorized: false,
            },
        )
    },
    //#endregion registration

    //#region account activation
    activate(payload: IAuthActivateRequest): Promise<IAuthActivateResponse> {
        return apiClient.post<IAuthActivateResponse>(
            API_ENDPOINTS.auth.activate,
            toActivateApiRequest(payload),
            {
                requiresAuth: false,
                retryOnUnauthorized: false,
            },
        )
    },

    resendOtp(payload: IAuthResendOtpRequest): Promise<IAuthResendOtpResponse> {
        return apiClient.post<IAuthResendOtpResponse>(
            API_ENDPOINTS.auth.resendOtp,
            toResendOtpApiRequest(payload),
            {
                requiresAuth: false,
                retryOnUnauthorized: false,
            },
        )
    },
    //#endregion account activation

    //#region password recovery
    forgotPassword(payload: IAuthForgotPasswordRequest): Promise<IAuthForgotPasswordResponse> {
        return apiClient.post<IAuthForgotPasswordResponse>(
            API_ENDPOINTS.auth.forgotPassword,
            toForgotPasswordApiRequest(payload),
            {
                requiresAuth: false,
                retryOnUnauthorized: false,
            },
        )
    },

    resetPassword(payload: IAuthResetPasswordRequest): Promise<IAuthResetPasswordResponse> {
        return apiClient.post<IAuthResetPasswordResponse>(
            API_ENDPOINTS.auth.resetPassword,
            toResetPasswordApiRequest(payload),
            {
                requiresAuth: false,
                retryOnUnauthorized: false,
            },
        )
    },
    //#endregion password recovery

    //#region session
    async logout(): Promise<IAuthLogoutResponse> {
        const activeToken = getActiveAuthToken()

        try {
            if (activeToken) {
                await apiClient.post<IAuthLogoutResponse>(
                    API_ENDPOINTS.auth.logout,
                    undefined,
                    {
                        headers: {
                            Authorization: `Bearer ${activeToken}`,
                        },
                        requiresAuth: false,
                        retryOnUnauthorized: false,
                    },
                )
            }
        } finally {
            clearPersistedAuthTokens()
        }

        return {
            success: true,
        }
    },

    getMe(): Promise<IAuthMeResponse> {
        return apiClient.get<IAuthMeResponse>(API_ENDPOINTS.auth.me, {
            retryOnUnauthorized: false,
        })
    },
    //#endregion session
}
//#endregion auth service
