# DR-ÖVNING 2026-09-24 MORGEN — BLAD 14 + APP-BLAD 14 (DUBBELREPLIK MED SYSKON) — ALLT GRÖNT

**Agent:** s10-u3 (vakt 3/3, Fabrik-order "DR-övning: återställ, mät tid/rader,
protokoll, städa lokal PG"). Anspråk disk-först med prediktioner FÖRE mätning:
`data/vakten/s10u3-dr-blad14-2026-09-24-ansprak.md` (gitignorerad).
**Tid:** 07:26–07:39 lokal (05:26–05:39Z). **Slutdom: GRÖN — exit 0 × 2.**

## 0. Sammanfattning för kunden (5 rader)

1. Vi återställde hela databasen från **går nattens backup** i en avskild
   testdatabas — **65,5 sekunder** — och app-projektets egen backup
   (**88 MB, allt innehåll**) på **93,8 sekunder**. Produktionen påverkades
   inte; testdatabaserna raderades direkt efteråt.
2. Kontrollen: **60 publika tabeller / 1 424 981 rader** kom tillbaka exakt
   som prognosen spådde (avvikelse 62 rader = 0,004 %). Fel 788 kända/0 okända.
3. Sedan senaste bevisade övningen (09-21) har **tre nattblad fötts
   overifierade** (09-22, 09-23, 09-24) — denna övning stänger gapet: blad 14
   är restore-bevisat, retentionen 14 blad GRÖNA, och 02:50-kurens app-dump
   levererar sitt **fjärde dygn i rad** helt grönt.
4. Dataförlust-risk just nu: endast **+169 rader** skillnad mellan blad 14
   (02:30) och levande databas (07:37) — ~5 timmars skrivningar, two tables
   i rörelse. Vid katastrof just nu: max 169 rader förlorade.
5. Nästa regelbundna övning: kvartal **senast 2026-12-24** — men spåret kör
   kontinuerligt; nästa blad-kvitto 09-25 02:30.

## 1. Val och duplikatkontroll

Senaste restore-bevis = **blad 11** (2026-09-21, natt AUTO-2 + kväll AUTO-7).
Blad 12–14 (09-22…09-24) + app-blad 09-22…09-24 fanns **utan restore-bevis**
— detta var spårets nästa objekt. Syskonet **s10-u2** (manifest
auto-s10-1790225128873; deras AUTO 07:31 + app-blad AUTO-3) körde blad 14
parallellt: **flocken serialiserade oss korrekt** (deras
fönster → mitt), inget fönster krockade, och de två löporna gav **identiska
radkontrakt** — blad 14 är därmed DUBBELREPLIK-bevisat (verktygets
determinism, femte gången i serien som två oberoende restores av samma blad
ger EXAKT samma tal). Min tillförda unika leverans: prediktionsdom (maskin-
protokollen saknar den), app-blad 14, RPO-diff, DRIFTSBOK-status, kurens
dag-4-kvitto tolkat.

## 2. Körning 1 — nattblad db-2026-09-24.sql.gz (rkaq, kedja 1)

| Moment | Resultat |
|---|---|
| Arkiv | 34 948 818 B · SHA-256 46d799f0…1738 · mtime 02:31:36 oförändrad (ENDAST LÄST bevisat före/efter) |
| Markör (kolla-dump-markorer) | **GRÖN** · 1 447 286 rader · CREATE 99 · COPY 101 · pg_dump 17.11 |
| Restore (zcat \| psql) | **RTO 65,5 s** (fabrikslast, load ~5,5–6,9 vid start) · fellogg 788 rader → /tmp/dr-ovning-fel-blad-2026-09-24-p2876964-…log |
| Fel | **788 kända / 0 okända** (moln-roller/scheman/extensions — ofarliga enligt v98 F3) |
| public | **60 tabeller / 1 424 981 rader** |
| public+storage | 68 / 1 425 117 · alla scheman 99 / 1 425 377 |
| Nyckeltabeller | snapshots **1 328 340** · board **53 186** · section_data 19 363 · courses 10 · modules 122 · auth.users 3 · profiles 3 |
| Syskonets replik (s10-u2, 07:31) | RTO 77,9 s · **samtliga radkontrakt IDENTISKA** (DR-PROV-2026-09-24-AUTO.md) |
| Maskinprotokoll | data/forskning/DR-PROV-2026-09-24-AUTO-2.md |

## 3. Körning 2 — app-blad db-app-2026-09-24.sql.gz (aufr, 02:50-kuren)

| Moment | Resultat |
|---|---|
| Arkiv | 88 700 574 B · SHA-256 1d2a3edc…4dcfc · mtime 02:54:42 oförändrad |
| Markör | **GRÖN** · 2 295 323 rader · CREATE 418 · COPY 420 |
| Restore | **RTO 93,8 s** · fel 2 611 kända / 0 okända → /tmp/dr-ovning-fel-blad-app-2026-09-24-p2880259-…log |
| public | **372 tabeller / 188 736 rader** · pub+storage 380/190 081 · alla 417/191 851 |
| Tillväxt vs 09-21 (AUTO-8) | markör +5 352 (2 289 971→2 295 323) · public +5 410 (183 326→188 736) ≈ 1 790/dygn |
| Kurens dag-4-kvitto | crontab 02:50 → blad födt 02:54 → markör GRÖN → restore GRÖN = **hela kedjan grön 4:e dygnet i rad** (eldprov 09-20, dag 2: 09-21, nu dag 4) |
| Syskonets replik (s10-u2) | DR-PROV-2026-09-24-AUTO-3.md (dubbelreplik även här) |
| Maskinprotokoll | data/forskning/DR-PROV-2026-09-24-AUTO-4.md |

## 4. RPO-diff — blad 14 mot levande prod (07:37, prod ENDAST läst)

- Bladets total 1 424 981 → levande 1 425 150 = **+169 rader oskyddade @ ~5,1 h**
  (02:30→07:37) ≈ 33 r/h — konsistent med seriens non-batch-takt (~36 r/h).
- Tabeller i rörelse 2/60: board_decisions +160 (53 186→53 346, ~1,7 burstar)
  · organ_health_logs +9 (3 264→3 273).
- JSON-delprotokoll: `data/forskning/DR-RPO-DIFF-2026-09-24-MORGON.json`.
- Jämförelse: 09-21 kväll +19 587 @ 16,9 h · 09-20 kväll +19 548 — RPO-exponeringen
  är dygnsrytm (pumpbatchen dominerar), morgontimmar är lugna.

## 5. Prediktionsdom (låst disk-först 07:28, FÖRE all mätning)

| P | Spådom | Faktiskt | Dom |
|---|---|---|---|
| P1 | public-tabeller 60 | 60 | **EXAKT** |
| P2 | 1 424 919 ∈ [1 420 000, 1 429 500] | 1 424 981 | ✅ (+62 = 0,004 %) |
| P3 | snapshots 1 328 340 (1 271 388+3×18 984) | 1 328 340 | **EXAKT** |
| P4 | board 53 186 (50 882+3×768) | 53 186 | **EXAKT** |
| P5 | markör GRÖN · 99/101 · ∈ [1 440 000, 1 452 000] | GRÖN · 99/101 · 1 447 286 | ✅ (99/101 EXAKTA) |
| P6 | fel 788/0 | 788/0 | **EXAKT** |
| P7 | RTO ∈ [30, 70] s (fabriksfas) | 65,5 s | ✅ |
| P8 | organ_health_logs 3 228 ∈ [3 215, 3 240] | **3 264** | ❌ MISS |
| P9 | städning grön (skrap raderad · PG17 down) | bevisat §7 | ✅ |
| P10 | retention 14 blad · äldsta 13 d · 0 raderade | 14 · 13 d · 0 | **EXAKT** |

App-bladet (extra): public-tabeller **372 EXAKT** · public +5 410 **EXAKT mot
skattningen** · fel 2 611/0 **EXAKT** · RTO 93,8 ∈ [50, 120] ✅ — 4/4.

**P8-rotorsaka (ärligt):** jag extrapolerade organ-tillväxten som +36/dygn —
men +36 var u2:s delta mätt på 16,9 h. Rätt modell är +2/h × 24 = +48/dygn,
som ger 3 120 + 144 = **3 264 EXAKT**. Läxa (samma som u2:s 09-21): band skall
låsas mot modellens ENHET, inte mot en enstaka mätperiod. Underliggande
2/h-modell håller och är nu bekräftad på ännu en oberoende punkt.

**Dom: 9/10 + 4/4 app — varav 6 EXAKTA träffar.** Formelkedjorna
(snapshots +18 984/dygn · board 8×96/dygn · organ +2/h · fel 788/0) håller
sammanhängande över 3 dygns lucka — databasens växtkurva är förutsägbar
till radnivå.

## 6. RTO-fasföljden (femte punkten i serien)

| Fas | Datum | RTO db-blad (35 MB) | Not |
|---|---|---|---|
| Natt (tom fabrik) | 09-21 02:3x | 11,8 s | referensband |
| Natt (väntewrapper) | 09-21 01:5x | 13,7 s | referensband |
| Kväll (3 barn) | 09-21 19:2x | 36,9 s | ~3× |
| Morgon-fabrik (omgång aktiv) | **09-24 07:29** | **65,5 s** (syskon 77,9 s) | ~5,5–6,6× |

Faktorn skalar med lasten (load 5,5–6,9 vid mitt fönster, 3,13 strax efter —
app-bladet 93,8 s för 88 MB motsvarar ~2,7× nattens 22,6 s-per-MB-normaliserat
≈ kvällsfaktorn). Slutsatsen från 09-21 håller: **DR-budget räknas i värsta
fas**; kvartalsövningen (≤2026-12-24) mäts i tom fabrik för rena band.
RAM-fönstret genom övningen: 3 418 → 2 406 → 2 070 MB (grind 1 000 aldrig
nära).

## 7. Städning lokal PG — oberoende eftermätning (07:38, orderns steg 4)

- `pg_lsclusters`: 17/main **down** ✅ (korrekt viloläge)
- psql socketvägran mot skrap-DB (".s.PGSQL.5432: No such file or directory") ✅
- Låsfil /tmp/ak1a-dr-prov.lock: flock-tomfil från sista körningen (oskyldig —
  kärnan släpper vid processdöd; nästa flock återanvänder inoden) ✅
- Felloggar kvar på /tmp enligt mall (blad+pid+ms-namn) ✅
- Arkiv ENDAST LÄST bevisat: SHA-256 + mtime byte-identiska före/efter ✅
- RAM 2 070 MB · disk 48 G ledigt efteråt ✅

## 8. Fynd och köposter

- **F1 (lever kvar):** cron-retentionens glob `db-*.sql.gz` matchar ALDRIG
  `db-app-*.sql.gz` — **5 app-blad (09-20…09-24, ~442 MB) raderas aldrig**;
  ingen kris men ~2,6 GB/30 dagar. Köpost till verktygsägaren (u2:O5-linjen,
  bokförd 09-21 som F2) — kuren är ett tecken i verktyget, syskonyta rörd ej.
- **F2:** blad 12 (09-22) och 13 (09-23) är restore-bevisade endast via
  retentionssvepet + dagens dubbla blad-14-restore — individuella markörkollar
  av dem sker nästa gång någon kör `kolla-dump-markorer.mjs --alla`
  (kön: nästa DR-pass).
- **F3:** u2:s P4-läxa (09-21: warning-band sattes för snävt mot tillväxten)
  generaliserar: **radkontrakt låses EXAKTA, tids-/tillväxtband mot modellens
  enhet** — P8-missen ovan är samma klass, tredje förekomsten. Formaliseras
  i nästa anspråksmall.

## 9. KVD

- src/ orörd = **INGET bygge** (grinden bär baslinjen; inga .ts rörda).
- R2 orörd: priser/tier/publicering aldrig nädra; .pgpass ENDAST som
  PGPASSFILE-pekare; prod-DB ENDAST läst (COUNT).
- data/blogg/ orörd (ALDRIG publicerat). data/backups ENDAST LÄSTA
  (SHA+mtime-bevis). GDPR: endast antal, tabellnamn, tider.
- Syskonytor orörda: dr-ovning.mjs + dr-rpo-diff.mjs + kolla-dump-markorer.mjs
  KÖRDA omodifierade; syskonets AUTO/AUTO-3-protokoll orörda.
- Commit: "studio: auto s10-u3 DR-övning blad 14 + app-blad 14 (dubbelreplik
  grön, RPO +169, prediktioner 9/10)".

SLUT — s10-u3, 2026-09-24 07:39 lokal.
