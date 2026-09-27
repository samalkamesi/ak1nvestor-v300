# V173 dataset-djup — U10: CELLNEX TELECOM CLN.MC (Spanien/kommunikation, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 206 · **Föregångare:** U1–U9
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U1-BCE-UTOKNING-OMG24 §10:s **EGNA** Spanien-alternativ ("cellerna kräver
källvändning (TTM>0) ELLER P/E-bärande alternativ (Spanien: Cellnex/Redeia? UK: BT?) innan
öppning") — källvändningen SKEDDE (TTM-netto +518 M EUR > 0) och förstanamnet togs. TEF/VOD
förblev P/E-döda; alternativet levde. Kollisionskontroll exakt-match GRÖN (även REE.MC/BT.L —
kvar som dokumenterade koordinater).

## KÄLLDATA (StockAnalysis BME CLN, hämtat 2026-09-25 + kompletterande FY-panel)

BME-primär i EUR. Pris 33,50 EUR; mcap 14,41 mdr på 429,3 M aktier.

**Repliker:** mcap 0,2 % · **netto-M 12,77 % EXAKT** · **PS EXAKT** · **FCF-yield EXAKT
(4,22 = 4,22 %)** · P/E 21,96 källvärde på bolagets JUSTERADE bas (nedskrivningar ur —
GAAP-repliken 27,75 dokumenterad; nedskrivningarna ÄR historiken här, därför djup not).

**Vändningsbrottet FY2025 — rundens kärna:** netto-serien [−855 · −956 · −1 004 · +350] — tre
goodwill-nedskrivningsår på tornportföljen följt av första positiva året, med TTM-momentum +518.
**P/E-bärarkontrollens åtskillnad:** doktrinens TTM-villkor uppfyllt (P/E bär) men seriens
negativa basår gör netto-CAGR odefinierbar ⇒ **resultatCAGR5ar = NULL** med vändningsdokumentation
— fältet återtas när konsekutiv positiv bas finns (Sony/Honda-aritmetiken, ännu en ansökan av
doktrinen som FÄLTVAKT, inte bara leveransvakt). omsCAGR rak +6,94 % (organisk volymtillväxt).

**Tornbolagsmetodnoten:** D/E 3,69 · Altman 1,01 (djup varningszon) · ROIC 3,87 % mot WACC 6,19 %
— siffrorna är affärsmodellen (långa platskontrakt binder kassaflödet som finansierar skuldbygget;
ROIC missvisande för modellen). Redovisas öppet som datafakta med metodnot — Piotroski 6 bredvid.
Bruttomarginal 91,73 % (tjänstestruktur — hyra utan kostnadssida i bruttoledet).

**Övrigt:** prognosTillväxt +31,65 % (vändningens normalisering; spår-PEG 0,69, källans PEG 1,05
kalibreringsnot) · utdelning 0,671 EUR (2,00 %; payout 28,10 % justerad bas / GAAP-replik 55,6 %)
· nyemissioner 2 (kapitalhöjningarna 2020–21) · rappdag Q3 est. slutet oktober → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 271→272 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, åttonde körningen) | GRÖN 272-läget · K2 round-trip · kommunikation P75 26→25,4 (Cellnex under gamla P75), n 24→25 · totalt n 259→260 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 272 bolag · 487 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (CLN.MC), kirurgisk append 271+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 272-läget
- `verktyg/_r206-u10-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U10-CLN-CELLNEX-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 206-rad

## KÖ

1. Redeia REE.MC (BCE-alternativets andranamn — Spanien/energi 1→2?) eller BT.L (UK/kommunikation
   0→1) — dokumenterade koordinater kvar.
2. v172-utkast per rappdag (CNR ~10-20 först; Cellnex Q3 slutet oktober med i kalendern? —
   NEJ, kalendern tog v173-vågens bolag r204 FÖRE U10; Cellnex-rappdag läggs vid nästa
   kalenderberöring eller utkastet bär den direkt).
3. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; vändningen och skuldbygget redovisas öppet (Altman 1,01
som datafakta med metodnot — annars feltolkas tornbolaget som akut hot medan kontrakten binder
kassaflödet); CAGR-nullen är ärlighetsprincipen i praktiken: osatt ≠ noll.
