import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'pregao.token';
const listeners = new Set<() => void>();

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

let token = readStoredToken();

export function getToken(): string | null {
  return token;
}

export function setToken(next: string | null): void {
  token = next;
  try {
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode): the session lives only in memory.
  }
  listeners.forEach((notify) => notify());
}

/** Called on login and logout; returns the unsubscribe function. */
export function onTokenChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useToken(): string | null {
  return useSyncExternalStore(onTokenChange, getToken);
}
