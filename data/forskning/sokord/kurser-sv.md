# Svensk sökordsinventering — kurskorpusen (333 kurser)

**Våg 138 · Subagent S1 · Datum 2026-09-14**
Källa: samtliga 333 JSON-filer i `data/seo/kurser/` (fält: `title`, `description`,
`keywords`). Extraherade svenska fält: kurstitlarnas svenska delar, beskrivningarna
(helt svenska) samt de svenska nyckelorden. Engelska boktitlar i gruppen bokmaster
är kursnamn — sökfröerna kring dem är titeln + svensk utbildningsmodifierare
("sammanfattning", "svenska", "recension", "förklarat").

**Juridikgrind (lagen 2007:528):** alla frågeformer nedan är informationella/
pedagogiska ("vad är X", "hur beräknar man X", "så fungerar X") — aldrig
investeringsråd. De får inte paraphraseras till "bör man köpa X".

---

## Täckningsredovisning (KVD)

| Grupp | Kursfamilj | Antal |
|---|---|---|
| km | Kunskapsmoduler (11 spår) | 70 |
| ovriga-bok | Bokmaster (bok-för-bok-kurser) | 103 |
| ts | Teknisk analys — AK1TS-fördjupning | 25 |
| pc | Praktiska case (svenska bolag) | 20 |
| v | AKM1-variablerna V01–V20 | 20 |
| pf | Portföljhantering | 14 |
| rk | Riskhantering | 15 |
| bf | Beteendefinans | 11 |
| vm | Värderingsmodeller | 11 |
| se | Sektoranalys | 15 |
| mk | Makroekonomi | 11 |
| ud | Utdelningsstrategi | 8 |
| sj | Skatt & juridik | 5 |
| ovriga-eko | AKM1/AK1TS-ekosystemkurser | 5 |
| **Summa** | | **333** |

Varje kurs finns som rad i sin grupptabell nedan. LT-betyg:
**S** = starkt long-tail-frö (låg konkurrens, tydlig pedagogisk frågeform),
**M** = medel (fungerar med modifierare), **Sv** = svagt/varumärkesord
(bygger märke, ingen existerande sökvolym).

---

## 0. Paraply- och klusterfrön (återkommer i keywords över hela korpusen)

| Nyckelfras | Förekomst | LT | Kommentar |
|---|---|---|---|
| lär dig aktieanalys | alla 333 filer | S | Paraplyfras, perfekt landningssida för nybörjarspåret |
| aktieanalys utbildning | härledd ur samtliga | S | Hög svensk avsikt, utbildningsformulerad |
| institutionell metodik | alla 333 | Sv | Intern differentiering, ej sökt — varumärkeston |
| AKM1 | alla 333 | Sv | Varumärkesord: noll volym idag, bygger ägarskap när trafiken kommer |
| AK1TS / ak1ts fördjupning | ts + ekosystem (30) | Sv | Som ovan |
| {spår} aktieanalys (t.ex. "värderingsmetoder aktieanalys", "beteendefinans aktieanalys", "sektoranalys aktieanalys") | 27 spårvarianter | S | Klusterfrön — ett per kunskapsspår, se grupperna nedan |
| bokmaster aktieanalys | 103 bokkurser | Sv | Intern term; byt mot "boksammanfattning aktier" i publika ytor |

---

## 1. Bokföring, årsredovisning & rapportläsning (km, 12 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| bokföringens grunder | km-001-bokforingens-grunder | M | "vad är debet och kredit" — grundfråga, medelkonkurrens |
| förvaltningsberättelsen | km-002-forvaltningsberattelsen | S | "vad står i förvaltningsberättelsen" — svensk rapportterm, låg konkurrens |
| kassaflödesanalysen | km-003-kassaflodesanalysen | S | "så läser du kassaflödesanalysen" — svensk standardterm |
| noter — den dolda informationen | km-004-noter | S | "vad står det i noterna årsredovisning" — nischad, stark |
| eget kapital & utdelningar | km-005-eget-kapital-utdelningar | M | "vart tar vinsten vägen" — pedagogisk vinkel |
| kvartalsrapporten | km-006-kvartalsrapporten | S | "så läser du en kvartalsrapport" — evighetsfråga per rapportperiod |
| avskrivningsprinciper | km-021-avskrivningsprinciper | S | "linjär vs degressiv avskrivning" — låg svensk konkurrens |
| goodwill och immateriella tillgångar | km-022-goodwill-och-immateriella-tillgangar | S | "vad är goodwill" — klassisk förklarafråga, stark |
| leasing IFRS 16 | km-023-leasing | S | "IFRS 16 förklarat" — regulatorisk nisch, stark |
| segmentrapportering | km-024-segmentrapportering | S | "vad avslöjar segmentnoten" — mycket låg konkurrens |
| pensionsåtaganden | km-025-pensionsataganden | S | "dolda skulder i pensionsnoter" — nischad, stark |
| relaterade parter | km-026-relaterade-parter | S | "red flags relaterade parter" — avancerad nisch, stark |

