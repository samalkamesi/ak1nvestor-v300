# V173 dataset-djup — U13: MUNICH RE MUV2.DE (Tyskland/finans, +1 bolag) — första cellmotiverade valet

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 209 · **Föregångare:** U1–U12
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** med alla dokumenterade listor tomma efter U12 — första CELLMOTIVERADE valet enligt
S2-mönstret: Tyskland/finans-cellens **andra affärsmodell** (Allianz direktförsäkring + Munich Re
återförsäkring = TRYG/AXA-precedensens duostruktur). **P/E-bärarkontroll FÖRE leverans: TTM-netto
5 957 M EUR > 0 — GRÖN.** Kollisionskontroll exakt-match GRÖN — och SAP-förslaget (ronddirektivet)
avlivades av samma grind: SAP.DE står på disk sedan tidigare; Tyskland/teknik bär redan SAP.

## KÄLLDATA (StockAnalysis ETR MUV2, hämtat 2026-09-25 + kompletterande FY-panel)

ETR-primär i EUR. Pris 532,20 EUR; mcap 74,75 mdr på 140,8 M aktier.

**Fem exakta repliker + payout till 0,08 %:** P/E EXAKT (532,20/38,48 = 13,83) · netto-M EXAKT
(8,68 %) · PS EXAKT · FCF-yield EXAKT (11,20 %) · **payout 51,98 mot 51,94 %** — vågens näst
starkaste replikrad efter BT.

**Vågens fjärde brottsfria rad** (efter TELUS/CNR/Redeia): samtliga FY positiva, mjukt stigande —
rak CAGR oms +0,97 % · netto +1,46 %. Dokumenterad som **stabilitetens kärna, inte tillväxt**
(P/E 13,8 på 1,5 %-tillväxt = moget bolag — profilformuleringen skyddar mot feltolkning).

**Försäkringsmetodnoter:** ROIC 2,83 % speglar reservstrukturen (inte kapitalproduktivitet) ·
Altman 2,03 på varningsgränsen = försäkringsbalansens affärsmodell (premier är skuld innan de är
vinst) · bruttoMarginal null (försäkring saknar meningsfull brutto) · rantaTackning null — alla
som datafakta med noter.

**Övrigt:** prognosTillväxt +2,44 % (mogen bransch; spår-PEG 5,66 mot källans PEG 0,94 — olika
baser dokumenterade) · utdelning 20,00 EUR (3,76 %) · rappdag Q3 est. tidigt november → v172.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 274→275 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, elfte körningen) | GRÖN 275-läget · K2 round-trip · totalt n 262→263 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 275 bolag · 493 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (MUV2.DE), kirurgisk append 274+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 275-läget
- `verktyg/_r209-u13-*.mjs` — SAP-sond/MUV2-koll/inlägg/avslut
- `data/forskning/V173-U13-MUV2-MUNICHRE-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 209-rad

## KÖ

1. Fler cellmotiverade duon: Tyskland/industri (Siemens + DHL-logistik — annan modell), Tyskland/
   halso (Fresenius + Siemens Healthineers), Japans fyra enbolagsceller.
2. Rappdagarna 10-20→11-04 → v172-kön (Munich Re Q3 tidigt november med vid kalenderberöring).
3. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; försäkringsmetodnoterna är utbildningskärnan ("så läses
ett försäkringsbolags balans") — annars feltolkas reservbalansen som skuldproblem eller låg
kapitalproduktivitet.
