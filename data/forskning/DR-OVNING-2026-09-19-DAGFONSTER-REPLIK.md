# DR-ÖVNING 2026-09-19 DAGFONSTER-REPLIK — oberoende korsvalidering av dagpunkts-RPO:t + RAM-grindens första skip + intra-kvarts-mikropunkten (GODKÄNT)

**Agent:** s10-u3 (manifest auto-s10-1789802729714, vakt 3/3).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG." — alla fyra led EGENMÄTTA.
**Fönster:** anspråk disk-först 09:29:30 lokal med förregistrerade P1–P10
(data/vakten/auto-s10-1789802729714-s10-u3-ansprak.md + maskinellt
DR-PREDIKTION-2026-09-19-DAGFONSTER.json); restore 09:33:13–09:33:41;
RPO-mätning 09:34:16.

## 1. Objektval + DUBBELDISPATCH, redovisad öppet

**Mitt val (09:29):** GRYNINGSPULS §8 köpost 3 — dagpunkts-RPO med
klockformeln som prediktor. Duplikatkontroll FÖRE val: worklog, DRIFTSBOKEN,
DR-*09-19* (2 st då), anspråkskatalog (tom). **Överlapp konstaterad vid
tillbakaläsning:** s10-u1 valde SAMMA köpost med anspråk 09:30 (deras
katalog läsning 09:27 — tom, deras val var ärligt; mitt anspråk 09:29:30
låg före deras men efter deras läsning) och LEVERERADE 09:27–09:32 medan
jag låg i RAM-vänteloop (se §2). Deras primärleverans är committad (0cd74805)
med mina ytor lämnade orörda (pathspec). **Presedens s9-u2-D20 tillämpad:**
primäranspråket "första dagpunkts-RPO:t" avstås till u1; mina mätningar
bokförs som OBEROENDE KORSVALIDERING — prediktionerna var låsta på disk
09:29:30, FÖRE både deras mätvärden (09:30:35) och mitt läsande av deras
filer (09:38) — formuleringarna är oberoende (samma köpost ⇒ samma
naturliga prediktorer). u2:s anspråk 09:36 (09:13-anomalien + organ-klockan,
--behall-restore av blad 09-14 = AUTO-6:n) berör ej mina ytor; deras NOTIS
om dubbelanspråket u1/u3 citeras här som neutral tredjepartskartläggning.

## 2. NYTT FYND 1 — RAM-grindens första dokumenterade SKIP + kuren

`dr-ovning.mjs` **SKIPPADE säkert** vid första försöket 09:31:
MemAvailable **845 MB < 1 000 MB** (exit 75-klassen, ingen restore, inget
PG-rörande). Orsak: fabrikens omgång om 3 (u1 + u2 + jag = zcode-barn ≈
0,8 GB/st) + u2:s samtidiga PG-fönster. u1 passerade grinden 09:29 på
**1 004 MB** (24 MB marginal); 09:31 var luckan stängd; 09:33 **3 078 MB**
(syskonens PG-jobb frigjort) — min restore gick igenom.

**Kur (levererad):** `verktyg/_s10u3-dagfonster-vanta-ram.mjs` — vänteloop
som pollar MemAvailable var 20:e s (gräns 1 050 MB, marginal över verktygets
1 000), tak 14 min, och startar dr-ovning.mjs atomärt när minnet räcker;
alla tidsstämplar på stdout för protokollförbar flock-/RAM-vänta.
**Fabriksläxa:** omgångar om 3 med DR-övningar kan kollidera på 8 GB —
dr-ovning.mjs står säkert (skip utan restore är korrekt beteende) men utan
omstart missar agenten fönstret; wrappern gör väntan mekanisk. (u1:s
"läxa kodifierad: ≥2 GB ⇒ 10–14 s" bygger på natt-punkter — se §5 ramb-
läxa som DELVIS korrigerar den.)

## 3. Återställ (blad 9:s FEMTE restore, andra i dagsljus)

`node verktyg/dr-ovning.mjs --fil data/backups/supabase/db-2026-09-19.sql.gz`
(via wrappern) — **exit 0 GRÖN** 09:33:13–09:33:41 (07:33:13–07:33:41Z).
Grind 3 070 MB · disk 63 GB · markörkoll GRÖN 6,6 s (1 347 729 rader ·
CREATE 99 · COPY 101 · pg_dump 17.11) · PG17 startad ur viloläge (bevis:
viloläget var MIN föregående punkts städning — kedjan i §6) · färsk
skrap-DB · **RTO 16,1 s** · fel 788 kända/0 okända · fellogg 34 881 B.
Maskinellt protokoll: **DR-PROV-2026-09-19-AUTO-5.md** (krockfritt: AUTO-4
= u1 09:30, AUTO-6 = u2:s --behall-körning 09:34).

