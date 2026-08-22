# -*- coding: utf-8 -*-
"""Jeu de titres pièges pour le parseur. Lancer : python scripts/test_parse.py"""
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from update_videos import (CHAMPIONS_PATH, RANK_ORDER, build_name_index,
                           display_names, load_json, parse_rank, parse_title)

CASES = [
    # (titre, attendu) — attendu : None = hors gabarit (ignoré), sinon un
    # dict dont chaque clé est vérifiée (role/enemy au minimum, métadonnées
    # incluses pour attraper les régressions du découpage).
    ("Nunu ADC vs Ziggs EUW Master 80 LP | Patch 26.15",
     {"role": "adc", "enemy": "Ziggs", "patch": "26.15", "rank": "Master", "lp": 80, "region": "EUW"}),
    ("Nunu ADC vs Sivir EUW Master 64 LP | Patch 26.15",
     {"role": "adc", "enemy": "Sivir"}),
    ("Nunu ADC vs Master Yi EUW Master 80 LP | Patch 26.15",
     {"role": "adc", "enemy": "MasterYi", "rank": "Master", "lp": 80}),
    ("❄️ Nunu Jungle vs Lee Sin — 5/2/11 (WIN) | EUW Master 64 LP | Patch 26.16",
     {"role": "jungle", "enemy": "LeeSin", "result": "win", "rank": "Master", "lp": 64, "region": "EUW", "patch": "26.16"}),
    ("Nunu Support vs Renata Glasc EUW Diamond 12 LP | Patch 26.15",
     {"role": "support", "enemy": "Renata", "rank": "Diamond"}),
    ("Nunu Top vs Dr. Mundo EUW Master 0 LP | Patch 26.15",
     {"role": "top", "enemy": "DrMundo", "lp": 0}),
    ("Nunu Mid vs Aurelion Sol EUW Grandmaster 402 LP | Patch 26.15",
     {"role": "mid", "enemy": "AurelionSol", "rank": "Grandmaster", "lp": 402}),
    ("Nunu ADC vs Kai'Sa EUW Master 33 LP | Patch 26.15",
     {"role": "adc", "enemy": "Kaisa"}),
    ("Nunu Bot vs Wukong EUW Master 10 LP | Patch 26.15",
     {"role": "adc", "enemy": "MonkeyKing"}),
    ("Nunu & Willump Jungle vs Nunu EUW Master 1 LP | Patch 26.15",
     {"role": "jungle", "enemy": "Nunu", "region": "EUW"}),
    ("nunu supp vs Thresh EUW Master 5 LP",
     {"role": "support", "enemy": "Thresh", "rank": "Master", "lp": 5}),
    ("Nunu Jgl vs Kha'Zix (WIN) | Patch 26.16",
     {"role": "jungle", "enemy": "Khazix", "result": "win", "patch": "26.16"}),
    ("Nunu Mid vs Twisted Fate EUW Master 77 LP | Patch 26.15",
     {"role": "mid", "enemy": "TwistedFate"}),
    ("Nunu Top vs K'Sante EUW Master 41 LP | Patch 26.15",
     {"role": "top", "enemy": "KSante"}),
    ("Nunu ADC vs Miss Fortune EUW Master 3 LP | Patch 26.15",
     {"role": "adc", "enemy": "MissFortune"}),
    # Séparateur collé au nom : les métadonnées après ne doivent pas se perdre
    ("Nunu ADC vs Ziggs, Master 80 LP | Patch 26.15",
     {"role": "adc", "enemy": "Ziggs", "rank": "Master", "lp": 80}),
    ("Nunu ADC vs Jinx [WIN] EUW Master 100 LP",
     {"role": "adc", "enemy": "Jinx", "result": "win", "region": "EUW", "rank": "Master", "lp": 100}),
    # Titre de série : le rang de l'OBJECTIF (« Unranked to Master ») ne doit
    # pas écraser le rang réel, qui est celui collé aux LP.
    ("Nunu Top vs Teemo | Unranked to Master : Gold 4 42lp | Patch 25.16",
     {"role": "top", "enemy": "Teemo", "rank": "Gold", "division": "4",
      "lp": 42, "patch": "25.16"}),
    ("Nunu Jungle vs Sett | Unranked to Master — Platinum II 88 LP",
     {"role": "jungle", "enemy": "Sett", "rank": "Platinum", "division": "2",
      "lp": 88}),
    # Objectif seul, sans rang réel : on garde l'objectif faute de mieux
    ("Nunu Top vs Garen | Unranked to Master | Patch 25.16",
     {"role": "top", "enemy": "Garen", "rank": "Master", "lp": None}),
    # Rang sans division : la division reste vide (Master et au-dessus)
    ("Nunu ADC vs Viktor EUW Master 122 LP",
     {"role": "adc", "enemy": "Viktor", "rank": "Master", "division": None,
      "lp": 122}),
    # Accents : orthographe FR d'un champion connu
    ("Nunu ADC vs Séraphine EUW Master 12 LP",
     {"role": "adc", "enemy": "Seraphine"}),
    # Champion inconnu de la base (futur champion) : deviné, pas ignoré
    ("Nunu ADC vs Zorblax EUW Master 12 LP | Patch 27.1",
     {"role": "adc", "enemy": "Zorblax", "rank": "Master"}),
    # Hors gabarit : ignorés
    ("Le pire fail de la semaine #3", None),
    ("Nunu ADC tier list Patch 26.15", None),
    ("Pourquoi Nunu ADC fonctionne — explication complète", None),
    ("GYN REPLAYS — présentation de la chaîne", None),
    # Faux matchups : la devinette ne doit pas fabriquer de champion fantôme
    ("Nunu ADC vs le monde entier — best of clips", None),
    ("Nunu ADC vs everyone: 5 games in Master", None),
    ("Nunu ADC vs ??? | Patch 26.15", None),
]


