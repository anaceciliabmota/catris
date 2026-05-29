import { TYPES } from './constants.js';
import { getShape } from './tetrominoes.js';

const CELL_SPRITE_SIZE = 32;
const cellSprites = {};
const pieceSprites = new Map();
const imageSprites = {};

export const CAT_STYLES = {
  I: { body: '#e8d5c4', ears: '#8b6f5c', eyes: '#4a90d9', belly: '#f5ebe0', tail: '#8b6f5c', nose: '#c97b8a' },
  O: { body: '#ffb347', ears: '#e8952a', eyes: '#2d2d2d', belly: '#ffd89a', tail: '#e8952a', nose: '#c97b8a' },
  T: { body: '#c9a0dc', ears: '#9b6bb8', eyes: '#ff6b9d', belly: '#e8d0f0', tail: '#9b6bb8', nose: '#c97b8a' },
  S: { body: '#90ee90', ears: '#5cb85c', eyes: '#2d5a2d', belly: '#c8f5c8', tail: '#5cb85c', nose: '#c97b8a' },
  Z: { body: '#f4a460', ears: '#d2691e', eyes: '#2d2d2d', belly: '#ffd4a8', tail: '#d2691e', nose: '#c97b8a' },
  J: { body: '#87ceeb', ears: '#5ba3c6', eyes: '#1a4a6e', belly: '#d4f0ff', tail: '#5ba3c6', nose: '#c97b8a' },
  L: { body: '#fff8dc', ears: '#deb887', eyes: '#8b4513', belly: '#fffef5', tail: '#deb887', nose: '#c97b8a' },
};

function getCells(shape) {
  const cells = [];
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) cells.push({ r, c });
    }
  }
  return cells;
}

function cellKey(r, c, cells) {
  return cells.some((x) => x.r === r && x.c === c);
}

function drawCatHead(ctx, cx, cy, style, scale = 1) {
  const s = scale;
  ctx.fillStyle = style.ears;
  ctx.beginPath();
  ctx.moveTo(cx - 7 * s, cy - 6 * s);
  ctx.lineTo(cx - 9 * s, cy - 14 * s);
  ctx.lineTo(cx - 2 * s, cy - 8 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 7 * s, cy - 6 * s);
  ctx.lineTo(cx + 9 * s, cy - 14 * s);
  ctx.lineTo(cx + 2 * s, cy - 8 * s);
  ctx.fill();

  ctx.fillStyle = style.body;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 11 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = style.eyes;
  ctx.beginPath();
  ctx.ellipse(cx - 4 * s, cy + 1 * s, 2.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 4 * s, cy + 1 * s, 2.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - 3 * s, cy, 1 * s, 0, Math.PI * 2);
  ctx.arc(cx + 5 * s, cy, 1 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = style.nose;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 4 * s);
  ctx.lineTo(cx - 2 * s, cy + 6 * s);
  ctx.lineTo(cx + 2 * s, cy + 6 * s);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#5c4a3a';
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 2 * s, cy + 7 * s);
  ctx.quadraticCurveTo(cx, cy + 9 * s, cx + 2 * s, cy + 7 * s);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(90,70,60,0.5)';
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 3 * s, cy + 5 * s);
  ctx.lineTo(cx - 12 * s, cy + 4 * s);
  ctx.moveTo(cx + 3 * s, cy + 5 * s);
  ctx.lineTo(cx + 12 * s, cy + 4 * s);
  ctx.stroke();
}

function drawCatTail(ctx, x, y, style, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = style.tail;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, -6, 14, 2);
  ctx.quadraticCurveTo(18, 10, 10, 14);
  ctx.stroke();
  ctx.restore();
}

