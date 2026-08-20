import { ApiResponse } from '@/types/api.types';

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Universal Typed API Client Fetcher for FasalMitra Frontend
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Automatically passes Supabase Auth cookies
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success || json.data === undefined) {
    const code = json.code || 'HTTP_ERROR';
    const message = json.error || response.statusText || 'An unexpected error occurred';
    throw new ApiClientError(code, message, response.status, json.details);
  }

  return json.data;
}
