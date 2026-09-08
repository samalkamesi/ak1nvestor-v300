# V86 — B2B-AKTIVERING: env-sättning + verifierad checklista (2026-09-07)

Agent V86-B2BREADY. Grinden (våg 77, STYRELSE-B2B-VARIABLER.md B1) är AV i
prod — denna handling gör aktiveringen till EN env-ändring + omstart + test.
Enhetstest: `node verktyg/testa-b2b-grind.mjs` (33 kontroller, 0 FAIL).
Prod-lägesmätning 2026-09-07: se §5.

## 1. INVENTARIE — varje B2B-yta, grind AV vs PÅ

Grindkälla: `src/lib/b2b-status.ts` → `b2bAktiv()` = `NEXT_PUBLIC_B2B_AKTIV === "1"`.

| Yta | AV (idag i prod) | PÅ |
|---|---|---|
| /pro (landning+cockpit, force-static) | Neutral "Under uppbyggnad"-vy (layoutens early-return), noindex | Hero + 3 kort + CsvImport + Morgonronden + pris-trappa |
| /pro/priser (ISR 300 s) | Under uppbyggnad-vy | Tre nivåer ur variabellagret (499/1 499/4 999 exkl. moms) + onboarding 9 900 |
| /pro/analys (force-static) | Under uppbyggnad-vy | Screening av 100 bolag + namngivna vyer + CSV-export/import |
| /pro/klienter (force-static) | Under uppbyggnad-vy | Demoklientens klientvy (icke-person, korstabellens topp-6) |
| /pro/rapporter (force-static) | Under uppbyggnad-vy | Rapportverkstan: 3 mal-låsta mallar, white-label, print |
| /pro/admin (klientsida) | Under uppbyggnad-vy (dock noindex) | Login (ADMIN_PASSWORD, samma som publik admin) → ProAdminPanel |
| Toppväxeln (alla publika sidor) | ENDAST "Privatperson"-segmentet | "Privatperson | Företag" — Företag → /pro |
| Sidfot + ⌘K-palett + chat-menyn | "AK1A PRO"-punkten borta (meny-register b2b-filter + sokindex + chat-widget) | Tillbaka (footer+sok-ytorna; aldrig menypaneler) |
| robots.txt | Allow-listan saknar /pro/ | `Allow: /pro/` (alltid `Disallow: /pro/admin`) |
| /api/pro/analys, /api/pro/admin, /api/pro/dpa-mall | INTE grindade (analys=publik motor, admin=lösenordsskyddad, dpa-mall=publikt dokument) | Oförändrade |

Priserna interpolerar ur `data/portfolj-system/priser.json` (b2b-sektionen) via
`src/lib/variabler.ts` — /pro och /pro/priser läser samma källa (B2-svepet).

## 2. AKTIVERINGSSTEG — exakt (Contabo, hela driften)

OBS: `NEXT_PUBLIC_*` inlines i klientbunten vid BUILD — `pm2 restart` RÄCKER
INTE; rebuild krävs. Server: Contabo, `/home/ak1a/AK1`, pm2-process `ak1a`.

```bash
ssh -i <nyckel> ak1a@<server>
cd /home/ak1a/AK1
# 1. Lägg till flaggan (sista raden i .env):
echo 'NEXT_PUBLIC_B2B_AKTIV=1' >> .env
# 2. Rebuild (inline:ar flaggan i klientbunten + robots/sitemap/metadata):
npm run build
# 3. Omstart med färsk env:
pm2 restart ak1a --update-env
pm2 ls | grep ak1a   # → online
```

Vad som händer (allt styrt av b2bAktiv, noll kodändring): /pro → cockpit-skalet
(marin vägg, ProNav, Boka demo-CTA), toppväxeln får Företag-segmentet, footer +
⌘K + chat-menyn får "AK1A PRO", robots.txt lägger `Allow: /pro/`, /pro:s
metadata växlar noindex → index. Under-sidornas egna `index,follow`-metadata
(blir korrekt först vid PÅ) samt sitemap-posterna blir då SANNINGS ENLIGA.

## 3. KONTROLLISTA FÖRE AKTIVERING (kundägaren + juristen)

- [ ] **K-B2B:1 juristgranskning GODKÄND** av B2B-villkoren (PRO-sektionen på
      /villkor), DPA-mallen (data/forskning/B2B/DPA-MALL.md, servas via
      /api/pro/dpa-mall) och de tre disclaimer-lagren (tenant.ts MAL_LAST_RADER).
- [ ] **Villkoren live**: /villkor PRO-sektionens statusrad säger fortfarande
      "UTKAST tills kundens juristgranskning" — uppdatera den texten samtidigt
      som aktiveringen (ENDA src-ändringen som kan behövas; ~1 rad).
