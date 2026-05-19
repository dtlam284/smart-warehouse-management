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
        login: 'api/v3/account/login',
        loginEmail: 'api/v3/account/login',
        register: 'api/account/register-cms',
        activate: 'api/account/confirm-account',
        resendOtp: 'api/account/resend-confirm-account',
        forgotPassword: 'api/account/forgot-password',
        resetPassword: 'api/account/reset-password',
        refresh: '/auth/refresh',
        logout: '/api/account/logout',
        logoutAll: '/auth/logout/all',
        me: '/auth/me',
        sessions: '/auth/sessions',
        sessionById: (id: ApiEntityId): string => withId('/auth/sessions', id),
    },
    //#endregion auth endpoints

    //#region tenant endpoints
    tenant: {
        list: 'api/account/get-list-tenant',
        select: 'api/account/select-tenant',
    },
    //#endregion tenant endpoints

    //#region role endpoints
    role: {
        select: 'api/account/select-funtion',
    },
    //#endregion role endpoints

    //#region agent endpoints
    agent: {
        list: 'api/distributor/get-by-page-access',
        selectWorkgroup: (type: 'ADMIN' = 'ADMIN'): string =>
            `api/account/select-workgroup?type=${type}`,
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

    //#region config
    config: {
        getConfig: 'api/config',
    },
    //#endregion config

    //#region shipping providers
    shippingProviders: {
        list: 'api/orders/get-list-shipping-unit',
    },
    //#endregion shipping providers

    //#region warehouse containers
    containers: {
        getByCode: (code: string): string =>
            `api-warehouse/containers/${encodeURIComponent(code)}/get-by-code`,
    },
    //#endregion warehouse containers

    //#region packing
    packing: {
        getPackageDetails: 'api-fulfillment/packages/get-package-details', 
        updatePacking: 'api/v2/orders/delivery-packing',
        removePacking: 'api/v2/orders/remove-packing',
        packingList: 'api/v2/orders/get-by-page-packing',
        packingListSimple: 'api/v2/orders/get-list-packing',
        statistics: 'api/v2/orders/get-order-packing-statistics',
    },
    //#endregion packing

    //#region handover
    handover: {
        updateHandover: 'api/v2/orders/delivery-handover',
        removeHandover: 'api/v2/orders/remove-handover',
        handoverList: 'api/v2/orders/get-by-page-handover',
        handoverListSimple: 'api/v2/orders/get-list-handover',
        statistics: 'api/v2/orders/get-order-handover-statistics',
    },
    //#endregion handover

    //#region return delivery
    returnDelivery: {
        getReturnDetail: 'api/orders/return-with-items/items',
        confirmReturn: 'api/orders/return-with-items',
        confirmReturnNoLayout: 'api/orders/return-with-items-no-layout',
        removeReturn: 'api/orders/return-with-items',
        returnList: 'api/orders/get-by-page-return-with-items',
        statistics: 'api/v2/orders/get-order-return-statistics',
    },
    //#endregion return delivery
} as const
//#endregion API Endpoints
