# DR-ÖVNING 2026-09-19 KVÄLL — APPENS DATABAS PUNKT 2 (aufr): KEDJA-0-instrumentets andra fulla körning (GODKÄNT)

**Agent:** s10-u3 (manifest auto-s10-1789849506241, vakt 3/3) · **Fönster:**
22:29:30–22:34 lokal · **Order:** "DR-övning nästa i spåret (välj själv):
återställ, mät tid/rader, protokoll, städa lokal PG."

## 1. VAL + duplikatdom (anspråk disk-först 22:31, FÖRE mätning)

Alla tre syskon i manifestet fick samma order (start 22:25). Blad 9
(rkaq-pumpuniversumet) har 13+ restores idag (senaste AUTO-12 16:09) — ytterligare
en vore det fjärde identiska mätvärdet samma dygn. **APPENS databas (aufr) har
exakt EN full övning någonsin** (KEDJA-0, s10-u2, 16:09–16:41) — efter
DUBBELPROJEKT-storfyndet (dump-kedjan läser rkaq, appens data har ENDA kopian i
kedja 2:s JSON 02:40) är detta spårets mest värdefulla omätta yta. Mitt objekt =
**kvällspunkt 2 för aufr**: `node verktyg/dr-appdump.mjs` (u2:s verktyg,
okompilerat/omodifierat — deras yta respekterad). Syskonens kommande
blad-9-leveranser krockar ej: flock serialiserar PG17-fönstret.

## 2. Genomförande (orderns fyra led, EGENMÄTTA)

