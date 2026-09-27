import { describe, expect, it, beforeEach } from 'vitest';
import { gamuts } from '../../src/lib/state/gamuts.svelte';
import {
  popoverState,
  openPopover,
  confirmPopover,
  cancelPopover,
  resetPopover,
  setColor,
  setDash,
} from '../../src/lib/state/popover.svelte';

const srgb = () => gamuts.find((g) => g.key === 'srgb')!;

beforeEach(() => {
  localStorage.clear();
  const g = srgb();
  g.customColor = null;
  g.customDash = null;
  if (popoverState.activeGamut) cancelPopover();
});

describe('popover state machine', () => {
  it('open() snapshots the pre-open color/dash for rollback', () => {
    const g = srgb();
    g.customColor = '#123456';
    g.customDash = [7, 5];
    const anchor = document.createElement('div');
    openPopover(g, anchor);
    expect(popoverState.activeGamut).toBe(g);
    expect(popoverState.draftOriginal).toEqual({ color: '#123456', dash: [7, 5] });
  });

  it('edits apply live to the real gamut record before confirm', () => {
    const g = srgb();
    const anchor = document.createElement('div');
    openPopover(g, anchor);
    setColor('#abcdef');
    expect(g.customColor).toBe('#ABCDEF');
    expect(gamuts.find((x) => x.key === 'srgb')!.customColor).toBe('#ABCDEF');
  });

  it('cancel() restores color/dash from the pre-open snapshot', () => {
    const g = srgb();
    g.customColor = '#111111';
    g.customDash = [7, 5];
    const anchor = document.createElement('div');
    openPopover(g, anchor);
    setColor('#222222');
    setDash([0.001, 6]);
    cancelPopover();
    expect(g.customColor).toBe('#111111');
    expect(g.customDash).toEqual([7, 5]);
    expect(popoverState.activeGamut).toBeNull();
  });

  it('confirm() persists the live state and closes', () => {
    const g = srgb();
    const anchor = document.createElement('div');
    openPopover(g, anchor);
    setColor('#333333');
    confirmPopover();
    expect(popoverState.activeGamut).toBeNull();
    const stored = JSON.parse(localStorage.getItem('chromaticity-gamut-map:customizations')!);
    expect(stored.srgb.color).toBe('#333333');
  });

  it('reset() does not persist, and a later cancel() undoes the reset (legacy contract)', () => {
    const g = srgb();
    // Start from a previously-confirmed customization.
    g.customColor = '#444444';
    g.customDash = [5, 7, 0.001, 7];
    const anchor = document.createElement('div');
    openPopover(g, anchor);

    resetPopover();
    expect(g.customColor).toBeNull();
    expect(g.customDash).toBeNull();

    // Dismiss without confirming the reset.
    cancelPopover();

    // The reset is silently undone — restored to what was active before open().
    expect(g.customColor).toBe('#444444');
    expect(g.customDash).toEqual([5, 7, 0.001, 7]);
  });

  it('reset() followed by confirm() DOES persist the cleared customization', () => {
    const g = srgb();
    g.customColor = '#555555';
    const anchor = document.createElement('div');
    openPopover(g, anchor);
    resetPopover();
    confirmPopover();
    expect(g.customColor).toBeNull();
    const stored = JSON.parse(localStorage.getItem('chromaticity-gamut-map:customizations')!);
    expect(stored.srgb.color).toBeNull();
  });
});
