# LESSONS — nunu-matchups-01

> Registre **reconstruit le 2026-08-17** par `brain-lessons-backfill-20260817-01`,
> à partir du `DESIGN.md` encore présent dans le dossier. Ce n'est pas un journal
> tenu en direct : l'ordre des tentatives et les erreurs mineures ne sont pas
> récupérables. Chaque entrée cite sa source. [claude]

## 1. Le flux RSS ne renvoie que ~15 vidéos — la source ne peut pas être la vérité

- **Risque identifié avant production** : YouTube ne publie que les ~15 dernières
  vidéos dans son flux. Une ingestion naïve qui reconstruit la liste à chaque
  passage **effacerait** tout le catalogue plus ancien.
- **Décision** : `videos.json` **committé** est la base persistante ; on ne
  supprime **jamais** une entrée absente du flux.
- **Règle** : quand une source amont est une fenêtre glissante, l'état local est
  la mémoire — et la synchronisation est un ajout, jamais un remplacement.
- **Source** : `DESIGN.md` § « Risks identified », point 1.

## 2. Un cron GitHub Actions se suspend tout seul

Documenté dans le guide client : le cron est **suspendu après ~60 j sans activité
du dépôt**. Une automatisation livrée à quelqu'un qui ne code pas doit annoncer
ses conditions d'arrêt, sinon elle meurt en silence et le site paraît figé.

## 3. Un champion non résolu est ignoré — mais loggé

Résolution d'id Data Dragon par heuristique + carte d'alias. **Échec = vidéo
ignorée** (choix client : pas de section « Autres »), **mais loggée dans la sortie
du job**. Un rejet silencieux aurait rendu le trou invisible ; le journal le rend
rattrapable.

## 4. La pane navigateur ne compositait pas — dit, puis contourné

- **Risque anticipé** dans le Brain Use Contract : « la pane navigateur peut ne
  pas compositer (pas affichée) → **le dire honnêtement si c'est le cas** ».
- **Ce qui s'est passé** : c'est arrivé. Les captures ont été prises en **Edge
  headless** (`qa/desktop-home.png`, `qa/desktop-matchup-full.png`,
  `qa/mobile-home.png`, `qa/mobile-full.png`) et relues à l'œil ; le contrôle
  DOM/JS a été fait dans la pane.
- **Limite honnête restante** : `prefers-reduced-motion` **non émulé en
  navigateur**, vérifié **sur code** — écrit comme tel.
- **Règle** : annoncer le mode de preuve dégradé au moment où il est utilisé, pas
  laisser croire à une capture live.
- **Source** : `DESIGN.md` § « QA — Résultats », lignes Captures et Reduced-motion.

## 5. La revue adversariale a trouvé 23 défauts réels sur un travail déjà « fini »

- **Chiffres** : 27 agents, **23 constats confirmés / 0 réfuté → 23 corrigés** —
  parseur ×5, front JS ×4, HTML/CSS/a11y ×10, CI + guide ×4.
- **Lecture** : un taux de réfutation de 0 sur 23 signale que le travail
  pré-revue avait un vrai déficit de couverture, pas que la revue était laxiste
  (elle a produit des corrections vérifiables, tracées dans le `git` du projet).
- **Règle** : sur un livrable public destiné à tourner sans surveillance, la
  revue adversariale n'est pas une formalité de fin — elle trouve encore une
  vingtaine de défauts après la QA maison.
- **Source** : `DESIGN.md` § « QA — Résultats », dernière ligne.

## 6. L'identité proposée a été refusée — et c'est écrit

L'identité rétro-RPG `gyyn` a été proposée puis **refusée par le client** au
profit d'un « esport clean & sobre » (DA Volume 2/5, décision assumée). Le run
voisin `gyyn-edit-01` est cité dans la généalogie **comme repoussoir explicite**.
Une direction écartée qui reste écrite évite qu'on la repropose au run suivant.

## Méthode qui a tenu

- Parseur testé sur **jeu de titres pièges** en plus du flux réel :
  `test_parse.py` **26/26** (métadonnées vérifiées, faux matchups rejetés,
  accents, séparateurs collés) ; flux réel 3/3 ; **ré-exécution idempotente**
  (« aucun changement ») — le contrôle qui prouve qu'un job horaire ne va pas
  dupliquer.
- Robustesse d'URL testée avec des entrées hostiles : hash malformé
  (`#adc/kai%s`) sans crash, hash invalide resynchronisé.
