import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '@/store'
import { selectAuthStatus } from '@/store/slices/authSlice'
import { appendRedirectParam, getRedirectParam } from './redirect'

const AUTH_FLOW_PATH_BY_STATUS = {
    needs_tenant: '/auth/select-tenant',
    needs_role: '/auth/select-role',
    needs_agent: '/auth/select-agent'
} as const

function AuthFlowCheckingScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
            <div className="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    Checking auth flow
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Please wait.
                </p>
            </div>
        </div>
    )
}

export function AuthFlowGuard() {
    const status = useAppSelector(selectAuthStatus)
    const location = useLocation()

    if (status === 'pending') {
        return <AuthFlowCheckingScreen />
    }

    if (status === 'idle') {
        return <Navigate to={appendRedirectParam('/auth/login', location.search)} replace />
    }

    if (status === 'authenticated') {
        return <Navigate to={getRedirectParam(location.search)} replace />
    }

    const allowedPath = AUTH_FLOW_PATH_BY_STATUS[status]

    if (location.pathname !== allowedPath) {
         return <Navigate to={appendRedirectParam(allowedPath, location.search)} replace />
    }

    return <Outlet />
}
