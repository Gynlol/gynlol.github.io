(function () {
  "use strict";

  var link = document.getElementById("twitch-link");
  var statusText = document.getElementById("twitch-status");
  if (!link || !statusText) return;

  var endpoint = "https://decapi.me/twitch/uptime/gyn_lol";
  var state = "checking";
  var checking = false;
  var lastAttempt = 0;
  var intervalMs = 120000;
  var timeoutMs = 8000;

  var copy = {
    fr: {
      checking: "VÉRIFICATION",
      live: "EN DIRECT",
      offline: "HORS LIGNE",
      unavailable: "STATUT INDISPONIBLE",
      aria: {
        checking: "Vérifier le direct Twitch de Gyn_lol",
        live: "Regarder Gyn_lol en direct sur Twitch",
        offline: "Ouvrir la chaîne Twitch de Gyn_lol, actuellement hors ligne",
        unavailable: "Ouvrir la chaîne Twitch de Gyn_lol, statut indisponible"
      }
    },
    en: {
      checking: "CHECKING",
      live: "LIVE",
      offline: "OFFLINE",
      unavailable: "STATUS UNAVAILABLE",
      aria: {
        checking: "Check Gyn_lol's Twitch stream",
        live: "Watch Gyn_lol live on Twitch",
        offline: "Open Gyn_lol's Twitch channel, currently offline",
        unavailable: "Open Gyn_lol's Twitch channel, status unavailable"
      }
    }
  };

  function language() {
    return document.documentElement.lang.toLowerCase().indexOf("en") === 0 ? "en" : "fr";
  }

  function render(nextState) {
    state = nextState;
    var words = copy[language()];
    if (statusText.textContent !== words[state]) statusText.textContent = words[state];
    link.classList.remove("is-checking", "is-live", "is-offline", "is-unavailable");
    link.classList.add("is-" + state);
    link.setAttribute("data-stream-state", state);
    link.setAttribute("aria-label", words.aria[state]);
    link.title = words.aria[state];
  }

  function classify(body) {
    var text = String(body || "").trim().toLowerCase();
    if (!text) return "unavailable";
    if (/\b(?:offline|not live|not streaming)\b/.test(text)) return "offline";
    if (/\b(?:error|invalid|not found|unknown|unable|could not)\b/.test(text)) {
      return "unavailable";
    }
    if (/\b(?:live|streaming)\b/.test(text) ||
        /\b\d+\s*(?:d|days?|h|hours?|m|minutes?|s|seconds?)\b/.test(text)) {
      return "live";
    }
    return "unavailable";
  }

  async function refresh(force) {
    if (checking || document.visibilityState === "hidden") return;
    if (!force && Date.now() - lastAttempt < 60000) return;

    checking = true;
    lastAttempt = Date.now();
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, timeoutMs);

    try {
      var response = await fetch(endpoint, {
        method: "GET",
        headers: { Accept: "text/plain" },
        cache: "no-store",
        referrerPolicy: "no-referrer",
        signal: controller.signal
      });
      if (!response.ok) {
        render("unavailable");
        return;
      }
      render(classify(await response.text()));
    } catch (error) {
      render("unavailable");
    } finally {
      window.clearTimeout(timeout);
      checking = false;
    }
  }

  if (window.MutationObserver) {
    new MutationObserver(function () { render(state); }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }

  document.addEventListener("visibilitychange", function () { refresh(false); });
  window.setInterval(function () { refresh(true); }, intervalMs);
  render("checking");
  refresh(true);
}());
