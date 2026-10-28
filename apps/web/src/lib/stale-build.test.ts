import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reloadOnStaleBuild } from './stale-build';

const RELOADED_AT_KEY = 'pregao:stale-build-reload';

describe('reloadOnStaleBuild', () => {
  const reload = vi.fn();
  const storage = new Map<string, string>();
  let target: EventTarget;

  function firePreloadError() {
    const event = new Event('vite:preloadError', { cancelable: true });
    target.dispatchEvent(event);
    return event;
  }

  beforeEach(() => {
    target = new EventTarget();
    vi.stubGlobal('window', Object.assign(target, { location: { reload } }));
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    reloadOnStaleBuild();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    storage.clear();
    reload.mockReset();
  });

  it('reloads the page instead of letting the chunk error surface', () => {
    const event = firePreloadError();

    expect(reload).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
    expect(storage.has(RELOADED_AT_KEY)).toBe(true);
  });

  it('lets the error through when it repeats right after a reload', () => {
    storage.set(RELOADED_AT_KEY, String(Date.now()));

    const event = firePreloadError();

    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
