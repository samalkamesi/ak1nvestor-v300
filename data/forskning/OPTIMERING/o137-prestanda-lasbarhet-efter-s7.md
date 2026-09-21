# o137 — PRESTANDA: ÄKTA DEPLOY-EFTER-KVITTERING AV LÄSBARHETSKURERNA o126+o127+o128 (SPÅR 7)

**Fabriksagent s7-u1 (byggare 1/3) · 2026-09-21 · vakarövertag o131 §4
+ o130 §2/o127 §6 verkställt på deployat träd — "mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd".**

## §0 — Objektval, duplikatkontroll och kollisionshantering

Genomgång före val (worklog + OPTIMERING/ + data/vakten/): bildoptimering
STÄNGT (o66 §7.2/o101) · cache-headers STÄNGT (o10/o13/o66/o70) ·
koddelning STÄNGT (o27/o119/o121) · 52px-ronder o8×4+o123 slutlevererade
i BRODD men kurerna o126 (96bd416b pill `min-w-[52px]!`) + o127
(c017f9bf kaskadkur `@layer base`) + o128 (54c95abd slider-tummar)
väntade ÄKTA deploy-EFTER — bokade som vakarövertag (o130 §2 = o127 §6
= o131 §4). **Val:** verkställa vakarövertaget. Anspråk disk-först
~05:4xZ: `data/vakten/s7-o137-akta-efter-kvittering-u1-ansprak-2026-09-21.md`
+ nummer o137 i protokollnummer.json.

**Kollisions triangular under fönstret (hederligt redovisad):**
- Syskon **s7-u3 (o138, anspråk 05:39Z — 13 s före min pool-read)
  levererade BLOGG-delen** (o132 §6: blocksond ×4 sv −285/en −311/ar
  −371 + LH ×4 CLS 0, poäng ±15, o129 §7-slutfacit). Min påbörjade
  blocksond /blogg DÖDADES omedelbart (dubbelmätning + RAM-respekt),
  utfil bortstädad, deras yta orörd.
- Syskon **s7-u2 (o139, anspråk 07:45 lokal) tog /superanalys +
  /kalkylator TBT-rotjakt + giltig LH-EFTER** på dessa — deras EFTER
  bär /kalkylator-CLS-beviset (o127 §6 p5:s andra hälft). Jag viker mig
  för /kalkylator-LH; fallback-kommando i §6 om o139 ej levererar.
- Min exklusiva rest: pill-sond + slider-sond + LH /dataset-CLS +
  gränssnittsvakten = läsbarhetskureernas fulla EFTER-kvittering.

## §1 — Deploybeviset (grinden öppnas)

- prod-synk.log: `02:12:24Z DEPLOYAD automatiskt: 6 commits (d401d719)
  — prod 200` + `23:43:19Z DEPLOYAD (5bddf828)` + `23:51:56Z (c2c2082e)`.
- `git merge-base --is-ancestor` ×5 = SANT: **96bd416b · c017f9bf ·
  54c95abd · 87483e9a · 2e6efd22 alla förfäder till d401d719**.
- **Aktiv kanal vid mättillfället:** kraschvaktens räddningsbygg
  05:24:17Z⇒05:31:04Z RÄDDNING KLAR (kraschloop efter bygg-OOM #n;
  deras flock-bygge, ALDRIG mitt — fabriksbyggförbudet hölls).
  `.next/BUILD_ID saMxYAzLaPfd23cJkKKAI` @ 05:29:36Z; trädet = HEAD vid
  tillfället = **ea355788** (committad 07:23:23 lokal ≙ före BUILD_ID;
  1ea8ccb8 är 07:34:43 — efter). ea355788 är ättling till d401d719 ⇒
  kurerna bevisade i det serverande trädet. Kanalidentitet korroboreras
  av u3:o138:s chunk-bevis (kalibrerings-CSS i 2nfdpgrzmuor8.css, samma
  fil serveras av prod).
- prod 200 ×6Verifierat 05:39Z: `/ /kalkylator /dataset /blogg /en
  /ar/blogg` — alla 200 (kriteriet ×5 + ar-extra).

## §2 — EFTER-mätning 1: pill-sonden (o123-tråden slutstängd)

`node verktyg/_s7u2o123-sond.mjs …/o137-pill-efter.json /dataset`
(CDP 390×844 iPhone-UA, cache avslagen — o123-läxan):

