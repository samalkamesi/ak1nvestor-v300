# DR-ÖVNING 2026-09-17 (kväll) — SISTA PROFILLUCKAN MÄTT: pump-noll 14:40→21:09 + FÖRLORAD KUR ÅTERLEVERERAD OCH COMMITTAD (s10-u2)

**Uppdrag (fabriksmanifest spår 10 vakt 2/3):** "DR-övning nästa i spåret (välj
själv): återställ, mät tid/rader, protokoll, städa lokal PG."

**Objektval + duplikatkontroll.** Före start kontrollerades worklog (senaste
spår 10-rader), DRIFTSBOKEN:s sista DR-sektion (S10-U3 O9, stängd 14:46) och
data/forskning/DR-*.md mot disken. Läge vid start 21:06 lokal: allt sedan
morgonen levererat — natt-RPO, jungfrudag 7 blad, födelsebevis + PG-städ,
morgon-RPO, jungfrunatt kedja 2, MIDDAG, EFTERMIDDAG (dubbel RPO-punkt +
valDump-kur). O9 lämnade ETT direkt matchande öppet objekt — köpost (1):
"lätt kvälls-RPO-punkt (~22:00) bekräftar noll-rörelse 15:00→02:29 —
profiltabellens sista lucka". Valt objekt: **kvälls-DR** — restore av
jungfrubladet db-2026-09-17 (RTO-seriepunkt 20) + kvällens RPO-diffpunkt
21:09 lokal (köns "~22:00" träffat inom kvällens fönster). Uppdragets fyra
verb uppfyllda av: dr-ovning.mjs (återställ + mät tid/rader), detta protokoll
(proto), §4 (städa lokal PG — egenmätt).

**Under arbetet uppstod dagens vaktfynd:** valDump()-kuren från eftermiddagen
var FÖRLORAD FRÅN DISKEN (bevisad 14:33, borta vid min start 21:07, aldrig
committad) — se §3: regression påträffad, rotorsak fastställd, kur återlevererad
troget spec och COMMITTAD i samma fönster som sitt beteendeprov denna gång.

---

## 1. Körningar och mätvärden

Alla körningar via `node` (skal-kvotens kanal 1), yttre flock på
/tmp/ak1a-dr-prov.lock (verktygets eget lager), RAM-grind GRÖN vid varje start
(1 966 → 1 855 MB tillgängligt — fabrikskväll med syskon i kullen).

| Tid (lokal) | Körning | Utfall |
|---|---|---|
| 21:07 | `dr-ovning.mjs --fil db-2026-09-17.sql.gz` (bart bladnamn) | **FALSK RÖT — REGRESSION** — markörkollen "Filen kunde inte läsas" (0 kB) → restore VÄGRADES, PG17 orörd, protokoll **DR-PROV-2026-09-17-AUTO-6.md**. Ej väntat: SAMMA kommandoform var GRÖN 14:33 (AUTO-5, efter kuren) ⇒ se §3 |
| 21:08 | valDump() återlevererad i dr-ovning.mjs (Edit) | `node --check` **GRÖN** |
| 21:08 | `dr-ovning.mjs --fil db-2026-09-17.sql.gz` (samma kommando, EFTER återleverans) | **GRÖN** — NOTIS "resolverad mot dumpkatalogen" + RTO **11,0 s** (dagens snabbaste; seriepunkt 20) · fel 788 kända/0 okända · public **60 tabeller / 1 286 328 rader** · alla scheman 99/1 286 724 · protokoll **DR-PROV-2026-09-17-AUTO-7.md** |
| 21:09:10 | `PGPASSFILE=~ak1a/.pgpass dr-rpo-diff.mjs --json …KVALL.json` | **RPO KVÄLL** — se §2 · JSON **DR-RPO-DIFF-2026-09-17-KVALL.json** |

**Radtalets korsbevis växer till SEX instrument, samma tal 1 286 328:**
morgonens två restore + eftermiddagens två restore + kvällens restore (AUTO-7)
+ dumpens zcat-COPY-räkning. Bladet db-2026-09-17 förblir seriens mest
oberoende bevisade.

