/** Layout constants kept in sync with src/styles/pixel.css */

export const GRID_GAP_PX = 8;
export const TOKEN_CELL_MIN_PX = 96;
export const TOKEN_CELL_MIN_PX_NARROW = 72;
export const NARROW_LAYOUT_MAX_WIDTH_PX = 480;
export const MIN_TAP_TARGET_PX = 44;

export function getTokenCellMinPx(viewportWidth: number): number {
  return viewportWidth <= NARROW_LAYOUT_MAX_WIDTH_PX
    ? TOKEN_CELL_MIN_PX_NARROW
    : TOKEN_CELL_MIN_PX;
}

/** Mirrors CSS `repeat(auto-fill, minmax(var(--token-cell-min), 1fr))` column count. */
export function computeGridColumns(containerWidth: number, viewportWidth: number): number {
  if (containerWidth <= 0) return 1;

  const cellMin = getTokenCellMinPx(viewportWidth);
  const columns = Math.floor((containerWidth + GRID_GAP_PX) / (cellMin + GRID_GAP_PX));
  return Math.max(1, columns);
}

/** Typical word-bank grid width after shell padding on a phone viewport. */
export function estimateWordBankGridWidth(viewportWidth: number): number {
  const shellPadding = viewportWidth <= NARROW_LAYOUT_MAX_WIDTH_PX ? 12 : 16;
  const panelPadding = viewportWidth <= NARROW_LAYOUT_MAX_WIDTH_PX ? 20 : 24;
  return Math.max(0, viewportWidth - shellPadding * 2 - panelPadding);
}