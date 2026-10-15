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
- **Novo Jogo**: escolhe o jogador do lado azul, o do lado branco, quantos pontos por set (11 ou 21) e o formato (livre, melhor de 3, ou melhor de 5).
- **Durante o jogo**: toca em qualquer metade do ecrã para somar um ponto a esse lado. O quadrado amarelo no canto mostra os sets ganhos. O botão de pausa (❙❙) para o cronómetro, e o botão ↺ anula o último ponto marcado por engano.
- **Capote**: em jogos de 21 pontos, se um jogador chegar aos 11 enquanto o adversário continua a 0, o set termina automaticamente e fica assinalado como "Capote" no histórico.
- **Terminar jogo**: o botão vermelho em baixo. Pede confirmação e guarda o resultado no histórico — exceto se ainda não tiveres completado nenhum set, nesse caso não grava nada.
- **Jogo em curso**: se saíres da app a meio de um jogo (por engano ou de propósito), ao voltares ao menu vais ver "Continuar jogo" para retomares exatamente onde ficaste.

## Rotação de ecrã

A app foi pensada para ser usada com o tablet na horizontal. Se estiver na vertical durante um jogo, aparece um aviso a pedir para rodares o tablet.

## Sobre os dados

Tudo o que crias (jogadores, jogos, estatísticas) fica guardado apenas dentro do tablet, no armazenamento local do navegador. Não há sincronização, conta, nem envio de dados para lado nenhum. Se desinstalares a app ou limpares os dados do Chrome, o histórico perde-se — por isso, se quiseres, podes fazer cópias de segurança copiando o conteúdo guardado (fala comigo se precisares de ajuda a exportar/importar isso).
