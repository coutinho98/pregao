import { ApiError } from './http';

/** Message to show for a failed request: the API's own message when there is one. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Algo deu errado. Tente de novo.';
}