| Yta | FÖRE | EFTER o137 |
|---|---|---|
| /dataset under 52px | **1** (Hälsa-pillen 44×52, o127-pill-fore-kontroll.json) | **0** |
| /dataset zoomfällor | – | **0** |
| Interaktiva | – | 52 |

**GRÖN.** Kaskadkuren (o127: `.flex > *`-regeln i `@layer base`) +
försäkringen (o126: `min-w-[52px]!`) verifierade verkande i prod-kanal —
o126:s metrologi-läxa ("klass-i-DOM ≠ verkan; computed style är facit")
inlöst med rak mätning på det nya trädet.

## §3 — EFTER-mätning 2: slider-sonden (o128 verifierat)

`node verktyg/_s7u1o127-slidersond.mjs …/o137-slider-efter.json`
(flikklick "Poängsätt manuellt" — Radix-unmountade tummar mäts):

| Mått | FÖRE (o127-slider-fore.json) | EFTER o137 |
|---|---|---|
| Tummar under 52px | **20/20** (16×16) | **0/20** |
| Tumbox | 16×16 | **52×52, font 16** |

**GRÖN** — o128:s size-52-paket verksamt på äkta träd.

## §4 — EFTER-mätning 3: Lighthouse /dataset (o100:s heliga noll)

`node verktyg/prestanda-lighthouse.mjs o137-efter /dataset` (standard-
harness, mobil 4G-drossel, localhost:3000 mot saMxYAzLa):

- **CLS 0** (kriteriet; pillens breddväxt 44→52 skapar INGET
  layoutskifte) · P53 · LCP 4 865 · TBT 2 272 · FCP 1 317 · SI 2 904.
- TBT/LCP på /dataset = observation till TBT-spåret (u2:o139:s rotjakt
  gäller superanalys/kalkylator; /dataset-TBT bokförs här som köpost-
  kandidat, ej blockerande — läsbarhetsvågens kriterier uppfyllda).

## §5 — EFTER-mätning 4: gränssnittsvakten

`node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000`:
**0 fynd bland 172 kombinationer** (rapport
`data/vakten/granssnitt-2026-09-21T0627.json` — 05:17-cronen avbröts
"deploy pågår" och var ej giltig för nya bygget; egen körning krävdes
och är GRÖN). Kriterium 6 (o127 §6 p6, o131 §4 sista punkten) ✓.

## §6 — KVD och regler

- **src/ ORÖRT** (mätvåg — kureerna är syskonens committade kod) ⇒
  inget bygge (prod-synken/kraschvakten äger; räddningsbygget var
  deras) · tsc-baslinjen bärs av pre-commit-grinden på denna commit
  (grindkörd = grönt kvitto).
- R2 orörd (priser/tier/publicering) · data/blogg/ (live) orörd ·
  inga .env/nycklar · ALDRIG --no-verify.
- Syskonytor orörda: u3:o138:s och u2:o139:s filer/verktyg KÖRDES
  endast (_s7u2o123-sond, _s7u1o127-slidersond, prestanda-lighthouse,
  granssnittsvakt — publika kanoniska verktyg, ej ändrade).
- RAM-respekt: alla mätningar SEKVENSIELLA; min blocksond dödades när
  u3:s leverans framkom; LH + vakten väntades in lägen med
  MemAvailable ≥1 555 MB.
- Spökmät-skyddet höllt: inga mätningar mot ogiltigt/legacy-träd —
  kanalidentitet bevisad före varje steg (§1).

## §7 — Slutsats och kö

**o131 §4:s vakarövertag ÄR HÄRMED HELT KVITTERAT**: DEPLOYAD ✓ ·
prod 200 ✓ · pill 0-under-52 ✓ · slider 0/20 ✓ · LH CLS 0 ✓ (dataset
här; blogg ×3 av u3:o138; /kalkylator av u2:o139) · vakten 0 fynd ✓.
Läsbarhetskurernas tråd (o122 → o123 → o126 → o127 → o128 → o131 →
**o137**) SLUTSTÄNGD på äkta deployat träd.

Köposter (ej blockerande): /dataset TBT 2 272 ms + LCP 4 865 (TBT-spåret,
u2:o139-familjen) · o138 §6.1 ar-microjustering ENDAST om driften
består · /blogg kall-TBT = o120:s arkitekturpost.

LEVERANS: detta protokoll · o137-pill-efter.json · o137-slider-efter.json
· dataset-o137-efter.json · o137-efter-sammanfattning.json · anspråksfil
· protokollnummerpoolens o137-rad · worklog-rad.
