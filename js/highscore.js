const HIGH_SCORE_KEY = 'tetris-high-score';
const HISTORY_KEY = 'tetris-score-history';
const MAX_HISTORY = 10;

export function loadHighScore() {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    const value = parseInt(raw, 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(value) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(value));
  } catch {
    // localStorage indisponível
  }
}

export function tryUpdateHighScore(score) {
  const current = loadHighScore();
  if (score > current) {
    saveHighScore(score);
    return score;
  }
  return current;
}

export function loadScoreHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((e) => typeof e.score === 'number' && e.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

function saveScoreHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function addScoreToHistory(score) {
  if (score <= 0) return loadScoreHistory();

  const history = loadScoreHistory();
  history.push({
    score,
    date: new Date().toISOString(),
  });
  history.sort((a, b) => b.score - a.score);
  const trimmed = history.slice(0, MAX_HISTORY);
  saveScoreHistory(trimmed);
  return trimmed;
}

export function formatScoreDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  } catch {
    return '—';
  }
}
