import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';

const NEW_URL = 'http://localhost:4321/';
const LEGACY_URL = 'http://localhost:4322/';

const GAMUT_KEYS = ['srgb', 'p3', 'adobergb', 'rec2020', 'prophoto', 'ntsc', 'palsecam'] as const;
type GamutKey = (typeof GAMUT_KEYS)[number];

interface CustomizationEntry {
  on: boolean;
  color: string | null;
  dash: number[] | null;
}
type Customizations = Record<GamutKey, CustomizationEntry>;

interface DisplayOptions {
  'opt-legend': boolean;
  'opt-axis': boolean;
  'opt-grid': boolean;
}

const DEFAULT_ON: Record<GamutKey, boolean> = {
  srgb: true, p3: true, adobergb: false, rec2020: false, prophoto: false, ntsc: false, palsecam: false,
};

function customizations(overrides: Partial<Record<GamutKey, Partial<CustomizationEntry>>> = {}): Customizations {
  const result = {} as Customizations;
  for (const key of GAMUT_KEYS) {
    result[key] = { on: DEFAULT_ON[key], color: null, dash: null, ...overrides[key] };
  }
  return result;
}

function onlyOn(...keys: GamutKey[]): Customizations {
  const overrides: Partial<Record<GamutKey, Partial<CustomizationEntry>>> = {};
  for (const key of GAMUT_KEYS) overrides[key] = { on: keys.includes(key) };
  return customizations(overrides);
}

const DEFAULT_DISPLAY: DisplayOptions = { 'opt-legend': true, 'opt-axis': true, 'opt-grid': false };

async function seed(page: Page, url: string, custom: Customizations, display: DisplayOptions, colorScheme: 'light' | 'dark' = 'light'): Promise<void> {
  await page.emulateMedia({ colorScheme });
  await page.goto(url);
  await page.evaluate(
    ([custom, display]) => {
      localStorage.setItem('chromaticity-gamut-map:customizations', JSON.stringify(custom));
      localStorage.setItem('chromaticity-gamut-map:display-options', JSON.stringify(display));
    },
    [custom, display]
  );
  await page.reload();
  await page.waitForTimeout(700); // font-ready + boot settle, matches app's own 400ms fallback gate
}

async function downloadPng(page: Page, resolution = '2000'): Promise<Buffer> {
  await page.selectOption('#resolution', resolution);
  await page.selectOption('#fileFormat', 'png');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#downloadBtn'),
  ]);
  const path = await download.path();
  const fs = await import('node:fs');
  return fs.readFileSync(path!);
}

function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

interface StateCase {
  name: string;
  custom: Customizations;
  display: DisplayOptions;
  colorScheme?: 'light' | 'dark';
}

const cases: StateCase[] = [
  { name: 'default (light)', custom: customizations(), display: DEFAULT_DISPLAY },
  { name: 'default (dark)', custom: customizations(), display: DEFAULT_DISPLAY, colorScheme: 'dark' },
  { name: 'all gamuts off', custom: onlyOn(), display: DEFAULT_DISPLAY },
  { name: 'all gamuts on', custom: onlyOn(...GAMUT_KEYS), display: DEFAULT_DISPLAY },
  ...GAMUT_KEYS.map((key): StateCase => ({
    name: `only ${key}`,
    custom: onlyOn(key),
    display: DEFAULT_DISPLAY,
  })),
  { name: 'dash: dashed on srgb', custom: customizations({ srgb: { dash: [7, 5] } }), display: DEFAULT_DISPLAY },
  { name: 'dash: dotted on srgb', custom: customizations({ srgb: { dash: [0.001, 6] } }), display: DEFAULT_DISPLAY },
  { name: 'dash: dashdot on srgb', custom: customizations({ srgb: { dash: [5, 7, 0.001, 7] } }), display: DEFAULT_DISPLAY },
  { name: 'custom color on p3', custom: customizations({ p3: { color: '#AA33CC' } }), display: DEFAULT_DISPLAY },
  { name: 'legend off', custom: customizations(), display: { ...DEFAULT_DISPLAY, 'opt-legend': false } },
  { name: 'axis off', custom: customizations(), display: { ...DEFAULT_DISPLAY, 'opt-axis': false } },
  { name: 'grid on', custom: customizations(), display: { ...DEFAULT_DISPLAY, 'opt-grid': true } },
  { name: 'legend+axis off, grid on', custom: customizations(), display: { 'opt-legend': false, 'opt-axis': false, 'opt-grid': true } },
  { name: 'all display options off', custom: customizations(), display: { 'opt-legend': false, 'opt-axis': false, 'opt-grid': false } },
  { name: 'all display options on', custom: customizations(), display: { 'opt-legend': true, 'opt-axis': true, 'opt-grid': true } },
];

for (const c of cases) {
  test(`parity: ${c.name}`, async ({ page }) => {
    await seed(page, NEW_URL, c.custom, c.display, c.colorScheme);
    const newBuf = await downloadPng(page);

    await seed(page, LEGACY_URL, c.custom, c.display, c.colorScheme);
    const legacyBuf = await downloadPng(page);

    expect(sha256(newBuf)).toBe(sha256(legacyBuf));
  });
}
