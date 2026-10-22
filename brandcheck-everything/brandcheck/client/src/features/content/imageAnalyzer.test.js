import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  colorDistance,
  compareWithBrandPalette,
} from './imageAnalyzer.js';

describe('imageAnalyzer (TASK-081)', () => {
  it('correctly converts 6-character and 3-character hex to RGB', () => {
    expect(hexToRgb('#22D3EE')).toEqual({ r: 34, g: 211, b: 238 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('calculates Euclidean color distance accurately', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    const pureRed = { r: 255, g: 0, b: 0 };

    expect(colorDistance(black, black)).toBe(0);
    expect(Math.round(colorDistance(black, white))).toBe(442);
    expect(colorDistance(black, pureRed)).toBe(255);
  });

  it('flags off-brand colors and approves colors within tolerance', () => {
    const approvedPalette = ['#0B0F14', '#22D3EE', '#FFFFFF'];

    const extracted = [
      { hex: '#22D3EE', rgb: { r: 34, g: 211, b: 238 } }, // Exact primary match
      { hex: '#20C8E2', rgb: { r: 32, g: 200, b: 226 } }, // Very close cyan (within tolerance)
      { hex: '#FF0055', rgb: { r: 255, g: 0, b: 85 } },   // Rogue magenta (off-brand)
    ];

    const results = compareWithBrandPalette(extracted, approvedPalette, 30);

    expect(results[0].isApproved).toBe(true);
    expect(results[0].distance).toBe(0);

    expect(results[1].isApproved).toBe(true);
    expect(results[1].nearestApprovedHex).toBe('#22D3EE');

    expect(results[2].isApproved).toBe(false);
    expect(results[2].distance).toBeGreaterThan(100);
  });
});
