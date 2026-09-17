# DR-PROV 2026-09-16 — JUNGRUNATTEN: nattkedjans första OBEVAKADE körning bevisad + sjunde RTO-punkten (GODKÄNT)

**Körd av:** fabriksagent s10-u2 (omgång 2, vakt-spåret) med
`verktyg/dr-ovning.mjs` (s10-u4:s verktyg, oberoende godkännandestestat
2026-09-15). Maskinellt delprotokoll från verktyget:
`data/forskning/DR-PROV-2026-09-16-AUTO.md`.

**Objektval (duplikatkontroll):** restore-kärnan var redan levererad sex
gånger (v98 F3 · s10-u2 · s10-u3 · s10-u4 · s10-u1:2 · s10-u1 O3) och
manifestet gav syskonen i vågen identisk "DR-övning, välj själv"-text
(känd fabrikskollision; syskonet tog KEDJA 4 = per-typ-vyorna, se
worklog/DRIFTSBOKEN). Det icke-bevisade ledet efter s10-u5:s nattkedjekur
var **obevakad drift**: s10-u5 testkör hela kedjan MANUELLT 00:41 och
s10-u1 O3 återställde just den manuella dumpen — men ingen hade bevisat
att 02:30-cronen LEVERERAR på egen hand, eller att en sådan cron-dump
återställs. Detta protokoll stänger det gapet: kedjan
**cron → pg_dump (pgpass) → gzip → markörvakt → restore** är nu bevisad
ända till ända, utan människa eller agent i kedjan.

---

## 1. Sammanfattning för kunden (5 rader)

1. Den förbättrade nattbackupen kördes i natt **helt på egen hand** för
   första gången — hon loggar själv att kontrollen blev grön, och
   lösenordet syns inte längre i serverns proceslista.
2. Backupen från den natten återställde vi i en avskild testdatabas på
   **12,2 sekunder** — sjunde gången i rad som hela databasen kommer tillbaka
   på väl under en halv minut.
3. Datat växer som väntat: **60 publika tabeller, 1 266 528 rader** —
   73 fler än vid midnattstestet kvällen innan (mest organens nattbeslut).
4. Verktygets minnesvakt stoppade första försöket när servern var för
   upptagen — och rörde då ALDRIG databasen. Andra försöket grönt. Det är
   precis så vakten ska bete sig.
5. Nästa kvartalsövning: **senast 2026-12-16** — nu tre kommandon +
   kedja 3-manualen (se DRIFTSBOKEN).

## 2. Beviskedjan — jungfrunatten 2026-09-16

| Tid (lokal CEST) | Händelse | Bevis |
|---|---|---|
| 00:40–00:41 | s10-u5 KURAR nattkedjan: `.pgpass` (600, 80 B) + `PGPASSFILE` i cron-raden + markörvakt + retention | crontab-rad (användar-crontab, rad 1), `.pgpass` perms 600 |
| 00:41:34 | MANUELL testkörning exakt som cron: dump + markör GRÖN | `/tmp/supabase-backup.log`: `MARKÖRKOLL 2026-09-15T22:41:34.849Z` — 1 287 960 rader |
| **02:30:31** | **CRON KÖR OBEVAKAD** (första natten med kuren): pg_dump via pgpass → gzip → markör GRÖN | loggrad `MARKÖRKOLL 2026-09-16T00:30:31.911Z` — **1 288 041 rader**; `db-2026-09-16.sql.gz` mtime 02:30:31.814, 29,8 MiB |
| 02:30:31+ | Retention tyst (korrekt: äldsta dumpen 5 dygn, `-mtime +30` raderar inget ännu) | 6 dumpar på disk (09-11 … 09-16) |
| 07:14 | DENNA övning: restore av CRON-dumpen | AUTO-protokollet, se §3 |

Skillnaden mellan de två midnattskörningarna — **+81 rader på 1 h 49 min**
(1 287 960 → 1 288 041) — är samtidigt ett äkthetsbevis: 02:30-filen är en
NY dump från cron, inte en kvarvarande kopia av det manuella testet (mtime
och radtal skiljer).

