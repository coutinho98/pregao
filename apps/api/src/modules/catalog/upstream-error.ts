/** A failed call to the external catalog. `status` is null for network errors and timeouts. */
export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'UpstreamError';
  }

  get retryable(): boolean {
    return this.status === null || this.status === 429 || this.status >= 500;
  }
}

export function isRetryableUpstreamError(error: unknown): boolean {
  return error instanceof UpstreamError && error.retryable;
}
