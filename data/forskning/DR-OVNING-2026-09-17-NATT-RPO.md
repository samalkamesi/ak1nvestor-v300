# DR-ÖVNING NATT + FÖRSTA NATTLIGA RPO-DIFFEN — 2026-09-17 01:47–01:51 lokal (s10-u2, fabriksagent spår 10 vakt)

Körning: `node verktyg/dr-ovning.mjs` (kedja 1, GRÖN exit 0) + NYTT instrument
`verktyg/dr-rpo-diff.mjs` (dump-COPY vs levande prod-COUNT, exit 0). Blad:
db-2026-09-16.sql.gz (senaste, GRÖN enligt markörkontraktet 1 288 041 rader).

## 1. Objektval och kollisionskontroll

- Uppdragstexten: "DR-övning nästa i spåret: återställ, mät tid/rader,
  protokoll, städa lokal PG". Restore-kärnan var vid start levererad 10+ gånger
  (kedja 1: v98 20,0 · u2 17,7 · u3 14,7 · godkännande 23,9 · u1o3 11,2 ·
  jungrunatten 12,2 · kvartal 17,3 · total 12,2 · flockprov 14,3 · fonsterdjup
  15,4 + 14,5 s) — en ren reprise hade varit duplikat. Tre icke-levererade
  vinklar valdes i stället:
  1. **Kontinuitetspunkt i NATTFÖNSTER** — ingen DR-övning hade körts natt;
     klockan 01:47 lokal är dessutom "värsta-fall-timmen" för kedja 1 (bladet
     är som äldst, 23,3 h, strax före 02:30-cronens växling).
  2. **Första NATTLIGA fulla RPO-diffen** — levande prod vs bladets per-tabell-
     värde; dagtidsmätningen 09-16 13:4x (+19 359 på 11,2 h) fanns, nattläget
     var omätbart.
  3. **Nytt instrument `verktyg/dr-rpo-diff.mjs`** — RPO-skuld per tabell som
     återanvändbart kommando, inte engångsmätning.
- **Syskonbokning iakttagen**: s10-u1 (auto-s10-1789602326938) bokade 01:52
  lokal "TOTAL-mallens kirurgi-vävning — dr-kedja5.mjs som femte steg i
  dr-total.mjs + äkta femkedjekörning". Mitt objekt SKILJER SIG: ingen
  total-körning, ingen kedja 5-vävning, inga ändringar i dr-total.mjs — deras
  objekt orört. Min dr-ovning-körning (01:47–01:48) låg FÖRE deras bokning;
  flock-lagret på /tmp/ak1a-dr-prov.lock serialiserar PG-fönstret om syskonet
  når det under mitt pass.
- **Tidsfönstret**: 02:30-cronen (ny dump + markörvakt) låg 43 min bort —
  ingen kollision; dumpkatalogen är gitignore:ad (data/backups/) varför
  cronens skrivning inte kan krocka med commit.

## 2. Övningen — kedja 1, ETT kommando (dr-ovning.mjs)

- Dumpkontroll (kolla-dump-markorer.mjs --fil): **GRÖN — 1 288 041 rader ·
  CREATE TABLE 99 · COPY 101 · 6,5 s** (markörkontraktet heligt: dumpen bär
  sina egna slutmarkörer).
- PG17 startad ur viloläge → färsk skrap-DB ak1a_dr_test (dropdb --if-exists
  + createdb).
- **Restore RTO 12,7 s** — ytterligare en kedja-1-punkt i serien 11,2–23,9 s
  (median runt 14 s; samtliga under v98 F3:s referens 20,0 s).
- Felrader **788 — samtliga kända** (saknade Supabase-roller/extensions i
  vanilla-PG, v98 F3-kategorin), **0 okända** → /tmp/dr-ovning-fel-2026-09-16.log.
- Mätkontrakt tre nivåer: **public 60 tabeller / 1 266 528 rader ·
  public+storage 68 / 1 266 664 · alla scheman 99 / 1 266 924**.
- Städning (verktygets finally-garanti + ägarmätt efteråt): skrap-DB RADERAD
  (psql -l: 0 träffar), **PG17 STOPPAD** (pg_lsclusters: down), låsfilens
  flock-lager släppte (exit 0).

## 3. Korsbeviset — två instrument, samma tal

| Instrument | Väg | public-total |
|---|---|---|
| dr-ovning.mjs | psql COUNT i återställd skrap-DB | **1 266 528** |
| dr-rpo-diff.mjs (nytt) | zcat + radvis COPY-blocksräkning i dumpen | **1 266 528** |

