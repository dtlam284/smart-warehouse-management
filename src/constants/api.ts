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
        loginEmail: 'api/v3/account/login', // TODO: replace with real endpoint
        register: 'api/account/register-cms',
        activate: 'api/account/confirm-account',
        resendOtp: 'api/account/resend-confirm-account',
        forgotPassword: 'api/account/forgot-password',
        resetPassword: 'api/account/reset-password',
        refresh: '/auth/refresh',
        logout: 'api/account/logout', // TODO: replace with real endpoint
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
        select: 'api/account/select-funtion', // TODO: replace with real endpoint
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

    //#region config
    config: {
        getConfig: 'api/config', // not sure yet
    },
    //#endregion config

    //#region shipping providers
    shippingProviders: {
        list: 'api/orders/get-list-shipping-unit',
    },
    //#endregion shipping providers

    //#region packing
    packing: {
        getPackageDetails: 'api-fulfillment/packages/get-package-details', // not found yet
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
    returDelivery: {
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
