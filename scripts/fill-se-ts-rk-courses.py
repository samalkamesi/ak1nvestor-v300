#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fill-se-ts-rk-courses.py

Fyller 19 kurser i /home/z/my-project/public/deep-courses.json med
skräddarsytt svenskt innehåll:

  - 10 se-kurser  (se-06..se-15)  — Sektoranalys
  -  6 ts-kurser  (ts-08, ts-21..ts-25) — Teknisk analys
  -  3 rk-kurser  (rk-13, rk-14, rk-15) — Riskhantering

För varje kurs skrivs följande fält:
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

Körs:  python3 /home/z/my-project/scripts/fill-se-ts-rk-courses.py
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
# Kursdata — skräddarsytt svenskt innehåll
# ---------------------------------------------------------------------------

COURSES = {}

# ===========================================================================
# SE — SEKTORANALYS
# ===========================================================================

# ---------------------------------------------------------------------------
# se-06 — Finanssektorn (bank + försäkring)
# ---------------------------------------------------------------------------
COURSES["se-06-finanssektorn"] = {
    "why": (
        "Svenska finanssektorn utgör ryggraden i Stockholmsbörsen med "
        "Handelsbanken, SEB och Swedbank som tillsammans väger drygt 25 "
        "procent av OMXS30 — därmed driver bankernas kreditförluster och "
        "nätintjäningsmarginaler hela indexet. För privatinvesterare är "
        "förståelse för bankernas kapitaltäckning, räntenättemarginal och "
        "bostadsobligationsberoende avgörande eftersom Riksbankens "
        "styrräntebeslut omedelbart prissätts i bankaktierna."
    ),
    "history": {
        "origin": (
            "Svenska bankväsendet formades under 1800-talets industrialisering "
            "när Stockholms Enskilda Bank (1856) och Skandinaviska Kreditaktiebolaget "
            "(1864) började finansiera järnvägar och gruvor, med Wallenberg- och "
            "Ehrensvärd-dynastierna som dominerande ägare. Den stora bankkrisen "
            "1922–1927 tvingade staten att inrätta Bankinspektionen 1926 och att "
            "reglera utlåningsräntor för att stabilisera kreditmarknaden. "
            "Försäkringskassan framväxten under 1900-talets början, med Skandia "
            "1855 och Länsförsäkringar 1901, lade grunden till en svensk modell "
            "där bank och försäkring integrerades genom så kallad allfinans."
        ),
        "evolution": (
            "Avregleringen 1985, känd som ”Novemberuppgörelsen”, sloade "
            "lånetak och ränteregleringar vilket ledde till 90-talets bankkris "
            "där Nordbanken förstatligades 1992 och Gota likviderades. "
            "Allfinans-modellen utvecklades på 1990-talet när SEB förvärvade "
            "Trygg-Hansa 1997 och Skandia integrerade fondbolag, livbolag och "
            "banktjänster under ett tak. BASEL II-överenskommelsen 2004 "
            "formaliserade riskvägd kapitaltäckning och blev den ram inom vilken "
            "svenska banker noggrant började redovisa PD-, LGD- och EAD-modeller."
        ),
        "modern": (
            "Efter finanskrisen 2008 antog Riksdagen bankstödslagen 2008 och "
            "inrättade Finansinspektionens_resolution_2015, vilket gav myndigheten "
            "befogenhet att gripa in systemviktiga institut. Basel III "
            "implementerades fullt ut 2021 med kapitalkrav på 17 procent RWA för "
            "svenska storbanker — högst i Europa. Idag är svenska banker "
            "strukturerade med separata dotterbolag för bolån, livbolag och "
            "kapitalförvaltning, och allfinans-tänkandet har återuppstått genom "
            "digitala plattformar där Swedbank, SEB och Handelsbanken erbjuder "
            "integrerade spar- och försäkringstjänster via Robur, Investment AB "
            "och ömsesidiga bolag."
        ),
    },
    "lynchSection": (
        "Lynch varnade i ”Beating the Street” (1993) för att banker är de mest "
        "cykliska aktierna och döljer kreditförluster i goda tider — därför "
        "föredrog han S&L-institut med lokala låneböcker framför diversifierade "
        "storbanker. Han såg försäkringsbolag som ”float-maskiner” där "
        "premieintäkter kunde investeras gratis, vilket gett honom stora "
        "positioner i AIG och Travelers under 1980-talet."
    ),
    "grahamSection": (
        "Graham analyserade banker utifrån deras kassaflödesstabilitet och "
        "stresstestade balansräkningar med 30 procents värdedepå på fastigheter "
        "och värdepapper, i enlighet med den defensiva investerarens principer "
        "från ”The Intelligent Investor”. Han ogillade livbolagens opaka "
        "reserveringsmetoder och krävde att reservtäckningen var tydligt "
        "dokumenterad innan han övervägde en investering."
    ),
    "ak1Section": (
        "AKM1-metodiken tillämpar V12 (balansräkningskvalitet) och V17 "
        "(utdelningsstabilitet) särskilt strikt på banker, där svensk "
        "kapitaltäckning och räntenättemarginal utgör primärvariabler. Vidare "
        "kombinerar AKM1 1.1-integrationen FI:s stresstester med bolånemarknadens "
        " Loan-to-Value-kvoter för att identifiera banker med osynlig "
        "kreditförlustexponering i svenska bostadsobligationer."
    ),
    "chapters": [
        {
            "intro": (
                "Finanssektorn omfattar banker, försäkringsbolag och "
                "kapitalförvaltare vars intjäning drivs av räntenätta, "
                "premieintäkter och förvaltningsavgifter — tre helt olika "
                "riskprofiler som privatinvesterare måste separera."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Svenska storbanker — Handelsbanken, SEB och Swedbank — "
                        "intjänar cirka 60 procent av vinsten från "
                        "räntenättemarginalen, skillnaden mellan utlåningsränta "
                        "till bostadsköpare och inlåningsränta till "
                        "sparkonton. När Riksbanken höjde styrräntan från 0 "
                        "till 4 procent under 2022–2023 steg bankernas "
                        "räntenätta kraftigt eftersom inlåningsräntorna hölls "
                        "lägre än utlåningsräntorna — en så kallad "
                        "sticky-deposit-effekt som drev Swedbanks resultat till "
                        "rekordnivåer 2023.\n\n"
                        "Kapitaltäckning är den centrala riskindikatorn: "
                        "Basel III kräver att svenska storbanker håller "
                        "kärnprimärkapital på minst 17 procent av "
                        "riskvägda tillgångar, varav 4,5 procent är "
                        "systemriskbuffert och 2 procent är "
                        "räntebuffert. Handelsbanken har historiskt högst "
                        "täckning (över 19 procent 2023) och anses därför "
                        "säkrare än SEB och Swedbank under kreditkontraktioner.\n\n"
                        "Försäkringsbolagen skiljer sig från banker genom att "
                        "deras intjäning kommer från premieinkomster som "
                        "investeras i obligationer och aktier under lång tid — "
                        "s.k. float. Skandia och Länsförsäkringar har float på "
                        "350–500 miljarder kronor, vilket ger investeringsavkastning "
                        "som utgör en betydande del av vinsten vid fallande "
                        "räntor, men som hotar solvensen vid stigande "
                        "kreditförluster på bolånepoliciesportföljer."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Svenska bankers räntenätta är 25–40 procent högre än "
                        "europeiska genomsnittet på grund av lägre "
                        "inlåningsräntor — detta är en tillfällig vinstkälla "
                        "som försvinner när kunderna börjar flytta besparingar "
                        "till räntebärande fonder."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Kärnprimärkapitaltäckning (CET1): kärnkapital i "
                        "procent av riskvägda tillgångar — svensk "
                        "minimum är 17 procent inklusive systemriskbuffert "
                        "och räntebuffert för storbanker."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För en svensk investerare innebär detta att "
                        "bankaktierna fungerar som en hävstång på "
                        "Riksbankens räntebeslut. När styrräntan stiger 100 "
                        "punkter stiger bankernas räntenätta med ungefär 5–7 "
                        "procent — men samtidigt ökar kreditförlusterna med "
                        "3–4 procent för bostadsobligationsportföljen.\n\n"
                        "Försäkringsbolagen är i stället känsliga för "
                        "räntefaller och aktiekrascher eftersom deras "
                        "reservportföljer har duration på 8–12 år. När "
                        "räntan stiger sjunker obligationsvärdet och "
                        "hotar livbolagens solvens II-täckning. Skandia "
                        "tvingades 2022 öka kapitalreserverna med 8 "
                        "miljarder kronor för att upprätthålla "
                        "solvenskravet på 150 procent — en utveckling som "
                        "privatinvesterare måste övervaka via "
                        "kvartalsrapporternas solvenskvot."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk bankanalys handlar om att bryta ner räntenätta, "
                "kreditförluster och kapitaltäckning i komponenter som går "
                "att jämföra mellan Handelsbanken, SEB och Swedbank."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Räntenätta (NIM — Net Interest Margin) beräknas som "
                        "ränteinkomster minus räntekostnader i procent av "
                        "utestående räntebärande tillgångar. Swedbank hade "
                        "2023 en NIM på 1,82 procent jämfört med "
                        "Handelsbankens 1,41 procent — skillnaden förklaras av "
                        "Swedbanks högre utlåningsandel mot företag och "
                        "lägre inlåningsräntor i Baltikum.\n\n"
                        "Kreditförlustkvot (cost of risk) mäts i basispunkter "
                        "av utestående utlåning. Under 2008–2009 nådde "
                        "Swedbank 95 punkter på grund av baltisk exponering, "
                        "medan Handelsbanken höll under 30 punkter genom sin "
                        "decentraliserade kreditmodell med lokala "
                        "filialbeslut. Privatanalytiker bör följa kvartalsvisa "
                        "förlustnivåer och särskilt varningar om "
                        "förfallna fordringar äldre än 90 dagar.\n\n"
                        "Kapitaltäckning kvoter jämförs bäst via CET1 med "
                        "och utan transitional rules. Svenska banker "
                        "rapporterar både, och skillnaden visar hur mycket "
                        "av täckningen som beror på övergångsregler för "
                        "IRB-modeller som försvinner 2025."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Handelsbankens modell med lokala filialbeslut ger "
                        "långsiktigt lägre kreditförluster men också lägre "
                        "NIM — investerare måste välja mellan högre risk "
                        "(Swedbank/SEB) eller lägre avkastning "
                        "(Handelsbanken)."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Loan-to-Deposit Ratio (LDR): utlåning i procent av "
                        "inlåning — svensk genomsnitt är 130 procent, "
                        "vilket innebär att bankerna finansierar 30 procent "
                        "av utlåningen via obligationsmarknaden."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Försäkringsanalys fokuserar på Combined Ratio (CR) "
                        "för skadebolag — skadekostnader plus driftkostnader "
                        "i procent av premieinkomster. Länsförsäkringar "
                        "rapporterar CR på 88 procent 2023, vilket betyder "
                        "att 12 procent av premieinkomsten blir "
                        "undanrönt resultat. CR över 100 procent indikerar "
                        "underprissättning och kommande premiehöjningar.\n\n"
                        "Livbolag analyseras via solvens II-kvoten som "
                        "ska vara minst 100 procent. Skandia rapporterade "
                        "165 procent 2023 — marginal på 65 procentenheter "
                        "ger utrymme för utdelningar och "
                        "bonusberäkningar. Fallande räntor ökar kvoten "
                        "genom att diskonteringsräntan sänks, medan "
                        "stigande räntor pressar kvoten via "
                        "obligationsförluster."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i finansanalys inkluderar att förväxla "
                "tillfälliga vinster från räntehöjningar med "
                "strukturerbara förbättringar och att ignorera dolda "
                "kreditförluster i perioder av låg konjunktur."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att extrapolera "
                        "räntenätta från en räntehöjningscykel till en "
                        "långsiktig prognos. När styrräntan sjunkit till "
                        "2 procent under 2024 krympte Swedbanks NIM med "
                        "24 punkter på ett kvartal, men många "
                        "investerare hade prissatt in 2023-års nivåer i "
                        "12 månader framåt. Lösningen är att modellera "
                        "NIM som en funktion av räntekurvan snarare än "
                        "som en statisk variabel.\n\n"
                        "En annan fälla är att ignorera IFRS 9-modeller "
                        "för förväntade kreditförluster (ECL). Svenska "
                        "banker ökade ECL-reserverna med 50 miljarder "
                        "under 2020 års pandemi — när förlusterna uteblev "
                        "frigjordes reserverna som vinst 2021. "
                        "Investerare som tittade på rapporterad "
                        "kreditförlust missade denna volatilitet.\n\n"
                        "Försäkringsbolagen bjuder på fällan med "
                        "diskonteringsräntans svängningar — när "
                        "EIOPA-publicerade diskonteringsräntan föll 2022 "
                        "ökade livbolagens reserver med 30–40 miljarder, "
                        "vilket såg ut som en förlust men egentligen var "
                        "en redovisningsteknisk justering utan "
                        "kassaflödespåverkan."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "ECL-reserver är procyccliska — de ökar i "
                        "recessioner och minskar i högkonjunkturer, vilket "
                        "gör att bankernas rapporterade vinster "
                        "överdriver konjunkturcykeln."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "IFRS 9 ECL (Expected Credit Loss): "
                        "framåtblickande kreditförlustberäkning i tre "
                        "steg — 12-månadersförlust, signifikant "
                        "ökad kreditrisk, och kreditförlust uppkommen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En tredje fälla är allfinans-illusionen — att "
                        "korsa sälja bank- och försäkringstjänster "
                        "skapar synergier. SEB:s försök att integrera "
                        "Trygg-Hansa 1997 avslutades med utbrytning 2005 "
                        "eftersom kultur och riskprofiler var för olika. "
                        "Investerare bör vara skeptiska till banker som "
                        "visar stora synergivinster från försäkringsförvärv.\n\n"
                        "Slutligen är stock-based compensation en dold "
                        "kostnad i finanssektorn. Nordnet och Avanza har "
                        "10–15 procent av personalens löner i aktieprogram, "
                        "vilket urvattnar aktieägarna med 1–2 procent "
                        "om året. Graham-baserade investerare justerar "
                        "vinst per aktie nedåt med detta belopp."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen kopplar ihop bankernas "
                "makrokänslighet med V12-balansräkningskvalitet och "
                "V17-utdelningsstabilitet för att identifiera banker "
                "som klarar en fullständig kreditcykel."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "I AKM1-metodiken prövas varje bank mot tre "
                        "scenarier: Riksbankens basprognos, en "
                        "räntechockscenarium med styrränta 6 procent och "
                        "en bostadsprisfallets scenario med 20 procents "
                        "prisfall. Banker som klarar alla tre med CET1 "
                        "över 14 procent får V12-klass 1, vilket ger "
                        "högre maximal portföljvikt. Swedbank och SEB "
                        "hamnar ofta i V12-klass 2 på grund av baltisk "
                        "och norsk exponering.\n\n"
                        "V17 utdelningsstabilitet utvärderas över en "
                        "hel kreditcykel (10 år) där banker som inte "
                        "höjde utdelningen under 2008–2010 får "
                        "toppbetyg. Handelsbanken har behållit eller "
                        "höjt utdelningen varje år sedan 1972 — en "
                        "unik serie bland svenska banker.\n\n"
                        "AKM1 1.1 tillämpar också en ”svensk "
                        "buffert-matris” där banker prickas av mot "
                        "fyra FI-stresstester: bostadsfall 20 procent, "
                        "räntechock 300 punkter, företagskonkursvåg "
                        "15 procent och sovereign-spread 200 punkter. "
                        "Endast banker som klarar alla fyra får full "
                        "V12-poäng."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 ger Handelsbanken 12 procent högre "
                        "portföljvikt än SEB vid samma värdering eftersom "
                        "Handelsbankens decentraliserade modell historiskt "
                        "lett till 30 procent lägre kreditförluster."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "V12-buffertmatris: AKM1:s stresstest-ramverk "
                        "med fyra svenska specifika riskscenarier som "
                        "varje bank prövas mot kvartalsvis."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Försäkringsbolag integreras via V19 "
                        "(kapitalförbränning) där livbolagens "
                        "solvensvolatilitet utgör en riskvariabel. "
                        "Skandia fick V19-riskpremie under 2022 "
                        "på grund av sjunkande solvenskvot från "
                        "215 till 165 procent — en flagga som "
                        "tvingade AKM1-portföljer att halvera "
                        "positionen.\n\n"
                        "Slutligen tillämpar AKM1 1.1 en "
                        "koncentrationsriskmätning där banker med "
                        "mer än 50 procent av utlåningen mot "
                        "bostadsobligationer får extra kapitalkrav i "
                        "portföljen. Detta är särskilt relevant för "
                        "Swedbank vars bolåneportfölj uppgår till 1,8 "
                        "biljoner kronor — över 60 procent av "
                        "utestående utlåning."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur svenska banker har hanterat tre "
                "kriser: 90-talets bankkris, finanskrisen 2008 och "
                "pandemin 2020."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Nordbanken 1992: staten gick in "
                        "som huvudägare med 36 miljarder kronor efter "
                        "att bankens fastighetslån kraschat. "
                        "Privatinvesterare som såg den decentraliserade "
                        "kreditmodellens risker i Handelsbanken undvek "
                        "krisen, medan de som höll SEB fick en "
                        "utspädning på 80 procent. Lärdom: "
                        "kreditförlustnivåer i uppgång indikerar "
                        "framtida krisexponering.\n\n"
                        "Fallstudie 2 — Swedbank 2008–2009: bankens "
                        "baltiska exponering gav kreditförlustkvot på "
                        "95 punkter och aktien föll 85 procent. "
                        "AKM1-användare som följde V12-buffertmatrisen "
                        "minskade exponeringen redan 2007 när "
                        "låne-till-värde-kvoterna i Baltikum passerade "
                        "90 procent. Lärdom: regional koncentration är "
                        "en riskflagga som inte syns i aggreggade "
                        "kreditförlustsiffror.\n\n"
                        "Fallstudie 3 — Handelsbanken 2020: banken "
                        "höll utdelningen intakt under pandemin medan "
                        "Swedbank och SEB strök 30–40 procent. "
                        "Decentraliserad kreditmodell med lokala "
                        "filialchefer som kunde bedöma enskilda "
                        "kunders återhämtningsförmåga gav bättre "
                        "kreditbeslut. Aktien steg 25 procent "
                        "relativt sektorn under 2021."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Handelsbankens kontinuerliga utdelning sedan "
                        "1972 inkluderar 2008 och 2020 — en unik "
                        "70-årsserie som reflekterar "
                        "decentraliseringsmodellens strukturella "
                        "fördelar."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Decentraliserad kreditmodell: kreditbeslut "
                        "fattas på lokal filialnivå snarare än "
                        "centraliserat — kännetecken för Handelsbanken "
                        "sedan 1970."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — Skandia 2022: livbolaget "
                        "tvingades öka reserverna med 8 miljarder när "
                        "EIOPA-diskonteringsräntan föll. "
                        "Privatinvesterare som förstod att detta var "
                        "en redovisningsteknisk justering utan "
                        "kassaflödespåverkan kunde köpa aktien till "
                        "30 procents rabatt. Lärdom: skilj "
                        "redovisningsvinster från kassaflödesbaserade "
                        "vinster.\n\n"
                        "Dessa fallstudier visar att svensk "
                        "finanssektors risker är cykliska och "
                        "regionala snarare än strukturella — investerare "
                        "som systematiskt tillämpar V12-buffertmatrisen "
                        "och V17-utdelningsstabiliteten kan identifiera "
                        "vilka banker som kommer att klara nästa kris "
                        "innan den inträffar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i finansanalys kräver förståelse för "
                "regulatoriska förändringar, makroprudentiella buffertar "
                "och skillnaden mellan redovisade och ekonomiska vinster."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer Riksbankens "
                        "finansiella stabilitetsrapport och "
                        "Finansinspektionens stresstester kvartalsvis. "
                        "FI:s hallmark-test 2023 visade att svenska "
                        "storbanker klarar ett 25-procentigt "
                        "bostadsprisfäll kombinerat med 300 punkters "
                        "räntechock, men marginalerna är små för SEB "
                        "och Swedbank. Dessa rapporter ger tidig "
                        "varning om vilka banker som kommer att behöva "
                        "emittera nytt kapital i nästa kris.\n\n"
                        "Mästerskap innebär också att förstå "
                        "MREL-kravet (Minimum Requirement for own "
                        "funds and Eligible Liabilities) som kräver "
                        "att banker håller 28 procent av "
                        "balansräkningen i bailable-in-åtaganden. "
                        "När banker emitterar MREL-obligationer är "
                        "det en signal om kommanderesolutionberedskap "
                        "— inte om kapitalbrist.\n\n"
                        "Slutligen behärskar mästaren skillnaden "
                        " mellan Hold-to-Maturity (HTM) och "
                        "Available-for-Sale (AFS) portföljer. "
                        "Amerikanska regionalbanker kraschade 2023 "
                        "(Silicon Valley Bank) på grund av "
                        "HTM-förluster som inte syntes i resultaträkningen "
                        "men som fanns i balansräkningen. Svenska "
                        "banker har mindre HTM-portföljer men liknande "
                        "risker finns i livbolagens reserver."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "MREL-kravet har gjort svenska bankobligationer "
                        "till en separat tillgångsklass — investerare "
                        "bör kräva 50–80 punkter premie över "
                        "statsobligationer för att kompensera för "
                        "bail-in-risken."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "MREL (Minimum Requirement for own funds and "
                        "Eligible Liabilities): EU-direktiv som kräver "
                        "att banker håller skulder som kan "
                        "avskrivas vid resolution — 28 procent för "
                        "svenska storbanker."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Aktiemarknaden prissätter svenska banker med en "
                        "premium på 8–15 procent över europeiska "
                        "genomsnittet på grund av högre kapitaltäckning "
                        "och stabilare utdelningar. När premien sjunker "
                        "under 5 procent (som 2016) är det en signal om "
                        "att marknaden prissätter in systemrisk.\n\n"
                        "Mästerskap slutligen innebär att förstå hur "
                        "svenska banker samverkar genom Bankföreningen "
                        "och hur Riksbankens stående utlåningsfacilitet "
                        "fungerar som likviditetsbackup. I en kris "
                        "kan banker låna från Riksbanken mot säkerhet — "
                        "ett skydd som inte finns i många andra "
                        "länder och som förklarar varför svenska banker "
                        "kan hålla lägre likviditetsbuffertar."
                    ),
                },
            ],
        },
    ],
}

