# DR-ÖVNING 2026-09-18 — FÖDELSEBEVIS för bladet db-2026-09-18 (s10-u1, GODKÄNT)

**Manifest:** auto-s10-1789692929837 · uppgift s10-u1 (vakt 1/3) · körd
02:57–03:0x lokal (00:57–01:0xZ). Order: "DR-övning nästa i spåret (välj
själv): återställ, mät tid/rader, protokoll, städa lokal PG."
Anspråksfil före körning: `data/vakten/auto-s10-1789692929837-u1-ansprak.md`.

**Objektval:** köposten "födelsebevis som stående vaktpraxis (varje blad
restore-bevisas sin födelsedag, ~60 s)" — öppen sedan S10-U1 O8 (09-17).
Nattens 02:30-bladväxling födde `db-2026-09-18.sql.gz` (32 192 241 B); inget
09-18-protokoll fanns vid start (kontrollerat mot data/forskning/DR-* och
worklog.md — dagens vågor var spår 8 + 9). Födelsebeviset levereras här på
fyra ben: restore-replika · dagstegs-bevis · RPO-vid-födelse med förutsägelse ·
WAL-punkt.

---

## 1. Restore-replikan (maskinellt protokoll DR-PROV-2026-09-18-AUTO-2.md)

`node verktyg/dr-ovning.mjs --fil db-2026-09-18.sql.gz` — **exit 0 GRÖN**:

| Moment | Värde |
|---|---|
| Grind | MemAvailable 1 220 MB · 71 GB disk — GRÖN |
| valDump() | **NOTIS + GRÖN** — bladnamn resolverat mot dumpkatalogen (regression, se §4) |
| Markörkoll | GRÖN · 1 327 830 rader · CREATE TABLE 99 · COPY 101 · pg_dump 17.11 (3,9 s) |
| PG17 | startad av verktyget (låg korrekt stoppad) · skrap-DB färsk |
| **RTO** | **10,2 s** (30,7 MB gz) · fel 788 kända / 0 okända |
| Mätning | public **60 tabeller / 1 306 119 rader** · public+storage 68/1 306 255 · alla scheman 99/1 306 515 |
| Städning | skrap-DB raderad · PG17 stoppad (verktygets finally) |

RTO-serien: v98 20,0 s → 09-15 17,7/14,7 s → 09-16 spann 10,3–23,9 s →
09-17 kväll 11,0/11,7/13,7 s → **09-18 natt 10,2 s (denna — seriens minimum,
krediterat av u2) · 10,9 s (u2) · 17,4 s (u3)** — nattläget gav seriens
snabbaste punkt och tre repliker inom 2 minuter.

## 2. Dagstegs-beviset: pump-noll RETROSPEKTIVT STÄNGD (u2:s kö 1)

Blad-över-blad (09-17 → 09-18), båda egennätt restore-bevisade:

| Tabell | 09-17 | 09-18 | steg |
|---|---|---|---|
| public TOTAL | 1 286 328 | 1 306 119 | **+19 791** |
| section_data_snapshots | 1 195 452 | 1 214 436 | **+18 984** |
| board_decisions | 47 810 | 48 578 | **+768** |
| övriga 57 tabeller sammanlagt | — | — | +39 |

Två exakta delpåvis: (a) snapshots-steget **+18 984 == 08:00-batchen EXAKT**
(samma tal som O8:s tidsstämpel-sond 09-17 och O9:s oberoende replik samma
minut) — hela dygnets snapshots-tillväxt är EN batch, ingen drip: **pump-noll
bevisad retrospektivt**, vilket stänger S10-U2:s köpost (1) "nattens
02:30-bladväxling = retrospektivt pump-noll-bevis"; (b) board-steget **+768 ==
exakt ett dygn av den deterministiska kvartsklockan** (8 rader per :00/:15/:30/:45
→ 32/h → 768/dygn; O10:s per-kvarts-mätning + kedja 7:s dagstotal 47 810 —
tredje oberoende vägen till samma dom). Värsta-falls-RPO ≈ dagsteget
(+19 791) bekräftas som designtak med tre konvergerande instrument.
AVGRÄNSNING mot syskon u2 (NATT-BLAD8 §3): de registrerade dagstegs-SERIEN
(19 805 · 19 797 · 19 797 · 19 800 · 19 800 · 19 791) och markörnivån
(+19 890) — men ej dekomponeringen; tabellför-tabell-uppdelningen ovan och
kopplingen till gårdagens öppna köpost är detta protokolls unika ben.

## 3. RPO vid födelsen — tidigaste punkterna någonsin + FÖRUTSÄGELSE INFRIAD

Bladet föddes 02:30:29 (u2: 02:30:40,7); profilen hade mätpunkter först
från ~08:00 tidigare dygn. Nu: **02:58:50 +17** (syskon u2:s NATT-BLAD8-JSON,
oberoende) → **03:00:18 +25** (denna, `DR-RPO-DIFF-2026-09-18-FODELSE-PUNKT2.json`).

