## Versão básica do jogo. 
Em plan mode: 
Quero implementzr o jogoTetris em  HTML/JavaScript (ou TypeScript) para funcionar no browser. Faça um plano de implementação de uma versao basica do jogo, com seus elementos principais: o
campo de jogo, todos os (sete) tipos de tetraminós, controle das peças (movimento direita/
esquerda, rotação, aceleração da queda), peças caindo com o tempo, detecção de colisão, a
mecânica de limpar linhas completas e a condição de fim de jogo (quando não é possível mais
adicionar uma peça no meio da tela pois alguma das posições já está preenchida). O jogo
também deve mostrar a próxima peça que vai aparecer.

## Adicionar níveis e pontuação

Perfeito! Agora vamos colocar níveis no jogo. Após um certo número de linhas limpas, o jogo sobe
de nível e as peças passam a cair de maneira mais rápida. Adicione tambem as pontuações do jogador, seguindo o seguinte critério de pontuaçao 

Todas as ações que dão pontos no Tetris têm uma pontuação-base (o valor da jogada), que é multiplicada pelo nível em que estás a jogar. Basicamente, quanto mais depressa caem as peças, chamadas "Tetriminos", mais pontos ganhas, independentemente do modo em que estás a jogar.

Sem mais demoras, aqui tens todas as pontuações-base do Tetris:

Uma linha: 100 pontos
Duas linhas de uma vez: 300 pontos
Três linhas de uma vez: 500 pontos
Tetris: 800 pontos
Minirrotação-T: 100 pontos
Uma linha com minirrotação-T: 200 pontos
Rotação-T: 400 pontos
Duas linhas de uma vez com rotação-T: 1200 Pontos
Três linhas de uma vez com rotação-T: 1600 Pontos
Matriz limpa com uma linha: 800 pontos
Matriz limpa com duas linhas: 1200 Pontos
Matriz limpa com três linhas: 1800 Pontos
Matriz limpa com um Tetris: 2000 Pontos
Matriz limpa com sequência de Tetris: 3200 pontos
Queda rápida: 1 ponto por cada linha percorrida na queda
Queda instantânea: 2 pontos por cada linha percorrida na queda

#### Prompt de high score

Perfeito, adicione a funcionalidade de pontuações mais altas (high scores), mostrando na
tela do jogo a pontuação mais alta obtida até o momento.

## Estilização 
``o básico esta ótimo, desejo agpra aprimorar o estilo do jogo, desejo adicionar animações \9quando uma linha for apagada, quando um nivel for passado etc), alterar a estética geral do jogo deixando com o tema de gatinhos (cada bloco como um gatinho diferente) e por fim adicionar uma trilha sonor ao jogo.``

obs: depois desse prompt, uma funcionalidade q ja funcionava com o space parou de pegar, mas a gnt pediu para corrigir com esse prompt: 

``Beleza. Precsamos fazer alguns ajustes. percebi que o space nao funciona mais para queda instatanea. entao resolva e verifique se as outras funcionalidades, como pontuacao, nao estao com proberfeito. por fim, aprimore a estetica geral do site e as animações``

obs:  os gatinhos nao ficaram legais, ai a gnt pediu para a peca toda ser um gatinho, ai melhorou um pouco, mas como ele quebra a peça futuramente no jogo, ainda assim nao ficou um gato unico por peça

prompt q a gnt usou para essa melhora: Ajuste a estetica dos gatinhos para cda bloco ser um gato inteiro. entao um bloco em l eh um gato longuinho em l. voce consegue fazer isso? 