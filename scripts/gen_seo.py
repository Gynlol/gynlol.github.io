# -*- coding: utf-8 -*-
"""Génère les pages statiques de référencement + sitemap.xml.

Pour chaque matchup ayant au moins une vidéo, écrit
`matchups/<role>/<champion>/index.html` : une vraie page indexable par
Google (titre, description, JSON-LD VideoObject), avec les vidéos et un
lien vers l'application. Regénéré par le job horaire — sortie déterministe
(pas de timestamp de génération) pour ne committer que les vrais changements.
"""
import html
import json
import os
import re
import shutil
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SITE = "https://gynlol.github.io"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA_DIR = os.path.join(ROOT, "data")
OUT_DIR = os.path.join(ROOT, "matchups")

ROLE_NAMES = {"top": "Top", "mid": "Mid", "adc": "ADC", "support": "Support"}
ROLE_ORDER = ["top", "mid", "adc", "support"]

PAGE_CSS = """
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0e14;color:#e9f0f7;font:15px/1.5 'Segoe UI',system-ui,sans-serif;min-height:100vh}
a{color:#6fd3ff;text-decoration:none}a:hover{color:#a5e3ff}
.shell{max-width:860px;margin:0 auto;padding:0 20px}
header{border-bottom:1px solid #1d2735;padding:14px 0}
.brand{font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#e9f0f7}
.brand span{color:#6fd3ff}
main{padding:28px 0 48px}
h1{font-size:26px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px}
h1 .vs{color:#6fd3ff}
.sub{color:#8593a5;font-size:14px;margin-bottom:22px}
.card{display:flex;gap:14px;background:#101722;border:1px solid #1d2735;border-radius:8px;overflow:hidden;color:#e9f0f7;margin-bottom:12px}
.card:hover{border-color:#6fd3ff}
.card img{width:200px;aspect-ratio:16/9;object-fit:cover;flex:none}
.card .meta{padding:12px 14px 12px 0;min-width:0}
.card .title{font-weight:600;font-size:14.5px;line-height:1.4}
.card .chips{color:#9db0c4;font-size:12.5px;margin-top:8px}
.rk{border-radius:4px;padding:1px 7px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
{RANK_CSS}
.ban{display:inline-block;background:#ff5a5a;color:#1a0508;font-size:11px;font-weight:700;letter-spacing:.1em;padding:4px 6px;border-radius:4px;vertical-align:middle;margin-left:6px}
.notes{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin:22px 0 4px}
.notes h2{grid-column:1/-1;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#8593a5;font-weight:700}
.note{background:#101722;border:1px solid #1d2735;border-left:3px solid #6fd3ff;border-radius:6px;padding:10px 12px}
.note b{display:block;font-size:12.5px;color:#6fd3ff;margin-bottom:4px}
.note p{font-size:13px;line-height:1.5;color:#9db0c4}
.note.plus{border-left-color:#39d98a}.note.plus b{color:#39d98a}
.note.moins{border-left-color:#ff7a7a}.note.moins b{color:#ff7a7a}
.note.ban{border-left-color:#ff5a5a;background:rgba(255,90,90,.13)}.note.ban b{color:#ff5a5a}
.lvl{display:inline-block;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#0a0e14;border-radius:4px;font-size:12.5px;line-height:1;padding:5px 9px;margin-right:10px;vertical-align:middle}
.lvl-facile{background:#39d98a}.lvl-moyen{background:#ffab3d}.lvl-dur{background:#ff5a5a}
.cta{display:inline-block;border:1px solid #6fd3ff;border-radius:6px;padding:11px 18px;margin:18px 12px 0 0;font-weight:600;font-size:13px;letter-spacing:.06em;text-transform:uppercase}
footer{border-top:1px solid #1d2735;color:#8593a5;font-size:13px;padding:18px 0}
@media(max-width:640px){.card{flex-direction:column}.card img{width:100%}.card .meta{padding:0 14px 12px}}
""".strip()



# Les 10 paliers, mêmes teintes que le SPA (assets/style.css) : la couleur
# du rang doit être la même sur la page matchup et sur le site.
RANK_COLORS = {
    "iron": "#a7aeb8", "bronze": "#cd9061", "silver": "#c2cedb",
    "gold": "#ffc95c", "platinum": "#5fe0d0", "emerald": "#4fd97f",
    "diamond": "#8ab8ff", "master": "#c98cff", "grandmaster": "#ff8f8f",
    "challenger": "#ffe6a3",
}


def hex_rgba(color, alpha):
    r, g, b = (int(color[i:i + 2], 16) for i in (1, 3, 5))
    return f"rgba({r},{g},{b},{alpha})"


RANK_CSS = "".join(
    f".rk-{k}{{color:{c};background:{hex_rgba(c, 0.14)}}}"
    for k, c in RANK_COLORS.items()
) + ".rk-challenger{box-shadow:inset 0 0 0 1px rgba(255,230,163,.45)}"

