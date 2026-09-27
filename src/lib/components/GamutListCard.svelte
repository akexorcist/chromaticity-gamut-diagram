<script lang="ts">
  import { gamuts } from '../state/gamuts.svelte';
  import GamutRow from './GamutRow.svelte';
</script>

<div class="card">
  <h2>Color spaces</h2>
  <div id="gamutList" class="check-list">
    {#each gamuts as gamut (gamut.key)}
      <GamutRow {gamut} />
    {/each}
  </div>
</div>