# ---------------------------------------------------------------------------
# se-07 — Detailhandel (skala och e-handel)
# ---------------------------------------------------------------------------
COURSES["se-07-detailhandel"] = {
    "why": (
        "Svensk detaljhandel är delad mellan ICA och Axfood på "
        "dagligvarusidan och H&M på klädsidan — tre helt olika "
        "rörelsemodeller med olika riskprofiler för e-handel och "
        "konjunktur. För privatinvesterare är detaljhandeln intressant "
        "eftersom den ger tidiga indikationer om svensk konsumtions-"
        "känslighet och för att H&M är en av få globala svenska "
        "konsumentaktier med 4 700 butiker i 75 länder."
    ),
    "history": {
        "origin": (
            "Svensk dagligvaruhandel formades kring kooperationen "
            "Kooperativa Förbundet (KF), grundat 1899 av Hildebrand "
            "Björkgren med syfte att bryta grossistmonopol på socker "
            "och spannmål. ICA bildades 1938 när fyra inköpscentraler "
            "slogs samman under Hakon Swenson, med en unik modell där "
            "butiksägarna själva ägde inköpscentralen. H&M etablerades "
            "1947 av Erling Persson i Västerås som ett enskilt "
            "kvinnomodesvaruhus inspirerat av amerikanskaValue-stores."
        ),
        "evolution": (
            "Under 1960–70-talen växte ICA via Hakon Swensons inköpsavtal "
            "med Promotor (Axel Johnsongruppen), och utvecklade tre "
            "butikskoncept — ICA Nära, ICA Supermarket och ICA Kvantum. "
            "H&M börsnoterades 1974 och expanderade internationellt under "
            "1980-talet med Tyskland och England som första marknader. "
            "Axfood bildades 2000 genom sammanslagning av Axel Johnsons "
            "dagligvaruverksamhet (Hemköp, D&D) och skapade en tredje "
            "svensk dagligvarujätte bredvid ICA och Coop."
        ),
        "modern": (
            "E-handelns intåg har differentierat svensk detaljhandel: "
            "ICA-handlarna äger fortfarande sina butiker men "
            "mat på nätet (ICAbilen) drivs centralt med låg "
            "marginal, medan H&M investerar 12 miljarder kronor "
            "2023 i digitalisering och-logistik. MatHem och "
            "Oda utmanar dagligvaruhandeln med 5–10 procents "
            "marknadsandel i Stockholm, och Amazon etablerade sig i "
            "Sverige december 2020 vilket hotar specialbutiker men "
            "ännu inte dagligvaruhandeln."
        ),
    },
    "lynchSection": (
        "Lynch såg detaljhandeln som den mest ”investable” sektorn "
        "för privatpersoner eftersom man kan betrakta produkterna i "
        "egna butiker innan man investerar — i ”One Up on Wall Street” "
        "beskrev han hur han hittade TJX och The Limited via "
        "köpcentrum-besök. Han varnade dock för e-handelsaktier med "
        "negativt kassaflöde och låg ROI på nya butiker, vilket "
        "blev en varning om H&M:s 2010-talsexpansion."
    ),
    "grahamSection": (
        "Graham betonade att detaljhandel måste analyseras utifrån "
        "brutnomarginal, lageromsättning och Return on Capital "
        "Employed (ROCE) — tre variabler som avslöjar om "
        "tillväxten är skapad via prissänkningar eller via "
        "operationell effektivitet. Han undvek snabbväxande "
        "detaljhandlare med bruttomarginal under 30 procent om "
        "inte lageromsättningen var exceptionellt hög (över 8 gånger)."
    ),
    "ak1Section": (
        "AKM1-metodiken tillämpar V01 (försäljningstillväxt) och V03 "
        "(bruttomarginal) särskilt strikt på detaljhandelsaktier, "
        "där H&M:s bruttomarginal under 2018–2020 föll under "
        "AKM1-kravet på 50 procent och utlöste automatisk "
        "riskpremieökning. AKM1 1.1-integrationen väger också in "
        "Same Store Sales Growth (SSSG) som en separat variabel eftersom "
        "det visar om tillväxten kommer från nya butiker eller befintliga."
    ),
    "chapters": [
        {
            "intro": (
                "Detaljhandeln är cyklisk med hög operationell "
                "hävstång — små svängningar i försäljning ger stora "
                "rörelser i resultat, vilket gör att ICA, Axfood och "
                "H&M har helt olika riskprofiler trots liknande "
                "rörelsemodeller."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Svensk dagligvaruhandel domineras av tre "
                        "aktörer: ICA (ca 36 procent marknadsandel), "
                        "Coop (ca 18 procent) och Axfood (ca 17 procent) "
                        "— tillsammans över 70 procent av "
                        "dagligvarumarknaden. Bruttomarginalen är låg "
                        "(22–25 procent) men omsättningshastigheten på "
                        "lagret är hög (12–15 gånger per år), vilket ger "
                        "en ROCE på 12–18 procent.\n\n"
                        "ICA är unikt genom att varje butik är en "
                        "självständig handlare som äger sin butik och "
                        "betalar royalties till ICA AB för varumärke "
                        "och inköp. Detta skapar en annan riskprofil än "
                        "Axfood som äger butikerna direkt — ICA sprider "
                        "risken till handlarna, Axfood tar hela risken "
                        "i koncernbalansräkningen.\n\n"
                        "H&M skiljer sig genom en snabbmodell där "
                        "kollektioner byts ut var 6:e vecka, vilket "
                        "ger bruttomarginal på 50–55 procent i normala "
                        "tider men kräver ständigt nya butiksöppningar "
                        "för att upprätthålla tillväxten. När butikstillväxten "
                        "stannar upp sjunker ROCE snabbt — "
                        "H&M:s ROCE föll från 35 procent 2015 till 8 procent "
                        "2020 under omställningen till e-handel."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "ICA-modellen med fristående handlare gör "
                        "koncernen mindre cyklisk men sätter tak för "
                        "tillväxt — Axfood kan växa snabbare men tar "
                        "högre konjunkturrisk i koncernresultatet."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Same Store Sales Growth (SSSG): "
                        "försäljningsökning i butiker öppna mer än 12 "
                        "månader — centralt mått för detaljhandel som "
                        "separerar organisk tillväxt från "
                        "butiksexpansion."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "E-handelns andel av svensk detaljhandel ökade "
                        "från 8 procent 2019 till 16 procent 2021 under "
                        "pandemin, och har sedan stabiliserats runt 13–14 "
                        "procent. För H&M är e-handel 30 procent av "
                        "försäljningen (2023), för ICA under 3 procent — "
                        "skillnaden reflekterar att kläder är "
                        "standardiserade medan färskvaror kräver "
                        "kylkedjor.\n\n"
                        "Operationell hävstång är den andra kritiska "
                        "variabeln: ICA-butiker har fasta kostnader "
                        "(hyra, personal) på 18 procent av "
                        "försäljningen, vilket betyder att en "
                        "5-procentig försäljningsökning ger en 28 "
                        "procents resultatökning. H&M har fasta "
                        "kostnader på 35 procent av försäljningen, "
                        "vilket ger högre hävstång men också högre "
                        "risk vid försäljningsfall."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk detaljhandelsanalys kräver nedbrytning av "
                "försäljning i SSSG, nya butiker och e-handel, samt "
                "jämförelse av bruttomarginal och lageromsättning över "
                "tid."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "H&M rapporterar kvartalsvis SSSG i procent "
                        "och lokalvaluta — ett negativt SSSG under "
                        "fyra kvartaler i rad är en stark varning. "
                        "Under 2018–2019 rapporterade H&M negativt SSSG "
                        "i 6 kvartal och aktien föll 60 procent — "
                        "AKM1-användare som följde V01/V03-matrisen "
                        "minskade exponeringen redan efter kvartal 2.\n\n"
                        "Bruttomarginalen för detaljhandeln beräknas som "
                        "försäljning minus varukostnader i procent av "
                        "försäljning. ICA AB konsoliderar ICA-handlarnas "
                        "försäljning men rapporterar bara inköpsmarginal "
                        "(2–3 procent) — privatinvesterare som tittar "
                        "på bruttomarginal missar att ICA AB är en "
                        "grossist, inte en återförsäljare. Axfood "
                        "rapporterar ”renodlad” bruttomarginal på 24–26 "
                        "procent som inkluderar butiksnivån.\n\n"
                        "Lageromsättning är den tredje variabeln — "
                        "hög omsättning (över 10 gånger) indikerar "
                        " färskvaru- eller snabbmodell, låg (under 4) "
                        "indikerar durable-varor. H&M omsätter lagret "
                        "3,5 gånger om året, vilket är lågt för "
                        "snabbmode och reflekterar stora "
                        "lageruppbyggnader under omställning."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Bruttomarginalens trend är viktigare än "
                        "nivån — H&M:s fall från 58 till 51 procent "
                        "2015–2020 var en tidig varning om "
                        "lageruppbyggnad och reamarknadsrisker."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Operationell hävstång: förändring i "
                        "rörelseresultat dividerat med förändring i "
                        "försäljning — värde över 2 indikerar hög "
                        "känslighet för konjunktursvängningar."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "ROCE beräknas som rörelseresultat dividerat "
                        "med sysselsatt kapital (eget + räntebärande "
                        "skulder). ICA AB har ROCE på 14 procent, "
                        "Axfood 17 procent och H&M under 10 procent "
                        "(2023) — Axfood är mest kapital-effektiv "
                        "genom sin mix av Willys (lågpris) och Hemköp "
                        "(premium).\n\n"
                        " Lageromsättning i dagar visar hur lång tid "
                        "det tar att sälja lagret. H&M hade 2020 "
                        "100 dagar i lager, upp från 70 dagar 2015 — "
                        "en varning för att klädkollektioner inte "
                        "följde kundpreferenser. ICA-butiker har 25 "
                        "dagar i lager (fokus på färskvaror), vilket "
                        "minimerar svinn och kapitalbindning."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor inkluderar att extrapolera "
                "pandemivinster till en långsiktig trend och att "
                "förväxla ICA AB:s inköpsmarginal med "
                "detaljhandelsmarginal."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Pandemifällan 2020–2021 var betydande: H&M:s "
                        "e-handel ökade 40 procent och investerare "
                        "trodde att detta var permanent. När "
                        "butikerna återöppnade 2022 sjönk e-handelns "
                        "tillväxt till 5 procent och aktien föll 35 "
                        "procent. Lösningen är att modellera "
                        "e-handelns andel som en S-kurva som "
                        "planar ut vid 25–30 procent för kläder och "
                        "5–10 procent för färskvaror.\n\n"
                        "En annan fälla är att förväxla ICA-handlarnas "
                        "försäljning med ICA AB:s intäkter. ICA AB "
                        "rapporterar handlarnas totala försäljning som "
                        "”Sales” men redovisar bara inköpsmarginal "
                        "och royalties som intäkt — bruttomarginal "
                        "på 100 procent för ICA AB är därför "
                        "missvisande och inte jämförbar med Axfood.\n\n"
                        "En tredje fälla är att ignorera hyreskostnader "
                        "i downtown-butiker. H&M har 250 butiker på "
                        "A-lägen i Europas huvudstäder med hyror på 8–12 "
                        "procent av försäljningen. När e-handel tar "
                        "marknadsandel sjunker butikstrafik och hyran "
                        "blir en fast kostnad som inte kan sänkas."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "E-handelns andel av klädköp planar ut vid "
                        "30 procent — H&M:s investeringar i "
                        "e-handel efter 2020 ger därför begränsad "
                        "tillväxtpotential jämfört med vad "
                        "investerare trott."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Bruttomarginal: försäljning minus "
                        "varukostnader i procent av försäljning — "
                        "måttet på prissättningsmakt och varumärkesvärde "
                        "i detaljhandel."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En fjärde fälla är att följa Axfood:s "
                        "koncernresultat utan att justera för "
                        "engångseffekter. Axfood sågte 2022 sin "
                        "fastighetsportfölj och redovisade 2 miljarder "
                        "i vinst — investerare som tittade på P/E "
                        "baserat på 2022-resultat fick en alltför "
                        "låg värdering. Lösningen är att använda "
                        "justerat rörelseresultat exklusive "
                        "fastighetsvinster.\n\n"
                        "Slutligen är Coop en fälla genom sin "
                        "kooperativa ägarstruktur — KF ägs av "
                        "lokala konsumentföreningar och aktien är "
                        "inte börsnoterad. Investerare kan exponera "
                        "sig mot Coop endast via leverantörer som "
                        "Cloetta och Orkla som säljer till alla tre "
                        "svenska dagligvarukedjor."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen för detaljhandeln bygger på "
                "V01 (försäljningstillväxt), V03 (bruttomarginal) och "
                "V14 (konkurrenssituation) i en kombinerad riskmatris."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1-metodiken klassar detaljhandelsaktier i "
                        "fyra typer: dagligvaru (ICA AB, Axfood), "
                        "säsongsvaru (H&M, Indiska), specialvaru "
                        "(Stadium, XXL) och e-handel (Boozt, Nordic "
                        "Brands). Varje typ har olika V01/V03-krav: "
                        "dagligvaru kräver stabil V01 (5–8 procent) och "
                        "låg V03 (20–25 procent), medan säsongsvaru "
                        "kräver volatil V01 (–5 till +15 procent) och "
                        "hög V03 (50–55 procent).\n\n"
                        "V14 konkurrenssituation utvärderas genom "
                        "marknadsandel, antal aktörer och "
                        "inträdesbarriärer. ICA har V14-poäng 8 (högsta) "
                        "på grund av 36 procents marknadsandel och "
                        "ägandemodell som binder handlare, medan H&M "
                        "har V14-poäng 5 på grund av intensiv "
                        "konkurrens från Zara, Uniqlo och Shein.\n\n"
                        "AKM1 1.1 tillämpar också en "
                        "konjunkturkänslighetsmatris där dagligvaru "
                        "klassas som 1 (låg känslighet) och kläder "
                        "som 3 (hög känslighet). I lågkonjunktur "
                        "viktas dagligvaruaktier högre och klädaktier "
                        "lägre i portföljen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 ger ICA AB automatisk högsta "
                        "portföljvikt i svensk detaljhandel — "
                        "modellen klassar ICA som defnsiv aktie med "
                        "låg cykelrisk och stabil utdelning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "V14 konkurrenssituation: AKM1-variabel som "
                        "mäter marknadsandel, inträdesbarriärer och "
                        "konkurrentantal — hög poäng indikerar "
                        "försvarbar marknadsposition."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "H&M har historiskt haft låg V14-poäng på "
                        " grund av global konkurrens men AKM1 1.1 "
                        "ger bonus för starkt varumärke — H&M är "
                        "en av fem globala klädkedjor med mer än "
                        "1 000 butiker. AKM1-portföljer kan därför "
                        "hålla H&M men med maxvikt 3 procent.\n\n"
                        "Axfood ligger mellan ICA och H&M i "
                        "AKM1-modellen — V14-poäng 7 på grund av "
                        "två starka koncept (Willys och Hemköp) men "
                        "med konjunkturkänslighet 2. Axfood får därmed "
                        "hög portföljvikt under normala konjunkturer "
                        "men reducerad vikt i recessioner."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur svenska detaljhandelsaktier har "
                "reagerat på e-handelns intåg och pandemins effekter."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — H&M 2015–2020: aktien föll från "
                        "350 till 130 kr när bruttomarginalen sjönk "
                        "från 58 till 51 procent och lageromsättningen "
                        " ökade från 70 till 100 dagar. Investor som "
                        "följde V03 (bruttomarginal) såg tidigt att "
                        "modell-omställningen var problematisk. "
                        "Lärdom: trendförändringar i bruttomarginal "
                        "predicerar resultatfall 2–3 år i förväg.\n\n"
                        "Fallstudie 2 — Axfood 2020–2022: aktien steg "
                        "80 procent under pandemin när Willys och "
                        "Hemköp drog nytta av hemmakonsumtion. "
                        "Investor som såg att SSSG översteg 10 procent "
                        "kvartal 2–3 2020 kunde positionera sig. "
                        "Lärdom: pandemivinster är dock inte "
                        "permanenta — aktien föll 25 procent 2022 "
                        "när SSSG normaliserades.\n\n"
                        "Fallstudie 3 — ICA-handlarnas Modell 2021: "
                        "ICA AB rapporterade rekordresultat på 6 "
                        "miljarder, men ICA-handlarna (privata "
                        "företagare) kämpade med lönsamheten i "
                        "ICA Nära-butiker på grund av konkurrens "
                        "från Willys och Lidl. Investor som förstod "
                        "modellen såg att ICA AB är en grossist "
                        "snarare än återförsäljare och undvek att "
                        "överväldera butiksrisker på ICA AB."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "H&M:s bruttomarginal återhämtade sig till 54 "
                        "procent 2023 — första gången på 5 år — vilket "
                        "utlöste V03-köpsignal i AKM1-modellen och "
                        "markerade vändning för aktien."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Pandemivinst: engångsvis effekt på "
                        "detaljhandelsresultat under 2020–2021 från "
                        "hemmakonsumtion — ska justeras bort vid "
                        "långsiktig värdering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — Boozt 2022: "
                        "e-handelsaktien föll 75 procent när "
                        "returkostnaderna ökade till 35 procent av "
                        "försäljningen. Investor som följde V03 "
                        "såg att bruttomarginalen var 50 procent "
                        "men att netto efter returer var 32 procent "
                        "— en varning för att bruttomarginal i "
                        "e-handel inte inkluderar returkostnader.\n\n"
                        "Dessa fallstudier visar att svensk "
                        "detaljhandels risker hänger samman med "
                        "bruttomarginal, lageromsättning och "
                        "konjunkturkänslighet — variabler som alla "
                        "kan systematiseras genom V01/V03/V14-matrisen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i detaljhandelsanalys kräver förståelse "
                "för e-handelns ekonomi, butiksavtalens struktur och "
                "skillnaden mellan försäljningstillväxt och "
                "lönsamhetstillväxt."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser varje "
                        "kvartalsrapport med tre specifika frågor: "
                        "(1) Hur mycket av försäljningsökningen "
                        "kommer från SSSG vs nya butiker? (2) Hur "
                        "utvecklas bruttomarginalen i lokalvaluta "
                        "(exklusive valutaeffekter)? (3) Hur stort är "
                        "kapitalbehovet för nya butiker jämfört med "
                        "kassaflödet från befintliga? Detta ramverk "
                        "fångar både kvalitativ och kvantitativ "
                        "utveckling.\n\n"
                        "Mästerskap innebär också att förstå "
                        "hyresavtalens struktur — H&M har 5–10 "
                        "åriga avtal med indexuppräkning, vilket "
                        "betyder att hyreskostnaden stiger med "
                        "inflationen oavsett försäljning. ICA AB:s "
                        "handlare har kortare hyresavtal (2–3 år) "
                        "vilket ger mer flexibilitet.\n\n"
                        "Slutligen behärskar mästaren "
                        "butiksavskrivningar — H&M stängde 250 "
                        "butiker 2021–2023 med nedskrivningar på 4 "
                        "miljarder. Dessa ska läggas tillbaka i "
                        "rörelseresultatet för att få en rättvisande "
                        "bild av den underliggande lönsamheten."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "E-handelns ROI är ofta negativ i 3–5 år "
                        "innan kundlivstidsvärde överstiger "
                        "förvärvskostnad — investerare som kräver "
                        "positivt ROI på e-handel missar "
                        "tillväxtfasen men undviker också "
                        "kapitalförstöring."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Customer Lifetime Value (CLV): "
                        "nuvärde av alla framtida inköp från en "
                        "kund minus kundanskaffningskostnad — "
                        "centralt för e-handelsvärdering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Aktiemarknaden prissätter svensk "
                        "detaljhandel med P/E på 14–18 för "
                        "dagligvaru (ICA AB, Axfood) och 12–16 "
                        "för kläder (H&M) — premien för "
                        "dagligvaru reflekterar lägre cykelrisk "
                        "och stabilare utdelning. När P/E skillnaden "
                        "överstiger 5 punkter är det en signal om "
                        "att marknaden prissätter in pandemivinster "
                        "eller temporära marginalförluster.\n\n"
                        "Mästerskap slutligen innebär att "
                        "förstå branschens säsongs-"
                        "mönster: H&M har 70 procent av "
                        "försäljningen under Q2-Q3 (västsäsong) "
                        "och 30 procent under Q4-Q1 (vintersäsong), "
                        "vilket skapar likviditetssvängningar som "
                        "måste beaktas i korta investerings-"
                        "horisonter."
                    ),
                },
            ],
        },
    ],
}

