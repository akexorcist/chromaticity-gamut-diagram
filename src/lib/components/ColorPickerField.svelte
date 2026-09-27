<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Pickr from '@simonwep/pickr';
  import '@simonwep/pickr/dist/themes/nano.min.css';
  import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '../color/convert';
  import { gamutColor } from '../render/theme';
  import { popoverState, setColor } from '../state/popover.svelte';

  let pickrOuterEl: HTMLDivElement;
  let pickrTriggerEl: HTMLButtonElement;
  let hexEl: HTMLInputElement;
  let rEl: HTMLInputElement, gEl: HTMLInputElement, bEl: HTMLInputElement;
  let hEl: HTMLInputElement, sEl: HTMLInputElement, lEl: HTMLInputElement;

  let pickr: Pickr;
  let pickrReady = false;
  let pendingPickrHex: string | null = null;

  function refreshColorFields(hex: string): void {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hexEl.value = hex;
    rEl.value = String(rgb.r);
    gEl.value = String(rgb.g);
    bEl.value = String(rgb.b);
    hEl.value = String(Math.round(hsl.h));
    sEl.value = String(Math.round(hsl.s));
    lEl.value = String(Math.round(hsl.l));
  }

  function syncPickrColor(hex: string): void {
    if (pickrReady) pickr.setColor(hex, true);
    else pendingPickrHex = hex;
  }

  function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  }

  // fromPicker gates whether we echo the new color back into the Pickr
  // widget. Pickr-originated changes must NOT be echoed back — round-
  // tripping through setColor() at an achromatic point (S=0 or L=0/100,
  // where hue is mathematically undefined) resets the widget's internal
  // hue, fighting the user's live hue-wheel drag. External edits (hex/
  // RGB/HSL fields) don't have that problem and must still sync Pickr.
  function applyColor(hex: string, fromPicker = false): void {
    const g = popoverState.activeGamut;
    if (!g) return;
    setColor(hex);
    refreshColorFields(g.customColor!);
    if (!fromPicker) syncPickrColor(g.customColor!);
  }

  export function syncPopoverFields(): void {
    const g = popoverState.activeGamut;
    if (!g) return;
    const hex = gamutColor(g);
    refreshColorFields(hex);
    syncPickrColor(hex);
  }

  onMount(() => {
    pickr = Pickr.create({
      el: pickrTriggerEl,
      container: pickrOuterEl,
      theme: 'nano',
      default: '#2F6FE4',
      components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
          hex: false, rgba: false, hsla: false, hsva: false,
          cmyk: false, input: false, clear: false, save: false,
        },
      },
    });

    pickr.on('init', () => {
      pickrReady = true;
      pickr.show();
      if (pendingPickrHex) {
        pickr.setColor(pendingPickrHex, true);
        pendingPickrHex = null;
      }
    });
    pickr.on('change', (color: { toHEXA: () => { toString: () => string } }) => {
      applyColor(color.toHEXA().toString(), true);
    });
  });

  onDestroy(() => {
    pickr?.destroyAndRemove();
  });

  function handleHexChange(): void {
    const g = popoverState.activeGamut;
    if (!g) return;
    let v = hexEl.value.trim();
    if (v[0] !== '#') v = '#' + v;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      applyColor(v);
    } else {
      refreshColorFields(gamutColor(g));
    }
  }

  function applyFromRgbFields(): void {
    if (!popoverState.activeGamut) return;
    const r = clamp(parseFloat(rEl.value) || 0, 0, 255);
    const g = clamp(parseFloat(gEl.value) || 0, 0, 255);
    const b = clamp(parseFloat(bEl.value) || 0, 0, 255);
    applyColor(rgbToHex(r, g, b));
  }

  function applyFromHslFields(): void {
    if (!popoverState.activeGamut) return;
    const h = clamp(parseFloat(hEl.value) || 0, 0, 360);
    const s = clamp(parseFloat(sEl.value) || 0, 0, 100);
    const l = clamp(parseFloat(lEl.value) || 0, 0, 100);
    const rgb = hslToRgb(h, s, l);
    applyColor(rgbToHex(rgb.r, rgb.g, rgb.b));
  }
</script>

<div id="pickrOuter" class="pickr-mount" bind:this={pickrOuterEl}>
  <button type="button" id="pickrTrigger" class="pickr-trigger-hidden" tabindex="-1" aria-hidden="true" bind:this={pickrTriggerEl}></button>
</div>
<div class="color-text-fields">
  <div class="ctf-row"><span class="ctf-label">Hex</span><input type="text" class="ctf-input" id="colorHex" spellcheck="false" bind:this={hexEl} onchange={handleHexChange} /></div>
  <div class="ctf-row">
    <span class="ctf-label">RGB</span>
    <div class="ctf-triple">
      <input type="number" class="ctf-num" id="colorR" min="0" max="255" step="1" bind:this={rEl} onchange={applyFromRgbFields} />
      <input type="number" class="ctf-num" id="colorG" min="0" max="255" step="1" bind:this={gEl} onchange={applyFromRgbFields} />
      <input type="number" class="ctf-num" id="colorB" min="0" max="255" step="1" bind:this={bEl} onchange={applyFromRgbFields} />
    </div>
  </div>
  <div class="ctf-row">
    <span class="ctf-label">HSL</span>
    <div class="ctf-triple">
      <input type="number" class="ctf-num" id="colorH" min="0" max="360" step="1" bind:this={hEl} onchange={applyFromHslFields} />
      <input type="number" class="ctf-num" id="colorS" min="0" max="100" step="1" bind:this={sEl} onchange={applyFromHslFields} />
      <input type="number" class="ctf-num" id="colorL" min="0" max="100" step="1" bind:this={lEl} onchange={applyFromHslFields} />
    </div>
  </div>
</div>
