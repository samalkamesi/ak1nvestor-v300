# DR-ÖVNING 2026-09-19 FORMIDDAGSPULS — intra-kvarts-mikropunkten STATISTISK (par nr 2) + kvartsformelns femte test KEDJAT EXAKT + blad 9:s sjätte restore (GODKÄNT)

**Agent:** s10-u3 **ANDRA INSTANSEN** (manifest auto-s10-1789802729714, vakt 3/3).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG." — alla fyra led EGENMÄTTA.
**Fönster:** anspråk disk-först 09:46 lokal med förregistrerade K1–K7
(data/vakten/auto-s10-1789802729714-s10-u3-ansprak-2.md + maskinellt
DR-PREDIKTION-2026-09-19-FORMIDDAGSPULS.json); mätning #1 09:45:49 ·
mätning #2 09:49:55 · restore 09:50:34–09:50:59.

## 1. Objektval + DUBBELINSTANS-BOKFÖRING (öppet)

Fabriken dispatchade u3 två gånger (RAM-väggen ~09:35). Första instansen
LEVERERADE sitt DAGFONSTER-objekt komplett under mitt startfönster —
protokoll på disk 09:39:47, commit **76815e5f** (DAGFONSTER-REPLIK +
AUTO-5 + två JSON:er). Presedens (worklog OMSTARTSBOKFÖRING + s9-u2-D20):
**duplikat avstås, omstarten tar ANDRA valet** ⇒ mitt objekt =
REPLIK-§8 KÖPOST 4, öppet kvarlämnad: *"intra-kvarts-serien: para ihop
fler mät-par inom samma kvarts för att göra mikropunkten statistisk"* —
fönstret vilar på ENDA paret. Utvidgat med **kvartsformelns femte test**,
första gången KEDJAT (bas = föregående MÄTT punkt, ej bladets 02:30-bas).

Lämnat orört: blad 10-födelsebeviset (09-20 02:30) · jungurkörningen
(09-20 03:20) · eftermiddagspunkten ~14:xx · u2:s rot-frågor ·
kvartalssviten · dr-ovning.mjs:s kod (redigeras av u2; se §6 vakt-insats).

## 2. Mät tid/rader I — RPO #1 09:45:49 (kvart 09:45–10:00, M = 1)

`PGPASSFILE`-pekare + `node verktyg/dr-rpo-diff.mjs --fil
data/backups/supabase/db-2026-09-19.sql.gz --json
DR-RPO-DIFF-2026-09-19-FORMIDDAGSPULS.json` (09:45:47.684→09:45:51.775):

| Tabell | Dump 02:30 | Levande 09:45:49 | Δ sedan dump | Δ sedan REPLIK 09:34:16 |
|---|---|---|---|---|
| board_decisions | 49 346 | **49 578** | **+232 = 8 × 29 EXAKT** | **+8 = 8 × 1 markör (09:45) EXAKT** |
| section_data_snapshots | 1 233 420 | 1 252 404 | +18 984 (pumpen 08:00) | 0 |
| organ_health_logs | 3 024 | 3 037 | +13 | 0 |
| **Totalt (60 tabeller)** | 1 325 919 | **1 345 148** | **+19 229** | +8 |

3 av 60 i rörelse · 0 negativa · 0 tillkomna/borttappade. Markörerna
02:45→09:45 = exakt 29 ⇒ båda benen av K1 EXAKTA.

**KEDJEBEVISET (formelns test 5):** prediktionen lutade mot REPLIK:s
MÄTTA 09:34-värde 49 570 (inte bladets födelsetal) + formeln 8×M, M=1
⇒ 49 578 förutsagt 09:46, mätt 49 578 — **kedja mätt-punkt → mätt-punkt
EXAKT**, första i spåret (fyra tidigare test alla förankrade vid 02:30).

## 3. Mät tid/rader II — INTRA-KVARTS-PAR NR 2 (09:49:55, samma kvart)

Mätning #2 (`…-FORMIDDAGSPULS-2.json`, 09:49:53.680→09:49:56.676) —
**4 min 6 s efter #1, ingen kvarsmarkör passerad** (båda inom 09:45–10:00):

| Mått | #1 09:45:49 | #2 09:49:55 | Δ |
|---|---|---|---|
| board_decisions | 49 578 | 49 578 | **0 EXAKT** |
| section_data_snapshots | 1 252 404 | 1 252 404 | 0 |
| organ_health_logs | 3 037 | 3 037 | 0 |
| Totalt | 1 345 148 | 1 345 148 | **0** |

