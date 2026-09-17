# DR-övning 2026-09-17 (natt) — FÖNSTERKONTINUITETEN: hela retentionfönstret restore-bevisat + retentionens beteendeprov (s10-u3, O7)

**Uppdrag (fabriksmanifest spår 10 vakt 3/3):** "DR-övning nästa i spåret
(välj själv): återställ, mät tid/rader, protokoll, städa lokal PG."

**Objektval + duplikatkontroll.** Före start kontrollerades samtliga
DR-protokoll i data/forskning/, DRIFTSBOKEN:s DR-rad och worklog mot
verkligheten på disk. Kedjorna 1–6, dr-total (×3 inkl. ikvällens
syskon-vävning), fönsterdjupet (ÄLDSTA bladet ×2) och kedja 1-serien
(yngsta bladen) var levererade — men **fönstrets MITT-BLAD db-2026-09-12,
-09-13 och -09-14 hade aldrig restore-bevisats** (endast gzip-integritet i
kedja 5:s retentionssvep; DR-PROV-2026-09-13.md var våg 122D:s
filanalysprov med sudo spärrat — ingen PG-restore). Blindfläcken: beviset
gällde "ändarna" av fönstret, inte kontinuiteten — vid katastrof som
upptäcks "N dagar sent" saknades bevis för N=2..4. Därtill var
**retentionens raderingsbeteende** (`find -mtime +30 -delete`) dokumenterat
(s10-u1 5f26df46 fynd 2) men aldrig beteendebevisat.

**Kollisionsbokföring (nattfönstret var delat, flocken serialiserade):**
- s10-u2:s NATT-DR-övning + RPO-diff körde 01:47–01:48 lokal (deras
  protokoll DR-PROV-2026-09-16-AUTO-6.md, deras commit 5d377343 — deras
  objekt SENASTE bladet + nytt instrument, orört av mig).
- s10-u1:s TOTAL-vävning körde 01:52+ (deras DR-PROV-2026-09-16-AUTO-5.md
  + kedjeprotokoll på disk; deras objekt dr-total-kirurgi-vävning, orört
  av mig).
- Denna övning (mitt-bladen + retention) delar inget objekt med någon av
  dem; protokollnamnen är verktygsunika per körning (AUTO-7/8/9).

## 1. Övningen — tre mitt-blads-restores (verktyg: `verktyg/dr-ovning.mjs --fil`)

Alla tre GRÖNA exit 0, var och en med familjekontraktet intakt: flock
(/tmp/ak1a-dr-prov.lock, kö-beteende), RAM-/diskgrind (MemAvailable
3 707–3 748 MB vid start — grönt), dumpförkontroll (kolla-dump-markorer
--fil: 1/1 GRÖN varje gång), färsk skrap-DB (ak1a_dr_test), RTO-mätning,
tre nivåers tabell-/radmätning, garanterad städning i finally (skrap-DB
raderad, PG17 stoppad — oberoende verifierad med pg_lsclusters efter
tredje körningen: `17 main 5432 down`).

| Blad | RTO | felrader (kända/okända) | public | public+storage | alla scheman | dumpens totalrader (markör) |
|---|---|---|---|---|---|---|
| db-2026-09-12.sql.gz | **11,1 s** | 780 / **0** | 60 tabeller / 1 187 329 rader | 68 / 1 187 465 | 95 / 1 187 720 | 1 208 107 GRÖN |
| db-2026-09-13.sql.gz | **11,2 s** | 780 / **0** | 60 / 1 207 134 | 68 / 1 207 270 | 95 / 1 207 525 | 1 228 011 GRÖN |
| db-2026-09-14.sql.gz | **10,3 s** | 780 / **0** | 60 / 1 226 931 | 68 / 1 227 067 | 95 / 1 227 322 | 1 247 907 GRÖN |

Maskinella delprotokoll: DR-PROV-2026-09-16-AUTO-7.md · -AUTO-8.md ·
-AUTO-9.md (namnen följer verktygets dagnamn + global stegning; innehållet
anger bladet).

RTO-serien förlängs med punkterna 13–15: 20,0 · 17,7 · 14,7 · 20,0 · 23,9 ·
11,2 · 12,2 · 17,3 · 15,4 · 14,5 · 14,3 · 12,7 (s10-u2 natt) · **11,1 ·
11,2 · 10,3 (denna)** — 10,3 s är seriens snabbaste restore hittills.

## 2. Fönstret — komplett kontinuitet (NYTT läge)

Med detta är **ALLA sex bevarade blad (09-11 → 09-16) restore-bevisade**:

| Blad | public-rader | dagens tillväxt | restore-bevis (värd) |
|---|---|---|---|
| 09-11 | 1 186 890 | — | fönsterdjupet ×2 (15,4 + 14,5 s) |
| 09-12 | 1 187 329 | **+439** | denna övning (11,1 s) |
| 09-13 | 1 207 134 | +19 805 | denna övning (11,2 s) |
| 09-14 | 1 226 931 | +19 797 | denna övning (10,3 s) |
| 09-15 | 1 246 728 | +19 797 | kedja 1-serien (14,7–23,9 s) |
| 09-16 | 1 266 528 | +19 800 | jungfrunatten + total ×2 + kedja 6 + natt-RPO (11,2–17,3 s) |

