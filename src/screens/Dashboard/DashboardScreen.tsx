import { LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function DashboardScreen() {
    const { user } = useAuth()

    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                <LayoutDashboard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Welcome{user ? `, ${user.firstName}` : ''}
            </h1>
            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                This is the CMS dashboard. Add new screens and features as needed.
            </p>
        </div>
    )
}