## 2. Värderingsmetoder (km 007–012, 027–030 + vm, 21 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| DCF — diskonterade kassaflöden | km-007-dcf | S | "hur fungerar en DCF-värdering" — evighetsfråga |
| WACC — vägd kapitalkostnad | km-008-wacc | S | "hur beräknar man WACC" — stark frågeform |
| P/E-tal djupdykning | km-009-pe | S | "vad är ett bra P/E-tal" — svensk favoritfråga |
| EV/EBIT | km-010-evebit | S | "EV/EBIT förklarat" — växande svenskt intresse |
| relativ värdering — peer comps | km-011-relativ-vardering | M | "jämföra multiplar mellan bolag" |
| Sum-of-the-Parts (SOTP) | km-012-sum-of-the-parts-sotp | S | "SOTP-värdering investmentbolag" — stark nisch |
| PEG-ratio | km-027-pegratio | M | "vad är PEG" — medel (engelsk term) |
| Reverse DCF | km-028-reverse-dcf | S | "vad implicerar aktiekursen" — avancerad, låg konkurrens |
| scenarioanalys | km-029-scenarioanalys | M | "tre scenarier sannolikheter värdering" |
| margin of safety | km-030-margin-of-safety | M | "säkerhetsmarginal Graham förklarat" |
| Grahams formel | vm-01-grahams-formel | S | "Grahams formel V = EPS × (8,5 + 2g)" — stark long-tail |
| intrinsic value (inneboende värde) | vm-02-intrinsic-value | M | "vad är inneboende värde" — bra svensk parallellterm |
| multipelval — när använda vilken | vm-03-multipelval | S | "P/E vs EV/EBITDA vs P/S" — jämförande fråga, stark |
| Shiller P/E (CAPE) | vm-04-cyklisk-justering | M | "CAPE-kvot förklarat" |
| realoptioner | vm-05-realoptioner | S | "värdera R&D som option" — akademisk nisch |
| Dividend Discount Model | vm-06-dividend-discount-model-ddm | M | "DDM Gordon growth svenska" |
| Free Cash Flow Yield | vm-07-free-cash-flow-yield | S | "FCY-avkastning förklarat" — Buffett-koppling |
| EV/Sales | vm-08-evsales | M | "när använda EV/Sales" |
| Price-to-Cash-Flow | vm-09-pricetocashflow | M | "P/CF vs P/E" |
| asset-based valuation | vm-10-assetbased-valuation | M | "liquidationsvärde substansvärde" — använd svenska termer |
| WACC-fällor | vm-11-waccfallor | S | "vanliga misstag med WACC" — expertnisch, stark |

## 3. Risk & portföljteori — kvantitativa mått (km 013–017, 031–034, 9 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| volatilitet & standardavvikelse | km-013-volatilitet-standardavvikelse | S | "vad är volatilitet aktier" — grundfråga, svensk term |
| korrelation & diversifiering | km-014-korrelation-diversifiering | S | "korrelation mellan aktier förklarat" — pedagogisk |
| beta & CAPM | km-015-beta-capm | M | "vad är beta aktie" — medel (mycket material) |
| Sharpe-kvot | km-016-sharpe-kvot | S | "Sharpe-kvot förklarat" — stark frågeform |
| position sizing & Kelly-kriteriet | km-017-position-sizing-kelly-kriteriet | S | "Kelly-kriteriet förklarat" — matematiknisch, stark |
| VaR — Value at Risk | km-031-var | M | "VaR 95 % konfidens betyder" |
| stress-testing portföljen | km-032-stresstesting-portfoljen | S | "stresstesta portföljen räntehöjning recession" |
| tail-risk hedging | km-033-tailrisk-hedging | M | "svansrisk optioner som försäkring" |
| drawdown-analys | km-034-drawdownanalys | S | "vad är drawdown" — traderterm, stark |

## 4. AKM1-variablerna V01–V20 (v, 20 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| försäljningstillväxt | v01-forsaljningstillvaxt | S | "omsättningstillväxt förklarat" — svensk term |
| ARR-tillväxt (återkommande intäkter) | v02-arr-tillvaxt | S | "vad är ARR SaaS" — stark tech-nisch |
| intäktsdiversifiering | v03-intaktsdiversifiering | S | "kundberoende risk" — nischad |
| P/S (Price-to-Sales) | v04-ps | M | "vad är P/S" |
| P/B (Price-to-Book) | v05-pb | M | "pris mot bokfört värde" — svensk formulering stark |
| EV/EBITDA | v06-ev-ebitda | M | "EV/EBITDA förklarat" |
| bruttomarginal | v07-bruttomarginal | S | "vad är bruttomarginal" — svensk standardterm, stark |
| EBITDA-marginal | v08-ebitda-marginal | S | "EBITDA-marginal bra nivå" |
| ROE (avkastning på eget kapital) | v09-roe | S | "vad är ROE" — top-fråga, "bra ROE" variant |
| skuldsättningsgrad | v10-skuldsattningsgrad | S | "bra skuldsättningsgrad" — stark svensk frågeform |
| kvickkvot / likviditet | v11-likviditet | S | "vad är kvickkvot" — svensk term, låg konkurrens |
| intäktsstabilitet | v12-intaktsstabilitet | S | "förutsägbara intäkter" — nischad |
| patent & immateriella rättigheter | v13-patent-ip | M | "patent som vallgrav" |
| varumärke & kundlojalitet | v14-varumarke | M | "varumärke som moat" |
| nätverkseffekter | v15-natverkseffekter | S | "vad är nätverkseffekter" — stark term |
| produktlanseringar (katalysator) | v16-produktlanseringar | M | "katalysatorer aktie" |
| avtal & partnerskap | v17-avtal-partnerskap | M | "kundavtal som katalysator" |
| regulatoriska katalysatorer | v18-regulatoriska | M | "godkännanden läkemedel aktie" |
| kapitalförbränning & emissionsrisk | v19-kapitalforbranning | S | "kapitalförbränning bolag" — brinnande svensk nisch (tillväxtbolag) |
| återköp av egna aktier | v20-aterekop-egna-aktier | S | "är aktieåterköp bra" — stark diskussionsfråga |

