import { describe, expect, it } from 'vitest';
import { computeHeight } from '../../src/lib/render/diagram';
import { PAD, DIAGRAM } from '../../src/lib/data/constants';
import { DASH_PRESETS, DIAGRAM_DOTTED_DASH } from '../../src/lib/data/dashPresets';
import { applyDashStyle, applyDiagramDashStyle } from '../../src/lib/dash/dashMath';

// NOTE: intentionally ignores state — ported verbatim from the legacy app's
// computeHeight. Canvas height stays fixed regardless of legend/axis/grid
// visibility; this must NOT be "fixed" into a responsive height calculation.
describe('computeHeight', () => {
  it('always returns PAD*2 + DIAGRAM regardless of the state argument', () => {
    const expected = PAD + DIAGRAM + PAD;
    expect(computeHeight({ showLegend: true, showAxis: true, showGrid: false })).toBe(expected);
    expect(computeHeight({ showLegend: false, showAxis: false, showGrid: false })).toBe(expected);
    expect(computeHeight({ showLegend: false, showAxis: false, showGrid: true })).toBe(expected);
  });
});

// Guards Risk #2 from the migration plan: two distinct dotted-dash presets
// exist on purpose (wider spacing for the diagram's thicker stroke) and
// must each be used at their correct respective call site.
describe('applyDashStyle vs applyDiagramDashStyle dotted-preset usage', () => {
  function fakeCtx() {
    const calls: { setLineDash?: number[]; lineCap?: string } = {};
    return {
      calls,
      ctx: {
        setLineDash(dash: number[]) { calls.setLineDash = dash; },
        set lineCap(v: string) { calls.lineCap = v; },
        get lineCap() { return calls.lineCap ?? 'butt'; },
      } as unknown as CanvasRenderingContext2D,
    };
  }

  it('applyDashStyle uses the swatch/legend dotted preset ([0.001, 6])', () => {
    const g = { index: 0, customDash: DASH_PRESETS.dotted };
    const { ctx, calls } = fakeCtx();
    applyDashStyle(ctx, g);
    expect(calls.setLineDash).toEqual(DASH_PRESETS.dotted);
    expect(calls.setLineDash).not.toEqual(DIAGRAM_DOTTED_DASH);
  });

  it('applyDiagramDashStyle substitutes the wider diagram-only dotted preset ([0.001, 9])', () => {
    const g = { index: 0, customDash: DASH_PRESETS.dotted };
    const { ctx, calls } = fakeCtx();
    applyDiagramDashStyle(ctx, g);
    expect(calls.setLineDash).toEqual(DIAGRAM_DOTTED_DASH);
    expect(calls.setLineDash).not.toEqual(DASH_PRESETS.dotted);
  });

  it('non-dotted styles are unaffected by the diagram-only substitution', () => {
    const g = { index: 0, customDash: DASH_PRESETS.dashed };
    const { ctx: ctxA, calls: callsA } = fakeCtx();
    const { ctx: ctxB, calls: callsB } = fakeCtx();
    applyDashStyle(ctxA, g);
    applyDiagramDashStyle(ctxB, g);
    expect(callsA.setLineDash).toEqual(DASH_PRESETS.dashed);
    expect(callsB.setLineDash).toEqual(DASH_PRESETS.dashed);
  });
});
