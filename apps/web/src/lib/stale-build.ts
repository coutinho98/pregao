const RELOADED_AT_KEY = 'pregao:stale-build-reload';
/** A second failure this soon after reloading means the file is really missing: stop retrying. */
const RETRY_WINDOW_MS = 10_000;

/**
 * Each deploy replaces the hashed chunks, so a tab opened before it fails to load a lazy
 * page ("error loading dynamically imported module"). Vite reports it as `vite:preloadError`;
 * reloading fetches the new index.html and its current chunks, landing on the same URL.
 */
export function reloadOnStaleBuild() {
  window.addEventListener('vite:preloadError', (event) => {
    const now = Date.now();
    if (now - readReloadedAt() < RETRY_WINDOW_MS) return;
    event.preventDefault();
    try {
      sessionStorage.setItem(RELOADED_AT_KEY, String(now));
    } catch {
      // Without storage the guard is lost, but a reload is still the right recovery.
    }
    window.location.reload();
  });
}

function readReloadedAt() {
  try {
    return Number(sessionStorage.getItem(RELOADED_AT_KEY) ?? 0);
  } catch {
    return 0;
  }
}
