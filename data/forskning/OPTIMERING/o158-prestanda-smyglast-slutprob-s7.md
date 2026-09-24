# O158 — EFTER-VAKTENS ANOMALI-DOM BOKFÖRD SOM SMYGLAST + MÄTARKEDJANS HÅL FÖRSEGlat: STEG 2B LAST-SLUTPROB (Spår 7, s7-u1)

Datum: 2026-09-24 ~13:4x–14:2x lokal · Fabriksagent s7-u1 (byggare 1/3,
manifest auto-s7-1790249713381). Anspråk disk-först FÖRE all ändring:
`data/vakten/auto-s7-1790249713381-s7-u1-ansprak.md` · protokollnummer
o158 reserverat i poolen. Syskonkontroll vid val: omgångens status klara=[]
— inga levererade; under fönstret reserverade syskon s7-u2 nästa nummer
(bolagsfamiljens jungfrumark-baslinje, _s7u2o159-reservera.mjs) — helt
disjunkt från mätarkedje-ytan, ingen kollision.

## §0 Val

- Klassiska spårytor stängda sedan tidigare: bildoptimering (o66 §7.2/o101)
  · cache-headers (o10/o13/o66/o70) · koddelning (o27/o119/o121) · 52px-
  läsbarhet (o8 fyra ronder + o123). Senaste poster: o144 SLUTFACIT ·
  o151 mätaren · o155 lastvakten (u2, 2026-09-24 ~02:0x lokal).
- **Objektet = o155 §5:s öppna EFTER-kedja** — exakt uppdragstextens
  "mät före/efter (Lighthouse), deploy, prod 200, mätning bokförd".

## §1 Läget som fanns (o155 §5:s tre steg, avlästa)

1. **Efter-vakten KLAR** (o155-efter-vakt-status.json, commit 526b2bdd):
   3 lastavbrott (busy 98,4→54,9 % under ~2 h vak), körning 4
   00:52:03Z 2026-09-24: **lastOK=true** (busy 2,1 % · loadavg1 1,32 ·
   kalib 64,5 ms · väntade 284 243 ms · zcodeBarn 7) men dom **RÖD**:
   /kalkylator P 64→35 · LCP +72,3 % · **TBT 582→16 413** · /superanalys
   P 73→38 · LCP +60,9 % · TBT 375→7 508. CLS 0 ×2 (heligt, hålls).
2. **Natt-cronen 03:27 lokal 24 sep HOPPADE ÖVER**: loggens rad
   "2026-09-24T01:27:01Z HOPPAR ÖVER: deployfönster aktivt" ⇒ kanonisk
   dom-o151-natt.json förblir den ogiltiga (23 sep, mätt FÖRE lastvakten,
   busy ~98 % enligt o155 §2). **TBT-posten kan INTE slutstängas i detta
   fönster.**
3. o155 §5.2:s regel: lastOK=true + RÖD ⇒ kuren (o139 §8.4) återöppnas —
   "först DÅ är det kod". MEN domen bar anomalitecken (nedan) ⇒ rotanalys
   KRÄVDES före någon kodkur (spårets eget mönster: o120 + o155 §2
   motbevisade två liknande anomalier som mätmiljö).

## §2 Rotbevis: lastOK=true-RÖD är en SMYGLAST — instrumentet, ej koden

Diagnos med o155:s eget verktyg (_s7u2o155-diagnos.mjs) på efter-vaktens
LH-filer mot tysta nattbasen o139-fore (21 sep 06:0xZ):

| /kalkylator | o139-fore (tyst bas) | o155-efter-vakt | kvot |
|---|---|---|---|
| Script Evaluation | 1 569 ms | 9 470 ms | 6,0x |
| Style & Layout | 1 532 ms | 8 044 ms | 5,3x |
| `2feezv-iveko5.js` CPU (70 KiB ramverkschunk) | 1 342 ms | 7 767 ms | 5,8x |
| TBT | 582 | 16 413 | 28x |

Tre vittnen (o155 §2:s mönster, starkare):

1. **Oförändrad topplista, ingen ny hotspot**: samma chunk
   `2feezv-iveko5.js` dominerar; inga nya script av vikt (UNUSED-JS
   identiska 42/70 KiB). Kodregression ändrar proportioner — här skalade
   ALLA kategorier samtidigt (~5–6x).
2. **Longtasks förlängda djupt in i trace-fönstret**: basens 12 tasks
   slutade vid ~4 900 ms; efter-vaktens 20 tasks bär startTime upp till
   17 920/15 893/14 435 ms med topptask 2 643 ms (basens max 716) —
   sidan delade CPU:n med främmande last under hela mätningen.
3. **Kalib-drift under fönstret**: cpuKalibMs 64,5 (startprob) → 109,5
   (återprob efter värmningen) = 1,70x genomströmningsförsämring på
   ~2 min — metallen var INTE konstant; lasten återkom efter sista
   godkända proben (1b), under själva Lighthouse-körningen.

**Slutsats**: o155:s lastvakt mätte tysthet FÖRE mätningen (0b + 1b) men
ALDRIG EFTER — hålet är strukturellt: ett ~2 min Lighthouse-fönster utan
slutprob kan producera lastOK=true på en dom som mätts under återvändande
last (bevis: 7 zcode-barn + kalib-drift). Domen är OGILTIG som
koderuditens; o139 §8.4-kuren får INTE återöppnas på den (o155 §5.2:s
"ÄKTA natt-evidens" uppfylls ej).

