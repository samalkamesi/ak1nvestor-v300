# FYND 2026-09-16 — TVÅ SUPABASE-PROJEKT: dumpkedjan och appens REST läser OLIKA projekt (DR-KEDJA 6, s10-u3)

Kontext: DR-övning KEDJA 6 (storage-restore, `verktyg/dr-kedja6.mjs`, maskinellt
protokoll `DR-KEDJA6-2026-09-16-AUTO.md`) korsade dumpens storage-metadata mot
levande Storage-API — och fann 0 gemensamma objekt. Uppföljningsmätningarna
nedan (samma arbetsyta, 18:4x lokal, alla läsande instrument) bevisar roten:

**Plattformens data lever i TVÅ olika Supabase-projekt, och de två
backup-vägarna backar ALLTID VAR SIN del — ingen har någonsin mätt helheten.**

## 1. Bevisen (tre oberoende instrument)

| Instrument | Projekt (ref) | system_events | members | board_decisions | snapshots | storage-buckets |
|---|---|---|---|---|---|---|
| Nattdump-cron 02:30 + ALLA psql-sonder (`.pgpass` → `db.rkaq…wxrw.supabase.co`) | `rkaqmulgoubvewwnwxrw` | **0** (i ALLA dumpar 09-11, 09-13, 09-16) | **0** | **47 602** | **1 176 468** och växer (+~19 000/dag: 1 138 500 → 1 157 484 → 1 176 468 för 09-14/15/16) | 5 st (B2B-uppsättningen course-materials/analysis-reports/thumbnails/avatars/webinar-recordings, oförändrad sedan 2026-07-23/24) |
| Appens REST (`.env` `NEXT_PUBLIC_SUPABASE_URL` → `…suhvlsbp` = AGENTS.md:s dokumenterade "ref suhvlsbp") | `aufrvmesyzsfsuhvlsbp` | **162 741 och VÄXER** (161 678 kl 07:24 → 162 741 kl 18:4x = +1 063) | **3** | **77** | **404 — tabellen FINNS EJ** | 3 st (user-files, **ak1nvestor-code (PUBLIK)**, media) |
| Moln-JSON-exporten 02:40 (`backup-fran-molnet.mjs`, läser samma REST-env) | `aufr…suhvlsbp` | full-dump sedan 09-08 (27 MB, GRÖN) | per-typ | per-typ | — | — |

REST-värdena är uppmätta med läsande anrop (`Prefer: count=exact`); dumpvärdena
är COPY-radantal i dumpfilerna (zcat+awk). REST-basens host-prefix
`aufrvmesyzsfsuhvlsbp` slutar på AGENTS.md:s "ref suhvlsbp" — appens projekt är
det dokumenterade; dump-cronens `.pgpass`-host pekar på det andra.

## 2. Vad som löser sig (dagens mysterier var artefakter)

1. **"AKUT FYND: system_events TOM i levande prod" (DR-KVARTAL §4, 13:4x) —
   MOTBEVISAT som radering.** Tabellen är 0 i rkaq-projektet I ALLA DUMPAR
   (sedan minst 09-11) och lever i aufr-projektet. Ingen raderade 161 678
   rader "07:23–13:46"; psql-sonden och exportören läste olika projekt. Att
   "nya events skrivs EJ heller" var samma artefakt — skrivvägen lever
   (+1 063 rader på 11 h, mätt).
2. **Dumkontradiktionen** (dump 02:30 bär 0 COPY-rader medan exporten läste
   161 678 kl 07:24, arkiv-mtime 07:24:42): upplöst — olika fysiska förråd,
   inte olika läsvägar mot samma förråd.
3. **members=0 + user_activities=0 "i båda instrumenten"** (E33-sektionens
   not): members = 3 i aufr (REST); psql-instrumentet läste rkaq.
4. **Storage-bytet "idag"**: inget byte — de 5 B2B-buckets (juli) är rkaq:s,
   de 3 levande är aufr:s. Alltid olika, aldrig mätt som par förrän nu.

## 3. Konsekvenser för backup-kontraktet (spår 10)

- **Kedjorna 1/3/4/5 (SQL-dumpen) bevisar rkaq-projektet** — deras
  restore-bevis och RTO-tal står sig (rkaq↔rkaq är rätt jämförelse för den
  delen). Snapshots/board_decisions/kurser (det stora) backas och är
  restore-bevisat.
