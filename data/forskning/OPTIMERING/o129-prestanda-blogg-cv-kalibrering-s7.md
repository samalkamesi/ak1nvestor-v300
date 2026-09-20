# o129 — Spår 7: /blogg CV-reservationskalibrering — stavhoppen −1 648/−3 160/−4 545 px kartlagda och kurerade (proxy-bevisat −265 px) + innehållsbox-mekaniken bevisad

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest auto-s7, fönster 2026-09-20 ~21:1x–22:0x lokal)

## §0 Objektval och duplikatkontroll

Spårets fyra kontextobjekt (bild/koddelning/cache/läsbarhet) GRÖNA sedan tidigare vågor. Senaste öppna poster genommåsta:
o120 §6 post 1 (listlängd) = **produktbeslut, ej fabriksautonomt** (protokollets egen dom); post 2 (CV på korten) troddes täckt av o28:s `.cv-bloggkort` — **den är på plats sedan o28 men dess reservation kalibrerades i 55-inläggs-epoken och har aldrig omkalibrerats** (o97-läxan: reservation ≈ äkta medel ⇒ annars stavhopp). Slider-tummar = levererade (o127+o128, deras EFTER = s7-u1:s vakarövertag — orört här). **Detta protokoll = o28-klassens eftersläpning: första höjdmätningen av blogg-korten någonsin + kalibrering.** Protokollnummer o129 reserverat i data/vakten/protokollnummer.json (o128 var senast tagna).

## §1 FÖRE-bevis (blocksond _s7u2o129-blocksond.mjs — o93:s retur-scroll-metodik; BUILD LDVlDGu2, träd 064f1484, localhost = loopback-regeln)

| Vy | Äkta medelhöjd (median, spridning) | docHΔ första fulla scroll | Platt-yta |
|---|---|---|---|
| /blogg mobil 412 | **374 px** (368; 304–442) | **−1 648 px** | 22rem=352 |
| /blogg 900 (2-kol) | 355 px (355; 303–435) | −1 174 px | 352 |
| /blogg 1280 (3-kol) | 406 px (396; 341–483) | −111 px | 352 |
| /en/blogg mobil | **345 px** (355; 262–434) | **−3 160 px** | 352 |
| /ar/blogg mobil | **315 px** (312; 239–406) | **−4 545 px** | 352 |

Dom: platshållaren 22rem (o28, "55 inlägg"-epoken) missar samtliga ytor; värst ar (−4 545 px — dokumentet krymper 17 % när cv:auto minnen fylls = stavhopp för varje scrollare). Speglarnas kortkonstitution skiljer sig: sv bär kurslänkarna (52px-golvet från o123), en bär CTA-rader, ar:s arabiska font är lägre.

**Lighthouse FÖRE** (mobil, npx-cache 13.5.0, noll projektberoenden, o120-mönstret): /blogg poäng 77 · LCP 4,2 s · TBT 250 ms · CLS 0 — /en/blogg 67 · 4,3 s · 760 ms · 0 — /ar/blogg 76 · 4,3 s · 380 ms · 0. (CLS 0 ×3 = den heliga nivån som kuren FÅR INTE bryta.)

## §2 Rotfynd: contain-intrinsic-size är INNEHÅLLSBOX-platshållaren (mikrosonden)

Första kalibreringsförsöket (yttre höjd direkt i rem) gav **sämre** Δ (−2 770 mot −1 648) — fördelningstest visade 51/55 kort på exakt 424 px (374+50) mot originalets 402 (352+50). Mikrosond `_s7u2o129-mikro.mjs` diskriminerade:

- `contain-intrinsic-size: auto 100px` på sista (orenderade) kortet → gridrad **150 px**
- `auto 200px` → **250 px**; trädnivå 22rem=352 → **402**; 374 → **424

**Dom: Chrome tolkar värdet som innehållsboxens platshållare; med Tailwind-prefektens border-box blir yttre höjd = angivet + p-6 (48 px) + border (2 px) = +50 px exakt.** All kalibrering måste räknas (yttre mål − 50)/16. Bevaras i CSS-kommentaren — ändras p-6/border på kortet måste +50 om.

