---
slug: kvartalsrapport-2026-q3
title: "Kvartalsrapport 2026:3 — vågmotorns öppna kvitto"
description: "Vågvalideringens träffbild för Q3 2026 — per horisont och klass, med regime-läge, kalibreringsdrift och kvalitetsstatus. Siffror ur källorna; ärligt om det som saknas."
pillar: Institutionell metodik
author: AK1A Research Lab
publishedAt: 2026-09-11
readingMinutes: 6
tags: [kvartalsrapport, vågvalidering, AKM3, kalibrering, regime, transparens]
---

<!-- UTKAST — genererad av verktyg/kvartalsrapport.mjs. Publicering = kundens beslut (R2).
     Vid publicering: konvertera till BlogPost-JSON i data/blogg/ (fälten ovan + body). -->

# Kvartalsrapport 2026:3 — vågmotorns öppna kvitto

Det här är AK1A:s kvartalsrapport för Q3 2026: ett automatförberett utkast som sammanfattar vad systemets egna mätningar faktiskt visade under kvartalet — vågvalideringens träffbild, regime-läget, kalibreringsdriften och kvalitetsvaktsstatusen. Varje siffra är hämtad ur källorna vid genereringstillfället och källhänvisas per avsnitt; där en källa saknar data för perioden står det rakt ut, för motorn gissar aldrig.

Rapporten är pedagogisk till sin natur: den visar hur ett analyssystem kan hålla sig självt ansvarigt genom öppna kvitton. Träffprocent är ett kvitto på det förflutna — aldrig en garanti om framtiden.

## 1. Vågvalideringen — träffbilden

Vågmotorn dömer sin egen vågklass mot faktiskt fundamental momentum, rond för rond. Under Q3 2026 redovisas **1 rond med domslut** (domdatum: 2026-09-04); de rullande räknarna startade 2026-09-04. Källans historik (historikV1) är ännu tom — tidigare körningar inom kvartalet kan därför inte räknas ihop ärligt.

Universumet omfattar 12 tickers (namnges aldrig här — det här är metodik, inte bolagsval). Senaste ronden mätte 12 tickers × 5 horisonter; **48 mätningar kunde dömas** och 20 % höll klassen osatt — osatt räknas i täckningsbråket, aldrig som fel. Total träffbild: **52 %** (n=48).

### Träffprocent per horisont och vågklass

| Horisont | impulsvåg | korrigering | basbygge |
|---|---|---|---|
| mikro | 75 % (n=4) | — (n=0) | 63 % (n=8) |
| kort | 100 % (n=2) | — (n=0) | 30 % (n=10) |
| medellång | 100 % (n=6) | — (n=0) | 0 % (n=6) |
| lång | — (n=0) | — (n=0) | — (n=0) |
| mega | 100 % (n=6) | — (n=0) | 0 % (n=6) |

_n = antal dömda mätningar (träff + miss). Osatta andelar redovisas inom parentes och räknas aldrig som fel._

### Träffbildens kvartiler — där datan bär

Över de 8 (horisont × klass)-celler som har dömt underlag ligger träffprocenten med **undre kvartilen 22,5 %**, **median 69 %** och **övre kvartilen 100 %**. Bilden är tvådelad: impulsvågscellerna ligger högt medan basbygge på medellång och mega horisont ligger på noll. Läs kvartilerna som en spridningsbild — underlaget per cell är 2–10 dömda mätningar, vilket är för litet för säkra skattningar.

Klassen **korrigering** har n = 0 i samtliga horisonter, och horisonten **lång** har n = 0 i samtliga klasser — för båda gäller: källan har ännu ingen data för perioden, så cellerna redovisas som streck med n = 0, aldrig som gissade procentsatser.

Vad träffprocenten betyder — och inte betyder: den är ett öppet kvitto på det förflutna, aldrig en garanti om framtiden. Motorn beskriver rytm och läge i fundamentalserier; mätningen gör systemet ärligare, inte kursprognostiskt.

_Källa: data/rapporter/vagvalidering-SENASTE.json (speglar vagvalidering-SENASTE.md, cron api/cron/vagvalidering)._

## 2. Regime-läget

Under kvartalet loggades 1 regimehändelse i portföljsystemets regime-logg, varav 1 regimbyte. Laget som fördes är **magert**.

Senaste mätningens indikatorer (2026-09-03): grön andel 7 %, röd andel 17 % av universumet.

Loggens egen beskrivning: _"Få bolag klarar de strikta kraven — selektionen bär helheten. Netto-vågbredden är osatt (senaste vagscan-event ej läsbart) — beskrivningen vilar enbart på forskningslägets grön-/rödandel."_