## 5. Teknisk analys — AK1TS (ts, 25 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| Elliott Wave 5-vågs impuls | ts-01-elliott-wave | M | "elliott vågteori grundmönster" |
| Elliott Wave 3-vågs korrektion | ts-02-elliott-wave | M | "zigzag flat triangle korrektion" |
| Fibonacci-retracements | ts-03-fibonacciretracements | M | "fibonacci retracement nivåer 38,2 61,8" |
| Fibonacci-extensions | ts-04-fibonacciextensions | M | "fibonacci prismål 161,8 %" |
| Gann-vinklar | ts-05-gannvinklar | S | "Gann 1x1 vinklar" — entusiastnisch, låg konkurrens |
| Gann-cyklar | ts-06-ganncyklar | S | "Gann 90-dagars cykel" — nisch |
| Lucas-talserie | ts-07-lucastalserie | S | "Lucas-tal som tidsindikator" — mycket smal, stark long-tail |
| volymanalys | ts-08-volymanalys | S | "volym bekräftar pris Wyckoff OBV" |
| volymprofiler VPOC | ts-09-volymprofiler | S | "Volume Profile Point of Control" — traderutbildningsnisch |
| AK1TS 25-cellers matris | ts-10-ak1ts-25cellers-matris | Sv | Egen metodik — varumärke |
| candlestick-mönster | ts-11-candlestickmonster | S | "doji hammer engulfing förklarat" — stark utbildningsfråga |
| moving averages (glidande medelvärden) | ts-12-moving-averages | M | "golden cross death cross 200-dagars" |
| RSI | ts-13-rsi | M | "RSI överköpt översålt" — svensk stavning konkurrerar lägre |
| MACD | ts-14-macd | M | "MACD förklarat svenska" |
| Bollinger Bands | ts-15-bollinger-bands | M | "bollinger band squeeze" |
| stöd och motstånd | ts-16-stod-och-motstand | S | "stöd och motstånd nivåer" — svensk term, stark |
| trendlinjer | ts-17-trendlinjer | S | "rita trendlinjer rätt" — pedagogisk fråga |
| chart-mönster | ts-18-chartmonster | M | "huvud och skuldror mönster" — svensk term stark |
| Fibonacci-tidszoner | ts-19-fibonaccitidszoner | S | "tidszoner 5 8 13 21 dagar" — smal nisch |
| harmoniska mönster | ts-20-harmoniska-monster | S | "Gartley Bat Crab Butterfly" — traderutbildning, stark |
| Fibonacci-kluster | ts-21-fibonaccikluster | S | "konvergerande fibonacci-nivåer" — mycket smal |
| Elliott Wave multipla tidshorisonter | ts-22-elliott-wave | M | "vågor på flera tidshorisonter" |
| Volume Spread Analysis (VSA) | ts-23-volume-spread-analysis-vsa | S | "Tom Williams VSA" — loyal nisch |
| Order Flow — marknadsdjup | ts-24-order-flow | S | "läsa orderboken iceberg-ordrar" — stark traderfråga |
| Market Profile | ts-25-market-profile | S | "TPO value area POC" — avancerad nisch |

## 6. Portföljhantering (pf, 14 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| portföljbyggande | pf-01-portfoljbyggande | S | "bygga aktieportfölj från grunden" — stark |
| position sizing | pf-02-position-sizing | M | "hur stor del per position max 5 %" |
| diversifiering | pf-03-diversifiering | M | "diversifiering förklarat" |
| rebalansering | pf-04-rebalansering | S | "rebalansera portfölj hur ofta" — praktisk fråga, stark |
| utdelningsstrategi | pf-05-utdelningsstrategi | S | "utdelningsstrategi pension" — stark kombination |
| återinvestering (compounding) | pf-06-aterinvestering | S | "rente-ränta-on-off i aktier" — svensk term, stark |
| krishantering | pf-07-krishantering | S | "vad gör man när börsen faller 30 %" — evighetsfråga |
| ISK vs aktiedepå | pf-08-isk-vs-aktiedepa | S | "ISK eller depå 2026" — svensk topplista-fråga, mycket stark |
| tax-loss harvesting | pf-09-taxloss-harvesting | S | "skatteskalpering svenska" — svensk term saknar konkurrens |
| long/short — hedging | pf-10-longshort | M | "hedga portföljen med put-optioner" |
| koncentrerad portfölj 5–10 bolag | pf-11-koncentrerad-portfolj | S | "Buffett få aktier djup förståelse" — debattfråga |
| årsrapportering — portföljreview | pf-12-arsrapportering | S | "årlig genomgång av aktierna" — rutinfråga |
| ESG-portfölj | pf-13-esgportfolj | M | "bygga hållbar aktieportfölj" |
| pensionssparande (IPS) | pf-14-pensionssparande | S | "IPS vs pensionsförsäkring" — svensk nisch, stark |

## 7. Riskhantering (rk, 15 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| kapitalförbränning — runway | rk-01-kapitalforbranning | S | "burn rate runway beräkna" |
| emissionsrisk — utspädning | rk-02-emissionrisk | S | "vad händer vid nyemission utspädning" — stark |
| skuldfälla | rk-03-skuldfalla | S | "räntetäckningsgrad farlig nivå" — svensk term |
| likviditetskris | rk-04-likviditetskris | S | "SVB Credit Suisse lärdomar" — nyhetsdriven, stark |
| cykelrisk | rk-05-cykelrisk | M | "cykliska bolag billiga vid toppen" |
| regulatorisk risk | rk-06-regulatorisk-risk | M | "AML-miljökrav bolag" |
| valutarisk | rk-07-valutarisk | S | "svag krona exportbolag" — svensk vinkel, stark |
| ränterisk — duration | rk-08-ranterisk | S | "duration mismatch förklarat" |
| koncentrationsrisk | rk-09-koncentrationsrisk | M | "för stor position en aktie" |
| korrelationsrisk | rk-10-korrelationsrisk | S | "allt faller samtidigt 2008" — pedagogisk |
| bedrägeririsk | rk-11-bedrageririsk | S | "Wirecard Enron red flags" — stark case-koppling |
| black swan-risk | rk-12-black-swanrisk | M | "svarta svanar antifragilitet" |
| GDPR och datarisk | rk-13-gdpr-och-datarisk | S | "GDPR-böter bolagsvärde" — oväntad korsning, låg konkurrens |
| ESG-risk | rk-14-esgrisk | M | "BP Deepwater 3M PFAS" |
| cykelrisk — konjunkturkänslighet | rk-15-cykelrisk | M | "cykelresistent portfölj" |

