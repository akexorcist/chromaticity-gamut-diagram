<script lang="ts">
  import DiagramCanvas from './lib/components/DiagramCanvas.svelte';
  import ControlsPanel from './lib/components/ControlsPanel.svelte';
  import StylePopover from './lib/components/StylePopover.svelte';
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

    <ControlsPanel />
  </div>

  <footer>
    <span>&copy; Akexorcist, 2026</span>
    <a href="#" id="sourceLink">Source code on GitHub</a>
  </footer>
</div>

<StylePopover />
