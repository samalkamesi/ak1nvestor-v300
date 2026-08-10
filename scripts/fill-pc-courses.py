#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fill-pc-courses.py

Generate tailored Swedish content for 10 "Praktiska Case" (PC) courses in
/home/z/my-project/public/deep-courses.json. For each PC slug the script
replaces the why, history, lynchSection, grahamSection, ak1Section and
chapter bodies (keeping existing num/minutes/title per chapter).

After completion each slug is appended to /home/z/my-project/.gen-progress.json
under the "done" array.
"""

import json
import os
from copy import deepcopy

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
COURSES_PATH = "/home/z/my-project/public/deep-courses.json"
PROGRESS_PATH = "/home/z/my-project/.gen-progress.json"

PC_SLUGS = [
    "pc-11-case-boliden",
    "pc-12-case-skf",
    "pc-13-case-ssab",
    "pc-14-case-electrolux",
    "pc-15-case-kambi",
    "pc-16-case-beijer-ref",
    "pc-17-case-sandvik",
    "pc-18-case-oresund",
    "pc-19-case-hoganas",
    "pc-20-case-essity",
]

# Forbidden phrases — guard against generic boilerplate
FORBIDDEN = [
    "Detta är en fundamentalsk färdighet",
    "Utan förståelse för detta ämne",
    "Vi börjar med grunderna",
    "ingår i kategorin",
]


def check_forbidden(text, slug):
    for phrase in FORBIDDEN:
        if phrase in text:
            raise ValueError(
                f"Forbidden phrase '{phrase}' found in content for {slug}"
            )


# ---------------------------------------------------------------------------
# CONTENT — tailored Swedish content per course
# ---------------------------------------------------------------------------
# Each entry has:
#   why            : string (2-3 sentences)
#   history        : {origin, evolution, modern} — each 3 sentences
#   lynchSection   : 2 sentences
#   grahamSection  : 2 sentences
#   ak1Section     : 2 sentences
#   chapters       : list of 6 dicts each with
#                    intro         : 1-2 sentences
#                    blocks        : [text, insight, definition, text]
# ---------------------------------------------------------------------------

CONTENT = {}

# ============================================================================
# 1. pc-11-case-boliden — Boliden
# ============================================================================
CONTENT["pc-11-case-boliden"] = {
    "why": (
        "Boliden är Skandinaviens största integrerade gruv- och smältverkskoncern och "
        "en av få svensklistade råvarubolag med direkt exponering mot koppar-, zink- "
        "och nickelpriserna. Aktien är noterad på Stockholmsbörsen sedan 1929 och "
        "ingår i OMXS30, vilket gör bolaget till en central råvarupost för svenska "
        "retail-investerare som vill förstå cyklisk intjäningskraft och "
        "vertikalintegreringens värde."
    ),
    "history": {
        "origin": (
            "Boliden grundades 1925 efter att guldfyndigheter upptäckts i Skelleftefältet "
            "av prospektorn Edvin Lindqvist och industriidén formades av affärsmannen "
            "Oscar Wehtje. Den första gruvan i Boliden utanför Skellefteå blev en av "
            "Europas rikaste guldfyndigheter under 1930-talet, och redan 1929 noterades "
            "bolaget på Stockholmsbörsen. Rönnskärsverken i Skelleftehamn uppfördes "
            "1930 för att smälta den komplexa sulfidmalmen och lade grunden till "
            "Bolidens dubbeltroll som både gruvarbetare och smältverk."
        ),
        "evolution": (
            "Efter kriget växte Boliden från svensk guldproducent till nordisk "
            "basmetalljätte genom förvärv av Garpenbergsgruvorna 1963 och en serie "
            "prospekteringsprojekt i Irland, Saudiarabien och Kanada under 1970-talet. "
            "Internationaliseringen accentuerades 1997 när det finländska smältverket "
            "Outokumpu Copper förvärvades och 2001 när kanadensiska Tara Mines i "
            "Irland lades till portföljen. 2003 förvärvades även Outokumpu Zinc i "
            "Kokkola, vilket gav bolaget en transatlantisk produktionsbas i tre "
            "länder och fyra smältverk."
        ),
        "modern": (
            "Idag leds Boliden av vd Mikael Staffas och omfattar sex gruvor i Sverige, "
            "Finland och Irland samt tre smältverk — Rönnskär, Harjavalta och Odda — "
            "med en omsättning kring 65 miljarder kronor. Strategin är inriktad på "
            "elektifieringens råvaror: koppar för kablarna och nickel för batterierna, "
            "vilket syns i 800 miljoner euro-investeringen i utbyggnaden av Odda-"
            "zinksmältverket i Norge. Rönnskär är dessutom en av få smältverk i "
            "världen som tar emot elektronikskrot som råvara och utvinner guld, silver "
            "och koppar ur kretskort, vilket gör Boliden till en strategisk länk i "
            "europeisk metallåtervinning."
        ),
    },
    "lynchSection": (
        "Peter Lynch skulle klassa Boliden som en renodlad cykelaktie där köptillfället "
        "styrs av var i konjunkturcykeln man befinner sig snarare än av bolagets "
        "långsiktiga kvalitet. Han skulle peka på att intjäningen kan svänga 3–4 gånger "
        "mellan botten och topp på en cykel och att investeraren måste förstå metallpriser "
        "och kapacitetsutnyttjande lika väl som ledningens disciplin."
    ),
    "grahamSection": (
        "Benjamin Graham skulle granska Bolidens substansvärde genom att nedjustera "
        "gruvorna till en konservativ metallprisskattning och kräva en betydande "
        "säkerhetsmarginal mot cykelbottnen. Han skulle särskilt varna för att bokfört "
        "värde på gruvtillgångar kan överdriva verkligt värde om produktionskostnaderna "
        "stiger eller om miljöåtaganden — som Rönnskärs sanering — underskattas."
    ),
    "ak1Section": (
        "AKM1-metoden bryter ner Boliden i produktionsvolymer per metall, "
        "raffinaderimarginaler och cykeljusterat kassaflöde snarare än rapporterat "
        "EBIT, vilket synliggör vilken del av intjäningen som är strukturell och vilken "
        "som är konjunkturpremie. Genom att spåra V03 (intäktsdiversifiering per metall) "
        "och V14 (kassaflödeskvalitet) kan investeraren skilja en cykeltopp från en "
        "varaktig värdeskapande vändning."
    ),
    "chapters": [
        {
            "intro": (
                "Boliden är Skandinaviens största integrerade gruv- och smältverkskoncern, "
                "och en grundlig förståelse av bolaget kräver insikt i hur gruvdrift, "
                "smältmetallurgi och metallpriser samspelar."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Bolidens verksamhet är organiserad i två huvudsegment — Gruvor "
                        "(Mineral) och Smältverk (Smelting) — där sex gruvor i Sverige "
                        "(Aitik, Bolidenområdet, Garpenberg), Finland (Kevitsa, Kylylahti) "
                        "och Irland (Tara) förser tre smältverk med malm. Aitik utanför "
                        "Gällivare är Europas största koppargruva och producerar årligen "
                        "över 36 miljoner ton malm, medan Rönnskär i Skelleftehamn är en "
                        "av få smältverk i världen som kan ta emot elektronikskrot som "
                        "råvara och därmed utgör en strategisk länk i europeisk "
                        "metallåtervinning. Mellan dessa poler — malmbrytning och "
                        "metallraffinering — skapar Boliden en värdekedja som är ovanligt "
                        "vertikalintegrerad för en europeisk gruvarbetare.\n\n"
                        "Cyklisk intjäningskraft är en strukturell egenskap hos bolaget, "
                        "där EBITDA-marginalen kan svänga mellan 10 och 35 procent på "
                        "fyra år. Tre metaller svarar för över 80 procent av intäkterna: "
                        "koppar, zink och nickel — där koppar är marginalmotorn, zink "
                        "volymen och nickel tillväxtchansen. Substansvärdet förändras "
                        "därför snabbt med både produktionsvolym och spotpriser, och den "
                        "som vill förstå bolaget måste kombinera metallprognos, "
                        "metallmarknadsutveckling och kapacitetsutnyttjande i en gemensam "
                        "bild.\n\n"
                        "Bolidens placering i svenska investerares portföljer är ofta som "
                        "råvaruexponering: bolaget är den enda stora nordiska gruvarbetaren "
                        "med bred flytande aktie och direkt influence från både svenska och "
                        "internationella metallpriser. Aktien ingår i OMXS30 och därmed i "
                        "många indexfonder, vilket ger bolaget en makro-position i "
                        "svenskarnas pensionssparande som få andra svensklistade bolag har."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Bolidens unika värde ligger i vertikalintegreringen mellan gruvor "
                        "och smältverk, som skapar en naturlig hedge mot "
                        "råvaruprisfluktuationer men också koncentrerar riskerna till tre "
                        "fysiska anläggningar."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Vertikalintegrering i gruvdrift innebär att ett bolag kontrollerar "
                        "hela kedjan från malmbrytning till färdig metall, vilket kan jämna "
                        "ut kassaflöden över tid men binder kapital i "
                        "produktionsanläggningar."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Bolidens kassaflödesprofil har historiskt varit mer stabil än vad "
                        "cykelvolatilitet i intäkterna antyder, eftersom smältverken kan "
                        "köpa in tredjepartsråvaror och därmed upprätthålla produktion "
                        "även när egna gruvor har lägre volym. Detta gör bolaget till en "
                        "intressant “compounder” i råvarusegmentet — en sällsynt "
                        "kombination där skalfördelar och teknisk integration ger bättre "
                        "avkastning på sysselsatt kapital än rena gruvbolag. Samtidigt är "
                        "kapitalbehovet stort: Aitik-utbyggnaden 2010 kostade 6 miljarder "
                        "kronor och Odda-utbyggnaden 2024 beräknas kosta 800 miljoner euro, "
                        "vilket illustrerar att cykelintjäningskraften måste fördelas över "
                        "långsiktiga investeringsprogram.\n\n"
                        "Ett viktigt uttryck för Bolidens strategiska position är att "
                        "bolaget sedan 2019 har levererat nickel och kobolt till "
                        "batteritillverkare inom Europeiska unionens strategiska "
                        "råvaru-projekt. Därmed är bolaget inte enbart exponerat mot "
                        "traditionell byggnads- och infrastrukturcykeln utan även mot "
                        "elektrifieringen, vilket breddar och delvis förändrar "
                        "cykelprofilen. För investeraren innebär detta att den historiska "
                        "korrelationen mot kinesisk industriproduktion gradvis kompletteras "
                        "med en ny länk mot europeisk fordonsindustri."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Att analysera Boliden i praktiken kräver en kombination av "
                "metallprismodeller, produktionsvolymprognoser och kassaflödesdiskontering "
                "som få andra svenska bolag kräver."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Praktisk Boliden-analys börjar med att bygga en "
                        "produktionsprognos för varje gruva baserad på Bolidens "
                        "kvartalsvisa produktionsrapporter och de guidade volymmål som "
                        "ledningen publicerar vid Capital Markets Day. Varje gruva har "
                        "unika kostnadskurvor — Aitik har låga kostnader tack vare "
                        "skalfördelar, Tara i Irland har höga kostnader och har stängts "
                        "2023–2024, och Kevitsa i Finland har god marginal på "
                        "nickel-koppar. Genom att multiplicera volym med antaget metallpris "
                        "och dra av C1-kostnad får investeraren en cash-cost-baserad "
                        "bruttovinst per metall som kan summeras till en segment-Ebit.\n\n"
                        "Nästa steg är att modellera smältverksmarginaler, som är mindre "
                        "cykliska och mer beroende av behandlingsavgifter (TC/RC) för "
                        "koncentrat. Rönnskär har historiskt haft en EBITDA-marginal på "
                        "15–20 procent tack vare elektronikskrot, Harjavalta är mer "
                        "känsligt för nickelpriset och Odda är under utbyggnad för att "
                        "fördubbla kapaciteten. Slutligen justeras resultaten för "
                        "cykelgenomsnitt över 7–10 år — inte bara det senaste året — annars "
                        "blir värderingen missvisande cyklisk.\n\n"
                        "Det är också kritiskt att separera valutaeffekter (USD-prisade "
                        "metaller, EUR-kostnader och SEK-rapportering) från organiska "
                        "volym- och prisrörelser. Boliden rapporterar i SEK men handlar "
                        "sina produkter i USD, vilket innebär att en svag krona historiskt "
                        "har översatt till högre SEK-intäkter utan att för den skull öka "
                        "bolagets konkurrenskraft."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Boliden-analys handlar mindre om vinstmultipel och mer om "
                        "volym × pris × kostnad per anläggning — en bottom-up-metodik som "
                        "få andra svenska börsbolag kräver i samma utsträckning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "C1-kostnad (cash cost) i gruvdrift är summan av direkta "
                        "produktionskostnader per ton malm eller pund metall, exklusive "
                        "kapitalkostnader, avskrivningar och finansiella kostnader."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En praktisk check-modell är att beräkna Bolidens kassaflöde per "
                        "ton malm och jämföra över tid för att identifiera om "
                        "lönsamhetens ökning beror på pris, volym eller kostnadseffektivitet. "
                        "Om volymen sjunker samtidigt som kassaflödet ökar beror det "
                        "troligen på metallpriser, vilket indikerar en mer flyktig "
                        "vinstökning. Om kostnaderna minskar samtidigt som volymen är "
                        "stabil handlar det om operationell effektivitet, vilket är en mer "
                        "varaktig värdeskapande källa.\n\n"
                        "Investor-relaterad information i Bolidens kvartalsrapporter är "
                        "ovanligt transparent jämfört med internationella gruvkollegor: "
                        "varje gruva presenteras med volym, kostnad och EBIT, vilket "
                        "möjliggör en kvalificerad jämförelse mellan dotterbolag. Detta "
                        "gör Boliden till ett av de mest analyserbara svensklistade "
                        "råvarubolagen och en utmärkt lärobok i bottom-up-modellering för "
                        "retail-investerare som vill förstå hur man bryter ner en koncern "
                        "till sina fysiska beståndsdelar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Boliden-analys innehåller flera frekventa fallgropar som kan leda till "
                "felaktiga slutsatser om bolagets värde och riskprofil."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att extrapolera toppcykel-EBITDA och "
                        "köpa bolaget till en låg toppcykelmultipel som verkar attraktiv "
                        "men egentligen döljer en snabb vinstkollaps. Mellan 2007 och 2009 "
                        "föll Bolidens rörelseresultat med 80 procent på grund av "
                        "kombinationen av fallande kopparpriser och finansiell kris, "
                        "trots att bolaget var “billigt” på toppmultipel. Investera alltid "
                        "med en normaliserad intjäningsbild baserad på genomsnitt över "
                        "7–10 års cykel snarare än det senaste rullande året.\n\n"
                        "En annan vanlig fälla är att förbise skillnaden mellan bekräftade "
                        "reserver och resurser. Bolidens reserver räcker för cirka 25–30 "
                        "års produktion, men det inkluderar endast de fyndigheter som kan "
                        "brytas lönsamt vid antagna framtida metallpriser. Om priserna "
                        "faller kan reserver skrivas ner dramatiskt, vilket i värsta fall "
                        "leder till nedskrivningar på gruvanläggningar — ett fenomen som "
                        "drabbade bolaget 2015 när zinkpriset rasade.\n\n"
                        "Tredje fällan är att förbise miljöåtaganden och "
                        "saneringskostnader, som kan uppgå till flera miljarder kronor per "
                        "anläggning över en 30-årsperiod. Rönnskär och Aitik har båda "
                        "betydande framtida åtaganden som bokförs som långfristiga skulder "
                        "men som kan accelerera om nya miljökrav införs."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Tre klassiska Boliden-fällor är toppcykelextrapolering, "
                        "missförstånd om reserver vs resurser och underskattning av "
                        "miljöåtaganden — alla tre har historiskt kostat investerare stora "
                        "belopp."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Cykelextrapolering är felet att projicera en aktuell hög eller låg "
                        "vinstnivå framåt i tiden utan att beakta genomsnittet över en hel "
                        "konjunkturcykel."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En subtilare fälla är att förväxla bolagets rapporterade EBITA med "
                        "kassaflöde från drift, eftersom stora avskrivningar på gruvor och "
                        "smältverk utgör en betydande icke-kostnad. Bolidens kassaflöde är "
                        "typiskt 1,5–2 gånger EBITA, vilket gör att investerare som "
                        "fokuserar på vinstmultipel underskattar kassaflödesvärderingen. "
                        "Detta är särskilt viktigt vid bud-värderingar där "
                        "kassaflödesdiskontering är standardmetod.\n\n"
                        "Slutligen är politisk risk i Irland (Tara Mines), Finland "
                        "(Kevitsa) och Norge (Odda) ofta underskattad. Tara Mines stängdes "
                        "2023 på grund av låga zinkpriser och höga energikostnader, vilket "
                        "visar hur enskilda anläggningar kan förlora pengar även när "
                        "koncernen är lönsam. Investera aldrig i Boliden utan att först "
                        "förstå vilka anläggningar som är kritiska för intjäningen och "
                        "vilka som kan stängas vid cykelbotten."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-ramverket ger en strukturerad metodik för att bryta ner Boliden "
                "i 20 kvantitativa och kvalitativa variabler som var och en belyser en "
                "specifik aspekt av bolagets hälsa."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V01 (försäljningstillväxt) appliceras på Boliden genom att "
                        "separera volymtillväxt (nya gruvor, utbyggnad av Odda) från "
                        "pristillväxt (metallpriser) och valutaeffekter (USD vs SEK). "
                        "Bolagets underliggande organiska volymtillväxt är typiskt 2–4 "
                        "procent per år, medan rapporterad försäljningstillväxt kan svänga "
                        "mellan −10 och +30 procent på grund av pris- och valutaeffekter. "
                        "AKM1-metoden premierar volymtillväxt som mer varaktig än "
                        "pristillväxt, vilket är särskilt viktigt för cykliska "
                        "råvarubolag.\n\n"
                        "V03 (intäktsdiversifiering) är central för Boliden eftersom "
                        "bolaget har både produktdiversifiering (koppar, zink, nickel, "
                        "bly, guld, silver) och geografisk diversifiering (Sverige ca 50 "
                        "procent, Finland 25 procent, Irland och Norge 25 procent). Hög "
                        "diversifiering motverkar risken för enskilda anläggningar och "
                        "jämnar ut cykeln — men sänker också uppsidan vid metallpristoppar "
                        "eftersom bolaget saknar renodlad exponering mot en enskild metall.\n\n"
                        "V14 (kassaflödeskvalitet) är avgörande för Boliden eftersom "
                        "koncernens kassaflöde är mindre cykliskt än EBITDA. AKM1-metoden "
                        "beräknar kassaflödeskapacitet som ett genomsnitt över 7–10 år och "
                        "använder detta som grund för värderingen snarare än punktvärden, "
                        "vilket reducerar risken för att cykeltoppar överdrivs."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 gör Boliden-analys till en disciplinerad övning i att "
                        "separera strukturell från cyklisk intjäningskraft, där de 20 "
                        "variablerna fungerar som checklista för att undvika "
                        "toppcykel-fällor."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "AKM1 1.1 är en 20-variablers analysmodell som täcker "
                        "försäljningstillväxt, vinstkvalitet, balansräkningshälsa, "
                        "kapitalallokering och cykelrisk i en integrerad "
                        "värderingsprocess."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "V16 (kapacitetsutnyttjande) är en unik variabel för Boliden som "
                        "mäter hur väl bolagets smältverk och gruvor utnyttjas, vilket är "
                        "en direkt indikator på framtida vinstutrymme. När Aitik utnyttjas "
                        "till 95 procent och Tara är stängd är den konsoliderade "
                        "kapacitetsutnyttjandet omkring 80 procent, vilket är lågt och "
                        "indikerar vinstpotential vid återgång till full produktion.\n\n"
                        "V19 (emissionsrisk) är låg för Boliden eftersom bolaget genererar "
                        "positivt kassaflöde även i cykelbottnar och har en solid "
                        "balansräkning med nettoskuld/EBITDA under 1x. V20 "
                        "(återköpsdisciplin) är också tydlig — bolaget har återköpt aktier "
                        "kontinuerligt sedan 2015 och delar ut cirka 50 procent av "
                        "kassaflödet. Dessa två variabler tillsammans indikerar att Boliden "
                        "är en compounder inom cykliska råvaror — en sällsynt kombination "
                        "som motiverar en premiummultipel gentemot andra gruvbolag."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Genom konkreta fallstudier av Bolidens historiska prövningar blir det "
                "tydligt hur principerna omsätts i praktiken och vilka lärdomar som kan "
                "dras."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Aitik-utbyggnaden 2010. Boliden investerade 6 "
                        "miljarder kronor i att utöka Aitik från 18 till 36 miljoner ton "
                        "malm per år, vilket var en av de största enskilda svenska "
                        "gruvinvesteringarna i modern tid. Ett år efter igångkörning rasade "
                        "kopparpriset med 35 procent och investeringen syntes inte i "
                        "resultatet, vilket pressade aktien till botten. Investerare som såg "
                        "igenom cykeln och förstod att utbyggnaden sänkt C1-kostnaden från "
                        "0,80 till 0,55 dollar per pund fick en fyrdubbel avkastning på fem "
                        "år när cykeln vände.\n\n"
                        "Fallstudie 2 — Kevitsa-förvärvet 2016. Boliden betalade 712 "
                        "miljoner dollar för nickel-koppar-gruvan Kevitsa i Finland från "
                        "First Quantum. Marknaden var skeptisk till priset men förvärvet "
                        "kompletterade Harjavalta-smältverket och möjliggjorde synergier "
                        "på 50–100 miljoner euro per år. Inom tre år var Kevitsa integrerat "
                        "och Harjavalta-smältverket gick från förlust till vinst — ett "
                        "exempel på hur vertikalintegrering kan skapa värde som renodlade "
                        "gruvbolag inte kan uppnå.\n\n"
                        "Fallstudie 3 — Tara Mines-stängningen 2023. När zinkpriset föll "
                        "under 2 400 dollar per ton och europeiska energipriser sköt i "
                        "höjden stängde Boliden sin irländska zinkgruva Tara och placerade "
                        "700 anställda på tillfällig permittering. Detta reducerade "
                        "koncernens zinkproduktion med 15 procent men sparade 100 miljoner "
                        "kronor per månad i förluster. Beslutet var kontroversiellt i "
                        "Irland men kapitalmarknaden belönade disciplinen genom en "
                        "aktieuppgång på 12 procent under de följande tre månaderna."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Bolidens tre mest lärorika fallstudier visar att institutionell "
                        "disciplin vid stora investeringar, integrationer och "
                        "nedläggningar är en avgörande skillnad mellan bolag som överlever "
                        "cykler och de som förstörs av dem."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "C1-kostnad (cash cost) i gruvdrift mäter de direkta "
                        "produktionskostnaderna per enhet metall, exklusive kapital och "
                        "finansiering, och är den viktigaste jämförbara "
                        "kostnadsparametern mellan gruvor."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 4 — Rönnskär elektronikåtervinning. Rönnskär är en av "
                        "få smältverk i världen som tar emot elektronikskrot som råvara "
                        "och utvinner koppar, guld och silver ur kretskort. År 2022 "
                        "hanterade Rönnskär 120 000 ton elektronikskrot och utvann därmed "
                        "3 ton guld, 25 ton silver och 80 000 ton koppar — vilket "
                        "motsvarar värdet av flera mindre guldgruvor. Denna verksamhet har "
                        "vuxit i takt med EU:s direktiv om elektronikåtervinning och "
                        "erbjuder en mer cykelokänslig intäktskälla än primär "
                        "malmbrytning.\n\n"
                        "Slutsatsen från fallstudierna är att Boliden analyseras bäst "
                        "genom att separera stora investeringsbeslut (Aitik-utbyggnad, "
                        "Kevitsa-förvärv), operativa beslut i cykelbottnar "
                        "(Tara-stängning) och strategiska positioneringar (Rönnskär "
                        "elektronikåtervinning). Var och en av dessa kategorier kräver "
                        "olika analysmetoder och har olika tidsramar — ett bemästrandet som "
                        "skiljer en professionell Boliden-investerare från en som bara "
                        "följer kopparpriset."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i Boliden-analys innebär att gå bortom standardmodeller och "
                "integrera råvarumarknadens dynamik, teknikskiften och kapitalcykeln i en "
                "sammanhängande investmenttes."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Mästerskap i Boliden-analys kräver tre förmågor utöver "
                        "grundläggande fundamental analys. För det första måste investeraren "
                        "bygga en egen metallprismodell som kombinerar efterfrågan (kinesisk "
                        "infrastruktur, europeisk fordonsindustri, elektrifiering) med "
                        "utbud (nya gruvor, kapacitetsnedläggningar) och lager (LME-lager, "
                        "SHFE-lager). Denna modell bör uppdateras kvartalsvis och "
                        "jämföras med konsensusprognoser från Wood Mackenzie och CRU.\n\n"
                        "För det andra måste investeraren förstå teknologiska skiften som "
                        "kan påverka Bolidens konkurrenskraft — elektrifiering ökar "
                        "efterfrågan på koppar och nickel, cirkulär ekonomi gynnar Rönnskärs "
                        "elektronikåtervinning och kolfri stålproduktion (HYBRIT) kan minska "
                        "efterfrågan på specialkoks. Varje skifte har olika tidsram och "
                        "olika impact på de enskilda anläggningarna.\n\n"
                        "För det tredje måste investeraren integrera kapitalcykeln: Boliden "
                        "har tre pågående stora investeringsprogram (Odda-utbyggnad, "
                        "Aitik-sänkning av cut-off, Sumitomo Metal Mining-partnerskap) som "
                        "binder kapital 2024–2027 och därefter frigör kassaflöde. "
                        "Förståelse för dessa program är avgörande för att bedöma när "
                        "kassaflödet kommer att växa och därmed när aktien bör värderas "
                        "som compounder snarare än cykelaktie."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Boliden-mästerskap kräver att investeraren kombinerar "
                        "råvarumarknadsmodellering, teknikskiften och "
                        "kapitalcykelanalys i en enda sammanhängande investmenttes — en "
                        "kombination som få aktieanalytiker behärskar."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Kapitalcykeln i gruvdrift är ett mönster där stora investeringar "
                        "binder kapital under 3–5 års byggperiod och sedan frigör "
                        "kassaflöde under 10–20 års produktionsperiod, vilket skapar en "
                        "inneboende cykel i kapitalavkastningen."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En slutgiltig dimension av mästerskap är att förstå Bolidens roll "
                        "i en svensk portfölj — bolaget är ofta den enda exponeringen mot "
                        "cykliska råvaror och därför en hedge mot inflation och geopolitisk "
                        "risk. I portföljsammanhang kan Boliden fylla en “real "
                        "asset”-funktion som kompletterar mer defensiva innehav som Atlas "
                        "Copco och AstraZeneca, men volatiliteten kräver rätt position "
                        "sizing och tålamod under cykelbottnar.\n\n"
                        "Investerare som bemästrar Boliden-analys kan ofta identifiera "
                        "vändningar 6–12 månader innan konsensus, eftersom indikatorer som "
                        "LME-lager, treatment charges och kinesisk orderbok rör sig innan "
                        "de visar sig i rapporter. Denna förmåga är särskilt värdefull i "
                        "Sverige där få retail-investerare har råvaruexpertis och därmed en "
                        "competitive edge kan skapas genom gedigen bottom-up-analys."
                    ),
                },
            ],
        },
    ],
}

# ============================================================================
# 2. pc-12-case-skf — SKF
# ============================================================================
CONTENT["pc-12-case-skf"] = {
    "why": (
        "SKF är Sveriges äldsta tillverkande industribolag av global rang och dominerar "
        "världsmarknaden för lager med drygt 20 procent marknadsandel — en position som "
        "gör det till en direkt indikator på global industriell kapacitetsutnyttjande. "
        "Bolaget är noterat på Stockholmsbörsen sedan 1910 och ingår i OMXS30 samt "
        "många svenska indexfonder, vilket innebär att praktiskt taget varje svensk "
        "aktiesparare har exponering. En fallstudie av SKF ger retail-investeraren en "
        "institutionell förståelse för moat-mekaniken i en bransch där ingenjörskunnande, "
        "kvalitet och global service snarare än pris avgör vem som vinner."
    ),
    "history": {
        "origin": (
            "SKF — Svenska Kullagerfabriken — grundades i Göteborg 1907 av ingenjören "
            "Sven Wingquist, som samma år patenterade det sfäriska rullagret efter att ha "
            "upplevt hur ofta drivaxlar i textilfabriker gick sönder. Bolaget expanderade "
            "explosionsartat och hade redan 1911 dotterbolag i 32 länder, däribland Volvo "
            "som bildades 1915 som ett SKF-dotterbolag för att tillverka kullager till "
            "bilindustrin. Aktien noterades på Stockholmsbörsen redan 1910 och blev "
            "snabbt en av de mest omsatta industriaktierna."
        ),
        "evolution": (
            "Genom hela 1900-talet utvecklades SKF från en lagentillverkare till en "
            "helhetsleverantör av lager, tätningar, smörjsystem och tillståndsövervakning, "
            "ofta genom strategiska förvärv som GKN:s lagerdivision 1985 och amerikanska "
            "Kaydon 2013. Bolaget genomgick en djup kris i början av 1990-talet efter att "
            "ha ignorerat japanska och tyska konkurrenters kvalitetslyft, vilket tvingade "
            "fram en omfattande kulturförändring och stängning av 30 procent av "
            "produktionen. Efter år 2000 digitaliserades verksamheten med sensorförsedda "
            "lager och förutsägande underhåll som strategiska satsningar."
        ),
        "modern": (
            "Idag är SKF verksamt i över 40 länder med ungefär 17 000 distributörer och "
            "en omsättning kring 90 miljarder kronor under vd Rickard Gustafson (tillträdde "
            "2021, tidigare vd för SAS). Strategin “Decarbonisation” innebär en omläggning "
            "mot lager med lägre friktion och lägre energiförbrukning, vilket positionerar "
            "SKF som en möjlig vinnare i elektrifieringen av transportsektorn. Bolaget "
            "delar in verksamheten i tre segment — Industrial, Automotive och Aerospace — "
            "där industrisegmentet svarar för den högsta marginalen och den tyngsta "
            "viktningen."
        ),
    },
    "lynchSection": (
        "Peter Lynch skulle känna igen SKF som en “dividend achiever” med över 80 år av "
        "obruten utdelning och ett av Wallenbergsfärens kärninnehav — en typisk “stalwart” "
        "som kan köpas när cykeln är nedtryckt och säljas när orderboken vänder. Han skulle "
        "dock varna för att industriaktier är just cykelaktier, och att “long term” för SKF "
        "innebär att man förstår var i fyraårs-rotationen man befinner sig."
    ),
    "grahamSection": (
        "Benjamin Graham skulle uppskatta SKF:s låga skuldsättning, starka balansräkning "
        "och stabila utdelningshistorik, men han skulle noggrant justera ner intjäningen "
        "till en cykelgenomsnittsnivå innan han beräknade vinstmultipeln. Han skulle också "
        "granska hur mycket av vinsten som kommer från underhåll och service — de mer "
        "cykelokänsliga intäkterna — jämfört med nyförsäljning, eftersom det förklarar "
        "bolagets riskprofil."
    ),
    "ak1Section": (
        "AKM1-metoden granskar SKF genom segmentmarginaler, orderboksutveckling och "
        "lokal valutaintjäningspolarisering snarare än konsoliderad omsättning, vilket "
        "blottar att största vinstpotentialet ligger i mixen mot aftermarket. Genom att "
        "applicera V12 (moat-stabilitet) och V20 (återköpsdisciplin) kan investeraren "
        "bedöma om ledningen allokerar kapital klokt genom neddelningar och återköp under "
        "cykeldippar."
    ),
    "chapters": [
        {
            "intro": (
                "SKF är en av Sveriges äldsta globala industrijättar och en djupgående "
                "förståelse av bolaget kräver kunskap om både lagerindustrins struktur och "
                "SKF:s unika position inom denna."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SKF är organiserat i tre segment — Industrial (ca 60 procent av "
                        "intäkterna), Automotive (ca 30 procent) och Aerospace (ca 10 "
                        "procent) — där varje segment har distinkta konkurrensfaktorer. "
                        "Industrial-segmentet säljer premiumlager till"
                        " processtillverkare, gruvor och stålverk där stilleståndskostnader "
                        "motiverar premiumpriser, och där SKF Coromant-liknande "
                        "teknisk-support är en del av erbjudandet. Automotive-segmentet är "
                        "mer prispressat eftersom bilindustrin har konkurrens från "
                        "asiatiska duktiga leverantörer som NSK, NTN och Schaeffler, "
                        "vilket pressar marginalerna mot 5–8 procent jämfört med Industrial "
                        "20–25 procent.\n\n"
                        "Lagerindustrin är strukturellt attraktiv eftersom lager är en "
                        "liten men kritisk komponent i maskiner vars stilleståndskostnader "
                        " överstiger hundratalet gånger priset på lagret. Detta ger SKF "
                        "prisningsmakt gentemot kunder som bara köper volymer till nya "
                        "maskiner — och en ännu starkare position i aftermarket, där "
                        "ersättningslager köps utanför nyinvestering-cykeln. Eftermarknaden "
                        "utgör ungefär 60 procent av omsättningen men en högre andel av "
                        "vinsten, vilket gör SKF till ett service-bolag förpackat som "
                        "komponent-tillverkare.\n\n"
                        "SKF är noterat på Stockholmsbörsen sedan 1910 och är en av "
                        "OMXS30:s äldsta medlemmar med en marknadsvärde över 80 miljarder "
                        "kronor. Investor AB (Wallenbergsfären) är genom röststyrka "
                        "största ägaren med cirka 28 procent av rösterna, vilket ger "
                        "bolaget en stabil ägarstruktur och en långsiktig kapitalallokering "
                        "som skiljer SKF från mer kortsiktiga industrikoncerner."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SKF:s verkliga moat ligger i kombinationen av global "
                        "service-nätverk, kvalitetspremium och teknisk support — en mix som "
                        "skapar en kundrelation som går långt bortom själva "
                        "lager-komponenten."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Aftermarket i industriell kontext avser försäljning av "
                        "ersättningskomponenter och service till redan installerade "
                        "maskiner, vanligtvis med högre marginal än nyförsäljning."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "SKF har genomgått flera stora omvandlingar under 2000-talet, "
                        "varav den senaste under Rickard Gustafson syftar till att ta bort "
                        "10 000 anställda och 25 procent av produktionsnätverket under "
                        "2024–2026. Syftet är att frigöra 3 miljarder kronor i årliga "
                        "kostnadsbesparingar och möjliggöra en återgång till dubbel-siffrig "
                        "EBIT-marginal. Detta är en fortsättning på tidigare omstrukturering "
                        "under tidigare vd:s Thomgren och Tenenbaum, vilket visar att "
                        "SKF kontinuerligt måste anpassa sig till global prispress.\n\n"
                        "Ett strategiskt fokus är elfordonsoptimering, där SKF utvecklar "
                        "lager med lägre friktion för att förlänga räckvidden i elbilar. "
                        "Detta är en intressant paradox — övergången från förbränningsmotor "
                        "till elmotor minskar antalet lager per bil från cirka 200 till 80, "
                        "men värdet per lager ökar eftersom premiumlager krävs för höga "
                        "varvtal. SKF bedömer att netto-effekten på Automotive-segmentet är "
                        "liten över en 10-årsperiod, men att positioneringen som premium-"
                        "leverantör till elfordon är avgörande för att behålla "
                        "marknadsandelar."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Att analysera SKF i praktiken kräver förståelse för segmentmarginaler, "
                "orderbokscykler och hur valutor påverkar en globalt diversifierad "
                "verksamhet."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Praktisk SKF-analys börjar med att bryta ner koncernen i tre "
                        "segment och följa varje segments organiska tillväxt, marginal och "
                        "orderbok separat. Industrial-segmentets orderbok är ledande för "
                        "den industriella investeringscykeln med 3–6 månaders fördröjning "
                        "mot amerikansk ISM-PMI, medan Automotive-segmentet styrs av "
                        "bilförsäljning i Europa, Kina och Nordamerika. Ett praktiskt verktyg "
                        "är att bygga en ”SKF-täthetsmodell” som kombinerar orderbok med "
                        "leveransintervaller för att förutse kvartalsvisa volymrörelser.\n\n"
                        "Valuta är central i SKF-analys eftersom bolaget säljer i över 40 "
                        "valutor men rapporterar i SEK. Huvuddelen av produktionen sker i "
                        "Europa (Sverige, Tyskland, Italien) medan stora marknader finns i "
                        "Nordamerika och Kina. SKF tillämpar löpande valutahedging över "
                        "12 månader, vilket innebär att rapporterad intjäning fördröjs "
                        "mot valutautveckling. Vid en bestående EUR/SEK-förändring på 5 "
                        "procent tar det 4–6 kvartal innan full effekt syns i EBIT.\n\n"
                        "En viktig bedömning är hur mycket av SKF:s intjäning som är "
                        "cyklisk (nya maskiner) respektive strukturell (ersättningslager "
                        "och service). Bolaget självt uppger att ungefär 60 procent av "
                        "intäkterna kommer från aftermarket, vilket indikerar att "
                        "bottom-cykel-EBIT borde vara högre än vad rent investerings-"
                        "cykliska bolag uppvisar. Historiskt har SKF i cykelbotten 2009, "
                        "2015 och 2020 visat en EBIT-marginal på 7–9 procent — klart högre "
                        "än rena komponenttillverkare på 3–5 procent."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SKF-analys handlar om att identifiera vid vilken orderboksnivå "
                        "marginalen slår igenom 12 procent — den punkt där bolaget "
                        "historiskt har övergått från “cykelvinst” till “strukturlön”."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Orderbok i industriell kontext är värdet av kontrakterade men "
                        "ännu inte levererade beställningar, och utgör en ledande "
                        "indikator för framtida intäktsrekognition."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "SKF publicerar kvartalsvis en detaljerad orderboken med både "
                        "organisk volym, pris och valuta-effekter separerade, vilket gör "
                        "bolaget till en av de mest transparenta industrikoncernerna i "
                        "Europa. Investerare kan därmed bygga en kvalificerad "
                        "intjäningsprognos baserad på ledande orderbok, capacities-"
                        "utnyttjande och R&D-investeringar. Ett vanligt misstag är att "
                        "fokusera på konsoliderad omsättningstillväxt snarare än "
                        "organisk, vilket döljer den underliggande efterfrågan bakom "
                        "valuta-effekter.\n\n"
                        "En unik dimension av SKF-analys är förmågan att kombinera "
                        "kvartalsrapporterna med externa data från amerikanska ISM-PMI, "
                        "europeiska Ifo-index och kinesisk PMI. SKF:s orderbok för "
                        "Industrial-segmentet har historiskt korrelerat 0,7 med global "
                        "PMI, vilket ger en möjlighet att validera eller justera ledningens "
                        "guider. Investerare som behärskar denna metodik kan ofta förutse "
                        "vändningar 1–2 kvartal före konsensus."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Flera vanliga fallgropar kan leda investerare att dra felaktiga "
                "slutsatser om SKF:s värde och riskprofil."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att förväxla rapporterad vinst med "
                        "strukturell intjäningsförmåga, eftersom SKF historiskt har visat "
                        "marginaler från 6 procent (2009) till 16 procent (2017) på bara "
                        "några år. En investerare som köper på 8x toppcykel-EPS hamnar "
                        "faktiskt på 16x cykelgenomsnitt, vilket dramatiskt skiftar "
                        "risk/bild. Använd alltid en 7–10 års genomsnittlig EBIT-marginal "
                        "(typiskt 11–12 procent för SKF) som grund för värderingen.\n\n"
                        "En annan fälla är att förbise pensionsåtaganden, som utgör en "
                        "betydande balansräkningspost för SKF med tusentals pensionerade "
                        "anställda från svensk och europeisk industri. Diskonteringsräntan "
                        "på dessa åtaganden påverkar resultatet via pensionskostnaden — "
                        "fallande räntor ökar åtagandena och vice versa. Under 2020–2022 "
                        "sjönk SKF:s pensionsåtagande från 18 till 12 miljarder kronor "
                        "enbart genom räntestegringar, vilket ökade rapporterad vinst "
                        "utan att bolaget var bättre.\n\n"
                        "Tredje fällan är att förbise vikten av Automotive-segmentet i "
                        "cykeltoppar. När bilförsäljningen ökar kraftigt kan "
                        "Automotive-marginalen stiga från 5 till 10 procent, vilket ger "
                        "en oproportionerligt stor vinstökning i absoluta tal. Om "
                        "investor extrapolerar denna ökning framåt överskattas SKF:s "
                        "intjäningsförmåga, eftersom Automotive-segmentet historiskt "
                        "återgår till 5–7 procent marginal när cykeln vänder."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Tre SKF-fällor är toppcykel-extrapolering, missförstånd om "
                        "pensionsåtagandens räntekänslighet och övertro på "
                        "Automotive-marginaler — alla tre har historiskt kostat "
                        "investerare betydande avkastning."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Pensionsåtagande är en balansräkningspost som representerar "
                        "nuvärdet av framtida pensionutbetalningar till anställda, "
                        "beräknad med en teknisk diskonteringsränta."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En subtilare fälla är att förväxla SKF:s R&D-investeringar med "
                        "kostnader, eftersom bolaget årligen investerar 5 procent av "
                        "omsättningen i forskning och utveckling. Om dessa kostnader "
                        "kapitaliseras ökar vinsten kortsiktigt, men avskrivningarna "
                        "kommer senare. SKF har en sund policy att kostnadsföra all "
                        "närliggande R&D, vilket gör att rapporterad vinst är konservativ "
                        "men också att bolaget inte kan öka vinsten genom "
                        "kapitaliserings-policy.\n\n"
                        "Slutligen är Automotive-segmentets konkurrenssituation en "
                        "underskattad risk: Schaeffler (Tyskland), NSK (Japan) och NTN "
                        "(Japan) är aggresiva på prissättning och har vunnit marknadsandelar "
                        "i Europa under 2010-talet. SKF:s Automotive-marginal har fallit "
                        "från 8 procent 2010 till 5 procent 2023, vilket indikerar en "
                        "strukturell press som inte är cykelbetingad. Investerare måste "
                        "skilja cyklisk marginaltryck från strukturell och undvika att köpa "
                        "SKF enbart för en Automotive-återhämtning."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-ramverket ger en disciplinerad metod för att värdera SKF genom "
                "20 kvantitativa och kvalitativa variabler anpassade till industriella "
                "cykelaktier."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V01 (försäljningstillväxt) appliceras på SKF genom att separera "
                        "organisk tillväxt från valutaeffekter och förvärv — bolagets "
                        "organiska tillväxt är typiskt 2–3 procent i genomsnitt över en "
                        "cykel, medan rapporterad tillväxt kan svänga mellan −10 och +15 "
                        "procent. AKM1-metoden premierar organisk volymtillväxt i "
                        "Industrial-segmentet som den mest varaktiga källan till "
                        "värdeskapande, och bedömer Automotive-segmentets tillväxt som mer "
                        "cykelberoende och därmed mindre värdefullt i värderingen.\n\n"
                        "V12 (moat-stabilitet) är central i SKF-analys eftersom bolaget "
                        "har en av de bredaste moats i svensk industri — globalt "
                        "service-nätverk, decennier av kundrelationer, teknisk support och "
                        "patenterade innovationer som sensorförsedda lager. Denna moat "
                        "måste dock valideras genom att följa bruttomarginaler över tid; "
                        "om bruttomarginalen faller indikerar det att moat urholkas av "
                        "asiatisk konkurrens. SKF:s bruttomarginal har varit relativt stabil "
                        "kring 30 procent under 2010-talet, vilket bekräftar moat.\n\n"
                        "V14 (kassaflödeskvalitet) visar att SKF historiskt har haft stark "
                        "konvertering från EBITDA till fritt kassaflöde, cirka 60 procent, "
                        "vilket är högre än många jämförbara industribolag. Detta återspeglar "
                        "både låga underhålls-kapacitetutgifter och disciplinerat "
                        "rörelsekapital-hantering. Kassaflödet finansierar både utdelning "
                        "(50 procent av vinsten) och återköp, vilket ger en “total yield” på "
                        "5–7 procent i genomsnitt över cykeln."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 gör SKF till en lärobok i industriell cykelaktie-analys: "
                        "moat-stabilitet, kassaflödeskvalitet och cykelnormalisering i en "
                        "integrerad process som undviker både toppcykel-extrapolering och "
                        "konjunkturpessimism."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "EBITDA-till-fritt-kassaflöde-konvertering mäter andelen av "
                        "rörelseresultat före avskrivningar som blir tillgängligt för "
                        "aktieägare efter investeringar och skatt — en central måttstock "
                        "för kapitalintensiva bolag."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "V16 (kapacitetsutnyttjande) är en särskilt viktig variabel för SKF "
                        "eftersom bolagets 90 fabriker globalt har en brytpunkt på "
                        "cirka 75 procent utnyttjande för att nå neutral resultat. Vid 70 "
                        "procent utnyttjande faller marginalen mot 5–6 procent, vid 80 "
                        "procent når den 12–14 procent och vid 85 procent stiger den mot "
                        "16 procent — en icke-linjär känslighet som få investerare "
                        "uppmärksammar. AKM1-metoden spårar därför kapacitetsutnyttjandet "
                        "per region för att förutse marginalrörelser.\n\n"
                        "V20 (återköpsdisciplin) är tydlig för SKF: bolaget har återköpt "
                        "aktier för 15 miljarder kronor under 2015–2023 och därmed dragit "
                        "ner antalet aktier med cirka 12 procent. Kombinerat med stabil "
                        "utdelning har detta gett en totalavkastning på aktien som överträffar "
                        "många tillväxtbolag, trots att kursutvecklingen varit måttlig. V19 "
                        "(emissionsrisk) är låg eftersom SKF har positivt kassaflöde även i "
                        "cykelbottnar och en solid balansräkning med nettoskuld/EBITDA under "
                        "1x."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Genom konkreta fallstudier av SKF:s historiska händelser blir det tydligt "
                "hur principerna omsätts i praktiken och vilka lärdomar som kan dras."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — Krisen 1990–1993. SKF gick in i 1990-talet med 60 "
                        "fabriker i Europa och en kostnadsstruktur som inte matchade japanska "
                        "konkurrenternas kvalitetslyft. Vid krisens botten hade bolaget "
                        "förlorat 60 procent av aktievärdet och EBIT-marginalen var negativ. "
                        "Omstruktureringen under vd Mauritz Sahlin innebar nedläggning av 18 "
                        "fabriker och 25 procent av personalen, men räddade bolaget och "
                        "lade grunden för 15 års värdeskapande. Lärdom: även bolag med stark "
                        "moat kan tappa position om de ignorerar konkurrensutveckling.\n\n"
                        "Fallstudie 2 — Kaydon-förvärvet 2013. SKF betalade 1,25 miljarder "
                        "dollar för Kaydon, en amerikansk tillverkare av speciallager med "
                        "stark position inom aerospace och medicinteknik. Förvärvet gav SKF "
                        "tillgång till Aerospace-segmentet och produkter utanför "
                        "standardkatalogen. Inom två år var Kaydon integrerat och bidrog med "
                        "15 procent av koncernens EBIT — ett exempel på hur SKF kan skapa "
                        "värde genom bolt-on-förvärv inom premiumsegment.\n\n"
                        "Fallstudie 3 — Neddelning 2015. SKF genomförde en 4-till-1-"
                        "neddelning för att göra aktien mer tillgänglig för "
                        "retail-investerare och därmed bredda ägarbasen. Aktiekursen justerades "
                        "från cirka 800 till 200 kronor, vilket ökade omsättningen i aktien "
                        "med 40 procent under det följande året. Detta visar hur "
                        "aktiepris-psykologi påverkar likviditet och värdering, särskilt för "
                        "industriaktier med bred investerargrupp."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SKF:s fallstudier visar att moat måste underhållas genom kontinuerlig "
                        "omstrukturering och strategiska förvärv — ett bolag som vilar på "
                        "förra decenniets moat kommer förr eller senare att "
                        "förlora position."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Bolt-on-förvärv är en strategisk transaktion där ett större bolag "
                        "förvärvar ett mindre komplementärt företag för att expandera i "
                        "en specifik produkt-, geografisk- eller kundnisch."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 4 — Gustafson-omstruktureringen 2021–2024. När Rickard "
                        "Gustafson tillträdde som vd 2021 hade SKF:s marginal fallit till 9 "
                        "procent och bolaget hade förlorat marknadsandelar i Europa. "
                        "Omstruktureringen 2024–2026 syftar till att ta bort 10 000 "
                        "anställda och 25 procent av produktionsnätet, med mål att nå 15 "
                        "procent EBIT-marginal 2026. Marknadens reaktion har varit positiv — "
                        "aktien steg 35 procent under de första 18 månaderna av "
                        "omstruktureringen — vilket visar att discplin för kapital- och "
                        "kostnadsallokering belönas.\n\n"
                        "Slutsatsen från fallstudierna är att SKF analyseras bäst genom "
                        "kombinationen av moat-stabilitet (segmentmarginaler, "
                        "marknadsandelar), kapitaldisciplin (återköp, utdelning) och "
                        "omstruktureringsförmåga (förmågan att stänga och integrera). "
                        "Investerare som förstår dessa tre dimensioner kan identifiera "
                        "vändningar och undvika fällor mer träffsäkert än de som bara följer "
                        "kvartalsrapporter."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i SKF-analys innebär att kombinera industriell cykelförståelse, "
                "moat-analys och kapitalallokeringsbedömning i en integrerad "
                "investmentstrategi."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Mästerskap i SKF-analys kräver tre förmågor utöver grundläggande "
                        "fundamental analys. För det första måste investeraren bygga en "
                        "industriell cykelmodell som kombinerar global PMI, amerikansk ISM, "
                        "europeisk Ifo och kinesisk PMI till en gemensam ledande indikator "
                        "för SKF:s orderbok. Denna modell bör uppdateras månadsvis och "
                        "jämföras med SKF:s kvartalsvis publicerade orderbokssiffror.\n\n"
                        "För det andra måste investeraren förstå SKF:s konkurrenssituation "
                        "i varje segment — Industrial (Schaeffler, Timken), Automotive (NSK, "
                        "NTN, Schaeffler) och Aerospace (Timken, RBC Bearings). Konkurrenternas "
                        "kvartalsrapporter ger tidiga signaler om SKF:s marknadsandelar och "
                        "marginalutveckling. En subtil men viktig detalj är att Schaefflers "
                        "automotive-segment korrelerar 0,8 med SKF:s Automotive-segment, "
                        "vilket gör Schaeffler till en valideringskälla.\n\n"
                        "För det tredje måste investeraren bedöma kapitalallokering — SKF:s "
                        "historiska förmåga att köpa tillbaka aktier vid cykelbottnar och "
                        "behålla utdelningen under toppar. Bolagets policy att dela ut 50 "
                        "procent av vinsten oavsett cykel har gett en utdelningstillväxt på "
                        "8 procent per år sedan 2010, vilket gör SKF till en av de mest "
                        "pålitliga utdelningsaktierna på Stockholmsbörsen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SKF-mästerskap är kombinationen av industriell cykelkompetens, "
                        "konkurrentanalys och kapitaldisciplin-bedömning — en helhetssyn som "
                        "få analytiker behärskar."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Utdelningstillväxt är den årliga ökningen av utdelning per aktie, "
                        "vilket är en mer relevant prestationsmått för långsiktiga "
                        "aktieägare än engångs-utdelningsnivån."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En slutgiltig dimension av mästerskap är att förstå SKF:s roll i en "
                        "svensk portfölj — bolaget är en av få ”compounders” i svensk "
                        "industri som kombinerar utdelningstillväxt, återköp och "
                        "moat-stabilitet. I portföljsammanhang kan SKF fylla en "
                        "kärnindustri-position som kompletterar mer cykliska innehav som "
                        "SSAB och Boliden, och mer defensiva som AstraZeneca och Atlas "
                        "Copco.\n\n"
                        "Investerare som bemästrar SKF-analys kan ofta identifiera "
                        "cykelvändningar 1–2 kvartal före konsensus genom att följa "
                        "orderbok, konkurrentrapporter och globala PMI-index. Denna förmåga "
                        "är särskilt värdefull i Sverige där SKF är en av de mest omsatta "
                        "industriaktierna och därmed en vanlig portfölj-post — den som "
                        "förstår bolaget bäst har en distinkt competitive edge."
                    ),
                },
            ],
        },
    ],
}

# ============================================================================
# 3. pc-13-case-ssab — SSAB
# ============================================================================
CONTENT["pc-13-case-ssab"] = {
    "why": (
        "SSAB är Sveriges i särklass största ståltillverkare och ett av få europeiska "
        "bolag som kan leverera avancerad höghållfast stål till fordons- och "
        "maskinindustrin globalt. Aktien är noterad på Stockholmsbörsen sedan 1989 och "
        "representerar en utpräglad cykelaktie vars svängningar i intjäning illustrerar "
        "effekterna av stålpriser, kinesisk kapacitet och europeisk efterfrågan. För "
        "retail-investeraren är fallet SSAB en lärobok i hur man skiljer en cykeltopp från "
        "en varaktig värdeökning och hur fossilfritt stål (HYBRIT) kan förändra en hel "
        "bransch."
    ),
    "history": {
        "origin": (
            "SSAB — Svenskt Stål AB — bildades 1978 som ett statligt ägt svenskt "
            "stålbolag genom en sammanslagning av ståltillverkningen i Stora Kopparberg, "
            "Gränges och Norrbottens Järnverk i Luleå. Bakgrunden var 1970-talets stålkris "
            "där europeiska regeringar nationaliserade stålindustrin för att rädda "
            "arbetstillfällen, och SSAB blev det svenska svaret på en ohållbar struktur. "
            "Bolaget noterades på Stockholmsbörsen 1989 när svenska staten sålde ut en "
            "majoritet och därmed inleddes privatiseringen av svensk stålindustri."
        ),
        "evolution": (
            "Genom 1990-talet internationaliserades SSAB med förvärv av IPSCO i Nordamerika "
            "2008 för 7,2 miljarder dollar — en transaktion som förvandlade bolaget från "
            "svenskt till transatlantiskt. Samtidigt utvecklades strategin bort från "
            "volymstål mot segregerade nischer som HARDOX, DOCOL och Strenx, vilket höjde "
            "EBITDA-marginalen från låga ensiffror till över 15 procent vid bra cyklar. "
            "2018 köptes finska Rautaruukki vilket lade till byggstål och FOOM-komponenter "
            "i portföljen och skapade dagens tre segment SSAB Special Steels, SSAB Americas "
            "och SSAB Europe."
        ),
        "modern": (
            "I modern tid är SSAB i framkant av omställningen till fossilfritt stål genom "
            "HYBRIT-samarbetet med LKAB och Vattenfall, där pilotanläggningen i Luleå sedan "
            "2021 producerar vätgasbaserat svampjärn. Vd Johnny Sjöström (tillträdde 2023) "
            "driver planen att konvertera Luleå och Oxelösund till elektriska vätgasugnar "
            "till 2030 — en investering på över 50 miljarder kronor som förväntas möjliggöra "
            "fossilfria premiumstål. Bolaget är därmed unikt exponerat mot både grön "
            "industriell omställning och traditionell cykelrisk i rörligt stål."
        ),
    },
    "lynchSection": (
        "Peter Lynch skulle klassa SSAB som en cykelaktie vars största möjlighet ligger i "
        "att köpas när stålpriserna bottnar och orderboken är nedbläddrad — ett “buy when "
        "there is blood in the streets”-scenario. Han skulle dock särskilt granska om "
        "HYBRIT-investeringen är en varaktig moat eller en kostsam teknikdröm, eftersom "
        "stora kapitalprojekt historiskt har förstört cykelvinster."
    ),
    "grahamSection": (
        "Benjamin Graham skulle värdera SSAB på substans och cykelgenomsnittlig intjäning "
        "snarare än toppcykel-EBITDA, med särskild uppmärksamhet på bokfört värde av "
        "stålvarken och varulager. Han skulle varna för att stora framtida "
        "kapacitetsinvesteringar i HYBRIT kan urholka kassaflödet och att substansen därför "
        "ska diskonteras för verklig ombyggnadsrisk."
    ),
    "ak1Section": (
        "AKM1-metoden kombinerar cykelbaserad normalisering av intjäningskraften med "
        "positionering i V01-F2-matrisen, vilket synliggör hur SSAB:s vinst multiplar "
        "exponentiellt mellan låg- och högkonjunktur. Genom att följa V13 (lagerutveckling) "
        "och V16 (kapacitetsutnyttjande) kan investeraren identifiera när bottnen är nådd "
        "och när marginalen börjar vända — ofta 6–9 månader innan rapporten bekräftar "
        "vändningen."
    ),
    "chapters": [
        {
            "intro": (
                "SSAB är Sveriges största ståltillverkare och en djupgående förståelse av "
                "bolaget kräver kunskap om både stålindustrins struktur och SSAB:s unika "
                "premiumstrategi."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "SSAB är organiserat i tre segment — SSAB Special Steels (Sverige, "
                        "ca 30 procent av omsättningen), SSAB Americas (Nordamerika, ca 40 "
                        "procent) och SSAB Europe (Sverige, Finland, UK, ca 30 procent) — där "
                        "varje segment har distinkta produktmixer och konkurrensfaktorer. "
                        "Special Steels tillverkar premiumprodukterna HARDOX (slitaget stål), "
                        "DOCOL (kallvalsat formstål) och Strenx (höghållfast konstruktion) "
                        "som säljs med premiumpriser till kunder som gruv- och "
                        "anläggningsmaskinstillverkare. SSAB Americas tillverkar rört stål "
                        "för olje- och gasindustrin (HFI) samt höghållfast plåt för "
                        "lastbilar och tunga maskiner, medan SSAB Europe producerar både "
                        "premium- och standardstål för europeisk bygg- och fordonsindustri.\n\n"
                        "Stålindustrin är strukturellt utmanande eftersom global överkapacitet "
                        "(särskilt i Kina) pressar stålpriset mot produktionskostnaden under "
                        "stora delar av cykeln. SSAB har dock lyckats bygga en premium-nisch "
                        "där slitaget-stål HARDOX har ungefär 70 procent marknadsandel i "
                        "Europa och där priset är 30–50 procent högre än standardstål. "
                        "Kunderna är mindre priskänsliga eftersom livstidsvärdet av "
                        "slitaget-stål överstiger engångskostnaden, vilket ger SSAB en "
                        "prisningsmakt som få andra europeiska stålbolag har.\n\n"
                        "SSAB är noterat på Stockholmsbörsen sedan 1989 med en "
                        "marknadsvärde som svänger mellan 20 och 60 miljarder kronor beroende "
                        "på var i cykeln bolaget befinner sig. Industrivärden är största "
                        "ägare med ungefär 8 procent av kapitalet, vilket ger en stabil "
                        "svensk ägarstruktur. Aktien ingår i OMXS30 och är därmed en av de "
                        "mer vanliga svenska industriaktierna i privatportföljer."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SSAB:s moat ligger i premiumvarumärkena HARDOX, DOCOL och Strenx "
                        "snarare än i stålproduktion i sig — en insikt som förklarar varför "
                        "bolaget har högre marginal än europeiska volymståltillverkare som "
                        "ArcelorMittal och ThyssenKrupp."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Höghållfast stål är stål med avsevärt högre sträckgräns än "
                        "konventionellt stål, vilket möjliggör lättare och starkare "
                        "konstruktioner inom fordons-, maskin- och anläggningsindustrin."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "SSAB genomgår en historisk omvandling genom HYBRIT-projektet "
                        "(Hydrogen Breakthrough Ironmaking Technology), som är ett samarbete "
                        "med LKAB och Vattenfall sedan 2017. Pilotanläggningen i Luleå "
                        "producerar sedan 2021 svampjärn med hjälp av vätgas istället för "
                        "stenkol, vilket eliminerar koldioxidutsläpp från själva "
                        "järnproduktionen. Den första kommersiella anläggningen planeras i "
                        "Oxelösund med driftsättning 2026, och därefter Luleå och Raahe i "
                        "Finland fram till 2030.\n\n"
                        "HYBRIT är både en möjlighet och en risk. Möjligheten ligger i att "
                        "SSAB kan ta premiumpriser för fossilfritt stål — biltillverkare som "
                        "Volvo och Mercedes-Benz har redan tecknat avtal för leveranser. "
                        "Risken ligger i investeringskostnaden: totalt beräknas omvandlingen "
                        "kosta 50–80 miljarder kronor fram till 2030, vilket motsvarar 2–3 "
                        "års normaliserat kassaflöde. Om stålpriset inte kompenserar för "
                        "denna investering kan SSABs intjäningsförmåga reduceras under "
                        "flera år."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Att analysera SSAB i praktiken kräver en kombination av stålpris-modeller, "
                "produktmix-analys och förståelse för HYBRIT-investeringens värdeskapande."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Praktisk SSAB-analys börjar med att bryta ner koncernen i tre "
                        "segment och följa varje segments volym, prissättning och marginal "
                        "separat. Special Steels-segmentet har en EBIT-marginal på 20–25 "
                        "procent vid bra cyklar tack vare premiumvarumärken, medan "
                        "SSAB Americas har 10–15 procent och SSAB Europe 5–10 procent. Vid "
                        "cykelbotten faller marginalerna till 5, 0 respektive −5 procent, "
                        "vilket illustrerar den enorma operations-hävtstången i bolaget.\n\n"
                        "Nästa steg är att modellera stålpriser och spread mot "
                        "råvarukostnader. SSAB köper järnmalm från LKAB (Sverige) och "
                        "metallurgiskt kol från internationella leverantörer, och spreaden "
                        "mellan stålpris och råvarukostnad är den primära vinstmotorn. "
                        "AKM1-metoden rekommenderar att bygga en normaliserad spread-modell "
                        "baserad på 7–10 års genomsnitt snarare än aktuella spotpriser, "
                        "eftersom SSABs intjäningskraft kan svänga 4x mellan botten och "
                        "topp av en cykel.\n\n"
                        "Slutligen måste HYBRIT-investeringen diskonteras separat från "
                        "kärnverksamheten. En lämplig metod är att beräkna nuvärdet av "
                        "framtida premium-priser för fossilfritt stål och dra av "
                        "investeringskostnaden, vilket ger en “strategisk option” som kan "
                        "läggas till kärnvärderingen. Om premium-uppskattningen är för "
                        "konservativ blir SSAB undervärderat, om den är för optimistisk blir "
                        "riskjusterad avkastning låg."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SSAB-analys handlar om att separera kärnintjäningskraft (premium-"
                        "stål, cykelnormaliserad) från strategiska optioner (HYBRIT) — två "
                        "olika kassaflödesströmmar som ofta sammanblandas."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Spread i stålindustrin är skillnaden mellan säljpris för färdigt "
                        "stål och inköpspris för råvaror (järnmalm, kol), och utgör den "
                        "primära vinstkällan för integrerade ståltillverkare."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En viktig metod är att följa SSABs orderbok och kvartalsvis "
                        "redovisade leveranser per segment, vilket ger insikt i kommande "
                        "intäktsutveckling. Special Steels-segmentets orderbok är "
                        "särskilt viktig eftersom den indikerar om premium-efterfrågan "
                        "håller i sig eller om kunder byter till billigare substitut under "
                        "konjunkturnedgångar. Historiskt HARDOX varit resistent mot "
                        "konjunktursvackor eftersom kundernas livstidskostnadsberäkning "
                        "uppmuntrar till fortsatt användning av slitaget stål även när "
                        "priset pressas.\n\n"
                        "En annan praktisk check är att följa kinesisk stålproduktion och "
                        "export, eftersom överkapacitet i Kina (1 miljard ton per år) "
                        "pressar globala stålpriser. När den kinesiska regeringen "
                        "implementerar produktionsrestriktioner stiger SSABs marginaler "
                        "markant, vilket inträffade 2017 och 2021. Investerare som följer "
                        "kinesisk stål-politik kan därmed identifiera vändningar i global "
                        "stålcykel."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Flera vanliga fallgropar kan leda investerare att dra felaktiga slutsatser "
                "om SSABs värde och riskprofil."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Den vanligaste fällan är att extrapolera toppcykel-EBITDA och köpa "
                        "SSAB till en låg multipel som faktiskt är en cykeltopp-multipel. "
                        "Vid stålcykeltoppen 2007 och 2018 handlades SSAB till 4–5x "
                        "topp-EBITDA, vilket vid första anblick verkar billigt men "
                        "efter cykelvändning visar sig vara 15–20x normaliserad EBITDA. "
                        "Lösningen är att alltid beräkna “cykelnormaliserad P/E” baserad på "
                        "genomsnitt över 7–10 år snarare än punktvärden.\n\n"
                        "En annan fälla är att förbise vikten av råvarukostnader och "
                        "lager-poster i balansräkningen. SSAB har stora lager av järnmalm, "
                        "kol och halvfabrikat som värderas till marknadspris vid "
                        "kvartalsslut. Vid fallande råvarupriser uppstår nedskrivningar som "
                        "kan slå multi-miljarder på en gång — 2015 skrev SSAB ner sitt "
                        "stålvarulager med 2 miljarder kronor, vilket motsvarade hälften "
                        "av årets rörelseresultat. Investerare måste separera dessa engångs-"
                        "effekter från strukturell intjäningskraft.\n\n"
                        "Tredje fällan är att förbise HYBRIT-investeringens inverkan på "
                        "kassaflödet. Totalt beräknas investeringen kosta 50–80 miljarder "
                        "kronor fram till 2030, vilket motsvarar 5–8 miljarder per år — "
                        "mer än vad bolaget historiskt har genererat i fritt kassaflöde. "
                        "Om premium-priser för fossilfritt stål inte realiseras kan SSAB "
                        "tvingas till emissioner eller skuldökning för att finansiera "
                        "omvandlingen."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "Tre SSAB-fällor är toppcykel-extrapolering, underskattning av "
                        "lager-effekter och förbiseende av HYBRIT-investeringens "
                        "kassaflödes-effekt — alla tre har historiskt kostat investerare "
                        "stora belopp."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Lagernedskrivning är en bokföringspost som reducerar värdet av "
                        "varulager till det lägre av anskaffningsvärde och "
                        "marknadsvärde, vilket påverkar rörelseresultatet direkt."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En subtilare fälla är att förväxla SSABs rapporterade EBITDA med "
                        "kassaflöde från drift, eftersom bolaget har stora avskrivningar på "
                        "stålvark och stora förändringar i rörelsekapital. SSABs "
                        "kapitalomsättning är cirka 1,2–1,5x EBITDA, vilket gör att "
                        "kassaflödesvärdering ger en annan bild än vinstmultipel. Vid "
                        "cykelbotten kan kassaflödet vara negativt trots rapporterad "
                        "EBITDA positiv, eftersom rörelsekapital binds i lagertillväxt.\n\n"
                        "Slutligen är geopolitisk risk i USA och EU en underskattad faktor. "
                        "SSAB Americas står för 40 procent av koncernens intäkter och "
                        "påverkas direkt av amerikanska stål-tariffer (Section 232) som "
                        "infördes 2018 under Trump-administrationen. När dessa tariffer "
                        "höjdes 2025 steg SSABs amerikanska marginaler markant, men om de "
                        "sänks eller elimineras faller marginalerna snabbt. Investerare "
                        "måste inkludera tariff-scenarier i sin värdering av SSAB Americas."
                    ),
                },
            ],
        },
        {
            "intro": (
                "AKM1 1.1-ramverket ger en strukturerad metodik för att värdera SSAB genom "
                "20 variabler anpassade till cykliska råvaru- och industriaktier."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "V01 (försäljningstillväxt) appliceras på SSAB genom att separera "
                        "volymtillväxt (nya kunder, ökad kapacitet) från pristillväxt "
                        "(stålpriser) och valutaeffekter (EUR, USD, SEK). Bolagets "
                        "underliggande volymtillväxt är typiskt 1–2 procent per år i "
                        "genomsnitt över en cykel, medan rapporterad försäljningstillväxt "
                        "kan svänga mellan −15 och +25 procent. AKM1-metoden premierar "
                        "volymtillväxt i Special Steels-segmentet som mest värdefull, "
                        "eftersom premium-marginalen gör volymen mer lönsam.\n\n"
                        "V03 (intäktsdiversifiering) är viktig för SSAB eftersom bolaget "
                        "har både produkt-diversifiering (specialstål, plåt, rört stål) och "
                        "geografisk diversifiering (Sverige, Finland, USA, UK). Hög "
                        "diversifiering jämnar ut cykler mellan regioner — en nedgång i "
                        "Europa kan kompenseras av uppgång i USA, vilket inträffade 2018–"
                        "2019. Samtidigt innebär diversifieringen att SSAB inte har samma "
                        "cykeluppsida som renodlade premium-bolag vid stark global "
                        "efterfrågan.\n\n"
                        "V14 (kassaflödeskvalitet) är kritisk för SSAB eftersom bolaget "
                        "historiskt har haft svag konvertering från EBITDA till fritt "
                        "kassaflöde — typiskt 30–40 procent under bra cyklar och negativt "
                        "i dåliga. Orsaken är stora rörelsekapital-svängningar i samband "
                        "med pris- och lagercykler. AKM1-metoden justerar därför ner "
                        "EBITDA-baserade värderingar för att reflektera detta, vilket ger "
                        "en mer konservativ och realistisk bild av bolagets värde."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "AKM1 gör SSAB till en lärobok i cykelrisk-hantering: "
                        "intjäningskraft, kassaflödeskonvertering och cykelnormalisering i "
                        "en integrerad process som undviker både toppcykel-extrapolering "
                        "och överdriven konjunkturpessimism."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Cykelnormalisering är processen att beräkna ett genomsnittligt "
                        "resultat över en hel konjunkturcykel, vanligtvis 7–10 år, för att "
                        "undvika att extrapolera topp- eller bottencykel-resultat."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "V13 (lagerutveckling) är en unik variabel för SSAB eftersom "
                        "varulager utgör 15–20 procent av omsättningen och därmed har "
                        "direkt påverkan på både balansräkning och resultaträkning. "
                        "När stålpriserna stiger ökar lagrets värde och därmed EBITDA — "
                        "men detta är en engångseffekt som inte indikerar strukturell "
                        "förbättring. AKM1-metoden spårar lagrets dagar av omsättning och "
                        "varnar om denna stiger över 80 dagar, vilket indikerar att bolaget "
                        "bygger upp lager inför fallande efterfrågan.\n\n"
                        "V19 (emissionsrisk) är måttlig för SSAB eftersom bolaget har "
                        "täckning för HYBRIT-investeringar genom nuvarande kassaflöde och "
                        "kassabehållning, men skulle kunna triggas om cykelbottnar varar "
                        "länge. V20 (återköpsdisciplin) är svag — bolaget har inte återköpt "
                        "aktier i någon större utsträckning sedan 2018, vilket återspeglar "
                        "att kapital allokeras till HYBRIT istället. Investerare måste "
                        "bedöma om denna allokering skapar värde eller urholkar "
                        "aktieägaravkastningen."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Genom konkreta fallstudier av SSABs historiska händelser blir det tydligt "
                "hur principerna omsätts i praktiken och vilka lärdomar som kan dras."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 1 — IPSCO-förvärvet 2008. SSAB betalade 7,2 miljarder "
                        "dollar för kanadensisk-amerikanska IPSCO, vilket var en av de "
                        "största svenska industri-affärerna någonsin. Timing var olycklig — "
                        "inom sex månader rasade stålpriset med 50 procent under "
                        "finanskrisen och IPSCO gick från vinst till förlust. SSAB tvingades "
                        "till nyemission 2009 för att stärka balansräkningen, vilket "
                        "urholkade aktieägarnas värde med 40 procent. Lärdom: stora "
                        "förvärv vid cykeltopp är en av de största riskerna i "
                        "cykelindustriaktier.\n\n"
                        "Fallstudie 2 — Rautaruukki-förvärvet 2018. SSAB förvärvade finska "
                        "Rautaruukki i en aktiebyte värd 1,3 miljarder euro, vilket "
                        "konsoliderade nordisk stålindustri. Synergierna beräknades till 100 "
                        "miljoner euro per år och integrationen gick smidigt. Tre år senare "
                        "hade koncernen tre tydliga segment (Special Steels, Americas, "
                        "Europe) med tydlig ansvarsfördelning. Lärdom: strategiska "
                        "konsolideringar i fragmenterade branscher kan skapa värde om "
                        "integrationen genomförs disciplinerat.\n\n"
                        "Fallstudie 3 — HYBRIT-pilot 2021. I augusti 2021 producerade HYBRIT-"
                        "pilotanläggningen i Luleå världens första fossilfria svampjärn i "
                        "industriell skala. SSAB levererade därefter de första "
                        "fossilfria stålet till Volvo Group 2022 och till Mercedes-Benz 2023. "
                        "Marknadens reaktion var positiv — aktien steg 20 procent under de "
                        "följande sex månaderna — men varsnabbt ifrågasattes om premium-"
                        "priset för fossilfritt stål skulle kompensera för "
                        "investeringskostnaden."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SSABs fallstudier visar att både stora förvärv och strategiska "
                        "teknikskiften kan skapa eller förstöra värde — avgörande är "
                        "timing, prissättning och integrationdisciplin."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Svampjärn (Direct Reduced Iron, DRI) är en form av järn som "
                        "produceras genom reduktion av järnmalm med vätgas eller naturgas, "
                        "vilket ger en produkt som kan smältas vidare till stål utan "
                        "koldioxidutsläpp."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "Fallstudie 4 — Tariffer 2018 och 2025. När Trump-administrationen "
                        "införde Section 232-tariffer på stålimport 2018 steg SSABs "
                        "amerikanska marginaler kraftigt eftersom konkurrensen från "
                        "europeiskt stål minskade. Effekten förstärktes 2025 när nya "
                        "tariffer höjdes ytterligare, vilket gav SSAB Americas en EBIT-"
                        "marginal på 20 procent jämfört med 10 procent historiskt. Lärdom: "
                        "geopolitiska händelser kan dramatiskt påverka enskilda segment och "
                        "måste inkluderas i värderingen som scenarier.\n\n"
                        "Slutsatsen från fallstudierna är att SSAB analyseras bäst genom "
                        "att separera cykelinvesteringar (nya ugnar, lageruppbyggnad), "
                        "strategiska förvärv (IPSCO, Rautaruukki) och tekniska skiften "
                        "(HYBRIT, tariffer). Varje kategori kräver olika analysmetoder och "
                        "olika tidsramar — ett bemästrandet som skiljer professionella "
                        "SSAB-investerare från dem som bara följer stålpriset."
                    ),
                },
            ],
        },
        {
            "intro": (
                "Mästerskap i SSAB-analys innebär att kombinera stålcykel-kompetens, "
                "premium-moat-analys och HYBRIT-strategi-bedömning i en integrerad "
                "investmenttes."
            ),
            "blocks": [
                {
                    "type": "text",
                    "content": (
                        "Mästerskap i SSAB-analys kräver tre förmågor utöver grundläggande "
                        "fundamental analys. För det första måste investeraren bygga en "
                        "stålcykel-modell som kombinerar global efterfrågan (kinesisk "
                        "produktion, europeisk fordonsindustri, amerikansk shale gas) med "
                        "utbud (nya kapaciteter, nedläggningar) och lager (kinesiska och "
                        "LME-lager). Denna modell bör uppdateras kvartalsvis och jämföras "
                        "med World Steel Association:s månatliga produktionsstatistik.\n\n"
                        "För det andra måste investeraren bedöma premium-moat för HARDOX "
                        "och DOCOL. En indikator är bruttomarginal per segment — om "
                        "Special Steels bruttomarginal hålls över 25 procent är moat intakt, "
                        "om den faller under 20 procent indikerar det konkurrens från "
                        "japanska JFE och tyska ThyssenKrupp som kan erbjuda substitut. "
                        "Ett annat verktyg är att följa SSABs patentansökningar och "
                        "nya produktlanseringar som indikerar innovationstakt.\n\n"
                        "För det tredje måste investeraren bedöma HYBRIT som strategisk "
                        "option. Tre frågor är centrala: (1) Kommer premium-priset för "
                        "fossilfritt stål att kompensera för investeringskostnaden? (2) "
                        "Vilka kunder är beredda att betala premium? (3) Vad händer om "
                        "konkurrenter (ArcelorMittal, ThyssenKrupp) utvecklar liknande "
                        "teknik? Investerare som kan svara på dessa tre frågor har en "
                        "competitive edge gentemot konsensus."
                    ),
                },
                {
                    "type": "insight",
                    "content": (
                        "SSAB-mästerskap kräver kombinationen av råvarumarknadsmodellering, "
                        "moat-validering och strategisk optionsvärdering — tre discipliner "
                        "som få analytiker behärskar i helhet."
                    ),
                },
                {
                    "type": "definition",
                    "content": (
                        "Strategisk option i investeringssammanhang är rätten — men inte "
                        "skyldigheten — att genomföra en framtida investering baserat på "
                        "nya marknadsförutsättningar, vilken kan värderas med "
                        "optionsprissättningsmetoder."
                    ),
                },
                {
                    "type": "text",
                    "content": (
                        "En slutgiltig dimension av mästerskap är att förstå SSABs roll i en "
                        "svensk portfölj — bolaget är den enda stora exponeringen mot "
                        "svensk tung industri och därmed en hedge mot europeisk "
                        "konjunktur. I portföljsammanhang kan SSAB fylla en cykelaktie-"
                        "position som kompletterar mer defensiva innehav som Atlas Copco "
                        "och AstraZeneca, men volatiliteten kräver rätt position sizing och "
                        "tålamod under cykelbottnar.\n\n"
                        "Investerare som bemästrar SSAB-analys kan ofta identifiera "
                        "cykelvändningar 6–9 månader före konsensus genom att följa kinesisk "
                        "stålproduktion, amerikanska ståltariffer och europeisk fordons-"
                        "produktion. Denna förmåga är särskilt värdefull i Sverige där SSAB "
                        "är en av de mest omsatta industriaktierna — den som förstår bolaget "
                        "bäst har en distinkt competitive edge."
                    ),
                },
            ],
        },
    ],
}


# ============================================================================
# Helper: build the chapter payload (preserving num, minutes, title)
# ============================================================================

def build_course_payload(course, new_data):
    """Return a new course dict with replaced fields, preserving
    chapter num/minutes/title."""
    new_course = deepcopy(course)
    new_course["why"] = new_data["why"]
    new_course["history"] = deepcopy(new_data["history"])
    new_course["lynchSection"] = new_data["lynchSection"]
    new_course["grahamSection"] = new_data["grahamSection"]
    new_course["ak1Section"] = new_data["ak1Section"]

    # Replace chapters while keeping num/minutes/title from chapters_list
    existing_chapters = course.get("chapters", [])
    chapter_list = course.get("chapters_list", [])
    new_chapters = []
    for i, ch_data in enumerate(new_data["chapters"]):
        # Prefer the metadata from existing chapter if available; fallback to chapters_list
        if i < len(existing_chapters):
            num = existing_chapters[i].get("num", i + 1)
            minutes = existing_chapters[i].get("minutes", 4)
            title = existing_chapters[i].get("title", f"{i+1}. Kapitel")
        elif i < len(chapter_list):
            num = chapter_list[i].get("num", i + 1)
            minutes = chapter_list[i].get("minutes", 4)
            title = chapter_list[i].get("title", f"{i+1}. Kapitel")
        else:
            num = i + 1
            minutes = 4
            title = f"{i+1}. Kapitel"

        new_chapters.append({
            "num": num,
            "minutes": minutes,
            "title": title,
            "intro": ch_data["intro"],
            "blocks": deepcopy(ch_data["blocks"]),
        })
    new_course["chapters"] = new_chapters
    return new_course


# Placeholder for remaining 7 courses — will be appended in next write step
# (the script imports CONTENT from this module-level dict; for the remaining
# 7 courses we will append dicts below before the main routine runs)
