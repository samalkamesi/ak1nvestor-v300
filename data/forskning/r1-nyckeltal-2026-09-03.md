# R1 · Nyckeltalsforskning — Vad saknar AKM1? En systematisk genomgång av faktorlitteraturen för att maximera kontrollen vid undervärderingsanalys

**Forskningsområde:** Fråga 1 i PROTOKOLL.md — "Finns det fler nyckeltal som maximerar kontrollen vid undervärderingsanalys? Vad är den mest optimerade helhetsanalysen av ett bolag + aktie?"
**Forskare:** R1 (nyckeltal & faktorevidens) · **Datum:** 2026-09-03
**Status:** Pedagogisk forskning för AK1A Research Lab. Inget i detta dokument är investeringsråd — allt är utbildningsmaterial om hur akademisk och praktisk faktorforskning kan berika en fundamental analysmodell.

---

## 0. Sammanfattning (TL;DR)

AKM1 är stark på **tillväxt (V01–V03), moat (V13–V15) och lönsamhetens nivåer (V07–V09)** men har fyra strukturella blindspots som den akademiska litteraturen visar är bland de mest värdeladdade områdena:

1. **Ingen kassaflödesdimension.** V19 använder kassaflödet enbart för kassatäckning. Varken accruals-kvalitet (Sloan 1996), FCF-konversion eller kassaflödesbaserad värdering (P/FCF) finns. Detta är det största hålet.
2. **ROE utan ROIC.** V09 ROE belönar hävstång (DuPont: ROE = marginal × kapitalomsättning × hävstång). Greenblatts ROIC är kapitalstrukturneutral och mäter om bolaget överhuvudtaget skapar värde (ROIC > WACC).
3. **Ingen samlad skuldbetjänings- eller konkursriskmodell.** V10/V11 mäter stock-nivåer av skuld och likviditet, men aldrig *intjäningsförmågan relativt skulden* (räntetäckning, nettoskuld/EBITDA, Altman Z).
4. **Ingen redovisningskvalitet och ingen utspädningskontroll.** Beneish M-Score saknas helt; SBC och aktieantals-CAGR (Pontiff–Woodgate-anomalin) saknas helt — den moderna utspädningsfällan för svenska SaaS-bolag.

**Slutsats:** 8 nya kärnvariabler föreslås (V21–V28) + 1 villkorad (V29), samt en strukturändring av V04 (P/S → EV/EBIT). De fem tyngsta, med starkast evidens och lägst dubbelräkningsrisk: **V21 ROIC, V22 Fri kassaflödesavkastning, V23 Redovisningskvalitet (accruals + M-kontroll), V25 Utspädning (aktieantals-CAGR + SBC), V24 Skuldbetjäningsförmåga.**

---

## 1. Metod och avgränsningar

**Metod:** Systematisk genomgång av 15 forskningsspår (angivna i uppdraget) mot kanonisk faktor-litteratur. För varje kandidat-nyckeltal bedöms (a) vad det mäter + formel, (b) evidensstyrka med avkastningspremie och källhänvisning, (c) överlapp med V01–V20 (dubbelräkningsrisk), (d) datatillgänglighet i P1-agentens pipeline (Yahoo Finance quoteSummary + MarketStack EOD, se `scripts/analysis_engine.py`), (e) rekommendationsskala 0–5 där 5 = "måste in i AKM2".

**Avgränsningar:**
- Rapporten föreslår nya variabler och modifieringar men rör ingen kod — systembygge sker i fas R2.
- Svenska bokföringskonventioner används i formelformuleringar (resultaträkning/balansräkning/kassaflödesanalys) för att matcha plattformens kanoniska datakällor (årsredovisningen).
- Evidensgrader: **Hög** = replikerad i flera länder/perioder eller kanonisk anomali; **Medelhög** = starkt originalbevis men decayerat eller omtvistat; **Medel** = praktiker-evidens + stödjande akademisk litteratur; **Låg** = svagt eller motstridigt bevis.

**Viktigt metodval:** Piotroski-, Altman-, Beneish- och Greenblatt-modellerna importeras inte som färdiga "svarta lådor". AKM1 är en pedagogisk 0–5-modell; varje modell dekomponeras till sina bärande komponenter och endast komponenter som inte redan täcks av V01–V20 blir nya variabler. Detta är dubbelräkningskontrollen som hela kapitel 3–4 bygger på.

---

## 2. Diagnos: AKM1:s strukturella blindspots

Före kandidatgenomgången en kartläggning av vad de 20 kanoniska variablerna *inte* fångar:

| Dimension | AKM1 täcker | AKM1 saknar | Varför det spelar roll |
|---|---|---|---|
| Tillväxt | Omsättningstillväxt (V01), ARR (V02), diversifiering (V03) | **Trender i lönsamhet** (Δmarginal, ΔROA/ΔROIC), vinstrevisioner | Piotroski (2000): just *förändringarna* separerar vinnare från förlorare |
| Värdering | P/S, P/B, EV/EBITDA (V04–V06) | **EV/EBIT**, E/P, **P/FCF**, EV/S för skuldsatta | Gray & Carlisle (2012): EV/EBIT slår P/E och P/B; O'Shaughnessy: P/S svagast ensam |
| Lönsamhet | Bruttomarginal, EBITDA-marginal, ROE (V07–V09) | **ROIC**, GP/TA, kapitalomsättningshastighet | ROE kan köpas med skuld; ROIC och kapitalomsättning avslöjar det (Soliman 2008; Greenblatt 2005) |
| Kassaflöde | CFO enbart som kassatäckning i V19 | **Accruals, FCF, FCF-konversion, FCF-yield** | Sloan (1996): marknaden överprisar accrual-vinster; O'Shaughnessy: P/CF bland de robustaste |
| Stabilitet/Risk | Skuldsättningsgrad, kvick, intäktsstabilitet (V10–V12) | **Räntetäckning, nettoskuld/EBITDA, samlad distress (Altman Z)** | Skuld *stock* utan *flöde* säger inget om betalningsförmåga |
| Kvalitet | — | **Beneish M-Score, redovisningskvalitet** | Manipulerade rapporter är undervärderingsfällan man inte ser i multiplar |
| Kapitalstruktur | Återköp (V20) | **Utspädning: SBC/omsättning, aktieantals-CAGR**, utdelningskontinuitet, insider-ägande | Pontiff & Woodgate (2008): nettoemission är en av de robustaste anomalerna |
| Prismekanism | (AK1TS-vågsystemet, separat spår) | Estimaterevisioner (fundamentalt momentum) | Gleason & Lee (2003): underreaktion på revisioner |

---

## 3. Genomgång spår för spår

### Spår 1 — Piotroski F-Score (2000): de nio signalerna

**(a) Vad det mäter + formel.** Nio binära signaler som separerar förbättrande från försämrande fundamenta hos värdeaktier (Piotroski 2000, *Journal of Accounting Research*): ROA > 0; CFO > 0; ΔROA > 0; **accruals** (CFO > ROA); Δbruttomarginal > 0; Δhävstång minskar; Δkvickkvot ökar; ingen nyemission; Δkapitalomsättning (omsättning/TA) > 0. F = 0–9.
Länk: https://www.jstor.org/stable/2672906

**(b) Evidens.** Hög. 1976–1996: köp av värdeaktier (hög B/M) med F = 8–9 och kort av F = 0–1 gav **23 % årlig marknadsjusterad avkastning**; att enbart välja hög-F värdeaktier höjde avkastningen ca **7,5 %/år** över en oscreenad värdeportfölj (Piotroski 2000). Replikerad i Sverige (SSE-uppsats i sökresultatet) och internationellt.

**(c) Overlap mot V01–V20 — signal-för-signal:**

| F-signal | AKM1-motsvarighet | Bedömning |
|---|---|---|
| ROA > 0 | V09 (ROE, ej ROA) | Delvis — ROE förvrängs av hävstång |
| CFO > 0 | V19 (CFO för kassatäckning) | Täckt |
| ΔROA > 0 | **Ingen** | **GAP** (trend) |
| CFO > ROA (accruals) | **Ingen** | **GAP** (Sloan-kärnan, se spår 6) |
| Δbruttomarginal | V07 mäter nivå | **GAP** (trend) |
| Δhävstång | V10 mäter nivå | Delvis |
| Δkvickkvot | V11 mäter nivå | Delvis |
| Ingen nyemission | V19 explicit (nyemissionsrisk) | Täckt |
| Δomsättningshastighet (omsättning/TA) | **Ingen** | **GAP** (Soliman 2008) |

