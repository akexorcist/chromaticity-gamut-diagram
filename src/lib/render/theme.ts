import type { GamutState } from '../data/gamuts';

// Plain pull-based functions, recomputed on every render call — mirrors the
// legacy app exactly (no cached "current theme" reactive signal). See the
// migration plan's note on why theme stays a plain function, not $state.
export function isDarkMode(): boolean {
  const el = document.documentElement;
  if (el.getAttribute('data-theme') === 'dark') return true;
  if (el.getAttribute('data-theme') === 'light') return false;
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function themeInk(): string {
  return isDarkMode() ? '#F2F4F7' : '#151A22';
}

export function themeMuted(): string {
  return isDarkMode() ? '#7C8595' : '#8892A0';
}

export function themeGrid(): string {
  return isDarkMode() ? 'rgba(124,133,149,0.25)' : 'rgba(136,146,160,0.35)';
}

export function gamutColor(g: GamutState): string {
  return g.customColor || (isDarkMode() ? g.colorDark : g.color);
}
