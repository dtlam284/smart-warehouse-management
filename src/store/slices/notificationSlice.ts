import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

//#region types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface IAppNotification {
    id: string
    type: NotificationType
    message: string
}

interface INotificationState {
    items: IAppNotification[]
}

interface IShowNotificationPayload {
    type: NotificationType
    message: string
}
//#endregion types

//#region states
const initialState: INotificationState = {
    items: [],
}
//#endregion states

//#region helpers
function createNotificationId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
//#endregion helpers

//#region slice
const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        showNotification(state, action: PayloadAction<IShowNotificationPayload>) {
            state.items.push({
                id: createNotificationId(),
                type: action.payload.type,
                message: action.payload.message,
            })
        },

        dismissNotification(state, action: PayloadAction<string>) {
            state.items = state.items.filter((item) => item.id !== action.payload)
        },

        clearNotifications(state) {
            state.items = []
        },
    },
})
//#endregion slice

//#region exports
export const { clearNotifications, dismissNotification, showNotification } =
    notificationSlice.actions

export default notificationSlice.reducer
//#endregion exports
