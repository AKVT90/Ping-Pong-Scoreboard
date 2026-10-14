# Placar — Ping Pong

Aplicação simples de placar para ping pong, feita para correr no teu tablet Android Samsung. Funciona totalmente offline e guarda todos os dados (jogadores, jogos, histórico) localmente no próprio tablet, em formato JSON — não usa nenhuma base de dados externa nem precisa de internet depois de instalada.

## Como instalar no tablet Samsung

Como esta app não passa pela Play Store, a forma de "instalar" é através do navegador Chrome, que permite adicionar a app ao ecrã principal e ela passa a abrir em ecrã inteiro, como uma app normal.

1. Copia a pasta toda desta app para o tablet (por exemplo, envia o ficheiro `.zip` por email para ti próprio, ou usa uma pen/cabo USB, ou Google Drive) e extrai a pasta.
2. Como o Chrome no Android não abre ficheiros locais (`file://`) com todas as funcionalidades de uma PWA, o mais simples é alojar esta pasta num pequeno servidor. Há duas formas fáceis:

   **Opção A — usando uma app de servidor local no telemóvel/tablet (recomendado, sem precisares de computador):**
   - Instala a app gratuita **"HTTP Server"** ou **"Servidor Web local"** (procura na Play Store por "local web server html").
   - Aponta essa app para a pasta onde extraíste os ficheiros.
   - Liga o servidor (normalmente fica disponível em algo como `http://localhost:8080`).
   - Abre o Chrome no tablet e visita esse endereço.

   **Opção B — alojar online gratuitamente (mais simples a longo prazo):**
   - Cria uma conta gratuita em [Netlify](https://app.netlify.com/drop) ou [GitHub Pages](https://pages.github.com).
   - Arrasta a pasta da app para lá (no caso do Netlify Drop, é literalmente arrastar e largar).
   - Vais receber um link (ex: `https://o-teu-placar.netlify.app`).
   - Abre esse link no Chrome do tablet.

3. Quando a página abrir corretamente no Chrome, toca nos três pontinhos (⋮) no canto superior direito do navegador.
4. Escolhe **"Adicionar ao ecrã principal"** ou **"Instalar aplicação"**.
5. Confirma. Vai aparecer um ícone "Placar" no ecrã principal do tablet, igual a qualquer outra app.
6. A partir daí, abre sempre pelo ícone — funciona offline e os teus dados ficam guardados no tablet.

## Como usar

- **Menu principal**: cria os jogadores primeiro (em "Jogadores"), depois usa "Novo Jogo" sempre que quiseres começar uma partida.
- **Novo Jogo — passo 1**: escolhe o jogador do lado azul, o do lado branco, e se quiseres, uma descrição opcional (por exemplo, onde o jogo está a ser disputado).
- **Novo Jogo — passo 2 (tipo de jogo)**: escolhe entre "Personalizado" (predefinição) ou "Clássico".
  - **Personalizado**: 11 ou 21 pontos por set (21 é a predefinição), formato livre, melhor de 3 ou melhor de 5, e o serviço alterna sempre que a soma dos pontos dos dois jogadores atinge um múltiplo de 5.
  - **Clássico**: sempre 11 pontos por set, formato melhor de 3, melhor de 5 ou melhor de 7 (sem modo livre), e o serviço alterna a cada 2 pontos somados, como nas regras oficiais de ping pong.
- **Novo Jogo — passo 3**: confirma os pontos e formato (varia conforme o tipo escolhido no passo anterior) e toca em "Começar Jogo".
- **BOLAR**: antes de cada set (incluindo o primeiro), aparece um ecrã a dividir o tablet a meio para escolherem quem serve primeiro nesse set. Toca no lado de quem vai começar a servir.
- **Durante o jogo**: toca em qualquer metade do ecrã para somar um ponto a esse lado. O quadrado amarelo no canto mostra os sets ganhos, com uma pequena bola branca a piscar do lado de quem está a servir, com um beep discreto a avisar da troca de serviço. Quando um dos lados está a um ponto de fechar o set ("match point"), ouve-se um som diferente. O botão de pausa (❙❙) para o cronómetro, e o botão ↺ anula o último ponto marcado por engano.
- **Capote**: apenas nos jogos de 21 pontos (modo Personalizado). Conta como capote em dois casos: se um jogador chegar aos 11 pontos enquanto o adversário continua a 0 (o set termina logo ali), ou se o set correr até ao fim normalmente mas o jogador que perdeu não tiver passado dos 10 pontos (ex: 21-9 é capote, 21-11 já não é). Fica assinalado tanto na lista do histórico como no detalhe do jogo, e conta nas estatísticas do jogador (capotes feitos e sofridos), mesmo não sendo critério de vitória.
- **Enganaste-te e marcaste o ponto errado?** Se isso fez fechar o set por engano, no ecrã que aparece a anunciar o fim do set há um link discreto "Foi engano — anular o último ponto". Toca nele para voltar exatamente ao estado anterior a esse ponto e continuar a jogar o mesmo set normalmente.
- **Deuce (modo Clássico)**: quando o set chega a 10-10 (ou equivalente), aparece uma animação "DEUCE" no centro do ecrã com um som distinto, e a partir daí o serviço passa a trocar a cada ponto (em vez de a cada 2), seguindo a regra oficial.
- **Match point**: sempre que um lado está a um ponto de fechar o set (em qualquer modo), aparece uma animação "MATCH POINT" a vermelho com som próprio.
- **Sons**: cada toque para marcar ponto tem um "pling" curto de confirmação. A troca de serviço, o deuce e o match point têm sons distintos entre si, pensados para serem audíveis mesmo durante o jogo.
- **Terminar jogo**: o botão vermelho em baixo. Pede confirmação e guarda o resultado no histórico — exceto se ainda não tiveres completado nenhum set, nesse caso não grava nada. Se os sets ficarem empatados (ex: 1-1), o jogo fica registado como "Empate", sem atribuir vitória a ninguém.
- **Jogo em curso**: se saíres da app a meio de um jogo (por engano ou de propósito), ao voltares ao menu vais ver "Continuar jogo" para retomares exatamente onde ficaste, incluindo o serviço e as cores.

## ELO (só por diversão)

Cada jogador tem um ELO, calculado a partir de todo o histórico de jogos (não de sets), tendo em conta a força do adversário em cada confronto — vencer alguém com ELO mais alto vale mais do que vencer alguém mais fraco, tal como em sistemas de matchmaking de jogos competitivos. O ELO aparece no leaderboard, no perfil de cada jogador, e em pequeno junto ao nome no ecrã de jogo.

Importante: o ELO **não** determina a ordenação do leaderboard nem é critério de vitória — isso continua a ser sempre vitórias e derrotas reais. É só um número extra para curiosidade entre amigos.

## Cor de cada jogador no placar

Ao criar um jogador (ou depois, no perfil dele), podes escolher a cor que ele usa no placar: azul/branco (predefinição), verde/branco, vermelho/branco ou rosa/branco. A cor segue o jogador, não o lado do tablet: se colocares um jogador "verde" no lado esquerdo do placar, esse lado fica verde nesse jogo, independentemente de ser tecnicamente o "lado azul" da app.

Se os dois jogadores de um jogo tiverem escolhido a mesma cor, o jogador do lado branco joga automaticamente com essa cor invertida (fundo e número trocados), para que se consiga distinguir sempre os dois lados no placar.

## Estatísticas e leaderboard

No ecrã "Jogadores", no topo, aparece uma tabela com os 5 melhores jogadores (ordenados por win rate), mostrando vitórias, derrotas, empates e capotes de jogos. Abaixo, a lista completa de todos os jogadores.

Ao abrires o perfil de um jogador específico, vês: jogos disputados, win rate, jogos ganhos/perdidos/empatados (a nível de jogo completo), sets ganhos e perdidos (vitórias e derrotas a nível de set), total de sets ganhos/perdidos, capotes feitos e sofridos, o adversário contra quem tens mais vitórias e mais derrotas, os confrontos diretos contra cada adversário, e os últimos jogos disputados.

## Histórico e gráfico de momentum

No histórico, cada jogo mostra a data, o formato, se houve empate, e a descrição que escreveste ao criar o jogo (se escreveste alguma). Ao abrir o detalhe de um jogo, para cada set aparece também um pequeno gráfico de linha ("momentum") que mostra visualmente quem esteve a dominar o set, ponto a ponto.

## Rotação de ecrã

A app foi pensada para ser usada com o tablet na horizontal. Se estiver na vertical durante um jogo, aparece um aviso a pedir para rodares o tablet.

## Sobre os dados

Tudo o que crias (jogadores, jogos, estatísticas) fica guardado apenas dentro do tablet, no armazenamento local do navegador. Não há sincronização, conta, nem envio de dados para lado nenhum.

### Cópia de segurança (exportar / importar)

No menu principal, toca em **"Dados"**. Aí tens três opções:

- **Exportar cópia de segurança**: gera um ficheiro `.json` com todos os jogadores e todo o histórico, e abre o ecrã de partilha/transferência do Android. Podes guardar esse ficheiro no Google Drive, enviar por email para ti próprio, ou simplesmente deixá-lo na pasta de Transferências do tablet.
- **Importar cópia de segurança**: escolhe um ficheiro `.json` exportado anteriormente. Tens duas opções:
  - **Adicionar ao que já tens**: junta os jogadores e jogos do ficheiro aos que já tens neste tablet. Jogadores com o mesmo nome são automaticamente reconhecidos como a mesma pessoa (as estatísticas ficam todas juntas); jogadores novos são adicionados; jogos que já existam não são duplicados. É a opção certa para juntar histórico de vários tablets, ou para recuperares dados de uma versão antiga da app sem perderes o que já tens agora.
  - **Substituir tudo**: apaga por completo os dados atuais e fica só com o que está no ficheiro. Útil para restaurar um backup do zero.
  - Em ambos os casos, a app recalcula automaticamente as tags de "Capote" de cada set importado (mesmo que venham de uma versão antiga da app), e o ELO e as estatísticas atualizam-se sozinhos a partir do histórico completo.
- **Apagar todos os dados**: limpa tudo (jogadores e histórico) deste tablet. Também pede confirmação antes de avançar.

Recomendo exportar uma cópia de segurança de vez em quando, sobretudo antes de limpares os dados do Chrome ou trocares de tablet.
