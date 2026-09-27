import { STORAGE_KEY, DISPLAY_OPTIONS_KEY } from '../data/constants';
import type { GamutState } from '../data/gamuts';
import type { DiagramState } from '../render/diagram';

// Pure functions operating on the state modules' arrays/objects by
// reference, called at explicit sites (checkbox change, popover confirm)
// — never via a blanket auto-save effect, which would persist popover
// drafts before Confirm and break cancel semantics.

export function loadCustomizations(gamuts: GamutState[]): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    gamuts.forEach((g) => {
      const entry = data[g.key];
      if (!entry) return;
      if (entry.color) g.customColor = entry.color;
      if (entry.dash) g.customDash = entry.dash;
      if (typeof entry.on === 'boolean') g.on = entry.on;
    });
  } catch {
    // ignore corrupt/inaccessible storage, matches legacy behavior
  }
}

export function saveCustomizations(gamuts: GamutState[]): void {
  try {
    const data: Record<string, { on: boolean; color: string | null; dash: number[] | null }> = {};
    gamuts.forEach((g) => {
      data[g.key] = { on: g.on, color: g.customColor || null, dash: g.customDash || null };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota/availability errors, matches legacy behavior
  }
}

export function loadDisplayOptions(state: DiagramState): void {
  try {
    const raw = localStorage.getItem(DISPLAY_OPTIONS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data['opt-legend'] === 'boolean') state.showLegend = data['opt-legend'];
    if (typeof data['opt-axis'] === 'boolean') state.showAxis = data['opt-axis'];
    if (typeof data['opt-grid'] === 'boolean') state.showGrid = data['opt-grid'];
  } catch {
    // ignore corrupt/inaccessible storage, matches legacy behavior
  }
}

export function saveDisplayOptions(state: DiagramState): void {
  try {
    const data = {
      'opt-legend': state.showLegend,
      'opt-axis': state.showAxis,
      'opt-grid': state.showGrid,
    };
    localStorage.setItem(DISPLAY_OPTIONS_KEY, JSON.stringify(data));
  } catch {
    // ignore quota/availability errors, matches legacy behavior
  }
}
