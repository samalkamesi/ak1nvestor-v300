# DR-FÖDELSEBEVIS 2026-09-18 NATT — blad 8 bevisat i sin födelsetimme + RPO-kurvans yngsta punkt + lokal PG städverifierad (s10-u2, manifest auto-s10-1789692929837 2/3)

**Uppdrag (fabriksmanifest spår 10 vakt):** "DR-övning nästa i spåret (välj
själv): återställ, mät tid/rader, protokoll, städa lokal PG."

## 1. Objektval + duplikatkontroll

Före start kontrollerades samtliga DR-protokoll i data/forskning/ (72+
DR-*.md/json), DRIFTSBOKEN:s DR-avsnitt och worklog mot disk. Läget efter
gångrdagens fem kvällsleveranser (u1 TOTAL · u2 KVÄLLS-DR · u3 KEDJA-3,
alla 2026-09-17 21:0x–21:2x): restore-kärnan levererad 18+ gånger,
fönsterdjup + mitt-blad + alla sju bladen 09-11→09-16 bevisade, total-
mallen GRÖN i tre dagsskiften, RPO-dygnskurvan med fyra ben (natt ·
morgon · middag · kväll), WAL-serien 497×3 → 529 MB.

**Det icke-levererade objektet var blad 8:** `db-2026-09-18.sql.gz`, fött
av 02:30-cronen 28 minuter före min start (02:30:40.735, 32 192 241 B).
Födelsebeviset är sedan i går STÅENDE VAKTPRAKTIS ("varje blad restore-
bevisas sin födelsedag i första dagsronden") — men SERIENS SNABBASTE
födelsebevis hittills var ~5 h (s10-u1 O8, 07:38 mot 02:30-blad).
**Nattfönstret var aldrig bevisat:** inget blad hade någonsin bevisats
inom sin födelsetimme. Tre vinklar valdes: (1) **födelsetimmes-beviset**
(blad 8 restore-bevisat ~28 min efter födelse — nytt rekord), (2) **RPO-
kurvans yngsta punkt** (alla tidigare punkter mätte ackumulerade timmar;
den här mäter fönstret 02:30→02:58 ISOLERAT — första direkta mätningen av
efter-dump-lugnet), (3) **WAL-seriens första stabilitetspunkt efter
restore-aktivitet** (igår kväll växte 497→529; Hypotes: restores växer
inte WAL — återanvändningsbuffert).

## 2. Körningen + race-bokföring (ärlighetsdoktrin)

- **RAM-grinden GRÖN direkt**: 1 293 MB tillgängligt vid start, 71 GB
  disk — ingen omkörningsslinga behövdes (trots tre parallella syskon i
  manifestet; nattens fönster är fabrikens lugnaste).
- **RACE mot syskon (fjärde flock-racet i spåret):** under mitt protokoll-
  skrivande landade `DR-PROV-2026-09-18-AUTO-2.md` (pid 1872083, RTO
  10,2 s, slut 2026-09-18T00:58:55.874Z) bredvid min AUTO (pid 1871957,
  RTO 10,9 s, slut 00:58:37.828Z) — ett syskon (u1 eller u3; verktyget
  skriver statisk malltext) valde SAMMA nyfödda blad och körde sin övning
  18 s efter min genom flock-kön. **Flock-kontraktet höll återigen: två
  agenter, ett lås, PG17-fönstret ägt av en i taget, noll förlorat
  arbete.** SYSKONETS RTO 10,2 s är **NYTT SERIEMINIMUM** (tidigare
  spann 10,3–23,9 s); divideringen av förstahandsleveranser: restore-
  kärnan delad (symmetriskt bokförd, se repliken nedan), RPO-punkten på
  blad 8 + WAL/städ-mätningarna + detta protokoll är mina. Syskonets
  AUTO-2 lämnas orörd för deras egen commit (CLOBBER-notis-regeln: främ-
  mande okommittat arbete återställs ALDRRIG).
- **Replikkorsbevis (tredje i spåret):** två oberoende agenter, två
  restores, samma blad — IDENTISKA radtal på alla tre nivåerna (public
  1 306 119 · +storage 1 306 255 · samtliga 99/1 306 515) och identisk
  per-tabellbild (48 578 board_decisions · 122 course_modules · 10
  courses · 3 profiles …). Enda skillnaden i protokollen: pid + RTO.

## 3. Födelsebeviset — siffror (blad 8, db-2026-09-18.sql.gz)

Körning: `node verktyg/dr-ovning.mjs --fil data/backups/supabase/db-2026-09-18.sql.gz`
— GRÖN exit 0, hela familjekontraktet intakt (flock, RAM-grind,
dumpförkontroll, färsk skrap-DB, RTO-mätning, tre nivåer, finally-städning).

| Kontrakt | Värde |
|---|---|
| Född / bevisad | 02:30:40.735 lokal / 02:58:37 — **födelsebevis på 28,0 min (SERIEREKORD, första i födelsetimmen)** |
| Slutmarkörer (kolla-dump-markorer) | **GRÖN — 1 327 830 rader · CREATE TABLE 99 · COPY 101** (4,6 s) |
| RTO (restore) | **10,9 s** (30.7 MB gz) — syskonets replik 10,2 s |
| Felrader | **788 kända / 0 okända** → /tmp/dr-ovning-fel-2026-09-18.log (34 881 B, storleksklassen stabil) |
| public | **60 tabeller / 1 306 119 rader** |
| public+storage | 68 / 1 306 255 |
| alla scheman | 99 / 1 306 515 |
| Städning | skrap-DB raderad · PG17 stoppad (ägarverifierad, se §5) |

**Trekantigt korsbevis på blad 8:** restore-COUNT (min körning) ==
restore-COUNT (syskonets oberoende körning) == dump-COPY-total
(dr-rpo-diff: 1 306 119) — och markörtotalen 1 327 830 täcker de 39
icke-public blocken.

**RTO-serien** förlängs med punkterna 18–19: … · 10,3 · 12,1 · 12,4 ·
**10,9 (denna) · 10,2 (syskonet)** — syskonets 10,2 s är nytt minimum;
**18 av 19 punkter under v98 F3:s referens 20,0 s** (undantaget: dag-
punkten 23,9 s under tung last 09-16).

**FÖDELSEDAGSTILLVÄXTEN, steg 6:** blad-till-blad 1 286 328 → 1 306 119
= **+19 791** — serien 19 805 · 19 797 · 19 797 · 19 800 · 19 800 ·
**19 791**: den konstanta dagstakten håller en sjätte dag (markör-
nivån: 1 307 940 → 1 327 830 = +19 890). Blade 8 är dagens fyra miljoner
tecken stora växande organiska databas i linje.

## 4. RPO-kurvans yngsta punkt — nattlugnet DIREKT mätt

`PGPASSFILE=~/.pgpass node verktyg/dr-rpo-diff.mjs --fil
data/backups/supabase/db-2026-09-18.sql.gz --json
data/forskning/DR-RPO-DIFF-2026-09-18-NATT-BLAD8.json` — exit 0;
mätfönster 02:58:47→~02:59 lokal, **bladålder 28 min** (alla tidigare
punkter: 5,2–23 h ackumulerat). PGPASSFILE-pekare endast — lösenordet
lästes ALDRIG av agenten (R2).

- Bladets total: 1 306 119 (dump-COPY) · Levande: **1 306 136** ·
  **RPO-delta +17 rader på 28 min ≈ 36 r/h**.
- 2 av 60 tabeller i rörelse: organ_health_logs +9 (2 976→2 985) ·
  board_decisions +8 (48 578→48 586) — organismens pulsbänk + styrelsens
  kvartsklocka, exakt de två drivare som morgonpunkten identifierade.
- **snapshots +0** — dagmaskinens huvuddrivare sover, bekräftat nu även
  på den isolerade 02:30–02:58-remsan.
- Inga negativa delta, inga tabeller tillkomna/borttappade (schema stabilt).

**Dygnskurvan har fem ben och den här är den renaste:** natt 01:49 ≈ 34
r/h (23 h ackumulerat) · morgon 07:39 ≈ 32 r/h · dag 13:4x ≈ 1 730 r/h ·
kväll 21:09 ≈ (pump-noll bevisad) · **02:58 ≈ 36 r/h DIREKT mätt i
efter-dump-fönstret**. Tolkning: nattlugnet är inte en rest av går-
dagens avtagande utan ett stabilt planå ~32–36 r/h som håller hela
02:30→07:40 — DR-fönstrets exponering är fortfarande ≈ noll, nu mätbart
från bladets första minut.

## 5. Städa lokal PG — egenmätt, oberoende av verktygens självrapport

| Kontroll | Mätvärde | Dom |
|---|---|---|
| Kluster | `pg_lsclusters`: 17 main 5432 **down** | viloläge korrekt ✓ |
| Databaskatalog `base/` | ENDAST OID 1/4/5 (template1/template0/postgres) + tom `pgsql_tmp/` | **NOLL skrap-svansdatabaser** efter två restores ✓ |
| **WAL `pg_wal/`** | **529 MB — OFÖRÄNDRAD efter två natt-restores** (serien: 497×3 → 529 → **529**) | **STABILITETSBEVIS**: igår kvälls växt 497→529 kom av dagens skrivsessioner, inte av restore-läsning; loggens shutdown-checkpoint "0 WAL added/removed/recycled; estimate 224 669 kB" — långt under 1 GB-taket ✓ |
| PG-loggen (sista rader) | "checkpoint complete: wrote 1 buffers … database system is shut down" 02:58:55 | ren avstängning efter syskonets fönster ✓ (läst via sudo -n, ägaren postgres) |
| /tmp-spår | dr-ovning-fel-{09-15…09-18}.log (34–35 KB/st) | dokumenterad spårbarhet enligt mall ✓ |
| Bladkatalog | **8 blad** (09-11→09-18), inga dummyfiler | ✓ — **retentionens beteendepunkt 2: äldsta bladet (09-11, 7 dygn) överlevde ytterligare en natt** — ingen beskärning vid 8 blad, förenligt med 30-dagarskontraktet |
| Låsfil | flock lämnar tom fil + pid-rad | dokumenterat oskyldigt ✓ |
| Disk | 72 GB ledigt (26 % använt) | ✓ |

**DOM: lokal PG fullständigt städad + i viloläge — egenmätt.**

## 6. KVD + gränser

- src/ orörd — inget bygge, inga kodändringar (befintliga verktyg kördes).
  tsc ej aktuellt; baslinjen orörd av konstruktion. INGA R2-ytor: inga
  priser/tier/publicering; inga .env-/nyckelfiler rörda; .pgpass ENDAST
  som PGPASSFILE-pekare (värdet aldrig läst); data/blogg/ orörd.
- Syskonytor orörda: AUTO-2.md läst+refererad, ej modifierad, ej committad
  av mig (deras kvitto); syskonens DRIFTSBOKEN/worklog-rader respekterade.
- GDPR: protokollen redovisar endast antal, tabellnamn, tider, pid —
  inga personvärden.

## 7. Spårbarhet + kö

- Maskinella delprotokoll: DR-PROV-2026-09-18-AUTO.md (restore, min
  körning) + DR-RPO-DIFF-2026-09-18-NATT-BLAD8.json (60-tabellsdiffen).
  Syskonets replik: DR-PROV-2026-09-18-AUTO-2.md (deras commit).
- DRIFTSBOKEN: sektion S10-U2 nedan.
- Kö: (1) **födelsebevis i födelsetimmen som ny norm** — nattfönstret
  02:30–03:00 är fabriksväckt och fritt (flock + RAM bevisade) — recept:
  första vaktronden efter 02:30 kör dr-ovning på dagens blad (~60 s);
  (2) RPO-kurvan: bind dagmaskinens starttid skarpare (07:44→?) med en
  08:1x-punkt; (3) WAL: nästa kvartalsmätning 2026-12 (stabilitets-
  hypotesen formulerad — restores växer ej WAL); (4) retentionen:
  nästa beteendepunkt när äldsta bladet närmar sig 30 dygn (~2026-10-11).

SLUT — DR-FÖDELSEBEVIS NATT, s10-u2 (fabriksagent, spår 10 vakt,
manifest auto-s10-1789692929837 uppgift 2/3), 2026-09-18 ~02:57–03:0x
lokal (00:57–01:0xZ).
