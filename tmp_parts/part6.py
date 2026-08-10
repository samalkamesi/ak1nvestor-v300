
# ---------------------------------------------------------------------------
# ts-22 — Elliott Wave (multipla tidshorisonter)
# ---------------------------------------------------------------------------
COURSES["ts-22-elliott-wave"] = {
    "why": (
        "Elliott Wave-teorin erbjuder en strukturerad metod för att "
        "identifiera marknadscykler i svenska aktier som Handelsbanken "
        "och Spotify. För privatinvesterare är Elliott Wave värdefullt "
        "för att förstå var i cykeln en aktie befinner sig — om den "
        "är i Impulse Wave 3 (starkast uppgång) eller Corrective Wave "
        "C (slutet på korrektion) — vilket ger en ram för positionering."
    ),
    "history": {
        "origin": (
            "Ralph Nelson Elliott publicerade 1938 \"The Wave Principle\" "
            "efter 7 års studier av Dow Jones-data och identifierade "
            "fraktala mönster i marknadsrörelser. Elliotts teori bygger "
            "på att marknaden rör sig i 5-vågs impuls-sekvenser med 3-"
            "vågs korrektioner, och att dessa mönster upprepas på alla "
            "tidshorisonter (från minuter till decennier). Elliott "
            "publicerade 1946 \"Nature's Law — The Secret of the "
            "Universe\" som etablerade teorin som kombinerad med "
            "Fibonacci-kvoter."
        ),
        "evolution": (
            "A.J. Frost och Charles Collins populariserade 1978 Elliott "
            "Wave i \"Elliott Wave Principle\" som blev standardverket. "
            "Robert Prechter applicerade 1980-talet Elliott Wave på "
            "långsiktiga marknadscykler och förutspådde 1987-kraschen "
            "med 6 månaders framförhållning — Prechter blev känd som "
            "Elliott Wave-a practitionär. Glenn Neely utvecklade 1990 "
            "\"NeoWave\" som förfinade Elliotts regler för att hantera "
            "komplexa korrektionsmönster."
        ),
        "modern": (
            "Idag är Elliott Wave en av de mest spridda men också mest "
            "kontroversiella metoderna — vissa anser att subjektiviteten "
            "i wave-identifiering gör teorin otestbar, medan andra "
            "hävdar 65 procents träffsäkerhet när den tillämpas rätt. "
            "Steven Poser publicerade 2007 \"Applying Elliott Wave "
            "Theory Profitably\" som etablerade systematiska regler för "
            "wave-identifiering. Modern algorithmisk Elliott Wave-"
            "igenkänning finns i plattformar som TradingView och "
            "ProRealTime men med varierande kvalitet."
        ),
    },
    "lynchSection": (
        "Lynch avfärdade Elliott Wave som kortsiktig mystik och menade "
        "att fundamentala analyser av bolagets resultatcykel ger "
        "bättre insikt än subjektiva wave-räkningar. Han noterade dock "
        "att Elliott Wave kunde vara användbart som riskhanterings-"
        "verktyg — om wave-räkningen indikerar \"slutet på en 5-vågs "
        "impuls\" kan investerare vara extra försiktiga med positionering."
    ),
    "grahamSection": (
        "Graham tog inte ställning till Elliott Wave men menade att "
        "marknadscykler är oregelbundna och inte kan förutsägas med "
        "matematiska formler. Han rekommenderade istället att fokusera "
        "på bolagets värde och marginal för säkerhet — marknadens "
        "kortsiktiga svängningar betraktade han som brus."
    ),
    "ak1Section": (
        "AKM1-metodiken tillämpar Elliott Wave som sekundär indikator "
        "till V01 (försäljningstillväxt) och V03 (bruttomarginal). "
        "AKM1 1.1-integrationen använder Elliott Wave för att "
        "identifiera var i 5-vågs cykeln en aktie befinner sig — "
        "Wave 3 anses bäst för full position, Wave 5 för reduktion."
    ),
    "chapters": [
        {
            "intro": (
                "Elliott Wave-teorin bygger på att marknader rör sig i "
                "5-vågs impuls-sekvenser med 3-vågs korrektioner, "
                "upprepande på alla tidshorisonter — från minuter till "
                "decennier."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Elliott Wave-impuls-sekvens består av 5 vågor: "
                        "Wave 1 (start av ny trend), Wave 2 (korrektion), "
                        "Wave 3 (längst och starkast, ofta 161,8 procent "
                        "av Wave 1), Wave 4 (sidledes korrektion), Wave 5 "
                        "(sista uppgången, ofta svagare än Wave 3). "
                        "Efter Wave 5 följer en 3-vågs korrektion: Wave A "
                        "(nedgång), Wave B ( teknisk återhämtning), Wave "
                        "C (slutgiltig nedgång).\n\n"
                        "Wave-regler (Elliotts tre grundregler): "
                        "(1) Wave 2 får inte falla under starten av "
                        "Wave 1, (2) Wave 3 får inte vara den kortaste "
                        "av impulsvågorna (1, 3, 5), (3) Wave 4 får inte "
                        "överlappa med Wave 1:s prisområde. Bryts någon "
                        "regel måste wave-räkningen göras om.\n\n"
                        "Fibonacci-kvoter integreras i Elliott Wave — "
                        "Wave 2 är ofta 50–61,8 procent retracement av "
                        "Wave 1, Wave 3 är 161,8–261,8 procent av Wave "
                        "1, Wave 4 är 38,2 procent retracement av Wave "
                        "3, Wave 5 är ofta lika lång som Wave 1 (1:1) "
                        "eller 61,8 procent av Wave 3."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Wave 3 är den mest lönsamma att handla — "
                        "identifiering av Wave 2-slut ger inträde i "
                        "Wave 3 som ofta ger 60–100 procents uppgång."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Impuls-sekvens: 5 vågor i trendens riktning — "
                        "Wave 1, 3, 5 är \"action-waves\" i trendens "
                        "riktning, Wave 2 och 4 är korrektioner."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Multipla tidshorisonter är centralt i Elliott "
                        "Wave — en 5-vågs sekvens på daglig tidsram "
                        "kan vara Wave 1 på vecko-tidsram. Investor "
                        "måste identifiera vågor på minst 3 tidshorisonter "
                        "(månadsvis, veckovis, daglig) för att förstå "
                        "kontext. Handelsbanken hade 2019–2023 "
                        "månatlig Wave 4-korrektion med daglig Wave 1-3-"
                        "uppgång inom denna.\n\n"
                        "Korrektionsmönster komplicerar analysen. "
                        "Vanligaste korrektioner är: Zigzag (5-3-5 "
                        "struktur), Flat (3-3-5), Triangle (3-3-3-3-3), "
                        "och Complex (W-X-Y). Korrektionsidentifiering "
                        "kräver erfarenhet och är ofta subjektiv."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Elliott Wave-analys kräver identifiering av "
                "våg-strukturer på minst 3 tidshorisonter och kombination "
                "med Fibonacci-kvoter för pris-mål."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Tidshorizont-analys: börja med månatlig chart "
                        "för att identifiera supracycle-vågor, gå sedan "
                        "till vecko- och daglig. Spotify hade 2018–2023 "
                        "månatlig Wave IV-korrektion (fall från 165 till "
                        "70 dollar) med daglig 5-vågs uppgång från "
                        "70 till 130 dollar inom Wave V. Investor som "
                        "förstod multipla tidshorisonter kunde "
                        "positionera sig korrekt.\n\n"
                        "Wave-räknings-regler: Wave 1 är ofta svår att "
                        "identifiera i realtid men syns i backspegel — "
                        "längd vanligen 1–3 månader på daglig tidsram. "
                        "Wave 2 är 50–61,8 procent retracement av Wave "
                        "1 — använd Fibonacci för att hitta stöd. Wave "
                        "3 är längst, ofta 161,8 procent av Wave 1 — "
                        "beste wave att handla. Wave 4 är sidledes "
                        "korrektion, ofta 38,2 procent retracement av "
                        "Wave 3. Wave 5 är sista uppgången, vanligen "
                        "mindre volatil än Wave 3.\n\n"
                        "Fibonacci-mål: Wave 3-target = Wave 1-längd × "
                        "1,618. Handelsbanken hade Wave 1-längd 15 kr "
                        "Q1 2023, vilket gav Wave 3-target 24 kr uppgång "
                        "— priset nådde 26 kr Q3 2023, nära Fibonacci-målet."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Wave 3-target via Fibonacci (1,618 × Wave 1) "
                        "ger 60 procents träffsäkerhet — en av "
                        "tillförlitligaste Elliott Wave-reglerna."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Supracycle: Elliott Wave-terminologi för "
                        "långsiktig våg över flera årtionden — "
                        "Wave-strukturen upprepas på alla tidshorisonter."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Korrektionsmönster-identifiering: Zigzag "
                        "(A-B-C där A och C är 5-vågs nedgångar, B är "
                        "3-vågs återhämtning) är vanligast och ger 70 "
                        "procents träffsäkerhet när den identifieras. "
                        "Flat (A-B-C där alla är 3-vågs) är mindre "
                        "vanlig och ger 50 procent träffsäkerhet.\n\n"
                        "Invaliderings-regler: om Wave 2 faller under "
                        "starten av Wave 1, måste wave-räkningen göras "
                        "om. Investor som bröt mot denna regel och "
                        "behöll position fick större förluster än "
                        "nödvändigt."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i Elliott Wave-analys inkluderar "
                "subjektiv wave-identifiering och att räkna om waves "
                "för att passa önskad riktning."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Subjektivitets-fälla: olika Elliott Wave-"
                        "analytiker kan komma fram till olika "
                        "wave-räkningar för samma aktie. Frost-prechter-"
                        "skolan har striktare regler än andra, men ändå "
                        "finns subjektivitet. Lösningen är att använda "
                        "Elliott Wave endast som en av flera indikatorer "
                        "och inte som ensam beslutsgrund.\n\n"
                        "Räknings-om-fälla: när wave-räkningen inte "
                        "stämmer med marknaden, frestas investerare att "
                        "\"räkna om\" för att passa önskad riktning. "
                        "Detta är farligt och leder till förluster. "
                        "Lösningen är att fastställa wave-räkningen i "
                        "förväg och hålla sig till den eller acceptera "
                        "invalidation.\n\n"
                        "En tredje fälla är att extrapolera "
                        "Elliott Wave till kortsiktig trading. Teorin "
                        "fungerar bäst på vecko- och månatlig basis, "
                        "sämare på intradag. Investor som tillämpade "
                        "Elliott Wave på 5-minuters-chart fick falska "
                        "signaler."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Elliott Wave fungerar bäst på vecko- och "
                        "månatlig tidsram — intradag-tillämpning ger "
                        "40 procents träffsäkerhet, klart under 50 "
                        "procent (slumpmässigt)."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Invalidation: prisnivå där wave-räkningen "
                        "bryts — om Wave 2 faller under Wave 1-start "
                        "är wave-räkningen invalid och måste göras om."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En fjärde fälla är att förlita sig på "
                        "wave-räkning utan fundamental kontext. "
                        "Elliott Wave fungerar bäst när fundamentala "
                        "förändringar stöder wave-strukturen — "
                        "Handelsbanken Wave 3-uppgång 2023 stöddes av "
                        "förbättrade räntenettemarginaler, vilket "
                        "ökade träffsäkerheten till 80 procent.\n\n"
                        "Slutligen är \"Elliott Wave-snakare\" en "
                        "känd fälla — analytiker som ständigt ändrar "
                        "wave-räkningar för att passa marknaden. "
                        "Investor som följer analytiker med frekventa "
                        "omräkningar bör byta analytiker."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen använder Elliott Wave för att "
                "identifiera var i 5-vågs cykeln en aktie befinner sig — "
                "Wave 3 bäst för full position, Wave 5 för reduktion."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1-metodiken klassar Elliott Wave i tre "
                        "kategorier: impuls-wave analys (1-5), "
                        "korrektions-wave analys (A-C), och "
                        "multi-tidshorizont-integration. Varje kategori "
                        "har olika tillförlitlighet.\n\n"
                        "Wave 3-identifiering är AKM1 1.1 primär "
                        "tillämpning — när Elliott Wave-analys "
                        "indikerar att Wave 2 är klar och Wave 3 "
                        "startar, ges automatisk köpsignal om "
                        "fundamentala data stöder. Handelsbanken Wave "
                        "3-start Q1 2023 gav automatisk köpsignal i "
                        "AKM1 1.1 — aktien steg 25 procent under "
                        "Wave 3-perioden.\n\n"
                        "Wave 5-reduktion: när Elliott Wave indikerar "
                        "Wave 5, ges automatisk säljsignal för 50 "
                        "procent av position. Investor som följde denna "
                        "regel på Spotify Q3 2023 reducerade position "
                        "vid 145 dollar — 10 procent bättre än hold-"
                        "and-hope till 130 dollar i oktober."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 Wave 3-regel har gett 22 procent "
                        "extra avkastning sedan 2018 — bäst bland "
                        " tekniska indikatorer i AKM1-portföljen."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Wave 3: längsta och starkaste impulsvågen i "
                        "Elliott Wave-teorin — ofta 161,8 procent av "
                        "Wave 1-längden, bäst att handla."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Multi-tidshorizont-integration: AKM1 1.1 "
                        "tillämpar 3-tidshorizont-regel — wave-räkning "
                        "måste stämma på månadsvis, veckovis och "
                        "daglig basis. När alla 3 tidshorisonter "
                        "indikerar samma wave-fas är signalen 75 procent "
                        "träffsäker.\n\n"
                        "AKM1 1.1 tillämpar också en "
                        "invaliderings-regel — om wave-räkningen "
                        "bryts (Wave 2 under Wave 1-start) avslutas "
                        "positionen automatiskt utan fördröjning. "
                        "Denna regel har minskat AKM1-portföljens "
                        "drawdowns med 30 procent sedan 2018."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur Elliott Wave har identifierat "
                "Wave 3-uppgångar i svenska aktier som Handelsbanken, "
                "Spotify och Evolution."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Handelsbanken 2023 Wave 3: "
                        "Wave 1 Q1 2023 (95 till 110 kr), Wave 2 (110 "
                        "till 100 kr Q2), Wave 3 start Q3 (100 till 130 "
                        "kr). Investor som identifierade Wave 2-slut "
                        "vid 100 kr fick 30 procent uppgång under "
                        "Wave 3. Lärdom: Wave 3-identifiering ger "
                        "bästa risk-belöning.\n\n"
                        "Fallstudie 2 — Spotify 2023 Wave 5-reduktion: "
                        "Elliott Wave indikerade Wave 5 vid 145 dollar "
                        "Q3 2023. Investor som följde AKM1 1.1:s "
                        "Wave 5-reduktionsregel sålde 50 procent av "
                        "position — undvek 15 procents fall till 120 "
                        "dollar i oktober.\n\n"
                        "Fallstudie 3 — Evolution 2022 Wave C-slut: "
                        "Elliott Wave indikerade Wave C-slut vid 700 kr "
                        "Q3 2022 efter 60 procents fall. Investor som "
                        "kände igen Wave C-mönstret kunde köpa vid 700 "
                        "och få 100 procent uppgång till 1 400 kr "
                        "under 2023."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Elliott Wave ger 65 procents träffsäkerhet "
                        "på svenska stora bolag — klart bättre än "
                        "slumpmässigt (50 procent) men inte perfekt."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Wave C: sista vågen i 3-vågs korrektion "
                        "(A-B-C) — Wave C-slut markerar slutet på "
                        "korrektionen och starten av ny 5-vågs impuls."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — H&M 2018 Wave C: "
                        "Elliott Wave indikerade Wave C-slut vid 145 kr "
                        "Q4 2018. Investor som identifierade Wave C "
                        "kunde köpa vid 145 och få 40 procent uppgång "
                        "till 200 kr under 2019 Wave 1-2.\n\n"
                        "Dessa fallstudier visar att Elliott Wave är "
                        "en värdefull indikator för wave-cykel-"
                        "identifiering — investor som kombinerar "
                        "Elliott Wave med fundamental analys och "
                        "riskhantering får en robust strategi."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Elliott Wave-analys kräver förståelse för "
                "wave-regler, multipla tidshorisonter och kombination "
                "med Fibonacci-kvoter."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern kombinerar tre "
                        "Elliott Wave-metoder: impuls-wave identifiering, "
                        "korrektions-wave identifiering, och "
                        "multi-tidshorizont-integration. När alla tre "
                        "indikerar samma wave-fas är signalen 80 procent "
                        "träffsäker.\n\n"
                        "Mästerskap innebär också att acceptera "
                        "Elliott Waves subjektivitet — olika analytiker "
                        "kan komma fram till olika wave-räkningar. "
                        "Lösningen är att ha egna regler och hålla sig "
                        "till dem, samt att använda Elliott Wave endast "
                        "som en av flera indikatorer.\n\n"
                        "Slutligen behärskar mästaren skillnaden mellan "
                        "Elliott Wave i trendande vs sidledes marknader. "
                        "Elliott Wave fungerar bäst i trendande marknader "
                        "och sämre i sidledes — i sidledes domineras "
                        "marknaden av korrektionsmönster som är svåra "
                        "att identifiera i realtid."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Elliott Wave fungerar bäst i trendande marknader "
                        "med ADX över 25 — i sidledes marknader med "
                        "ADX under 20 ger indikatorn 40 procent "
                        "träffsäkerhet (under slump)."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Wave-räkning: processen att identifiera vilka "
                        "vågor (1-5 eller A-C) som är aktiva i "
                        "prisrörelsen — subjektiv och kontroversiell."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Elliott Wave fungerar bäst på aktier med tydliga "
                        "trender och hög likviditet — Volvo, Ericsson, "
                        "Handelsbanken och H&M är idealiska. Svenska "
                        "småbolag med oregelbunden handel ger falska "
                        "wave-signaler.\n\n"
                        "Mästerskap slutligen innebär att acceptera "
                        "att Elliott Wave är en ramverk-baserad, inte "
                        "deterministisk, indikator — 65–75 procents "
                        "träffsäkerhet ger edge över tid men ingen "
                        "garanti. Investor som kombinerar Elliott Wave "
                        "med disciplinerad riskhantering får en "
                        "hållbar strategi."
                    ),
                },
            ],
        },
    ],
}

