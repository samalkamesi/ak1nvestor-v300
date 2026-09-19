# DR-ÖVNING 2026-09-19 NATT — FÖDELSEBEVIS BLAD 9 med FÖREREGISTRERADE PREDIKTIONER + OBEROENDE REPLIK

**Agent:** s10-u3 (manifest auto-s10-1789779315763, vakt 3/3) · **Körd:** 2026-09-19
02:56–03:0x lokal · **Dom: GRÖN — alla sex förregistrerade prediktioner infriade.**

## Sammanfattning för kunden (5 rader)

1. Nattens nya backup (född 02:30) återställdes i en avskild testdatabas **29,5
   minuter efter att den skapades** — tredje gången någonsin ett blad återställs
   inom sin födelsetimme (och andra bladet i rad); produktionen opåverkad,
   testdatabasen raderad efteråt.
2. Innan körningen **låste vi förutsägelser om databasens innehåll på disk** —
   radtal per tabell, återställningstid, felfel antal. Alla sex träffade; två
   EXAKT (stortabellen och beslutsklockan, till raden).
3. Tillväxten sedan gårdagen: exakt +18 984 rader i stortabellen (08:00-batchen,
   tredje dagen i rad) och exakt +768 i beslutstabellen (en rad var femtonde
   minut, dygnet runt) — databasen beter sig deterministiskt, vilket är det
   starkaste integritetsbeviset en backup kan få.
4. Två agenter återställde samma blad oberoende av varandra (12,1 s och 12,2 s)
   och fick identiska tal på alla nivåer — fem instrument, noll avvikelse.
5. Nästa födelsebevis: 2026-09-20 02:30; kvartals-TOTAL senast 2026-12-19.

## 1. Objektval och duplikatkontroll

- Köposten "nästa födelsebevis 09-19 02:30" (s10-u1 DAGPULS + s10-u2 natt) var
  spårets uttryckliga nästa steg; `data/forskning/` hade 09-19-träffar = 0 vid
  anspråk 02:56 (anspråksfil disk-först:
  `data/vakten/auto-s10-1789779315763-s10-u3-ansprak.md`).
- Syskon i SAMMA manifest (u1/u2, identiska "välj själv"-uppdrag) hade inga
  anspråk vid tillfället; under mitt mätfönster körde ett syskon samma övning
  (deras `DR-PROV-2026-09-19-AUTO.md` 02:58 + `DR-RPO-DIFF-…NATT-BLAD9.json`)
  — se §5 kollisionsbokföring. Utfall: INTE duplikat utan oberoende replik
  (femte instrument-overlap), men valet av objekt konvergerade — läxa till §7.

## 2. Förregistrerade prediktioner (låsta på disk FÖRE körningen)

Bas: blad 8 (db-2026-09-18) mätt DIREKT på dumpen med zcat + COPY-radräkning
(`verktyg/_s10u3-blad8-bas.mjs`, 1 s): public 1 306 119 · section_data_snapshots
1 214 436 · board_decisions 48 578 · organ_health_logs 2 976 — vart och ett
konsistent med tidigare instrument (48 578 == s10-u1:s köpostprediktion för
blad 8; 1 214 436 == 09-17:s livemätning).

Prediktioner låsta 02:59 i `DR-PREDIKTION-2026-09-19-NATT-BLAD9.json` (FÖRE min
restore 02:59:34; syskonets protokoll lästes EJ förrän efter egen körning):

| # | Prediktion | Låst värde | Mätt (min restore) | Dom |
|---|---|---|---|---|
| 1 | publicTotal blad 9 | 1 325 910 ± 25 | **1 325 919** | TRÄFF (+9) |
| 2 | section_data_snapshots | 1 233 420 EXAKT | **1 233 420** | TRÄFF EXAKT |
| 3 | board_decisions | 49 346 EXAKT | **49 346** | TRÄFF EXAKT |
| 4 | RTO | 10–18 s | **12,2 s** | TRÄFF |
| 5 | fel kända/okända | 788/0 | **788/0** | TRÄFF |
| 6 | tabeller pub/+stor/alla | 60/68/99 | **60/68/99** | TRÄFF |

Dagstegsserien utökad: 19 805 · 19 797 · 19 797 · 19 800 · 19 800 · 19 791 ·
**19 800** (blad 9) — prognosen +19 791 var 9 rader lågt; +19 800 är seriens
modalvärde. Dekomposition EXAKT: snapshots +18 984 (pump-noll, dag 3) ·
board +768 (kvartsklockan, dag 3) · organ +48 · övriga +0.

## 3. Körningen (verktygets kontrakt)

`node verktyg/dr-ovning.mjs` (default = senaste dump = db-2026-09-19.sql.gz,
32 651 605 B, född 02:30:36 lokal):

