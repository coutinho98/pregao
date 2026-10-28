import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Keeps a container at least as tall as its content has been. When the content gets shorter
 * (another tab with fewer items, a loading placeholder), the page does not shrink under the
 * reader, so the browser has no reason to pull the scroll position up. A new `resetKey`
 * (another lot, another search) lets it fit its content again.
 *
 * With `holding` false the container follows its content, and the hold starts again from the
 * content's height when `holding` turns true (only while the next tab is loading, say).
 */
export function useHeldHeight<T extends HTMLElement>(resetKey?: unknown, holding = true) {
  const contentRef = useRef<T>(null);
  const holdingRef = useRef(holding);
  const [minHeight, setMinHeight] = useState(0);
  const [heldFor, setHeldFor] = useState(resetKey);

  // Adjusted while rendering, as React recommends, instead of in an effect.
  if (resetKey !== heldFor) {
    setHeldFor(resetKey);
    setMinHeight(0);
  }

  useLayoutEffect(() => {
    holdingRef.current = holding;
  });

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(([entry]) => {
      const height = Math.ceil(entry?.borderBoxSize[0]?.blockSize ?? content.offsetHeight);
      setMinHeight((held) => (holdingRef.current ? Math.max(held, height) : height));
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return { contentRef, minHeight: holding ? minHeight : 0 };
}
