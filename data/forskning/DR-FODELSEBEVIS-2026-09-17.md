# DR-FÖDELSEBEVIS 2026-09-17 — nyfödda bladet bevisat på sin födelsedag + morgon-RPO-punkten + lokal PG städverifierad (s10-u1 O8)

**Uppdrag (fabriksmanifest spår 10 vakt):** "DR-övning nästa i spåret (välj
själv): återställ, mät tid/rader, protokoll, städa lokal PG."

## 1. Objektval + duplikatkontroll

Före start kontrollerades samtliga DR-protokoll i data/forskning/, DRIFTSBOKEN:s
DR-rad (rad 309) och worklog mot disk. Läget efter nattens tre syskonleveranser:
restore-kärnan var levererad 15+ gånger, fönsterdjupet (äldsta bladet ×2),
mitt-bladen (s10-u3 O7) — **ALLA SEX bladen 09-11→09-16 restore-bevisade**,
retentionens beteendeprov kört, total-mallen med kirurgi vävd (s10-u1 O7),
natt-RPO-mätning (s10-u2 O7).

**Det icke-levererade objektet var blad 7:** `db-2026-09-17.sql.gz`, fött av
02:30-cronen i natt (02:30:29, 31 733 199 B), var **aldrig restore-bevisat**
vid min start. Konceptet **FÖDELSEBEVIS**: s10-u3 bevisade "N dagar sen
katastrof" för N ∈ [1..5] — men N=0-bladet (det en VERKLIG katastrof idag
skulle ladda från) föds varje natt och var obevisat varje förmiddag tills det
fanns. Födelsebeviset = restore-bevisa varje blad på sin födelsedag.

Tre vinklar utöver kärnan valdes: (1) **morgonpunkten i RPO-dygnskurvan**
(07:39 lokal — mellan s10-u2:s natt-punkt 01:49 och dag-punkten 13:4x fanns
INGEN mätning), (2) **lokal PG städverifierad med EGNA mätvärden** oberoende
av verktygens självrapportering — inklusive FÖRSTA WAL-mätningen, (3)
**RAM-grindens omkörning under äkta fabriksbelastning** (fyra samtidiga
syskonagenter ~0,8 GB/st). Under passet framkom att syskonet s10-u3 (O8)
parallellt valde blad 7 + morgon-RPO:n (se §2) — vinkel (1) blev deras
förstahandsfynd ("två klockor"-dekompositionen), detta protokoll bevarar
den oberoende repliken samt vinkel (2)+(3) som mina förstahandsleveranser.

## 2. Körningen + race-bokföring (ärlighetsdoktrin)

- **RAM-grinden grep 2×** (exit 75, PG orörd — verktygets kontrakt höll):
  896 MB vid första försöket, 896 MB efter 60 s väntan. `ps` visade fyra
  levande syskonpar (zcode-cli 410–461 MB + node-repl-mcp ~380 MB) —
  minnet hölls under 1 000-taket av dem, inte av mig; inget syskon rördes.
- **Omkörningsslinga** (60 s intervall): GRÖN på försök 3 när minnet växlade
  782 → 1 099 → 2 383 MB (syskonfönster stängde).
- **RACE mot syskonet s10-u3 (O8)**: mitt delprotokoll blev AUTO-2 för att
  `DR-PROV-2026-09-17-AUTO.md` redan fanns — den är deras körning (pid
  1421697; RTO 12,1 s; slut 05:43:20.981Z; protokollhuvudets "s10-u4" är
  verktygets statiska malltext — deras DRIFTSBOKEN-bokföring identifierar
  dem som s10-u3 O8). Min körning köade bakom deras flock-fönster och
  levererade 21 s senare (pid 1421802, RTO 12,4 s, slut 05:43:41.870Z).
  De valde SAMMA nyfödda blad OCH samma morgon-RPO-mätning och hann före
  med båda — restore-kärnan och morgonpunkten är DERAS förstahandsleverans
  (deras commit 8b92f0a2, som redan bokför MIN körning som "OBEROENDE
  REPLIKBEVIS … flocken serialiserade, deras protokoll orörda" — bokföringen
  är symmetrisk). Mina kvarvarande förstahandsdelar: repetitionskorsbeviset
  (§3), den egenmäta PG-städverifikationen (§5) och RAM-omkörningen (§2).
  **Gratis korsbevis: två oberoende agenter, två restores, samma blad —
  IDENTISKA radtal på alla tre nivåer** (se §3).
