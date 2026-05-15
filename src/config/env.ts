const toNumber = (value: string | undefined, fallback: number): number => {
    if (!value) {
        return fallback
    }

    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://api.sagacom.io',
    configApiBaseUrl: 
        import.meta.env.VITE_API_URL_CONFIG ??
        import.meta.env.VITE_API_BASE_URL ??
        'https://api.sagacom.io',
    apiTimeoutMs: toNumber(import.meta.env.VITE_API_TIMEOUT_MS, 30000),
    tokenStorageKey: import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY ?? 'base.cms.auth',

    authLoginHost: import.meta.env.VITE_AUTH_LOGIN_HOST ?? '00vh9.sagacom.io',
    authLoginCode: import.meta.env.VITE_AUTH_LOGIN_CODE ?? '00VH9',
    authLoginFunction: import.meta.env.VITE_AUTH_LOGIN_FUNCTION ?? '',
}
