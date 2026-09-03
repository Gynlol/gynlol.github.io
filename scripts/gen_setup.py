# -*- coding: utf-8 -*-
"""Résout data/setup.json (écrit à la main, noms en clair) en data/setup-built.json.

Le fichier tenu à la main ne contient que des NOMS (français ou anglais) :
« Comète arcanique », « Tourment de Liandry ». Ce script les résout contre Data
Dragon et écrit un fichier prêt à afficher : identifiants, icônes, noms dans les
deux langues, et la structure complète des arbres utilisés (pour dessiner la
page de runes comme en jeu, runes non prises comprises).

Un nom non résolu n'efface rien : il est reporté en clair dans la sortie du job
et l'entrée est marquée `unresolved` — le site affiche alors le texte sans
icône. Même règle que la résolution des champions : jamais de rejet silencieux.

Sortie déterministe (aucun horodatage) : le job horaire ne committe que les
vrais changements.
"""
import json
import os
import re
import sys
import unicodedata
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA_DIR = os.path.join(ROOT, "data")
SRC = os.path.join(DATA_DIR, "setup.json")
OUT = os.path.join(DATA_DIR, "setup-built.json")
VIDEOS = os.path.join(DATA_DIR, "videos.json")

DDRAGON = "https://ddragon.leagueoflegends.com"
LANGS = {"fr": "fr_FR", "en": "en_US"}

# Les fragments ne sont pas dans runesReforged.json : Data Dragon ne publie que
# leurs images. La table est donc écrite ici, et chaque icône est vérifiée par
# une requête HEAD avant d'être écrite (voir check_icons).
SHARD_IMG = "perk-images/StatMods/"
SHARDS = {
    "adaptatif": {"icon": SHARD_IMG + "StatModsAdaptiveForceIcon.png", "row": 0,
                  "fr": "Force adaptative", "en": "Adaptive Force"},
    "attaque": {"icon": SHARD_IMG + "StatModsAttackSpeedIcon.png", "row": 0,
                "fr": "Vitesse d'attaque", "en": "Attack Speed"},
    "acceleration": {"icon": SHARD_IMG + "StatModsCDRScalingIcon.png", "row": 0,
                     "fr": "Accélération de compétences", "en": "Ability Haste"},
    "deplacement": {"icon": SHARD_IMG + "StatModsMovementSpeedIcon.png", "row": 1,
                    "fr": "Vitesse de déplacement", "en": "Move Speed"},
    "viescaling": {"icon": SHARD_IMG + "StatModsHealthScalingIcon.png", "row": 1,
                   "fr": "Vie (par niveau)", "en": "Health Scaling"},
    "vie": {"icon": SHARD_IMG + "StatModsHealthPlusIcon.png", "row": 2,
            "fr": "Vie", "en": "Health"},
    "tenacite": {"icon": SHARD_IMG + "StatModsTenacityIcon.png", "row": 2,
                 "fr": "Ténacité", "en": "Tenacity"},
}
# La grille des fragments telle qu'elle apparaît en jeu : 3 lignes de 3.
# Deux fragments apparaissent sur deux lignes (force adaptative, vie par
# niveau) : la ligne d'affichage vient d'ici, pas de la table ci-dessus.
SHARD_ROWS = [
    ["adaptatif", "attaque", "acceleration"],
    ["adaptatif", "deplacement", "viescaling"],
    ["vie", "tenacite", "viescaling"],
]

SHARD_ALIASES = {
    "adaptive": "adaptatif", "adaptive force": "adaptatif", "force adaptative": "adaptatif",
    "af": "adaptatif",
    "attack speed": "attaque", "vitesse d attaque": "attaque", "as": "attaque",
    "ability haste": "acceleration", "haste": "acceleration", "cdr": "acceleration",
    "move speed": "deplacement", "movement speed": "deplacement",
    "vitesse de deplacement": "deplacement", "ms": "deplacement",
    "health scaling": "viescaling", "vie par niveau": "viescaling",
    "scaling health": "viescaling",
    "health": "vie", "hp": "vie", "pv": "vie",
    "tenacity": "tenacite",
}


