import { collides } from './board.js';

const SPAWN_COL = {
  I: 3,
  O: 4,
  T: 3,
  S: 3,
  Z: 3,
  J: 3,
  L: 3,
};

const SPAWN_ROW = {
  I: -1,
  O: -1,
  T: 0,
  S: 0,
  Z: 0,
  J: 0,
  L: 0,
};

export function createPiece(type) {
  return {
    type,
    row: SPAWN_ROW[type] ?? 0,
    col: SPAWN_COL[type] ?? 3,
    rotation: 0,
    lastAction: 'none',
    lastKick: 0,
  };
}

export function movePiece(board, piece, dRow, dCol) {
  const newRow = piece.row + dRow;
  const newCol = piece.col + dCol;
  if (!collides(board, piece.type, newRow, newCol, piece.rotation)) {
    piece.row = newRow;
    piece.col = newCol;
    piece.lastAction = 'move';
    return true;
  }
  return false;
}

export function rotatePiece(board, piece, direction = 1) {
  const rotations = 4;
  const newRotation = (piece.rotation + direction + rotations) % rotations;

  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collides(board, piece.type, piece.row, piece.col + kick, newRotation)) {
      piece.rotation = newRotation;
      piece.col += kick;
      piece.lastAction = 'rotate';
      piece.lastKick = kick;
      return true;
    }
  }
  return false;
}

export function hardDrop(board, piece) {
  let distance = 0;
  while (movePiece(board, piece, 1, 0)) {
    distance++;
  }
  return distance;
}
