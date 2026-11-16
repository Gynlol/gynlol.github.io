/* Shared sort preference for matchup replays and their generated SEO pages. */
(function () {
  "use strict";

  var STORAGE_KEY = "gyn-matchups-sort";
  var TIERS = {
    iron: 0,
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
    emerald: 5,
    diamond: 6,
    master: 7,
    grandmaster: 8,
    challenger: 9
  };
  var memoryMode = "patch";

  function getMode() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "rank" || saved === "patch") return saved;
      if (saved === "date") {
        memoryMode = "patch";
        window.localStorage.setItem(STORAGE_KEY, "patch");
        return memoryMode;
      }
      return memoryMode;
    } catch (error) {
      return memoryMode;
    }
  }

  function rankScore(video) {
    var rank = String(video && video.rank || "").toLowerCase().replace(/\s+/g, "");
    if (!Object.prototype.hasOwnProperty.call(TIERS, rank)) return -1;

    var tier = TIERS[rank];
    var score = tier * 1000000;
    var division = parseInt(video.division, 10);
    var lp = Number(video.lp);

    if (tier <= TIERS.diamond && isFinite(division)) {
      score += (5 - Math.max(1, Math.min(4, division))) * 10000;
    }
    if (isFinite(lp)) score += lp;
    return score;
  }

  function dateScore(video) {
    var date = Date.parse(video && (video.published || video.date) || "");
    return isFinite(date) ? date : 0;
  }

  function parsePatchVersion(value) {
    if (value === null || value === undefined) return null;
    var match = String(value).trim().match(/(\d+(?:\.\d+)*)([a-z][a-z0-9.-]*)?$/i);
    if (!match) return null;
    var parts = match[1].split(".").map(function (part) {
      var number = Number(part);
      return isFinite(number) && Math.floor(number) === number ? number : null;
    });
    if (parts.some(function (part) { return part === null; })) return null;
    return { parts: parts, suffix: (match[2] || "").toLowerCase() };
  }

  // Ordre croissant; l'appelant inverse le signe pour afficher le patch récent en premier.
  function comparePatchVersions(a, b) {
    var left = parsePatchVersion(a);
    var right = parsePatchVersion(b);
    if (!left && !right) return 0;
    if (!left) return -1;
    if (!right) return 1;

    var length = Math.max(left.parts.length, right.parts.length);
    for (var i = 0; i < length; i++) {
      var leftPart = left.parts[i] || 0;
      var rightPart = right.parts[i] || 0;
      if (leftPart !== rightPart) return leftPart < rightPart ? -1 : 1;
    }
    if (left.suffix === right.suffix) return 0;
    if (!left.suffix) return 1;
    if (!right.suffix) return -1;
    return left.suffix < right.suffix ? -1 : 1;
  }

  function compareVideos(a, b, selectedMode) {
    if (selectedMode === "rank") {
      var rankDifference = rankScore(b) - rankScore(a);
      if (rankDifference) return rankDifference;
    } else {
      var patchDifference = comparePatchVersions(a && a.patch, b && b.patch);
      if (patchDifference) return -patchDifference;
    }
    return dateScore(b) - dateScore(a);
  }

  function sortVideos(videos, selectedMode) {
    var chosen = selectedMode === "rank" ? "rank" : "patch";
    return (videos || []).slice().sort(function (a, b) {
      return compareVideos(a, b, chosen);
    });
  }

  function updateButtons() {
    var selectedMode = getMode();
    document.querySelectorAll("button[data-sort-mode]").forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        button.getAttribute("data-sort-mode") === selectedMode ? "true" : "false"
      );
    });
  }

  function sortStaticLists() {
    var selectedMode = getMode();
    document.querySelectorAll("[data-sort-list]").forEach(function (list) {
      var items = Array.prototype.filter.call(list.children, function (item) {
        return item.hasAttribute("data-sort-item");
      });
      items.sort(function (a, b) {
        return compareVideos({
          rank: a.getAttribute("data-rank-tier"),
          division: a.getAttribute("data-rank-division"),
          lp: a.getAttribute("data-rank-lp"),
          patch: a.getAttribute("data-sort-patch"),
          published: a.getAttribute("data-sort-date")
        }, {
          rank: b.getAttribute("data-rank-tier"),
          division: b.getAttribute("data-rank-division"),
          lp: b.getAttribute("data-rank-lp"),
          patch: b.getAttribute("data-sort-patch"),
          published: b.getAttribute("data-sort-date")
        }, selectedMode);
      });
      items.forEach(function (item) { list.appendChild(item); });
    });
  }

  function dispatchChange(selectedMode) {
    document.dispatchEvent(new CustomEvent("matchup-sort-change", {
      detail: { mode: selectedMode }
    }));
  }

  function saveMode(nextMode) {
    if (nextMode !== "rank" && nextMode !== "patch") return getMode();
    memoryMode = nextMode;
    try { window.localStorage.setItem(STORAGE_KEY, nextMode); } catch (error) { /* stockage bloqué */ }
    updateButtons();
    return nextMode;
  }

  document.addEventListener("click", function (event) {
    var button = event.target;
    while (button && button !== document &&
           !(button.nodeType === 1 && button.matches("button[data-sort-mode]"))) {
      button = button.parentNode;
    }
    if (!button || button === document) return;

    var selectedMode = saveMode(button.getAttribute("data-sort-mode"));
    sortStaticLists();
    dispatchChange(selectedMode);
  });

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY) return;
    memoryMode = event.newValue === "rank" ? "rank" : "patch";
    updateButtons();
    sortStaticLists();
    dispatchChange(memoryMode);
  });

  function initialize() {
    updateButtons();
    sortStaticLists();
  }

  window.NunuMatchupSort = {
    getMode: getMode,
    rankScore: rankScore,
    parsePatchVersion: parsePatchVersion,
    comparePatchVersions: comparePatchVersions,
    sortVideos: sortVideos
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