- **JSON-racet**: min dr-rpo-diff-körning (banner 05:39:15Z) och deras skrev
  SAMMA utdatafil (DR-RPO-DIFF-2026-09-17-MORGON.json) — deras skrivning
  landade sist (mtime 07:44:06 lokal; min process hade avslutats inom sitt
  180 s-fönster före dess, varför skrivningen ej kan vara min). Talen är
  IDENTISKA i båda mätningarna (morgonlugnet: 0 rader skrevs i gapet) —
  filen på disken är deras leverans (committad i 8b92f0a2); mina siffror
  står i mitt konsoltranskript + detta protokoll.
- Flock-kö-kontraktet BETEENDEBEVISAT igen under äkta samtidighet (tredje
  gången i spåret): två agenter, ett lås, noll förlorat arbete.

## 3. Födelsebeviset — siffror (blad 7, db-2026-09-17.sql.gz)

Körning: `node verktyg/dr-ovning.mjs --fil data/backups/supabase/db-2026-09-17.sql.gz`
— GRÖN exit 0, hela familjekontraktet intakt (flock, RAM-grind 2 383 MB,
dumpförkontroll, färsk skrap-DB, RTO-mätning, tre nivåer, finally-städning).

| Kontrakt | Värde |
|---|---|
| Slutmarkörer (kolla-dump-markorer) | **GRÖN — 1 307 940 rader · CREATE TABLE 99 · COPY 101** (4,5 s) |
| RTO (restore) | **12,4 s** (30,3 MB gz) |
| Felrader | **788 kända / 0 okända** → /tmp/dr-ovning-fel-2026-09-17.log |
| public | **60 tabeller / 1 286 328 rader** |
| public+storage | 68 / 1 286 464 |
| alla scheman | 99 / 1 286 724 |
| Städning | skrap-DB raderad · PG17 stoppad (ägarverifierad, se §5) |

**Fyrkantigt korsbevis på blad 7** (fyra oberoende instrument, samma tal):
restore-COUNT (min körning) == dump-COPY per tabell (dr-rpo-diff) ==
restore-COUNT (s10-u4:s oberoende körning) == **1 286 328** — och markör-
totalen 1 307 940 täcker även de 39 icke-public blocken. Kompletthets-
kontraktet (kedja 5:s läxa) håller på dagens födelseblad.

**RTO-serien** förlängs med punkterna 16–17: 20,0 · 17,7 · 14,7 · 23,9 ·
11,2 · 12,2 · 17,3 · 15,4 · 14,5 · 14,3 · 12,7 · 11,1 · 11,2 · 10,3 ·
**12,1 (s10-u4) · 12,4 (denna)** — samtliga under v98 F3:s referens 20,0 s.

## 4. Morgonpunkten — RPO-dygnskurvan får sitt tredje ben

`PGPASSFILE=~/.pgpass node verktyg/dr-rpo-diff.mjs --fil db-2026-09-17.sql.gz
--json DR-RPO-DIFF-2026-09-17-MORGON.json` — exit 0; mätfönster 07:39–07:44
lokal (05:39:15Z banner; bladålder ~5,2 h; filen på disken är syskonets
samtidiga skrivning samma väg — identiska tal, se §2). PGPASSFILE-pekare
endast — lösenordet lästes ALDRIG av agenten (R2).

- Bladets total: 1 286 328 (dump-COPY) · Levande: **1 286 491** ·
  **RPO-delta +163 rader** — 2 av 60 tabeller i rörelse:
  board_decisions +160 (47 810→47 970) · organ_health_logs +3 (2 937→2 940).
- **snapshots +0** (1 195 452 == 1 195 452) — dagmaskinens huvuddrivare
  (nattens ackumulatör: +18 984 till kl 01:49) hade inte skrivet EN rad.
- Inga negativa delta, inga tabeller tillkomna/borttappade (schema stabilt).

**MORGONFYNDET (nya):** dygnskurvan har nu tre ben — natt 01:49 ≈ 34 r/h ·
**morgon 07:39–07:44 ≈ 32 r/h** · dag 13:4x ≈ 1 730 r/h snitt.
**Nattlugnet sträcker sig förbi gryningen.** Driftsbetydelse:
1. RPO-skulden byggs i fönstret ~07:40→02:30 — DR-fönstret 02:30–07:40
   kostar ~35 r/h ≈ noll exponering (fönstret där alla spårets övningar
   kört är det optimala, nu mätbevisat också på morgonsidan).
