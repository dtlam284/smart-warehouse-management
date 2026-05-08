import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface IAppState {
  initialized: boolean
  pageTitle: string
  isSidebarCollapsed: boolean
}

const initialState: IAppState = {
  initialized: false,
  pageTitle: '',
  isSidebarCollapsed: false,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload
    },
    setPageTitle(state, action: PayloadAction<string>) {
      state.pageTitle = action.payload
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.isSidebarCollapsed = action.payload
    },
  },
})

export const { setInitialized, setPageTitle, setSidebarCollapsed } = appSlice.actions
export default appSlice.reducer
