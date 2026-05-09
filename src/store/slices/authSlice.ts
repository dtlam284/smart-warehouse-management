import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { authService } from '@/services/auth/authService'
import { tenantService } from '@/services/tenant/tenantService'
import { apiClient } from '@/services/core/apiClient'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import { FunctionalPathEnum } from '@/models/tenant/TenantInterface'
import { IAdminUser } from '@/models/account/AccountInterface'
import type { RootState } from '@/store/store'
import type {
  AuthRole,
  IAgentItem,
  IAgentListRequest,
  IAgentListResponse,
  IAuthActivateRequest,
  IAuthActivateResponse,
  IAuthForgotPasswordRequest,
  IAuthForgotPasswordResponse,
  IAuthLoginRequest,
  IAuthLoginResponse,
  IAuthRegisterRequest,
  IAuthRegisterResponse,
  IAuthResendOtpRequest,
  IAuthResendOtpResponse,
  IAuthResetPasswordRequest,
  IAuthResetPasswordResponse,
  ISelectAgentRequest,
  ISelectAgentResponse,
  ISelectRoleRequest,
  ISelectRoleResponse,
  ISelectTenantRequest,
  ISelectTenantResponse,
  ITenantItem,
  ITenantListResponse,
} from '@/models'

//#region types
export type AuthStatus =
  | 'idle'
  | 'pending'
  | 'needs_tenant'
  | 'needs_role'
  | 'needs_agent'
  | 'authenticated'

export interface IAuthState {
  user: IAdminUser | null
  tenants: ITenantItem[]
  selectedTenant: ITenantItem | null
  agents: IAgentItem[]
  selectedAgent: IAgentItem | null
  role: AuthRole | null
  status: AuthStatus
  pendingActivationUsername: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  errorCode: string | null
}

export type AuthState = IAuthState
//#endregion types

//#region state
const initialState: IAuthState = {
  user: null,
  tenants: [],
  selectedTenant: null,
  agents: [],
  selectedAgent: null,
  role: null,
  status: 'idle',
  pendingActivationUsername: null,
  isAuthenticated: false,
  isLoading: false,
  isSubmitting: false,
  error: null,
  errorCode: null,
}
//#endregion state

//#region constants
export const ACCOUNT_NOT_ACTIVATED_CODE = 'ACCOUNT_NOT_ACTIVATED'
export const AGENT_REQUIRED_FUNCTIONS = new Set<AuthRole>([FunctionalPathEnum.DISTRIBUTOR])
//#endregion constants

//#region helpers
const toErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  if (error && typeof error === 'object') {
    const errorBag = error as Record<string, unknown>

    if (typeof errorBag.message === 'string' && errorBag.message.trim().length > 0) {
      return errorBag.message
    }

    if (typeof errorBag.Message === 'string' && errorBag.Message.trim().length > 0) {
      return errorBag.Message
    }

    if (typeof errorBag.error === 'string' && errorBag.error.trim().length > 0) {
      return errorBag.error
    }
  }

  return fallback
}

const isActivationRequiredError = (message: string): boolean => {
  const normalizedMessage = message.toLowerCase()

  return (
    normalizedMessage.includes('not activated') ||
    normalizedMessage.includes('not confirmed') ||
    normalizedMessage.includes('not been confirmed') ||
    normalizedMessage.includes('has not been confirmed') ||
    normalizedMessage.includes('not verified') ||
    normalizedMessage.includes('account is inactive') ||
    normalizedMessage.includes('chưa kích hoạt') ||
    normalizedMessage.includes('chua kich hoat') ||
    normalizedMessage.includes('chưa xác thực') ||
    normalizedMessage.includes('chua xac thuc')
  )
}

const requiresAgentSelection = (role: AuthRole): boolean => {
  return AGENT_REQUIRED_FUNCTIONS.has(role)
}

const setSubmitPending = (state: IAuthState): void => {
  state.status = 'pending'
  state.isSubmitting = true
  state.isLoading = true
  state.error = null
  state.errorCode = null
}