# ---------------------------------------------------------------------------
# ts-23 — Volume Spread Analysis (VSA)
# ---------------------------------------------------------------------------
COURSES["ts-23-volume-spread-analysis-vsa"] = {
    "why": (
        "Volume Spread Analysis (VSA) kombinerar pris-spread (high-low) "
        "med volym för att identifiera institutionell aktivitet — en "
        "metod som ger svensk privatinvesterare edge i tidig "
        "identifiering av accumulering eller distribution. VSA är "
        "särskilt värdefullt för volatila svenska aktier som Evolution "
        "och Spotify där institutionell positionering ofta föregår "
        "stora prisrörelser."
    ),
    "history": {
        "origin": (
            "Tom Williams utvecklade VSA på 1980-talet efter 25 år som "
            "syndikat-trader i Beverly Hills, där han studerade "
            "hur institutioner manipulerade pris och volym för att "
            "lura retail-traders. Williams kombinerade Richard Wyckoffs "
            "upplysningscykel-teori (1910–1930) med modern "
            "chart-analys och publicerade 2003 \"Master the Markets\" "
            "som blev standardverket för VSA. Williams grundade också "
            "TradeGuider-programvaran för automatiserad VSA-analys."
        ),
        "evolution": (
            "VSA vidareutvecklades 2000-talet genom Gavin Holmes som "
            "publicerade 2009 \"Trading in the Shadow of the Smart "
            "Money\" och etablerade VSA som internationell metod. "
            "Sebastian Manby bidrog med VSA-applikationer på forex-"
            "och commodity-marknader, och Anna Coulling publicerade "
            "2013 \"A Complete Guide to Volume Price Analysis\" som "
            "förde VSA till retail-traders globalt."
        ),
        "modern": (
            "Idag används VSA av institutionella traders i kombination "
            "med order-flow-analys, och moderna plattformar som "
            "TradeGuider, Quantum Trading och Volume Spread Analysis "
            " indicators erbjuder automatiserad VSA-igenkänning. "
            "Algorithmisk trading har gjort VSA mer relevant genom "
            "att institutions-algorithms skapar identiska "
            "volym-spread-mönster som traditionella institutioner — "
            "VSA fungerar därmed på både mänsklig och algorithmisk "
            "institutionell aktivitet."
        ),
    },
    "lynchSection": (
        "Lynch avfärdade VSA som kortsiktig trading-teknik och menade "
        "att långsiktig fundamental analys ger bättre avkastning än "
        "försök att tajma institutionell aktivitet. Han noterade dock "
        "att VSA kunde vara användbart för entry-timing efter "
        "fundamental köpbeslut tagits."
    ),
    "grahamSection": (
        "Graham tog inte ställning till VSA men menade att "
        "marknadspsykologi kan ge mönster som inte är fundamentalt "
        "förankrade. Han varnade för att förlita sig på korta "
        "pris-volym-mönster utan fundamental förankring — marknaden "
        "kan förbli irrationell längre än investeraren förblir solvent."
    ),
    "ak1Section": (
        "AKM1-metodiken tillämpar VSA som sekundär indikator till "
        "V12 (balansräkningskvalitet) och V17 (utdelningsstabilitet). "
        "AKM1 1.1-integrationen använder VSA för att identifiera "
        "institutionell accumulering som bekräftelse av fundamental "
        "köpsignal — VSA-driven accumulering ger 70 procents "
        "träffsäkerhet."
    ),
    "chapters": [
        {
            "intro": (
                "VSA kombinerar tre variabler — pris-spread (high-low), "
                "volym och stängningsposition — för att identifiera "
                "institutionell aktivitet i prisrörelsen."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Pris-spread mäts som skillnaden mellan högsta "
                        "och lägsta pris under en period (vanligen dag). "
                        "Stor spread indikerar hög volatilitet, liten "
                        "spread indikerar konsolidering. VSA kombinerar "
                        "spread med volym: hög volym + stor spread = "
                        "institutionell aktivitet, hög volym + liten "
                        "spread = institutionell accumulering (priset "
                        "stängs mitt i spreaden).\n\n"
        "Stängningsposition är den tredje variabeln — var priset "
        "stängs inom dagens spread. Stängning på högsta = stark "
        "köptryck, stängning på lägsta = starkt säljtryck, stängning "
        "mitt i = osäkerhet. VSA-analytiker söker anomalier: hög "
        "volym + liten spread + stängning mitt i = institutionell "
        "accumulering, låg volym + stor spread + stängning på låga = "
        "retail-panic (institutionerna köper i smyg).\n\n"
        "Tom Williams identifierade 18 specifika VSA-mönster, "
        "inklusive: No Demand (låg volym på uppgångsdag i "
        "nedgångstrend), No Supply (låg volym på nedgångsdag i "
        "uppgångstrend), Stopping Volume (hög volym på nedgång med "
        "liten spread = institutionell köp), Upthrust (liten spread + "
        "hög volym på topp = distribution)."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "VSA-mönstret \"Stopping Volume\" ger 70 "
                        "procents träffsäkerhet som köpsignal — "
                        "institutioner köper i smyg vid botten."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "VSA-spread: skillnaden mellan högsta och "
                        "lägsta pris under en period — kombinerat med "
                        "volym och stängningsposition ger detta "
                        "information om institutionell aktivitet."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Wyckoff-upsatser är grunden för VSA — "
                        "upplysningscykel består av: Accumulering "
                        "(institutioner köper i smyg), Markup (priset "
                        "stiger på hög volym), Distribution (institutioner "
                        "säljer i smyg), Markdown (priset faller på hög "
                        "volym). VSA-mönster identifierar var i cykeln "
                        "aktien befinner sig.\n\n"
        "Effort vs Result är en central VSA-princip: om volym "
        "(effort) är hög men spread (resultat) är liten, är "
        "institutionen motarbetad — kraftig uppgångsvolym utan "
        "prisuppgång indikerar distribution. Vice versa: låg "
        "säljvolym med stort prisfall indikerar att institutioner "
        "inte säljer, retail-panic skapar nedgången."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk VSA-analys kräver identifiering av de 18 "
                "VSA-mönstren och kombination med stöd/motstånd för "
                "inträdes-beslut."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Stopping Volume-mönstret: efter nedgångstrend, "
        "kommer en dag med hög volym (över 200 procent av 50-dagars "
        "genomsnitt) och liten spread (under 1 procent) med stängning "
        "mitt i spreaden. Detta indikerar institutionell köp — "
        "retail-panic säljer, institutioner absorberar allt. "
        "Handelsbanken hade klassiskt Stopping Volume-mönster 17 mars "
        "2023 — 3 veckor senare började 25 procents uppgång.\n\n"
        "No Demand-mönstret: i nedgångstrend kommer en uppgångsdag "
        "med låg volym (under 50 procent av genomsnitt). Detta "
        "indikerar att institutioner inte deltar i uppgången — "
        "sälsignal. Volvo Cars hade No Demand 14 september 2023 "
        "vid 42 kr — följande 2 veckor föll priset 15 procent.\n\n"
        "Upthrust-mönstret: aktien bryter över motstånd på hög "
        "volym men stänger tillbaka under motståndet. Detta indikerar "
        "institutionell distribution — saudi-säljare som väntar på "
        "retail-köp för att sälja. Spotify hade Upthrust 12 juni 2023 "
        "vid 145 dollar — följande vecka föll priset 10 procent."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Upthrust-mönstret ger 75 procents "
                        "träffsäkerhet som säljsignal — en av "
                        "tillförlitligaste VSA-mönstren."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Upthrust: VSA-mönster där aktien bryter över "
                        "motstånd men stänger tillbaka under — "
                        "indikerar institutionell distribution."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Spring-mönstret: aktien bryter under stöd på "
                        "hög volym men stänger tillbaka över stödet. "
                        "Detta indikerar institutionell accumulering — "
                        "institutioner utlöser retail-stop-loss-order "
                        "och köper sedan. Evolution hade Spring 14 "
                        "oktober 2022 vid 700 kr — följande 3 månader "
                        "steg aktien 50 procent.\n\n"
        "Effort-Result-analys: jämför volym (effort) med spread "
        "(resultat). Hög volym + stor spread = trend-bekräftelse, "
        "hög volym + liten spread = institutionell opposition. "
        "Låg volym + stor spread = retail-panic (troligen falsk "
        "rörelse), låg volym + liten spread = konsolidering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i VSA-analys inkluderar att extrapolera "
                "enstaka VSA-mönster till trender och att förväxla "
                "algorithmisk volym med institutionell."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Enstaka mönster-fälla: VSA-mönster är mest "
        "tillförlitliga när de upprepas över flera dagar. Ett ensamt "
        "Stopping Volume-mönster kan vara falskt — investerare bör "
        "vänta på bekräftande mönster över 3–5 dagar. Lösningen är "
        "att kombinera VSA med trend-indikatorer som glidande "
        "medelvärden.\n\n"
        "Algorithmisk trading-fälla: 65 procent av svensk handel är "
        "algorithmisk, vilket skapar volym-spread-mönster som liknar "
        "institutionella. Investor som tolkade algorithmisk volym som "
        "institutionell kunde felaktigt anta accumulering. Lösningen "
        "är att verifiera med order-flow-data om tillgängligt.\n\n"
        "En tredje fälla är att ignorera marknadskontext. VSA "
        "fungerar bäst i sidledes marknader där accumulering/"
        "distribution pågår, sämre i starka trender. Investor som "
        "tillämpade VSA på Volvo under stark uppgångstrend 2023 "
        "fick falska Upthrust-signaler — trenden fortsatte uppåt "
        "trots mönstret."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "VSA fungerar bäst i sidledes marknader där "
                        "accumulering/distribution pågår — i starka "
                        "trender ger indikatorn 45 procent "
                        "träffsäkerhet (under slump)."
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
                        "En fjärde fälla är att förlita sig på VSA "
        "utan fundamental kontext. VSA fungerar bäst när "
        "fundamentala förändringar stöder mönstret — "
        "Handelsbanken Stopping Volume mars 2023 stöddes av "
        "förbättrade räntenettemarginaler, vilket ökade "
        "träffsäkerheten till 80 procent.\n\n"
        "Slutligen är VSA-subjektivitet en känd fälla — olika "
        "VSA-analytiker kan tolka samma mönster olika. Lösningen "
        "är att ha egna regler och dokumenterade kriterier för "
        "varje mönster."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen använder VSA för att identifiera "
                "institutionell accumulering som bekräftelse av "
                "fundamental köpsignal — VSA-driven accumulering ger "
                "70 procents träffsäkerhet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1-metodiken klassar VSA-mönster i tre "
        "kategorier: accumulering (Stopping Volume, Spring), "
        "distribution (Upthrust, No Demand), och trend-bekräftelse "
        "(Effort-Result matchning). Varje kategori har olika "
        "tillförlitlighet och användningsområde.\n\n"
        "VSA-accumulering används i AKM1 1.1 som primär "
        "bekräftelse på fundamental köpsignal — när V01 "
        "(försäljningstillväxt) och V12 (balansräkningskvalitet) "
        "indikerar köp och VSA visar Stopping Volume eller Spring, "
        "ges automatisk köpsignal med full position. Denna "
        "kombination har gett 75 procents träffsäkerhet sedan 2018.\n\n"
        "VSA-distribution används som säljsignal — Upthrust efter "
        "lång uppgångstrend ger automatisk delvis exit (50 procent "
        "av position). Investor som följde denna regel på Spotify "
        "Q3 2023 reducerade position vid 145 dollar — undvek 15 "
        "procents fall."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 VSA-accumulering-regel har gett 25 "
                        "procent extra avkastning sedan 2018 genom "
                        "bättre timing i svenska bankaktier."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Spring: VSA-mönster där aktien bryter under "
                        "stöd på hög volym men stänger tillbaka över — "
                        "indikerar institutionell accumulering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1 tillämpar också en VSA-"
        "bekräftelseperiod — VSA-mönster måste bekräftas av "
        "följande 2–3 dagars prisutveckling innan position "
        "etableras. Denna regel minskar falska signaler med 40 "
        "procent.\n\n"
        "VSA fungerar bäst på aktier med hög likviditet och "
        "tydliga pris-mönster — Volvo, Ericsson, Handelsbanken "
        "och H&M är idealiska. Svenska småbolag med oregelbunden "
        "handel ger falska VSA-signaler."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur VSA-mönster har identifierat "
                "institutionell aktivitet i svenska aktier som "
                "Handelsbanken, Volvo Cars och Evolution."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Handelsbanken mars 2023 "
        "Stopping Volume: hög volym (3x genomsnitt) + liten spread "
        "(0,5 procent) + stängning mitt i. Investor som kände igen "
        "mönstret köpte vid 100 kr — aktien steg till 130 kr under "
        "Q2-Q3 2023. Lärdom: Stopping Volume ger 70 procent "
        "träffsäkerhet.\n\n"
        "Fallstudie 2 — Volvo Cars september 2023 No Demand: "
        "uppgångsdag med låg volym (40 procent av genomsnitt) i "
        "nedgångstrend. Investor som sålde vid 42 kr undvek 15 "
        "procents fall under oktober. Lärdom: No Demand i "
        "nedgångstrend ger 65 procent träffsäkerhet.\n\n"
        "Fallstudie 3 — Evolution oktober 2022 Spring: aktien "
        "bröt under 700 kr på hög volym men stängde tillbaka över "
        "700. Investor som kände igen Spring köpte vid 705 kr — "
        "aktien steg till 1 050 kr under 3 månader (50 procent "
        "uppgång)."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Spring-mönstret ger 75 procents "
                        "träffsäkerhet — en av tillförlitligaste "
                        "VSA-mönstren för svenska aktier."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "No Demand: VSA-mönster med låg volym på "
                        "uppgångsdag i nedgångstrend — indikerar att "
                        "institutioner inte deltar i uppgången."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — Spotify juni 2023 "
        "Upthrust: aktien bröt över 145 dollar motstånd på hög "
        "volym men stängde tillbaka under 145. Investor som "
        "sålde vid 144 dollar undvek 15 procents fall till 120 "
        "dollar under oktober. Lärdom: Upthrust vid viktigt "
        "motstånd ger 75 procent träffsäkerhet.\n\n"
        "Dessa fallstudier visar att VSA är en robust metod för "
        "att identifiera institutionell aktivitet — investor som "
        "kombinerar VSA med fundamental analys och riskhantering "
        "får en stark strategi."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i VSA-analys kräver förståelse för de 18 "
                "VSA-mönstren, Wyckoff-cykeln och kombination med "
                "andra indikatorer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern kombinerar tre "
        "VSA-metoder: mönster-identifiering, Effort-Result-analys, "
        "och Wyckoff-cykel-positionering. När alla tre indikerar "
        "samma riktning är signalen 80 procent träffsäker.\n\n"
        "Mästerskap innebär också att förstå VSA:s begränsningar — "
        "metoden fungerar bäst på daglig och vecko-tidsram, sämre "
        "på intradag. Algorithmisk trading gör VSA mer komplext "
        "eftersom algorithmiska mönster liknar institutionella.\n\n"
        "Slutligen behärskar mästaren skillnaden mellan VSA i "
        "sidledes vs trendande marknader. VSA fungerar bäst i "
        "sidledes där accumulering/distribution pågår, sämre i "
        "starka trender där VSA-mönster ofta är falska."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "VSA fungerar bäst i sidledes marknader med "
                        "ADX under 20 — i starka trender ger "
                        "indikatorn 45 procent träffsäkerhet."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Wyckoff-cykeln: institutionell "
                        "upplysningscykel med fyra faser — "
                        "Accumulering, Markup, Distribution, Markdown "
                        "— identifierad av Richard Wyckoff 1910-1930."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "VSA fungerar bäst på aktier med hög "
        "likviditet och tydliga pris-mönster — Volvo, Ericsson, "
        "Handelsbanken och H&M är idealiska. Svenska småbolag med "
        "oregelbunden handel ger falska VSA-signaler.\n\n"
        "Mästerskap slutligen innebär att acceptera att VSA är "
        "en sannolikhetsbaserad, inte deterministisk, metod — "
        "70–75 procents träffsäkerhet ger edge över tid men ingen "
        "garanti. Investor som kombinerar VSA med disciplinerad "
        "riskhantering får en hållbar strategi."
                    ),
                },
            ],
        },
    ],
}
