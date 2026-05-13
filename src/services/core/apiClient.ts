import { env } from '@/config/env'
import { API_ENDPOINTS } from '@/constants/api'
import { HttpClient } from './httpClient'
import { tokenStorage } from './tokenStorage'

export const apiClient = new HttpClient({
    baseUrl: env.apiBaseUrl,
    timeoutMs: env.apiTimeoutMs,
    tokenStorage,
    refreshPath: API_ENDPOINTS.auth.refresh,
})

export const configApiClient = new HttpClient({
    baseUrl: env.configApiBaseUrl,
    timeoutMs: env.apiTimeoutMs,
    tokenStorage,
    refreshPath: API_ENDPOINTS.auth.refresh,
})
