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
      // menu
      "menu.newGame":"Novo Jogo","menu.newGameSub":"Escolher jogadores e começar",
      "menu.tournament":"Torneio","menu.tournamentSub":"Eliminatórias com chaveamento automático",
      "menu.players":"Jogadores","menu.playersSub":"Gerir e ver estatísticas",
      "menu.history":"Histórico","menu.historySub":"Jogos anteriores",
      "menu.data":"Dados","menu.dataSub":"Exportar ou importar cópia de segurança",
      "menu.footer":"Dados guardados apenas neste dispositivo",
      // ecrãs
      "screen.players":"Jogadores","screen.history":"Histórico",
      "screen.gameDetail":"Detalhe do Jogo","screen.newGame":"Novo Jogo",
      "screen.gameType":"Tipo de Jogo","screen.pointsFormat":"Pontos e Formato",
      "screen.newTournament":"Novo Torneio","screen.tournament":"Torneio",
      "screen.minigames":"Mini Jogos","screen.achievements":"Conquistas",
      "screen.records":"Recordes","screen.data":"Dados",
      // botões
      "btn.addPlayer":"＋ Novo","btn.deletePlayer":"Eliminar",
      "btn.abandon":"Abandonar","btn.continue":"Continuar ▸",
      "btn.startGame":"Começar Jogo","btn.createTournament":"Criar Torneio",
      "btn.backMenu":"Voltar ao Menu","btn.start":"Começar",
      // serviço
      "serve.title":"SERVIÇO","serve.hint":"serve primeiro",
      // setup
      "setup.bluePlayer":"Lado Azul","setup.whitePlayer":"Lado Branco",
      "setup.pointsPerSet":"Pontos por set","setup.format":"Formato",
      // mini jogos
      "mg.tap":"Toques Rápidos","mg.tapSub":"Clica nos pontos antes que desapareçam",
      "mg.memory":"Memória Visual","mg.memorySub":"Memoriza e repete a sequência",
      // conquistas
      "ach.unlocked":"🏆 CONQUISTA DESBLOQUEADA!",
      // dados
      "data.export":"Exportar cópia de segurança","data.exportSub":"Gera um ficheiro .json com tudo",
      "data.import":"Importar cópia de segurança","data.importSub":"Adicionar ou fundir dados de uma cópia de segurança",
      "data.wipe":"Apagar todos os dados","data.wipeSub":"Remove jogadores e histórico deste tablet",
      // dinâmicos (usados no JS)
      "js.choosePlayer":"Escolher jogador","js.sideBlue":"Azul","js.sideWhite":"Branco","js.continue":"Continuar de qualquer forma ▸",
      "js.nextSet":"Próximo Set ▸","js.undoMsg":"Último ponto anulado — podes continuar o set.",
      "js.setInProgress":"O set em curso (%b-%w) não vai ser contado. O resultado dos sets já fechados é guardado no histórico.",
      "js.confirmEnd":"O resultado atual vai ser guardado no histórico.",
      "js.confirmWipe":"Apagar todos os dados?",
      "js.confirmAbandon":"Abandonar torneio?",
      "js.emptyPlayers":"Cria jogadores primeiro.",
      "js.noData":"Sem dados ainda",
      "js.wins":"vitórias","js.losses":"derrotas","js.draws":"empates","js.capotes":"capotes",
      "js.winRate":"Win%","js.elo":"ELO",
      "js.allPlayers":"Todos os jogadores",
      "js.serve":"Serve","js.notServe":"Não serve",
      "js.set":"Set","js.bestOf":"Melhor de","js.free":"Livre",
      "js.classic":"Clássico","js.custom":"Personalizado",
      "js.gameWon":"%n venceu o jogo","js.setWon":"%n venceu o set",
      "js.deuce":"DEUCE","js.matchPoint":"MATCH POINT",
      "js.capoteTag":"Capote","js.newRecord":"🏆 Novo recorde!",
      "js.points":"Pontos","js.level":"Nível","js.levelReached":"Nível atingido",
      "js.playAgain":"Jogar de novo",
      "js.tbd":"A definir","js.play":"▶ JOGAR",
      "js.whoseServe":"Set %n · quem serve primeiro?",
      "js.champion":"🏆 Campeão do Torneio",
      "js.winsLabel":"V","js.lossesLabel":"D","js.drawsLabel":"E",
      "js.capotesLabel":"Cap.","js.winRateLabel":"Win%","js.eloLabel":"ELO",
      "js.bestRival":"Melhor rival","js.worstRival":"Pior rival",
      "js.last10":"Últimos 10 jogos","js.streak":"Sequência atual",
      "js.setsWon":"Sets ganhos","js.setsLost":"Sets perdidos",
      "js.capotesMade":"Capotes feitos","js.capotesSuffered":"Capotes sofridos",
      "js.tournamentsWon":"Torneios ganhos","js.tournamentsPlayed":"Torneios jogados",
      "js.trainingMin":"min. de treino","js.trainingSessions":"sessões",
      "js.importReplace":"Substituir tudo","js.importMerge":"Adicionar ao que já tenho",
      "js.importDetailFile":"O ficheiro tem %p jogadores e %g jogos.",
      "js.importDetailMerge":"<strong>Adicionar</strong> traz %np jogadores e %ng jogos novos (nomes iguais são juntos; repetidos são ignorados).",
      "js.importDetailReplace":"<strong>Substituir tudo</strong> apaga os %p jogadores e %g jogos atuais e fica só com o ficheiro.",
      "js.recElo":"Maior ELO","js.recStreak":"Maior Sequência","js.recWins":"Mais Vitórias",
      "js.recCapotes":"Mais Capotes Feitos","js.recTournaments":"Mais Torneios Ganhos",
      "js.recPoints":"Mais Pontos Marcados","js.recDuration":"Jogo Mais Longo",
      "js.recMgTap":"Recorde Toques Rápidos","js.recMgMemory":"Recorde Memória",
      "js.recEloGain":"Maior Ganho de ELO",
      "js.wins_unit":"vitórias","js.min_unit":"min","js.pts_unit":"pts",
      "js.roundQF":"Quartos-de-final","js.roundSF":"Meia-final","js.roundF":"Final",
      "js.serveEvery2":"Serviço a cada 2 pontos","js.serveEvery5":"Serviço a cada 5 pontos",
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
    },
    en: {
      "menu.newGame":"New Game","menu.newGameSub":"Choose players and start",
      "menu.tournament":"Tournament","menu.tournamentSub":"Knockout bracket, auto-seeded",
      "menu.players":"Players","menu.playersSub":"Manage and view statistics",
      "menu.history":"History","menu.historySub":"Previous matches",
      "menu.data":"Data","menu.dataSub":"Export or import backup",
      "menu.footer":"data stored only on this device",
      "screen.players":"Players","screen.history":"History",
      "screen.gameDetail":"Match Detail","screen.newGame":"New Game",
      "screen.gameType":"Game Type","screen.pointsFormat":"Points & Format",
      "screen.newTournament":"New Tournament","screen.tournament":"Tournament",
      "screen.minigames":"Mini Games","screen.achievements":"Achievements",
      "screen.records":"Records","screen.data":"Data",
      "btn.addPlayer":"＋ New","btn.deletePlayer":"Delete",
      "btn.abandon":"Abandon","btn.continue":"Continue ▸",
      "btn.startGame":"Start Match","btn.createTournament":"Create Tournament",
      "btn.backMenu":"Back to Menu","btn.start":"Start",
      "serve.title":"SERVICE","serve.hint":"serves first",
      "setup.bluePlayer":"Blue Side","setup.whitePlayer":"White Side",
      "setup.pointsPerSet":"Points per game","setup.format":"Format",
      "mg.tap":"Quick Taps","mg.tapSub":"Tap the dots before they disappear",
      "mg.memory":"Visual Memory","mg.memorySub":"Memorise and repeat the sequence",
      "ach.unlocked":"🏆 ACHIEVEMENT UNLOCKED!",
      "data.export":"Export backup","data.exportSub":"Generates a .json file with everything",
      "data.import":"Import backup","data.importSub":"Add or merge data from a backup",
      "data.wipe":"Wipe all data","data.wipeSub":"Removes players and history from this device",
      "js.choosePlayer":"Choose player","js.sideBlue":"Blue","js.sideWhite":"White","js.continue":"Continue anyway ▸",
      "js.nextSet":"Next Game ▸","js.undoMsg":"Last point undone — you can continue the game.",
      "js.setInProgress":"The current game (%b-%w) will not count. Finished games are saved to history.",
      "js.confirmEnd":"The current result will be saved to history.",
      "js.confirmWipe":"Wipe all data?","js.confirmAbandon":"Abandon tournament?",
      "js.emptyPlayers":"Create players first.","js.noData":"No data yet",
      "js.wins":"wins","js.losses":"losses","js.draws":"draws","js.capotes":"whitewashes",
      "js.winRate":"Win%","js.elo":"Rating",
      "js.allPlayers":"All players",
      "js.serve":"Serves","js.notServe":"Doesn't serve",
      "js.set":"Game","js.bestOf":"Best of","js.free":"Free",
      "js.classic":"Classic","js.custom":"Custom",
      "js.gameWon":"%n won the match","js.setWon":"%n won the game",
      "js.deuce":"DEUCE","js.matchPoint":"MATCH POINT",
      "js.capoteTag":"Whitewash","js.newRecord":"🏆 New record!",
      "js.points":"Points","js.level":"Level","js.levelReached":"Level reached",
      "js.playAgain":"Play again",
      "js.tbd":"TBD","js.play":"▶ PLAY",
      "js.whoseServe":"Game %n · who serves first?",
      "js.champion":"🏆 Tournament Champion",
      "js.winsLabel":"W","js.lossesLabel":"L","js.drawsLabel":"D",
      "js.capotesLabel":"W/W","js.winRateLabel":"Win%","js.eloLabel":"Rating",
      "js.bestRival":"Best rival","js.worstRival":"Worst rival",
      "js.last10":"Last 10 matches","js.streak":"Current streak",
      "js.setsWon":"Games won","js.setsLost":"Games lost",
      "js.capotesMade":"Whitewashes made","js.capotesSuffered":"Whitewashes suffered",
      "js.tournamentsWon":"Tournaments won","js.tournamentsPlayed":"Tournaments played",
      "js.trainingMin":"min. of training","js.trainingSessions":"sessions",
      "js.importReplace":"Replace everything","js.importMerge":"Add to existing data",
      "js.importDetailFile":"The file has %p players and %g games.",
      "js.importDetailMerge":"<strong>Add</strong> brings %np new players and %ng new games (same names merged; duplicates ignored).",
      "js.importDetailReplace":"<strong>Replace everything</strong> deletes the current %p players and %g games and keeps only the file.",
      "js.recElo":"Highest Rating","js.recStreak":"Longest Streak","js.recWins":"Most Wins",
      "js.recCapotes":"Most Whitewashes","js.recTournaments":"Most Tournaments Won",
      "js.recPoints":"Most Points Scored","js.recDuration":"Longest Match",
      "js.recMgTap":"Quick Taps Record","js.recMgMemory":"Memory Record",
      "js.recEloGain":"Biggest Rating Gain",
      "js.wins_unit":"wins","js.min_unit":"min","js.pts_unit":"pts",
      "js.roundQF":"Quarter-finals","js.roundSF":"Semi-finals","js.roundF":"Final",
      "js.serveEvery2":"Service every 2 points","js.serveEvery5":"Service every 5 points",
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
    },
    es: {
      "menu.newGame":"Nueva Partida","menu.newGameSub":"Elegir jugadores y empezar",
      "menu.tournament":"Torneo","menu.tournamentSub":"Cuadro eliminatorio automático",
      "menu.players":"Jugadores","menu.playersSub":"Gestionar y ver estadísticas",
      "menu.history":"Historial","menu.historySub":"Partidas anteriores",
      "menu.data":"Datos","menu.dataSub":"Exportar o importar copia de seguridad",
      "menu.footer":"datos guardados solo en este dispositivo",
      "screen.players":"Jugadores","screen.history":"Historial",
      "screen.gameDetail":"Detalle del Partido","screen.newGame":"Nueva Partida",
      "screen.gameType":"Tipo de Juego","screen.pointsFormat":"Puntos y Formato",
      "screen.newTournament":"Nuevo Torneo","screen.tournament":"Torneo",
      "screen.minigames":"Minijuegos","screen.achievements":"Logros",
      "screen.records":"Récords","screen.data":"Datos",
      "btn.addPlayer":"＋ Nuevo","btn.deletePlayer":"Eliminar",
      "btn.abandon":"Abandonar","btn.continue":"Continuar ▸",
      "btn.startGame":"Iniciar Partido","btn.createTournament":"Crear Torneo",
      "btn.backMenu":"Volver al Menú","btn.start":"Empezar",
      "serve.title":"SAQUE","serve.hint":"saca primero",
      "setup.bluePlayer":"Lado Azul","setup.whitePlayer":"Lado Blanco",
      "setup.pointsPerSet":"Puntos por juego","setup.format":"Formato",
      "mg.tap":"Toques Rápidos","mg.tapSub":"Toca los puntos antes de que desaparezcan",
      "mg.memory":"Memoria Visual","mg.memorySub":"Memoriza y repite la secuencia",
      "ach.unlocked":"🏆 ¡LOGRO DESBLOQUEADO!",
      "data.export":"Exportar copia de seguridad","data.exportSub":"Genera un archivo .json con todo",
      "data.import":"Importar copia de seguridad","data.importSub":"Añadir o fusionar datos de una copia",
      "data.wipe":"Borrar todos los datos","data.wipeSub":"Elimina jugadores e historial de esta tableta",
      "js.choosePlayer":"Elegir jugador","js.sideBlue":"Azul","js.sideWhite":"Blanco","js.continue":"Continuar de todas formas ▸",
      "js.nextSet":"Siguiente Juego ▸","js.undoMsg":"Último punto anulado — puedes continuar el juego.",
      "js.setInProgress":"El juego en curso (%b-%w) no se contará. Los juegos cerrados quedan en el historial.",
      "js.confirmEnd":"El resultado actual se guardará en el historial.",
      "js.confirmWipe":"¿Borrar todos los datos?","js.confirmAbandon":"¿Abandonar el torneo?",
      "js.emptyPlayers":"Crea jugadores primero.","js.noData":"Sin datos aún",
      "js.wins":"victorias","js.losses":"derrotas","js.draws":"empates","js.capotes":"capotes",
      "js.winRate":"V%","js.elo":"Ranking",
      "js.allPlayers":"Todos los jugadores",
      "js.serve":"Saca","js.notServe":"No saca",
      "js.set":"Juego","js.bestOf":"Al mejor de","js.free":"Libre",
      "js.classic":"Clásico","js.custom":"Personalizado",
      "js.gameWon":"%n ganó el partido","js.setWon":"%n ganó el juego",
      "js.deuce":"IGUALES","js.matchPoint":"BOLA DE PARTIDO",
      "js.capoteTag":"Capote","js.newRecord":"🏆 ¡Nuevo récord!",
      "js.points":"Puntos","js.level":"Nivel","js.levelReached":"Nivel alcanzado",
      "js.playAgain":"Jugar de nuevo",
      "js.tbd":"Por definir","js.play":"▶ JUGAR",
      "js.whoseServe":"Juego %n · ¿quién saca primero?",
      "js.champion":"🏆 Campeón del Torneo",
      "js.winsLabel":"V","js.lossesLabel":"D","js.drawsLabel":"E",
      "js.capotesLabel":"Cap.","js.winRateLabel":"V%","js.eloLabel":"Ranking",
      "js.bestRival":"Mejor rival","js.worstRival":"Peor rival",
      "js.last10":"Últimos 10 partidos","js.streak":"Racha actual",
      "js.setsWon":"Juegos ganados","js.setsLost":"Juegos perdidos",
      "js.capotesMade":"Capotes realizados","js.capotesSuffered":"Capotes encajados",
      "js.tournamentsWon":"Torneos ganados","js.tournamentsPlayed":"Torneos jugados",
      "js.trainingMin":"min. de entrenamiento","js.trainingSessions":"sesiones",
      "js.importReplace":"Reemplazar todo","js.importMerge":"Añadir a los datos actuales",
      "js.importDetailFile":"El archivo tiene %p jugadores y %g partidas.",
      "js.importDetailMerge":"<strong>Añadir</strong> trae %np jugadores y %ng partidas nuevos (nombres iguales se unen; repetidos se ignoran).",
      "js.importDetailReplace":"<strong>Reemplazar todo</strong> elimina los %p jugadores y %g partidas actuales y deja solo el archivo.",
      "js.recElo":"Mayor Ranking","js.recStreak":"Mayor Racha","js.recWins":"Más Victorias",
      "js.recCapotes":"Más Capotes","js.recTournaments":"Más Torneos Ganados",
      "js.recPoints":"Más Puntos Marcados","js.recDuration":"Partido Más Largo",
      "js.recMgTap":"Récord Toques Rápidos","js.recMgMemory":"Récord Memoria",
      "js.recEloGain":"Mayor Subida de Ranking",
      "js.wins_unit":"victorias","js.min_unit":"min","js.pts_unit":"pts",
      "js.roundQF":"Cuartos de final","js.roundSF":"Semifinales","js.roundF":"Final",
      "js.serveEvery2":"Saque cada 2 puntos","js.serveEvery5":"Saque cada 5 puntos",
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
    },
    fr: {
      "menu.newGame":"Nouvelle Partie","menu.newGameSub":"Choisir les joueurs et commencer",
      "menu.tournament":"Tournoi","menu.tournamentSub":"Tableau éliminatoire automatique",
      "menu.players":"Joueurs","menu.playersSub":"Gérer et voir les statistiques",
      "menu.history":"Historique","menu.historySub":"Parties précédentes",
      "menu.data":"Données","menu.dataSub":"Exporter ou importer une sauvegarde",
      "menu.footer":"données enregistrées uniquement sur cet appareil",
      "screen.players":"Joueurs","screen.history":"Historique",
      "screen.gameDetail":"Détail de la Partie","screen.newGame":"Nouvelle Partie",
      "screen.gameType":"Type de Jeu","screen.pointsFormat":"Points et Format",
      "screen.newTournament":"Nouveau Tournoi","screen.tournament":"Tournoi",
      "screen.minigames":"Mini-Jeux","screen.achievements":"Succès",
      "screen.records":"Records","screen.data":"Données",
      "btn.addPlayer":"＋ Nouveau","btn.deletePlayer":"Supprimer",
      "btn.abandon":"Abandonner","btn.continue":"Continuer ▸",
      "btn.startGame":"Démarrer la Partie","btn.createTournament":"Créer le Tournoi",
      "btn.backMenu":"Retour au Menu","btn.start":"Commencer",
      "serve.title":"SERVICE","serve.hint":"sert en premier",
      "setup.bluePlayer":"Côté Bleu","setup.whitePlayer":"Côté Blanc",
      "setup.pointsPerSet":"Points par manche","setup.format":"Format",
      "mg.tap":"Frappes Rapides","mg.tapSub":"Tapez les points avant qu'ils disparaissent",
      "mg.memory":"Mémoire Visuelle","mg.memorySub":"Mémorisez et répétez la séquence",
      "ach.unlocked":"🏆 SUCCÈS DÉBLOQUÉ !",
      "data.export":"Exporter la sauvegarde","data.exportSub":"Génère un fichier .json avec tout",
      "data.import":"Importer une sauvegarde","data.importSub":"Ajouter ou fusionner des données",
      "data.wipe":"Effacer toutes les données","data.wipeSub":"Supprime les joueurs et l'historique",
      "js.choosePlayer":"Choisir un joueur","js.sideBlue":"Bleu","js.sideWhite":"Blanc","js.continue":"Continuer quand même ▸",
      "js.nextSet":"Manche suivante ▸","js.undoMsg":"Dernier point annulé — vous pouvez continuer.",
      "js.setInProgress":"La manche en cours (%b-%w) ne sera pas comptée. Les manches terminées sont sauvegardées.",
      "js.confirmEnd":"Le résultat actuel sera enregistré dans l'historique.",
      "js.confirmWipe":"Effacer toutes les données ?","js.confirmAbandon":"Abandonner le tournoi ?",
      "js.emptyPlayers":"Créez des joueurs d'abord.","js.noData":"Pas encore de données",
      "js.wins":"victoires","js.losses":"défaites","js.draws":"nuls","js.capotes":"blancs",
      "js.winRate":"V%","js.elo":"Classement",
      "js.allPlayers":"Tous les joueurs",
      "js.serve":"Sert","js.notServe":"Ne sert pas",
      "js.set":"Manche","js.bestOf":"Au meilleur de","js.free":"Libre",
      "js.classic":"Classique","js.custom":"Personnalisé",
      "js.gameWon":"%n a gagné la partie","js.setWon":"%n a gagné la manche",
      "js.deuce":"ÉGALITÉ","js.matchPoint":"BALLE DE MATCH",
      "js.capoteTag":"Blanc","js.newRecord":"🏆 Nouveau record !",
      "js.points":"Points","js.level":"Niveau","js.levelReached":"Niveau atteint",
      "js.playAgain":"Rejouer",
      "js.tbd":"À définir","js.play":"▶ JOUER",
      "js.whoseServe":"Manche %n · qui sert en premier ?",
      "js.champion":"🏆 Champion du Tournoi",
      "js.winsLabel":"V","js.lossesLabel":"D","js.drawsLabel":"N",
      "js.capotesLabel":"Bl.","js.winRateLabel":"V%","js.eloLabel":"Class.",
      "js.bestRival":"Meilleur rival","js.worstRival":"Pire rival",
      "js.last10":"10 dernières parties","js.streak":"Série actuelle",
      "js.setsWon":"Manches gagnées","js.setsLost":"Manches perdues",
      "js.capotesMade":"Blancs réalisés","js.capotesSuffered":"Blancs encaissés",
      "js.tournamentsWon":"Tournois gagnés","js.tournamentsPlayed":"Tournois joués",
      "js.trainingMin":"min. d'entraînement","js.trainingSessions":"séances",
      "js.importReplace":"Tout remplacer","js.importMerge":"Ajouter aux données existantes",
      "js.importDetailFile":"Le fichier contient %p joueurs et %g parties.",
      "js.importDetailMerge":"<strong>Ajouter</strong> apporte %np nouveaux joueurs et %ng nouvelles parties (noms identiques fusionnés ; doublons ignorés).",
      "js.importDetailReplace":"<strong>Tout remplacer</strong> supprime les %p joueurs et %g parties actuels et garde uniquement le fichier.",
      "js.recElo":"Meilleur Classement","js.recStreak":"Plus Longue Série","js.recWins":"Plus de Victoires",
      "js.recCapotes":"Plus de Blancs","js.recTournaments":"Plus de Tournois Gagnés",
      "js.recPoints":"Plus de Points Marqués","js.recDuration":"Partie la Plus Longue",
      "js.recMgTap":"Record Frappes Rapides","js.recMgMemory":"Record Mémoire",
      "js.recEloGain":"Plus Grande Progression",
      "js.wins_unit":"victoires","js.min_unit":"min","js.pts_unit":"pts",
      "js.roundQF":"Quarts de finale","js.roundSF":"Demi-finales","js.roundF":"Finale",
      "js.serveEvery2":"Service tous les 2 points","js.serveEvery5":"Service tous les 5 points",
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
    },
    de: {
      "menu.newGame":"Neues Spiel","menu.newGameSub":"Spieler wählen und starten",
      "menu.tournament":"Turnier","menu.tournamentSub":"K.o.-System, automatisch gesetzt",
      "menu.players":"Spieler","menu.playersSub":"Verwalten und Statistiken ansehen",
      "menu.history":"Verlauf","menu.historySub":"Vergangene Spiele",
      "menu.data":"Daten","menu.dataSub":"Backup exportieren oder importieren",
      "menu.footer":"Daten nur auf diesem Gerät gespeichert",
      "screen.players":"Spieler","screen.history":"Verlauf",
      "screen.gameDetail":"Spieldetail","screen.newGame":"Neues Spiel",
      "screen.gameType":"Spieltyp","screen.pointsFormat":"Punkte und Format",
      "screen.newTournament":"Neues Turnier","screen.tournament":"Turnier",
      "screen.minigames":"Minispiele","screen.achievements":"Erfolge",
      "screen.records":"Rekorde","screen.data":"Daten",
      "btn.addPlayer":"＋ Neu","btn.deletePlayer":"Löschen",
      "btn.abandon":"Abbrechen","btn.continue":"Weiter ▸",
      "btn.startGame":"Spiel starten","btn.createTournament":"Turnier erstellen",
      "btn.backMenu":"Zurück zum Menü","btn.start":"Starten",
      "serve.title":"AUFSCHLAG","serve.hint":"schlägt auf",
      "setup.bluePlayer":"Blaue Seite","setup.whitePlayer":"Weiße Seite",
      "setup.pointsPerSet":"Punkte pro Satz","setup.format":"Format",
      "mg.tap":"Schnelle Tipper","mg.tapSub":"Tippe die Punkte bevor sie verschwinden",
      "mg.memory":"Visuelles Gedächtnis","mg.memorySub":"Merken und Sequenz wiederholen",
      "ach.unlocked":"🏆 ERFOLG FREIGESCHALTET!",
      "data.export":"Backup exportieren","data.exportSub":"Erzeugt eine .json-Datei mit allem",
      "data.import":"Backup importieren","data.importSub":"Daten hinzufügen oder zusammenführen",
      "data.wipe":"Alle Daten löschen","data.wipeSub":"Entfernt Spieler und Verlauf von diesem Gerät",
      "js.choosePlayer":"Spieler wählen","js.sideBlue":"Blau","js.sideWhite":"Weiß","js.continue":"Trotzdem weiter ▸",
      "js.nextSet":"Nächster Satz ▸","js.undoMsg":"Letzter Punkt zurückgenommen — du kannst weiterspielen.",
      "js.setInProgress":"Der laufende Satz (%b-%w) wird nicht gezählt. Abgeschlossene Sätze bleiben im Verlauf.",
      "js.confirmEnd":"Das aktuelle Ergebnis wird im Verlauf gespeichert.",
      "js.confirmWipe":"Alle Daten löschen?","js.confirmAbandon":"Turnier abbrechen?",
      "js.emptyPlayers":"Erst Spieler anlegen.","js.noData":"Noch keine Daten",
      "js.wins":"Siege","js.losses":"Niederlagen","js.draws":"Unentschieden","js.capotes":"Klatsche",
      "js.winRate":"S%","js.elo":"Rating",
      "js.allPlayers":"Alle Spieler",
      "js.serve":"Aufschlag","js.notServe":"Kein Aufschlag",
      "js.set":"Satz","js.bestOf":"Best of","js.free":"Offen",
      "js.classic":"Klassisch","js.custom":"Benutzerdefiniert",
      "js.gameWon":"%n hat das Spiel gewonnen","js.setWon":"%n hat den Satz gewonnen",
      "js.deuce":"EINSTAND","js.matchPoint":"MATCHBALL",
      "js.capoteTag":"Klatsche","js.newRecord":"🏆 Neuer Rekord!",
      "js.points":"Punkte","js.level":"Level","js.levelReached":"Erreichtes Level",
      "js.playAgain":"Nochmal spielen",
      "js.tbd":"Noch offen","js.play":"▶ SPIELEN",
      "js.whoseServe":"Satz %n · wer schlägt auf?",
      "js.champion":"🏆 Turniersieger",
      "js.winsLabel":"S","js.lossesLabel":"N","js.drawsLabel":"U",
      "js.capotesLabel":"Kl.","js.winRateLabel":"S%","js.eloLabel":"Rating",
      "js.bestRival":"Bester Gegner","js.worstRival":"Schlechtester Gegner",
      "js.last10":"Letzte 10 Spiele","js.streak":"Aktuelle Serie",
      "js.setsWon":"Gewonnene Sätze","js.setsLost":"Verlorene Sätze",
      "js.capotesMade":"Klatschen gegeben","js.capotesSuffered":"Klatschen erhalten",
      "js.tournamentsWon":"Gewonnene Turniere","js.tournamentsPlayed":"Gespielte Turniere",
      "js.trainingMin":"Min. Training","js.trainingSessions":"Einheiten",
      "js.importReplace":"Alles ersetzen","js.importMerge":"Zu vorhandenen Daten hinzufügen",
      "js.importDetailFile":"Die Datei hat %p Spieler und %g Spiele.",
      "js.importDetailMerge":"<strong>Hinzufügen</strong> bringt %np neue Spieler und %ng neue Spiele (gleiche Namen werden zusammengeführt; Duplikate ignoriert).",
      "js.importDetailReplace":"<strong>Alles ersetzen</strong> löscht die aktuellen %p Spieler und %g Spiele und behält nur die Datei.",
      "js.recElo":"Höchstes Rating","js.recStreak":"Längste Serie","js.recWins":"Meiste Siege",
      "js.recCapotes":"Meiste Klatschen","js.recTournaments":"Meiste Turniersiege",
      "js.recPoints":"Meiste Punkte","js.recDuration":"Längstes Spiel",
      "js.recMgTap":"Schnelle-Tipper-Rekord","js.recMgMemory":"Gedächtnis-Rekord",
      "js.recEloGain":"Größter Rating-Anstieg",
      "js.wins_unit":"Siege","js.min_unit":"Min","js.pts_unit":"Pkt",
      "js.roundQF":"Viertelfinale","js.roundSF":"Halbfinale","js.roundF":"Finale",
      "js.serveEvery2":"Aufschlag alle 2 Punkte","js.serveEvery5":"Aufschlag alle 5 Punkte",
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
    },
    zh: {
      "menu.newGame":"新局","menu.newGameSub":"选择球员并开始",
      "menu.tournament":"锦标赛","menu.tournamentSub":"单淘汰赛，自动分组",
      "menu.players":"球员","menu.playersSub":"管理和查看统计数据",
      "menu.history":"历史","menu.historySub":"以往比赛",
      "menu.data":"数据","menu.dataSub":"导出或导入备份",
      "menu.footer":"数据仅保存在此设备上",
      "screen.players":"球员","screen.history":"历史",
      "screen.gameDetail":"比赛详情","screen.newGame":"新局",
      "screen.gameType":"赛制","screen.pointsFormat":"分制与赛制",
      "screen.newTournament":"新锦标赛","screen.tournament":"锦标赛",
      "screen.minigames":"小游戏","screen.achievements":"成就",
      "screen.records":"纪录","screen.data":"数据",
      "btn.addPlayer":"＋ 新增","btn.deletePlayer":"删除",
      "btn.abandon":"放弃","btn.continue":"继续 ▸",
      "btn.startGame":"开始比赛","btn.createTournament":"创建锦标赛",
      "btn.backMenu":"返回菜单","btn.start":"开始",
      "serve.title":"发球","serve.hint":"先发球",
      "setup.bluePlayer":"蓝方","setup.whitePlayer":"白方",
      "setup.pointsPerSet":"每局分数","setup.format":"赛制",
      "mg.tap":"快速点击","mg.tapSub":"在点消失前点击",
      "mg.memory":"视觉记忆","mg.memorySub":"记忆并重复序列",
      "ach.unlocked":"🏆 成就解锁！",
      "data.export":"导出备份","data.exportSub":"生成包含所有数据的 .json 文件",
      "data.import":"导入备份","data.importSub":"添加或合并备份数据",
      "data.wipe":"清除所有数据","data.wipeSub":"从此设备移除球员和历史记录",
      "js.choosePlayer":"选择球员","js.sideBlue":"蓝方","js.sideWhite":"白方","js.continue":"仍然继续 ▸",
      "js.nextSet":"下一局 ▸","js.undoMsg":"最后一分已撤销 — 可以继续比赛。",
      "js.setInProgress":"当前局（%b-%w）不计入成绩。已结束的局保存在历史中。",
      "js.confirmEnd":"当前结果将保存到历史记录。",
      "js.confirmWipe":"清除所有数据？","js.confirmAbandon":"放弃锦标赛？",
      "js.emptyPlayers":"请先创建球员。","js.noData":"暂无数据",
      "js.wins":"胜","js.losses":"负","js.draws":"平","js.capotes":"11-0",
      "js.winRate":"胜率","js.elo":"积分",
      "js.allPlayers":"所有球员",
      "js.serve":"发球","js.notServe":"接球",
      "js.set":"局","js.bestOf":"三局两胜制 /","js.free":"自由",
      "js.classic":"标准","js.custom":"自定义",
      "js.gameWon":"%n 赢得比赛","js.setWon":"%n 赢得该局",
      "js.deuce":"平分","js.matchPoint":"赛点",
      "js.capoteTag":"11-0","js.newRecord":"🏆 新纪录！",
      "js.points":"分数","js.level":"等级","js.levelReached":"达到等级",
      "js.playAgain":"再玩一次",
      "js.tbd":"待定","js.play":"▶ 开始",
      "js.whoseServe":"第 %n 局 · 谁先发球？",
      "js.champion":"🏆 锦标赛冠军",
      "js.winsLabel":"胜","js.lossesLabel":"负","js.drawsLabel":"平",
      "js.capotesLabel":"11-0","js.winRateLabel":"胜率","js.eloLabel":"积分",
      "js.bestRival":"最佳对手","js.worstRival":"最差对手",
      "js.last10":"最近10场","js.streak":"当前连胜",
      "js.setsWon":"赢得的局","js.setsLost":"失去的局",
      "js.capotesMade":"11-0 胜","js.capotesSuffered":"被11-0",
      "js.tournamentsWon":"锦标赛冠军","js.tournamentsPlayed":"参加锦标赛",
      "js.trainingMin":"分钟训练","js.trainingSessions":"次训练",
      "js.importReplace":"替换所有","js.importMerge":"添加到现有数据",
      "js.importDetailFile":"文件包含 %p 名玩家和 %g 场游戏。",
      "js.importDetailMerge":"<strong>添加</strong>将带来 %np 名新玩家和 %ng 场新游戏（相同名称合并；重复忽略）。",
      "js.importDetailReplace":"<strong>替换所有</strong>将删除当前 %p 名玩家和 %g 场游戏，仅保留文件内容。",
      "js.recElo":"最高积分","js.recStreak":"最长连胜","js.recWins":"最多胜场",
      "js.recCapotes":"最多11-0","js.recTournaments":"最多锦标赛冠军",
      "js.recPoints":"最多得分","js.recDuration":"最长比赛",
      "js.recMgTap":"快速点击纪录","js.recMgMemory":"记忆纪录",
      "js.recEloGain":"最大积分增长",
      "js.wins_unit":"胜","js.min_unit":"分钟","js.pts_unit":"分",
      "js.roundQF":"四分之一决赛","js.roundSF":"半决赛","js.roundF":"决赛",
      "js.serveEvery2":"每2分换发球","js.serveEvery5":"每5分换发球",
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
    },

    ja: {
      "menu.newGame":"新しいゲーム","menu.newGameSub":"プレイヤーを選んで開始",
      "menu.tournament":"トーナメント","menu.tournamentSub":"自動シードによる決勝トーナメント",
      "menu.players":"プレイヤー","menu.playersSub":"管理と統計表示",
      "menu.history":"履歴","menu.historySub":"過去の試合",
      "menu.data":"データ","menu.dataSub":"バックアップのエクスポートまたはインポート",
      "menu.footer":"データはこの端末にのみ保存されます",
      "screen.players":"プレイヤー","screen.history":"履歴",
      "screen.gameDetail":"試合詳細","screen.newGame":"新しいゲーム",
      "screen.gameType":"ゲームタイプ","screen.pointsFormat":"得点とフォーマット",
      "screen.newTournament":"新しいトーナメント","screen.tournament":"トーナメント",
      "screen.minigames":"ミニゲーム","screen.achievements":"実績",
      "screen.records":"記録","screen.data":"データ",
      "btn.addPlayer":"＋ 新規","btn.deletePlayer":"削除",
      "btn.abandon":"棄権","btn.continue":"続ける ▸",
      "btn.startGame":"試合開始","btn.createTournament":"トーナメント作成",
      "btn.backMenu":"メニューに戻る","btn.start":"開始",
      "serve.title":"サービス","serve.hint":"が先にサービス",
      "setup.bluePlayer":"青サイド","setup.whitePlayer":"白サイド",
      "setup.pointsPerSet":"1ゲームの得点","setup.format":"フォーマット",
      "mg.tap":"クイックタップ","mg.tapSub":"消える前に点をタップ",
      "mg.memory":"視覚記憶","mg.memorySub":"シーケンスを覚えて繰り返す",
      "ach.unlocked":"🏆 実績解除！",
      "data.export":"バックアップを書き出す","data.exportSub":"すべてを含む .json ファイルを生成",
      "data.import":"バックアップを読み込む","data.importSub":"バックアップからデータを追加または統合",
      "data.wipe":"全データを削除","data.wipeSub":"この端末からプレイヤーと履歴を削除",
      "js.choosePlayer":"プレイヤーを選択","js.sideBlue":"青","js.sideWhite":"白","js.continue":"このまま続ける ▸",
      "js.nextSet":"次のゲーム ▸","js.undoMsg":"最後の得点を取り消しました。試合を続けてください。",
      "js.setInProgress":"進行中のゲーム（%b-%w）はカウントされません。終了したゲームは履歴に保存されます。",
      "js.confirmEnd":"現在の結果が履歴に保存されます。",
      "js.confirmWipe":"全データを削除しますか？","js.confirmAbandon":"トーナメントを棄権しますか？",
      "js.emptyPlayers":"先にプレイヤーを作成してください。","js.noData":"データなし",
      "js.wins":"勝","js.losses":"敗","js.draws":"分","js.capotes":"完封",
      "js.winRate":"勝率","js.elo":"レーティング",
      "js.allPlayers":"全プレイヤー",
      "js.serve":"サービス","js.notServe":"レシーブ",
      "js.set":"ゲーム","js.bestOf":"先取","js.free":"フリー",
      "js.classic":"クラシック","js.custom":"カスタム",
      "js.gameWon":"%n がマッチ勝利","js.setWon":"%n がゲーム勝利",
      "js.deuce":"デュース","js.matchPoint":"マッチポイント",
      "js.capoteTag":"完封","js.newRecord":"🏆 新記録！",
      "js.points":"得点","js.level":"レベル","js.levelReached":"到達レベル",
      "js.playAgain":"もう一度",
      "js.tbd":"未定","js.play":"▶ プレイ",
      "js.whoseServe":"第%nゲーム · 最初のサービスは？",
      "js.champion":"🏆 トーナメント優勝者",
      "js.winsLabel":"勝","js.lossesLabel":"敗","js.drawsLabel":"分",
      "js.capotesLabel":"完封","js.winRateLabel":"勝率","js.eloLabel":"R",
      "js.bestRival":"得意な相手","js.worstRival":"苦手な相手",
      "js.last10":"直近10試合","js.streak":"現在の連勝",
      "js.setsWon":"獲得ゲーム","js.setsLost":"失ゲーム",
      "js.capotesMade":"完封勝利","js.capotesSuffered":"完封負け",
      "js.tournamentsWon":"優勝回数","js.tournamentsPlayed":"参加トーナメント",
      "js.trainingMin":"分 練習","js.trainingSessions":"セッション",
      "js.importReplace":"すべて置き換え","js.importMerge":"既存データに追加",
      "js.importDetailFile":"ファイルには %p 人のプレイヤーと %g 試合が含まれます。",
      "js.importDetailMerge":"<strong>追加</strong>すると %np 人の新プレイヤーと %ng 試合が追加されます（同名は統合；重複は無視）。",
      "js.importDetailReplace":"<strong>すべて置き換え</strong>は現在の %p 人と %g 試合を削除し、ファイルの内容のみ残します。",
      "js.recElo":"最高レーティング","js.recStreak":"最長連勝","js.recWins":"最多勝利",
      "js.recCapotes":"最多完封","js.recTournaments":"最多優勝",
      "js.recPoints":"最多得点","js.recDuration":"最長試合",
      "js.recMgTap":"クイックタップ記録","js.recMgMemory":"記憶ゲーム記録",
      "js.recEloGain":"最大レーティング上昇",
      "js.wins_unit":"勝","js.min_unit":"分","js.pts_unit":"点",
      "js.roundQF":"準々決勝","js.roundSF":"準決勝","js.roundF":"決勝",
      "js.serveEvery2":"2点ごとにサービス交代","js.serveEvery5":"5点ごとにサービス交代",
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
    },
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
    // textContent
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (val) el.textContent = val;
    });
    // title attributes (tooltips)
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      const val = t(key);
      if (val) el.title = val;
    });
    // placeholders
    const descInput = document.getElementById("input-game-description");
    if (descInput) descInput.placeholder = t("js.descPlaceholder");
    const playerInput = document.getElementById("input-player-name");
    if (playerInput) playerInput.placeholder = "Ex: Miguel";
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
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${min}`;
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
  document.getElementById("btn-data").addEventListener("click", () => {
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
              <span class="history-row-score">${r.gamesWon}V – ${r.gamesLost}D${r.gamesDrawn ? ` – ${r.gamesDrawn}E` : ""}</span>
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
        <button class="color-swatch color-swatch--blue-white"   data-color="blue-white"   title="Azul / Branco"></button>
        <button class="color-swatch color-swatch--green-white"  data-color="green-white"  title="Verde / Branco"></button>
        <button class="color-swatch color-swatch--red-white"    data-color="red-white"    title="Vermelho / Branco"></button>
        <button class="color-swatch color-swatch--pink-white"   data-color="pink-white"   title="Rosa / Branco"></button>
        <button class="color-swatch color-swatch--purple-white" data-color="purple-white" title="Roxo / Branco"></button>
        <button class="color-swatch color-swatch--gold-white"   data-color="gold-white"   title="Dourado / Branco"></button>
        <button class="color-swatch color-swatch--white-black"  data-color="white-black"  title="Branco / Preto"></button>
        <button class="color-swatch color-swatch--orange-white" data-color="orange-white" title="Laranja / Branco"></button>
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
          <p>Ainda não tens jogadores criados.<br>Volta ao menu e cria jogadores primeiro.</p>
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

  function showGameEndOverlay(record) {
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
    document.getElementById("ach-toast-name").textContent=ach.secret?"???":ach.name;
    document.getElementById("ach-toast-desc").textContent=ach.secret?t("js.achSecret"):ach.desc;
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
        card.innerHTML=`<div class="ach-icon">${isSec?"🔒":ach.icon}</div><div class="ach-info"><div class="ach-name">${isSec?"???":escapeHTML(ach.name)}</div><div class="ach-desc">${isSec?t("js.achSecretDesc"):escapeHTML(ach.desc)}</div>${isU&&uAt?`<div class="ach-date">${formatDate(uAt)}</div>`:""} ${ach.progressive&&prog!==null&&!isU?`<div class="ach-prog-wrap"><div class="ach-prog-bar" style="width:${Math.min(100,prog/ach.total*100)}%"></div><span class="ach-prog-lbl">${prog} / ${ach.total}</span></div>`:""}</div>`;
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
