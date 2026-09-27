import { describe, expect, it } from 'vitest';
import { xyToSRGB } from '../../src/lib/color/srgb';
import { GAMUT_DEFS } from '../../src/lib/data/gamuts';

describe('xyToSRGB', () => {
  it('maps the D65 white point near white', () => {
    const [r, g, b] = xyToSRGB(0.3127, 0.3290);
    expect(r).toBeGreaterThan(240);
    expect(g).toBeGreaterThan(240);
    expect(b).toBeGreaterThan(240);
  });

  it('produces a valid 0-255 triple for every gamut primary and white point', () => {
    for (const g of GAMUT_DEFS) {
      const points: [number, number][] = [...g.primaries, g.white];
      for (const [x, y] of points) {
        const rgb = xyToSRGB(x, y);
        for (const c of rgb) {
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThanOrEqual(255);
          expect(Number.isInteger(c)).toBe(true);
        }
      }
    }
  });

  it('sRGB red primary maps to a saturated red', () => {
    const [r, g, b] = xyToSRGB(0.64, 0.33);
    expect(r).toBe(255);
    expect(g).toBeLessThan(r);
    expect(b).toBeLessThan(r);
  });
});
