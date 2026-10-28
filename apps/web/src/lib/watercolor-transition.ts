/**
 * The shape of a watercolour wash, used to reveal the page in its new theme (see the theme
 * switch): blooms of colour open at several points, the first at the switch, each spreading
 * fast and then slowing like water soaking into paper, with a wavering edge, until they
 * merge and cover the screen. The wash also deepens from translucent to full colour.
 *
 * The shape is precomputed as clip-path keyframes. Every keyframe has the same commands
 * (one polygon per bloom), so the browser can interpolate between them.
 */

const KEYFRAMES = 72;
const BLOOM_POINTS = 140;
/** How translucent the first wash is; it deepens to full colour as the blooms merge. */
const FIRST_WASH_OPACITY = 0.3;

export interface WashOrigin {
  x: number;
  y: number;
}

interface Bloom {
  x: number;
  y: number;
  /** Final radius, in CSS pixels. */
  radius: number;
  /** When it starts to open, 0..1 of the wash. */
  delay: number;
  /** Phases of the edge's ripples, so each bloom has its own outline. */
  ripples: number[];
}

/** Opens readily and settles softly, like water finding its edge. */
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const coord = (value: number) => value.toFixed(1);

/** Deepest dent of a bloom's edge, relative to its radius (see bloomEdge). */
const MIN_EDGE = 1 - 0.07 - 0.035 - 0.015;

/** A bloom's edge at `angle`, relative to its radius: broad lobes and fine ripples. */
function bloomEdge(angle: number, ripples: number[], t: number): number {
  return (
    1 +
    0.07 * Math.sin(3 * angle + ripples[0]! + t * 0.4) +
    0.035 * Math.sin(7 * angle + ripples[1]! - t * 0.6) +
    0.015 * Math.sin(17 * angle + ripples[2]! + t)
  );
}

function makeBlooms(origin: WashOrigin, width: number, height: number): Bloom[] {
  const ripples = () => Array.from({ length: 3 }, () => Math.random() * Math.PI * 2);
  const farthest = Math.hypot(
    Math.max(origin.x, width - origin.x),
    Math.max(origin.y, height - origin.y),
  );
  // The first bloom, at the switch, alone ends past the farthest corner: the wash always
  // covers the screen whatever the others do.
  const blooms: Bloom[] = [
    { x: origin.x, y: origin.y, radius: farthest / MIN_EDGE, delay: 0, ripples: ripples() },
  ];
  // The others open on a loose 3 × 2 grid, so they spread over the whole screen.
  const diagonal = Math.hypot(width, height);
  for (let column = 0; column < 3; column++) {
    for (let row = 0; row < 2; row++) {
      blooms.push({
        x: ((column + 0.2 + Math.random() * 0.6) / 3) * width,
        y: ((row + 0.2 + Math.random() * 0.6) / 2) * height,
        radius: diagonal * (0.22 + Math.random() * 0.12),
        delay: 0.05 + Math.random() * 0.3,
        ripples: ripples(),
      });
    }
  }
  return blooms;
}

/** A closed polygon as path commands. */
function polygon(points: [number, number][]): string {
  const [first, ...rest] = points;
  const lines = rest.map(([x, y]) => `L${coord(x)} ${coord(y)}`).join('');
  return `M${coord(first![0])} ${coord(first![1])}${lines}Z`;
}

export interface WashKeyframes {
  clipPath: string[];
  opacity: number[];
}

/**
 * Keyframes of a wash from `origin` that ends covering a `width` × `height` viewport.
 * Easing is baked into the frames, so play them linearly.
 */
export function watercolorKeyframes(
  origin: WashOrigin,
  width: number,
  height: number,
): WashKeyframes {
  const blooms = makeBlooms(origin, width, height);
  const clipPath: string[] = [];
  const opacity: number[] = [];

  for (let frame = 0; frame <= KEYFRAMES; frame++) {
    const t = frame / KEYFRAMES;
    const shapes = blooms.map((bloom, index) => {
      // The first bloom spreads steadily to the end; the others open and settle softly.
      const local = clamp01((t - bloom.delay) / (1 - bloom.delay));
      const grow = index === 0 ? easeInOutSine(local) : easeOutCubic(local);
      const radius = Math.max(0.5, bloom.radius * grow);
      const points: [number, number][] = [];
      for (let point = 0; point < BLOOM_POINTS; point++) {
        const angle = (point / BLOOM_POINTS) * Math.PI * 2;
        const r = radius * bloomEdge(angle, bloom.ripples, t);
        points.push([bloom.x + Math.cos(angle) * r, bloom.y + Math.sin(angle) * r]);
      }
      return polygon(points);
    });
    clipPath.push(`path('${shapes.join('')}')`);
    // Deepens over the whole wash, slowest at the start and the end.
    opacity.push(FIRST_WASH_OPACITY + (1 - FIRST_WASH_OPACITY) * easeInOutSine(t));
  }
  return { clipPath, opacity };
}
