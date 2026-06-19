import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MIN_TAP_TARGET_PX,
  TOKEN_CELL_MIN_PX,
  TOKEN_CELL_MIN_PX_NARROW,
  computeGridColumns,
  estimateWordBankGridWidth,
  getTokenCellMinPx,
} from '../layoutTokens';

describe('layoutTokens', () => {
  it('uses narrower token cells at phone breakpoints', () => {
    expect(getTokenCellMinPx(390)).toBe(TOKEN_CELL_MIN_PX_NARROW);
    expect(getTokenCellMinPx(375)).toBe(TOKEN_CELL_MIN_PX_NARROW);
    expect(getTokenCellMinPx(320)).toBe(TOKEN_CELL_MIN_PX_NARROW);
    expect(getTokenCellMinPx(768)).toBe(TOKEN_CELL_MIN_PX);
  });

  it('fits three columns on iPhone SE, 14, and 14 Pro Max widths', () => {
    for (const viewportWidth of [320, 375, 390, 430]) {
      const gridWidth = estimateWordBankGridWidth(viewportWidth);
      const columns = computeGridColumns(gridWidth, viewportWidth);
      const cellMin = getTokenCellMinPx(viewportWidth);

      expect(columns).toBeGreaterThanOrEqual(3);
      expect(columns * cellMin + (columns - 1) * 8).toBeLessThanOrEqual(gridWidth + 1);
    }
  });

  it('does not over-report columns when the grid is too narrow', () => {
    expect(computeGridColumns(284, 320)).toBe(3);
    expect(computeGridColumns(284, 768)).toBe(2);
    expect(computeGridColumns(150, 320)).toBe(1);
  });
});

describe('pixel.css mobile contract', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles/pixel.css'), 'utf8');

  it('declares narrow token sizing and tap-target rules', () => {
    expect(css).toContain('--token-cell-min: clamp(72px');
    expect(css).toContain(`min-width: ${MIN_TAP_TARGET_PX}px`);
    expect(css).toContain('min-height: 44px');
    expect(css).toContain('env(safe-area-inset');
  });

  it('keeps default token min aligned with layout tokens module', () => {
    expect(css).toContain(`--token-cell-min: clamp(${TOKEN_CELL_MIN_PX}px`);
  });
});