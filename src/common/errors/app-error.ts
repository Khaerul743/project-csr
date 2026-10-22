export class AppError extends Error {
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(message: string, statusCode: number = 500, details?: unknown) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad Request", details?: unknown) {
        super(message, 400, details)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized", details?: unknown) {
        super(message, 401, details)
    }
}

export class ForBiddenError extends AppError {
    constructor(message: string = "Forbidden", details?: unknown) {
        super(message, 403, details)
    }
}
export { ForBiddenError as ForbiddenError };

export class NotFoundError extends AppError {
    constructor(message: string = "Resource Not Found", details?: unknown) {
        super(message, 404, details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Conflict", details?: unknown) {
        super(message, 409, details);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = "Internal Server Error", details?: unknown) {
        super(message, 500, details);
    }
}
