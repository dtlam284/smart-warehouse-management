import { API_ENDPOINTS } from '@/constants/api'
import { ApiError } from './apiError'
import type {
    ApiRecord,
    IAuthTokens,
    ILoginResponse,
    QueryParams,
    QueryValue,
    ITokenStorage,
} from './types'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface IRequestOptions {
    body?: unknown
    headers?: HeadersInit
    query?: QueryParams
    requiresAuth?: boolean
    signal?: AbortSignal
    timeoutMs?: number
    retryOnUnauthorized?: boolean

    /**
     * Use a specific access token for one request.
     * Example: logout must use the original login/root token,
     * not the current tenant/function/workgroup token.
     */
    authToken?: string | null

    /**
     * Skip attaching Authorization completely.
     */
    skipAuth?: boolean
}

export interface IHttpClientOptions {
    baseUrl: string
    timeoutMs: number
    tokenStorage: ITokenStorage
    refreshPath?: string
}

interface IBackendApiEnvelope<TData = unknown> {
    Code?: number
    Message?: string
    Detail?: unknown
    Data?: TData
}

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value)

const ensureLeadingSlash = (value: string): string =>
    value.startsWith('/') ? value : `/${value}`

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

const getRuntimeOrigin = (): string => {
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin
    }

    return 'http://localhost'
}

const normalizeQueryValue = (value: Exclude<QueryValue, ApiRecord>): string => {
    if (value instanceof Date) {
        return value.toISOString()
    }

    return String(value)
}

const appendQueryParam = (
    searchParams: URLSearchParams,
    key: string,
    value: QueryValue,
): void => {
    if (value === undefined || value === null) {
        return
    }

    if (Array.isArray(value)) {
        value
            .filter((entry) => entry !== undefined && entry !== null)
            .forEach((entry) => {
                if (entry instanceof Date) {
                    searchParams.append(key, entry.toISOString())
                    return
                }

                if (typeof entry === 'object') {
                    searchParams.append(key, JSON.stringify(entry))
                    return
                }

                searchParams.append(key, normalizeQueryValue(entry))
            })

        return
    }

    if (value instanceof Date) {
        searchParams.append(key, value.toISOString())
        return
    }

    if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value))
        return
    }

    searchParams.append(key, normalizeQueryValue(value))
}

const resolveUrl = (baseUrl: string, path: string, query?: QueryParams): URL => {
    const url = isAbsoluteUrl(path)
        ? new URL(path)
        : new URL(
              `${stripTrailingSlash(baseUrl)}${ensureLeadingSlash(path)}`,
              getRuntimeOrigin(),
          )

    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            appendQueryParam(url.searchParams, key, value)
        })
    }

    return url
}

const mergeSignals = (
    timeoutMs: number,
    externalSignal?: AbortSignal,
): { signal: AbortSignal; cleanup: () => void } => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const onAbort = (): void => controller.abort()
    externalSignal?.addEventListener('abort', onAbort)

    return {
        signal: controller.signal,
        cleanup: () => {
            clearTimeout(timeoutId)
            externalSignal?.removeEventListener('abort', onAbort)
        },
    }
}

const isJsonLikeBody = (value: unknown): boolean => {
    if (!value) {
        return false
    }

    if (typeof FormData !== 'undefined' && value instanceof FormData) {
        return false
    }

    if (typeof Blob !== 'undefined' && value instanceof Blob) {
        return false
    }

    if (value instanceof URLSearchParams) {
        return false
    }

    return true
}

