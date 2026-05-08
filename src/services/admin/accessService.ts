import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import {
  IAdminUser,
  ICreatePermissionRequest,
  ICreateUserRequest,
  ILoginAuditFilters,
  ILoginAuditItem,
  ILoginAuditStats,
  IPermissionItem,
  IUpdateUserRequest,
  IUserFilters,
} from '@/models/account'
import { 
  EntityId, 
  IDataResponse, 
  IPaginatedResponse 
} from '@/services/core'
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRefreshRequest,
  AuthRefreshResponse,
  SessionItem,
  UpdateMyProfileRequest,
} from '@/models/authentication'

//#region auth service
export const authService = {
  //#region login / refresh
  async login(payload: AuthLoginRequest): Promise<AuthLoginResponse> {
    const response = await apiClient.post<AuthLoginResponse>(
      API_ENDPOINTS.auth.loginEmail,
      payload,
      { requiresAuth: false },
    )

    apiClient.setTokens({
      accessToken: response.token,
      refreshToken: response.refreshToken,
      tokenExpires: response.tokenExpires,
    })

    return response
  },

  async refresh(refreshToken?: string): Promise<AuthRefreshResponse> {
    const currentTokens = apiClient.tokens
    const token = refreshToken ?? currentTokens?.refreshToken

    if (!token) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<AuthRefreshResponse>(
      API_ENDPOINTS.auth.refresh,
      {
        refreshToken: token,
      } satisfies AuthRefreshRequest,
      {
        requiresAuth: false,
        retryOnUnauthorized: false,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    apiClient.setTokens({
      accessToken: response.token,
      refreshToken: response.refreshToken,
      tokenExpires: response.tokenExpires,
    })

    return response
  },
  //#endregion login / refresh

  //#region logout
  async logout(): Promise<void> {
    await apiClient.post<void>(API_ENDPOINTS.auth.logout)
    apiClient.clearTokens()
  },

  async logoutAll(): Promise<void> {
    await apiClient.post<void>(API_ENDPOINTS.auth.logoutAll)
    apiClient.clearTokens()
  },
  //#endregion logout

  //#region token storage helpers
  getStoredTokens() {
    return apiClient.tokens
  },

  setStoredTokens(response: AuthLoginResponse | AuthRefreshResponse): void {
    apiClient.setTokens({
      accessToken: response.token,
      refreshToken: response.refreshToken,
      tokenExpires: response.tokenExpires,
    })
  },

  clearStoredTokens(): void {
    apiClient.clearTokens()
  },
  //#endregion token storage helpers

  //#region profile
  getMe(): Promise<IAdminUser> {
    return apiClient.get<IAdminUser>(API_ENDPOINTS.auth.me)
  },

  updateMe(payload: UpdateMyProfileRequest): Promise<IAdminUser> {
    return apiClient.patch<IAdminUser>(API_ENDPOINTS.auth.me, payload)
  },
  //#endregion profile

  //#region sessions
  getSessions(): Promise<SessionItem[]> {
    return apiClient.get<SessionItem[]>(API_ENDPOINTS.auth.sessions)
  },

  revokeSession(sessionId: EntityId): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.auth.sessionById(sessionId))
  },
  //#endregion sessions
}
//#endregion auth service

