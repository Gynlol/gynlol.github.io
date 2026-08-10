# -*- coding: utf-8 -*-
"""Génère data/champions.json depuis la table compacte ci-dessous.

Format d'une ligne : ddragon_id|Nom affiché|codes_roles
Codes rôles : t=top j=jungle m=mid a=adc s=support ("" = connu du parseur
mais absent des grilles tant qu'aucune vidéo n'existe).
"""
import json
import os

TABLE = """
Aatrox|Aatrox|t
Ahri|Ahri|m
Akali|Akali|tm
Akshan|Akshan|tm
Alistar|Alistar|s
Ambessa|Ambessa|t
Amumu|Amumu|js
Anivia|Anivia|m
Annie|Annie|m
Aphelios|Aphelios|a
Ashe|Ashe|as
AurelionSol|Aurelion Sol|m
Aurora|Aurora|tm
Azir|Azir|m
Bard|Bard|s
Belveth|Bel'Veth|j
Blitzcrank|Blitzcrank|s
Brand|Brand|s
Braum|Braum|s
Briar|Briar|j
Caitlyn|Caitlyn|a
Camille|Camille|t
Cassiopeia|Cassiopeia|m
Chogath|Cho'Gath|t
Corki|Corki|ma
Darius|Darius|t
Diana|Diana|jm
Draven|Draven|a
DrMundo|Dr. Mundo|t
Ekko|Ekko|jm
Elise|Elise|j
Evelynn|Evelynn|j
Ezreal|Ezreal|a
Fiddlesticks|Fiddlesticks|j
Fiora|Fiora|t
Fizz|Fizz|m
Galio|Galio|ms
Gangplank|Gangplank|t
Garen|Garen|t
Gnar|Gnar|t
Gragas|Gragas|tj
Graves|Graves|j
Gwen|Gwen|t
Hecarim|Hecarim|j
Heimerdinger|Heimerdinger|tm
Hwei|Hwei|ms
Illaoi|Illaoi|t
Irelia|Irelia|tm
Ivern|Ivern|j
Janna|Janna|s
JarvanIV|Jarvan IV|j
Jax|Jax|tj
Jayce|Jayce|tm
Jhin|Jhin|a
Jinx|Jinx|a
Kaisa|Kai'Sa|a
Kalista|Kalista|a
Karma|Karma|s
Karthus|Karthus|j
Kassadin|Kassadin|m
Katarina|Katarina|m
Kayle|Kayle|t
Kayn|Kayn|j
Kennen|Kennen|t
Khazix|Kha'Zix|j
Kindred|Kindred|j
Kled|Kled|t
KogMaw|Kog'Maw|a
KSante|K'Sante|t
Leblanc|LeBlanc|m
LeeSin|Lee Sin|j
Leona|Leona|s
Lillia|Lillia|j
Lissandra|Lissandra|m
Lucian|Lucian|a
Lulu|Lulu|s
Lux|Lux|ms
Malphite|Malphite|t
Malzahar|Malzahar|m
Maokai|Maokai|tjs
MasterYi|Master Yi|j
Mel|Mel|ms
Milio|Milio|s
MissFortune|Miss Fortune|a
MonkeyKing|Wukong|tj
Mordekaiser|Mordekaiser|t
Morgana|Morgana|s
Naafiri|Naafiri|jm
Nami|Nami|s
Nasus|Nasus|t
Nautilus|Nautilus|s
Neeko|Neeko|ms
Nidalee|Nidalee|j
Nilah|Nilah|a
Nocturne|Nocturne|j
Nunu|Nunu & Willump|j
Olaf|Olaf|tj
Orianna|Orianna|m
Ornn|Ornn|t
Pantheon|Pantheon|tjs
Poppy|Poppy|tjs
Pyke|Pyke|s
Qiyana|Qiyana|m
Quinn|Quinn|t
Rakan|Rakan|s
Rammus|Rammus|j
RekSai|Rek'Sai|j
Rell|Rell|s
Renata|Renata Glasc|s
Renekton|Renekton|t
Rengar|Rengar|j
Riven|Riven|t
Rumble|Rumble|t
Ryze|Ryze|m
Samira|Samira|a
Sejuani|Sejuani|j
Senna|Senna|as
Seraphine|Seraphine|as
Sett|Sett|t
Shaco|Shaco|js
Shen|Shen|t
Shyvana|Shyvana|j
Singed|Singed|t
Sion|Sion|t
Sivir|Sivir|a
Skarner|Skarner|j
Smolder|Smolder|ma
Sona|Sona|s
Soraka|Soraka|s
Swain|Swain|msa
Sylas|Sylas|m
Syndra|Syndra|m
TahmKench|Tahm Kench|ts
Taliyah|Taliyah|jm
Talon|Talon|m
Taric|Taric|s
Teemo|Teemo|t
Thresh|Thresh|s
Tristana|Tristana|ma
Trundle|Trundle|tj
Tryndamere|Tryndamere|t
TwistedFate|Twisted Fate|m
Twitch|Twitch|a
Udyr|Udyr|j
Urgot|Urgot|t
Varus|Varus|a
Vayne|Vayne|ta
Veigar|Veigar|m
Velkoz|Vel'Koz|s
Vex|Vex|m
Vi|Vi|j
Viego|Viego|j
Viktor|Viktor|m
Vladimir|Vladimir|tm
Volibear|Volibear|tj
Warwick|Warwick|tj
Xayah|Xayah|a
Xerath|Xerath|ms
XinZhao|Xin Zhao|j
Yasuo|Yasuo|m
Yone|Yone|tm
Yorick|Yorick|t
Yuumi|Yuumi|s
Zac|Zac|j
Zed|Zed|m
Zeri|Zeri|a
Ziggs|Ziggs|ma
Zilean|Zilean|s
Zoe|Zoe|m
Zyra|Zyra|s
"""

ROLE_CODES = {"t": "top", "j": "jungle", "m": "mid", "a": "adc", "s": "support"}

# Surnoms courants acceptés dans les titres, en plus de l'id et du nom affiché.
ALIASES = {
    "mundo": "DrMundo",
    "asol": "AurelionSol",
    "j4": "JarvanIV",
    "yi": "MasterYi",
    "tf": "TwistedFate",
    "mf": "MissFortune",
    "gp": "Gangplank",
    "tk": "TahmKench",
    "kog": "KogMaw",
    "willump": "Nunu",
    "nunuwillump": "Nunu",
    "renata": "Renata",
    "wukong": "MonkeyKing",
    "monkeyking": "MonkeyKing",
}


def main():
    champions = []
    for line in TABLE.strip().splitlines():
        cid, name, codes = line.split("|")
        champions.append({
            "id": cid,
            "name": name,
            "roles": [ROLE_CODES[c] for c in codes],
        })
    out = {
        "aliases": ALIASES,
        "champions": champions,
    }
    path = os.path.join(os.path.dirname(__file__), "..", "data", "champions.json")
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{len(champions)} champions écrits dans data/champions.json")


if __name__ == "__main__":
    main()
