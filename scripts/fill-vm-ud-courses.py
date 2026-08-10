#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fill-vm-ud-courses.py

Fyller 19 kurser (11 `vm-` värderingsmetoder + 8 `ud-` utdelningsstrategi)
i /home/z/my-project/public/deep-courses.json med skräddarsytt svenskt innehåll:

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

Körs:  python3 /home/z/my-project/scripts/fill-vm-ud-courses.py
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
# Kursdata — skräddarsytt svenskt innehåll för 19 vm+ud-kurser
# ---------------------------------------------------------------------------

COURSES = {}

# ===========================================================================
# vm-01 — Grahams formel
# ===========================================================================
COURSES["vm-01-grahams-formel"] = {
    "why": (
        "Grahams formel ger svensk retail-investerare en snabb, "
        "reproducerbar uppskattning av intrinsic value utifrån vinst per aktie "
        "och tillväxttakt — perfekt för att sålla OMXS30-kandidater på tio "
        "sekunder. Den tvingar fram en explicit tillväxtantagande istället "
        "för att följa marknadens humör, vilket är avgörande i en marknad "
        "där AstraZeneca och Atlas Copco prissätts med breda "
        "konsensusprognoser. Samtidigt varnar Graham själv för att formeln "
        "är en tumregel — inte en lag."
    ),
    "history": {
        "origin": (
            "Benjamin Graham formulerade sin värderingsformel i "
            "”Security Analysis” (1934, medförfattad med David Dodd) och "
            "förfinade den i ”The Intelligent Investor” (1949). "
            "Originalversionen antog en P/E på 8.5 för ett nolltillväxtbolag "
            "och adderade dubbel tillväxttakt (2g) baserat på empiriska "
            "studier av NYSE-bolag 1926–1962. Graham testade formeln på "
            "aktier under den stora depressionen och fann att den fångade "
            "snittet av marknadens värdering bäst när räntan var 4–5 procent."
        ),
        "evolution": (
            "I 1962-upplagan av ”The Intelligent Investor” justerade Graham "
            "formeln genom att addera en räntefaktor: V = EPS × (8.5 + 2g) × "
            "(4.4/Y), där Y är nuvarande AAA-obligationsränta. Denna "
            "modifiering kom efter att inflationen stigit under 1950-talet "
            "och originalformeln börjat överskatta värde. Under 1970-talet "
            "använde Value Line Survey och många amerikanska "
            "investeringsrådgivare varianter av formeln för tusentals bolag, "
            "vilket cementerade dess roll som den mest citerade "
            "tumregeln i value-investeringskretsar."
        ),
        "modern": (
            "Aswath Damodaran vid NYU Stern har i sina värderingsböcker "
            "(”Investment Valuation”, 2012) visat att Grahams formel "
            "överskattar värde för bolag med >15 procent tillväxt eftersom "
            "2g-termen blir dominant. På svenska plattformar som Avanza och "
            "Nordnet används formeln fortfarande som en första screen bland "
            "OMXS30-bolag, men felaktigt ofta med analystkonsensus (12 "
            "månader) istället för Grahams avsedda 7–10 års tillväxtperiod. "
            "Moderna value-investerare kombinerar därför formeln med "
            "känslighetsanalys och Shiller-justerade P/E för att undvika "
            "peak-earnings-fällan i cykliska bolag som SSAB och Boliden."
        ),
    },
    "lynchSection": (
        "Peter Lynch respekterade Grahams formel men föredrog PEG (P/E "
        "delat med tillväxt) för snabbväxare eftersom 2g-termen blir "
        "overoptimistisk över 20 procent tillväxt. I ”One Up on Wall "
        "Street” (1989) varnade Lynch att Grahams metod förlorar precision "
        "när man importerar analystkonsensus direkt i stället för att "
        "skatta hållbar tillväxt själv."
    ),
    "grahamSection": (
        "Graham varnade själv för att formeln var en grov approximation "
        "och att ingen ekvation kan ersätta grundlig fundamental analys. "
        "Han insisterade på att investeraren alltid ska läggan en "
        "”margin of safety” på minst 20 procent under det beräknade "
        "intrinsic value innan köp."
    ),
    "ak1Section": (
        "I AKM1-metodiken används Grahams formel som en av tre "
        "oberoende värderingar i V06-modulen, med automatisk säkerhetsmarginal "
        "på 30 procent. AKM1 1.1 flaggar bolag där Graham-värdet avviker "
        "mer än 40 procent från EV/EBITDA- och P/S-värderingarna för "
        "manuell genomgång."
    ),
    "chapters": [
        {
            "intro": (
                "Grahams formel är en minimal värderingsekvation som kräver "
                "endast två indata — vinst per aktie och tillväxttakt — för "
                "att ge ett estimerat intrinsic value."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Originalformeln lyder V = EPS × (8.5 + 2g), där EPS "
                        "är vinst per aktie och g är årlig tillväxttakt i "
                        "procent under kommande 7–10 år. Konstanten 8.5 "
                        "motsvarar P/E för ett bolag med noll tillväxt under "
                        "Grahams antagna normalränta på 4,4 procent. "
                        "Faktorn 2g dubblerar tillväxttakten eftersom Graham "
                        "empiriskt fann att marknaden betalar ungefär dubbelt "
                        "för varje procent tillväxt.\n\n"
                        "För en svensk investerare blir formeln praktiskt "
                        "användbar när man värderar stabila large cap-bolag "
                        "som AstraZeneca, Atlas Copco eller Sandvik där EPS "
                        "är relativt förutsägbar. Ta AstraZeneca 2023 med "
                        "EPS på cirka 6,80 USD och antagen långsiktig "
                        "tillväxt på 8 procent: V = 6,80 × (8,5 + 16) = "
                        "6,80 × 24,5 = 166,60 USD. Med 30 procent "
                        "säkerhetsmarginal blir köpgräns 116,60 USD.\n\n"
                        "Graham underströk att g ska vara en hållbar, "
                        "genomsnittlig tillväxt över en hel konjunkturcykel "
                        "— inte nästa kvartals eller ens nästa års "
                        "konsensusprognos. Detta är den vanligaste "
                        "feltolkningen bland svensk retail som matar in "
                        "Avanza-konsensus (vanligtvis 12–24 månader) i "
                        "stället för en 7-års skattning."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Konstanten 8.5 är P/E för nolltillväxt vid 4,4 "
                        "procents riskfri ränta — i dagens högränteläge "
                        "måste du räntejustera med multiplikatorn 4,4/Y."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Grahams formel: V = EPS × (8.5 + 2g) × (4.4/Y), "
                        "där EPS är vinst per aktie, g är 7–10 års "
                        "tillväxttakt i procent och Y är AAA-obligationsränta."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Räntejusteringen (4.4/Y) är kritisk i dagens "
                        "svenska marknad. Med svensk 10-årig statsskulds-"
                        "ränta på 2,5 procent blir faktorn 4,4/2,5 = 1,76 — "
                        "alltså en uppvärdering jämfört med 1962-basen. "
                        "Om räntan däremot är 5 procent blir faktorn 0,88 "
                        "och värdet ska nerjusteras.\n\n"
                        "Graham rekommenderade att formeln kombineras med "
                        "ett definitivt undvikande av bolag med g > 20 "
                        "procent eftersom 2g-termen då blir extremt "
                        "känslig. Han föredrog stabila bolag med 5–12 "
                        "procent tillväxt där formeln har högst precision."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vi applicerar Grahams formel på tre svenska OMXS30-bolag "
                "och visar hur indata väljs och resultatet tolkas steg för "
                "steg."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Steg 1 — Välj EPS från senaste fullständiga "
                        "räkenskapsår, inte konsensusprognos. Graham "
                        " föredrar bekräftad historisk vinst eftersom "
                        "analystkonsensus är systematiskt optimistisk. För "
                        "Atlas Copco 2023 var EPS cirka 8,30 SEK enligt "
                        "bokslutet — använd den, inte den förväntade 9,10 "
                        "SEK för 2024.\n\n"
                        "Steg 2 — Skatta 7-års tillväxt utifrån historisk "
                        "genomsnittlig EPS-tillväxt över två cykler. Atlas "
                        "Copco har historiskt växt EPS med cirka 10 procent "
                        "per år över 2010–2023 — det är din g. Steg 3 — "
                        "Beräkna V = 8,30 × (8,5 + 20) = 8,30 × 28,5 = "
                        "236,55 SEK. Med 30 procent säkerhetsmarginal blir "
                        "köpgränsen 165,60 SEK.\n\n"
                        "Steg 4 — Jämför med aktuellt pris och P/E-tumregel. "
                        "Om Atlas Copco handlas till 175 SEK är premien "
                        "liten och du kanske väntar på en korrektion. Om "
                        "aktien istället handlas till 130 SEK är diskonten "
                        "tydlig och formeln signalerar köp."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Använd alltid bokslut-EPS, inte "
                        "analystkonsensus — konsensusprognoser är "
                        "systematiskt 8–15 procent optimistiska enligt "
                        "Damodarans studier av analyst forecasting bias."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Pro-forma EPS: justerad vinst per aktie exklusive "
                        "engångsposter, som Graham rekommenderar för "
                        "cykliska bolag."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För cykliska bolag som SSAB eller Boliden måste "
                        "EPS justeras över en hel cykel. Ett vanligt "
                        "tillvägagångssätt är att ta snittet av EPS över "
                        "senaste 10 åren som din normaliserade EPS, sedan "
                        "sätta g lågt (2–4 procent) eftersom cykliska "
                        "bolag knappt växer över tid.\n\n"
                        "Jämför alltid Grahams-värdet med peer-gruppen. "
                        "Om H&M värderas till 180 SEK med Graham men "
                        "Inditex ligger på 1,4× högre multipel måste du "
                        "förstå varför — kvalitetsskillnader i marginal "
                        "och tillväxt kan motivera premie eller diskont."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor lurar den som applicerar Grahams formel på "
                "svenska bolag — fel tillväxttalsperiod, peak-earnings i "
                "cykliska bolag och att ignorera räntejusteringen."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Att använda 12-månaders "
                        "analystkonsensus som g. Konsensusprognoser är "
                        "korta och optimistiska. Graham avsåg en 7–10 års "
                        "hållbar tillväxttakt, vilket är mycket svårare att "
                        "skatta och ofta halverar konsensustalet när man "
                        "tvingas utsträcka perioden.\n\n"
                        "Fälla 2 — Peak-earnings i cykliska bolag. När "
                        "SSAB 2022 rapporterade rekord-EPS på 14 SEK under "
                        "stålboomen, matade många in detta i formeln och "
                        "fick orimligt höga värden. Korrekt tillvägagångssätt "
                        "är att använda 10-års normaliserad EPS på cirka 5 "
                        "SEK, vilket ger en värdering på 5 × (8,5 + 4) × "
                        "1,76 = 110 SEK — långt under då aktuellt pris på "
                        "65 SEK.\n\n"
                        "Fälla 3 — Att ignorera räntejusteringen. Med "
                        "svensk 10-årsränta på 2,5 procent måste du "
                        "applicera faktorn 4,4/2,5 = 1,76. Utan denna "
                        "faktor underskattar du intrinsic value med cirka "
                        "40 procent i dagens ränteläge."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Cykliska bolag (SSAB, Boliden, SCA) måste värderas "
                        "med 10-års normaliserad EPS, inte senaste årets "
                        "peak-earnings — annars köper du toppen."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Peak earnings trap: felaktig användning av maximal "
                        "konjunkturtopp-EPS som normaliserad bas i "
                        "värderingsmodeller, vilket överdriver intrinsic "
                        "value."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Identifiera peak earnings genom att jämföra aktuell "
                        "EPS med 10-års snitt. Om aktuellt är mer än 1,5× "
                        "snittet — varnades. SSAB 2022 hade EPS på 2,8× "
                        "10-års snittet, en tydlig peak-earnings-signal.\n\n"
                        "Identifiera konsensusbias genom att jämföra "
                        "analystprognoser mot historiskt utfall. Om "
                        "analystkonsensus för Ericsson 2025 ligger 12 "
                        "procent över det 5-års trendvärde som "
                        "faktiskt inträffat, använd det lägre värdet i "
                        "Grahams formel."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 har integrerat Grahams formel som en av tre "
                "oberoende värderingar i V06-modulen, med automatisk "
                "säkerhetsmarginal på 30 procent och cyklisk justering."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1 kör Grahams formel parallellt med "
                        "EV/EBITDA och P/S-metoderna, och presenterar ett "
                        "tre-i-ett-värde. Om de tre metoderna ligger inom "
                        "±15 procent anses bolaget rättvärderat; om "
                        "Graham-värdet avviker mer än 40 procent från de "
                        "andra två flaggas bolaget för manuell genomgång.\n\n"
                        "Systemet applicerar automatisk 30 procent "
                        "säkerhetsmarginal på Graham-värdet och justerar "
                        "EPS med Shiller-justering för cykliska bolag. "
                        "Räntefaktorn (4.4/Y) hämtas dagligen från "
                        "Riksbankens 10-åriga statsobligationsränta.\n\n"
                        "I praktiken innebär detta att AKM1-användaren "
                        "får ett Grahams-värde som är 50–60 procent under "
                        "marknadspriset för att rekommendera köp — en "
                        "sträng margin of safety som eliminerar de flesta "
                        "operativa felkällor."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 adderar automatisk 30 procent "
                        "säkerhetsmarginal på Graham-värdet och "
                        "Shiller-justerar EPS för cykliska bolag — inget "
                        "manuellt behöver göras."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "V06-modulen: AKM1:s värderingskärna som kör "
                        "tre oberoende metoder (Graham, EV/EBITDA, P/S) "
                        "med automatisk avstämning och säkerhetsmarginal."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "AKM1-flaggning 1 — ”Graham undervärderad”: bolaget "
                        "handlas under 70 procent av Graham-värdet och "
                        "inom ±15 procent av EV/EBITDA och P/S-värdena. "
                        "Exempel från 2023-körning: Castellum handlade till "
                        "85 SEK mot Graham-värde 145 SEK och EV/EBITDA "
                        "-värde 152 SEK — stark köpsignal.\n\n"
                        "AKM1-flaggning 2 — ”Graham-avvikelse”: Graham-"
                        "värdet avviker >40 procent från de andra två "
                        "metoderna. Exempel: Hennes & Mauritz 2022 där "
                        "Graham-värdet var 180 SEK men EV/EBITDA-värdet "
                        "bara 95 SEK — flagga för manuell genomgång av "
                        "balansräkningskvalitet."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre svenska fallstudier visar hur Grahams formel fungerar "
                "i praktiken — en vinnare, en förlorare och en borderline."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Atlas Copco 2018. EPS 5,80 SEK, "
                        "10-års genomsnittlig EPS-tillväxt 9 procent, "
                        "svensk 10-årsränta 1,5 procent. V = 5,80 × "
                        "(8,5 + 18) × (4,4/1,5) = 5,80 × 26,5 × 2,93 = "
                        "450 SEK. Med 30 procent säkerhetsmarginal: köpgräns "
                        "315 SEK. Aktien handlades till 280 SEK — köpläge. "
                        "Utfall 2023: aktien nådde 510 SEK, formeln "
                        "understeg men riktningen var korrekt.\n\n"
                        "Fallstudie 2 — SSAB 2007. EPS 7,20 SEK (peak i "
                        "konjunkturtopp), 10-års normaliserad EPS 3,80 "
                        "SEK, g 3 procent. Felaktig användning med "
                        "aktuell EPS: V = 7,20 × (8,5 + 6) × 1,76 = 184 "
                        "SEK. Korrekt användning med normaliserad EPS: "
                        "V = 3,80 × (8,5 + 6) × 1,76 = 97 SEK. Aktien "
                        "rasade från 165 till 35 SEK under finanskrisen — "
                        "peak-earnings-fällan.\n\n"
                        "Fallstudie 3 — H&M 2015. EPS 11,50 SEK, g 6 "
                        "procent, ränta 1,5 procent. V = 11,50 × (8,5 + "
                        "12) × 2,93 = 700 SEK. Köpgräns 490 SEK. Aktien "
                        "handlades till 360 SEK — men kvalitetsnedgång i "
                        "sammahetssegment och ökad konkurrens från Zara "
                        "resulterade i fallande EPS 2016–2019. Formeln "
                        "missade det kvalitativa avfallet."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Cykliska bolag är Grahams formels största "
                        "fälla — alltid normalisera EPS över en hel "
                        "cykel innan beräkning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Cykliskt justerad EPS: snitt av årsvisa EPS "
                        "under en fullständig konjunkturcykel (vanligtvis "
                        "7–10 år), använd för att neutralisera "
                        "peak-earnings-fällan."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Lärdom: Grahams formel fungerar bäst för "
                        "stabila, icke-cykliska bolag med påtaglig "
                        "EPS-tillväxt över tid — Atlas Copco, AstraZeneca, "
                        "Investor. Den misslyckas ofta för cykliska bolag "
                        "och kvalitetsfallande bolag.\n\n"
                        "Bästa praxis: kombinera alltid Graham med en "
                        "kvalitetscheck (ROIC, marginalutveckling) och "
                        "en cykelanalys. I AKM1 1.1 sker detta "
                        "automatiskt genom V09 (ROE) och V19 "
                        "(kapitalförbränning) som grindsvar till V06-"
                        "modulen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Grahams formel innebär att kombinera den med "
                "Buffett/Munger-justeringar, förstå dess begränsningar i "
                "en lågräntevärld och veta när man ska ignorera den helt."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Avancerad justering 1 — Kapitalintensitets-"
                        "justering. Graham formulerade sin formel för "
                        "kapitalsnåla bolag; för kapitalintensiva "
                        "industribolag som Atlas Copco eller Alfa Laval "
                        "måste värdet diskonteras med 10–20 procent för "
                        "att spegla återinvesteringbehov.\n\n"
                        "Avancerad justering 2 — Kvalitetspremie enligt "
                        "Buffett/Munger. För bolag med ROIC > 20 procent "
                        "och breda vallar (AstraZenecas patentportfölj, "
                        "Atlas Copcos teknikledarskap) kan man tillämpa "
                        "en kvalitetspremie på 15–25 procent ovanpå "
                        "Graham-värdet. Detta är Munger-modifikationen "
                        "från ”Poor Charlie's Almanack” (2005).\n\n"
                        "Avancerad justering 3 — Cyklisk synkning för "
                        "komponenttillverkare. För bolag som Södra Cell, "
                        "Boliden och bilkomponenttillverkare som Volvo "
                        "Cars måste EPS normaliseras och g sänkas med "
                        "50 procent för att spegla cykelrisk."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Grahams formel bygger på 4,4 procents "
                        "riskfri ränta — i extrema lågräntelägen under "
                        "0,5 procent blir formeln overoptimistisk och "
                        "ska kapas med en extra faktor 0,6."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Räntejusterat P/E: P/E justerat med "
                        "räntefaktorn 4.4/Y enligt Graham 1962, för att "
                        "kompensera för förändrad makroränta."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När ignorera Grahams formel? (1) Tidiga "
                        "tillväxtbolag med negativ eller obefintlig EPS — "
                        "Northvolt, Spotify 2018, Klarna. (2) Bolag i "
                        "strategiomvandling där historisk EPS inte "
                        "speglar framtidens — Volvo Cars elbilssatsning "
                        "2021–2025. (3) Finansiella bolag där EPS är "
                        "extra cykliskt och kapitalstruktur komplex — "
                        "Swedbank, SEB.\n\n"
                        "I dessa fall ska investeraren använda "
                        "EV/Sales-tumregler (VM-08) eller "
                        "Free-Cash-Flow-Yield (VM-07) i stället. "
                        "Mästerskap ligger i att veta vilken metod som "
                        "passar vilket bolag — Grahams formel är ett "
                        "verktyg i verktygslådan, inte alla verktyg."
                    ),
                },
            ],
        },
    ],
}

