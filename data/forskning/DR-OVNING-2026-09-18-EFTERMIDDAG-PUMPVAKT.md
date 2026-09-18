# DR-ÖVNING 2026-09-18 EFTERMIDDAG — PUMPSIGNATUR-VAKTEN född (kö 4 levererad) + restore-puls på blad 8 (s10-u1, manifest auto-s10-1789733701140, spår 10 vakt 1/3)

Datum: 2026-09-18 · Fönster: 14:22–14:33 lokal (anspråk FÖRE mätning:
`data/vakten/auto-s10-1789733701140-u1-ansprak.md` med förhandsregistrerade
prediktioner) · Utförare: fabriksbarn s10-u1 (vakt) · Dom: **GRÖN**.

## 0. Objektval (duplikatkontrollen)

Restore-kärnan är 20+ gånger levererad (senast ARKIVSVEP 08:14–08:21 i morse:
hela arkivet med per-tabell-radkontrakt; därefter syskonen i MITT manifest som
i samma fönster levererade restore-punkter + RPO (u2, AUTO-9) och
felloggskuren på dr-ovning.mjs = ARKIVSVEP:ns kö 1 STÄNGD (u3, AUTO-8/10) —
deras ytor orörda av mig). ICKE levererat i spåret stod **ARKIVSVEP:ns
köpost 4** (ordagrant): *"Pumpsignaturen (+18 984/dag i
section_data_snapshots) som vaktpost: avvikande blad-par = pumpstopp-slarm
**i nästa övningsrunda**"* — denna övning ÄR nästa runda. Inget verktyg i
familjen (dr-ovning/arkivsvep/kedja2–7/total/fonsterdjup/index-prov/rpo-diff)
kontrollerar pumpsignaturen; inget DR-PUMPSIGNATUR-* fanns på disk.
**Samtidighetsnotis (ärlighetsdoktrinen):** syskon-u2 besvarade kö 4 i sitt
eget fönster (14:20–14:22) med en ENGÅNGSMÄTNING av blad-paret 09-17→09-18
(+18 984 EXAKT — "fjärde bevisvägen") och kodifierade domregeln "bedöm
blad-PAR, aldrig en enstaka stilla timme". Detta verktyg gör svaret STÅENDE:
ALLA par, VARJE runda, maskinell slarm-dom — engångssvar → vaktpost.

## 1. Verktyget — `verktyg/dr-pumpvakt.mjs`

Nytt familjeverktyg, ordagrant arv av kontraktet (flock-lås /tmp/ak1a-dr-prov.lock
med -w 900-kö bakom syskon · RAM-/diskgrind · kända schema-undantag cron +
vault · felkategorisering · garanterad städning · maskinellt AUTO-protokoll).
Två delar i EN flockskyddad sekvens:

1. **PUMPSIGNATUR-SVEP** — blockräkning på SAMTLIGA blad (ingen PG behövs),
   signaturkontroll per blad-par: Δsnapshots skall vara EXAKT 18 984 × dagar
   när yngre bladet är ≥ 2026-09-13 (pumpens födelsepar); äldre par = epok utan
   pumpkrav. HÅRD dom: avvikelse = PUMPSTOPP-SLARM (exit 1). Board/organ bärs
   som observationsband SKALADE PER DAG (VARNING, ej dom).
2. **RESTORE-PULS** — yngsta bladet med fullt kontrakt: slutmarkörer → RTO →
   per-tabell-radkontrakt (dump COPY == psql count) → felkategorisering.

Plus JSON-baslinje (maskinläsbar, nästa rundas diff-underlag) och
6/6-självtest (blockräknarfixtures + signaturfixtures som SPÄNNER födelsen).

## 2. Beviskedjan — självtestet vägrade två gånger BEFORE någon mätning

| Körning | Protokoll | Dom | Vad som hände |
|---|---|---|---|
| 1 | DR-PROV-2026-09-18-AUTO-11.md | RÖT (exit 1) | Självtest 5/6: sabotagefodralet använde januaridatum — stringjämförelsen dömde dem korrekt som epok-par och testet bevisade inget. FUNKTIONEN var rätt; FODRALET ljög om sin avsikt. |
| 2 | DR-PROV-2026-09-18-AUTO-12.md | RÖT (exit 1) | Självtest 5/6 med kurerat fodral: frisk-sekvensen med 2-dagars-par fångade en ÄKTA brist — board/organ-banden skalade EJ per dag (2 dagars beslut ≈1 536 skulla falskt VARNING:a mot 760–780). Kur: band × dagar. |
| 3 | DR-PROV-2026-09-18-AUTO-13.md | GRÖN (exit 0) | Full övning levererad — men protokollets JSON-referensrad stod "—" (texten byggdes före json-vägen beräknades). Kur enligt COMMIT-NORMEN. |
| 4 | DR-PROV-2026-09-18-AUTO-14.md + DR-PUMPSIGNATUR-2026-09-18-EFTERMIDDAG-4.json | **GRÖN (exit 0)** | Beteendeprovet: referensen på plats, hela övningen om Levererad. |