| Steg | Resultat |
|---|---|
| Grind | MemAvailable 1 277 MB · 68 GB disk — GRÖN |
| Markörkoll | GRÖN — 1 347 729 rader · CREATE 99 · COPY 101 (4,7 s) |
| Lås | flock /tmp/ak1a-dr-prov.lock (pid 2561647) — kö bakom syskonet, 0 väntan |
| Restore | **RTO 12,2 s** · fel 788 kända / 0 okända |
| Mätning | public 60/1 325 919 · +storage 68/1 326 055 · alla 99/1 326 315 |
| Städning | skrap-DB raderad · PG17 stoppad · protokoll DR-PROV-2026-09-19-AUTO-2.md |
| Exit | **0 — GRÖN** |

Födelsetimmen: restore startad 02:59:34 lokal = 29,0 min efter födelsen,
slut ~29,5 min — **inom födelsetimmen** (fönster till 03:30:36). Seriens
födelsebevis: 28,0 min (s10-u2, blad 8) → 27,8 min (s10-u2, blad 9, deras
körning 02:58 — nytt serierekord) → 29,5 min (detta, andraplats) — timmen
höll för BÅDA blad 9-körningarna; tredje födelsebeviset i rad inom timmen.

## 4. Fem instrument, samma tal (blad 9)

| Instrument | publicTotal | snapshots | board |
|---|---|---|---|
| 1. Syskonets restore (02:58) | 1 325 919 | 1 233 420 | 49 346 |
| 2. Min restore (02:59, AUTO-2) | 1 325 919 | 1 233 420 | 49 346 |
| 3. Syskonets RPO-dumpTotal (00:58:51Z) | 1 325 919 | — | 49 346 |
| 4. Min zcat-räkning direkt på dumpen | 1 325 919 | 1 233 420 | 49 346 |
| 5. Prediktionsmodellen (blad 8 + dagsteg) | 1 325 910 ±25 | 1 233 420 | 49 346 |

RPO-punkten (syskonets, läst i efterhand): live 1 325 927 vs dump 1 325 919 =
**+8 på 28 min** = exakt ETT kvartsbatch-steg (02:45-batchen efter 02:30:36) —
kvartsklockans fjärde oberoende bevis; blad 9:s nattfönster exponerar ~8 rader.

## 5. Kollisionsbokförning (syskon i samma manifest)

- flock: syskonets restore (pid 2561130) höll låset; min körning köade ~0 s
  (deras städning klar 02:58:26, min markörkoll 02:59:34) — serialiseringen
  fungerade, PG17 ägdes av en agent i taget.
- Felloggar: pid+ms-namnen (s10-u3-kuren 06b12dfa) höll — två skilda filer,
  identiskt innehåll 34 881 B (samma dump → samma 788 kända fel), noll kollision.
- Filer: syskonets `DR-PROV-2026-09-19-AUTO.md` + `DR-RPO-DIFF-…json` är DERAS
  (orörda, committas ej här); mina är `-AUTO-2.md`, `-PREDIKTION-…json`,
  `-REPLIK.md` (denna) — verktygets numrering skiljde dem åt automatiskt.
- Worklog/DRIFTSBOKEN: gemensamma ytor; ADD-FALL-precedensen gäller (bokförs i
  commit om syskonets rader följer med i samma fil).

## 6. Städning — oberoende egenmätt EFTER verktyget

- `pg_lsclusters`: 17/main **down**
- psql mot ak1a_dr_test: kopplingsvägran (socket saknas) = skrap-DB:s frånvaro
  bevisad
- Disk 68 GB ledigt (30 %) · MemAvailable 1 204 MB · låsfil i flock-viloläge
  (medvetet kvarlämnad enligt kontrakt)

## 7. Kö vidare

1. **Födelsebevis 2026-09-20 02:30** — blad 10; prediktioner: snapshots
   1 233 420 + 18 984 = 1 252 404 · board 49 346 + 768 = 50 114 ·
   publicTotal ≈ 1 325 919 + 19 79x.
2. Manifestdesign (huvudagenten): tre identiska "välj själv"-uppdrag i SAMMA
   manifest konvergerar på samma köpost → överväg differentierade etiketter
   (natt/morgon/kväll) i titeln när spåret har EN nästa-punkt.
3. Retentionstriggern ~2026-10-11 · kvartals-TOTAL senast 2026-12-19.

## 8. KVD

- src/ orörd = INGET bygge (tsc-baslinjen bärs av pre-commit-grinden; inga
  kodändringar utanför engångsskript i verktyg/_s10u3-*).
- R2 orörd (priser/tier/publicering ej berörda; .pgpass ej inläst; prod RÖRDES
  ALDRIG — alla mätningar mot lokal skrap-DB och dumpfil på disk).
- data/blogg/ orörd · syskonens ytor orörda · data/backups/ endast lästa.
- GDPR: protokollet redovisar antal, tabellnamn och tider — inga personvärden.

SLUT — agentprotokoll s10-u3 2026-09-19 (maskinella detaljer i
DR-PROV-2026-09-19-AUTO-2.md; prediktioner i DR-PREDIKTION-2026-09-19-NATT-BLAD9.json).
