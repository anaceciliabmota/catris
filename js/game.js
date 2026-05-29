import { SOFT_DROP_INTERVAL, getDropInterval, getLevelFromLines, COLS, CELL_SIZE } from './constants.js';
import { createBag, pullFromBag } from './tetrominoes.js';
import {
  createBoard,
  mergePiece,
  clearRows,
  findFullRows,
  isSpawnBlocked,
  isBoardEmpty,
  classifyTSpin,
} from './board.js';
import {
  createPiece,
  movePiece,
  rotatePiece,
  hardDrop,
} from './piece.js';
import { createRenderer } from './renderer.js';
import { computeLockScore, computeDropScore } from './scoring.js';
import {
  loadHighScore,
  tryUpdateHighScore,
  loadScoreHistory,
  addScoreToHistory,
  formatScoreDate,
} from './highscore.js';
import { initCatSprites } from './catSprites.js';
import {
  enqueue,
  updateAnimations,
  isAnimating,
  createLineClearAnimation,
  createLevelUpAnimation,
  resetAnimations,
  clearParticles,
  spawnLineClearParticles,
  triggerScreenShake,
  updateParticles,
  decayScreenShake,
} from './animations.js';
import {
  initAudio,
  onUserGesture,
  startBgm,
  stopBgm,
  playSfx,
  toggleMute,
  bindMuteButton,
} from './audio.js';

const gameCanvas = document.getElementById('game');
const nextCanvas = document.getElementById('next');
const gameAreaEl = document.getElementById('game-area');
const scoreHistoryEl = document.getElementById('score-history');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const highScoreEl = document.getElementById('high-score');
const highScorePanel = document.querySelector('.high-score');
const statusEl = document.getElementById('status');
const muteBtn = document.getElementById('mute-btn');

const {
  render,
  drawOverlay,
  drawTitleOverlay,
  drawGameOverOverlay,
  renderTitleScreen,
} = createRenderer(gameCanvas, nextCanvas);

let board;
let bag;
let currentPiece;
let nextType;
let score;
let highScore;
let level;
let totalLines;
let backToBackReady;
let state;
let dropAccumulator;
let lastTimestamp;
let keysDown;
let repeatTimers;
let animationId;
let gameOverAt;
let lastGameWasNewRecord;

const REPEAT_INITIAL = 170;
const REPEAT_RATE = 50;
const GAMEOVER_DELAY_MS = 3500;

const MENU_START_KEYS = new Set(['Enter', 'NumpadEnter']);

function isMenuStartKey(code) {
  if (MENU_START_KEYS.has(code)) return true;
  if (code === 'Space' && (state === 'title' || state === 'gameover')) {
    return true;
  }
  return false;
}

initCatSprites();

function setUIState(newState) {
  state = newState;
  gameAreaEl.dataset.state = newState;
}

