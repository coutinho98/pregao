import { describe, expect, it } from 'vitest';
import { watercolorKeyframes } from './watercolor-transition';

const commands = (path: string) => path.replace(/[^MLZ]/g, '');

describe('watercolorKeyframes', () => {
  const origin = { x: 1200, y: 40 };
  const { clipPath, opacity } = watercolorKeyframes(origin, 1280, 800);

  it('keeps the same path commands in every frame, so the browser can interpolate', () => {
    const first = commands(clipPath[0]!);
    for (const frame of clipPath) expect(commands(frame)).toBe(first);
  });

  it('deepens from translucent to full colour', () => {
    expect(opacity[0]).toBeLessThan(0.5);
    expect(opacity.at(-1)).toBe(1);
    for (let i = 1; i < opacity.length; i++)
      expect(opacity[i]!).toBeGreaterThanOrEqual(opacity[i - 1]!);
  });

  it('ends with the bloom at the switch past every corner of the screen', () => {
    const last = clipPath.at(-1)!;
    const firstBloom = last.slice(last.indexOf('M'), last.indexOf('Z'));
    const points = [...firstBloom.matchAll(/[ML]([\d.-]+) ([\d.-]+)/g)].map(([, x, y]) => ({
      x: Number(x),
      y: Number(y),
    }));
    const nearest = Math.min(...points.map(({ x, y }) => Math.hypot(x - origin.x, y - origin.y)));
    expect(nearest).toBeGreaterThan(Math.hypot(1200, 800 - 40));
  });
});
