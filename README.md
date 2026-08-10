# Gyn Replays — Matchups Nunu

Site statique qui répertorie tous les matchups Nunu de la chaîne
[@GynReplays](https://www.youtube.com/@GynReplays), classés par rôle
(Top / Jungle / Mid / ADC / Support) puis par champion ennemi.

## Comment ça marche

- `data/videos.json` — la base : une entrée par vidéo, avec rôle, ennemi,
  patch, rang, date. Regénéré par le robot : toute retouche d'une vidéo
  encore présente dans le flux RSS sera écrasée (le titre YouTube fait
  foi). Exception : retirer l'entrée d'une vidéo **supprimée de la
  chaîne** est définitif, elle ne sera pas ré-ajoutée.
- `scripts/update_videos.py` — lit le flux RSS public de la chaîne, parse les
  titres `Nunu <rôle> vs <champion> …` et met à jour `videos.json`.
  Les titres hors gabarit sont ignorés (visibles dans le log du job).
- `.github/workflows/update-videos.yml` — lance ce script **toutes les
  heures** sur GitHub Actions et committe si quelque chose a changé.
  Le commit redéploie automatiquement GitHub Pages.
- `data/champions.json` — la liste des champions par rôle (grilles) ;
  regénérable via `scripts/gen_champions.py`.
- `index.html` + `assets/` — le site (vanilla HTML/CSS/JS, bilingue FR/EN).

## Commandes utiles

```bash
python scripts/update_videos.py   # mise à jour manuelle des vidéos
python scripts/test_parse.py      # jeu de tests du parseur de titres
python -m http.server 8123        # servir le site en local
```

## Déploiement

Voir [GUIDE-DEPLOIEMENT.md](GUIDE-DEPLOIEMENT.md).