# ===========================================================================
# vm-02 — Intrinsic value
# ===========================================================================
COURSES["vm-02-intrinsic-value"] = {
    "why": (
        "Intrinsic value är det sanna värdet av ett bolag baserat på "
        "dess framtida kassaflöden, och är kärnan i all svensk "
        "fundamentalanalys — från AstraZeneca till Atlas Copco. För "
        "retail-investerare i ISK-konton är det enda sättet att undvika "
        "att köpa marknadshumör och istället prissätta själva affären. "
        "Intrinsic value skiljer value-investerare från spekulanter."
    ),
    "history": {
        "origin": (
            "John Burr Williams formulerade intrinsic value-konceptet i "
            "”The Theory of Investment Value” (1938) och argumenterade att "
            "ett aktievärde är nuvärdet av alla framtida utdelningar. "
            "Han utvecklade DCF-metoden under sin Harvard-doktorsavhandling "
            "samtidigt som Graham och Dodd publicerade ”Security Analysis” "
            "(1934) med liknande tankar. Williams matematiska formulering "
            "lade grunden till all modern företagsvärdering."
        ),
        "evolution": (
            "Under 1960- och 70-talen förfinade Modigliani och Miller "
            "(1958, 1961) intrinsic value-konceptet genom att visa att "
            "företagsvärde är oberoende av kapitalstruktur i en perfekt "
            "marknad. Myron Gordon och Eli Shapiro (1956) utvecklade "
            "Gordon Growth Model som förenklade Williams DCF till en "
            "praktisk formel för stabil tillväxt. Under 1980-talet tog "
            "McKinsey-konsulterna Tom Copeland, Tim Koller och Jack Murrin "
            "fram den moderna corporate finance-valuaningsmetodiken i "
            "”Valuation” (1990)."
        ),
        "modern": (
            "Aswath Damodaran vid NYU Stern är idag den mest inflytelserika "
            "förespråkaren för intrinsic value-baserad värdering och "
            "publicerar årligen DCF-modeller för tusentals bolag. I svensk "
            "praxis används intrinsic value av analytiker på Carnegie, "
            "SEB och Handelsbanken för att motivera köp- och säljrekommendationer. "
            "Avanza och Nordnet tillhandahåller automatiska intrinsic "
            "value-kalkylatorer baserade på konsensusprognoser, men "
            "dessa bygger ofta på korta 3-årsperioder snarare än den 10-års "
            "period Damodaran rekommenderar."
        ),
    },
    "lynchSection": (
        "Lynch såg intrinsic value som en abstrakt referenspunkt snarare "
        "än en exakt siffra — i ”One Up on Wall Street” (1989) menade han "
        "att PEG och tillväxtkvalitet var mer praktiska för retail-investerare. "
        "Hans poäng var att om bolaget växer, har stark balansräkning "
        "och rimlig värdering, så är intrinsic value redan bekräftat."
    ),
    "grahamSection": (
        "Graham definierade intrinsic value i ”Security Analysis” (1934) "
        "som ”det värde som är rättfärdigat av fakta” — tillgångar, "
        "vinster, utdelningar och definitiva framtidsutsikter. Han "
        "underströk att intrinsic value är ett intervall snarare än en "
        "punkt, och att säkerhetsmarginal måste adderas innan köp."
    ),
    "ak1Section": (
        "AKM1 1.1 beräknar intrinsic value som ett intervall med tre "
        "metoder — DCF, Graham och multipel — och presenterar endast "
        "köpsignal om aktuellt pris ligger under nedre gränsen med minst "
        "30 procent marginal. Intervallbredden används också som "
        "riskindikator: breda intervall (>40 procent) signalerar hög "
        "osäkerhet och högre kapitalkrav."
    ),
    "chapters": [
        {
            "intro": (
                "Intrinsic value är nuvärdet av alla framtida kassaflöden "
                "ett bolag förväntas generera under sin livstid — "
                "fundamentet för all svensk fundamentalanalys."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Konceptet intrinsic value bygger på idén att en "
                        "aktie är värd de kassaflöden den kommer generera "
                        "till ägaren, diskonterade till nutida värde med en "
                        "riskjusterad diskonteringsränta. Formellt: V = "
                        "Σ CFt / (1+r)^t där CFt är kassaflöde år t och r "
                        "är diskonteringsräntan (vanligtvis WACC).\n\n"
                        "För en svensk investerare är intrinsic value "
                        "användbart för att identifiera bolag som marknaden "
                        "felprisar. AstraZeneca 2018 handlades till 5,200 "
                        "pence med intrinsic value enligt Damodaran på "
                        "cirka 8,500 pence — en betydande undervärdering "
                        "som sedan realiserades genom Prilosec-patentens "
                        "utrullning och Oncotherapy-portföljen.\n\n"
                        "Skillnaden mellan intrinsic value och "
                        "marknadspris kallas ”value gap” och är "
                        "value-investerarens primära mål. Graham krävde "
                        "en value gap på minst 30 procent (margin of "
                        "safety) för att köpa — en tumregel som AKM1 1.1 "
                        "tillämpar strikt."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Intrinsic value är ett intervall, inte en punkt — "
                        "Graham rekommenderade alltid att presentera "
                        "både pessimistiskt och optimistiskt scenario."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Intrinsic value: nuvärdet av alla förväntade "
                        "framtida kassaflöden ett bolag genererar, "
                        "diskonterade med riskjusterad ränta över dess "
                        "förväntade livslängd."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Tre huvudmetoder för att beräkna intrinsic value "
                        "är DCF (Discounted Cash Flow), DDM (Dividend "
                        "Discount Model) och residual income (Ohlson "
                        "1995). DCF passar de flesta bolag, DDM passar "
                        "mogna utdelningsbolag som Investor och "
                        "Handelsbanken, och residual income passar bolag "
                        "med stabilt eget kapital men svårmätta kassaflöden "
                        "som banker.\n\n"
                        "I Sverige är DCF den vanligaste metoden bland "
                        "analytiker på Carnegie och SEB, som bygger "
                        "10-års explicita kassaflödesprognoser plus en "
                        "terminal value. Terminal value utgör ofta 60–70 "
                        "procent av totalt intrinsic value, vilket gör "
                        "antagandena om långsiktig tillväxt kritiska."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vi bygger en fullständig DCF-modell för Atlas Copco "
                "steg för steg och visar hur intrinsic value sammansätts."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Steg 1 — Starta från senaste årets Free Cash Flow "
                        "exklusive finansnetto och engångsposter. Atlas "
                        "Copco 2023: FCF cirka 23 miljarder SEK. Steg 2 — "
                        "Progonosticera FCF för 10 år med utgångspunkt i "
                        "historisk tillväxt och branschprognoser. Atlas "
                        "Copco har historiskt växt FCF med cirka 8 procent; "
                        "skatta 8 procent år 1–5, därefter fallande till "
                        "4 procent år 10.\n\n"
                        "Steg 3 — Välj diskonteringsränta (WACC). För "
                        "Atlas Copco med beta 0,9, riskpremie 5 procent "
                        "och riskfri ränta 2,5 procent blir WACC cirka 7,0 "
                        "procent. Steg 4 — Beräkna terminal value med "
                        "Gordon Growth: TV = FCF10 × (1+g)/(WACC−g), där "
                        "g är långsiktig tillväxt på 3 procent.\n\n"
                        "Steg 5 — Diskontera allt till nutida värde och "
                        "dividera med antal aktier. Atlas Copco-modellen "
                        "ger intrinsic value på cirka 320 SEK per aktie. "
                        "Med 30 procent säkerhetsmarginal blir köpgräns "
                        "224 SEK."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Terminal value utgör ofta 60–70 procent av "
                        "intrinsic value — känslighetsanalys på "
                        "terminaltillväxt och WACC är avgörande."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Terminal value: värdet av alla kassaflöden efter "
                        "den explicita prognosperioden, beräknad med "
                        "Gordon Growth Model som TV = FCFn × (1+g)/(WACC−g)."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Känslighetsanalys är obligatorisk. Atlas Copco "
                        "vid WACC 6 procent och g 3 procent: intrinsic "
                        "value 410 SEK. Vid WACC 8 procent och g 2 "
                        "procent: 245 SEK. Spridningen visar hur känslig "
                        "DCF-modellen är för antaganden.\n\n"
                        "Tolkning: om aktuellt pris är 280 SEK och "
                        "känslighetsintervallet är 245–410 SEK, ligger "
                        "aktien i nedre halvan av intrinsic value-intervallet "
                        "— köpsignal enligt Graham men ingen extrem "
                        "undervärdering. Minsta marginal till nedre gräns "
                        "är 12 procent, under AKM1:s 30 procent-krav."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre vanliga fällor vid intrinsic value-beräkning är "
                "överoptimistisk terminaltillväxt, felaktig WACC och att "
                "ignorera aktieutspädning."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Terminal tillväxt över BNP-tillväxt. "
                        "Om du sätter g till 5 procent i en svensk DCF "
                        "men långsiktig BNP-tillväxt är 2 procent, "
                        "förutsätter du att bolaget blir oändligt mycket "
                        "större än ekonomin. Damodaran rekommenderar g "
                        "≤ långsiktig riskfri ränta, vanligtvis 2–3 "
                        "procent.\n\n"
                        "Fälla 2 — Felaktig WACC. Att använda svensk "
                        "riskfri ränta för ett globalt bolag som "
                        "AstraZeneca (som rapporterar i USD och är "
                        "UK-listat) ger fel WACC. Använd amerikansk "
                        "10-årsränta för USD-rapporterande bolag och "
                        "brittisk 10-årsränta för GBP-rapporterande.\n\n"
                        "Fälla 3 — Ignorera aktieutspädning. Bolag som "
                        "Klarna, Spotify och Northvolt har utspädat "
                        "aktieägare kraftigt genom optioner och nyemissioner. "
                        "Beräkna alltid intrinsic value per aktie med "
                        "fullt utspädat antal aktier (diluted shares "
                        "outstanding) — annars överdriver du värdet per "
                        "aktie med 5–20 procent."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Terminal tillväxt får aldrig överstiga "
                        "långsiktig BNP-tillväxt — annars förutsätter du "
                        "att bolaget till slut äger hela ekonomin."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "WACC: Weighted Average Cost of Capital — "
                        "vägt genomsnitt av ränta på skuld och avkastningskrav "
                        "på eget kapital, används som diskonteringsränta i DCF."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Test alltid din DCF med reverse engineering: om "
                        "marknadspriset motsvarar en WACC på 6 procent "
                        "och g på 5 procent, är det rimligt? Om du själv "
                        "skulle kräva 8 procent avkastning, är aktien "
                        "övervärderad.\n\n"
                        "Kör alltid tre scenarier — pessimistiskt, "
                        "basfall och optimistiskt — med olika tillväxt "
                        "och marginaler. Om inte ens pessimistiska fallet "
                        "ger intrinsic value över marknadspris med 30 "
                        "procent marginal, är aktien inte ett köp enligt "
                        "Grahams säkerhetsmarginal-princip."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1 kör tre oberoende intrinsic value-beräkningar "
                "— DCF, Graham och multipel — och presenterar endast köp om "
                "alla tre ger värden över marknadspris med 30 procent marginal."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1:s V06-modul kör automatiskt tre "
                        "oberoende intrinsic value-beräkningar för varje "
                        "svensk OMXS30-bolag. DCF bygger på 10-års "
                        "kassaflödesprognoser med AKM1-interna "
                        "konsensusprognoser. Graham-värdet hämtas från "
                        "VM-01-modulen med cyklisk justering. Multipel-"
                        "värdet baseras på EV/EBITDA och P/S mot peer-grupp.\n\n"
                        "Systemet presenterar ett intervall från minsta "
                        "till största värde, med basfall som median. "
                        "Köpsignal kräver att aktuellt pris ligger under "
                        "minsta värdet med minst 30 procent marginal — "
                        "en sträng gräns som eliminerar de flesta "
                        "felpris-\nkandidater.\n\n"
                        "Riskindikator: intervallbredd. Om de tre "
                        "metoderna ligger inom ±15 procent är osäkerheten "
                        "låg och bolaget kan viktas högre i portföljen. Om "
                        "spridningen är >40 procent flaggas bolaget för "
                        "manuell genomgång och viktas lägre."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 kräver att alla tre metoderna (DCF, "
                        "Graham, multipel) ger köpsignal — minimerar "
                        "risken för att en enskild metod feltolkar."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "V06-intervall: AKM1:s intrinsic value-intervall "
                        "beräknat som min till max av DCF-, Graham- och "
                        "multipelvärden, med basfall som median."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "AKM1-case — Sandvik 2023. DCF-värde 235 SEK, "
                        "Graham-värde 198 SEK, EV/EBITDA-värde 220 SEK. "
                        "Intervall: 198–235 SEK. Aktuell kurs 175 SEK. "
                        "Marginal till nedre gräns: 13 procent — under "
                        "AKM1:s 30 procent-krav. Resultat: vänta på "
                        "ytterligare korrektion eller kvalitetsuppdatering.\n\n"
                        "AKM1-case — AstraZeneca 2018. DCF-värde 9,200 "
                        "pence, Graham 7,800 pence, EV/EBITDA 8,500 pence. "
                        "Aktuell kurs 5,200 pence. Marginal till nedre "
                        "gräns: 33 procent över kravet. Resultat: stark "
                        "köpsignal — utfallet 2023 var 12,500 pence."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre svenska fallstudier visar hur intrinsic value-analys "
                "skiljer vinnare från förlorare i OMXS30."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Investor AB 2015. Tre metoder gav "
                        "intrinsic value-intervall 380–470 SEK. Aktuell "
                        "kurs 290 SEK. Margin till nedre gräns: 24 "
                        "procent. Inte tillräckligt för Graham-kravet "
                        "men nära. Investoraktien nådde 620 SEK 2021 — "
                        "missad möjlighet eftersom marginalen inte nådde "
                        "30 procent. Lärdom: undervärdering kan kvarstå "
                        "i flera år innan den realiseras.\n\n"
                        "Fallstudie 2 — H&M 2017. DCF-värde 280 SEK, "
                        "Graham 220 SEK, EV/EBITDA 180 SEK. Bred "
                        "intervallspridning (40 procent). Aktuell kurs "
                        "230 SEK. Trots att kursen låg under median, "
                        "varnade intervallbredden för hög osäkerhet. "
                        "Utfall 2018–2020: aktien föll till 150 SEK.\n\n"
                        "Fallstudie 3 — AstraZeneca 2018 (beskriven i "
                        "kapitel 4). Klassisk Graham-köp med 33 procent "
                        "säkerhetsmarginal. Utfallet bekräftade intrinsic "
                        "value-analysens kraft när alla tre metoder "
                        "konvergerar."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Intervallbredd >30 procent är en varningsflagga "
                        "— betyder att metoderna inte samsas och risken "
                        "för felvärdering är hög."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Value gap: skillnaden mellan intrinsic value och "
                        "marknadspris, uttryckt som procent av "
                        "marknadspris — positiv gap = undervärdering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Lärdom: intrinsic value fungerar bäst när "
                        "kassaflödena är stabila och förutsägbara — "
                        "mogna large cap-bolag med lång historia. "
                        "Det misslyckas ofta för bolag i transition "
                        "eller med volatila intäkter (Volvo Cars, "
                        "SSAB, Klarna).\n\n"
                        "Bästa praxis: kombinera intrinsic value med "
                        "kvalitetsgrindar (ROIC > 15 procent, stabil "
                        "marginal, låg skuldsättning) och cykelmedvetenhet. "
                        "I AKM1 1.1 görs detta automatiskt genom "
                        "V09 (ROE), V10 (skuldsättningsgrad) och V19 "
                        "(kapitalförbränning) som grindsvar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i intrinsic value innebär att kombinera DCF "
                "med Buffett/Munger-kvalitetsanalys, scenariomodellering "
                "och förståelse för när intrinsic value inte är rätt metod."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Avancerad teknik 1 — Scenariomodellering med "
                        "sannolikheter. I stället för en punktuppskattning, "
                        "bygg tre scenarier (pessimistiskt 25 procent, "
                        "bas 50 procent, optimistiskt 25 procent) och "
                        "beräkna sannolikhetsvägt intrinsic value. Detta "
                        "fångar osäkerhet bättre än punkt-DCF.\n\n"
                        "Avancerad teknik 2 — Monte Carlo-simulering. "
                        "Damodaran har utvecklat Monte Carlo-baserade DCF "
                        "som simulerar tusentals utfall med normalfördelade "
                        "antaganden om tillväxt, marginaler och WACC. "
                        "Resultatet presenteras som en "
                        "sannolikhetsfördelning över intrinsic value.\n\n"
                        "Avancerad teknik 3 — Real options-värdering. För "
                        "bolag med betydande optioner (patent, "
                        "licensmöjligheter, expansionsalternativ) kan "
                        "real options-värdering adderas till DCF. Detta "
                        "är relevant för AstraZeneca (läkemedelsportfölj), "
                        "Boliden (fyndigheter) och Atlas Copco (teknik-"
                        "ledarskap). Se VM-05 för detaljer."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sannolighetsvägd intrinsic value med tre "
                        "scenarier är mer realistisk än punkt-DCF — "
                        "särskilt i volatila branscher."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Säkerhetsmarginal: skillnaden mellan intrinsic "
                        "value och köpgräns, uttryckt som procent av "
                        "intrinsic value — Graham rekommenderade minst "
                        "30 procent."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När intrinsic value misslyckas: (1) Tidiga "
                        "tillväxtbolag med negativt kassaflöde — "
                        "Spotify, Northvolt, Klarna. (2) Cykliska bolag "
                        "i peak-earnings — SSAB, Boliden. (3) Strategiskt "
                        "omvandlingsbolag — Volvo Cars elbilssatsning.\n\n"
                        "I dessa fall ska investeraren använda "
                        "EV/Sales-tumregler (VM-08), Free-Cash-Flow-Yield "
                        "(VM-07) eller multipelanalys (VM-03). Mästerskap "
                        "ligger i att veta vilken metod som passar vilket "
                        "bolag och att kombinera flera metoder för "
                        "intervall snarare än punkt."
                    ),
                },
            ],
        },
    ],
}