**(d) Data.** Allt beräknas ur två års resultaträkning, balansräkning och kassaflödesanalys — Yahoo-modulerna `incomeStatementHistory`, `balanceSheetHistory`, `cashflowStatementHistory` (4 år) räcker; `financialData` ger ROE/marginaler direkt.

**(e) Rekommendation: 4/5** — men inte som färdig F-Score. Tre gap blir nya variabler/komponenter: accruals → **V23**, Δ-trender + estimaterevisioner → **V26**, ΔROA/Δomsättningshastighet → del i **V21** (ROIC-trend) och **V26**. Att importera F-Score hel skulle dubbelräkna mot V07, V10, V11, V19.

---

### Spår 2 — Altman Z-Score (1968): samlad konkurssrisk

**(a) Vad det mäter + formel.** Multivariat diskriminantanalys av konkursrisk (Altman 1968, *Journal of Finance*):
`Z = 1,2·(Arbetskapital/TA) + 1,4·(Balanserat resultat/TA) + 3,3·(EBIT/TA) + 0,6·(Börsvärde/Räntebärande skuld) + 1,0·(Försäljning/TA)`
Z < 1,81 = distresszon; 1,81–2,99 = gråzon; > 2,99 = säker. För icke-börsbolag/robusthet mot börsvolatilitet: **Z'' = 6,56·X1 + 3,26·X2 + 6,72·X3 + 1,05·X5** med gränserna 1,1/2,6.
Länkar: https://www.jstor.org/stable/2978933 · https://en.wikipedia.org/wiki/Altman_Z-score

