// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * Application Error hierarchy — typed errors for the lifecycle system.
 * All thrown errors in lifecycle handlers should extend AppError.
 */

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    // Restore prototype chain (required for ES5 transpilation)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly details?: Record<string, string[]>
  ) {
    super('VALIDATION_ERROR', message, 422);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super('NOT_FOUND', id ? `${resource} with id "${id}" not found` : `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

export class ConcurrencyError extends AppError {
  constructor(resource: string) {
    super('CONCURRENCY_CONFLICT', `${resource} was modified by another request — please retry`, 409);
    this.name = 'ConcurrencyError';
  }
}
