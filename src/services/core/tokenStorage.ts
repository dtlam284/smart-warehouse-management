import { env } from '@/config/env'
import type { IAuthTokens, ITokenStorage } from './types'

//#region local storage
const canUseLocalStorage = (): boolean => {
    try {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    } catch {
        return false
    }
}
//#endregion local storage

//#region token fallback
let inMemoryTokens: IAuthTokens | null = null
//#endregion token fallback

//#region browser token storage
export class BrowserTokenStorage implements ITokenStorage {
    //#region read token
    getTokens(): IAuthTokens | null {
        if (canUseLocalStorage()) {
            const raw = window.localStorage.getItem(env.tokenStorageKey)
            if (!raw) {
                return null
            }

            try {
                const parsed = JSON.parse(raw) as IAuthTokens

                if (!parsed.accessToken) {
                    return null
                }

                return parsed
            } catch {
                return null
            }
        }

        return inMemoryTokens
    }
    //#endregion read token

    //#region save token
    setTokens(tokens: IAuthTokens): void {
        inMemoryTokens = tokens

        if (canUseLocalStorage()) {
            window.localStorage.setItem(env.tokenStorageKey, JSON.stringify(tokens))
        }
    }
    //#endregion save token

    //#region clear token
    clearTokens(): void {
        inMemoryTokens = null

        if (canUseLocalStorage()) {
            window.localStorage.removeItem(env.tokenStorageKey)
        }
    }
    //#endregion clear token
}
//#endregion browser token storage

//#region token storage
export const tokenStorage = new BrowserTokenStorage()
//#endregion token storage
