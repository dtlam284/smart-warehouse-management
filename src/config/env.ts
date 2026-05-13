const toNumber = (value: string | undefined, fallback: number): number => {
    if (!value) {
        return fallback
    }

    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.2.112:9092',
    configApiBaseUrl: 
        import.meta.env.VITE_API_URL_CONFIG ??
        import.meta.env.VITE_API_BASE_URL ??
        'http://192.168.2.112:9092',
    apiTimeoutMs: toNumber(import.meta.env.VITE_API_TIMEOUT_MS, 30000),
    tokenStorageKey: import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY ?? 'base.cms.auth',

    authLoginHost: import.meta.env.VITE_AUTH_LOGIN_HOST ?? 'alpha.sagacom.io',
    authLoginCode: import.meta.env.VITE_AUTH_LOGIN_CODE ?? '',
    authLoginFunction: import.meta.env.VITE_AUTH_LOGIN_FUNCTION ?? '',
}
