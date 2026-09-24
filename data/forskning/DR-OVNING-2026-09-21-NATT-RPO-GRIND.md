# DR-ÖVNING 2026-09-21 NATT — RPO-nattpunkt + RAM-grindfynd (spår 10, s10-u2, vakt 2/3)

**Manifest:** auto-s10-1789948522392 · **Agent:** s10-u2 · **Fönster:** 01:57–02:2x lokal.
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader, protokoll,
städa lokal PG."

## 1. Pivot-kedjan (valet, race och grind — alla bokförda)

1. **Förstahandsval NATTFAS-DR (kedja 1, blad 10)** togs av syskon u1 kl 01:58:14
   (data/vakten/s10-u1-nattdr-2026-09-21-ansprak.md) — racedoktrinen: deras val.
2. **Djupled (äldsta bladet)** kontrollerades och var redan levererat 2026-09-16
   (DR-FONSTERDJUP-2026-09-16.md: db-2026-09-11 restore RTO 14,5 s) — duplikat undviket.
3. **VAL: APP-DB nattpunkt 5** (dr-appdump.mjs, KEDJA 0) — u1:s anspråk lämnar
   uttryckligen dr-appdump.mjs därhän; APP-serien saknade nattfas; kl 02:50 tar
   s10-u3:s crontab-kur över dumpningen → detta vore sista manuella appdumpen.
   Anspråk låst disk-först 02:0x med P1–P10 (data/vakten/s10u2-appnattdr-2026-09-21-ansprak.md).
4. **P1 TRÄFFAD — RAM-grinden NEKADE:** `RAMGRIND: MemAvailable 404 MB < 1000 MB —
   övningen SKIPPAS (exit 75)`. Retry efter 2,5 min: 474 MB — fortfarande nekad.
   Verktyget OMODIFIERAT (syskonyta); grinden är doktrinerat skydd (incidenten
   2026-09-15 16:42: en DR-övning får ALDRIG svälta prod på minne). Restore-delen
   av ordern kunde därmed INTE levereras inatt — se fynd F1.
5. **PIVOT till RPO-nattpunkt** (dr-rpo-diff.mjs, OMODIFIERAT): strömmande mätning,
   inget lokalt PG17-fönster, körbar under RAM-taket.

## 2. RPO-NATTPUNKTEN — mätning (grön, exit 0, ~02:1x lokal)

`node verktyg/dr-rpo-diff.mjs --json data/forskning/DR-RPO-DIFF-2026-09-21-NATT.json`
(PGPASSFILE-pekare; prod ENDAST LÄST via COUNT; dumpen läst strömmande via zcat.)

| Mått | Värde |
|---|---|
| Blad 10 (db-2026-09-20.sql.gz, 02:30) COPY-total | **1 345 719 rader** — EXAKT det låsta radkontraktet (kvällens protokoll) |
| Levande prod (psql COUNT, 60 public-tabeller) | **1 365 503 rader** |
| **RPO-delta (oskyddade)** | **+19 784** vid ~23,7 h fönster — **seriens längsta mätta fönster** |
| Tabeller i rörelse | 3 av 60 |
| section_data_snapshots | +18 984 (1 252 404 → 1 271 388) — pumpens 08:00-batch, OFÖRÄNDRAD sedan kvällspunkten (dag 4: batchen kommer 08:00, ej däremellan) |
| board_decisions | +752 (50 114 → 50 866) |
| organ_health_logs | +48 (3 072 → 3 120) |
| Aritmetik | 1 345 719 + 19 784 = 1 365 503 ✓ |

**Fasanalys (rkaq = pump-universumet):** kvällspunkten 19:08 mätte +19 548; natten
02:1x mäter +19 784 → kväll→natt organisk tillväxt endast **+236 rader på ~7 h ≈
34 r/h** (board 224 = 32 r/h — kvällsrondens band 31,0–36,0 lever; organ 12; snapshots
0). rkaq är ett MASKINuniversum: ~32 r/h dygnet runt, fas-oberoende — till skillnad
från appens aufr (mänsklig trafik, tvålägesprofil dag/kväll 132–179 r/h).
Nästa 02:30-dump (blad 11) fångar alla +19 784 → RPO-fönstret nollställs mekaniskt.