# ---------------------------------------------------------------------------
# se-08 — Media (innehåll och streaming)
# ---------------------------------------------------------------------------
COURSES["se-08-media"] = {
    "why": (
        "Svensk mediasektor domineras av Spotify (180 miljoner "
        "Premium-prenumeranter globalt) och Modern Times Group (MTG), "
        "vilket ger privatinvesterare tillgång till två helt olika "
        "rörelsemodeller — annonsfinansierad streaming vs "
        "spel-underhållning. Spotify är en av få svenska tech-aktier "
        "med global skalning och dess värdemätning är starkt kopplad "
        "till prenumerations-ARPU och churn-rate, variabler som "
        "privatanalytiker kan följa kvartalsvis."
    ),
    "history": {
        "origin": (
            "Svensk medieindustri växte fram på 1920-talet med "
            "radiomonopol genom AB Radiotjänst (1925) och senare "
            "Sveriges Television (1956). Bonnier-ädda "
            "Dagens Nyheter (1864) och Schibsted-ägda "
            "Aftonbladet (1830) dominerade dagspressmarknaden, medan "
            "MTG bildades 1987 som en fristående verksamhet från "
            "Investor AB:s mediaholding. Spotify lanserades 2008 av "
            "Daniel Ek och Martin Lorentzon som ett legaliserat "
            "svar på Napster-erans piratkopiering."
        ),
        "evolution": (
            "MTG växte under 1990-talet via TV3, ZTV och Viasat-"
            "satellit, och expanderade till Baltikum och "
            "Östeuropa med lokal kanaltillstånd. Bonnier och "
            "Schibsted gick samman i norska Schibsted Media 2009 "
            "för att hantera digitaliseringen, och Schibsted-noterades "
            "på Oslobörsen 2015 med en värdering på 60 miljarder. "
            "Spotify börsnoterades på NYSE 2018 genom direktlistning "
            "— första tekniktillfället utan traditionell IPO — till "
            "en värdering av 26,5 miljarder dollar."
        ),
        "modern": (
            "Idag är Spotify världens största ljudstreaming-plattform "
            "med 615 miljoner användare (varav 180 miljoner Premium) "
            "i 180 marknader, och har expanderat till podcasts genom "
            "förvärv av Gimlet och The Ringer 2019 för 500 miljoner "
            "dollar. MTG har sålt sina TV-kanaler och fokuserar på "
            "esport (ESL) och spelstudior via Embracer. Schibsted "
            "har delat upp sig i två börsbolag 2023 — "
            "Schibsted Media (nyheter) och Schibsted Marketplaces "
            "(Finn, Blocket) — för att isolera annonsmarknadens "
            "cykelrisk från marknadsplatsernas tillväxt."
        ),
    },
    "lynchSection": (
        "Lynch varnade i ”One Up on Wall Street” för mediabolag "
        "med opaka intäktsströmmar och betonade att han föredrog "
        "bolag med tydliga prenumerationsintäkter — ett kriterium "
        "som gett Spotify hög score i hans ramverk. Han ogillade "
        " annonsfinansierade medier eftersom annonsintäkter är "
        "högcykliska och kan falla 30 procent i en recession."
    ),
    "grahamSection": (
        "Graham analyserade medier utifrån deras kassaflödesstabilitet "
        "och betonade att annonsmarknadens cykelrisk kräver "
        "extra kapitalmarginal. Han undvek mediabolag med P/E över 20 "
        "i normala tider, och krävde att prenumerationsintäkter skulle "
        "utgöra minst 60 procent av totalen innan han övervägde en "
        "placering — ett kriterium som utesluter traditionella "
        "dagspressaktier."
    ),
    "ak1Section": (
        "AKM1-metodiken tillämpar V13 (kundkoncentration) och V15 "
        "(teknologi och plattform) särskilt strikt på medieaktier, "
        "där Spotify:s 100 procent beroende av musikrättigheter ger "
        "V13-riskflagga. AKM1 1.1-integrationen klassar Spotify som "
        "tillväxtaktie med särskild riskpremie och maxvikt 3 procent "
        "i portföljen på grund av konkurrens från Apple Music och "
        "Amazon Music."
    ),
    "chapters": [
        {
            "intro": (
                "Mediasektorn omfattar tre rörelsemodeller — "
                "prenumeration (Spotify), annonsfinansierad "
                "(Schibsted) och engångsintäkter (MTG/Embracer) — "
                "med helt olika riskprofiler och värderingsmetoder."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Spotify är en prenumerationsmodell där 88 procent "
                        "av intäkterna kommer från Premium-abonnemang "
                        "(2023) och 12 procent från annonsstödd "
                        "få-version. ARPU (Average Revenue Per User) "
                        "låg på 4,99 euro under 2023 — under press "
                        "från familjeplaner som ger lägre per-användar-intäkt "
                        "men högre total bruttomarginal.\n\n"
                        "Schibsted Marketplaces drivs av "
                        "annonsmarknaden där Blocket och Finn tar "
                        " provisionsbaserade avgifter för "
                        "förmedling av bilar, bostäder och jobb. "
                        "Intäkterna är konjunkturkänsliga — under "
                        "2022–2023 sjönk Blockets bostadsannonser "
                        "med 40 procent när bostadsmarknaden frös.\n\n"
                        "MTG/Embracer representerar "
                        "engångsintäktsmodellen där varje spel"
                        "säljs separat. Embracer hade 2023 232 "
                        "spel under utveckling i 132 studios — "
                        "koncentrationen till ett fåtal "
                        "blockbuster-titlar gör modellen riskfylld "
                        "eftersom en försening kan slå ut en hel "
                        "kvartalsrapport."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Spotify:s bruttomarginal på 26 procent "
                        "(2023) är låg jämfört med Netflix på 41 "
                        "procent eftersom musikrättighetskostnader "
                        "utgör 70 procent av intäkterna — ett "
                        "strukturellt problem som inte existerar "
                        "för video-streaming."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "ARPU (Average Revenue Per User): "
                        "totala intäkter dividerat med antal "
                        "betalande användare — centralt mått för "
                        "prenumerationsmodeller som Spotify."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Bruttomarginalens struktur skiljer "
                        "medieaktier åt. Spotify har "
                        "musikrättighetskostnader på 70 procent av "
                        "intäkterna — en utgift som inte kan "
                        "optimeras utan förhandling med de tre "
                        "stora skivbolagen (Universal, Sony, "
                        "Warner). Detta ger bruttomarginal på 26 "
                        "procent och möjlighet till operationell "
                        "hävstång via kostnadskontroll.\n\n"
                        "Schibsted Marketplaces har bruttomarginal "
                        "på 75 procent eftersom plattformen "
                        "sällan äger förmedlade objekt — en "
                        "asset-light modell. Operationell hävstång "
                        "är hög: en 10-procentig ökning av "
                        "annonsintäkter ger en 25-procentig "
                        "ökning av rörelseresultat."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk medieanalys kräver nedbrytning av "
                "prenumerationstillväxt, churn-rate och ARPU för "
                "Spotify, samt annonsmarknadens cykel för Schibsted."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Spotify rapporterar kvartalsvis tre "
                        "kritiska variabler: MAU (Monthly Active "
                        "Users), Premiumprenumeranter och Premium "
                        "ARPU. MAU ökade från 271 miljoner Q1 2020 "
                        "till 615 miljoner Q4 2023 — en "
                        "tillväxttakt på 23 procent årligen. "
                        "Premium-prenumeranter ökade parallellt från "
                        "124 till 236 miljoner, vilket indikerar "
                        "konverteringsgrad på 38 procent.\n\n"
                        "Churn-rate är den andra kritiska variabeln "
                        "— procent av Premium-användare som "
                        "avslutar prenumeration per månad. Spotify "
                        "rapporterar inte churn direkt men investerare "
                        "kan beräkna det från net additions och "
                        "brutto-tillägg. Historisk churn ligger på "
                        "3,8 procent månatligen — lågt jämfört med "
                        "Netflix 4,5 procent.\n\n"
                        "ARPU-utvecklingen är den tredje variabeln: "
                        "Spotify:s Premium ARPU föll från 5,30 euro "
                        "Q1 2019 till 4,59 euro Q4 2022 på grund av "
                        "familjeplaner och tillväxt i låginkomstmarknader. "
                        "Under 2023 vände ARPU upp till 4,99 euro via "
                        "prishöjningar i USA och Europa."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Spotify:s högre ARPU i utvecklade marknader "
                        "(USA 6,50 euro vs Indien 1,20 euro) gör "
                        "att regional mixförskjutning påverkar "
                        "total ARPU mer än prisförändringar — "
                        "investerare bör justera för detta."
                    ),
                },
                    {
                    "type": "definition",
                    "content": (
                        "Churn-rate: procent av "
                        "prenumeranter som lämnar per "
                        "månad — låg churn (under 4 procent) "
                        "indikerar stark kundlojalitet."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Schibsted Marketplaces analyseras genom "
                        "GMV (Gross Merchandise Value) — totalt "
                        "värde av förmedlade varor och tjänster. "
                        "Blocket förmedlade 2023 bilar för 120 "
                        "miljarder och bostäder för 480 miljarder, "
                        "vilket ger take-rate på 0,5 procent för "
                        "bilar och 0,2 procent för bostäder.\n\n"
                        "ESport och spelstudior analyseras genom "
                        "antal aktiva användare och "
                        "genomsnittlig spend per användare. Embracer "
                        "rapporterar 2023 att 100 miljoner spelade "
                        "deras titlar månatligen med en genomsnittlig "
                        "spend på 2,80 dollar per användare."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i medieanalys inkluderar att "
                "förväxla MAU-tillväxt med intäkts-"
                "tillväxt och att ignorera rättighetskostnaders "
                "volatilitet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att extrapolera "
                        "MAU-tillväxt till vinsttillväxt. Spotify "
                        "fyrdubblade MAU mellan 2018–2023 men "
                        "rörelseresultatet förblev negativt fram "
                        "till Q3 2023. Investerare som såg MAU som "
                        "proxy för värdering köpte aktien till 350 "
                        "kr 2021 och såg den falla till 70 kr 2022. "
                        "Lösningen är att modellera vinst per MAU "
                        "snarare än total MAU.\n\n"
                        "En annan fälla är att förväxla "
                        "annonsmarknadsnormalisering med "
                        "strukturell nedgång. Schibsteds "
                        "annonsintäkter föll 25 procent 2023 — "
                        "investor som tittade på 2021–2022-nivåer "
                        "trodde att det var cykliskt men det "
                        "faktiskt var en kombination av cykel och "
                        "strukturpåverkan från Meta och Google.\n\n"
                        "En tredje fälla är att ignorera "
                        "rättighetsförhandlingar. Spotify:s "
                        "avtal med Universal löper ut 2024 och "
                        "nya avtal kan kräva högre andel av "
                        "intäkterna. Investor som inte beaktar "
                        "dessa förhandlingar kan överväldera "
                        "framtida bruttomarginal."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Spotify har en gång per kvartal "
                        "rättighetskostnader på 70 procent av "
                        "intäkterna — små förändringar i avtal "
                        "med Universal/Sony/Warner kan ändra "
                        "bruttomarginal med 2–3 procentenheter."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Take-rate: provision som "
                        "marknadsplats tar på förmedlad "
                        "transaktion — Blocket har 0,5 procent "
                        "på bilar, Finn 0,3 procent på bostäder."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En fjärde fälla är att underskatta "
                        "ESport- och spelutvecklingsrisker. "
                        "Embracer hade 2023 10 stora "
                        "blockbuster-titlar under utveckling men "
                        "förseningar ledde till 5 miljarder i "
                        "nedskrivningar. Investor som tittade på "
                        "utvecklingspipeline utan att väga in "
                        "sannolikhet för försening fick "
                        "oväntat stor förlust.\n\n"
                        "Slutligen är Embracers "
                        "förvärvsdrivna tillväxt en fälla — bolaget "
                        "förvärvade 70 studios under 2016–2022 och "
                        "investor som tittade på organisk tillväxt "
                        "missade att 60 procent kom från "
                        "förvärv. När förvärvstakten sjönk 2023 "
                        "kollapsade aktien med 70 procent."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen för medieaktier klassar "
                "Spotify som tillväxtakti med specifik riskpremie "
                "och maxvikt 3 procent, medan Schibsted Marketplaces "
                "får normal portföljvikt som cykelakti."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1-metodiken klassar medieaktier i tre "
                        "kategorier: prenumerationsmodell (Spotify, "
                        "Netflix), annonsmodell (Schibsted, Meta) och "
                        "engångsmodell (Embracer, EA). Varje kategori "
                        "har olika V15 (teknologikänslighet) och V17 "
                        "(utdelningsstabilitet). Prenumerationsmodeller "
                        "har hög V15 men stabil V17 om churn är låg.\n\n"
                        "Spotify klassas som tillväxtakti med "
                        "särskild riskpremie på grund av fyra faktorer: "
                        "(1) bruttomarginal under 30 procent, "
                        "(2) konkurrens från Apple Music och Amazon, "
                        "(3) rättighetskänslighet, och (4) negativt "
                        "fritt kassaflöde fram till 2023. AKM1 1.1 "
                        "sätter därför maxvikten till 3 procent i "
                        "portföljen och kräver 25 procents marginal "
                        "för ny investering.\n\n"
                        "Schibsted Marketplaces klassas som "
                        "cykelakti med V14 (konkurrenssituation) 8 "
                        "på grund av starka lokala nätverkseffekter. "
                        "Blocket har 95 procent av svenska "
                        "andrahandshandel av bilar, vilket ger "
                        "starkt försvar mot internationell konkurrens."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 ger Schibsted Marketplaces "
                        "automatisk hög portföljvikt på grund av "
                        "nätverkseffekter i Blocket och Finn — "
                        "modellen ser lokala marknadsledare som "
                        "särskilt värdefulla."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Nätverkseffekt: värde av plattform ökar "
                        "med antal användare — Blocket blir "
                        "mer värdefullt för säljare ju fler "
                        "köpare som finns, och vice versa."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Embracer klassas i AKM1-modellen som "
                        "high-risk growth — V13 (kundkoncentration) "
                        "5 på grund av få blockbusters och V15 "
                        "9 på grund av snabb teknologisk "
                        "utveckling i spelindustrin. Maxvikt 2 "
                        "procent i portföljen.\n\n"
                        "Spotify har potential att omklassificeras "
                        "till kvalitetsakti om bruttomarginal "
                        "överstiger 30 procent och fritt "
                        "kassaflöde blir positivt tre kvartal i rad. "
                        "AKM1 1.1 tillämpar en 12-månaders "
                        "observationsperiod innan omklassificering "
                        "för att undvika falska signaler."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur Spotify, Schibsted och "
                "Embracer har hanterat digitaliseringen och "
                "konkurrens från globala plattformar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Spotify 2018–2023: aktien "
                        "föll från 165 dollar till 70 dollar under "
                        "2022 när räntor steg och Spotify:s förluster "
                        "ökade. Investor som följde V15 "
                        "(teknologikänslighet) såg att Spotify "
                        "var räntekänslig och minskade exponeringen "
                        "2021. Lärdom: tillväxtaktier med negativt "
                        "kassaflöde faller kraftigt i "
                        "räntehöjningscykler.\n\n"
                        "Fallstudie 2 — Schibsted 2020–2022: "
                        "aktien steg 80 procent under pandemin när "
                        "digitala marknadsplatser vann mark från "
                        "traditionell detaljhandel. När "
                        "annonsmarknaden vände 2023 föll aktien "
                        "40 procent. Investor som förstod cykelrisk "
                        "minskade positionen i tid.\n\n"
                        "Fallstudie 3 — Embracer 2022–2023: bolaget "
                        "förhandlade om ett 2 miljarder dollar "
                        "avtal med Savvy Games Group som föll i "
                        "sista stadiet juni 2023 — aktien rasade "
                        "40 procent på en dag. Investor som såg "
                        "riskerna med förvärvsberoende tillväxt "
                        "undvek positionen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Spotify blev lönsamt Q3 2023 — första "
                        "kvartalet med positivt fritt kassaflöde "
                        "i tre kvartal — vilket utlöste köpsignal "
                        "i AKM1-modellen."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Fritt kassaflöde (FCF): "
                        "kassaflöde från drift minus "
                        "kapitalexpenditure — centralt för "
                        "värdering av tillväxtbolag."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — Bonnier 2020: "
                        "familjeägd mediekoncern sålde "
                        "Bonnier Books till kvägare 2022 och "
                        "omstrukturerade tidningsverksamheten. "
                        "Investor som inte kunde exponera sig mot "
                        "Bonnier (ej börsnoterat) använde "
                        "Schibsted som proxy för svensk "
                        "mediemarknad.\n\n"
                        "Dessa fallstudier visar att svensk "
                        "mediasektor är tvådelad mellan globala "
                        "plattformar (Spotify) och lokala "
                        "marknadsplatser (Schibsted) — "
                        "investerare bör separera dessa "
                        "rörelsemodeller i portföljen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i medieanalys kräver förståelse för "
                "prenumerationsekonomi, nätverkseffekter och "
                "räntekänslighet hos tillväxtbolag."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer tre "
                        "specifika KPI:er för prenumerationsbolag: "
                        "(1) LTV (Lifetime Value) dividerat med CAC "
                        "(Customer Acquisition Cost), (2) payback-period "
                        "för marknadsföringskostnader, och (3) net "
                        "revenue retention från befintliga kunder. "
                        "Spotify har LTV/CAC på 3,2 — hälsosamt men "
                        "inte exceptionellt.\n\n"
                        "Mästerskap innebär också att förstå "
                        "regulatoriska risker — EU:s Digital Markets "
                        "Act 2023 och Digital Services Act 2024 "
                        "begränsar plattformars möjligheter att "
                        "prioritera egna tjänster. Spotify har "
                        "klagat på Apple för 30-procentiga avgifter "
                        "i App Store, och en EU-dom 2024 gav Spotify "
                        "rätt — positivt för Spotify:s bruttomarginal.\n\n"
                        "Slutligen behärskar mästaren skillnaden mellan "
                        "GAAP och IFRS-redovisning. Spotify rapporterar "
                        "under IFRS med aktiebaserad kompensation som "
                        "kostnad, vilket ger lägre rapporterad vinst "
                        "än om man justerade för detta. Många "
                        "investor bortser från aktieprogrammen och "
                        "överskattar därmed Spotify:s lönsamhet."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Spotify:s podcast-satsning (500 miljoner "
                        "dollar 2019–2022) har inte gett förväntad "
                        "ROI — bolaget har skrivit ner 200 miljoner "
                        "dollar av Gimlet och The Ringer 2023."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "LTV/CAC-kvot: Lifetime Value dividerat "
                        "med Customer Acquisition Cost — värde "
                        "över 3 indikerar hälsosam tillväxtmodell."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Aktiemarknaden prissätter svenska "
                        "medieaktier mycket olika — Spotify med "
                        "P/S (Price-to-Sales) på 3,5 och Schibsted "
                        "Marketplaces med P/E på 14. Skillnaden "
                        "reflekterar att Spotify är tillväxtaktie "
                        "medan Schibsted är moget kassaflödesbolag.\n\n"
                        "Mästerskap slutligen innebär att förstå "
                        "regulatoriska risker för Apple och Google — "
                        "App Store-avgifter på 30 procent för "
                        "Spotify:s prenumerationer är en dold "
                        "kostnad som kan försvinna om EU:s "
                        "Digital Markets Act tvingar Apple att "
                        "sänka avgifterna, vilket skulle ge "
                        "Spotify 2–3 procentenheter extra "
                        "bruttomarginal."
                    ),
                },
            ],
        },
    ],
}

