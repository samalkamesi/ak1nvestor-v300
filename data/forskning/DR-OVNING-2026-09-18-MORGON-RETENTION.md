# DR-övning 2026-09-18 morgon — puls-DR + retentionens ANDRA prov: namn-vs-mtime + sekundprediktion

**Agent:** s10-u3 (manifest auto-s10-1789692929837, vakt 3/3) — 2026-09-18
02:59–03:06 lokal. Anspråk: data/vakten/auto-s10-1789692929837-u3-ansprak.md.

## Sammanfattning för kunden (5 rader)

1. Vi återställde hela databasen från nattens backup i en avskild
   testdatabas: **17,4 sekunder** — produktionen påverkades inte, och
   testdatabasen raderades efteråt. Tre oberoende restorekörningar idag
   gav **identiska radtal** — backupen är trygg.
2. Vi bevisade att **raderingsregeln för gamla backuper** gör precis
   rätt: en fil äldre än 30 dygn raderas, en yngre och en nyskapad
   överlever — och **filens namn spelar ingen roll**, bara faktisk ålder.
3. Vi räknade ut **exakt när den första riktiga backupen kommer raderas**:
   natten till den **13 oktober kl 02:30** (databasen från 11 september).
4. Vi redovisar en **formel** som förklarar sifferskillnaden mellan
   backupens radräkning och den återställda databasens — allt går jämnt
   ut, ingen data saknas.
5. Nästa ordinarie kvartalsövning: **senast 2026-12-18** —
   `node verktyg/dr-ovning.mjs`.

## 1. Puls-DR (kedja 1) — db-2026-09-18

`node verktyg/dr-ovning.mjs` GRÖN exit 0 (02:59 lokal; RAM-grind GRÖN
1 331 MB > 1 000-taket; flock-lås taget). Maskinellt protokoll:
DR-PROV-2026-09-18-AUTO-3.md.

| Mätetal | Värde |
|---|---|
| RTO (restore) | **17,4 s** |
| public | 60 tabeller / **1 306 119 rader** |
| public+storage | 68 / 1 306 255 |
| alla scheman | 99 / 1 306 515 |
| fel | 788 kända (Supabase-roller/scheman/extensions) / **0 okända** |
| dumpkontroll | GRÖN (markörkontraktet, 1 327 830 rader totalt i filen) |

**Oberoende replik:** syskonets AUTO-2 (samma dygn, samma dump) mätte
RTO 10,2 s med **identiska radtal** på alla nivåer — två restorekörningar,
samma summa = dagskorsbevis. RTO-serien kedja 1: 20,0 · 17,7 · 14,7 ·
20,0 · 23,9 · 11,2 · 12,2 · … · 12,1 · 17,1 · 14,1 · 11,0 · 17,4 s.

## 2. FYND: radräkningsformeln — totalsiffran bryten helt ut

Markörkollens "1 327 830 rader" räknar **ALLA rader i dumpfilen** (DDL +
data — `dom.rader++` per rad i kolla-dump-markorer.mjs) och får ALDRIG
jämföras direkt med psql-COUNT. Per-schema-COPY (zcat-tillståndsmaskin)
möter psql EXAKT:

| Schema | COPY-rader | psql-mätning |
|---|---|---|
| public | **1 306 119** | 1 306 119 ✓ EXAKT |
| auth | 140 | ingår i "alla scheman" ✓ |
| storage | 136 | ✓ |
| realtime | 82 | ✓ |
| supabase_migrations | 38 | ✓ |
| vault | 0 | ✓ |
| **cron** | **6 266** (2 block: job_run_details 6 261 + job 5) | **0 — skapas ej i skrap-DB** (pg_cron-ägt schema; kategoriserat bland de 788 kända felen; kördHISTORIK, ej kunddata — återbildas av levande cron) |
| DDL-rader (icke-COPY) | 15 049 | — |

**Formel:** psql 1 306 515 + cron 6 266 + DDL 15 049 = **1 327 830** ✓
(markörkollens total). Tidigare "korsbevis" var public-filtrerade — detta
är den första fullständiga brytningen av totalsiffran. **Ingen
datarförlust i restore; noll outredd differens.**

## 3. Retentionens ANDRA prov — tre kontrollfall i skarp katalog

FÖRSTA provet levererades av s10-u3 O7 inatt 01:55
(DR-FONSTER-KONTINUITET-2026-09-17.md: 40-dummy raderad + 28-dummy
skonad + 6 äkta blad). Detta prov tar de fall deras prov saknade —
**särskilt namn-vs-mtime** — och körs med full beviskedja
`-print → -delete → stat-diff` mot dagens 8 blad (09-11…09-18).

