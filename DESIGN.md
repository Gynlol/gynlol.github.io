# DESIGN — nunu-matchups-01

## Run Context
- Run mode: continuation
- Brief: site public répertoriant tous les matchups Nunu de la chaîne YouTube Gyn Replays, classés en 5 rôles (Top/Jungle/Mid/ADC/Support) puis par champion ennemi. Ingestion automatique : toutes les heures, le flux RSS de la chaîne est parsé (rôle + adversaire lus dans le titre) et le site se met à jour seul.
- Audience: la commu du créateur — joueurs LoL francophones (site bilingue FR/EN) qui veulent progresser sur Nunu en regardant le replay du matchup exact qu'ils vont affronter.
- Product intent: outil de référence consultable avant une game — trouver le bon replay en < 10 secondes.

## Brain Use Contract
- Query terms: `web-design-fast-lane`, `web-quality-ratchet-harness`, `build Nunu`, `pick général`, `responsive mobile`
- Notes read: `MEMORY.md` (vault), `meta/brain-runtime-protocol.md`, `meta/project-run-isolation.md`, `meta/agent-collaboration.md`, `protocols/web-design-fast-lane.md`, `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`, `frontend/pattern-convergence-guard.md`, `gotchas/frontend-gotchas.md`, `templates/project-design.md`, `LESSONS.md` du run
- External references: flux RSS réel de la chaîne relu le 2026-09-02 (27 vidéos classées), Data Dragon 16.17.1 (icônes champions, runes et objets), rendu local dans un navigateur réel à 1280 et 375 px
- Decisions extracted (validées par le client, 2026-08-10): séparation nette entre catalogue de matchups et vue de builds/pick, avec direction esport sobre et bilingue
  - Hébergement GitHub Pages, automatisation GitHub Actions (cron horaire, RSS public, zéro clé API)
  - Titres hors gabarit **ignorés** (pas de section « Autres »)
  - Design **esport clean & sobre** (l'identité rétro-RPG gyyn a été proposée et refusée)
  - Bilingue FR/EN ; pages matchup = vidéos seules ; grille complète par rôle avec champions sans vidéo grisés
  - Client sans compte GitHub → livrer le dossier prêt à pousser + guide pas à pas
  - La vue « Runes & build » reste indépendante des rôles ; elle reçoit le build de référence, deux adaptations de composition et les principes de pick communs à tous les matchups
  - Les conseils de pick sont éditoriaux et généraux : ils expliquent quand verrouiller Nunu et comment définir le plan de partie, sans prétendre remplacer une analyse de patch ou une décision personnelle
- Risks identified: flux RSS glissant, contenu manuel à maintenir et preuve mobile à refaire après chaque changement de layout
  - RSS ne renvoie que ~15 dernières vidéos → `videos.json` committé est la base persistante, on ne supprime jamais une entrée absente du flux
  - Champion inconnu / nouveau champion → résolution d'id Data Dragon par heuristique + carte d'alias ; échec = vidéo ignorée (choix client) mais loggée dans la sortie du job
  - Cron GitHub Actions : suspendu après ~60 j sans activité du dépôt → documenté dans le guide
  - Screenshots QA : la pane navigateur peut ne pas compositer (pas affichée) → le dire honnêtement si c'est le cas
  - Le flux peut faire évoluer titres, patch et nombre de vidéos entre deux reprises → régénérer `videos.json`, les pages SEO et le sitemap avant de qualifier le catalogue de complet
  - Les builds sont des contenus à maintenir manuellement ; le générateur doit résoudre chaque nom et refuser toute icône morte avant publication
- Evidence expected before delivery: parseur exécuté sur le flux réel (27 vidéos classées), site servi localement, contrôle console propre, lecture DOM desktop + mobile, audit tap-target/focus/overflow, reduced-motion vérifié, captures si la pane composite.

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

## Continuation — contenu builds, pick et matchups (2026-09-02)

- Le run est repris explicitement depuis `nunu-matchups-01`, avec `LESSONS.md` relu avant modification ; la lignée précédente [claude] est conservée.
- Le flux réel a ajouté 5 replays et actualisé 8 métadonnées : 27 vidéos au total, 14 Top, 1 Mid et 8 ADC couverts ; aucun Support n'est annoncé par la source.
- `data/setup.json` reste la seule source manuelle : le build principal est AP polyvalent (Anneau de Doran → Tourment de Liandry → Sceptre de Rylai → Chaussures de sorcier), accompagné de variantes anti-burst et frontline. Les conseils de pick sont stockés dans cette même vue, en français et en anglais.
- Les 23 matchups connus reçoivent une première passe de notes « À savoir » et les six nouvelles entrées Top reçoivent un niveau ; ces textes sont des conseils de jeu généraux à affiner si Nathan veut refléter une séquence précise de ses replays.
- La section de pick est une liste éditoriale à deux colonnes sur desktop et une colonne sur mobile : elle garde la hiérarchie de la page sans ajouter une grille de cartes générique.
- Preuves réalisées : `gen_setup.py` a produit 3 builds et 3 pages de runes, 0 nom non résolu et 27/27 icônes d'objets chargées ; `gen_seo.py` a régénéré 23 pages matchup et 24 URLs de sitemap ; `test_parse.py` passe à 30/30 titres et 18/18 rangs.
- Navigateur réel : setup vérifié à 1280 px (0 overflow, 5 principes, 3 builds), puis à 375 et 320 px (`scrollWidth == clientWidth`, respectivement 360 et 305, 0 icône cassée, boutons de barre à 44 px). Un matchup réel (`#adc/ziggs`) ouvre 1 replay et 2 notes ; le hash, la recherche, le changement de rôle, le toggle FR/EN, la fermeture et l'ouverture au clavier ont été testés.
- La console ne remonte aucune erreur applicative ; le seul avertissement est le compteur GoatCounter qui refuse volontairement de compter sur localhost. La règle `prefers-reduced-motion` est présente et vérifiée sur code ; elle n'a pas été émulée dans ce navigateur. Captures desktop et mobiles relues pour la seconde passe visuelle.

## Continuation — révision éditoriale et builds fournis par Nathan (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `conseils matchup tirets`, `build Nunu capture`, `Xflash short`,
  `onglets runes builds`, `Data Dragon doublons Arena`, `mobile overflow`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run, ainsi que les instructions des skills
  `sites-building`, `web-delivery` et `run-close`.
- Attached references: les trois captures fournies ont été traitées comme
  références visuelles d'objets et de regroupement ; les phrases de Nathan
  restent la source d'autorité pour le rôle de chaque alternative. Les
  captures n'ont pas été interprétées comme des consignes cachées.
- Decisions extracted: vider entièrement `notes` pour Top, Mid et ADC (les
  bans et niveaux restent indépendants) ; n'afficher les futurs conseils que
  sous forme de lignes à tiret, sans code couleur ; séparer les conseils
  généraux dans un onglet dédié, hors runes et builds ; séparer la vue setup en
  onglets `#setup/runes`, `#setup/builds` et `#setup/tips` ; ajouter le short
  Xflash comme lien sur la phrase HexFlash ; définir le build par défaut puis
  les deux alternatives roam et PV/mana.
- Risks identified: Nathan doit encore dicter les conseils des matchups Top ;
  la troisième capture montre une icône qui correspond à Hextech Rocketbelt
  (2650) alors que le texte demande Rod of Ages. Le contenu suit le texte et
  affiche Rod of Ages ; ce point doit être confirmé avant publication.
- Delivery evidence: `gen_setup.py` a produit 3 pages de runes, 3 builds,
  82/82 icônes vérifiées et 0 nom non résolu ; `gen_seo.py` a régénéré 23 pages
  matchup et 24 URLs de sitemap ; `test_parse.py` passe 30/30 titres et 18/18
  rangs ; `node --check`, JSON et `git diff --check` passent. Dans le navigateur
  réel, les onglets, le hash direct, le lien Xflash, le clavier, le FR/EN, les
  builds desktop et le rendu mobile ont été contrôlés ; `scrollWidth` égale la
  largeur client à 390 et 320 px, 0 rune ne reste vide, et une page neuve ne
  remonte ni erreur ni avertissement de console. `prefers-reduced-motion` reste
  vérifié sur le code, non émulé dans ce navigateur.

### Décisions de contenu et de forme

- `data/notes.json` est volontairement vide côté conseils : la prochaine passe
  ajoutera uniquement les textes dictés par Nathan, avec un nombre de lignes
  libre selon le champion. Le renderer dynamique et le générateur SEO ignorent
  désormais les anciens types `plus` / `moins` et dessinent un tiret neutre.
- La page setup présente d'abord l'onglet Runes, avec les principes de pick et
  le lien Xflash, puis l'onglet Builds affiche séparément les trois chemins.
  Les onglets sont routables et accessibles au clic comme aux flèches gauche /
  droite du clavier.
- Les objets des captures ont été résolus contre Data Dragon 16.17.1 :
  Stormsurge + Hextech Rocketbelt par défaut ; Shurelya + items de roam en
  alternative ; Rod of Ages + Liandry et les objets défensifs pour l'alternative
  PV/mana. Le resolver filtre les objets hors Faille et préfère les ids courts,
  ce qui évite de servir une icône Arena homonyme.

## Continuation — conseils dictés et troisième onglet (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `conseils généraux onglet`, `level 1 invade bot`,
  `Rod of Ages Proto-Belt Liandry`, `mobile overflow`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `run-start`,
  `sites-building`, `web-delivery`, `computer-use` et `run-close`.
- Attached references: les captures restent des références visuelles de
  regroupement et d'icônes ; le nouveau texte et l'ordre des objets viennent
  des corrections explicites de Nathan.
- Decisions extracted: supprimer les cinq principes de pick inventés ; créer
  un onglet `#setup/tips` séparé ; conserver seulement les trois conseils
  dictés ; raccourcir la variante roam ; mettre Rod of Ages au départ puis
  Proto-Belt → Liandry au cœur du build PV/mana.
- Risks identified: les conseils Top restent à dicter ; les conseils généraux
  ne doivent pas être enrichis sans nouvelle formulation de Nathan.
- Delivery evidence: onglet Conseils testé au clic et par hash direct ; les
  runes n'affichent plus les conseils généraux ; les trois conseils sont
  visibles au bon endroit ; les builds affichent la phrase raccourcie et
  Rod of Ages / Proto-Belt / Liandry ; mesures mobile 390/320 sans overflow,
  cibles visibles à 44 px ou plus et console neuve vide.

### Décisions de contenu et de forme

- `data/setup.json` porte désormais `conseils.fr` / `conseils.en` avec trois
  entrées `{t,d}`. Elles sont une traduction structurée des formulations
  dictées, sans ajout de principe de jeu.
- Le setup comporte trois onglets indépendants : `Runes`, `Builds`,
  `Conseils`. Le hash et les flèches gauche/droite suivent ces trois états.
- L'alternative roam affiche uniquement la phrase courte demandée. La variante
  PV/mana affiche Rod of Ages dans `Départ`, puis la séquence Proto-Belt →
  Liandry dans `Cœur`, avec la phrase de mana conservée.

## Continuation — hiérarchie des conseils et retrait de Rod (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `Rod no icon depart`, `Level 1 top three choices`,
  `nested dash list`, `responsive QA`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `run-start`, `sites-building`,
  `web-delivery` et `run-close`.
- Visual references: les trois captures de builds fournies ; elles servent de
  référence de regroupement, tandis que les formulations et corrections de
  contenu de Nathan restent l'autorité éditoriale.
- Decisions extracted: conserver la phrase Rod of Ages mais retirer son icône et
  toute ligne `Départ` de la variante PV/mana ; garder Proto-Belt → Liandry dans
  `Cœur` ; modéliser le conseil Top comme un item avec trois sous-tirets ; ne
  rien inventer dans les conseils généraux.
- Risks identified: les conseils matchup Top restent à dicter ; les données RSS
  et les patches peuvent changer entre deux reprises ; la publication distante
  reste volontairement hors périmètre.
- Delivery evidence: source et build compilé contiennent 2 conseils principaux,
  dont 3 sous-points ; la variante PV/mana n'a plus de `depart` ; les contrôles
  navigateur finaux ont confirmé le rendu FR/EN, les deux breakpoints mobiles,
  l'absence de débordement, les cibles tactiles et la console vide.

### Décisions de contenu et de forme

- `conseils.fr` et `conseils.en` portent deux entrées principales. Le second
  titre est `Level 1 au top : trois choix` et ses trois choix sont rendus avec
  des tirets imbriqués.
- La phrase d'explication PV/mana reste sous le build ; Rod of Ages n'est pas
  une carte d'objet ni un objet de départ affiché. Le cœur visible commence par
  Proto-Belt puis Liandry, et le situationnel reste inchangé.

## Continuation — troisième conseil et grille équilibrée (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `third general tip`, `tips grid two rows`, `spacing dash text`,
  `mobile stack`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `run-start`, `sites-building`,
  `web-delivery` et `run-close`.
- Decisions extracted: ajouter le troisième conseil avec la formulation fournie
  ; garder les trois choix imbriqués dans le conseil 2 ; sur desktop, faire
  occuper au conseil 2 les deux rangées pendant que les conseils 1 et 3 restent
  empilés à gauche ; augmenter les espacements du conseil 2 ; repasser en une
  colonne sur mobile.
- Risks identified: les conseils matchup Top restent à dicter ; les données RSS
  et les patches peuvent changer entre deux reprises ; la publication distante
  reste volontairement hors périmètre.
- Delivery evidence: le navigateur réel confirme 3 conseils, 3 sous-points,
  deux rangées desktop de 200 px et aucune largeur débordante à 390/320 px ; la
  console neuve reste vide.

### Décisions de contenu et de forme

- Le troisième conseil est stocké comme un item indépendant, avec le titre
  `Quand tu meurs et recall` et la phrase d'action en dessous.
- Le conseil 2 garde ses trois choix sous forme de tirets, avec 24 px entre le
  tiret et le texte et 14 px entre les choix ; les blocs 1 et 3 partagent une
  hauteur de ligne, face au bloc 2 qui couvre les deux lignes.

## Continuation — quatrième conseil et ligne dédiée (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `fourth general tip`, `AP first gold spend`,
  `boots 300 gold`, `fourth grid row`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `run-start`, `sites-building`,
  `web-delivery` et `run-close`.
- Decisions extracted: ajouter le quatrième conseil avec la règle d'achat
  fournie ; conserver la composition 1/3 à gauche et 2 sur deux rangées à droite
  ; placer le nouveau conseil sur une ligne dédiée pleine largeur desktop ;
  réinitialiser toute position spéciale sur mobile.
- Risks identified: les conseils matchup Top restent à dicter ; les données RSS
  et les patches peuvent changer entre deux reprises ; la publication distante
  reste volontairement hors périmètre.
- Delivery evidence: la source et le build compilé contiennent 4 conseils, dont
  3 sous-points dans le second ; le navigateur confirme la ligne dédiée à
  1294 px, l'empilement à 390/320 px et zéro erreur console.

### Décisions de contenu et de forme

- Le quatrième conseil est intitulé `Comment dépenser tes golds` ; son contenu conserve
  l'achat d'AP en début de partie, le stat-check, puis l'achat des bottes
  uniquement lorsqu'aucun achat d'AP n'est possible avec 300 gold, avec un achat
  anticipé pour roam si la lane est trop dure ou perdue.

## Continuation — message commun des bans (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `ban permanent`, `pas de replay`, `bans par lane`, `note matchup`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `sites-building`,
  `web-delivery` et `run-close`.
- Decisions extracted: les champions bannis sur Top, Mid, ADC et Support gardent
  le titre `Ban permanent` et affichent uniquement une phrase commune ; la phrase
  qui expliquait le ban selon le rôle est retirée du renderer dynamique et des
  pages SEO.
- Risks identified: les conseils matchup Top restent à dicter ; la publication
  distante reste volontairement hors périmètre.
- Delivery evidence: Trundle, Anivia et Soraka ont été contrôlés dans les quatre
  lanes ; le texte commun est visible, l'ancien texte rôle-spécifique est absent,
  aucun débordement horizontal n'est présent et la console reste vide.

### Décisions de contenu et de forme

- Le sous-titre du panneau de ban conserve `Ban permanent — pas de replay, et il
  n'y en aura pas` ; aucune carte de ban n'est ajoutée dans la zone de conseils.

## Continuation — zone de conseils masquée pour les bans (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `ban panel subtitle`, `hide À savoir`, `no ban note`, `all lanes`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `sites-building`,
  `web-delivery` et `run-close`.
- Decisions extracted: pour un champion banni, ne rendre aucune carte dans la
  colonne de conseils ; conserver uniquement le sous-titre commun du panneau
  sous le matchup ; appliquer la règle au renderer dynamique et aux pages SEO.
- Risks identified: les conseils matchup Top restent à dicter ; la publication
  distante reste volontairement hors périmètre.
- Delivery evidence: les bans Trundle, Anivia et Soraka ont été testés en Top,
  Mid, ADC et Support ; la zone `À savoir` est masquée, la phrase du panneau
  reste visible, l'ancien texte rôle-spécifique est absent, et la console est vide.

### Décisions de contenu et de forme

- La zone de conseils n'est créée que lorsqu'il existe de vrais conseils pour le
  matchup ; un ban n'ajoute donc plus de titre ni de carte artificielle.

## Continuation — difficulté Fiora et Irelia (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `Fiora très dur`, `Irelia dur`, `badge difficulté`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `sites-building`,
  `web-delivery` et `run-close`.
- Decisions extracted: mettre `top/Fiora` à `tresdur` et `top/Irelia` à `dur` dans
  la source éditoriale des niveaux, puis régénérer les pages SEO.
- Risks identified: les conseils matchup Top restent à dicter ; la publication
  distante reste volontairement hors périmètre.
- Delivery evidence: le navigateur affiche `Très dur` pour Fiora et `Dur` pour
  Irelia ; la console est vide et aucun débordement horizontal n'est présent.

### Décisions de contenu et de forme

- Les niveaux restent stockés séparément des notes dans `data/notes.json` et sont
  traduits automatiquement par le renderer.

## Continuation — conseil du matchup Fiora (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `Fiora`, `matchup quasiment impossible`, `niveau 3`, `roam`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `sites-building`,
  `web-delivery` et `run-close`.
- Decisions extracted: ajouter un seul conseil Top à la fiche Fiora, avec le titre
  et la formulation fournis, en conservant le rendu neutre en tiret.
- Risks identified: les autres conseils matchup Top restent à dicter ; la
  publication distante reste volontairement hors périmètre.
- Delivery evidence: le conseil est visible sur `#top/fiora`, avec le badge
  `Très dur`, sans erreur console ni débordement horizontal ; la page SEO Fiora
  a aussi été régénérée.

### Décisions de contenu et de forme

- Titre : `Matchup quasiment impossible si la Fiora joue bien`.
- Conseil : `Donc regarde un peu comment elle joue. Si elle joue bien, prends ton
  niveau 3 et roam.`

## Continuation — conseils sans intitulés (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `conseils sans titres`, `même police`, `tirets`, `Mordekaiser`,
  `Nasus`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `sites-building`,
  `web-delivery` et `run-close`.
- Decisions extracted: les conseils matchup sont des textes complets rendus dans
  un seul paragraphe par tiret ; aucun sous-titre en gras ne doit être ajouté ;
  le renderer et le générateur SEO acceptent le format `{ d: texte }`.
- Risks identified: les autres conseils matchup Top restent à dicter ; la
  publication distante reste volontairement hors périmètre.
- Delivery evidence: les fiches Fiora, Mordekaiser et Nasus ont été vérifiées ;
  Mordekaiser affiche deux paragraphes, Fiora et Nasus un paragraphe, sans
  `h4`, avec la même famille de police, sans erreur console ni overflow.

### Décisions de contenu et de forme

- Les conseils fournis par Nathan sont stockés comme phrases complètes dans `d`;
  les champs `t` ne servent plus à fabriquer des titres visuels.

## Continuation — espacement des tirets (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `espacement tiret texte`, `conseils matchup`, `28 px`, `Fiora`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `sites-building`,
  `web-delivery` et `run-close`.
- Decisions extracted: augmenter l'espace horizontal entre le tiret et le texte
  à 28 px dans le renderer interactif et dans le CSS des pages SEO ; conserver
  l'espace vertical existant.
- Risks identified: les autres conseils matchup Top restent à dicter ; la
  publication distante reste volontairement hors périmètre.
- Delivery evidence: la fiche Fiora affiche 28 px de retrait, le texte reste en
  `Inter`, la page n'a pas de débordement horizontal et les pages SEO ont été
  régénérées.

### Décisions de contenu et de forme

- Le tiret reste positionné à gauche de chaque conseil ; le retrait du paragraphe
  est fixé à 28 px pour une séparation lisible sans augmenter la hauteur des blocs.

## Continuation — conseils Teemo et accès aux runes (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `Teemo`, `Hexflash`, `bouton Voir les runes`, `cinquième conseil`,
  `Sceau noir first item`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; les skills `sites-building`,
  `web-delivery` et `run-close`.
- Decisions extracted: ajouter cinq conseils texte à la fiche Teemo ; joindre au
  conseil Hexflash un petit lien interne vers `#setup/runes` ; afficher la
  consigne Sceau noir en haut de l'onglet Builds ; conserver la même règle dans
  la version interactive et dans les sorties générées.
- Risks identified: la publication GitHub Pages doit encore être effectuée ; les
  prochains conseils Top restent à dicter ; le RSS et les patches peuvent changer.
- Delivery evidence: la fiche Teemo affiche 5 conseils ; le lien ouvre `#setup/runes`;
  l'onglet Builds affiche `Sceau noir en first item, toujours.` ; le bouton fait
  44 px de haut, la console est vide et aucun overflow n'est présent.

### Décisions de contenu et de forme

- Le cinquième conseil Teemo est : `Si tu es en 0-1, ta lane est perdue. Il y a
  quasiment aucun angle de comeback, donc achète des bottes et roam.`
- Le bouton du conseil Hexflash est libellé `Voir les runes` et utilise le routage
  interne du site ; la version SEO renvoie vers la page d'accueil, onglet Runes.
- La consigne de build est portée par `builds.notice` / `builds.noticeEn` et se
  place avant les cartes de builds.

## Continuation — synchronisation du replay Mordekaiser et lien compact (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `vidéo du jour`, `Mordekaiser`, `flux RSS`, `job GitHub`,
  `bouton plus petit`.
- Notes read: `MEMORY.md`, `meta/project-run-isolation.md`,
  `protocols/web-quality-ratchet-harness.md`, `frontend/web-craft-standard.md`,
  `LESSONS.md` et `HANDOFF.md` du run ; état du dépôt, flux RSS réel, données
  déployées et historique GitHub Actions.
- Decisions extracted: conserver le parseur RSS qui reconnaît le titre exact du
  replay du jour ; publier `videos.json` même si la génération SEO ou Data
  Dragon tombe, tout en laissant le job signaler l'échec ; rendre le lien
  Hexflash compact visuellement sans lui retirer sa zone de clic étendue.
- Risks identified: GitHub peut décaler les tâches planifiées et YouTube reste
  une source externe ; la disponibilité immédiate n'est donc pas garantie à la
  seconde de publication.
- Delivery evidence: le flux contient `izA4SMQ_8G4`, le titre Mordekaiser est
  parsé en Top / Platinum 2 / 47 LP / patch 26.17, la page déployée contient ce
  replay, et le bouton Teemo mesure 20 px visuellement avec fond transparent,
  sans overflow.

### Décisions de synchronisation

- Le replay Mordekaiser a été ajouté par le job automatique à 12 h 17, après sa
  publication à 12 h 00 ; le retard venait du déclenchement planifié GitHub,
  pas d'un échec du parseur.
- Les étapes auxiliaires du workflow sont tolérantes pour permettre la
  publication des données vidéo ; une étape finale garde l'échec visible afin
  que la génération manquante soit retentée et diagnostiquée.

## Continuation — formulation finale du build PV / mana (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `Rod of Ages`, `PV mana`, `phrase build`, `bouton compact`.
- Notes read: `MEMORY.md`, `LESSONS.md` et `HANDOFF.md` du run, ainsi que
  `data/setup.json` et `data/setup-built.json`.
- Decisions extracted: la phrase s'arrête après `commence par Rod of Ages.` ;
  Rod of Ages reste une explication et ne devient ni icône ni ligne de départ.
- Risks identified: seules les formulations dictées par Nathan font autorité ;
  la traduction anglaise doit rester alignée sans rallonger la phrase française.
- Delivery evidence: les deux fichiers de setup contiennent la phrase courte,
  le build PV / mana n'affiche aucun départ Rod et son cœur reste
  Proto-Belt → Liandry.

## Continuation — déplacer le conseil 0-1 dans les conseils généraux (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `Si tu es en 0-1`, `Conseils généraux`, `Teemo`, `conseil sans titre`.
- Notes read: `MEMORY.md`, `LESSONS.md` et `HANDOFF.md` du run ; les notes de
  qualité web déjà consultées pour la validation du site.
- Decisions extracted: le conseil 0-1 est un conseil général, pas un conseil
  spécifique à Teemo ; il est retiré de `data/notes.json` et ajouté comme
  cinquième entrée titleless dans `data/setup.json`. Le renderer n'ajoute un
  titre que lorsqu'un champ `t` est fourni, afin de conserver exactement la
  formulation dictée sans inventer de titre.
- Risks identified: aucune nouvelle formulation matchup ne doit être ajoutée
  sans dictée de Nathan ; les sorties interactives et SEO doivent rester
  synchronisées après chaque déplacement de contenu.
- Delivery evidence: `setup-built.json` contient le conseil 0-1 dans l'onglet
  Conseils généraux ; la page Teemo générée ne le contient plus ; les sources
  et les fichiers résolus restent valides.

## Correction — titre du conseil général 0-1 (2026-09-03)

### Brain Use Contract — delta de cette reprise

- Query terms: `Lane perdu`, `cinquième conseil`, `titre conseils généraux`.
- Notes read: `MEMORY.md`, `LESSONS.md` et `HANDOFF.md` du run.
- Decisions extracted: utiliser exactement le titre dicté `Lane perdu` pour le
  cinquième conseil FR ; aligner la version anglaise sur `Lost lane` ; conserver
  le texte 0-1 et sa place dans l'onglet Conseils généraux.
- Risks identified: ne pas reformuler le conseil ni le déplacer de nouveau sans
  nouvelle consigne ; les sorties interactive et SEO doivent rester régénérées
  depuis les sources.
- Delivery evidence: le renderer affiche `LANE PERDU`, le bloc contient toujours
  la phrase 0-1, `tipsCount` vaut 5, le site n'a aucun overflow et la console
  navigateur est vide.
