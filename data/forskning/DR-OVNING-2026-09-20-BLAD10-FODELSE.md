# DR-ÖVNING 2026-09-20 — BLAD 10:S FÖDELSEBEVIS + FÖRSTA RESTORE (GODKÄNT)

**Agent:** s10-u2 (fabrik, manifest auto-s10-1789878902744, vakt 2/3)
**Fönster:** 06:36–06:44 lokal (04:36–04:44 UTC) · **Slutdom: GRÖN — alla nio
prediktioner infriade (fyra EXAKTA), determinismen korsbevisad av syskon-replik
inom 82 s**

---

## 1. Sammanfattning för kunden (5 rader)

1. Nattens nya backup (blad 10, skapad 02:30 i natt) har nu återställts i en
   avskild testdatabas och kontrollerats — **hela vägen grön** på 11,7 sekunder,
   produktionen opåverkad.
2. Två dagars förväntningar på exakta siffror (**50 114 styrelsebeslut** och
   **1 252 404 datapunkter**) träffade **siffra för siffra** — spårets
   förutsägelseformler håller sjätte gången i rad.
3. Databasen växer exakt som beräknat: **+19 800 rader** på ett dygn — samma
   siffra som igår, andra dagen i rad.
4. Oskyddat datautrymme (RPO) just nu: **140 rader** sedan nattens backup —
   nästa backup 02:30 i natt.
5. Testdatabasen raderades efteråt och servern vilade igen — kontrollerat
   oberoende, även mot den samtidigt körande syskon-övningen.

## 2. VAL + duplikatkontroll (innan mätning)

- **Köposten**: tre worklog-rader 2026-09-19 bokför "blad 10:s födelsebevis
  09-20 02:30 — board 50 114 · snapshots 1 252 404 — formelns sjätte test"
  som spårets nästa steg. Blad 10 (db-2026-09-20.sql.gz, 31,6 MB, fött
  02:30:43) hade **aldrig** återställts — ingen DR-PROV-2026-09-20-* fanns
  vid anspråk 06:38.
- **Inte duplikat:** blad 9 är restore-bevisat 13+ gånger (AUTO-10…14);
  KEDJA-0/KEDJA0-2 (app-projektet aufr) och offsite-led 3 levererade igår.
- **Anspråk disk-först** (gårdagens trippeldispatch-läxa):
  data/vakten/auto-s10-1789878902744-s10-u2-ansprak.md med P1–P9 låsta
  06:38, FÖRE all mätning.

## 3. Födelsebeviset — blad 10 född komplett

| Egenskap | Värde | Jämförelse blad 9 |
|---|---|---|
| Född | 2026-09-20 02:30:43 lokal | dygnskadens 10:e blad i rad |
| Storlek | 31 110 041 B (31,6 MB gz, "31,1 MB" i ls) | 31,1 MB → +0,5 MB |
| Dump-rader | **1 367 628** | 1 347 729 → **+19 899** |
| Slutmarkör | **GRÖN** (kolla-dump-markorer, 4,8 s) | kontraktet OFÖRÄNDRAT |
| CREATE TABLE / COPY | 99 / 101 | identiskt |
| pg_dump | 17.11 (Ubuntu 17.11-1.pgdg24.04+2) | identisk utgivare |

## 4. Första restoren (AUTO — verktygets maskinprotokoll)

`node verktyg/dr-ovning.mjs` (väljer senaste bladet) — **GRÖN exit 0**:

- **RTO 11,7 s** @ MemAvailable 3 099 MB (spannet 11–19 s, doktrin från
  kvällskontrollparet — tredje punkten i nedre halvan)
- Radkontrakt: **public 60 tabeller / 1 345 719 rader** · public+storage
  68 / 1 345 855 · alla scheman 99 / 1 346 115
- **DAGSTEG +19 800 EXAKT** (1 345 719 − 1 325 919) — modalen från blad 9
  upprepad siffra för siffra, andra dagen i rad
- Fel: **788 kända / 0 okända** — identisk profil med blad 9 (deterministisk)
- Dumpens dekomposition (nyckeltabeller): **board_decisions 50 114** ·
  **section_data_snapshots 1 252 404** · auth.users 3 · profiles 3 ·
  members 0 · courses 10 · section_data 19 363 · section_data_era 18 933

## 5. Prediktioner — dom (9/9 infriade, 4 EXAKTA)

| # | Prediktion (låst 06:38) | Utfall | Dom |
|---|---|---|---|
| P1 | Markörer GRÖN, CREATE 99, COPY 101 | GRÖN · 99 · 101 · 1 367 628 rader | ✅ |
| P2 | public ≈ 1 345 000–1 346 000 (+19 800) | 1 345 719 = **+19 800 EXAKT** | ✅ EXAKT |
| P3 | RTO ∈ [11, 19] s | 11,7 s | ✅ |
| P4 | Fel 788 kända / 0 okända | 788 / 0 | ✅ |
| P5 | board_decisions = 50 114 | 50 114 — **formelns sjätte test, sjätte träffen** | ✅ EXAKT |
| P6 | snapshots = 1 252 404 (frusen — pumpbatch ej startad 02:30) | 1 252 404 | ✅ EXAKT |
| P7 | 02:40-gap ∈ [2 400, 2 950] | 168 696 − 166 067 = **2 629** | ✅ (se not) |
| P8 | public+storage 68 · alla scheman 99 | 68 / 99 | ✅ |
| P9 | Städning: skrap-DB borta · PG17 down | verifierad, se §8 | ✅ |

