import React from 'react'
import { Building2, RefreshCw, UsersRound } from 'lucide-react'
import { Navigate, useNavigate, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    clearAuthError,
    fetchAgentsThunk,
    selectAuthState,
    selectAgentThunk,
    returnToRoleSelection,
} from '@/store/slices/authSlice'
import { appendRedirectParam, getRedirectParam } from '@/navigators/redirect'
import type { IAgentItem } from '@/models/tenant/TenantInterface'

//#region agent selection screen
export function AgentSelectionScreen() {
    //#region hooks
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const auth = useAppSelector(selectAuthState)
    const hasFetchedAgentsRef = React.useRef(false)
    //#endregion hooks

    //#region derived state
    const agents = auth.agents ?? []
    const selectedTenant = auth.selectedTenant
    const isInitialLoading = auth.isLoading && agents.length === 0
    const isBusy = auth.isLoading || auth.isSubmitting
    //#endregion derived state

    //#region effects
    React.useEffect(() => {
        if (auth.status !== 'needs_agent') {
            return
        }

        if (!auth.selectedTenant) {
            return
        }

        if (agents.length > 0) {
            return
        }

        if (hasFetchedAgentsRef.current) {
            return
        }

        hasFetchedAgentsRef.current = true
        void dispatch(
            fetchAgentsThunk({
                page: 1,
                limit: 50,
            }),
        )
    }, [auth.status, agents.length, auth.selectedTenant?.id, dispatch])
    //#endregion effects

    //#region auth redirect
    if (auth.status === 'idle') {
        return <Navigate to={appendRedirectParam('/auth/login', location.search)} replace />
    }

    if (auth.status === 'authenticated') {
        return <Navigate to={getRedirectParam(location.search)} replace />
    }

    if (!selectedTenant) {
        return <Navigate to={appendRedirectParam('/auth/select-tenant', location.search)} replace />
    }

    if (auth.status === 'needs_role') {
        return <Navigate to={appendRedirectParam('/auth/select-role', location.search)} replace />
    }

    if (auth.status === 'needs_tenant') {
        return <Navigate to={appendRedirectParam('/auth/select-tenant', location.search)} replace />
    }
    //#endregion auth redirect

    //#region handlers
    const clearErrorIfNeeded = () => {
        if (auth.error || auth.errorCode) {
            dispatch(clearAuthError())
        }
    }

    const handleRetry = () => {
        if (auth.isLoading || auth.isSubmitting) {
            return
        }

        clearErrorIfNeeded()

        void dispatch(
            fetchAgentsThunk({
                page: 1,
                limit: 50,
            }),
        )
    }

    const handleSelectAgent = async (agent: IAgentItem) => {
        if (isBusy) {
            return
        }

        if (!agent.workGroupId) {
            return
        }

        clearErrorIfNeeded()

        const result = await dispatch(
            selectAgentThunk({
                workGroupId: agent.workGroupId,
            }),
        )

        if (!selectAgentThunk.fulfilled.match(result)) {
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
                        <UsersRound className="h-6 w-6" />
                    </div>

                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                        Chọn kho
                    </h1>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Chọn kho mà bạn muốn truy cập cho{' '}
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
                            <span>{auth.error}</span>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isBusy}
                                onClick={handleRetry}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Thử lại
                            </Button>
                        </div>
                    </div>
                ) : null}
                {/*#endregion redux error */}

                {isInitialLoading ? (
                    <AgentSkeletonList />
                ) : agents.length === 0 ? (
                    <AgentEmptyState isBusy={isBusy} onRetry={handleRetry} />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {agents.map((agent) => (
                            <AgentCard
                                key={String(agent.id)}
                                agent={agent}
                                disabled={
                                    agent.isAvailable === false ||
                                    agent.isActive === false ||
                                    isBusy
                                }
                                onSelect={handleSelectAgent}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => {
                            dispatch(returnToRoleSelection())
                            navigate('/auth/select-role', { replace: true })
                        }}
                    >
                        Quay lại
                    </Button>
                </div>
            </div>
        </div>
    )
    //#endregion render
}
//#endregion agent selection screen

//#region agent card
interface IAgentCardProps {
    agent: IAgentItem
    disabled: boolean
    onSelect: (agent: IAgentItem) => void
}

function AgentCard({ agent, disabled, onSelect }: IAgentCardProps) {
    const initial = agent.name.trim().charAt(0).toUpperCase() || 'A'
    const isUnavailable = agent.isAvailable === false || agent.isActive === false

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(agent)}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 dark:disabled:hover:border-slate-800"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {agent.avatarUrl ? (
                        <img
                            src={agent.avatarUrl}
                            alt={agent.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        initial
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                        {agent.name}
                    </h2>

                    {agent.code ? (
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                            {agent.code}
                        </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                        {isUnavailable ? (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                Unavailable
                            </span>
                        ) : (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                Available
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    )
}
//#endregion agent card

//#region empty state
interface IAgentEmptyStateProps {
    isBusy: boolean
    onRetry: () => void
}

function AgentEmptyState({ isBusy, onRetry }: IAgentEmptyStateProps) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Building2 className="h-6 w-6" />
            </div>

            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                No agents found
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                We could not find any agent workspaces for this account. Try again or contact your
                administrator.
            </p>

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
function AgentSkeletonList() {
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
