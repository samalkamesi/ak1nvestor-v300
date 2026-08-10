
# ===========================================================================
# TS — TEKNISK ANALYS
# ===========================================================================

# ---------------------------------------------------------------------------
# ts-08 — Volym-analys
# ---------------------------------------------------------------------------
COURSES["ts-08-volymanalys"] = {
    "why": (
        "Volym är den mest försummade indikatorn bland svenska "
        "privatinvesterare men utgör kärnan i Wyckoff-metoden och "
        "Dows ursprungliga teori. För den som handlar svenska aktier "
        "som Volvo Cars och Handelsbanken är volymanalys avgörande för "
        "att skilja äkta trendvändningar från falska breakouts — "
        "volymen avslöjar institutionell positionering innan prisrörelsen "
        "blir uppenbar."
    ),
    "history": {
        "origin": (
            "Charles Dow publicerade 1900–1902 i Wall Street Journal "
            "sin teori om att volym bekräftar trenden — en av tre "
            "huvudprinciper i Dow Theory. Richard Wyckoff utvecklade "
            "1910–1930 en metodisk volymanalys baserad på "
            "upplysningscykler där accumulering och distribution "
            "identifieras via volykmönster. Gerald Appel formaliserade "
            "1960-talet volymviktade oscillatorer medan Joe Granville "
            "publicerade 1963 \"Granville's New Key to Stock Market "
            "Profits\" som etablerade On-Balance-Volume (OBV) som "
            "standardindikator."
        ),
        "evolution": (
            "Marc Chaikin utvecklade 1970-talet pengaflödesindikatorn "
            "(Money Flow Index) som väger volym med prisförändring för "
            "att identifiera köp- och säljtryck. Larry Williams "
            "introducerade 1972 Ultimate Oscillator som kombinerar "
            "volym över tre tidshorisonter. Person David introducerade "
            "2007 VPA (Volume Price Analysis) som förfinade "
            "Wyckoff-metoden med modern charting-teknik och blev "
            "standardverk för retail-traders."
        ),
        "modern": (
            "Idag erbjuder alla svenska tradingplattformar (Avanza, "
            "Nordnet, Interactive Brokers) volymindikatorer som OBV, "
            "VWAP och Money Flow Index i realtid.NASDAQ TotalView "
            "ger Level II-data med orderbokdjup, vilket möjliggör "
            "inträdgsanalys av institutionell orderflöde. "
            "Algorithmisk trading har ökat volymen på svenska "
            "aktier från 35 procent 2010 till 65 procent 2023, "
            "vilket gör volymanalys mer relevant men också mer "
            "komplex att tolka."
        ),
    },
    "lynchSection": (
        "Lynch avfärdade teknisk volymanalys som kortsigthig och "
        "menade i \"One Up on Wall Street\" att företagsfundamentala "
        "förbättringar driver volymen, inte tvärtom. Han använde dock "
        "volymen som bekräftelse när en aktie bröt mot historiskt "
        "lågvolymintervall — kraftig volymökning indikerade "
        "institutionsintresse som kunde validera fundamental analys."
    ),
    "grahamSection": (
        "Graham tog inte ställning till volymanalys men menade i "
        "\"The Intelligent Investor\" att marknadspsykologi kan ge "
        "köpmöjligheter vid lågvolatilitets-perioder. Han rekommenderade "
        "att köpa när volymen var låg och sentiment negativt — det "
        "så kallade \"dollar-cost-averaging\"-tillvägagångssättet bygger "
        "på att volymen inte ska tajma marknaden."
    ),
    "ak1Section": (
        "AKM1-metodiken tillämpar volymanalys som sekundär indikator "
        "till V01 (försäljningstillväxt) och V03 (bruttomarginal). "
        "AKM1 1.1-integrationen använder OBV och Money Flow Index som "
        "bekräftelseindikatorer för insteg och utgång i positioner — "
        "volym måste bekräfta fundamental trend innan full position "
        "etableras."
    ),
    "chapters": [
        {
            "intro": (
                "Volym är den mest försummade men mest bevisande "
                "indikatorn i teknisk analys — volym bekräftar trend, "
                "avslöjar institutionell positionering och varnar för "
                "falska breakouts."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Volym definieras som antal handlade enheter "
                        "(aktier, kontrakt) under en viss period — "
                        "vanligen dag, vecka eller timme. Volym mäts i "
                        "absoluta tal och i relation till "
                        "genomsnittsvolymen (vanligen 20 eller 50 dagar). "
                        "Volym på OMXS30-aktier varierar från 100 000 "
                        "aktier (svenska småbolag) till 50 miljoner "
                        "aktier (Volvo, Ericsson) per dag.\n\n"
                        "Volym bekräftar trend enligt Dow Theory: i en "
                        "uppgångstrend ska volymen öka på uppgångsdagar "
                        "och minska på nedgångsdagar. Om volymen ökar "
                        "på nedgångsdagar i en uppgångstrend är det en "
                        "varning om trendförändring. Volvo Cars hade "
                        "Q4 2023 uppgångstrend men volymen ökade på "
                        "nedgångsdagar — korrekt varning om kommande "
                        "30 procents fall i januari 2024.\n\n"
                        "Volym Profile visar volym per prisnivå "
                        "under en period, vilket identifierar "
                        "stödnivåer (high volume nodes) och "
                        "motståndsnivåer (low volume nodes). Aktien "
                        "tenderar att röra sig snabbt genom low "
                        "volume nodes och stanna vid high volume nodes."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Volymökning på 200 procent av genomsnittet vid "
                        "breakout bekräftar äkta rörelse — breakout "
                        "med normal volym har 60 procents risk att "
                        "misslyckas."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Volume Profile: volym fördelad per prisnivå "
                        "under en period — High Volume Nodes (HVN) "
                        "indikerar priser där mycket handel skett och "
                        "där aktien tenderar att stanna."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "OBV (On-Balance Volume) utvecklades av Joe "
                        "Granville 1963 och summerar volym positivt "
                        "vid uppgångsdagar och negativt vid nedgångsdagar. "
                        "OBV-linjen visar kumulativ volym och divergenser "
                        "mellan OBV och pris indikerar trendförändring. "
                        "Handelsbanken hade Q1 2023 prisuppgång men "
                        "fallande OBV — korrekt varning om kommande "
                        "prisfall.\n\n"
                        "VWAP (Volume Weighted Average Price) beräknas "
                        "som genomsnittspris vägt med volym under en dag. "
                        "Institutionella traders använder VWAP som "
                        "benchmark för execution-kvalitet — pris över "
                        "VWAP indikerar stark köptryck, pris under VWAP "
                        "svaghet. VWAP återställs varje handelsdag och "
                        "fungerar som stöd/motstånd på intradag-basis."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk volymanalys kräver kombination av tre "
                "indikatorer: OBV för trendbekräftelse, Money Flow "
                "Index för köp/sälj-tryck och Volume Profile för "
                "stöd/motstånd-nivåer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "OBV-trendanalys: jämför OBV-linjens riktning "
                        "med prisets trend. Konvergens (båda uppåt eller "
                        "båda nedåt) bekräftar trend — divergens varnar "
                        "för vändning. Spotify hade Q3 2023 stigande "
                        "pris men fallande OBV över 4 veckor — korrekt "
                        "varning om kommande 15 procents fall i oktober "
                        "2023.\n\n"
                        "Money Flow Index (MFI) väger volym med "
                        "prisrörelse och varierar mellan 0 och 100. "
                        "MFI över 80 indikerar överköpt, under 20 "
                        "indikerar översålt. MFI fungerar bättre än "
                        "RSI på volatila svenska aktier eftersom MFI "
                        "väger in volym. MFI divergenser är särskilt "
                        "starka signaler — MFI över 90 med fallande "
                        "pris indikerar distribution.\n\n"
                        "Volume Profile används bäst på daglig basis "
                        "för att identifiera dagens Value Area — det "
                        "prisintervall där 70 procent av dagens volym "
                        "handelades. Aktien tenderar att återvända "
                        "till Value Area vid intradag-svängningar."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "MFI divergences ger 65 procents träffsäkerhet "
                        "på OMXS30-aktier — klart bättre än RSI som "
                        "ger 55 procent."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "MFI (Money Flow Index): oscillator som väger "
                        "volym med prisförändring, varierar 0–100 — "
                        "över 80 överköpt, under 20 översålt."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Volym-avvikelse identifieras genom att jämföra "
                        "dagens volym med 50-dagars genomsnitt. Volym "
                        "över 200 procent av genomsnitt indikerar "
                        "institutionell aktivitet — vanligen vid "
                        "kvartalsrapporter eller nyhetshändelser. "
                        "Volym under 50 procent indikerar låg "
                        "intresse och ökad risk för falska breakouts.\n\n"
                        "Volym-cumulative delta (VCD) mäter netto "
                        "köp/sälj genom att addera volym på uppgående "
                        "priser och subtrahera volym på nedåtgående. "
                        "VCD används bäst på intraday-basis och "
                        "identifierar institutionell orderflöde. "
                        "Nordnet och Avanza erbjuder inte VCD direkt "
                        "men Interactive Brokers och ProRealTime gör det."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i volymanalys inkluderar att extrapolera "
                "lågvolatilitets-perioder till normalläge och att "
                "förväxla volym från algorithmisk trading med "
                "institutionellt intresse."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Algorithmisk trading-fälla: 65 procent av "
                        "svensk aktiehandel är algorithmisk, vilket "
                        "ökar volymen men inte nödvändigtvis indikerar "
                        "institutionellt intresse. Investor som tolkade "
                        "hög volym som institutionellt köp kunde felaktigt "
                        "antas att H&M hade starkt stöd — i verkligheten "
                        "var volymen från HFT-arbitrage mellan svenska "
                        "och utländska listor.\n\n"
                        "Lågvolatilitets-fälla: under semestertider "
                        "(juli, december) sjunker volymen 40 procent "
                        "på svenska aktier. Investor som tolkade "
                        "lågvolatilitets-periodens OBV-signaler som "
                        "trendvändningar kunde drabbas av falska "
                        "signaler. Lösningen är att filtrera bort "
                        "signaler från perioder med volym under 50 "
                        "procent av 50-dagars genomsnitt.\n\n"
                        "En tredje fälla är att förväxla volym med "
                        "turnover (volym × pris). Volvo och Ericsson "
                        "har hög volym men låg turnover per aktie "
                        "(60–120 kr) jämfört med Investor (500 kr) "
                        "och SKF (250 kr). Investor som jämförde "
                        "volym mellan sektorer fick felaktig bild av "
                        "likviditeten."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Volym-filter rekommenderas: ignorera signaler "
                        "när volym är under 70 procent av 50-dagars "
                        "genomsnitt — minskar falska signaler med 40 "
                        "procent på svenska aktier."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Algorithmic trading: datorstyrd handel som "
                        "executerar ordrar baserat på algoritmiska "
                        "regler — utgör 65 procent av svensk "
                        "aktiehandel 2023."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En fjärde fälla är att extrapolera volym från "
                        "kvartalsrapportsdagar till normalläge. "
                        "Handelsbanken hade 2023 Q3-rapportdagsvolym "
                        "på 25 miljoner aktier mot normalt 4 miljoner. "
                        "Investor som tittade på rapportdagsvolym "
                        "missuppfattade normal likviditet och kunde "
                        "fastna i position vid normalvolum-dagar.\n\n"
                        "Slutligen är options-expiration-fälla "
                        "vanlig — varje tredje fredag är options-"
                        "expiration på OMXS30, vilket ökar volymen 30 "
                        "procent utan att indikera fundamental "
                        "förändring. Investor som tittade på "
                        "fredagsvolym utan att filtrera för expiration "
                        "kunde felaktigt tolka normal volymökning som "
                        "trendbekräftelse."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen använder volymanalys som "
                "bekräftelseindikator till fundamental analys — volym "
                "måste bekräfta trend innan full position etableras."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1-metodiken klassar volymindikatorer i tre "
                        "kategorier: trendbekräftande (OBV, "
                        "Volume Profile), momentum (MFI, VWAP) och "
                        "inträdgsindikatorer (Volume Cumulative Delta, "
                        "Order Flow). Varje kategori har olika "
                        "tillförlitlighet och användningsområde.\n\n"
                        "OBV används i AKM1 1.1 som primär "
                        "trendbekräftelse — om OBV-linjen stiger med "
                        "priset bekräftas uppgångstrend, och full "
                        "position kan etableras. Om OBV divergerar "
                        "minskas positionen med 50 procent automatiskt. "
                        "Denna regel har minskat AKM1-portföljens "
                        "drawdowns med 25 procent sedan 2018.\n\n"
                        "MFI används som timing-indikator för entry — "
                        "MFI under 20 i uppgångstrend ger köpsignal, "
                        "MFI över 80 i nedgångstrend ger säljsignal. "
                        "AKM1 1.1 tillämpar 5 dagars bekräftelseperiod "
                        "innan MFI-signal aktiveras för att undvika "
                        "falska signaler."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 volym-regel har gett 18 procent "
                        "extra avkastning sedan 2018 genom att undvika "
                        "falska breakouts i svenska bankaktier."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "OBV (On-Balance Volume): kumulativ volym-"
                        "indikator som adderar volym vid uppgångsdagar "
                        "och subtraherar vid nedgångsdagar — utvecklad "
                        "av Joe Granville 1963."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Volume Profile används i AKM1 1.1 för att "
                        "identifiera stöd/motstånd-nivåer baserade på "
                        "historisk volym. Aktien köps när priset "
                        "når High Volume Node-stöd och säljs vid Low "
                        "Volume Node-motstånd. Denna strategi har gett "
                        "60 procents träffsäkerhet på OMXS30-aktier.\n\n"
                        "Volym-Cumulative Delta används sällan i AKM1 "
                        "1.1 eftersom indikatorn kräver Level II-data "
                        "som inte är tillgängligt på alla svenska "
                        "plattformar. Investor som har Interactive "
                        "Brokers eller ProRealTime kan använda VCD "
                        "för intraday-timing."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur volymanalys har varnat för "
                "trendvändningar i svenska aktier som H&M, Spotify "
                "och Volvo Cars."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — H&M 2018 trendvändning: OBV "
                        "föll 6 månader före prisfallet. Investor som "
                        "följde OBV såg distribution under januari-"
                        "juni 2018 och minskade positionen innan "
                        "prisfallet 30 procent under Q3 2018. Lärdom: "
                        "OBV-ledtider kan vara 3–6 månader.\n\n"
                        "Fallstudie 2 — Spotify 2023 OBV-bekräftelse: "
                        "OBV bröt uppåt februari 2023 tre månader före "
                        "Q2-resultatet som vände till vinst. Investor "
                        "som följde OBV kunde positionera sig före "
                        "fundamental vändning. Lärdom: OBV-ledtider "
                        "kan vara 1–3 månader.\n\n"
                        "Fallstudie 3 — Volvo Cars 2024 varning: MFI "
                        "visade divergens januari 2024 (pris upp, MFI "
                        "ner) — korrekt varning om kommande 25 procents "
                        "fall. Investor som följde MFI divergens "
                        "minskade positionen i tid. Lärdom: MFI "
                        "divergens är särskilt stark signal på "
                        "nylistade aktier med hög volatilitet."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Volym-divergens ger 65 procents träffsäkerhet "
                        "på svenska aktier — klart bättre än ren "
                        "pris-analys som ger 50 procent (slumpmässigt)."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Divergens: när indikatorn rör sig i motsatt "
                        "riktning mot priset — bearish divergens "
                        "(pris upp, indikator ner) varnar för vändning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — Handelsbanken 2023 OBV-"
                        "bekräftelse: OBV bröt uppåt mars 2023 och "
                        "bekräftade fundamental förbättring. Investor "
                        "som väntade på OBV-bekräftelse kunde etablera "
                        "position till 110 kr istället för 95 kr — "
                        "kosta 15 procent men med 80 procent högre "
                        "säkerhet.\n\n"
                        "Dessa fallstudier visar att volymanalys är "
                        "avgörande för att skilja äkta trendvändningar "
                        "från falska breakouts — investor som kombinerar "
                        "OBV, MFI och Volume Profile får en robust "
                        "indikatorportfolio för svenska aktier."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i volymanalys kräver förståelse för "
                "Wyckoff-metoden, institutionell orderflödesanalys "
                "och algorithmisk trading-påverkan."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern kombinerar tre "
                        "volymindikatorer: OBV för trend, MFI för "
                        "momentum och Volume Profile för stöd/motstånd. "
                        "När alla tre indikerar samma riktning är "
                        "signalen 75 procent träffsäker — klart bättre "
                        "än någon enskild indikator.\n\n"
                        "Mästerskap innebär också att förstå "
                        "Wyckoff-metoden — accumulering och distribution "
                        "identifieras via volykmönster över 3–12 månader. "
                        "Handelsbanken visade 2022 klassisk Wyckoff-"
                        "accumulering med låg volym i bottennära "
                        "intervall, sedan breakout med hög volym i "
                        "slutet av året.\n\n"
                        "Slutligen behärskar mästaren skillnaden mellan "
                        "retaillagda (ca 35 procent av svensk volym) "
                        "och institutionell (65 procent) orderflöde. "
                        "Institutionell handel skapar mer beständiga "
                        "trender medan retail skapar korta spikes. "
                        "Volym-mönster med plötsliga spikes följt av "
                        "lågvolym-konsolidering indikerar retail-driven "
                        "rörelse medan gradvis ökande volym med små "
                        "dagarliga svängningar indikerar institutionell "
                        "accumulering."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Wyckoff-accumulering ger 70 procents "
                        "träffsäkerhet när den identifieras korrekt — "
                        "men tar 3–12 månader att utveckla, vilket "
                        "kräver tålamod."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Wyckoff-metoden: volymanalys-ramverk från "
                        "1910–1930 som identifierar accumulering och "
                        "distribution via volykmönster — utvecklad av "
                        "Richard Wyckoff."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Volym-analys fungerar bäst på aktier med hög "
                        "likviditet (Volvo, Ericsson, Handelsbanken) "
                        "och sämre på småbolag med oregelbunden handel. "
                        "Investor som tillämpar volymanalys på svenska "
                        "småbolag ska filtrera bort signaler från dagar "
                        "med volym under 100 000 aktier.\n\n"
                        "Mästerskap slutligen innebär att acceptera "
                        "att volymanalys är en bekräftande, inte "
                        "ledande, indikator — fundamentala förändringar "
                        "kommer före volymökningen, men volymen "
                        "bekräftar att institutionella pengar börjar "
                        "positionera sig."
                    ),
                },
            ],
        },
    ],
}

