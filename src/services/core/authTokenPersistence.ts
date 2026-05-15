import { env } from '@/config/env'
import { apiClient } from './apiClient'

type TokenRecord = Record<string, unknown>

interface IPersistAuthTokensOptions {
    persistRootToken?: boolean
}

const ROOT_AUTH_TOKEN_STORAGE_KEY = `${env.tokenStorageKey}.root`

const getBrowserStorage = (): Storage | undefined => {
    if (typeof window === 'undefined') {
        return undefined
    }

    return window.localStorage
}

const getRecord = (value: unknown): TokenRecord => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as TokenRecord
    }

    return {}
}

const getStringValue = (
    records: TokenRecord[],
    keys: string[],
): string | undefined => {
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

const getNumberValue = (
    records: TokenRecord[],
    keys: string[],
): number | undefined => {
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

const readStoredAccessToken = (storageKey: string): string | undefined => {
    const storage = getBrowserStorage()
    const rawValue = storage?.getItem(storageKey)

    if (!rawValue) {
        return undefined
    }

    try {
        const parsed = JSON.parse(rawValue) as unknown

        if (parsed && typeof parsed === 'object') {
            const record = parsed as TokenRecord

            const accessToken =
                record.accessToken ??
                record.AccessToken ??
                record.access_token ??
                record.token ??
                record.Token

            if (typeof accessToken === 'string' && accessToken.trim().length > 0) {
                return accessToken
            }
        }
    } catch {
        return rawValue
    }

    return rawValue
}

export const persistAuthTokensFromResponse = (
    response: unknown,
    options?: IPersistAuthTokensOptions,
): void => {
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

    const records = [dataRecord, tokenRecord, rootRecord]

    const accessToken = getStringValue(records, [
        'AccessToken',
        'accessToken',
        'access_token',
        'Token',
        'token',
    ])

    const refreshToken = getStringValue(records, [
        'RefreshToken',
        'refreshToken',
        'refresh_token',
    ])

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

    if (options?.persistRootToken) {
        getBrowserStorage()?.setItem(ROOT_AUTH_TOKEN_STORAGE_KEY, accessToken)
    }
}

export const getActiveAuthToken = (): string | undefined => {
    return readStoredAccessToken(env.tokenStorageKey)
}

export const getRootAuthToken = (): string | undefined => {
    return readStoredAccessToken(ROOT_AUTH_TOKEN_STORAGE_KEY)
}

export const clearPersistedAuthTokens = (): void => {
    apiClient.clearTokens()
    getBrowserStorage()?.removeItem(ROOT_AUTH_TOKEN_STORAGE_KEY)
}
