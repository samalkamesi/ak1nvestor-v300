# O150 — Spår 7: AR-BLOGG-OMKALIBRERING (o138 §6.1:s bokade valbara post) — cv-bloggkort ar 16.5625→16.125rem mot deterministisk medeldrift

**Spår:** 7 — PRESTANDA & MOBILPOLISH · **Roll:** byggare 2/3 (manifest
auto-s7-1790031919251) · **Datum:** 2026-09-21 23:14–pågående UTC ·
**Reservation:** o150 (data/vakten/protokollnummer.json) · **Anspråk
disk-först:** data/vakten/auto-s7-1790031919251-s7-u2-ansprak.md (23:14Z).

## §0 — Objektval och duplikatkontroll

Fabriksuppdraget: "Prestandavåg nästa i spåret (välj själv): mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd." Kollisionskontroll FÖRE
val: **u3:s anspråk 23:07Z äger o144-slutbokföringen** (o139 §8/o143 §7-facit
+ funktionstest-rot; deras yta orörd här — inklusive deras
funktion-o144.json 23:10:30Z och verktygsfixen i _s7u2o144-funktion.mjs).
u1: inget anspråk på disk 23:14Z. Klassikerna STÄNGDA (bild o66/o101 ·
cache o10/o13/o66/o70 · koddelning o27/o119/o121 · läsbarhet o8/o123/o131 ·
slider o127/o128). o120 §6:s arkitektnivå = produktpåverkan-bedömning
(initial listlängd ändrar kundupplevelse) — EJ fabriksautonom, lämnad.
**Valt: o138 §6.1** — protokollets egen bokade "valbara post": /ar/blogg
blocksond-EFTER docHΔ −371 px mot dom |docHΔ| ≤ 350 (+21 över), av
deterministisk innehållsdrift. Ren kalibreringskur, noll produktpåverkan.

## §1 — Underlaget (committade sond-JSON, o129+o138)

| Mätning | FÖRE-docH | EFTER-docH | docHΔ | Σh (55 kort) | medel | median |
|---|---|---|---|---|---|---|
| söndag 23:44Z (o129 FÖRE) | 26 335 | 21 790 | **−4 545** | 17 339 | 315,25 | 312 |
| måndag 05:42Z (o138 EFTER 1) | 21 981 | 21 610 | **−371** | 17 179 | 312,35 | 307 |
| måndag 05:43Z (o138 EFTER 2) | 21 981 | 21 610 | **−371** | 17 179 | 312,35 | 307 |

Källor: lighthouse/blocksond-s7u2o129-arblogg-mobil-{fore,efter-o138,
efter2-o138}.json. EFTER-omgångarna BITIDENTISKA (21981→21610 båda) =
deterministiskt, noll brus — giltigt kalibreringsunderlag enligt o129 §4.

## §2 — Rot: kalibreringen åldrad av innehållsdrift, ej fel mekanik

o129 kalibrerade ar-platshållaren mot söndagens yttre medelhöjd 315 px ⇒
16.5625rem (mekaniken: contain-intrinsic-size = innehållsbox; yttre höjd
= angivet + p-6 48 + border 2 = +50 px). Måndagen är kortens äkta medel
312,35 px (Σ-diff −160 px totalt = innehållsdrift ~2,9 px/kort, samma
slutsats som o138 §2:s "3 px/kort ≈ 165 px"). Platthållaren 315 mot äkta
312,35 ⇒ systematiskt stavhopp −371 px vid första scrollen (Σ(h_i − P)).

## §3 — Kuren (committad): ar-nivån 16.5625 → 16.125rem

Optimering mot måndagens deterministiska data: docHΔ(P) = Σh − 55·P =
55 × (312,35 − P):

| P (yttre px) | rem | docHΔ väntad |
|---|---|---|
| 315 (gammal) | 16.5625 | **−371** |
| 307 | 16.0625 | +69 |
| **308 (vald)** | **16.125** | **+14** |
| 309 | 16.1875 | −41 |
| 310 | 16.25 | −96 |

P=308 minimerar |docHΔ| och ligger exakt på rem-ritätet ((308−50)/16 =
16.125). Marginalanalys: |docHΔ| ≥ 350 kräver medeldrift ±6,4 px/kort
mellan kalibrering och EFTER-mätning — dokumenterat som drift-tak i
CSS-kommentaren; ny drift ⇒ ny mikrojustering mot dåtida sonddata,
ALDRIG bredare regel (o92/o129-disciplinen).

**Ändrad fil (ENDAST via Edit):** `src/app/globals.css` —
`html[lang="ar"] .cv-bloggkort` contain-intrinsic-size 16.5625 → 16.125rem
+ o150-not i kalibreringskommentarsblocket. **sv (−285) och en (−311) är
UNDER 350-taket — orörda. md/lg-brytpunkterna orörda.**

## §4 — KVD (före commit)

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinär;
  ALDRIG npx).
- INGET bygge/installation — deployen ägs av prod-synken (dess RAM-fönster;
  vid commit-tillfället köar redan d5890760 som VÄNTAR-RAM 1 347 MB —
  denna commit hamnar i samma tåg).
- R2 orörd · data/blogg/ orörd (kalibreringen berör ingen publicering) ·
  syskonens ytor orörda (u3:s o144-bokföring, u1:s yta) · spökmät-
  disciplinen: EFTER-mätning först vid DEPLOYAD med denna commit som
  förfader (§5).

## §5 — Vakarövertag (körs av denna våg om fönstret räcker, annars nästa)

1. `tail -n 4 data/vakten/prod-synk.log` — vänta DEPLOYAD-rad med hash H
   där `git merge-base --is-ancestor <denna-commits-hash> H` = SANT.
2. Kanalbevis: ar-nivån serverad — `curl -s http://localhost:3000/ar/blogg`
   refererad CSS innehåller `html[lang="ar"] .cv-bloggkort{contain-
   intrinsic-size:auto 16.125rem}` (chunkgrep i .next/static/chunks/*.css
   som komplement).
3. prod 200: / + /ar/blogg.
4. Blocksond ×2 (o132 §2:s exakta mönster):
   `node verktyg/_s7u2o129-blocksond.mjs arblogg-mobil-efter-o150
   http://localhost:3000/ar/blogg 412 823 2.627` (+ `-efter2-`-variant).
   **Dom: |docHΔ| ≤ 350 ×2, väntat ~+14.** RAM-vakt ≥ 1 500 MB före
   sonden (o139 §8-tilläggets läxa).
5. CLS-kontroll: kalibrering ändrar platthållarhöjd = docH-påverkan VID
   scroll, aldrig layout in-viewport — men Lighthouse /ar/blogg CLS 0
   kontrolleras av nästa vaktpass (cron) enligt rutin.
6. Boka facit här (§6) + worklog; vid drift > tak: omkalibrera (§3:s tabell).

## §6 — EFTER-facit

(fylls vid verkställande av §5)

## §7 — Kö vidare (oförändrat + detta spårs)

- o120 §6 arkitektnivå (produktpåverkan — bokas med öppet beslut i rond).
- o120 /blogg kall-TBT-arkitekturpost (oförändrad öppen).
- u3:s o144-slutbokföring (deras pågående yta).

## LEVERANS (denna commit)

src/app/globals.css (ar-omkalibrering + dokumentation) · detta protokoll ·
anspråksfilen · protokollnummersreservationen o150 · worklog-rad.
