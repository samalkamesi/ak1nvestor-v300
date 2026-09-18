# DR-ÖVNING 2026-09-17 (kväll, total) — KVARTALSMALLEN GRÖN I KVÄLLSLÄGE + O9:S KÖPOST (2) STÄNGD KOMPLETT (s10-u1, manifest auto-s10-1789671929408 1/3)

**Uppdrag (fabriksmanifest spår 10 vakt 1/3):** "DR-övning nästa i spåret
(välj själv): återställ, mät tid/rader, protokoll, städa lokal PG."

**Objektval + duplikatkontroll.** Anspråk FÖRE ingreppet
(data/vakten/auto-s10-1789671929408-u1-ansprak.md, ~21:12). Läge vid start
21:07–21:12, allt sedan morgonen levererat + kvällen pågår i kullen:

- Syskon s10-u2 (2/3): kvälls-DR tagen — AUTO-6 (21:07) underkänd med falsk
  RÖT → regression upptäckt (valDump-kuren ALDRIG committad; endast
  dokumenterad i O9:s commit-meddelande), kur återlevererad 21:08:24,
  beteendeprov AUTO-7 (21:08, GRÖN RTO 11,0 s = seriepunkt 20), kvälls-RPO
  21:09 (DR-RPO-DIFF-2026-09-17-KVALL.json), COMMIT 9d24c73b. Deras ytor
  orörda av mig; deras protokoll DR-OVNING-2026-09-17-KVALL-RPO.md läst.
- Syskon s10-u3 (3/3): DR-BESLUTSKLOCKA-2026-09-17-KVALL.json (O9:s kö 4 —
  captured_at-histogrammet) + dr-kedja3-lopp 21:12 (DR-KEDJA3-AUTO.md) —
  deras objekt, deras filer lämnas orörda/ocommitterade.
- Kvar öppet, EXAKT matchande mitt val: **O9:s köpost (2)** — "valDump()-
  kuren testas i dr-total.mjs-kontext (dess kedja 1-anrop använder absolut
  väg — oförändrat beteende förväntas)" — bekräftad öppen ÄVEN i u2:s
  kvällscommit ("kvarstår … vid nästa total") och av u2:s formulering
  "dr-total.mjs-kontexten bör testa NOTIS-vägen explicit vid nästa total".

**Valt objekt: KVÄLLS-TOTAL — kvartalsmallen `dr-total.mjs` i kvällsläge**
(dagens första TOTAL på 09-17) + den explicita NOTIS-grenens bevis. Uppdragets
fyra verb: dr-total-körningen (återställ ×5 kedjor + mät tid/rader), detta
protokoll (proto), §4 (städa lokal PG — egenmätt).

---

## 1. Körningar och mätvärden

`node verktyg/dr-total.mjs` 21:12–21:16 lokal, **exit 0 — samtliga fem
kedjor GRÖNA i kvällsläge** (fabrikskväll, RAM-grind GRÖN 1 107 MB vid
start). Väggklocka per barn:

| Kedja | Verktyg | Exit | Tid | Delprotokoll |
|---|---|---|---|---|
| 1 SQL-dumpen | dr-ovning.mjs | 0 | 19,9 s | DR-PROV-2026-09-17-AUTO-8.md |
| 5 Kirurgi (EN tabell) | dr-kedja5.mjs | 0 | 73,2 s | DR-KEDJA5-2026-09-17-AUTO.md |
| 2 system_events (JSON) | dr-kedja2.mjs | 0 | 34,6 s | DR-KEDJA2-2026-09-17-AUTO-2.md |
| 4 Per-typ-snapshots | dr-kedja4.mjs | 0 | 28,5 s | DR-PROV-2026-09-17-KEDJA4-2.md |
| 3 Serverfils-arkivet | dr-kedja3.mjs | 0 | 24,7 s | DR-KEDJA3-2026-09-17-AUTO-2.md |
| **TOTALT** | — | — | **180,9 s** | DR-TOTAL-2026-09-17-AUTO.md (GODKÄNT) |

