export type DashArray = number[];
export type DashKey = 'solid' | 'dashed' | 'dotted' | 'dashdot';

export const DASH_PRESETS: Record<DashKey, DashArray> = {
  solid: [],
  dashed: [7, 5],
  dotted: [0.001, 6],
  dashdot: [5, 7, 0.001, 7]
};

// A wider-spaced dotted preset used ONLY for the main diagram's gamut
// triangle strokes (drawn thicker than swatches/legend/buttons), so dot
// density stays visually consistent at that line width. Deliberately a
// separate constant from DASH_PRESETS.dotted — do not unify them.
export const DIAGRAM_DOTTED_DASH: DashArray = [0.001, 9];
