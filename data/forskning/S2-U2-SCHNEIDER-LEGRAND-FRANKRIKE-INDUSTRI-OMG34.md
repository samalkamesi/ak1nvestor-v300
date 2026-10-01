# S2-U2 — SCHNEIDER SU.PA + LEGRAND LR.PA: FRANKRIKE|INDUSTRI MATTAN 5
**Fabriksagent s2-u2 (byggare 2/3) · manifest auto-s2-1790861711679 · omgång 34 · 2026-10-01**
Universum 328→330 (mina rader; omgångens totala slutläge 334 med syskonen).
Commits: 0fde4472e (universum+sonder, snabb skyddscommit) + slutcommit (protokoll/worklog/llms/läckagevakt).

## 1. Valet (anspråk disk-först, skrivet FÖRE hämtning)
`data/vakten/auto-s2-1790861711679-s2-u2-ansprak.md`. Diskens 328-träd bar SEX
land×bransch-celler på 3/5 (Frankrike|industri, Italien|energi, Italien|finans,
Japan|halso, Kanada|kommunikation, Kanada|material). Frankrike|industri valdes:
epa-källvägen bevisad två omgångar (VIE 09-29, AIR/SAF 09-25) + cellens fyra
arketyper (flygkropp/motor/avfall/+NU effektdistribution). Duplikatkontroll 0
träffar (SU, SU.PA, Schneider, LR, LR.PA, Legrand). Kollisionsytan mot syskon
dokumenterad i anspråket (u1-mönstret pekar mot Endesa/EDF/AAL.L — u3 tog
sedermera Thales+Dassault Aviation+Alstom = samma cell, mattan passerad till 8;
arbetet skildes åt i tid och i commit: mitt 0fde4472e 14:27 före u3:s 518e39c2a).

## 2. Källor — fem ytor × 2, curl-html ordagrant (minnesregeln)
stockanalysis.com /quote/epa/SU/ + /LR/ × (översikt, statistics, financials,
balance-sheet, cash-flow), hämtade 2026-10-01 14:14Z till /tmp/s2u2/ (tio filer,
sammalagt ~1,9 MB). Kanon-extraktor `verktyg/_s2u2o34-kanon.mjs` (v3-mönstret
från NL-dubbeln): 257+256 etikettfält. SEKTORVERIFIERING i råhtml (Keyence-
precedensen): `{t:"Sector",v:"Industrials"}` + Industry "Electrical Equipment &
Parts" för BÅDA — klassningen industri håller. Pris = Previous Close
(SAMPO/Veolia-konventionen, innevarande session pågår): SU 292,00 · LR 141,60 —
båda mcap-replikerna EXAKTA (292,00×562,33 M = 164 199 ≈ 164,20 mdr;
141,60×262,14 M = 37 119 ≈ 37,12 mdr).

## 3. Raderna (fält i bolagsunivers.json, VIE/GLEN-mallen)
**SU.PA Schneider Electric S.E.** — P/E 35,12 (fwd 25,99 ⇒ prognosTillväxt
+35,13 % implicit; källans 3-års intäktsprognos +10,01 %/år som kontrast-not)
· PEG 1,73 · P/B 6,64 = mcap÷EK(TTM) 24 736 EXAKT · EV/EBIT 23,96 (replik
23,99; EV-identitet 164,20+16,29 = 180,49 mot källans 180,76 = 0,15 % minoritets-
/pensionsjusteringar) · brutto 42,12 % (17 707÷42 042 EXAKT) med moat-FÄLTEN
FYLLDA (serie FY21–25 40,97/40,60/41,81/42,64/42,08 ⇒ medel 41,62 %, spread
2,04 pp — BASF-klassen: stabiliteten ÄR moatet) · EBIT 17,92 · netto 11,27 EXAKT
· FCF 14,72 EXAKT (6 187÷42 042) · fcfYield 3,77 % EXAKT · ROE 18,62 · ROIC
13,96 mot WACC 9,61 ⇒ +4,35 pp (duons bredaste avkastningsluft) · skuld/EK 0,84
EXAKT (20 809÷24 736) · räntetäckning 13,31 · beta 1,15 · Altman-Z 3,55 ·
Piotroski 5 · segment EM 34 879 + IA 7 163 = 42 042 EXAKT · serier FY21–25
(oms 28 905→40 152, res 3 204→4 163, FCF 3 073→5 059, EK med FY24→FY25-dyk
31 280→24 455 dokumenterat) · utdelningstrappa 2,90→4,20 (+11,5/+8,6/+11,1/+7,7 %)
payout 49,87 % av vinst mot 38,17 % FCF · aktiebas +0,63 % y/y · 159 844
anställda · grundat 1836 · rapp 2026-10-28 · 52-v 220,40–312,30 · analytiker
Buy 329,93 (23 st — värderingsnot, ej rekommendation).