- **Kedja 2 (moln-JSON) backar aufr-projektets system_events** — och är i
  dagens läge den ENDA skyddade delen av aufr. aufr:s övriga tabeller
  (members 3, board_decisions 77 m.fl.) har INGEN backup alls.
- **Båda projektens Storage-BLOBBAR är oskyddade**: SQL-dumpen bär bara
  metadata (storage.objects), moln-JSON läser system_events. En raderad blob
  är borta. (Metadata-lagret + innehållsvägen är nu restore-bevisade av
  KEDJA 6 — runbook i protokollet.)
- **HELA strukturen är odokumenterad**: DRIFTSBOKEN/kartan beskriver ETT
  "Supabase"; verkligheten är en hybrid (DATABASE_URL→rkaq för snapshots-
  skrivaren enligt tillväxten; REST→aufr för events/members/auth).

## 4. Säkerhetsfynd (R2 — lämnas till huvudagenten, röras aldrig av agent)

- aufr:s bucket **`ak1nvestor-code` är PUBLIK och innehåller bland annat en
  fil med namn `.env.local` (193 B) samt en kodbas-zip (1 272 122 B)** —
  namnen sågs i listningen; innehållet lästes ALDRIG (R2-filtret i
  dr-kedja6.mjs uteslöt dem från innehålls-provet). Om filen bär det namnet
  på skäl bör den inte ligga publikt. Åtgärd = huvudagenten/kunden.

## 5. Kö till huvudagenten (prioriterad)

1. **STOPPA/ompröva återimporten** av system_events-arkivet (läkeköns steg
   i DR-KVARTAL §4–5 + E33): arkivet är en export UR aufr som fortfarande
   lever och växer — återimport skapar dubbletter (tabellen saknar PK).
   Arkivet behåller sitt värde som 02:40-snapshot av aufr.
2. **Konfigutredning** (R2 — .pgpass/.env ägs av huvudagenten): när och av
   vem ställdes dump-cronen mot `rkaq…`? Avsiktlig hybrid (två projekt med
   roller) eller migreringskvarleva? Om kvarleva → peka om 02:30-cronen till
   aufr:s db-host (SÄRSKILT om aufr anses vara "prod": dess övriga tabeller
   är idag oskyddade). Isåfall också kolla-dump-markorers baslinje.
3. **Tvåprojekt-kartan i DRIFTSBOKEN**: dokumentera vilken data lever i
   vilket projekt och vilken kedja som täcker vad (tills dess gäller denna
   fyndrapport som kartmaterial).
4. **aufr-täckning**: vidta beslut om backup av aufr:s icke-events-tabeller
   (pg_dump mot aufr, eller utökad per-typ-export) — tills dess är gapet
   ostrukturerat.
5. **Storage-blob-backup** (båda projekten) + säkerhetsåtgärd för det publika
   `ak1nvestor-code`-bucketet (§4).

## 6. Mätinstrument och spårbarhet

- dr-kedja6.mjs-körning 18:41–18:43 lokal: retentionssvep 6/6 GRÖN, dump-
  markörer GRÖN (1 288 041 rader), full restore skrap-DB 13,8 s (788 kända
  fel/0 okända), storage-metadata 5 buckets/63 objekt/0,57 MB, live-lista
  0,7 s, innehålls-prov ak1nvestor-code.zip 1 272 122 B == live-lista
  (KONTRAKT GRÖNT; objektet finns ej i rkaq-dumpen — väntat, annat projekt).
- REST-räkningar 18:4x: count=exact via service-role (läsande), värden i §1.
- Dump-tidsaxeln: zcat+awk COPY-räkning per tabell och dag (09-11 → 09-16).
- GDPR: inga personvärden, inga nyckelvärden redovisade; endast antal, namn
  på buckets/filer (metadata), tider och projekt-ref:er (host-prefix är
  konfiguration, inte hemlighet — crontab-citeringen är sedan tidigare sedan
  public i DRIFTSBOKEN med samma host synlig).

SLUT — DR-KEDJA6-TVAPROJEKT-FYND, s10-u3 (fabriksagent, spår 10 vakt), 2026-09-16 ~18:5x lokal.
