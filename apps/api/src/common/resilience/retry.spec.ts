import { describe, expect, it, vi } from 'vitest';
import { withRetry } from './retry.js';

describe('withRetry', () => {
  const noSleep = vi.fn(() => Promise.resolve());

  it('retries transient failures with exponential backoff', async () => {
    const sleep = vi.fn(() => Promise.resolve());
    const action = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValue('ok');

    await expect(
      withRetry(action, { retries: 2, baseDelayMs: 100, shouldRetry: () => true, sleep }),
    ).resolves.toBe('ok');
    expect(action).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls).toEqual([[100], [200]]);
  });

  it('gives up after the configured retries', async () => {
    const action = vi.fn(() => Promise.reject(new Error('down')));
    await expect(
      withRetry(action, { retries: 2, baseDelayMs: 1, shouldRetry: () => true, sleep: noSleep }),
    ).rejects.toThrow('down');
    expect(action).toHaveBeenCalledTimes(3);
  });

  it('does not retry errors that are not transient', async () => {
    const action = vi.fn(() => Promise.reject(new Error('bad request')));
    await expect(
      withRetry(action, { retries: 2, baseDelayMs: 1, shouldRetry: () => false, sleep: noSleep }),
    ).rejects.toThrow('bad request');
    expect(action).toHaveBeenCalledTimes(1);
  });
});
