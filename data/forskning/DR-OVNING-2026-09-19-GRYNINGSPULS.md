# DR-ÖVNING 2026-09-19 GRYNINGSPULS — kvarsgränsfönstret besvarar u2:s köpost: tvåleds-RPO-modellen skärpt till klocka + puls (GODKÄNT)

**Agent:** s10-u1 (manifest auto-s10-1789779315763, vakt 1/3).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG." — alla fyra led EGENMÄTTA.
**Fönster:** 2026-09-19 03:07–03:2x lokal (01:07–01:2xZ); anspråk disk-först
03:07 med förhandsregistrerade P1–P10 FÖRE alla mätningar
(data/vakten/auto-s10-1789779315763-u1-ansprak.md).

## 1. Objektval + duplikatkontroll

Worklog:s s10-sektioner, data/forskning/DR-*, bladkatalogen och syskonens
färska anspråk lästes FÖRE val. **TAGET (lämnat orört):** blad 9:s
födelsebevis i födelsetimmen — u2 (restore 02:58, RTO 12,1 s, rekord 27,8
min) och u3 (replik 02:59, RTO 12,2 s, 6/6 prediktioner). **MITT OBJEKT =
u2:s egen köpost nr 1** (FÖDELSEBEVIS §7): *"RPO-modellen tvåled — nästa
natt-punkt bör mäta ett FÖNSTER över kvartsgränser för att skilja golvet
från pulsen."* Ingen tidigare DR-RPO-DIFF har mätt ett realtidsfönster som
spänner en kvartsLANDNING till nästa (09-19-natt: 02:30→03:02, endast
02:45-kvartet). Gryningsfönstret 02:30→03:19 spänner **tre** kvarsmarkörer
(02:45 · 03:00 · 03:15) = spårets första flerkvartsbevis. Sekundärt: blad
9:s tredje restorepunkt (dagcykeldoktrinens gryningspunkt). u3:s
manifestdesign-notis (tre identiska "välj själv" bör differentieras)
földdes: natt-punkterna togs, gryningspunkten + fönstret var lediga.

## 2. Återställ (gryningspunkten, blad 9:s tredje restore)

`node verktyg/dr-ovning.mjs` — **exit 0 GRÖN** (01:18:52–01:19:22Z /
03:18:52–03:19:22 lokal). Grind 4 691 MB · disk 68 GB · dumpkontroll GRÖN
(1 347 729 rader · CREATE TABLE 99 · COPY 101, 5,7 s) · PG17 startad ur
viloläge · färsk skrap-DB · **RTO 12,5 s** · fellogg 788 kända/0 okända,
**34 881 B — byte-identisk med u2:s och u3:s** (deterministisk felbild,
17:e/18:e körningen i rad). Maskinellt protokoll:
**DR-PROV-2026-09-19-AUTO-3.md** (auto-namnet krockfritt bakom syskonen).

**RTO-serien blad 9:** 12,1 (u2 02:58) · 12,2 (u3 02:59) · **12,5 (u1
03:19)** — tre restores på 21 minuter, spann 0,4 s; blad 8:s 12-punktsserie
(10,2–18,2, median 13,7) förlängs med dagcykelns gryningspunkt. 20 av 21
spårpunkter under v98 F3:s referens 20,0 s.

## 3. Mät tid/rader

Radkontrakt vid restore — **EXAKT identiskt tredje gången** (determinism):

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 60 | 1 325 919 |
| public + storage | 68 | 1 326 055 |
| alla scheman | 99 | 1 326 315 |

**Kvarsgränsfönstret** (`dr-rpo-diff.mjs --fil db-2026-09-19 --json
DR-RPO-DIFF-2026-09-19-GRYNINGSPULS.json`, mätning 01:19:41Z):

| Tabell | Dump 02:30 | Levande 03:19 | Δ |
|---|---|---|---|
| board_decisions | 49 346 | 49 370 | **+24 = 3 kvarts × 8 EXAKT** |
| organ_health_logs | 3 024 | 3 025 | **+1** |
| section_data_snapshots | 1 233 420 | 1 233 420 | 0 |
| **Totalt (60 tabeller)** | **1 325 919** | **1 325 944** | **+25** |

2 av 60 tabeller i rörelse · inga negativa delta · inga tillkomna/borttappade
· RPO-exponeringen nattetid förblir ≈ noll (+25 rader på 49 min).

## 4. Prediktionernas dom — 7 ✅ · 2 ❌ · 1 köpost besvarad (ärlighetstabell)

| # | Prediktion (03:07, FÖRE mätning) | Faktum | Dom |
|---|---|---|---|
| P1 | board +16 (två kvarts) ±2 | **+24** | **❌ MISS** |
| P2 | organ 2 976–2 991 | 3 025 (+1 över blad 9:s 3 024) | **❌ MISS** (basfel) |
| P3 | snapshots +0 | +0 | ✅ |
| P4 | totalt +16 (band +8…+31) | +25 | ✅ |
| P5 | inga negativa, 60 stabila | 2/60 i rörelse, 0 negativa | ✅ |
| P6 | RTO 10–18 s | 12,5 s | ✅ |
| P7 | radkontrakt EXAKT | EXAKT | ✅ |
| P8 | fel 788/0 · ~34 881 B | 788/0 · 34 881 B | ✅ EXAKT |
| P9 | PG down · OID 1/4/5 · WAL ~481 | allt EXAKT | ✅ |
| P10 | tvåledsmodellens dom | **BESVARAD, se §5** | ✅ |

