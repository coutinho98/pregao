import { ErrorCode, type ApiErrorBody } from '@pregao/shared';
import { API_URL } from './env';
import { getToken, setToken } from './session';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody,
  ) {
    super(body.message);
    this.name = 'ApiError';
  }

  get code(): ErrorCode {
    return this.body.code;
  }
}

const NETWORK_ERROR: ApiErrorBody = {
  code: ErrorCode.INTERNAL_ERROR,
  message: 'Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.',
};

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'code' in value && 'message' in value;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function http<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR);
  }

  const payload: unknown = await response.json().catch(() => undefined);
  if (response.ok) return payload as T;

  if (response.status === 401 && token) setToken(null);
  throw new ApiError(response.status, isApiErrorBody(payload) ? payload : NETWORK_ERROR);
}