Nyckeltal: kedja 1 **RTO 11,7 s** (markörkoll 3,9 s · fel 788 kända/0 okända
· public **60 tabeller / 1 286 328 rader** · +storage 68/1 286 464 · alla
scheman 99/1 286 724). Kirurgin: källa 1 195 452 rader (checksumma
4ae9852b…), sabotage VÄGRADES med rullbak, receptet återställde 1 195 452
rader på 12,9 s med IDENTISK checksumma. Kedja 2: 163 039 rader, 0 felaktiga,
0 dubblett-id, COPY 5 631 rader/s.

**RTO-serien** (bladet db-2026-09-17): kvällens punkter 20 (u2, 11,0 s) ·
21 (denna, kedja 1, 11,7 s) · 22 (denna, NOTIS-run, 13,7 s) — spannet
10,3–23,9 s oförändrat; tre kvällspunkter i fabriksbelastning, samtliga väl
under v98 F3:s 20,0 s. Radtalet 1 286 328 nu bevisat av SJU oberoende
instrument samma dygn (morgon ×2 · eftermiddag ×2 · kväll ×2 · zcat-COPY).

## 2. Köpost (2) STÄNGD KOMPLETT — valDump-kuren i dr-total-kontext

**(a) Designbevis (kod):** dr-total startar barnen UTAN `--fil` (spawnSync
`[verktyg]` med `cwd: REPO_ROT`, dr-total.mjs ~rad 235) → kedja 1 faller tillbaka
på `hittiSenasteDump()` = **absolut** dumpkatalogväg → valDumps
DUMP_KATALOG-gren (NOTIS-rad) kan **ej** triggas i total-kontext. O9:s
förväntan "oförändrat beteende" därmed BEVISAT: AUTO-8 GRÖN utan NOTIS-rad.

**(b) Explicit NOTIS-bevis (kvällsfönstret):** efter totalen kördes exakt det
bladnamns-kommando som AUTO-6 fällde på: `--fil db-2026-09-17.sql.gz` →
**NOTIS-rad** ("hittades ej på given sökväg — resolverad mot dumpkatalogen")
+ **GRÖN** fullkörning, RTO 13,7 s, identisk radbild, städad (AUTO-9,
21:18).

**Beviskedjan komplett:** AUTO-5 (14:33, NOTIS före kur-förlusten) →
AUTO-7 (21:08, u2 — default-vägen GRÖN efter återleveransen) → **AUTO-9
(21:18, denna — bladnamnsgrenen GRÖN med NOTIS)**. Regressionen (§3) har
ingen kvarvarande obevisad gren; u2:s önskning "testa NOTIS-vägen explicit
vid nästa total" infriad av (a)+(b).

## 3. Oberoende forensik: AUTO-6:s falska RÖT (korsvaliderar u2:s §3)

Mina egna mätningar, alla replikerbara, tagna OBEROENDE av u2 innan deras
protokoll lästes:

1. **Dumpen är oskadd:** 31 733 199 B, mtime 02:30:29 (född 02:30:01),
   `gzip -t` OK, slutmarkörerna ("-- PostgreSQL database dump complete" +
   `\unrestrict`) på plats i svansen.
2. **Egen markörkoll 21:09:51: GRÖN** — 1 307 940 rader · 4,7 s · exit 0.
3. **137 ms-beviset:** AUTO-6:s hela körning tog 137 ms (lås 19:07:21.786Z →
   protokollrad 19:07:21.923Z); en äkta markörkoll av detta blad tar ~4–7 s
   ⇒ verktyget hann ALDRIG läsa filen ⇒ snabb-RÖT-grenen "Filen kunde inte
   läsas (finns den?)" = AUTO-3-klassen (sökvägsupplösning), inte dumpskada.