const setActionPending = (state: IAuthState): void => {
  state.isLoading = true
  state.error = null
  state.errorCode = null
}

const setRejected = (state: IAuthState, message: string): void => {
  state.isLoading = false
  state.isSubmitting = false
  state.error = message
  state.errorCode = null
}

const setSettled = (state: IAuthState): void => {
  state.isLoading = false
  state.isSubmitting = false
  state.error = null
  state.errorCode = null
}

const clearStoredAuthTokens = (): void => {
  apiClient.clearTokens()
}
//#endregion helpers

//#region thunks
export const loginThunk = createAppAsyncThunk<IAuthLoginResponse, IAuthLoginRequest>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.login(payload)
    } catch (error) {
      return rejectWithValue(toErrorMessage(error, 'Unable to login'))
    }
  },
)

export const registerThunk = createAppAsyncThunk<
  IAuthRegisterResponse,
  IAuthRegisterRequest
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload)
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Unable to register'))
  }
})

export const activateThunk = createAppAsyncThunk<
  IAuthActivateResponse,
  IAuthActivateRequest
>('auth/activate', async (payload, { rejectWithValue }) => {
  try {
    return await authService.activate(payload)
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Unable to activate account'))
  }
})

export const resendOtpThunk = createAppAsyncThunk<
  IAuthResendOtpResponse,
  IAuthResendOtpRequest
>('auth/resendOtp', async (payload, { rejectWithValue }) => {
  try {
    return await authService.resendOtp(payload)
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Unable to resend OTP'))
  }
})

export const forgotPasswordThunk = createAppAsyncThunk<
  IAuthForgotPasswordResponse,
  IAuthForgotPasswordRequest
>('auth/forgotPassword', async (payload, { rejectWithValue }) => {
  try {
    return await authService.forgotPassword(payload)
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Unable to send reset password request'))
  }
})

export const resetPasswordThunk = createAppAsyncThunk<
  IAuthResetPasswordResponse,
  IAuthResetPasswordRequest
>('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    return await authService.resetPassword(payload)
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Unable to reset password'))
  }
})

export const fetchMyProfileThunk = createAppAsyncThunk<IAdminUser, void>(
  'auth/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe()
      return response.user
    } catch (error) {
      return rejectWithValue(toErrorMessage(error, 'Unable to fetch profile'))
    }
  },
)

export const logoutThunk = createAppAsyncThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      clearStoredAuthTokens()
    } catch (error) {
      clearStoredAuthTokens()
      return rejectWithValue(toErrorMessage(error, 'Unable to logout'))
    }
  },
)

export const fetchTenantsThunk = createAppAsyncThunk<ITenantListResponse, void>(
  'auth/fetchTenants',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      return await tenantService.listTenants(auth.selectedTenant ?? undefined)
    } catch (error) {
      return rejectWithValue(toErrorMessage(error, 'Unable to fetch tenants'))
    }
  },
)

export const selectTenantThunk = createAppAsyncThunk<
  ISelectTenantResponse,
  ISelectTenantRequest
>('auth/selectTenant', async (payload, { rejectWithValue }) => {
  try {
    return await tenantService.selectTenant(payload)
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Unable to select tenant'))
  }
})

export const selectRoleThunk = createAppAsyncThunk<
    ISelectRoleResponse,
    ISelectRoleRequest
>('auth/selectRole', async (payload, { getState, rejectWithValue }) => {
    try {
        const { auth } = getState()

        return await tenantService.selectRole(payload, auth.selectedTenant ?? undefined)
    } catch (error) {
        return rejectWithValue(toErrorMessage(error, 'Unable to select function'))
    }
})

export const fetchAgentsThunk = createAppAsyncThunk<
  IAgentListResponse,
  IAgentListRequest | undefined
>('auth/fetchAgents', async (payload, { rejectWithValue }) => {
  try {
    return await tenantService.listAgents(payload ?? {})
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Unable to fetch agents'))
  }
})