# ---------------------------------------------------------------------------
# se-09 — Bil (disruption och el)
# ---------------------------------------------------------------------------
COURSES["se-09-bil"] = {
    "why": (
        "Svensk bilindustri består av Volvo Cars (börsnoterad 2021), "
        "Volvo AB (lastbilar) och Scania — tre bolag med helt olika "
        "exponering mot elbil-disruptionen. För privatinvesterare är "
        "bissektorn intressant eftersom Volvo Cars värderas med 30 "
        "procents EV-premie och lastbilsbolagen har helt annan "
        "cykelrisk kopplad till global frakt och konjunktur."
    ),
    "history": {
        "origin": (
            "Svensk bilindustri föddes 1927 när Assar Gabrielsson och "
            "Gustaf Larson lanserade den första Volvo ÖV4 från "
            "Lundbyfabriken i Göteborg — en amerikanskt inspirerad "
            "konstruktion med 28 hästkrafter. Scania startade 1891 som "
            "cykeltillverkare i Malmö och gick över till bilar 1903, "
            "medan lastbilstillverkningen etablerades 1902 genom Vabis "
            "i Södertälje. Volvo AB:s lastbilsdivision föddes 1928 med "
            "LV Series 1 och expanderade genom förvärv av White Motor "
            "Corporation 1980 och Renault Trucks 2001."
        ),
        "evolution": (
            "Volvo Personvagnar såldes till Ford 1999 för 6,5 miljarder "
            "dollar och sedan vidare till Geely 2010 för 1,8 miljarder — "
            "ett köp som visade sig bli en av de mest lönsamma "
            "kinesiska utländska investeringarna någonsin. Scania och "
            "Vabis gick samman 1911 till Scania-Vabis, och bolaget "
            "köptes ut av Saab-Scania 1969. Volvo AB förvärvade "
            "Renault Trucks 2001 vilket gjorde bolaget till "
            "världens näst största tillverkare av tunga lastbilar "
            "efter Daimler."
        ),
        "modern": (
            "Volvo Cars börsnoterades på Nasdaq Stockholm oktober 2021 "
            "till en värdering av 320 miljarder kronor — den största "
            "svenska noteringen på 20 år — efter att ha skjutit upp "
            "noteringen två gånger under pandemin. Elbilsstrategin "
            "lanserades 2017 med målet att 50 procent av försäljningen "
            "ska vara elbilar 2025, och 2023 nåddes 16 procent — "
            "något under mål men klart över branschgenomsnittet. "
            "Polestar bildades 2017 som joint venture mellan Volvo Cars "
            "och Geely och börsnoterades 2022 via SPAC med "
            "värdering 21 miljarder dollar."
        ),
    },
    "lynchSection": (
        "Lynch varnade för biltillverkare i ”One Up on Wall Street” "
        "eftersom de är kapitalintensiva, cykliska och historiskt har "
        "svårt att generera 15-procentig ROE. Han undantog dock "
        "specialtillverkare med starkt varumärke — Volvo-lastbilar "
        "passerar hans test med 18 procent ROE och stark global "
        "marknadsposition i tunga lastbilar."
    ),
    "grahamSection": (
        "Graham ogillade biltillverkare utifrån deras stora "
        "kapitalbehov och cykliska resultat. Han krävde att "
        "biltillverkare handlades till P/E under 8 och pris-till-"
        "bok under 1,2 innan han övervägde en investering — kriterier "
        "som sällan är uppfyllda i modern tid men som fångar "
        "principen om cykelriskjustering."
    ),
    "ak1Section": (
        "AKM1-metodiken klassar Volvo Cars som cykelakti med EV-riskpremie "
        "och maxvikt 3 procent, medan Volvo AB klassas som "
        "cykelakti utan riskpremie och maxvikt 5 procent. AKM1 1.1-"
        "integrationen väger in Sydeuropa-lastbilscykel och "
        "nordamerikansk fraktkonjunktur som separata variabler för "
        "Volvo AB:s riskprofil."
    ),
    "chapters": [
        {
            "intro": (
                "Svensk bilindustri är tudelad: personbilar (Volvo "
                "Cars) med hög EV-exponering och lastbilar (Volvo AB, "
                "Scania) med cyklisk exponering mot global frakt-"
                "konjunktur."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Volvo Cars producerade 2023 708 000 bilar "
                        "varav 16 procent var elbilar (BEV) och 26 "
                        "procent var laddhybrider (PHEV) — totalt 42 "
                        "procent elektrifierade. Företaget har "
                        "investeringstak på 13 miljarder kronor per år "
                        "i nya elbilsplattformar och batterifabriker, "
                        "vilket ger fritt kassaflöde på minus 5 "
                        "miljarder 2022–2024 innan positivt kassaflöde "
                        "förväntas 2025.\n\n"
                        "Volvo AB och Scania domineras av tunga "
                        "lastbilar där Volvo har 19 procent av "
                        "globala marknaden och Scania (del av Volvo "
                        "AB sedan 2014-via säkerhetsaffär) har 9 "
                        "procent. Lastbilsmarknaden är cyklisk — under "
                        "2020 föll försäljningen 25 procent under "
                        "pandemin men återhämtade sig till 80 procent "
                        "över 2019-nivå 2023.\n\n"
                        "Batteritillverkning är en ny strategisk "
                        "verksamhet — Volvo Cars och Northvolt "
                        "bygger batterifabrik i Mariestad för 30 "
                        "miljarder kronor med startproduktion 2026. "
                        "Volvo AB har investerat i batteriutveckling "
                        "för elförskjutning och 2023 lanserades "
                        "Volvo FH Electric för regionala transporter."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Volvo Cars värderas med 30 procents EV-premie "
                        "över traditionella biltillverkare, men "
                        "premien har sjunkit från 60 procent 2021 när "
                        "EV-tillväxten bromsat och räntor stigit."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Cykelrisk: resultatets känslighet för "
                        "konjunktursvängningar — lastbilar har 2x "
                        "cykelrisk (50 procents resultatfall i "
                        "recession), personbilar 1,5x."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Bruttomarginal skiljer Volvo Cars från Volvo "
                        "AB. Volvo Cars har bruttomarginal på 18–22 "
                        "procent (låg för branschen) medan Volvo AB "
                        "har 25–28 procent — skillnaden reflekterar "
                        "att lastbilar har högre tekniskt innehåll "
                        "och serviceintäkter.\n\n"
                        "Serviceintäkter utgör 25 procent av Volvo "
                        "AB:s totala intäkter och har 50 procents "
                        "bruttomarginal — en återkommande "
                        "intäktsström som inte är cyklisk. Volvo "
                        "Cars har bara 8 procent serviceintäkter och "
                        "är därmed mer konjunkturkänslig."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk bilanalys kräver nedbrytning av volym, "
                "mix (elbilar vs förbränningsbilar) och marginal per "
                "enhet för Volvo Cars, samt lastbilscykel och "
                "serviceintäkter för Volvo AB."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Volvo Cars rapporterar kvartalsvis tre "
                        "kritiska variabler: sålda bilar, andel "
                        "elbilar och bruttomarginal per bil. Under "
                        "Q3 2023 steg andelen elbilar till 18 procent "
                        "men bruttomarginalen föll från 22 till 19 "
                        "procent på grund av batterikostnader — "
                        "varning för att övergång till elbil pressar "
                        "marginaler.\n\n"
                        "Volvo AB analyseras genom tre cykelindikatorer: "
                        "(1) orderingång i lastbilar, (2) orderstock "
                        "(antal veckor av produktion bokade), och "
                        "(3) utnyttjandegrad i fabriker. Under Q1 2023 "
                        "var orderstocken 28 veckor — lågt jämfört med "
                        "55 veckor Q1 2022, vilket indikerade cykelvändning.\n\n"
                        "Scania (som redovisas som division inom Volvo "
                        "AB sedan säkerhetsaffären 2014) har "
                        "särskild rapportering med bruttomarginal 28–30 "
                        "procent — högre än Volvo-lastbilar på grund "
                        "av premiumposition i långfrakt och "
                        "serviceintäkter utgör 30 procent."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Volvo AB:s orderstock är ledande "
                        "cykelindikator — fallande orderstock i 2 "
                        "kvartal i rad predicerar resultatfall 6–9 "
                        "månader senare."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Orderstock: antal veckor av produktion "
                        "säkrade genom bokade order — över 40 "
                        "veckor indikerar överhettning, under 20 "
                        "veckor indikerar svag marknad."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Margin per vehicle är centralt för Volvo "
                        "Cars — 2023 var marginalen 6 500 dollar per "
                        "bil jämfört med 5 800 dollar 2022. Tesla "
                        "har 8 200 dollar per bil — Volvo ligger "
                        "under på grund av lägre andel elbilar och "
                        " högre kostnader för transition-mix.\n\n"
                        "Volvo AB:s serviceintäkter analyseras "
                        "separat eftersom de är återkommande. Under "
                        "2023 var serviceintäkterna 95 miljarder "
                        "kronor med bruttomarginal 48 procent — "
                        "motsvarande 45 procent av rörelseresultatet. "
                        "Detta minskar cykelrisken jämfört med "
                        "konkurrenter utan serviceaffär."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i bilanalys inkluderar att extrapolera "
                "EV-tillväxt i uppgång till långsiktig trend och att "
                "underskatta övergångskostnader från förbränningsmotorer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "EV-tillväxtfällan 2021–2022: Volvo Cars-"
                        "aktien steg från 50 till 75 kr när "
                        "EV-försäljning ökade 60 procent. När "
                        "EV-tillväxten bromsade 2023 sjönk aktien "
                        "till 28 kr. Investor som modellerade "
                        "EV-tillväxt som exponentiell fick "
                        "känbara förluster.\n\n"
                        "En annan fälla är att underskatta "
                        "övergångskostnader. Volvo Cars investerar "
                        "13 miljarder kronor årligen i "
                        "EV-utveckling, vilket ger negativt fritt "
                        "kassaflöde fram till 2025. Investor som "
                        "tittade på rörelseresultat utan att justera "
                        "för kapitalbehov överväderade lönsamheten.\n\n"
                        "En tredje fälla är att förväxla Volvo AB:s "
                        "serviceintäkter med cyklisk lastbilsförsäljning. "
                        "Serviceintäkterna växer 6 procent årligen "
                        "oberoende av cykel — investerare som tittade "
                        "på total intäktstrend missade att "
                        "serviceaffären stabiliserar resultatet."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Volvo Cars EV-marginal är 4 procentenheter "
                        "lägre än förbränningsbilar — övergång till "
                        "EV kommer att pressa total bruttomarginal "
                        "med 1,5 procentenheter 2025–2027."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "EV-premie: värderingspremie som "
                        "investerare betalar för bolag med hög "
                        "andel elbilar — Volvo Cars har 30 procent, "
                        "Tesla 200 procent över traditionella "
                        "biltillverkare."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En fjärde fälla är att ignorera Geelys "
                        "inflytande över Volvo Cars. Geely äger 78 "
                        "procent av aktierna och har rätt att "
                        "utse majoriteten av styrelsen — "
                        "minoritetsaktionärer har begränsat "
                        "inflytande. Investor som inte förstod "
                        "denna struktur blev överraskade 2023 när "
                        "Volvo Cars lånade 5 miljarder till Geely-"
                        "koncernen.\n\n"
                        "Slutligen är Polestar en separat risk — "
                        "Volvo Cars äger 48 procent av Polestar och "
                        "redovisar andel som finansiell investering. "
                        "När Polestar-aktien föll 80 procent 2023 "
                        "skrev Volvo ner investeringen med 6 "
                        "miljarder, vilket tryckte ner Volvo Cars "
                        "rapporterade resultat."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen ger Volvo Cars cykelakti-status "
                "med EV-riskpremie och maxvikt 3 procent, medan Volvo "
                "AB klassas som kvalitetscykelakti utan riskpremie."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1-metodiken klassar bilaktier i tre "
                        "kategorier: personbilar (Volvo Cars), tunga "
                        "lastbilar (Volvo AB, Scania) och "
                        "komponenttillverkare (Autoliv, SKF). "
                        "Personbilar har hög V14 (konkurrens) 9 på "
                        "grund av global konkurrens från Tesla och "
                        "kinesiska tillverkare. Lastbilar har V14 6 "
                        "på grund av oligopolmarknaden med bara fyra "
                        "globala aktörer.\n\n"
                        "Volvo Cars klassas som cykelakti med "
                        "EV-riskpremie på grund av fyra faktorer: "
                        "(1) bruttomarginal under 25 procent, (2) EV-"
                        "övergångskostnader, (3) kinesisk minoritetsrisk "
                        "via Geely, och (4) negativt fritt kassaflöde "
                        "2022–2024. AKM1 1.1 sätter maxvikt 3 procent "
                        "i portföljen och kräver 30 procents marginal.\n\n"
                        "Volvo AB klassas som kvalitetscykelakti utan "
                        "riskpremie på grund av serviceintäkter (25 "
                        "procent), oligopolmarknad (V14 6) och stabil "
                        "utdelning sedan 2000-talets början. Maxvikt 5 "
                        "procent i portföljen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 ger Volvo AB 40 procent högre "
                        "portföljvikt än Volvo Cars vid samma "
                        "värdering — skillnaden reflekterar "
                        "serviceaffärens stabiliserande effekt."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Oligopolmarknad: marknad dominerad av "
                        "få säljare — tunga lastbilar har "
                        "fyra globala aktörer (Daimler, Volvo, "
                        "PACCAR, Traton) vilket ger pris disciplin."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Volvo AB:s riskpremie justeras nedåt i "
                        "AKM1-modellen baserat på Scania-integration — "
                        "Scania har 30 procents bruttomarginal "
                        "och serviceintäkter, vilket ökar "
                        "koncernens stabilitet. Investor som följer "
                        "AKM1 1.1 kan därför övervikt svenska "
                        "lastbilsvärden i portföljen.\n\n"
                        "Polestar klassas som high-risk growth i "
                        "AKM1-modellen med V13 4, V15 10 och maxvikt "
                        "1 procent. Investerare som vill exponera sig "
                        "mot Polestar bör göra det via Volvo Cars "
                        "snarare än direkt, enligt AKM1-modellen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur Volvo Cars, Volvo AB och "
                "Polestar har hanterat elbilsdisruptionen och "
                "konjunkturcykler."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Volvo Cars börsnotering 2021: "
                        "noterad till 53 kr med mål 75 kr. Aktien öppnade "
                        "på 60 kr och föll till 22 kr inom 18 månader "
                        "när räntor steg och EV-tillväxt bromsade. "
                        "Investor som följde AKM1-modellen undvek "
                        "förvärv i noteringen på grund av EV-riskpremie. "
                        "Lärdom: tillväxtnoteringar under räntehöjning "
                        "är särskilt riskabla.\n\n"
                        "Fallstudie 2 — Volvo AB under pandemin 2020: "
                        "orderstocken föll från 50 till 20 veckor på "
                        "ett kvartal, men serviceintäkterna hölls "
                        "intact på 85 miljarder. Aktien föll 30 procent "
                        "men återhämtade sig till +50 procent över "
                        "pre-pandemi-nivå 2022. Investor som förstod "
                        "serviceaffärens stabiliserande roll kunde "
                        "behålla positionen.\n\n"
                        "Fallstudie 3 — Polestar 2022–2023: aktien föll "
                        "från 13 till 2 dollar när produktionen av "
                        "Polestar 3 försenades och marginalerna "
                        "pressades. Investor som såg att Polestar "
                        "var beroende av Volvos tillverkningskapacitet "
                        "undvek positionen. Lärdom: SPAC-noteringar "
                        "med osäker produktionspipeline är extremt "
                        "riskabla."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Volvo AB:s aktie har överträffat Volvo Cars "
                        "med 80 procent under 2022–2023 — skillnaden "
                        "reflekterar cykelrisk och serviceintäkternas "
                        "stabiliserande effekt."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "SPAC (Special Purpose Acquisition Company): "
                        "noteringsmetod utan traditionell IPO — "
                        "Polestar använde SPAC 2022 vilket gav "
                        "lägre transparens än IPO."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — Scania integration 2014: "
                        "Volvo AB köpte resterande aktier i Scania "
                        "för 7 miljarder och integrerade i koncernen. "
                        "Investor som förstod att Scania hade 30 "
                        "procents bruttomarginal och starkt varumärke "
                        "kunde positionera sig före förvärvet — aktien "
                        "steg 40 procent under 12 månader efter\n\n"
                        "Dessa fallstudier visar att svensk bilindustri "
                        "är tudelad mellan cykelrisk (Volvo Cars) och "
                        "stabilitet (Volvo AB) — investerare bör "
                        "separera dessa i portföljkonstruktionen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i bilanalys kräver förståelse för "
                "EV-övergångens ekonomi, lastbilscykler och "
                "serviceintäkternas värde."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer tre "
                        "specifika KPI:er för personbilar: (1) andel "
                        "EV av total försäljning, (2) bruttomarginal "
                        "per bil, och (3) kassaflödesbreakeven-pris "
                        "för nya modeller. Volvo Cars har 16 procent "
                        "EV, 19 procents bruttomarginal och "
                        "breakeven-pris på 45 000 dollar — under "
                        "Tesla på 50 000 dollar men över traditionella "
                        "tillverkare på 38 000 dollar.\n\n"
                        "Mästerskap innebär också att förstå "
                        "batterikostnadens utveckling — Volvos "
                        "batterikostnad föll från 150 dollar per kWh "
                        "2020 till 105 dollar per kWh 2023. Vid 80 "
                        "dollar per kWh når EV-paritet med "
                        "förbränningsbilar, vilket förväntas 2026.\n\n"
                        "Slutligen behärskar mästaren skillnaden mellan "
                        "regulatoriska krav och kommersiell "
                        "lönsamhet. EU:s förbud mot förbränningsbilar "
                        "2035 tvingar Volvo Cars att övergå till 100 "
                        "procent EV, men kommersiell lönsamhet kräver "
                        "batterikostnader under 80 dollar per kWh — "
                        "ett mål som inte är säkert uppnått 2035."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Volvo AB:s serviceintäkter växer 6 procent "
                        "årligen oberoende av lastbilscykel — "
                        "tjänsteinkomst-effekten ger stabil "
                        "avkastning även under recessioner."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Battery parity point: batterikostnad där "
                        "elbil blir billigare än förbränningsbil — "
                        "för närvarande 80 dollar per kWh, "
                        "förväntat 2026."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Aktiemarknaden prissätter svensk bilindustri "
                        "med P/E på 6–8 för Volvo AB (cykelakti) och "
                        "P/E på 12–18 för Volvo Cars (tillväxtakti "
                        "med EV-premie). Skillnaden på 6–10 punkter "
                        "reflekterar EV-premie och tillväxtförväntning.\n\n"
                        "Mästerskap slutligen innebär att förstå "
                        "kinesiska Geelys strategi — koncernen har "
                        "integrerat Volvo Cars, Lotus, Polestar och "
                        "Zeekr i en global plattform, vilket skapar "
                        "synergier men också minoritetsrisk för "
                        "svenska investerare i Volvo Cars."
                    ),
                },
            ],
        },
    ],
}