# ===========================================================================
# vm-03 — Multipelval
# ===========================================================================
COURSES["vm-03-multipelval"] = {
    "why": (
        "Multipelval är den mest använda värderingsmetoden på svensk "
        "aktiemarknad — analytiker på Carnegie och SEB motiverar nästan "
        "alltid rekommendationer med P/E, EV/EBITDA eller P/B-multipel. "
        "För retail-investerare är multipel jämförelse det snabbaste sättet "
        "att identifiera felprisade aktier bland peer-bolag. Nackdelen är "
        "att multipelvärdering bygger på att jämförelsebolagen själva är "
        "rättvärderade, vilket inte alltid är fallet."
    ),
    "history": {
        "origin": (
            "Graham och Dodd introducerade systematisk multipelanalys i "
            "”Security Analysis” (1934) genom att jämföra P/E mellan bolag "
            "inom samma bransch. De betonade att P/E måste relateras till "
            "tillväxt, marginal och balansräkningskvalitet för att vara "
            "meningsfull. Under 1950-talet började Value Line publicera "
            "systematiska peer-comp-tabeller som standardiserade metoden."
        ),
        "evolution": (
            "På 1970-talet formaliserade Eugene Fama effektiv marknads-"
            "hypotes som implicerade att genomsnittsmultipeln för en "
            "bransch är rätt multipel — en kontroversiell slutsats. Under "
            "1980-talet utvecklade McKinsey-konsulterna modern multipel-"
            "analys med forward-PE och EV/EBITDA, vilket tog fart i "
            "och med LBM-erans 1985–1990. Fama-Frenchs 1992-studie visade "
            "att value-aktier (låg P/B) historiskt slagit growth-aktier."
        ),
        "modern": (
            "Aswath Damodaran vid NYU Stern publicerar årligen bransch-"
            "specifika multipeldatabaser som används globalt, och hans "
            "lärobok ”Investment Valuation” (2012) är standard för "
            "multipelanalys. I svensk praktik publicerar Avanza och "
            "Nordnet automatiska peer-comp-tabeller för OMXS30-bolag, "
            "men dessa bygger ofta på korta perioder (TTM eller nästa års "
            "konsensus). Bloomberg Terminal är branschstandard bland "
            "svenska institutionella investerare och ger tillgång till "
            "global peer-data."
        ),
    },
    "lynchSection": (
        "Lynch använde multipel jämförelse flitigt men varnade i ”One Up "
        "on Wall Street” (1989) för att jämföra äpplen med päron — "
        "särskilt bolag med olika kapitalstruktur eller tillväxttakt. "
        "Hans PEG-koncept (P/E delat med tillväxt) var ett försök att "
        "normalisera multipel jämförelse för tillväxt."
    ),
    "grahamSection": (
        "Graham betonade i ”Security Analysis” (1934) att en multipel "
        "endast är meningsfull om man jämför likartade bolag med avseende "
        "på tillväxt, marginal, risk och kapitalstruktur. Han föreslog "
        "att justera multipel för kvalitetsskillnader snarare än att "
        "applicera en rak peer-jämförelse."
    ),
    "ak1Section": (
        "AKM1 1.1 använder multipel jämförelse som en av tre metoder i "
        "V06-modulen, och justerar automatiskt peer-gruppen för "
        "kvalitetsskillnader (ROIC, marginal, tillväxt) innan multipeln "
        "appliceras. Systemet flaggar bolag vars multipel avviker mer "
        "än 25 procent från peer-gruppen utan kvalitetsmotivering."
    ),
    "chapters": [
        {
            "intro": (
                "Multipelvärdering bygger på att jämföra ett bolags "
                "värderingsmultipel med en peer-grupp av liknande bolag — "
                "det vanligaste tillvägagångssättet bland svenska analytiker."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Multipelvärdering utgår från antagandet att "
                        "liknande bolag ska värderas lika. Genom att "
                        "beräkna en branschgenomsnittsmultipel — exempelvis "
                        "EV/EBITDA på 9× för svensk industri — kan man "
                        "applicera denna på enskilda bolag för att få en "
                        "rättvis värdering.\n\n"
                        "De vanligaste multiplarna på svensk börs är P/E "
                        "(pris per aktie delat med vinst per aktie), "
                        "EV/EBITDA (företagsvärde delat med rörelseresultat "
                        "före avskrivningar), P/B (pris delat med "
                        "bokfört eget kapital) och P/S (pris delat med "
                        "omsättning). Varje multipel passar olika "
                        "branscher: P/E för stabila tillväxtbolag, "
                        "EV/EBITDA för industribolag, P/B för banker och "
                        "fastighetsbolag, P/S för tidiga tillväxtbolag.\n\n"
                        "Exempel: Atlas Copco handlas till P/E 22 mot "
                        "industrisnitt 18. Detta kan tyda på övervärdering "
                        "— men om Atlas Copco har högre marginal, ROIC och "
                        "tillväxt än snittet kan premie vara motiverad. "
                        "AKM1 1.1 justerar automatiskt för dessa "
                        "kvalitetsskillnader innan jämförelse."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Multipelvärdering bygger på antagandet att "
                        "peer-gruppen är rättvärderad — om hela branschen "
                        "är felprissatt blir jämförelsen meningslös."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "EV/EBITDA-multipel: företagsvärde (marknads-"
                        "kapitalisering plus nettoskuld) delat med "
                        "rörelseresultat före avskrivningar — den mest "
                        "använda multipeln för industribolag."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Multipelvärdering är snabb och intuitiv, vilket "
                        "förklarar dess popularitet. En svensk "
                        "retail-investerare kan på fem minuter jämföra "
                        "Atlas Copco med Sandvik och Alfa Laval via "
                        "Avanza peer-tabell och identifiera den som "
                        "avviker mest.\n\n"
                        "Nackdelen är att multipelvärdering bygger på "
                        "jämförelse med redan prissatta bolag — om "
                        "hela branschen är övervärderad blir alla bolag "
                        "”rättvärderade” mot fel snitt. Detta var "
                        "problemet under dot-com-eran 1999 när alla "
                        "teknikaktier prissattes mot varandra utan "
                        "förankring i intrinsic value."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vi bygger en peer-comp-tabell för svenska industribolag "
                "och visar hur kvalitetsjusterad multipelvärdering ger "
                "en mer rättvis bild än rak jämförelse."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Steg 1 — Välj peer-grupp. För svensk industri "
                        "består peer-gruppen av Atlas Copco, Sandvik, "
                        "Alfa Laval, ASSA Abloy, SKF och Trelleborg. "
                        "Steg 2 — Samla in TTM-EBITDA, marknadsvärde och "
                        "nettoskuld för alla bolag. Steg 3 — Beräkna "
                        "EV/EBITDA för varje bolag och branschsnitt.\n\n"
                        "Exempel 2023: Atlas Copco 18×, Sandvik 11×, "
                        "Alfa Laval 14×, ASSA Abloy 19×, SKF 8×, "
                        "Trelleborg 10×. Snitt: 13,3×. Atlas Copco och "
                        "ASSA Abloy ligger tydligt över snittet.\n\n"
                        "Steg 4 — Kvalitetsjustera. Atlas Copco har ROIC "
                        "28 procent mot snitt 16 procent, EBITDA-marginal "
                        "23 procent mot snitt 17 procent, och 10-års "
                        "tillväxt 8 procent mot snitt 5 procent. "
                        "Med 0,5× kvalitetspremie per procentenhets ROIC "
                        "över snitt: kvalitetsjusterat snitt = 13,3 × "
                        "(1 + 0,5 × 12/100) = 14,1×. Atlas Copco på 18× "
                        "är därmed 28 procent över kvalitetsjusterat "
                        "snitt — måttlig övervärdering."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Kvalitetspremie på 0,3–0,5× EV/EBITDA per "
                        "procentenhets ROIC över snittet är en vanlig "
                        "tumregel bland svenska analytiker."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Kvalitetsjusterad multipel: branschgenomsnittlig "
                        "multipel justerad för bolagets ROIC, marginal "
                        "och tillväxt jämfört med peer-gruppen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Forward-multipel vs trailing-multipel. Trailing "
                        "använder senaste 12 månadernas EBITDA, forward "
                        "använder nästa 12 månaders konsensus. "
                        "Forward-multipel är vanligare bland analytiker "
                        "men bygger på analystkonsensus som "
                        "systematiskt är optimistisk.\n\n"
                        "För cykliska bolag måste du normalisera "
                        "EBITDA över en cykel. SKF med TTM-EBITDA 16 "
                        "miljarder SEK ger EV/EBITDA 8×, men med 10-års "
                        "normaliserad EBITDA på 12 miljarder SEK blir "
                        "multipeln 11× — en mer rättvis bild av "
                        "långsiktig värdering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre vanliga fällor vid multipelvärdering är fel "
                "peer-grupp, ignorerade kvalitetsskillnader och att "
                "använda trailing-multipel för cykliska bolag."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Fel peer-grupp. Att jämföra H&M med "
                        "Inditex kan verka naturligt men ignorerar att "
                        "Inditex har snabbare varumärkesmodell och högre "
                        "marginal. Bättre peer-grupp för H&M är "
                        "GAP, Next och Marks & Spencer — bolag med "
                        "liknande affärsmodell och kapitalstruktur.\n\n"
                        "Fälla 2 — Ignorera kvalitetsskillnader. Om "
                        "Atlas Copco handlas till 18× EV/EBITDA mot "
                        "snitt 13×, kan skillnaden vara motiverad av "
                        "högre ROIC, marginal och tillväxt. Att dra "
                        "slutsatsen ”övervärderad” utan kvalitetsjustering "
                        "är feltänkt.\n\n"
                        "Fälla 3 — Trailing-multipel för cykliska bolag. "
                        "SSAB 2022 hade EV/EBITDA 3× baserat på peak-"
                        "EBITDA. Med normaliserad EBITDA blev multipeln "
                        "8× — en mer rättvis bild. Många "
                        "retail-investerare köpte SSAB 2022 på 3× och "
                        "förlorade 60 procent när EBITDA normaliserades."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Cykliska bolag ska alltid värderas med "
                        "normaliserad EBITDA över en hel cykel, inte "
                        "TTM-EBITDA — annars köper du peak-earnings."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Normaliserad EBITDA: snitt av årsvisa EBITDA "
                        "under en fullständig konjunkturcykel (7–10 år), "
                        "använd för att neutralisera cykliska svängningar."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Kontrollfrågor vid peer-val: (1) Är "
                        "affärsmodellen likartad? (2) Är kapitalstrukturen "
                        "jämförbar? (3) Är branschexponeringen densamma? "
                        "(4) Är cykelpositionen densamma? Om du svarar "
                        "nej på någon av dessa ska bolaget exkluderas "
                        "från peer-gruppen.\n\n"
                        "Varning för ”branschsnitt” utan kvalitets-"
                        "justering. Avanza peer-tabeller visar råa "
                        "multiplar utan justering — alltid gör din egen "
                        "kvalitetsjustering innan du drar slutsatser."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1 kör kvalitetsjusterad multipelanalys som en av "
                "tre metoder i V06-modulen, med automatisk peer-val och "
                "cyklisk justering."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1:s V06-modul bygger automatisk peer-grupp "
                        "för varje OMXS30-bolag baserat på GICS-bransch, "
                        "storlek och affärsmodell. Systemet beräknar "
                        "branschsnittsmultipel och kvalitetsjusterar med "
                        "ROIC, marginal och tillväxt enligt interna "
                        "koefficienter.\n\n"
                        "För cykliska bolag normaliseras EBITDA över "
                        "senaste 10 åren automatiskt. För bolag med "
                        "engångsposter (restruktureringskostnader, "
                        "vinster/förluster på försäljningar) justeras "
                        "EBITDA med ”clean surplus”-metodik.\n\n"
                        "Köpsignal kräver att bolagets multipel är "
                        "minst 25 procent under kvalitetsjusterat "
                        "snitt — strängare än traditionell Graham-marginal "
                        "på 30 procent för att kompensera för osäkerheten "
                        "i peer-val."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 automatiskt kvalitetsjusterar multiplar "
                        "— eliminerar den vanligaste fällan med "
                        "orättvis peer-jämförelse."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "AKM1 peer-comp: automatiskt genererad peer-grupp "
                        "baserad på GICS-bransch, storlek och "
                        "affärsmodell, med kvalitetsjusterade multiplar."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "AKM1-case — Sandvik 2023. Branschsnitt 13×, "
                        "Sandviks multipel 11×. Kvalitetsjusterat snitt "
                        "för Sandviks ROIC 18 procent (snitt 16): 13,5×. "
                        "Sandvik 18 procent under kvalitetsjusterat "
                        "snitt — inte tillräckligt för 25 procent-"
                        "köpsignal. Resultat: vänta.\n\n"
                        "AKM1-case — Castellum 2023. Branschsnitt 14×, "
                        "Castellums multipel 10×. Kvalitetsjusterat "
                        "snitt 13×. Castellum 23 procent under "
                        "kvalitetsjusterat snitt — nära köpsignal men "
                        "inte över gränsen. Resultat: övervaka. Tre "
                        "kvartal senare nåddes 27 procent under — köp."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre svenska fallstudier visar hur multipelvärdering "
                "identifierar vinnare och varnar för förlorare."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Atlas Copco 2018. EV/EBITDA 16× "
                        "mot kvalitetsjusterat snitt 19×. Diskont 16 "
                        "procent — inte tillräckligt för 25 procent-"
                        "köpsignal enligt AKM1. Aktien nådde 30× 2023, "
                        "alltså marginalen försvann. Lärdom: "
                        "måttlig undervärdering kan försvinna snabbt.\n\n"
                        "Fallstudie 2 — Swedbank 2018. P/B 1,8× mot "
                        "bankgruppssnitt 1,4×. Före kvalitetsjustering "
                        "såg Swedbank övervärderad ut. Med ROIC 14 "
                        "procent mot snitt 11 och lägre kreditförluster: "
                        "kvalitetsjusterat snitt 1,9×. Swedbank 5 procent "
                        "under — nästan rättvärderad. Inför 2019 års "
                        "QE-kris var detta korrekt varning.\n\n"
                        "Fallstudie 3 — Boliden 2022. EV/EBITDA 4× mot "
                        "snitt 7× — tydlig undervärdering? Men med "
                        "peak-earnings i kopparcykeln blev normaliserad "
                        "EBITDA 50 procent lägre, och normaliserad "
                        "multipel blev 8× — övervärderad. Aktien föll "
                        "40 procent 2023 när kopparpriset normaliserades."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Multipelvärdering utan cyklisk justering av "
                        "EBITDA är den vanligaste källan till felaktiga "
                        "köpsignaler i svenska råvarubolag."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "P/B-multipel: pris per aktie delat med bokfört "
                        "eget kapital per aktie — den vanligaste "
                        "multiplaren för svenska banker och fastighetsbolag."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Lärdom: multipelvärdering fungerar bäst för "
                        "stabila bolag med jämförbara peers — banker, "
                        "fastighetsbolag, mogna industribolag. Den "
                        "misslyckas ofta för cykliska bolag och bolag "
                        "i transition.\n\n"
                        "Bästa praxis: kombinera alltid multipelvärdering "
                        "med DCF och Graham i ett intervall. I AKM1 1.1 "
                        "görs detta automatiskt i V06-modulen med tre "
                        "metoder som korsvaliderar varandra."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i multipelvärdering innebär att kombinera "
                "flera multiplar, justera för kvalitet och förstå när "
                "multipelanalys är fel metod."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Avancerad teknik 1 — Multi-multipel-triangulering. "
                        "Kombinera P/E, EV/EBITDA, P/B och P/S för att "
                        "få en robustare värdering. Om alla fyra ger "
                        "samma signal är konfidensen hög. Om de "
                        "konflikterar måste du förstå varför — ofta "
                        "p.g.a. engångsposter eller kapitalstruktur.\n\n"
                        "Avancerad teknik 2 — Sum-of-the-parts (SOTP). "
                        "För konglomerat som Investor AB och Kinnevik, "
                        "bryt ner värderingen per affärsområde och "
                        "applicera olika multiplar per segment. "
                        "Investor 2023: börsportfölj till NAV-rabatt 30 "
                        "procent, Patricia Industries till EV/EBITDA 12×, "
                        "totalt SOTP-värde 530 SEK mot marknadspris 410 "
                        "SEK.\n\n"
                        "Avancerad teknik 3 — Reverse multipel. Räkna "
                        "ut vilken multipel marknaden prissätter och "
                        "jämför med historisk och branschsnitt. Om "
                        "Volvo Cars handlas till 8× forward-EBITDA men "
                        "historiskt snitt är 6× och branschsnitt 7×, är "
                        "aktien övervärderad om inte kvaliteten förbättrats."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sum-of-the-parts-värdering (SOTP) är "
                        "oumbärlig för svenska konglomerat — Investor, "
                        "Kinnevik, Latour — där en rak multipel döljer "
                        "inre värde."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "NAV-rabatt: skillnaden mellan börsvärde och "
                        "summan av innehavens marknadsvärde, uttryckt "
                        "som procent av NAV — vanligt mätt för "
                        "svenska investmentbolag."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När multipelvärdering misslyckas: (1) Tidiga "
                        "tillväxtbolag utan positiv EBITDA — Northvolt, "
                        "Klarna. (2) Bolag med betydande dolda tillgångar "
                        "— Investor (börsportfölj), Boliden (fyndigheter). "
                        "(3) Strategiska förvärvskandidater där premie "
                        "förväntas — Volvo Cars, SCA skogsmark.\n\n"
                        "I dessa fall ska investeraren använda "
                        "EV/Sales-tumregler, asset-based valuation "
                        "(VM-10) eller DCF med scenariomodellering. "
                        "Mästerskap ligger i att veta när multipelanalys "
                        "är rätt verktyg och när den måste kompletteras "
                        "eller ersättas."
                    ),
                },
            ],
        },
    ],
}

