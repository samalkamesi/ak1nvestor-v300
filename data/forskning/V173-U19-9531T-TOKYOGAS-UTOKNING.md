# V173 dataset-djup — U19: TOKYO GAS 9531.T (Japan/energi, +1 bolag) — Japans fyra enbolagsceller alla öppna

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 215 · **Föregångare:** U1–U18
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo — Japan/energi-cellens **två affärsmodeller**: INPEX
(olje/gas-producent) + Tokyo Gas (reglerad distributör med LNG-terminaler) — cellens kontrast
råvarupriscykel mot nättariff. **P/E-bärarkontroll FÖRE leverans: TTM-netto 138 mdr JPY > 0 —
GRÖN.** Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis TYO 9531, hämtat 2026-09-25 + kompletterande FY-panel)

TYO-primär i JPY; mars-bokslut. Pris 3 345 JPY; mcap 3 108 mdr på 930 M aktier; beta 0,3 (vågens
lugnaste — reglerad profil).

**Repliker med dokumenterade basvister:** **FCF-yield EXAKT (8,14 %)** · mcap 0,1 % · P/E 14,9
källans justerade bas (GAAP-replik 22,5 — gasdistributörens förrådsjusteringar, dokumenterad) ·
källans netto-M-rad 2,4 % annat fönster (fältet bär seriekonsistent replik 4,59 % med not —
Hitachi-mönstret) · källans PS-rad avviker (dokumenterad; PS ingår ej i radens fält).

**Vågens sjunde brottsfria rad:** netto [84 → 91 → 115 → 124] och EPS **stigande varje år** —
rak CAGR oms +7,39 % · netto +13,86 % (energiprisnormalisering + LNG-terminaldiversifiering).

**Reglerade nämetodnoter (Redeia/Cellnex-klassen):** P/B 0,89 under bokfört värde (distributörens
klassiska låga multiplar) · ROIC under WACC speglar avkastningsformeln · Altman 1,7 varningszon =
tung infrastrukturbas · prognosTillväxt +12,88 % (spår-PEG 1,16) · utdelning 82 JPY (2,45 %,
payout-replik 55 % med not) · rappdag Q2 FY2026 est. november → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 280→281 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, sjuttonde körningen) | GRÖN 281-läget · K2 round-trip · totalt n 268→269 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 281 bolag · 505 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (9531.T), kirurgisk append 280+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 281-läget
- `verktyg/_r215-u19-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U19-9531T-TOKYOGAS-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 215-rad

## MILEPÅLE: Japans alla fyra enbolagsceller öppna på 1→2 under vågen

material (Nippon Steel + Shin-Etsu) · halso (Takeda + Daiichi Sankyo) · industri (Komatsu +
Hitachi) · energi (INPEX + Tokyo Gas). Japan 22→26 bolag.

## KÖ

1. Tysklands resterande 1-grenar (energi/kommunikation/fastighet/material) eller spårrotation.
2. Omprövningar: Astellas 4503.T + Kirin 2503.T (TTM-vändningsvillkor dokumenterade).
3. Rappdagarna 10-20→11-04 → v172-kön (9531 Q2 FY2026 est. november med vid kalenderberöring).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; nämetodnoterna är utbildningskärnan ("så läses ett
reglerat distributionsbolag") — annars feltolkas P/B under 1 som köpläge och Altman 1,7 som nöd.
