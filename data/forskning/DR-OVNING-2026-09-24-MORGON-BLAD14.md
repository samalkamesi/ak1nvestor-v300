# DR-ÖVNING 2026-09-24 MORGEN — BLAD 14 (db-2026-09-24.sql.gz) — GRÖN

**Agent:** s10-u2 (manifest auto-s10-1790225128873, vakt 2/3) · **Körd:** 07:29–07:33 lokal (05:29–05:33Z)
**Order:** DR-övning nästa i spåret — återställ, mät tid/rader, protokoll, städa lokal PG.
**Anspråk disk-först:** `data/vakten/auto-s10-1790225128873-s10-u2-ansprak.md` (P1–P10 låsta FÖRE mätning).

## 1. Sammanfattning för kunden (5 rader)

1. Vi återställde **hela databasen från nattens backup** (född 02:31 i morse) i en
   avskild testdatabas på servern — **77,9 sekunder** — och raderade
   testdatabasen igen. Produktionen påverkades inte.
2. Kontrollen: **60 publika tabeller och 1 424 981 rader** kom tillbaka — alla
   nyckeltal matchade morgonens prognoser med hundradedelar (största tabellen
   och beslutstabellen EXAKT på siffran).
3. Skulle molnet dö just nu skulle vi förlora **169 rader** (styrelsens
   beslutslogg och organhälsan — maskinens egen puls, inga kunddata) — nästa
   backup föds 02:30 i natt.
4. Återställningstiden var dagens längsta i serien (morgonens högsta belastning
   på servern) — katastrofplanen kräver därför fortfarande ett lugnt fönster för
   den formella kvartalsövningen, vilket är dokumenterat.
5. Tre dagars outage i övningsserien (09-21 → 09-24) är härmed bruten; serien
   är daglig igen och protokollet är maskinellt + handgranskat.

## 2. VAL och duplikatkontroll

Senaste kedja-1-restore var **blad 11** (09-21 kväll, förra omgångens s10-u2).
Blad 12 (09-22), 13 (09-23) och 14 (09-24) låg på disk med gröna markörer men
**utan restore-bevis** — data/forskning saknar DR-OVNING/DR-PROV för 09-22/23/24.
Valet: **färskaste bladet (blad 14) med trädets kanoniska verktyg** —
`node verktyg/dr-ovning.mjs` OMODIFIERAT (senaste blad väljs av verktyget) —
plus RPO-diff mot levande prod (`dr-rpo-diff.mjs`, PGPASSFILE-pekare).

## 3. Körning (verktygets utdata)

| Steg | Resultat |
|---|---|
| Grind | MemAvailable 3 081 MB · 48 GB disk — OK |
| 0. Lås | flock på /tmp/ak1a-dr-prov.lock (väntade ej — viloläge) |
| 1. Markörkontroll | **GRÖN** · 1 447 286 COPY-rader · CREATE 99 · COPY 101 · pg_dump 17.11 (37,0 s) |
| 2. PG17 | startad av verktyget (låg stoppad — korrekt viloläge) |
| 3. Skrap-DB | ak1a_dr_test skapad färsk |
| 4. **Restore (RTO)** | **77,9 s** (33,3 MB gz) · felrader 788 (kända 788 / okända 0) |
| 5. Mätning | public **60 / 1 424 981** · +storage 68 / 1 425 117 · alla scheman 99 / 1 425 377 |
| 6. Protokoll | data/forskning/DR-PROV-2026-09-24-AUTO.md (maskinellt) |
| 7. Städning | skrap-DB raderad · PG17 stoppad |

Exit 0 = GRÖN.

## 4. Mätning — nyckeltabeller (med 3-dygnsprognoser från blad 11)

| Tabell | Blad 11 (09-21) | Blad 14 (09-24) | Steg/3 dygn | Prognos | Dom |
|---|---|---|---|---|---|
| public.total | 1 365 519 | 1 424 981 | +59 462 (+19 821/d) | 1 424 919 | ✅ 62 rader ifrån (0,004 %) |
| section_data_snapshots | 1 271 388 | 1 328 340 | +56 952 | 1 328 340 | ✅ **PUNKT EXAKT** (3×18 984) |
| board_decisions | 50 882 | 53 186 | +2 304 | 53 186 | ✅ **PUNKT EXAKT** (3×768 = 8×96/dygn) |
| organ_health_logs | 3 120 | 3 264 | +144 | 3 264 (i band) | ✅ (3×48/dygn) |
| section_data | 19 363 | (protokoll AUTO) | — | — | stilla enligt RPO-diff |
| restore-fel (kända/okända) | 788/0 | 788/0 | 0 | 788/0 | ✅ **EXAKT** |

## 5. RPO-diff — blad 14 (02:31) vs levande prod (07:32:49Z)

- **Total: +169 rader oskyddade** (1 424 981 → 1 425 150) på 5,03 h = **33,6 r/h**
  — rkaq-maskinuniversumet (~32–36 r/h, fas-oberoende) tredje oberoende punkten.
- board_decisions +160 (= 1,67 burstar à 96 — burstmodellen 8/dygn håller) ·
  organ_health_logs +9 · **snapshots +0** (ingen pumpbatch — fönstret ≥15 h håller,
  batchen landade före 02:30 som väntat).
- JSON-delprotokoll: `data/forskning/DR-RPO-DIFF-2026-09-24-MORGON.json`.

## 6. Prediktionsdom — 9/10, varav 5 PUNKT-EXAKTA (seriens starkaste radkontrakt)

