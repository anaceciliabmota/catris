---
name: Plano de Testes Manual — Catris (versão final)
overview: Checklist manual completo de todas as funcionalidades implementadas no Catris, incluindo pontuação exata, progressão de nível, animações, áudio e casos extremos.
---

# Contexto

O Catris está com todas as funcionalidades implementadas (planos 01–04): mecânica básica de Tetris, níveis e pontuação com T-spin/perfect clear/B2B, tema de gatos com animações e áudio Web Audio, menu com high scores. Este plano organiza os testes manuais para validar que tudo funciona em conjunto sem regressões.

---

## A — Menu e Inicialização

- [ ] Ao carregar a página, o estado é "title" (tela de abertura).
- [ ] O high score do `localStorage` é exibido no painel.
- [ ] O histórico top 10 de pontuações é exibido (ou "Nenhuma pontuação ainda").
- [ ] **Enter** inicia o jogo.
- [ ] **Espaço** (na tela título) inicia o jogo.
- [ ] **Clique no canvas** inicia o jogo.
- [ ] Qualquer outra tecla (exceto Tab e M) também inicia o jogo.
- [ ] BGM começa ao iniciar (se não mutado) — só após gesto do usuário.
- [ ] Som "menuSelect" toca ao iniciar.
- [ ] Nível, linhas e pontuação começam em 1, 0, 0.

---

## B — Movimentação e Controles

- [ ] **← / →** movem a peça 1 coluna; sem ultrapassar as bordas.
- [ ] Segurar **←/→**: após ~170 ms, movimento repete a cada ~50 ms.
- [ ] Soltar a tecla interrompe a repetição imediatamente.
- [ ] **↑** ou **X** giram a peça no sentido horário.
- [ ] Wall kick: giro que bate na parede ou bloco tenta ±1 e ±2 células; se nenhuma funcionar, giro é cancelado.
- [ ] Som "rotate" toca a cada rotação bem-sucedida.
- [ ] **↓** (soft drop): queda a cada 50 ms enquanto pressionada; pontua 1 × nível por célula.
- [ ] **Espaço** (hard drop): peça cai até o fundo instantaneamente; pontua 2 × nível por célula percorrida.
- [ ] Hard drop aciona lock imediatamente (sem segunda queda automática).
- [ ] **Após limpar linhas**, liberar tecla enquanto a animação toca **não** deixa a próxima peça presa em queda automática (bug corrigido: `keyup` limpa `keysDown` em qualquer estado).

---

## C — Queda Automática e Lock

- [ ] Peça cai sozinha conforme o intervalo do nível atual.
- [ ] Ao colidir com o fundo ou peça abaixo, trava (`lock`).
- [ ] Som "lock" toca ao travar.
- [ ] Após travar, a próxima peça da fila surge no topo.
- [ ] Preview "Próxima peça" atualiza no canvas lateral.

---

## D — Limpeza de Linhas

- [ ] Linha completamente preenchida é marcada e animada.
- [ ] **1 linha**: animação + 100 × nível pontos.
- [ ] **2 linhas**: animação + 300 × nível pontos.
- [ ] **3 linhas**: animação + 500 × nível pontos.
- [ ] **4 linhas (Tetris)**: animação + 800 × nível pontos + som "tetris" + screen shake intensidade 6.
- [ ] **2–3 linhas**: screen shake intensidade 3.
- [ ] Animação dura ~650 ms; input fica bloqueado durante esse tempo.
- [ ] Após animação, linhas desaparecem e blocos acima descem corretamente.
- [ ] Contadores de "Linhas" e "Nível" atualizam após a limpeza.

---

## E — Progressão de Nível

- [ ] Completar 10 linhas → Nível 2 + animação level-up (~1400 ms) + som "levelUp".
- [ ] Cada novo conjunto de 10 linhas incrementa o nível.
- [ ] Banner de level-up aparece no canvas com partículas (hearts e paws).
- [ ] Velocidade de queda aumenta visivelmente a cada nível.
- [ ] Texto "Nível" no HUD anima "bump" ao subir.

---

## F — T-Spin

**Como testar T-spin:** posicionar peça T em buraco em forma de T; girar como última ação antes do lock.

- [ ] Sem girar antes do lock → sem T-spin (pontuação normal de linha).
- [ ] T-Spin Mini (2 cantos + wall kick): verifica pontos corretos (100 ou 200 × nível).
- [ ] T-Spin Full (3+ cantos): verifica pontos corretos (400 / 1200 / 1600 × nível).
- [ ] Peça que não é T nunca gera T-spin.

---

## G — Perfect Clear

**Como testar:** zerar o tabuleiro completamente com uma linha clara.

- [ ] Tabuleiro vazio após limpeza → pontuação perfect clear (ver tabela).
- [ ] Perfect Clear Tetris + Back-to-Back → 3200 pontos (sem multiplicar por nível).
- [ ] Contagem de pontos aparece corretamente no HUD.

---

## H — Back-to-Back

