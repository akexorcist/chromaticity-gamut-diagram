<script lang="ts">
  import type { GamutState } from '../data/gamuts';
  import DashPreviewCanvas from './DashPreviewCanvas.svelte';
  import { gamutDash } from '../dash/dashMath';
  import { gamutColor } from '../render/theme';

  let { gamut }: { gamut: GamutState } = $props();

  function handleSwatchClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    // Popover open/close wiring lands in a later migration phase.
  }
</script>

<div class="check-row">
  <input
    type="checkbox"
    id={'gamut-' + gamut.key}
    aria-labelledby={'gamut-name-' + gamut.key}
    bind:checked={gamut.on}
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
