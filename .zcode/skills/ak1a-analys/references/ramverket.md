# AK1A-ramverket — 5 × 5 × 4 i detalj

## Formalism

Låt T = {EW, FIB, GANN, LUC, VOL} (Kort-nivån: LUC ersätts av Intermarket) och H = {Mikro, Kort, Medellång, Lång, Mega}. Varje par (t, h) genererar en signal s(t,h) ∈ {−1…+1} med styrka w(t,h) ∈ [0,1] baserad på konfluens och datakvalitet. Horisontsignalen:

  SAM(h) = Σ w(t,h)·s(t,h) / Σ w(t,h)

Ingen enskild teori får dominera: maxvikt 25% per teori. Rekommendationen mappar vägt SAM mot scenariomodellens väntevärde och riskmatrisen.

## De fem tidshorisonterna — kalibrera per tillgång

| Horisont | Spann (mikrocap) | Spann (storbolag) | Innehåll |
|---|---|---|---|
| Mikro | intradag–1 mån | intradag–2 v | Närmaste händelser, prisaction, volymregim |
| Kort | 1–3 mån | 2 v–3 mån | Pågående kvartal, emissions-/rättighetsmekanik |
| Medellång | 3–12 mån | 3–12 mån | Rapporter, värdering, första strukturella bevisen |
| Lång | 1–5 år | 1–5 år | Cykelposition, sekulär trend, kapitalstrukturell utspädning |
| Mega | 5–50+ år | 5–50+ år | Industri-CAGR, teknologisk shift, överlevnad |

Skalningslagen σ(T) = σ·√T ger 1σ-intervall (±23% på 1 mån vid σ=90%) — men dokumentera var serien bryter mot den (enzel-dagshopp på många σ motiverar jump-modellering). En mikrocaps "långsikt" rör sig snabbare än en large caps månad: horisonternas nivåer, volymfönster och cykler skalas efter σ och ATR.

## De fem teorierna — instrumentkort

| Teori | Input | Output | Kända felkällor | Vikt-regel |
|---|---|---|---|---|
| Elliott Wave | ZigZag-svängar (definierad %), fraktalstruktur | Vågräkning per horisont + alternativ räkning | Ex-post-anpassning; händelsehopp bryter fraktaliteten | Strukturteori — ökar med horisonten |
| Fibonacci | Definierade svängar + 52v-spann | Retracement-/extensionsnivåer, konfluenszoner | Cirkelresonemang vid nivåtäthet | 20–25% |
| GANN | Square of 9 (√-rotationer), kalendercykler (45/90/180/360 d) | Priskvadrater, tidsfönster | 1×1-vinklar oanvändbara när ATR/pris > ~3% — bara kvadrater/cykler bär | 15% |
| Lucas | Lucastal {11,18,29,47,76,123,199,322} från ankardatum, fönster ±3 d | Datumfönster | ~10 fönster/kvartal × ±3 d täcker ~25% av kalendern — "träffar" är frekventa under nollhypotesen | 10%, aldrig fristående signal |
| Volym | Dags-/månadsvolymer, OBV, klimax, float-förändringar | Distribution/absorption, POC, magnetnivåer | Arbitrageflöden och emissionsmekanik förorenar | Högst på Mikro (30%) — endast observerbara flöden |
| Intermarket (Kort-nivå) | Valuta, räntor, råvaror, konjunkturindikatorer | Makro-vind/stöd | Korrelationen instabil i kriser | Ersätter Lucas på Kort-nivån |

## Deklarerade viktmatriser (justera per instrument, deklarera i Del I)

- **Mikro:** VOL 30 · FIB 25 · EW 20 · GANN 15 · LUC 10
- **Kort/Medellång:** VOL 25 · EW 25 · FIB 25 · GANN 15 · LUC 10
- **Lång/Mega:** EW 30 · VOL 25 · FIB 20 · GANN 15 · LUC 10

