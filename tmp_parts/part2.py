
# ---------------------------------------------------------------------------
# se-11 — Krypto (extrem risk)
# ---------------------------------------------------------------------------
COURSES["se-11-krypto"] = {
    "why": (
        "Kryptovalutor representerar den mest volatila tillgångsklassen "
        "i modern finans med Bitcoin svängningar på 70 procent under "
        "2022 och 150 procent uppgång 2023. För svenska privatinvesterare "
        "är krypto relevant som riskhanteringsämne snarare än investering — "
        "förståelse för FTX-kollapsen 2022 och Terra-Luna stablecoin-fallet "
        "är nödvändig för att undvika 100-procentiga förluster i oreglerade "
        "tillgångar."
    ),
    "history": {
        "origin": (
            "Satoshi Nakamoto publicerade bitcoin-whitepapern 31 oktober "
            "2008 — en reaktion på finanskrisen och bankernas "
            "bailout — och lanserade nätverket 3 januari 2009 med den "
            "första block \"genesis\"-miningen. Bitcoin prissattes först "
            "2010 till 0,003 dollar vid det första kända köpet av två "
            "pizzor för 10 000 bitcoin, vilket gav en implicit värdering "
            "på 41 miljoner dollar för hela nätverket. Litecoin följde "
            "2011 och Ripple 2012 som tidiga alt-coins med modifierade "
            "konsensus-metoder."
        ),
        "evolution": (
            "Ethereum lanserades 2015 av Vitalik Buterin och introducerade "
            "smart contracts — programbara transaktioner som möjliggjorde "
            "DeFi (Decentralized Finance) och NFT-tokens. ICO-boomen 2017 "
            "skapade 5 000 nya kryptovalutor och drog in 25 miljarder "
            "dollar under ett år, varav 80 procent senare visade sig vara "
            "bedrägerier eller övergivna projekt. Bitcoin nådde sin första "
            "stora topp december 2017 på 19 783 dollar innan den föll 80 "
            "procent till 3 200 dollar december 2018."
        ),
        "modern": (
            "Idag är krypto-marknaden värderad till 1,7 biljoner dollar "
            "(december 2023) med Bitcoin som dominerar 50 procent av "
            "marknadsvärdet. El Salvador antog Bitcoin som officiell "
            "valuta 2021 — första landet att göra så — och BlackRock "
            "lanserade Bitcoin-ETF januari 2024 vilket gav "
            "institutionella investerare reguljär access. FTX-konkursen "
            "november 2022 förstörde 32 miljarder dollar i kundtillgångar "
            "och visade bristen på kundmedelsskydd i krypto-exchanges, "
            "vilket ledde till ökade krav på SEC-reglering."
        ),
    },
    "lynchSection": (
        "Lynch varnade uttryckligen för kryptovalutor i sina senare "
        "intervjuer och menade att Bitcoin saknar underliggande "
        "kassaflöde och därmed inte kan värderas med traditionella "
        "metoder. Han klassade krypto som \"spekulation\" snarare än "
        "investering och ogillade särskilt stablecoins utan "
        "transparent reservförvaltning."
    ),
    "grahamSection": (
        "Graham skulle ha avfärdat kryptovalutor som spekulation eftersom "
        "de saknar inre värde (intrinsic value) i hans mening — ingen "
        "framtida kassaflödesström att diskontera. Han menade att "
        "investment kräver analys av underliggande affärsverksamhet, "
        "ett kriterium som utesluter alla kryptovalutor utom eventuellt "
        "exchange-tokens med utdelningsrätt."
    ),
    "ak1Section": (
        "AKM1-metodiken utesluter kryptovalutor från standardportföljer "
        "på grund av avsaknad av kassaflöde och extrem volatilitet. "
        "AKM1 1.1-integrationen tillåter endast Bitcoin-ETF (BlackRock) "
        "i max 2 procent av portföljen med specifik riskpremie och krav "
        "på 50 procents margin."
    ),
    "chapters": [
        {
            "intro": (
                "Kryptovalutor är inte traditionella tillgångar — de saknar "
                "kassaflöde, vinst och bokfört värde, vilket gör att "
                "värdering måste baseras på nätverkseffekter, användar-"
                "adoption och regulatoriska förväntningar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Bitcoin är en decentraliserad digital valuta baserad "
                        "på blockchain-teknik med maximalt 21 miljoner "
                        "mynt, varav 19,6 miljoner är minade december 2023. "
                        "Prisbildning sker helt via utbud och efterfrågan "
                        "på exchanges som Binance, Coinbase och Kraken — "
                        "ingen centralbank kan justera utbudet.\n\n"
                        "Volatiliteten är extrem: Bitcoin rörde sig mellan "
                        "15 500 och 69 000 dollar under 2022 — en svängning "
                        "på 345 procent på 12 månader. Detta kan jämföras "
                        "med OMXS30 som svängde 18 procent under samma "
                        "period. Volatiliteten härrör från liten marknad, "
                        "brist på market makers och hög andel retail-trading.\n\n"
                        "Ethereum skiljer sig från Bitcoin genom att "
                        "vara en programbar blockchain där smart contracts "
                        "kan exekvera över 1 000 transaktioner per sekund. "
                        "Ethereum har över 500 000 dagliga aktiva adresser "
                        "och utgör basen för DeFi-applikationer med 50 "
                        "miljarder dollar i Total Value Locked (TVL) "
                        "december 2023."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Bitcoin har 60 procents korrelation med Nasdaq "
                        "2022–2023 — krypto beter sig därmed som en "
                        "hög-beta tech-akti snarare än som inflationsskydd."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Stablecoin: kryptovaluta som är pegged till "
                        "fiat-valuta (vanligen USD) via reservförvaltning — "
                        "USDT och USDC är störst med 90 miljarder i "
                        "marknadsvärde."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Krypto-börser skiljer sig från traditionella "
                        "börser genom avsaknad av kundmedelsskydd. FTX "
                        "hade 2022 kundmedel på 8 miljarder dollar i "
                        "obemannade plånböcker — när företaget gick i "
                        "konkurs förlorade kunderna 80 procent av sina "
                        "tillgångar. Svensk investerare har ingen "
                        "investeringsskydd (Investerarskyddslagen) för "
                        "krypto, till skillnad från aktier och fonder.\n\n"
                        "Mining-ekonomi är den andra kritiska faktorn. "
                        "Bitcoin-mining förbrukar 150 TWh årligen — mer "
                        "än Sveriges totala elkonsumtion. Kinas förbud "
                        "mot mining 2021 flyttade 65 procent av "
                        "hashing-kraften till USA, Kazakstan och Ryssland, "
                        "vilket centraliserade nätverket och ökade "
                        "regulatorisk risk."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk kryptoanalys fokuserar på nätverksaktivitet, "
                "adoptionstakt och regulatoriska risker — inte på "
                "traditionella värderingsmultipel."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Network Value to Transactions (NVT) är kryptons "
                        "motsvarighet till P/E. NVT beräknas som "
                        "marknadsvärde dividerat med daglig "
                        "transaktionsvolym i dollar. Bitcoin hade NVT på "
                        "75 december 2023, jämfört med 150 under "
                        "bubbel-toppen 2017. Högt NVT indikerar övervärdering "
                        "— nätverket värderas högre än dess användning.\n\n"
                        "Metcalfes Law är den andra metodiken — nätverkets "
                        "värde ska växa kvadratiskt med antal användare. "
                        "Bitcoin har 200 miljoner wallet-adresser med "
                        "positiv balans och 800 000 dagliga aktiva adresser. "
                        "Ethereum har 250 miljoner adresser och 500 000 "
                        "dagliga aktiva. Aktiva adresser har vuxit 12 "
                        "procent årligen 2018–2023, lägre än marknadsvärdet "
                        "på 25 procent.\n\n"
                        "On-chain-analys är den tredje metoden — analytiker "
                        "studerar transaktionsmönster på blockchain för att "
                        "identifiera stora innehavare (\"whales\") och "
                        "marknadssentiment. När whales flyttar bitcoin till "
                        "exchanges är det en signal om kommande försäljning."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "NVT-verifiering: när Bitcoin NVT överstiger 100 "
                        "har nätverket varit övervärderat — detta inträffade "
                        "2017, 2021 och delvis 2023."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "NVT (Network Value to Transactions): "
                        "kryptovalutaens motsvarighet till P/E — "
                        "marknadsvärde dividerat med daglig "
                        "transaktionsvolym."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Stablecoin-reservanalyser är kritiska för att "
                        "förstå risker. Tether (USDT) hade december 2023 "
                        "reserver på 91 miljarder dollar varav 80 procent "
                        "i USA-statsobligationer och 6 procent i "
                        "kommersiella papper. Terra-Luna stablecoin UST "
                        "hade 2022 ingen reserv — den var algoritmiskt "
                        "pegged via systervalutan Luna, och kollapsade "
                        "maj 2022 från 1 till 0,01 dollar på en vecka.\n\n"
                        "Regulatorisk risk är den fjärde faktorn. SEC "
                        "har 2023 stämt Binance, Coinbase och Ripple med "
                        "krav på att kryptotokens ska klassas som "
                        "värdepapper. Om SEC vinner dessa mål kan "
                        "krypto-exchanges tvingas stänga för amerikanska "
                        "kunder, vilket skulle pressa ner volymer 30–50 "
                        "procent."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i kryptoanalys inkluderar att förväxla "
                "bubbel-toppar med ny normal och att ignorera "
                "regulatoriska risker."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Bubbel-fällan 2021: Bitcoin nådde 69 000 dollar "
                        "november 2021 och många investerare extrapolerade "
                        "till 100 000 dollar inom 6 månader. Istället föll "
                        "Bitcoin till 15 500 dollar november 2022 — 77 "
                        "procents fall på 12 månader. Investor som "
                        "använde NVT såg att nätverksaktiviteten föll 40 "
                        "procent under perioden, vilket indikerade "
                        "övervärdering redan vid 50 000 dollar.\n\n"
                        "Stablecoin-fällan: många investerare trodde att "
                        "UST (Terra) var säker eftersom den var pegged "
                        "till USD. När peggingen bröts maj 2022 förlorade "
                        "investerare 40 miljarder dollar på en vecka. "
                        "Lärdom: stablecoins är bara så säkra som deras "
                        "reserver — algorithmic stablecoins utan reserv "
                        "är extremt riskfyllda.\n\n"
                        "En tredje fälla är att förväxla mining-"
                        "lönsamhet med Bitcoin-värdering. Mining är "
                        "lönsamt när Bitcoin-priset överstiger el-kostnad "
                        "per mined bitcoin. Många investerare köpte "
                        "mining-aktier (Marathon, Riot) under 2021 utan "
                        "att förstå att de var hävstång på Bitcoin-priset "
                        "med 3x volatilitet."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Bitcoin har fallit över 50 procent fyra gånger "
                        "sedan 2013 — krypto-investerare måste vara "
                        "förberedda på 50-procentig drawdown som normal "
                        "risk."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Algorithmic stablecoin: kryptovaluta pegged "
                        "till fiat via smart contract-mekanismer snarare "
                        "än reserv — Terra UST kollapsade maj 2022."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Exchange-fällan är den fjärde — många "
                        "investor lämnar krypto på exchange för "
                        "bekvämlighet. När exchange går i konkurs "
                        "(som FTX 2022) förloras kundmedel. Lösningen "
                        "är self-custody i hardware wallets (Ledger, "
                        "Trezor), men detta kräver teknisk kompetens.\n\n"
                        "Slutligen är rug pulls en särskild fälla i "
                        "alt-coins — utvecklare skapar en token, samlar "
                        "in likviditet via liquidity pool, och säljer "
                        "sedan alla sina tokens på en gång. Under 2022 "
                        "rapporterades 1 300 rug pulls med total förlust "
                        "på 1,5 miljarder dollar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen utesluter direkt krypto-investering "
                "och tillåter endast Bitcoin-ETF (BlackRock) i max 2 procent "
                "av portföljen med 50 procents margin."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1-metodiken klassar kryptoaktier i fyra "
                        "kategorier: direkt krypto (Bitcoin, Ethereum), "
                        "krypto-exchanges (Coinbase, Binance), krypto-"
                        "miners (Marathon, Riot) och blockchain-tjänster "
                        "(Block, PayPal Crypto). Direkt krypto utesluts "
                        "från standardportföljer på grund av avsaknad av "
                        "kassaflöde.\n\n"
                        "AKM1 1.1 tillämpar en särskild kryptomatris "
                        "med tre riskvariabler: (1) volatilitet över 60 "
                        "procent årligen, (2) regulatorisk risk "
                        "(SEC-stämningar), och (3) finansiell risk "
                        "(reservtäckning, exchange-säkerhet). Alla tre "
                        "måste bedömas innan investering.\n\n"
                        "Bitcoin-ETF (BlackRock IBIT) klassas som "
                        "tillåten med maxvikt 2 procent och 50 procents "
                        "margin. Detta ger indirekt exponering mot "
                        "Bitcoin via reglerad ETF, vilket minskar "
                        "exchange-risk och regulatorisk risk. AKM1 1.1 "
                        "tillåter inte direct Bitcoin-hållning."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 ger Bitcoin-ETF riskpremie på 8 "
                        "procentenheter över OMXS30 — denna extra "
                        "premie kompenserar för volatilitet och "
                        "regulatorisk risk."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Bitcoin-ETF: börshandlad fond som håller "
                        "Bitcoin som underliggande tillgång — BlackRock "
                        "IBIT lanserades januari 2024 med 2 miljarder "
                        "dollar i AUM första månaden."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Krypto-exchanges klassas som high-risk "
                        "growth-aktier med V15 (teknologikänslighet) 10 "
                        "och V14 (konkurrenssituation) 5 på grund av "
                        "låga inträdesbarriärer. Coinbase har bruttomarginal "
                        "på 75 procent men stämmer av SEC 2023 har pressat "
                        "aktien 60 procent.\n\n"
                        "Mining-aktier är den mest riskfyllda kategorin — "
                        "Marathon hade 2022 bruttomarginal på minus 20 "
                        "procent när Bitcoin-priset föll under mining-"
                        "kostnad. AKM1 1.1 utesluter mining-aktier från "
                        "standardportföljer."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur Bitcoin, Terra-Luna och FTX "
                "har format förståelsen av kryptorisken under 2020-talet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Bitcoin 2017–2018: pris steg "
                        "från 1 000 till 19 783 dollar december 2017, "
                        "sedan fall till 3 200 dollar december 2018 — "
                        "84 procents fall på 12 månader. Investor som "
                        "följde NVT såg att nätverksaktiviteten föll 70 "
                        "procent under perioden, vilket indikerade "
                        "övervärdering redan vid 10 000 dollar.\n\n"
                        "Fallstudie 2 — Terra-Luna kollaps maj 2022: "
                        "UST stablecoin föll från 1 till 0,01 dollar på "
                        "en vecka och systervalutan Luna föll från 80 "
                        "till 0,00001 dollar — total marknadsvärdes-"
                        "förlust 60 miljarder dollar. Investor som "
                        "undersökte reservtäckning såg att UST saknade "
                        "reserv och undvek position. Lärdom: "
                        "algorithmic stablecoins är experimentella.\n\n"
                        "Fallstudie 3 — FTX konkurs november 2022: "
                        "exchange med 32 miljarder dollar i "
                        "kundtillgångar gick i konkurs efter avslöjanden "
                        "om att kundmedel hade förts över till "
                        "systerföretaget Alameda Research. Investor som "
                        "förstod att krypto saknar investeringsskydd "
                        "flyttade tillgångar till self-custody innan "
                        "kollapsen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "FTX grundare Sam Bankman-Fried dömdes mars 2024 "
                        "till 25 års fängelse för bedrägeri — detta är "
                        "den största krypto-domen hittills."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Rug pull: bedräglig krypto-projekt där "
                        "utvecklare samlar in likviditet och sedan "
                        "överger projektet — vanligt i DeFi och alt-coins."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — BlackRock Bitcoin-ETF "
                        "2024: lanserades 11 januari 2024 efter SEC-"
                        "godkännande och drog in 2 miljarder dollar på "
                        "en månad. Investor som förstod att ETF ger "
                        "reglerad access kunde delta utan exchange-risk. "
                        "Lärdom: regulatorisk innovation kan öppna nya "
                        "tillgångsklasser för institutionella investerare.\n\n"
                        "Dessa fallstudier visar att krypto-marknaden är "
                        "extremt riskfylld — investerare bör exponera "
                        "sig endast via reglerade instrument som Bitcoin-"
                        "ETF och undvika oreglerade exchanges och alt-coins."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i kryptoanalys kräver förståelse för "
                "blockchain-teknik, on-chain-analys och regulatoriska "
                "risker i en snabbt föränderlig marknad."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer tre "
                        "specifika indikatorer: (1) NVT-ratio, "
                        "(2) aktiva dagliga adresser, och (3) "
                        "exchange-reserver. När alla tre indikerar "
                        "övervärdering (högt NVT, fallande adresser, "
                        "stigande exchange-reserver) är det en "
                        "stark säljsignal.\n\n"
                        "Mästerskap innebär också att förstå "
                        "blockchain-scaling — Ethereums övergång "
                        "till Proof of Stake september 2022 (\"The Merge\") "
                        "minskade energiförbrukningen 99,95 procent men "
                        "öppnade också för centralisering genom "
                        "staked-ETH koncentration. Lido, Coinbase och "
                        "Binance kontrollerar 60 procent av all staked "
                        "ETH, vilket hotar nätverkets säkerhet.\n\n"
                        "Slutligen behärskar mästaren skillnaden mellan "
                        "Layer 1 (Bitcoin, Ethereum) och Layer 2 "
                        "(Lightning Network, Optimism, Arbitrum) — "
                        "Layer 2-lösningar bygger på Layer 1 för säkerhet "
                        "men erbjuder snabbare och billigare transaktioner."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Ethereum Merge september 2022 minskade "
                        "energiförbrukningen med 99,95 procent — "
                        "viktigt ESG-argument för institutionella "
                        "investerare."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Layer 2: blockchain-lösning som bygger på "
                        "Layer 1 (vanligen Ethereum) för säkerhet "
                        "men erbjuder snabbare transaktioner — "
                        "Optimism och Arbitrum är störst."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Regulatoriska frameworks varierar globalt: "
                        "USA har SEC:s värdepappers-ansats, EU har "
                        "MiCA-regelverket (2024), och Singapore har "
                        "tillståndsbaserad modell. Investor som "
                        "förstår dessa skillnader kan välja reglerade "
                        "plattformar och undvika oreglerade risker.\n\n"
                        "Mästerskap slutligen innebär att acceptera "
                        "att krypto är en spekulativ tillgångsklass — "
                        "AKM1-strategin är att exponera max 2 procent "
                        "via Bitcoin-ETF och undvika direkt krypto, "
                        "exchanges och mining-aktier. Denna restriktiva "
                        "ansats skyddar portföljen från 50-procentiga "
                        "drawdowns som krypto genomgår regelbundet."
                    ),
                },
            ],
        },
    ],
}