**RTO-serien:** punkt 20 = **11,0 s** (30,3 MB gz); spannet oförändrat
10,3–23,9 s. Kvällsläge (fabrikskväll, ~1,9 GB RAM) väl inom spannet — ännu en
datapunkt för "RTO är tjockleks- och inte klockslagsberoende": morgon,
eftermiddag och kväll samma blad ≈ samma återställningstid.

## 2. RPO: kvällspunkten — profiltabellens sista lucka stängd

RPO-punkt kl 21:09:10 lokal (19:09:10Z), bladets ålder 18,65 h:

| Tabell | Dump (02:30) | Levande (14:40) | Levande (21:09) | Rörelse 14:40→21:09 |
|---|---|---|---|---|
| section_data_snapshots | 1 195 452 | 1 214 436 | 1 214 436 | **+0 — PUMPEN STILLA** |
| board_decisions | 47 810 | 48 194 | 48 402 | +208 |
| organ_health_logs | 2 937 | 2 961 | 2 973 | +12 |
| **Totalt (60 tabeller)** | **1 286 328** | **1 305 720** | **1 305 940** | **+220** |

1. **Pumpen: noll kvällsrörelse på 6,5 h.** Snapshots total 1 214 436 vid
   14:31, 14:40 OCH 21:09 — engångsbatchen 08:00 (+18 984) följdes av
   stilla pump resten av dagen. O9:s profiltabellförmodan "noll-rörelse
   15:00→02:29" bekräftad så långt instrumentet når (21:09); resten av
   fönstret (21:09→02:29) bevisas RETROSPEKTIVT av nattens bladväxling: det
   nya bladets snapshots-total minus 1 195 452 skall vara ≈ dagsteget
   (+19 8xx) — vore kvällsdrip på väg skulle talet bli större.
2. **Beslutsklockan: konstant snitt, tredje oberoende dagtimmen.**
   +220 på 6,48 h = **34 r/h** — identiskt med morgonens +408/11,9 h = 34 r/h.
   O9:s precisering "episodisk i takt, jämn i snitt" gäller nu morgon,
   eftermiddag (intra-dag +0 på 9,2 min) OCH kväll: episoderna pulserar
   (rondstyrt?), dygnssnittet ligger fast på ~34.
3. **Värsta-fallet-RPO**: 18 984 + ~24 h × 33 r/h ≈ **+19 780** — möter
   O9:s oberoende räkning ≈ +19 800. Två vägar, samma dom: worst case ==
   dagsteget, inträffar sekunder före 02:30-växlingen.

## 3. VAKTFYND: kuren som försvann — regression bevisad, återlevererad, committad

**Symptom (AUTO-6, 21:07):** `--fil db-2026-09-17.sql.gz` (bart bladnamn) gav
markörkollen "Filen kunde inte läsas (finns den?)" → RÖD → restore vägrades,
PG17 orörd. Fail-fast-riktningen höll (andra oberoende beviset för
vägranriktningen efter AUTO-3) — men symptomet var EJ väntat: AUTO-5 (14:33)
körde GRÖNT med NOTIS på exakt denna kommandoform.

**Bevis på regression (ej ny bugg):**
- AUTO-5 14:33 GRÖN med NOTIS = kuren levande på disk då.
- dr-ovning.mjs mtime **14:37** — filen skrevs EFTER beviset.
- `git log --all -- verktyg/dr-ovning.mjs`: senaste commit = **c3b871f7
  (09-16 FULL-övningen)**; `git diff HEAD` tom vid min start 21:07 ⇒ disken
  bar 09-16-versionen (path.resolve-rad 560, ingen valDump).
