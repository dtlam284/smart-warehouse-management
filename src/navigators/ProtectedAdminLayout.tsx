import { Navigate, useLocation } from 'react-router'
import { useAppSelector } from '@/store'
import { selectAuthState } from '@/store/slices/authSlice'
import { AdminLayout } from './AdminLayout'
import { appendRedirectParam, createLoginPathWithRedirect } from './redirect'

//#region components
function AuthCheckingScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
            <div className="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    Validating session
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Checking your account access.
                </p>
            </div>
        </div>
    )
}
//#endregion components

//#region layout guard
export function ProtectedAdminLayout() {
    const auth = useAppSelector(selectAuthState)
    const location = useLocation()

    if (auth.status === 'pending' || auth.isLoading) {
        return <AuthCheckingScreen />
    }

    if (auth.status === 'idle') {
        return <Navigate to={createLoginPathWithRedirect(location)} replace />
    }

    if (auth.status === 'needs_tenant') {
        return <Navigate to={appendRedirectParam('/auth/select-tenant', location.search)} replace />
    }

    if (auth.status === 'needs_role') {
        return <Navigate to={appendRedirectParam('/auth/select-role', location.search)} replace />
    }

    if (auth.status === 'needs_agent') {
        return <Navigate to={appendRedirectParam('/auth/select-agent', location.search)} replace />
    }

    if (auth.status === 'authenticated') {
        return <AdminLayout />
    }

    return <Navigate to="/auth/login" replace />
}
//#endregion layout guard
