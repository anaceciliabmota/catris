export const SCORE = {
  line: { 1: 100, 2: 300, 3: 500, 4: 800 },
  tspinMini: { 0: 100, 1: 200 },
  tspin: { 1: 400, 2: 1200, 3: 1600 },
  perfectClear: { 1: 800, 2: 1200, 3: 1800, 4: 2000 },
  perfectClearTetrisB2B: 3200,
  softDropPerCell: 1,
  hardDropPerCell: 2,
};

function lookupBase(table, lines) {
  return table[lines] ?? 0;
}

export function computeLockScore({
  lines,
  tSpin,
  perfectClear,
  backToBack,
  level,
}) {
  if (lines === 0 && tSpin === 'none') {
    return { points: 0, isDifficult: false };
  }

  let base = 0;

  if (perfectClear && lines === 4 && backToBack) {
    base = SCORE.perfectClearTetrisB2B;
  } else if (perfectClear) {
    base = lookupBase(SCORE.perfectClear, lines);
  } else if (tSpin === 'mini') {
    base = lookupBase(SCORE.tspinMini, lines);
  } else if (tSpin === 'full') {
    base = lookupBase(SCORE.tspin, lines);
  } else if (lines > 0) {
    base = lookupBase(SCORE.line, lines);
  }

  const isDifficult = lines === 4 || tSpin !== 'none';
  const points = base * level;

  return { points, isDifficult };
}

export function computeDropScore(cells, kind, level) {
  const perCell =
    kind === 'hard' ? SCORE.hardDropPerCell : SCORE.softDropPerCell;
  return cells * perCell * level;
}
