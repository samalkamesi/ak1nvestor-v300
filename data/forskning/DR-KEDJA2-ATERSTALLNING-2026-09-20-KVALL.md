# DR-ÖVNING 2026-09-20 kväll — KEDJA 2-repris: moln-JSON:ns restore-väg bevisad för 09-20 (GODKÄNT)

**Körd av:** fabriksagent s10-u2, andra instansen (manifest auto-s10-1789923906930,
spår 10 — DATAINTEGRITET & BACKUP). Anspråk disk-först 19:2x med P1–P10 låsta
FÖRE mätning: `data/vakten/s10-u2-kedja2dr-2026-09-20-ansprak.md`.
Verktyg: `verktyg/dr-kedja2.mjs` (u3:2:s, **OMODIFIERAT**) → i sin tur
`aterstall-system-events.mjs` (u3:2:s). Maskinellt protokoll:
`data/forskning/DR-KEDJA2-2026-09-20-AUTO.md`.

## Vinkel (varför detta inte är duplikat)

KEDJA 2 (molnbackupens full-JSON av appens `system_events`) hade inte körts sedan
2026-09-17 medan alla syskonmätningar 09-18→09-20 varit LIVE-mätningar (KEDJA-0)
eller SQL-blad (KEDJA 1). Samtidigt är JSON-filen appens **ENDA händelsekopia**
(u2:a-instansens RPO-mätning 19:12: gap 1 478 rader "mot ENDA kopian (02:40-JSON)") —
en kopia som innehållsmässigt var overifierad i tre dygn. Morgonens u2-stängde
u3:s köpostsband [2 400, 2 950] via **header-läsning** (168 696, commit 38d4790b);
denna övning bevisar **restore-vägen**: JSON → gzip-ström → giltighetskontrakt →
COPY → frågbar PG-tabell → oberoende omräkning. Två instrument, ett tal.

## 1. Sammanfattning för kunden (5 rader)

1. Molnbildens JSON-kopia av händelseloggarna är inte bara en fil på disk —
   vi har nu **läst in och återställt samtliga 168 696 händelser** i en
   avskild testdatabas och räknat om dem oberoende: **exakt samma tal fyra gånger**.
2. Återställningen tog **34,3 sekunder** (4 933 rader/s) och produktionen
   påverkades inte; testdatabasen raderades och serverns lokala databas
   stoppades efteråt (viloläge återställt).
3. Gårdagens prognos för dagens tillväxt **träffade**: 2 629 nya händelser
   i bandet [2 400, 2 950] — nu bevisat både via filhuvudet (morgon) och via
   den återställda databasen (denna övning).
4. Sidofynd: **översättningshändelserna har stannat** — exakt 146 190 sedan
   09-17, noll nya på tre dygn (sannolikt motorn klar: 100 % översatt är
   företagets mål). Trafikhändelserna växer däremot ~1 800/dygn.
5. Källfilen är **orörd** (SHA-256 och tidsstämpel identiska före/efter) —
   arkivet läses, skadas aldrig.

## 2. Mätetal

| Moment | Värde |
|---|---|
| Arkiv | system-events-full-2026-09-20.json.gz · 27 792 947 B · SHA-256 c8735a87… |
| Header | typ=system_events_full · antal=168 696 · sidor=34 · truncerad=false · 2026-09-20T00:40:32.857Z |
| Läsning | 168 696 rader · 0 felaktiga · 0 dubblett-id · details=null i 0 |
| RTO (totalt fönster) | **34,3 s** (COPY-fas 34,2 s · 4 933 rader/s) |
| Verktygsdom | **GRÖN, exit 0** (5 delkontrakt GRÖNA) |
| FYRA-SAMMA | header 168 696 == lästa == COPY-n == PG-omräkning == unika id 168 696 |
| Oberoende PG | rader 168 696 · unika id 168 696 · jsonb-prov 21 361 |
| Tidsfönster (events) | 2026-09-03 22:43:12,603298+02 … 2026-09-20 02:38:45,830845+02 |
| Severity | info=167 765 · warning=931 |
| Typer | oversattning=146 190 · trafik=21 361 · sakerhet=1 031 · akm2_snapshot=101 · blogg_utkast=9 · medlem=3 · blogg_publicerad=1 |
| Städning | ak1a_dr_json raderad · PG17 stoppad/nere · /tmp ren · arkiv-ENDAST-LÄST verifierad |

Referens 09-17 (senaste KEDJA 2-körning): 163 039 rader · RTO 25,0 s.
Tillväxt 09-17→09-20: +5 657 rader på 3 dygn (≈1 886/dygn).

## 3. Prediktionsdom (P1–P10 låsta i anspråket FÖRE körning)

