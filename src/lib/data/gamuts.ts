export type GamutKey =
  | 'srgb'
  | 'p3'
  | 'adobergb'
  | 'rec2020'
  | 'prophoto'
  | 'ntsc'
  | 'palsecam';

export interface GamutDef {
  key: GamutKey;
  name: string;
  primaries: [number, number][];
  white: [number, number];
  color: string;
  colorDark: string;
  on: boolean;
}

export const GAMUT_DEFS: GamutDef[] = [
  { key: 'srgb',     name: 'sRGB',                primaries: [[0.6400,0.3300],[0.3000,0.6000],[0.1500,0.0600]], white: [0.3127,0.3290], color: '#2F6FE4', colorDark: '#5286E8', on: true  },
  { key: 'p3',       name: 'Display P3 / DCI-P3', primaries: [[0.6800,0.3200],[0.2650,0.6900],[0.1500,0.0600]], white: [0.3127,0.3290], color: '#E2632E', colorDark: '#D96B3A', on: true  },
  { key: 'adobergb', name: 'Adobe RGB (1998)',    primaries: [[0.6400,0.3300],[0.2100,0.7100],[0.1500,0.0600]], white: [0.3127,0.3290], color: '#178F67', colorDark: '#2FA579', on: false },
  { key: 'rec2020',  name: 'Rec. 2020',           primaries: [[0.7080,0.2920],[0.1700,0.7970],[0.1310,0.0460]], white: [0.3127,0.3290], color: '#C0392B', colorDark: '#D14F4F', on: false },
  { key: 'prophoto', name: 'ProPhoto RGB',        primaries: [[0.7347,0.2653],[0.1596,0.8404],[0.0366,0.0001]], white: [0.3457,0.3585], color: '#B08900', colorDark: '#A6842A', on: false },
  { key: 'ntsc',     name: 'NTSC (1953)',         primaries: [[0.6700,0.3300],[0.2100,0.7100],[0.1400,0.0800]], white: [0.3101,0.3162], color: '#0E86A0', colorDark: '#1F9BB3', on: false },
  { key: 'palsecam', name: 'PAL / SECAM',         primaries: [[0.6400,0.3300],[0.2900,0.6000],[0.1500,0.0600]], white: [0.3127,0.3290], color: '#C2185B', colorDark: '#C24A78', on: false }
];