## 8. Beteendefinans (bf + km 018–037, 17 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| tillgänglighetsfälla (recency bias) | bf-01-tillganglighetsfalla | S | "varför minns vi senaste nyheten" — svensk term saknar konkurrenter |
| sunk cost | bf-02-sunk-cost | M | "sunk cost aktier" |
| mental accounting | bf-03-mental-accounting | M | "hus-pengar olika fickor" |
| investera som en robot | bf-04-investera-som-en-robot | S | "regler istället för känslor" — pedagogisk VR-fråga |
| ankareffekt | bf-05-ankareffekt + km-020-ankareffekt | S | "ankareffekt aktier snittpris" — stark |
| tillgänglighetsheuristik | bf-06-tillganglighetsheuristik | M | "lättillgänglig information viktas för högt" |
| framstegseffekt | bf-07-framstegseffekt | S | "ännu starkare svensk nisch än ovan |
| priming — omedvetna influenser | bf-08-priming | M | "priming beslut" |
| halo-effekt | bf-09-haloeffekt | S | "haloeffekt varumärke aktie" |
| Dunning-Kruger | bf-10-dunningkruger | M | "Dunning-Kruger investing" |
| kognitiv bias komplett lista | bf-11-kognitiv-bias | S | "lista biaser investerare" — samlingsfråga, stark |
| förlustaversion (prospect theory) | km-018-forlustaversion | S | "förlustaversion Kahneman" — stark |
| bekräftelsefälla (konfirmationsbias) | km-019-bekraftelsefalla | S | "konfirmationsbias aktier" — stark |
| flockbeteende (herd mentality, FOMO) | km-035-flockbeteende | S | "flockbeteende GameStop bitcoin" — nyhetsdriven |
| överconfidence | km-036-overconfidence | M | "90 % tror de slår marknaden" |
| disposition effect | km-037-disposition-effect | S | "sälja vinnare behålla förlorare" — stark formulering |

## 9. Utdelningsstrategi (ud + km 063–066, 12 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| payout ratio | ud-01-payout-ratio | M | "utdelningsgrad bra nivå" — svensk term stark |
| återinvestering av utdelning | ud-02-aterinvestering | S | "återinvestera utdelning kalkylator" |
| Dividend Aristocrats | ud-03-dividend-aristocrats | M | "25 år höjda utdelningar" |
| utdelningsfällor | ud-04-utdelningsfallor | S | "hög direktavkastning fälla" — stark varningsfråga |
| DRIP — automatisk återinvestering | ud-05-drip | M | "DRIP Sverige" |
| svenska utdelningsaktier | ud-06-svenska-utdelningsaktier | S | "bästa utdelningsaktier Sverige" — mycket stark svensk sökning |
| utdelningskalender | ud-07-utdelningskalender | S | "utdelningsdatum svenska bolag" — stark, återkommande trafik |
| speciella utdelningar | ud-08-speciella-utdelningar | S | "extra utdelning engångspost" — nisch |
| direktavkastning | km-063-direktavkastning | S | "vad är direktavkastning" — svensk klassiker, mycket stark |
| utdelningstillväxt | km-064-utdelningstillvaxt | S | "växande utdelning slår hög yield" |
| Dogs of the Dow | km-065-dogs-of-the-dow | M | "Dogs of the Dow strategin" |
| utdelning vs återköp | km-066-utdelning-vs-aterkop | S | "utdelning eller återköp bättre" — debattfråga |

## 10. Sektoranalys (se + km 038–048, 26 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| SaaS-sektorn (ARR, Rule of 40) | se-01-saassektorn | S | "Rule of 40 förklarat" — stark tech-nisch |
| halvledarsektorn (ASML) | se-02-halvledarsektorn | S | "halvledarbolag moat cykler" |
| försvarssektorn | se-03-forsvarssektorn | S | "försvarsbolag långa kontrakt" — het 2026, stark |
| logistiksektorn | se-04-logistiksektorn + se-15-logistik | M | "logistikbolag nätverk" |
| lyxsektorn | se-05-lyxsektorn | M | "lyxvarumärken konstgjord brist" |
| finanssektorn — försäkring | se-06-finanssektorn | S | "försäkringsbolag float-moat" |
| detailhandel — e-handel | se-07-detailhandel | M | "skala category killer" |
| media — streaming | se-08-media | M | "innehålls-moat Netflix Disney" |
| bilsektorn — el och disruption | se-09-bil | M | "biltillverkare elbilar kapitalintensiva" |
| flygsektorn | se-10-flyg | M | "flygbolag cykliska bränsle" |
| krypto — extrem risk | se-11-krypto | M | "krypto som tillgångsslag risker" |
| spelbranschen — licens | se-12-spel | S | "spelbolag licens-moat Kambi" — svensk börsnisch |
| utbildningssektorn — ARR | se-13-utbildning | S | "utbildningsbolag återkommande intäkter" |
| livsmedelssektorn | se-14-livsmedel | S | "livsmedelsbolag inflationsskydd" — svensk vinkel, stark |
| tech-sektorn (Rule of 40) | km-038-techsektorn | M | se se-01 |
| pharma-sektorn (pipeline) | km-039-pharmasektorn | S | "pipeline-värdering patent" — avancerad, stark |
| banksektorn (kapitaltäckning) | km-040-banksektorn | S | "analysera banker kapitaltäckning" — svensk relevant |
| industisektorn | km-041-industrisektorn | M | "industri-moat process skala" |
| fastighetssektorn (NAV, direktavkastning) | km-042-fastighetsektorn | S | "värdera fastighetsbolag NAV" |
| energisektorn | km-043-energisektorn | M | "olje majors förnybart" |
| konsumentsektorn | km-044-konsumentsektorn | M | "varumärke-moat e-handel" |
| materialsektorn | km-045-materialsektorn | M | "råvarucyklar bolag" |
| telekomsektorn | km-046-telekomsektorn | M | "infrastruktur-moat utdelning" |
| utilitysektorn | km-047-utilitysektorn | S | "monopol reglerad avkastning" — svensk/svensk term |
| hälsovårdssektorn (medtech) | km-048-halsovardsektorn | M | "medtech demografi regulatoriskt" |

