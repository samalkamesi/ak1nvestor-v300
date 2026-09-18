# DR-ÖVNING 2026-09-18 MORGON-PUMP — pumpens LEVANDE landning bevisad (GRÖN)

**Agent:** s10-u2, vakt 2/3, manifest auto-s10-1789704300078
**Anspråk:** `data/vakten/auto-s10-1789704300078-u2-ansprak.md` — skrivet
FÖRE mätstart med förhandsregistrerade prediktioner (u1:s metod).
**Tid:** 2026-09-18 08:09–08:13 lokal (06:09–06:13 UTC).

---

## 1. Sammanfattning för kunden (5 rader)

1. Klockan 08:00 varje morgon skriver serverns automatik en stor daglig
   batch data. Idag mätte vi **medan den var helt färsk** — för första
   gången i realtid, inte i efterhand.
2. Vi hade **gissat klart i förväg exakt hur många rader** batchen skulle
   innehålla — och gissningen träffade **på raden**: 18 984 rader, exakt
   som gårdagen.
3. Även den lilla beslutsklockan (8 rader varje kvart) träffade exakt:
   176 rader = 22 kvart, inte ett enda missat.
4. Sedan återställde vi hela databasen från backup igen — **13,5 sekunder**,
   alla 60 tabeller och 1 306 119 rader tillbaka — och städade bort
   testdatabasen efteråt. Produktionen påverkades aldrig.
5. Slutsats: backupens dagliga rytm är nu förutsägbar på minuten —
   vi vet exakt vad som är skyddat och vad som väntar på nattens blad.

## 2. Det nya: pump-noll-hypotesen bevisad LEVANDE (tredje vägen)

Fram till idag var "hela dygnets snapshots-tillväxt sker i EN enda batch
kl 08:00" bevisat endast i efterhand:

| Väg | Bevis | Agent |
|---|---|---|
| 1. Retrospektiv blad-diff | blad 7→8: snapshots +18 984 == en batch | s10-u1 natten |
| 2. captured_at-sond | batchens 18 984 rader bär EN tidsstämpel 08:00:00,058 | s10-u1middag (09-17) |
| **3. Realtids-diff (denna)** | levande COUNT kl 08:09 == gårdagens batchtal EXAKT | **s10-u2 (denna)** |

Mätningen körde 08:09:16 lokal — 9 minuter 16 sekunder efter pumpen.
Om pumpen droppat eller dubbelkört hade talet avvikit; det gjorde det inte.

## 3. Förhandsregistrerade prediktioner — samtliga infriade

Anspråksfilen skrevs 08:07, mätningarna 08:09–08:12.

| Tabell | Prediktion (08:07) | Mätt (08:09) | Dom |
|---|---|---|---|
| section_data_snapshots | +18 984 ± 100 | **+18 984** | **EXAKT** |
| board_decisions | +176 ± 24 | **+176** | **EXAKT** (22 kvart × 8, 0 missade) |
| organ_health_logs | 0–18 | +12 | inom intervall |
| övriga 57 tabeller | ≤ +10 | +0 (3 av 60 i rörelse) | inom |
| **RPO-delta totalt** | +19 140 – +19 260 | **+19 172** | mitt i intervallet |

Källprotokoll: `DR-RPO-DIFF-2026-09-18-MORGON-PUMP.json` (maskinellt).
Fönster: blad fött 02:30:40 → mätning 08:09 = 5 h 38,6 min.
RTO-bonusprediktionen 10–18 s → mätt 13,5 s: infriad.

## 4. Restore-övningen (blad 8, fjärde punkten — seriens första post-pump)

`node verktyg/dr-ovning.mjs --fil /home/ak1a/AK1/data/backups/supabase/db-2026-09-18.sql.gz` — **exit 0, GRÖN**:

- Markörkoll: GRÖN — 1 327 830 rader · CREATE 99 · COPY 101 (5,5 s)
- **RTO 13,5 s** (30,7 MB gz) — seriens punkt ~23; blad 8:s fyra punkter:
  10,2 (u1 natt) · 10,9 (u2 natt) · 17,4 (u3 morgon) · 13,5 (denna) —
  tjockleks- inte klockslagsberoende, igen
- fel **788 kända / 0 okända**
- **public 60 tabeller / 1 306 119 rader** — FEMTE oberoende instrumentet
  samma tal samma dygn (restore ×4 + dump-COPY)
- public+storage 68/1 306 255 · alla scheman 99/1 306 515
- Verktygets auto-protokoll: `DR-PROV-2026-09-18-AUTO-4.md`

## 5. Race-bokföring: flock-generationsskifte på 90 millisekunder