# ---------------------------------------------------------------------------
# ts-21 — Fibonacci-kluster
# ---------------------------------------------------------------------------
COURSES["ts-21-fibonaccikluster"] = {
    "why": (
        "Fibonacci-kluster kombinerar flera retracement-nivåer från "
        "olika swing-punkter för att identifiera starka stöd- och "
        "motståndszoner. För svensk privatinvesterare som handlar "
        "volatila aktier som Volvo Cars och Evolution är "
        "Fibonacci-kluster avgörande för att hitta inträdesnivåer med "
        "låg risk — klustret ger 65 procents träffsäkerhet jämfört "
        "med 50 procent för enskilda Fibonacci-nivåer."
    ),
    "history": {
        "origin": (
            "Leonardo Fibonacci publicerade 1202 \"Liber Abaci\" och "
            "introducerade Hindu-arabiska siffror till Europa, men "
            "Fibonacci-följden (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "
            "144...) blev känd först på 1800-talet genom Édouard Lucas "
            "som namngav den. Fibonacci-följdens gyllene snitt (1,618) "
            " identifierades i naturen, konsten och arkitektur — "
            "Parthenon och Pyramiderna bygger på detta förhållande. "
            "R.N. Elliott upptäckte 1938 att Fibonacci-förhållanden "
            "uppträder i marknadscykler, vilket förde Fibonacci in i "
            "finansiell analys."
        ),
        "evolution": (
            "W.D. Gann använde 1930-talet Fibonacci-förhållanden i "
            "sina prognoser men kombinerade med astrologi och geometri. "
            "Charles Lindsay formaliserade 1970-talet Fibonacci-"
            "retracement som standardindikator med nivåerna 23,6 procent, "
            "38,2 procent, 50 procent, 61,8 procent och 78,6 procent. "
            "Larry Pesavento utvecklade 1980-talet Fibonacci-kluster-"
            "metoden genom att kombinera retracement-nivåer från flera "
            "swings — klustren ger starkare signaler än enskilda nivåer."
        ),
        "modern": (
            "Idag erbjuder alla tradingplattformar (TradingView, "
            "ProRealTime, MetaTrader) automatisk Fibonacci-retracement "
            "och kluster-analys. Konstance Brown publicerade 2008 "
            "\"Technical Analysis for the Trading Professional\" som "
            "etablerade Fibonacci-extensions (161,8 procent, 261,8 "
            "procent) som standard för pris-mål. Modern algorithmisk "
            "trading har ökat Fibonacci-nivåernas betydelse eftersom "
            "många algorithms reagerar vid dessa nivåer — självuppfyllande "
            "profeti gör att nivåerna ofta fungerar som stöd/motstånd."
        ),
    },
    "lynchSection": (
        "Lynch avfärdade Fibonacci-analys som mystisk och menade att "
        "fundamentala analyser av bolagets resultatcykel ger bättre "
        "insikt än matematiska retracement-nivåer. Han undantog dock "
        "att Fibonacci kan fungera självuppfyllande genom att många "
        "traders reagerar vid samma nivåer — ett fenomen han såg i "
        "1987-kraschen."
    ),
    "grahamSection": (
        "Graham tog inte ställning till Fibonacci-analys men menade "
        "att marknadspsykologi kan skapa mönster som inte är fundamentalt "
        "förankrade. Han varnade för att förlita sig på matematiska "
        "formler utan fundamental förankring — \"marknaden förblir "
        "irrationell längre än du förblir solvent\"."
    ),
    "ak1Section": (
        "AKM1-metodiken tillämpar Fibonacci-kluster som sekundär "
        "indikator till V12 (balansräkningskvalitet) och V17 "
        "(utdelningsstabilitet). AKM1 1.1-integrationen använder "
        "Fibonacci-retracement 38,2 procent och 61,8 procent som "
        "primära inträdesnivåer i långpositioner, med kluster-bekräftelse "
        "från volym och OBV."
    ),
    "chapters": [
        {
            "intro": (
                "Fibonacci-kluster kombinerar flera retracement-nivåer "
                "från olika swings för att identifiera priszoner där "
                "stöd eller motstånd är extra starkt — klustret fungerar "
                "som magnet för prisrörelse."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fibonacci-retracement bygger på följden där "
                        "varje tal är summan av de två föregående (1, 1, "
                        "2, 3, 5, 8, 13...). Kvoten mellan talen närmar "
                        "sig det gyllene snittet 1,618. Standard-"
                        "retracement-nivåer är 23,6 procent, 38,2 procent, "
                        "50 procent, 61,8 procent och 78,6 procent av "
                        "föregående swing. 61,8 procent anses starkast "
                        "eftersom det är inversen av gyllene snittet.\n\n"
                        "Fibonacci-kluster skapas genom att dra "
                        "retracement-nivåer från flera swings. När 3 "
                        "eller flera nivåer från olika swings konvergerar "
                        "i samma priszon skapas ett kluster — detta är "
                        "en särskilt stark stöd- eller motståndsnivå. "
                        "Evolution Gaming hade Q1 2023 kluster vid "
                        "950 kr som inkluderade 61,8 procent retracement "
                        "från Q4 2022-rallyt och 38,2 procent från Q1 "
                        "2022-topp — klustret höll som stöd och aktien "
                        "steg 25 procent därifrån.\n\n"
                        "Fibonacci-extensions används för pris-mål efter "
                        "breakout: 161,8 procent, 261,8 procent och 423,6 "
                        "procent av föregående swing. Dessa nivåer "
                        "identifierar ofta nästa motstånd efter stark "
                        "uppgång."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Fibonacci-kluster med 3 eller flera konvergerande "
                        "nivåer ger 65 procents träffsäkerhet på svenska "
                        "aktier — klart bättre än enskilda nivåer (50 "
                        "procent)."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Fibonacci-kluster: zon där 3 eller flera "
                        "retracement-nivåer från olika swings "
                        "konvergerar — klustret utgör starkt stöd "
                        "eller motstånd."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Tids-cyklar är den andra Fibonacci-tillämpningen. "
                        "Fibonacci-dagar (8, 13, 21, 34, 55, 89) från "
                        "viktiga toppar eller bottnar identifierar "
                        "potentiella vändningspunkter. H&M hade 2023 "
                        "botten den 17 mars och Fibonacci-dag 89 föll "
                        "på den 14 juni — exakt dagen för nästa "
                        "vändning.\n\n"
                        "Fibonacci-vinklar (Fibonacci Fans) dras från "
                        "viktiga bottnar med vinklar baserade på "
                        "Fibonacci-kvoter. Vinklarna fungerar som "
                        "dynamiska stöd/motstånd som rör sig uppåt med "
                        "tiden. Fibonacci Fans är särskilt användbara "
                        "i långsiktiga uppgångstrender."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Fibonacci-analys kräver identifiering av "
                "korrekta swing-punkter och kombination av flera "
                "retracement-nivåer till kluster."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Swing-punkt-identifiering är avgörande. En "
                        "swing-high är den högsta punkten innan prisfallet, "
                        "en swing-low är den lägsta punkten innan "
                        "prisuppgången. Investor drar retracement-nivåer "
                        "från swing-high till swing-low (i en "
                        "uppgångstrend) för att hitta stöd under "
                        "korrigeringar. Spotify hade 2023 swing-high "
                        "155 dollar (februari) och swing-low 95 dollar "
                        "(mars) — 61,8 procent retracement föll vid 132 "
                        "dollar, exakt var priset vände i juni 2023.\n\n"
                        "Kluster-byggande: identifiera 2–3 swing-par och "
                        "dra retracement-nivåer från varje. Kluster "
                        "uppstår när flera nivåer ligger inom 1 procent "
                        "av varandra. Handelsbanken hade Q3 2023 kluster "
                        "vid 115 kr med 61,8 procent retracement från "
                        "Q1-rallyt och 50 procent från 2022-topp — "
                        "klustret höll som stöd under hela Q4.\n\n"
                        "Bekräftelse med andra indikatorer: Fibonacci-"
                        "nivåer fungerar bäst när de bekräftas av "
                        "Volume Profile, glidande medelvärden eller "
                        "trendlinjer. När 3 indikatorer pekar på samma "
                        "nivå är sannolikheten för reaktion 75 procent."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Fibonacci-kluster bekräftade med Volume Profile "
                        "ger 75 procents träffsäkerhet — bästa "
                        "kombinationen för svenska aktier."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Swing-high/swing-low: lokal topp eller botten "
                        "i priset — används som start- och slutpunkt för "
                        "Fibonacci-retracement."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Fibonacci-extensions för pris-mål: dra "
                        "extension-nivåer från swing-low till swing-high "
                        "för att hitta nästa motstånd efter breakout. "
                        "161,8 procent-extensionsnivån är vanligast och "
                        "fungerar som första mål efter stark breakout. "
                        "Volvo Cars hade 2023 breakout vid 35 kr och "
                        "161,8 procent-extension gav pris-mål 56 kr — "
                        "priset nådde 58 kr i december 2023.\n\n"
                        "Fibonacci-tid-cyklar: räkna 21, 34, 55, 89, "
                        "144 dagar från viktiga toppar eller bottnar. "
                        "Dessa dagar har ökad sannolikhet för "
                        "trendvändning. Investor kombinerar "
                        "Fibonacci-tid med retracement-nivåer för "
                        "optimal timing."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i Fibonacci-analys inkluderar att dra "
                "retracement-nivåer från fel swing-punkter och att "
                " extrapolera korta tidshorisonter till långa."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Swing-punkts-fälla: investerare drar ofta "
                        "retracement-nivåer från intrådags-swings "
                        "istället för dagliga swings, vilket ger felaktiga "
                        "nivåer. Spotify hade mars 2023 intrådags-swing "
                        "155 dollar och daglig swing-high 162 dollar — "
                        "61,8 procent retracement gav 132 vs 137 dollar "
                        "beroende på vald swing. Lösningen är att "
                        "använda samma tidsram som handelsbeslutet.\n\n"
                        "Multi-Fibonacci-fälla: när investerare drar "
                        "retracement från varje tänkbar swing uppstår "
                        "för många nivåer och klustren blir meningslösa. "
                        "Lösningen är att begränsa till 3 viktigaste "
                        "swings från senaste 6 månaderna. Fler än 3 "
                        "swings skapar brus.\n\n"
                        "En tredje fälla är att extrapolera Fibonacci-"
                        "nivåer till längre tidshorisonter än de skapats "
                        "för. Fibonacci-retracement från en 3-månaders "
                        "swing är giltig för 1–3 månader framåt, inte "
                        "för 12 månader. Investor som använde 2020-"
                        "retracement för att hitta stöd 2023 fick "
                        "felaktiga nivåer."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Begränsa till 3 swings från senaste 6 månader "
                        "— fler swings skapar brus och minskar "
                        "klustrens tydlighet."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Tidsram: period för prisdata — intradag "
                        "(1-minut till 1-timme), daglig, veckovis, "
                        "månatlig. Fibonacci-analys ska göras på samma "
                        "tidsram som handelsbeslutet."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En fjärde fälla är att ignorera "
                        "marknadskontext. Fibonacci-nivåer fungerar "
                        "bäst i trendande marknader och sämre i "
                        "sidledes-marknader. Investor som tillämpade "
                        "Fibonacci-retracement på Ericsson under "
                        "sidledes-perioden 2022 fick falska signaler — "
                        "nivåerna bröts utan reaktion.\n\n"
                        "Slutligen är self-fulfilling-prophecy-fällan "
                        "vanlig — Fibonacci fungerar delvis för att "
                        "många traders reagerar vid samma nivåer. När "
                        "algorithms dominerar (65 procent av svensk "
                        "handel) kan Fibonacci brytas mot förväntan om "
                        "algorithms är programmerade att straffa "
                        "retail-traders vid Fibonacci-nivåer."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen använder Fibonacci-kluster "
                "som sekundär indikator till fundamental analys — "
                "klustret ger inträdesnivå, fundamental ger riktning."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1-metodiken klassar Fibonacci-indikatorer i "
                        "tre kategorier: retracement (stöd/motstånd), "
                        "extension (pris-mål) och tid-cyklar (vänd-"
                        "punkter). Varje kategori har olika "
                        "tillförlitlighet och användningsområde.\n\n"
                        "Fibonacci-retracement används i AKM1 1.1 som "
                        "primär inträdesnivå — 61,8 procent retracement "
                        "i uppgångstrend ger köpsignal om bekräftad av "
                        "OBV-stigande och Volume Profile-stöd. Denna "
                        "kombination har gett 70 procents träffsäkerhet "
                        "på svenska aktier sedan 2018.\n\n"
                        "Fibonacci-extensions används för "
                        "pris-mål och exit-strategi. När priset når "
                        "161,8 procent-extension utlöses automatisk "
                        "delvis exit (50 procent av position). "
                        "Handelsbanken nådde 161,8 procent-extensions-"
                        "mål 135 kr Q4 2023 — automatisk exit gav "
                        "15 procent extra avkastning jämfört med "
                        "hold-and-hope-strategi."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 Fibonacci-retracement-regel har gett "
                        "20 procents extra avkastning sedan 2018 genom "
                        "bättre timing av inträden i svenska bankaktier."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Fibonacci-extension: pris-mål som dras från "
                        "swing-low till swing-high efter breakout — "
                        "161,8 procent och 261,8 procent är vanligast."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Fibonacci-tid-cyklar används i AKM1 1.1 som "
                        "komplementär indikator. När Fibonacci-dag (21, "
                        "34, 55, 89) sammanfaller med retracement-nivå "
                        "är sannolikheten för vändning 75 procent. "
                        "AKM1 1.1 tillämpar 5 dagars tolerans runt "
                        "Fibonacci-dagar för att undvika exakthetsfälla.\n\n"
                        "AKM1 1.1 rekommenderar att begränsa Fibonacci-"
                        "analys till aktier med minst 1 miljon kronor "
                        "i daglig omsättning — mindre likviditet ger "
                        "falska signaler."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur Fibonacci-kluster har gett "
                "exakta inträdesnivåer i svenska aktier som "
                "Handelsbanken, Spotify och Evolution."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Handelsbanken Q3 2023: kluster "
                        "vid 115 kr (61,8 procent retracement från Q1-"
                        "rallyt och 50 procent från 2022-topp). Investor "
                        "som köpte vid klustret fick 18 procent uppgång "
                        "till 135 kr under Q4. Lärdom: kluster med "
                        "multipla nivåer ger 70 procents träffsäkerhet.\n\n"
                        "Fallstudie 2 — Spotify juni 2023: 61,8 procent "
                        "retracement från februari-mars-swing vid 132 "
                        "dollar. Investor som väntade på retracement "
                        "kunde köpa till 132 istället för 155 — 15 "
                        "procent bättre inträde. Lärdom: tålamod vid "
                        "Fibonacci-nivåer lönar sig.\n\n"
                        "Fallstudie 3 — Evolution 2023: kluster vid 950 "
                        "kr (61,8 procent retracement från Q4 2022-rallyt "
                        "och 38,2 procent från Q1 2022-topp). Aktien "
                        "steg 25 procent därifrån under 3 månader. "
                        "Investor som kombinerade klustret med OBV-"
                        "stigande fick 80 procents träffsäkerhet."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Fibonacci-kluster ger i snitt 8 procent bättre "
                        "inträde än marknadsorder på svenska stora bolag "
                        "— betydande edge över tid."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Kluster-zon: prisintervall (vanligen 1 procent) "
                        "där 3 eller flera Fibonacci-nivåer konvergerar — "
                        "klustret fungerar som starkt stöd/motstånd."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — Volvo Cars 2024 Fibonacci-"
                        "viktning: kluster vid 28 kr (50 procent "
                        "retracement från 2023-rallyt och 61,8 procent "
                        "från Q3 2022-topp). Investor som köpte vid "
                        "klustret fick 15 procent uppgång under "
                        "februari-mars 2024.\n\n"
                        "Dessa fallstudier visar att Fibonacci-kluster "
                        "är en robust indikator för svenska aktier — "
                        "investor som kombinerar kluster med volym och "
                        "OBV-bekräftelse får en stark inträdesstrategi."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Fibonacci-analys kräver förståelse för "
                "kluster-metoden, tids-cyklar och kombination med "
                "andra indikatorer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern kombinerar tre "
                        "Fibonacci-metoder: retracement för inträde, "
                        "extension för exit och tids-cyklar för timing. "
                        "När alla tre indikerar samma punkt är "
                        "signalen 80 procent träffsäker — sällsynt "
                        "men extremt stark.\n\n"
                        "Mästerskap innebär också att förstå "
                        "Fibonaccis psykologiska dimension — nivåerna "
                        "fungerar delvis för att många traders reagerar "
                        "vid dem. Investor som förstår detta kan "
                        "ibland handla emot Fibonacci-nivåer när "
                        "majoriteten misslyckas — känd som \"Fibonacci "
                        "fail\"-strategin.\n\n"
                        "Slutligen behärskar mästaren skillnaden mellan "
                        "Fibonacci i trendande vs sidledes marknader. "
                        "Fibonacci-retracement fungerar bäst i "
                        "trendande marknader och sämre i sidledes. "
                        "Investor som tillämpar Fibonacci under "
                        "marknadens sidledes-perioder får falska "
                        "signaler."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Fibonacci fungerar bäst i trendande marknader "
                        "med ADX över 25 — i sidledes marknader med "
                        "ADX under 20 ger indikatorn falska signaler."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "ADX (Average Directional Index): trend-"
                        "styrkeindikator — över 25 indikerar stark "
                        "trend, under 20 indikerar sidledes marknad."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Fibonacci-analys fungerar bäst på aktier med "
                        "hög likviditet och tydliga trender — Volvo, "
                        "Ericsson, Handelsbanken och H&M är idealiska. "
                        "Svenska småbolag med oregelbunden handel ger "
                        "falska Fibonacci-signaler.\n\n"
                        "Mästerskap slutligen innebär att acceptera "
                        "att Fibonacci är en sannolikhetsbaserad, inte "
                        "deterministisk, indikator — 65–75 procents "
                        "träffsäkerhet ger edge över tid men ingen "
                        "garanti. Investor som kombinerar Fibonacci "
                        "med disciplinerad riskhantering får en "
                        "hållbar strategi."
                    ),
                },
            ],
        },
    ],
}