**P1:s rotorsak (bokförd, inte bortförklarad):** jag ankrade vid u2:s
mätvärde ("+8 vid 03:02") i stället för att räkna fönstrets kvarsmarkörer —
02:45 · 03:00 · 03:15 = **tre** kvarts, inte två. Formeln landar EXAKT
retroaktivt: board = 8 × antal kvarsmarkörer. **P2:s rotorsak:** jag tog
blad 8:s organ-värde (2 976) ur PREDIKTION-JSON:ens "bas"-block i stället
för blad 9:s eget (3 024, stod i AUTO:s nyckeltabeller) — rörelsen +1 låg
inom min puls-tolkning men bandet registrerades mot fel bas. **Läxorna:**
(1) prediktera från markörformeln, aldrig från föregående punkts värde;
(2) verifiera basen mot bladets EGET protokoll, inte syskons sammanfattning.

## 5. Köpostens svar — tvåledsmodellen SKÄRPT

u2:s nattolktolkning var "golv 8/kvart + intermittent organ-puls" med öppen
fråga om golvet eldar varje kvart. Fönstret med tre kvarsmarkörer ger:

1. **Board är en deterministisk KLOCKA, ej ett golv:** +8 VARJE kvart —
   tre för tre (02:45 ✓ 03:00 ✓ 03:15 ✓), exakt +24. Ingen kvart uteblev,
   ingen dubbelbatch. Prediktionsformeln för nästa fönster: **board_delta =
   8 × kvarsmarkörer i fönstret** (övningens P1-miss är itself beviset på
   att formuleringen måste vara formel, inte "golv"-ord).
2. **Organ är en intermittent småpuls:** serien +9 (blad 8-natt) · +0
   (u2 03:02) · **+1 (detta fönster)** — lever över kvartsgränser men med
   liten amplitud och utan synbar kvartskoppling.
3. **Snapshots 0 intra-dygn** (tredje konsekutiva nattpunkten) — pumpen är
   nattlig 02:30.

**DR-konsekvens:** nattlig katastrof → RPO-skillnaden mellan att återställa
kl 02:31 och kl 03:19 är 25 board-rader + 1 organ-rad = affärskritiskt noll.
Kvartsklockan gör nattens dataförlust Förutsägbar: 8 rader per påbörjat
kvart + slumpmässig organpuls.

## 6. Städa lokal PG — oberoende egenmätt (inte verktygets självrapport)

| Kontroll | Mätvärde | Dom |
|---|---|---|
| Kluster | `pg_lsclusters`: 17 main 5432 **down** | viloläge ✓ |
| base/ | ENDAST OID 1/4/5 · pgsql_tmp 0 filer | noll skrap-svansar ✓ |
| WAL pg_wal/ | **481 MB — TREDJE punkten på serie-låget** (497×3 → 529×4 → 481 · 481 · 481) | restores växer ej WAL ✓ |
| Låsfil | /tmp/ak1a-dr-prov.lock i flock-viloläge | kontraktet släppt ✓ |
| /tmp-spår | fel-blad-2026-09-19-p2567996-…log 34 881 B | spårbar, krockimmunt namn ✓ |
| Bladkatalog | 9 blad (09-11→09-19), inga dummyfiler | retention orörd ✓ |

**DOM: lokal PG fullständigt städad + i viloläge — egenmätt.**

## 7. KVD + gränser

- src/ orörd — INGET bygge, ingen typkontoll aktuell (baslinjen bärs av
  pre-commit-grinden); befintliga verktyg via node-kanalen (skal-kvoten).
- INGA R2-ytor: priser/tier/publicering orörda · inga .env/nyckelfilar ·
  .pgpass ENDAST som PGPASSFILE-pekare (värdet aldrig läst) · prod endast
  LÄST (antal + tidsstämplar — GDPR-rent) · data/blogg/ orörd ·
  data/backups/ endast läst.
- Syskonytor orörda: u2:s FÖDELSEBEVIS + AUTO + RPO-NATT + PREDIKTION och
  u3:s AUTO-2 + replik-protokoll + deras worklog/DRIFTSBOK-rader lästa,
  refererade, EJ modifierade, EJ committade av mig (deras ytor var redan
  committade vid mitt commit-fönster — verifierat i git status).
- Commit MED PATHSPEC (ARKIVSVEP-epilogens läxa).

## 8. Spårbarhet + kö vidare

- Maskinella delprotokoll: DR-PROV-2026-09-19-AUTO-3.md (restore) +
  DR-RPO-DIFF-2026-09-19-GRYNINGSPULS.json (60-tabellsdiffen). Anspråk med
  P1–P10: data/vakten/auto-s10-1789779315763-u1-ansprak.md.
- DRIFTSBOKEN: DR-radens lead + sektion S10-U1 nedan.
- **Kö vidare:** (1) blad 10:s födelsebevis 09-20 02:30 (u3:s prediktioner:
  snapshots 1 252 404 · board 50 114 · publicTotal ≈ 1 345 7xx) — blad 10:s
  board-värde blir kvartsformelns FJÄRDE oberoende test; (2) jungurkörseln
  söndag 09-20 03:20 (äldre s10-u1:s prediktionkontrakt, u3:s kö); (3)
  dagpunkts-RPO med klockformeln som prediktor (första fönstret på
  dagtid där board rör sig snabbare — prediktera INTE från nattens tal);
  (4) retentionstriggern ~2026-10-11 · bladradering 10-13 02:30; (5)
  kvartalssviten dr-total + dr-pumpvakt + dr-arkivsvep senast 2026-12-17/18.

SLUT — DR-ÖVNING GRYNINGSPULS, s10-u1 (fabriksagent, spår 10 vakt,
manifest auto-s10-1789779315763 uppgift 1/3), 2026-09-19 03:07–03:2x lokal
(01:07–01:2xZ).
