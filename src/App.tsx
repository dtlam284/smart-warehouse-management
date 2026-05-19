import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router'
import { PersistGate } from 'redux-persist/integration/react'
import { AuthProvider } from './contexts/AuthContext'
import { I18nProvider } from './contexts/I18nContext'
import { router } from './navigators/AppNavigator'
import { ThemeProvider } from './hooks/useTheme'
import { queryClient } from './services/core'
import { Toaster } from './components/ui/sonner'
import { Button, Spinner } from './components/ui'
import { persistor, store, useAppDispatch, useAppSelector } from './store'
import { selectIsLoadingWarehouseConfig, selectWarehouseConfigError } from './store/selectors/warehouseSelectors'
import { loadShippingProviders, loadWarehouseConfig } from './store/slices/warehouseSlice'

//#region helpers
function isAuthRoute(): boolean {
    return window.location.pathname.startsWith('/auth')
}
//#endregion helpers

//#region screens
function AppSplashScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    <Spinner size="md" />
                </div>

                <h1 className="mt-4 text-lg font-black text-slate-900">
                    Đang tải cấu hình kho
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Vui lòng chờ trong giây lát...
                </p>
            </div>
        </div>
    )
}

function AppInitErrorScreen({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
                    ⚠️
                </div>

                <h1 className="mt-4 text-lg font-black text-slate-900">
                    Không thể tải cấu hình kho
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Không thể tải cấu hình kho. Vui lòng thử lại.
                </p>

                <Button className="mt-5" onClick={onRetry}>
                    Thử lại
                </Button>
            </div>
        </div>
    )
}
//#endregion screens

//#region bootstrap
function AppBootstrap() {
    const dispatch = useAppDispatch()

    const isLoadingConfig = useAppSelector(selectIsLoadingWarehouseConfig)
    const configError = useAppSelector(selectWarehouseConfigError)

    const shouldSkipWarehouseBootstrap = isAuthRoute()

    React.useEffect(() => {
        if (shouldSkipWarehouseBootstrap) {
            return
        }

        void dispatch(loadWarehouseConfig())
        void dispatch(loadShippingProviders(undefined))
    }, [dispatch, shouldSkipWarehouseBootstrap])

    const handleRetry = () => {
        void dispatch(loadWarehouseConfig())
        void dispatch(loadShippingProviders(undefined))
    }

    if (!shouldSkipWarehouseBootstrap && isLoadingConfig) {
        return <AppSplashScreen />
    }

    if (!shouldSkipWarehouseBootstrap && configError) {
        return <AppInitErrorScreen onRetry={handleRetry} />
    }

    return (
        <>
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors closeButton />
        </>
    )
}
//#endregion bootstrap

//#region app
export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={<AppSplashScreen />} persistor={persistor}>
                <I18nProvider>
                    <ThemeProvider defaultTheme="light" storageKey="app-theme">
                        <QueryClientProvider client={queryClient}>
                            <AuthProvider>
                                <AppBootstrap />
                            </AuthProvider>
                        </QueryClientProvider>
                    </ThemeProvider>
                </I18nProvider>
            </PersistGate>
        </Provider>
    )
}
//#endregion app
