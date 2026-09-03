# VÅGFUNDAMENT — Fundamentalvågornas Ekosystem (INTERN SPEC — sekretessmarkering)

> **SEKRETESS:** Detta dokument + motorn är intern know-how. Kurser förklarar
> KONSEPTET pedagogiskt; exakta trösklar/algoritmer stannar i repot.
>
> Vision (användaren): "indikatorer förblir inte längre statiska — vi förstår
> deras framtida rörelser." Per aktie först → portföljen sedan. Deterministiskt,
> hierarkiskt, fullständigt standardiserat. AI ska alltid enkelt kunna utföra
> analysen enligt ekosystemet.

## 0. Kärnidén
AKM1-variabeln är inte ett TAL — den är en TIDSSERIE. "V09 ROE = 20%" är
meningslöst utan bana. VÅGFUNDAMENT beräknar för varje (aktie, variabel,
horisont) en deterministisk VÅGKLASS — fundamentalens egen våg — och sätter
den mot prisvågen (AK1TS). Resultat: **20×5 fundamentalvågsmatrisen** per
aktie, aggregerad till portföljens genomsnittsläge.

## 1. PRINCIPERNA (hierarkiska, deterministiska, standardiserade)

### P1 — Indikatorer är dynamiska
Varje variabel representeras av {nivå 0–5 (AKM1-poängen, oförändrad),
våg per horisont}. Paret (nivå, våg) är analysens nya atom:
"V09: nivå 4/5 · impulsvåg på kort · basbygge på medellång".

### P2 — Deterministisk klassificering (samma data → samma svar)
Momentum = relativ förändring av variabelns eget värde (t.ex. ROE
18%→20% = +11,1%). Klassificering med pris-motorns EXAKTA gränser för
konsekvent ekosystem:
- impulsvåg: momentum > +6% OCH senaste värde ≥ horisontens medel
- korrigering: momentum < −6% OCH senaste värde ≤ horisontens medel
- basbygge: |momentum| ≤ 6%
- (momentum utan medel-bekräftelse → momentumriktning gäller, dokumenterat)

### P3 — Horisontdefinitioner för fundamentaldata (kvartal/år, inte dagar)
- MIKRO: senaste kvartalet vs föregående kvartal (qoq), jämförelse-medel = 4k-rull
- KORT: senaste kvartal vs samma kvartal i fjol (yoy), medel = 4 kvartal
- MEDELLÅNG: årstakt 3 år (senaste rull-12 vs 3 år sedan), medel = 3års
- LÅNG: 5 år, medel = 5års
- MEGA: hela historiken (≤10 år), medel = hela serien
Saknas data för en horisont → "osatt" (ALDRIG gissa).

### P4 — Hierarkin (under → över)
1. (V, H)-cell → 2. variabel-konfluens över horisonter → 3. kategori-bild
   (7 kategorier) → 4. AKM1-helhet 20×5 → 5. Korsning med AK1TS
   pris-vågmatrisen (25 celler): fundamentalvåg + prisvåg; divergens
   (fundamental impulsvåg + pris korrigering = "värde-signal att studera";
   aldrig köp/sälj) är den viktigaste utdatan.

### P5 — Standardiserad datapipeline
Yahoo fundamentals-timeseries (kvartal+år) via BEFINTLIGT crumb-flöde i
analysis_engine.py. Fältmappning (variabel → yahoo-typer):
- V01: totalRevenue (yoy-tillväxt som serie)
- V07: grossProfit/totalRevenue · V08: ebitda/totalRevenue (om finns; annars operatingIncome)
- V09: netIncome/stockholdersEquity
- V04: priceToSalesTrailing · V05: priceToBook (from quoteSummary) — VÄRDERINGS-serier
  via tidsserie på pris/omsättning (kan härledas ur kombin. — om ej: nuvärde + osatt)
- V10: totalDebt/stockholdersEquity · V11: currentAssets/currentLiabilities (årsdata)
- V12: totalRevenue 8-kvartals volatilitet (ned/upp-antal) → våg via trend
- V19: cashFlowFromOperating − capex (FCF) som serie + shareCount (dilution)
- V20: shareCount som serie (utspädning/återköp riktning)
- V02/V03/V13-V18: nuvärde-baserade (nyckeltal från quoteSummary) → våg = osatt
  tills historik finns — ÄRLIGHET: matrisen visar "osatt", aldrig påhittad.
Enhetlighetsregel: alla serier ses kvartalsvis där tillgängligt, årsvis annars.

### P6 — Portföljsaggregering (först varje aktie, sedan helheten)
Per innehav: 20×5-matris (klass → tal: impulsvåg=+1, korrigering=−1,
basbygge=0, osatt=null). Portfölj = viktfördelat genomsnitt per cell
(utan null). Rapportrader: per kategori (7×5) + total + "var ligger
portföljen i genomsnitt": tex "Tillväxt: impulsvåg på medellång,
Värdering: basbygge på kort".

### P7 — AI-protokollet (alltid enkelt för AI att utföra)
Standard-JSON ut: {ticker, indikatorer: {"V09": {niva: 4, vag:
{mikro:"impulsvåg",...}}}, matris: {"V09": {mikro: 1,...}}, kategorier,
notering}. AI-tolkningsregler (för chatbot/agenter): (1) citera celler
exakt, (2) aldrig extrapolera utanför osatta celler, (3) divergensregeln
enligt P4.5, (4) disclaimers alltid.

### P8 — Ärlighet & sekretess
Konceptet lärs ut öppet (flaggskepps-kurserna); trösklar/algoritmer är
interna. All output pedagogisk — aldrig investeringsråd.

## 2. Byggsteg
1. scripts/vagfundament.py — motor (läser crumb-flödet, P2/P3/P5, P7-JSON)
2. /api/vagfundament (GET ?ticker= / POST {tickers[]} + portföljaggregering)
3. UI: per-aktie 20×5 värmematris (guld/grön/röd) + portföljsvy i /min-portfolj
4. AI-Mentorn lär sig tolka matrisen (P7-protokollet i system-prompt)
