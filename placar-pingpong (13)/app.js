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
        <p class="section-label">Leaderboard · Top ${ranked.length}</p>
        <div class="leaderboard-table">
          <div class="leaderboard-row leaderboard-row--head">
            <span class="lb-rank"></span>
            <span class="lb-name">Jogador</span>
            <span class="lb-cell">V</span>
            <span class="lb-cell">D</span>
            <span class="lb-cell">E</span>
            <span class="lb-cell">Cap.</span>
            <span class="lb-cell lb-cell--accent">Win%</span>
            <span class="lb-cell lb-cell--elo">ELO</span>
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
      allLabel.textContent = "Todos os jogadores";
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
            <span>${stats.gamesPlayed} jogos · ${stats.winRate}%</span>
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
          const oppName = opp.playerId ? getPlayer(opp.playerId)?.name || "—" : "—";
          let resultClass, resultLabel;
          if (g.isDraw) {
            resultClass = "history-row-result--draw";
            resultLabel = "Empatou";
          } else if (g.winnerSide === (isBlue ? "blue" : "white")) {
            resultClass = "history-row-result--win";
            resultLabel = "Venceu";
          } else {
            resultClass = "history-row-result--loss";
            resultLabel = "Perdeu";
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
        <p class="section-label">Confrontos diretos</p>
        ${stats.rivals
          .map(
            (r) => `
            <div class="history-row">
              <div class="history-row-main">
                <strong>vs ${escapeHTML(r.name)}</strong>
                <small>${r.gamesPlayed} jogo(s) disputado(s)</small>
              </div>
              <span class="history-row-score">${r.gamesWon}V – ${r.gamesLost}D${r.gamesDrawn ? ` – ${r.gamesDrawn}E` : ""}</span>
            </div>`
          )
          .join("")}
      `;
    }

    content.innerHTML = `
      <div class="profile-stats-grid">
        <div class="stat-box stat-box--elo"><strong>${stats.elo}</strong><span>ELO (diversão)</span></div>
        <div class="stat-box stat-box--accent"><strong>${stats.winRate}%</strong><span>Win rate</span></div>
        <div class="stat-box"><strong>${stats.gamesPlayed}</strong><span>Jogos disputados</span></div>
        <div class="stat-box"><strong>${stats.gamesWon}</strong><span>Jogos ganhos</span></div>
        <div class="stat-box"><strong>${stats.gamesLost}</strong><span>Jogos perdidos</span></div>
        <div class="stat-box"><strong>${stats.gamesDrawn}</strong><span>Jogos empatados</span></div>
        <div class="stat-box"><strong>${stats.wins}</strong><span>Sets ganhos (vitórias)</span></div>
        <div class="stat-box"><strong>${stats.losses}</strong><span>Sets perdidos (derrotas)</span></div>
        <div class="stat-box"><strong>${stats.setsWon}</strong><span>Total sets ganhos</span></div>
        <div class="stat-box"><strong>${stats.setsLost}</strong><span>Total sets perdidos</span></div>
        <div class="stat-box"><strong>${stats.capotes}</strong><span>Capotes feitos</span></div>
        <div class="stat-box"><strong>${stats.capotesSuffered}</strong><span>Capotes sofridos</span></div>
      </div>
      ${
        stats.bestRival || stats.worstRival
          ? `<div class="profile-stats-grid">
              ${stats.bestRival ? `<div class="stat-box stat-box--accent"><strong>${escapeHTML(stats.bestRival.name)}</strong><span>Mais vitórias contra (${stats.bestRival.gamesWon})</span></div>` : ""}
              ${stats.worstRival ? `<div class="stat-box"><strong>${escapeHTML(stats.worstRival.name)}</strong><span>Mais derrotas contra (${stats.worstRival.gamesLost})</span></div>` : ""}
            </div>`
          : ""
      }
      ${rivalsHTML}
      <p class="section-label">Últimos jogos</p>
      ${historyHTML}
      <p class="section-label">Cor no placar</p>
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
            <span class="history-card-format">${g.pointsTarget} PTS · ${formatModeLabel(g.format)}${g.isDraw ? " · EMPATE" : ""}</span>
          </div>
          <div class="history-card-matchup">
            <div class="history-side history-side--blue">
              <span class="history-side-name ${blueWon ? "is-winner" : ""}">${escapeHTML(blueName)}</span>
              <span class="history-side-sets">${g.blue.setsWon}</span>
            </div>
            <span class="history-card-sep">SETS</span>
            <div class="history-side history-side--white history-side--right">
              <span class="history-side-name ${whiteWon ? "is-winner" : ""}">${escapeHTML(whiteName)}</span>
              <span class="history-side-sets">${g.white.setsWon}</span>
            </div>
          </div>
          ${capoteCount > 0 ? `<span class="capote-tag capote-tag--card">${capoteCount > 1 ? capoteCount + "x Capote" : "Capote"}</span>` : ""}
          ${g.description ? `<p class="history-card-desc">${escapeHTML(g.description)}</p>` : ""}
        `;
        card.addEventListener("click", () => openGameDetail(g.id));
        list.appendChild(card);
      });
  }

  function formatModeLabel(format) {
    if (format === "3") return "MD3";
    if (format === "5") return "MD5";
    if (format === "7") return "MD7";
    return "LIVRE";
  }

  function openGameDetail(gameId) {
    const g = DATA.games.find((x) => x.id === gameId);
    if (!g) return;
    const blueName = g.blue.playerId ? getPlayer(g.blue.playerId)?.name || "Jogador" : "Jogador";
    const whiteName = g.white.playerId ? getPlayer(g.white.playerId)?.name || "Jogador" : "Jogador";
    const blueWon = !g.isDraw && g.winnerSide === "blue";

    const setsHTML = g.sets
      .map((s, i) => {
        const winnerName = s.winnerSide === "blue" ? blueName : whiteName;
        const momentumSVG = buildMomentumSVG({ ...s, _idx: `${g.id}_${i}` }, blueName, whiteName, g.blue.playerId, g.white.playerId);
        return `
          <div class="set-row set-row--expanded">
            <div class="set-row-top">
              <span class="set-row-num">SET ${i + 1}</span>
              <span class="set-row-score">${s.blueScore} – ${s.whiteScore}</span>
              <span class="set-row-winner">${winnerName}${s.capote ? '<span class="capote-tag">Capote</span>' : ""}</span>
            </div>
            ${momentumSVG}
          </div>`;
      })
      .join("");

    const resultLabel = g.isDraw
      ? "Jogo terminou empatado"
      : `Sets (${blueWon ? escapeHTML(blueName) : escapeHTML(whiteName)} venceu o jogo)`;

    document.getElementById("game-detail-content").innerHTML = `
      <div class="detail-header">
        <div class="detail-matchup">
          <span class="detail-name">${escapeHTML(blueName)}</span>
          <span class="detail-score">${g.blue.setsWon} – ${g.white.setsWon}</span>
          <span class="detail-name">${escapeHTML(whiteName)}</span>
        </div>
        <p class="detail-sub">${formatDate(g.endedAt)} · ${g.pointsTarget} pontos por set · ${formatModeLabel(g.format)} · duração ${formatClock(g.durationSeconds)}</p>
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
      leadSummary = "Set muito equilibrado";
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
    const blueName = getPlayer(game.bluePlayerId)?.name || "Azul";
    const whiteName = getPlayer(game.whitePlayerId)?.name || "Branco";
    document.getElementById("bolar-name-blue").textContent = blueName;
    document.getElementById("bolar-name-white").textContent = whiteName;
    const setNumber = game.sets.length + 1;
    document.getElementById("bolar-set-label").textContent = `Set ${setNumber} · quem serve primeiro?`;
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

    const blueName = getPlayer(game.bluePlayerId)?.name || "Azul";
    const whiteName = getPlayer(game.whitePlayerId)?.name || "Branco";
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
        showStatusBanner("DEUCE", "deuce");
      } else if (isMatchPoint()) {
        playMatchPointSound();
        showStatusBanner("MATCH POINT", "matchpoint");
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

    // se o formato for melhor-de-3, melhor-de-5 ou melhor-de-7, avisamos quando já há
    // vencedor matemático, mas a decisão de avançar ou terminar continua a ser do utilizador.
    const neededToWin = game.format === "3" ? 2 : game.format === "5" ? 3 : game.format === "7" ? 4 : null;
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
    showToast("Último ponto anulado — podes continuar o set.", "success");
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

    showGameEndOverlay(record);
  }

  function showGameEndOverlay(record) {
    const blueName = getPlayer(record.blue.playerId)?.name || "Azul";
    const whiteName = getPlayer(record.white.playerId)?.name || "Branco";

    if (record.isDraw) {
      document.getElementById("game-end-winner").textContent = `Empate entre ${blueName} e ${whiteName}`;
    } else {
      const winnerName = record.winnerSide === "blue" ? blueName : whiteName;
      document.getElementById("game-end-winner").textContent = `${winnerName} venceu o jogo`;
    }
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
        const preview = previewMerge(parsed);
        const detail = document.getElementById("confirm-import-detail");
        const pJogador = (n) => (n === 1 ? "jogador" : "jogadores");
        const pJogo = (n) => (n === 1 ? "jogo" : "jogos");
        detail.innerHTML =
          `O ficheiro tem ${parsed.players.length} ${pJogador(parsed.players.length)} e ${parsed.games.length} ${pJogo(parsed.games.length)}.<br><br>` +
          `<strong>Adicionar ao que já tens</strong> traz ${preview.newPlayers} ${pJogador(preview.newPlayers)} novo(s) e ${preview.newGames} ${pJogo(preview.newGames)} novo(s) ` +
          `(jogadores com o mesmo nome são juntos automaticamente; jogos repetidos são ignorados).<br><br>` +
          `<strong>Substituir tudo</strong> apaga os ${DATA.players.length} ${pJogador(DATA.players.length)} e ${DATA.games.length} ${pJogo(DATA.games.length)} atuais e fica só com o que está no ficheiro.`;
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
    const pJogador = (n) => (n === 1 ? "jogador" : "jogadores");
    const pJogo = (n) => (n === 1 ? "jogo" : "jogos");
    showToast(`Adicionados ${addedPlayers} ${pJogador(addedPlayers)} e ${addedGames} ${pJogo(addedGames)} novo(s).`, "success");
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
    showToast("Dados substituídos com sucesso.", "success");
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

  // (entrada em fullscreen/orientação tratada em openBolarScreen, antes do placar)
  document.getElementById("btn-resume").addEventListener("click", () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(tryLockOrientation).catch(() => {});
    } else {
      tryLockOrientation();
    }
  });

  init();
})();
