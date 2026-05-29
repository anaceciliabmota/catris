---
name: Menu, Game Over e High Scores
overview: Tela de abertura com interação do usuário, retorno ao menu após game over, histórico das 10 melhores pontuações e recorde persistente em localStorage.
status: implemented
---

# Plano (implementado): Menu, game over e high scores

Funcionalidades implementadas fora de um ficheiro de plano formal original, documentadas aqui para referência.

## Tela de abertura

- Estado `title` ao carregar o jogo (`showTitle()`).
- Canvas com overlay **Catris** / instruções.
- Painel lateral **Melhores pontuações** (top 10 com data).
- Início por clique no canvas, **Enter**, **Espaço** (só no menu) ou qualquer tecla.

## Game over → menu

- Overlay **GAME OVER** com pontuação da partida.
- Após ~3,5 s volta ao menu automaticamente.
- Clique ou tecla antecipa o retorno.
- Pontuação registada no histórico e no recorde se aplicável.

## High scores

- [`js/highscore.js`](js/highscore.js):
  - `tetris-high-score` — melhor pontuação única.
  - `tetris-score-history` — array das 10 melhores (score + date ISO).
- HUD durante o jogo: recorde em tempo real.
- Destaque verde quando bate recorde na partida.

## Estados do jogo

```
title → playing → animating → playing
playing → gameover → title
playing ↔ paused
playing → title (Esc)
```

## Ficheiros principais

- [`js/game.js`](js/game.js) — máquina de estados, `showTitle`, `startGame`, `enterGameOver`
- [`index.html`](index.html) — painéis `#scores-panel`, `#stats-panel`
- [`css/style.css`](css/style.css) — visibilidade por `data-state`

## Notas

- **Espaço** no menu inicia o jogo; durante `playing`, **Espaço** é hard drop (corrigido separando `isMenuStartKey` de controles de jogo).
