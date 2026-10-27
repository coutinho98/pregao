import { describe, expect, it, vi } from 'vitest';
import { CircuitBreaker, CircuitOpenError } from './circuit-breaker.js';

const fail = () => Promise.reject(new Error('upstream down'));
const succeed = () => Promise.resolve('ok');

describe('CircuitBreaker', () => {
  function setup() {
    let now = 0;
    const breaker = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 1_000 }, () => now);
    return { breaker, advance: (ms: number) => (now += ms) };
  }

  it('opens after consecutive failures and then fails fast without calling', async () => {
    const { breaker } = setup();
    for (let i = 0; i < 3; i++)
      await expect(breaker.execute(fail)).rejects.toThrow('upstream down');

    const action = vi.fn(succeed);
    await expect(breaker.execute(action)).rejects.toBeInstanceOf(CircuitOpenError);
    expect(action).not.toHaveBeenCalled();
  });

  it('a success resets the failure count', async () => {
    const { breaker } = setup();
    await expect(breaker.execute(fail)).rejects.toThrow();
    await expect(breaker.execute(fail)).rejects.toThrow();
    await breaker.execute(succeed);
    await expect(breaker.execute(fail)).rejects.toThrow();
    expect(breaker.isOpen).toBe(false);
  });

  it('lets a trial through after the cooldown and closes on success', async () => {
    const { breaker, advance } = setup();
    for (let i = 0; i < 3; i++) await expect(breaker.execute(fail)).rejects.toThrow();
    advance(1_000);
    await expect(breaker.execute(succeed)).resolves.toBe('ok');
    expect(breaker.isOpen).toBe(false);
  });

  it('reopens when the trial fails', async () => {
    const { breaker, advance } = setup();
    for (let i = 0; i < 3; i++) await expect(breaker.execute(fail)).rejects.toThrow();
    advance(1_000);
    await expect(breaker.execute(fail)).rejects.toThrow('upstream down');
    expect(breaker.isOpen).toBe(true);
  });
});
