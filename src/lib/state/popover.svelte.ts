import type { GamutState } from '../data/gamuts';
import type { DashArray } from '../data/dashPresets';
import { gamuts } from './gamuts.svelte';
import { saveCustomizations } from './persistence';

interface Draft {
  color: string | null;
  dash: DashArray | null;
}

interface PopoverState {
  activeGamut: GamutState | null;
  draftOriginal: Draft | null;
  anchorEl: HTMLElement | null;
}

export const popoverState: PopoverState = $state({
  activeGamut: null,
  draftOriginal: null,
  anchorEl: null,
});

function close(): void {
  popoverState.activeGamut = null;
  popoverState.draftOriginal = null;
  popoverState.anchorEl = null;
}

export function openPopover(g: GamutState, anchorEl: HTMLElement): void {
  popoverState.activeGamut = g;
  // Snapshot for cancel() to restore — edits below apply LIVE to the real
  // gamut record (for instant diagram preview), not to a separate draft copy.
  popoverState.draftOriginal = { color: g.customColor, dash: g.customDash };
  popoverState.anchorEl = anchorEl;
}

export function confirmPopover(): void {
  if (!popoverState.activeGamut) return;
  saveCustomizations(gamuts);
  close();
}

export function cancelPopover(): void {
  const g = popoverState.activeGamut;
  const draft = popoverState.draftOriginal;
  if (!g || !draft) return;
  g.customColor = draft.color;
  g.customDash = draft.dash;
  close();
}

// NOTE: intentionally does not save. If the popover is later dismissed
// without Confirm, cancelPopover()'s unconditional restore-from-snapshot
// silently undoes this reset — a shipped, intentional legacy behavior.
// Preserve exactly; do not "fix" by auto-confirming or updating the snapshot.
export function resetPopover(): void {
  const g = popoverState.activeGamut;
  if (!g) return;
  g.customColor = null;
  g.customDash = null;
}

export function setColor(hex: string): void {
  const g = popoverState.activeGamut;
  if (!g) return;
  g.customColor = hex.toUpperCase();
}

export function setDash(dash: DashArray): void {
  const g = popoverState.activeGamut;
  if (!g) return;
  g.customDash = dash;
}