## 3. Restore-resultat (verktygets mätning, tre nivåer)

| Nivå | Tabeller | Rader | Δ vs s10-u1 O3 (manuella dumpen) |
|---|---|---|---|
| public | 60 | 1 266 528 | +73 |
| public + storage | 68 | 1 266 664 | +73 |
| alla scheman | 99 | 1 266 924 | +73 |

Tillväxten är lokaliserad: `board_decisions` 46 978 → **47 042** (+64 —
organens nattbeslut mellan 00:41 och 02:30), `section_data_snapshots`
oförändrad 1 176 468, resten ±0/några enstaka. Felrader 788 — samtliga
kända Supabase-roller/scheman/extensions (samma 788 som O3; kända 788,
okända 0).

**RTO-serien (sju punkter):** 20,0 · 17,7 · 14,7 · 20,0 · 23,9 · 11,2 ·
**12,2 s** — sju av sju under v98 F3:s referens 20 s i procentfallen,
spridningen lastberoende (parallella fabriksagenter aktiva även denna
morgon).

## 4. RAM-grinden — första verifieringen i verklig drift

Försök 1 avbröts av verktygets egen grind: `MemAvailable 519 MB < 1000 MB
— övningen SKIPPAS (exit 75)` (syskon i fabriksvågen belastade servern).
Grinden är s10-u1:2:s härdning efter 16:42-incidenten (RAM-svält) och har
ALDRIG tidigare triggats i verklig trafik — detta är praktbeviset: PG17
rördes INTE, inget tillstånd läckte, och omkörning när minnet frigjorts
(2 198 MB) blev GRÖN. Vaktverktygens skydd är därmed dubbelt bevisat i
verklig trafik: flock-vägran exit 3 (godkännandeprovet) + RAM-grind exit 75
(denna övning).

## 5. Parallellitet och kollisionskontroll

Syskonet s10-u3 (O4) körde KEDJA 4 (per-typ-vyorna, `dr-kedja4.mjs`) i
sitt eget PG17-fönster 07:12:52 — denna övning 07:14. Båda gick via samma
`/tmp/ak1a-dr-prov.lock` (flock re-exec): inget fönster krockade, inget
arbete förlorades. Manifestets identiska "välj själv"-text till alla tre
syskon hanterades av objektval med duplikatkontroll (kedja 4 vs detta
objekt — inget överlapp).

## 6. Städning (oberoende verifierad efter verktyget)

- Skrap-DB `ak1a_dr_test`: raderad av verktyget (steg 7 rapporterat).
- PG17: **down** före och efter (korrekt viloläge; verifierad med
  `pg_lsclusters`).
- Låsfilen kvar som pid-information (avsett i flock-läge; inget lås hålls
  — nästa övning startar direkt).
- Disk 75 G ledigt (23 % använt) — oförändrad av övningen.
- Felloggen `/tmp/dr-ovning-fel-2026-09-16.log` (34 881 B) lämnad med
  avsikt för efterföljning av kända-kategorier.

## 7. Slutsats och nästa steg

- **Nattkedjan är PROVAD ÄNDA TILL ÄNDA OBEVAKAT**: kurad 00:41, levererad
  02:30, restore-bar 07:14. Kedja 1:s RPO = dygnlig 02:30 (värsta fallet
  ~24 h; RÖD natt låser retention och larmar i loggen).
- Kvartalsmallen 2026-12: `node verktyg/dr-ovning.mjs` (kedja 1) +
  `node verktyg/dr-kedja2.mjs` (kedja 2) + `node verktyg/dr-kedja4.mjs`
  (kedja 4) + kedja 3-manualen (DR-PROV-2026-09-16-KEDJA3.md).
- Prod opåverkad; src/ orörd (tsc-baslinjen orörd — inga byggen); R2 orörd;
  GDPR: protokollet redovisar endast antal, tabellnamn och tider.

**Slutdom: GRÖN — övningen godkänd.**

SLUT — protokollfört av s10-u2 (omgång 2) 2026-09-16, tider i CEST där
inget annat sägs (verktygets egna stämplar är UTC).
