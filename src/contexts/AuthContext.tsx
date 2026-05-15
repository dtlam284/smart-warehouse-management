import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth/authService'
import { env } from '@/config/env'
import { queryKeys } from '@/services/core'
import { clearPersistedAuthTokens, getActiveAuthToken } from '@/services/core/authTokenPersistence'
import type { IAdminUser } from '@/models/account'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
    user: IAdminUser | null
    status: AuthStatus
    isAuthenticated: boolean
    error: unknown
    refreshProfile: () => Promise<IAdminUser | null>
    logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

const hasStoredSession = (): boolean => {
    return Boolean(getActiveAuthToken())
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()
    const [hasSession, setHasSession] = React.useState<boolean>(() => hasStoredSession())
    const [error, setError] = React.useState<unknown>(null)

    React.useEffect(() => {
        const onStorageChange = (event: StorageEvent) => {
            if (event.key === null) {
                setHasSession(hasStoredSession())
                return
            }

            if (event.key === env.tokenStorageKey || event.key === `${env.tokenStorageKey}.root`) {
                setHasSession(hasStoredSession())
            }
        }

        window.addEventListener('storage', onStorageChange)
        return () => window.removeEventListener('storage', onStorageChange)
    }, [])

    const refreshProfile = React.useCallback(async (): Promise<IAdminUser | null> => {
        const nextHasSession = hasStoredSession()
        setHasSession(nextHasSession)

        if (!nextHasSession) {
            queryClient.setQueryData(queryKeys.auth.me, null)
            return null
        }

        return null
    }, [queryClient])

    const logout = React.useCallback(async (): Promise<void> => {
        const activeSession = hasStoredSession()

        try {
            if (activeSession) {
                await authService.logout()
            } else {
                clearPersistedAuthTokens()
            }
        } catch (caughtError) {
            setError(caughtError)
            clearPersistedAuthTokens()
        } finally {
            setHasSession(false)
            queryClient.setQueryData(queryKeys.auth.me, null)
        }
    }, [queryClient])

    const status: AuthStatus = hasSession ? 'authenticated' : 'unauthenticated'

    const value = React.useMemo<AuthContextValue>(
        () => ({
            user: null,
            status,
            isAuthenticated: status === 'authenticated',
            error,
            refreshProfile,
            logout,
        }),
        [error, logout, refreshProfile, status],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
    const context = React.useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}