Motivering: strukturteorier skalar med horisonten; kalenderteorier gör det inte. Horisontvikter mot total-SAM: Mikro 15 / Kort 20 / Medellång 30 / Lång 20 / Mega 15 (%).

## De fyra dimensionerna — krav per fält

Varje teorisida avslutas med 4D-panelen. Fält som inte kan fyllas med konkreta värden = cellen är inte klar.

- **Våg** — aktuell position i dominerande struktur. Krav: namngiven våg + alternativ räkning vid tvetydighet.
- **Pris** — de 2–4 operativa nivåerna med källa (fib/GANN/MA/sväng). Krav: exakta siffror, aldrig "motstånd ovanför".
- **Tid** — horisontens fönster + närmaste tidsankare. Krav: datum, aldrig "snart".
- **Brytpunkt** — observationen som falsifierar sidans tes + agerandekoppling. Krav: kvantifierad trigger ("veckostängning < X → aktivera defensiv plan"). *Brytpunkterna, inte prognoserna, är det som exekveras.*

Nedvärderingsregel: en teori som missat sin egen nivå två gånger nedvärderas i SAM (bevis från valideringsloggen).

## Konfluensprincipen

Konfluens = flera metodologiskt oberoende metoder pekar på samma nivå. Det höjer inte sannolikheten att nivån håller statistiskt — det höjer sannolikheten att *marknaden agerar där*, vilket är det operativa kriteriet.

Regler:
1. **≥3 metodologiskt oberoende källor** (MA och fib = olika familjer; två fib-nivåer = en källa).
2. **Volymbekräftelse** krävs vid nivån för operativt beslut.
3. **Ranka zoner efter källtäthet** — bara de bästa zonerna (4–5 källor) bär beslut.
4. **Täthetsfällan:** räkna ut medelavståndet mellan beräknade nivåer vs ATR — är avståndet < ~2× ATR är "träffar" statistiskt oundvikliga och zonen degraderas.
5. Zon som passeras utan volymreaktion degraderas ur kartan.

Konfluensmatrisens format: Zon | Metoder som pekar dit | Konfluensgrad | Roll (falsifieringsnivå / jämvikt / motstånd / trendfilter / rekylmål / bull-zon).

## Poängsättning → rekommendation

SAM-poäng per horisont (−1…+1) → vägt med horisontvikterna → konsensusröst med fundamental position och riskpoäng:

| Vägt SAM | Fundamental position | Riskpoäng | Rekommendation |
|---|---|---|---|
| > +0,40 | pris < golv | < 5 | STARKT KÖP |
| +0,25…+0,40 | pris < mål | < 6 | KÖP |
| +0,05…+0,25 | mellan golv och mål | ≥ 6 | FÖRSIKTIGT KÖP |
| −0,05…+0,05 | — | — | BEHÅLL |
| < −0,05 | pris > mål / bruten struktur | ≥ 7 | FÖRSIKTIGT SÄLJ / SÄLJ |

Konsensusvägning i Del X: teknik (vägt SAM) 30% + fundamenta 30% + scenarier/sannolikheter 20% + riskmatris 20%, vardera som röst −1…+1.

Kvalificerare **"(spekulativt)"** adderas när: σ > 60%, mcap < 500 MSEK, dagsomsättning < 5 MSEK och ≥1 binär händelse inom 90 dagar. Den är en storleksinstruktion (Kelly-dämpning), inte en rekommendationssvaghet.

## Tvålager-modellen för händelsedrivna processer

När tillgången är en *händelseprocess med diffusion emellan* (emissioner, fusioner, binära rapporter som dominerar prisbildningen): händelsekalendern är primär process, teknisk struktur sekundär, GBM endast sannolikhetsreferens med öppen felmarginal. Diffusionsbaserade prognoser degraderas; besluten fattas mot händelsekalendern med trigger-matris (om X så Y). Strukturella händelser (fusion/emission som ändrar aktiestock/intäktsbas) delar serien i regim A/B — pre-händelsedata märks historik och modellerna byggs på proformatal.