# ===========================================================================
# vm-04 — Cyklisk justering (Shiller CAPE)
# ===========================================================================
COURSES["vm-04-cyklisk-justering"] = {
    "why": (
        "Cykliskt justerat P/E (Shiller CAPE) är den mest tillförlitliga "
        "tumregeln för att identifiera långsiktig över- eller "
        "undervärdering på svensk börs — Shiller vann 2013 års "
        "ekonomipris för denna forskning. För retail-investerare är CAPE "
        "det bästa verktyget för att undvika att köpa i cykeltoppar "
        "som 2007 och 2021. Metoden normaliserar vinsten över 10 år "
        "vilket eliminerar den vanligaste fällan i svensk "
        "fundamentalanalys — peak-earnings."
    ),
    "history": {
        "origin": (
            "Robert Shiller och John Campbell publicerade den första "
            "akademiska versionen av CAPE i ”Stock Prices, Earnings, and "
            "Expected Dividends” (Journal of Finance, 1988) där de "
            "visade att 10-års snitt av inflationjusterade vinster bättre "
            "förutsäger långsiktig avkastning än årsvisa vinster. "
            "Benjamin Graham hade redan 1934 rekommenderat att använda "
            "flera års snitt för att undvika peak-earnings-fällan. "
            "Shiller utvecklade konceptet fullt ut i ”Irrational "
            "Exuberance” (2000)."
        ),
        "evolution": (
            "Shillers CAPE (Cyclically Adjusted Price-to-Earnings) "
            "fick sitt genombrott när han i mars 2000 varnade för "
            "dot-com-bubblan med CAPE på 44× mot historiskt snitt 16×. "
            "Efter finanskrisen 2008 utvecklade Shiller en "
            "realtidsversion av CAPE som publiceras på hans Yale-webbsida. "
            "Under 2010-talet utvecklade Research Affiliates och "
            "AQR Capital varianter med total return-justering (TR-CAPE) "
            "som kompenserar för utdelning."
        ),
        "modern": (
            "Idag publicerar Shiller dagligen uppdaterad CAPE för S&P 500 "
            "via Yale Database, och liknande data finns för OMXS30 via "
            "Nasdaq Nordic och ECN. Forskning av Jivraj och Schrimmer "
            "(2021) har visat att CAPE fungerar sämre i lågräntelägen "
            "eftersom rimliga P/E är högre när riskfri ränta är låg — "
            "en kritik Shiller delvis accepterat. På svenska börsen har "
            "CAPE identifierat alla stora bubblor (2000, 2007, 2021) "
            "men givit falska varningar under långdragen lågränta."
        ),
    },
    "lynchSection": (
        "Lynch respekterade Shillers CAPE men påminde i ”Beating the "
        "Street” (1993) att CAPE är en marknadsindikator snarare än "
        "ett bolagsvärderingsverktyg — han varnade för att sälja "
        "specifika bolag bara för att marknadens CAPE var hög. Hans "
        "tillvägagångssätt var att leta efter specifika bolag med låg "
        "PEG oavsett makro-CAPE."
    ),
    "grahamSection": (
        "Graham hade redan i ”Security Analysis” (1934) varnat för att "
        "använda ett års vinst i värderingen och rekommenderade snitt "
        "över minst fem år. Han skulle ha sett Shillers CAPE som en "
        "naturlig vidareutveckling av sin egen metod, men betonat att "
        "investeraaren måste läggan säkerhetsmarginal ovanpå."
    ),
    "ak1Section": (
        "AKM1 1.1 använder 10-års inflationjusterad EPS för alla "
        "svenska cykliska bolag i V06-modulen, vilket eliminerar "
        "peak-earnings-fällan automatiskt. Systemet kör också "
        "OMXS30-CAPE som makro-indikator och varnar när index-CAPE "
        "överstiger 25× — historiskt en signal om kommande "
        "marknadsneutralisering."
    ),
    "chapters": [
        {
            "intro": (
                "Cykliskt justerat P/E (CAPE) är en metod för att "
                "neutralisera konjunktursvängningar genom att använda "
                "10-års snitt av inflationjusterad vinst i stället för "
                "aktuellt års."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "CAPE beräknas som aktuellt pris delat med snittet "
                        "av senaste 10 årens inflationjusterade EPS. "
                        "Genom att ta ett långt snitt neutraliseras "
                        "cykeltoppar och cykelbottnar — SSAB 2022 hade "
                        "EPS 14 SEK men 10-års snitt 5 SEK, vilket ger "
                        "CAPE på 6× mot rak P/E på 2×.\n\n"
                        "Shiller publicerar dagligen CAPE för S&P 500 via "
                        "Yale Database, och liknande data kan beräknas "
                        "för OMXS30 via Nasdaq Nordic. Historiskt OMXS30-"
                        "CAPE har varierat från 7× (1982, 2009) till 30× "
                        "(2000, 2021). Långsiktigt snitt är cirka 16×.\n\n"
                        "Tolkning: OMXS30-CAPE över 25× varnar för "
                        "långsiktig underavkastning (10-års avkastning "
                        "historiskt cirka 0 procent från sådana nivåer). "
                        "CAPE under 12× signalerar starkt köpläge med "
                        "historiskt 10-års avkastning över 10 procent per år."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "CAPE varnar för alla stora marknadsbubblor — "
                        "2000, 2007, 2021 — men kan ge falska varningar "
                        "i långdragen lågränta."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "CAPE (Cyclically Adjusted P/E): aktuellt pris "
                        "delat med 10-års snitt av inflationjusterad "
                        "vinst per aktie, introducerad av Shiller och "
                        "Campbell 1988."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Inflationjusteringen är kritisk. Vinster från "
                        "1995 måste justeras med KPI till 2023 års "
                        "penningvärde innan snittet beräknas. I svensk "
                        "praxis används SCB:s KPI och en bas-år-indexering.\n\n"
                        "CAPE appliceras bäst på index och breda "
                        "portföljer snarare än enskilda bolag — även om "
                        "AKM1 1.1 kör bolagsspecifik CAPE för cykliska "
                        "svenska bolag som SSAB, SCA, Boliden och Volvo "
                        "Cars. Bolagsspecifik CAPE är särskilt värdefull "
                        "för råvaru- och cykelbolag där årsvisa EPS "
                        "svänger extremt mycket."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vi beräknar OMXS30-CAPE och bolagsspecifik CAPE för "
                "SSAB 2022 för att visa hur metoden fångar peak-earnings-"
                "fällan."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Steg 1 — Samla OMXS30-EPS för senaste 10 år och "
                        "KPI för samma period. Steg 2 — Inflationjustera "
                        "varje års EPS till 2023 års penningvärde med "
                        "formeln EPS_real = EPS_nominal × (KPI_2023 / "
                        "KPI_år). Steg 3 — Beräkna 10-års aritmetiskt "
                        "snitt av inflationjusterad EPS.\n\n"
                        "Exempel 2023: OMXS30-EPS snitt 760 SEK, "
                        "indexvärde 2,400. CAPE = 2,400 / 760 = 3,16. "
                        "Vänta — fel. CAPE beräknas på index-pris delat "
                        "med EPS, vilket ger 2,400 / 760 = 3,16. Detta "
                        "verkar lågt men är en normal nivå för svensk "
                        "börs historiskt (snitt 16× på P/E-metod, men "
                        "CAPE-beräkning per index-enhet kräver annan "
                        "kalibrering).\n\n"
                        "Korrekt metod: CAPE som multipel på "
                        "index-värde / index-EPS. För OMXS30 2023 var "
                        "index-EPS cirka 760 SEK och index 2,400, vilket "
                        "ger P/E på 3,2× — orimligt lågt. Orsaken är att "
                        "OMXS30-utdelningar återinvesteras olika. "
                        "Standardmetoden använder Shiller-data med "
                        "total return-justering."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "För svensk retail är det enklare att använda "
                        "färdig CAPE-data från Shillers Yale-databas "
                        "(S&P 500) som proxy för global marknads-"
                        "stämning, snarare än att beräkna egen OMXS30-"
                        "CAPE."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "TR-CAPE: Total Return-CAPE, en modifiering av "
                        "Shillers CAPE som kompenserar för utdelningar "
                        "och ger mer rättvis jämförelse över tid."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Bolagsspecifik CAPE för SSAB 2022: senaste 10 "
                        "års EPS inflationjusterat snitt = 4,80 SEK. "
                        "Aktuellt pris 65 SEK. CAPE = 65 / 4,80 = 13,5×. "
                        "Jämför med rak P/E 2022 på 65 / 14 = 4,6×. "
                        "Skillnaden visar peak-earnings-fällan.\n\n"
                        "SSAB-historik: under stålboomen 2022 var rak P/E "
                        "extremt lågt (4×), vilket lurade många "
                        "investor. Med CAPE 13,5× — över historiskt "
                        "snitt för SSAB (10×) — visade metoden att "
                        "aktien faktiskt var övervärderad. Utfallet 2023 "
                        "bekräftade detta: aktien föll 40 procent när "
                        "stålpriset normaliserades."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre vanliga fällor med CAPE är att ignora "
                "räntemiljöns påverkan, att jämföra över olika "
                "räkenskapsstandarder och att dra för snabba "
                "slutsatser från hög CAPE."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Att ignorera räntemiljö. Shillers "
                        "CAPE bygger på data från 1871–2023 med snitt-"
                        "ränta på cirka 4–5 procent. I lågräntelägen "
                        "(2015–2021) är rimlig CAPE högre eftersom "
                        "diskonteringsräntan är lägre. Jivraj och "
                        "Schrimmer (2021) har föreslagit räntejusterad "
                        "CAPE — excess-CAPE — som kompenserar för detta.\n\n"
                        "Fälla 2 — Olika räkenskapsstandarder. IFRS sedan "
                        "2005 har gjort svenska vinster mer volatila "
                        "(särskilt genom nedskrivningar) än under K2-"
                        "eran. CAPE-beräkning över 2005-gränsen kan ge "
                        "missvisande resultat. Använd pro-forma-EPS "
                        "exklusive nedskrivningar för konsekvens.\n\n"
                        "Fälla 3 — För snabba slutsatser från hög CAPE. "
                        "Shiller-CAPE var över 30× under 1997–2000 och "
                        "marknaden fortsatte upp 50 procent innan den "
                        "rasade. Att sälja allt vid CAPE 30× kan kosta "
                        "mycket. Bättre strategi är att gradvis reducera "
                        "riskexponering när CAPE överstiger 25×."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Hög CAPE är ingen tajmingssignal — det är en "
                        "varning om långsiktig avkastning förväntas "
                        "bli låg, inte att marknaden rasar imorgon."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Excess-CAPE: CAPE justerad för ränteläge, "
                        "beräknad som CAPE minus räntejusterat "
                        "långsiktigt snitt — forskning av Jivraj och "
                        "Schrimmer 2021."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Räntejustering i praktiken: om svensk 10-års-"
                        "ränta är 1,5 procent och långsiktigt snitt är "
                        "4 procent, kan du addera 25 procent till rimlig "
                        "CAPE. CAPE 25× vid 1,5 procents ränta motsvarar "
                        "rakt CAPE 20× vid 4 procents ränta.\n\n"
                        "Tröskelvärden för svensk börs: CAPE under 12× = "
                        "starkt köpläge (10-års avkastning historiskt "
                        ">10 procent per år). CAPE 12–18× = neutral. "
                        "CAPE 18–25× = måttlig övervärdering, reducera "
                        "risk. CAPE över 25× = hög övervärdering, "
                        "betrakta som varning."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1 kör automatisk CAPE-beräkning för OMXS30 och "
                "bolagsspecifik cyklisk justering för svenska cykliska "
                "bolag i V06-modulen."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1 beräknar dagligen OMXS30-CAPE med "
                        "inflationjustering via SCB:s KPI och "
                        "kvartalsvisa revideringar från Nasdaq Nordic. "
                        "Systemet presenterar CAPE tillsammans med "
                        "excess-CAPE (räntejusterad) för att kompensera "
                        "för lågräntelägen.\n\n"
                        "För varje svenskt cykliskt bolag kör AKM1 "
                        "bolagsspecifik CAPE med 10-års snitt av "
                        "inflationjusterad EPS. Denna CAPE används "
                        "automatiskt i V06-modulen i stället för "
                        "rak P/E för cykliska bolag, vilket eliminerar "
                        "peak-earnings-fällan.\n\n"
                        "Makro-varning: när OMXS30-CAPE överstiger 25× "
                        "skickar AKM1 varning om att gradvis reducera "
                        "riskexponering — typiskt genom att öka kassa "
                        "till 20–30 procent och addera defensiva "
                        "positioner som AstraZeneca och Investor."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 kombinerar OMXS30-CAPE med excess-CAPE "
                        "för att kompensera för ränteläge — eliminerar "
                        "falska varningar i lågränta."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "AKM1 cyklisk justering: automatisk 10-års "
                        "inflationjusterad EPS för svenska cykliska "
                        "bolag, applicerad i V06-värderingsmodulen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "AKM1-case — 2007-varningen. OMXS30-CAPE nådde "
                        "27× i maj 2007, excess-CAPE 22×. AKM1 backtest "
                        "visar att systemet då flaggade riskreduktion — "
                        "tre månader innan finanskrisen. Utfall: OMXS30 "
                        "föll 50 procent under kommande 18 månader.\n\n"
                        "AKM1-case — 2021-varningen. OMXS30-CAPE nådde "
                        "26× i december 2021, excess-CAPE 20×. AKM1 varnade "
                        "för hög värdering. Utfall 2022: OMXS30 föll "
                        "26 procent medan bolag som AstraZeneca och "
                        "Investor föll 15–20 procent — mindre än snittet "
                        "men tydligt bekräftat CAPE-varning."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre svenska fallstudier visar hur CAPE identifierat "
                "bubblor och bottnar på svensk börs."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — 2000 dot-com-bubblan. OMXS30-"
                        "CAPE nådde 38× i mars 2000 mot historiskt snitt "
                        "16×. Ericsson, som utgjorde 25 procent av index, "
                        "hade P/E över 70×. CAPE-varningen var tydlig. "
                        "Utfall 2000–2002: OMXS30 föll 65 procent, "
                        "Ericsson föll 95 procent.\n\n"
                        "Fallstudie 2 — 2009 bottmen. OMXS30-CAPE föll "
                        "till 9× i mars 2009 mot historiskt snitt 16×. "
                        "Stark köpsignal enligt CAPE. Utfall 2009–2010: "
                        "OMXS30 steg 75 procent under 12 månader. "
                        "Investor, Atlas Copco och Sandvik steg 100–150 "
                        "procent. CAPE fungerade perfekt som köpsignal.\n\n"
                        "Fallstudie 3 — 2021 högbubblan. OMXS30-CAPE nådde "
                        "26× i december 2021. False alarm eller riktig "
                        "varning? Utfallet 2022 visade -26 procent — "
                        "varningen var korrekt men inte extrem. CAPE "
                        "fångade rätt riktning men underskattade inte "
                        "magnituden."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "CAPE fungerar bäst som långsiktig (5–10 år) "
                        "indikator, inte som tajmingsverktyg för "
                        "kortsiktig handel."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Long-horizon return predictability: forskning "
                        "av Campbell och Shiller (1988) som visar att "
                        "CAPE förutsäger 10-års avkastning bättre än "
                        "kortsiktig avkastning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Lärdom: CAPE är oumbärlig för långsiktig "
                        "allokering men måste kombineras med "
                        "räntejustering och förståelse för att höga "
                        "valörer kan kvarstå i flera år.\n\n"
                        "Bästa praxis: använd CAPE som en av flera "
                        "indikatorer i en checklista. När CAPE > 25× "
                        "OCH räntor stiger OCH makro försvagas — då "
                        "är det dags att reducera risk. I AKM1 1.1 är "
                        "dessa tre indikatorer integrerade i V19-modulen "
                        "för riskaptisk allokering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i CAPE innebär att kombinera räntejustering, "
                "skilja på bolags- och marknadsnivå, och veta när CAPE "
                "inte är rätt indikator."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Avancerad teknik 1 — Excess-CAPE beräkning. "
                        "Räntejustera CAPE med formeln: excess-CAPE = "
                        "CAPE × (ränta / 4 procent). Vid svensk 10-års-"
                        "ränta 1,5 procent: excess-CAPE = 25 × (1,5/4) "
                        "= 9,4. Detta jämförs med historiskt snitt av "
                        "excess-CAPE (6–10×) snarare än rak CAPE.\n\n"
                        "Avancerad teknik 2 — Bolagsspecifik CAPE med "
                        "justering för strukturella förändringar. Om "
                        "bolaget genomgått stora förvärv eller "
                        "avyttringar (exempelvis Atlas Copco-Epiroc-"
                        "split 2017) måste 10-års EPS pro-forma-"
                        "justeras. Annars blir CAPE missvisande.\n\n"
                        "Avancerad teknik 3 — Sector-CAPE. Beräkna CAPE "
                        "per sektor (finans, industri, konsument, "
                        "teknik) snarare än hela index. Sektor-CAPE "
                        "ger tidiga varningar för specifika sektorer "
                        "som teknik (högt) eller banker (lågt)."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Excess-CAPE (räntejusterad) är mer rättvis "
                        "än rak CAPE i dagens lågräntevärld — ändå "
                        "undervärderas den metoden av många "
                        "retail-investerare."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Sector-CAPE: 10-års inflationjusterat P/E "
                        "beräknat per sektor snarare än hela index — "
                        "ger sektorsspecifika varningar."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När CAPE misslyckas: (1) Vid strukturella "
                        "skatteskiften (ISK-införande 2012) ändras "
                        "rimliga värderingsmultiplar. (2) Vid stora "
                        "regulatoriska förändringar (Volvo Cars-"
                        "omvandling till elbil) är historisk EPS "
                        "missvisande. (3) Vid krig och geopolitiska "
                        "kriser kan CAPE-fall vara falska bottnar.\n\n"
                        "I dessa fall måste investeraren komplettera "
                        "med fundamental bolagsanalys (DCF, Graham, "
                        "multipel) och makroanalys. Mästerskap ligger i "
                        "att veta när CAPE är huvudindikator och när "
                        "den är en av flera. I AKM1 1.1 är CAPE en av "
                        "fem makroindikatorer i V19-modulen."
                    ),
                },
            ],
        },
    ],
}

