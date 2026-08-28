# -*- coding: utf-8 -*-
"""Met à jour data/videos.json depuis le flux RSS de la chaîne YouTube.

- Lit le flux public (aucune clé API) : titres, ids, dates.
- Parse chaque titre « Nunu <rôle> vs <champion> … » ; hors gabarit = ignoré.
- Fusionne avec le fichier existant : le flux RSS ne contient que les ~15
  dernières vidéos, le JSON committé est donc la base persistante — on ne
  supprime jamais une entrée simplement parce qu'elle a quitté le flux.
- Ne réécrit le fichier que si le contenu utile change (sinon le job CI
  committerait à chaque heure).

Stdlib uniquement : tourne tel quel sur un runner GitHub Actions.
"""
import json
import os
import re
import sys
import unicodedata
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

CHANNEL_ID = "UCbCzW8Qt_rDveIhHsVyOGUA"
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
DDRAGON_VERSIONS = "https://ddragon.leagueoflegends.com/api/versions.json"

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
VIDEOS_PATH = os.path.join(DATA_DIR, "videos.json")
CHAMPIONS_PATH = os.path.join(DATA_DIR, "champions.json")

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
}

ROLE_TOKENS = {
    "top": "top", "toplane": "top",
    "jungle": "jungle", "jgl": "jungle", "jg": "jungle", "jungler": "jungle",
    "mid": "mid", "midlane": "mid",
    "adc": "adc", "bot": "adc", "botlane": "adc", "bottom": "adc",
    "support": "support", "supp": "support", "sup": "support",
}

# Le segment champion s'arrête sur ces mots quand on doit deviner (champion
# inconnu de la base) — jamais utilisés pour un champion connu, donc
# « Master Yi » ne pose pas de problème.
STOPWORDS = {
    "euw", "eune", "na", "kr", "oce", "br", "lan", "las", "tr", "ru", "jp",
    "vn", "sea", "me", "pbe",
    "iron", "bronze", "silver", "gold", "platinum", "plat", "emerald",
    "diamond", "master", "grandmaster", "gm", "challenger", "unranked",
    "fer", "argent", "platine", "emeraude", "diamant", "maitre", "chall",
    "dia", "golden", "grandmaitre", "road", "climb",
    "patch", "win", "loss", "lose", "defeat", "victory", "lp",
    "fr", "en", "replay", "gameplay", "guide", "montage",
}

TITLE_RE = re.compile(
    r"^\W*nunu(?:\s*&\s*willump)?\s+"
    r"(?P<role>[a-z]+)\s+"
    r"vs\.?\s+"
    r"(?P<tail>.+)$",
    re.IGNORECASE,
)


def strip_accents(s):
    """Translittère les lettres accentuées (Séraphine -> Seraphine)."""
    return "".join(c for c in unicodedata.normalize("NFKD", s)
                   if not unicodedata.combining(c))


def norm(s):
    """Normalise un nom pour la comparaison : minuscules, alphanumérique."""
    return re.sub(r"[^a-z0-9]", "", strip_accents(s).lower())


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build_name_index(champs):
    index = {}
    for c in champs["champions"]:
        index[norm(c["id"])] = c["id"]
        index[norm(c["name"])] = c["id"]
    for alias, cid in champs.get("aliases", {}).items():
        index[norm(alias)] = cid
    return index


def display_names(champs):
    return {c["id"]: c["name"] for c in champs["champions"]}


# Les 10 rangs, du plus bas au plus haut. La série va de Gold à Master, mais
# tout le palier est prévu : un titre en Bronze ou en Challenger sera lu
# pareil. Les alias couvrent les abréviations et l'orthographe FR (les
# accents sont retirés avant comparaison).
RANK_TIERS = [
    ("Iron", ["iron", "fer"]),
    ("Bronze", ["bronze"]),
    ("Silver", ["silver", "argent"]),
    ("Gold", ["gold", "golden"]),
    ("Platinum", ["platinum", "platine", "plat"]),
    ("Emerald", ["emerald", "emeraude"]),
    ("Diamond", ["diamond", "diamant", "dia"]),
    ("Master", ["master", "maitre"]),
    ("Grandmaster", ["grandmaster", "grand master", "grand maitre",
                     "grandmaitre", "gm"]),
    ("Challenger", ["challenger", "chall"]),
]
RANK_ORDER = [r for r, _ in RANK_TIERS]
# Master et au-dessus n'ont pas de division dans le jeu.
APEX_RANKS = {"Master", "Grandmaster", "Challenger"}
RANK_BY_ALIAS = {a: r for r, aliases in RANK_TIERS for a in aliases}
# Alias les plus longs d'abord : « grand master » avant « master », sinon
# l'alternance s'arrête sur le préfixe le plus court.
RANK_WORDS = "|".join(
    re.escape(a).replace(r"\ ", r"\s+")
    for a in sorted(RANK_BY_ALIAS, key=len, reverse=True))
