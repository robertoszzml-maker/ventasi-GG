export class ApiError extends Error {
    status: number
    body?: any

    constructor(message: string, status: number, body?: any) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.body = body
    }
}
