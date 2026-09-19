# DR-ÖVNING 2026-09-19 EFTERMIDDAG — blad 9:s elfte restore + första 16:0x-punkten (GODKÄNT)

**Agent:** s10-u1 (vakt 1/3). **Order:** "DR-övning nästa i spåret (välj
själv): återställ, mät tid/rader, protokoll, städa lokal PG." — alla fyra
led EGENMÄTTA. **Val-kontroll FÖRE start:** dagens tio restores (AUTO →
AUTO-10, 02:58–09:52) lästa i data/forskning + worklog — senaste punkten
09:52, INGEN eftermiddags-/16:0x-punkt för blad 9 ⇒ denna övning är nästa
pass, inget duplikat. Efter 09:52 har spåret varit tyst 6+ timmar
(dagens fabrikstrafik: s7/s8/s9-vågor).

**DUBBELDISPATCH, redovisad öppet (D20/OMSTARTSBOKFÖRING-precedenserna):**
syskon s10-u3 (samma manifest, vakt 3/3) körde kärn-DR-övningen i samma
minutfönster — sitt AUTO-12 skrevs 16:08:46, 63 sekunder efter mitt
AUTO-11 (16:07:43). u3 trodde u1/u2 höll offsite-backup-spåret (det var
s8-u2/s8-u3 i ett annat manifest) och tog kärnövningen som ledig; inget
av oss skrev anspråk FÖRE mätning (båda efterhandsdokumenterade —
läxa till spåret: fabriksdispatch av samma objekt-typ till flera vakter
behöver disk-anspråk). Ingen avvisning: min restore var först (AUTO-11),
u3:s blev OBEROENDE REPLIK med IDENTISKA radtal (determinismen korsbevisad
av två agenter inom 103 s, flock-serialiserat, noll krock — gårdagens
49-sek-trippel i ny tappning). Fördelning av unikt innehåll: u3 levererade
städningsfyndet (AUTO-10:s halvföljda --behall-lämning) + DRIFTSBOK-sektion;
denna leverans bär RPO-punkten, serieanalysen och instrumentkorsvalideringen.

## Sammanfattning för kunden (5 rader)

1. Vi återställde hela databasen från nattens backup i en avskild
   testdatabas på servern: **11,7 sekunder** — av dagens tolv prov är
   detta näst snabbast (en oberoende replik av samma prov, körd av en
   annan agent en minut senare, blev dagens snabbaste: 11,5 s), och
   samtliga tolv ligger väl under mallens 20 sekunder.
2. Radkontraktet är **identiskt i samtliga tolv restores** (60 publika
   tabeller · 1 325 919 rader): metoden är förutsägbar, inte tur.
   Dagsteget från gårdagens blad är +19 800 rader — exakt som
   kvartsklockan förutspår.
3. Datamängden som ännu bara finns i molnet (inte i nattens backup) var
   kl 16:09 **19 441 rader** — varav 18 984 är morgonens batch som
   återkommer varje dag kl 08:00; backupen kl 02:30 i morgon bär
   dagens tillväxt.
4. Två oberoende instrument (dumpens radräkning och den återställda
   databasens räkning) svarade **exakt samma siffra** — integriteten
   bevisad i båda ändar.
5. Testdatabasen raderades och serverns lokal-databas stoppades igen —
   allt oberoende eftermätt; produktionen påverkades inte.

## 1. Återställ (AUTO-11 — denna agent, 16:07 lokal)

`node verktyg/dr-ovning.mjs` — exit 0 GRÖN. Grind OK före start
(MemAvailable 1 970 MB · 62 GB ledigt). Dumpkontroll GRÖN enligt
markörkontraktet (db-2026-09-19.sql.gz · 31,1 MB gz · 1 347 729 rader ·
CREATE TABLE 99 · COPY 101 · pg_dump 17.11; koll 4,9 s). Skrap-DB
ak1a_dr_test färsk på lokal PG17 (startad från korrekt viloläge; dropdb
--if-exists städade i förbigåenden den eftersläpning AUTO-10 lämnat —
se u3:s städningsfynd, som gäller samma kvarlämning).
**RTO 11,7 s** — då dagens snabbaste, övertaget 63 s senare av u3:s
replik 11,5 s (AUTO-12). Fellogg 788 rader, samtliga kända ofarliga
(Supabase-roller/scheman), **0 okända**:
/tmp/dr-ovning-fel-blad-2026-09-19-p3002710-1789826850825.log.

## 2. Mät tid/rader

Radkontrakt (identiskt med dagens övriga restores av bladet):

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 60 | 1 325 919 |
| public + storage | 68 | 1 326 055 |
| alla scheman | 99 | 1 326 315 |

**Blad 9:s RTO-serie (tolf restores, natt→eftermiddag):**

| Läge | RTO (s) | Källa |
|---|---|---|
| natt 02:58 | 12,1 | NATT-FÖDELSEBEVIS-u2 (AUTO) |
| natt 02:59 | 12,2 | NATT-BLAD9-REPLIK-u3 (AUTO-2) |
| natt 03:19 | 12,5 | GRYNINGSPULS-u1 (AUTO-3) |
| morgon 09:30 | 18,1 | DAGPULS-KLOCKFORMEL-u1 (AUTO-4) |
| morgon 09:33 | 16,1 | DAGFONSTER-REPLIK-u3 (AUTO-5) |
| morgon 09:34 | 14,9 | KOPOST3-4-u2 (AUTO-6) |
| morgon 09:41 | 15,9 | KOPOST3-4-u2 (AUTO-7) |
| morgon 09:43 | 15,7 | KOPOST3-4-u2 (AUTO-8) |
| morgon 09:50 | 15,1 | FORMIDDAGSPULS-u3 (AUTO-9) |
| morgon 09:52 | 15,5 | DUBBELPROJEKT-u1 (AUTO-10) |
| **eftermiddag 16:07** | **11,7** | **denna (AUTO-11)** |
| eftermiddag 16:08 | 11,5 | KVARTALSÖVNING-u3 (AUTO-12, oberoende replik) |

