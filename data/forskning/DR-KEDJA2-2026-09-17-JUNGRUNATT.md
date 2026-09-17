# DR-KEDJA 2 — JUNGFRUNATTEN FÖR CRONTAB-RAD 3 (02:40-exporten), 2026-09-17

Spår 10 (vakt) · s10-u2 omgång 8 (O8) · fabrikagent · körd 07:36–07:39 lokal
(05:36–05:39 UTC). Uppdragets bokstav: "DR-övning: återställ, mät tid/rader,
protokoll, städa lokal PG."

## 1. Objektval + duplikatkontroll

Bokförd kö inlöst — INTE ett fritt val: s10-u1 O4 bokförde "(3) jungfrunatten
för rad 3 bevisas 2026-09-17 enligt s10-u2 O2:s mönster" och s10-u1 O7
bekräftade den som kvarstående kö ("02:40-jungfrunatten kvarstår som tidigare
bokförd kö"). Mogen först efter kl 02:40 den 2026-09-17.

Duplikatkontroll FÖRE start (allt mätt i arbetsytan, aldrig worklog som källa):

- Restore-kärnan (kedja 1): 10+ gånger levererad, senast FÖNSTERKONTINUITETEN
  (s10-u3 O7, 01:44–02:0x lokal) — ALLA sex blad 09-11→09-16 bevisade.
- Kedja 2-restore: senaste = s10-u1 O7:s TOTAL (37,3 s på 09-16-arkivet,
  161 678 rader). INGEN hade restore-bevisat 09-17-arkivet — det EXISTERADE
  inte före 02:40:38 i natt.
- Senaste s10-aktivitet före mitt fönster: 01:56 (låsfilens pid-info);
  syskonen s9-dokvågen körde 06:5x–07:3x på SYSTEMKARTAN (annat spår).
- Fältet fritt: inga aktiva DR-processer (ps), DR-låset utan levande
  flock-hållare, PG17 nere vid ankomst (korrekt viloläge).

## 2. Jungfrunatt-beviset (rad 3:s FÖRSTA cron-körning någonsin)

Rad 3 installerades 2026-09-16 av s10-u1 O4 (taklyftet); 09-16:s export
(07:24) var MANUELL beviskörning. Natten till 09-17 var radens jungfrunatt.

Alla bevis MÄTT i arbetsytan 07:36–07:38 lokal:

| Bevis | Mätning |
|---|---|
| crontab rad 3 | `40 2 * * * cd /home/ak1a/AK1 && /usr/bin/node /home/ak1a/AK1/verktyg/backup-fran-molnet.mjs >> /tmp/moln-backup.log 2>&1` |
| Loggen FÖDD av körningen | `/tmp/moln-backup.log` Birth **02:40:01.838** (stat) — 09-16:s manuella körning skrev ALDRIG denna log; första raden är 09-17-rubriken |
| Körningens tidslinje | logg född 02:40:01 → 10 per-typ-filer 02:40:02.5–03.3 (stat, full-iso) → system-events-full-2026-09-17.json.gz slutgiltig **02:40:38.113** (27 542 167 B) → loggens sista skrivning 02:40:38.195 = hela körningen **≈ 37 s** |
| Obevakad | Ingen agent aktiv 02:40 (s10-aktivitet slutade ~02:0x; nästa arbetsyteaktivitet 06:5x) — leveransen skedde utan agent i kedjan |
| Total-kontrakt | loggen: `system-events-full: 163039 rader (33 sidor) … (total-kontrakt KOMPLETT 163039/163039)` — v3-trunceringsvakten GRÖN på sin första obevakade natt |
| Äkthetsdiff | 09-16 (manuell 07:24): 161 678 rader → 09-17 (cron 02:40): 163 039 = **+1 361 rader på 19 h 16 min** = äkta ny export, ej kopia (konsistent med kedja 6:s aufr-takt: +1 063 på 11 h dagtid; natten lugnare enligt O7:s nattdiff) |
| Arkivheader | datum=2026-09-17T00:40:28.783Z · antal=163039 · sidor=33 · truncerad=false |
| Per-typ-vyer | 11 filer, 26.32 MB totalt: blogg-utkast 7 rader (59 KB) · medlemmar 3 rader · övriga 8 tomma (0 rader) |

Sido-notis (samma natt, annan kedja — EJ mitt objekt): kedja 1:s 09-17-blad
väcktes 02:30:29 lokal, markörkoll GRÖN 1 307 940 rader (loggen
/tmp/supabase-backup.log) — rad 2:s och rad 3:s jungfrunätter är nu BÅDA
verifierade som levererande; rad 2:s 09-17-restore bevisades av O7 01:47
(före växlingen) och mitt fönster bevisar rad 3 ända till restore.

## 3. DR-övningen: återställ jungfrunattens arkiv (mät tid/rader)

`node verktyg/dr-kedja2.mjs` (node-kanalen — skal-kvotens kur 1) — verktyget
väljer SENASTE arkiv automatiskt = system-events-full-2026-09-17.json.gz.
Familjekontraktet intakt: flock-läge på /tmp/ak1a-dr-prov.lock · RAM-grind
GRÖN 1 042 MB · färsk skrap-DB ak1a_dr_json · DDL ur db-2026-09-17.sql.gz
(prodens egen definition) · garanterad städning i finally.

Resultat (GRÖN exit 0):

| Moment | Mått |
|---|---|
| RTO | **25,0 s** (totalt fönster 25,1 s) = KEDJA 2-SERIENS SNABBASTE (52–58 · 27,2 · 38,5 · 37,3 · **25,0** s) |
| COPY | 163 039 rader · 6 535 rader/s · exit 0 |
| Felaktiga rader | 0 · dubblett-id 0 · details=null 0 |
| Domkontrakt | 5/5 GRÖNA (gzip-ström · header-kontrakt · radantal==header.antal · giltiga rader · COPY-räkning) |
| Oberoende verifiering | rader 163 039 == unikaId 163 039 · typer: oversattning=146 190 · trafik=15 915 · sakerhet=823 · akm2_snapshot=101 · blogg_utkast=7 · medlem=3 · severity info=162 296/warning=743 · jsonb-prov (details->>'dag') 15 915 |
| Tidsfönster | 2026-09-03 22:43:12 → **2026-09-17 02:40:02** (+02) — sista raden skriven sekunder före exportens läsning; fönstret bär hela 14-dagarsminnet |

## 4. Städning lokal PG (verktygets finally + oberoende verifierad)

- Verktyget: skrap-DB ak1a_dr_json raderad · PG17 stoppad (finally-garantin).
- Oberoende efterkontroll (ägart mätt): pg_lsclusters = **down** · psql mot
  lokalt kluster VÄGRAR anslutning (starkaste beviset: servern nere) ·
  låsfilen bär endast pid-info (flock-läge, avsett viloläge) · disk 73 GB
  ledigt · inga tmp-filer läckta.

## 5. Fynd och observationer

1. **KEDJA 2 BEVISAD ÄNDA TILL ÄNDA UTAN AGENT I KEDJAN** — O2:s kedja
   1-jungfrunattmönster (2026-09-16) gäller nu BÅDA nattkedjorna:
   cron → export → total-kontrakt → gzip-arkiv → restore → oberoende
   verifiering. RPO kedja 2 = dygnlig 02:40, ingen retention (system-events
   är arkivhandlingar enligt O4:s beslut). Kedja 2 förblir ENDA kopian av
   system_events (tväprojekt-fyndet kedja 6: rkaq-dumparna saknar tabellen,
   arkivet läser aufr = appens projekt).
2. **0 dubblett-id** mot gårdagens 4 (161 678 rader/161 674 unika).
   Hypotes, EJ bevisat: v3:s repetitionsskydd (ignorerad Range → samma
   första rad-id → break) kan ha stängt dubblettkällan — sidhämtnings-
   duplicering i v2-läget. Prod-tabellens saknade PK kvarstår som risk
   (u3:s bokförda kö, oförändrad).
3. **Kontrastfynd** (bokförs som köpost till vakten, ingen åtgärd här):
   nattens 11 per-typ-vyer: 8 av 11 tabeller TOMMA (0 rader) — medlemmar 3,
   blogg-utkast 7, allt annat 0. Är per-typ-vyerna för appens aufr-projekt
   men writes via andra vägar, eller är tabellerna folktomma i molnet?
   Följs upp av den som äger per-typ-kedjan (kedja 4-familjen).

## 6. KVD

- Endast data/ + worklog berörda = INGET bygge; src/ orörd; tsc-baslinjen
  orörd (pre-commit-grinden verifierar vid commit).
- R2 orörd: inga priser/tier/publicering; data/blogg/ orörd; inga
  nyckelfiler rörda.
- Verktyg orörda (befintliga, bevisade familjekontrakt) — inga nya verktyg.

## 7. Kö

- Ingen NY huvudkö från denna övning. Kvarstående bokförda köer oförändrade:
  board_decisions-specialrecept (FK-paus/tabellswap, huvudagenten) ·
  dedupe-läge i aterstall-system-events.mjs · första äkta bladraderingen
  ~2026-10-11+ (fönsterdjupets dag-29-runbook gäller då 09-11-bladet) ·
  vakta total-kontraktet i /tmp/moln-backup.log (TRUNCERAD-varning =
  tak/paginering).
- Återkommande jungfrunatt-bevis behövs EJ längre som separat köpost: båda
  nattkedjorna är nu ända-till-ända-bevisade; fortsatt vakt = loggarna
  (markörkoll 02:30 · total-kontrakt 02:40) enligt DRIFTSBOKEN §4.
- Köpost till nästa rond: per-typ-vyernas 8 tomma tabeller (se fynd 3).

SLUT — agentprotokoll s10-u2 O8, 2026-09-17 07:39 lokal.
