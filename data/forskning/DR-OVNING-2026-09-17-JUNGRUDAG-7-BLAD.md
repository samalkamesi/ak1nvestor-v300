# DR-ÖVNING 2026-09-17 (morgon) — JUNGRUDAGEN: fönstrets SJUNDE blad restore-bevisat + första morgon-RPO:n + RAM-grindens kur (s10-u3, O8)

**Uppdrag (fabriksmanifest spår 10 vakt 3/3):** "DR-övning nästa i spåret (välj
själv): återställ, mät tid/rader, protokoll, städa lokal PG."

**Objektval + duplikatkontroll.** Före start kontrollerades samtliga
DR-protokoll i data/forskning/, DRIFTSBOKEN:s DR-rad och worklog mot disken.
Vid start (07:39 lokal) var alla SEX äldre blad restore-bevisade (fönster-
kontinuiteten O7) och syskonet s10-u2 O8 hade 07:36–07:39 levererat
JUNGFRUNATT KEDJA 2 (moln-JSON-arkivet; deras protokoll noterar själva att
"kedja 1:s 09-17-blad GRÖNT (markörkoll) … restore-ägarskap O7 + kommande
rundor" — restore-ägarskapet stod öppet). Tre icke-levererade vinklar valdes:

1. **Jungfrubladet db-2026-09-17 restore-bevisas** (kedja 1) — nattens
   02:30-cron levererade sitt blad 02:30:29; kontinuitetsprotokollets
   prediktion "fönstret växer till 7+ blad" INLÖST och det nya yngsta bladet
   var aldrig restore-bevisat. Fönstret blir KOMPLETT igen: 7 blad,
   N ∈ [0..6] "dagar sen katastrof".
2. **Femte dagstegs-punkten** — tillväxtserien hade fyra konstantsteg
   (+19 805 · +19 797 · +19 797 · +19 800, spridning 8 rader); jungfrubladets
   radtal ger steget 09-16→09-17 och testar hypotesen "konstant ≈ +19 800/dag".
3. **Första MORGNON-RPO:n** — RPO-serien hade två punkter (dag 09-16 13:4x
   +19 359 på 11,2 h · natt 09-17 01:49 +19 767 på 23,3 h); morgonläget
   5,2 h efter en FÄRSK växling var omätbart.

**Kollisionsbokföring:** syskonet s10-u2 O8 (kedja 2, jungfrunatten) körde
07:36–07:39 — deras objekt orört av mig, mitt skiljer sig (kedja 1 + RPO).
PG-fönstret togs under verktygets flock-lager; RAM-grinden (se §2) serialiserade
i praktiken också startögonblicken. **Under fönstret konstaterades en andra
kollision:** ett syskon körde dr-ovning.mjs mot SAMMA jungfrublad sekunder
bredvid min körning (deras maskinella DR-PROV-2026-09-17-AUTO-2.md: RTO
**12,4 s**, identiskt radtal 60 tabeller/1 286 328, GRÖN, egen städning) —
flocken på /tmp/ak1a-dr-prov.lock serialiserade de två restore-fönstrena
korrekt (noll kollision i PG). Utfallet BOKFÖRS som ett OBEROENDE
REPLIKBEVIS av jungfrubladet (två instrument-enheter, samma radtal; mönstret
s10-u2/s10-u3 2026-09-15: 17,7 + 14,7 s) — deras protokoll orört av mig;
denna övningens unika leverans kvarstår: 7-bladsfönstret som helhet, femte
dagstegs-punkten, morgon-RPO:n med två-klockor-fyndet, RAM-grindkuren.

## 1. Jungfrubladet — förkontroll

`node verktyg/kolla-dump-markorer.mjs --fil data/backups/supabase/db-2026-09-17.sql.gz`
→ **GRÖN — 1 307 940 rader · CREATE TABLE 99 · COPY 101 · pg_dump 17.11 · 4,5 s**
(markörkontraktet: dumpen bär sina egna slutmarkörer). 30,3 MB gz.

## 2. RAM-grinden — första verkliga exit 75 under FABRIKSTREFÖNSTRET (kur levererad)

Första övningsförsöket 07:41 lokal vägrades korrekt av dr-ovning.mjs:s
RAM-grind: **MemAvailable 943 MB < 1 000 MB-taket → exit 75, PG17 orörd**
(dokumenterat beteende sedan incidenten 16:42). Rot: tre fabriksbarn (syskonen
+ denna agent, zcode-cli ~450–470 MB + repl-mcp ~390 MB vardera klass) delar
servern med main-sessionen. **Kur:** vänta-tills-öppet-mönstret — en liten
node-wrapper pollade /proc/meminfo var 15:e s och startade övningen i samma
sekund som grinden öppnades (**1 155 MB efter 120 s**; ingen manuell
omprövningsloop, PG orörd under hela väntan). Läxa protokollförd: DR-övning
under ett fabrikstrefönster SKA räkna med grindstopp — poll-mönstret är
standardkuren (grinden är rätt; minnet är trångt, aldrig tvärtom).

## 3. Övningen — kedja 1, ETT kommando (dr-ovning.mjs --fil)

`node verktyg/dr-ovning.mjs --fil data/backups/supabase/db-2026-09-17.sql.gz`
→ **GRÖN exit 0** (07:43 lokal). Familjekontraktet intakt: flock
(/tmp/ak1a-dr-prov.lock) · dumpförkontroll 1/1 GRÖN · PG17 startad ur korrekt
viloläge · färsk skrap-DB ak1a_dr_test · RTO-mätning · tre nivåers
tabell-/radmätning · protokoll · garanterad städning i finally.

| Moment | Värde |
|---|---|
| **RTO** | **12,1 s** (30,3 MB gz) |
| Felrader | 788 — samtliga KÄNDA (Supabase-roller/scheman i vanilla-PG), **0 okända** |
| public | **60 tabeller / 1 286 328 rader** |
| public + storage | 68 / 1 286 464 |
| alla scheman | 99 / 1 286 724 |
| Största tabell | section_data_snapshots 1 195 452 · board_decisions 47 810 |
| Städning | skrap-DB raderad · PG17 stoppad (verktyget + oberoende §6) |

RTO-serien punkt 16: 20,0 · 17,7 · 14,7 · 20,0 · 23,9 · 11,2 · 12,2 · 17,3 ·
15,4 · 14,5 · 14,3 · 12,7 · 11,1 · 11,2 · 10,3 · **12,1** — samtliga under
v98 F3:s referens 20,0 s; jungfrubladet i spannet 10,3–23,9 s.

Maskinellt protokoll: **DR-PROV-2026-09-17-AUTO.md** (verktyget, 05:43:20Z).

## 4. Fönstret — KOMPLETT med sju blad (N ∈ [0..6])

| Blad | public-rader | dagsteg | restore-bevis (RTO) |
|---|---|---|---|
| 09-11 | 1 186 890 | — | fönsterdjupet ×2 (15,4 + 14,5 s) |
| 09-12 | 1 187 329 | +439 | kontinuiteten (11,1 s) |
| 09-13 | 1 207 134 | +19 805 | kontinuiteten (11,2 s) |
| 09-14 | 1 226 931 | +19 797 | kontinuiteten (10,3 s) |
| 09-15 | 1 246 728 | +19 797 | kedja 1-serien (14,7–23,9 s) |
| 09-16 | 1 266 528 | +19 800 | jungfrunatten + total ×2 + kedja 6 + natt-RPO (11,2–17,3 s) |
| **09-17** | **1 286 328** | **+19 800** | **denna övning (12,1 s)** |

**Dagstegs-hypotesen KONFIRMERAD:** femte konstantsteget landar på exakt
**+19 800** — serien +19 805 · +19 797 · +19 797 · +19 800 · +19 800 har
spridningen 8 rader (0,04 %) över fem dagar. Snapshots-drivarnas rytm är
stabiliserad (439-anomalin 09-11→12 förblir en enda avvikare). DR-scenariot
"dag N sen upptäckt" har bevisat blad + mätt radtal för varje N ∈ [0..6].

## 5. Första morgon-RPO:n — två klockor i exponeringen (NYTT FYND)

`PGPASSFILE=~/.pgpass node verktyg/dr-rpo-diff.mjs --fil db-2026-09-17.sql.gz
--json …` (07:43 lokal — 5,2 h efter bladets 02:30; psql äger lösenordet,
endast antal, GDPR-rent):

- Bladet 1 286 328 · levande prod **1 286 491** → **RPO-delta +163 rader**,
  2 av 60 tabeller i rörelse, inga negativa, schema stabilt (60/60 svarade).
- **section_data_snapshots: +0** — dagtidens stort drivare (~19 000/dag) står
  HELT STILLA 02:30→07:43.
- board_decisions +160 (47 810 → 47 970) · organ_health_logs +3.

**FYND — RPO-bilden bärs av TVÅ separata klockor:**

| Klocka | Takt | Bevis |
|---|---|---|
| Beslutsklockan (board_decisions + organ_health_logs) | **≈ 31–32 r/h, jämn dygnet runt** (≈ 744/dag) | natten: 744/23,3 h = 31,9 r/h · morgonen: 163/5,2 h = 31,3 r/h |
| Snapshots-pumpen (section_data_snapshots) | **0 på morgonen**, ≈ +19 800 koncentrerat till driftsdagen | denna mätning (0 på 5,2 h) mot gårdagens dagprofil |

Driftsbetydelse: timmarna omedelbart efter 02:30-växlingen har minimal
exponering (~31 r/h) — på morgonen är RPO-skulden fortfarande nästan noll
trots att arbetsdagen börjat; skulden byggs först när snapshots-pumpen
startar sin dagliga cykel. Morgonpunkten separerar klockorna empiriskt,
vilken varken dag- eller nattpunkten kunde (kumulativa fönster). Köpost till
nästa RPO-rond: mät mitt-på-dagen för att tidssätta pumpens start.

RPO-serien (per-tabell-instrument, hela tabellen i JSON-delprotokollet):
dag 09-16 13:4x +19 359/11,2 h (≈1 730 r/h, snapshots-driven) ·
natt 09-17 01:49 +19 767/23,3 h (varav nattens andel +408 ≈ 34 r/h) ·
**morgon 09-17 07:43 +163/5,2 h (≈31 r/h, enbart beslutsklockan)**.

## 6. Städning + KVD

- Städning (verktygets finally + oberoende ägarmät): skrap-DB ak1a_dr_test
  borta, **PG17 down** (pg_lsclusters), flock-låset släppt, inga tmp-filer i
  repo-roten; poll-wrappern lever kvar medvetet i /tmp (icke-versionerad,
  engångsmetod — mönstret dokumenterat i §2).
- **R2 orörd**: inga priser/tier/publicering; .pgpass aldrig inläst (pekare
  ur publika crontaben till psql); endast antal — inga personvärden.
- src/ orörd — inget bygge, tsc-baslinjen opåverkad (ren node-körning).
- data/blogg/ orörd. Syskonytor orörda (s10-u2:s jungfrunatts-protokoll
  lästa, ej modifierade).
- RAM vid GRÖN körning: MemAvailable 1 138–1 155 MB (grinden GRÖN igen).

## 7. Spårbarhet

- Detta protokoll + maskinellt **DR-PROV-2026-09-17-AUTO.md** +
  JSON-delprotokoll **DR-RPO-DIFF-2026-09-17-MORGON.json** (60-tabellsdiff,
  tidsstämplar, bladnamn).
- DRIFTSBOKEN: DR-tabellradens lead + sektion S10-U3 (O8) + worklog-rad.
- Verktyg oförändrade: dr-ovning.mjs · dr-rpo-diff.mjs ·
  kolla-dump-markorer.mjs (alla versionerade sedan tidigare omgångar).

SLUT — DR-OVNING JUNGRUDAGEN 7 BLAD, s10-u3 (fabriksagent, spår 10 vakt 3/3),
2026-09-17 07:39–07:45 lokal (UTC 05:39–05:45).
