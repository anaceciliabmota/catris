# Catris — Tetris dos Gatos

Jogo Tetris em HTML5 Canvas e JavaScript (módulos ES), com tema de gatinhos, animações, trilha sonora (Web Audio), níveis, pontuação clássica e histórico de recordes.

## Como executar

Os módulos ES exigem um servidor HTTP local:

```bash
cd /home/cecilia/Documents/prog-agentes/ativ2
python3 -m http.server 8080
```

Abra [http://localhost:8080](http://localhost:8080) no navegador.

## Controles

| Tecla | Ação |
|-------|------|
| ← → | Mover |
| ↑ ou X | Girar |
| ↓ | Queda rápida (+1 × nível por célula) |
| Espaço | Queda instantânea (+2 × nível por célula) |
| P | Pausar / continuar |
| Esc | Voltar ao menu |
| Enter / Espaço / clique | Começar (menu) ou saltar game over |
| M | Ligar/desligar som |

## Níveis

- Começa no **nível 1**.
- A cada **10 linhas** limpas no total, o nível sobe.
- A gravidade acelera: intervalo base 800 ms, reduzido ~15% por nível (mínimo 80 ms).

## Pontuação

Todas as jogadas de lock usam **pontuação-base × nível atual**.

### Linhas

| Jogada | Base |
|--------|------|
| 1 linha | 100 |
| 2 linhas | 300 |
| 3 linhas | 500 |
| Tetris (4 linhas) | 800 |

### T-spin (peça T, última ação = rotação)

| Jogada | Base |
|--------|------|
| Mini T-spin (0 linhas) | 100 |
| 1 linha + mini | 200 |
| 1 linha + T-spin | 400 |
| 2 linhas + T-spin | 1200 |
| 3 linhas + T-spin | 1600 |

### Perfect clear (tabuleiro vazio após o clear)

| Linhas | Base |
|--------|------|
| 1 | 800 |
| 2 | 1200 |
| 3 | 1800 |
| 4 (Tetris) | 2000 |
| 4 + back-to-back | 3200 |

### Quedas manuais

| Ação | Base por célula |
|------|-----------------|
| Queda rápida (↓) | 1 × nível |
| Queda instantânea (Espaço) | 2 × nível |

**Back-to-back:** após um Tetris ou T-spin, a próxima jogada difícil pode ativar o bónus de perfect clear Tetris (3200 base).

## Menu e fluxo do jogo

1. **Tela de abertura** — ao carregar, o jogo mostra o título no canvas e a lista das **10 melhores pontuações** na barra lateral.
2. **Começar** — clique no campo de jogo, **Enter**, **Espaço** ou qualquer tecla.
3. **Game over** — overlay **GAME OVER** com a pontuação da partida; após ~3,5 s volta ao menu (ou pressione qualquer tecla / clique para ir já).
4. **Durante o jogo** — **Esc** regressa ao menu; **P** pausa.

## Recorde e histórico

- O **recorde** (melhor pontuação) aparece durante a partida e na tela de abertura.
- As **10 melhores pontuações** (com data) ficam guardadas em `localStorage` e são listadas no menu inicial.

## Tema e animações

- Cada tipo de peça (I, O, T, S, Z, J, L) é um **gatinho cartoon** distinto, desenhado em Canvas (`js/catSprites.js`). Opcionalmente, coloque PNG em `assets/cats/cat-{tipo}.png`.
- **Linhas completas:** flash e “salto” dos gatos antes de sumirem (~500 ms).
- **Subir de nível:** banner “Miau! Nível N” com partículas no canvas (~1,2 s).

## Áudio

- Música de fundo e efeitos gerados com **Web Audio API** (`js/audio.js`); não é preciso ficheiros MP3 (ver `assets/audio/README.md`).
- O som só inicia após a primeira interação (regra do browser).
- Preferência de mute guardada em `localStorage` (`tetris-muted`).
