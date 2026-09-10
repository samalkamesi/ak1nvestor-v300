#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# AK1A DEPLOY TILL CONTABO — ett kommando: push → build → restart → verifiera.
# Körs från repo-roten på arbetsstationen:  bash verktyg/deploya-contabo.sh
# Förutsättning: develop är commitad (skriptet pushar GitHub + Contabo).
# Arkitektur (kunddirektiv 2026-09-08): Contabo = HELA driften; GitHub =
# kodbasen + Vercel-backup; datorn = spegel/backup — INGET kräver att
# datorn är på (servern är självförsörjande mellan sessioner).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
NYCKEL=~/.ssh/contabo_key
SERVER=ak1a@5.189.162.162
cd "$(dirname "$0")/.."

echo "── 1/4 push: GitHub + Contabo ──"
git push origin develop
# Städa serverns arbetsträd först (appens runtime-cache gör det smutsigt → push avvisas)
ssh -i "$NYCKEL" -o BatchMode=yes "$SERVER" "cd /home/ak1a/AK1 && git checkout -- . 2>/dev/null; git clean -fd data/cache 2>/dev/null; true"
git -c core.sshCommand="ssh -i \"$NYCKEL\" -o BatchMode=yes" push contabo develop

echo "── 2/4 server: npm ci + build ──"
ssh -i "$NYCKEL" -o BatchMode=yes "$SERVER" "cd /home/ak1a/AK1 && git log --oneline -1 && npm ci --no-audit --no-fund >/dev/null 2>&1 && npm run build 2>&1 | tail -2"

echo "── 3/4 server: pm2 restart ──"
ssh -i "$NYCKEL" -o BatchMode=yes "$SERVER" "cd /home/ak1a/AK1 && pm2 restart ak1a --update-env && sleep 6 && pm2 ls | grep -o 'ak1a.*online' | head -1"

echo "── 4/4 verifiering ──"
sleep 4
node -e "
(async () => {
  const r = await fetch('https://lab.ak1nvestor.com/', { headers: { 'User-Agent': 'ak1a-deploy-check' }, signal: AbortSignal.timeout(20000) });
  const t = await r.text();
  console.log('HTTPS', r.status, '· AK1A-innehåll:', t.includes('AK1A') ? 'JA' : 'NEJ');
  process.exit(r.status === 200 && t.includes('AK1A') ? 0 : 1);
})();
"
echo "── DEPLOY KLAR: lab.ak1nvestor.com ──"
