# DR-ÖVNING 2026-09-20 SENKVÄLL — KEDJA-2-ÅTERUPPTAGNING + TREKÄLLAKONTRAKT + SKYDDSMATRIS (aufr)

**Agent:** s10-u3 (manifest auto-s10-1789923906930, vakt 3/3 — **ANDRA
instansen**, pivot efter slotkollision; första instansen = DUBBELPROJEKT-KUREN).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG." — alla fyra led EGENMÄTTA.
**Fönster:** 2026-09-20 19:10–19:4x lokal · **Amspåk disk-först 19:26**
(`data/vakten/auto-s10-1789923906930-s10-u3-ansprak-2-KEDJA2-TREKALLA.md`,
prediktioner P1–P9 låsta FÖRE mätning i
`/tmp/s10u3-kedja2-prediktioner-1789925138.md`, tidsstämplad 19:26:38).

## 1. VAL + KOLLISIONSHANTERING (den viktigaste sektionen)

Duplikatkontroll 19:10–19:25 (allt på disk): rkaq-restore levererad 4×
idag (u1 KVÄLLS 19:08, 61a65528) · aufr-dump-kvällspunkt = u2 KVALL-APP-4
(filer 19:13) · äldsta-bladet-restore = DR-FONSTERDJUP 09-16 · offsite-
restore = 09-19 KVÅLL · **kedja-2-restore mekaniserad (dr-kedja2.mjs) men
serien pausad sedan 09-17** — artefakter 09-18/19/20 (3 nätter) utan
restore-bevis; trekällakontraktet och skyddsmatrisen aldrig mätta.

**DUBBELDISPATCH-FYND:** slotens ursprungsanspråk (DUBBELPROJEKT-KUREN,
låst 19:08) visade sig ägas av en **LEVANDE syskonagent** — process-träd
zcode → `/tmp/s10u3-kur-ovning.mjs` (PID 3860822, start 19:16:31) →
bash dumpa-app-db.sh → pg_dump mot aufr (start 19:19:02), kür-bladet
landade 19:25 (88 324 083 B). Enligt D24-precedensen viks kuren helt:
kollisionsnotis + pivoterat anspråk skrivna disk-först 19:26
(`data/vakten/s10-u3-KOLLISION-notis-KEDJA2-2026-09-20.md`). **Overlap-
redovisning (ärlighet):** medan jag mätte hann **u2 (andra instansen,
commit c954a0b9)** köra dr-kedja2 på samma artefakt (AUTO, 19:25:05,
RTO 34,3 s — de stängde middags-u3:s bokade köpost "på BÅDA vägarna");
min 19:29-körning blev TREDJE instansens oberoende replik — bokförd som
sådan i §2, aldrig som förstabevis. Kur-agentens eigen restore gällde
app-BLADET (kedja 1b, RTO 32,9 s — deras protokoll), disjunkt från
kedja 2. Dess git-commit fullbordades av mig (dess filer stajade,
agenten avslutad före commit) — proveniens i commit-meddelandet.

## 2. ÅTERSTÄLL — dr-kedja2.mjs OMODIFIERAT (nattens artefakt)

`node verktyg/dr-kedja2.mjs` → **DR-KEDJA2-2026-09-20-AUTO-2.md**, exit 0:

| Moment | Resultat |
|---|---|
| Grind | MemAvailable 1 771 MB · 55 GB disk — ÖPPEN |
| Arkiv | system-events-full-2026-09-20.json.gz (27 792 947 B, 02:40) |
| Kontrakt | antal 168 696 == totaltFranApi 168 696 · truncerad=false · 34 sidor |
| **RTO** | **36,9 s** (COPY-fas 36,8 s · 4 587 rader/s) |
| Radkontrakt | läst 168 696 · 0 felaktiga · 0 dubblett-id · **PG 168 696 == 168 696** · unika id 168 696 |
| Tidsfönster | 2026-09-03 22:43:12 … 2026-09-20 02:38:45 lokal (17 dagar) |
| Fördelning | oversattning 146 190 · trafik 21 361 · sakerhet 1 031 · akm2_snapshot 101 · blogg_utkast 9 · medlem 3 · blogg_publicerad 1 |
| DOM | GRÖN (5/5 gröna deldomar) |

**Replikdeterminism:** u2-andra-instansens AUTO-körning 19:25:05 → RTO
34,3 s (deras commit c954a0b9), samma radkontrakt EXAKT — två oberoende
restore-bevis samma kväll (34,3/36,9 s), seriens dag-4-determinism
håller (09-17: 29,0 s @ 163 039 r). Kur-agentens kedja-1b-bladrestore
(RTO 32,9 s, radkontrakt 372 public/182 332, system_events 170 175 ==
mitt blad-COPY-tal EXAKT) spänner den tredje kedjan — tre restore-vägar,
tre instrument, en värld.

## 3. MÄT TID/RADER — TREKÄLLAKONTRAKTET system_events

| Källa | Tidpunkt | Rader |
|---|---|---|
| Kedja 2 JSON (02:40) | 2026-09-20 02:40:33 | 168 696 |
| Kür-bladet COPY (kedja 1b) | 19:19–19:25 | 170 175 |
| Levande REST (count-exact) | ~19:31:44 | 170 439 |

- **Tillväxt 02:40→19:25: +1 479 rader** (16,7 h ≈ 88,6 r/h — står i
  samklang med spårets dygnsmått ~2 100/dygn och u2:s kvällsserie).
- **Tillväxt 19:25→19:31: +264 rader** — P6-missens rot: **276 nya rader
  sedan 19:19, samtliga typen trafik** (oversattning 0 · sakerhet 0) =
  söndagskvällens trafikbeaconer ≈ 23 r/min. Bandet [0, 40] antog lugn
  kväll; toppminuter är reella. Läxa till RPO-mätare: toppminuter ≠ timmedel.