export const selectAgentThunk = createAppAsyncThunk<
  ISelectAgentResponse,
  ISelectAgentRequest
>('auth/selectAgent', async (payload, { rejectWithValue }) => {
  try {
    return await tenantService.selectAgent(payload)
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Unable to select agent'))
  }
})
//#endregion thunks

//#region slices
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
      state.errorCode = null
    },
    setPendingActivationUsername(state, action: PayloadAction<string | null>) {
      state.pendingActivationUsername = action.payload
    },
    setAuthUser(state, action: PayloadAction<IAdminUser | null>) {
      state.user = action.payload
      state.isAuthenticated = Boolean(action.payload)
      state.status = action.payload ? 'authenticated' : 'idle'
    },
    clearAuth() {
      clearStoredAuthTokens()
      return initialState
    },
    resetAuthState() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        setSubmitPending(state)
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        setSettled(state)
        state.user = action.payload.user
        state.status = 'needs_tenant'
        state.isAuthenticated = false
        state.pendingActivationUsername = null
      })
      .addCase(loginThunk.rejected, (state, action) => {
        const message = action.payload ?? 'Unable to login'

        state.isLoading = false
        state.isSubmitting = false

        if (isActivationRequiredError(message)) {
          state.pendingActivationUsername = action.meta.arg.username
          state.error = message
          state.errorCode = ACCOUNT_NOT_ACTIVATED_CODE
          state.status = 'idle'
          state.isAuthenticated = false
          return
        }

        state.error = message
        state.errorCode = null
        state.status = 'idle'
        state.isAuthenticated = false
      })
      .addCase(registerThunk.pending, (state) => {
        setSubmitPending(state)
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        setSettled(state)
        state.status = 'idle'
        state.isAuthenticated = false
        state.pendingActivationUsername = action.meta.arg.username
      })
      .addCase(registerThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to register')
        state.status = 'idle'
      })
      .addCase(activateThunk.pending, (state) => {
        setSubmitPending(state)
      })
      .addCase(activateThunk.fulfilled, (state, action) => {
        setSettled(state)

        if (action.payload.user) {
          state.user = action.payload.user
        }

        state.status = 'needs_tenant'
        state.isAuthenticated = false
        state.pendingActivationUsername = null
      })
      .addCase(activateThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to activate account')
        state.status = 'idle'
      })
      .addCase(resendOtpThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
        state.errorCode = null
      })
      .addCase(resendOtpThunk.fulfilled, (state) => {
        state.isSubmitting = false
        state.error = null
        state.errorCode = null
      })
      .addCase(resendOtpThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload ?? 'Unable to resend OTP'
        state.errorCode = null
      })
      .addCase(forgotPasswordThunk.pending, (state) => {
        setSubmitPending(state)
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        setSettled(state)
        state.status = 'idle'
        state.pendingActivationUsername = action.meta.arg.username
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to send reset password request')
        state.status = 'idle'
      })
      .addCase(resetPasswordThunk.pending, (state) => {
        setSubmitPending(state)
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        setSettled(state)
        state.status = 'idle'
        state.pendingActivationUsername = null
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to reset password')
        state.status = 'idle'
      })
      .addCase(fetchMyProfileThunk.pending, (state) => {
        setActionPending(state)
      })
      .addCase(fetchMyProfileThunk.fulfilled, (state, action) => {
        setSettled(state)
        state.user = action.payload

        if (state.status === 'idle' || state.status === 'pending') {
          state.status = 'authenticated'
          state.isAuthenticated = true
        }
      })
      .addCase(fetchMyProfileThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to fetch profile')
        state.user = null
        state.isAuthenticated = false
        state.status = 'idle'
      })
      .addCase(fetchTenantsThunk.pending, (state) => {
        setActionPending(state)
      })
      .addCase(fetchTenantsThunk.fulfilled, (state, action) => {
        setSettled(state)
        const payload = action.payload as ITenantListResponse | ITenantItem[]
        state.tenants = Array.isArray(payload) ? payload : payload.items ?? []
      })
      .addCase(fetchTenantsThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to fetch tenants')
      })
      .addCase(selectTenantThunk.pending, (state) => {
        setActionPending(state)
      })
      .addCase(selectTenantThunk.fulfilled, (state, action) => {
        setSettled(state)

        const selectedTenant = state.tenants.find(
          (tenant) => String(tenant.id) === String(action.meta.arg.tenantId),
        )

        state.selectedTenant = selectedTenant ?? null
        state.selectedAgent = null
        state.agents = []
        state.role = null
        state.status = 'needs_role'
        state.isAuthenticated = false
      })
      .addCase(selectTenantThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to select tenant')
      })
      .addCase(selectRoleThunk.pending, (state) => {
        setActionPending(state)
      })
      .addCase(selectRoleThunk.fulfilled, (state, action) => {
        setSettled(state)

        const selectedRole = action.payload.role

        state.role = selectedRole
        state.selectedAgent = null

        if (requiresAgentSelection(selectedRole)) {
          state.status = 'needs_agent'
          state.isAuthenticated = false
          return
        }

        state.status = 'authenticated'
        state.isAuthenticated = true
      })
      .addCase(selectRoleThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to select function')
      })
      .addCase(fetchAgentsThunk.pending, (state) => {
        setActionPending(state)
      })
      .addCase(fetchAgentsThunk.fulfilled, (state, action) => {
        setSettled(state)
        const payload = action.payload as IAgentListResponse | IAgentItem[]
        state.agents = Array.isArray(payload) ? payload : payload.items ?? []
      })
      .addCase(fetchAgentsThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to fetch agents')
      })
      .addCase(selectAgentThunk.pending, (state) => {
        setActionPending(state)
      })
      .addCase(selectAgentThunk.fulfilled, (state, action) => {
        setSettled(state)
        state.selectedAgent = action.payload.agent
        state.status = 'authenticated'
        state.isAuthenticated = true
      })
      .addCase(selectAgentThunk.rejected, (state, action) => {
        setRejected(state, action.payload ?? 'Unable to select agent')
      })
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true
        state.isSubmitting = true
        state.error = null
        state.errorCode = null
      })
      .addCase(logoutThunk.fulfilled, () => {
        return initialState
      })
      .addCase(logoutThunk.rejected, () => {
        return initialState
      })
  },
})
//#endregion slices