const parseResponseBody = async (response: Response): Promise<unknown> => {
    const text = await response.text()

    if (!text) {
        return null
    }

    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

const isBackendApiEnvelope = (payload: unknown): payload is IBackendApiEnvelope => {
    if (!payload || typeof payload !== 'object') {
        return false
    }

    const bag = payload as ApiRecord

    return typeof bag.Code === 'number'
}

const extractErrorMessage = (payload: unknown, fallback: string): string => {
    if (!payload || typeof payload !== 'object') {
        return fallback
    }

    const bag = payload as ApiRecord

    if (typeof bag.message === 'string' && bag.message.trim().length > 0) {
        return bag.message
    }

    if (typeof bag.Message === 'string' && bag.Message.trim().length > 0) {
        return bag.Message
    }

    if (typeof bag.error === 'string' && bag.error.trim().length > 0) {
        return bag.error
    }

    if (typeof bag.Detail === 'string' && bag.Detail.trim().length > 0) {
        return bag.Detail
    }

    if (bag.errors && typeof bag.errors === 'object') {
        return 'Validation error'
    }

    return fallback
}

const normalizeBackendPayload = (
    payload: unknown,
    status: number,
    url: string,
): unknown => {
    if (!isBackendApiEnvelope(payload)) {
        return payload
    }

    if (typeof payload.Code === 'number' && payload.Code < 0) {
        throw new ApiError(
            extractErrorMessage(payload, 'Request failed'),
            status,
            url,
            payload,
        )
    }

    if ('Data' in payload && payload.Data !== undefined && payload.Data !== null) {
        return payload.Data
    }

    return payload
}

const isRefreshResponse = (payload: unknown): payload is ILoginResponse => {
    if (!payload || typeof payload !== 'object') {
        return false
    }

    const bag = payload as ApiRecord

    return typeof bag.token === 'string' && typeof bag.refreshToken === 'string'
}

export class HttpClient {
    private readonly baseUrl: string
    private readonly timeoutMs: number
    private readonly tokenStorage: ITokenStorage
    private readonly refreshPath: string
    private refreshPromise: Promise<string | null> | null = null

    constructor(options: IHttpClientOptions) {
        this.baseUrl = options.baseUrl
        this.timeoutMs = options.timeoutMs
        this.tokenStorage = options.tokenStorage
        this.refreshPath = options.refreshPath ?? API_ENDPOINTS.auth.refresh
    }

    get tokens(): IAuthTokens | null {
        return this.tokenStorage.getTokens()
    }

    setTokens(tokens: IAuthTokens): void {
        this.tokenStorage.setTokens(tokens)
    }

    clearTokens(): void {
        this.tokenStorage.clearTokens()
    }

    async get<TResponse>(
        path: string,
        options: Omit<IRequestOptions, 'body'> = {},
    ): Promise<TResponse> {
        return this.request<TResponse>('GET', path, options)
    }

    async post<TResponse>(
        path: string,
        body?: unknown,
        options: Omit<IRequestOptions, 'body'> = {},
    ): Promise<TResponse> {
        return this.request<TResponse>('POST', path, { ...options, body })
    }

    async patch<TResponse>(
        path: string,
        body?: unknown,
        options: Omit<IRequestOptions, 'body'> = {},
    ): Promise<TResponse> {
        return this.request<TResponse>('PATCH', path, { ...options, body })
    }

    async put<TResponse>(
        path: string,
        body?: unknown,
        options: Omit<IRequestOptions, 'body'> = {},
    ): Promise<TResponse> {
        return this.request<TResponse>('PUT', path, { ...options, body })
    }

    async delete<TResponse>(
        path: string, 
        options?: IRequestOptions
    ): Promise<TResponse> {
        return this.request<TResponse>('DELETE', path, options)
    }

    async request<TResponse>(
        method: HttpMethod,
        path: string,
        options: IRequestOptions = {},
    ): Promise<TResponse> {
        const requiresAuth = options.requiresAuth ?? true
        const retryOnUnauthorized = options.retryOnUnauthorized ?? true

        const url = resolveUrl(this.baseUrl, path, options.query)
        const timeoutMs = options.timeoutMs ?? this.timeoutMs
        const { signal, cleanup } = mergeSignals(timeoutMs, options.signal)

        const headers = new Headers(options.headers)
        const tokens = this.tokenStorage.getTokens()
        const explicitAuthToken = options.authToken
        const shouldSkipAuth = options.skipAuth === true

        if (explicitAuthToken) {
            headers.set('Authorization', `Bearer ${explicitAuthToken}`)
        } else if (
            requiresAuth &&
            !shouldSkipAuth &&
            tokens?.accessToken &&
            !headers.has('Authorization')
        ) {
            headers.set('Authorization', `Bearer ${tokens.accessToken}`)
        }

        let body: BodyInit | undefined

        if (options.body !== undefined) {
            if (isJsonLikeBody(options.body)) {
                body = JSON.stringify(options.body)

                if (!headers.has('Content-Type')) {
                    headers.set('Content-Type', 'application/json')
                }
            } else {
                body = options.body as BodyInit
            }
        }

        try {
            const response = await fetch(url, {
                method,
                headers,
                body,
                signal,
            })

            if (
                response.status === 401 &&
                requiresAuth &&
                !shouldSkipAuth &&
                retryOnUnauthorized &&
                path !== this.refreshPath &&
                !explicitAuthToken
            ) {
                const refreshedToken = await this.tryRefreshToken()

                if (refreshedToken) {
                    return this.request<TResponse>(method, path, {
                        ...options,
                        retryOnUnauthorized: false,
                    })
                }
            }

            const payload = await parseResponseBody(response)

            if (!response.ok) {
                const defaultMessage = `HTTP ${response.status} ${response.statusText}`

                throw new ApiError(
                    extractErrorMessage(payload, defaultMessage),
                    response.status,
                    url.toString(),
                    payload,
                )
            }

            return normalizeBackendPayload(
                payload,
                response.status,
                url.toString(),
            ) as TResponse
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }

            if (error instanceof Error && error.name === 'AbortError') {
                throw new ApiError(
                    'Request timeout or aborted',
                    408,
                    url.toString(),
                    null,
                )
            }

            throw new ApiError('Network request failed', 0, url.toString(), error)
        } finally {
            cleanup()
        }
    }

    private async tryRefreshToken(): Promise<string | null> {
        const existing = this.tokenStorage.getTokens()

        if (!existing?.refreshToken) {
            this.tokenStorage.clearTokens()
            return null
        }

        if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken(existing.refreshToken).finally(
                () => {
                    this.refreshPromise = null
                },
            )
        }

        return this.refreshPromise
    }

    private async refreshAccessToken(refreshToken: string): Promise<string | null> {
        const url = resolveUrl(this.baseUrl, this.refreshPath)

        const { signal, cleanup } = mergeSignals(this.timeoutMs)

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${refreshToken}`,
                },
                body: JSON.stringify({ refreshToken }),
                signal,
            })

            const payload = await parseResponseBody(response)

            if (!response.ok) {
                this.tokenStorage.clearTokens()
                return null
            }

            const normalizedPayload = normalizeBackendPayload(
                payload,
                response.status,
                url.toString(),
            )

            if (!isRefreshResponse(normalizedPayload)) {
                this.tokenStorage.clearTokens()
                return null
            }

            this.tokenStorage.setTokens({
                accessToken: normalizedPayload.token,
                refreshToken: normalizedPayload.refreshToken,
                tokenExpires: normalizedPayload.tokenExpires,
            })

            return normalizedPayload.token
        } catch {
            this.tokenStorage.clearTokens()
            return null
        } finally {
            cleanup()
        }
    }
}
