# DESIGN — nunu-matchups-01

## Run Context
- Run mode: fresh build
- Brief: site public répertoriant tous les matchups Nunu de la chaîne YouTube Gyn Replays, classés en 5 rôles (Top/Jungle/Mid/ADC/Support) puis par champion ennemi. Ingestion automatique : toutes les heures, le flux RSS de la chaîne est parsé (rôle + adversaire lus dans le titre) et le site se met à jour seul.
- Audience: la commu du créateur — joueurs LoL francophones (site bilingue FR/EN) qui veulent progresser sur Nunu en regardant le replay du matchup exact qu'ils vont affronter.
- Product intent: outil de référence consultable avant une game — trouver le bon replay en < 10 secondes.

## Brain Use Contract
- Query terms: `web-design-fast-lane`, `project-design`, `fast-lane`
- Notes read: `MEMORY.md` (vault), `protocols/web-design-fast-lane.md`, `templates/project-design.md`, mémoires auto `yt-replays-descriptions`, `gyyn-lol-serie`
- External references: flux RSS réel de la chaîne (3 vidéos, gabarit `Nunu ADC vs Ziggs EUW Master 80 LP | Patch 26.15`), Data Dragon (icônes champions, versions.json)
- Decisions extracted (validées par le client, 2026-08-10):
  - Hébergement GitHub Pages, automatisation GitHub Actions (cron horaire, RSS public, zéro clé API)
  - Titres hors gabarit **ignorés** (pas de section « Autres »)
  - Design **esport clean & sobre** (l'identité rétro-RPG gyyn a été proposée et refusée)
  - Bilingue FR/EN ; pages matchup = vidéos seules ; grille complète par rôle avec champions sans vidéo grisés
  - Client sans compte GitHub → livrer le dossier prêt à pousser + guide pas à pas
- Risks identified:
  - RSS ne renvoie que ~15 dernières vidéos → `videos.json` committé est la base persistante, on ne supprime jamais une entrée absente du flux
  - Champion inconnu / nouveau champion → résolution d'id Data Dragon par heuristique + carte d'alias ; échec = vidéo ignorée (choix client) mais loggée dans la sortie du job
  - Cron GitHub Actions : suspendu après ~60 j sans activité du dépôt → documenté dans le guide
  - Screenshots QA : la pane navigateur peut ne pas compositer (pas affichée) → le dire honnêtement si c'est le cas
- Evidence expected before delivery: parseur exécuté sur le flux réel (3/3 vidéos classées), site servi localement, contrôle console propre, lecture DOM desktop + mobile, audit tap-target/focus/overflow, reduced-motion vérifié, captures si la pane composite.

## Aesthetic Genealogy Contract
- Neighbor projects audited: `gyyn-edit-01` (identité rétro-RPG — explicitement refusée ici), `deadlock-parry-01` (web app jeu, DA sombre), `gyn-replays-thumbnail-audit-20260809-01` (branding chaîne)
- Strong DNA: sérieux « site de stats esport » (op.gg, dpm.lol) mais sans leur densité publicitaire ; la glace Nunu comme unique teinte d'accent
- Exact combinations avoided: dashboard générique à cards, navbar pill flottante, hero oversized, dégradés arc-en-ciel esport cliché
- Transformations: le catalogue de matchups devient une « grille de draft » — on choisit son ennemi comme dans un champ select de draft LoL

## Theme Contract
- Palette tokens: fond `#0a0e14` (nuit), panneaux `#101722`, lignes `#1d2735`, texte `#e9f0f7`, muted `#8593a5`, accent glace `#6fd3ff` (+ hover `#a5e3ff`), win `#39d98a`, chip patch `#22314a`
- Typography: display « Chakra Petch » (tech/esport, uppercase, letterspacing) pour titres/tabs/compteurs ; « Inter » pour tout le reste. Chiffres tabulaires pour les stats.
- Materials/textures: aplats mats, une seule élévation (panneau), lueur froide très courte sur hover/focus — pas de glassmorphism, pas de grain
- Layout geometry: verticale stricte, contenu max 1120 px ; la grille de champions est le seul élément dense ; biseau 8° sur l'indicateur de rôle actif (signature)
- Motion grammar: transitions 120–160 ms opacity/transform uniquement ; `prefers-reduced-motion` = tout à 0
- Interaction metaphor: « pick d'ennemi » — on clique le portrait ennemi, le panneau matchup s'ouvre dessous (pas de modal), hash routable `#adc/ziggs`
- Asset roles: portraits champions = Data Dragon CDN ; miniatures vidéos = i.ytimg.com ; aucun asset local généré hors favicon SVG
- Concrete UI proof: l'onglet rôle actif porte le biseau glace + compteur de couverture `12/45` ; un portrait sans replay est désaturé à 15 % avec tooltip « Pas encore de replay »

## DA Volume Dial
- Target volume: 2/5 (sobre assumé — décision client)
- Signature: le biseau glace 8° (tab actif, bord gauche du panneau matchup, soulignement du logo)
- Recurring motif: compteur de couverture par rôle (x/y) — répété tabs + en-tête de grille
- Calm zones: tout sauf la grille et le tab actif ; fond uni, pas de décor
- What must be removed if too loud: la lueur hover (garder le seul changement de bordure)

## Premium Navbar Contract
- Narrative role: barre unique = identité (logo GYN REPLAYS) + les 5 rôles + toggle FR/EN + lien chaîne. Pas de navigation secondaire.
- Geometry and states: barre pleine largeur collée en haut, fond `#0a0e14` à 92 % d'opacité ; tab actif = texte accent + biseau ; focus visible au clavier (anneau accent 2 px)
- Mobile behavior: logo + toggle sur la ligne 1, rôles en rangée défilable ligne 2 ; cibles ≥ 44 px
- Identity proof: les icônes de rôle (SVG inline maison) — pas d'emoji, pas d'icônes de librairie

## Section Craft Matrix
| Section | Narrative job | Topology | Rhythm | Material | Interaction | Proof | Relation before/after |
|---|---|---|---|---|---|---|---|
| Barre | s'orienter par rôle | barre 1 ligne (2 en mobile) | dense | mat | tabs + hash | biseau actif | fixe au-dessus de tout |
| Derniers replays | montrer que le site vit | rangée horizontale 3–6 cartes | aéré | mat | clic → YouTube | date relative | sous la barre, avant la grille |
| Grille ennemis | trouver son matchup | grid auto-fill 72 px | dense | portraits | clic → panneau | désaturation sans replay | cœur du site |
| Panneau matchup | regarder le bon replay | liste verticale de cartes vidéo | aéré | miniature 16:9 | clic → YouTube | patch + rang + date | s'insère sous la grille, ancré par hash |
| Pied | rappeler la chaîne | 1 ligne | calme | mat | lien abonnement | — | clôture |

## Component / Effect Activation Contract
- Foundation: reset CSS maison, tokens CSS custom properties, layout header/main/footer
- Support: cartes vidéo, chips (patch/rang), tooltip natif `title` + aria-label, toggle langue
- Signature primitive: tab de rôle biseauté + compteur de couverture (perceptible, unique au site)
- Aucun composant tiers — tout maison, rien à re-skinner

## Live Catalog / Registry Contract
- Aucun registre tiers consulté pour des composants (site vanilla maison). Sources live utilisées : flux RSS réel de la chaîne, Data Dragon versions.json.

## ImageGen Maquette Quality Gate
- Non applicable (volume 2/5, pas de maquette ImageGen — décision : direct au code avec Theme Contract ci-dessus)

## SOTD/SOTY Experience Contract
- Non visé (outil communautaire sobre, pas une pièce de concours)

## QA Plan
- Parseur : exécution réelle sur le flux RSS (attendu 3/3 classées ADC), + jeu de titres pièges en test unitaire (`scripts/test_parse.py`)
- Front : servir localement, console 0 erreur, lecture DOM desktop 1280 et mobile 375, hash routing, toggle FR/EN persistant, reduced-motion, focus clavier, tap-targets ≥ 44 px, aucun overflow horizontal
- Captures desktop + mobile dans `qa/` si la pane composite (sinon le déclarer)
- Revue adversariale (workflow multi-agents) sur parseur + front + guide avant livraison

## QA — Résultats (2026-08-10)
- Parseur : `test_parse.py` **26/26** (métadonnées vérifiées, faux matchups rejetés, accents, séparateurs collés) ; flux réel ingéré 3/3, ré-exécution idempotente (« aucun changement »)
- Front vérifié dans la pane (DOM/JS) : console **0 erreur** ; hash routing + deep-link + hash malformé (`#adc/kai%s`) sans crash ; hash invalide resynchronisé ; recherche réinitialisée au changement de rôle (2 chemins) ; focus clavier préservé (onglets in-place, retour tuile après fermeture) ; FR/EN persistant, aria traduits ; tap-targets ≥ 44 px ; overflow horizontal 0 à 375 px
- Contrastes recalculés : chips `#9db0c4` sur `#22314a` = **5,88:1** (AA) ; biseau panneau borné 104 px + `pointer-events: none`
- Captures réelles (Edge headless, la pane ne compositait pas — pas affichée côté client) : `qa/desktop-home.png`, `qa/desktop-matchup-full.png`, `qa/mobile-home.png`, `qa/mobile-full.png` — relues à l'œil
- Reduced-motion : media query globale + `scrollIntoView` conditionné à `prefers-reduced-motion` (non émulé en navigateur, vérifié sur code)
- Revue adversariale : 27 agents, **23 constats confirmés / 0 réfuté → 23 corrigés** (parseur ×5, front JS ×4, HTML/CSS/a11y ×10, CI+guide ×4) ; détail dans le rapport de run et `git` du projet

## Runes & build (ajout du 2026-08-27)

**Décision de portée** — demandé explicitement : « un endroit réservé aux runes
et build **sans rapport avec les lanes** ». Donc une vue à part (`#setup`), pas
une colonne de plus dans le panneau de matchup, et aucune donnée par rôle.

**Décisions de forme**

- Page de runes **dessinée comme en jeu** : l'arbre entier est affiché, les
  runes non prises restant visibles mais éteintes (opacité 0,26 + niveaux de
  gris). Une simple file d'icônes prises ne se reconnaît pas — c'est le
  contraste pris/pas pris qui donne la forme de la page.
- **Ma page / mon build** portent le biseau glace du panneau de matchup et une
  pastille pleine ; les variantes sont neutres. Un seul signe distingue le
  défaut des variantes, pas trois.
- Chaque variante porte **une phrase** (`pourquoi`) : sans elle, une deuxième
  page de runes n'apprend rien.
- Build : icônes **avec le nom sous chaque objet** (pas d'infobulle seule — sur
  téléphone il n'y a pas de survol) et chevron d'ordre d'achat sur le cœur.

**Décisions techniques**

- Le fichier tenu à la main (`setup.json`) ne contient que des **noms** ; un
  script (`gen_setup.py`) les résout contre Data Dragon vers `setup-built.json`.
  Alternative écartée : résoudre côté navigateur, qui imposait de télécharger
  `item.json` (≈ 1 Mo) à chaque visiteur de la page.
- `setup-built.json` est **chargé à la première ouverture de la vue** seulement :
  la page d'accueil ne paie pas les runes pour quelqu'un venu voir un replay.
- Le générateur **vérifie chaque URL d'icône** (HEAD) avant d'écrire, et liste
  les noms non résolus dans le journal du job — jamais de rejet silencieux, même
  règle que la résolution des champions.
- Étape ajoutée au job horaire : une modification à la main de `setup.json` est
  en ligne dans l'heure sans rien lancer sur le PC.

**QA — 2026-08-27**

- Rendu vérifié sur un jeu d'exemple complet (3 pages de runes, 3 builds, 27
  runes prises sur 91 affichées, 25 objets, 0 nom non résolu, 76/76 icônes
  joignables), puis sur le contenu réel.
- Débordement horizontal : **0** à 1280, 375 et 320 px (mesuré dans le
  navigateur : `scrollWidth == clientWidth`, aucun élément au-delà du viewport).
  Corrigé en cours de route : la barre du haut débordait à cause du troisième
  bouton (libellé court sur téléphone, nom de la chaîne masqué sous 360 px), et
  les deux arbres côte à côte ne tenaient pas sous 720 px (l'arbre principal
  prend sa propre ligne).
- Bilingue vérifié FR/EN (arbres, runes, objets, titres, libellés du bouton).
- Console : aucune erreur. Cibles tactiles de la barre : 44 px de haut.
- **Piège connu re-rencontré** : `#matchup-links` portait `hidden` mais restait
  affiché sous la vue runes (`display:flex` écrase `[hidden]`). Règle
  `.matchup-links[hidden] { display: none; }` ajoutée — même leçon que le bouton
  Translate, deuxième occurrence.
- **Limite honnête** : capture desktop réelle (`qa/setup-desktop.png`). La
  capture mobile (`qa/setup-mobile.png`) est **rognée à droite par l'outil de
  capture** (le navigateur headless de ce PC met en page plus large que la
  fenêtre demandée — la page d'accueil non modifiée est rognée pareil) ; le
  contrôle mobile qui fait foi est la mesure DOM ci-dessus, pas cette image.
- Contenu affiché : la **page de runes réelle** (Domination / Électrocution,
  secondaire Inspiration, 2 adaptatifs + 65 vie), résolue 33/33 icônes. Les
  pages d'exemple ont été retirées. **Les builds restent à saisir** : rien n'est
  inventé, et la section « Builds » ne s'affiche pas tant qu'elle est vide.
