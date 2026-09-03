# Handoff — nunu-matchups-01

- Date / agent: 2026-09-03 / [codex]
- Context: continuation du site public de matchups Nunu pour nettoyer les conseils matchup, intégrer les trois builds fournis et séparer les vues Runes / Builds.
- Project folder: `~/projects/nunu-matchups-01`
- Files touched: `data/setup.json`, `data/setup-built.json`, `data/notes.json`, `data/videos.json`, `scripts/gen_setup.py`, `scripts/gen_seo.py`, `assets/app.js`, `assets/style.css`, `index.html`, `matchups/`, `sitemap.xml`, `README.md`, `DESIGN.md`, `LESSONS.md`.
- Current state: 28 vidéos au catalogue (19 Top, 1 Mid, 8 ADC), dont le replay Mordekaiser du 3 septembre (`izA4SMQ_8G4`), 23 pages matchup générées sans les anciennes phrases, trois builds et trois pages de runes résolus par Data Dragon 16.17.1, cinq conseils généraux dictés par Nathan en FR/EN. Fiora est classée `Très dur` et Irelia `Dur` en Top ; Fiora, Mordekaiser et Nasus ont leurs conseils dédiés, rendus comme de simples tirets sans titres, avec 28 px entre le tiret et le texte. Teemo a maintenant quatre conseils matchup, dont un lien compact vers les Runes ; le conseil 0-1 est placé uniquement dans les Conseils généraux sous le titre `Lane perdu`. L'onglet Builds affiche en tête `Sceau noir en first item, toujours.` et le build roam contient Kaenic Rookern et Randuin's Omen côte à côte. Les champions bannis sur chaque lane gardent uniquement la phrase commune sous le matchup ; les zones `À savoir` et `Ban permanent` sont masquées. La vue setup propose `#setup/runes`, `#setup/builds` et `#setup/tips`; le shell desktop monte à 1280 px et l'onglet Conseils utilise toute sa largeur utile, avec une dernière ligne 7/12 + 5/12 ; la version locale est synchronisée pour le push GitHub Pages.
- Decisions and rationale: `data/notes.json` ne contient plus aucun conseil inventé ; les futurs textes seront dictés par Nathan et pourront varier en nombre selon le champion. Les conseils matchup sont stockés dans `d` comme textes complets et le renderer ainsi que les pages SEO les affichent uniquement en paragraphes précédés d'un tiret, sans titres visuels, avec un retrait de 28 px. Le champ `link` ajoute seulement les actions internes demandées, comme `Voir les runes` sur Teemo. Les conseils généraux vivent dans leur onglet dédié, sans apparaître avec les runes ; le conseil 2 contient trois sous-tirets et le conseil 3 est un bloc séparé sous le conseil 1 sur desktop. La grille équilibre les hauteurs 1 + 3 face au conseil 2, puis répartit les conseils 4 et 5 sur une dernière ligne 7/12 + 5/12 ; elle se remet en une colonne sur mobile. Le shell desktop va jusqu'à 1280 px pour mieux utiliser les grands écrans. Le build par défaut reprend la première capture ; l'alternative roam s'arrête à la phrase demandée ; l'alternative PV/mana conserve seulement la phrase Rod of Ages, sans icône ni ligne de départ, puis affiche Proto-Belt → Liandry dans le cœur. La consigne globale `Sceau noir en first item, toujours.` est rendue au-dessus des cartes de builds, avec sa traduction anglaise. Le lien du short Hexflash `82RQBo55Qo4` est attaché au point Hexflash. Le resolver filtre les objets hors Faille et préfère les ids SR courts quand Data Dragon propose des homonymes. Pour les bans, le sous-titre du panneau conserve `Ban permanent — pas de replay, et il n'y en aura pas`, sans ajouter de carte dans `À savoir`. Les conseils Fiora, Mordekaiser, Nasus et Teemo sont les seuls textes matchup ajoutés sur cette reprise.
- QA completed and evidence: `test_parse.py` passe à 31/31 titres et 18/18 rangs ; `gen_setup.py` produit 0 nom non résolu et 81/81 icônes vérifiées ; `gen_seo.py` produit 23 pages + 24 URLs sitemap ; `node --check`, les JSON et `git diff --check` passent. Navigateur réel vérifié à 1440×900 puis 390×844 : shell desktop 1280 px, surface Conseils 1240 px, première moitié en 620/620, dernière ligne en 723/517 (7/12 + 5/12), mobile en colonne unique avec items de 335 px ; onglets au clic et aux flèches clavier, hash direct, lien Hexflash exact, FR/EN, quatre conseils Teemo, bouton compact `Voir les runes` vers `#setup/runes`, cinq conseils généraux avec le cinquième titré `Lane perdu`, consigne Sceau noir en tête de l'onglet Builds, trois sous-tirets dans le conseil 2, build PV/mana sans départ Rod et avec Proto-Belt → Liandry, build roam avec Kaenic Rookern et Randuin's Omen de même taille, Fiora en `Très dur` avec un paragraphe sans titre, Irelia en `Dur`, Mordekaiser avec deux paragraphes sans titres et son replay du jour, Nasus avec un paragraphe sans titre, bans Top/Mid/ADC/Support avec sous-titre seul et zone `À savoir` masquée ; `scrollWidth == clientWidth` aux deux tailles et console neuve vide. Le mode `prefers-reduced-motion` est vérifié sur code mais n'a pas été émulé.
- Open risks: Nathan doit encore dicter les conseils Top ; le RSS et les patches peuvent changer entre deux reprises ; les horaires GitHub peuvent être décalés, même si les données vidéo sont maintenant publiées indépendamment des générateurs secondaires.
- Exact next action: recueillir les prochains conseils Top champion par champion après la mise en ligne de cette correction.
- Do not change without review: ne pas remplacer `videos.json` par la seule fenêtre RSS ; ne pas résoudre les objets côté navigateur ; ne pas réintroduire de notes matchup sans les phrases de Nathan ; ne pas supprimer la règle `[hidden]`, le filtrage Data Dragon SR ou les breakpoints de la barre mobile sans refaire l'audit 390/320 px.

## Continuation — correction du doublon de traduction (2026-09-03)

- Cause: en anglais, le bouton interne `FR / EN` était accompagné d'un lien
  externe `🌐 Translate` ajouté pour Google Traduction.
- Correction: le site conserve uniquement `FR / EN` ; le lien externe, son rendu
  JavaScript, ses textes et son CSS ont été retirés.
- Vérification locale: un seul `#lang-toggle` et zéro `#translate-link` en FR
  comme en EN ; le passage FR → EN → FR reste réversible et sans overflow.
- Suite: correction publiée sur GitHub Pages ; au prochain passage, recueillir
  les prochains conseils Top champion par champion.

## Continuation — conseil général sur l'ordre des sorts (2026-09-03)

- Ajout: le sixième conseil général conserve la phrase `On start au W, ensuite
  on prend le E, puis le Q, et on max le Q en premier, puis le E, puis le W.`
- Rendu: deux lignes d'icônes Data Dragon, `W → E → Q` pour la prise puis
  `Q → E → W` pour le max ; la structure passe en pleine largeur desktop et
  reste en colonne sur mobile.
- Vérification locale: six images chargées, séquence accessible, six conseils
  visibles, aucun overflow et aucune erreur console en FR.
- Suite: version `e0dc802` publiée sur GitHub Pages ; au prochain passage,
  recueillir les prochains conseils Top dictés par Nathan.