**Radkontrakt EXAKT FEMTE gången** (determinism, fyra föregångare):

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 60 | 1 325 919 |
| public + storage | 68 | 1 326 055 |
| alla scheman | 99 | 1 326 315 |

**RTO-serien blad 9:** 12,1 (natt) · 12,2 (natt) · 12,5 (gryning) ·
18,1 (u1 dag, RAM 1,0 GB) · **16,1 (jag dag, RAM 3,0 GB)** — 22 av 23
spårpunkter under v98 F3:s 20,0 s.

## 4. Mät tid/rader — RPO-diff 09:34:16 (fönster 02:30→09:34, M = 28)

`PGPASSFILE=/home/ak1a/.pgpass node verktyg/dr-rpo-diff.mjs --fil
data/backups/supabase/db-2026-09-19.sql.gz --json
data/forskning/DR-RPO-DIFF-2026-09-19-DAGFONSTER.json`:

| Tabell | Dump 02:30 | Levande 09:34 | Δ | u1 09:30 | ΔΔ (min-mät) |
|---|---|---|---|---|---|
| board_decisions | 49 346 | 49 570 | **+224 = 8 × 28 EXAKT** | 49 570 | **0** |
| section_data_snapshots | 1 233 420 | 1 252 404 | **+18 984 EXAKT** | 1 252 404 | 0 |
| organ_health_logs | 3 024 | 3 037 | +13 | 3 037 | 0 |
| **Totalt (60 tabeller)** | 1 325 919 | 1 345 140 | **+19 221** | 1 345 140 | 0 |

3 av 60 i rörelse · 0 negativa · inga tillkomna/borttappade. Siffrorna
reproducerar u1:s 09:30-mätning EXAKT — korsvalideringen håller på alla
fyra mått.

**NYTT FYND 2 — intra-kvarts-mikropunkten:** mellan u1:s mätning 09:30:35
och min 09:34:16 (3 min 41 s, INGEN kvartsgräns passerad) rörde sig board
med **exakt 0 rader** — spårets första parobservation INOM ett kvarts:
klockan eldar VID markören, inte kontinuerligt. (En punkt, ej statistiskt —
men första i klassen; konsekvent med 8-per-kvarts-kontraktet.)

## 5. Prediktionernas dom — 6 ✅ (3 EXAKTA) · 2 band/primär-miss · 1 delvis · 1 ✅ (ärlighetstabell)

| # | Prediktion (09:29:30, FÖRE mätning) | Faktum | Dom |
|---|---|---|---|
| P1 | board = 8 × 28 markörer ⇒ +224 | +224 | ✅ **EXAKT** |
| P2 | klockan håller dagtid; "snabbare på dagen" förkastas om 8×M | +224 = 8×28 | ✅ (konsensus med u1) |
| P3 | snapshots 1 252 404 (+18 984 exakt) | 1 252 404 | ✅ **EXAKT** (alternativgrenen +0 död) |
| P4 | organ +1…+15, primär +3 | +13 | ✅ band · **❌ primär** |
| P5 | totalt band 19 209–19 223, primär 19 211 | 19 221 | ✅ band · **❌ primär** (P4-rot) |
| P6 | radkontrakt EXAKT | EXAKT (femte) | ✅ **EXAKT** |
| P7 | RTO 10–18 s, primär 12,5 | 16,1 s | ✅ band · **❌ primär** |
| P8 | fel 788/0 · ~34 881 B | 788/0 · 34 881 B (femte identiska filen) | ✅ **EXAKT** |
| P9 | PG down · OID 1/4/5 · WAL 481 | min körning stoppade PG (AUTO-5) · OID 1/4/5 ✓ · WAL 481 ✓ · slutläge online = u2:s dokumenterade --behall (deras städningsansvar) | ✊ delvis — ej min svans |
| P10 | 2–4 tabeller i rörelse, 0 negativa | 3/60 · 0 negativa | ✅ |

**P4/P5-rotorsak (bokförd):** jag satte organ-punkten ur nattens +1-puls trots
att DAGPULS-dagepisoden (+12) stod i mitt eget band-underlag — dagtidens
organ-amplitud är ~en storleksklass högre; läxa: väg den senaste DAG-tids-
episoden över nattpulser vid dagpunkts-prediktion. **P7-rotorsak + korrigativ
till u1:s kodifiering:** min 16,1 s vid MemAvailable 3,0 GB bryter bandet
"≥2 GB ⇒ 10–14 s" — RAM förklarar INTE dagens topp; återstående kandidater
är cache-kyla (nystartad PG, tomma delade buffertar) och disk-I/O-kö vid
fabrikstrafik. Rättad läxa: dagklassen 14–18 s gäller OAVSETT RAM-nivå;
RAM-villkoret gäller endast natt-punkter tills kontrollerade par mäts.

