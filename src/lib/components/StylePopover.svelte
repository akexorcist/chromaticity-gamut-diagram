<script lang="ts">
  import { tick, untrack } from 'svelte';
  import { popoverState, confirmPopover, cancelPopover, resetPopover } from '../state/popover.svelte';
  import ColorPickerField from './ColorPickerField.svelte';
  import DashStylePicker from './DashStylePicker.svelte';

  let popoverEl: HTMLDivElement;
  let colorField: ReturnType<typeof ColorPickerField>;

  function positionPopover(anchorEl: HTMLElement): void {
    const gap = 10, margin = 12;
    const rect = anchorEl.getBoundingClientRect();
    const pw = popoverEl.offsetWidth;
    const ph = popoverEl.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const vTop = Math.min(Math.max(rect.top, margin), Math.max(vh - ph - margin, margin));
    let left: number, top: number;

    if (rect.right + gap + pw <= vw - margin) {
      left = rect.right + gap;
      top = vTop;
    } else if (rect.left - gap - pw >= margin) {
      left = rect.left - gap - pw;
      top = vTop;
    } else if (rect.bottom + gap + ph <= vh - margin) {
      top = rect.bottom + gap;
      left = Math.min(Math.max(rect.left, margin), Math.max(vw - pw - margin, margin));
    } else {
      top = Math.max(rect.top - gap - ph, margin);
      left = Math.min(Math.max(rect.left, margin), Math.max(vw - pw - margin, margin));
    }

    popoverEl.style.left = (window.scrollX + left) + 'px';
    popoverEl.style.top = (window.scrollY + top) + 'px';
  }

  // Fires whenever the popover opens for a (possibly different) gamut —
  // mirrors the legacy openPopover(g, anchorEl) call doing both in sequence.
  $effect(() => {
    const g = popoverState.activeGamut;
    const anchor = popoverState.anchorEl;
    if (g && anchor) {
      // untrack: syncPopoverFields()/positionPopover() read+write DOM and
      // (via gamutColor) gamut fields as an imperative side effect of
      // opening — those reads must not become dependencies of THIS effect,
      // or any subsequent write anywhere in that chain re-triggers it in
      // a loop (observed: effect_update_depth_exceeded without this).
      untrack(() => {
        colorField?.syncPopoverFields();
        tick().then(() => positionPopover(anchor));
      });
    }
  });

  function handleReset(): void {
    resetPopover();
    colorField?.syncPopoverFields();
  }

  function handleCancelClick(e: MouseEvent): void {
    e.stopPropagation();
    cancelPopover();
  }
  function handleConfirmClick(e: MouseEvent): void {
    e.stopPropagation();
    confirmPopover();
  }

  // Drag-out-of-bounds fix: capture-phase press listeners record whether the
  // press started inside the popover, so a drag that starts on Pickr's own
  // canvas (inside the popover) but releases outside doesn't spuriously
  // cancel the edit via the bubble-phase click handler below.
  let pressStartedInside = false;
  function onDocPointerDownCapture(e: Event): void {
    pressStartedInside = !!popoverState.activeGamut && popoverEl.contains(e.target as Node);
  }
  function onDocClick(e: MouseEvent): void {
    if (!popoverState.activeGamut) return;
    if (popoverEl.contains(e.target as Node)) return;
    if (pressStartedInside) { pressStartedInside = false; return; }
    cancelPopover();
  }
  function onWindowScroll(): void {
    if (popoverState.activeGamut) cancelPopover();
  }
  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && popoverState.activeGamut) cancelPopover();
  }

  $effect(() => {
    document.addEventListener('mousedown', onDocPointerDownCapture, true);
    document.addEventListener('touchstart', onDocPointerDownCapture, true);
    document.addEventListener('click', onDocClick);
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('mousedown', onDocPointerDownCapture, true);
      document.removeEventListener('touchstart', onDocPointerDownCapture, true);
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('scroll', onWindowScroll);
      document.removeEventListener('keydown', onKeydown);
    };
  });
</script>

<div class="popover" id="stylePopover" bind:this={popoverEl} hidden={!popoverState.activeGamut}>
  <div class="popover-row">
    <span class="field-label">Color</span>
    <ColorPickerField bind:this={colorField} />
  </div>
  <div class="popover-row">
    <span class="field-label">Line</span>
    <DashStylePicker />
  </div>
  <button type="button" class="popover-reset" id="popoverReset" onclick={handleReset}>Reset to default</button>
  <div class="popover-actions">
    <button type="button" class="icon-btn icon-btn-cancel" id="popoverCancel" title="Cancel" aria-label="Cancel" onclick={handleCancelClick}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <button type="button" class="icon-btn icon-btn-confirm" id="popoverConfirm" title="Confirm" aria-label="Confirm" onclick={handleConfirmClick}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
    </button>
  </div>
</div>
