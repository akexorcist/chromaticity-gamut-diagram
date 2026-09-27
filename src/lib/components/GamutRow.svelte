<script lang="ts">
  import type { GamutState } from '../data/gamuts';
  import DashPreviewCanvas from './DashPreviewCanvas.svelte';
  import { gamutDash } from '../dash/dashMath';
  import { gamutColor } from '../render/theme';
  import { gamuts } from '../state/gamuts.svelte';
  import { saveCustomizations } from '../state/persistence';
  import { popoverState, openPopover, cancelPopover } from '../state/popover.svelte';

  let { gamut }: { gamut: GamutState } = $props();
  let rowEl: HTMLDivElement;

  function handleCheckboxChange(): void {
    saveCustomizations(gamuts);
  }

  function handleSwatchClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (popoverState.activeGamut === gamut) {
      cancelPopover();
      return;
    }
    openPopover(gamut, rowEl);
  }
</script>

<div class="check-row" bind:this={rowEl}>
  <input
    type="checkbox"
    id={'gamut-' + gamut.key}
    aria-labelledby={'gamut-name-' + gamut.key}
    bind:checked={gamut.on}
    onchange={handleCheckboxChange}
  />
  <span class="swatch-btn" title="Customize color and line style" onclick={handleSwatchClick}>
    <DashPreviewCanvas
      class="swatch-line"
      resolve={() => ({ dash: gamutDash(gamut), color: gamutColor(gamut) })}
      w={34}
      h={8}
      thickness={3}
    />
  </span>
  <span class="name" id={'gamut-name-' + gamut.key}>{gamut.name}</span>
</div>
