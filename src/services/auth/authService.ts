import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
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

const DEFAULT_TYPE_VERIFICATION = 'Email'

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

const toLoginApiRequest = (payload: IAuthLoginRequest): IAuthLoginApiRequest => {
    return {
        Host: payload.host ?? getBrowserHost(),
        Code: payload.code ?? '',
        Function: payload.functionPath ?? '',
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

const toResendOtpApiRequest = (
    payload: IAuthResendOtpRequest,
): IAuthResendOtpApiRequest => {
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

export const authService = {
    login(payload: IAuthLoginRequest): Promise<IAuthLoginResponse> {
        return apiClient.post<IAuthLoginResponse>(
            API_ENDPOINTS.auth.login,
            toLoginApiRequest(payload),
            {
                requiresAuth: false,
            },
        )
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

    forgotPassword(
        payload: IAuthForgotPasswordRequest,
    ): Promise<IAuthForgotPasswordResponse> {
        return apiClient.post<IAuthForgotPasswordResponse>(
            API_ENDPOINTS.auth.forgotPassword,
            toForgotPasswordApiRequest(payload),
            {
                requiresAuth: false,
            },
        )
    },

    resetPassword(
        payload: IAuthResetPasswordRequest,
    ): Promise<IAuthResetPasswordResponse> {
        return apiClient.post<IAuthResetPasswordResponse>(
            API_ENDPOINTS.auth.resetPassword,
            toResetPasswordApiRequest(payload),
            {
                requiresAuth: false,
            },
        )
    },

    logout(): Promise<IAuthLogoutResponse> {
        return apiClient.post<IAuthLogoutResponse>(API_ENDPOINTS.auth.logout)
    },

    getMe(): Promise<IAuthMeResponse> {
        return apiClient.get<IAuthMeResponse>(API_ENDPOINTS.auth.me)
    },
}
