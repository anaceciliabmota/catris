export const COLS = 10;
export const ROWS = 20;
export const CELL_SIZE = 30;

export const SOFT_DROP_INTERVAL = 50;

export const LINES_PER_LEVEL = 10;
export const BASE_DROP_MS = 800;
export const MIN_DROP_MS = 80;
export const LEVEL_SPEED_FACTOR = 0.85;

export function getLevelFromLines(totalLines) {
  return Math.floor(totalLines / LINES_PER_LEVEL) + 1;
}

export function getDropInterval(level) {
  const ms = BASE_DROP_MS * Math.pow(LEVEL_SPEED_FACTOR, level - 1);
  return Math.max(MIN_DROP_MS, ms);
}

export const TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

export const TYPE_INDEX = {
  I: 1,
  O: 2,
  T: 3,
  S: 4,
  Z: 5,
  J: 6,
  L: 7,
};