# ---------------------------------------------------------------------------
# se-10 — Flyg (cykel och bränsle)
# ---------------------------------------------------------------------------
COURSES["se-10-flyg"] = {
    "why": (
        "SAS (Scandinavian Airlines) har varit svensk flygsektors "
        "flaggskepp i 75 år men befinner sig i rekonstruktion sedan "
        "2022 på grund av pandemi-efterdyningar och konkurrens från "
        "lågprisflyg. För privatinvesterare representerar SAS fall "
        "en läxa om flygsektorns extrema cykelrisk och bränsleexponering — "
        "en läxa som kan appliceras på andra transportaktier som "
        "färjor och tågoperatörer."
    ),
    "history": {
        "origin": (
            "SAS bildades 1 augusti 1946 genom sammanslagning av "
            "svenska SILA ( Svensk Interkontinental Lufttrafik), "
            "danska DDL och norska DNL — ett politiskt projekt för "
            "att ge Skandinavien interkontinental räckvidd efter "
            "andra världskriget. Den första interkontinentala "
            "linjen öppnades 1946 till New York med DC-4, och "
            "1952 blev SAS först i världen med turistklass över "
            "Atlanten — en innovation som revolutionerade "
            "flygindustrin. Saab-koncernen startade parallellt "
            "flygplanstillverkning 1937 med B 17-bombflygplanet, "
            "men SAS förblev kund snarare än ägare."
        ),
        "evolution": (
            "SAS genomgick flera kriser under 1960–1990-talen: oljekrisen "
            "1973 slog hårt med bränslekostnadsökning på 200 procent, "
            "Laker Airways konkurs 1982 öppnade för lågpris-"
            "konkurrens över Atlanten, och 1992 genomfördes den största "
            "rekonstruktionen i svensk flyghistoria med 6 miljarder i "
            "nytt kapital och uppsägning av 5 000 anställda. Norwegian "
            "Air Shuttle etablerades 1993 och utmanade SAS med lågpris-"
            "modell från 2002, vilket startade en 20-årig priskonkurrens."
        ),
        "modern": (
            "Pandemin 2020 tvingade SAS att parkera 90 procent av "
            "flottan och begära företagsrekonstruktion juli 2022 under "
            "Chapter 11 i USA — första gången ett svenskt bolag "
            "använde denna process. Air France-KLM och kapitalfonden "
            "Castle Lake investerade 25 miljarder kronor i "
            "rekonstruktionen, vilket gav dem 60 procent av "
            "aktierna och utspädda befintliga ägare till 0 procent. "
            "SAS lämnade Chapter 11 mars 2024 med nytt kapital och "
            "nytt ägande, medan Norwegian hade förstatligats 2020 "
            "och återgick till börsen 2021 med reducerad flotta."
        ),
    },
    "lynchSection": (
        "Lynch varnade uttryckligen för flygbolag i ”Beating the Street” "
        "med citatet ”flygbolag har varit en av de sämsta "
        "branscherna någonsin” — de kräver ständigt kapital, är "
        "extremt cykliska och har låga barriärer för inträde. Han "
        "föredrog flygplatser (Aer Rianta) framför flygbolag eftersom "
        "flygplatser har monopol-liknande positioner."
    ),
    "grahamSection": (
        "Graham ogillade flygbolag utifrån deras stora kapitalbehov "
        "och negativa kassaflöden i kriser. Han menade att "
        "flygbolag skulle värderas som likvideringsfall — bokfört "
            "värde av flygplan minus skulder — snarare än som "
        "going concern. Detta kriterium utesluter alla moderna "
        "flygbolag utom i djupa kriser."
    ),
    "ak1Section": (
        "AKM1-metodiken undviker flygbolag i standardportföljer på "
        "grund av extrem cykelrisk och kapitalintensitet. AKM1 1.1-"
        "integrationen tillåter endast flygplatser (Swedavia) och "
        "flygkomponenttillverkare (GKN Aerospace, Saab) i "
        "riskbegränsade positioner med maxvikt 2 procent."
    ),
    "chapters": [
        {
            "intro": (
                "Flygsektorn är extremt cyklisk med hög operationell "
                "hävstång — små svängningar i passagerarvolymer ger "
                "stora resultatrörelser, vilket gör flygbolag till "
                "en av de mest riskfyllda branscherna för "
                "privatinvesterare."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SAS hade 2019 (sista fulla året före pandemin) "
                        "30 miljoner passagerare och intäkter på 42 "
                        "miljarder kronor med bruttomarginal på 4 procent "
                        "— typiskt för europeisk nätverksflyg. Bränsle-"
                        "kostnader utgjorde 25 procent av intäkterna, "
                        "personal 30 procent och flygplansleasing 10 "
                        "procent — tre fasta kostnader som inte kan "
                        "sänkas i takt med intäktsfall.\n\n"
                        "Operationell hävstång är extremt hög: "
                        "vid 80 procents beläggningsgrad ger "
                        "1 procentenhets beläggningsökning cirka "
                        "15 procent resultatökning. Detta betyder att "
                        "SAS resultat kunde vända från förlust till "
                        "vinst med en 5-procentig ökning av "
                        "passagerarbeläggning.\n\n"
                        "Bränslekostnadens volatilitet är den andra "
                        "kritiska risken. SAS hade 2019 ingen bränsle-"
                        "hedging och var därmed fullt exponerad mot "
                        "oljeprissvängningar. Norwegian hade 60 "
                        "procent hedging och därmed lägre volatilitet "
                        "i resultatet — en strategisk skillnad som "
                        "förklarar varför Norwegian klarade pandemin "
                        "bättre än SAS."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Flygbolag med bruttomarginal under 5 procent "
                        "är strukturellt olönsamma — SAS hade 4 procent "
                        "2019, vilket borde ha varnat investerare "
                        "för permanent låg lönsamhet."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Beläggningsgrad (Load Factor): procent av "
                        "tillgängliga säten som är sålda — över 80 "
                        "procent indikerar hälsosam beläggning, "
                        "under 70 procent indikerar olönsamhet."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Lågprisflyg-modellen (Norwegian, Ryanair) skiljer "
                        "sig från nätverksflyg (SAS, Lufthansa) genom "
                        "punkttill-punkt-trafik istället för hub-and-"
                        "spoke. Lågprisflyg har lägre kostnad per "
                        "tillgänglig sätkilometer (CASK) — Norwegian 4 "
                        "cent, SAS 8 cent — vilket ger konkurrensfördel "
                        "i normala tider men sårbarhet för distans-"
                        "beroende bränslekostnader.\n\n"
                        "SAS nätverksmodell ger högre intäkter per "
                        "passagerare (Yield) genom affärsresenärer "
                        "och transfer-passagerare, men också högre "
                        "kostnader för hub-drift och interkontinental "
                        "flotta. Yield 2019 var 8 cent per "
                        "passagerarkilometer för SAS jämfört med 5 cent "
                        "för Norwegian."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk flyganalys fokuserar på tre variabler: "
                "CASK (kostnad per tillgänglig sätkilometer), RASK "
                "(intäkt per tillgänglig sätkilometer) och "
                "beläggningsgrad."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "CASK-beräkning: totala rörelsekostnader "
                        "dividerat med tillgängliga sätkilometer "
                        "(ASK). SAS hade 2019 CASK på 8 cent "
                        "varav bränsle 2 cent, personal 2,4 cent, "
                        "flygplan 0,8 cent och övrigt 2,8 cent. "
                        "Norwegian hade CASK på 4 cent — hälften av "
                        "SAS — vilket förklarar varför Norwegian "
                        "kunde konkurrera på lågpris.\n\n"
                        "RASK beräknas som totala intäkter dividerat "
                        "med ASK. SAS hade RASK på 8,3 cent 2019, "
                        "vilket gav bruttomarginal på 4 procent (8,3 "
                        "minus 8,0). För att nå 8 procents bruttomarginal "
                        "behövde SAS höja RASK till 8,7 cent eller "
                        "sänka CASK till 7,6 cent — ingen av dessa "
                        "var möjlig utan omfattande omstrukturering.\n\n"
                        "Beläggningsgrad (Load Factor) är den tredje "
                        "variabeln — SAS hade 2019 beläggning på 78 "
                        "procent jämfört med Norwegian på 88 procent. "
                        "Skillnaden förklaras av SAS interkontinentala "
                        "rutter med lägre beläggning, medan Norwegian "
                        "hade korta europeiska rutter med full beläggning."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "CASK-gapet mellan SAS (8 cent) och Norwegian "
                        "(4 cent) förklarar SAS oförmåga att konkurrera "
                        "på pris — gapet kan inte stängas utan att "
                        "SAS helt byter affärsmodell."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Yield: intäkt per "
                        "passagerarkilometer — centralt mått för "
                        "flygbolagets prissättningsmakt och "
                        "kundsegment."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Bränslehedging är den fjärde kritiska "
                        "variabeln. Norwegian hade 2020 hedging på "
                        "60 procent av bränslebehovet till 60 dollar "
                        "per fat — när oljepriset steg till 100 dollar "
                        "sparade Norwegian 40 dollar per fat på hedgade "
                        "volymer. SAS hade ingen hedging och var "
                        "fullt exponerad.\n\n"
                        "Swedavia (statligt flygplatsbolag) är en annan "
                        "del av svensk flygsektor med annan riskprofil. "
                        "Swedavia driver 10 flygplatser i Sverige med "
                        "intäkter från landningsavgifter (60 procent) "
                        "och kommersiella intäkter (40 procent) — "
                        "monopol-liknande position med stabil "
                        "kassaflödesprofil."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Vanliga fällor i flyganalys inkluderar att extrapolera "
                "bra år till normala år och att underskatta "
                "konkursrisken i djupa recessioner."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Cykelfällan: flygbolag har typiskt 7-årig "
                        "cykel där 2 år är bra, 3 år normala och 2 år "
                        "dåliga. Investor som tittar på ett bra år "
                        "extrapolerar till 7-års-snitt och får 30 "
                        "procent för hög värdering. SAS rapporterade "
                        "2015 vinst på 1,5 miljarder — investerare som "
                        "extrapolerade fick 2018 förlust på 1,5 "
                        "miljarder, en svängning på 3 miljarder.\n\n"
                        "En annan fälla är att förväxla tillfälliga "
                        "bränslebesparingar med strukturella "
                        "förbättringar. SAS rapporterade 2015 att "
                        "bränsleeffektiviteten förbättrats med 8 procent "
                        "via nya Airbus A320neo — men 6 procent av "
                        "förbättringen var engångseffekt av lågt "
                        "oljepris, inte strukturell.\n\n"
                        "En tredje fälla är att underskatta "
                        "kollektivavtalens stelhet. SAS hade 2019 90 "
                        "procent av personalen i kollektivavtal med "
                        "förhandlade löner — ingen flexibilitet att "
                        "sänka kostnader i kris. Norwegian hade bara "
                        "40 procent i kollektivavtal och kunde därmed "
                        "förhandla om löner under pandemin."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Flygbolag med CASK över 7 cent kan inte "
                        "konkurrera med lågprisflyg — SAS 8 cent "
                        "var en strukturell nackdel som inte kunde "
                        "lösas utan fullständig omstrukturering."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Bränslehedging: finansiellt avtal som "
                        "låser bränslepris för framtida period — "
                        "vanligtvis 50–80 procent av behovet "
                        "6–12 månader framåt."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En fjärde fälla är att ignorera leasing-"
                        "åtaganden. SAS hade 2020 lease-åtaganden på "
                        "50 miljarder kronor för 80 flygplan — dessa "
                        "skulder syns inte i balansräkningen men "
                        "utgör betydande framtida kontantutflöden. "
                        "Investor som tittade på skuldsättningsgrad "
                        "missade denna risk.\n\n"
                        "Slutligen är konkursrisk en särskild fälla. "
                        "Flygbolag har 5-procentig årlig konkursrisk "
                        "i normala tider och 15-procentig i kriser. "
                        "SAS överlevde 2020–2022 endast genom statliga "
                        "garantier och rekonstruktion — privatinvesterare "
                        "förlorade 100 procent av sitt värde."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-integrationen utesluter flygbolag från "
                "standardportföljer och tillåter endast flygplatser "
                "och komponenttillverkare i riskbegränsade positioner."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1-metodiken klassar flygaktier i tre "
                        "kategorier: nätverksflyg (SAS, Lufthansa), "
                        "lågprisflyg (Norwegian, Ryanair) och "
                        "flygkomponenter (GKN Aerospace, Saab). "
                        "Nätverksflyg undviks helt på grund av CASK "
                        "över 7 cent. Lågprisflyg tillåts med maxvikt "
                        "1 procent. Flygkomponenter tillåts med "
                        "maxvikt 2 procent.\n\n"
                        "SAS klassades 2015 i AKM1-modellen som "
                        "high-risk med V12 (balansräkningskvalitet) 3 "
                        "och V14 (konkurrenssituation) 9 på grund av "
                        "lågprisflygkonkurrens. AKM1 1.1 gav automatisk "
                        "säljsignal 2018 när bruttomarginal föll under "
                        "3 procent.\n\n"
                        "Swedavia är inte börsnoterat men är referens-"
                        "punkt för svensk flygplatsverksamhet — AKM1 "
                        "skulle klassa Swedavia som kvalitetsakti med "
                        "monopol-position och stabil kassaflödesprofil. "
                        "Investor kan exponera sig mot flygplatser "
                        "via Avinor (Norge) eller Schiphol (Nederländerna)."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 1.1 utlöstes säljsignal för SAS redan "
                        "2018 när CASK översteg 8 cent — investerare "
                        "som följde modellen undvik kollaps 2020–2022."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Going concern-värdering: värdering av bolag "
                        "som pågående verksamhet — flygbolag ska "
                        "värderas som going concern endast om "
                        "kassaflödet är positivt över cykel."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "GKN Aerospace (brittiskt-svenskt) är den "
                        "enda flygkomponent-tillverkaren i svensk "
                        "portfölj — AKM1 1.1 ger maxvikt 2 procent "
                        "på grund av långsiktiga kontrakt med Airbus "
                        "och Boeing. Komponenttillverkare har brutto-"
                        "marginal på 25–30 procent, klart bättre än "
                        "flygbolagens 4 procent.\n\n"
                        "Saab är den andra svenska flygaktören men "
                        "är inte kommersiellt flygbolag — Saab "
                        "tillverkar militära flygplan (Gripen E) "
                        "och har helt annan riskprofil. AKM1 1.1 "
                        "klassar Saab som försvarsakti, inte flygakti."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Fallstudier visar hur SAS, Norwegian och Swedavia "
                "har hanterat pandemikrisen och efterföljande "
                "rekonstruktioner."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — SAS rekonstruktion 2022–2024: "
                        "bolaget begärde Chapter 11 juli 2022 med "
                        "1,5 miljarder dollar i skulder. Air France-KLM "
                        "och Castle Lake investerade 25 miljarder i "
                        "utbyte mot 60 procent av aktierna — befintliga "
                        "ägare utspäddes till 0 procent. Investor "
                        "som såg SAS cykelrisk minskade exponeringen "
                        "2020 och undvek totalförlust. Lärdom: "
                        "flygbolag i kris kan ge 100-procentig förlust.\n\n"
                        "Fallstudie 2 — Norwegian 2020–2021: bolaget "
                        "förstatligades 2020 med 3 miljarder i "
                        "stöd, återgick till börsen 2021 med 50 "
                        "procent mindre flotta och ny affärsmodell "
                        "med endast korta europeiska rutter. Investor "
                        "som förstod att Norwegian kunde omstrukturera "
                        "kunde köpa aktien 2021 till 30 kr och sälja "
                        "2023 till 80 kr.\n\n"
                        "Fallstudie 3 — Swedavia 2020: intäkterna "
                        "föll 70 procent när flygtrafiken kollapsade, "
                        "men staten backade upp bolaget med 5 miljarder "
                        "i krediter — flygplatser anses systemkritiska. "
                        "Lärdom: flygplatser har lägre konkursrisk än "
                        "flygbolag på grund av statligt ägande och "
                        "monopol-position."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SAS investerare förlorade 100 procent 2022 — "
                        "AKM1-modellen undvek flygbolag sedan 2018 "
                        "på grund av strukturell olönsamhet."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Chapter 11: amerikansk företagsrekonstruktions-"
                        "process som ger skydd mot borgenärer — SAS "
                        "använde 2022 vilket utspädde svenska ägare "
                        "till 0 procent."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Slutlig fallstudie — Braathens 2004: "
                        "norskt flygbolag som gick i konkurs 2004 "
                        "efter priskrig med SAS. Investor som såg "
                        "CASK över 9 cent varnades. Lärdom: "
                        "flygbolag med CASK över 9 cent kan inte "
                        "överleva i längden.\n\n"
                        "Dessa fallstudier visar att svensk flygsektor "
                        "är extremt riskfylld — investerare bör "
                        "undvika flygbolag och exponera sig via "
                        "flygplatser eller komponenttillverkare för "
                        "att få riskjusterad avkastning."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i flyganalys kräver förståelse för "
                "cykelrisk, bränslehedging och skillnaden mellan "
                "flygbolag och flygplatser."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer tre "
                        "specifika variabler: (1) CASK-trend kvartalsvis, "
                        "(2) bränslehedging-procent och genomsnittligt "
                        "säkrat pris, och (3) beläggningsgrad. "
                        "Dessa tre variabler förklarar 80 procent av "
                        "resultatvolatiliteten.\n\n"
                        "Mästerskap innebär också att förstå "
                        "regulatoriska risker — EU:s emissions-"
                        "handelsystem utvidgas till flyg 2024 vilket "
                        "ökar SAS kostnader med 2 miljarder årligen. "
                        "Investor som beaktar detta ser att SAS 2025 "
                        "har extra kostnadspress utöver den normala "
                        "cykeln.\n\n"
                        "Slutligen behärskar mästaren skillnaden "
                        "mellan leasing- och ägda flygplan. SAS "
                        "hade 2020 80 procent leasing vilket gav "
                        "flexibilitet att återlämna plan i kris men "
                        "också högre kostnader i normala tider. "
                        "Lufthansa äger 60 procent av sin flotta — "
                        "lägre kostnader i normala tider men "
                        "svårare att sänka i kris."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "EU:s emissionshandel för flyg 2024 ökar "
                        "svenska flygbolags kostnader med 5–7 procent "
                        "— en strukturell nackdel som inte kan "
                        "kompenseras genom hedging."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "CASK (Cost per Available Seat Kilometer): "
                        "rörelsekostnad dividerat med tillgängliga "
                        "sätkilometer — över 7 cent indikerar "
                        "strukturell olönsamhet för nätverksflyg."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Aktiemarknaden prissätter flygbolag med P/E "
                        "på 5–8 i normala tider och kan gå till P/E 3 "
                        "i kriser — diskonteringen reflekterar "
                        "cykelrisk och konkursrisk. Flygkomponenter "
                        "har P/E på 18–25, klart högre än flygbolag.\n\n"
                        "Mästerskap slutligen innebär att förstå "
                        "skillnaden mellan flygplatser (Swedavia, "
                        "Avinor) och flygbolag (SAS, Norwegian) — "
                        "flygplatser är monopol-aktier med stabil "
                        "kassaflödesprofil, flygbolag är extremt "
                        "cykliska. Investor som söker flygexponering "
                        "bör välja flygplatser över flygbolag."
                    ),
                },
            ],
        },
    ],
}