**LR.PA Legrand S.A.** — P/E 28,51 (fwd 22,13 ⇒ +28,83 % implicit; källans EPS
3-års +13,67 %/år + CMD 29/9:s höjda 2030-mål 11–13 %/år som kontrast-noter) ·
PEG 1,70 · P/B 4,93 = mcap÷EK(TTM) 7 532 EXAKT · EV/EBIT 22,54 (replik 22,53;
EV-identitet 0,1 %) · brutto 50,19 % (DUONS HÖGSTA; serie 49,72–52,26 ⇒ moat
medel 51,02 % spread 2,54 pp) · EBIT 18,84 · netto 13,01 EXAKT · FCF 13,25
(avrundningsklass: räknat 13,26) · fcfYield 3,61 % EXAKT · ROE 18,21 · ROIC
10,99 mot WACC 8,34 ⇒ +2,65 pp · skuld/EK 1,03 (goodwill 25,1 mdr — förvärvs-
bärande balans dokumenterad) · räntetäckning 10,14 · beta 0,99 · Altman-Z 3,29 ·
Piotroski 4 · aktiebas +1,71 % y/y (utvidgande — not) · serier FY21–25 (oms
6 994,2→9 480,6, res 904,5→1 244,6, FCF 972,8→1 356, EK 5 720→7 334) ·
utdelningstrappa 1,65→2,38 EUR med 5 raka tillväxtår (källans Years of Dividend
Growth = 5), payout 47,92 % mot FCF-payout 46,58 % (båda under hälften — trappan
bär FCF; common dividends betald TTM 622,5 M€ mot replik 623,9 = 0,2 %) ·
40 931 anställda · grundat 1865 · rapp 2026-11-05 · 52-v 121,95–166,95 ·
analytiker Buy 168,06 (18 st).

## 4. Aritmetikgrinden — 34/34 GRÖN med ABORT FÖRE skrivning
`verktyg/_s2u2o34-append.mjs` (Glencore-mönstret): 18 kontroller SU + 18 LR +
seriens hälsokontroller. **Första körningen RÖD med FEM egenfel, alla bokförda:**
(a) enhetsbuggen mdr/M på fyra EV-kontroller (EV 180,76 mdr ÷ EBIT 7 533 M€
glömde ×1 000 — grunden loggade 0,024 mot 23,96); (b) SU-omsCAGR-fältet
förberäknat 0,0857 mot grunden 0,0856 — grunden FÅNGADE huvudräkningsfelet
(Glencore-mönstret: "grunden fångade det egna förberäkningsfelet"). Rättning →
GRÖN 34/34 → skrivning → läs-tillbaka ×2 bitidentisk → git hash-object
beb00686. Idempotensguard + SKIP-logik för racedisciplin.