- O9:s commit f1a33e95 DOKUMENTERAR kuren i commit-meddelandet ("KUR av
  falsk RÖT-dom … dumpresolvering; beteendeprov RTO 14,1 s") men committade
  ALDRIG filen. Ingen stash, ingen reflog-post.

**Slutsats:** valDump()-kuren skrevs till disk ~14:31, bevisades 14:33 och
försvann vid 14:37-tidpunktens filskrivning (orsak ej determinerbar —
återställande mot HEAD eller motsvarande). Ocommittad kur = ingen kur
(AGENTS.md-doktrinen "Håll trädet COMMITTAT" — här i praktiken: bevisat
bortfall av leverans).

**Återleverans:** valDump() troget O9:s publicerade spec — given väg prövas
först; saknas den prövas `DUMP_KATALOG/<bladnamn>` med NOTIS-rad; saknas den
överallt behålls den givna vägen så markörkollen rapporterar RÖTT med
sökväg (fail-fast bevaras i båda riktningarna: en äkta ofullständig/saknad
dump kan aldrig bli GRÖN av kuren). `node --check` GRÖN.

**Beteendeprov (AUTO-7):** exakt det kommando AUTO-6 underkände kördes om
efter återleveransen → NOTIS + GRÖN full restore. Sekvensen AUTO-6 (RÖT-vägran,
PG orörd) → AUTO-7 (GRÖN resolverad) replikerar O9:s beviskedja — med den
avgörande skillnaden att filen denna gång COMMITTAS I SAMMA FÖNSTER som
beviset (denna commits enda verktygsändring).

**Läxa (ny DRIFTSBOK-norm):** verktygsändring + beteendeprov + commit i
samma fönster; "dokumenterad i commit-meddelande" ≠ levererad. Regressionen
är också ett argument i O9:s kö (2): dr-total.mjs-kontexten bör testa
NOTIS-vägen explicit vid nästa total.

## 4. Städning — egenmätt (uppdragets fjärde led)

- `pg_lsclusters`: 17/main **down** ✓ (verktygets finally + slutläge)
- base/: ENDAST systemdatabaserna OID 1/4/5 + tom pgsql_tmp — **noll
  skrap-svans** ✓ (s10-u1 O8-mönstret)
- pg_wal: **497 MB** — TREDJE dygnspunkten (morgon 497 → eftermiddag 497 →
  kväll 497); O9:s kö (3) WAL-trend fick en gratis kvällspunkt: stabil under
  hela dygnet ✓
- /tmp/dr-ovning-fel-2026-09-17.log: 34 881 byte (dagens 788 kända rader) —
  enligt mall sparad i /tmp ✓; inga nya /tmp/dr-total-rester ✓ (flockprov-
  filerna från 09-16 är dokumenterade bevisfiler — orörda)
- Låsfil /tmp/ak1a-dr-prov.lock: flock-lägets medvetet kvarlämnade tomma
  fil (c3b871f7-doktrinen: unlink under flock kan spränga skyddet) ✓
- Skrap-DB: psql-kopplingsvägran (server nere) = starkaste beviset att ingen
  ak1a_dr_test finns kvar ✓
- Disk 72 GB ledigt — oförändrad av övningen ✓

## 5. Slutsatser + kö

- **O9:s kö (1) INFRIAD:** kvälls-RPO-punkten tagen (21:09; köns ~22:00
  träffat inom kvällsfönstret) — pump-noll 14:40→21:09, profiltabellens
  mätbara sista lucka stängd; RPO-dygnsprofilen komplett: 02:30 växling (0)
  → 08:00 batchkliv (+18 984) → stilla pump + episodisk klocka ~34 r/h i
  snitt → värsta fall ≈ +19 800 sekunder före växlingen.
- **Regressionen botad med bevis:** kuren återlevererad, beteendeprovad
  (AUTO-6→AUTO-7) och committad i samma fönster.
- **Kö till nästa vakt:** (1) nattens bladväxling 02:30 bevisar
  retrospektivt 21:09→02:29-pump-noll (nytt blads snapshots-total −
  1 195 452 ≈ +19 8xx); (2) O9:s kö (2) kvarstår: valDump-NOTIS testas i
  dr-total.mjs-kontext vid nästa total (kedja 1 anropar med absolut väg —
  oförändrat beteende förväntas, men nu med commit-normen på plats);
  (3) WAL-kvartalsserien har ett helt stabilt dygn som grund (497×3);
  (4) COMMIT-NORMEN från §3 föreslås som standing DRIFTSBOK-rad för alla
  verktygsändringar.

— protokollfört 2026-09-17 av s10-u2 (vakt 2/3); maskinella delprotokoll:
DR-PROV-2026-09-17-AUTO-{6,7}.md + DR-RPO-DIFF-2026-09-17-KVALL.json