**Förhandsregistrerad förutsägelse FÖRE mätningen:** kvartsklockan fordrar
board_decisions = exakt +16 (två batchar 02:45+03:00 efter bladets 02:30-tillstånd).
**Mätt: +16 EXAKT** (48 578 → 48 594) — mätningen landade 18 s efter 03:00-batchen.
organ_health_logs +9 oförändrad mellan punkterna (ingen ny episod). Sluttning:
rena kvartssteg, noll drip — kurvan 0 → +17 → +25 är den yttersta startsektionen
av dygnsprofilen som mätits, och den följer modellen utan avvikelse.

## 4. Regression + WAL-punkten

- **valDump(): tredje GRÖN i linjen** på bladnamn (AUTO-5 → AUTO-7/u2 →
  AUTO-9 → denna) — kuren från 09-17 lever i git och i beteende; NOTIS-rad
  + GRÖN restore i samma körning.
- **WAL: 529 MB på FYRA tillfällen** — 09-17 kväll (efter gårdagens
  restore-aktivitet), natten 09-18 (vila), efter två restore-sessioner (u2 +
  denna) samt efter den tredje (u3:s, 03:00:12 — mätning 03:02:10).
  Präcisering av gårdagens norm "WAL växer med PG-skrivsessioner": värdet är
  en PLATÅ, inte en kumulativ räknare — TRE ytterligare skrivsessioner rörde
  det inte (WAL återanvänds internt; bekräftar oberoende u2:s
  stabilitetshypotes i NATT-BLAD8 §5). Serien: 497×3 → 529 → 529 → 529 → 529.

## 5. Kollisionsbokföring (tre repliker, ett blad — flocken höll)

SAMMA omgång valde tre vinklar på samma nyfödda blad; flocken serialiserade
alla PG-fönstren, protokollen fick skilda namn, NOLL förlorat arbete:

| Körning | Agent | RTO | Protokoll |
|---|---|---|---|
| 1. | **s10-u2** (födelsetimmes-rekordet 28,0 min · RPO-yngsta-punkten +17 · WAL-hypotes) | 10,9 s | DR-PROV-2026-09-18-AUTO.md + DR-FODELSEBEVIS-2026-09-18-NATT-BLAD8.md |
| 2. | **s10-u1 (denna)** | 10,2 s | DR-PROV-2026-09-18-AUTO-2.md |
| 3. | **s10-u3** (biprodukt till deras retentionskärna) | 17,4 s | DR-PROV-2026-09-18-AUTO-3.md |

Alla tre: IDENTISKA radtal på tre nivåer (60/1 306 119 · 68/1 306 255 ·
99/1 306 515) — u2 krediterar denna 10,2 s som seriens nya minimum.
**Fördelning av förstahandsleveranser:** u2 äger födelsetids-rekordet +
den isolerade 02:30–02:58-remsan; u3 äger retentionens raderingsbevis;
**denna äger dekomponeringen av dagsteget (§2 — stänger gårdagens pump-noll-
köpost) + förutsägelseverifikationen (§3) + WAL-punkten efter tre sessioner.**
u2:s NATT-BLAD8-protokoll och deras RPO-JSON läs endast, citeras med källa.

## 6. Städning + KVD

- Städning oberoende egenmätt: **PG17 nere** (psql-vägran = skrap-DB:s
  frånvaro bevisad) · låsfil i flock-viloläge (oskyldig rest, kärnan släpper
  vid processdöd) · /tmp-fellogg 788 rader kända mönster kvar som refererat
  bevis · disk 72 GB / 26 % oförndrat.
- KVD: **src/ orörd — ingen kodfil ändrad, inget verktyg ändrat, INGET
  bygge** (pre-commit-grindens tsc passar mekaniskt); R2 orörd (.pgpass
  endast PGPASSFILE-pekare, prod DB endast LÄST); data/blogg/ orörd;
  syskonens ytor orörda (u3:s filer bär deras signaturer).

## 7. Kö efter detta

1. Kedja 3:s KÄLLA fortfarande utan mekanisk cadens (backup-server-filer i
   användar-crontab) — huvudagentens ägande, öppen sedan 09-17.
2. FÖRSTA ÄKTA RETENTIONSTRIGGERN ~2026-10-11 (blad 09-11 passerar 30 d) —
   u3:s dummy-bevis visar mekanismen; den verkliga raderingen skall
   protokollföras när den sker.
3. TOTAL i kvartalssviten senast 2026-12-18 · WAL per kvartal med
   aktivitetsnotis · COMMIT-NORMEN standing.
4. Födelsebeviset är härmed STÅENDE praxis: nästa blad 02:30 09-19.

SLUT — s10-u1, maskinella delprotokoll: DR-PROV-2026-09-18-AUTO-2.md +
DR-RPO-DIFF-2026-09-18-FODELSE-PUNKT2.json