Spann 11,5–18,1 s · median 15,0 s · medel 14,3 s — **v98:s 20,0-s-mall
slagen i samtliga 12** (säkerhetsmarginal ≥ 9 %, median 25 %).
Belastningsbilden: DAGPULS-kodifierade "≈2 GB ⇒ 10–14 s" håller — båda
16:0x-punkterna (11,7 @ 1 970 MB · 11,5) i undre bandet, mot formiddagens
14,9–18,1 s @ 1,0–3,0 GB (RAM-nivån ensam förklarar ej dagtoppen, men
~2 GB-läget ger undre bandet; seriens totala rekord förblir 10,2 s,
blad 8 natt 09-18). **DAGSTEG:** blad 8 → blad 9 public +19 800 EXAKT
(modalvärdet, åttonde punkten i dagstegsserien).

**RPO-eftermiddag** (`dr-rpo-diff.mjs --json` kl 16:09, PGPASSFILE-pekare
— .pgpass aldrig inläst; COUNT-klass: antal + tabellnamn, GDPR-rent):

- Bladets total: 1 325 919 rader (dumpens COPY) — **== restorens psql
  count(*) på siffran: instrument A == B, integritetsbevis i båda ändar**.
- Levande total: 1 345 360 rader · **RPO-delta +19 441** oskyddade på
  13,65 h sedan 02:30 · 3 av 60 tabeller i rörelse · 0 negativa.
- snapshots +18 984 (1 233 420 → 1 252 404) — identiskt med gårdagens
  ALLA fyra dagpunkter = pumpens dygnsbatch; **pump-noll dag 2 på blad 9:
  1 252 404 stilla sedan 08:00-batchen, +0 på 6,6 h** (utökar gårdagens
  6,2 h-intra-dag-nollpunkt).
- board_decisions +432 = **8 × 54 kvartar EXAKT** — mätningen föll mellan
  16:00- och 16:15-markörerna (02:45→16:00 = 54 markörer); kvartsformeln
  lever utan avvikelse, och **blad-10-prediktionen 50 114
  (49 346 + 8×96) stärks tredje vägen** (DAGPULS förutsåg · levande
  verifierad 09:30 · nu 16:09).
- organ_health_logs +25 (episodbandet).

**WAL-punkt**: 481 MB — åttonde mätpunkten på serie-låget
(497×3 → 529×4 → 481×5…8): checkpointer-återvinning, icke-monoton, ingen
läckage-trend. Disk 63 G ledigt (36 %) · MemAvailable 1 948 MB efteråt.

## 3. Protokoll

Denna fil + maskinellt DR-PROV-2026-09-19-AUTO-11.md (skrivet 16:07:43)
+ JSON DR-RPO-DIFF-2026-09-19-EFTERMIDDAG.json (16:09:30). DRIFTSBOKEN:
ny DR-rad (senast bevisade restore) + worklog-rad. Syskon-u3:s parallella
leverans: DR-PROV-2026-09-19-AUTO-12.md (16:08:46) + DRIFTSBOK-sektion
S10-U3 (deras yta, respekterad).

## 4. Städa lokal PG (oberoende eftermätning)

- PG17 **down** (pg_lsclusters 16:1x) — viloläge korrekt.
- psql-**vägran**: socket saknas → skrap-DB oåtkomlig/borttagen.
- base innehåller **endast OID 1/4/5** + **pgsql_tmp TOM** — ingen
  användardatabas kvar.
- /tmp/ak1a-dr-prov.lock i **flock-viloläge** (sond ledig).
- Retention: 9 blad orörda (09-11 → 09-19; äldsta mtime 09-11 13:29:55 —
  första äkta bladraderingen fortfarande predicerad 2026-10-13 02:30).
- Disk/RAM/WAL: se ovan — oförändrat av övningen.

## 5. Dom + kö

**GRÖN.** Orderns alla fyra led levererade med bevis: restore (AUTO-11,
11,7 s), tid/rader (serien + radkontrakt + dagsteg + RPO), protokoll
(hand + maskinellt + JSON), PG-städ (verktygets + oberoende
eftermätning). Blad 9:s punktserie komplett för dagen: natt ×3 ·
formiddag ×7 · eftermiddag ×2 (varav en oberoende replik).

Kö vidare (befintliga kontrakt, intakta): blad 10:s födelsebevis 09-20
02:30 (board-prediktion 50 114 · snapshots 1 252 404 · public 1 325 919 +
8×kvartar 02:30→02:30) · DUBBELPROJEKT-storfyndets kur-kö åt huvudagenten
(dumpa ÄVEN app-projektet aufr — kedja 1 läser enbart rkaq) · arkivsvepets
söndagskontrakt 09-20 03:20 (jungrukörningen) · u3:s --behall-läxa
(kontraktet har TVÅ delar: stopp OCH drop) · retentionstriggern ~10-11 ·
kvartalssvit TOTAL + ARKIVSVEP senast 2026-12-17/18 · pumpvaktens
söndagskontrakt 09-20 03:20.

SLUT — s10-u1, 2026-09-19 16:2x lokal.
