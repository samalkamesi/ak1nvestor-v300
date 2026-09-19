# DR-ÖVNING 2026-09-19 DAGPULS-KLOCKFORMEL — första dagpunkts-RPO:n: kvartsklockan EXAKT även i dagsljus + pumpens sjunde kvartal + u3:s blad-10-prediktion förhandsverifierad (GODKÄNT)

**Agent:** s10-u1 (manifest auto-s10-1789802729714, vakt 1/3).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG." — alla fyra led EGENMÄTTA.
**Fönster:** 2026-09-19 09:27–09:32 lokal (07:27–07:32Z); anspråk disk-först
09:30 med förhandsregistrerade P1–P10 FÖRE alla mätningar
(data/vakten/auto-s10-1789802729714-u1-ansprak.md).

## 1. Objektval + duplikatkontroll

Worklog:s s10-sektioner, data/forskning/DR-*09-19* (3 st), bladkatalogen,
fabrikens status (0 klara) och syskonens anspråkskatalog (tom 09:27) lästes
FÖRE val. **TAGET (orört):** blad 9:s tre nattliga restorepunkter — födelsebevis
(u2, RTO 12,1 s), repliken (u3, 12,2 s), gryningen (u1, 12,5 s).
**MITT OBJEKT = GRYNINGSPULS §8 köpost (3):** *"dagpunkts-RPO med
klockformeln som prediktor (första fönstret på dagtid där board rör sig
snabbare — prediktera INTE från nattens tal)"*. Tre omätta dimensioner:
(a) formeln board_delta = 8 × kvarsmarkörer var endast bevisad 02:45–03:19
(natt); (b) 08:00-pumpens snapshots-batch dag 7; (c) u3:s blad-10-prediktion
snapshots 1 252 404 — förhandsverifierbar på levande sidan 17 h före blad 10.
Sekundärt: blad 9:s FJÄRDE restorepunkt = första i dagsljus (dagcykeldoktrinen).

## 2. Återställ (dagsljuspunkten, blad 9:s fjärde restore)

`node verktyg/dr-ovning.mjs` — **exit 0 GRÖN** (09:29:34–09:30 lokal).
Grind **1 004 MB** (24 MB från 1 000-grinden — dagtimmar med fabrikstrafik) ·
disk 63 GB · dumpkontroll GRÖN **6,9 s** (1 347 729 rader · CREATE 99 ·
COPY 101 · 31,1 MB) · PG17 startad ur viloläge · färsk skrap-DB ·
**RTO 18,1 s** · fel 788 kända/0 okända · fellogg 34 881 B.
Maskinellt protokoll: **DR-PROV-2026-09-19-AUTO-4.md**.

**RTO-serien blad 9:** 12,1 (natt) · 12,2 (natt) · 12,5 (gryning) ·
**18,1 (dag)** — dagpunkten är seriens HÖGSTA och korrelerar med
RAM-grindens 1 004 MB (nattens punkter mätte 1,2–4,7 GB). Slutsats: RTO är
belastningskänslig; DR-planens budget gäller ~20 s ÄVEN dagtid under last
(18,1 < v98 F3:s 20,0 s men marginalen är 1,9 s, inte 8).

## 3. Mät tid/rader — radkontrakt EXAKT fjärde gången (determinism)

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 60 | 1 325 919 |
| public + storage | 68 | 1 326 055 |
| alla scheman | 99 | 1 326 315 |

Identiskt med samtliga tre nattkörningar — fyra restoreinstrument, samma tal.

## 4. DAGPUNKTS-RPO:n — köpostens kärna (mätning 09:30:29–09:30:35)

`PGPASSFILE=/home/ak1a/.pgpass node verktyg/dr-rpo-diff.mjs --fil
db-2026-09-19.sql.gz --json DR-RPO-DIFF-2026-09-19-DAGPULS.json`
(M = 28 kvarsmarkörer: 02:45…09:30; mätningen 09:30:35, före 09:45):

| Tabell | Dump 02:30 | Levande 09:30 | Δ | Dom |
|---|---|---|---|---|
| board_decisions | 49 346 | 49 570 | **+224 = 8 × 28 EXAKT** | klockan ✓ |
| section_data_snapshots | 1 233 420 | 1 252 404 | **+18 984 EXAKT** | pumpen dag 7 ✓ |
| organ_health_logs | 3 024 | 3 037 | +13 | puls (band ✓) |
| **Totalt (60 tabeller)** | **1 325 919** | **1 345 140** | **+19 221** | 18 984+224+13 EXAKT dekomponerat |

3 av 60 tabeller i rörelse · 0 negativa delta · inga tillkomna/borttappade.

**Tre fynd:**

1. **Kvartsklockan är dagbevisad.** Fönstret 02:30→09:30 spänner 28 kvart
   i dagsljus, inklusive två styrelserond-timmar (06:00 · 09:00) — delta är
   ändå EXAKT 8 × 28. Köpostens hypotes "board rör sig snabbare dagtid" är
   MOTBEVISAD för detta fönster: ronder skriver INTE påslag i
   board_decisions; kadensen är densamma dygnet runt. Konsekvens: blad 10:s
   board-värde vid 09-20 02:30 förutsägs 49 346 + 8 × 96 = **50 114** —
   u3:s prediktion — nu med dagligt stöd.
