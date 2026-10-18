/* ============================================================
   PLACAR — Ping Pong scoreboard
   Lógica da aplicação. Dados guardados localmente em JSON
   via localStorage (sem qualquer base de dados externa).
   ============================================================ */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     STORAGE — camada de dados local em JSON
     --------------------------------------------------------- */
  const STORAGE_KEY = "pingpong_data_v1";

  function defaultData() {
    return {
      players: [],      // { id, name, createdAt }
      games: [],        // jogos terminados, ver buildGameRecord()
      activeGame: null,
      activeTournament: null,
      tournamentHistory: [],
      achievements: {},
      trainingStats: {},
      nextPlayerId: 1,
      nextGameId: 1
    };
  }

  let DATA = loadData();

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      // garantir todas as chaves existem (proteção contra versões antigas)
      return Object.assign(defaultData(), parsed);
    } catch (e) {
      console.error("Falha ao ler dados locais, a começar do zero.", e);
      return defaultData();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
    } catch (e) {
      console.error("Falha ao guardar dados locais.", e);
    }
  }

  /* ---------------------------------------------------------
     NAVEGAÇÃO ENTRE ECRÃS
     --------------------------------------------------------- */

  /* ==========================================================
     SISTEMA DE INTERNACIONALIZAÇÃO (i18n)
     ========================================================== */
  const LANGS = {
    pt: {
      "menu.newGame":"Novo Jogo",
      "menu.newGameSub":"Escolher jogadores e começar",
      "menu.tournament":"Torneio",
      "menu.tournamentSub":"Eliminatórias com chaveamento automático",
      "menu.players":"Jogadores",
      "menu.playersSub":"Gerir e ver estatísticas",
      "menu.history":"Histórico",
      "menu.historySub":"Jogos anteriores",
      "menu.data":"Dados",
      "menu.dataSub":"Exportar ou importar cópia de segurança",
      "menu.footer":"Dados guardados apenas neste dispositivo",
      "screen.players":"Jogadores",
      "screen.history":"Histórico",
      "screen.gameDetail":"Detalhe do Jogo",
      "screen.newGame":"Novo Jogo",
      "screen.gameType":"Tipo de Jogo",
      "screen.pointsFormat":"Pontos e Formato",
      "screen.newTournament":"Novo Torneio",
      "screen.tournament":"Torneio",
      "screen.minigames":"Mini Jogos",
      "screen.achievements":"Conquistas",
      "screen.records":"Recordes",
      "screen.data":"Dados",
      "btn.addPlayer":"＋ Novo",
      "btn.deletePlayer":"Eliminar",
      "btn.abandon":"Abandonar",
      "btn.continue":"Continuar ▸",
      "btn.startGame":"Começar Jogo",
      "btn.createTournament":"Criar Torneio",
      "btn.backMenu":"Voltar ao Menu",
      "btn.start":"Começar",
      "serve.title":"SERVIÇO",
      "serve.hint":"serve primeiro",
      "setup.bluePlayer":"Lado Azul",
      "setup.whitePlayer":"Lado Branco",
      "setup.pointsPerSet":"Pontos por set",
      "setup.format":"Formato",
      "mg.tap":"Toques Rápidos",
      "mg.tapSub":"Clica nos pontos antes que desapareçam",
      "mg.memory":"Memória Visual",
      "mg.memorySub":"Memoriza e repete a sequência",
      "ach.unlocked":"🏆 CONQUISTA DESBLOQUEADA!",
      "data.export":"Exportar cópia de segurança",
      "data.exportSub":"Gera um ficheiro .json com tudo",
      "data.import":"Importar cópia de segurança",
      "data.importSub":"Adicionar ou fundir dados de uma cópia de segurança",
      "data.wipe":"Apagar todos os dados",
      "data.wipeSub":"Remove jogadores e histórico deste tablet",
      "js.choosePlayer":"Escolher jogador",
      "js.sideBlue":"Azul",
      "js.sideWhite":"Branco",
      "js.continue":"Continuar de qualquer forma ▸",
      "js.nextSet":"Próximo Set ▸",
      "js.undoMsg":"Último ponto anulado — podes continuar o set.",
      "js.setInProgress":"O set em curso (%b-%w) não vai ser contado. O resultado dos sets já fechados é guardado no histórico.",
      "js.confirmEnd":"O resultado atual vai ser guardado no histórico.",
      "js.confirmWipe":"Apagar todos os dados?",
      "js.confirmAbandon":"Abandonar torneio?",
      "js.emptyPlayers":"Cria jogadores primeiro.",
      "js.noData":"Sem dados ainda",
      "js.wins":"vitórias",
      "js.losses":"derrotas",
      "js.draws":"empates",
      "js.capotes":"capotes",
      "js.winRate":"Win%",
      "js.elo":"ELO",
      "js.allPlayers":"Todos os jogadores",
      "js.serve":"Serve",
      "js.notServe":"Não serve",
      "js.set":"Set",
      "js.bestOf":"Melhor de",
      "js.free":"Livre",
      "js.classic":"Clássico",
      "js.custom":"Personalizado",
      "js.gameWon":"%n venceu o jogo",
      "js.setWon":"%n venceu o set",
      "js.deuce":"DEUCE",
      "js.matchPoint":"MATCH POINT",
      "js.capoteTag":"Capote",
      "js.newRecord":"🏆 Novo recorde!",
      "js.points":"Pontos",
      "js.level":"Nível",
      "js.levelReached":"Nível atingido",
      "js.playAgain":"Jogar de novo",
      "js.tbd":"A definir",
      "js.play":"▶ JOGAR",
      "js.whoseServe":"Set %n · quem serve primeiro?",
      "js.champion":"🏆 Campeão do Torneio",
      "js.winsLabel":"V",
      "js.lossesLabel":"D",
      "js.drawsLabel":"E",
      "js.capotesLabel":"Cap.",
      "js.winRateLabel":"Win%",
      "js.eloLabel":"ELO",
      "js.bestRival":"Melhor rival",
      "js.worstRival":"Pior rival",
      "js.last10":"Últimos 10 jogos",
      "js.streak":"Sequência atual",
      "js.setsWon":"Sets ganhos",
      "js.setsLost":"Sets perdidos",
      "js.capotesMade":"Capotes feitos",
      "js.capotesSuffered":"Capotes sofridos",
      "js.tournamentsWon":"Torneios ganhos",
      "js.tournamentsPlayed":"Torneios jogados",
      "js.trainingMin":"min. de treino",
      "js.trainingSessions":"sessões",
      "js.importReplace":"Substituir tudo",
      "js.importMerge":"Adicionar ao que já tenho",
      "js.importDetailFile":"O ficheiro tem %p jogadores e %g jogos.",
      "js.importDetailMerge":"<strong>Adicionar</strong> traz %np jogadores e %ng jogos novos (nomes iguais são juntos; repetidos são ignorados).",
      "js.importDetailReplace":"<strong>Substituir tudo</strong> apaga os %p jogadores e %g jogos atuais e fica só com o ficheiro.",
      "js.recElo":"Maior ELO",
      "js.recStreak":"Maior Sequência",
      "js.recWins":"Mais Vitórias",
      "js.recCapotes":"Mais Capotes Feitos",
      "js.recTournaments":"Mais Torneios Ganhos",
      "js.recPoints":"Mais Pontos Marcados",
      "js.recDuration":"Jogo Mais Longo",
      "js.recMgTap":"Recorde Toques Rápidos",
      "js.recMgMemory":"Recorde Memória",
      "js.recEloGain":"Maior Ganho de ELO",
      "js.wins_unit":"vitórias",
      "js.min_unit":"min",
      "js.pts_unit":"pts",
      "js.roundQF":"Quartos-de-final",
      "js.roundSF":"Meia-final",
      "js.roundF":"Final",
      "js.serveEvery2":"Serviço a cada 2 pontos",
      "js.serveEvery5":"Serviço a cada 5 pontos",
      "js.serveEvery1":"Serviço a cada 1 ponto (deuce)",
      "js.eraseConfirm":"Tens a certeza? Esta ação não pode ser desfeita.",
      "js.missedGame":"Foi engano — anular o último ponto",
      "js.gameInProgress":"Tens um jogo em curso",
      "js.tournamentInProgress":"Tens um torneio em curso",
      "js.resumeGame":"Continuar jogo ▸",
      "js.resumeTournament":"Continuar torneio ▸",
      "js.endOfSet":"FIM DO SET",
      "js.endOfSetCapote":"FIM DO SET · CAPOTE",
      "js.endOfSetDeciding":"FIM DO SET · JOGO DECIDIDO",
      "js.endOfSetCapoteDeciding":"FIM DO SET · CAPOTE · JOGO DECIDIDO",
      "js.endOfGame":"FIM DO JOGO",
      "js.endOfGameCapote":"FIM DO JOGO · CAPOTE",
      "js.drawBetween":"Empate entre",
      "js.chooseBlue":"Escolher — Lado Azul",
      "js.chooseWhite":"Escolher — Lado Branco",
      "js.noPlayersYet":"Ainda não tens jogadores criados.<br>Volta ao menu e cria jogadores primeiro.",
      "js.trainingTitle":"Modo Treino",
      "js.trainingFree":"Cronómetro livre",
      "js.trainingTimed":"Treino com tempo definido",
      "js.trainingModeFree":"MODO LIVRE",
      "js.trainingModeTimed":"TREINO %n MIN",
      "js.mgMemorize":"Memoriza!",
      "js.mgYourTurn":"A tua vez!",
      "js.mgPoints":"Pontos:",
      "js.mgLevel":"Nível",
      "js.mgLevelReached":"Nível atingido:",
      "js.mgRecord":"rec:",
      "js.mgMemoryTitle":"Memória Visual",
      "js.achSecret":"Conquista secreta desbloqueada!",
      "js.achSecretDesc":"Conquista secreta. Continua a jogar para a descobrir.",
      "js.cancel":"Cancelar",
      "js.save":"Guardar",
      "js.undo":"Anular último ponto",
      "js.pause":"Pausar cronómetro",
      "js.modeCustom":"Personalizado",
      "js.modeClassic":"Clássico",
      "js.modeClassicDesc":"11 pontos por set · BO3, BO5 ou BO7",
      "js.formatFree":"Livre",
      "js.formatBo3":"Melhor de 3",
      "js.formatBo5":"Melhor de 5",
      "js.formatBo7":"Melhor de 7",
      "js.setBalanced":"Set muito equilibrado",
      "js.descPlaceholder":"Ex: torneio de verão, sala de jogos...",
      "js.shortcutTraining":"Modo Treino",
      "js.shortcutMinigames":"Mini Jogos",
      "js.shortcutAchievements":"Conquistas",
      "js.shortcutRecords":"Recordes",
      "js.setLabel":"SET",
      "js.noHistory":"Sem jogos no histórico ainda.",
      "js.catFirstSteps":"Primeiros Passos",
      "js.catWins":"Vitórias",
      "js.catSets":"Sets",
      "js.catComebacks":"Remontadas",
      "js.catElo":"ELO",
      "js.catPoints":"Pontos",
      "js.catTournaments":"Torneios",
      "js.catRivalries":"Rivalidades",
      "js.catTraining":"Treino",
      "js.catMinigames":"Mini-Jogos",
      "js.catSpecials":"Especiais",
      "js.noDataYet":"Sem dados ainda",
      "js.bracketTbd":"A definir",
      "js.noPlayersEmpty":"Ainda não tens jogadores.<br>Toca em '＋ Novo' para adicionar o primeiro.",
      "js.leaderboard":"Leaderboard · Top %n",
      "js.playerCol":"Jogador",
      "js.gamesUnit":"%n jogos",
      "js.noGamesProfile":"Sem jogos registados ainda.",
      "js.resultDraw":"Empatou",
      "js.resultWon":"Venceu",
      "js.resultLost":"Perdeu",
      "js.gamesDisputed":"%n jogo(s)",
      "js.headToHead":"Confrontos diretos",
      "js.recentGames":"Últimos jogos",
      "js.scorerColor":"Cor no placar",
      "js.eloLabel2":"ELO (diversão)",
      "js.statGamesPlayed":"Jogos disputados",
      "js.statGamesWon":"Jogos ganhos",
      "js.statGamesLost":"Jogos perdidos",
      "js.statGamesDrawn":"Jogos empatados",
      "js.statSetsWonV":"Sets ganhos (vitórias)",
      "js.statSetsLostD":"Sets perdidos (derrotas)",
      "js.statTotalSetsWon":"Total sets ganhos",
      "js.statTotalSetsLost":"Total sets perdidos",
      "js.statCapotesMade":"Capotes feitos",
      "js.statCapotesSuffered":"Capotes sofridos",
      "js.statTournamentsWon":"Torneios ganhos",
      "js.statTournamentsTotal":"Torneios totais",
      "js.bestRivalAgainst":"Mais vitórias contra (%n)",
      "js.worstRivalAgainst":"Mais derrotas contra (%n)",
      "js.noHistoryYet":"Ainda não há jogos no histórico.<br>Joga a primeira partida para a veres aqui.",
      "js.draw":"EMPATE",
      "js.setsSep":"SETS",
      "js.xCapote":"%nx Capote",
      "js.modeFree":"LIVRE",
      "js.modeMd3":"MD3",
      "js.modeMd5":"MD5",
      "js.modeMd7":"MD7",
      "js.gameEndedDraw":"Jogo terminou empatado",
      "js.setsWonBy":"Sets (%n venceu o jogo)",
      "js.ptsPerSet":"pontos por set",
      "js.duration":"duração",
      "js.setRecap":"Set %n",
      "js.undoToast":"Último ponto anulado — podes continuar o set.",
      "js.statsSaved":"Jogadores guardados",
      "js.gamesInHistory":"Jogos no histórico",
      "js.exportedToast":"Cópia exportada: %f",
      "js.importedToast":"Importados: %p jogadores, %g jogos",
      "js.invalidFile":"Ficheiro inválido ou corrompido.",
      "js.cantReadFile":"Não foi possível ler o ficheiro.",
      "js.invalidFormat":"Ficheiro inválido: formato inesperado.",
      "js.invalidBackup":"Ficheiro inválido: não é uma cópia de segurança do Placar.",
      "js.replacedToast":"Dados substituídos com sucesso.",
      "js.wipedToast":"Todos os dados foram apagados.",
      "js.createPlayersFirst":"Cria jogadores primeiro.",
      "js.roundLabel":"Ronda %n",
      "js.tournamentWinnerSub":"%m jogos · %p jogadores",
      "js.choosePlayerFirst":"Escolhe um jogador primeiro",
      "js.recMgMemory2":"Recorde Memória Visual",
      "js.recMorePoints":"Mais Pontos Acumulados",
      "js.recMoreTraining":"Mais Tempo de Treino",
      "js.levelPrefix":"nível ",
      "js.winsUnit":" vitórias",
      "js.capotesUnit":" capotes",
      "js.tournamentsUnit":" torneios",
      "js.pointsUnit":" pontos",
      "js.minUnit":" min",
      "js.achProgressText":"%d / %t conquistas",
      "js.setup.pts11":"11 pontos",
      "js.setup.pts21":"21 pontos",
      "js.overlay.endGameTitle":"TERMINAR JOGO",
      "js.overlay.confirmEnd":"Confirmar fim de jogo?",
      "js.overlay.confirmEndBtn":"Terminar",
      "js.data.backup":"Cópia de segurança",
      "js.data.wipeAll":"Apagar tudo",
      "js.mg.playAs":"Jogar como",
      "js.tournament.size":"Tamanho",
      "js.tournament.mode":"Modo",
      "js.mode.customDesc":"11 ou 21 pontos · livre, MD3 ou MD5 · serviço alterna a cada 5 pontos somados",
      "mg.quiz":"Quiz de Regras",
      "mg.quizSub":"Testa os teus conhecimentos das regras ITTF",
      "mg.rules":"Regras ITTF",
      "mg.rulesSub":"Todas as regras oficiais do ténis de mesa",
      "js.mgQuizScore":"Pontos:",
      "js.mgQuizIntro":"Escolhe o nível de dificuldade",
      "js.mgQuizEasy":"Fácil",
      "js.mgQuizEasyDesc":"Regras básicas do jogo",
      "js.mgQuizMedium":"Médio",
      "js.mgQuizMediumDesc":"Regras de serviço e pontuação",
      "js.mgQuizHard":"Difícil",
      "js.mgQuizHardDesc":"Regulamentação e torneios",
      "js.mgQuizBestScore":"Melhor pontuação:",
      "js.mgQuizNext":"Próxima ▸",
      "js.mgQuizFinalScore":"Pontuação final:",
      "js.mgQuizCorrect":"Correto! ✓",
      "js.mgQuizWrong":"Errado ✗",
      "js.mgQuizChooseFirst":"Escolhe um jogador primeiro",
      "js.mgQuizResultGreat":"Excelente! Conheces muito bem as regras!",
      "js.mgQuizResultGood":"Bom trabalho! Continua a estudar as regras.",
      "js.mgQuizResultTry":"Continua a praticar e a ler as regras ITTF.",
      "js.langBtn":"Idioma",
      "js.settingsBtn":"Definições",
      "js.descLabel":"Descrição",
      "js.optional":"(opcional)",
      "js.nPlayers4":"4 jogadores",
      "js.nPlayers8":"8 jogadores",
      "js.nPlayers16":"16 jogadores",
      "js.trainingDuration":"Duração (minutos)",
      "js.back":"‹ Voltar",
      "js.gameEndedTitle":"JOGO TERMINADO",
      "js.backToMenu":"Voltar ao Menu",
      "js.newPlayerTitle":"NOVO JOGADOR",
      "js.newPlayerName":"Nome do jogador",
      "js.playerNamePlaceholder":"Ex: Miguel",
      "js.colorPickerLabel":"Cor no placar",
      "js.color.blueWhite":"Azul / Branco",
      "js.color.greenWhite":"Verde / Branco",
      "js.color.redWhite":"Vermelho / Branco",
      "js.color.pinkWhite":"Rosa / Branco",
      "js.color.purpleWhite":"Roxo / Branco",
      "js.color.goldWhite":"Dourado / Branco",
      "js.color.whiteBlack":"Branco / Preto",
      "js.color.orangeWhite":"Laranja / Branco",
      "js.dataExplain":"Guarda jogadores e histórico num ficheiro que podes manter na nuvem (Drive, email, etc.) e usar para recuperar tudo neste tablet ou noutro.",
      "js.importTitle":"IMPORTAR DADOS",
      "js.importQuestion":"O que queres fazer?",
      "js.importDetail":"Isto vai substituir os jogadores e o histórico já guardados neste tablet.",
      "js.mergeImport":"Adicionar ao que já tenho",
      "js.replaceImport":"Substituir tudo",
      "js.wipeTitle":"APAGAR TUDO",
      "js.wipeQuestion":"Apagar todos os dados?",
      "js.wipeDetail":"Esta ação não pode ser desfeita. Considera exportar uma cópia de segurança primeiro.",
      "js.wipeConfirm":"Apagar tudo",
      "js.rotateHint":"Roda o tablet para a horizontal",
      "js.overlay.confirmEndDetail":"O resultado atual vai ser guardado no histórico.",
      "ach.first_point.name":"Primeiro Ponto",
      "ach.first_point.desc":"Marca o teu primeiro ponto.",
      "ach.first_set.name":"Primeiro Set",
      "ach.first_set.desc":"Ganha o teu primeiro set.",
      "ach.first_win.name":"Primeira Vitória",
      "ach.first_win.desc":"Ganha o teu primeiro jogo.",
      "ach.first_tournament.name":"Primeiro Torneio",
      "ach.first_tournament.desc":"Participa no teu primeiro torneio.",
      "ach.first_trophy.name":"Primeiro Troéu",
      "ach.first_trophy.desc":"Ganha o teu primeiro torneio.",
      "ach.wins_10.name":"10 Vitórias",
      "ach.wins_10.desc":"Ganha 10 jogos.",
      "ach.wins_50.name":"50 Vitórias",
      "ach.wins_50.desc":"Ganha 50 jogos.",
      "ach.wins_100.name":"100 Vitórias",
      "ach.wins_100.desc":"Ganha 100 jogos.",
      "ach.wins_200.name":"200 Vitórias",
      "ach.wins_200.desc":"Ganha 200 jogos.",
      "ach.streak_3.name":"Hat-trick",
      "ach.streak_3.desc":"3 vitórias consecutivas.",
      "ach.streak_5.name":"Em Forma",
      "ach.streak_5.desc":"5 vitórias consecutivas.",
      "ach.streak_10.name":"Imparável",
      "ach.streak_10.desc":"10 vitórias consecutivas.",
      "ach.streak_20.name":"Invencível",
      "ach.streak_20.desc":"20 vitórias consecutivas.",
      "ach.sweep.name":"Vassoura",
      "ach.sweep.desc":"Ganha um jogo sem perder nenhum set.",
      "ach.capote_set.name":"Capote",
      "ach.capote_set.desc":"Ganha um set por 11-0.",
      "ach.set_perfect.name":"Set Perfeito",
      "ach.set_perfect.desc":"Ganha um set permitindo no máximo 3 pontos.",
      "ach.deciding_set.name":"Decisão",
      "ach.deciding_set.desc":"Ganha um jogo decidido no último set.",
      "ach.comeback.name":"Remontada",
      "ach.comeback.desc":"Ganha um jogo depois de perder o 1º set.",
      "ach.comeback_02.name":"Grande Remontada",
      "ach.comeback_02.desc":"Ganha um jogo depois de estar 0-2 em sets.",
      "ach.comeback_pts.name":"Nunca Desistas",
      "ach.comeback_pts.desc":"Ganha um set depois de estar a perder por 5+ pontos.",
      "ach.elo_1000.name":"Quatro Dígitos",
      "ach.elo_1000.desc":"Atinge 1000 de ELO.",
      "ach.elo_1200.name":"1200 Club",
      "ach.elo_1200.desc":"Atinge 1200 de ELO.",
      "ach.elo_1300.name":"Elite",
      "ach.elo_1300.desc":"Atinge 1300 de ELO.",
      "ach.elo_1500.name":"Mestre",
      "ach.elo_1500.desc":"Atinge 1500 de ELO.",
      "ach.pts_100.name":"Centenário",
      "ach.pts_100.desc":"Acumula 100 pontos.",
      "ach.pts_500.name":"500 Pontos",
      "ach.pts_500.desc":"Acumula 500 pontos.",
      "ach.pts_1000.name":"1000 Pontos",
      "ach.pts_1000.desc":"Acumula 1000 pontos.",
      "ach.tour_2.name":"Bicampeão",
      "ach.tour_2.desc":"Ganha 2 torneios.",
      "ach.tour_3.name":"Tricampeão",
      "ach.tour_3.desc":"Ganha 3 torneios.",
      "ach.rival_10.name":"Clássico",
      "ach.rival_10.desc":"Joga 10 partidas contra o mesmo adversário.",
      "ach.rival_25.name":"Rivalidade",
      "ach.rival_25.desc":"Joga 25 partidas contra o mesmo adversário.",
      "ach.rival_dom.name":"Domínio",
      "ach.rival_dom.desc":"10 vitórias de vantagem sobre o mesmo adversário.",
      "ach.rival_5.name":"Carrasco",
      "ach.rival_5.desc":"5 vitórias consecutivas contra o mesmo adversário.",
      "ach.train_first.name":"Primeiro Treino",
      "ach.train_first.desc":"Completa uma sessão de treino.",
      "ach.train_10m.name":"10 Minutos",
      "ach.train_10m.desc":"Acumula 10 minutos de treino.",
      "ach.train_1h.name":"1 Hora",
      "ach.train_1h.desc":"Acumula 60 minutos de treino.",
      "ach.train_5sess.name":"Disciplina",
      "ach.train_5sess.desc":"Completa 5 sessões de treino.",
      "ach.mg_tap_10.name":"Reflexos de Aço",
      "ach.mg_tap_10.desc":"Faz 10 pontos em Toques Rápidos.",
      "ach.mg_tap_30.name":"Relâmpago",
      "ach.mg_tap_30.desc":"Faz 30 pontos em Toques Rápidos.",
      "ach.mg_mem_5.name":"Memória Sólida",
      "ach.mg_mem_5.desc":"Chega ao nível 5 em Memória Visual.",
      "ach.mg_mem_10.name":"Memória de Ferro",
      "ach.mg_mem_10.desc":"Chega ao nível 10 em Memória Visual.",
      "ach.secret_11_0.name":"Humilhação",
      "ach.secret_11_0.desc":"Ganha um set por 11-0.",
      "ach.secret_3_2.name":"Até ao Limite",
      "ach.secret_3_2.desc":"Ganha um jogo decidido no 5º set.",
      "ach.secret_11_9.name":"Ponto a Ponto",
      "ach.secret_11_9.desc":"Ganha um set por 11-9.",
      "ach.secret_midnight.name":"Sessão Noturna",
      "ach.secret_midnight.desc":"Joga depois da meia-noite.",
      "ach.secret_morning.name":"Madrugador",
      "ach.secret_morning.desc":"Joga antes das 08:00.",
      "ach.secret_10day.name":"Máquina",
      "ach.secret_10day.desc":"Joga 10 jogos no mesmo dia.",
      "rules.jogo.title":"O Jogo — Regras Gerais",
      "rules.jogo.r0":"Um set é ganho pelo primeiro jogador a atingir 11 pontos, com uma vantagem mínima de 2 pontos sobre o adversário.",
      "rules.jogo.r1":"Um jogo (match) é ganho pelo jogador que vencer o maior número de sets no formato definido (melhor de 3, 5 ou 7).",
      "rules.jogo.r2":"O jogador que marca um ponto começa a servir no par seguinte (ou mantém o serviço conforme a rotação).",
      "rules.jogo.r3":"Se a bola em jogo tocar qualquer parte do corpo de um jogador exceto a mão da raquete, o ponto é perdido.",
      "rules.jogo.r4":"A mão livre (que não segura a raquete) NÃO pode tocar a superfície de jogo durante um rally — ponto para o adversário.",
      "rules.jogo.r5":"Se a bola tocar a borda superior da mesa (edge), o ponto é válido.",
      "rules.jogo.r6":"Se a bola tocar a borda lateral da mesa, o ponto é do adversário — não é área de jogo.",
      "rules.jogo.r7":"Um jogador não pode bater na bola antes de ela tocar a sua metade da mesa (não há volley).",
      "rules.jogo.r8":"O jogo pode ser interrompido por lesão verificável, falha de equipamento ou outro motivo aceite pelo árbitro.",
      "rules.jogo.r9":"Após 10 minutos de jogo num set (sem nenhum jogador atingir 9 pontos), entra em vigor o 'expedite system': o ponto é ganho pelo recetor se o servidor não ganhar em 13 pancadas.",
      "rules.servico.title":"Serviço",
      "rules.servico.r0":"Ao servir, a bola deve ser colocada na palma da mão aberta e imóvel, acima do nível da superfície de jogo.",
      "rules.servico.r1":"A bola deve ser lançada quase verticalmente para cima, pelo menos 16 cm, sem rotação.",
      "rules.servico.r2":"O servidor deve bater na bola quando desce, de forma que toque primeiro o seu próprio lado da mesa e depois o lado do adversário.",
      "rules.servico.r3":"Em singulares, a bola pode cair em qualquer parte da mesa do adversário.",
      "rules.servico.r4":"Em pares, o serviço deve ser em diagonal: da metade direita do servidor para a metade direita do recetor.",
      "rules.servico.r5":"O contato da bola com a raquete deve ser visível ao adversário e ao árbitro — não pode ser ocultado pelo corpo.",
      "rules.servico.r6":"Se a bola toca a rede no serviço e cai válida, é 'let' — o serviço é repetido.",
      "rules.servico.r7":"Após advertência, qualquer serviço incorreto resulta em ponto imediato para o adversário.",
      "rules.servico.r8":"Se o servidor lança a bola para servir e não a bate, perde o ponto.",
      "rules.servico.r9":"Ao servir, o braço livre deve estar acima do nível da mesa e visível ao árbitro e ao adversário.",
      "rules.pontuacao.title":"Pontuação e Troca de Serviço",
      "rules.pontuacao.r0":"O serviço muda a cada 2 pontos disputados, alternando entre os jogadores.",
      "rules.pontuacao.r1":"Em caso de deuce (10-10), o serviço muda a cada ponto e é necessária uma vantagem de 2 pontos para ganhar o set.",
      "rules.pontuacao.r2":"Em pares, a ordem de serviço e receção deve manter-se até ao fim do set; no set seguinte, o par que recebeu passa a servir.",
      "rules.pontuacao.r3":"O primeiro a servir num jogo é determinado por sorteio (cara ou coroa, ou escolha do lado).",
      "rules.pontuacao.r4":"Ao início de cada set, os jogadores trocam de lado; no set decisivo (último), trocam de lado quando um jogador atinge 5 pontos.",
      "rules.pontuacao.r5":"Num set decisivo em pares, a ordem de receção pode ser alterada pelo par que recebe.",
      "rules.pontuacao.r6":"O 'expedite system' não altera a alternância de serviço de 2 em 2 pontos — passa apenas a 1 em 1 ponto a partir da sua entrada em vigor.",
      "rules.pontuacao.r7":"Após um 'let' no serviço, o par de serviços é repetido completamente (a contagem não avança).",
      "rules.equipamento.title":"Equipamento — Mesa e Rede",
      "rules.equipamento.r0":"A mesa tem 274 cm de comprimento × 152,5 cm de largura × 76 cm de altura.",
      "rules.equipamento.r1":"A superfície de jogo deve ser plana, uniforme, de cor mate (tipicamente azul ou verde) com uma linha branca de 2 cm nas bordas.",
      "rules.equipamento.r2":"A rede divide a mesa ao meio; tem 15,25 cm de altura ao longo de toda a sua extensão.",
      "rules.equipamento.r3":"A superfície de jogo não inclui as superfícies laterais (bordas laterais) da mesa.",
      "rules.equipamento.r4":"A mesa deve ser de madeira ou material similar, com uma taxa de ressalto de 23 ± 1 cm quando uma bola padrão é largada de 30 cm de altura.",
      "rules.equipamento.r5":"A linha central (2 mm de largura) divide a mesa em duas metades iguais e faz parte de cada metade direita para efeitos do serviço em pares.",
      "rules.bola.title":"Equipamento — Bola",
      "rules.bola.r0":"A bola deve ter 40 mm de diâmetro (± 0,5 mm) e pesar 2,7 g (± 0,1 g).",
      "rules.bola.r1":"A bola deve ser esférica com um desvio máximo de 0,35 mm.",
      "rules.bola.r2":"A cor da bola deve ser branca ou laranja, mate.",
      "rules.bola.r3":"Desde 2015, as bolas ITTF de competição são de plástico (poly), substituindo as de celuloide.",
      "rules.bola.r4":"Apenas bolas aprovadas pela ITTF podem ser usadas em competições internacionais.",
      "rules.raquete.title":"Equipamento — Raquete",
      "rules.raquete.r0":"A raquete pode ter qualquer dimensão, forma e peso, mas a lâmina deve ser plana e rígida.",
      "rules.raquete.r1":"Pelo menos 85% da espessura da lâmina deve ser de madeira natural.",
      "rules.raquete.r2":"Os dois lados da raquete devem ter cores diferentes: obrigatoriamente um lado vermelho e outro lado preto.",
      "rules.raquete.r3":"O revestimento (borracha) deve ser aprovado pela ITTF; a lista é atualizada regularmente.",
      "rules.raquete.r4":"A espessura total de cada lado do revestimento (borracha + esponja) não pode exceder 4 mm.",
      "rules.raquete.r5":"Podem ser usados revestimentos pimples-in (espinhos para dentro), pimples-out (espinhos para fora) ou anti-spin, desde que aprovados pela ITTF.",
      "rules.raquete.r6":"Antes do jogo, cada jogador deve mostrar a raquete ao adversário e ao árbitro para inspeção.",
      "rules.raquete.r7":"O uso de cola rápida (speed glue) com solventes orgânicos é proibido desde 2008 — só são permitidos adesivos aquosos.",
      "rules.raquete.r8":"Se a raquete for danificada durante o jogo, pode ser substituída com aprovação do árbitro.",
      "rules.conduta.title":"Conduta e Fair Play",
      "rules.conduta.r0":"Cada jogador tem direito a 1 time-out de 1 minuto por match (não por set), pedido em qualquer momento exceto durante o serviço.",
      "rules.conduta.r1":"O intervalo máximo entre sets é de 1 minuto.",
      "rules.conduta.r2":"O treinador só pode dar instruções durante os intervalos entre sets e durante os time-outs — nunca durante o jogo.",
      "rules.conduta.r3":"Comportamentos antidesportivos (insultos, danificar equipamento, interrupções deliberadas) são punidos com advertência e/ou ponto atribuído ao adversário.",
      "rules.conduta.r4":"Em caso de má conduta repetida, o árbitro pode excluir o jogador do match ou da competição.",
      "rules.conduta.r5":"Os jogadores devem respeitar as decisões do árbitro; protestos devem ser feitos de forma educada e apenas pelo jogador, nunca pelo treinador durante o jogo.",
      "rules.conduta.r6":"É proibido receber instrução por qualquer meio eletrónico durante o jogo.",
      "rules.torneio.title":"Regras de Torneio",
      "rules.torneio.r0":"Num torneio eliminatório (knockout), o perdedor está imediatamente eliminado.",
      "rules.torneio.r1":"O sistema round-robin (todos contra todos) distribui pontos: vitória = 2 pontos, derrota = 1 ponto, não comparência = 0 pontos.",
      "rules.torneio.r2":"Em caso de empate em pontos no round-robin, o desempate é feito por sets e depois por pontos dentro dos sets.",
      "rules.torneio.r3":"O seeding (cabeças de série) é baseado no ranking ITTF ou pela classificação no torneio anterior.",
      "rules.torneio.r4":"Os jogadores devem estar disponíveis no horário indicado; atraso superior a 10 minutos pode resultar em derrota por incomparecência.",
      "rules.torneio.r5":"As raquetes são inspecionadas antes do início de cada match e podem ser verificadas novamente após o jogo.",
      "rules.torneio.r6":"Em pares, os parceiros devem jogar alternadamente: cada jogador só pode bater na bola quando é a sua vez.",
      "rules.torneio.r7":"Nos Jogos Olímpicos e Campeonatos do Mundo, usa-se o sistema de melhor de 7 sets na maioria das fases.",
      "rules.torneio.r8":"O árbitro tem autoridade máxima durante o match; as decisões do árbitro assistente (umpire) sobre edge/bord são finais.",
      "rules.torneio.r9":"Em competições internacionais, os jogadores devem usar vestuário de cor diferente da bola (branca ou laranja).",
      "rules.especial.title":"Situações Especiais e Curiosidades",
      "rules.especial.r0":"Se a bola passa à volta da rede (em vez de por cima) e cai válida, é um ponto legítimo.",
      "rules.especial.r1":"Um jogador pode bater na bola com qualquer parte da superfície da raquete, incluindo a borda da raquete.",
      "rules.especial.r2":"Se a bola toca o suporte da rede e cai do lado do adversário num rally (não no serviço), é ponto válido.",
      "rules.especial.r3":"Se ambos os jogadores tocam a bola ao mesmo tempo, ponto para o adversário (falta dupla não existe — perde quem toca por último erradamente).",
      "rules.especial.r4":"Um jogador pode mover a mesa por acidente sem intenção — normalmente não é falta se a bola ainda for válida; cabe ao árbitro decidir.",
      "rules.especial.r5":"A ITTF atualiza as regras periodicamente; versão em vigor consultável em ittf.com.",
      "rules.especial.r6":"O material da bola mudou de celuloide para plástico (poly) em 2015, alterando ligeiramente o comportamento do spin.",
      "rules.especial.r7":"O 'tomahawk serve' (serviço com rotação lateral intensa) é permitido desde que o contato seja visível.",
      "quiz.easy.0.q":"Quantos pontos são necessários para ganhar um set no ténis de mesa (modo standard)?",
      "quiz.easy.0.o0":"11",
      "quiz.easy.0.o1":"21",
      "quiz.easy.0.o2":"15",
      "quiz.easy.0.o3":"9",
      "quiz.easy.0.exp":"Na ITTF, um set é ganho ao atingir 11 pontos, com uma vantagem mínima de 2 pontos.",
      "quiz.easy.1.q":"De quantos em quantos pontos se troca o serviço durante um jogo?",
      "quiz.easy.1.o0":"2",
      "quiz.easy.1.o1":"5",
      "quiz.easy.1.o2":"3",
      "quiz.easy.1.o3":"1",
      "quiz.easy.1.exp":"O serviço muda a cada 2 pontos, exceto em caso de deuce (10-10).",
      "quiz.easy.2.q":"O que é o 'deuce' no ténis de mesa?",
      "quiz.easy.2.o0":"Vitória por 11-0",
      "quiz.easy.2.o1":"Falta de serviço",
      "quiz.easy.2.o2":"Empate a 10 pontos que exige vantagem de 2",
      "quiz.easy.2.o3":"Ponto disputado",
      "quiz.easy.2.exp":"Deuce ocorre quando o marcador fica 10-10. A partir daí, o serviço muda a cada ponto e é necessária uma vantagem de 2 pontos para ganhar o set.",
      "quiz.easy.3.q":"Qual é o diâmetro oficial da bola de ténis de mesa (ITTF)?",
      "quiz.easy.3.o0":"36 mm",
      "quiz.easy.3.o1":"40 mm",
      "quiz.easy.3.o2":"38 mm",
      "quiz.easy.3.o3":"42 mm",
      "quiz.easy.3.exp":"A bola oficial ITTF tem 40 mm de diâmetro (introduzido em 2000, substituindo 38 mm).",
      "quiz.easy.4.q":"Ao servir, o lançamento da bola deve ter pelo menos quantos centímetros de altura?",
      "quiz.easy.4.o0":"10 cm",
      "quiz.easy.4.o1":"15 cm",
      "quiz.easy.4.o2":"16 cm",
      "quiz.easy.4.o3":"20 cm",
      "quiz.easy.4.exp":"A bola deve ser lançada quase verticalmente para cima, pelo menos 16 cm, a partir da palma da mão aberta.",
      "quiz.easy.5.q":"Quando um set chega a 10-10, quantos pontos consecutivos são necessários para ganhar?",
      "quiz.easy.5.o0":"1",
      "quiz.easy.5.o1":"2",
      "quiz.easy.5.o2":"3",
      "quiz.easy.5.o3":"4",
      "quiz.easy.5.exp":"Em deuce (10-10), é necessária uma vantagem de 2 pontos, ou seja, dois pontos consecutivos sobre o adversário.",
      "quiz.easy.6.q":"A mesa de ténis de mesa tem que dimensões?",
      "quiz.easy.6.o0":"274 × 152,5 cm",
      "quiz.easy.6.o1":"260 × 140 cm",
      "quiz.easy.6.o2":"280 × 160 cm",
      "quiz.easy.6.o3":"250 × 130 cm",
      "quiz.easy.6.exp":"A mesa oficial ITTF mede 274 cm de comprimento × 152,5 cm de largura, com altura de 76 cm.",
      "quiz.easy.7.q":"A que altura fica o topo da rede oficial ITTF?",
      "quiz.easy.7.o0":"14,25 cm",
      "quiz.easy.7.o1":"15,25 cm",
      "quiz.easy.7.o2":"16,25 cm",
      "quiz.easy.7.o3":"13,25 cm",
      "quiz.easy.7.exp":"A rede tem 15,25 cm de altura ao centro e ao longo de toda a sua extensão.",
      "quiz.easy.8.q":"Quantos sets tem normalmente um jogo clássico ITTF (competição)?",
      "quiz.easy.8.o0":"3",
      "quiz.easy.8.o1":"5",
      "quiz.easy.8.o2":"7",
      "quiz.easy.8.o3":"9",
      "quiz.easy.8.exp":"Na maioria das competições ITTF usa-se o formato melhor de 7 (4 sets ganhos para vencer). Para muitos eventos usa-se também melhor de 5 ou 3.",
      "quiz.easy.9.q":"O que acontece se a bola toca a rede durante o serviço?",
      "quiz.easy.9.o0":"Recomeça-se (let)",
      "quiz.easy.9.o1":"Ponto para o adversário",
      "quiz.easy.9.o2":"Ponto para quem serve",
      "quiz.easy.9.o3":"Segunda oportunidade",
      "quiz.easy.9.exp":"Se a bola toca a rede e cai na metade correta da mesa, é um 'let' e o serviço é repetido sem penalização.",
      "quiz.easy.10.q":"Em que lado da mesa deve cair a bola no serviço (jogo de singulares)?",
      "quiz.easy.10.o0":"Só no lado esquerdo",
      "quiz.easy.10.o1":"Em qualquer ponto da metade do adversário",
      "quiz.easy.10.o2":"Só no lado direito",
      "quiz.easy.10.o3":"Na diagonal",
      "quiz.easy.10.exp":"Em singulares, a bola deve apenas cair na metade da mesa do adversário, em qualquer ponto. Não há restrição diagonal (ao contrário dos pares).",
      "quiz.easy.11.q":"Qual a cor padrão da superfície da mesa ITTF?",
      "quiz.easy.11.o0":"Azul ou verde",
      "quiz.easy.11.o1":"Vermelho ou amarelo",
      "quiz.easy.11.o2":"Branco",
      "quiz.easy.11.o3":"Preto",
      "quiz.easy.11.exp":"A superfície da mesa deve ser de cor uniforme, mate (não brilhante), tipicamente azul escuro ou verde.",
      "quiz.easy.12.q":"O que é um 'expedite system' (sistema de aceleração)?",
      "quiz.easy.12.o0":"Forma de acelerar o serviço",
      "quiz.easy.12.o1":"Sistema de desempate por sorteio",
      "quiz.easy.12.o2":"Regra que limita um set a 10 minutos de duração",
      "quiz.easy.12.o3":"Sistema de pontuação dupla",
      "quiz.easy.12.exp":"Após 10 minutos de jogo num set, entra em vigor o 'expedite system': o ponto é ganho pelo recetor se o servidor fizer 13 pancadas consecutivas sem ganhar o ponto.",
      "quiz.easy.13.q":"Em pares, qual é a regra do serviço?",
      "quiz.easy.13.o0":"Qualquer jogador pode servir para qualquer lado",
      "quiz.easy.13.o1":"A bola deve ir em diagonal — metade direita para metade direita",
      "quiz.easy.13.o2":"A bola deve ir para a metade esquerda do adversário",
      "quiz.easy.13.o3":"Não há restrições em pares",
      "quiz.easy.13.exp":"Em pares (duplas), o serviço deve ser feito em diagonal: da metade direita do servidor para a metade direita do recetor.",
      "quiz.easy.14.q":"Um jogador pode apoiar a mão livre na mesa durante o jogo?",
      "quiz.easy.14.o0":"Sim, é permitido",
      "quiz.easy.14.o1":"Não, ponto para o adversário se tocar",
      "quiz.easy.14.o2":"Só no lado do próprio jogador",
      "quiz.easy.14.o3":"Apenas durante o serviço",
      "quiz.easy.14.exp":"Se a mão livre (a que não segura a raquete) tocar a superfície de jogo durante um rally, o ponto é perdido pelo jogador infrator.",
      "quiz.medium.0.q":"Após um 'let' no serviço, o que acontece ao par de pontos desse serviço?",
      "quiz.medium.0.o0":"O serviço é repetido, sem mudar a contagem",
      "quiz.medium.0.o1":"Perde-se um dos dois pontos desse par",
      "quiz.medium.0.o2":"O par de serviços reinicia",
      "quiz.medium.0.o3":"O adversário ganha o serviço",
      "quiz.medium.0.exp":"Um 'let' anula o serviço. O servidor repete exatamente o mesmo serviço, sem alterar nenhum marcador ou par de pontos.",
      "quiz.medium.1.q":"Quando começa exatamente o 'expedite system'?",
      "quiz.medium.1.o0":"Quando o marcador chega a 9-9",
      "quiz.medium.1.o1":"Após 10 minutos de jogo num set, se nenhum jogador ainda tiver 9 pontos",
      "quiz.medium.1.o2":"Sempre que um set dura mais de 8 minutos",
      "quiz.medium.1.o3":"Quando o atacante faz 10 pancadas seguidas",
      "quiz.medium.1.exp":"O expedite system é introduzido após 10 minutos de jogo num set, desde que nenhum dos jogadores tenha chegado aos 9 pontos. A qualquer momento pode ser pedido por ambos os jogadores.",
      "quiz.medium.2.q":"O que acontece se a bola toca a borda lateral da mesa?",
      "quiz.medium.2.o0":"É 'let'",
      "quiz.medium.2.o1":"Ponto para quem bateu na bola",
      "quiz.medium.2.o2":"Ponto para o adversário",
      "quiz.medium.2.o3":"Repetição do ponto",
      "quiz.medium.2.exp":"A borda lateral (borda lateral da superfície de jogo) não é válida. Se a bola toca a borda lateral, é ponto para o adversário.",
      "quiz.medium.3.q":"A bola pode tocar a borda superior da mesa (edge) e ser boa?",
      "quiz.medium.3.o0":"Sim, é ponto válido",
      "quiz.medium.3.o1":"Não, é falta",
      "quiz.medium.3.o2":"Apenas no serviço",
      "quiz.medium.3.o3":"Apenas se cair para dentro",
      "quiz.medium.3.exp":"Se a bola toca a borda superior da mesa (edge — a superfície de jogo), é um ponto válido, pois faz parte da superfície de jogo.",
      "quiz.medium.4.q":"Qual é o peso oficial de uma bola ITTF?",
      "quiz.medium.4.o0":"2,0 g",
      "quiz.medium.4.o1":"2,3 g",
      "quiz.medium.4.o2":"2,7 g",
      "quiz.medium.4.o3":"3,0 g",
      "quiz.medium.4.exp":"A bola oficial ITTF pesa 2,7 gramas.",
      "quiz.medium.5.q":"Durante o serviço, em que posição deve estar a palma da mão livre ao lançar a bola?",
      "quiz.medium.5.o0":"Aberta e plana, acima do nível da mesa",
      "quiz.medium.5.o1":"Fechada em punho",
      "quiz.medium.5.o2":"Apontada para o adversário",
      "quiz.medium.5.o3":"Abaixo do nível da mesa",
      "quiz.medium.5.exp":"A bola deve estar na palma da mão aberta e imóvel, acima do nível da superfície de jogo, antes de ser lançada para o serviço.",
      "quiz.medium.6.q":"O topo da rede pode ser tocado pela bola durante um rally (não no serviço)?",
      "quiz.medium.6.o0":"Sim, se cair do outro lado é ponto válido",
      "quiz.medium.6.o1":"Não, é sempre falta",
      "quiz.medium.6.o2":"Só se a bola não parar na rede",
      "quiz.medium.6.o3":"É sempre 'let'",
      "quiz.medium.6.exp":"Durante o rally, se a bola toca o topo da rede e cai válida no outro lado, o ponto é válido (não é let — o let só existe no serviço).",
      "quiz.medium.7.q":"Se um jogador interrompe o jogo intencionalmente sem razão válida, o que acontece?",
      "quiz.medium.7.o0":"O set é anulado",
      "quiz.medium.7.o1":"O árbitro dá um aviso oral",
      "quiz.medium.7.o2":"O ponto em disputa é atribuído ao adversário",
      "quiz.medium.7.o3":"O jogador é desqualificado",
      "quiz.medium.7.exp":"Interrupção deliberada do jogo é considerada 'má conduta'. O árbitro pode atribuir o ponto ao adversário como penalização.",
      "quiz.medium.8.q":"Em singulares, o servidor tem de bater na bola do próprio lado antes de ir para o outro lado?",
      "quiz.medium.8.o0":"Sim, obrigatório",
      "quiz.medium.8.o1":"Não, a bola vai diretamente para o lado do adversário",
      "quiz.medium.8.o2":"Só no primeiro serviço de cada jogo",
      "quiz.medium.8.o3":"Depende do modo de jogo",
      "quiz.medium.8.exp":"Em singulares, a bola vai diretamente da raquete para a metade do adversário, sem tocar no lado do servidor. É em pares que o serviço deve ser diagonal.",
      "quiz.medium.9.q":"O que é um 'good return' (devolução válida)?",
      "quiz.medium.9.o0":"Bola que toca sempre a rede",
      "quiz.medium.9.o1":"Bola que bate na mesa do servidor",
      "quiz.medium.9.o2":"Bola que cai fora da mesa",
      "quiz.medium.9.o3":"Bola que passa a rede e cai dentro da mesa do adversário ou na borda",
      "quiz.medium.9.exp":"Uma devolução válida é aquela em que a bola (após ser batida) passa sobre ou à volta da rede e cai na área de jogo do adversário ou na borda superior da mesa.",
      "quiz.medium.10.q":"Pode um jogador bater na bola antes de ela tocar a sua metade da mesa (volley)?",
      "quiz.medium.10.o0":"Sim, se a bola estiver a sair da mesa",
      "quiz.medium.10.o1":"Não, ponto para o adversário",
      "quiz.medium.10.o2":"Só no último ponto do set",
      "quiz.medium.10.o3":"Apenas se a bola tocar a rede antes",
      "quiz.medium.10.exp":"É proibido bater na bola antes de ela tocar a sua metade da mesa (volley). Se o fizer, perde o ponto, mesmo que a bola fosse para fora.",
      "quiz.medium.11.q":"O que sucede se o servidor lança a bola e decide não a bater?",
      "quiz.medium.11.o0":"É automático 'let'",
      "quiz.medium.11.o1":"É falta e ponto para o adversário",
      "quiz.medium.11.o2":"Pode apanhar a bola e repetir",
      "quiz.medium.11.o3":"É aviso oral do árbitro",
      "quiz.medium.11.exp":"Se o servidor lançar a bola para o serviço e não a bater, é falta — o ponto vai para o adversário.",
      "quiz.medium.12.q":"Se a bola em jogo toca num objeto alheio (roupa do jogador, etc.), o que acontece?",
      "quiz.medium.12.o0":"Ponto para o adversário",
      "quiz.medium.12.o1":"É 'let'",
      "quiz.medium.12.o2":"O ponto é repetido",
      "quiz.medium.12.o3":"Depende do árbitro",
      "quiz.medium.12.exp":"Se a bola em jogo tocar qualquer coisa que não seja a rede, os seus suportes ou a mesa, o ponto vai para o adversário.",
      "quiz.medium.13.q":"Qual é a altura mínima do teto ou obstáculo acima da mesa em competições ITTF?",
      "quiz.medium.13.o0":"3 m",
      "quiz.medium.13.o1":"4 m",
      "quiz.medium.13.o2":"5 m",
      "quiz.medium.13.o3":"6 m",
      "quiz.medium.13.exp":"A ITTF recomenda pelo menos 5 metros de espaço livre acima da mesa para competições internacionais.",
      "quiz.medium.14.q":"Em pares, após cada set, como muda a ordem de serviço?",
      "quiz.medium.14.o0":"Mantém-se igual",
      "quiz.medium.14.o1":"O recetor do último serviço torna-se servidor",
      "quiz.medium.14.o2":"O parceiro do servidor torna-se o próximo servidor",
      "quiz.medium.14.o3":"Escolha livre dos jogadores",
      "quiz.medium.14.exp":"Em pares, o par que recebeu no set anterior passará a servir, e o jogador que serviu por último passará a receber.",
      "quiz.hard.0.q":"Segundo o regulamento ITTF, quais as cores obrigatórias dos revestimentos (borrachas) de uma raquete?",
      "quiz.hard.0.o0":"Um lado vermelho, outro lado preto",
      "quiz.hard.0.o1":"Qualquer cor, desde que diferentes",
      "quiz.hard.0.o2":"Azul e vermelho",
      "quiz.hard.0.o3":"Verde e preto",
      "quiz.hard.0.exp":"O regulamento ITTF exige que os dois lados da raquete sejam obrigatoriamente um vermelho e um preto, para que o adversário possa distinguir os revestimentos.",
      "quiz.hard.1.q":"Qual a espessura máxima do revestimento (borracha + esponja) numa raquete aprovada ITTF?",
      "quiz.hard.1.o0":"3 mm",
      "quiz.hard.1.o1":"3,5 mm",
      "quiz.hard.1.o2":"4 mm",
      "quiz.hard.1.o3":"5 mm",
      "quiz.hard.1.exp":"A espessura total de cada lado do revestimento (borracha mais esponja, se existir) não pode exceder 4 mm.",
      "quiz.hard.2.q":"O que significa 'ITTF approved' numa bola?",
      "quiz.hard.2.o0":"Bola fabricada em China",
      "quiz.hard.2.o1":"Bola testada e homologada pela ITTF para competições internacionais",
      "quiz.hard.2.o2":"Bola usada nos Jogos Olímpicos",
      "quiz.hard.2.o3":"Bola de 38 mm (formato antigo)",
      "quiz.hard.2.exp":"'ITTF approved' significa que a bola foi testada e está na lista de produtos aprovados pela ITTF, cumprindo todos os critérios de tamanho, peso, redondeza e cor.",
      "quiz.hard.3.q":"Segundo a ITTF, pode-se usar revestimentos anti-spin (lisos) na raquete?",
      "quiz.hard.3.o0":"Sim, desde que sejam aprovados pela ITTF",
      "quiz.hard.3.o1":"Não, são proibidos em todas as competições",
      "quiz.hard.3.o2":"Só em competições nacionais",
      "quiz.hard.3.o3":"Apenas num dos lados",
      "quiz.hard.3.exp":"Revestimentos anti-spin (pimple-out ou lisos) são permitidos desde que estejam na lista aprovada pela ITTF. A lista de borrachas homologadas é publicada e atualizada regularmente.",
      "quiz.hard.4.q":"Num torneio ITTF, se um jogador parte a raquete durante o jogo, o que pode fazer?",
      "quiz.hard.4.o0":"Continuar com qualquer raquete disponível",
      "quiz.hard.4.o1":"Deve sair do torneio",
      "quiz.hard.4.o2":"Pode substituí-la por uma pré-aprovada pelo árbitro",
      "quiz.hard.4.o3":"Pede 5 minutos de pausa para substituir",
      "quiz.hard.4.exp":"Se a raquete ficar inutilizável, o jogador pode substituí-la, mas a raquete substituta deve ser aprovada pelo árbitro.",
      "quiz.hard.5.q":"Qual é o procedimento correto da inspeção de raquetes em competições ITTF?",
      "quiz.hard.5.o0":"Apenas o árbitro principal inspeciona antes da final",
      "quiz.hard.5.o1":"Os jogadores mostram as raquetes ao adversário e ao árbitro antes do início do jogo",
      "quiz.hard.5.o2":"Só se houver protesto do adversário",
      "quiz.hard.5.o3":"Só em competições com classificação mundial",
      "quiz.hard.5.exp":"Em competições ITTF, cada jogador deve mostrar a sua raquete ao adversário e ao árbitro antes do início do jogo (e após o jogo, se solicitado).",
      "quiz.hard.6.q":"Em condições normais, a que intervalo muda a bola num match de competição ITTF?",
      "quiz.hard.6.o0":"Cada set",
      "quiz.hard.6.o1":"Cada 3 pontos",
      "quiz.hard.6.o2":"Início de cada jogo ou quando danificada",
      "quiz.hard.6.o3":"Nunca, só por dano",
      "quiz.hard.6.exp":"A bola é substituída no início de cada jogo (match) ou quando está visivelmente danificada durante o jogo.",
      "quiz.hard.7.q":"O que diz a regra ITTF sobre o uso de substâncias na raquete ('speed glue')?",
      "quiz.hard.7.o0":"É permitido com aprovação prévia",
      "quiz.hard.7.o1":"Está completamente proibido desde 2008",
      "quiz.hard.7.o2":"É permitido apenas em competições nacionais",
      "quiz.hard.7.o3":"Necessita de certificado médico",
      "quiz.hard.7.exp":"O uso de cola rápida (speed glue) e adesivos com solventes orgânicos foi proibido pela ITTF em 2008. Só são permitidos adesivos aquosos (water-based).",
      "quiz.hard.8.q":"Segundo as regras ITTF, o que é uma 'bad service' (serviço inválido) não corrigida pelo árbitro após advertência?",
      "quiz.hard.8.o0":"Ponto imediato para o adversário",
      "quiz.hard.8.o1":"Segundo serviço",
      "quiz.hard.8.o2":"Let repetido",
      "quiz.hard.8.o3":"Desclassificação",
      "quiz.hard.8.exp":"Após advertência por mau serviço, qualquer serviço subsequente inválido resulta em ponto direto para o adversário, sem necessidade de nova advertência.",
      "quiz.hard.9.q":"Qual é a regra ITTF sobre o 'time-out' (pausa) num jogo?",
      "quiz.hard.9.o0":"Não é permitido time-out",
      "quiz.hard.9.o1":"Cada equipa tem 2 time-outs por jogo",
      "quiz.hard.9.o2":"Cada jogador/equipa tem direito a 1 time-out de 1 minuto por jogo",
      "quiz.hard.9.o3":"Só o árbitro pode interromper o jogo",
      "quiz.hard.9.exp":"Cada jogador (ou equipa em pares) tem direito a um time-out de 1 minuto por match (não por set). Pode ser pedido em qualquer momento, exceto durante o serviço.",
      "quiz.hard.10.q":"O que prevê o regulamento ITTF sobre o treinador (coach) durante o jogo?",
      "quiz.hard.10.o0":"O treinador pode dar instruções em qualquer momento",
      "quiz.hard.10.o1":"O treinador só pode dar instruções durante os intervalos entre sets e durante os time-outs",
      "quiz.hard.10.o2":"O treinador pode entrar na área de jogo",
      "quiz.hard.10.o3":"Não há regulação sobre o comportamento do treinador",
      "quiz.hard.10.exp":"O treinador só pode comunicar com o jogador durante os intervalos entre sets e durante os time-outs solicitados. Não é permitido qualquer tipo de instrução durante o jogo em si.",
      "quiz.hard.11.q":"O que são 'pimples-out' (espinhos para fora) num revestimento de raquete?",
      "quiz.hard.11.o0":"Revestimento com espinhos virados para dentro",
      "quiz.hard.11.o1":"Revestimento completamente liso",
      "quiz.hard.11.o2":"Revestimento com espinhos virados para fora, sem camada de esponja atrás",
      "quiz.hard.11.o3":"Borracha especial para defesa",
      "quiz.hard.11.exp":"'Pimples-out' (OX ou sem esponja) é um revestimento com os espinhos de borracha virados para fora. Reduz o efeito (spin) mas melhora o controlo. É permitido pela ITTF se aprovado.",
      "quiz.hard.12.q":"Quantos minutos de intervalo são permitidos entre sets num jogo ITTF?",
      "quiz.hard.12.o0":"1 minuto",
      "quiz.hard.12.o1":"2 minutos",
      "quiz.hard.12.o2":"3 minutos",
      "quiz.hard.12.o3":"5 minutos",
      "quiz.hard.12.exp":"O intervalo entre sets num jogo ITTF tem a duração máxima de 1 minuto.",
      "quiz.hard.13.q":"O que é o 'phantom serve' e qual é a sua situação regulamentar?",
      "quiz.hard.13.o0":"Serviço invisível, permitido",
      "quiz.hard.13.o1":"Serviço em que a raquete não toca claramente a bola, proibido",
      "quiz.hard.13.o2":"Serviço com rotação excessiva, limitada a 3000 RPM",
      "quiz.hard.13.o3":"Serviço com bola lançada mais de 30 cm, obrigatório",
      "quiz.hard.13.exp":"O 'phantom serve' esconde o contato da bola com a raquete (com o corpo ou braço livre), impossibilitando o adversário de ver o momento do impacto. É proibido pelas regras ITTF.",
      "quiz.hard.14.q":"Em competições ITTF, o que especifica a regra sobre a iluminação da área de jogo?",
      "quiz.hard.14.o0":"Mínimo de 200 lux",
      "quiz.hard.14.o1":"Mínimo de 500 lux",
      "quiz.hard.14.o2":"Mínimo de 1000 lux no plano da mesa, sem luz natural direta",
      "quiz.hard.14.o3":"Sem requisitos específicos",
      "quiz.hard.14.exp":"A ITTF recomenda pelo menos 1000 lux uniformemente sobre a superfície da mesa, sem luz solar direta, para competições internacionais."
    },
    en: {
      "menu.newGame":"New Game",
      "menu.newGameSub":"Choose players and start",
      "menu.tournament":"Tournament",
      "menu.tournamentSub":"Knockout bracket, auto-seeded",
      "menu.players":"Players",
      "menu.playersSub":"Manage and view statistics",
      "menu.history":"History",
      "menu.historySub":"Previous matches",
      "menu.data":"Data",
      "menu.dataSub":"Export or import backup",
      "menu.footer":"data stored only on this device",
      "screen.players":"Players",
      "screen.history":"History",
      "screen.gameDetail":"Match Detail",
      "screen.newGame":"New Game",
      "screen.gameType":"Game Type",
      "screen.pointsFormat":"Points & Format",
      "screen.newTournament":"New Tournament",
      "screen.tournament":"Tournament",
      "screen.minigames":"Mini Games",
      "screen.achievements":"Achievements",
      "screen.records":"Records",
      "screen.data":"Data",
      "btn.addPlayer":"＋ New",
      "btn.deletePlayer":"Delete",
      "btn.abandon":"Abandon",
      "btn.continue":"Continue ▸",
      "btn.startGame":"Start Match",
      "btn.createTournament":"Create Tournament",
      "btn.backMenu":"Back to Menu",
      "btn.start":"Start",
      "serve.title":"SERVICE",
      "serve.hint":"serves first",
      "setup.bluePlayer":"Blue Side",
      "setup.whitePlayer":"White Side",
      "setup.pointsPerSet":"Points per game",
      "setup.format":"Format",
      "mg.tap":"Quick Taps",
      "mg.tapSub":"Tap the dots before they disappear",
      "mg.memory":"Visual Memory",
      "mg.memorySub":"Memorise and repeat the sequence",
      "ach.unlocked":"🏆 ACHIEVEMENT UNLOCKED!",
      "data.export":"Export backup",
      "data.exportSub":"Generates a .json file with everything",
      "data.import":"Import backup",
      "data.importSub":"Add or merge data from a backup",
      "data.wipe":"Wipe all data",
      "data.wipeSub":"Removes players and history from this device",
      "js.choosePlayer":"Choose player",
      "js.sideBlue":"Blue",
      "js.sideWhite":"White",
      "js.continue":"Continue anyway ▸",
      "js.nextSet":"Next Game ▸",
      "js.undoMsg":"Last point undone — you can continue the game.",
      "js.setInProgress":"The current game (%b-%w) will not count. Finished games are saved to history.",
      "js.confirmEnd":"The current result will be saved to history.",
      "js.confirmWipe":"Wipe all data?",
      "js.confirmAbandon":"Abandon tournament?",
      "js.emptyPlayers":"Create players first.",
      "js.noData":"No data yet",
      "js.wins":"wins",
      "js.losses":"losses",
      "js.draws":"draws",
      "js.capotes":"whitewashes",
      "js.winRate":"Win%",
      "js.elo":"Rating",
      "js.allPlayers":"All players",
      "js.serve":"Serves",
      "js.notServe":"Doesn't serve",
      "js.set":"Game",
      "js.bestOf":"Best of",
      "js.free":"Free",
      "js.classic":"Classic",
      "js.custom":"Custom",
      "js.gameWon":"%n won the match",
      "js.setWon":"%n won the game",
      "js.deuce":"DEUCE",
      "js.matchPoint":"MATCH POINT",
      "js.capoteTag":"Whitewash",
      "js.newRecord":"🏆 New record!",
      "js.points":"Points",
      "js.level":"Level",
      "js.levelReached":"Level reached",
      "js.playAgain":"Play again",
      "js.tbd":"TBD",
      "js.play":"▶ PLAY",
      "js.whoseServe":"Game %n · who serves first?",
      "js.champion":"🏆 Tournament Champion",
      "js.winsLabel":"W",
      "js.lossesLabel":"L",
      "js.drawsLabel":"D",
      "js.capotesLabel":"W/W",
      "js.winRateLabel":"Win%",
      "js.eloLabel":"Rating",
      "js.bestRival":"Best rival",
      "js.worstRival":"Worst rival",
      "js.last10":"Last 10 matches",
      "js.streak":"Current streak",
      "js.setsWon":"Games won",
      "js.setsLost":"Games lost",
      "js.capotesMade":"Whitewashes made",
      "js.capotesSuffered":"Whitewashes suffered",
      "js.tournamentsWon":"Tournaments won",
      "js.tournamentsPlayed":"Tournaments played",
      "js.trainingMin":"min. of training",
      "js.trainingSessions":"sessions",
      "js.importReplace":"Replace everything",
      "js.importMerge":"Add to existing data",
      "js.importDetailFile":"The file has %p players and %g games.",
      "js.importDetailMerge":"<strong>Add</strong> brings %np new players and %ng new games (same names merged; duplicates ignored).",
      "js.importDetailReplace":"<strong>Replace everything</strong> deletes the current %p players and %g games and keeps only the file.",
      "js.recElo":"Highest Rating",
      "js.recStreak":"Longest Streak",
      "js.recWins":"Most Wins",
      "js.recCapotes":"Most Whitewashes",
      "js.recTournaments":"Most Tournaments Won",
      "js.recPoints":"Most Points Scored",
      "js.recDuration":"Longest Match",
      "js.recMgTap":"Quick Taps Record",
      "js.recMgMemory":"Memory Record",
      "js.recEloGain":"Biggest Rating Gain",
      "js.wins_unit":"wins",
      "js.min_unit":"min",
      "js.pts_unit":"pts",
      "js.roundQF":"Quarter-finals",
      "js.roundSF":"Semi-finals",
      "js.roundF":"Final",
      "js.serveEvery2":"Service every 2 points",
      "js.serveEvery5":"Service every 5 points",
      "js.serveEvery1":"Service every 1 point (deuce)",
      "js.eraseConfirm":"Are you sure? This cannot be undone.",
      "js.missedGame":"Mistake — undo last point",
      "js.gameInProgress":"You have a game in progress",
      "js.tournamentInProgress":"You have a tournament in progress",
      "js.resumeGame":"Resume game ▸",
      "js.resumeTournament":"Resume tournament ▸",
      "js.endOfSet":"END OF GAME",
      "js.endOfSetCapote":"END OF GAME · WHITEWASH",
      "js.endOfSetDeciding":"END OF GAME · MATCH DECIDED",
      "js.endOfSetCapoteDeciding":"END OF GAME · WHITEWASH · MATCH DECIDED",
      "js.endOfGame":"END OF MATCH",
      "js.endOfGameCapote":"END OF MATCH · WHITEWASH",
      "js.drawBetween":"Draw between",
      "js.chooseBlue":"Choose — Blue Side",
      "js.chooseWhite":"Choose — White Side",
      "js.noPlayersYet":"No players created yet.<br>Go back to the menu and create players first.",
      "js.trainingTitle":"Training Mode",
      "js.trainingFree":"Free timer",
      "js.trainingTimed":"Timed training",
      "js.trainingModeFree":"FREE MODE",
      "js.trainingModeTimed":"TRAINING %n MIN",
      "js.mgMemorize":"Memorise!",
      "js.mgYourTurn":"Your turn!",
      "js.mgPoints":"Points:",
      "js.mgLevel":"Level",
      "js.mgLevelReached":"Level reached:",
      "js.mgRecord":"rec:",
      "js.mgMemoryTitle":"Visual Memory",
      "js.achSecret":"Secret achievement unlocked!",
      "js.achSecretDesc":"Secret achievement. Keep playing to discover it.",
      "js.cancel":"Cancel",
      "js.save":"Save",
      "js.undo":"Undo last point",
      "js.pause":"Pause timer",
      "js.modeCustom":"Custom",
      "js.modeClassic":"Classic",
      "js.modeClassicDesc":"11 points per game · BO3, BO5 or BO7",
      "js.formatFree":"Free",
      "js.formatBo3":"Best of 3",
      "js.formatBo5":"Best of 5",
      "js.formatBo7":"Best of 7",
      "js.setBalanced":"Very balanced game",
      "js.descPlaceholder":"E.g.: summer tournament, game room...",
      "js.shortcutTraining":"Training Mode",
      "js.shortcutMinigames":"Mini Games",
      "js.shortcutAchievements":"Achievements",
      "js.shortcutRecords":"Records",
      "js.setLabel":"GAME",
      "js.noHistory":"No matches in history yet.",
      "js.catFirstSteps":"First Steps",
      "js.catWins":"Victories",
      "js.catSets":"Games",
      "js.catComebacks":"Comebacks",
      "js.catElo":"Rating",
      "js.catPoints":"Points",
      "js.catTournaments":"Tournaments",
      "js.catRivalries":"Rivalries",
      "js.catTraining":"Training",
      "js.catMinigames":"Mini-Games",
      "js.catSpecials":"Special",
      "js.noDataYet":"No data yet",
      "js.bracketTbd":"TBD",
      "js.noPlayersEmpty":"No players yet.<br>Tap '＋ New' to add your first.",
      "js.leaderboard":"Leaderboard · Top %n",
      "js.playerCol":"Player",
      "js.gamesUnit":"%n games",
      "js.noGamesProfile":"No games recorded yet.",
      "js.resultDraw":"Draw",
      "js.resultWon":"Won",
      "js.resultLost":"Lost",
      "js.gamesDisputed":"%n game(s)",
      "js.headToHead":"Head to head",
      "js.recentGames":"Recent games",
      "js.scorerColor":"Scorer colour",
      "js.eloLabel2":"ELO (fun)",
      "js.statGamesPlayed":"Games played",
      "js.statGamesWon":"Games won",
      "js.statGamesLost":"Games lost",
      "js.statGamesDrawn":"Games drawn",
      "js.statSetsWonV":"Sets won (wins)",
      "js.statSetsLostD":"Sets lost (losses)",
      "js.statTotalSetsWon":"Total sets won",
      "js.statTotalSetsLost":"Total sets lost",
      "js.statCapotesMade":"Whitewashes made",
      "js.statCapotesSuffered":"Whitewashes suffered",
      "js.statTournamentsWon":"Tournaments won",
      "js.statTournamentsTotal":"Tournaments total",
      "js.bestRivalAgainst":"Most wins against (%n)",
      "js.worstRivalAgainst":"Most losses against (%n)",
      "js.noHistoryYet":"No games in history yet.<br>Play the first match to see it here.",
      "js.draw":"DRAW",
      "js.setsSep":"SETS",
      "js.xCapote":"%nx Whitewash",
      "js.modeFree":"FREE",
      "js.modeMd3":"BO3",
      "js.modeMd5":"BO5",
      "js.modeMd7":"BO7",
      "js.gameEndedDraw":"Game ended in a draw",
      "js.setsWonBy":"Sets (%n won the match)",
      "js.ptsPerSet":"points per set",
      "js.duration":"duration",
      "js.setRecap":"Set %n",
      "js.undoToast":"Last point undone — you can continue the set.",
      "js.statsSaved":"Saved players",
      "js.gamesInHistory":"Games in history",
      "js.exportedToast":"Backup exported: %f",
      "js.importedToast":"Imported: %p players, %g games",
      "js.invalidFile":"Invalid or corrupted file.",
      "js.cantReadFile":"Could not read the file.",
      "js.invalidFormat":"Invalid file: unexpected format.",
      "js.invalidBackup":"Invalid file: not a PLACAR backup.",
      "js.replacedToast":"Data replaced successfully.",
      "js.wipedToast":"All data has been wiped.",
      "js.createPlayersFirst":"Create players first.",
      "js.roundLabel":"Round %n",
      "js.tournamentWinnerSub":"%m games · %p players",
      "js.choosePlayerFirst":"Choose a player first",
      "js.recMgMemory2":"Visual Memory Record",
      "js.recMorePoints":"Most Points Accumulated",
      "js.recMoreTraining":"Most Training Time",
      "js.levelPrefix":"level ",
      "js.winsUnit":" wins",
      "js.capotesUnit":" whitewashes",
      "js.tournamentsUnit":" tournaments",
      "js.pointsUnit":" points",
      "js.minUnit":" min",
      "js.achProgressText":"%d / %t achievements",
      "js.setup.pts11":"11 points",
      "js.setup.pts21":"21 points",
      "js.overlay.endGameTitle":"END GAME",
      "js.overlay.confirmEnd":"Confirm end of game?",
      "js.overlay.confirmEndBtn":"End Game",
      "js.data.backup":"Backup",
      "js.data.wipeAll":"Wipe all",
      "js.mg.playAs":"Play as",
      "js.tournament.size":"Size",
      "js.tournament.mode":"Mode",
      "js.mode.customDesc":"11 or 21 points · free, BO3 or BO5 · service alternates every 5 points",
      "mg.quiz":"Rules Quiz",
      "mg.quizSub":"Test your knowledge of ITTF rules",
      "mg.rules":"ITTF Rules",
      "mg.rulesSub":"All official table tennis rules",
      "js.mgQuizScore":"Score:",
      "js.mgQuizIntro":"Choose difficulty level",
      "js.mgQuizEasy":"Easy",
      "js.mgQuizEasyDesc":"Basic game rules",
      "js.mgQuizMedium":"Medium",
      "js.mgQuizMediumDesc":"Service and scoring rules",
      "js.mgQuizHard":"Hard",
      "js.mgQuizHardDesc":"Regulations and tournaments",
      "js.mgQuizBestScore":"Best score:",
      "js.mgQuizNext":"Next ▸",
      "js.mgQuizFinalScore":"Final score:",
      "js.mgQuizCorrect":"Correct! ✓",
      "js.mgQuizWrong":"Wrong ✗",
      "js.mgQuizChooseFirst":"Choose a player first",
      "js.mgQuizResultGreat":"Excellent! You know the rules very well!",
      "js.mgQuizResultGood":"Good job! Keep studying the rules.",
      "js.mgQuizResultTry":"Keep practising and reading the ITTF rules.",
      "js.langBtn":"Language",
      "js.settingsBtn":"Settings",
      "js.descLabel":"Description",
      "js.optional":"(optional)",
      "js.nPlayers4":"4 players",
      "js.nPlayers8":"8 players",
      "js.nPlayers16":"16 players",
      "js.trainingDuration":"Duration (minutes)",
      "js.back":"‹ Back",
      "js.gameEndedTitle":"GAME OVER",
      "js.backToMenu":"Back to Menu",
      "js.newPlayerTitle":"NEW PLAYER",
      "js.newPlayerName":"Player name",
      "js.playerNamePlaceholder":"E.g.: Alex",
      "js.colorPickerLabel":"Scorer colour",
      "js.color.blueWhite":"Blue / White",
      "js.color.greenWhite":"Green / White",
      "js.color.redWhite":"Red / White",
      "js.color.pinkWhite":"Pink / White",
      "js.color.purpleWhite":"Purple / White",
      "js.color.goldWhite":"Gold / White",
      "js.color.whiteBlack":"White / Black",
      "js.color.orangeWhite":"Orange / White",
      "js.dataExplain":"Save players and history to a file you can keep in the cloud (Drive, email, etc.) and use to restore everything on this or another device.",
      "js.importTitle":"IMPORT DATA",
      "js.importQuestion":"What do you want to do?",
      "js.importDetail":"This will replace the players and history already saved on this device.",
      "js.mergeImport":"Add to existing data",
      "js.replaceImport":"Replace everything",
      "js.wipeTitle":"WIPE ALL",
      "js.wipeQuestion":"Wipe all data?",
      "js.wipeDetail":"This action cannot be undone. Consider exporting a backup first.",
      "js.wipeConfirm":"Wipe all",
      "js.rotateHint":"Rotate the tablet to landscape",
      "js.overlay.confirmEndDetail":"The current result will be saved to history.",
      "ach.first_point.name":"First Point",
      "ach.first_point.desc":"Score your first point.",
      "ach.first_set.name":"First Set",
      "ach.first_set.desc":"Win your first set.",
      "ach.first_win.name":"First Win",
      "ach.first_win.desc":"Win your first game.",
      "ach.first_tournament.name":"First Tournament",
      "ach.first_tournament.desc":"Participate in your first tournament.",
      "ach.first_trophy.name":"First Trophy",
      "ach.first_trophy.desc":"Win your first tournament.",
      "ach.wins_10.name":"10 Wins",
      "ach.wins_10.desc":"Win 10 games.",
      "ach.wins_50.name":"50 Wins",
      "ach.wins_50.desc":"Win 50 games.",
      "ach.wins_100.name":"100 Wins",
      "ach.wins_100.desc":"Win 100 games.",
      "ach.wins_200.name":"200 Wins",
      "ach.wins_200.desc":"Win 200 games.",
      "ach.streak_3.name":"Hat-trick",
      "ach.streak_3.desc":"3 consecutive wins.",
      "ach.streak_5.name":"On Fire",
      "ach.streak_5.desc":"5 consecutive wins.",
      "ach.streak_10.name":"Unstoppable",
      "ach.streak_10.desc":"10 consecutive wins.",
      "ach.streak_20.name":"Invincible",
      "ach.streak_20.desc":"20 consecutive wins.",
      "ach.sweep.name":"Sweep",
      "ach.sweep.desc":"Win a game without losing any set.",
      "ach.capote_set.name":"Shutout",
      "ach.capote_set.desc":"Win a set 11-0.",
      "ach.set_perfect.name":"Perfect Set",
      "ach.set_perfect.desc":"Win a set allowing at most 3 points.",
      "ach.deciding_set.name":"Decider",
      "ach.deciding_set.desc":"Win a game decided in the last set.",
      "ach.comeback.name":"Comeback",
      "ach.comeback.desc":"Win a game after losing the 1st set.",
      "ach.comeback_02.name":"Great Comeback",
      "ach.comeback_02.desc":"Win a game after being 0-2 in sets.",
      "ach.comeback_pts.name":"Never Give Up",
      "ach.comeback_pts.desc":"Win a set after being down by 5+ points.",
      "ach.elo_1000.name":"Four Digits",
      "ach.elo_1000.desc":"Reach 1000 ELO.",
      "ach.elo_1200.name":"1200 Club",
      "ach.elo_1200.desc":"Reach 1200 ELO.",
      "ach.elo_1300.name":"Elite",
      "ach.elo_1300.desc":"Reach 1300 ELO.",
      "ach.elo_1500.name":"Master",
      "ach.elo_1500.desc":"Reach 1500 ELO.",
      "ach.pts_100.name":"Centenary",
      "ach.pts_100.desc":"Accumulate 100 points.",
      "ach.pts_500.name":"500 Points",
      "ach.pts_500.desc":"Accumulate 500 points.",
      "ach.pts_1000.name":"1000 Points",
      "ach.pts_1000.desc":"Accumulate 1000 points.",
      "ach.tour_2.name":"Double Champion",
      "ach.tour_2.desc":"Win 2 tournaments.",
      "ach.tour_3.name":"Triple Champion",
      "ach.tour_3.desc":"Win 3 tournaments.",
      "ach.rival_10.name":"Classic",
      "ach.rival_10.desc":"Play 10 matches against the same opponent.",
      "ach.rival_25.name":"Rivalry",
      "ach.rival_25.desc":"Play 25 matches against the same opponent.",
      "ach.rival_dom.name":"Domination",
      "ach.rival_dom.desc":"10 wins advantage over the same opponent.",
      "ach.rival_5.name":"Executioner",
      "ach.rival_5.desc":"5 consecutive wins against the same opponent.",
      "ach.train_first.name":"First Training",
      "ach.train_first.desc":"Complete a training session.",
      "ach.train_10m.name":"10 Minutes",
      "ach.train_10m.desc":"Accumulate 10 minutes of training.",
      "ach.train_1h.name":"1 Hour",
      "ach.train_1h.desc":"Accumulate 60 minutes of training.",
      "ach.train_5sess.name":"Discipline",
      "ach.train_5sess.desc":"Complete 5 training sessions.",
      "ach.mg_tap_10.name":"Steel Reflexes",
      "ach.mg_tap_10.desc":"Score 10 points in Quick Taps.",
      "ach.mg_tap_30.name":"Lightning",
      "ach.mg_tap_30.desc":"Score 30 points in Quick Taps.",
      "ach.mg_mem_5.name":"Solid Memory",
      "ach.mg_mem_5.desc":"Reach level 5 in Visual Memory.",
      "ach.mg_mem_10.name":"Iron Memory",
      "ach.mg_mem_10.desc":"Reach level 10 in Visual Memory.",
      "ach.secret_11_0.name":"Humiliation",
      "ach.secret_11_0.desc":"Win a set 11-0.",
      "ach.secret_3_2.name":"To the Limit",
      "ach.secret_3_2.desc":"Win a game decided in the 5th set.",
      "ach.secret_11_9.name":"Point by Point",
      "ach.secret_11_9.desc":"Win a set 11-9.",
      "ach.secret_midnight.name":"Night Session",
      "ach.secret_midnight.desc":"Play after midnight.",
      "ach.secret_morning.name":"Early Bird",
      "ach.secret_morning.desc":"Play before 08:00.",
      "ach.secret_10day.name":"Machine",
      "ach.secret_10day.desc":"Play 10 games in the same day.",
      "rules.jogo.title":"The Game — General Rules",
      "rules.jogo.r0":"A set is won by the first player to reach 11 points, with a minimum 2-point lead over the opponent.",
      "rules.jogo.r1":"A match is won by the player who wins the most sets in the defined format (best of 3, 5 or 7).",
      "rules.jogo.r2":"The player who scores a point serves next (or retains service according to rotation).",
      "rules.jogo.r3":"If the ball in play touches any part of a player's body except the paddle hand, the point is lost.",
      "rules.jogo.r4":"The free hand (not holding the paddle) CANNOT touch the playing surface during a rally — point to the opponent.",
      "rules.jogo.r5":"If the ball touches the top edge of the table (edge ball), the point is valid.",
      "rules.jogo.r6":"If the ball touches the side of the table, the point goes to the opponent — it is not a playing area.",
      "rules.jogo.r7":"A player cannot hit the ball before it bounces on their half of the table (no volleys).",
      "rules.jogo.r8":"The game may be interrupted for a verifiable injury, equipment failure or other reason accepted by the referee.",
      "rules.jogo.r9":"After 10 minutes of play in a set (without any player reaching 9 points), the expedite system applies: the point goes to the receiver if the server fails to win within 13 strokes.",
      "rules.servico.title":"Service",
      "rules.servico.r0":"When serving, the ball must be placed on the open, stationary palm of the free hand, above table level.",
      "rules.servico.r1":"The ball must be tossed nearly vertically upward, at least 16 cm, without spin.",
      "rules.servico.r2":"The server must strike the ball on the way down so that it touches their own side of the table first, then the opponent's side.",
      "rules.servico.r3":"In singles, the ball may land anywhere on the opponent's half of the table.",
      "rules.servico.r4":"In doubles, the serve must be diagonal: from the server's right half to the receiver's right half.",
      "rules.servico.r5":"The contact of the ball with the paddle must be visible to both the opponent and the umpire — it cannot be hidden by the body.",
      "rules.servico.r6":"If the ball touches the net on service and lands correctly, it is a 'let' — the service is replayed.",
      "rules.servico.r7":"After a warning, any subsequent illegal service results in an immediate point to the opponent.",
      "rules.servico.r8":"If the server tosses the ball to serve but fails to strike it, the point is lost.",
      "rules.servico.r9":"When serving, the free arm must be above table level and visible to the umpire and opponent.",
      "rules.pontuacao.title":"Scoring and Service Change",
      "rules.pontuacao.r0":"Service changes every 2 points played, alternating between players.",
      "rules.pontuacao.r1":"In deuce (10-10), service changes every point and a 2-point lead is required to win the set.",
      "rules.pontuacao.r2":"In doubles, the order of service and receiving must be maintained until the end of the set; in the next set, the pair that received now serves.",
      "rules.pontuacao.r3":"The first server in a game is determined by a draw (coin toss or choice of side).",
      "rules.pontuacao.r4":"At the start of each set, players switch ends; in the deciding set (last set), they switch ends when a player reaches 5 points.",
      "rules.pontuacao.r5":"In a deciding set in doubles, the receiving pair may change their order of receiving.",
      "rules.pontuacao.r6":"The expedite system does not change the 2-point service alternation — it merely reduces to 1-point service alternation from its activation.",
      "rules.pontuacao.r7":"After a service let, the service pair is replayed in full (the count does not advance).",
      "rules.equipamento.title":"Equipment — Table and Net",
      "rules.equipamento.r0":"The table is 274 cm long × 152.5 cm wide × 76 cm high.",
      "rules.equipamento.r1":"The playing surface must be flat, uniform, matte in colour (typically blue or green) with a 2 cm white border line.",
      "rules.equipamento.r2":"The net divides the table in half; it is 15.25 cm high along its entire length.",
      "rules.equipamento.r3":"The playing surface does not include the side surfaces (side edges) of the table.",
      "rules.equipamento.r4":"The table must be made of wood or similar material, with a bounce rate of 23 ± 1 cm when a standard ball is dropped from 30 cm.",
      "rules.equipamento.r5":"The centre line (2 mm wide) divides the table into two equal halves and is part of each right half for doubles service purposes.",
      "rules.bola.title":"Equipment — Ball",
      "rules.bola.r0":"The ball must be 40 mm in diameter (± 0.5 mm) and weigh 2.7 g (± 0.1 g).",
      "rules.bola.r1":"The ball must be spherical with a maximum deviation of 0.35 mm.",
      "rules.bola.r2":"The colour of the ball must be white or orange, matte.",
      "rules.bola.r3":"Since 2015, ITTF competition balls are made of plastic (poly), replacing celluloid.",
      "rules.bola.r4":"Only ITTF-approved balls may be used in international competitions.",
      "rules.raquete.title":"Equipment — Racket",
      "rules.raquete.r0":"The racket may be of any size, shape and weight, but the blade must be flat and rigid.",
      "rules.raquete.r1":"At least 85% of the blade thickness must be natural wood.",
      "rules.raquete.r2":"The two sides of the racket must be different colours: one side must be red and the other black.",
      "rules.raquete.r3":"The covering (rubber) must be ITTF-approved; the list is updated regularly.",
      "rules.raquete.r4":"The total thickness of each side of the covering (rubber + sponge) must not exceed 4 mm.",
      "rules.raquete.r5":"Pimples-in, pimples-out or anti-spin rubbers may be used, provided they are ITTF-approved.",
      "rules.raquete.r6":"Before the match, each player must show their racket to the opponent and the umpire for inspection.",
      "rules.raquete.r7":"The use of speed glue with organic solvents has been banned since 2008 — only water-based glues are allowed.",
      "rules.raquete.r8":"If the racket is damaged during the match, it may be replaced with the umpire's approval.",
      "rules.conduta.title":"Conduct and Fair Play",
      "rules.conduta.r0":"Each player is entitled to 1 one-minute time-out per match (not per set), requested at any time except during service.",
      "rules.conduta.r1":"The maximum interval between sets is 1 minute.",
      "rules.conduta.r2":"The coach may only give instructions during set breaks and time-outs — never during play.",
      "rules.conduta.r3":"Unsporting behaviour (insults, damaging equipment, deliberate interruptions) is punished with a warning and/or a point awarded to the opponent.",
      "rules.conduta.r4":"In the case of repeated misconduct, the umpire may exclude the player from the match or competition.",
      "rules.conduta.r5":"Players must respect the umpire's decisions; protests must be made politely and only by the player, never by the coach during play.",
      "rules.conduta.r6":"Receiving instructions by any electronic means during play is prohibited.",
      "rules.torneio.title":"Tournament Rules",
      "rules.torneio.r0":"In a knockout tournament, the loser is immediately eliminated.",
      "rules.torneio.r1":"The round-robin system awards points: win = 2 points, loss = 1 point, no-show = 0 points.",
      "rules.torneio.r2":"In the event of a tie on points in a round-robin, tiebreakers are first sets and then points within sets.",
      "rules.torneio.r3":"Seeding is based on the ITTF ranking or the classification from the previous tournament.",
      "rules.torneio.r4":"Players must be available at the indicated time; a delay of more than 10 minutes may result in a walkover loss.",
      "rules.torneio.r5":"Rackets are inspected before each match and may be re-checked after the match.",
      "rules.torneio.r6":"In doubles, partners must play alternately: each player may only hit the ball when it is their turn.",
      "rules.torneio.r7":"At the Olympic Games and World Championships, best-of-7 is used in most stages.",
      "rules.torneio.r8":"The umpire has ultimate authority during the match; the assistant umpire's decisions on edge/side balls are final.",
      "rules.torneio.r9":"In international competitions, players must wear clothing of a different colour from the ball (white or orange).",
      "rules.especial.title":"Special Situations and Curiosities",
      "rules.especial.r0":"If the ball goes around the net (rather than over it) and lands correctly, it is a valid point.",
      "rules.especial.r1":"A player may hit the ball with any part of the racket surface, including the edge of the racket.",
      "rules.especial.r2":"If the ball touches the net post and falls on the opponent's side during a rally (not on service), it is a valid point.",
      "rules.especial.r3":"If both players touch the ball simultaneously, the point goes to the opponent (there is no double fault — whoever touched it last incorrectly loses).",
      "rules.especial.r4":"A player may accidentally move the table — usually not a fault if the ball is still valid; the umpire decides.",
      "rules.especial.r5":"The ITTF updates the rules periodically; the current version can be consulted at ittf.com.",
      "rules.especial.r6":"The ball material changed from celluloid to plastic (poly) in 2015, slightly altering spin behaviour.",
      "rules.especial.r7":"The 'tomahawk serve' (heavy side-spin service) is allowed as long as the contact is visible.",
      "quiz.easy.0.q":"How many points are needed to win a set in table tennis (standard mode)?",
      "quiz.easy.0.o0":"11",
      "quiz.easy.0.o1":"21",
      "quiz.easy.0.o2":"15",
      "quiz.easy.0.o3":"9",
      "quiz.easy.0.exp":"Under ITTF rules, a set is won by reaching 11 points, with a minimum 2-point lead.",
      "quiz.easy.1.q":"How often does service change during a game?",
      "quiz.easy.1.o0":"Every 2 points",
      "quiz.easy.1.o1":"Every 5 points",
      "quiz.easy.1.o2":"Every 3 points",
      "quiz.easy.1.o3":"Every point",
      "quiz.easy.1.exp":"Service changes every 2 points, except in deuce (10-10).",
      "quiz.easy.2.q":"What is 'deuce' in table tennis?",
      "quiz.easy.2.o0":"Win by 11-0",
      "quiz.easy.2.o1":"Service fault",
      "quiz.easy.2.o2":"A tie at 10 points requiring a 2-point lead",
      "quiz.easy.2.o3":"A contested point",
      "quiz.easy.2.exp":"Deuce occurs when the score reaches 10-10. From there, service changes every point and a 2-point lead is needed to win the set.",
      "quiz.easy.3.q":"What is the official diameter of an ITTF table tennis ball?",
      "quiz.easy.3.o0":"36 mm",
      "quiz.easy.3.o1":"40 mm",
      "quiz.easy.3.o2":"38 mm",
      "quiz.easy.3.o3":"42 mm",
      "quiz.easy.3.exp":"The official ITTF ball is 40 mm in diameter (introduced in 2000, replacing 38 mm).",
      "quiz.easy.4.q":"When serving, the ball toss must be at least how high?",
      "quiz.easy.4.o0":"10 cm",
      "quiz.easy.4.o1":"15 cm",
      "quiz.easy.4.o2":"16 cm",
      "quiz.easy.4.o3":"20 cm",
      "quiz.easy.4.exp":"The ball must be tossed nearly vertically upward at least 16 cm from the open palm.",
      "quiz.easy.5.q":"When a set reaches 10-10, how many consecutive points are needed to win?",
      "quiz.easy.5.o0":"1",
      "quiz.easy.5.o1":"2",
      "quiz.easy.5.o2":"3",
      "quiz.easy.5.o3":"4",
      "quiz.easy.5.exp":"In deuce (10-10), a 2-point advantage is required — two consecutive points over the opponent.",
      "quiz.easy.6.q":"What are the dimensions of a table tennis table?",
      "quiz.easy.6.o0":"274 × 152.5 cm",
      "quiz.easy.6.o1":"260 × 140 cm",
      "quiz.easy.6.o2":"280 × 160 cm",
      "quiz.easy.6.o3":"250 × 130 cm",
      "quiz.easy.6.exp":"The official ITTF table measures 274 cm long × 152.5 cm wide, at a height of 76 cm.",
      "quiz.easy.7.q":"How high is the top of the official ITTF net?",
      "quiz.easy.7.o0":"14.25 cm",
      "quiz.easy.7.o1":"15.25 cm",
      "quiz.easy.7.o2":"16.25 cm",
      "quiz.easy.7.o3":"13.25 cm",
      "quiz.easy.7.exp":"The net is 15.25 cm high at the centre and along its entire length.",
      "quiz.easy.8.q":"How many sets does a classic ITTF competition match typically have?",
      "quiz.easy.8.o0":"3",
      "quiz.easy.8.o1":"5",
      "quiz.easy.8.o2":"7",
      "quiz.easy.8.o3":"9",
      "quiz.easy.8.exp":"Most ITTF competitions use best-of-7 format (first to 4 sets wins). Best of 5 or 3 are also used.",
      "quiz.easy.9.q":"What happens if the ball touches the net during service?",
      "quiz.easy.9.o0":"Replay (let)",
      "quiz.easy.9.o1":"Point to opponent",
      "quiz.easy.9.o2":"Point to server",
      "quiz.easy.9.o3":"Second chance",
      "quiz.easy.9.exp":"If the ball touches the net and lands correctly on the opponent's side, it is a 'let' and service is replayed without penalty.",
      "quiz.easy.10.q":"Where must the ball land on service in singles?",
      "quiz.easy.10.o0":"Only the left side",
      "quiz.easy.10.o1":"Anywhere on the opponent's half",
      "quiz.easy.10.o2":"Only the right side",
      "quiz.easy.10.o3":"Diagonally",
      "quiz.easy.10.exp":"In singles, the ball only needs to land on the opponent's half of the table, anywhere. There is no diagonal restriction (unlike doubles).",
      "quiz.easy.11.q":"What is the standard colour of an ITTF table surface?",
      "quiz.easy.11.o0":"Blue or green",
      "quiz.easy.11.o1":"Red or yellow",
      "quiz.easy.11.o2":"White",
      "quiz.easy.11.o3":"Black",
      "quiz.easy.11.exp":"The table surface must be a uniform, matte (non-shiny) colour, typically dark blue or green.",
      "quiz.easy.12.q":"What is the 'expedite system'?",
      "quiz.easy.12.o0":"A way to speed up service",
      "quiz.easy.12.o1":"A tiebreak by draw",
      "quiz.easy.12.o2":"A rule limiting a set to 10 minutes",
      "quiz.easy.12.o3":"A double-scoring system",
      "quiz.easy.12.exp":"After 10 minutes of play in a set, the expedite system applies: the point goes to the receiver if the server fails to win within 13 consecutive strokes.",
      "quiz.easy.13.q":"In doubles, what is the service rule?",
      "quiz.easy.13.o0":"Any player may serve to any side",
      "quiz.easy.13.o1":"The ball must go diagonally — right half to right half",
      "quiz.easy.13.o2":"The ball must go to the opponent's left half",
      "quiz.easy.13.o3":"There are no restrictions in doubles",
      "quiz.easy.13.exp":"In doubles, the serve must be diagonal: from the server's right half to the receiver's right half.",
      "quiz.easy.14.q":"Can a player rest their free hand on the table during play?",
      "quiz.easy.14.o0":"Yes, it is allowed",
      "quiz.easy.14.o1":"No, point to the opponent if touched",
      "quiz.easy.14.o2":"Only on the player's own side",
      "quiz.easy.14.o3":"Only during service",
      "quiz.easy.14.exp":"If the free hand (not holding the paddle) touches the playing surface during a rally, the point is lost by the offending player.",
      "quiz.medium.0.q":"After a service let, what happens to that service pair?",
      "quiz.medium.0.o0":"Service is replayed without changing the count",
      "quiz.medium.0.o1":"One of the two points in that pair is lost",
      "quiz.medium.0.o2":"The service pair restarts",
      "quiz.medium.0.o3":"The opponent gains service",
      "quiz.medium.0.exp":"A let cancels the service. The server repeats exactly the same service without changing any score or service pair.",
      "quiz.medium.1.q":"When exactly does the expedite system begin?",
      "quiz.medium.1.o0":"When the score reaches 9-9",
      "quiz.medium.1.o1":"After 10 minutes of play in a set, if neither player has reached 9 points",
      "quiz.medium.1.o2":"Whenever a set lasts more than 8 minutes",
      "quiz.medium.1.o3":"When the attacker makes 10 strokes in a row",
      "quiz.medium.1.exp":"The expedite system is introduced after 10 minutes of play in a set, provided neither player has reached 9 points. Either player may request it at any time.",
      "quiz.medium.2.q":"What happens if the ball touches the side edge of the table?",
      "quiz.medium.2.o0":"It is a let",
      "quiz.medium.2.o1":"Point to the player who hit the ball",
      "quiz.medium.2.o2":"Point to the opponent",
      "quiz.medium.2.o3":"The point is replayed",
      "quiz.medium.2.exp":"The side edge is not valid. If the ball touches the side edge, the point goes to the opponent.",
      "quiz.medium.3.q":"Can the ball touch the top edge of the table (edge ball) and still be good?",
      "quiz.medium.3.o0":"Yes, it is a valid point",
      "quiz.medium.3.o1":"No, it is a fault",
      "quiz.medium.3.o2":"Only on service",
      "quiz.medium.3.o3":"Only if it falls inward",
      "quiz.medium.3.exp":"If the ball touches the top edge of the table (edge — part of the playing surface), it is a valid point.",
      "quiz.medium.4.q":"What is the official weight of an ITTF ball?",
      "quiz.medium.4.o0":"2.0 g",
      "quiz.medium.4.o1":"2.3 g",
      "quiz.medium.4.o2":"2.7 g",
      "quiz.medium.4.o3":"3.0 g",
      "quiz.medium.4.exp":"The official ITTF ball weighs 2.7 grams.",
      "quiz.medium.5.q":"During service, how must the free hand be positioned when tossing the ball?",
      "quiz.medium.5.o0":"Open and flat, above table level",
      "quiz.medium.5.o1":"Closed in a fist",
      "quiz.medium.5.o2":"Pointing toward the opponent",
      "quiz.medium.5.o3":"Below table level",
      "quiz.medium.5.exp":"The ball must rest on the open, stationary palm of the free hand, above table level, before being tossed for service.",
      "quiz.medium.6.q":"Can the ball touch the top of the net during a rally (not on service)?",
      "quiz.medium.6.o0":"Yes, if it falls on the other side it is valid",
      "quiz.medium.6.o1":"No, it is always a fault",
      "quiz.medium.6.o2":"Only if the ball does not stop on the net",
      "quiz.medium.6.o3":"It is always a let",
      "quiz.medium.6.exp":"During a rally, if the ball clips the top of the net and falls correctly on the other side, the point is valid (not a let — lets only apply to service).",
      "quiz.medium.7.q":"If a player deliberately interrupts play without a valid reason, what happens?",
      "quiz.medium.7.o0":"The set is cancelled",
      "quiz.medium.7.o1":"The umpire gives a verbal warning",
      "quiz.medium.7.o2":"The point in dispute is awarded to the opponent",
      "quiz.medium.7.o3":"The player is disqualified",
      "quiz.medium.7.exp":"Deliberate interruption of play is considered misconduct. The umpire may award the point to the opponent as a penalty.",
      "quiz.medium.8.q":"In singles, must the server bounce the ball on their own side before it goes to the opponent's side?",
      "quiz.medium.8.o0":"Yes, it is mandatory",
      "quiz.medium.8.o1":"No, the ball goes directly to the opponent's side",
      "quiz.medium.8.o2":"Only on the first service of each game",
      "quiz.medium.8.o3":"Depends on the game mode",
      "quiz.medium.8.exp":"In singles, the ball goes directly from the racket to the opponent's half without touching the server's side. It is in doubles where the service must be diagonal.",
      "quiz.medium.9.q":"What is a 'good return'?",
      "quiz.medium.9.o0":"A ball that always touches the net",
      "quiz.medium.9.o1":"A ball that bounces on the server's table",
      "quiz.medium.9.o2":"A ball that lands outside the table",
      "quiz.medium.9.o3":"A ball that passes the net and falls inside the opponent's table or on the edge",
      "quiz.medium.9.exp":"A good return is one where the ball (after being struck) passes over or around the net and lands in the opponent's playing area or on the top edge.",
      "quiz.medium.10.q":"Can a player hit the ball before it bounces on their half of the table (volley)?",
      "quiz.medium.10.o0":"Yes, if the ball is going off the table",
      "quiz.medium.10.o1":"No, point to the opponent",
      "quiz.medium.10.o2":"Only on the last point of the set",
      "quiz.medium.10.o3":"Only if the ball touches the net first",
      "quiz.medium.10.exp":"Hitting the ball before it bounces on your side (volley) is prohibited. The point is lost, even if the ball was going out.",
      "quiz.medium.11.q":"What happens if the server tosses the ball and decides not to hit it?",
      "quiz.medium.11.o0":"It is automatically a let",
      "quiz.medium.11.o1":"It is a fault and the point goes to the opponent",
      "quiz.medium.11.o2":"They may catch the ball and retry",
      "quiz.medium.11.o3":"The umpire gives a verbal warning",
      "quiz.medium.11.exp":"If the server tosses the ball for service and fails to strike it, it is a fault — the point goes to the opponent.",
      "quiz.medium.12.q":"If the ball in play touches a foreign object (player's clothing, etc.), what happens?",
      "quiz.medium.12.o0":"Point to the opponent",
      "quiz.medium.12.o1":"It is a let",
      "quiz.medium.12.o2":"The point is replayed",
      "quiz.medium.12.o3":"Depends on the umpire",
      "quiz.medium.12.exp":"If the ball in play touches anything other than the net, its supports or the table, the point goes to the opponent.",
      "quiz.medium.13.q":"What is the minimum ceiling height above the table in ITTF competitions?",
      "quiz.medium.13.o0":"3 m",
      "quiz.medium.13.o1":"4 m",
      "quiz.medium.13.o2":"5 m",
      "quiz.medium.13.o3":"6 m",
      "quiz.medium.13.exp":"The ITTF recommends at least 5 metres of free space above the table for international competitions.",
      "quiz.medium.14.q":"In doubles, after each set, how does the service order change?",
      "quiz.medium.14.o0":"It stays the same",
      "quiz.medium.14.o1":"The last receiver becomes the server",
      "quiz.medium.14.o2":"The server's partner becomes the next server",
      "quiz.medium.14.o3":"Free choice of players",
      "quiz.medium.14.exp":"In doubles, the pair that received in the previous set will now serve, and the player who served last will now receive.",
      "quiz.hard.0.q":"According to ITTF regulations, what are the mandatory colours of the rubber coverings on a racket?",
      "quiz.hard.0.o0":"One side red, the other side black",
      "quiz.hard.0.o1":"Any colour, as long as they are different",
      "quiz.hard.0.o2":"Blue and red",
      "quiz.hard.0.o3":"Green and black",
      "quiz.hard.0.exp":"ITTF regulations require that the two sides of the racket must be one red and one black, so the opponent can distinguish the rubbers.",
      "quiz.hard.1.q":"What is the maximum thickness of the covering (rubber + sponge) on an ITTF-approved racket?",
      "quiz.hard.1.o0":"3 mm",
      "quiz.hard.1.o1":"3.5 mm",
      "quiz.hard.1.o2":"4 mm",
      "quiz.hard.1.o3":"5 mm",
      "quiz.hard.1.exp":"The total thickness of each side of the covering (rubber plus sponge, if any) must not exceed 4 mm.",
      "quiz.hard.2.q":"What does 'ITTF approved' mean on a ball?",
      "quiz.hard.2.o0":"Ball manufactured in China",
      "quiz.hard.2.o1":"Ball tested and approved by the ITTF for international competitions",
      "quiz.hard.2.o2":"Ball used at the Olympic Games",
      "quiz.hard.2.o3":"38 mm ball (old format)",
      "quiz.hard.2.exp":"'ITTF approved' means the ball has been tested and is on the ITTF approved products list, meeting all size, weight, roundness and colour criteria.",
      "quiz.hard.3.q":"According to the ITTF, can anti-spin (smooth) rubbers be used on a racket?",
      "quiz.hard.3.o0":"Yes, as long as they are ITTF-approved",
      "quiz.hard.3.o1":"No, they are banned in all competitions",
      "quiz.hard.3.o2":"Only in national competitions",
      "quiz.hard.3.o3":"Only on one side",
      "quiz.hard.3.exp":"Anti-spin rubbers (pimple-out or smooth) are allowed as long as they appear on the ITTF approved list. The list of approved rubbers is published and updated regularly.",
      "quiz.hard.4.q":"In an ITTF tournament, if a player breaks their racket during a match, what can they do?",
      "quiz.hard.4.o0":"Continue with any available racket",
      "quiz.hard.4.o1":"They must withdraw from the tournament",
      "quiz.hard.4.o2":"They may replace it with one pre-approved by the umpire",
      "quiz.hard.4.o3":"Request a 5-minute break to replace it",
      "quiz.hard.4.exp":"If the racket becomes unusable, the player may replace it, but the replacement racket must be approved by the umpire.",
      "quiz.hard.5.q":"What is the correct procedure for racket inspection in ITTF competitions?",
      "quiz.hard.5.o0":"Only the chief umpire inspects before the final",
      "quiz.hard.5.o1":"Players show their rackets to the opponent and umpire before the start of the match",
      "quiz.hard.5.o2":"Only if the opponent protests",
      "quiz.hard.5.o3":"Only in world-ranked competitions",
      "quiz.hard.5.exp":"In ITTF competitions, each player must show their racket to the opponent and the umpire before the start of the match (and after, if requested).",
      "quiz.hard.6.q":"Under normal conditions, how often is the ball changed in an ITTF competition match?",
      "quiz.hard.6.o0":"Each set",
      "quiz.hard.6.o1":"Every 3 points",
      "quiz.hard.6.o2":"At the start of each match or when damaged",
      "quiz.hard.6.o3":"Never, only if damaged",
      "quiz.hard.6.exp":"The ball is replaced at the start of each match or when visibly damaged during the match.",
      "quiz.hard.7.q":"What does the ITTF rule say about using substances on the racket ('speed glue')?",
      "quiz.hard.7.o0":"Permitted with prior approval",
      "quiz.hard.7.o1":"Completely banned since 2008",
      "quiz.hard.7.o2":"Permitted only in national competitions",
      "quiz.hard.7.o3":"Requires a medical certificate",
      "quiz.hard.7.exp":"The use of speed glue and adhesives with organic solvents was banned by the ITTF in 2008. Only water-based glues are permitted.",
      "quiz.hard.8.q":"According to ITTF rules, what is a 'bad service' not corrected by the umpire after a warning?",
      "quiz.hard.8.o0":"Immediate point to the opponent",
      "quiz.hard.8.o1":"Second service",
      "quiz.hard.8.o2":"Repeated let",
      "quiz.hard.8.o3":"Disqualification",
      "quiz.hard.8.exp":"After a warning for a bad service, any subsequent illegal service results in a direct point for the opponent, without any further warning.",
      "quiz.hard.9.q":"What is the ITTF rule on time-outs in a match?",
      "quiz.hard.9.o0":"Time-outs are not allowed",
      "quiz.hard.9.o1":"Each team has 2 time-outs per match",
      "quiz.hard.9.o2":"Each player/team is entitled to 1 one-minute time-out per match",
      "quiz.hard.9.o3":"Only the umpire may stop play",
      "quiz.hard.9.exp":"Each player (or team in doubles) is entitled to one one-minute time-out per match (not per set). It may be requested at any time except during service.",
      "quiz.hard.10.q":"What does ITTF regulation say about the coach during a match?",
      "quiz.hard.10.o0":"The coach may give instructions at any time",
      "quiz.hard.10.o1":"The coach may only give instructions during set breaks and time-outs",
      "quiz.hard.10.o2":"The coach may enter the playing area",
      "quiz.hard.10.o3":"There is no regulation on coach behaviour",
      "quiz.hard.10.exp":"The coach may only communicate with the player during set intervals and requested time-outs. No instructions are permitted during play.",
      "quiz.hard.11.q":"What are 'pimples-out' rubbers on a racket?",
      "quiz.hard.11.o0":"Rubber with pimples facing inward",
      "quiz.hard.11.o1":"Completely smooth rubber",
      "quiz.hard.11.o2":"Rubber with pimples facing outward, without a sponge layer behind",
      "quiz.hard.11.o3":"Special defensive rubber",
      "quiz.hard.11.exp":"'Pimples-out' (OX or no sponge) is a rubber with the pimples facing outward. It reduces spin but improves control. It is allowed by the ITTF if approved.",
      "quiz.hard.12.q":"How many minutes of interval are allowed between sets in an ITTF match?",
      "quiz.hard.12.o0":"1 minute",
      "quiz.hard.12.o1":"2 minutes",
      "quiz.hard.12.o2":"3 minutes",
      "quiz.hard.12.o3":"5 minutes",
      "quiz.hard.12.exp":"The interval between sets in an ITTF match lasts a maximum of 1 minute.",
      "quiz.hard.13.q":"What is the 'phantom serve' and what is its regulatory status?",
      "quiz.hard.13.o0":"Invisible serve, permitted",
      "quiz.hard.13.o1":"Serve where the racket contact is not clearly visible, prohibited",
      "quiz.hard.13.o2":"Serve with excessive spin, limited to 3000 RPM",
      "quiz.hard.13.o3":"Serve with ball tossed more than 30 cm, mandatory",
      "quiz.hard.13.exp":"The phantom serve hides the contact of the ball with the racket (with the body or free arm), preventing the opponent from seeing the moment of impact. It is banned under ITTF rules.",
      "quiz.hard.14.q":"In ITTF competitions, what does the rule specify about lighting of the playing area?",
      "quiz.hard.14.o0":"Minimum 200 lux",
      "quiz.hard.14.o1":"Minimum 500 lux",
      "quiz.hard.14.o2":"Minimum 1000 lux at table level, without direct natural light",
      "quiz.hard.14.o3":"No specific requirements",
      "quiz.hard.14.exp":"The ITTF recommends at least 1000 lux uniformly over the table surface, without direct sunlight, for international competitions."
    },
    es: {
      "menu.newGame":"Nueva Partida",
      "menu.newGameSub":"Elegir jugadores y empezar",
      "menu.tournament":"Torneo",
      "menu.tournamentSub":"Cuadro eliminatorio automático",
      "menu.players":"Jugadores",
      "menu.playersSub":"Gestionar y ver estadísticas",
      "menu.history":"Historial",
      "menu.historySub":"Partidas anteriores",
      "menu.data":"Datos",
      "menu.dataSub":"Exportar o importar copia de seguridad",
      "menu.footer":"datos guardados solo en este dispositivo",
      "screen.players":"Jugadores",
      "screen.history":"Historial",
      "screen.gameDetail":"Detalle del Partido",
      "screen.newGame":"Nueva Partida",
      "screen.gameType":"Tipo de Juego",
      "screen.pointsFormat":"Puntos y Formato",
      "screen.newTournament":"Nuevo Torneo",
      "screen.tournament":"Torneo",
      "screen.minigames":"Minijuegos",
      "screen.achievements":"Logros",
      "screen.records":"Récords",
      "screen.data":"Datos",
      "btn.addPlayer":"＋ Nuevo",
      "btn.deletePlayer":"Eliminar",
      "btn.abandon":"Abandonar",
      "btn.continue":"Continuar ▸",
      "btn.startGame":"Iniciar Partido",
      "btn.createTournament":"Crear Torneo",
      "btn.backMenu":"Volver al Menú",
      "btn.start":"Empezar",
      "serve.title":"SAQUE",
      "serve.hint":"saca primero",
      "setup.bluePlayer":"Lado Azul",
      "setup.whitePlayer":"Lado Blanco",
      "setup.pointsPerSet":"Puntos por juego",
      "setup.format":"Formato",
      "mg.tap":"Toques Rápidos",
      "mg.tapSub":"Toca los puntos antes de que desaparezcan",
      "mg.memory":"Memoria Visual",
      "mg.memorySub":"Memoriza y repite la secuencia",
      "ach.unlocked":"🏆 ¡LOGRO DESBLOQUEADO!",
      "data.export":"Exportar copia de seguridad",
      "data.exportSub":"Genera un archivo .json con todo",
      "data.import":"Importar copia de seguridad",
      "data.importSub":"Añadir o fusionar datos de una copia",
      "data.wipe":"Borrar todos los datos",
      "data.wipeSub":"Elimina jugadores e historial de esta tableta",
      "js.choosePlayer":"Elegir jugador",
      "js.sideBlue":"Azul",
      "js.sideWhite":"Blanco",
      "js.continue":"Continuar de todas formas ▸",
      "js.nextSet":"Siguiente Juego ▸",
      "js.undoMsg":"Último punto anulado — puedes continuar el juego.",
      "js.setInProgress":"El juego en curso (%b-%w) no se contará. Los juegos cerrados quedan en el historial.",
      "js.confirmEnd":"El resultado actual se guardará en el historial.",
      "js.confirmWipe":"¿Borrar todos los datos?",
      "js.confirmAbandon":"¿Abandonar el torneo?",
      "js.emptyPlayers":"Crea jugadores primero.",
      "js.noData":"Sin datos aún",
      "js.wins":"victorias",
      "js.losses":"derrotas",
      "js.draws":"empates",
      "js.capotes":"capotes",
      "js.winRate":"V%",
      "js.elo":"Ranking",
      "js.allPlayers":"Todos los jugadores",
      "js.serve":"Saca",
      "js.notServe":"No saca",
      "js.set":"Juego",
      "js.bestOf":"Al mejor de",
      "js.free":"Libre",
      "js.classic":"Clásico",
      "js.custom":"Personalizado",
      "js.gameWon":"%n ganó el partido",
      "js.setWon":"%n ganó el juego",
      "js.deuce":"IGUALES",
      "js.matchPoint":"BOLA DE PARTIDO",
      "js.capoteTag":"Capote",
      "js.newRecord":"🏆 ¡Nuevo récord!",
      "js.points":"Puntos",
      "js.level":"Nivel",
      "js.levelReached":"Nivel alcanzado",
      "js.playAgain":"Jugar de nuevo",
      "js.tbd":"Por definir",
      "js.play":"▶ JUGAR",
      "js.whoseServe":"Juego %n · ¿quién saca primero?",
      "js.champion":"🏆 Campeón del Torneo",
      "js.winsLabel":"V",
      "js.lossesLabel":"D",
      "js.drawsLabel":"E",
      "js.capotesLabel":"Cap.",
      "js.winRateLabel":"V%",
      "js.eloLabel":"Ranking",
      "js.bestRival":"Mejor rival",
      "js.worstRival":"Peor rival",
      "js.last10":"Últimos 10 partidos",
      "js.streak":"Racha actual",
      "js.setsWon":"Juegos ganados",
      "js.setsLost":"Juegos perdidos",
      "js.capotesMade":"Capotes realizados",
      "js.capotesSuffered":"Capotes encajados",
      "js.tournamentsWon":"Torneos ganados",
      "js.tournamentsPlayed":"Torneos jugados",
      "js.trainingMin":"min. de entrenamiento",
      "js.trainingSessions":"sesiones",
      "js.importReplace":"Reemplazar todo",
      "js.importMerge":"Añadir a los datos actuales",
      "js.importDetailFile":"El archivo tiene %p jugadores y %g partidas.",
      "js.importDetailMerge":"<strong>Añadir</strong> trae %np jugadores y %ng partidas nuevos (nombres iguales se unen; repetidos se ignoran).",
      "js.importDetailReplace":"<strong>Reemplazar todo</strong> elimina los %p jugadores y %g partidas actuales y deja solo el archivo.",
      "js.recElo":"Mayor Ranking",
      "js.recStreak":"Mayor Racha",
      "js.recWins":"Más Victorias",
      "js.recCapotes":"Más Capotes",
      "js.recTournaments":"Más Torneos Ganados",
      "js.recPoints":"Más Puntos Marcados",
      "js.recDuration":"Partido Más Largo",
      "js.recMgTap":"Récord Toques Rápidos",
      "js.recMgMemory":"Récord Memoria",
      "js.recEloGain":"Mayor Subida de Ranking",
      "js.wins_unit":"victorias",
      "js.min_unit":"min",
      "js.pts_unit":"pts",
      "js.roundQF":"Cuartos de final",
      "js.roundSF":"Semifinales",
      "js.roundF":"Final",
      "js.serveEvery2":"Saque cada 2 puntos",
      "js.serveEvery5":"Saque cada 5 puntos",
      "js.serveEvery1":"Saque cada 1 punto (iguales)",
      "js.eraseConfirm":"¿Seguro? Esta acción no se puede deshacer.",
      "js.missedGame":"Error — anular último punto",
      "js.gameInProgress":"Tienes una partida en curso",
      "js.tournamentInProgress":"Tienes un torneo en curso",
      "js.resumeGame":"Continuar partida ▸",
      "js.resumeTournament":"Continuar torneo ▸",
      "js.endOfSet":"FIN DEL JUEGO",
      "js.endOfSetCapote":"FIN DEL JUEGO · CAPOTE",
      "js.endOfSetDeciding":"FIN DEL JUEGO · PARTIDO DECIDIDO",
      "js.endOfSetCapoteDeciding":"FIN DEL JUEGO · CAPOTE · PARTIDO DECIDIDO",
      "js.endOfGame":"FIN DEL PARTIDO",
      "js.endOfGameCapote":"FIN DEL PARTIDO · CAPOTE",
      "js.drawBetween":"Empate entre",
      "js.chooseBlue":"Elegir — Lado Azul",
      "js.chooseWhite":"Elegir — Lado Blanco",
      "js.noPlayersYet":"Todavía no hay jugadores.<br>Vuelve al menú y crea jugadores primero.",
      "js.trainingTitle":"Modo Entrenamiento",
      "js.trainingFree":"Cronómetro libre",
      "js.trainingTimed":"Entrenamiento con tiempo",
      "js.trainingModeFree":"MODO LIBRE",
      "js.trainingModeTimed":"ENTRENAMIENTO %n MIN",
      "js.mgMemorize":"¡Memoriza!",
      "js.mgYourTurn":"¡Tu turno!",
      "js.mgPoints":"Puntos:",
      "js.mgLevel":"Nivel",
      "js.mgLevelReached":"Nivel alcanzado:",
      "js.mgRecord":"rec:",
      "js.mgMemoryTitle":"Memoria Visual",
      "js.achSecret":"¡Logro secreto desbloqueado!",
      "js.achSecretDesc":"Logro secreto. Sigue jugando para descubrirlo.",
      "js.cancel":"Cancelar",
      "js.save":"Guardar",
      "js.undo":"Anular último punto",
      "js.pause":"Pausar cronómetro",
      "js.modeCustom":"Personalizado",
      "js.modeClassic":"Clásico",
      "js.modeClassicDesc":"11 puntos por juego · BO3, BO5 o BO7",
      "js.formatFree":"Libre",
      "js.formatBo3":"Al mejor de 3",
      "js.formatBo5":"Al mejor de 5",
      "js.formatBo7":"Al mejor de 7",
      "js.setBalanced":"Juego muy equilibrado",
      "js.descPlaceholder":"Ej.: torneo de verano, sala de juegos...",
      "js.shortcutTraining":"Modo Entrenamiento",
      "js.shortcutMinigames":"Minijuegos",
      "js.shortcutAchievements":"Logros",
      "js.shortcutRecords":"Récords",
      "js.setLabel":"JUEGO",
      "js.noHistory":"Aún no hay partidas en el historial.",
      "js.catFirstSteps":"Primeros Pasos",
      "js.catWins":"Victorias",
      "js.catSets":"Juegos",
      "js.catComebacks":"Remontadas",
      "js.catElo":"Ranking",
      "js.catPoints":"Puntos",
      "js.catTournaments":"Torneos",
      "js.catRivalries":"Rivalidades",
      "js.catTraining":"Entrenamiento",
      "js.catMinigames":"Minijuegos",
      "js.catSpecials":"Especiales",
      "js.noDataYet":"Sin datos todavía",
      "js.bracketTbd":"Por definir",
      "js.noPlayersEmpty":"Aún no tienes jugadores.<br>Toca '＋ Nuevo' para añadir el primero.",
      "js.leaderboard":"Leaderboard · Top %n",
      "js.playerCol":"Jugador",
      "js.gamesUnit":"%n partidas",
      "js.noGamesProfile":"Sin partidas registradas aún.",
      "js.resultDraw":"Empató",
      "js.resultWon":"Ganó",
      "js.resultLost":"Perdió",
      "js.gamesDisputed":"%n partida(s)",
      "js.headToHead":"Cara a cara",
      "js.recentGames":"Últimas partidas",
      "js.scorerColor":"Color en el marcador",
      "js.eloLabel2":"ELO (diversión)",
      "js.statGamesPlayed":"Partidas jugadas",
      "js.statGamesWon":"Partidas ganadas",
      "js.statGamesLost":"Partidas perdidas",
      "js.statGamesDrawn":"Partidas empatadas",
      "js.statSetsWonV":"Sets ganados (victorias)",
      "js.statSetsLostD":"Sets perdidos (derrotas)",
      "js.statTotalSetsWon":"Total sets ganados",
      "js.statTotalSetsLost":"Total sets perdidos",
      "js.statCapotesMade":"Capotes hechos",
      "js.statCapotesSuffered":"Capotes sufridos",
      "js.statTournamentsWon":"Torneos ganados",
      "js.statTournamentsTotal":"Torneos totales",
      "js.bestRivalAgainst":"Más victorias contra (%n)",
      "js.worstRivalAgainst":"Más derrotas contra (%n)",
      "js.noHistoryYet":"No hay partidas en el historial.<br>Juega la primera para verla aquí.",
      "js.draw":"EMPATE",
      "js.setsSep":"SETS",
      "js.xCapote":"%nx Capote",
      "js.modeFree":"LIBRE",
      "js.modeMd3":"MD3",
      "js.modeMd5":"MD5",
      "js.modeMd7":"MD7",
      "js.gameEndedDraw":"La partida terminó en empate",
      "js.setsWonBy":"Sets (%n ganó la partida)",
      "js.ptsPerSet":"puntos por set",
      "js.duration":"duración",
      "js.setRecap":"Set %n",
      "js.undoToast":"Último punto anulado — puedes continuar el set.",
      "js.statsSaved":"Jugadores guardados",
      "js.gamesInHistory":"Partidas en el historial",
      "js.exportedToast":"Copia exportada: %f",
      "js.importedToast":"Importados: %p jugadores, %g partidas",
      "js.invalidFile":"Archivo inválido o corrupto.",
      "js.cantReadFile":"No se pudo leer el archivo.",
      "js.invalidFormat":"Archivo inválido: formato inesperado.",
      "js.invalidBackup":"Archivo inválido: no es una copia de PLACAR.",
      "js.replacedToast":"Datos reemplazados correctamente.",
      "js.wipedToast":"Todos los datos han sido borrados.",
      "js.createPlayersFirst":"Crea jugadores primero.",
      "js.roundLabel":"Ronda %n",
      "js.tournamentWinnerSub":"%m partidas · %p jugadores",
      "js.choosePlayerFirst":"Elige un jugador primero",
      "js.recMgMemory2":"Récord Memoria Visual",
      "js.recMorePoints":"Más Puntos Acumulados",
      "js.recMoreTraining":"Más Tiempo de Entrenamiento",
      "js.levelPrefix":"nivel ",
      "js.winsUnit":" victorias",
      "js.capotesUnit":" capotes",
      "js.tournamentsUnit":" torneos",
      "js.pointsUnit":" puntos",
      "js.minUnit":" min",
      "js.achProgressText":"%d / %t logros",
      "js.setup.pts11":"11 puntos",
      "js.setup.pts21":"21 puntos",
      "js.overlay.endGameTitle":"TERMINAR PARTIDA",
      "js.overlay.confirmEnd":"¿Confirmar fin de partida?",
      "js.overlay.confirmEndBtn":"Terminar",
      "js.data.backup":"Copia de seguridad",
      "js.data.wipeAll":"Borrar todo",
      "js.mg.playAs":"Jugar como",
      "js.tournament.size":"Tamaño",
      "js.tournament.mode":"Modo",
      "js.mode.customDesc":"11 o 21 puntos · libre, MD3 o MD5 · saque alterna cada 5 puntos",
      "mg.quiz":"Quiz de Reglas",
      "mg.quizSub":"Pon a prueba tu conocimiento de las reglas ITTF",
      "mg.rules":"Reglas ITTF",
      "mg.rulesSub":"Todas las reglas oficiales del tenis de mesa",
      "js.mgQuizScore":"Puntos:",
      "js.mgQuizIntro":"Elige el nivel de dificultad",
      "js.mgQuizEasy":"Fácil",
      "js.mgQuizEasyDesc":"Reglas básicas del juego",
      "js.mgQuizMedium":"Medio",
      "js.mgQuizMediumDesc":"Reglas de saque y puntuación",
      "js.mgQuizHard":"Difícil",
      "js.mgQuizHardDesc":"Reglamento y torneos",
      "js.mgQuizBestScore":"Mejor puntuación:",
      "js.mgQuizNext":"Siguiente ▸",
      "js.mgQuizFinalScore":"Puntuación final:",
      "js.mgQuizCorrect":"¡Correcto! ✓",
      "js.mgQuizWrong":"Incorrecto ✗",
      "js.mgQuizChooseFirst":"Elige un jugador primero",
      "js.mgQuizResultGreat":"¡Excelente! ¡Conoces muy bien las reglas!",
      "js.mgQuizResultGood":"¡Buen trabajo! Sigue estudiando las reglas.",
      "js.mgQuizResultTry":"Sigue practicando y leyendo las reglas ITTF.",
      "js.langBtn":"Idioma",
      "js.settingsBtn":"Ajustes",
      "js.descLabel":"Descripción",
      "js.optional":"(opcional)",
      "js.nPlayers4":"4 jugadores",
      "js.nPlayers8":"8 jugadores",
      "js.nPlayers16":"16 jugadores",
      "js.trainingDuration":"Duración (minutos)",
      "js.back":"‹ Volver",
      "js.gameEndedTitle":"PARTIDO TERMINADO",
      "js.backToMenu":"Volver al Menú",
      "js.newPlayerTitle":"NUEVO JUGADOR",
      "js.newPlayerName":"Nombre del jugador",
      "js.playerNamePlaceholder":"Ej.: Miguel",
      "js.colorPickerLabel":"Color en el marcador",
      "js.color.blueWhite":"Azul / Blanco",
      "js.color.greenWhite":"Verde / Blanco",
      "js.color.redWhite":"Rojo / Blanco",
      "js.color.pinkWhite":"Rosa / Blanco",
      "js.color.purpleWhite":"Morado / Blanco",
      "js.color.goldWhite":"Dorado / Blanco",
      "js.color.whiteBlack":"Blanco / Negro",
      "js.color.orangeWhite":"Naranja / Blanco",
      "js.dataExplain":"Guarda jugadores e historial en un archivo que puedes conservar en la nube (Drive, email, etc.) para recuperar todo en esta tableta u otra.",
      "js.importTitle":"IMPORTAR DATOS",
      "js.importQuestion":"¿Qué quieres hacer?",
      "js.importDetail":"Esto sustituirá los jugadores e historial ya guardados en esta tableta.",
      "js.mergeImport":"Añadir a los datos actuales",
      "js.replaceImport":"Reemplazar todo",
      "js.wipeTitle":"BORRAR TODO",
      "js.wipeQuestion":"¿Borrar todos los datos?",
      "js.wipeDetail":"Esta acción no se puede deshacer. Considera exportar una copia de seguridad primero.",
      "js.wipeConfirm":"Borrar todo",
      "js.rotateHint":"Gira la tableta a horizontal",
      "js.overlay.confirmEndDetail":"El resultado actual se guardará en el historial.",
      "ach.first_point.name":"Primer Punto",
      "ach.first_point.desc":"Marca tu primer punto.",
      "ach.first_set.name":"Primer Set",
      "ach.first_set.desc":"Gana tu primer set.",
      "ach.first_win.name":"Primera Victoria",
      "ach.first_win.desc":"Gana tu primer juego.",
      "ach.first_tournament.name":"Primer Torneo",
      "ach.first_tournament.desc":"Participa en tu primer torneo.",
      "ach.first_trophy.name":"Primer Trofeo",
      "ach.first_trophy.desc":"Gana tu primer torneo.",
      "ach.wins_10.name":"10 Victorias",
      "ach.wins_10.desc":"Gana 10 juegos.",
      "ach.wins_50.name":"50 Victorias",
      "ach.wins_50.desc":"Gana 50 juegos.",
      "ach.wins_100.name":"100 Victorias",
      "ach.wins_100.desc":"Gana 100 juegos.",
      "ach.wins_200.name":"200 Victorias",
      "ach.wins_200.desc":"Gana 200 juegos.",
      "ach.streak_3.name":"Hat-trick",
      "ach.streak_3.desc":"3 victorias consecutivas.",
      "ach.streak_5.name":"En Forma",
      "ach.streak_5.desc":"5 victorias consecutivas.",
      "ach.streak_10.name":"Imparable",
      "ach.streak_10.desc":"10 victorias consecutivas.",
      "ach.streak_20.name":"Invencible",
      "ach.streak_20.desc":"20 victorias consecutivas.",
      "ach.sweep.name":"Barrida",
      "ach.sweep.desc":"Gana un juego sin perder ningún set.",
      "ach.capote_set.name":"Capote",
      "ach.capote_set.desc":"Gana un set por 11-0.",
      "ach.set_perfect.name":"Set Perfecto",
      "ach.set_perfect.desc":"Gana un set permitiendo como máximo 3 puntos.",
      "ach.deciding_set.name":"Decisión",
      "ach.deciding_set.desc":"Gana un juego decidido en el último set.",
      "ach.comeback.name":"Remontada",
      "ach.comeback.desc":"Gana un juego después de perder el 1.ªer set.",
      "ach.comeback_02.name":"Gran Remontada",
      "ach.comeback_02.desc":"Gana un juego estando 0-2 en sets.",
      "ach.comeback_pts.name":"Nunca Te Rindas",
      "ach.comeback_pts.desc":"Gana un set estando perdiendo por 5+ puntos.",
      "ach.elo_1000.name":"Cuatro Dígitos",
      "ach.elo_1000.desc":"Alcanza 1000 de ELO.",
      "ach.elo_1200.name":"Club 1200",
      "ach.elo_1200.desc":"Alcanza 1200 de ELO.",
      "ach.elo_1300.name":"Élite",
      "ach.elo_1300.desc":"Alcanza 1300 de ELO.",
      "ach.elo_1500.name":"Maestro",
      "ach.elo_1500.desc":"Alcanza 1500 de ELO.",
      "ach.pts_100.name":"Centenario",
      "ach.pts_100.desc":"Acumula 100 puntos.",
      "ach.pts_500.name":"500 Puntos",
      "ach.pts_500.desc":"Acumula 500 puntos.",
      "ach.pts_1000.name":"1000 Puntos",
      "ach.pts_1000.desc":"Acumula 1000 puntos.",
      "ach.tour_2.name":"Bicampeón",
      "ach.tour_2.desc":"Gana 2 torneos.",
      "ach.tour_3.name":"Tricampeón",
      "ach.tour_3.desc":"Gana 3 torneos.",
      "ach.rival_10.name":"Clásico",
      "ach.rival_10.desc":"Juega 10 partidos contra el mismo adversario.",
      "ach.rival_25.name":"Rivalidad",
      "ach.rival_25.desc":"Juega 25 partidos contra el mismo adversario.",
      "ach.rival_dom.name":"Dominio",
      "ach.rival_dom.desc":"10 victorias de ventaja sobre el mismo adversario.",
      "ach.rival_5.name":"Verdugo",
      "ach.rival_5.desc":"5 victorias consecutivas contra el mismo adversario.",
      "ach.train_first.name":"Primer Entrenamiento",
      "ach.train_first.desc":"Completa una sesión de entrenamiento.",
      "ach.train_10m.name":"10 Minutos",
      "ach.train_10m.desc":"Acumula 10 minutos de entrenamiento.",
      "ach.train_1h.name":"1 Hora",
      "ach.train_1h.desc":"Acumula 60 minutos de entrenamiento.",
      "ach.train_5sess.name":"Disciplina",
      "ach.train_5sess.desc":"Completa 5 sesiones de entrenamiento.",
      "ach.mg_tap_10.name":"Reflejos de Acero",
      "ach.mg_tap_10.desc":"Haz 10 puntos en Toques Rápidos.",
      "ach.mg_tap_30.name":"Rayo",
      "ach.mg_tap_30.desc":"Haz 30 puntos en Toques Rápidos.",
      "ach.mg_mem_5.name":"Memoria Sólida",
      "ach.mg_mem_5.desc":"Llega al nivel 5 en Memoria Visual.",
      "ach.mg_mem_10.name":"Memoria de Hierro",
      "ach.mg_mem_10.desc":"Llega al nivel 10 en Memoria Visual.",
      "ach.secret_11_0.name":"Humillación",
      "ach.secret_11_0.desc":"Gana un set por 11-0.",
      "ach.secret_3_2.name":"Al Límite",
      "ach.secret_3_2.desc":"Gana un juego decidido en el 5.º set.",
      "ach.secret_11_9.name":"Punto a Punto",
      "ach.secret_11_9.desc":"Gana un set por 11-9.",
      "ach.secret_midnight.name":"Sesión Nocturna",
      "ach.secret_midnight.desc":"Juega después de medianoche.",
      "ach.secret_morning.name":"Madrugador",
      "ach.secret_morning.desc":"Juega antes de las 08:00.",
      "ach.secret_10day.name":"Máquina",
      "ach.secret_10day.desc":"Juega 10 partidos en el mismo día.",
      "rules.jogo.title":"El Juego — Reglas Generales",
      "rules.jogo.r0":"Un set lo gana el primer jugador en alcanzar 11 puntos, con una ventaja mínima de 2 puntos sobre el adversario.",
      "rules.jogo.r1":"Un partido lo gana el jugador que gane más sets en el formato definido (al mejor de 3, 5 o 7).",
      "rules.jogo.r2":"El jugador que anota un punto saca a continuación (o mantiene el saque según la rotación).",
      "rules.jogo.r3":"Si la pelota en juego toca cualquier parte del cuerpo del jugador excepto la mano de la raqueta, se pierde el punto.",
      "rules.jogo.r4":"La mano libre (que no sujeta la raqueta) NO puede tocar la superficie de juego durante un rally — punto para el adversario.",
      "rules.jogo.r5":"Si la pelota toca el borde superior de la mesa (edge), el punto es válido.",
      "rules.jogo.r6":"Si la pelota toca el lado lateral de la mesa, el punto es del adversario — no es área de juego.",
      "rules.jogo.r7":"Un jugador no puede golpear la pelota antes de que bote en su mitad de la mesa (no hay volea).",
      "rules.jogo.r8":"El juego puede interrumpirse por lesión verificable, fallo de equipo u otro motivo aceptado por el árbitro.",
      "rules.jogo.r9":"Tras 10 minutos de juego en un set (sin que ningún jugador alcance 9 puntos), entra en vigor el 'expedite system': el punto lo gana el receptor si el sacador no gana en 13 golpes.",
      "rules.servico.title":"Saque",
      "rules.servico.r0":"Al sacar, la pelota debe colocarse en la palma abierta e inmóvil de la mano libre, por encima del nivel de la mesa.",
      "rules.servico.r1":"La pelota debe lanzarse casi verticalmente hacia arriba, al menos 16 cm, sin rotación.",
      "rules.servico.r2":"El sacador debe golpear la pelota cuando baja, de modo que toque primero su propio lado de la mesa y luego el del adversario.",
      "rules.servico.r3":"En individuales, la pelota puede caer en cualquier parte de la mitad del adversario.",
      "rules.servico.r4":"En dobles, el saque debe ser en diagonal: desde la mitad derecha del sacador hacia la mitad derecha del receptor.",
      "rules.servico.r5":"El contacto de la pelota con la raqueta debe ser visible para el adversario y el árbitro — no puede ocultarse con el cuerpo.",
      "rules.servico.r6":"Si la pelota toca la red en el saque y cae válida, es 'let' — el saque se repite.",
      "rules.servico.r7":"Tras un aviso, cualquier saque incorrecto resulta en punto inmediato para el adversario.",
      "rules.servico.r8":"Si el sacador lanza la pelota para sacar y no la golpea, pierde el punto.",
      "rules.servico.r9":"Al sacar, el brazo libre debe estar por encima del nivel de la mesa y visible para el árbitro y el adversario.",
      "rules.pontuacao.title":"Puntuación y Cambio de Saque",
      "rules.pontuacao.r0":"El saque cambia cada 2 puntos disputados, alternando entre los jugadores.",
      "rules.pontuacao.r1":"En caso de deuce (10-10), el saque cambia cada punto y se necesita una ventaja de 2 puntos para ganar el set.",
      "rules.pontuacao.r2":"En dobles, el orden de saque y recepción debe mantenerse hasta el final del set; en el siguiente set, la pareja que recibió pasa a sacar.",
      "rules.pontuacao.r3":"El primero en sacar en un partido se determina mediante sorteo (cara o cruz, o elección de lado).",
      "rules.pontuacao.r4":"Al inicio de cada set, los jugadores cambian de lado; en el set decisivo (último), cambian cuando un jugador alcanza 5 puntos.",
      "rules.pontuacao.r5":"En un set decisivo en dobles, la pareja receptora puede modificar su orden de recepción.",
      "rules.pontuacao.r6":"El 'expedite system' no altera la alternancia de saque de 2 en 2 puntos — simplemente pasa a 1 en 1 punto desde su activación.",
      "rules.pontuacao.r7":"Tras un 'let' en el saque, la pareja de saques se repite completamente (el marcador no avanza).",
      "rules.equipamento.title":"Equipamiento — Mesa y Red",
      "rules.equipamento.r0":"La mesa mide 274 cm de largo × 152,5 cm de ancho × 76 cm de alto.",
      "rules.equipamento.r1":"La superficie de juego debe ser plana, uniforme, de color mate (típicamente azul o verde) con una línea blanca de 2 cm en los bordes.",
      "rules.equipamento.r2":"La red divide la mesa por la mitad; tiene 15,25 cm de altura a lo largo de toda su extensión.",
      "rules.equipamento.r3":"La superficie de juego no incluye las superficies laterales (bordes laterales) de la mesa.",
      "rules.equipamento.r4":"La mesa debe ser de madera o material similar, con un rebote de 23 ± 1 cm al soltar una pelota estándar desde 30 cm de altura.",
      "rules.equipamento.r5":"La línea central (2 mm de ancho) divide la mesa en dos mitades iguales y forma parte de cada mitad derecha para el saque en dobles.",
      "rules.bola.title":"Equipamiento — Pelota",
      "rules.bola.r0":"La pelota debe tener 40 mm de diámetro (± 0,5 mm) y pesar 2,7 g (± 0,1 g).",
      "rules.bola.r1":"La pelota debe ser esférica con una desviación máxima de 0,35 mm.",
      "rules.bola.r2":"El color de la pelota debe ser blanco o naranja, mate.",
      "rules.bola.r3":"Desde 2015, las pelotas de competición ITTF son de plástico (poly), sustituyendo las de celuloide.",
      "rules.bola.r4":"Solo las pelotas aprobadas por la ITTF pueden usarse en competiciones internacionales.",
      "rules.raquete.title":"Equipamiento — Raqueta",
      "rules.raquete.r0":"La raqueta puede tener cualquier dimensión, forma y peso, pero la pala debe ser plana y rígida.",
      "rules.raquete.r1":"Al menos el 85% del grosor de la pala debe ser de madera natural.",
      "rules.raquete.r2":"Los dos lados de la raqueta deben tener colores diferentes: obligatoriamente un lado rojo y otro negro.",
      "rules.raquete.r3":"El revestimiento (goma) debe estar aprobado por la ITTF; la lista se actualiza regularmente.",
      "rules.raquete.r4":"El grosor total de cada lado del revestimiento (goma + esponja) no puede superar 4 mm.",
      "rules.raquete.r5":"Se pueden usar revestimientos pimples-in, pimples-out o anti-spin, siempre que estén aprobados por la ITTF.",
      "rules.raquete.r6":"Antes del partido, cada jugador debe mostrar la raqueta al adversario y al árbitro para inspección.",
      "rules.raquete.r7":"El uso de cola rápida (speed glue) con disolventes orgánicos está prohibido desde 2008 — solo se permiten adhesivos al agua.",
      "rules.raquete.r8":"Si la raqueta se daña durante el juego, puede sustituirse con la aprobación del árbitro.",
      "rules.conduta.title":"Conducta y Fair Play",
      "rules.conduta.r0":"Cada jugador tiene derecho a 1 tiempo muerto de 1 minuto por partido (no por set), solicitado en cualquier momento excepto durante el saque.",
      "rules.conduta.r1":"El intervalo máximo entre sets es de 1 minuto.",
      "rules.conduta.r2":"El entrenador solo puede dar instrucciones durante los intervalos entre sets y los tiempos muertos — nunca durante el juego.",
      "rules.conduta.r3":"Los comportamientos antideportivos (insultos, dañar equipamiento, interrupciones deliberadas) se sancionan con advertencia y/o punto al adversario.",
      "rules.conduta.r4":"En caso de conducta reiterada, el árbitro puede excluir al jugador del partido o de la competición.",
      "rules.conduta.r5":"Los jugadores deben respetar las decisiones del árbitro; las protestas deben hacerse educadamente y solo por el jugador, nunca por el entrenador durante el juego.",
      "rules.conduta.r6":"Está prohibido recibir instrucciones por cualquier medio electrónico durante el juego.",
      "rules.torneio.title":"Reglas de Torneo",
      "rules.torneio.r0":"En un torneo eliminatorio (knockout), el perdedor queda inmediatamente eliminado.",
      "rules.torneio.r1":"El sistema round-robin (todos contra todos) distribuye puntos: victoria = 2, derrota = 1, incomparecencia = 0.",
      "rules.torneio.r2":"En caso de empate en puntos en el round-robin, el desempate se hace por sets y luego por puntos dentro de los sets.",
      "rules.torneio.r3":"El seeding (cabezas de serie) se basa en el ranking ITTF o en la clasificación del torneo anterior.",
      "rules.torneio.r4":"Los jugadores deben estar disponibles en el horario indicado; un retraso de más de 10 minutos puede suponer derrota por incomparecencia.",
      "rules.torneio.r5":"Las raquetas se inspeccionan antes de cada partido y pueden verificarse de nuevo tras el partido.",
      "rules.torneio.r6":"En dobles, los jugadores deben alternar los golpes: cada jugador solo puede golpear la pelota cuando le corresponde.",
      "rules.torneio.r7":"En los Juegos Olímpicos y Campeonatos del Mundo, se usa el sistema al mejor de 7 sets en la mayoría de las fases.",
      "rules.torneio.r8":"El árbitro tiene máxima autoridad durante el partido; las decisiones del árbitro asistente sobre edge/borde son definitivas.",
      "rules.torneio.r9":"En competiciones internacionales, los jugadores deben llevar ropa de un color diferente al de la pelota (blanca o naranja).",
      "rules.especial.title":"Situaciones Especiales y Curiosidades",
      "rules.especial.r0":"Si la pelota rodea la red (en lugar de pasar por encima) y cae válida, es un punto legítimo.",
      "rules.especial.r1":"Un jugador puede golpear la pelota con cualquier parte de la superficie de la raqueta, incluido el borde.",
      "rules.especial.r2":"Si la pelota toca el soporte de la red y cae al lado del adversario durante un rally (no en el saque), es punto válido.",
      "rules.especial.r3":"Si ambos jugadores tocan la pelota simultáneamente, el punto va al adversario (no existe doble falta — pierde quien toca último incorrectamente).",
      "rules.especial.r4":"Un jugador puede mover la mesa accidentalmente sin intención — normalmente no es falta si la pelota sigue siendo válida; el árbitro decide.",
      "rules.especial.r5":"La ITTF actualiza las reglas periódicamente; la versión vigente puede consultarse en ittf.com.",
      "rules.especial.r6":"El material de la pelota cambió de celuloide a plástico (poly) en 2015, alterando ligeramente el comportamiento del spin.",
      "rules.especial.r7":"El 'saque tomahawk' (saque con rotación lateral intensa) está permitido siempre que el contacto sea visible.",
      "quiz.easy.0.q":"¿Cuántos puntos se necesitan para ganar un set en tenis de mesa (modo estándar)?",
      "quiz.easy.0.o0":"11",
      "quiz.easy.0.o1":"21",
      "quiz.easy.0.o2":"15",
      "quiz.easy.0.o3":"9",
      "quiz.easy.0.exp":"Según la ITTF, un set se gana al alcanzar 11 puntos, con una ventaja mínima de 2 puntos.",
      "quiz.easy.1.q":"¿Cada cuántos puntos cambia el saque durante un partido?",
      "quiz.easy.1.o0":"Cada 2",
      "quiz.easy.1.o1":"Cada 5",
      "quiz.easy.1.o2":"Cada 3",
      "quiz.easy.1.o3":"Cada punto",
      "quiz.easy.1.exp":"El saque cambia cada 2 puntos, excepto en caso de deuce (10-10).",
      "quiz.easy.2.q":"¿Qué es el 'deuce' en el tenis de mesa?",
      "quiz.easy.2.o0":"Victoria por 11-0",
      "quiz.easy.2.o1":"Falta de saque",
      "quiz.easy.2.o2":"Empate a 10 puntos que exige ventaja de 2",
      "quiz.easy.2.o3":"Punto disputado",
      "quiz.easy.2.exp":"El deuce ocurre cuando el marcador llega a 10-10. A partir de ahí, el saque cambia cada punto y se necesita una ventaja de 2 puntos para ganar el set.",
      "quiz.easy.3.q":"¿Cuál es el diámetro oficial de la pelota de tenis de mesa (ITTF)?",
      "quiz.easy.3.o0":"36 mm",
      "quiz.easy.3.o1":"40 mm",
      "quiz.easy.3.o2":"38 mm",
      "quiz.easy.3.o3":"42 mm",
      "quiz.easy.3.exp":"La pelota oficial ITTF tiene 40 mm de diámetro (introducido en 2000, sustituyendo a los 38 mm).",
      "quiz.easy.4.q":"Al sacar, el lanzamiento de la pelota debe tener al menos qué altura?",
      "quiz.easy.4.o0":"10 cm",
      "quiz.easy.4.o1":"15 cm",
      "quiz.easy.4.o2":"16 cm",
      "quiz.easy.4.o3":"20 cm",
      "quiz.easy.4.exp":"La pelota debe lanzarse casi verticalmente hacia arriba, al menos 16 cm, desde la palma abierta.",
      "quiz.easy.5.q":"Cuando un set llega a 10-10, ¿cuántos puntos consecutivos se necesitan para ganar?",
      "quiz.easy.5.o0":"1",
      "quiz.easy.5.o1":"2",
      "quiz.easy.5.o2":"3",
      "quiz.easy.5.o3":"4",
      "quiz.easy.5.exp":"En deuce (10-10) se necesita una ventaja de 2 puntos, es decir, dos puntos consecutivos sobre el adversario.",
      "quiz.easy.6.q":"¿Qué dimensiones tiene una mesa de tenis de mesa?",
      "quiz.easy.6.o0":"274 × 152,5 cm",
      "quiz.easy.6.o1":"260 × 140 cm",
      "quiz.easy.6.o2":"280 × 160 cm",
      "quiz.easy.6.o3":"250 × 130 cm",
      "quiz.easy.6.exp":"La mesa oficial ITTF mide 274 cm de largo × 152,5 cm de ancho, a una altura de 76 cm.",
      "quiz.easy.7.q":"¿A qué altura está la parte superior de la red oficial ITTF?",
      "quiz.easy.7.o0":"14,25 cm",
      "quiz.easy.7.o1":"15,25 cm",
      "quiz.easy.7.o2":"16,25 cm",
      "quiz.easy.7.o3":"13,25 cm",
      "quiz.easy.7.exp":"La red tiene 15,25 cm de altura en el centro y a lo largo de toda su extensión.",
      "quiz.easy.8.q":"¿Cuántos sets tiene normalmente un partido clásico ITTF (competición)?",
      "quiz.easy.8.o0":"3",
      "quiz.easy.8.o1":"5",
      "quiz.easy.8.o2":"7",
      "quiz.easy.8.o3":"9",
      "quiz.easy.8.exp":"La mayoría de las competiciones ITTF usan el formato al mejor de 7 (4 sets para ganar). También se usa al mejor de 5 o 3.",
      "quiz.easy.9.q":"¿Qué ocurre si la pelota toca la red durante el saque?",
      "quiz.easy.9.o0":"Se repite (let)",
      "quiz.easy.9.o1":"Punto para el adversario",
      "quiz.easy.9.o2":"Punto para el sacador",
      "quiz.easy.9.o3":"Segunda oportunidad",
      "quiz.easy.9.exp":"Si la pelota toca la red y cae en el lado correcto de la mesa, es un 'let' y el saque se repite sin penalización.",
      "quiz.easy.10.q":"¿En qué lado de la mesa debe caer la pelota en el saque (individuales)?",
      "quiz.easy.10.o0":"Solo en el lado izquierdo",
      "quiz.easy.10.o1":"En cualquier punto de la mitad del adversario",
      "quiz.easy.10.o2":"Solo en el lado derecho",
      "quiz.easy.10.o3":"En diagonal",
      "quiz.easy.10.exp":"En individuales, la pelota solo debe caer en la mitad de la mesa del adversario, en cualquier punto. No hay restricción diagonal (a diferencia de los dobles).",
      "quiz.easy.11.q":"¿Cuál es el color estándar de la superficie de la mesa ITTF?",
      "quiz.easy.11.o0":"Azul o verde",
      "quiz.easy.11.o1":"Rojo o amarillo",
      "quiz.easy.11.o2":"Blanco",
      "quiz.easy.11.o3":"Negro",
      "quiz.easy.11.exp":"La superficie de la mesa debe ser de color uniforme, mate (no brillante), típicamente azul oscuro o verde.",
      "quiz.easy.12.q":"¿Qué es el 'expedite system' (sistema de aceleración)?",
      "quiz.easy.12.o0":"Forma de acelerar el saque",
      "quiz.easy.12.o1":"Sistema de desempate por sorteo",
      "quiz.easy.12.o2":"Regla que limita un set a 10 minutos",
      "quiz.easy.12.o3":"Sistema de puntuación doble",
      "quiz.easy.12.exp":"Tras 10 minutos de juego en un set, entra en vigor el 'expedite system': el punto lo gana el receptor si el sacador no lo gana en 13 golpes consecutivos.",
      "quiz.easy.13.q":"En dobles, ¿cuál es la regla del saque?",
      "quiz.easy.13.o0":"Cualquier jugador puede sacar a cualquier lado",
      "quiz.easy.13.o1":"La pelota debe ir en diagonal — mitad derecha a mitad derecha",
      "quiz.easy.13.o2":"La pelota debe ir a la mitad izquierda del adversario",
      "quiz.easy.13.o3":"No hay restricciones en dobles",
      "quiz.easy.13.exp":"En dobles, el saque debe hacerse en diagonal: desde la mitad derecha del sacador hacia la mitad derecha del receptor.",
      "quiz.easy.14.q":"¿Puede un jugador apoyar la mano libre en la mesa durante el juego?",
      "quiz.easy.14.o0":"Sí, está permitido",
      "quiz.easy.14.o1":"No, punto para el adversario si toca",
      "quiz.easy.14.o2":"Solo en el lado del propio jugador",
      "quiz.easy.14.o3":"Solo durante el saque",
      "quiz.easy.14.exp":"Si la mano libre (la que no sujeta la raqueta) toca la superficie de juego durante un rally, el punto lo pierde el jugador infractor.",
      "quiz.medium.0.q":"Tras un 'let' en el saque, ¿qué ocurre con ese par de puntos?",
      "quiz.medium.0.o0":"El saque se repite sin cambiar el marcador",
      "quiz.medium.0.o1":"Se pierde uno de los dos puntos del par",
      "quiz.medium.0.o2":"El par de saques se reinicia",
      "quiz.medium.0.o3":"El adversario gana el saque",
      "quiz.medium.0.exp":"Un 'let' anula el saque. El sacador repite exactamente el mismo saque sin alterar ningún marcador ni par de puntos.",
      "quiz.medium.1.q":"¿Cuándo comienza exactamente el 'expedite system'?",
      "quiz.medium.1.o0":"Cuando el marcador llega a 9-9",
      "quiz.medium.1.o1":"Tras 10 minutos de juego en un set, si ningún jugador ha llegado a 9 puntos",
      "quiz.medium.1.o2":"Siempre que un set dura más de 8 minutos",
      "quiz.medium.1.o3":"Cuando el atacante hace 10 golpes seguidos",
      "quiz.medium.1.exp":"El expedite system se activa tras 10 minutos de juego en un set, siempre que ninguno haya alcanzado los 9 puntos. Cualquiera puede pedirlo en cualquier momento.",
      "quiz.medium.2.q":"¿Qué ocurre si la pelota toca el borde lateral de la mesa?",
      "quiz.medium.2.o0":"Es 'let'",
      "quiz.medium.2.o1":"Punto para quien golpeó la pelota",
      "quiz.medium.2.o2":"Punto para el adversario",
      "quiz.medium.2.o3":"Se repite el punto",
      "quiz.medium.2.exp":"El borde lateral no es válido. Si la pelota toca el borde lateral, el punto va al adversario.",
      "quiz.medium.3.q":"¿Puede la pelota tocar el borde superior de la mesa (edge) y ser válida?",
      "quiz.medium.3.o0":"Sí, es punto válido",
      "quiz.medium.3.o1":"No, es falta",
      "quiz.medium.3.o2":"Solo en el saque",
      "quiz.medium.3.o3":"Solo si cae hacia dentro",
      "quiz.medium.3.exp":"Si la pelota toca el borde superior de la mesa (edge — la superficie de juego), es un punto válido.",
      "quiz.medium.4.q":"¿Cuál es el peso oficial de una pelota ITTF?",
      "quiz.medium.4.o0":"2,0 g",
      "quiz.medium.4.o1":"2,3 g",
      "quiz.medium.4.o2":"2,7 g",
      "quiz.medium.4.o3":"3,0 g",
      "quiz.medium.4.exp":"La pelota oficial ITTF pesa 2,7 gramos.",
      "quiz.medium.5.q":"Al sacar, ¿cómo debe estar la palma de la mano libre al lanzar la pelota?",
      "quiz.medium.5.o0":"Abierta y plana, por encima del nivel de la mesa",
      "quiz.medium.5.o1":"Cerrada en puño",
      "quiz.medium.5.o2":"Apuntando al adversario",
      "quiz.medium.5.o3":"Por debajo del nivel de la mesa",
      "quiz.medium.5.exp":"La pelota debe estar en la palma abierta e inmóvil de la mano libre, por encima del nivel de la mesa, antes de ser lanzada para el saque.",
      "quiz.medium.6.q":"¿Puede la pelota tocar la parte superior de la red durante un rally (no en el saque)?",
      "quiz.medium.6.o0":"Sí, si cae al otro lado es punto válido",
      "quiz.medium.6.o1":"No, siempre es falta",
      "quiz.medium.6.o2":"Solo si la pelota no se para en la red",
      "quiz.medium.6.o3":"Siempre es 'let'",
      "quiz.medium.6.exp":"Durante el rally, si la pelota roza la parte superior de la red y cae válida al otro lado, el punto es válido (no es let — el let solo aplica al saque).",
      "quiz.medium.7.q":"Si un jugador interrumpe el juego intencionalmente sin razón válida, ¿qué ocurre?",
      "quiz.medium.7.o0":"El set se anula",
      "quiz.medium.7.o1":"El árbitro da un aviso oral",
      "quiz.medium.7.o2":"El punto en disputa se adjudica al adversario",
      "quiz.medium.7.o3":"El jugador es descalificado",
      "quiz.medium.7.exp":"La interrupción deliberada del juego se considera 'conducta antideportiva'. El árbitro puede adjudicar el punto al adversario como penalización.",
      "quiz.medium.8.q":"En individuales, ¿el sacador debe botar la pelota en su propio lado antes de ir al lado del adversario?",
      "quiz.medium.8.o0":"Sí, es obligatorio",
      "quiz.medium.8.o1":"No, la pelota va directamente al lado del adversario",
      "quiz.medium.8.o2":"Solo en el primer saque de cada partido",
      "quiz.medium.8.o3":"Depende del modo de juego",
      "quiz.medium.8.exp":"En individuales, la pelota va directamente de la raqueta a la mitad del adversario sin tocar el lado del sacador. Es en dobles donde el saque debe ser diagonal.",
      "quiz.medium.9.q":"¿Qué es una 'devolución válida'?",
      "quiz.medium.9.o0":"Pelota que toca siempre la red",
      "quiz.medium.9.o1":"Pelota que bota en la mesa del sacador",
      "quiz.medium.9.o2":"Pelota que cae fuera de la mesa",
      "quiz.medium.9.o3":"Pelota que pasa la red y cae dentro de la mesa del adversario o en el borde",
      "quiz.medium.9.exp":"Una devolución válida es aquella en que la pelota (tras ser golpeada) pasa por encima o alrededor de la red y cae en el área de juego del adversario o en el borde superior.",
      "quiz.medium.10.q":"¿Puede un jugador golpear la pelota antes de que bote en su mitad de la mesa (volea)?",
      "quiz.medium.10.o0":"Sí, si la pelota va a salir de la mesa",
      "quiz.medium.10.o1":"No, punto para el adversario",
      "quiz.medium.10.o2":"Solo en el último punto del set",
      "quiz.medium.10.o3":"Solo si la pelota toca primero la red",
      "quiz.medium.10.exp":"Está prohibido golpear la pelota antes de que bote en tu lado (volea). Se pierde el punto, aunque la pelota fuera a salir.",
      "quiz.medium.11.q":"¿Qué ocurre si el sacador lanza la pelota y decide no golpearla?",
      "quiz.medium.11.o0":"Es automáticamente 'let'",
      "quiz.medium.11.o1":"Es falta y el punto va al adversario",
      "quiz.medium.11.o2":"Puede coger la pelota y repetir",
      "quiz.medium.11.o3":"El árbitro da un aviso oral",
      "quiz.medium.11.exp":"Si el sacador lanza la pelota para el saque y no la golpea, es falta — el punto va al adversario.",
      "quiz.medium.12.q":"Si la pelota en juego toca un objeto ajeno (ropa del jugador, etc.), ¿qué ocurre?",
      "quiz.medium.12.o0":"Punto para el adversario",
      "quiz.medium.12.o1":"Es 'let'",
      "quiz.medium.12.o2":"El punto se repite",
      "quiz.medium.12.o3":"Depende del árbitro",
      "quiz.medium.12.exp":"Si la pelota en juego toca cualquier cosa que no sea la red, sus soportes o la mesa, el punto va al adversario.",
      "quiz.medium.13.q":"¿Cuál es la altura mínima del techo sobre la mesa en competiciones ITTF?",
      "quiz.medium.13.o0":"3 m",
      "quiz.medium.13.o1":"4 m",
      "quiz.medium.13.o2":"5 m",
      "quiz.medium.13.o3":"6 m",
      "quiz.medium.13.exp":"La ITTF recomienda al menos 5 metros de espacio libre sobre la mesa para competiciones internacionales.",
      "quiz.medium.14.q":"En dobles, tras cada set, ¿cómo cambia el orden de saque?",
      "quiz.medium.14.o0":"Se mantiene igual",
      "quiz.medium.14.o1":"El último receptor pasa a ser sacador",
      "quiz.medium.14.o2":"El compañero del sacador pasa a ser el próximo sacador",
      "quiz.medium.14.o3":"Elección libre de los jugadores",
      "quiz.medium.14.exp":"En dobles, la pareja que recibió en el set anterior pasará a sacar, y el jugador que sacó por último pasará a recibir.",
      "quiz.hard.0.q":"Según el reglamento ITTF, ¿cuáles son los colores obligatorios de los revestimientos de una raqueta?",
      "quiz.hard.0.o0":"Un lado rojo, el otro negro",
      "quiz.hard.0.o1":"Cualquier color, siempre que sean diferentes",
      "quiz.hard.0.o2":"Azul y rojo",
      "quiz.hard.0.o3":"Verde y negro",
      "quiz.hard.0.exp":"El reglamento ITTF exige que los dos lados de la raqueta sean obligatoriamente uno rojo y uno negro, para que el adversario pueda distinguir los revestimientos.",
      "quiz.hard.1.q":"¿Cuál es el grosor máximo del revestimiento (goma + esponja) en una raqueta aprobada por la ITTF?",
      "quiz.hard.1.o0":"3 mm",
      "quiz.hard.1.o1":"3,5 mm",
      "quiz.hard.1.o2":"4 mm",
      "quiz.hard.1.o3":"5 mm",
      "quiz.hard.1.exp":"El grosor total de cada lado del revestimiento (goma más esponja, si existe) no puede superar 4 mm.",
      "quiz.hard.2.q":"¿Qué significa 'ITTF approved' en una pelota?",
      "quiz.hard.2.o0":"Pelota fabricada en China",
      "quiz.hard.2.o1":"Pelota testada y homologada por la ITTF para competiciones internacionales",
      "quiz.hard.2.o2":"Pelota usada en los Juegos Olímpicos",
      "quiz.hard.2.o3":"Pelota de 38 mm (formato antiguo)",
      "quiz.hard.2.exp":"'ITTF approved' significa que la pelota ha sido testada y está en la lista de productos aprobados por la ITTF, cumpliendo todos los criterios de tamaño, peso, redondez y color.",
      "quiz.hard.3.q":"Según la ITTF, ¿se pueden usar revestimientos anti-spin (lisos) en la raqueta?",
      "quiz.hard.3.o0":"Sí, siempre que estén aprobados por la ITTF",
      "quiz.hard.3.o1":"No, están prohibidos en todas las competiciones",
      "quiz.hard.3.o2":"Solo en competiciones nacionales",
      "quiz.hard.3.o3":"Solo en un lado",
      "quiz.hard.3.exp":"Los revestimientos anti-spin están permitidos siempre que aparezcan en la lista aprobada por la ITTF. La lista de gomas homologadas se publica y actualiza regularmente.",
      "quiz.hard.4.q":"En un torneo ITTF, si un jugador rompe la raqueta durante el partido, ¿qué puede hacer?",
      "quiz.hard.4.o0":"Continuar con cualquier raqueta disponible",
      "quiz.hard.4.o1":"Debe abandonar el torneo",
      "quiz.hard.4.o2":"Puede sustituirla por una aprobada previamente por el árbitro",
      "quiz.hard.4.o3":"Pide 5 minutos de pausa para sustituirla",
      "quiz.hard.4.exp":"Si la raqueta queda inutilizable, el jugador puede sustituirla, pero la raqueta sustituta debe ser aprobada por el árbitro.",
      "quiz.hard.5.q":"¿Cuál es el procedimiento correcto de inspección de raquetas en competiciones ITTF?",
      "quiz.hard.5.o0":"Solo el árbitro principal inspecciona antes de la final",
      "quiz.hard.5.o1":"Los jugadores muestran las raquetas al adversario y al árbitro antes del inicio del partido",
      "quiz.hard.5.o2":"Solo si hay protesta del adversario",
      "quiz.hard.5.o3":"Solo en competiciones con clasificación mundial",
      "quiz.hard.5.exp":"En competiciones ITTF, cada jugador debe mostrar su raqueta al adversario y al árbitro antes del inicio del partido (y después, si se solicita).",
      "quiz.hard.6.q":"En condiciones normales, ¿con qué frecuencia se cambia la pelota en un partido de competición ITTF?",
      "quiz.hard.6.o0":"Cada set",
      "quiz.hard.6.o1":"Cada 3 puntos",
      "quiz.hard.6.o2":"Al inicio de cada partido o cuando se daña",
      "quiz.hard.6.o3":"Nunca, solo por daño",
      "quiz.hard.6.exp":"La pelota se sustituye al inicio de cada partido o cuando está visiblemente dañada durante el juego.",
      "quiz.hard.7.q":"¿Qué dice la regla ITTF sobre el uso de sustancias en la raqueta ('speed glue')?",
      "quiz.hard.7.o0":"Permitido con aprobación previa",
      "quiz.hard.7.o1":"Completamente prohibido desde 2008",
      "quiz.hard.7.o2":"Permitido solo en competiciones nacionales",
      "quiz.hard.7.o3":"Requiere certificado médico",
      "quiz.hard.7.exp":"El uso de cola rápida (speed glue) y adhesivos con disolventes orgánicos fue prohibido por la ITTF en 2008. Solo se permiten adhesivos al agua (water-based).",
      "quiz.hard.8.q":"Según las reglas ITTF, ¿qué es un 'saque inválido' no corregido por el árbitro tras un aviso?",
      "quiz.hard.8.o0":"Punto inmediato para el adversario",
      "quiz.hard.8.o1":"Segundo saque",
      "quiz.hard.8.o2":"Let repetido",
      "quiz.hard.8.o3":"Descalificación",
      "quiz.hard.8.exp":"Tras aviso por saque inválido, cualquier saque posterior incorrecto resulta en punto directo para el adversario, sin necesidad de nuevo aviso.",
      "quiz.hard.9.q":"¿Cuál es la regla ITTF sobre el tiempo muerto en un partido?",
      "quiz.hard.9.o0":"No se permite tiempo muerto",
      "quiz.hard.9.o1":"Cada equipo tiene 2 tiempos muertos por partido",
      "quiz.hard.9.o2":"Cada jugador/equipo tiene derecho a 1 tiempo muerto de 1 minuto por partido",
      "quiz.hard.9.o3":"Solo el árbitro puede interrumpir el juego",
      "quiz.hard.9.exp":"Cada jugador (o equipo en dobles) tiene derecho a un tiempo muerto de 1 minuto por partido (no por set). Puede pedirse en cualquier momento excepto durante el saque.",
      "quiz.hard.10.q":"¿Qué establece el reglamento ITTF sobre el entrenador durante el partido?",
      "quiz.hard.10.o0":"El entrenador puede dar instrucciones en cualquier momento",
      "quiz.hard.10.o1":"El entrenador solo puede dar instrucciones durante los intervalos entre sets y los tiempos muertos",
      "quiz.hard.10.o2":"El entrenador puede entrar en el área de juego",
      "quiz.hard.10.o3":"No hay regulación sobre el comportamiento del entrenador",
      "quiz.hard.10.exp":"El entrenador solo puede comunicarse con el jugador durante los intervalos entre sets y los tiempos muertos solicitados. No se permiten instrucciones durante el juego.",
      "quiz.hard.11.q":"¿Qué son los 'pimples-out' (espigos hacia fuera) en un revestimiento de raqueta?",
      "quiz.hard.11.o0":"Revestimiento con espigos hacia dentro",
      "quiz.hard.11.o1":"Revestimiento completamente liso",
      "quiz.hard.11.o2":"Revestimiento con espigos hacia fuera, sin capa de esponja detrás",
      "quiz.hard.11.o3":"Goma especial para defensa",
      "quiz.hard.11.exp":"'Pimples-out' (OX o sin esponja) es un revestimiento con los espigos de goma hacia fuera. Reduce el efecto (spin) pero mejora el control. La ITTF lo permite si está aprobado.",
      "quiz.hard.12.q":"¿Cuántos minutos de descanso se permiten entre sets en un partido ITTF?",
      "quiz.hard.12.o0":"1 minuto",
      "quiz.hard.12.o1":"2 minutos",
      "quiz.hard.12.o2":"3 minutos",
      "quiz.hard.12.o3":"5 minutos",
      "quiz.hard.12.exp":"El intervalo entre sets en un partido ITTF tiene una duración máxima de 1 minuto.",
      "quiz.hard.13.q":"¿Qué es el 'phantom serve' y cuál es su situación reglamentaria?",
      "quiz.hard.13.o0":"Saque invisible, permitido",
      "quiz.hard.13.o1":"Saque en que el contacto de la raqueta con la pelota no es claramente visible, prohibido",
      "quiz.hard.13.o2":"Saque con rotación excesiva, limitada a 3000 RPM",
      "quiz.hard.13.o3":"Saque con pelota lanzada más de 30 cm, obligatorio",
      "quiz.hard.13.exp":"El 'phantom serve' oculta el contacto de la pelota con la raqueta (con el cuerpo o brazo libre), impidiendo al adversario ver el momento del impacto. Está prohibido por las reglas ITTF.",
      "quiz.hard.14.q":"En competiciones ITTF, ¿qué especifica la regla sobre la iluminación del área de juego?",
      "quiz.hard.14.o0":"Mínimo de 200 lux",
      "quiz.hard.14.o1":"Mínimo de 500 lux",
      "quiz.hard.14.o2":"Mínimo de 1000 lux en el plano de la mesa, sin luz natural directa",
      "quiz.hard.14.o3":"Sin requisitos específicos",
      "quiz.hard.14.exp":"La ITTF recomienda al menos 1000 lux uniformemente sobre la superficie de la mesa, sin luz solar directa, para competiciones internacionales."
    },
    fr: {
      "menu.newGame":"Nouvelle Partie",
      "menu.newGameSub":"Choisir les joueurs et commencer",
      "menu.tournament":"Tournoi",
      "menu.tournamentSub":"Tableau éliminatoire automatique",
      "menu.players":"Joueurs",
      "menu.playersSub":"Gérer et voir les statistiques",
      "menu.history":"Historique",
      "menu.historySub":"Parties précédentes",
      "menu.data":"Données",
      "menu.dataSub":"Exporter ou importer une sauvegarde",
      "menu.footer":"données enregistrées uniquement sur cet appareil",
      "screen.players":"Joueurs",
      "screen.history":"Historique",
      "screen.gameDetail":"Détail de la Partie",
      "screen.newGame":"Nouvelle Partie",
      "screen.gameType":"Type de Jeu",
      "screen.pointsFormat":"Points et Format",
      "screen.newTournament":"Nouveau Tournoi",
      "screen.tournament":"Tournoi",
      "screen.minigames":"Mini-Jeux",
      "screen.achievements":"Succès",
      "screen.records":"Records",
      "screen.data":"Données",
      "btn.addPlayer":"＋ Nouveau",
      "btn.deletePlayer":"Supprimer",
      "btn.abandon":"Abandonner",
      "btn.continue":"Continuer ▸",
      "btn.startGame":"Démarrer la Partie",
      "btn.createTournament":"Créer le Tournoi",
      "btn.backMenu":"Retour au Menu",
      "btn.start":"Commencer",
      "serve.title":"SERVICE",
      "serve.hint":"sert en premier",
      "setup.bluePlayer":"Côté Bleu",
      "setup.whitePlayer":"Côté Blanc",
      "setup.pointsPerSet":"Points par manche",
      "setup.format":"Format",
      "mg.tap":"Frappes Rapides",
      "mg.tapSub":"Tapez les points avant qu'ils disparaissent",
      "mg.memory":"Mémoire Visuelle",
      "mg.memorySub":"Mémorisez et répétez la séquence",
      "ach.unlocked":"🏆 SUCCÈS DÉBLOQUÉ !",
      "data.export":"Exporter la sauvegarde",
      "data.exportSub":"Génère un fichier .json avec tout",
      "data.import":"Importer une sauvegarde",
      "data.importSub":"Ajouter ou fusionner des données",
      "data.wipe":"Effacer toutes les données",
      "data.wipeSub":"Supprime les joueurs et l'historique",
      "js.choosePlayer":"Choisir un joueur",
      "js.sideBlue":"Bleu",
      "js.sideWhite":"Blanc",
      "js.continue":"Continuer quand même ▸",
      "js.nextSet":"Manche suivante ▸",
      "js.undoMsg":"Dernier point annulé — vous pouvez continuer.",
      "js.setInProgress":"La manche en cours (%b-%w) ne sera pas comptée. Les manches terminées sont sauvegardées.",
      "js.confirmEnd":"Le résultat actuel sera enregistré dans l'historique.",
      "js.confirmWipe":"Effacer toutes les données ?",
      "js.confirmAbandon":"Abandonner le tournoi ?",
      "js.emptyPlayers":"Créez des joueurs d'abord.",
      "js.noData":"Pas encore de données",
      "js.wins":"victoires",
      "js.losses":"défaites",
      "js.draws":"nuls",
      "js.capotes":"blancs",
      "js.winRate":"V%",
      "js.elo":"Classement",
      "js.allPlayers":"Tous les joueurs",
      "js.serve":"Sert",
      "js.notServe":"Ne sert pas",
      "js.set":"Manche",
      "js.bestOf":"Au meilleur de",
      "js.free":"Libre",
      "js.classic":"Classique",
      "js.custom":"Personnalisé",
      "js.gameWon":"%n a gagné la partie",
      "js.setWon":"%n a gagné la manche",
      "js.deuce":"ÉGALITÉ",
      "js.matchPoint":"BALLE DE MATCH",
      "js.capoteTag":"Blanc",
      "js.newRecord":"🏆 Nouveau record !",
      "js.points":"Points",
      "js.level":"Niveau",
      "js.levelReached":"Niveau atteint",
      "js.playAgain":"Rejouer",
      "js.tbd":"À définir",
      "js.play":"▶ JOUER",
      "js.whoseServe":"Manche %n · qui sert en premier ?",
      "js.champion":"🏆 Champion du Tournoi",
      "js.winsLabel":"V",
      "js.lossesLabel":"D",
      "js.drawsLabel":"N",
      "js.capotesLabel":"Bl.",
      "js.winRateLabel":"V%",
      "js.eloLabel":"Class.",
      "js.bestRival":"Meilleur rival",
      "js.worstRival":"Pire rival",
      "js.last10":"10 dernières parties",
      "js.streak":"Série actuelle",
      "js.setsWon":"Manches gagnées",
      "js.setsLost":"Manches perdues",
      "js.capotesMade":"Blancs réalisés",
      "js.capotesSuffered":"Blancs encaissés",
      "js.tournamentsWon":"Tournois gagnés",
      "js.tournamentsPlayed":"Tournois joués",
      "js.trainingMin":"min. d'entraînement",
      "js.trainingSessions":"séances",
      "js.importReplace":"Tout remplacer",
      "js.importMerge":"Ajouter aux données existantes",
      "js.importDetailFile":"Le fichier contient %p joueurs et %g parties.",
      "js.importDetailMerge":"<strong>Ajouter</strong> apporte %np nouveaux joueurs et %ng nouvelles parties (noms identiques fusionnés ; doublons ignorés).",
      "js.importDetailReplace":"<strong>Tout remplacer</strong> supprime les %p joueurs et %g parties actuels et garde uniquement le fichier.",
      "js.recElo":"Meilleur Classement",
      "js.recStreak":"Plus Longue Série",
      "js.recWins":"Plus de Victoires",
      "js.recCapotes":"Plus de Blancs",
      "js.recTournaments":"Plus de Tournois Gagnés",
      "js.recPoints":"Plus de Points Marqués",
      "js.recDuration":"Partie la Plus Longue",
      "js.recMgTap":"Record Frappes Rapides",
      "js.recMgMemory":"Record Mémoire",
      "js.recEloGain":"Plus Grande Progression",
      "js.wins_unit":"victoires",
      "js.min_unit":"min",
      "js.pts_unit":"pts",
      "js.roundQF":"Quarts de finale",
      "js.roundSF":"Demi-finales",
      "js.roundF":"Finale",
      "js.serveEvery2":"Service tous les 2 points",
      "js.serveEvery5":"Service tous les 5 points",
      "js.serveEvery1":"Service tous les 1 point (égalité)",
      "js.eraseConfirm":"Êtes-vous sûr ? Cette action est irréversible.",
      "js.missedGame":"Erreur — annuler le dernier point",
      "js.gameInProgress":"Tu as une partie en cours",
      "js.tournamentInProgress":"Tu as un tournoi en cours",
      "js.resumeGame":"Reprendre la partie ▸",
      "js.resumeTournament":"Reprendre le tournoi ▸",
      "js.endOfSet":"FIN DE LA MANCHE",
      "js.endOfSetCapote":"FIN DE LA MANCHE · BLANC",
      "js.endOfSetDeciding":"FIN DE LA MANCHE · PARTIE DÉCIDÉE",
      "js.endOfSetCapoteDeciding":"FIN DE LA MANCHE · BLANC · PARTIE DÉCIDÉE",
      "js.endOfGame":"FIN DE LA PARTIE",
      "js.endOfGameCapote":"FIN DE LA PARTIE · BLANC",
      "js.drawBetween":"Égalité entre",
      "js.chooseBlue":"Choisir — Côté Bleu",
      "js.chooseWhite":"Choisir — Côté Blanc",
      "js.noPlayersYet":"Aucun joueur créé.<br>Retourne au menu et crée des joueurs d'abord.",
      "js.trainingTitle":"Mode Entraînement",
      "js.trainingFree":"Chrono libre",
      "js.trainingTimed":"Entraînement minuté",
      "js.trainingModeFree":"MODE LIBRE",
      "js.trainingModeTimed":"ENTRAÎNEMENT %n MIN",
      "js.mgMemorize":"Mémorise !",
      "js.mgYourTurn":"À toi !",
      "js.mgPoints":"Points :",
      "js.mgLevel":"Niveau",
      "js.mgLevelReached":"Niveau atteint :",
      "js.mgRecord":"rec :",
      "js.mgMemoryTitle":"Mémoire Visuelle",
      "js.achSecret":"Succès secret débloqué !",
      "js.achSecretDesc":"Succès secret. Continue à jouer pour le découvrir.",
      "js.cancel":"Annuler",
      "js.save":"Enregistrer",
      "js.undo":"Annuler dernier point",
      "js.pause":"Mettre en pause",
      "js.modeCustom":"Personnalisé",
      "js.modeClassic":"Classique",
      "js.modeClassicDesc":"11 points par manche · BO3, BO5 ou BO7",
      "js.formatFree":"Libre",
      "js.formatBo3":"Au meilleur de 3",
      "js.formatBo5":"Au meilleur de 5",
      "js.formatBo7":"Au meilleur de 7",
      "js.setBalanced":"Manche très équilibrée",
      "js.descPlaceholder":"Ex : tournoi d'été, salle de jeux...",
      "js.shortcutTraining":"Mode Entraînement",
      "js.shortcutMinigames":"Mini-Jeux",
      "js.shortcutAchievements":"Succès",
      "js.shortcutRecords":"Records",
      "js.setLabel":"MANCHE",
      "js.noHistory":"Aucune partie dans l'historique pour l'instant.",
      "js.catFirstSteps":"Premiers Pas",
      "js.catWins":"Victoires",
      "js.catSets":"Manches",
      "js.catComebacks":"Remontées",
      "js.catElo":"Classement",
      "js.catPoints":"Points",
      "js.catTournaments":"Tournois",
      "js.catRivalries":"Rivalités",
      "js.catTraining":"Entraînement",
      "js.catMinigames":"Mini-Jeux",
      "js.catSpecials":"Spéciaux",
      "js.noDataYet":"Pas encore de données",
      "js.bracketTbd":"À définir",
      "js.noPlayersEmpty":"Pas encore de joueurs.<br>Appuyez sur '＋ Nouveau' pour ajouter le premier.",
      "js.leaderboard":"Classement · Top %n",
      "js.playerCol":"Joueur",
      "js.gamesUnit":"%n parties",
      "js.noGamesProfile":"Aucune partie enregistrée.",
      "js.resultDraw":"Nul",
      "js.resultWon":"Gagné",
      "js.resultLost":"Perdu",
      "js.gamesDisputed":"%n partie(s)",
      "js.headToHead":"Face à face",
      "js.recentGames":"Dernières parties",
      "js.scorerColor":"Couleur au tableau",
      "js.eloLabel2":"ELO (fun)",
      "js.statGamesPlayed":"Parties jouées",
      "js.statGamesWon":"Parties gagnées",
      "js.statGamesLost":"Parties perdues",
      "js.statGamesDrawn":"Parties nulles",
      "js.statSetsWonV":"Sets gagnés (victoires)",
      "js.statSetsLostD":"Sets perdus (défaites)",
      "js.statTotalSetsWon":"Total sets gagnés",
      "js.statTotalSetsLost":"Total sets perdus",
      "js.statCapotesMade":"Blancs réalisés",
      "js.statCapotesSuffered":"Blancs subis",
      "js.statTournamentsWon":"Tournois gagnés",
      "js.statTournamentsTotal":"Tournois totaux",
      "js.bestRivalAgainst":"Plus de victoires contre (%n)",
      "js.worstRivalAgainst":"Plus de défaites contre (%n)",
      "js.noHistoryYet":"Pas encore de parties dans l'historique.<br>Jouez la première pour la voir ici.",
      "js.draw":"NUL",
      "js.setsSep":"SETS",
      "js.xCapote":"%nx Blanc",
      "js.modeFree":"LIBRE",
      "js.modeMd3":"MD3",
      "js.modeMd5":"MD5",
      "js.modeMd7":"MD7",
      "js.gameEndedDraw":"La partie s'est terminée par un nul",
      "js.setsWonBy":"Sets (%n a gagné la partie)",
      "js.ptsPerSet":"points par set",
      "js.duration":"durée",
      "js.setRecap":"Set %n",
      "js.undoToast":"Dernier point annulé — vous pouvez continuer le set.",
      "js.statsSaved":"Joueurs sauvegardés",
      "js.gamesInHistory":"Parties dans l'historique",
      "js.exportedToast":"Sauvegarde exportée : %f",
      "js.importedToast":"Importés : %p joueurs, %g parties",
      "js.invalidFile":"Fichier invalide ou corrompu.",
      "js.cantReadFile":"Impossible de lire le fichier.",
      "js.invalidFormat":"Fichier invalide : format inattendu.",
      "js.invalidBackup":"Fichier invalide : pas une sauvegarde PLACAR.",
      "js.replacedToast":"Données remplacées avec succès.",
      "js.wipedToast":"Toutes les données ont été effacées.",
      "js.createPlayersFirst":"Créez des joueurs d'abord.",
      "js.roundLabel":"Tour %n",
      "js.tournamentWinnerSub":"%m parties · %p joueurs",
      "js.choosePlayerFirst":"Choisissez un joueur d'abord",
      "js.recMgMemory2":"Record Mémoire Visuelle",
      "js.recMorePoints":"Plus de Points Accumulés",
      "js.recMoreTraining":"Plus de Temps d'Entraînement",
      "js.levelPrefix":"niveau ",
      "js.winsUnit":" victoires",
      "js.capotesUnit":" blancs",
      "js.tournamentsUnit":" tournois",
      "js.pointsUnit":" points",
      "js.minUnit":" min",
      "js.achProgressText":"%d / %t succès",
      "js.setup.pts11":"11 points",
      "js.setup.pts21":"21 points",
      "js.overlay.endGameTitle":"TERMINER LA PARTIE",
      "js.overlay.confirmEnd":"Confirmer la fin de partie ?",
      "js.overlay.confirmEndBtn":"Terminer",
      "js.data.backup":"Sauvegarde",
      "js.data.wipeAll":"Tout effacer",
      "js.mg.playAs":"Jouer en tant que",
      "js.tournament.size":"Taille",
      "js.tournament.mode":"Mode",
      "js.mode.customDesc":"11 ou 21 points · libre, MD3 ou MD5 · service alterne tous les 5 points",
      "mg.quiz":"Quiz de Règles",
      "mg.quizSub":"Testez vos connaissances des règles ITTF",
      "mg.rules":"Règles ITTF",
      "mg.rulesSub":"Toutes les règles officielles du tennis de table",
      "js.mgQuizScore":"Points :",
      "js.mgQuizIntro":"Choisissez le niveau de difficulté",
      "js.mgQuizEasy":"Facile",
      "js.mgQuizEasyDesc":"Règles de base du jeu",
      "js.mgQuizMedium":"Moyen",
      "js.mgQuizMediumDesc":"Règles de service et de score",
      "js.mgQuizHard":"Difficile",
      "js.mgQuizHardDesc":"Règlement et tournois",
      "js.mgQuizBestScore":"Meilleur score :",
      "js.mgQuizNext":"Suivant ▸",
      "js.mgQuizFinalScore":"Score final :",
      "js.mgQuizCorrect":"Correct ! ✓",
      "js.mgQuizWrong":"Faux ✗",
      "js.mgQuizChooseFirst":"Choisissez un joueur d'abord",
      "js.mgQuizResultGreat":"Excellent ! Vous connaissez très bien les règles !",
      "js.mgQuizResultGood":"Bon travail ! Continuez à étudier les règles.",
      "js.mgQuizResultTry":"Continuez à pratiquer et à lire les règles ITTF.",
      "js.langBtn":"Langue",
      "js.settingsBtn":"Paramètres",
      "js.descLabel":"Description",
      "js.optional":"(optionnel)",
      "js.nPlayers4":"4 joueurs",
      "js.nPlayers8":"8 joueurs",
      "js.nPlayers16":"16 joueurs",
      "js.trainingDuration":"Durée (minutes)",
      "js.back":"‹ Retour",
      "js.gameEndedTitle":"PARTIE TERMINÉE",
      "js.backToMenu":"Retour au Menu",
      "js.newPlayerTitle":"NOUVEAU JOUEUR",
      "js.newPlayerName":"Nom du joueur",
      "js.playerNamePlaceholder":"Ex : Michel",
      "js.colorPickerLabel":"Couleur au tableau",
      "js.color.blueWhite":"Bleu / Blanc",
      "js.color.greenWhite":"Vert / Blanc",
      "js.color.redWhite":"Rouge / Blanc",
      "js.color.pinkWhite":"Rose / Blanc",
      "js.color.purpleWhite":"Violet / Blanc",
      "js.color.goldWhite":"Or / Blanc",
      "js.color.whiteBlack":"Blanc / Noir",
      "js.color.orangeWhite":"Orange / Blanc",
      "js.dataExplain":"Sauvegardez joueurs et historique dans un fichier à conserver dans le cloud (Drive, email, etc.) pour tout récupérer sur cette tablette ou une autre.",
      "js.importTitle":"IMPORTER DES DONNÉES",
      "js.importQuestion":"Que voulez-vous faire ?",
      "js.importDetail":"Cela remplacera les joueurs et l'historique déjà enregistrés sur cette tablette.",
      "js.mergeImport":"Ajouter aux données existantes",
      "js.replaceImport":"Tout remplacer",
      "js.wipeTitle":"TOUT EFFACER",
      "js.wipeQuestion":"Effacer toutes les données ?",
      "js.wipeDetail":"Cette action est irréversible. Pensez à exporter une sauvegarde d'abord.",
      "js.wipeConfirm":"Tout effacer",
      "js.rotateHint":"Faites pivoter la tablette en mode paysage",
      "js.overlay.confirmEndDetail":"Le résultat actuel sera enregistré dans l'historique.",
      "ach.first_point.name":"Premier Point",
      "ach.first_point.desc":"Marque ton premier point.",
      "ach.first_set.name":"Premier Set",
      "ach.first_set.desc":"Gagne ton premier set.",
      "ach.first_win.name":"Première Victoire",
      "ach.first_win.desc":"Gagne ton premier match.",
      "ach.first_tournament.name":"Premier Tournoi",
      "ach.first_tournament.desc":"Participe à ton premier tournoi.",
      "ach.first_trophy.name":"Premier Trophée",
      "ach.first_trophy.desc":"Gagne ton premier tournoi.",
      "ach.wins_10.name":"10 Victoires",
      "ach.wins_10.desc":"Gagne 10 matchs.",
      "ach.wins_50.name":"50 Victoires",
      "ach.wins_50.desc":"Gagne 50 matchs.",
      "ach.wins_100.name":"100 Victoires",
      "ach.wins_100.desc":"Gagne 100 matchs.",
      "ach.wins_200.name":"200 Victoires",
      "ach.wins_200.desc":"Gagne 200 matchs.",
      "ach.streak_3.name":"Hat-trick",
      "ach.streak_3.desc":"3 victoires consécutives.",
      "ach.streak_5.name":"En Forme",
      "ach.streak_5.desc":"5 victoires consécutives.",
      "ach.streak_10.name":"Imparable",
      "ach.streak_10.desc":"10 victoires consécutives.",
      "ach.streak_20.name":"Invincible",
      "ach.streak_20.desc":"20 victoires consécutives.",
      "ach.sweep.name":"Balayage",
      "ach.sweep.desc":"Gagne un match sans perdre aucun set.",
      "ach.capote_set.name":"Capot",
      "ach.capote_set.desc":"Gagne un set 11-0.",
      "ach.set_perfect.name":"Set Parfait",
      "ach.set_perfect.desc":"Gagne un set en accordant au plus 3 points.",
      "ach.deciding_set.name":"Décision",
      "ach.deciding_set.desc":"Gagne un match décidé au dernier set.",
      "ach.comeback.name":"Remontée",
      "ach.comeback.desc":"Gagne un match après avoir perdu le 1er set.",
      "ach.comeback_02.name":"Grande Remontée",
      "ach.comeback_02.desc":"Gagne un match en étant mené 0-2 aux sets.",
      "ach.comeback_pts.name":"Ne Jamais Abandonner",
      "ach.comeback_pts.desc":"Gagne un set en étant mené de 5+ points.",
      "ach.elo_1000.name":"Quatre Chiffres",
      "ach.elo_1000.desc":"Atteins 1000 d'ELO.",
      "ach.elo_1200.name":"Club 1200",
      "ach.elo_1200.desc":"Atteins 1200 d'ELO.",
      "ach.elo_1300.name":"Élite",
      "ach.elo_1300.desc":"Atteins 1300 d'ELO.",
      "ach.elo_1500.name":"Maître",
      "ach.elo_1500.desc":"Atteins 1500 d'ELO.",
      "ach.pts_100.name":"Centenaire",
      "ach.pts_100.desc":"Accumule 100 points.",
      "ach.pts_500.name":"500 Points",
      "ach.pts_500.desc":"Accumule 500 points.",
      "ach.pts_1000.name":"1000 Points",
      "ach.pts_1000.desc":"Accumule 1000 points.",
      "ach.tour_2.name":"Double Champion",
      "ach.tour_2.desc":"Gagne 2 tournois.",
      "ach.tour_3.name":"Triple Champion",
      "ach.tour_3.desc":"Gagne 3 tournois.",
      "ach.rival_10.name":"Classique",
      "ach.rival_10.desc":"Joue 10 matchs contre le même adversaire.",
      "ach.rival_25.name":"Rivalité",
      "ach.rival_25.desc":"Joue 25 matchs contre le même adversaire.",
      "ach.rival_dom.name":"Domination",
      "ach.rival_dom.desc":"10 victoires d'avance sur le même adversaire.",
      "ach.rival_5.name":"Bourreau",
      "ach.rival_5.desc":"5 victoires consécutives contre le même adversaire.",
      "ach.train_first.name":"Premier Entraînement",
      "ach.train_first.desc":"Complète une séance d'entraînement.",
      "ach.train_10m.name":"10 Minutes",
      "ach.train_10m.desc":"Accumule 10 minutes d'entraînement.",
      "ach.train_1h.name":"1 Heure",
      "ach.train_1h.desc":"Accumule 60 minutes d'entraînement.",
      "ach.train_5sess.name":"Discipline",
      "ach.train_5sess.desc":"Complète 5 séances d'entraînement.",
      "ach.mg_tap_10.name":"Réflexes d'Acier",
      "ach.mg_tap_10.desc":"Fais 10 points en Touches Rapides.",
      "ach.mg_tap_30.name":"Éclair",
      "ach.mg_tap_30.desc":"Fais 30 points en Touches Rapides.",
      "ach.mg_mem_5.name":"Mémoire Solide",
      "ach.mg_mem_5.desc":"Atteins le niveau 5 en Mémoire Visuelle.",
      "ach.mg_mem_10.name":"Mémoire de Fer",
      "ach.mg_mem_10.desc":"Atteins le niveau 10 en Mémoire Visuelle.",
      "ach.secret_11_0.name":"Humiliation",
      "ach.secret_11_0.desc":"Gagne un set 11-0.",
      "ach.secret_3_2.name":"À la Limite",
      "ach.secret_3_2.desc":"Gagne un match décidé au 5e set.",
      "ach.secret_11_9.name":"Point par Point",
      "ach.secret_11_9.desc":"Gagne un set 11-9.",
      "ach.secret_midnight.name":"Session Nocturne",
      "ach.secret_midnight.desc":"Joue après minuit.",
      "ach.secret_morning.name":"Lève-tôt",
      "ach.secret_morning.desc":"Joue avant 08:00.",
      "ach.secret_10day.name":"Machine",
      "ach.secret_10day.desc":"Joue 10 matchs dans la même journée.",
      "rules.jogo.title":"Le Jeu — Règles Générales",
      "rules.jogo.r0":"Un set est gagné par le premier joueur à atteindre 11 points, avec un avantage minimum de 2 points sur l'adversaire.",
      "rules.jogo.r1":"Un match est remporté par le joueur qui gagne le plus de sets dans le format défini (meilleur des 3, 5 ou 7).",
      "rules.jogo.r2":"Le joueur qui marque un point sert ensuite (ou conserve le service selon la rotation).",
      "rules.jogo.r3":"Si la balle en jeu touche une partie du corps autre que la main de la raquette, le point est perdu.",
      "rules.jogo.r4":"La main libre (sans raquette) NE PEUT PAS toucher la surface de jeu pendant un échange — point à l'adversaire.",
      "rules.jogo.r5":"Si la balle touche le bord supérieur de la table (bord de table), le point est valide.",
      "rules.jogo.r6":"Si la balle touche le côté de la table, le point va à l'adversaire — ce n'est pas une zone de jeu.",
      "rules.jogo.r7":"Un joueur ne peut pas frapper la balle avant qu'elle rebondisse sur sa moitié de table (pas de volée).",
      "rules.jogo.r8":"Le jeu peut être interrompu pour une blessure vérifiable, une panne d'équipement ou toute autre raison acceptée par l'arbitre.",
      "rules.jogo.r9":"Après 10 minutes de jeu dans un set (sans qu'aucun joueur n'atteigne 9 points), le système d'accélération s'applique : le point va au receveur si le serveur ne gagne pas en 13 coups.",
      "rules.servico.title":"Service",
      "rules.servico.r0":"Au service, la balle doit être posée sur la paume ouverte et immobile de la main libre, au-dessus du niveau de la table.",
      "rules.servico.r1":"La balle doit être lancée presque verticalement vers le haut, d'au moins 16 cm, sans effet.",
      "rules.servico.r2":"Le serveur doit frapper la balle en descente pour qu'elle touche d'abord son côté de la table, puis le côté adverse.",
      "rules.servico.r3":"En simple, la balle peut atterrir n'importe où sur la moitié adverse de la table.",
      "rules.servico.r4":"En double, le service doit être diagonal : depuis la moitié droite du serveur vers la moitié droite du receveur.",
      "rules.servico.r5":"Le contact entre la balle et la raquette doit être visible par l'adversaire et l'arbitre — il ne peut pas être caché par le corps.",
      "rules.servico.r6":"Si la balle touche le filet au service et atterrit correctement, c'est un « let » — le service est rejoué.",
      "rules.servico.r7":"Après un avertissement, tout service illégal ultérieur donne un point immédiat à l'adversaire.",
      "rules.servico.r8":"Si le serveur lance la balle pour servir mais ne la frappe pas, le point est perdu.",
      "rules.servico.r9":"Au service, le bras libre doit être au-dessus du niveau de la table et visible de l'arbitre et de l'adversaire.",
      "rules.pontuacao.title":"Marquage et Changement de Service",
      "rules.pontuacao.r0":"Le service change tous les 2 points joués, en alternance entre les joueurs.",
      "rules.pontuacao.r1":"En égalité (10-10), le service change à chaque point et un avantage de 2 points est nécessaire pour gagner le set.",
      "rules.pontuacao.r2":"En double, l'ordre de service et de réception doit être maintenu jusqu'à la fin du set ; au set suivant, la paire qui recevait sert.",
      "rules.pontuacao.r3":"Le premier serveur d'un match est déterminé par un tirage au sort (pile ou face ou choix de côté).",
      "rules.pontuacao.r4":"Au début de chaque set, les joueurs changent de côté ; dans le set décisif (dernier set), ils changent de côté quand un joueur atteint 5 points.",
      "rules.pontuacao.r5":"Dans un set décisif en double, la paire qui reçoit peut modifier son ordre de réception.",
      "rules.pontuacao.r6":"Le système d'accélération ne modifie pas l'alternance de 2 points du service — il réduit simplement l'alternance à 1 point par service à partir de son activation.",
      "rules.pontuacao.r7":"Après un let de service, l'échange de service est rejoué en intégralité (le compte n'avance pas).",
      "rules.equipamento.title":"Équipement — Table et Filet",
      "rules.equipamento.r0":"La table mesure 274 cm de long × 152,5 cm de large × 76 cm de haut.",
      "rules.equipamento.r1":"La surface de jeu doit être plate, uniforme, mate (généralement bleue ou verte) avec une ligne de bordure blanche de 2 cm.",
      "rules.equipamento.r2":"Le filet divise la table en deux moitiés égales ; il mesure 15,25 cm de haut sur toute sa longueur.",
      "rules.equipamento.r3":"La surface de jeu n'inclut pas les surfaces latérales (bords latéraux) de la table.",
      "rules.equipamento.r4":"La table doit être en bois ou matériau similaire, avec un rebond de 23 ± 1 cm quand une balle standard est lâchée depuis 30 cm.",
      "rules.equipamento.r5":"La ligne centrale (2 mm de large) divise la table en deux moitiés égales et fait partie de chaque demi-droite pour les services en double.",
      "rules.bola.title":"Équipement — Balle",
      "rules.bola.r0":"La balle doit avoir 40 mm de diamètre (± 0,5 mm) et peser 2,7 g (± 0,1 g).",
      "rules.bola.r1":"La balle doit être blanche ou orange, mate.",
      "rules.bola.r2":"Les balles doivent être en plastique (depuis 2015, remplaçant la celluloïd).",
      "rules.bola.r3":"Une balle abîmée ou déformée doit être remplacée immédiatement.",
      "rules.bola.r4":"En compétition officielle, seules les balles homologuées ITTF peuvent être utilisées.",
      "rules.raquete.title":"Équipement — Raquette",
      "rules.raquete.r0":"La raquette peut avoir n'importe quelle taille, forme ou poids, mais le plateau doit être plat et rigide.",
      "rules.raquete.r1":"Au moins 85 % de l'épaisseur du plateau doit être en bois naturel.",
      "rules.raquete.r2":"Chaque face du plateau doit être recouverte d'un revêtement homologué ITTF.",
      "rules.raquete.r3":"Les deux faces du plateau doivent être de couleurs différentes : une rouge et une noire.",
      "rules.raquete.r4":"Le joueur doit montrer sa raquette à l'adversaire avant le début du match.",
      "rules.raquete.r5":"Il est interdit de modifier la raquette pendant un match.",
      "rules.raquete.r6":"Si un revêtement se détache pendant le jeu, il faut le remplacer avant de continuer.",
      "rules.raquete.r7":"Les revêtements doivent être en bon état — sans coupures ni décollements significatifs.",
      "rules.raquete.r8":"La surface de frappe doit être homogène et sans déformations.",
      "rules.conduta.title":"Conduite et Fair-Play",
      "rules.conduta.r0":"Tout comportement irrespectueux envers l'adversaire, l'arbitre ou le public peut entraîner un avertissement ou une disqualification.",
      "rules.conduta.r1":"Il est interdit de perturber intentionnellement l'adversaire pendant un échange.",
      "rules.conduta.r2":"Un joueur ne peut pas demander un temps mort médical plus d'une fois par match (sauf urgence réelle).",
      "rules.conduta.r3":"L'usage de substances altérant les performances de la raquette (colle rapide, boosters) est interdit.",
      "rules.conduta.r4":"Les joueurs doivent rester debout pendant le jeu, sauf autorisation médicale spéciale.",
      "rules.conduta.r5":"En cas de litige sur un point, l'arbitre a le dernier mot ; les joueurs ne peuvent pas se faire justice eux-mêmes.",
      "rules.conduta.r6":"Communiquer avec son entraîneur n'est autorisé qu'entre les sets, sauf exceptions.",
      "rules.torneio.title":"Tournois et Compétitions",
      "rules.torneio.r0":"Dans les tournois officiels, un arbitre accrédité ITTF ou fédération nationale doit superviser les matchs.",
      "rules.torneio.r1":"L'échauffement est limité à 2 minutes avant le début de chaque match.",
      "rules.torneio.r2":"Les joueurs peuvent demander jusqu'à 1 temps mort de 60 secondes par set.",
      "rules.torneio.r3":"En double, les partenaires alternent les coups à chaque point.",
      "rules.torneio.r4":"Les qualifications et têtes de série sont déterminées par le classement mondial ITTF.",
      "rules.torneio.r5":"En cas d'égalité dans un tableau en poules, les critères de départage sont : sets, puis points, puis résultat direct.",
      "rules.torneio.r6":"En tableau à élimination directe, tout match nul dans les formats à sets pairs est résolu par un set décisif.",
      "rules.torneio.r7":"Les joueurs doivent être prêts dans les 10 minutes suivant leur convocation, sinon ils sont déclarés forfait.",
      "rules.torneio.r8":"La surface de jeu, l'éclairage et les conditions environnementales doivent respecter les normes ITTF.",
      "rules.torneio.r9":"Tout incident (blessure, réclamation, disqualification) doit être consigné dans le rapport officiel du match.",
      "rules.especial.title":"Situations Spéciales",
      "rules.especial.r0":"Si un objet extérieur pénètre sur la table pendant un échange, le point est rejoué.",
      "rules.especial.r1":"Si un joueur touche la table avec sa main libre (sans raquette), le point va à l'adversaire.",
      "rules.especial.r2":"Si la balle éclate ou se déforme visiblement pendant l'échange, le point est rejoué avec une nouvelle balle.",
      "rules.especial.r3":"Si l'éclairage se coupe pendant un échange, le point est rejoué.",
      "rules.especial.r4":"En cas de force majeure (catastrophe naturelle, urgence), le match peut être suspendu et repris ultérieurement.",
      "rules.especial.r5":"Si un joueur reçoit une aide extérieure non autorisée pendant un échange, le point est perdu.",
      "rules.especial.r6":"Le système d'accélération ne s'applique pas aux matches en double dans certaines compétitions — vérifier le règlement local.",
      "rules.especial.r7":"Si les deux joueurs commettent une faute simultanément, le point est rejoué.",
      "quiz.easy.0.q":"Quantos pontos são necessários para ganhar um set no ténis de mesa (modo standard)?",
      "quiz.easy.0.o0":"11",
      "quiz.easy.0.o1":"21",
      "quiz.easy.0.o2":"15",
      "quiz.easy.0.o3":"9",
      "quiz.easy.0.exp":"Na ITTF, um set é ganho ao atingir 11 pontos, com uma vantagem mínima de 2 pontos.",
      "quiz.easy.1.q":"De quantos em quantos pontos se troca o serviço durante um jogo?",
      "quiz.easy.1.o0":"2",
      "quiz.easy.1.o1":"5",
      "quiz.easy.1.o2":"3",
      "quiz.easy.1.o3":"1",
      "quiz.easy.1.exp":"O serviço muda a cada 2 pontos, exceto em caso de deuce (10-10).",
      "quiz.easy.2.q":"O que é o 'deuce' no ténis de mesa?",
      "quiz.easy.2.o0":"Vitória por 11-0",
      "quiz.easy.2.o1":"Falta de serviço",
      "quiz.easy.2.o2":"Empate a 10 pontos que exige vantagem de 2",
      "quiz.easy.2.o3":"Ponto disputado",
      "quiz.easy.2.exp":"Deuce ocorre quando o marcador fica 10-10. A partir daí, o serviço muda a cada ponto e é necessária uma vantagem de 2 pontos para ganhar o set.",
      "quiz.easy.3.q":"Qual é o diâmetro oficial da bola de ténis de mesa (ITTF)?",
      "quiz.easy.3.o0":"36 mm",
      "quiz.easy.3.o1":"40 mm",
      "quiz.easy.3.o2":"38 mm",
      "quiz.easy.3.o3":"42 mm",
      "quiz.easy.3.exp":"A bola oficial ITTF tem 40 mm de diâmetro (introduzido em 2000, substituindo 38 mm).",
      "quiz.easy.4.q":"Ao servir, o lançamento da bola deve ter pelo menos quantos centímetros de altura?",
      "quiz.easy.4.o0":"10 cm",
      "quiz.easy.4.o1":"15 cm",
      "quiz.easy.4.o2":"16 cm",
      "quiz.easy.4.o3":"20 cm",
      "quiz.easy.4.exp":"A bola deve ser lançada quase verticalmente para cima, pelo menos 16 cm, a partir da palma da mão aberta.",
      "quiz.easy.5.q":"Quando um set chega a 10-10, quantos pontos consecutivos são necessários para ganhar?",
      "quiz.easy.5.o0":"1",
      "quiz.easy.5.o1":"2",
      "quiz.easy.5.o2":"3",
      "quiz.easy.5.o3":"4",
      "quiz.easy.5.exp":"Em deuce (10-10), é necessária uma vantagem de 2 pontos, ou seja, dois pontos consecutivos sobre o adversário.",
      "quiz.easy.6.q":"A mesa de ténis de mesa tem que dimensões?",
      "quiz.easy.6.o0":"274 × 152,5 cm",
      "quiz.easy.6.o1":"260 × 140 cm",
      "quiz.easy.6.o2":"280 × 160 cm",
      "quiz.easy.6.o3":"250 × 130 cm",
      "quiz.easy.6.exp":"A mesa oficial ITTF mede 274 cm de comprimento × 152,5 cm de largura, com altura de 76 cm.",
      "quiz.easy.7.q":"A que altura fica o topo da rede oficial ITTF?",
      "quiz.easy.7.o0":"14,25 cm",
      "quiz.easy.7.o1":"15,25 cm",
      "quiz.easy.7.o2":"16,25 cm",
      "quiz.easy.7.o3":"13,25 cm",
      "quiz.easy.7.exp":"A rede tem 15,25 cm de altura ao centro e ao longo de toda a sua extensão.",
      "quiz.easy.8.q":"Quantos sets tem normalmente um jogo clássico ITTF (competição)?",
      "quiz.easy.8.o0":"3",
      "quiz.easy.8.o1":"5",
      "quiz.easy.8.o2":"7",
      "quiz.easy.8.o3":"9",
      "quiz.easy.8.exp":"Na maioria das competições ITTF usa-se o formato melhor de 7 (4 sets ganhos para vencer). Para muitos eventos usa-se também melhor de 5 ou 3.",
      "quiz.easy.9.q":"O que acontece se a bola toca a rede durante o serviço?",
      "quiz.easy.9.o0":"Recomeça-se (let)",
      "quiz.easy.9.o1":"Ponto para o adversário",
      "quiz.easy.9.o2":"Ponto para quem serve",
      "quiz.easy.9.o3":"Segunda oportunidade",
      "quiz.easy.9.exp":"Se a bola toca a rede e cai na metade correta da mesa, é um 'let' e o serviço é repetido sem penalização.",
      "quiz.easy.10.q":"Em que lado da mesa deve cair a bola no serviço (jogo de singulares)?",
      "quiz.easy.10.o0":"Só no lado esquerdo",
      "quiz.easy.10.o1":"Em qualquer ponto da metade do adversário",
      "quiz.easy.10.o2":"Só no lado direito",
      "quiz.easy.10.o3":"Na diagonal",
      "quiz.easy.10.exp":"Em singulares, a bola deve apenas cair na metade da mesa do adversário, em qualquer ponto. Não há restrição diagonal (ao contrário dos pares).",
      "quiz.easy.11.q":"Qual a cor padrão da superfície da mesa ITTF?",
      "quiz.easy.11.o0":"Azul ou verde",
      "quiz.easy.11.o1":"Vermelho ou amarelo",
      "quiz.easy.11.o2":"Branco",
      "quiz.easy.11.o3":"Preto",
      "quiz.easy.11.exp":"A superfície da mesa deve ser de cor uniforme, mate (não brilhante), tipicamente azul escuro ou verde.",
      "quiz.easy.12.q":"O que é um 'expedite system' (sistema de aceleração)?",
      "quiz.easy.12.o0":"Forma de acelerar o serviço",
      "quiz.easy.12.o1":"Sistema de desempate por sorteio",
      "quiz.easy.12.o2":"Regra que limita um set a 10 minutos de duração",
      "quiz.easy.12.o3":"Sistema de pontuação dupla",
      "quiz.easy.12.exp":"Após 10 minutos de jogo num set, entra em vigor o 'expedite system': o ponto é ganho pelo recetor se o servidor fizer 13 pancadas consecutivas sem ganhar o ponto.",
      "quiz.easy.13.q":"Em pares, qual é a regra do serviço?",
      "quiz.easy.13.o0":"Qualquer jogador pode servir para qualquer lado",
      "quiz.easy.13.o1":"A bola deve ir em diagonal — metade direita para metade direita",
      "quiz.easy.13.o2":"A bola deve ir para a metade esquerda do adversário",
      "quiz.easy.13.o3":"Não há restrições em pares",
      "quiz.easy.13.exp":"Em pares (duplas), o serviço deve ser feito em diagonal: da metade direita do servidor para a metade direita do recetor.",
      "quiz.easy.14.q":"Um jogador pode apoiar a mão livre na mesa durante o jogo?",
      "quiz.easy.14.o0":"Sim, é permitido",
      "quiz.easy.14.o1":"Não, ponto para o adversário se tocar",
      "quiz.easy.14.o2":"Só no lado do próprio jogador",
      "quiz.easy.14.o3":"Apenas durante o serviço",
      "quiz.easy.14.exp":"Se a mão livre (a que não segura a raquete) tocar a superfície de jogo durante um rally, o ponto é perdido pelo jogador infrator.",
      "quiz.medium.0.q":"Após um 'let' no serviço, o que acontece ao par de pontos desse serviço?",
      "quiz.medium.0.o0":"O serviço é repetido, sem mudar a contagem",
      "quiz.medium.0.o1":"Perde-se um dos dois pontos desse par",
      "quiz.medium.0.o2":"O par de serviços reinicia",
      "quiz.medium.0.o3":"O adversário ganha o serviço",
      "quiz.medium.0.exp":"Um 'let' anula o serviço. O servidor repete exatamente o mesmo serviço, sem alterar nenhum marcador ou par de pontos.",
      "quiz.medium.1.q":"Quando começa exatamente o 'expedite system'?",
      "quiz.medium.1.o0":"Quando o marcador chega a 9-9",
      "quiz.medium.1.o1":"Após 10 minutos de jogo num set, se nenhum jogador ainda tiver 9 pontos",
      "quiz.medium.1.o2":"Sempre que um set dura mais de 8 minutos",
      "quiz.medium.1.o3":"Quando o atacante faz 10 pancadas seguidas",
      "quiz.medium.1.exp":"O expedite system é introduzido após 10 minutos de jogo num set, desde que nenhum dos jogadores tenha chegado aos 9 pontos. A qualquer momento pode ser pedido por ambos os jogadores.",
      "quiz.medium.2.q":"O que acontece se a bola toca a borda lateral da mesa?",
      "quiz.medium.2.o0":"É 'let'",
      "quiz.medium.2.o1":"Ponto para quem bateu na bola",
      "quiz.medium.2.o2":"Ponto para o adversário",
      "quiz.medium.2.o3":"Repetição do ponto",
      "quiz.medium.2.exp":"A borda lateral (borda lateral da superfície de jogo) não é válida. Se a bola toca a borda lateral, é ponto para o adversário.",
      "quiz.medium.3.q":"A bola pode tocar a borda superior da mesa (edge) e ser boa?",
      "quiz.medium.3.o0":"Sim, é ponto válido",
      "quiz.medium.3.o1":"Não, é falta",
      "quiz.medium.3.o2":"Apenas no serviço",
      "quiz.medium.3.o3":"Apenas se cair para dentro",
      "quiz.medium.3.exp":"Se a bola toca a borda superior da mesa (edge — a superfície de jogo), é um ponto válido, pois faz parte da superfície de jogo.",
      "quiz.medium.4.q":"Qual é o peso oficial de uma bola ITTF?",
      "quiz.medium.4.o0":"2,0 g",
      "quiz.medium.4.o1":"2,3 g",
      "quiz.medium.4.o2":"2,7 g",
      "quiz.medium.4.o3":"3,0 g",
      "quiz.medium.4.exp":"A bola oficial ITTF pesa 2,7 gramas.",
      "quiz.medium.5.q":"Durante o serviço, em que posição deve estar a palma da mão livre ao lançar a bola?",
      "quiz.medium.5.o0":"Aberta e plana, acima do nível da mesa",
      "quiz.medium.5.o1":"Fechada em punho",
      "quiz.medium.5.o2":"Apontada para o adversário",
      "quiz.medium.5.o3":"Abaixo do nível da mesa",
      "quiz.medium.5.exp":"A bola deve estar na palma da mão aberta e imóvel, acima do nível da superfície de jogo, antes de ser lançada para o serviço.",
      "quiz.medium.6.q":"O topo da rede pode ser tocado pela bola durante um rally (não no serviço)?",
      "quiz.medium.6.o0":"Sim, se cair do outro lado é ponto válido",
      "quiz.medium.6.o1":"Não, é sempre falta",
      "quiz.medium.6.o2":"Só se a bola não parar na rede",
      "quiz.medium.6.o3":"É sempre 'let'",
      "quiz.medium.6.exp":"Durante o rally, se a bola toca o topo da rede e cai válida no outro lado, o ponto é válido (não é let — o let só existe no serviço).",
      "quiz.medium.7.q":"Se um jogador interrompe o jogo intencionalmente sem razão válida, o que acontece?",
      "quiz.medium.7.o0":"O set é anulado",
      "quiz.medium.7.o1":"O árbitro dá um aviso oral",
      "quiz.medium.7.o2":"O ponto em disputa é atribuído ao adversário",
      "quiz.medium.7.o3":"O jogador é desqualificado",
      "quiz.medium.7.exp":"Interrupção deliberada do jogo é considerada 'má conduta'. O árbitro pode atribuir o ponto ao adversário como penalização.",
      "quiz.medium.8.q":"Em singulares, o servidor tem de bater na bola do próprio lado antes de ir para o outro lado?",
      "quiz.medium.8.o0":"Sim, obrigatório",
      "quiz.medium.8.o1":"Não, a bola vai diretamente para o lado do adversário",
      "quiz.medium.8.o2":"Só no primeiro serviço de cada jogo",
      "quiz.medium.8.o3":"Depende do modo de jogo",
      "quiz.medium.8.exp":"Em singulares, a bola vai diretamente da raquete para a metade do adversário, sem tocar no lado do servidor. É em pares que o serviço deve ser diagonal.",
      "quiz.medium.9.q":"O que é um 'good return' (devolução válida)?",
      "quiz.medium.9.o0":"Bola que toca sempre a rede",
      "quiz.medium.9.o1":"Bola que bate na mesa do servidor",
      "quiz.medium.9.o2":"Bola que cai fora da mesa",
      "quiz.medium.9.o3":"Bola que passa a rede e cai dentro da mesa do adversário ou na borda",
      "quiz.medium.9.exp":"Uma devolução válida é aquela em que a bola (após ser batida) passa sobre ou à volta da rede e cai na área de jogo do adversário ou na borda superior da mesa.",
      "quiz.medium.10.q":"Pode um jogador bater na bola antes de ela tocar a sua metade da mesa (volley)?",
      "quiz.medium.10.o0":"Sim, se a bola estiver a sair da mesa",
      "quiz.medium.10.o1":"Não, ponto para o adversário",
      "quiz.medium.10.o2":"Só no último ponto do set",
      "quiz.medium.10.o3":"Apenas se a bola tocar a rede antes",
      "quiz.medium.10.exp":"É proibido bater na bola antes de ela tocar a sua metade da mesa (volley). Se o fizer, perde o ponto, mesmo que a bola fosse para fora.",
      "quiz.medium.11.q":"O que sucede se o servidor lança a bola e decide não a bater?",
      "quiz.medium.11.o0":"É automático 'let'",
      "quiz.medium.11.o1":"É falta e ponto para o adversário",
      "quiz.medium.11.o2":"Pode apanhar a bola e repetir",
      "quiz.medium.11.o3":"É aviso oral do árbitro",
      "quiz.medium.11.exp":"Se o servidor lançar a bola para o serviço e não a bater, é falta — o ponto vai para o adversário.",
      "quiz.medium.12.q":"Se a bola em jogo toca num objeto alheio (roupa do jogador, etc.), o que acontece?",
      "quiz.medium.12.o0":"Ponto para o adversário",
      "quiz.medium.12.o1":"É 'let'",
      "quiz.medium.12.o2":"O ponto é repetido",
      "quiz.medium.12.o3":"Depende do árbitro",
      "quiz.medium.12.exp":"Se a bola em jogo tocar qualquer coisa que não seja a rede, os seus suportes ou a mesa, o ponto vai para o adversário.",
      "quiz.medium.13.q":"Qual é a altura mínima do teto ou obstáculo acima da mesa em competições ITTF?",
      "quiz.medium.13.o0":"3 m",
      "quiz.medium.13.o1":"4 m",
      "quiz.medium.13.o2":"5 m",
      "quiz.medium.13.o3":"6 m",
      "quiz.medium.13.exp":"A ITTF recomenda pelo menos 5 metros de espaço livre acima da mesa para competições internacionais.",
      "quiz.medium.14.q":"Em pares, após cada set, como muda a ordem de serviço?",
      "quiz.medium.14.o0":"Mantém-se igual",
      "quiz.medium.14.o1":"O recetor do último serviço torna-se servidor",
      "quiz.medium.14.o2":"O parceiro do servidor torna-se o próximo servidor",
      "quiz.medium.14.o3":"Escolha livre dos jogadores",
      "quiz.medium.14.exp":"Em pares, o par que recebeu no set anterior passará a servir, e o jogador que serviu por último passará a receber.",
      "quiz.hard.0.q":"Segundo o regulamento ITTF, quais as cores obrigatórias dos revestimentos (borrachas) de uma raquete?",
      "quiz.hard.0.o0":"Um lado vermelho, outro lado preto",
      "quiz.hard.0.o1":"Qualquer cor, desde que diferentes",
      "quiz.hard.0.o2":"Azul e vermelho",
      "quiz.hard.0.o3":"Verde e preto",
      "quiz.hard.0.exp":"O regulamento ITTF exige que os dois lados da raquete sejam obrigatoriamente um vermelho e um preto, para que o adversário possa distinguir os revestimentos.",
      "quiz.hard.1.q":"Qual a espessura máxima do revestimento (borracha + esponja) numa raquete aprovada ITTF?",
      "quiz.hard.1.o0":"3 mm",
      "quiz.hard.1.o1":"3,5 mm",
      "quiz.hard.1.o2":"4 mm",
      "quiz.hard.1.o3":"5 mm",
      "quiz.hard.1.exp":"A espessura total de cada lado do revestimento (borracha mais esponja, se existir) não pode exceder 4 mm.",
      "quiz.hard.2.q":"O que significa 'ITTF approved' numa bola?",
      "quiz.hard.2.o0":"Bola fabricada em China",
      "quiz.hard.2.o1":"Bola testada e homologada pela ITTF para competições internacionais",
      "quiz.hard.2.o2":"Bola usada nos Jogos Olímpicos",
      "quiz.hard.2.o3":"Bola de 38 mm (formato antigo)",
      "quiz.hard.2.exp":"'ITTF approved' significa que a bola foi testada e está na lista de produtos aprovados pela ITTF, cumprindo todos os critérios de tamanho, peso, redondeza e cor.",
      "quiz.hard.3.q":"Segundo a ITTF, pode-se usar revestimentos anti-spin (lisos) na raquete?",
      "quiz.hard.3.o0":"Sim, desde que sejam aprovados pela ITTF",
      "quiz.hard.3.o1":"Não, são proibidos em todas as competições",
      "quiz.hard.3.o2":"Só em competições nacionais",
      "quiz.hard.3.o3":"Apenas num dos lados",
      "quiz.hard.3.exp":"Revestimentos anti-spin (pimple-out ou lisos) são permitidos desde que estejam na lista aprovada pela ITTF. A lista de borrachas homologadas é publicada e atualizada regularmente.",
      "quiz.hard.4.q":"Num torneio ITTF, se um jogador parte a raquete durante o jogo, o que pode fazer?",
      "quiz.hard.4.o0":"Continuar com qualquer raquete disponível",
      "quiz.hard.4.o1":"Deve sair do torneio",
      "quiz.hard.4.o2":"Pode substituí-la por uma pré-aprovada pelo árbitro",
      "quiz.hard.4.o3":"Pede 5 minutos de pausa para substituir",
      "quiz.hard.4.exp":"Se a raquete ficar inutilizável, o jogador pode substituí-la, mas a raquete substituta deve ser aprovada pelo árbitro.",
      "quiz.hard.5.q":"Qual é o procedimento correto da inspeção de raquetes em competições ITTF?",
      "quiz.hard.5.o0":"Apenas o árbitro principal inspeciona antes da final",
      "quiz.hard.5.o1":"Os jogadores mostram as raquetes ao adversário e ao árbitro antes do início do jogo",
      "quiz.hard.5.o2":"Só se houver protesto do adversário",
      "quiz.hard.5.o3":"Só em competições com classificação mundial",
      "quiz.hard.5.exp":"Em competições ITTF, cada jogador deve mostrar a sua raquete ao adversário e ao árbitro antes do início do jogo (e após o jogo, se solicitado).",
      "quiz.hard.6.q":"Em condições normais, a que intervalo muda a bola num match de competição ITTF?",
      "quiz.hard.6.o0":"Cada set",
      "quiz.hard.6.o1":"Cada 3 pontos",
      "quiz.hard.6.o2":"Início de cada jogo ou quando danificada",
      "quiz.hard.6.o3":"Nunca, só por dano",
      "quiz.hard.6.exp":"A bola é substituída no início de cada jogo (match) ou quando está visivelmente danificada durante o jogo.",
      "quiz.hard.7.q":"O que diz a regra ITTF sobre o uso de substâncias na raquete ('speed glue')?",
      "quiz.hard.7.o0":"É permitido com aprovação prévia",
      "quiz.hard.7.o1":"Está completamente proibido desde 2008",
      "quiz.hard.7.o2":"É permitido apenas em competições nacionais",
      "quiz.hard.7.o3":"Necessita de certificado médico",
      "quiz.hard.7.exp":"O uso de cola rápida (speed glue) e adesivos com solventes orgânicos foi proibido pela ITTF em 2008. Só são permitidos adesivos aquosos (water-based).",
      "quiz.hard.8.q":"Segundo as regras ITTF, o que é uma 'bad service' (serviço inválido) não corrigida pelo árbitro após advertência?",
      "quiz.hard.8.o0":"Ponto imediato para o adversário",
      "quiz.hard.8.o1":"Segundo serviço",
      "quiz.hard.8.o2":"Let repetido",
      "quiz.hard.8.o3":"Desclassificação",
      "quiz.hard.8.exp":"Após advertência por mau serviço, qualquer serviço subsequente inválido resulta em ponto direto para o adversário, sem necessidade de nova advertência.",
      "quiz.hard.9.q":"Qual é a regra ITTF sobre o 'time-out' (pausa) num jogo?",
      "quiz.hard.9.o0":"Não é permitido time-out",
      "quiz.hard.9.o1":"Cada equipa tem 2 time-outs por jogo",
      "quiz.hard.9.o2":"Cada jogador/equipa tem direito a 1 time-out de 1 minuto por jogo",
      "quiz.hard.9.o3":"Só o árbitro pode interromper o jogo",
      "quiz.hard.9.exp":"Cada jogador (ou equipa em pares) tem direito a um time-out de 1 minuto por match (não por set). Pode ser pedido em qualquer momento, exceto durante o serviço.",
      "quiz.hard.10.q":"O que prevê o regulamento ITTF sobre o treinador (coach) durante o jogo?",
      "quiz.hard.10.o0":"O treinador pode dar instruções em qualquer momento",
      "quiz.hard.10.o1":"O treinador só pode dar instruções durante os intervalos entre sets e durante os time-outs",
      "quiz.hard.10.o2":"O treinador pode entrar na área de jogo",
      "quiz.hard.10.o3":"Não há regulação sobre o comportamento do treinador",
      "quiz.hard.10.exp":"O treinador só pode comunicar com o jogador durante os intervalos entre sets e durante os time-outs solicitados. Não é permitido qualquer tipo de instrução durante o jogo em si.",
      "quiz.hard.11.q":"O que são 'pimples-out' (espinhos para fora) num revestimento de raquete?",
      "quiz.hard.11.o0":"Revestimento com espinhos virados para dentro",
      "quiz.hard.11.o1":"Revestimento completamente liso",
      "quiz.hard.11.o2":"Revestimento com espinhos virados para fora, sem camada de esponja atrás",
      "quiz.hard.11.o3":"Borracha especial para defesa",
      "quiz.hard.11.exp":"'Pimples-out' (OX ou sem esponja) é um revestimento com os espinhos de borracha virados para fora. Reduz o efeito (spin) mas melhora o controlo. É permitido pela ITTF se aprovado.",
      "quiz.hard.12.q":"Quantos minutos de intervalo são permitidos entre sets num jogo ITTF?",
      "quiz.hard.12.o0":"1 minuto",
      "quiz.hard.12.o1":"2 minutos",
      "quiz.hard.12.o2":"3 minutos",
      "quiz.hard.12.o3":"5 minutos",
      "quiz.hard.12.exp":"O intervalo entre sets num jogo ITTF tem a duração máxima de 1 minuto.",
      "quiz.hard.13.q":"O que é o 'phantom serve' e qual é a sua situação regulamentar?",
      "quiz.hard.13.o0":"Serviço invisível, permitido",
      "quiz.hard.13.o1":"Serviço em que a raquete não toca claramente a bola, proibido",
      "quiz.hard.13.o2":"Serviço com rotação excessiva, limitada a 3000 RPM",
      "quiz.hard.13.o3":"Serviço com bola lançada mais de 30 cm, obrigatório",
      "quiz.hard.13.exp":"O 'phantom serve' esconde o contato da bola com a raquete (com o corpo ou braço livre), impossibilitando o adversário de ver o momento do impacto. É proibido pelas regras ITTF.",
      "quiz.hard.14.q":"Em competições ITTF, o que especifica a regra sobre a iluminação da área de jogo?",
      "quiz.hard.14.o0":"Mínimo de 200 lux",
      "quiz.hard.14.o1":"Mínimo de 500 lux",
      "quiz.hard.14.o2":"Mínimo de 1000 lux no plano da mesa, sem luz natural direta",
      "quiz.hard.14.o3":"Sem requisitos específicos",
      "quiz.hard.14.exp":"A ITTF recomenda pelo menos 1000 lux uniformemente sobre a superfície da mesa, sem luz solar direta, para competições internacionais."
    },
    de: {
      "menu.newGame":"Neues Spiel",
      "menu.newGameSub":"Spieler wählen und starten",
      "menu.tournament":"Turnier",
      "menu.tournamentSub":"K.o.-System, automatisch gesetzt",
      "menu.players":"Spieler",
      "menu.playersSub":"Verwalten und Statistiken ansehen",
      "menu.history":"Verlauf",
      "menu.historySub":"Vergangene Spiele",
      "menu.data":"Daten",
      "menu.dataSub":"Backup exportieren oder importieren",
      "menu.footer":"Daten nur auf diesem Gerät gespeichert",
      "screen.players":"Spieler",
      "screen.history":"Verlauf",
      "screen.gameDetail":"Spieldetail",
      "screen.newGame":"Neues Spiel",
      "screen.gameType":"Spieltyp",
      "screen.pointsFormat":"Punkte und Format",
      "screen.newTournament":"Neues Turnier",
      "screen.tournament":"Turnier",
      "screen.minigames":"Minispiele",
      "screen.achievements":"Erfolge",
      "screen.records":"Rekorde",
      "screen.data":"Daten",
      "btn.addPlayer":"＋ Neu",
      "btn.deletePlayer":"Löschen",
      "btn.abandon":"Abbrechen",
      "btn.continue":"Weiter ▸",
      "btn.startGame":"Spiel starten",
      "btn.createTournament":"Turnier erstellen",
      "btn.backMenu":"Zurück zum Menü",
      "btn.start":"Starten",
      "serve.title":"AUFSCHLAG",
      "serve.hint":"schlägt auf",
      "setup.bluePlayer":"Blaue Seite",
      "setup.whitePlayer":"Weiße Seite",
      "setup.pointsPerSet":"Punkte pro Satz",
      "setup.format":"Format",
      "mg.tap":"Schnelle Tipper",
      "mg.tapSub":"Tippe die Punkte bevor sie verschwinden",
      "mg.memory":"Visuelles Gedächtnis",
      "mg.memorySub":"Merken und Sequenz wiederholen",
      "ach.unlocked":"🏆 ERFOLG FREIGESCHALTET!",
      "data.export":"Backup exportieren",
      "data.exportSub":"Erzeugt eine .json-Datei mit allem",
      "data.import":"Backup importieren",
      "data.importSub":"Daten hinzufügen oder zusammenführen",
      "data.wipe":"Alle Daten löschen",
      "data.wipeSub":"Entfernt Spieler und Verlauf von diesem Gerät",
      "js.choosePlayer":"Spieler wählen",
      "js.sideBlue":"Blau",
      "js.sideWhite":"Weiß",
      "js.continue":"Trotzdem weiter ▸",
      "js.nextSet":"Nächster Satz ▸",
      "js.undoMsg":"Letzter Punkt zurückgenommen — du kannst weiterspielen.",
      "js.setInProgress":"Der laufende Satz (%b-%w) wird nicht gezählt. Abgeschlossene Sätze bleiben im Verlauf.",
      "js.confirmEnd":"Das aktuelle Ergebnis wird im Verlauf gespeichert.",
      "js.confirmWipe":"Alle Daten löschen?",
      "js.confirmAbandon":"Turnier abbrechen?",
      "js.emptyPlayers":"Erst Spieler anlegen.",
      "js.noData":"Noch keine Daten",
      "js.wins":"Siege",
      "js.losses":"Niederlagen",
      "js.draws":"Unentschieden",
      "js.capotes":"Klatsche",
      "js.winRate":"S%",
      "js.elo":"Rating",
      "js.allPlayers":"Alle Spieler",
      "js.serve":"Aufschlag",
      "js.notServe":"Kein Aufschlag",
      "js.set":"Satz",
      "js.bestOf":"Best of",
      "js.free":"Offen",
      "js.classic":"Klassisch",
      "js.custom":"Benutzerdefiniert",
      "js.gameWon":"%n hat das Spiel gewonnen",
      "js.setWon":"%n hat den Satz gewonnen",
      "js.deuce":"EINSTAND",
      "js.matchPoint":"MATCHBALL",
      "js.capoteTag":"Klatsche",
      "js.newRecord":"🏆 Neuer Rekord!",
      "js.points":"Punkte",
      "js.level":"Level",
      "js.levelReached":"Erreichtes Level",
      "js.playAgain":"Nochmal spielen",
      "js.tbd":"Noch offen",
      "js.play":"▶ SPIELEN",
      "js.whoseServe":"Satz %n · wer schlägt auf?",
      "js.champion":"🏆 Turniersieger",
      "js.winsLabel":"S",
      "js.lossesLabel":"N",
      "js.drawsLabel":"U",
      "js.capotesLabel":"Kl.",
      "js.winRateLabel":"S%",
      "js.eloLabel":"Rating",
      "js.bestRival":"Bester Gegner",
      "js.worstRival":"Schlechtester Gegner",
      "js.last10":"Letzte 10 Spiele",
      "js.streak":"Aktuelle Serie",
      "js.setsWon":"Gewonnene Sätze",
      "js.setsLost":"Verlorene Sätze",
      "js.capotesMade":"Klatschen gegeben",
      "js.capotesSuffered":"Klatschen erhalten",
      "js.tournamentsWon":"Gewonnene Turniere",
      "js.tournamentsPlayed":"Gespielte Turniere",
      "js.trainingMin":"Min. Training",
      "js.trainingSessions":"Einheiten",
      "js.importReplace":"Alles ersetzen",
      "js.importMerge":"Zu vorhandenen Daten hinzufügen",
      "js.importDetailFile":"Die Datei hat %p Spieler und %g Spiele.",
      "js.importDetailMerge":"<strong>Hinzufügen</strong> bringt %np neue Spieler und %ng neue Spiele (gleiche Namen werden zusammengeführt; Duplikate ignoriert).",
      "js.importDetailReplace":"<strong>Alles ersetzen</strong> löscht die aktuellen %p Spieler und %g Spiele und behält nur die Datei.",
      "js.recElo":"Höchstes Rating",
      "js.recStreak":"Längste Serie",
      "js.recWins":"Meiste Siege",
      "js.recCapotes":"Meiste Klatschen",
      "js.recTournaments":"Meiste Turniersiege",
      "js.recPoints":"Meiste Punkte",
      "js.recDuration":"Längstes Spiel",
      "js.recMgTap":"Schnelle-Tipper-Rekord",
      "js.recMgMemory":"Gedächtnis-Rekord",
      "js.recEloGain":"Größter Rating-Anstieg",
      "js.wins_unit":"Siege",
      "js.min_unit":"Min",
      "js.pts_unit":"Pkt",
      "js.roundQF":"Viertelfinale",
      "js.roundSF":"Halbfinale",
      "js.roundF":"Finale",
      "js.serveEvery2":"Aufschlag alle 2 Punkte",
      "js.serveEvery5":"Aufschlag alle 5 Punkte",
      "js.serveEvery1":"Aufschlag jeden Punkt (Einstand)",
      "js.eraseConfirm":"Sicher? Diese Aktion kann nicht rückgängig gemacht werden.",
      "js.missedGame":"Versehen — letzten Punkt rückgängig machen",
      "js.gameInProgress":"Du hast ein laufendes Spiel",
      "js.tournamentInProgress":"Du hast ein laufendes Turnier",
      "js.resumeGame":"Spiel fortsetzen ▸",
      "js.resumeTournament":"Turnier fortsetzen ▸",
      "js.endOfSet":"SATZENDE",
      "js.endOfSetCapote":"SATZENDE · KLATSCHE",
      "js.endOfSetDeciding":"SATZENDE · SPIEL ENTSCHIEDEN",
      "js.endOfSetCapoteDeciding":"SATZENDE · KLATSCHE · SPIEL ENTSCHIEDEN",
      "js.endOfGame":"SPIELENDE",
      "js.endOfGameCapote":"SPIELENDE · KLATSCHE",
      "js.drawBetween":"Unentschieden zwischen",
      "js.chooseBlue":"Wählen — Blaue Seite",
      "js.chooseWhite":"Wählen — Weiße Seite",
      "js.noPlayersYet":"Noch keine Spieler angelegt.<br>Gehe zurück ins Menü und lege zuerst Spieler an.",
      "js.trainingTitle":"Trainingsmodus",
      "js.trainingFree":"Freier Timer",
      "js.trainingTimed":"Zeitgesteuertes Training",
      "js.trainingModeFree":"FREIER MODUS",
      "js.trainingModeTimed":"TRAINING %n MIN",
      "js.mgMemorize":"Merken!",
      "js.mgYourTurn":"Du bist dran!",
      "js.mgPoints":"Punkte:",
      "js.mgLevel":"Level",
      "js.mgLevelReached":"Erreichtes Level:",
      "js.mgRecord":"Rek:",
      "js.mgMemoryTitle":"Visuelles Gedächtnis",
      "js.achSecret":"Geheimen Erfolg freigeschaltet!",
      "js.achSecretDesc":"Geheimer Erfolg. Weiterspielen, um ihn zu entdecken.",
      "js.cancel":"Abbrechen",
      "js.save":"Speichern",
      "js.undo":"Letzten Punkt rückgängig",
      "js.pause":"Timer pausieren",
      "js.modeCustom":"Benutzerdefiniert",
      "js.modeClassic":"Klassisch",
      "js.modeClassicDesc":"11 Punkte pro Satz · BO3, BO5 oder BO7",
      "js.formatFree":"Offen",
      "js.formatBo3":"Best of 3",
      "js.formatBo5":"Best of 5",
      "js.formatBo7":"Best of 7",
      "js.setBalanced":"Sehr ausgeglichener Satz",
      "js.descPlaceholder":"Z.B.: Sommerturnier, Spielraum...",
      "js.shortcutTraining":"Trainingsmodus",
      "js.shortcutMinigames":"Minispiele",
      "js.shortcutAchievements":"Erfolge",
      "js.shortcutRecords":"Rekorde",
      "js.setLabel":"SATZ",
      "js.noHistory":"Noch keine Spiele im Verlauf.",
      "js.catFirstSteps":"Erste Schritte",
      "js.catWins":"Siege",
      "js.catSets":"Sätze",
      "js.catComebacks":"Comebacks",
      "js.catElo":"Rating",
      "js.catPoints":"Punkte",
      "js.catTournaments":"Turniere",
      "js.catRivalries":"Rivalitäten",
      "js.catTraining":"Training",
      "js.catMinigames":"Minispiele",
      "js.catSpecials":"Besondere",
      "js.noDataYet":"Noch keine Daten",
      "js.bracketTbd":"Noch offen",
      "js.noPlayersEmpty":"Noch keine Spieler.<br>Tippe auf '＋ Neu', um den ersten hinzuzufügen.",
      "js.leaderboard":"Bestenliste · Top %n",
      "js.playerCol":"Spieler",
      "js.gamesUnit":"%n Spiele",
      "js.noGamesProfile":"Noch keine Spiele aufgezeichnet.",
      "js.resultDraw":"Unentschieden",
      "js.resultWon":"Gewonnen",
      "js.resultLost":"Verloren",
      "js.gamesDisputed":"%n Spiel(e)",
      "js.headToHead":"Direktvergleich",
      "js.recentGames":"Letzte Spiele",
      "js.scorerColor":"Farbe auf dem Spielstand",
      "js.eloLabel2":"ELO (Spaß)",
      "js.statGamesPlayed":"Gespielte Spiele",
      "js.statGamesWon":"Gewonnene Spiele",
      "js.statGamesLost":"Verlorene Spiele",
      "js.statGamesDrawn":"Unentschieden",
      "js.statSetsWonV":"Gewonnene Sätze (Siege)",
      "js.statSetsLostD":"Verlorene Sätze (Niederlagen)",
      "js.statTotalSetsWon":"Sätze gewonnen gesamt",
      "js.statTotalSetsLost":"Sätze verloren gesamt",
      "js.statCapotesMade":"Klatschen gegeben",
      "js.statCapotesSuffered":"Klatschen erhalten",
      "js.statTournamentsWon":"Turniere gewonnen",
      "js.statTournamentsTotal":"Turniere gesamt",
      "js.bestRivalAgainst":"Meiste Siege gegen (%n)",
      "js.worstRivalAgainst":"Meiste Niederlagen gegen (%n)",
      "js.noHistoryYet":"Noch keine Spiele im Verlauf.<br>Spiel das erste Match, um es hier zu sehen.",
      "js.draw":"UNENTSCHIEDEN",
      "js.setsSep":"SÄTZE",
      "js.xCapote":"%nx Klatsche",
      "js.modeFree":"FREI",
      "js.modeMd3":"BO3",
      "js.modeMd5":"BO5",
      "js.modeMd7":"BO7",
      "js.gameEndedDraw":"Spiel endete unentschieden",
      "js.setsWonBy":"Sätze (%n gewann das Spiel)",
      "js.ptsPerSet":"Punkte pro Satz",
      "js.duration":"Dauer",
      "js.setRecap":"Satz %n",
      "js.undoToast":"Letzter Punkt rückgängig — du kannst den Satz fortsetzen.",
      "js.statsSaved":"Gespeicherte Spieler",
      "js.gamesInHistory":"Spiele im Verlauf",
      "js.exportedToast":"Backup exportiert: %f",
      "js.importedToast":"Importiert: %p Spieler, %g Spiele",
      "js.invalidFile":"Ungültige oder beschädigte Datei.",
      "js.cantReadFile":"Datei konnte nicht gelesen werden.",
      "js.invalidFormat":"Ungültige Datei: unerwartetes Format.",
      "js.invalidBackup":"Ungültige Datei: kein PLACAR-Backup.",
      "js.replacedToast":"Daten erfolgreich ersetzt.",
      "js.wipedToast":"Alle Daten wurden gelöscht.",
      "js.createPlayersFirst":"Erstelle zuerst Spieler.",
      "js.roundLabel":"Runde %n",
      "js.tournamentWinnerSub":"%m Spiele · %p Spieler",
      "js.choosePlayerFirst":"Wähle zuerst einen Spieler",
      "js.recMgMemory2":"Rekord Visuelles Gedächtnis",
      "js.recMorePoints":"Meiste gesammelte Punkte",
      "js.recMoreTraining":"Meiste Trainingszeit",
      "js.levelPrefix":"Level ",
      "js.winsUnit":" Siege",
      "js.capotesUnit":" Klatschen",
      "js.tournamentsUnit":" Turniere",
      "js.pointsUnit":" Punkte",
      "js.minUnit":" Min",
      "js.achProgressText":"%d / %t Erfolge",
      "js.setup.pts11":"11 Punkte",
      "js.setup.pts21":"21 Punkte",
      "js.overlay.endGameTitle":"SPIEL BEENDEN",
      "js.overlay.confirmEnd":"Spielende bestätigen?",
      "js.overlay.confirmEndBtn":"Beenden",
      "js.data.backup":"Backup",
      "js.data.wipeAll":"Alles löschen",
      "js.mg.playAs":"Spielen als",
      "js.tournament.size":"Größe",
      "js.tournament.mode":"Modus",
      "js.mode.customDesc":"11 oder 21 Punkte · offen, BO3 oder BO5 · Aufschlag wechselt alle 5 Punkte",
      "mg.quiz":"Regelquiz",
      "mg.quizSub":"Teste dein ITTF-Regelwissen",
      "mg.rules":"ITTF-Regeln",
      "mg.rulesSub":"Alle offiziellen Tischtennis-Regeln",
      "js.mgQuizScore":"Punkte:",
      "js.mgQuizIntro":"Wähle den Schwierigkeitsgrad",
      "js.mgQuizEasy":"Leicht",
      "js.mgQuizEasyDesc":"Grundregeln des Spiels",
      "js.mgQuizMedium":"Mittel",
      "js.mgQuizMediumDesc":"Aufschlag- und Punktregeln",
      "js.mgQuizHard":"Schwer",
      "js.mgQuizHardDesc":"Regelwerk und Turniere",
      "js.mgQuizBestScore":"Bestes Ergebnis:",
      "js.mgQuizNext":"Weiter ▸",
      "js.mgQuizFinalScore":"Endergebnis:",
      "js.mgQuizCorrect":"Richtig! ✓",
      "js.mgQuizWrong":"Falsch ✗",
      "js.mgQuizChooseFirst":"Wähle zuerst einen Spieler",
      "js.mgQuizResultGreat":"Ausgezeichnet! Du kennst die Regeln sehr gut!",
      "js.mgQuizResultGood":"Gut gemacht! Lerne weiter die Regeln.",
      "js.mgQuizResultTry":"Übe weiter und lies die ITTF-Regeln.",
      "js.langBtn":"Sprache",
      "js.settingsBtn":"Einstellungen",
      "js.descLabel":"Beschreibung",
      "js.optional":"(optional)",
      "js.nPlayers4":"4 Spieler",
      "js.nPlayers8":"8 Spieler",
      "js.nPlayers16":"16 Spieler",
      "js.trainingDuration":"Dauer (Minuten)",
      "js.back":"‹ Zurück",
      "js.gameEndedTitle":"SPIEL BEENDET",
      "js.backToMenu":"Zurück zum Menü",
      "js.newPlayerTitle":"NEUER SPIELER",
      "js.newPlayerName":"Spielername",
      "js.playerNamePlaceholder":"Z.B.: Markus",
      "js.colorPickerLabel":"Farbe auf dem Spielstand",
      "js.color.blueWhite":"Blau / Weiß",
      "js.color.greenWhite":"Grün / Weiß",
      "js.color.redWhite":"Rot / Weiß",
      "js.color.pinkWhite":"Pink / Weiß",
      "js.color.purpleWhite":"Lila / Weiß",
      "js.color.goldWhite":"Gold / Weiß",
      "js.color.whiteBlack":"Weiß / Schwarz",
      "js.color.orangeWhite":"Orange / Weiß",
      "js.dataExplain":"Speichere Spieler und Verlauf in einer Datei, die du in der Cloud (Drive, E-Mail usw.) aufbewahren und zum Wiederherstellen auf diesem oder einem anderen Gerät verwenden kannst.",
      "js.importTitle":"DATEN IMPORTIEREN",
      "js.importQuestion":"Was möchtest du tun?",
      "js.importDetail":"Dies ersetzt die bereits auf diesem Gerät gespeicherten Spieler und den Spielverlauf.",
      "js.mergeImport":"Zu vorhandenen Daten hinzufügen",
      "js.replaceImport":"Alles ersetzen",
      "js.wipeTitle":"ALLES LÖSCHEN",
      "js.wipeQuestion":"Alle Daten löschen?",
      "js.wipeDetail":"Diese Aktion kann nicht rückgängig gemacht werden. Erwäge zuerst ein Backup zu exportieren.",
      "js.wipeConfirm":"Alles löschen",
      "js.rotateHint":"Tablet ins Querformat drehen",
      "js.overlay.confirmEndDetail":"Das aktuelle Ergebnis wird im Verlauf gespeichert.",
      "ach.first_point.name":"Erster Punkt",
      "ach.first_point.desc":"Erziele deinen ersten Punkt.",
      "ach.first_set.name":"Erstes Set",
      "ach.first_set.desc":"Gewinne dein erstes Set.",
      "ach.first_win.name":"Erster Sieg",
      "ach.first_win.desc":"Gewinne dein erstes Spiel.",
      "ach.first_tournament.name":"Erstes Turnier",
      "ach.first_tournament.desc":"Nimm an deinem ersten Turnier teil.",
      "ach.first_trophy.name":"Erste Trophäe",
      "ach.first_trophy.desc":"Gewinne dein erstes Turnier.",
      "ach.wins_10.name":"10 Siege",
      "ach.wins_10.desc":"Gewinne 10 Spiele.",
      "ach.wins_50.name":"50 Siege",
      "ach.wins_50.desc":"Gewinne 50 Spiele.",
      "ach.wins_100.name":"100 Siege",
      "ach.wins_100.desc":"Gewinne 100 Spiele.",
      "ach.wins_200.name":"200 Siege",
      "ach.wins_200.desc":"Gewinne 200 Spiele.",
      "ach.streak_3.name":"Hat-trick",
      "ach.streak_3.desc":"3 Siege in Folge.",
      "ach.streak_5.name":"In Form",
      "ach.streak_5.desc":"5 Siege in Folge.",
      "ach.streak_10.name":"Unaufhaltsam",
      "ach.streak_10.desc":"10 Siege in Folge.",
      "ach.streak_20.name":"Unbesiegbar",
      "ach.streak_20.desc":"20 Siege in Folge.",
      "ach.sweep.name":"Besen",
      "ach.sweep.desc":"Gewinne ein Spiel ohne ein Set zu verlieren.",
      "ach.capote_set.name":"Shutout",
      "ach.capote_set.desc":"Gewinne ein Set 11-0.",
      "ach.set_perfect.name":"Perfektes Set",
      "ach.set_perfect.desc":"Gewinne ein Set mit maximal 3 zugelassenen Punkten.",
      "ach.deciding_set.name":"Entscheidung",
      "ach.deciding_set.desc":"Gewinne ein Spiel, das im letzten Set entschieden wird.",
      "ach.comeback.name":"Comeback",
      "ach.comeback.desc":"Gewinne ein Spiel nach Verlust des 1. Sets.",
      "ach.comeback_02.name":"Großes Comeback",
      "ach.comeback_02.desc":"Gewinne ein Spiel nach 0:2 in Sets.",
      "ach.comeback_pts.name":"Niemals Aufgeben",
      "ach.comeback_pts.desc":"Gewinne ein Set nach 5+ Punkten Rückstand.",
      "ach.elo_1000.name":"Vierstellig",
      "ach.elo_1000.desc":"Erreiche 1000 ELO.",
      "ach.elo_1200.name":"1200 Club",
      "ach.elo_1200.desc":"Erreiche 1200 ELO.",
      "ach.elo_1300.name":"Elite",
      "ach.elo_1300.desc":"Erreiche 1300 ELO.",
      "ach.elo_1500.name":"Meister",
      "ach.elo_1500.desc":"Erreiche 1500 ELO.",
      "ach.pts_100.name":"Hundert",
      "ach.pts_100.desc":"Sammle 100 Punkte.",
      "ach.pts_500.name":"500 Punkte",
      "ach.pts_500.desc":"Sammle 500 Punkte.",
      "ach.pts_1000.name":"1000 Punkte",
      "ach.pts_1000.desc":"Sammle 1000 Punkte.",
      "ach.tour_2.name":"Doppelsieger",
      "ach.tour_2.desc":"Gewinne 2 Turniere.",
      "ach.tour_3.name":"Dreifachsieger",
      "ach.tour_3.desc":"Gewinne 3 Turniere.",
      "ach.rival_10.name":"Klassiker",
      "ach.rival_10.desc":"Spiele 10 Matches gegen denselben Gegner.",
      "ach.rival_25.name":"Rivalität",
      "ach.rival_25.desc":"Spiele 25 Matches gegen denselben Gegner.",
      "ach.rival_dom.name":"Dominanz",
      "ach.rival_dom.desc":"10 Siege Vorsprung gegen denselben Gegner.",
      "ach.rival_5.name":"Henker",
      "ach.rival_5.desc":"5 Siege in Folge gegen denselben Gegner.",
      "ach.train_first.name":"Erstes Training",
      "ach.train_first.desc":"Schließe eine Trainingseinheit ab.",
      "ach.train_10m.name":"10 Minuten",
      "ach.train_10m.desc":"Sammle 10 Minuten Training.",
      "ach.train_1h.name":"1 Stunde",
      "ach.train_1h.desc":"Sammle 60 Minuten Training.",
      "ach.train_5sess.name":"Disziplin",
      "ach.train_5sess.desc":"Schließe 5 Trainingseinheiten ab.",
      "ach.mg_tap_10.name":"Stahlreflexe",
      "ach.mg_tap_10.desc":"Erziele 10 Punkte in Schnell-Tippen.",
      "ach.mg_tap_30.name":"Blitz",
      "ach.mg_tap_30.desc":"Erziele 30 Punkte in Schnell-Tippen.",
      "ach.mg_mem_5.name":"Solides Gedächtnis",
      "ach.mg_mem_5.desc":"Erreiche Level 5 im Visuellen Gedächtnis.",
      "ach.mg_mem_10.name":"Eisernes Gedächtnis",
      "ach.mg_mem_10.desc":"Erreiche Level 10 im Visuellen Gedächtnis.",
      "ach.secret_11_0.name":"Demütigung",
      "ach.secret_11_0.desc":"Gewinne ein Set 11-0.",
      "ach.secret_3_2.name":"Bis ans Limit",
      "ach.secret_3_2.desc":"Gewinne ein Spiel, das im 5. Set entschieden wird.",
      "ach.secret_11_9.name":"Punkt für Punkt",
      "ach.secret_11_9.desc":"Gewinne ein Set 11-9.",
      "ach.secret_midnight.name":"Nachtsitzung",
      "ach.secret_midnight.desc":"Spiele nach Mitternacht.",
      "ach.secret_morning.name":"Frühaufsteher",
      "ach.secret_morning.desc":"Spiele vor 08:00.",
      "ach.secret_10day.name":"Maschine",
      "ach.secret_10day.desc":"Spiele 10 Spiele am selben Tag.",
      "rules.jogo.title":"Das Spiel — Allgemeine Regeln",
      "rules.jogo.r0":"Ein Satz wird von dem Spieler gewonnen, der zuerst 11 Punkte erreicht, mit einem Mindestvorsprung von 2 Punkten.",
      "rules.jogo.r1":"Ein Match wird von dem Spieler gewonnen, der die meisten Sätze im festgelegten Format gewinnt (Best of 3, 5 oder 7).",
      "rules.jogo.r2":"Der Spieler, der einen Punkt erzielt, hat das nächste Aufschlagrecht (oder behält es gemäß Rotation).",
      "rules.jogo.r3":"Berührt der Spielball irgendeinen Körperteil außer der Schlägerhand, geht der Punkt verloren.",
      "rules.jogo.r4":"Die freie Hand (ohne Schläger) DARF die Spielfläche während eines Austauschs NICHT berühren — Punkt an den Gegner.",
      "rules.jogo.r5":"Berührt der Ball die Oberkante des Tisches (Kantenschlag), ist der Punkt gültig.",
      "rules.jogo.r6":"Berührt der Ball die Seite des Tisches, geht der Punkt an den Gegner — diese ist kein Spielbereich.",
      "rules.jogo.r7":"Ein Spieler darf den Ball nicht schlagen, bevor er auf seiner Tischhälfte aufgeprallt ist (kein Volley).",
      "rules.jogo.r8":"Das Spiel kann bei einer nachweisbaren Verletzung, Ausrüstungspanne oder aus einem anderen vom Schiedsrichter anerkannten Grund unterbrochen werden.",
      "rules.jogo.r9":"Nach 10 Minuten Spiel in einem Satz (ohne dass ein Spieler 9 Punkte erreicht), gilt das Beschleunigungssystem: Der Punkt geht an den Aufnehmenden, wenn der Aufschläger nicht innerhalb von 13 Schlägen gewinnt.",
      "rules.servico.title":"Aufschlag",
      "rules.servico.r0":"Beim Aufschlag muss der Ball auf der offenen, unbewegten Handfläche der freien Hand über der Tischoberfläche liegen.",
      "rules.servico.r1":"Der Ball muss nahezu senkrecht mindestens 16 cm hochgeworfen werden, ohne Drall.",
      "rules.servico.r2":"Der Aufschläger muss den Ball auf dem Weg nach unten so treffen, dass er zuerst die eigene Tischhälfte und dann die gegnerische berührt.",
      "rules.servico.r3":"Im Einzel kann der Ball überall auf der gegnerischen Tischhälfte landen.",
      "rules.servico.r4":"Im Doppel muss der Aufschlag diagonal erfolgen: von der rechten Hälfte des Aufschlägers zur rechten Hälfte des Aufnehmenden.",
      "rules.servico.r5":"Der Kontakt des Balls mit dem Schläger muss für den Gegner und den Schiedsrichter sichtbar sein — er darf nicht durch den Körper verdeckt werden.",
      "rules.servico.r6":"Berührt der Ball beim Aufschlag das Netz und landet korrekt, ist es ein \"Let\" — der Aufschlag wird wiederholt.",
      "rules.servico.r7":"Nach einer Verwarnung führt jeder weitere illegale Aufschlag sofort zum Punktverlust.",
      "rules.servico.r8":"Wirft der Aufschläger den Ball zum Aufschlag hoch, trifft ihn aber nicht, geht der Punkt verloren.",
      "rules.servico.r9":"Beim Aufschlag muss der freie Arm über Tischniveau und für Schiedsrichter und Gegner sichtbar sein.",
      "rules.pontuacao.title":"Spielstand und Aufschlagwechsel",
      "rules.pontuacao.r0":"Der Aufschlag wechselt nach je 2 gespielten Punkten zwischen den Spielern.",
      "rules.pontuacao.r1":"Bei Einstand (10:10) wechselt der Aufschlag nach jedem Punkt, und ein 2-Punkte-Vorsprung ist zum Satzgewinn erforderlich.",
      "rules.pontuacao.r2":"Im Doppel muss die Aufschlag- und Aufnahmereihenfolge bis zum Satzende beibehalten werden; im nächsten Satz schlägt das aufnehmende Paar auf.",
      "rules.pontuacao.r3":"Der erste Aufschläger wird durch ein Losverfahren bestimmt (Münzwurf oder Seitenwahl).",
      "rules.pontuacao.r4":"Zu Beginn jedes Satzes wechseln die Spieler die Seiten; im Entscheidungssatz (letzter Satz) wechseln sie die Seiten, wenn ein Spieler 5 Punkte erreicht.",
      "rules.pontuacao.r5":"Im Doppel-Entscheidungssatz darf das aufnehmende Paar seine Aufnahmereihenfolge ändern.",
      "rules.pontuacao.r6":"Das Beschleunigungssystem ändert nichts am 2-Punkte-Aufschlagwechsel — es reduziert ihn lediglich auf einen 1-Punkt-Wechsel ab seiner Aktivierung.",
      "rules.pontuacao.r7":"Nach einem Aufschlag-Let wird der Aufschlag vollständig wiederholt (der Zähler rückt nicht vor).",
      "rules.equipamento.title":"Ausrüstung — Tisch und Netz",
      "rules.equipamento.r0":"Der Tisch ist 274 cm lang × 152,5 cm breit × 76 cm hoch.",
      "rules.equipamento.r1":"Die Spielfläche muss eben, gleichmäßig und mattfarbig sein (typischerweise blau oder grün) mit einer 2 cm breiten weißen Randlinie.",
      "rules.equipamento.r2":"Das Netz teilt den Tisch in zwei Hälften; es ist 15,25 cm hoch.",
      "rules.equipamento.r3":"Die Spielfläche umfasst nicht die Seitenflächen (seitliche Kanten) des Tisches.",
      "rules.equipamento.r4":"Der Tisch muss aus Holz oder ähnlichem Material bestehen, mit einem Abprallwert von 23 ± 1 cm bei einem Standard-Ball aus 30 cm Höhe.",
      "rules.equipamento.r5":"Die Mittellinie (2 mm breit) teilt den Tisch in zwei gleiche Hälften und gehört für Doppelaufschläge zur rechten Hälfte.",
      "rules.bola.title":"Ausrüstung — Ball",
      "rules.bola.r0":"Der Ball muss 40 mm Durchmesser (± 0,5 mm) haben und 2,7 g (± 0,1 g) wiegen.",
      "rules.bola.r1":"Der Ball muss weiß oder orange und matt sein.",
      "rules.bola.r2":"Bälle müssen aus Kunststoff bestehen (seit 2015, ersetzt Zelluloid).",
      "rules.bola.r3":"Ein beschädigter oder verformter Ball muss sofort ausgetauscht werden.",
      "rules.bola.r4":"Bei offiziellen Wettkämpfen dürfen nur ITTF-zugelassene Bälle verwendet werden.",
      "rules.raquete.title":"Ausrüstung — Schläger",
      "rules.raquete.r0":"Der Schläger kann beliebige Größe, Form oder Gewicht haben, aber das Blatt muss flach und starr sein.",
      "rules.raquete.r1":"Mindestens 85 % der Blattdicke muss aus Naturholz bestehen.",
      "rules.raquete.r2":"Jede Seite des Blatts muss mit einem ITTF-zugelassenen Belag versehen sein.",
      "rules.raquete.r3":"Beide Seiten des Blatts müssen unterschiedliche Farben haben: eine rot und eine schwarz.",
      "rules.raquete.r4":"Der Spieler muss dem Gegner vor Spielbeginn seinen Schläger zeigen.",
      "rules.raquete.r5":"Es ist verboten, den Schläger während eines Matches zu verändern.",
      "rules.raquete.r6":"Löst sich ein Belag während des Spiels, muss er vor der Fortsetzung ersetzt werden.",
      "rules.raquete.r7":"Die Beläge müssen in gutem Zustand sein — ohne bedeutende Schnitte oder Ablösungen.",
      "rules.raquete.r8":"Die Schlagfläche muss gleichmäßig und ohne Verformungen sein.",
      "rules.conduta.title":"Verhalten und Fair Play",
      "rules.conduta.r0":"Jegliches respektloses Verhalten gegenüber dem Gegner, dem Schiedsrichter oder dem Publikum kann zu einer Verwarnung oder Disqualifikation führen.",
      "rules.conduta.r1":"Es ist verboten, den Gegner während eines Austauschs absichtlich zu stören.",
      "rules.conduta.r2":"Ein Spieler kann pro Match maximal eine medizinische Auszeit beantragen (außer bei echten Notfällen).",
      "rules.conduta.r3":"Die Verwendung leistungsverändernder Substanzen am Schläger (Schnellkleber, Booster) ist verboten.",
      "rules.conduta.r4":"Spieler müssen während des Spiels stehen, außer bei besonderer ärztlicher Genehmigung.",
      "rules.conduta.r5":"Bei einem Streit über einen Punkt hat der Schiedsrichter das letzte Wort; Spieler dürfen nicht selbst Recht sprechen.",
      "rules.conduta.r6":"Gespräche mit dem Trainer sind nur zwischen den Sätzen erlaubt, außer in Ausnahmefällen.",
      "rules.torneio.title":"Turniere und Wettkämpfe",
      "rules.torneio.r0":"Bei offiziellen Turnieren muss ein von ITTF oder einem nationalen Verband akkreditierter Schiedsrichter die Spiele leiten.",
      "rules.torneio.r1":"Das Aufwärmen ist vor jedem Match auf 2 Minuten begrenzt.",
      "rules.torneio.r2":"Spieler können bis zu 1 Auszeit von 60 Sekunden pro Satz beantragen.",
      "rules.torneio.r3":"Im Doppel wechseln die Partner bei jedem Punkt im Aufschlag ab.",
      "rules.torneio.r4":"Qualifikationen und Setzungen werden durch die ITTF-Weltrangliste bestimmt.",
      "rules.torneio.r5":"Bei Gleichstand in einer Gruppenphase gelten folgende Kriterien: Sätze, dann Punkte, dann direktes Ergebnis.",
      "rules.torneio.r6":"Bei K.o.-Runden mit gerader Satzanzahl wird ein Unentschieden durch einen Entscheidungssatz gelöst.",
      "rules.torneio.r7":"Spieler müssen innerhalb von 10 Minuten nach ihrer Einberufung bereit sein, sonst werden sie kampflos disqualifiziert.",
      "rules.torneio.r8":"Spielfläche, Beleuchtung und Umgebungsbedingungen müssen den ITTF-Normen entsprechen.",
      "rules.torneio.r9":"Jeder Vorfall (Verletzung, Einspruch, Disqualifikation) muss im offiziellen Spielbericht festgehalten werden.",
      "rules.especial.title":"Besondere Situationen",
      "rules.especial.r0":"Gelangt ein fremder Gegenstand während eines Austauschs auf den Tisch, wird der Punkt wiederholt.",
      "rules.especial.r1":"Berührt ein Spieler den Tisch mit der freien Hand (ohne Schläger), geht der Punkt an den Gegner.",
      "rules.especial.r2":"Zerbricht oder verformt sich der Ball sichtbar während des Austauschs, wird der Punkt mit einem neuen Ball wiederholt.",
      "rules.especial.r3":"Fällt die Beleuchtung während eines Austauschs aus, wird der Punkt wiederholt.",
      "rules.especial.r4":"Bei höherer Gewalt (Naturkatastrophe, Notfall) kann das Match unterbrochen und später fortgesetzt werden.",
      "rules.especial.r5":"Erhält ein Spieler während eines Austauschs unerlaubte externe Hilfe, geht der Punkt verloren.",
      "rules.especial.r6":"Das Beschleunigungssystem gilt bei Doppeln in bestimmten Wettkämpfen nicht — örtliche Regelungen prüfen.",
      "rules.especial.r7":"Begehen beide Spieler gleichzeitig einen Fehler, wird der Punkt wiederholt.",
      "quiz.easy.0.q":"Quantos pontos são necessários para ganhar um set no ténis de mesa (modo standard)?",
      "quiz.easy.0.o0":"11",
      "quiz.easy.0.o1":"21",
      "quiz.easy.0.o2":"15",
      "quiz.easy.0.o3":"9",
      "quiz.easy.0.exp":"Na ITTF, um set é ganho ao atingir 11 pontos, com uma vantagem mínima de 2 pontos.",
      "quiz.easy.1.q":"De quantos em quantos pontos se troca o serviço durante um jogo?",
      "quiz.easy.1.o0":"2",
      "quiz.easy.1.o1":"5",
      "quiz.easy.1.o2":"3",
      "quiz.easy.1.o3":"1",
      "quiz.easy.1.exp":"O serviço muda a cada 2 pontos, exceto em caso de deuce (10-10).",
      "quiz.easy.2.q":"O que é o 'deuce' no ténis de mesa?",
      "quiz.easy.2.o0":"Vitória por 11-0",
      "quiz.easy.2.o1":"Falta de serviço",
      "quiz.easy.2.o2":"Empate a 10 pontos que exige vantagem de 2",
      "quiz.easy.2.o3":"Ponto disputado",
      "quiz.easy.2.exp":"Deuce ocorre quando o marcador fica 10-10. A partir daí, o serviço muda a cada ponto e é necessária uma vantagem de 2 pontos para ganhar o set.",
      "quiz.easy.3.q":"Qual é o diâmetro oficial da bola de ténis de mesa (ITTF)?",
      "quiz.easy.3.o0":"36 mm",
      "quiz.easy.3.o1":"40 mm",
      "quiz.easy.3.o2":"38 mm",
      "quiz.easy.3.o3":"42 mm",
      "quiz.easy.3.exp":"A bola oficial ITTF tem 40 mm de diâmetro (introduzido em 2000, substituindo 38 mm).",
      "quiz.easy.4.q":"Ao servir, o lançamento da bola deve ter pelo menos quantos centímetros de altura?",
      "quiz.easy.4.o0":"10 cm",
      "quiz.easy.4.o1":"15 cm",
      "quiz.easy.4.o2":"16 cm",
      "quiz.easy.4.o3":"20 cm",
      "quiz.easy.4.exp":"A bola deve ser lançada quase verticalmente para cima, pelo menos 16 cm, a partir da palma da mão aberta.",
      "quiz.easy.5.q":"Quando um set chega a 10-10, quantos pontos consecutivos são necessários para ganhar?",
      "quiz.easy.5.o0":"1",
      "quiz.easy.5.o1":"2",
      "quiz.easy.5.o2":"3",
      "quiz.easy.5.o3":"4",
      "quiz.easy.5.exp":"Em deuce (10-10), é necessária uma vantagem de 2 pontos, ou seja, dois pontos consecutivos sobre o adversário.",
      "quiz.easy.6.q":"A mesa de ténis de mesa tem que dimensões?",
      "quiz.easy.6.o0":"274 × 152,5 cm",
      "quiz.easy.6.o1":"260 × 140 cm",
      "quiz.easy.6.o2":"280 × 160 cm",
      "quiz.easy.6.o3":"250 × 130 cm",
      "quiz.easy.6.exp":"A mesa oficial ITTF mede 274 cm de comprimento × 152,5 cm de largura, com altura de 76 cm.",
      "quiz.easy.7.q":"A que altura fica o topo da rede oficial ITTF?",
      "quiz.easy.7.o0":"14,25 cm",
      "quiz.easy.7.o1":"15,25 cm",
      "quiz.easy.7.o2":"16,25 cm",
      "quiz.easy.7.o3":"13,25 cm",
      "quiz.easy.7.exp":"A rede tem 15,25 cm de altura ao centro e ao longo de toda a sua extensão.",
      "quiz.easy.8.q":"Quantos sets tem normalmente um jogo clássico ITTF (competição)?",
      "quiz.easy.8.o0":"3",
      "quiz.easy.8.o1":"5",
      "quiz.easy.8.o2":"7",
      "quiz.easy.8.o3":"9",
      "quiz.easy.8.exp":"Na maioria das competições ITTF usa-se o formato melhor de 7 (4 sets ganhos para vencer). Para muitos eventos usa-se também melhor de 5 ou 3.",
      "quiz.easy.9.q":"O que acontece se a bola toca a rede durante o serviço?",
      "quiz.easy.9.o0":"Recomeça-se (let)",
      "quiz.easy.9.o1":"Ponto para o adversário",
      "quiz.easy.9.o2":"Ponto para quem serve",
      "quiz.easy.9.o3":"Segunda oportunidade",
      "quiz.easy.9.exp":"Se a bola toca a rede e cai na metade correta da mesa, é um 'let' e o serviço é repetido sem penalização.",
      "quiz.easy.10.q":"Em que lado da mesa deve cair a bola no serviço (jogo de singulares)?",
      "quiz.easy.10.o0":"Só no lado esquerdo",
      "quiz.easy.10.o1":"Em qualquer ponto da metade do adversário",
      "quiz.easy.10.o2":"Só no lado direito",
      "quiz.easy.10.o3":"Na diagonal",
      "quiz.easy.10.exp":"Em singulares, a bola deve apenas cair na metade da mesa do adversário, em qualquer ponto. Não há restrição diagonal (ao contrário dos pares).",
      "quiz.easy.11.q":"Qual a cor padrão da superfície da mesa ITTF?",
      "quiz.easy.11.o0":"Azul ou verde",
      "quiz.easy.11.o1":"Vermelho ou amarelo",
      "quiz.easy.11.o2":"Branco",
      "quiz.easy.11.o3":"Preto",
      "quiz.easy.11.exp":"A superfície da mesa deve ser de cor uniforme, mate (não brilhante), tipicamente azul escuro ou verde.",
      "quiz.easy.12.q":"O que é um 'expedite system' (sistema de aceleração)?",
      "quiz.easy.12.o0":"Forma de acelerar o serviço",
      "quiz.easy.12.o1":"Sistema de desempate por sorteio",
      "quiz.easy.12.o2":"Regra que limita um set a 10 minutos de duração",
      "quiz.easy.12.o3":"Sistema de pontuação dupla",
      "quiz.easy.12.exp":"Após 10 minutos de jogo num set, entra em vigor o 'expedite system': o ponto é ganho pelo recetor se o servidor fizer 13 pancadas consecutivas sem ganhar o ponto.",
      "quiz.easy.13.q":"Em pares, qual é a regra do serviço?",
      "quiz.easy.13.o0":"Qualquer jogador pode servir para qualquer lado",
      "quiz.easy.13.o1":"A bola deve ir em diagonal — metade direita para metade direita",
      "quiz.easy.13.o2":"A bola deve ir para a metade esquerda do adversário",
      "quiz.easy.13.o3":"Não há restrições em pares",
      "quiz.easy.13.exp":"Em pares (duplas), o serviço deve ser feito em diagonal: da metade direita do servidor para a metade direita do recetor.",
      "quiz.easy.14.q":"Um jogador pode apoiar a mão livre na mesa durante o jogo?",
      "quiz.easy.14.o0":"Sim, é permitido",
      "quiz.easy.14.o1":"Não, ponto para o adversário se tocar",
      "quiz.easy.14.o2":"Só no lado do próprio jogador",
      "quiz.easy.14.o3":"Apenas durante o serviço",
      "quiz.easy.14.exp":"Se a mão livre (a que não segura a raquete) tocar a superfície de jogo durante um rally, o ponto é perdido pelo jogador infrator.",
      "quiz.medium.0.q":"Após um 'let' no serviço, o que acontece ao par de pontos desse serviço?",
      "quiz.medium.0.o0":"O serviço é repetido, sem mudar a contagem",
      "quiz.medium.0.o1":"Perde-se um dos dois pontos desse par",
      "quiz.medium.0.o2":"O par de serviços reinicia",
      "quiz.medium.0.o3":"O adversário ganha o serviço",
      "quiz.medium.0.exp":"Um 'let' anula o serviço. O servidor repete exatamente o mesmo serviço, sem alterar nenhum marcador ou par de pontos.",
      "quiz.medium.1.q":"Quando começa exatamente o 'expedite system'?",
      "quiz.medium.1.o0":"Quando o marcador chega a 9-9",
      "quiz.medium.1.o1":"Após 10 minutos de jogo num set, se nenhum jogador ainda tiver 9 pontos",
      "quiz.medium.1.o2":"Sempre que um set dura mais de 8 minutos",
      "quiz.medium.1.o3":"Quando o atacante faz 10 pancadas seguidas",
      "quiz.medium.1.exp":"O expedite system é introduzido após 10 minutos de jogo num set, desde que nenhum dos jogadores tenha chegado aos 9 pontos. A qualquer momento pode ser pedido por ambos os jogadores.",
      "quiz.medium.2.q":"O que acontece se a bola toca a borda lateral da mesa?",
      "quiz.medium.2.o0":"É 'let'",
      "quiz.medium.2.o1":"Ponto para quem bateu na bola",
      "quiz.medium.2.o2":"Ponto para o adversário",
      "quiz.medium.2.o3":"Repetição do ponto",
      "quiz.medium.2.exp":"A borda lateral (borda lateral da superfície de jogo) não é válida. Se a bola toca a borda lateral, é ponto para o adversário.",
      "quiz.medium.3.q":"A bola pode tocar a borda superior da mesa (edge) e ser boa?",
      "quiz.medium.3.o0":"Sim, é ponto válido",
      "quiz.medium.3.o1":"Não, é falta",
      "quiz.medium.3.o2":"Apenas no serviço",
      "quiz.medium.3.o3":"Apenas se cair para dentro",
      "quiz.medium.3.exp":"Se a bola toca a borda superior da mesa (edge — a superfície de jogo), é um ponto válido, pois faz parte da superfície de jogo.",
      "quiz.medium.4.q":"Qual é o peso oficial de uma bola ITTF?",
      "quiz.medium.4.o0":"2,0 g",
      "quiz.medium.4.o1":"2,3 g",
      "quiz.medium.4.o2":"2,7 g",
      "quiz.medium.4.o3":"3,0 g",
      "quiz.medium.4.exp":"A bola oficial ITTF pesa 2,7 gramas.",
      "quiz.medium.5.q":"Durante o serviço, em que posição deve estar a palma da mão livre ao lançar a bola?",
      "quiz.medium.5.o0":"Aberta e plana, acima do nível da mesa",
      "quiz.medium.5.o1":"Fechada em punho",
      "quiz.medium.5.o2":"Apontada para o adversário",
      "quiz.medium.5.o3":"Abaixo do nível da mesa",
      "quiz.medium.5.exp":"A bola deve estar na palma da mão aberta e imóvel, acima do nível da superfície de jogo, antes de ser lançada para o serviço.",
      "quiz.medium.6.q":"O topo da rede pode ser tocado pela bola durante um rally (não no serviço)?",
      "quiz.medium.6.o0":"Sim, se cair do outro lado é ponto válido",
      "quiz.medium.6.o1":"Não, é sempre falta",
      "quiz.medium.6.o2":"Só se a bola não parar na rede",
      "quiz.medium.6.o3":"É sempre 'let'",
      "quiz.medium.6.exp":"Durante o rally, se a bola toca o topo da rede e cai válida no outro lado, o ponto é válido (não é let — o let só existe no serviço).",
      "quiz.medium.7.q":"Se um jogador interrompe o jogo intencionalmente sem razão válida, o que acontece?",
      "quiz.medium.7.o0":"O set é anulado",
      "quiz.medium.7.o1":"O árbitro dá um aviso oral",
      "quiz.medium.7.o2":"O ponto em disputa é atribuído ao adversário",
      "quiz.medium.7.o3":"O jogador é desqualificado",
      "quiz.medium.7.exp":"Interrupção deliberada do jogo é considerada 'má conduta'. O árbitro pode atribuir o ponto ao adversário como penalização.",
      "quiz.medium.8.q":"Em singulares, o servidor tem de bater na bola do próprio lado antes de ir para o outro lado?",
      "quiz.medium.8.o0":"Sim, obrigatório",
      "quiz.medium.8.o1":"Não, a bola vai diretamente para o lado do adversário",
      "quiz.medium.8.o2":"Só no primeiro serviço de cada jogo",
      "quiz.medium.8.o3":"Depende do modo de jogo",
      "quiz.medium.8.exp":"Em singulares, a bola vai diretamente da raquete para a metade do adversário, sem tocar no lado do servidor. É em pares que o serviço deve ser diagonal.",
      "quiz.medium.9.q":"O que é um 'good return' (devolução válida)?",
      "quiz.medium.9.o0":"Bola que toca sempre a rede",
      "quiz.medium.9.o1":"Bola que bate na mesa do servidor",
      "quiz.medium.9.o2":"Bola que cai fora da mesa",
      "quiz.medium.9.o3":"Bola que passa a rede e cai dentro da mesa do adversário ou na borda",
      "quiz.medium.9.exp":"Uma devolução válida é aquela em que a bola (após ser batida) passa sobre ou à volta da rede e cai na área de jogo do adversário ou na borda superior da mesa.",
      "quiz.medium.10.q":"Pode um jogador bater na bola antes de ela tocar a sua metade da mesa (volley)?",
      "quiz.medium.10.o0":"Sim, se a bola estiver a sair da mesa",
      "quiz.medium.10.o1":"Não, ponto para o adversário",
      "quiz.medium.10.o2":"Só no último ponto do set",
      "quiz.medium.10.o3":"Apenas se a bola tocar a rede antes",
      "quiz.medium.10.exp":"É proibido bater na bola antes de ela tocar a sua metade da mesa (volley). Se o fizer, perde o ponto, mesmo que a bola fosse para fora.",
      "quiz.medium.11.q":"O que sucede se o servidor lança a bola e decide não a bater?",
      "quiz.medium.11.o0":"É automático 'let'",
      "quiz.medium.11.o1":"É falta e ponto para o adversário",
      "quiz.medium.11.o2":"Pode apanhar a bola e repetir",
      "quiz.medium.11.o3":"É aviso oral do árbitro",
      "quiz.medium.11.exp":"Se o servidor lançar a bola para o serviço e não a bater, é falta — o ponto vai para o adversário.",
      "quiz.medium.12.q":"Se a bola em jogo toca num objeto alheio (roupa do jogador, etc.), o que acontece?",
      "quiz.medium.12.o0":"Ponto para o adversário",
      "quiz.medium.12.o1":"É 'let'",
      "quiz.medium.12.o2":"O ponto é repetido",
      "quiz.medium.12.o3":"Depende do árbitro",
      "quiz.medium.12.exp":"Se a bola em jogo tocar qualquer coisa que não seja a rede, os seus suportes ou a mesa, o ponto vai para o adversário.",
      "quiz.medium.13.q":"Qual é a altura mínima do teto ou obstáculo acima da mesa em competições ITTF?",
      "quiz.medium.13.o0":"3 m",
      "quiz.medium.13.o1":"4 m",
      "quiz.medium.13.o2":"5 m",
      "quiz.medium.13.o3":"6 m",
      "quiz.medium.13.exp":"A ITTF recomenda pelo menos 5 metros de espaço livre acima da mesa para competições internacionais.",
      "quiz.medium.14.q":"Em pares, após cada set, como muda a ordem de serviço?",
      "quiz.medium.14.o0":"Mantém-se igual",
      "quiz.medium.14.o1":"O recetor do último serviço torna-se servidor",
      "quiz.medium.14.o2":"O parceiro do servidor torna-se o próximo servidor",
      "quiz.medium.14.o3":"Escolha livre dos jogadores",
      "quiz.medium.14.exp":"Em pares, o par que recebeu no set anterior passará a servir, e o jogador que serviu por último passará a receber.",
      "quiz.hard.0.q":"Segundo o regulamento ITTF, quais as cores obrigatórias dos revestimentos (borrachas) de uma raquete?",
      "quiz.hard.0.o0":"Um lado vermelho, outro lado preto",
      "quiz.hard.0.o1":"Qualquer cor, desde que diferentes",
      "quiz.hard.0.o2":"Azul e vermelho",
      "quiz.hard.0.o3":"Verde e preto",
      "quiz.hard.0.exp":"O regulamento ITTF exige que os dois lados da raquete sejam obrigatoriamente um vermelho e um preto, para que o adversário possa distinguir os revestimentos.",
      "quiz.hard.1.q":"Qual a espessura máxima do revestimento (borracha + esponja) numa raquete aprovada ITTF?",
      "quiz.hard.1.o0":"3 mm",
      "quiz.hard.1.o1":"3,5 mm",
      "quiz.hard.1.o2":"4 mm",
      "quiz.hard.1.o3":"5 mm",
      "quiz.hard.1.exp":"A espessura total de cada lado do revestimento (borracha mais esponja, se existir) não pode exceder 4 mm.",
      "quiz.hard.2.q":"O que significa 'ITTF approved' numa bola?",
      "quiz.hard.2.o0":"Bola fabricada em China",
      "quiz.hard.2.o1":"Bola testada e homologada pela ITTF para competições internacionais",
      "quiz.hard.2.o2":"Bola usada nos Jogos Olímpicos",
      "quiz.hard.2.o3":"Bola de 38 mm (formato antigo)",
      "quiz.hard.2.exp":"'ITTF approved' significa que a bola foi testada e está na lista de produtos aprovados pela ITTF, cumprindo todos os critérios de tamanho, peso, redondeza e cor.",
      "quiz.hard.3.q":"Segundo a ITTF, pode-se usar revestimentos anti-spin (lisos) na raquete?",
      "quiz.hard.3.o0":"Sim, desde que sejam aprovados pela ITTF",
      "quiz.hard.3.o1":"Não, são proibidos em todas as competições",
      "quiz.hard.3.o2":"Só em competições nacionais",
      "quiz.hard.3.o3":"Apenas num dos lados",
      "quiz.hard.3.exp":"Revestimentos anti-spin (pimple-out ou lisos) são permitidos desde que estejam na lista aprovada pela ITTF. A lista de borrachas homologadas é publicada e atualizada regularmente.",
      "quiz.hard.4.q":"Num torneio ITTF, se um jogador parte a raquete durante o jogo, o que pode fazer?",
      "quiz.hard.4.o0":"Continuar com qualquer raquete disponível",
      "quiz.hard.4.o1":"Deve sair do torneio",
      "quiz.hard.4.o2":"Pode substituí-la por uma pré-aprovada pelo árbitro",
      "quiz.hard.4.o3":"Pede 5 minutos de pausa para substituir",
      "quiz.hard.4.exp":"Se a raquete ficar inutilizável, o jogador pode substituí-la, mas a raquete substituta deve ser aprovada pelo árbitro.",
      "quiz.hard.5.q":"Qual é o procedimento correto da inspeção de raquetes em competições ITTF?",
      "quiz.hard.5.o0":"Apenas o árbitro principal inspeciona antes da final",
      "quiz.hard.5.o1":"Os jogadores mostram as raquetes ao adversário e ao árbitro antes do início do jogo",
      "quiz.hard.5.o2":"Só se houver protesto do adversário",
      "quiz.hard.5.o3":"Só em competições com classificação mundial",
      "quiz.hard.5.exp":"Em competições ITTF, cada jogador deve mostrar a sua raquete ao adversário e ao árbitro antes do início do jogo (e após o jogo, se solicitado).",
      "quiz.hard.6.q":"Em condições normais, a que intervalo muda a bola num match de competição ITTF?",
      "quiz.hard.6.o0":"Cada set",
      "quiz.hard.6.o1":"Cada 3 pontos",
      "quiz.hard.6.o2":"Início de cada jogo ou quando danificada",
      "quiz.hard.6.o3":"Nunca, só por dano",
      "quiz.hard.6.exp":"A bola é substituída no início de cada jogo (match) ou quando está visivelmente danificada durante o jogo.",
      "quiz.hard.7.q":"O que diz a regra ITTF sobre o uso de substâncias na raquete ('speed glue')?",
      "quiz.hard.7.o0":"É permitido com aprovação prévia",
      "quiz.hard.7.o1":"Está completamente proibido desde 2008",
      "quiz.hard.7.o2":"É permitido apenas em competições nacionais",
      "quiz.hard.7.o3":"Necessita de certificado médico",
      "quiz.hard.7.exp":"O uso de cola rápida (speed glue) e adesivos com solventes orgânicos foi proibido pela ITTF em 2008. Só são permitidos adesivos aquosos (water-based).",
      "quiz.hard.8.q":"Segundo as regras ITTF, o que é uma 'bad service' (serviço inválido) não corrigida pelo árbitro após advertência?",
      "quiz.hard.8.o0":"Ponto imediato para o adversário",
      "quiz.hard.8.o1":"Segundo serviço",
      "quiz.hard.8.o2":"Let repetido",
      "quiz.hard.8.o3":"Desclassificação",
      "quiz.hard.8.exp":"Após advertência por mau serviço, qualquer serviço subsequente inválido resulta em ponto direto para o adversário, sem necessidade de nova advertência.",
      "quiz.hard.9.q":"Qual é a regra ITTF sobre o 'time-out' (pausa) num jogo?",
      "quiz.hard.9.o0":"Não é permitido time-out",
      "quiz.hard.9.o1":"Cada equipa tem 2 time-outs por jogo",
      "quiz.hard.9.o2":"Cada jogador/equipa tem direito a 1 time-out de 1 minuto por jogo",
      "quiz.hard.9.o3":"Só o árbitro pode interromper o jogo",
      "quiz.hard.9.exp":"Cada jogador (ou equipa em pares) tem direito a um time-out de 1 minuto por match (não por set). Pode ser pedido em qualquer momento, exceto durante o serviço.",
      "quiz.hard.10.q":"O que prevê o regulamento ITTF sobre o treinador (coach) durante o jogo?",
      "quiz.hard.10.o0":"O treinador pode dar instruções em qualquer momento",
      "quiz.hard.10.o1":"O treinador só pode dar instruções durante os intervalos entre sets e durante os time-outs",
      "quiz.hard.10.o2":"O treinador pode entrar na área de jogo",
      "quiz.hard.10.o3":"Não há regulação sobre o comportamento do treinador",
      "quiz.hard.10.exp":"O treinador só pode comunicar com o jogador durante os intervalos entre sets e durante os time-outs solicitados. Não é permitido qualquer tipo de instrução durante o jogo em si.",
      "quiz.hard.11.q":"O que são 'pimples-out' (espinhos para fora) num revestimento de raquete?",
      "quiz.hard.11.o0":"Revestimento com espinhos virados para dentro",
      "quiz.hard.11.o1":"Revestimento completamente liso",
      "quiz.hard.11.o2":"Revestimento com espinhos virados para fora, sem camada de esponja atrás",
      "quiz.hard.11.o3":"Borracha especial para defesa",
      "quiz.hard.11.exp":"'Pimples-out' (OX ou sem esponja) é um revestimento com os espinhos de borracha virados para fora. Reduz o efeito (spin) mas melhora o controlo. É permitido pela ITTF se aprovado.",
      "quiz.hard.12.q":"Quantos minutos de intervalo são permitidos entre sets num jogo ITTF?",
      "quiz.hard.12.o0":"1 minuto",
      "quiz.hard.12.o1":"2 minutos",
      "quiz.hard.12.o2":"3 minutos",
      "quiz.hard.12.o3":"5 minutos",
      "quiz.hard.12.exp":"O intervalo entre sets num jogo ITTF tem a duração máxima de 1 minuto.",
      "quiz.hard.13.q":"O que é o 'phantom serve' e qual é a sua situação regulamentar?",
      "quiz.hard.13.o0":"Serviço invisível, permitido",
      "quiz.hard.13.o1":"Serviço em que a raquete não toca claramente a bola, proibido",
      "quiz.hard.13.o2":"Serviço com rotação excessiva, limitada a 3000 RPM",
      "quiz.hard.13.o3":"Serviço com bola lançada mais de 30 cm, obrigatório",
      "quiz.hard.13.exp":"O 'phantom serve' esconde o contato da bola com a raquete (com o corpo ou braço livre), impossibilitando o adversário de ver o momento do impacto. É proibido pelas regras ITTF.",
      "quiz.hard.14.q":"Em competições ITTF, o que especifica a regra sobre a iluminação da área de jogo?",
      "quiz.hard.14.o0":"Mínimo de 200 lux",
      "quiz.hard.14.o1":"Mínimo de 500 lux",
      "quiz.hard.14.o2":"Mínimo de 1000 lux no plano da mesa, sem luz natural direta",
      "quiz.hard.14.o3":"Sem requisitos específicos",
      "quiz.hard.14.exp":"A ITTF recomenda pelo menos 1000 lux uniformemente sobre a superfície da mesa, sem luz solar direta, para competições internacionais."
    },
    zh: {
      "menu.newGame":"新局",
      "menu.newGameSub":"选择球员并开始",
      "menu.tournament":"锦标赛",
      "menu.tournamentSub":"单淘汰赛，自动分组",
      "menu.players":"球员",
      "menu.playersSub":"管理和查看统计数据",
      "menu.history":"历史",
      "menu.historySub":"以往比赛",
      "menu.data":"数据",
      "menu.dataSub":"导出或导入备份",
      "menu.footer":"数据仅保存在此设备上",
      "screen.players":"球员",
      "screen.history":"历史",
      "screen.gameDetail":"比赛详情",
      "screen.newGame":"新局",
      "screen.gameType":"赛制",
      "screen.pointsFormat":"分制与赛制",
      "screen.newTournament":"新锦标赛",
      "screen.tournament":"锦标赛",
      "screen.minigames":"小游戏",
      "screen.achievements":"成就",
      "screen.records":"纪录",
      "screen.data":"数据",
      "btn.addPlayer":"＋ 新增",
      "btn.deletePlayer":"删除",
      "btn.abandon":"放弃",
      "btn.continue":"继续 ▸",
      "btn.startGame":"开始比赛",
      "btn.createTournament":"创建锦标赛",
      "btn.backMenu":"返回菜单",
      "btn.start":"开始",
      "serve.title":"发球",
      "serve.hint":"先发球",
      "setup.bluePlayer":"蓝方",
      "setup.whitePlayer":"白方",
      "setup.pointsPerSet":"每局分数",
      "setup.format":"赛制",
      "mg.tap":"快速点击",
      "mg.tapSub":"在点消失前点击",
      "mg.memory":"视觉记忆",
      "mg.memorySub":"记忆并重复序列",
      "ach.unlocked":"🏆 成就解锁！",
      "data.export":"导出备份",
      "data.exportSub":"生成包含所有数据的 .json 文件",
      "data.import":"导入备份",
      "data.importSub":"添加或合并备份数据",
      "data.wipe":"清除所有数据",
      "data.wipeSub":"从此设备移除球员和历史记录",
      "js.choosePlayer":"选择球员",
      "js.sideBlue":"蓝方",
      "js.sideWhite":"白方",
      "js.continue":"仍然继续 ▸",
      "js.nextSet":"下一局 ▸",
      "js.undoMsg":"最后一分已撤销 — 可以继续比赛。",
      "js.setInProgress":"当前局（%b-%w）不计入成绩。已结束的局保存在历史中。",
      "js.confirmEnd":"当前结果将保存到历史记录。",
      "js.confirmWipe":"清除所有数据？",
      "js.confirmAbandon":"放弃锦标赛？",
      "js.emptyPlayers":"请先创建球员。",
      "js.noData":"暂无数据",
      "js.wins":"胜",
      "js.losses":"负",
      "js.draws":"平",
      "js.capotes":"11-0",
      "js.winRate":"胜率",
      "js.elo":"积分",
      "js.allPlayers":"所有球员",
      "js.serve":"发球",
      "js.notServe":"接球",
      "js.set":"局",
      "js.bestOf":"三局两胜制 /",
      "js.free":"自由",
      "js.classic":"标准",
      "js.custom":"自定义",
      "js.gameWon":"%n 赢得比赛",
      "js.setWon":"%n 赢得该局",
      "js.deuce":"平分",
      "js.matchPoint":"赛点",
      "js.capoteTag":"11-0",
      "js.newRecord":"🏆 新纪录！",
      "js.points":"分数",
      "js.level":"等级",
      "js.levelReached":"达到等级",
      "js.playAgain":"再玩一次",
      "js.tbd":"待定",
      "js.play":"▶ 开始",
      "js.whoseServe":"第 %n 局 · 谁先发球？",
      "js.champion":"🏆 锦标赛冠军",
      "js.winsLabel":"胜",
      "js.lossesLabel":"负",
      "js.drawsLabel":"平",
      "js.capotesLabel":"11-0",
      "js.winRateLabel":"胜率",
      "js.eloLabel":"积分",
      "js.bestRival":"最佳对手",
      "js.worstRival":"最差对手",
      "js.last10":"最近10场",
      "js.streak":"当前连胜",
      "js.setsWon":"赢得的局",
      "js.setsLost":"失去的局",
      "js.capotesMade":"11-0 胜",
      "js.capotesSuffered":"被11-0",
      "js.tournamentsWon":"锦标赛冠军",
      "js.tournamentsPlayed":"参加锦标赛",
      "js.trainingMin":"分钟训练",
      "js.trainingSessions":"次训练",
      "js.importReplace":"替换所有",
      "js.importMerge":"添加到现有数据",
      "js.importDetailFile":"文件包含 %p 名玩家和 %g 场游戏。",
      "js.importDetailMerge":"<strong>添加</strong>将带来 %np 名新玩家和 %ng 场新游戏（相同名称合并；重复忽略）。",
      "js.importDetailReplace":"<strong>替换所有</strong>将删除当前 %p 名玩家和 %g 场游戏，仅保留文件内容。",
      "js.recElo":"最高积分",
      "js.recStreak":"最长连胜",
      "js.recWins":"最多胜场",
      "js.recCapotes":"最多11-0",
      "js.recTournaments":"最多锦标赛冠军",
      "js.recPoints":"最多得分",
      "js.recDuration":"最长比赛",
      "js.recMgTap":"快速点击纪录",
      "js.recMgMemory":"记忆纪录",
      "js.recEloGain":"最大积分增长",
      "js.wins_unit":"胜",
      "js.min_unit":"分钟",
      "js.pts_unit":"分",
      "js.roundQF":"四分之一决赛",
      "js.roundSF":"半决赛",
      "js.roundF":"决赛",
      "js.serveEvery2":"每2分换发球",
      "js.serveEvery5":"每5分换发球",
      "js.serveEvery1":"每分换发球（平分）",
      "js.eraseConfirm":"确定吗？此操作无法撤销。",
      "js.missedGame":"误操作 — 撤销最后一分",
      "js.gameInProgress":"有一场进行中的比赛",
      "js.tournamentInProgress":"有一个进行中的锦标赛",
      "js.resumeGame":"继续比赛 ▸",
      "js.resumeTournament":"继续锦标赛 ▸",
      "js.endOfSet":"局结束",
      "js.endOfSetCapote":"局结束 · 11-0",
      "js.endOfSetDeciding":"局结束 · 比赛决定",
      "js.endOfSetCapoteDeciding":"局结束 · 11-0 · 比赛决定",
      "js.endOfGame":"比赛结束",
      "js.endOfGameCapote":"比赛结束 · 11-0",
      "js.drawBetween":"平局：",
      "js.chooseBlue":"选择 — 蓝方",
      "js.chooseWhite":"选择 — 白方",
      "js.noPlayersYet":"还没有创建球员。<br>返回菜单先创建球员。",
      "js.trainingTitle":"训练模式",
      "js.trainingFree":"自由计时",
      "js.trainingTimed":"定时训练",
      "js.trainingModeFree":"自由模式",
      "js.trainingModeTimed":"训练 %n 分钟",
      "js.mgMemorize":"记住！",
      "js.mgYourTurn":"轮到你了！",
      "js.mgPoints":"分数：",
      "js.mgLevel":"等级",
      "js.mgLevelReached":"达到等级：",
      "js.mgRecord":"纪录：",
      "js.mgMemoryTitle":"视觉记忆",
      "js.achSecret":"隐藏成就解锁！",
      "js.achSecretDesc":"隐藏成就。继续游戏来发现它。",
      "js.cancel":"取消",
      "js.save":"保存",
      "js.undo":"撤销最后一分",
      "js.pause":"暂停计时器",
      "js.modeCustom":"自定义",
      "js.modeClassic":"标准",
      "js.modeClassicDesc":"每局11分 · BO3、BO5 或 BO7",
      "js.formatFree":"自由",
      "js.formatBo3":"三局两胜",
      "js.formatBo5":"五局三胜",
      "js.formatBo7":"七局四胜",
      "js.setBalanced":"局势非常均衡",
      "js.descPlaceholder":"例：夏季锦标赛、游戏室...",
      "js.shortcutTraining":"训练模式",
      "js.shortcutMinigames":"小游戏",
      "js.shortcutAchievements":"成就",
      "js.shortcutRecords":"纪录",
      "js.setLabel":"局",
      "js.noHistory":"历史记录中还没有比赛。",
      "js.catFirstSteps":"第一步",
      "js.catWins":"胜利",
      "js.catSets":"局",
      "js.catComebacks":"逆转",
      "js.catElo":"积分",
      "js.catPoints":"得分",
      "js.catTournaments":"锦标赛",
      "js.catRivalries":"竞争",
      "js.catTraining":"训练",
      "js.catMinigames":"小游戏",
      "js.catSpecials":"特殊",
      "js.noDataYet":"暂无数据",
      "js.bracketTbd":"待定",
      "js.noPlayersEmpty":"还没有玩家。<br>点击'＋ 新建'添加第一个。",
      "js.leaderboard":"排行榜 · 前 %n",
      "js.playerCol":"玩家",
      "js.gamesUnit":"%n 场",
      "js.noGamesProfile":"暂无记录。",
      "js.resultDraw":"平局",
      "js.resultWon":"胜",
      "js.resultLost":"负",
      "js.gamesDisputed":"%n 场",
      "js.headToHead":"对决记录",
      "js.recentGames":"最近对局",
      "js.scorerColor":"记分板颜色",
      "js.eloLabel2":"ELO（娱乐）",
      "js.statGamesPlayed":"对局数",
      "js.statGamesWon":"胜场数",
      "js.statGamesLost":"负场数",
      "js.statGamesDrawn":"平局数",
      "js.statSetsWonV":"赢得的局数（胜）",
      "js.statSetsLostD":"输掉的局数（负）",
      "js.statTotalSetsWon":"总赢局数",
      "js.statTotalSetsLost":"总输局数",
      "js.statCapotesMade":"完封对手次数",
      "js.statCapotesSuffered":"被完封次数",
      "js.statTournamentsWon":"赢得的锦标赛",
      "js.statTournamentsTotal":"参加的锦标赛",
      "js.bestRivalAgainst":"对阵%n最多胜",
      "js.worstRivalAgainst":"对阵%n最多负",
      "js.noHistoryYet":"暂无对局记录。<br>打完第一场即可在此查看。",
      "js.draw":"平局",
      "js.setsSep":"局",
      "js.xCapote":"%n次完封",
      "js.modeFree":"自由",
      "js.modeMd3":"三局两胜",
      "js.modeMd5":"五局三胜",
      "js.modeMd7":"七局四胜",
      "js.gameEndedDraw":"比赛以平局结束",
      "js.setsWonBy":"局数（%n赢得比赛）",
      "js.ptsPerSet":"每局分数",
      "js.duration":"时长",
      "js.setRecap":"第%n局",
      "js.undoToast":"已撤销最后一分 — 可以继续比赛。",
      "js.statsSaved":"已保存玩家",
      "js.gamesInHistory":"历史对局",
      "js.exportedToast":"备份已导出：%f",
      "js.importedToast":"已导入：%p 名玩家，%g 场对局",
      "js.invalidFile":"文件无效或已损坏。",
      "js.cantReadFile":"无法读取文件。",
      "js.invalidFormat":"文件无效：格式错误。",
      "js.invalidBackup":"文件无效：不是 PLACAR 备份。",
      "js.replacedToast":"数据替换成功。",
      "js.wipedToast":"所有数据已清除。",
      "js.createPlayersFirst":"请先创建玩家。",
      "js.roundLabel":"第%n轮",
      "js.tournamentWinnerSub":"%m场 · %p名玩家",
      "js.choosePlayerFirst":"请先选择玩家",
      "js.recMgMemory2":"视觉记忆记录",
      "js.recMorePoints":"最多积分",
      "js.recMoreTraining":"最长训练时间",
      "js.levelPrefix":"第",
      "js.winsUnit":" 胜",
      "js.capotesUnit":" 次完封",
      "js.tournamentsUnit":" 次锦标赛",
      "js.pointsUnit":" 分",
      "js.minUnit":" 分钟",
      "js.achProgressText":"%d / %t 成就",
      "js.setup.pts11":"11分",
      "js.setup.pts21":"21分",
      "js.overlay.endGameTitle":"结束比赛",
      "js.overlay.confirmEnd":"确认结束比赛？",
      "js.overlay.confirmEndBtn":"结束",
      "js.data.backup":"备份",
      "js.data.wipeAll":"清除所有",
      "js.mg.playAs":"以…身份游戏",
      "js.tournament.size":"规模",
      "js.tournament.mode":"模式",
      "js.mode.customDesc":"11或21分 · 自由、三局两胜或五局三胜 · 每5分交换发球权",
      "mg.quiz":"规则问答",
      "mg.quizSub":"测试你对ITTF规则的了解",
      "mg.rules":"ITTF规则",
      "mg.rulesSub":"乒乓球全部官方规则",
      "js.mgQuizScore":"分数：",
      "js.mgQuizIntro":"选择难度级别",
      "js.mgQuizEasy":"简单",
      "js.mgQuizEasyDesc":"基本游戏规则",
      "js.mgQuizMedium":"中等",
      "js.mgQuizMediumDesc":"发球和得分规则",
      "js.mgQuizHard":"困难",
      "js.mgQuizHardDesc":"规章制度和锦标赛",
      "js.mgQuizBestScore":"最高分：",
      "js.mgQuizNext":"下一题 ▸",
      "js.mgQuizFinalScore":"最终分数：",
      "js.mgQuizCorrect":"正确！✓",
      "js.mgQuizWrong":"错误 ✗",
      "js.mgQuizChooseFirst":"请先选择玩家",
      "js.mgQuizResultGreat":"出色！你非常了解规则！",
      "js.mgQuizResultGood":"干得好！继续学习规则。",
      "js.mgQuizResultTry":"继续练习并阅读ITTF规则。",
      "js.langBtn":"语言",
      "js.settingsBtn":"设置",
      "js.descLabel":"描述",
      "js.optional":"（可选）",
      "js.nPlayers4":"4名球员",
      "js.nPlayers8":"8名球员",
      "js.nPlayers16":"16名球员",
      "js.trainingDuration":"时长（分钟）",
      "js.back":"‹ 返回",
      "js.gameEndedTitle":"比赛结束",
      "js.backToMenu":"返回菜单",
      "js.newPlayerTitle":"新球员",
      "js.newPlayerName":"球员姓名",
      "js.playerNamePlaceholder":"例：张三",
      "js.colorPickerLabel":"记分板颜色",
      "js.color.blueWhite":"蓝色 / 白色",
      "js.color.greenWhite":"绿色 / 白色",
      "js.color.redWhite":"红色 / 白色",
      "js.color.pinkWhite":"粉色 / 白色",
      "js.color.purpleWhite":"紫色 / 白色",
      "js.color.goldWhite":"金色 / 白色",
      "js.color.whiteBlack":"白色 / 黑色",
      "js.color.orangeWhite":"橙色 / 白色",
      "js.dataExplain":"将球员和历史记录保存到可存储在云端（网盘、电子邮件等）的文件中，用于在此设备或其他设备上恢复所有数据。",
      "js.importTitle":"导入数据",
      "js.importQuestion":"你想做什么？",
      "js.importDetail":"这将替换此设备上已保存的球员和历史记录。",
      "js.mergeImport":"添加到现有数据",
      "js.replaceImport":"替换所有",
      "js.wipeTitle":"清除所有",
      "js.wipeQuestion":"清除所有数据？",
      "js.wipeDetail":"此操作无法撤销。建议先导出备份。",
      "js.wipeConfirm":"清除所有",
      "js.rotateHint":"将平板电脑横置",
      "js.overlay.confirmEndDetail":"当前结果将保存到历史记录。",
      "ach.first_point.name":"第一分",
      "ach.first_point.desc":"得到你的第一分。",
      "ach.first_set.name":"第一局",
      "ach.first_set.desc":"赢得你的第一局。",
      "ach.first_win.name":"第一胜",
      "ach.first_win.desc":"赢得你的第一场比赛。",
      "ach.first_tournament.name":"第一次锦标赛",
      "ach.first_tournament.desc":"参加你的第一次锦标赛。",
      "ach.first_trophy.name":"第一个奖杯",
      "ach.first_trophy.desc":"赢得你的第一次锦标赛。",
      "ach.wins_10.name":"10胜",
      "ach.wins_10.desc":"赢得10场比赛。",
      "ach.wins_50.name":"50胜",
      "ach.wins_50.desc":"赢得50场比赛。",
      "ach.wins_100.name":"100胜",
      "ach.wins_100.desc":"赢得100场比赛。",
      "ach.wins_200.name":"200胜",
      "ach.wins_200.desc":"赢得200场比赛。",
      "ach.streak_3.name":"帽子戏法",
      "ach.streak_3.desc":"连獨3场胜利。",
      "ach.streak_5.name":"状态火热",
      "ach.streak_5.desc":"连獨5场胜利。",
      "ach.streak_10.name":"势不可挡",
      "ach.streak_10.desc":"连獨10场胜利。",
      "ach.streak_20.name":"无坚不摧",
      "ach.streak_20.desc":"连獨20场胜利。",
      "ach.sweep.name":"横扫",
      "ach.sweep.desc":"赢得一场比赛且没有输掉任何一局。",
      "ach.capote_set.name":"完封",
      "ach.capote_set.desc":"以11-0赢得一局。",
      "ach.set_perfect.name":"完美局",
      "ach.set_perfect.desc":"赢得一局且最多允许对手得3分。",
      "ach.deciding_set.name":"决胜局",
      "ach.deciding_set.desc":"赢得在最后一局决出的比赛。",
      "ach.comeback.name":"逆转",
      "ach.comeback.desc":"在输掉第1局后赢得比赛。",
      "ach.comeback_02.name":"大逆转",
      "ach.comeback_02.desc":"在0-2落后赢得比赛。",
      "ach.comeback_pts.name":"永不放弃",
      "ach.comeback_pts.desc":"在落后5+分后赢得一局。",
      "ach.elo_1000.name":"四位数",
      "ach.elo_1000.desc":"达到1000 ELO。",
      "ach.elo_1200.name":"1200信乐部",
      "ach.elo_1200.desc":"达到1200 ELO。",
      "ach.elo_1300.name":"精英",
      "ach.elo_1300.desc":"达到1300 ELO。",
      "ach.elo_1500.name":"大师",
      "ach.elo_1500.desc":"达到1500 ELO。",
      "ach.pts_100.name":"百分达人",
      "ach.pts_100.desc":"积累100分。",
      "ach.pts_500.name":"500分",
      "ach.pts_500.desc":"积累500分。",
      "ach.pts_1000.name":"1000分",
      "ach.pts_1000.desc":"积累1000分。",
      "ach.tour_2.name":"双料冠军",
      "ach.tour_2.desc":"赢得2次锦标赛。",
      "ach.tour_3.name":"三冠王",
      "ach.tour_3.desc":"赢得3次锦标赛。",
      "ach.rival_10.name":"经典对决",
      "ach.rival_10.desc":"与同一对手进行10场比赛。",
      "ach.rival_25.name":"宿命对手",
      "ach.rival_25.desc":"与同一对手进行25场比赛。",
      "ach.rival_dom.name":"统治",
      "ach.rival_dom.desc":"对同一对手领先10场胜利。",
      "ach.rival_5.name":"克星",
      "ach.rival_5.desc":"对同一对手连獨5场胜利。",
      "ach.train_first.name":"第一次训练",
      "ach.train_first.desc":"完成一次训练。",
      "ach.train_10m.name":"10分钟",
      "ach.train_10m.desc":"积累10分钟训练。",
      "ach.train_1h.name":"1小时",
      "ach.train_1h.desc":"积累60分钟训练。",
      "ach.train_5sess.name":"纪律",
      "ach.train_5sess.desc":"完成3次训练。",
      "ach.mg_tap_10.name":"钔铁反应",
      "ach.mg_tap_10.desc":"在快速点击中儇10分。",
      "ach.mg_tap_30.name":"闪电",
      "ach.mg_tap_30.desc":"在快速点击中儇30分。",
      "ach.mg_mem_5.name":"扎实记忆",
      "ach.mg_mem_5.desc":"在视觉记忆中达到5级。",
      "ach.mg_mem_10.name":"鐵打记忆",
      "ach.mg_mem_10.desc":"在视觉记忆中达到10级。",
      "ach.secret_11_0.name":"羞辱",
      "ach.secret_11_0.desc":"以11-0赢得一局。",
      "ach.secret_3_2.name":"极限挑战",
      "ach.secret_3_2.desc":"赢得在第5局决出的比赛。",
      "ach.secret_11_9.name":"分分必争",
      "ach.secret_11_9.desc":"以11-9赢得一局。",
      "ach.secret_midnight.name":"深夜时光",
      "ach.secret_midnight.desc":"在午夜后进行比赛。",
      "ach.secret_morning.name":"早起鸟儿",
      "ach.secret_morning.desc":"在08:00前进行比赛。",
      "ach.secret_10day.name":"机器",
      "ach.secret_10day.desc":"在同一天进行10场比赛。",
      "rules.jogo.title":"比赛——基本规则",
      "rules.jogo.r0":"率先得到11分且领先对手至少2分的选手赢得该局。",
      "rules.jogo.r1":"在规定赛制（3局2胜、5局3胜或7局4胜）中赢得最多局数的选手获胜。",
      "rules.jogo.r2":"得分的选手负责下一次发球（或按轮换规则保留发球权）。",
      "rules.jogo.r3":"比赛中球触及持拍手以外的任何身体部位，失分。",
      "rules.jogo.r4":"自由手（未持拍的手）在对打过程中绝对不能触碰球台——否则对手得分。",
      "rules.jogo.r5":"球触及球台上沿边缘（边缘球）时，得分有效。",
      "rules.jogo.r6":"球触及球台侧面，对手得分——侧面不是有效比赛区域。",
      "rules.jogo.r7":"选手不能在球在己方半台弹跳之前击球（不允许截击）。",
      "rules.jogo.r8":"如遇经证实的伤病、器材故障或其他经裁判认可的原因，比赛可以中断。",
      "rules.jogo.r9":"若某局比赛进行10分钟后双方均未达到9分，实行时限制度：若发球方在13次击球内未得分，则接球方得分。",
      "rules.servico.title":"发球",
      "rules.servico.r0":"发球时，球须置于自由手展开的静止手掌上，高于球台台面。",
      "rules.servico.r1":"发球时须将球几乎竖直向上抛起至少16厘米，且不得施加旋转。",
      "rules.servico.r2":"发球方须在球下落过程中击球，使球先落于己方台面，再越网落于对方台面。",
      "rules.servico.r3":"单打中，球可落于对方台面的任何位置。",
      "rules.servico.r4":"双打中，发球必须斜线进行：从发球方右半区发至接球方右半区。",
      "rules.servico.r5":"球与球拍的接触必须让对手和裁判清晰可见——不得以身体遮挡。",
      "rules.servico.r6":"若发球时球触网后正确落台，为\"擦网\"——需重新发球。",
      "rules.servico.r7":"警告后，再次出现非法发球即立即判对手得分。",
      "rules.servico.r8":"若发球方将球抛起后未能击球，失分。",
      "rules.servico.r9":"发球时，自由臂须高于台面，且对裁判和对手可见。",
      "rules.pontuacao.title":"计分与换发球",
      "rules.pontuacao.r0":"每得2分换一次发球权，双方交替发球。",
      "rules.pontuacao.r1":"平局（10:10）时，每得1分换一次发球权，需领先2分方可赢得该局。",
      "rules.pontuacao.r2":"双打中，发球与接球顺序须保持至该局结束；下一局由接球一方发球。",
      "rules.pontuacao.r3":"比赛首位发球方由抽签决定（抛硬币或选边）。",
      "rules.pontuacao.r4":"每局开始时双方交换场地；决胜局（最后一局）中，当某选手达到5分时交换场地。",
      "rules.pontuacao.r5":"双打决胜局中，接球一方可改变接球顺序。",
      "rules.pontuacao.r6":"时限制度不改变每2分换发球的规则——仅将激活后的换发球频率调整为每1分一换。",
      "rules.pontuacao.r7":"发球擦网重发时，该次发球完整重来（计数不累加）。",
      "rules.equipamento.title":"器材——球台与球网",
      "rules.equipamento.r0":"球台长274厘米×宽152.5厘米×高76厘米。",
      "rules.equipamento.r1":"台面须平整、均匀、无光泽（通常为蓝色或绿色），并有2厘米宽的白色边线。",
      "rules.equipamento.r2":"球网将球台平均分为两半，全长网高15.25厘米。",
      "rules.equipamento.r3":"比赛区域不包括球台侧面（侧边缘）。",
      "rules.equipamento.r4":"球台须由木材或类似材料制成，标准球从30厘米高处落下后回弹高度为23±1厘米。",
      "rules.equipamento.r5":"中线（宽2毫米）将球台平均分为两半，双打发球时属于各右半区的一部分。",
      "rules.bola.title":"器材——乒乓球",
      "rules.bola.r0":"球直径须为40毫米（±0.5毫米），重量为2.7克（±0.1克）。",
      "rules.bola.r1":"球须为白色或橙色，无光泽。",
      "rules.bola.r2":"球须由塑料制成（2015年起取代赛璐珞材质）。",
      "rules.bola.r3":"破损或变形的球须立即更换。",
      "rules.bola.r4":"正式比赛中只能使用国际乒联认证的球。",
      "rules.raquete.title":"器材——球拍",
      "rules.raquete.r0":"球拍可为任意尺寸、形状或重量，但拍面须平整且坚硬。",
      "rules.raquete.r1":"拍面厚度的至少85%须为天然木材。",
      "rules.raquete.r2":"拍面两侧须各覆盖一层经国际乒联认证的胶皮。",
      "rules.raquete.r3":"拍面两侧须为不同颜色：一面红色，一面黑色。",
      "rules.raquete.r4":"选手须在比赛开始前向对手展示自己的球拍。",
      "rules.raquete.r5":"比赛过程中禁止改动球拍。",
      "rules.raquete.r6":"若胶皮在比赛中脱落，须在继续比赛前予以更换。",
      "rules.raquete.r7":"胶皮须保持良好状态——无明显划伤或剥离。",
      "rules.raquete.r8":"击球面须均匀，无变形。",
      "rules.conduta.title":"行为规范与公平竞技",
      "rules.conduta.r0":"对对手、裁判或观众的任何不尊重行为均可导致警告或取消资格。",
      "rules.conduta.r1":"禁止在对打过程中故意干扰对手。",
      "rules.conduta.r2":"每场比赛每位选手最多可申请一次医疗暂停（真正的紧急情况除外）。",
      "rules.conduta.r3":"禁止使用可改变球拍性能的物质（快干胶、增速剂等）。",
      "rules.conduta.r4":"选手在比赛期间须站立，除非获得特殊医疗许可。",
      "rules.conduta.r5":"对某一分发生争议时，裁判拥有最终裁决权；选手不得自行判定。",
      "rules.conduta.r6":"与教练交流只允许在局间进行，特殊情况除外。",
      "rules.torneio.title":"赛事与竞赛",
      "rules.torneio.r0":"正式赛事中，须有经国际乒联或全国协会认证的裁判监督比赛。",
      "rules.torneio.r1":"每场比赛前热身时间限为2分钟。",
      "rules.torneio.r2":"选手每局最多可申请1次60秒的暂停。",
      "rules.torneio.r3":"双打中，搭档须在每分后交替击球。",
      "rules.torneio.r4":"资格排名和种子排位根据国际乒联世界排名确定。",
      "rules.torneio.r5":"小组赛同分情况下，按以下顺序决定名次：局数、分数、相互间成绩。",
      "rules.torneio.r6":"单淘汰赛制中，偶数局赛制若出现平局，则以决胜局分出胜负。",
      "rules.torneio.r7":"选手须在被召唤后10分钟内就绪，否则判负。",
      "rules.torneio.r8":"台面、照明及环境条件须符合国际乒联标准。",
      "rules.torneio.r9":"所有事故（伤病、申诉、取消资格）须记录于官方比赛报告中。",
      "rules.especial.title":"特殊情况",
      "rules.especial.r0":"若对打过程中有外来物进入球台，该分重赛。",
      "rules.especial.r1":"若选手以自由手（未持拍）触碰球台，对手得分。",
      "rules.especial.r2":"若球在对打过程中明显破碎或变形，用新球重赛该分。",
      "rules.especial.r3":"若对打过程中灯光熄灭，该分重赛。",
      "rules.especial.r4":"遇不可抗力（自然灾害、紧急事件），比赛可暂停并于稍后继续。",
      "rules.especial.r5":"若选手在对打过程中获得未经授权的外部帮助，失分。",
      "rules.especial.r6":"时限制度在某些赛事的双打比赛中不适用——请查阅当地规则。",
      "rules.especial.r7":"若双方选手同时犯规，该分重赛。",
      "quiz.easy.0.q":"Quantos pontos são necessários para ganhar um set no ténis de mesa (modo standard)?",
      "quiz.easy.0.o0":"11",
      "quiz.easy.0.o1":"21",
      "quiz.easy.0.o2":"15",
      "quiz.easy.0.o3":"9",
      "quiz.easy.0.exp":"Na ITTF, um set é ganho ao atingir 11 pontos, com uma vantagem mínima de 2 pontos.",
      "quiz.easy.1.q":"De quantos em quantos pontos se troca o serviço durante um jogo?",
      "quiz.easy.1.o0":"2",
      "quiz.easy.1.o1":"5",
      "quiz.easy.1.o2":"3",
      "quiz.easy.1.o3":"1",
      "quiz.easy.1.exp":"O serviço muda a cada 2 pontos, exceto em caso de deuce (10-10).",
      "quiz.easy.2.q":"O que é o 'deuce' no ténis de mesa?",
      "quiz.easy.2.o0":"Vitória por 11-0",
      "quiz.easy.2.o1":"Falta de serviço",
      "quiz.easy.2.o2":"Empate a 10 pontos que exige vantagem de 2",
      "quiz.easy.2.o3":"Ponto disputado",
      "quiz.easy.2.exp":"Deuce ocorre quando o marcador fica 10-10. A partir daí, o serviço muda a cada ponto e é necessária uma vantagem de 2 pontos para ganhar o set.",
      "quiz.easy.3.q":"Qual é o diâmetro oficial da bola de ténis de mesa (ITTF)?",
      "quiz.easy.3.o0":"36 mm",
      "quiz.easy.3.o1":"40 mm",
      "quiz.easy.3.o2":"38 mm",
      "quiz.easy.3.o3":"42 mm",
      "quiz.easy.3.exp":"A bola oficial ITTF tem 40 mm de diâmetro (introduzido em 2000, substituindo 38 mm).",
      "quiz.easy.4.q":"Ao servir, o lançamento da bola deve ter pelo menos quantos centímetros de altura?",
      "quiz.easy.4.o0":"10 cm",
      "quiz.easy.4.o1":"15 cm",
      "quiz.easy.4.o2":"16 cm",
      "quiz.easy.4.o3":"20 cm",
      "quiz.easy.4.exp":"A bola deve ser lançada quase verticalmente para cima, pelo menos 16 cm, a partir da palma da mão aberta.",
      "quiz.easy.5.q":"Quando um set chega a 10-10, quantos pontos consecutivos são necessários para ganhar?",
      "quiz.easy.5.o0":"1",
      "quiz.easy.5.o1":"2",
      "quiz.easy.5.o2":"3",
      "quiz.easy.5.o3":"4",
      "quiz.easy.5.exp":"Em deuce (10-10), é necessária uma vantagem de 2 pontos, ou seja, dois pontos consecutivos sobre o adversário.",
      "quiz.easy.6.q":"A mesa de ténis de mesa tem que dimensões?",
      "quiz.easy.6.o0":"274 × 152,5 cm",
      "quiz.easy.6.o1":"260 × 140 cm",
      "quiz.easy.6.o2":"280 × 160 cm",
      "quiz.easy.6.o3":"250 × 130 cm",
      "quiz.easy.6.exp":"A mesa oficial ITTF mede 274 cm de comprimento × 152,5 cm de largura, com altura de 76 cm.",
      "quiz.easy.7.q":"A que altura fica o topo da rede oficial ITTF?",
      "quiz.easy.7.o0":"14,25 cm",
      "quiz.easy.7.o1":"15,25 cm",
      "quiz.easy.7.o2":"16,25 cm",
      "quiz.easy.7.o3":"13,25 cm",
      "quiz.easy.7.exp":"A rede tem 15,25 cm de altura ao centro e ao longo de toda a sua extensão.",
      "quiz.easy.8.q":"Quantos sets tem normalmente um jogo clássico ITTF (competição)?",
      "quiz.easy.8.o0":"3",
      "quiz.easy.8.o1":"5",
      "quiz.easy.8.o2":"7",
      "quiz.easy.8.o3":"9",
      "quiz.easy.8.exp":"Na maioria das competições ITTF usa-se o formato melhor de 7 (4 sets ganhos para vencer). Para muitos eventos usa-se também melhor de 5 ou 3.",
      "quiz.easy.9.q":"O que acontece se a bola toca a rede durante o serviço?",
      "quiz.easy.9.o0":"Recomeça-se (let)",
      "quiz.easy.9.o1":"Ponto para o adversário",
      "quiz.easy.9.o2":"Ponto para quem serve",
      "quiz.easy.9.o3":"Segunda oportunidade",
      "quiz.easy.9.exp":"Se a bola toca a rede e cai na metade correta da mesa, é um 'let' e o serviço é repetido sem penalização.",
      "quiz.easy.10.q":"Em que lado da mesa deve cair a bola no serviço (jogo de singulares)?",
      "quiz.easy.10.o0":"Só no lado esquerdo",
      "quiz.easy.10.o1":"Em qualquer ponto da metade do adversário",
      "quiz.easy.10.o2":"Só no lado direito",
      "quiz.easy.10.o3":"Na diagonal",
      "quiz.easy.10.exp":"Em singulares, a bola deve apenas cair na metade da mesa do adversário, em qualquer ponto. Não há restrição diagonal (ao contrário dos pares).",
      "quiz.easy.11.q":"Qual a cor padrão da superfície da mesa ITTF?",
      "quiz.easy.11.o0":"Azul ou verde",
      "quiz.easy.11.o1":"Vermelho ou amarelo",
      "quiz.easy.11.o2":"Branco",
      "quiz.easy.11.o3":"Preto",
      "quiz.easy.11.exp":"A superfície da mesa deve ser de cor uniforme, mate (não brilhante), tipicamente azul escuro ou verde.",
      "quiz.easy.12.q":"O que é um 'expedite system' (sistema de aceleração)?",
      "quiz.easy.12.o0":"Forma de acelerar o serviço",
      "quiz.easy.12.o1":"Sistema de desempate por sorteio",
      "quiz.easy.12.o2":"Regra que limita um set a 10 minutos de duração",
      "quiz.easy.12.o3":"Sistema de pontuação dupla",
      "quiz.easy.12.exp":"Após 10 minutos de jogo num set, entra em vigor o 'expedite system': o ponto é ganho pelo recetor se o servidor fizer 13 pancadas consecutivas sem ganhar o ponto.",
      "quiz.easy.13.q":"Em pares, qual é a regra do serviço?",
      "quiz.easy.13.o0":"Qualquer jogador pode servir para qualquer lado",
      "quiz.easy.13.o1":"A bola deve ir em diagonal — metade direita para metade direita",
      "quiz.easy.13.o2":"A bola deve ir para a metade esquerda do adversário",
      "quiz.easy.13.o3":"Não há restrições em pares",
      "quiz.easy.13.exp":"Em pares (duplas), o serviço deve ser feito em diagonal: da metade direita do servidor para a metade direita do recetor.",
      "quiz.easy.14.q":"Um jogador pode apoiar a mão livre na mesa durante o jogo?",
      "quiz.easy.14.o0":"Sim, é permitido",
      "quiz.easy.14.o1":"Não, ponto para o adversário se tocar",
      "quiz.easy.14.o2":"Só no lado do próprio jogador",
      "quiz.easy.14.o3":"Apenas durante o serviço",
      "quiz.easy.14.exp":"Se a mão livre (a que não segura a raquete) tocar a superfície de jogo durante um rally, o ponto é perdido pelo jogador infrator.",
      "quiz.medium.0.q":"Após um 'let' no serviço, o que acontece ao par de pontos desse serviço?",
      "quiz.medium.0.o0":"O serviço é repetido, sem mudar a contagem",
      "quiz.medium.0.o1":"Perde-se um dos dois pontos desse par",
      "quiz.medium.0.o2":"O par de serviços reinicia",
      "quiz.medium.0.o3":"O adversário ganha o serviço",
      "quiz.medium.0.exp":"Um 'let' anula o serviço. O servidor repete exatamente o mesmo serviço, sem alterar nenhum marcador ou par de pontos.",
      "quiz.medium.1.q":"Quando começa exatamente o 'expedite system'?",
      "quiz.medium.1.o0":"Quando o marcador chega a 9-9",
      "quiz.medium.1.o1":"Após 10 minutos de jogo num set, se nenhum jogador ainda tiver 9 pontos",
      "quiz.medium.1.o2":"Sempre que um set dura mais de 8 minutos",
      "quiz.medium.1.o3":"Quando o atacante faz 10 pancadas seguidas",
      "quiz.medium.1.exp":"O expedite system é introduzido após 10 minutos de jogo num set, desde que nenhum dos jogadores tenha chegado aos 9 pontos. A qualquer momento pode ser pedido por ambos os jogadores.",
      "quiz.medium.2.q":"O que acontece se a bola toca a borda lateral da mesa?",
      "quiz.medium.2.o0":"É 'let'",
      "quiz.medium.2.o1":"Ponto para quem bateu na bola",
      "quiz.medium.2.o2":"Ponto para o adversário",
      "quiz.medium.2.o3":"Repetição do ponto",
      "quiz.medium.2.exp":"A borda lateral (borda lateral da superfície de jogo) não é válida. Se a bola toca a borda lateral, é ponto para o adversário.",
      "quiz.medium.3.q":"A bola pode tocar a borda superior da mesa (edge) e ser boa?",
      "quiz.medium.3.o0":"Sim, é ponto válido",
      "quiz.medium.3.o1":"Não, é falta",
      "quiz.medium.3.o2":"Apenas no serviço",
      "quiz.medium.3.o3":"Apenas se cair para dentro",
      "quiz.medium.3.exp":"Se a bola toca a borda superior da mesa (edge — a superfície de jogo), é um ponto válido, pois faz parte da superfície de jogo.",
      "quiz.medium.4.q":"Qual é o peso oficial de uma bola ITTF?",
      "quiz.medium.4.o0":"2,0 g",
      "quiz.medium.4.o1":"2,3 g",
      "quiz.medium.4.o2":"2,7 g",
      "quiz.medium.4.o3":"3,0 g",
      "quiz.medium.4.exp":"A bola oficial ITTF pesa 2,7 gramas.",
      "quiz.medium.5.q":"Durante o serviço, em que posição deve estar a palma da mão livre ao lançar a bola?",
      "quiz.medium.5.o0":"Aberta e plana, acima do nível da mesa",
      "quiz.medium.5.o1":"Fechada em punho",
      "quiz.medium.5.o2":"Apontada para o adversário",
      "quiz.medium.5.o3":"Abaixo do nível da mesa",
      "quiz.medium.5.exp":"A bola deve estar na palma da mão aberta e imóvel, acima do nível da superfície de jogo, antes de ser lançada para o serviço.",
      "quiz.medium.6.q":"O topo da rede pode ser tocado pela bola durante um rally (não no serviço)?",
      "quiz.medium.6.o0":"Sim, se cair do outro lado é ponto válido",
      "quiz.medium.6.o1":"Não, é sempre falta",
      "quiz.medium.6.o2":"Só se a bola não parar na rede",
      "quiz.medium.6.o3":"É sempre 'let'",
      "quiz.medium.6.exp":"Durante o rally, se a bola toca o topo da rede e cai válida no outro lado, o ponto é válido (não é let — o let só existe no serviço).",
      "quiz.medium.7.q":"Se um jogador interrompe o jogo intencionalmente sem razão válida, o que acontece?",
      "quiz.medium.7.o0":"O set é anulado",
      "quiz.medium.7.o1":"O árbitro dá um aviso oral",
      "quiz.medium.7.o2":"O ponto em disputa é atribuído ao adversário",
      "quiz.medium.7.o3":"O jogador é desqualificado",
      "quiz.medium.7.exp":"Interrupção deliberada do jogo é considerada 'má conduta'. O árbitro pode atribuir o ponto ao adversário como penalização.",
      "quiz.medium.8.q":"Em singulares, o servidor tem de bater na bola do próprio lado antes de ir para o outro lado?",
      "quiz.medium.8.o0":"Sim, obrigatório",
      "quiz.medium.8.o1":"Não, a bola vai diretamente para o lado do adversário",
      "quiz.medium.8.o2":"Só no primeiro serviço de cada jogo",
      "quiz.medium.8.o3":"Depende do modo de jogo",
      "quiz.medium.8.exp":"Em singulares, a bola vai diretamente da raquete para a metade do adversário, sem tocar no lado do servidor. É em pares que o serviço deve ser diagonal.",
      "quiz.medium.9.q":"O que é um 'good return' (devolução válida)?",
      "quiz.medium.9.o0":"Bola que toca sempre a rede",
      "quiz.medium.9.o1":"Bola que bate na mesa do servidor",
      "quiz.medium.9.o2":"Bola que cai fora da mesa",
      "quiz.medium.9.o3":"Bola que passa a rede e cai dentro da mesa do adversário ou na borda",
      "quiz.medium.9.exp":"Uma devolução válida é aquela em que a bola (após ser batida) passa sobre ou à volta da rede e cai na área de jogo do adversário ou na borda superior da mesa.",
      "quiz.medium.10.q":"Pode um jogador bater na bola antes de ela tocar a sua metade da mesa (volley)?",
      "quiz.medium.10.o0":"Sim, se a bola estiver a sair da mesa",
      "quiz.medium.10.o1":"Não, ponto para o adversário",
      "quiz.medium.10.o2":"Só no último ponto do set",
      "quiz.medium.10.o3":"Apenas se a bola tocar a rede antes",
      "quiz.medium.10.exp":"É proibido bater na bola antes de ela tocar a sua metade da mesa (volley). Se o fizer, perde o ponto, mesmo que a bola fosse para fora.",
      "quiz.medium.11.q":"O que sucede se o servidor lança a bola e decide não a bater?",
      "quiz.medium.11.o0":"É automático 'let'",
      "quiz.medium.11.o1":"É falta e ponto para o adversário",
      "quiz.medium.11.o2":"Pode apanhar a bola e repetir",
      "quiz.medium.11.o3":"É aviso oral do árbitro",
      "quiz.medium.11.exp":"Se o servidor lançar a bola para o serviço e não a bater, é falta — o ponto vai para o adversário.",
      "quiz.medium.12.q":"Se a bola em jogo toca num objeto alheio (roupa do jogador, etc.), o que acontece?",
      "quiz.medium.12.o0":"Ponto para o adversário",
      "quiz.medium.12.o1":"É 'let'",
      "quiz.medium.12.o2":"O ponto é repetido",
      "quiz.medium.12.o3":"Depende do árbitro",
      "quiz.medium.12.exp":"Se a bola em jogo tocar qualquer coisa que não seja a rede, os seus suportes ou a mesa, o ponto vai para o adversário.",
      "quiz.medium.13.q":"Qual é a altura mínima do teto ou obstáculo acima da mesa em competições ITTF?",
      "quiz.medium.13.o0":"3 m",
      "quiz.medium.13.o1":"4 m",
      "quiz.medium.13.o2":"5 m",
      "quiz.medium.13.o3":"6 m",
      "quiz.medium.13.exp":"A ITTF recomenda pelo menos 5 metros de espaço livre acima da mesa para competições internacionais.",
      "quiz.medium.14.q":"Em pares, após cada set, como muda a ordem de serviço?",
      "quiz.medium.14.o0":"Mantém-se igual",
      "quiz.medium.14.o1":"O recetor do último serviço torna-se servidor",
      "quiz.medium.14.o2":"O parceiro do servidor torna-se o próximo servidor",
      "quiz.medium.14.o3":"Escolha livre dos jogadores",
      "quiz.medium.14.exp":"Em pares, o par que recebeu no set anterior passará a servir, e o jogador que serviu por último passará a receber.",
      "quiz.hard.0.q":"Segundo o regulamento ITTF, quais as cores obrigatórias dos revestimentos (borrachas) de uma raquete?",
      "quiz.hard.0.o0":"Um lado vermelho, outro lado preto",
      "quiz.hard.0.o1":"Qualquer cor, desde que diferentes",
      "quiz.hard.0.o2":"Azul e vermelho",
      "quiz.hard.0.o3":"Verde e preto",
      "quiz.hard.0.exp":"O regulamento ITTF exige que os dois lados da raquete sejam obrigatoriamente um vermelho e um preto, para que o adversário possa distinguir os revestimentos.",
      "quiz.hard.1.q":"Qual a espessura máxima do revestimento (borracha + esponja) numa raquete aprovada ITTF?",
      "quiz.hard.1.o0":"3 mm",
      "quiz.hard.1.o1":"3,5 mm",
      "quiz.hard.1.o2":"4 mm",
      "quiz.hard.1.o3":"5 mm",
      "quiz.hard.1.exp":"A espessura total de cada lado do revestimento (borracha mais esponja, se existir) não pode exceder 4 mm.",
      "quiz.hard.2.q":"O que significa 'ITTF approved' numa bola?",
      "quiz.hard.2.o0":"Bola fabricada em China",
      "quiz.hard.2.o1":"Bola testada e homologada pela ITTF para competições internacionais",
      "quiz.hard.2.o2":"Bola usada nos Jogos Olímpicos",
      "quiz.hard.2.o3":"Bola de 38 mm (formato antigo)",
      "quiz.hard.2.exp":"'ITTF approved' significa que a bola foi testada e está na lista de produtos aprovados pela ITTF, cumprindo todos os critérios de tamanho, peso, redondeza e cor.",
      "quiz.hard.3.q":"Segundo a ITTF, pode-se usar revestimentos anti-spin (lisos) na raquete?",
      "quiz.hard.3.o0":"Sim, desde que sejam aprovados pela ITTF",
      "quiz.hard.3.o1":"Não, são proibidos em todas as competições",
      "quiz.hard.3.o2":"Só em competições nacionais",
      "quiz.hard.3.o3":"Apenas num dos lados",
      "quiz.hard.3.exp":"Revestimentos anti-spin (pimple-out ou lisos) são permitidos desde que estejam na lista aprovada pela ITTF. A lista de borrachas homologadas é publicada e atualizada regularmente.",
      "quiz.hard.4.q":"Num torneio ITTF, se um jogador parte a raquete durante o jogo, o que pode fazer?",
      "quiz.hard.4.o0":"Continuar com qualquer raquete disponível",
      "quiz.hard.4.o1":"Deve sair do torneio",
      "quiz.hard.4.o2":"Pode substituí-la por uma pré-aprovada pelo árbitro",
      "quiz.hard.4.o3":"Pede 5 minutos de pausa para substituir",
      "quiz.hard.4.exp":"Se a raquete ficar inutilizável, o jogador pode substituí-la, mas a raquete substituta deve ser aprovada pelo árbitro.",
      "quiz.hard.5.q":"Qual é o procedimento correto da inspeção de raquetes em competições ITTF?",
      "quiz.hard.5.o0":"Apenas o árbitro principal inspeciona antes da final",
      "quiz.hard.5.o1":"Os jogadores mostram as raquetes ao adversário e ao árbitro antes do início do jogo",
      "quiz.hard.5.o2":"Só se houver protesto do adversário",
      "quiz.hard.5.o3":"Só em competições com classificação mundial",
      "quiz.hard.5.exp":"Em competições ITTF, cada jogador deve mostrar a sua raquete ao adversário e ao árbitro antes do início do jogo (e após o jogo, se solicitado).",
      "quiz.hard.6.q":"Em condições normais, a que intervalo muda a bola num match de competição ITTF?",
      "quiz.hard.6.o0":"Cada set",
      "quiz.hard.6.o1":"Cada 3 pontos",
      "quiz.hard.6.o2":"Início de cada jogo ou quando danificada",
      "quiz.hard.6.o3":"Nunca, só por dano",
      "quiz.hard.6.exp":"A bola é substituída no início de cada jogo (match) ou quando está visivelmente danificada durante o jogo.",
      "quiz.hard.7.q":"O que diz a regra ITTF sobre o uso de substâncias na raquete ('speed glue')?",
      "quiz.hard.7.o0":"É permitido com aprovação prévia",
      "quiz.hard.7.o1":"Está completamente proibido desde 2008",
      "quiz.hard.7.o2":"É permitido apenas em competições nacionais",
      "quiz.hard.7.o3":"Necessita de certificado médico",
      "quiz.hard.7.exp":"O uso de cola rápida (speed glue) e adesivos com solventes orgânicos foi proibido pela ITTF em 2008. Só são permitidos adesivos aquosos (water-based).",
      "quiz.hard.8.q":"Segundo as regras ITTF, o que é uma 'bad service' (serviço inválido) não corrigida pelo árbitro após advertência?",
      "quiz.hard.8.o0":"Ponto imediato para o adversário",
      "quiz.hard.8.o1":"Segundo serviço",
      "quiz.hard.8.o2":"Let repetido",
      "quiz.hard.8.o3":"Desclassificação",
      "quiz.hard.8.exp":"Após advertência por mau serviço, qualquer serviço subsequente inválido resulta em ponto direto para o adversário, sem necessidade de nova advertência.",
      "quiz.hard.9.q":"Qual é a regra ITTF sobre o 'time-out' (pausa) num jogo?",
      "quiz.hard.9.o0":"Não é permitido time-out",
      "quiz.hard.9.o1":"Cada equipa tem 2 time-outs por jogo",
      "quiz.hard.9.o2":"Cada jogador/equipa tem direito a 1 time-out de 1 minuto por jogo",
      "quiz.hard.9.o3":"Só o árbitro pode interromper o jogo",
      "quiz.hard.9.exp":"Cada jogador (ou equipa em pares) tem direito a um time-out de 1 minuto por match (não por set). Pode ser pedido em qualquer momento, exceto durante o serviço.",
      "quiz.hard.10.q":"O que prevê o regulamento ITTF sobre o treinador (coach) durante o jogo?",
      "quiz.hard.10.o0":"O treinador pode dar instruções em qualquer momento",
      "quiz.hard.10.o1":"O treinador só pode dar instruções durante os intervalos entre sets e durante os time-outs",
      "quiz.hard.10.o2":"O treinador pode entrar na área de jogo",
      "quiz.hard.10.o3":"Não há regulação sobre o comportamento do treinador",
      "quiz.hard.10.exp":"O treinador só pode comunicar com o jogador durante os intervalos entre sets e durante os time-outs solicitados. Não é permitido qualquer tipo de instrução durante o jogo em si.",
      "quiz.hard.11.q":"O que são 'pimples-out' (espinhos para fora) num revestimento de raquete?",
      "quiz.hard.11.o0":"Revestimento com espinhos virados para dentro",
      "quiz.hard.11.o1":"Revestimento completamente liso",
      "quiz.hard.11.o2":"Revestimento com espinhos virados para fora, sem camada de esponja atrás",
      "quiz.hard.11.o3":"Borracha especial para defesa",
      "quiz.hard.11.exp":"'Pimples-out' (OX ou sem esponja) é um revestimento com os espinhos de borracha virados para fora. Reduz o efeito (spin) mas melhora o controlo. É permitido pela ITTF se aprovado.",
      "quiz.hard.12.q":"Quantos minutos de intervalo são permitidos entre sets num jogo ITTF?",
      "quiz.hard.12.o0":"1 minuto",
      "quiz.hard.12.o1":"2 minutos",
      "quiz.hard.12.o2":"3 minutos",
      "quiz.hard.12.o3":"5 minutos",
      "quiz.hard.12.exp":"O intervalo entre sets num jogo ITTF tem a duração máxima de 1 minuto.",
      "quiz.hard.13.q":"O que é o 'phantom serve' e qual é a sua situação regulamentar?",
      "quiz.hard.13.o0":"Serviço invisível, permitido",
      "quiz.hard.13.o1":"Serviço em que a raquete não toca claramente a bola, proibido",
      "quiz.hard.13.o2":"Serviço com rotação excessiva, limitada a 3000 RPM",
      "quiz.hard.13.o3":"Serviço com bola lançada mais de 30 cm, obrigatório",
      "quiz.hard.13.exp":"O 'phantom serve' esconde o contato da bola com a raquete (com o corpo ou braço livre), impossibilitando o adversário de ver o momento do impacto. É proibido pelas regras ITTF.",
      "quiz.hard.14.q":"Em competições ITTF, o que especifica a regra sobre a iluminação da área de jogo?",
      "quiz.hard.14.o0":"Mínimo de 200 lux",
      "quiz.hard.14.o1":"Mínimo de 500 lux",
      "quiz.hard.14.o2":"Mínimo de 1000 lux no plano da mesa, sem luz natural direta",
      "quiz.hard.14.o3":"Sem requisitos específicos",
      "quiz.hard.14.exp":"A ITTF recomenda pelo menos 1000 lux uniformemente sobre a superfície da mesa, sem luz solar direta, para competições internacionais."
    },
    ja: {
      "menu.newGame":"新しいゲーム",
      "menu.newGameSub":"プレイヤーを選んで開始",
      "menu.tournament":"トーナメント",
      "menu.tournamentSub":"自動シードによる決勝トーナメント",
      "menu.players":"プレイヤー",
      "menu.playersSub":"管理と統計表示",
      "menu.history":"履歴",
      "menu.historySub":"過去の試合",
      "menu.data":"データ",
      "menu.dataSub":"バックアップのエクスポートまたはインポート",
      "menu.footer":"データはこの端末にのみ保存されます",
      "screen.players":"プレイヤー",
      "screen.history":"履歴",
      "screen.gameDetail":"試合詳細",
      "screen.newGame":"新しいゲーム",
      "screen.gameType":"ゲームタイプ",
      "screen.pointsFormat":"得点とフォーマット",
      "screen.newTournament":"新しいトーナメント",
      "screen.tournament":"トーナメント",
      "screen.minigames":"ミニゲーム",
      "screen.achievements":"実績",
      "screen.records":"記録",
      "screen.data":"データ",
      "btn.addPlayer":"＋ 新規",
      "btn.deletePlayer":"削除",
      "btn.abandon":"棄権",
      "btn.continue":"続ける ▸",
      "btn.startGame":"試合開始",
      "btn.createTournament":"トーナメント作成",
      "btn.backMenu":"メニューに戻る",
      "btn.start":"開始",
      "serve.title":"サービス",
      "serve.hint":"が先にサービス",
      "setup.bluePlayer":"青サイド",
      "setup.whitePlayer":"白サイド",
      "setup.pointsPerSet":"1ゲームの得点",
      "setup.format":"フォーマット",
      "mg.tap":"クイックタップ",
      "mg.tapSub":"消える前に点をタップ",
      "mg.memory":"視覚記憶",
      "mg.memorySub":"シーケンスを覚えて繰り返す",
      "ach.unlocked":"🏆 実績解除！",
      "data.export":"バックアップを書き出す",
      "data.exportSub":"すべてを含む .json ファイルを生成",
      "data.import":"バックアップを読み込む",
      "data.importSub":"バックアップからデータを追加または統合",
      "data.wipe":"全データを削除",
      "data.wipeSub":"この端末からプレイヤーと履歴を削除",
      "js.choosePlayer":"プレイヤーを選択",
      "js.sideBlue":"青",
      "js.sideWhite":"白",
      "js.continue":"このまま続ける ▸",
      "js.nextSet":"次のゲーム ▸",
      "js.undoMsg":"最後の得点を取り消しました。試合を続けてください。",
      "js.setInProgress":"進行中のゲーム（%b-%w）はカウントされません。終了したゲームは履歴に保存されます。",
      "js.confirmEnd":"現在の結果が履歴に保存されます。",
      "js.confirmWipe":"全データを削除しますか？",
      "js.confirmAbandon":"トーナメントを棄権しますか？",
      "js.emptyPlayers":"先にプレイヤーを作成してください。",
      "js.noData":"データなし",
      "js.wins":"勝",
      "js.losses":"敗",
      "js.draws":"分",
      "js.capotes":"完封",
      "js.winRate":"勝率",
      "js.elo":"レーティング",
      "js.allPlayers":"全プレイヤー",
      "js.serve":"サービス",
      "js.notServe":"レシーブ",
      "js.set":"ゲーム",
      "js.bestOf":"先取",
      "js.free":"フリー",
      "js.classic":"クラシック",
      "js.custom":"カスタム",
      "js.gameWon":"%n がマッチ勝利",
      "js.setWon":"%n がゲーム勝利",
      "js.deuce":"デュース",
      "js.matchPoint":"マッチポイント",
      "js.capoteTag":"完封",
      "js.newRecord":"🏆 新記録！",
      "js.points":"得点",
      "js.level":"レベル",
      "js.levelReached":"到達レベル",
      "js.playAgain":"もう一度",
      "js.tbd":"未定",
      "js.play":"▶ プレイ",
      "js.whoseServe":"第%nゲーム · 最初のサービスは？",
      "js.champion":"🏆 トーナメント優勝者",
      "js.winsLabel":"勝",
      "js.lossesLabel":"敗",
      "js.drawsLabel":"分",
      "js.capotesLabel":"完封",
      "js.winRateLabel":"勝率",
      "js.eloLabel":"R",
      "js.bestRival":"得意な相手",
      "js.worstRival":"苦手な相手",
      "js.last10":"直近10試合",
      "js.streak":"現在の連勝",
      "js.setsWon":"獲得ゲーム",
      "js.setsLost":"失ゲーム",
      "js.capotesMade":"完封勝利",
      "js.capotesSuffered":"完封負け",
      "js.tournamentsWon":"優勝回数",
      "js.tournamentsPlayed":"参加トーナメント",
      "js.trainingMin":"分 練習",
      "js.trainingSessions":"セッション",
      "js.importReplace":"すべて置き換え",
      "js.importMerge":"既存データに追加",
      "js.importDetailFile":"ファイルには %p 人のプレイヤーと %g 試合が含まれます。",
      "js.importDetailMerge":"<strong>追加</strong>すると %np 人の新プレイヤーと %ng 試合が追加されます（同名は統合；重複は無視）。",
      "js.importDetailReplace":"<strong>すべて置き換え</strong>は現在の %p 人と %g 試合を削除し、ファイルの内容のみ残します。",
      "js.recElo":"最高レーティング",
      "js.recStreak":"最長連勝",
      "js.recWins":"最多勝利",
      "js.recCapotes":"最多完封",
      "js.recTournaments":"最多優勝",
      "js.recPoints":"最多得点",
      "js.recDuration":"最長試合",
      "js.recMgTap":"クイックタップ記録",
      "js.recMgMemory":"記憶ゲーム記録",
      "js.recEloGain":"最大レーティング上昇",
      "js.wins_unit":"勝",
      "js.min_unit":"分",
      "js.pts_unit":"点",
      "js.roundQF":"準々決勝",
      "js.roundSF":"準決勝",
      "js.roundF":"決勝",
      "js.serveEvery2":"2点ごとにサービス交代",
      "js.serveEvery5":"5点ごとにサービス交代",
      "js.serveEvery1":"1点ごとにサービス交代（デュース）",
      "js.eraseConfirm":"本当に削除しますか？この操作は元に戻せません。",
      "js.missedGame":"ミス — 最後の得点を取り消す",
      "js.gameInProgress":"試合が進行中です",
      "js.tournamentInProgress":"トーナメントが進行中です",
      "js.resumeGame":"試合を再開 ▸",
      "js.resumeTournament":"トーナメントを再開 ▸",
      "js.endOfSet":"ゲーム終了",
      "js.endOfSetCapote":"ゲーム終了 · 完封",
      "js.endOfSetDeciding":"ゲーム終了 · マッチ確定",
      "js.endOfSetCapoteDeciding":"ゲーム終了 · 完封 · マッチ確定",
      "js.endOfGame":"マッチ終了",
      "js.endOfGameCapote":"マッチ終了 · 完封",
      "js.drawBetween":"引き分け：",
      "js.chooseBlue":"選択 — 青サイド",
      "js.chooseWhite":"選択 — 白サイド",
      "js.noPlayersYet":"プレイヤーが作成されていません。<br>メニューに戻ってプレイヤーを作成してください。",
      "js.trainingTitle":"練習モード",
      "js.trainingFree":"フリータイマー",
      "js.trainingTimed":"タイム制練習",
      "js.trainingModeFree":"フリーモード",
      "js.trainingModeTimed":"練習 %n 分",
      "js.mgMemorize":"覚えて！",
      "js.mgYourTurn":"あなたの番！",
      "js.mgPoints":"得点：",
      "js.mgLevel":"レベル",
      "js.mgLevelReached":"到達レベル：",
      "js.mgRecord":"記録：",
      "js.mgMemoryTitle":"視覚記憶",
      "js.achSecret":"シークレット実績解除！",
      "js.achSecretDesc":"シークレット実績。プレイを続けて発見しよう。",
      "js.cancel":"キャンセル",
      "js.save":"保存",
      "js.undo":"最後の得点を取り消す",
      "js.pause":"タイマーを一時停止",
      "js.modeCustom":"カスタム",
      "js.modeClassic":"クラシック",
      "js.modeClassicDesc":"1ゲーム11点 · BO3、BO5、BO7",
      "js.formatFree":"フリー",
      "js.formatBo3":"3ゲームマッチ",
      "js.formatBo5":"5ゲームマッチ",
      "js.formatBo7":"7ゲームマッチ",
      "js.setBalanced":"拮抗したゲーム",
      "js.descPlaceholder":"例：夏のトーナメント、ゲームルーム...",
      "js.shortcutTraining":"練習モード",
      "js.shortcutMinigames":"ミニゲーム",
      "js.shortcutAchievements":"実績",
      "js.shortcutRecords":"記録",
      "js.setLabel":"ゲーム",
      "js.noHistory":"履歴にまだ試合がありません。",
      "js.catFirstSteps":"はじめの一歩",
      "js.catWins":"勝利",
      "js.catSets":"ゲーム",
      "js.catComebacks":"逆転",
      "js.catElo":"レーティング",
      "js.catPoints":"得点",
      "js.catTournaments":"トーナメント",
      "js.catRivalries":"ライバル関係",
      "js.catTraining":"練習",
      "js.catMinigames":"ミニゲーム",
      "js.catSpecials":"特別",
      "js.noDataYet":"まだデータなし",
      "js.bracketTbd":"未定",
      "js.noPlayersEmpty":"まだプレイヤーがいません。<br>'＋ 新規'をタップして最初のプレイヤーを追加してください。",
      "js.leaderboard":"リーダーボード · トップ%n",
      "js.playerCol":"プレイヤー",
      "js.gamesUnit":"%n試合",
      "js.noGamesProfile":"まだ試合の記録がありません。",
      "js.resultDraw":"引き分け",
      "js.resultWon":"勝利",
      "js.resultLost":"敗北",
      "js.gamesDisputed":"%n試合",
      "js.headToHead":"直接対決",
      "js.recentGames":"最近の試合",
      "js.scorerColor":"スコアボードの色",
      "js.eloLabel2":"ELO（楽しさ）",
      "js.statGamesPlayed":"試合数",
      "js.statGamesWon":"勝利数",
      "js.statGamesLost":"敗北数",
      "js.statGamesDrawn":"引き分け数",
      "js.statSetsWonV":"獲得セット数（勝利）",
      "js.statSetsLostD":"失セット数（敗北）",
      "js.statTotalSetsWon":"総獲得セット数",
      "js.statTotalSetsLost":"総失セット数",
      "js.statCapotesMade":"完封した回数",
      "js.statCapotesSuffered":"完封された回数",
      "js.statTournamentsWon":"優勝したトーナメント",
      "js.statTournamentsTotal":"参加したトーナメント",
      "js.bestRivalAgainst":"%nに最多勝利",
      "js.worstRivalAgainst":"%nに最多敗北",
      "js.noHistoryYet":"まだ試合履歴がありません。<br>最初の試合をプレイすると表示されます。",
      "js.draw":"引き分け",
      "js.setsSep":"セット",
      "js.xCapote":"%n回完封",
      "js.modeFree":"フリー",
      "js.modeMd3":"BO3",
      "js.modeMd5":"BO5",
      "js.modeMd7":"BO7",
      "js.gameEndedDraw":"試合は引き分けで終了しました",
      "js.setsWonBy":"セット（%nが試合に勝利）",
      "js.ptsPerSet":"セットあたりの点数",
      "js.duration":"時間",
      "js.setRecap":"第%nセット",
      "js.undoToast":"最後の得点を取り消しました — セットを続けられます。",
      "js.statsSaved":"保存済みプレイヤー",
      "js.gamesInHistory":"履歴の試合数",
      "js.exportedToast":"バックアップをエクスポートしました：%f",
      "js.importedToast":"インポートしました：%pプレイヤー、%g試合",
      "js.invalidFile":"無効または破損したファイルです。",
      "js.cantReadFile":"ファイルを読み込めませんでした。",
      "js.invalidFormat":"無効なファイル：予期しない形式です。",
      "js.invalidBackup":"無効なファイル：PLACARのバックアップではありません。",
      "js.replacedToast":"データを正常に置き換えました。",
      "js.wipedToast":"すべてのデータが削除されました。",
      "js.createPlayersFirst":"まずプレイヤーを作成してください。",
      "js.roundLabel":"第%nラウンド",
      "js.tournamentWinnerSub":"%m試合 · %pプレイヤー",
      "js.choosePlayerFirst":"まずプレイヤーを選択してください",
      "js.recMgMemory2":"視覚記憶記録",
      "js.recMorePoints":"最多獲得ポイント",
      "js.recMoreTraining":"最長トレーニング時間",
      "js.levelPrefix":"レベル",
      "js.winsUnit":" 勝",
      "js.capotesUnit":" 回完封",
      "js.tournamentsUnit":" トーナメント",
      "js.pointsUnit":" ポイント",
      "js.minUnit":" 分",
      "js.achProgressText":"%d / %t 実績",
      "js.setup.pts11":"11点",
      "js.setup.pts21":"21点",
      "js.overlay.endGameTitle":"試合終了",
      "js.overlay.confirmEnd":"試合終了を確認しますか？",
      "js.overlay.confirmEndBtn":"終了",
      "js.data.backup":"バックアップ",
      "js.data.wipeAll":"すべて削除",
      "js.mg.playAs":"プレイヤーとして",
      "js.tournament.size":"サイズ",
      "js.tournament.mode":"モード",
      "js.mode.customDesc":"11点または21点 · フリー、BO3またはBO5 · 5点ごとにサービス交代",
      "mg.quiz":"ルールクイズ",
      "mg.quizSub":"ITTFルールの知識をテスト",
      "mg.rules":"ITTFルール",
      "mg.rulesSub":"卓球の全公式ルール",
      "js.mgQuizScore":"得点：",
      "js.mgQuizIntro":"難易度を選んでください",
      "js.mgQuizEasy":"かんたん",
      "js.mgQuizEasyDesc":"基本的なゲームルール",
      "js.mgQuizMedium":"ふつう",
      "js.mgQuizMediumDesc":"サービスと採点のルール",
      "js.mgQuizHard":"むずかしい",
      "js.mgQuizHardDesc":"規則とトーナメント",
      "js.mgQuizBestScore":"ベストスコア：",
      "js.mgQuizNext":"次へ ▸",
      "js.mgQuizFinalScore":"最終スコア：",
      "js.mgQuizCorrect":"正解！✓",
      "js.mgQuizWrong":"不正解 ✗",
      "js.mgQuizChooseFirst":"先にプレイヤーを選択してください",
      "js.mgQuizResultGreat":"素晴らしい！ルールをよく知っています！",
      "js.mgQuizResultGood":"よくできました！ルールの学習を続けてください。",
      "js.mgQuizResultTry":"練習を続けてITTFルールを読んでください。",
      "js.langBtn":"言語",
      "js.settingsBtn":"設定",
      "js.descLabel":"説明",
      "js.optional":"（任意）",
      "js.nPlayers4":"4人",
      "js.nPlayers8":"8人",
      "js.nPlayers16":"16人",
      "js.trainingDuration":"時間（分）",
      "js.back":"‹ 戻る",
      "js.gameEndedTitle":"試合終了",
      "js.backToMenu":"メニューに戻る",
      "js.newPlayerTitle":"新しいプレイヤー",
      "js.newPlayerName":"プレイヤー名",
      "js.playerNamePlaceholder":"例：田中",
      "js.colorPickerLabel":"スコアボードの色",
      "js.color.blueWhite":"青 / 白",
      "js.color.greenWhite":"緑 / 白",
      "js.color.redWhite":"赤 / 白",
      "js.color.pinkWhite":"ピンク / 白",
      "js.color.purpleWhite":"紫 / 白",
      "js.color.goldWhite":"金 / 白",
      "js.color.whiteBlack":"白 / 黒",
      "js.color.orangeWhite":"オレンジ / 白",
      "js.dataExplain":"プレイヤーと履歴をクラウド（ドライブ、メールなど）に保存できるファイルに書き出し、この端末や他の端末で復元できます。",
      "js.importTitle":"データのインポート",
      "js.importQuestion":"どうしますか？",
      "js.importDetail":"この端末に保存されているプレイヤーと履歴が置き換えられます。",
      "js.mergeImport":"既存データに追加",
      "js.replaceImport":"すべて置き換え",
      "js.wipeTitle":"全削除",
      "js.wipeQuestion":"すべてのデータを削除しますか？",
      "js.wipeDetail":"この操作は元に戻せません。先にバックアップのエクスポートを検討してください。",
      "js.wipeConfirm":"すべて削除",
      "js.rotateHint":"タブレットを横向きにしてください",
      "js.overlay.confirmEndDetail":"現在の結果が履歴に保存されます。",
      "ach.first_point.name":"最初の得点",
      "ach.first_point.desc":"最初の得点を決める。",
      "ach.first_set.name":"最初のセット",
      "ach.first_set.desc":"最初のセットを取る。",
      "ach.first_win.name":"初勝利",
      "ach.first_win.desc":"最初の試合に勝つ。",
      "ach.first_tournament.name":"初トーナメント",
      "ach.first_tournament.desc":"最初のトーナメントに参加する。",
      "ach.first_trophy.name":"初優勝",
      "ach.first_trophy.desc":"最初のトーナメントで優勝する。",
      "ach.wins_10.name":"10勝",
      "ach.wins_10.desc":"10試合勝つ。",
      "ach.wins_50.name":"50勝",
      "ach.wins_50.desc":"50試合勝つ。",
      "ach.wins_100.name":"100勝",
      "ach.wins_100.desc":"100試合勝つ。",
      "ach.wins_200.name":"200勝",
      "ach.wins_200.desc":"200試合勝つ。",
      "ach.streak_3.name":"ハットトリック",
      "ach.streak_3.desc":"3連勝。",
      "ach.streak_5.name":"絶好調",
      "ach.streak_5.desc":"5連勝。",
      "ach.streak_10.name":"止まらない",
      "ach.streak_10.desc":"10連勝。",
      "ach.streak_20.name":"無敵",
      "ach.streak_20.desc":"20連勝。",
      "ach.sweep.name":"完全制霸",
      "ach.sweep.desc":"セットを一つも落とさずに勝利する。",
      "ach.capote_set.name":"完封",
      "ach.capote_set.desc":"11-0でセットを取る。",
      "ach.set_perfect.name":"完璧なセット",
      "ach.set_perfect.desc":"3点以内に抑えてセットを取る。",
      "ach.deciding_set.name":"決着",
      "ach.deciding_set.desc":"最終セットで決まった試合に勝つ。",
      "ach.comeback.name":"逆転",
      "ach.comeback.desc":"第1セットを落とした後に勝つ。",
      "ach.comeback_02.name":"大逆転",
      "ach.comeback_02.desc":"セット0-2から逆転勝利する。",
      "ach.comeback_pts.name":"諸めない",
      "ach.comeback_pts.desc":"5点以上のビハインドからセットを取る。",
      "ach.elo_1000.name":"四桁",
      "ach.elo_1000.desc":"ELO 1000を達成する。",
      "ach.elo_1200.name":"1200クラブ",
      "ach.elo_1200.desc":"ELO 1200を達成する。",
      "ach.elo_1300.name":"エリート",
      "ach.elo_1300.desc":"ELO 1300を達成する。",
      "ach.elo_1500.name":"マスター",
      "ach.elo_1500.desc":"ELO 1500を達成する。",
      "ach.pts_100.name":"百点達成",
      "ach.pts_100.desc":"100点を積み重ねる。",
      "ach.pts_500.name":"500点",
      "ach.pts_500.desc":"500点を積み重ねる。",
      "ach.pts_1000.name":"1000点",
      "ach.pts_1000.desc":"1000点を積み重ねる。",
      "ach.tour_2.name":"二冠",
      "ach.tour_2.desc":"トーナメント2回優勝。",
      "ach.tour_3.name":"三冠",
      "ach.tour_3.desc":"トーナメント3回優勝。",
      "ach.rival_10.name":"クラシック",
      "ach.rival_10.desc":"同じ相手め10試合する。",
      "ach.rival_25.name":"ライバル",
      "ach.rival_25.desc":"同じ相手め25試合する。",
      "ach.rival_dom.name":"支配",
      "ach.rival_dom.desc":"同じ相手に10勝差をつける。",
      "ach.rival_5.name":"天敵",
      "ach.rival_5.desc":"同じ相手に5連勝する。",
      "ach.train_first.name":"初練習",
      "ach.train_first.desc":"練習セッションを完了する。",
      "ach.train_10m.name":"10分",
      "ach.train_10m.desc":"10分の練習を積む。",
      "ach.train_1h.name":"1時間",
      "ach.train_1h.desc":"60分の練習を積む。",
      "ach.train_5sess.name":"規律",
      "ach.train_5sess.desc":"5回の練習セッションを完了する。",
      "ach.mg_tap_10.name":"鉰の反射神経",
      "ach.mg_tap_10.desc":"クイックタップで\u001010点を取る。",
      "ach.mg_tap_30.name":"稲姻",
      "ach.mg_tap_30.desc":"クイックタップで\u001030点を取る。",
      "ach.mg_mem_5.name":"確かな記憶",
      "ach.mg_mem_5.desc":"視覚記憶でレベル5に到達する。",
      "ach.mg_mem_10.name":"鉄の記憶",
      "ach.mg_mem_10.desc":"視覚記憶でレベル10に到達する。",
      "ach.secret_11_0.name":"屈辱",
      "ach.secret_11_0.desc":"11-0でセットを取る。",
      "ach.secret_3_2.name":"限界を超えて",
      "ach.secret_3_2.desc":"第5セットで決まった試合に勝つ。",
      "ach.secret_11_9.name":"一点一点",
      "ach.secret_11_9.desc":"11-9でセットを取る。",
      "ach.secret_midnight.name":"深夜セッション",
      "ach.secret_midnight.desc":"深夜以降にプレイする。",
      "ach.secret_morning.name":"早起き",
      "ach.secret_morning.desc":"08:00前にプレイする。",
      "ach.secret_10day.name":"マシン",
      "ach.secret_10day.desc":"同じ日に10試合プレイする。",
      "rules.jogo.title":"試合 — 基本ルール",
      "rules.jogo.r0":"セットは先に11点を獲得し、かつ相手より2点以上リードしたプレーヤーが勝利する。",
      "rules.jogo.r1":"マッチは規定フォーマット（3セット、5セット、または7セットマッチ）で最多セットを獲得したプレーヤーが勝利する。",
      "rules.jogo.r2":"得点したプレーヤーが次のサービスを行う（またはローテーションに従ってサービスを保持する）。",
      "rules.jogo.r3":"試合中にラケットを持つ手以外の身体の部位にボールが触れた場合、失点となる。",
      "rules.jogo.r4":"フリーハンド（ラケットを持っていない手）はラリー中にプレー面に触れてはならない——違反した場合、相手の得点となる。",
      "rules.jogo.r5":"ボールがテーブルの上縁（エッジボール）に触れた場合、その得点は有効である。",
      "rules.jogo.r6":"ボールがテーブルの側面に触れた場合、相手の得点となる——側面はプレーエリアではない。",
      "rules.jogo.r7":"プレーヤーは自分のコートでバウンドする前にボールを打つことはできない（ノーバウンド禁止）。",
      "rules.jogo.r8":"証明可能な負傷、器具の故障、その他審判が認める理由がある場合、試合を中断できる。",
      "rules.jogo.r9":"セット内で10分間プレーが続いても両者が9点に達しない場合、促進ルールが適用される：サービス側が13打以内に得点できなければ、レシーバーの得点となる。",
      "rules.servico.title":"サービス",
      "rules.servico.r0":"サービス時、ボールはフリーハンドの開いた静止した手のひらの上に置き、テーブル面より上に保持する。",
      "rules.servico.r1":"ボールはほぼ垂直に少なくとも16cm上に投げ上げ、回転をかけてはならない。",
      "rules.servico.r2":"サーバーはボールが下降中に打ち、まず自コートに、次に相手コートに落とさなければならない。",
      "rules.servico.r3":"シングルスでは、ボールは相手コートのどこに落としてもよい。",
      "rules.servico.r4":"ダブルスでは、サービスは斜めに行う：サーバーの右半面からレシーバーの右半面へ。",
      "rules.servico.r5":"ボールとラケットの接触は相手と審判から見えなければならない——身体で隠してはならない。",
      "rules.servico.r6":"サービス時にボールがネットに触れて正しく着地した場合は「レット」となり、サービスをやり直す。",
      "rules.servico.r7":"警告後、さらに違法なサービスを行った場合は即座に相手の得点となる。",
      "rules.servico.r8":"サーバーがボールをトスしたがストロークできなかった場合、失点となる。",
      "rules.servico.r9":"サービス時、フリーアームはテーブル面より上に位置し、審判と相手から見える状態でなければならない。",
      "rules.pontuacao.title":"得点とサービスチェンジ",
      "rules.pontuacao.r0":"サービスは2点ごとに交代し、プレーヤー間で交互に行う。",
      "rules.pontuacao.r1":"デュース（10-10）の場合、1点ごとにサービスが交代し、2点リードでセットを獲得する。",
      "rules.pontuacao.r2":"ダブルスでは、サービスとレシーブの順序はセット終了まで維持する。次のセットではレシーブ側のペアがサービスを行う。",
      "rules.pontuacao.r3":"試合の最初のサーバーは抽選（コイントスまたはサイド選択）で決定する。",
      "rules.pontuacao.r4":"各セットの開始時にプレーヤーはエンドを交代する。決勝セット（最終セット）では、いずれかのプレーヤーが5点に達した時点でエンドを交代する。",
      "rules.pontuacao.r5":"ダブルスの決勝セットでは、レシーブ側のペアはレシーブの順序を変更できる。",
      "rules.pontuacao.r6":"促進ルールは2点ごとのサービス交代を変更しない——促進ルール発動後は1点ごとのサービス交代に短縮されるだけである。",
      "rules.pontuacao.r7":"サービスレットの後、サービスは完全にやり直す（カウントは進まない）。",
      "rules.equipamento.title":"用具 — テーブルとネット",
      "rules.equipamento.r0":"テーブルは長さ274cm×幅152.5cm×高さ76cm。",
      "rules.equipamento.r1":"プレー面は平坦で均一なマット仕上げ（通常は青または緑）で、幅2cmの白いボーダーラインが必要である。",
      "rules.equipamento.r2":"ネットはテーブルを2等分し、全長にわたって高さ15.25cmである。",
      "rules.equipamento.r3":"プレー面にはテーブルの側面（サイドエッジ）は含まれない。",
      "rules.equipamento.r4":"テーブルは木材または類似材料製で、標準ボールを30cmから落とした際の反発高さは23±1cmでなければならない。",
      "rules.equipamento.r5":"センターライン（幅2mm）はテーブルを2等分し、ダブルスのサービスではそれぞれの右半面の一部となる。",
      "rules.bola.title":"用具 — ボール",
      "rules.bola.r0":"ボールの直径は40mm（±0.5mm）、重量は2.7g（±0.1g）でなければならない。",
      "rules.bola.r1":"ボールは白またはオレンジのマット仕上げでなければならない。",
      "rules.bola.r2":"ボールはプラスチック製でなければならない（2015年よりセルロイドに代わって使用）。",
      "rules.bola.r3":"破損または変形したボールは直ちに交換しなければならない。",
      "rules.bola.r4":"公式大会ではITTF認定のボールのみ使用できる。",
      "rules.raquete.title":"用具 — ラケット",
      "rules.raquete.r0":"ラケットのサイズ、形状、重量は自由だが、ブレードは平坦で硬くなければならない。",
      "rules.raquete.r1":"ブレードの厚さの少なくとも85%は天然木材でなければならない。",
      "rules.raquete.r2":"ブレードの各面はITTF認定のラバーで覆われていなければならない。",
      "rules.raquete.r3":"ブレードの両面は異なる色でなければならない：一方は赤、もう一方は黒。",
      "rules.raquete.r4":"試合開始前に相手にラケットを見せなければならない。",
      "rules.raquete.r5":"試合中にラケットを改造することは禁止されている。",
      "rules.raquete.r6":"試合中にラバーが剥がれた場合、再開前に交換しなければならない。",
      "rules.raquete.r7":"ラバーは良好な状態でなければならない——重大な傷や剥がれがあってはならない。",
      "rules.raquete.r8":"打球面は均一で変形があってはならない。",
      "rules.conduta.title":"行動とフェアプレー",
      "rules.conduta.r0":"相手、審判、観客への不敬な行為は警告または失格の対象となる。",
      "rules.conduta.r1":"ラリー中に意図的に相手を妨害することは禁止されている。",
      "rules.conduta.r2":"試合中に医療タイムアウトを申請できるのは1回のみ（本当の緊急事態を除く）。",
      "rules.conduta.r3":"ラケットの性能を変える物質（速乾接着剤、ブースターなど）の使用は禁止されている。",
      "rules.conduta.r4":"特別な医療許可がない限り、試合中は立っていなければならない。",
      "rules.conduta.r5":"得点に関する争いが生じた場合、審判が最終判断を下す。プレーヤーが自ら裁定することはできない。",
      "rules.conduta.r6":"コーチとのコミュニケーションはセット間のみ許可される（例外あり）。",
      "rules.torneio.title":"大会と競技",
      "rules.torneio.r0":"公式大会ではITTFまたは国内協会に認定された審判が試合を監督しなければならない。",
      "rules.torneio.r1":"各試合前のウォームアップは2分間に制限される。",
      "rules.torneio.r2":"プレーヤーはセットごとに最大1回、60秒のタイムアウトを申請できる。",
      "rules.torneio.r3":"ダブルスでは、ペアが交互に各得点を打ち合う。",
      "rules.torneio.r4":"予選とシードはITTF世界ランキングによって決定される。",
      "rules.torneio.r5":"グループステージでの同点の場合、判定基準は次の順序：セット数、得点、直接対決の結果。",
      "rules.torneio.r6":"ノックアウト方式では、偶数セットフォーマットで引き分けとなった場合は決勝セットで勝敗を決する。",
      "rules.torneio.r7":"招集から10分以内にプレーヤーが準備できない場合、不戦敗となる。",
      "rules.torneio.r8":"プレー面、照明、環境条件はITTF基準を満たさなければならない。",
      "rules.torneio.r9":"すべてのインシデント（負傷、異議申し立て、失格）は公式試合レポートに記録しなければならない。",
      "rules.especial.title":"特別な状況",
      "rules.especial.r0":"ラリー中に外部の物体がテーブルに入った場合、得点をやり直す。",
      "rules.especial.r1":"フリーハンド（ラケットを持っていない方の手）でテーブルに触れた場合、相手の得点となる。",
      "rules.especial.r2":"ラリー中にボールが明らかに割れたり変形したりした場合、新しいボールで得点をやり直す。",
      "rules.especial.r3":"ラリー中に照明が消えた場合、得点をやり直す。",
      "rules.especial.r4":"不可抗力（自然災害、緊急事態）の場合、試合を中断して後で再開できる。",
      "rules.especial.r5":"ラリー中に許可されていない外部の援助を受けた場合、失点となる。",
      "rules.especial.r6":"促進ルールは一部大会のダブルスには適用されない——ローカルルールを確認すること。",
      "rules.especial.r7":"両プレーヤーが同時に違反を犯した場合、得点をやり直す。",
      "quiz.easy.0.q":"Quantos pontos são necessários para ganhar um set no ténis de mesa (modo standard)?",
      "quiz.easy.0.o0":"11",
      "quiz.easy.0.o1":"21",
      "quiz.easy.0.o2":"15",
      "quiz.easy.0.o3":"9",
      "quiz.easy.0.exp":"Na ITTF, um set é ganho ao atingir 11 pontos, com uma vantagem mínima de 2 pontos.",
      "quiz.easy.1.q":"De quantos em quantos pontos se troca o serviço durante um jogo?",
      "quiz.easy.1.o0":"2",
      "quiz.easy.1.o1":"5",
      "quiz.easy.1.o2":"3",
      "quiz.easy.1.o3":"1",
      "quiz.easy.1.exp":"O serviço muda a cada 2 pontos, exceto em caso de deuce (10-10).",
      "quiz.easy.2.q":"O que é o 'deuce' no ténis de mesa?",
      "quiz.easy.2.o0":"Vitória por 11-0",
      "quiz.easy.2.o1":"Falta de serviço",
      "quiz.easy.2.o2":"Empate a 10 pontos que exige vantagem de 2",
      "quiz.easy.2.o3":"Ponto disputado",
      "quiz.easy.2.exp":"Deuce ocorre quando o marcador fica 10-10. A partir daí, o serviço muda a cada ponto e é necessária uma vantagem de 2 pontos para ganhar o set.",
      "quiz.easy.3.q":"Qual é o diâmetro oficial da bola de ténis de mesa (ITTF)?",
      "quiz.easy.3.o0":"36 mm",
      "quiz.easy.3.o1":"40 mm",
      "quiz.easy.3.o2":"38 mm",
      "quiz.easy.3.o3":"42 mm",
      "quiz.easy.3.exp":"A bola oficial ITTF tem 40 mm de diâmetro (introduzido em 2000, substituindo 38 mm).",
      "quiz.easy.4.q":"Ao servir, o lançamento da bola deve ter pelo menos quantos centímetros de altura?",
      "quiz.easy.4.o0":"10 cm",
      "quiz.easy.4.o1":"15 cm",
      "quiz.easy.4.o2":"16 cm",
      "quiz.easy.4.o3":"20 cm",
      "quiz.easy.4.exp":"A bola deve ser lançada quase verticalmente para cima, pelo menos 16 cm, a partir da palma da mão aberta.",
      "quiz.easy.5.q":"Quando um set chega a 10-10, quantos pontos consecutivos são necessários para ganhar?",
      "quiz.easy.5.o0":"1",
      "quiz.easy.5.o1":"2",
      "quiz.easy.5.o2":"3",
      "quiz.easy.5.o3":"4",
      "quiz.easy.5.exp":"Em deuce (10-10), é necessária uma vantagem de 2 pontos, ou seja, dois pontos consecutivos sobre o adversário.",
      "quiz.easy.6.q":"A mesa de ténis de mesa tem que dimensões?",
      "quiz.easy.6.o0":"274 × 152,5 cm",
      "quiz.easy.6.o1":"260 × 140 cm",
      "quiz.easy.6.o2":"280 × 160 cm",
      "quiz.easy.6.o3":"250 × 130 cm",
      "quiz.easy.6.exp":"A mesa oficial ITTF mede 274 cm de comprimento × 152,5 cm de largura, com altura de 76 cm.",
      "quiz.easy.7.q":"A que altura fica o topo da rede oficial ITTF?",
      "quiz.easy.7.o0":"14,25 cm",
      "quiz.easy.7.o1":"15,25 cm",
      "quiz.easy.7.o2":"16,25 cm",
      "quiz.easy.7.o3":"13,25 cm",
      "quiz.easy.7.exp":"A rede tem 15,25 cm de altura ao centro e ao longo de toda a sua extensão.",
      "quiz.easy.8.q":"Quantos sets tem normalmente um jogo clássico ITTF (competição)?",
      "quiz.easy.8.o0":"3",
      "quiz.easy.8.o1":"5",
      "quiz.easy.8.o2":"7",
      "quiz.easy.8.o3":"9",
      "quiz.easy.8.exp":"Na maioria das competições ITTF usa-se o formato melhor de 7 (4 sets ganhos para vencer). Para muitos eventos usa-se também melhor de 5 ou 3.",
      "quiz.easy.9.q":"O que acontece se a bola toca a rede durante o serviço?",
      "quiz.easy.9.o0":"Recomeça-se (let)",
      "quiz.easy.9.o1":"Ponto para o adversário",
      "quiz.easy.9.o2":"Ponto para quem serve",
      "quiz.easy.9.o3":"Segunda oportunidade",
      "quiz.easy.9.exp":"Se a bola toca a rede e cai na metade correta da mesa, é um 'let' e o serviço é repetido sem penalização.",
      "quiz.easy.10.q":"Em que lado da mesa deve cair a bola no serviço (jogo de singulares)?",
      "quiz.easy.10.o0":"Só no lado esquerdo",
      "quiz.easy.10.o1":"Em qualquer ponto da metade do adversário",
      "quiz.easy.10.o2":"Só no lado direito",
      "quiz.easy.10.o3":"Na diagonal",
      "quiz.easy.10.exp":"Em singulares, a bola deve apenas cair na metade da mesa do adversário, em qualquer ponto. Não há restrição diagonal (ao contrário dos pares).",
      "quiz.easy.11.q":"Qual a cor padrão da superfície da mesa ITTF?",
      "quiz.easy.11.o0":"Azul ou verde",
      "quiz.easy.11.o1":"Vermelho ou amarelo",
      "quiz.easy.11.o2":"Branco",
      "quiz.easy.11.o3":"Preto",
      "quiz.easy.11.exp":"A superfície da mesa deve ser de cor uniforme, mate (não brilhante), tipicamente azul escuro ou verde.",
      "quiz.easy.12.q":"O que é um 'expedite system' (sistema de aceleração)?",
      "quiz.easy.12.o0":"Forma de acelerar o serviço",
      "quiz.easy.12.o1":"Sistema de desempate por sorteio",
      "quiz.easy.12.o2":"Regra que limita um set a 10 minutos de duração",
      "quiz.easy.12.o3":"Sistema de pontuação dupla",
      "quiz.easy.12.exp":"Após 10 minutos de jogo num set, entra em vigor o 'expedite system': o ponto é ganho pelo recetor se o servidor fizer 13 pancadas consecutivas sem ganhar o ponto.",
      "quiz.easy.13.q":"Em pares, qual é a regra do serviço?",
      "quiz.easy.13.o0":"Qualquer jogador pode servir para qualquer lado",
      "quiz.easy.13.o1":"A bola deve ir em diagonal — metade direita para metade direita",
      "quiz.easy.13.o2":"A bola deve ir para a metade esquerda do adversário",
      "quiz.easy.13.o3":"Não há restrições em pares",
      "quiz.easy.13.exp":"Em pares (duplas), o serviço deve ser feito em diagonal: da metade direita do servidor para a metade direita do recetor.",
      "quiz.easy.14.q":"Um jogador pode apoiar a mão livre na mesa durante o jogo?",
      "quiz.easy.14.o0":"Sim, é permitido",
      "quiz.easy.14.o1":"Não, ponto para o adversário se tocar",
      "quiz.easy.14.o2":"Só no lado do próprio jogador",
      "quiz.easy.14.o3":"Apenas durante o serviço",
      "quiz.easy.14.exp":"Se a mão livre (a que não segura a raquete) tocar a superfície de jogo durante um rally, o ponto é perdido pelo jogador infrator.",
      "quiz.medium.0.q":"Após um 'let' no serviço, o que acontece ao par de pontos desse serviço?",
      "quiz.medium.0.o0":"O serviço é repetido, sem mudar a contagem",
      "quiz.medium.0.o1":"Perde-se um dos dois pontos desse par",
      "quiz.medium.0.o2":"O par de serviços reinicia",
      "quiz.medium.0.o3":"O adversário ganha o serviço",
      "quiz.medium.0.exp":"Um 'let' anula o serviço. O servidor repete exatamente o mesmo serviço, sem alterar nenhum marcador ou par de pontos.",
      "quiz.medium.1.q":"Quando começa exatamente o 'expedite system'?",
      "quiz.medium.1.o0":"Quando o marcador chega a 9-9",
      "quiz.medium.1.o1":"Após 10 minutos de jogo num set, se nenhum jogador ainda tiver 9 pontos",
      "quiz.medium.1.o2":"Sempre que um set dura mais de 8 minutos",
      "quiz.medium.1.o3":"Quando o atacante faz 10 pancadas seguidas",
      "quiz.medium.1.exp":"O expedite system é introduzido após 10 minutos de jogo num set, desde que nenhum dos jogadores tenha chegado aos 9 pontos. A qualquer momento pode ser pedido por ambos os jogadores.",
      "quiz.medium.2.q":"O que acontece se a bola toca a borda lateral da mesa?",
      "quiz.medium.2.o0":"É 'let'",
      "quiz.medium.2.o1":"Ponto para quem bateu na bola",
      "quiz.medium.2.o2":"Ponto para o adversário",
      "quiz.medium.2.o3":"Repetição do ponto",
      "quiz.medium.2.exp":"A borda lateral (borda lateral da superfície de jogo) não é válida. Se a bola toca a borda lateral, é ponto para o adversário.",
      "quiz.medium.3.q":"A bola pode tocar a borda superior da mesa (edge) e ser boa?",
      "quiz.medium.3.o0":"Sim, é ponto válido",
      "quiz.medium.3.o1":"Não, é falta",
      "quiz.medium.3.o2":"Apenas no serviço",
      "quiz.medium.3.o3":"Apenas se cair para dentro",
      "quiz.medium.3.exp":"Se a bola toca a borda superior da mesa (edge — a superfície de jogo), é um ponto válido, pois faz parte da superfície de jogo.",
      "quiz.medium.4.q":"Qual é o peso oficial de uma bola ITTF?",
      "quiz.medium.4.o0":"2,0 g",
      "quiz.medium.4.o1":"2,3 g",
      "quiz.medium.4.o2":"2,7 g",
      "quiz.medium.4.o3":"3,0 g",
      "quiz.medium.4.exp":"A bola oficial ITTF pesa 2,7 gramas.",
      "quiz.medium.5.q":"Durante o serviço, em que posição deve estar a palma da mão livre ao lançar a bola?",
      "quiz.medium.5.o0":"Aberta e plana, acima do nível da mesa",
      "quiz.medium.5.o1":"Fechada em punho",
      "quiz.medium.5.o2":"Apontada para o adversário",
      "quiz.medium.5.o3":"Abaixo do nível da mesa",
      "quiz.medium.5.exp":"A bola deve estar na palma da mão aberta e imóvel, acima do nível da superfície de jogo, antes de ser lançada para o serviço.",
      "quiz.medium.6.q":"O topo da rede pode ser tocado pela bola durante um rally (não no serviço)?",
      "quiz.medium.6.o0":"Sim, se cair do outro lado é ponto válido",
      "quiz.medium.6.o1":"Não, é sempre falta",
      "quiz.medium.6.o2":"Só se a bola não parar na rede",
      "quiz.medium.6.o3":"É sempre 'let'",
      "quiz.medium.6.exp":"Durante o rally, se a bola toca o topo da rede e cai válida no outro lado, o ponto é válido (não é let — o let só existe no serviço).",
      "quiz.medium.7.q":"Se um jogador interrompe o jogo intencionalmente sem razão válida, o que acontece?",
      "quiz.medium.7.o0":"O set é anulado",
      "quiz.medium.7.o1":"O árbitro dá um aviso oral",
      "quiz.medium.7.o2":"O ponto em disputa é atribuído ao adversário",
      "quiz.medium.7.o3":"O jogador é desqualificado",
      "quiz.medium.7.exp":"Interrupção deliberada do jogo é considerada 'má conduta'. O árbitro pode atribuir o ponto ao adversário como penalização.",
      "quiz.medium.8.q":"Em singulares, o servidor tem de bater na bola do próprio lado antes de ir para o outro lado?",
      "quiz.medium.8.o0":"Sim, obrigatório",
      "quiz.medium.8.o1":"Não, a bola vai diretamente para o lado do adversário",
      "quiz.medium.8.o2":"Só no primeiro serviço de cada jogo",
      "quiz.medium.8.o3":"Depende do modo de jogo",
      "quiz.medium.8.exp":"Em singulares, a bola vai diretamente da raquete para a metade do adversário, sem tocar no lado do servidor. É em pares que o serviço deve ser diagonal.",
      "quiz.medium.9.q":"O que é um 'good return' (devolução válida)?",
      "quiz.medium.9.o0":"Bola que toca sempre a rede",
      "quiz.medium.9.o1":"Bola que bate na mesa do servidor",
      "quiz.medium.9.o2":"Bola que cai fora da mesa",
      "quiz.medium.9.o3":"Bola que passa a rede e cai dentro da mesa do adversário ou na borda",
      "quiz.medium.9.exp":"Uma devolução válida é aquela em que a bola (após ser batida) passa sobre ou à volta da rede e cai na área de jogo do adversário ou na borda superior da mesa.",
      "quiz.medium.10.q":"Pode um jogador bater na bola antes de ela tocar a sua metade da mesa (volley)?",
      "quiz.medium.10.o0":"Sim, se a bola estiver a sair da mesa",
      "quiz.medium.10.o1":"Não, ponto para o adversário",
      "quiz.medium.10.o2":"Só no último ponto do set",
      "quiz.medium.10.o3":"Apenas se a bola tocar a rede antes",
      "quiz.medium.10.exp":"É proibido bater na bola antes de ela tocar a sua metade da mesa (volley). Se o fizer, perde o ponto, mesmo que a bola fosse para fora.",
      "quiz.medium.11.q":"O que sucede se o servidor lança a bola e decide não a bater?",
      "quiz.medium.11.o0":"É automático 'let'",
      "quiz.medium.11.o1":"É falta e ponto para o adversário",
      "quiz.medium.11.o2":"Pode apanhar a bola e repetir",
      "quiz.medium.11.o3":"É aviso oral do árbitro",
      "quiz.medium.11.exp":"Se o servidor lançar a bola para o serviço e não a bater, é falta — o ponto vai para o adversário.",
      "quiz.medium.12.q":"Se a bola em jogo toca num objeto alheio (roupa do jogador, etc.), o que acontece?",
      "quiz.medium.12.o0":"Ponto para o adversário",
      "quiz.medium.12.o1":"É 'let'",
      "quiz.medium.12.o2":"O ponto é repetido",
      "quiz.medium.12.o3":"Depende do árbitro",
      "quiz.medium.12.exp":"Se a bola em jogo tocar qualquer coisa que não seja a rede, os seus suportes ou a mesa, o ponto vai para o adversário.",
      "quiz.medium.13.q":"Qual é a altura mínima do teto ou obstáculo acima da mesa em competições ITTF?",
      "quiz.medium.13.o0":"3 m",
      "quiz.medium.13.o1":"4 m",
      "quiz.medium.13.o2":"5 m",
      "quiz.medium.13.o3":"6 m",
      "quiz.medium.13.exp":"A ITTF recomenda pelo menos 5 metros de espaço livre acima da mesa para competições internacionais.",
      "quiz.medium.14.q":"Em pares, após cada set, como muda a ordem de serviço?",
      "quiz.medium.14.o0":"Mantém-se igual",
      "quiz.medium.14.o1":"O recetor do último serviço torna-se servidor",
      "quiz.medium.14.o2":"O parceiro do servidor torna-se o próximo servidor",
      "quiz.medium.14.o3":"Escolha livre dos jogadores",
      "quiz.medium.14.exp":"Em pares, o par que recebeu no set anterior passará a servir, e o jogador que serviu por último passará a receber.",
      "quiz.hard.0.q":"Segundo o regulamento ITTF, quais as cores obrigatórias dos revestimentos (borrachas) de uma raquete?",
      "quiz.hard.0.o0":"Um lado vermelho, outro lado preto",
      "quiz.hard.0.o1":"Qualquer cor, desde que diferentes",
      "quiz.hard.0.o2":"Azul e vermelho",
      "quiz.hard.0.o3":"Verde e preto",
      "quiz.hard.0.exp":"O regulamento ITTF exige que os dois lados da raquete sejam obrigatoriamente um vermelho e um preto, para que o adversário possa distinguir os revestimentos.",
      "quiz.hard.1.q":"Qual a espessura máxima do revestimento (borracha + esponja) numa raquete aprovada ITTF?",
      "quiz.hard.1.o0":"3 mm",
      "quiz.hard.1.o1":"3,5 mm",
      "quiz.hard.1.o2":"4 mm",
      "quiz.hard.1.o3":"5 mm",
      "quiz.hard.1.exp":"A espessura total de cada lado do revestimento (borracha mais esponja, se existir) não pode exceder 4 mm.",
      "quiz.hard.2.q":"O que significa 'ITTF approved' numa bola?",
      "quiz.hard.2.o0":"Bola fabricada em China",
      "quiz.hard.2.o1":"Bola testada e homologada pela ITTF para competições internacionais",
      "quiz.hard.2.o2":"Bola usada nos Jogos Olímpicos",
      "quiz.hard.2.o3":"Bola de 38 mm (formato antigo)",
      "quiz.hard.2.exp":"'ITTF approved' significa que a bola foi testada e está na lista de produtos aprovados pela ITTF, cumprindo todos os critérios de tamanho, peso, redondeza e cor.",
      "quiz.hard.3.q":"Segundo a ITTF, pode-se usar revestimentos anti-spin (lisos) na raquete?",
      "quiz.hard.3.o0":"Sim, desde que sejam aprovados pela ITTF",
      "quiz.hard.3.o1":"Não, são proibidos em todas as competições",
      "quiz.hard.3.o2":"Só em competições nacionais",
      "quiz.hard.3.o3":"Apenas num dos lados",
      "quiz.hard.3.exp":"Revestimentos anti-spin (pimple-out ou lisos) são permitidos desde que estejam na lista aprovada pela ITTF. A lista de borrachas homologadas é publicada e atualizada regularmente.",
      "quiz.hard.4.q":"Num torneio ITTF, se um jogador parte a raquete durante o jogo, o que pode fazer?",
      "quiz.hard.4.o0":"Continuar com qualquer raquete disponível",
      "quiz.hard.4.o1":"Deve sair do torneio",
      "quiz.hard.4.o2":"Pode substituí-la por uma pré-aprovada pelo árbitro",
      "quiz.hard.4.o3":"Pede 5 minutos de pausa para substituir",
      "quiz.hard.4.exp":"Se a raquete ficar inutilizável, o jogador pode substituí-la, mas a raquete substituta deve ser aprovada pelo árbitro.",
      "quiz.hard.5.q":"Qual é o procedimento correto da inspeção de raquetes em competições ITTF?",
      "quiz.hard.5.o0":"Apenas o árbitro principal inspeciona antes da final",
      "quiz.hard.5.o1":"Os jogadores mostram as raquetes ao adversário e ao árbitro antes do início do jogo",
      "quiz.hard.5.o2":"Só se houver protesto do adversário",
      "quiz.hard.5.o3":"Só em competições com classificação mundial",
      "quiz.hard.5.exp":"Em competições ITTF, cada jogador deve mostrar a sua raquete ao adversário e ao árbitro antes do início do jogo (e após o jogo, se solicitado).",
      "quiz.hard.6.q":"Em condições normais, a que intervalo muda a bola num match de competição ITTF?",
      "quiz.hard.6.o0":"Cada set",
      "quiz.hard.6.o1":"Cada 3 pontos",
      "quiz.hard.6.o2":"Início de cada jogo ou quando danificada",
      "quiz.hard.6.o3":"Nunca, só por dano",
      "quiz.hard.6.exp":"A bola é substituída no início de cada jogo (match) ou quando está visivelmente danificada durante o jogo.",
      "quiz.hard.7.q":"O que diz a regra ITTF sobre o uso de substâncias na raquete ('speed glue')?",
      "quiz.hard.7.o0":"É permitido com aprovação prévia",
      "quiz.hard.7.o1":"Está completamente proibido desde 2008",
      "quiz.hard.7.o2":"É permitido apenas em competições nacionais",
      "quiz.hard.7.o3":"Necessita de certificado médico",
      "quiz.hard.7.exp":"O uso de cola rápida (speed glue) e adesivos com solventes orgânicos foi proibido pela ITTF em 2008. Só são permitidos adesivos aquosos (water-based).",
      "quiz.hard.8.q":"Segundo as regras ITTF, o que é uma 'bad service' (serviço inválido) não corrigida pelo árbitro após advertência?",
      "quiz.hard.8.o0":"Ponto imediato para o adversário",
      "quiz.hard.8.o1":"Segundo serviço",
      "quiz.hard.8.o2":"Let repetido",
      "quiz.hard.8.o3":"Desclassificação",
      "quiz.hard.8.exp":"Após advertência por mau serviço, qualquer serviço subsequente inválido resulta em ponto direto para o adversário, sem necessidade de nova advertência.",
      "quiz.hard.9.q":"Qual é a regra ITTF sobre o 'time-out' (pausa) num jogo?",
      "quiz.hard.9.o0":"Não é permitido time-out",
      "quiz.hard.9.o1":"Cada equipa tem 2 time-outs por jogo",
      "quiz.hard.9.o2":"Cada jogador/equipa tem direito a 1 time-out de 1 minuto por jogo",
      "quiz.hard.9.o3":"Só o árbitro pode interromper o jogo",
      "quiz.hard.9.exp":"Cada jogador (ou equipa em pares) tem direito a um time-out de 1 minuto por match (não por set). Pode ser pedido em qualquer momento, exceto durante o serviço.",
      "quiz.hard.10.q":"O que prevê o regulamento ITTF sobre o treinador (coach) durante o jogo?",
      "quiz.hard.10.o0":"O treinador pode dar instruções em qualquer momento",
      "quiz.hard.10.o1":"O treinador só pode dar instruções durante os intervalos entre sets e durante os time-outs",
      "quiz.hard.10.o2":"O treinador pode entrar na área de jogo",
      "quiz.hard.10.o3":"Não há regulação sobre o comportamento do treinador",
      "quiz.hard.10.exp":"O treinador só pode comunicar com o jogador durante os intervalos entre sets e durante os time-outs solicitados. Não é permitido qualquer tipo de instrução durante o jogo em si.",
      "quiz.hard.11.q":"O que são 'pimples-out' (espinhos para fora) num revestimento de raquete?",
      "quiz.hard.11.o0":"Revestimento com espinhos virados para dentro",
      "quiz.hard.11.o1":"Revestimento completamente liso",
      "quiz.hard.11.o2":"Revestimento com espinhos virados para fora, sem camada de esponja atrás",
      "quiz.hard.11.o3":"Borracha especial para defesa",
      "quiz.hard.11.exp":"'Pimples-out' (OX ou sem esponja) é um revestimento com os espinhos de borracha virados para fora. Reduz o efeito (spin) mas melhora o controlo. É permitido pela ITTF se aprovado.",
      "quiz.hard.12.q":"Quantos minutos de intervalo são permitidos entre sets num jogo ITTF?",
      "quiz.hard.12.o0":"1 minuto",
      "quiz.hard.12.o1":"2 minutos",
      "quiz.hard.12.o2":"3 minutos",
      "quiz.hard.12.o3":"5 minutos",
      "quiz.hard.12.exp":"O intervalo entre sets num jogo ITTF tem a duração máxima de 1 minuto.",
      "quiz.hard.13.q":"O que é o 'phantom serve' e qual é a sua situação regulamentar?",
      "quiz.hard.13.o0":"Serviço invisível, permitido",
      "quiz.hard.13.o1":"Serviço em que a raquete não toca claramente a bola, proibido",
      "quiz.hard.13.o2":"Serviço com rotação excessiva, limitada a 3000 RPM",
      "quiz.hard.13.o3":"Serviço com bola lançada mais de 30 cm, obrigatório",
      "quiz.hard.13.exp":"O 'phantom serve' esconde o contato da bola com a raquete (com o corpo ou braço livre), impossibilitando o adversário de ver o momento do impacto. É proibido pelas regras ITTF.",
      "quiz.hard.14.q":"Em competições ITTF, o que especifica a regra sobre a iluminação da área de jogo?",
      "quiz.hard.14.o0":"Mínimo de 200 lux",
      "quiz.hard.14.o1":"Mínimo de 500 lux",
      "quiz.hard.14.o2":"Mínimo de 1000 lux no plano da mesa, sem luz natural direta",
      "quiz.hard.14.o3":"Sem requisitos específicos",
      "quiz.hard.14.exp":"A ITTF recomenda pelo menos 1000 lux uniformemente sobre a superfície da mesa, sem luz solar direta, para competições internacionais."
    }
  };

  // helper global para aceder à tradução actual
  function t(key, vars) {
    const lang = localStorage.getItem("pp-lang") || "pt";
    const dict = LANGS[lang] || LANGS.pt;
    let str = dict[key] || LANGS.pt[key] || key;
    if (vars) Object.keys(vars).forEach(k => { str = str.replace("%" + k, vars[k]); });
    return str;
  }

  // aplica traduções a todos os elementos [data-i18n]
  function applyTranslations() {
    // update html[lang] attribute
    const lang = localStorage.getItem("pp-lang") || "pt";
    const langMap = {pt:"pt-PT",en:"en",es:"es",fr:"fr",de:"de",zh:"zh-Hans",ja:"ja"};
    document.documentElement.lang = langMap[lang] || lang;

    // textContent — use innerHTML only for translations that explicitly contain HTML tags
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (!val) return;
      if (val.indexOf("<") !== -1) {
        // safe: only allow specific tags (br, strong, em)
        const safe = val.replace(/<(?!\/?(?:br|strong|em)\b)[^>]*>/gi, "");
        el.innerHTML = safe;
      } else {
        el.textContent = val;
      }
    });
    // title attributes (tooltips)
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      const val = t(key);
      if (val) el.title = val;
    });
    // placeholders — tratamento genérico via data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = t(key);
      if (val) el.placeholder = val;
    });
    // aria-label attributes
    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
      const key = el.getAttribute("data-i18n-aria");
      const val = t(key);
      if (val) el.setAttribute("aria-label", val);
    });
    // fallback explícito para inputs sem o atributo (compatibilidade)
    const descInput = document.getElementById("input-game-description");
    if (descInput && !descInput.hasAttribute("data-i18n-placeholder")) descInput.placeholder = t("js.descPlaceholder");
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
    updateRotateHint();
  }

  // event delegation para data-back — apanha botões adicionados dinamicamente
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-back]");
    if (btn) showScreen(btn.dataset.back);
  });

  /* ---------------------------------------------------------
     UTILITÁRIOS
     --------------------------------------------------------- */
  function uid(prefix) {
    return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
  }

  function formatDate(iso) {
    const d = new Date(iso);
    const lang = localStorage.getItem("pp-lang") || "pt";
    const localeMap = {pt:"pt-PT",en:"en-GB",es:"es-ES",fr:"fr-FR",de:"de-DE",zh:"zh-Hans-CN",ja:"ja-JP"};
    const locale = localeMap[lang] || "pt-PT";
    try {
      return d.toLocaleString(locale, {year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
    } catch(e) {
      const dd = String(d.getDate()).padStart(2,"0");
      const mm = String(d.getMonth()+1).padStart(2,"0");
      const yy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2,"0");
      const min = String(d.getMinutes()).padStart(2,"0");
      return `${dd}/${mm}/${yy} ${hh}:${min}`;
    }
  }

  function formatClock(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function getPlayer(id) {
    return DATA.players.find((p) => p.id === id);
  }

  function playerInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  /* ---------------------------------------------------------
     CORES DE JOGADOR — cada jogador tem uma cor de placar
     própria (fundo / número), predefinida azul-branco.
     --------------------------------------------------------- */
  const PLAYER_COLORS = {
    "blue-white":   { bg: "#0d3b66", fg: "#f4f1ea", label: "Azul / Branco" },
    "green-white":  { bg: "#2f8f4e", fg: "#f4f1ea", label: "Verde / Branco" },
    "red-white":    { bg: "#c1432f", fg: "#f4f1ea", label: "Vermelho / Branco" },
    "pink-white":   { bg: "#d6558c", fg: "#f4f1ea", label: "Rosa / Branco" },
    "purple-white": { bg: "#6b3fa0", fg: "#f4f1ea", label: "Roxo / Branco" },
    "gold-white":   { bg: "#c9920a", fg: "#f4f1ea", label: "Dourado / Branco" },
    "white-black":  { bg: "#f4f1ea", fg: "#1a1a1a", label: "Branco / Preto" },
    "orange-white": { bg: "#d4620a", fg: "#f4f1ea", label: "Laranja / Branco" }
  };
  const DEFAULT_PLAYER_COLOR = "blue-white";

  function getPlayerColorKey(player) {
    return player && player.color && PLAYER_COLORS[player.color] ? player.color : DEFAULT_PLAYER_COLOR;
  }

  // cor invertida: troca fundo <-> número (usada quando dois jogadores coincidem na cor)
  function invertedColor(colorKey) {
    const c = PLAYER_COLORS[colorKey] || PLAYER_COLORS[DEFAULT_PLAYER_COLOR];
    return { bg: c.fg, fg: c.bg };
  }

  /* ---------------------------------------------------------
     MENU PRINCIPAL
     --------------------------------------------------------- */
  document.getElementById("btn-new-game").addEventListener("click", openSetup);
  document.getElementById("btn-players").addEventListener("click", () => {
    renderPlayersList();
    showScreen("screen-players");
  });
  document.getElementById("btn-history").addEventListener("click", () => {
    renderHistoryList();
    showScreen("screen-history");
  });
  document.getElementById("btn-settings").addEventListener("click", () => {
    renderDataScreen();
    showScreen("screen-data");
  });
  document.getElementById("btn-tournament").addEventListener("click", openTournamentSetup);
  document.getElementById("btn-training").addEventListener("click", openTrainingMode);
  document.getElementById("btn-minigames").addEventListener("click", openMinigames);

  /* ---- seletor de idioma ---- */
  (function(){
    const btn = document.getElementById("btn-lang");
    const dropdown = document.getElementById("menu-lang-dropdown");
    const savedLang = localStorage.getItem("pp-lang") || "pt";

    function applyLang(lang) {
      const opt = dropdown.querySelector('[data-lang="'+lang+'"]');
      const flag = opt ? opt.dataset.flag : "🇵🇹";
      btn.textContent = flag;
      dropdown.querySelectorAll(".lang-option").forEach(o => o.classList.toggle("is-active", o.dataset.lang === lang));
      localStorage.setItem("pp-lang", lang);
      applyTranslations();
      // re-render currently visible dynamic screens
      const active = document.querySelector(".screen.active");
      if (!active) return;
      const sid = active.id;
      if (sid === "screen-players") { try { renderPlayersList(); } catch(e){} }
      else if (sid === "screen-history") { try { renderHistoryList(); } catch(e){} }
      else if (sid === "screen-achievements") { try { renderAchievementsScreen(); } catch(e){} }
      else if (sid === "screen-rules-ittf") { try { renderRulesScreen(); } catch(e){} }
      else if (sid === "screen-mg-quiz") { try { resetQuizStart(); } catch(e){} }
      else if (sid === "screen-minigames") { try { renderMinigamesScreen && renderMinigamesScreen(); } catch(e){} }
      else if (sid === "screen-records") { try { renderRecordsScreen && renderRecordsScreen(); } catch(e){} }
      else if (sid === "screen-data") { try { renderDataScreen(); } catch(e){} }
    }

    applyLang(savedLang);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.hidden = !dropdown.hidden;
    });

    dropdown.querySelectorAll(".lang-option").forEach(o => {
      o.addEventListener("click", () => {
        applyLang(o.dataset.lang);
        dropdown.hidden = true;
      });
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.hidden && !dropdown.contains(e.target) && e.target !== btn) {
        dropdown.hidden = true;
      }
    });
  })();

  const CAT_I18N = {
    "Primeiros Passos":"js.catFirstSteps","Vitórias":"js.catWins","Sets":"js.catSets",
    "Remontadas":"js.catComebacks","ELO":"js.catElo","Pontos":"js.catPoints",
    "Torneios":"js.catTournaments","Rivalidades":"js.catRivalries",
    "Treino":"js.catTraining","Mini-Jogos":"js.catMinigames","Especiais":"js.catSpecials"
  };
  function tCat(cat){ return t(CAT_I18N[cat]||("js.cat"+cat))||cat; }

  function checkResumeBanner() {
    const banner = document.getElementById("menu-resume");
    if (DATA.activeGame) {
      banner.hidden = false;
      banner.querySelector("p").textContent = t("js.gameInProgress");
      document.getElementById("btn-resume").textContent = t("js.resumeGame");
    } else if (DATA.activeTournament && DATA.activeTournament.status !== "done") {
      banner.hidden = false;
      banner.querySelector("p").textContent = t("js.tournamentInProgress");
      document.getElementById("btn-resume").textContent = t("js.resumeTournament");
    } else {
      banner.hidden = true;
    }
  }
  document.getElementById("btn-resume").addEventListener("click", () => {
    if (DATA.activeGame) {
      resumeGameUI();
      showScreen("screen-game");
    } else if (DATA.activeTournament && DATA.activeTournament.status !== "done") {
      renderTournamentBracket();
      showScreen("screen-tournament-bracket");
    }
  });

  /* ---------------------------------------------------------
     JOGADORES — listagem, criação, perfil, eliminação
     --------------------------------------------------------- */
  function renderPlayersList() {
    const list = document.getElementById("players-list");
    list.innerHTML = "";

    if (DATA.players.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">☷</div>
          <p>${t("js.noPlayersEmpty")}</p>
        </div>`;
      return;
    }

    // ---------- leaderboard: top 5 por win rate (mínimo 1 jogo) ----------
    // nota: ELO é só para diversão e aparece como coluna extra; a ordenação
    // do leaderboard continua sempre baseada em vitórias/derrotas, não em ELO.
    const allElos = computeAllElos();
    const ranked = DATA.players
      .map((p) => ({ player: p, stats: computePlayerStats(p.id, allElos) }))
      .filter((entry) => entry.stats.gamesPlayed > 0)
      .sort((a, b) => {
        if (b.stats.gamesWon !== a.stats.gamesWon) return b.stats.gamesWon - a.stats.gamesWon;
        if (a.stats.gamesLost !== b.stats.gamesLost) return a.stats.gamesLost - b.stats.gamesLost;
        if (b.stats.winRate !== a.stats.winRate) return b.stats.winRate - a.stats.winRate;
        return b.stats.gamesPlayed - a.stats.gamesPlayed;
      })
      .slice(0, 5);

    if (ranked.length > 0) {
      const leaderboard = document.createElement("div");
      leaderboard.className = "leaderboard";
      leaderboard.innerHTML = `
        <p class="section-label">${t("js.leaderboard").replace("%n", ranked.length)}</p>
        <div class="leaderboard-table">
          <div class="leaderboard-row leaderboard-row--head">
            <span class="lb-rank"></span>
            <span class="lb-name">${t("js.playerCol")}</span>
            <span class="lb-cell">${t("js.winsLabel")}</span>
            <span class="lb-cell">${t("js.lossesLabel")}</span>
            <span class="lb-cell">${t("js.drawsLabel")}</span>
            <span class="lb-cell">${t("js.capotesLabel")}</span>
            <span class="lb-cell lb-cell--accent">${t("js.winRateLabel")}</span>
            <span class="lb-cell lb-cell--elo">${t("js.eloLabel")}</span>
          </div>
          ${ranked
            .map(
              (entry, i) => `
            <div class="leaderboard-row">
              <span class="lb-rank">${i + 1}</span>
              <span class="lb-name">${escapeHTML(entry.player.name)}</span>
              <span class="lb-cell">${entry.stats.gamesWon}</span>
              <span class="lb-cell">${entry.stats.gamesLost}</span>
              <span class="lb-cell">${entry.stats.gamesDrawn}</span>
              <span class="lb-cell">${entry.stats.capotes}</span>
              <span class="lb-cell lb-cell--accent">${entry.stats.winRate}%</span>
              <span class="lb-cell lb-cell--elo">${entry.stats.elo}</span>
            </div>`
            )
            .join("")}
        </div>
      `;
      list.appendChild(leaderboard);

      const allLabel = document.createElement("p");
      allLabel.className = "section-label";
      allLabel.textContent = t("js.allPlayers");
      list.appendChild(allLabel);
    }

    const grid = document.createElement("div");
    grid.className = "players-grid";
    list.appendChild(grid);

    DATA.players
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "pt"))
      .forEach((p) => {
        const stats = computePlayerStats(p.id, allElos);
        const card = document.createElement("button");
        card.className = "player-card player-card--grid";
        card.innerHTML = `
          <div class="player-avatar">${playerInitials(p.name)}</div>
          <div class="player-info">
            <strong>${escapeHTML(p.name)}</strong>
            <span>${t("js.gamesUnit").replace("%n", stats.gamesPlayed)} · ${stats.winRate}%</span>
          </div>
          <span class="player-elo player-elo--small">${stats.elo}</span>
        `;
        card.addEventListener("click", () => openPlayerProfile(p.id));
        grid.appendChild(card);
      });
  }

  function escapeHTML(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  document.getElementById("btn-add-player").addEventListener("click", openNewPlayerOverlay);

  let newPlayerColor = DEFAULT_PLAYER_COLOR;

  function openNewPlayerOverlay() {
    const overlay = document.getElementById("overlay-new-player");
    const input = document.getElementById("input-player-name");
    input.value = "";
    newPlayerColor = DEFAULT_PLAYER_COLOR;
    document.querySelectorAll("#color-picker-new .color-swatch").forEach((sw) => {
      sw.classList.toggle("active", sw.dataset.color === newPlayerColor);
    });
    overlay.hidden = false;
    setTimeout(() => input.focus(), 50);
  }
  function closeNewPlayerOverlay() {
    document.getElementById("overlay-new-player").hidden = true;
  }
  document.getElementById("btn-cancel-new-player").addEventListener("click", closeNewPlayerOverlay);
  document.getElementById("btn-save-new-player").addEventListener("click", saveNewPlayer);
  document.getElementById("input-player-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveNewPlayer();
  });

  document.querySelectorAll("#color-picker-new .color-swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      newPlayerColor = sw.dataset.color;
      document.querySelectorAll("#color-picker-new .color-swatch").forEach((s) => {
        s.classList.toggle("active", s === sw);
      });
    });
  });

  function saveNewPlayer() {
    const input = document.getElementById("input-player-name");
    const name = input.value.trim();
    if (!name) return;
    const player = {
      id: uid("player"),
      name: name,
      color: newPlayerColor,
      createdAt: new Date().toISOString()
    };
    DATA.players.push(player);
    saveData();
    closeNewPlayerOverlay();
    renderPlayersList();
  }

  let currentProfileId = null;

  function openPlayerProfile(playerId) {
    currentProfileId = playerId;
    const player = getPlayer(playerId);
    if (!player) return;

    document.getElementById("profile-name").textContent = player.name;
    const stats = computePlayerStats(playerId);
    const tStats = computePlayerTournamentStats(playerId);
    const content = document.getElementById("profile-content");

    const recentGames = DATA.games
      .filter((g) => g.blue.playerId === playerId || g.white.playerId === playerId)
      .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
      .slice(0, 10);

    let historyHTML = "";
    if (recentGames.length === 0) {
      historyHTML = `<div class="empty-state"><p>${t("js.noHistoryYet")}</p></div>`;
    } else {
      historyHTML = recentGames
        .map((g) => {
          const isBlue = g.blue.playerId === playerId;
          const me = isBlue ? g.blue : g.white;
          const opp = isBlue ? g.white : g.blue;
          const oppName = opp.playerId ? getPlayer(opp.playerId)?.name || "—" : "—";
          let resultClass, resultLabel;
          if (g.isDraw) {
            resultClass = "history-row-result--draw";
            resultLabel = t("js.resultDraw");
          } else if (g.winnerSide === (isBlue ? "blue" : "white")) {
            resultClass = "history-row-result--win";
            resultLabel = t("js.resultWon");
          } else {
            resultClass = "history-row-result--loss";
            resultLabel = t("js.resultLost");
          }
          return `
            <div class="history-row">
              <span class="history-row-result ${resultClass}"></span>
              <div class="history-row-main">
                <strong>${resultLabel} vs ${escapeHTML(oppName)}</strong>
                <small>${formatDate(g.endedAt)} · ${g.pointsTarget} pts${g.description ? " · " + escapeHTML(g.description) : ""}</small>
              </div>
              <span class="history-row-score">${me.setsWon}-${opp.setsWon}</span>
            </div>`;
        })
        .join("");
    }

    let rivalsHTML = "";
    if (stats.rivals.length > 0) {
      rivalsHTML = `
        <p class="section-label">${t("js.headToHead")}</p>
        ${stats.rivals
          .map(
            (r) => `
            <div class="history-row">
              <div class="history-row-main">
                <strong>vs ${escapeHTML(r.name)}</strong>
                <small>${t("js.gamesDisputed").replace("%n", r.gamesPlayed)}</small>
              </div>
              <span class="history-row-score">${r.gamesWon}${t("js.winsLabel")} – ${r.gamesLost}${t("js.lossesLabel")}${r.gamesDrawn ? ` – ${r.gamesDrawn}${t("js.drawsLabel")}` : ""}</span>
            </div>`
          )
          .join("")}
      `;
    }

    content.innerHTML = `
      <div class="profile-stats-grid">
        <div class="stat-box stat-box--elo"><strong>${stats.elo}</strong><span>${t("js.eloLabel2")}</span></div>
        <div class="stat-box stat-box--accent"><strong>${stats.winRate}%</strong><span>${t("js.winRateLabel")}</span></div>
        <div class="stat-box"><strong>${stats.gamesPlayed}</strong><span>${t("js.statGamesPlayed")}</span></div>
        <div class="stat-box"><strong>${stats.gamesWon}</strong><span>${t("js.statGamesWon")}</span></div>
        <div class="stat-box"><strong>${stats.gamesLost}</strong><span>${t("js.statGamesLost")}</span></div>
        <div class="stat-box"><strong>${stats.gamesDrawn}</strong><span>${t("js.statGamesDrawn")}</span></div>
        <div class="stat-box"><strong>${stats.wins}</strong><span>${t("js.statSetsWonV")}</span></div>
        <div class="stat-box"><strong>${stats.losses}</strong><span>${t("js.statSetsLostD")}</span></div>
        <div class="stat-box"><strong>${stats.setsWon}</strong><span>${t("js.statTotalSetsWon")}</span></div>
        <div class="stat-box"><strong>${stats.setsLost}</strong><span>${t("js.statTotalSetsLost")}</span></div>
        <div class="stat-box"><strong>${stats.capotes}</strong><span>${t("js.statCapotesMade")}</span></div>
        <div class="stat-box"><strong>${stats.capotesSuffered}</strong><span>${t("js.statCapotesSuffered")}</span></div>
        <div class="stat-box"><strong>${tStats.won}</strong><span>${t("js.statTournamentsWon")}</span></div>
        <div class="stat-box"><strong>${tStats.total}</strong><span>${t("js.statTournamentsTotal")}</span></div>
      </div>
      ${
        stats.bestRival || stats.worstRival
          ? `<div class="profile-stats-grid">
              ${stats.bestRival ? `<div class="stat-box stat-box--accent"><strong>${escapeHTML(stats.bestRival.name)}</strong><span>${t("js.bestRivalAgainst").replace("%n", stats.bestRival.gamesWon)}</span></div>` : ""}
              ${stats.worstRival ? `<div class="stat-box"><strong>${escapeHTML(stats.worstRival.name)}</strong><span>${t("js.worstRivalAgainst").replace("%n", stats.worstRival.gamesLost)}</span></div>` : ""}
            </div>`
          : ""
      }
      ${rivalsHTML}
      <p class="section-label">${t("js.recentGames")}</p>
      ${historyHTML}
      <p class="section-label">${t("js.scorerColor")}</p>
      <div class="color-picker color-picker--profile" id="color-picker-profile">
        <button class="color-swatch color-swatch--blue-white"   data-color="blue-white"   title="${t('js.color.blueWhite')}"></button>
        <button class="color-swatch color-swatch--green-white"  data-color="green-white"  title="${t('js.color.greenWhite')}"></button>
        <button class="color-swatch color-swatch--red-white"    data-color="red-white"    title="${t('js.color.redWhite')}"></button>
        <button class="color-swatch color-swatch--pink-white"   data-color="pink-white"   title="${t('js.color.pinkWhite')}"></button>
        <button class="color-swatch color-swatch--purple-white" data-color="purple-white" title="${t('js.color.purpleWhite')}"></button>
        <button class="color-swatch color-swatch--gold-white"   data-color="gold-white"   title="${t('js.color.goldWhite')}"></button>
        <button class="color-swatch color-swatch--white-black"  data-color="white-black"  title="${t('js.color.whiteBlack')}"></button>
        <button class="color-swatch color-swatch--orange-white" data-color="orange-white" title="${t('js.color.orangeWhite')}"></button>
      </div>
    `;

    const currentColor = getPlayerColorKey(player);
    document.querySelectorAll("#color-picker-profile .color-swatch").forEach((sw) => {
      sw.classList.toggle("active", sw.dataset.color === currentColor);
      sw.addEventListener("click", () => {
        player.color = sw.dataset.color;
        saveData();
        document.querySelectorAll("#color-picker-profile .color-swatch").forEach((s) => {
          s.classList.toggle("active", s === sw);
        });
      });
    });

    showScreen("screen-player-profile");
  }

  /* ---------------------------------------------------------
     ELO — só para diversão entre amigos, não determina o
     leaderboard (que continua ordenado por vitórias/derrotas).
     Processa todos os jogos por ordem cronológica para que o
     ELO de cada jogador reflita a força dos adversários que
     defrontou ao longo do tempo, tal como no Faceit/xadrez.
     --------------------------------------------------------- */
  const ELO_BASE = 1000;
  const ELO_K = 32;

  function computeAllElos() {
    const elo = {}; // playerId -> rating atual
    DATA.players.forEach((p) => { elo[p.id] = ELO_BASE; });

    const chronological = DATA.games
      .slice()
      .sort((a, b) => new Date(a.endedAt) - new Date(b.endedAt));

    chronological.forEach((g) => {
      const blueId = g.blue.playerId;
      const whiteId = g.white.playerId;
      if (!blueId || !whiteId) return;
      if (!(blueId in elo)) elo[blueId] = ELO_BASE;
      if (!(whiteId in elo)) elo[whiteId] = ELO_BASE;

      const blueElo = elo[blueId];
      const whiteElo = elo[whiteId];

      // resultado real: 1 = vitória, 0.5 = empate, 0 = derrota (perspetiva do lado azul)
      let actualBlue;
      if (g.isDraw) actualBlue = 0.5;
      else actualBlue = g.winnerSide === "blue" ? 1 : 0;
      const actualWhite = 1 - actualBlue;

      // expectativa de vitória de cada lado, segundo a fórmula padrão de ELO
      const expectedBlue = 1 / (1 + Math.pow(10, (whiteElo - blueElo) / 400));
      const expectedWhite = 1 - expectedBlue;

      // margem extra: diferença de sets e eventuais capotes dão um pequeno
      // ajuste ao "peso" do resultado, para refletir o domínio na partida
      const setDiff = Math.abs(g.blue.setsWon - g.white.setsWon);
      const capoteCount = g.sets.filter((s) => s.capote).length;
      const marginFactor = 1 + Math.min(setDiff * 0.08 + capoteCount * 0.12, 0.5);

      const blueDelta = Math.round(ELO_K * marginFactor * (actualBlue - expectedBlue));
      const whiteDelta = Math.round(ELO_K * marginFactor * (actualWhite - expectedWhite));

      elo[blueId] = blueElo + blueDelta;
      elo[whiteId] = whiteElo + whiteDelta;
    });

    return elo;
  }

  function getPlayerElo(playerId, precomputedElos) {
    const allElos = precomputedElos || computeAllElos();
    return playerId in allElos ? allElos[playerId] : ELO_BASE;
  }

  function computePlayerStats(playerId, precomputedElos) {
    const games = DATA.games.filter(
      (g) => g.blue.playerId === playerId || g.white.playerId === playerId
    );
    let wins = 0, losses = 0, setsWon = 0, setsLost = 0, capotes = 0, capotesSuffered = 0;
    let gamesWon = 0, gamesLost = 0, gamesDrawn = 0;

    const rivalsMap = {}; // opponentId -> { name, gamesPlayed, gamesWon, gamesLost, gamesDrawn }

    games.forEach((g) => {
      const isBlue = g.blue.playerId === playerId;
      const me = isBlue ? g.blue : g.white;
      const opp = isBlue ? g.white : g.blue;
      const mySide = isBlue ? "blue" : "white";

      // sets (vitórias/derrotas a nível de set)
      setsWon += me.setsWon;
      setsLost += opp.setsWon;
      wins += me.setsWon;
      losses += opp.setsWon;

      // jogos (vitórias/derrotas/empates a nível de jogo completo)
      if (g.isDraw) gamesDrawn++;
      else if (g.winnerSide === mySide) gamesWon++;
      else gamesLost++;

      // capotes feitos e sofridos
      g.sets.forEach((s) => {
        if (!s.capote) return;
        if (s.winnerSide === mySide) capotes++;
        else capotesSuffered++;
      });

      // estatística de confrontos diretos (rival)
      if (opp.playerId) {
        if (!rivalsMap[opp.playerId]) {
          const oppPlayer = getPlayer(opp.playerId);
          rivalsMap[opp.playerId] = {
            id: opp.playerId,
            name: oppPlayer ? oppPlayer.name : "Jogador removido",
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            gamesDrawn: 0
          };
        }
        const r = rivalsMap[opp.playerId];
        r.gamesPlayed++;
        if (g.isDraw) r.gamesDrawn++;
        else if (g.winnerSide === mySide) r.gamesWon++;
        else r.gamesLost++;
      }
    });

    const gamesPlayed = games.length;
    const decidedGames = gamesWon + gamesLost; // win rate não conta empates
    const winRate = decidedGames > 0 ? Math.round((gamesWon / decidedGames) * 100) : 0;

    const rivals = Object.values(rivalsMap).sort((a, b) => b.gamesPlayed - a.gamesPlayed);
    const bestRival = rivals.filter((r) => r.gamesWon > 0).sort((a, b) => b.gamesWon - a.gamesWon)[0] || null;
    const worstRival = rivals.filter((r) => r.gamesLost > 0).sort((a, b) => b.gamesLost - a.gamesLost)[0] || null;

    return {
      gamesPlayed,
      gamesWon,
      gamesLost,
      gamesDrawn,
      wins,
      losses,
      setsWon,
      setsLost,
      capotes,
      capotesSuffered,
      winRate,
      rivals,
      bestRival,
      worstRival,
      elo: getPlayerElo(playerId, precomputedElos)
    };
  }

  document.getElementById("btn-delete-player").addEventListener("click", () => {
    if (!currentProfileId) return;
    const player = getPlayer(currentProfileId);
    if (!player) return;
    const confirmed = window.confirm(
      `Eliminar "${player.name}"? O histórico de jogos guardado mantém-se, mas o jogador deixa de poder ser escolhido em novos jogos.`
    );
    if (!confirmed) return;
    DATA.players = DATA.players.filter((p) => p.id !== currentProfileId);
    saveData();
    showScreen("screen-players");
    renderPlayersList();
  });

  /* ---------------------------------------------------------
     HISTÓRICO DE JOGOS
     --------------------------------------------------------- */
  function renderHistoryList() {
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    if (DATA.games.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">▤</div>
          <p>${t("js.noHistoryYet")}</p>
        </div>`;
      return;
    }

    DATA.games
      .slice()
      .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
      .forEach((g) => {
        const blueName = g.blue.playerId ? getPlayer(g.blue.playerId)?.name || "—" : "—";
        const whiteName = g.white.playerId ? getPlayer(g.white.playerId)?.name || "—" : "—";
        const blueWon = !g.isDraw && g.winnerSide === "blue";
        const whiteWon = !g.isDraw && g.winnerSide === "white";
        const capoteCount = g.sets.filter((s) => s.capote).length;
        const card = document.createElement("button");
        card.className = "history-card";
        card.style.width = "100%";
        card.style.textAlign = "left";
        card.innerHTML = `
          <div class="history-card-top">
            <span class="history-card-date">${formatDate(g.endedAt)}</span>
            <span class="history-card-format">${g.pointsTarget} PTS · ${formatModeLabel(g.format)}${g.isDraw ? " · " + t("js.draw") : ""}</span>
          </div>
          <div class="history-card-matchup">
            <div class="history-side history-side--blue">
              <span class="history-side-name ${blueWon ? "is-winner" : ""}">${escapeHTML(blueName)}</span>
              <span class="history-side-sets">${g.blue.setsWon}</span>
            </div>
            <span class="history-card-sep">${t("js.setsSep")}</span>
            <div class="history-side history-side--white history-side--right">
              <span class="history-side-name ${whiteWon ? "is-winner" : ""}">${escapeHTML(whiteName)}</span>
              <span class="history-side-sets">${g.white.setsWon}</span>
            </div>
          </div>
          ${capoteCount > 0 ? `<span class="capote-tag capote-tag--card">${capoteCount > 1 ? t("js.xCapote").replace("%n", capoteCount) : t("js.capoteTag")}</span>` : ""}
          ${g.description ? `<p class="history-card-desc">${escapeHTML(g.description)}</p>` : ""}
        `;
        card.addEventListener("click", () => openGameDetail(g.id));
        list.appendChild(card);
      });
  }

  function formatModeLabel(format) {
    if (format === "3") return t("js.modeMd3");
    if (format === "5") return t("js.modeMd5");
    if (format === "7") return t("js.modeMd7");
    return t("js.modeFree");
  }

  function openGameDetail(gameId) {
    const g = DATA.games.find((x) => x.id === gameId);
    if (!g) return;
    const blueName = g.blue.playerId ? getPlayer(g.blue.playerId)?.name || "—" : "—";
    const whiteName = g.white.playerId ? getPlayer(g.white.playerId)?.name || "—" : "—";
    const blueWon = !g.isDraw && g.winnerSide === "blue";

    const setsHTML = g.sets
      .map((s, i) => {
        const winnerName = s.winnerSide === "blue" ? blueName : whiteName;
        const momentumSVG = buildMomentumSVG({ ...s, _idx: `${g.id}_${i}` }, blueName, whiteName, g.blue.playerId, g.white.playerId);
        return `
          <div class="set-row set-row--expanded">
            <div class="set-row-top">
              <span class="set-row-num">${t("js.setLabel")} ${i + 1}</span>
              <span class="set-row-score">${s.blueScore} – ${s.whiteScore}</span>
              <span class="set-row-winner">${winnerName}${s.capote ? '<span class="capote-tag">'+t("js.capoteTag")+'</span>' : ""}</span>
            </div>
            ${momentumSVG}
          </div>`;
      })
      .join("");

    const resultLabel = g.isDraw
      ? t("js.gameEndedDraw")
      : t("js.setsWonBy").replace("%p", blueWon ? escapeHTML(blueName) : escapeHTML(whiteName));

    document.getElementById("game-detail-content").innerHTML = `
      <div class="detail-header">
        <div class="detail-matchup">
          <span class="detail-name">${escapeHTML(blueName)}</span>
          <span class="detail-score">${g.blue.setsWon} – ${g.white.setsWon}</span>
          <span class="detail-name">${escapeHTML(whiteName)}</span>
        </div>
        <p class="detail-sub">${formatDate(g.endedAt)} · ${t("js.ptsPerSet").replace("%n", g.pointsTarget)} · ${formatModeLabel(g.format)} · ${t("js.duration")} ${formatClock(g.durationSeconds)}</p>
        ${g.description ? `<p class="detail-description">"${escapeHTML(g.description)}"</p>` : ""}
      </div>
      <p class="section-label">${resultLabel}</p>
      ${setsHTML}
    `;
    showScreen("screen-game-detail");
  }

  /* ---------------------------------------------------------
     GRÁFICO DE MOMENTUM — linha simples em SVG que mostra quem
     dominou o set, ponto a ponto (diferença acumulada azul-branco)
     --------------------------------------------------------- */
  function buildMomentumSVG(set, blueName, whiteName, bluePlayerId, whitePlayerId) {
    const log = set.pointLog;
    if (!log || log.length === 0) return "";

    // cores reais de cada jogador (mesma lógica do placar de jogo)
    const blueColorKey = getPlayerColorKey(getPlayer(bluePlayerId));
    const whiteColorKeyRaw = getPlayerColorKey(getPlayer(whitePlayerId));
    const blueColor = PLAYER_COLORS[blueColorKey].bg;
    const whiteColor = blueColorKey === whiteColorKeyRaw
      ? PLAYER_COLORS[whiteColorKeyRaw].fg
      : PLAYER_COLORS[whiteColorKeyRaw].bg;
    const whiteColorForChart = whiteColor.toLowerCase() === "#f4f1ea" ? "#7a8a9a" : whiteColor;

    // contagem de sequências longas de cada lado, para o resumo textual
    let blueLeadPoints = 0, whiteLeadPoints = 0;
    let runningDiff = 0;
    log.forEach((side) => {
      runningDiff += side === "blue" ? 1 : -1;
      if (runningDiff > 0) blueLeadPoints++;
      else if (runningDiff < 0) whiteLeadPoints++;
    });
    let leadSummary;
    if (blueLeadPoints === whiteLeadPoints) {
      leadSummary = t("js.setBalanced");
    } else {
      const leaderName = blueLeadPoints > whiteLeadPoints
        ? escapeHTML(blueName)
        : escapeHTML(whiteName);
      leadSummary = `${leaderName} esteve à frente a maior parte do set`;
    }

    // cada ponto é um bloco colorido; tamanho e gap adaptam-se ao número total de pontos
    const total = log.length;
    const W = 600;
    const BLOCK_H = 28;
    const GAP = total > 60 ? 1 : total > 30 ? 2 : 3;
    const blockW = Math.max(4, Math.floor((W - GAP * (total - 1)) / total));
    const actualW = blockW * total + GAP * (total - 1);
    const offsetX = Math.floor((W - actualW) / 2);

    const rects = log.map((side, i) => {
      const x = offsetX + i * (blockW + GAP);
      const color = side === "blue" ? blueColor : whiteColorForChart;
      return `<rect x="${x}" y="0" width="${blockW}" height="${BLOCK_H}" fill="${color}" rx="1.5"/>`;
    }).join("");

    // linha de placar corrente por baixo dos blocos (score a cada ponto)
    // mostramos só os múltiplos de 5 para não sobrecarregar
    const ticks = [];
    let b = 0, w = 0;
    log.forEach((side, i) => {
      if (side === "blue") b++; else w++;
      if ((b + w) % 5 === 0 || i === log.length - 1) {
        const x = offsetX + i * (blockW + GAP) + blockW / 2;
        ticks.push(`<text x="${x.toFixed(1)}" y="52" class="momentum-tick">${b}-${w}</text>`);
      }
    });

    const svgH = 60;

    return `
      <div class="momentum-wrap">
        <p class="momentum-summary">${leadSummary}</p>
        <div class="momentum-point-legend">
          <span class="momentum-legend-dot" style="background:${blueColor}"></span>
          <span class="momentum-legend-name">${escapeHTML(blueName)}</span>
          <span class="momentum-legend-dot" style="background:${whiteColorForChart}"></span>
          <span class="momentum-legend-name">${escapeHTML(whiteName)}</span>
        </div>
        <svg viewBox="0 0 ${W} ${svgH}" class="momentum-svg" preserveAspectRatio="xMidYMid meet">
          ${rects}
          ${ticks.join("")}
        </svg>
        <p class="momentum-total">${total} pontos jogados</p>
      </div>
    `;
  }

  /* ---------------------------------------------------------
     SETUP DE NOVO JOGO
     --------------------------------------------------------- */
  let setup = {
    bluePlayerId: null,
    whitePlayerId: null,
    mode: "custom", // "custom" | "classic"
    points: 21,
    format: "free",
    description: ""
  };

  function openSetup() {
    setup = { bluePlayerId: null, whitePlayerId: null, mode: "custom", points: 21, format: "free", description: "" };
    document.getElementById("input-game-description").value = "";
    updateSetupUI();
    updateModeUI();
    updateOptionsUI();
    showScreen("screen-setup");
  }

  function updateSetupUI() {
    const bluePick = document.getElementById("pick-blue");
    const whitePick = document.getElementById("pick-white");

    if (setup.bluePlayerId) {
      const p = getPlayer(setup.bluePlayerId);
      bluePick.classList.add("is-filled");
      bluePick.innerHTML = `<span>${escapeHTML(p.name)}</span>`;
    } else {
      bluePick.classList.remove("is-filled");
      bluePick.innerHTML = `<span>${t("js.choosePlayer")}</span>`;
    }

    if (setup.whitePlayerId) {
      const p = getPlayer(setup.whitePlayerId);
      whitePick.classList.add("is-filled");
      whitePick.innerHTML = `<span>${escapeHTML(p.name)}</span>`;
    } else {
      whitePick.classList.remove("is-filled");
      whitePick.innerHTML = `<span>${t("js.choosePlayer")}</span>`;
    }

    const goNextBtn = document.getElementById("btn-goto-mode");
    const ready = setup.bluePlayerId && setup.whitePlayerId && setup.bluePlayerId !== setup.whitePlayerId;
    goNextBtn.disabled = !ready;
  }

  document.getElementById("input-game-description").addEventListener("input", (e) => {
    setup.description = e.target.value;
  });

  /* ---------- passo 2: Clássico / Personalizado ---------- */
  function updateModeUI() {
    document.getElementById("mode-custom").classList.toggle("active", setup.mode === "custom");
    document.getElementById("mode-classic").classList.toggle("active", setup.mode === "classic");
  }

  document.getElementById("mode-custom").addEventListener("click", () => {
    setup.mode = "custom";
    updateModeUI();
  });
  document.getElementById("mode-classic").addEventListener("click", () => {
    setup.mode = "classic";
    updateModeUI();
  });

  document.getElementById("btn-goto-mode").addEventListener("click", () => {
    showScreen("screen-setup-mode");
  });
  document.getElementById("btn-back-from-mode").addEventListener("click", () => {
    showScreen("screen-setup");
  });

  document.getElementById("btn-goto-options").addEventListener("click", () => {
    // ao entrar no modo Clássico, força pontos=11 e formato válido (3/5/7); nunca "free"
    if (setup.mode === "classic") {
      setup.points = 11;
      if (setup.format === "free") setup.format = "3";
    } else {
      // Personalizado: predefinição é sempre 21 pontos ao entrar vindo do Clássico
      if (setup.points !== 11 && setup.points !== 21) setup.points = 21;
    }
    updateOptionsUI();
    showScreen("screen-setup-options");
  });
  document.getElementById("btn-back-from-options").addEventListener("click", () => {
    showScreen("screen-setup-mode");
  });

  /* ---------- passo 3: pontos e formato ---------- */
  function updateOptionsUI() {
    const isClassic = setup.mode === "classic";

    // pontos por set: no Clássico só existe 11, escondemos a secção toda
    document.getElementById("section-points").hidden = isClassic;

    // formato: Clássico esconde "Livre" e mostra "Melhor de 7"; Personalizado é o oposto
    document.querySelector('#opt-format [data-format="free"]').hidden = isClassic;
    document.getElementById("opt-format-7").hidden = !isClassic;

    document.querySelectorAll("#opt-points .setup-option").forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.points) === setup.points);
    });
    document.querySelectorAll("#opt-format .setup-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.format === setup.format);
    });
  }

  document.querySelectorAll("#opt-points .setup-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      setup.points = Number(btn.dataset.points);
      updateOptionsUI();
    });
  });
  document.querySelectorAll("#opt-format .setup-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      setup.format = btn.dataset.format;
      updateOptionsUI();
    });
  });

  let pickTarget = null; // "blue" | "white"
  document.getElementById("pick-blue").addEventListener("click", () => openPicker("blue"));
  document.getElementById("pick-white").addEventListener("click", () => openPicker("white"));
  document.getElementById("btn-cancel-pick").addEventListener("click", () => showScreen("screen-setup"));

  function openPicker(side) {
    pickTarget = side;
    document.getElementById("pick-player-title").textContent =
      side === "blue" ? t("js.chooseBlue") : t("js.chooseWhite");

    const list = document.getElementById("pick-player-list");
    list.innerHTML = "";

    if (DATA.players.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">☷</div>
          <p>${t("js.noPlayersYet")}</p>
        </div>`;
      showScreen("screen-pick-player");
      return;
    }

    const otherSide = side === "blue" ? setup.whitePlayerId : setup.bluePlayerId;

    DATA.players
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "pt"))
      .forEach((p) => {
        const disabled = p.id === otherSide;
        const card = document.createElement("button");
        card.className = "pick-player-card" + (disabled ? " disabled" : "");
        card.style.width = "100%";
        card.innerHTML = `
          <div class="player-avatar">${playerInitials(p.name)}</div>
          <div class="player-info"><strong>${escapeHTML(p.name)}</strong></div>
        `;
        if (!disabled) {
          card.addEventListener("click", () => {
            if (side === "blue") setup.bluePlayerId = p.id;
            else setup.whitePlayerId = p.id;
            updateSetupUI();
            showScreen("screen-setup");
          });
        }
        list.appendChild(card);
      });

    showScreen("screen-pick-player");
  }

  document.getElementById("btn-confirm-setup").addEventListener("click", () => {
    if (setup.bluePlayerId && setup.whitePlayerId) {
      startNewGame(setup.bluePlayerId, setup.whitePlayerId, setup.points, setup.format, setup.description, setup.mode);
    }
  });

  /* ---------------------------------------------------------
     LÓGICA DO JOGO (placar, sets, capote, cronómetro)
     --------------------------------------------------------- */
  let game = null;       // estado do jogo em curso
  let timerInterval = null;

  function startNewGame(bluePlayerId, whitePlayerId, points, format, description, mode) {
    lastSetEndSnapshot = null;
    game = {
      id: uid("game"),
      bluePlayerId,
      whitePlayerId,
      pointsTarget: points,
      format,
      gameMode: mode || "custom",
      description: (description || "").trim(),
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      paused: false,
      currentBlue: 0,
      currentWhite: 0,
      pointLog: [],       // sequência de pontos do set atual: "blue" | "white"
      servingSide: null,  // definido no ecrã BOLAR
      sets: [],          // sets já fechados: { blueScore, whiteScore, winnerSide, capote, pointLog }
      blueSetsWon: 0,
      whiteSetsWon: 0
    };
    persistActiveGame();
    openBolarScreen();
  }

  /* ---------------------------------------------------------
     BOLAR — escolher quem serve primeiro, no início de cada set
     --------------------------------------------------------- */
  function openBolarScreen() {
    const blueName = getPlayer(game.bluePlayerId)?.name || t("js.sideBlue");
    const whiteName = getPlayer(game.whitePlayerId)?.name || t("js.sideWhite");
    document.getElementById("bolar-name-blue").textContent = blueName;
    document.getElementById("bolar-name-white").textContent = whiteName;
    const setNumber = game.sets.length + 1;
    document.getElementById("bolar-set-label").textContent = t("js.whoseServe",{n:setNumber});
    applyGameColors();
    showScreen("screen-bolar");
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(tryLockOrientation).catch(() => {});
    } else {
      tryLockOrientation();
    }
  }

  function chooseServer(side) {
    game.servingSide = side;
    persistActiveGame();
    resumeGameUI();
    showScreen("screen-game");
  }
  document.getElementById("bolar-blue").addEventListener("click", () => chooseServer("blue"));
  document.getElementById("bolar-white").addEventListener("click", () => chooseServer("white"));

  function persistActiveGame() {
    DATA.activeGame = game;
    saveData();
  }

  /* ---------------------------------------------------------
     RESOLUÇÃO DE CORES DO JOGO — cada jogador tem a sua cor de
     placar; se ambos tiverem escolhido a MESMA cor, o jogador
     do lado branco joga com essa cor invertida (fundo <-> número).
     --------------------------------------------------------- */
  function resolveGameColors() {
    const bluePlayer = getPlayer(game.bluePlayerId);
    const whitePlayer = getPlayer(game.whitePlayerId);
    const blueColorKey = getPlayerColorKey(bluePlayer);
    const whiteColorKey = getPlayerColorKey(whitePlayer);

    const blueColor = PLAYER_COLORS[blueColorKey];
    let whiteColor;
    if (blueColorKey === whiteColorKey) {
      // coincidência: o lado branco joga com a cor do jogador invertida
      whiteColor = invertedColor(whiteColorKey);
    } else {
      whiteColor = PLAYER_COLORS[whiteColorKey];
    }

    return { blueColor, whiteColor };
  }

  function applyGameColors() {
    const { blueColor, whiteColor } = resolveGameColors();
    [document.getElementById("board"), document.querySelector(".bolar-board")].forEach((el) => {
      if (!el) return;
      el.style.setProperty("--side-blue-bg", blueColor.bg);
      el.style.setProperty("--side-blue-fg", blueColor.fg);
      el.style.setProperty("--side-white-bg", whiteColor.bg);
      el.style.setProperty("--side-white-fg", whiteColor.fg);
    });
  }

  function resumeGameUI() {
    game = DATA.activeGame;
    if (!game) return;

    const blueName = getPlayer(game.bluePlayerId)?.name || t("js.sideBlue");
    const whiteName = getPlayer(game.whitePlayerId)?.name || t("js.sideWhite");
    document.getElementById("name-blue").textContent = blueName;
    document.getElementById("name-white").textContent = whiteName;

    const allElos = computeAllElos();
    const blueEloEl = document.getElementById("elo-blue");
    const whiteEloEl = document.getElementById("elo-white");
    blueEloEl.textContent = game.bluePlayerId ? ` · ${getPlayerElo(game.bluePlayerId, allElos)}` : "";
    whiteEloEl.textContent = game.whitePlayerId ? ` · ${getPlayerElo(game.whitePlayerId, allElos)}` : "";

    applyGameColors();
    renderScores();
    startTimerLoop();
    startServeBlinkLoop();
  }

  function renderScores() {
    document.getElementById("score-blue").textContent = game.currentBlue;
    document.getElementById("score-white").textContent = game.currentWhite;
    document.querySelector("#sets-blue .sets-num").textContent = game.blueSetsWon;
    document.querySelector("#sets-white .sets-num").textContent = game.whiteSetsWon;
    document.getElementById("timer").textContent = formatClock(game.elapsedSeconds);
    renderServeIndicator();
  }

  /* ---------------------------------------------------------
     SERVIÇO — troca de lado a cada múltiplo de 5 na soma dos
     pontos do set atual (ex: 4+1=5, 8+7=15, 9+6=15...).
     A bolinha de serviço pisca do lado de quem está a servir.
     --------------------------------------------------------- */
  function isDeuce() {
    if (!game || game.gameMode !== "classic") return false;
    const target = game.pointsTarget;
    // deuce começa quando ambos chegam a target-1 (ex: 10-10 num jogo de 11)
    return game.currentBlue >= target - 1 && game.currentWhite >= target - 1
      && game.currentBlue === game.currentWhite;
  }

  function serveSwapInterval() {
    if (!game) return 5;
    if (game.gameMode === "classic") {
      return isDeuce() ? 1 : 2;
    }
    return 5;
  }

  function currentServingSide() {
    if (!game || !game.servingSide) return null;
    const blue = game.currentBlue;
    const white = game.currentWhite;
    const target = game.pointsTarget;

    if (game.gameMode === "classic" && blue >= target - 1 && white >= target - 1) {
      // em deuce: contamos pontos a partir do momento em que o deuce começou (target-1, target-1)
      // cada ponto individual troca o serviço
      const pointsSinceDeuce = (blue - (target - 1)) + (white - (target - 1));
      const swaps = pointsSinceDeuce;
      // antes do deuce calculamos trocas normais (a cada 2) até (target-1)*2 pontos totais
      const totalBeforeDeuce = (target - 1) * 2;
      const swapsBeforeDeuce = Math.floor(totalBeforeDeuce / 2);
      const totalSwaps = swapsBeforeDeuce + swaps;
      return totalSwaps % 2 === 0 ? game.servingSide : otherSide(game.servingSide);
    }

    const total = blue + white;
    const interval = game.gameMode === "classic" ? 2 : 5;
    const swaps = Math.floor(total / interval);
    return swaps % 2 === 0 ? game.servingSide : otherSide(game.servingSide);
  }

  function otherSide(side) {
    return side === "blue" ? "white" : "blue";
  }

  function renderServeIndicator() {
    const ballBlue = document.getElementById("serve-ball-blue");
    const ballWhite = document.getElementById("serve-ball-white");
    const serving = currentServingSide();
    ballBlue.hidden = serving !== "blue";
    ballWhite.hidden = serving !== "white";
  }

  let serveBlinkInterval = null;
  function startServeBlinkLoop() {
    stopServeBlinkLoop();
    serveBlinkInterval = setInterval(() => {
      document.getElementById("serve-ball-blue").classList.toggle("is-dim");
      document.getElementById("serve-ball-white").classList.toggle("is-dim");
    }, 600);
  }
  function stopServeBlinkLoop() {
    if (serveBlinkInterval) clearInterval(serveBlinkInterval);
    serveBlinkInterval = null;
  }

  function startTimerLoop() {
    stopTimerLoop();
    timerInterval = setInterval(() => {
      if (game && !game.paused) {
        game.elapsedSeconds++;
        document.getElementById("timer").textContent = formatClock(game.elapsedSeconds);
        // guarda a cada 5s para não sobrecarregar localStorage
        if (game.elapsedSeconds % 5 === 0) persistActiveGame();
      }
    }, 1000);
  }
  function stopTimerLoop() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  document.getElementById("btn-pause").addEventListener("click", () => {
    if (!game) return;
    game.paused = !game.paused;
    document.getElementById("timer").classList.toggle("is-paused", game.paused);
    persistActiveGame();
  });

  /* ---------------------------------------------------------
     SONS — via Web Audio API (sem ficheiros externos)
     --------------------------------------------------------- */
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    return audioCtx;
  }

  function playTone(freq, durationMs, volume, type) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // compressor dinâmico: aumenta a perceção de volume sem clippar
    // (como um limiter profissional — faz o som "aparecer" mais no altifalante)
    if (!ctx._compressor) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.knee.value = 4;
      comp.ratio.value = 8;
      comp.attack.value = 0.003;
      comp.release.value = 0.1;
      comp.connect(ctx.destination);
      ctx._compressor = comp;
    }

    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx._compressor);

    const now = ctx.currentTime;
    const dur = durationMs / 1000;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume * 0.05, 0.001), now + dur);
    gain.gain.linearRampToValueAtTime(0, now + dur + 0.015);

    osc.start(now);
    osc.stop(now + dur + 0.04);
  }


  // ponto marcado: "pling" limpo e agudo, tipo sininho — leve e imediato
  // usa sine puro em frequência alta para soar como uma nota musical real
  function playTapSound() {
    playTone(1760, 100, 0.75, "sine");  // Lá5 — nota musical clara
    playTone(2637,  55, 0.30, "sine");  // Mi7 — harmónico natural, dá brilho
  }

  // troca de serviço: "dun-dun" duplo, grave e redondo — não alarma, só informa
  // triangle dá um som mais "oco" e suave que square ou sawtooth
  function playServeChangeSound() {
    playTone(330, 160, 0.80, "triangle");  // Mi3 — grave e redondo
    setTimeout(() => playTone(440, 180, 0.80, "triangle"), 190);  // Lá3 — ligeiramente mais alto
  }

  // match point: sirene urgente com salto de oitava no fim — inconfundível
  // sawtooth tem muito mais harmónicos que square, soa mais "cortante" e urgente
  function playMatchPointSound() {
    playTone(523,  110, 0.85, "sawtooth");  // Dó5
    setTimeout(() => playTone(659,  110, 0.85, "sawtooth"), 130);  // Mi5
    setTimeout(() => playTone(1047, 220, 0.85, "sawtooth"), 265);  // Dó6 — salta oitava, muito marcante
  }

  // deuce: dois tons simultâneos em segunda menor (intervalo mais tenso da música)
  // triangle grave para soar "pesado" — transmite equilíbrio instável
  function playDeuceSound() {
    playTone(392, 200, 0.78, "triangle");  // Sol4
    setTimeout(() => playTone(415, 200, 0.70, "triangle"), 80);   // Lá♭4 — segunda menor, tensão máxima
    setTimeout(() => playTone(392, 280, 0.68, "triangle"), 380);  // Sol4 de novo — resolve ligeiramente
  }


  /* ---------------------------------------------------------
     STATUS BANNER — animação visual central para deuce e match point
     --------------------------------------------------------- */
  let statusBannerTimeout = null;
  function showStatusBanner(text, kind) {
    const banner = document.getElementById("status-banner");
    const label = document.getElementById("status-banner-text");
    label.textContent = text;
    banner.classList.remove("is-matchpoint", "is-playing");
    void banner.offsetWidth; // força reinício da animação mesmo se já estava a correr
    banner.classList.toggle("is-matchpoint", kind === "matchpoint");
    banner.hidden = false;
    banner.classList.add("is-playing");

    if (statusBannerTimeout) clearTimeout(statusBannerTimeout);
    statusBannerTimeout = setTimeout(() => {
      banner.hidden = true;
      banner.classList.remove("is-playing");
    }, 1700);
  }

  // histórico de ações para permitir "anular último ponto"
  let pointHistory = [];
  let lastSetEndSnapshot = null; // permite desfazer um fim de set por engano

  document.getElementById("half-blue").addEventListener("click", () => addPoint("blue"));
  document.getElementById("half-white").addEventListener("click", () => addPoint("white"));

  function addPoint(side) {
    if (!game || game.paused) return;

    playTapSound();

    const servingBefore = currentServingSide();
    const wasDeuceBefore = isDeuce();

    pointHistory.push(side);
    if (side === "blue") game.currentBlue++;
    else game.currentWhite++;
    game.pointLog.push(side);

    renderScores();
    persistActiveGame();

    const servingAfter = currentServingSide();
    if (servingAfter !== servingBefore) {
      playServeChangeSound();
    }

    const wasSetEnd = checkSetEnd();
    if (!wasSetEnd) {
      const isDeuceNow = isDeuce();
      if (isDeuceNow && !wasDeuceBefore) {
        playDeuceSound();
        showStatusBanner(t("js.deuce"), "deuce");
      } else if (isMatchPoint()) {
        playMatchPointSound();
        showStatusBanner(t("js.matchPoint"), "matchpoint");
      }
    }
  }

  document.getElementById("btn-undo").addEventListener("click", () => {
    if (!game || pointHistory.length === 0) return;
    const last = pointHistory.pop();
    if (last === "blue" && game.currentBlue > 0) game.currentBlue--;
    if (last === "white" && game.currentWhite > 0) game.currentWhite--;
    if (game.pointLog.length > 0) game.pointLog.pop();
    renderScores();
    persistActiveGame();
  });

  // match point: o próximo ponto de um dos lados terminaria o set
  function isMatchPoint() {
    const target = game.pointsTarget;
    const blue = game.currentBlue;
    const white = game.currentWhite;
    const blueWouldWin = blue + 1 >= target && (blue + 1) - white >= 2;
    const whiteWouldWin = white + 1 >= target && (white + 1) - blue >= 2;
    return blueWouldWin || whiteWouldWin;
  }

  function checkSetEnd() {
    const target = game.pointsTarget;
    const blue = game.currentBlue;
    const white = game.currentWhite;
    const minLead = 2; // regra padrão de ping pong: vantagem de 2

    let winnerSide = null;
    let isCapote = false;

    // regra normal: chega ao alvo com pelo menos 2 de diferença
    if (blue >= target && blue - white >= minLead) winnerSide = "blue";
    else if (white >= target && white - blue >= minLead) winnerSide = "white";

    // regra de "capote": só se aplica em jogos de 21 pontos, e cobre dois casos:
    //  (a) interrupção antecipada — alguém chega aos 11 com o adversário ainda a 0;
    //  (b) resultado final — o set corre normalmente até ao fim (alguém faz 21+ com
    //      vantagem de 2), mas o adversário não passou dos 10 pontos.
    if (target === 21) {
      if (!winnerSide && blue >= 11 && white === 0) {
        winnerSide = "blue";
        isCapote = true;
      } else if (!winnerSide && white >= 11 && blue === 0) {
        winnerSide = "white";
        isCapote = true;
      } else if (winnerSide === "blue" && white <= 10) {
        isCapote = true;
      } else if (winnerSide === "white" && blue <= 10) {
        isCapote = true;
      }
    }

    if (!winnerSide) return false; // set continua

    // snapshot do estado mesmo antes de fechar o set, para permitir desfazer
    // caso o "fim de set" tenha sido um engano (clique na pessoa errada)
    lastSetEndSnapshot = {
      currentBlue: blue,
      currentWhite: white,
      pointLog: game.pointLog.slice(),
      servingSide: game.servingSide,
      pointHistory: pointHistory.slice(),
      winnerSide: winnerSide
    };

    // fecha o set
    const closedSet = {
      blueScore: blue,
      whiteScore: white,
      winnerSide,
      capote: isCapote,
      pointLog: game.pointLog.slice()
    };
    game.sets.push(closedSet);
    if (winnerSide === "blue") game.blueSetsWon++;
    else game.whiteSetsWon++;

    game.currentBlue = 0;
    game.currentWhite = 0;
    game.pointLog = [];
    game.servingSide = null;
    pointHistory = [];
    persistActiveGame();
    renderScores();
    stopServeBlinkLoop();

    showSetEndOverlay(closedSet, winnerSide);
    return true;
  }

  function showSetEndOverlay(closedSet, winnerSide) {
    const winnerName =
      winnerSide === "blue"
        ? getPlayer(game.bluePlayerId)?.name || t("js.sideBlue")
        : getPlayer(game.whitePlayerId)?.name || t("js.sideWhite");

    document.getElementById("set-end-eyebrow").textContent = closedSet.capote ? t("js.endOfSetCapote") : t("js.endOfSet");
    document.getElementById("set-end-winner").textContent = t("js.setWon",{n:winnerName});
    document.getElementById("set-end-detail").textContent = `${closedSet.blueScore} — ${closedSet.whiteScore}`;

    const recap = document.getElementById("set-end-recap");
    recap.innerHTML = game.sets
      .map((s, i) => {
        const cls = s.capote ? "recap-pill is-capote" : "recap-pill";
        return `<span class="${cls}">${t("js.setRecap").replace("%n", i + 1)}: ${s.blueScore}-${s.whiteScore}</span>`;
      })
      .join("");

    // se o formato for melhor-de-3, melhor-de-5 ou melhor-de-7, avisamos quando já há
    // vencedor matemático, mas a decisão de avançar ou terminar continua a ser do utilizador.
    const neededToWin = game.format === "3" ? 2 : game.format === "5" ? 3 : game.format === "7" ? 4 : null;
    const nextBtn = document.getElementById("btn-next-set");
    if (neededToWin && (game.blueSetsWon >= neededToWin || game.whiteSetsWon >= neededToWin)) {
      const matchWinnerName =
        game.blueSetsWon >= neededToWin
          ? getPlayer(game.bluePlayerId)?.name || t("js.sideBlue")
          : getPlayer(game.whitePlayerId)?.name || t("js.sideWhite");
      document.getElementById("set-end-eyebrow").textContent = closedSet.capote
        ? t("js.endOfSetCapoteDeciding")
        : t("js.endOfSetDeciding");
      nextBtn.textContent = t("js.continue");
      document.getElementById("overlay-set-end").dataset.decided = "1";
    } else {
      nextBtn.textContent = t("js.nextSet");
      delete document.getElementById("overlay-set-end").dataset.decided;
    }

    document.getElementById("overlay-set-end").hidden = false;
  }

  document.getElementById("btn-next-set").addEventListener("click", () => {
    document.getElementById("overlay-set-end").hidden = true;
    lastSetEndSnapshot = null;
    openBolarScreen();
  });

  document.getElementById("btn-finish-from-set").addEventListener("click", () => {
    document.getElementById("overlay-set-end").hidden = true;
    lastSetEndSnapshot = null;
    openConfirmEndOverlay();
  });

  document.getElementById("btn-undo-set-end").addEventListener("click", () => {
    if (!game || !lastSetEndSnapshot) return;

    // remove o set que tinha acabado de fechar e repõe os sets ganhos
    game.sets.pop();
    if (lastSetEndSnapshot.winnerSide === "blue" && game.blueSetsWon > 0) game.blueSetsWon--;
    if (lastSetEndSnapshot.winnerSide === "white" && game.whiteSetsWon > 0) game.whiteSetsWon--;

    // repõe o estado do set tal como estava mesmo antes do ponto final,
    // e depois retira esse último ponto para corrigir o engano
    game.currentBlue = lastSetEndSnapshot.currentBlue;
    game.currentWhite = lastSetEndSnapshot.currentWhite;
    game.pointLog = lastSetEndSnapshot.pointLog;
    game.servingSide = lastSetEndSnapshot.servingSide;
    pointHistory = lastSetEndSnapshot.pointHistory;

    const lastPoint = pointHistory.pop();
    if (lastPoint === "blue" && game.currentBlue > 0) game.currentBlue--;
    if (lastPoint === "white" && game.currentWhite > 0) game.currentWhite--;
    if (game.pointLog.length > 0) game.pointLog.pop();

    lastSetEndSnapshot = null;
    persistActiveGame();

    document.getElementById("overlay-set-end").hidden = true;
    resumeGameUI();
    showScreen("screen-game");
    showToast(t("js.undoToast"), "success");
  });

  /* ---------- terminar jogo ---------- */
  document.getElementById("btn-end-game").addEventListener("click", openConfirmEndOverlay);

  function openConfirmEndOverlay() {
    const detail = document.getElementById("confirm-end-detail");
    if (game.currentBlue > 0 || game.currentWhite > 0) {
      detail.textContent = t("js.setInProgress").replace("%b",game.currentBlue).replace("%w",game.currentWhite);
    } else {
      detail.textContent = t("js.confirmEnd");
    }
    document.getElementById("overlay-confirm-end").hidden = false;
  }
  document.getElementById("btn-cancel-end").addEventListener("click", () => {
    document.getElementById("overlay-confirm-end").hidden = true;
  });
  document.getElementById("btn-confirm-end").addEventListener("click", () => {
    document.getElementById("overlay-confirm-end").hidden = true;
    finishGame();
  });

  function finishGame() {
    stopTimerLoop();
    stopServeBlinkLoop();
    lastSetEndSnapshot = null;

    if (game.sets.length === 0) {
      // nenhum set foi concluído — descarta sem guardar no histórico
      DATA.activeGame = null;
      saveData();
      showScreen("screen-menu");
      checkResumeBanner();
      return;
    }

    let winnerSide = null;
    let isDraw = false;
    if (game.blueSetsWon > game.whiteSetsWon) winnerSide = "blue";
    else if (game.whiteSetsWon > game.blueSetsWon) winnerSide = "white";
    else isDraw = true;

    const record = {
      id: game.id,
      pointsTarget: game.pointsTarget,
      format: game.format,
      gameMode: game.gameMode || "custom",
      description: game.description || "",
      startedAt: game.startedAt,
      endedAt: new Date().toISOString(),
      durationSeconds: game.elapsedSeconds,
      sets: game.sets,
      winnerSide,
      isDraw,
      blue: { playerId: game.bluePlayerId, setsWon: game.blueSetsWon },
      white: { playerId: game.whitePlayerId, setsWon: game.whiteSetsWon }
    };

    DATA.games.push(record);
    DATA.activeGame = null;
    saveData();
    if(record.blue.playerId)checkAchievements("game",record.blue.playerId);
    if(record.white.playerId)checkAchievements("game",record.white.playerId);
    if(game.tournamentId){record.tournamentId=game.tournamentId;onTournamentGameFinished(record);return;}
    showGameEndOverlay(record);
  }

  let _lastGameSetup = null; // guardado para "jogar de novo"

  function showGameEndOverlay(record) {
    _lastGameSetup = {
      bluePlayerId: record.blue.playerId,
      whitePlayerId: record.white.playerId,
      points: record.pointsTarget,
      format: record.format,
      description: record.description,
      mode: record.gameMode
    };
    const blueName = getPlayer(record.blue.playerId)?.name || t("js.sideBlue");
    const whiteName = getPlayer(record.white.playerId)?.name || t("js.sideWhite");

    if (record.isDraw) {
      document.getElementById("game-end-winner").textContent = t("js.drawBetween") + " " + blueName + " & " + whiteName;
    } else {
      const winnerName = record.winnerSide === "blue" ? blueName : whiteName;
      document.getElementById("game-end-winner").textContent = t("js.gameWon",{n:winnerName});
    }
    const recap = document.getElementById("game-end-recap");
    recap.innerHTML = `
      <span class="recap-pill">${blueName} ${record.blue.setsWon}</span>
      <span class="recap-pill">${whiteName} ${record.white.setsWon}</span>
    ` + record.sets
      .map((s, i) => {
        const cls = s.capote ? "recap-pill is-capote" : "recap-pill";
        return `<span class="${cls}">${t("js.setRecap").replace("%n", i + 1)}: ${s.blueScore}-${s.whiteScore}</span>`;
      })
      .join("");

    document.getElementById("overlay-game-end").hidden = false;
  }

  document.getElementById("btn-game-end-ok").addEventListener("click", () => {
    document.getElementById("overlay-game-end").hidden = true;
    game = null;
    pointHistory = [];
    showScreen("screen-menu");
    checkResumeBanner();
  });

  document.getElementById("btn-game-end-again").addEventListener("click", () => {
    document.getElementById("overlay-game-end").hidden = true;
    game = null;
    pointHistory = [];
    if (_lastGameSetup) {
      startNewGame(
        _lastGameSetup.bluePlayerId,
        _lastGameSetup.whitePlayerId,
        _lastGameSetup.points,
        _lastGameSetup.format,
        _lastGameSetup.description,
        _lastGameSetup.mode
      );
    } else {
      showScreen("screen-menu");
    }
  });

  /* ---------------------------------------------------------
     TOAST — feedback rápido não-bloqueante
     --------------------------------------------------------- */
  let toastTimeout = null;
  function showToast(message, type) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("is-error", "is-success");
    if (type) toast.classList.add(type === "error" ? "is-error" : "is-success");
    toast.hidden = false;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.hidden = true;
    }, 2800);
  }

  /* ---------------------------------------------------------
     DADOS — ecrã com resumo, exportar, importar, apagar tudo
     --------------------------------------------------------- */
  const DATA_VERSION = 1;

  function renderDataScreen() {
    const summary = document.getElementById("data-summary");
    summary.innerHTML = `
      <div class="stat-box"><strong>${DATA.players.length}</strong><span>${t("js.statsSaved")}</span></div>
      <div class="stat-box"><strong>${DATA.games.length}</strong><span>${t("js.gamesInHistory")}</span></div>
    `;
  }

  function exportData() {
    const exportPayload = {
      appName: "placar-pingpong",
      dataVersion: DATA_VERSION,
      exportedAt: new Date().toISOString(),
      players: DATA.players,
      games: DATA.games,
      nextPlayerId: DATA.nextPlayerId,
      nextGameId: DATA.nextGameId
    };

    const json = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `placar-pingpong-backup-${stamp}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(t("js.exportedToast").replace("%f", filename), "success");
  }
  document.getElementById("btn-export").addEventListener("click", exportData);

  /* ---------- importar ---------- */
  let pendingImport = null;

  document.getElementById("btn-import").addEventListener("click", () => {
    document.getElementById("input-import-file").click();
  });

  document.getElementById("input-import-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // permite escolher o mesmo ficheiro outra vez depois
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const validation = validateImportPayload(parsed);
        if (!validation.ok) {
          showToast(validation.message, "error");
          return;
        }
        pendingImport = parsed;
        const preview = previewMerge(parsed);
        const detail = document.getElementById("confirm-import-detail");
        detail.innerHTML =
          t("js.importDetailFile").replace("%p", parsed.players.length).replace("%g", parsed.games.length) + "<br><br>" +
          t("js.importDetailMerge").replace("%np", preview.newPlayers).replace("%ng", preview.newGames) + "<br><br>" +
          t("js.importDetailReplace").replace("%p", DATA.players.length).replace("%g", DATA.games.length);
        document.getElementById("overlay-confirm-import").hidden = false;
      } catch (err) {
        showToast(t("js.invalidFile"), "error");
      }
    };
    reader.onerror = () => showToast(t("js.cantReadFile"), "error");
    reader.readAsText(file);
  });

  function validateImportPayload(parsed) {
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, message: t("js.invalidFormat") };
    }
    if (!Array.isArray(parsed.players) || !Array.isArray(parsed.games)) {
      return { ok: false, message: t("js.invalidBackup") };
    }
    return { ok: true };
  }

  function normalizeName(name) {
    return (name || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  // calcula quantos jogadores/jogos novos um merge traria, sem alterar DATA (usado só para mostrar no resumo)
  function previewMerge(imported) {
    const existingNames = new Set(DATA.players.map((p) => normalizeName(p.name)));
    const newPlayers = imported.players.filter((p) => !existingNames.has(normalizeName(p.name))).length;

    const existingSignatures = new Set(DATA.games.map(gameSignature));
    const idMap = buildPlayerIdMap(imported.players);
    const newGames = imported.games.filter((g) => {
      const remapped = remapGamePlayerIds(g, idMap);
      return !existingSignatures.has(gameSignature(remapped));
    }).length;

    return { newPlayers, newGames };
  }

  // assinatura simples de um jogo, usada para detetar duplicados ao fundir históricos
  function gameSignature(g) {
    return [g.endedAt, g.blue.playerId, g.white.playerId, g.blue.setsWon, g.white.setsWon].join("|");
  }

  // mapeia ids de jogadores do ficheiro importado para ids já existentes no tablet
  // (quando o nome coincide) ou mantém o id do ficheiro para jogadores novos
  function buildPlayerIdMap(importedPlayers) {
    const byName = {};
    DATA.players.forEach((p) => { byName[normalizeName(p.name)] = p.id; });
    const map = {};
    importedPlayers.forEach((p) => {
      const existingId = byName[normalizeName(p.name)];
      map[p.id] = existingId || p.id;
    });
    return map;
  }

  function remapGamePlayerIds(g, idMap) {
    return {
      ...g,
      blue: { ...g.blue, playerId: idMap[g.blue.playerId] || g.blue.playerId },
      white: { ...g.white, playerId: idMap[g.white.playerId] || g.white.playerId }
    };
  }

  // recalcula a flag "capote" de cada set de um jogo a partir do resultado final
  // guardado, usando exatamente a mesma regra do jogo ao vivo. Isto garante que
  // jogos vindos de cópias de segurança antigas (de antes desta regra existir,
  // ou da regra ter sido corrigida) ficam com a tag certa depois de importados.
  function recomputeCapoteForSet(set, pointsTarget) {
    if (pointsTarget !== 21) return { ...set, capote: false };
    const blue = set.blueScore;
    const white = set.whiteScore;
    let capote = false;
    if (set.winnerSide === "blue") {
      capote = (blue >= 11 && white === 0) || white <= 10;
    } else if (set.winnerSide === "white") {
      capote = (white >= 11 && blue === 0) || blue <= 10;
    }
    return { ...set, capote };
  }

  function recomputeGameCapotes(game) {
    return {
      ...game,
      sets: game.sets.map((s) => recomputeCapoteForSet(s, game.pointsTarget))
    };
  }

  function mergeImportedData(imported) {
    const idMap = buildPlayerIdMap(imported.players);
    const existingNames = new Set(DATA.players.map((p) => normalizeName(p.name)));

    let addedPlayers = 0;
    imported.players.forEach((p) => {
      if (!existingNames.has(normalizeName(p.name))) {
        DATA.players.push({ ...p, id: idMap[p.id] });
        existingNames.add(normalizeName(p.name));
        addedPlayers++;
      }
      // se já existe (mesmo nome), mantemos o jogador atual tal como está
      // (incluindo a cor que já tinhas escolhido) e não sobrescrevemos nada.
    });

    const existingSignatures = new Set(DATA.games.map(gameSignature));
    let addedGames = 0;
    imported.games.forEach((g) => {
      const remapped = recomputeGameCapotes(remapGamePlayerIds(g, idMap));
      const sig = gameSignature(remapped);
      if (!existingSignatures.has(sig)) {
        DATA.games.push(remapped);
        existingSignatures.add(sig);
        addedGames++;
      }
    });

    return { addedPlayers, addedGames };
  }

  document.getElementById("btn-cancel-import").addEventListener("click", () => {
    pendingImport = null;
    document.getElementById("overlay-confirm-import").hidden = true;
  });

  document.getElementById("btn-merge-import").addEventListener("click", () => {
    if (!pendingImport) return;
    const { addedPlayers, addedGames } = mergeImportedData(pendingImport);
    saveData();
    pendingImport = null;
    document.getElementById("overlay-confirm-import").hidden = true;
    renderDataScreen();
    checkResumeBanner();
    showToast(t("js.importedToast").replace("%p", addedPlayers).replace("%g", addedGames), "success");
  });

  document.getElementById("btn-confirm-import").addEventListener("click", () => {
    if (!pendingImport) return;
    DATA.players = pendingImport.players;
    DATA.games = pendingImport.games.map(recomputeGameCapotes);
    DATA.nextPlayerId = pendingImport.nextPlayerId || DATA.nextPlayerId;
    DATA.nextGameId = pendingImport.nextGameId || DATA.nextGameId;
    DATA.activeGame = null; // não importamos jogos em curso, para evitar estados inconsistentes
    saveData();
    pendingImport = null;
    document.getElementById("overlay-confirm-import").hidden = true;
    renderDataScreen();
    checkResumeBanner();
    showToast(t("js.replacedToast"), "success");
  });

  /* ---------- apagar tudo ---------- */
  document.getElementById("btn-wipe").addEventListener("click", () => {
    document.getElementById("overlay-confirm-wipe").hidden = false;
  });
  document.getElementById("btn-cancel-wipe").addEventListener("click", () => {
    document.getElementById("overlay-confirm-wipe").hidden = true;
  });
  document.getElementById("btn-confirm-wipe").addEventListener("click", () => {
    DATA = defaultData();
    saveData();
    document.getElementById("overlay-confirm-wipe").hidden = true;
    renderDataScreen();
    checkResumeBanner();
    showToast(t("js.wipedToast"), "success");
  });

  /* ---------------------------------------------------------
     AVISO DE ROTAÇÃO — mostra "roda o tablet" só quando o
     ecrã de jogo está ativo e o dispositivo está em portrait.
     --------------------------------------------------------- */
  function isPortrait() {
    return window.innerHeight > window.innerWidth;
  }
  function updateRotateHint() {
    const hint = document.getElementById("rotate-hint");
    const gameActive = document.getElementById("screen-game").classList.contains("active");
    hint.hidden = !(gameActive && isPortrait());
  }
  window.addEventListener("resize", updateRotateHint);
  window.addEventListener("orientationchange", updateRotateHint);

  /* ---------------------------------------------------------
     INICIALIZAÇÃO
     --------------------------------------------------------- */
  function init() {
    _initAchievementToastListener();
    applyTranslations();
    checkAchievementsRetroactive();
    checkResumeBanner();
    showScreen("screen-menu");

    // restaurar timer se houver jogo ativo guardado e a app reabrir nele
    if (DATA.activeGame) {
      game = DATA.activeGame;
    }

    // registar service worker para funcionamento offline (PWA)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {
        /* falha silenciosa: app continua a funcionar sem cache offline */
      });
    }

    // tentar fixar a orientação horizontal quando possível (Android/Chrome)
    document.addEventListener("fullscreenchange", tryLockOrientation);
    updateRotateHint();
  }

  function tryLockOrientation() {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch(() => {});
    }
  }

  // (entrada em fullscreen/orientação tratada em openBolarScreen, antes do placar)
  document.getElementById("btn-resume").addEventListener("click", () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(tryLockOrientation).catch(() => {});
    } else {
      tryLockOrientation();
    }
  });


  /* ═══ TORNEIO ═══ */
  let tournamentSetup = { size: 4, mode: "custom", points: 21, format: "3", players: new Set() };
  function openTournamentSetup() {
    if (DATA.activeTournament && DATA.activeTournament.status !== "done") { renderTournamentBracket(); showScreen("screen-tournament-bracket"); return; }
    tournamentSetup = { size: 4, mode: "custom", points: 21, format: "3", players: new Set() };
    renderTournamentPlayerList(); updateTournamentSetupUI(); showScreen("screen-tournament-setup");
  }
  function updateTournamentSetupUI() {
    const { size, mode } = tournamentSetup;
    document.querySelectorAll("#opt-tournament-size .setup-option").forEach(b => b.classList.toggle("active", Number(b.dataset.size) === size));
    document.querySelectorAll("#opt-tournament-mode .setup-option").forEach(b => b.classList.toggle("active", b.dataset.tmode === mode));
    document.querySelectorAll("#opt-tournament-points .setup-option").forEach(b => b.classList.toggle("active", Number(b.dataset.tpoints) === tournamentSetup.points));
    document.querySelectorAll("#opt-tournament-format .setup-option").forEach(b => b.classList.toggle("active", b.dataset.tformat === tournamentSetup.format));
    document.getElementById("opt-tournament-points-wrap").hidden = mode === "classic";
    document.getElementById("opt-tformat-7").hidden = mode !== "classic";
    if (mode === "classic") { tournamentSetup.points = 11; if (tournamentSetup.format === "free") tournamentSetup.format = "3"; }
    const sel = tournamentSetup.players.size;
    document.getElementById("tournament-player-count").textContent = sel + " / " + size;
    document.getElementById("btn-start-tournament").disabled = sel !== size;
  }
  function renderTournamentPlayerList() {
    const list = document.getElementById("tournament-player-list"); list.innerHTML = "";
    const allElos = computeAllElos();
    DATA.players.slice().sort((a,b) => (allElos[b.id]||1000)-(allElos[a.id]||1000)).forEach((p,i) => {
      const row = document.createElement("button");
      row.className = "tournament-player-row" + (tournamentSetup.players.has(p.id) ? " is-selected" : "");
      row.innerHTML = `<div class="player-avatar">${playerInitials(p.name)}</div><span class="tournament-player-name">${escapeHTML(p.name)}</span><span class="tournament-player-seed">#${i+1}</span><span class="tournament-check">${tournamentSetup.players.has(p.id)?"✓":""}</span>`;
      row.addEventListener("click", () => {
        if (tournamentSetup.players.has(p.id)) { tournamentSetup.players.delete(p.id); row.classList.remove("is-selected"); }
        else { if (tournamentSetup.players.size >= tournamentSetup.size) return; tournamentSetup.players.add(p.id); row.classList.add("is-selected"); }
        row.querySelector(".tournament-check").textContent = tournamentSetup.players.has(p.id) ? "✓" : "";
        updateTournamentSetupUI();
      });
      list.appendChild(row);
    });
    if (!DATA.players.length) list.innerHTML = `<div class="empty-state"><p>${t("js.createPlayersFirst")}</p></div>`;
  }
  document.querySelectorAll("#opt-tournament-size .setup-option").forEach(b => b.addEventListener("click", () => { tournamentSetup.size=Number(b.dataset.size); tournamentSetup.players.clear(); renderTournamentPlayerList(); updateTournamentSetupUI(); }));
  document.querySelectorAll("#opt-tournament-mode .setup-option").forEach(b => b.addEventListener("click", () => { tournamentSetup.mode=b.dataset.tmode; updateTournamentSetupUI(); }));
  document.querySelectorAll("#opt-tournament-points .setup-option").forEach(b => b.addEventListener("click", () => { tournamentSetup.points=Number(b.dataset.tpoints); updateTournamentSetupUI(); }));
  document.querySelectorAll("#opt-tournament-format .setup-option").forEach(b => b.addEventListener("click", () => { tournamentSetup.format=b.dataset.tformat; updateTournamentSetupUI(); }));
  document.getElementById("btn-start-tournament").addEventListener("click", createTournament);
  function createTournament() {
    const allElos = computeAllElos();
    const seeded = [...tournamentSetup.players].sort((a,b) => (allElos[b]||1000)-(allElos[a]||1000));
    const n = seeded.length; const pairs = []; let lo=0,hi=n-1;
    while (lo<hi) pairs.push([seeded[lo++],seeded[hi--]]);
    const firstRound = pairs.map(([p1,p2]) => ({player1Id:p1,player2Id:p2,winnerId:null,gameId:null}));
    const bracket = [firstRound]; let prev = firstRound.length;
    while (prev>1) { const next=Math.ceil(prev/2); bracket.push(Array.from({length:next},()=>({player1Id:null,player2Id:null,winnerId:null,gameId:null}))); prev=next; }
    DATA.activeTournament = {id:uid("tournament"),seeded,bracket,mode:tournamentSetup.mode,points:tournamentSetup.points,format:tournamentSetup.format,status:"ongoing",winner:null,startedAt:new Date().toISOString()};
    saveData(); renderTournamentBracket(); showScreen("screen-tournament-bracket"); checkResumeBanner();
  }
  function tournamentRoundLabel(ri,total) { const f=total-1-ri; if(f===0) return t("js.roundF"); if(f===1) return t("js.roundSF"); if(f===2) return t("js.roundQF"); return t("js.roundLabel").replace("%n",ri+1); }
  function renderTournamentBracket() {
    const tournament = DATA.activeTournament; if (!tournament) return;
    const total = tournament.bracket.length;
    const content = document.getElementById("tournament-bracket-content"); content.innerHTML="";
    const scroll = document.createElement("div"); scroll.className="bracket-scroll";
    const bracket = document.createElement("div"); bracket.className="bracket";
    tournament.bracket.forEach((round,ri) => {
      const col = document.createElement("div"); col.className="bracket-round";
      const lbl = document.createElement("div"); lbl.className="bracket-round-label"; lbl.textContent=tournamentRoundLabel(ri,total); col.appendChild(lbl);
      round.forEach((match,mi) => {
        const p1=match.player1Id?getPlayer(match.player1Id):null, p2=match.player2Id?getPlayer(match.player2Id):null;
        const isDone=!!match.winnerId, isNext=!isDone&&p1&&p2&&!DATA.activeGame;
        const mel=document.createElement("div"); mel.className="bracket-match"+(isDone?" is-done":"")+(isNext?" is-next":"");
        const s1=p1?tournament.seeded.indexOf(match.player1Id)+1:null, s2=p2?tournament.seeded.indexOf(match.player2Id)+1:null;
        const p1w=match.winnerId===match.player1Id, p2w=match.winnerId===match.player2Id;
        mel.innerHTML=`<div class="bracket-player ${p1w?"is-winner":isDone?"is-loser":""}"><span class="bracket-player-seed">${s1?"#"+s1:""}</span><span class="bracket-player-name">${p1?escapeHTML(p1.name):'<span class="bracket-tbd">'+t("js.tbd")+'</span>'}</span></div><div class="bracket-player ${p2w?"is-winner":isDone?"is-loser":""}"><span class="bracket-player-seed">${s2?"#"+s2:""}</span><span class="bracket-player-name">${p2?escapeHTML(p2.name):'<span class="bracket-tbd">'+t("js.tbd")+'</span>'}</span></div>${isNext?`<button class="bracket-play-btn" data-r="${ri}" data-m="${mi}">▶ ${t("js.play")}</button>`:""}`;
        if (isNext) mel.querySelector(".bracket-play-btn").addEventListener("click",()=>startTournamentMatch(ri,mi));
        col.appendChild(mel);
      });
      bracket.appendChild(col);
      if (ri<total-1) { const conn=document.createElement("div"); conn.className="bracket-connector"; round.forEach(()=>{const l=document.createElement("div");l.className="bracket-connector-line";conn.appendChild(l);}); bracket.appendChild(conn); }
    });
    scroll.appendChild(bracket); content.appendChild(scroll);
  }
  function startTournamentMatch(ri,mi) {
    const tournament=DATA.activeTournament; const match=tournament.bracket[ri][mi];
    tournament._pendingRound=ri; tournament._pendingMatch=mi; saveData();
    startNewGame(match.player1Id,match.player2Id,tournament.points,tournament.format,"",tournament.mode);
    game.tournamentId=tournament.id; persistActiveGame(); openBolarScreen();
  }
  function onTournamentGameFinished(record) {
    const tournament=DATA.activeTournament; if(!tournament||tournament.status==="done") return;
    if(!record.tournamentId||record.tournamentId!==tournament.id) return;
    const ri=tournament._pendingRound,mi=tournament._pendingMatch; if(ri==null) return;
    const match=tournament.bracket[ri][mi];
    match.winnerId=record.winnerSide==="blue"?record.blue.playerId:record.white.playerId; match.gameId=record.id;
    delete tournament._pendingRound; delete tournament._pendingMatch;
    const nr=ri+1;
    if(nr<tournament.bracket.length){const nmi=Math.floor(mi/2),slot=mi%2===0?"player1Id":"player2Id";tournament.bracket[nr][nmi][slot]=match.winnerId;}
    const last=tournament.bracket[tournament.bracket.length-1];
    if(last.length===1&&last[0].winnerId){
      tournament.winner=last[0].winnerId; tournament.status="done"; tournament.endedAt=new Date().toISOString();
      if(!DATA.tournamentHistory)DATA.tournamentHistory=[];
      DATA.tournamentHistory.push({id:tournament.id,winner:tournament.winner,seeded:tournament.seeded,startedAt:tournament.startedAt,endedAt:tournament.endedAt});
      saveData();
      tournament.seeded.forEach(pid=>checkAchievements("tournament",pid));
      document.getElementById("tournament-winner-name").textContent=getPlayer(tournament.winner)?.name||"—";
      document.getElementById("tournament-winner-sub").textContent=t("js.tournamentWinnerSub").replace("%m",tournament.seeded.length-1).replace("%p",tournament.seeded.length);
      showScreen("screen-tournament-winner"); checkResumeBanner();
    } else { saveData(); renderTournamentBracket(); showScreen("screen-tournament-bracket"); }
  }
  function computePlayerTournamentStats(playerId) {
    const h=DATA.tournamentHistory||[];
    return{total:h.filter(tr=>tr.seeded&&tr.seeded.includes(playerId)).length,won:h.filter(tr=>tr.winner===playerId).length};
  }
  document.getElementById("btn-tournament-done").addEventListener("click",()=>{DATA.activeTournament=null;saveData();checkResumeBanner();showScreen("screen-menu");});
  document.getElementById("btn-tournament-back").addEventListener("click",()=>showScreen("screen-menu"));
  document.getElementById("btn-tournament-abandon").addEventListener("click",()=>{if(confirm(t("js.confirmAbandon"))){DATA.activeTournament=null;saveData();checkResumeBanner();showScreen("screen-menu");}});

  /* ═══ MODO TREINO ═══ */
  let trainingState={running:false,paused:false,isTimed:false,targetMs:0,elapsedMs:0,startTs:null,rafId:null,muted:false,halfSounded:false,last10Sounded:false,_pausedOffset:0};
  let trainingMusicInterval=null, trainingMinutes=15;
  function openTrainingMode(){document.getElementById("training-pick").style.display="flex";document.getElementById("training-inner").classList.remove("is-running");document.getElementById("training-time-input").hidden=true;showScreen("screen-training");}
  function playTrainingSound(type){
    if(type==="start"){playTone(880,120,0.5,"sine");setTimeout(()=>playTone(1108,160,0.5,"sine"),130);}
    else if(type==="half"){playTone(660,100,0.5,"triangle");setTimeout(()=>playTone(660,100,0.5,"triangle"),150);}
    else if(type==="last10"){for(let i=0;i<4;i++)setTimeout(()=>playTone(880,80,0.55,"square"),i*220);}
    else if(type==="end"){[0,150,300,500].forEach((t,i)=>setTimeout(()=>playTone(440*(i+1)*0.6,200,0.55,"square"),t));}
  }
  function startTrainingMusic(){
    stopTrainingMusic();
    const notes=[261.63,329.63,392,329.63,261.63,392,329.63,261.63]; let beat=0;
    trainingMusicInterval=setInterval(()=>{
      if(!trainingState.running||trainingState.paused||trainingState.muted)return;
      const ctx=getAudioCtx(); if(!ctx)return;
      const osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type="sine";osc.frequency.value=notes[beat%notes.length];g.gain.value=0;osc.connect(g);g.connect(ctx._compressor||ctx.destination);
      const now=ctx.currentTime;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(0.06,now+0.04);g.gain.linearRampToValueAtTime(0,now+0.38);
      osc.start(now);osc.stop(now+0.5);beat++;
    },833);
  }
  function stopTrainingMusic(){if(trainingMusicInterval){clearInterval(trainingMusicInterval);trainingMusicInterval=null;}}
  function startTrainingTimer(isTimed,mins){
    document.getElementById("training-pick").style.display="none";
    const inner=document.getElementById("training-inner");
    inner.classList.add("is-running"); inner.className="training-inner is-running phase-0";
    document.getElementById("training-mode-label").textContent=isTimed?t("js.trainingModeTimed").replace("%n",mins):t("js.trainingModeFree");
    document.getElementById("btn-training-pause").textContent="❙❙";
    trainingState={running:true,paused:false,isTimed,targetMs:mins*60000,elapsedMs:0,startTs:performance.now(),rafId:null,muted:false,halfSounded:false,last10Sounded:false,_pausedOffset:0};
    playTrainingSound("start"); startTrainingMusic(); trainingTick();
  }
  function trainingTick(){
    if(!trainingState.running)return;
    if(!trainingState.paused)trainingState.elapsedMs=performance.now()-trainingState.startTs+trainingState._pausedOffset;
    const ms=trainingState.isTimed?Math.max(0,trainingState.targetMs-trainingState.elapsedMs):trainingState.elapsedMs;
    const ts=Math.floor(ms/1000);
    document.getElementById("training-h").textContent=String(Math.floor(ts/3600)).padStart(2,"0");
    document.getElementById("training-m").textContent=String(Math.floor((ts%3600)/60)).padStart(2,"0");
    document.getElementById("training-s").textContent=String(ts%60).padStart(2,"0");
    document.getElementById("training-ms").textContent="."+String(Math.floor((ms%1000)/10)).padStart(2,"0");
    if(trainingState.isTimed){
      const ratio=trainingState.elapsedMs/trainingState.targetMs;
      const phase=Math.min(4,Math.floor(ratio*5));
      const inner=document.getElementById("training-inner");
      ["phase-0","phase-1","phase-2","phase-3","phase-4"].forEach((c,i)=>inner.classList.toggle(c,i===phase));
      if(ratio>=0.5&&!trainingState.halfSounded){playTrainingSound("half");trainingState.halfSounded=true;}
      if(ms<=10000&&ms>0&&!trainingState.last10Sounded){playTrainingSound("last10");trainingState.last10Sounded=true;}
      if(ms<=0){playTrainingSound("end");stopTraining();return;}
    }
    trainingState.rafId=requestAnimationFrame(trainingTick);
  }
  function stopTraining(){
    trainingState.running=false;
    if(trainingState.rafId)cancelAnimationFrame(trainingState.rafId);
    stopTrainingMusic();
    const elapsedMin=trainingState.elapsedMs/60000;
    if(elapsedMin>=0.5){
      if(!DATA.trainingStats["global"])DATA.trainingStats["global"]={totalMinutes:0,sessions:0};
      DATA.trainingStats["global"].totalMinutes+=elapsedMin;
      DATA.trainingStats["global"].sessions+=1;
      saveData();
      checkAchievements("training",null);
    }
    openTrainingMode();
  }
  document.getElementById("btn-training-free").addEventListener("click",()=>startTrainingTimer(false,0));
  document.getElementById("btn-training-timed").addEventListener("click",()=>{document.getElementById("training-time-input").hidden=false;});
  document.getElementById("btn-time-minus").addEventListener("click",()=>{trainingMinutes=Math.max(1,trainingMinutes-1);document.getElementById("training-time-val").textContent=trainingMinutes;});
  document.getElementById("btn-time-plus").addEventListener("click",()=>{trainingMinutes=Math.min(120,trainingMinutes+1);document.getElementById("training-time-val").textContent=trainingMinutes;});
  document.getElementById("btn-training-start-timed").addEventListener("click",()=>startTrainingTimer(true,trainingMinutes));
  document.getElementById("btn-training-pause").addEventListener("click",()=>{
    if(!trainingState.running)return;
    if(trainingState.paused){trainingState._pausedOffset=trainingState.elapsedMs;trainingState.startTs=performance.now();trainingState.paused=false;trainingState.rafId=requestAnimationFrame(trainingTick);document.getElementById("btn-training-pause").textContent="❙❙";}
    else{trainingState.paused=true;if(trainingState.rafId)cancelAnimationFrame(trainingState.rafId);document.getElementById("btn-training-pause").textContent="▶";}
  });
  document.getElementById("btn-training-stop").addEventListener("click",stopTraining);
  document.getElementById("btn-training-close").addEventListener("click",()=>{stopTraining();showScreen("screen-menu");});
  document.getElementById("btn-training-pick-back").addEventListener("click",()=>showScreen("screen-menu"));
  document.getElementById("btn-training-mute").addEventListener("click",()=>{trainingState.muted=!trainingState.muted;document.getElementById("btn-training-mute").classList.toggle("is-muted",trainingState.muted);});

  /* ═══ MINI JOGOS ═══ */
  let currentMiniGamePlayer=null;
  function openMinigames(){renderMinigamePlayerPick();showScreen("screen-minigames");}
  function renderMinigamePlayerPick(){
    const grid=document.getElementById("minigame-player-pick");grid.innerHTML="";
    DATA.players.forEach(p=>{
      const card=document.createElement("button");
      card.className="player-card player-card--grid"+(currentMiniGamePlayer===p.id?" is-selected":"");
      if(currentMiniGamePlayer===p.id)card.style.border="2px solid var(--yellow)";
      card.innerHTML=`<div class="player-avatar">${playerInitials(p.name)}</div><div class="player-info"><strong>${escapeHTML(p.name)}</strong></div>`;
      card.addEventListener("click",()=>{
        currentMiniGamePlayer=p.id;
        grid.querySelectorAll(".player-card").forEach(c=>{c.classList.remove("is-selected");c.style.border="";});
        card.classList.add("is-selected");card.style.border="2px solid var(--yellow)";
      });
      grid.appendChild(card);
    });
  }
  function getMgRec(key,pid){return parseInt(localStorage.getItem("mg_"+key+"_"+(pid||"g"))||"0");}
  function setMgRec(key,pid,val){localStorage.setItem("mg_"+key+"_"+(pid||"g"),val);}

  /* Toques Rápidos */
  let tapGame={level:1,score:0};
  document.getElementById("btn-minigame-tap").addEventListener("click",()=>{if(!currentMiniGamePlayer){showToast(t("js.choosePlayerFirst"),"error");return;}resetTapGame();showScreen("screen-mg-tap");});
  function resetTapGame(){
    tapGame={level:1,score:0};
    document.getElementById("mg-tap-score").textContent="0";
    document.getElementById("mg-tap-record").textContent=getMgRec("tap",currentMiniGamePlayer)||"—";
    document.getElementById("mg-tap-level").textContent="1";
    document.getElementById("mg-tap-start").hidden=false;
    document.getElementById("mg-tap-gameover").hidden=true;
    document.getElementById("mg-tap-arena").querySelectorAll(".mg-dot").forEach(d=>d.remove());
  }
  document.getElementById("btn-mg-tap-start").addEventListener("click",()=>{
    document.getElementById("mg-tap-start").hidden=true;
    let n=3;const cd=document.getElementById("mg-tap-countdown");cd.hidden=false;cd.textContent=n;
    const id=setInterval(()=>{n--;if(n===0){clearInterval(id);cd.hidden=true;spawnDot();}else cd.textContent=n;},800);
  });
  document.getElementById("btn-mg-tap-retry").addEventListener("click",resetTapGame);
  document.getElementById("btn-mg-tap-back").addEventListener("click",()=>{document.getElementById("mg-tap-arena").querySelectorAll(".mg-dot").forEach(d=>d.remove());showScreen("screen-minigames");});
  function spawnDot(){
    const arena=document.getElementById("mg-tap-arena");
    const W=arena.clientWidth,H=arena.clientHeight,size=Math.max(44,70-tapGame.level*2);
    const dot=document.createElement("div");dot.className="mg-dot";
    dot.style.cssText=`width:${size}px;height:${size}px;left:${Math.random()*(W-size)}px;top:${Math.random()*(H-size)}px`;
    dot.textContent="●";let hit=false;
    const lifeMs=Math.max(600,2000-tapGame.level*100);
    const timer=setTimeout(()=>{if(!hit){hit=true;dot.remove();endTapGame();}},lifeMs);
    dot.addEventListener("click",()=>{if(hit)return;hit=true;clearTimeout(timer);dot.remove();tapGame.score++;if(tapGame.score%5===0)tapGame.level++;document.getElementById("mg-tap-score").textContent=tapGame.score;playTone(1200,60,0.4,"sine");spawnDot();});
    arena.appendChild(dot);
  }
  function endTapGame(){
    document.getElementById("mg-tap-arena").querySelectorAll(".mg-dot").forEach(d=>d.remove());
    const rec=getMgRec("tap",currentMiniGamePlayer),isNew=tapGame.score>rec;
    if(isNew)setMgRec("tap",currentMiniGamePlayer,tapGame.score);
    document.getElementById("mg-tap-final-score").textContent=tapGame.score;
    document.getElementById("mg-tap-final-level").textContent=tapGame.level;
    document.getElementById("mg-tap-new-record").hidden=!isNew;
    document.getElementById("mg-tap-record").textContent=isNew?tapGame.score:rec;
    document.getElementById("mg-tap-gameover").hidden=false;
    playTone(300,200,0.5,"square");
  }

  /* Memória Visual */
  let memGame={level:1,seq:[],playerSeq:[],showing:false,gridSize:3};
  document.getElementById("btn-minigame-memory").addEventListener("click",()=>{if(!currentMiniGamePlayer){showToast(t("js.choosePlayerFirst"),"error");return;}resetMemGame();showScreen("screen-mg-memory");});
  function resetMemGame(){
    memGame={level:1,seq:[],playerSeq:[],showing:false,gridSize:3};
    document.getElementById("mg-memory-level").textContent="1";
    document.getElementById("mg-memory-record").textContent=getMgRec("memory",currentMiniGamePlayer)||"—";
    document.getElementById("mg-memory-start-level").textContent="1";
    document.getElementById("mg-memory-gameover").hidden=true;
    document.getElementById("mg-memory-start").hidden=false;
    document.getElementById("mg-memory-msg").textContent="";
    buildMemGrid(3);
  }
  function buildMemGrid(size){
    const g=document.getElementById("mg-memory-grid");
    g.style.gridTemplateColumns=`repeat(${size},1fr)`;
    const dim=Math.min(300,size*76)+"px";g.style.width=g.style.height=dim;g.innerHTML="";
    for(let i=0;i<size*size;i++){const c=document.createElement("div");c.className="mg-memory-cell";c.dataset.idx=i;c.addEventListener("click",()=>onMemClick(i));g.appendChild(c);}
  }
  document.getElementById("btn-mg-memory-start").addEventListener("click",()=>{document.getElementById("mg-memory-start").hidden=true;nextMemLevel();});
  document.getElementById("btn-mg-memory-retry").addEventListener("click",resetMemGame);
  document.getElementById("btn-mg-memory-back").addEventListener("click",()=>showScreen("screen-minigames"));
  function nextMemLevel(){
    const ns=Math.min(5,3+Math.floor((memGame.level-1)/3));
    if(ns!==memGame.gridSize){memGame.gridSize=ns;buildMemGrid(ns);}
    const len=2+memGame.level;
    memGame.seq=Array.from({length:len},()=>Math.floor(Math.random()*memGame.gridSize*memGame.gridSize));
    memGame.playerSeq=[];memGame.showing=true;
    document.getElementById("mg-memory-msg").textContent=t("js.mgMemorize");
    document.getElementById("mg-memory-level").textContent=memGame.level;
    const cells=document.querySelectorAll(".mg-memory-cell");
    cells.forEach(c=>c.classList.remove("is-lit","is-correct","is-wrong"));
    let i=0;
    const show=()=>{
      if(i>0)cells[memGame.seq[i-1]]?.classList.remove("is-lit");
      if(i>=memGame.seq.length){memGame.showing=false;document.getElementById("mg-memory-msg").textContent=t("js.mgYourTurn");return;}
      cells[memGame.seq[i]]?.classList.add("is-lit");playTone(440+memGame.seq[i]*28,200,0.3,"sine");i++;setTimeout(show,600);
    };
    setTimeout(show,400);
  }
  function onMemClick(idx){
    if(memGame.showing)return;
    const cells=document.querySelectorAll(".mg-memory-cell");
    if(idx===memGame.seq[memGame.playerSeq.length]){
      cells[idx].classList.add("is-correct");playTone(660,80,0.35,"sine");memGame.playerSeq.push(idx);
      if(memGame.playerSeq.length===memGame.seq.length)setTimeout(()=>{memGame.level++;nextMemLevel();},600);
    }else{cells[idx].classList.add("is-wrong");playTone(200,300,0.45,"square");setTimeout(endMemGame,600);}
  }
  function endMemGame(){
    const rec=getMgRec("memory",currentMiniGamePlayer),isNew=memGame.level>rec;
    if(isNew)setMgRec("memory",currentMiniGamePlayer,memGame.level);
    document.getElementById("mg-memory-final-level").textContent=memGame.level;
    document.getElementById("mg-memory-new-record").hidden=!isNew;
    document.getElementById("mg-memory-record").textContent=isNew?memGame.level:rec;
    document.getElementById("mg-memory-gameover").hidden=false;
  }


  /* ═══ QUIZ DE REGRAS ITTF ═══ */

  const ITTF_QUIZ = {
    easy: [
      {q:"Quantos pontos são necessários para ganhar um set no ténis de mesa (modo standard)?",a:0,opts:["11","21","15","9"],exp:"Na ITTF, um set é ganho ao atingir 11 pontos, com uma vantagem mínima de 2 pontos."},
      {q:"De quantos em quantos pontos se troca o serviço durante um jogo?",a:0,opts:["2","5","3","1"],exp:"O serviço muda a cada 2 pontos, exceto em caso de deuce (10-10)."},
      {q:"O que é o 'deuce' no ténis de mesa?",a:2,opts:["Vitória por 11-0","Falta de serviço","Empate a 10 pontos que exige vantagem de 2","Ponto disputado"],exp:"Deuce ocorre quando o marcador fica 10-10. A partir daí, o serviço muda a cada ponto e é necessária uma vantagem de 2 pontos para ganhar o set."},
      {q:"Qual é o diâmetro oficial da bola de ténis de mesa (ITTF)?",a:1,opts:["36 mm","40 mm","38 mm","42 mm"],exp:"A bola oficial ITTF tem 40 mm de diâmetro (introduzido em 2000, substituindo 38 mm)."},
      {q:"Ao servir, o lançamento da bola deve ter pelo menos quantos centímetros de altura?",a:2,opts:["10 cm","15 cm","16 cm","20 cm"],exp:"A bola deve ser lançada quase verticalmente para cima, pelo menos 16 cm, a partir da palma da mão aberta."},
      {q:"Quando um set chega a 10-10, quantos pontos consecutivos são necessários para ganhar?",a:1,opts:["1","2","3","4"],exp:"Em deuce (10-10), é necessária uma vantagem de 2 pontos, ou seja, dois pontos consecutivos sobre o adversário."},
      {q:"A mesa de ténis de mesa tem que dimensões?",a:0,opts:["274 × 152,5 cm","260 × 140 cm","280 × 160 cm","250 × 130 cm"],exp:"A mesa oficial ITTF mede 274 cm de comprimento × 152,5 cm de largura, com altura de 76 cm."},
      {q:"A que altura fica o topo da rede oficial ITTF?",a:1,opts:["14,25 cm","15,25 cm","16,25 cm","13,25 cm"],exp:"A rede tem 15,25 cm de altura ao centro e ao longo de toda a sua extensão."},
      {q:"Quantos sets tem normalmente um jogo clássico ITTF (competição)?",a:2,opts:["3","5","7","9"],exp:"Na maioria das competições ITTF usa-se o formato melhor de 7 (4 sets ganhos para vencer). Para muitos eventos usa-se também melhor de 5 ou 3."},
      {q:"O que acontece se a bola toca a rede durante o serviço?",a:0,opts:["Recomeça-se (let)","Ponto para o adversário","Ponto para quem serve","Segunda oportunidade"],exp:"Se a bola toca a rede e cai na metade correta da mesa, é um 'let' e o serviço é repetido sem penalização."},
      {q:"Em que lado da mesa deve cair a bola no serviço (jogo de singulares)?",a:1,opts:["Só no lado esquerdo","Em qualquer ponto da metade do adversário","Só no lado direito","Na diagonal"],exp:"Em singulares, a bola deve apenas cair na metade da mesa do adversário, em qualquer ponto. Não há restrição diagonal (ao contrário dos pares)."},
      {q:"Qual a cor padrão da superfície da mesa ITTF?",a:0,opts:["Azul ou verde","Vermelho ou amarelo","Branco","Preto"],exp:"A superfície da mesa deve ser de cor uniforme, mate (não brilhante), tipicamente azul escuro ou verde."},
      {q:"O que é um 'expedite system' (sistema de aceleração)?",a:2,opts:["Forma de acelerar o serviço","Sistema de desempate por sorteio","Regra que limita um set a 10 minutos de duração","Sistema de pontuação dupla"],exp:"Após 10 minutos de jogo num set, entra em vigor o 'expedite system': o ponto é ganho pelo recetor se o servidor fizer 13 pancadas consecutivas sem ganhar o ponto."},
      {q:"Em pares, qual é a regra do serviço?",a:1,opts:["Qualquer jogador pode servir para qualquer lado","A bola deve ir em diagonal — metade direita para metade direita","A bola deve ir para a metade esquerda do adversário","Não há restrições em pares"],exp:"Em pares (duplas), o serviço deve ser feito em diagonal: da metade direita do servidor para a metade direita do recetor."},
      {q:"Um jogador pode apoiar a mão livre na mesa durante o jogo?",a:1,opts:["Sim, é permitido","Não, ponto para o adversário se tocar","Só no lado do próprio jogador","Apenas durante o serviço"],exp:"Se a mão livre (a que não segura a raquete) tocar a superfície de jogo durante um rally, o ponto é perdido pelo jogador infrator."},
    ],
    medium: [
      {q:"Após um 'let' no serviço, o que acontece ao par de pontos desse serviço?",a:0,opts:["O serviço é repetido, sem mudar a contagem","Perde-se um dos dois pontos desse par","O par de serviços reinicia","O adversário ganha o serviço"],exp:"Um 'let' anula o serviço. O servidor repete exatamente o mesmo serviço, sem alterar nenhum marcador ou par de pontos."},
      {q:"Quando começa exatamente o 'expedite system'?",a:1,opts:["Quando o marcador chega a 9-9","Após 10 minutos de jogo num set, se nenhum jogador ainda tiver 9 pontos","Sempre que um set dura mais de 8 minutos","Quando o atacante faz 10 pancadas seguidas"],exp:"O expedite system é introduzido após 10 minutos de jogo num set, desde que nenhum dos jogadores tenha chegado aos 9 pontos. A qualquer momento pode ser pedido por ambos os jogadores."},
      {q:"O que acontece se a bola toca a borda lateral da mesa?",a:1,opts:["É 'let'","Ponto para quem bateu na bola","Ponto para o adversário","Repetição do ponto"],exp:"A borda lateral (borda lateral da superfície de jogo) não é válida. Se a bola toca a borda lateral, é ponto para o adversário."},
      {q:"A bola pode tocar a borda superior da mesa (edge) e ser boa?",a:0,opts:["Sim, é ponto válido","Não, é falta","Apenas no serviço","Apenas se cair para dentro"],exp:"Se a bola toca a borda superior da mesa (edge — a superfície de jogo), é um ponto válido, pois faz parte da superfície de jogo."},
      {q:"Qual é o peso oficial de uma bola ITTF?",a:2,opts:["2,0 g","2,3 g","2,7 g","3,0 g"],exp:"A bola oficial ITTF pesa 2,7 gramas."},
      {q:"Durante o serviço, em que posição deve estar a palma da mão livre ao lançar a bola?",a:0,opts:["Aberta e plana, acima do nível da mesa","Fechada em punho","Apontada para o adversário","Abaixo do nível da mesa"],exp:"A bola deve estar na palma da mão aberta e imóvel, acima do nível da superfície de jogo, antes de ser lançada para o serviço."},
      {q:"O topo da rede pode ser tocado pela bola durante um rally (não no serviço)?",a:0,opts:["Sim, se cair do outro lado é ponto válido","Não, é sempre falta","Só se a bola não parar na rede","É sempre 'let'"],exp:"Durante o rally, se a bola toca o topo da rede e cai válida no outro lado, o ponto é válido (não é let — o let só existe no serviço)."},
      {q:"Se um jogador interrompe o jogo intencionalmente sem razão válida, o que acontece?",a:2,opts:["O set é anulado","O árbitro dá um aviso oral","O ponto em disputa é atribuído ao adversário","O jogador é desqualificado"],exp:"Interrupção deliberada do jogo é considerada 'má conduta'. O árbitro pode atribuir o ponto ao adversário como penalização."},
      {q:"Em singulares, o servidor tem de bater na bola do próprio lado antes de ir para o outro lado?",a:1,opts:["Sim, obrigatório","Não, a bola vai diretamente para o lado do adversário","Só no primeiro serviço de cada jogo","Depende do modo de jogo"],exp:"Em singulares, a bola vai diretamente da raquete para a metade do adversário, sem tocar no lado do servidor. É em pares que o serviço deve ser diagonal."},
      {q:"O que é um 'good return' (devolução válida)?",a:3,opts:["Bola que toca sempre a rede","Bola que bate na mesa do servidor","Bola que cai fora da mesa","Bola que passa a rede e cai dentro da mesa do adversário ou na borda"],exp:"Uma devolução válida é aquela em que a bola (após ser batida) passa sobre ou à volta da rede e cai na área de jogo do adversário ou na borda superior da mesa."},
      {q:"Pode um jogador bater na bola antes de ela tocar a sua metade da mesa (volley)?",a:1,opts:["Sim, se a bola estiver a sair da mesa","Não, ponto para o adversário","Só no último ponto do set","Apenas se a bola tocar a rede antes"],exp:"É proibido bater na bola antes de ela tocar a sua metade da mesa (volley). Se o fizer, perde o ponto, mesmo que a bola fosse para fora."},
      {q:"O que sucede se o servidor lança a bola e decide não a bater?",a:1,opts:["É automático 'let'","É falta e ponto para o adversário","Pode apanhar a bola e repetir","É aviso oral do árbitro"],exp:"Se o servidor lançar a bola para o serviço e não a bater, é falta — o ponto vai para o adversário."},
      {q:"Se a bola em jogo toca num objeto alheio (roupa do jogador, etc.), o que acontece?",a:0,opts:["Ponto para o adversário","É 'let'","O ponto é repetido","Depende do árbitro"],exp:"Se a bola em jogo tocar qualquer coisa que não seja a rede, os seus suportes ou a mesa, o ponto vai para o adversário."},
      {q:"Qual é a altura mínima do teto ou obstáculo acima da mesa em competições ITTF?",a:2,opts:["3 m","4 m","5 m","6 m"],exp:"A ITTF recomenda pelo menos 5 metros de espaço livre acima da mesa para competições internacionais."},
      {q:"Em pares, após cada set, como muda a ordem de serviço?",a:1,opts:["Mantém-se igual","O recetor do último serviço torna-se servidor","O parceiro do servidor torna-se o próximo servidor","Escolha livre dos jogadores"],exp:"Em pares, o par que recebeu no set anterior passará a servir, e o jogador que serviu por último passará a receber."},
    ],
    hard: [
      {q:"Segundo o regulamento ITTF, quais as cores obrigatórias dos revestimentos (borrachas) de uma raquete?",a:0,opts:["Um lado vermelho, outro lado preto","Qualquer cor, desde que diferentes","Azul e vermelho","Verde e preto"],exp:"O regulamento ITTF exige que os dois lados da raquete sejam obrigatoriamente um vermelho e um preto, para que o adversário possa distinguir os revestimentos."},
      {q:"Qual a espessura máxima do revestimento (borracha + esponja) numa raquete aprovada ITTF?",a:2,opts:["3 mm","3,5 mm","4 mm","5 mm"],exp:"A espessura total de cada lado do revestimento (borracha mais esponja, se existir) não pode exceder 4 mm."},
      {q:"O que significa 'ITTF approved' numa bola?",a:1,opts:["Bola fabricada em China","Bola testada e homologada pela ITTF para competições internacionais","Bola usada nos Jogos Olímpicos","Bola de 38 mm (formato antigo)"],exp:"'ITTF approved' significa que a bola foi testada e está na lista de produtos aprovados pela ITTF, cumprindo todos os critérios de tamanho, peso, redondeza e cor."},
      {q:"Segundo a ITTF, pode-se usar revestimentos anti-spin (lisos) na raquete?",a:0,opts:["Sim, desde que sejam aprovados pela ITTF","Não, são proibidos em todas as competições","Só em competições nacionais","Apenas num dos lados"],exp:"Revestimentos anti-spin (pimple-out ou lisos) são permitidos desde que estejam na lista aprovada pela ITTF. A lista de borrachas homologadas é publicada e atualizada regularmente."},
      {q:"Num torneio ITTF, se um jogador parte a raquete durante o jogo, o que pode fazer?",a:2,opts:["Continuar com qualquer raquete disponível","Deve sair do torneio","Pode substituí-la por uma pré-aprovada pelo árbitro","Pede 5 minutos de pausa para substituir"],exp:"Se a raquete ficar inutilizável, o jogador pode substituí-la, mas a raquete substituta deve ser aprovada pelo árbitro."},
      {q:"Qual é o procedimento correto da inspeção de raquetes em competições ITTF?",a:1,opts:["Apenas o árbitro principal inspeciona antes da final","Os jogadores mostram as raquetes ao adversário e ao árbitro antes do início do jogo","Só se houver protesto do adversário","Só em competições com classificação mundial"],exp:"Em competições ITTF, cada jogador deve mostrar a sua raquete ao adversário e ao árbitro antes do início do jogo (e após o jogo, se solicitado)."},
      {q:"Em condições normais, a que intervalo muda a bola num match de competição ITTF?",a:2,opts:["Cada set","Cada 3 pontos","Início de cada jogo ou quando danificada","Nunca, só por dano"],exp:"A bola é substituída no início de cada jogo (match) ou quando está visivelmente danificada durante o jogo."},
      {q:"O que diz a regra ITTF sobre o uso de substâncias na raquete ('speed glue')?",a:1,opts:["É permitido com aprovação prévia","Está completamente proibido desde 2008","É permitido apenas em competições nacionais","Necessita de certificado médico"],exp:"O uso de cola rápida (speed glue) e adesivos com solventes orgânicos foi proibido pela ITTF em 2008. Só são permitidos adesivos aquosos (water-based)."},
      {q:"Segundo as regras ITTF, o que é uma 'bad service' (serviço inválido) não corrigida pelo árbitro após advertência?",a:0,opts:["Ponto imediato para o adversário","Segundo serviço","Let repetido","Desclassificação"],exp:"Após advertência por mau serviço, qualquer serviço subsequente inválido resulta em ponto direto para o adversário, sem necessidade de nova advertência."},
      {q:"Qual é a regra ITTF sobre o 'time-out' (pausa) num jogo?",a:2,opts:["Não é permitido time-out","Cada equipa tem 2 time-outs por jogo","Cada jogador/equipa tem direito a 1 time-out de 1 minuto por jogo","Só o árbitro pode interromper o jogo"],exp:"Cada jogador (ou equipa em pares) tem direito a um time-out de 1 minuto por match (não por set). Pode ser pedido em qualquer momento, exceto durante o serviço."},
      {q:"O que prevê o regulamento ITTF sobre o treinador (coach) durante o jogo?",a:1,opts:["O treinador pode dar instruções em qualquer momento","O treinador só pode dar instruções durante os intervalos entre sets e durante os time-outs","O treinador pode entrar na área de jogo","Não há regulação sobre o comportamento do treinador"],exp:"O treinador só pode comunicar com o jogador durante os intervalos entre sets e durante os time-outs solicitados. Não é permitido qualquer tipo de instrução durante o jogo em si."},
      {q:"O que são 'pimples-out' (espinhos para fora) num revestimento de raquete?",a:2,opts:["Revestimento com espinhos virados para dentro","Revestimento completamente liso","Revestimento com espinhos virados para fora, sem camada de esponja atrás","Borracha especial para defesa"],exp:"'Pimples-out' (OX ou sem esponja) é um revestimento com os espinhos de borracha virados para fora. Reduz o efeito (spin) mas melhora o controlo. É permitido pela ITTF se aprovado."},
      {q:"Quantos minutos de intervalo são permitidos entre sets num jogo ITTF?",a:0,opts:["1 minuto","2 minutos","3 minutos","5 minutos"],exp:"O intervalo entre sets num jogo ITTF tem a duração máxima de 1 minuto."},
      {q:"O que é o 'phantom serve' e qual é a sua situação regulamentar?",a:1,opts:["Serviço invisível, permitido","Serviço em que a raquete não toca claramente a bola, proibido","Serviço com rotação excessiva, limitada a 3000 RPM","Serviço com bola lançada mais de 30 cm, obrigatório"],exp:"O 'phantom serve' esconde o contato da bola com a raquete (com o corpo ou braço livre), impossibilitando o adversário de ver o momento do impacto. É proibido pelas regras ITTF."},
      {q:"Em competições ITTF, o que especifica a regra sobre a iluminação da área de jogo?",a:2,opts:["Mínimo de 200 lux","Mínimo de 500 lux","Mínimo de 1000 lux no plano da mesa, sem luz natural direta","Sem requisitos específicos"],exp:"A ITTF recomenda pelo menos 1000 lux uniformemente sobre a superfície da mesa, sem luz solar direta, para competições internacionais."},
    ]
  };

  const ITTF_RULES_SECTIONS = [
    {
      id:"jogo",
      icon:"🏓",
      title:"O Jogo — Regras Gerais",
      rules:[
        "Um set é ganho pelo primeiro jogador a atingir 11 pontos, com uma vantagem mínima de 2 pontos sobre o adversário.",
        "Um jogo (match) é ganho pelo jogador que vencer o maior número de sets no formato definido (melhor de 3, 5 ou 7).",
        "O jogador que marca um ponto começa a servir no par seguinte (ou mantém o serviço conforme a rotação).",
        "Se a bola em jogo tocar qualquer parte do corpo de um jogador exceto a mão da raquete, o ponto é perdido.",
        "A mão livre (que não segura a raquete) NÃO pode tocar a superfície de jogo durante um rally — ponto para o adversário.",
        "Se a bola tocar a borda superior da mesa (edge), o ponto é válido.",
        "Se a bola tocar a borda lateral da mesa, o ponto é do adversário — não é área de jogo.",
        "Um jogador não pode bater na bola antes de ela tocar a sua metade da mesa (não há volley).",
        "O jogo pode ser interrompido por lesão verificável, falha de equipamento ou outro motivo aceite pelo árbitro.",
        "Após 10 minutos de jogo num set (sem nenhum jogador atingir 9 pontos), entra em vigor o 'expedite system': o ponto é ganho pelo recetor se o servidor não ganhar em 13 pancadas.",
      ]
    },
    {
      id:"servico",
      icon:"🏓",
      title:"Serviço",
      rules:[
        "Ao servir, a bola deve ser colocada na palma da mão aberta e imóvel, acima do nível da superfície de jogo.",
        "A bola deve ser lançada quase verticalmente para cima, pelo menos 16 cm, sem rotação.",
        "O servidor deve bater na bola quando desce, de forma que toque primeiro o seu próprio lado da mesa e depois o lado do adversário.",
        "Em singulares, a bola pode cair em qualquer parte da mesa do adversário.",
        "Em pares, o serviço deve ser em diagonal: da metade direita do servidor para a metade direita do recetor.",
        "O contato da bola com a raquete deve ser visível ao adversário e ao árbitro — não pode ser ocultado pelo corpo.",
        "Se a bola toca a rede no serviço e cai válida, é 'let' — o serviço é repetido.",
        "Após advertência, qualquer serviço incorreto resulta em ponto imediato para o adversário.",
        "Se o servidor lança a bola para servir e não a bate, perde o ponto.",
        "Ao servir, o braço livre deve estar acima do nível da mesa e visível ao árbitro e ao adversário.",
      ]
    },
    {
      id:"pontuacao",
      icon:"🔢",
      title:"Pontuação e Troca de Serviço",
      rules:[
        "O serviço muda a cada 2 pontos disputados, alternando entre os jogadores.",
        "Em caso de deuce (10-10), o serviço muda a cada ponto e é necessária uma vantagem de 2 pontos para ganhar o set.",
        "Em pares, a ordem de serviço e receção deve manter-se até ao fim do set; no set seguinte, o par que recebeu passa a servir.",
        "O primeiro a servir num jogo é determinado por sorteio (cara ou coroa, ou escolha do lado).",
        "Ao início de cada set, os jogadores trocam de lado; no set decisivo (último), trocam de lado quando um jogador atinge 5 pontos.",
        "Num set decisivo em pares, a ordem de receção pode ser alterada pelo par que recebe.",
        "O 'expedite system' não altera a alternância de serviço de 2 em 2 pontos — passa apenas a 1 em 1 ponto a partir da sua entrada em vigor.",
        "Após um 'let' no serviço, o par de serviços é repetido completamente (a contagem não avança).",
      ]
    },
    {
      id:"equipamento",
      icon:"🎯",
      title:"Equipamento — Mesa e Rede",
      rules:[
        "A mesa tem 274 cm de comprimento × 152,5 cm de largura × 76 cm de altura.",
        "A superfície de jogo deve ser plana, uniforme, de cor mate (tipicamente azul ou verde) com uma linha branca de 2 cm nas bordas.",
        "A rede divide a mesa ao meio; tem 15,25 cm de altura ao longo de toda a sua extensão.",
        "A superfície de jogo não inclui as superfícies laterais (bordas laterais) da mesa.",
        "A mesa deve ser de madeira ou material similar, com uma taxa de ressalto de 23 ± 1 cm quando uma bola padrão é largada de 30 cm de altura.",
        "A linha central (2 mm de largura) divide a mesa em duas metades iguais e faz parte de cada metade direita para efeitos do serviço em pares.",
      ]
    },
    {
      id:"bola",
      icon:"⚪",
      title:"Equipamento — Bola",
      rules:[
        "A bola deve ter 40 mm de diâmetro (± 0,5 mm) e pesar 2,7 g (± 0,1 g).",
        "A bola deve ser esférica com um desvio máximo de 0,35 mm.",
        "A cor da bola deve ser branca ou laranja, mate.",
        "Desde 2015, as bolas ITTF de competição são de plástico (poly), substituindo as de celuloide.",
        "Apenas bolas aprovadas pela ITTF podem ser usadas em competições internacionais.",
      ]
    },
    {
      id:"raquete",
      icon:"🏓",
      title:"Equipamento — Raquete",
      rules:[
        "A raquete pode ter qualquer dimensão, forma e peso, mas a lâmina deve ser plana e rígida.",
        "Pelo menos 85% da espessura da lâmina deve ser de madeira natural.",
        "Os dois lados da raquete devem ter cores diferentes: obrigatoriamente um lado vermelho e outro lado preto.",
        "O revestimento (borracha) deve ser aprovado pela ITTF; a lista é atualizada regularmente.",
        "A espessura total de cada lado do revestimento (borracha + esponja) não pode exceder 4 mm.",
        "Podem ser usados revestimentos pimples-in (espinhos para dentro), pimples-out (espinhos para fora) ou anti-spin, desde que aprovados pela ITTF.",
        "Antes do jogo, cada jogador deve mostrar a raquete ao adversário e ao árbitro para inspeção.",
        "O uso de cola rápida (speed glue) com solventes orgânicos é proibido desde 2008 — só são permitidos adesivos aquosos.",
        "Se a raquete for danificada durante o jogo, pode ser substituída com aprovação do árbitro.",
      ]
    },
    {
      id:"conduta",
      icon:"⚖️",
      title:"Conduta e Fair Play",
      rules:[
        "Cada jogador tem direito a 1 time-out de 1 minuto por match (não por set), pedido em qualquer momento exceto durante o serviço.",
        "O intervalo máximo entre sets é de 1 minuto.",
        "O treinador só pode dar instruções durante os intervalos entre sets e durante os time-outs — nunca durante o jogo.",
        "Comportamentos antidesportivos (insultos, danificar equipamento, interrupções deliberadas) são punidos com advertência e/ou ponto atribuído ao adversário.",
        "Em caso de má conduta repetida, o árbitro pode excluir o jogador do match ou da competição.",
        "Os jogadores devem respeitar as decisões do árbitro; protestos devem ser feitos de forma educada e apenas pelo jogador, nunca pelo treinador durante o jogo.",
        "É proibido receber instrução por qualquer meio eletrónico durante o jogo.",
      ]
    },
    {
      id:"torneio",
      icon:"🏆",
      title:"Regras de Torneio",
      rules:[
        "Num torneio eliminatório (knockout), o perdedor está imediatamente eliminado.",
        "O sistema round-robin (todos contra todos) distribui pontos: vitória = 2 pontos, derrota = 1 ponto, não comparência = 0 pontos.",
        "Em caso de empate em pontos no round-robin, o desempate é feito por sets e depois por pontos dentro dos sets.",
        "O seeding (cabeças de série) é baseado no ranking ITTF ou pela classificação no torneio anterior.",
        "Os jogadores devem estar disponíveis no horário indicado; atraso superior a 10 minutos pode resultar em derrota por incomparecência.",
        "As raquetes são inspecionadas antes do início de cada match e podem ser verificadas novamente após o jogo.",
        "Em pares, os parceiros devem jogar alternadamente: cada jogador só pode bater na bola quando é a sua vez.",
        "Nos Jogos Olímpicos e Campeonatos do Mundo, usa-se o sistema de melhor de 7 sets na maioria das fases.",
        "O árbitro tem autoridade máxima durante o match; as decisões do árbitro assistente (umpire) sobre edge/bord são finais.",
        "Em competições internacionais, os jogadores devem usar vestuário de cor diferente da bola (branca ou laranja).",
      ]
    },
    {
      id:"especial",
      icon:"📌",
      title:"Situações Especiais e Curiosidades",
      rules:[
        "Se a bola passa à volta da rede (em vez de por cima) e cai válida, é um ponto legítimo.",
        "Um jogador pode bater na bola com qualquer parte da superfície da raquete, incluindo a borda da raquete.",
        "Se a bola toca o suporte da rede e cai do lado do adversário num rally (não no serviço), é ponto válido.",
        "Se ambos os jogadores tocam a bola ao mesmo tempo, ponto para o adversário (falta dupla não existe — perde quem toca por último erradamente).",
        "Um jogador pode mover a mesa por acidente sem intenção — normalmente não é falta se a bola ainda for válida; cabe ao árbitro decidir.",
        "A ITTF atualiza as regras periodicamente; versão em vigor consultável em ittf.com.",
        "O material da bola mudou de celuloide para plástico (poly) em 2015, alterando ligeiramente o comportamento do spin.",
        "O 'tomahawk serve' (serviço com rotação lateral intensa) é permitido desde que o contato seja visível.",
      ]
    },
  ];

  let quizState = {diff:"easy",questions:[],current:0,score:0};

  function openQuiz(){
    renderMinigamePlayerPick();
    showScreen("screen-mg-quiz");
    resetQuizStart();
  }

  function resetQuizStart(){
    document.getElementById("mg-quiz-start").hidden=false;
    document.getElementById("mg-quiz-question-wrap").hidden=true;
    document.getElementById("mg-quiz-result").hidden=true;
    const rec=getMgRec("quiz_"+quizState.diff,currentMiniGamePlayer);
    document.getElementById("mg-quiz-best").textContent=rec?rec+"/10":"—";
  }

  function startQuiz(diff){
    if(!currentMiniGamePlayer){showToast(t("js.mgQuizChooseFirst"),"error");return;}
    quizState.diff=diff;
    const pool=[...getITTFQuiz()[diff]].map((q,i)=>Object.assign({},q,{_idx:i}));
    // shuffle and pick 10
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    quizState.questions=pool.slice(0,10);
    quizState.current=0;quizState.score=0;
    document.getElementById("mg-quiz-start").hidden=true;
    document.getElementById("mg-quiz-question-wrap").hidden=false;
    document.getElementById("mg-quiz-result").hidden=true;
    document.getElementById("mg-quiz-score").textContent="0";
    renderQuizQuestion();
  }

  function renderQuizQuestion(){
    const q=quizState.questions[quizState.current];
    const total=quizState.questions.length;
    const pct=((quizState.current)/total)*100;
    document.getElementById("mg-quiz-progress-fill").style.width=pct+"%";
    document.getElementById("mg-quiz-progress-text").textContent=(quizState.current+1)+"/"+total;
    const diffLabels={easy:"🟢 "+t("js.mgQuizEasy"),medium:"🟡 "+t("js.mgQuizMedium"),hard:"🔴 "+t("js.mgQuizHard")};
    document.getElementById("mg-quiz-diff-badge").textContent=diffLabels[quizState.diff]||quizState.diff;
    const qText=t("quiz."+quizState.diff+"."+q._idx+".q")||q.q;
    document.getElementById("mg-quiz-question").textContent=qText;
    const ans=document.getElementById("mg-quiz-answers");
    ans.innerHTML="";
    // shuffle opts
    const shuffled=q.opts.map((o,i)=>({o:t("quiz."+quizState.diff+"."+q._idx+".o"+i)||o,i}));
    for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
    shuffled.forEach(({o,i})=>{
      const btn=document.createElement("button");
      btn.className="mg-quiz-answer-btn";
      btn.textContent=o;
      btn.addEventListener("click",()=>answerQuiz(i===q.a,btn,ans,t("quiz."+quizState.diff+"."+q._idx+".exp")||q.exp));
      ans.appendChild(btn);
    });
    document.getElementById("mg-quiz-feedback").hidden=true;
  }

  function answerQuiz(correct,btn,ansContainer,exp){
    // disable all buttons
    ansContainer.querySelectorAll(".mg-quiz-answer-btn").forEach(b=>{b.disabled=true;b.classList.add("is-disabled");});
    const fb=document.getElementById("mg-quiz-feedback");
    const fbText=document.getElementById("mg-quiz-feedback-text");
    if(correct){
      btn.classList.add("is-correct");
      quizState.score++;
      document.getElementById("mg-quiz-score").textContent=quizState.score;
      fbText.innerHTML=`<strong class="quiz-fb-correct">${t("js.mgQuizCorrect")}</strong> ${exp}`;
      playTone(880,80,0.3,"sine");
    }else{
      btn.classList.add("is-wrong");
      fbText.innerHTML=`<strong class="quiz-fb-wrong">${t("js.mgQuizWrong")}</strong> ${exp}`;
      playTone(220,200,0.3,"square");
    }
    fb.hidden=false;
  }

  function nextQuizQuestion(){
    quizState.current++;
    if(quizState.current>=quizState.questions.length){
      endQuiz();
    }else{
      document.getElementById("mg-quiz-feedback").hidden=true;
      renderQuizQuestion();
    }
  }

  function endQuiz(){
    document.getElementById("mg-quiz-question-wrap").hidden=true;
    document.getElementById("mg-quiz-result").hidden=false;
    const s=quizState.score, total=quizState.questions.length;
    document.getElementById("mg-quiz-final-score").textContent=s+"/"+total;
    const pct=s/total;
    let icon,msg;
    if(pct>=0.8){icon="🏆";msg=t("js.mgQuizResultGreat");}
    else if(pct>=0.5){icon="👍";msg=t("js.mgQuizResultGood");}
    else{icon="📚";msg=t("js.mgQuizResultTry");}
    document.getElementById("mg-quiz-result-icon").textContent=icon;
    document.getElementById("mg-quiz-result-msg").textContent=msg;
    const key="quiz_"+quizState.diff;
    const rec=getMgRec(key,currentMiniGamePlayer);
    const isNew=quizState.score>rec;
    if(isNew)setMgRec(key,currentMiniGamePlayer,quizState.score);
    document.getElementById("mg-quiz-new-rec").hidden=!isNew;
  }

  document.getElementById("btn-minigame-quiz").addEventListener("click",()=>{
    if(!currentMiniGamePlayer){showToast(t("js.mgQuizChooseFirst"),"error");return;}
    openQuiz();
  });
  document.getElementById("btn-mg-quiz-back").addEventListener("click",()=>showScreen("screen-minigames"));
  document.getElementById("btn-quiz-easy").addEventListener("click",()=>startQuiz("easy"));
  document.getElementById("btn-quiz-medium").addEventListener("click",()=>startQuiz("medium"));
  document.getElementById("btn-quiz-hard").addEventListener("click",()=>startQuiz("hard"));
  document.getElementById("btn-quiz-next").addEventListener("click",nextQuizQuestion);
  document.getElementById("btn-quiz-retry").addEventListener("click",resetQuizStart);

  /* ═══ REGRAS ITTF ═══ */

  function renderRulesScreen(){
    const content=document.getElementById("rules-content");
    content.innerHTML="";
    ITTF_RULES_SECTIONS.forEach(sec=>{
      const wrap=document.createElement("div");
      wrap.className="rules-section";
      const hdr=document.createElement("button");
      hdr.className="rules-section-header";
      const secTitle=t("rules."+sec.id+".title")||sec.title;
      hdr.innerHTML=`<span class="rules-section-icon">${sec.icon}</span><span class="rules-section-title">${escapeHTML(secTitle)}</span><span class="rules-section-chevron">›</span>`;
      const body=document.createElement("div");
      body.className="rules-section-body";
      body.hidden=true;
      const list=document.createElement("ul");
      list.className="rules-list";
      sec.rules.forEach((r,i)=>{
        const translated=t("rules."+sec.id+".r"+i)||r;
        const li=document.createElement("li");
        li.textContent=translated;
        list.appendChild(li);
      });
      body.appendChild(list);
      hdr.addEventListener("click",()=>{
        const open=!body.hidden;
        body.hidden=open;
        hdr.classList.toggle("is-open",!open);
        hdr.querySelector(".rules-section-chevron").textContent=open?"›":"⌄";
      });
      wrap.appendChild(hdr);
      wrap.appendChild(body);
      content.appendChild(wrap);
    });
  }

  document.getElementById("btn-rules-ittf").addEventListener("click",()=>{
    renderRulesScreen();
    showScreen("screen-rules-ittf");
  });

  /* ═══ CONQUISTAS E RECORDES ═══ */
  const ACHIEVEMENTS=[
    {id:"first_point",cat:"Primeiros Passos",icon:"⭐",name:"Primeiro Ponto",desc:"Marca o teu primeiro ponto.",secret:false,check:(pid)=>DATA.games.some(g=>(g.blue.playerId===pid||g.white.playerId===pid)&&g.sets.length>0)},
    {id:"first_set",cat:"Primeiros Passos",icon:"📋",name:"Primeiro Set",desc:"Ganha o teu primeiro set.",secret:false,check:(pid)=>{return DATA.games.some(g=>{const s=g.blue.playerId===pid?"blue":"white";return g.sets.some(set=>set.winnerSide===s);});}},
    {id:"first_win",cat:"Primeiros Passos",icon:"🥇",name:"Primeira Vitória",desc:"Ganha o teu primeiro jogo.",secret:false,check:(pid)=>DATA.games.some(g=>!g.isDraw&&((g.winnerSide==="blue"&&g.blue.playerId===pid)||(g.winnerSide==="white"&&g.white.playerId===pid)))},
    {id:"first_tournament",cat:"Primeiros Passos",icon:"🎟",name:"Primeiro Torneio",desc:"Participa no teu primeiro torneio.",secret:false,check:(pid)=>(DATA.tournamentHistory||[]).some(t=>t.seeded&&t.seeded.includes(pid))},
    {id:"first_trophy",cat:"Primeiros Passos",icon:"🏆",name:"Primeiro Troféu",desc:"Ganha o teu primeiro torneio.",secret:false,check:(pid)=>(DATA.tournamentHistory||[]).some(t=>t.winner===pid)},
    {id:"wins_10",cat:"Vitórias",icon:"🏓",name:"10 Vitórias",desc:"Ganha 10 jogos.",secret:false,progressive:true,total:10,progress:(pid)=>_wins(pid),check:(pid)=>_wins(pid)>=10},
    {id:"wins_50",cat:"Vitórias",icon:"🏓",name:"50 Vitórias",desc:"Ganha 50 jogos.",secret:false,progressive:true,total:50,progress:(pid)=>_wins(pid),check:(pid)=>_wins(pid)>=50},
    {id:"wins_100",cat:"Vitórias",icon:"🏓",name:"100 Vitórias",desc:"Ganha 100 jogos.",secret:false,progressive:true,total:100,progress:(pid)=>_wins(pid),check:(pid)=>_wins(pid)>=100},
    {id:"wins_200",cat:"Vitórias",icon:"🏓",name:"200 Vitórias",desc:"Ganha 200 jogos.",secret:false,progressive:true,total:200,progress:(pid)=>_wins(pid),check:(pid)=>_wins(pid)>=200},
    {id:"streak_3",cat:"Vitórias",icon:"🔥",name:"Hat-trick",desc:"3 vitórias consecutivas.",secret:false,progressive:true,total:3,progress:(pid)=>_currentStreak(pid),check:(pid)=>_maxStreak(pid)>=3},
    {id:"streak_5",cat:"Vitórias",icon:"🔥",name:"Em Forma",desc:"5 vitórias consecutivas.",secret:false,progressive:true,total:5,progress:(pid)=>_currentStreak(pid),check:(pid)=>_maxStreak(pid)>=5},
    {id:"streak_10",cat:"Vitórias",icon:"🔥",name:"Imparável",desc:"10 vitórias consecutivas.",secret:false,progressive:true,total:10,progress:(pid)=>_currentStreak(pid),check:(pid)=>_maxStreak(pid)>=10},
    {id:"streak_20",cat:"Vitórias",icon:"🔥",name:"Invencível",desc:"20 vitórias consecutivas.",secret:false,progressive:true,total:20,progress:(pid)=>_currentStreak(pid),check:(pid)=>_maxStreak(pid)>=20},
    {id:"sweep",cat:"Sets",icon:"🧹",name:"Vassoura",desc:"Ganha um jogo sem perder nenhum set.",secret:false,check:(pid)=>DATA.games.some(g=>!g.isDraw&&_myWin(g,pid)&&_oppSets(g,pid)===0&&_mySets(g,pid)>=2)},
    {id:"capote_set",cat:"Sets",icon:"💀",name:t("js.capoteTag"),desc:"Ganha um set por 11-0.",secret:false,check:(pid)=>DATA.games.some(g=>{const s=g.blue.playerId===pid?"blue":"white";return g.sets.some(set=>set.winnerSide===s&&set.capote);})},
    {id:"set_perfect",cat:"Sets",icon:"✨",name:"Set Perfeito",desc:"Ganha um set permitindo no máximo 3 pontos.",secret:false,check:(pid)=>DATA.games.some(g=>{const s=g.blue.playerId===pid?"blue":"white";return g.sets.some(set=>set.winnerSide===s&&(s==="blue"?set.whiteScore:set.blueScore)<=3);})},
    {id:"deciding_set",cat:"Sets",icon:"⚔️",name:"Decisão",desc:"Ganha um jogo decidido no último set.",secret:false,check:(pid)=>DATA.games.some(g=>!g.isDraw&&_myWin(g,pid)&&g.sets.length>=3&&g.blue.setsWon>0&&g.white.setsWon>0)},
    {id:"comeback",cat:"Remontadas",icon:"↩️",name:"Remontada",desc:"Ganha um jogo depois de perder o 1º set.",secret:false,check:(pid)=>DATA.games.some(g=>{if(!_myWin(g,pid)||g.sets.length<2)return false;const me=g.blue.playerId===pid?"blue":"white";return g.sets[0].winnerSide!==me;})},
    {id:"comeback_02",cat:"Remontadas",icon:"⚡",name:"Grande Remontada",desc:"Ganha um jogo depois de estar 0-2 em sets.",secret:false,check:(pid)=>DATA.games.some(g=>{if(!_myWin(g,pid)||g.sets.length<4)return false;const me=g.blue.playerId===pid?"blue":"white";let mine=0,opp=0,found=false;g.sets.forEach(s=>{if(s.winnerSide===me)mine++;else opp++;if(opp>=2&&mine===0)found=true;});return found;})},
    {id:"comeback_pts",cat:"Remontadas",icon:"🔄",name:"Nunca Desistas",desc:"Ganha um set depois de estar a perder por 5+ pontos.",secret:false,check:(pid)=>DATA.games.some(g=>{const me=g.blue.playerId===pid?"blue":"white";return g.sets.some(set=>{if(set.winnerSide!==me||!set.pointLog)return false;let b=0,w=0,deficit=0;set.pointLog.forEach(side=>{if(side==="blue")b++;else w++;const myP=me==="blue"?b:w,oppP=me==="blue"?w:b;if(oppP-myP>=5)deficit=1;});return deficit===1;});})},
    {id:"elo_1000",cat:"ELO",icon:"📈",name:"Quatro Dígitos",desc:"Atinge 1000 de ELO.",secret:false,check:(pid)=>getPlayerElo(pid)>=1000},
    {id:"elo_1200",cat:"ELO",icon:"📈",name:"1200 Club",desc:"Atinge 1200 de ELO.",secret:false,check:(pid)=>getPlayerElo(pid)>=1200},
    {id:"elo_1300",cat:"ELO",icon:"📈",name:"Elite",desc:"Atinge 1300 de ELO.",secret:false,check:(pid)=>getPlayerElo(pid)>=1300},
    {id:"elo_1500",cat:"ELO",icon:"📈",name:"Mestre",desc:"Atinge 1500 de ELO.",secret:false,check:(pid)=>getPlayerElo(pid)>=1500},
    {id:"pts_100",cat:"Pontos",icon:"🎯",name:"Centenário",desc:"Acumula 100 pontos.",secret:false,progressive:true,total:100,progress:(pid)=>_totalPoints(pid),check:(pid)=>_totalPoints(pid)>=100},
    {id:"pts_500",cat:"Pontos",icon:"🎯",name:"500 Pontos",desc:"Acumula 500 pontos.",secret:false,progressive:true,total:500,progress:(pid)=>_totalPoints(pid),check:(pid)=>_totalPoints(pid)>=500},
    {id:"pts_1000",cat:"Pontos",icon:"🎯",name:"1000 Pontos",desc:"Acumula 1000 pontos.",secret:false,progressive:true,total:1000,progress:(pid)=>_totalPoints(pid),check:(pid)=>_totalPoints(pid)>=1000},
    {id:"tour_2",cat:"Torneios",icon:"🏆",name:"Bicampeão",desc:"Ganha 2 torneios.",secret:false,progressive:true,total:2,progress:(pid)=>_tourWins(pid),check:(pid)=>_tourWins(pid)>=2},
    {id:"tour_3",cat:"Torneios",icon:"🏆",name:"Tricampeão",desc:"Ganha 3 torneios.",secret:false,progressive:true,total:3,progress:(pid)=>_tourWins(pid),check:(pid)=>_tourWins(pid)>=3},
    {id:"rival_10",cat:"Rivalidades",icon:"⚔️",name:t("js.classic"),desc:"Joga 10 partidas contra o mesmo adversário.",secret:false,progressive:true,total:10,progress:(pid)=>_maxRivalGames(pid),check:(pid)=>_maxRivalGames(pid)>=10},
    {id:"rival_25",cat:"Rivalidades",icon:"⚔️",name:"Rivalidade",desc:"Joga 25 partidas contra o mesmo adversário.",secret:false,progressive:true,total:25,progress:(pid)=>_maxRivalGames(pid),check:(pid)=>_maxRivalGames(pid)>=25},
    {id:"rival_dom",cat:"Rivalidades",icon:"👑",name:"Domínio",desc:"10 vitórias de vantagem sobre o mesmo adversário.",secret:false,check:(pid)=>_maxRivalDom(pid)>=10},
    {id:"rival_5",cat:"Rivalidades",icon:"💀",name:"Carrasco",desc:"5 vitórias consecutivas contra o mesmo adversário.",secret:false,check:(pid)=>_maxRivalStreak(pid)>=5},
    {id:"train_first",cat:"Treino",icon:"⏱",name:"Primeiro Treino",desc:"Completa uma sessão de treino.",secret:false,check:()=>{const s=DATA.trainingStats["global"];return !!(s&&s.sessions>=1);}},
    {id:"train_10m",cat:"Treino",icon:"⏱",name:"10 Minutos",desc:"Acumula 10 minutos de treino.",secret:false,progressive:true,total:10,progress:()=>Math.round((DATA.trainingStats["global"]?.totalMinutes)||0),check:()=>{const s=DATA.trainingStats["global"];return !!(s&&s.totalMinutes>=10);}},
    {id:"train_1h",cat:"Treino",icon:"⏱",name:"1 Hora",desc:"Acumula 60 minutos de treino.",secret:false,progressive:true,total:60,progress:()=>Math.round((DATA.trainingStats["global"]?.totalMinutes)||0),check:()=>{const s=DATA.trainingStats["global"];return !!(s&&s.totalMinutes>=60);}},
    {id:"train_5sess",cat:"Treino",icon:"⏱",name:"Disciplina",desc:"Completa 5 sessões de treino.",secret:false,progressive:true,total:5,progress:()=>(DATA.trainingStats["global"]?.sessions)||0,check:()=>{const s=DATA.trainingStats["global"];return !!(s&&s.sessions>=5);}},
    {id:"mg_tap_10",cat:"Mini-Jogos",icon:"⚡",name:"Reflexos de Aço",desc:"Faz 10 pontos em Toques Rápidos.",secret:false,progressive:true,total:10,progress:(pid)=>getMgRec("tap",pid),check:(pid)=>getMgRec("tap",pid)>=10},
    {id:"mg_tap_30",cat:"Mini-Jogos",icon:"⚡",name:"Relâmpago",desc:"Faz 30 pontos em Toques Rápidos.",secret:false,progressive:true,total:30,progress:(pid)=>getMgRec("tap",pid),check:(pid)=>getMgRec("tap",pid)>=30},
    {id:"mg_mem_5",cat:"Mini-Jogos",icon:"🧠",name:"Memória Sólida",desc:"Chega ao nível 5 em Memória Visual.",secret:false,progressive:true,total:5,progress:(pid)=>getMgRec("memory",pid),check:(pid)=>getMgRec("memory",pid)>=5},
    {id:"mg_mem_10",cat:"Mini-Jogos",icon:"🧠",name:"Memória de Ferro",desc:"Chega ao nível 10 em Memória Visual.",secret:false,progressive:true,total:10,progress:(pid)=>getMgRec("memory",pid),check:(pid)=>getMgRec("memory",pid)>=10},
    {id:"secret_11_0",cat:"Especiais",icon:"💀",name:"Humilhação",desc:"Ganha um set por 11-0.",secret:true,check:(pid)=>DATA.games.some(g=>{const s=g.blue.playerId===pid?"blue":"white";return g.sets.some(set=>set.winnerSide===s&&set.capote);})},
    {id:"secret_3_2",cat:"Especiais",icon:"💪",name:"Até ao Limite",desc:"Ganha um jogo decidido no 5º set.",secret:true,check:(pid)=>DATA.games.some(g=>!g.isDraw&&_myWin(g,pid)&&g.sets.length===5)},
    {id:"secret_11_9",cat:"Especiais",icon:"🎯",name:"Ponto a Ponto",desc:"Ganha um set por 11-9.",secret:true,check:(pid)=>DATA.games.some(g=>{const s=g.blue.playerId===pid?"blue":"white";return g.sets.some(set=>set.winnerSide===s&&(s==="blue"?set.blueScore:set.whiteScore)===11&&(s==="blue"?set.whiteScore:set.blueScore)===9);})},
    {id:"secret_midnight",cat:"Especiais",icon:"🌙",name:"Sessão Noturna",desc:"Joga depois da meia-noite.",secret:true,check:(pid)=>DATA.games.some(g=>(g.blue.playerId===pid||g.white.playerId===pid)&&new Date(g.startedAt).getHours()>=0&&new Date(g.startedAt).getHours()<4)},
    {id:"secret_morning",cat:"Especiais",icon:"🌅",name:"Madrugador",desc:"Joga antes das 08:00.",secret:true,check:(pid)=>DATA.games.some(g=>(g.blue.playerId===pid||g.white.playerId===pid)&&new Date(g.startedAt).getHours()<8)},
    {id:"secret_10day",cat:"Especiais",icon:"🎮",name:"Máquina",desc:"Joga 10 jogos no mesmo dia.",secret:true,check:(pid)=>{const d={};DATA.games.filter(g=>g.blue.playerId===pid||g.white.playerId===pid).forEach(g=>{const k=g.endedAt.slice(0,10);d[k]=(d[k]||0)+1;});return Object.values(d).some(n=>n>=10);}},
  ];

  function _myWin(g,pid){return !g.isDraw&&((g.winnerSide==="blue"&&g.blue.playerId===pid)||(g.winnerSide==="white"&&g.white.playerId===pid));}
  function _mySide(g,pid){return g.blue.playerId===pid?"blue":"white";}
  function _mySets(g,pid){const s=_mySide(g,pid);return s==="blue"?g.blue.setsWon:g.white.setsWon;}
  function _oppSets(g,pid){const s=_mySide(g,pid);return s==="blue"?g.white.setsWon:g.blue.setsWon;}
  function _wins(pid){return DATA.games.filter(g=>_myWin(g,pid)).length;}
  function _tourWins(pid){return (DATA.tournamentHistory||[]).filter(t=>t.winner===pid).length;}
  function _totalPoints(pid){let t=0;DATA.games.forEach(g=>{const s=_mySide(g,pid);g.sets.forEach(set=>{t+=s==="blue"?set.blueScore:set.whiteScore;});});return t;}
  function _maxStreak(pid){let c=0,m=0;DATA.games.filter(g=>g.blue.playerId===pid||g.white.playerId===pid).sort((a,b)=>new Date(a.endedAt)-new Date(b.endedAt)).forEach(g=>{if(_myWin(g,pid)){c++;m=Math.max(m,c);}else c=0;});return m;}
  function _currentStreak(pid){let c=0;const s=DATA.games.filter(g=>g.blue.playerId===pid||g.white.playerId===pid).sort((a,b)=>new Date(b.endedAt)-new Date(a.endedAt));for(const g of s){if(_myWin(g,pid))c++;else break;}return c;}
  function _maxRivalGames(pid){const c={};DATA.games.forEach(g=>{const r=g.blue.playerId===pid?g.white.playerId:(g.white.playerId===pid?g.blue.playerId:null);if(r)c[r]=(c[r]||0)+1;});const v=Object.values(c);return v.length?Math.max(...v):0;}
  function _maxRivalDom(pid){const w={},l={};DATA.games.forEach(g=>{const r=g.blue.playerId===pid?g.white.playerId:(g.white.playerId===pid?g.blue.playerId:null);if(!r)return;if(_myWin(g,pid))w[r]=(w[r]||0)+1;else l[r]=(l[r]||0)+1;});let m=0;Object.keys(w).forEach(r=>{m=Math.max(m,(w[r]||0)-(l[r]||0));});return m;}
  function _maxRivalStreak(pid){const rv={};DATA.games.filter(g=>g.blue.playerId===pid||g.white.playerId===pid).sort((a,b)=>new Date(a.endedAt)-new Date(b.endedAt)).forEach(g=>{const r=g.blue.playerId===pid?g.white.playerId:(g.white.playerId===pid?g.blue.playerId:null);if(!r)return;if(!rv[r])rv[r]={c:0,m:0};if(_myWin(g,pid)){rv[r].c++;rv[r].m=Math.max(rv[r].m,rv[r].c);}else rv[r].c=0;});const vs=Object.values(rv).map(r=>r.m);return vs.length?Math.max(...vs):0;}

  function checkAchievements(trigger,playerId){
    const pids=playerId?[playerId]:DATA.players.map(p=>p.id);
    const newlyUnlocked=[];
    ACHIEVEMENTS.forEach(ach=>{
      if(ach.cat==="Treino"){
        if(!DATA.achievements["global"])DATA.achievements["global"]={};
        if(!DATA.achievements["global"][ach.id]){try{if(ach.check()){DATA.achievements["global"][ach.id]={unlockedAt:new Date().toISOString()};newlyUnlocked.push({ach,pid:null});}}catch(e){}}
        return;
      }
      pids.forEach(pid=>{
        if(!DATA.achievements[pid])DATA.achievements[pid]={};
        if(!DATA.achievements[pid][ach.id]){try{if(ach.check(pid)){DATA.achievements[pid][ach.id]={unlockedAt:new Date().toISOString()};newlyUnlocked.push({ach,pid});}}catch(e){}}
      });
    });
    if(newlyUnlocked.length){saveData();newlyUnlocked.forEach(({ach,pid})=>showAchievementToast(ach,pid));}
  }

  function checkAchievementsRetroactive(){
    DATA.players.forEach(p=>checkAchievements("retroactive",p.id));
    checkAchievements("training",null);
  }

  let _achQueue=[],_achShowing=false;
  function showAchievementToast(ach,pid){
    const playerName=pid?getPlayer(pid)?.name:null;
    _achQueue.push({ach,playerName});
    if(!_achShowing)_processAchQueue();
  }
  function _processAchQueue(){
    if(!_achQueue.length){_achShowing=false;return;}
    _achShowing=true;
    const{ach,playerName}=_achQueue.shift();
    const toast=document.getElementById("achievement-toast");
    document.getElementById("ach-toast-icon").textContent=ach.icon;
    document.getElementById("ach-toast-name").textContent=ach.secret?"???":t("ach."+ach.id+".name")||ach.name;
    document.getElementById("ach-toast-desc").textContent=ach.secret?t("js.achSecret"):(t("ach."+ach.id+".desc")||ach.desc);
    document.getElementById("ach-toast-player").textContent=playerName||"";
    toast.hidden=false;
    toast.classList.add("is-visible");
    setTimeout(()=>{toast.classList.remove("is-visible");setTimeout(()=>{toast.hidden=true;_processAchQueue();},400);},3500);
  }
  function _initAchievementToastListener(){
    const t=document.getElementById("achievement-toast");
    if(t) t.addEventListener("click",()=>{
      t.classList.remove("is-visible");
      setTimeout(()=>{t.hidden=true;_achShowing=false;_processAchQueue();},300);
    });
  }

  let _achFilterPlayer=null;
  function openAchievementsScreen(){
    _achFilterPlayer=_achFilterPlayer||DATA.players[0]?.id||null;
    renderAchievementsScreen();
    showScreen("screen-achievements");
  }
  function renderAchievementsScreen(){
    const allElos=computeAllElos();
    const picker=document.getElementById("ach-player-picker");
    picker.innerHTML="";
    DATA.players.forEach(p=>{
      const btn=document.createElement("button");
      btn.className="ach-player-btn"+((_achFilterPlayer===p.id)?" active":"");
      btn.textContent=playerInitials(p.name);btn.title=p.name;
      btn.addEventListener("click",()=>{_achFilterPlayer=p.id;renderAchievementsScreen();});
      picker.appendChild(btn);
    });
    const pid=_achFilterPlayer||(DATA.players[0]?.id);
    if(!pid)return;
    const unlocked=DATA.achievements[pid]||{};
    const gUnlocked=DATA.achievements["global"]||{};
    const total=ACHIEVEMENTS.length;
    const done=ACHIEVEMENTS.filter(a=>a.cat==="Treino"?!!gUnlocked[a.id]:!!unlocked[a.id]).length;
    document.getElementById("ach-progress-bar-fill").style.width=(done/total*100)+"%";
    document.getElementById("ach-progress-text").textContent=t("js.achProgressText").replace("%d",done).replace("%t",total);
    const cats={};ACHIEVEMENTS.forEach(a=>{if(!cats[a.cat])cats[a.cat]=[];cats[a.cat].push(a);});
    const container=document.getElementById("ach-list");container.innerHTML="";
    Object.entries(cats).forEach(([cat,items])=>{
      const sec=document.createElement("div");sec.className="ach-section";
      sec.innerHTML=`<p class="section-label">${tCat(cat)}</p>`;
      items.forEach(ach=>{
        const isU=ach.cat==="Treino"?!!gUnlocked[ach.id]:!!unlocked[ach.id];
        const uAt=ach.cat==="Treino"?gUnlocked[ach.id]?.unlockedAt:unlocked[ach.id]?.unlockedAt;
        const isSec=ach.secret&&!isU;
        const prog=ach.progressive&&ach.progress?(ach.cat==="Treino"?(ach.progress()||0):(ach.progress(pid)||0)):null;
        const card=document.createElement("div");
        card.className="ach-card"+(isU?" is-unlocked":"");
        const achName=t("ach."+ach.id+".name")||ach.name;
        const achDesc=t("ach."+ach.id+".desc")||ach.desc;
        card.innerHTML=`<div class="ach-icon">${isSec?"🔒":ach.icon}</div><div class="ach-info"><div class="ach-name">${isSec?"???":escapeHTML(achName)}</div><div class="ach-desc">${isSec?t("js.achSecretDesc"):escapeHTML(achDesc)}</div>${isU&&uAt?`<div class="ach-date">${formatDate(uAt)}</div>`:""} ${ach.progressive&&prog!==null&&!isU?`<div class="ach-prog-wrap"><div class="ach-prog-bar" style="width:${Math.min(100,prog/ach.total*100)}%"></div><span class="ach-prog-lbl">${prog} / ${ach.total}</span></div>`:""}</div>`;
        sec.appendChild(card);
      });
      container.appendChild(sec);
    });
  }

  document.getElementById("btn-achievements").addEventListener("click",()=>{
    _achFilterPlayer=DATA.players[0]?.id||null;
    openAchievementsScreen();
  });

  function openRecordsScreen(){renderRecordsScreen();showScreen("screen-records");}
  function renderRecordsScreen(){
    const container=document.getElementById("records-list");container.innerHTML="";
    const allElos=computeAllElos();
    const recs=[
      {icon:"📈",label:t("js.recElo"),get:()=>{let b=null,bv=0;DATA.players.forEach(p=>{const e=allElos[p.id]||ELO_BASE;if(e>bv){bv=e;b=p;}});return b?{player:b,value:bv+" ELO"}:null;}},
      {icon:"🔥",label:t("js.recStreak"),get:()=>{let b=null,bv=0;DATA.players.forEach(p=>{const s=_maxStreak(p.id);if(s>bv){bv=s;b=p;}});return b&&bv>0?{player:b,value:bv+" "+t("js.winsUnit")}:null;}},
      {icon:"🏓",label:t("js.recWins"),get:()=>{let b=null,bv=0;DATA.players.forEach(p=>{const w=_wins(p.id);if(w>bv){bv=w;b=p;}});return b&&bv>0?{player:b,value:bv+" "+t("js.winsUnit")}:null;}},
      {icon:"💀",label:t("js.recCapotes"),get:()=>{let b=null,bv=0;DATA.players.forEach(p=>{const s=computePlayerStats(p.id,allElos);if(s.capotes>bv){bv=s.capotes;b=p;}});return b&&bv>0?{player:b,value:bv+" "+t("js.capotesUnit")}:null;}},
      {icon:"🏆",label:t("js.recTournaments"),get:()=>{let b=null,bv=0;DATA.players.forEach(p=>{const tw=_tourWins(p.id);if(tw>bv){bv=tw;b=p;}});return b&&bv>0?{player:b,value:bv+" "+t("js.tournamentsUnit")}:null;}},
      {icon:"🎯",label:t("js.recMorePoints"),get:()=>{let b=null,bv=0;DATA.players.forEach(p=>{const pts=_totalPoints(p.id);if(pts>bv){bv=pts;b=p;}});return b&&bv>0?{player:b,value:bv+" "+t("js.pointsUnit")}:null;}},
      {icon:"⏱️",label:t("js.recMoreTraining"),get:()=>{const s=DATA.trainingStats["global"];return s&&s.totalMinutes>0?{player:null,value:Math.round(s.totalMinutes)+" "+t("js.minUnit")}:null;}},
      {icon:"⚡",label:t("js.recMgTap"),get:()=>{let b=null,bv=0;DATA.players.forEach(p=>{const r=getMgRec("tap",p.id);if(r>bv){bv=r;b=p;}});return b&&bv>0?{player:b,value:bv+" "+t("js.pointsUnit")}:null;}},
      {icon:"🧠",label:t("js.recMgMemory2"),get:()=>{let b=null,bv=0;DATA.players.forEach(p=>{const r=getMgRec("memory",p.id);if(r>bv){bv=r;b=p;}});return b&&bv>0?{player:b,value:t("js.levelPrefix")+bv}:null;}},
    ];
    recs.forEach(rec=>{
      const data=rec.get();
      const card=document.createElement("div");
      card.className="record-card"+(data?"":" record-card--empty");
      card.innerHTML=`<span class="record-icon">${rec.icon}</span><div class="record-info"><div class="record-label">${rec.label}</div>${data?`<div class="record-value">${data.player?escapeHTML(data.player.name)+" · ":""}${data.value}</div>`:`<div class="record-empty">${t("js.noDataYet")}</div>`}</div>`;
      container.appendChild(card);
    });
  }
  document.getElementById("btn-records").addEventListener("click",openRecordsScreen);

  init();
})();
