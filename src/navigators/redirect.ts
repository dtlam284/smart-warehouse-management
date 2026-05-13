import type { Location } from 'react-router'

//#region constants
const DEFAULT_POST_AUTH_APP = '/'
//#endregion constants

//#region redirect builders
export const getCurrentRedirectPath = (location: Location): string => {
    return `${location.pathname}${location.search}${location.hash}`
}

export const createLoginPathWithRedirect = (location: Location): string => {
    const redirectPath = getCurrentRedirectPath(location)

    return `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
}
//#endregion redirect builders

//#region redirect readers
export const getRedirectParam = (search: string): string => {
    const searchParams = new URLSearchParams(search)
    const redirect = searchParams.get('redirect')

    if (!redirect) {
        return DEFAULT_POST_AUTH_APP
    }

    try {
        const decodedRedirect = decodeURIComponent(redirect)

        if (!decodedRedirect.startsWith('/')) {
            return DEFAULT_POST_AUTH_APP
        }

        if (decodedRedirect.startsWith('/auth')) {
            return DEFAULT_POST_AUTH_APP
        }

        return decodedRedirect
    } catch {
        return DEFAULT_POST_AUTH_APP
    }
}
//#endregion redirect readers

//#region redirect helpers
export const appendRedirectParam = (path: string, search: string): string => {
    const searchParams = new URLSearchParams(search)
    const redirect = searchParams.get('redirect')

    if (!redirect) {
        return path
    }

    return `${path}?redirect=${encodeURIComponent(redirect)}`
}
//#endregion redirect helpers
