#!/usr/bin/env bash

# Veille persistante du flux YouTube.
#
# GitHub peut retarder ou supprimer un événement schedule. Une exécution garde
# donc un runner actif pendant une fenêtre bornée, publie chaque changement,
# vérifie la copie réellement servie par Pages, puis le workflow se réarme par
# workflow_dispatch. Le seed cron ne sert qu'à récupérer une chaîne interrompue.

set -u -o pipefail

WATCH_MINUTES="${WATCH_MINUTES:-330}"
POLL_SECONDS="${POLL_SECONDS:-300}"
SETUP_EVERY="${SETUP_EVERY:-12}"

if ! [[ "$WATCH_MINUTES" =~ ^[0-9]+$ && "$POLL_SECONDS" =~ ^[0-9]+$ && "$SETUP_EVERY" =~ ^[1-9][0-9]*$ ]]; then
  echo "Paramètres de surveillance invalides." >&2
  exit 2
fi

push_pending() {
  local ahead attempt
  ahead="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
  if [[ "$ahead" == "0" ]]; then
    return 0
  fi

  for attempt in 1 2 3; do
    if git push origin HEAD:main; then
      echo "push réussi ($ahead commit en attente, tentative $attempt)."
      return 0
    fi
    echo "push refusé, resynchronisation ($attempt/3)." >&2
    if ! git pull --rebase origin main; then
      git rebase --abort 2>/dev/null || true
      return 1
    fi
    ahead="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
    if [[ "$ahead" == "0" ]]; then
      return 0
    fi
  done
  return 1
}

commit_and_push() {
  git add data/videos.json data/setup-built.json matchups sitemap.xml
  if git diff --cached --quiet; then
    echo "aucun artefact à publier."
    return 0
  fi

  git config user.name "github-actions[bot]"
  git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  git commit -m "MAJ automatique des vidéos"
  push_pending
}

deadline=$(( $(date +%s) + WATCH_MINUTES * 60 ))
iteration=0
source_failures=0
generator_failures=0
verification_failures=0

while (( $(date +%s) < deadline )); do
  iteration=$((iteration + 1))
  echo "--- veille $iteration — $(date -u +%Y-%m-%dT%H:%M:%SZ) ---"

  # Une publication humaine peut arriver pendant la fenêtre. On la reprend
  # avant de relire le flux, puis on tente aussi les commits restés en attente.
  if ! git pull --rebase origin main; then
    echo "resynchronisation git impossible ; nouvelle tentative à la prochaine passe." >&2
    git rebase --abort 2>/dev/null || true
  fi
  if ! push_pending; then
    echo "un commit local reste non publié ; il sera retenté." >&2
  fi

  if ! python scripts/update_videos.py; then
    source_failures=$((source_failures + 1))
    echo "lecture RSS échouée ; le catalogue précédent est conservé." >&2
  else
    # SEO doit être rejoué à chaque passe : notes.json est une source manuelle
    # et peut avoir changé sans nouvelle vidéo.
    if ! python scripts/gen_seo.py; then
      generator_failures=$((generator_failures + 1))
      echo "génération SEO échouée ; les données vidéo restent publiables." >&2
    fi

    # Data Dragon est externe et plus coûteux : une fois au démarrage puis au
    # plus une fois par heure, comme le contrat historique du site.
    if (( iteration == 1 || iteration % SETUP_EVERY == 0 )); then
      if ! python scripts/gen_setup.py; then
        generator_failures=$((generator_failures + 1))
        echo "résolution du setup échouée ; les données vidéo restent publiables." >&2
      fi
    fi

    if ! commit_and_push; then
      echo "publication git échouée ; le commit sera retenté." >&2
    fi
  fi

  # Cette vérification est indépendante du dépôt : elle lit le fichier réellement
  # servi par GitHub Pages et attrape aussi un retard de propagation après le push.
  if ! python scripts/verify_published.py; then
    verification_failures=$((verification_failures + 1))
    echo "Pages ne sert pas encore la même donnée ; nouvelle vérification prévue." >&2
  fi

  remaining=$(( deadline - $(date +%s) ))
  if (( remaining <= 0 )); then
    break
  fi
  sleep_for=$POLL_SECONDS
  if (( sleep_for > remaining )); then
    sleep_for=$remaining
  fi
  sleep "$sleep_for"
done

cat <<SUMMARY >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
### Veille vidéo

- Fenêtre : ${WATCH_MINUTES} minutes
- Passes RSS : ${iteration}
- Échecs RSS : ${source_failures}
- Échecs de génération : ${generator_failures}
- Vérifications Pages en échec : ${verification_failures}
SUMMARY

echo "veille terminée — $iteration passe(s), $source_failures échec(s) RSS, $verification_failures vérification(s) Pages en échec."
