# VISUELL INTELLIGENCE — Forskningsunderlag för nya grafer + deterministiska framtidsvågor

**Datum:** 2026-09-01 · **Metod:** Strukturerad webbforskning (finansiell visualiseringspraxis, centralbanksmetodik för osäkerhetsband, renderingsprestanda, färgblinda-paletter) syntetiserad mot AK1A-ekosystemets befintliga visuella bibliotek · **Syfte:** Design- och kunskapsunderlag för nästa generation graf-komponenter i VIL/VIL-2 — med särskild tonvikt på **framtida vågor som visas utan att spå**: koner/fan charts, Monte Carlo-band, scenarier.

**Lästa källfiler (nuläget):** `src/components/ak1a/visuellt-bibliotek.tsx` (VIL 1–5), `visuellt-bibliotek-2.tsx` (VIL-2 7–10), `visuell-block.tsx` (block-renderer + värderingsskalan, sammanlagt 10 graf-typer), `vagfundament-matris.tsx` (20×5 fundamentalvågsmatris), `konfluens-tabell.tsx` (Konfluensradarn). Jämförelse mot `ak1a-analys`-skillens Monte Carlo/Bayes/Kelly-pipeline.

> **Designprinciper som syntesen måste respektera (ur kodbasen):** ren SVG + React state, **inga externa bibliotek**, SSR-säker (fast data vid render, låst seed), AK1A-färgvärlden (guld `#a8862a`, bull `#047857`, bear `#b91c1c`, papper `#fffdf7`), redundant symbolkodning (▲▼◼·), "motorn gissar aldrig" — `osatt` när data saknas, samt P8: pedagogiskt verktyg, aldrig investeringsråd; exakta vikter/trösklar stannar i motorn.

---

## 0. NULÄGET — dagens 10 graf-typer och deras luckor

| # | Komponent | Fil | Tjänar | Lucka forskningen fyller |
|---|---|---|---|---|
| 1 | CompoundChart (ränta-på-ränta) | visuellt-bibliotek.tsx | Tidsvärdet av pengar | – |
| 2 | MarginalBro | visuellt-bibliotek.tsx | Värderingsmarginal | – |
| 3 | Marknadscykel | visuellt-bibliotek.tsx | Cykelkänslor | statisk skiss, ingen data |
| 4 | Akm1Radar (20 variabler) | visuellt-bibliotek.tsx | AKM1-profil | – |
| 5 | PortfoljDonut | visuellt-bibliotek.tsx | Sektorsfördelning | **stock, inte flöde** — visar ett tillstånd, inte rörelser |
| 6 | VardeSkala (P/E) | visuell-block.tsx | Multipelzoner | – |
| 7 | VagTidslinje (5 horisonter) | visuellt-bibliotek-2.tsx | AK1TS-fönster | visar fönstret, **inte vågens förlopp i data** |
| 8 | BubbelHistorik 1637–2026 | visuellt-bibliotek-2.tsx | Cykelhumilitet | fast pedagogisk data, inte bolagsspecifik |
| 9 | RiskTermometer (V10+V11+V19) | visuellt-bibliotek-2.tsx | Risktryck | manual-input, ingen koppling till historik |
| 10 | KonvergensKort | visuellt-bibliotek-2.tsx | Konfluenslogik | demo-läge, inte utdata ur motorn |

**Tre strukturella luckor:** (1) **Ingen komponent visar tidsserier ur egna data** — allt är schematiskt/pedagogiskt; (2) **ingen visar framtiden** — trots att ak1a-analys-skillen redan producerar Monte Carlo-referensfördelningar, percentiler och scenarioväntevärden som idag bara blir siffror i rapporten; (3) **integriteten mellan vågfundament-matrisen (▲▼◼) och prisdata** finns som tabell men inte som bild. Konfluens-tabellen visar dessutom poängstaplar men aldrig *utvecklingen* av poängen.

---

## 1. FINANSIELL VISUALISERINGSKONST — hur proffs visar flöden över tid

### 1.1 Sankey — flöden som förlorar och vinner volym längs vägen

