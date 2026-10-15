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
      activeGame: null,  // jogo em curso (para retomar)
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
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
    updateRotateHint();
  }

  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => showScreen(btn.dataset.back));
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

  function checkResumeBanner() {
    const banner = document.getElementById("menu-resume");
    if (DATA.activeGame) {
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  }
  document.getElementById("btn-resume").addEventListener("click", () => {
    if (DATA.activeGame) {
      resumeGameUI();
      showScreen("screen-game");
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
          <p>Ainda não tens jogadores.<br>Toca em "＋ Novo" para adicionar o primeiro.</p>
        </div>`;
      return;
    }

    DATA.players
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "pt"))
      .forEach((p) => {
        const stats = computePlayerStats(p.id);
        const card = document.createElement("button");
        card.className = "player-card";
        card.innerHTML = `
          <div class="player-avatar">${playerInitials(p.name)}</div>
          <div class="player-info">
            <strong>${escapeHTML(p.name)}</strong>
            <span>${stats.gamesPlayed} jogos · ${stats.winRate}% vitórias</span>
          </div>
          <div class="player-chevron">›</div>
        `;
        card.addEventListener("click", () => openPlayerProfile(p.id));
        list.appendChild(card);
      });
  }

  function escapeHTML(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  document.getElementById("btn-add-player").addEventListener("click", openNewPlayerOverlay);

  function openNewPlayerOverlay() {
    const overlay = document.getElementById("overlay-new-player");
    const input = document.getElementById("input-player-name");
    input.value = "";
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

  function saveNewPlayer() {
    const input = document.getElementById("input-player-name");
    const name = input.value.trim();
    if (!name) return;
    const player = {
      id: uid("player"),
      name: name,
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
    const content = document.getElementById("profile-content");

    const recentGames = DATA.games
      .filter((g) => g.blue.playerId === playerId || g.white.playerId === playerId)
      .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
      .slice(0, 10);

    let historyHTML = "";
    if (recentGames.length === 0) {
      historyHTML = `<div class="empty-state"><p>Sem jogos registados ainda.</p></div>`;
    } else {
      historyHTML = recentGames
        .map((g) => {
          const isBlue = g.blue.playerId === playerId;
          const me = isBlue ? g.blue : g.white;
          const opp = isBlue ? g.white : g.blue;
          const won = g.winnerSide === (isBlue ? "blue" : "white");
          const oppName = opp.playerId ? getPlayer(opp.playerId)?.name || "—" : "—";
          return `
            <div class="history-row">
              <span class="history-row-result ${won ? "history-row-result--win" : "history-row-result--loss"}"></span>
              <div class="history-row-main">
                <strong>${won ? "Venceu" : "Perdeu"} vs ${escapeHTML(oppName)}</strong>
                <small>${formatDate(g.endedAt)} · ${g.pointsTarget} pts</small>
              </div>
              <span class="history-row-score">${me.setsWon}-${opp.setsWon}</span>
            </div>`;
        })
        .join("");
    }

    content.innerHTML = `
      <div class="profile-stats-grid">
        <div class="stat-box"><strong>${stats.gamesPlayed}</strong><span>Jogos disputados</span></div>
        <div class="stat-box stat-box--accent"><strong>${stats.winRate}%</strong><span>Win rate</span></div>
        <div class="stat-box"><strong>${stats.wins}</strong><span>Vitórias</span></div>
        <div class="stat-box"><strong>${stats.losses}</strong><span>Derrotas</span></div>
        <div class="stat-box"><strong>${stats.setsWon}</strong><span>Sets ganhos</span></div>
        <div class="stat-box"><strong>${stats.capotes}</strong><span>Capotes feitos</span></div>
      </div>
      <p class="section-label">Últimos jogos</p>
      ${historyHTML}
    `;
    showScreen("screen-player-profile");
  }

  function computePlayerStats(playerId) {
    const games = DATA.games.filter(
      (g) => g.blue.playerId === playerId || g.white.playerId === playerId
    );
    let wins = 0, losses = 0, setsWon = 0, setsLost = 0, capotes = 0;

    games.forEach((g) => {
      const isBlue = g.blue.playerId === playerId;
      const me = isBlue ? g.blue : g.white;
      const opp = isBlue ? g.white : g.blue;
      setsWon += me.setsWon;
      setsLost += opp.setsWon;
      if (g.winnerSide === (isBlue ? "blue" : "white")) wins++;
      else losses++;
      g.sets.forEach((s) => {
        if (s.capote && s.winnerSide === (isBlue ? "blue" : "white")) capotes++;
      });
    });

    const gamesPlayed = games.length;
    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
    return { gamesPlayed, wins, losses, setsWon, setsLost, capotes, winRate };
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
          <p>Ainda não há jogos no histórico.<br>Joga a primeira partida para a veres aqui.</p>
        </div>`;
      return;
    }

    DATA.games
      .slice()
      .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
      .forEach((g) => {
        const blueName = g.blue.playerId ? getPlayer(g.blue.playerId)?.name || "Jogador" : "Jogador";
        const whiteName = g.white.playerId ? getPlayer(g.white.playerId)?.name || "Jogador" : "Jogador";
        const blueWon = g.winnerSide === "blue";
        const card = document.createElement("button");
        card.className = "history-card";
        card.style.width = "100%";
        card.style.textAlign = "left";
        card.innerHTML = `
          <div class="history-card-top">
            <span class="history-card-date">${formatDate(g.endedAt)}</span>
            <span class="history-card-format">${g.pointsTarget} PTS · ${formatModeLabel(g.format)}</span>
          </div>
          <div class="history-card-matchup">
            <div class="history-side history-side--blue">
              <span class="history-side-name ${blueWon ? "is-winner" : ""}">${escapeHTML(blueName)}</span>
              <span class="history-side-sets">${g.blue.setsWon}</span>
            </div>
            <span class="history-card-sep">SETS</span>
            <div class="history-side history-side--white history-side--right">
              <span class="history-side-name ${!blueWon ? "is-winner" : ""}">${escapeHTML(whiteName)}</span>
              <span class="history-side-sets">${g.white.setsWon}</span>
            </div>
          </div>
        `;
        card.addEventListener("click", () => openGameDetail(g.id));
        list.appendChild(card);
      });
  }

  function formatModeLabel(format) {
    if (format === "3") return "MD3";
    if (format === "5") return "MD5";
    return "LIVRE";
  }

  function openGameDetail(gameId) {
    const g = DATA.games.find((x) => x.id === gameId);
    if (!g) return;
    const blueName = g.blue.playerId ? getPlayer(g.blue.playerId)?.name || "Jogador" : "Jogador";
    const whiteName = g.white.playerId ? getPlayer(g.white.playerId)?.name || "Jogador" : "Jogador";
    const blueWon = g.winnerSide === "blue";

    const setsHTML = g.sets
      .map((s, i) => {
        const winnerName = s.winnerSide === "blue" ? blueName : whiteName;
        return `
          <div class="set-row">
            <span class="set-row-num">SET ${i + 1}</span>
            <span class="set-row-score">${s.blueScore} – ${s.whiteScore}</span>
            <span class="set-row-winner">${winnerName}${s.capote ? '<span class="capote-tag">Capote</span>' : ""}</span>
          </div>`;
      })
      .join("");

    document.getElementById("game-detail-content").innerHTML = `
      <div class="detail-header">
        <div class="detail-matchup">
          <span class="detail-name">${escapeHTML(blueName)}</span>
          <span class="detail-score">${g.blue.setsWon} – ${g.white.setsWon}</span>
          <span class="detail-name">${escapeHTML(whiteName)}</span>
        </div>
        <p class="detail-sub">${formatDate(g.endedAt)} · ${g.pointsTarget} pontos por set · ${formatModeLabel(g.format)} · duração ${formatClock(g.durationSeconds)}</p>
      </div>
      <p class="section-label">Sets (${blueWon ? escapeHTML(blueName) : escapeHTML(whiteName)} venceu o jogo)</p>
      ${setsHTML}
    `;
    showScreen("screen-game-detail");
  }

  /* ---------------------------------------------------------
     SETUP DE NOVO JOGO
     --------------------------------------------------------- */
  let setup = {
    bluePlayerId: null,
    whitePlayerId: null,
    points: 11,
    format: "free"
  };

  function openSetup() {
    setup = { bluePlayerId: null, whitePlayerId: null, points: 11, format: "free" };
    updateSetupUI();
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
      bluePick.innerHTML = `<span>Escolher jogador</span>`;
    }

    if (setup.whitePlayerId) {
      const p = getPlayer(setup.whitePlayerId);
      whitePick.classList.add("is-filled");
      whitePick.innerHTML = `<span>${escapeHTML(p.name)}</span>`;
    } else {
      whitePick.classList.remove("is-filled");
      whitePick.innerHTML = `<span>Escolher jogador</span>`;
    }

    document.querySelectorAll("#opt-points .setup-option").forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.points) === setup.points);
    });
    document.querySelectorAll("#opt-format .setup-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.format === setup.format);
    });

    const confirmBtn = document.getElementById("btn-confirm-setup");
    const ready = setup.bluePlayerId && setup.whitePlayerId && setup.bluePlayerId !== setup.whitePlayerId;
    confirmBtn.disabled = !ready;
  }

  document.querySelectorAll("#opt-points .setup-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      setup.points = Number(btn.dataset.points);
      updateSetupUI();
    });
  });
  document.querySelectorAll("#opt-format .setup-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      setup.format = btn.dataset.format;
      updateSetupUI();
    });
  });

  let pickTarget = null; // "blue" | "white"
  document.getElementById("pick-blue").addEventListener("click", () => openPicker("blue"));
  document.getElementById("pick-white").addEventListener("click", () => openPicker("white"));
  document.getElementById("btn-cancel-pick").addEventListener("click", () => showScreen("screen-setup"));

  function openPicker(side) {
    pickTarget = side;
    document.getElementById("pick-player-title").textContent =
      side === "blue" ? "Escolher — Lado Azul" : "Escolher — Lado Branco";

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
      startNewGame(setup.bluePlayerId, setup.whitePlayerId, setup.points, setup.format);
    }
  });

  /* ---------------------------------------------------------
     LÓGICA DO JOGO (placar, sets, capote, cronómetro)
     --------------------------------------------------------- */
  let game = null;       // estado do jogo em curso
  let timerInterval = null;

  function startNewGame(bluePlayerId, whitePlayerId, points, format) {
    game = {
      id: uid("game"),
      bluePlayerId,
      whitePlayerId,
      pointsTarget: points,
      format,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      paused: false,
      currentBlue: 0,
      currentWhite: 0,
      sets: [],          // sets já fechados: { blueScore, whiteScore, winnerSide, capote }
      blueSetsWon: 0,
      whiteSetsWon: 0
    };
    persistActiveGame();
    resumeGameUI();
    showScreen("screen-game");
  }

  function persistActiveGame() {
    DATA.activeGame = game;
    saveData();
  }

  function resumeGameUI() {
    game = DATA.activeGame;
    if (!game) return;

    const blueName = getPlayer(game.bluePlayerId)?.name || "Azul";
    const whiteName = getPlayer(game.whitePlayerId)?.name || "Branco";
    document.getElementById("name-blue").textContent = blueName;
    document.getElementById("name-white").textContent = whiteName;

    renderScores();
    startTimerLoop();
  }

  function renderScores() {
    document.getElementById("score-blue").textContent = game.currentBlue;
    document.getElementById("score-white").textContent = game.currentWhite;
    document.querySelector("#sets-blue .sets-num").textContent = game.blueSetsWon;
    document.querySelector("#sets-white .sets-num").textContent = game.whiteSetsWon;
    document.getElementById("timer").textContent = formatClock(game.elapsedSeconds);
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

  // histórico de ações para permitir "anular último ponto"
  let pointHistory = [];

  document.getElementById("half-blue").addEventListener("click", () => addPoint("blue"));
  document.getElementById("half-white").addEventListener("click", () => addPoint("white"));

  function addPoint(side) {
    if (!game || game.paused) return;
    pointHistory.push(side);
    if (side === "blue") game.currentBlue++;
    else game.currentWhite++;
    renderScores();
    persistActiveGame();
    checkSetEnd();
  }

  document.getElementById("btn-undo").addEventListener("click", () => {
    if (!game || pointHistory.length === 0) return;
    const last = pointHistory.pop();
    if (last === "blue" && game.currentBlue > 0) game.currentBlue--;
    if (last === "white" && game.currentWhite > 0) game.currentWhite--;
    renderScores();
    persistActiveGame();
  });

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

    // regra especial de "capote": só em jogos de 21 pontos.
    // Se um jogador chega aos 11 pontos e o adversário continua a 0,
    // o set termina imediatamente como capote.
    if (!winnerSide && target === 21) {
      if (blue >= 11 && white === 0) {
        winnerSide = "blue";
        isCapote = true;
      } else if (white >= 11 && blue === 0) {
        winnerSide = "white";
        isCapote = true;
      }
    }

    if (!winnerSide) return; // set continua

    // fecha o set
    const closedSet = {
      blueScore: blue,
      whiteScore: white,
      winnerSide,
      capote: isCapote
    };
    game.sets.push(closedSet);
    if (winnerSide === "blue") game.blueSetsWon++;
    else game.whiteSetsWon++;

    game.currentBlue = 0;
    game.currentWhite = 0;
    pointHistory = [];
    persistActiveGame();
    renderScores();

    showSetEndOverlay(closedSet, winnerSide);
  }

  function showSetEndOverlay(closedSet, winnerSide) {
    const winnerName =
      winnerSide === "blue"
        ? getPlayer(game.bluePlayerId)?.name || "Azul"
        : getPlayer(game.whitePlayerId)?.name || "Branco";

    document.getElementById("set-end-eyebrow").textContent = closedSet.capote ? "FIM DO SET · CAPOTE" : "FIM DO SET";
    document.getElementById("set-end-winner").textContent = `${winnerName} venceu o set`;
    document.getElementById("set-end-detail").textContent = `${closedSet.blueScore} — ${closedSet.whiteScore}`;

    const recap = document.getElementById("set-end-recap");
    recap.innerHTML = game.sets
      .map((s, i) => {
        const cls = s.capote ? "recap-pill is-capote" : "recap-pill";
        return `<span class="${cls}">Set ${i + 1}: ${s.blueScore}-${s.whiteScore}</span>`;
      })
      .join("");

    // se o formato for melhor-de-3 ou melhor-de-5, avisamos quando já há vencedor
    // matemático, mas a decisão de avançar ou terminar continua a ser do utilizador.
    const neededToWin = game.format === "3" ? 2 : game.format === "5" ? 3 : null;
    const nextBtn = document.getElementById("btn-next-set");
    if (neededToWin && (game.blueSetsWon >= neededToWin || game.whiteSetsWon >= neededToWin)) {
      const matchWinnerName =
        game.blueSetsWon >= neededToWin
          ? getPlayer(game.bluePlayerId)?.name || "Azul"
          : getPlayer(game.whitePlayerId)?.name || "Branco";
      document.getElementById("set-end-eyebrow").textContent = closedSet.capote
        ? "FIM DO SET · CAPOTE · JOGO DECIDIDO"
        : "FIM DO SET · JOGO DECIDIDO";
      nextBtn.textContent = "Continuar de qualquer forma ▸";
      document.getElementById("overlay-set-end").dataset.decided = "1";
    } else {
      nextBtn.textContent = "Próximo Set ▸";
      delete document.getElementById("overlay-set-end").dataset.decided;
    }

    document.getElementById("overlay-set-end").hidden = false;
  }

  document.getElementById("btn-next-set").addEventListener("click", () => {
    document.getElementById("overlay-set-end").hidden = true;
  });

  document.getElementById("btn-finish-from-set").addEventListener("click", () => {
    document.getElementById("overlay-set-end").hidden = true;
    openConfirmEndOverlay();
  });

  /* ---------- terminar jogo ---------- */
  document.getElementById("btn-end-game").addEventListener("click", openConfirmEndOverlay);

  function openConfirmEndOverlay() {
    const detail = document.getElementById("confirm-end-detail");
    if (game.currentBlue > 0 || game.currentWhite > 0) {
      detail.textContent = `O set em curso (${game.currentBlue}-${game.currentWhite}) não vai ser contado. O resultado dos sets já fechados é guardado no histórico.`;
    } else {
      detail.textContent = "O resultado atual vai ser guardado no histórico.";
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

    if (game.sets.length === 0) {
      // nenhum set foi concluído — descarta sem guardar no histórico
      DATA.activeGame = null;
      saveData();
      showScreen("screen-menu");
      checkResumeBanner();
      return;
    }

    const winnerSide = game.blueSetsWon > game.whiteSetsWon ? "blue" : "white";
    const record = {
      id: game.id,
      pointsTarget: game.pointsTarget,
      format: game.format,
      startedAt: game.startedAt,
      endedAt: new Date().toISOString(),
      durationSeconds: game.elapsedSeconds,
      sets: game.sets,
      winnerSide,
      blue: { playerId: game.bluePlayerId, setsWon: game.blueSetsWon },
      white: { playerId: game.whitePlayerId, setsWon: game.whiteSetsWon }
    };

    DATA.games.push(record);
    DATA.activeGame = null;
    saveData();

    showGameEndOverlay(record);
  }

  function showGameEndOverlay(record) {
    const blueName = getPlayer(record.blue.playerId)?.name || "Azul";
    const whiteName = getPlayer(record.white.playerId)?.name || "Branco";
    const winnerName = record.winnerSide === "blue" ? blueName : whiteName;

    document.getElementById("game-end-winner").textContent = `${winnerName} venceu o jogo`;
    const recap = document.getElementById("game-end-recap");
    recap.innerHTML = `
      <span class="recap-pill">${blueName} ${record.blue.setsWon}</span>
      <span class="recap-pill">${whiteName} ${record.white.setsWon}</span>
    ` + record.sets
      .map((s, i) => {
        const cls = s.capote ? "recap-pill is-capote" : "recap-pill";
        return `<span class="${cls}">Set ${i + 1}: ${s.blueScore}-${s.whiteScore}</span>`;
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
      <div class="stat-box"><strong>${DATA.players.length}</strong><span>Jogadores guardados</span></div>
      <div class="stat-box"><strong>${DATA.games.length}</strong><span>Jogos no histórico</span></div>
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

    showToast("Cópia exportada: " + filename, "success");
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
        const detail = document.getElementById("confirm-import-detail");
        const pJogador = (n) => (n === 1 ? "jogador" : "jogadores");
        const pJogo = (n) => (n === 1 ? "jogo" : "jogos");
        detail.textContent =
          `O ficheiro tem ${parsed.players.length} ${pJogador(parsed.players.length)} e ${parsed.games.length} ${pJogo(parsed.games.length)} no histórico. ` +
          `Isto vai substituir os ${DATA.players.length} ${pJogador(DATA.players.length)} e ${DATA.games.length} ${pJogo(DATA.games.length)} já guardados neste tablet.`;
        document.getElementById("overlay-confirm-import").hidden = false;
      } catch (err) {
        showToast("Ficheiro inválido ou corrompido.", "error");
      }
    };
    reader.onerror = () => showToast("Não foi possível ler o ficheiro.", "error");
    reader.readAsText(file);
  });

  function validateImportPayload(parsed) {
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, message: "Ficheiro inválido: formato inesperado." };
    }
    if (!Array.isArray(parsed.players) || !Array.isArray(parsed.games)) {
      return { ok: false, message: "Ficheiro inválido: não é uma cópia de segurança do Placar." };
    }
    return { ok: true };
  }

  document.getElementById("btn-cancel-import").addEventListener("click", () => {
    pendingImport = null;
    document.getElementById("overlay-confirm-import").hidden = true;
  });

  document.getElementById("btn-confirm-import").addEventListener("click", () => {
    if (!pendingImport) return;
    DATA.players = pendingImport.players;
    DATA.games = pendingImport.games;
    DATA.nextPlayerId = pendingImport.nextPlayerId || DATA.nextPlayerId;
    DATA.nextGameId = pendingImport.nextGameId || DATA.nextGameId;
    DATA.activeGame = null; // não importamos jogos em curso, para evitar estados inconsistentes
    saveData();
    pendingImport = null;
    document.getElementById("overlay-confirm-import").hidden = true;
    renderDataScreen();
    checkResumeBanner();
    showToast("Dados importados com sucesso.", "success");
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
    showToast("Todos os dados foram apagados.", "success");
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

  // tentar bloquear orientação ao entrar no ecrã de jogo (requer gesto do utilizador)
  document.getElementById("btn-confirm-setup").addEventListener("click", () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(tryLockOrientation).catch(() => {});
    } else {
      tryLockOrientation();
    }
  });
  document.getElementById("btn-resume").addEventListener("click", () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(tryLockOrientation).catch(() => {});
    } else {
      tryLockOrientation();
    }
  });

  init();
})();