**(b) Evidens.** Hög (för konkursprediktion). Originalstudien: **95 % klassificeringsträff ett år före konkurs, 72 % två år före** (översikt: https://www.aimspress.com/article/doi/10.3934/NAR.2021012). Grice & Dugan (2001) bekräftar generaliserbarhet med lägre träffsäkerhet utanför tillverkningsindustrin: https://www.sciencedirect.com/science/article/abs/pii/S0148296300001260. Obs: Z predicerar *distress*, inte *avkastning* direkt — värdet för AKM2 är som **veto/riskvariabel** som skyddar undervärderingsfällor ("value trap" = låg multipel + hög distress).

**(c) Overlap.** V10 (skuldsättningsgrad) och V11 (likviditet) ingår som komponenter (X1), men **ingen befintlig variabel fångar den sammanvägda intjäningsförmågan (X3), kapitalbasen (X2) eller avkastningen per skuldkrona (X4)**. V06 ger EBITDA för egen del. Dubbelräkningsrisken är hanterbar om V10/V11 behåller stock-perspektivet och Z får flödesperspektivet.

**(d) Data.** Arbetskapital, RR, EBIT, försäljning ur Yahoo `balanceSheetHistory`/`incomeStatementHistory`; börsvärde × skuld ur `financialData`/`defaultKeyStatistics`. Fullt automatiserbar.

**(e) Rekommendation: 4/5** → ny variabel **V27 "Samlad finansiell hälsa (Altman Z'')"** i kategori Stabilitet/Risk.

---

### Spår 3 — Beneish M-Score (1999): earnings-manipulationsdetektor

**(a) Vad det mäter + formel.** Probit-baserad sannolikhetsmodell för redovisningsmanipulation (Beneish 1999, *Financial Analysts Journal*):
`M = −4,84 + 0,92·DSRI + 0,528·GMI + 0,404·AQI + 0,892·SGI + 0,115·DEPI − 0,172·SGAI + 4,679·TATA − 0,327·LVGI`
där DSRI = (Kundfordringar/Försäljning) indexeras år-t/t-1; GMI = bruttomarginal t-1/t (sjunkande marginal flaggas); AQI = ökad andel icke-materiella tillgångar; SGI = försäljningstillväxt; DEPI = saktande avskrivningstakt; SGAI = stigande SG&A/omsättning; LVGI = ökad skuldsättningsgrad; TATA = totala accruals/TA (≈ (NI − CFO)/TA). **M > −1,78 flaggar manipulationsrisk.**
Länk: https://ideas.repec.org/a/taf/ufajxx/v55y1999i5p24-36.html

**(b) Evidens.** Hög. Originalmodellen identifierade manipulatörer med hög träffsäkerhet i ett sampl utanför estimineringsperioden. Beneish, Lee & Nichols (2013) visar **ut-of-sample att M-Score-flaggade bolag systematiskt underpresterar** — redovisningsmanipulation är en av de mest robusta *negativa* avkastningsprediktorerna, och arbitrage begränsas av kortrestriktioner.
Länk: https://www.tandfonline.com/doi/pdf/10.2469/faj.v69.n2.1 (FAJ 69:2, 2013).

**(c) Overlap.** Mycket låg — AKM1 saknar helt redovisningskvalitet. GMI överlappar svagt V07:s trend, TATA överlappar Sloans accruals (hanteras genom att båda ingår i samma nya variabel V23, inte två). Detta är den enda kandidaten som fångar **falsk** undervärdering: en låg P/E på manipulerade siffror är ingen undervärdering alls.

**(d) Data.** Alla 8 index kräver två års räkenskaper inklusive kundfordringar, avskrivningar och SG&A — tillgängligt i Yahoo-modulerna (`incomeStatementHistory` har `sellingGeneralAndAdministration`; balansräkningen har kundfordringar), men **8 index är pedagogiskt tungt**. Rekommendation: beräkna full M-Score i P1-pipelinen men exponera **förenklat i UI: TATA + GMI + DSRI som kontroller** + M-Score-flaggan.

**(e) Rekommendation: 4/5** → integreras i **V23 "Redovisningskvalitet"** (tillsammans med Sloan-accruals, se spår 6) — fullständigt M-Score som "röd flagg" som sätter tak på poängen, inte som egen variabel.

---

### Spår 4 — Greenblatt Magic Formula (2005): ROIC + earnings yield

**(a) Vad det mäter + formel.** Rangordning på två led: **ROIC = EBIT / Investerat kapital** (investerat kapital ≈ eget kapital + räntebärande skuld − kassa) och **Earnings yield = EBIT / EV** (Greenblatt, *The Little Book That Beats the Market*, 2005).
Länkar: https://en.wikipedia.org/wiki/Magic_formula_investing · https://www.quant-investing.com/blog/magic-formula-complete-guide

**(b) Evidens.** Medelhög (ursprungligen Hög, decayerat). Greenblatts backtest 1988–2004: **30,8 %/år mot 12,3 % för S&P 500**. Oberoende replikeringar visar stark outperformance före 2008 men avtagande efter (https://reasonabledeviations.com/2020/06/08/greenblatt-magic-formula/). ROIC-komponenten har dock fristående stöd i FF5:s RMW-faktor (Fama & French 2015, spår 5 nedan) och i QMJ (Asness m.fl.).

**(c) Overlap.** AKM1 har **ROE (V09) men inte ROIC** — detta är den kanske tydligaste enskilda bristen i hela modellen. ROE = ROIC-uppsnabbat av hävstång; ett bolag kan ha ROE 15 % skapat av skuld med ROIC 6 % under WACC (värdeförstöring). Earnings yield-ledet (EBIT/EV) överlappar spår 15 och föreslås som ersättare för V04. Dubbelräkning: måttlig mot V09 (behåll båda men förklara skillnaden pedagogiskt — ROE för ägarperspektivet, ROIC för rörelsens värdeskapande).

**(d) Data.** EBIT (`operatingIncome`/`ebit`), skuld, kassa, eget kapital — alla i Yahoo `incomeStatementHistory`/`balanceSheetHistory`/`financialData`. Enkel automatisering.

**(e) Rekommendation: 5/5** för ROIC-delen → ny variabel **V21 "ROIC — avkastning på investerat kapital"** (kategori Lönsamhet). Magic Formula som helhet: inget eget variabel-ID (två-komponentmodell; earnings yield-lådan hamnar i V04-modifieringen).

---

### Spår 5 — Novy-Marx gross profitability (GP/TA)

**(a) Vad det mäter + formel.** **GP/TA = Bruttovinst / Totala tillgångar** — "den andra sidan av value": billiga *och* profitablella bolag (Novy-Marx 2013, *Journal of Financial Economics* 108:1).
Länkar: https://www.sciencedirect.com/science/article/abs/pii/S0304405X13000044 · NBER-wp: https://www.nber.org/papers/w15940

**(b) Evidens.** Hög. GP/TA har **ungefär samma prediktiva kraft som B/M** för tvärsnittsavkastning; papret (3 300+ citeringar) blev kärnan i Fama-French femfaktormodells RMW-faktor (Fama & French 2015, *JFE* 116:1, "A five-factor asset pricing model": https://www.sciencedirect.com/science/article/abs/pii/S0304405X14002323 — där **lönsamhet (RMW) och konservativ investering (CMA) gör HML till stor del redundant**, ett starkt argument för att kvalitet borde väga tyngre än ren värdering).

**(c) Overlap — kritisk analys.** GP/TA = bruttomarginal × kapitalomsättningshastighet. V07 (bruttomarginal, KRITISK) fångar första faktorn fullt ut. **Kapitalomsättningskomponenten är däremot ett GAP** — och Soliman (2008, *The Accounting Review* 83:3) visar att Δ i just kapitalomsättning (ATO) förutsäger avkastning för att marknaden missprisar effektivitetsförbättringar: https://publications.aaahq.org/accounting-review/article/83/3/823/2988/The-Use-of-DuPont-Analysis-by-Market-Participants

**(d) Data.** Trivial: `grossProfit` och `totalAssets` i Yahoo.

**(e) Rekommendation: 3/5** — **inte** som egen variabel (dubbelräknar V07). Kapitalomsättnings-ledet tas istället in som komponent i **V21 (ROIC) och V26 (fundamentala trender)**, där det gör mest unik nytta. GP/TA behålls som pedagogiskt referensmått i kursmaterialet.

---

### Spår 6 — Sloan accruals: vinstkvalitet

**(a) Vad det mäter + formel.** **Accruals = (Nettoresultat − Kassaflöde från löpande verksamhet) / Totala tillgångar.** Höga accruals = vinsten består av bokföringsposter (upplupna intäkter, lageruppbyggnad, avskrivningsantaganden) snarare än kassa. Låga/negativa accruals = hög vinstkvalitet (Sloan 1996, *The Accounting Review* 71:3).
Länkar: https://publications.aaahq.org/accounting-review/article/71/3/289/18989 · https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2598

**(b) Evidens.** Hög — en av de mest citerade anomalierna i redovisningsforskningen (7 800+ citeringar). Lång låg-accrual/kort hög-accrual gav **ca 10,4 %/år storleksjusterat** 1962–1991. Mekanism: accrual-vinster är mindre持久a än kassaflödesvinster men marknaden behandlar dem lika — "functional fixation". Replikerad internationellt, inklusive europeiska marknader.

**(c) Overlap.** Låg. V19 använder CFO men frågar bara "räcker kassan?" — aldrig "stämmer vinsten med kassan?". V08/V09 (EBITDA-marginal, ROE) kan båda blåsas upp av accruals; V23 ger motgiftet. Kopplar dessutom naturligt till Beneish TATA (identisk kärna) — därför läggs Sloan + M-kontroll i samma variabel.

**(d) Data.** `netIncome`, `totalCashFromOperatingActivities`, `totalAssets` — allt i Yahoo-modulerna. Enkel automatisering.

**(e) Rekommendation: 5/5** → kärna i **V23 "Redovisningskvalitet — accruals & manipulationskontroll"** (kategori Risk/Kvalitet).

---

### Spår 7 — FCF-konversion + P/FCF + EV/FCF: kassaflödesvärdering

**(a) Vad det mäter + formler.**
- **FCF = CFO − CapEx** (kassaflöde från löpande verksamhet minus investeringar i anläggningstillgångar).
- **FCF-konversion = FCF / EBITDA** (eller FCF/nettoresultat) — hur mycket av bokförd vinst som blir ägbar kassa.
- **P/FCF = Börsvärde / FCF** och **EV/FCF** — kassaflödesbaserad värdering.

**(b) Evidens.** Medelhög–Hög. O'Shaughnessy (*What Works on Wall Street*, 4:e uppl. 2011) fann lågt P/CF bland de mest robusta enkel-faktorerna över ~90 år (EV/EBITDA starkast, P/CF bland toppen; **kompositer av multipler slog alla enkla multipar**): https://www.aaii.com/level3/oshaughnessycharacteristics · https://www.validea.com/james-p-oshaughnessy · https://valueandopportunity.com/2012/05/30/book-review-oshaughnessy-what-works-on-wall-street-4th-edition/. Kvalitetsdimensionen (FCF-konversion) stöds av QMJ-faktorns "payout/safety"-komponent: Asness, Frazzini & Pedersen, *Quality Minus Junk* — högkvalitetsaktier (inkl. stark kassaflödesprofil) ger signifikant riskjusterad outperformance i USA + 24 länder: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2312432 (publicerad *Review of Accounting Studies* 2019: https://link.springer.com/article/10.1007/s11142-018-9470-2).

**(c) Overlap.** Låg för värderingssidan (V04–V06 är alla icke-kassaflöde); **AKM1 har inte en enda kassaflödesvärderingsmultipel**. FCF-konversion överlappar delvis V23 (accruals) men mäter annat: accruals = vinstens kvalitet, konversion = vinstens förvandlingbarhet till fri kassa (CapEx-tungt bolag kan ha låga accruals men dålig konversion).

**(d) Data.** `operatingCashflow` och `freeCashflow` finns **direkt** i Yahoo `financialData`; CapEx i `cashflowStatementHistory.capitalExpenditures`. Enklast möjliga automatisering.

**(e) Rekommendation: 5/5** → ny variabel **V22 "Fri kassaflödesavkastning (P/FCF & FCF-konversion)"** (kategori Värdering).

---

### Spår 8 — Rule of 40 + NDR/GRR (SaaS)

**(a) Vad det mäter + formler.** **Rule of 40 = ARR-tillväxt (%) + vinstmarginal (%) ≥ 40** (EBITDA- eller FCF-marginal). NDR (net dollar retention) = intäkt från kundkohort år-t / år-t-1 inklusive expansion; GRR (gross retention) = samma exklusive expansion.
Länkar: https://www.wallstreetprep.com/knowledge/rule-of-40/ · https://chartmogul.com/saas-metrics/cheat-sheet/

**(b) Evidens.** Medel. McKinsey finner att bolag på/över 40 systematiskt får högre värderingsmultiplar: https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/saas-and-the-rule-of-40-keys-to-the-critical-value-creation-metric. Men: Bessemer har reviderat till "Rule of X" där tillväxt vägs tyngre (https://www.bvp.com/atlas/the-rule-of-x), SaaS Capitals empiri visar medianen för publika SaaS-bolag ligger runt 35 (https://www.saas-capital.com/blog-posts/discussion-and-empirical-data-on-the-saas-rule-of-40/), och en Uppsala-uppsats finner att **tillväxt ensam förklarar EV/S bättre än den likaviktade summan** (https://uu.diva-portal.org/smash/get/diva2:2077859/FULLTEXT01.pdf). Regelns additivitet (1 %-enhet tillväxt = 1 %-enhet marginal) saknar teoretisk grund.

**(c) Overlap.** **Hög dubbelräkningsrisk**: Rule of 40 = V02 (ARR-tillväxt) + V08 (EBITDA-marginal) redan i modellen. NDR/GRR är däremot ett verkligt gap (retention är SaaS-moatens puls), men data endast i IR-presentationer — inte i Yahoo/MarketStack.

**(d) Data.** Rule of 40: `revenueGrowth` + FCF-marginal beräknas automatiskt. NDR/GRR: **manuell** (förvaltningsberättelsen/presentationen) — passar V02:s befintliga manuella källa.

**(e) Rekommendation: 2/5** som egen variabel — dubbelräknar V02 + V08. Föreslås i stället som **sammansatt "hälsopoäng" i UI** (pedagogisk övning: låt eleven beräkna Rule of 40 ur sina V02- och V08-poäng) + NDR/GRR som frivillig not under V02 (manuell inmatning).

---

### Spår 9 — SBC & utspädning: den moderna utspädningsfällan

**(a) Vad det mäter + formler.** **Aktieantals-CAGR** (3–5 år, log-linjärt eller enkel CAGR) och **SBC-intensitet = Aktiebaserad ersättning / Omsättning**. Poäng: icke-diluterande kapitalåterföring (återköp som mer än kompenserar SBC) är värdeskapande; ständig netto-utspädning är en dold kostnad som äts av minoritetsägare.
Länkar: Damodaran, "Buybacks: The Bottom Line!" (*Musings on Markets*, okt 2013, om återköp, SBC och netto-utspädning): https://aswathdamodaran.blogspot.com/2013/10/buybacks-bottom-line.html · Damodarans datamängder (skuld, SBC, multis): https://pages.stern.nyu.edu/~adamodar/New_Home_Page/data.html

**(b) Evidens.** Hög. Pontiff & Woodgate (2008, *Journal of Finance* 63:2) dokumenterar **net share issuance-anomalin**: bolag som emitterar aktier underpresterar systematiskt, bolag som minskar aktieantalet överpresterar — en av de robustaste tvärsnittsprediktorerna: https://doi.org/10.1111/j.1540-6261.2008.01337.x. Grullon & Michaely (2002, *JF*) visar att återköp signalerar och substituerar utdelning: https://onlinelibrary.wiley.com/doi/10.1111/1540-6261.00490. SBC-specifikt: Damodaran har visat hur SBC som "icke-kostnad" snedvrider både marginaler och multipar för teknik/SaaS — direkt relevant för AK1A:s svenska SaaS-fokus.

**(c) Overlap.** **V19** fångar *risken* för emission (kassatäckning) men inte den *tysta* löpande utspädningen via SBC (som aldrig syns som emission). **V20** fångar återköp men utan nettobasker mot utspädning. Komplementärt, inte dubbelt — men V25 bör definieras som *netto*-perspektiv (aktieantal, inte bruttoköp) för att inte dubbeltippa med V20.

**(d) Data.** `stockBasedCompensation` finns i Yahoo `cashflowStatementHistory`; aktieantalshistorik via Yahoo time-series (`annualShareIssued`) eller via 3–5 års årsredovisningar (plattformens kanoniska källa). Automatiserbar med reservation för datahål i tidsserien.

**(e) Rekommendation: 5/5** → ny variabel **V25 "Utspädning — aktieantals-CAGR & SBC-tryck"** (kategori Risk/Kapitalstruktur).

---

### Spår 10 — Räntetäckningsgrad + nettoskuld/EBITDA: djupare än V10

**(a) Vad det mäter + formler.** **Räntetäckning = EBIT / Räntekostnad** (hur många gånger rörelsevinsten täcker räntan) och **Nettoskuld/EBITDA = (Räntebärande skuld − Kassa) / EBITDA** (antal "årsvinster" tills skulden är återbetald). Kreditvärderingsindustrins kärnmått (ratingmetodologer hos Moody's/S&P; Damodarans räntetäckningsdata per sektor: https://pages.stern.nyu.edu/~adamodar/New_Home_Page/data.html).

**(b) Evidens.** Medelhög (avkastningssida via QMJ:s "safety"-dimension: Asness m.fl. 2014/2019, länk ovan; konkurssid via Altman-litteraturen, spår 2). Kombinationen låg täckning + hög nettoskuld är den klassiska value-trap-signaturen: billigt på multiplen, därför att skulden äter framtiden.

**(c) Overlap.** V10 (Skulder/EK) säger *hur mycket* skuld, aldrig *om den är betjänbar*. Ett bolag med skuldsättningsgrad 2,0 och räntetäckning 12 är säkert; samma grad med täckning 1,5 är en tidsinställd bomb. V11 (kvick) fångar kortsiktig likviditet men inte strukturell betalningsförmåga. Kompletterar V10/V11 + interagerar med V27 (Altman).

**(d) Data.** `interestExpense` (resultaträkning), `totalDebt`, `totalCash`, EBITDA (`financialData.ebitda` eller `operatingIncome` + D&A) — allt i Yahoo. Enkel automatisering.

**(e) Rekommendation: 4/5** → ny variabel **V24 "Skuldbetjäningsförmåga — räntetäckning & nettoskuld/EBITDA"** (kategori Stabilitet).

---

### Spår 11 — Kapitalcykel: CapEx-intensitet, ROIC-trend, kapitalomsättningshastighet

**(a) Vad det mäter + formler.** **CapEx/omsättning** och dess trend (capital light vs capital heavy); **ΔROIC** (förbättras kapitalproduktiviteten?); **kapitalomsättningshastighet = Omsättning / Totala tillgångar** och ΔATO.

**(b) Evidens.** Hög. Cooper, Gulen & Schill (2008, *Journal of Finance* 63:4): **hög tillgångstillväxt → signifikant lägre framtida avkastning** (low-asset-growth slår high-asset-growth med stor marginal; en av de märkligaste anomalierna — "asset growth effect", ca 1 %/månad i hedgeform): https://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.2008.01370.x. Titman, Wei & Xie (2004, *JFQA* 39:4): kraftigt ökande kapitalinvesteringar förutsäger underprestanda, särskilt med fria kassaflöden och svag styrning: https://www.cambridge.org/core/journals/journal-of-financial-and-quantitative-analysis/article/capital-investments-and-stock-returns/2C5E2AD6BEBB31D61A126FC4AB6FBFA2. Soliman (2008): ΔATO förutsäger avkastning (länk i spår 5). Fama-French CMA-faktorn formaliserar "konservativ investering lönar sig" (länk i spår 5).

**(c) Overlap.** ROIC-nivån hamnar i V21; ΔROIC/ΔATO i V26; tillgångstillväxt-kontrollen (hög asset growth = varning) kan tas som tröskelkommentar under V21/V26. Kapitalomsättningshastigheten som egen variabel vore tredje hjulet — den är en DuPont-komponent som bärs av V21+V26.

**(d) Data.** `capitalExpenditures`, `totalAssets`, omsättning — alla i Yahoo.

**(e) Rekommendation: 3/5** — inget eget variabel-ID; komponenter fördelas på **V21** (ROIC-trend), **V26** (Δ-led) och **V25/V22** (CapEx ingår i FCF). Motivering: kvalitet före kvantitet — evidensen är stark men kanaliseras genom variabler som redan föreslås, annars dubbelräkning.

---

### Spår 12 — Utdelningskontinuitet, payout och FCF-payout

**(a) Vad det mäter + formler.** **Kontinuitet** = antal år utan sänkning/avstående utdelning; **Utdelningspayout = Utdelning / Nettoresultat**; **FCF-payout = Utdelning / FCF** (hållbarhet: FCF-payout > 100 % länge = utdelningen äter bolaget).

**(b) Evidens.** Medelhög. Boudoukh, Michaely, Richardson & Roberts (2007, *Journal of Finance* 62:2): **total payout-yield (utdelning + återköp) förutsäger avkastning bättre än enbart utdelning** — måttet som förenar V20 och V28: https://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.2007.01246.x. Grullon & Michaely (2002): återköpssignal (länk i spår 9). O'Shaughnessy VC2 inkluderar shareholder yield som sjätte faktor (länk i spår 7). Kontinuitet i sig (t.ex. "Dividend Aristocrats") har praktiker-evidens men svagare akademiskt stöd.

**(c) Overlap.** V20 (återköp) är ena halvan av total payout; V22 (FCF) ger hållbarhetskontrollen. Kontinuitetsdimensionen (år utan sänkning) och payout-kvaliteten är de nya delarna. För icke-utdelande tillväxtbolag (många svenska SaaS) måste variabeln kunna premiera återköp/konversion istället för att straffa frånvaro av utdelning.

**(d) Data.** `trailingAnnualDividendYield` (Yahoo summaryDetail), `dividendsPaid` (cashflow), återköp via V20:s källa; kontinuitetshistorik = manuell/årsredovisning (plattformens manuell-poängsättning).

**(e) Rekommendation: 3/5** → ny variabel **V28 "Utdelningskontinuitet & payout-kvalitet"** (kategori Kapitalstruktur), låg vikt, pedagogiskt värde stor för "ägaravkastning"-modulen.

---

### Spår 13 — Insider-ägande & ägarstruktur

**(a) Vad det mäter + formler.** Insider-nettoköp (köp − försäljning, senaste 6–12 mån), insider-ägandets andel (alignment vs entrenchment), founder-ägande. Kopplar V20 som idag noterar insider "som kompletterande observation" utan poäng.

**(b) Evidens.** Medelhög–Hög. Lakonishok & Lee (2001, *Review of Financial Studies* 14:1): **insiderköp förutsäger ca +7 % onormal avkastning 12 månader framåt; insiderförsäljning är däremot inte informativ** (likviditetsdriven): https://academic.oup.com/rfs/article/14/1/79/1587398. Morck, Shleifer & Vishny (1988, *JFE*, management ownership och värdering, icke-linjärt samband — alignment upp till en gräns, därefter entrenchment): https://www.sciencedirect.com/science/article/abs/pii/0304405X88900487

**(c) Overlap.** Låg (V20 berör endast marginalen). Men AK1TS-frågans dubbelräkningsperspektiv: insiderköp korrelerar med momentum/fundamentala förbättringar — därför låg vikt.

**(d) Data — flaskhalsen.** Yahoo `defaultKeyStatistics` (`heldPercentInsiders` m.m.) fungerar för US-listor men är **opålitligt för Stockholmsbörsen (.ST)**; svenska data kräver Finansinspektionens insiderregister (manuell hämtning). P1 kan inte automatisera detta fullt ut idag.

**(e) Rekommendation: 3/5** → **V29 som villkorad variabel** (manuell datakälla, avancerad nivå): "Insidersignaler & ägarstruktur". Prioriteras in i AKM2 endast om manuell inmatning accepteras i flödet; annals AKM3.

---

### Spår 14 — Momentum & estimaterevisioner: kant mot "rent fundamental"?

**(a) Vad det mäter + formler.** **12-1-momentum** = avkastning månad t−12 → t−1 (skip senaste månaden); **estimaterevisioner** = antal analyser som reviderat uppåt minus nedåt senaste 30 dagarna.

**(b) Evidens.** Hög för båda. Jegadeesh & Titman (1993, *Journal of Finance* 48:1): relativstyrka gav **ca 1 %/månad (≈12 %/år)** 1965–1989 — den starkaste enskilda prisbaserade anomalin: https://doi.org/10.1111/j.1540-6261.1993.tb04702.x. Gleason & Lee (2003, *The Accounting Review* 78): marknaden **underreagerar på estimaterevisioner** — upprevideringar följs av positiv drift: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=303980

**(c) Overlap — den viktiga designfrågan.** AKM1 ska dynamiseras med **AK1TS-vågsystemet** (5 teorier × prismönster). Pris-momentum som fundamental variabel vore dubbelräkning mot vågsystemets prismekanik. Däremot är **estimaterevisioner fundamentala** (de handlar om analyikers omtolkning av räkenskaperna) och fyller Piotroski-dukten Δ-gap (spår 1). Estimaterevisionen är "fundamentalt momentum" utan kollision med AK1TS.

**(d) Data.** Momentum: beräknas ur Yahoo chart/MarketStack EOD (P1 har redan `momentum()` i analysis_engine.py). Revisioner: Yahoo `earningsTrend`-modulen (epsRevisions up/down 30 dagar) — automatiserbar.

**(e) Rekommendation: 4/5** för estimaterevisioner (komponent i **V26**); **1/5** för pris-momentum som egen AKM-variabel (AK1TS-domänen — hänskjuts till vågforskaren R2/R3).

---

### Spår 15 — EV/EBIT vs P/E vs P/S vs E/P: vilken multipel ska AKM2 lita på?

**(a) Vad de mäter.** **EV/EBIT = (Börsvärde + Räntebärande skuld − Kassa) / Rörelseresultat** — kapitalstrukturneutral operativ värdering. E/P = inversen av P/E. EV/S = kapitalneutral intäktsvärdering (för pre-vinstandelsbolag). P/S (V04 idag) saknar både vinst- och skuldperspektiv.

**(b) Evidens.** Hög (för EV-familjen). Gray & Carlisle, *Quantitative Value* (2012): av alla testade multiper var **företagsvärdes-multiperna (EBIT/EV, EBITDA/EV) de bästa** — billigaste kvintilen EBITDA/EV avkastade **17,66 %/år mot 7,97 %** för dyraste; P/B och P/E var underlägsna: https://alphaarchitect.com/the-quantitative-value-investing-philosophy/ · https://greenbackd.com/tag/enterprise-value/. Carlisle, *The Acquirer's Multiple* (2017): **EBIT/EV är "den bästa enskilda måttstocken på undervärdering"** för de flesta bolag. O'Shaughnessy (länk i spår 7): inga enkla multipar är stabilt bäst — **kompositer (VC2) är mest robusta**. Loughran & Wellman (via Greenbackd/Alpha Architect ovan) bekräftar EV-multipens försprång. Lakonishok, Shleifer & Vishry (1994, *JF* 49:5, kontrarian-strategins grund) stödjer överlag låga multipar på nyckeltal.

**(c) Overlap.** V04 (P/S), V05 (P/B), V06 (EV/EBITDA) — tre värderingsmultiplar saknar den bästa. P/S är enligt evidensen den **svagaste** när den står ensam (den köper tillväxt utan lönsamhet och ignorerar skuld — därför krävde O'Shaughnessy kombination med cashflow-krav).

**(d) Data.** EV (`enterpriseValue`), EBIT, E/P (`trailingPE` inverterad) — alla i Yahoo.

**(e) Rekommendation: 5/5** som princip → **strukturändring: V04 P/S ersätts av EV/EBIT** ("V04 · EV/EBIT — operativ värdering"), P/S degraderas till komplement endast för bolag utan meningsfull EBIT (tidiga SaaS). V05 P/B behålls men nedvägd (svagast enligt Gray-Carlisle och enligt FF5 där B/M delvis förklaras av RMW+CMA). EV/S används enbart för skuldsatta pre-vinstandelsbolag tillsammans med V24-kontroll.

---

## 4. Dubbelräkningsmatris

Kompakt korsreferens: vilka befintliga V varje kandidat "snuddar vid". ● = nära överlapp (kräver designåtgärd), ○ = svag koppling (interaktion, ej dubbelt), tom = fristående.

| Kandidat ↓ / befintlig V → | V01–V03 Tillväxt | V04–V06 Värdering | V07–V09 Lönsamhet | V10–V12 Stabilitet | V13–V15 Moat | V16–V18 Katalys | V19 Risk | V20 Återköp |
|---|---|---|---|---|---|---|---|---|
| ROIC (V21) | ○ | | ● V09 | ○ V10 | ○ moat→ROIC | | | |
| FCF-avkastning (V22) | | ● V04–V06 | ○ V08 | | | | ○ V19 | |
| Redovisningskvalitet (V23) | | | ● V08–V09 | | | | ○ V19 | |
| Skuldbetjäning (V24) | | ○ V06 | | ● V10–V11 | | | ○ V19 | |
| Utspädning (V25) | | | | | | | ● V19 | ● V20 |
| Fundamentalt momentum (V26) | ● V01–V02 | | ● V07–V09 | | | ○ | | |
| Altman Z'' (V27) | | | ○ | ● V10–V11 | | | ○ V19 | |
| Utdelning/payout (V28) | | | | | | | | ● V20 |
| Insider (V29) | | | | | | | | ● V20 |

Designregler som följer av matrisen: (1) V25 definieras som *netto-utspädning* (aktieantal) så att V20 (brutto-återköp) behåller sin roll utan dubbelpröjsning; (2) V26 mäter *förändring* medan V07–V09 mäter *nivå*; (3) V27 aggregerar men V10/V11 behåller komponentnivån; (4) V22 ersätter ingen befintlig multipel utan tillför kassaflödesplanet.

---

## 5. Syntes — Rankade AKM2-kandidater (V21–V29)

Prioriteringsordning = (evidens × unikhet ÷ dubbelräkningsrisk × datatillgänglighet).

### V21 · ROIC — Avkastning på investerat kapital
- **Kategori:** Lönsamhet · **Viktförslag: 7 %** (ej KRITISK — kräver WACC-jämförelse för full tolkning)
- **Formel:** `ROIC = EBIT × (1 − effektiv skattesats) / (Eget kapital + Räntebärande skuld − Kassa)`. Förenkling för utbildningsnivå 1: EBIT / Investerat kapital. Notera ROIC > WACC = värdeskapande.
- **Poängtrösklar 0–5:** 0: < 0 % (förstör värde) · 1: 0–5 % · 2: 5–10 % · 3: 10–15 % · 4: 15–20 % · 5: > 20 % och/eller 3-årig stigande trend.
- **Evidens:** Greenblatt 2005 (30,8 %/år för MF-kombinationen 1988–2004); Fama-French 2015 RMW; QMJ.
- **Interagerar med:** V09 (gapet ROE−ROIC avslöjar hävstångs-ROE — pedagogisk guldkälla), V07, V13–V15 (moat ⇒ ROIC-hållbarhet), V19.
- **Data:** Yahoo incomeStatement + balanceSheet. Automatiserbar.

### V22 · Fri kassaflödesavkastning — P/FCF & FCF-konversion
- **Kategori:** Värdering · **Viktförslag: 6 %**
- **Formel:** `FCF = CFO − CapEx`; `FCF-avkastning = FCF / Börsvärde` (alternativt EV/FCF för skuldsatta); `Konversion = FCF / EBITDA`.
- **Poängtrösklar 0–5 (på FCF-avkastningen):** 0: FCF < 0 utan trovärdig vändpunkt · 1: 0–2 % · 2: 2–4 % · 3: 4–6 % · 4: 6–8 % · 5: > 8 % med konversion > 50 % och stabil/stigande FCF.
- **Evidens:** O'Shaughnessy (P/CF bland toppen i 90-årstestet); QMJ-payout/safety; sloan-adjacent kvalitet.
- **Interagerar med:** V04–V06 (kassaflödesplanet kompletterar bokföringsplanet), V08 (konversionen), V19, V25 (SBC justeras in i "ägare-FCF" på avancerad nivå).
- **Data:** Yahoo `financialData.freeCashflow/operatingCashflow` + `capitalExpenditures`. Enklast av alla nya.

### V23 · Redovisningskvalitet — accruals & manipulationskontroll
- **Kategori:** Risk/Kvalitet · **Viktförslag: 5 %**
- **Formel:** `Accruals = (Nettoresultat − CFO) / Totala tillgångar`. Kontrollflaggor: **Beneish M-Score > −1,78 ⇒ max 1 p**; förenklade delindex (TATA, GMI, DSRI) visas i UI; Piotroski-signalen CFO > ROA ingår.
- **Poängtrösklar 0–5 (på accruals, lägre = bättre):** 5: < −5 % (kassan slår vinsten) · 4: −5–0 % · 3: 0–5 % · 2: 5–10 % · 1: > 10 % · 0: M-Score-flagg eller extrem accrual-bild + försämrande bruttomarginal samtidigt.
- **Evidens:** Sloan 1996 (≈10,4 %/år hedge); Beneish 1999; Beneish-Lee-Nichols 2013 (flaggade underpresterar).
- **Interagerar med:** V08–V09 (deras kvalitetskontroll), V19, V27.
- **Data:** Yahoo netIncome + CFO + totalAssets; M-Score-delnIndex ur 2-årsmodulerna. Automatiserbar.

### V24 · Skuldbetjäningsförmåga — räntetäckning & nettoskuld/EBITDA
- **Kategori:** Stabilitet · **Viktförslag: 4 %**
- **Formel:** `Räntetäckning = EBIT / Räntekostnad`; `Nettoskuld/EBITDA = (Räntebärande skuld − Kassa) / EBITDA`.
- **Poängtrösklar 0–5 (kombinerad):** 5: nettokassa, eller täckning > 10 · 4: 6–10 · 3: 4–6 och ND/EBITDA < 1,5 · 2: 2–4 och ND/EBITDA 1,5–2,5 · 1: 1,5–2 i täckning · 0: < 1,5 eller ND/EBITDA > 3,5.
- **Evidens:** QMJ-safety; kreditmetodologer; Altman-litteraturen; value-trap-diagnostik.
- **Interagerar med:** V10–V11 (stock vs flöde), V06 (EBITDA-data), V19, V27.
- **Data:** Yahoo interestExpense/totalDebt/totalCash/ebitda. Automatiserbar.

### V25 · Utspädning — aktieantals-CAGR & SBC-tryck
- **Kategori:** Risk/Kapitalstruktur · **Viktförslag: 4 %**
- **Formel:** `Aktieantals-CAGR (3 år)`; `SBC-intensitet = Aktiebaserad ersättning / Omsättning`. Nettoperspektiv: minskande antal aktier = positivt.
- **Poängtrösklar 0–5 (på aktieantals-CAGR):** 5: < 0 % (nettoförminskning) · 4: 0–1 % · 3: 1–2 % · 2: 2–4 % · 1: 4–7 % · 0: > 7 %/år **eller** SBC/omsättning > 20 % (utspädningsmaskin — tak 2 p oavsett CAGR om SBC > 20 %).
- **Evidens:** Pontiff-Woodgate 2008 (net issuance-anomalin); Damodaran (SBC är kostnad; netto-utspädning); Grullon-Michaely 2002.
- **Interagerar med:** V19 (emissionsrisk), V20 (återköp — netto vs brutto), V02 (SaaS-särskilt utsatta), V22.
- **Data:** Yahoo time-series aktieantal + `stockBasedCompensation`; annars årsredovisning. Delvis automatiserbar.

### V26 · Fundamentalt momentum — förbättringstrender & revisioner
- **Kategori:** Tillväxt/Lönsamhet (gräns) · **Viktförslag: 4 %**
- **Formel:** Tre delflaggor: (i) Δbruttomarginal > 0 (årtakt), (ii) ΔROIC/ΔROA > 0, (iii) netto uppejusterade vinstestimat senaste 30 dagarna (Yahoo `earningsTrend`). 0–3 flaggor.
- **Poängtrösklar 0–5:** 5: 3/3 positiva · 4: 2/3 · 3: 1/3 · 2: 0/3 men samtliga stabila (±) · 1: en försämring · 0: ≥ 2 försämringar eller tydliga nerevisioner.
- **Evidens:** Piotroski 2000 (Δ-signalerna); Gleason-Lee 2003 (revisioner); Soliman 2008 (ΔATO); Cooper m.fl. 2008 (investeringsfällan via tillgångstillväxt-kommentar).
- **Interagerar med:** V01–V02, V07–V09 (nivåerna), V16–V18 (katalysatorerna "förklarar" trenderna). Ej kollision med AK1TS (pris) eftersom allt är fundamentalt.
- **Data:** Yahoo financialData (marginaler 2 år), earningsTrend. Automatiserbar.

### V27 · Samlad finansiell hälsa — Altman Z''
- **Kategori:** Stabilitet/Risk · **Viktförslag: 3 %**
- **Formel:** `Z'' = 6,56·(Arbetskapital/TA) + 3,26·(Balanserat resultat/TA) + 6,72·(EBIT/TA) + 1,05·(Försäljning/TA)` (Z''-varianten: robust mot börspris-svängar, samma data som årsredovisningen; original-Z med börsvärde/skuld visas som referens för börsbolag).
- **Poängtrösklar 0–5:** 5: > 2,6 (säker zon) · 4: 2,2–2,6 · 3: 1,8–2,2 · 2: 1,4–1,8 (gråzon) · 1: 1,1–1,4 · 0: < 1,1 (distress — veto-artikel: max totalpoäng 60/100 oavsett övriga).
- **Evidens:** Altman 1968 (95 %/72 % träff); Grice-Dugan 2001; AIMS-översikt 2021.
- **Interagerar med:** V10–V12, V24, V19. Föreslås även som **hard veto** i AKM2:s samlingslogik (value-trap-skydd).
- **Data:** Yahoo balanceSheet + incomeStatement. Automatiserbar.

### V28 · Utdelningskontinuitet & payout-kvalitet
- **Kategori:** Kapitalstruktur · **Viktförslag: 2 %**
- **Formel:** `Kontinuitet = antal på varandra följande år utan sänkning/avstående`; `FCF-payout = Utdelning / FCF`; total payout = (utdelning + återköp) / FCF.
- **Poängtrösklar 0–5:** 5: ≥ 10 års kontinuitet och FCF-payout 40–80 % · 4: ≥ 5 år och payout < 90 % · 3: betalar utdelning, kort historik, payout rimlig · 2: ingen utdelning men stark FCF + återköp (premierar SaaS-tillväxt) · 1: ingen utdelning och svag FCF · 0: nyligen sänkt/avstått utdelning.
- **Evidens:** Boudoukh m.fl. 2007 (total payout-yield); Grullon-Michaely 2002; O'Shaughnessy VC2.
- **Interagerar med:** V20, V22, V19.
- **Data:** Yahoo dividend-yield + dividendsPaid; kontinuitet = manuell/årsredovisning. Halvautomatisk.

### V29 · Insidersignaler & ägarstruktur *(villkorad)*
- **Kategori:** Kapitalstruktur/Risk · **Viktförslag: 0–2 %** (endast om manuell inmatning accepteras)
- **Formel:** `Insider-nettoköp 6 mån` (köpkronor − försäljningskronor, VD/styrelse); `Insiderägande %`; founder kvar ja/nej.
- **Poängtrösklar 0–5:** 5: nettoköp och insiderägande 5–25 % (alignment, Morck m.fl.: över ~25 % växer entrenchment-risken) · 4: nettoköp · 3: neutralt/founder kvar · 2: ingen data · 1: upprepad nettoförsäljning av VD/CFO · 0: massaförsäljning i kombination med M-Score-flagga (V23).
- **Evidens:** Lakonishok-Lee 2001 (köp ≈ +7 %/12 mån; försäljning ej informativ); Morck-Shleifer-Vishny 1988.
- **Interagerar med:** V20, V23.
- **Data:** **Manuell källa** (Finansinspektionens insiderregister för svenska bolag; Yahoo-opålitlig för .ST) — villkoret.

---

## 6. Modifieringar av BEFINTLIGA variabler (inga nya ID)

1. **V04: P/S → EV/EBIT.** Evidens (Gray-Carlisle, Loughran-Wellman, O'Shaughnessy): EV/EBIT är den mest robusta enkel-multipeln; P/S den svagaste ensam. P/S behålls som andrahandsmultipel när EBIT saknas (tidiga SaaS) — pedagogiskt "steg 2".
2. **V05 P/B: nedvägning 6 % → 4 %.** FF5 visar att B/M till stor del förklaras av lönsamhet + investering; P/B behålls för bank/försäkring (där eget kapital är själva rörelsen) — sektornot i kursmaterialet.
3. **V06 EV/EBITDA: behåll 8 %** men komplettera alltid med V24 (skuldbetjäning) — EV-multipeln kan se billig ut just för att EBITDA ignorerar avskrivningar på nyinvesteringar (därav också EV/EBIT-försprånget).
4. **V20: bredda till "Kapitalåterföring & insidersignaler"** — netto-perspektivet flyttas formellt till V25, insider till V29; V20 behåller brutto-återköp + signalvärde.
5. **V19: behåll KRITISK** — men kompletteras av V23 (vinstens överensstämmelse med kassa) och V25 (tyst utspädning). V19 förblir modellens viktigaste svenska SaaS-skydd.

---

## 7. Varför INTE — avvisade/omgrupperade kandidater

| Kandidat | Beslut | Huvudskäl |
|---|---|---|
| Piotroski F-Score som helhet | Avvisad som helhet | 5 av 9 signaler dubbeltäcker V07/V10/V11/V19; komponenterna plockas istället (V23, V26). Helhetsimport förvanskar pedagogiken (0–5-skala) och dubbelräknar. |
| Greenblatt Magic Formula som helhet | Avvisad som helhet | Tvåkomponentsystem; ROIC → V21, EBIT/EV → V04. Original-evidens dessutom decayerad post-2008. |
| Novy-Marx GP/TA som egen variabel | Avvisad | GP/TA = bruttomarginal × kapitalomsättning; bruttomarginal är redan KRITISK (V07). Komponenterna kanaliseras via V21+V26. |
| Rule of 40 som poängvariabel | Avvisad | Ren omformulering av V02 + V08 (dubbelräkning); additiviteten teoretiskt svag (Uppsala-studien: tillväxt ensam förklarar mer av EV/S). Blir UI-övning + NDR/GRR som frivillig not på V02. |
| Pris-momentum (12-1) som fundamental variabel | Avvisad | Domänkollision med AK1TS-vågsystemet (priset är vågornas territorium). Välgrundat delegerat till vågforskningen. |
| Kapitalomsättningshastighet som egen variabel | Avvisad | DuPont-komponent som bärs av V21 (ROIC) och V26 (ΔATO); tredje hjul. |
| Beneish 8-index som egen variabel | Omgrupperad | Tung för utbildningsplattformen; TATA överlappar Sloan-accruals. Båda bor i V23 med M-Score som flagga/tak. |
| EV/S som egen variabel | Avvisad | Specialfall (skuldsatta pre-vinstandelsbolag); hanteras som villkorad not i Värdering när EBIT saknas + V24-kontroll. |
| Ohlson O-score | Avvisad | Altman Z'' vald som samlingsmätare (enklare, mer etablerad i utbildningssammanhang); O-score logit-variant nämns i fördjupningskursen. |

---

## 8. Dataplan för P1 (information till systembyggarna — ingen kod rörd här)

P1-agentens nuvarande `fetch_yahoo_fundament` (modules: `summaryDetail`, `defaultKeyStatistics`, `financialData`) räcker för: V22 (`freeCashflow`), V24 (`totalDebt`, `totalCash`, `ebitda`, `interestExpense` via `incomeStatementHistory`), V26-del (marginaltrend). För full täckning behövs modulerna:

| Ny variabel | Yahoo-modul/fält (primärt) | Manuell kvarvarande del |
|---|---|---|
| V21 ROIC | `incomeStatementHistory` (operatingIncome), `balanceSheetHistory` (equity, debt, cash) | — |
| V22 P/FCF | `financialData.freeCashflow` + `capitalExpenditures` | — |
| V23 Accruals/M | `netIncome`, `totalCashFromOperatingActivities`, `totalAssets`, 2-års balansräkning (kundfordringar), SG&A | — |
| V24 Räntetäckning | `interestExpense`, `totalDebt`, `totalCash`, `ebitda` | — |
| V25 Utspädning | time-series `annualShareIssued` (3–5 år), `stockBasedCompensation` | kontroll mot årsredovisning |
| V26 Trender/revisioner | `financialData`-marginaler, `earningsTrend.epsRevisions` | — |
| V27 Altman Z'' | `balanceSheetHistory` + `incomeStatementHistory` | — |
| V28 Kontinuitet | `dividendsPaid`, dividend-yield | kontinuitetsår (årsredovisning) |
| V29 Insider | (Yahoo opålitlig för .ST) | Finansinspektionens insiderregister |

MarketStack (EOD) behövs ej för de nya fundamentalvariablerna — endast för ev. framtida pris-momentum i AK1TS-sammanhang.

---

## 9. Viktperspektiv (underlag till fråga 2-forskaren)

De nya variablerna bör enligt evidensvikterna (FF5: lönsamhet+investering > value; QMJ: kvalitet robust; Pontiff-Woodgate: issuance robust; Rule-of-40-litteratur: svag) tillsammans utgöra **ca 30–35 %** av AKM2:s totalpoäng, finansierat av:
- Katalysator-kategorin 18 % → 9 % (V16–V18 är de enda variabler med i princip ingen direkt avkastningspremie i litteraturen — de är pedagogiskt värdefulla men evidenssvagast; behålls för helhetsbilden),
- Moat 18 % → 13 % (V13–V15 korrelerar med ROIC-hållbarhet — låt V21 bära en del av bördan),
- V05 P/B 6 % → 4 %.
Slutlig kalibrering (inkl. total summor 100 och ev. nya KRITISK-designationer) bör göras av viktforskaren (fråga 2) medMonte Carlo-bakgrund från R2. Observera protokollets kunddirektiv: AKM2 ska förbli dynamisk (AK1TS-koppling) — därför bör de nya variablerna precis som V01–V20 ges vågklasser (impulsvåg/korrigering/basbygge) per horisont i den kommande vågmatrisen; V26 (trender) är den nativt mest "vågliknande" nya variabeln och V27 den naturliga veto-spärren.

---

## 10. Källförteckning (25 distinkta källor)

**Akademiska originalpapper:**
1. Piotroski, J. (2000), "Value Investing: The Use of Historical Financial Statement Information to Separate Winners from Losers", *Journal of Accounting Studies* — https://www.jstor.org/stable/2672906
2. Altman, E. (1968), "Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy", *Journal of Finance* — https://www.jstor.org/stable/2978933
3. Altman-precision, översikt — https://www.aimspress.com/article/doi/10.3934/NAR.2021012
4. Grice & Dugan (2001), generaliserbarhetstest av Z — https://www.sciencedirect.com/science/article/abs/pii/S0148296300001260
5. Beneish, M. (1999), "The Detection of Earnings Manipulation", *Financial Analysts Journal* — https://ideas.repec.org/a/taf/ufajxx/v55y1999i5p24-36.html
6. Beneish, Lee & Nichols (2013), "Earnings Manipulation and Expected Returns", *FAJ* 69:2 — https://www.tandfonline.com/doi/pdf/10.2469/faj.v69.n2.1
7. Novy-Marx, R. (2013), "The Other Side of Value: The Gross Profitability Premium", *JFE* 108:1 — https://www.sciencedirect.com/science/article/abs/pii/S0304405X13000044 · NBER wp15940 — https://www.nber.org/papers/w15940
8. Sloan, R. (1996), "Do Stock Prices Fully Reflect Information in Accruals and Cash Flows About Future Earnings?", *The Accounting Review* 71:3 — https://publications.aaahq.org/accounting-review/article/71/3/289/18989 · SSRN — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2598
9. Asness, Frazzini & Pedersen, "Quality Minus Junk", SSRN — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2312432 · publ. *Review of Accounting Studies* (2019) — https://link.springer.com/article/10.1007/s11142-018-9470-2
10. Soliman, M. (2008), "The Use of DuPont Analysis by Market Participants", *The Accounting Review* 83:3 — https://publications.aaahq.org/accounting-review/article/83/3/823/2988/The-Use-of-DuPont-Analysis-by-Market-Participants
11. Cooper, Gulen & Schill (2008), "Asset Growth and the Cross-Section of Stock Returns", *Journal of Finance* 63:4 — https://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.2008.01370.x
12. Fama & French (2015), "A five-factor asset pricing model", *JFE* 116:1 — https://www.sciencedirect.com/science/article/abs/pii/S0304405X14002323
13. Titman, Wei & Xie (2004), "Capital Investments and Stock Returns", *JFQA* 39:4 — https://www.cambridge.org/core/journals/journal-of-financial-and-quantitative-analysis/article/capital-investments-and-stock-returns/2C5E2AD6BEBB31D61A126FC4AB6FBFA2
14. Pontiff & Woodgate (2008), "Share Issuance and Cross-Sectional Returns", *Journal of Finance* 63:2 — https://doi.org/10.1111/j.1540-6261.2008.01337.x
15. Jegadeesh & Titman (1993), "Returns to Buying Winners and Selling Losers", *Journal of Finance* 48:1 — https://doi.org/10.1111/j.1540-6261.1993.tb04702.x
16. Lakonishok & Lee (2001), "Are Insider Trades Informative?", *Review of Financial Studies* 14:1 — https://academic.oup.com/rfs/article/14/1/79/1587398
17. Morck, Shleifer & Vishny (1988), "Management Ownership and Market Valuation", *JFE* — https://www.sciencedirect.com/science/article/abs/pii/0304405X88900487
18. Gleason & Lee (2003), "Analyst Forecast Revisions and Market Price Discovery", *The Accounting Review* 78 — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=303980
19. Grullon & Michaely (2002), "Dividends, Share Repurchases, and the Substitution Hypothesis", *Journal of Finance* — https://onlinelibrary.wiley.com/doi/10.1111/1540-6261.00490
20. Boudoukh, Michaely, Richardson & Roberts (2007), "On the Importance of Measuring Payout Yield", *Journal of Finance* 62:2 — https://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.2007.01246.x

**Praktiker-källor:**
21. Greenblatt, J. (2005), *The Little Book That Beats the Market* — genomgång: https://en.wikipedia.org/wiki/Magic_formula_investing · replikeringskritik: https://reasonabledeviations.com/2020/06/08/greenblatt-magic-formula/
22. Gray & Carlisle (2012), *Quantitative Value* — https://alphaarchitect.com/the-quantitative-value-investing-philosophy/ · Greenbackd om EV-multipel: https://greenbackd.com/tag/enterprise-value/
23. O'Shaughnessy, J., *What Works on Wall Street* (4:e uppl. 2011) — AAII-genomgång: https://www.aaii.com/level3/oshaughnessycharacteristics · Validea: https://www.validea.com/james-p-oshaughnessy · recension med decildata: https://valueandopportunity.com/2012/05/30/book-review-oshaughnessy-what-works-on-wall-street-4th-edition/
24. Damodaran, A., "Buybacks: The Bottom Line!" (*Musings on Markets*, 2013) — https://aswathdamodaran.blogspot.com/2013/10/buybacks-bottom-line.html · datamängder: https://pages.stern.nyu.edu/~adamodar/New_Home_Page/data.html
25. McKinsey, "SaaS and the Rule of 40" — https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/saas-and-the-rule-of-40-keys-to-the-critical-value-creation-metric · Bessemer "Rule of X" — https://www.bvp.com/atlas/the-rule-of-x · SaaS Capital-empiri — https://www.saas-capital.com/blog-posts/discussion-and-empirical-data-on-the-saas-rule-of-40/ · Uppsala-uppsats "Rule of what?" — https://uu.diva-portal.org/smash/get/diva2:2077859/FULLTEXT01.pdf

---

## Rekommendation till AKM2

**A. Lägg till 8 nya kärnvariabler (+1 villkorad), i prioritetsordning:**

| Prioritet | ID | Namn | Kategori | Evidenskärna | Viktförslag |
|---|---|---|---|---|---|
| 1 | **V21** | ROIC — Avkastning på investerat kapital | Lönsamhet | Greenblatt/FF5-RMW | 7 % |
| 2 | **V22** | Fri kassaflödesavkastning (P/FCF & konversion) | Värdering | O'Shaughnessy/QMJ | 6 % |
| 3 | **V23** | Redovisningskvalitet — accruals & M-kontroll | Risk | Sloan/Beneish | 5 % |
| 4 | **V25** | Utspädning — aktieantals-CAGR & SBC-tryck | Risk/Kapitalstruktur | Pontiff-Woodgate/Damodaran | 4 % |
| 5 | **V24** | Skuldbetjäningsförmåga — räntetäckning & ND/EBITDA | Stabilitet | QMJ-safety/kreditmetodik | 4 % |
| 6 | **V26** | Fundamentalt momentum — Δ-trender & revisioner | Tillväxt/Lönsamhet | Piotroski Δ/Gleason-Lee/Soliman | 4 % |
| 7 | **V27** | Samlad finansiell hälsa — Altman Z'' (veto vid < 1,1) | Stabilitet/Risk | Altman 1968 | 3 % |
| 8 | **V28** | Utdelningskontinuitet & payout-kvalitet | Kapitalstruktur | Boudoukh m.fl. | 2 % |
| (9) | **V29** | Insidersignaler & ägarstruktur *(villkorad: manuell källa)* | Kapitalstruktur | Lakonishok-Lee/Morck | 0–2 % |

**B. Modifiera befintliga:** V04: P/S → **EV/EBIT** (Gray-Carlisle-preferensen; P/S blir andrahandsmultipel för pre-EBIT-bolag); V05 P/B nedvägs 6→4 % (FF5); V20 breddas till "Kapitalåterföring" med netto-perspektivet i V25.

**C. Avvisa med motivering:** F-Score, Magic Formula, GP/TA, Rule of 40 och pris-momentum som egna variabler (dubbelräkning eller AK1TS-domän — se kapitel 7).

**D. Designprinciper för AKM2:** (1) nivåer (V07–V09) och trender (V26) hålls isär; (2) stock (V10–V11) och flöde (V24, V27) hålls isär; (3) brutto (V20) och netto (V25) hålls isär; (4) V27 fungerar som value-trap-veto; (5) varje ny variabel får vågklass i AK1TS-matrisen (kundens kärbeslut: dynamisk, inte statisk) — V26 är den mest vågnativa, V27 den naturliga spärren.

**E. Data:** 7 av 9 nya variabler är fullt automatiserbara via befintlig Yahoo-pipeline (modultillägg, se kapitel 8); V28 halvautomatisk; V29 manuell. Inga nya dataleverantörer krävs.

— *R1, 2026-09-03. Underlagsdokument för fråga 1; viktfrågan (2) och vågkopplingen (3) har getts underlag men ägs av respektive forskare.*
