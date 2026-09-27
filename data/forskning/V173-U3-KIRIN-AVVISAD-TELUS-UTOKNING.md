# V173 dataset-djup — U3: KIRIN AVVISAD (engångspostanalys) → TELUS LEVERERAD (Kanada/kommunikation, +1)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 197 · **Föregångare:** U1 Oriental Land (r195), U2 Panasonic (r196)
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"

## DEL 1 — KIRIN 2503.T: ENGÅNGSPOSTANALYSEN ⇒ AVVISAD

**Kandidatur:** S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20 ("Kirin 2503.T (P/E 11,71 men EPS +266 % =
engångspost-risk) — P/E-bärande alternativ, avsändat"). Direktivet: leverera endast om analysen håller.

**Färskdata (StockAnalysis TYO 2503, 2026-09-25 09:56 JST, tre paneler, cache-bypass):**
pris 5 869 JPY · mcap 4,99 T · TTM rev 2 048 mdr (−0,6 %) · TTM netto 345 mdr (+56,1 %) ·
EPS 407,34 · P/E 14,45 · fwd P/E 19,67 · P/B 1,79 · EV/EBIT 12,31 · ROE 13,12 % · ROIC 8,25 % ·
WACC 5,69 % · brutto-M 36,08 % · **EBIT-M 12,56 % · netto-M 16,86 %** · nettoskuld 247 mdr ·
räntetäckning 32,89 · Altman 3,15 · payout 27,25 % · analytiker Buy 12 st.

**Tre oberoende bevis för engångspostuppblåst trailing (alla konfirmerar OMG20:s flagga):**

1. **Netto-marginalen (16,86 %) ligger ÖVER EBIT-marginalen (12,56 %).** Netto > EBIT kan bara
   uppstå genom finansnetto/engångsvinster under EBIT-linjen (värdepappersvärdeökningar,
   avknoppningsvinster) — Kirins historik med Fancl-konsolidering och Myanmar-avyttring är den
   kända kontexten; källpanelerna bryter inte ut posten.
2. **Omsättningen är platt (−0,6 %) medan netto +56 %.** Lönsamhetssprånget är inte
   verksamhetsdrivet — en marginalfördubbling på platt volym är den klassiska
   icke-återkommande signaturen.
3. **Forward P/E 19,67 > trailing 14,45** ⇒ marknadens normaliserade EPS-förväntan ligger
   **27 % under** trailing (14,45/19,67 − 1 = −26,5 %). Konsensus själv prissäger att
   engångsposterna inte upprepas.

**DOM: AVVISAD.** En rad med netto-M 16,9 % och P/E 14,45 skulle systematiskt vilseleda
konsument-cellens medianer/kvartiler med icke-återkommande tal. Isolering av posten kräver
IR-källdokument utanför leverantörens yta — inte denna vågs format. Precedens: OMG20:s egen
avsägelse ("engångspost-risk") + Honda-fallets cellkvalitetsdoktrin.

## DEL 2 — KANDIDATJAKTEN: TVÄRNÖDEN OCH LÄXAN

1. **TMUS-kollisionen:** S2-U3-TELEKOM-TRION-OMG23:s "TMUS — T-Mobile US → ledig" var den enda
   träffen i första sonden — men **föråldrad**: syskonleverans 2026-09-20 hade TMUS på disk
   (StockAnalysis + Yahoo chart-API, dubbelkälla, P/E 17,63). Mitt inläggsskripts
   **duplikatgrind ABORTADE korrekt** ("TMUS finns redan") — systemet fångade det som sondens
   trasiga dubbelkoll missade. **LÄXA (rond 188:s arv): "ledig"-notiser i protokollskörden är
   ögonblicksbilder — diskens faktiska tickers är ALLTID sanningen; exakt matchning, aldrig
   regex-extraherad gissning.**
