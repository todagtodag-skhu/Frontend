export const GROWTH_STICKER_PAGE_SIZE = 4;
export const GROWTH_GRID_ROWS = 4;
export const GROWTH_GRID_COLS = 5;
export const GROWTH_BOARD_VERTICAL_EDGE_INSET = 53;
export const GROWTH_STICKER_TAP_MOVE_THRESHOLD = 8;

export const GROWTH_MEMORY_CAROUSEL_HORIZONTAL_PADDING = 32;
export const GROWTH_MEMORY_CAROUSEL_GAP = 19;
export const GROWTH_MEMORY_BOARD_HORIZONTAL_MARGIN = 44;
export const GROWTH_MEMORY_BOARD_ASPECT_RATIO = 1.08;

export function getGrowthBoardWidth(screenWidth: number) {
  return Math.min(screenWidth - GROWTH_MEMORY_BOARD_HORIZONTAL_MARGIN, 320);
}

export function getGrowthBoardHeight(screenWidth: number) {
  return getGrowthBoardWidth(screenWidth) * GROWTH_MEMORY_BOARD_ASPECT_RATIO;
}

export function getGrowthMemoryCarouselCardWidth(screenWidth: number) {
  return screenWidth - GROWTH_MEMORY_CAROUSEL_HORIZONTAL_PADDING;
}
