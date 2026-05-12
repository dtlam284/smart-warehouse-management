import React from 'react'
import { Button } from '../../components/ui/button'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export function NotFoundScreen() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[600px]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Module Not Found</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
                The admin module you are looking for does not exist or you do not have the required
                permissions to view it.
            </p>
            <Button asChild className="gap-2">
                <a href="/">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </a>
            </Button>
        </div>
    )
}
