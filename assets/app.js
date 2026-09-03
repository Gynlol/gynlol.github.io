/* Gyn Replays — Matchups Nunu · rendu client depuis data/*.json */
(function () {
  "use strict";

  var ROLES = ["top", "mid", "adc", "support"];

  var ROLE_ICONS = {
    top: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h8L7.5 4.5H4.5v3L2 10V2z" fill="currentColor"/><path d="M14 14H6l2.5-2.5h3v-3L14 6v8z" fill="currentColor" opacity=".45"/></svg>',
    mid: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 14v-4l8-8h4L2 14z" fill="currentColor"/><path d="M2 2h5L4.5 4.5H2V2zm12 12H9l2.5-2.5H14V14z" fill="currentColor" opacity=".45"/></svg>',
    adc: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="2.2" fill="currentColor"/><path d="M8 1v3M8 12v3M1 8h3M12 8h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    support: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l6 2.5v4c0 3.2-2.4 6-6 7.5-3.6-1.5-6-4.3-6-7.5v-4L8 1z" fill="currentColor"/></svg>'
  };

  var I18N = {
    fr: {
      brandSub: "Matchups Nunu",
      latest: "Derniers replays",
      searchPlaceholder: "Chercher un champion…",
      coverage: function (a, b) { return "<strong>" + a + "</strong>/" + b + " matchups couverts"; },
      noVideo: "Pas encore de replay",
      nVideos: function (n) { return n > 1 ? n + " replays" : "1 replay"; },
      tileLabel: function (name, n) { return n > 0 ? name + " — " + (n > 1 ? n + " replays" : "1 replay") : name + " — pas encore de replay"; },
      matchupSub: function (n) { return n > 1 ? n + " replays, du plus récent au plus ancien" : "1 replay"; },
      footerAuto: "Mis à jour automatiquement depuis la chaîne",
      subscribe: "Abonne-toi ❄",
      updatedAt: function (d) { return "dernière mise à jour : " + d; },
      noResults: "Aucun champion trouvé.",
      close: "Fermer",
      win: "Victoire",
      loss: "Défaite",
      langLabel: "Passer en anglais",
      navRoles: "Rôles",
      setupNav: "Runes & build",
      setupNavShort: "Runes",
      setupTitle: "Mes runes et mes builds",
      setupIntro: "Runes, builds et conseils généraux, chacun dans son onglet.",
      setupRunesTab: "Runes",
      setupBuildsTab: "Builds",
      setupTipsTab: "Conseils",
      setupTabsLabel: "Contenu du guide",
      runesTitle: "Pages de runes",
      buildsTitle: "Builds",
      tipsTitle: "Conseils généraux",
      watchShort: "Voir le short Hexflash ↗",
      viewRunes: "Voir les runes",
      mineRunes: "Ma page",
      mineBuild: "Mon build",
      altLabel: "Variante",
      shardsTitle: "Fragments",
      buildStart: "Départ",
      buildCore: "Cœur",
      buildBoots: "Bottes",
      buildSit: "Situationnel",
      setupLoading: "Chargement…",
      setupError: "Runes et builds indisponibles pour le moment — recharge la page.",
      setupEmpty: "Rien n'est encore écrit ici.",
      backToMatchups: "Retour aux matchups",
      backToMatchupsShort: "Matchups",
      notesTitle: "À savoir",
      levelTitle: "Difficulté",
      levels: { facile: "Facile", moyen: "Moyen", dur: "Dur", tresdur: "Très dur" },
      translate: "",
      translateHint: "",
      ban: "BAN",
      banTitle: "Ban permanent",
      banSub: "Ban permanent — pas de replay, et il n'y en aura pas",
      banLine: function (names, role) { return "Mon ban en " + role + " : " + names; },
      tileBan: function (name, role) { return name + " — mon ban en " + role; },
      roleNames: { top: "Top", mid: "Mid", adc: "ADC", support: "Support" },
      docTitle: "Gyn Replays — Matchups Nunu"
    },
    en: {
      brandSub: "Nunu Matchups",
      latest: "Latest replays",
      searchPlaceholder: "Search a champion…",
      coverage: function (a, b) { return "<strong>" + a + "</strong>/" + b + " matchups covered"; },
      noVideo: "No replay yet",
      nVideos: function (n) { return n > 1 ? n + " replays" : "1 replay"; },
      tileLabel: function (name, n) { return n > 0 ? name + " — " + (n > 1 ? n + " replays" : "1 replay") : name + " — no replay yet"; },
      matchupSub: function (n) { return n > 1 ? n + " replays, newest first" : "1 replay"; },
      footerAuto: "Automatically updated from the channel",
      subscribe: "Subscribe ❄",
      updatedAt: function (d) { return "last update: " + d; },
      noResults: "No champion found.",
      close: "Close",
      win: "Win",
      loss: "Loss",
      langLabel: "Switch to French",
      navRoles: "Roles",
      setupNav: "Runes & build",
      setupNavShort: "Runes",
      setupTitle: "My runes and builds",
      setupIntro: "Runes, builds and general tips, each in its own tab.",
      setupRunesTab: "Runes",
      setupBuildsTab: "Builds",
      setupTipsTab: "Tips",
      setupTabsLabel: "Guide sections",
      runesTitle: "Rune pages",
      buildsTitle: "Builds",
      tipsTitle: "General tips",
      watchShort: "Watch the Hexflash short ↗",
      viewRunes: "View runes",
      mineRunes: "My page",
      mineBuild: "My build",
      altLabel: "Variant",
      shardsTitle: "Shards",
      buildStart: "Start",
      buildCore: "Core",
      buildBoots: "Boots",
      buildSit: "Situational",
      setupLoading: "Loading…",
      setupError: "Runes and builds are unavailable right now — reload the page.",
      setupEmpty: "Nothing written here yet.",
      backToMatchups: "Back to matchups",
      backToMatchupsShort: "Matchups",
      notesTitle: "Good to know",
      levelTitle: "Difficulty",
      levels: { facile: "Easy", moyen: "Medium", dur: "Hard", tresdur: "Very hard" },
      translate: "Translate",
      translateHint: "Matchup notes are written in French — open this page in Google Translate",
      ban: "BAN",
      banTitle: "Permanent ban",
      banSub: "Permanent ban — no replay, and there won't be one",
      banLine: function (names, role) { return "My " + role + " ban: " + names; },
      tileBan: function (name, role) { return name + " — my " + role + " ban"; },
      roleNames: { top: "Top", mid: "Mid", adc: "ADC", support: "Support" },
      docTitle: "Gyn Replays — Nunu Matchups"
    }
  };

  var state = {
    lang: "fr",
    role: null,
    champ: null,
    search: "",
    data: null,
    champs: null,
    notes: {},       // "role/ChampId" -> { fr: [...], en: [...] }
    levels: {},      // "role/ChampId" -> "facile" | "moyen" | "dur"
    bans: {},        // role -> { champId: true } — bans de rôle, écrits à la main
    banNames: {},    // role -> [noms] — un ban peut ne pas figurer dans la grille du rôle
    byRole: {},      // role -> { champId -> [videos] }
    rosters: {},     // role -> [{id, name, videos}] triés
    tabs: {},        // role -> bouton d'onglet (construits une seule fois)
    view: "matchups",  // "matchups" | "setup" (runes & build, hors matchups)
    setup: null,       // data/setup-built.json, chargé à la première ouverture
    setupState: "idle", // idle | loading | ok | error
    setupSection: "runes" // "runes" | "builds" | "tips"
  };

  // Secours locaux (data URI) si Data Dragon ou i.ytimg sont injoignables.
  var FALLBACK_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 72 72'%3E%3Crect width='72' height='72' fill='%2322314a'/%3E%3Cpath d='M36 14v44M18 25l36 22M18 47l36-22' stroke='%238593a5' stroke-width='4' stroke-linecap='round' fill='none'/%3E%3C/svg%3E";
  var FALLBACK_THUMB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%2322314a'/%3E%3Cpath d='M138 62v56l48-28z' fill='%238593a5'/%3E%3C/svg%3E";

  function withFallback(img, fallbackSrc) {
    img.addEventListener("error", function () {
      if (img.src !== fallbackSrc) img.src = fallbackSrc;
    });
    return img;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function $(id) { return document.getElementById(id); }
  function t() { return I18N[state.lang]; }

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem("gyn-lang"); } catch (e) { /* stockage bloqué */ }
    if (saved === "fr" || saved === "en") return saved;
    return (navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return new Intl.DateTimeFormat(state.lang === "fr" ? "fr-FR" : "en-GB",
      { day: "numeric", month: "short", year: "numeric" }).format(d);
  }

  function iconUrl(id) {
    return "https://ddragon.leagueoflegends.com/cdn/" + state.data.meta.ddragonVersion +
      "/img/champion/" + encodeURIComponent(id) + ".png";
  }

  function thumbUrl(videoId) {
    return "https://i.ytimg.com/vi/" + encodeURIComponent(videoId) + "/mqdefault.jpg";
  }

  function watchUrl(videoId) {
    return "https://www.youtube.com/watch?v=" + encodeURIComponent(videoId);
  }

  function normName(s) {
    return s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
  }

  /* ---------- Construction des index ---------- */

  // Les bans sont écrits à la main dans data/notes.json (« Trundle », « soraka »…) :
  // on les rattache à l'id officiel du champion, sinon un simple e/E casse la ligne.
  function buildBans(namesById) {  // namesById sert aussi à nommer un ban absent de la grille
    var byNorm = {};
    Object.keys(namesById).forEach(function (id) {
      byNorm[normName(id)] = id;
      byNorm[normName(namesById[id])] = id;
    });
    ROLES.forEach(function (role) { state.bans[role] = {}; state.banNames[role] = []; });
    var raw = (state.notesFile && state.notesFile.bans) || {};
    Object.keys(raw).forEach(function (role) {
      if (ROLES.indexOf(role) === -1 || !raw[role]) return;
      raw[role].forEach(function (name) {
        var id = byNorm[normName(String(name))];
        if (!id) return;
        state.bans[role][id] = true;
        state.banNames[role].push(namesById[id]);
      });
    });
  }

  function isBanned(role, champId) {
    return !!(state.bans[role] && state.bans[role][champId]);
  }

  // Difficulté écrite à la main dans data/notes.json (clé « niveaux ») :
  // facile / moyen / dur, tolérant sur la casse, les accents et l'anglais.
  var LEVEL_ALIASES = {
    facile: "facile", easy: "facile", ez: "facile",
    moyen: "moyen", moyenne: "moyen", medium: "moyen", moy: "moyen",
    dur: "dur", dure: "dur", difficile: "dur", hard: "dur",
    tresdur: "tresdur", tresdure: "tresdur", veryhard: "tresdur", enfer: "tresdur"
  };

  // Clés tolérantes : « top/Dr. Mundo », « TOP/drmundo » ou « top/DrMundo »
  // désignent la même case — le fichier est écrit à la main.
  function buildLevels(namesById) {
    state.levels = {};
    var raw = (state.notesFile && state.notesFile.niveaux) || {};
    var byNorm = {};
    Object.keys(namesById).forEach(function (id) {
      byNorm[normName(id)] = id;
      byNorm[normName(namesById[id])] = id;
    });
    Object.keys(raw).forEach(function (key) {
      var parts = String(key).split("/");
      if (parts.length !== 2) return;
      var role = normName(parts[0]);
      var id = byNorm[normName(parts[1])];
      var lvl = LEVEL_ALIASES[normName(String(raw[key]))];
      if (!id || !lvl || ROLES.indexOf(role) === -1) return;
      state.levels[role + "/" + id] = lvl;
    });
  }

  function levelFor(role, champId) {
    return state.levels[role + "/" + champId] || null;
  }

  function levelBadge(level, klass) {
    var el = document.createElement("span");
    el.className = (klass || "level-badge") + " lvl-" + level;
    el.textContent = t().levels[level];
    return el;
  }

  function notesFor(role, champId) {
    var entry = (state.notesFile && state.notesFile.notes) || {};
    var n = entry[role + "/" + champId];
    if (!n) return [];
    var list = n[state.lang] || n.fr || n.en || [];
    return Array.isArray(list) ? list : [];
  }

  function buildIndexes() {
    var namesById = {};
    state.champs.champions.forEach(function (c) { namesById[c.id] = c.name; });
    buildBans(namesById);
    buildLevels(namesById);

    ROLES.forEach(function (role) { state.byRole[role] = {}; });
    state.data.videos.forEach(function (v) {
      if (ROLES.indexOf(v.role) === -1) return;
      var bucket = state.byRole[v.role];
      if (!bucket[v.enemy]) bucket[v.enemy] = [];
      bucket[v.enemy].push(v);
    });

    ROLES.forEach(function (role) {
      var seen = {};
      var roster = [];
      state.champs.champions.forEach(function (c) {
        if (c.roles.indexOf(role) !== -1) {
          roster.push({ id: c.id, name: c.name, videos: state.byRole[role][c.id] || [] });
          seen[c.id] = true;
        }
      });
      // Ennemi hors roster (pick exotique, nouveau champion) : il apparaît
      // quand même dès qu'une vidéo existe.
      Object.keys(state.byRole[role]).forEach(function (id) {
        if (!seen[id]) {
          var vids = state.byRole[role][id];
          roster.push({ id: id, name: namesById[id] || vids[0].enemyName || id, videos: vids });
        }
      });
      roster.sort(function (a, b) { return a.name.localeCompare(b.name, "fr"); });
      state.rosters[role] = roster;
    });
  }

  function defaultRole() {
    var best = "adc", bestCount = -1;
    ROLES.forEach(function (role) {
      var n = Object.keys(state.byRole[role]).length;
      if (n > bestCount) { bestCount = n; best = role; }
    });
    return bestCount > 0 ? best : "adc";
  }

  /* ---------- Hash routing ---------- */

  // #setup, #runes, #build, #tips : plusieurs portes vers la même vue, parce qu'un
  // lien partagé de mémoire ne tombe jamais toujours sur le même mot exact.
  var SETUP_HASHES = ["setup", "runes", "build", "builds", "tips", "conseils"];

  function readHash() {
    var h;
    try {
      h = decodeURIComponent((location.hash || "").replace(/^#/, "")).toLowerCase();
    } catch (e) {
      return { view: null, role: null, champ: null };  // encodage % malformé : hash ignoré
    }
    if (!h) return { view: null, role: null, champ: null };
    var parts = h.split("/");
    if (SETUP_HASHES.indexOf(parts[0]) !== -1) {
      var section = (parts[0] === "tips" || parts[0] === "conseils" ||
        parts[1] === "tips" || parts[1] === "conseils") ? "tips" :
        ((parts[0] === "build" || parts[0] === "builds" || parts[1] === "builds")
          ? "builds" : "runes");
      return { view: "setup", role: null, champ: null, setupSection: section };
    }
    var role = ROLES.indexOf(parts[0]) !== -1 ? parts[0] : null;
    var champ = null;
    if (role && parts[1]) {
      var roster = state.rosters[role] || [];
      for (var i = 0; i < roster.length; i++) {
        if (normName(roster[i].id) === normName(parts[1]) || normName(roster[i].name) === normName(parts[1])) {
          champ = roster[i].id;
          break;
        }
      }
    }
    return { view: "matchups", role: role, champ: champ, setupSection: null };
  }

  function writeHash() {
    var h = "";
    if (state.view === "setup") {
      var section = state.setupSection === "tips" ? "tips" :
        (state.setupSection === "builds" ? "builds" : "runes");
      h = "#setup/" + section;
    }
    else if (state.role) h = "#" + state.role + (state.champ ? "/" + state.champ.toLowerCase() : "");
    if (h !== location.hash) {
      if (h) history.replaceState(null, "", h);
      else history.replaceState(null, "", location.pathname + location.search);
    }
  }

  /* ---------- Rendus ---------- */

  function chip(cls, text) {
    var s = document.createElement("span");
    s.className = "chip" + (cls ? " " + cls : "");
    s.textContent = text;
    return s;
  }

  // « Gold 4 42 LP » — la division n'existe que sous Master.
  function rankLabel(v) {
    var s = v.rank;
    if (v.division) s += " " + v.division;
    if (v.lp !== null && v.lp !== undefined) s += " " + v.lp + " LP";
    return s;
  }

  function videoChips(v, withRole) {
    var box = document.createElement("div");
    box.className = "chips";
    if (withRole) box.appendChild(chip("role", t().roleNames[v.role]));
    if (v.patch) box.appendChild(chip("", "Patch " + v.patch));
    if (v.rank) box.appendChild(chip("rank rank-" + v.rank.toLowerCase(), rankLabel(v)));
    if (v.result === "win") box.appendChild(chip("win", t().win));
    if (v.result === "loss") box.appendChild(chip("loss", t().loss));
    box.appendChild(chip("date", fmtDate(v.published)));
    return box;
  }

  // Les onglets sont construits une seule fois puis mis à jour en place :
  // reconstruire détruirait le bouton qui porte le focus clavier.
  function buildTabs() {
    var nav = $("role-tabs");
    ROLES.forEach(function (role) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "role-tab";
      btn.innerHTML = ROLE_ICONS[role] + "<span>" + t().roleNames[role] + "</span>";
      var count = document.createElement("span");
      count.className = "count";
      btn.appendChild(count);
      btn.addEventListener("click", function () {
        state.view = "matchups";
        state.role = role;
        state.champ = null;
        state.search = "";
        $("search").value = "";
        writeHash();
        renderAll();
      });
      nav.appendChild(btn);
      state.tabs[role] = btn;
    });
  }

  function renderTabs() {
    ROLES.forEach(function (role) {
      var covered = state.rosters[role].filter(function (c) { return c.videos.length > 0; }).length;
      var btn = state.tabs[role];
      if (role === state.role) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
      btn.querySelector(".count").textContent = String(covered);
    });
  }

  function renderLatest() {
    var section = $("latest-section");
    var row = $("latest-row");
    row.innerHTML = "";
    var latest = state.data.videos.slice(0, 6);
    if (!latest.length) { section.hidden = true; return; }
    section.hidden = false;
    latest.forEach(function (v) {
      var a = document.createElement("a");
      a.className = "latest-card";
      a.href = watchUrl(v.id);
      a.target = "_blank";
      a.rel = "noopener";
      var img = withFallback(document.createElement("img"), FALLBACK_THUMB);
      img.src = thumbUrl(v.id);
      img.alt = "";
      img.loading = "lazy";
      var meta = document.createElement("div");
      meta.className = "latest-meta";
      var title = document.createElement("span");
      title.className = "latest-title";
      title.textContent = v.title;
      meta.appendChild(title);
      meta.appendChild(videoChips(v, true));
      a.appendChild(img);
      a.appendChild(meta);
      row.appendChild(a);
    });
  }

  function renderGrid() {
    var roster = state.rosters[state.role];
    var covered = roster.filter(function (c) { return c.videos.length > 0; }).length;

    var titleEl = $("role-title");
    titleEl.innerHTML = "Nunu <span class=\"vs\">vs</span> " + t().roleNames[state.role];
    var cov = t().coverage(covered, roster.length);
    var bannedNames = state.banNames[state.role] || [];
    if (bannedNames.length) {
      cov += ' <span class="ban-line">' +
        t().banLine(bannedNames.join(", "), t().roleNames[state.role]) + "</span>";
    }
    $("coverage-line").innerHTML = cov;

    var grid = $("grid");
    grid.innerHTML = "";
    var q = normName(state.search);
    var shown = 0;
    roster.forEach(function (c) {
      if (q && normName(c.name).indexOf(q) === -1) return;
      shown++;
      var tile = document.createElement("button");
      tile.type = "button";
      tile.dataset.champ = c.id;
      var banned = isBanned(state.role, c.id);
      tile.className = "tile" + (c.videos.length ? "" : " off") +
        (banned ? " ban" : "") + (c.id === state.champ ? " selected" : "");
      var lvlLabel = levelFor(state.role, c.id);
      tile.setAttribute("aria-label", (lvlLabel ? t().levels[lvlLabel] + " — " : "") + (banned
        ? t().tileBan(c.name, t().roleNames[state.role])
        : t().tileLabel(c.name, c.videos.length)));
      tile.title = banned ? t().banTitle : (c.videos.length ? "" : t().noVideo);

      var img = document.createElement("img");
      img.src = iconUrl(c.id);
      img.alt = "";
      img.loading = "lazy";
      img.width = 56; img.height = 56;
      img.addEventListener("error", function () {
        var letter = document.createElement("span");
        letter.className = "tile-letter";
        letter.textContent = c.name.charAt(0).toUpperCase();
        tile.replaceChild(letter, img);
      });
      tile.appendChild(img);

      if (banned) {
        var flag = document.createElement("span");
        flag.className = "tile-ban";
        flag.textContent = t().ban;
        tile.appendChild(flag);
      } else if (c.videos.length > 1) {
        var badge = document.createElement("span");
        badge.className = "tile-count";
        badge.textContent = String(c.videos.length);
        tile.appendChild(badge);
      }

      var name = document.createElement("span");
      name.className = "tile-name";
      name.textContent = c.name;
      tile.appendChild(name);

      tile.addEventListener("click", function () {
        var deselecting = state.champ === c.id;
        state.champ = deselecting ? null : c.id;
        writeHash();
        renderGrid();
        renderPanel(!deselecting);
        if (deselecting) focusTile(c.id);  // la tuile a été reconstruite
      });
      grid.appendChild(tile);
    });

    var empty = $("no-results");
    empty.hidden = shown > 0;
    empty.textContent = t().noResults;
  }

  function focusTile(champId) {
    var tiles = $("grid").querySelectorAll(".tile");
    for (var i = 0; i < tiles.length; i++) {
      if (tiles[i].dataset.champ === champId) { tiles[i].focus(); return; }
    }
  }

  function renderPanel(focus) {
    var panel = $("matchup-panel");
    if (!state.champ) { panel.hidden = true; return; }
    var roster = state.rosters[state.role];
    var entry = null;
    for (var i = 0; i < roster.length; i++) {
      if (roster[i].id === state.champ) { entry = roster[i]; break; }
    }
    if (!entry) { panel.hidden = true; return; }

    panel.hidden = false;
    document.title = "Nunu " + t().roleNames[state.role] + " vs " + entry.name + " — Gyn Replays";
    var portrait = $("panel-portrait");
    if (!portrait.dataset.fallbackBound) {
      withFallback(portrait, FALLBACK_ICON);
      portrait.dataset.fallbackBound = "1";
    }
    portrait.src = iconUrl(entry.id);
    portrait.alt = entry.name;
    $("panel-title").innerHTML = "Nunu " + t().roleNames[state.role] +
      " <span class=\"vs\">vs</span> " + entry.name.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    if (isBanned(state.role, entry.id)) {
      $("panel-title").innerHTML += ' <span class="title-ban">' + t().ban + "</span>";
    }
    var sub = $("panel-sub");
    sub.textContent = "";
    var panelLvl = levelFor(state.role, entry.id);
    if (panelLvl) {
      sub.appendChild(levelBadge(panelLvl, "level-badge"));
      sub.appendChild(document.createTextNode(" "));  // sinon « Très dur1 replay » à la lecture d'écran
    }
    sub.appendChild(document.createTextNode(entry.videos.length
      ? t().matchupSub(entry.videos.length)
      : (isBanned(state.role, entry.id) ? t().banSub : t().noVideo)));
    $("panel-close").setAttribute("aria-label", t().close);

    renderNotes(entry);

    var list = $("video-list");
    list.innerHTML = "";
    entry.videos
      .slice()
      .sort(function (a, b) { return a.published < b.published ? 1 : -1; })
      .forEach(function (v) {
        var a = document.createElement("a");
        a.className = "video-card";
        a.href = watchUrl(v.id);
        a.target = "_blank";
        a.rel = "noopener";
        var img = withFallback(document.createElement("img"), FALLBACK_THUMB);
        img.src = thumbUrl(v.id);
        img.alt = "";
        img.loading = "lazy";
        var meta = document.createElement("div");
        meta.className = "video-meta";
        var title = document.createElement("span");
        title.className = "video-title";
        title.textContent = v.title;
        meta.appendChild(title);
        meta.appendChild(videoChips(v, false));
        a.appendChild(img);
        a.appendChild(meta);
        list.appendChild(a);
      });

    if (focus) {
      panel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest" });
      $("panel-title").focus({ preventScroll: true });
    }
  }

  // Grille « à savoir » : les notes écrites à la main dans data/notes.json.
  function noteCard(text, link) {
    var card = document.createElement("article");
    card.className = "note";
    var p = document.createElement("p");
    p.className = "note-text";
    p.textContent = text;
    card.appendChild(p);
    if (link && /^#/.test(link)) {
      var a = document.createElement("a");
      a.className = "note-link";
      a.href = link;
      a.textContent = t().viewRunes;
      a.setAttribute("aria-label", t().viewRunes);
      card.appendChild(a);
    }
    return card;
  }

  function renderNotes(entry) {
    var col = $("notes-col");
    var grid = $("notes-grid");
    grid.innerHTML = "";
    if (!isBanned(state.role, entry.id)) {
      notesFor(state.role, entry.id).forEach(function (n) {
        if (!n) return;
        var text = n.d || n.t;
        if (!text) return;
        grid.appendChild(noteCard(String(text), n.link));
      });
    }
    $("notes-title").textContent = t().notesTitle;
    col.hidden = grid.children.length === 0;
    // Matchup sans replay : la liste vide laisserait une colonne creuse,
    // les notes reprennent toute la largeur du panneau.
    var body = document.querySelector(".panel-body");
    if (body) body.classList.toggle("solo", !entry.videos.length && !col.hidden);
  }

  // Liens réels vers les pages matchups (référencement + accès direct) —
  // limités au rôle affiché : tous rôles confondus, le pied de page devient un
  // pavé de texte dès que le nombre d'adversaires monte. Les pages des autres
  // rôles restent accessibles par les onglets et listées dans sitemap.xml.
  function renderMatchupLinks() {
    var nav = $("matchup-links");
    if (!nav) return;
    var role = state.role;
    nav.innerHTML = "";
    if (role && state.rosters[role]) {
      state.rosters[role].forEach(function (c) {
        if (!c.videos.length) return;
        var a = document.createElement("a");
        a.href = "/matchups/" + role + "/" + c.id.toLowerCase() + "/";
        a.textContent = "Nunu " + I18N.fr.roleNames[role] + " vs " + c.name;
        nav.appendChild(a);
      });
    }
    // Rôle sans replay : on masque le bloc, sinon son padding laisse un trou.
    nav.hidden = nav.children.length === 0;
  }

  function renderChrome() {
    document.documentElement.lang = state.lang;
    document.title = t().docTitle;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (typeof t()[key] === "string") el.textContent = t()[key];
    });
    var toggle = $("lang-toggle");
    toggle.innerHTML = state.lang === "fr"
      ? "<span class=\"on\">FR</span> / EN"
      : "FR / <span class=\"on\">EN</span>";
    // Le libellé visible doit apparaître dans le nom accessible (WCAG 2.5.3)
    toggle.setAttribute("aria-label", "FR / EN — " + t().langLabel);
    $("role-tabs").setAttribute("aria-label", t().navRoles);
    $("search").placeholder = t().searchPlaceholder;
    var updated = state.data.meta.updated;
    $("footer-updated").textContent = updated ? t().updatedAt(fmtDate(updated)) : "";
    renderTranslateLink();
  }

  // Les notes de matchup sont écrites en français une seule fois. En anglais,
  // le site propose la page passée par Google Traduction plutôt qu'une
  // deuxième version à tenir à jour.
  function translateUrl() {
    var host = location.hostname;
    if (host.indexOf(".") === -1) return null;  // localhost : pas de proxy possible
    var proxy = host.replace(/-/g, "--").replace(/\./g, "-") + ".translate.goog";
    return "https://" + proxy + location.pathname + location.search +
      (location.search ? "&" : "?") + "_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en" + location.hash;
  }

  function renderTranslateLink() {
    var link = $("translate-link");
    if (!link) return;
    var url = state.lang === "en" ? translateUrl() : null;
    if (!url) { link.hidden = true; return; }
    link.hidden = false;
    link.href = url;
    link.textContent = "🌐 " + t().translate;
    link.title = t().translateHint;
    link.setAttribute("aria-label", t().translateHint);
  }

  /* ---------- Runes & build (vue hors matchups) ---------- */

  var DD_IMG = "https://ddragon.leagueoflegends.com/cdn/img/";

  function ddVersion() {
    return (state.setup && state.setup.meta && state.setup.meta.ddragonVersion) ||
      (state.data && state.data.meta && state.data.meta.ddragonVersion) || "";
  }

  function itemIconUrl(icon) {
    return "https://ddragon.leagueoflegends.com/cdn/" + ddVersion() + "/img/item/" + icon;
  }

  // Les noms sont écrits dans les deux langues par le générateur ; un nom non
  // résolu ne porte que son texte d'origine.
  function locName(obj) {
    if (!obj || !obj.name) return "";
    return obj.name[state.lang] || obj.name.fr || obj.name.en || "";
  }

  // Le fichier n'est chargé qu'à la première ouverture de la vue : la page
  // d'accueil n'a pas à payer les runes de quelqu'un venu pour un replay.
  function loadSetup() {
    if (state.setupState === "loading" || state.setupState === "ok") return;
    state.setupState = "loading";
    renderSetup();
    fetch("data/setup-built.json", FRESH)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        state.setup = data;
        state.setupState = "ok";
        renderSetup();
      })
      .catch(function (err) {
        state.setupState = "error";
        renderSetup();
        if (window.console) console.error(err);
      });
  }

  function runeIcon(icon, name, on, size) {
    var box = document.createElement("span");
    box.className = "rune" + (on ? " on" : "");
    box.title = name;
    var img = withFallback(document.createElement("img"), FALLBACK_ICON);
    img.src = DD_IMG + icon;
    img.alt = on ? name : "";
    // Les pages alternatives sont parfois très basses dans la vue mobile :
    // un chargement différé les laissait avec des cercles vides dans une
    // capture pleine page et au premier défilement.
    img.loading = "eager";
    img.width = size;
    img.height = size;
    box.appendChild(img);
    return box;
  }

  function unknownChip(label) {
    var chipEl = document.createElement("span");
    chipEl.className = "rune-unknown";
    chipEl.textContent = label;
    return chipEl;
  }

  // Une colonne d'arbre, dessinée comme en jeu : toutes les runes de l'arbre,
  // celles qui ne sont pas prises restant visibles mais éteintes.
  function runeTreeColumn(side, isPrimary) {
    var tree = state.setup.trees[String(side.tree)];
    var col = document.createElement("div");
    col.className = "rune-tree" + (isPrimary ? " primary" : "");
    if (!tree) return col;

    var head = document.createElement("div");
    head.className = "tree-head";
    var timg = withFallback(document.createElement("img"), FALLBACK_ICON);
    timg.src = DD_IMG + tree.icon;
    timg.alt = "";
    timg.loading = "eager";
    timg.width = 32;
    timg.height = 32;
    head.appendChild(timg);
    var tname = document.createElement("span");
    tname.textContent = tree.name[state.lang] || tree.name.fr;
    head.appendChild(tname);
    col.appendChild(head);

    tree.slots.forEach(function (row, i) {
      // L'arbre secondaire n'a pas de rune clef : sa première ligne est sautée.
      if (!isPrimary && i === 0) return;
      var rowEl = document.createElement("div");
      var keystoneRow = isPrimary && i === 0;
      rowEl.className = "rune-row" + (keystoneRow ? " keystones" : "");
      row.forEach(function (rune) {
        var on = side.picks.indexOf(rune.id) !== -1;
        // 32 px et non 30 : les runes mineures de Data Dragon font 64 px, donc
        // 32 est une réduction exacte de moitié. Toute autre taille rééchantillonne
        // l'image et la rend floue.
        rowEl.appendChild(runeIcon(rune.icon, rune.name[state.lang] || rune.name.fr, on,
          keystoneRow ? 44 : 32));
      });
      col.appendChild(rowEl);
    });

    (side.inconnues || []).forEach(function (label) {
      col.appendChild(unknownChip(label));
    });
    return col;
  }

  function shardsColumn(page) {
    var col = document.createElement("div");
    col.className = "rune-tree shards";
    var head = document.createElement("div");
    head.className = "tree-head";
    var label = document.createElement("span");
    label.textContent = t().shardsTitle;
    head.appendChild(label);
    col.appendChild(head);

    (state.setup.shards || []).forEach(function (row, i) {
      var picked = page.fragments[i];
      var rowEl = document.createElement("div");
      rowEl.className = "rune-row";
      row.forEach(function (shard) {
        var on = !!picked && picked.key === shard.key;
        // Les icônes de fragments ne font que 32 px à la source : on les affiche
        // à leur taille réelle, sinon elles sont redessinées et bavent.
        rowEl.appendChild(runeIcon(shard.icon, locName(shard), on, 32));
      });
      col.appendChild(rowEl);
    });
    return col;
  }

  function setupCardHead(title, badge, why, whyLinks) {
    var head = document.createElement("header");
    head.className = "setup-card-head";
    var line = document.createElement("div");
    line.className = "setup-card-title";
    var h = document.createElement("h3");
    h.textContent = title;
    line.appendChild(h);
    if (badge) {
      var b = document.createElement("span");
      b.className = "setup-badge";
      b.textContent = badge;
      line.appendChild(b);
    }
    head.appendChild(line);
    // « pourquoi » peut porter plusieurs points : un par ligne, alignés sur la
    // même marge, plutôt qu'un paragraphe qui se lit comme une seule phrase.
    if (why.length) {
      var ul = document.createElement("ul");
      ul.className = "setup-why";
      why.forEach(function (line2, index) {
        var li = document.createElement("li");
        var copy = document.createElement("span");
        copy.textContent = line2;
        li.appendChild(copy);
        var link = whyLinks && whyLinks[index];
        if (link && /^https?:\/\//i.test(link)) {
          var a = document.createElement("a");
          a.className = "why-link";
          a.href = link;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = t().watchShort;
          a.setAttribute("aria-label", t().watchShort + " — " + line2);
          li.appendChild(document.createTextNode(" "));
          li.appendChild(a);
        }
        ul.appendChild(li);
      });
      head.appendChild(ul);
    }
    return head;
  }

  // Le générateur écrit des listes, mais un fichier plus ancien peut encore
  // porter une chaîne : les deux formes sortent d'ici en tableau.
  function whyText(entry) {
    var raw = (state.lang === "en" && entry.pourquoiEn && entry.pourquoiEn.length)
      ? entry.pourquoiEn : entry.pourquoi;
    if (!raw) return [];
    return (typeof raw === "string" ? [raw] : raw).filter(function (x) { return !!x; });
  }

  function runeCard(page) {
    var card = document.createElement("article");
    card.className = "setup-card" + (page.mienne ? " is-mine" : "");
    card.appendChild(setupCardHead(page.nom, page.mienne ? t().mineRunes : t().altLabel,
      whyText(page), page.pourquoiLiens));
    var body = document.createElement("div");
    body.className = "rune-page";
    if (page.principal) body.appendChild(runeTreeColumn(page.principal, true));
    if (page.secondaire) body.appendChild(runeTreeColumn(page.secondaire, false));
    if ((page.fragments || []).length) body.appendChild(shardsColumn(page));
    card.appendChild(body);
    return card;
  }

  function itemEl(item) {
    var li = document.createElement("li");
    li.className = "item";
    var name = locName(item);
    if (item.unresolved) {
      li.appendChild(unknownChip(name));
      return li;
    }
    var img = withFallback(document.createElement("img"), FALLBACK_ICON);
    img.src = itemIconUrl(item.icon);
    img.alt = "";
    // Les builds sont loin sous les conseils sur mobile : les charger tout de
    // suite évite une rangée de vignettes vides quand on arrive à la section.
    img.loading = "eager";
    img.width = 44;
    img.height = 44;
    li.appendChild(img);
    var label = document.createElement("span");
    label.className = "item-name";
    label.textContent = name;
    li.appendChild(label);
    return li;
  }

  function itemRow(title, items, ordered) {
    if (!items || !items.length) return null;
    var row = document.createElement("div");
    row.className = "build-row";
    var h = document.createElement("h4");
    h.textContent = title;
    row.appendChild(h);
    var ul = document.createElement("ul");
    ul.className = "item-row" + (ordered ? " ordered" : "");
    items.forEach(function (item) { ul.appendChild(itemEl(item)); });
    row.appendChild(ul);
    return row;
  }

  function buildCard(build) {
    var card = document.createElement("article");
    card.className = "setup-card" + (build.mien ? " is-mine" : "");
    card.appendChild(setupCardHead(build.nom, build.mien ? t().mineBuild : t().altLabel,
      whyText(build), build.pourquoiLiens));
    var body = document.createElement("div");
    body.className = "build-body";
    [
      itemRow(t().buildStart, build.depart, false),
      itemRow(t().buildCore, build.coeur, true),
      itemRow(t().buildBoots, build.bottes ? [build.bottes] : [], false),
      itemRow(t().buildSit, build.situationnel, false)
    ].forEach(function (row) { if (row) body.appendChild(row); });
    card.appendChild(body);
    return card;
  }

  function tipsContent() {
    var raw = state.setup && state.setup.conseils;
    if (!raw) return null;
    var content = raw[state.lang] || raw.fr || raw.en;
    if (!content || !Array.isArray(content.items)) return null;
    return content;
  }

  function renderTips() {
    var block = $("tips-block");
    var list = $("tips-list");
    if (!block || !list) return;
    list.innerHTML = "";
    var content = tipsContent();
    if (!content) {
      block.hidden = true;
      return;
    }
    $("tips-title").textContent = content.titre || "";
    content.items.forEach(function (tip) {
      if (!tip || (!tip.t && !tip.d && !Array.isArray(tip.points))) return;
      var item = document.createElement("li");
      item.className = "tips-item";
      var title = document.createElement("h3");
      title.textContent = tip.t || "";
      item.appendChild(title);
      if (Array.isArray(tip.points) && tip.points.length) {
        var points = document.createElement("ul");
        points.className = "tips-sublist";
        tip.points.forEach(function (point) {
          if (!String(point || "").trim()) return;
          var pointEl = document.createElement("li");
          pointEl.textContent = point;
          points.appendChild(pointEl);
        });
        if (points.children.length) item.appendChild(points);
      } else if (tip.d) {
        var text = document.createElement("p");
        text.textContent = tip.d;
        item.appendChild(text);
      }
      list.appendChild(item);
    });
    block.hidden = list.children.length === 0;
  }

  function renderSetup() {
    if (!$("setup-view")) return;
    $("setup-title").textContent = t().setupTitle;
    $("setup-intro").textContent = t().setupIntro;
    $("setup-tab-runes").textContent = t().setupRunesTab;
    $("setup-tab-builds").textContent = t().setupBuildsTab;
    $("setup-tab-tips").textContent = t().setupTipsTab;
    $("setup-switcher").setAttribute("aria-label", t().setupTabsLabel);
    $("runes-title").textContent = t().runesTitle;
    $("builds-title").textContent = t().buildsTitle;
    $("tips-title").textContent = t().tipsTitle;
    var buildNotice = $("build-notice");
    var buildData = state.setup && state.setup.builds;
    var notice = buildData && (state.lang === "en" ? (buildData.noticeEn || buildData.notice) : buildData.notice);
    if (buildNotice) {
      buildNotice.textContent = notice || "";
      buildNotice.hidden = !notice;
    }

    var status = $("setup-status");
    var runes = $("rune-cards");
    var builds = $("build-cards");
    runes.innerHTML = "";
    builds.innerHTML = "";

    if (state.setupState !== "ok") {
      $("runes-block").hidden = true;
      $("builds-block").hidden = true;
      $("tips-block").hidden = true;
      $("runes-panel").hidden = true;
      $("builds-panel").hidden = true;
      $("tips-panel").hidden = true;
      $("setup-switcher").hidden = true;
      if (buildNotice) buildNotice.hidden = true;
      status.hidden = state.setupState === "idle";
      status.textContent = state.setupState === "error" ? t().setupError : t().setupLoading;
      return;
    }
    var runePages = (state.setup.runes && state.setup.runes.pages) || [];
    var buildPages = (state.setup.builds && state.setup.builds.pages) || [];
    var hasTips = !!tipsContent() && tipsContent().items.length > 0;
    var hasRunes = runePages.length > 0;
    var hasBuilds = buildPages.length > 0;
    if (state.setupSection === "runes" && !hasRunes) {
      state.setupSection = hasBuilds ? "builds" : (hasTips ? "tips" : "runes");
    }
    if (state.setupSection === "builds" && !hasBuilds) {
      state.setupSection = hasRunes ? "runes" : (hasTips ? "tips" : "builds");
    }
    if (state.setupSection === "tips" && !hasTips) {
      state.setupSection = hasRunes ? "runes" : (hasBuilds ? "builds" : "tips");
    }
    var showRunes = state.setupSection === "runes";
    var showBuilds = state.setupSection === "builds";
    var showTips = state.setupSection === "tips";

    $("setup-switcher").hidden = !hasRunes && !hasBuilds && !hasTips;
    $("setup-tab-runes").hidden = !hasRunes;
    $("setup-tab-builds").hidden = !hasBuilds;
    $("setup-tab-tips").hidden = !hasTips;
    $("setup-tab-runes").setAttribute("aria-selected", showRunes ? "true" : "false");
    $("setup-tab-builds").setAttribute("aria-selected", showBuilds ? "true" : "false");
    $("setup-tab-tips").setAttribute("aria-selected", showTips ? "true" : "false");
    $("runes-panel").hidden = !showRunes || !hasRunes;
    $("builds-panel").hidden = !showBuilds || !hasBuilds;
    $("tips-panel").hidden = !showTips || !hasTips;
    $("runes-block").hidden = !hasRunes;
    $("builds-block").hidden = !hasBuilds;
    $("tips-block").hidden = !hasTips;
    renderTips();
    if (!hasRunes && !hasBuilds && !hasTips) {
      status.hidden = false;
      status.textContent = t().setupEmpty;
      return;
    }
    status.hidden = true;
    runePages.forEach(function (page) { runes.appendChild(runeCard(page)); });
    buildPages.forEach(function (build) { builds.appendChild(buildCard(build)); });
  }

  // Les sections matchups et la section runes ne coexistent pas : c'est cette
  // fonction, et elle seule, qui décide ce qui est visible.
  function renderView() {
    var setupOn = state.view === "setup";
    $("setup-view").hidden = !setupOn;
    document.querySelector(".matchups").hidden = setupOn;
    $("matchup-links").hidden = setupOn;
    if (setupOn) {
      $("latest-section").hidden = true;
      $("matchup-panel").hidden = true;
    }
    // Deux libellés dans le bouton : « Retour aux matchups » ne tient pas dans
    // la barre d'un téléphone à côté de la langue et de YouTube, et un texte
    // tronqué serait pire qu'un texte court.
    var btn = $("setup-toggle");
    btn.innerHTML = "";
    var full = document.createElement("span");
    full.className = "lbl-full";
    full.textContent = setupOn ? t().backToMatchups : t().setupNav;
    var short = document.createElement("span");
    short.className = "lbl-short";
    short.textContent = setupOn ? t().backToMatchupsShort : t().setupNavShort;
    btn.appendChild(full);
    btn.appendChild(short);
    if (setupOn) btn.setAttribute("aria-current", "true");
    else btn.removeAttribute("aria-current");
  }

  function renderAll() {
    renderChrome();
    renderTabs();
    renderLatest();
    renderGrid();
    renderPanel(false);
    renderMatchupLinks();
    renderSetup();
    renderView();
  }

  /* ---------- Événements ---------- */

  function bind() {
    $("lang-toggle").addEventListener("click", function () {
      state.lang = state.lang === "fr" ? "en" : "fr";
      try { localStorage.setItem("gyn-lang", state.lang); } catch (e) { /* stockage bloqué */ }
      renderAll();
    });

    $("setup-toggle").addEventListener("click", function () {
      state.view = state.view === "setup" ? "matchups" : "setup";
      if (state.view === "setup") {
        state.champ = null;
        loadSetup();
      }
      writeHash();
      renderAll();
      window.scrollTo({ top: 0 });
    });

    document.querySelectorAll("[data-setup-section]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var section = tab.getAttribute("data-setup-section");
        state.view = "setup";
        state.champ = null;
        state.setupSection = section === "tips" ? "tips" :
          (section === "builds" ? "builds" : "runes");
        loadSetup();
        writeHash();
        renderAll();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      });
      tab.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var tabs = Array.prototype.filter.call(document.querySelectorAll("[data-setup-section]"), function (item) {
          return !item.hidden;
        });
        var index = tabs.indexOf(tab);
        if (index === -1 || tabs.length < 2) return;
        e.preventDefault();
        var next = e.key === "ArrowRight"
          ? tabs[(index + 1) % tabs.length]
          : tabs[(index - 1 + tabs.length) % tabs.length];
        next.focus();
        next.click();
      });
    });

    $("search").addEventListener("input", function (e) {
      state.search = e.target.value;
      renderGrid();
    });

    $("panel-close").addEventListener("click", function () {
      var closed = state.champ;
      state.champ = null;
      writeHash();
      renderGrid();
      renderPanel(false);
      if (closed) focusTile(closed);  // sinon le focus reste sur un bouton caché
    });

    $("brand-link").addEventListener("click", function (e) {
      e.preventDefault();
      state.view = "matchups";
      state.champ = null;
      state.search = "";
      $("search").value = "";
      writeHash();
      renderAll();
      window.scrollTo({ top: 0 });
    });

    window.addEventListener("hashchange", function () {
      var wanted = readHash();
      if (wanted.view === "setup") {
        state.view = "setup";
        state.champ = null;
        state.setupSection = wanted.setupSection || "runes";
        loadSetup();
        renderAll();
        return;
      }
      if (wanted.role) {
        state.view = "matchups";
        if (wanted.role !== state.role) {
          state.search = "";           // même comportement qu'un clic d'onglet
          $("search").value = "";
        }
        state.role = wanted.role;
        state.champ = wanted.champ;
        renderAll();
      } else {
        writeHash();  // hash invalide : on resynchronise l'URL sur l'état affiché
      }
    });
  }

  /* ---------- Démarrage ---------- */

  function fatal(html) {
    var p = document.createElement("p");
    p.className = "noscript";
    p.innerHTML = html;
    var main = document.querySelector("main");
    main.insertBefore(p, main.firstChild);
  }

  // Ouvert en double-clic (file://) : le navigateur bloque le chargement des
  // données JSON. On l'explique au lieu d'afficher une page vide.
  if (location.protocol === "file:") {
    fatal("Ce site ne fonctionne pas en ouvrant le fichier directement.<br>" +
      "En local, lance le serveur puis ouvre <a href=\"http://localhost:8482\">http://localhost:8482</a> — " +
      "en ligne, utilise l'adresse du site.<br><br>" +
      "This site can't run from a double-clicked file. Use the local server URL or the online address.");
    return;
  }

  // « no-cache » = on revalide toujours auprès du serveur (304 si rien n'a
  // changé) : sinon les 10 minutes de cache de GitHub Pages font afficher
  // d'anciennes données après une mise à jour.
  var FRESH = { cache: "no-cache" };

  Promise.all([
    fetch("data/champions.json", FRESH).then(function (r) { return r.json(); }),
    fetch("data/videos.json", FRESH).then(function (r) { return r.json(); }),
    // Fichier annexe écrit à la main : s'il manque ou s'il est mal formé, le
    // site s'affiche quand même — sans les notes ni les bans.
    fetch("data/notes.json", FRESH).then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
  ]).then(function (results) {
    state.champs = results[0];
    state.data = results[1];
    state.notesFile = results[2] || {};
    state.lang = detectLang();
    buildIndexes();
    buildTabs();
    var wanted = readHash();
    state.view = wanted.view === "setup" ? "setup" : "matchups";
    state.role = wanted.role || defaultRole();
    state.champ = wanted.champ;
    state.setupSection = wanted.setupSection || "runes";
    bind();
    renderAll();
    if (state.view === "setup") loadSetup();
  }).catch(function (err) {
    fatal("Erreur de chargement des données — recharge la page.<br>Data loading error — reload the page.");
    if (window.console) console.error(err);
  });
})();