4. **Git-beviset:** sista commit som äger verktyg/dr-ovning.mjs före kvällen
   = c3b871f7 (09-16) — valDump-kuren fanns ALDRIG i historiken; disken var
   vid 21:07 pre-kur. Mina observationer (M +16/−1 vid 21:09, mtime 21:08:24)
   fångar u2:s återleverans på väg; deras commit 9d24c73b landade ~21:1x och
   statusen är nu ren — COMMIT-NORMEN (skrivning + beteendeprov + commit i
   samma fönster) följd.

Slutsats: AUTO-6 var en sann fail-fast (PG17 orörd, rätt vägranriktning) på
fel grund — instrumentläget (pre-kur-kod) dömde ett sunt blad RÖTT. U2:s
rotorsak ("aldrig committad kur = ingen kur") bekräftad oberoende; mitt
bidrag är tidsevidensen (137 ms) + git-historikbeviset + den kompletta
gren-bevisningen i §2.

## 4. Städning — egenmätt (uppdragets fjärde led)

- `pg_lsclusters`: 17/main **down** ✓ (efter varje kedja + slutläge)
- base/: ENDAST systemdatabaserna OID 1/4/5 + tom pgsql_tmp — noll
  skrap-svans ✓
- **pg_wal 529 MB — seriens FÖRSTA RÖRELSE** (497×3 under dagen, u2:s
  punkter i läsläge → 529 efter kvällens restore-aktivitet: u2:AUTO-7 +
  totalens fem kedjor). Tolkning: WAL är stabil under läsning men växer med
  PG-skrivsessioner; långt under 1 GB-taket. Kö vidare: WAL-mätning
  protokollför aktivitetskontext (läge/fönster) hädanefter.
- Disk 72 GB ledigt (26 % använt) ✓ · /tmp-felloggar enligt mall (dagens
  samlade 788-raderslogg sparad) · båda låsfilerna i flock-viloläge utan
  hållare ✓

## 5. Slutsatser + kö

- **Kvartalsmallen är ETT kommando i alla dagslägen:** natt (01:5x), dag
  (09-16 ×3) och nu kväll/fabriksbelastning — TOTALT 180,9 s, alla kedjor
  GRÖNA. Nästa kvartalsövning: **senast 2026-12-17**, `node verktyg/dr-total.mjs`.
- **O9:s köpost (2) STÄNGD** (§2) — med designbevis + explicit NOTIS-bevis.
- **WAL-serien:** första rörelsen bokförd (497→529); kvartalsserien fortsätter
  med aktivitetsnotis.
- Spårets 09-17 är därmed fullstädigt: RPO-profilen komplett över hela dygnet
  (natt · morgon · middag · eftermiddag · kväll — pump-noll + beslutsklockans
  34 r/h dygnssnitt), 7-bladsfönstret restore-bevisat, regressionen kurerad
  OCH committad, kvartalsmallen kvällsbevisad.
- Kö till nästa: (1) nattens 02:30-bladväxling = retrospektivt pump-noll-bevis
  (u2:s kö); (2) WAL-punkt per kvartal med aktivitetsnotis; (3)
  COMMIT-NORMEN standing (u2); (4) TOTAL i kvartalssviten 2026-12-17.

KVD: src/ orörd = **INGET bygge** (ingen kod ändrad av mig; tsc-baslinjen
orörd — pre-commit-grinden verifierar); R2 orörd; data/blogg/ orörd;
u2:s och u3:s ytor orörda (deras protokoll, deras verktygsändring lämnad åt
deras commit); node-kanalen genomgående.

— protokollfört 2026-09-17 ~21:2x lokal av s10-u1 (vakt 1/3); maskinella
delprotokoll: DR-TOTAL-2026-09-17-AUTO.md + DR-PROV-2026-09-17-AUTO-{8,9}.md
+ DR-KEDJA5-2026-09-17-AUTO.md + DR-KEDJA2-2026-09-17-AUTO-2.md +
DR-PROV-2026-09-17-KEDJA4-2.md + DR-KEDJA3-2026-09-17-AUTO-2.md