# Le climb passe par les 10 paliers : chacun doit être lu, avec sa division
# (absente à partir de Master, qui n'en a pas dans le jeu) et ses LP.
RANK_CASES = [
    (" EUW Iron 4 0 LP", ("Iron", "4", 0)),
    (" | Road to Master : Bronze III 12 LP", ("Bronze", "3", 12)),
    (" | Road to Master : Silver 1 60lp", ("Silver", "1", 60)),
    (" | Unranked to Master : Gold 4 42lp | Patch 25.16", ("Gold", "4", 42)),
    (" EUW Platinum 2 74 LP", ("Platinum", "2", 74)),
    (" EUW Platine 4 55 LP", ("Platinum", "4", 55)),
    (" Plat 3 20lp", ("Platinum", "3", 20)),
    (" EUW Emerald 2 31 LP", ("Emerald", "2", 31)),
    (" Emeraude IV 7 LP", ("Emerald", "4", 7)),
    (" Diamant 1 88 LP", ("Diamond", "1", 88)),
    (" EUW Master 122 LP", ("Master", None, 122)),
    (" Maitre 15 LP", ("Master", None, 15)),
    (" Grand Master 402 LP", ("Grandmaster", None, 402)),
    (" GM 350 LP", ("Grandmaster", None, 350)),
    (" EUW Challenger 1204 LP", ("Challenger", None, 1204)),
    # Objectif de serie sans rang reel : faute de mieux, on garde l'objectif
    (" | Unranked to Master | Patch 25.16", ("Master", None, None)),
    # Master n'a pas de division : le « 1 » de 100 n'en est pas une
    (" EUW Master 100 LP", ("Master", None, 100)),
    (" EUW Grandmaster 402 LP", ("Grandmaster", None, 402)),
]


def check_ranks():
    """Chaque palier a son cas : un titre en Bronze doit sortir Bronze."""
    failures = 0
    for rest, want in RANK_CASES:
        got = parse_rank(rest)
        ok = got == want
        if not ok:
            failures += 1
        print("{} rang {!r} -> {}{}".format(
            "OK " if ok else "FAIL", rest, got,
            "" if ok else " (attendu {})".format(want)))
    seen = {w[0] for _, w in RANK_CASES}
    for tier in RANK_ORDER:
        if tier not in seen:
            print("FAIL rang {} n'a aucun cas de test".format(tier))
            failures += 1
    print("\n{}/{} cas de rang passent".format(
        len(RANK_CASES) - failures, len(RANK_CASES)))
    return failures


def main():
    champs = load_json(CHAMPIONS_PATH)
    index = build_name_index(champs)
    names = display_names(champs)
    failures = 0
    for title, want in CASES:
        got = parse_title(title, index, names)
        if want is None:
            ok = got is None
            detail = "ignoré" if ok else f"parsé à tort : {got}"
        else:
            ok = got is not None
            bad = []
            if ok:
                for key, val in want.items():
                    if got.get(key) != val:
                        bad.append(f"{key}={got.get(key)!r} (attendu {val!r})")
                ok = not bad
            detail = ("ignoré à tort" if got is None
                      else ", ".join(bad) if bad
                      else f"{got['role']}/{got['enemy']}")
        mark = "OK " if ok else "FAIL"
        if not ok:
            failures += 1
        print(f"{mark} {title!r} -> {detail}")
    print(f"\n{len(CASES) - failures}/{len(CASES)} cas de titre passent")
    failures += check_ranks()
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
