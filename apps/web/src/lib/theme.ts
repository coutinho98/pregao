import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { paintOver } from './paint-transition';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();
let painting = false;

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

/** The page background of `theme`, read from the CSS tokens without repainting the page. */
function themeBackground(theme: Theme): string {
  const root = document.documentElement;
  const current = root.dataset.theme;
  root.dataset.theme = theme;
  const color = getComputedStyle(root).getPropertyValue('--bg').trim();
  if (current) root.dataset.theme = current;
  else delete root.dataset.theme;
  return color;
}

/**
 * Switches the theme by painting the new background over the screen with a brush, top to
 * bottom, then swapping the theme under the paint. With reduced motion it just swaps.
 */
function toggleTheme(): void {
  if (painting) return;
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme(next);
    return;
  }

  const root = document.documentElement;
  painting = true;
  void paintOver(themeBackground(next), () => {
    // Under the paint the page changes at once; the drying paint is the transition.
    root.dataset.themeSwitching = '';
    flushSync(() => applyTheme(next));
    requestAnimationFrame(() => delete root.dataset.themeSwitching);
  }).finally(() => {
    painting = false;
  });
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  return { theme: useSyncExternalStore(subscribe, getTheme), toggleTheme };
}
