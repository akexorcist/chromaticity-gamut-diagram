import { describe, expect, it } from 'vitest';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '../../src/lib/color/convert';

// Fixed input/output pairs captured from the legacy app's identical
// hand-rolled conversion functions (legacy/index.html:552-597).
describe('hexToRgb', () => {
  it('parses standard hex colors', () => {
    expect(hexToRgb('#2F6FE4')).toEqual({ r: 47, g: 111, b: 228 });
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe('rgbToHex', () => {
  it('formats and zero-pads, uppercase', () => {
    expect(rgbToHex(47, 111, 228)).toBe('#2F6FE4');
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(5, 10, 255)).toBe('#050AFF');
  });
  it('clamps and rounds out-of-range values', () => {
    expect(rgbToHex(-10, 300, 127.6)).toBe('#00FF80');
  });
});

describe('rgbToHsl / hslToRgb round-trip', () => {
  it('round-trips a chromatic color', () => {
    const hsl = rgbToHsl(47, 111, 228);
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    expect(Math.round(rgb.r)).toBe(47);
    expect(Math.round(rgb.g)).toBe(111);
    expect(Math.round(rgb.b)).toBe(228);
  });

  it('handles achromatic gray (h=s=0 path)', () => {
    const hsl = rgbToHsl(128, 128, 128);
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(Math.round(hsl.l)).toBe(50);
  });

  it('handles pure white and black', () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('hslToRgb at s=0 ignores hue entirely (achromatic)', () => {
    const a = hslToRgb(0, 0, 50);
    const b = hslToRgb(275, 0, 50);
    expect(a).toEqual(b);
  });
});
