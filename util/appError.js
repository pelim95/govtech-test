export class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Not Found') {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Invalid input') {
        super(message, 400);
    }
}

export class DatabaseError extends AppError {
    constructor(err) {
        super('Database operation failed', 500, err?.message);
    }
}
