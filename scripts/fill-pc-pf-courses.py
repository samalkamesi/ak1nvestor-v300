#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fill-pc-pf-courses.py

Fyller 16 "Praktiska Case" (pc-11..pc-20) och "Portföljförvaltning"
(pf-09..pf-14) kurser i /home/z/my-project/public/deep-courses.json
med skräddarsytt svenskt innehåll:

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

Körs:  python3 /home/z/my-project/scripts/fill-pc-pf-courses.py
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
# Kursdata — skräddarsytt svenskt innehåll för 16 pc/pf-kurser
# ---------------------------------------------------------------------------

COURSES = {}

# ===========================================================================
# pc-11 — Case: Boliden — gruvor
# ===========================================================================
COURSES["pc-11-case-boliden"] = {
    "why": (
        "Boliden är Sveriges största gruv- och smältverksbolag och en direkt "
        "proxy för koppar-, zink- och blypriser som präglar svensk "
        "tillverkningsindustris inputkostnader. För en svensk "
        "retail-investerare illustrerar Boliden hur råvarucyklar, "
        "dollarkänslighet och politiska tillståndsprocesser (Aitik-expansionen "
        "2010, Kevitsa-förvärvet 2016) samverkar. Det är också en lärobok i "
        "hur V19 kapitalförbränning och V03 cyklisk volatilitet fungerar i "
        "praktiken."
    ),
    "history": {
        "origin": (
            "Boliden grundades 1931 i Boliden utanför Skellefteå när ett "
            "konsortium med Hilding Ardén och Oscar Wehtje fann den "
            "guldfyndighet som blev Sveriges rikaste guldkisgruvor under "
            "1930-talet. Företaget noterades på Stockholmsbörsen redan 1932 "
            "och breddades snabbt till koppar, zink och bly via "
            "Rönnskärsverken i Skelleftehamn. Under 1950- och 60-talen växte "
            "Boliden till en av norra Sveriges största industriarbetsgivare "
            "och lade grunden till det svenska gruvklustret i Västerbotten."
        ),
        "evolution": (
            "Under 1990-talet genomgick Boliden en djup kris med fallande "
            "metallpriser och miljökostnader, vilket ledde till förvärv av "
            "kanadensiska Breakwater Resources 1997 och en djup "
            "rättelseemission. År 2001 förvärvades Outokumpus koppar- och "
            "zinkverksamhet, vilket dubblerade bolaget och integrerade "
            "Harjavalta- och Kokkola-smältverken i Finland. År 2016 förvärvades "
            "Kevitsa nickel-koppargruva i norra Finland från First Quantum för "
            "1,2 miljarder dollar, vilket breddade metallportföljen mot "
            "batterimetaller."
        ),
        "modern": (
            "Idag driver Boliden sex gruvor i Sverige, Finland och Irland "
            "samt fem smältverk och är noterat på Nasdaq Stockholm med ett "
            "marknadsvärde kring 75 miljarder kronor (2024). Företaget är en "
            "direktmottagare av elektifieringsvågen — koppar från Aitik och "
            "Kevitsa är kritisk råvara för EV-motorer, vindkraft och elnät. "
            "Produktionen påverkas dock ständigt av politiska tillståndsprocesser, "
            "t.ex. Östra Kevitsa-tillståndet 2023 och Aitiks miljöprövningar, "
            "vilket gör att operationellt och politiskt hänger ihop."
        ),
    },
    "lynchSection": (
        "Lynch skulle uppskatta Bolidens \"tråkiga\" moat i integrerade "
        "smältverk som Rönnskär — kapitalstrukturen och miljöprövningstider "
        "gör dem omöjliga att duplicera i Europa. Han skulle dock varna för "
        "att råvarucykler ofta lurar investerare med låga P/E i toppen, "
        "klassisk \"cyclical earnings trap\"."
    ),
    "grahamSection": (
        "Graham skulle beräkna Bolidens substansvärde utifrån reserver i mark, "
        "smältverkskapacitet och balansräkning och kräva en tydlig margin of "
        "safety mot cykliskt nedpressade metallpriser. Hans defensiva "
        "investerare skulle undvika Boliden i toppen av cykeln och endast "
        "köpa när P/B faller under 1,0 med reservomräkning enligt 2/3-regeln."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar Boliden som renodlat cykliskt via V03 "
        "(cyklisk volatilitet), V19 (kapitalförbränning i topp) och V17 "
        "(utdelningsskillnad över cykeln). Det integrerade 1.1-systemet prövar "
        "Bolidens EV/EBITDA-trend mot 10-årigt kopparpris-genomsnitt och varnar "
        "när multiplar faller parallellt med stigande kapitalförbränning."
    ),
    "chapters": [
        {
            "intro": (
                "Boliden är ett svenskt gruv- och smältverksbolag vars resultat "
                "svänger direkt med koppar-, zink- och blypriser — "
                "grundförståelsen börjar i metallmix och dollarpriser."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Boliden driver sex gruvor (Aitik, Garpenberg, "
                        "Boliden-området i Sverige, Kevitsa och Kylylahti i "
                        "Finland samt Tara i Irland) och fem smältverk "
                        "(Rönnskär, Kokkola och Harjavalta i Norden plus "
                        "Berzelius i Tyskland och Bergsöe i Sverige). "
                        "Intäktsmixen är cirka 50 procent koppar, 30 procent "
                        "zink och rest bly, guld och silver — prissatt i USD "
                        "på LME och LBMA. Det gör Boliden till en direkt proxy "
                        "för dollarnominerade råvarupriser, samtidigt som "
                        "kostnadssidan är lokaliserad i Norden med svenska "
                        "kronor, finska euro och svenska elavtal.\n\n"
                        "Bolidens speciella struktur är integrationen mellan "
                        "gruva och smältverk. Rönnskärsverken i Skelleftehamn "
                        "är ett av få smältverk i världen som kan ta emot "
                        "komplexa kopparkoncentrat med höga halter av arsenik, "
                        "kvicksilver och fluor. Detta skapar ett strukturellt "
                        "moat — när internationella gruvor har svårt att sälja "
                        "sin koncentrat blir Boliden en naturlig mottagare "
                        "till fördelaktiga villkor.\n\n"
                        "Det integrerade affärsmodellen gör att Boliden har "
                        "två intäktsströmmar som rör sig olika i cykeln: "
                        "gruvintäkter (positivt korrelerade med metallpriser) "
                        "och smältverksintäkter via behandlingsavgifter "
                        "(negativt korrelerade med metallpriser). Detta är "
                        "centralt att förstå innan man läser en enda "
                        "kvartalsrapport."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Bolidens verkliga marginaldrivare är "
                        "smältningsavgifterna (TC/RC) i Rönnskär och Kokkola — "
                        "när gruvor globalt stryper produktion vid låga priser "
                        "stiger TC och Bolidens smältverksmarginal expanderar, "
                        "tvärtemot vad intuition om \"dåligt kopparpris\" säger."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Smältningsavgift (Treatment Charge, TC): den avgift "
                        "i USD per ton koncentrat som gruvan betalar smältverket "
                        "för att förädra koncentrat till ren metall — en "
                        "cyklisk vinstvariabel för integrerade smältverk."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För en svensk investerare betyder detta att man inte "
                        "kan läsa Boliden som en vanlig råvaruaktie. När "
                        "kopparpriset rasar 20 procent faller Bolidens "
                        "gruvintäkter, men samtidigt stiger TC-avtalet med "
                        "cirka 30 procent vilket delvis kompenserar. Detta är "
                        "anledningen till att Boliden historiskt haft lägre "
                        "vinstvolatilitet än rena gruvor som Lundin Mining "
                        "eller First Quantum.\n\n"
                        "Den omedelbara kopplingen till svensk industriell "
                        "inflation är också central — när Boliden höjer "
                        "zink- och blyleveranspriser slår det igenom i "
                        "stålverkens inputkostnader (SSAB) och därmed i "
                        "producerat PPI. Svensk retail-investerare bör därför "
                        "läsa Boliden som en framåtindikator för svensk "
                        "tillverkningsinflation."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Boliden-analys handlar om att koppla LME-metallpriser "
                "till kvartalsrapportens EBITDA-marginal via produktionsvolymer "
                "och smältningsavtal."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Bolidens kvartalsrapport publiceras i standardformat "
                        "med fyra segment: Business Area Mines (Gruvor), "
                        "Business Area Smelters (Smältverk), Business Area "
                        "Copper (Koppar) och Business Area Other. Analystens "
                        "första uppgift är att bryta ut \"underliggande "
                        "EBITDA\" från rapporterat EBITDA genom att justera för "
                        "ändrade metallpriser jämfört med föregående kvartal. "
                        " tumregeln är att en 10-procentig kopparprisrörelse "
                        "svänger Bolidens kvartals-EBITDA med cirka 600 MSEK.\n\n"
                        "Produktionsdata ska matchas mot guidancen från "
                        "Capital Markets Day. Aitik producerade 2023 cirka 40 "
                        "Mton malm och Kevitsa cirka 8 Mton — avvikelser på "
                        "mer än 5 procent från guidance är en röd flagga för "
                        "operationella problem. Vidare ska man följa "
                        "treatment charges publicerade av Fastmarkets och "
                        "Antaike för zink respektive koppar, eftersom dessa "
                        "bestämmer smältverkssegmentets marginal.\n\n"
                        "Slutligen måste USD/SEK-valuta effekten isoleras. "
                        "Boliden rapporterar i SEK men 95 procent av "
                        "intäkterna är i USD. En svag krona (USD/SEK > 11) "
                        "boostar resultatet mekaniskt — och tvärtom. Analysten "
                        "bör justera rapporterat EBITDA till konstant "
                        "växelkurs för att se den operationella utvecklingen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Den operationella edgen ligger i att separat följa "
                        "malmproduktion (tonnage × grade × recovery) och "
                        "smältverksutnyttjande — gruvor driver volymen, "
                        "smältverk driver marginalen."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Metal equivalent: en sammanvägning av en gruvas "
                        "multipelmetallproduktion till en enda "
                        "ekvivalenttonnage baserat på metallpriser — används "
                        "för att jämföra gruvor med olika metallmix."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Läs Bolidens Q-rapport och "
                        "extrahera produktion per metall; 2) Hämta LME 3M "
                        "för koppar och zink från kvartalet; 3) Hämta "
                        "Fastmarkets TC-zink och Antaike TC-koppar; 4) "
                        "Beräkna smältverksmarginal per ton; 5) Justera för "
                        "USD/SEK; 6) Jämför \"äkta\" EBITDA-marginal med "
                        "föregående kvartal och med föregående år.\n\n"
                        "Ett varningens exempel: Q3 2022 rapporterade Boliden "
                        "en extremt stark EBITDA, men 70 procent av ökningen "
                        "kom från stigande TC-koppar och svag krona — "
                        "operationellt var gruvorna mediokra. Den som inte "
                        "bröt isär effekterna köpte aktien på en cykeltopp "
                        "och förlorade 40 procent under kommande 12 månader."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre vanliga fällor i Boliden-analys är cyklisk P/E-tolkning, "
                "miljöprovisionsskevheter och förbisedd dollarkänslighet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den första fällan är den klassiska cyclical earnings "
                        "trap: Boliden hade 2007 ett P/E på 4 inför den "
                        "kommende finanskrisen och 2022 P/E på 7 under "
                        "metallcykeltoppen — båda gångerna var lågt P/E en "
                        "varning, inte en köpsignal. Motsvarande hade Boliden "
                        "P/E över 25 i 2015 års botten — då var det köpläge. "
                        "Detta är raka motsatsen till hur Graham-tänkande "
                        "investerare vanligtvis tolkar P/E.\n\n"
                        "Den andra fällan är miljöprovisioner. Boliden "
                        "bokför löpande provisioner för nedläggning och "
                        "efterbehandling av gruvor och smältverk — dessa "
                        "rörs ofta med 100-tals MSEK per år och kan vända "
                        "från \"kostnad\" till \"vinst\" om antingen "
                        "diskonteringsräntan ändras eller teknisk lösning "
                        "blir billigare. Tara-nedläggningen 2023 gav en "
                        "nedskrivning på 1,2 mdr kr, men samtidigt återfördes "
                        "300 MSEK i provisioner från Rönnskär.\n\n"
                        "Den tredje fällan är valutaförbisettande. Många "
                        "retail-investerare ser Boliden som en svensk krona-"
                        "investering, men i praktiken är det en dollaraktie "
                        "med svensk kostnadsbas. USD/SEK-rörelser från 8 till "
                        "11 (2019-2022) boostade EBITDA-marginalen från 18 "
                        "till 28 procent — en effekt som snabbt vänder när "
                        "kronan stärks."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Fällan: se lågt P/E i en råvarutopp och tro att "
                        "bolaget är billigt — Lynch varnade uttryckligen för "
                        "detta i \"One Up on Wall Street\" med integrerade "
                        "oljebolag."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Cyclical earnings trap: fenomen där P/E sjunker när "
                        "vinsten cykeltoppar (ofta falsk \"billighet\") och "
                        "stiger när vinsten bottnar (ofta falsk \"dyrhet\") — "
                        "inverterad mot normal investerarlogik."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering av dessa fällor kräver tre "
                        "kontroller. För P/E-fällan: använd Shillers "
                        "CAPE-beräkning på cykligenjusterade vinster, eller "
                        "använd \"mid-cycle EBITDA\" baserad på 10-årigt "
                        "snitt av metallpriser. För miljöprovisioner: läs "
                        "not 14 i årsredovisningen och följa rörelser i "
                        "diskonteringsränta (som kan variera från 3 till 6 "
                        "procent och därmed halvera/dubbla PV).\n\n"
                        "För valutafällan: köp Boliden när både metallpriser "
                        "OCH USD/SEK är förtryckta, inte bara en av faktorerna. "
                        "Analystens edge ligger i att modellera framåt 3-5 år "
                        "med en \"normal\" metallcykel och en \"normal\" "
                        "växelkurs (ofta USD/SEK 9,5) — det ger en robust "
                        "värdering som inte svävar med cykeltoppar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken kartlägger Boliden som cykliskt råvarucase "
                "via V03, V17 och V19 i en integrerad 1.1-modul."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1:s V03-variabel (cyklisk volatilitet) flaggar "
                        "Boliden som en aktie där årsvis EBITDA varierar med "
                        "mer än 40 procent över en 10-årscykel — samma "
                        "kategori som SSAB och Atlas Copco. V19 "
                        "(kapitalförbränning) spårar capex/EBITDA och "
                        "flaggar när värdet överstiger 1,0 — 2007 (10/10 "
                        "Aitik-expansion), 2017 (Kevitsa-integration) och "
                        "2022 (Tara-omstrukturering) var alla V19-toppar.\n\n"
                        "V17 (utdelningssäkerhet) mäter utdelningstäckning "
                        "och historisk trend. Boliden skar utdelningen 2009 "
                        "(finanskrisen), 2013 (Outokumpu-integrationen) och "
                        "höll stilla 2020 (Covid) — varje gång inom 18 "
                        "månader från en V19-toppsignal. Detta gör V17 till en "
                        "bakåtblickande bekräftelse på V19-utlösning.\n\n"
                        "AKM1 1.1-integrationen kör en Monte Carlo på LME "
                        "3M-koppar, LME-zink och USD/SEK över 1000 banor och "
                        "beräknar Bolidens riskjusterade inträde. Systemet "
                        "lägger till en 1,5x cykelriskpremie i toppar och en "
                        "0,8x riskpremie i bottnar — och justerar positions-"
                        "storlek enligt Kelly-kriteriet på 25 procent av "
                        "säkerhetsmarginalen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med Boliden är att kombinera V19 med "
                        "V17 — varje gång Boliden har höjt capex över 100 "
                        "procent av avskrivningar har utdelningen skurits "
                        "inom 18 månader."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "AKM1 1.1-integration: kombinerar V03/V17/V19 till en "
                        "cykelriskpremie som prövar varje cykliskt bolag mot "
                        "20-årig råvarupriscykel och historiska "
                        "utdelningsbeslut."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken innebär 1.1-integrationen att Boliden "
                        "automatiskt klassas som \"reduced position\" när V19 "
                        "överstiger 1,0 och V17 faller under 2,0 — oavsett "
                        "vad P/E eller EV/EBITDA visar. Detta varnar systemet "
                        "i maj 2022 när Boliden såg billigt ut på P/E 7 men "
                        "V19 var 1,3 och V17 föll mot 1,8 — aktien föll 35 "
                        "procent under följande 12 månader.\n\n"
                        "För svensk retail-investerare innebär detta att "
                        "AKM1 ger en systematisk vårdnadstäckning av "
                        "mänsklig cykeleufori. Den som följer 1.1-systemets "
                        "positionssizing slipper den vanligaste Boliden-"
                        "fällan: köp i topp, sälj i botten."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre konkreta Boliden-fallstudier illustrerar cykelrisk och "
                "value-skapande: Aitik-expansionen 2010, Kevitsa-förvärvet "
                "2016 och Tara-nedläggningen 2023."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Aitik-expansionen 2010: Boliden investerade "
                        "5,9 mdr kr i att dubblera Aitik till 36 Mton per år. "
                        "Produktionen kom igång under 2010 års kopparpristopp "
                        "(3 500 USD/ton) och aktien föll till 25 kr under "
                        "2011. Men expansionen betalade sig enormt under "
                        "2017-2022 supercykel (koppar 4 500-9 000 USD/ton) — "
                        "aktien steg från 25 kr (2009) till 340 kr (2022 "
                        "topp), en 13x-avkastning på 13 år. Lärdom: "
                        "kapacitetsexpansion i cykelbotten betalar stordåd.\n\n"
                        "Fall 2 — Kevitsa-förvärvet 2016: Boliden betalade "
                        "1,2 mdr USD till First Quantum för en nickel-koppar-"
                        "PGE-gruva i norra Finland. Finansierad med riktad "
                        "emission till existerande aktieägare (inget "
                        "utspädningsskada). Initialt problematisk med "
                        "geologisk varians, men 2019-2022 bidrog Kevitsa med "
                        "15 procent av koncern-EBITDA. Lärdom: "
                        "multi-metallförvärv i botten av gruvcykeln är "
                        "bättre än specialiserade toppförvärv.\n\n"
                        "Fall 3 — Tara-nedläggningen juni 2023: Irländska "
                        "Tara (Europas största zinkgruva) lades ner efter "
                        "zinkprisfall från 3 500 till 2 400 USD/ton och hög "
                        "energikostnad. 800 jobb berördes, Boliden tog 1,2 "
                        "mdr kr i nedskrivning. Startades om 2024 efter "
                        "löneomförhandling. Lärdom: även en solid operatör "
                        "kan inte slå zinkcykeln."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: framgångarna (Aitik, Kevitsa) kom "
                        "från cykelbotteninvesteringar med låg V19-flagga; "
                        "missödet (Tara) uppstod när bolaget höll uppe "
                        "produktionen i cykeltopp."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Impairmenttest: IFRS-test där bolaget måste skriva "
                        "ner tillgångar om återvinningsbart värde understiger "
                        "bokfört värde — Tara 2023 gav 1,2 mdr kr nedskrivning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret i alla tre fallen är Lynch-principen: "
                        "\"Köp i cykelbotten med kapacitet på plats.\" Aikit "
                        "och Kevitsa var båda \"tur tajming\" men egentligen "
                        "systematisk AKM1-tajming — investeringarna kom när "
                        "V19 var låg och metallpriser var deprimerade.\n\n"
                        "Tara-fallet demonstrerar den omvända fällan: Boliden "
                        "expanderade Tara 2018 när zink var 3 500 USD/ton — "
                        "när priset föll till 2 400 USD/ton 2023 blev "
                        "produktionen ohållbar. Den som hade följt V19 hade "
                        "sett riskbygget redan 2018-2019."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Boliden-analys kräver förståelse för "
                "metallcykler, smältverksmarginaler och europeisk gruvpolitik "
                "på en gång."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern läser inte bara års-"
                        "redovisningen utan spårar Fastmarkets TC/RC-benchmarks, "
                        "ICSG:s (International Copper Study Group) "
                        "supply-demand-balance och svensk MKB-policy "
                        "(Minerallagen 1991:45). Man korskopplar Bolidens "
                        "kvartalsproduktion mot LME-lagerstockar och "
                        "Shanghai Futures Exchange-lager — stigande lager i "
                        "Shanghai varnar för svag kinesisk efterfrågan som "
                        "ofta drabbar Boliden 2-3 kvartal senare.\n\n"
                        "Politisk risk har blivit en primär variabel. Natura "
                        "2000-prövningar, samebete och EU Critical Raw "
                        "Materials Act 2024 påverkar Bolidens expansions-"
                        "möjligheter. Den avancerade analytikern följer "
                        "Mark- och Miljödomstolens prövningar av Östra "
                        "Kevitsa (2023) och Aitiks tillståndsutvidgning, "
                        "eftersom processförseningar kan skjuta kapacitets-"
                        "ökningar 2-3 år.\n\n"
                        "Slutligen förstår mästaren att Boliden är ett "
                        "strategiskt EU-tillgång i grön omställning — "
                        "Rönnskär är enda europeiska smältverket som kan "
                        "hantera komplexa koncentrat, vilket ger Boliden en "
                        "struktural förhandlingsposition mot gruvor i Syd-"
                        "amerika och Afrika."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna edgen ligger i att se Boliden som integrerad "
                        "gruva-smältverk-pipeline där smältverksmarginaler "
                        "stiger när gruvor lider — detta dämpar Bolidens "
                        "cykelvolatilitet jämfört med rena gruvor."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Komplex koncentrat: kopparkoncentrat med höga halter "
                        "av föroreningar (arsenik, kvicksilver, fluor) som "
                        "endast få smältverk i världen — däribland Rönnskär — "
                        "kan processa kommersiellt."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att bygga en fullständig "
                        "cykelmodell: modellera LME 3M-koppar/zink/bly över "
                        "5-årsscenarier, applicera Bolidens publika volymer, "
                        "beräkna TC/RC-inkomst baserad på Antaike-benchmark, "
                        "faktor in USD/SEK och provision för miljökapex "
                        "(typiskt 5-7 procent av intäkter). Output ska matcha "
                        "bolagets egen guidance inom ±10 procent.\n\n"
                        "När analytikern kan detta har de gått från "
                        "kommentator till conviction-investerare. Då kan de "
                        "identifiera när marknaden feltar cykelposition — "
                        "som 2022 när Boliden såldes som \"billig\" på "
                        "cykeltopp och 2015 när Boliden ignorerades som "
                        "\"dyr\" på cykelbotten. Det är skillnaden mellan att "
                        "följa priset och att förstå värdet."
                    ),
                },
            ],
        },
    ],
}

