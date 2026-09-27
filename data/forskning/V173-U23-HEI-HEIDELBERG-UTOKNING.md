# V173 dataset-djup — U23: HEIDELBERG MATERIALS AG HEI.DE (Tyskland/material, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 219 · **Föregångare:** U1–U22
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo — Tyskland/material-cellens **två materialmodeller**:
BASF (BAS.DE, diversifierad processkemi — booms/busts) + Heidelberg Materials (HEI.DE,
grus/cement/byggmaterial — regionala kassflöden). **P/E-bärarkontroll FÖRE leverans:
TTM-netto 1 993 M EUR > 0 — GRÖN.** Kollisionskontroll exakt-match GRÖN.
**MILEPÅLE: Tysklands sista 1-gren öppnad — landets alla elva branschgrenar ≥ 2.**

## KÄLLDATA (StockAnalysis ETR HEI, hämtat 2026-09-25 + TRE kompletterande panelhämtningar)

ETR-primär i EUR. Pris 144,85 EUR (intradag; föregående close 145,45); mcap 25,10 mdr
på 175,4 M aktier.

**Vågens renaste källdata — FCF-serien intern låst:** kapex-dragen FCF = OCG − capex
EXAKT i samtliga fem fönster (2 420−1 300 = 1 120 ✓ · 3 205−1 272 = 1 933 ✓ ·
3 232−1 323 = 1 909 ✓ · 3 255−1 365 = 1 890 ✓ · TTM 3 175−1 476 = 1 699 ✓).
FCF-yield 6,77 % DUBBELT LÅS (källrad + 1/P·FCF) · FCF-marginal 7,82 % EXAKT.

**Nio replikeringslås** (flest i vågen, noll skript-buggar denna rond): P/B 1,27 EXAKT
(totalt-EK-bas) · netto-M 9,17 % EXAKT · fcfY 6,77 % dubbelt · fcfM 7,82 % EXAKT ·
D/E 0,50 · EPS×aktier = netto EXAKT 0,7 % · payout 31,9 % mot källans 31,86 % · PS 1,15 ·
mcap 1,2 %. P/E 12,43 källans justerade bas (E.ON-mönstret) med två repliker dokumenterade:
GAAP 12,59 (1,3 %) och pris/EPS 12,85 (källans rad bär lägre prisbas ≈140,2 — fönstret
noterat). BVPS-raden 105,99 (mot totalt EK/aktie 112,9) = annat fönster, noterad.

**EV-dokumentationen:** källans EV 34,06 mdr låst av dess egen EV/Earnings 17,09
(34,06/1,993 ✓); enkel dekomposition (25,10 + 9,98 − 2,19 = 32,89) avviker +1,17 —
pensions-/leasingjusteringar, noterat; EV/EBIT 11,13 (replik); källans EV/EBITDA-rad 7,55
bär justerad EBITDA-bas (34,06/7,55 = 4,51 mdr mot rapporterad 4,08 — dokumenterad).

**Serieprofilerna — cellens pedagogiska kontrast:** netto [1 597 · 1 929 · 1 782 · 1 941]
— POSITIVT SAMTLIGA FYRA ÅR med FY24-dipp (byggcykeln), mot BASF:s brutna serie
(resultatCAGR NULL). Bruttomarginalkontrasten 64,3 % mot BASF:s 23,6 % dokumenterad i
båda raderna (kemins råvarukostnad mot grus/cements transportskyddade priser). Rak CAGR
oms +0,60 % · netto +6,72 %. **Utdelningens raka trappa** [2,60 · 3,00 · 3,30 · 3,60]
+9,09 %/år med källans "Years of Dividend Growth 5".

**Modellnoter:** ROIC 8,40 % > WACC 7,26 % (värdskapandet positivt) · räntetäckning 10,23 ·
Debt/EBITDA 2,31 · Altman 2,54 (gränszon under 3 — tung balansräkning, datafakta) ·
Piotroski 6 · beta 0,91 · 52v −27,54 % · återköp 1,22 % med fallande aktieantal (YoY
−1,22 %) ⇒ nyemissioner 0 · ROE-raden 11,70 % (replik 10,07 % på bok-EK — snitt-bas
sannolik, noterad) · PEG-fältet NULL (källans 0,78 med oklar tillväxtbas — basblandning
vägras) · prognosTillväxt +4,65 % (källans rev-fwd 3Y, ren bas).

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 284→285 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T · nio lås på första försöket (noll enhetsbuggar — tredje rondens grindskäl tog skruv) |
| llms HELREGEN (diskdrivet, tjugoförsta körningen) | GRÖN 285-läget · K2 round-trip · material-raden n=30 (median P/E 18,7) · totalt n 272→273 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 285 bolag · 513 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Gränssnittsvakt | körs efter push (data-only-leverans; 0-fynd-kravet verifieras mot localhost) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (HEI.DE), kirurgisk append 284+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 285-läget
- `verktyg/_r219-u23-*.mjs` — sond/inlägg/avslut + llms-regen/lackagevakt
- `data/forskning/V173-U23-HEI-HEIDELBERG-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 219-rad

## KÖ

1. Omprövningar: Astellas 4503.T + Kirin 2503.T (TTM-vändningsvillkor dokumenterade) —
   Japan-cellernas eventuell tredje bolag eller nytt land nästa vågval.
2. Rappdagarna 10-20→11-04 → v172-kön (HEI nästa rapport 2027-02-25, utanför fönstret).
3. Tyskland komplett (alla grenar ≥2) — celltätheten växer via andra länder (Spanien/
   Storbritannien/Kanada har öppna 1-grenar) eller spårrotation enligt evighetskatalogen.

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; marginalkontrasten och serieprofilerna
dokumenteras som data (annars feltolkas FY24-dippen och 52-veckorsfallet som signal utan
kontext); Altman-gränszonen och EV-justeringen är ärlighetsprincipen. Analytikermål/
rekommendationer (Buy/211,70) syndikeras aldrig — endast internt protokoll, ej datasetet.
