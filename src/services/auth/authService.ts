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

//#region auth service
export const authService = {
  //#region login
  login(payload: IAuthLoginRequest): Promise<IAuthLoginResponse> {
    return apiClient.post<IAuthLoginResponse>(API_ENDPOINTS.auth.login, payload, {
      requiresAuth: false,
    })
  },
  //#endregion login

  //#region registration
  register(payload: IAuthRegisterRequest): Promise<IAuthRegisterResponse> {
    return apiClient.post<IAuthRegisterResponse>(API_ENDPOINTS.auth.register, payload, {
      requiresAuth: false,
    })
  },
  //#endregion registration

  //#region account activation
  activate(payload: IAuthActivateRequest): Promise<IAuthActivateResponse> {
    return apiClient.post<IAuthActivateResponse>(API_ENDPOINTS.auth.activate, payload, {
      requiresAuth: false,
    })
  },

  resendOtp(payload: IAuthResendOtpRequest): Promise<IAuthResendOtpResponse> {
    return apiClient.post<IAuthResendOtpResponse>(API_ENDPOINTS.auth.resendOtp, payload, {
      requiresAuth: false,
    })
  },
  //#endregion account activation

  //#region password recovery
  forgotPassword(payload: IAuthForgotPasswordRequest): Promise<IAuthForgotPasswordResponse> {
    return apiClient.post<IAuthForgotPasswordResponse>(API_ENDPOINTS.auth.forgotPassword, payload, {
      requiresAuth: false,
    })
  },

  resetPassword(payload: IAuthResetPasswordRequest): Promise<IAuthResetPasswordResponse> {
    return apiClient.post<IAuthResetPasswordResponse>(API_ENDPOINTS.auth.resetPassword, payload, {
      requiresAuth: false,
    })
  },
  //#endregion password recovery

  //#region session
  logout(): Promise<IAuthLogoutResponse> {
    return apiClient.post<IAuthLogoutResponse>(API_ENDPOINTS.auth.logout)
  },

  getMe(): Promise<IAuthMeResponse> {
    return apiClient.get<IAuthMeResponse>(API_ENDPOINTS.auth.me)
  },
  //#endregion session
}
//#endregion auth service
