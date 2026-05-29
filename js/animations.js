const LINE_CLEAR_DURATION = 650;
const LEVEL_UP_DURATION = 1400;

let queue = [];
let current = null;
let particles = [];
let screenShake = 0;

function spawnParticles(count, canvasWidth, canvasHeight, kind = 'paw', origin = null) {
  for (let i = 0; i < count; i++) {
    const ox = origin
      ? origin.x + (Math.random() - 0.5) * (origin.w || 80)
      : canvasWidth * (0.2 + Math.random() * 0.6);
    const oy = origin
      ? origin.y + (Math.random() - 0.5) * (origin.h || 40)
      : canvasHeight * (0.2 + Math.random() * 0.5);

    particles.push({
      x: ox,
      y: oy,
      vx: (Math.random() - 0.5) * (kind === 'spark' ? 180 : 100),
      vy: -60 - Math.random() * (kind === 'spark' ? 140 : 90),
      life: 600 + Math.random() * 500,
      maxLife: 1100,
      kind,
      size: kind === 'spark' ? 4 + Math.random() * 5 : 8 + Math.random() * 12,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.012,
    });
  }
}

export function spawnLineClearParticles(rows, cellSize, cols) {
  for (const row of rows) {
    spawnParticles(6, cols * cellSize, 0, 'spark', {
      x: (cols * cellSize) / 2,
      y: row * cellSize + cellSize / 2,
      w: cols * cellSize,
      h: cellSize,
    });
    spawnParticles(2, cols * cellSize, 0, 'paw', {
      x: (cols * cellSize) / 2,
      y: row * cellSize + cellSize / 2,
      w: cols * cellSize,
      h: cellSize,
    });
  }
}

export function triggerScreenShake(intensity = 4) {
  screenShake = Math.max(screenShake, intensity);
}

export function getScreenShake() {
  return screenShake;
}

export function decayScreenShake(delta) {
  if (screenShake > 0) {
    screenShake = Math.max(0, screenShake - delta * 0.02);
  }
}

export function clearParticles() {
  particles = [];
}

export function getParticles() {
  return particles;
}

export function updateParticles(delta) {
  particles = particles.filter((p) => {
    p.life -= delta;
    p.x += p.vx * (delta / 1000);
    p.y += p.vy * (delta / 1000);
    p.vy += 220 * (delta / 1000);
    p.rotation += p.spin * delta;
    return p.life > 0;
  });
}

export function enqueue(animation) {
  queue.push(animation);
  if (!current) {
    current = queue.shift();
    current.elapsed = 0;
  }
}

export function isAnimating() {
  return current !== null || queue.length > 0;
}

export function getAnimationState() {
  return current;
}

export function updateAnimations(delta, canvasWidth, canvasHeight) {
  updateParticles(delta);
  decayScreenShake(delta);

  if (!current) {
    if (queue.length > 0) {
      current = queue.shift();
      current.elapsed = 0;
    }
    return false;
  }

  current.elapsed += delta;

  if (current.elapsed >= current.duration) {
    if (current.onComplete) current.onComplete(current);
    current = queue.length > 0 ? queue.shift() : null;
    if (current) current.elapsed = 0;
    return !current;
  }

  return true;
}

export function createLineClearAnimation(rows, onComplete, lineCount = rows.length) {
  return {
    type: 'lineClear',
    rows,
    lineCount,
    duration: LINE_CLEAR_DURATION,
    elapsed: 0,
    onComplete,
  };
}

export function createLevelUpAnimation(newLevel, canvasWidth, canvasHeight, onComplete) {
  spawnParticles(24, canvasWidth, canvasHeight, 'heart');
  spawnParticles(10, canvasWidth, canvasHeight, 'paw');
  triggerScreenShake(3);
  return {
    type: 'levelUp',
    newLevel,
    duration: LEVEL_UP_DURATION,
    elapsed: 0,
    onComplete,
  };
}

export function getLineClearFlashPhase(anim) {
  if (!anim || anim.type !== 'lineClear') return 0;
  const t = anim.elapsed / anim.duration;
  const pulse = Math.abs(Math.sin(t * Math.PI * 5));
  return pulse * (1 - t * 0.25);
}

export function getLineClearScale(anim) {
  if (!anim || anim.type !== 'lineClear') return 1;
  const t = anim.elapsed / anim.duration;
  if (t < 0.15) return 1 + t * 0.15;
  if (t > 0.75) return 1 - (t - 0.75) * 1.2;
  return 1.02;
}

export function getLineClearRowOffset(anim, row) {
  if (!anim || anim.type !== 'lineClear') return 0;
  const t = anim.elapsed / anim.duration;
  const bounce = Math.sin(t * Math.PI * 3 + row * 0.5) * 4 * (1 - t);
  const squeeze = t > 0.7 ? (t - 0.7) * 40 : 0;
  return -bounce - squeeze;
}

export function resetAnimations() {
  queue = [];
  current = null;
  particles = [];
  screenShake = 0;
}
