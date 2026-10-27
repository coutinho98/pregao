import { useReducedMotion, useSpring, useTransform } from 'motion/react';
import type { PointerEvent } from 'react';

const ZOOM = 2.2;
const SPRING = { stiffness: 170, damping: 26, mass: 0.6 };

/**
 * Pointer position over the image, 0..1, measured against its layout box: the offset parent's
 * rect plus the image's offsets, which the zoom transform does not move.
 */
function pointerAt(event: PointerEvent<HTMLElement>): [number, number] {
  const image = event.currentTarget;
  const parent = image.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
  return [
    (event.clientX - parent.left - image.offsetLeft) / image.offsetWidth,
    (event.clientY - parent.top - image.offsetTop) / image.offsetHeight,
  ];
}

/**
 * Magnifies the artwork towards the mouse, inside its own frame. The image is scaled around
 * the pointer and clipped back to its original box; both come from the same springs, so the
 * clip always matches the scale. Scaling by s around origin o moves the edges by o·(1 - 1/s).
 */
export function useArtworkZoom() {
  const reduce = useReducedMotion();
  const scale = useSpring(1, SPRING);
  const x = useSpring(0.5, SPRING);
  const y = useSpring(0.5, SPRING);

  const transformOrigin = useTransform(() => `${x.get() * 100}% ${y.get() * 100}%`);
  const clipPath = useTransform(() => {
    const edge = (1 - 1 / scale.get()) * 100;
    return `inset(${y.get() * edge}% ${(1 - x.get()) * edge}% ${(1 - y.get()) * edge}% ${x.get() * edge}%)`;
  });

  const handlers = {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (reduce || event.pointerType !== 'mouse') return;
      const [px, py] = pointerAt(event);
      x.jump(px);
      y.jump(py);
      scale.set(ZOOM);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'mouse') return;
      const [px, py] = pointerAt(event);
      x.set(px);
      y.set(py);
    },
    onPointerLeave: () => scale.set(1),
  };

  return { style: { scale, transformOrigin, clipPath }, handlers };
}