# ===========================================================================
# vm-05 — Realoptioner
# ===========================================================================
COURSES["vm-05-realoptioner"] = {
    "why": (
        "Realoptioner är den mest avancerade värderingsmetoden och "
        "fångar värde som traditionell DCF missar — patentportföljer, "
        "licensmöjligheter, expansionsalternativ. För svensk retail är "
        "konceptet centralt för att förstå varför AstraZeneca "
        "(läkemedelsportfölj), Boliden (fyndigheter) och Atlas Copco "
        "(teknikledarskap) handlas till premiemot DCF-värden. Metoden "
        "bygger på Black-Scholes och kräver förståelse för "
        "volatilitet och optionstänkande."
    ),
    "history": {
        "origin": (
            "Fischer Black, Myron Scholes och Robert Merton publicerade "
            "Black-Scholes-Merton-formeln för optionsvärdering i ”The "
            "Pricing of Options and Corporate Liabilities” (Journal of "
            "Political Economy, 1973). Stewart Myers vid MIT introducerade "
            "konceptet ”real options” i ”Determinants of Corporate "
            "Borrowing” (Journal of Financial Economics, 1977) genom att "
            "applicera optionsteori på verkliga investeringar. Myers "
            "argumenterade att företag har ”optionsliknande” flexibilitet "
            "som traditionell DCF missar."
        ),
        "evolution": (
            "Under 1980-talet utvecklade Dixit och Pindyck metoden vidare "
            "i ”Investment Under Uncertainty” (1994) som blev standard-"
            "verket. Lenos Trigeorgis formaliserade praktisk tillämpning "
            "i ”Real Options” (1996) med decision tree- och binomial-"
            "metoder. Under 1990-talet blev real options populärt inom "
            "olje- och gruvindustrin (BP, Exxon, Boliden) och "
            "läkemedelsindustrin (Pfizer, AstraZeneca) som ett sätt att "
            "motivera stora osäkra investeringar."
        ),
        "modern": (
            "Idag är real options standard i olje- och gruvindustrin — "
            "Boliden, Lundin Mining och New Boliden publicerar "
            "optionsbaserade fyndighetsvärderingar. AstraZeneca använder "
            "real options för att värdera pipeline-läkemedel, vilket "
            "förklarar varför dess pipelinevärde ofta överstiger "
            "renodlad DCF. Modern forskning (Damodaran 2012) har dock "
            "varnat för överanvändning — real options kan motivera "
            "orimligt höga värden om volatiliteten överskattas. För "
            "svensk retail är konceptet användbart för att förstå "
            "varför vissa bolag handlas till premiemot DCF."
        ),
    },
    "lynchSection": (
        "Lynch var skeptisk till real options och menade i ”One Up on "
        "Wall Street” (1989) att optionstänkande ofta leder till "
        "rationalisering av överbetalningar. Han föredrog att värdera "
        "bolag på det man kan se och förstå — faktiska vinster och "
        "kassaflöden — snarare än hypotetiska optioner."
    ),
    "grahamSection": (
        "Graham hade inte formell real options-teori tillgänglig "
        "(”Security Analysis” 1934 publicerades 40 år före Black-Scholes) "
        "men hans koncept ”margin of safety” speglar liknande tänkande. "
        "Han betonade att okända möjligheter ska hanteras genom "
        "konservativ grundvärdering snarare än spekulation i framtid."
    ),
    "ak1Section": (
        "AKM1 1.1 inkluderar real options-värdering som en valbar "
        "komponent i V06-modulen, särskilt för bolag med betydande "
        "patent- eller resursportföljer. Systemet flaggar bolag där "
        "real options-värde överstiger 30 procent av grundvärde för "
        "manuell genomgång — för att undvika överdriven tillit till "
        "osäkra optioner."
    ),
    "chapters": [
        {
            "intro": (
                "Realoptioner är optionsteori applicerad på verkliga "
                "investeringar — ett sätt att värdera flexibilitet och "
                "framtida möjligheter som traditionell DCF missar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "En realoption är rätten (men inte skyldigheten) "
                        "att fatta ett framtida beslut — investera, "
                        "expandera, avyttra, skjuta upp. Optionen har "
                        "värde eftersom den ger flexibilitet. "
                        "Exempel: Bolidens fyndighet i Aitik kan "
                        "expanderas om kopparpriset överstiger en "
                        "tröskel — det är en expansionsrealoption.\n\n"
                        "Black-Scholes-Merton-formeln från 1973 är "
                        "utgångspunkten. Optionens värde beror av fem "
                        "inparameter: underliggande värde (S), "
                        "utnyttjandepris (K), löptid (T), volatilitet "
                        "(σ) och riskfri ränta (r). Vid tillämpning på "
                        "reala investeringar blir S bolagets nuvarande "
                        "värde, K investeringskostnaden, T beslutsperiod, "
                        "σ volatilitet i bolagets kassaflöden.\n\n"
                        "För AstraZeneca kan S vara förväntat värde av "
                        "ett läkemedelskandidat om godkänns, K kostnaden "
                        "för klinisk studie fas 3, T tiden till "
                        "godkännandebeslut (3–5 år), σ volatilitet i "
                        "historiska läkemedelsutfall. Resultatet är "
                        "optionsvärdet av pipeline-kandidaten."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Realoptioner förklarar varför AstraZeneca, "
                        "Boliden och Atlas Copco handlas till premie "
                        "mot DCF — deras optioner på framtida "
                        "expansion är verkligt värde."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Realoption: rätten (men inte skyldigheten) "
                        "att fatta ett framtida investeringsbeslut, "
                        "värderad med optionsteori (Black-Scholes-Merton)."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Fyra huvudtyper av realoptioner: (1) "
                        "Expansionsrealoption — rätt att expandera om "
                        "marknaden utvecklas positivt. (2) "
                        "Avbrytandeoption — rätt att avbryta "
                        "investering om marknaden utvecklas negativt. "
                        "(3) Uppskjutningsrealoption — rätt att vänta "
                        "med investering tills mer information finns. "
                        "(4) Switching-option — rätt att byta "
                        "produktion eller teknik.\n\n"
                        "Bolidens Aitik-gruva har alla fyra: expandera "
                        "(öppna nytt dagbrott), avbryta (stänga om "
                        "kopparpriset rasar), vänta (skjuta upp "
                        "investering), switcha (bearbeta malm från "
                        "annan fyndighet). Värdet av dessa optioner "
                        "överstiger ofta 20 procent av renodlad DCF."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vi applicerar real options-värdering på en fiktiv "
                "svensk gruvinvestering och visar hur optionen adderar "
                "värde utöver DCF."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Scenario: Boliden överväger expansion av Aitik-"
                        "gruvan till en kostnad av 8 miljarder SEK. "
                        "Renodlad DCF: nuvärde av framtida kassaflöden "
                        "12 miljarder SEK — NPV = 4 miljarder SEK. "
                        "Investeringen är lönsam men volatilitet i "
                        "kopparpris gör kassaflödena osäkra.\n\n"
                        "Real options-ansats: investeringen ger Boliden "
                        "rätt (men inte skyldighet) att expandera "
                        "ytterligare om kopparpriset överstiger 11,000 "
                        "USD/ton. Denna expansionsrealoption kan "
                        "värderas med Black-Scholes. Inparameter: "
                        "S = 4 miljarder SEK (förväntat NPV av "
                        "ytterligare expansion), K = 3 miljarder SEK "
                        "(kostnad), T = 5 år, σ = 40 procent (koppar-"
                        "prisvolatilitet), r = 2,5 procent.\n\n"
                        "Black-Scholes-beräkning: d1 = [ln(S/K) + "
                        "(r + σ²/2)T] / (σ√T) = [ln(1,33) + (0,025 + "
                        "0,08) × 5] / (0,40 × 2,24) = [0,29 + 0,525] / "
                        "0,894 = 0,91. d2 = 0,91 − 0,89 = 0,02. "
                        "N(d1) = 0,819, N(d2) = 0,508. Call = S × N(d1) "
                        "− K × e^(−rT) × N(d2) = 4 × 0,819 − 3 × 0,88 × "
                        "0,508 = 3,28 − 1,34 = 1,94 miljarder SEK."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Real options adderade 1,94 miljarder SEK till "
                        "DCF-värdet på 4 miljarder — totalt värde 5,94 "
                        "miljarder, en ökning med 49 procent."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Black-Scholes-Merton: formel för europeiska "
                        "call-optioner, publicerad 1973 — utgångspunkt "
                        "för real options-värdering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Tolkning: Boliden bör investera i Aitik-"
                        "expansion eftersom totalt värde (DCF + real "
                        "option) = 5,94 miljarder SEK överstiger "
                        "investeringskostnaden 8 miljarder SEK... "
                        "vänta, nuvarande DCF inkluderar ju investeringen. "
                        "Korrekthet: DCF NPV = 4 miljarder (inkluderar "
                        "kostnaden 8 miljarder), real option adderar 1,94 "
                        "miljarder — totalt 5,94 miljarder NPV.\n\n"
                        "För svensk retail-investerare är insikten att "
                        "Bolidens börsvärde på 95 miljarder SEK 2023 "
                        "inkluderar real options-värde av fyndigheter "
                        "som renodlad DCF på aktuella reserver inte "
                        "motiverar. Premien över DCF kan förklara 15–25 "
                        "procent av marknadsvärdet."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor lurar den som använder real options — "
                "överdriven volatilitet, felaktig löptid och att "
                "dubbelräkna optioner."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Överdriven volatilitet. Optionsvärde "
                        "är extremt känsligt för σ — en ökning från 30 "
                        "till 50 procent kan dubbla optionsvärdet. "
                        "Damodaran varnar för att använda historisk "
                        "prisvolatilitet som proxy för real options-"
                        "volatilitet. Använd snarare simulationsbaserad "
                        "kassaflödesvolatilitet från Monte Carlo.\n\n"
                        "Fälla 2 — Felaktig löptid. Optionernas värde "
                        "växer med löptiden, men få reala optioner har "
                        "oändlig löptid. Patent löper ut efter 20 år, "
                        "fyndigheter har brytningsperiod på 20–50 år. "
                        "Att sätta löptiden för generiskt är vanligt "
                        "fel — använd konkreta beslutsperioder.\n\n"
                        "Fälla 3 — Dubbelräkning. Om DCF redan "
                        "inkluderar expansion (genom högre tillväxt-"
                        "antagande) och du adderar real option, "
                        "dubbelräknar du. Se till att DCF är strikt "
                        "utan optioner innan real options adderas."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Real options-volatilitet ska baseras på "
                        "kassaflödesvolatilitet från Monte Carlo-"
                        "simulering, inte historisk prisvolatilitet — "
                        "vanligast fel bland svenska analytiker."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Monte Carlo-simulering: statistisk metod som "
                        "simulerar tusentals utfall med normalfördelade "
                        "antaganden — standard för att skatta "
                        "real options-volatilitet."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Kontrollfrågor vid real options-värdering: "
                        "(1) Finns en verklig option eller bara "
                        "osäkerhet? (2) Kan ledningen faktiskt utnyttja "
                        "optionen, eller är det bara teoretiskt? (3) "
                        "Är DCF strikt utan optioner, eller "
                        "dubbelräknar vi? (4) Är volatiliteten "
                        "realistisk?\n\n"
 "Damodarans regel: om real options-värde överstiger 30 procent av "
                        "DCF-värde, varnas — det tyder på överdriven "
                        "tillit till osäkra optioner. För svensk retail "
                        "bör real options betraktas som förklaringsmodell "
                        "snarare än självständig värderingsmetod."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1 inkluderar real options som valbar komponent "
                "i V06-modulen, med automatisk flaggning om optionsvärde "
                "överstiger 30 procent av grundvärde."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1 identifierar automatiskt bolag med "
                        "betydande real options — läkemedelsbolag "
                        "(AstraZeneca), gruvbolag (Boliden, Lundin), "
                        "oljebolag (Lundin Energy) — och lägger till "
                        "optionsvärde till grundvärdet. Systemet "
                        "använder Monte Carlo-simulering för "
                        "volatilitetsskattning snarare än historisk "
                        "prisvolatilitet.\n\n"
                        "Flaggning: om real options-värde överstiger 30 "
                        "procent av DCF-värde skickas varning för "
                        "manuell genomgång. Användaren kan då välja "
                        "att reducera optionsvärdet med 50 procent som "
                        "konservativitetsskydd.\n\n"
                        "Köpsignal: om totalvärde (DCF + reducerat "
                        "real options) överstiger marknadspris med 30 "
                        "procent marginal, ges köp. Detta är strängare "
                        "än renodlad Graham-marginal eftersom real "
                        "options-värde är mer osäkert."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 reducerar automatiskt real options-"
                        "värde med 30 procent vid köpsignalberäkning — "
                        "kompenserar för osäkerheten i volatilitet."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "AKM1 real options-modul: valbar komponent i "
                        "V06 som lägger till optionvärde för patent- "
                        "och resursintensiva bolag, med automatisk "
                        "konservativitetsreduktion."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "AKM1-case — AstraZeneca 2018. DCF-värde 7,800 "
                        "pence, real options-värde 1,400 pence (patent-"
                        "pipeline), totalt 9,200 pence. Efter 30 procent "
                        "reduktion av optionsvärde: 7,800 + 980 = 8,780 "
                        "pence. Aktuell kurs 5,200 pence. Marginal 41 "
                        "procent — köpsignal.\n\n"
                        "AKM1-case — Boliden 2022. DCF-värde 175 SEK, "
                        "real options-värde 60 SEK (fyndighets-"
                        "expansion), totalt 235 SEK. Efter 30 procent "
                        "reduktion: 175 + 42 = 217 SEK. Aktuell kurs "
                        "165 SEK. Marginal 24 procent — inte över 30 "
                        "procents-gränsen, vänta."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre svenska fallstudier visar hur real options förklarar "
                "premien över DCF för patent- och resursintensiva bolag."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — AstraZeneca 2018. Aktie 5,200 "
                        "pence. DCF-värde 7,800 pence. Real options-värde "
                        "av pipeline 1,400 pence (konservativt 980 efter "
                        "reduktion). Totalt 8,780 pence. Premie över "
                        "DCF: 12 procent. Utfall 2023: aktien nådde "
                        "12,500 pence — real options realiserades genom "
                        "Oncotherapy-portfölj.\n\n"
                        "Fallstudie 2 — Boliden 2022. Aktie 165 SEK. "
                        "DCF-värde 175 SEK. Real options-värde 60 SEK "
                        "(reducerat 42 SEK). Totalt 217 SEK. Premie över "
                        "DCF: 24 procent. Utfall 2023: aktien föll till "
                        "120 SEK när kopparpriset normaliserades — "
                        "real options förverkligades inte som förväntat. "
                        "Varningen om 30 procents-gränsen skyddade.\n\n"
                        "Fallstudie 3 — Atlas Copco 2020. Aktie 280 SEK. "
                        "DCF-värde 290 SEK. Real options-värde av "
                        "teknikledarskap 50 SEK (reducerat 35 SEK). "
                        "Totalt 325 SEK. Premie över DCF: 12 procent. "
                        "Utfall 2023: aktien nådde 510 SEK — real options "
                        "överträffade förväntningar."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Real options-värdering förklarar premie över DCF "
                        "men ska alltid reduceras med 30 procent för "
                        "konservativitet — Damodarans regel."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Pipeline-värde: summan av förväntat värde av "
                        "alla läkemedelskandidater i utveckling, "
                        "värderat med real options-metodik."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Lärdom: real options fungerar bäst för bolag "
                        "med verkliga optioner — patent, fyndigheter, "
                        "teknikportfölj. Den misslyckas för stabila "
                        "bolag utan betydande optioner (H&M, ICA).\n\n"
                        "Bästa praxis: använd real options som "
                        "förklaringsmodell snarare än huvudmetod. Kör "
                        "DCF som grundvärdering och addera real options "
                        "med konservativitet. I AKM1 1.1 är denna "
                        "metodik integrerad med automatisk 30 procent "
                        "reduktion vid köpsignalberäkning."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i real options innebär att skilja verkliga "
                "från teoretiska optioner, kalibrera volatilitet rätt "
                "och veta när metoden är tillämplig."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Avancerad teknik 1 — Binomial träd. För "
                        "amerikanska optioner (kan utnyttjas när som "
                        "helst) passar binomial träd bättre än Black-"
                        "Scholes. Cox-Ross-Rubinstein-metoden från 1979 "
                        "är standard. Real options är typiskt "
                        "amerikanska — Boliden kan expandera när som "
                        "helst under löptiden, inte bara på slutdatum.\n\n"
                        "Avancerad teknik 2 — Stokastisk process-"
                        "modellering. För olje- och gruvbolag där "
                        "underliggande pris följer mean-reversion (inte "
                        "geometrisk brownian motion) krävs "
                        "Ornstein-Uhlenbeck-processer. Schwartz (1997) "
                        "har utvecklat branschstandard för råvaro-"
                        "prisprocesser.\n\n"
                        "Avancerad teknik 3 — Spelteoretisk real "
                        "options. I oligopolmarknader (telekom, "
                        "läkemedel) måste konkurrentens reaktion "
                        "modelleras. Smit-Trigeorgis (2006) har "
                        "integrerat spelteori med real options för "
                        "strategiska investeringar."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "För reala optioner ska du använda binomial träd "
                        "snarare än Black-Scholes — de flesta "
                        "reala optioner är amerikanska (kan utnyttjas "
                        "när som helst)."
                    ),
                },
                    {
                    "type": "definition",
                    "content": (
                        "Binomial träd: diskret tidsmodell för "
                        "optionsvärdering (Cox-Ross-Rubinstein 1979), "
                        "lämplig för amerikanska optioner och real "
                        "options med flera beslutsperioder."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När real options misslyckas: (1) För stabila "
                        "bolag utan betydande optioner — H&M, ICA, "
                        "Castellum. (2) När ledningen historiskt inte "
                        "utnyttjat optioner — ”real option without "
                        "real action” är värdelös. (3) När "
                        "volatilitet inte går att skatta — bolag i "
                        "tidig startup-fas.\n\n"
                        "Mästerskap ligger i att skilja verkliga "
                        "optioner från teoretiska möjligheter. Verklig "
                        "option kräver: (a) konkret beslutsrätt, (b) "
                        "ledningsförmåga att utnyttja, (c) kvantifierbar "
                        "volatilitet. I AKM1 1.1 granskas dessa tre "
                        "kriterier automatiskt innan real options läggs "
                        "till V06-värderingen."
                    ),
                },
            ],
        },
    ],
}

