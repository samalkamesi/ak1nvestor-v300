# o130 — EFTER-kvittering av o126+o127+o128 (vakarövertag, s7-u3)

**Spår:** 7 — PRESTANDA & MOBILPOLISH · **Roll:** byggare 3/3 (manifest
auto-s7-1789937710952) · **Datum:** 2026-09-20 · **Status:** PENDING —
deploy blockerad av bygg-OOM ×2 (infra); vakarövertaget består. Nummer
o129 var taget av syskonet s7-u2 (blogg-CV-kalibrering, 87483e9a) —
därav o130 (pool-reservation se data/vakten/protokollnummer.json).

## §0 — Objektval och duplikatkontroll

Fabriksuppdrag: "Prestandavåg nästa i spåret (välj själv): mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd."

Genomgång före val (worklog + OPTIMERING/ + anspråk i data/vakten/):

- **Bildoptimering** STÄNGT (o66 §7.2, o101: "inga bildauditer flaggar",
  logotyp next/image).
- **Cache-headers** STÄNGT (o10/o13 rond 1–2 HTML+json, o66 rond 3
  public/-assets, o70 nginx-renodling — "det sista öppna
  cache-objektet i spåret").
- **Koddelning** STÄNGT (o27; chunkarna fingerprintade o82/o84;
  o119/o121 koddelningsvågorna levererade).
- **Mobil läsbarhet ≥52 px** — o8 fyra ronder + o123 rond 4; kurerna
  committade men **EFTER-kvitteringen väntar deploy**: o126
  (pill `min-w-[52px]!`, 96bd416b) · o127 (kaskadkur `.flex>*/.grid>*`
  → `@layer base`, c017f9bf) · o128 (slider-tummar 16→52 px, 54c95abd).
- **Det bokade öppna barnet** = o127 §6 vakarövertag: konkorda kommandon,
  u1 avslutade medvetet för att frigöra RAM åt synken (worklog 16452 +
  commit 01b71b82). Ingen aktiv ägare fanns: u1 klar/avslutad;
  o126-läsbarhetssonden sköts av sin egen väntarprocess
  (`verktyg/_s7u3o126-vanta.mjs`, lever — DERAS yta orörd);
  `_r127-vantare2.mjs` = feljaktsrond 127 (annat spår); o128:s
  `_s7u2o128-efter.mjs` ägs av förra omgångens u2-tråd.

**Val:** EFTER-kvitteringen enligt o127 §6 — exakt uppdragstextens
"mät före/efter (Lighthouse), deploy, prod 200, mätning bokförd".
Anspråk disk-först 21:38:30Z:
`data/vakten/s7-o127efter-vakartag-u3-ansprak-2026-09-20.md`.

## §1 — Läge vid start (2026-09-20 21:38Z)

- HEAD = 01b71b82 (o127 bokföring); senaste deploy 064f1484 20:52:07Z —
  ALLA tre kurerna yngre än deployn, väntar RAM-fönster.
- Prod-synk VÄNTAR-RAM: 21:07 (2155 MB), 21:17 (2955), 21:27 (2854),
  21:37 (1113 < 3400, 4 barn), 21:47 (2431 < 3100, 3 barn) — källor:
  prod-synk.log.
- FÖRE-lägen (syskonens, ALDRIG omkörda): pill FÖRE 1 under 52 på
  /dataset («Hälsa» 44×52, o127-pill-fore-kontroll.json) · slider FÖRE
  20/20 tummar 16×16 (o127-slider-fore.json) · o100:s CLS 0-nivå.

## §2 — Metod (o127 §6 i turordning; inga egna instrument)

1. Deploy-grind: DEPLOYAD-rad i prod-synk.log med 01b71b82 i förfaderskap
   (NY KOD-kedjan 064f1484 → … → 01b71b82).
2. prod 200 ×5: / · /kalkylator · /dataset · /blogg · /en (https).
3. Pill-sond: `node verktyg/_s7u2o123-sond.mjs
   data/forskning/OPTIMERING/lighthouse/o129-pill-efter.json /dataset`
   → väntat **0 under 52**.
4. Slider-sond: `node verktyg/_s7u1o127-slidersond.mjs
   data/forskning/OPTIMERING/lighthouse/o129-slider-efter.json`
   → väntat **0/20 under 52** (verifierar även o128:s kur).
5. Lighthouse CLS: `node verktyg/prestanda-lighthouse.mjs o129-efter
   /kalkylator /dataset` → väntat CLS 0 ×2 (o100:s heliga noll).
6. Gränssnittsvakten: `node verktyg/granssnittsvakt.mjs
   --bas=http://localhost:3000` → väntat 0 fynd.

RAM-hänsyn: sonder/LH körs ENDAST efter deploy (byggets 2,2 GB
frigjort); slidersondens egen RAM-vakt (≥700 MB) respekteras.

## §3 — EFTER-mätning

**Status 22:11Z: PENDING — deployen blockerad av infra (bygg-OOM ×2), ej kod.**

Deployfönstrets krönika (prod-synk.log + /tmp/synk-build.log, citerad):

- 21:47:11Z VÄNTAR-RAM 2431 < 3100 (3 barn) — grunden sjönk allteftersom
  förra omgångens barn avslutade; available steg 1113 → 2431 → 4611 MB.
- 21:57:10Z NY KOD 064f1484 → f0758d45 — **§6 kriterium 1 uppfyllt i
  trädet**: git merge-base bevisar ALLA fyra kur-commits som förfäder
  till f0758d45 (96bd416b o126 · 54c95abd o128 · c017f9bf o127 ·
  01b71b82 bokföring) + syskonens 87483e9a/o129 ovanpå.
- 22:00:11Z **bygg OOM-dödat #1** (synk-build.log slutar "Creating an
  optimized production build … Killed") — nytt försök utlovat nästa poll.
- 22:07:19Z NY KOD igen (available 5661 MB vid start — bättre läge) →
  22:10:20Z **bygg OOM-dödat #2** (samma fas, ~3 min in). HEAD orört;
  synken försöker automatiskt vid nästa 10-min-rop (22:17:10Z).

Tolkning: inte kodfel (samma träd-topologi byggde grönt 20:02/20:11/20:52
med lägre available) — byggfasens heap-toppar + samtidig last;
återställningsägande = prod-synken/kraschvakten (drift-yta, ALDRIG
fabriksagentens; HEAD orört = inget revert-läge). o126:s väntarprocess
(`verktyg/_s7u3o126-vanta.mjs`, 22-min-tak från 21:19Z) gick ut ~21:41Z
utan deploy — deras protokoll §5 PENDING kvarstår, samma vakarövertags-
mönster. o128:s `_s7u2o128-efter.mjs` förblir ospelat (syskonets yta).

**Slutläge 22:33Z (vågens avslut):** fjärde incidenten i serien — ett
fristående next-build (PID 4060278, RSS 6 196 MB, start 22:25Z under
/tmp/ak1a-deploy.lock av PID 4059787/88, ägare ej prod-synken — dess
22:27-rop väntade; sannolikt kraschvaktens/rondens svar på OOM-serien)
avslutades ~22:31Z UTAN ny .next/BUILD_ID (fortfarande LDVlDGu2 —
prod grön 200 på förra gröna läket; HEAD orört). Samtidigt satte
22:27:22Z-ropet **2e6efd22 (denna vågs bokföring) som prod-spets** —
nästa lyckade deploy paketerar ALLT: kurer o126/o127/o128 + syskonens
o129 + o130. Available 4 487 MB vid 22:32Z ⇒ 22:37:10Z-ropet får sitt
byggfönster; nästa våg (fabrikens 22:25Z-omgång är redan levande) kör
§2-kommandona vid DEPLOYAD. Denna våg avslutar medvetet enligt
o127-precedensen — kedjan är bokförd, inte bruten.

**Vakarövertaget består intakt**: o127 §6-kommandona är oförändrade och
körbara av nästa våg (eller mig i nytt fönster) så snart en DEPLOYAD-rad
med f0758d45-avkomma landar: prod 200 ×5 → pill-sond (0 under 52) →
slider-sond (0/20) → LH CLS 0 ×2 → vakten. FÖRE-lägena är skyddade på
disk (o127-slider-fore.json 20/20 · o127-pill-fore-kontroll.json 1 st
«Hälsa» 44×52) — inget spökmätningsbehov.

## §4 — KVD

- src/ RÖRS EJ (kurer är syskonens committade) → INGET bygge, tsc-
  baslinjen bärs av pre-commit-grinden vid commit.
- R2 orörd · data/blogg/ orörd · syskonens verktyg/filer orörda
  (kördes endast).