## §3 Kuren — steg 2b last-slutprob (kirurgiskt vakarövertag)

`verktyg/_s7u3o151-natt-tbt.mjs` (s7-u3:s fil, redigerad under dokumenterat
vakarövertag enligt o155 §3-mönstret; cron-roparen orörd — plockar upp
ändringen automatiskt vid nästa 03:27-fönster):

- **Steg 2b**: `lasLast()` EFTER Lighthouse-körningen. Tysthetskriterier
  oförändrade (busy < 30 % OCH loadavg1 < 1,5) + **kalib-driftvakt**:
  kvot kalibSlut/kalibStart utanför [1/1,5 · 1,5] ⇒ drift. Bevisfallet
  efter-vakten (64,5→109,5 = 1,70x) FÅNGAS; normalt prob-brus (~±10 %)
  släpps igenom. Tröskelns skäl: samma arbetsloop får inte avvika > 50 % —
  då var genomströmningen ej konstant = fönstret ogiltigt.
- **Natt-läge ogiltigförklarar** vid smyglast: `dom = "avbruten-last-efter"`,
  exit 2 — ALDRIG röd dom (exit 1) på ett ogiltigt fönster. Sond-läge
  bokför endast fakta (kalibKvot + kalibDrift i steglistan), dagfönstret
  rättfärdigar ingen dom (o143 §3).
- **lastOK utvidgat**: `last.tyst && lastAter.tyst && slutTystOK` —
  dom-barhet kräver nu tysthet vid alla TRE proberna (0b före, 1b efter
  värmning, 2b efter mätning) + driftlös kalib.
- **Ärligt bokförd REST**: pulserande last som AVSLUTATS före slutproben
  syns ej av 2b (fönstret mellan 1b och 2b är ~2 min). Täckning = post-hoc-
  kvotdiagnos (o155 §5.3: TBT/cpuKalibMs) när första tysta kalib-referensen
  etablerats — verktyget bokför nu kalibStart/kalibKvot i varje dom-fil,
  vilket är precis de fakta den diagnosen behöver.

## §4 Verifiering

- `node --check` på verktyget: GRÖNT.
- Kalib-kvotlogik isolattestad, 7/7 PASS: 1,70x (efter-vaktens fall) ⇒
  drift=true · brus 1,10x/0,90x ⇒ false · gräns 1,50 ⇒ false · 1,51 ⇒
  true · kraftig avlastning 0,47x ⇒ true (fönstret ogiltigt åt båda håll).
- **Ingen full sond i detta fönster** (motiverat, ej förbiseende): RAM
  available 1 889 MB — över verktygets 1 500-tak men marginalen 389 MB
  räcker ej säkert för Chrome (~0,5–0,7 GB) medan fabriken håller 3 barn;
  en OMA mot prod-processer är inte acceptabel risk för ett
  exekveringsbevis. Första LIVE-exekveringen av 2b = natt-cronens nästa
  03:27-fönster (cron äger, jämte o155 §3:s cron-ropar-argument). Dagens
  dag-last gör dessutom sond-TBT icke dom-bar (o143 §3).
- tsc: src/ orörd ⇒ baslinjen bärs av pre-commit-grinden ( ingen
  TypeScript-yta berörd av denna leverans).

## §5 KVD

- Deploy: data/verktyg-only ⇒ `git push prod develop`, INGET bygge
  (fabriksregeln; appar läser mätverktyget från disk vid cron-ropet).
- Prod 200 verifieras efter push (localhost + https).
- R2 orörd (priser/tier/publicering) · data/blogg/ orörd ·
  data/blogg-utkast/ orörd · src/ orörd.
- Syskonytor: s7-u3:s mätverktyg kirurgiskt redigerat under dokumenterat
  vakarövertag (o155 §3-mönstret, attribution i källkommentar + här);
  s7-u2:s reservationsverktyg/grönmark ej rörd; nattens faktafiler redan
  committade av rond 157 (526b2bdd) — hänvisade, ej duplicerade.
- Protokollnummerpoolens ride-along: delad pool-natur (s2-u3-precedensen).

## §6 Kö vidare (nästa levande våg / cron)

1. **Natt-cronen 03:27** (med 2b) äger fortsatt kanoniska domen
   `dom-o151-natt.json` — läs `lastOK` FÖRST, nu med tre prober + kalibKvot:
   - lastOK=true + GRÖN ⇒ TBT-posten SLUTSTÄNGD (fyll o144 §5 +
     o139 §8-facit + worklog).
   - lastOK=true + RÖD ⇒ NU finns ÄKTA natt-evidens ⇒ o139 §8.4-kuren
     (kalkylatorns hydratiserade DOM, 1 411 rader / 20 reglage) återöppnas
     — o155 §7:s designvåg.
   - `avbruten-last(-efter)` ⇒ nytt fönster (cron är tålmodig); TRE
     avbrott i rad ⇒ larma spåret (o151 §3.3).
2. Vid första giltiga tysta mätningen: bokför cpuKalibMs-referensen —
   därefter blir lastade fönster diagnosticerbara via TBT/kalib-kvot
   (o155 §5.3; kalibStart/kalibKvot nu maskinellt i varje dom-fil).
3. o151 §5:s övriga: o120 /blogg kall-TBT-arkitektur · s8:s
   Docs-Offline-metrologi (stängd, övervakas).
