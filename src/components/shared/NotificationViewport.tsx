import * as React from 'react'
import { cn } from '@/components/ui/utils'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectNotifications } from '@/store/selectors/notificationSelectors'
import { dismissNotification } from '@/store/slices/notificationSlice'

//#region helpers
function getNotificationClass(type: string): string {
    switch (type) {
        case 'success':
            return 'bg-green-600 text-white'

        case 'error':
            return 'bg-red-600 text-white'

        case 'warning':
            return 'bg-amber-500 text-white'

        case 'info':
            return 'bg-blue-600 text-white'

        default:
            return 'bg-slate-800 text-white'
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
        }, 3500)

        return () => window.clearTimeout(timeoutId)
    }, [dispatch, id])

    return (
        <button
            type="button"
            onClick={() => dispatch(dismissNotification(id))}
            className={cn(
                'min-w-[280px] max-w-[520px] rounded-full px-5 py-3 text-sm font-bold shadow-lg transition hover:opacity-90',
                getNotificationClass(type),
            )}
        >
            {message}
        </button>
    )
}
//#endregion item

//#region component
export function NotificationViewport() {
    const notifications = useAppSelector(selectNotifications)

    if (notifications.length === 0) {
        return null
    }

    return (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
            {notifications.map((notification) => (
                <div key={notification.id} className="pointer-events-auto">
                    <NotificationItem
                        id={notification.id}
                        type={notification.type}
                        message={notification.message}
                    />
                </div>
            ))}
        </div>
    )
}
//#endregion component