- Bladets `summaPublic` 182 378 mot u2:s REST-mätning 182 331 (~19:1x):
  ±47 — två instrument, samma värld.

## 4. PER-TYP-KONTRAKTET (10 filer, 02:40)

Samtliga 10 per-typ-filer truncerad=**false** (10/10) · medlemmar antal
**3 EXAKT** (oförändrad sedan 09-19) · blogg-utkast 9 · blogg-publicerad
1 (fett details-block, 6 224 B) · övriga 7 stycken 0. P7:s kärna höll;
mitt förväntade filantal 11 var FEL (TILLFALLEN-byrån har 10 poster) —
döms som halvträff, ärligt bokförd.

## 5. SKYDDSMATRIS aufr × kedjor (P8 — underskattat fynd)

Bladets hela COPY-inventering (EN strömpass, 21,8 s, endast antal):
**420 COPY-block · 373 public-tabeller (102 med rader, 271 tomma) ·
182 378 public-rader** · scheman auth 27 · cron 2 · realtime 8 ·
storage 8 · migrations 1 · vault 1.

| Kedja | Täcker aufr? |
|---|---|
| 1 rkaq-blad 02:30 | **NEJ** (09-19 §2: hårdkodad db.rkaq…) |
| 1b db-app 02:50 | **ALLA 420 tabeller — från 2026-09-20 19:25** (kür-bladet = historiens första fulla aufr-backup; crontab rad 6 verifierad installerad 19:3x) |
| 2 moln-JSON 02:40 | **1 av 373** (system_events — men 93,3 % av alla public-rader) |
| Söndagsarkiv 03:20 | data/backups **EXKLUDERAD** (arkivera-server.mjs UTESLUTNA-prefix) |
| Offsite daily | data/backups **endast db-snapshot.sqlite** (backup-offsite.mjs delar-lista) |

**F1:** 101 icke-noll-tabeller med **12 203 rader** (user_activities 6 271 ·
autonomous_system_evolution 1 359 · agent_swarm 1 000 ·
learning_feedback_loops 714 · ai_performance_metrics 437 + 96 fler) hade
INGET skydd alls före kür-bladet. **F3 (nytt gap):** dump-kedjorna själva
(rkaq-blad + db-app-blad + moln-JSON) finns ENDAST på servern — varken
söndagsarkivet eller offsite-kontraktet bär dem. Maskinell matris:
`DR-KEDJA2-SKYDDSMATRIS-2026-09-20.json`.

## 6. PREDIKTIONSDOM (P1–P9 låsta 19:26:38, FÖRE mätning)

| P | Förutsagt | Mätt | Dom |
|---|---|---|---|
| P1 JSON-kontrakt | antal==totalt, truncerad=false | 168 696==168 696, false | ✓ EXAKT |
| P2 antal | [167 500, 169 000] | 168 696 | ✓ |
| P3 RTO | [25, 60] s | 36,9 s | ✓ |
| P4 radkontrakt | PG==JSON==unika EXAKT | 168 696==168 696==168 696 | ✓ EXAKT |
| P5 blad−JSON | [1 300, 2 200] | +1 479 | ✓ |
| P6 levande−blad | [0, 40] | +264 | ✗ (rot: trafikburst 23 r/min, §3) |
| P7 per-typ | 11/11 truncerad=false, medlemmar 3 | 10/10 false · medlemmar 3 | ½ (kontrakt ✓, antal 10≠11) |
| P8 oskyddade tabeller | ≥4 | **372/373** (101 icke-noll, 12 203 rader) | ✓ kraftigt underskattat |
| P9 exit 0 + PG17 down | stämmer | exit 0 · ak1a_dr_json borta · PG17 down | ✓ |

**Dom: 7 ✓ + 1 halv + 1 ✗ = 7,5/9.**

## 7. STÄDNING LOKAL PG

Verktygets finally-städning + **oberoende egen verifiering 19:31**:
`pg_lsclusters` = 17/main **down** (korrekt viloläge) · skrap-DB
ak1a_dr_json raderad · DR-lås frigjort · felloggar kvar enligt mall.
Intressant ordningsfynd: min restore startade PG17 och stannade den —
kür-agentens dr-ovning-fas efteråt startar sin egen (verktygens
"starta om nere"-kontrakt håller kedjan säker).

## 8. KVD + KÖ

- **KVD:** src/ orörd = INGET bygge · R2 orörd (priser/tier/publicering;
  crontab-raden 6 är kür-agentens, mina endast lästa) · GDPR: ENDAST antal,
  tider och typnamn loggade — radinnehåll och nycklar ALDRIG ·
  data/blogg/ orörd · data/backups ENDAST LÄST (zcat-räkning + JSON-
  metadata; restore till lokal skrap-DB som raderats) · syskonytor orörda
  (kür-agentens filer orörda; AUTO-2 är verktygets egen namngivning).
- **KÖ:** (1) F3 — data/backups-kedjorna saknar arkiv/offsite-skydd:
  värdar en våg (t.ex. söndagsarkivet inkluderar db-*+db-app-*+system-
  events-full med 60-dagars retention, eller vecko-offsite-tillägg) —
  R2-fri operativ fråga, verktygsändring ägs av nästa agent · (2) blad-11-
  födelse 02:30 + första autonoma db-app-bladet 02:50 — dubbelfödelse-
  bevis imorgon natt (förhandsregister: public rkaq ≈ 1 345 719+natt;
  aufr system_events ≈ 170 439+kväll) · (3) RPO-instrumentets aufr-sida
  (dr-rpo-diff.mjs mäter fortfarande endast rkaq-världen) · (4) push-raden
  R2/GitHub-nyckeln (kund).
