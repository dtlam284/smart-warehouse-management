//#region helpers
function normalizeMessageKey(message: string): string {
    return message.trim().toLowerCase().replace(/\s+/g, ' ')
}

function translateApiErrorMessage(message: string): string {
    const normalizedMessage = normalizeMessageKey(message)

    const messageMap: Record<string, string> = {
        'invalid request data': 'Dữ liệu yêu cầu không hợp lệ',
        'invalid request': 'Yêu cầu không hợp lệ',
        'validation error': 'Dữ liệu không hợp lệ',
        'one or more validation errors occurred.': 'Dữ liệu yêu cầu không hợp lệ',
        'bad request': 'Yêu cầu không hợp lệ',
        'unauthorized': 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
        'forbidden': 'Bạn không có quyền thực hiện thao tác này',
        'not found': 'Không tìm thấy dữ liệu',
        'internal server error': 'Lỗi hệ thống, vui lòng thử lại sau',
    }

    return messageMap[normalizedMessage] ?? message
}
//#endregion helpers

//#region error
export class ApiError<TPayload = unknown> extends Error {
    readonly status: number
    readonly payload: TPayload
    readonly url: string
    readonly originalMessage: string

    constructor(message: string, status: number, url: string, payload: TPayload) {
        super(translateApiErrorMessage(message))

        this.name = 'ApiError'
        this.status = status
        this.url = url
        this.payload = payload
        this.originalMessage = message
    }
}
//#endregion error
