import React from 'react'
import { createBrowserRouter } from 'react-router'
import { ErrorBoundaryScreen } from '@/screens/ErrorBoundaryScreen'
import { ActivationScreen } from '@/screens/Auth/ActivationScreen'
import { ForgotPasswordScreen } from '@/screens/Auth/ForgotPasswordScreen'
import { LoginScreen } from '@/screens/Auth/LoginScreen'
import { RegisterScreen } from '@/screens/Auth/RegisterScreen'
import { ResetPasswordScreen } from '@/screens/Auth/ResetPasswordScreen'
import { SessionRequiredScreen } from '@/screens/Auth/SessionRequiredScreen'
import { NotFoundScreen } from '@/screens/NotFound/NotFoundScreen'
import { AuthFlowGuard } from './AuthFlowGuard'
import { ProtectedAdminLayout } from './ProtectedAdminLayout'

//#region lazy screens
const WorkplacePage = React.lazy(() =>
    import('../screens/Workplace/WorkplacePage').then((module) => ({
        default: module.WorkplacePage,
    })),
)

const StatsPage = React.lazy(() =>
    import('../screens/Stats/StatsPage').then((module) => ({
        default: module.StatsPage,
    })),
)

const TenantSelectionScreen = React.lazy(() =>
    import('../screens/Auth/TenantSelectionScreen').then((module) => ({
        default: module.TenantSelectionScreen,
    })),
)

const RoleSelectionScreen = React.lazy(() =>
    import('../screens/Auth/RoleSelectionScreen').then((module) => ({
        default: module.RoleSelectionScreen,
    })),
)

const AgentSelectionScreen = React.lazy(() =>
    import('../screens/Auth/AgentSelectionScreen').then((module) => ({
        default: module.AgentSelectionScreen,
    })),
)
//#endregion lazy screens

//#region route helpers
function SuspenseRoute({ children }: { children: React.ReactNode }) {
    return (
        <React.Suspense
            fallback={
                <div className="flex items-center justify-center py-24">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                </div>
            }
        >
            {children}
        </React.Suspense>
    )
}

function lazyRoute(LazyComponent: React.LazyExoticComponent<React.ComponentType>) {
    return function LazyRouteWrapper() {
        return (
            <SuspenseRoute>
                <LazyComponent />
            </SuspenseRoute>
        )
    }
}
//#endregion route helpers

//#region router
export const router = createBrowserRouter([
    {
        path: '/auth/login',
        Component: LoginScreen,
        ErrorBoundary: ErrorBoundaryScreen,
    },
    {
        path: '/auth/register',
        Component: RegisterScreen,
        ErrorBoundary: ErrorBoundaryScreen,
    },
    {
        path: '/auth/activate',
        Component: ActivationScreen,
        ErrorBoundary: ErrorBoundaryScreen,
    },
    {
        path: '/auth/forgot-password',
        Component: ForgotPasswordScreen,
        ErrorBoundary: ErrorBoundaryScreen,
    },
    {
        path: '/auth/reset-password',
        Component: ResetPasswordScreen,
        ErrorBoundary: ErrorBoundaryScreen,
    },
    {
        path: '/auth/session-required',
        Component: SessionRequiredScreen,
        ErrorBoundary: ErrorBoundaryScreen,
    },
    {
        Component: AuthFlowGuard,
        ErrorBoundary: ErrorBoundaryScreen,
        children: [
            {
                path: '/auth/select-tenant',
                Component: lazyRoute(TenantSelectionScreen),
            },
            {
                path: '/auth/select-role',
                Component: lazyRoute(RoleSelectionScreen),
            },
            {
                path: '/auth/select-agent',
                Component: lazyRoute(AgentSelectionScreen),
            },
        ],
    },
    {
        path: '/',
        Component: ProtectedAdminLayout,
        ErrorBoundary: ErrorBoundaryScreen,
        children: [
            {
                index: true,
                Component: lazyRoute(WorkplacePage),
            },
            {
                path: 'stats',
                Component: lazyRoute(StatsPage),
            },
            {
                path: '*',
                Component: NotFoundScreen,
            },
        ],
    },
])
//#endregion router