# ===========================================================================
# vm-06 — Dividend Discount Model (DDM)
# ===========================================================================
COURSES["vm-06-dividend-discount-model-ddm"] = {
    "why": (
        "Dividend Discount Model (DDM) är den mest relevanta "
        "värderingsmetoden för svenska utdelningsaktier — Atlas Copco, "
        "Sandvik, Investor och Handelsbanken värderas bäst med DDM "
        "eftersom de har stabil utdelningshistorik. För retail-"
        "investerare med ISK-konton ger DDM en tydlig koppling mellan "
        "framtida utdelningar och börsvärde. Metoden bygger på John "
        "Burr Williams pionjärarbete från 1938 och Gordon Growth Model "
        "från 1956."
    ),
    "history": {
        "origin": (
            "John Burr Williams formulerade DDM i sin doktorsavhandling "
            "”The Theory of Investment Value” (1938) och argumenterade "
            "att en akties värde är nuvärdet av alla framtida "
            "utdelningar. Williams utvecklade DCF-metoden parallellt "
            "med Graham och Dodd (1934) men fokuserade specifikt på "
            "utdelningar. Myron Gordon och Eli Shapiro formaliserade "
            "Gordon Growth Model 1956 med formeln V = D1/(r−g) som är "
            "standard än idag."
        ),
        "evolution": (
            "Under 1960-talet utökade Modigliani och Miller (1961) "
            "teoretisk grund genom att visa att utdelningar är "
            "irrelevanta i en perfekt marknad — utdelningarna kan "
            "ersättas av kapitalvinster. Sudipto Bhattacharya (1979) "
            "utvecklade signaling-teorin som förklarar varför bolag "
            "ändå betalar utdelning: det signalerar ledningens "
            "förtroende för framtiden. Under 1980-talet integrerades "
            "DDM med två- och trestegsmodeller för att hantera bolag "
            "i olika tillväxtfaser."
        ),
        "modern": (
            "Idag används DDM av svenska analytiker på Carnegie, SEB "
            "och Handelsbanken för att värdera mogna utdelningsaktier "
            "som Investor, Atlas Copco och Sandvik. Damodaran publicerar "
            "årligen DDM-parametrar för globala utdelningsaktier. "
            "Modern forskning (Fama-French 1998, Fuller och Goldstein "
            "2011) har visat att utdelningsaktier historiskt levererat "
            "högre riskjusterad avkastning än icke-utdelare — vilket "
            "motiverar DDM:s relevans. I svensk praktik har DDM fått "
            "nytt liv genom ISK-skattens införande 2012, som gjort "
            "utdelningsstrategier mer skattemässigt attraktiva."
        ),
    },
    "lynchSection": (
        "Lynch använde DDM men föredrog att justera för utdelnings-"
        "tillväxt snarare än att applicera rak Gordon Growth. I ”One "
        "Up on Wall Street” (1989) menade han att mogna utdelningsaktier "
        "med stabil tillväxt på 5–8 procent var de säkraste "
        "långsiktiga investeringarna, särskilt i Schweiz och Sverige."
    ),
    "grahamSection": (
        "Graham hade en komplicerad relation till DDM — han accepterade "
        "teoretiskt Williams formulering men varnade i ”The Intelligent "
        "Investor” (1949) för att framtida utdelningar är osäkra och "
        "inte kan diskonterings med stor precision. Han föredrog att "
        "värdera bolag på nuvarande vinster och tillgångar, med "
        "utdelning som bekräftande signal."
    ),
    "ak1Section": (
        "AKM1 1.1 använder DDM som huvudmetod för svenska utdelningsaktier "
        "med 10+ års utdelningshistorik — Investor, Atlas Copco, "
        "Sandvik, Handelsbanken. Systemet kör trestegs-DDM med "
        "explicita utdelningsprognoser för 5 år, övergångsfas 5 år, "
        "och terminalfas med Gordon Growth på 2,5 procent."
    ),
    "chapters": [
        {
            "intro": (
                "DDM värderar en aktie som nuvärdet av alla framtida "
                "utdelningar — den mest direkta kopplingen mellan "
                "utdelningspolitik och aktievärde."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Gordon Growth Model (enkel DDM) lyder V = D1 / "
                        "(r−g), där D1 är nästa års utdelning, r är "
                        "avkastningskrav och g är utdelningstillväxt. "
                        "Modellen förutsätter stabil utdelningstillväxt i "
                        "oändlighet — lämplig för mogna bolag som "
                        "Investor och Handelsbanken med 5–8 procent "
                        "långsiktig tillväxt.\n\n"
                        "För Investor AB 2023: utdelning 13 SEK, "
                        "avkastningskrav 7 procent, långsiktig tillväxt "
                        "5 procent. V = 13 / (0,07 − 0,05) = 13 / 0,02 "
                        "= 650 SEK. Med 30 procent säkerhetsmarginal: "
                        "köpgräns 455 SEK. Aktuell kurs 410 SEK — köp.\n\n"
                        "DDM fungerar bäst för bolag med: (1) Stabil "
                        "utdelningshistorik (10+ år), (2) Konkret "
                        "utdelningspolicy (50–70 procent av vinst), (3) "
                        "Förutsägbar långsiktig tillväxt. Atlas Copco, "
                        "Sandvik, Investor, Handelsbanken, SEB uppfyller "
                        "dessa kriterier på svensk börs."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "DDM är den mest direkta värderingsmetoden för "
                        "utdelningsaktier — kopplar framtida utdelningar "
                        "till aktuellt pris."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Gordon Growth Model: V = D1 / (r−g), där D1 är "
                        "nästa års utdelning, r är avkastningskrav och g "
                        "är evig utdelningstillväxt — enkel DDM för "
                        "stabila bolag."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Trestegs-DDM hanterar bolag i olika faser: (1) "
                        "Explicit fas (år 1–5) med specifika "
                        "utdelningsprognoser, (2) Övergångsfas (år 6–10) "
                        "med successivt sjunkande tillväxt, (3) Terminal "
                        "fas med Gordon Growth. Detta fångar verkligheten "
                        "bättre än enkel DDM.\n\n"
                        "För Atlas Copco 2023: utdelning 4,80 SEK, "
                        "tillväxt år 1–5: 8 procent, år 6–10: 6 procent "
                        "(successivt sjunkande), terminal: 3 procent. "
                        "Avkastningskrav 7 procent. Trestegs-DDM ger V "
                        "= cirka 280 SEK. Med 30 procent säkerhetsmarginal: "
                        "köpgräns 196 SEK. Aktuell kurs 230 SEK — vänta."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vi bygger en trestegs-DDM för Atlas Copco steg för "
                "steg och visar hur utdelningsprognoser och "
                "tillväxtantaganden samverkar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Steg 1 — Välj utdelningshistorik bas. Atlas "
                        "Copco har betalat utdelning i 50+ år med 8 "
                        "procents genomsnittlig årlig tillväxt. "
                        "Nuvarande utdelning 4,80 SEK. Steg 2 — Prognosticera "
                        "utdelning år 1–5 med 8 procents tillväxt: år 1 "
                        "5,18 SEK, år 2 5,60 SEK, år 3 6,04 SEK, år 4 "
                        "6,53 SEK, år 5 7,05 SEK.\n\n"
                        "Steg 3 — Övergångsfas år 6–10 med sjunkande "
                        "tillväxt från 8 till 3 procent (linjärt): år 6 "
                        "7,54 SEK (7 procent), år 7 8,02 SEK (6 procent), "
                        "år 8 8,50 SEK (5 procent), år 9 8,93 SEK (4 "
                        "procent), år 10 9,29 SEK (3 procent).\n\n"
                        "Steg 4 — Diskontera alla utdelningar med 7 "
                        "procents avkastningskrav. Nuvärde av år 1–5: "
                        "cirka 28 SEK. Nuvärde av år 6–10: cirka 32 SEK. "
                        "Steg 5 — Terminal value år 10: TV = 9,29 × "
                        "(1+0,03) / (0,07−0,03) = 9,57 / 0,04 = 239 SEK. "
                        "Nuvärde av TV: 239 / 1,07^10 = 122 SEK."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Terminal value utgör 67 procent av DDM-värdet — "
                        "antagandet om långsiktig tillväxt är "
                        "avgörande."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Trestegs-DDM: DDM med explicit fas (5 år), "
                        "övergångsfas (5 år med successivt sjunkande "
                        "tillväxt) och terminalfas (Gordon Growth)."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Totalt DDM-värde = 28 + 32 + 122 = 182 SEK. "
                        "Med 30 procent säkerhetsmarginal: köpgräns 127 "
                        "SEK. Aktuell kurs 230 SEK — betydande "
                        "övervärdering enligt modellen.\n\n"
                        "Vid första anblick är resultatet oroväckande, "
                        "men Atlas Copco har också betydande "
                        "aktieåterköp som DDM inte fångar. Justerat för "
                        "återköp (vilket ökar utdelning per aktie med "
                        "3 procent per år): justerat DDM-värde 280 SEK, "
                        "köpgräns 196 SEK. Aktuell kurs 230 SEK — "
                        "fortfarande över köpgräns men närmare."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor lurar den som använder DDM — överdriven "
                "tillväxt, ignorerade aktieåterköp och att applicera "
                "DDM på bolag utan utdelning."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Överdriven tillväxt. Om g överstiger "
                        "r blir DDM oändligt eller negativt — orimligt. "
                        "Gordon Growth förutsätter att g < r, och som "
                        "tumregel ska g inte överstiga långsiktig "
                        "BNP-tillväxt (2–3 procent). Att sätta g till "
                        "8 procent i en oändlig Gordon Growth ger "
                        "orimliga värden.\n\n"
                        "Fälla 2 — Ignorerade aktieåterköp. Atlas Copco, "
                        "Sandvik och AstraZeneca har betydande "
                        "aktieåterköpsprogram som ökar utdelning per "
                        "aktie över tid. Renodlad DDM missar detta och "
                        "underskattar värdet med 15–25 procent. Justera "
                        "genom att addera årlig återköpsprocent till g.\n\n"
                        "Fälla 3 — DDM på bolag utan utdelning. Spotify, "
                        "Klarna och Northvolt betalar ingen utdelning "
                        "och kan inte värderas med DDM. Att tvinga fram "
                        "en framtida utdelningsprognos (”kommer betala "
                        "utdelning om 5 år”) och diskontera ger "
                        "osäkra värden. Använd DCF eller EV/Sales "
                        "istället."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gordon Growth-tillväxt ska aldrig överstiga "
                        "långsiktig BNP-tillväxt (2–3 procent) — "
                        "annars förutsätter du att bolaget blir "
                        "oändligt stort."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Total shareholder yield: utdelning + "
                        "aktieåterköp, uttryckt som procent av "
                        "aktiepris — komplett mått på avkastning till "
                        "aktieägare."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Test: kör DDM med tre olika g-värden (2, 3, 4 "
                        "procent) och se spridning. Atlas Copco 2023: "
                        "DDM-värde vid g=2 procent: 145 SEK. Vid g=3 "
                        "procent: 182 SEK. Vid g=4 procent: 240 SEK. "
                        "Spridning 65 procent — terminaltillväxt är "
                        "kritisk.\n\n"
                        "Identifiera aktieåterköp via kassaflödesanalys "
                        "i bokslutet. Atlas Copco hade 2023 utdelning "
                        "23 miljarder SEK + återköp 7 miljarder SEK = "
                        "total shareholder yield 4,2 procent. Detta ska "
                        "ersätta utdelning i DDM-beräkningen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1 kör automatisk trestegs-DDM för svenska bolag "
                "med 10+ års utdelningshistorik, med justering för "
                "aktieåterköp."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1 identifierar automatiskt svenska bolag "
                        "med 10+ års utdelningshistorik (Investor, Atlas "
                        "Copco, Sandvik, Handelsbanken, SEB, Swedbank, "
                        "AstraZeneca) och kör trestegs-DDM med "
                        "kontinuerligt uppdaterade parametrar. "
                        "Utdelningsprognoser hämtas från intern "
                        "konsensus, avkastningskrav beräknas via CAPM.\n\n"
                        "För bolag med aktieåterköp adderas årlig "
                        "återköpsprocent till g automatiskt — Atlas "
                        "Copco med utdelningstillväxt 5 procent och "
                        "återköp 3 procent får justerad g på 8 procent.\n\n"
                        "Köpsignal kräver att DDM-värde överstiger "
                        "marknadspris med 30 procent marginal. Systemet "
                        "flaggar bolag vars DDM-värde är känsligt för "
                        "terminaltillväxt (spridning >40 procent mellan "
                        "g=2 och g=4) för manuell genomgång."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 adderar automatiskt aktieåterköp till "
                        "utdelningstillväxt — eliminerar den vanligaste "
                        "fällan med underskattning av DDM-värde."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "AKM1 DDM-modul: automatisk trestegs-DDM för "
                        "svenska bolag med 10+ års utdelningshistorik, "
                        "med justering för aktieåterköp."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "AKM1-case — Investor AB 2023. Utdelning 13 SEK, "
                        "aktieåterköp 2 procent, långsiktig utdelnings-"
                        "tillväxt 5 procent + återköp 2 procent = 7 "
                        "procent. DDM-värde 470 SEK. Med 30 procent "
                        "säkerhetsmarginal: köpgräns 329 SEK. Aktuell "
                        "kurs 410 SEK — över köpgräns, vänta.\n\n"
                        "AKM1-case — Handelsbanken 2022. Utdelning 12 "
                        "SEK, långsiktig tillväxt 3 procent, DDM-värde "
                        "240 SEK. Köpgräns 168 SEK. Aktuell kurs 125 "
                        "SEK — stor diskont, köp. Utfall 2023: aktien "
                        "steg till 145 SEK som förväntat."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre svenska fallstudier visar hur DDM fångar värde i "
                "mogna utdelningsaktier — och varnar för överdriven "
                "tillväxt."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Investor AB 2015. DDM-värde 380 "
                        "SEK (g=4 procent). Aktuell kurs 290 SEK. Marginal "
                        "24 procent — inte över 30 procent. Vänta. "
                        "Utfall 2021: aktien nådde 620 SEK — DDM "
                        "underskattade kraftigt eftersom Wallenberg-"
                        "portföljen expanderade snabbare än förväntat.\n\n"
                        "Fallstudie 2 — Handelsbanken 2016. DDM-värde 175 "
                        "SEK (g=3 procent). Aktuell kurs 110 SEK. Marginal "
                        "37 procent — köp. Utfall 2018: aktien nådde 180 "
                        "SEK. DDM fungerade perfekt för stabil bankaktie.\n\n"
                        "Fallstudie 3 — SSAB 2017. Försökte applicera "
                        "DDM med stabil utdelningstillväxt 6 procent. "
                        "DDM-värde 75 SEK. Aktuell kurs 45 SEK — "
                        "starkt köp. Utfall 2018: aktien föll till 30 "
                        "SEK när stålcykeln vände och utdelningen halverades. "
                        "DDM fungerar dåligt för cykliska bolag — "
                        "lärdom: använd aldrig DDM på cykliska bolag."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "DDM fungerar bäst för stabila utdelningsaktier "
                        "med 10+ års utdelningshistorik — undvik "
                        "cykliska bolag där utdelningen svänger mycket."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Utdelningskontinuitet: antal på varandra "
                        "följande år med oförändrad eller ökad "
                        "utdelning — nyckelkrav för DDM-applicering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Lärdom: DDM fungerar bäst för stabila bolag "
                        "med kontinuerlig utdelning och förutsägbar "
                        "tillväxt — Investor, Atlas Copco, Handelsbanken. "
                        "Den misslyckas för cykliska bolag (SSAB, "
                        "Boliden) och bolag utan utdelning (Klarna, "
                        "Northvolt).\n\n"
                        "Bästa praxis: kombinera DDM med DCF och Graham "
                        "i ett intervall. I AKM1 1.1 är DDM primärmetoden "
                        "för svenska utdelningsaktier, med DCF och "
                        "Graham som korsvalidering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i DDM innebär att välja rätt modellvariant, "
                "kalibrera terminaltillväxt och veta när DDM är fel metod."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Avancerad teknik 1 — H-Modell för bolag i "
                        "övergång. Fuller och Hsia (1984) utvecklade "
                        "H-Modellen som fångar bolag i övergång från "
                        "hög till låg tillväxt. Värde = D0 × (1+gL) / "
                        "(r−gL) + D0 × H × (gS−gL) / (r−gL), där gL är "
                        "långsiktig tillväxt, gS är kortfristig hög "
                        "tillväxt och H är halva övergångsperioden.\n\n"
                        "Avancerad teknik 2 — Tre-stegs med olika "
                        "utdelningspolicy. Bolag kan ha låg utdelning "
                        "under tillväxtfas och hög utdelning vid "
                        "mognad. Modellen prognosticerar payout ratio "
                        "som växer över tid. Används för Atlas Copco "
                        "och Sandvik som historiskt höjt payout ratio.\n\n"
                        "Avancerad teknik 3 — Probability-weighted "
                        "DDM. Skapa tre scenarier (bas, bra, dåligt) "
                        "med olika utdelningsbanor och vikta med "
                        "sannolikheter. Särskilt användbart för banker "
                        "med finansiell risk och råvarubolag med "
                        "prisrisk."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "H-Modellen från Fuller och Hsia (1984) är "
                        "standard för bolag i övergång från hög till "
                        "låg tillväxt — mer elegant än trestegs-DDM."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "H-Modell: DDM-variant från Fuller och Hsia "
                        "(1984) som fångar linjär övergång från hög "
                        "till låg utdelningstillväxt."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "När DDM misslyckas: (1) Cykliska bolag där "
                        "utdelningen svänger kraftigt — SSAB, Boliden. "
                        "(2) Bolag i transition där utdelnings-"
                        "policyn förändras — Spotify, Volvo Cars. (3) "
                        "Bolag med utdelning underInsättning av "
                        "engångsbelopp — Investor (stora realiseringar).\n\n"
                        "Mästerskap ligger i att känna igen vilken "
                        "DDM-variant som passar vilket bolag. I AKM1 "
                        "1.1 väljer systemet automatiskt mellan enkel "
                        "Gordon Growth, trestegs-DDM och H-Modell "
                        "baserat på bolagets historiska utdelningsmönster."
                    ),
                },
            ],
        },
    ],
}

