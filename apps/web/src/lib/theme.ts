import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { type WashOrigin, watercolorKeyframes } from './watercolor-transition';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

const WASH_MS = 1900;

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
 * Switches the theme. With the View Transitions API the page in its new theme is revealed
 * as a watercolour wash blooming from the switch; with reduced motion the browser's
 * cross-fade stays, and older browsers just swap.
 */
function toggleTheme(origin?: WashOrigin): void {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  if (!document.startViewTransition) {
    applyTheme(next);
    return;
  }
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Shaped before the switch, not once the snapshot is up: the new page stays hidden
  // (index.css) until the wash plays, so it never shows in full before the wash starts.
  const wash = reducedMotion
    ? undefined
    : watercolorKeyframes(
        origin ?? { x: innerWidth / 2, y: innerHeight / 2 },
        innerWidth,
        innerHeight,
      );

  // Colours change at once while the wash runs: the wash is the transition.
  root.dataset.themeSwitching = '';
  const transition = document.startViewTransition(() => flushSync(() => applyTheme(next)));
  void transition.finished.finally(() => delete root.dataset.themeSwitching);

  if (!wash) return;
  void transition.ready
    .then(() => {
      root.animate(
        { ...wash },
        {
          duration: WASH_MS,
          easing: 'linear',
          fill: 'both',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    // A second click before the wash finishes skips this transition: nothing left to animate.
    .catch(() => undefined);
}

export function useTheme(): { theme: Theme; toggleTheme: (origin?: WashOrigin) => void } {
  return { theme: useSyncExternalStore(subscribe, getTheme), toggleTheme };
}