Netto-vågbredden är dock **osatt** i källan (senaste vagscan-event ej läsbart) — regimens benämning vilar därmed enbart på grön-/rödandelarna, och det sägs rakt ut.

Regimebegreppet är portföljsystemets sätt att sätta namn på marknadsmiljön — ett lägesbeskrivande verktyg, inte en marknadstimingssignal.

_Källa: data/portfolj-system/regime-logg.json._

## 3. Prediktionsloggen

Källan data/portfolj-system/prediktionslogg-akm3.json finns ännu inte i trädet. Källan har ännu ingen data för perioden — raden lämnas ärligt tom, motorn gissar aldrig.

Varför raden finns ändå: en kvartalsrapport som tiger om en tom källa är mindre ärlig än en som visar hålet. Nästa generation av rapporten fyller sektionen automatiskt när loggen börjar föra data.

_Källa: data/portfolj-system/prediktionslogg-akm3.json._

## 4. Kalibreringsdriften

Kalibreringscronen samlar in data för modellens fasvikter (Φ) utan att ändra dem — grinden är LÅST och **ΔΦ = 0**. Inom kvartalet fördes 1 mätning (senaste 2026-09-04, månad 2026-09).

Underlaget är ännu i uppbyggnadskede: **0 episoder** totalt och 0 domrader sedan clean-start 2026-09-04. Korrelationsparametern ρ̄ ligger på 0,45 med källangivelse _"fallback (för få par: 0)"_ — dvs. en dokumenterad default, inte en skattning. Diskonterat med den ρ̄ bär universumet cirka 2,2 effektiva observationer per dag — dagar räknas aldrig som observationer, bara episoder.

Fasstatus per senaste mätning: 6 faser vantar-grind. Ingen fas har nått handlingsgrindens krav (n_eff ≥ 20 episoder) — därför är samtliga Φ-förslag enbart framtida kandidater, aldrig genomförda ändringar.

Kalibreringen gör modellen mer självkonsistent; den kan inte och skall inte omvandla vågmotorn till en kursprognos.

_Källa: data/portfolj-system/kalibrering-logg.json (speglas i data/rapporter/akm3-kalibrering-SENASTE.md)._

## 5. Kvalitetsvakten

Kvalitetsvakten sveper sajten dagligen (cron 07:00 UTC) och skriver överskrivande rapport. Senaste rapporten är genererad 2026-09-11 — inom kvartalet. Status: **GRÖN** — 0 fel och 4 poster för manuell granskning. Motorvalideringen (100 %-väktaren) redovisar **107 PASS / 0 FAIL / 0 SKIP**.

För den här rapportens källor betyder det: de JSON-loggar kvartalsrapporten bygger på passerar vaktns giltighetskontroll, och motorerna bakom vågvalideringen håller 100 % i sin egen valideringsbild.

_Källa: data/rapporter/kvalitetsrapport-SENASTE.md (verktyg/kvalitetsvakt.mjs)._

## 6. Datamognad — vad nästa kvartalsrapport behöver

Ärligheten är rapportens viktigaste kolumn. Följande luckor noterades vid genereringen:

- prediktionsloggen (data/portfolj-system/prediktionslogg-akm3.json) finns ännu inte — sektion 3 är därför tom
- vågvalideringens historik (historikV1) är tom — antalet körningar per kvartal kan bara räknas när historiken börjar samlas
- kalibreringen har 0 episoder av kravet 20 per fas — fasvikterna förblir frusna tills underlaget växt
- regimens netto-vågbredd är osatt i källan
- minsta dömda underlaget per (horisont × klass)-cell är 2 mätningar — under 20 är varje cellprocent en indikation, inte en skattning

Ingen av luckorna rättas med gissningar — de fylls när källorna själva börjar föra data, och rapporten skrivs om automatiskt då.

_Källa: generatorens egen källstatus vid körningstillfället._

## Sammanfattningen

- Vågvalideringen redovisar 1 rond med domslut i kvartalet; total träffbild 52 % på n=48 dömda mätningar, 20 % osatta.
- Träffprocenternas kvartiler (per horisont och klass, där underlag finns): Q1 22,5 % · median 69 % · Q3 100 % — en tvådelad bild med små n.
- Regime-läget: magert sedan 2026-09-03 (grön andel 7 %, röd 17 %); netto-vågbredden är osatt i källan.
- Prediktionsloggen: finns ännu inte — sektionen lämnas ärligt tom.
- Kalibreringen: 1 mätning i kvartalet, ΔΦ = 0 (grinden låst), 0 episoder av 20 per fas.
- Kvalitetsvakten: GRÖN — 0 fel, 4 manuella; motorvalidering 107/0/0.

_Detta är pedagogisk utbildning, inte investeringsrådgivning (lagen 2007:528). Inga bolagsrekommendationer lämnas._