**Mikropunkten är STATISTISK:** par 1 (REPLIK 09:30:35→09:34:16, 3 min
41 s, Δboard 0) + par 2 (detta, 4 min 6 s, Δboard 0) = **2/2 — kvartsklockan
elder VID markören, inte kontinuerligt.** Konsekvens för RPO-modellen:
mellan markörer är den oskyddade exponeringen i praktiken frusen utom
organpulser (u2:s kartläggning samma fönster: organ = intern 6-timmarssvep
med jitter — förklarar varför organ också Δ0 här; nästa svepspotential
~14:00 ± jitter). Värsta-fall-fönstret för en extra dump är därmed
kvartsbundet: en bladläggning strax efter en markör skyddar hela kvartet.

## 4. Återställ — blad 9:s SJÄTTE restore (AUTO-9, tredje i dagsljus)

Förutsättning kontrollerad FÖRE start: u2:s `--behall`-fönster STÄNGT
(PG17 nere + flocken fri efter deras städningsprocess 09:49:43;
RAM-grind 2 521 MB GRÖN). `node verktyg/dr-ovning.mjs --fil
data/backups/supabase/db-2026-09-19.sql.gz` — **exit 0 GRÖN**
09:50:34.423→09:50:59.909 (25,5 s total):

- Markörkoll GRÖN 6,0 s: 1 347 729 rader · CREATE 99 · COPY 101.
- **RTO 15,1 s** — blad 9:s serie: 12,1 · 12,2 · 12,5 · 18,1 · 16,1 ·
  **15,1** (23 av 24 spårpunkter under v98 F3:s 20,0 s; dagklassen
  14–18 s håller tredje dagen — REPLIK:s korrigativ av u1:s RAM-band
  förstärkt: 18,1@1,0 GB · 16,1@3,0 GB · 15,1@2,5 GB ⇒ RAM förklarar
  ej dagtoppen, cache-kyla/I-O kvar som kandidater).
- **Radkontrakt EXAKT sjätte gången:** public 60/1 325 919 ·
  public+storage 68/1 326 055 · alla scheman 99/1 326 315 · fel 788
  kända/0 okända · fellogg 34 881 B (sjätte byte-identiska filen,
  pid+ms-namn: …-p2791795-1789804243553.log).

## 5. Städning lokal PG — oberoende eigenmätt

| Kontroll | Mätvärde | Dom |
|---|---|---|
| Kluster | `pg_lsclusters`: 17 main **down** (verktygets finally) | ✓ |
| base/ | ENDAST OID 1/4/5 · pgsql_tmp 0 poster | noll skrap-svansar ✓ |
| WAL pg_wal/ | **481 MB — SJUNDE punkten på serie-låget** (497×3→529×4→481×7) | restores växer ej WAL ✓ |
| Låsfil | flocken fri (0 hållare); kvarvarande text = MIN döda pids innehåll, oskyldigt | viloläge ✓ |
| Fellogg | 34 881 B kvar som bevis (pid-krockimmunt namn) | spårbar ✓ |
| Bladkatalog | 9 blad (09-11→09-19) orörda | retention orörd ✓ |
| Resurser | disk 63 GB ledigt · MemAvailable 2 455 MB efteråt | ✓ |

## 6. VAKT-INSATS: u2:s verktygskur skyddad + skarpt live-verifierad

u2 påvisade (AUTO-6) ett KONTRAKTBROTT i dr-ovning.mjs: dropdb kördes
FÖRE --behall-grenen ⇒ skrap-DV:n raderades trots löftet "lämnas till
anroparen". Deras kur (stadaPg17: behall-grenen returnerar FÖRE dropdb;
grön-kriteriet återspeglar kontraktet) låg **OSTAGED** i arbetsytan —
prod-synkens `git checkout -- .` raderar unstaged ändringar (o87-läxan,
bevisad två gånger 2026-09-19). Åtgärd (09:45:37): `node --check` GRÖN +
**`git add verktyg/dr-ovning.mjs`** — staged innehåll överlever
checkout-raderingen; kur:en committas av u2 (deras ägarskap, deras
pathspec — EJ medtagen i min commit). **Skarp live-verifiering:** min
restore (§4) körde den kuraterade filen i icke-behall-grenen —
dropdb + pg_ctlcluster stop utfördes korrekt, grön dom exit 0 ⇒
kur:en är beteendeneutral för normalfallet och kontraktstrogen för
--behall (båda grenarna nu bevisade inom en timme).

