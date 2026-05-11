import React from 'react'
import { Building2, RefreshCw } from 'lucide-react'
import { Navigate, useNavigate, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    clearAuthError,
    fetchTenantsThunk,
    logoutThunk,
    selectAuthState,
    selectTenantThunk,
} from '@/store/slices/authSlice'
import { appendRedirectParam, getRedirectParam } from '@/navigators/redirect'
import type { ITenantItem } from '@/models/tenant/TenantInterface'

//#region tenant selection screen
export function TenantSelectionScreen() {
    //#region hooks
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const auth = useAppSelector(selectAuthState)
    const hasRequestedTenantsRef = React.useRef(false)
    //#endregion hooks

    //#region derived state
    const tenants = auth.tenants ?? []
    const isInitialLoading = auth.isLoading && tenants.length === 0
    const isBusy = auth.isLoading || auth.isSubmitting
    //#endregion derived state

    //#region effects
    React.useEffect(() => {
        if (auth.status !== 'needs_tenant') {
            return
        }

        if (tenants.length > 0) {
            return
        }

        if (hasRequestedTenantsRef.current) {
            return
        }

        hasRequestedTenantsRef.current = true
        void dispatch(fetchTenantsThunk())
    }, [auth.status, tenants.length, dispatch])
    //#endregion effects

    //#region auth redirect
    React.useEffect(() => {
        if (auth.status !== 'needs_tenant') {
            return
        }

        if (tenants.length > 0) {
            return
        }

        if (hasRequestedTenantsRef.current) {
            return
        }

        hasRequestedTenantsRef.current = true
        void dispatch(fetchTenantsThunk())
    }, [auth.status, tenants.length, dispatch])

    if (auth.status === 'idle') {
        return (
            <Navigate
                to={appendRedirectParam('/auth/login', location.search)}
                replace
            />
        )
    }

    if (auth.status === 'authenticated') {
        return <Navigate to={getRedirectParam(location.search)} replace />
    }

    if (auth.status === 'needs_role') {
        return (
            <Navigate
                to={appendRedirectParam('/auth/select-role', location.search)}
                replace
            />
        )
    }

    if (auth.status === 'needs_agent') {
        return (
            <Navigate
                to={appendRedirectParam('/auth/select-agent', location.search)}
                replace
            />
        )
    }
    //#endregion auth redirect

    //#region handlers
    const clearErrorIfNeeded = () => {
        if (auth.error || auth.errorCode) {
            dispatch(clearAuthError())
        }
    }

    const handleRetry = () => {
        clearErrorIfNeeded()
        hasRequestedTenantsRef.current = true
        void dispatch(fetchTenantsThunk())
    }

    const handleSelectTenant = async (tenant: ITenantItem) => {
        if (isBusy || tenant.isActive === false) {
            return
        }

        if (!tenant.ClientId || !tenant.ClientSecret) {
            dispatch(clearAuthError())

            alert('This tenant is missing ClientId or ClientSecret.')

            return
        }

        const result = await dispatch(
            selectTenantThunk({
                tenantId: tenant.id,
                ClientId: tenant.ClientId,
                ClientSecret: tenant.ClientSecret,
            }),
        )

        if (selectTenantThunk.fulfilled.match(result)) {
            navigate(appendRedirectParam('/auth/select-role', location.search), {
                replace: true,
            })
        }
    }

    const handleBackToLogin = async () => {
        if (isBusy) {
            return
        }

        await dispatch(logoutThunk())

        navigate('/auth/login', {
            replace: true,
        })
    }
    //#endregion handlers

    //#region render
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
            <div className="mx-auto w-full max-w-4xl">
                {/*#region header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <Building2 className="h-6 w-6" />
                    </div>

                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                        Select Tenant
                    </h1>

                    {/* <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Choose the tenant workspace you want to access.
                    </p> */}
                </div>
                {/*#endregion header */}

                {/*#region redux error */}
                {auth.error ? (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            {auth.error}
                        </span>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={handleRetry}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </Button>
                    </div>
                </div>
                ) : null}
                {/*#endregion redux error */}

                {/*#region content */}
                {isInitialLoading ? (
                <TenantSkeletonList />
                ) : tenants.length === 0 ? (
                <TenantEmptyState isBusy={isBusy} onRetry={handleRetry} />
                ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tenants.map((tenant) => (
                    <TenantCard
                        key={String(tenant.id)}
                        tenant={tenant}
                        disabled={tenant.isActive === false || isBusy}
                        onSelect={handleSelectTenant}
                    />
                    ))}
                </div>
                )}
                {/*#endregion content */}

                {/*#region footer */}
                <div className="mt-8 text-center">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => {
                            void handleBackToLogin()
                        }}
                    >
                        Back to login
                    </Button>
                </div>
                {/*#endregion content */}
            </div>
        </div>
    )
    //#endregion render
}
//#endregion tenant selection screen

//#region tenant card
interface ITenantCardProps {
    tenant: ITenantItem
    disabled: boolean
    onSelect: (tenant: ITenantItem) => void
}

function TenantCard({ tenant, disabled, onSelect }: ITenantCardProps) {
    const initial = tenant.name.trim().charAt(0).toUpperCase() || 'T'

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(tenant)}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 dark:disabled:hover:border-slate-800"
            >
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {tenant.logoUrl ? (
                    <img
                    src={tenant.logoUrl}
                    alt={tenant.name}
                    className="h-full w-full object-cover"
                    />
                ) : (
                    initial
                )}
                </div>

                <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                    {tenant.name}
                </h2>

                <div className="mt-2 flex flex-wrap gap-2">
                    {tenant.planName ? (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {tenant.planName}
                    </span>
                    ) : null}

                    {tenant.isActive === false ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Inactive
                    </span>
                    ) : (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                    </span>
                    )}
                </div>
                </div>
            </div>
        </button>
    )
}
//#endregion tenant card

//#region empty state
interface ITenantEmptyStateProps {
    isBusy: boolean
    onRetry: () => void
}

function TenantEmptyState({ isBusy, onRetry }: ITenantEmptyStateProps) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Building2 className="h-6 w-6" />
        </div>

        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            No tenants found
        </h2>

        {/* <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
            We could not find any tenant workspaces for this account. Try again or
            contact your administrator.
        </p> */}

        <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={onRetry}
            className="mt-5"
        >
            <RefreshCw className="h-4 w-4" />
            Retry
        </Button>
        </div>
    )
}
//#endregion empty state

//#region skeleton
function TenantSkeletonList() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>  
            </div>
        ))}
        </div>
    )
}
//#endregion skeleton
