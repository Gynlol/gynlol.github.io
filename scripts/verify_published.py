# -*- coding: utf-8 -*-
"""Vérifie que GitHub Pages sert exactement le catalogue local.

Le dépôt et le site publié sont deux étapes différentes. Cette porte ne prend
pas un push réussi pour une preuve : elle compare la méta de synchronisation,
le nombre de vidéos et les ids de la fenêtre RSS réellement servie.
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_PATH = os.path.join(ROOT, "data", "videos.json")
PUBLIC_URL = "https://gynlol.github.io/data/videos.json"


def load(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def fetch_public(attempt):
    query = urllib.parse.urlencode({"verify": f"{int(time.time())}-{attempt}"})
    req = urllib.request.Request(
        f"{PUBLIC_URL}?{query}",
        headers={
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "User-Agent": "gynlol-matchup-publish-check/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.load(response)


def main():
    local = load(LOCAL_PATH)
    local_videos = local.get("videos") or []
    local_meta = local.get("meta") or {}
    expected_updated = local_meta.get("updated")
    expected_ids = [item.get("id") for item in local_videos[:15]]
    last = None

    for attempt in range(1, 7):
        try:
            public = fetch_public(attempt)
            public_videos = public.get("videos") or []
            public_meta = public.get("meta") or {}
            public_ids = [item.get("id") for item in public_videos[:15]]
            ok = (
                public_meta.get("updated") == expected_updated
                and len(public_videos) == len(local_videos)
                and public_ids == expected_ids
            )
            if ok:
                print(
                    "Pages conforme — %d vidéo(s), méta %s, dernier id %s"
                    % (len(public_videos), expected_updated, expected_ids[0] if expected_ids else "(vide)")
                )
                return 0
            last = (
                "attendu %s/%d/%s, reçu %s/%d/%s"
                % (
                    expected_updated,
                    len(local_videos),
                    expected_ids[0] if expected_ids else "(vide)",
                    public_meta.get("updated"),
                    len(public_videos),
                    public_ids[0] if public_ids else "(vide)",
                )
            )
        except Exception as exc:  # réseau ou propagation Pages
            last = str(exc)
        if attempt < 6:
            time.sleep(20)

    print(f"Pages non conforme après 6 essais — {last}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
