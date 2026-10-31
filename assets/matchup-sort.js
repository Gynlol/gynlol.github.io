/* Shared sort preference for the matchup app and its generated replay pages. */
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
  var memoryMode = "date";

  function getMode() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === "rank" || saved === "date" ? saved : memoryMode;
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

  function compareVideos(a, b, selectedMode) {
    if (selectedMode === "rank") {
      var rankDifference = rankScore(b) - rankScore(a);
      if (rankDifference) return rankDifference;
    }
    return dateScore(b) - dateScore(a);
  }

  function sortVideos(videos, selectedMode) {
    var chosen = selectedMode === "rank" ? "rank" : "date";
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
          published: a.getAttribute("data-sort-date")
        }, {
          rank: b.getAttribute("data-rank-tier"),
          division: b.getAttribute("data-rank-division"),
          lp: b.getAttribute("data-rank-lp"),
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
    if (nextMode !== "rank" && nextMode !== "date") return getMode();
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
    memoryMode = event.newValue === "rank" ? "rank" : "date";
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
    sortVideos: sortVideos
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
