import React from 'react'
import { ShieldAlert } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

//#region session required screen
export function SessionRequiredScreen() {
    //#region hooks
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { refreshProfile } = useAuth()
    const [isChecking, setIsChecking] = React.useState(false)
    //#endregion hooks

    //#region derived state
    const redirect = searchParams.get('redirect') || '/'
    const reason = searchParams.get('reason')
    //#endregion derived state

    //#region handlers
    const handleRetry = async () => {
        setIsChecking(true)

        try {
            const user = await refreshProfile()
            if (user) {
                navigate(redirect, { replace: true })
            }
        } finally {
            setIsChecking(false)
        }
    }
    //#endregion handlers

    //#region render
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
                {/*#region header */}
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <ShieldAlert className="h-6 w-6" />
                </div>

                <h1 className="text-xl font-semibold text-slate-900">
                    {reason === 'forbidden' ? 'Access denied' : 'Session required'}
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    {reason === 'forbidden'
                        ? 'Your account does not have admin access to this dashboard.'
                        : 'You need a valid admin session before using this dashboard.'}
                </p>
                {/*#endregion header */}

                {/*#region actions */}
                <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                    <Button onClick={handleRetry} disabled={isChecking} className="min-w-40">
                        {isChecking ? 'Checking...' : 'Retry session check'}
                    </Button>
                    {reason !== 'forbidden' ? (
                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`)
                            }
                        >
                            Go To Login
                        </Button>
                    ) : null}
                </div>
                {/*#endregion actions */}
            </div>
        </div>
    )
    //#endregion render
}
//#endregion session required screen
