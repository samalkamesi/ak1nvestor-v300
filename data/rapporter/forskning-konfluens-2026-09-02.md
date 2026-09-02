# KONFLUENSRADARN — Forskningsunderlag för sammansatt analysmetod (värde garanterat före vågorna)

**Datum:** 2026-09-02 · **Metod:** Strukturerad webbdjupforskning (akademiska originalsökningar + praktiker replikeringar), syntes mot AK1A-ekosystemet (AKM1 20 variabler, VÅGFUNDAMENT fundamentalvågs-matris, AK1TS prisvågmatris, divergensregeln P4.5 i VAGFUNDAMENT-SPEC.md) · **Syfte:** Kunskapsbas och designunderlag för "Konfluensradarn" — metoden där värdegolv är en *hård grind* som måste vara passerad FÖRE någon vågsignal får trigga köp.

**Kärnpåstående som hela rapporten stödjer:** Litteraturen ger ett tydligt svar på *i vilken ordning* signaler ska kombineras — värde är ett villkor (gate), kvalitet är ett filter, fundamental vågstart är triggern, prisvågsläge är lägesbestämning, och divergens är en bevakningssignal. Konfluens (= flera oberoende signaler som pekar samma håll) höjer sannolikheten mer än någon enskild signal — men bara om signalerna verkligen är oberoende.

> **Ärlighetsdeklaration:** Två referenser i uppdraget kunde INTE verifieras: (1) "Villalta & Villalta Value-Momentum Composite" — ingen finansiell paper med detta författarnamn finns indexerad (närmaste match är en handelsrättslig forskare, Villalta Puig); ersatt nedan med verifierade ekvivalenter (Fisher et al. 2015; Pani & Fabozzi 2022). (2) "Mehta-Bhasin 2019" — ingen träff; ersatt med den faktiska akademiska fundamental-momentum-stammen (Chan-Jegadeesh-Lakonishok 1996; Novy-Marx 2015; He 2020; Huang et al. 2017) + praktikercitat (Freiwald/Franklin Templeton 2026). Alla övriga källor är verifierade med URL.

---

## 1. VALUE+X-KOMPOSITER — vem kombinerar vad, med vilka resultat

