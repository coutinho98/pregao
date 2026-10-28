import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function applyTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Preference just won't persist.
  }
  listeners.forEach((notify) => notify());
}

/**
 * Switches the theme. With the View Transitions API the new theme is painted over the page
 * in one brush stroke (the mask and its timing live in the CSS); browsers without it swap.
 */
function toggleTheme(): void {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  if (!document.startViewTransition) {
    applyTheme(next);
    return;
  }
  const root = document.documentElement;
  // Colours change at once while the stroke runs: the stroke is the transition.
  root.dataset.themeSwitching = '';
  const transition = document.startViewTransition(() => flushSync(() => applyTheme(next)));
  void transition.finished.finally(() => delete root.dataset.themeSwitching);
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  return { theme: useSyncExternalStore(subscribe, getTheme), toggleTheme };
}
