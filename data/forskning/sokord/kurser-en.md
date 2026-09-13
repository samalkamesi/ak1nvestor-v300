# Kurser EN — Engelsk nyckelfrasinventering ur kurskorpusen

**Våg**: 138 · **Agent**: S2 (av 9 parallella) · **Datum**: 2026-09-14
**Källa**: `data/seo/kurser/` — samtliga **333 JSON-filer**, 100 % täckning (0 parselfel).
**Syfte**: Strukturerad frölista med engelska sökordsfraser, mappade mot kurserna,
som underlag för sajtens /en-sidor. Allt formulerat som **utbildning** — se juridikgrinden
i §10.

---

## 1. Sammanfattning

- Korpusen har exakt tre fält per fil: `title`, `description`, `keywords`. **Inga
  `title_en`-fält finns** — engelskan ligger (a) i titlar på engelska böcker,
  (b) i engelska begrepp i svenska titlar/nyckelord (DCF, moat, position sizing),
  (c) i beskrivningstexterna (t.ex. "Rule of 40", "golden cross", "value trap").
- **103 av 333 kurser är bokmästarkurser** med engelsk originaltitel — varje
  boktitel är i sig ett etablerat internationellt sökfrö.
- **98 av 103 boktitlar är engelskspråkiga original**; 5 är svenska original
  (Hjelström, Torssell, Eklund) eller svenska översättningstitlar (Lynch
  "Mina bästa investeringar" = *Beating the Street*, Kahneman "Tänka snabbt och
  långsamt" = *Thinking, Fast and Slow*) — de två senare får engelskt frö via
  originaltiteln.
- Totalt **~270 engelska nyckelfrön** inventerade och grupperade i 15 grupper
  (A–O), var och en med svensk motsvarighet, kursfil och long-tail-styrka —
  med **full filreferenstäckning: samtliga 333 kursfiler nämns** (maskinellt
  verifierad).
- Tre begreppsformationer är särskilt starka för /en: **värderingsterminologin**
  (DCF-family), **moat-vokabulären** och **trading/teknisk analys-vokabulären**
  — alla tre är globalt sökta, Allakurs-utbildningskompatibla och redan
  kurskapslade i korpusen.

## 2. Metod och täckning

Sond: `.zcode/v138-s2-sond.mjs` + `.zcode/v138-s2-sond2.mjs` (Node, läsning av
alla 333 JSON). Fältfrekvens: `title`/`description`/`keywords` = 333/333/333.
Korpusens egna nyckelordsfält är svenska (362 unika; topp-3 "AKM1",
"institutionell metodik", "lär dig aktieanalys" = 333 ggr vardera) — engelska
frön har alltså extraherats ur titlar + beskrivningar + ämnesklassningar.

**Grundindelning (filer räknade)**:

| Block | Filer | Innehåll |
|---|---|---|
| Bokmaster (engelska böcker) | 98 | klassiska investerings-/trading-/redovisningsböcker |
| Bokmaster (svenska original/översättningar) | 5 | Hjelström, Torssell, Eklund, Lynch, Kahneman |
| km-* (kunskapsmoduler) | 70 | redovisning, värdering, risk, beteende, sektor, skatt, makro, optioner, utdelning |
| ts-* (AK1TS fördjupning) | 25 | teknisk analys |
| pc-* (praktiska case) | 20 | svenska bolagscase |
| rk-* (risk) | 15 | risktyper |
| se-* (sektorer) | 15 | sektoranalys |
| pf-* (portfölj) | 14 | portföljhantering |
| bf-* (beteendefinans) | 11 | bias-kurser |
| mk-* (makro) | 11 | makroekonomi |
| vm-* (värderingsmetoder) | 11 | modeller |
| v01–v20 (AKM1-variabler) | 20 | variabler i modellen |
| ud-* (utdelning) | 8 | utdelningsstrategi |
| sj-* (skatt & juridik) | 5 | svensk skatt |
| Övriga (AKM1/AK1TS/metodböcker) | 5 | akm1-den-kontroversiella-modellen, ak1ts-vaglarans-hierarki, portfolj-ekosystemet, vagfundament-variablerna-som-tidsserier, konfluens |
| **Summa** | **333** | |

## 3. Skala för long-tail-styrka

| Grad | Betydelse |
|---|---|
| **HÖG** | Specifik fras (ofta 3+ ord), tydlig sökintention ("hur gör man"), låg-till-medel konkurrens — bäst för /en-artiklar och kurssidor |
| **MEDEL** | Etablerat 2-ordsbegrepp med stor global sökvolym men hård konkurrens (Investopedia, Wikipedia) — winbar med "course/for beginners/how to calculate"-modifierare |
| **LÅG** | En-ords eller extremt bred — tjänar som märkesord/intern länktext, inte som sidtitel |

---

## 4. Inventering per grupp

### Grupp A — Värdering och multiplicer (Valuation & multiples) · 27 frön

Kärngrupp för /en: korpusen har en hel värderingsmiljö (km-007…km-012, vm-01…vm-11, v04–v06).

| # | Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|---|
| A1 | discounted cash flow (DCF) | DCF — diskonterade kassaflöden | km-007-dcf.json | MEDEL ("DCF" enorm volym; "discounted cash flow for beginners" = HÖG) |
| A2 | reverse DCF | Reverse DCF — vilken tillväxt impliceras | km-028-reverse-dcf.json | HÖG |
| A3 | WACC (weighted average cost of capital) | WACC — vägd kapitalkostnad | km-008-wacc.json | MEDEL |
| A4 | WACC pitfalls / common WACC mistakes | WACC-fällor | vm-11-waccfallor.json | HÖG |
| A5 | intrinsic value | Intrinsic value / verkligt värde | vm-02-intrinsic-value.json | MEDEL ("how to calculate intrinsic value" = HÖG) |
| A6 | margin of safety | Margin of safety / säkerhetsmarginal | km-030-margin-of-safety.json | MEDEL |
| A7 | price-to-earnings ratio (P/E) | P/E — Price-to-Earnings djupdykning | km-009-pe.json | MEDEL |
| A8 | EV/EBIT multiple | EV/EBIT — renare än P/E | km-010-evebit.json | MEDEL |
| A9 | EV/EBITDA | EV/EBITDA — den mest kompletta multiplen | v06-ev-ebitda.json | MEDEL |
| A10 | EV/Sales | EV/Sales — företagsvärde/omsättning | vm-08-evsales.json | HÖG |
| A11 | price-to-sales ratio (P/S) | P/S (Price-to-Sales) | v04-ps.json | MEDEL |
| A12 | price-to-book ratio (P/B) | P/B (Price-to-Book) | v05-pb.json | MEDEL |
| A13 | PEG ratio | PEG-ratio — Lynchs favorit | km-027-pegratio.json | HÖG |
| A14 | price-to-cash-flow (P/CF) | Price-to-Cash-Flow | vm-09-pricetocashflow.json | HÖG |
| A15 | free cash flow yield | Free Cash Flow Yield | vm-07-free-cash-flow-yield.json | HÖG |
| A16 | dividend discount model (DDM) | Dividend Discount Model | vm-06-dividend-discount-model-ddm.json | HÖG |
| A17 | Gordon growth model | Gordon Growth Model (i DDM-kursen) | vm-06-dividend-discount-model-ddm.json | HÖG |
| A18 | Shiller P/E / CAPE ratio | Cyklisk justering — Shiller P/E | vm-04-cyklisk-justering.json | HÖG |
| A19 | sum-of-the-parts valuation (SOTP) | Sum-of-the-Parts | km-012-sum-of-the-parts-sotp.json | HÖG |
| A20 | asset-based valuation | Asset-based valuation | vm-10-assetbased-valuation.json | HÖG |
| A21 | liquidation value / cigar butt | Liquidationsvärde, Graham's cigar butt | vm-10-assetbased-valuation.json | HÖG |
| A22 | relative valuation / peer comps | Relativ värdering — peer comps | km-011-relativ-vardering.json | MEDEL |
| A23 | Graham formula (V = EPS × (8.5 + 2g)) | Graham's formel | vm-01-grahams-formel.json | HÖG |
| A24 | scenario analysis in valuation | Scenario-analys med sannolikheter | km-029-scenarioanalys.json | HÖG |
| A25 | real options valuation | Realoptioner — R&D som option | vm-05-realoptioner.json | HÖG |
| A26 | how to choose a valuation multiple | Multipel-val — när använda vilken | vm-03-multipelval.json | HÖG |
| A27 | acquirer's multiple | The Acquirer's Multiple (EV/EBIT-varianter) | the-acquirers-multiple.json | HÖG |

### Grupp B — Bokmästarkurser: engelska boktitlar som sökfrön · 103 frön

Mönster: boktiteln är LÅG/MEDEL som enskild fras (Investopedia/Amazon dominerar),
men **titel + "course"/"summary"/"chapter by chapter"/"lessons"** är HÖG long-tail
— och där är AK1A:s format (komplett kurs per bok) unikt. Alla 103 bokmästarfiler
har nyckelordet "bokmaster aktieanalys" i korpusen.

**B1. Value investing-klassiker**

| Engelskt frö | Kursfil | Long-tail (modifierad) |
|---|---|---|
| The Intelligent Investor | the-intelligent-investor.json | MEDEL → "The Intelligent Investor course" HÖG |
| Security Analysis — Graham & Dodd | security-analysis.json | MEDEL |
| The Warren Buffett Way | the-warren-buffett-way.json | HÖG |
| The Warren Buffett Portfolio | the-warren-buffett-portfolio.json | HÖG |
| The Essays of Warren Buffett | the-essays-of-warren-buffett.json | HÖG |
| The Snowball (Buffett biography) | the-snowball.json | MEDEL |
| Of Permanent Value (Kilpatrick) | of-permanent-value.json | HÖG |
| Poor Charlie's Almanack | poor-charlies-almanack.json | HÖG |
| Charlie Munger: The Complete Investor | charlie-munger-complete-investor.json | HÖG |
| Margin of Safety — Klarman | margin-of-safety.json | HÖG ("Margin of Safety Klarman book" — kultbok, söks globalt) |
| The Dhandho Investor — Pabrai | the-dhandho-investor.json | HÖG |
| Value Investing: From Graham to Buffett and Beyond | value-investing-from-graham-to-buffett.json | HÖG |
| The Little Book of Value Investing | the-little-book-of-value-investing.json | HÖG |
| The Little Book That Beats the Market (magic formula) | the-little-book-that-beats-the-market.json | HÖG — frö även: "magic formula investing" |
| You Can Be a Stock Market Genius — Greenblatt | you-can-be-a-stock-market-genius.json | HÖG — frö även: "special situations investing" |
| One Up on Wall Street — Lynch | one-up-on-wall-street.json | MEDEL |
| Beating the Street (sv. kursen "Mina bästa investeringar") | mina-basta-investeringar.json | HÖG via originaltitel |
| Common Stocks and Uncommon Profits — Fisher | common-stocks-uncommon-profits.json | HÖG — frö även: "scuttlebutt method" |
| Contrarian Investment Strategies — Dreman | contrarian-investment-strategies.json | HÖG — frö även: "contrarian investing" |
| 100 Baggers — Mayer | 100-baggers.json | HÖG — frö även: "100 bagger stocks", "multi-bagger investing" |
| What Works on Wall Street — O'Shaughnessy | what-works-on-wall-street.json | HÖG — frö även: "quantitative stock screening" |
| Quantitative Value — Gray & Carlisle | quantitative-value.json | HÖG |
| Distress Investing — Whitman & Diz | distress-investing.json | HÖG — frö även: "distressed debt investing" |
| Expectations Investing — Rappaport & Mauboussin | expectations-investing.json | HÖG — frö även: "expectations investing" (reverse-engineering av pris) |
| The Theory of Investment Value — Williams | the-theory-of-investment-value.json | HÖG — frö även: "origin of discounted cash flow" (Williams anses ha uppfunnit DCF) |
| The Outsiders — Thorndike (CEO capital allocation) | the-outsiders.json | HÖG — frö även: "capital allocation CEOs" |
| The Five Rules for Successful Stock Investing — Dorsey | the-five-rules-for-successful-stock-investing.json | HÖG — frö även: "economic moat" (Dorsey/Morningstar) |
| The Most Important Thing — Marks | the-most-important-thing.json | HÖG — frö även: "second-level thinking" |

**B2. Index/portfölj/långsiktigt**

| Engelskt frö | Kursfil | Long-tail |
|---|---|---|
| A Random Walk Down Wall Street — Malkiel | a-random-walk-down-wall-street.json | MEDEL |
| Common Sense on Mutual Funds — Bogle | common-sense-on-mutual-funds.json | HÖG — frö även: "index fund investing", "Bogle philosophy" |
| The Bogleheads' Guide to Investing | the-bogleheads-guide-to-investing.json | HÖG |
| Winning the Loser's Game — Ellis | winning-the-losers-game.json | HÖG |
| Stocks for the Long Run — Siegel | stocks-for-the-long-run.json | HÖG |
| The Intelligent Asset Allocator — Bernstein | the-intelligent-asset-allocator.json | HÖG |
| All About Asset Allocation — Ferri | all-about-asset-allocation.json | HÖG — frö även: "asset allocation strategy" |
| Principles of Corporate Finance — Brealey/Myers/Allen | principles-of-corporate-finance.json | MEDEL (lärobok; "Brealey Myers summary" HÖG bland studenter) |
| Analysis for Financial Management — Higgins | analysis-for-financial-management.json | HÖG (studentfrö) |

**B3. Trading & teknisk analys-böcker**

| Engelskt frö | Kursfil | Long-tail |
|---|---|---|
| Market Wizards — Schwager | market-wizards.json | MEDEL |
| Reminiscences of a Stock Operator — Lefèvre | reminiscences-of-a-stock-operator.json | MEDEL (evig klassiker, söks) |
| Trading for a Living — Elder | trading-for-a-living.json | HÖG |
| Come Into My Trading Room — Elder | come-into-my-trading-room.json | HÖG |
| Trading in the Zone — Douglas | trading-in-the-zone.json | HÖG — frö även: "trading psychology" |
| The Master Swing Trader — Farley | the-master-swing-trader.json | HÖG — frö även: "swing trading" |
| The Complete TurtleTrader — Covel | the-complete-turtletrader.json | HÖG — frö även: "turtle traders" |
| Way of the Turtle — Faith | way-of-the-turtle.json | HÖG |
| The Trend Following Bible — Abraham | the-trend-following-bible.json | HÖG — frö även: "trend following strategy" |
| How to Make Money in Stocks — O'Neil | how-to-make-money-in-stocks.json | HÖG — frö även: "CANSLIM system" |
| Technical Analysis of Stock Trends — Edwards & Magee | technical-analysis-of-stock-trends.json | MEDEL |
| Technical Analysis of the Financial Markets — Murphy | technical-analysis-financial-markets.json | MEDEL |
| Intermarket Analysis — Murphy | intermarket-analysis.json | HÖG |
| The Visual Investor — Murphy | the-visual-investor.json | HÖG |
| The New Science of Technical Analysis — DeMark | the-new-science-of-technical-analysis.json | HÖG — frö även: "DeMark indicators" |
| Encyclopedia of Chart Patterns — Bulkowski | encyclopedia-of-chart-patterns.json | HÖG — frö även: "chart patterns statistics" |
| Japanese Candlestick Charting — Nison | japanese-candlestick-charting.json | HÖG — frö även: "candlestick patterns" |
| Bollinger on Bollinger Bands | bollinger-on-bollinger-bands.json | HÖG |
| Elliott Wave Principle — Frost & Prechter | elliott-wave-principle.json | MEDEL — frö även: "Elliott Wave theory" |
| Martin Pring on Market Momentum | martin-pring-on-market-momentum.json | HÖG — frö även: "market momentum indicators" |
| Fibonacci Applications and Strategies for Traders | fibonacci-applications.json | HÖG |
| The Art of Short Selling — Staley | the-art-of-short-selling.json | HÖG — frö även: "how short selling works" |
| The Alchemy of Finance — Soros | the-alchemy-of-finance.json | HÖG — frö även: "reflexivity theory" |
| The Money Game — Adam Smith | the-money-game.json | MEDEL |
| Liar's Poker — Lewis | liars-poker.json | MEDEL |
| Flash Boys — Lewis | flash-boys.json | MEDEL — frö även: "high frequency trading HFT" |

**B4. Beteendefinans & psykologi-böcker**

| Engelskt frö | Kursfil | Long-tail |
|---|---|---|
| Thinking, Fast and Slow (sv. kurs "Tänka snabbt och långsamt") | tanka-snabbt-och-langsamt.json | MEDEL — frö även: "System 1 System 2 thinking" |
| Misbehaving — Thaler | misbehaving.json | HÖG — frö även: "behavioral economics" |
| The Psychology of Money — Housel | the-psychology-of-money.json | MEDEL (jättesökt just nu) — "Psychology of Money lessons" HÖG |
| Your Money and Your Brain — Zweig | your-money-and-your-brain.json | HÖG |
| Market Mind Games — Shull | market-mind-games.json | HÖG |
| The Hour Between Dog and Wolf — Coates | the-hour-between-dog-and-wolf.json | HÖG — frö även: "trader biology cortisol testosterone" |
| Fooled by Randomness — Taleb | fooled-by-randomness.json | MEDEL |
| The Black Swan — Taleb | the-black-swan.json | LÅG (brett) — "black swan events investing" MEDEL |
| The Signal and the Noise — Silver | the-signal-and-the-noise.json | HÖG — frö även: "forecasting statistics" |
| Against the Gods — Bernstein (riskhistoria) | against-the-gods.json | HÖG |
| Irrational Exuberance — Shiller | irrational-exuberance.json | MEDEL |

**B5. Bubblor, kriser & finanshistoria**

| Engelskt frö | Kursfil | Long-tail |
|---|---|---|
| Manias, Panics, and Crashes — Kindleberger | manias-panics-and-crashes.json | HÖG — frö även: "Minsky moment" |
| Devil Take the Hindmost — Chancellor | devil-take-the-hindmost.json | HÖG |
| Extraordinary Popular Delusions — Mackay | extraordinary-popular-delusions.json | HÖG — frö även: "tulip mania" |
| The Great Crash 1929 — Galbraith | the-great-crash-1929.json | MEDEL |
| This Time Is Different — Reinhart & Rogoff | this-time-is-different.json | HÖG — frö även: "sovereign debt crises" |
| When Genius Failed — Lowenstein (LTCM) | when-genius-failed.json | HÖG |
| Origins of the Crash — Lowenstein | origins-of-the-crash.json | HÖG |
| Bull! A History of the Boom and Bust — Mahar | bull-a-history-of-boom-and-bust.json | HÖG |
| The Big Short — Lewis | the-big-short.json | MEDEL (film-driven sökvolym) — "Big Short CDO explained" HÖG |
| Fooling Some of the People All of the Time — Einhorn | fooling-some-of-the-people.json | HÖG — frö även: "Allied Capital short case" |

**B6. Redovisning, forensik & bolagsanalys-böcker**

| Engelskt frö | Kursfil | Long-tail |
|---|---|---|
| Financial Shenanigans — Schilit | financial-shenanigans.json | HÖG — frö även: "earnings manipulation detection" |
| Quality of Earnings — O'Glove | quality-of-earnings.json | HÖG |
| Creative Cash Flow Reporting — Mulford & Comiskey | creative-cash-flow-reporting.json | HÖG |
| Financial Statement Analysis and Security Valuation — Penman | financial-statement-analysis-and-security-valuation.json | HÖG (studentfrö: "Penman summary") |
| The Interpretation of Financial Statements — Graham | interpretation-of-financial-statements.json | MEDEL |
| Investment Valuation — Damodaran | investment-valuation.json | MEDEL — frö även: "Damodaran valuation", "valuation course" (world's known valuation teacher) |
| Valuation: Measuring and Managing — McKinsey/Koller | valuation-measuring-managing.json | HÖG — frö även: "value creation management", "McKinsey valuation" |
| Competition Demystified — Greenwald & Kahn | competition-demystified.json | HÖG — frö även: "barriers to entry", "competitive advantage" |

**B7. Företagsbygge, innovation & näringsliv**

| Engelskt frö | Kursfil | Long-tail |
|---|---|---|
| Zero to One — Thiel | zero-to-one.json | MEDEL — frö även: "monopoly business model" |
| Good to Great — Collins | good-to-great.json | MEDEL — "Good to Great hedgehog concept" HÖG |
| The Innovator's Dilemma — Christensen | the-innovators-dilemma.json | MEDEL — "disruptive innovation" MEDEL |
| Blue Ocean Strategy | blue-ocean-strategy.json | MEDEL |
| The Everything Store (Amazon) | the-everything-store.json | HÖG — frö även: "Amazon business model" |
| Shoe Dog (Nike) | shoe-dog.json | MEDEL |
| Made in America (Sam Walton/Walmart) | made-in-america.json | HÖG — frö även: "Walmart history" |

**B8. Svenska originalböcker — nischade /en-frön**

| Engelskt frö | Kursfil | Long-tail |
|---|---|---|
| (svenskt original) — nischfrö "fundamental analysis Sweden textbook" | foretagsvardering-med-fundamental-analys.json | LÅG på /en — behåll svensk |
| (svenskt original) — nischfrö "Swedish technical analysis (Torssell)" | teknisk-analys-med-johnny-torssell.json | LÅG på /en |
| (svenskt original) — "Swedish economy basics (Eklund)" | var-ekonomi.json | LÅG på /en |

### Grupp C — Teknisk analys, AK1TS-fördjupning (ts-*) · 25+ frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| Elliott Wave impulse pattern (5-wave) | Elliott Wave — 5-vågs impuls | ts-01-elliott-wave.json | HÖG |
| Elliott Wave correction (ABC) | Elliott Wave — 3-vågs korrektion | ts-02-elliott-wave.json | HÖG |
| multi-timeframe Elliott Wave analysis | Elliott Wave — multipla tidshorisonter | ts-22-elliott-wave.json | HÖG |
| Fibonacci retracement levels (38.2/50/61.8) | Fibonacci-retracements | ts-03-fibonacciretracements.json | HÖG |
| Fibonacci extensions (161.8/261.8) | Fibonacci-extensions | ts-04-fibonacciextensions.json | HÖG |
| Fibonacci time zones | Fibonacci-tidszoner | ts-19-fibonaccitidszoner.json | HÖG |
| Fibonacci confluence clusters | Fibonacci-kluster | ts-21-fibonaccikluster.json | HÖG |
| Gann angles (1×1, 2×1) | Gann-vinklar | ts-05-gannvinklar.json | HÖG |
| Gann cycles (60/20-year) | Gann-cyklar | ts-06-ganncyklar.json | HÖG |
| Lucas number series (timing) | Lucas-talserie | ts-07-lucastalserie.json | HÖG |
| volume analysis / volume confirms price | Volym-analys | ts-08-volymanalys.json | MEDEL — frö även "Wyckoff method", "on-balance volume (OBV)" ur beskrivningen |
| volume profile & VPOC | Volym-profiler — VPOC | ts-09-volymprofiler.json | HÖG ("volume profile trading") |
| candlestick patterns (Doji, Hammer, Engulfing, Morning Star) | Candlestick-mönster | ts-11-candlestickmonster.json | MEDEL (mycket sökt; "candlestick patterns explained" HÖG) |
| moving averages (50-day, 200-day) | Moving Averages | ts-12-moving-averages.json | MEDEL |
| golden cross / death cross | Golden/death cross (i beskrivningen) | ts-12-moving-averages.json | HÖG |
| RSI overbought oversold divergence | RSI | ts-13-rsi.json | MEDEL ("RSI divergence strategy" HÖG) |
| MACD indicator | MACD | ts-14-macd.json | MEDEL ("MACD histogram strategy" HÖG) |
| Bollinger Bands squeeze | Bollinger Bands | ts-15-bollinger-bands.json | MEDEL ("Bollinger Band squeeze" HÖG) |
| support and resistance | Stöd och motstånd | ts-16-stod-och-motstand.json | MEDEL |
| trendlines (how to draw) | Trendlinjer | ts-17-trendlinjer.json | HÖG ("how to draw trendlines") |
| chart patterns (head and shoulders, triangles) | Chart-mönster | ts-18-chartmonster.json | MEDEL |
| harmonic patterns (Gartley, Bat, Crab, Butterfly) | Harmoniska mönster | ts-20-harmoniska-monster.json | HÖG |
| Volume Spread Analysis (VSA) — Tom Williams | Volume Spread Analysis | ts-23-volume-spread-analysis-vsa.json | HÖG |
| order flow / reading the order book | Order Flow — marknadsdjup | ts-24-order-flow.json | HÖG ("order flow trading", "iceberg orders") |
| Market Profile / TPO / auction market theory | Market Profile | ts-25-market-profile.json | HÖG |
| AK1TS 25-cell matrix (5 theories × 5 horizons) | AK1TS 25-cellers matris | ts-10-ak1ts-25cellers-matris.json | LÅG (eget märkesord — kan byggas som unikt frö på sikt) |

### Grupp D — Beteendefinans (bf-* + km-beteende) · 18 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| availability bias / availability heuristic | Tillgänglighetsfälla / -heuristik | bf-01-tillganglighetsfalla.json, bf-06-tillganglighetsheuristik.json | MEDEL |
| sunk cost fallacy | Sunk cost | bf-02-sunk-cost.json | HÖG ("sunk cost fallacy examples") |
| mental accounting | Mental accounting | bf-03-mental-accounting.json | HÖG |
| anchoring bias | Ankareffekt | bf-05-ankareffekt.json, km-020-ankareffekt.json | MEDEL |
| recency bias | Recency bias (i bf-01 beskrivning) | bf-01-tillganglighetsfalla.json | HÖG |
| priming (unconscious influence) | Priming | bf-08-priming.json | HÖG |
| law of effect / reinforcement bias | Framstegseffekt | bf-07-framstegseffekt.json | HÖG ("law of effect behaviorism") |
| halo effect | Halo-effekt | bf-09-haloeffekt.json | MEDEL |
| Dunning-Kruger effect | Dunning-Kruger | bf-10-dunningkruger.json | HÖG |
| cognitive bias (complete list) | Kognitiv bias — komplett lista | bf-11-kognitiv-bias.json | MEDEL ("list of cognitive biases" — stor sökvolym) |
| loss aversion | Förlustaversion | km-018-forlustaversion.json | MEDEL |
| prospect theory (Kahneman & Tversky) | Prospect theory (i beskrivningen) | km-018-forlustaversion.json | HÖG |
| confirmation bias / confirmation trap | Bekräftelsefälla | km-019-bekraftelsefalla.json | MEDEL |
| herd mentality & FOMO | Flockbeteende | km-035-flockbeteende.json | MEDEL ("FOMO investing" HÖG) |
| overconfidence bias | Överconfidence | km-036-overconfidence.json | MEDEL |
| disposition effect | Disposition effect | km-037-disposition-effect.json | HÖG |
| status quo bias / framing | (i bf-11:s lista) | bf-11-kognitiv-bias.json | HÖG |
| behavioral finance education | beteendefinans (gruppletare i korpusens kw) | bf-* + km-018…037 | MEDEL |
| rule-based investing under stress | Investera som en robot | bf-04-investera-som-en-robot.json | HÖG ("rules-based investing") |

### Grupp E — Riskhantering & portföljteori · 16 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| position sizing | Position sizing | pf-02-position-sizing.json (+ km-017) | HÖG — globalt sökt bland traders |
| Kelly criterion | Kelly-kriteriet | km-017-position-sizing-kelly-kriteriet.json | HÖG ("Kelly criterion position sizing") |
| Value at Risk (VaR) | VaR — Value at Risk | km-031-var.json | MEDEL |
| portfolio stress testing | Stress-testing portföljen | km-032-stresstesting-portfoljen.json | HÖG |
| tail-risk hedging | Tail-risk hedging | km-033-tailrisk-hedging.json | HÖG |
| maximum drawdown analysis | Drawdown-analys | km-034-drawdownanalys.json | HÖG |
| volatility & standard deviation | Volatilitet & standardavvikelse | km-013-volatilitet-standardavvikelse.json | MEDEL |
| correlation & diversification | Korrelation & diversifiering | km-014-korrelation-diversifiering.json, pf-03-diversifiering.json | MEDEL |
| beta & CAPM | Beta & CAPM | km-015-beta-capm.json | MEDEL (studentfrö "CAPM explained" HÖG) |
| Sharpe ratio | Sharpe-kvot | km-016-sharpe-kvot.json | MEDEL ("what is a good Sharpe ratio" HÖG) |
| dilution risk / share emissions | Emission-risk — utspädning (TERP i beskrivningen) | rk-02-emissionrisk.json | HÖG — frö även "TERP calculation" |
| debt trap / interest coverage | Skuldfälla — räntetäckning | rk-03-skuldfalla.json | HÖG ("interest coverage ratio") |
| liquidity crisis (SVB, Credit Suisse) | Likviditetskris | rk-04-likviditetskris.json | HÖG ("SVB collapse explained") |
| duration risk / duration mismatch | Ränterisk — duration | rk-08-ranterisk.json | HÖG |
| fraud risk red flags (Wirecard, Enron) | Bedrägeri-risk | rk-11-bedrageririsk.json | HÖG ("accounting red flags") |
| black swan risk & antifragility | Black swan-risk | rk-12-black-swanrisk.json | MEDEL |

Övriga rk-frön (regulatory risk, currency risk, concentration risk, correlation
risk, cyclicality, GDPR/data risk, ESG risk) — alla MEDEL/HÖG som "…risk in
stocks"-varianter; filerna rk-05…rk-15.

### Grupp F — Redovisning & finansiella rapporter (km-001…km-026) · 14 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| how to read an annual report | Bokföringens grunder / årsredovisning | km-001-bokforingens-grunder.json | HÖG |
| management report / directors' report | Förvaltningsberättelsen | km-002-forvaltningsberattelsen.json | HÖG |
| cash flow statement analysis | Kassaflödesanalysen | km-003-kassaflodesanalysen.json | MEDEL |
| notes to the financial statements | Noter — den dolda informationen | km-004-noter.json | HÖG |
| retained earnings & dividends | Eget kapital & utdelningar | km-005-eget-kapital-utdelningar.json | MEDEL |
| quarterly earnings (Q1–Q4), seasonality, one-offs | Kvartalsrapporten | km-006-kvartalsrapporten.json | HÖG ("how to read quarterly reports") |
| goodwill & intangible assets | Goodwill och immateriella tillgångar | km-022-goodwill-och-immateriella-tillgangar.json | MEDEL |
| IFRS 16 lease accounting | Leasing — IFRS 16 | km-023-leasing.json | HÖG (IFRS-studentfrö) |
| segment reporting | Segmentrapportering | km-024-segmentrapportering.json | HÖG |
| pension obligations on balance sheet | Pensionsåtaganden | km-025-pensionsataganden.json | HÖG |
| related party transactions (red flags) | Relaterade parter | km-026-relaterade-parter.json | HÖG |
| depreciation methods (straight-line vs declining) | Avskrivningsprinciper | km-021-avskrivningsprinciper.json | MEDEL |
| earnings quality / accruals | (ur Quality of Earnings + km-003) | quality-of-earnings.json + km-003 | HÖG |
| financial statements course (gruppletare) | bokföring & årsredovisning (kw) | km-001…026 | MEDEL |

### Grupp G — Moat & konkurrensfördelar (v13–v15 + km-sektorer) · 12 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| economic moat | Moat (gruppletare i korpusens kw: "moat aktieanalys") | v13-patent-ip.json m.fl. | MEDEL — "types of economic moats" HÖG |
| patents & intellectual property | Patent & immateriella rättigheter | v13-patent-ip.json | HÖG |
| brand loyalty as moat | Varumärke & kundlojalitet | v14-varumarke.json | HÖG |
| network effects | Nätverkseffekter | v15-natverkseffekter.json | MEDEL (tech-sökvolym) |
| switching costs | (moat-terminologi i se-kurser) | km-038-techsektorn.json | HÖG |
| Rule of 40 (SaaS) | Rule of 40 (i km-038 + se-01 beskrivning) | se-01-saassektorn.json | HÖG |
| annual recurring revenue (ARR) / net retention | ARR-tillväxt | v02-arr-tillvaxt.json + se-01 | HÖG ("ARR vs MRR", "net revenue retention") |
| pharma pipeline valuation | Pipeline-värdering | km-039-pharmasektorn.json | HÖG |
| bank capital adequacy analysis | Kapitaltäckning | km-040-banksektorn.json | HÖG |
| real estate NAV & yield analysis | Fastighetsvärdering — direktavkastning, NAV | km-042-fastighetsektorn.json | HÖG |
| infrastructure moat / regulated returns | Infrastruktur-moat, reglerad avkastning | km-046/km-047 | HÖG |
| float moat (insurance) | Float-moat (i se-06 beskrivning) | se-06-finanssektorn.json | HÖG ("Buffett float insurance") |

### Grupp H — Utdelningsstrategi (ud-* + km-063…066) · 12 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| dividend yield | Direktavkastning | km-063-direktavkastning.json | MEDEL — "dividend yield explained" HÖG |
| value trap (high yield) | Hög yield = value trap (i beskrivningen) | km-063 + ud-04 | HÖG ("high dividend yield trap") |
| payout ratio | Payout ratio | ud-01-payout-ratio.json | MEDEL |
| dividend growth investing | Utdelnings-tillväxt | km-064-utdelningstillvaxt.json | HÖG |
| Dividend Aristocrats | Dividend Aristocrats | ud-03-dividend-aristocrats.json | HÖG |
| DRIP (dividend reinvestment plan) | DRIP — automatisk återinvestering | ud-05-drip.json | HÖG |
| ex-dividend date / record date | Ex-datum, record date | ud-07-utdelningskalender.json | MEDEL ("ex-dividend date meaning") |
| special dividends | Speciella utdelningar | ud-08-speciella-utdelningar.json | HÖG |
| dividend cuts warning signs | Utdelnings-fällor | ud-04-utdelningsfallor.json | HÖG ("dividend cut warning signs") |
| Dogs of the Dow strategy | Dogs of the Dow | km-065-dogs-of-the-dow.json | HÖG |
| dividends vs share buybacks | Utdelning vs återköp | km-066-utdelning-vs-aterkop.json, v20-aterekop-egna-aktier.json | MEDEL |
| Swedish dividend stocks | Svenska utdelnings-aktier | ud-06-svenska-utdelningsaktier.json | HÖG (unik kombination — svensk+engelsk målgrupp, expats) |

### Grupp I — Portföljhantering (pf-*) · 12 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| portfolio construction | Portfölj-byggande | pf-01-portfoljbyggande.json | MEDEL |
| rebalancing strategy | Rebalansering | pf-04-rebalansering.json | MEDEL ("portfolio rebalancing strategy" HÖG) |
| concentrated portfolio (5–10 stocks) | Koncentrerad portfölj | pf-11-koncentrerad-portfolj.json | HÖG |
| long/short hedging | Long/short — hedging | pf-10-longshort.json | HÖG |
| tax-loss harvesting | Tax-loss harvesting | pf-09-taxloss-harvesting.json | HÖG (US-terminologi; svensk 30-dagarsregel i kursen — notera landsdifferens) |
| crisis management / drawdown opportunity | Kris-hantering | pf-07-krishantering.json | HÖG ("what to do when market falls 30%") |
| ESG portfolio investing | ESG-portfölj | pf-13-esgportfolj.json | MEDEL |
| retirement investing (30+ years) | Pensionssparande | pf-14-pensionssparande.json | MEDEL |
| rule of 72 / compounding | Rule of 72, compounding (i beskrivningarna) | pf-06-aterinvestering.json, ud-02-aterinvestering.json | HÖG ("rule of 72 explained") |
| dividend income strategy | Utdelnings-strategi | pf-05-utdelningsstrategi.json | MEDEL |
| investment savings account vs brokerage (ISK) | ISK vs aktiedepå | pf-08-isk-vs-aktiedepa.json | HÖG men svensk nisch ("Swedish ISK account") |
| annual portfolio review | Årsrapportering — portfölj-review | pf-12-arsrapportering.json | HÖG |

### Grupp J — Optioner & derivat (km-059…062) · 6 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| options basics (calls & puts) | Options-grunder | km-059-optionsgrunder.json | MEDEL ("options trading for beginners" HÖG) |
| covered calls | Covered calls | km-060-covered-calls.json | HÖG ("covered call income strategy") |
| protective puts | Protective puts | km-061-protective-puts.json | HÖG |
| Black-Scholes model | Black-Scholes | km-062-blackscholes.json | MEDEL (studentfrö: "Black-Scholes formula explained" HÖG) |
| option premium / strike price / expiration | Premie, strike, förfall | km-059 (beskrivning) | MEDEL |
| options as portfolio insurance | (kopplad tail-risk-hedging) | km-033 + km-061 | HÖG |

### Grupp K — Makroekonomi (mk-* + km-054…058) · 14 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| GDP growth & recession | BNP och tillväxt | mk-01-bnp-och-tillvaxt.json | MEDEL ("recession indicators" HÖG) |
| unemployment & wage inflation (Phillips curve) | Arbetslöshet — Phillips | mk-02-arbetsloshet.json | HÖG ("Phillips curve explained") |
| trade balance & currencies | Handelsbalans — valuta | mk-03-handelsbalans.json | MEDEL |
| government bonds / treasury yields | Statsobligationer | mk-04-statsobligationer.json | MEDEL |
| geopolitics and stock markets | Geopolitik | mk-05-geopolitik.json | HÖG ("geopolitical risk investing") |
| quantitative easing & tightening (QE/QT) | Penningpolitik — QE och QT | mk-06-penningpolitik.json | HÖG |
| fiscal policy & government budget | Fiscal politik — statsbudget | mk-07-fiscal-politik.json | MEDEL |
| inverted yield curve (recession signal) | Omvänd yield curve | mk-08-omvand-yield-curve.json | HÖG ("inverted yield curve meaning") |
| deflation vs inflation | Deflation vs inflation | mk-09-deflation-vs-inflation.json | MEDEL |
| oil price as macro driver | Oljepris — makro-drivrutin | mk-10-oljepris.json | MEDEL |
| China's impact on global markets | Kina-ekonomin | mk-11-kinaekonomin.json | HÖG |
| interest rates & discount rates | Ränta — priset på pengar | km-054-ranta.json | MEDEL ("how interest rates affect stocks" HÖG) |
| inflation targeting (2% goal) / core inflation | Inflation — 2% målet, kärninflation | km-055-inflation.json | MEDEL |
| central bank policy tools / forward guidance | Centralbanker — styrränta, forward guidance | km-056-centralbanker.json | HÖG ("forward guidance meaning") |

### Grupp L — Sektoranalys (se-* + km-038…048) · 15 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| SaaS sector analysis | SaaS-sektorn | se-01-saassektorn.json | HÖG ("SaaS metrics for investors") |
| semiconductor industry (ASML monopoly) | Halvledar-sektorn | se-02-halvledarsektorn.json | HÖG |
| defense sector investing | Försvars-sektorn | se-03-forsvarssektorn.json | HÖG |
| logistics network effects (FedEx, UPS) | Logistik — nätverk | se-04-logistiksektorn.json, se-15-logistik.json | HÖG |
| luxury goods moats | Lyx-sektorn | se-05-lyxsektorn.json | HÖG |
| insurance float & asset management (AUM) | Finans-sektorn — försäkring | se-06-finanssektorn.json | HÖG |
| retail scale & e-commerce | Detailhandel | se-07-detailhandel.json | MEDEL |
| media & streaming economics | Media — innehåll och streaming | se-08-media.json | MEDEL |
| auto industry disruption & EVs | Bil — disruption och el | se-09-bil.json | MEDEL ("EV transition investing") |
| airline cycle & fuel costs | Flyg — cykel och bränsle | se-10-flyg.json | HÖG |
| crypto market risk | Krypto — extrem risk | se-11-krypto.json | MEDEL |
| gaming regulation & licensing | Spel — licens och regulation | se-12-spel.json | HÖG |
| education recurring revenue | Utbildning — återkommande intäkter | se-13-utbildning.json | HÖG |
| consumer staples & branding | Livsmedel — staplar och varumärke | se-14-livsmedel.json | MEDEL |
| GICS sector analysis (tech/pharma/bank/industri/real estate/energy/consumer/materials/telecom/utilities/healthcare) | km-038…048 (11 sektorkurser) | km-038…km-048 | MEDEL som "sector analysis" + HÖG per sektor |

### Grupp M — Case: svenska bolag (pc-*) · 20 frön

Mönster: engelskt frö = **"[Company] stock analysis case study"** — internationellt
söks stora svenska bolag av utländska investerare. Bolagsnamnen är redan engelska
i titlarna. Alla pc-filer: "Case: [bolag]".

| Engelsk nyckelfras | Kursfil | Long-tail |
|---|---|---|
| Atlas Copco stock analysis / case study | pc-01-case-atlas-copco.json | HÖG |
| AstraZeneca stock analysis (pharma pipeline) | pc-02-case-astrazeneca.json | MEDEL (globalt följt bolag) |
| Swedbank stock analysis (bank metrics) | pc-03-case-swedbank.json | HÖG |
| Investor AB stock analysis (NAV discount) | pc-04-case-investor-ab.json | HÖG |
| Volvo Group stock analysis (cyclical industrial) | pc-05-case-volvo-ab.json | MEDEL |
| H&M stock analysis (brand erosion case) | pc-06-case-hm.json | MEDEL |
| Sinch stock analysis (growth risk case) | pc-07-case-sinch.json | HÖG |
| Precise Biometrics full analysis course | pc-08-case-precise-biometrics.json | HÖG (småbolag — lägre konkurrens) |
| Novo Nordisk stock analysis (GLP-1 moat) | pc-09-case-novo-nordisk.json | MEDEL (jättesökt globalt) — "GLP-1 moat" HÖG |
| Ericsson stock analysis (5G cycle) | pc-10-case-ericsson.json | MEDEL |
| Boliden mining stock analysis | pc-11-case-boliden.json | HÖG ("mining stock analysis") |
| SKF industrial moat case | pc-12-case-skf.json | HÖG |
| SSAB steel niche (Hardox) case | pc-13-case-ssab.json | HÖG |
| Electrolux disruption case study | pc-14-case-electrolux.json | HÖG |
| Kambi tech niche case | pc-15-case-kambi.json | HÖG |
| Beijer Ref distribution moat case | pc-16-case-beijer-ref.json | HÖG |
| Sandvik premium pricing case | pc-17-case-sandvik.json | HÖG |
| Öresund investment company discount case | pc-18-case-oresund.json | HÖG (svensk nisch) |
| Höganäs iron powder monopoly case | pc-19-case-hoganas.json | HÖG |
| Essity inflation-protected moat case | pc-20-case-essity.json | HÖG |

Juridiknotis för M-gruppen: casen är **utbildningscase om metoden** ("så tillämpas
AKM1 på publika rapporter") — aldrig rekommendationer; samma vinkel behålls på /en
("case study, not advice").

### Grupp N — Svensk skatt & juridik (sj-* + km-049…053) · nischade 8 frön

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| Swedish corporate tax (20.6%) | Bolagsskatt 20,6% | km-049-bolagsskatt-206.json | HÖG (unik nisch: "Swedish corporate tax rate") |
| Swedish dividend tax (30%) | Utdelningsskatt 30% | km-050-utdelningsskatt-30.json | HÖG |
| Swedish capital gains tax | Kapitalvinstskatt | km-051-kapitalvinstskatt.json | HÖG ("Sweden capital gains tax for expats") |
| ISK account (investment savings account) | ISK — schablonskatt | km-052-isk.json | HÖG ("Swedish ISK vs regular account" — stor expat-fråga) |
| 3:12 rules (owner-managed companies) | 3:12-reglerna | km-053-312reglerna.json | LÅG på /en (rent svensk juridik — svensk sida) |
| capital insurance vs ISK | Kapitalförsäkring vs ISK | sj-05-kapitalforsakring-vs-isk.json | HÖG (expat-nisch) |
| withholding tax on foreign dividends | Utländsk källskatt | sj-01-utlandsk-kallskatt.json | HÖG ("withholding tax Sweden US dividends") |
| crypto tax rules Sweden | Crypto-beskattning | sj-02-cryptobeskattning.json | HÖG ("Sweden crypto tax") |
| annual general meeting & shareholder voting rights | Bolagsstämma och rösträtt | sj-03-bolagsstamma-och-rostratt.json | HÖG ("shareholder voting rights explained") |
| employee stock options taxation | Options-beskattning | sj-04-optionsbeskattning.json | HÖG ("employee stock options taxed") |

### Grupp O — AKM1-variabler & egna märkesord (v01–v20 + övriga) · 22 frön

AKM1:s 20 variabler har delvis engelska namn direkt i korpusen (P/S, P/B,
EV/EBITDA, ROE, ARR); resten får engelskt frö via standardterminologi.

| Engelsk nyckelfras | Svensk motsvarighet | Kursfil | Long-tail |
|---|---|---|---|
| revenue growth analysis | Försäljningstillväxt (V01) | v01-forsaljningstillvaxt.json | MEDEL ("revenue growth meaning") |
| revenue diversification | Intäktsdiversifiering (V03) | v03-intaktsdiversifiering.json | HÖG ("customer concentration risk" — släktfrö) |
| gross margin analysis | Bruttomarginal (V07) | v07-bruttomarginal.json | MEDEL ("good gross margin") |
| EBITDA margin | EBITDA-marginal (V08) | v08-ebitda-marginal.json | MEDEL |
| return on equity (ROE) | ROE (V09) | v09-roe.json | MEDEL — "DuPont ROE decomposition" HÖG |
| debt-to-equity ratio | Skuldsättningsgrad (V10) | v10-skuldsattningsgrad.json | MEDEL |
| quick ratio (acid test) | Likviditet — Kvick (V11) | v11-likviditet.json | HÖG ("quick ratio vs current ratio") |
| revenue stability / predictability | Intäktsstabilitet (V12) | v12-intaktsstabilitet.json | HÖG ("recurring revenue predictability") |
| product launches as catalysts | Produktlanseringar (V16) | v16-produktlanseringar.json | HÖG ("stock catalysts") |
| partnerships & deals as catalysts | Avtal & Partnerskap (V17) | v17-avtal-partnerskap.json | HÖG |
| regulatory catalysts | Regulatoriska katalysatorer (V18) | v18-regulatoriska.json | HÖG ("FDA approval stock catalyst" etc.) |
| cash burn rate & runway | Kapitalförbränning — runway (V19 + rk-01) | rk-01-kapitalforbranning.json, v19-kapitalforbranning.json | HÖG ("cash burn runway calculation") |
| share buybacks (value creation test) | Återköp av egna aktier (V20) | v20-aterekop-egna-aktier.json | MEDEL ("are buybacks good") |
| investment company NAV discount | Investmentbolag — NAV-rabatt | km-067-investmentbolag.json | HÖG ("NAV discount holding company") |
| active ownership (Wallenberg sphere) | Wallenberg-sfären — aktivt ägande | km-068-wallenbergsfaren.json | LÅG (svensk historik — svensk sida) |
| order book & price discovery | Orderbok och prissättning | km-069-orderbok-och-prissattning.json | HÖG ("how stock order books work") |
| choosing an online broker (Sweden) | Nätmäklare i Sverige | km-070-natmaklare-i-sverige.json | HÖG (expat-nisch "best broker Sweden") |
| business cycle sectors (cyclical vs defensive) | Konjunkturcykler — cykliska vs defensiva | km-057-konjunkturcykler.json | MEDEL |
| currencies and Swedish investments | Valutor — svag krona | km-058-valutor.json | HÖG ("weak SEK Swedish exporters") |
| AKM1 model (eget varumärke) | AKM1 — Den Kontroversiella Modellen | akm1-den-kontroversiella-modellen.json | LÅG (märkesord — byggs över tid) |
| AK1TS wave hierarchy (eget varumärke) | AK1TS — Våglärans Hierarki | ak1ts-vaglarans-hierarki.json | LÅG (märkesord) |
| confluence trading (value meets waves) | Konfluens — Där Värde Möter Vågor | konfluens-varde-moter-vagor.json | HÖG ("confluence trading strategy" — etablerat begrepp AK1A kan äga i kombination med value) |
| portfolio ecosystem (stock to portfolio) | Från aktie till portfölj — 5×5×4-ekosystemet | portfolj-ekosystemet.json | LÅG (eget ramverk — märkesord som växer) |
| wave fundamentals as time series | Vågfundament — Variablerna som Tidsserier | vagfundament-variablerna-som-tidsserier.json | LÅG (eget ramverk) |

---

## 5. Internationellt sökta begrepp — strategi för /en-sidorna

De tre största internationella sökklustren i korpusen, med redan färdiga
kurspar:

1. **DCF-familjen** (discounted cash flow → WACC → terminal value → reverse
   DCF). "Discounted cash flow" söks globalt i miljonklassen; long-tail-vinster
   finns på "reverse DCF" (A2), "WACC pitfalls" (A4) och "DCF for beginners".
   Kurserna km-007, km-008, km-028, vm-11 bildar en komplett /en-lärstig.
2. **Moat-vokabulären** (economic moat, network effects, switching costs,
   Rule of 40). Dorsey-boken (B1) + v13–v15 + G-gruppen gör AK1A kapabel att
   ranka på "types of economic moats" — en fras med hög utbildningsintention
   och låg rådgivningsrisk.
3. **Position sizing / Kelly** — trading-communityns eftersökta begrepp;
   pf-02 + km-017 + rk-09 (Kelly i beskrivningen) täcker det. "Kelly criterion
   position sizing" är en klassisk HÖG-long-tail.

Därutöver tre svenska nischfönster mot engelskspråkiga: **"Swedish ISK
account"**, **"Swedish dividend stocks"**, **"[bolag] stock analysis"** för
stora svenska bolag (N-grupp + M-grupp) — målgrupp: utlandsboende svenskar och
utländska investerare som studerar den svenska börsen. Formuleringen måste
förbli utbildande: "så analyserar man en svensk bankaktie" — aldrig "köp
Swedbank".

## 6. Topp-20 prioriterade /en-frön (sammanvägt volym × konkurrens × kursändamål)

1. discounted cash flow for beginners (A1)
2. reverse DCF (A2)
3. intrinsic value calculation (A5)
4. economic moat types (G1)
5. Kelly criterion position sizing (E1+E2)
6. margin of safety explained (A6)
7. EV/EBIT vs P/E (A8)
8. Shiller P/E CAPE ratio (A18)
9. Dividend Aristocrats list explained (H5)
10. Dogs of the Dow strategy (H11)
11. Bollinger Band squeeze (C17)
12. golden cross death cross (C15)
13. candlestick patterns explained (C11)
14. Elliott Wave theory basics (C1)
15. sunk cost fallacy investing (D2)
16. disposition effect (D15)
17. covered call income strategy (J2)
18. tax-loss harvesting rules (I5 — med svensk/varierad jurisdiktion-notis)
19. value trap high dividend (H2)
20. Swedish ISK account explained (N4)

## 7. Blanka/svaga frön (ärlighetsredovisning)

- **5 svenska bokoriginal** (B8) — inget engelskt sökfrö; behålls på svenska,
  länkas från /en med "Swedish canon"-förklaring.
- **AKM1/AK1TS/Konfluens-märkesorden** (O) — noll befintlig sökvolym; de
  tjänar som länktext och varumärkesbygge, inte som sökfrön.
- **km-053 3:12-reglerna, km-068 Wallenberg** — rent svenska fenomen; /en-sidor
  skulle bara förvirra. Prioriteras ej.
- Korpusens egna keywords-fält är 100 % svenska — om /en-sidorna ska bäras av
  JSON-metadata behövs kompletterande engelska keywords-fält i data/seo/kurser/
  (beslut till vågledaren, inte denna agent — jag rör inga filer utom min
  utdatafil).

## 8. Räkenskap

- Filer sonderade: **333/333** (100 %), 0 parselfel.
- Filreferenser i dokumentet: **333/333** (KVD-skript `.zcode/v138-s2-kvd.mjs`).
- Frön totalt: **~270** (A:27, B:105, C:26, D:19, E:16+, F:14, G:12, H:12,
  I:12, J:6, K:14, L:15, M:20, N:10, O:24 + sido-frön i long-tail-kolumnen).
- Fördelning HÖG/MEDEL/LÅG (huvudfrön): ca 55 % HÖG, 38 % MEDEL, 7 % LÅG.

## 9. Källor och reproducerbarhet

- Sondskript: `.zcode/v138-s2-sond.mjs` (struktur + engelska titlar +
  nyckelordsfrekvens) och `.zcode/v138-s2-sond2.mjs` (svenska titlar +
  beskrivningstermer). Körbara med `node` mot katalogen.
- Long-tail-graderingar är analytiska bedömningar baserade på begreppens
   etablering i internationell investeringslitteratur och sök-änden ("explained",
   "for beginners", "how to calculate") — inte på trafikdata; volymvalidering
   tillhör vågledarens nästa steg.

## 10. Juridikgrind (gäller allt ovan)

Alla frön och alla /en-formuleringar som byggs av denna inventering ska
ramas in som **utbildning i metodik** (2 kap 5 § lagen 2007:528): "så
fungerar diskonterade kassaflöden", "så läser man en balansräkning" — ALDRIG
"köp denna aktie" eller avkastningslöften. Bolagscasen (grupp M) är alltid
"case study på publicerade rapporter", aldrig rekommendation. Skatteinnehållet
(grupp N) är allmän utbildning om regelverket, inte skatterådgivning.

*Författat av våg 138 agent S2 — sökordsinventering sv/en/ar, 2026-09-14.*
