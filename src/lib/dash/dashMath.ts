import { DASH_PRESETS, DIAGRAM_DOTTED_DASH, type DashArray, type DashKey } from '../data/dashPresets';

/** The minimal shape dash math needs from a gamut record. */
export interface Dashable {
  index: number;
  customDash: DashArray | null;
}

export function defaultDash(i: number): DashArray {
  return i % 2 === 1 ? DASH_PRESETS.dashed : DASH_PRESETS.solid;
}

export function gamutDash(g: Dashable): DashArray {
  return g.customDash || defaultDash(g.index);
}

export function dashKeyFor(dash: DashArray | null | undefined): DashKey {
  if (!dash || dash.length === 0) return 'solid';
  if (dash.length === 4) return 'dashdot';
  if (dash.length === 2 && dash[0] < 1) return 'dotted';
  return 'dashed';
}

export function applyDashStyle(ctx: CanvasRenderingContext2D, g: Dashable): void {
  const dash = gamutDash(g);
  const key = dashKeyFor(dash);
  ctx.setLineDash(dash);
  ctx.lineCap = key === 'dotted' || key === 'dashdot' ? 'round' : 'butt';
}

// Diagram-only variant: substitutes the wider-spaced DIAGRAM_DOTTED_DASH
// for the "dotted" style. See dashPresets.ts for why this must stay separate.
export function applyDiagramDashStyle(ctx: CanvasRenderingContext2D, g: Dashable): void {
  const dash = gamutDash(g);
  const key = dashKeyFor(dash);
  ctx.setLineDash(key === 'dotted' ? DIAGRAM_DOTTED_DASH : dash);
  ctx.lineCap = key === 'dotted' || key === 'dashdot' ? 'round' : 'butt';
}

export function dashOnOffsets(dash: DashArray): number[] {
  const offsets: number[] = [];
  let sum = 0;
  for (let i = 0; i < dash.length; i++) {
    sum += dash[i];
    if (i % 2 === 0) offsets.push(sum);
  }
  return offsets;
}

// Finds the nearest achievable stroke length that ends exactly on a drawn
// ("on") dash segment, so a fixed-width preview line never ends mid-gap.
export function snapLineLength(dash: DashArray | null | undefined, targetLen: number): number {
  if (!dash || dash.length === 0) return targetLen;
  let cycle = 0;
  for (let i = 0; i < dash.length; i++) cycle += dash[i];
  if (cycle <= 0) return targetLen;
  const onOffsets = dashOnOffsets(dash);
  let best = targetLen, bestDiff = Infinity;
  const maxN = Math.ceil(targetLen / cycle) + 1;
  for (let n = 0; n <= maxN; n++) {
    for (let k = 0; k < onOffsets.length; k++) {
      const candidate = n * cycle + onOffsets[k];
      const diff = Math.abs(candidate - targetLen);
      if (diff < bestDiff) { bestDiff = diff; best = candidate; }
    }
  }
  return best;
}