Restore-barhet och dumpens COPY-innehåll är IDENTISKA på radnivå för alla 60
public-tabeller — kedja 5:s läxa (psql accepterar tyst trunkerad COPY) är
åter bekämpad av dubbel instrumentering: kompletthetskontraktet gäller nu
som standard i båda ändar.

## 4. Första nattdiffen — RPO-läget 23,3 h efter bladet

Mätt 01:49–01:50 lokal (23:49Z) med PGPASSFILE (psql-processen äger
lösenordshanteringen — värdet läses aldrig in av agenten; tabellägaren
postgres bypassar RLS, doktrinerat i DR-KVARTAL-2026-09-16-FYRAKEDJOR.md).

- Bladets total: 1 266 528 rader (dump-COPY) · Levande: **1 286 295 rader**.
- **RPO-delta +19 767 rader oskyddade** sedan 02:30 09-16 — bara **3 av 60
  tabeller i rörelse**:
  - section_data_snapshots +18 984 (1 176 468 → 1 195 452)
  - board_decisions +744 (47 042 → 47 786)
  - organ_health_logs +39 (2 889 → 2 928)
  - Inga negativa delta, inga tabeller tillkomna/borttappade (schema stabilt).

**NATTDIFTSFYNDET (nya):** dagtidmätningen 09-16 13:4x gav +19 359 på 11,2 h;
nattfönstret 13:43→01:50 (12,1 h) lade till endast **+408 rader ≈ 34 r/h**
mot dagtakten ≈ 1 730 r/h — **natten är ~50× lugnare**. Driftsbetydelse:
- RPO-skulden byggs i praktiken endast dagtid (organismens rundor); den
  nattliga exponeringen är försumbar.
- Vid planerad DR-övning/migrering är timmen före 02:30 den minst kostsamma
  (max 23,3 h skuld, varav nattens andel ~400 rader).
- Bekräftar fönsterdjupets dygnsbild (~16 016 r/dag) som ren dagtids-
  företeelse — inte jämn tillväxt.

## 5. Fynd under övningen — instrumentbuggar i det nya verktyget (ärlighetsdoktrin)

Nytt instrument dömdes GRÖN först EFTER två äkta buggar hittats+fixats+återmätts:
1. **Felvillkorsbugg**: `!zcat.exitCode` är sant när exitCode = 0 — lyckad
   zcat dömdes som fel ("zcat misslyckades (exit 0)"). Fix: `!== 0`.
2. **Schema-punktsbugg**: COPY-block utanför public (auth./storage., 41 block)
   bröt live-frågans citering (`relation "public.auth.audit_log_entries"
   does not exist`) — normaliseringen behöll schemaprefixet. Fix: ENDAST
   public-block räknas + hela icke-public-block konsumeras (datarader i
   ignorerade block får aldrig likna en ny COPY-start — samma tysta-trunkerings-
   klass som kedja 5:s fynd 2).
Läxa mekaniserad: nytt mätinstrument KÖRS mot ett känt felläge (eller två)
innan protokollstatus GRÖN delas ut.

## 6. KVD

- `node --check verktyg/dr-rpo-diff.mjs` OK · verktyget är ren node (src/ orörd
  — tsc-projektet opåverkat; pre-commit-grinden passerar).
- **R2 orörd**: inga priser/tier/publicering; .pgpass läst ALDRIG av agenten
  (endast PGPASSFILE-pekare till psql); data/blogg/ orörd.
- Städning: PG17 nere, skrap-DB borta, /tmp-dr-ovning-spår = verktygets egen
  fellogg (dokumenterad spårbarhet, lämnad medvetet enligt mall).
- RAM-läget vid körning: MemAvailable 1 252 MB > 1 000-taket (grinden GRÖN).

## 7. Spårbarhet

- Maskinellt JSON-delprotokoll: data/forskning/DR-RPO-DIFF-2026-09-17.json
  (hela 60-tabellsdiffen, tidsstämplar, bladnamn).
- Verktyg: verktyg/dr-rpo-diff.mjs (versionerad, återanvändbart: `PGPASSFILE=…
  node verktyg/dr-rpo-diff.mjs [--fil <blad>] [--json <ut>]`).
- DRIFTSBOKEN: DR-tabellradens lead + ny sektion + verktygskatalograd.
- Övningsprotokoll (dr-ovning.mjs): data/forskning/DR-PROV-2026-09-16-AUTO-5.md
  (filnamn = bladets UTC-datum; KÖRNINGEN skedde 2026-09-17 01:47 lokal).

SLUT — DR-OVNING NATT-RPO, s10-u2 (fabriksagent, spår 10 vakt),
2026-09-17 01:47–01:51 lokal.