# Le rang qui compte est celui collé aux LP (« Gold 4 42 LP »). Un rang cité
# ailleurs est souvent un OBJECTIF de série (« Unranked to Master »), pas le
# rang de la game : on ne le retient qu'en dernier recours, et jamais quand
# il est amené par « to / vers / → ».
RANK_LP_RE = re.compile(
    # La division, quand elle est là, est un mot entier suivi d'un séparateur :
    # sinon le « 1 » de « Master 100 LP » passerait pour une division.
    r"\b(" + RANK_WORDS + r")\b\s*(?:(IV|III|II|I|[1-4])\b[\s,:;.–—-]+)?"
    r"[\s,:;.–—-]*(\d+)\s*LP\b",
    re.IGNORECASE)
RANK_DIV_RE = re.compile(
    r"\b(" + RANK_WORDS + r")\b\s*(IV|III|II|I|[1-4])\b", re.IGNORECASE)
RANK_ANY_RE = re.compile(r"\b(" + RANK_WORDS + r")\b", re.IGNORECASE)
GOAL_RE = re.compile(r"(?:\bto\b|\bvers\b|→|->)\s*$", re.IGNORECASE)
LP_RE = re.compile(r"(\d+)\s*LP\b", re.IGNORECASE)
ROMAN = {"i": "1", "ii": "2", "iii": "3", "iv": "4"}


def norm_rank(word):
    key = re.sub(r"\s+", " ", strip_accents(word).strip().lower())
    return RANK_BY_ALIAS.get(key)


def norm_div(rank, word):
    """Division 1-4, jamais au-dessus de Diamond."""
    if not word or rank in APEX_RANKS:
        return None
    return ROMAN.get(word.lower(), word)


def parse_rank(rest):
    """(rang, division, lp) — priorité au rang qui porte les LP."""
    m = RANK_LP_RE.search(rest)
    if m:
        rank = norm_rank(m.group(1))
        return rank, norm_div(rank, m.group(2)), int(m.group(3))

    lm = LP_RE.search(rest)
    lp = int(lm.group(1)) if lm else None

    # Rang + division explicite (« Gold 4 ») sans LP collés.
    m = RANK_DIV_RE.search(rest)
    if m and not GOAL_RE.search(rest[:m.start()]):
        rank = norm_rank(m.group(1))
        if rank not in APEX_RANKS:
            return rank, norm_div(rank, m.group(2)), lp

    # Dernier recours : premier rang non amené par « to / vers / → ».
    fallback = None
    for m in RANK_ANY_RE.finditer(rest):
        if GOAL_RE.search(rest[:m.start()]):
            if fallback is None:
                fallback = norm_rank(m.group(1))
            continue
        return norm_rank(m.group(1)), None, lp
    return fallback, None, lp


def parse_title(title, name_index, names):
    """Retourne (video_fields | None). None = hors gabarit, à ignorer."""
    m = TITLE_RE.match(title)
    if not m:
        return None
    role = ROLE_TOKENS.get(m.group("role").lower())
    if not role:
        return None

    tail = m.group("tail").strip()
    # Segment avant le premier séparateur dur : le nom du champion vit là.
    seg_match = re.match(r"[^—–|,(\[]+", tail)
    seg = seg_match.group(0).strip() if seg_match else ""
    words = seg.split()

    def rest_after(n):
        """Ce qui suit les n premiers mots dans le titre ORIGINAL (position
        exacte : les séparateurs collés au nom restent dans le reste)."""
        pat = r"\s*".join(re.escape(w) for w in words[:n])
        mm = re.match(pat, tail)
        return tail[mm.end():] if mm else ""

    enemy_id = None
    enemy_name = None
    rest = ""
    # Champion connu d'abord, du plus long préfixe au plus court : règle
    # « Master Yi » avant que « Master » ne soit vu comme un rang.
    for n in (3, 2, 1):
        if len(words) < n:
            continue
        cand = norm(" ".join(words[:n]))
        if cand and cand in name_index:
            enemy_id = name_index[cand]
            enemy_name = names.get(enemy_id, " ".join(words[:n]))
            rest = rest_after(n)
            break

    if enemy_id is None:
        # Champion absent de la base (futur champion) : on ne devine que si
        # ça ressemble à un nom propre — 1 ou 2 mots capitalisés, hors mots
        # réservés et chiffres. Tout le reste = hors gabarit, ignoré.
        guess = []
        for w in words[:2]:
            wclean = w.strip(".,:;!?'\"")
            if (not wclean
                    or not re.match(r"^[A-Za-zÀ-ÖØ-öø-ÿ'.&]+$", wclean)
                    or not wclean[0].isupper()
                    or norm(wclean) in STOPWORDS):
                break
            guess.append(w)
        if not guess:
            return None
        enemy_name = " ".join(guess)
        enemy_id = "".join(p.capitalize() for p in
                           re.split(r"[^A-Za-z0-9]+", strip_accents(enemy_name)) if p)
        if not enemy_id:
            return None
        rest = rest_after(len(guess))
    patch = None
    pm = re.search(r"patch\s+([\d.]+)", rest, re.IGNORECASE)
    if pm:
        patch = pm.group(1).rstrip(".")
    rank, division, lp = parse_rank(rest)
    region = None
    gm = re.search(r"\b(EUW|EUNE|NA|KR|OCE|BR|LAN|LAS|TR|RU|JP|VN|SEA|ME)\b", rest)
    if gm:
        region = gm.group(1)
    result = None
    if re.search(r"\(WIN\)|\bWIN\b", rest, re.IGNORECASE):
        result = "win"
    elif re.search(r"\(LOSS\)|\bLOSS\b|\bDEFEAT\b", rest, re.IGNORECASE):
        result = "loss"

    return {
        "role": role,
        "enemy": enemy_id,
        "enemyName": enemy_name,
        "patch": patch,
        "rank": rank,
        "division": division,
        "lp": lp,
        "region": region,
        "result": result,
    }