PAGE_CSS = PAGE_CSS.replace("{RANK_CSS}", RANK_CSS)


def esc(s):
    return html.escape(s, quote=True)


def fmt_date_fr(iso):
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", iso or "")
    if not m:
        return ""
    mois = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet",
            "août", "septembre", "octobre", "novembre", "décembre"]
    return f"{int(m.group(3))} {mois[int(m.group(2))]} {m.group(1)}"


def load(name):
    with open(os.path.join(DATA_DIR, name), encoding="utf-8") as f:
        return json.load(f)


def video_ld(v):
    return {
        "@type": "VideoObject",
        "name": v["title"],
        "description": v["title"] + " — replay complet League of Legends, chaîne Gyn Replays.",
        "thumbnailUrl": f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg",
        "uploadDate": (v.get("published") or "")[:10],
        "contentUrl": f"https://www.youtube.com/watch?v={v['id']}",
        "embedUrl": f"https://www.youtube.com/embed/{v['id']}",
    }


def rank_label(v, lp=True):
    """« Gold 4 42 LP » — la division n'existe que sous Master."""
    if not v.get("rank"):
        return ""
    s = v["rank"]
    if v.get("division"):
        s += f" {v['division']}"
    if lp and v.get("lp") is not None:
        s += f" {v['lp']} LP"
    return s


def load_notes():
    """data/notes.json est écrit à la main : absent ou cassé, on s'en passe."""
    try:
        raw = load("notes.json")
    except (OSError, ValueError):
        return {}, {}, {}
    bans = {}
    for role, names in (raw.get("bans") or {}).items():
        if role in ROLE_NAMES:
            bans[role] = {re.sub(r"[^a-z0-9]", "", str(n).lower()) for n in (names or [])}
    levels = {}
    for key, val in (raw.get("niveaux") or {}).items():
        lvl = LEVEL_ALIASES.get(re.sub(r"[^a-z0-9]", "", str(val).lower()))
        if lvl:
            levels[key] = lvl
    return bans, raw.get("notes") or {}, levels


LEVEL_ALIASES = {
    "facile": "facile", "easy": "facile", "ez": "facile",
    "moyen": "moyen", "moyenne": "moyen", "medium": "moyen", "moy": "moyen",
    "dur": "dur", "dure": "dur", "difficile": "dur", "hard": "dur",
}
LEVEL_LABELS = {"facile": "Facile", "moyen": "Moyen", "dur": "Dur"}

BANS, NOTES, LEVELS = {}, {}, {}


def notes_block(role, enemy_id, enemy_name, banned):
    cards = []
    if banned:
        cards.append(
            f'<div class="note ban"><b>Ban permanent</b><p>Je le ban à chaque game '
            f'quand je joue {esc(ROLE_NAMES[role])}. Tu ne verras donc pas ce matchup en replay.</p></div>')
    entry = NOTES.get(f"{role}/{enemy_id}") or {}
    for n in (entry.get("fr") or entry.get("en") or []):
        if not isinstance(n, dict) or not n.get("t"):
            continue
        kind = n.get("k") if n.get("k") in ("plus", "moins", "info") else "info"
        cards.append(f'<div class="note {kind}"><b>{esc(str(n["t"]))}</b>'
                     + (f'<p>{esc(str(n["d"]))}</p>' if n.get("d") else "") + "</div>")
    if not cards:
        return ""
    return '<div class="notes"><h2>À savoir</h2>' + "".join(cards) + "</div>"


def matchup_page(role, enemy_id, enemy_name, videos):
    role_name = ROLE_NAMES[role]
    n = len(videos)
    latest = videos[0]
    url = f"{SITE}/matchups/{role}/{enemy_id.lower()}/"
    # Le rang réel vient de la dernière vidéo : la série passe par tous les
    # paliers, écrire « Master » en dur mentirait sur les games en Gold.
    rank = rank_label(latest, lp=False) or "haut elo"
    title = f"Nunu {role_name} vs {enemy_name} — replay ranked League of Legends | Gyn Replays"
    patch = latest.get("patch")
    desc = (f"Comment jouer le matchup Nunu {role_name} contre {enemy_name} : "
            f"{n} replay{'s' if n > 1 else ''} complet{'s' if n > 1 else ''} en {rank} EUW"
            + (f" (patch {patch})" if patch else "")
            + ". Gameplay réel, mis à jour automatiquement depuis la chaîne Gyn Replays.")
    ld = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": f"Replays Nunu {role_name} vs {enemy_name}",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "item": video_ld(v)}
            for i, v in enumerate(videos)
        ],
    }

    banned = re.sub(r"[^a-z0-9]", "", enemy_id.lower()) in BANS.get(role, set())
    notes = notes_block(role, enemy_id, enemy_name, banned)
    level = LEVELS.get(f"{role}/{enemy_id}")
    level_badge = f'<span class="lvl lvl-{level}">{LEVEL_LABELS[level]}</span>' if level else ""

    cards = []
    for v in videos:
        rk = rank_label(v)
        chips = " · ".join(x for x in [
            esc(f"Patch {v['patch']}") if v.get("patch") else "",
            (f'<span class="rk rk-{esc(v["rank"].lower())}">{esc(rk)}</span>'
             if rk else ""),
            esc(fmt_date_fr(v.get("published", ""))),
        ] if x.strip())
        cards.append(
            f'<a class="card" href="https://www.youtube.com/watch?v={esc(v["id"])}" '
            f'target="_blank" rel="noopener">'
            f'<img src="https://i.ytimg.com/vi/{esc(v["id"])}/mqdefault.jpg" alt="" loading="lazy">'
            f'<span class="meta"><span class="title">{esc(v["title"])}</span>'
            f'<span class="chips">{chips}</span></span></a>'
        )

    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{esc(url)}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{esc(url)}">