| P | Låst band | Mätt | Dom |
|---|---|---|---|
| P1 | total ∈ [168 467, 169 017] | 168 696 | ✅ |
| P2 | dagssteg ∈ [2 400, 2 950] (u3:s köpost) | 168 696 − 166 067 = **2 629** | ✅ |
| P3 | GRÖN exit 0 · RTO ∈ [15, 40] s | GRÖN · 34,3 s | ✅ |
| P4 | fyra-samma-kontrakt | 168 696 × 4 + unika id | ✅ |
| P5 | max(tid) ∈ [02:39:30, 02:40:30] | **02:38:45**,830 | ❌ |
| P6 | warning ∈ [600, 950] | 931 | ✅ (nära taket) |
| P7a | oversattning ∈ [150 500, 153 000] | **146 190** | ❌ |
| P7b | trafik ∈ [16 000, 17 500] | **21 361** | ❌ |
| P7c | sakerhet ∈ [700, 950] | **1 031** | ❌ (marginellt) |
| P7d | akm2_snapshot ∈ [100, 115] · medlem ≥ 3 | 101 · 3 | ✅ (101 EXAKT oförändrad) |
| P8 | jsonb-prov == trafik exakt | 21 361 == 21 361 | ✅ |
| P9 | SHA-256 + mtime oförändrade | c8735a87… · 02:40:46,267 identiska | ✅ |
| P10 | städning komplett | allt verifierat | ✅ |

**Summa: 7 ✅ / 3 ❌** (P5, P7a–c räknat som tre domar) — ärligt bokförda rotorsaker:

- **P5 (referenspunktsfel):** bandet byggdes runt dumpens START-tid (02:40:32+02),
  men sista eventet skrivs FÖRÄRAN — molnexporten eftersläpar 107 s. Korrigerat
  band för framtiden: max(tid) ∈ [dumpstart − 300 s, dumpstart].
- **P7 (fel tillväxtmodell — samma klass som u2:a-instansens "fönstermedel ≠
  fas"-läxa):** linjär skalning av 09-17-fördelningen förutsatte att ALLA typer
  växer. Verkligheten: oversattning FROSEN (motorn stilla), trafik/sakerhet
  kvällsväxer snabbare än dygnsmedel. Fynd, inte mätfel — se § 4.

## 4. FYND (bokförs som observationsposter; cron-yta = huvudagentens)

1. **ÖVERSÄTTNINGSMOTORN STILLA:** oversattning=146 190 EXAKT oförändrad sedan
   09-17 (DR-KEDJA2-2026-09-17-AUTO: 146 190). Noll nya på 3 dygn. Trolig orsak:
   100 %-översättningsmålet uppnått (AGENTS.md: kurserna 100 % översatta) ⇒ motorn
   har inget kvar att skriva. Om nästa veckas JSON fortfarande visar 146 190 är
   stillastånDET bevisat två veckor — observationspost till spårets kö.
2. **TRAFIKKOPPAR LEVER:** trafik 15 915 → 21 361 (+5 446 / 3 dygn ≈ 1 815/dygn;
   kvällstyngt). DNA-blockeringens händelseflöde växer med sajtens trafik.
3. **akm2_snapshot = 101 OFÖRÄNDRAD** i aufr-events medan pumpens snapshots-batch
   skriver +18 984/dygn i rkaq-bladen — snapshots-eventen i app-projektet är ett
   ENGTALSFÖNSTER (skrevs vid ett tillfälle), inte en kontinuerlig serie. Räkna
   ALDRIG akm2_snapshot-events som snapshot-backup-bevis.
4. **Molnexportens eftersläpning:** header-tid 00:40:32Z vs sista event 00:38:45Z
   = 107 s — kedja 2:s "02:40-punkt" mäter faktiskt 02:38:45. Relevant vid
   RPO-beräkningar mot live-klockan.

## 5. KVD

- data-only: **src/ orörd = INGET bygge** (tsc-baslinjen bärs av pre-commit-grinden).
- **R2 orörd** (priser/tier/publicering ej berörda; crontab orörd).
- **data/blogg/ orörd.** data/backups/ ENDAST LÄST (P9-bevis).
- Syskonytor orörda: u1:s/u2-förstainstansens/u3:s protokoll orörda;
  dr-kedja2.mjs + aterstall-system-events.mjs OMODIFIERAT (deras yta).
- GDPR: protokollet redovisar ENBART antal och typer — inga personuppgifter,
  inga details-innehåll.
- Återställningsögonskad skyddad: flock-delat fönster (samme fil som dr-ovning),
  PG17 start → restore → garanterad städning i finally.

## 6. Kö vidare

- Blad 11:s födelsebevis 2026-09-21 02:30 (syskonens gemensamma post).
- Observationspost: oversättnings-stillastående + akm2_snapshot-entalsfönster —
  följs upp mot nästa JSON (09-21 02:40); om oversattning fortfarande 146 190
  bokförs stillaståendet som två-veckorsbevis.
- Kvartalsövning senast 2026-12-20 (mall: dr-total, båda kedjorna + offsite).