- [ ] Após Tetris (4L) ou T-spin, flag B2B ativa.
- [ ] Jogar uma peça simples (sem T-spin, sem Tetris) **desativa** a flag B2B.
- [ ] Segundo Tetris consecutivo não tem multiplicador adicional visível (exceto no caso do PC Tetris B2B = 3200).
- [ ] PC Tetris B2B gera exatamente 3200 pontos (base fixa, sem × nível).

---

## I — Game Over

- [ ] Peça spawna em posição já ocupada → estado "gameover".
- [ ] Som "gameOver" toca.
- [ ] Overlay "GAME OVER" com a pontuação da partida aparece no canvas.
- [ ] BGM para.
- [ ] Após ~3,5 s, volta ao menu automaticamente.
- [ ] **Enter**, **Espaço** ou **clique** antecipam o retorno ao menu.
- [ ] Pontuação é registrada no histórico (localStorage).
- [ ] Se novo recorde, painel high score destaca (classe `is-new-record`).
- [ ] Histórico exibe máximo 10 entradas, ordenadas por maior pontuação.
- [ ] Data da partida exibida no formato DD/MM/AA.

---

## J — Pausa

- [ ] **P** durante jogo → estado "paused"; mensagem "Pausado — Esc para menu".
- [ ] Peça não cai durante pausa.
- [ ] Nenhuma tecla de jogo processa durante pausa.
- [ ] **P** novamente → retoma o jogo; timer de queda reinicia (sem salto brusco).
- [ ] **Esc** durante pausa → volta ao menu.

---

## K — Áudio

- [ ] BGM toca em loop durante o jogo (não para sozinha).
- [ ] BGM para ao pausar, game over e ao voltar ao menu.
- [ ] Cada SFX toca no evento correto: rotate, lock, lineClear, tetris, levelUp, gameOver, menuSelect.
- [ ] **M** alterna mute on/off em qualquer estado.
- [ ] Botão Som no painel atualiza label.
- [ ] Preferência de mute persiste entre recargas (localStorage `tetris-muted`).
- [ ] Com mute ativo, nenhum som é emitido.
- [ ] Áudio **não** toca antes da primeira interação do usuário (requisito do browser).

---

## L — Estética e Animações

- [ ] Cada tipo de peça (I, O, T, S, Z, J, L) exibe um gato distinto.
- [ ] Gatos aparecem tanto no campo de jogo quanto no preview "Próxima peça".
- [ ] Ghost piece (sombra da peça) é exibida semi-transparente abaixo da peça ativa.
- [ ] Partículas (sparks, paws, hearts) aparecem nas animações de clear e level-up.
- [ ] Partículas somem após o tempo de vida delas (~600–1100 ms).
- [ ] Screen shake é perceptível e decai suavemente.
- [ ] HUD (score, nível, linhas) tem animação "bump" ao atualizar.

---

## M — Mecânica do Bag (Peças)

- [ ] Os 7 tipos de peças aparecem; nenhum tipo se repete mais de 1 vez em 7 peças consecutivas.
- [ ] Ao esvaziar o bag, ele reembaralha e fornece novas 7 peças.
- [ ] Preview mostra sempre a próxima peça correta.

---

## N — Casos Extremos

- [ ] Segurar ↓ enquanto a animação de linha clara toca → ao voltar ao "playing", peça **não** cai sozinha (tecla solta durante animação é corretamente removida).
- [ ] Segurar ← ou → durante animação → peça seguinte não desloca sozinha.
- [ ] Hard drop quando peça já está no fundo → 0 células, sem erro.
- [ ] Giro em espaço confinado (canto superior) → wall kick funciona ou rotação é cancelada.
- [ ] Level máximo (≥15): intervalo trava em 80 ms, jogo não trava.
- [ ] Reiniciar após game over repõe nível 1, linhas 0, pontuação 0 e B2B desativado.
- [ ] Abrir sem `localStorage` disponível → jogo funciona sem erros (high score = 0).
- [ ] Console do browser **sem erros** em qualquer estado normal.

---

## O — Fluxo Completo de Integração

- [ ] **Jogo completo:** Menu → Jogar → atingir game over → voltar ao menu → novo jogo; tudo sem erros.
- [ ] Level-up acontece durante animação de limpeza de linhas → animações encadeiam corretamente (line clear termina, depois level-up).
- [ ] Score e nível corretos são exibidos no final depois de várias sequências de linhas.
- [ ] Histórico de pontuações acumula partidas distintas corretamente (top 10).

---

## Verificação rápida de pontuação (roteiro sugerido)

1. Iniciar no Nível 1; enfileirar e completar **1 linha** → score deve ser **100**.
2. Completar **2 linhas de uma vez** → score acumula **+300**.
3. Usar hard drop de 5 células → score acumula **+10** (2 × 5 × nível 1).
4. Chegar ao Nível 2 (10 linhas totais); completar **1 linha** → score acumula **+200**.
5. Verificar velocidade de queda visivelmente mais rápida no Nível 2 (~680 ms).