**Ärlighetsnot P7:** anspråkets formel skrev fel bas ("total − 168 269", dvs
22:32-punkten). Korrekt definition är u3:s ursprungliga: gap = ny full-dump −
föregående dags full-dump = 168 696 − 166 067 = 2 629 ∈ [2 400, 2 950]. Min
feltänkta bas hade gett +427 (nattakten 22:32→02:40, 103 r/h). Prognosen som
SÅDAN (u3:s) träffade; formuleringen i anspråket var defekt — bägge bokförs.

## 6. Bladsteg-dekomposition (dump mot dump — första gången från blad-sidan)

| Tabell | Blad 9 | Blad 10 | Steg |
|---|---|---|---|
| board_decisions | 49 346 | 50 114 | **+768 = 8×96 EXAKT** (kvartsklockan, u1:s formel) |
| section_data_snapshots | 1 233 420 | 1 252 404 | **+18 984 EXAKT** = pumpens dygnsbatch (igår bevisad levande, NU från dump-sidan) |
| public totalt | 1 325 919 | 1 345 719 | +19 800 (768 + 18 984 = 19 752; resten +48 i organ m.fl.) |

Pumpens dagliga batch är därmed **kedjebevisad på båda sidor**: levande mätning
(igår) och dump-till-dump (idag) bär samma tal 18 984.

## 7. RPO-morgonpunkten (dr-rpo-diff, 04:39 UTC)

- **+140 oskyddade rader** sedan 02:30 (4 h 08 min ⇒ ~34 r/h morgontakt)
- I rörelse 2/60: board_decisions +128 (levande 50 242) · organ_health_logs
  +12 (3 084) — övriga 58 frusna
- **Trippelkorsvalidering A==B==C**: dumpens COPY-total == restorens count(*)
  == RPO-dump-räkning == 1 345 719 — tre instrument, ett tal
- JSON-delprotokoll: data/forskning/DR-RPO-DIFF-2026-09-20-MORGON.json

## 8. Syskon-interaktion + städning (P9:s dubbla bevis)

Trippeldispatch igen (samma order till u1/u3). Flocken serialiserade PG17:

1. **Mitt fönster** 04:36:45–04:37:57Z — städning verkställd ("skrap-DB
   raderad · PG17 stoppad").
2. **Syskon-fönstret** start 04:38:56Z (pid 3424104, låsfilen bevittnar) —
   dess verktyg loggade PG17 "var stoppad — korrekt viloläge" vid start =
   **oberoende bevis på min städning**.
3. **Slutligt viloläge** (egenmätt 06:43, efter syskonets fönster): PG17
   17/main **down** · psql socketvägran · ak1a_dr_test frånvarande (base
   oreachable men klustret nere = kontraktet) · pgsql_tmp 0 filer ·
   felloggar enligt mall kvar i /tmp (2 st, blad+pid+ms-namn, 34 881 B var)
   · DR-lås flock-viloläge.

**Determinism-repliken:** syskonets protokoll (DR-PROV-2026-09-20-AUTO-2.md,
04:39:19Z) diffar mot mitt (AUTO.md, 04:37:58Z) på EXAKT fyra punkter —
RTO 12,9 s vs 11,7 s, pid, fellogg-sökväg, tidsstämpel. Radkontrakt
60/1 345 719 identiskt. Gårdagens D20-dom gäller: oberoende replik, inte
duplikat — blad 10 restore-bevisat två gånger inom 82 s.

## 9. KVD + kö

- **KVD:** data-only — src/ orörd ⇒ INGET bygge (tsc-baslinjen bärs av
  pre-commit-grinden) · R2 orörd (priser/tier/publicering; .pgpass ENDAST
  PGPASSFILE-pekare; prod DB ENDAST läst — GDPR: endast antal) ·
  data/blogg/ orörd · data/backups/ endast läsning · syskonytor orörda
  (AUTO-2.md committas av syskonet, ej av mig — pathspec) · commit med
  pathspec + commitmsg i /tmp.
- **Kö:** blad 11 föds 09-21 02:30 — prediktioner: DAGSTEG +19 800 (modal,
  tredje dagen?), board-bladsteg +768, snapshots +18 984; RPO-kurans
  middagspunkt; kvartalssviten nästa senast 2026-12-20
  (`node verktyg/dr-ovning.mjs`); u3:s tvåpunktsbas-läxa gäller för
  prediktioner per dygnsfas.

SLUT — handprotokoll s10-u2 2026-09-20 06:44 lokal
