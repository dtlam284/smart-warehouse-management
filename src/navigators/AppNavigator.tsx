import React from "react"
import { createBrowserRouter } from "react-router"
import { ProtectedAdminLayout } from "./ProtectedAdminLayout"
import { ErrorBoundaryScreen } from "../screens/ErrorBoundaryScreen"

// Static imports for critical auth paths (must load immediately)
import { LoginScreen } from "../screens/Auth/LoginScreen"
import { RegisterScreen } from "../screens/Auth/RegisterScreen"
import { ActivationScreen } from "@/screens/Auth/ActivationScreen"
import { ResetPasswordScreen } from "@/screens/Auth/ResetPasswordScreen"
import { ForgotPasswordScreen } from "@/screens/Auth/ForgotPasswordScreen"
import { SessionRequiredScreen } from "../screens/Auth/SessionRequiredScreen"
import { NotFoundScreen } from "../screens/NotFound/NotFoundScreen"

// Lazy-loaded screen components for code splitting
const DashboardScreen = React.lazy(() =>
  import("../screens/Dashboard/DashboardScreen").then((m) => ({ default: m.DashboardScreen })),
)

/**
 * Suspense wrapper for lazy-loaded route components.
 * Shows a minimal loading spinner while the chunk downloads.
 */
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

/**
 * Wraps a lazy component in Suspense for use in route config.
 */
function lazyRoute(LazyComponent: React.LazyExoticComponent<React.ComponentType>) {
  return function LazyRouteWrapper() {
    return (
      <SuspenseRoute>
        <LazyComponent />
      </SuspenseRoute>
    )
  }
}

export const router = createBrowserRouter([
  {
    path: "/auth/login",
    Component: LoginScreen,
    ErrorBoundary: ErrorBoundaryScreen,
  },
  {
    path: "/auth/register",
    Component: RegisterScreen,
    ErrorBoundary: ErrorBoundaryScreen,
  },
  {
    path: "/auth/session-required",
    Component: SessionRequiredScreen,
    ErrorBoundary: ErrorBoundaryScreen,
  },
  {
    path: "/auth/activate",
    Component: ActivationScreen,
    ErrorBoundary: ErrorBoundaryScreen,
  },
  {
    path: "/auth/reset-password",
    Component: ResetPasswordScreen,
    ErrorBoundary: ErrorBoundaryScreen,
  },
  {
    path: "/auth/forgot-password",
    Component: ForgotPasswordScreen,
    ErrorBoundary: ErrorBoundaryScreen,
  },
  {
    path: "/",
    Component: ProtectedAdminLayout,
    ErrorBoundary: ErrorBoundaryScreen,
    children: [
      { index: true, Component: lazyRoute(DashboardScreen) },
      { path: "*", Component: NotFoundScreen },
    ],
  },
])