# ===========================================================================
# pc-12 — Case: SKF — industri-moat
# ===========================================================================
COURSES["pc-12-case-skf"] = {
    "why": (
        "SKF är Sveriges äldsta börsnoterade industriföretag och en renodlad "
        "proxy för global industriproduktion — över 80 procent av intäkterna "
        "kommer från utlandet. För en svensk retail-investerare visar SKF hur "
        "ett till synes tråkigt moat-bolag (kullager) genererar kraftiga "
        "konjunktursvängningar. Det är också en skola i hur V14 marginalpress "
        "och V09 kundkoncentration fungerar i global B2B-kontext."
    ),
    "history": {
        "origin": (
            "SKF grundades 1907 i Göteborg av Sven Wingqvist som hade uppfunnit "
            "det sfäriska självjusterande kullagret 1905 — en innovation som "
            "löste det industriella problemet med axialbelastning i "
            "textilmaskiner. Aktierna introducerades på Stockholmsbörsen redan "
            "1907 och bolaget blev snabbt globalt med dotterbolag i 32 länder "
            "redan 1912. Wingqvist rekryterade även en ung fransman vid namn "
            "Henry Söderberg och anställde sedermera Axel Broms som VD."
        ),
        "evolution": (
            "Under 1920-talet expanderade SKF aggressivt i USA och byggde "
            "fabriker i Philadelphia och Chicago — bolaget var vid den tiden "
            "världens i särklass största kullagertillverkare. Volvo föddes "
            "inom SKF 1915 som en bil-dotterbolag och såldes ut 1935, men "
            "SKF:s varumärke \"Volvo\" (latin för \"jag rullar\") levde kvar. "
            "Under 1970-80-talen breddades verksamheten till stål,verktyg och "
            "specialkomponenter, men 1990-talet innebar avknoppning tillbaka "
            "till kärnan."
        ),
        "modern": (
            "Idag är SKF noterat på Nasdaq Stockholm med en omsättning kring "
            "90 miljarder kronor och 40 000 anställda i över 100 länder. "
            "Bolaget är fortfarande världens största kullagertillverkare med "
            "cirka 20 procent av den globala marknaden, men konkurrensen från "
            "japanska NTN och NSK samt tyska Schaeffler har ökat. Under 2020-"
            "talet har SKF satsat på \"Smart and Clean\"-strategin med "
            "fokus på digitala lagerlösningar, sensorer och fossilfria "
            "stålleveranser från Ovako (SKF:s ståldotterbolag i Hofors)."
        ),
    },
    "lynchSection": (
        "Lynch skulle uppskatta SKF som ett klassiskt \"vans trailers\"-case — "
        "ett tråkigt moat-bolag som vinner på industriell återhämtning. Han "
        "skulle dock varna för att SKF:s volatilitet i cykelvändningar gör "
        "P/E-tolkning besvärlig och att bolagets stora exponering mot "
        "fordonsindustrin är en dold cykelrisk."
    ),
    "grahamSection": (
        "Graham skulle betrakta SKF som en \"bond-like\"-aktie i botten av "
        "cykeln där utdelningssäkerheten (V17) och substansrabatten ger en "
        "tydlig säkerhetsmarginal. Hans defensiva investerare skulle kräva "
        "P/B under 1,5 och utdelningstäckning över 2,0 innan inträde."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar SKF via V14 (marginalpress i cykelbotten), "
        "V09 (kundkoncentration mot fordons- och windpower-sektor) och V17 "
        "(utdelningssäkerhet). 1.1-integrationen prövar SKF:s EBIT-marginal "
        "mot global PMI och varnar när marginalen faller under 8 procent."
    ),
    "chapters": [
        {
            "intro": (
                "SKF är en global kullagertillverkare vars resultat svänger "
                "direkt med global industriproduktion och fordonsvolymer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SKF delar in verksamheten i tre segment: Industrial "
                        "(50 procent av försäljning), Automotive (30 procent) "
                        "och Aerospace & Special (20 procent). Varje segment "
                        "har olika cykelprofile — Industrial följer global "
                        "PMI, Automotive följer bilförsäljning och Aerospace "
                        "följer flygtrafik och försvarsinvesteringar. "
                        "Konkurrenssituationen är oligopolartad med SKF, "
                        "Schaeffler (Tyskland), NTN och NSK (Japan) som "
                        "dominerar premiumsegmentet och kinesiska C&U och "
                        "ZWZ i volymsegmentet.\n\n"
                        "Moatet ligger tre steg djupare än själva "
                        "kullagertillverkningen. För det första: SKF säljer "
                        "inte bara lager utan \"lagerlösningar\" med "
                        "ingenjörskonsultation, vilket skapar kontinuerlig "
                        "intäkt. För det andra: kunder designar in SKF:s "
                        "lager i sina maskiner och byter inte leverantör "
                        "utan omtest — bytestiden är 3-7 år. För det tredje: "
                        "Ovako-stålet (SKF-ägt sedan 2006) ger leveranssäkerhet "
                        "på specialstål som konkurrenterna saknar.\n\n"
                        "Detta gör SKF till ett moat-bolag, men moatet "
                        "skyddar inte mot cykelvolatilitet — när global PMI "
                        "faller under 50 drabbas SKF nästan omedelbart genom "
                        "kortare leveranstider och lägre volymer."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SKF:s verkliga moat är inte kullagret i sig utan "
                        "design-in-processen — när Volvo CE designar en ny "
                        "hjullastare ligger SKF:s lager i CAD-filen från "
                        "start, vilket binder kunden 5-10 år."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Design-in: när en komponenttillverkare blir "
                        "specificerad i kundens tekniska ritning och därmed "
                        "blir standard under hela produktens livscykel — "
                        "skapar hög kundlojalitet och bytesbarriär."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare är SKF ett typiskt "
                        "\"tråkigt moat\"-bolag som ändå kan ge 30-50 "
                        "procent svängningar i aktiekursen över en cykel. "
                        "Skillnaden mot en råvaruaktie är att SKF har en "
                        "stabilare ROIC (12-15 procent) över cykeln tack vare "
                        "moatet, men volatiliteten i kvartalsvinsten är "
                        "fortfarande hög.\n\n"
                        "En annan svensk-specifik aspekt är att SKF är en av "
                        "få svenska industriaktier som ger direkt exponering "
                        "mot amerikansk industriproduktion (24 procent av "
                        "intäkterna). När US ISM PMI stiger brukar SKF slå "
                        "marknaden — och tvärtom."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk SKF-analys kräver förståelse av segmentmix, "
                "design-in-effekter och global PMI-koppling."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SKF publicerar månatlig försäljning (en svensk "
                        "olycksfågel-fördel) som delar upp organisk "
                        "tillväxt i volym, pris och mix. Analysten ska följa "
                        "dessa tre komponenter separat — volym följer global "
                        "PMI, pris är en inflationseffekt (skulle falla i "
                        "kontraktion) och mix är SKF:s förmåga att flytta "
                        "towards mer lönsamma speciallager. Enbart mix-styrd "
                        "tillväxt (volym 0 procent, mix +3 procent) är en "
                        "väldigt positiv signal.\n\n"
                        "Kvartalsrapporten har tre viktiga operationella "
                        "mått: leveransperformance (målet >95 procent), "
                        "kostnadsränta (EBIT-marginal >10 procent) och "
                        "organisk tillväxt vs global PMI. Om SKF växer "
                        "snabbare än PMI indikerar detta marknadsandels-"
                        "vinst; om SKF växer långsammare indikerar det "
                        "marknadsandelsförlust till asiatiska konkurrenter.\n\n"
                        "Automotive-segmentet ska analyseras separat eftersom "
                        "EV-transitionen påverkar SKF dubbelbottnat. På "
                        "någon sida minskar lagerbehovet i EV (färre "
                        "komponenter), men å andra sidan kräver EV-motorer "
                        "snabbgående lager av högre kvalitet. SKF rapporterar "
                        "EV-andel av Automotive och målet är 30 procent till "
                        "2030 — följ detta mått."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Viktiga KPI:er att följa är organisk volymtillväxt "
                        "vs global PMI, design-in-pipeline (antal projekt i "
                        "testfas) och Automotive EV-andel — dessa tre ger "
                        "tidig varning om moat-erosion eller cykelvändning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Design-in-pipeline: antal nya "
                        "kundingenerjörsprojekt där SKF:s lager är specificerat "
                        "men ännu inte i produktion — ledande indikator för "
                        "framtida volym."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Hämta IHS Markit global PMI "
                        "för innevarande månad; 2) Jämför med SKF:s senaste "
                        "månadsrapport; 3) Kontrollera att volym/PMI-ratio "
                        "ligger runt 1,0; 4) Läs kvartalsrapportens "
                        "design-in-kommentar; 5) Kontrollera Automotive "
                        "EV-andel mot målet; 6) Spåra EBIT-marginal mot 10 "
                        "procent-målet.\n\n"
                        "Ett exempel: Q2 2023 rapporterade SKF volym -4 "
                        "procent när global PMI var 49 — det var normalt. "
                        "Men mix +2 procent visade design-in-förtjänst. Den "
                        "som bara tittade på volym hade sålt; den som såg "
                        "mix-tillväxten förstod att moatet höll. Aktien steg "
                        "30 procent under kommande 6 månader."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i SKF-analys: konjunkturcykel-misstolkning, "
                "EV-transition-övertro och stålprisförbisettande."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Konjunkturcykel-misstolkning: SKF har "
                        "historiskt sett sitt lägsta P/E vid cykeltopp och "
                        "högsta P/E vid cykelbotten. 2007 hade SKF P/E 8 inför "
                        "finanskrisen, 2015 P/E 20 vid industriell botten. "
                        "Investerare som köpte 2007 \"för att det var billigt\" "
                        "förlorade 60 procent; de som köpte 2015 \"trots att "
                        "det var dyrt\" fördubblade kapitalet på 3 år.\n\n"
                        "Fälla 2 — EV-transition-övertro: SKF-ledningen har "
                        "sedan 2018 framhållit att EV kommer att driva "
                        "struktural mix-förbättring. Verkligheten är mer "
                        "nyanserad — EV-lager har högre enhetspris men "
                        "lägre volym (EV har 60 procent färre lager än ICE). "
                        "Nettoeffekten 2020-2024 har varit neutral snarare än "
                        "positiv. Den som köpte SKF enbart för EV-tesen 2021 "
                        "har underpresterat marknaden.\n\n"
                        "Fälla 3 — Stålprisförbisettande: SKF köper 700 000 "
                        "ton specialstål per år, varav 40 procent från eget "
                        "Ovako. När stålpriser stiger 30 procent faller "
                        "SKF:s bruttomarginal mekaniskt med cirka 2 "
                        "procentenheter — om inte prishöjningar kan "
                        "implementeras inom 6 månader. Många retail-investerare "
                        "missar denna link mellan Ovako-priser och SKF-marginal."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Fällan: tolka SKF:s design-in-ökning som automatisk "
                        "vinsttillväxt — design-in tar 2-4 år att konvertera "
                        "till faktisk volym och kan avbrytas av "
                        "konjunkturförsämring."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Mix-tillväxt: organisk tillväxt drivet av "
                        "produktmix-förskjutning mot dyrare eller mer "
                        "lönsamma produktlinjer — isoleras från volym- och "
                        "priseffekter i SKF:s rapportering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För konjunkturfällan, beräkna "
                        "\"mid-cycle EPS\" baserad på genomsnittligt "
                        "EBIT-marginal över 10 år (SKF:s snitt är 11 procent) "
                        "och normaliserad försäljning. Detta ger en mer "
                        "stabil värdering. För EV-fällan, vänta på bevisning — "
                        "följ kvartalsvis EV-andel och marginal per EV-lager "
                        "snarare än ledningsnarrativ.\n\n"
                        "För stålfällan, spåra Ovako:s kvartalsprislistor "
                        "(publiceras årligen) och korsa mot SKF:s "
                        "råvarukostnad-kommentar i rapporten. När SKF "
                        "varnar för \"input cost pressure\" kommande kvartal "
                        "vet du att marginalen faller — oavsett vad "
                        "volymtillväxten visar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken kartlägger SKF via V14 (marginalpress), "
                "V09 (kundkoncentration) och V17 (utdelningssäkerhet) i "
                "en integrerad 1.1-modul."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V14 (marginalpress) spårar SKF:s EBIT-marginal mot "
                        "10-årigt genomsnitt (11 procent). När marginalen "
                        "faller under 8 procent flaggas V14 rött — detta "
                        "hände 2009, 2015, 2020 och 2023. V09 "
                        "(kundkoncentration) mäter andel intäkter från "
                        "topp-10 kunder; SKF har ovanligt låg koncentration "
                        "(<15 procent) vilket är moat-bekräftande, men "
                        "koncentration mot fordonssektor (30 procent) är en "
                        "dold cykelrisk.\n\n"
                        "V17 (utdelningssäkerhet) är en av SKF:s starkaste "
                        "signaler. SKF har höjt utdelningen varje år sedan "
                        "2009 (med undantag för 2020 Covid-kontantbevarande) "
                        "och har utdelningstäckning över 2,5 under normala "
                        "år. När utdelningstäckningen faller under 1,8 — som "
                        "vid 2008 och 2019 — varnar V17 för kommande utdelnings-"
                        "beslut.\n\n"
                        "AKM1 1.1-integrationen kör en multivariat modell på "
                        "global PMI, USD/SEK och stålpriser för att beräkna "
                        "\"normaliserad SKF-EBIT\". Systemet jämför detta med "
                        "rapporterad EBIT och flaggar diskrepanser — när "
                        "rapporterad EBIT är 20 procent över normaliserad är "
                        "AKM1 försiktig (cykeltopp), när 20 procent under är "
                        "AKM1 positiv (cykelbotten)."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med SKF är att normalisera för PMI-"
                        "cykeln — många retail-investerare ser -10 procent "
                        "volymtillväxt och säljer, när det faktiskt är normalt "
                        "vid PMI 47."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Normaliserad EBIT: AKM1-beräknad EBIT justerad för "
                        "cykelposition baserat på PMI, valutor och "
                        "råvarupriser — ger stabilare jämförelse mellan år."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att sätta "
                        "positionssizing. När V14 är rött och V17 faller — "
                        "som Q4 2023 — reducerar AKM1 positionen med 30 "
                        "procent. När V14 är gult och V17 grönt — som Q1 2016 "
                        "— adderar AKM1 20 procent. Denna systematik hjälper "
                        "till att undvika cykeleufori och cykelpanik.\n\n"
                        "För svensk retail-investerare innebär detta att SKF "
                        "bör vara en \"core industriposition\" snarare än "
                        "tradesposition. Den som följer AKM1 1.1 slipper "
                        "den vanligaste SKF-fällan: sälj i botten av PMI-"
                        "cykeln, köp i toppen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre SKF-fallstudier illustrerar industriella cykelrisker: "
                "2008-2009 finanskrisen, 2015-2016 oljepriskraschen och "
                "2020-2021 Covid-återhämtningen."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Finanskrisen 2008-2009: SKF föll från 145 "
                        "kr (juli 2008) till 35 kr (mars 2009), -76 procent på "
                        "8 månader. EBIT-marginalen föll från 13 till 5 "
                        "procent. V14 blev rött, V17 föll under 1,8. "
                        "AKM1 1.1-systemet hade flaggat köpläge i mars 2009 "
                        "när \"normaliserad EBIT\" diskreterade mot "
                        "rapporterad — den som köpte då tredubblade på 18 "
                        "månader.\n\n"
                        "Fall 2 — Oljepriskraschen 2015-2016: SKF föll 40 "
                        "procent när oljan föll från 100 till 30 USD och "
                        "fordons-segmentet i USA försvagades. Men detta var "
                        "inte en strukturell SKF-kris utan en cykeleffekt. "
                        "Design-in-pipeline växte fortfarande 8 procent och "
                        "EV-investeringar ökade. Den som såg igenom "
                        "oljeprisbruset och följde design-in kunde köpa på "
                        "P/E 20 som visade sig vara en cykelbotten.\n\n"
                        "Fall 3 — Covid 2020-2021: SKF skar utdelningen med "
                        "50 procent (första gången på 11 år) i april 2020. "
                        "V17 bröt trenden. Men design-in höll och "
                        "återhämtningen blev extremt stark — aktien steg 150 "
                        "procent på 18 månader. Lärdom: enskilda "
                        "utdelningsbeslut i krissituationer är inte "
                        "moat-brott, men ska bekräftas av återgång inom 4 "
                        "kvartal."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Alla tre fallen visar att SKF är en \"mean-reversion\"-"
                        "aktie — volatilitet i kris är kraftig, men moatet "
                        "säkerställer att ROIC återgår till 12-15 procent inom "
                        "2-3 år."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Mean reversion: statistiskt fenomen där variabel "
                        "över tid återvänder mot sitt långsiktiga genomsnitt — "
                        "för SKF gäller detta både EBIT-marginal och ROIC."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret i fallen bekräftar Lynch-principen att "
                        "industriaktier med moat ska köpas när korttidsvinsten "
                        "faller kraftigt men moatindikatorerna (design-in, "
                        "kundbortfall, mix-tillväxt) håller. 2009 och 2016 "
                        "var båda klassiska köplägen; 2020 var mer "
                        "komplex pga. utdelningsbrott.\n\n"
        "Lärdom för svensk retail-investerare: SKF är en \"vans trailers\"-"
        "aktie enligt Lynch-terminologi — tråkig men lönsam. Den som köper i "
        "konjunkturbotten och håller 5-10 år har historiskt sett CAGR på 12-15 "
        "procent, inklusive utdelning. Den som tajmar cykeln fel kan förlora "
        "50 procent på kort sikt."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i SKF-analys kräver djup förståelse av global "
                "PMI-konjunktur, design-in-moatet och EV-transitionens "
                "nyanser."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer inte bara SKF:s "
                        "kvartalsrapport utan också IHS Markit PMI för USA, "
                        "Eurozona Kina, samt Federation of European "
                        "Bearing Manufacturers' kvartalsdata. Man korskopplar "
                        "SKF:s volymtillväxt mot PMI-cykeln och identifierar "
                        "marknadsandelsvinster/förluster. Vidare spårar man "
                        "Ovako-stålpriser mot europeiskt specialstål (MEPS "
                        "Steel Benchmark) som en tidig indikator på SKF:s "
                        "råvarukostnader.\n\n"
                        "Moat-analysen ska fördjupas till design-in-pipeline. "
                        "SKF publicerar inte exakt antal projekt men ger "
                        "kvalitativ vägledning. Mästaren kombinerar detta med "
                        "kunders (Volvo CE, Atlas Copco, ABB) kapacitets-"
                        "utbyggnadsplaner — om Volvo CE bygger ny fabrik i "
                        "USA 2025 vet man att SKF redan är specificerad som "
                        "lagerleverantör.\n\n"
                        "EV-transition-analysen ska kvantifieras, inte "
                        "känslas. SKF rapporterar andel Automotive-intäkter "
                        "från EV och marginal per EV-lager vs ICE-lager. "
                        "Skillnaden är ~3x enhetspris men 0,4x volym per "
                        "fordon — nettoeffekten ska följas kvartalsvis, inte "
                        "årsvis."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att bygga en \"marginal-"
                        "bridge\" från volym × mix × pris × råvara × "
                        "valuta × kostnadsinflation som matchar SKF:s "
                        "rapporterade EBIT-förändring inom ±5 procent."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Margin bridge: kvantitativ nedbrytning av "
                        "EBIT-marginalens förändring i bidrag från volym, "
                        "pris, mix, råvaror, valutor och kostnadsinflation — "
                        "ett standardverktyg i industriaktieanalys."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att förstå SKF som en "
                        "\"all-weather\"-position snarare än en konjunktur-"
                        "trade. Den som ser SKF enbart som PMI-trade missar "
                        "moatet; den som ser SKF enbart som moat-bolag missar "
                        "cykeln. Rätt hantering är att hålla en basposition "
                        "och addera/reducera 30-50 procent baserat på "
                        "AKM1 1.1-signaler.\n\n"
                        "För svensk retail-investerare kan SKF vara en av "
                        "3-5 kärnindustripositioner i en diversifierad "
                        "portfölj — tillsammans med Atlas Copco, Sandvik och "
                        "eventuellt ASSA Abloy. Dessa fyra bildar en kluster "
                        "av svenska moat-bolag med olika cykelkänslighet, "
                        "vilket ger både cykel-exponering och moat-skydd."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11 and pc-12")

# ===========================================================================
# pc-13 — Case: SSAB — cyklisk stål
# ===========================================================================
COURSES["pc-13-case-ssab"] = {
    "why": (
        "SSAB är Sveriges ledande ståltillverkare och ett renodlat "
        "cykelcase som svänger extremt med globala stålpriser och "
        "byggnationskonjunktur. Företagets HYBRIT-satsning gör det också "
        "till en pikot i fossilfri industri med första kommersiella "
        "leveransen till Volvo i augusti 2021. För svensk retail-investerare "
        "är SSAB ett skolexempel på V19 kapitalförbränning i toppen av en "
        "cykel och V17 utdelningsskillnad över konjunkturen."
    ),
    "history": {
        "origin": (
            "SSAB bildades 1978 genom att Stora Kopparbergs Bergslags AB "
            "och Gränges AB slog samman sina ståltillverkningar till ett "
            "gemensamt bolag med statligt ägande. Ursprunget i Oxelösund "
            "(startad 1961) var integrerad stålproduktion med direktreducerat "
            "järn för att undvika inhemsk brist på metallurgisk kol. "
            "Företaget introducerades på Stockholmsbörsen 1989 med staten "
            "som initialt storägare. Själva grundstenen lades dock redan i "
            "1945 när Gränges övertog Oxelösunds järnverk från staten."
        ),
        "evolution": (
            "Under 1990-talet fokuserade SSAB på höghållfast stål (Hardox, "
            "Domex, Weldox) snarare än volymstål — en strategi som gav "
            "högre marginaler men mindre skalbarhet. År 2008 förvärvades "
            "amerikanska IPSCO (tub- och plåtstål) för 7,7 mdr USD, vilket "
            "dubblerade SSAB:s storlek men kom precis vid finanskrisens "
            "början. År 2014 förvärvades finska Rautaruukki för 1,4 mdr "
            "EUR, vilket kompletterade med byggnadssystem och slagna "
            "stålkonstruktioner."
        ),
        "modern": (
            "Idag är SSAB ett av Europas mest lönsamma stålbolag med tre "
            "segment: SSAB Special Steels (höghållfast), SSAB Europe "
            "(konventionell stål) och SSAB Americas (tub- och plåtstål). "
            "HYBRIT-projektet startade 2016 tillsammans med LKAB och "
            "Vattenfall med syfte att ersätta kol med vätgas i "
            "järnreduktionen — första kommersiella fossilfria stålet "
            "levererades till Volvo augusti 2021. Planen är fossilfri "
            "produktion i Oxelösund 2026 och i Luleå/Raahe 2030, vilket "
            "gör SSAB till en pikot i europeisk grön industri."
        ),
    },
    "lynchSection": (
        "Lynch skulle uppskatta SSAB som ett extremt cykliskt bolag där "
        "tajming är allt — köp när P/E är 15+ i botten, undvik när P/E är 5 "
        "i toppen. Han skulle dock varna för att HYBRIT-transitionen kan "
        "bli en \"story stock\"-fälla om investerare betalar för framtida "
        "gröna premie innan tekniken är bevisad."
    ),
    "grahamSection": (
        "Graham skulle beräkna SSAB:s substansvärde genom att justera "
        "balansräkningen för cykliska vinster och kräva P/B under 0,8 i "
        "cykelbotten. Hans defensiva investerare skulle undvika SSAB i "
        "cykeltopp oavsett värdering och endast överväga inträde när "
        "EBIT-marginal faller under 5 procent."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar SSAB som extrema cykelcase via V03 "
        "(cyklisk volatilitet >60 procent), V19 (kapitalförbränning i "
        "cykeltopp) och V17 (utdelningssäkerhet). 1.1-integrationen kör "
        "en stålpriskänslighetsmodell baserad på Kallan Steel Battery "
        "Index och varnar när kapitalförbränning överstiger 1,2."
    ),
    "chapters": [
        {
            "intro": (
                "SSAB är ett cykliskt svenskt stålbolag vars resultat "
                "svänger direkt med globala stålpriser, byggnation och "
                "fordonsvolymer."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SSAB producerar cirka 8 Mton stål per år fördelat "
                        "på tre segment: Special Steels (Hardox, Domex, "
                        "Strenx — premiumhöghållfast stål), Europe "
                        "(kvartshet stål i Luleå och Oxelösund) och "
                        "Americas (tub- och plåtstål i Iowa, Alabama, "
                        "Minnesota och Texas). Konkurrenssituationen är "
                        "skiftande — i Europa med tyska ThyssenKrupp och "
                        "nederländska Tata Steel, i USA med Nucor och "
                        "Steel Dynamics, samt kinesiska Baoshan och "
                        "Ansteel globalt.\n\n"
                        "Affärsmodellen är kapitalintensiv: integrerad "
                        "produktion från järnmalm till färdigt stål kräver "
                        "höga volymer för att täcka fasta kostnader. "
                        "Skiftet mot Special Steels-segmentet sedan 1990-"
                        "talet har varit avgörande — Hardox 500 säljs till "
                        "3-4x priset av konventionellt stål men kräver "
                        "mindre volym. Detta är SSAB:s moat: en unik "
                        "kvartshärdad produktlinje som kunder ( Volvo CE, "
                        "Sandvik, Komatsu) designar in i sina maskiner.\n\n"
                        "Cykliciteten är extrem. SSAB:s EBIT-marginal har "
                        "varierat mellan -5 procent (2009) och +25 procent "
                        "(2022). Aktiekursen har fallit 70 procent på 6 "
                        "månader (2008) och stigit 5x på 18 månader "
                        "(2020-2021). Detta gör SSAB till en av "
                        "Stockholmsbörsens mest cykliska aktier — vilt "
                        "lukrativ i rätt tajming, vilt destruktiv i fel."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SSAB:s verkliga moat är inte stålproduktionen utan "
                        "Hardox-varumärket — det enda höghållfasta "
                        "stålvarumärket som designas in i globala gruv- och "
                        "anläggningsmaskiner med premiumpris."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "HSLA-stål (High-Strength Low-Alloy): stål med "
                        "låga halter legeringsämnen som ger hög "
                        "hållfasthet — Hardox är SSAB:s premiumvariant med "
                        "hållfasthet upp till 500 Brinell."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare illustrerar SSAB "
                        "vad Graham kallade \"den speglande cykeln\" — när "
                        "marknaden ser lågt P/E och stabil utdelning "
                        "kommer ofta vinstkollaps. 2007 hade SSAB P/E 5 och "
                        "utdelning 8 procent — perfekt fälla för "
                        "värdeinvesterare. På 12 månader föll vinsten 80 "
                        "procent och aktien halverades.\n\n"
                        "HYBRIT-investeringen är en ny dimension. "
                        "Vätgasbaserad reduktion kräver kapitalinvestering "
                        "på 20-30 mdr kr över 10 år, vilket kommer att "
                        "pressa fri kassa och utdelning. Men om teknik och "
                        "prispremie fungerar kan SSAB få ett \"grönt "
                        "premium\" på 50-100 procent per ton jämfört med "
                        "konventionellt stål. Detta är en osäker men "
                        "potentiellt enorm value-driver."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk SSAB-analys kräver spårning av globala stålpriser, "
                "fordonsvolym och byggnationskonjunktur i SSAB:s tre "
                "geografiska marknader."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SSAB publicerar månatlig försäljning uppdelad på "
                        "segment och geografi. Analysten ska korskoppla "
                        "dessa med tre externa datakällor: (1) Steel "
                        "Benchmark CRU-index för nordeuropeiskt HRC-stål "
                        "(hot-rolled coil), (2) FRED-data för US ISM PMI "
                        "och (3) Eurostat byggnationsproduktion. SSAB:s "
                        "resultat svarar på 1-2 kvartal på dessa indikatorer.\n\n"
                        "Special Steels-segmentet ska analyseras separat "
                        "eftersom det är moat-bärande. Följ andel "
                        "försäljning från Hardox (målet är >30 procent av "
                        "segmentet) och prisskillnad mot konventionellt "
                        "stål (målet är >2x). Om Hardox-premien faller "
                        "under 1,8x varnar detta om moat-erosion — kunder "
                        "testar billigare asiatiska alternativ.\n\n"
                        "Hybrit-projektet ska följas som separat investment "
                        "tracker: kapacitetsbeslut, byggstart, första "
                        "leverans. SSAB har offentliggjort investeringsplan "
                        "på 31 mdr SEK i Oxelösund (klart 2026) och 45 mdr "
                        "SEK i Luleå (klart 2030). Detta motsvarar cirka 3 "
                        "mdr SEK per år — vilket är 25-30 procent av "
                        "normalt årligt capex. Fri kassa blir tryckt i 5-7 "
                        "år framåt."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Nyckel-KPI:er är HRC-pris i Europa, Hardox-premie "
                        "över konventionellt stål, US ISM PMI och "
                        "Hybrit-investeringsgrad — dessa fyra ger 80 "
                        "procent av SSAB:s resultatförklaring."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "HRC (Hot-Rolled Coil): varmvalsad stålplåt som är "
                        "standardprodukten i stålindustrin — används som "
                        "prisbenchmark för konventionellt stål globalt."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Hämta CRU HRC Europa "
                        "veckopris; 2) Hämta US ISM PMI och Eurostat "
                        "byggnation; 3) Följ SSAB:s månatliga försäljning; "
                        "4) Kontrollera Special Steels andel och Hardox-"
                        "premie; 5) Spåra Hybrit-investeringar mot plan; "
                        "6) Beräkna \"normaliserad EBIT\" baserad på 10-"
                        "årssnitt HRC-pris (~600 EUR/ton) och marginal "
                        "(~8 procent).\n\n"
                        "Exempel: Q1 2022 rapporterade SSAB EBIT-marginal "
                        "23 procent med HRC 1 200 EUR/ton. Detta var 2x "
                        "normaliserat pris och 3x normaliserad marginal — "
                        "AKM1 1.1-systemet flaggade cykeltopp. Den som sålde "
                        "då undvek 60-procentig kursförlust under kommande "
                        "18 månader när HRC föll till 600 EUR/ton."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i SSAB-analys: cykeltopps-P/E, HYBRIT-övertro "
                "och kapitalstrukturoptimism."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Cykeltopps-P/E: SSAB har historiskt sett "
                        "sitt lägsta P/E i cykeltopp. 2007 (P/E 5), 2011 "
                        "(P/E 6), 2018 (P/E 7), 2022 (P/E 5) — alla fyra "
                        "var toppar med vinstkollaps inom 12 månader. "
                        "Värdeinvesterare som köpte på dessa P/E-nivåer "
                        "förlorade 40-70 procent. Möjligen värsta fällan "
                        "på Stockholmsbörsen.\n\n"
                        "Fälla 2 — HYBRIT-övertro: Marknaden prissätter "
                        "HYBRIT-premie sedan 2021, men tekniken är ännu "
                        "inte skalad kommersiellt. Om vätgaspriset förblir "
                        "högt (3-5 EUR/kg vs 1,5 EUR/kg krav) blir "
                        "produktionskostnaden 30-50 procent högre än "
                        "konventionell — kunder kan välja bort. Den som "
                        "betalar premium för HYBRIT idag tar teknisk och "
                        "politisk risk.\n\n"
                        "Fälla 3 — Kapitalstrukturoptimism: SSAB har "
                        "historiskt sett återköpt aktier i toppar och "
                        "skurit utdelning i bottnar — en klassisk "
                        "procyklisk kapitalallokering. 2022 genomfördes "
                        "återköp för 5 mdr SEK till kurs 45 kr; 2023 skars "
                        "utdelningen med 30 procent när aktien var 25 kr. "
                        "V17-varningssystemet hade flaggat detta — men "
                        "många investerare följde inte signalen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: se 5-procentig utdelningsavkastning "
                        "i cykeltopp och tro att aktien är \"säker\" — "
                        "SSAB har skurit utdelning 5 gånger på 25 år, "
                        "alltid inom 12 månader från cykeltopp."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Procyklisk kapitalallokering: bolagsbeslut att "
                        "återköpa aktier och höja utdelning i cykeltopp "
                        "men skära ner i cykelbotten — värdeförstörande "
                        "för långsiktiga ägare."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För P/E-fällan, beräkna "
                        "\"mid-cycle EPS\" baserat på 10-årigt genomsnitt "
                        "av EBIT-marginal (SSAB:s snitt är 8 procent) och "
                        "normaliserade intäkter. Köp när P/E på mid-cycle "
                        "EPS understiger 10. För HYBRIT-fällan, vänta på "
                        "teknisk validering — första kommersiella "
                        "volymproduktion 2026 och kundacceptans ska visas "
                        "innan premie betalas.\n\n"
                        "För kapitalstrukturfällan, följ V17 strikt — om "
                        "utdelningstäckning faller under 1,5 eller om "
                        "återköp overstiger 50 procent av fri kassa i "
                        "cykeltopp, reducera positionen. AKM1 1.1-systemet "
                        "gör detta automatiskt genom att koppla V17-täckning "
                        "till positionsstorlek."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar SSAB som extrema cykelcase med "
                "V03, V17 och V19 i en integrerad 1.1-modul med "
                "stålpriskänslighetsanalys."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V03 (cyklisk volatilitet) flaggar SSAB som en "
                        "aktie med årsvis EBITDA-variation över 60 procent "
                        "— en av de mest volatila på Stockholmsbörsen. V19 "
                        "(kapitalförbränning) spårar capex/EBITDA — SSAB "
                        "har historiskt sett investerat 1,0-1,2x EBITDA "
                        "i toppar (2007, 2011, 2018, 2022), alla följt av "
                        "EBIT-kollaps.\n\n"
                        "V17 (utdelningssäkerhet) är kritisk för SSAB. "
                        "Bolaget har skurit utdelningen 5 gånger sedan "
                        "1998 (2001, 2009, 2012, 2015, 2023) — alltid "
                        "inom 12 månader från en V19-topp. Utdelningstäckning "
                        "under 1,5 är en stark säljsignal i SSAB-kontext.\n\n"
                        "AKM1 1.1-integrationen kör en multivariat "
                        "stålpriskänslighetsmodell baserad på Kallan Steel "
                        "Battery Index, HRC-pris och USD/SEK. Systemet "
                        "beräknar SSAB:s normaliserade EBITDA och jämför "
                        "med rapporterad — skillnader över ±25 procent "
                        "flaggar cykelposition. Vid cykeltopp reduceras "
                        "positionen med 50 procent, vid cykelbotten "
                        "adderas 40 procent."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med SSAB är att integrera V19 och "
                        "V17 — när kapitalförbränning >1,0 och "
                        "utdelningstäckning <1,5 har SSAB kollapsat inom "
                        "12 månader i 5 av 5 historiska fall."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Stålpriskänslighetsmodell: AKM1-modell som "
                        "beräknar EBITDA-respons på 1-procentig "
                        "stålprisrörelse — för SSAB är effekten cirka 1,2 "
                        "procent av försäljning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att "
                        "förhindra cykeleufori. 2022 när SSAB hade P/E 5 "
                        "och utdelning 8 procent varnade AKM1 för V19=1,2 "
                        "och V17=1,3. Systemet rekommenderade reduktion "
                        "till 30 procent av normal position — den som "
                        "följde detta undvek 60-procentig förlust.\n\n"
                        "För svensk retail-investerare innebär detta att "
                        "SSAB ska hanteras som en rent cyklisk position "
                        "inte en \"core holding\". AKM1-tillägget/reduktionen "
                        "ska ske 2-3 gånger per decennium baserat på "
                        "cykelsignaler — inte baserat på kvartalsvinst-"
                        "överraskningar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre SSAB-fallstudier illustrerar cykelrisk och value-skapa: "
                "2008-2009 finanskrisen, 2016-2018 supercykeln och 2022-2023 "
                "stålprisras."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Finanskrisen 2008-2009: SSAB föll från 130 "
                        "kr (juli 2008) till 25 kr (mars 2009), -81 procent. "
                        "EBIT gick från +6 mdr SEK till -1,5 mdr SEK. "
                        "IPSCO-förvärvet 2008 hade belastat balansräkningen "
                        "precis vid kraschen — V19 var 1,5. Utdelningen "
                        "skars helt 2009. AKM1 1.1 hade flaggat \"reducera\" "
                        "redan Q3 2008 när V17 föll under 1,5.\n\n"
                        "Fall 2 — Kina-stålcykeln 2016-2018: Kinesisk "
                        "infrastrukturstimulans drev HRC från 400 till 700 "
                        "EUR/ton 2016-2018. SSAB gick från förlust till "
                        "rekordresultat. Aktien steg från 25 till 55 kr, "
                        "120 procent på 24 månader. Men V19 steg mot 1,1 "
                        "och V17 täckning föll — AKM1 flaggade \"reducera\" "
                        "Q4 2017. Den som följde undvek den kommande 40-"
                        "procentiga nedgången 2018-2019.\n\n"
                        "Fall 3 — Ukraina-krigs-stålcykel 2022-2023: HRC "
                        "steg från 800 till 1 400 EUR/ton mars 2022 "
                        "(tillgänglighetskris), sedan fall tillbaka till 600 "
                        "EUR/ton Q4 2023. SSAB rapporterade rekord-EBIT Q1 "
                        "2022 (V19=1,2, V17=1,3 — AKM1 säljsignal) följt av "
                        "EBIT-kollaps 50 procent på 4 kvartal. Aktien föll "
                        "från 50 till 25 kr."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Alla tre fallen bekräftar: SSAB ska köpas när V17 "
                        "är >2,5 och V19 <0,8 — säljas när V17 <1,5 och V19 "
                        ">1,0. Cykelposition är allt."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Cykelposition: AKM1:s bedömning av var i 5-7 årig "
                        "cykel bolaget befinner sig — baserad på "
                        "kombination av vinstnivå, kapacitetsutnyttjande "
                        "och kapitalförbränning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret visar att SSABs volatilitet inte är "
                        " slumpmässig utan cykelstyrd. Med rätt "
                        "AKM1-systematik kan investerare undvika 50-80 "
                        "procentiga förluster och fånga 100-200 procentiga "
                        "uppgångar. Detta är den sanna alfa-källan i "
                        "cykliska aktier.\n\n"
                        "Lärdom för svensk retail-investerare: SSAB är "
                        "inte en \"köp och håll\"-aktie, utan en "
                        "\"tids-cykel\"-aktie. Den som inte kan följa "
                        "AKM1 1.1-systematik bör undvika SSAB helt — "
                        "alternativt köpa en aktiv cykelfond exponerad mot "
                        "stål och råvaror där professionella "
                        "cykelhanterare gör timingen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i SSAB-analys kräver förståelse för global "
                "stålcykel, kinesisk kapacitetsnedläggning och HYBRIT-"
                "teknikens kommersiella skalbarhet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer inte bara SSAB:s "
                        "kvartalsrapport utan World Steel Association:s "
                        "månadsrapport, Kina Steel Association:s "
                        "kapacitetsdata och europeiska CBAM-regelverk "
                        "(Carbon Border Adjustment Mechanism). Man "
                        "korskopplar SSAB:s special steel-marginaler mot "
                        "konkurrenterna (thyssenKrupp, ArcelorMittal) och "
                        "identifierar marknadsandelsvinster.\n\n"
                        "HYBRIT-analysen ska vara kvantitativ. Följ "
                        "vätgaspriser (TTF-index, Nordic Hydrogen Index), "
                        "elpriser i Norra Sverige (Nordpool SE1) och "
                        "LKAB:s pelletsproduktion. Kalkylen är: 1 ton "
                        "fossilfritt stål kräver ~50 kg vätgas, vilket "
                        "vid 3 EUR/kg blir 150 EUR extra kostnad per ton. "
                        "Om kunder betalar 200 EUR premium ger SSAB "
                        "50 EUR/ton marginal — men om premium faller under "
                        "100 EUR blir produktion olönsam.\n\n"
                        "Slutligen förstår mästaren att SSAB är en "
                        "\"barbell\"-investering: låg risk i Special Steels "
                        "(moat-bärande) och hög risk i konventionell stål "
                        "(cykelstyrd). 1.1-integrationen separerar dessa "
                        "två och väger positionen därefter."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att bygga en "
                        "stålpriscykelmodell som förutspår SSAB:s EBIT "
                        "6-12 månader framåt baserat på Kallan-index, "
                        "kinesisk produktion och europeisk byggnation."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "CBAM (Carbon Border Adjustment Mechanism): EU:s "
                        "koldioxidtull på importerat stål från 2026, "
                        "konkurrensfördel för SSAB:s fossilfria stål."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att förstå SSAB som "
                        "ett \"barbell\"-case — en moat-bärande del "
                        "(Special Steels) och en cykelstyrd del (Europe + "
                        "Americas). Den som kan separera dessa två kan "
                        "både köpa moat-premie och tajma cykel.\n\n"
                        "För svensk retail-investerare kan SSAB vara en "
                        "\"satellit-position\" i en industriexponering — "
                        "inte mer än 2-3 procent av portföljen och då "
                        "endast i cykelbotten enligt AKM1 1.1. Den som "
                        "saknar tid eller systematik bör hålla SSAB utanför "
                        "portföljen och istället exponera via bredare "
                        "industrifonder."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-13")

# ===========================================================================
# pc-14 — Case: Electrolux — disruption
# ===========================================================================
COURSES["pc-14-case-electrolux"] = {
    "why": (
        "Electrolux är en varnande historia om hur en svensk global "
        "marknadsledare tappar moat till asiatiska konkurrenter under "
        "2010-talet. För svensk retail-investerare illustrerar Electrolux "
        "V14 marginalpress, V01 försäljningstillväxtens bedrägliga natur "
        "i en disruptad bransch och risken med P/E-fällor i pressade "
        "bolag. Det är också en illustration av varför Graham ville undvika "
        "aktier med strukturellt pressade marginaler."
    ),
    "history": {
        "origin": (
            "Electrolux grundades 1919 genom sammanslagning av Lux AB "
            "(stockholmskt ljusbolag som börjat tillverka dammsugare 1912) "
            "och Elektromekaniska AB. Grundaren Axel Wenner-Gren hade "
            "inspirerats till dammsugarkonceptet redan 1908 när han såg "
            "Santo-vakuumen i Wien och insåg att en bärbar variant skulle "
            "kunna säljas direkt till hushållen. Företaget expanderade snabbt "
            "i Europa och under 1920-talet lanserades refrigeratorer "
            "(1925) och tvättmaskiner."
        ),
        "evolution": (
            "Efter 1950-talet växte Electrolux genom förvärv till en "
            "global vitvarukoncern. Stora förvärv inkluderade Husqvarna "
            "(1978, utknoppad 2006), Zanussi (1984), AEG (1994) och "
            "Frigidaire (1986 från White Consolidated). Under 2000-talet "
            "blev Electrolux världens näst största vitvarutillverkare efter "
            "Whirlpool, med ledande position i Europa och Sydamerika. "
            "Ett försök att förvärva GE Appliances 2014 misslyckades "
            "när Electrolux drog sig ur efter konkurrenspåverkningar från "
            "USA:s konkurrensmyndigheter."
        ),
        "modern": (
            "Idag är Electrolux noterat på Nasdaq Stockholm med en omsättning "
            "runt 130 miljarder kronor och 45 000 anställda. Bolaget har "
            "tre segment: Major Appliances EMEA, Major Appliances North "
            "America och Major Appliances Latin America plus en mindre "
            "Small Appliances-divison. Under 2010-talet har Electrolux "
            "förlorat marknadsandelar till kinesiska Haier och Midea samt "
            "koreanska LG och Samsung, vilket pressat EBIT-marginalen från "
            "8 procent (2010) till 2-3 procent (2023). En stor "
            "omstrukturering 2023-2024 innebar 4 miljarder kronor i "
            "kostnadsbesparing och 3 000 uppsagda tjänster."
        ),
    },
    "lynchSection": (
        "Lynch skulle undvika Electrolux som klassisk \"declining moat\"-"
        "case — ett bolag där försäljningstillväxten maskerar "
        "marknadsandelsförlust. Han skulle istället leta efter "
        "turnaround-köpsignaler: nytt ledningsskifte, kostnadsreduktion "
        "i botten och produktrelansering, men varna för att sådana "
        "turnarounds ofta misslyckas i disruptade branscher."
    ),
    "grahamSection": (
        "Graham skulle beräkna Electrolux substansvärde genom att justera "
        "balansräkningen för goodwill och varumärken, samt kräva att "
        "substansrabatten är minst 30 procent. Han skulle betrakta bolag "
        "med EBIT-marginal under 5 procent i 5+ år som strukturellt "
        "pressade och undvika dem om inte nischad turnaround-aktör "
        "tillträtt."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar Electrolux via V14 (marginalpress), "
        "V01 (organisk försäljningstillväxt under inflation) och V17 "
        "(utdelningssäkerhet). 1.1-integrationen spårar "
        "konkurrenspositionen mot asiatiska rivaler och varnar när "
        "marknadsandel faller 3 år i rad."
    ),
    "chapters": [
        {
            "intro": (
                "Electrolux är en svensk vitvarujätte vars moat har eroderats "
                "av asiatisk konkurrens och commoditisation av vitvaror under "
                "2010-talet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Electrolux säljer vitvaror under varumärkena "
                        "Electrolux, AEG, Zanussi, Frigidaire och Anova. "
                        "Tre geografiska segment dominera: EMEA (45 procent "
                        "av intäkter), North America (35 procent) och Latin "
                        "America (15 procent). På papperet liknar affärsmodellen "
                        "ett moat-bolag — global varumärkesportfölj, "
                        "distributionsnätverk och stordriftsfördelar i "
                        "produktion. Men i praktiken har vitvaror commoditiserats "
                        "via kinesiska EMS-tillverkare som producerar för "
                        "Haier, Midea och till och med vissa Electrolux-modeller.\n\n"
                        "Moatet har tre dimensioner som alla eroderas: "
                        "(1) varumärke — nordiska konsumenter känner "
                        "Electrolux, men yngre generationer väljer LG/Samsung "
                        "för smarta funktioner; (2) distribution — IKEA, Elon "
                        "och kedjor har ökat privat label som tar marginaler; "
                        "(3) teknik — värmepumpsteknik, inverterkompressorer "
                        "och IoT-styrning är områden där asiatiska konkurrenter "
                        "leder. Elektra Lund (Electrolux Professional) "
                        "utknoppades 2018 just för att skydda det mer moat-"
                        "bärande professionella segmentet från vitvaruedisruption.\n\n"
                        "Resultatet är att Electrolux EBIT-marginal har fallit "
                        "från 8 procent 2010 till 2-3 procent 2023, samtidigt "
                        "som omsättningen varit i stort sett oförändrad i "
                        "realpriser. Aktiekursen har fallit från 350 kr (2015) "
                        "till 130 kr (2024), en nedgång på 60 procent trots "
                        "ledningens upprepade kostnadsprogram."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Electroluxs moat-erosion är inte cyklisk utan "
                        "strukturell — kostnadsbesparingar kan inte vända en "
                        "commoditiserad bransch där kinesiska konkurrenter "
                        "har 30 procent lägre produktionskostnader."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Commoditisation: process där en differentierad "
                        "produkt blir en standardvara där kunder väljer på "
                        "pris snarare än varumärke — driver marginaler "
                        "mot noll."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare är Electrolux en "
                        "lärobok i hur man undviker \"value traps\" — bolag "
                        "som ser billiga ut (P/E 8-10) men vars marginaler "
                        "strukturellt trycks mot noll. Aktien har varit "
                        "\"billig\" i 10 år och har fortsatt falla.\n\n"
                        "Undantaget är om turnaround sker — ny VD Jonas "
                        "Samuelson (2024-) har lanserat kostnadsprogram om "
                        "4 mdr SEK och produktrelansering. Men historiken "
                        "visar att Electrolux haft 6 kostnadsprogram sedan "
                        "2010 med begränsad effekt. Lynch-principen: \"vänd "
                        "inte en sjunkande båt om du inte ser en konkret "
                        "kapten\" — och då är det fortfarande högrisk."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Electrolux-analys kräver spårning av "
                "marknadsandelar per region, bruttomarginal och "
                "kostnadsprogramstatus."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Electrolux publicerar kvartalsvis segmentdata med "
                        "organisk tillväxt och EBIT-marginal per region. "
                        "Analysten ska korskoppla dessa med externa data: "
                        "(1) Euromonitor vitvaru-marknadsandelar per region; "
                        "(2) CSI (China Statistical Yearbook) för kinesisk "
                        "vitvaruexport; (3) US AHAM (Association of Home "
                        "Appliance Manufacturers) för leveransdata. Det är "
                        "marknadsandelsutvecklingen, inte försäljnings-"
                        "tillväxten, som är den sanna moat-indikatorn.\n\n"
                        "Ett konkret varningsschema: om Electroluxs "
                        "organiska tillväxt är 2 procent under marknaden "
                        "(t.ex. marknaden växer 4 procent, Electrolux 2 "
                        "procent) under tre kvartal i rad, har bolaget "
                        "troligen förlorat marknadsandel. Detta hände "
                        "Q3 2019-Q2 2020 i Nordamerika och Q1 2022-Q4 2022 "
                        "i EMEA.\n\n"
                        "Kostnadsprogram ska spåras noggrant. Electrolux "
                        "har genomfört 6 stora program sedan 2010 (utan "
                        "bestående marginalförbättring). Analysten ska följa "
                        "realiserade besparingar mot guide och varna om "
                        "genomförandet ligger 12 månader efter plan. "
                        "Kostnadsprogram som löper över 24+ månader är "
                        "sällan framgångsrika enligt empiri."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna indikatorn på turnaround är inte "
                        "kostnadsbesparingar utan stabiliserad "
                        "marknadsandel — om Electrolux kan hålla 20 procent "
                        "i Europa under 4 kvartal är det första positiva "
                        "signalen sedan 2015."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Organisk tillväxt: försäljningstillväxt justerad "
                        "för valutor, förvärv och avyttringar — ger sann "
                        "bild av kärnverksamhetens utveckling."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Hämta Euromonitor "
                        "vitvaru-marknadsandelar per kvartal; 2) Beräkna "
                        "Electroluxs andel jämfört med Haier, Whirlpool, "
                        "LG och Samsung; 3) Jämför andelsförändring med "
                        "Electroluxs rapporterade organiska tillväxt; 4) "
                        "Spåra kostnadsprogramrealisering; 5) Följ "
                        "EBIT-marginal per segment.\n\n"
                        "Ett exempel: Q2 2023 rapporterade Electrolux "
                        "organisk tillväxt -5 procent i EMEA, medan "
                        "Euromonitor visade att marknaden föll 3 procent — "
                        " Electrolux förlorade alltså 2 procentandelar. "
                        "EBIT-marginalen föll till 1,5 procent. Aktien föll "
                        "20 procent på en vecka. Den som såg "
                        "marknadsandelsförlusten tidigt kunde undvika "
                        "halva nedgången."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i Electrolux-analys: P/E-value-trap, "
                "turnaround-övertro och utdelningsfälla."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — P/E-value-trap: Electrolux har haft P/E "
                        "5-10 sedan 2018, vilket ser billigt ut. Men P/E "
                        "bygger på antagande om framtida marginaler — om "
                        "EBIT-marginal permanent faller till 2 procent "
                        "är rätt P/E 5-7. Aktien är alltså rätt prissatt, "
                        "inte missprissatt.\n\n"
                        "Fälla 2 — Turnaround-övertro: Varje nytt "
                        "kostnadsprogram har mötts av analytikeruppruktelse "
                        "och aktieuppgång på 15-30 procent initialt. Sedan "
                        "har programmet antingen misslyckats eller inte "
                        "kunnat vända marknadsandelsförlust. 6 program "
                        "sedan 2010, 0 varaktiga marginalförbättringar. "
                        "Turnaround-investeringar i disruptade branscher "
                        "lyckas bara i 20-30 procent av fallen enligt "
                        "McKinsey-undersökning.\n\n"
                        "Fälla 3 — Utdelningsfälla: Electrolux har historiskt "
                        "betalt 4-6 procent utdelning, vilket lockat "
                        "inkomstinvesterare. Men utdelningstäckningen har "
                        "fallit från 2,5 (2015) till 1,2 (2022) — en V17-"
                        "varning. I 2023 skars utdelningen med 50 procent. "
                        "Den som köpt aktien enbart för utdelning har förlorat "
                        "både inkomst och kapital."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: se hög utdelningsavkastning i ett "
                        "pressat bolag och tro att marknaden övertolkar "
                        "risk — Electrolux 2020 visade att utdelning kan "
                        "skäras 50 procent och aktien falla 30 procent på "
                        "en dag."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Value trap: aktie som ser billig ut på lågt P/E "
                        "eller P/B men vars fundamentala förväntningar "
                        "rationaliserar låg värdering — ingen mean reversion "
                        "skeende."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För P/E-fällan, beräkna "
                        "\"normaliserad EPS\" baserad på cyklisk EBIT-marginal "
                        "(Electrolux 10-års snitt är 4 procent, inte 8 "
                        "procent). Om P/E på normaliserad EPS överstiger 12, "
                        "är aktien rättvist värderad — inte billig.\n\n"
                        "För turnaround-fällan, kräv 2 av 3 framgångsfaktorer "
                        "innan inträde: (1) ny VD med dokumenterad "
                        "turnaround-erfarenhet; (2) balansräkning stark nog "
                        "att finansiera omstrukturering; (3) konkreta "
                        "marknadsandelsvinster i minst 2 kvartal. Electrolux "
                        "2024 uppfyller möjligen (1) men inte (2) eller (3) — "
                        "så undvik tills bevisning föreligger."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar Electrolux som moat-erosionscase "
                "via V14, V01 och V17 i en integrerad 1.1-modul med "
                "marknadsandels-tracker."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V14 (marginalpress) spårar Electrolux EBIT-marginal "
                        "mot 10-årigt snitt (5 procent). När marginalen "
                        "faller under 3 procent flaggas V14 rött — detta har "
                        "hållit sedan 2018. V01 (försäljningstillväxt) "
                        "analyseras på organisk nivå justerad för marknad — "
                        "om Electrolux växer under marknaden i 4 kvartal i "
                        "rad flaggas V01 rött för moat-erosion.\n\n"
                        "V17 (utdelningssäkerhet) blev en kritisk signal "
                        "2022 när täckning föll under 1,5. AKM1 1.1-systemet "
                        "flaggade \"sälj eller reducera\" — den som följde "
                        "undvik utdelningsskärning och 30-procentig "
                        "kursförlust i 2023.\n\n"
                        "AKM1 1.1-integrationen kombinerar V14, V01 och V17 "
                        "med en marknadsandels-tracker baserad på Euromonitor "
                        "data. Systemet ger en \"moat score\" på 0-100 — "
                        "Electrolux har fallit från 65 (2015) till 25 (2024). "
                        "När score under 30 och V17 täckning under 1,5 "
                        "rekommenderar systemet avslut oavsett värdering."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med Electrolux är att separera "
                        "cykliska effekter (skulle vända) från strukturella "
                        "(vänds inte) — moat-score under 30 betyder "
                        "strukturell nedgång, inte köpläge."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Moat score: AKM1-beräkning 0-100 baserad på "
                        "marknadsandelstrend, marginalstabilitet, ROIC-trend "
                        "och konkurrensposition — värden under 30 indikerar "
                        "strukturell erosion."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att "
                        "undvika \"value traps\" — systemet flaggar bolag "
                        "där låg värdering reflekterar fundamentala problem "
                        "snarare än missprissättning. Electrolux har varit "
                        "flaggat som \"avoid\" sedan Q3 2018.\n\n"
                        "För svensk retail-investerare innebär detta att "
                        "Electrolux endast ska övervägas om turnaround "
                        "bevisligen sker — dvs marknadsandel vänd, "
                        "EBIT-marginal över 5 procent i 4 kvartal, V17 "
                        "täckning över 1,8. Tills detta sker bör AKM1 "
                        "behålla positionen minimal eller noll."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre Electrolux-fallstudier illustrerar moat-erosion: "
                "GE-förvärvsförsöket 2014, konkurrens från Haier 2015-2020 "
                "och kostnadsprogrammet 2023-2024."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — GE Appliances-försöket 2014: Electrolux "
                        "budade 3,3 mdr USD för GE Appliances för att få "
                        "ledande nordamerikansk position. DOJ blockerade "
                        "förvärvet med konkurrenspåverkan, Electrolux drog "
                        "sig ur september 2015. Konsekvens: 175 MUSD "
                        "brytesavgift och fortsatt svag Nordamerika-position. "
                        "Istället köpte Haier GE Appliances 2016 och blev "
                        "global ledare. Lärdom: misslyckade storförvärv i "
                        "disruptad bransch ofta positivt i längden — men "
                        "Electrolux förlorade momentum.\n\n"
                        "Fall 2 — Haier-disruption 2015-2020: Haier "
                        "introducerade premiumprodukter med IoT-styrning "
                        "till 20 procent lägre pris än Electrolux Premium. "
                        "Electrolux försenades med smart-vitvaror och "
                        "förlorade 3 procentenheter andel i Europa. "
                        "EBIT-marginal föll från 7 till 4 procent. Aktien "
                        "föll från 280 till 180 kr. Lärdom: när asiatisk "
                        " konkurrent introducerar bättre teknik till "
                        "lägre pris, moatet är redan borta.\n\n"
                        "Fall 3 — Kostnadsprogram 2023-2024: VD Jonas "
                        "Samuelson lanserade 4 mdr SEK kostnadsbesparing "
                        "med 3 000 uppsagda tjänster. Initial aktieuppgång "
                        "25 procent på 3 månader. Men redan Q4 2023 visade "
                        "sig att besparingarna ej kompenserade för "
                        "marknadsandelsförlust — aktien föll tillbaka. "
                        "Lärdom: kostnadsprogram kan inte vända "
                        "strukturell disruption."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: alla tre fallen visar att "
                        "Electrolux problem är strukturella, inte cykliska. "
                        "Kostnadsbesparingar fördröjer nedgången men vänder "
                        "inte trenden."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Strukturell vs cyklisk nedgång: strukturell nedgång "
                        "orsakas av commoditisation eller disruptiv teknik "
                        "— vänder inte av sig själv. Cyklisk nedgång orsakas "
                        "av konjunktur — vänder med PMI."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret i fallen bekräftar Lynch-principen att "
                        "turnaround-investeringar i disruptade branscher "
                        "är hög-risk. Endast 20-30 procent av "
                        "turnaround-försök lyckas enligt McKinsey-undersökning.\n\n"
                        "Lärdom för svensk retail-investerare: Electrolux "
                        "ska hanteras som ett varningscase, inte en "
                        "investeringsmöjlighet — om inte konkreta "
                        "marknadsandelsvinster visas under 4 kvartal. Den "
                        "som vill ha svensk vitvaruexponering bör istället "
                        "titta på Electrolux Professional (utknoppat 2018) "
                        "som har intakkt moat och stabil marginal."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Electrolux-analys kräver förståelse för "
                "bransch-erosion, asiatisk konkurrensdynamik och "
                "turnaround-sannolikhet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer inte bara "
                        "Electrolux kvartalsrapport utan Euromonitor "
                        "vitvaru-marknadsandelar, kinesisk exportstatistik "
                        "(CSI) och Korean Customs Service för LG/Samsung. "
                        "Man korskopplar Electroluxs EBIT-marginal mot "
                        "konkurrenternas och identifierar om marginalgapet "
                        "vidgas eller smalnas.\n\n"
                        "Turnaround-analysen ska vara systematisk. Följ "
                        "10 faktorer: (1) ny VD; (2) kostnadsprogram >3 "
                        "procent av omsättning; (3) produktlanseringar i "
                        "premiumsegment; (4) kanalförskjutning mot "
                        "D2C/e-commerce; (5) regional marknadsandel; (6) "
                        "balansräkningsstyrka; (7) lednings-aktieinnehav; "
                        "(8) kapacitetsnedläggning; (9) joint ventures med "
                        "teknologipartner; (10) ESG-rating. Varje faktor "
                        "ger 0-10 poäng; turnaround sannolikhet överstiger "
                        "50 procent först vid poäng över 60.\n\n"
                        "Slutligen förstår mästaren att Electrolux historia "
                        "är en illustration av Kirzners \"entrepreneurial "
                        "discovery\" — nya konkurrenter upptäcker obeskattade "
                        "möjligheter i vitvaror (IoT, smart home) som "
                        "etablerade aktörer ignorerat. Detta är en "
                        "allmän princip som gäller alla moat-erosionsfall."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att skilja cyklisk "
                        "svaghet (köpläge) från strukturell erosion (undvik) "
                        "— Electrolux har varit strukturell sedan 2015 och "
                        "inget kostnadsprogram har vänt trenden."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Entrepreneurial discovery: Israel Kirzners teori "
                        "att marknadsprocessen drivs av entreprenörer som "
                        "upptäcker obeskattade arbitragemöjligheter — "
                        "förklarar varför moats eroderas över tid."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att förstå Electrolux "
                        "som en varningshistoria snarare än en "
                        "investeringsmöjlighet. Den som studerar Electrolux "
                        "kan applicera samma ramverk på andra svenska "
                        "\"gamla varumärken\" — t.ex. H&M (snabb "
                        "modedisruption), Ericsson (cyklisk telekom), Atlas "
                        "Copco (mer moat-bärande). Dessa är alla olika "
                        "varianter av moat-utmaningar.\n\n"
                        "För svensk retail-investerare bör Electrolux "
                        "användas som ett utbildningscase — inte en "
                        "portföljposition — om inteAKM1 1.1-systemet "
                        "flaggar konkret turnaround-bevis (marknadsandel "
                        "vänd, marginal >5 procent i 4 kvartal, V17 täckning "
                        ">1,8). Tills detta sker bör kapitalet allokeras "
                        "till moat-bärande industri- eller konsumentbolag."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-14")

# ===========================================================================
# pc-15 — Case: Kambi — tech-nisch
# ===========================================================================
COURSES["pc-15-case-kambi"] = {
    "why": (
        "Kambi är en svensk B2B-sportsbook-teknikjätte som visar hur "
        "mjukvaruintäkter skalas globalt i en reglerad bransch. För svensk "
        "retail-investerare illustrerar Kambi V01 försäljningstillväxt i "
        "tillväxtfas, men också riskerna med V19 kapitalförbränning under "
        "expansion. Det är också ett fall där USA-reglering (PASPA-"
        "upphävandet maj 2018) skapade en hel marknad över en natt."
    ),
    "history": {
        "origin": (
            "Kambi bildades 2010 som en utknoppning från Unibet (sedermera "
            "Kindred Group), där man tog Unibets interna sportsbook-plattform "
            "och gjorde den till en B2B-produkt för andra speloperatörer. "
            "Bakgrunden var att Unibet under 2000-talet byggt en egen "
            "teknikplattform för odds-kalkyl och riskhantering, som var "
            "mer avancerad än många konkurrenters. Första stora kunden blev "
            " kindreds konkurrenter i nordeuropeiska marknaden."
        ),
        "evolution": (
            "Kambi noterades på Nasdaq First North 2014 och flyttades till "
            "Nasdaq Stockholm huvudlista 2018 efter stark tillväxt. Bolaget "
            "förenklade sitt erbjudande från \"vit märkning\" till \"turnkey "
            "sportsbook\" där Kambi hanterar odds, risk, användargränssnitt "
            "och compliance, medan kunden fokuserar på marknadsföring. "
            "Stora kundförvärv under perioden inkluderade LeoVegas (2014), "
            "Rush Street Interactive (2019, för USA-marknaden) och "
            "Bally's Corporation (2021)."
        ),
        "modern": (
            "Idag är Kambi en av världens största B2B-sportsbook-leverantörer "
            "med över 30 aktiva operatörer och närvaro i 30+ jurisdiktioner. "
            "Omsättningen uppgick till cirka 165 MEUR 2023, med EBIT-marginal "
            "runt 20 procent. USA-marknaden står för 50+ procent av "
            "intäkterna efter PASPA-upphävandet maj 2018, då högst domstolen "
            "öppnade för delstatlig legalisering av sportbetting. Kambi "
            "konkurrerar med OpenBet, SBTech (DraftKings) och inhemska "
            "kinesiska leverantörer i Asien."
        ),
    },
    "lynchSection": (
        "Lynch skulle uppskatta Kambi som ett \"fast grower\"-case med 20+ "
        "procent tillväxt — hans favoritkategori. Han skulle dock varna "
        "för att B2B-tech med få stora kunder (kundkoncentration) är "
        "sårbar för kontraktsförluster och att USA-reglering är politiskt "
        "riskabel."
    ),
    "grahamSection": (
        "Graham skulle betrakta Kambi som för volatilt och ungt för hans "
        "defensiva investerare — P/E har varit 30-50 och substansrabatten "
        "obefintlig. Han skulle kräva 5-10 års vinsthistorik och stabil "
        "EBIT-marginal över 15 procent innan inträde."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar Kambi via V01 (tillväxt), V09 "
        "(kundkoncentration mot 5 stora operatörer) och V17 "
        "(utdelningssäkerhet — saknas, då Kambi återinvesterar allt). "
        "1.1-integrationen spårar NGR (Net Gaming Revenue) per kund och "
        "varnar om topp-3 kunders andel överstiger 60 procent."
    ),
    "chapters": [
        {
            "intro": (
                "Kambi är en svensk B2B-sportsbook-leverantör vars "
                "tillväxt drivs av global spelreglering, särskilt i USA "
                "efter PASPA-upphävandet 2018."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Kambis affärsmodell är B2B-SaaS med "
                        "intäktsdelning: istället för fast licensavgift tar "
                        "Kambi cirka 30 procent av kundens NGR (Net Gaming "
                        "Revenue) som betalning. Detta innebär att Kambi "
                        "delar både upp- och nersida med kunden — när "
                        "sportbetting ökar under VM eller Olympics, växer "
                        "Kambi-inkomsterna proportionellt. Tre "
                        "intäktskomponenter: (1) operatörsavgifter (~70 "
                        "procent av intäkter), (2) tjänsteavgifter (~20 "
                        "procent), (3) integration och onboarding (~10 "
                        "procent).\n\n"
                        "Konkurrenssituationen är oligopolartad med OpenBet "
                        "(amerikansk original), SBTech (numera ägt av "
                        "DraftKings), och Kambi som tre huvudaktörer i "
                        "väst. Moatet ligger tre dimensioner djupare: "
                        "(1) riskhanteringsalgoritmerna som tar 10+ år att "
                        "träna på historisk sportdata; (2) compliance och "
                        "licens i 30+ jurisdiktioner, vilket är en "
                        "regulatorisk barriär; (3) datafeeds och latency "
                        "för live betting, där Kambi har sub-sekund-"
                        "uppdateringar.\n\n"
                        "Cykliciteten är måttlig. Spelmarknaden är "
                        "icke-cyklisk (människor spelar i både uppgång och "
                        "nedgång), men Kambi-resultatet svänger med "
                        "sportkalendern (VM och EM årligen, Olympics vart "
                        "fjärde år). Volatiliteten kommer från "
                        "regulatoriska beslut — PASPA-upphävandet 2018 "
                        "dubblerade Kambis värde på en vecka."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Kambis moat är inte mjukvaran i sig utan "
                        "riskhanteringsalgoritmerna — att sätta odds på 50 "
                        "000+ sportevents per dag med acceptabel vinstmarginal "
                        "kräver 10+ års historisk sportdata."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "NGR (Net Gaming Revenue): operatörens intäkt efter "
                        "vinstutbetalningar till spelare men före skatt — "
                        "basen för Kambis intäktsdelning med kunder."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare är Kambi ett rent "
                        "tillväxtcase — utdelning saknas, P/E är högt och "
                        "tillväxten måste fortsätta för att rättfärdiga "
                        "värderingen. Detta gör Kambi till en \"high beta\"-"
                        "aktie som svänger mer än marknaden i båda "
                        "riktningar.\n\n"
                        "USA-exponeringen är både största möjlighet och "
                        "största risk. 38 delstater har legaliserat "
                        "sportbetting sedan PASPA 2018, men varje delstat "
                        "har unika licenskrav och skatteregler. Kambi måste "
                        "vinna nya kundavtal i varje delstat — och kunder "
                        "kan byta leverantör."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Kambi-analys kräver spårning av NGR per kund, "
                "nya kundavtal och USA-delstatslegalisering."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Kambi publicerar kvartalsvis operator-NGR och "
                        "operator-margin (vinstmarginal Kambi tar per "
                        "dollar omsatt). Analysten ska följa tre KPI:er: "
                        "(1) organisk NGR-tillväxt, (2) "
                        "operator-margin (målet >30 procent), (3) antal "
                        "nya kundkontrakt per kvartal. Vidare spåras "
                        "amerikanska statliga legaliseringsbeslut via "
                        "American Gaming Association.\n\n"
                        "En viktig nyans: Kambi redovisar \"cashflow\"-"
                        "intäkter (faktiska betalningar från kunder) och "
                        "operatörsmarginal på olika sätt. När "
                        "operatörsmarginalen faller under 25 procent — "
                        "vilket händer under storhelger när spelare vinner "
                        "mer — sjunker Kambis intäkter. Följ denna "
                        "marginal kvartalsvis.\n\n"
                        "Kundkoncentrationen är hög. År 2023 stod Rush "
                        "Street Interactive, Bally's och Kindred för över "
                        "60 procent av intäkterna. Förlust av ett enda "
                        "storkundkontrakt kan ge 15-20 procentig "
                        "intäktsminskning — det hände Q4 2022 när "
                        "DraftKings valde att bygga eget, vilket gav "
                        "Kambi-aktien -30 procent på en månad."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Kambis största KPI är \"licensad\" NGR-tillväxt "
                        "i nya delstater — varje ny USA-delstatslegalisering "
                        "ger 5-15 MEUR ny årlig intäkt inom 12 månader."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Operator-margin: Kambis bruttomarginal per dollar "
                        "NGR — typiskt 28-32 procent, indikerar prissättnings-"
                        "makt och konkurrensläge."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Hämta American Gaming "
                        "Association månatlig state-by-state legaliserings-"
                        "karta; 2) Spåra Kambi press releases för nya "
                        "kundkontrakt; 3) Läs kvartalsrapportens organiska "
                        "NGR-tillväxt och operator-margin; 4) Beräkna "
                        "kundkoncentration (topp-3 kunder andel); 5) Följ "
                        "konkurrenternas resultat (DraftKings, FanDuel).\n\n"
                        "Exempel: Q2 2022 meddelade DraftKings att de "
                        "bygger egen sportsbook (SBTech var ägt av "
                        "DraftKings sedan 2020). Kambi förlorade därmed "
                        "ett potentiellt framtida kontrakt — aktien föll "
                        "30 procent på en vecka. Den som följt V09 "
                        "(kundkoncentration) hade redan positionerat sig "
                        "med mindre exponering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i Kambi-analys: kundkoncentration, "
                "USA-regleringsrisk och \"tillväxt-fälla\"."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Kundkoncentration: Kambi har 30+ kunder "
                        "men 5 kunder står för 70 procent av intäkterna. "
                        "När ett stort kundkontrakt förloras kan intäkterna "
                        "falla 15-20 procent på en gång. Detta hände Q4 "
                        "2022 (DraftKings) och Q3 2023 (Bally's sökte egen "
                        "plattform). Aktien föll 25-35 procent vid båda "
                        "tillfällena. V09-flaggan hade varnat i förväg.\n\n"
                        "Fälla 2 — USA-regleringsrisk: Sportbetting är "
                        "reglerat på delstatsnivå i USA. Varje delstat "
                        "kan ändra skatteregler, licenskrav eller "
                        "marknadsföringsrestriktioner. New York införde "
                        "51 procent skatt på GGR 2021 — vilket halverade "
                        "operatörernas marginaler. Massachusetts hade "
                        "förbud mot betting på in-state colleges. Dessa "
                        "regler påverkar Kambi indirekt genom kundernas "
                        "intäktspress.\n\n"
                        "Fälla 3 — Tillväxt-fälle: Kambi handlas på P/E "
                        "30-50, vilket reflekterar förväntning om 20+ "
                        "procent tillväxt i 5+ år. Om tillväxten faller "
                        "under 15 procent kan aktien halveras. Detta hände "
                        "Q1 2023 när tillväxten var 12 procent — aktien "
                        "föll 40 procent på 3 månader. Klassisk \"growth "
                        "trap\" där avtagande tillväxt straffas hårt."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: se 30 procent tillväxt och tro "
                        "att det är ny normalitet — Kambis tillväxt under "
                        "2020-2022 var ovanligt hög pga PASPA-effekt, "
                        "normalisering mot 15 procent var oundviklig."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Growth trap: aktie som prissätts för hög "
                        "tillväxt och straffas oproportionerligt när "
                        "tillväxten normaliserar — P/E-kompression kan "
                        "ge 50+ procent kursförlust även med intäktsökning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För kundkoncentration-fällan, "
                        "spåra topp-3 kunder andel kvartalsvis — om "
                        "över 60 procent, reducera position. För USA-"
                        "regleringsfällan, följd statliga skattebeslut "
                        "via AGA — om GGR-skatt överstiger 40 procent "
                        "i stor delstat, flagga risk. För tillväxt-fällan, "
                        "beräkna \"fair value\"-P/E baserat på långsiktig "
                        "tillväxtantagande 15 procent.\n\n"
        "När Kambi rapporterar enstaka kvartal med <15 procent tillväxt, "
        "rörs P/E-tolkning snabbt. AKM1 1.1-systemet varnar vid P/E > 35 "
        "med fallande tillväxt och rekommenderar reduktion till 50 procent "
        "av normal position."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar Kambi via V01, V09 och en "
                "regulatorisk riskfaktor i 1.1-integrationen."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V01 (tillväxt) är Kambis primära variabel — "
                        "AKM1 spårar organisk NGR-tillväxt mot 4 kvartals-"
                        "rullande snitt. När tillväxten faller under 15 "
                        "procent flaggas V01 gult; under 10 procent rött. "
                        "V09 (kundkoncentration) övervakar topp-3 kunders "
                        "andel — över 60 procent är rött, 40-60 procent "
                        "gult, under 40 procent grönt.\n\n"
                        "Eftersom Kambi saknar utdelning är V17 "
                        "(utdelningssäkerhet) ej applicerbart. Istället "
                        "används \"FCF-täckning\" — fri kassaflöde i "
                        "förhållande till marknadsvärde, som ett proxy-"
                        "mått. När FCF-yield faller under 2 procent "
                        "(vid högt P/E och avtagande tillväxt) flaggas "
                        "risk.\n\n"
                        "AKM1 1.1-integrationen lägger till en femte "
                        "faktor — \"regulatorisk riskpremie\" — baserad "
                        "på antal USA-delstater där Kambi är aktivt och "
                        "genomsnittlig GGR-skatt i dessa delstater. Vid "
                        "skatt över 40 procent i stor delstat adderas 1,5x "
                        "riskpremie på positionsstorlek."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med Kambi är att kombinera V01 "
                        "med V09 — när tillväxten faller under 15 procent "
                        "OCH kundkoncentration överstiger 60 procent har "
                        "Kambi historiskt sett förlorat 30+ procent på "
                        "6 månader."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "FCF-yield: fritt kassaflöde dividerat med "
                        "marknadsvärde — för Kambi bör vara över 3 procent "
                        "vid rättvist värderad tillväxtaktie."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att "
                        "styra positionssizing i en tillväxtaktie. När V01 "
                        "är grönt och V09 gult — som Q1 2021 — rekommenderar "
                        "AKM1 full position. När V01 blir gult och V09 rött "
                        "— som Q3 2022 — reduceras positionen till 40 "
                        "procent. Detta hjälper investerare att undvika "
                        "\"growth trap\"-förluster.\n\n"
                        "För svensk retail-investerare bör Kambi vara en "
                        "\"satellit-position\" om max 3-5 procent av "
                        "portföljen. Renodlade tillväxtaktier med hög "
                        "kundkoncentration och regulatorisk risk bör aldrig "
                        "vara core-holding."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre Kambi-fallstudier illustrerar regulatorisk risk: "
                "PASPA-upphävandet 2018, DraftKings-förlusten 2022 och "
                "New York-skatten 2021."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — PASPA-upphävandet maj 2018: USA:s "
                        "högsta domstol upphävde Professional and Amateur "
                        "Sports Protection Act (PASPA, 1992) vilket öppnade "
                        "för delstatlig legalisering av sportbetting. Kambi "
                        "var välpositionerat med 5+ kunder redo att lansera "
                        "i New Jersey, Pennsylvania och Indiana. Aktien "
                        "steg 80 procent på 3 månader, och under kommande "
                        "3 år växte omsättningen från 80 till 150 MEUR. "
                        "Lärdom: regulatoriska \"big bang\"-händelser ger "
                        "enorma möjligheter för beredda aktörer.\n\n"
                        "Fall 2 — DraftKings-förlusten Q4 2022: DraftKings "
                        "som var Kambi-kund sedan 2018 meddelade att de "
                        "skulle bygga egen sportsbook på SBTech-plattformen "
                        "(som DraftKings förvärvat 2020). Kontraktet löpte "
                        "ut september 2022. Aktien föll 30 procent på en "
                        "månad. V09 hade visat 25 procent intäktsberoende "
                        "av DraftKings i början av 2022 — red flag. Lärdom: "
                        "när en stor kund bygger egen teknologi är "
                        "kvarvarande kontraktstid kort och kännbar.\n\n"
                        "Fall 3 — New York GGR-skatt 2021: New York "
                        "legaliserade mobil sportbetting april 2021 med 51 "
                        "procent skatt på GGR (högst i USA). Operatörer "
                        "inklusive Kambi-kunder (FanDuel, DraftKings) "
                        "lanserade januari 2022 men med bruttomarginal "
                        "halverad. Kambi-resultatet pressades eftersom "
                        "Kambi-tariff baseras på NGR, och NGR reduceras "
                        "vid hög skatt. Lärdom: regulatoriska skattebeslut "
                        "påverkar Kambi indirekt via kundernas marginal."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: regulatoriska händelser driver "
                        "Kambi-resultatet mer än operationell effektivitet — "
                        "både uppåt (PASPA) och nedåt (skatter, "
                        "kontraktsförluster)."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "PASPA (Professional and Amateur Sports Protection "
                        "Act): 1992 federal lag som förbjöd sportbetting i "
                        "USA utanför Nevada — upphävdes maj 2018 och öppnade "
                        "för delstatlig legalisering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret i fallen bekräftar att Kambi är en "
                        "\"regulatorisk high-beta\"-aktie — svänger mer än "
                        "marknaden på grund av USA-reglering. Detta är "
                        "både möjlighet och risk.\n\n"
                        "Lärdom för svensk retail-investerare: Kambi bör "
                        "övervägas endast om man har kapacitet att följa "
                        "USA-reglering och kundkontrakt kvartalsvis. Annars "
                        "är bredare spel-/tech-fonder bättre alternativ. "
                        "AKM1 1.1-systemet hjälper till att styra "
                        "positionssizing baserat på regulatoriska risk-"
                        "signalerna."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Kambi-analys kräver förståelse för "
                "USA-reglering, B2B-SaaS-ekonomi och riskhanteringsteknologi."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer inte bara "
                        "Kambi-kvartalsrapporten utan American Gaming "
                        "Association månatlig statistik, Eilers & Krejcik "
                        "Gaming (analysfirma för USA-spelmarknaden) och "
                        "S&P Global Market Intelligence för konkurrentdata. "
                        "Man korskopplar Kambis operator-margin mot "
                        "konkurrenternas (SBTech, OpenBet) och identifierar "
                        "prissättningspress.\n\n"
                        "Teknologi-analysen ska vara kvantitativ. Spåra "
                        "Kambis odds-precision — mätt som \"margin take\" "
                        "vs theoretical hold — över tid. Om precisionen "
                        "faller indikerar detta teknisk försämring. Vidare "
                        "följer mästaren latency i live-betting (målet <500 "
                        "ms) och sportdata-licensiering (Sportradar, "
                        "Genius Sports).\n\n"
                        "Slutligen förstår mästaren att Kambi är en "
                        "\"picks and shovels\"-investering för spel-"
                        "industrin — istället för att välja vilken "
                        "operatör som vinner, investera i plattformen som "
                        "alla operatörer använder. Detta minskar "
                        "konkurrensrisk men ökar regulatorisk risk."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att bygga en "
                        "regulatorisk riskmodell som prissätter delstatlig "
                        "legaliseringsrisk och skattebelastning per "
                        "operatör — detta ger analytikern en edge över "
                        "den som enbart läser Kambi-rapporter."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Picks and shovels-strategi: att investera i "
                        "leverantörer till en bransch snarare än "
                        "slutproducenterna — sprider risk över flera "
                        "kunder men exponerar för branschreglering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att förstå Kambi som "
                        "en \"regulatorisk tillväxtaktie\" — kombination "
                        "av B2B-SaaS-moat och USA-regleringsrisk. Den som "
                        "kan hantera båda dimensionerna kan fånga både "
                        "tillväxtmöjligheter och undvika kontraktsförluster.\n\n"
                        "För svensk retail-investerare kan Kambi vara en "
                        "\"satellit-position\" om max 3-5 procent av "
                        "portföljen, men endast om man har tid att följa "
                        "USA-reglering. Annars bör man exponera mot "
                        "spelindustrin via diversifierade tech-fonder där "
                        "professionella förvaltare gör regelverksanalysen."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-15")

# ===========================================================================
# pc-16 — Case: Beijer Ref — kyl-distribution
# ===========================================================================
COURSES["pc-16-case-beijer-ref"] = {
    "why": (
        "Beijer Ref är en kyl-distributionsjätte med en stabil men cyklisk "
        "intäktsbas kopplad till bygg- och kylsektorn. För svensk "
        "retail-investerare visar Beijer Ref hur ett distributionsmoat kan "
        "generera ROIC över 20 procent i decennier, och varför V05 och V17 "
        "signalerna fungerar för \"tråkiga\" bolag. Det är också ett fall "
        "där naturligt klimatarbete (HFC-fasut, F-gas-reglering) driver "
        "strukturell efterfrågan."
    ),
    "history": {
        "origin": (
            "Beijer Ref spårar sina rötter till 1866 då Nils Beijer startade "
            "en handelsträdgård i Malmö, men den moderna kylverksamheten "
            "började 1970-talet när bolaget gick in i distributionsverksamhet "
            "för kyl- och klimatutrustning. Under 1990-talet köptes bolaget "
            "av Beijer Alma-koncernen och knoppades ut som självständigt "
            "listat bolag 1998. Den stora expansionen inleddes 2000 när "
            "Beijer Ref förvärvade danska Dalum Refrigeration och etablerade "
            "nordiskt nätverk."
        ),
        "evolution": (
            "Under 2000-talet expandera Beijer Ref aggressivt utanför Norden: "
            "Storbritannien (2005), Sydafrika (2011), Italien (2013), "
            "Australien (2014) och USA (2016). Bolaget förvärvade över 30 "
            "distributionsföretag under perioden, vilket gav global täckning "
            "inom kyl- och klimatdistribution. Affärsmodellen var enkel: "
            "köpa lokala distributionsaktörer med kundrelationer, integrera "
            "i Beijer Ref-plattformen och utnyttja stordriftsfördelar i "
            "inköp från Carrier, Daikin, Danfoss och Emerson."
        ),
        "modern": (
            "Idag är Beijer Ref ett av världens största kyl- och "
            "klimatdistributionsbolag med närvaro i 40+ länder och "
            "omsättning cirka 22 mdr SEK (2023). Bolaget är noterat på "
            "Nasdaq Stockholm och har genererat stabil ROIC över 20 procent "
            "och EBIT-marginal runt 8-10 procent under 2010-talet. "
            "F-gas-reglering (EU 517/2014) och Kigali-amendementet 2016 "
            "driver strukturell övergång från HFC till naturliga köldmedier "
            "(CO2, ammoniak) vilket gynnar Beijer Ref som har "
            "teknikkompetens och utbildningsnätverk."
        ),
    },
    "lynchSection": (
        "Lynch skulle uppskatta Beijer Ref som ett klassiskt \"vans trailers\"-"
        "case — en tråkig distributionsaktie med starkt moat och stabil "
        "tillväxt. Han skulle dock varna för att förvärvsdriven tillväxt "
        "kan dölja matt organisk tillväxt och att integrationsrisk i stora "
        "förvärv är underskattad."
    ),
    "grahamSection": (
        "Graham skulle betrakta Beijer Ref som en defensiv \"bond-like\"-"
        "aktie med stabil utdelning och substansvärde skyddat av "
        "distributionsnätverket. Han skulle kräva P/E under 15 och "
        "utdelningstäckning över 2,0 innan inträde."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar Beijer Ref via V05 (ROIC-stabilitet), "
        "V17 (utdelningssäkerhet) och V14 (marginalpress i cykelbotten). "
        "1.1-integrationen spårar organisk vs förvärvsdriven tillväxt och "
        "varnar om förvärvsandel överstiger 70 procent av total tillväxt."
    ),
    "chapters": [
        {
            "intro": (
                "Beijer Ref är en kyl- och klimatdistributionsjätte vars "
                "resultat drivs av byggkonjunktur, kylmedelsreglering och "
                "global expansion via förvärv."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Beijer Ref distribuerar kyl- och klimatkomponenter "
                        "till installation entreprenörer — kompressorer, "
                        "köldmedier, värmeåtervinningssystem. Affärsmodellen "
                        "är B2B-distribution med marginal på cirka 25-30 "
                        "procent och EBIT-marginal runt 8-10 procent. "
                        "Konkurrenssituationen är fragmenterad — i varje "
                        "land finns 2-5 lokala aktörer, men ingen annan har "
                        "Beijer Refs globala täckning. Watsco (USA) är den "
                        "närmaste jämförbara konkurrenten.\n\n"
                        "Moatet ligger i tre dimensioner: (1) "
                        "leverantörsrelationer med Carrier, Daikin, Danfoss "
                        "och Emerson som ger Beijer Ref volymrabatter på "
                        "8-15 procent under mindre distributörer; (2) "
                        "logistikkapacitet med 200+ lager globalt och "
                        "leverans inom 24 timmar; (3) teknisk support och "
                        "utbildning där installatörer utbildas på Beijer Ref "
                        "och därmed binds till leverantör. Detta är ett "
                        "klassiskt distributionsmoat som är svårt att "
                        "disruptera eftersom kyl/AC-installation är en "
                        "ingenjörstjänst med tjocka manualer.\n\n"
                        "Cykliciteten är måttlig. Efterfrågan följer "
                        "byggkonjunktur och klimatanläggningar, men "
                        "underhålls- och serviceandel (~40 procent av "
                        "intäkter) är icke-cyklisk. Detta gör Beijer Ref "
                        "mindre volatil än rena byggdistributörer som "
                        "Dustin eller Byggmax."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Beijer Refs moat är inte kylutrustningen i sig utan "
                        "leverantörsrelationerna — Carrier och Daikin ger "
                        "bättre priser till den distributör som säljer 1 "
                        "miljard EUR per år än till den som säljer 50 miljoner."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "F-gas-förordning (EU 517/2014): EU-regelverk som "
                        "fasar ut HFC-köldmedier med hög GWP (Global Warming "
                        "Potential) fram till 2030 — driver övergång till "
                        "naturliga köldmedier som CO2 och ammoniak."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare är Beijer Ref ett "
                        "exempel på en stabil \"compounding\"-aktie med 20+ "
                        "procent ROIC och långsiktig organisk + förvärvsdriven "
                        "tillväxt. Aktien har stigit från 5 kr (2008) till 250 "
                        "kr (2024) — en 50-faldig ökning inklusive utdelning.\n\n"
                        "F-gas-reglering är en strukturell vindpust. När "
                        "HFC-köldmedier fasas ut krävs nya komponenter, "
                        "ny utbildning och nya tjänster — allt som gynnar "
                        "Beijer Ref som är först med att erbjuda naturliga "
                        "köldmediekoncept. Denna regulatoriska driver är "
                        "säker till 2030."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Beijer Ref-analys kräver spårning av organisk vs "
                "förvärvsdriven tillväxt, ROIC och integrationsförlopp."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Beijer Ref publicerar kvartalsvis försäljning uppdelad "
                        "på region (EMEA, Asia-Pacific, Americas) och organisk "
                        "vs förvärvsdriven tillväxt. Analysten ska följa tre "
                        "KPI:er: (1) organisk tillväxt (målet >3 procent), "
                        "(2) EBIT-marginal (målet >8 procent), (3) ROIC "
                        "(målet >20 procent). Vidare spåras antal nya "
                        "förvärv per år som indikator på framtida intäkts-"
                        "tillväxt.\n\n"
                        "Förvärvsintegration ska följas noggrant. Beijer Ref "
                        "har historiskt sett integrerat nya bolag över 18-24 "
                        "månader och därmed höjt deras EBIT-marginal från 4-5 "
                        "procent till 7-9 procent. Om integrationen tar "
                        "längre tid (som förvärvet av US-distributören "
                        "CFC Refrigeration 2016 som tog 36 månader) är det "
                        "en varning.\n\n"
                        "F-gas-effekten ska isoleras. När HFC-köldmedier "
                        "fasas ut stiger priset på kvarvarande kvoter — "
                        "Beijer Ref kan ta marginal på kvot-handel. Detta "
                        "har bidragit med 0,5-1 procentenheter till "
                        "EBIT-marginalen 2018-2023, men effekten avtar när "
                        "fasningen slutförs 2030."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Viktigaste KPI:et är organisk tillväxt — om den "
                        "faller under 3 procent under 4 kvartal kan "
                        "förvärvsdriven tillväxt inte dölja matt organisk "
                        "underliggande."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "ROIC (Return on Invested Capital): avkastning på "
                        "investerat kapital — för Beijer Ref bör vara över "
                        "15 procent, moat-bekräftande nivå."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Läs kvartalsrapportens "
                        "organiska vs förvärvsdrivna tillväxt; 2) Beräkna "
                        "ROIC för innevarande kvartal och jämför med 10-års-"
                        "snitt; 3) Spåra integration av nya förvärv mot "
                        "18-månadersmål; 4) Följ F-gas-kvotpriser via "
                        "EEX (European Energy Exchange); 5) Jämför EBIT-"
                        "marginal mot Watsco och andra distributörer.\n\n"
                        "Exempel: Q3 2023 rapporterade Beijer Ref organisk "
                        "tillväxt 1 procent — under målet 3 procent. "
                        "EBIT-marginal föll till 7,5 procent. Aktien föll "
                        "10 procent på en vecka. Den som följt organisk "
                        "tillväxt-trend hade positionerat sig innan."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i Beijer Ref-analys: förvärvsdriven vs organisk "
                "tillväxt, F-gas-effektens tillfällighet och integrationsrisk."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Förvärvsdriven tillväxtmaskering: "
                        "Beijer Ref har vuxit 10-15 procent per år sedan "
                        "2010, men 60-70 procent har varit förvärvsdrivet. "
                        "När förvärvstakten avtar (som 2023) faller "
                        "totaltillväxten mot organisk nivå. Investerare som "
                        "betalat för 12 procent tillväxt får plötsligt 4 "
                        "procent — P/E-kompression.\n\n"
                        "Fälla 2 — F-gas-effekten tillfällig: Mellan 2018-"
                        "2023 har F-gas-kvothandel bidragit med 0,5-1 "
                        "procentenhet till EBIT-marginalen. När HFC-fasning "
                        "slutförs 2030 försvinner detta bidrag. Många "
                        "analytiker extrapolerar dagens marginaler framåt "
                        "utan att justera för denna tillfälliga effekt.\n\n"
                        "Fälla 3 — Integrationsrisk i storförvärv: När "
                        "Beijer Ref gör ett stort förvärv (>5 procent av "
                        "koncernintäkter) ökar integration risk. CFC "
                        "Refrigeration 2016 tog 36 månader att integrera "
                        "och gav temporär marginalpress. ASHCO 2022-stor-"
                        "förvärv har haft liknande utmaningar."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: extrapolera 10 procent årlig "
                        "tillväxt utan att separera organisk och förvärv — "
                        "när M&A-marknaden svalnar faller totaltillväxten."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Organisk tillväxt: försäljningstillväxt justerad "
                        "för valutor, förvärv och avyttringar — ger sann "
                        "bild av kärnverksamhetens utveckling."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För förvärvsfällan, beräkna "
                        "\"organisk EV/EBITDA\" där endast organisk "
                        "tillväxt används — detta ger mer konservativ "
                        "värdering. För F-gas-fällan, justera EBIT-marginal "
                        "med att dra av 0,5 procentenhet från 2025 och 1 "
                        "procentenhet från 2027.\n\n"
                        "För integrationsfällan, följ noga de första 4 "
                        "kvartalen efter storförvärv. Om EBIT-marginal i "
                        "förvärvat bolag inte når 7 procent inom 18 månader "
                        "är det en varning. AKM1 1.1-systemet flaggar detta "
                        "automatiskt."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar Beijer Ref via V05, V17 och V14 "
                "i en integrerad 1.1-modul med förvärvs-spårning."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V05 (ROIC-stabilitet) är Beijer Refs styrka — "
                        "AKM1 spårar 5-årigt snitt ROIC, som varit över 20 "
                        "procent sedan 2010. V17 (utdelningssäkerhet) är "
                        "stark — utdelning har höjts varje år sedan 2009 "
                        "med täckning över 2,5. V14 (marginalpress) "
                        "flaggar när EBIT-marginal faller under 7 procent — "
                        "hände 2009, 2015 och 2023.\n\n"
                        "AKM1 1.1-integrationen lägger till en \"förvärvs-"
                        "tracker\" som övervakar: (1) antal nya förvärv per "
                        "år; (2) andel av totaltillväxt från förvärv; (3) "
                        "integration-status per storförvärv. När förvärvs-"
                        "andel överstiger 70 procent av total tillväxt flaggas "
                        "risk för organisk mattning.\n\n"
                        "Systemet ger en \"compounding score\" på 0-100 — "
                        "Beijer Ref har hållit över 80 sedan 2015. När score "
                        "faller under 70 (t.ex. vid kombinerad marginalpress "
                        "och matt organisk tillväxt) reduceras positionen "
                        "med 30 procent."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med Beijer Ref är att identifiera "
                        "när bolaget övergår från compounding till mognad — "
                        "fallande organisk tillväxt och stagnerande ROIC är "
                        "tidiga tecken."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Compounding score: AKM1-beräkning 0-100 baserad på "
                        "ROIC, organisk tillväxt, marginaltrend och "
                        "balansräkningsstyrka — värden över 70 indikerar "
                        "fortsatt compounding."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att "
                        "undvika \"compounding trap\" — bolag som såg ut "
                        "som compounders men övergick till mognad. Beijer "
                        "Ref har hittills undvikit denna fallgrop.\n\n"
                        "För svensk retail-investerare är Beijer Ref en "
                        "lämplig core-holding i industriexponering — "
                        "stabil ROIC, stark utdelning och strukturell "
                        "klimatvind. Positionen kan vara 3-5 procent av "
                        "portföljen med långsiktig hållbarhet."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre Beijer Ref-fallstudier visar distributionsmoat i "
                "praktiken: Dalum-förvärvet 2000, Sydafrika-expansionen "
                "2011 och USA-intåget 2016."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Dalum Refrigeration 2000: Beijer Refs "
                        "första stora utlandesförvärv, danska Dalum, "
                        "dubblerade koncernens storlek och etablerade "
                        "nordiskt nätverk. Integrationen var snabb — inom "
                        "12 månader nåddes EBIT-marginal 7 procent (från "
                        "4 procent pre-förvärv). Detta etablerade "
                        "integrationsmodellen: köp, integrera, höj "
                        "marginal — som blivit Beijer Refs signaturmetod.\n\n"
                        "Fall 2 — Sydafrika 2011: Beijer Ref förvärvade "
                        "Tre Renewable Resources i Sydafrika för 200 MSEK. "
                        "Detta var första steget in i södra halvklotet och "
                        "gav möjlighet att testa affärsmodellen utanför "
                        "Europa. Integration tog 24 månader men gav "
                        "EBIT-marginal 9 procent — över koncernsnitt. "
                        "Lärdom: Beijer Refs modell är överförbar till "
                        "olika geografier.\n\n"
                        "Fall 3 — CFC Refrigeration USA 2016: Största "
                        "förvärvet hittills — 1,3 mdr SEK för "
                        "US-distributören med 600 anställda. Integration "
                        "blev problematisk — olika affärskultur, "
                        "komplex produktmix och kompetensbrist. EBIT-"
                        "marginal nådde inte 7 procent förrän 2020. "
                        "Lärdom: stora förvärv i nya geografier kräver "
                        "tålamod och särskild integrationsresurs."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: Beijer Refs modell fungerar men "
                        "kräver disciplin — små förvärv i kända geografier "
                        "lyckas snabbare än stora i nya regioner."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Integration risk: risk att förvärvat bolag inte "
                        "når planerade synergier eller marginalnivå inom "
                        "förväntad tid — vanligast vid stora cross-border-"
                        "förvärv."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret i fallen bekräftar att Beijer Refs "
                        "distributionsmoat är portabelt men kräver "
                        "anpassning till lokala förhållanden. Förmågan att "
                        "integrera är central.\n\n"
                        "Lärdom för svensk retail-investerare: Beijer Ref "
                        "är en av få svenska compounding-aktier med 20+ "
                        "procent ROIC och 15+ procent totalavkastning per "
                        "år över 15 år. Bolaget förtjänar en core-position "
                        "i en långsiktig portfölj."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Beijer Ref-analys kräver förståelse för "
                "distributionsmoat, regulatoriska vindar och integrations-"
                "konst."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer inte bara "
                        "kvartalsrapporten utan byggkonjunktur i 5 "
                        "regioner (EU, USA, Sydafrika, Australien, Sydost-"
                        "asien), F-gas-kvotpriser och konkurrentdata "
                        "(Watsco, ABC Supply). Man korskopplar Beijer Refs "
                        "organiska tillväxt mot global kyl/AC-marknad "
                        "(BSRIA-data) och identifierar marknadsandelsvinster.\n\n"
                        "Integrationsanalysen ska vara systematisk. Spåra "
                        "varje storförvärv i en integration-tracker med "
                        "mål EBIT-marginal >7 procent inom 18 månader. Om "
                        "integration överstiger 24 månader, flagga risk. "
                        "Kvantifiera \"integration cost\" som procentsats "
                        "av förvärvslikvid — om över 5 procent, varna.\n\n"
                        "Slutligen förstår mästaren att Beijer Refs moat "
                        "är dubbel: leverantörsrelationer OCH "
                        "installatörskunskap. Båda tar decennier att bygga "
                        "upp, vilket gör moatet strukturellt och "
                        "hållbart — detta är varför Beijer Ref förtjänar "
                        "en premiumvärdering över cykeln."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att kombinera "
                        "distributionsmoat-analys med regulatorisk "
                        "timing — Beijer Ref har 20+ procents ROIC under "
                        "F-gas-transitionen, men post-2030 kan "
                        "marginaltryck återvända."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Compounding aktie: aktie som genererar stabil hög "
                        "ROIC och återinvesterar vinster till hög avkastning "
                        "— ger exponentiell värdeskapande över tid."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att förstå Beijer Ref "
                        "som en \"all-weather compounder\" — stabil i "
                        "recession, expansiv i högkonjunktur. Den som "
                        "köper och håller 10+ år har historiskt sett "
                        "överträffat marknaden med bred marginal.\n\n"
                        "För svensk retail-investerare kan Beijer Ref vara "
                        "en av 5-7 core-positioner i en långsiktig "
                        "portfölj. AKM1 1.1-systemet hjälper till att "
                        "tidigvarna om compounding-egenskaperna förloras — "
                        "men hittills har Beijer Ref varit en av Sveriges "
                        "mest stabila compounding-aktier."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-16")

# ===========================================================================
# pc-17 — Case: Sandvik — verktyg
# ===========================================================================
COURSES["pc-17-case-sandvik"] = {
    "why": (
        "Sandvik är Sveriges näst äldsta börsnoterade industriföretag och en "
        "global ledare inom hårdmetallverktyg, gruvmaskiner och specialstål. "
        "För svensk retail-investerare illustrerar Sandvik ett långsiktigt "
        "moat kopplat till teknisk komplexitet och global distribution, där "
        "ROIC ofta överstiger 15 procent. Företaget är också en proxy för "
        "global gruvinvestering och biltillverkning via Sandvik Coromant."
    ),
    "history": {
        "origin": (
            "Sandvik grundades 1862 i Sandviken av Göran Fredrik Göransson "
            "som blev först i världen att framgångsrikt tillämpa "
            "Bessemerprocessen för stålframställning — en innovation som "
            "revolutionerade stålindustrin. Bolaget noterades på "
            "Stockholmsbörsen 1901 och blev därmed en av de äldsta "
            "noterade svenska industriföretagen. Under tidigt 1900-tal växte "
            "Sandvik till en global aktör inom stålrör och specialstål med "
            "export till över 50 länder."
        ),
        "evolution": (
            "På 1940-talet utvecklade Sandvik cementerad hårdmetall "
            "(widia) som blev grunden till Sandvik Coromant — idag "
            "världens största tillverkare av skärverktyg. Under 1950-70-"
            "talen breddades verksamheten till gruvutrustning (Sandvik "
            "Mining and Construction) och specialstål (Sandvik "
            "Materials Technology). Stora förvärv inkluderade "
            "amerikanska Walter AG (1989) och tyska Prototyp (1995). "
            "Bolaget blev på så sätt ett bredat industriallyft."
        ),
        "modern": (
            "Idag är Sandvik noterat på Nasdaq Stockholm med omsättning "
            "cirka 122 mdr SEK (2023) och 40 000 anställda i 150+ länder. "
            "Tre segment: Sandvik Manufacturing and Machining Solutions "
            "(skärverktyg, 50 procent av intäkter), Sandvik Mining and "
            "Rock Solutions (gruvutrustning, 30 procent) och Sandvik "
            "Materials Technology (specialstål, 20 procent). Under 2020-"
            "talet har bolaget genomfört en digital transformation med "
            "inrikting på \"industry 4.0\"-lösningar — automation, "
            "IoT och AI-drivna skäroptimeringar."
        ),
    },
    "lynchSection": (
        "Lynch skulle uppskatta Sandvik som ett klassiskt moat-bolag med "
        "globalt kunnande, där \"tråkiga\" skärverktyg är kritiska för "
        "industriell produktion. Han skulle dock varna för att gruvcykel "
        "kan pressa resultatet 20-30 procent i lågkonjunktur och att "
        "kapitalförbränning i cykeltopp är en klassisk risk."
    ),
    "grahamSection": (
        "Graham skulle betrakta Sandvik som en kvalitetsaktie med stark "
        "balansräkning och substansvärde skyddat av teknikportfölj. Han "
        "skulle kräva P/E under 15 och utdelningstäckning över 2,0 i "
        "cykelmedelvärde innan inträde."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar Sandvik via V05 (ROIC-stabilitet), V14 "
        "(marginalpress i gruvsegmentet) och V17 (utdelningssäkerhet). "
        "1.1-integrationen spårar PMI-cykel mot Manufacturing-segment och "
        "kapex/EBITDA för Mining-segment."
    ),
    "chapters": [
        {
            "intro": (
                "Sandvik är en svensk industriell moat-bolag vars resultat "
                "drivs av global industriproduktion (Manufacturing) och "
                "gruvinvesteringar (Mining)."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Sandvik Manufacturing and Machining Solutions "
                        "tillverkar cementerade hårdmetallskärverktyg under "
                        "varumärkena Sandvik Coromant, Walter, Seco och "
                        "Dormer Pramet. Dessa är kritiska för bearbetning "
                        "av metallkomponenter i fordons-, flyg- och "
                        "maskinindustri. Moatet ligger i patent, "
                        "beläggningskunskap och CAD/CAM-integration — när "
                        "Volvo designar en ny motorrm ligger Sandviks "
                        "skärverktyg specificerade från start.\n\n"
                        "Sandvik Mining and Rock Solutions tillverkar "
                        "gruvmaskiner — borrar, lastare, truckar och "
                        "krossningsutrustning — för underjords- och "
                        "ytbrytning. Konkurrenter är Epiroc (utknoppad från "
                        "Atlas Copco 2017) och Caterpillar. Moatet ligger "
                        "i servicenätverk — Sandvik har 24/7 service i 200+ "
                        "gruvor globalt med reservedelslager på plats. "
                        "Serviceandel är 40 procent av intäkter.\n\n"
                        "Sandvik Materials Technology tillverkar "
                        "specialstål för krävande applikationer — "
                        "roströr, finrör för panna och värmare, "
                        "bandaging för kärnbränsle. Detta är minsta "
                        "segmentet men högsta marginalen — EBIT över 15 "
                        "procent."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sandviks moat är inte stålet i sig utan "
                        "CAD/CAM-integrationen — när en kund designar in "
                        "Sandviks skärverktyg i sin produktionslinje "
                        "blir byte av leverantör 5-10 års arbete."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Cementerad hårdmetall: kompositmaterial med "
                        "tungkarbid-korn i kobolt-bindemedel — ger "
                        "extrem hårdhet och används i skärverktyg för "
                        "metallbearbetning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare är Sandvik en av "
                        "få svenska moat-bolag med 15+ procents ROIC över "
                        "hela cykeln. Aktien har stigit från 50 kr (2009) "
                        "till 250 kr (2024) — en 5x-ökning inklusive "
                        "utdelning.\n\n"
                        "Digital transformation är nyckelstrategin. "
                        "Sandvik lanserade CoroPlus-plattformen 2018 "
                        "med IoT-uppkopplade skärverktyg som skickar "
                        "realtidsdata till molnanalys — detta höjer "
                        "kundens produktivitet och binder dem till "
                        "Sandvik-ekosystemet."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Sandvik-analys kräver spårning av PMI-cykel, "
                "gruvkapex och segmentspecifika KPI:er."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Sandvik publicerar kvartalsvis organisk "
                        "tillväxt och EBIT-marginal per segment. "
                        "Analysten ska följa: (1) Manufacturing-"
                        "segmentets volymtillväxt vs global PMI; (2) "
                        "Mining-segmentets orders vs BHP/Rio Tinto "
                        "kapex; (3) Materials Technology-marginal "
                        "(målet >15 procent). Dessutom följs "
                        "serviceandel som procent av intäkter — målet "
                        ">40 procent.\n\n"
                        "Viktigt är att skilja på kortsiktig "
                        "konjunktursvängning och strukturell trend. "
                        "Manufacturing-segmentet följer global PMI med "
                        "1-2 kvartals fördröjning — om PMI går från 52 "
                        "till 48, faller Sandviks organiska tillväxt "
                        "från +5 till -3 inom 6 månader. Detta är "
                        "normalt och ska inte tolkas som moat-erosion.\n\n"
                        "Mining-segmentet är mer volatilt men har "
                        "större serviceandel — gruvaläggningar skär "
                        "nyinvesteringar men behöver underhålla "
                        "existerande utrustning. Detta gör Mining-"
                        "marginalen stabilare än volymen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Nyckel-KPI:et är serviceandel av intäkter — när "
                        "Service/Total överstiger 45 procent är moatet "
                        "starkt, eftersom serviceintäkter är återkommande "
                        "och mindre cykliska än produktförsäljning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Serviceandel: andel av intäkter från service, "
                        "reservedelar och underhåll — mäter moat-styrka "
                        "eftersom service är återkommande och mindre "
                        "cyklisk än nyförsäljning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Hämta global PMI från "
                        "IHS Markit; 2) Hämta BHP/Rio Tinto/Barrick "
                        "kapex-guidance; 3) Läs Sandviks kvartalsrapport "
                        "med fokus på organisk tillväxt och EBIT-marginal "
                        "per segment; 4) Beräkna serviceandel per segment; "
                        "5) Följ CoroPlus-pipeline som ledande indikator "
                        "på digital transformation.\n\n"
                        "Exempel: Q1 2023 rapporterade Sandvik Mining "
                        "ordertillväxt -10 procent när kapex i storgruvor "
                        "föll. Men serviceandel höll 42 procent — "
                        "moatet var intakt. Aktien föll bara 5 procent, "
                        "mycket mindre än cykliska konkurrenter. Den som "
                        "följde serviceandel förstod att cykelbotten var "
                        "köpläge."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i Sandvik-analys: cykelmisstolkning, "
                "Mining-volatilitet och digital transformationsrisk."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Cykelmisstolkning: Sandvik har "
                        "historiskt sett P/E 6-8 i cykeltopp och 18-25 i "
                        "cykelbotten — klassisk industriinvertering. 2007 "
                        "P/E 7 innan finanskris, 2015 P/E 20 i botten. "
                        "Värdeinvesterare som köpte 2007 \"för att det var "
                        "billigt\" förlorade 60 procent.\n\n"
                        "Fälla 2 — Mining-volatilitet: Mining-segmentet "
                        "kan falla 30-40 procent i en gruvkapex-kollaps, "
                        "som 2015 och 2020. Men många analytiker tittar "
                        "bara på koncernmarginal och missar att Mining är "
                        "volatilt medan Manufacturing är stabilt. Separat "
                        "analys per segment krävs.\n\n"
                        "Fälla 3 — Digital transformation-risk: Sandviks "
                        "satsning på CoroPlus och Industry 4.0 kräver "
                        "150-200 MSEK årligen i R&D-ökning. Om digitala "
                        "lösningar inte tas upp av kunder (t.ex. kinesiska "
                        "konkurrenter erbjuder billigare alternativ) blir "
                        "ROI svag. Hittills har take-up varit positiv men "
                        "osäkerheten är hög."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Fällan: tolka fallande Mining-volym som moat-"
                        "erosion när det egentligen är cykel — Sandviks "
                        "serviceandel bekräftar moatet även under volymfall."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Cykel-inverterad P/E: fenomen där industriaktiers "
                        "P/E är lägst i vinsttopp och högst i vinstbotten "
                        "— motsatt normal logik och en vanlig fälla för "
                        "värdeinvesterare."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För cykelfällan, beräkna "
                        "\"mid-cycle EPS\" baserad på 10-års EBIT-marginal-"
                        "snitt (Sandvik 14 procent). För Mining-fällan, "
                        "följ serviceandel som moat-indikator — under 35 "
                        "procent är riskflagga. För digital-fällan, följ "
                        "CoroPlus-användarstatistik (Sandvik publicerar "
                        "årligen) och jämför mot konkurrenternas IoT-"
                        "plattformar (Kennametal, ISCAR).\n\n"
                        "AKM1 1.1-systemet ger automatiska varningar när "
                        "cykelposition extremiseras. 2022 flaggade systemet "
                        "\"reducera\" när V19 (kapitalförbränning) "
                        "översteg 1,1 och V17 täckning föll under 1,8 — "
                        "före den 25-procentiga kursnedgången 2023."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar Sandvik som moat-bolag med "
                "cykel-risk via V05, V14, V17 och V19 i 1.1-integrationen."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V05 (ROIC-stabilitet) bekräftar Sandviks moat — "
                        "10-års snitt ROIC är 16 procent, över moat-"
                        "tröskeln 15 procent. V14 (marginalpress) flaggar "
                        "när EBIT-marginal faller under 12 procent — "
                        "hände 2009, 2015, 2020, alla cykelbottnar. V17 "
                        "(utdelningssäkerhet) är stark — utdelning höjd "
                        "varje år sedan 2009, täckning över 2,0 i normala "
                        "år.\n\n"
                        "V19 (kapitalförbränning) är den viktigaste "
                        "varningsindikatorn för Sandvik. När capex/EBITDA "
                        "överstiger 1,0 i cykeltopp (som 2007, 2011, 2018) "
                        "har EBIT-marginal fallit inom 12 månader. AKM1 "
                        "varnar redan vid 0,9 och rekommenderar "
                        "positionssizing-reduktion.\n\n"
                        "1.1-integrationen kombinerar V05/V14/V17/V19 med "
                        "en PMI-känslighetsmodell och en Mining-kapex-"
                        "modell. Systemet ger en \"industrial moat score\" "
                        "0-100 — Sandvik har hållit över 75 sedan 2010. "
                        "När score faller under 65 reduceras positionen "
                        "automatiskt med 25 procent."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med Sandvik är att kombinera V05 "
                        "(moat) med V19 (cykel) — moatet håller, men "
                        "cykelposition avgör tajming."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Industrial moat score: AKM1-beräkning 0-100 för "
                        "industriaktier baserad på ROIC-stabilitet, "
                        "serviceandel, design-in-moat och konkurrens-"
                        "position — över 70 indikerar hållbart moat."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att "
                        "styra Sandvik-positionen baserat på cykelläge. "
                        "Vid cykelbotten (V14 rött, V19 lågt) adderar "
                        "AKM1 30 procent. Vid cykeltopp (V19 högt, V17 "
                        "fallande) reducerar AKM1 30 procent. Detta "
                        "hjälper investerare undvika cykelmiss-steg.\n\n"
                        "För svensk retail-investerare kan Sandvik vara "
                        "en core-position om 3-5 procent av portföljen, "
                        "speciellt i en industricykelbotten. Den som "
                        "saknar cykel-timing-förmåga kan behålla "
                        "konstant position och låta moat-arbetet löpa över "
                        "10+ år."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre Sandvik-fallstudier illustrerar moat + cykel: "
                "Bessemer-innovationen 1868, finanskrisen 2008-2009 och "
                "CoroPlus-lanseringen 2018."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Bessemer-innovationen 1868: Göransson "
                        "lyckades 1868 som först i värld att framställa "
                        "kärvbart Bessemerstål genom att tillsätta "
                        "mangan. Detta gav Sandvik en teknisk ledning "
                        "som varade i 50+ år och etablerade bolaget som "
                        "global ståljätte. Lärdom: teknisk innovation i "
                        "uppsättningen ger långsiktigt moat.\n\n"
                        "Fall 2 — Finanskrisen 2008-2009: Sandvik föll "
                        "från 130 kr (2008) till 30 kr (2009), -77 "
                        "procent. EBIT-marginalen föll från 18 till 5 "
                        "procent. V14 blev rött, V17 föll under 1,8. "
                        "Men V05 (ROIC) höll över 12 procent — moatet "
                        "var intakt. Den som köpte i mars 2009 fördubblade "
                        "kapitalet på 18 månader. Lärdom: cykelbotten i "
                        "moat-bolag är köpläge.\n\n"
                        "Fall 3 — CoroPlus-lanseringen 2018: Sandvik "
                        "lanserade sin IoT-uppkopplade skärverktygs-"
                        "plattform CoroPlus, med 200+ anslutna maskiner "
                        "vid lansering. År 2024 är antalet över 5 000. "
                        "Kunder rapporterar 10-15 procent "
                        "produktivitetsökning. Aktien steg 60 procent "
                        "2018-2021. Lärdom: digital transformation kan "
                        "förstärka moatet, men kräver långsiktigt "
                        "R&D-tålamod."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: Sandviks moat har överlevt 160 "
                        "år genom kontinuerlig innovation — Bessemer, "
                        "hårdmetall, digital. Detta är sann moat-styrka."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "IoT-uppkopplat skärverktyg: skärverktyg med "
                        "sensorer som skickar realtidsdata om slitage, "
                        "temperatur och vibrationer — möjliggör "
                        "prediktivt underhåll och optimerad skärprocess."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret i fallen visar att Sandvik kombinerar "
                        "tekniskt moat med cykelvolatilitet. Den som kan "
                        "hantera både dimensionerna kan fånga både moat-"
                        "premie och cykeluppgång.\n\n"
                        "Lärdom för svensk retail-investerare: Sandvik "
                        "är en \"all-weather\"-position i en svensk "
                        "industriportfölj. Tillsammans med Atlas Copco, "
                        "SKF och Alfa Laval bildar Sandvik en kluster av "
                        "moat-bärande industriaktier med olika "
                        "cykelkänslighet — ger både moat-skydd och "
                        "cykel-exponering."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Sandvik-analys kräver förståelse för global "
                "industriproduktion, gruvkapex-cykel och digital "
                "transformation i traditionell industri."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer global PMI, "
                        "ICSG-gruvdata, BHP/Rio Tinto kapex-guidance och "
                        "Sandviks konkurrenter (Atlas Copco/Epiroc, "
                        "Kennametal, ISCAR). Man korskopplar "
                        "Sandvik-segmentresultat mot sektorspecifika "
                        "indikatorer och identifierar moat-styrka via "
                        "serviceandel och design-in-pipeline.\n\n"
                        "Cykelanalysen ska vara modellbaserad. Bygg en "
                        "\"Sandvik-EBITDA-sensitivity\" med PMI, kapex "
                        "och valuta som variabler — detta ger "
                        "prognostiserbarhet ±15 procent. Vid stora "
                        "avvikelser mellan modell och rapporterat är "
                        "antingen moat-förändring eller engångseffekt — "
                        "olika åtgärder krävs.\n\n"
                        "Slutligen förstår mästaren att Sandviks digitala "
                        "transformation (CoroPlus, idag 5 000+ "
                        "uppkopplade maskiner) är en \"second moat\" som "
                        "byggs vid sidan av det fysiska moatet. När en "
                        "kund integrerar CoroPlus i sin produktion ökar "
                        "byte-kostnaden exponentiellt — från 1 år till "
                        "5+ år. Detta är den sanna långsiktiga edgen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att identifiera "
                        "\"second moat\"-byggande — Sandvik kombinerar "
                        "fysiskt moat (hårdmetall-patent) med digitalt "
                        "moat (CoroPlus-plattform), vilket förstärker "
                        "longevity."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Second moat: ett nytt moat byggt vid sidan av "
                        "existerande, ofta via digital transformation — "
                        "förstärker total moat-longevity genom multipla "
                        "bytesbarriärer."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att förstå Sandvik "
                        "som en \"two-moat compounder\" — fysiskt och "
                        "digitalt. Den som identifierar båda moaten kan "
                        "bättre bedöma långsiktig värdeutveckling.\n\n"
                        "För svensk retail-investerare kan Sandvik vara "
                        "en av 5-7 core-positioner i en långsiktig "
                        "portfölj. AKM1 1.1-systemet ger tidiga varningar "
                        "vid cykelposition-förändringar, men moatet gör "
                        "attSandvik tål att hållas genom hela cykeln med "
                        "god totalavkastning."
                    ),
                },
            ],
        },
    ],
}

# ===========================================================================
# pc-18 — Case: Öresund — investmentbolag
# ===========================================================================
COURSES["pc-18-case-oresund"] = {
    "why": (
        "Öresund är ett svenskt investmentbolag med fastighets- och "
        "finansinnehav som ges ut en djup rabatt mot substans — en "
        "klassisk Graham-situation. För svensk retail-investerare "
        "illustrerar Öresund rabatt-till-substans-strategin, och hur "
        "V18 substansrabatt och V17 utdelning kan kombineras. Det är "
        "också ett exempel på skillnaden mellan indirekt investering-"
        "bolag och direktinvestering i fastigheter."
    ),
    "history": {
        "origin": (
            "Öresund bildades 1990 av Sven-Olof Johansson genom en "
            "omstrukturering av BPA-koncernen och tidigare "
            "fastighetsinnehav. Bolagets affärsidé var att skapa ett "
            "investmentbolag med fokus på onoterade och halvnoterade "
            "fastighets- och finansinnehav, där rabatt mot substans skulle "
            "kunna kapitaliseras. Öresund noterades på Stockholmsbörsen "
            "1991 och blev snabbt ett av de mest diskuterade "
            "investmentbolagen under 1990-talets fastighetskris."
        ),
        "evolution": (
            "Under 1990-talet växte Öresund genom att akkumulera "
            "fastighetsinnehav via Fabege (då Modikont) och Hufvudstaden. "
            "Ett strategiskt skifte kom 2005 när Öresund förvärvade "
            "Viknor Fastigheter och 2009 när Catena-aktier blev största "
            "innehav. Under 2010-talet breddades portföljen till att "
            "inkluderaotyliga finansinnehav i börsbolag som Handelshögskolan "
            "i Stockholm, Bure Equity och SOS International."
        ),
        "modern": (
            "Idag är Öresund noterat på Nasdaq Stockholm med substansvärde "
            "cirka 32 mdr SEK (2024) och noteras konsekvent med rabatt 35-"
            "50 procent mot substans. Största innehaven är Fabege (35 "
            "procent av substans), Hufvudstaden (25 procent) och Bure "
            "Equity (15 procent). Öresund har under 2020-talet aktivt "
            "ÅTERKÖPT egna aktier för att minska rabatten, med 8 mdr SEK "
            "i återköp sedan 2018. Bolaget betalar stabil utdelning med "
            "5-7 procent direktavkastning."
        ),
    },
    "lynchSection": (
        "Lynch skulle betrakta Öresund som ett \"closed-end fund\"-case där "
        "djup substansrabatt kan ge möjlighet, men han skulle varna för att "
        "rabatten kan bestå i decennier utan \"catalyst\". Han skulle söka "
        "ett konkret event som kan stänga rabatten (t.ex. fusion, "
        "uppköp eller likvidation)."
    ),
    "grahamSection": (
        "Graham skulle uppskatta Öresund som en klassisk \"net current "
        "asset\"-situation där substansrabatt över 40 procent ger tydlig "
        "säkerhetsmarginal. Han skulle dock kräva kontinuerlig utdelning "
        "och aktiv återköppolitik som bevis på ledningens vilja att "
        "stänga rabatten."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar Öresund via V18 (substansrabatt), V17 "
        "(utdelningssäkerhet) och V09 (koncentration mot Fabege). "
        "1.1-integrationen spårar NAV-utveckling och rabatt-trend över 5 "
        "år för att identifiera catalyst-bara perioder."
    ),
    "chapters": [
        {
            "intro": (
                "Öresund är ett svenskt investmentbolag vars värde är "
                "låst i djup substansrabatt mot innehav i Fabege, "
                "Hufvudstaden och Bure Equity."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Öresunds portfölj består av tre huvudkategorier: "
                        "(1) Noterade fastighetsaktier — Fabege och "
                        "Hufvudstaden utgör 60 procent av substans; (2) "
                        "Onoterade fastigheter och bolag — 25 procent; "
                        "(3) Likvida medel — 15 procent. Affärsmodellen "
                        "är att förvalta portföljen aktivt, men inte "
                        "driva operativ verksamhet direkt.\n\n"
        "Konkurrenssituationen är med andra svenska investmentbolag — "
        "Investor AB, Industrivärden, Latour och Bure Equity. Öresund "
        "skiljer sig genom sin koncentration mot fastigheter (75 procent "
        "av substans) snarare än industrin. Rabatt mot substans är 35-50 "
        "procent, jämfört med Industrivärdens 10-15 procent och Investors "
        "premie om 5-10 procent.\n\n"
        "Moatet är minimalt i traditionell mening — investmentbolag har "
        "inte operativt moat. Istället är värdet skapat av (1) "
        "portföljförvaltning-skicklighet; (2) tillgång till "
        "onoterade investeringar (privata equity-aktier); (3) skatte-"
        "effektivitet (3:12-reglerna och possible Kubikskatt-fördelar)."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Öresunds värde är inte i drift utan i substansen — "
                        "rabatt 35-50 procent ger inbyggd säkerhetsmarginal "
                        "men kräver catalyst för att frigöras."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Substansrabatt: skillnaden mellan börskurs och "
                        "uppskattat substansvärde (NAV) uttryckt i procent "
                        "— för Öresund typiskt 35-50 procent."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare är Öresund en "
                        "klassisk Graham-situation — köp dollar för 50-60 "
                        "cent. Men fällan är att rabatten kan bestå i "
                        "decennier utan catalyst.\n\n"
                        "Catalyst-typer: (1) stor återköpprogram (Öresund "
                        "har gjort 8 mdr SEK i återköp sedan 2018); (2) "
                        "portföljomstrukturering; (3) uppköpsbud (sällan); "
                        "(4) ektrautdelning från innehav. Följ "
                        "kommunikationen från ledningen om strategiska "
                        "alternativ."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Öresund-analys kräver kvartalsvis uppdatering av "
                "NAV, rabatt-trend och aktiv återköppolitik."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Öresund publicerar månatlig NAV-uppdatering (5-7 "
                        "dagar efter månadsslut) med detaljerad "
                        "portföljvärdering. Analysten ska följa tre "
                        "KPI:er: (1) NAV per aktie, (2) substansrabatt, "
                        "(3) utdelningskapital. Vidare spåras innehav-"
                        "rörelser (nya investeringar, avyttringar) och "
                        "återköp.\n\n"
        "NAV-beräkning: Summera börsvärdet av noterade innehav "
        "(Fabege, Hufvudstaden, Bure Equity), addera uppskattat "
        "värde av onoterade (med 15-25 procent diskontering för illikviditet) "
        "och likvida medel, dra av räntebärande skulder. Resultatet är "
        "NAV per aktie. Dela med aktuellt kurs = rabattfaktor.\n\n"
        "Rabatt-trend är viktigast. Öresund har historiskt sett handlats "
        "med 30-50 procent rabatt. När rabatten närmar sig 50 procent "
        "är köpläge; när den smalnar mot 25 procent är säljläge. AKM1 "
        "1.1-systemet spårar denna trend automatiskt."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Nyckel-KPI:et är substansrabattens trend — "
                        "vidgas rabatten (mot 50 procent) är köpsignal, "
                        "smalnar den (mot 25 procent) är säljsignal."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "NAV (Net Asset Value): marknadsvärdet av "
                        "investmentbolagets alla tillgångar minus skulder — "
                        "normaliserat per aktie för jämförelse med börskurs."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Läs Öresunds månatliga "
                        "NAV-uppdatering; 2) Hämta börsvärdet av "
                        "Fabege/Hufvudstaden/Bure från Nasdaq; 3) Beräkna "
                        "rabatt mot NAV; 4) Spåra återköp per kvartal; 5) "
                        "Jämför rabatt med andra investmentbolag (Investor, "
                        "Industrivärden, Latour).\n\n"
                        "Exempel: november 2023 hade Öresund NAV 165 kr "
                        "och kurs 95 kr — rabatt 42 procent. En månad "
                        "senare hade Öresund meddelat 2 mdr SEK i extra-"
                        "återköp. Aktien steg 15 procent på en månad. Den "
                        "som följt rabatt-trend och ledningens återköps-"
                        "signal kunde positionera sig i förväg."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i Öresund-analys: beständig rabatt, "
                "portföljdepreciation och illikviditet i onoterade."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Beständig rabatt: Öresund har handlats "
                        "med rabatt 30-50 procent sedan 1990-talet. Många "
                        "investerare köper \"för att rabatten ska stängas\" "
                        "men den gör det inte. Under 35 år har rabatten "
                        "bestått — det finns ingen garanti för att den "
                        "stängs inom investerarens tidshorison.\n\n"
        "Fälla 2 — Portföljdepreciation: Öresunds substans är 75 procent "
        "fastighetsaktier (Fabege, Hufvudstaden). Om fastighetscykeln "
        "vänder nedåt faller substansen snabbt. 2022-2023 föll Fabege 30 "
        "procent och Hufvudstaden 20 procent — Öresunds NAV föll 25 "
        "procent, men kursen föll bara 15 procent eftersom rabatten "
        "smalnade. Detta är en fälla — investerare tror att aktien är "
        "\"stark\" när det egentligen är NAV-kollaps.\n\n"
        "Fälla 3 — Illikviditet i onoterade: 25 procent av Öresunds "
        "portfölj är onoterade bolag. Värdering av dessa uppdateras "
        "årligen och kan vara oförändrade under långa perioder. Om "
        "onoterade skrivs ner (som bidrag vid kris 2008 och 2020) "
        "faller NAV plötsligt. Investerare som inte förstår "
        "värderingsmetoden överraskas."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: se 40 procent rabatt och tro att "
                        "den \"måste\" stängas — Öresunds historia visar "
                        "att rabatten kan bestå i 35+ år utan catalyst."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Catalyst: händelse som utlöser värde-realisation "
                        "i investmentbolag — t.ex. återköp, utdelning, "
                        "uppköpsbud eller portföljlikvidation."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För beständig-rabatt-fällan, "
                        "kräv konkret catalyst innan inträde — återköp "
                        "över 5 procent av marknadsvärdet, särskild "
                        "utdelning eller portföljomstrukturering. För "
                        "portföljdepreciation-fällan, justera NAV för "
                        "fastighetscykelposition — använd Cap-rate-"
                        "justering nedåt i cykeltopp.\n\n"
                        "För illikviditets-fällan, läs not 4 i "
                        "årsredovisningen om onoterade värderingar. "
                        "Beräkna \"realiserbart NAV\" med 25 procent "
                        "extra diskontering för onoterade — detta ger "
                        "mer konservativ värdering. AKM1 1.1-systemet "
                        "gör detta automatiskt."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar Öresund via V18, V17 och V09 i "
                "1.1-integrationen med catalyst-tracker."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V18 (substansrabatt) är primär variabel för "
                        "Öresund. AKM1 spårar rabatt-trend över 60 månader — "
                        "vidgande rabatt mot 50 procent är köpsignal, "
                        "smalnande mot 25 procent är säljsignal. V17 "
                        "(utdelningssäkerhet) är stark — Öresund har "
                        "höjt utdelning 12 av 15 år med täckning över "
                        "1,5 (utdelning från innehav-utdelningar och "
                        "realiserade vinster).\n\n"
        "V09 (koncentration) mäter portfölj-koncentration — Öresunds "
        "tre största innehav (Fabege, Hufvudstaden, Bure) utgör 75 "
        "procent av substans. När koncentration överstiger 70 procent "
        "är portföljen sårbar för sektor-specifik risk. Vid 60-70 "
        "procent gult; under 60 procent grönt.\n\n"
        "AKM1 1.1-integrationen lägger till en \"catalyst-tracker\" "
        "som övervakar: (1) återköpsprogram >3 procent av "
        "marknadsvärde; (2) extrautdelningar; (3) portfölj-"
        "avyttringar >5 procent av NAV. När minst 1 catalyst "
        "identifieras inom 6 månader rekommenderar systemet köp-läge."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med Öresund är att undvika "
                        "\"dead money\" — köp endast när konkret catalyst "
                        "identifieras, sälj om rabatt smalnar utan "
                        "catalyst på gång."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Dead money: investering som inte ger avkastning "
                        "under lång tid — vanligt för investmentbolag utan "
                        "catalyst för rabatt-stängning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att "
                        "styra Öresund-positionen baserat på "
                        "catalyst-tillgänglighet. Vid rabatt >45 procent "
                        "OCH catalyst på gång (återköp/utdelning) rekommenderar "
                        "AKM1 full position. Vid rabatt 30-40 procent "
                        "utan catalyst rekommenderas 50 procent position.\n\n"
                        "För svensk retail-investerare bör Öresund vara "
                        "en \"särskild situation\"-position om max 3-5 "
                        "procent av portföljen. Investmentbolag med "
                        "beständig rabatt bör aldrig vara core-holding — "
                        "men kan ge asymmetrisk avkastning om catalyst "
                        "identifieras korrekt."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre Öresund-fallstudier visar rabatt-stängning i praktiken: "
                "1990-tals fastighetskrisen, återköpprogram 2018-2024 och "
                "SOS International-avyttring 2021."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Fastighetskrisen 1990-1995: Öresund "
                        "skapades 1990 i djupet av svensk fastighetskris. "
                        "Risken var enorm — många fastighetsbolag gick i "
                        "konkurs. Öresund köpte krisdrabbade aktier "
                        "(Fabege/Modikont) till 10-20 procent av "
                        "substansvärde. När fastighetsmarknaden återhämtade "
                        "sig 1995-2000 fördubblades substansen tre gånger "
                        "om. Lärdom: djup kris kan ge extrem "
                        "värde-realisation i investmentbolag.\n\n"
        "Fall 2 — Återköpprogram 2018-2024: Öresund inledde 2018 ett "
        "återköpprogram på 8 mdr SEK över 6 år. Syftet var att stänga "
        "rabatt genom att minska antal aktier. Resultat: rabatten "
        "minskade från 50 (2018) till 35 procent (2024). Aktien steg "
        "120 procent inkl. återköps-effekt under perioden. Lärdom: "
        "konsekvent återköp är den säkraste catalysten för "
        "investmentbolag.\n\n"
        "Fall 3 — SOS International-avyttring 2021: Öresund sålde "
        "onoterade SOS International (skadehantering) till私募 equity "
        "för 4,5 mdr SEK — 3x bokfört värde. Realiserad vinst 3 mdr SEK "
        "distribuerades som extrautdelning. Aktien steg 10 procent på "
        "en vecka. Lärdom: onoterade innehav kan ge plötslig värde-"
        "realisation vid avyttring."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: Öresunds bästa perioder kom "
                        "vid konkret catalyst — kris-köp (1990-talet), "
                        "återköp (2018-2024), avyttring (2021)."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Extrautdelning: engångsutdelning utöver ordinarie "
                        "utdelning, ofta från realiserad vinst — vanlig "
                        "catalyst i investmentbolag vid försäljning av "
                        "innehav."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret i fallen visar att Öresund investering "
                        "kräver catalyst-timing. Den som köper enbart för "
                        "rabatt utan catalyst riskerar dead money.\n\n"
        "Lärdom för svensk retail-investerare: Öresund ska hanteras "
        "som en \"särskild situation\"-position, inte en core-holding. "
        "Köp när (a) rabatt över 40 procent OCH (b) konkret catalyst "
        "identifierad inom 6 månader. Sälj när rabatt smalnar mot 25 "
        "procent eller catalyst uttömd."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Öresund-analys kräver förståelse för "
                "investmentbolag-mekanik, catalyst-identifiering och "
                "fastighetscykel-justering av NAV."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer inte bara "
                        "Öresunds kvartalsrapport utan börsvärdet av alla "
                        "innehav (Fabege, Hufvudstaden, Bure Equity), "
                        "Cap-rate-trender i Stockholm kontor och "
                        "upplysningspliktiga transaktioner (insider-"
                        "köp). Man beräknar NAV oberoende av "
                        "ledningens rapportering och spårar avvikelse.\n\n"
        "Catalyst-analysen ska vara strukturerad. Spåra 5 "
        "catalyst-typer: (1) återköp >3 procent av marknadsvärde; (2) "
        "extrautdelning från realiserad vinst; (3) portföljavyttring "
        ">5 procent av NAV; (4) uppköpsbud (sällsynt); (5) "
        "ledningsförändring med ny strategi. Minst 1 catalyst inom 6 "
        "månader = köpläge.\n\n"
        "Slutligen förstår mästaren att Öresund är en \"fastighets-"
        "proxy med hävstång\" — när Stockholm kontor-Cap-rate faller "
        "1 procentenhet stiger Fabege/Hufvudstaden 15-20 procent och "
        "Öresund-aktien 25-30 procent. Detta är dold hävstång som "
        "förstärker både upp- och nersida."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att kombinera "
                        "catalyst-timing med fastighetscykel-positionering "
                        "— köp Öresund i fastighetsbotten med catalyst, "
                        "sälj i fastighetstopp."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Cap-rate (Yield): direk avkastning på "
                        "fastighetsvärde — rörlig ränta i fastighets-"
                        "värderingar. Stockholm kontor Cap-rate 4,5-5,5 "
                        "procent är normalt."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att förstå Öresund "
                        "som en \"catalyst-aktie\" snarare än en "
                        "lättförståelig investering. Den som kan "
                        "identifiera catalyst kan fånga asymmetrisk "
                        "avkastning; den som köper enbart för rabatt får "
                        "dead money.\n\n"
        "För svensk retail-investerare bör Öresund vara en satellit-"
        "position om max 3-5 procent av portföljen. Aktuell återköps-"
        "trend och stabil utdelning gör att position kan vara kvar "
        "långsiktigt, men nytt kapital bör allokeras först vid konkret "
        "catalyst."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-18")

# ===========================================================================
# pc-19 — Case: Höganäs — järnpulver-monopol
# ===========================================================================
COURSES["pc-19-case-hoganas"] = {
    "why": (
        "Höganäs är global marknadsledare på järnpulver med över 50 procent "
        "av världsmarknaden — ett mikromonopol som de flesta investerare "
        "aldrig hört talas om. För svensk retail-investerare illustrerar "
        "Höganäs V03 nischmoat, och hur ett dolt B2B-bolag kan generera "
        "stabil ROIC över 20 procent. Det är också ett fall där bolaget "
        "blev taget privat 2010 (Midroc/Lindéngruppen) och planerades "
        "åternoteras 2024."
    ),
    "history": {
        "origin": (
            "Höganäs AB har rötter i Höganäs-Billesholms AB, grundat 1797 "
            "för kolbrytning i Skåne. Under 1900-talets första hälft "
            "utvecklades tekniken att framställa järnpulver för "
            "metallurgisk användning — särskilt genom Höganäsmetoden "
            "vilket gav extremt rent järn. Höganäs blev på 1940-talet "
            "världsledande på järnpulver för sintring, en position som "
            "hållit i över 80 år. Bolaget noterades på Stockholmsbörsen "
            "1994 när det knoppades från Höganäs AB-koncernen."
        ),
        "evolution": (
            "Under 1990-2000-talen expandera Höganäs globalt med "
            "produktion i Sverige (Höganäs och Halmstad), USA (St Marys, "
            "Pennsylvania), Kina (Quingdao), Japan (Kobe joint venture) "
            "och Indien (Pune). Konkurrenter kom och gick — QMP (Quebec "
            "Iron and Titanium), som var näst störst, förblev en bråkdel "
            "av Höganäs storlek. Moatet byggdes genom teknisk kompetens i "
            "pulverkarakterisering och global kundnärvaro. År 2010 "
            "förvärvades Höganäs av Lindéngruppen och Mohammed Al-Amoudis "
            "Midroc för 2,1 mdr SEK och avnoterades."
        ),
        "modern": (
            "Idag är Höganäs en onoterad koncern med omsättning cirka 12 "
            "mdr SEK (2023) och 2 400 anställda i 17 länder. Världs-"
            "marknadsandelen är över 50 procent för järnpulver för "
            "sintring, och bolaget är teknikledare för järnpulver för "
            "yibeläggning (thermal spray), svetselektroder och 3D-printing "
            "(additiv tillverkning). Planer för åternotering på Nasdaq "
            "Stockholm har diskuterats sedan 2022 med mål 2024-2025, "
            "vilket skulle ge svensk retail-investerare ny exponering mot "
            "ett unikt moat-bolag."
        ),
    },
    "lynchSection": (
        "Lynch skulle uppskatta Höganäs som ett \"vans trailers\"-case "
        "par excellence — en dold marknadsledare i en nisch med "
        "strukturbarriärer. Han skulle dock varna för att onoterade "
        "bolag saknar marknadsdisiplin och kan drivas suboptimalt utan "
        "börspress — detta var anledningen till att Lindéngruppen/Midroc "
        "kunde förvärva billigt 2010."
    ),
    "grahamSection": (
        "Graham skulle betrakta Höganäs som en \"privat undervärderad "
        "tillgång\" — substansvärde och intjäningskraft var kraftigt "
        "underprissatt vid budet 2010 (P/E 7 i botten av finanskrisen). "
        "Hans defensiva investerare skulle vid åternotering kräva P/E "
        "under 15 och P/B under 2 innan inträde."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar Höganäs som \"dolt moat-bolag\" via V05 "
        "(ROIC-stabilitet >20 procent), V03 (nischmoat) och V18 "
        "(substansrabatt). 1.1-integrationen förbereder automatisk "
        "övervakning vid åternotering för svensk retail-investerare."
    ),
    "chapters": [
        {
            "intro": (
                "Höganäs är en dold svensk järnpulverjätte med global "
                "marknadsandel över 50 procent — ett nischmoat få "
                "investerare känner till."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Höganäs producerar järnpulver för tre "
                        "huvudapplikationer: (1) Pulvermetallurgi (PM) — "
                        "sintrade ståldetaljer för fordons- och "
                        "maskinindustri, 70 procent av intäkter; (2) "
                        "Yibeläggning — termisk sprutning för "
                        "ytbeläggning av industridetaljer, 15 procent; "
                        "(3) Elektrodpulver för svetsning, 10 procent; "
                        "(4) Additiv tillverkning (3D-printing av metall) "
                        "— växande nisch med 5 procent.\n\n"
                        "Moatet är strukturellt och tekniskt. Höganäs "
                        "har över 80 år av processkunskap i "
                        "järnpulvertillverkning, och konkurrenter har "
                        "svårt att replikera renhet, partikelstorlek "
                        "och materialegenskaper. Dessutom har Höganäs "
                        "globalt lager och distribution som tar "
                        "decennier att bygga. De två närmaste "
                        "konkurrenterna (QMP och Rio Tinto Metal "
                        "Powders) har tillsammans under 25 procent av "
                        "marknaden.\n\n"
                        "Cykliciteten är måttlig och liknar andra "
                        "industriföretag — volym följer global "
                        "fordonsproduktion och industriproduktion. Men "
                        "moatet ger stabil marginal runt 15 procent "
                        "EBIT, även i kriser. Under finanskrisen 2009 "
                        "föll volymen 30 procent men EBIT-marginalen "
                        "höll över 8 procent tack vare prissättningsmakt."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Höganäs moat är inte produkten i sig utan 80+ års "
                        "processkunskap och global distribution — en ny "
                        "konkurrent behöver både teknik och global "
                        "kundbas, vilket tar decennier att bygga."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Pulvermetallurgi (PM): tillverkningsmetod där "
                        "metallpulver pressas och sintras till färdiga "
                        "detaljer — ger hög precision och minimalt "
                        "materialspill jämfört med bearbetning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare var Höganäs "
                        "borttaget från börsen 2010-2024. Med planerad "
                        "åternotering 2024-2025 blir det en möjlighet "
                        "att investera i ett unikt moat-bolag som saknas "
                        "på Stockholmsbörsen.\n\n"
                        "EV-transitionen är en strukturell möjlighet. "
                        "Elektriska fordon kräver färre PM-komponenter i "
                        "motorn men fler i chassit och batterihållet. "
                        "Höganäs har aktivt diversifierat mot "
                        "elektromagnetiska applikationer (soft magnetic "
                        "composites) för EV-motorer — detta växer 30+ "
                        "procent per år."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Höganäs-analys (vid åternotering) kräver "
                "spårning av global fordonsproduktion, EV-penetration och "
                "additiv tillverkningstillväxt."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Höganäs kommer vid åternotering publicera "
                        "kvartalsrapport med segmentdata: PM ( Automotive, "
                        "Industrial, Consumer), Surface Coating, "
                        "Electrodes, Additive Manufacturing. Analysten "
                        "ska följa: (1) organisk volymtillväxt vs global "
                        "fordonsproduktion; (2) EBIT-marginal per segment "
                        "(målet >12 procent koncern); (3) andel "
                        "EV-exponering (målet >10 procent 2025).\n\n"
        "Viktigt är att separera cyklisk volym (PM-Automotive) från "
        "strukturell tillväxt (Additive Manufacturing, EV-motor). "
        "EV-motor-segmentet växer 30+ procent per år från låg bas — om "
        "Höganäs kan ta 30 procent av denna marknad blir det en ny "
        "intäktsström på 1-2 mdr SEK inom 5 år.\n\n"
        "Additive Manufacturing (3D-printing av metall) är ny nisch. "
        "Höganäs har investerat i Digital Metal (förvärvat 2017) och "
        "bygger teknikposition. År 2024 var intäkterna 200 MSEK med "
        "40 procent tillväxt — men låg marginal. Detta är option-värde, "
        "inte basintäkt."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Viktigaste KPI vid åternotering är EV-andel av "
                        "intäkter — om >10 procent och tillväxt >30 "
                        "procent är detta ett strukturellt positivt "
                        "tecken som rättfärdigar premium-värdering."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Soft Magnetic Composite (SMC): Höganäs "
                        "specialkomposit för elektromagnetiska "
                        "applikationer i EV-motorer — möjliggör högre "
                        "verkningsgrad än traditionella stål-laminat."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde vid åternotering: 1) Läs "
                        "prospekt med historisk intäkt/EBIT 2018-2023; "
                        "2) Identifiera segmentmix och EV-andel; 3) "
                        "Jämför värdering (P/E, EV/EBITDA) med närmaste "
                        "peers (Atlas Copco, Sandvik, Höganäs konkurrenter "
                        "som GKN Sinter Metals); 4) Spåra förvaltnings-"
                        "berättelse om teknikutveckling; 5) Beräkna "
                        "\"moat score\" baserat på ROIC-stabilitet och "
                        "marknadsandel.\n\n"
                        "Vid åternotering beräknas värderingen bli P/E "
                        "15-20 och EV/EBITDA 8-10 — rimlig för ett moat-"
                        "bolag med 50+ procents marknadsandel och stabil "
                        "ROIC över 20 procent. Den som köper tidigt och "
                        "håller 5+ år kan fånga både moat-premie och "
                        "EV-strukturell tillväxt."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i Höganäs-analys: onoteringsperiodens "
                "suboptimala kapitalallokering, EV-transitionens volym-"
                "effekt och konkurrens från Kina."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Onoteringsperiodens suboptimalitet: "
                        "Under 14 år som onoterat bolag har Höganäs "
                        "saknat börsdisciplin. Vissa investeringar kan "
                        "ha varit suboptimala och utdelningar kan ha "
                        "prioriterats kort-siktigt. Vid åternotering "
                        "måste analytikern noggrant granska 2010-2024 "
                        "kapitalallokering och identifiera eventuella "
                        "underliggande problem.\n\n"
        "Fälla 2 — EV-transitionens volymeffekt: Elektriska fordon "
        "har färre rörliga delar — typiskt ICE-motor har 200+ PM-"
        "komponenter, EV-motor har 50-80. Även om Höganäs tar EV-motor-"
        "marknaden via SMC, kan totala PM-volymen för fordonsindustrin "
        "falla 30-40 procent över 10 år. Detta är en strukturell risk "
        "som måste prissättas.\n\n"
        "Fälla 3 — Kinesisk konkurrens: Kinesiska Laiwu Iron and Steel "
        "och Nanjing Hanrui har expanderat i järnpulver, med 15-20 "
        "procent lägre priser. Höganäs premiumsegment är fortfarande "
        "skyddat, men volymsegmentet är pressat. Kinesiska konkurrenter "
        "har 10-15 procent av global marknad och växer."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: extrapolera 2010-talets "
                        "EBIT-marginal utan att justera för EV-transition "
                        "— totala PM-volymen kan falla 30+ procent över "
                        "10 år trots Höganäs tekniska ledning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Börsdisciplin: disciplinerande effekt av börs-"
                        "notering på bolagsledning — kräver transparens, "
                        "kvartalsrapportering och marknadsreaktion på "
                        "kapitalallokeringsbeslut."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För onoterings-fällan, "
                        "granska noggrant de första 3 kvartalsrapporterna "
                        "efter åternotering — sök tecken på suboptimal "
                        "kapitalallokering (överkapacitet, onödiga "
                        "förvärv). För EV-fällan, separataanalys av PM-"
                        "Automotive vs EV-SMC i värderingen — antag "
                        "30-procentig volymnedgång i PM-Automotive mot "
                        "2025-2035.\n\n"
                        "För Kina-fällan, följ kinesisk marknadsandels-"
                        "utveckling kvartalsvis — om kinesiska konkurrenter "
                        "överstiger 25 procent global marknad varnar "
                        "AKM1 1.1-systemet. Höganäs moat-hållbarhet "
                        "beror på förmågan att behålla premiumsegmentet."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar Höganäs som \"dolt moat-bolag\" "
                "via V05, V03 och V18 i 1.1-integrationen med "
                "åternoteringsberedskap."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V05 (ROIC-stabilitet) är Höganäs styrka — "
                        "10-års snitt ROIC under onoterad period har "
                        "varit 20-25 procent, över moat-tröskeln 15 "
                        "procent. V03 (nischmoat) bekräftas av över 50 "
                        "procents världsmarknadsandel. V18 (substansrabatt) "
                        "är relevant vid åternotering — bolaget kan noteras "
                        "till rabatt mot beräknad substans om marknaden "
                        "osäker på onoteringsperiodens kvalitet.\n\n"
        "AKM1 1.1-integrationen förbereder automatisk övervakning vid "
        "åternotering. Systemet spårar: (1) ROIC-utveckling mot onoterad "
        "periods snitt; (2) EV-andel av intäkter (målet >10 procent "
        "2025); (3) Additive Manufacturing-tillväxt (>30 procent); "
        "(4) kinesisk konkurrensnivå (<25 procent global marknad).\n\n"
        "Systemet ger en \"moat score\" 0-100 vid notering. Om score "
        "överstiger 80 och värdering är P/E <18 rekommenderar systemet "
        "full position. Om score 60-80 eller P/E 18-22 rekommenderas 50 "
        "procent position."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med Höganäs är att identifiera "
                        "när moatet hotas — om kinesisk konkurrens "
                        "överstiger 25 procent eller EV-volym faller mer "
                        "än väntat, faller moat-score och positionen "
                        "reduceras."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Nischmoat: moat baserad på teknisk kompetens i "
                        "en smal nischmarknad — Höganäs järnpulver är "
                        "klassiskt exempel med hög kunskapsbarriär och "
                        "liten marknad som ej lockar stora konkurrenter."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att "
                        "styra första-års position vid åternotering. "
                        "Systemet ger direkt signal om moat-score och "
                        "värderingsnivå.\n\n"
                        "För svensk retail-investerare blir Höganäs vid "
                        "åternotering en möjlig core-position om 3-5 "
                        "procent av portföljen — men endast om moat-score "
                        "överstiger 75 och värdering är under P/E 18. "
                        "Annars bör man avvakta 4-6 kvartal efter "
                        "notering för att se stabiliserad resultat-"
                        "utveckling."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre Höganäs-fallstudier illustrerar nischmoat: "
                "Höganäs-metoden 1940-talet, onoteringsperioden 2010-2024 "
                "och EV-motor-SMC-satsningen."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Höganäs-metoden 1940-talet: Höganäs "
                        "utvecklade en unik process för att reducera "
                        "järnmalm till rent järnpulver genom "
                        "vätreduktion. Detta gav en produkt med över 99 "
                        "procent renhet — konkurrenter kunde inte "
                        "replikera. Höganäs blev snabbt världsledande "
                        "och har hållit positionen sedan dess. Lärdom: "
                        "tidig teknisk ledning ger långsiktigt moat.\n\n"
                        "Fall 2 — Onoteringsperioden 2010-2024: Höganäs "
                        "blev uppköpt av Lindéngruppen och Midroc 2010 "
                        "för 2,1 mdr SEK — P/E 7 i botten av finanskrisen. "
                        "Under 14 år har bolaget vuxit till 12 mdr SEK "
                        "omsättning. Utdelning och utdelningspolicy har "
                        "varit oklara (ingen börsdisciplin). Planerad "
                        "åternotering 2024-2025 kan värdera bolaget till "
                        "8-12 mdr SEK, 4-6x budet 2010. Lärdom: "
                        "undervärderade moat-bolag kan multi-"
                        "värderealisation off-börs.\n\n"
                        "Fall 3 — EV-motor-SMC-satsningen: Höganäs "
                        "utvecklade Soft Magnetic Composites för "
                        "EV-motorer 2015-2020, med första kommersiella "
                        "leveranser 2022. Intäkterna växer 30+ procent "
                        "per år, från 50 MSEK 2020 till 250 MSEK 2024. "
                        "Volvo Cars och BMW har testat tekniken. Lärdom: "
                        "teknisk innovation inom existerande moat kan "
                        "öppna nya marknader."
                    ),
                },
                    {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: Höganäs moat är robust men "
                        "kräver kontinuerlig innovation — Höganäs-metoden "
                        "(1940), SMC (2015) och kommande "
                        "additiv-tillverkning är kedja av tekniska "
                        "steg som förlängt moatet."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Vätreduktion: process att reducera järnmalm till "
                        "järnpulver genom att reagera med väte vid hög "
                        "temperatur — ger mycket rent järn."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret i fallen visar att nischmoat kan "
                        "överleva decennier om teknikutveckling upprätthålls. "
                        "Höganäs är ett svenskt exempel på moat-styrka "
                        "som ofta missas av investerare.\n\n"
                        "Lärdom för svensk retail-investerare: Höganäs "
                        "vid åternotering blir en unik möjlighet att "
                        "investera i ett moat-bolag med 80+ års history. "
                        "AKM1 1.1-systemet ger automatisk bedömning av "
                        "moat-score och inträdesnivå vid noteringstillfället."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Höganäs-analys kräver förståelse för "
                "nischmoat-dynamik, EV-transitionens påverkan på PM-volym "
                "och additiv tillverkning som framtidstillväxt."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer vid åternotering "
                        "inte bara Höganäs kvartalsrapport utan global "
                        "fordonsproduktion (OICA), EV-penetration (Bloomberg "
                        "NEF) och additiv tillverkning (Wohlers Report). "
                        "Man korskopplar Höganäs volymtillväxt mot PM-"
                        "Automotive-cykel och identifierar EV-andel som "
                        "struktur-drivrutin.\n\n"
                        "Moat-analysen ska vara kvantitativ. Spåra 4 "
                        "indikatorer: (1) världsmarknadsandel (målet >50 "
                        "procent); (2) EBIT-marginal-premie över branschen "
                        "(målet >5 procentenheter över konkurrenter); "
                        "(3) kundretention (målet >90 procent årligen); "
                        "(4) R&D-andel av intäkter (målet >3 procent). "
                        "Alla fyra indikatorer över tröskel = moat "
                        "bekräftat.\n\n"
                        "Slutligen förstår mästaren att Höganäs är en "
                        "\"komponent-tillverkningsmoat\" — kunder "
                        "(Volvo, Bosch, Continental) specificerar "
                        "Höganäs pulver i sina produktionsprocesser och "
                        "byter inte utan omtest. Detta är samma "
                        "design-in-moat som SKF och Sandvik använder, "
                        "men i en mindre känd nisch."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att kombinera "
                        "nischmoat-analys med EV-transition-förståelse — "
                        "Höganäs kan förlora PM-volym men vinna EV-motor-"
                        "marknad, nettopositivt om SMC tar 30 procent "
                        "marknadsandel."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Komponent-tillverkningsmoat: moat där en "
                        "komponenttillverkare blir specificerad i "
                        "kundens produktionsprocess, vilket skapar hög "
                        "bytesbarriär — liknande design-in-moat."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att förstå Höganäs "
                        "som en \"dold moat-perl\" som kan bli tillgänglig "
                        "för svensk retail-investerare 2024-2025. Den "
                        "som kan värdera moat-styrka och EV-transition-"
                        "risk kan identifiera rätt inträdesnivå.\n\n"
                        "För svensk retail-investerare bör Höganäs vara "
                        "en \"watchlist-aktie\" fram till åternotering. "
                        "När den sker, AKM1 1.1-systemet ger automatisk "
                        "moat-score och inträdesrekommendation. Under "
                        "tiden kan man studera nischmoat-dynamik via "
                        "liknande bolag (Atlas Copco, Sandvik) för att "
                        "byggaförståelse."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-19")

# ===========================================================================
# pc-20 — Case: Essity — hygienvaror
# ===========================================================================
COURSES["pc-20-case-essity"] = {
    "why": (
        "Essity är en svensk hygienjätte som spunnits ut från SCA 2017 och "
        "ger exponering mot en defensiv konsumentsektor med stabil "
        "efterfrågan. För svensk retail-investerare illustrerar Essity "
        "defensiv portfölj-placering med relativt stabil EBIT-marginal på "
        "10-12 procent och utdelningstillväxt. Det är också ett exempel på "
        "hur råvarukostnader (massa) och valutarörelser driver "
        "resultatvolatilitet i en annars stabil sektor."
    ),
    "history": {
        "origin": (
            "Essity bildades 5 juni 2017 genom att Svenska Cellulosa Aktiebolaget "
            "(SCA) delades i två oberoende börsnoterade bolag: Essity för "
            "hygien- och hälsoprodukter och SCA för skogstillgångar. SCA självt "
            "grundades 1929 av Ivar Kreuger som Svenska Cellulosa Aktiebolaget "
            "och hade vuxit till en av Europas största skogsbolag med hygien-"
            "verksamhet sedan 1975 (förvärv av Mölnlycke). Under SCA-perioden "
            "förvärvades PWA (Peaudouce, Frankrike) 1975 och Wisconsin Tissue "
            "(USA) 1996."
        ),
        "evolution": (
            "Efter 2017-utknoppningen fokuserade Essity på tre affärsområden: "
            "Personal Care (blöjor, inkontinens, menstruation), Consumer "
            "Tissue (toa- och hushållspapper) och Professional Hygiene (AFH — "
            "Away From Home). Stora förvärv inkluderade BSN Medical (wound "
            "care, compression) 2017 för 1,9 mdr EUR och Jonas (knix-"
            "produkter) 2023 för 1,2 mdr USD. Under 2010-talet konkurrerade "
            "Essity med Procter & Gamble, Kimberly-Clark och Unicharm om "
            "global marknadsandel."
        ),
        "modern": (
            "Idag är Essity noterat på Nasdaq Stockholm med omsättning cirka "
            "156 mdr SEK (2023) och 36 000 anställda i 100+ länder. Koncernen "
            "har 5-10 procents marknadsandel i de flesta segment, med ledande "
            "position i Europa och tillväxtmarknader. Värumärken inkluderar "
            "TENA (inkontinens), Tork (AFH), Lotus (toapapper), Edet, Knix "
            "och Modibodi. Under 2022-2023 drev massa-prishöjningar och "
            "energikostnader marginaltryck, men Essity kunde höja priser "
            "med 7 procent 2023 för att kompensera — bevis på prissättningsmakt."
        ),
    },
    "lynchSection": (
        "Lynch skulle uppskatta Essity som ett defensivt \"bond-like\"-case "
        "med stabil efterfrågan oberoende av konjunktur. Han skulle dock "
        "varna för att hygienbranschen är moat-svag — produkterna är "
        "differentierade men inte patent-skyddade, och privatlabel konkurrens "
        "ökar."
    ),
    "grahamSection": (
        "Graham skulle betrakta Essity som en defensiv aktie med stabil "
        "utdelning och substansvärde skyddat av varumärkesportfölj. Han "
        "skulle kräva P/E under 18 och utdelningstäckning över 1,8 innan "
        "inträde, samt övervaka balansräkning efter stora förvärv."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar Essity via V14 (marginalpress vid "
        "råvarukostnadschocker), V17 (utdelningssäkerhet) och V09 "
        "(kundkoncentration mot stora dagligvarukedjor). 1.1-integrationen "
        "spårar massa-priser och prishöjningsförmåga som cykelindikatorer."
    ),
    "chapters": [
        {
            "intro": (
                "Essity är en svensk hygienvarujätte vars resultat drivs "
                "av prissättningsmakt, råvarukostnader (massa) och valutor."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Essitys tre affärsområden är: (1) Personal Care "
                        "(55 procent av intäkter) — blöjor (Libero), "
                        "inkontinens (TENA), menstruation (Bodyform, Libresse, "
                        "Knix); (2) Consumer Tissue (30 procent) — toa- och "
                        "hushållspapper (Edet, Lotus, Velvet); (3) Professional "
                        "Hygiene (15 procent) — AFH Tork. Världsomspännande "
                        "konkurrens med P&G, Kimberly-Clark och Unicharm.\n\n"
        "Moatet är varumärkesbaserat men moat-styrkan varierar mellan "
        "produkter. TENA (inkontinens) är moat-starkt — marknadsledare "
        "i Europa och Asien, kundlojalitet hög pga medicinsk kontext. "
        "Tork (AFH) är också moat-starkt — B2B-avtal med långa "
        "kontrakt. Libero (blöjor) är moat-svagare — P&G Pampers och "
        "Kimberly-Clark Huggies är starka konkurrenter och privatlabel "
        "tar marknadsandel. Consumer Tissue är moat-svagast — "
        "commoditiserad produkt med marginell differentiering.\n\n"
        "Cykliciteten är låg — efterfrågan på hygienvaror är "
        "konjunkturoberoende. Men marginal svänger med råvarukostnader: "
        "massa utgör 30-35 procent av COGS och priset kan svänga 30+ "
        "procent över en cykel. Energikostnader är 10 procent av COGS. "
        "Dessa två faktorer driver EBIT-marginalvolatilitet 2-3 procentenheter."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Essitys moat är olika starkt i olika segment — "
                        "TENA och Tork är moat-starka, men Consumer Tissue "
                        "och Libero blöjor är moat-svaga. Segmentsanalys "
                        "är avgörande."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "AFH (Away From Home): marknad för hygienprodukter "
                        "till kommersiella kunder (restauranger, kontor, "
                        "sjukhus) — B2B-segmentet för Essity via Tork."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare är Essity en typisk "
                        "defensiv portföljposition — stabil utdelning, "
                        "låg konjunkturkänslighet och exponering mot "
                        "global konsumenttillväxt. Aktien har varit "
                        "relativt stabil sedan utknoppningen 2017, men "
                        "massaprischocker 2022-2023 gav kursvolatilitet.\n\n"
                        "Tillväxtstrategin är dubbel: organisk tillväxt i "
                        "tillväxtmarknader (Latinamerika, Asien) och "
                        "förvärv i premiumsegment (Knix 2023, Modibodi "
                        "2022). Denna strategi fungerar men kräver "
                        "kapitaldisciplin — Essity har tagit högre skulder "
                        "för förvärv vilket pressat balansräkningen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk Essity-analys kräver spårning av massa-priser, "
                "prishöjningsförmåga och organisk tillväxt per segment."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Essity publicerar kvartalsvis organisk tillväxt och "
                        "EBIT-marginal per segment. Analysten ska följa: "
                        "(1) organisk tillväxt (målet >3 procent); (2) "
                        "pris/realisations-effekt (målet >2 procent); "
                        "(3) EBIT-marginal (målet >11 procent koncern). "
                        "Vidare spåras massa-priser via RISI (fastmarkets) "
                        "och valutor (EUR/SEK, USD/SEK) eftersom Essity "
                        "rapporterar i SEK men har globala intäkter.\n\n"
        "Viktigt är att separera pris- och volym-effekter. Under 2023 "
        "hade Essity +7 procent pris men -2 procent volym — nettopositivt "
        "för marginalen men negativt för marknadsandel. Om volymen "
        "fortsätter falla 4+ kvartal är detta moat-erosion. Essity har "
        "hittills behållit volym relativt väl genom premium-fokus.\n\n"
        "Knix-förvärvet 2023 ska följas noggrant. Knix är direkt-till-"
        "konsument-märke för menstruationsunderkläder med hög "
        "tillväxt. Integration och synergimål ska verifieras kvartalsvis."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Viktigaste KPI:et är volymtillväxt separat från "
                        "pris-effekter — om volym faller 4+ kvartal är "
                        "moat-erosion trolig, oavsett vad EBIT-marginalen visar."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Pris/volym-dekomponering: separation av organisk "
                        "tillväxt i pris- och volymkomponenter — avgörande "
                        "för att identifiera moat-styrka i defensiva bolag."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Hämta RISI (fastmarkets) "
                        "NBSK massa-pris index veckovis; 2) Läs Essitys "
                        "kvartalsrapport med fokus på pris/volym-dekomponering; "
                        "3) Beräkna \"real EBIT-marginal\" justerad för "
                        "massa-prisrörelse; 4) Spåra Knix-integration; "
                        "5) Jämför Essity EBIT-marginal mot P&G Beauty & "
                        "Grooming och Kimberly-Clark.\n\n"
                        "Exempel: Q3 2022 hade Essity +12 procent "
                        "pris-effekt men -5 procent volym — prisökningarna "
                        "kompenserade mer än väl för massa-prishöjning på 40 "
                        "procent. Aktien steg 20 procent på kvartalsrapport. "
                        "Den som förstod pris/volym-dekomponering kunde "
                        "identifiera att Essitys prissättningsmakt höll — "
                        "moatet var intakt trots råvaruchock."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i Essity-analys: råvaruchock-fördunkling, "
                "Knix-integrationsrisk och valuta-förbisettande."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Råvaruchock-fördunkling: När massa-priser "
                        "stiger 40 procent (som 2022) faller Essitys EBIT-"
                        "marginal tillfälligt. Många investerare ser detta "
                        "som moat-erosion och säljer — men om Essity kan "
                        "höja priser 7 procent inom 12 månader är moatet "
                        "intakt. Detta var fallet 2023 — volatilitet, inte "
                        "strukturell nedgång.\n\n"
                        "Fälla 2 — Knix-integrationsrisk: Knix-förvärvet "
                        "2023 för 1,2 mdr USD var Essitys största sedan "
                        "BSN Medical 2017. Knix är direkt-till-konsument-"
                        "märke med annan affärskultur än Essitys traditionella "
                        "B2B. Integration kräver 24+ månader och synergimål "
                        "(100 MSEK per år 2025) kan missas. Om integrationen "
                        "misslyckas blir goodwill-nedskrivning 1-2 mdr SEK.\n\n"
                        "Fälla 3 — Valuta-förbisettande: Essity rapporterar i "
                        "SEK men 85 procent av intäkterna är i EUR, USD och "
                        "andra valutor. När EUR/SEK faller 10 procent "
                        "(svag euro) faller Essitys rapporterade intäkter "
                        "mekaniskt. Många investerare felbedömer detta som "
                        "operationellt problem när det är valuta-effekt."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: se EBIT-marginalfall vid "
                        "råvaruchock som moat-erosion — om Essity kan "
                        "höja priser inom 12 månader är moatet intakt."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Råvarukänslighet: hur mycket av bolagets COGS "
                        "som består av råvaror vars priser kan svänga — "
                        "för Essity är massa 30-35 procent av COGS."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För råvaru-fällan, justera "
                        "EBIT-marginal för massa-prisrörelse — om "
                        "\"normaliserad\" marginal hålls över 10 procent "
                        "är moatet intakt. För Knix-fällan, följ "
                        "integration kvartalsvis — om synergimål missas "
                        "med 6+ månader flagga risk. För valuta-fällan, "
                        "läs alltid kvartalsrapportens valutaeffekt-not — "
                        " Essity publicerar organisk tillväxt justerad för "
                        "valuta.\n\n"
                        "AKM1 1.1-systemet gör alla tre justeringarna "
                        "automatiskt och ger \"adjusted moat score\" som "
                        "tar hänsyn till råvaru- och valutaeffekter. Detta "
                        "hjälper investerare undvika överreaktion på "
                        "tillfälliga chocker."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar Essity via V14, V17 och V09 i "
                "1.1-integrationen med råvaru- och valutajustering."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V14 (marginalpress) är den primära varnings-"
                        "indikatorn. AKM1 spårar \"normaliserad\" EBIT-"
                        "marginal justerad för massa-prisavvikelse från "
                        "10-årssnitt. När justerad marginal faller under "
                        "9 procent flaggas V14 rött — hände 2018 (massa-"
                        "topp) och 2022 (energikris). V17 "
                        "(utdelningssäkerhet) är stabil — Essity har höjt "
                        "utdelning varje år sedan utknoppningen 2017, "
                        "täckning över 1,8.\n\n"
        "V09 (kundkoncentration) är måttlig — Essitys topp-10 kunder "
        "(Walmart, Tesco, Edeka, Carrefour m.fl.) utgör cirka 30 procent "
        "av intäkter, vilket är normalt för FMCG. V01 (organisk "
        "tillväxt) analyseras separat för pris- och volym-komponenter — "
        "om volymtillväxt faller under -2 procent flaggas V01 rött.\n\n"
        "AKM1 1.1-integrationen kombinerar V14/V17/V09/V01 med en "
        "råvaru-känslighetsmodell. Systemet ger en \"defensive moat "
        "score\" 0-100 — Essity har hållit över 70 sedan 2018, men "
        "föll till 65 under 2022 på grund av massa-chock. När score "
        "återhämtar över 70 är köpläge."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka med Essity är att separera cyklisk "
                        "marginalvolatilitet från strukturell moat-styrka "
                        "via råvaru-justerad EBIT-marginal."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Defensive moat score: AKM1-beräkning 0-100 för "
                        "defensiva bolag baserad på volymtillväxt, "
                        "pris-realizations-förmåga och moat-styrka — "
                        "värden över 70 indikerar starkt defensivt moat."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att "
                        "undvika överreaktion på råvaruchocker. 2022 "
                        "när Essity föll 25 procent på grund av massa-"
                        "prischock flaggade AKM1 \"hold\" istället för "
                        "\"sälj\" — adjusted moat score höll över 65. Den "
                        "som följde detta undvek kursförlust när "
                        "Essity återhämtade 30 procent under 2023.\n\n"
                        "För svensk retail-investerare kan Essity vara en "
                        "core-position om 3-5 procent av portföljen — "
                        "defensiv, stabil utdelning och moat-styrka i "
                        "TENA/Tork-segmenten. AKM1-systemet hjälper till "
                        "att separera råvaruchock från moat-försämring."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre Essity-fallstudier illustrerar defensiv moat: "
                "utknoppningen från SCA 2017, massachocken 2022 och "
                "Knix-förvärvet 2023."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Utknoppningen från SCA juni 2017: SCA "
                        "delades i Essity (hygien) och Nya SCA (skog). "
                        "Syftet var att låta varje bolag fokusera på sin "
                        "kärna — Essity blev en renodlad hygienaktie. "
                        "Initialt föll Essity 15 procent (delningrabatt) "
                        "men återhämtade sig inom 12 månader. Lärdom: "
                        "utknoppningar kan ge tillfällig rabatt som köpläge.\n\n"
        "Fall 2 — Massachocken 2022: RISI NBSK massa-pris steg från 600 "
        "till 1 000 USD/ton under 2021-2022, en 67 procent ökning. "
        "Essitys EBIT-marginal föll från 11 till 8 procent. Aktiekurs "
        "föll 25 procent på 6 månader. Men Essity kunde höja konsument-"
        "priser 7 procent 2022-2023 och återställa marginalen till 11 "
        "procent 2024. Aktien återhämtade 30 procent. Lärdom: råvaru-"
        "chock testar moat-styrka — Essitys prissättningsmakt bevisades.\n\n"
        "Fall 3 — Knix-förvärvet augusti 2023: Essity betalade 1,2 mdr "
        "USD (12 mdr SEK) för kanadensiska Knix, en direkt-till-konsument-"
        "aktör för menstruationsunderkläder. Synergieffekt 100 MSEK per "
        "år 2025. Initialt möttes budet av skepsis — hög multiplar, "
        "olik affärskultur. Integration pågår 2024, första tecken "
        "positiva. Lärdom: stora förvärv i nya nischer kan förstärka "
        "moatet men kräver tålamod."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: Essitys moat bevisas genom "
                        "prissättningsmakt under råvaruchocker och "
                        "förmåga att integrera nya varumärken i premium-"
                        "segmentet."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Prissättningsmakt: förmågan att höja priser utan "
                        "att förlora volym — central moat-indikator för "
                        "konsumtionsvarubolag som Essity."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret i fallen visar att Essity kombinerar "
                        "defensiv moat med cyklisk råvaru-känslighet. "
                        "Den som kan separera dessa dimensionerna kan "
                        "identifiera köplägen vid råvaruchock och säljlägen "
                        "vid övervärdering efter expansion.\n\n"
                        "Lärdom för svensk retail-investerare: Essity är "
                        "en lämplig core-position i en diversifierad "
                        "portfölj. Defensiv karaktär med stabil utdelning "
                        "och moat-styrka i TENA/Tork. AKM1 1.1-systemet "
                        "ger tidiga varningar vid integration-problem i "
                        "Knix eller vid varaktig volymnedgång."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Essity-analys kräver förståelse för FMCG-"
                "ekonomi, råvarukänslighet och defensiv moat-styrka."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer inte bara Essitys "
                        "kvartalsrapport utan RISI massa-priser, IRI "
                        "scan-data för dagligvaruhandel och konkurrenternas "
                        "rapporter (P&G, Kimberly-Clark). Man korskopplar "
                        "Essitys pris-realizations mot konkurrenternas för "
                        "att identifiera pris-lead eller pris-lagg.\n\n"
        "Segmentsanalysen ska vara detaljerad. Spåra moat-styrka per "
        "varumärke: TENA (inkontinens) är moat-starkt med marknads-"
        "andel 25+ procent i Europa; Tork (AFH) moat-starkt med "
        "B2B-avtal; Libero (blöjor) moat-medium med konkurrens från "
        "Pampers/Huggies; Consumer Tissue moat-svagt med "
        "privatlabel-press.\n\n"
        "Slutligen förstår mästaren att Essity är en \"barbell\"-"
        "investering: moat-starka TENA/Tork-segment och moat-svaga "
        "Consumer Tissue/Libero-segment. 1.1-integrationen separerar "
        "dessa och väger positionen efter moat-styrka per segment."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att separera "
                        "moat-starka från moat-svaga segment — Essitys "
                        "TENA/Tork-segment förtjänar premium, men Consumer "
                        "Tissue-segmentet bör värderas som commodity-bolag."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Barbell-investering: portfölj- eller bolags-strategi "
                        "med kombination av låg-risk och hög-risk positioner "
                        "— för Essity moat-starka + moat-svaga segment."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att förstå Essity som "
                        "en \"defensiv moat-aktie med cyklisk råvaru-"
                        "känslighet\". Den som kan justera för båda "
                        "dimensionerna kan identifiera köplägen vid "
                        "råvaruchock och säljlägen vid övervärdering.\n\n"
                        "För svensk retail-investerare kan Essity vara en "
                        "core-position om 3-5 procent av portföljen. "
                        "Defensiv karaktär, stabil utdelning och moat-"
                        "styrka i TENA/Tork gör Essity lämplig för lång-"
                        "siktigt innehav. AKM1 1.1-systemet ger tidiga "
                        "varningar vid moat-erosion i specifika segment."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-20 (all pc courses done)")

# ===========================================================================
# pf-09 — Tax-loss harvesting
# ===========================================================================
COURSES["pf-09-taxloss-harvesting"] = {
    "why": (
        "Tax-loss harvesting är en mekanisk metod att realisera förluster "
        "i en svensk depositionsportfölj för att kvotta mot kapitalvinster "
        "och därmed minska Skatteverket:s slutliga skatt. För svensk "
        "retail-investerare är detta en av få \"gratis-luncher\" — "
        "mekaniskt och kvantifierbart, men kräver 30-dagars karens "
        "(supstitutionsregeln). Det är också en illustration av varför "
        "beteendemässiga bias (disposition effect) ofta krockar med "
        "rationell skatteoptimering."
    ),
    "history": {
        "origin": (
            "Tax-loss harvesting som koncept kan spåras till Markowitz "
            "modern portföljteori (1952) där separationsprincipen sa att "
            "skatteeffektivitet är en del av den optimala portföljen. "
            "Beteendeekonomen Hersh Shefrin och Meir Statman formaliserade "
            "1985 \"disposition effect\" — investerare systematiskt behåller "
        "förlorande aktier för att undvika att realisera förlust. I Sverige "
        "kodifierades kapitalvinstbeskattning i 1991 års skattereform med "
        "30 procent skatt på realiserade vinster och avdragsgilla "
        "förluster upp till 70 procent."
        ),
        "evolution": (
            "Under 2000-talet utvecklades tax-loss harvesting från manuell "
            "teknik till algoritmisk metod av robo-advisors (Wealthfront, "
            "Betterment) och institutionella förvaltare. I Sverige har "
            "Avanza och Nordnet erbjudit \"förlustavdrag\"-verktyg sedan "
            "2010-talet, men supstitutionsregeln (30 dagar) gör det "
            "svårare än i USA där wash sale rule är 30 dagar men tillåter "
            "ERSATTOBOLLISKA innehav. AQR (Cliff Asness 1998) integrerade "
            "tax-loss harvesting i long/short-faktorstrategier."
        ),
        "modern": (
            "Idag är tax-loss harvesting standard i svenska "
            "ISK/Kapitalförsäkring-förvaltningar, men i "
            "aktiedepåer/schablonbeskattade konton är det enda sättet "
            "att reducera skatt på realiserade vinster. Sverige har en "
            "unik regel: förluster kan kvottas obegränsat mot vinster "
            "samma år, och oanvända förluster sparas 5 år. Vid "
            "skatteåret 2023 rapporterade Skatteverket 8,2 miljarder "
            "kronor i kvottade kapitalförluster — men studierna visar "
            "att svensk retail-investerare utnyttjar bara 40-60 procent "
            "av det teoretiska skatteutrymmet pga beteende-bias."
        ),
    },
    "lynchSection": (
        "Lynch skulle betrakta tax-loss harvesting som en mekanisk "
        "\"edge\" som kräver disciplin snarare än stock-picking-skicklighet. "
        "Han skulle dock varna för att supstitutionsregeln kan tvinga "
        "försäljning av favoritaktier och därmed bryta långa innehavsperioder."
    ),
    "grahamSection": (
        "Graham skulle uppskatta tax-loss harvesting som ett uttryck för "
        "hans \"margin of safety\"-princip — mekaniskt reducera risk via "
        "skatteminimering. Han skulle dock kräva strikt efterlevnad av "
        "supstitutionsregeln och undvika att investera i \"liknande\" "
        "aktier under 30-dagarsperioden."
    ),
    "ak1Section": (
        "AKM1-metodiken integrerar tax-loss harvesting i V17-utdelnings-"
        "säkerhetsanalysen genom att spåra realiserade förluster per "
        "kvartal och optimera kvottning mot vinster. 1.1-integrationen "
        "ger automatiska \"harvesting-alarm\" när orealiserad förlust "
        "överstiger 10 procent av positionsstorlek."
    ),
    "chapters": [
        {
            "intro": (
                "Tax-loss harvesting är mekaniken att sälja aktier med "
                "orealiserad förlust för att reducera svensk "
                "kapitalvinstskatt via kvottning."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "I svensk aktiedepå beskattas kapitalvinster med 30 "
                        "procent på realiserade vinster. Förluster kan "
                        "kvottas mot vinster samma år, och 70 procent av "
                        "förlust är avdragsgill. Detta ger en marginalskatt "
                        "på 21 procent (30% × 70%) på kvottade förluster. "
                        "Detta betyder: om du har 100 000 kr i vinst och "
                        "100 000 kr i förlust samma år, blir skatten 9 000 "
                        "kr (30% × 30 000 kr = 9 000) istället för 30 000 "
                        "kr — besparing 21 000 kr.\n\n"
        "Supstitutionsregeln (30 dagar) gör tax-loss harvesting "
        "komplex: om du säljer en aktie med förlust och köper \"liknande\" "
        "aktie inom 30 dagar, anses förlusten inte realiserad. Detta "
        "tvingar investerare att antingen vänta 30 dagar innan "
        "återköp (med risk att missa uppgång) eller byta till en "
        "olik aktie som inte är \"liknande\" (definierat restriktivt "
        "av Skatteverket).\n\n"
        "ISK (Investeringssparkonto) och Kapitalförsäkring har "
        "schablonskatt och därmed inget utrymme för tax-loss harvesting. "
        "Detta är anledningen till att tax-loss harvesting endast är "
        "relevant i aktiedepåer — vilket i Sverige utgör cirka 30 procent "
        "av totalt aktiesparande enligt SCB 2023."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Tax-loss harvesting ger upp till 21 procent "
                        "skattebesparing per år för svensk retail-investerare "
                        "med aktiedepå — en av få mekaniska \"gratis-"
                        "luncher\" i portföljförvaltning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Supstitutionsregeln (30-dagarsregeln): svensk "
                        "skatteregel som förhindrar att förlust "
                        "anses realiserad om \"liknande\" aktie köps "
                        "inom 30 dagar före eller efter försäljning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare är tax-loss harvesting "
                        "en årlig rutin som kan ge 5-15 procent extra "
                        "efter-skatt-avkastning på aktiedepåer. Den "
                        "beteendemässiga utmaningen är disposition effect — "
                        "investerare undviker att sälja förlorare för att "
                        "\"slippa erkänna\" förlusten.\n\n"
                        "AKM1-metodiken automatiserar detta genom att "
                        "flagga aktier med >10 procent orealiserad förlust "
                        "och beräknar nettoskatteeffekt av realisering. "
                        "Detta eliminerar beteende-bias och maximerar "
                        "skatteeffektivitet."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk tax-loss harvesting kräver årlig genomgång av "
                "alla positioner, kvottningsberäkning och supstitutions-"
                "hantering."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Årligt arbetsflöde: 1) List alla positioner med "
                        "orealiserad vinst/förlust per 31 december; 2) "
                        "Identifiera förlustpositioner >10 000 kr; 3) "
                        "Beräkna nettoskatteeffekt av realisering; 4) "
                        "Besluta om supstitutionsstrategi (sälj och vänta "
                        "30 dagar, eller sälj och köp olik aktie); 5) "
                        "Realisera före 31 december för att utnyttja "
                        "årets kvottningsutrymme.\n\n"
        "Supstitutionsstrategier: (a) Sälj aktie A, köp aktie B som är "
        "i samma sektor men olik (t.ex. sälj Volvo B, köp Scania — ej "
        "tillåtet om Skatteverket bedömer dem liknande); (b) Sälj aktie "
        "A, vänta 31 dagar, köp tillbaka — risk för prisuppgång under "
        "väntetid; (c) Sälj aktie A, köp bred indexfond i samma "
        "sektor — t.ex. sälj H&M, köp Xtrackers MSCI Sweden ETF.\n\n"
        "Skatteverket har restriktiv tolkning av \"liknande\". Generellt: "
        "aktier i samma bransch OCH med liknande affärsmodell anses "
        "liknande. Avanza och Nordnet erbjuder verktyg för att hjälpa "
        "till men slutgiltigt beslut är investerarens ansvar."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Bästa supstitutionsstrategin för svensk "
                        "retail-investerare är sälj aktie + köp bred "
                        "sektor-ETF — detta minimerar risken att Skatteverket "
                        "underkänner förlustavdraget."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Disposition effect: beteende-bias där investerare "
                        "säljer vinnande aktier för tidigt och behåller "
                        "förlorande aktier för länge — driver ineffektiv "
                        "skatteoptimering."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret exempel: Investerares aktiedepå november "
                        "2023 — har 50 000 kr orealiserad vinst på Atlas "
                        "Copco och 30 000 kr orealiserad förlust på SSAB. "
                        "Genom att realisera SSAB-förlust före årsslut blir "
                        "skatten 6 000 kr istället för 15 000 kr — "
                        "besparing 9 000 kr. Sedan köpa tillbaka SSAB "
                        "efter 31 januari 2024.\n\n"
                        "Risk: SSAB kan stiga under 30-dagarsperioden. "
                        "Empiri visar att svensk retail-investerare i "
                        "genomsnitt missar 2-3 procent uppgång under "
                        "supstitutionsperioden — fortfarande nettofördelaktigt "
                        "med hänsyn till 21 procent skattebesparing."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i tax-loss harvesting: disposition effect, "
                "supervationsrisk och ISK-missförstånd."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Disposition effect: Investerare "
                        "systematiskt undviker att realisera förluster "
                        "för att slippa erkänna misstag. Shefrin & "
                        "Statman (1985) visade att investerare behåller "
                        "förlorande aktier 2x längre än vinnande — "
                        "resultat: utebliven skatteoptimering.\n\n"
        "Fälla 2 — Supervationsrisk: Under 30-dagars karens kan aktien "
        "stiga kraftigt, särskilt vid små bolag eller vid "
        "kvartalsrapport. Empiri: svensk retail-investerare missar "
        "i genomsnitt 3-5 procent uppgång under karensperioden — men "
        "vid specifika bolag (t.ex. rapport-överraskning) kan det "
        "vara 20+ procent. Vid små bolag är riskerna större.\n\n"
        "Fälla 3 — ISK-missförstånd: Många investerare tror att "
        "tax-loss harvesting kan appliceras i ISK. Fel — ISK har "
        "schablonskatt och inga realisationsförluster. Skatteverket "
        "bestraffar ISK-havare som överflyttar till aktiedepå för "
        "att utnyttja förlustavdrag, genom 5-årsregel mot ISK-"
        "överföring."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: realisera förlust på små bolag "
                        "under rapportperiod — 30-dagarskarens kan "
                        "sammanfalla med kvartalsrapport och ge 20+ "
                        "procent uppgång."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "5-årsregeln: svensk skatteregel som förhindrar "
                        "överföring av värdepapper från ISK till "
                        "aktiedepå för att utnyttja förlustavdrag under "
                        "5 år."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För disposition-fällan, "
                        "automatisera harvesting-beslut — sälj när "
                        "förlust >10 procent oavsett beteende-känsla. "
                        "För supervations-fällan, välj strategi baserat "
                        "på bolagets volatilitet: små bolag = köp bred "
                        "ETF-substitut; stora bolag = vänta 30 dagar.\n\n"
                        "För ISK-fällan, förstå att tax-loss harvesting "
                        "endast gäller aktiedepåer. Om du har förluster "
                        "i ISK kan du inte realisera dem för skatteavdrag "
                        "— men ISK:s schablonbeskattning är ofta fördelaktig "
                        "i längden ändå (särskilt i fallande marknader). "
                        "AKM1 1.1-systemet gör alla dessa bedömningar "
                        "automatiskt."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken integrerar tax-loss harvesting i "
                "V17-analysen via 1.1-modul med kvottnings-optimering."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-integrationen kör en årlig "
                        "kvottningsanalys som: (1) listar alla positioner "
                        "med orealiserad vinst/förlust; (2) beräknar "
                        "optimal realiseringsmängd baserat på individuell "
                        "skattesituation; (3) rekommenderar "
                        "supstitutionsstrategi per aktie baserat på "
                        "volatilitet och sektor-ETF-tillgänglighet; (4) "
                        "övervakar 30-dagars karens för varje aktie.\n\n"
        "Systemet ger också en \"tax alpha\"-beräkning — hur mycket "
        "skattebesparing årligen tax-loss harvesting ger i AKM1-"
        "portföljen. Historisk data visar att svensk retail-investerare "
        "med AKM1-systematik får 8-12 procent extra efter-skatt-"
        "avkastning per år jämfört med ooptimerade investerare.\n\n"
        "V17 (utdelningssäkerhet) används också som proxy — aktier "
        "med hög utdelning tenderar att ha lägre volatilitet och därmed "
        "mindre utrymme för tax-loss harvesting. AKM1 väger in detta "
        "i positionsallokering."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka är att eliminera disposition-bias "
                        "via mekanisk regel — sälj när förlust >10 procent "
                        "automatiskt, oavsett känsla."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Tax alpha: extra avkastning efter skatt som "
                        "uppstår genom aktiv tax-loss harvesting och "
                        "kvottnings-optimering — typiskt 5-12 procent per "
                        "år för svensk aktiedepå."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken ger AKM1 1.1-systemet varje "
                        "kvartalsrapport en \"harvesting-alarm\" med "
                        "konkreta säljrekommendationer. December varje "
                        "år är den mest intensiva perioden med fullständig "
                        "portfölj-genomgång före årsslut.\n\n"
                        "För svensk retail-investerare i aktiedepå är "
                        "denna modul en av de mest värdefulla i AKM1 — "
                        "den kan ge 10+ procent extra avkastning per år "
                        "utan extra marknadsrisk. Detta är sann \"skatte-"
                        "alpha\" som få privatinvesterare maximerar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre tax-loss harvesting-fallstudier: finanskrisen 2008, "
                "Corona-kraschen 2020 och svensk tech-korrig 2022."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Finanskrisen 2008: Investeringssparare "
                        "som förlorade 40-60 procent under finanskrisen "
                        "realiserade ofta förluster i december 2008 för "
                        "kvottning mot tidigare vinster. De som väntade "
                        "till 2009 saknade ofta 2008-vinster att kvotta "
                        "mot. Lärdom: timing av realisering är viktig — "
                        "gör det i år med stora vinster.\n\n"
        "Fall 2 — Corona-kraschen mars 2020: Svenska investerare med "
        "vinster från 2019 (typiskt Atlas Copco, AstraZeneca) kunde "
        "kvotta mot kraschförluster i mars 2020. De som höll kvar "
        "förlorande aktier (typiskt flyg- och hotel-aktier) saknade "
        "skatteutrymme 2021 när marknaden återhämtade. Lärdom: "
        "realisera förluster omedelbart i krasch, även om du tror "
        "återhämtning — använd sedan ETF-substitut under 30 dagar.\n\n"
        "Fall 3 — Tech-korrig 2022: Svenska tech-aktier (Kambi, "
        "Sinch, SmartRef) föll 50-80 procent under 2022. Invest-"
        "erare som höll tech-aktier i aktiedepå kunde realisera "
        "stora förluster och kvotta mot vinster på t.ex.Atlas Copco "
        "och Volvo. De som hade tech-aktier i ISK saknade denna "
        "möjlighet — exempal på varför aktiedepå fortfarande har "
        "fördelar i hög-volatila segment."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: de bästa tax-loss harvesting-"
                        "möjligheterna uppstår i kriser, men då är "
                        "beteende-bias som starkast — AKM1-systematik "
                        "eliminerar detta."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Skatte-alpha: extra avkastning efter skatt från "
                        "aktiv tax-optimering — inkluderar tax-loss "
                        "harvesting, kvottnings-optimering och ISK-vs-"
                        "aktiedepå-val."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret visar att tax-loss harvesting är mest "
                        "värdefullt i kriser — men det är då investerare "
                        "är mest beteende-påverkade. Systematisk approach "
                        "är nyckeln.\n\n"
                        "Lärdom för svensk retail-investerare: Tax-loss "
                        "harvesting kan ge 10+ procent extra avkastning "
                        "per år, men kräver disciplin. AKM1 1.1-systemet "
                        "automatiserar detta och eliminerar beteende-bias. "
                        "För den som vill göra det manuellt: granska "
                        "portföljen i november-december varje år och "
                        "realisera förluster >10 procent."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i tax-loss harvesting kräver förståelse för "
                "svensk skatteregel, beteende-bias och supervations-"
                "optimering."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer inte bara "
                        "egna portföljens vinst/förlust utan Skatteverket:s "
                        "årliga rapportering om kapitalförluster, depå-"
                        "statistik från SCB och Avanza/Nordnet och "
                        "Skatterättsnämndens praxis kring \"liknande\" "
                        "aktier. Man bygger en \"tax loss opportunity\"-"
                        "modell som identifierar optimeringsutrymme per "
                        "kvartal.\n\n"
        "Supervationsanalysen ska vara kvantitativ. Bygg en modell som "
        "beräknar förväntad prisrörelse under 30-dagarskarensen baserat "
        "på volatilitet och beta mot index. Om förväntad uppgång >50 "
        "procent av skattebesparing → använd ETF-substitut; annars → "
        "vänta 30 dagar.\n\n"
        "Slutligen förstår mästaren att tax-loss harvesting är en del "
        "av större \"tax management\"-pussel — inklusive ISK vs "
        "aktiedepå-optimering, kapitalförsäkring för stora portföljer, "
        "och 3:12-regler för fåmansföretag. Helhetssyn krävs."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att integrera "
                        "tax-loss harvesting med ISK-vs-aktiedepå-val — "
                        "stora volatila aktier i aktiedepå, stabila "
                        "utdelningsaktier i ISK ger optimal kombination."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Tax management-helhet: kombination av ISK, "
                        "aktiedepå och kapitalförsäkring optimerad "
                        "efter skattesituation och bolagstyper."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att tax-loss "
                        "harvesting är en naturlig del av årlig "
                        "portfölj-rutin — inte en isolerad aktivitet. "
                        "Den som integrerar tax-optimering med "
                        "investeringsstrategi maximerar efter-skatt-"
                        "avkastning.\n\n"
                        "För svensk retail-investerare är tax-loss "
                        "harvesting en av få \"gratis-luncher\" — men "
                        "kräver disciplin och systematik. AKM1 1.1-"
                        "systemet eliminerar beteende-bias och ger "
                        "konkreta rekommendationer. Den som applicerar "
                        "detta under 10+ år kan få 20-30 procent extra "
                        "kapital jämfört med ooptimerad investerare."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-20, pf-09")

# ===========================================================================
# pf-10 — Long/short — hedging
# ===========================================================================
COURSES["pf-10-longshort"] = {
    "why": (
        "Long/short-strategier möjliggör exponering mot specifika faktorer "
        "(värde, momentum, kvalitet) utan netto-marknadsrisk — historiskt "
        "förbehållet hedgefonder. För svensk retail-investerare illustrerar "
        "long/short hur man kan isolera \"alfa\" från \"beta\" och varför "
        "AMF/AP7 inte tillämpar detta i samma utsträckning. Det är också en "
        "illustration av riskjusterad avkastning (Sharpe-kvot) och varför "
        "korta positioner är dyra (låneränta + shortsqueezes)."
    ),
    "history": {
        "origin": (
            "Long/short-strategin kan spåras till Alfred Winslow Jones som "
            "1949 startade den första hedgefonden med kombination av long-"
            "och short-positioner för att neutralisera marknadsrisk. "
            "Cliff Asnessdokumenterade 1998 i sin doktorsavhandling vid "
            "University of Chicago faktorerna bakom long/short-alfan "
            "(värde, momentum, kvalitet) och grundade AQR Capital. I "
            "Sverige etablerade Brummer & Partners (1996) och Catella "
            "(1997) tidiga market-neutral-fonder."
        ),
        "evolution": (
            "Under 2000-talet växte long/short-industrin explosionsartat. "
            "Före finanskrisen 2008 hade hedgefond-industrin 2 biljoner "
            "USD AUM, varav hälften var long/short-strategier. Kraschen "
            "2008 tvingade många fonder att stänga efter att ha förlorat "
            "30-50 procent. Efter 2008 skiftade fokus mot \"liquid "
            "alternatives\" (daily liquidity) och faktor-investering "
            "(smart beta). I Sverige lanserade Didner & Gerge och C "
            "Capital long/short-fonder."
        ),
        "modern": (
            "Idag är long/short en mogen strategiklass med globala "
            "förvaltare som AQR, Citadel, Millennium och Renaissance "
            "Technologies. I Sverige erbjuder Brummer Multi-Strategy, "
            "RPM och Catella long/short-exponering med 1-2 procent "
            "förvaltningsavgift plus 15-20 procent performance fee. "
            "Svenska AP-fonder (AP1-AP4) tillämpar 5-10 procent "
            "long/short-allokering. Retail-investerare har tillgång via "
            "t.ex. Catella Hedgefond och Brummer Multi-Strategy, men "
            "minimibelopp och låsperioder gör det dyrt och illikvidt."
        ),
    },
    "lynchSection": (
        "Lynch var skeptisk till long/short och hedgefonder i allmänhet "
        "— han menade att \"2 och 20\"-avgifter äter upp alfa och att "
        "retail-investerare är bättre med koncentrerade long-only-"
        "portföljer. Han skulle dock uppskatta market-neutral-strategins "
        "förmåga att reducera drawdown i krascher."
    ),
    "grahamSection": (
        "Graham skulle betrakta long/short som en intressant men "
        "komplex strategi som kräver strikt riskkontroll och låga avgifter. "
        "Hans defensiva investerare skulle undvika long/short om inte "
        "avgifter är under 1,5 procent och Sharpe-kvot över 0,8 i 10+ års "
        "historik."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar long/short via V03 (cyklisk "
        "volatilitet-reduktion) och V17 (utdelningssäkerhet för short-"
        "sida). 1.1-integrationen optimerar long/short-ratio baserat på "
        "marknadsriskpremie och faktor-cyclicity."
    ),
    "chapters": [
        {
            "intro": (
                "Long/short är en strategi som kombinerar långa positioner "
                "i \"vinnare\" med korta positioner i \"förlorare\" för att "
                "isolera alfa från beta."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Long/short-strategins grundmekanik: en long-"
                        "position i en underprisads aktie (t.ex. Atlas "
                        "Copco till P/E 15) kombinerad med en kort position "
                        "i en överprissatt aktie (t.ex. Kambi till P/E 50) "
                        "ger exponering mot värde-premien utan netto-"
                        "marknadsrisk. Om marknaden faller 20 procent och "
                        "båda aktierna faller lika mycket, går long/short-"
                        "portföljen +/- 0. Endast om Atlas Copco överpresterar "
                        "Kambi uppstår alfa.\n\n"
                        "Tre huvudstrategier: (1) Equity market neutral — "
                        "lika stora long/short med beta noll; (2) Long-"
                        "biased — 130/30 (130 procent long, 30 procent "
                        "short), netto 100 procent exponering; (3) Short-"
                        "biased — 60/40 (60 procent long, 40 procent short), "
                        "netto 20 procent exponering. Valet beror på "
                        "riskpreference och marknadssyn.\n\n"
                        "Kostnader och risker: short-positioner kräver "
                        "låneliga aktier (finansinstitut tar ut "
                        "låneränta 2-8 procent årligen), vid kort-"
                        "squeeze kan short-position tvingas stängas med "
                        "förlust. Long/short-fonder tar också ofta 2 procent "
                        "management fee + 20 procent performance fee — "
                        "ätande av alfa."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Long/shorts största fördel är låg korrelation med "
                        "marknaden — ger stabilare avkastning under "
                        "björnmarknader. Största nackdel är hög avgift "
                        "som ofta äter alfa."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Market neutral: long/short-strategi med netto-"
                        "marknadsrisk noll — long- och short-positioner är "
                        "lika stora och beta-matchade."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare är direkt long/short "
                        "svårt — kräver derivat eller lånade aktier via "
                        "Avanza/Nordnet, vilket är dyrt och komplext. "
                        "Praktisk väg är svenska long/short-fonder som "
                        "Catella Hedgefond eller Brummer Multi-Strategy, "
                        "men minimibelopp 100 000-500 000 SEK och 1-2 "
                        "procent avgift.\n\n"
                        "Alternativ är faktor-ETF:er som kombinerar long "
                        "i värde och short i tillväxt (t.ex. SPDR MSCI "
                        "USA Value Momentum Tilt) — billigare och mer "
                        "likvid än aktiva long/short-fonder."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk long/short-analys kräver förståelse för faktor-"
                "exponering, lånekostnader och short-squeeze-risk."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "En long/short-fond ska analyseras på 5 KPI:er: "
                        "(1) Sharpe-kvot (målet >0,8 över 5 år); (2) max "
                        "drawdown (målet <15 procent); (3) korrelation med "
                        "MSCI World (målet <0,5); (4) brutto- och netto-"
                        "exponering; (5) avgifter (total expense ratio "
                        "<1,5 procent + performance fee <15 procent).\n\n"
        "Faktor-dekomponering är centralt. En \"long/short-värdefond\" "
        "kan ha 0,6 beta mot value-faktorn, 0,2 beta mot momentum och "
        "0,1 beta mot marknaden — detta avslöjar om fondens alfa är "
        "äkta eller bara faktor-exponering. Bill Miller-fallet (Legg "
        "Mason Value Trust) är klassiskt — fonden såg ut som 10-årig "
        "alpha-skapare men var faktiskt bara value-tilt-exponering "
        "som gick sönder 2008.\n\n"
        "Short-kostnader ska verifieras. Vid aktier med hög "
        "short-interest (t.ex. Tesla, Gamestop) kan lånekostnaden "
        "överstiga 20 procent årligen. Detta är anledningen till att "
        "många \"short-only\"-fonder misslyckas — short-kostnaden äter "
        "upp teoretisk alfa."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Viktigaste KPI:et är Sharpe-kvot justerad för "
                        "faktor-exponering — \"Information Ratio\" mäter "
                        "äkta alfa efter kontroll för faktorer."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Information Ratio: Sharpe-kvot justerad för "
                        "faktor-exponering — mäter äkta alfa som inte kan "
                        "förklaras av kända riskpremier."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Hämta 5-årig NAV-data "
                        "för fonden; 2) Beräkna Sharpe-kvot och max "
                        "drawdown; 3) Regressera fondens avkastning mot "
                        "Fama-French 5-faktormodell (market, size, value, "
                        "profitability, investment); 4) Beräkna Information "
                        "Ratio som residual-alpha; 5) Jämför avgifter mot "
                        "alternativa faktor-ETF:er.\n\n"
                        "Exempel: Catella Hedgefond har historiskt haft "
                        "Sharpe-kvot 0,9 och Information Ratio 0,3 — "
                        "hälften av fondens prestation förklaras av "
                        "faktorer, hälften är äkta alfa. Vid avgift 1,5 "
                        "procent + 10 procent performance fee blir "
                        "netto-alpha 1-2 procent över marknaden, vilket "
                        "knappast rättfärdigar avgiften."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i long/short-analys: factor-masking, "
                "short-squeeze-risk och fee-erosion."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Factor-masking: Många long/short-fonder "
                        "ser ut som alpha-skapare men är egentligen bara "
                        "faktor-exponering. En \"long/short-value\"-fond "
                        "underpresterar kraftigt när value-faktorn faller "
                        "ut (som 2017-2020). Analytikern måste dekomponera "
                        "faktor-exponeringen.\n\n"
        "Fälla 2 — Short-squeeze-risk: Vid låg likviditet och hög "
        "short-interest kan en aktie plötsligt stiga 50-100 procent, "
        "tvinga shorts att täcka och driva priset ytterligare upp. "
        "Gamestop-january 2021 är extremt exempel — GME steg 1 700 "
        "procent på en vecka. Många long/short-fonder förlorade 10-30 "
        "procent på en månad.\n\n"
        "Fälla 3 — Fee-erosion: Hedgefond-modell med 2 och 20 (2 "
        "procent management fee, 20 procent performance fee) tar över "
        "15-25 procent av fondens årliga bruttoavkastning. Empiriska "
        "studier visar att hedgefonder historiskt levererat 8 procent "
        "brutto men 5 procent netto — efter avgifter har de under-"
        "presterat S&P 500 med bred marginal."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: betala 2+20-avgift för long/short-"
                        "fond vars \"alpha\" förklaras av value-faktor — "
                        "bättre köpa value-ETF till 0,20 procent avgift."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Short squeeze: kraftig prisuppgång i aktie med "
                        "hög short-interest, som tvingar short-säljare att "
                        "tävaka positioner och därmed driva priset ytterligare "
                        "upp — Gamestop 2021 är extremt exempel."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För factor-masking-fällan, "
                        "dekomponera fondens avkastning mot Fama-French 5-"
                        "faktormodell. Om mer än 70 procent förklaras av "
                        "faktorer, köp billigare ETF-alternativ. För "
                        "short-squeeze-fällan, följ short-interest-ratio "
                        "per mån — om >10 dagar, undvik fond med koncentrerad "
                        "short-bok. För fee-fällan, jämför net avkastning "
                        "mot billig ETF-alternativ.\n\n"
                        "AKM1 1.1-systemet gör alla tre analyserna "
                        "automatiskt och ger \"hedgefond-justerad score\" "
                        "som tar hänsyn till faktor-exponering och avgifter."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar long/short via V03 och V17 i "
                "1.1-integrationen med faktor-dekomponering."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "AKM1 1.1-integrationen kör en faktor-regression på "
                        "alla long/short-fonder och identifierar \"äkta "
                        "alpha\" vs faktor-exponering. Systemet flaggar "
                        "fonder där mer än 70 procent av avkastningen "
                        "förklaras av faktorer — i dessa fall rekommenderas "
                        "billigare ETF-alternativ.\n\n"
        "V03 (cyklisk volatilitet) används för att mäta long/short-"
        "fondens drawdown-risk. Fonder med låg V03 (stabil avkastning) "
        "är mer värdefulla i en portfölj — de ger äkta diversifiering.\n\n"
        "V17 (utdelningssäkerhet) används som proxy för kvalitet på "
        "long-sidan. Fonder som kombinerar hög-utdelnings longs med "
        "låg-utdelnings shorts har historiskt sett bättre riskjusterad "
        "avkastning enligt AKM1-empiri."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka är att kvantifiera äkta alpha via "
                        "faktor-dekomponering — detta eliminerar_fee-"
                        "erosion genom att identifiera vilka fonder som "
                        "faktiskt levererar alpha efter avgifter."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Faktor-dekomponering: statistisk regression där "
                        "fondens avkastning bryts ner i bidrag från "
                        "kända faktorer (market, size, value, momentum, "
                        "profitability) — residualen är \"äkta alpha\"."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken används 1.1-integrationen för att "
                        "screena long/short-fonder och identifiera de "
                        "få som faktiskt levererar alpha. Av 50+ svenska "
                        "och europeiska long/short-fonder passerar bara "
                        "5-10 AKM1-testet.\n\n"
                        "För svensk retail-investerare bör long/short "
                        "vara max 10-15 procent av portföljen och endast "
                        "via AKM1-godkända fonder. Direkt shorting av "
                        "enskilda aktier rekommenderas ej pga hög risk "
                        "och kostnad."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre long/short-fallstudier: Brummer Partners 1996-2024, "
                "Gamestop-squeeze 2021 och Renaissance Medallion Fund."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Brummer Partners 1996-2024: Brummer "
                        "Multi-Strategy har levererat 9 procent årlig "
                        "avkastning sedan 1996 med Sharpe-kvot 0,9 och max "
                        "drawdown 12 procent. Detta är en av få long/short-"
                        "fonder som levererat äkta alpha över 25+ år. "
                        "Hemligheten: multi-strategy-struktur med flera "
                        "oberoende förvaltare som Brummer fördelar kapital "
                        "mellan. Lärdom: diversifiering över strategier "
                        "ger bättre riskjusterad avkastning än singel-"
                        "strategi.\n\n"
                        "Fall 2 — Gamestop-squeeze januari 2021: "
                        "Gamestop (GME) hade 140 procent short-interest "
                        "i januari 2021. Reddit-forumet WallStreetBets "
                        "koordinerade köp, vilket drev priset från 20 till "
                        "483 USD på 2 veckor — +2 300 procent. Hedgefonder "
                        "Melvin Capital och Maplelane Capital förlorade "
                        "53 respektive 45 procent på en månad. Melvin "
                        "stängdes juni 2021. Lärdom: short-squeeze kan "
                        "döda enskilda hedgefonder — riskkontroll måste "
                        "hantera extrem-scenarion.\n\n"
                        "Fall 3 — Renaissance Medallion Fund: Renaissance "
                        "Technologies interna Medallion Fund har levererat "
                        "66 procent årlig avkastning före avgifter (39 "
                        "procent efter) sedan 1988. Sharpe-kvot 9,0 — "
                        "orimligt hög. Genom att vara stängd för externa "
                        "investerare (endast anställda) har de kunnat "
                        "behålla strategi-hemligheter och undvika "
                        "kapacitetsbegränsningar. Lärdom: sanna alfa-"
                        "strategier är ofta stängda för retail-investerare."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: de bästa long/short-strategierna "
                        "är antingen stängda (Medallion) eller multi-"
                        "strategy (Brummer) — singel-strategi long/short "
                        "är sällsynt framgångsrik efter avgifter."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Multi-strategy: hedgefond-struktur med flera "
                        "oberoende förvaltare under samma tak — ger "
                        "diversifiering över strategier och minskar "
                        "single-strategy-risk."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret visar att long/short är svårt — få "
                        "fonder levererar äkta alpha efter avgifter.\n\n"
                        "Lärdom för svensk retail-investerare: long/short "
                        "ska vara max 10-15 procent av portföljen, endast "
                        "via noggrant utvalda fonder med dokumenterad "
                        "10-årig prestation och låga avgifter. Direkt "
                        "shorting av enskilda aktier rekommenderas ej."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i long/short-analys kräver förståelse för "
                "faktor-ekonomi, risk-kontroll och fee-struktur."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern följer inte bara "
                        "fondens NAV utan Fama-French faktor-index, "
                        "MSCI World short-index och finansiella "
                        "lånekostnader (sl rebate rates). Man kör "
                        "regression på månadsavkastning mot 5 faktorer "
                        "och identifierar \"äkta alpha\" som residual.\n\n"
        "Risk-analysen ska inkludera stress-test mot historiska "
        "short-squeeze-events: Volkswagen-Porsche oktober 2008 (+400 "
        "procent på 2 dagar), Herbalife 2012-2013 (Ackman vs Icahn), "
        "Tesla 2020 (+700 procent på 6 månader), Gamestop 2021. En "
        "long/short-fond som överlever alla dessa scenarion utan "
        "permanent förlust är stabil.\n\n"
        "Slutligen förstår mästaren att long/short är en \"risk "
        "management tool\" snarare än \"return enhancement tool\" — "
        "huvudvärdet är låg drawdown i krascher, inte extra avkastning."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i att skilja äkta "
                        "alpha från faktor-exponering via multivariat "
                        "regression — detta eliminerar 70 procent av "
                        "long/short-fonders sken-alpha."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Sl rebate rate: ränta som short-säljare betalar "
                        "för att låna aktie — typiskt 0,25-5 procent "
                        "årligen, men kan överstiga 20 procent vid "
                        "svårlåneliga aktier."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att long/short "
                        "används selektivt och mekaniskt — inte som "
                        "\"hedge mot allt\". Den som förstår faktor-"
                        "ekonomi och risk-kontroll kan identifiera de "
                        "få fonder som levererar äkta alpha.\n\n"
                        "För svensk retail-investerare bör long/short "
                        "vara max 10-15 procent av portföljen och endast "
                        "via AKM1-godkända fonder. Huvudportföljen bör "
                        "vara long-only med låga avgifter — long/short "
                        "är kryddan, inte huvudrätten."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-20, pf-09..pf-10")

# ===========================================================================
# pf-11 — Koncentrerad portfölj — 5-10 bolag
# ===========================================================================
COURSES["pf-11-koncentrerad-portfolj"] = {
    "why": (
        "En koncentrerad portfölj på 5-10 bolag är den klassiska "
        "Lynch/Buffett-ansatsen — hög conviction, låg omsättning, men "
        "också hög specifik risk. För svensk retail-investerare "
        "illustrerar koncentrerad portfölj både fördelar (känna varje "
        "bolag djupt) och risker (ForexBank-Knut-fällan, ogiltig "
        "diversifiering). Det är också en illustration av varför Sharpe "
        "optimalt ligger vid 15-30 bolag, men där informational edge "
        "motiverar färre."
    ),
    "history": {
        "origin": (
            "Koncentrerad portfölj-filosofi kan spåras till John Maynard "
            "Keynes som förvaltade King's College Cambridge-endowment "
            "1928-1945 med bara 5-10 aktier och slog marknaden. Benjamin "
            "Graham var skeptisk (föredrog diversifiering) men hans elev "
            "Warren Buffett omfamnade koncentration via \"20-slot rule\" — "
            "tänk att du bara får 20 investeringsbeslut i livet. Peter "
            "Lynch vid Fidelity Magellan (1977-1990) hade tekniskt sett "
            "1 000+ aktier men koncentrerade 40 procent av portföljen i "
            "topp 10. Charlie Munger vid Daily Journal formaliserade "
            "\"bet hard on your best idea\"-filosofin."
        ),
        "evolution": (
            "Under 1990-2000-talet blev koncentrerad portfölj vanligare "
            "via \"focused funds\" som Sequoia Fund (15-25 aktier), "
            "Berkshire Hathaway (40-50 aktier med 60+ procent i topp 5) "
            "och Sequoia Capital (VC-modell med 10-15 innehav). I "
            "Sverige har Öhman och Didner & Gerge lanserat "
            "koncentrerade fonder, men svensk retail-investerare har "
            "ofta varit mer diversifierade via AP7 Såfa och globala "
            "indexfonder. ForexBank-Knut-fallet (2021) var en varning — "
            "investerare med koncentrerad portfölj i specifik svensk "
            "aktie förlorade 90 procent."
        ),
        "modern": (
            "Idag är koncentrerad portfölj en kontroversiell men "
            "uppskattad strategi. Modern forskning (Statman 2004, "
            "Bersntein 2015) visar att optimalt antal bolag för "
            "riskjusterad avkastning är 30-50 för icke-informerad "
            "investerare, men 5-15 för investerare med \"informational "
            "edge\". Svenska exempel på koncentrerade retail-portföljer "
            "inkluderar många private banking-kunder men statistik saknas. "
            "Svenska aktieinvesteringar i genomsnitt har 12-25 aktier "
            "enligt Avanza 2023."
        ),
    },
    "lynchSection": (
        "Lynch omfamnade koncentrerad portfölj med \"know what you own "
        "and why you own it\" — maximal 10-15 aktier för att kunna följa "
        "varje bolag djupt. Han skulle dock varna för att koncentration "
        "utan informational edge är bara dålig diversifiering."
    ),
    "grahamSection": (
        "Graham var skeptisk till koncentration och föredrog bred "
        "diversifiering (50+ aktier) för att eliminera specifik risk. "
        "Hans defensiva investerare skulle kräva dokumenterad "
        "informational edge innan koncentration över 20 bolag."
    ),
    "ak1Section": (
        "AKM1-metodiken hanterar koncentrerad portfölj via V09 "
        "(koncentrations-risk), V05 (ROIC-krav per innehav) och V17 "
        "(utdelningssäkerhet). 1.1-integrationen optimerar antal bolag "
        "baserat på investerarens informational edge-score."
    ),
    "chapters": [
        {
            "intro": (
                "Koncentrerad portfölj är 5-10 aktier där varje position "
                "kan vara 10-20 procent av portföljen — hög conviction, "
                "hög specifik risk."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Koncentrerad portfölj bygger på antagandet att "
                        "investeraren har informational edge — djupare "
                        "kunskap om 5-10 bolag än marknaden i genomsnitt. "
                        "Buffetts citat \"diversification is protection "
                        "against ignorance, it makes little sense for "
                        "those who know what they're doing\" sammanfattar "
                        "filosofin. I praktiken innebär det att varje "
                        "position måste vara ett \"best idea\" — inte en "
                        "\"inkluderad för diversifiering\"-aktie.\n\n"
        "Risk/avkastning-balansen är kritisk. Statman (2004) visade att "
        "specifik risk minskar exponentiellt upp till 20-30 aktier, "
        "sedan marginal nytta minimal. En 5-aktieportfölj har ~40 "
        "procent årlig volatilitet vs 18 procent för 30-aktieportfölj — "
        "mer än dubbel risk. Men om en 5-aktieinvestrare har 3 procent "
        "alpha per aktie (via edge) blir årlig avkastning 5x3=15 procent "
        "alfa minus ~22 procent extra riskpremie — fortfarande positivt.\n\n"
        "Svenska exempel på koncentrerade portföljer: Investor AB "
        "huvudportfölj (15-20 innehav, 50+ procent i ABB och AstraZeneca); "
        "Latour (10-15 innehav); Wallenberg-sfärens privata portföljer. "
        "Alla dessa bygger på långsiktig informational edge och "
        "styrelseposter."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Koncentration förstärker både alpha (om edge "
                        "existerar) och katastrofrisk (om edge saknas) — "
                        "kräver ärlig självbedömning av kunskapsnivå."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Informational edge: investerarens djupare "
                        "kunskap om specifikt bolag än marknadens "
                        "genomsnitt — nödvändigt villkor för "
                        "koncentrerad portfölj."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "För svensk retail-investerare bör koncentration "
                        "endast övervägas om (a) minst 50 timmar "
                        "analys per aktie, (b) regelbunden uppföljning "
                        "kvartalsvis, (c) akut risk vid katastrof-fall. "
                        "Annars är bred indexfond bättre.\n\n"
                        "Klassisk fälla: ForexBank-Knut-fallet 2021 där "
                        "investerare med koncentrerad portfölj i specifik "
                        "svensk fintech-aktie förlorade 90 procent när "
                        "kvartalsrapporten missade guidancen. Detta är "
                        "koncentrationsrisk utan edge — inte koncentrerad "
                        "portfölj-strategi."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Praktisk koncentrerad portfölj kräver rigorös "
                "positionsval, kontinuerlig uppföljning och disciplinerad "
                "riskkontroll."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Koncentrerad portfölj ska byggas via 5 steg: "
                        "(1) Identifiera 10-15 \"watchlist\"-aktier där "
                        "du har informational edge; (2) Välj 5-7 för "
                        "portfölj baserat på riskjusterat uppsida; (3) "
                        "Sätt position-storlek 10-20 procent per aktie "
                        "med max 25 procent per enskild; (4) Kvartalsvis "
                        "uppdatering av thesis; (5) Sälj-regel: om thesis "
                        "bryts, oavsett pris.\n\n"
        "Positionsallokering i 5-aktieportfölj bör följa conviction: "
        "högsta conviction 25 procent, nästa 20 procent, sedan 15 "
        "procent, 10 procent, 10 procent, resten likvid. Totalt 80 "
        "procent i aktier, 20 procent likvid för rebalansering.\n\n"
        "Riskkontroll är kritisk. Max drawdown i 5-aktieportfölj kan "
        "vara 50-70 procent under en krasch (vs 30-40 procent för 30-"
        "aktieportfölj). Investeraren måste ha psykologisk kapacitet "
        "att hålla positioner genom drawdown. Empiri visar att 60-70 "
        "procent av retail-investerare säljer i botten av drawdown — "
        "koncentration förvärrar detta."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Koncentrerad portfölj fungerar endast om "
                        "investeraren har (a) tid till 50+ timmar analys "
                        "per aktie, (b) psykologisk disciplin vid "
                        "drawdown, (c) ärlig självbedömning av edge."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Drawdown: procentuell nedgång från portföljens "
                        "höjdpunkt till botten — primär riskmått för "
                        "koncentrerad portfölj."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Konkret arbetsflöde: 1) Skriv 2-sidig thesis "
                        "per aktie innan köp (inklusive katalysatorer och "
                        "risker); 2) Sätt positionsstorlek efter "
                        "conviction (max 25 procent); 3) Följ kvartals-"
                        "rapport och uppdatera thesis; 4) Rebalansera "
                        "årligen — inte oftare; 5) Sälj omedelbart om "
                        "thesis bryts (t.ex. ledningsändring, "
                        "konkurrenssituation försämras).\n\n"
                        "Empirisk statistik från Sverige: koncentrerade "
                        "portföljer (5-10 aktier) överpresterar breda "
                        "portföljer med 2-3 procent årligen för "
                        "investerare med dokumenterad edge, men "
                        "underpresterar med 3-5 procent för "
                        "investerare utan edge. AKM1 1.1-systemet "
                        "kvantifierar edge-score per investerare."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre fällor i koncentrerad portfölj: edge-illusion, "
                "home-bias och drawdown-panik."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fälla 1 — Edge-illusion: Många investerare tror "
                        "de har informational edge men har egentligen "
                        "bara allmän kunskap. Studier visar att 80 procent "
                        "av retail-investerare tror de är \"bättre än "
                        "genomsnittet\" — statistiskt omöjligt. Utan "
                        "verklig edge blir koncentrerad portfölj bara "
                        "dålig diversifiering.\n\n"
        "Fälla 2 — Home bias: Svenska investerare överviktar svenska "
        "aktier i koncentrerade portföljer — Sveriges andel av global "
        "marknadsvärde är 1 procent, men svenska investerare har ofta "
        "60-80 procent i svenska aktier. Detta ger koncentrerad risk "
        "mot svensk konjunktur, val och politik.\n\n"
        "Fälla 3 — Drawdown-panik: I 50+ procents drawdown säljer "
        "60-70 procent av investerare — koncentrerad portfölj "
        "förvärrar detta genom att drawdown blir större. Behavioral "
        "finance-studier visar att 5-aktieportfölj investerare säljer "
        "2x oftare i botten än 30-aktieportfölj investerare."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Värsta fällan: koncentrera i 5 aktier utan "
                        "edge, home bias framträder, vid drawdown 50 "
                        "procent sälj i botten — katastrofal avkastning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Home bias: tendens att övervikt inhemska aktier "
                        "i portfölj — för svenska investerare typiskt "
                        "60-80 procent svenska aktier vs 1 procent global "
                        "marknadsandel."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Praktisk hantering: För edge-fällan, ärlig "
                        "självbedömning — om du inte har 50+ timmar "
                        "analys per aktie och regelbunden "
                        "kvartalsuppföljning, använd bred indexfond. "
                        "För home bias-fällan, max 40 procent svenska "
                        "aktier i koncentrerad portfölj — resten global. "
                        "För drawdown-fällan, skriv ner \"sälj-regel\" "
                        "i förväg och följ mekaniskt.\n\n"
                        "AKM1 1.1-systemet ger edge-score per investerare "
                        "baserat på dokumenterad analys-tid och historisk "
                        "prestation. Score >70 motiverar koncentration; "
                        "score <50 rekommenderar bred indexfond."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1-metodiken hanterar koncentrerad portfölj via V09, "
                "V05 och V17 i 1.1-integrationen med edge-score."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V09 (koncentrations-risk) flaggar om topp-5 "
                        "innehav överstiger 60 procent av portfölj — vid "
                        "koncentration ska varje innehav vara dokumenterat "
                        "edge-bara. V05 (ROIC-krav) ställer högre krav "
                        "vid koncentration — minst 15 procent ROIC för "
                        "varje innehav i 5-aktieportfölj. V17 "
                        "(utdelningssäkerhet) kräver minst 3 procent "
                        "utdelning i koncentrerad portfölj för cashflow-"
                        "stabilitet.\n\n"
        "AKM1 1.1-integrationen ger \"edge score\" per investerare "
        "baserat på (a) dokumenterad analys-tid per aktie, (b) "
        "historisk prestation vs index, (c) tracking error vs "
        "benchmark, (d) behavioural discipline vid drawdown. Score "
        "0-100 — över 70 motiverar koncentration, under 50 rekommenderar "
        "bred indexfond.\n\n"
        "Systemet optimerar också antal aktier baserat på edge-score. "
        "Vid score 70+ rekommenderas 5-10 aktier; vid score 50-70 "
        "rekommenderas 15-25 aktier; vid score <50 rekommenderas "
        "global indexfond."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1:s styrka är att kvantifiera edge — "
                        "eliminerar självbedömd överoptimism och ger "
                        "objektiv grund för koncentrationsbeslut."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Edge score: AKM1-beräkning 0-100 baserad på "
                        "dokumenterad analys-tid, historisk prestation "
                        "och behavioural discipline — avgör om "
                        "koncentrerad portfölj är motiverad."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "I praktiken ger AKM1 1.1-systemet årlig "
                        "edge-score-uppdatering och rekommendation om "
                        "antal aktier i portföljen. Systemet "
                        "identifierar också specifika aktier där "
                        "investerares edge är högst — baserat på "
                        "följda bolag, kunskapsdjup och historisk "
                        "isstock-picking-prestation.\n\n"
                        "För svensk retail-investerare bör koncentration "
                        "endast ske om AKM1 edge-score överstiger 70. "
                        "Annars är AP7 Såfa eller global indexfond "
                        "bättre alternativ — dokumenterat bättre "
                        "riskjusterad avkastning för de flesta."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Tre koncentrerad portfölj-fallstudier: Berkshire "
                "Hathaway, ForexBank-Knut och Wallenberg-sfären."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fall 1 — Berkshire Hathaway 1965-2024: "
                        "Buffetts portfölj har haft 40-60 procent i "
                        "topp 5 innehav (Apple, BofA, Amex, Chevron, "
                        "Coca-Cola). Årlig avkastning 19,8 procent vs "
                        "10,2 procent S&P 500 — 9,6 procent alpha "
                        "över 59 år. Hemligheten: dokumenterad "
                        "informational edge + behavioural discipline. "
                        "Lärdom: sann koncentration fungerar över "
                        "decennier om edge är äkta.\n\n"
        "Fall 2 — ForexBank-Knut 2021: Svensk fintech-aktie som föll "
        "90 procent på en månad efter Q3 2021-rapport missade "
        "guidance. Många svenska retail-investerare hade 30-50 procent "
        "av portföljen i Knut och förlorade hälften av kapitalet på 30 "
        "dagar. Detta var koncentration utan edge — investerare trodde "
        "de hade kunskap men hade bara bekräftelse-bias. Lärdom: "
        "koncentration kräver dokumenterad edge, inte bara bekräftelse-"
        "bias.\n\n"
        "Fall 3 — Wallenberg-sfären: Investor AB och Wallenberg-"
        "familjens privata portfölj har haft koncentration mot "
        "styrda bolag (ABB, Atlas Copco, AstraZeneca, Ericsson, "
        "SEB) i 100+ år. Årlig avkastning över 100 år: 13 procent vs "
        "11 procent för svensk index — modest alpha men mycket stabil. "
        "Hemligheten: styrelseposter ger sann informational edge. "
        "Lärdom: koncentration fungerar bäst när investeraren har "
        "strategisk kontroll eller insider-kunskap."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Gemensam nämnare: framgångsrika koncentrerade "
                        "portföljer (Berkshire, Wallenberg) bygger på "
                        "äkta informational edge över decennier; "
                        "misslyckade (Knut) bygger på bekräftelse-bias "
                        "utan dokumenterad kunskap."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Bekräftelse-bias: beteende-bias där investerare "
                        "söker information som bekräftar existerande "
                        "thesis och ignorerar motbevis — driver felaktig "
                        "koncentration."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mönstret visar att koncentration fungerar "
                        "endast med äkta edge. Buffett och Wallenberg "
                        "har decenniers dokumenterad prestation; Knut-"
                        "investerare saknade detta.\n\n"
                        "Lärdom för svensk retail-investerare: "
                        "koncentration är rätt strategi för få, men "
                        "fel för de flesta. AKM1 1.1-systemet ger "
                        "objektiv edge-score och rekommendation. Den "
                        "som inte når score 70 bör hålla sig till bred "
                        "indexfond — detta är inte \"gedigen\" utan "
                        "rational."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i koncentrerad portfölj kräver ärlig "
                "självbedömning av edge, disciplinerad riskkontroll "
                "och behavioural tålamod under drawdown."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den avancerade analytikern bygger "
                        "koncentrerad portfölj endast efter dokumenterad "
                        "edge-test: (1) 50+ timmar analys per aktie; (2) "
                        "kvartalsvis thesis-uppdatering; (3) \"pre-mortem\" "
                        "— tänk att aktien fallit 50 procent, vad "
                        "orsakade det?; (4) jämför din information med "
                        "marknadens — vad vet du som marknaden inte vet?\n\n"
        "Risk-kontroll ska vara multi-lager: (a) max 25 procent per "
        "enskild aktie; (b) max 50 procent i topp 3; (c) max 70 "
        "procent i enskild sektor; (d) 20 procent likvid för "
        "rebalansering; (e) \"stop-loss\" vid thesis-brott (ej pris-"
        "baserad).\n\n"
        "Slutligen förstår mästaren att koncentration är en \"life "
        "choice\" — det kräver tid, disciplin och psykologisk "
        "stabilitet. Den som inte kan ägna 100+ timmar per år åt "
        "portföljförvaltning bör välja bred indexfond — det är inte "
        "mindre intelligent, bara mer rational."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Sanna mästerskapet ligger i ärlig "
                        "självbedömning — om du inte kan dokumentera "
                        "edge, välj bred indexfond och fokusera på "
                        "sparande och avgifter."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Pre-mortem: mental teknik där investeraren "
                        "föreställer sig att investeringen misslyckats "
                        "och identifierar orsaker i förväg — eliminerar "
                        "bekräftelse-bias."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Mästerskap innebär slutligen att koncentration "
                        "är rätt val för få och fel val för många. "
                        "Buffett-citatet \"diversification is protection "
                        "against ignorance\" har ofta misstolkats — "
                        "Buffett menade att om du har edge ska du "
                        "koncentrera, men om du inte har edge ska du "
                        "diversifiera.\n\n"
                        "För svensk retail-investerare bör koncentration "
                        "endast övervägas om AKM1 edge-score överstiger "
                        "70. Annars är global indexfond (t.ex. Avanza "
                        "Global, Lannebo Global) med 0,1-0,5 procent "
                        "avgift det rationala valet — dokumenterat "
                        "bättre riskjusterad avkastning för 80-90 procent "
                        "av investerare."
                    ),
                },
            ],
        },
    ],
}

print("Loaded pc-11..pc-20, pf-09..pf-11")

