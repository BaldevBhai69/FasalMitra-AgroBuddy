import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiError } from './api-error';
import { logger } from './logger';
import { ApiResponse } from '@/types/api.types';

export function handleApiError(error: unknown, req?: Request): NextResponse<ApiResponse> {
  const requestId = crypto.randomUUID();
  const path = req ? new URL(req.url).pathname : undefined;
  const method = req?.method;

  // 1. Operational ApiError instance
  if (error instanceof ApiError) {
    logger.warn(`API Error [${error.statusCode}]: ${error.message}`, {
      requestId,
      path,
      method,
      code: error.code,
      details: error.details,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: error.statusCode }
    );
  }

  // 2. Zod Schema Validation Error
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    logger.warn('Request validation failed', {
      requestId,
      path,
      method,
      validationErrors: formattedErrors,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed: Invalid request payload',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 400 }
    );
  }

  // 3. Unhandled runtime error (redact internals in response)
  logger.error('Unhandled server exception', error, {
    requestId,
    path,
    method,
  });

  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected internal server error occurred. Please try again.',
      code: 'INTERNAL_SERVER_ERROR',
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status: 500 }
  );
}
