import { useNavigate, useRouteError } from 'react-router'
import { Button } from '../components/ui/button'

const toErrorMessage = (error: unknown): string => {
    if (!error) {
        return 'Unexpected error'
    }

    if (typeof error === 'string') {
        return error
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message
    }

    if (typeof error === 'object' && 'statusText' in error) {
        const statusText = String((error as { statusText?: unknown }).statusText ?? '')
        if (statusText.trim()) {
            return statusText
        }
    }

    return 'Unexpected error'
}

export function ErrorBoundaryScreen() {
    const navigate = useNavigate()
    const error = useRouteError()
    const message = toErrorMessage(error)

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
                <p className="text-sm text-slate-600">{message}</p>
                <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={() => navigate(0)}>Reload</Button>
                    <Button variant="outline" onClick={() => navigate('/', { replace: true })}>
                        Back to dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}
