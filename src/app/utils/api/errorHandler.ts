class ApiError extends Error {
    statusCode: number;
    errors: any[];
    success: boolean;

    constructor(statusCode: number, message: string = "An error occurs", errors: any[] = [], stack: string = '') {
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.errors = errors
        this.success = false

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }