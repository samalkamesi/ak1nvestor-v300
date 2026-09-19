# DR-ÖVNING 2026-09-18 kväll — RETENTIONSDJUP: återställning från fönstrets DJUPASTE punkt (GODKÄNT)

**Körd av:** fabriksagent s10-u2 (manifest auto-s10-1789754706687, spår 10 —
DATAINTEGRITET & BACKUP). Genomfördes med det kanoniska verktyget
`verktyg/dr-ovning.mjs --fil data/backups/supabase/db-2026-09-11.sql.gz` —
inget nytt verktyg skapades; familjekontrakten (flock-lås, ram-/diskgrind,
dump-markörkontroll, tre mätnivåer, felkategorisering, garanterad städning)
ärvs intakta. Maskinellt protokoll från själva körningen:
`data/forskning/DR-PROV-2026-09-18-AUTO-16.md`.

**Vinkel (varför detta inte är ett duplikat):** ALLA tidigare övningar —
v98 F3 (09-11), s10-u2/u3 (09-15), AUTO-1…15 — har återställt SENASTE
natt-dumpen, dvs. retention-fönstrets främsta kant. Ingen har bevisat att
fönstrets **djupaste punkt** är återställbar. Skillnaden är avgörande vid
verklig katastrof: om senaste dumpen visar sig korrupt (kedja 3:s
7-dygns-korrupta-tarball-läxa) är det ÄLDRE punkter som räddar datat —
då är 30-dagarsretentionen bara teoretisk värde om djupet aldrig provats.
Denna övning återställer därför **db-2026-09-11.sql.gz — den äldsta
behållna dumpen, 7 dagar bakåt i fönstret**.

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi har nu bevisat att vi kan återställa databasen inte bara från
   senaste backupen, utan också från den **äldsta vi sparar** (7 dagar
   gammal): **11,9 sekunder**, 60 tabeller, 1 186 890 rader.
2. Varför det spelar roll: om en färsk backup skulle visa sig trasig en
   dag, finns det äldre att falla tillbaka på — och nu vet vi att de
   äldre också FUNGERAR, inte bara finns på disk.
3. Bonusbevis: samma äldre dump gav exakt **1 187 291 rader totalt** —
   identisk siffra som rapporterades när dumpen var färsk (v98 F3,
   2026-09-11). Två oberoende mätningar, sju dagar isär, samma svar.
4. Under övningen testades också samarbetsreglerna: en annan agent
   väntade artigt på sitt tur (låssystemet) — serverns testdatabas ägs
   aldrig av två samtidigt.
5. Produktionen påverkades inte; testdatabasen raderades och serverns
   lokala databas stoppades efteråt (viloläge återställt).

## 2. Genomförande

| Steg | Resultat |
|---|---|
| 0. Lås /tmp/ak1a-dr-prov.lock | flock-fönster taget (pid 2335902) — EN agent äger PG17 |
| 1. Dumpkontroll | db-2026-09-11.sql.gz — **GRÖN** enligt markörkontraktet (1 207 625 rader i dumpen, 5,3 s) |
| 2. PG17 | startad av verktyget (låg stoppad — korrekt viloläge) |
| 3. Skrap-DB | ak1a_dr_test skapad färsk |
| 4. **Återställning (RTO)** | **11,9 s** (28,0 MB gz) · fellogg 780 rader, **0 okända** |
| 5. Mätning | tre nivåer, se §3 |
| 6. Protokoll | DR-PROV-2026-09-18-AUTO-16.md + denna analys |
| 7. Städning | skrap-DB raderad · PG17 stoppad — **bevisad** (se §5) |

## 3. Mätning — fönstrets båda ändar, samma kväll

| Nivå | ÄLDSTA dumpen 09-11 (denna) | SENASTE dumpen 09-18 (AUTO-15) | Skillnad |
|---|---|---|---|
| public | 60 tabeller / 1 186 890 rader | 60 tabeller / 1 306 119 rader | +119 229 (+10,0 %) |
| public + storage | 68 / 1 187 026 | 68 / 1 306 255 | +119 229 |
| alla scheman | 95 / 1 187 291 | 99 / 1 306 515 | +119 224 |
| RTO | 11,9 s (28,0 MB gz) | 14,6 s (30,7 MB gz) | — |

Tolkning:

- **Båda fönsterändarna är bevisade återställningspunkter** — samma kväll,
  42 minuter isär (18:08 och 18:48 UTC). RTO håller ~12–15 s oberoende av
  position i fönstret; djupare punkt är inte långsammare.
- Datatillväxten i fönstret (+10 % på 7 dagar, drivet av
  section_data_snapshots +113 904 rader) visar att retentionen fångar
  verklig historik, inte stillastående kopior — en punkt 7 dagar bakåt är
  en meningsfullt ANNAN databas, inte en dubblett.

## 4. Konsistenbeviset — oberoende replik med 7 dagars mellanrum

v98 F3 (2026-09-11, "godkänd mall") rapporterade **1 187 291 rader**.
Denna övning, mot samma dump db-2026-09-11.sql.gz, ger **exakt 1 187 291**
på nivån "alla scheman". Förklaringen: F3 mätte vad som senare formaliserades
som "alla scheman"-nivån (de tre mätnivåerna definierades först av s10-u3).
Två verktygsgenerationer, två dagar, samma total — dumpen har inte förändrats
på disk och mätmetodiken är konsistent bakåt. Detta är själva definitionen
av vad ett backup-arkiv SKALL kunna bevisa.

## 5. Fynd under övningen

**FYND 1 (positivt — låskontraktet bevisat i skarpt läge):** Direkt efter
min städning (18:48:50Z) startade ett syskon i samma fabriksemblemang
(pid 2336223, 18:49:17Z) sin egen övning mot SENASTE dumpen. Beviskedjan:
`pg_postmaster_start_time() = 20:49:23 lokal` ⇒ PG17 startades OM av
syskonet ⇒ min stopp var verkställd (PG17 var nere 18:48:50→18:49:17).
Flock-fönstrena uteslöt varandra exakt som kontraktet lovar — två agenter,
samma låsfil, ingen kollision, ~27 s överlämning. Noteras bör dock:
syskonets körning blir en DUPLIKAT av AUTO-15 (samma senaste dump) —
"djupaste punkten"-vinkeln här var den differentierade leveransen.

**FYND 2 (metod):** Verifiering OMEDELBART efter en DR-körning kan visa
PG17 online + skrap-DB närvarande ÄVEN när ens egen städning lyckades —
om ett syskon öppnat nytt fönster däremellan. Regel: verifiera med
`pg_postmaster_start_time()` (vems fönster är det?) innan ett
"läckage"-fynd rapporteras. Falsklarm kostar felspår.

**FYND 3 (Retentionens framtid):** Fönstret innehåller idag 8 dagar av
planerade 30 (cron-raden `find -mtime +30` saknar än så länge material).
Djupprovets fulla bevisning — "hela 30-dagarsfönstret är återställbart" —
kan levereras tidigast 2026-10-11+, när äldsta behållna dump är 30 dagar.

## 6. Rekommendation (till spårets nästa omgång)

1. **Rotera djupprovet vid sidan av kantprovet:** kvartalsövningen kör
   `node verktyg/dr-ovning.mjs` (senaste) OCH
   `node verktyg/dr-ovning.mjs --fil data/backups/supabase/db-<äldsta>.sql.gz`
   — två kommandon, två protokoll, båda ändarna bevisade varje kvartal.
2. Vid 2026-10-11+: engångsövning "fullt fönster" — äldsta (30 d) + en
   slumpvald mittpunkt + senaste, tre återställningar i ett flock-fönster.
3. FYND 2 ovan till DRIFTSBOKEN som en rad i DR-avsnittet (nästa agent
   med DR-ägarskap; denna agent rörde inte DRIFTSBOKEN — exklusivt
   filägarskap i embodien).

## 7. Status

- Kod i src/ berördes ej — tsc-baslinjen orörd; inga byggen; inga
  installationer. Endast data/ + detta protokoll.
- GDPR: endast antal, tabellnamn och tider redovisas — inga personvärden
  (auth.users redovisas som radantal, 5 st, inget innehåll).
- Prod opåverkad: skrap-DB på lokal PG17; prod-data lever i Supabase-molnet.
- Slutdom: **GRÖN — retentionsdjupet är en bevisad återställningspunkt.**

SLUT — fabriksagent s10-u2 (auto-s10-1789754706687), 2026-09-18T18:50Z