- Contrastes **recalculés** et non estimés : chips `#9db0c4` sur `#22314a` =
  **5,88:1** (AA).
- Le client n'a pas de compte GitHub → livraison du dossier prêt à pousser + guide
  pas à pas. La contrainte du destinataire fait partie du livrable.

## Un élément `hidden` s'affiche quand même si on lui donne un `display`

Le bouton « 🌐 Translate » restait visible sous forme de cadre vide en français :
il portait `hidden` mais aussi `display: inline-flex` en CSS, qui écrase le
`display: none` du navigateur pour `[hidden]`. Dès qu'on donne un `display` à un
élément qu'on masque par l'attribut `hidden`, il faut ajouter la règle
`.classe[hidden] { display: none; }`. Vu le 25/08/2026. [claude]

## Non reconstituable

Le détail des 23 constats de la revue adversariale n'est pas dans ce dossier (il
est dans le rapport de run et l'historique `git` du projet) ; l'ordre des
corrections n'est pas récupérable ici.

## Deuxième occurrence : `hidden` + `display` (2026-08-27)

En cachant les sections matchups pour la vue « Runes & build », `#matchup-links`
est resté visible : il porte `hidden` mais aussi `display: flex`. C'est
exactement la leçon déjà écrite pour le bouton Translate — **une leçon écrite
n'empêche pas la récidive tant qu'elle n'est pas une règle mécanique**. Règle
maison à appliquer d'office : tout sélecteur qui fixe un `display` reçoit sa
ligne `[hidden] { display: none; }` dans la foulée. [claude]

## Le navigateur headless de ce PC ment sur la largeur mobile (2026-08-27)

`msedge --headless --window-size=390,…` met la page en page à ≈ 430 px CSS et
capture 390 px : **toute capture mobile est rognée à droite**, ce qui ressemble
exactement à un débordement horizontal. Vérifié en capturant la page d'accueil
non modifiée : elle est rognée pareil. `--headless=old`,
`--force-device-scale-factor` et une fenêtre plus étroite ne changent rien.
Règle : sur ce PC, le verdict mobile vient de la **mesure DOM**
(`scrollWidth == clientWidth` + liste des éléments dépassant le viewport) dans
la pane, la capture ne sert que d'illustration — et on le dit quand on la
montre. [claude]

## 7. Une grille CSS doit placer explicitement les enfants après son pseudo-élément (2026-09-02)

Le bloc « Conseils généraux pour le pick » utilisait une numérotation avec
`::before` dans une grille à deux colonnes. Sans `grid-column` explicite sur le
titre et le paragraphe, le paragraphe passait à la ligne suivante dans la
colonne des numéros et se réduisait à 30 px sur mobile. La règle réutilisable
est de placer le pseudo-élément sur la première colonne et de donner aux deux
enfants éditoriaux la deuxième colonne. Vérifié à 375 et 320 px. [codex]

## 8. Les images très basses ne doivent pas être lazy-loadées quand elles sont le contenu (2026-09-02)

Les icônes d'objets se trouvaient plusieurs milliers de pixels sous la liste
de pick. Avec `loading="lazy"`, une capture de page complète et l'arrivée
visuelle sur la section montraient des carrés vides, alors que les URLs étaient
valides. Pour une petite liste d'objets indispensable à la lecture, le
chargement immédiat est plus fiable ; les vignettes vidéo nombreuses restent
lazy. Vérifié : 27/27 icônes d'objets chargées dans le navigateur. [codex]

## 9. Data Dragon peut résoudre un objet SR vers son homonyme de mode spécial (2026-09-03)

- **Symptôme** : les noms de build étaient valides, mais le générateur choisissait
  des ids 22xxxx ou 32xxxx ; l'icône et le prix ne correspondaient plus aux
  captures de la Faille.
- **Cause** : `item.json` contient plusieurs objets homonymes et l'ordre du JSON
  ne garantit pas que l'entrée SR soit la première.
- **Règle** : filtrer les entrées sur `maps["11"]`, puis préférer l'id court
  quand plusieurs variantes restent homonymes. Ne pas résoudre un build par
  simple `setdefault` sur le nom.
- **Contrôle** : `gen_setup.py` produit les 3 builds avec **0 nom non résolu**,
  **82/82 icônes vérifiées**, et les ids finaux sont les ids SR courts attendus.
  [codex]

