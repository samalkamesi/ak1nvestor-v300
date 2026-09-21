# DR-KEDJA 2 — ÅTERSTÄLLNINGSPROV KVÄLL 2026-09-21 (moln-JSON:ns restore-väg för 09-21-bladet)

**Spår 10 · s10-u1 (manifest auto-s10-1790010927032, vakt 1/3) · 19:18:4x–19:20:30 lokal.**
Anspråk disk-först 19:18 lokal: `data/vakten/auto-s10-1790010927032-s10-u1-ansprak.md`
(P1–P6 låsta FÖRE körning). Orderns fyra led: återställ · mät tid/rader ·
protokoll · städa lokal PG.

## Val och duplikatkontroll

Moln-JSON-bladet för 09-21 (`system-events-full-2026-09-21.json.gz`, fött
02:40:50) hade restore-vägen senast bevisad för **09-20**-bladet (s10-u2
kvällspass). Nattens instanser mätte 09-21-bladets header (170 979) men körde
restore ENDAST på app-bladet — kvällens objekt fritt. Avstådda alternativ
dokumenterade i anspråket (blad 12 + kurens dag-2-kvitto = imorgon natt;
kvälls-RPO = u2:a-instansens serie; kvartalsövning ≤2026-12-21 med F1-regeln).

## Körning

`node verktyg/dr-kedja2.mjs` **OMODIFIERAT** (u3:2:s verktyg, endast kört) ·
flock `/tmp/ak1a-dr-prov.lock` · grind OK (MemAvailable 1 571 MB · 50 GB disk) ·
PG17 startad av verktyget · färsk skrap-DB `ak1a_dr_json` · DDL ur
`db-2026-09-21.sql.gz` · `aterstall-system-events.mjs --db` · **EXIT 0 · DOM GRÖN**.

## Resultat

| Moment | Värde |
|---|---|
| Arkiv | system-events-full-2026-09-21.json.gz · 27 898 867 B · SHA256 `f8dc5cf0…ac036c` |
| Header | datum=2026-09-21T00:40:40.133Z · antal=170 979 · sidor=35 · truncerad=false |
| Läst ur gzip-ström | 170 979 rader · 0 felaktiga · 0 dubblett-id |
| COPY-n | 170 979 |
| Oberoende PG-omräkning | 170 979 · unika id 170 979 |
| **Kontrakt** | **FYRA SAMMA: header = läst = COPY = PG (+ unika)** |
| **RTO** | **104,5 s** (totalt fönster 104,7 s · 1 637 rader/s) |
| Tidsfönster | 2026-09-03 22:43:12 → 2026-09-21 02:40:02 lokal (18 dygn) |
| Severity | info=169 966 · warning=1 013 |
| Typer | oversattning=146 190 · trafik=23 535 · sakerhet=1 140 · akm2_snapshot=101 · blogg_utkast=9 · medlem=3 · blogg_publicerad=1 |
| jsonb-prov (details->>'dag') | 23 535 **== trafik EXAKT** (andra dagen klassen håller kontraktet) |
| Städning | `ak1a_dr_json` raderad (finally) · PG17 stoppad av fönstret |

Maskinprotokoll: `DR-KEDJA2-2026-09-21-AUTO.md` (verktygsgenererat).

## Prediktioner: 4/6 (2 EXAKTA räknplus)

| # | Låst (FÖRE körning) | Faktiskt | Dom |
|---|---|---|---|
| P1 | COPY = 170 979 EXAKT | 170 979 | ✅ EXAKT |
| P2 | unika id = 170 979 | 170 979 | ✅ EXAKT |
| P3 | RTO ∈ [30, 40] s | 104,5 s | ❌ (se fynd 1) |
| P4 | warning ∈ [900, 1 000] | 1 013 | ❌ (13 över — bandet satt för snävt mot faktisk tillväxt) |
| P5 | jsonb-prov ∈ [22 500, 24 500] | 23 535 | ✅ (+ kontraktet jsonb == trafik EXAKT) |
| P6 | verktyget städar självt | raderad + stoppad | ✅ |

## Fynd