def norm(s):
    s = unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (matchup-site-setup)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def head_ok(url):
    req = urllib.request.Request(url, method="HEAD",
                                 headers={"User-Agent": "Mozilla/5.0 (matchup-site-setup)"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return 200 <= r.status < 300
    except Exception:
        return False


def load_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        if default is not None:
            return default
        raise


def ddragon_version(fallback):
    try:
        versions = json.loads(fetch(DDRAGON + "/api/versions.json"))
        if isinstance(versions, list) and versions:
            return versions[0]
    except Exception as exc:  # réseau/format : on garde la version connue
        print("avertissement : versions.json inaccessible (%s)" % exc, file=sys.stderr)
    return fallback


class Dex(object):
    """Index de résolution nom -> objet, alimenté par les deux langues."""

    def __init__(self, version):
        self.version = version
        self.runes = {}       # norm(nom|clé) -> rune résolue
        self.trees = {}       # id d'arbre -> arbre complet
        self.tree_names = {}  # norm(nom|clé) -> id d'arbre
        self.items = {}       # norm(nom) -> objet résolu
        self._load_runes()
        self._load_items()

    def _load_runes(self):
        raw = {}
        for lang, code in LANGS.items():
            url = "%s/cdn/%s/data/%s/runesReforged.json" % (DDRAGON, self.version, code)
            raw[lang] = json.loads(fetch(url))
        for tree_en in raw["en"]:
            tree_fr = next((t for t in raw["fr"] if t["id"] == tree_en["id"]), tree_en)
            tree = {
                "id": tree_en["id"],
                "key": tree_en["key"],
                "name": {"fr": tree_fr["name"], "en": tree_en["name"]},
                "icon": tree_en["icon"],
                "slots": [],
            }
            for i, slot in enumerate(tree_en["slots"]):
                slot_fr = tree_fr["slots"][i]["runes"] if i < len(tree_fr["slots"]) else []
                row = []
                for rune_en in slot["runes"]:
                    rune_fr = next((r for r in slot_fr if r["id"] == rune_en["id"]), rune_en)
                    rune = {
                        "id": rune_en["id"],
                        "key": rune_en["key"],
                        "name": {"fr": rune_fr["name"], "en": rune_en["name"]},
                        "icon": rune_en["icon"],
                        "tree": tree_en["id"],
                        "row": i,
                    }
                    row.append(rune)
                    for label in (rune_en["name"], rune_fr["name"], rune_en["key"]):
                        self.runes.setdefault(norm(label), rune)
                tree["slots"].append(row)
            self.trees[tree_en["id"]] = tree
            for label in (tree_en["name"], tree_fr["name"], tree_en["key"]):
                self.tree_names.setdefault(norm(label), tree_en["id"])

    def _load_items(self):
        raw = {}
        for lang, code in LANGS.items():
            url = "%s/cdn/%s/data/%s/item.json" % (DDRAGON, self.version, code)
            raw[lang] = json.loads(fetch(url))["data"]
        for item_id, item_en in raw["en"].items():
            # Data Dragon place les variantes d'Arena avant les objets de la
            # Faille et leur donne parfois exactement le même nom. On ne doit
            # jamais résoudre un build SR vers une icône 22xxxx.
            if not item_en.get("maps", {}).get("11"):
                continue
            item_fr = raw["fr"].get(item_id, item_en)
            entry = {
                "id": item_id,
                "name": {"fr": item_fr["name"], "en": item_en["name"]},
                "icon": item_en.get("image", {}).get("full", item_id + ".png"),
            }
            for label in (item_en["name"], item_fr["name"]):
                # Plusieurs entrées partagent parfois le même nom (objets de
                # modes spéciaux en 6 chiffres). On préfère toujours l'id SR
                # court pour que l'icône et le prix correspondent à la Faille.
                key = norm(label)
                previous = self.items.get(key)
                if previous is None or len(str(item_id)) < len(str(previous["id"])):
                    self.items[key] = entry


def resolve_rune(dex, name, problems, context):
    rune = dex.runes.get(norm(name))
    if not rune:
        problems.append("rune inconnue : « %s » (%s)" % (name, context))
        return {"unresolved": True, "name": {"fr": str(name), "en": str(name)}}
    return rune


def resolve_item(dex, name, problems, context):
    item = dex.items.get(norm(name))
    if not item:
        problems.append("objet inconnu : « %s » (%s)" % (name, context))
        return {"unresolved": True, "name": {"fr": str(name), "en": str(name)}}
    return item


def resolve_shard(name, problems, context):
    key = norm(name)
    for alias, target in SHARD_ALIASES.items():
        if norm(alias) == key:
            key = norm(target)
            break
    for shard_key, shard in SHARDS.items():
        if norm(shard_key) == key:
            return {
                "key": shard_key,
                "icon": shard["icon"],
                "row": shard["row"],
                "name": {"fr": shard["fr"], "en": shard["en"]},
            }
    problems.append("fragment inconnu : « %s » (%s)" % (name, context))
    return {"unresolved": True, "name": {"fr": str(name), "en": str(name)}}


def resolve_side(dex, side, problems, context):
    """Un arbre et ses runes prises. L'arbre peut être déduit des runes."""
    if not isinstance(side, dict):
        return None
    names = [n for n in (side.get("runes") or []) if str(n).strip()]
    runes = [resolve_rune(dex, n, problems, context) for n in names]
    tree_id = dex.tree_names.get(norm(side.get("arbre") or side.get("tree") or ""))
    if tree_id is None:
        for rune in runes:
            if not rune.get("unresolved"):
                tree_id = rune["tree"]
                break
    if tree_id is None:
        problems.append("arbre introuvable (%s)" % context)
        return None
    for rune in runes:
        if not rune.get("unresolved") and rune["tree"] != tree_id:
            problems.append("« %s » n'appartient pas à l'arbre %s (%s)"
                            % (rune["name"]["fr"], dex.trees[tree_id]["name"]["fr"], context))
    return {
        "tree": tree_id,
        "picks": [r["id"] for r in runes if not r.get("unresolved")],
        "inconnues": [r["name"]["fr"] for r in runes if r.get("unresolved")],
    }


def whys(value):
    """`pourquoi` accepte une phrase ou une liste de phrases.

    La sortie est toujours une liste : le site n'a plus qu'un seul cas à
    dessiner, et une page tenue à la main peut gagner une ligne sans toucher
    au code. Les entrées vides sont retirées.
    """
    if value is None:
        return []
    if isinstance(value, str):
        value = [value]
    return [str(v).strip() for v in value if str(v).strip()]


def why_links(value):
    """Conserve les liens optionnels alignés sur les points de `pourquoi`."""
    if value is None:
        return []
    if isinstance(value, str):
        value = [value]
    return [str(v).strip() for v in value]


def resolve_runepage(dex, page, problems, label):
    context = page.get("nom") or label
    return {
        "nom": page.get("nom") or label,
        "pourquoi": whys(page.get("pourquoi")),
        "pourquoiEn": whys(page.get("pourquoiEn")),
        "pourquoiLiens": why_links(page.get("pourquoiLiens")),
        "principal": resolve_side(dex, page.get("principal"), problems, context),
        "secondaire": resolve_side(dex, page.get("secondaire"), problems, context),
        "fragments": [resolve_shard(f, problems, context) for f in (page.get("fragments") or [])],
    }


def resolve_build(dex, build, problems, label):
    context = build.get("nom") or label

    def group(key):
        return [resolve_item(dex, n, problems, context)
                for n in (build.get(key) or []) if str(n).strip()]

    bottes = build.get("bottes")
    return {
        "nom": build.get("nom") or label,
        "pourquoi": whys(build.get("pourquoi")),
        "pourquoiEn": whys(build.get("pourquoiEn")),
        "pourquoiLiens": why_links(build.get("pourquoiLiens")),
        "depart": group("depart"),
        "coeur": group("coeur"),
        "bottes": resolve_item(dex, bottes, problems, context) if bottes else None,
        "situationnel": group("situationnel"),
    }


def used_trees(pages):
    ids = set()
    for page in pages:
        for side in ("principal", "secondaire"):
            if page.get(side):
                ids.add(page[side]["tree"])
    return ids


def check_icons(version, built, problems):
    """Vérifie une fois chaque URL d'icône écrite : une image morte se voit ici,
    pas sur la page du visiteur."""
    urls = set()
    for tree in built["trees"].values():
        urls.add("%s/cdn/img/%s" % (DDRAGON, tree["icon"]))
        for row in tree["slots"]:
            for rune in row:
                urls.add("%s/cdn/img/%s" % (DDRAGON, rune["icon"]))
    for row in built["shards"]:
        for shard in row:
            urls.add("%s/cdn/img/%s" % (DDRAGON, shard["icon"]))
    for build in built["builds"]["pages"]:
        items = list(build["depart"]) + list(build["coeur"]) + list(build["situationnel"])
        if build["bottes"]:
            items.append(build["bottes"])
        for item in items:
            if not item.get("unresolved"):
                urls.add("%s/cdn/%s/img/item/%s" % (DDRAGON, version, item["icon"]))
    bad = sorted(u for u in urls if not head_ok(u))
    for u in bad:
        problems.append("icône injoignable : %s" % u)
    return len(urls), len(bad)


def main():
    src = load_json(SRC, default=None)
    videos = load_json(VIDEOS, default={})
    version = ddragon_version(videos.get("meta", {}).get("ddragonVersion", "16.16.1"))
    print("Data Dragon %s" % version)

    dex = Dex(version)
    problems = []

    runes_src = src.get("runes") or {}
    builds_src = src.get("builds") or {}

    rune_pages = []
    mine = runes_src.get("mienne")
    if mine:
        page = resolve_runepage(dex, mine, problems, "Ma page")
        page["mienne"] = True
        rune_pages.append(page)
    for i, alt in enumerate(runes_src.get("alternatives") or []):
        page = resolve_runepage(dex, alt, problems, "Alternative %d" % (i + 1))
        page["mienne"] = False
        rune_pages.append(page)

    build_pages = []
    mine_b = builds_src.get("mien")
    if mine_b:
        b = resolve_build(dex, mine_b, problems, "Mon build")
        b["mien"] = True
        build_pages.append(b)
    for i, alt in enumerate(builds_src.get("alternatives") or []):
        b = resolve_build(dex, alt, problems, "Alternative %d" % (i + 1))
        b["mien"] = False
        build_pages.append(b)

    trees = {}
    for tree_id in sorted(used_trees(rune_pages)):
        trees[str(tree_id)] = dex.trees[tree_id]

    shard_rows = []
    for row in SHARD_ROWS:
        shard_rows.append([{
            "key": key,
            "icon": SHARDS[key]["icon"],
            "name": {"fr": SHARDS[key]["fr"], "en": SHARDS[key]["en"]},
        } for key in row])

    built = {
        "meta": {"ddragonVersion": version, "source": "data/setup.json"},
        "trees": trees,
        "shards": shard_rows,
        # Les conseils généraux sont éditoriaux : ils restent dans le fichier
        # résolu pour que la page ne charge qu'un seul JSON au lieu de relire
        # setup.json côté navigateur.
        "conseils": src.get("conseils") or {},
        "runes": {"pages": rune_pages},
        "builds": {
            "notice": str(builds_src.get("notice") or "").strip(),
            "noticeEn": str(builds_src.get("noticeEn") or "").strip(),
            "pages": build_pages,
        },
    }

    total, bad = check_icons(version, built, problems)
    print("icônes vérifiées : %d/%d" % (total - bad, total))

    for p in problems:
        print("PROBLÈME : " + p, file=sys.stderr)

    text = json.dumps(built, ensure_ascii=False, indent=2) + "\n"
    old = ""
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8") as f:
            old = f.read()
    if old == text:
        print("setup-built.json : aucun changement.")
    else:
        with open(OUT, "w", encoding="utf-8", newline="\n") as f:
            f.write(text)
        print("setup-built.json écrit (%d page(s) de runes, %d build(s))."
              % (len(rune_pages), len(build_pages)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
