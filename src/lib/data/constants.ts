export const DMIN = -0.05;
export const DRANGE = 0.9;
export const DIAGRAM = 640;
export const PAD = 56;
export const BASE_WIDTH = PAD * 2 + DIAGRAM;
export const SPECTRUM_RES = 900;

// Exact string literals — must stay byte-identical to the legacy app so
// existing users' saved localStorage data keeps loading correctly.
export const STORAGE_KEY = 'chromaticity-gamut-map:customizations';
export const DISPLAY_OPTIONS_KEY = 'chromaticity-gamut-map:display-options';
export const DISPLAY_OPTION_IDS = ['opt-legend', 'opt-axis', 'opt-grid'] as const;