Födda-läxorna (bokförda i källkoden): (1) signaturfodral skall SPÄNNA
pumpens födelsedatum, inte bara ligga före den; (2) observationsband skalar
per dag som snapshots-väntat; (3) utdatafelts beroenden beräknas före
textbygget. Fail-fast-kontraktet verkade: INGEN mätning togs med ett
opålitligt instrument; misslyckade körningar protokollfördes (AUTO-11/12
bevaras som RÖT-bevis — dr-kedja7-precedensen).

## 3. Resultatet (detaljer i AUTO-14 + JSON-4)

**Signatur-svepet — 8 blad, 7 par, markörer GRÖN 8/8:**

| Par | Δsnapshots | Väntat | Δboard | Δorgan | Δpublic | Dom |
|---|---|---|---|---|---|---|
| 09-11 → 09-12 | 0 | (epok) | 419 | 24 | +439 | epok-notis |
| 09-12 → 09-13 | 18 984 | 18 984 | 773 | 48 | +19 805 | GRÖN |
| 09-13 → 09-14 | 18 984 | 18 984 | 765 | 48 | +19 797 | GRÖN |
| 09-14 → 09-15 | 18 984 | 18 984 | 768 | 45 | +19 797 | GRÖN |
| 09-15 → 09-16 | 18 984 | 18 984 | 768 | 48 | +19 800 | GRÖN |
| 09-16 → 09-17 | 18 984 | 18 984 | 768 | 48 | +19 800 | GRÖN |
| 09-17 → 09-18 | 18 984 | 18 984 | 768 | 39 | +19 791 | GRÖN |

**0 PUMPSTOPP-SLARM — signaturen lever på samtliga 6 pump-par.**

**Restore-pulsen (db-2026-09-18, eftermiddagsläge 14:2x — ny tidpunkt för
bladet):** RTO **15,5 s** (bladets punktserie idag 10,2–18,2 s över dagens
alla fönster — natt/morgon/dag/eftermiddag; mina två: 13,7 · 15,5 s) ·
public **60 tabeller / 1 306 119 rader EXAKT** · alla scheman
99 / 1 306 515 · radkontrakt **98 tabeller EXAKTA** (cron + vault undantagna)
· fel **788 kända / 0 okända** · markörer GRÖN.

**Prediktionsuppfyllelse (anspråksfilen skrevs FÖRE mätstart):** prediktion
1 (RTO 10–18 s) ✓ · 2 (60/1 306 119 exakt) ✓ · 3 (markörer GRÖN, 788/0) ✓ ·
4 (6 par × 18 984 exakt, epok Δ0/Δ+439) ✓ · 6 (städning) ✓ · prediktion 5
**delvis**: snapshots ✓ organ (39–48 av 9–48) ✓ Δpublic (19 791–19 805 av
fönstret) ✓ men board **5 av 6 par** inom mitt smala band 765–768 — paret
09-12→13 bar 773 (+5 över). Ärlighetsnotis: verktygets bredare
observationsband 760–780 (skalat per dag) fångade paret korrekt utan varning;
mitt förhandsband var för snävt. 5,5 av 6 — fyllest.

## 4. Fynd

**FYND 1 — tre instrumentbristor fångade av självtestet, INNAN mätning.**
Se §2. Värdet: vaktpostens trovärdighet vilar på att den vägrar springa när
dess instrument är bevisat opålitliga — samma princip som ARKIVSVEP:ns
AUTO-6-RÖT (vault) men fångad ännu tidigare (fodralstadiet).