## 10. Un quatrième contrôle de barre peut créer un overflow seulement dans une langue (2026-09-03)

- **Symptôme** : à 390 px, la version anglaise débordait de 5 px quand le lien
  Translate apparaissait ; la version française ne révélait pas le problème.
- **Cause** : le libellé de traduction s'ajoutait aux boutons de la barre alors
  que le texte YouTube était déjà réduit en icône.
- **Règle** : sur mobile, conserver la fonction mais réduire le lien de
  traduction à une cible icône de 44 px, puis mesurer chaque langue avec
  `scrollWidth == clientWidth`.
- **Contrôle** : après correction, le navigateur mesure zéro débordement à
  390 px et 320 px, en FR comme en EN ; les cibles visibles restent à 44 px ou
  plus. [codex]

## 11. Un libellé d'onglet court peut perdre sa largeur tactile (2026-09-03)

- **Symptôme** : l'onglet anglais `Tips` mesurait 37 px de large à 390 px,
  alors que sa hauteur atteignait déjà 44 px ; le français ne révélait pas le
  problème avec `Conseils`.
- **Cause** : le contrôle ne définissait qu'une hauteur minimale et sa largeur
  dépendait entièrement de la longueur du libellé.
- **Règle** : réserver une largeur minimale de 44 px aux onglets, puis mesurer
  chaque langue et chaque breakpoint avec les cibles réellement visibles.
- **Contrôle** : après correction, FR et EN mesurent zéro overflow à 390 px et
  320 px, et les onglets visibles font au moins 44 × 44 px. [codex]

## 12. Un conseil peut devoir devenir une sous-liste, pas un item frère (2026-09-03)

- **Symptôme** : la troisième consigne de niveau 1 apparaissait comme un conseil
  principal séparé alors qu'elle faisait partie des trois choix du conseil Top.
- **Règle** : quand le contenu exprime une hiérarchie explicite, la source doit
  porter un champ `points` et le rendu doit produire une sous-liste de tirets ;
  le nombre d'items principaux ne doit pas être déduit du nombre de phrases.
- **Contrôle** : la source contient 2 conseils principaux et 3 sous-points dans
  le second ; la page Runes reste dépourvue de conseils généraux. [codex]

## 13. Une grille à trois conseils doit expliciter la hauteur du bloc central (2026-09-03)

- **Symptôme** : avec trois conseils, le rendu devait placer le deuxième à
  droite sur deux rangées, et empiler les premier et troisième à gauche ; un
  placement automatique ne garantit pas cette composition.
- **Règle** : déclarer les lignes et colonnes de l'item qui s'étend sur deux
  rangées, équilibrer les deux rangées de la colonne opposée, puis réinitialiser
  ces positions au breakpoint mobile pour retrouver une lecture linéaire.
- **Contrôle** : à 1294 px, les blocs 1 et 3 font chacun 200 px et le bloc 2
  fait 400 px ; à 390 px, les trois conseils s'empilent sans overflow. [codex]

## 14. Un nouvel item doit avoir une place explicite dans une grille déjà composée (2026-09-03)

- **Symptôme** : après avoir réservé deux rangées au conseil 2, l'ajout d'un
  quatrième conseil pouvait laisser l'auto-placement CSS dans une colonne
  inattendue et déséquilibrer la section.
- **Règle** : donner au nouvel item une ligne dédiée et réinitialiser cette
  position au mobile ; la composition des trois premiers conseils reste stable
  et le nouveau contenu ne se retrouve pas dans une case vide par accident.
- **Contrôle** : le conseil 4 occupe la troisième ligne desktop sur toute la
  largeur ; à 390 px et 320 px, les quatre conseils repassent en colonne sans
  débordement. [codex]

## 15. Un conseil dicté n'est pas automatiquement un titre et un corps (2026-09-03)

- **Symptôme** : les textes fournis pour Fiora, Mordekaiser et Nasus étaient
  séparés en intitulés gras et en phrases secondaires, alors que chaque bloc
  devait être un simple conseil précédé d'un tiret.
- **Règle** : stocker le texte complet dans `d` et rendre uniquement un paragraphe
  de même police ; ne créer une hiérarchie titre/corps que si elle est demandée.
- **Contrôle** : les trois fiches affichent respectivement 1, 2 et 1 paragraphes
  sans `h4`, avec la même famille de police. [codex]