function updateScoreHistoryUI() {
  const history = loadScoreHistory();
  scoreHistoryEl.innerHTML = '';

  if (history.length === 0) {
    const li = document.createElement('li');
    li.className = 'score-history-empty';
    li.textContent = 'Nenhuma pontuação ainda';
    scoreHistoryEl.appendChild(li);
    return;
  }

  history.forEach((entry, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="rank">${index + 1}.</span>
      <span class="points">${entry.score}</span>
      <span class="date">${formatScoreDate(entry.date)}</span>
    `;
    scoreHistoryEl.appendChild(li);
  });
}

function bumpStat(el) {
  if (!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

function updateHUD(bumpScore = false) {
  scoreEl.textContent = String(score);
  levelEl.textContent = String(level);
  linesEl.textContent = String(totalLines);
  highScoreEl.textContent = String(highScore);
  if (bumpScore) {
    bumpStat(scoreEl);
  }
}

function checkHighScore() {
  const previous = highScore;
  highScore = tryUpdateHighScore(score);
  if (highScore > previous) {
    lastGameWasNewRecord = true;
    highScorePanel?.classList.add('is-new-record');
  }
  highScoreEl.textContent = String(highScore);
}

function addScore(points) {
  if (points > 0) {
    score += points;
    updateHUD(true);
    checkHighScore();
  }
}

function showTitle() {
  setUIState('title');
  stopBgm();
  resetAnimations();
  clearParticles();
  board = createBoard();
  currentPiece = null;
  nextType = null;
  keysDown = new Set();
  repeatTimers = {};
  gameOverAt = 0;
  highScore = loadHighScore();
  highScorePanel?.classList.remove('is-new-record');
  updateScoreHistoryUI();
  statusEl.hidden = true;

  if (!animationId) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  onUserGesture();
  playSfx('menuSelect');

  board = createBoard();
  bag = createBag();
  nextType = pullFromBag(bag);
  score = 0;
  highScore = loadHighScore();
  level = 1;
  totalLines = 0;
  backToBackReady = false;
  lastGameWasNewRecord = false;
  dropAccumulator = 0;
  lastTimestamp = 0;
  keysDown = new Set();
  repeatTimers = {};
  gameOverAt = 0;
  highScorePanel?.classList.remove('is-new-record');
  resetAnimations();

  updateHUD();
  statusEl.hidden = true;
  statusEl.classList.remove('paused');
  statusEl.textContent = '';

  setUIState('playing');
  startBgm();
  spawnPiece();

  if (!animationId) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function enterGameOver() {
  setUIState('gameover');
  stopBgm();
  playSfx('gameOver');
  gameOverAt = performance.now();
  checkHighScore();
  addScoreToHistory(score);
  updateScoreHistoryUI();
  statusEl.hidden = false;
  statusEl.textContent = `Pontuação: ${score}`;
  statusEl.classList.remove('paused');
  currentPiece = null;
}

function returnToTitle() {
  gameOverAt = 0;
  showTitle();
}

function spawnPiece() {
  const type = nextType;
  nextType = pullFromBag(bag);
  currentPiece = createPiece(type);

  if (isSpawnBlocked(board, currentPiece)) {
    enterGameOver();
  }
}

function applyLockScoring(ctx) {
  const {
    lines,
    tSpin,
    perfectClear,
    usedBackToBack,
    levelBefore,
  } = ctx;

  const { points, isDifficult } = computeLockScore({
    lines,
    tSpin,
    perfectClear,
    backToBack: usedBackToBack,
    level: levelBefore,
  });

  addScore(points);

  if (isDifficult) {
    backToBackReady = true;
  } else {
    backToBackReady = false;
  }

  if (lines > 0) {
    totalLines += lines;
    level = getLevelFromLines(totalLines);
    updateHUD();
    bumpStat(levelEl);
    bumpStat(linesEl);
  }

  return { levelBefore, lines };
}

function finishLockSequence() {
  currentPiece = null;
  spawnPiece();
}

function processAfterLineClear(levelBefore) {
  const levelAfter = getLevelFromLines(totalLines);

  const done = () => {
    setUIState('playing');
    finishLockSequence();
  };

  if (levelAfter > levelBefore) {
    enqueue(
      createLevelUpAnimation(
        levelAfter,
        gameCanvas.width,
        gameCanvas.height,
        () => {
          playSfx('levelUp');
          done();
        }
      )
    );
    setUIState('animating');
  } else {
    done();
  }
}

function startLockAnimations(fullRows, ctx) {
  const linesCount = fullRows.length;
  playSfx(linesCount >= 4 ? 'tetris' : 'lineClear');

  spawnLineClearParticles(fullRows, CELL_SIZE, COLS);
  if (linesCount >= 4) {
    triggerScreenShake(6);
  } else if (linesCount >= 2) {
    triggerScreenShake(3);
  }

  enqueue(
    createLineClearAnimation(fullRows, () => {
      const cleared = clearRows(board, fullRows);
      const perfectClear = isBoardEmpty(board);
      const usedBackToBack =
        backToBackReady && (cleared === 4 || ctx.tSpin !== 'none');

      applyLockScoring({
        lines: cleared,
        tSpin: ctx.tSpin,
        perfectClear,
        usedBackToBack,
        levelBefore: ctx.levelBefore,
      });
      processAfterLineClear(ctx.levelBefore);
    }, linesCount)
  );

  setUIState('animating');
}

function lockPiece() {
  const snapshot = {
    type: currentPiece.type,
    row: currentPiece.row,
    col: currentPiece.col,
    rotation: currentPiece.rotation,
    lastAction: currentPiece.lastAction,
    lastKick: currentPiece.lastKick,
  };

  mergePiece(board, currentPiece);
  playSfx('lock');

  const tSpin = classifyTSpin(board, snapshot);
  const fullRows = findFullRows(board);
  const levelBefore = level;

  const ctx = {
    tSpin,
    levelBefore,
  };

  if (fullRows.length > 0) {
    startLockAnimations(fullRows, ctx);
    return;
  }

  const perfectClear = isBoardEmpty(board);
  const usedBackToBack =
    backToBackReady && tSpin !== 'none';

  applyLockScoring({
    lines: 0,
    tSpin,
    perfectClear,
    usedBackToBack,
    levelBefore,
  });
  finishLockSequence();
}

function awardSoftDrop() {
  addScore(computeDropScore(1, 'soft', level));
}

function awardHardDrop(cells) {
  addScore(computeDropScore(cells, 'hard', level));
}

function tryMoveDown(fromSoftDrop = false) {
  if (!currentPiece || state !== 'playing') return false;

  if (movePiece(board, currentPiece, 1, 0)) {
    if (fromSoftDrop) {
      awardSoftDrop();
    }
    return true;
  }
  lockPiece();
  return false;
}

function updateStatusPause() {
  if (state === 'paused') {
    statusEl.hidden = false;
    statusEl.textContent = 'Pausado — Esc para menu';
    statusEl.classList.add('paused');
  } else if (state === 'playing') {
    statusEl.hidden = true;
    statusEl.classList.remove('paused');
  }
}

function handleHorizontal(delta) {
  for (const key of ['ArrowLeft', 'ArrowRight']) {
    if (!keysDown.has(key)) {
      delete repeatTimers[key];
      continue;
    }
    repeatTimers[key] = (repeatTimers[key] ?? 0) + delta;
    const threshold =
      repeatTimers[key] >= REPEAT_INITIAL ? REPEAT_RATE : REPEAT_INITIAL;
    if (repeatTimers[key] >= threshold) {
      const dir = key === 'ArrowLeft' ? -1 : 1;
      movePiece(board, currentPiece, 0, dir);
      repeatTimers[key] =
        repeatTimers[key] >= REPEAT_INITIAL
          ? repeatTimers[key] - REPEAT_RATE
          : 0;
    }
  }
}

function handleInput(delta) {
  if (!currentPiece || state !== 'playing') return;

  handleHorizontal(delta);

  if (keysDown.has('ArrowDown')) {
    tryMoveDown(true);
    dropAccumulator = 0;
  }
}

function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  updateParticles(delta);
  decayScreenShake(delta);

  if (state === 'animating') {
    updateAnimations(delta, gameCanvas.width, gameCanvas.height);
    render(board, null, nextType);
  } else if (state === 'playing' && currentPiece) {
    handleInput(delta);

    const interval = keysDown.has('ArrowDown')
      ? SOFT_DROP_INTERVAL
      : getDropInterval(level);

    dropAccumulator += delta;
    if (dropAccumulator >= interval) {
      tryMoveDown(false);
      dropAccumulator = 0;
    }

    render(board, currentPiece, nextType);
  } else if (state === 'title') {
    renderTitleScreen();
    drawTitleOverlay(highScore);
  } else if (state === 'gameover') {
    render(board, null, null);
    drawGameOverOverlay(score, lastGameWasNewRecord);

    if (gameOverAt && performance.now() - gameOverAt >= GAMEOVER_DELAY_MS) {
      returnToTitle();
    }
  } else if (state === 'paused') {
    render(board, currentPiece, nextType);
    drawOverlay('PAUSADO', 'P — continuar', 'Esc — voltar ao menu');
  }

  animationId = requestAnimationFrame(gameLoop);
}

function tryStartFromTitle() {
  if (state === 'title') {
    startGame();
    return true;
  }
  return false;
}

function skipGameOverToTitle() {
  if (state === 'gameover') {
    returnToTitle();
    return true;
  }
  return false;
}

function handleStartInteraction() {
  onUserGesture();
  if (tryStartFromTitle()) return;
  skipGameOverToTitle();
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') {
    e.preventDefault();
    toggleMute();
    return;
  }

  if (isMenuStartKey(e.code)) {
    e.preventDefault();
    handleStartInteraction();
    return;
  }

  if (state === 'title' || state === 'gameover') {
    if (e.code !== 'Tab') {
      e.preventDefault();
      handleStartInteraction();
    }
    return;
  }

  if (state === 'animating') {
    e.preventDefault();
    return;
  }

  const gameKeys = [
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Space',
    'KeyX',
    'KeyP',
    'Escape',
  ];

  if (gameKeys.includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === 'Escape') {
    if (state === 'playing' || state === 'paused') {
      showTitle();
    }
    return;
  }

  if (e.code === 'KeyP') {
    if (state === 'playing') {
      setUIState('paused');
      updateStatusPause();
    } else if (state === 'paused') {
      setUIState('playing');
      updateStatusPause();
      lastTimestamp = 0;
    }
    return;
  }

  if (state !== 'playing') return;

  keysDown.add(e.code);

  if (e.code === 'ArrowLeft') {
    movePiece(board, currentPiece, 0, -1);
    repeatTimers.ArrowLeft = 0;
  }
  if (e.code === 'ArrowRight') {
    movePiece(board, currentPiece, 0, 1);
    repeatTimers.ArrowRight = 0;
  }
  if (e.code === 'ArrowUp' || e.code === 'KeyX') {
    if (rotatePiece(board, currentPiece, 1)) {
      playSfx('rotate');
    }
  }
  if (e.code === 'ArrowDown') {
    tryMoveDown(true);
    dropAccumulator = 0;
  }
  if (e.code === 'Space' && currentPiece && !e.repeat) {
    const dropped = hardDrop(board, currentPiece);
    if (dropped > 0) {
      awardHardDrop(dropped);
    }
    lockPiece();
    keysDown.delete('Space');
  }
});

document.addEventListener('keyup', (e) => {
  keysDown.delete(e.code);
  delete repeatTimers[e.code];
});

gameCanvas.addEventListener('click', handleStartInteraction);
muteBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  onUserGesture();
  toggleMute();
});

initAudio();
bindMuteButton(muteBtn);
showTitle();
