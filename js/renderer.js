import { COLS, ROWS, CELL_SIZE, TYPE_INDEX } from './constants.js';
import { getShape } from './tetrominoes.js';
import { getGhostRow } from './board.js';
import { drawCatCell, drawCatPiece, drawCatPieceAt } from './catSprites.js';
import {
  getAnimationState,
  getLineClearFlashPhase,
  getLineClearScale,
  getLineClearRowOffset,
  getParticles,
  getScreenShake,
} from './animations.js';

const TYPE_FROM_INDEX = Object.fromEntries(
  Object.entries(TYPE_INDEX).map(([type, idx]) => [idx, type])
);

export function createRenderer(gameCanvas, nextCanvas) {
  const gameCtx = gameCanvas.getContext('2d');
  const nextCtx = nextCanvas.getContext('2d');
  const previewCell = 28;
  let overlayPulse = 0;

  function applyScreenShake() {
    const shake = getScreenShake();
    if (shake > 0.1) {
      const dx = (Math.random() - 0.5) * shake * 2;
      const dy = (Math.random() - 0.5) * shake * 2;
      gameCtx.translate(dx, dy);
    }
  }

  function drawBoardBackground() {
    const w = gameCanvas.width;
    const h = gameCanvas.height;

    const grad = gameCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fffaf5');
    grad.addColorStop(0.5, '#fff3eb');
    grad.addColorStop(1, '#ffe5dc');
    gameCtx.fillStyle = grad;
    gameCtx.fillRect(0, 0, w, h);

    gameCtx.fillStyle = 'rgba(255, 183, 197, 0.06)';
    for (let r = 0; r < ROWS; r += 2) {
      for (let c = 0; c < COLS; c += 2) {
        if ((r + c) % 4 === 0) {
          gameCtx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    gameCtx.strokeStyle = 'rgba(201, 123, 138, 0.15)';
    gameCtx.lineWidth = 3;
    gameCtx.strokeRect(1.5, 1.5, w - 3, h - 3);
  }

  function drawGrid() {
    gameCtx.strokeStyle = 'rgba(200, 150, 130, 0.28)';
    gameCtx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      gameCtx.beginPath();
      gameCtx.moveTo(c * CELL_SIZE, 0);
      gameCtx.lineTo(c * CELL_SIZE, ROWS * CELL_SIZE);
      gameCtx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      gameCtx.beginPath();
      gameCtx.moveTo(0, r * CELL_SIZE);
      gameCtx.lineTo(COLS * CELL_SIZE, r * CELL_SIZE);
      gameCtx.stroke();
    }
  }

  function drawBoard(board, flashRows = [], flashPhase = 0, anim = null) {
    const flashSet = new Set(flashRows);
    const scale = anim?.type === 'lineClear' ? getLineClearScale(anim) : 1;

    if (scale !== 1 && flashRows.length > 0) {
      const cy = (Math.min(...flashRows) + Math.max(...flashRows) + 1) * CELL_SIZE / 2;
      gameCtx.save();
      gameCtx.translate(gameCanvas.width / 2, cy);
      gameCtx.scale(scale, scale);
      gameCtx.translate(-gameCanvas.width / 2, -cy);
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const value = board[r][c];
        if (!value) continue;

        const type = TYPE_FROM_INDEX[value];
        const x = c * CELL_SIZE;
        let y = r * CELL_SIZE;

        if (flashSet.has(r)) {
          y += getLineClearRowOffset(anim, r);
          const glow = flashPhase * 0.9;
          gameCtx.fillStyle = `rgba(255, 240, 150, ${glow})`;
          gameCtx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          gameCtx.fillStyle = `rgba(255, 183, 197, ${glow * 0.5})`;
          gameCtx.fillRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
          const bounce = Math.sin(flashPhase * Math.PI * 4 + c * 0.4) * 3;
          drawCatCell(gameCtx, type, x, y - bounce, CELL_SIZE, 1);
        } else {
          drawCatCell(gameCtx, type, x, y, CELL_SIZE, 1);
        }
      }
    }

    if (scale !== 1 && flashRows.length > 0) {
      gameCtx.restore();
    }

    if (flashSet.size > 0 && flashPhase > 0.3) {
      for (const row of flashRows) {
        const y = row * CELL_SIZE + getLineClearRowOffset(anim, row);
        const sweep = (anim.elapsed / anim.duration) * gameCanvas.width;
        const grad = gameCtx.createLinearGradient(0, y, sweep, y);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, `rgba(255,255,255,${flashPhase * 0.35})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        gameCtx.fillStyle = grad;
        gameCtx.fillRect(0, y, gameCanvas.width, CELL_SIZE);
      }
    }
  }

  function drawPiece(piece, alpha = 1, rowOverride = null) {
    const row = rowOverride !== null ? rowOverride : piece.row;
    if (row + getShape(piece.type, piece.rotation).length <= 0) return;

    drawCatPiece(
      gameCtx,
      piece.type,
      piece.rotation,
      piece.col,
      row,
      CELL_SIZE,
      alpha
    );
  }

  function drawParticles() {
    for (const p of getParticles()) {
      const alpha = Math.min(1, p.life / (p.maxLife * 0.6));
      gameCtx.save();
      gameCtx.globalAlpha = alpha;
      gameCtx.translate(p.x, p.y);
      gameCtx.rotate(p.rotation);

      if (p.kind === 'heart') {
        gameCtx.fillStyle = '#ff6b9d';
        gameCtx.font = `${p.size}px serif`;
        gameCtx.textAlign = 'center';
        gameCtx.textBaseline = 'middle';
        gameCtx.fillText('♥', 0, 0);
      } else if (p.kind === 'spark') {
        gameCtx.fillStyle = '#fff8a0';
        gameCtx.shadowColor = '#ffb347';
        gameCtx.shadowBlur = 6;
        gameCtx.beginPath();
        gameCtx.arc(0, 0, p.size, 0, Math.PI * 2);
        gameCtx.fill();
        gameCtx.shadowBlur = 0;
      } else {
        gameCtx.font = `${p.size}px serif`;
        gameCtx.textAlign = 'center';
        gameCtx.textBaseline = 'middle';
        gameCtx.fillText('🐾', 0, 0);
      }
      gameCtx.restore();
    }
  }

  function drawLevelUpBanner(anim) {
    if (!anim || anim.type !== 'levelUp') return;

    const enter = Math.min(1, anim.elapsed / 350);
    const exit = anim.elapsed > anim.duration - 300
      ? (anim.duration - anim.elapsed) / 300
      : 1;
    const alpha = enter * exit;
    const bounce = 1 + Math.sin(anim.elapsed * 0.012) * 0.04;
    const cx = gameCanvas.width / 2;
    const cy = gameCanvas.height / 2 - 50;

    gameCtx.save();
    gameCtx.globalAlpha = alpha;
    gameCtx.translate(cx, cy);
    gameCtx.scale(bounce * (0.85 + enter * 0.15), bounce * (0.85 + enter * 0.15));

    gameCtx.shadowColor = 'rgba(255, 107, 157, 0.5)';
    gameCtx.shadowBlur = 20;

    const w = 220;
    const h = 64;
    const grad = gameCtx.createLinearGradient(0, -h / 2, 0, h / 2);
    grad.addColorStop(0, '#ffd4e0');
    grad.addColorStop(1, '#ffb7c5');
    gameCtx.fillStyle = grad;
    gameCtx.strokeStyle = '#c97b8a';
    gameCtx.lineWidth = 3;
    gameCtx.beginPath();
    gameCtx.roundRect(-w / 2, -h / 2, w, h, 16);
    gameCtx.fill();
    gameCtx.stroke();
    gameCtx.shadowBlur = 0;

    gameCtx.fillStyle = '#5c3d4a';
    gameCtx.font = 'bold 24px Fredoka, Nunito, sans-serif';
    gameCtx.textAlign = 'center';
    gameCtx.textBaseline = 'middle';
    gameCtx.fillText(`Miau! Nível ${anim.newLevel}`, 0, 6);
    gameCtx.font = '18px serif';
    gameCtx.fillText('🐱', 0, -22);
    gameCtx.restore();
  }

  function drawNext(type) {
    const grad = nextCtx.createLinearGradient(0, 0, 0, nextCanvas.height);
    grad.addColorStop(0, '#fffaf5');
    grad.addColorStop(1, '#ffe8e0');
    nextCtx.fillStyle = grad;
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!type) return;

    const shape = getShape(type, 0);
    const w = shape[0].length * previewCell;
    const h = shape.length * previewCell;
    const offsetX = (nextCanvas.width - w) / 2;
    const offsetY = (nextCanvas.height - h) / 2;

    nextCtx.save();
    nextCtx.translate(offsetX, offsetY);
    const bob = Math.sin(overlayPulse * 0.04) * 2;
    nextCtx.translate(0, bob);
    drawCatPieceAt(nextCtx, type, 0, 0, 0, previewCell, 1);
    nextCtx.restore();
  }

  function render(board, piece, nextType) {
    overlayPulse++;
    gameCtx.save();
    applyScreenShake();

    drawBoardBackground();
    drawGrid();

    const anim = getAnimationState();
    let flashRows = [];
    let flashPhase = 0;

    if (anim?.type === 'lineClear') {
      flashRows = anim.rows;
      flashPhase = getLineClearFlashPhase(anim);
    }

    drawBoard(board, flashRows, flashPhase, anim);

    if (piece) {
      const ghostRow = getGhostRow(board, piece);
      if (ghostRow !== piece.row) {
        drawPiece(piece, 0.2, ghostRow);
      }
      drawPiece(piece, 1);
    }

    drawParticles();
    drawLevelUpBanner(anim);
    gameCtx.restore();

    drawNext(nextType);
  }

  function drawOverlayCard(cx, cy, w, h) {
    gameCtx.save();
    gameCtx.shadowColor = 'rgba(0,0,0,0.25)';
    gameCtx.shadowBlur = 24;
    const grad = gameCtx.createLinearGradient(cx, cy - h / 2, cx, cy + h / 2);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(1, 'rgba(255,232,224,0.95)');
    gameCtx.fillStyle = grad;
    gameCtx.strokeStyle = '#ffb7c5';
    gameCtx.lineWidth = 3;
    gameCtx.beginPath();
    gameCtx.roundRect(cx - w / 2, cy - h / 2, w, h, 18);
    gameCtx.fill();
    gameCtx.stroke();
    gameCtx.shadowBlur = 0;
    gameCtx.restore();
  }

  function drawOverlay(message, submessage = '', submessage2 = '', accent = '') {
    gameCtx.fillStyle = 'rgba(92, 61, 74, 0.72)';
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    const cx = gameCanvas.width / 2;
    const cy = gameCanvas.height / 2;
    const cardH = submessage2 ? 160 : submessage ? 130 : 100;
    drawOverlayCard(cx, cy, 260, cardH);

    gameCtx.textAlign = 'center';
    gameCtx.textBaseline = 'middle';
    gameCtx.fillStyle = '#c97b8a';
    gameCtx.font = '28px serif';
    gameCtx.fillText(accent || '🐱', cx, cy - cardH / 2 + 28);

    gameCtx.fillStyle = '#5c3d4a';
    gameCtx.font = 'bold 26px Fredoka, Nunito, sans-serif';
    gameCtx.fillText(message, cx, cy - 8);

    if (submessage) {
      gameCtx.font = '600 16px Nunito, sans-serif';
      gameCtx.fillStyle = '#7a5a66';
      gameCtx.fillText(submessage, cx, cy + 22);
    }

    if (submessage2) {
      gameCtx.font = '14px Nunito, sans-serif';
      gameCtx.fillStyle = '#c97b8a';
      gameCtx.fillText(submessage2, cx, cy + 48);
    }

    gameCtx.textAlign = 'left';
    gameCtx.textBaseline = 'alphabetic';
  }

  function drawTitleOverlay(highScore) {
    const bob = Math.sin(overlayPulse * 0.05) * 3;
    gameCtx.save();
    gameCtx.translate(0, bob);
    drawOverlay(
      'Catris',
      highScore > 0 ? `Recorde: ${highScore} pts` : 'Tetris dos Gatinhos',
      'Clique, Enter ou Espaço para começar',
      '🐱'
    );
    gameCtx.restore();
  }

  function drawGameOverOverlay(finalScore, isNewRecord) {
    const sub2 = isNewRecord
      ? 'Novo recorde! Os gatos estão orgulhosos 🐾'
      : 'A voltar ao menu...';
    drawOverlay(
      'GAME OVER',
      `Pontuação: ${finalScore}`,
      sub2,
      isNewRecord ? '🏆' : '😿'
    );
  }

  function renderTitleScreen() {
    overlayPulse++;
    drawBoardBackground();
    drawGrid();
    nextCtx.fillStyle = '#fffaf5';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  }

  return {
    render,
    drawOverlay,
    drawTitleOverlay,
    drawGameOverOverlay,
    renderTitleScreen,
  };
}
