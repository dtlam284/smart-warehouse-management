import type { RootState } from '@/store/store'

//#region selectors
export const selectNotifications = (state: RootState) => state.notification.items
//#endregion selectors