## 6. Städa lokal PG — oberoende eigenmätt + fönstrets tre-agentskedja

| Kontroll | Mätvärde | Dom |
|---|---|---|
| Min körnings städning | AUTO-5 [7/7]: skrap-DB raderad · PG17 stoppad 09:33:41 | ✓ bevisat |
| Kluster vid protokolltid | `pg_lsclusters`: 17 main **online** — u2:s `--behall`-fönster (deras kontrakt: städning ägs av dem; deras anspråk 09:36 dokumenterar det) | ej min svans ✓ |
| base/ | ENDAST OID 1/4/5 · pgsql_tmp TOM | noll skrap-svansar ✓ |
| Skrap-DB | databaslistan endast postgres/template0/template1 (u2:s ak1a_dr_test också städad) | ✓ |
| WAL pg_wal/ | **481 MB** — sjätte punkten på serie-låget (497×3 → 529×4 → 481×6) | restores växer ej WAL ✓ |
| Låsfil | /tmp/ak1a-dr-prov.lock pid 2781173 (u2:s, processen klar) — flocken frigjord när processen dog; filen kvar är oskyldig | kontraktet släppt ✓ |
| /tmp-spår | fel-blad-…-p2781058-…log 34 881 B | spårbar, pid-krockimmun ✓ |
| Bladkatalog | 9 blad (09-11→09-19) | retention orörd ✓ |

**Kedjan (tre agenter, flock-serialiserad):** u1 AUTO-4 09:29:34–09:30
(PG upp/ner) → jag AUTO-5 09:33:13–09:33:41 (fann PG stoppad = u1:s
städning; lämnade stoppad) → u2 AUTO-6 09:33:45–09:34:10 (--behall, PG
kvar online för deras SQL-analys). Jag grep inget i deras fönster (våg
100-läxan); mittpartiet är fullständigt städat + bevisat.

## 7. KVD + gränser

- src/ orörd — INGET bygge; tsc-baslinjen bärs av pre-commit-grinden
  (kontrollkörning ändå gjord som KVD-bevis: 0 fel via projektbinären).
- INGA R2-ytor: priser/tier/publicering orörda · inga .env/nyckelfilar ·
  .pgpass ENDAST PGPASSFILE-pekare (värdet aldrig läst) · prod endast LÄST
  (antal + tidsstämplar — GDPR-rent) · data/blogg/ orörd · data/backups/
  endast läst.
- Syskonytor orörda: u1:s committade ytor lästa/refererade; u2:s aktiva
  --behall-fönster (AUTO-6 + deras SQL-analys) lämnat ifred; AUTO-6 EJ med
  i min commit (pathspec — deras yta).
- Commit MED PATHSPEC.

## 8. Spårbarhet + kö vidare

- Maskinella delprotokoll: DR-PROV-2026-09-19-AUTO-5.md (restore) +
  DR-RPO-DIFF-2026-09-19-DAGFONSTER.json (60-tabellsdiffen) +
  DR-PREDIKTION-2026-09-19-DAGFONSTER.json (låsta prediktioner) + anspråket
  på disk. Källa för u1:s siffror: DR-OVNING-2026-09-19-DAGPULS-KLOCKFORMEL.md
  (commit 0cd74805).
- **Kö vidare:** (1) blad 10:s födelsebevis 09-20 02:30 — kvartsformelns
  fjärde test (board 50 114 · snapshots 1 252 404, nu dubbelt förhands-
  verifierad levande av u1 09:30 + jag 09:34); (2) jungurkörseln 09-20 03:20;
  (3) u2:s öppna rot-frågor: 09-13-anomalien (−3 board) + organ-klockans
  schema — deras fönster pågår; (4) intra-kvarts-serien: para ihop fler
  mät-par inom samma kvarts för att göra mikropunkten statistisk; (5)
  dag-RTO:s cache-kålshypotes: kontrollerat par (två restores i rad,
  samma RAM-band, nystartad PG båda) för att skilja cache-kyla från I/O;
  (6) retentionstriggern ~2026-10-11 · bladradering 10-13 02:30;
  (7) kvartalssviten dr-total + dr-pumpvakt + dr-arkivsvep senast
  2026-12-17/18; (8) RAM-vänteloopen generaliseras: dr-ovning.mjs kan
  adoptera pollningsbeteendet internt (--vanta-ram) — huvudagentens kö,
  verktygsägaren.

SLUT — DR-ÖVNING DAGFONSTER-REPLIK, s10-u3 (fabriksagent, spår 10 vakt,
manifest auto-s10-1789802729714 uppgift 3/3), 2026-09-19 09:29–09:4x lokal
(07:29–07:4xZ).