## 11. Makroekonomi & ränta (mk + km 054–058, 16 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| BNP och tillväxt | mk-01-bnp-och-tillvaxt | M | "BNP recession aktier" |
| arbetslöshet (Phillips-kurvan) | mk-02-arbetsloshet | M | "arbetslöshet löneinflation" |
| handelsbalans | mk-03-handelsbalans | M | "export import valuta" |
| statsobligationer | mk-04-statsobligationer | S | "statsobligationer förklarat" — svensk term |
| geopolitik | mk-05-geopolitik | M | "krig sanktioner svenska bolag" |
| penningpolitik — QE och QT | mk-06-penningpolitik | S | "QE QT förklarat" |
| fiscal politik — statsbudget | mk-07-fiscal-politik | M | "statsbudget underskott stimulans" |
| omvänd yield curve | mk-08-omvand-yield-curve | S | "inverterad räntekurva recession" — stark fråga |
| deflation vs inflation | mk-09-deflation-vs-inflation | S | "deflation farligare Japan" |
| oljepris som makro-drivrutin | mk-10-oljepris | M | "oljepris inflation valutor" |
| Kina-ekonomin | mk-11-kinaekonomin | M | "Kina skulder globala marknader" |
| ränta — priset på pengar | km-054-ranta | S | "hur påverkar räntan aktier" — evighetsfråga, stark |
| inflation — 2 %-målet | km-055-inflation | S | "KPI kärninflation förklarat" |
| centralbanker (styrränta, forward guidance) | km-056-centralbanker | S | "Riksbanken styrränta mekanism" — svensk vinkel |
| konjunkturcykler | km-057-konjunkturcykler | S | "cykliska vs defensiva sektorer" — stark |
| valutor och svenska investeringar | km-058-valutor | S | "svag krona svenska bolag" — stark |

## 12. Svensk skatt & juridik (sj + km 049–053, 10 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| bolagsskatt 20,6 % | km-049-bolagsskatt-206 | S | "bolagsskatt Sverige 2026" — stark, svensk |
| utdelningsskatt 30 % | km-050-utdelningsskatt-30 | S | "skatt på utdelning" — top-fråga |
| kapitalvinstskatt | km-051-kapitalvinstskatt | S | "kapitalvinstskatt aktier 30/70" — stark |
| ISK — schablonskatt | km-052-isk | S | "hur fungerar ISK-skatten" — mycket stark |
| 3:12-reglerna | km-053-312reglerna | S | "3:12 reglerna gränsbelopp förklarat" — mycket stark svensk nisch |
| utländsk källskatt (W-8BEN) | sj-01-utlandsk-kallskatt | S | "källskatt USA-aktier W-8BEN" — stark |
| kryptobeskattning | sj-02-cryptobeskattning | S | "skatt på krypto Sverige" — mycket stark |
| bolagsstämma och rösträtt | sj-03-bolagsstamma-och-rostratt | S | "A- och B-aktier rösträtt" — stark grundfråga |
| optionsbeskattning (personaloptioner) | sj-04-optionsbeskattning | S | "personaloptioner beskattning kvalificerade" — smal, stark |
| kapitalförsäkring vs ISK | sj-05-kapitalforsakring-vs-isk | S | "KF eller ISK" — mycket stark svensk jämförelsefråga |

## 13. Options & derivat (km 059–062, 4 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| optionsgrunder (call/put, strike, premie) | km-059-optionsgrunder | S | "optioner för nybörjare" — stor fråga |
| covered calls | km-060-covered-calls | S | "sälja call-optioner inkomst" — stark strategifråga |
| protective puts | km-061-protective-puts | S | "försäkra aktier med put" — pedagogiskt, stark |
| Black-Scholes | km-062-blackscholes | M | "Black-Scholes formeln förklarat" |

## 14. Investmentbolag & svenska marknadsstrukturen (km 067–070, 4 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| investmentbolag — NAV-rabatt | km-067-investmentbolag | S | "NAV-rabatt investmentbolag" — svensk favorit, stark |
| Wallenberg-sfären | km-068-wallenbergsfaren | S | "Investor Industrivärden aktivt ägande" — mycket stark svensk nisch |
| orderbok och prissättning | km-069-orderbok-och-prissattning | S | "hur sätts aktiekursen" — grundfråga, stark |
| nätmäklare i Sverige | km-070-natmaklare-i-sverige | S | "välja nätmäklare courtage" — mycket stark, köpavsikt i utbildningsform |