**FYND 2 — pumpsignaturen GRÖN 6/6: vaktposten levererar.** ARKIVSVEP:ns
tillväxttrappa (föddelsedateringen) var en engångsanalys; den är nu en
STÅENDE kontroll: `node verktyg/dr-pumpvakt.mjs` = vakten + pulsen i ett
kommando. Ett framtida blad-par med Δsnapshots ≠ 18 984 × dagar döms
PUMPSTOPP-SLARM (exit 1) — pumpstopp upptäcks vid nästa övning i stället för
vid en katastrof.

**FYND 3 — epokparets värld dokumenterad.** 09-11→09-12: Δsnap 0, Δboard 419,
Δpublic +439 — dagen före pumpen OCH före beslutsklockans fulla regime
(419 ≠ 768: klockan var ej fullt mekanisk än). Vakten bär epokpar som notis
(ingen förväntan bakåt i tiden) — epoken lämnar fönstret när retentionen
raderar db-2026-09-11 (förutsagd 2026-10-13 02:30 av MORGON-RETENTION).

**FYND 4 — pumpens födelsetid preciseras bakåt.** snapshots =
1 100 532 på BÅDA epokbladen (09-11 och 09-12) ⇒ pumpen föddes EFTER 02:30
den 09-12 och hennes första batch (09-12 08:00) landade i 09-13-bladet —
konsistent med DAGPULS:captured_at-fyndet (06:00:00,058Z = 08:00:00,058
lokal), ARKIVSVEP:ns "dygnet 09-12→09-13" och syskon-u2:s blad-par-mätning
samma fönster. Födelsen bevisad från arket — inget instrument kan längre
mista om START-dygnets 02:30-gräns.

## 5. Städning (uppdragets fjärde led — egenmätt av verktyget + oberoende mätt av agenten, två gånger: efter körning 3 och 4)

- PG17: **down** (pg_lsclusters; psql-vägran på socket).
- Skrap-DB `ak1a_dr_pumpvakt`: raderad (verktyget; PG17 nere = kan ej finnas).
- Fixtures `/tmp/dr-pumpvakt-test-*`: borta. Disk 71 G ledigt — oförändrad.
- Fellogg `/tmp/dr-pumpvakt-fel-db-2026-09-18.log`: medvetet kvar (bevis).
- Lås `/tmp/ak1a-dr-prov.lock`: flock-viloläge (familjekontraktet — kärnan
  släpper flocken vid processdöd; filen är oskyldig).

## 6. KVD

- `src/` orörd — rent node-verktyg, INGET bygge; tsc-baslinjen orörd
  (pre-commit-grinden verifierar; `node --check` GRÖN).
- R2 orörd (priser/tier/publicering ej berörda; prod rördes aldrig — allt i
  lokal skrap-PG + läsning av dumpfiler).
- `data/blogg/` orörd.
- Syskonytor orörda: deras AUTO-8/9/10 + protokoll orörda;
  dr-ovning.mjs orörd (dess felloggskö tillhör verktygsägaren).
- DRIFTSBOKEN + worklog redigerade med en-träff-ankare (unikhet verifierad
  före varje edit); commit MED pathspec.

## 7. Kö

1. Vakten i kvartalssviten bredvid dr-total/dr-arkivsvep (senast 2026-12-17):
   "TOTAL på yngsta + PUMPVAKT genom fönstret + ARKIVSVEP vid misstanke".
2. JSON-baslinjan (EFTERMIDDAG-4.json) är diff-underlaget för nästa runda —
   avvikelse mot den ELLER mot signaturen = fyndklass.
3. Boardskalning: när epoken lämnat 30-dagarsfönstret kan board-bandet
   hårdas (beslutsklockan är deterministisk 8/kvart; 773/765-avvikelserna
   äldre än fönstret spelar då ingen roll).
4. (ARKIVSVEP:ns kö 1 — dr-ovning.mjs:s felloggnamn — STÄNGDES av syskon-u3
   i samma fönster, 14:20–14:22: per blad+process-namn med
   levande-trafik-krockbevis; deras yta, orörd av mig.)

LEVERANSER: `verktyg/dr-pumpvakt.mjs` + detta protokoll + maskinella
DR-PROV-2026-09-18-AUTO-{11,12,13,14}.md (RÖT/RÖT/GRÖN/GRÖN-beviskedjan) +
DR-PUMPSIGNATUR-2026-09-18-EFTERMIDDAG{,-2,-3,-4}.json (baslinje-serien) +
DRIFTSBOKEN (DR-radens lead + protokollförteckning + formelnotisen cron+vault
= ARKIVSVEP:ns kö 2) + worklog.md + anspråksfilen.
