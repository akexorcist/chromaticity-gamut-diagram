import { DMIN, DRANGE, DIAGRAM, PAD } from '../data/constants';
import { locus } from '../data/locus';

export function mapX(x: number): number {
  return PAD + (x - DMIN) / DRANGE * DIAGRAM;
}

export function mapY(y: number): number {
  return PAD + DIAGRAM - (y - DMIN) / DRANGE * DIAGRAM;
}

// Catmull-Rom spline smoothing.
export function smoothCurve(points: [number, number][], segments: number): [number, number][] {
  const n = points.length;
  const out: [number, number][] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, n - 1)];
    for (let s = 0; s < segments; s++) {
      const t = s / segments;
      const t2 = t * t, t3 = t2 * t;
      const x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([x, y]);
    }
  }
  out.push(points[n - 1]);
  return out;
}

export function pointInPolygon(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    if (((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Smoothed spectral locus outline, computed once at module load — used for
// the spectrum bitmap's point-in-polygon test.
export const polygon: [number, number][] = smoothCurve(
  locus.map((p): [number, number] => [p[1], p[2]]),
  6
);
