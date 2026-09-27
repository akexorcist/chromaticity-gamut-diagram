// CIE xyY -> linear RGB (via XYZ) -> gamma-encoded sRGB, normalized so the
// brightest channel maps within [0,255]. Used to color the spectrum-locus
// background bitmap.
export function xyToSRGB(x: number, y: number): [number, number, number] {
  const Y = 1;
  const X = (Y / y) * x;
  const Z = (Y / y) * (1 - x - y);
  let r =  3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  let g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  let b =  0.0557 * X - 0.2040 * Y + 1.0570 * Z;
  r = Math.max(r, 0); g = Math.max(g, 0); b = Math.max(b, 0);
  const max = Math.max(r, g, b, 1e-6);
  r /= max; g /= max; b /= max;
  function enc(c: number): number {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }
  return [enc(r), enc(g), enc(b)].map((c) =>
    Math.round(Math.min(Math.max(c, 0), 1) * 255)
  ) as [number, number, number];
}
