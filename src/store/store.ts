import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import appReducer from './slices/appSlice'
import authReducer from './slices/authSlice'
import warehouseReducer from './slices/warehouseSlice'
import packingReducer from './slices/packingSlice'
import handoverReducer from './slices/handoverSlice'
import returnReducer from './slices/returnSlice'
import notificationReducer from '@/store/slices/notificationSlice'

//#region config & root reducer
const persistConfig = {
    key: 'wh-packaging-root',
    storage,
    whitelist: ['auth', 'app'],
}

const rootReducer = combineReducers({
    app: appReducer,
    auth: authReducer,
    warehouse: warehouseReducer,
    packing: packingReducer,
    handover: handoverReducer,
    returnDelivery: returnReducer,
    notification: notificationReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'persist/PAUSE',
                    'persist/PURGE',
                    'persist/REGISTER',
                    'persist/FLUSH',
                ],
            },
        }),
    devTools: import.meta.env.DEV,
})
//#endregion config & root reducer

//#region exports
export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
//#endregion exports
