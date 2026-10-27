export class CircuitOpenError extends Error {
  constructor() {
    super('Circuit is open');
    this.name = 'CircuitOpenError';
  }
}

interface CircuitBreakerOptions {
  /** Consecutive failures that open the circuit. */
  failureThreshold: number;
  /** How long to fail fast before letting a trial call through. */
  cooldownMs: number;
}

/**
 * Closed: calls pass. After `failureThreshold` consecutive failures it opens and fails fast
 * for `cooldownMs`; then the next call is a trial that closes it on success or reopens it.
 */
export class CircuitBreaker {
  private consecutiveFailures = 0;
  private openedAt: number | null = null;

  constructor(
    private readonly options: CircuitBreakerOptions,
    private readonly now: () => number = Date.now,
  ) {}

  get isOpen(): boolean {
    return this.openedAt !== null && this.now() - this.openedAt < this.options.cooldownMs;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.isOpen) throw new CircuitOpenError();
    try {
      const result = await action();
      this.consecutiveFailures = 0;
      this.openedAt = null;
      return result;
    } catch (error) {
      this.consecutiveFailures += 1;
      if (this.consecutiveFailures >= this.options.failureThreshold) this.openedAt = this.now();
      throw error;
    }
  }
}