## 15. Praktiska case — svenska bolag (pc, 20 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| case Atlas Copco | pc-01-case-atlas-copco | S | "fundamental analys Atlas Copco" — bolag+analys, stark |
| case AstraZeneca (pipeline) | pc-02-case-astrazeneca | S | "värdera AstraZeneca pipeline" |
| case Swedbank (bankmodell) | pc-03-case-swedbank | S | "analysera bankaktie Swedbank" |
| case Investor AB (NAV-rabatt) | pc-04-case-investor-ab | S | "Investor AB NAV-rabatt analys" |
| case Volvo AB (cykel + el) | pc-05-case-volvo-ab | S | "Volvo AB cyklisk analys" |
| case H&M (marginaler) | pc-06-case-hm | S | "H&M bruttomarginal analys" |
| case Sinch (kapitalförbränning) | pc-07-case-sinch | S | "Sinch utspädning risker" |
| case Precise Biometrics | pc-08-case-precise-biometrics | S | "småbolagsanalys alla 20 variabler" |
| case Novo Nordisk (GLP-1) | pc-09-case-novo-nordisk | S | "Novo Nordisk moat-analys" — het |
| case Ericsson (5G) | pc-10-case-ericsson | S | "Ericsson teknologirisk analys" |
| case Boliden (gruvor) | pc-11-case-boliden | S | "Boliden råvarucykel analys" |
| case SKF (industri-moat) | pc-12-case-skf | S | "SKF premium-moat analys" |
| case SSAB (Hardox-nisch) | pc-13-case-ssab | S | "SSAB nisch stålcykel" |
| case Electrolux (disruption) | pc-14-case-electrolux | S | "Electrolux varumärke hotat" |
| case Kambi (tech-nisch) | pc-15-case-kambi | S | "Kambi ARR-analys" |
| case Beijer Ref (compounder) | pc-16-case-beijer-ref | S | "Beijer Ref compounder-moat" |
| case Sandvik (verktyg) | pc-17-case-sandvik | S | "Sandvik premium-pris cykel" |
| case Öresund (deep value) | pc-18-case-oresund | S | "Öresund NAV-rabatt value trap" — stor svensk diskussion |
| case Höganäs (järnpulver-monopol) | pc-19-case-hoganas | S | "Höganäs monopol-nisch" |
| case Essity (hygienvaror) | pc-20-case-essity | S | "Essity inflationsskydd moat" |

*Case-blocket är korpusens starkaste SEO-täthet: 20 svenska storbolagsnamn ×
"analys/ fundamental analys / moat" = 60+ long-tail-kombinationer med köpstark
avsikt i utbildningsform ("så analyserar man X").*

## 16. AKM1/AK1TS-ekosystemet (5 kurser)

| Nyckelfras | Källfil | LT | Frågeform / motiv |
|---|---|---|---|
| AK1TS våglärans hierarki | ak1ts-vaglarans-hierarki | Sv | Egen metodik — momentum på 5 horisonter |
| AKM1 den kontroversiella modellen | akm1-den-kontroversiella-modellen | Sv | Varumärke; "AKM1-modellen" blir sökt när varumärket växer |
| konfluens — värde möter vågor | konfluens-varde-moter-vagor | Sv/M | "konfluens trading" finns som engelsk lånterm |
| från aktie till portfölj 5×5×4-ekosystemet | portfolj-ekosystemet | Sv | Egen struktur |
| vågfundament — variablerna som tidsserier | vagfundament-variablerna-som-tidsserier | Sv | Egen metodik |

## 17. Bokmaster — 103 bokbaserade kurser

Sökfrömönster: **titel + modifierare**. Bästa modifierare (frågeformer):
"sammanfattning", "svenska", "recension", "förklarat", "kurssammanfattning",
"viktiga lärdomar". Alla 103 källfiler finns i `data/seo/kurser/`.

### 16a. Värdeinvestering & Graham-traditionen (S-frön med "sammanfattning svenska")

| Nyckelfras | Källfil | LT |
|---|---|---|
| The Intelligent Investor — Graham sammanfattning | the-intelligent-investor | S |
| Security Analysis — Graham & Dodd | security-analysis | M |
| Margin of Safety — Klarman | margin-of-safety | M |
| The Dhandho Investor — Pabrai | the-dhandho-investor | M |
| The Little Book of Value Investing — Browne | the-little-book-of-value-investing | M |
| Value Investing From Graham to Buffett — Greenwald | value-investing-from-graham-to-buffett | M |
| Contrarian Investment Strategies — Dreman | contrarian-investment-strategies | M |
| The Acquirer's Multiple — Carlisle | the-acquirers-multiple | M |
| Quantitative Value — Gray & Carlisle | quantitative-value | M |
| Distress Investing — Whitman | distress-investing | S (smal nisch) |
| The Little Book That Beats the Market — Greenblatt | the-little-book-that-beats-the-market | S ("magiska formeln svenska") |
| You Can Be a Stock Market Genius — Greenblatt | you-can-be-a-stock-market-genius | M |
| Expectations Investing — Rappaport & Mauboussin | expectations-investing | M |
| What Works on Wall Street — O'Shaughnessy | what-works-on-wall-street | M |
| 100 Baggers — Mayer | 100-baggers | S ("100-baggers aktier") |
| One Up on Wall Street — Lynch | one-up-on-wall-street | S |
| Mina bästa investeringar — Peter Lynch | mina-basta-investeringar | S (svensk titel, stark) |
| Common Stocks and Uncommon Profits — Fisher | common-stocks-uncommon-profits | M ("scuttlebutt-metoden") |

### 16b. Buffett & Munger (starka personkopplade frön)

| Nyckelfras | Källfil | LT |
|---|---|---|
| The Essays of Warren Buffett — Cunningham | the-essays-of-warren-buffett | S |
| The Snowball — Schroeder om Buffett | the-snowball | S |
| The Warren Buffett Way — Hagstrom | the-warren-buffett-way | S |
| The Warren Buffett Portfolio — Hagstrom | the-warren-buffett-portfolio | M |
| Poor Charlie's Almanack — Munger | poor-charlies-almanack | S |
| Charlie Munger The Complete Investor — Griffin | charlie-munger-complete-investor | M |
| Of Permanent Value — Kilpatrick | of-permanent-value | M |
| The Outsiders — Thorndike (kapitalallokering) | the-outsiders | S ("kapitalallokering VD") |
| The Most Important Thing — Marks | the-most-important-thing | S ("första- och andranivåtänkande Marks") |
| Made in America — Sam Walton | made-in-america | M |
| Shoe Dog — Phil Knight | shoe-dog | M |
| The Everything Store — Brad Stone (Amazon) | the-everything-store | M |
| Zero to One — Peter Thiel | zero-to-one | S |
| Good to Great — Jim Collins | good-to-great | S |
| The Innovator's Dilemma — Christensen | the-innovators-dilemma | S ("disruptive innovation svenska") |
| Blue Ocean Strategy — Kim & Mauborgne | blue-ocean-strategy | S |
| Competition Demystified — Greenwald & Kahn | competition-demystified | M ("moat-vetenskap") |
| The Five Rules for Successful Stock Investing — Dorsey | the-five-rules-for-successful-stock-investing | M ("moatkällor Dorsey") |

