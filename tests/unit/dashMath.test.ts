import { describe, expect, it } from 'vitest';
import { DASH_PRESETS, DIAGRAM_DOTTED_DASH } from '../../src/lib/data/dashPresets';
import {
  defaultDash,
  gamutDash,
  dashKeyFor,
  dashOnOffsets,
  snapLineLength,
} from '../../src/lib/dash/dashMath';

describe('defaultDash / gamutDash', () => {
  it('alternates solid/dashed by index', () => {
    expect(defaultDash(0)).toEqual(DASH_PRESETS.solid);
    expect(defaultDash(1)).toEqual(DASH_PRESETS.dashed);
    expect(defaultDash(2)).toEqual(DASH_PRESETS.solid);
    expect(defaultDash(3)).toEqual(DASH_PRESETS.dashed);
  });

  it('gamutDash prefers customDash over the index default', () => {
    expect(gamutDash({ index: 0, customDash: DASH_PRESETS.dotted })).toEqual(DASH_PRESETS.dotted);
    expect(gamutDash({ index: 0, customDash: null })).toEqual(DASH_PRESETS.solid);
  });
});

describe('dashKeyFor', () => {
  it('identifies each preset shape', () => {
    expect(dashKeyFor([])).toBe('solid');
    expect(dashKeyFor(DASH_PRESETS.dashed)).toBe('dashed');
    expect(dashKeyFor(DASH_PRESETS.dotted)).toBe('dotted');
    expect(dashKeyFor(DASH_PRESETS.dashdot)).toBe('dashdot');
  });

  it('treats the diagram-only dotted variant as dotted too', () => {
    expect(dashKeyFor(DIAGRAM_DOTTED_DASH)).toBe('dotted');
  });

  it('handles null/undefined as solid', () => {
    expect(dashKeyFor(null)).toBe('solid');
    expect(dashKeyFor(undefined)).toBe('solid');
  });

  it('distinguishes dotted from dashed by the length-2 first-value<1 rule', () => {
    expect(dashKeyFor([0.001, 6])).toBe('dotted');
    expect(dashKeyFor([7, 5])).toBe('dashed');
    // a hypothetical length-2 array whose first value is >=1 is NOT dotted
    expect(dashKeyFor([1, 6])).toBe('dashed');
  });
});

describe('DIAGRAM_DOTTED_DASH divergence (Risk #2)', () => {
  it('is a distinct constant from DASH_PRESETS.dotted, wider-spaced', () => {
    expect(DIAGRAM_DOTTED_DASH).not.toEqual(DASH_PRESETS.dotted);
    expect(DIAGRAM_DOTTED_DASH[1]).toBeGreaterThan(DASH_PRESETS.dotted[1]);
  });
});

describe('dashOnOffsets', () => {
  it('computes cumulative on-segment end offsets', () => {
    expect(dashOnOffsets([7, 5])).toEqual([7]);
    expect(dashOnOffsets([5, 7, 0.001, 7])).toEqual([5, 12.001]);
  });
});

describe('snapLineLength', () => {
  it('returns the target length unchanged for solid lines', () => {
    expect(snapLineLength([], 30)).toBe(30);
    expect(snapLineLength(null, 30)).toBe(30);
  });

  it('snaps to the nearest length ending on a drawn segment', () => {
    // dashed [7,5]: cycle=12, on-offsets=[7] -> candidates ...,7,19,31...
    expect(snapLineLength([7, 5], 20)).toBe(19);
    expect(snapLineLength([7, 5], 6)).toBe(7);
  });

  it('never returns a length ending mid-gap for the dotted preset', () => {
    const dash = DASH_PRESETS.dotted; // [0.001, 6], cycle 6.001, on-offset 0.001
    for (const target of [10, 20, 32, 48]) {
      const snapped = snapLineLength(dash, target);
      const cycle = dash[0] + dash[1];
      const remainder = snapped % cycle;
      expect(remainder).toBeCloseTo(dash[0], 5);
    }
  });
});
