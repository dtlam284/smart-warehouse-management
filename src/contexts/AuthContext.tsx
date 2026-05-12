import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth/authService'
import { env } from '@/config/env'
import { ApiError, queryKeys } from '@/services/core'
import { IAdminUser } from '@/models/account'

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
    const tokens = authService.getStoredTokens()
    return Boolean(tokens?.accessToken && tokens.refreshToken)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()
    const [hasSession, setHasSession] = React.useState<boolean>(() => hasStoredSession())

    const meQuery = useQuery<IAdminUser | null>({
        queryKey: queryKeys.auth.me,
        queryFn: async () => {
            try {
                return await authService.getMe()
            } catch (error) {
                if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                    authService.clearStoredTokens()
                    setHasSession(false)
                    queryClient.setQueryData(queryKeys.auth.me, null)
                    return null
                }

                throw error
            }
        },
        enabled: hasSession,
    })

    React.useEffect(() => {
        const onStorageChange = (event: StorageEvent) => {
            if (event.key === null) {
                setHasSession(hasStoredSession())
                return
            }

            if (event.key === env.tokenStorageKey) {
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

        const result = await meQuery.refetch()
        return result.data ?? null
    }, [meQuery, queryClient])

    const logout = React.useCallback(async (): Promise<void> => {
        const activeSession = hasStoredSession()

        if (activeSession) {
            try {
                await authService.logout()
            } catch {
                authService.clearStoredTokens()
            }
        } else {
            authService.clearStoredTokens()
        }

        setHasSession(false)
        queryClient.setQueryData(queryKeys.auth.me, null)
    }, [queryClient])

    const status: AuthStatus = React.useMemo(() => {
        if (!hasSession) {
            return 'unauthenticated'
        }

        if (meQuery.isPending) {
            return 'loading'
        }

        if (meQuery.data) {
            return 'authenticated'
        }

        return 'unauthenticated'
    }, [hasSession, meQuery.data, meQuery.isPending])

    const value = React.useMemo<AuthContextValue>(
        () => ({
            user: meQuery.data ?? null,
            status,
            isAuthenticated: status === 'authenticated',
            error: meQuery.error,
            refreshProfile,
            logout,
        }),
        [logout, meQuery.data, meQuery.error, refreshProfile, status],
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
