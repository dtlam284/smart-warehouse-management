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
import { persistor, store } from './store'

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <I18nProvider>
                    <ThemeProvider defaultTheme="light" storageKey="app-theme">
                        <QueryClientProvider client={queryClient}>
                            <AuthProvider>
                                <RouterProvider router={router} />
                                <Toaster position="top-right" richColors closeButton />
                            </AuthProvider>
                        </QueryClientProvider>
                    </ThemeProvider>
                </I18nProvider>
            </PersistGate>
        </Provider>
    )
}