| P | Förutsägelse | Utfall | Dom |
|---|---|---|---|
| P1 | Markör GRÖN CREATE 99 · COPY 101 | EXAKT | ✅ |
| P2 | public 60 tabeller | 60 | ✅ EXAKT |
| P3 | public ∈ [1 420 000, 1 430 000] (punkt 1 424 919) | 1 424 981 | ✅ (punkt −62 rader) |
| P4 | snapshots ∈ [1 322 000, 1 334 000] (punkt 1 328 340) | 1 328 340 | ✅ **EXAKT** |
| P5 | board ∈ [52 000, 54 500] (punkt 53 186) | 53 186 | ✅ **EXAKT** |
| P6 | organ ∈ [3 220, 3 330] | 3 264 | ✅ |
| P7 | RTO ∈ [25, 60] s (belastad fas ~3×) | **77,9 s** | ❌ — se Fynd F1 |
| P8 | Fel 788 kända / 0 okända | 788/0 | ✅ EXAKT |
| P9 | RPO ∈ [+100, +1 200] | +169 | ✅ |
| P10 | Städning grön (oberoende eftermät) | grön | ✅ |

## 7. Fynd

- **F1 (bärande) — RTO-fasfaktorns nya extrempunkt 6,6×:** 77,9 s mot nattbandet
  11,5–15 s. Serien: 11,8 s (natt 09-21, tom fabrik) → 36,9 s (kväll 09-21,
  ~3×) → **77,9 s (morgontopp 09-24, load 7,29 vid start + fabrikens omgång
  auto-s10 i full drift)**. Även markörkollen tog 37,0 s (natt ~12 s) —
  helheten pekar på CPU/IO-konkurrens, inte arkivskada (kontrakten EXAKTA,
  fel 788/0 identiska). **Konsekvens:** kvartalsövningens F1-regel (≤2026-12-24
  i TOM fabrik) belagas från tredje håll och skärps: RTO-mätning för protokoll
  ska ske i lugnt fönster; DR-budget i värsta fas ≈ 78 s @ 1,42 M rader —
  fortfarande väl inom ramen (mallen 20 s @ 1,19 M gäller lugnt fönster).
- **F2 — övningsgapet 09-21 → 09-24 brutet:** blad 14 (färskaste) är nu
  restore-bevisat. Blad 12–13 bar aldrig restore-bevis och bärs av gröna
  markörer + retention (restore-bevis är färskvara; skulden minskar mekaniskt
  nu när omgången gör serien tät igen — tre dagar var seriens längsta gap
  sedan verktygsgodkännandet 09-15).
- **F3 — flock-serialisering i realtid, andra gången:** mitt fönster stängde
  ~05:31:5xZ; syskonet (pid 2879420, samma omgång) tog flock 05:33:30Z =
  ~90 s senare. Deras pågående fönster och städning är deras ansvar — min
  eftermätning (05:33:31Z) träffade gapet: PG17 fortfarande down, deras
  markörkoll på väg. Tidsstämplar protokollförda i båda led.
- **F4 — determinismen:** fyra punkt-exakta radkontrakt samma morgon
  (snapshots · board · organ-modell · fel-loggen) — pumpens batchstorlek
  (18 984/dygn), burstmodellen (8×96) och felkatalogen (788) är stabila
  tredje–fjärde dagen. Public-totalen 62 rader ifrån på 1,42 M = 0,004 %.

## 8. Städning lokal PG (orderns steg 4 — oberoende eftermät 07:33:31)

- `pg_lsclusters`: 17/main **down** ✅
- psql mot ak1a_dr_test: **socketvägran** (No such file or directory) ✅
- DR-lås: flock-viloläge — syskonets aktiva fönster (se F3), ej mitt ✅
- Min fellogg bevarad: `/tmp/dr-ovning-fel-blad-2026-09-24-p2874378-1790227831349.log` (34 881 B)
- Resurser efter: RAM 3 347 MB tillgängligt · load 3,87 (sjunkande) · disk 48 G ledigt

## 9. KVD

- **src/ orörd = INGET bygge** — ingen kod ändrad; dr-ovning.mjs + dr-rpo-diff.mjs
  KÖRDA omodifierade (verktygen är .mjs i verktyg/, utanför tsconfig; tsc-grinden
  validerar committen; baslinje 0 orörd).
- **R2 orörd:** .pgpass ENDAST PGPASSFILE-pekare (lösenord aldrig inläst i
  process) · prod-DB ENDAST läst (COUNT) · priser/tier/publicering orörda.
- **data/blogg/ orörd** (inget publicerat).
- **data/backups ENDAST LÄSTA:** blad 14 mtime+storlek identiska före/efter
  (34 948 818 B · 02:31).
- **Syskonytor orörda:** trädets verktyg omodifierade; syskonets pågående
  DR-fönster (05:33:30Z–) ej stört.
- **GDPR:** endast antal rader, tabellnamn och tider — inga personvärden.

## 10. Kö vidare

- Blad 15:s födelsebevis 09-25 02:30 — prognos: public ≈ 1 444 800 (+19 821/d) ·
  snapshots ≈ 1 347 324 (om batch landar) · board ≈ 53 954 (8×96) · organ ≈ 3 312.
- Syskonen u1/u3:s övningar i samma omgång (pågår vid skrivandet).
- Kvartalsövning **senast 2026-12-24** i TOM fabrik (F1-regeln, nu belagd 6,6×).
- Översättnings-stillastående (146 190 sedan 09-17): definitiv dom 10-01.

SLUT — handprotokoll av s10-u2 (auto-s10-1790225128873) 2026-09-24.
