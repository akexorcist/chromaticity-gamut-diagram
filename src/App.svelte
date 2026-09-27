<script lang="ts">
  import DiagramCanvas from './lib/components/DiagramCanvas.svelte';
</script>

<div class="page">
  <header>
    <h1>Chromaticity Gamut Diagram</h1>
    <p>A chromaticity diagram for comparing color spaces side by side. Choose which ones to show, then export the result as an image for your own use.</p>
  </header>

  <div class="layout">
    <div class="canvas-panel">
      <div class="canvas-frame">
        <DiagramCanvas />
      </div>
    </div>

    <div class="controls-panel"></div>
  </div>

  <footer>
    <span>&copy; Akexorcist, 2026</span>
    <a href="#" id="sourceLink">Source code on GitHub</a>
  </footer>
</div>
