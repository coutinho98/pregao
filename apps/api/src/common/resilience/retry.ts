interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  shouldRetry: (error: unknown) => boolean;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Retries transient failures with exponential backoff: base, 2×base, 4×base… */
export async function withRetry<T>(
  action: () => Promise<T>,
  { retries, baseDelayMs, shouldRetry, sleep = defaultSleep }: RetryOptions,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await action();
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) throw error;
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }
}
