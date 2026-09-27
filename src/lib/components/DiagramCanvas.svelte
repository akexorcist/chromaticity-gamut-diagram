<script lang="ts">
  import { onMount } from 'svelte';
  import { gamuts } from '../state/gamuts.svelte';
  import { displayOptions } from '../state/displayOptions.svelte';
  import { render } from '../render/diagram';
  import { buildSpectrumBitmap } from '../render/spectrum';

  let canvasEl: HTMLCanvasElement;
  let booted = $state(false);

  function renderNow(): void {
    if (!canvasEl) return;
    render(canvasEl, 2, gamuts, displayOptions);
  }

  function boot(): void {
    if (booted) return;
    buildSpectrumBitmap();
    renderNow();
    booted = true;
  }

  onMount(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(boot);
      setTimeout(boot, 400);
    } else {
      boot();
    }

    if (window.matchMedia) {
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const onSchemeChange = () => { if (booted) renderNow(); };
      darkQuery.addEventListener?.('change', onSchemeChange);
      return () => darkQuery.removeEventListener?.('change', onSchemeChange);
    }
  });

  $effect(() => {
    // Touch every field that should trigger a redraw.
    for (const g of gamuts) {
      void g.on; void g.customColor; void g.customDash;
    }
    void displayOptions.showLegend; void displayOptions.showAxis; void displayOptions.showGrid;
    if (booted) renderNow();
  });
</script>

{#if !booted}
  <div class="canvas-loading" role="status" aria-live="polite">
    <span class="canvas-spinner"></span>
    <span>Loading diagram…</span>
  </div>
{/if}
<canvas id="preview" bind:this={canvasEl} class:is-hidden={!booted}></canvas>