## 3. F1 — GRINDFYND: fabrikens omgångar om 3 blockerar DR-restore under drift

- Tidslinje: 01:57 available ≈ 1 000 MB (u1:s dr-ovning passerade knappt 01:58) →
  02:05 **404 MB** → 02:08 474 MB. Skillnaden: fabrikens tre vakt-agenter + barn
  (fyra zcode-cli ≈ 1,7 GB + node-repl-mcp ≈ 380 MB) + u1:s PG17-fönster.
- **Implikation för DR-planeringen:** kvartalsövningen (bokad ≤2026-12-20) och
  ALLA restore-övningar (dr-ovning.mjs, dr-appdump.mjs; tröskel 1 000 MB) måste
  schemaläggas UTAN parallella fabriksomgångar — eller fabriken kör DR-uppgifter
  FÖRST i omgången innan syskonens processer växter. u1:s natt-DR hann med en
  marginal på sekunder; det är inte ett kontrakt utan tur.
- Ikraft: DR-protokollet för kvartalsövningen kompletteras med "kör i tom fabrik".

## 4. Städning (kontraktet "städa lokal PG")

Inget lokalt PG17-fönster öppnades av denna övning (RPO-verktyget rör inte PG17).
Eftermätt: **PG17 down** (pg_lsclusters) · /tmp-dumpkatalog obefintlig ·
DR-låsets pid-rad 4130025 (u1:s avslutade körning) är kvarlämnad information —
flocken är frigjord (processen död), verktygens LAS_MAX_ALDER_MS 30 min hanterar
den; ingen städning krävs, ingen gjordes (syskonyta).

## 5. Prediktionernas dom (ärlig bokföring)

- P1 (RAM-grind gränsfall) — **TRÄFFAD**: nekades på 404 MB, retry 474 MB, P1-följden
  (vänta ≤3 min, kör igen, bokför) följdes; när retry också nekades pivoterades.
- P2–P10 (APP-övningens band) — **OBESTÄMDA**: övningen kördes ej (grinden). Banden
  lämnas öppna åt kurens 02:50-blad som jämförelsebas.
- **LÄXA (ny):** pivot efter grindnek KRAVER nya förregistrerade prediktioner för
  pivotobjektet FÖRE körning — RPO-nattpunkten mättes utan låsta band (opredikterad
  mätning; värdena i §2 är råa instrumentfakta, ej prediktionsdomer).

## 6. KVD

- data-only: src/ orörd → **INGET bygge** (tsc-baslinjen bärs av pre-commit-grinden).
- R2 orörd: .pgpass ENDAST PGPASSFILE-pekare (aldrig läst/ändrad); prod-DB endast
  LÄST (COUNT); inga priser/tier/publicering.
- GDPR: endast antal rader och tabellnamn — inga personvärden.
- data/blogg/ orörd · data/backups ENDAST LÄST · syskonytor orörda (dr-appdump.mjs,
  dr-rpo-diff.mjs OMODIFIERADE; u1:s anspråk/protokoll orörda; u1:s pågående
  natt-DR-yta orörd — deras protokoll ej ännu landat vid mitt avslag).
- Verktygens AUTO-protokoll: dr-rpo-diff skriver JSON-delprotokoll (levrerat);
  handprotokoll = denna fil.

## 7. Kö (nästa vakt)

1. **02:30** blad 11 (db-2026-09-21.sql.gz) föds av crontab + markörkoll — födelsebevis.
2. **02:40** moln-JSON (system-events-full-2026-09-21.json.gz) — stänger u2:a:s
   02:40-dubbelprognos (delprognos 171 080, band [170 950, 171 250]).
3. **02:50** KURENS FÖRSTA automatiska appdump (dumpa-app-db.sh) — kvitto på att
   s10-u3:s kur levererar; jämför mot denna protokolls P2–P10-band.
4. oversättnings-stillastående: två veckor 09-17→10-01 = definitiv dom.
5. Kvartalsövning ≤2026-12-20 — **nu med F1-regeln: tom fabrik.**