### 16c. Räkenskapsanalys & redovisningstrick (starka utbildningsfrön)

| Nyckelfras | Källfil | LT |
|---|---|---|
| Financial Shenanigans — Schilit | financial-shenanigans | S ("red flags bokföringstricks") |
| Quality of Earnings — O'Glove | quality-of-earnings | M |
| Creative Cash Flow Reporting — Mulford & Comiskey | creative-cash-flow-reporting | S |
| Analysis for Financial Management — Higgins | analysis-for-financial-management | M |
| Financial Statement Analysis and Security Valuation — Penman | financial-statement-analysis-and-security-valuation | M |
| The Interpretation of Financial Statements — Graham | interpretation-of-financial-statements | M |
| Företagsvärdering med fundamental analys — Hjelström | foretagsvardering-med-fundamental-analys | S (svensk standardbok — "Hjelström företagsvärdering") |
| Principles of Corporate Finance — Brealey & Myers | principles-of-corporate-finance | M |
| Investment Valuation — Damodaran | investment-valuation | S ("Damodaran DCF svenska") |
| Valuation — McKinsey/Koller | valuation-measuring-managing | M |
| The Theory of Investment Value — Williams | the-theory-of-investment-value | M (nuvärdesformeln) |

### 16d. Bubblor, kriser & marknadshistoria (evighetsfrågor)

| Nyckelfras | Källfil | LT |
|---|---|---|
| Manias, Panics, and Crashes — Kindleberger | manias-panics-and-crashes | S ("Minsky-cykeln fem faser") |
| Extraordinary Popular Delusions — Mackay | extraordinary-popular-delusions | M (tulpanmanin) |
| Devil Take the Hindmost — Chancellor | devil-take-the-hindmost | M |
| The Great Crash 1929 — Galbraith | the-great-crash-1929 | S ("kraschen 1929 sammanfattning") |
| Bull! A History of Boom and Bust — Mahar | bull-a-history-of-boom-and-bust | M |
| Origins of the Crash — Lowenstein | origins-of-the-crash | M |
| Irrational Exuberance — Shiller | irrational-exuberance | S |
| A Random Walk Down Wall Street — Malkiel | a-random-walk-down-wall-street | S |
| This Time Is Different — Reinhart & Rogoff | this-time-is-different | M |
| When Genius Failed — Lowenstein (LTCM) | when-genius-failed | S ("LTCM sammanfattning") |
| The Big Short — Lewis | the-big-short | S ("the big short förklarat") |
| Liar's Poker — Lewis | liars-poker | M |
| Flash Boys — Lewis | flash-boys | M (HFT förklarat) |
| Fooling Some of the People — Einhorn (Allied Capital) | fooling-some-of-the-people | M |
| Against the Gods — Bernstein | against-the-gods | M (riskens historia) |
| The Alchemy of Finance — Soros (reflexivitet) | the-alchemy-of-finance | S ("reflexivitet Soros förklarat") |
| Stocks for the Long Run — Siegel | stocks-for-the-long-run | M |
| Winning the Loser's Game — Ellis | winning-the-losers-game | M |
| Common Sense on Mutual Funds — Bogle | common-sense-on-mutual-funds | S ("indexfonder avgifter aritmetik") |
| The Bogleheads' Guide to Investing | the-bogleheads-guide-to-investing | M |
| The Intelligent Asset Allocator — Bernstein | the-intelligent-asset-allocator | M |
| All About Asset Allocation — Ferri | all-about-asset-allocation | M ("allokering portföljens ödesbeslut") |
| Vår ekonomi — Klas Eklund | var-ekonomi | S (svensk standardbok i nationalekonomi) |

### 16e. Psykologi & beteende (starkt sökta författare)

| Nyckelfras | Källfil | LT |
|---|---|---|
| Tänka snabbt och långsamt — Kahneman | tanka-snabbt-och-langsamt | S (svensk titel + "sammanfattning" = volym) |
| The Psychology of Money — Housel | the-psychology-of-money | S |
| Misbehaving — Thaler | misbehaving | M |
| Fooled by Randomness — Taleb | fooled-by-randomness | S |
| The Black Swan — Taleb | the-black-swan | M |
| Your Money and Your Brain — Zweig | your-money-and-your-brain | M |
| The Hour Between Dog and Wolf — Coates | the-hour-between-dog-and-wolf | M (kortisol testosteron trading) |
| Market Mind Games — Shull | market-mind-games | M |
| The Money Game — Adam Smith | the-money-game | M |
| The Signal and the Noise — Silver | the-signal-and-the-noise | M |
| Reminiscences of a Stock Operator — Lefèvre | reminiscences-of-a-stock-operator | S ("Livermore lärdomar") |

### 16f. Trading & teknisk analys (bokbaserad)

