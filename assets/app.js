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
      setupIntro: "Ce que je prends sur Nunu, quel que soit le rôle : ma page et mon build en premier, les variantes en dessous avec la raison de les prendre.",
      runesTitle: "Pages de runes",
      buildsTitle: "Builds",
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
      banText: function (role) { return "Je le ban à chaque game quand je joue " + role + ". Tu ne verras donc pas ce matchup en replay."; },
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
      setupIntro: "What I take on Nunu, whatever the role: my page and my build first, the variants below with the reason to pick them.",
      runesTitle: "Rune pages",
      buildsTitle: "Builds",
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
      banText: function (role) { return "I ban them every game when I play " + role + ", so this matchup will never show up in the replays."; },
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
    setupState: "idle" // idle | loading | ok | error
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

  // #setup, #runes, #build : trois portes vers la même vue, parce qu'un lien
  // partagé de mémoire ne tombe jamais sur le mot exact.
  var SETUP_HASHES = ["setup", "runes", "build", "builds"];

  function readHash() {
    var h;
    try {
      h = decodeURIComponent((location.hash || "").replace(/^#/, "")).toLowerCase();
    } catch (e) {
      return { view: null, role: null, champ: null };  // encodage % malformé : hash ignoré
    }
    if (!h) return { view: null, role: null, champ: null };
    var parts = h.split("/");
    if (SETUP_HASHES.indexOf(parts[0]) !== -1) return { view: "setup", role: null, champ: null };
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
    return { view: "matchups", role: role, champ: champ };
  }

  function writeHash() {
    var h = "";
    if (state.view === "setup") h = "#setup";
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

  // Grille « à savoir » : les notes écrites à la main dans data/notes.json,
  // précédées de la carte de ban quand le champion est un ban de rôle.
  function noteCard(title, text, kind) {
    var card = document.createElement("article");
    card.className = "note note-" + (kind || "info");
    var h = document.createElement("h4");
    h.className = "note-title";
    h.textContent = title;
    var p = document.createElement("p");
    p.className = "note-text";
    p.textContent = text;
    card.appendChild(h);
    if (text) card.appendChild(p);
    return card;
  }

  function renderNotes(entry) {
    var col = $("notes-col");
    var grid = $("notes-grid");
    grid.innerHTML = "";
    var banned = isBanned(state.role, entry.id);
    if (banned) {
      grid.appendChild(noteCard(t().banTitle, t().banText(t().roleNames[state.role]), "ban"));
    }
    notesFor(state.role, entry.id).forEach(function (n) {
      if (!n || !n.t) return;
      grid.appendChild(noteCard(String(n.t), n.d ? String(n.d) : "", n.k));
    });
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
    img.loading = "lazy";
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
    timg.loading = "lazy";
    timg.width = 24;
    timg.height = 24;
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
        rowEl.appendChild(runeIcon(rune.icon, rune.name[state.lang] || rune.name.fr, on,
          keystoneRow ? 44 : 30));
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
        rowEl.appendChild(runeIcon(shard.icon, locName(shard), on, 26));
      });
      col.appendChild(rowEl);
    });
    return col;
  }

  function setupCardHead(title, badge, why) {
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
      why.forEach(function (line2) {
        var li = document.createElement("li");
        li.textContent = line2;
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
    card.appendChild(setupCardHead(page.nom, page.mienne ? t().mineRunes : t().altLabel, whyText(page)));
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
    img.loading = "lazy";
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
    card.appendChild(setupCardHead(build.nom, build.mien ? t().mineBuild : t().altLabel, whyText(build)));
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

  function renderSetup() {
    if (!$("setup-view")) return;
    $("setup-title").textContent = t().setupTitle;
    $("setup-intro").textContent = t().setupIntro;
    $("runes-title").textContent = t().runesTitle;
    $("builds-title").textContent = t().buildsTitle;

    var status = $("setup-status");
    var runes = $("rune-cards");
    var builds = $("build-cards");
    runes.innerHTML = "";
    builds.innerHTML = "";

    if (state.setupState !== "ok") {
      $("runes-block").hidden = true;
      $("builds-block").hidden = true;
      status.hidden = state.setupState === "idle";
      status.textContent = state.setupState === "error" ? t().setupError : t().setupLoading;
      return;
    }
    var runePages = (state.setup.runes && state.setup.runes.pages) || [];
    var buildPages = (state.setup.builds && state.setup.builds.pages) || [];
    $("runes-block").hidden = !runePages.length;
    $("builds-block").hidden = !buildPages.length;
    if (!runePages.length && !buildPages.length) {
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
    bind();
    renderAll();
    if (state.view === "setup") loadSetup();
  }).catch(function (err) {
    fatal("Erreur de chargement des données — recharge la page.<br>Data loading error — reload the page.");
    if (window.console) console.error(err);
  });
})();
