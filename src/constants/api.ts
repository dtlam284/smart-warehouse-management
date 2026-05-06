//#region shared API types
export type ApiEntityId = string | number
//#endregion shared API types

//#region API helpers
const withId = (prefix: string, id: ApiEntityId): string => `${prefix}/${id}`
//#endregion API helpers

//#region API endpoints
export const API_ENDPOINTS = {
  //#region auth endpoints
  auth: {
    login: 'api/v3/account/login', // TODO: replace with real endpoint
    loginEmail: 'api/v3/account/login', // TODO: replace with real endpoint
    register: 'api/account/register-cms', // TODO: replace with real endpoint
    activate: 'api/account/comfirm-account', // TODO: replace with real endpoint
    resendOtp: 'api/account/resend-confirm-account', // TODO: replace with real endpoint
    forgotPassword: 'api/account/forgot-password', // TODO: replace with real endpoint
    resetPassword: 'api/account/reset-password', // TODO: replace with real endpoint
    refresh: '/auth/refresh', // TODO: replace with real endpoint
    logout: '/auth/logout', // TODO: replace with real endpoint
    logoutAll: '/auth/logout/all', // TODO: replace with real endpoint
    me: '/auth/me', // TODO: replace with real endpoint
    sessions: '/auth/sessions', // TODO: replace with real endpoint
    sessionById: (id: ApiEntityId): string => withId('/auth/sessions', id), // TODO: replace with real endpoint
  },
  //#endregion auth endpoints

  //#region tenant endpoints
  tenant: {
    list: 'api/account/get-list-tenant', // TODO: replace with real endpoint
    select: 'api/account/select-tenant', // TODO: replace with real endpoint
  },
  //#endregion tenant endpoints

  //#region role endpoints
  role: {
    select: 'api/account/select-function', // TODO: replace with real endpoint
  },
  //#endregion role endpoints

  //#region agent endpoints
  agent: {
    list: 'api/distributor/get-by-page-access', // TODO: replace with real endpoint
    selectWorkgroup: (type: 'ADMIN' = 'ADMIN'): string =>
      `api/account/select-workgroup?type=${type}`, // TODO: replace with real endpoint
  },
  //#endregion agent endpoints

  //#region user endpoints
  users: {
    root: '/users',
    byId: (id: ApiEntityId): string => withId('/users', id),
  },
  //#endregion user endpoints

  //#region permission endpoints
  permissions: {
    root: '/permissions',
    byId: (id: ApiEntityId): string => withId('/permissions', id),
  },
  //#endregion permission endpoints

  //#region login audit endpoints
  loginAudit: {
    root: '/admin/login-audit',
    stats: '/admin/login-audit/stats',
  },
  //#endregion login audit endpoints
} as const
//#endregion API Endpoints
