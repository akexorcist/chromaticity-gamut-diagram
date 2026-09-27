<script lang="ts">
  import { DASH_PRESETS, type DashKey } from '../data/dashPresets';
  import { dashKeyFor, gamutDash } from '../dash/dashMath';
  import { popoverState, setDash } from '../state/popover.svelte';
  import { themeInk } from '../render/theme';
  import DashPreviewCanvas from './DashPreviewCanvas.svelte';

  const options: { dash: DashKey; label: string }[] = [
    { dash: 'solid', label: 'Solid' },
    { dash: 'dashed', label: 'Dashed' },
    { dash: 'dotted', label: 'Dotted' },
    { dash: 'dashdot', label: 'Dash-Dot' },
  ];

  function activeKey(): DashKey | null {
    const g = popoverState.activeGamut;
    return g ? dashKeyFor(gamutDash(g)) : null;
  }

  function handleClick(dash: DashKey): void {
    if (!popoverState.activeGamut) return;
    setDash(DASH_PRESETS[dash]);
  }
</script>

<div class="line-options">
  {#each options as opt (opt.dash)}
    <button
      type="button"
      class="line-btn"
      class:active={activeKey() === opt.dash}
      data-dash={opt.dash}
      onclick={() => handleClick(opt.dash)}
    >
      <DashPreviewCanvas
        class="ln"
        resolve={() => ({ dash: DASH_PRESETS[opt.dash], color: themeInk() })}
        w={48}
        h={10}
        thickness={4}
      />
      <span class="lbl">{opt.label}</span>
    </button>
  {/each}
</div>
