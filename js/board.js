import { COLS, ROWS, TYPE_INDEX } from './constants.js';
import { getShape } from './tetrominoes.js';

export function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

export function collides(board, type, row, col, rotation) {
  const shape = getShape(type, rotation);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;

      const boardRow = row + r;
      const boardCol = col + c;

      if (boardCol < 0 || boardCol >= COLS || boardRow >= ROWS) {
        return true;
      }
      if (boardRow >= 0 && board[boardRow][boardCol] !== 0) {
        return true;
      }
    }
  }
  return false;
}

export function mergePiece(board, piece) {
  const shape = getShape(piece.type, piece.rotation);
  const value = TYPE_INDEX[piece.type];

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const boardRow = piece.row + r;
      const boardCol = piece.col + c;
      if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
        board[boardRow][boardCol] = value;
      }
    }
  }
}

export function findFullRows(board) {
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every((cell) => cell !== 0)) {
      rows.push(r);
    }
  }
  return rows;
}

export function clearRows(board, rowIndices) {
  if (rowIndices.length === 0) return 0;

  const sorted = [...rowIndices].sort((a, b) => b - a);
  for (const r of sorted) {
    board.splice(r, 1);
    board.unshift(Array(COLS).fill(0));
  }
  return sorted.length;
}

export function clearLines(board) {
  return clearRows(board, findFullRows(board));
}

export function isSpawnBlocked(board, piece) {
  return collides(board, piece.type, piece.row, piece.col, piece.rotation);
}

export function getGhostRow(board, piece) {
  let ghostRow = piece.row;
  while (!collides(board, piece.type, ghostRow + 1, piece.col, piece.rotation)) {
    ghostRow++;
  }
  return ghostRow;
}

export function isBoardEmpty(board) {
  return board.every((row) => row.every((cell) => cell === 0));
}

function isCornerBlocked(board, row, col) {
  if (col < 0 || col >= COLS || row >= ROWS) {
    return true;
  }
  if (row < 0) {
    return false;
  }
  return board[row][col] !== 0;
}

export function countFilledCorners(board, piece) {
  const shape = getShape(piece.type, piece.rotation);
  let pivotRow = null;
  let pivotCol = null;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const neighbors = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ];
      let filledNeighbors = 0;
      for (const [nr, nc] of neighbors) {
        if (nr < 0 || nr >= shape.length || nc < 0 || nc >= shape[nr].length) {
          continue;
        }
        if (shape[nr][nc]) filledNeighbors++;
      }
      if (filledNeighbors >= 2) {
        pivotRow = piece.row + r;
        pivotCol = piece.col + c;
        break;
      }
    }
    if (pivotRow !== null) break;
  }

  if (pivotRow === null) {
    return 0;
  }

  const corners = [
    [pivotRow - 1, pivotCol - 1],
    [pivotRow - 1, pivotCol + 1],
    [pivotRow + 1, pivotCol - 1],
    [pivotRow + 1, pivotCol + 1],
  ];

  return corners.filter(([r, c]) => isCornerBlocked(board, r, c)).length;
}

export function classifyTSpin(board, piece) {
  if (piece.type !== 'T' || piece.lastAction !== 'rotate') {
    return 'none';
  }

  const corners = countFilledCorners(board, piece);

  if (corners >= 3) {
    return 'full';
  }
  if (corners === 2 && piece.lastKick !== 0) {
    return 'mini';
  }
  return 'none';
}