2. Organismens rundor (snapshots-drivarn) startar NÅGONSTANS efter 07:44 —
   exakt starttid outredd; kö: förläng kurvan med förmiddagspunkter.
3. FÖDELSEDAGSTILLVÄXTEN bekräftad: blad-till-blad 1 266 528 → 1 286 328 =
   **EXAKT +19 800** — femte dagsteget i rad (19 805 · 19 797 · 19 797 ·
   19 800 · 19 800): s10-u3:s konstanta takt håller ännu en dag.

## 5. Städa lokal PG — egenmätt, oberoende av verktygens självrapport

Uppdragets fjärde led, första gången helt egenmätt (föregångare lutade sig på
verktygens finally-rapport + pg_lsclusters):

| Kontroll | Mätvärde | Dom |
|---|---|---|
| Kluster | `pg_lsclusters`: 17 main 5432 **down** | viloläge korrekt ✓ |
| Databaskatalog `base/` | ENDAST OID 1/4/5 (template1/template0/postgres) + tom `pgsql_tmp/` | **NOLL skrap-svansdatabaser** ✓ (not: en ytlig "4 kataloger"-läsning är ls total-raden — dubbelkollat) |
| **WAL `pg_wal/`** | **497 MB — FÖRSTA MÅTNINGEN** | NORMAL: återanvändningsbuffert efter spårets ~20 restores; loggens shutdown-checkpoint "0 WAL files added/removed/recycled; estimate 221 MB" under 1 GB-tak; disk 73 GB ledig — ingen åtgärd, referensvärde bokfört |
| PG-loggen (sista rader) | "checkpoint complete … database system is shut down" | ren avstängning, 1 buffer skriven ✓ |
| /tmp-spår | dr-ovning-fel-{09-15,09-16,09-17}.log (34–35 KB/st) | dokumenterad spårbarhet enligt mall — lämnade medvetet ✓ |
| Bladkatalog | 7 blad (09-11→09-17), inga dummyfiler kvar | ✓ |
| Låsfil | flock lämnrar tom fil + pid-rad — dokumenterat oskyldigt | ✓ |

**DOM: lokal PG fullständigt städad + i viloläge — med egenmätta bevis.**

## 6. KVD + gränser

- src/ orörd — inget bygge; inga kodändringar alls (verktygen befintliga).
  tsc ej aktuellt; baslinjen orörd av konstruktion.
- R2 orörd: inga priser/tier/publicering; inga .env-/nyckelfiler rörda;
  .pgpass ENDAST som PGPASSFILE-pekare till psql (värdet aldrig läst);
  data/blogg/ orörd.
- Syskonytor orörda: s10-u4:s AUTO.md läst+refererad, ej modifierad, ej
  staggad av mig; s10-u2:s jungrunatt-leverans (8d82db48) orörd.
- GDPR: protokollen redovisar endast antal, tabellnamn, tider, pid — inga
  personvärden.

## 7. Spårbarhet + kö

- Maskinella delprotokoll: DR-PROV-2026-09-17-AUTO-2.md (restore) +
  DR-RPO-DIFF-2026-09-17-MORGON.json (60-tabellsdiffen).
- DRIFTSBOKEN: DR-tabellradens lead + sektion S10-U1 (O8).
- Kö: (1) **födelsebevis som stående vaktpraxis** — varje blad restore-
  bevisas sin födelsedag i första dagsronden (~60 s; DRIFTSBOKEN-notisen
  bär receptet), (2) RPO-kurvan förlängs med förmiddags-/middagspunkter
  för att binda dagmaskinens starttid (syskonets köpost: mitt-på-dagen),
  (3) WAL-mätningen återtas vid nästa kvartalsövning (trend över tid —
  normalt om den hålls < 1 GB), (4) AVKLARAT under passet: s10-u3 (O8):s
  commit 8b92f0a2 landade medan detta protokoll skrevs — racet fullbokat
  symmetriskt från båda sidor.

SLUT — DR-FÖDELSEBEVIS, s10-u1 (fabriksagent, spår 10 vakt),
2026-09-17 ~07:38–07:5x lokal (05:38–05:5xZ).
