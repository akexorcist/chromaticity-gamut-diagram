<script lang="ts">
  import { displayOptions } from '../state/displayOptions.svelte';
  import { saveDisplayOptions } from '../state/persistence';

  function handleChange(): void {
    saveDisplayOptions(displayOptions);
  }
</script>

<div class="card">
  <h2>Display options</h2>
  <div class="check-list">
    <label class="check-row"><input type="checkbox" id="opt-legend" bind:checked={displayOptions.showLegend} onchange={handleChange} /><span class="name">Legend panel</span></label>
    <label class="check-row"><input type="checkbox" id="opt-axis" bind:checked={displayOptions.showAxis} onchange={handleChange} /><span class="name">Axis numbers</span></label>
    <label class="check-row"><input type="checkbox" id="opt-grid" bind:checked={displayOptions.showGrid} onchange={handleChange} /><span class="name">Grid lines</span></label>
  </div>
</div>