2. **Sond v2 med exakt ticker-dubbelkoll** genom hela protokollskörden: TEF.MC och VOD.L
   dokumenterat P/E-döda (BCE-OMG24: "TTM-netto −3 570 M EUR/-346,65 M, P/E n/a"); **BCE-OMG24
   §10:s kö-notis: "Kanada/kommunikation 1→2/3: RCU Rogers + TELUS (båda P/E-bärare sannolikt)"**
   — dokumenterad, öppen cell, riktad kandidatur.
3. Sverigecellen sonderades också (62 bolag — alla branscher välfyllda; Sverige/energi tom
   saknar noterade kandidater: Vattenfall är statligt).

**VAL: TELUS** (Kanada/kommunikation — BCE-cellens kö-notiserade andrakoordinat).

## DEL 3 — TELUS LEVERERAD (universum 264→265)

**Kanal:** TSX-primär i CAD (BCE-precedensen — universums andra rena Toronto/CAD-rad).
Färsk rådata 2026-09-25, tre paneler, cache-bypass.

| Tal | Källa | Replik | Not |
|---|---|---|---|
| mcap | 39,70 mdr | 1 462,34 × 27,31 /1000 = 39,94 | 0,6 % ✓ |
| netto-M | 10,02 % | 1 478/14 743 | EXAKT |
| FCF-yield | 1/P/FCF = 4,93 % | 1 969/39 700 = 4,96 % | 0,6 % ✓ |
| P/E | 26,54 | 27,02 | 1,8 % (dokumentklass) |
| CAGR | oms −0,13 % · netto +5,76 % | rak 3-årig FY22→FY25 | **SAMTLIGA FY positiva — vågens första rad utan brottsdokumentation** |

**Ärlighetsposter öppet:** prognosTillväxt +66,2 % (fwd 15,97 mot trailing 26,54 — telekom-D&A-
normalisering; spår-PEG 0,40) · **payout 163,89 % ur källan** (utdelningen över TTM-vinsten —
balansfinansierad utdelning, telekomkonvention; direktavkastning 6,04 %) · **Altman 1,55
(djup varningszon)** redovisas som datafakta (Piotroski 5 bredvid) · FCF-marginal 13,4 % bär
fiber-/tower-transaktioner (metodnot) · räntetäckning 1,82. Raden bär den rättade
Kanada-räkningen 3→4 (skriptets första paranoid skrev 4→5 — egen mätnings kontradiktion,
kirurgiskt rättad före commit; ännu en maskin-före-hand-seger).

## KVD

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 264→265 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T · paranoid-rättning verifierad |
| llms HELREGEN | GRÖN 265-läget · K2 round-trip · kommunikation P75 24,5→26, n 22→23, antal 25 · totalt n 252→253 · 10 aspektrader bevarade |
| Läckagevakt v3 | GRÖN 0 träffar — 265 bolag · 478 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP | körs i avslutskriptet (200-krav) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (TELUS), kirurgisk append 264+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 265-läget
- `verktyg/_r197-v173u3-*.mjs` — sond/kandidatjakt/inlägg/rättning/regen/vakt/avslut
- `data/forskning/V173-U3-KIRIN-AVVISAD-TELUS-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 197-rad

## KÖ

1. **Rogers (RCU)** — BCE §10:s förstakoordinat i samma cell (1→2 klar med TELUS; 2→3 mot matta 5).
2. Kanada/material (NTR/AEM/ABX) och Kanada/industri (CNR/CPKC) — BCE §10:s öppna celler.
3. Rappdagar: 4661.T 10-29 · 6752.T 10-30 · TELUS Q3 est. november (v45) → v172-kön.
4. Kirin 2503.T kan OMPRÖVAS när källan bär normaliserad TTM (fwd-fönstret slagit igenom) —
   villkoret dokumenterat ovan.

## JURIDIKGRINDEN (2007:528)

Avvisandet är i sig juridikskyddande: icke-återkommande vinster som ser ut som lågt P/E är
exakt den typ av tal som kan feltolkas som "billigt" — utbildningsplattformen redovisar öppet
varför talet inte förs in. TELUS-raden bär datafakta med riskflaggorna (Altman, payout över
100 %) synliga; "ej rekommendation"-principen gäller alla analytiker- och måltalsreferenser.