//#region users service
export const usersService = {
  //#region list users
  list(query?: IUserFilters): Promise<IPaginatedResponse<IAdminUser>> {
    const normalizedRoleId =
      query?.role !== undefined && query.role !== null && query.role !== ''
        ? Number(query.role)
        : undefined

    const inheritedRoles =
      query?.filters?.roles && Array.isArray(query.filters.roles)
        ? query.filters.roles.filter((item) => typeof item?.id === 'number')
        : []

    const roleFilters =
      typeof normalizedRoleId === 'number' && Number.isFinite(normalizedRoleId)
        ? [{ id: normalizedRoleId }, ...inheritedRoles]
        : inheritedRoles

    const dedupedRoles = Array.from(
      new Map(roleFilters.map((item) => [item.id, item])).values(),
    )

    const normalizedQuery = {
      page: query?.page,
      limit: query?.limit,
      // Backend users endpoint currently accepts `filters` and `sort` JSON.
      filters:
        dedupedRoles.length > 0
          ? {
              roles: dedupedRoles,
            }
          : (query?.filterOptions ?? query?.filters),
      sort: query?.sort,
      // Keep these for forwards/backwards compatibility across API revisions.
      search: query?.search?.trim() || undefined,
      role:
        typeof normalizedRoleId === 'number' && Number.isFinite(normalizedRoleId)
          ? normalizedRoleId
          : undefined,
      status:
        query?.status !== undefined && query.status !== null && query.status !== ''
          ? String(query.status)
          : undefined,
    }

    return apiClient.get<IPaginatedResponse<IAdminUser>>(API_ENDPOINTS.users.root, {
      query: { ...normalizedQuery },
    })
  },

  async listAll(
    query?: Omit<IUserFilters, 'page' | 'limit'> & {
      pageSize?: number
      maxPages?: number
    },
  ): Promise<IAdminUser[]> {
    const pageSize = Math.min(50, Math.max(1, Number(query?.pageSize ?? 50)))
    const maxPages = Math.max(1, Number(query?.maxPages ?? 200))

    const users: IAdminUser[] = []
    let page = 1
    let totalPages = 1

    while (page <= totalPages && page <= maxPages) {
      const response = await this.list({
        page,
        limit: pageSize,
        search: query?.search,
        role: query?.role,
        status: query?.status,
        filters: query?.filters,
        sort: query?.sort,
      })

      users.push(...(response.data ?? []))

      totalPages =
        response.totalPages || Math.max(1, Math.ceil((response.total ?? 0) / pageSize))
      page += 1
    }

    return users
  },
  //#endregion list users

  //#region user CRUD
  create(payload: ICreateUserRequest): Promise<IDataResponse<IAdminUser>> {
    return apiClient.post<IDataResponse<IAdminUser>>(API_ENDPOINTS.users.root, payload)
  },

  getById(id: EntityId): Promise<IDataResponse<IAdminUser>> {
    return apiClient.get<IDataResponse<IAdminUser>>(API_ENDPOINTS.users.byId(id))
  },

  update(id: EntityId, payload: IUpdateUserRequest): Promise<IDataResponse<IAdminUser>> {
    return apiClient.patch<IDataResponse<IAdminUser>>(API_ENDPOINTS.users.byId(id), payload)
  },

  remove(id: EntityId): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.users.byId(id))
  },
  //#endregion user CRUD
}
//#endregion users service

//#region permissions service
export const permissionsService = {
  //#region permission CRUD
  list(): Promise<IDataResponse<IPermissionItem[]>> {
    return apiClient.get<IDataResponse<IPermissionItem[]>>(API_ENDPOINTS.permissions.root)
  },

  create(payload: ICreatePermissionRequest): Promise<IDataResponse<IPermissionItem>> {
    return apiClient.post<IDataResponse<IPermissionItem>>(
      API_ENDPOINTS.permissions.root,
      payload,
    )
  },

  remove(id: EntityId): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.permissions.byId(id))
  },
  //#endregion permission CRUD
}
//#endregion permissions service

//#region login audit service
export const loginAuditService = {
  //#region login audit queries
  list(query?: ILoginAuditFilters): Promise<IPaginatedResponse<ILoginAuditItem>> {
    return apiClient.get<IPaginatedResponse<ILoginAuditItem>>(
      API_ENDPOINTS.loginAudit.root,
      {
        query: query ? { ...query } : undefined,
      },
    )
  },

  getStats(query?: ILoginAuditFilters): Promise<IDataResponse<ILoginAuditStats>> {
    return apiClient.get<IDataResponse<ILoginAuditStats>>(
      API_ENDPOINTS.loginAudit.stats,
      {
        query: query ? { ...query } : undefined,
      },
    )
  },
  //#endregion login audit queries
}
//#endregion login audit service