| Led | Resultat |
|---|---|
| ÅTERSTÄLL | pg_dump aufr **188,1 s · 84,1 MB gz** (sha256 98cd669f6049499f…, slutmarkör GRÖN, COPY 420/CREATE 418) → skrap-DB ak1a_dr_app i lokal PG17 → restore **RTO 26,8 s** · fel 109 rader = 109 kända/**0 okända** → /tmp/dr-appdump-fel-aufr-p3178691-1789850012339.log |
| MÄT | public **372 tabeller/179 902 rader** · public+storage 380/181 247 · alla scheman 417/183 057 · system_events **168 269** · user_activities **5 747** · auth.users 45 · members 3 · board_decisions 77 · profiles 11 |
| PROTOKOLL | maskinellt DR-APPDUMP-2026-09-19-KEDJA0-2.md/.json (unikVag-kollisionsnamn, exakt som P10) + detta agentprotokoll + DRIFTSBOK DR-rad + sektion |
| STÄDA | skrap-DB raderad · PG17 stoppad · dumpfil raderad (GDPR) — OBEROENDE eftermätning nedan §6 |

Verktygets 7 steg GRÖNA exit 0. Grind: MemAvailable 1 109 → 1 211 MB, disk
61 GB vid start (fabriksomgångens tre syskon aktiva — grinden höll utan skip).

## 3. Tillväxtmodellen — aufr system_events har nu TRE punkter (dygnsprofilen tvåled)

| Tidpunkt (lokal) | Källa | system_events | Fönster | Takt |
|---|---|---|---|---|
| 09-19 02:40 | kedja-2 JSON (ENDA händelsekopian) | 166 067 | — | — |
| 09-19 ~16:39 | KEDJA-0-dumpen | 167 219 | 13,98 h | **82,4 r/h** |
| 09-19 22:32 | denna dumpen | 168 269 | 5,87 h | **179,0 r/h** |

Kvällstakten är **2,2× dagstakten** — kvällsfabrikstrafiken (parallella
vaktbarn + sessioner) skriver events. Spegelbild av rkaq-spårets tvåledsmodell
(nattgolv/puls), men här: dag ~82 r/h, kväll ~179 r/h.

**Dekomposition EXAKT:** public 178 493 → 179 902 = +1 409 =
system_events **+1 050** + user_activities **+359** (+0 i övriga 370
tabellerna: board 77, members 3, profiles 11, auth.users 45 alla stilla).
user_activities första tillväxtmätningen: **61,2 r/h** — KEDJA-0:s sidofynd 3
får sin första siffra: tabellen saknas i ALLA backup-kedjor OCH växer ~360
rader/6 h kvällstid (oskyddad yta, skyddskarta §7.5).

**Kedja-2-gapet (app-DB:ns verkliga RPO):** 168 269 − 166 067 = **2 202 rader
på ~19,9 h** — så passande oskyddat är appens händelsminne vid kvällspunkten,
i den ENDA kopian som finns. Prognos till nästa 02:40-växling (4,1 h kvar,
kvällstakt avtagande mot natt): gap ≈ **2 400–2 950** — verifierbar mot
system-events-full-2026-09-20.json.gz (två oberoende vägar: filens total-kontrakt
+ imorgon kvälls restore).

## 4. Instrumentets reproducerbarhet (andra fulla körningen)

- Dumptid: KEDJA-0 band 105–415 s (×3) + **188,1** — bandet håller, median-läge.
- RTO: 20,3–26,0 (×3) + **26,8** — u2:s kodifierade band 20–30 s håller
  (372 tabellers DDL driver RTO, ej radmassa — ytterligare en bekräftelse).
- Felbild: **109 kända/0 okända EXAKT** i samtliga fyra restores — deterministisk.
- Radkontrakt tabeller: 372/380/417 · CREATE 418 · COPY 420 — EXAKT oförändrat
  (schemat statiskt inom dygnet).

## 5. Prediktionsdom (P1–P10 låsta på disk FÖRE körning, DR-PREDIKTION-2026-09-19-KVALL-APP.json 22:32)

| P | Förutsagt | Mätt | Dom |
|---|---|---|---|
| P1 system_events | ≈167 710, band 167 550–167 900 | **168 269** | ❌ +369 över (rotorsak §5.1) |
| P2 publicTotal | ≈179 000, band 178 950–179 450 | **179 902** | ❌ +452 över (samma rotorsak) |
| P3 radkontrakt | 372/380/417 · 418/420 EXAKT | identiskt | ✅ EXAKT |
| P4 RTO | 20–30 s | 26,8 s | ✅ |
| P5 dumptid | 105–420 s | 188,1 s | ✅ |
| P6 fel | 109/0 EXAKT | 109/0 | ✅ EXAKT |
| P7 kedja-2-gap | ≈1 640, band 1 480–1 840 | **2 202** | ❌ +362 över (samma rotorsak) |
| P8 städning | skrap-DB borta · PG17 down · dump raderad | allt bevisat §6 | ✅ EGENMÄTT |
| P9 nyckeltabeller | users 45 · members 3 · board 77 | identiskt | ✅ EXAKT |
| P10 protokollnamn | DR-APPDUMP-…-KEDJA0-2.* | exakt de namnen | ✅ EXAKT |

**7 ✅ (5 EXAKTA) · 3 ❌ — samtliga tre missar DELAR rotorsak:** modellen
(82 r/h) byggde på natt→dag-fönstret och vägde varken kvällsfabrikens 2,2×-takt
eller user_activities (+359, vägd ≈0). **Läxa (utökar s10-u2:s "två punkter
innan en planå får namnet" till per tabell OCH per dygnsfas):** en
tillväxtmodell får predicera först när båda fasetterna i cykeln har en mätt
punkt — kvällspunkt 2 (imorgon) ger kvällsfasen sin tvåpunktsbas.

## 6. Städning — OBEROENDE eftermätning (ej verktygets självrapport)

- `pg_lsclusters`: 17/main **down** ✓
- psql-socketvägran ("No such file or directory") — skrap-DB:s frånvaro bevisad ✓
- `/tmp/dr-appdump-aufr-*` BORTA (dumpfilen GDPR-raderad; sha256 är beviset) ✓
- fellogg kvar enligt mall: p3178691-1789850012339 (pid+ms-namn) ✓
- 9 blad orörda i data/backups/supabase (retention intakt, raderingsprediktion 10-13) ✓
- disk 62 G ledigt · MemAvailable 4 338 MB efteråt · DR-låsfil flock-viloläge ✓

## 7. KVD + kö

**KVD:** src/ orörd = INGET bygge (tsc-baslinjen bärs av pre-commit-grinden) ·
R2 orörd (.pgpass/crontab/.env skriftligen orörda — verktygets KEDJA-0-kontrakt
läser DATABASE_URL endast vid körning, env-till-barn, aldrig loggat; prod DB
ENDAST läst; GDPR: antal + tidsstämplar, dump raderad) · data/blogg/ orörd ·
syskonytor orörda (dr-appdump.mjs omodifierat; KEDJA-0-filer orörda) · commit
MED pathspec, commitmsg i /tmp (ROND 96-köposten följd).

**Kö vidare:** (1) blad 10:s födelsebevis 09-20 02:30 (board 50 114 ·
snapshots 1 252 404 — båda redan levande förhandsverifierade) + jungurkörningen
av arkivera-servern 09-20 03:20 (s10-u1:s prediktionskontrakt); (2) verifiera
02:40-prognosen §3 mot system-events-full-2026-09-20.json.gz; (3) kvällspunkt
APP imorgon = kvällsfasens tvåpunktsbas; (4) huvudagentens DUBBELPROJEKT-kur
består: .pgpass-post + crontab db-app-*.sql.gz (R2-nära) + user_activities i
skyddskartan (nu med mätt takt 61 r/h).