//#region actions
export const {
  clearAuthError,
  setPendingActivationUsername,
  resetAuthState,
  setAuthUser,
  clearAuth,
} = authSlice.actions
//#endregion actions

export const loginAdmin = loginThunk
export const logoutAdmin = logoutThunk
export const fetchMyProfile = fetchMyProfileThunk

//#region selectors
export const selectAuthState = (state: RootState) => state.auth
export const selectAuthUser = (state: RootState) => state.auth.user
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectAuthError = (state: RootState) => state.auth.error
export const selectAuthErrorCode = (state: RootState) => state.auth.errorCode
export const selectAuthIsLoading = (state: RootState) => state.auth.isLoading
export const selectAuthIsSubmitting = (state: RootState) => state.auth.isSubmitting
export const selectIsAuthenticated = (state: RootState) => state.auth.status === 'authenticated' || state.auth.isAuthenticated
export const selectTenants = (state: RootState) => state.auth.tenants
export const selectSelectedTenant = (state: RootState) => state.auth.selectedTenant
export const selectAgents = (state: RootState) => state.auth.agents
export const selectSelectedAgent = (state: RootState) => state.auth.selectedAgent
export const selectAuthRole = (state: RootState) => state.auth.role
export const selectPendingActivationUsername = (state: RootState) => state.auth.pendingActivationUsername
export const selectNeedsTenant = (state: RootState) => state.auth.status === 'needs_tenant'
export const selectNeedsRole = (state: RootState) => state.auth.status === 'needs_role'
export const selectNeedsAgent = (state: RootState) => state.auth.status === 'needs_agent'
//#endregion selectors

//#region reducers
export default authSlice.reducer
//#endregion reducers