function drawCatPaws(ctx, cx, baseY, style) {
  ctx.fillStyle = style.belly;
  for (const ox of [-8, 8]) {
    ctx.beginPath();
    ctx.ellipse(cx + ox, baseY, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Gato inteiro numa única célula (tabuleiro fixo). */
function drawWholeCatInCell(ctx, size, style) {
  const cx = size / 2;
  const cy = size / 2;

  drawCatTail(ctx, size * 0.15, size * 0.72, style, 0.4);

  ctx.fillStyle = style.body;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, size * 0.38, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = style.belly;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  drawCatPaws(ctx, cx, size * 0.88, style);
  drawCatHead(ctx, cx, cy - 2, style, size / 30);
}

function buildCellSprite(type) {
  const canvas = document.createElement('canvas');
  canvas.width = CELL_SPRITE_SIZE;
  canvas.height = CELL_SPRITE_SIZE;
  const ctx = canvas.getContext('2d');
  drawWholeCatInCell(ctx, CELL_SPRITE_SIZE, CAT_STYLES[type]);
  return canvas;
}

function pickHeadCell(cells, type) {
  if (type === 'I') {
    const sorted = [...cells].sort((a, b) => a.c - b.c || a.r - b.r);
    return sorted[0];
  }
  return cells.reduce((best, cell) =>
    cell.r < best.r || (cell.r === best.r && cell.c < best.c) ? cell : best
  );
}

function pickTailCell(cells, head) {
  let tail = cells[0];
  let maxDist = -1;
  for (const cell of cells) {
    const d = (cell.r - head.r) ** 2 + (cell.c - head.c) ** 2;
    if (d > maxDist) {
      maxDist = d;
      tail = cell;
    }
  }
  return tail;
}

/** Gato unificado na forma da peça (L = gato em L, I = gato comprido, etc.). */
function drawPieceShapeCat(ctx, shape, cellSize, style, type) {
  const cells = getCells(shape);
  if (cells.length === 0) return;

  if (type === 'O' && cells.length === 4) {
    const cx = cells[0].c * cellSize + cellSize;
    const cy = cells[0].r * cellSize + cellSize;
    ctx.fillStyle = style.body;
    ctx.beginPath();
    ctx.arc(cx, cy, cellSize * 0.88, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = style.belly;
    ctx.beginPath();
    ctx.arc(cx, cy + 4, cellSize * 0.45, 0, Math.PI * 2);
    ctx.fill();
    drawCatHead(ctx, cx, cy - cellSize * 0.25, style, 1.15);
    drawCatTail(ctx, cx + cellSize * 0.7, cy + cellSize * 0.5, style, -0.5);
    return;
  }

  if (type === 'I' && cells.length >= 4) {
    const sorted = [...cells].sort((a, b) => a.c - b.c || a.r - b.r);
    const vertical = sorted.every((c) => c.c === sorted[0].c);
    if (vertical) {
      sorted.sort((a, b) => a.r - b.r);
    }
    const x0 = sorted[0].c * cellSize + cellSize / 2;
    const y0 = sorted[0].r * cellSize + cellSize / 2;
    const x1 = sorted[sorted.length - 1].c * cellSize + cellSize / 2;
    const y1 = sorted[sorted.length - 1].r * cellSize + cellSize / 2;
    ctx.strokeStyle = style.body;
    ctx.lineWidth = cellSize * 0.62;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.fillStyle = style.belly;
    ctx.lineWidth = cellSize * 0.28;
    ctx.strokeStyle = style.belly;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    drawCatHead(ctx, x0, y0 - cellSize * 0.22, style, 0.95);
    drawCatTail(ctx, x1, y1 + cellSize * 0.12, style, vertical ? 0.3 : 0.2);
    return;
  }

  const pad = 3;

  ctx.fillStyle = style.body;
  for (const { r, c } of cells) {
    const x = c * cellSize;
    const y = r * cellSize;
    ctx.beginPath();
    ctx.roundRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, 10);
    ctx.fill();
  }

  for (const { r, c } of cells) {
    const x = c * cellSize + cellSize / 2;
    const y = r * cellSize + cellSize / 2;
    if (cellKey(r, c + 1, cells)) {
      ctx.fillRect(c * cellSize + cellSize - pad, r * cellSize + pad, pad * 2, cellSize - pad * 2);
    }
    if (cellKey(r + 1, c, cells)) {
      ctx.fillRect(c * cellSize + pad, r * cellSize + cellSize - pad, cellSize - pad * 2, pad * 2);
    }
  }

  ctx.fillStyle = style.belly;
  for (const { r, c } of cells) {
    const x = c * cellSize + cellSize / 2;
    const y = r * cellSize + cellSize / 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 2, cellSize * 0.18, cellSize * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const head = pickHeadCell(cells, type);
  const tail = pickTailCell(cells, head);
  const hx = head.c * cellSize + cellSize / 2;
  const hy = head.r * cellSize + cellSize * 0.35;
  const tx = tail.c * cellSize + cellSize * 0.2;
  const ty = tail.r * cellSize + cellSize * 0.75;

  const tailAngle =
    Math.atan2(tail.r - head.r, tail.c - head.c) + Math.PI / 2;
  drawCatTail(ctx, tx, ty, style, tailAngle);

  drawCatHead(ctx, hx, hy, style, Math.min(1, cellSize / 30));
}

function buildPieceSprite(type, rotation, cellSize) {
  const shape = getShape(type, rotation);
  const rows = shape.length;
  const cols = shape[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext('2d');
  drawPieceShapeCat(ctx, shape, cellSize, CAT_STYLES[type], type);
  return { canvas, cols, rows };
}

function pieceCacheKey(type, rotation, cellSize) {
  return `${type}-${rotation}-${cellSize}`;
}

function getPieceSprite(type, rotation, cellSize) {
  const key = pieceCacheKey(type, rotation, cellSize);
  if (!pieceSprites.has(key)) {
    pieceSprites.set(key, buildPieceSprite(type, rotation, cellSize));
  }
  return pieceSprites.get(key);
}

export function initCatSprites() {
  for (const type of TYPES) {
    cellSprites[type] = buildCellSprite(type);
    for (let rot = 0; rot < 4; rot++) {
      getPieceSprite(type, rot, CELL_SPRITE_SIZE);
    }
    const img = new Image();
    img.src = `assets/cats/cat-${type.toLowerCase()}.png`;
    img.onload = () => {
      imageSprites[type] = img;
    };
  }
}

/** Célula fixa no tabuleiro — um gato sentado inteiro. */
export function drawCatCell(ctx, type, x, y, size, alpha = 1) {
  const sprite = cellSprites[type];
  if (!sprite) return;

  const pad = 1;
  const drawSize = size - pad * 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, x + pad, y + pad, drawSize, drawSize);
  ctx.restore();
}

/** Peça ativa ou preview — gato na forma do tetraminó. */
export function drawCatPiece(ctx, type, rotation, col, row, cellSize, alpha = 1) {
  const { canvas } = getPieceSprite(type, rotation, cellSize);
  const shape = getShape(type, rotation);
  const w = shape[0].length * cellSize;
  const h = shape.length * cellSize;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(canvas, col * cellSize, row * cellSize, w, h);
  ctx.restore();
}

export function drawCatPieceAt(ctx, type, rotation, x, y, cellSize, alpha = 1) {
  const { canvas } = getPieceSprite(type, rotation, cellSize);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(canvas, x, y, canvas.width, canvas.height);
  ctx.restore();
}

export function getCatStyle(type) {
  return CAT_STYLES[type] || CAT_STYLES.I;
}