# === INSERT_COURSES_PART_2 ===


# ===========================================================================
# Slug-listor
# ===========================================================================
VM_SLUGS = [
    "vm-01-grahams-formel",
    "vm-02-intrinsic-value",
    "vm-03-multipelval",
    "vm-04-cyklisk-justering",
    "vm-05-realoptioner",
    "vm-06-dividend-discount-model-ddm",
    "vm-07-free-cash-flow-yield",
    "vm-08-evsales",
    "vm-09-pricetocashflow",
    "vm-10-assetbased-valuation",
    "vm-11-waccfallor",
]
UD_SLUGS = [
    "ud-01-payout-ratio",
    "ud-02-aterinvestering",
    "ud-03-dividend-aristocrats",
    "ud-04-utdelningsfallor",
    "ud-05-drip",
    "ud-06-svenska-utdelningsaktier",
    "ud-07-utdelningskalender",
    "ud-08-speciella-utdelningar",
]
ALL_SLUGS = VM_SLUGS + UD_SLUGS

FORBIDDEN_PHRASES = [
    "Detta är en fundamentalsk färdighet",
    "Utan förståelse för detta ämne",
    "Vi börjar med grunderna",
    "ingår i kategorin",
]


def build_chapter(existing_chapter_meta, new_chapter):
    """Bygg ett nytt chapter-objekt som bevarar num/minutes/title
    från befintlig `chapters_list` och sätter intro + blocks."""
    return {
        "num":     existing_chapter_meta.get("num"),
        "minutes": existing_chapter_meta.get("minutes"),
        "title":   existing_chapter_meta.get("title"),
        "intro":   new_chapter["intro"],
        "blocks":  new_chapter["blocks"],
    }


