export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code: string = 'API_ERROR',
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, code: string = 'BAD_REQUEST', details?: unknown) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message: string = 'Authentication required', code: string = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }

  static forbidden(message: string = 'Permission denied', code: string = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }

  static notFound(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static conflict(message: string, code: string = 'CONFLICT') {
    return new ApiError(409, message, code);
  }

  static rateLimit(message: string = 'Rate limit exceeded. Please slow down.', code: string = 'RATE_LIMIT_EXCEEDED') {
    return new ApiError(429, message, code);
  }

  static internal(message: string = 'Internal server error occurred', code: string = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    return new ApiError(500, message, code, details, false);
  }
}
