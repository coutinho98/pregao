import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Keeps a container at least as tall as its content has been. When the content gets shorter
 * (another tab with fewer items, a loading placeholder), the page does not shrink under the
 * reader, so the browser has no reason to pull the scroll position up. A new `resetKey`
 * (another lot, another search) lets it fit its content again.
 */
export function useHeldHeight<T extends HTMLElement>(resetKey?: unknown) {
  const contentRef = useRef<T>(null);
  const [minHeight, setMinHeight] = useState(0);
  const [heldFor, setHeldFor] = useState(resetKey);

  // Adjusted while rendering, as React recommends, instead of in an effect.
  if (resetKey !== heldFor) {
    setHeldFor(resetKey);
    setMinHeight(0);
  }

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(([entry]) => {
      const height = entry?.borderBoxSize[0]?.blockSize ?? content.offsetHeight;
      setMinHeight((held) => Math.max(held, Math.ceil(height)));
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return { contentRef, minHeight };
}