## 5. Medianer + kvartiler + universumjämförelse (EGEN replik, lasBranschMedianer-EXAKT)
FÖRE (328 rader): industri n=31 P/E median 28,17 · P25 20,34 · P75 34,84 ·
EBIT 13,6 · FCF 11,3 · totalt P/E 19,43 (n=315).
EFTER MIN APPEND (330): industri n=33 P/E median 28,25 · P25 20,88 · **P75 35,12
= SCHNEIDERS EGNA VÄRDE SOM NY ÖVERKVARTIL** · EBIT 13,9 · FCF 11,6 · totalt
P/E 19,68 (n=317) · P/B 2,39→2,41.
**Frankrike|industri-matta 3→5 — TRÖSKELN NÅDD** (MIN_MATTA=5): aspektsidan
/dataset/industri/frankrike föds datadrivet vid nästa gröna bygge (u3 passerade
sedermera till 8 — sidan föds ännu bredare). Cellens fyra arketyper: Airbus
(volymcykel) · Safran (eftermarknad) · Veolia (koncession) · Schneider+Legrand
(strukturell elektrifiering: brutto 42/50 % på P/E 35/29).

## 6. KVD
- **Läckagevakt v98** `verktyg/_s2u2o34-lackagevakt.mjs` (v3-mönstret):
  GRÖN — **0 träffar**, 253 dataset-utdatafiler (ALLA dataset-sidor: 3 rotvyer
  + 11 branscher + aspekter, tre språkgrupper — PATH-matchning `\/dataset(\/|\.html$)`,
  inte filnamn: v3:s filnamnsfilter såg bara 3 av 253) + llms.txt
  Dataset-sektionen, 331 namn + 267 tickers (dedup 598 sökningar). MÄTFEL-KLASSEN
  ärligt bokförd: min första breddning till ALLA html gav 12 888 träffar — ALLA
  på /analyser/* (AKM2-analyserna bär bolagsnamn LAGLIGT per kontraktet §1;
  mätaren överflaggade, inte leveransen läckte) — kurerad till dataset-skärpan.
- **Kontraktstest** `verktyg/testa-dataset-aspekter.mjs`: GRÖNT — 190
  sidkontroller, 0 FEL, 30 kända varningar, 60 null (gränsregeln).
- **tsc**: src/ orörd av denna leverans (inga kodändringar) — pre-commit-grinden
  (typnollen) passerade mekaniskt vid båda commits; INGET bygge (Vonovia-
  precedensen — byggen ägs av prod-synken/kraschvakten).
- **prod 200 ×5 ×2**: /, /dataset, /dataset/industri, /llms.txt,
  /api/data/nyckeltalsguide — 200 på BÅDE localhost:3000 och
  https://lab.ak1nvestor.com (2026-10-01 ~14:4xZ).
- **llms.txt** `verktyg/_nyttovalt-llms-regen.mjs` HELREGEN: Dataset-sektionen
  ombyggd på diskens aktuella läge (333/334-vågen under omgångens pågående
  syskonskrivningar; helregen är idempotent — sista körningen bär sanningen),
  industri-raden LIVE på serverad /llms.txt ("36 bolag · P25–P75 21,7–34,5 ·
  rådata 2026-10-01", verifierad mot localhost). Mellanfyndet 311-återgången
  förklarad av u3:s trädåterställning (kraschvaktsklassen — deras commit
  518e39c2a dokumenterar); ingen åtgärd krävd utom omkörning.
- **R2 orörd** · **data/blogg/ orörd** (inga utkast i denna leverans) ·
  **syskonfiler orörda** (u1/u3:s verktyg lämnade; deras universumrader deras).

## 7. Juridik
Dataset-ytorna bär enbart aggregat (medianer/kvartiler/n) av publika nyckeltal —
A2-DATASET-KONTRAKT §1 (poänglagen). llms-raderna dokumenterar pedagogisk
referens, inte råd. Analytiker- och kurstal förs enbart som källnoter i
källfältet (paranoid), aldrig som rekommendation.

## 8. Könotiser vidarebefordras
- Italien|finans och Italien|energi står kvar på 3/5 (mogna för +2).
- Japan|halso 3/5, Kanada|kommunikation 3/5, Kanada|material 3/5.
- Frankrike|industri 8/8 — cellen MATTAD; nästa franska celler: Frankrike|halso
  (2), Frankrike|energi (3: TTE/ENGI/+1? — TTE är energigrenen; kontrollera
  diskens fält innan val).