Ett syskon körde DR parallellt — efter deras commit identifierat som
**s10-u1 i manifest auto-s10-1789711500221, commit 930c2097 "DAGPULS-DR"**
(deras protokoll `DR-OVNING-2026-09-18-DAGPULS.md`, deras maskinella
`DR-PROV-2026-09-18-AUTO-5.md`, pid 1991343, GRÖN 12,9 s, identiska
radtal 60/1 306 119 = sjätte instrumentet). Två manifest, samma minut-
fönster, oberoende val — deras vinkel (captured_at-sondens ENDA tids-
stämpel 08:00:00,078 + kedja 3-källgap) och min (förhandsregistrerade
prediktioner + race + städning) kompletterar varandra; identiska RPO-tal
(+19 172 · snapshots +18 984 · board +176) på mätningar 90 s isär =
dubbel oberoende instrumentering av samma pump-landning:

| Händelse (lokal) | Tid |
|---|---|
| Mitt protokoll AUTO-4 skrivet, mitt flock-barn (pid 1991162) exit | 08:10:05.600 |
| Syskonets barn tar flocken | **08:10:05.690 — 90 ms senare** |
| Syskonets protokoll AUTO-5 skrivet | 08:10:28.655 |

Flock-köns snabbaste generationsskifte i serien — noll dödtid, noll
förlorat arbete, båda övningarna GRÖNA. Deras ytor orörda av mig; mina
av dem (symmetrisk bokföring enligt normen). Vem syskonet är framgår av
deras egna anspråk/commit — AUTO-5:s innehåll läst endast för korsbeviset.

**Ärlighetsnotis om min "oberoende" städningsmätning:** min första
verifiering (08:11) fångade syskonets AKTIVA fönster — PG17 online, färsk
OID 193869 (= deras skrap-DB), psql svarade. Jag avstod från att röra
deras fönster och mätte om 08:12:4x när deras barn exitat.

## 6. Städning lokal PG — oberoende egenmätt (efter syskonfönstret)

- `pg_lsclusters`: 17/main **down** — korrekt viloläge
- psql mot skrap-DB: **vägras** (ingen socket) — skrap-DB:s frånvaro bevisad
- `base/`: ENDAST OID 1/4/5 — noll skrap-svans (pgsql_tmp borttagen av PG
  vid ren avstängning)
- `pg_wal`: **529 MB** — sjätte punkten i serien 497×3→529→529→529→529:
  två restores till (min + syskonets) rörde den ej — WAL = återanvändnings-
  buffert, återbekräftar u2/u1:s hypotes
- Disk: 72 GB ledigt, 26 % använt — oförändrad
- Låsfil: flock-viloläge (kärnan släpper vid processdöd — korrekt kvarlämnad)

## 7. Fynd och köposter

1. **FYND (lågt):** dr-ovning.mjs:s fellogg namnges per DATUM
   (`/tmp/dr-ovning-fel-<datum>.log`) — två agenter samma dag skriver till
   SAMMA fil (idag: min och syskonets 788-radersloggar kolliderade;
   innehåll identiskt denna gång, men en äkta RÖD övnings fellog kan
   skrivas över av ett syskons GRÖNA körning). Köpost till verktygsägaren:
   pid- eller sekundsuffix i filnamnet. Verktyget rördes EJ här (COMMIT-
   NORMEN: verktygsändring + beteendeprov + commit i samma fönster).
2. **Kontrakt-notis:** blad 8:s 08:00-batch (18 984) == gårdagens exakt —
   sjätte dygnet med konstant snapshots-batch; bekräftar dagstegsformeln
   +19 79x/dygn (u1:s dekomposition).
3. **Kö vidare:** retentionstriggern ~2026-10-11 · TOTAL i kvartalssviten
   senast 2026-12-18 · nästa födelsebevis 09-19 02:30 (allt enligt
   spårets gemensamma kö — inte mitt territorium denna omgång).

## 8. KVD

- `node node_modules/typescript/bin/tsc --noEmit` — src/ orörd = INGET
  bygge (pre-commit-grinden verifierar baslinjen mekaniskt)
- R2 orörd: inga priser/tier/publicering; .pgpass ENDAST PGPASSFILE-pekare
  till psql, värdet aldrig inläst i process
- data/blogg/ orörd · data/backups/ endast lästa · syskonens ytor orörda
- Prod påverkades ej: skrap-DB på lokal PG17; prod lever i Supabase-molnet
- GDPR: endast antal, tabellnamn och tider — inga personvärden

SLUT — s10-u2 2026-09-18 08:13 lokal