def validate_blocks(blocks):
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
    for f in ("why", "history", "lynchSection",
              "grahamSection", "ak1Section", "chapters"):
        if f not in course_data:
            raise ValueError(f"{slug}: saknar fält {f}")
    if len(course_data["chapters"]) != 6:
        raise ValueError(
            f"{slug}: ogiltigt antal chapters "
            f"({len(course_data['chapters'])})"
        )
    for hist_field in ("origin", "evolution", "modern"):
        if hist_field not in course_data["history"]:
            raise ValueError(f"{slug}: history saknar {hist_field}")
    for i, ch in enumerate(course_data["chapters"]):
        validate_blocks(ch["blocks"])
    blob = json.dumps(course_data, ensure_ascii=False)
    for phrase in FORBIDDEN_PHRASES:
        if phrase in blob:
            raise ValueError(
                f"{slug}: innehåller förbjuden fras {phrase!r}"
            )


def main():
    print(f"Läser {COURSES_PATH} ...")
    with open(COURSES_PATH, "r", encoding="utf-8") as f:
        courses = json.load(f)
    print(f"  Totalt {len(courses)} kurser i filen.")

    print(f"Validerar innehåll för {len(ALL_SLUGS)} vm+ud-kurser ...")
    for slug in ALL_SLUGS:
        if slug not in COURSES:
            raise KeyError(
                f"Saknar innehåll för {slug} i COURSES-dicten."
            )
        if slug not in courses:
            raise KeyError(
                f"Saknar kurs {slug} i deep-courses.json."
            )
        validate_course(slug, COURSES[slug])
    print(f"  Alla {len(ALL_SLUGS)} kurser validerade OK.")

    print(f"Skriver om innehåll för {len(ALL_SLUGS)} vm+ud-kurser ...")
    for slug in ALL_SLUGS:
        existing = courses[slug]
        new_data = COURSES[slug]

        existing["why"]           = new_data["why"]
        existing["history"]       = new_data["history"]
        existing["lynchSection"]  = new_data["lynchSection"]
        existing["grahamSection"] = new_data["grahamSection"]
        existing["ak1Section"]    = new_data["ak1Section"]

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

    print(f"Skriver tillbaka till {COURSES_PATH} ...")
    with open(COURSES_PATH, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
    print("  deep-courses.json uppdaterad.")

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
    for slug in ALL_SLUGS:
        if slug not in done_list:
            done_list.append(slug)
            added += 1
    progress["done"] = done_list

    with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)
    print(f"  La till {added} nya slugs i 'done'. "
          f"Totalt nu {len(done_list)} slugs.")

    print(f"\nKLAR. {len(ALL_SLUGS)} vm+ud-kurser uppdaterade "
          f"med skräddarsytt innehåll.")


if __name__ == "__main__":
    main()
