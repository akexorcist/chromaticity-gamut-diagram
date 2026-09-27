<script lang="ts">
  import { BASE_WIDTH } from '../data/constants';
  import { gamuts } from '../state/gamuts.svelte';
  import { displayOptions } from '../state/displayOptions.svelte';
  import { render } from '../render/diagram';

  let resolution = $state('2000');
  let fileFormat = $state<'png' | 'webp'>('png');
  let isRendering = $state(false);

  function handleDownload(): void {
    isRendering = true;
    setTimeout(() => {
      const target = parseInt(resolution, 10);
      const format = fileFormat;
      const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
      const scale = target / BASE_WIDTH;
      const exportCanvas = document.createElement('canvas');
      render(exportCanvas, scale, gamuts, displayOptions);
      exportCanvas.toBlob((blob) => {
        if (!blob) { isRendering = false; return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chromaticity-gamut-diagram.' + format;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        isRendering = false;
      }, mimeType);
    }, 10);
  }
</script>

<div class="card">
  <h2>Export</h2>
  <div class="check-list field-grid">
    <div class="field-group">
      <span class="field-label">Resolution</span>
      <select id="resolution" bind:value={resolution}>
        <option value="800">800 px</option>
        <option value="1200">1,200 px</option>
        <option value="1600">1,600 px</option>
        <option value="2000">2,000 px</option>
        <option value="4000">4,000 px</option>
      </select>
    </div>
    <div class="field-group">
      <span class="field-label">File format</span>
      <select id="fileFormat" bind:value={fileFormat}>
        <option value="png">PNG</option>
        <option value="webp">WebP</option>
      </select>
    </div>
  </div>
  <button class="primary" id="downloadBtn" disabled={isRendering} onclick={handleDownload}>
    {isRendering ? 'Rendering…' : 'Download'}
  </button>
</div>
