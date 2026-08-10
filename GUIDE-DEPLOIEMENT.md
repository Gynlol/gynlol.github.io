# Guide de mise en ligne (pas à pas, ~20 min)

Tout est déjà prêt dans ce dossier. Il reste : installer Git (si besoin),
créer un compte GitHub, y envoyer le dossier, et activer 2 réglages.
Aucun code à écrire.

## Étape 0 — Vérifier / installer Git (5 min, une seule fois)

Ouvre un terminal (menu Démarrer → tape « PowerShell ») et lance :

```bash
git --version
```

- Si une version s'affiche (ex. `git version 2.55…`) : Git est déjà là,
  passe à l'Étape 1.
- Sinon, installe-le avec :

```bash
winget install --id Git.Git -e --source winget
```

(ou télécharge-le sur <https://git-scm.com/download/win>, installation par
défaut en cliquant Suivant). **Ferme puis rouvre le terminal** après
l'installation pour que la commande `git` soit reconnue.

## Étape 1 — Créer le compte GitHub (5 min)

1. Va sur <https://github.com/signup>.
2. Renseigne ton e-mail, un mot de passe, et un nom d'utilisateur.
   **Le nom d'utilisateur apparaîtra dans l'adresse du site** :
   avec le pseudo `gynreplays`, le site sera `https://gynreplays.github.io`.
3. Valide le code reçu par e-mail. Le compte gratuit suffit, ne prends
   aucune option payante.

## Étape 2 — Créer le dépôt (2 min)

1. Une fois connecté, va sur <https://github.com/new>.
2. **Repository name** : tape exactement `TONPSEUDO.github.io`
   (remplace `TONPSEUDO` par ton nom d'utilisateur, en minuscules).
   C'est ce nom qui donne l'adresse courte du site.
3. Laisse **Public** coché. Ne coche rien d'autre (pas de README).
4. Clique **Create repository**.

## Étape 3 — Envoyer le dossier (5 min)

Ouvre un terminal dans le dossier du projet. Si c'est ton tout premier
commit sur ce PC, présente-toi d'abord à Git (remplace par ton pseudo et
l'e-mail de ton compte GitHub — obligatoire, sinon `git commit` refuse) :

```bash
git config --global user.name "TONPSEUDO"
```

```bash
git config --global user.email "ton-email@exemple.com"
```

Puis lance ces commandes une par une (remplace `TONPSEUDO` dans la
commande du `remote`) :

```bash
git init -b main
```

```bash
git add -A
```

```bash
git commit -m "Site matchups Nunu"
```

```bash
git remote add origin https://github.com/TONPSEUDO/TONPSEUDO.github.io.git
```

```bash
git push -u origin main
```

Au moment du `git push`, une fenêtre de connexion GitHub s'ouvre dans le
navigateur : connecte-toi et autorise. (C'est le gestionnaire
d'identifiants de Windows, tu ne le referas plus.)

## Étape 4 — Activer les 2 réglages (3 min)

Sur la page de ton dépôt (github.com/TONPSEUDO/TONPSEUDO.github.io) :

1. **Actions autorisées à écrire** — onglet **Settings** → menu de gauche
   **Actions** → **General** → section « Workflow permissions » (tout en
   bas) → coche **Read and write permissions** → **Save**.
   C'est ce qui permet au robot horaire d'enregistrer les nouvelles vidéos.
2. **GitHub Pages** — **Settings** → menu de gauche **Pages** →
   « Build and deployment » → Source : **Deploy from a branch** →
   Branch : **main**, dossier **/ (root)** → **Save**.

Après 1-2 minutes, le site est en ligne sur `https://TONPSEUDO.github.io`.

## Étape 5 — Premier lancement du robot (1 min)

Onglet **Actions** du dépôt → si GitHub demande d'activer les workflows,
clique **I understand… enable them** → clique le workflow
**« Mise à jour des vidéos »** → bouton **Run workflow** → **Run workflow**.

C'est ce même robot qui tournera ensuite **tout seul toutes les heures** :
tu postes une vidéo sur YouTube, elle apparaît sur le site dans l'heure,
dans le bon rôle et le bon matchup. Rien d'autre à faire.

## À savoir

- **Le titre fait tout.** Le robot lit « Nunu `<rôle>` vs `<champion>` » au
  début du titre. Rôles compris : Top, Jungle (ou Jgl), Mid, ADC (ou Bot),
  Support (ou Supp). Un titre qui ne suit pas ce gabarit est ignoré
  (choix validé) — le log du job liste les titres ignorés.
- **Titre corrigé = site corrigé.** Si tu corriges un titre sur YouTube
  dans les jours qui suivent la publication, le site se met à jour au
  passage suivant du robot.
- **Vidéo supprimée de la chaîne.** Le robot n'efface jamais tout seul :
  si tu supprimes une vidéo de YouTube, retire sa ligne dans
  `data/videos.json` (une vidéo sortie du flux n'est jamais ré-ajoutée).
  Dis-le-moi et je le fais avec toi.
- **Sommeil des robots.** GitHub coupe le robot horaire si le dépôt n'a eu
  aucune activité pendant ~60 jours. Si tu arrêtes de poster longtemps
  puis reprends : GitHub t'envoie un e-mail avant de couper, et un clic
  sur **Re-enable** dans l'onglet Actions le relance.
- **Domaine perso** (optionnel, plus tard) : un domaine acheté (ex.
  `nunumatchups.gg`) peut se brancher dans Settings → Pages → Custom
  domain.