def fetch(url, tries=4):
    """Lecture réseau avec reprises.

    Le flux RSS de YouTube refuse ou coupe régulièrement les requêtes venues
    des machines de GitHub Actions. Sans reprise, un incident réseau de trois
    secondes fait échouer tout le passage horaire, et la vidéo du jour n'entre
    pas sur le site avant le passage suivant — qui peut être des heures plus
    tard. Quatre essais espacés coûtent au pire une minute.
    """
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (matchup-site-updater)"})
    last = None
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as exc:
            last = exc
            if attempt == tries - 1:
                break
            wait = 5 * (attempt + 1)
            print("avertissement : %s injoignable (%s) — nouvel essai dans %ds"
                  % (url, exc, wait), file=sys.stderr)
            time.sleep(wait)
    raise last


def fetch_feed():
    root = ET.fromstring(fetch(FEED_URL))
    entries = []
    for e in root.findall("atom:entry", NS):
        vid = e.findtext("yt:videoId", default=None, namespaces=NS)
        title = e.findtext("atom:title", default="", namespaces=NS)
        published = e.findtext("atom:published", default="", namespaces=NS)
        if vid and title:
            entries.append({"id": vid, "title": title.strip(), "published": published})
    return entries


def fetch_ddragon_version(fallback):
    try:
        versions = json.loads(fetch(DDRAGON_VERSIONS))
        if isinstance(versions, list) and versions:
            return versions[0]
    except Exception as exc:  # réseau/format : on garde l'ancienne version
        print(f"avertissement : versions.json inaccessible ({exc})", file=sys.stderr)
    return fallback


def main():
    champs = load_json(CHAMPIONS_PATH)
    name_index = build_name_index(champs)
    names = display_names(champs)

    old = {"meta": {}, "videos": []}
    if os.path.exists(VIDEOS_PATH):
        old = load_json(VIDEOS_PATH)
    by_id = {v["id"]: v for v in old.get("videos", [])}

    entries = fetch_feed()
    added, updated, ignored = [], [], []
    for e in entries:
        parsed = parse_title(e["title"], name_index, names)
        if parsed is None:
            ignored.append(e["title"])
            # Titre corrigé dans l'autre sens (matchait avant, plus maintenant)
            # tant qu'il est dans le flux : on retire l'entrée.
            if e["id"] in by_id:
                del by_id[e["id"]]
            continue
        record = {
            "id": e["id"],
            "title": e["title"],
            "published": e["published"],
            **parsed,
        }
        if e["id"] not in by_id:
            by_id[e["id"]] = record
            added.append(e["title"])
        elif by_id[e["id"]] != record:
            by_id[e["id"]] = record
            updated.append(e["title"])

    videos = sorted(by_id.values(), key=lambda v: v["published"], reverse=True)
    dd_version = fetch_ddragon_version(old.get("meta", {}).get("ddragonVersion", "15.1.1"))

    new = {
        "meta": {
            "channelId": CHANNEL_ID,
            "channelUrl": "https://www.youtube.com/@GynReplays",
            "ddragonVersion": dd_version,
            "updated": old.get("meta", {}).get("updated"),
        },
        "videos": videos,
    }

    # Comparaison sans le timestamp : pas de changement utile = pas d'écriture
    # = pas de commit CI.
    def essence(doc):
        d = json.loads(json.dumps(doc))
        d.get("meta", {}).pop("updated", None)
        return d

    if essence(new) == essence(old):
        print(f"aucun changement — {len(videos)} vidéo(s), {len(ignored)} titre(s) hors gabarit")
        for t in ignored:
            print(f"  ignoré : {t}")
        return

    new["meta"]["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(VIDEOS_PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(new, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"{len(videos)} vidéo(s) au total — {len(added)} ajoutée(s), {len(updated)} mise(s) à jour")
    for t in added:
        print(f"  + {t}")
    for t in updated:
        print(f"  ~ {t}")
    for t in ignored:
        print(f"  ignoré : {t}")


if __name__ == "__main__":
    main()
