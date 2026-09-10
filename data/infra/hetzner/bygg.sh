#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# AK1A Hetzner-byggmiljö — BYGGSKRIPT (fas H1)
# Körs PÅ SERVERN som ak1a:  ~/bygg.sh [ren]
# Första körningen klonar via deploy-nyckel (se STYRELSE-HETZNER-ARKITEKTUR.md
# kundsteg 2); därefter pull → npm ci → next build. ALDRIG deploy till prod —
# prod = Vercel (main-push); detta är BYGGBOXEN som avlastar arbetsstationen.
# .env kopieras separat (chmod 600) av AI:n — ALDRIG via repot.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_URL="git@github.com:NewUserAK/AK1.git"
KATALOG="$HOME/AK1"
cd "$HOME"

if [ ! -d "$KATALOG/.git" ]; then
  echo "── Klonar repot (deploy-nyckel krävs) ──"
  git clone "$REPO_URL" "$KATALOG"
fi

cd "$KATALOG"
echo "── git pull (main) ──"
git fetch origin
git checkout -q main
git reset -q --hard origin/main

if [ "${1:-}" = "ren" ]; then
  echo "── ren bygg (node_modules + .next bort) ──"
  rm -rf node_modules .next
fi

echo "── npm ci ──"
npm ci

echo "── next build ──"
npm run build

echo ""
echo "── BYGG KLAR: $KATALOG/.next ──"
node -e "const{readdirSync,statSync}=require('fs');let n=0;const p='.next/server/app';const g=d=>{for(const f of readdirSync(d)){const s=d+'/'+f;try{if(statSync(s).isDirectory())g(s);else if(f.endsWith('.html'))n++}catch{}}};try{g(p)}catch{};console.log('Förhandsrenderade HTML-sidor:',n)"
