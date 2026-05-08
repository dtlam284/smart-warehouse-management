import React from 'react'
import {
    BadgeCheck,
    Building2,
    Handshake,
    Network,
    RefreshCw,
    Store,
    Truck,
    UsersRound,
} from 'lucide-react'
import { Navigate, useNavigate, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    clearAuthError,
    selectAuthState,
    selectRoleThunk,
} from '@/store/slices/authSlice'
import { FunctionalPathEnum } from '@/models'
import { appendRedirectParam, getRedirectParam } from '@/navigators/redirect'
import { requiresAgentSelection } from './utils'
import type { AuthRole } from '@/models'

//#region constants
const ROLE_OPTIONS: Array<{
    value: AuthRole
    title: string
    description: string
    badge: string
    icon: React.ComponentType<{ className?: string }>
}> = [
    {
        value: FunctionalPathEnum.MANAGER,
        title: 'Manager',
        description: 'Manage tenant operations, reports, users, and high-level workflows.',
        badge: 'Admin function',
        icon: UsersRound,
    },
    {
        value: FunctionalPathEnum.DISTRIBUTOR,
        title: 'Distributor',
        description: 'Work with distributor/workgroup-level operations. This requires agent selection.',
        badge: 'Requires agent',
        icon: Truck,
    },
    {
        value: FunctionalPathEnum.AFFILIATE,
        title: 'Affiliate System',
        description: 'Access affiliate system workflows and related operational tools.',
        badge: 'Affiliate',
        icon: Network,
    },
    {
        value: FunctionalPathEnum.POS,
        title: 'POS',
        description: 'Access point-of-sale workflows and store-facing operations.',
        badge: 'POS',
        icon: Store,
    },
    {
        value: FunctionalPathEnum.COLLABORATOR,
        title: 'Collaborator',
        description: 'Access collaborator workflows and assigned operational tasks.',
        badge: 'Collaborator',
        icon: Handshake,
    },
]
//#endregion constants

//#region tenant selection screen
export function RoleSelectionScreen() {
    //#region hooks
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation() 
    const auth = useAppSelector(selectAuthState)
    //#endregion hooks

    //#region derived state
    const selectedTenant = auth.selectedTenant
    const isBusy = auth.isLoading || auth.isSubmitting 
    //#endregion derived state

    //#region auth redirect
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

    if (!selectedTenant) {
        return (
            <Navigate
                to={appendRedirectParam('/auth/select-tenant', location.search)}
                replace
            />
        )
    }

    if (auth.status === 'needs_tenant') {
        return (
            <Navigate
                to={appendRedirectParam('/auth/select-tenant', location.search)}
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

    const handleSelectRole = async (role: AuthRole) => {
        if (isBusy) {
            return
        }

        clearErrorIfNeeded()

        const result = await dispatch(
            selectRoleThunk({
                role,
            }),
        )

        if (!selectRoleThunk.fulfilled.match(result)) {
            return
        }

        const selectedRole = result.payload.role

        if (requiresAgentSelection(selectedRole)) {
            navigate(appendRedirectParam('/auth/select-agent', location.search), {
                replace: true,
            })
            return
        }

        navigate(getRedirectParam(location.search), { replace: true })
    }
    //#endregion handlers

    //#region render
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
            <div className="mx-auto w-full max-w-4xl">
                {/*#region header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <BadgeCheck className="h-6 w-6" />
                    </div>

                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                        Select Function
                    </h1>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Choose which function you want to use for{' '}
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                            {selectedTenant.name}
                        </span>
                        .
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        <Building2 className="h-3.5 w-3.5" />
                        {selectedTenant.name}
                    </div>
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
                            onClick={clearErrorIfNeeded}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </div>
                ) : null}
                {/*#endregion redux error */}

                {/*#region role cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ROLE_OPTIONS.map((option) => (
                        <RoleCard
                        key={option.value}
                        title={option.title}
                        description={option.description}
                        badge={option.badge}
                        icon={option.icon}
                        disabled={isBusy}
                        requiresAgent={requiresAgentSelection(option.value)}
                        onSelect={() => {
                            void handleSelectRole(option.value)
                        }}
                        />
                    ))}
                </div>
                {/*#endregion role cards */}

                {/*#region footer */}
                <div className="mt-8 text-center">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => navigate('/auth/select-tenant', { replace: true })}
                    >
                        Back to tenant selection
                    </Button>
                </div>
                {/*#endregion footer */}
            </div>
        </div>
    )
    //#endregion render
}
//#endregion role selection screen

//#region role card
interface IRoleCardProps {
    title: string
    description: string
    badge: string
    icon: React.ComponentType<{ className?: string }>
    disabled: boolean
    requiresAgent: boolean
    onSelect: () => void
}

function RoleCard({
    title,
    description,
    badge,
    icon: Icon,
    disabled,
    requiresAgent,
    onSelect,
    }: IRoleCardProps) {
    return (
        <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 dark:disabled:hover:border-slate-800"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-300">
                    <Icon className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                            {title}
                        </h2>

                        {requiresAgent ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            Agent flow
                        </span>
                        ) : null}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {description}
                    </p>

                    <span className="mt-4 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {badge}
                    </span>
                </div>
            </div>
        </button>
    )
}
//#endregion role card
