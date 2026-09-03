# Gyn Replays — Matchups Nunu

**Site en ligne : <https://gynlol.github.io>**

Site statique qui répertorie tous les matchups Nunu de la chaîne
[@GynReplays](https://www.youtube.com/@GynReplays), classés par rôle
(Top / Mid / ADC / Support) puis par champion ennemi.

## Comment ça marche

- `data/videos.json` — la base : une entrée par vidéo, avec rôle, ennemi,
  patch, rang, date. Regénéré par le robot : toute retouche d'une vidéo
  encore présente dans le flux RSS sera écrasée (le titre YouTube fait
  foi). Exception : retirer l'entrée d'une vidéo **supprimée de la
  chaîne** est définitif, elle ne sera pas ré-ajoutée.
- `scripts/update_videos.py` — lit le flux RSS public de la chaîne, parse les
  titres `Nunu <rôle> vs <champion> …` et met à jour `videos.json`.
  Les titres hors gabarit sont ignorés (visibles dans le log du job).
- `.github/workflows/update-videos.yml` — relance ce script plusieurs fois par
  heure sur GitHub Actions, avec des reprises réseau. Les horaires GitHub
  peuvent toutefois être décalés ; une panne de génération SEO ou de Data
  Dragon ne bloque plus la publication de `videos.json` (le job reste signalé
  en échec pour être corrigé au passage suivant). Le commit redéploie
  automatiquement GitHub Pages.
- `data/champions.json` — la liste des champions par rôle (grilles) ;
  regénérable via `scripts/gen_champions.py`.
- `data/notes.json` — **écrit à la main** (le robot n'y touche jamais) : les
  bans de rôle et les « à savoir » affichés à droite de chaque matchup.
- `data/setup.json` — **écrit à la main** : mes runes, mes builds et mes
  conseils généraux de jeu, en noms clairs. `scripts/gen_setup.py` les
  résout en `data/setup-built.json`, le fichier que le site lit (voir « Runes et
  builds » plus bas).
- `index.html` + `assets/` — le site (vanilla HTML/CSS/JS, bilingue FR/EN).

## Écrire les « à savoir » et les bans

Tout se passe dans `data/notes.json`, en clair, sans rien relancer côté site
(les pages de référencement, elles, se regénèrent avec `gen_seo.py`).

```jsonc
"bans": { "top": ["Trundle"], "mid": ["Anivia"],
          "adc": ["Soraka"], "support": ["Soraka"] },

"niveaux": {                            // difficulté du matchup
  "top/Darius": "dur",                  // facile (vert) | moyen (orange) | dur (rouge)
  "adc/Ziggs": "facile"
},

"notes": {
  "top/Darius": {                       // "<rôle>/<id du champion>"
    "fr": [
      { "t": "Premier timing", "d": "Le conseil matchup à écrire." },
      { "t": "Fenêtre à jouer", "d": "Un autre conseil, si nécessaire." }
    ],
    "en": [ /* facultatif : sans traduction, le FR s'affiche aussi en EN */ ]
  }
}
```

- `t` = titre court, `d` = le conseil. Chaque conseil apparaît comme une ligne
  précédée d'un tiret, sans code couleur ; le nombre de conseils peut varier
  selon le champion.
- `niveaux` = la première chose qu'on lit : pastille de couleur sous la tuile
  du champion dans la grille **et** en tête du matchup ouvert (et sur la page
  de référencement). Les valeurs anglaises `easy` / `medium` / `hard` sont
  acceptées, la casse et les accents aussi.
- **Les notes s'écrivent en français uniquement.** La clé `en` reste possible
  mais n'est plus tenue à jour : en mode anglais, le site affiche le texte
  français et propose un bouton « 🌐 Translate » qui rouvre la page via
  Google Traduction (`*.translate.goog`).
- Un champion listé dans `bans` sort **en rouge avec une pastille BAN** dans
  la grille du rôle concerné, même sans replay, et une carte « Ban permanent »
  ouvre sa colonne « À savoir ». Le ban est par rôle : Trundle est rouge au
  Top et normal au Mid.
- Le ban n'ajoute **pas** le champion à la grille du rôle : Soraka n'est pas
  une ADC, elle reste absente de la grille ADC — seule la ligne rouge
  « Mon ban en ADC : Soraka » sous le compteur le signale.
- L'id du champion est celui de `data/champions.json` (`Chogath`,
  `MonkeyKing`, `KSante`…) ; la casse et les accents sont tolérés.
- Fichier absent ou JSON cassé = site normal, sans notes ni bans (aucune
  page blanche).

## Runes, builds et conseils généraux (page « Runes & build »)

Une vue à part, sans rapport avec les rôles : bouton **Runes & build** dans la
barre du haut, adresses directes `#setup/runes`, `#setup/builds` et
`#setup/tips`. Les trois contenus ont chacun leur onglet : les conseils
généraux ne sont pas mélangés aux runes, ma page et mon build sont mis en avant
(liseré glace + pastille), et les variantes viennent en dessous avec la phrase
qui dit quand les prendre.

Les conseils généraux sont écrits dans `setup.json` sous `conseils.fr` et
`conseils.en`. Chaque langue contient un `titre` et une liste `items` de
`{ "t": "Titre", "d": "Conseil" }` ; un item peut aussi porter `points`, une
liste affichée en sous-tirets. Le contenu est ajouté à partir des phrases
dictées par Nathan ; le fichier ne doit pas recevoir de principes inventés.

Tout s'écrit dans `data/setup.json`, **en noms clairs**, français ou anglais,
accents et casse libres — `Comète arcanique` comme `Arcane Comet` :

```jsonc
"runes": {
  "mienne": {
    "nom": "Ma page",
    "pourquoi": ["La phrase qui dit quand la prendre.", "Une deuxième ligne si besoin."],
    "principal":  { "arbre": "Sorcellerie", "runes": ["Comète arcanique", "Ruban de mana", "Transcendance", "Brûlure"] },
    "secondaire": { "arbre": "Inspiration", "runes": ["Livraison de biscuits", "Savoir cosmique"] },
    "fragments": ["adaptatif", "adaptatif", "vie"]   // offense, flex, défense
  },
  "alternatives": [ /* même forme */ ]
},
"builds": {
  "mien": {
    "nom": "Mon build",
    "pourquoi": "…",
    "depart": ["Anneau de Doran", "Potion de soin"],
    "coeur": ["Tourment de Liandry", "Sceptre de Rylai"],   // dans l'ordre d'achat
    "bottes": "Chaussures de sorcier",
    "situationnel": ["Sablier de Zhonya"]
  },
  "alternatives": [ /* même forme */ ]
},
"conseils": {
  "fr": {
    "titre": "Conseils généraux",
    "items": [
      { "t": "Level 1, invade bot (si ta bot lane n'est pas AFK)", "d": "Le conseil dicté, sans en ajouter d'autre." },
      { "t": "Level 1 au top : trois choix", "points": ["Premier choix.", "Deuxième choix.", "Troisième choix."] }
    ]
  },
  "en": { "titre": "General tips", "items": [ /* traduction directe */ ] }
}
```

- La **première rune** de `principal` est la rune clef. L'arbre est déduit des
  runes si `arbre` est absent.
- `fragments` : `adaptatif`, `attaque`, `acceleration`, `deplacement`,
  `viescaling`, `vie`, `tenacite` (noms anglais acceptés).
- `pourquoi` accepte **une phrase ou une liste de phrases** : chaque entrée
  devient une ligne à puce sous le titre de la carte.
- `pourquoi` s'écrit en français ; `pourquoiEn` est facultatif (même format) —
  sans lui, le visiteur anglais lit le français et a le bouton « 🌐 Translate ».

Après modification :

```bash
python scripts/gen_setup.py
```

Le script résout les noms contre Data Dragon et écrit `data/setup-built.json`
(icônes, identifiants, arbres complets) — **c'est ce fichier que le site lit**,
jamais `setup.json`. Le robot horaire le relance tout seul : une modification
faite à la main est en ligne dans l'heure, sans rien lancer sur le PC.

Un nom que Data Dragon ne connaît pas **n'efface rien** : il s'affiche en texte
sans icône et le job le liste dans son journal (`PROBLÈME : rune inconnue…`).
Le script vérifie aussi chaque URL d'icône avant d'écrire, donc une image morte
se voit dans le journal du job, pas sur la page du visiteur.

## Cache du navigateur

GitHub Pages sert tout avec `Cache-Control: max-age=600`. Deux garde-fous :

- `index.html` appelle les assets avec un numéro de version
  (`assets/style.css?v=20260903t`, `assets/app.js?v=20260903t`) — **le bumper à chaque modification de
  `app.js` ou `style.css`**, sinon un navigateur qui a l'ancien fichier
  garde l'ancien site.
- les `data/*.json` sont chargés en `cache: "no-cache"` : le navigateur
  revalide à chaque visite (304 si rien n'a changé).

En cas de doute sur un poste : rechargement forcé (Ctrl+Maj+R).

## Commandes utiles

```bash
python scripts/update_videos.py   # mise à jour manuelle des vidéos
python scripts/gen_setup.py       # résout runes et builds (data/setup.json)
python scripts/test_parse.py      # jeu de tests du parseur de titres
python -m http.server 8123        # servir le site en local
```

## Déploiement

Voir [GUIDE-DEPLOIEMENT.md](GUIDE-DEPLOIEMENT.md).
