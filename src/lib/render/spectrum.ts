import { DMIN, DRANGE, SPECTRUM_RES } from '../data/constants';
import { pointInPolygon, polygon } from './geometry';
import { xyToSRGB } from '../color/srgb';

let spectrumBitmap: HTMLCanvasElement | null = null;

// Builds (and memoizes) the offscreen spectrum-locus background bitmap.
// Expensive (a full point-in-polygon scan over SPECTRUM_RES^2 pixels), so
// callers should build it once and reuse it across renders.
export function buildSpectrumBitmap(): HTMLCanvasElement {
  const size = SPECTRUM_RES;
  const off = document.createElement('canvas');
  off.width = size; off.height = size;
  const ctx = off.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let py = 0; py < size; py++) {
    const domY = 0.85 - (py / size) * DRANGE;
    for (let px = 0; px < size; px++) {
      const domX = DMIN + (px / size) * DRANGE;
      if (domY > 0.0008 && pointInPolygon(domX, domY, polygon)) {
        const rgb = xyToSRGB(domX, domY);
        const idx = (py * size + px) * 4;
        data[idx] = rgb[0]; data[idx + 1] = rgb[1]; data[idx + 2] = rgb[2]; data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  spectrumBitmap = off;
  return off;
}

export function getSpectrumBitmap(): HTMLCanvasElement | null {
  return spectrumBitmap;
}
