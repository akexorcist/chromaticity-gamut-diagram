import type { DashArray } from '../data/dashPresets';
import { dashKeyFor, snapLineLength } from './dashMath';

// Framework-agnostic small-canvas renderer shared by both the gamut-list
// swatch previews and the popover's line-style buttons.
export function drawDashPreview(
  canvas: HTMLCanvasElement,
  dashArray: DashArray | null | undefined,
  color: string,
  w: number,
  h: number,
  thickness: number
): void {
  const scale = 2;
  canvas.width = w * scale;
  canvas.height = h * scale;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  const key = dashKeyFor(dashArray);
  ctx.setLineDash(dashArray || []);
  ctx.lineCap = key === 'dotted' || key === 'dashdot' ? 'round' : 'butt';
  const lineLen = snapLineLength(dashArray, w - thickness);
  ctx.beginPath();
  ctx.moveTo(thickness / 2, h / 2);
  ctx.lineTo(thickness / 2 + lineLen, h / 2);
  ctx.stroke();
}
