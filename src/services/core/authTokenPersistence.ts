import { apiClient } from './apiClient'

type TokenRecord = Record<string, unknown>

interface PersistAuthTokensOptions {
    persistRootToken?: boolean
}

const ROOT_AUTH_TOKEN_STORAGE_KEY = 'base.cms.auth.root'

const getRecord = (value: unknown): TokenRecord => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as TokenRecord
    }

    return {}
}

const getStringValue = (records: TokenRecord[], keys: string[]): string | undefined => {
    for (const record of records) {
        for (const key of keys) {
            const value = record[key]

            if (typeof value === 'string' && value.trim().length > 0) {
                return value
            }
        }
    }

    return undefined
}

const getNumberValue = (records: TokenRecord[], keys: string[]): number | undefined => {
    for (const record of records) {
        for (const key of keys) {
            const value = record[key]

            if (typeof value === 'number' && Number.isFinite(value)) {
                return value
            }

            if (typeof value === 'string' && value.trim().length > 0) {
                const parsedNumber = Number(value)

                if (Number.isFinite(parsedNumber)) {
                    return parsedNumber
                }

                const parsedDate = Date.parse(value)

                if (Number.isFinite(parsedDate)) {
                    return parsedDate
                }
            }
        }
    }

    return undefined
}

const normalizeTokenExpires = (expires?: number): number | undefined => {
    if (!expires) {
        return undefined
    }

    if (expires > 0 && expires < 1_000_000_000_000) {
        return Date.now() + expires * 1000
    }

    return expires
}

const getTokenRecordsFromResponse = (response: unknown): TokenRecord[] => {
    const rootRecord = getRecord(response)
    const dataRecord = getRecord(rootRecord.Data ?? rootRecord.data)
    const tokenRecord = getRecord(
        rootRecord.Token ??
            rootRecord.token ??
            rootRecord.AuthToken ??
            rootRecord.authToken ??
            dataRecord.Token ??
            dataRecord.token ??
            dataRecord.AuthToken ??
            dataRecord.authToken,
    )

    return [dataRecord, tokenRecord, rootRecord]
}

export const getAccessTokenFromResponse = (response: unknown): string | undefined => {
    const records = getTokenRecordsFromResponse(response)

    return getStringValue(records, ['AccessToken', 'accessToken', 'access_token', 'Token', 'token'])
}

export const persistRootAuthToken = (accessToken: string): void => {
    localStorage.setItem(ROOT_AUTH_TOKEN_STORAGE_KEY, accessToken)
}

export const getRootAuthToken = (): string | null => {
    return localStorage.getItem(ROOT_AUTH_TOKEN_STORAGE_KEY)
}

export const clearRootAuthToken = (): void => {
    localStorage.removeItem(ROOT_AUTH_TOKEN_STORAGE_KEY)
}

export const persistAuthTokensFromResponse = (
    response: unknown,
    options: PersistAuthTokensOptions = {},
): void => {
    const records = getTokenRecordsFromResponse(response)

    const accessToken = getStringValue(records, [
        'AccessToken',
        'accessToken',
        'access_token',
        'Token',
        'token',
    ])

    const refreshToken = getStringValue(records, ['RefreshToken', 'refreshToken', 'refresh_token'])

    const rawExpires = getNumberValue(records, [
        'Expires',
        'expires',
        'TokenExpires',
        'tokenExpires',
        'ExpiresAt',
        'expiresAt',
        'ExpiredAt',
    ])

    if (!accessToken) {
        return
    }

    apiClient.setTokens({
        accessToken,
        refreshToken: refreshToken ?? '',
        tokenExpires: normalizeTokenExpires(rawExpires),
    })

    if (options.persistRootToken) {
        persistRootAuthToken(accessToken)
    }
}

export const clearPersistedAuthTokens = (): void => {
    apiClient.clearTokens()
    clearRootAuthToken()
}
