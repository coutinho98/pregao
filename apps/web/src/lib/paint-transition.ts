/**
 * Paints the screen like a wall: a wide brush sweeps across in rows from top to bottom,
 * alternating direction, laying the new theme's background colour on a canvas above the
 * page. Each frame only draws a few short bristle segments, so it stays smooth. Once the
 * screen is covered the theme changes underneath and the paint fades as it "dries".
 */

const ROWS = 3;
const PAINT_MS = 1000;
const DRY_MS = 320;
const BRISTLES = 110;
/** The brush is a bit taller than a row, so rows overlap and leave no bare gaps. */
const BRUSH_OVERLAP = 1.45;
/** Canvas resolution cap: paint does not need full retina detail and stays cheaper. */
const MAX_PIXEL_RATIO = 1.5;

interface Bristle {
  /** Position across the brush, -0.5 (top edge) to 0.5 (bottom edge). */
  offset: number;
  width: number;
  alpha: number;
  /** Small vertical wander as the brush moves, so streaks are not ruler-straight. */
  wobble: number;
  phase: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function makeBristles(pixelRatio: number): Bristle[] {
  return Array.from({ length: BRISTLES }, (_, index) => {
    const spread = index / (BRISTLES - 1) - 0.5;
    // The body of the brush lays solid paint with a faint streaky texture; only the
    // outermost bristles run dry, leaving the broken edge of a real stroke.
    const edge = Math.abs(spread) * 2;
    const dry = Math.max(0, edge - 0.75) / 0.25;
    return {
      offset: spread + (Math.random() - 0.5) * 0.015,
      width: (7 + Math.random() * 9) * (1 - dry * 0.6) * pixelRatio,
      alpha: (0.85 + Math.random() * 0.15) * (1 - dry * 0.7),
      wobble: (1 + Math.random() * 3) * pixelRatio,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

/** Where the brush is at `progress` (0..1) along the rows, as canvas coordinates. */
function brushAt(progress: number, width: number, height: number): { x: number; y: number } {
  const pad = width * 0.08;
  const travelled = Math.min(progress * ROWS, ROWS - 1e-6);
  const row = Math.floor(travelled);
  const along = travelled - row;
  const leftToRight = row % 2 === 0;
  const x = leftToRight
    ? -pad + along * (width + 2 * pad)
    : width + pad - along * (width + 2 * pad);
  return { x, y: (row + 0.5) * (height / ROWS) };
}

/**
 * Paints `color` over the page, calls `onCovered` once the screen is fully painted, then
 * lets the paint fade away. Resolves when the canvas is gone.
 */
export function paintOver(color: string, onCovered: () => void): Promise<void> {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const width = Math.ceil(innerWidth * pixelRatio);
  const height = Math.ceil(innerHeight * pixelRatio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '2147483647',
    pointerEvents: 'none',
    transition: `opacity ${DRY_MS}ms ease-out`,
  });
  document.body.append(canvas);
  const context = canvas.getContext('2d');
  if (!context) {
    canvas.remove();
    onCovered();
    return Promise.resolve();
  }

  const bristles = makeBristles(pixelRatio);
  const brushHeight = (height / ROWS) * BRUSH_OVERLAP;
  context.strokeStyle = color;
  context.lineCap = 'butt';
  const start = performance.now();
  let last = brushAt(0, width, height);
  let lastRow = 0;

  return new Promise((resolve) => {
    const finish = () => {
      // Seal any hairline left between streaks, then swap the theme under the paint.
      context.globalAlpha = 1;
      context.fillStyle = color;
      context.fillRect(0, 0, width, height);
      onCovered();
      requestAnimationFrame(() => {
        canvas.style.opacity = '0';
        setTimeout(() => {
          canvas.remove();
          resolve();
        }, DRY_MS);
      });
    };

    const frame = (now: number) => {
      const progress = easeInOut(Math.min(1, (now - start) / PAINT_MS));
      const next = brushAt(progress, width, height);
      const row = Math.floor(Math.min(progress * ROWS, ROWS - 1e-6));
      // At the end of a row the brush lifts and comes down on the next one.
      if (row !== lastRow) {
        last = brushAt(row / ROWS, width, height);
        lastRow = row;
      }
      for (const bristle of bristles) {
        const y = (x: number) =>
          bristle.offset * brushHeight +
          Math.sin(x / (90 * pixelRatio) + bristle.phase) * bristle.wobble;
        context.globalAlpha = bristle.alpha;
        context.lineWidth = bristle.width;
        context.beginPath();
        context.moveTo(last.x, last.y + y(last.x));
        context.lineTo(next.x, next.y + y(next.x));
        context.stroke();
      }
      last = next;
      if (progress < 1) requestAnimationFrame(frame);
      else finish();
    };
    requestAnimationFrame(frame);
  });
}