1. **F1-KVÄLL — RTO 104,5 s = seriens första >100 s, 3,0× nattens band.**
   Serien: 09-17 25,0 s @ 163 039 (6 522 r/s) → 09-20 34,3 s @ 168 696
   (4 933 r/s) → **09-21 104,5 s @ 170 979 (1 637 r/s)**. Rot: KONKURRENS,
   inte arkivet (header-kontrakt GRÖN, 0 felaktiga, 0 dubbletter). Belägg:
   load average 6,48/5,21/4,22 vid fönstrets slut; fabrikens omgång om 3
   barn aktiva; syskonens DR-väntare i flock-kö; 5,4 GB swap i bruk (kall
   sidcache på 27,9 MB-arkivet orört sedan 02:40, 17 h). **Konsekvens för
   kvartalsövningen ≤2026-12-21: F1-regeln utökas — TOM fabrik krävs inte
   bara för RAM-grinden (>1 000 MB) utan för RTO-bandet: restore under
   lastad server landar ~3× långsammare. Band vid låg last: 25–40 s.**
2. **Dagssteg bekräftat på restore-vägen:** 168 696 → 170 979 = **+2 283**
   (nattens header-mätning håller; moln-JSON:ns växthastig het oförändrad).
3. **trafik 21 361 → 23 535 = +2 174/dygn** — kvällsväxande dygnsrytm
   bekräftad tredje punkten.
4. **oversattning 146 190 EXAKT stilla — dag 4** (0 nya sedan 09-17).
   Köposten består: två veckors stillastående från 09-17 ⇒ definitiv dom
   2026-10-01.
5. **Flock-serialisering bevisad i realtid:** AUTO-protokollet tidsstämplas
   19:20:29.914 lokal; syskonets dr-ovning.mjs-fönster (pid 561547, kedja 1
   på db-2026-09-21.sql.gz → ak1a_dr_test) tog låset 19:20:30.078 — 164 ms
   senare. Inget fönster krockade; PG17 online vid min eftermätning 19:20:55
   = SYSKONETS PÅGÅENDE fönster (deras städning, inte min — mitt fönster
   lämnade PG stoppad enligt kontrakt, bevisat av verktygets finally-rad).
6. **Cross-kedja:** nattens app-blad bar system_events 170 980 = moln-JSON
   170 979 + 1 (känd kedjekors) — restoren bekräftar moln-sidans tal exakt.

## Städning lokal PG (orderns steg 4, oberoende eftermätt)

- `ak1a_dr_json` raderad av verktygets finally (dropdb ok) ✅
- PG17 stoppad vid MITT fönsters slut ✅ (därefter startad av syskonets
  pågående DR-fönster — deras ansvar; icke-störning bevisad av flock-kön)
- Arkiv ENDAST LÄST: SHA256 + mtime byte-identiska före/efter ✅
- /tmp: inga egna lämnade filer (flock äger låsfilens livslängd) ✅

## KVD

- src/ orörd = **INGET bygge** (ingen kodfil rörd; pre-commit-grinden bär
  typnoll-baslinjen vid commit).
- R2 orörd (priser/tier/publicering) · data/blogg/ orörd (live-mannen).
- data/backups ENDAST LÄST (SHA+mtime bevis) · supabase-dump ENDAST LÄST
  (DDL-källa; SHA `edaf69cf…6f006`).
- Syskonytor orörda: dr-kedja2.mjs + aterstall-system-events.mjs KÖRDA
  endast; syskonets pågående dr-ovning-fönster ej stört.
- GDPR: protokollet bär endast antal/typer — inga personuppgifter.

## Kö

- Blad 12:s födelsebevis 09-22 02:30 (u3:s formel: board ≈ 51 650 ·
  public ≈ 1 385 319 om modalt steg).
- Kurens (crontab 02:50) dag-2-kvitto 09-22.
- Kedja-2-blad 12:s restore-väg (morgondagens kvällspass).
- Oversättnings-stillastående: definitiv dom 2026-10-01.
- Kvartalsövning ≤2026-12-21 i TOM fabrik — F1 utökat: RAM-grind + RTO-band
  (3×-fall dokumenterat här).

SLUT — s10-u1, 2026-09-21 19:2x lokal.