Sankey-diagrammet (namngivet efter kapten Matthew Henry Phineas Riall Sankeys ångmaskinsdiagram 1898) är standardverktyget när **kvantifierbara volymer flyttar sig från källor → destinationer och delar sig/återförenas**. Modern BI-praxis: använd när det handlar om flöden mellan steg, attribution mellan källor eller volymsplittring — aldrig för korrelationer eller få kategorier ([Astrato](https://www.astrato.io/blog/sankey-use-cases), [Domo](https://www.domo.com/learn/charts/sankey-diagrams)). Inom finans är etablerade användningar bankens resultatdiagram (räntenetto → provisioner → kostnader → vinst), nettoresultat-flöden och anomalidetektion i ekonomistyrning ([insightsoftware/Vizlib](https://insightsoftware.com/resources/vizlib-sankey-chart-the-most-common-use-cases-examples-in-qlik-sense/)), samt pengars kretslopp i ekonomier ([Medium: Mapping the Flow of Money](https://medium.com/data-and-beyond/sankey-diagrams-mapping-the-flow-of-money-2f362f2c08db)). Kanonbiblioteket är `d3-sankey` med R/D3-exempel hos [Data-to-Viz](https://www.data-to-viz.com/graph/sankey.html).

**AK1A-översättning:** en Sankey från *Kassa/Investerat kapital → sektorer → positioner → (förlust/avgift-läckage) → aktuellt värde* ersätter donutens statiska bild med själva **rörelsen** — inklusive läckageflöden (avgifter, spread, realiserade förluster) som tunnar strålen. Det är värdepärlan i värdeinvesteringens pedagogik: *var tog vägen pengarna?* Implementation: ren SVG med kubiska bezier-strålar (bredd ∝ belopp), ingen bibliotek nödvändig vid ≤ ~15 noder.

### 1.2 Sparklines — ordstora grafer, datata sittande i siffran

Tufte definierar sparklinen som *"small, intense, simple, word-sized graphic with typographic resolution"* och visar sin klassiska finansiella tabell där 24 tal med fem gällande siffror varje rad åtföljs av en mikro-graf — **siffran och bilden blir en enhet** ([Edward Tufte: Sparkline Theory and Practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/)). Hans executive-dashboard-analogi är bilsystemets instrumentpanel: många små avläsningar i *small-multiple-form* ([Tufte: Executive Dashboards](https://www.edwardtufte.com/notebook/executive-dashboards/)). Praxis: inga axlar, maximal data-ink, Slutvärde-punkt (och ev. start-till-slut-normering), och när precisa jämförelser krävs — låt axlade small multiples ta över ([Domo](https://www.domo.com/learn/charts/sparkline-chart)).

**AK1A-översättning:** vågfundament-matrisens 20 rader (V01–V20) är den perfekta värden: en ~100×24px sparkline per variabel, färgad efter vågklass (▲ grön / ▼ röd / ◼ guld), bredvid nivå-badgen. TvåDecimaler+en bild per cell ≈ Tuftes mönster rakt av. Kostnad: 20 små `<path>`:er — trivialt för SVG (se §3).

### 1.3 Säsongs-grid / candle-heatmap — kalendern som värmematris

Standardformatet är **år (rader) × månad (kolumner)** med månadsavkastning som divergerande färgskala ([Chris Parmer/Plotly: SPY 20 år](https://chris-parmer.com/python/seasonality/), [OpenAlgo-guide](https://blog.openalgo.in/understanding-stock-market-seasonality-a-python-guide-using-openalgo-cc63a7fa0f40), [Medium-walkthrough](https://medium.com/@kridtapon/python-for-market-analysis-heatmaps-made-easy-adb2ff9b473e)); TradingView-publicerad data för S&P visar typiska mönster: november (+2,5 %) och april (+2,0 %) starkast, september svagast ([TradingView: Sell in May — What the Data Shows](https://www.tradingview.com/chart/ES1!/VsVGDazH-Sell-in-May-and-Go-Away-What-the-Data-Actually-Shows/)); sedan 1950 ≈ +7,1 % nov–apr mot +1,7 % maj–okt ([Britannica Money](https://www.britannica.com/money/sell-in-May-and-go-away)). StockTrader's Almanac-baserade säsongsdiagram är en etablerad praktikertjänst ([StockCharts](https://articles.stockcharts.com/article/before-you-sell-in-may-check-the-seasonality-chart/), [Fidelity](https://www.fidelity.com/viewpoints/active-investor/sell-in-may), [MarketChameleon](https://marketchameleon.com/Learn/SeasonalityMonitor)). Samma år×månad-grid kan köra **candle-heatmap-varianten**: cellen visar OHLC-minicykel (tumstock) i stället för bara avkastning.

**AK1A-översättning med P8-disciplin:** bolagets *egna* 12-månadsmönster ur AK1TS-prisserien, deterministiskt: `månadsavkastning per kalendermånad, grupperad per år`. Ärlighetskrav: en månad med 10 års historik har **n = 10** — griden måste visa n och markera `osatt` under tröskel (samma hederskod som vågfundament-matrisen). "Sell in May"-litteraturen är också en varningsberättelse: effekten är statistiskt bräcklig och periodberoende ([Investopedia](https://www.investopedia.com/terms/s/sell-in-may-and-go-away.asp)) — griden är **beskrivande historik, aldrig en kalenderhandel**.

### 1.4 Bubble trails — Roslings spår genom plan

Hans Roslings Gapminder-bubblor (position = två variabler, storlek = population, **animerad tid + synligt spår efter bubblan**) är den mest bevisade formen för "ett objekts rörelse längs en bana genom ett plan" ([Gapminder World Health Chart](https://www.gapminder.org/fw/world-health-chart/), [Gapminder Tools](https://www.gapminder.org/tools), peer-reviewed: Rosling et al. 2011 via [PMC/NCBI](https://www.ncbi.nlm.nih.gov/pmc/)). Tekniskt byggs det av plain D3/SVG ([Keith McNulty-tutorial](https://keithmcnulty.com/), [chezvoila: The Genius of Hans Rosling, Frame by Frame](https://chezvoila.com/case-studies/the-genius-of-hans-rosling-frame-by-frame/)).

**AK1A-översättning:** bolagets **10-åriga bana i värdering × fundamental-kvalitet-plan** (t.ex. P/E × kategoripoäng, eller EV/EBITDA × tillväxt) med ett spår — pedagogiskt kärnkraft: det visar *mean reversion som en resa*, inte som en påstående. Dots per rapportperiod, deterministiskt ur rapportdata; `osatt`-gap när rapporter saknas (streckad spårsegment).

### 1.5 TradingView embeddad — håll det utanför den deterministiska kärnan

TradingView erbjuder gratis inbäddningsbara widgets (Advanced Chart/Real-Time Chart) med officiella React-exempel ([widget-docs](https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/), [widget-galleri](https://www.tradingview.com/widget/)) och community-paket (`react-tradingview-widget` [GitHub](https://github.com/rafaelklaussen/react-tradingview-widget), `react-ts-tradingview-widgets` [npm](https://www.npmjs.com/package/react-ts-tradingview-widgets), [Stack Overflow](https://stackoverflow.com/questions/53845011/how-to-to-insert-tradingview-widget-into-react-js-which-is-in-script-tag-link-h)).

**Verdict för AK1A: NEJ i kärnan, ev. JA som isolerad valbar modul.** Skäl: (i) bryter kodbasens princip *inga externa bibliotek / SSR-säker* — tredjeparts-`<script>` hydreras inte renligt och läcker data till TradingView (P8-sekretess); (ii) risken att användaren läser TradingViews indikatorer som om de vore AK1A-utdata — varumärkeskontamination av "motorn gissar aldrig"; (iii) hela poängen med VIL är *egen* pedagogik, inte hyrd kurva. Om live-kurser ändå önskas: lazy-loadad `<iframe>`-wrapper märkt "extern källa — inte en del av AK1A-motorn", aldrig i samma vy som deterministiska utdata.

---

## 2. DETERMINISTISKA FRAMÅTBLICKAR — koner, fan charts och Monte Carlo utan spådom

Detta är rapportens kärna: **hur visar man framtiden ärligt?** Svaret från centralbankerna, risktoolen och litteraturen är enigt: visa **fördelningar, inte linjer** — och låt osäkerheten växa med horisonten.

### 2.1 Centralbankernas fan charts — referensmetodiken

Bank of England har publicerat inflations-/GDP-fan charts sedan 1996 och metodiken är nu standard hos Riksbank, NBP, OECD m.fl. ([fanplot/R: Bank of England Fan Charts](https://guyabel.github.io/fanplot/articles/02_boe.html), [OECD ECO/WKP(2017)60](https://one.oecd.org/document/ECO/WKP(2017)60/en/pdf)). Tekniskt vilar den på **tvådelad normalfördelning (two-piece/split normal)** med parametrarna μ (centrala läget = **typvärdet**, inte medelvärdet), σ₁ (spridningen åt vänster) och σ₂ (spridningen åt höger); när σ₁ = σ₂ kollapsar den till vanlig normal ([Bundesbank DP 2010](https://www.bundesbank.de/resource/blob/703582/1d8467dcb5f5826549e99f8fa7b0ce41/mL/2010-12-30-dkp-27-data.pdf), [NBP WP 157, Kowalczyk 2013](https://static.nbp.pl/publikacje/materialy-i-studia/157_en.pdf)). **Skevheten = σ₂/σ₁** — på så sätt kodas riskbalansen (upside vs downside) i själva bandformen, inte bara bredden. BoE komprimerar hela fanen till sex tal: medelvärde, varians och skevhet vid 1- och 2-årshorisonterna ([Cogley et al., Bayesian Fan Charts for UK Inflation](https://gfk-cfs.de/media/03_44.pdf)).

**Renderingspraxis:** nästlade percentilband (10/25/75/90 eller 20/40/60/80) med avtagande ton utåt, graderad monokrom/sekventiell palett, och ett medvetet val om svansar ([Wikipedia: Fan chart](https://en.wikipedia.org/wiki/Fan_chart_(time_series)), [MathWorks](https://www.mathworks.com/matlabcentral/fileexchange/48006-fanchart-visualize-percentiles-of-time-series-data), [EViews](https://blog.eviews.com/2016/04/fan-chart.html), [Macrobond](https://help.macrobond.com/tutorials-training/macrobond-analysis-user-guides/4-charting/types-of-charts/presentations/time-chart/fan-chart/)). Wikipedia-artikeln påpekar metodpoängen: **centrera i typvärdet (inte medelvärdet) vid skeva fördelningar** och överväg HPD-intervall (highest probability density) i stället för naiva percentiler — annars kan centrala band bli missvisande. I praktiken: fanchart-biblioteket i Python replikerar BoE-utseendet rakt av ([fanchart docs](https://fanchart.readthedocs.io/en/latest/quick_start.html)).

**Kalibrering — fan charts är falsifierbara:** Elder (2005) formaliserar hur MPC:s fan charts utvärderas ex post (andelen utfall inom varje band ska motsvara bandets sannolikhet) ([SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=813845)); Dowd et al. (2008) gör samma övning för GDP-fans ([JSTOR](https://www.jstor.org/stable/23879437)). Det är exakt AK1A:s valideringsloggs-DNA: **prognoser lämnar spår som poängsätts (Brier)** — en vågkon med percentilband är per definition kalibrerbar.

### 2.2 Monte Carlo-koner — tradingplattformarnas version

Plattformarna har konvergerat på samma format: simulaera hundratals/tusentals prisbanor från senaste kurs (random walk med estimerad volatilitet, sammansatt per bar) och rendera **percentilband som brednar med horisonten** — TradingView MONTECARLO-indikatorer ([tradingview.com/scripts/montecarlo](https://www.tradingview.com/scripts/montecarlo/)), TrendSpiders Monte Carlo Probability Cone ([trendspider.com](https://trendspider.com/)), LuxAlgos "simulated futures"-prisbanor ([luxalgo.com](https://luxalgo.com)), pedagogik hos [SwitchMarkets](https://switchmarkets.com) och [dev3lop](https://dev3lop.com) (fan chart = en av tre huvudvisualiseringar av simuleringsutdata). Options-sidan gör samma sak som **volatilitetskon** ([OptionsForge](https://optionsforge.com)).

Nyckelmening som bör återspegla i AK1A:s textning: *Monte Carlo spår inte en framtid — det genererar en referensfördelning av många möjda banor givet indata.*

### 2.3 Slutsats för AK1A — vågkonens deterministiska matematik

Ak1a-analys-skillen kör redan `scripts/monte_carlo.py --S0 --sigma --mu --levels` med **låst seed** (reproducerbar, "SSR-säker" i samma anda som VIL-2), μ kalibrerad som `mu = ln(EV/S0)/T` mot viktat scenarioväntevärde, och rapporterar **variance drag (median vs medel) samt både terminal- och touch-sannolikheter**. Det är bokstavligen BoE:s sex-tals-filosofi i annan notation. Vågkon-komponenten ska alltså inte uppfinna något — den ska **rendera motorns befintliga utdata**:

- **Referensfördelning utan driftanspråk (det rena utfallsplanet):** med historisk realiserad σ och z_p = percentilkvantilen i normalfördelningen är bandet vid tid t
  `S_p(t) = S₀ · exp(z_p · σ_hist · √t)`
  — helt deterministiskt ur historiken (GBM med μ = 0 som *referensram*, exakt som skillen deklarerar GBM "endast som referensfördelning"). √t-breddningen är själva ärligheten: osäkerheten växer med roten ur tiden, och det syns.
- **Scenariovägd kon ( när analysen har Bull/Base/Bear):** tre linjer från kedjematemiken + gemensam percentilonvålpå från Monte Carlo-utdata (terminal-percentiler P5/P25/P50/P75/P95); skeva banden åt det hål med störst sannolikhetmassa — tvådelad normal i andan, även om AK1A låter simuleringspercentilerna göra jobbet i stället för parametrisk σ₁/σ₂ (enklare, ärligare, inte värre).
- **Median markerad, medel streckad** — variance drag synliggörs (median < medel när σ stor; skillens egen varning).
- **Terminal vs touch:** konen kan visa två linjepar — procent av banor som *nått* en nivå (touch) vs procent som *hamnar* i zon vid horisontens slut (terminal). Skillens skript levererar båda.
- **Percentilband, aldrig målpil:** ingen pil till ett pris, bara band med etiketter (P5…P95) och tydlig "denna dag"-axel. Historical σ deklaras med data-t.o.m.-datum.

---

## 3. SVG vs CANVAS — prestanda för stora serier i React

Konsensus i benchmarks och biblioteksdokumentation:

| Situering | Vinnare | Källa |
|---|---|---|
| Få hundra punkter, interaktivitet, tillgänglighet, skalbar vektorgrafik | **SVG** | [FusionCharts](https://www.fusioncharts.com/blog/canvas-vs-svg-charts/), [JointJS](https://www.jointjs.com/blog/svg-versus-canvas) |
| 10 000+ punkter, högfrekventa uppdateringar, hundratusentals element | **Canvas** | [CanvasJS ("10X")](https://canvasjs.com/javascript-charts/performance-demo-chart/), [AG Grid](https://www.ag-grid.com/blog/optimising-html5-canvas-rendering-best-practices-and-techniques/), [Syncfusion React-docs](https://ej2.syncfusion.com/react/documentation/chart/render-methods), [LinkedIn-benchmark](https://www.linkedin.com/posts/red-surge-technology_react-chart-library-performance-benchmarks-activity-7497672566493372416-uQYt) |
| Få objekt över stor yta | **SVG** (motsatt intuition!) | [JointJS](https://www.jointjs.com/blog/svg-versus-canvas), [yWorks](https://www.yworks.com/blog/svg-canvas-webgl) |

Varför SVG slår fel i skala: varje element blir en DOM-nod med lyssnare; DOM-overhead dominerar efter några tusen element. Canvas ritar pixlar till en bitmap — men förlorar inbyggd interaktivitet, ARIA och CSS-formattering.

**AK1A-rekommendation: förblj SVG — med en valfri nedsamplingsregel.** Skälen: (i) alla föreslagna komponenter (§5) ligger på **hundratals punkter** (252 dagar → 252 punkter; 10 år månadsdata → 120 celler; sparklines 60–120 punkter × 20) — långt under SVG-taket; (ii) SVG är React-deklarativt, SSR-säkert (VIL-2:s krav), stylbart med AK1A:s Tailwind-färger och tillgängligt (§4); (iii) **Monte Carlo-spaghetti är det enda som kan spränga budgeten** (1 000 banor × 252 steg ≈ 252k segment) — men rätt svar är inte Canvas, utan att **rendera percentilbanden (5–9 path:er) i stället för banorna**. Det är både snabbare *och* tydligare: forskningen i §2.1–2.2 visar att proffsen ritat band, inte spaghetti, just av läsbarhetsskäl. Eventuell framtida live-tick-vy (strömmande data): Canvas eller WebGL ([yWorks](https://www.yworks.com/blog/svg-canvas-webgl)) — men det är utanför AK1A:s nuvarande pedagogik- och SSR-krav.

---

## 4. TILLGÄNLIGHET — färgblinda-vänliga vågklasser och ARIA

### 4.1 Paletten — den röda varningen om rött/grönt

AK1A:s nuvarande signalpar **bull `#047857` (grön) / bear `#b91c1c` (röd)** är finansvärldens klassiker — och samtidigt dess klassiska tillgänglighetsfälla: cirka **8 % av män med nordeuropeiskt ursprung har deuteranopi/protanopi** och kan inte separera rött från grönt ([Tableau: 5 Tips for Designing Colorblind-Friendly Visualizations](https://www.tableau.com/blog/examining-data-viz-rules-dont-use-red-green-together)). Att kodbasen **redan har redundant symbolkodning (▲▼◼·)** räddar informationen (WCAG 1.4.1 "Use of Color" — färg får inte vara enda bääraren) — det är rätt och ska behållas. Men färglagret kan förbättras billigt.

**Okabe-Ito-paletten** (Color Universal Design, Okabe & Ito 2008) är guldstandarden: `#E69F00` orange, `#56B4E9` himmelblå, `#009E73` blågrön, `#F0E442` gul, `#0072B2` blå, `#D55E00` vermillion, `#CC79A7` rödlig lila + svart/grå — fungerar för deuteranopi, protanopi **och** tritanopi samt i CMYK-tryck ([The Node](https://thenode.biologists.com/data-visualization-with-flying-colors/research/), [FigCanvas med HEX/WCAG-analys](https://figcanvas.com/blog/okabe-ito-palette-hex-rgb-wong-prism)). Kontrastregler: WCAG AA kräver **≥ 4,5:1** för brödtext och **≥ 3:1** för stor text/grafik ([UGA CAES OIT](https://oit.caes.uga.edu/accessibility/using-color/)); använd de mörka Okabe-Ito-medlemmarna (blå, blågrön, vermillion, rödlig lila) för linjer/text och de ljusa (gul, himmelblå) som fyllningar ([FigCanvas](https://figcanvas.com/blog/okabe-ito-palette-hex-rgb-wong-prism)). Tableaus praktikråd för finans: byt röd/grön mot **blå/röd eller blå/brun** och par ljus med mörk ([Tableau](https://www.tableau.com/blog/examining-data-viz-rules-dont-use-red-green-together)); dashboards bör hålla 5–6 kategorifärger max.

**AK1A-förslag (vågklass-palett v2):** bull `#047857` → **`#0072B2` (blå)** eller behåll grönt men flytta till **`#009E73` (blågrön)**; bear `#b91c1c` → **`#D55E00` (vermillion)**; guld `#a8862a` (basbygge) är redan luminansmässigt separat och kan ligga kvar. Vermillion/blågrön-paret håller för alla tre färgblindhetstyper och behåller en "varm = ned, kall = upp"-intuition. Behåll alltid ▲▼◼· + textetiketter (redundans är huvudförsvarsmekanismen, paletten är förstärkning).

### 4.2 ARIA-mönster — SVG:n som ska kunna läsas

Konsensusmönstret är tvådelat: (1) ge `<svg>` en roll och textersättning — `role="img"` (eller `role="group"` för traverserbara multi-element-grafer) plus `<title>`/`<desc>`; W3C har pågående graphics-roller (`graphics-document`, `graphics-symbol`) ([EU Data Visualisation Guide](https://data.europa.eu/apps/data-visualisation-guide/accessible-svg-and-aria), [CSS-Tricks: Accessible SVGs](https://css-tricks.com/accessible-svgs/), [W3C Wiki: ARIA roles for charts](https://www.w3.org/wiki/SVG_Accessibility/ARIA_roles_for_charts), [A11Y Collective](https://www.a11y-collective.com/blog/svg-accessibility/), [naga.co.za](https://naga.co.za/2021/10/10/accessible-data-visualisations/)); (2) **den riktiga textersättningen är datatabellen** — en graf kan aldrig förmedla fuldetal till skärmläsare, så tillhandahåll underliggande data som tillgänglig HTML-tabell eller visuell-dold motsvarighet ([accessibility.build](https://accessibility.build/guides/accessible-charts), [tempertemper](https://www.tempertemper.net/blog/do-graphs-and-charts-need-to-be-accessible)). AK1A har redan tabellunderlaget (vågfundament-matrisen, konfluens-tabellen) — koppla varje ny graf till sin tabell med `aria-describedby`.

---

## 5. SYNTES — TOPP 10 NYA GRAF-KOMPONENTER, rankade på värde för AK1A

Rankning: värde = (koppling till ekosystemets motorer AK1TS/AKM1/Konfluens) × pedagogisk unikhet × deterministisk genomförbarhet. Samtliga implementeras i ren SVG + React state, SSR-säkra (låst seed/fast data vid render), med ▲▼◼·-redundans och P8-text.

### № 1 — VÅGKON (fan chart per horisont)

**Vad:** En prisserie med, från sista noteringen, en **kon av deterministiska percentilband** (P5–P95, innerband P25–P75, medianlinje) som breddas ∝ √t. En kon per vald AK1TS-horisont (Mikro = smal och brusig, Mega = vid) — *fem horisonter, fem konformar*, vilket i sig pedagogiserar "kortare horisont = mer brus". Scenario-läge: tre tunna linjer (Bull/Base/Bear-mål ur kedjematemiken) + percentiler från `monte_carlo.py`-utdata; median solid, medel streckad (**variance drag synlig**); touch- vs terminal-sannolikheter som två etikettrader.

**Matematik:** `S_p(t) = S₀ · exp(z_p · σ_hist · √t)` (ren referens, μ = 0) eller simuleringspercentiler ur skillens pipeline; σ deklarerad med data-t.o.m.-datum. BoE-metodik §2.1, kon-praxis §2.2.

**Varför etta:** det är den enda komponenttyp som täcker ekosystemets största obelysta tillgång — skillens Monte Carlo-matematik — och den tvingar fram ärlig framtidsvisualisering (band, aldrig pil). Kalibrerbar via valideringsloggen (Elder 2005-mönstret: andelen utfall inom bandet ska matcha bandets sannolikhet → Brier-rad per kon).

**P8-textning (obligatorisk):** *"Vågkonen visar scenario-utrymmet ur historisk volatilitet — ett band av vad som varit normalt, inte en prognos. Banden breddas med √t därför att osäkerheten gör det. Medianen är inte ett mål utan ett mittpåstående bland många."*

### № 2 — SANKEY-PORTFÖLJFLÖDE

**Vad:** Kapitalets väg: *Inbetalda medel → (buffert / investerat) → sektorer → positioner → utfall (vinst/förlust/avgift-läckage)*. Strålbredd ∝ belopp; läckage till avgifter/spread/realiserade förluster som tunnare grenar som "läcker ut". Ersätter kompletterrar donuten (stock → flöde). Källor §1.1.

**P8:** *"Flödet visar historik, inte framtid. Läckaget är verkliga kostnader — det enda säkra i bilden."*

### № 3 — SÄSONGS-GRID (bolagets 12-månadsmönster)

**Vad:** År × månad- värmematris av månadsavkastningar ur AK1TS-serien, med **n-räknare och `osatt` under tröskel** (t.ex. n < 5 år → cellen grå "osatt"); row-summary till höger (medel ± tvärsnitts-σ per månad — spridningen, inte bara medlet). Alternativ vy: OHLC-minicandles per cell. Källor §1.3.

**P8:** *"Säsongsmönster är beskrivande historia med små urval (n = antal år). 'Sell in May' är litteraturens varningsexempel: mönster som försvinner när man handlar på dem. Griden förklarar bolagets rytm — den är aldrig en kalenderhandel."*

### № 4 — SPARKLINE-BANK FÖR 20 V-KURSER

**Vad:** En Tufte-sparkline (~100×24 px, slutpunkt-markerad, färg = vågklass) per rad V01–V20 i vågfundament-matrisen — matrisen får sin tidsdimension utan att byta form. Vid hover: mini-axlar + sista värdet (small-multiple-regeln: axlar först vid behov). Källor §1.2.

**P8:** *"Sparklinen visar variabelns bana — inte dess framtid. Kort sparkline (mikro) är brusrik av definition."*

### № 5 — VÅGKLASS-HEATMAP-TIDSLINJE

**Vad:** Bolagets prisvågsklass (▲▼◼ via AK1TS-klassificeringen) som **rullande fönster × tid**-grid: rader = de fem horisonterna, kolumner = kvartal/månader bakåt; cellen färgas per vågklass med ▲▼◼-symbol. Gör "vågor" läsbara som landskap i stället för tabellsnapshot — och visar *när* en horisont vänder före en annan (kors-läsningens historia). Bygger direkt på vågfundament-matrisens klass-ontology.

**P8:** *"Tidslinjen är klassificerad historia — retroaktiv sekvens, inte mönsterigenkänning. Att en våg börjat betyder inte att den fortsätter."*

### № 6 — MONTE CARLO-TERMINALSPELARE (histogram + kon)

**Vad:** Den horisontella kompletteringen till vågkonen: **fördelningen vid horisontens slut** som histogram/spel med P5/P25/P50/P75/P95-streck, scenario-nivåer inritade, andel banor över/under varje nivå (terminal) + touch-andel. Låst seed — samma indata ger alltid samma bild (reproducerbarhet är en feature i UI:t). Källa: skillens `monte_carlo.py`-utdata §2.3.

**P8:** *"Fördelningen är en referensvärld given indata (σ, μ, S₀) — byt indata, byt värld. Den säger vad som är normalt, inte vad som kommer."*

### № 7 — DRAWDOWN-KLIPPAN (underwater chart)

**Vad:** Pris som % under högsta notering hittills, som fyllt ytdiagram under vattenlinjen 0 % — flera år av sedda "hur djupt och hur länge under vatten"-episoder; varje drawdown-episod får längd × djup synligt (praxis: [MetricGate](https://metricgate.com/docs/drawdown-analysis/), [AlternativeSoft](https://www.alternativesoft.com/drawdown-analysis-hedge-fund-software.html), [Gundersen](https://gregorygundersen.com/blog/2021/08/27/drawdown/); R-standard: `chart.Drawdown`/`table.Drawdowns` i [PerformanceAnalytics](https://github.com/cran/PerformanceAnalytics/blob/master/R/chart.Drawdown.R), [findDrawdowns](https://search.r-project.org/CRAN/refmans/PerformanceAnalytics/html/findDrawdowns.html)). Kopplas till Steg 2-kalibreringens "max drawdown" och BubbelHistorik-pedagogiken (känslolägenas djup).

**P8:** *"Historiens djup säger inte nästa djup — men den sätter golvet för vad 'normalt' vått är. Tålamodsprobe, inte prognos."*

### № 8 — ROSLING-SPÅR (värdering × kvalitet-banan)

**Vad:** Scatterplan (x = värderingsmultipel, y = AKM1-kategoripoäng) där bolaget rör sig kvartal för kvartal med **synligt spår** och play-reglage (Rosling-mönstret §1.4). Mean-reversion visuellt: banor som sveper in mot "rimligt"-zonen från över-/undervärderat. SNAP-frys per datum; deterministiskt ur rapportdata; `osatt`-gap som streckade spårsegment.

**P8:** *"Spåret visar var bolaget rest — zoner är historiska intervall, inte magneter. Att det kommit tillbaka en gång bevisar inte att det kommer tillbaka."*

### № 9 — VOLATILITETS-REGIMKARTA (σ-tidslinjen)

**Vad:** Realiserad volatilitet (rullande 63/252 d) som band över tid, med regimzoner tonade enligt Steg 2 (trend / utspädningsspiral / re-rating / händelsedriven) och aktuell σ stor markerad — matar vågkonens σ-indata och gör valet av Avancerad vs Kort nivå synligt (σ > 60 %-regeln).

**P8:** *"Regimen är en etikett på historia. Valet av analysnivå är en försiktighetsregel — inte en utsaga om nästa regiim."*

### № 10 — ENTRY-TRAPPA (positionsstorlek & riskbudget som trappsteg)

**Vad:** Det visuella slutstycket på skillens Steg 7: riskbudget (acceptabel portföljförlust), avstånd till stopp, Kelly-tak och verklighetsfilter (modellosäkerhet ~1/10, volatilitetsbudget ∝ 1/σ, halvering vid binärt utfall) som **trappsteg ner i exponering** — varje steg etiketterat med vilken regel som satte det. Gör "diskret Kelly obegränsad = felkalibrerade odds"-diagnosen till en bild (trappan vägrar att gå högre utan att säga varför).

**P8:** *"Trappan är en storleksdisciplin, aldrig en uppmaning. Kelly-taket är en varningsflagga, inte en gåva."*

---

## 6. P8 — HUR TEXTAS PROJEKTIONER ÄRLIGT (formuleringsbank)

Forskningen ger fyra mekaniska regler, alla med centralbanks- och litteraturförankring:

1. **Fördelning, aldrig linje.** Visa percentilband som växer med horisonten (√t); sätt aldrig en pil på ett framtida pris. (BoE-praxis, §2.1.) Centrera i **median** (eller typvärde vid avsiktlig skevhet) — aldrig medelvärde utan att också visa det streckat, annars döljs variance drag.
2. **Äg orden.** Tillåtna: *scenario-utrymme, referensfördelning, band av normalitet, utfallsplanet, hypotetiska banor, låst seed.* Förbjudna: *prognos, förväntan, mål, förutsägelse, kommer att.* Skillens eget formulär — "Monte Carlo spår inte en framtid, det genererar en sannolikhetsfördelning" — är mallen.
3. **Deklarera indata och deras ålder.** Varje kon bär `σ beräknad t.o.m. YYYY-MM-DD · n = antal observationer · μ = 0 (referens) eller scenariovägd (deklarerad)`. Utan σ-deklaration: `osatt`, ingen kon (motorn gissar aldrig — inte heller bilden).
4. **Gör den falsifierbar.** Varje kon kopplas till en brytpunkt och loggas i `valideringslogg.md`: vid horisontens slut poängsätts bandet (andelen utfall inom P5–P95 ska ≈ 90 %) → Brier-rad → kalibreringsdrift syns i nästa analys. (Elder 2005 / Dowd et al. 2008-mönstret, §2.1.) En fan chart man inte vågar logga är en fan chart man inte borde visa.

**Standarddisclaimerrad för alla framtidskomponenter (förslag):** *"Detta är ett scenario-band beräknat ur historisk data med låst seed — bilden av osäkerhet, inte av framtiden. Pedagogiskt verktyg, inte investeringsråd."*

---

## 7. KÄLLOR

**Fan charts / centralbanker:** [Wikipedia: Fan chart (time series)](https://en.wikipedia.org/wiki/Fan_chart_(time_series)) · [fanplot/R: BoE Fan Charts (Abel)](https://guyabel.github.io/fanplot/articles/02_boe.html) · [fanchart (Python)](https://fanchart.readthedocs.io/en/latest/quick_start.html) · [Elder 2005, SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=813845) · [Dowd et al. 2008, JSTOR](https://www.jstor.org/stable/23879437) · [OECD ECO/WKP(2017)60](https://one.oecd.org/document/ECO/WKP(2017)60/en/pdf) · [NBP WP 157 (Kowalczyk 2013)](https://static.nbp.pl/publikacje/materialy-i-studia/157_en.pdf) · [NBP SSRN](https://papers.ssrn.com/sol3/Delivery.cfm/SSRN_ID2805016_code851390.pdf?abstractid=2805016&mirid=1&type=2) · [Bundesbank DP 27/2010](https://www.bundesbank.de/resource/blob/703582/1d8467dcb5f5826549e99f8fa7b0ce41/mL/2010-12-30-dkp-27-data.pdf) · [Cogley et al.](https://gfk-cfs.de/media/03_44.pdf) · [EViews](https://blog.eviews.com/2016/04/fan-chart.html) · [Macrobond](https://help.macrobond.com/tutorials-training/macrobond-analysis-user-guides/4-charting/types-of-charts/presentations/time-chart/fan-chart/) · [MathWorks](https://www.mathworks.com/matlabcentral/fileexchange/48006-fanchart-visualize-percentiles-of-time-series-data) · [Peltier Tech](https://peltiertech.com/excel-fan-chart-showing-uncertainty-in-projections/) · [R-bloggers](https://www.r-bloggers.com/2013/04/bank-of-england-fan-charts-in-r/)

**Monte Carlo-koner:** [TradingView MONTECARLO](https://www.tradingview.com/scripts/montecarlo/) · [TrendSpider Probability Cone](https://trendspider.com/) · [LuxAlgo](https://luxalgo.com) · [SwitchMarkets](https://switchmarkets.com) · [dev3lop](https://dev3lop.com) · [OptionsForge](https://optionsforge.com)

**Visualiseringspraxis:** [Tufte: Sparklines](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/) · [Tufte: Executive Dashboards](https://www.edwardtufte.com/notebook/executive-dashboards/) · [Domo sparkline](https://www.domo.com/learn/charts/sparkline-chart) · [Data-to-Viz: Sankey](https://www.data-to-viz.com/graph/sankey.html) · [Astrato Sankey-use-cases](https://www.astrato.io/blog/sankey-use-cases) · [insightsoftware/Vizlib](https://insightsoftware.com/resources/vizlib-sankey-chart-the-most-common-use-cases-examples-in-qlik-sense/) · [Medium: Flow of Money](https://medium.com/data-and-beyond/sankey-diagrams-mapping-the-flow-of-money-2f362f2c08db) · [Parmer: SPY seasonality](https://chris-parmer.com/python/seasonality/) · [OpenAlgo](https://blog.openalgo.in/understanding-stock-market-seasonality-a-python-guide-using-openalgo-cc63a7fa0f40) · [TradingView: Sell in May-data](https://www.tradingview.com/chart/ES1!/VsVGDazH-Sell-in-May-and-Go-Away-What-the-Data-Actually-Shows/) · [Britannica](https://www.britannica.com/money/sell-in-May-and-go-away) · [Investopedia](https://www.investopedia.com/terms/s/sell-in-may-and-go-away.asp) · [StockCharts](https://articles.stockcharts.com/article/before-you-sell-in-may-check-the-seasonality-chart/) · [Fidelity](https://www.fidelity.com/viewpoints/active-investor/sell-in-may) · [MarketChameleon](https://marketchameleon.com/Learn/SeasonalityMonitor) · [Gapminder](https://www.gapminder.org/fw/world-health-chart/) · [chezvoila: Rosling frame by frame](https://chezvoila.com/case-studies/the-genius-of-hans-rosling-frame-by-frame/) · [Rosling et al. 2011 (PMC)](https://www.ncbi.nlm.nih.gov/pmc/)

**SVG/Canvas:** [FusionCharts](https://www.fusioncharts.com/blog/canvas-vs-svg-charts/) · [CanvasJS](https://canvasjs.com/javascript-charts/performance-demo-chart/) · [AG Grid](https://www.ag-grid.com/blog/optimising-html5-canvas-rendering-best-practices-and-techniques/) · [JointJS](https://www.jointjs.com/blog/svg-versus-canvas) · [yWorks](https://www.yworks.com/blog/svg-canvas-webgl) · [Syncfusion React](https://ej2.syncfusion.com/react/documentation/chart/render-methods) · [LinkedIn-benchmark](https://www.linkedin.com/posts/red-surge-technology_react-chart-library-performance-benchmarks-activity-7497672566493372416-uQYt)

**Tillgänglighet:** [Tableau](https://www.tableau.com/blog/examining-data-viz-rules-dont-use-red-green-together) · [The Node (Okabe-Ito)](https://thenode.biologists.com/data-visualization-with-flying-colors/research/) · [FigCanvas Okabe-Ito/WCAG](https://figcanvas.com/blog/okabe-ito-palette-hex-rgb-wong-prism) · [UGA CAES OIT](https://oit.caes.uga.edu/accessibility/using-color/) · [EU Data Viz Guide](https://data.europa.eu/apps/data-visualisation-guide/accessible-svg-and-aria) · [CSS-Tricks](https://css-tricks.com/accessible-svgs/) · [W3C Wiki](https://www.w3.org/wiki/SVG_Accessibility/ARIA_roles_for_charts) · [accessibility.build](https://accessibility.build/guides/accessible-charts) · [A11Y Collective](https://www.a11y-collective.com/blog/svg-accessibility/) · [tempertemper](https://www.tempertemper.net/blog/do-graphs-and-charts-need-to-be-accessible) · [naga.co.za](https://naga.co.za/2021/10/10/accessible-data-visualisations/)

**Drawdown:** [MetricGate](https://metricgate.com/docs/drawdown-analysis/) · [AlternativeSoft](https://www.alternativesoft.com/drawdown-analysis-hedge-fund-software.html) · [Gundersen](https://gregorygundersen.com/blog/2021/08/27/drawdown/) · [PerformanceAnalytics (CRAN)](https://github.com/cran/PerformanceAnalytics/blob/master/R/chart.Drawdown.R) · [findDrawdowns](https://search.r-project.org/CRAN/refmans/PerformanceAnalytics/html/findDrawdowns.html) · [table.Drawdowns](https://www.rdocumentation.org/packages/PerformanceAnalytics/versions/2.0.8/topics/table.Drawdowns)

**TradingView-embed:** [Advanced Chart docs](https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/) · [Widget-galleri](https://www.tradingview.com/widget/) · [Chart-widgets](https://www.tradingview.com/widget-docs/widgets/charts/) · [react-tradingview-widget](https://github.com/rafaelklaussen/react-tradingview-widget) · [react-ts-tradingview-widgets](https://www.npmjs.com/package/react-ts-tradingview-widgets) · [Stack Overflow](https://stackoverflow.com/questions/53845011/how-to-to-insert-tradingview-widget-into-react-js-which-is-in-script-tag-link-h)
