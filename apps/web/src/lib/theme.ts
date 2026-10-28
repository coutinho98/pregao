import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';

/** Where the switch was pressed: the new theme spreads from there. */
export interface ThemeOrigin {
  x: number;
  y: number;
}

const REVEAL_MS = 650;
const REVEAL_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

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

/** Radius that covers the whole viewport from the origin, so the circle ends off-screen. */
function revealRadius({ x, y }: ThemeOrigin): number {
  return Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
}

/**
 * Switches the theme. With the View Transitions API the new theme spreads in a circle from
 * the switch; with reduced motion it cross-fades instead (CSS), and older browsers just swap.
 */
function toggleTheme(origin?: ThemeOrigin): void {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  if (!document.startViewTransition) {
    applyTheme(next);
    return;
  }

  const root = document.documentElement;
  // Colours change at once while the circle runs: the circle is the transition.
  root.dataset.themeSwitching = '';
  const transition = document.startViewTransition(() => flushSync(() => applyTheme(next)));
  void transition.finished.finally(() => delete root.dataset.themeSwitching);

  if (!origin || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { x, y } = origin;
  void transition.ready.then(() => {
    root.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${revealRadius(origin)}px at ${x}px ${y}px)`,
        ],
      },
      { duration: REVEAL_MS, easing: REVEAL_EASE, pseudoElement: '::view-transition-new(root)' },
    );
  });
}

export function useTheme(): { theme: Theme; toggleTheme: (origin?: ThemeOrigin) => void } {
  return { theme: useSyncExternalStore(subscribe, getTheme), toggleTheme };
}
