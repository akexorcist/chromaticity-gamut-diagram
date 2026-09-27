<script lang="ts">
  import type { DashArray } from '../data/dashPresets';
  import { drawDashPreview } from '../dash/dashPreview';

  let {
    resolve,
    w,
    h,
    thickness,
    class: className = '',
  }: {
    // Called fresh on every redraw so theme-dependent colors stay correct;
    // reads inside it (gamut.customColor etc.) are still tracked normally
    // by the $effect below since Svelte follows reads through function calls.
    resolve: () => { dash: DashArray | null; color: string };
    w: number;
    h: number;
    thickness: number;
    class?: string;
  } = $props();

  let canvasEl: HTMLCanvasElement;

  function redraw(): void {
    if (!canvasEl) return;
    const { dash, color } = resolve();
    drawDashPreview(canvasEl, dash, color, w, h, thickness);
  }

  $effect(() => {
    redraw();
  });

  // OS theme toggling isn't tracked by Svelte reactivity (isDarkMode() reads
  // matchMedia directly, not $state) — mirrors the legacy app's explicit
  // onSchemeChange-triggered repaint of swatch/line-button previews.
  $effect(() => {
    if (!window.matchMedia) return;
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => redraw();
    darkQuery.addEventListener?.('change', onChange);
    return () => darkQuery.removeEventListener?.('change', onChange);
  });
</script>

<canvas class={className} bind:this={canvasEl}></canvas>