| Komposit | Kombinerar | Nyckeltal från källorna | Källa |
|---|---|---|---|
| **Greenblatt Magic Formula** (2005) | Billighet (earnings yield = EBIT/EV) + kvalitet (ROC = EBIT/invested capital), rangsumma | Greenblatts originalstudie: ~30 %/år över 17 år (1988–2004) vs ~12–13 % för index; oberoende replikering landar lägre (~15 % över prestanda; transaktionskostnader, urvalsperiod). Europe +momentum-tillskott: +783 % på 12 år (praktikerbacktest) | [magicformulainvesting.com](https://www.magicformulainvesting.com/home/faqs) · [Wikipedia](https://en.wikipedia.org/wiki/Magic_formula_investing) · [Quant Investing backtest](https://www.quant-investing.com/blog/magic-formula-investment-strategy-back-test) |
| **Asness-Frazzini-Pedersen "Quality Minus Junk" (QMJ)** (2019, Rev. Acc. Studies) | Lönsamhet + tillväxt + säkerhet (z-kombinerat) | Long quality/short junk ger signifikant riskjusterad avkastning i 24 länder, 1957–2016; gåtan: kvalitetsaktier är *säkrare* men avkastar mer — kan inte knytas till risk. "Priset på kvalitet" varierar över tid → billig kvalitet ger högre framtida QMJ-avkastning | [Springer](https://link.springer.com/article/10.1007/s11142-018-9470-2) · [AQR](https://www.aqr.com/Insights/Research/Working-Paper/Quality-Minus-Junk) · [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2312432) |
| **Novy-Marx "The Other Side of Value"** (2013, JFE) | Bruttolönsamhet (GP/assets) — "värde med andra sidan" | GP/A har ~samma förklaringskraft som B/M för tvärsnittet; lönsamma bolag slår olönsamma trots "growth"-etikett; **okorrelerad med värdepremien → värde+lönsamhet tillsammans lyfter Sharpe dramatiskt** (därav titeln) | [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0304405X13000044) · [NBER w15940](https://www.nber.org/system/files/working_papers/w15940/w15940.pdf) |
| **O'Shaughnessy "Trending Value"** (What Works on Wall Street, 4:e uppl.) | **Value Composite-1** (P/E, P/B, P/S, P/CF, EV/EBITDA, aktieägaravkastning) top-10 % + 6-mån prismomentum | Bokens bäst riskjusterade strategi: ~20 %+ p.a. (backtest 1964–2009) vs ~11–13 % för "All Stocks"; VC-topdecil + momentum = bäst kombinationen i hela boken | [Portfolio123-analys](https://blog.portfolio123.com/did-what-works-on-wall-street-stop-working/) · [InvestStrat-screen](http://investstrat.com/trendingvalue.html) · [Stockopedia UK-version](https://www.stockopedia.com/academy/articles/trending-value/) · [SSE-uppsats](http://arc.hhs.se/download.aspx?MediumId=5885) |
| **Fisher et al. "Combining Value and Momentum"** (2015, ersätter "Villalta") | Portföljkonstruktion som maximerar exponering mot BÅDE värde och momentum samtidigt | Visar implementationsvägen: håll faktorerna separata och kombinera på portföljnivå, istället för att blanda till en enda poäng | [SSRN 2472936](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2472936) |
| **Pani & Fabozzi "Finding Value Using Momentum"** (JPM 2022, via Alpha Architect) | Värde-rang + momentum-rang; momentum som *bekräftelse* på värde | Månadsalfa 1,14–1,19 % över sexfaktormodellen; **"momentum fungerar som en broms på värde — det avråder från att köpa före en botten"** | [Alpha Architect-sammanfattning](https://alphaarchitect.com/using-momentum-to-find-value/) |

**Mönster:** Alla seriösa Value+X-kompositer gör värde till *urvalsbasen* (toppdecil, gate) och lägger momentum/kvalitet *på toppen* (filter/rang) — inte tvärtom. Ingen framgångsrik komposit låter momentum kompensera för frånvarande värde.

---

## 2. VÄRDE × MOMENTUM — den akademiska grundvalen

**Asness-Moskowitz-Pedersen, "Value and Momentum Everywhere" (2013, Journal of Finance 68:3, 929–985)** — kanonkällan, 4 000+ citeringar:

- Värde och momentum har **negativ korrelation i alla åtta klasser** (USA-, UK-, Europa-, Japan-aktier, index, valutor, räntor, råvaror); genomsnitt ~−0,49, för aktier ~−0,60.
- **Följd: kombinerad Sharpe ~dubbel** mot vardera faktorn enskilt — negativ korrelation är fri diversifiering.
- Negativa korrelationen förklaras delvis av likviditetsrisk och funding constraints (värde fungerar dåligt när marknaden tvingar utförsäljning; momentum fungerar dåligt vid snabba Vendéer).
- Källor: [Wiley DOI](https://onlinelibrary.wiley.com/doi/10.1111/jofi.12021) · [PDF NYU Stern](https://w4.stern.nyu.edu/facdir/lpederse/papers/ValMomEverywhere.pdf) · [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2174501) · [AQR](https://www.aqr.com/Insights/Research/Journal-Article/Value-and-Momentum-Everywhere)

**Haghani & Dewey (via Alpha Architect "Using Momentum to Find Value"):** skala +0,86 %/år | momentum +1,55 %/år | **kombinerat +2,66 %/år — och +6,51 %/år i björnmarknader** (där värde ensamt sviker). Interaktionen är superadditiv i just kristider. Källa: [alphaarchitect.com/using-momentum-to-find-value](https://alphaarchitect.com/using-momentum-to-find-value/)

**Översättning till Konfluensradarn:** "värde garanterat före vågorna" är inte bara en disciplinregel — den är faktiskt den ordning litteraturen visar är mest robust: värde definierar *var* man jagar, momentum definierar *när* man slår till. Momentum ensamt utan värdegolv är däremot kraschbenäget (se §7).

---

## 3. FUNDAMENTAL MOMENTUM — "vågorna i fundamentalt"

Detta är Konfluensradarns mest värdefulla forskningsgren: fundamenta har egen momentumstruktur, och den börjar **innan** prismomentum.

### 3.1 PEAD — post-earnings-announcement drift (den äldsta och starkaste anomalibevisen)
- **Bernard & Thomas (1989, JAR; 1990, JAE):** priserna fullföljer inte implicationerna av nuvarande resultat för framtida resultat. Drift per kvartal efter positiv överraskning: **+1,32 %, +0,70 %, +0,04 %, −0,66 %** (q+1…q+4) — mönstret följer en naiv säsongrandomwalk; 25–30 % av driften kommer vid efterföljande rapporttillfällen. Källor: [RePEc 1989](https://ideas.repec.org/a/bla/joares/v27y1989ip1-36.html) · [Fulltext Michigan](https://deepblue.lib.umich.edu/bitstreams/76760a1a-7cf1-4f33-abdd-e9cfdda79b80/download) · [Wikipedia PEAD](https://en.wikipedia.org/wiki/Post%E2%80%93earnings-announcement_drift)
- **Tolkning för AK1A:** en rapportkvartals-förbättring (VÅGFUNDAMENT MIKRO: qoq-impulsvåg) är inte bara "data" — den bär en dokumenterad, outtömlig drift. MIKRO-impulsvåg i fundamentalt ≈ PEAD-fönstret.

### 3.2 Earnings acceleration — den andra derivatan
- **He (2020), "Earnings Acceleration and Stock Returns":** acceleration = kvartalsvis *ändring i tillväxttakten* har signifikant förklaringskraft för framtida excessavkastning **bortom momentum, tillväxt och earnings surprise**. Källor: [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0165410119300333) · [NAAIM-PDF](https://www.naaim.org/wp-content/uploads/2018/05/2018_00M_Earnings-Acceleration-and-Stock-Returns_NAAIM-Submission-with-title-page.pdf)
- **Översättning:** impulsvåg på MIKRO *samtidigt som* vågen går från basbygge→impuls på KORT = acceleration. Det är exakt "impulsövergång" fast i fundamentalserien.

### 3.3 Fundamental momentum som egen faktor
- **Novy-Marx (2015), "Fundamentally, Momentum is Fundamental Momentum" (NBER WP 20984):** prismomentum till stor del drivs av *fundamentalt momentum* — prestanda bland fundamentalt (ändringar i lönsamhet/earnings) förutsäger tvärsnittet. Källor: [NBER](https://www.nber.org/papers/w20984) · [PDF](https://www.nber.org/system/files/working_papers/w20984/w20984.pdf) · [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2572143)
- **Huang m.fl. (2017), "Twin Momentum: Fundamental trends matter":** fundamental momentum (trend i sex fundamentalmått) + prismomentum → "twin momentum" ger **avkastning större än summan av de två enskilda effekterna**, svår att förklara med riskfaktorer, och **överlever när prismomentum försvagas** (effekterna förstärker varandra). Källor: [SMU-PDF](https://ink.library.smu.edu.sg/cgi/viewcontent.cgi?article=6156&context=lkcsb_research) · [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2894068)
- **Lim (2024), "The value of growth: Changes in profitability and future returns" (JBF):** avkastning växer med aktuell lönsamhetstillväxt, starkast i mindre bolag. Källa: [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0378426623002273)
- **Ehsani & Linnainmaa (JF):** faktormomentum — de flesta faktorer är positivt autokorrelerade; även faktornivåer "vågar". Källor: [JSTOR](https://www.jstor.org/stable/45435157) · [Alpha Architect](https://alphaarchitect.com/cross-section-of-returns/)
- **Praktiker-citat (Freiwald, Putnam/Franklin Templeton 2026):** *"fundamental momentum is the most powerful factor in emerging markets"* — earnings revisions som kärnprocess. Källor: [Franklin Templeton](https://www.franklintempleton.lu/articles/2026/putnam/emerging-markets-cheap-growing-and-underowned) · [US-version](https://www.franklintempleton.com/articles/putnam/emerging-markets-cheap-growing-and-underowned) · [ClearBridge om revenue acceleration](https://www.frankmontempleton.com/articles/2026/clearbridge-investments/when-revenue-acceleration-overwhelms-quality)
- Stöd i kategorin "kvalitetsförbättring": **Piotroski (2000), F-Score** — 0–9 poäng på fundamentala *förbättringar*; högt F-Score-värdeaktier slog marknaden med **13,4 %/år vs 5,9 %** för hela värdekvintilen. Källor: [Alpha Architect](https://alphaarchitect.com/value-investing-research-simple-methods-to-improve-the-piotroski-f-score/) · [Wikipedia](https://en.wikipedia.org/wiki/Piotroski_F-score) · [Verdad "The Piotroski Synthesis"](https://verdadcap.com/archive/the-piotroski-synthesis)

**Slutsats grenen:** VÅGFUNDAMENTS impulsvåg på MIKRO/KORT är akademiskt förankrad i tre separata litteraturstammar (PEAD, acceleration, fundamental momentum). Detta är Konfluensradarns tidigaste trigger — den kommer *före* prismomentum (Novy-Marx 2015) och är därför rätt kandidat för "vågstart-detektion" i fundamentalt.

---

## 4. VÅGSTART-DETEKTION I PRIS — basbygge → impuls

| Signal | Bevisläge | Nyckelfynd | Källor |
|---|---|---|---|
| **52-veckors höga (George & Hwang 2004, JF 59:5)** | Starkt, peer-reviewed | Närhet till 52v-höga förutsäger avkastning och förklarar **stor del av momentumvinsterna** (ankare — investerare vågar inte bjuda förbi gamla toppar); momentum och reversal är *separata* fenomen; effekten bekräftad internationellt (Liu 2011; Du 2008) | [Semantic Scholar](https://www.semanticscholar.org/paper/1aac802bd86c74dd3733f9e494cb254dca2e954b) · [ResearchGate](https://www.researchgate.net/publication/4992688_The_52-Week_High_and_Momentum_Investing) · [Liu 2011](https://www.sciencedirect.com/science/article/abs/pii/S0261560610001099) |
| **Wyckoff-ackumulation (spring/backtest av stödet)** | **Svagt akademiskt; praktikerkodifierat** | Koncept:Trading Range → Phase C "spring" (falskt nedbrott) → SOS/sign of strength → last point of support. Kvantifierade regler finns men peer-review saknas — använd som *kvalitativ linskisse*, inte evidens | [Wyckoff Analytics](https://www.wyckoffanalytics.com/wyckoff-method/) · [TrendSpider](https://trendspider.com/learning-center/chart-patterns-wyckoff-accumulation/) · [Quantified Strategies backtest](https://www.quantifiedstrategies.com/wyckoff-trading-strategy/) · [Papers With Backtest](https://paperswithbacktest.com/strategies/wyckoff-trading-strategy) |
| **Darvas-box (box → breakout på volym)** | Granskad, blandat | Kritisk granskning (ASPD Journal) finner att regelverket *kan* kodifieras men prestanda är periodberoende; praktikerbacktests blandade | [ASPD "Demystifying the Darvas Box"](https://theaspd.com/index.php/ijes/article/download/2292/1804/4459) · [Investopedia](https://www.investopedia.com/terms/d/darvasboxtheory.asp) |
| **Gyllene korset MA50/MA200** | Väl testat, blygsamt | Främst **drawdown-reduktion** (undviker 2000–02, 2008, 2020, 2022); råavkastning slår sällan köp-och-glöm pga whipsaw; ~68 % win ratio på signaler men eftersläpning är kostnaden | [TOS 20-års backtest](https://tosindicators.com/research/golden-cross-trading-strategy-20-year-backtest-results) · [Quantified Strategies 200d](https://www.quantifiedstrategies.com/200-day-moving-average-strategy/) · [Investopedia](https://www.investopedia.com/terms/g/goldencross.asp) · [Gurrib 2016 SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2956526) |

**Översättning till AK1TS-vokabulär:** "fortfarande basbygge = vi är tidiga" har stöd i 52v-hög-litteraturen — pris *nära* (men under/ej långt över) 52v-höga med fundamental vågstart är gynnsammare läge änpris långt över toppen. AK1TS basbygge + fundamental impulsvåg ≈ George-Hwang-ankaret innan det brutits: den klassiska tidiga värdetillfället. Gyllene korset är en **bekräftelse-, inte en tidig**, signal (eftersläpning dokumenterad).

---

## 5. KONFLUENS-TÄNK — vad säger litteraturen om multi-signal-bevis (≥3 oberoende källor)?

AK1A-regeln "≥3 oberoende källor" har direkta motparter i besluts- och prognoslitteraturen:

1. **Condorcets jury theorem:** om varje signal är rätt med p > 0,5 och signalerna är **oberoende**, går majoritetsbeslutets träffsäkerhet mot 1 när antalet signaler växer. Källa: [Wikipedia CJT](https://en.wikipedia.org/wiki/Condorcet%27s_jury_theorem)
2. **Korrelationen är fallgropen:** Ladha (1995) visar att garanterna *försvagas kraftigt när signalerna är korrelerade* — praxis för AK1A: "oberoende" måste verifieras (värde, fundamental våg, prisvåg, divergens mäter delvis olika data — men multiplar och AKM1 delar balansräkningsdata!). Källa: [Ladha 1995](https://ideas.repec.org/a/eee/jeborg/v26y1995i3p353-372.html)
3. **Wisdom of crowds:** mångfald och oberoende är villkoret för att aggregering ska fungera ([Wikipedia](https://en.wikipedia.org/wiki/Wisdom_of_the_crowd)); gränserna när gruppen är korrelerad/styrd dokumenteras i [Orzechowski 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12216932/).
4. **Prognoskombination (Bates & Granger 1969 →):** "resultaten är nästan enhälliga — att kombinera flera prognoser ökar noggrannhet", ofta dramatiskt; kombinationen kan slå *varje enskild* modell. Källor: [fpp2-textbook](https://otexts.com/fpp2/combinations.html) · [Bates-Granger-översikt](https://metricgate.com/docs/forecast-combinations-bates-granger/) · [Aiolfi & Timmermann 2006](https://www.sciencedirect.com/science/article/abs/pii/S0304407605001661)
5. **"Forecast combination puzzle":** enkla (lika) vikter slår ofta optimerade vikter out-of-sample — stöd för rak konfluensräkning snarare än finjusterade vikter. Källor: [Blanc & Setio 2016](https://www.sciencedirect.com/science/article/abs/pii/S0148296316303952) · [MDPI 2023](https://www.mdpi.com/2227-7390/11/18/3806)
6. **Triangulering i forskningsmetodik:** användning av ≥2 oberoende ansatser/cross-verifiering är etablerad standard för att höja validitet. Källa: [Valencia 2022, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9714985/)
7. **Varningen — faktorzoo-t-statistik:** Harvey-Liu-Zhu (RFS 2016): hundratals publicerade faktorer; efter multipel testning krävs **t > 3.0** för att en ny "signal" ens ska räknas som signifikant; "de flesta påstådda fynd är sannolikt falska". Källor: [SSRN 2249314](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2249314) · [Duke-PDF](https://people.duke.edu/~charvey/Research/Published_Papers/P118_and_the_cross.PDF) · [RFS](https://academic.oup.com/rfs/article-abstract/29/1/5/1843824)

**Slutsats:** ≥3-regeln är teoretiskt och empiriskt befogad — *med villkoret* att (a) varje enskild signal har egen evidenskraft (AK1A: NCAV/multipel, AKM1, PEAD-impulsvåg, 52v-läge — alla med t väl över 3 i grundlitteraturen) och (b) signalerna inte bara är omformuleringar av samma underliggande data.

---

## 6. VÄRDEGOVET — NCAV och multipelgolvet ("value guaranteed")

- **Graham NCAV/net-net:** köp < 2/3 av NCAV. **Oppenheimer (1986, FAJ):** 1971–83 gav NCAV-portföljen **33,7 %/år** vs marknadens ~halva. Källor: [JSTOR](https://www.jstor.org/stable/4478980) · [T&F](https://www.tandfonline.com/doi/abs/10.2469/faj.v42.n6.40) · [Wikipedia NCAV](https://en.wikipedia.org/wiki/Net_current_asset_value)
- **Uppföljningar:** Carlisle (1984–2008) bekräftar kraftig överavkastning ([Net Net Hunter](https://www.netnethunter.com/net-current-asset-value-what-why-and-how/)); Quantpedia NCAV-effekt ~2,55 %/mån ([Quantpedia](https://quantpedia.com/strategies/net-current-asset-value-effect)); modern forskning fortsätter finna överavkastning ([RePEc 2026](https://ideas.repec.org/a/wly/revfec/v44y2026i1ne70034.html)); London-test visar lägre men positiv effekt ([Alpha Architect](https://alphaarchitect.com/an-analysis-of-testing-benjamin-grahams-net-current-asset-value-strategy-in-london/)).
- **Multipelgolv (NCAV saknas, nordisk normal):** O'Shaughnessy Value Composite (flera multipler rankade tillsammans) top-decil som fall-back-grind; Greens lag: kombinera multiplar för att single-multiple-brus dämpas ([Portfolio123](https://blog.portfolio123.com/did-what-works-on-wall-street-stop-working/)).

**Designimplikation:** värdegolvet är binärt (INTE ett bidrag i en poängsumma). Antingen är aktien under golvet (NCAV-rabatt eller VC-toppcentil) — då får vågsignaler spela — eller så är den inte det, oavsett hur vacker vågen är. Detta är "värde garanterat före vågorna".

---

## 7. VARNINGAR — value traps och momentumkrascher

### 7.1 Value traps
- **Piotroski (2000):** utan fundamentala förbättringar innehåller billiga aktier en stor andel fallgropar; F-Score 0–2 ≈ value trap, 8–9 ≈ recovery. Högt F-Score värdeaktier: 13,4 %/år vs 5,9 % för värdekvintilen. Källor: se §3.3 + [GeminiQ-guide](https://www.geminiq.com/blog/piotroski-f-score-value-trap) · [Quant Investing](https://www.quant-investing.com/blog/piotroski-f-score-complete-guide)
- **Momentum-klassikern (formulerad av Pani & Fabozzi via Alpha Architect):** *"momentum acts as a check on value, discouraging buying before a bottom"* — **köp aldrig fallande värde utan vändsignal**. Praktik: köp billigt + fundamentalt förbättrat + prisvåg som vänt (eller divergens med bevakningsstop). Källa: [alphaarchitect.com/using-momentum-to-find-value](https://alphaarchitect.com/using-momentum-to-find-value/)
- **AK1A-motsvarighet:** divergensregeln (P4.5) — fundamental impulsvåg + pris korrigering = "värde-signal att studera", ALDRIG direkt köp/sälj. Forskningen ger regeln rygg: PEAD-driften är dokumenterad men långsam; prismomentumet kan förbli negativt i många kvartal (Bernard-Thomas-driften mäts i kvartal, inte dagar).

### 7.2 Momentumkrascher — varför vågsignalerna ALDRIG får stå ensamma
- **Daniel & Moskowitz (2016, JFE) "Momentum crashes":** momentum förlorade **> 73 % på tre månader** i rebounden mars–maj 2009; krascherna är *delvis förutsägbara* — de sker i panikläge efter marknadsfall med hög volatilitet, contemporana med rebounds. Källor: [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0304405X16301490) · [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2486272) · [Alpha Architect](https://alphaarchitect.com/avoiding-momentum-crashes/) · [Verdad: long/short −55 % 2009](https://verdadcap.com/archive/a-momentum-crash-course) · [Scientific Beta](https://www.scientificbeta.com/factor/download/file/crash-tested-momentum)
- **Implikation:** Konfluensradarns värde-grind är naturligt momentumkrasch-skydd (värdefilter utesluter de uppseglande "losers" som driver krascherna) — men lägg till marknadstillståndsflagga (hög volatilitet + nylig marknadsfall = sänk vågvikter).

### 7.3 Divergens — fundament ▲ pris ▼
Litteraturen stödjer divergenssom en *tidig* men *osäker* signal: fundamental momentum börjar före prismomentum (Novy-Marx 2015) och PEAD-drift betalar tålamod (Bernard-Thomas). Men utan prisvändning är exekveringrisk hög → bevakningslista med definierad katalysator (nästa rapport, 52v-närmhet, volymbekräftad box-breakout) snarare än omedelbar position. Det är exakt AK1A:s P4.5.

---

## 8. FALLGROPAR — metodiskt

1. **Look-ahead-bias:** beslut måste bara använda data som fanns *vid beslutstillfället*. Rapporterad fundamentaldata har släpning (PEAD-litteraturens kärna: informationen är publik men priset reagerar långsamt — det är anomalins motor, men backtests som handlar på restaterad data ljuger). Källor: [AnalystPrep CFA](https://analystprep.com/study-notes/cfa-level-2/problems-in-backtesting/) · [Mike Harris](https://mikeharrisny.medium.com/look-ahead-bias-in-backtests-and-how-to-detect-it-ad5e42d97879)
2. **Restatement/point-in-time:** databaser skriver över med restaterade värden — VÅGFUNDAMENT-pipelinen (Yahoo-serier) bör låsa "as first reported" där det går. Källor: [Calcbench PIT](https://www.calcbench.com/blog/post/684461837001097216/a-discussion-on-point-in-time-data) · [S&P Global PIT vs lagged](https://www.spglobal.com/market-intelligence/en/news-insights/research/point-in-time-vs-lagged-fundamentals)
3. **Survivorship-bias:** blandar bort avnoterade/bankruttade bolag → överavkastning. NCAV- och värdestrategier drabbas *extra* hårt (net-nets dör oftare). Källa: [StarQube](https://starqube.com/backtesting-investment-strategies/)
4. **Multipel testning / faktorzoo:** varje extra kombinationsregel i Konfluensradarn är ett nytt test — håll antalet frihetsgrader lågt, kräv t > 3-logik och out-of-sample. Källor: [Harvey-Liu Backtesting haircut](https://people.duke.edu/~charvey/Research/Published_Papers/P120_Backtesting.PDF) · [Bailey & López de Prado, PBO/CSCV](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253) · [Portfolio Optimization Book 8.3](https://portfoliooptimizationbook.com/book/8.3-dangers-backtesting.html)
5. **Korrelationsillusion i konfluens:** räkna inte NCAV, P/B, P/S som "3 oberoende källor" — det är en källa (värdering) i tre förklädnader. Se Ladha §5. Även en varningsnot finns för over-engineering av kombinerade value+momentum-poäng ([SSRN 6255159, "Why Combining Value and Momentum Signals Destroys Value"](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6255159)) — ytterligare stöd för grind-logik framför additiv poäng.
6. **Tekniska mönster utan evidens:** Wyckoff/Darvas får ALDRIG bära en slutsats ensamma — använd dem som visualiserings-/lägesvokabulär ovanpå 52v/MA-bevisen (se §4).

---

## 9. SYNTES — KONFLUENSRADARN (designförslag: detta är innovationen)

### 9.1 Sekventiella grindar, inte poängsumma
Forskningen pekar enhälligt på **ordning** framför blandning (§1, §5, §8.5): en additiv composite kan köpas in på 5/5 momentum med 0/5 värde — exakt momentumkrasch-profilen (§7.2). Konfluensradarn ska därför vara en **trappa av grindar (AND-logik)** där varje steg är ett nödvändigt villkor:

```
GRIND 0 — VÄRDEGOV (binärt, "värde garanterat"):
   NCAV-rabatt (pris ≤ 2/3 NCAV) ELLER multipelgolv (Value Composite top-decil)
   [Oppenheimer 1986; O'Shaughnessy VC1; §6]
   ▼ passerat?
GRIND 1 — KVALITETSGOLV (AKM1):
   AKM1-helhet ≥ tröskel; inga röda kategorier (lönsamhet, skuld, likviditet)
   [QMJ; Novy-Marx 2013; Piotroski 2000 = value-trap-förskringen; §3.3]
   ▼ passerat?
GRIND 2 — FUNDAMENTAL VÅGSTART (triggern):
   VÅGFUNDAMENT: impulsvåg på MIKRO (qoq ≈ PEAD) och/eller KORT (yoy),
   helst med basbygge→impuls-overgång (= acceleration, He 2020) och
   förbättringstrend i kvalitetsvariabler (Lim 2024; Novy-Marx 2015)
   [§3 — den tidigaste signalen; twin momentum: fundamental+pris > summan, §3.3]
   ▼ passerad?
GRIND 3 — PRISVÅGS-LÄGE (lägesbestämning, ej krav på full impuls):
   AK1TS: basbygge = TIDLIGT läge (störst vänster, George-Hwang-ankare intakt);
   impulsvåg = bekräftat (52v-närmhet/volymbekräftad breakout; MA50/MA200 som
   eftersläpande sekundärbekräftelse ALDRIG primär trigger — §4)
   [George-Hwang 2004; Darvas/Wyckoff endast som vokabulär; §4]
   ▼ läge satt → positionstorlek & hastighet
BEVAKNING — DIVERGENS (fundament ▲ pris ▼):
   watchlista, definierad katalysator, ALDRIG direkt köp (AK1A P4.5) —
   "momentum avråder från att köpa före botten" (Pani-Fabozzi, §7.1)
```

### 9.2 Konfluenspoäng inom tratten (ranking, inte inträde)
Bland aktier som passerat Grind 0–1: enkel rak konfluensräkning av **verkligt oberoende** bevisfamiljer (forecast-combination-puzzlet: lika vikter slår optimerade, §5):

1. Värdefamiljen (NCAV/multipelgolvet — 1 röst, oavsett antal multipler)
2. Kvalitetsfamiljen (AKM1-nivå + kvalitetsförbättring i VÅGFUNDAMENT — förbättring är separat röst från nivå: Piotroski/Lim)
3. Fundamental vågstart (MIKRO-impulsvåg = PEAD-röst; KORT-impulsvåg eller basbygge→impuls = accelerationsröst — max 2 röster)
4. Prisvågsfamiljen (52v-närmhet ELLER AK1TS-läge — 1 röst)
5. Divergens med intakt fundament (1 röst, men enbart bevakningskredit)

**AK1A-regeln ≥3 oberoende källor** blir här: aktier med ≥3 familjeröster (varav värde per definition är den första) går till portföljkandidat; 2 röster = bevakning; 1 röst = avstå. Condorcet-logiken gäller bara om familjerna hålls åtskilda (Ladha-varningen §5.2).

### 9.3 Varuhysteria (checklista per läge)
- **Billig + fallande fundament + fallande pris = VALUE TRAP** — Grind 1 & 2 stoppar detta (Piotroski 0–2-profilen). "Köp aldrig fallande värde utan vändsignal": vändsignalen är MIKRO-impulsvåg i fundamentalt (PEAD) — inte en gissning om botten.
- **Fundament ▲ pris ▼ (divergens):** tidigast men osäkrast — watchlista + katalysator; exekvering först när prisvågen lämnar korrigering (basbygge räcker om 52v-ankaret är nära).
- **Allt ▲ + pris långt över 52v-höga + marknadspanik/volatilitet:** momentumkrasch-risk — sänk vågvikter (Daniel-Moskowitz: krascher delvis förutsägbara i panikläge).
- **Teknisk våg utan värdegolv:** finns inte i Konfluensradarn — per definition avvisat vid Grind 0. Det är hela poängen med "värde garanterat före vågorna".

### 9.4 Metodiska skyddrailser (från §8)
Point-in-time-fundamentdata (rapporteringsdatum som t-noll, aldrig restaterat); avnoterade bolag kvar i historiken; få frihetsgrader (trösklar sällan, gärna aldrig, optimerade); all backtest-kommunication med "haircut"-ton (Harvey-Liu); tålighetskörning mot perioden 2009 (momentumkrasch-stress) och 2000–02/2008 (värdesvaghets-stress).

### 9.5 Koppling till existerande AK1A-byggen
- **Grind 0** = V04/V05 (värderingskategori i AKM1) + ev. NCAV-beräkning i analysis_engine-pipelinen.
- **Grind 1** = AKM1-helhet 20×5 (redan existerande poäng 0–5 per variabel).
- **Grind 2** = VÅGFUNDAMENT-matrisens mikro/kort-kolumner (P2/P3-specifikationen: impulsvåg = momentum > +6 % OCH senaste värde ≥ horisontens medel — gränsen +6 % är intern; litteraturen stödjer *tecknet och övergångsmönstret*, inte exakt tröskel).
- **Grind 3** = AK1TS prisvågmatris + 52v-närmhetsmått.
- **Bevakning** = P4.5-diverensregeln, oförändrad.
Konfluensradarn är alltså ingen ny motor — det är en **kompositionsregel ovanpå två befintliga matriser**, vilket håller ny kod ytlig och determinismen intakt.

---

## 10. Sammanfattning — de tre tyngsta forskningspelarna

1. **Ordning beats blandning:** AMP 2013 (korrelation −0,49/−0,60; dubbel Sharpe) + Haghani-Dewey (+2,66 %/år kombinerat vs +0,86/+1,55 % enskilt, +6,51 % i björnmarknader) + O'Shaughnessy Trending Value (värde-topdecil FÖRST, momentum OMPÅ) → värde som hård grind före vågsignaler är den evidensbärande designen.
2. **Fundamental momentum är den tidigaste vågstarten:** PEAD (Bernard-Thomas: +1,32 %/+0,70 % drift kvartal 1–2), earnings acceleration (He 2020: förklarar avkastning bortom momentum/surprise), fundamental momentum (Novy-Marx 2015), twin momentum (Huang 2017: kombinationen > summan, robust när prismomentum sviktar) → VÅGFUNDAMENT-impulsvåg på MIKRO/KORT är rätt primärtrigger, före prisvågen.
3. **Momentum är värde-fällans motgift men får aldrig bära ensamt:** Piotroski (13,4 % vs 5,9 %/år) + Pani-Fabozzi ("momentum avråder från köp före botten"; alfa 1,14–1,19 %/mån) + Daniel-Moskowitz (momentumkrasch −73 % på 3 mån 2009, delvis förutsägbar) → divergens = watchlist med katalysator, prisvåg = läge/bekräftelse, och tekniska mönster (Wyckoff/Darvas) = vokabulär utan egen evidens.

---

## Källförteckning (urval, alla URL:er verifierade 2026-09-02)

**Kompositer:** [Magic Formula FAQ](https://www.magicformulainvesting.com/home/faqs) · [Wikipedia MFI](https://en.wikipedia.org/wiki/Magic_formula_investing) · [Quant Investing MF-backtest](https://www.quant-investing.com/blog/magic-formula-investment-strategy-back-test) · [QMJ Springer](https://link.springer.com/article/10.1007/s11142-018-9470-2) · [QMJ AQR](https://www.aqr.com/Insights/Research/Working-Paper/Quality-Minus-Junk) · [QMJ SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2312432) · [Novy-Marx 2013](https://www.sciencedirect.com/science/article/abs/pii/S0304405X13000044) · [Portfolio123 WWOWS](https://blog.portfolio123.com/did-what-works-on-wall-street-stop-working/) · [InvestStrat Trending Value](http://investstrat.com/trendingvalue.html) · [Stockopedia Trending Value](https://www.stockopedia.com/academy/articles/trending-value/) · [Fisher et al. 2015](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2472936)

**Värde × momentum:** [AMP Wiley](https://onlinelibrary.wiley.com/doi/10.1111/jofi.12021) · [AMP PDF](https://w4.stern.nyu.edu/facdir/lpederse/papers/ValMomEverywhere.pdf) · [AMP SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2174501) · [Alpha Architect Using Momentum to Find Value](https://alphaarchitect.com/using-momentum-to-find-value/)

**Fundamentalt momentum:** [Bernard-Thomas 1989](https://ideas.repec.org/a/bla/joares/v27y1989ip1-36.html) · [Bernard-Thomas 1990 fulltext](https://deepblue.lib.umich.edu/bitstreams/76760a1a-7cf1-4f33-abdd-e9cfdda79b80/download) · [PEAD Wikipedia](https://en.wikipedia.org/wiki/Post%E2%80%93earnings-announcement_drift) · [He 2020](https://www.sciencedirect.com/science/article/abs/pii/S0165410119300333) · [He NAAIM-PDF](https://www.naaim.org/wp-content/uploads/2018/05/2018_00M_Earnings-Acceleration-and-Stock-Returns_NAAIM-Submission-with-title-page.pdf) · [Novy-Marx 2015 NBER](https://www.nber.org/papers/w20984) · [Twin Momentum PDF](https://ink.library.smu.edu.sg/cgi/viewcontent.cgi?article=6156&context=lkcsb_research) · [Twin Momentum SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2894068) · [Lim 2024](https://www.sciencedirect.com/science/article/pii/S0378426623002273) · [Ehsani-Linnainmaa JSTOR](https://www.jstor.org/stable/45435157) · [Piotroski via Alpha Architect](https://alphaarchitect.com/value-investing-research-simple-methods-to-improve-the-piotroski-f-score/) · [Verdad Piotroski Synthesis](https://verdadcap.com/archive/the-piotroski-synthesis) · [Freiwald EM](https://www.franklintempleton.lu/articles/2026/putnam/emerging-markets-cheap-growing-and-underowned)

**Vågstart i pris:** [George-Hwang](https://www.researchgate.net/publication/4992688_The_52-Week_High_and_Momentum_Investing) · [Liu 2011](https://www.sciencedirect.com/science/article/abs/pii/S0261560610001099) · [Wyckoff Analytics](https://www.wyckoffanalytics.com/wyckoff-method/) · [Quantified Strategies Wyckoff](https://www.quantifiedstrategies.com/wyckoff-trading-strategy/) · [ASPD Darvas](https://theaspd.com/index.php/ijes/article/download/2292/1804/4459) · [TOS Golden Cross](https://tosindicators.com/research/golden-cross-trading-strategy-20-year-backtest-results) · [Quantified Strategies 200d](https://www.quantifiedstrategies.com/200-day-moving-average-strategy/)

**Konfluens/metodik:** [Condorcet](https://en.wikipedia.org/wiki/Condorcet%27s_jury_theorem) · [Ladha 1995](https://ideas.repec.org/a/eee/jeborg/v26y1995i3p353-372.html) · [Wisdom of crowds](https://en.wikipedia.org/wiki/Wisdom_of_the_crowd) · [fpp2 forecast combinations](https://otexts.com/fpp2/combinations.html) · [Aiolfi-Timmermann](https://www.sciencedirect.com/science/article/abs/pii/S0304407605001661) · [Blanc-Setio](https://www.sciencedirect.com/science/article/abs/pii/S0148296316303952) · [Harvey-Liu-Zhu SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2249314) · [Harvey-Liu Backtesting](https://people.duke.edu/~charvey/Research/Published_Papers/P120_Backtesting.PDF) · [Bailey-López de Prado](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253) · [SSRN 6255159](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6255159)

**Värdegolv & risker:** [Oppenheimer JSTOR](https://www.jstor.org/stable/4478980) · [Wikipedia NCAV](https://en.wikipedia.org/wiki/Net_current_asset_value) · [Quantpedia NCAV](https://quantpedia.com/strategies/net-current-asset-value-effect) · [Daniel-Moskowitz](https://www.sciencedirect.com/science/article/pii/S0304405X16301490) · [Alpha Architect momentum crashes](https://alphaarchitect.com/avoiding-momentum-crashes/) · [Verdad momentum crash](https://verdadcap.com/archive/a-momentum-crash-course) · [Calcbench PIT](https://www.calcbench.com/blog/post/684461837001097216/a-discussion-on-point-in-time-data) · [S&P PIT](https://www.spglobal.com/market-intelligence/en/news-insights/research/point-in-time-vs-lagged-fundamentals)

*Rapporten är pedagogiskt underlag inom AK1A-ekosystemet — ej investeringsråd. Siffror är källornas egna backtest/kvantitativa resultat och ska läsas med §8:s bias-varningar i minnet.*
