export class ApiError<TPayload = unknown> extends Error {
    readonly status: number
    readonly payload: TPayload
    readonly url: string

    constructor(message: string, status: number, url: string, payload: TPayload) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.url = url
        this.payload = payload
    }
}