## 16. Le tiret doit être séparé du texte par un retrait mesurable (2026-09-03)

- **Symptôme** : le tiret des conseils matchup était visuellement trop proche du
  paragraphe après la suppression des titres.
- **Règle** : conserver le tiret en position fixe et réserver 28 px de retrait
  horizontal au texte, dans la version interactive comme dans les pages SEO.
- **Contrôle** : la fiche Fiora expose `padding-left: 28px`, garde la police
  `Inter` et reste sans overflow. [codex]

## 17. Un conseil peut porter une action interne sans devenir un texte opaque (2026-09-03)

- **Symptôme** : le conseil Teemo sur Hexflash devait renvoyer vers l'onglet
  Runes, alors que les conseils matchup étaient rendus en texte seul.
- **Règle** : garder le conseil dans un paragraphe puis ajouter un lien court et
  accessible avec un `href` interne ; le générateur SEO doit produire le même
  accès vers la page Runes.
- **Contrôle** : le bouton `Voir les runes` ouvre `#setup/runes`, reste compact
  visuellement avec une zone de clic étendue, et la page Builds conserve sa
  consigne au-dessus des cartes. [codex]

## 18. Une publication vidéo ne doit pas être bloquée par une génération secondaire (2026-09-03)

- **Symptôme** : un replay fraîchement publié peut rester absent du dépôt si une
  étape SEO ou Data Dragon échoue après la lecture du flux RSS.
- **Cause observée** : le replay Mordekaiser était bien dans le flux et le
  parseur le reconnaissait ; le déclenchement planifié avait simplement été
  décalé jusqu'au passage suivant.
- **Règle** : rendre les générations secondaires tolérantes, committer les
  données vidéo quoi qu'il arrive, puis faire échouer explicitement le job pour
  que l'incident reste visible et soit retenté.
- **Contrôle** : le titre exact Mordekaiser est désormais un cas de test ; le
  site déployé contient l'id `izA4SMQ_8G4`. [codex]

## 19. Un lien d'action peut être compact sans perdre sa zone de clic (2026-09-03)

- **Symptôme** : le lien `Voir les runes` faisait visuellement gonfler le
  conseil Hexflash comme un paragraphe supplémentaire.
- **Règle** : réduire le contour visible à une hauteur de ligne et étendre la
  zone interactive par pseudo-élément, sans fond ni bloc décoratif lourd.
- **Contrôle** : le lien Teemo est compact, reste accessible au clavier, ouvre
  `#setup/runes` et la fiche reste sans débordement horizontal. [codex]

## 20. Une explication de build doit s'arrêter à la formulation dictée (2026-09-03)

- **Symptôme** : la phrase Rod of Ages avait reçu une justification
  supplémentaire sur les PV, non demandée dans la formulation finale.
- **Règle** : conserver exactement `Si tu ressens trop le manque de mana,
  commence par Rod of Ages.` ; l'objet reste une explication, pas un départ
  affiché.
- **Contrôle** : source et fichier résolu sont alignés ; le build PV / mana
  affiche Proto-Belt puis Liandry dans le cœur, sans section Départ. [codex]

## 21. Le conseil 0-1 appartient à l'onglet général, pas à Teemo (2026-09-03)

- **Symptôme** : la phrase `Si tu es en 0-1, ta lane est perdue. Il y a
  quasiment aucun angle de comeback, donc achète des bottes et roam.` était
  affichée dans la fiche Teemo alors qu'elle décrit une règle générale de lane.
- **Règle** : déplacer la phrase dans la cinquième entrée de `Conseils
  généraux`, sans lui inventer un titre, et régénérer à la fois la vue
  interactive et les pages SEO pour éviter une copie résiduelle.
- **Contrôle** : Teemo expose quatre conseils matchup ; l'onglet général en
  expose cinq et contient la phrase une seule fois. [codex]

## 22. Un titre de conseil doit reprendre la formulation dictée (2026-09-03)

- **Symptôme** : le conseil 0-1 avait été déplacé dans l'onglet général sans
  titre, alors que Nathan souhaitait l'identifier visuellement.
- **Règle** : ajouter le titre exact `Lane perdu` dans la source française et
  régénérer la vue résolue ; traduire seulement la version anglaise en `Lost
  lane`.
- **Contrôle** : le cinquième bloc affiche `LANE PERDU`, conserve le texte 0-1
  et reste sans débordement. [codex]