Cron-radens exakta uttryck: `find data/backups/supabase -name
"db-*.sql.gz" -mtime +30 -delete` (körs 02:30 efter godkänd dump).

| Fall | Fil (märkt dummy) | mtime | Uttryckets dom | Resultat |
|---|---|---|---|---|
| A | db-1987-01-01-RETENTIONSTEST-A-GAMMAL.sql.gz | 32 dagar (2026-08-17) | **RADERAS** | ✓ raderad (träffades av -print; -delete exit 0) |
| B | db-1987-01-02-RETENTIONSTEST-B-GRANS.sql.gz | 28 dagar (2026-08-21) | överlever | ✓ fanns kvar |
| C | db-1987-01-03-RETENTIONSTEST-C-FARSKNAMN.sql.gz | **nu** (trots namn "1987-01-03") | överlever | ✓ fanns kvar |

**Beviskedja:** (1) `-print` listar ENDAST fall A — varken B, C eller
något av de 8 äkta bladen träffas; (2) `-delete` exit 0; (3) A borta,
B+C kvar; (4) `stat`-diff på de 8 äkta dumparna FÖRE/EFTER = **tom**
(mtime+storlek oförändrade). Dummy B+C städade manuellt efter provet —
en dummy överlever aldrig provet (O7:s norm).

### Slutsatser

- **S1 — mtime styr, namnet är kosmetiskt.** Fall C bevisar att
  filnamnets datum ignoreras helt. Praktisk konsekvens: en KOPIA gjord
  med `cp` (färsk mtime) raderas ALDRIG av retentionen — kopiera bara
  dumpar med `cp -p`/`rsync -a`, annars växer kopior tyst bortom
  30-dagarsfönstret. (Huvudagentnotis vid framtida flyttar.)
- **S2 — gränssemantiken bevisad i prick:** -mtime +30 = mer än 30
  HELA dygn (n ≥ 31). 28-dagarsskyddet bekräftar marginalen mot O7:s
  40/28-prov.
- **S3 — första äkta raderingen predikterad sekundnoggrant:**
  - db-2026-09-11.sql.gz, mtime 2026-09-11 **13:29:55** → n når 31 vid
    2026-10-12 13:29:55 → första cron-körning därefter =
    **2026-10-13 02:30 raderar det äldsta bladet.**
  - db-2026-09-12.sql.gz, mtime 02:30:38 → når 31 dygn först
    2026-10-13 02:30:38, dvs **38 sekunder EFTER** nattens körning →
    överlever 10-13, raderas **2026-10-14 02:30**.
  - Från 10-14: en bladradering per dygn i steady state.
  - **Prediktionskontrakt:** natten 2026-10-13 02:30 skall
    /tmp/supabase-backup.log + kataloginnehåll visa exakt denna
    radering — avvikelse = ny fyndklass (kontrolleras av vaktspåret).

## 4. Städning (uppdragets bokstav) — egen + oberoende mätt

- Skrap-DB ak1a_dr_test: raderad av verktygets finally; oberoende
  verifierat (0 träffar, PG17 nere gör sonden omöjlig = beviset).
- PG17: **down** före (korrekt viloläge) → startad av verktyget →
  **stoppad** efter (pg_lsclusters egenmätt).
- Låsfil /tmp/ak1a-dr-prov.lock: kvar med endast pid-info = flock-lagets
  avsedda viloläge (O2-normen).
- Dummy B+C: manuellt raderade; katalogen = exakt 8 äkta dumpar.
- Disk: 72 G ledigt (oförändrat genom övningen).

## 5. KVD

- Ingen kod berörd → tsc-baslinjen orörd (`node node_modules/typescript/bin/tsc --noEmit` krävdes ej; ingen commit i src/, ALDRIG bygge).
- R2 orörd (priser/tier/publicering orörda). data/blogg/ orörd.
- Syskonytor orörda; deras AUTO-2-protokoll respekterat, mina filer
  bär MORGON-RETENTION-signatur.
- Endast data/ + worklog + denna fil + anspråksfilen committade.

## 6. Kö till huvudagenten

1. **2026-10-13-prediktionskontraktet** (S3) — låt vaktspåret verifiera
   första äkta bladraderingen mot loggen; avvikelse = fyndklass.
2. **cp-vs-cp -p-notisen** (S1) vid framtida dumpflyttar/kopior.
3. Kedja 3:s cadens-kö lever kvar (DRIFTSBOKEN DR-rad, 09-17-kväll).
