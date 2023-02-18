import HTTP_STATUS from 'http-status-codes';

export interface IError {
    message: string;
    code: number;
    status: string;
}

export interface IErrorResponse {
    message: string;
    code: number;
    status: string;
    serializeErrors(): IError;
}

export abstract class CustomError extends Error {
    abstract code: number;
    abstract status: string;

    constructor(message: string) {
        super(message);
    }

    serializeErrors(): IError {
        return {
            message: this.message,
            status: this.status,
            code: this.code
        };
    }
}

export class BadRequestError extends CustomError {
    code = HTTP_STATUS.BAD_REQUEST;
    status = "Error";

    constructor(message: string) {
        super(message);
    }
}

export class NotFoundError extends CustomError {
    code = HTTP_STATUS.UNAUTHORIZED;
    status = "Error";

    constructor(message: string) {
        super(message);
    }
}

export class FileTooLargeError extends CustomError {
    code = HTTP_STATUS.SERVICE_UNAVAILABLE;
    status = "Error";

    constructor(message: string) {
        super(message);
    }
}

export class JoiRequestValidationError extends CustomError {
    code = HTTP_STATUS.BAD_REQUEST;
    status = "Error";

    constructor(message: string) {
        super(message);
    }
}

export class ServerError extends CustomError {
    code = HTTP_STATUS.SERVICE_UNAVAILABLE;
    status = "Error";

    constructor(message: string) {
        super(message);
    }
}

export class NotAuthorizedError extends CustomError {
    code = HTTP_STATUS.UNAUTHORIZED;
    status = "Error";

    constructor(message: string) {
        super(message);
    }
}