<meta property="og:image" content="https://i.ytimg.com/vi/{esc(latest['id'])}/hqdefault.jpg">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 2v28M4 9l24 14M4 23L28 9' stroke='%236fd3ff' stroke-width='2.4' stroke-linecap='round' fill='none'/%3E%3C/svg%3E">
<style>{PAGE_CSS}</style>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body>
<header><div class="shell"><a class="brand" href="{SITE}/">Gyn Replays <span>— Matchups Nunu</span></a></div></header>
<main class="shell">
<h1>Nunu {esc(role_name)} <span class="vs">vs</span> {esc(enemy_name)}{'<span class="ban">BAN</span>' if banned else ''}</h1>
<p class="sub">{level_badge}{n} replay{"s" if n > 1 else ""} complet{"s" if n > 1 else ""} du matchup, du plus récent au plus ancien — gameplay réel en {esc(rank)}, aucune sélection de moments.</p>
{notes}
{"".join(cards)}
<a class="cta" href="{SITE}/#{role}/{esc(enemy_id.lower())}">Tous les matchups Nunu</a>
<a class="cta" href="https://www.youtube.com/@GynReplays?sub_confirmation=1">S'abonner à la chaîne</a>
</main>
<footer><div class="shell">Mis à jour automatiquement depuis la chaîne <a href="https://www.youtube.com/@GynReplays">@GynReplays</a>.</div></footer>
<script data-goatcounter="https://gyn.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</body>
</html>
"""


def main():
    global BANS, NOTES, LEVELS
    BANS, NOTES, LEVELS = load_notes()
    champs = load("champions.json")
    data = load("videos.json")
    names = {c["id"]: c["name"] for c in champs["champions"]}

    groups = {}
    for v in data["videos"]:
        if v["role"] not in ROLE_NAMES or not v.get("enemy"):
            continue
        groups.setdefault((v["role"], v["enemy"]), []).append(v)
    for vids in groups.values():
        vids.sort(key=lambda v: v.get("published", ""), reverse=True)

    # Régénération complète : dossier reconstruit à l'identique si rien n'a changé.
    if os.path.isdir(OUT_DIR):
        shutil.rmtree(OUT_DIR)

    urls = []
    for (role, enemy_id) in sorted(groups, key=lambda k: (ROLE_ORDER.index(k[0]), k[1])):
        vids = groups[(role, enemy_id)]
        enemy_name = names.get(enemy_id) or vids[0].get("enemyName") or enemy_id
        page_dir = os.path.join(OUT_DIR, role, enemy_id.lower())
        os.makedirs(page_dir, exist_ok=True)
        with open(os.path.join(page_dir, "index.html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(matchup_page(role, enemy_id, enemy_name, vids))
        urls.append((f"{SITE}/matchups/{role}/{enemy_id.lower()}/",
                     (vids[0].get("published") or "")[:10]))

    all_dates = [d for (_, d) in urls if d]
    home_lastmod = max(all_dates) if all_dates else ""
    entries = [f"  <url><loc>{SITE}/</loc>" +
               (f"<lastmod>{home_lastmod}</lastmod>" if home_lastmod else "") + "</url>"]
    for loc, lastmod in urls:
        entries.append(f"  <url><loc>{esc(loc)}</loc>" +
                       (f"<lastmod>{lastmod}</lastmod>" if lastmod else "") + "</url>")
    sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\n'
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
               + "\n".join(entries) + "\n</urlset>\n")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
        f.write(sitemap)

    print(f"{len(urls)} page(s) matchup générée(s) + sitemap.xml")
    for loc, _ in urls:
        print(f"  {loc}")


if __name__ == "__main__":
    main()
