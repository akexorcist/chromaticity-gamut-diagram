import { DIAGRAM, PAD, SPECTRUM_RES, BASE_WIDTH } from '../data/constants';
import type { GamutState } from '../data/gamuts';
import { mapX, mapY } from './geometry';
import { getSpectrumBitmap } from './spectrum';
import { themeInk, themeMuted, themeGrid, gamutColor } from './theme';
import { applyDashStyle, applyDiagramDashStyle, dashKeyFor, gamutDash, snapLineLength } from '../dash/dashMath';

export interface DiagramState {
  showLegend: boolean;
  showAxis: boolean;
  showGrid: boolean;
}

export function activeGamuts(gamuts: GamutState[]): GamutState[] {
  return gamuts.filter((g) => g.on);
}

// NOTE: intentionally ignores `state` — ported verbatim from the legacy
// app's computeHeight. Canvas height stays fixed regardless of whether the
// legend/axis/grid are shown; do not "fix" this into a responsive height.
export function computeHeight(_state: DiagramState): number {
  return PAD + DIAGRAM + PAD;
}

export function drawLegendOverlay(ctx: CanvasRenderingContext2D, gamuts: GamutState[], state: DiagramState): void {
  const active = activeGamuts(gamuts);
  if (!state.showLegend || active.length === 0) return;

  const rowH = 26, pad = 10, swatchW = 36, textGap = 8;
  ctx.font = '600 15px "IBM Plex Sans", sans-serif';
  let maxTextW = 0;
  active.forEach((g) => {
    const w = ctx.measureText(g.name).width;
    if (w > maxTextW) maxTextW = w;
  });
  const boxW = pad * 2 + swatchW + textGap + Math.ceil(maxTextW);
  const boxX = PAD + DIAGRAM - boxW - 12;
  const boxY = PAD + 12;

  active.forEach((g, i) => {
    const lineY = boxY + pad + i * rowH + rowH / 2;
    ctx.strokeStyle = gamutColor(g);
    ctx.lineWidth = 3.5;
    applyDashStyle(ctx, g);
    const lineLen = snapLineLength(gamutDash(g), swatchW - 4);
    ctx.beginPath();
    ctx.moveTo(boxX + pad, lineY);
    ctx.lineTo(boxX + pad + lineLen, lineY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineCap = 'butt';
    ctx.fillStyle = themeInk();
    ctx.font = '600 15px "IBM Plex Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(g.name, boxX + pad + swatchW + textGap - 4, lineY + 5);
  });
}

export function drawDiagramSquare(ctx: CanvasRenderingContext2D, gamuts: GamutState[], state: DiagramState): void {
  const spectrumBitmap = getSpectrumBitmap();
  if (spectrumBitmap) {
    ctx.drawImage(spectrumBitmap, 0, 0, SPECTRUM_RES, SPECTRUM_RES, PAD, PAD, DIAGRAM, DIAGRAM);
  }

  if (state.showGrid) {
    ctx.strokeStyle = themeGrid();
    ctx.lineWidth = 1;
    ctx.beginPath();
    [0, 0.2, 0.4, 0.6, 0.8].forEach((t) => {
      ctx.moveTo(mapX(t), mapY(0.85));
      ctx.lineTo(mapX(t), mapY(-0.05));
      ctx.moveTo(mapX(-0.05), mapY(t));
      ctx.lineTo(mapX(0.85), mapY(t));
    });
    ctx.stroke();
  }

  if (state.showAxis) {
    ctx.strokeStyle = themeMuted();
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(mapX(-0.05), mapY(0.85));
    ctx.lineTo(mapX(-0.05), mapY(-0.05));
    ctx.lineTo(mapX(0.85), mapY(-0.05));
    ctx.stroke();

    ctx.beginPath();
    [0, 0.2, 0.4, 0.6, 0.8].forEach((t) => {
      ctx.moveTo(mapX(t), mapY(-0.05));
      ctx.lineTo(mapX(t), mapY(-0.05) + 6);
      ctx.moveTo(mapX(-0.05), mapY(t));
      ctx.lineTo(mapX(-0.05) - 6, mapY(t));
    });
    ctx.stroke();

    ctx.fillStyle = themeMuted();
    ctx.font = '15px "IBM Plex Mono", monospace';
    [0, 0.2, 0.4, 0.6, 0.8].forEach((t) => {
      ctx.textAlign = 'center';
      ctx.fillText(t.toFixed(1), mapX(t), mapY(-0.05) + 20);
      ctx.textAlign = 'right';
      ctx.fillText(t.toFixed(1), mapX(-0.05) - 11, mapY(t) + 5);
    });
  }

  activeGamuts(gamuts).forEach((g) => {
    ctx.beginPath();
    g.primaries.forEach((p, idx) => {
      const x = mapX(p[0]), y = mapY(p[1]);
      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = gamutColor(g);
    ctx.lineWidth = dashKeyFor(gamutDash(g)) === 'dotted' ? 3.0 : 2.25;
    applyDiagramDashStyle(ctx, g);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.lineCap = 'butt';

  drawLegendOverlay(ctx, gamuts, state);
}

export function render(canvas: HTMLCanvasElement, scale: number, gamuts: GamutState[], state: DiagramState): void {
  const h = computeHeight(state);
  canvas.width = Math.round(BASE_WIDTH * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);
  drawDiagramSquare(ctx, gamuts, state);
  ctx.restore();
}
