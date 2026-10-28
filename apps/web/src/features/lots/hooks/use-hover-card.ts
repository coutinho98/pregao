import { useReducedMotion, useSpring } from 'motion/react';
import { type PointerEvent, useState } from 'react';

/** Gap between the pointer and the card. */
const OFFSET = 18;
/** Keeps the card clear of the window edges when it flips. */
const EDGE = 12;
const SPRING = { stiffness: 380, damping: 34, mass: 0.6 };

/**
 * A card that follows the mouse while it is over the artwork (the image itself, not the empty
 * space around it), trailing it slightly. It opens beside the pointer and flips to the other
 * side near the window's edges. Touch and pen never open it.
 */
export function useHoverCard(cardWidth: number, cardHeight: number) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const overArtwork = event.target instanceof HTMLImageElement;
    if (event.pointerType !== 'mouse' || !overArtwork) {
      setOpen(false);
      return;
    }
    const area = event.currentTarget.getBoundingClientRect();
    const left = event.clientX + OFFSET + cardWidth > innerWidth - EDGE;
    const up = event.clientY + OFFSET + cardHeight > innerHeight - EDGE;
    const nextX = event.clientX - area.left + (left ? -OFFSET - cardWidth : OFFSET);
    const nextY = event.clientY - area.top + (up ? -OFFSET : OFFSET);
    // Opening (or reduced motion) places the card at once; then it trails the pointer.
    if (!open || reduce) {
      x.jump(nextX);
      y.jump(nextY);
    } else {
      x.set(nextX);
      y.set(nextY);
    }
    setFlipY(up);
    setOpen(true);
  };

  return {
    open,
    flipY,
    position: { x, y },
    handlers: { onPointerMove, onPointerLeave: () => setOpen(false) },
  };
}