## 7. Prediktionernas dom — 5 ✅ (4 EXAKTA) · 2 band ✅/primär ❌ (ärlighetstabell)

| # | Prediktion (09:46, FÖRE mätning) | Faktum | Dom |
|---|---|---|---|
| K1 | board = 49 570 + 8×1 = 49 578 (M=1); dumpben +232 = 8×29 | 49 578; +232 = 8×29 | ✅ **EXAKT (båda benen)** |
| K2 | intra-kvarts Δboard = 0 EXAKT | 0 (4 min 6 s, totalt Δ0) | ✅ **EXAKT** — serien 2/2 |
| K3 | snapshots 1 252 404 Δ0 båda punkterna | 1 252 404 · Δ0 · Δ0 | ✅ **EXAKT** |
| K4 | organ +0…+15 sedan 09:34, primär +2 → 3 039 | 3 037 = +0 | ✅ band · ❌ primär |
| K5 | totalt primär 1 345 150, band 1 345 148–1 345 163 | 1 345 148 | ✅ band (kant) · ❌ primär (K4-rot) |
| K6 | 2–3/60 i rörelse · 0 negativa · 0 schemaändringar | 3/60 · 0 · 0 | ✅ |
| K7 | (villkorad restore) radkontrakt EXAKT sjätte · RTO 14–18 s · fel 788/0 · logg 34 881 B | allt enligt §4 | ✅ **EXAKT** |

**K4/K5-rotorsak (bokförd):** organ är intra-kvarts FRYST lika strikt som
board när inget svep faller i fönstret — primären +2 var en gissning på
"långsam drip" som finns; läxa: vid känd 6-timmarssvepsmotor (u2 §K4 samma
fönster) ska intra-timmars-primär sätta Δ0 och låta svepet vara den
episodiska grenen. (K5 band höll ändå — dekomponeringsdisciplinen bar.)

## 8. KVD + gränser

- src/ orörd — INGET bygge (tsc-baslinjen bärs av pre-commit-grinden).
- R2 orörda: priser/tier/publicering · inga .env/nyckelfilar · .pgpass
  ENDAST PGPASSFILE-pekare (värdet aldrig läst) · prod endast LÄST
  (antal + tidsstämplar — GDPR-rent) · data/blogg/ orörd ·
  data/backups/ endast läst.
- Syskonytor orörda: u3-instans 1:s committade ytor lästa/refererade;
  u2:s okommittade ytar (AUTO-6/7/8 · JSON:er · protokoll · dr-ovning.mjs)
  EJ medtagna i min commit (pathspec); deras aktiva fönster väntades ut
  innan mitt PG-rörande (våg 100-läxan).
- Commit MED PATHSPEC; verktyget orört ( körning enligt kontrakt).

## 9. Spårbarhet + kö vidare

- Maskinellt: DR-PROV-2026-09-19-AUTO-9.md (restore) +
  DR-RPO-DIFF-2026-09-19-FORMIDDAGSPULS{,-2}.json (60-tabellsdiffarna) +
  DR-PREDIKTION-2026-09-19-FORMIDDAGSPULS.json (låsta K1–K7) + anspråket
  på disk (gitignorerad väg).
- **Kö vidare:** (1) par nr 3+ i andra kvart (gärna en över :00/:30 —
  mät-a-markör-b-mät sänder "fyr vid markören" en gång till); (2) dag-RTO
  kontrollparet (två restores i rad, samma RAM-band — cache-kåls-/I-O-
  separationen); (3) blad 10:s födelsebevis 09-20 02:30 — kvartsformelns
  SJÄTTE test och fjärde på blad-byte (board 50 114 = 8×96 · snapshots
  1 252 404 — nu TREDUBBELT förhandsverifierad: u1 09:30 · REPLIK 09:34 ·
  jag 09:45+09:49); (4) jungurkörningen 09-20 03:20; (5) eftermiddags-
  punkten ~14:xx — med organ-svepets ~14:00±jitter blir den första punkt
  som kan fånga en organ-episod i realtid (K4-läxans test); (6) u2:s
  kur committas av dem (staging-skyddet lever tills dess); (7) --vanta-ram-
  adoption i dr-ovning.mjs (verktygsägarens kö).

SLUT — DR-ÖVNING FORMIDDAGSPULS, s10-u3 (andra instansen, fabriksagent
spår 10 vakt, manifest auto-s10-1789802729714 uppgift 3/3),
2026-09-19 09:44–09:5x lokal (07:44–07:5xZ).
