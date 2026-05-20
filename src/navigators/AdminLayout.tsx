import React from 'react'
import { Outlet, useNavigate } from 'react-router'
import { ChevronDown, LogOut } from 'lucide-react'
// import { LanguageToggle } from '@/components/LanguageToggle'
import { useAppDispatch, useAppSelector } from '@/store'
import { logoutThunk, selectAuthUser } from '@/store/slices/authSlice'

//#region constants
const AUTH_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY ?? 'base.cms.auth'
//#endregion constants

//#region types
type TokenClaims = Record<string, unknown>
//#endregion types

//#region helpers
const decodeBase64Url = (value: string): string => {
    const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/')
    const paddedValue = normalizedValue.padEnd(
        normalizedValue.length + ((4 - (normalizedValue.length % 4)) % 4),
        '=',
    )

    return decodeURIComponent(
        atob(paddedValue)
            .split('')
            .map((character) => {
                return `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`
            })
            .join(''),
    )
}

const getAccessTokenFromStorage = (): string | undefined => {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY)

    if (!rawValue) {
        return undefined
    }

    try {
        const parsed = JSON.parse(rawValue) as Record<string, unknown>
        const token =
            parsed.accessToken ??
            parsed.AccessToken ??
            parsed.token ??
            parsed.Token

        return typeof token === 'string' && token.trim().length > 0
            ? token
            : undefined
    } catch {
        return rawValue
    }
}

const getTokenClaims = (): TokenClaims => {
    const accessToken = getAccessTokenFromStorage()

    if (!accessToken) {
        return {}
    }

    const [, payload] = accessToken.split('.')

    if (!payload) {
        return {}
    }

    try {
        return JSON.parse(decodeBase64Url(payload)) as TokenClaims
    } catch {
        return {}
    }
}

const getStringClaim = (claims: TokenClaims, keys: string[]): string | undefined => {
    for (const key of keys) {
        const value = claims[key]

        if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim()
        }
    }

    return undefined
}

const getInitials = (displayName: string): string => {
    const parts = displayName
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    if (parts.length === 0) {
        return 'AD'
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase()
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
//#endregion helpers

//#region component
export function AdminLayout() {
    //#region hooks
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const user = useAppSelector(selectAuthUser)
    //#endregion hooks

    //#region states
    const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false)
    //#endregion states

    //#region refs
    const accountMenuRef = React.useRef<HTMLDivElement | null>(null)
    //#endregion refs

    //#region derived
    const tokenClaims = React.useMemo(() => getTokenClaims(), [])
    const tokenDisplayName = getStringClaim(tokenClaims, [
        'displayname',
        'displayName',
        'name',
        'unique_name',
        'email',
    ])

    const displayName =
        user && `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim().length > 0
            ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
            : tokenDisplayName ?? 'Admin'

    const userSubtitle =
        user?.role?.name ??
        user?.email ??
        getStringClaim(tokenClaims, ['unique_name', 'email', 'role']) ??
        'Administrator'

    const userInitials = getInitials(displayName)
    //#endregion derived

    //#region effects
    React.useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!accountMenuRef.current) {
                return
            }

            if (accountMenuRef.current.contains(event.target as Node)) {
                return
            }

            setIsAccountMenuOpen(false)
        }

        window.addEventListener('pointerdown', handlePointerDown)

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown)
        }
    }, [])
    //#endregion effects

    //#region handlers
    const handleLogout = async () => {
        setIsAccountMenuOpen(false)
        await dispatch(logoutThunk())
        navigate('/auth/login', { replace: true })
    }

    const toggleAccountMenu = () => {
        setIsAccountMenuOpen((currentValue) => !currentValue)
    }
    //#endregion handlers

    //#region render
    return (
        <div className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <h1 className="truncate text-sm font-bold text-slate-950 dark:text-slate-50 sm:text-base">
                            Warehouse{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                                Fulfillment
                            </span>
                        </h1>

                        <span className="hidden h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-800 sm:block" />

                        <div className="hidden min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 sm:flex">
                            <span aria-hidden="true">🏭</span>
                            <span className="truncate">Kho Hà Nội</span>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        {/* <LanguageToggle /> */}

                        <div ref={accountMenuRef} className="relative">
                            <button
                                type="button"
                                onClick={toggleAccountMenu}
                                className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 pr-3 text-left text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                aria-haspopup="menu"
                                aria-expanded={isAccountMenuOpen}
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
                                    {user?.photo ? (
                                        <img
                                            src={user.photo}
                                            alt={displayName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        userInitials
                                    )}
                                </span>

                                <span className="hidden max-w-40 truncate sm:inline">
                                    {displayName}
                                </span>

                                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                            </button>

                            {isAccountMenuOpen ? (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
                                                {userInitials}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {displayName}
                                                </p>

                                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                    {userSubtitle}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            void handleLogout()
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Đăng xuất
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </header>

                <main className="cms-scrollbar min-h-0 flex-1 overflow-hidden bg-slate-50/50 transition-colors duration-300 dark:bg-slate-900/50">
                    <Outlet />
                </main>
            </div>
        </div>
    )
    //#endregion render
}
//#endregion component