- [ ] **DPA-länk nåbar**: /pro/priser länkar DPA-dokumentet (G2-kravet).
- [ ] **Priser rätt** i data/portfolj-system/priser.json (499/1 499/4 999 +
      onboarding 9 900, exkl. moms) — /pro och /pro/priser visar samma tal.
- [ ] **Demoklienten sanerad**: /pro/klienter visar demoklienten = korstabellens
      topp-6, metodologiskt vald icke-person (demoklient-data.ts) — konstaterad
      ren; inga riktiga klientuppgifter finns i MVP-lagret (G3 gäller kvar).
- [ ] **Kända residualer §4** genomgångna: fixa i förväg ELLER acceptera.

## 4. KÄNDA RESIDUALER I AV-LÄGET (mätta i prod 2026-09-07)

Grindens synliga kontrakt HÅLLER (se §5), men fyra residualer — alla självlöser
eller blir korrekta vid PÅ, men de exponerar gateda URL:er under väntetiden:

1. **sitemap.xml listar alla 5 /pro-URL:er** — src/app/sitemap.ts (r. 59–65) är
   inte b2bAktiv-gated. Crawlers bjuds in till gateda URL:er.
2. **Under-sidor säger `index,follow`** — /pro/priser, /pro/analys, /pro/klienter,
   /pro/rapporter hardcodar egen robots-metadata som ÖVERRIDER layoutens grindade
   noindex (endast /pro och /pro/admin får noindex i AV-läge).
3. **Page-titlar läcker cockpit-copy i `<head>`** — "Priser — AK1A PRO" m.m.
   (page-metadata slår layoutens; syns i sökresultat-snuttar om sidan indexeras).
4. **RSC flight-payload innehåller hela cockpit-markupen** (t.o.m. priserna) i
   inline-script på de gateda sidorna — osynligt för besökare, men i källkoden.

Rekommendation: residual 1+2 är värda en 10-minuters-src-våga (V86a: gatea
sitemap-posterna + låta under-sidorna ärva layoutens robots) OM AV-perioden
blir lång; annars dokumenterat accepterat tills aktiveringen.

## 5. TESTPLAN — URL:er + förväntat utfall

**AV-läge (idag, verifierat 2026-09-07 — 20/20 PASS + 1 GAP-konstaterande):**
- `GET /pro`, `/pro/priser`, `/pro/analys`, `/pro/klienter`, `/pro/rapporter`,
  `/pro/admin` → 200 + synlig "AK1A PRO håller på att byggas klart" + ingen
  cockpit-/pris-copy i synligt DOM. PASS (6/6 ytor).
- `/pro` + `/pro/admin` → `noindex,nofollow`. PASS. (Under-sidor: GAP #2.)
- Startsida: inget "Företag"-segment, ingen "AK1A PRO", ingen `href="/pro`,
  "Privatperson" kvar. PASS (4/4).
- robots.txt: ingen `Allow: /pro/`, `Disallow: /pro/admin` kvar. PASS (2/2).

**PÅ-läge (kör efter §2):**
- `/pro` → hero "AK1A PRO — Analytikerplattformen" + Morgonronden + pris-trappa
  (499/1 499/4 999); `<meta name="robots"` = index,follow.
- Startsida → toppväxeln "Privatperson | Företag"; sidfot innehåller "AK1A PRO".
- `robots.txt` → `Allow: /pro/` (Disallow /pro/admin kvar); sitemap → /pro kvar.
- ⌘K → sök "pro" ger "AK1A PRO"; chat-menyn → "AK1A Pro"-förslag (case "pro").
- `/pro/admin` → login-kort; fel lösenord avvisas; robots förblir Disallow.
- Enhetstest lokalt: `NEXT_PUBLIC_B2B_AKTIV=1 node verktyg/testa-b2b-grind.mjs`
  (N1–N2 växlar; N3 PÅ-rader; N4-källkontrakten — 0 FAIL förväntat).

## 6. ROLLBACK (av → omstart avstånd, ingen kod)

```bash
ssh … ; cd /home/ak1a/AK1
sed -i '/^NEXT_PUBLIC_B2B_AKTIV=/d' .env     # ta bort raden
npm run build && pm2 restart ak1a --update-env
```
Verifiera: /pro → Under uppbyggnad + noindex; startsida utan Företag/AK1A PRO;
robots.txt utan Allow /pro/ (samma punkter som §5 AV-kolumnen).

Källor: src/lib/b2b-status.ts · src/app/(huvud)/pro/** · src/app/robots.ts ·
src/app/sitemap.ts · src/lib/meny-register.ts · src/lib/sokindex.ts ·
src/components/ak1a/toppvaxel.tsx · chat-widget.tsx · src/lib/pro/tenant.ts ·
data/forskning/STYRELSE-B2B-VARIABLER.md · B2B/B2B-BESLUT.md (G2/G3, K-B2B:1–4).
Pedagogisk analys — inte investeringsråd.
