import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from './apiError'

const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
        return error.message
    }

    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }

    return 'Unexpected error'
}

const shouldSuppressToast = (error: unknown): boolean =>
    error instanceof ApiError && error.status === 401

const notifyError = (error: unknown): void => {
    if (shouldSuppressToast(error)) {
        return
    }

    toast.error(getErrorMessage(error))
}

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => notifyError(error),
    }),
    mutationCache: new MutationCache({
        onError: (error) => notifyError(error),
    }),
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                    return false
                }

                return failureCount < 1
            },
        },
        mutations: {
            retry: false,
        },
    },
})