**FYND 1 — tillväxtens struktur:** fönsterdjupets snitt "≈16 016 rader/dag"
var en artefakt av en enda avvikande dag: 09-11→09-12 gav bara **+439**
rader, därefter är tillväxten konstant **≈ +19 800 rader/dag** (fyra
dagsteg: 19 805 · 19 797 · 19 797 · 19 800 — spridningen 8 rader).
Snapshots-drivarnas rytm är alltså stabiliserad sedan 09-12;DR-scenariot
"dag N sen upptäckt" har nu ett bevisat blad och ett mätt radtal för varje
N ∈ [0..5]. (Roten till 439-dagen — snapshots-pumpens start? — utreds inte
här; observationen dokumenteras för datumkorrelation.)

**FYND 2 — fönstrets säkerhetsegendom:** restore-tiden är OBLESSERAD av
bladålder (10,3–11,2 s för 5–4 dagar gamla blad, seriens span 10,3–23,9 s
över hela fönstret) — det är dumpstorleken (~28–31 MB) som styr, inte
åldern. Retentionens 30-dagarsgräns kan därför antas RTO-neutral.

## 3. Retentionens BETEENDEPROV (första gången kört, inte bara dokumenterat)

Cron-radens exakta mönster (ur användar-crontaben, rad 1):
`find data/backups/supabase -name "db-*.sql.gz" -mtime +30 -delete`

Provet (01:57 lokal, före nattens 02:30-växling):
1. Skapade dummy `db-2026-08-01.sql.gz` (innehåll märkt
   "RETENTIONSPROV", mtime satt 40 dagar bakåt) och gränsfall
   `db-2026-08-20.sql.gz` (mtime 28 dagar bakåt).
2. Körde cron-radens find-KOMMANDON exakt (samma katalog, samma glob,
   samma -mtime +30 -delete).
3. Dom: **40-dagarsfilen RADERAD** (grips) · **28-dagarsfilen SKONAD**
   (gränsen är >30 fulla dygn, inte kalendermånad) · **alla 6 äkta blad
   KVAR** (09-11 är 6 dagar gammal — långt under gränsen).
4. Städning: gränsfallsfilen togs bort manuellt direkt efter provet
   (dummyfår inte ligga kvar — 02:30-markörvakten skulle döma den RÖT och
   &&-kedjan bryter retentionen, se DR-NATTKEDJAN 2026-09-16).

**Konsekvensbokföring:** retentionen ligger SIST i cron-kedjan
(dump && markörkoll && find) — en RÖD nattdump låser alltså retentionen
(avsiktligt, nattkedjans design). Första raderingen av ett ÄKTA blad sker
alltså tidigast 2026-10-11+ (09-11-bladet passerar 30 dygn) — fram till
dess växer fönstret till 7+ blad; fönsterdjupets "dag 29"-runbook gäller
då för 09-11-bladet.

## 4. Städning (ägartrollerat)

- Skrap-DB: raderad av verktyget efter varje körning ×3 (verktygets
  finally-kontrakt; protokollen bokför varje städning).
- PG17: `pg_lsclusters` → `17 main 5432 down` (viloäge återställt, eget
  mätvärde efter tredje körningen).
- Testfiler: db-2026-08-01.sql.gz raderad av provet självt (beviset),
  db-2026-08-20.sql.gz manuellt borttagen efter dom (dokumenterat ovan).
- Fönstret efter övningen: exakt 6 äkta blad kvar (ls-verifierat).

## 5. KVD + gränser

- src/ orörd — inget bygge; verktygen är befintliga (dr-ovning.mjs,
  kolla-dump-markorer.mjs, git-ren status före start, node --check OK).
- tsc: ej aktuellt (ingen kodändrad i src/) — baslinjen orörd.
- R2 orörd: inga priser/tier/publicering; inga .env-/nyckelfiler rörda;
  inga nyckelvärden återgivna (crontab-citeringen är redan public i
  DRIFTSBOKEN med host-prefixet synligt).
- data/blogg/ orörd.
- Syskonytor orörda: s10-u2:s natt-RPO + dr-rpo-diff.mjs, s10-u1:s
  total-vävning — deras protokoll lästa, inte modifierade.

LEVERANS-filer: detta protokoll + DR-PROV-2026-09-16-AUTO-{7,8,9}.md +
DRIFTSBOKEN-sektion S10-U3 (O7) + worklog-rad.

SLUT — DR-FONSTER-KONTINUITET, s10-u3 (fabriksagent, spår 10 vakt 3/3),
2026-09-17 ~01:5x–02:0x lokal (UTC 2026-09-16 23:5x).
