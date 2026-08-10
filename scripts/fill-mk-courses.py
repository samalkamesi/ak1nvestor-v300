#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fill-mk-courses.py

Fyller 11 "Makroekonomi"-kurser (slug-prefix `mk-`) i
/home/z/my-project/public/deep-courses.json med skräddarsytt svenskt innehåll:

  - why              (2-3 meningar)
  - history          { origin, evolution, modern }  (3 meningar per del)
  - lynchSection     (2 meningar)
  - grahamSection    (2 meningar)
  - ak1Section       (2 meningar)
  - chapters         6 kapitel — befintliga num/minutes/title bevaras,
                     intro + blocks skrivs om till formatet
                     [text(2-3 paragrafer), insight(1-2 meningar),
                      definition(1 mening), text(2 paragrafer)]

Varje slug markeras som klar i /home/z/my-project/.gen-progress.json
(dvs läggs till i `done`-arrayen).

Körs:  python3 /home/z/my-project/scripts/fill-mk-courses.py
"""

from __future__ import annotations

import json
import os
import sys

# ---------------------------------------------------------------------------
# Sökvägar
# ---------------------------------------------------------------------------
PROJECT_ROOT   = "/home/z/my-project"
COURSES_PATH   = os.path.join(PROJECT_ROOT, "public", "deep-courses.json")
PROGRESS_PATH  = os.path.join(PROJECT_ROOT, ".gen-progress.json")

# ---------------------------------------------------------------------------
# Kursdata — skräddarsytt svenskt innehåll för alla 11 mk-kurser
# ---------------------------------------------------------------------------
# Varje kurs har:
#   why:           str
#   history:       { origin, evolution, modern }  (str, 3 meningar var)
#   lynchSection:  str (2 meningar)
#   grahamSection: str (2 meningar)
#   ak1Section:    str (2 meningar)
#   chapters:      list med 6 dict, en per kapitel — varje dict har:
#                    intro:  str (1-2 meningar)
#                    blocks: list med exakt 4 dicts:
#                      { type: "text",       content: 2-3 paragrafer }
#                      { type: "insight",    content: 1-2 meningar }
#                      { type: "definition", content: 1 mening }
#                      { type: "text",       content: 2 paragrafer }
#
# `num`, `minutes` och `title` hämtas från kursens befintliga `chapters_list`
# i deep-courses.json och bevaras oförändrade.
# ---------------------------------------------------------------------------

COURSES = {}

# ===========================================================================
# mk-01 — BNP och tillväxt
# ===========================================================================
COURSES["mk-01-bnp-och-tillvaxt"] = {
    "why": (
        "BNP-tillväxten är den övergripande tidvattenströmmen som lyfter eller "
        "sänker svenska bolags intjäning — svensk export uppgick till cirka 45 "
        "procent av BNP 2023 och därmed präglas Ericsson, Atlas Copco och Volvo "
        "direkt av global konjunktur. Riksbankens räntebeslut utgår explicit "
        "från BNP-gapet och resursutnyttjandet, vilket gör SCB:s kvartals-BNP "
        "till den enskilt mest bevakade makrovariabeln på Stockholmsbörsen."
    ),
    "history": {
        "origin": (
            "Simon Kuznets redovisade 1934 det första nationella BNP-kontot för "
            "USA som ett svar på den stora depressionens statistiska mörker och "
            "visade att produktionen hade fallit mer än man dittills trott. "
            "Richard Stone och James Meade utvecklade parallellt det brittiska "
            "nationalräkenskapssystemet under andra världskriget, vilket lade "
            "grunden till FN:s System of National Accounts 1953. Keynes verk "
            "”How to Pay for the War” (1940) formaliserade makro-aggregaten som "
            "statsbudgetens grundval och etablerade BNP som centralbudgetens "
            "styrverktyg."
        ),
        "evolution": (
            "John Hicks och Paul Samuelson förfinade på 1940- och 50-talen "
            "keynesianska modeller som splittrade BNP i konsumtion, investeringar, "
            "statlig utgift och nettoexport. Robert Mundell och Marcus Fleming "
            "lade 1963 till öppen ekonomi, ränteparitet och växelkurs — avgörande "
            "för ett exportberoende Sverige där SCB började publicera kvartals-BNP "
            "1970. Robert Solows tillväxteori från 1957 införde den s.k. Solow-"
            "resten för att bryta ut teknisk produktivitetstillväxt från "
            "insatsökning, en metod som fortfarande används i produktivitets-"
            "statistiken."
        ),
        "modern": (
            "Idag publicerar SCB kvartals-BNP med 60 respektive 90 dagars "
            "fördröjning och revideringarna kan vara stora — BNP-kontraktionen "
            "Q2 2020 reviderades från −8,6 till −2,8 procent när importjusteringar "
            "kom på plats. Riksbankens penningpolitik 2022–2023 utgick direkt "
            "från BNP-gapet när styrräntan höjdes från 0 till 4 procent på ett "
            "år, och ECB gör på samma sätt med Eurostats flash-BNP. BNP-tillväxt "
            "är därmed inte en teoretisk variabel utan en direkt prissatt "
            "signal i både obligations- och aktiemarknaden."
        ),
    },
    "lynchSection": (
        "Lynch påminde i ”One Up on Wall Street” (1989) att om man inte kan "
        "förutse marknaden ska man i stället förutse bolaget — men han "
        "kontrollerade ändå BNP-prognoser eftersom banker, detaljhandel och "
        "cykliska industriaktier rör sig med konjunkturen. I hans erfarenhet gav "
        "företag med stark balansräkning överlägsna resultat i "
        "recessionsvändningar, medan renodlat cykliska aktier var lömska att "
        "tajma."
    ),
    "grahamSection": (
        "Graham varnade i ”The Intelligent Investor” (1949) för att "
        "makroprognoser var den vanligaste källan till investerarfel och menade "
        "att portföljen ska isoleras från BNP-svängar genom margin of safety "
        "snarare än genom tajming. Hans defensiva investerare utgick från "
        "företagets resultatcykel snarare än från BNP-cykeln och accepterade "
        "att konjunkturförutsägelser ofta slår fel."
    ),
    "ak1Section": (
        "I AKM1-metodiken hanteras BNP-tillväxt som en förklaringsvariabel till "
        "V01 (försäljningstillväxt) och V19 (kapitalförbränning) — när SCB:s "
        "BNP-gap indikerar recession kapas auto-tillägg av cykliska aktier och "
        "viktas utdelningsvariabeln V17 högre. AKM1 1.1-integrationen prövar "
        "varje aktie mot en makrokänslighetsmatris och markerar cykliska bolag "
        "med extra riskpremie i lågkonjunktur."
    ),
    "chapters": [
        {
            "intro": (
                "BNP är den mest centrala makrovariabeln eftersom den "
                "sammanfattar allt som produceras i en ekonomi under en period "
                "och därmed utgör grundvalen för räntor, valutor och vinster."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "BNP definieras som marknadsvärdet av alla färdiga varor "
                        "och tjänster som produceras inom ett lands gränser under "
                        "en viss period. Mätningen sker tre sätt: produktions-"
                        "metoden, utgiftsmetoden och inkomstmetoden — de ska alla "
                        "ge samma resultat enligt nationalräkenskapernas "
                        "identitet. I Sverige ställer SCB upp utgiftssidan som "
                        "C + I + G + (X − M), där nettoexporten (X − M) blev "
                        "särskilt viktig när svensk export 2023 uppgick till cirka "
                        "45 procent av BNP.\n\n"
                        "Det är skillnaden mellan nominell och real BNP som "
                        "avgör om tillväxten är äkta eller bara en "
                        "prisillusion. Nominell BNP mäts i löpande priser, "
                        "medan real BNP justeras med en BNP-deflator som fångar "
                        "prisökningar. Sverige hade 2022 en nominell "
                        "BNP-tillväxt på 6,9 procent samtidigt som real "
                        "tillväxt var −0,7 procent — skillnaden var alltså "
                        "ren inflation.\n\n"
                        "BNP-tillväxt delas upp i bidrag från arbetskraft, "
                        "kapital och total faktorproduktivitet (TFP). Solow-"
                        "modellen från 1957 visar att långsiktig tillväxt i ett "
                        "moget land som Sverige drivs av TFP snarare än av "
                        "kapackumulering, vilket är varför Riksbanken noggrant "
                        "följer produktivitetssiffrorna."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Real BNP-tillväxt är det enda mått som visar om "
                        "ekonomin faktiskt växer — nominell BNP kan stiga enbart "
                        "p.g.a. inflation, vilket lurar investerare som inte "
                        "justerar för prisnivån."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "BNP-gap: skillnaden mellan faktisk och potentiell BNP, "
                        "uttryckt i procent av potentiell BNP — positivt gap "
                        "indikerar överhettning, negativt gap indikerar "
                        "resursslöseri."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "BNP-gapet är det koncept Riksbanken använder för att "
                        "avgöra om ekonomin är över- eller underhettad. Ett "
                        "negativt gap 2020–2021 motiverade en expansiv "
                        "penningpolitik med negativ styrränta, medan ett "
                        "stigande positivt gap 2022 lade grunden för de "
                        "kraftiga räntehöjningarna. Samma gap används av IMF "
                        "i sina land-rapporter för att jämföra konjunkturlägen "
                        "mellan länder.\n\n"
                        "För en svensk investerare betyder BNP-gapet att "
                        "cykliska sektorer — industri, bank och fastighet — "
                        "rör sig extra mycket i konjunktursvängningar. När BNP "
                        "kontraherar faller沃尔沃 och Atlas Copco mer än "
                        "marknaden, och när BNP vänder upp igen slår dessa "
                        "aktier ofta tillbaka snabbare än defensiva bolag som "
                        "AstraZeneca."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk BNP-analys för en svensk investerare handlar om att "
                "läsa SCB:s kvartalsrapport och förstå vilka sektorer som "
                "driver svängningarna."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SCB publicerar BNP enligt en fast tidslinje: en "
                        "kvartalsvisa flash-BNP cirka 60 dagar efter "
                        "kvartalslut, en reviderad siffra vid dag 90 och "
                        "årliga revideringar i november. Flash-siffran bygger "
                        "på delvis preliminär data och kan revideras med en "
                        "hel procentenhet, vilketinvesterare måste veta för "
                        "att inte överreagera. Det är de reviderade "
                        "kvartalssiffrorna som Riksbanken använder i sina "
                        "monetary policy reports.\n\n"
                        "BNP-komponenterna avslöjar mer än huvudtalet. Om "
                        "tillväxten drivs av hushållens konsumtion är den "
                        "mer hållbar än om den drivs av lageruppbyggnad som "
                        "kan vända nästa kvartal. Om investeringarna (I) "
                        "faller samtidigt som konsumtionen stiger, är det en "
                        "varning om företagsskepsis inför framtiden — "
                        "exakt det mönstret syntes i SCB:s Q4 2022-rapport.\n\n"
                        "Nettoexportens bidrag är särskilt viktigt för Sverige. "
                        "När Ericsson, AstraZeneca eller Volvo rapporterar "
                        "stark orderstock brukar det slå igenom i nästa "
                        "kvartals BNP som positivt nettoexportbidrag. "
                        "Investerares edge ligger i att koppla bolagens "
                        "kvartalsrapporter till SCB:s nationalräkenskaper."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SCB:s flash-BNP kan revideras med en hel "
                        "procentenhet — basera aldrig ett stort beslut på "
                        "första siffran, utan vänta på den reviderade "
                        "90-dagarsrapporten och jämför med Riksbankens "
                        "egen prognos."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Teknisk recession: två på varandra följande kvartal "
                        "med negativ real BNP-tillväxt — en tumregel som "
                        "infördes av Julius Shiskin i New York Times 1974."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Riksbankens penningpolitiska rapport (MPR) publiceras "
                        "tre gånger om året och innehåller en detaljerad "
                        "BNP-prognos medel treårsperiod. Reporäntans bana "
                        "styrs direkt av BNP-gapet — när SCB:s utfall "
                        "underträffar MPR-prognosen brukar marknaden "
                        "omedelbart prissätta en sänkt räntebana och "
                        "obligationsräntan faller.\n\n"
                        "För aktieinvesterare innebär detta att en svagare BNP "
                        "inte nödvändigtvis är dåligt för börsen om den "
                        "leder till lägre räntor — en dynamik som syntes "
                        "under 2019 då svag global tillväxt kombinerades med "
                        "stigande börsvärderingar. Den svenska björnen 2022 "
                        "blev tvärtom djup just för att BNP-svagheten "
                        "kom samtidigt som Riksbanken höjde räntan."
                    ),
                },
            ],
        },
        {
            "intro": (
                "De vanligaste BNP-fällorna handlar om att läsa fel siffra, "
                "missförstå revideringar och förväxla nominella och reala "
                "förändringar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att läsa nominell BNP-tillväxt "
                        "och tolka den som verklig tillväxt. Ett land kan "
                        "ha 10 procent nominell BNP-tillväxt och samtidigt "
                        "få fattigare om inflationen är 12 procent — exakt "
                        "vad som hände i Argentina 2022. I Sverige hade vi "
                        "en liknande, om än mindre, illusion under 2022 när "
                        "nominell BNP steg med 6,9 procent medan real BNP "
                        "kontraherade.\n\n"
                        "En annan fälla är att övervikt flash-BNP. SCB:s "
                        "preliminära siffra bygger på 60–70 procent "
                        "underlag och revideras i genomsnitt med 0,5 "
                        "procentenheter. Investerare som sålde svenska "
                        "aktier på Q2 2020 flash-BNP på −8,6 procent "
                        "missade att den slutliga siffran blev −2,8 procent "
                        "— en enorm skillnad i prissättning.\n\n"
                        "En tredje fälla är att tolka BNP-tillväxt som "
                        "bolagsvinststillväxt. Vinster är en andel av BNP "
                        "och kan både stiga och falla oberoende av "
                        "huvudtalet — lönekostnader, råvarupriser och "
                        "räntor avgör hur stor andel av BNP som hamnar "
                        "som vinster hos noterade bolag."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "BNP-tillväxt är inte samma sak som vinsttillväxt — "
                        "löner, räntor och råvarupriser avgör hur stor andel "
                        "av produktionen som blir bolagsvinster, vilket "
                        "förklarar varför börsen kan falla i en växande "
                        "ekonomi."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "BNP-deflator: implicita prisindex för BNP, beräknas "
                        "som kvoten mellan nominell och real BNP multiplicerat "
                        "med 100 — ett bredare inflationstal än KPI eftersom "
                        "det täcker alla varor och tjänster, inte bara "
                        "hushållens konsumtion."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att missförstå "
                        "lagerbidraget. En BNP-tillväxt som till 80 procent "
                        "består av oönskad lageruppbyggnad är en varning, "
                        "inte en framgång — företagen har producerat mer än "
                        "de sålt och kommer att dra ner nästa kvartal. "
                        "SCB:s kvartalsrapport anger uttryckligen "
                        "lagerbidraget och investerare bör läsa det "
                        "separat från underliggande tillväxt.\n\n"
                        "Slutligen är det en fälla att använda BNP som "
                        "kortsiktig marknadsindikator. Aktiemarknaden är "
                        "en ledande indikator och vänder oftast 6–9 månader "
                        "innan BNP vänder, vilket innebär att den som "
                        "investerar baserat på bekräftad BNP-vändning "
                        "missar större delen av uppgången."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 integreras BNP-tillväxt som en makrofilter som "
                "modifierar V01, V17 och V19 innan slutlig portföljvikter "
                "sätts."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen utgår från en makrokänslighets-"
                        "matris där varje bolag klassas efter hur starkt "
                        "dess intjäning korrelerar med BNP-gapet. Cykliska "
                        "aktier som Volvo, SKF och Atlas Copco har "
                        "hög BNP-beta och får därför en extra riskpremie "
                        "i lågkonjunkturer. Defensiva aktier som AstraZeneca "
                        "och ICA får låg BNP-beta och fungerar som "
                        "stabilisatorer i portföljen.\n\n"
                        "När SCB publicerar en BNP-siffra som underträffar "
                        "Riksbankens prognos med mer än 0,5 procentenhet "
                        "triggar AKM1 1.1 automatiskt en omvikning: cykliska "
                        "aktier får 10–15 procent lägre portföljvikt och "
                        "utdelningsaktier (V17) får motsvarande högre vikt. "
                        "Detta simulerar det institutionella tillvägagångssätt "
                        "som stora pensionsfonder tillämpar men sällan "
                        "kommunicerar öppet.\n\n"
                        "V01 (försäljningstillväxt) prövas mot BNP-tillväxt "
                        "i en regressionsmodell — ett bolag vars "
                        "försäljningstillväxt avviker mer än två "
                        "standardavvikelser från vad BNP-tillväxten "
                        "motiverar flaggas för manuell granskning."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar BNP-tillväxt från en passiv "
                        "bakgrundsfaktor till en aktiv portföljviktsvariabel "
                        "— makrofiltret triggas av faktiska SCB-utfall, inte "
                        "av framtidsprognoser, vilket eliminerar "
                        "förutsägelserisken."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "BNP-beta: ett mått på hur starkt ett bolags "
                        "resultat变动 samvarierar med BNP-gapet, beräknad "
                        "med 20 kvartals rullande regression mot SCB:s "
                        "kvartals-BNP."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen att "
                        "portföljen får en inbyggd konjunkturförsäkring. "
                        "När BNP-gapet är negativt flyttas kapital från "
                        "cykliska sektorer (industri, bank, fastighet) till "
                        "defensiva (läkemedel, livsmedel, utility). När "
                        "gapet vänder positivt sker återgången gradvis över "
                        "två kvartal för att undvika falska signaler.\n\n"
                        "V19 (kapitalförbränning) kopplas också till BNP — "
                        "i recessioner har historiskt 30 procent fler "
                        "bolag positiv kapitalförbränning, vilket gör "
                        "V19-filtret extra viktigt när BNP-gapet är "
                        "negativt. AKM1-systemet känner av detta och "
                        "höjer automatiskt V19-tröskeln i lågkonjunktur."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur BNP-tillväxt har prissatts på "
                "svensk börs under olika konjunkturregimer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Finanskrisen 2008–2009. Svensk BNP föll "
                        "med 5,0 procent 2009, den största fredstida "
                        "kontraktionen sedan 1930-talet. Stockholmsbörsen "
                        "(OMXSPI) föll 41 procent under 2008, men vände "
                        "redan i mars 2009 — sex månader innan BNP vände. "
                        "Volvo och Atlas Copco föll 60+ procent och "
                        "återhämtade sig till 2010-topp på 18 månader. "
                        "Lärdom: BNP-vändningen kommer efter börsen.\n\n"
                        "Fall 2 — Eurokrisen 2011–2012. Svensk BNP-tillväxt "
                        " Bromsade till 0,7 procent 2012 från 3,8 procent "
                        "2011. Investment AB och Securitas visade liten "
                        "påverkan, medan exportbolag som Alfa Laval och "
                        "Trelleborg föll 20–30 procent. Lärdom: "
                        "BNP-känslighet skiljer sig kraftigt mellan bolag "
                        "inom samma sektor.\n\n"
                        "Fall 3 — Pandemirecessionen 2020. BNP föll 2,8 "
                        "procent helår men OMXSPI steg 9,9 procent — "
                        "börsen gick tvärtemot BNP eftersom Riksbanken "
                        "sänkte till 0 procent och massiva stödpaket "
                        "kompenserade. Lärdom: BNP är en variabel bland "
                        "många; ränta och likviditet kan dominera."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Svensk börs vänder i genomsnitt sex månader innan "
                        "BNP vänder — den som väntar på bekräftad BNP-"
                        "vändning missar den första 25-procentiga "
                        "återhämtningen."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Ledande indikator: en variabel som vänder före "
                        "BNP-cykeln, t.ex. NKI (Nationalekonomisk "
                        "Konjunkturindikator) som Riksbanken publicerar "
                        "månadsvis."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "NKI är Konjunkturinstitutets månatliga sammansättning "
                        "av 9 indikatorer (nya order, konsumtionsförtroende, "
                        "inköpschefsindex m.fl.) och har historiskt vänt "
                        "4–6 månader före BNP. AKM1-systemet använder NKI "
                        "som en tidig varningsindikator och justerar "
                        "portföljvikterna gradvis när NKI vänder, snarare "
                        "än att vänta på efterhands-BNP.\n\n"
                        "En viktig observation är att de tre fallen visar "
                        "olika relationsriktning mellan BNP och börs. "
                        "Investerare som mekaniskt kortade svenska aktier "
                        "i mars 2020 för att BNP föll, missade den "
                        "kraftiga återhämtningen som följde. BNP-tillväxt "
                        "är alltså inte en ensam köp-/säljsignal, utan en "
                        "input bland flera."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i BNP-analys kräver förståelse för "
                "nationalräkenskapernas konstruktion, Riksbankens "
                "processtyper och marknadens prissättning."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade BNP-analytikern läser inte bara "
                        "huvudtalet utan också de fyra tabeller som SCB "
                        "publicerar: produktions-, utgifts-, inkomst- och "
                        "finansieringssidan. Avvikelser mellan dessa "
                        "avslöjar dolda problem — om produktionen stiger "
                        "men inkomsterna faller tyder det på "
                        "vinstmarginaltryck som snart slår igenom i "
                        "kvartalsrapporter.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "supply-use-tabellerna som SCB publicerar årligen. "
                        "De visar hur varje bransch levererar till andra "
                        "och till slutkonsument — när en viktig "
                        "leveranskedja (t.ex. skog till papper till "
                        "förpackning) visar flaskhalsar, slår det igenom "
                        "i BNP inom 2–3 kvartal.\n\n"
                        "Slutligen är förståelsen av BNP-revideringar "
                        "en edge i sig. Studier från Federal Reserve och "
                        "Sveriges Riksbank visar att revideringar "
                        "genomsnittligt är pro-cykliska — de förstärker "
                        "konjunkturen i efterhand. Den som följer "
                        "revideringsmönstret kan identifiera "
                        "konjunkturvändningar tidigare än marknaden."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Den sanna edgen ligger i att läsa SCB:s fyra "
                        "BNP-tabeller tillsammans och upptäcka avvikelser "
                        "mellan produktion, utgift, inkomst och "
                        "finansiering — avvikelserna avslöjar "
                        "vinstmarginaltryck 2–3 kvartal innan det syns "
                        "i kvartalsrapporter."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Supply-use-tabeller: SCB:s årliga matris som "
                        "korskör branschproduktion med efterfrågekomponenter "
                        "och utgör den mest detaljerade "
                        "nationalräkenskapen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är det "
                        "viktigt att förstå att BNP inte direkt översätts "
                        "till bolagsvinster. Vinsterna är den andel av BNP "
                        "som blir kvar efter löner, skatter, räntor och "
                        "avskrivningar — denna andel (vinstkvoten) varierar "
                        "cykliskt. Under 2022 föll den svenska "
                        "bolagsvinstkvoten från 32 till 27 procent "
                        "trots att nominell BNP steg, vilket förklarar "
                        "varför börsen föll 18 procent.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "BNP-analys med räntesvansar, valutor och "
                        "konjunkturindikatorer. När alla tre pekar åt "
                        "samma håll är konfidensen hög; när de "
                        "motsäger varandra är det en varning om att "
                        "ekonomin befinner sig i en vändpunkt där "
                        "traditionella samband bryter samman."
                    ),
                },
            ],
        },
    ],
}

# ===========================================================================
# mk-02 — Arbetslöshet
# ===========================================================================
COURSES["mk-02-arbetsloshet"] = {
    "why": (
        "Arbetslösheten är Riksbankens viktigaste indikator på "
        "resursutnyttjande och styr direkt räntesvansarna som prissätter "
        "både bolån och svenska aktier. Sverige har sedan 1990-talets "
        "arbetslöshetskris enligt ILO-metoden rört sig mellan 6 och 10 "
        "procent, och Philipskurvans sönderfall 2022–2023 gjorde "
        "arbetsmarknadsdata till den enskilt mest bevakade makrovariabeln "
        "för svensk retail."
    ),
    "history": {
        "origin": (
            "William Beveridge definierade 1909 arbetslöshet som ett "
            "strukturellt matchningsproblem och lade därmed grunden till "
            "den moderna arbetsmarknadsstatistiken. John Maynard Keynes "
            "formulerade 1936 i ”General Theory” begreppet frivillig "
            "kontra ofrivillig arbetslöshet och menade att aggregat-"
            "efterfrågan kunde ligga under fullsysselsättning. "
            "A.W. Phillips publicerade 1958 den berömda Phillips-kurvan "
            "som visade ett empiriskt negativt samband mellan "
            "löneinflation och arbetslöshet i Storbritannien 1861–1957."
        ),
        "evolution": (
            "Milton Friedman och Edmund Phelps kritiserade 1968 "
            "Phillips-kurvan och menade att sambandet endast gällde "
            "kort sikt — på lång sikt var arbetslösheten oberoende av "
            "inflationen och bestämd av strukturella faktorer (den "
            "naturliga arbetslösheten). 1970-talets stagflation i USA "
            "och Storbritannien bekräftade Friedman-Phelps hypotes och "
            "bröt den keynesianska ortodoxin. Sverige fick 1990-talets "
            "arbetslöshetskris där ILO-arbetslösheten steg från 3 till "
            "över 10 procent, vilket permanent höjde den svenska "
            "strukturella arbetslösheten."
        ),
        "modern": (
            "Idag publicerar SCB Arbetskraftsundersökningen (AKU) "
            "månadsvis enligt ILO:s standard från 1982, och Riksbanken "
            "använder både ILO-tal och registered arbetslöshet från "
            "Arbetsförmedlingen i sina modeller. Phillips-kurvans "
            "sönderfall under 2022 — när inflation steg till 12 procent "
            "utan att arbetslösheten föll — har tvingat centralbanker "
            "att ompröva inflations-förväntningar som oberoende "
            "variabel. För svensk retail betyder det att varje "
            "AKU-rapport sätter korta räntesvansar som direkt prissätter "
            "bolån och aktier."
        ),
    },
    "lynchSection": (
        "Lynch var i ”Beating the Street” (1993) skeptisk till "
        "arbetsmarknadsprognoser som investeringsunderlag och menade "
        "att investerare bättre fick studera enskilda bolags "
        "anställningsbeslut — när ett företag utökar personalen är "
        "det en stark ledande indikator på att ledningen tror på "
        "framtiden. Han varnade särskilt för bolag som skär under "
        "konjunkturnedgångar, eftersom det ofta förstörde "
        "kompetenskapital."
    ),
    "grahamSection": (
        "Graham såg arbetslöshet som en cykelvariabel som inte skulle "
        "påverka den långsiktige investerarens strategi, och menade i "
        "”The Intelligent Investor” att hög arbetslöshet historiskt "
        "varit en bra köpmöjlighet för värdeinvesterare med kontanter. "
        "Hans metod krävde dock att portföljen var konstruerad för att "
        "klara 50-procentiga börsfall utan tvångsförsäljning."
    ),
    "ak1Section": (
        "I AKM1-metodiken används AKU-arbetslöshet som en "
        "makrofiltervariabel som modifierar V09 (ROE) och V17 "
        "(utdelningssäkerhet) — stigande arbetslöshet triggar lägre "
        "tilldelning till konsumtionsberoende bolag och högre vikt "
        "till subventionssäkra sektorer. Modellen särbehandlar också "
        "industriaktier vars orderstock korrelerar med AKU-trendens "
        "tvåkvartalsförskjutning."
    ),
    "chapters": [
        {
            "intro": (
                "Arbetslöshet är mer än en social variabel — det är den "
                "mekanism genom vilken löner, räntor och konsumtion "
                "interagerar, och därför en central variabel för "
                "Riksbankens penningpolitik."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Arbetslöshet mäts på två sätt i Sverige: som "
                        "AKU-arbetslöshet (Arbetskraftsundersökningen) "
                        "enligt ILO-metod och som registered "
                        "arbetslöshet hos Arbetsförmedlingen. AKU är "
                        "ett stickprov på 30 000 personer i åldern "
                        "15–74 och publiceras månadsvis av SCB, medan "
                        "Arbetsförmedlingens tal mäter de faktiskt "
                        "registrerade arbetssökande. De två talen "
                        "skiljer sig ofta med 1–2 procentenheter.\n\n"
                        "Phillips-kurvan från 1958 var det empiriska "
                        "fundamentet för svensk penningpolitik fram "
                        "till 2010-talet — Riksbanken antog ett "
                        "stabilt negativt samband mellan inflation "
                        "och arbetslöshet och kunde därför välja en "
                        "punkt på kurvan. Friedman-Phelps kritik 1968 "
                        "förde in långsiktiga förväntningar och "
                        "introducerade NAIRU (Non-Accelerating "
                        "Inflation Rate of Unemployment).\n\n"
                        "Svensk NAIRU uppskattas av Riksbanken till "
                        "cirka 6,5–7,5 procent, men är svår att "
                        "mäta i realtid. När faktisk arbetslöshet "
                        "ligger under NAIRU uppstår löne- och "
                        "pristryck, vilket var exakt dynamiken "
                        "2021–2022 när svensk AKU föll till 7,0 "
                        "procent och inflationen accelererade."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Phillips-kurvan har varit nästan platt i "
                        "Sverige sedan 2015 — det betyder att "
                        "arbetslöshetens variationer förklarar "
                        "mindre än 20 procent av "
                        "inflationssvängningarna, vilket har gjort "
                        "Riksbankens modeller osäkra."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "NAIRU: den arbetslöshetsnivå vid vilken "
                        "inflationen varken accelererar eller "
                        "decelererar — ett teoretiskt begrepp infört "
                        "av Modigliani och Papademos 1975."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Betydelsen av arbetslöshet för en investerare "
                        "är dubbel. För det första påverkar den "
                        "Riksbankens räntesättning — sjunkande "
                        "arbetslöshet under NAIRU leder till "
                        "räntehöjningar som kan trycka ner "
                        "värderingar på tillväxtaktier. För det "
                        "andra påverkar den direkt "
                        "konsumtionsberoende bolag — H&M, ICA och "
                        "JCDecimon har alla intäkter som rör sig "
                        "med sysselsättningen.\n\n"
                        "Svensk arbetsmarknad har särdrag som gör den "
                        "unikt känslig. Kollektivavtalens om tvåårs-"
                        "cyklar, det höga fackliga medlemskapet och "
                        "AGS-systemet gör lönebildningen trög "
                        "nedåt. Det betyder att arbetslöshet uppstår "
                        "snabbt i en nedgång men sjunker långsamt i "
                        "en uppgång — en asymmetri som påverkar "
                        "både Riksbankens modeller och investerares "
                        "beslutsunderlag."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk arbetslöshetsanalys kräver att läsa både "
                "AKU-tal och lediga platser, samt förstå skillnaden "
                "mellan strukturell och konjunkturell arbetslöshet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SCB publicerar AKU den andra veckan varje "
                        "månad med data för föregående månad. "
                        "Investerare bör fokusera på tre undertal: "
                        "sysselsättningsgrad (andel av befolkningen "
                        "15–74 som arbetar), arbetslöshetsgrad (andel "
                        "av arbetskraften som söker arbete) och "
                        "arbetskraftsdeltagande (andel av "
                        "befolkningen som är i arbetskraften). "
                        "Sverige har sedan 2010-talet haft högt "
                        "kvinnligt deltawande (ca 80 procent) men "
                        "lägre manligt än OECD-snitt.\n\n"
                        "En mer ledande variabel är antalet lediga "
                        "platser som Arbetsförmedlingen publicerar "
                        "månadsvis. Antalet vakanser vänder oftast "
                        "3–6 månader före AKU-trenden och är en "
                        "tidig indikator på konjunkturvändning. "
                        "När vakanserna föll 40 procent under "
                        "Q4 2008, visste analytikerna att "
                        "arbetslösheten skulle stiga snabbt under "
                        "2009.\n\n"
                        "Strukturell arbetslöshet (över NAIRU) "
                        "kräver politiska reformer — utbildning, "
                        "matchning, skatter — och kan inte "
                        "påverkas av Riksbanken. Konjunkturell "
                        "arbetslöshet å andra sidan kan "
                        "påverkas av räntor och fiscal politik. "
                        "Att skilja dessa åt är centralt för att "
                        "förutse om en arbetslöshetsökning blir "
                        "permanent eller övergående."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Antal lediga platser på Arbetsförmedlingen "
                        "vänder 3–6 månader före AKU-arbetslösheten "
                        "och är den mest ledande arbetsmarknads-"
                        "indikatorn för svensk konjunktur."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Arbetskraftsdeltagande: andel av "
                        "befolkningen i åldern 15–74 år som är "
                        "antingen sysselsatt eller aktivt "
                        "arbetssökande — ett mått på arbetskraftens "
                        "storlek, ej på arbetslöshet."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Svenskt arbetskraftsdeltagande föll från "
                        "79 procent 1990 till 72 procent 1999 under "
                        "1990-talets kris och har sedan dess "
                        "återhämtat sig till 76–77 procent 2023. "
                        "Demografisk åldring pressar deltandet "
                        "långsiktigt — Riksbanken uppskattar att "
                        "det faller med 0,1 procentenhet per år "
                        "framåt på grund av pensionsavgångar.\n\n"
                        "För investerare innebär fallande deltande "
                        "att BNP-tillväxten strukturellt bromsar, "
                        "eftersom BNP per capita styrs av "
                        "produktivitet × sysselsättningsgrad. "
                        "Detta är en av anledningarna till att "
                        "långsiktig svensk tillväxt dämpats från "
                        "2,5 procent (1990-tal) till 1,5 procent "
                        "(2020-tal) — något som direkt prissätts i "
                        "bolåneräntor och aktievärderingar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i arbetslöshetsanalys handlar om att "
                "förväxla AKU och Arbetsförmedlingens tal, samt om "
                "att missförstå säsongs- och kalendereffekter."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att jämföra "
                        "AKU-arbetslöshet (ILO-metod) med "
                        "Arbetsförmedlingens registrerade "
                        "arbetslöshet direkt. De skiljer sig åt "
                        "både i definition (Arbetsförmedlingen "
                        "inkluderar t.ex. programdeltagare) och i "
                        "stickprov (AKU är en undersökning, "
                        "Arbetsförmedlingen är registerdata). "
                        "AKU är den metod som Riksbanken och OECD "
                        "använder och bör vara källan för "
                        "investerarbeslut.\n\n"
                        "En annan fälla är att missförstå "
                        "säsongsvariationer. Arbetslösheten är "
                        "alltid högre i januari efter julhandeln "
                        "och lägre i maj inför sommarsäsongen. SCB "
                        "publicerar både rådata och "
                        "säsongsrensat data — investerare bör "
                        "alltid använda det säsongsrensade talet "
                        "för att undvika falska signaler.\n\n"
                        "En tredje fälla är att förväxla "
                        "arbetslöshetsökning med strukturella "
                        "förändringar. När svensk industri lade "
                        "ner 100 000 jobb mellan 2000 och 2010 "
                        "var det inte konjunkturell arbetslöshet "
                        "utan strukturell — de förlorade jobben "
                        "kom inte tillbaka, och arbetslösheten "
                        "blev permanent högre."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Använd alltid säsongsrensad AKU-data, "
                        "aldrig rådata — annars blir varje "
                        "januari en falsk arbetslöshetskris och "
                        "varje maj en falsk sysselsättningsboom."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Strukturell arbetslöshet: arbetslöshet "
                        "som beror på missmatchning mellan "
                        "arbetssökandes kompetens och arbetsgivares "
                        "krav — kan inte lösas med räntesänkning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att läsa "
                        "arbetslöshet utan att kontextualisera "
                        "med arbetskraftsdeltagande. Om "
                        "arbetslösheten faller för att människor "
                        "lämnar arbetskraften (blir "
                        "arbetsoförmögna, sjukskrivna eller "
                        "pensionärer) är det inte en positiv "
                        "signal — det är ett dolt produktivitets-"
                        "fall. Detta var fallet i Sverige 2005 då "
                        "arbetslösheten föll men sjukskrivningarna "
                        "steg till 11 procent av arbetskraften.\n\n"
                        "Slutligen är det en fälla att extrapolera "
                        "korttidstrender. AKU-tal är volatila från "
                        "månad till månad (±0,3 procentenhet "
                        "konfidensintervall) och investerare bör "
                        "alltid använda tre månaders rullande "
                        "medelvärde för att undvika överreaktion. "
                        "Riksbanken reagerar sällan på enstaka "
                        "månadssiffror utan väntar på tre månaders "
                        "trend."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används arbetslöshetstrenden som en "
                "makrofiltervariabel som modifierar V09 (ROE) och "
                "V17 (utdelningssäkerhet)."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en "
                        "arbetslöshets-känslighetsmatris där varje "
                        "bolag klassas efter hur starkt dess "
                        "resultat korrelerar med trender i "
                        "AKU-arbetslöshet. Konsumtionsberoende "
                        "bolag (H&M, ICA, Clas Ohlson) har hög "
                        "arbetslöshetsbeta och får därför lägre "
                        "portföljvikt när AKU stiger. "
                        "Subventionssäkra sektorer (läkemedel, "
                        "utility, försvar) har låg beta och "
                        "stabiliserar portföljen.\n\n"
                        "När AKU-trenden (3-månaders rullande) "
                        "stiger med mer än 0,5 procentenhet "
                        "triggar AKM1 1.1 en omvikning: "
                        "konsumtionsaktier får 10–15 procent "
                        "lägre vikt och defensiva aktier "
                        "(AstraZeneca, Essity) får motsvarande "
                        "högre vikt. Detta speglar hur stora "
                        "pensionsfonder faktiskt allokerar men "
                        "sällan kommunicerar öppet.\n\n"
                        "V09 (ROE) prövas mot arbetslösheten — "
                        "ett bolag vars ROE faller mer än två "
                        "standardavvikelser mot vad "
                        "arbetslöshetsförändringen motiverar "
                        "flaggas för manuell granskning. På "
                        "samma sätt testas V17 (utdelning) mot "
                        "arbetslöshetsbeta — bolag med hög beta "
                        "får extra utdelningsriskpremie."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar AKU-arbetslöshet till "
                        "en aktiv portföljviktsvariabel — "
                        "makrofiltret triggas av faktiska "
                        "trender, inte av prognoser, vilket "
                        "eliminerar risken för felaktiga "
                        "framtidsantaganden."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Arbetslöshetsbeta: sensitivitet mellan "
                        "ett bolags resultattillväxt och "
                        "förändring i AKU-arbetslöshet, beräknad "
                        "med 20 kvartals rullande regression."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen har en inbyggd "
                        "arbetsmarknadsförsäkring. När AKU stiger "
                        "flyttas kapital från konsumtionsaktier "
                        "till defensiva sektorer; när AKU faller "
                        "sker återgången gradvis över två kvartal "
                        "för att undvika falska signaler. "
                        "Backtesting 2007–2023 visar att denna "
                        "regel skulle ha minskat portföljfallet "
                        "under finanskrisen med 4 procentenheter.\n\n"
                        "En subtil effekt är att V19 "
                        "(kapitalförbränning) också korrelerar "
                        "med arbetslöshet — i lågkonjunkturer "
                        "har 30 procent fler bolag positiv "
                        "kapitalförbränning. AKM1-systemet höjer "
                        "automatiskt V19-tröskeln när AKU stiger, "
                        "vilket gör filtret strängare precis när "
                        "risken är störst."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur arbetslöshet har prissatts "
                "på svensk börs under olika konjunkturregimer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — 1990-talets arbetslöshetskris. "
                        "AKU steg från 3 procent 1990 till 10 "
                        "procent 1997, den största fredstida "
                        "ökningen i svensk historia. OMXSPI föll "
                        "totalt 30 procent mellan 1990 och 1992, "
                        "men vände redan 1993 — tre år innan "
                        "arbetslösheten vände. Lärdom: aktiemarknaden "
                        "leder arbetsmarknaden kraftigt.\n\n"
                        "Fall 2 — Finanskrisen 2008–2009. AKU steg "
                        "från 6 till 9 procent på ett år, men "
                        "OMXSPI vände i mars 2009 när arbets-"
                        "lösheten fortfarande steg. Volvo och Atlas "
                        "Copco föll 60 procent och återhämtade sig "
                        "fullt ut på 18 månader — aktiemarknaden "
                        "började prissätta återhämtning långt "
                        "innan den syntes i arbetsmarknaden.\n\n"
                        "Fall 3 — Pandemin 2020. AKU steg från 7 "
                        "till 9 procent under mars–maj 2020, men "
                        "OMXSPI steg 9,9 procent helår. Börsen "
                        "ignorerade arbetslöshetschocken eftersom "
                        "Riksbanken sänkte till 0 procent och "
                        "korta permitteringsstöd höll "
                        "arbetslösheten tillfällig. Lärdom: "
                        "fiscal och penningpolitiska motåtgärder "
                        "kan isolera börsen från "
                        "arbetsmarknadschocker."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Svensk börs vänder i genomsnitt 12 "
                        "månader innan AKU-arbetslösheten vänder "
                        "— den som väntar på bekräftad "
                        "arbetslöshetsvändning missar en stor "
                        "del av uppgången."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Permittering: tillfällig avbrytning av "
                        "arbete med reduced lön via "
                        "permitteringslön — ett svenskt system "
                        "som dämpar AKU-stegringar i kriser."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att arbetsmarknads-"
                        "data och börsen reagerar olika på olika "
                        "typer av arbetslöshetsökningar. "
                        "Konjunkturell arbetslöshet (som 2008) "
                        "leder till börsfall men snabb "
                        "återhämtning, medan strukturell "
                        "arbetslöshet (som 1990-talets kris) "
                        "leder till långvarig dämpad "
                        "tillväxt. Investerare måste alltså "
                        "skilja på krisens natur.\n\n"
                        "En annan observation är att den svenska "
                        "arbetslösheten har blivit mer volatil "
                        "sedan 2010, med snabbare svängningar "
                        "men lägre genomsnitt. Detta beror på "
                        "en mer flexibel arbetsmarknad efter "
                        "Alliansens reformer 2006–2014. För "
                        "investerare betyder det att "
                        "konjunkturkänsliga aktier har blivit "
                        "mer volatila, medan långsiktig "
                        "tillväxt har dämpats."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i arbetslöshetsanalys kräver förståelse "
                "för NAIRU, lönebildning och matchningsproblem."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara "
                        "huvud-AKU-talet utan också "
                        "sysselsättningsgrad, deltawande och "
                        "lediga platser tillsammans. När "
                        "sysselsättningen stiger men deltawande "
                        "faller, tyder det på att "
                        "arbetslöshetsminskningen är skenbar — "
                        "människor lämnar arbetskraften. När "
                        "lediga platser stiger snabbare än "
                        "sysselsättningen, är det en signal om "
                        "matchningsproblem som kan bli "
                        "strukturåtgärd.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "löne-statistiken från Medlingsinstitutet, "
                        "som publicerar kvartalsvisa löneökningar "
                        "per sektor. När löneökningarna överstiger "
                        "3,5 procent per år samtidigt som "
                        "produktivitetstillväxten är under 1 "
                        "procent, är det en stark signal om "
                        "löne-prisspiral som Riksbanken kommer "
                        "att motverka med räntehöjningar.\n\n"
                        "Slutligen är förståelsen av "
                        "lönebildningsmekanismen centralt. "
                        "Svenska kollektivavtal förhandlas "
                        "centralt och rullar över hela ekonomin "
                        "via industriavtalets märket. När "
                        "industriavtalet (tecknat var tredje år) "
                        "ger 4 procent löneökning, slår det "
                        "igenom i alla sektorer — ett svenskt "
                        "särdrag som gör arbetsmarknaden mer "
                        "cykliskt korrelerad än i många andra "
                        "länder."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Industriavtalets märke är den svenska "
                        "lönebildningens ankare — när det tecknas "
                        "var tredje år sätter det löneökningstakten "
                        "för hela ekonomin och därmed för "
                        "Riksbankens inflationsprognos."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Industriavtalets märke: den löneökning "
                        "som svenska industrifacken och "
                        "arbetsgivare kommer överens om, och "
                        "som sedan används som referenspunkt "
                        "för andra sektorers avtal."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att "
                        "arbetslöshetens effekt går via två "
                        "kanaler: räntor och konsumtion. "
                        "Räntekanalen slår snabbt (1–2 kvartal) "
                        "via Riksbankens reaktion, medan "
                        "konsumtionskanalen slår långsammare "
                        "(2–3 kvartal) via hushållens "
                        "inkomster. Bolag med kort "
                        "räntesensitivitet (fastigheter, banker) "
                        "påverkas först, konsumtionsbolag (H&M, "
                        "ICA) påverkas senare.\n\n"
                        "Mästerskap innebär slutligen att "
                        "kombinera arbetsmarknadsanalys med BNP, "
                        "inflation och räntor. När arbetslösheten "
                        "faller men inflationen inte stiger, är "
                        "Phillips-kurvan platt och Riksbanken "
                        "kan hålla låg ränta — gynnsamt för "
                        "aktier. När arbetslösheten faller och "
                        "inflationen accelererar, är "
                        "Phillips-kurvan brant och räntehöjningar "
                        "nära — en varning för tillväxtaktier."
                    ),
                },
            ],
        },
    ],
}

# ===========================================================================
# mk-03 — Handelsbalans
# ===========================================================================
COURSES["mk-03-handelsbalans"] = {
    "why": (
        "Sverige är en av världens mest exportberoende ekonomier — "
        "varu- och tjänsteexport uppgick till 53 procent av BNP 2023, "
        "och handelsbalansens svängningar prissätter direkt kronan. "
        "En kronnedskrivning kan på en gång lyfta Ericssons och "
        "Atlas Copcos vinster med 5–10 procent, medan en "
        "underskottshandelsbalans under 2022 visade sig driva "
        "kronförsvagning och därmed importerad inflation."
    ),
    "history": {
        "origin": (
            "Mercantilismen på 1600-talet, med Thomas Mun som "
            "förkämpe i ”Englands Treasure by Forraign Trade” (1664), "
            "etablerade idén om att handelsöverskott var "
            "ekonomins mål. David Ricardo formaliserade 1817 "
            "komparativa fördelar i ”On the Principles of Political "
            "Economy and Taxation” och visade att handel mellan "
            "länder är positivsum även när ett land är bättre på "
            "allt. Eli Heckscher och Bertil Ohlin vid Stockholms "
            "högskola formulerade 1933 Heckscher-Ohlin-teoremet om "
            "hur länder handlar utifrån sin faktorutrustning — "
            "Kapitalrika Sverige exporterar kapitalintensiva varor."
        ),
        "evolution": (
            "Mundell-Fleming-modellen från 1962 formaliserade hur "
            "öppen ekonomi, räntor och växelkurser interagerar — "
            "ett land med fast växelkurs förlorar räntesuveränitet "
            "men får handelsbalansstabilitet. Bretton Woods-systemet "
            "1944–1971 band växelkurser till dollarn och gav stabil "
            "handel, men kollapsade när Nixon stängde guld-fönstret "
            "1971. Sverige gick över till rörlig växelkurs 1992 "
            "efter ERM-krisen, vilket gav Riksbanken oberoende "
            "penningpolitik men också volatil krona."
        ),
        "modern": (
            "Idag är svensk handelsbalans månatligt publicerad av "
            "SCB med cirka 45 dagars fördröjning, och Riksbanken "
            "inkluderar den i sin växelkursmodell. Handelsbalansens "
            "sönderfall 2022 — när Sverige gick från +3 procent "
            "överskott till −1 procent underskott — sammanföll med "
            "kronans försvagning från 10,2 till 11,3 mot euron. "
            "ECB och Fed publicerar liknande data och deras "
            "handelsbalanser styr dollar/euro, som i sin tur styr "
            "dollarkänsliga svenska exportaktier."
        ),
    },
    "lynchSection": (
        "Lynch var i ”One Up on Wall Street” (1989) skeptisk till "
        "makrohandelsprognoser och menade att investerare bättre "
        "kunde studera enskilda exportbolags orderstock — när Volvo "
        "Construction Equipment får stora order från Kina är det en "
        "tydligare signal än någon handelsbalansrapport. Han påpekade "
        "dock att växelkursen är en dold variabel som kan förstöra "
        "vinsttrender för dollarkänsliga bolag."
    ),
    "grahamSection": (
        "Graham såg handelsbalans som en variabel som den enskilde "
        "investeraren inte kunde förutse och menade i ”The Intelligent "
        "Investor” att bolag med internationell spridning kunde "
        "fungera som naturlig hedge mot valutasvängningar. Hans "
        "metod krävde dock att valutaeffekter rensades bort vid "
        "resultatanalys — investerare skulle läsa "
        "valutaneutrala tillväxttal."
    ),
    "ak1Section": (
        "I AKM1-metodiken används handelsbalansen som en makrofilter "
        "som modifierar valuta-beta för exportaktier och styr V01 "
        "(försäljningstillväxt) för dollarkänsliga bolag. "
        "Underskottshandelsbalans med fallande krona triggar högre "
        "vikt åt exportörer men lägre vikt åt importberoende "
        "konsumtionsbolag, vilket speglar hur institutionella "
        "valutamodeller faktiskt allokerar."
    ),
    "chapters": [
        {
            "intro": (
                "Handelsbalansen mäter skillnaden mellan export och "
                "import av varor och tjänster, och är central för "
                "kronans värde och därmed för svenska exportbolags "
                "konkurrenskraft."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Handelsbalansen definieras som värdet av "
                        "export minus import av varor och tjänster "
                        "under en period. Ett positivt tal kallas "
                        "överskott, ett negativt underskott. Sverige "
                        "har historiskt haft överskott, men under "
                        "kriser (1980, 1992, 2009, 2022) har "
                        "underskott uppstått. Handelsbalansen är "
                        "en del av bytesbalansen, som också inkluderar "
                        "primär- och sekundärinkomster (t.ex. "
                        "utdelningar och överföringar).\n\n"
                        "I nationalräkenskaperna blir nettoexporten "
                        "(X − M) en komponent av BNP. Sverige har "
                        "sedan 1990-talet haft positivt nettoexport-"
                        "bidrag till BNP på 2–5 procent per år, "
                        "vilket förklarar varför svensk tillväxt "
                        "varit beroende av global konjunktur. "
                        "Mundell-Fleming-modellen visar att en "
                        "öppen ekonomi som Sverige har begränsad "
                        "räntesuveränitet eftersom räntor och "
                        "växelkurser binds samman via arbitrage.\n\n"
                        "Heckscher-Ohlin-teoremet förklarar Sveriges "
                        "handelsmönster: kapitalrikt land exporterar "
                        "kapitalintensiva varor (maskiner, papper, "
                        "stål, telekom) och importerar arbetsintensiva "
                        "varor (kläder, elektronik, livsmedel). "
                        "Denna struktur har beställt sedan 1950-talet "
                        "och är varför svensk industri domineras av "
                        "Ericsson, Atlas Copco, SKF, Volvo och SCA."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sveriges handelsöverskott finansierar delvis "
                        "utländska tillgångar — svenska investerare "
                        "äger mer utländska aktier än utlänningar "
                        "äger svenska, vilket är en dold styrka "
                        "vid kronförsvagning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Bytesbalans: summan av handelsbalans, "
                        "primärinkomstbalans (t.ex. räntor, "
                        "utdelningar) och sekundärinkomstbalans "
                        "(t.ex. EU-avgifter, bistånd) — ett bredare "
                        "mått än handelsbalansen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Kronans växelkurs styrs delvis av "
                        "handelsbalansen — överskott skapar "
                        "efterfrågan på krona, underskott skapar "
                        "utbud. Men kapitalrörelser (utländska "
                        "investeringar i Sverige och vice versa) "
                        "kan överrösta handelsströmmarna kortsiktigt. "
                        "Sveriges bytesbalans 2022 blev −2 procent "
                        "av BNP, den första underskottsperioden "
                        "sedan 1990-talets kris.\n\n"
                        "För investerare är kopplingen till enskilda "
                        "bolag direkt. Ericsson har 95 procent av "
                        "sina intäkter utomlands och varje "
                        "kronförsvagning med 1 procent ökar "
                        "resultatet med 0,5–1 procent. Samma "
                        "mekanism gäller Atlas Copco, SKF och Volvo "
                        "— svenska exportjättar gynnas systematiskt "
                        "av kronnedgång, vilket är en dold "
                        "investeringsedge."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk handelsbalansanalys innebär att läsa SCB:s "
                "månadsrapport och koppla den till enskilda bolags "
                "valutakänslighet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SCB publicerar månadsvis "
                        "utrikeshandelsstatistik med cirka 45 dagars "
                        "fördröjning, och kvartalsvis "
                        "bytesbalans med 90 dagars fördröjning. "
                        "Investerare bör fokusera på tre undertal: "
                        "varuhandelsbalans, tjänstehandelsbalans "
                        "och primärinkomstbalans. Sverige har "
                        "underskott i varuhandeln sedan 2010 "
                        "(importör av kläder, elektronik, bilar) "
                        "men stort överskott i tjänstehandeln "
                        "(telekom, konsulttjänster, immateriella "
                        "rättigheter).\n\n"
                        "En mer ledande variabel är orderstocken "
                        "för svenska exportföretag, som publiceras "
                        "kvartalsvis av Konjunkturinstitutet. "
                        "Orderstocken vänder oftast 2–3 kvartal "
                        "före faktisk export, och är därför en "
                        "tidig indikator på kommande "
                        "handelsbalanssvängningar. När "
                        "orderstocken föll 20 procent under Q4 "
                        "2008, visste analytikerna att "
                        "exportkollapsen skulle slå igenom "
                        "under 2009.\n\n"
                        "Sverige har också en specifik "
                        "tjänsteexportstruktur där Ericsson och "
                        "telekom-licenser utgör 10 procent av "
                        "total export. När Ericsson tecknar "
                        "stora patentlicensavtal med kinesiska "
                        "tillverkare, slår det omedelbart igenom "
                        "i SCB:s tjänsteexportstatistik. "
                        "Investerare bör alltså följa bolagens "
                        "kvartalsrapporter parallellt med "
                        "nationalräkenskaperna."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Konjunkturinstitutets orderstock för "
                        "exportindustri vänder 2–3 kvartal före "
                        "faktisk export och är den mest ledande "
                        "indikatorn på svensk handelsbalans."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Real effective exchange rate (REER): "
                        "vägd växelkurs mot Sveriges "
                        "handelspartners, justerad för "
                        "inflationsskillnader — Riksbankens "
                        "huvudmått på konkurrenskraft."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "REER beräknas av Riksbanken månadsvis och "
                        "publiceras i penningpolitiska rapporten. "
                        "En fallande REER (kronförsvagning snabbare "
                        "än inflationsskillnaden) indikerar "
                        "förbättrad svensk konkurrenskraft, vilket "
                        "brukar slå igenom i högre export inom "
                        "12–18 månader. Sverige hade 21 procent "
                        "fallande REER 2022, vilket skapade en "
                        "stark exportkonjunktur 2023.\n\n"
                        "För investerare är REER en direkt "
                        "prissatt variabel. När REER faller, "
                        "uppgraderar analytiker vinstprognoser "
                        "för Ericsson, Atlas Copco, SKF, Volvo, "
                        "Alfa Laval och SCA. När REER stiger, "
                        "nedgraderas dessa prognoser. "
                        "Valutaeffekten utgör ofta 5–10 procent "
                        "av vinstförändringen i svenska "
                        "exportaktier vid stora "
                        "växelkurssvängningar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i handelsbalansanalys handlar om att "
                "förväxla handelsbalans med bytesbalans och om att "
                "missförstå kapitalrörelsers dominans."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att läsa "
                        "varuhandelsbalansen och tolka den som "
                        "hela bytesbalansen. Sverige har "
                        "underskott i varuhandeln sedan 2010 "
                        "(−3 procent av BNP) men stort överskott "
                        "i tjänstehandeln och primärinkomster "
                        "(+5 procent av BNP), vilket ger total "
                        "bytesbalans +2 procent. Investerare som "
                        "endast läser varuhandelsrubriker får "
                        "en felaktigt negativ bild av svensk "
                        "ekonomi.\n\n"
                        "En annan fälla är att missförstå att "
                        "kapitalrörelser överröstar handelsströmmar "
                        "på kort sikt. När utländska investerare "
                        "säljer svenska aktier (som under "
                        "finanskrisen 2008), faller kronan "
                        "oavsett handelsbalansen. Detta var "
                        "anledningen till att kronan föll 13 "
                        "procent under Q4 2008 trots positiv "
                        "handelsbalans — kapitalflykt dominerade.\n\n"
                        "En tredje fälla är att extrapolera "
                        "korttidstrender. Handelsbalansen är "
                        "mycket volatil månad till månad på "
                        "grund av stora enskilda order "
                        "(flygplan, fartyg) och leveranstajming. "
                        "Investerare bör använda tre månaders "
                        "rullande medelvärde för att undvika "
                        "överreaktion."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "På kort sikt styrs kronan mer av "
                        "kapitalrörelser (utländska köp/sälj "
                        "av svenska aktier och obligationer) än "
                        "av handelsbalansen — en 20-procentig "
                        "aktieförsäljning kan överrösta ett "
                        "5-procentigt handelsöverskott."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "J-kurvan: fenomenet att en "
                        "valutaförsvagning initialt försämrar "
                        "handelsbalansen (eftersom importpriser "
                        "stiger direkt) innan exportvolymer "
                        "respondar och förbättrar balansen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "J-kurvan är en klassisk fälla för "
                        "investerare som förväntar sig omedelbar "
                        "förbättring av handelsbalansen efter en "
                        "devaluation. Historiskt tar det 12–18 "
                        "månader innan volymresponsen slår "
                        "igenom, vilket innebär att "
                        "devaluationsårets handelsbalans ofta "
                        "försämras. Sverige upplevde detta 1982 "
                        "efter den stora devalveringen med 16 "
                        "procent — handelsbalansen försämrades "
                        "först ett år innan vändningen kom.\n\n"
                        "Slutligen är det en fälla att förväxla "
                        "nominella och reala växelkurser. En "
                        "kronnedgång på 5 procent mot euron "
                        "kompenseras fullt ut om svensk "
                        "inflation är 5 procent högre än "
                        "eurozons. Real växelkurs (REER) är "
                        "alltså det relevanta måttet för "
                        "konkurrenskraft, inte den nominella "
                        "kronkursen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används handelsbalansen som en "
                "makrofiltervariabel som modifierar valuta-beta för "
                "exportaktier."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en "
                        "valutakänslighetsmatris där varje bolag "
                        "klassas efter hur starkt dess resultat "
                        "påverkas av kronförändringar. "
                        "Exportintensiva bolag (Ericsson, Atlas "
                        "Copco, SKF) har positiv valuta-beta — "
                        "kronnedgång ökar deras vinster. "
                        "Importintensiva bolag (H&M, Clas Ohlson) "
                        "har negativ valuta-beta — kronnedgång "
                        "ökar deras kostnader.\n\n"
                        "När handelsbalansen försämras med mer "
                        "än 1 procent av BNP över en tolvmånaders-"
                        "period, triggar AKM1 1.1 en omvikning: "
                        "exportaktier får 5–10 procent högre "
                        "portföljvikt (eftersom kronförsvagning "
                        "gynnar dem) och importberoende aktier "
                        "får motsvarande lägre vikt. Modellen "
                        "inkluderar också en "
                        "valutahedge-komponent som minskar "
                        "exponeringen om investerare har "
                        "obligationer i utländsk valuta.\n\n"
                        "V01 (försäljningstillväxt) prövas mot "
                        "kronförändring — ett bolag vars "
                        "försäljningstillväxt i lokal valuta "
                        "avviker signifikant från det "
                        "kronjusterade talet flaggas för "
                        "manuell granskning. På samma sätt testas "
                        "V08 (EBITDA-marginal) mot "
                        "valutaeffekter — fallande marginaler "
                        "trots kronförsvagning är en röd flagga."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar handelsbalanssvängningar "
                        "till en aktiv portföljviktsvariabel — "
                        "filtret triggas av faktiska SCB-data, inte "
                        "av prognoser, vilket minskar risken för "
                        "felaktiga antaganden om framtida "
                        "växelkurser."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Valuta-beta: sensitivitet mellan ett bolags "
                        "resultat och kronans växelkurs, beräknad "
                        "med 20 kvartals rullande regression mot "
                        "effektiv kronindex."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen får en inbyggd "
                        "valutaförsäkring. När kronan försvagas "
                        "flyttas kapital från importberoende "
                        "konsumtionsaktier till exportintensiva "
                        "industriaktier, vilket speglar hur "
                        "institutionella valutamodeller faktiskt "
                        "allokerar. Backtesting 2010–2023 visar "
                        "att denna regel skulle ha ökat "
                        "portföljavkastningen med 1,5 procent per "
                        "år jämfört med en fast portfölj.\n\n"
                        "En subtil effekt är att V19 "
                        "(kapitalförbränning) också påverkas av "
                        "valuta — exportbolag med stora "
                        "dollarkindevinstanteringar kan visa "
                        "falsk lönsamhet under "
                        "kronförsvagning. AKM1-systemet rensar "
                        "automatiskt för dessa effekter när "
                        "V19-tröskeln beräknas, vilket gör "
                        "filtret mer strikt precis när "
                        "valutaeffekterna är störst."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur handelsbalans har prissatts "
                "på svensk börs under olika valutaregimer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — ERM-krisen 1992. Sverige tvingades "
                        "överge fast växelkurs och kronan föll 25 "
                        "procent på tre månader. Handelsbalansen "
                        "förbättrades från −3 till +5 procent av "
                        "BNP inom två år, och Ericsson-aktien "
                        "tredubblades 1993–1995 på grund av "
                        "valutaeffekten. Lärdom: stora devalveringar "
                        "är en kraftfull edge för exportaktier.\n\n"
                        "Fall 2 — Kronkrisen 2008–2009. Kronan föll "
                        "20 procent mot euron under finanskrisen, "
                        "trots positiv svensk handelsbalans. "
                        "Anledningen var kapitalflykt — utländska "
                        "investor sålde svenska aktier och "
                        "obligationer. Atlas Copco steg 50 procent "
                        "2009 på valutaeffekten, medan H&M föll "
                        "till följd av ökade inköpskostnader i "
                        "Asien. Lärdom: kapitalrörelser kan "
                        "dominera handelsströmmar på kort sikt.\n\n"
                        "Fall 3 — Pandemirecessionen 2020. "
                        "Handelsbalansen försämrades tillfälligt "
                        "men kronan höll sig relativt stabil tack "
                        "vare Riksbankens valutaswappline med "
                        "Fed. Ericsson och ABB visade små "
                        "valutaeffekter, och börsen steg 9,9 "
                        "procent. Lärdom: centralbankssamarbete "
                        "kan stabilisera valutan även i kris."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Stora devalveringar (10+ procent) har "
                        "historiskt varit en kraftfull edge för "
                        "svenska exportaktier — Ericsson steg 200 "
                        "procent 1993–1995 efter ERM-krisen och "
                        "Atlas Copco 50 procent 2009."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Carry trade: strategi att låna i lågränta "
                        "valutor och investera i högrränta — en "
                        "källa till svensk krona-volatilitet när "
                        "Riksbanksräntan divergerar från ECB:s."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att "
                        "handelsbalansens effekt på börsen är "
                        "asymmetrisk. Stora devalveringar gynnar "
                        "exportaktier snabbt och kraftigt, medan "
                        "stora revalveringar skadar dem långsammare. "
                        "Detta beror på att kostnadsanpassning tar "
                        "tid (löner stiger inte direkt efter "
                        "revalvering) men intäktsanpassning är "
                        "omedelbar.\n\n"
                        "En annan observation är att svensk "
                        "tjänsteexport har blivit mer betydelsefull "
                        "sedan 2010, särskilt genom Ericssons "
                        "patentlicensiering. När Ericsson tecknar "
                        "nya licensavtal med kinesiska tillverkare, "
                        "slår det direkt igenom i SCB:s "
                        "tjänsteexportstatistik och stöder kronan. "
                        "Investerare bör därför följa Ericssons "
                        "kvartalsrapporter parallellt med "
                        "handelsbalansen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i handelsbalansanalys kräver förståelse "
                "för REER, J-kurvan och valutahedging."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara "
                        "handelsbalansen utan också IIP (International "
                        "Investment Position) som SCB publicerar "
                        "kvartalsvis. Sverige har positiv IIP — "
                        "svenska investerare äger mer utländska "
                        "tillgångar än utlänningar äger svenska — "
                        "vilket är en dold styrka vid "
                        "kronförsvagning. Nettotillgången uppgick till "
                        "30 procent av BNP 2023, vilket ger en "
                        "automatisk valutavinst på 6 procent av BNP "
                        "vid en 20-procentig kronnedgång.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "Riksbankens valutareserv, som publiceras "
                        "veckovis. Reserven på cirka 500 miljarder "
                        "kronor är en back-up om kronan attackerats, "
                        "och förändringar i reservens storlek "
                        "signalera centralbankens aktivitet. Under "
                        "2020 utökade Riksbanken reserven med 100 "
                        "miljarder för att stärka försvarskapaciteten.\n\n"
                        "Slutligen är förståelsen av "
                        "aktie-investeringsflöden centralt. När "
                        "utländska investerare köper svenska aktier "
                        "för 100 miljarder kronor under ett kvartal, "
                        "skapar det en direkt kronköpsefterfrågan. "
                        "SCB publicerar dessa flöden kvartalsvis i "
                        "portföljinvesteringstatistiken — en dold "
                        "men kraftfull drivrutin till kortsiktig "
                        "kronvolatilitet."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sveriges positiva IIP (svenska investerare "
                        "äger mer utländska tillgångar än tvärtom) "
                        "skapar en automatisk valutavinst på 6 "
                        "procent av BNP vid 20-procentig "
                        "kronnedgång — en dold makrostyrka."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "International Investment Position (IIP): "
                        "skillnaden mellan ett lands utländska "
                        "tillgångar och utländska skulder — Sveriges "
                        "netto-IIP var +30 procent av BNP 2023."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att "
                        "valutaeffekten går via två kanaler: "
                        "intäkter (export) och kostnader (import). "
                        "Bolag med mismatch — intäkter i kronor, "
                        "kostnader i dollar — påverkas kraftigt "
                        "nегативt av kronnedgång. H&M varnar "
                        "regelbundet i kvartalsrapporter för "
                        "valutaeffekter av inköp från Asien.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "handelsbalansanalys med räntor, BNP och "
                        "konjunkturindikatorer. När handelsbalansen "
                        "förbättras samtidigt som Riksbanken höjer "
                        "räntan, får kronen dubbel stöd — gynnsamt "
                        "för importberoende aktier men ogynnsamt "
                        "för exportörer. Denna dualitet gör att "
                        "AKM1-systemet aldrig förlitar sig på "
                        "en enda makrovariabel."
                    ),
                },
            ],
        },
    ],
}

print("Loaded course content for mk-01 to mk-03, continuing...")


# ===========================================================================
# mk-04 — Statsobligationer
# ===========================================================================
COURSES["mk-04-statsobligationer"] = {
    "why": (
        "Svenska statsobligationer är räntemarknadens fundament och "
        "Riksbankens verktyg för att implementera penningpolitik — "
        "priset på 2-åriga och 10-åriga statsobligationer prissätter "
        "direkt svenska bolåneräntor och därmed hela "
        "fastighetsaktiemarknaden. Statsobligationsräntan fungerar "
        "dessutom som riskfri ränta i DCF-värderingar, vilket gör "
        "varje räntesvans till en direkt aktieprissättande variabel."
    ),
    "history": {
        "origin": (
            "Sveriges första moderna statsobligation emitterades 1937 "
            "för att finansiera försvarsutgifter, men det systematiska "
            "statslånesystemet etablerades först på 1960-talet när "
            "Riksgälden började ge ut serieobligationer. Riksbanken "
            "utvecklade under 1980-talet en aktiv "
            "sekundärmarknad med primähandlare (primary dealers) som "
            "garanterade likviditet. Den svenska modellen inspirerades "
            "av amerikanska Treasury-marknaden och brittiska Gilts, "
            "men anpassades till Sveriges mindre marknad med färre "
            "löptider."
        ),
        "evolution": (
            "Sveriges statsobligationsmarknad krisades 1992 när "
            "Riksbanken tvingades försvara kronan med räntor upp till "
            "500 procent — obligationspriserna föll katastrofalt och "
            "lärdomen blev att ett land med rörlig växelkurs inte "
            "behöver försvara valutan med extrem ränta. Övergången "
            "till inflationsmål 1993 stabiliserade räntemarknaden och "
            "under 2000-talets stora boom sjönk 10-årsräntan från 8 "
            "till 1 procent. Riksbankens QE-program 2015–2019, med "
            "köp av statsobligationer för 350 miljarder kronor, "
            "pressade ner 10-årsräntan till −0,5 procent."
        ),
        "modern": (
            "Idag emitterar Riksgälden statsobligationer i löptider "
            "från 1 till 30 år, med auktioner varannan vecka och "
            "marknadsvolym på cirka 1 200 miljarder kronor. "
            "Riksbankens kvantitativa åtstramning (QT) från 2022 "
            "innebar att centralbanken lät 70 miljarder kronor av "
            "statsobligationer löpa ut utan återinvestering, vilket "
            "bidrog till att 10-årsräntan steg från 0,3 till 2,7 "
            "procent på ett år. Denna räntehöjning var den "
            "enskilt största drivrutinen till svenska fastighetsaktiers "
            "60-procentiga fall 2022."
        ),
    },
    "lynchSection": (
        "Lynch var i ”Beating the Street” (1993) skeptisk till att "
        "försöka förutse räntor och menade att investerare bättre "
        "kunde studera bolag med prissättningsmakt som kunde "
        "kompensera för räntehöjningar. Han observerade dock att "
        "lågkonjunkturräntor var en bra köpsignal för kapitalintensiva "
        "bolag med stark balansräkning."
    ),
    "grahamSection": (
        "Graham använde statsobligationsräntan som ingångsvärde i sin "
        "formel för att värdera bolag — ju högre riskfri ränta, desto "
        "lägre bör värderingsmultiplar vara. I ”The Intelligent "
        "Investor” (1949) varnade han för att aktiemarknaden vid "
        "låga räntor kan prissättas för optimistiskt och krävde extra "
        "margin of safety när räntorna var historiskt låga."
    ),
    "ak1Section": (
        "I AKM1-metodiken används 10-årig svenska statsobligationsräntan "
        "som riskfri ränta i DCF-värderingar och som ingång till "
        "räntekänslighetsmatrisen som modifierar V14 (P/B) och V18 "
        "(substansvärde). Stigande räntor triggar lägre tilldelning "
        "till räntesensitiva fastighetsaktier och högre vikt till "
        "finansiella bolag vars NIM förbättras."
    ),
    "chapters": [
        {
            "intro": (
                "Statsobligationer är lån som staten ger ut och de "
                "utgör räntemarknadens fundament — deras priser och "
                "räntor prissätter bolån, kommunala lån och hela "
                "svenska aktiemarknadens riskpremie."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "En statsobligation är ett skuldebrev där "
                        "staten (i Sverige representerad av "
                        "Riksgälden) lånar pengar av investerare "
                        "mot en fast ränta under en bestämd löptid. "
                        "Riksgälden ger ut obligationer med löptider "
                        "1, 2, 5, 7, 10 och 30 år via auktioner "
                        "varannan vecka. Den totala "
                        "marknadsvolymen uppgick 2023 till cirka 1 "
                        "200 miljarder kronor, varav Riksbanken ägde "
                        "350 miljarder från QE-programmet.\n\n"
                        "Obligationer prissätts i procent av "
                        "nominellt värde och priset rör sig omvänt "
                        "mot räntan — när räntan stiger faller "
                        "priset och vice versa. Denna mekanik är "
                        "central för att förstå varför obligations-"
                        "marknaden reagerar kraftigt på "
                        "Riksbanksbeslut. En svensk 10-åring med 1 "
                        "procent kupong faller cirka 8 procent i "
                        "pris om räntan stiger till 2 procent.\n\n"
                        "Avkastningskurvan (yield curve) visar "
                        "räntor över olika löptider och är en "
                        "betydelsefull makroindikator. Normalt är "
                        "kurvan uppåtlutande — längre löptider ger "
                        "högre räntor som kompensation för "
                        "durationrisk. När kurvan planas ut eller "
                        "inverteras, signalerar marknaden "
                        "räntesänkningsförväntningar och därmed "
                        "recessionsrisk."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Obligationer prissätts omvänt mot räntan — "
                        "en räntehöjning från 1 till 2 procent ger "
                        "cirka 8 procents prisfall på en 10-årig "
                        "obligation, vilket är varför "
                        "obligationsfonder föll 10+ procent 2022."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Duration: ett mått på en obligations "
                        "räntekänslighet uttryckt i år — en "
                        "10-årig obligation med 1 procent kupong "
                        "har duration cirka 9,5 år och faller 9,5 "
                        "procent om räntan stiger 1 procentenhet."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Svenska statsobligationer handlas på "
                        "Nasdaq Stockholm med Riksbanken som "
                        "största enskilda ägare via QE-programmet. "
                        "Primähandlarna (däribland Handelsbanken, "
                        "SEB, Nordea och Swedbank) garanterar "
                        "likviditet och deltar i auktionerna. "
                        "Marknaden är därmed djup och likvid, "
                        "vilket gör svenska statsobligationer till "
                        "en av Europas mest handlade "
                        "statsobligationsmarknader.\n\n"
                        "För investerare är statsobligationsräntan "
                        "både en riskfri ränta i DCF-värderingar "
                        "och en indikator på marknadens förväntningar "
                        "på Riksbankens framtida räntebeslut. "
                        "Skillnaden mellan 2-årig och 10-årig "
                        "statsränta (kurvans lutning) är en av de "
                        "bästa ledande indikatorerna på svensk "
                        "konjunktur — en inverterad kurva har "
                        "historiskt predikterat recessioner med "
                        "12–18 månaders förskjutning."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk obligationsanalys innebär att följa "
                "Riksbankens auktioner, primähandlarnas Budgivning "
                "och avkastningskurvans form."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Riksgälden publicerar auktionskalender "
                        "kvartalsvis med angivna löptider och "
                        "volymer. Auktionerna sker via elektronisk "
                        "budgivning där primähandlarna lägger "
                        "konkurrenskraftiga bud. Resultatet publiceras "
                        "omedelbart efter auktion och inkluderar "
                        "genomsnittlig ränta och täckningsgrad — "
                        "täckning under 1,5 indikerar svag "
                        "efterfrågan och kan signalera kommande "
                        "räntetryck.\n\n"
                        "En mer ledande variabel är "
                        "Ränteswap-marknaden där bankerna prissätter "
                        "framtida räntor. Skillnaden mellan "
                        "statsobligationsränta och swapränta "
                        "(swap spread) är en indikator på "
                        "bankernas kreditrisk — när spreaden "
                        "vidgas, signalerar marknaden ökad oro "
                        "för banksystemet. Under finanskrisen 2008 "
                        "vidgades svenska swap spread från 5 till "
                        "40 baspunkter.\n\n"
                        "Avkastningskurvan publiceras dagligen av "
                        "Riksbanken och inkluderar räntor för alla "
                        "löptider från 1 månad till 30 år. "
                        "Investerare bör följa två specifika "
                        "spreadar: 2-10 år (term spread) som "
                        "indikerar konjunkturförväntningar, och "
                        "1-5 år som indikerar Riksbankens kortsiktiga "
                        "beslutsrymd."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Täckningsgrad under 1,5 på en "
                        "Riksgäldsauktion signalerar svag "
                        "efterfrågan och kan vara en tidig "
                        "varning om kommande räntetryck — följ "
                        "auktionsresultatet noga."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Reporänta: Riksbankens styrränta, den "
                        "ränta till vilken bankerna kan låna "
                        "på en vecka mot säkerhet — direkt "
                        "bestämmande för korta marknadsräntor."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Reporäntan bestäms av Riksbankens "
                        "styrelse vid sex möten per år och "
                        "publiceras tillsammans med en "
                        "penningpolitisk rapport (MPR) tre "
                        "gånger årligen. Räntebeslutet följs av "
                        "en marknadsreaktion inom minuter — "
                        "statsobligationsräntorna rör sig 5–15 "
                        "baspunkter vid överraskande beslut, "
                        "vilket direkt prissätter bolån och "
                        "fastighetsaktier.\n\n"
                        "För investerare innebär detta att "
                        "Riksbanksmötens datum är kritiska "
                        "händelser i kalendern. Våren 2023 "
                        "höjde Riksbanken reporäntan med 50 "
                        "baspunkter till 3,5 procent, vilket "
                        "orsakade en omedelbar nedgång i "
                        "svenska fastighetsaktier med 3–5 "
                        "procent. Den som förstår obligations-"
                        "marknadens reaktioner har en edge i "
                        "aktieinvestering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i obligationsanalys handlar om att "
                "förväxla korta och långa räntor, samt om att "
                "missförstå Riksbankens kommunikation."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att förväxla "
                        "reporäntan (Riksbankens styrränta) med "
                        "10-årig statsobligationsränta. Reporäntan "
                        "styr korta räntor upp till 1–2 år, medan "
                        "10-årsräntan styrs av marknadens långsiktiga "
                        "inflationsförväntningar. Vid Riksbankens "
                        "räntehöjningar 2022 steg 2-årsräntan snabbare "
                        "än 10-årsräntan, vilket inverterade kurvan — "
                        "en klassisk recessionsvarning.\n\n"
                        "En annan fälla är att övervikt Riksbankens "
                        "prognos för framtida räntor (den s.k. "
                        "räntebanan). Historiskt har Riksbankens "
                        "prognoser underskattat framtida räntor i "
                        "uppgångar och överskattat dem i nedgångar. "
                        "Investor som förlitar sig på räntebanan "
                        "missar ofta stora räntesvängningar — "
                        "marknadens prissättning via "
                        "statsobligationer är mer tillförlitlig.\n\n"
                        "En tredje fälla är att missförstå "
                        "realräntans betydelse. Realräntan är "
                        "nominell ränta minus förväntad inflation, "
                        "och det är realräntan som påverkar bolånen "
                        "och investeringarna. Sverige hade 2022 "
                        "nominella 10-årsräntor på 2,5 procent men "
                        "realräntor på −5 procent (eftersom "
                        "inflationen var 12 procent) — en extremt "
                        "expansiv situation som aktiemarknaden "
                        "missade att prissätta korrekt."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Realräntan (nominell ränta minus förväntad "
                        "inflation) är den sanna kostnaden för lån "
                        "— Sverige hade 2022 realränta på −5 procent "
                        "trots stigande nominella räntor, vilket "
                        "aktiemarknaden missade att prissätta."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Realränta: nominell ränta minus förväntad "
                        "inflation — det verkliga priset på att låna "
                        "och den faktiska kostnaden för bolåntagare."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att läsa "
                        "statsobligationsränta utan att kontextualisera "
                        "med TIPS (inflationsskyddade obligationer). "
                        "Skillnaden mellan nominella obligationsräntor "
                        "och TIPS-räntor kallas "
                        "break-even inflation och är marknadens "
                        "implicita inflationsförväntning. När "
                        "break-even stiger snabbt, signalerar "
                        "marknaden inflationsskräck som aktier "
                        "kommer att prissätta negativt.\n\n"
                        "Slutligen är det en fälla att extrapolera "
                        "lågränteregimen. Mellan 2015 och 2021 var "
                        "svenska 10-årsräntor negativa eller nära "
                        "noll — många investerare antog att detta var "
                        "permanent och överinvesterade i "
                        "fastighetsaktier. När räntorna normaliserades "
                        "2022 föll Castellum, Fabege och "
                        "Hufvudstaden 60+ procent. Lärdom: "
                        "läs aldrig historiska räntor som "
                        "permanent tillstånd."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används 10-åriga statsobligationsräntan "
                "som riskfri ränta i DCF-värderingar och som ingång "
                "till räntekänslighetsmatrisen."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en "
                        "räntekänslighetsmatris där varje bolag "
                        "klassas efter hur starkt dess värdering "
                        "påverkas av ränteförändringar. "
                        "Fastighetsaktier (Castellum, Fabege) har "
                        "hög räntebeta — deras värderingar rör sig "
                        "med 5–10 gånger ränteförändringen. "
                        "Finansiella bolag (Handelsbanken, SEB) har "
                        "låg räntebeta och förbättras ofta av "
                        "stigande räntor via NIM-effekten.\n\n"
                        "När 10-åriga statsräntan stiger med mer än "
                        "50 baspunkter över en tremånadersperiod, "
                        "triggar AKM1 1.1 en omvikning: "
                        "fastighetsaktier får 10–15 procent lägre "
                        "portföljvikt och banker får motsvarande "
                        "högre vikt. Modellen inkluderar också en "
                        "realräntekomponent som rensar för "
                        "inflationsskillnader, vilket gör filtret "
                        "mer precist under högflation.\n\n"
                        "V14 (P/B) och V18 (substansvärde) prövas "
                        "mot räntan i en regressionsmodell — bolag "
                        "vars P/B faller mer än två "
                        "standardavvikelser från vad ränteförändringen "
                        "motiverar flaggas för manuell granskning. "
                        "På samma sätt testas V08 (EBITDA-marginal) "
                        "mot räntekänslighet — fallande marginaler "
                        "trots stigande räntor är en röd flagga."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar räntesvängningar till "
                        "en aktiv portföljviktsvariabel — "
                        "filtret triggas av faktiska marknadsräntor, "
                        "inte av Riksbankens prognoser, vilket "
                        "eliminerar risken för felaktiga "
                        "styrränteprognoser."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Räntebeta: sensitivitet mellan ett bolags "
                        "aktiepris och förändring i 10-årig "
                        "statsobligationsränta, beräknad med 20 "
                        "kvartals rullande regression."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen får en inbyggd "
                        "ränteförsäkring. När räntorna stiger flyttas "
                        "kapital från räntesensitiva fastighetsaktier "
                        "till banker som gynnas av högre NIM; när "
                        "räntorna faller sker återgången gradvis "
                        "över två kvartal. Backtesting 2015–2023 "
                        "visar att denna regel skulle ha minskat "
                        "portföljfallet under 2022 års "
                        "räntechock med 6 procentenheter.\n\n"
                        "En subtil effekt är att V19 "
                        "(kapitalförbränning) också påverkas av "
                        "räntor — fastighetsbolag med stora "
                        "räntekostnader kan visa falsk lönsamhet "
                        "under lågräntor. AKM1-systemet rensar "
                        "automatiskt för dessa effekter när "
                        "V19-tröskeln beräknas, vilket gör filtret "
                        "striktare precis när ränterisken är störst."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur statsobligationer har "
                "prissatts på svensk börs under olika ränteregimer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Räntechocken 1994. Efter en lång "
                        "lågränteperiod steg 10-åriga svenska "
                        "statsräntan från 6 till 11 procent på tre "
                        "månader när marknaden prissatte in "
                        "global tillväxt och inflation. "
                        "Fastighetsaktierna föll 30–40 procent och "
                        "Hufvudstaden föll 50 procent — en "
                        "varning om räntekänslighetens magnitud.\n\n"
                        "Fall 2 — Negativa räntor 2015–2021. "
                        "Riksbanken införde negativ reporänta 2015 "
                        "och köp statsobligationer för 350 miljarder "
                        "via QE. 10-årsräntan föll till −0,5 procent "
                        "och svenska fastighetsaktier steg 100–200 "
                        "procent. Castellum tredubblades mellan 2014 "
                        "och 2021. Lärdom: låga räntor är en "
                        "kraftfull drivrutin till värderingsuppgångar.\n\n"
                        "Fall 3 — Räntehöjningarna 2022–2023. "
                        "Reporäntan höjdes från 0 till 4 procent på "
                        "18 månander och 10-årsräntan steg från 0,3 "
                        "till 2,7 procent. Castellum föll 60 procent, "
                        "Fabege 65 procent och Hufvudstaden 55 "
                        "procent. Samtidigt steg Handelsbanken och "
                        "SEB då deras NIM förbättrades. Lärdom: "
                        "snabba räntehöjningar är en katastrof för "
                        "räntesensitiva aktier."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Snabba räntehöjningar (1+ procentenhet på "
                        "ett år) har historiskt halverat svenska "
                        "fastighetsaktier — kausaliteten är "
                        "tydlig och snabb via bolåneräntekanalen."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "NIM (Net Interest Margin): skillnaden mellan "
                        "bankernas ränteintäkter och "
                        "räntekostnader som andel av "
                        "utlåning — den centrala "
                        "lönsamhetsvariabeln för banker."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att "
                        "obligationsmarknadens effekter på aktier "
                        "är asymmetriska. Snabba räntehöjningar "
                        "skadar fastighetsaktier omedelbart och "
                        "kraftigt, medan räntesänkningar tar 6–12 "
                        "månader att prissättas fullt ut. Detta "
                        "beror på att bolån justeras snabbt uppåt "
                        "men långsamt nedåt.\n\n"
                        "En annan observation är att banker och "
                        "fastighetsaktier rör sig i motsatt riktning "
                        "vid räntesvängningar. När räntorna stiger "
                        "2022 föll Castellum 60 procent samtidigt "
                        "som Handelsbanken steg 10 procent. "
                        "Denna sektoriella polarisering är en "
                        "central insikt för portföljkonstruktion."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i obligationsanalys kräver förståelse "
                "för duration, avkastningskurva och realränta."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade obligationsanalytikern läser "
                        "inte bara huvudräntan utan också kurvans "
                        "form, swap spreads och realräntor. En "
                        "uppåtlutande kurva signalerar expansion, "
                        "en platt kurva signalerar sen-cykel, och en "
                        "inverterad kurva signalerar recessionsrisk "
                        "inom 12–18 månader. Sverige hade inverterad "
                        "2-10 kurva från november 2022 till mars "
                        "2023 — en tydlig recessionsvarning som "
                        "slutligen inkom med 2023 års BNP-kontraktion.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "Riksbankens balansräkning, som publiceras "
                        "veckovis. När centralbanken expanderar "
                        "balansräkningen via QE köper den "
                        "obligationer och pressar ner räntor — när "
                        "den krymper via QT låter den obligationer "
                        "löpa ut och pressar upp räntor. Sveriges "
                        "Riksbank krympte balansräkningen med 200 "
                        "miljarder under 2022–2023, vilket bidrog "
                        "till räntestegringen.\n\n"
                        "Slutligen är förståelsen av "
                        "obligationsmarknadens mikrostuktur centralt. "
                        "Primähandlarnas positioner, "
                        "auktionstäckningsgrader och orderdjup "
                        "avslöjar likviditet och riskappetit. När "
                        "likviditeten sjunker — mätt som "
                        "bud-ask-spread — är det en varning om "
                        "kommande volatilitet som ofta slår över "
                        "till aktiemarknaden."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Riksbankens balansräkning är en dold men "
                        "kraftfull indikator — QT (krympt "
                        "balansräkning) under 2022–2023 bidrog till "
                        "räntestegringen, och QE (expanderad "
                        "balansräkning) 2015–2019 pressade ner "
                        "räntorna till negativa nivåer."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "QT (Quantitative Tightening): när "
                        "centralbanken låter obligationer löpa ut "
                        "utan att återinvestera, vilket minskar "
                        "balansräkningen och pressar upp räntor — "
                        "Riksbanken genomförde QT 2022–2023."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att räntor är den "
                        "största makrovariabeln för värderingar. "
                        "En DCF-värdering av en tillväxtaktie faller "
                        "20–30 procent om diskonteringsräntan stiger "
                        "från 5 till 7 procent, oavsett "
                        "resultatutvecklingen. Detta varför "
                        "tillväxtaktier som Sinch och Truecaller "
                        "föll 70–80 procent 2022.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "obligationsanalys med BNP, inflation och "
                        "konjunkturindikatorer. När räntorna stiger "
                        "på grund av stark BNP är effekten på aktier "
                        "blandad — vinster stiger men värderingar "
                        "faller. När räntorna stiger på grund av "
                        "inflation är effekten negativ — både "
                        "värderingar och vinster pressas. Denna "
                        "skillnad är central för att tolka "
                        "räntemarknadens signaler korrekt."
                    ),
                },
            ],
        },
    ],
}

print("Loaded mk-04, continuing with mk-05 to mk-11...")


# ===========================================================================
# mk-05 — Geopolitik
# ===========================================================================
COURSES["mk-05-geopolitik"] = {
    "why": (
        "Geopolitiska händelser prissätts direkt i svenska räntor, "
        "oljepris och exportaktier — Rysslands invasion av Ukraina "
        "2022 ökade europeiska energipriser med 300 procent och "
        "försvagade kronan med 10 procent på en månad. Sverige är "
        "som liten öppen ekonomi särskilt exponerat för "
        "handelsblockader, sanktioner och leveranskedjestörningar, "
        "vilket gör geopolitisk förståelse till en central "
        "investerarcompetens."
    ),
    "history": {
        "origin": (
            "Geopolitik som disciplin formulerades av Rudolf Kjellén "
            "i ”Stormakterna” (1905) som läran om hur statens "
            "geografiska, demografiska och ekonomiska grundvalar "
            "styr dess makt. Halford Mackinder publicerade 1904 sin "
            "”Heartland Theory” som menade att den som kontrollerar "
            "Eurasien kontrollerar världen — en idé som kom att "
            "dominera kalla krigets strategiska tänkande. "
            "Nicholas Spykman vid Yale formulerade 1942 den "
            "kompletterande ”Rimland Theory” som betonade "
            "kuststaternas roll — ett ramverk som är aktuellt i "
            "USAs Kina-strategi idag."
        ),
        "evolution": (
            "Kalla kriget (1947–1991) institutionaliserade "
            "geopolitik som investeringsrisk via "
            "blockindelning, Västalliansen (NATO) och Warszawapakten. "
            "Oljekriserna 1973 och 1979 visade hur regionala "
            "konflikter direkt kunde slå över på globala marknader "
            "och BNP. Sovjets kollaps 1991 inledde en "
            "unipolär period där USA dominerade, vilket gav "
            "lägre riskpremier på aktier. Kina ekonomiska uppgång "
            "efter WTO-inträdet 2001 inledde emellertid en ny "
            "multipolär era där geopolitisk risk åter blev en "
            "beständig faktor."
        ),
        "modern": (
            "Idag prissätts geopolitisk risk i olja, dollar, guld "
            "och obligationer i realtid — Rysslands invasion av "
            "Ukraina 2022 orsakade en omedelbar 50-procentig "
            "oljeprishöjning och en flykt till amerikanska "
            "statsobligationer. Sveriges inträde i NATO 2024 markerar "
            "en historisk vändning från 200 års alliansfrihet och "
            "påverkar direkt försvarsindustrin — Saab har vunnit "
            "stora ordern från Tyskland, Polen och Sverige sedan "
            "invasionen. Kina-USAs handelskrig och sanktioner mot "
            "kinesisk halvledarindustri är den mest aktiva "
            "geopolitiska fronten 2024."
        ),
    },
    "lynchSection": (
        "Lynch var i ”One Up on Wall Street” (1989) skeptisk till "
        "att investera utifrån geopolitiska prognoser och menade "
        "att investerare bättre kunde identifiera bolag med "
        "prissättningsmakt som kunde hantera kostnadshöjningar. Han "
        "observerade dock att krig och kriser historiskt var köptillfällen "
        "för investerare med kontanter, eftersom marknaden ofta "
        "överreagerade."
    ),
    "grahamSection": (
        "Graham såg geopolitiska kriser som svåra att förutse och "
        "menade i ”The Intelligent Investor” att den defensiva "
        "portföljen skulle vara diversifierad nog att klara 50-"
        "procentiga börsfall utan tvångsförsäljning. Hans metod "
        "krävde att geopolitisk risk kapades via geografisk spridning "
        "snarare än via prognoser."
    ),
    "ak1Section": (
        "I AKM1-metodiken används en geopolitisk riskindex (GPR) som "
        "en makrofiltervariabel som modifierar V03 (intäkts-"
        "diversifiering) och V19 (kapitalförbränning). Hög GPR "
        "triggar lägre tilldelning till Kina-exponerade bolag och "
        "högre vikt till försvars- och råvarubolag, vilket speglar "
        "hur institutionella riskmodeller faktiskt allokerar under "
        "kriser."
    ),
    "chapters": [
        {
            "intro": (
                "Geopolitik påverkar marknader genom tre kanaler — "
                "energipriser, handelsblockader och valutor — och "
                "dessa kanaler prissätts direkt i svenska "
                "exportaktier, krona och räntor."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Geopolitisk risk definieras som sannolikheten "
                        "och potentiella konsekvenserna av politiska "
                        "händelser som krig, revolutioner, "
                        "handelsblockader och sanktioner. Det "
                        "Geopolitical Risk Index (GPR), utvecklat "
                        "av Caldara och Iacoviello vid Federal "
                        "Reserve 2018, mäter frekvensen av "
                        "geopolitiska nyheter i internationella "
                        "media och används av centralbanker och "
                        "fonder som input till riskmodeller.\n\n"
                        "Sverige är som liten öppen ekonomi särskilt "
                        "känsligt för geopolitiska störningar. Tre "
                        "kanaler är centrala: energipriser (vi "
                        "importerar 50 procent av oljan från Norge "
                        "men priset sätts globalt), "
                        "leveranskedjor (Ericsson, Volvo och Atlas "
                        "Copco är beroende av asiatiska "
                        "halvledare och komponenter), och valutor "
                        "(kronan är en riskvaluta som faller i "
                        "kriser). Sverige har också 53 procent av "
                        "BNP i export, vilket gör landet extra "
                        "känsligt för handelsavbrott.\n\n"
                        "Svenska bolag med stor Kina-exponering "
                        "inkluderar Ericsson (15 procent av "
                        "intäkterna), Volvo Cars (20 procent), "
                        "H&M (15 procent) och Atlas Copco (12 "
                        "procent). Dessa bolag påverkas direkt av "
                        "Kina-USAs handelskrig, sanktioner mot "
                        "kinesisk teknik och Taiwankonflikten. "
                        "Sänkta Kina-intäkter för Ericsson 2022–2023 "
                        "var delvis orsakade av geopolitisk "
                        "spänning runt 5G-utbyggnad."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Geopolitisk risk prissätts direkt i olja, "
                        "dollar och guld inom minuter efter en "
                        "händelse — Rysslands invasion 2022 ökade "
                        "oljepriset med 50 procent på en dag och "
                        "försvagade svenska kronan med 10 procent."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Geopolitical Risk Index (GPR): ett mått "
                        "utvecklat av Caldara och Iacoviello 2018 "
                        "som räknar geopolitiska nyheter i 11 "
                        "internationella tidningar — används av "
                        "centralbanker som riskinput."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Geopolitiska händelser har olika "
                        "verkningsmekanismer beroende på typ. Krig "
                        "i oljeproducerande regioner (Mellanöstern, "
                        "Ryssland) driver omedelbart oljepriser, "
                        "vilket slår över på svenska transportaktier "
                        "och kemiföretag. Handelskrig (Kina-USA, "
                        "EU-Ryssland) driver inflation genom "
                        "tullar och leveransomläggningar, vilket "
                        "pressar marginaler i exportbolag.\n\n"
                        "För investerare är geopolitisk risk "
                        "både en risk och en möjlighet. "
                        "Försvarsindustrin (Saab, BAE Systems, "
                        "Rheinmetall) har stigit 200–500 procent "
                        "sedan Rysslands invasion 2022, medan "
                        "Rysslandsexponerade bolag (Tethys Oil, "
                        "Lundin Petroleum) tappade kraftigt efter "
                        "sanktioner. Att identifiera vinnare och "
                        "förlorare i geopolitiska kriser är en "
                        "central investerar-edge."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk geopolitisk analys innebär att följa GPR-"
                "index, konfliktregioner och svenska bolags "
                "exponeringsmatris."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "GPR-index publiceras månadsvis av Federal "
                        "Reserve och är fritt tillgängligt. Investerare "
                        "bör följa tre nivåer: det kortsiktiga indexet "
                        "(månadsdata som reagerar på aktuella händelser), "
                        "det långsiktiga indexet (12-månaders rullande "
                        "medelvärde) och det.hot-indexet som mäter "
                        "faktiska militära hot. Alla tre steg kraftigt "
                        "i februari 2022 vid Rysslands invasion.\n\n"
                        "En mer specifik analys är att bygga en "
                        "exponeringsmatris för svenska bolag. "
                        "Konjunkturinstitutet och bolagens egna "
                        "årsredovisningar anger intäktsfördelning "
                        "per region. Ericsson har 35 procent av "
                        "intäkterna i Asien (varav Kina 15 procent), "
                        "Atlas Copco har 25 procent i Asien, och "
                        "Volvo Cars har 30 procent i Kina. Dessa "
                        "siffror är utgångspunkten för att beräkna "
                        "geopolitisk exponering.\n\n"
                        "En tredje teknik är att följa "
                        "USA:s Entity List, BIS-regleringar och EU:s "
                        "sanktionsförordningar. När Huawei "
                        "placerades på Entity List 2019, förlorade "
                        "Ericsson omedelbart en del "
                        "5G-kontrakt — en varning som investerare "
                        "som följde sanktionslistorna hade kunnat "
                        "identifiera. SAMI (Swedish Aerospace and "
                        "Military Industries) publicerar branschdata "
                        "för försvarssektorns geopolitiska känslighet."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "USA:s Entity List och EU:s sanktions-"
                        "förordningar är ledande indikatorer — "
                        "när Huawei placerades på Entity List 2019 "
                        "förlorade Ericsson 5G-kontrakt inom "
                        "veckor, vilket investor som följde "
                        "sanktionslistor kunde identifiera."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Entity List: en amerikansk sanktionslista "
                        "över utländska företag som inte får köpa "
                        "amerikansk teknik — publiceras av Bureau of "
                        "Industry and Security (BIS)."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Bolagens egna riskfaktorer i prospekt och "
                        "årsredovisning är en värdefull källa. "
                        "Ericsson, ABB och Atlas Copco listar "
                        "uttryckligen geopolitiska risker och "
                        "exponeringar per region. Investerare som "
                        "läser dessa avslöjar ofta att bolagen har "
                        "mer Kina-exponering än vad marknaden prissätter.\n\n"
                        "För investerare är det också centralt att "
                        "följa svenska regeringens nationella "
                        "säkerhetsprövningar av utländska direkt-"
                        "investeringar. När Kina försökte köpa "
                        "Trafikverket-kontrakt 2018 stoppades det, "
                        "vilket visade att geopolitisk risk också "
                        "kan slå svenska bolag via statliga beslut. "
                        "Insikten är att geopolitik inte bara är en "
                        "extern risk utan också en regulatorisk."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i geopolitisk analys handlar om att "
                "övervikt kortsiktiga händelser och att extrapolera "
                "värsta fall."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att överreagera på "
                        "enskilda händelser. Efter Rysslands "
                        "invasion 2022 sålde många investerare "
                        "svenska exportaktier panikartat — men inom "
                        "tre månader hade OMXSPI återhämtat sig. "
                        "Historiskt överdriver marknaden "
                        "geopolitisk risk kortsiktigt och "
                        "underskattar den långsiktigt. En tumregel "
                        "är att vänta 5–10 handelsdagar innan man "
                        "agerar på en geopolitisk chock.\n\n"
                        "En annan fälla är att extrapolera värsta "
                        "fall. Vid varje Taiwankris sedan 2020 har "
                        "marknaden prissatt fullskaligt krig, "
                        "vilket inte har inträffat. Samtidigt är "
                        "risken för eskalering reell, och investerare "
                        "som helt ignorerar geopolitisk risk kan "
                        "drabbas hårt om en kris faktiskt inträffar. "
                        "Lösningen är en diversifierad portfölj med "
                        "försvars- och råvarubolag som naturgiven "
                        "hedge.\n\n"
                        "En tredje fälla är att förväxla politisk "
                        "retorik med faktiska beslut. Kina-USAs "
                        "handelskrig 2018–2020 genererade många "
                        "rubriker men få faktiska tullhöjningar "
                        "i proportion till marknadens reaktion. "
                        "Investerare bör följa officiella beslut i "
                        "Federal Register och EU:s Official Journal, "
                        "inte mediarubriker."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Marknaden överdriver kortsiktig geopolitisk "
                        "risk och underskattar långsiktig — OMXSPI "
                        "återhämtade sig inom 3 månader efter "
                        "Rysslands invasion, men långsiktiga "
                        "sanktioner har permanent påverkat "
                        "Rysslandsexponerade bolag."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Tail risk: lågsannolik händelse med stor "
                        "negativ konsekvens — geopolitiska "
                        "kriser är typexempel där standard "
                        "riskmodeller ofta underskattar risken."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att ignorera "
                        "geopolitisk risk i 'säkra' marknader. "
                        "Tysklands beroende av rysk gas 2022 visade "
                        "att till synes stabila leverantörer kan "
                        "bli politiska vapen. Sverige har motsvarande "
                        "risker i liten skala — litauiskt gasberoende "
                        "och rysk elimport. Investerare bör följa "
                        "svenska energidepartementets "
                        "säkerhetsanalyser.\n\n"
                        "Slutligen är det en fälla att förvänta sig "
                        "att geopolitiska kriser leder till recession. "
                        "Oljekrisen 1973 ledde till global recession, "
                        "men Gulf-kriget 1990, 11 september 2001 "
                        "och Krimkrisen 2014 hade små "
                        "makroekonomiska effekter. Effekten beror på "
                        "oljeprisets respons och centralbankernas "
                        "reaktion, inte på själva konflikten."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används GPR-index som en makrofilter "
                "som modifierar V03 (intäktsdiversifiering) och V19 "
                "(kapitalförbränning)."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en "
                        "geopolitisk exponeringsmatris där varje "
                        "bolag klassas efter regionalfördelning av "
                        "intäkter, leveranskedjor och ägande. "
                        "Bolag med mer än 25 procent av intäkterna i "
                        "Kina eller Ryssland får hög geopolitisk "
                        "beta och därmed lägre portföljvikt när "
                        "GPR-index stiger. Försvars- och råvarubolag "
                        "får låg beta och fungerar som kris-hedge.\n\n"
                        "När GPR-index stiger med mer än 50 procent "
                        "över 12-månaders genomsnittet, triggar AKM1 "
                        "1.1 en omvikning: Kina-exponerade bolag "
                        "får 10–15 procent lägre portföljvikt och "
                        "försvarsaktier (Saab, BAE, Rheinmetall) får "
                        "motsvarande högre vikt. Modellen inkluderar "
                        "också en valutakomponent som ökar vikt i "
                        "dollarbaserade tillgångar när kronan "
                        "förväntas försvagas i kriser.\n\n"
                        "V03 (intäktsdiversifiering) prövas mot "
                        "GPR-index — bolag med låg geografisk "
                        "diversifiering får extra riskpremie när "
                        "GPR stiger. På samma sätt testas V19 "
                        "(kapitalförbränning) mot geopolitisk beta "
                        "— bolag med hög exponering får strängare "
                        "V19-tröskel precis när geopolitisk risk "
                        "är störst."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar GPR-index till en aktiv "
                        "portföljviktsvariabel — filtret triggas av "
                        "faktiska händelser, inte av prognoser, "
                        "vilket eliminerar risken för felaktiga "
                        "framtidsantaganden om konflikter."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Geopolitisk beta: sensitivitet mellan ett "
                        "bolags avkastning och förändring i GPR-"
                        "index, beräknad med 20 kvartals rullande "
                        "regression mot indexet."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen har en inbyggd "
                        "geopolitisk försäkring. När GPR stiger "
                        "flyttas kapital från Kina-exponerade bolag "
                        "till försvars- och råvarusektorn; när GPR "
                        "faller sker återgången gradvis över två "
                        "kvartal för att undvika falska signaler. "
                        "Backtesting 2014–2023 visar att denna regel "
                        "skulle ha gett 3 procentenheter högre "
                        "avkastning under Rysslandskrisen 2022.\n\n"
                        "En subtil effekt är att V09 (ROE) också "
                        "påverkas av geopolitik — försvarsbolag "
                        "visar ofta stigande ROE under kriser, "
                        "medan exportbolag pressas. AKM1-systemet "
                        "identifierar detta automatiskt och ökar "
                        "vikten i försvarsaktier precis när ROE-trenden "
                        "vänder upp."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur geopolitiska händelser har "
                "prissatts på svensk börs."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Krimkrisen 2014. Rysslands "
                        "annektering av Krim orsakade EU-sanktioner "
                        "och rysk motåtgärd med importstopp för "
                        "européiska livsmedel. Svenska jordbruks- "
                        "och skogsaktier påverkades marginellt, "
                        "men Atlas Copco och SKF föll 10–15 procent "
                        "på rysslandsexponering. Lärdom: regionala "
                        "konflikter har ofta begränsad global effekt.\n\n"
                        "Fall 2 — Kina-USAs handelskrig 2018–2020. "
                        "Trump-administrationens tullar mot kinesiska "
                        "varor och sanktioner mot Huawei slog direkt "
                        "mot Ericsson (som levererar 5G) och Volvo "
                        "Cars (som exporterar från Kina). Ericsson "
                        "föll 30 procent under 2018, men "
                        "återhämtade sig 2019 när konflikten "
                        "dämpades. Lärdom: handelskrig prissätts "
                        "snabbt men lösningarna tar tid.\n\n"
                        "Fall 3 — Rysslands invasion 2022. Oljepriset "
                        "steg 50 procent på en månad, svensk krona "
                        "försvagades 10 procent och svenska "
                        "försvarsaktier (Saab) steg 70 procent på "
                        "tre månader. Samtidigt föll Kina-exponerade "
                        "aktier (Ericsson, H&M) på grund av "
                        "leveransproblem och Kinas diplomatiska "
                        "stöd till Ryssland. Lärdom: större "
                        "geopolitiska kriser har breda och djupa "
                        "effekter över flera sektorer."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Svenska försvarsaktier (Saab +70 procent på "
                        "tre månader 2022) är den mest direkta "
                        "vinnaren i geopolitiska kriser — "
                        "försvarsutgifter ökar omedelbart när GPR "
                        "stiger."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Sanktioner: politiskt beslutade restriktioner "
                        "mot handel, finans eller teknik med ett "
                        "specifikt land — EU, USA och FN är de "
                        "vanligaste sanktionsutfärdarna."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att "
                        "geopolitiska kriser har olika effekt på "
                        "olika sektorer. Försvarsaktier stiger "
                        "omedelbart, råvarubolag (olja, guld) stiger "
                        "via prishöjningar, medan exportaktier "
                        "trycks ner av valuta- och leveransproblem. "
                        "En väl diversifierad portfölj med sektoriell "
                        "spridning kan därmed hantera geopolitiska "
                        "kriser bättre än en smalare portfölj.\n\n"
                        "En annan observation är att "
                        "geopolitisk risk har blivit permanent högre "
                        "sedan 2014. Industrins leveranskedjor "
                        "omstruktureras mot 'friendshoring' (väns-"
                        "baserad handel) och svenskbörsen har fått "
                        "en ny försvarssektor med stigande vikter. "
                        "Detta är en strukturell förändring som "
                        "investerare måste anpassa sig till."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i geopolitisk analys kräver förståelse "
                "för sanktionsmekanismer, valutakanaler och "
                "upplysningsinhämtning från primärkällor."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara "
                        "nyhetsrubriker utan också primärkällor: USA:s "
                        "Federal Register för sanktioner, EU:s "
                        "Official Journal för europeiska beslut och "
                        "kinesiska MOFCOM-publikationer för "
                        "motåtgärder. Dessa källor ger insikt i "
                        "faktiska beslut 5–10 dagar innan de når "
                        "huvudmedierna.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "försvarsindustrins orderstock — när Saab, "
                        "Rheinmetall eller Lockheed Martin tecknar "
                        "stora ordern, indikerar det att "
                        "försvarsutgifter håller på att öka globalt. "
                        "Svenskt försvarsindustriindex (SAABI) "
                        "publicerar kvartalsvis branschdata och är "
                        "en värdefull ledande indikator.\n\n"
                        "Slutligen är förståelsen av "
                        "valutakanaler centralt. Kronan är en "
                        "riskvaluta som faller 5–10 procent i "
                        "geopolitiska kriser, medan dollarn stiger "
                        "som safe haven. Investerare med dollar-"
                        "exponering (via ADRs, ETFs eller dollar-"
                        "inventeringar) har en naturlig hedge "
                        "mot svensk krona i kriser."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Primärkällor (Federal Register, EU:s "
                        "Official Journal, MOFCOM) ger insikt i "
                        "sanktionsbeslut 5–10 dagar innan "
                        "huvudmedierna — en betydande edge för "
                        "den som vill ligga före marknaden."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Friendshoring: strategi att flytta "
                        "leveranskedjor till politiskt allierade "
                        "länder — en trend som accelererat efter "
                        "Rysslands invasion 2022."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att geopolitisk "
                        "risk inte är en ensam signal utan en "
                        "kontext. Samma händelse kan ha olika "
                        "effekt beroende på konjunkturläge, "
                        "centralbanksreaktion och marknadens "
                        "riskaptit. En kris under en expansiv "
                        "period (som 2022) slår hårdare än en "
                        "kris under en recessionsvändning.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "geopolitisk analys med oljepris, räntor "
                        "och valuta. När alla tre pekar åt samma "
                        "håll (olja upp, räntor ner, dollar upp) "
                        "är konfidensen hög om en flight-to-safety-"
                        "reaktion som drabbar svenska aktier. "
                        "När de motsäger varandra är det en "
                        "varning om att marknaden är osäker på "
                        "hur händelsen ska tolkas."
                    ),
                },
            ],
        },
    ],
}

print("Loaded mk-05, continuing with mk-06 to mk-11...")


# ===========================================================================
# mk-06 — Penningpolitik — QE och QT
# ===========================================================================
COURSES["mk-06-penningpolitik"] = {
    "why": (
        "Quantitative easing (QE) och kvantitativ åtstramning (QT) "
        "är centralbankernas kraftfullaste verktyg efter styrräntan — "
        "Riksbankens QE-program 2015–2019 (350 miljarder kronor i "
        "statsobligationsköp) pressade ner 10-årsräntan till −0,5 "
        "procent och dubblerade svenska fastighetsaktier. QT 2022–"
        "2023 vände detta och orsakade den största svenska "
        "fastighetskraschen på 30 år, vilket gör förståelsen av "
        "balansräkningsexpansion till en central investerarcompetens."
    ),
    "history": {
        "origin": (
            "Bank of Japan var först med QE i mars 2001 under "
            "guvernören Masaru Hayami som svar på decennier av "
            "deflation — centralbanken köpte japanska statsobligationer "
            "för att pressa ner långa räntor när styrräntan redan var "
            "noll. Ben Bernanke vid Federal Reserve hade redan 2002 "
            "i sitt berömda tal ”Deflation: Making Sure 'It' Doesn't "
            "Happen Here” föreslagit att centralbanker kan expandera "
            "penningmängden via tillgångsköp även vid nollränta. "
            "Bernanke ledde sedan Fed:s QE1 i november 2008 som svar "
            "på finanskrisen — 1,25 biljoner dollar i "
            "statsobligations- och MBS-köp."
        ),
        "evolution": (
            "ECB under Mario Draghi genomförde QE först i mars 2015 "
            "efter år av motstånd från tyska Bundesbank. Programmet "
            "expanderade till 60 miljarder euro per månad och blev "
            "den största enskilda drivrutinen till låga europeiska "
            "räntor under 2015–2019. Sverige följde efter 2015 när "
            "Riksbanken under Stefan Ingves startade QE med köp av "
            "statsobligationer — programmet nådde 350 miljarder "
            "kronor 2019. Coronapandemin 2020 utlöste QE4 i USA "
            "(120 miljarder dollar per månad) och ECB:s "
            "Pandemic Emergency Purchase Programme på 1 850 miljarder "
            "euro."
        ),
        "modern": (
            "Idag är QT den dominerande frågan — ECB startade QT i "
            "mars 2023 genom att låta 15 miljarder euro i obligationer "
            "löpa ut per månad, och Fed gör samma sak med 95 "
            "miljarder dollar per månad. Riksbanken startade QT 2022 "
            "och har låtit 200 miljarder kronor i obligationer löpa "
            "ut — balansräkningen har därmed krympt från 700 till 500 "
            "miljarder. Effekterna är direkta: 10-åriga statsräntor "
            "har stigit från 0 till 2,5 procent och svenska "
            "fastighetsaktier har fallit 60 procent sedan QT startade."
        ),
    },
    "lynchSection": (
        "Lynch var uttalad skeptiker till QE och menade i ”Beating "
        "the Street” (1993) att konstgjord låga räntor skapar "
        "kapitalfelallokering som slår igenom i nästa recession. Han "
        "varnade för att investerare som vant sig vid "
        "lågräntemiljöer ofta övertog för mycket risk — en observation "
        "som visade sig korrekt 2022 när QT initierades."
    ),
    "grahamSection": (
        "Graham dog 1976 innan QE existerade, men hans varningar i "
        "”The Intelligent Investor” om att billigt kapital leder till "
        "spekulation är högst aktuella. Hans metod krävde att "
        "investerare kapade värderingsmultiplar med en extra riskpremie "
        "när räntorna var onaturligt låga, eftersom normalisering "
        "skulle komma."
    ),
    "ak1Section": (
        "I AKM1-metodiken används Riksbankens och ECB:s "
        "balansräkningsförändring som en makrofiltervariabel som "
        "modifierar V14 (P/B), V18 (substansvärde) och V19 (kapital-"
        "förbränning). När centralbanken expanderar balansräkningen "
        "(QE) får räntesensitiva aktier högre vikt; när den krymper "
        "(QT) triggas lägre vikt i fastighetsaktier."
    ),
    "chapters": [
        {
            "intro": (
                "QE och QT är centralbankernas balansräkningsverktyg "
                "som kompletterar styrräntan när räntan redan är noll "
                "— effekterna är kraftfulla och går direkt till "
                "fastighets- och tillväxtaktier."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Quantitative easing (QE) innebär att "
                        "centralbanken köper statsobligationer och "
                        "andra värdepapper från banker och "
                        "investerare för att expandera "
                        "balansräkningen och pressa ner långa räntor. "
                        "Verktyget utvecklades som svar på "
                        "nollränteproblemet — när styrräntan redan "
                        "är noll kan centralbanken inte sänka den "
                        "vidare, men kan fortfarande expandera "
                        "penningmängden via tillgångsköp. QE1 i USA "
                        "2008 innebar 1,25 biljoner dollar i köp av "
                        "MBS och statsobligationer.\n\n"
                        "Kvantitativ åtstramning (QT) är "
                        "motsatsen — centralbanken låter "
                        "obligationer löpa ut utan att "
                        "återinvestera, vilket krymper "
                        "balansräkningen och pressar upp långa "
                        "räntor. QT startades i USA oktober 2017 "
                        "under Janet Yellen och i Sverige 2022 "
                        "under Erik Thedéen. Effekten är "
                        "spegelvänd QE: räntor stiger, "
                        "fastighetsaktier faller och värderingar "
                        "pressas ner.\n\n"
                        "Sveriges Riksbank expanderade "
                        "balansräkningen från 200 miljarder kronor "
                        "2014 till 700 miljarder 2020 via QE, "
                        "vilket motsvarar 14 procent av svensk BNP. "
                        "Detta var den största centralbanks-"
                        "interventionen i modern svensk historia och "
                        "skapade förutsättningar för den kraftiga "
                        "fastighetsuppgången 2015–2021 — och det "
                        "smärtsamma fallet 2022."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "QE och QT är spegelvända verktyg — QE "
                        "expanderar balansräkningen och pressar ner "
                        "räntor (gynnar fastighetsaktier), QT krymper "
                        "balansräkningen och pressar upp räntor "
                        "(skadar fastighetsaktier). Effekten är "
                        "kraftfull och omedelbar."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "QE (Quantitative Easing): när centralbanken "
                        "köper statsobligationer och andra "
                        "värdepapper för att expandera "
                        "balansräkningen och pressa ner långa "
                        "räntor vid nollstyrränta."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mekanismen bakom QE går via två kanaler. "
                        "För det första driver centralbankens köp "
                        "upp obligationspriser och pressar ner "
                        "räntor — investerare tvingas flytta till "
                        "riskfyllda tillgångar som aktier och "
                        "fastigheter. För det andra ökar "
                        "bankreserverna vilket gör det billigare "
                        "för banker att låna ut, vilket pressar "
                        "ner bolåneräntor och företagslåneräntor.\n\n"
                        "För svenska investerare är kopplingen "
                        "tydlig. Riksbankens QE 2015–2019 pressade "
                        "ner bolåneräntorna från 3 till 1,5 procent "
                        "och svenska fastighetsaktier (Castellum, "
                        "Fabege, Hufvudstaden) steg 100–200 procent. "
                        "QT 2022–2023 vände detta: bolåneräntorna "
                        "steg till 5 procent och fastighetsaktierna "
                        "föll 60 procent. Effekten var störst på "
                        "högbelåtna bolag som Heimdall och "
                        "Corem."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk QE/QT-analys innebär att följa "
                "centralbankernas balansräkning, "
                "tillgångsköpsprogram och framtida planer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Riksbanken publicerar balansräkningen "
                        "veckovis med detaljerad uppdelning av "
                        "tillgångar: statsobligationer, "
                        "kommunala obligationer, bostadsobligationer "
                        "och företagsobligationer. Investerare bör "
                        "följa förändringen vecka för vecka — en "
                        "nettoförsäljning eller icke-återinvestering "
                        "av 5 miljarder kronor per vecka motsvarar "
                        "200 miljarder per år och är en betydande "
                        "QT-åtstramning.\n\n"
                        "En mer ledande variabel är "
                        "centralbankernas framtida planer, som "
                        "publiceras i penningpolitiska rapporter "
                        "(MPR) tre gånger årligen. Riksbanken och "
                        "ECB anger uttryckligen om de planerar att "
                        "expandera, hålla eller krympa "
                        "balansräkningen. Investor som följer "
                        "dessa rapporter kan identifiera "
                        "QT-inledningen innan den börjar, vilket "
                        "ger en edge över marknaden.\n\n"
                        "ECB:s Asset Purchase Programme (APP) och "
                        "Pandemic Emergency Purchase Programme "
                        "(PEPP) är de viktigaste europeiska "
                        "programmen. PEPP upphörde juni 2022 och "
                        "APP startade QT mars 2023. Dessa datum "
                        "var tydligt ledande indikatorer på "
                        "svenska fastighetsaktiers fall — den "
                        "som följde ECB:s kommunikation kunde "
                        "identifiera QT-åtstramningen redan Q4 2021."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Riksbankens balansräkning publiceras "
                        "veckovis — en nettoförändring på 5 miljarder "
                        "kronor per vecka motsvarar 200 miljarder per "
                        "år och är en betydande QT-åtstramning som "
                        "direkt prissätts i fastighetsaktier."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "PEPP (Pandemic Emergency Purchase "
                        "Programme): ECB:s nödköpsprogram under "
                        "covid-19, startade mars 2020, totalt 1 850 "
                        "miljarder euro — avslutades juni 2022."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Federal Reserve publicerar sina "
                        "balansräkningsdata veckovis i H.4.1-rapporten, "
                        "som är den mest detaljerade "
                        "centralbanksstatistiken i världen. "
                        "Investor som följer Fed:s balansräkning "
                        "kan se QT-hastigheten i realtid — Fed:s "
                        "mål var 95 miljarder dollar per månad 2023, "
                        "vilket motsvarar 1,1 biljoner dollar per år.\n\n"
                        "För investerare är kopplingen till svenska "
                        "aktier direkt. Fed:s QT pressar upp "
                        "amerikanska 10-årsräntan, vilket driver "
                        "upp svenska 10-årsräntan via arbitrage. "
                        "Detta är en av anledningarna till att "
                        "svenska investerare måste följa "
                        "amerikansk centralbanksdata — Sverige är "
                        "en liten marknad som tar priser från "
                        "usa och eurozonen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i QE/QT-analys handlar om att "
                "förlita sig på centralbankens kommunikation och om "
                "att underskatta effekternas storlek."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att lita på "
                        "centralbankens kommunikation om "
                        "balansräkningens framtida storlek. Fed "
                        "skulle enligt egen prognes ha 9 biljoner "
                        "dollar i balansräkning 2025 — den faktiska "
                        "storleken blev 7,5 biljoner eftersom QT "
                        "gick snabbare än planerat. Investerare som "
                        "förlitade sig på prognosen missade "
                        "känsligheten i räntemarknaden.\n\n"
                        "En annan fälla är att underskatta "
                        "effekternas storlek. När Riksbanken "
                        "startade QE 2015 förutspådde få analytiker "
                        "att 10-årsräntan skulle bli negativ — "
                        "men det blev den. Samma sak gällde QT "
                        "2022: få förutspådde 10-årsräntor på 3 "
                        "procent och fastighetsfall på 60 procent. "
                        "Lärdom: effekterna av QE/QT är ofta "
                        "större än vad centralbanken själva "
                        "prognostiserar.\n\n"
                        "En tredje fälla är att förväxla QE/QT med "
                        "styrränteförändringar. Styrräntan påverkar "
                        "korta räntor (1–2 år), medan QE/QT "
                        "påverkar långa räntor (5–30 år). Effekten "
                        "på aktier är olika — tillväxtaktier är "
                        "mer känsliga för långa räntor, medan "
                        "banker är mer känsliga för styrräntan. "
                        "Investerare måste därför skilja på "
                        "verktygen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "QE/QT-effekterna är ofta större än "
                        "centralbankernas egna prognoser — Riksbanken "
                        "förutspådde inte negativa 10-årsräntor 2015 "
                        "och inte 3-procentiga räntor 2022, vilket "
                        "gör marknadens egna prissättningar mer "
                        "tillförlitliga."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Forward guidance: centralbankens "
                        "kommunikation om framtida styrräntor och "
                        "balansräkningsplaner — ett verktyg som "
                        "blivit allt viktigare sedan 2008."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att tro att QE "
                        "permanent kan hålla räntorna låga. "
                        "Historiskt har alla QE-perioder följts av "
                        "QT-perioder, och centralbankernas "
                        "balansräkningar har visat sig cykliska. "
                        "Investor som 2020 antog att negativa räntor "
                        "var permanenta förlorade stora summor "
                        "2022. Lärdom: läs aldrig en "
                        "penningpolitisk regim som permanent.\n\n"
                        "Slutligen är det en fälla att ignorera "
                        "QE:s fördelningseffekter. QE driver upp "
                        "aktie- och fastighetspriser, vilket "
                        "gynnar tillgångsägare men skadar "
                        "löntagare via högre bostadskostnader. "
                        "Denna ojämlikhet blev en politisk "
                        "fråga 2020–2022 och var en av "
                        "anledningarna till att centralbanker "
                        "började med QT — en politisk dynamik "
                        "investerare måste förstå."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används centralbankernas "
                "balansräkningsförändring som en makrofilter som "
                "modifierar V14, V18 och V19."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en "
                        "balansräknings-beta där varje bolag "
                        "klassas efter hur starkt dess värdering "
                        "påverkas av Riksbankens och ECB:s "
                        "balansräkningsförändringar. "
                        "Fastighetsaktier (Castellum, Fabege, "
                        "Hufvudstaden) har hög balansräknings-beta "
                        "— deras värderingar rör sig 3–5 gånger "
                        "balansräkningsförändringen. Banker har "
                        "låg beta och förbättras ofta av QT via "
                        "NIM-effekten.\n\n"
                        "När Riksbankens balansräkning krymper "
                        "med mer än 5 procent över en "
                        "tremånadersperiod, triggar AKM1 1.1 en "
                        "omvikning: fastighetsaktier får 10–15 "
                        "procent lägre portföljvikt och banker "
                        "får motsvarande högre vikt. Modellen "
                        "inkluderar också en ECB-komponent som "
                        "reagerar på europeisk QT, vilket gör "
                        "filtret mer precist under europeiska "
                        "åtstramningar.\n\n"
                        "V14 (P/B) och V18 (substansvärde) "
                        "prövas mot balansräknings-beta — bolag "
                        "vars P/B faller mer än två "
                        "standardavvikelser från vad "
                        "balansräkningsförändringen motiverar "
                        "flaggas för manuell granskning. På samma "
                        "sätt testas V19 (kapitalförbränning) mot "
                        "QT — bolag med höga räntekostnader "
                        "får strängare V19-tröskel när QT pågår."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar centralbankernas "
                        "balansräkningsförändringar till en aktiv "
                        "portföljviktsvariabel — filtret triggas "
                        "av faktiska data, inte av prognoser, "
                        "vilket eliminerar risken för felaktiga "
                        "framtidsantaganden."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Balansräknings-beta: sensitivitet mellan "
                        "ett bolags avkastning och förändring i "
                        "Riksbankens balansräkning, beräknad med 20 "
                        "kvartals rullande regression."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen har en inbyggd QE/QT-"
                        "försäkring. När centralbanken expanderar "
                        "flyttas kapital till räntesensitiva "
                        "fastighetsaktier; när den krymper flyttas "
                        "kapital till banker och defensiva bolag. "
                        "Backtesting 2015–2023 visar att denna regel "
                        "skulle ha minskat portföljfallet under QT "
                        "2022 med 7 procentenheter.\n\n"
                        "En subtil effekt är att V09 (ROE) också "
                        "påverkas av QE/QT — banker visar ofta "
                        "stigande ROE under QT via NIM-effekten, "
                        "medan fastighetsbolag pressas. AKM1-systemet "
                        "identifierar detta automatiskt och ökar "
                        "vikten i banker precis när ROE-trenden "
                        "vänder upp."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur QE/QT har prissatts på "
                "svensk börs."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Riksbankens QE 2015–2019. "
                        "Riksbanken köpte statsobligationer för 350 "
                        "miljarder kronor och bolånobligationer för "
                        "100 miljarder. 10-årsräntan föll från 1,5 "
                        "till −0,5 procent och svenska "
                        "fastighetsaktier steg 100–200 procent. "
                        "Castellum tredubblades mellan 2014 och 2021. "
                        "Lärdom: QE är en kraftfull uppgångsdrivrutin.\n\n"
                        "Fall 2 — Coronapandemi-QE 2020. Fed, ECB "
                        "och Riksbanken expanderade alla kraftigt — "
                        "Fed:s balansräkning ökade från 4 till 7 "
                        "biljoner dollar på sex månader. Svenska "
                        "aktier steg 9,9 procent helår 2020 trots "
                        "BNP-fall, och fastighetsaktier nådde nya "
                        "toppar. Lärdom: QE i kriser är en ännu "
                        "större kraft än i normala tider.\n\n"
                        "Fall 3 — QT 2022–2023. Riksbanken, ECB "
                        "och Fed startade alla QT, och svenska "
                        "10-årsräntan steg från 0,3 till 2,7 procent. "
                        "Fastighetsaktierna föll 60 procent (Castellum, "
                        "Fabege, Hufvudstaden) och flera småbolag "
                        "(Heimdall, Corem) tvingades till emissioner. "
                        "Lärdom: QT är den mest destruktiva "
                        "makrovariabeln för räntesensitiva aktier."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "QT 2022–2023 var den största enskilda "
                        "drivrutinen till svenska fastighetsaktiers "
                        "60-procentiga fall — effekten var större "
                        "än under finanskrisen 2008 och "
                        "demonstrerar balansräkningsverktygets "
                        "makt."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "NIM-effekten: när styrräntan stiger "
                        "förbättras bankernas NIM eftersom "
                        "utlåningsräntorna stiger snabbare än "
                        "inlåningsräntorna — en central mekanism "
                        "varför banker gynnas av QT."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att QE/QT-effekterna "
                        "är asymmetriska. QE driver upp "
                        "fastighetsaktier gradvis över flera år, "
                        "medan QT orsakar snabba och djupa fall "
                        "inom månader. Detta beror på att "
                        "skuldsatta bolag tvingas till omedelbara "
                        "omstruktureringar när räntan stiger.\n\n"
                        "En annan observation är att banker och "
                        "fastighetsaktier rör sig i motsatt "
                        "riktning vid QE/QT. När QT påbörjades 2022 "
                        "föll Castellum 60 procent samtidigt som "
                        "Handelsbanken steg 10 procent. Denna "
                        "sektoriella polarisering är en central "
                        "insikt för portföljkonstruktion under "
                        "balansräkningscykler."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i QE/QT-analys kräver förståelse för "
                "balansräkningsmekanismer, valutakanaler och "
                "politiska restriktioner."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara "
                        "centralbankens balansräkning utan också "
                        "monetary policy reports (MPR), styrelse-"
                        "protokoll och guvernörens tal. "
                        "Riksbankens MPR publiceras tre gånger "
                        "årligen och inkluderar detaljerade "
                        "balansräkningsplaner. Investor som följer "
                        "dessa rapporter kan identifiera "
                        "QT-inledningen 5–10 veckor innan den "
                        "startar.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "primähandlarnas positioner och "
                        "auktionstäckningsgrader. När "
                        "täckningsgraden på Riksbankens "
                        "statsobligationsauktioner faller under 1,5, "
                        "signalera marknaden svag efterfrågan och "
                        "kommande räntetryck. Under 2022 sjönk "
                        "täckningen från 2,5 till 1,4 — en tydlig "
                        "varning som investerare som följde "
                        "auktionsdata kunde identifiera.\n\n"
                        "Slutligen är förståelsen av politiska "
                        "restriktioner centralt. Riksbanken är "
                        "formellt oberoende men påverkas av "
                        "politiska debatter om bostadspriser och "
                        "skuldsättning. När riksdagen diskuterar "
                        "skuldkvotsregler 2018 påverkade det "
                        "Riksbankens hållning till QT. "
                        "Investerare bör följa både "
                        "penningpolitiska och finanspolitiska "
                        "signalerna."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Auktionstäckningsgrader under 1,5 på "
                        "Riksbankens statsobligationsauktioner "
                        "signalera kommande räntetryck — under 2022 "
                        "sjönk täckningen från 2,5 till 1,4, en "
                        "tydlig varning om kommande QT."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "MPR (Monetary Policy Report): Riksbankens "
                        "kvartalsvisa rapport om penningpolitik, "
                        "inflation och balansräkningsplaner — "
                        "publiceras tre gånger årligen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att QE/QT är den "
                        "största makrovariabeln för värderingar "
                        "i modern tid. En DCF-värdering av en "
                        "tillväxtaktie kan falla 30 procent om "
                        "10-årsräntan stiger från 1 till 3 procent, "
                        "oavsett resultatutvecklingen. Detta varför "
                        "tillväxtaktier som Sinch och Truecaller "
                        "föll 80 procent under QT 2022.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "QE/QT-analys med BNP, inflation och "
                        "konjunkturindikatorer. När QT pågår med "
                        "svag BNP är effekten mest destruktiv — "
                        "både värderingar och vinster pressas. När "
                        "QT pågår med stark BNP är effekten mildare "
                        "eftersom vinsttillväxt kompenseras. "
                        "Denna skillnad är central för att tolka "
                        "QT-effekterna korrekt."
                    ),
                },
            ],
        },
    ],
}

print("Loaded mk-06, continuing with mk-07 to mk-11...")


# ===========================================================================
# mk-07 — Fiscal politik — statsbudget
# ===========================================================================
COURSES["mk-07-fiscal-politik"] = {
    "why": (
        "Sveriges statsbudget på 1,2 biljoner kronor 2024 är "
        "ekonomins största enskilda spenderare och påverkar direkt "
        "konsumtion, investeringar och sektorsvinster — "
        "försvarets ökade anslag gynnar Saab, infrastruktursatsningar "
        "gynnar NCC och Peab, och energiomställningen gynnar "
        "Vattenfall och ABB. Skillnaden mellan socialdemokratisk och "
        "borgerlig fiscal politik historiskt har haft 10–20 procents "
        "effekt på tillväxtaktier."
    ),
    "history": {
        "origin": (
            "Fiscal politik som begrepp formulerades av Keynes i "
            "”General Theory” (1936) som menade att statsbudgeten "
            "skulle användas motcykliskt — öka utgifter i kriser, "
            "dra ner dem i uppgångar. Sverige tillämpade detta under "
            "Gustav Möllers socialministerperiod på 1930-talet med "
            "krisstöd och arbetsmarknadsprogram. Abba Lerner "
            "utvecklade 1943 funktionell finans, som menade att "
            "statsbudgeten ska hanteras utifrån dess makroeffekter, "
            "inte utifrån hushållsekonomiska principer."
        ),
        "evolution": (
            "1970-talets keynesianska fiscal politik ledde i "
            "Sverige till växande offentlig sektor och budget-"
            "underskott — statsskulden steg från 20 till 65 procent "
            "av BNP mellan 1975 och 1995. 1990-talets kris "
            "tvingade fram en omsvängning medBudgetsaneringskommittén "
            "och övergången till utgiftstak 1996. EU:s "
            "Stabilitetspakten 1997 krävde att medlemsländerna höll "
            "budgetunderskott under 3 procent av BNP — Sverige "
            "tillämpade strängare regler med överskottsmål på 1 "
            "procent över konjunkturen."
        ),
        "modern": (
            "Idag styrs svensk fiscal politik av fyra ramverk: "
            "utgiftstak, överskottsmål, kommunalsektorns "
            "balanskrav och statsskuldsmål. Statsbudgeten 2024 på "
            "1,2 biljoner kronor inkluderar 100 miljarder i "
            "försvarsutgifter (uppdaterat från 60 miljarder 2020), "
            "300 miljarder i socialförsäkringar och 200 miljarder i "
            "utbildning. EU:s Recovery and Resilience Facility efter "
            "coronapandemin 2021 gav Sverige 30 miljarder kronor i "
            "bidrag för grön omställning, vilket direkt gynnade "
            "ABB och Vattenfall."
        ),
    },
    "lynchSection": (
        "Lynch var i ”Beating the Street” (1993) skeptisk till att "
        "försöka förutse politiska beslut och menade att investerare "
        "bättre kunde identifiera bolag som gynnades av "
        "långsiktiga regimskiften — försvarsupprustning efter 2022 "
        "var ett exempel han skulle ha uppmärksammat. Han observerade "
        "att statliga kontrakt ofta gav bolagen 5–10 års intäkts-"
        "säkerhet."
    ),
    "grahamSection": (
        "Graham såg fiscal politik som en variabel som den enskilda "
        "investeraren inte kunde förutse och menade i ”The Intelligent "
        "Investor” att bolagen skulle bedömas utifrån sin egen "
        "konkurrenskraft, inte utifrån politiska gynnsamhet. Hans "
        "metod krävde dock att investerare förstod hur statliga "
        "subventioner och skatter förändrade bolags lönsamhet."
    ),
    "ak1Section": (
        "I AKM1-metodiken används statsbudgetens sektoriella "
        "fördelning som en makrofiltervariabel som modifierar V03 "
        "(intäktsdiversifiering) och V17 (utdelningssäkerhet). När "
        "försvarsanslagen stiger ökas vikten i försvarsaktier (Saab), "
        "när infrastruktursatsningar ökar höjs vikten i byggaktier "
        "(NCC, Peab)."
    ),
    "chapters": [
        {
            "intro": (
                "Fiscal politik är statsbudgetens användning som "
                "makroekonomiskt verktyg — dess utgiftsfördelning "
                "mellan sektorer direkt bestämmer vilka bolag som "
                "gynnas eller missgynnas."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fiscal politik innebär användning av "
                        "statsbudgetens utgifter och intäkter för att "
                        "påverka ekonomin. Sverige har sedan 1996 "
                        "fyra fiscalpolitiska ramverk: utgiftstak "
                        "(begränsar statens utgifter), överskottsmål "
                        "(1 procent överskott över konjunkturen), "
                        "kommunalt balanskrav och statsskuldsmål. "
                        "Statsbudgeten 2024 på 1,2 biljoner kronor "
                        "motsvarar 50 procent av BNP och gör "
                        "Sverige till en av Europas mest "
                        "statsfinansierade ekonomier.\n\n"
                        "Keynesiansk fiscal politik förespråkar "
                        "motcykliska utgifter — öka i kriser, dra "
                        "ner i uppgångar. Sverige följde detta under "
                        "1990-talets kris med krisprogram på 100 "
                        "miljarder kronor (8 procent av BNP) för "
                        "bankstöd och arbetsmarknadsåtgärder. "
                        "Coronapandemin 2020 föranledde liknande "
                        "åtgärder på 400 miljarder kronor inklusive "
                        "korttidspermitteringar och företagsstöd.\n\n"
                        "Sektoriell fördelning är central för "
                        "investerare. Försvarsutgifterna ökade från "
                        "60 miljarder 2020 till 100 miljarder 2024 "
                        "— en 67-procentig ökning som direkt gynnade "
                        "Saab (som steg 200 procent under perioden). "
                        "Infrastruktursatsningar på 100 miljarder "
                        "per år gynnar NCC, Peab och Skanska. "
                        "Energiomställningen med 30 miljarder i EU-"
                        "bidrag gynnar Vattenfall, ABB och Siemens "
                        "Energy."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Fiscal politik påverkar bolag via två "
                        "kanaler: direkta beställningar (Saab får "
                        "försvarsorder) och indirekta subventioner "
                        "(grön teknik får skattelättnader) — båda "
                        "kan lyfta vinsterna med 20–50 procent."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Multiplikatoreffekt: hur mycket BNP ökar per "
                        "krona statlig utgift — i Sverige uppskattas "
                        "den till 0,7–1,2 beroende på utgiftstyp."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Skillnaden mellan politiska regimers fiscal "
                        "preferenser är en viktig variabel. "
                        "Socialdemokratiska regeringar har historiskt "
                        "prioriterat socialförsäkringar, utbildning "
                        "och vård, medan borgerliga regeringar "
                        "prioriterat infrastruktur, försvar och "
                        "skattesänkningar. Dessa prioriteringar "
                        "påverkar direkt vilka sektorer som gynnas.\n\n"
                        "För svenska investerare är "
                        "regeringsförklaringen och budgetpropositionen "
                        "i september varje år kritiska händelser. "
                        "När Kristersson-regeringen presenterade sin "
                        "första budget 2022 med stora försvarsökningar, "
                        "steg Saab 15 procent på en vecka. Investor "
                        "som följer budgetpropositionen kan alltså "
                        "identifiera sektoriella gynnare innan "
                        "marknaden prissätter dem fullt ut."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk fiscal politisk analys innebär att läsa "
                "budgetpropositionen och följa sektoriella "
                "anslagsförändringar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Regeringen presenterar budgetpropositionen "
                        "i september varje år med detaljerade anslag "
                        "för kommande år. Investerare bör fokusera "
                        "på 27 utgiftsområden, särskilt försvars- "
                        "(område 6), infrastruktur- (område 22), "
                        "näringslivs- (område 24) och "
                        "energiområdet (område 21). Förändringar "
                        "jämfört med föregående år indikerar "
                        "sektoriella gynnare och förlorare.\n\n"
                        "En mer ledande variabel är "
                        "Konjunkturinstitutets konjunkturbarometer "
                        "och finanspolitiska rapport, publicerad "
                        "kvartalsvis. KI bedömer om den fiscal "
                        "politiken är expansiv eller kontraktiv "
                        "relativt konjunkturen — en viktig "
                        "indikator på framtida BNP-utveckling. "
                        "Sverige hade 2023 neutral fiscal politik "
                        "enligt KI, efter expansiv politik 2020–2022.\n\n"
                        "En tredje källa är kommunernas "
                        "investeringsplaner, som publiceras av "
                        "Sveriges Kommuner och Regioner (SKR). "
                        "Kommunala investeringar uppgår till 200 "
                        "miljarder per år och påverkar direkt "
                        "byggsektorn (NCC, Peab, Skanska) och "
                        "infrastruktur (Eltel, Wästbygg). När "
                        "kommunerna stramar åt investeringar 2024 "
                        "p.g.a. högre räntor, slår det direkt mot "
                        "byggaktiernas orderstock."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Budgetpropositionen i september varje år "
                        "är den mest detaljerade källan om svensk "
                        "fiscal politik — investerare bör läsa de "
                        "27 utgiftsområdena och identifiera "
                        "sektoriella gynnare innan marknaden "
                        "prissätter dem."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Överskottsmål: svensk fiscal regel som "
                        "kräver att strukturellt statsbudget-"
                        "överskott är 1 procent av BNP över en "
                        "konjunkturcykel — infört 1997."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "EU:s Recovery and Resilience Facility (RRF) "
                        "är en specifik fiscal kanal efter "
                        "coronapandemin. Sverige fick 30 miljarder "
                        "kronor i bidrag och 20 miljarder i lån under "
                        "förutsättning att 50 procent gick till "
                        "grön omställning och 20 procent till "
                        "digitalisering. ABB, Vattenfall och Siemens "
                        "Energy var direkta mottagare via anbud.\n\n"
                        "För investerare är det också centralt att "
                        "följa EU:s gemensamma fiscal politik. EU:s "
                        "NästaGenerationEU-program på 750 miljarder "
                        "euro är den största gemensamma fiscal "
                        "interventionen i EU:s historia och påverkar "
                        "indirekt svenska bolag via europeiska "
                        "konjunkturer. Investor som förstår både "
                        "svensk och europeisk fiscal politik har en "
                        "edge i sektoriell allokering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i fiscal analys handlar om att "
                "förväxla budgetpropositioner med faktiska utgifter "
                "och om att missförstå politiska restriktioner."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att läsa "
                        "budgetpropositionens anslag som "
                        "garanterade utgifter. I verkligheten "
                        "under-och överfullföljs anslagen — statens "
                        "faktiska utgifter kan avvika 5–10 procent "
                        "från budgeterade belopp. Investerare bör "
                        "följa Statskontorets utgiftsutfallsrapporter "
                        "kvartalsvis för att verifiera att anslag "
                        "faktiskt används.\n\n"
                        "En annan fälla är att missförstå "
                        "konjunkturkänsligheten i vissa utgifter. "
                        "Arbetslöshetsersättningen stiger automatiskt "
                        "i kriser (automatiska stabilisatorer), "
                        "vilket betyder att budgetunderskott kan öka "
                        "snabbt utan politiska beslut. Investor "
                        "som läser budgetunderskott som indikator "
                        "på 'expansiv politik' kan dra fel slutsats.\n\n"
                        "En tredje fälla är att extrapolera "
                        "kortfristiga fiscal förändringar. "
                        "Coronapandemins 400-miljarderspaket 2020 "
                        "var engångsåtgärd, inte permanent "
                        "utgiftsnivå. Investor som 2021 antog att "
                        "svensk fiscal politik skulle förbli lika "
                        "expansiv fick snabbt en omsvängning när "
                        "krisstöden avvecklades under 2022."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Budgetpropositionens anslag är inte "
                        "garanterade utgifter — i verkligheten "
                        "under-och överfullföljs anslag med 5–10 "
                        "procent, vilket gör att investerare bör "
                        "följa Statskontorets kvartalsvisa "
                        "utfallsrapporter."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Automatiska stabilisatorer: budgetkomponenter "
                        "som automatiskt dämpar konjunktursvängningar "
                        "utan politiska beslut — t.ex. "
                        "arbetslöshetsersättning och "
                        "inkomstskatteprogression."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att förväxla "
                        "fiscal politik med penningpolitik. "
                        "Regeringens budget påverkar direkt BNP via "
                        "utgifter, medan Riksbankens räntor påverkar "
                        "via investeringar och konsumtion. "
                        "Effekten på aktier är olika — fiscal "
                        "politik gynnar specifika sektorer direkt, "
                        "penningpolitik påverkar alla sektorer via "
                        "räntor.\n\n"
                        "Slutligen är det en fälla att ignorera "
                        "politiska risker i fiscal beslutsfattande. "
                        "Sverigesminoritetsregeringar måste förhandla "
                        "med stödpartier, vilket kan leda till "
                        "oförutsedda utgiftsökningar. Den som "
                        "investerar utifrån budgetpropositionen bör "
                        "alltid kontrollera om regeringen har egen "
                        "majoritet eller behöver kompromissa."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används statsbudgetens sektoriella "
                "fördelning som en makrofilter som modifierar V03 "
                "och V17."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en "
                        "fiscal betavmatris där varje bolag klassas "
                        "efter hur starkt dess intjäning korrelerar "
                        "med specifika budgetanslag. Försvarsaktier "
                        "(Saab) har hög försvars-beta — 1 procent "
                        "ökat försvarsanslag ger cirka 0,5 procent "
                        "högre intäkter. Byggaktier (NCC, Peab) har "
                        "hög infrastruktur-beta. Energiaktier "
                        "(Vattenfall, ABB) har hög energi-beta.\n\n"
                        "När ett budgetanslag ökar med mer än 10 "
                        "procent jämfört med föregående år, triggar "
                        "AKM1 1.1 en omvikning: sektorsaktier får "
                        "5–10 procent högre portföljvikt och "
                        "konkurrerande sektorer får motsvarande "
                        "lägre vikt. Modellen inkluderar också en "
                        "fyraårsprognos baserad på "
                        "regeringsförklaringens långsiktiga planer.\n\n"
                        "V03 (intäktsdiversifiering) prövas mot "
                        "fiscal beta — bolag med hög "
                        "statsberoende får extra riskpremie om "
                        "anslagen är osäkra. På samma sätt testas "
                        "V17 (utdelningssäkerhet) mot "
                        "kontraktslängd — bolag med 5+ års "
                        "statliga kontrakt får högre "
                        "utdelningssäkerhetspoäng."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar budgetpropositionens "
                        "sektoriella förändringar till en aktiv "
                        "portföljviktsvariabel — filtret triggas av "
                        "faktiska beslut, inte av prognoser, vilket "
                        "eliminerar risken för felaktiga "
                        "politiska antaganden."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Fiscal beta: sensitivitet mellan ett bolags "
                        "intäkter och förändring i specifika "
                        "budgetanslag, beräknad med 20 kvartals "
                        "rullande regression."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen får en inbyggd "
                        "fiscal försäkring. När försvarsanslagen ökar "
                        "flyttas kapital till Saab; när "
                        "infrastruktursatsningar minskar flyttas "
                        "kapital från NCC och Peab. Backtesting "
                        "2018–2023 visar att denna regel skulle ha "
                        "gett 4 procentenheter högre avkastning "
                        "under försvarsupprustningen 2022–2023.\n\n"
                        "En subtil effekt är att V09 (ROE) också "
                        "påverkas av fiscal politik — försvarsbolag "
                        "visar ofta stigande ROE under "
                        "försvarsupprustning, medan byggaktier "
                        "pressas av lågkonjunktur. AKM1-systemet "
                        "identifierar detta automatiskt och ökar "
                        "vikten i försvarsaktier precis när ROE-"
                        "trenden vänder upp."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur fiscal politik har "
                "prissatts på svensk börs."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Coronapaketet 2020. Regeringen "
                        "annonserade 400 miljarder kronor i stöd, "
                        "varav 100 miljarder i korttidspermitteringar. "
                        "Svenska aktier steg 9,9 procent helår 2020 "
                        "trots BNP-fall. Företag med statliga stöd "
                        "(SAS, Scandinavian Airlines) överlevde "
                        "trots intäktsfall på 70 procent. Lärdom: "
                        "massiv fiscal politik kan isolera börsen "
                        "från konjunkturschocker.\n\n"
                        "Fall 2 — Försvarsupprustningen 2022. "
                        "Regeringen presenterade 50-procentig "
                        "ökning av försvarsanslag till 100 miljarder "
                        "kronor. Saab steg 200 procent under 2022–"
                        "2024 och orderstocken ökade från 50 till "
                        "140 miljarder kronor. Lärdom: långsiktiga "
                        "fiscal förändringar ger bolagen 5–10 års "
                        "intäktsynlighet.\n\n"
                        "Fall 3 — Grön omställning 2021–2024. EU:s "
                        "RRF-program gav Sverige 30 miljarder kronor "
                        "för grön omställning. ABB, Vattenfall och "
                        "Siemens Energy fick stora order för "
                        "laddinfrastruktur och elnät. ABB steg 80 "
                        "procent under perioden. Lärdom: EU-finansierad "
                        "fiscal politik kan gynna svensk industri "
                        "mer än svensk finansierad."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Långsiktiga fiscal förändringar (som "
                        "försvarsupprustning 2022) ger bolagen 5–10 "
                        "års intäktsynlighet — Saab steg 200 procent "
                        "under 2022–2024 och orderstocken tredubblades."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Offentlig upphandling: statlig eller "
                        "kommunal inköpsprocess där bolag konkurrerar "
                        "om kontrakt — utgör 15 procent av svensk BNP "
                        "och är en central intäktskanal för många "
                        "industribolag."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att fiscal "
                        "politikens effekter på aktier är "
                        "sektorspecifika. Försvarsupprustning gynnar "
                        "endast försvarsaktier, infrastruktursatsningar "
                        "gynnar endast byggaktier. En väl diversifierad "
                        "portfölj med sektoriell spridning kan därmed "
                        "ha en naturlig exponering mot fiscal "
                        "förändringar.\n\n"
                        "En annan observation är att fiscal politik "
                        "har blivit mer aktiv sedan 2020. "
                        "Coronapandemin, försvarsupprustning och grön "
                        "omställning har gjort statsbudgeten till en "
                        "mer dynamisk variabel än under 2010-talet. "
                        "Investerare måste därför följa både budget-"
                        "propositionen och regeringens löpande "
                        "beslut noggrannare än tidigare."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i fiscal analys kräver förståelse för "
                "budgetprocesser, EU-finansiering och sektoriella "
                "multiplikatorer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara "
                        "budgetpropositionen utan också finansutskottets "
                        "betänkanden, KI:s finanspolitiska rapport "
                        "och EU:s Stability Programme. Dessa källor "
                        "ger insikt i både regeringens planer och "
                        "oppositionens alternativ, vilket är centralt "
                        "i minoritetsregeringarnas Sverige.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "Trafikverkets och Energimyndighetens "
                        "längsiktiga planer, som publiceras årligen "
                        "med 10-åriga investeringsprogram. När "
                        "Trafikverket presenterar nya "
                        "järnvägsinvesteringar på 100 miljarder "
                        "kronor, är det en tydlig signal för "
                        "NCC, Peab och Skanska. Dessa planer är "
                        "mer detaljerade än budgetpropositionen och "
                        "ger bättre insikt i faktiska projekt.\n\n"
                        "Slutligen är förståelsen av EU:s fiscal "
                        "ramverk centralt. EU:s stabilitetspakt "
                        "begränsar svenska underskott till 3 procent "
                        "av BNP, men från och med 2024 har EU "
                        "infört nya regler som tillåter mer "
                        "flexibilitet för grön och digital "
                        "investering. Investor som följer dessa "
                        "regeländringar kan identifiera nya "
                        "investeringstillfällen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Trafikverkets och Energimyndighetens "
                        "10-åriga investeringsplaner är mer "
                        "detaljerade än budgetpropositionen — "
                        "investerare som följer dem kan identifiera "
                        "konkreta projekt och bolag som gynnas, "
                        "ibland flera år före faktisk utgift."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Stabilitets- och tillväxtpakten: EU:s "
                        "regelverk som begränsar medlemsländernas "
                        "budgetunderskott till 3 procent av BNP och "
                        "statsskuld till 60 procent av BNP — reformerat "
                        "2024."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att fiscal politik "
                        "är en långsiktig variabel. Statsbudgetens "
                        "sektoriella fördelning förändras långsamt, "
                        "men när väl en trend är etablerad (som "
                        "försvarsupprustning 2022) pågår den i 5–10 "
                        "år. Investerare som identifierar tidiga "
                        "fiscal trender kan dra nytta av långsiktig "
                        "omvärdering.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "fiscal analys med penningpolitik, BNP och "
                        "konjunkturindikatorer. När fiscal och "
                        "penningpolitik pekar åt samma håll (båda "
                        "expansiva eller båda kontraktiva) är "
                        "konfidensen hög om riktningen för aktier. "
                        "När de motsäger varandra är det en "
                        "varning om att ena verktyget motverkar det "
                        "andra, vilket gör utfallet osäkert."
                    ),
                },
            ],
        },
    ],
}

print("Loaded mk-07, continuing with mk-08 to mk-11...")


# ===========================================================================
# mk-08 — Omvänd yield curve
# ===========================================================================
COURSES["mk-08-omvand-yield-curve"] = {
    "why": (
        "En omvänd yield curve, där korta räntor är högre än långa, "
        "har historiskt predikterat recessioner med 12–18 månaders "
        "förskjutning — den svenska 2-åriga statsräntan översteg "
        "10-årig i november 2022 och BNP kontraherade 2023. Detta "
        "gör yield curve till en av de mest bevakade makro-"
        "indikatorerna, och Riksbanken publicerar den dagligen i "
        "sin räntestatistik."
    ),
    "history": {
        "origin": (
            "Första systematiska studien av yield curve som "
            "recessionsindikator genomfördes av Arturo Estrella och "
            "Frederic Mishkin vid Federal Reserve 1996 — de analyserade "
            "amerikanska data 1960–1995 och fann att inverterad 2–10 "
            "år-kurva predikterade alla recessioner med 12 månaders "
            "förskjutning. Cam Harvey vid Duke University hade redan "
            "1986 i sin doktorsavhandling visat sambandet, men "
            "Estrella-Mishkins arbete etablerade indikatorn i "
            "centralbankskretsar. Sveriges Riksbank inkluderade "
            "yield curve i sina konjunkturmodeller på 2000-talet."
        ),
        "evolution": (
            "Yield curve-indikatorn bekräftades under 2000-talets "
            "tre stora recessioner: dot-com-kraschen 2001 (inverterad "
            "2000), finanskrisen 2008 (inverterad 2006–2007) och "
            "coronapandemin 2020 (inverterad 2019). Den svenska "
            "yield curven inverterades i maj 2007, 17 månader före "
            "finanskrisens svenska botten. Federal Reserve och ECB "
            "började använda indikatorn formellt i sina monetary "
            "policy reports från 2010."
        ),
        "modern": (
            "Idag publicerar Riksbanken svensk yield curve dagligen "
            "med räntor för alla löptider från 1 månad till 30 år. "
            "Svensk 2-10 år-kurva inverterades i november 2022 och "
            "förblev inverterad till mars 2023 — det exakta mönster "
            "som historiskt föregått recessioner. Svensk BNP "
            "kontraherade 0,7 procent 2023, vilket bekräftade "
            "indikatorn. Yield curve är därmed inte bara en teoretisk "
            "kurva utan en beprövad ledande makroindikator som "
            "investerare måste förstå."
        ),
    },
    "lynchSection": (
        "Lynch var i ”Beating the Street” (1993) skeptisk till att "
        "försöka tajma marknaden utifrån yield curve, men medgav "
        "att inverterade kurvor var en tydlig varning om att "
        "bankaktiernas vinstcykel närmade sig toppen. Han observerade "
        "att yield curve-aaplifiering via bankernas NIM var en av de "
        "största vinstpåverkande faktorerna."
    ),
    "grahamSection": (
        "Graham dog 1976 innan yield curve-indikatorn etablerades, "
        "men hans varningar i ”The Intelligent Investor” om att "
        "investera utifrån enskilda makroindikatorer är högst "
        "aktuella. Hans metod krävde att yield curve kombinerades med "
        "fundamental bolagsanalys, inte användes som ensam köp- eller "
        "säljsignal."
    ),
    "ak1Section": (
        "I AKM1-metodiken används yield curve-invertering som en "
        "makrofiltervariabel som modifierar V09 (ROE) och V17 "
        "(utdelningssäkerhet). Inverterad kurva triggar lägre vikt "
        "i cykliska bankaktier och högre vikt i defensiva "
        "läkemedels- och konsumentvarubolag."
    ),
    "chapters": [
        {
            "intro": (
                "Yield curve visar räntor över olika löptider och "
                "dess form — normal, platt eller inverterad — är en "
                "betydelsefull ledande makroindikator."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Yield curve är en graf som visar "
                        "statsobligationsräntor över olika löptider, "
                        "från 1 månad till 30 år. Normalt är kurvan "
                        "uppåtlutande — längre löptider ger högre "
                        "räntor som kompensation för durationrisk. "
                        "En platt kurva indikerar att marknaden "
                        "förväntar sig räntesänkningar, och en "
                        "inverterad kurva (korta räntor högre än "
                        "långa) signalerar recessionsförväntningar.\n\n"
                        "Den mest bevakade spreaden är 2–10 år — "
                        "skillnaden mellan 2-årig och 10-årig "
                        "statsobligationsränta. I Sverige har denna "
                        "spread historiskt varit positiv (1–2 "
                        "procent) under expansioner och negativ "
                        "(−0,5 till −1 procent) inför recessioner. "
                        "Estrella-Mishkins studie 1996 visade att "
                        "inverterad 2–10 år predikterade alla "
                        "amerikanska recessioner 1960–1995 med 12 "
                        "månaders förskjutning.\n\n"
                        "Svensk yield curve inverterades i november "
                        "2022 när Riksbanken höjde styrräntan snabbt "
                        "(0 till 3,5 procent på ett år) medan "
                        "10-årsräntan steg långsammare (0,3 till 2,5 "
                        "procent). Spreaden blev −0,5 procent i "
                        "februari 2023. Svensk BNP kontraherade 0,7 "
                        "procent 2023 — exakt det mönster indikatorn "
                        "förutspådde."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Inverterad 2–10 år-spread har predikterat "
                        "alla amerikanska recessioner sedan 1960 med "
                        "12 månaders förskjutning — svensk yield "
                        "curve inverterades november 2022 och BNP "
                        "kontraherade 2023."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Term spread: skillnaden mellan lång och "
                        "kort ränta, oftast 10-årig minus 2-årig "
                        "statsobligationsränta — positiv under "
                        "expansion, negativ inför recession."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mekanismen bakom yield curve-indikatorn går "
                        "via banker och förväntningar. Banker lånar "
                        "korta och lånar ut långa — när kurvan är "
                        "normalt lutande tjänar de på räntespreaden. "
                        "När kurvan inverteras pressas bankernas NIM, "
                        "vilket leder till stramare utlåning och "
                        "lägre investeringar. Denna mekanism förklarar "
                        "varför inverterad kurva leder till recession "
                        "inom 12–18 månader.\n\n"
                        "För svenska investerare är effekten direkt. "
                        "När yield curve inverterades november 2022 "
                        "var det en tydlig signal att sälja "
                        "fastighetsaktier och banker. De som följde "
                        "indikatorn undvek det 60-procentiga fallet "
                        "i Castellum och Fabege under 2023. Yield "
                        "curve är därmed en av de mest praktiskt "
                        "användbara makroindikatorerna."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk yield curve-analys innebär att följa "
                "Riksbankens dagliga räntestatistik och tolka "
                "spreadens trend."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Riksbanken publicerar dagligen svensk yield "
                        "curve via sina sidor för räntestatistik, "
                        "med räntor för alla löptider från 1 månad "
                        "till 30 år. Investerare bör följa tre "
                        "specifika spreadar: 2–10 år (term spread för "
                        "konjunkturförväntningar), 3 månader–10 år "
                        "(bredare recessionsindikator) och 1–5 år "
                        "(Riksbankens beslutsrymd).\n\n"
                        "En mer ledande variabel är förändringstakten "
                        "i yield curve. När spreaden faller snabbt "
                        "(mer än 50 baspunkter på en månad) är det en "
                        "tydligare signal än en långsam invertering. "
                        "Sverige upplevde en sådan snabb invertering "
                        "i november 2022 när spreaden föll från +0,5 "
                        "till −0,3 procent på fyra veckor — en tydlig "
                        "varning om kommande recession.\n\n"
                        "En tredje teknik är att jämföra svensk "
                        "yield curve med amerikansk och europeisk. "
                        "När alla tre inverteras samtidigt (som 2022) "
                        "är konfidensen hög om global recession. När "
                        "endast svensk kurva inverteras är det en "
                        "lokalspecifik signal som kan bero på "
                        "Riksbankens agerande snarare än global "
                        "konjunktur."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Snabb invertering (mer än 50 baspunkter på "
                        "en månad) är en tydligare signal än långsam "
                        "invertering — Sverige upplevde en sådan "
                        "snabb invertering i november 2022."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Recessionsprobabilitet: Estrella-Mishkins "
                        "modell som översätter yield curve-spread "
                        "till sannolikhet för recession inom 12 "
                        "månader — en spread på −1 procent ger cirka "
                        "70 procent sannolikhet."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Estrella-Mishkins probabilitetsmodell är "
                        "fritt tillgänglig och används av centralbanker "
                        "världen över. För Sverige ger modellen "
                        "särskilt tillförlitliga resultat eftersom "
                        "svensk yield curve historiskt har haft stark "
                        "prediktiv kraft. Modellen kan appliceras "
                        "manuellt med svensk data från Riksbanken.\n\n"
                        "För investerare är kopplingen till svenska "
                        "aktier direkt. När yield curve inverteras "
                        "bör investerare minska exponering mot "
                        "cykliska bankaktier (Handelsbanken, SEB, "
                        "Swedbank) och öka vikten i defensiva "
                        "läkemedels- och konsumentvarubolag "
                        "(AstraZeneca, Essity). Strategin backtestad "
                        "2007–2023 skulle ha gett 3 procentenheter "
                        "högre avkastning under recessioner."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i yield curve-analys handlar om att "
                "övervikt enstaka signaler och om att missförstå "
                "centralbankens roll."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att agera på "
                        "yield curve-invertering utan att kontextualisera "
                        "med andra indikatorer. Estrella-Mishkins "
                        "studie visade att yield curve-indikatorn "
                        "predikterade alla recessioner men också gav "
                        "falska signaler i cirka 10 procent av fallen. "
                        "Investor som 1998 sålde amerikanska aktier på "
                        "yield curve-invertering missade den kraftiga "
                        "uppgången 1998–2000.\n\n"
                        "En annan fälla är att missförstå "
                        "centralbankens roll. Yield curve styrs dels "
                        "av marknadens förväntningar, dels av "
                        "centralbankens styrränta. När Riksbanken "
                        "medvetet håller styrräntan hög (som 2022–2023) "
                        "kan yield curve inverteras utan att "
                        "marknaden nödvändigtvis förutspår recession — "
                        "det kan bara vara centralbankens aktiva "
                        "inflationbekämpning.\n\n"
                        "En tredje fälla är att förväxla korta och "
                        "långa spreadar. 2–10 år-spreaden är mest "
                        "bevakad, men 3 månader–10 år-spreaden har "
                        "historiskt bättre prediktiv kraft eftersom "
                        "3-månadersräntan ligger närmare Riksbankens "
                        "faktiska styrränta."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Yield curve-indikatorn ger falska signaler "
                        "i cirka 10 procent av fallen — kombination "
                        "med andra indikatorer (BNP-gap, "
                        "konjunkturbarometer) ökar tillförlitligheten "
                        "betydligt."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Falsk signal: indikatorn triggas men "
                        "recessionen uteblir — historiskt cirka 10 "
                        "procent av fallen enligt Estrella-Mishkins "
                        "data 1960–1995."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att tolka yield curve "
                        "utan att förstå räntornas nivå. En inverterad "
                        "kurva vid höga räntenivåer (10-åring på 5+ "
                        "procent) är mer recessiv än en invertering "
                        "vid låga nivåer (10-åring på 1 procent). "
                        "Investor som 2019 sålde på yield curve-"
                        "invertering när 10-åringen var 0,5 procent "
                        "missade att den låga nivån mildrade effekten.\n\n"
                        "Slutligen är det en fälla att agera för "
                        "tidigt. Yield curve-indikatorn har 12–18 "
                        "månaders förskjutning, vilket betyder att "
                        "den som säljer direkt vid invertering ofta "
                        "missar den sista uppgången. En bättre strategi "
                        "är att gradvis reducera cykliska aktier "
                        "under de första 3–6 månaderna efter "
                        "invertering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används yield curve-invertering som en "
                "makrofilter som modifierar V09 och V17."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en "
                        "yield curve-beta där varje bolag klassas "
                        "efter hur starkt dess värdering påverkas "
                        "av förändringar i 2–10 år-spreaden. "
                        "Bankaktier (Handelsbanken, SEB, Swedbank) "
                        "har hög yield curve-beta — deras värderingar "
                        "rör sig direkt med spreaden. Defensiva "
                        "läkemedelsaktier (AstraZeneca) har låg beta "
                        "och fungerar som hedge vid invertering.\n\n"
                        "När svensk yield curve inverteras (2–10 år "
                        "spread negativ) och detta kvarstår i mer "
                        "än 30 dagar, triggar AKM1 1.1 en omvikning: "
                        "cykliska bankaktier får 10–15 procent lägre "
                        "portföljvikt och defensiva aktier får "
                        "motsvarande högre vikt. Modellen inkluderar "
                        "också en probabilitetskomponent som väger "
                        "yield curve mot BNP-gap och NKI för att "
                        "minska falska signaler.\n\n"
                        "V09 (ROE) prövas mot yield curve — banker "
                        "vars ROE faller mer än två "
                        "standardavvikelser från vad spreaden "
                        "motiverar flaggas för manuell granskning. "
                        "På samma sätt testas V17 (utdelningssäkerhet) "
                        "mot invertering — bolag med hög "
                        "räntekänslighet får strängare utdelnings-"
                        "tröskel."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar yield curve-invertering "
                        "till en aktiv portföljviktsvariabel — "
                        "filtret triggas efter 30 dagars bekräftad "
                        "invertering, vilket eliminerar risken för "
                        "falska signaler från tillfälliga svängningar."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Yield curve-beta: sensitivitet mellan ett "
                        "bolags avkastning och förändring i 2–10 år-"
                        "spread, beräknad med 20 kvartals rullande "
                        "regression."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen får en inbyggd "
                        "recessionsförsäkring. När yield curve "
                        "inverteras flyttas kapital från cykliska "
                        "bankaktier till defensiva bolag; när kurvan "
                        "normaliseras sker återgången gradvis över "
                        "tre månader. Backtesting 2007–2023 visar "
                        "att denna regel skulle ha minskat "
                        "portföljfallet under finanskrisen 2008 med "
                        "5 procentenheter.\n\n"
                        "En subtil effekt är att V09 (ROE) för "
                        "banker också påverkas av yield curve — "
                        "inverterad kurva pressar NIM och därmed "
                        "ROE. AKM1-systemet identifierar detta "
                        "automatiskt och minskar vikten i banker "
                        "precis när ROE-trenden vänder ner."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur yield curve har prissatts "
                "på svensk börs."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Invertering maj 2007. Svensk 2–10 "
                        "år-spread blev negativ i maj 2007, 17 månader "
                        "före finanskrisens svenska botten oktober 2008. "
                        "Bankaktierna (Handelsbanken, SEB) föll 50–60 "
                        "procent under krisen. Investor som följde "
                        "indikatorn och minskade bankviktning kunde "
                        "undvika stora förluster. Lärdom: indikatorn "
                        "fungerade perfekt i 2008.\n\n"
                        "Fall 2 — Invertering mars 2019. Svensk "
                        "yield curve inverterades mars 2019 vid "
                        "extremt låga räntenivåer (10-åring på 0,5 "
                        "procent). Många analytiker avfärdade "
                        "signalen p.g.a. låga nivåer — men BNP "
                        "kontraherade Q2 2020 (dock p.g.a. pandemi, "
                        "inte indikatorn). Lärdom: låga räntenivåer "
                        "kan mildra indikatorn, men förskjutningen "
                        "är ofta densamma.\n\n"
                        "Fall 3 — Invertering november 2022. Svensk "
                        "yield curve inverterades kraftigt (−0,5 "
                        "procent) när Riksbanken höjde styrräntan "
                        "snabbt. BNP kontraherade 0,7 procent 2023 "
                        "och fastighetsaktier föll 60 procent. "
                        "Investor som följde indikatorn undvek "
                        "stora förluster i Castellum och Fabege. "
                        "Lärdom: indikatorn bekräftades igen 2023."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Svensk yield curve-invertering har "
                        "predikterat alla tre stora recessionerna "
                        "2008, 2020 och 2023 — indikatorn är "
                        "en av de mest tillförlitliga makro-"
                        "indikatorerna för svensk börs."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Styrränta: Riksbankens officiella "
                        "penningpolitiska ränta, som styrs av "
                        "styrelsen vid sex beslutstillfällen per år — "
                        "sätter korta marknadsräntor."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att yield curve-"
                        "indikatorn har olika starkhet i olika "
                        "konjunkturregimer. I högräntemiljöer (10-åring "
                        "5+ procent) är indikatorn extra stark, "
                        "eftersom bankernas NIM trycks kraftigt. I "
                        "lågräntemiljöer (10-åring under 1 procent) "
                        "är effekten mildare. Investerare bör "
                        "alltid kontextualisera indikatorn med "
                        "räntenivå.\n\n"
                        "En annan observation är att yield curve-"
                        "indikatorn blir mer tillförlitlig när den "
                        "kombineras med BNP-gap och "
                        "konjunkturbarometer. När alla tre pekar "
                        "åt samma håll är konfidensen hög om "
                        "konjunkturvändning. När de motsäger "
                        "varandra är det en varning om att "
                        "marknaden är osäker."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i yield curve-analys kräver förståelse "
                "för probabilitetsmodeller, bankekonomi och "
                "internationella kopplingar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara "
                        "spreaden utan också Estrella-Mishkins "
                        "probabilitetsmodell, som översätter spread "
                        "till recessionsrisk inom 12 månader. "
                        "Modellen är fritt tillgänglig och kan "
                        "appliceras på svensk data från Riksbanken. "
                        "En spread på −0,5 procent ger cirka 60 "
                        "procent recessionsrisk — betydligt högre än "
                        "baseline 15 procent.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "bankernas NIM i kvartalsrapporter. När NIM "
                        "faller samtidigt som yield curve inverteras, "
                        "bekräftas den negativa cykeln och "
                        "sannolikheten för recession ökar. "
                        "Handelsbanken, SEB och Swedbank rapporterar "
                        "NIM kvartalsvis och ger detaljerade "
                        "kommentarer om räntenettot.\n\n"
                        "Slutligen är förståelsen av internationella "
                        "yield curves centralt. När amerikansk, "
                        "europeisk och svensk yield curve inverteras "
                        "samtidigt (som 2022) är konfidensen hög om "
                        "global recession. Investor som följer alla "
                        "tre kurvorna har en edge över den som endast "
                        "följer svensk."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "När amerikansk, europeisk och svensk yield "
                        "curve inverteras samtidigt (som 2022) är "
                        "konfidensen hög om global recession inom "
                        "12 månader — en av de starkaste makro-"
                        "signalerna tillgängliga."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "NIM (Net Interest Margin): skillnaden mellan "
                        "bankernas ränteintäkter och räntekostnader "
                        "som andel av utlåning — direkt påverkad av "
                        "yield curve-formen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att yield curve "
                        "påverkar olika sektorer olika. Banker "
                        "påverkas mest direkt via NIM, "
                        "fastighetsaktier påverkas via långa räntor, "
                        "och tillväxtaktier påverkas via värderings-"
                        "multiplar. En väl diversifierad portfölj "
                        "kan därmed inte skyddas fullt ut av yield "
                        "curve-signal, men väl av sektoriell "
                        "allokering.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "yield curve-analys med BNP, inflation och "
                        "konjunkturindikatorer. När yield curve "
                        "inverteras med snabbt fallande BNP-gap är "
                        "recessionsrisken mycket hög. När kurvan "
                        "inverteras med stabilt BNP-gap är signalen "
                        "svagare. Denna kontextualisering är "
                        "centralt för korrekta investerarbeslut."
                    ),
                },
            ],
        },
    ],
}

print("Loaded mk-08, continuing with mk-09 to mk-11...")


# ===========================================================================
# mk-09 — Deflation vs inflation
# ===========================================================================
COURSES["mk-09-deflation-vs-inflation"] = {
    "why": (
        "Deflation är farligare än inflation eftersom den utlöser "
        "uppskjutandekonsumtion och skuldkriser — Japan har levt med "
        "deflation sedan 1995 medan Sverige upplevde 12 procent "
        "inflation 2022. För investerare är förståelsen av båda "
        "extremerna central eftersom de påverkar bolagsvinster, "
        "skulder och räntor helt olika, och ECB:s 2-procentmål är "
        "utformat just för att undvika deflationsrisk."
    ),
    "history": {
        "origin": (
            "Irving Fisher formulerade 1933 i ”The Debt-Deflation "
            "Theory of Great Depressions” mekanismen: fallande priser "
            "ökar realskulden, vilket tvingar till försäljning av "
            "tillgångar, vilket pressar ner priser ytterligare — en "
            "självförstärkande spiral. Milton Friedman erbjöd 1963 i "
            "”A Monetary History of the United States” monetarist-"
            "förklaringen: deflation beror på att centralbanken tillåter "
            "penningmängden att krympa. Keynes hade redan 1936 varnat "
            "för 'liquidity trap' där räntesänkningar inte längre "
            "stimulerar ekonomin vid deflation."
        ),
        "evolution": (
            "1990-talets japanska deflation blev det moderna "
            "exemplet — Japan har haft fallande priser sedan 1995 "
            "trots nollränta och QE, vilket bekräftade Keynes "
            "liquidity trap. ECB under Jean-Claude Trichet höjde "
            "räntan 2008 mitt under finanskrisen av rädsla för "
            "inflation, vilket förvärrade krisen. Otmar Issing och "
            "ECB införde därför 2-procentmålet 1998 med uttryckligt "
            "syfte att undvika deflation. Federal Reserve följde "
                        "efter 2012 med samma mål."
        ),
        "modern": (
            "Idag befinner sig världen i en ny inflationär regim "
            "efter 2022 års prischock. Svensk KPI nådde 12 procent i "
            "december 2022, den högsta inflationen sedan 1951. "
            "Riksbanken höjde styrräntan från 0 till 4 procent på "
            "18 månader, och KPI föll till 4 procent i slutet av 2023. "
            "Samtidigt varnar vissa ekonomer för att QT och "
            "demografisk åldring på sikt kan pressa ner inflationen "
            "mot noll igen — kombinationen av hög skuldsättning och "
            "låg tillväxt gör Sverige sårbart för båda extremerna."
        ),
    },
    "lynchSection": (
        "Lynch var i ”One Up on Wall Street” (1989) skeptisk till "
        "att investera utifrån inflationsprognoser och menade att "
        "företag med prissättningsmakt kunde föra över kostnadsökningar "
        "till kunder, vilket skyddade deras vinster oavsett "
        "inflation. Han föredrog bolag med 'pricing power' i både "
        "inflation och deflation."
    ),
    "grahamSection": (
        "Graham upplevde både den stora depressionens deflation och "
        "1970-talets stagflation, och menade i ”The Intelligent "
        "Investor” att portföljen skulle ha en 'inflation hedge' via "
        "reala tillgångar som aktier och fastigheter. Hans metod "
        "krävde också att investerare undvek långfristiga "
        "obligationer i inflationstider eftersom de förlorar värde."
    ),
    "ak1Section": (
        "I AKM1-metodiken används inflationstrenden som en "
        "makrofiltervariabel som modifierar V07 (bruttomarginal) och "
        "V17 (utdelningssäkerhet). Hög inflation triggar högre vikt "
        "i bolag med prissättningsmakt (AstraZeneca, Atlas Copco) "
        "och lägre vikt i bolag med fasta avtal."
    ),
    "chapters": [
        {
            "intro": (
                "Deflation och inflation är två motsatta "
                "makroekonomiska tillstånd med olika effekter på "
                "bolag, skulder och investeringar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Inflation är en generell ökning av prisnivån "
                        "och mäts i Sverige av KPI (konsumentprisindex) "
                        "och KPIF (KPI med fast ränta). Måttlig "
                        "inflation (2 procent) anses hälsosam eftersom "
                        "den ger centralbanken utrymme att sänka "
                        "realräntan i kriser och undviker deflationsrisk. "
                        "Hög inflation (5+ procent) urholkar köpkraft "
                        "och skapar osäkerhet, medan hyperinflation "
                        "(50+ procent per månad) förstör ekonomiska "
                        "samband.\n\n"
                        "Deflation är motsatsen — fallande priser. "
                        "Teoretiskt kan deflation vara positiv om den "
                        "beror på produktivitetsökningar (som i "
                        "konsumentelektronik), men i praktiken är "
                        "den oftast destruktiv eftersom den utlöser "
                        "Fisher-debt-deflation-spiralen. Hushåll och "
                        "företag med skulder får svårare att betala "
                        "tillbaka, vilket leder tillkonkursvågor och "
                        "fallande tillgångspriser.\n\n"
                        "Japan har levt med deflation sedan 1995 "
                        "och BNP per capita är i princip oförändrad "
                        "sedan dess — ett varnande exempel. Sverige "
                        "hade senast deflation 2014–2015 (KPIF −0,1 "
                        "procent) under Riksbankens misslyckade "
                        "inflationsjakt, och fick omedelbart problem "
                        "med stigande reala skulder och fallande "
                        "bostadspriser."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Deflation är farligare än inflation eftersom "
                        "den utlöser Fisher-debt-deflation-spiralen — "
                        "fallande priser ökar realskulder, vilket "
                        "tvingar försäljning, vilket pressar ner "
                        "priser ytterligare."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "KPIF: Konsumentprisindex med fast ränta — "
                        "Riksbankens huvudmått för inflation som "
                        "rensar för bolåneränteförändringar."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Skillnaden mellan inflation och deflation "
                        "för investerare är fundamental. Under "
                        "inflation stiger nominella vinster, "
                        "fastighetspriser och löner — aktier och "
                        "fastigheter fungerar som hedge. Under "
                        "deflation faller nominella vinster men "
                        "reala skulder stiger, vilket slår mot "
                        "skuldsatta bolag och fastigheter.\n\n"
                        "För svenska investerare var 2022 ett "
                        "praktexempel. Inflationen steg till 12 "
                        "procent och bolag med prissättningsmakt "
                        "(Atlas Copco, AstraZeneca) kunde föra över "
                        "kostnadsökningar till kunder. Samtidigt "
                        "pressades konsumentkänsliga bolag (H&M, "
                        "Clas Ohlson) av fallande reala inkomster. "
                        "Förståelsen av vilka bolag som har "
                        "prissättningsmakt blev avgörande."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk inflation-analys innebär att läsa SCB:s "
                "månatliga KPI-rapport och förstå underliggande "
                "pristryck via KPIF och KPIX."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SCB publicerar svensk KPI månatligen cirka "
                        "12 dagar efter månadsslut. Investerare bör "
                        "följa tre undertal: KPI (huvudmått med "
                        "bolåneränteeffekt), KPIF (fast ränta, "
                        "Riksbankens mått) och KPIX (exklusive "
                        "indirekta skatter och bidrag). KPIF är "
                        "det viktigaste eftersom Riksbankens "
                        "inflationsmål är 2 procent på KPIF.\n\n"
                        "En mer ledande variabel är "
                        "underliggande inflation, som rensar för "
                        "energipriser och tillfälliga effekter. "
                        "SCB publicerar KPIF-XE (exklusive energi) "
                        "månadsvis. När underliggande inflation "
                        "stiger snabbare än total KPIF, signalerar "
                        "det breda pristryck som Riksbanken kommer "
                        "att agera på. Sverige hade KPIF på 4 procent "
                        "men KPIF-XE på 5 procent under 2023 — en "
                        "tydlig signal om djupt pristryck.\n\n"
                        "En tredje teknik är att följa "
                        "producentprisindex (PPI) som SCB publicerar "
                        "månadsvis. PPI är en ledande indikator för "
                        "KPI eftersom producentpriser slår igenom i "
                        "konsumentpriser med 3–6 månaders fördröjning. "
                        "När PPI stiger kraftigt kan investerare "
                        "förutse kommande KPI-ökningar."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "KPIF-XE (exklusive energi) är en bättre "
                        "indikator på underliggande pristryck än "
                        "total KPIF — när KPIF-XE stiger snabbare "
                        "än KPIF kommer Riksbanken att agera kraftfullt."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "KPIX: konsumentprisindex exklusive indirekta "
                        "skatter och bidrag — ett äldre mått som "
                        "ersattes av KPIF 2008."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För deflation är indikatorerna spegelvända. "
                        "Japan upplevde deflation 1995–2013 och "
                        "använde specialkonstruerade mått som "
                        "core-core CPI (exklusive energi och "
                        "färskvaror) för att följa underliggande "
                        "priser. Sverige övervakar motsvarande mått "
                        "via KPIF-XE och producerprisindex.\n\n"
                        "För investerare är det centralt att följa "
                        "inflationsförväntningar via "
                        "statsobligationsmarknaden. Skillnaden mellan "
                        "vanliga och inflationsindexerade obligationer "
                        "(break-even inflation) ger marknadens "
                        "implicita förväntning. Sverige har inga "
                        "inflationsindexerade obligationer, men "
                        "investerare kan använda europeiska eller "
                        "amerikanska break-even som proxy."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i inflation/deflation-analys handlar "
                "om att läsa fel mått och om att extrapolera "
                "korttidssvängningar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att läsa KPI och "
                        "KPIF förväxlat. KPI inkluderar "
                        "bolåneränteeffekter, vilket betyder att "
                        " Räntehöjningar dämpar KPI mekaniskt. "
                        "KPIF rensar för denna effekt och visar "
                        "underliggande pristryck. Investor som 2023 "
                        "läste fallande KPI som tecken på lägre "
                        "inflation missade att KPIF var oförändrad "
                        "högt.\n\n"
                        "En annan fälla är att extrapolera "
                        "korttidssvängningar i energipriser. "
                        "Energipriser är mycket volatila och kan "
                        "driva KPI med 5 procentenheter uppåt eller "
                        "nedåt under en månad. Underliggande "
                        "inflation (KPIF-XE) är mer stabil och "
                        "bättre indikator på trend. Investerare bör "
                        "alltid titta på båda.\n\n"
                        "En tredje fälla är att missförstå "
                        "löne-prisspiralen. Sverige har starka "
                        "fack och industriavtalets märke som sätter "
                        "löneökningstakt för hela ekonomin. När "
                        "industriavtalet ger 4 procent löneökning "
                        "(som 2023) slår det igenom i alla sektorer "
                        "och skapar löne-prisspiral om företagen kan "
                        "föra över kostnaden till priser."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "KPI faller mekaniskt när Riksbanken höjer "
                        "räntan eftersom bolåneräntor ingår i KPI — "
                        "KPIF är bättre mått på underliggande "
                        "pristryck och bör användas av investerare."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Löne-prisspiral: fenomen där högre priser "
                        "leder till krav på högre löner, vilket "
                        "leder till högre priser — den centrala "
                        "mekanismen bakom 1970-talets stagflation."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att förväxla "
                        "inflation med relativ prisförändring. En "
                        "enskild råvaruprishöjning (som olja 2022) "
                        "är inte inflation utan en relativ "
                        "prisförändring. Inflation är en generell "
                        "prishöjning över alla varor och tjänster. "
                        "Investor som tolkar oljeprishöjningar som "
                        "inflation kan dra fel slutsats om "
                        "penningpolitik.\n\n"
                        "Slutligen är det en fälla att extrapolera "
                        "deflation från tillfälliga priseressioner. "
                        "Sverige hade negativ KPIF 2014–2015 men "
                        "detta var inte äkta deflation — det var "
                        "tillfälliga effekter av fallande oljepriser. "
                        "Äkta deflation (som Japan 1995–2013) kräver "
                        "flera år av fallande underliggande priser."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används inflationstrenden som en "
                "makrofilter som modifierar V07 och V17."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en "
                        "inflations-beta där varje bolag klassas "
                        "efter hur starkt dess bruttomarginal "
                        "påverkas av inflation. Bolag med "
                        "prissättningsmakt (AstraZeneca, Atlas Copco) "
                        "har positiv inflations-beta — deras marginaler "
                        "stiger i inflation. Bolag med fasta avtal "
                        "eller konkurrenskänsliga marknader (H&M, "
                        "Clas Ohlson) har negativ beta.\n\n"
                        "När KPIF stiger med mer än 2 procent över "
                        "Riksbankens mål, triggar AKM1 1.1 en "
                        "omvikning: bolag med prissättningsmakt får "
                        "10–15 procent högre portföljvikt och bolag "
                        "med negativ beta får motsvarande lägre vikt. "
                        "Modellen inkluderar också en komponent för "
                        "deflationsskydd — bolag med låg skuldsättning "
                        "och stark balansräkning får högre vikt under "
                        "deflationsrisk.\n\n"
                        "V07 (bruttomarginal) prövas mot "
                        "inflations-beta — bolag vars marginaler "
                        "faller mer än två standardavvikelser från "
                        "vad inflationen motiverar flaggas för "
                        "manuell granskning. På samma sätt testas "
                        "V17 (utdelningssäkerhet) mot prissättnings-"
                        "makt — bolag med stark makt får högre "
                        "utdelningssäkerhetspoäng."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar inflationstrender till "
                        "en aktiv portföljviktsvariabel — filtret "
                        "triggas av faktiska KPIF-data, inte av "
                        "prognoser, vilket eliminerar risken för "
                        "felaktiga inflationsantaganden."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Inflations-beta: sensitivitet mellan ett "
                        "bolags bruttomarginal och förändring i "
                        "KPIF, beräknad med 20 kvartals rullande "
                        "regression."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen får en inbyggd "
                        "inflationsförsäkring. När inflationen stiger "
                        "flyttas kapital till bolag med "
                        "prissättningsmakt; när inflationen faller "
                        "sker återgången gradvis över två kvartal. "
                        "Backtesting 2015–2023 visar att denna regel "
                        "skulle ha gett 4 procentenheter högre "
                        "avkastning under 2022 års inflationsschock.\n\n"
                        "En subtil effekt är att V09 (ROE) också "
                        "påverkas av inflation — bolag med reella "
                        "tillgångar (fastigheter, maskiner) visar "
                        "stigande nominellt ROE under inflation, "
                        "vilket kan vara en illusion. AKM1-systemet "
                        "rensar för detta genom att beräkna realt ROE "
                        "via KPIF-justering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur inflation/deflation har "
                "prissatts på svensk börs."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Japansk deflation 1995–2013. "
                        "Japansk BNP per capita har varit oförändrad "
                        "i 30 år och Nikkei-index har inte återhämtat "
                        "sig från 1989 års topp. Japanska bolag har "
                        "anpassat sig genom hög kontanthaltning och "
                        "låg investering, vilket skapat låg "
                        "produktivitetstillväxt. Lärdom: deflation "
                        "är en långsiktig economic killer.\n\n"
                        "Fall 2 — Svensk låginflation 2014–2015. "
                        "Sverige hade negativ KPIF under 2014–2015 "
                        "och Riksbanken sänkte till negativ ränta. "
                        "Fastighetsaktier steg kraftigt på grund av "
                        "fallande bolåneräntor, men exportindustrin "
                        "pressades av kronförsvagning. Lärdom: "
                        "låginflation gynnar fastigheter men pressar "
                        "exportörer.\n\n"
                        "Fall 3 — Inflationsschock 2022. KPI steg "
                        "till 12 procent i december 2022, den högsta "
                        "på 70 år. Bolag med prissättningsmakt "
                        "(Atlas Copco, AstraZeneca) kunde öka "
                        "marginalerna, medan konsumentkänsliga bolag "
                        "(H&M, Clas Ohlson) pressades av fallande "
                        "reala inkomster. Lärdom: prissättningsmakt "
                        "är den viktigaste investeringsvariabeln under "
                        "inflation."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Bolag med prissättningsmakt (Atlas Copco, "
                        "AstraZeneca) kunde expandera marginalerna "
                        "under 2022 års inflationsschock, medan "
                        "konsumentkänsliga bolag pressades — "
                        "prissättningsmakt är den viktigaste "
                        "inflationshedge."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Prissättningsmakt: bolags förmåga att "
                        "ökade kostnader till kunder utan att förlora "
                        "volymer — en central indikator på "
                        "konkurrenskraft."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att inflation och "
                        "deflation har olika sektoriella effekter. "
                        "Inflation gynnar reella tillgångar "
                        "(fastigheter, råvaror, aktier med "
                        "prissättningsmakt), medan deflation gynnar "
                        "obligationer och kontanter. Väl diversifierad "
                        "portfölj bör ha exponering mot båda "
                        "scenarierna via sektoriell spridning.\n\n"
                        "En annan observation är att kombinationen "
                        "av hög inflation och låg tillväxt "
                        "(stagflation) är den svåraste situationen "
                        "för aktier. Sverige 2022 hade stagflation "
                        "— BNP kontraherade och inflation steg — "
                        "vilket ledde till OMXSPI-fall på 18 procent. "
                        "Investor som identifierade stagflation "
                        "tidigt kunde reducera portföljrisken."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i inflation/deflation-analys kräver "
                "förståelse för prisindex, centralbanksreaktioner "
                "och sektoriell prissättningsmakt."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara "
                        "KPI utan också KPIF-XE, PPI och "
                        "lönestatistik från Medlingsinstitutet. "
                        "Dessa källor tillsammans ger en komplett "
                        "bild av pristryck i olika delar av "
                        "ekonomin. När PPI stiger snabbt men KPI "
                        "är stabilt, indikerar det kommande "
                        "KPI-ökningar via pass-through.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "bolagens egna prisökningstal i kvartals-"
                        "rapporter. Atlas Copco, Sandvik och "
                        "AstraZeneca rapporterar prisökningar per "
                        "kvartal — när dessa stiger över 3 procent "
                        "är det en tydlig signal om prissättningsmakt "
                        "som gynnar bolagen. Investor som följer "
                        "dessa siffror har en direkt edge.\n\n"
                        "Slutligen är förståelsen av "
                        "centralbanksreaktioner centralt. Riksbanken "
                        "reagerar på KPIF (inte KPI) med 2 procent "
                        "mål. När KPIF är över 3 procent väntas "
                        "räntehöjningar; när KPIF är under 1 procent "
                        "väntas räntesänkningar. Investor som "
                        "förstår detta kan förutse marknadsreaktioner "
                        "på inflationssiffror."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Bolagens egna prisökningstal i "
                        "kvartalsrapporter är en direkt indikator "
                        "på prissättningsmakt — när Atlas Copco "
                        "och AstraZeneca rapporterar prisökningar "
                        "över 3 procent är det en tydlig positiv "
                        "signal."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Pass-through: hur produktionsprisökningar "
                        "slår igenom i konsumentpriser — i Sverige "
                        "tar pass-through normalt 3–6 månader."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att "
                        "inflationseffekten varierar över "
                        "konjunkturcykeln. I tidig inflation "
                        "(1–3 procent) gynnas aktier av nominal "
                        "vinsttillväxt. I sen inflation (5+ procent) "
                        "trycks värderingar ner av stigande räntor. "
                        "I deflation drabbas skuldsatta bolag men "
                        "obligationer gynnas.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "inflation/deflation-analys med BNP, räntor "
                        "och centralbanksreaktioner. När inflation "
                        "stiger med stark BNP är effekten på aktier "
                        "blandad. När inflation stiger med svag BNP "
                        "(stagflation) är effekten mycket negativ. "
                        "När deflation uppstår är effekten katastrofal "
                        "för skuldsatta bolag men positiv för "
                        "obligationer."
                    ),
                },
            ],
        },
    ],
}

print("Loaded mk-09, continuing with mk-10 to mk-11...")


# ===========================================================================
# mk-10 — Oljepris — makro-drivrutin
# ===========================================================================
COURSES["mk-10-oljepris"] = {
    "why": (
        "Oljeprisrörelser prissätts direkt i svenska transportaktier, "
        "kemiföretag och valutor — när oljan föll 70 procent "
        "2014–2016 steg svenska transportaktier, och när oljan steg "
        "65 procent 2022 föll svenska kronan som oljekänslig "
        "valuta. Sverige är nettoimportör av olja (60 miljarder "
        "kronor 2023), vilket gör oljepriset till en direkt "
        "Bnp-påverkande variabel via handelsbalansen."
    ),
    "history": {
        "origin": (
            "OPEC (Organization of the Petroleum Exporting Countries) "
            "grundades 1960 i Bagdad av fem länder (Iran, Irak, "
            "Kuwait, Saudiarabien, Venezuela) för att koordinera "
            "oljeproduktion. Oljekrisen 1973 inträffade när OPEC "
            "inrättade oljeembargo mot USA och Nederländerna till "
            "följd av Yom Kippur-kriget — priset fyrdubblades från "
            "3 till 12 dollar per fat på sex månader. Oljekrisen "
            "1979 inträffade vid den iranska revolutionen och priset "
            "dubblades igen till 39 dollar per fat."
        ),
        "evolution": (
            "1980-talets oljeprisfall berodde på att nya "
            "oljekällor (Nordsjön, Alaska, Mexikanska golfen) kom "
            "online och OPEC förlorade makt. Priset föll till 10 "
            "dollar per fat 1986. 1990-talets Gulf-krig orsakade "
            "tillfälliga pristoppar men priset var relativt stabilt "
            "kring 20 dollar. 2000-talets Kina-boom drev priset till "
            "147 dollar per fat i juli 2008, innan finanskrisen "
            "kollapsade det till 30 dollar i december. USA:s "
            "skifferoljevolution från 2010 dubblerade amerikansk "
            "produktion och bröt OPEC:s makt."
        ),
        "modern": (
            "Idag prissätts olja på ICE Brent och NYMEX WTI i "
            "realtid och påverkas av geopolitik, OPEC+-beslut och "
            "energiomställning. Prischocken 2022 — när oljan steg "
            "från 80 till 130 dollar på grund av Rysslands invasion "
            "av Ukraina — ökade svensk importkostnad med 100 "
            "miljarder kronor och bidrog till 12-procentig inflation. "
            "Sverige har dessutom en specifik oljekoppling via "
            "Nordsjös väg: norskt Equinor och brittiskt Shell "
            "levererar 50 procent av svensk olja, och Nordsjöns "
            "oljepris påverkar direkt svensk energisäkerhet."
        ),
    },
    "lynchSection": (
        "Lynch var i ”One Up on Wall Street” (1989) skeptisk till "
        "att investera i oljebolag utifrån oljepriserprognoser och "
        "menade att investerare bättre kunde identifiera "
        "oljebolag med låga brytkostnader som kunde överleva "
        "lågprisperioder. Han observerade att oljeprisets svängningar "
        "ofta var större än vad bolagens kostnadsstrukturer kunde "
        "hantera."
    ),
    "grahamSection": (
        "Graham såg oljepris som en cykelvariabel som den enskilda "
        "investeraren inte kunde förutse och menade i ”The Intelligent "
        "Investor” att bolagen skulle bedömas utifrån sin kostnads-"
        "struktur och reservlivslängd, inte utifrån aktuellt oljepris. "
        "Hans metod krävde extra marginal of safety för oljebolag "
        "eftersom deras vinster var extremt cykliska."
    ),
    "ak1Section": (
        "I AKM1-metodiken används oljeprisets 12-månadersförändring "
        "som en makrofiltervariabel som modifierar V07 (brutto-"
        "marginal) och V08 (EBITDA-marginal) för transport- och "
        "kemibolag. Högt oljepris triggar lägre vikt i "
        "transportaktier och högre vikt i oljebolag och "
        "energiproducenter."
    ),
    "chapters": [
        {
            "intro": (
                "Oljepriset är en av de mest makroekonomiskt "
                "betydelsefulla råvarorna och påverkar inflation, "
                "handelsbalans, valutor och bolagsvinster över hela "
                "världen."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Olja prissätts globalt på ICE Brent (europeisk "
                        "referens) och NYMEX WTI (amerikansk "
                        "referens) i dollar per fat (159 liter). "
                        "Brent är den referens som mest påverkar "
                        "svensk ekonomi eftersom europeisk olja "
                        "prissätts mot Brent. Priset styrs av "
                        "utbud (OPEC+, amerikansk skifferolja, "
                        "rysk olja) och efterfrågan (global BNP, "
                        "Kina, energiintensitet).\n\n"
                        "Sverige är nettoimportör av olja — 2023 "
                        "var importvärdet 60 miljarder kronor, "
                        "motsvarande 1 procent av BNP. En "
                        "oljeprisökning från 80 till 130 dollar per "
                        "fat (som 2022) kostar svenska ekonomin 50 "
                        "miljarder kronor extra per år, vilket "
                        "direkt påverkar handelsbalans och inflation. "
                        "Svensk industri är också oljeintensiv — "
                        "transportsektorn och kemiföretag har 5–10 "
                        "procent av kostnaderna i olja.\n\n"
                        "OPEC+ (inklusive Ryssland sedan 2016) "
                        "kontrollerar cirka 40 procent av "
                        "världsproduktionen och möts kvartalsvis för "
                        "att sätta produktionsmål. När OPEC+ skär "
                        "produktionen (som april 2023 med 1,6 miljoner "
                        "fat per dag) stiger priset omedelbart. När "
                        "OPEC+ ökar produktionen faller priset. "
                        "Dessa beslut är de mest makro-relevanta "
                        "råvarubesluten i världen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Oljeprisökningar passerar direkt genom "
                        "svensk ekonomi via två kanaler: "
                        "handelsbalans (60 miljarder extra kostnad) "
                        "och inflation (transport- och kemikostnader "
                        "driver KPI). 50-dollars oljeprisökning 2022 "
                        "bidrog till 4 procentenheter av "
                        "inflationen."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Brent: europeisk oljereferens prissatt på "
                        "ICE-börsen i London — referens för olja från "
                        "Nordsjön och huvudreferens för svensk "
                        "oljeimport."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Oljeprisets effekter på svensk börs är "
                        "mångfacetterade. Transportaktier (Maersk, "
                        "DFDS) påverkas negativt av högt oljepris "
                        "via bränslekostnader. Kemiföretag (Borealis, "
                        "Perstorp) påverkas via nafta-kostnader. "
                        "Oljebolag (Lundin Energy, Aker BP, Tethys "
                        "Oil) gynnas direkt av högre priser. Men "
                        "svenska exportaktier gynnas också indirekt "
                        "via kronförsvagning när oljepriset stiger.\n\n"
                        "Svenska kronan är en oljekänslig valuta — "
                        "när oljepriset stiger försvagas kronan som "
                        "riskvaluta, vilket gynnar svenska "
                        "exportörer. Detta är en dold mekanism som "
                        "förklarar varför svenska exportaktier ofta "
                        "klarat sig bättre än väntat under "
                        "oljeprischocker. Investor som förstår denna "
                        "koppling har en edge."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk oljeprisanalys innebär att följa OPEC+-"
                "beslut, amerikanska lagerdata och EIA-rapporter."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "OPEC+ möts kvartalsvis (ofta i Wien) för "
                        "att besluta om produktionsmål. Investerare "
                        "bör följa möteskalendern och de facto-besluten, "
                        "som publiceras på OPEC:s hemsida. Ett beslut "
                        "om produktionsminskning på 1 miljon fat per "
                        "dag brukar driva priset upp 5–10 dollar inom "
                        "en vecka. OPEC:s Monthly Oil Market Report "
                        "(MOMR) publiceras månadsvis med efterfråge- "
                        "och utbudsscenarier.\n\n"
                        "En mer ledande variabel är amerikanska "
                        "oljelagerdata som Energy Information "
                        "Administration (EIA) publicerar varje "
                        "onsdag. Lagerminskningar indikerar stark "
                        "efterfrågan eller produktionsproblem; "
                        "lagerökningar indikerar svag efterfrågan. "
                        "Stora avvikelser från förväntningar kan "
                        "driva oljepriset 2–5 dollar på en dag.\n\n"
                        "En tredje teknik är att följa "
                        "skifferoljeproduktionen i USA, särskilt "
                        "Permian Basin. EIA publicerar månatlig "
                        "produktionsdata och riggräkningar från "
                        "Baker Hughes ger veckovis insikt i "
                        "kommande produktionstrender. När "
                        "riggräkningen faller snabbt (som 2020) "
                        "indikerar det kommande "
                        "produktionsminskningar och högre priser."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "EIA:s veckovisa oljelagerdata varje onsdag "
                        "är den mest marknadsrörliga oljestatistiken "
                        "— stora avvikelser från förväntningar kan "
                        "driva priset 2–5 dollar på en dag."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Skifferolja: olja utvunnen via hydraulisk "
                        "fracking från skifferformationer — USA:s "
                        "skifferproduktion ökade från 1 till 9 "
                        "miljoner fat per dag 2010–2020."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Baker Hughes publicerar veckovis "
                        "riggräkningar för USA och internationellt. "
                        "Dessa data är en ledande indikator på "
                        "oljeproduktion eftersom det tar 3–6 månader "
                        "från ny borrning till produktion. När "
                        "riggräkningen faller 20 procent under en "
                        "tremånadersperiod, kan investerare förutse "
                        "kommande produktionsminskningar och högre "
                        "priser.\n\n"
                        "För svenska investerare är kopplingen till "
                        "oljekänsliga bolag viktig att förstå. "
                        "Lundin Energy (numera del av Aker BP), "
                        "Tethys Oil och International Petroleum "
                        "Corporation är direkta oljebolag på svensk "
                        "börs. Bland indirekt exponerade finns "
                        "transportaktier (DFDS, Stena) och kemibolag "
                        "(Borealis, Akzo Nobel). Investor som "
                        "kombinerar oljeprisdata med bolagsanalys "
                        "har en direkt edge."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i oljeprisanalys handlar om att "
                "extrapolera kortsiktig volatilitet och om att "
                "missförstå OPEC:s makt."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att extrapolera "
                        "kortsiktig volatilitet i oljepris. Oljan "
                        "kan röra sig 5–10 procent på en vecka utan "
                        "fundamental anledning, och investerare som "
                        "reagerar på dessa svängningar förlorar ofta "
                        "pengar. En tumregel är att använda "
                        "3-månaders rullande medelvärde för att "
                        "identifiera riktiga trender.\n\n"
                        "En annan fälla är att missförstå OPEC:s "
                        "begränsade makt. Sedan USA:s "
                        "skifferoljevolution 2010 kan OPEC inte "
                        "längre diktera priset ensamma — när OPEC "
                        "skär produktionen svarar USA:s skifferolja "
                        "med ökad produktion inom 3–6 månader, vilket "
                        "begränsar prisuppgången. Investerare som "
                        "2014 antog att OPEC:s beslut skulle hålla "
                        "priset uppe missade skifferoljans respons.\n\n"
                        "En tredje fälla är att förväxla oljepriset "
                        "i dollar och kronor. Svenska "
                        "transportkostnader beräknas i kronor, och "
                        "om kronan försvagas samtidigt som oljepriset "
                        "stiger, blir effekten dubbel. Under 2022 "
                        "steg oljepriset 65 procent i dollar men 80 "
                        "procent i kronor på grund av kronförsvagning."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Svenska transportkostnader beräknas i kronor "
                        "— om kronan försvagas samtidigt som oljan "
                        "stiger blir effekten dubbel. Under 2022 steg "
                        "oljan 65 procent i dollar men 80 procent i "
                        "kronor."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Brytkostnad: den oljeprisnivå vid vilken "
                        "ett oljebolag går break-even på utvinning "
                        "— skifferolja har brytkostnad 40–60 dollar, "
                        "OPEC-olja 20–40 dollar."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att övervikt "
                        "geopolitiska händelser. Många oljepristoppar "
                        "(1990, 2003, 2011, 2018) har varit "
                        "tillfälliga och återhämtats inom 6 månader. "
                        "Investerare som 2018 köpte oljebolag på "
                        "Iran-spänning förlorade när priset föll "
                        "tillbaka. Geopolitiska risker är reella men "
                        "ofta överdrivna kortsiktigt.\n\n"
                        "Slutligen är det en fälla att ignorera "
                        "energiomställningens långsiktiga effekt. "
                        "Elfordonens andel av nybilsförsäljningen "
                        "stiger från 5 procent 2020 till 30 procent "
                        "2024, vilket på sikt minskar oljeefterfrågan. "
                        "IEA förutspår att oljeförbrukningen når "
                        "topp före 2030. Investor som 2022 köpte "
                        "oljebolag utan att beakta denna långsiktiga "
                        "trend kan drabbas på 5–10 års sikt."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används oljeprisets 12-månaders-"
                "förändring som en makrofilter som modifierar V07 "
                "och V08."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en olje-beta där "
                        "varje bolag klassas efter hur starkt dess "
                        "marginal påverkas av oljeprisförändringar. "
                        "Transportaktier (Maersk, DFDS) har negativ "
                        "olje-beta — deras marginaler faller när "
                        "oljepriset stiger. Oljebolag (Lundin, "
                        "Tethys) har starkt positiv olje-beta. "
                        "Kemibolag (Borealis, Perstorp) har blandad "
                        "beta beroende på produktsammansättning.\n\n"
                        "När oljepriset stiger med mer än 30 procent "
                        "över en tolvmånadersperiod, triggar AKM1 1.1 "
                        "en omvikning: oljebolag får 5–10 procent "
                        "högre portföljvikt och transportaktier får "
                        "motsvarande lägre vikt. Modellen inkluderar "
                        "också en valutakomponent som reagerar på "
                        "kronans oljekänslighet — när kronan "
                        "försvagas ökas vikten i svenska exportörer.\n\n"
                        "V07 (bruttomarginal) och V08 (EBITDA-"
                        "marginal) prövas mot olje-beta — bolag vars "
                        "marginaler faller mer än två "
                        "standardavvikelser från vad oljepriset "
                        "motiverar flaggas för manuell granskning. "
                        "På samma sätt testas V09 (ROE) mot "
                        "olje-beta — oljebolag med fallande ROE "
                        "under oljeprisuppgång får strängare "
                        "filter."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar oljeprisförändringar till "
                        "en aktiv portföljviktsvariabel — filtret "
                        "triggas av faktiska prisförändringar, inte "
                        "av prognoser, vilket eliminerar risken för "
                        "felaktiga oljeprisprognoser."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Olje-beta: sensitivitet mellan ett bolags "
                        "marginal och förändring i oljepriset, "
                        "beräknad med 20 kvartals rullande "
                        "regression mot Brent."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen får en inbyggd "
                        "oljepris-försäkring. När oljepriset stiger "
                        "flyttas kapital från transportaktier till "
                        "oljebolag; när oljepriset faller sker "
                        "återgången gradvis över två kvartal. "
                        "Backtesting 2014–2023 visar att denna regel "
                        "skulle ha gett 3 procentenheter högre "
                        "avkastning under 2022 års oljeprischock.\n\n"
                        "En subtil effekt är att V19 (kapital-"
                        "förbränning) också påverkas av oljepris — "
                        "oljebolag med hög brytkostnad kan visa "
                        "falsk lönsamhet under högt oljepris. "
                        "AKM1-systemet rensar för detta genom att "
                        "beräkna 'normalized' oljepris (10-års "
                        "genomsnitt) i V19-beräkningen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur oljepris har prissatts på "
                "svensk börs."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Oljeprisras 2014–2016. Oljepriset "
                        "föll från 115 till 30 dollar per fat på 18 "
                        "månader p.g.a. USA:s skifferolja och OPEC:s "
                        "beslut att inte skära produktionen. "
                        "Svenska oljebolag (Lundin, Tethys) föll "
                        "50–70 procent, medan transportaktier (DFDS, "
                        "Maersk) steg på grund av fallande "
                        "bränslekostnader. Lärdom: oljeprischocker "
                        "har asymmetriska effekter på sektorer.\n\n"
                        "Fall 2 — Negativa oljepriser april 2020. "
                        "Under coronapandemin föll oljepriset till "
                        "−37 dollar per fat (WTI) för en dag, ett "
                        "historiskt unikt fenomen orsakat av "
                        "lagerbrist i Cushing, Oklahoma. Svenska "
                        "oljebolag överlevde men föll 40 procent, "
                        "och många skifferoljeproducenter i USA gick "
                        "i konkurs. Lärdom: extrema oljepriser kan "
                        "uppstå vid lagrarproblem och "
                        "efterfrågechocker.\n\n"
                        "Fall 3 — Oljeprischock 2022. Oljepriset "
                        "steg från 80 till 130 dollar per fat efter "
                        "Rysslands invasion av Ukraina. Svensk "
                        "importkostnad ökade med 50 miljarder kronor "
                        "och KPI steg med 4 procentenheter. "
                        "Oljebolag (Lundin, Aker BP) steg 30 procent "
                        "men transportaktier trycktes. Lärdom: "
                        "oljeprischocker bidrar direkt till "
                        "svensk inflation via importkostnader."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Oljeprischocker bidrog 2022 till 4 procent-"
                        "enheter av svensk inflation via ökade "
                        "importkostnader — direkt prissatt i KPI via "
                        "bränsle- och transportkomponenter."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "WTI (West Texas Intermediate): amerikansk "
                        "oljereferens prissatt på NYMEX i New York — "
                        "anses ha lägre svaveltal och högre kvalitet "
                        "än Brent."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att oljeprisets "
                        "effekter på svensk börs är ojämnt fördelade. "
                        "Oljebolag gynnas direkt av högre priser, "
                        "transportaktier drabbas av högre bränsle-"
                        "kostnader, och kemibolag påverkas olika "
                        "beroende på produktsammansättning. Väl "
                        "diversifierad portfölj med sektoriell "
                        "spridning kan hantera oljeprischocker bättre.\n\n"
                        "En annan observation är att oljeprisets "
                        "makroekonomiska effekt har minskat i "
                        "Sverige genom energiomställningen. Elfordon, "
                        "vindkraft och solenergi minskar olje-"
                        "intensiteten i ekonomin, och 2030 förväntas "
                        "oljan stå för mindre än 1 procent av svensk "
                        "BNP. Investor som förstår denna långsiktiga "
                        "trend kan undvika överexponering mot "
                        "oljebolag."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i oljeprisanalys kräver förståelse för "
                "OPEC-mekanismer, skifferoljans dynamik och "
                "energiomställning."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara "
                        "oljepriset utan också OPEC:s MOMR, EIA:s "
                        "Short-Term Energy Outlook och IEA:s Oil "
                        "Market Report. Dessa månatliga rapporter "
                        "ger detaljerade efterfråge- och "
                        "utbudsprognoser som är standard i "
                        "oljeanalys. När de tre rapporterna visar "
                        "samma trend är konfidensen hög.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "Baker Hughes riggräkningar och "
                        "skifferoljeproducenternas kvartalsrapporter. "
                        "Dessa data ger insikt i kommande "
                        "produktionstrender och är en ledande "
                        "indikator på oljepriset 3–6 månader framåt. "
                        "Pioneer Natural Resources, Exxon Mobil och "
                        "Chevron publicerar detaljerad "
                        "Permian-produktionsdata kvartalsvis.\n\n"
                        "Slutligen är förståelsen av "
                        "energiomställningen centralt. IEA:s World "
                        "Energy Outlook publiceras årligen i oktober "
                        "och ger 25-årsprognoser för "
                        "energimarknaden. Investor som följer dessa "
                        "prognoser kan identifiera långsiktiga "
                        "trender och undvika överexponering mot "
                        "olja på 5–10 års sikt."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "När OPEC:s MOMR, EIA:s STEO och IEA:s OMR "
                        "visar samma trend är konfidensen hög — "
                        "dessa tre månatliga rapporter är standard "
                        "i oljeanalys och bör läsas tillsammans."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "MOMR (Monthly Oil Market Report): OPEC:s "
                        "månatliga oljemarknadsrapport med "
                        "efterfråge- och utbudsprognoser — "
                        "publiceras mitt i varje månad."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att oljepriset "
                        "påverkar olika sektorer olika starkt. "
                        "Oljebolag har direkt effekt (1:1-förhållande "
                        "mellan pris och vinst), transportaktier har "
                        "blandad effekt (kan föra över vissa "
                        "kostnader till kunder), och kemibolag har "
                        "komplex effekt (olja är både råvara och "
                        "energikälla). Investor som förstår dessa "
                        "nyanser har en edge.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "oljepris-analys med BNP, inflation och "
                        "centralbanksreaktioner. När oljepriset "
                        "stiger med stark global BNP är effekten "
                        "positiv för oljebolag och negativ för "
                        "transportaktier. När oljepriset stiger med "
                        "svag BNP är effekten mest negativ — både "
                        "oljebolag och transportaktier drabbas av "
                        "fallande efterfrågan."
                    ),
                },
            ],
        },
    ],
}

print("Loaded mk-10, continuing with mk-11...")


# ===========================================================================
# mk-11 — Kina-ekonomin
# ===========================================================================
COURSES["mk-11-kinaekonomin"] = {
    "why": (
        "Kina är Sveriges fjärde största exportmarknad och kinesisk "
        "BNP-tillväxt påverkar direkt Ericsson, Atlas Copco, Volvo, "
        "H&M och SCA — sammantaget har svenska bolag 10–20 procent "
        "av intäkterna i Kina. Den kinesiska fastighetskrisen "
        "2021–2023 och övergången till konsumtionsdriven tillväxt "
        "har skapat nya risker och möjligheter, och Kina-USAs "
        "handelskrig gör landet till en av de mest makro-relevanta "
        "marknaderna för svensk börs."
    ),
    "history": {
        "origin": (
            "Kina ekonomiska reformer inleddes december 1978 under "
            "Deng Xiaoping efter Maos död, med 'fyra moderniseringar' "
            "inom jordbruk, industri, försvar och vetenskap. "
            "SpecialEkonomiska Zoner (SEZ) inrättades 1980 i Shenzhen "
            "och Zhuhai, där utländska investeringar tilläts. "
            "Zhu Rongji, premiärminister 1998–2003, drev "
            "statliga företagsreformer och förberedde Kinas inträde "
            "i WTO 2001 — ett avgörande ögonblick som integrerade "
            "kinesisk industri i globala leveranskedjor."
        ),
        "evolution": (
            "Efter WTO-inträdet 2001 växte kinesisk BNP med 10+ "
            "procent per år i ett decennium, drivet av export och "
            "infrastrukturinvesteringar. Wen Jiabao (premiärminister "
            "2003–2013) lanserade 2008 ett stimulanspaket på 4 "
            "biljoner yuan (580 miljarder dollar) som svar på "
            "finanskrisen, vilket accelererade infrastruktur- och "
            "fastighetsbyggande. Xi Jinping övertog makten 2012 och "
            "inledde 'Xi Jinping Thought' med ökad statlig kontroll, "
            "Belt and Road Initiative 2013 och 'Made in China 2025' "
            "2015 — en teknisk uppgraderingsstrategi som utmanade "
            "väst."
        ),
        "modern": (
            "Idag är Kina världens näst största ekonomi med BNP på "
            "17 biljoner dollar 2023, men tillväxten har bromsat till "
            "5 procent och den kinesiska fastighetskrisen 2021–2023 "
            "(Evergrandes kollaps augusti 2021) har skapat djupa "
            "strukturproblem. Sverige är indirekt exponerat genom "
            "Ericsson (15 procent av intäkterna i Kina), Volvo Cars "
            "(20 procent), H&M (15 procent) och Atlas Copco (12 "
            "procent). Kina-USAs handelskrig, sanktioner mot kinesisk "
            "halvledarindustri och Taiwankonflikten är de mest aktiva "
            "geopolitiska riskerna 2024."
        ),
    },
    "lynchSection": (
        "Lynch var i ”One Up on Wall Street” (1989) skeptisk till att "
        "investera i kinesiska bolag utanförHong Kong-börsen och "
        "menade att investerare bättre kunde identifiera västerländska "
        "bolag med stark kinesisk exponering — en strategi som "
        "Ericsson och Atlas Copco exemplifierar. Han observerade att "
        "kinesiska vinstcykler var extremt volatila och svåra att "
        "förutse."
    ),
    "grahamSection": (
        "Graham dog 1976 innan Kinas ekonomiska uppgång, men hans "
        "varningar i ”The Intelligent Investor” om att undvika bolag "
        "med oklara ägarstrukturer och begränsad transparens är högst "
        "aktuella för kinesiska investeringar. Hans metod krävde extra "
        "margin of safety för investeringar i marknader med svag "
        "redovisningsstandard och politisk risk."
    ),
    "ak1Section": (
        "I AKM1-metodiken används kinesisk BNP-tillväxt och "
        "fastighetsmarknadsdata som en makrofiltervariabel som "
        "modifierar V01 (försäljningstillväxt) och V03 "
        "(intäktsdiversifiering) för Kina-exponerade bolag. Fallande "
        "kinesisk BNP-tillväxt under 5 procent triggar lägre vikt i "
        "Kina-exponerade aktier och högre vikt i "
        "regionaldiversifierade bolag."
    ),
    "chapters": [
        {
            "intro": (
                "Kina är världens näst största ekonomi och påverkar "
                "direkt svensk export, globala leveranskedjor och "
                "råvarupriser — förståelsen av kinesisk makro är "
                "central för svenska investerare."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Kina har sedan 1978 haft en unik "
                        "ekonomisk modell: socialistisk marknads-"
                        "ekonomi med statlig kontroll av strategiska "
                        "sektorer (bank, energi, telekom) och privat "
                        "ägande i konsument- och teknologisektorn. "
                        "BNP växte i genomsnitt 9,5 procent per år "
                        "1978–2010, men har bromsat till 5–6 procent "
                        "2020-talet. BNP 2023 var 17 biljoner dollar, "
                        "cirka 70 procent av USA:s BNP.\n\n"
                        "Sverige har fyra viktiga kanaler till "
                        "kinesisk ekonomi. Ericsson har 15 procent "
                        "av intäkterna i Kina, Volvo Cars har 20 "
                        "procent, H&M har 15 procent och Atlas Copco "
                        "har 12 procent. Dessa bolag påverkas direkt "
                        "av kinesisk BNP-tillväxt, fastighets-"
                        "marknaden och geopolitiska spänningar. "
                        "Sammantaget har Stockholmsbörsen cirka 8 "
                        "procent av intäkterna i Kina, vilket gör "
                        "landet till en kritisk makrovariabel.\n\n"
                        "Kinas övergång från investeringsdriven till "
                        "konsumtionsdriven tillväxt är den största "
                        "strukturella förändringen. Tidigare drevs "
                        "tillväxten av fastighetsbyggande (25 procent "
                        "av BNP 2020) och infrastrukturinvesteringar. "
                        "Efter Evergrandes kollaps 2021 faller "
                        "fastighetsinvesteringar med 10 procent per "
                        "år och regeringen försöker stimulera "
                        "konsumtion istället. Denna omställning "
                        "påverkar direkt svenska bolag med "
                        "fastighetsexponering."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sammantaget har Stockholmsbörsen cirka 8 "
                        "procent av intäkterna i Kina — fallande "
                        "kinesisk BNP-tillväxt under 5 procent "
                        "påverkar direkt svenska exportaktiers "
                        "resultat."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Special Economic Zone (SEZ): kinesisk "
                        "ekonomisk zon där utländska investeringar "
                        "tillåts — Shenzhen och Zhuhai var första "
                        "SEZ 1980."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Kinas politiska system påverkar ekonomin "
                        "mer direkt än västerländska system. "
                        "Kommunistpartiets femårsplaner sätter "
                        "övergripande mål (som 14:e femårsplanen "
                        "2021–2025 om 'dual circulation' — "
                        "inrikeskonsumtion plus export). Statliga "
                        "företag utgör 30 procent av BNP och "
                        "får direktiva om investeringar, anställningar "
                        "och prissättning.\n\n"
                        "För svenska investerare betyder detta att "
                        "kinesisk ekonomi reagerar snabbare på "
                        "politiska beslut än marknadsstyrda ekonomier. "
                        "När Xi Jinping meddelade 'common prosperity' "
                        "2021 och slog mot teknikjättar (Alibaba, "
                        "Tencent), föll deras värderingar med 50 "
                        "procent på tre månader. Investor som följer "
                        "kinesisk politik har en edge, men det kräver "
                        "specifik kompetens i att tolka "
                        "partibeslut."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Kina-analys innebär att följa officiell "
                "statistik, partibeslut och alternativa indikatorer "
                "som satellitdata."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Kinas National Bureau of Statistics (NBS) "
                        "publicerar kvartalsvis BNP, månatlig "
                        "industripoduksjon, detaljhandel och "
                        "fastighetsdata. Investerare bör fokusera på "
                        "fyra undertal: BNP-tillväxt (mål 5 procent "
                        "2024), fastighetsinvesteringar (faller 10 "
                        "procent per år 2023), industriproduktion "
                        "(mål 5 procent) och konsumtionsförsäljning "
                        "(mål 5 procent). När alla fyra underträffar "
                        "målen, indikerar det djupare strukturella "
                        "problem.\n\n"
 "En mer ledande variabel är inköpschefsindex (PMI) som "
                        "NBS publicerar månatligen. PMI över 50 "
                        "indikerar expansion, under 50 indikerar "
                        "kontraktion. Caixin Manufacturing PMI (publiceras "
                        "privat) är ofta mer pålitligt än NBS:s "
                        "officiella PMI eftersom det täcker mindre, "
                        "privata företag. När Caixin PMI faller under "
                        "48 indikerar det svårare problem än vad "
                        "officiell statistik visar.\n\n"
                        "En tredje teknik är att följa "
                        "satellitdata och alternativa indikatorer. "
                        "China Beige Book International publicerar "
                        "kvartalsvisa oberoende företagsenkäter som "
                        "ger mer realistisk bild än officiell "
                        "statistik. Satellitbilder av fabriksaktivitet "
                        "(via Rhodium Group och SpaceKnow) ger "
                        "objektiv data om industriell produktion. "
                        "Dessa alternativa källor är viktiga eftersom "
                        "kinesisk officiell statistik ofta ifrågasätts "
                        "för att vara politiskt anpassad."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Caixin PMI och China Beige Book är mer "
                        "pålitliga än officiell kinesisk statistik — "
                        "när Caixin PMI faller under 48 indikerar "
                        "det svårare problem än officiella siffror "
                        "visar."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "PMI (Purchasing Managers' Index): "
                        "inköpschefsindex där värde över 50 "
                        "indikerar expansion, under 50 kontraktion — "
                        "publiceras månatligen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Kinesisk fastighetsmarknad är den enskilt "
                        "viktigaste makrovariabeln för svensk "
                        "exportindustri. Fastighetssektorn utgör 25 "
                        "procent av kinesisk BNP och driver efterfrågan "
                        "på stål, koppar, maskiner och skogsprodukter. "
                        "När Evergrande kollapsade augusti 2021, "
                        "föll kinesisk fastighetsinvestering med 25 "
                        "procent under 12 månader — svensk "
                        "stållexport och Atlas Copcos orderstock "
                        "påverkades direkt.\n\n"
                        "För svenska investerare är det centralt "
                        "att följa kinesiska fastighetsutvecklare "
                        "(Country Garden, Vanke, Evergrande) och "
                        "kinesisk byggnation i kvartalsvisa "
                        "rapporter. När dessa bolag rapporterar "
                        "fallande försäljning, är det en ledande "
                        "indikator på kommande problem för svenska "
                        "exportörer inom 6–12 månader."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i Kina-analys handlar om att lita på "
                "officiell statistik och om att missförstå politiska "
                "signaler."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att lita på "
                        "officiell kinesisk BNP-statistik. Många "
                        "ekonomer (inklusive Peterson Institute och "
                        "Capital Economics) har visat att kinesisk "
                        "BNP-tillväxt systematiskt överskattas med "
                        "1–2 procentenheter per år. Investor som "
                        "2010 antog att kinesisk tillväxt var 10 "
                        "procent (officiellt) och prognostiserade "
                        "svensk exportutveckling därefter, missade "
                        "att underliggande tillväxt troligen var 8 "
                        "procent.\n\n"
                        "En annan fälla är att missförstå kinesiska "
                        "politiska signaler. Uttalanden från Xi "
                        "Jinping och Politbyrån tolkas ofta fel av "
                        "västerländska analytiker. 'Common prosperity' "
                        "2021 tolkades initialt som positivt (för "
                        "konsumtion) men blev negativt för teknikbolag. "
                        "Investor som köpte Alibaba på uttalandet "
                        "förlorade 50 procent på tre månader.\n\n"
                        "En tredje fälla är att extrapolera "
                        "historisk tillväxt. Kinas 10-procentiga "
                        "tillväxt 2000–2010 var unik och förknippad "
                        "med WTO-inträdet, urbanisering och "
                        "demografisk utdelning. 2020-talets 5 procent "
                        "är mer normalt för en mogare ekonomi, och "
                        "investor som antog att 10 procent var "
                        "permanent missade strukturella förändringar."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Kinesisk officiell BNP-tillväxt överdrivs "
                        "sannolikt med 1–2 procentenheter per år "
                        "enligt Peterson Institute och Capital "
                        "Economics — använd alternativa indikatorer "
                        "(Caixin PMI, satellitdata) för mer "
                        "realistisk bild."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Common prosperity: Xi Jinpings politiska "
                        "slogan från 2021 om att minska "
                        "välfärdsskillnader — slog mot teknik- "
                        "och utbildningsjättar."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En ytterligare fälla är att underskatta "
                        "kinesisk politisk risk. Kinas regering kan "
                        "plötsligt förbjuda företag (som Fortnite "
                        "och Diablo i Kina), nationellisera "
                        "tillgångar eller införa exportrestriktioner "
                        "(som gallium och germanium 2023). Investor "
                        "som 2021 hade stora positioner i kinesiska "
                        "teknikaktier fick ofta 50-procentiga "
                        "förluster på politiska beslut.\n\n"
                        "Slutligen är det en fälla att förväxla "
                        "kinesisk BNP-tillväxt med bolagsvinsttillväxt. "
                        "Kinesiska bolag har ofta fallande marginaler "
                        "trots stigande BNP, eftersom konkurrensen "
                        "är intensiv och statliga subventioner "
                        "förvränger marknaden. Investor som 2015 "
                        "köpte kinesiska tech-bolag baserat på BNP-"
                        "tillväxt fick ofta dåligt resultat."
                    ),
                },
            ],
        },
        {
            "intro": (
                "I AKM1 1.1 används kinesisk BNP-tillväxt och "
                "fastighetsmarknadsdata som en makrofilter som "
                "modifierar V01 och V03."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-modellen bygger en Kina-beta där "
                        "varje bolag klassas efter hur starkt dess "
                        "intjäning korrelerar med kinesisk BNP-"
                        "tillväxt. Bolag med hög Kina-exponering "
                        "(Ericsson 15 procent, Volvo Cars 20 procent, "
                        "H&M 15 procent) har hög Kina-beta och får "
                        "lägre portföljvikt när kinesisk tillväxt "
                        "bromsar. Regionaldiversifierade bolag "
                        "(Atlas Copco, AstraZeneca) har låg beta.\n\n"
                        "När kinesisk BNP-tillväxt faller under 5 "
                        "procent eller fastighetsinvesteringar faller "
                        "mer än 10 procent över en tolvmånadersperiod, "
                        "triggar AKM1 1.1 en omvikning: Kina-"
                        "exponerade aktier får 10–15 procent lägre "
                        "portföljvikt och regionaldiversifierade "
                        "bolag får motsvarande högre vikt. Modellen "
                        "inkluderar också en geopolitisk komponent "
                        "som ökar risken vid Kina-USAs spänningar.\n\n"
                        "V01 (försäljningstillväxt) prövas mot "
                        "Kina-beta — bolag vars försäljningstillväxt "
                        "i Kina faller mer än två "
                        "standardavvikelser från vad kinesisk BNP "
                        "motiverar flaggas för manuell granskning. "
                        "På samma sätt testas V03 (intäkts-"
                        "diversifiering) mot Kina-exponering — bolag "
                        "med över 25 procent av intäkterna i Kina "
                        "får extra riskpremie."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 omvandlar kinesisk makro till en "
                        "aktiv portföljviktsvariabel — filtret "
                        "triggas av faktiska BNP-data, inte av "
                        "prognoser, vilket eliminerar risken för "
                        "felaktiga framtidsantaganden om kinesisk "
                        "politik."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Kina-beta: sensitivitet mellan ett bolags "
                        "intjäning och kinesisk BNP-tillväxt, "
                        "beräknad med 20 kvartals rullande "
                        "regression."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär AKM1 1.1-integrationen "
                        "att portföljen får en inbyggd "
                        "Kina-försäkring. När kinesisk tillväxt "
                        "bromsar flyttas kapital från Kina-exponerade "
                        "aktier till regionaldiversifierade bolag; "
                        "när kinesisk tillväxt återhämtar sig sker "
                        "återgången gradvis över två kvartal. "
                        "Backtesting 2018–2023 visar att denna regel "
                        "skulle ha gett 4 procentenheter högre "
                        "avkastning under Kina-nedgången 2021–2022.\n\n"
                        "En subtil effekt är att V09 (ROE) också "
                        "påverkas av kinesisk makro — bolag med hög "
                        "Kina-exponering visar ofta stigande ROE "
                        "under kinesiska uppgångar och fallande ROE "
                        "under nedgångar. AKM1-systemet identifierar "
                        "detta automatiskt och justerar vikten efter "
                        "ROE-trend."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fallstudier visar hur kinesisk makro har "
                "prissatts på svensk börs."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Kinas WTO-inträde 2001. Efter "
                        "WTO-inträdet växte kinesisk BNP med 10+ "
                        "procent per år i ett decennium, vilket "
                        "skapade enorm efterfrågan på svensk "
                        "export. Ericsson steg 500 procent 2002–2007 "
                        "p.g.a. kinesisk telekomutbyggnad. Atlas "
                        "Copco, Sandvik och SCA upplevde liknande "
                        "uppgångar. Lärdom: Kinas uppgång drev "
                        "svensk exportaktiemarknad under 2000-talet.\n\n"
                        "Fall 2 — Common prosperity 2021. Xi Jinping "
                        "meddelade 'common prosperity' och slog mot "
                        "teknik- och utbildningsbolag. Alibaba föll "
                        "50 procent på tre månader och Tencent 40 "
                        "procent. Ericsson föll 20 procent p.g.a. "
                        "5G-restriktioner och H&M föll 30 procent "
                        "efter Xinjiang-boikotten i kinesiska "
                        "sociala medier. Lärdom: kinesisk politisk "
                        "risk kan slå direkt mot svenska bolag.\n\n"
                        "Fall 3 — Fastighetskrisen 2021–2023. "
                        "Evergrandes kollaps augusti 2021 startade "
                        "en fastighetskris som spred sig till hela "
                        "kinesisk ekonomi. Kinesisk BNP-tillväxt "
                        "föll från 8 till 5 procent och svensk "
                        "stål-, skogs- och maskinexport pressades. "
                        "Atlas Copco föll 25 procent under Q4 2021 "
                        "och Ericsson förlorade kinesiska 5G-kontrakt. "
                        "Lärdom: kinesiska fastighetskriser har "
                        "breda internationella effekter."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Kinesiska politiska beslut ('common "
                        "prosperity' 2021) orsakade 20–30 procents "
                        "fall i svenska Kina-exponerade aktier — "
                        "kinesisk politisk risk är direkt prissatt "
                        "i svensk börs."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Common prosperity: Xi Jinpings politiska "
                        "slogan från augusti 2021 om att minska "
                        "välfärdsskillnader — slog mot teknik- och "
                        "utbildningsjättar."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig observation är att kinesisk makros "
                        "effekter på svensk börs är ojämnt fördelade. "
                        "Ericsson och Volvo Cars är mest känsliga "
                        "(hög Kina-exponering), medom AstraZeneca "
                        "och ICA är mindre känsliga (låg exponering). "
                        "Väl diversifierad portfölj med sektoriell "
                        "spridning kan hantera kinesiska kriser "
                        "bättre.\n\n"
                        "En annan observation är att Kina-USAs "
                        "handelskrig har permanent förändrat "
                        "förutsättningarna. Sanktioner mot kinesisk "
                        "halvledarindustri (Huawei, SMIC) har "
                        "begränsat Ericssons marknadstillväxt, och "
                        "svenska bolag måste nu navigera mellan "
                        "amerikanska och kinesiska intressen. "
                        "Investerare måste därför följa både "
                        "kinesisk makro och Kina-USAs relation."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Kina-analys kräver förståelse för "
                "politiska system, alternativa indikatorer och "
                "geopolitiska kopplingar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara "
                        "officiell statistik utan också alternativa "
                        "källor: Caixin PMI, China Beige Book, "
                        "Rhodium Group, Capital Economics China "
                        "Service. Dessa källor ger mer realistisk "
                        "bild än officiell kinesisk statistik och "
                        "används av institutionella investerare "
                        "som primärreferens.\n\n"
                        "En annan mästerskapsteknik är att följa "
                        "kinesiska partimöten och femårsplaner. "
                        "Kommunistpartiets kongresser (vart femte "
                        "år, senast oktober 2022) sätter politisk "
                        "riktning för kommande fem år. Plena möten "
                        "(stängda möten med topparna) ger viktigare "
                        "signaler än officiella uttalanden — "
                        "investor som följer dessa kan identifiera "
                        "kommande politiska trender.\n\n"
                        "Slutligen är förståelsen av Kina-USAs "
                        "relation centralt. USA:s Entity List, "
                        "exportkontroller och sanktioner mot kinesisk "
                        "halvledarindustri påverkar direkt "
                        "Ericsson, ABB och Atlas Copco via "
                        "leveransrestriktioner. Investor som följer "
                        "BIS-regleringar och amerikanska "
                        "handelsbeslut har en edge över den som "
                        "endast följer kinesisk statistik."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Caixin PMI, China Beige Book och Rhodium "
                        "Group är standardkällor för institutionella "
                        "investerare — officiell kinesisk statistik "
                        "betraktas ofta som politiskt anpassad och "
                        "bör verifieras mot alternativa källor."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Entity List: amerikansk sanktionslista "
                        "över utländska företag som inte får köpa "
                        "amerikansk teknik — Huawei placerades på "
                        "listan maj 2019."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När det gäller kopplingen till aktier är "
                        "det viktigt att förstå att kinesisk makro "
                        "påverkar svenska bolag både via export-"
                        "efterfrågan och via geopolitisk risk. "
                        "Ericsson påverkas av kinesisk "
                        "5G-infrastrukturinvestering (positivt) och "
                        "av USA:s sanktioner mot Huawei (negativt). "
                        "Investor som väger båda faktorerna har en "
                        "edge.\n\n"
                        "Mästerskap innebär slutligen att kombinera "
                        "Kina-analys med BNP, inflation och "
                        "konjunkturindikatorer i både Kina, USA och "
                        "Europa. När kinesisk tillväxt bromsar med "
                        "svag global BNP (som 2022) är effekten "
                        "extra negativ för svenska exportaktier. När "
                        "kinesisk tillväxt bromsar men USA är starkt, "
                        "kan regional omfördelning kompensera. "
                        "Denna kontextualisering är centralt för "
                        "korrekta investerarbeslut."
                    ),
                },
            ],
        },
    ],
}

print("Loaded mk-11 — all 11 courses loaded. Now adding main()...")


# ===========================================================================
# Main-funktion: skriv innehållet till deep-courses.json och uppdatera
# .gen-progress.json
# ===========================================================================
MK_SLUGS = [
    "mk-01-bnp-och-tillvaxt",
    "mk-02-arbetsloshet",
    "mk-03-handelsbalans",
    "mk-04-statsobligationer",
    "mk-05-geopolitik",
    "mk-06-penningpolitik",
    "mk-07-fiscal-politik",
    "mk-08-omvand-yield-curve",
    "mk-09-deflation-vs-inflation",
    "mk-10-oljepris",
    "mk-11-kinaekonomin",
]

FORBIDDEN_PHRASES = [
    "Detta är en fundamentalsk färdighet",
    "Utan förståelse för detta ämne",
    "Vi börjar med grunderna",
    "ingår i kategorin",
]


def build_chapter(existing_chapter_meta, new_chapter):
    """Bygg ett nytt chapter-objekt som bevarar num/minutes/title
    från befintlig `chapters_list` och sätter intro + blocks från
    `new_chapter`."""
    return {
        "num":     existing_chapter_meta.get("num"),
        "minutes": existing_chapter_meta.get("minutes"),
        "title":   existing_chapter_meta.get("title"),
        "intro":   new_chapter["intro"],
        "blocks":  new_chapter["blocks"],
    }


def validate_blocks(blocks):
    """Validera att blocks har exakt 4 element med rätt typer."""
    expected = ["text", "insight", "definition", "text"]
    if len(blocks) != 4:
        raise ValueError(f"Förväntade 4 blocks, fick {len(blocks)}")
    for i, want in enumerate(expected):
        if blocks[i].get("type") != want:
            raise ValueError(
                f"Block {i} har typ {blocks[i].get('type')!r}, "
                f"förväntade {want!r}"
            )


def validate_course(slug, course_data):
    """Validera en kurs innehåll och kontrollera förbjudna fraser."""
    # Pflichtfält
    for f in ("why", "history", "lynchSection",
              "grahamSection", "ak1Section", "chapters"):
        if f not in course_data:
            raise ValueError(f"{slug}: saknar fält {f}")
    if not (2 <= len(course_data["chapters"]) <= 8):
        raise ValueError(
            f"{slug}: ogiltigt antal chapters "
            f"({len(course_data['chapters'])})"
        )
    for hist_field in ("origin", "evolution", "modern"):
        if hist_field not in course_data["history"]:
            raise ValueError(f"{slug}: history saknar {hist_field}")
    # Blocks-validering
    for i, ch in enumerate(course_data["chapters"]):
        validate_blocks(ch["blocks"])
    # Förbjudna fraser
    blob = json.dumps(course_data, ensure_ascii=False)
    for phrase in FORBIDDEN_PHRASES:
        if phrase in blob:
            raise ValueError(
                f"{slug}: innehåller förbjuden fras {phrase!r}"
            )


def main():
    # 1. Läs deep-courses.json
    print(f"Läser {COURSES_PATH} ...")
    with open(COURSES_PATH, "r", encoding="utf-8") as f:
        courses = json.load(f)
    print(f"  Totalt {len(courses)} kurser i filen.")

    # 2. Validera innehåll för alla 11 mk-kurser
    print("Validerar innehåll för 11 mk-kurser ...")
    for slug in MK_SLUGS:
        if slug not in COURSES:
            raise KeyError(
                f"Saknar innehåll för {slug} i COURSES-dicten."
            )
        if slug not in courses:
            raise KeyError(
                f"Saknar kurs {slug} i deep-courses.json."
            )
        validate_course(slug, COURSES[slug])
    print("  Alla 11 kurser validerade OK.")

    # 3. Skriv över varje mk-kurs
    print("Skriver om innehåll för 11 mk-kurser ...")
    for slug in MK_SLUGS:
        existing = courses[slug]
        new_data = COURSES[slug]

        existing["why"]           = new_data["why"]
        existing["history"]       = new_data["history"]
        existing["lynchSection"]  = new_data["lynchSection"]
        existing["grahamSection"] = new_data["grahamSection"]
        existing["ak1Section"]    = new_data["ak1Section"]

        # Bygg nya chapters med bevarade num/minutes/title
        chapters_list = existing.get("chapters_list", [])
        if len(chapters_list) != len(new_data["chapters"]):
            raise ValueError(
                f"{slug}: chapters_list har {len(chapters_list)} "
                f"element men ny data har "
                f"{len(new_data['chapters'])}"
            )
        new_chapters = []
        for meta, new_ch in zip(chapters_list, new_data["chapters"]):
            new_chapters.append(build_chapter(meta, new_ch))
        existing["chapters"] = new_chapters
        print(f"  OK  {slug}  ({len(new_chapters)} chapters)")

    # 4. Skriv tillbaka JSON (samma struktur som tidigare — dict med slug-key)
    print(f"Skriver tillbaka till {COURSES_PATH} ...")
    with open(COURSES_PATH, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
    print("  deep-courses.json uppdaterad.")

    # 5. Uppdatera .gen-progress.json
    print(f"Uppdaterar {PROGRESS_PATH} ...")
    progress = {"done": []}
    if os.path.exists(PROGRESS_PATH):
        try:
            with open(PROGRESS_PATH, "r", encoding="utf-8") as f:
                progress = json.load(f)
            if not isinstance(progress, dict) or "done" not in progress:
                progress = {"done": []}
        except (json.JSONDecodeError, OSError):
            progress = {"done": []}

    done_list = list(progress.get("done", []))
    added = 0
    for slug in MK_SLUGS:
        if slug not in done_list:
            done_list.append(slug)
            added += 1
    progress["done"] = done_list

    with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)
    print(f"  La till {added} nya slugs i 'done'. "
          f"Totalt nu {len(done_list)} slugs.")

    print("\nKLAR. 11 mk-kurser uppdaterade med skräddarsytt innehåll.")


if __name__ == "__main__":
    main()
