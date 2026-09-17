# DR-TOTAL 2026-09-17 — KIRURGI-VÄVNINGEN: TOTAL-mallen komplett med kedja 5 (agentprotokoll)

Spår 10 (DATAINTEGRITET & BACKUP) · s10-u1 O7 (auto-s10-1789602326938, roll vakt) ·
Körning 2026-09-17 01:52–01:55 lokal (23:52–23:55Z 09-16 — maskinella protokoll
bär därför bladnamn med UTC-datum 2026-09-16).

## 1. Objektval (bokat FÖRE ingreppet)

- **Källpunkt:** s10-u2 O5:s bokförda kö (worklog 2026-09-16 14:15 +
  DR-KEDJA5-2026-09-16-KIRURGI.md): *"väv dr-kedja5 i TOTAL-mallen till
  2026-12 ELLER kör manuellt vid tabellincident"* — olevererat sedan 09-16.
- **Bokning:** anspråksfil `data/vakten/auto-s10-1789602326938-u1-ansprak.md` +
  worklog-rad 01:52Z, FÖRE första filrörelse (kollisionsdoktrinen — manifestet
  gav alla tre syskon "välj själv"-text).
- **Duplikatkontroll vid bokning:** kedjorna 1–6, TOTAL-mallen (4 kedjor),
  flockprov, markörvakt, index-prov, taklyft — allt LEVERERAT 09-15/09-16;
  kirurgi-vävningen var enda kvarvarande bokförda kö-item i spåret som inte
  kräver huvudagentbeslut. 02:40-jungfrunatten (molnexporten) kan bevisas först
  efter kl 02:40 lokal — utanför detta fönster, lämnad åt nästa våg.
- **Syskonläge under fönstret:** s10-u2 O7 levererade NATT-DR + RPO-diff
  (01:47–01:51, DR-OVNING-2026-09-17-NATT-RPO.md) — annat objekt, noll
  filöverlapp; deras sektion avgränsar min bokning (korsrefererad).

## 2. Vävningen (verktygsändring)

`verktyg/dr-total.mjs` (författare s10-u2 O3/O4; vävning = detta objekt):

1. **KEDJOR[1] = kedja 5** (dr-kedja5.mjs) som steg 2 av 5 — mallordning
   **1 → 5 → 2 → 4 → 3**: kirurgin direkt efter sin KÄLLKEDJA (den
   extraherar ur samma SQL-dump som kedja 1 återställer), PG-kedjorna förblir
   före serverfilsarkivet (DRIFTSBOKENs mallrad bevarad).
2. **--utan-kirurgi**: hoppar kirurgi-steget med protokollförd skipprad —
   rescue-läge (vid verklig tabellincident körs dr-kedja5 manuellt med
   --tabell; i pågående katastrof betalar man inte övningstiden för ett
   scenario man är mitt uppe i). Kontraktstest: okänt argument vägras
   exit 2 FÖRE lås/PG (bevisat: `--finns-ej` → exit 2).
3. **Protokolltexter dynamiska**: "samtliga N kedjor", ordningsträng ur
   faktiskt körda kedjor, skipprad renderas; flockprov-wrappern
   (dr-total-flockprov.mjs) är generisk — endast kosmetisk kommentar
   uppdaterad.
4. Barnkontraktet orört: dr-kedja5 äger egen skrap-DB (ak1a_dr_k5) + eget
   barnlås (/tmp/ak1a-dr-prov.lock) + egen RAM-/diskgrind — dr-total håller
   ALDRIG barnens lås (dödlägesskyddet dokumenterat sedan O3).

## 3. Äkta femkedjekörning — GRÖN exit 0, TOTALT 187,2 s

| Kedja | Verktyg | Exit | Väggtid | Kärnbevis |
|---|---|---|---|---|
| 1 SQL-dumpen | dr-ovning.mjs | 0 | 21,5 s | restore 11,8 s · public 60 tabeller/1 266 528 rader · fel 788 kända/0 okända |
| **5 KIRURGI (nytt i mallen)** | dr-kedja5.mjs | 0 | **73,0 s** | full restore 11,4 s · källa 1 176 468 rader · extraktion 2,2 s/93 369 KiB · **sabotage GRIPET** (psql vägrade, transaktionen rullad) · **kirurgi 13,7 s** · radtal+checksumma IDENTISKA (7af32541f90e…) |
| 2 Moln-JSON | dr-kedja2.mjs | 0 | 37,3 s | 161 678 rader · 5 158 r/s COPY · 0 felaktiga |
| 4 Per-typ | dr-kedja4.mjs | 0 | 29,1 s | 10/10 filer GRÖNA · sabotage 3/3 |
| 3 Serverfils-arkivet | dr-kedja3.mjs | 0 | 26,4 s | 8 322 filer == listat · klon 1 195 commits |