| Nyckelfras | Källfil | LT |
|---|---|---|
| Teknisk analys med Johnny Torssell | teknisk-analys-med-johnny-torssell | S (SVENSKT STANDARDVERK — mycket starkt svenskt frö) |
| Technical Analysis of the Financial Markets — Murphy | technical-analysis-financial-markets | M |
| Technical Analysis of Stock Trends — Edwards & Magee | technical-analysis-of-stock-trends | M |
| The Visual Investor — Murphy | the-visual-investor | M |
| Intermarket Analysis — Murphy | intermarket-analysis | S ("intermarket analys förklarat") |
| Japanese Candlestick Charting — Nison | japanese-candlestick-charting | S (candlestickets fader) |
| Encyclopedia of Chart Patterns — Bulkowski | encyclopedia-of-chart-patterns | M (mönsterstatistik) |
| Bollinger on Bollinger Bands — Bollinger | bollinger-on-bollinger-bands | S |
| Elliott Wave Principle — Frost & Prechter | elliott-wave-principle | M |
| Fibonacci Applications and Strategies for Traders — Fischer | fibonacci-applications | M |
| The New Science of Technical Analysis — DeMark | the-new-science-of-technical-analysis | M |
| Martin Pring on Market Momentum — Pring | martin-pring-on-market-momentum | M |
| Trading for a Living — Elder | trading-for-a-living | S |
| Come Into My Trading Room — Elder | come-into-my-trading-room | M |
| The Master Swing Trader — Farley | the-master-swing-trader | M |
| Trading in the Zone — Douglas | trading-in-the-zone | S (tradingpsykologi klassiker) |
| Market Wizards — Schwager | market-wizards | S |
| The Complete TurtleTrader — Covel | the-complete-turtletrader | M |
| Way of the Turtle — Faith | way-of-the-turtle | M |
| The Trend Following Bible — Abraham | the-trend-following-bible | M |
| The Art of Short Selling — Staley | the-art-of-short-selling | S ("kortförsäljning mekanik förklarat") |
| How to Make Money in Stocks — O'Neil (CAN SLIM) | how-to-make-money-in-stocks | S ("CAN SLIM förklarat") |

---

## Toppfynd: de 25 starkaste svenska long-tail-fröna (prioriterad lista)

1. **vad är direktavkastning** (km-063) — svensk klassiker, evighetstrafik
2. **ISK vs aktiedepå** (pf-08) — svensk topplista-jämförelse, köpnära
3. **3:12-reglerna förklarat** (km-053) — mycket stark svensk nisch
4. **kapitalförsäkring vs ISK** (sj-05) — beslutsfråga, hög konvertering
5. **hur fungerar schablonskatten på ISK** (km-052)
6. **svenska utdelningsaktier** (ud-06) — listintention, stor svensk volym
7. **utdelningskalender svenska bolag** (ud-07) — återkommande trafik
8. **välja nätmäklare i Sverige** (km-070) — köpavsikt i utbildningsform
9. **skatt på krypto** (sj-02) — stor och växande svensk fråga
10. **källskatt USA-aktier W-8BEN** (sj-01) — smal men konverteringsstark
11. **Wallenberg-sfären / Investor AB NAV-rabatt** (km-068, pc-04) — svensk ägarskap nisch
12. **NAV-rabatt investmentbolag** (km-067, pc-18) — svensk favoritdiskussion
13. **hur påverkar räntan aktierna** (km-054) — evighetsfråga med svensk vinkel
14. **cykliska vs defensiva sektorer** (km-057) — pedagogisk jämförelse
15. **så läser du en kvartalsrapport / årsredovisning** (km-006, km-002) — rapporttrafik 4×/år
16. **vad är goodwill** (km-022) — förklarafråga med svensk volym
17. **hur beräknar man WACC** (km-008) — student + praktiker
18. **vad är en bra skuldsättningsgrad / kvickkvot** (v10, v11) — svenska termer, låg konkurrens
19. **kapitalförbränning och utspädning** (v19, rk-02) — tillväxtbolagstillgång, het nisch
20. **tax-loss harvesting / skatteskalpering** (pf-09) — svensk term oexploaterad
21. **Tänka snabbt och långsamt sammanfattning** (bok) — svensk titel + hög volym
22. **Teknisk analys Johnny Torssell** (bok) — svenskt standardverk, svag konkurrens
23. **magiska formeln svenska** (Greenblatt-boken) — strategiöversättning, stark
24. **fundamental analys {svenskt bolag}** (pc-01…20) — 20 bolag × analysfrö, mycket stark matris
25. **förlustaversion / konfirmationsbias aktier** (km-018/019) — psykologi + svenska termer

## Strategiska observationer

1. **Svenskhet är moaten.** De starkaste fröna är antingen ren svenska termer
   (kvickkvot, direktavkastning, förvaltningsberättelse, skatteskalpering) eller
   svenska strukturer (3:12, ISK, Wallenberg, nätmäklare, svenska bolagscase).
   Engelska termer (RSI, MACD, DCF) konkurrerar globalt — vinn med "+ förklarat
   på svenska" och utbildningsdjup.
2. **Case-matrisen är en long-tail-maskin:** 20 svenska bolagsnamn × {fundamental
   analys, moat, värdering, risker} ger 60–80 sidor med köpnär avsikt, i
   utbildningsform ("så går en AKM1-analys av X tillvägs") — juridiskt säkert.
3. **Frågeformernas tre klasser:** (a) *vad är X* (förklara — km/vm/v-blocket),
   (b) *hur gör man X* (göra — rapportläsning, ISK, beräkningar), (c) *X vs Y*
   (jämföra — ISK/depå, KF/ISK, utdelning/återköp, deflation/inflation).
   Alla tre kan mappas mot kurslandningssidor utan att närma sig rådgivning.

---

## Metod & reproducerbarhet

- Sondskript: `.zcode/tmp/s1-dump-kurser.mjs` (läser alla 333 JSON:er, grupperar
  på filnamnsprefix, skriver T/D/K-sammanställning). Kördes 2026-09-14.
- LT-betygen är analytiska bedömningar (termens svenskhet, frågeformsbarhet,
  uppskattad konkurrens) — inte mätta sökvolymer; volymvalidering är nästa steg
  (S2–S9:s sv/en/ar-jämförelser + ev. sökordsdata-leverantör beslutas av styrelsen).
- Källor: `data/seo/kurser/*.json` (333 filer, fälten title/description/keywords).

*Slut på inventeringen — våg 138 S1.*