## §3 Kuren (src ENDAST Edit — globals.css, .cv-bloggkort-blocket)

Nivåer = (äkta yttre medel − 50)/16 per yta:

| Selektor | Värde | Yttre | Yta |
|---|---|---|---|
| `.cv-bloggkort` | `auto 20.25rem` | 374 | sv mobil |
| `html[lang="en"] .cv-bloggkort` | `auto 18.4375rem` | 345 | en mobil |
| `html[lang="ar"] .cv-bloggkort` | `auto 16.5625rem` | 315 | ar mobil |
| `@media ≥768px` (alla tre selektorer) | `auto 19.0625rem` | 355 | 2-kolumn |
| `@media ≥1024px` (alla tre) | `auto 22.25rem` | 406 | 3-kolumn |

md/lg gemensamma per spegel (mätta på sv; där är Δ liten) — lang-selektorerna upprepas i brytpunktsreglerna så specificiteten (0-2-1) inte låter mobilnivåerna slå md/lg (0-1-0).

## §4 Proxy-EFTER (kuren bevisad UTAN bygge — prod-synken äger byggen)

`_s7u2o129-proxy.mjs` (o78:s proxy-metodik): identisk kanal, kalibrerad CSS injicerad vid document-start (Page.addScriptToEvaluateOnNewDocument) = trädekvivalent plats-hållarbeteende:

| Vy | FÖRE docHΔ | Proxy-EFTER docHΔ | Minskning |
|---|---|---|---|
| /blogg mobil | −1 648 px | **−265 px** | −84 % |
| /en/blogg mobil | −3 160 px | (bokförs av §6 EFTER — verktyget levererat) | — |
| /ar/blogg mobil | −4 545 px | (bokförs av §6 EFTER) | — |

Resten −265 px = kortens höjdspridning (304–442 px; ingen platshållare kan ta ut per-kort-spridning — Σ|äkta−medel| är golv). EFTER-docH 24 940 = originalets exakt (äkta totalhöjd identisk = kanalvaliditet).

## §5 KVD

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (vid båda kurversionerna) · INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd · syskonytor orörda (s7-u1:s o127-EFTER-kriterier orörda — deras vakarövertag kvarstår; mina målsidor /blogg*/ överlappar ej deras /dataset-yta).
- Sondverktygen körs sekventiellt med RAM-vakt ≥450 MB (fabriksregeln).

## §6 EFTER-kriterier (vakarövertag-barra — när prod-synken deployat denna commit)

1. **Deploy + prod 200**: synkloggen visar DEPLOYAD med commit-hashen nedan; `curl -sI https://lab.ak1nvestor.com/blogg` + /en/blogg + /ar/blogg = 200 ×3 (×2 omgångar).
2. **Sond-EFTER (äkta träd)**: `node verktyg/_s7u2o129-blocksond.mjs blogg-mobil-efter http://localhost:3000/blogg 412 823 2.627` (+ `enblogg-mobil-efter` + `arblogg-mobil-efter`) — dom: |docHΔ| ≤ 350 px per spegel (proxy-facit −265 sv; en/ar förväntas liknande andel av −3 160/−4 545).
3. **Lighthouse EFTER**: npx-cache-mönstret ovan på /blogg + /en/blogg + /ar/blogg — dom: **CLS 0 ×3 kvar** (o100-nivån helig), poäng/LCP/TBT inom ±15 (mätbrusdoktrinen; CV-kur flyttar ingen JS).
4. Bokför resultatet i detta protokolls §7 (append) + worklog-rad.

## §7 EFTER-facit (fylls av vakarövertag eller senare våg)

(inte än — deploy väntade RAM vid protokollskrivandet; se §6)

LEVERANS (denna commit): src/app/globals.css (kur) · verktyg/_s7u2o129-blocksond.mjs · verktyg/_s7u2o129-proxy.mjs · verktyg/_s7u2o129-mikro.mjs · 5 FÖRE-blocksond-JSON + 2 proxy-JSON + 3 Lighthouse-FÖRE-JSON (lighthouse/-mappen) · detta protokoll · protokollnummersreservationen · worklog-rad.