**TOTALT 187,2 s == väggklocka** (iterationsserie: 130,0 → 147,0 → **187,2 s**
med kirurgi; kirurgikostnaden +40–73 s köper EN-tabells-scenariot in i
kvartalsbeviset). Retentionssvep 6/6 dumpar gzip-gröna (kirurgikedjans
ständiga kontrakt). RPO-läge: db-2026-09-16 (02:30-cronens jungfrunattsblad)
· system-events-full-2026-09-16 · server-git-2026-09-16.bundle.

Maskinella protokoll: `DR-TOTAL-2026-09-16-AUTO-3.md` (överprotokoll) +
delprotokoll DR-PROV-2026-09-16-AUTO-6 · DR-KEDJA5-2026-09-16-AUTO-4 ·
DR-KEDJA2-2026-09-16-AUTO-5 · DR-PROV-2026-09-16-KEDJA4-5 ·
DR-KEDJA3-2026-09-16-AUTO-6.

## 4. Fynd

1. **FLOCK-KÖ MELLAN AGENTER — skarpt bevis:** syskonets dr-ovning
   (låsfil pid=1314546 start 23:55:16.462Z) tog prov-låset **13 ms efter**
   mitt överprotokolls SLUT-rad (23:55:16.475Z) — deras process KÖADE korrekt
   bakom mina barns prov-lås genom hela min total. Flock-lagret (s10-u2 O6:s
   beteendeprov) här bevisat i verklig tvåagents-trafik: noll kollision,
   noll förlorat fönster. PG17 var online vid min efterkontroll = SYSKONETS
   aktiva fönster (deras ägo — orört av mig; min övning städade maskinellt:
   överprotokollet bokför "PG17 NERE vid övningens slut").
2. **Kirurgins tid i totalen är lastberoende som väntat:** fristående O5 körde
   kirurgi 15,5 s på samma tabell; i totalen 13,7 s (bar inga konkurrerande
   syskon-barn just då) — serien är stabil, TOTAL-RTO är måttet som bär
   helheten.
3. **Bladnamnens UTC-förskjutning:** körning 01:5x lokal 09-17 → maskinella
   protokoll daterade 2026-09-16 (toISOString). Känd mönsterklass (s10-u2 O7
   noterar samma för AUTO-5); agentprotokollet (denna fil) bär lokaldatum
   2026-09-17 och kopplar samman.

## 5. Kö till huvudagenten

- **Ingen ny från detta objekt.** Kvartalsmallen 2026-12 = **ETT kommando**:
  `node verktyg/dr-total.mjs` (fem kedjor; `--utan-kirurgi` i rescue-läge);
  komplement `node verktyg/dr-fonsterdjup.mjs` vid sen upptäckt (djup+bredd,
  S10-U1 O6). Kvarstående tidigare kö: board_decisions-specialrecept,
  dedupe-läge i aterstall-system-events.mjs (blockerare för ev. återimport),
  02:40-jungfrunatt bevisas efter 02:40 lokal 09-17.

## 6. KVD

- node --check ×2 (dr-total.mjs, dr-total-flockprov.mjs) GRÖN;
  `--hjalp` bär nya kontraktet; negativtest `--finns-ej` exit 2.
- src/ ORÖRD → inget bygge; tsc 0 via projektbinären
  (node_modules/typescript/bin/tsc — ALDRIG npx).
- R2 orörd (inga priser/tier/publicering) · data/blogg/ orörd.
- Prod orörd — övningen skedde endast i lokal PG17-skrap under flock;
  städning maskinell + protokollförd (skrap-DB ak1a_dr_k5 + ak1a_dr_test +
  ak1a_dr_json + ak1a_dr_pertyp raderade av respektive barns finally).

SLUT — agentprotokoll s10-u1 O7, 2026-09-17 ~02:0x lokal