2. **Pumpens sjunde kvartal i rad:** snapshots +18 984 EXAKT (18 984×7).
   **u3:s blad-10-prediktion (levande snapshots 1 252 404) förhandsverifierad
   17 h före bladets födelse** — första gången en blad-prediktion mäts på
   den levande sidan INNAN dumpen den förutsäger existerar.
3. **RPO-dagkurvan är pumpdominerad:** 98,7 % av dagens oskyddade rader är
   själva snapshots-batchen; klockan +13 organ därtill. Daglig DR-exponering
   kl 09:30 = +19 221 rader ≈ 1,45 % av beståndet — förutsägbar och liten.

## 5. Prediktionernas dom — 9 ✅ (5 EXAKTA) · 1 ❌ (ärlighetstabell)

| # | Prediktion (09:30, FÖRE mätning) | Faktum | Dom |
|---|---|---|---|
| P1 | board = 49 346 + 8×M ⇒ 49 570 (M=28) | 49 570 | ✅ **EXAKT** |
| P2 | snapshots +18 984 ⇒ 1 252 404 | 1 252 404 | ✅ **EXAKT** |
| P3 | organ band +0…+40, punkt +5 | +13 | ✅ band (punkt låg) |
| P4 | totalt band +19 208…+19 260, punkt ≈+19 215 | +19 221 | ✅ band (+6) |
| P5 | 0 negativa · 60 stabila · 3–4 i rörelse | 0 · 60 · 3 | ✅ |
| P6 | RTO 10–18 s, punkt 12–14 | **18,1 s** | **❌ MISS (0,1 över)** |
| P7 | radkontrakt EXAKT fjärde gången | EXAKT | ✅ **EXAKT** |
| P8 | fel 788/0 · 34 881 B | 788/0 · 34 881 B | ✅ **EXAKT** |
| P9 | städning: down · OID 1/4/5 · WAL 481 · 9 blad | allt EXAKT | ✅ **EXAKT** |
| P10 | klockformelns dom på dagtid | EXAKT i 28/28 kvart | ✅ BESVARAD |

**P6:s rotorsak (bokförd):** bandet sattes ur nattserien (12,1–12,5) utan
RAM-villkor. Faktum 18,1 s vid grind 1 004 MB — RTO är en funktion av
belastning, inte klockslag. Läxa kodifierad: framtida RTO-prediktioner
konditioneras på MemAvailable-band (≥2 GB ⇒ 10–14 s; ~1 GB ⇒ 14–20 s).
Gryningsläxan 1 (prediktera från formeln) och 2 (bas ur bladets eget
protokoll) följdes — P1/P2/P7/P8/P9 landade EXAKT.

## 6. Städa lokal PG — oberoende egenmätt (inte verktygets självrapport)

| Kontroll | Mätvärde | Dom |
|---|---|---|
| Kluster | `pg_lsclusters`: 17 main 5432 **down** | viloläge ✓ |
| base/ | ENDAST OID 1/4/5 · pgsql_tmp 0 filer | noll skrap-svansar ✓ |
| WAL pg_wal/ | **481 MB — FJÄRDE punkten på serie-låget** (497×3 → 529×4 → 481×4) | restores växer ej WAL ✓ |
| Låsfil | /tmp/ak1a-dr-prov.lock flock-viloläge (73 B) | kontraktet släppt ✓ |
| /tmp-spår | fel-blad-2026-09-19-p2780038-…log 34 881 B | spårbar, krockimmunt ✓ |
| Bladkatalog | 9 blad (09-11→09-19) | retention orörd ✓ |

**DOM: lokal PG fullständigt städad + i viloläge — egenmätt.**

## 7. KVD + gränser

- src/ orörd — INGET bygge (befintliga nodeverktyg via node-kanalen;
  tsc-baslinjen bärs av pre-commit-grinden).
- INGA R2-ytor: priser/tier/publicering orörda · inga .env/nyckelfiler ·
  .pgpass ENDAST som PGPASSFILE-pekare (värdet aldrig läst) · prod endast
  LÄST (antal + tidsstämplar — GDPR-rent) · data/blogg/ orörd ·
  data/backups/ endast läst.
- Syskonytor orörda (nattens u2/u3-commits lästa, refererade, ej modifierade).
- Commit MED PATHSPEC.

## 8. Spårbarhet + kö vidare

- Maskinella delprotokoll: DR-PROV-2026-09-19-AUTO-4.md (restore) +
  DR-RPO-DIFF-2026-09-19-DAGPULS.json (60-tabellsdiffen). Anspråk med
  P1–P10: data/vakten/auto-s10-1789802729714-u1-ansprak.md.
- **Kö vidare:** (1) blad 10:s födelsebevis 09-20 02:30 — kvartsformelns
  FJÄRDE test: board 50 114 (96 × 8) · snapshots 1 252 404 (nu
  dag-förhandsverifierad); (2) jungurkörseln söndag 09-20 03:20;
  (3) eftermiddags-punkt ~14:xx: mäter klockan mitt i vardagstrafiken
  (högst 8 × 6 = +48 board sedan 09:30); (4) retentionstriggern ~2026-10-11 ·
  bladraderingsprediktion 10-13 02:30; (5) kvartalssviten dr-total +
  dr-pumpvakt + dr-arkivsvep senast 2026-12-17/18.

SLUT — DR-ÖVNING DAGPULS-KLOCKFORMEL, s10-u1 (fabriksagent, spår 10 vakt,
manifest auto-s10-1789802729714 uppgift 1/3), 2026-09-19 09:27–09:32 lokal
(07:27–07:32Z).
