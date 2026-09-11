---
name: leverera-kod
description: AK1A:s kodleveransprotokoll (src/** och konfiguration) — typkontroll, commit, push prod, bygge på servern, pm2-omstart, HTTPS-verifiering och revert-stoppregeln. Använd vid varje ändring i src/, next.config.ts, package.json. Nyckelord: deploy, leverera, bygga, publicera, kodändring.
---

# Leverera kod — src/** och konfig

Kodändringar kräver FULL kedja. Prod lämnas ALDRIG trasig.

## Protokoll (steg för steg)

```bash
# 1. Typkontroll — 36 befintliga fel är baslinjen, 0 NYA tillåts
npx tsc --noEmit

# 2. Commit (svenska, "studio:"-prefix, små steg)
git add <filer> && git commit -m "studio: <vad + varför>"

# 3. Push till prod (remote prod = /home/ak1a/AK1 på servern)
git push prod develop

# 4. Bygg PÅ SERVERN + omstart
cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a

# 5. Verifiera
curl -s -o /dev/null -w "%{http_code}" https://lab.ak1nvestor.com/   # → 200
```

## Stoppregeln (HÅRD)

Misslyckas steget 4 (bygget):
`git revert HEAD` → `git push prod develop` → bygg om → verifiera.
ALDRIG lämna prod trasig. ALDRIG "fixar det sen".

## Aldrig-rör-listan

- `.env*`, nycklar, hemligheter, betalningsfiler — ALDRIG.
- Priser, domän, juridik, extern publicering = R2 → styrelsen kan besluta
  men VÄNTAR KUND. Prissteg-sidor hålls bakom flagga tills kunden valt.

## Att tänka på

- Kör `leveranskontroll`-färdigheten (KVD) före push om ändringen rör
  motorer, schema, SEO eller kurser.
- Push till `prod` kräver rent träd i /home/ak1a/AK1 — skriptet
  `verktyg/deploya-contabo.sh` städar (checkout + clean data/cache) om
  push avvisas; från arbetsytan räcker oftast `git push prod develop`.
- GitHub-spegling (`origin`) sköts av kundens arbetsstation — jag pushar
  endast till `prod`.
- Byggtid är kundens "INGET förbygge"-direktiv: bygg EN gång per leverans,
  bunta inte ihop flera orelaterade vågor i ett bygge.
