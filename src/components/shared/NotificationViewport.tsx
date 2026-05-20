import * as React from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectNotifications } from '@/store/selectors/notificationSelectors'
import { dismissNotification } from '@/store/slices/notificationSlice'

//#region constants
const NOTIFICATION_DURATION_MS = 5000
//#endregion constants

//#region helpers
function getNotificationClass(type: string): string {
    switch (type) {
        case 'success':
            return 'border-green-300 bg-green-50 text-green-800'

        case 'error':
            return 'border-red-300 bg-red-50 text-red-800'

        case 'warning':
            return 'border-amber-300 bg-amber-50 text-amber-800'

        case 'info':
            return 'border-blue-300 bg-blue-50 text-blue-800'

        default:
            return 'border-slate-300 bg-white text-slate-800'
    }
}

function getIconClass(type: string): string {
    switch (type) {
        case 'success':
            return 'text-green-600'

        case 'error':
            return 'text-red-600'

        case 'warning':
            return 'text-amber-600'

        case 'info':
            return 'text-blue-600'

        default:
            return 'text-slate-600'
    }
}

function NotificationIcon({ type }: { type: string }) {
    const className = cn('mt-0.5 h-8 w-8 shrink-0', getIconClass(type))

    switch (type) {
        case 'success':
            return <CheckCircle2 className={className} />

        case 'error':
            return <XCircle className={className} />

        case 'warning':
            return <AlertTriangle className={className} />

        case 'info':
            return <Info className={className} />

        default:
            return <Info className={className} />
    }
}
//#endregion helpers

//#region item
function NotificationItem({
    id,
    type,
    message,
}: {
    id: string
    type: string
    message: string
}) {
    const dispatch = useAppDispatch()

    React.useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            dispatch(dismissNotification(id))
        }, NOTIFICATION_DURATION_MS)

        return () => window.clearTimeout(timeoutId)
    }, [dispatch, id])

    return (
        <button
            type="button"
            onClick={() => dispatch(dismissNotification(id))}
            className={cn(
                'flex w-full items-start gap-4 rounded-2xl border-2 px-8 py-6 text-left text-xl font-black shadow-2xl transition hover:opacity-90',
                getNotificationClass(type),
            )}
        >
            <NotificationIcon type={type} />
            <span className="leading-8">{message}</span>
        </button>
    )
}
//#endregion item

//#region component
export function NotificationViewport() {
    const notifications = useAppSelector(selectNotifications)
    const latestNotification = notifications.at(-1)

    if (!latestNotification) {
        return null
    }

    return (
        <div className="pointer-events-none fixed left-1/2 top-16 z-50 flex w-[min(900px,calc(100vw-32px))] -translate-x-1/2 flex-col items-stretch gap-4">
            <div className="pointer-events-auto">
                <NotificationItem
                    id={latestNotification.id}
                    type={latestNotification.type}
                    message={latestNotification.message}
                />
            </div>
        </div>
    )
}
//#endregion component
