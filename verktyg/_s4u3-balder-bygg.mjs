#!/usr/bin/env node
// Bygg sa-laser-du-balder-q3-2026.json (s4-u3, manifest auto-s4-1789886103053)
// Talgrund: bolagsunivers.json BALD-B.ST (2026-09-03) + netnet-cache (2026-09-16)
// + Balders egen kalender (sökverifierad 2026-09-20). Skriver JSON, räknar ord.
import fs from "node:fs";

const body = `Fastighets AB Balder — ticker BALD-B på Nasdaq Stockholm — publicerar sin interimsrapport för januari–september 2026 fredagen den **23 oktober**. Datumet står i [Balders egen kalender](https://www.balder.se) med ordalydelsen "Interim report January–September 2026, 23 October 2026", sökverifierad 2026-09-20; Inderes tredjepartskalender anger samma dag, och fjolårets januaris–septemberrapport kom 28 oktober 2025 — rappdagen är alltså framflyttad fem dagar i år, en detalj värd att notera eftersom kalendrar som projicerar fjolårets rytm hamnar fel. Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

Paketet är fastighetsgrenens sjunde på disk — de fem nordiska före (Wallenstam, NP3, Fabege, Castellum och Hufvudstaden) plus syskonpaketet Prologis, seriens första USA-REIT, som byggs i samma fabriksomgång — och seriens cirka 64:e läspaket totalt. Balder är det största nordiska fastighetsbolaget i universumsinsamlingen: börsvärdet 62,4 miljarder kronor mot Castellums 58,9 — Göteborgsregionens tyngsta hyresvärd med bostäder som kärna. Det gör paketet till fastighetsläsartens stora balansräkning: en belåningskvot på 1,48 kronor skuld per krona eget kapital, en rabatt mot bokfört kapital på 32 procent — och en resultathistoria som innehåller räntechocken 2023 i seriens fulla skala.

## Urvalet: varför Balder är nästa paket i serien

Sorteringen redovisas öppet, som alltid: tidigaste återstående rappdag med bärande data och bolagsbekräftat datum. Fältet före 23 oktober är stängt. Tele2 (20 oktober), AT&T och Telia (21 oktober) är levererade sedan länge. Netflix (20 oktober), Wihlborgs (20–21 oktober) och Tesla (21 oktober) vilar på obekräftade estimat och projektioner — serien levererar inte på rena tredjepartsgissningar. Dagsfältet 22 oktober gallrades i P&G-paketets egen sorteringsnot: Newmont (estimatdatum), PowerCell (null-vinstmultiplar) och Billerud — officiell kalender men P/E-fältet null, "gallran står tills data bär", och universumposten är oförändrad sedan 2026-09-03. Därmed återstår 23 oktober-klassen, som i samma not avfärdades som "tredjepartsdatum (Wihlborgs-klassen)" — men den gallran gällde datumkällan, inte bolaget eller dataunderlaget. En egen verifiering mot bolagets webbplats upplöser den: Balders kalender anger 23 oktober i egen hand, samma verifieringsklass som ASML-paketets kalendercitat. Syskonen i omgången har tagit Prologis (15 oktober) och Kambi (4 november) — tre skilda objekt, noll kollision — och kön dokumenterade väntobjekt (Shell, Fresenius, NVIDIA) lämnas åt sina namngivna turer. Kvar står **Balder 23 oktober: tidigaste återstående rappdagen bland bolag med bärande universumdata och bolagsbekräftat datum** — med samtliga multiplar på plats, fyra sammanhängande räkenskapsår i både omsättning och resultat, och som enda nordiska fastighetsbolag i seriens omgång enandra mätpunkt att källkritikera mot.

## Nyckeltalen att ha med sig — fastighetens egen uppsättning

Värdena är senaste mätta tal ur bolagsuniversumets insamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom fastighetsbranschen. Fastighetsbolaget mäter annorlunda än både banker och industrier — skillnaderna är paketets innehåll, och Balder är branschläsartens stora exemplar.

**Värdering — balansräkningen först, som alltid i branschen**

- Pris per bokfört eget kapital (P/B): **0,678** — [så räknas P/B](/dataset/fastighet/pb). Huvudtalet för fastighetsbolaget: bokfört eget kapital är en netto-version av fastighetsbeståndet, och kvoten under 1 betyder att marknaden prissätter bolaget **32,2 procent under** dess bokförda balansräkning (ett minus 0,678).
- Universums NAV-fält är osatt för Balder, men aritmetiken ger proxyn: kursen **53,30 kronor** dividerat med P/B 0,678 implicerar bokfört eget kapital om **78,61 kronor per aktie**. Kursen mot den proxy-siffran är samma läsning som P/B — rabatten är en beskrivning av en kvot, inte ett omdöme: den kan återspegla avkastningskrav, ränteförväntningar eller bokförd nivå, och vilken av dem är rapportläsningens fråga (övning A).
- Pris per vinst (P/E): **10,29** — [P/E inom fastighet](/dataset/fastighet/pe). Med resultathistorik som svänger mellan +10 och −6,7 miljarder (se tillväxt nedan) är också detta ett instabilt tal — P/B förblir huvudtal.
- Enterprise value per rörelseresultat (EV/EBIT): **24,284** — [EV/EBIT inom fastighet](/dataset/fastighet/ev-ebit). För det högt belånade beståndet säger EV-måttet lika mycket om skuldstrukturen som om värderingen; läs det vid skuldkvoten.
- Fri kassaflödesavkastning (FCF-yield): **5,05 procent** — [så räknas FCF-avkastningen](/dataset/fastighet/fcf-avkastning) — femte högsta av sexton fastighetskollegor.
- PEG-talet: källan anger **1,53**, konventionen (P/E delat med prognostillväxten i procentenheter) ger 2,17 — källan under konventionen igen; se källkritikavsnittet. [Värderingsöversikten](/dataset/fastighet/vardering) sätter multiplarna i sammanhang.

**Lönsamhet — vilken avkastning ger beståndet?**

- Räntabilitet på eget kapital (ROE): **7,04 procent** — [så räknas ROE](/dataset/fastighet/roe). Tolfte av sexton i grenen: under fastighetsmedianen 8,57.
- Räntabilitet på investerat kapital (ROIC): **3,81 procent** — [så räknas ROIC](/dataset/fastighet/roic), med källans not att värdet är en approximerad proxy (rörelseresultat före skatt delat med skuld plus bokfört eget kapital). Gapet mot ROE — 3,2 procentenheter — är fastighetens signatur: belåningen lyfter avkastningen på det egna kapitalet. Wallenstam-paketet läste samma gap; Balders är bredare i kronor och smalare i procent, eftersom balansräkningen är större men avkastningen lägre.
- Bruttomarginal **66,30 procent** och rörelsemarginal (EBIT) **66,33 procent** — [så läses marginalerna](/dataset/fastighet/netto-marginal). De ligger en tredjedels procentenhet ifrån varandra: hyresintäkternas direkta kostnader är små, och brutto- och rörelsenivåer i samma decimal är branschens normalbild. Femte högsta EBIT-marginal i grenen.
- Nettomarginal: **50,21 procent** — UNDER rörelsemarginalen, med 16 procentenheters mellanrum. Efter Wallenstam-paketets upptäckt (netto ÖVER EBIT, lyft av värdestegringar) är Balder spegelbilden: här äter finansieringskostnaden och skatten av rörelseresultatet. Tio miljarder i hyresintäkter med två tredjedels marginal ger ett stort rörelseresultat — och räntenettot på 1,48 kronor skuld per kronor kapital tar sin del. Det är belåningens hyra, synlig i en enda rad.
- Fri kassaflödesmarginal: **22,62 procent** — avskrivningarna är bokföringsmässigt stora, kassaflödet verkligt; samma läsart som Wallenstam-paketet bar.

**Tillväxt — intäkterna stadiga, resultatet som berg-och-dalbana**

- Hyresintäkter över senaste fyra räkenskapsåren: **plus 9,26 procent per år** (10 521 → 11 944 → 12 876 → 13 721 miljoner kronor, årliga steg +13,5, +7,8 och +6,6 procent — monotont stigande, mattande) — [så räknas CAGR](/dataset/fastighet/omsattning-cagr-5ar). Ärlighetsnot: källan ger fyra år, inte fem.
- Resultat samma period: **minus 9,18 procent per år** — men serien den kommer från är 10 175 → **−6 746** → 3 304 → **7 621** miljoner kronor. Från rekord till grenens näst största förlustår till vändning till ny topp. CAGR räknar bara på ändpunkterna (10 175 och 7 621, minus 25 procent på tre år); vägen däremellan — minusförluståret 2023 och halva återresan 2024 — syns inte i talet alls. Wallenstam-paketet kallade sin svängande serie universumets bäst lämpade för CAGR-kritik; Balders svänger i en helt annan skala, 123 procent av senaste års hyresintäkter från topp till botten — fjärde störst i grenen. [Resultat-CAGR förklarad](/dataset/fastighet/resultat-cagr-5ar).
- Intäktstillväxt senaste tolvmånadersperioden: **plus 4,8 procent** — [så läses TTM-tillväxten](/dataset/fastighet/omsattningstillvaxt-ttm).
- Prognostillväxt: **plus 4,75 procent** — källans konsensussiffra för vinsttillväxt ett år framåt; samlad marknadsuppskattning, inte en sanning och inte vår prognos. [Om prognostillväxt](/dataset/fastighet/prognos-tillvaxt)

**Stabilitet — belåningen är verksamheten**

- Skulder per eget kapital: **1,4801** — [om skuldsättning](/dataset/fastighet/skuldsattning). Femte högsta i grenen, men med skillnaden att Balder är grenens största nordiska balansräkning: samma kvot på större volym betyder mer kronor i räntenetto per rörelsekrona. 2023 års förlustår är belåningens nackdelssida i praktiken.
- Räntetäckning: **osatt** — källan saknar räntekostnad för senaste räkenskapsåret. Hålet sägs som det är; i rapporten finns räntenettot att läsa, och för detta bolag är det en huvudrad.
- Utdelningsfält: universum saknar siffror — paketet redovisar ingen utdelningsmatematik, som dokumentation av luckan, inte som påstående att utdelning saknas.

## Källkritiken: identiteten på procentnivå, PEG under konventionen — och seriens första dubbelmätta fastighetspost

Kör identitetstestet **P/E = P/B delat med ROE** på Balders källvärden: P/B 0,678 dividerat med ROE 0,0704 ger **9,63**. Källans eget P/E-tal är 10,29 — källan ligger **6,4 procent över** identiteten. Omvänt: 10,29 multiplicerat med 0,0704 ger 0,724 mot källans P/B 0,678. Det är när-godkännandets nivå med reservration — och Essity-paketets graderingslära pekar var reserven hör hemma: med en resultatserie som går 10 175 → −6 746 → 3 304 → 7 621 mäter ROE (senaste bokförda år) och P/E (rullande vinst) sannolikt vinst i olika ögonblick av svängen. Ju större sväng, desto större förklarat avstånd — Balders sväng är grenens största bland de levererade nordiska paketen. Implicit vinst per aktie: 53,30 delat med 10,29 är **5,18 kronor**.

Sedan PEG-fältet: konventionen ger 10,29 delat med 4,75 = **2,17** mot källans **1,53** — källan under konventionen, kvot 0,71. Wallenstam-paketet noterade samma riktning (kvot 0,76) som seriens första brott mot mönstret "källan över konventionen"; Balder blir den tredje observationen i under-klassen och bekräftar slutsatsen från bankpaketen: fältets beräkningsväg är instabil, och hierarkin för rapportläsaren är oförändrad — multiplar som kan härledas ur identiteter kan kontrolleras, okända beräkningsvägar redovisas som räknestorheter, inte som mått.

Sedan det som gör det här paketets källbild unik: **två mätpunkter**. Universumfilen mätte 2026-09-03 (kurs 53,30, P/B 0,678, P/E 10,29); netnet-cachen mätte igen 2026-09-16 (kurs 50,06, P/B 0,636, P/E 9,66). Rörelsen mellan måtten: kursen −6,1 procent, P/B −6,1 procent, P/E −6,1 procent. Alla tre fallen exakt lika mycket är inte sammanträffande — det är strukturell samstämmighet: båda källorna härleder sina multiplar ur kurs delat med oförändrade fundamentala tal, och det som rörde sig var kursen, inte bolaget. Två oberoende mätpunkter som håller samma struktur är den starkaste källbild en ensam post kan bära — med den ärliga noten att universuminsamlingens andra källa (MarketStack) saknade färsk kurs vid 2026-09-03, alltså ingen dubbelkoll den dagen.

Och netnet-cachen bär en pärla till: NCAV, Grahams netto av omsättningstillgångar minus skulder, uppmätt till **−106,48 kronor per aktie** — klass "ej", negativt per konstruktion. För ett högt belånat fastighetsbolag är det inte ett varningens tal utan en kategoriessäga: fastigheter är inte omsättningstillgångar, och netnet-skärmen tillhör en helt annan bolagsvärld (lågbelånade, tillgångstäta). Wallenstam-paketet noterade att NCAV-data saknades hos källorna; Balder är seriens första paket med NCAV **mätt** — och talets plats långt under noll är i sig läsbar information om balansräkningens natur.

## Så står sig bolaget mot branschen

| Nyckeltal | Balder | Median fastighet (17 bolag) | Median hela universumet |
|---|---|---|---|
| P/E | 10,29 | 14,38 | 20,53 |
| P/B | 0,678 | 0,946 | 2,75 |
| Räntabilitet på eget kapital (ROE) | 7,04 % | 8,57 % (n=16) | 14,75 % |
| Rörelsemarginal (EBIT) | 66,33 % | 57,37 % | 21,11 % |
| Nettomarginal | 50,21 % | 43,58 % | 14,09 % |
| Skuld per eget kapital | 1,48 | 1,10 | 0,51 |

(Alla värden hämtade 2026-09-03 ur universumfilen; medianer beräknade 2026-09-20 ur samma fil — 225 bolag, varav 17 i fastighet; ROE-medianen bygger på n=16.)

Läsningen har en form som är värd ett namn: **femteplatserna**. Balder är femte lägsta P/E av 17, femte högsta belåningen av 17, femte högsta EBIT-marginalen av 17, femte högsta FCF-avkastningen av 16 — och därutill fjärde lägsta P/B och fjärde största resultatsvängen. Konsekvent i fältets halva som är billigast, mest belånad och mest svängande — men aldrig i ytterligheten. Jämfört med medianerna: under på värderingsraderna (P/E 10,29 mot 14,38; P/B 0,678 mot 0,946) och avkastningen (ROE 7,04 mot 8,57), över på marginalerna (EBIT 66,33 mot 57,37) och belåningen (1,48 mot 1,10). Fastighetsgrenens eget P/B-gap mot universumet (0,946 mot 2,75) är branschens signatur, inte Balders — det var Wallenstam-paketets läsning och den står sig. Jämförelsen mot samtliga kollegor finns i [universumjämförelsen](/dataset/fastighet/universumjamforelse), och bolagets sida i biblioteket finns [här](/bolag/bald-b-st).

## Tre sätt att läsa utfallet — övningar i metod

Tre övningar i vad en rapportläsare vanligtvis tittar på för ett stort, högt belånat fastighetsbolag. Ingen är en bedömning av vad som kommer att hända den 23 oktober — de är träning i metod och ren aritmetik.

**Övning A — läs rabatten och belåningen som en berättelse.** P/B 0,678 betyder kursen 53,30 mot cirka 78,61 kronor bokfört per aktie: 32 procents rabatt. Samma balansräkning bär 1,48 skuld per kronor kapital. Rabatt och belåning är sällan två oberoende fakta: marknadens prissättning av ett högt belånat bestånd i en osäker räntmiljö är en enda gemensam berättelse med två tal. Träningsfrågorna är Wallenstam-paketets, nu på större volym: vad i rapporten är återkommande (hyresintäkter, förvaltningsresultat, vakanser) och vad som är värderings- eller finansieringsposter? 2023 — förluståret −6 746 miljoner — är mekanikens nackdelssida: vilka av årets poster skulle röra sig först om ränteläget vänder, och i vilken riktning?

**Övning B — läs resultatets innehåll: rörelsen kontra räntan.** Grundberättelsen är 2025 års resultat 7 621 miljoner kronor på hyresintäkter 13 721 miljoner. Beräknat ur källans rörelsemarginal är rörelseresultatet cirka 9 101 miljoner (13 721 multiplicerat med 0,6633) — skillnaden, grovt 1 480 miljoner kronor, försvann nedanför rörelseresultatet: finansiering och skatt, belåningens hyra i kronor. Övningens fråga är dubbel: hur stor del av 2025 års resultat var förvaltning och hur stor var värdeposter — och vad händer med raden ett år då fastighetsvärdena går ner? 2023 är det egna provet: samma balansräkning, samma belåning, minus 6 746 miljoner. Följdfrågan är CAGR-kritiken: minus 9,18 procent per år och serien den kom från — vilket av dem beskriver bolaget?

**Övning C — scenariorutan i ren aritmetik, och marginalvikten som banker känner igen.** Universumet saknar kvartalsserier, så rutan räknas på helåret 2025 som bas: hyresintäkter 13 721 miljoner kronor och rörelsemarginal 66,33 procent ger rörelseresultatet ovan. Med tre hypotetiska intäktsnivåer (±3 procent) och tre marginaler (±1 procentenhet) blir rutan, i miljoner kronor:

| Rörelseresultat, miljoner kronor | Marginal 65,33 % | Marginal 66,33 % | Marginal 67,33 % |
|---|---|---|---|
| Intäkter 13 309,4 | 8 695,0 | 8 828,1 | 8 961,2 |
| Intäkter 13 721,0 | 8 963,9 | 9 101,1 | 9 238,3 |
| Intäkter 14 132,6 | 9 232,8 | 9 374,2 | 9 515,5 |

Två räknesatser att öva på: en procentenhet marginal flyttar resultatet med cirka 137 miljoner kronor vid oförändrade intäkter, medan tre procent mer intäkter vid oförändrad marginal flyttar det med cirka 273 miljoner — intäktsratten väger **ungefär dubbla** marginalratten, marginalvikten ett delat med tre gånger marginalnivån blir 0,50. Essity-paketets formel placerar Balder i samma ficka som bankerna och Wallenstam (0,5): vid marginaler i den här nivån bär volymläsningen räkningen. Och noten som övningen INTE täcker: för detta bolag styrs nettoresultatet av räntenetto och värdeposter, inte av rutans marginaler — övning B är paketets huvudövning, rutan dess bilaga. Alla nio celler är aritmetik på 2025 års bas, inga prognoser.

## Praktiskt inför 23 oktober

- Rappdagen fredagen 23 oktober står i [Balders kalender](https://www.balder.se) — ordalydelsen "Interim report January–September 2026, 23 October 2026", sökverifierad 2026-09-20. Q2-rapporten kom 14 juli kl 08:00 med presentation samma förmiddag; samma rytm väntas. Nästa kalenderpost efter Q3 är bokslutskommunikén 2027 — Inderes anger 12 februari 2027, en tredjepartssiffra att bekräfta mot bolaget. Samma morgon rapporterar Volvo Car (07:00) och Volvo Group (07:20), vars paket finns i serien, tillsammans med Norsk Hydro och SCA — höstsäsongens tätor samlade.
- Balder redovisar i kronor och handlas i kronor — ingen valutatermin gömmer sig i multiplarna. En ren räkneövning i samma andetag: P/E 10,29 delat med 1,0475 (ett plus prognostillväxten 4,75 procent, använd som räknestorhet, inte som prognos) blir **9,82** — om vinsten växer i den takten och kursen står stilla sjunker P/E från redan låg nivå; multiplens dubbla natur (kursen eller vinsten) är övningens innehåll, inte en handssignal.
- Ordlista för alla begrepp finns i [kurserna](/kurser) — fastighetsguiden går igenom substansvärde, direktavkastning och belåning. Metodtransparensen finns på [transparenssidan](/transparens) och [källsidan](/kallor).
- Efter rapporten uppdateras bolagsuniversumets nyckeltal vid nästa insamling och aspektsidorna speglar nya medianer. Med Balder, Prologis och syskonpaketet Kambi växer serien med tre branschläsarter samma omgång — och på fastighetssidan återstår Catena och Diös (23 oktober-klassens resterande par) som nästa kandidater när deras egna kalendrar verifierats. Oavsett utfall blir det nya rader i det öppna kvittot, inte prognoser.

## Källor

- Rappdag 2026-10-23, rytm Q1 2026-05-08 och Q2 2026-07-14 kl 08:00, fjolårets Q3 2025-10-28, nästa post bokslut 2027 (Inderes 2027-02-12, tredjepart): Balders egen kalender på balder.se ("Interim report January–September 2026, 23 October 2026", sökverifierad 2026-09-20) samt Cision-inbjudan för Q2 — internt underlag: data/blogg-utkast/kvartal/2026-q3/kalender-fastighet.json (hämtdatum 2026-09-15; kalenderfilen själv orörd av detta paket).
- Nyckeltal, kurser, börsvärde och serier: bolagsuniversumets insamling 2026-09-03 (Yahoo Finance quoteSummary-moduler; andra källan MarketStack saknade färsk kurs — ingen dubbelkoll det datumet, dokumenterat i postens notering; ROIC = approximerad proxy; fyra räkenskapsår, inte fem) — internt: data/portfolj-system/bolagsunivers.json. Andra mätpunkten: data/cache/netnet-BALD_B_ST.json (cachad 2026-09-16; kurs 50,06, P/B 0,636, P/E 9,66, NCAV −106,48 kronor per aktie, klass "ej").
- Medianer och rangtal: beräknade 2026-09-20 ur samma universumfil — 225 bolag, varav 17 fastighet (ROE/FCF n=16); femteplats-formuleringen avser P/E, skuld/EK, EBIT-marginal och FCF-yield; fjärdeplatserna P/B och resultatutslag.
- Identitetstest: egen beräkning enligt P/E = P/B ÷ ROE (0,678 ÷ 0,0704 = 9,63 mot källans 10,29, källan 6,4 procent över; omvänt 10,29 × 0,0704 = 0,724 mot 0,678; implicit vinst per aktie 53,30 ÷ 10,29 = 5,18 kronor; implicit bokfört kapital 53,30 ÷ 0,678 = 78,61 kronor) — redovisad steg för steg. PEG-kontrollen: 10,29 ÷ 4,75 = 2,17 mot källans 1,53, kvot 0,71.
- Scenarioruta, marginalvikt och övrig aritmetik: egna beräkningar på 2025 års bas (13 721 × 0,6633 = 9 101; 1 pp marginal = 137 miljoner; 3 procent intäkter = 273 miljoner; vikten 1 ÷ (3 × 0,6633) = 0,50).
- Vågskikt: Balder finns inte i vågvalideringens domprotokoll (2026-09-04, tolv tickers) och inte i analysbiblioteket — paketet redovisar ingen vågklassificering; luckan är information, inte något gissat fram.

Allt innehåll är utbildning i metod enligt lagen (2007:528) om värdepappersrörelser — inga köp-, sälj- eller behållningsrekommendationer. Publicering av utkastet är kundens beslut (R2).`;

const ord = body.trim().split(/\s+/).length;
const paket = {
  slug: "sa-laser-du-balder-q3-2026",
  title: "Balders Q3-rapport 2026 (januari–september): så läser du den — fastighetsgrenens största balansräkning: räntechockens förlustår −6,7 miljarder, 32 procents rabatt mot bokfört kapital och femteplatserna som signerar belåningen",
  description: "Balder — börsens största nordiska fastighetsbolag — redovisar interimsrapporten januari–september fredagen 23 oktober, datumet bolagets egen kalender. Läspaketet: P/B-läsningen med kursen 32 procent under bokfört kapital och belåningen 1,48 som samma berättelses andra sida, resultatsvängen 10 175 → −6 746 → 3 304 → 7 621 miljoner som grenens tydligaste CAGR-kritik, identitetstestet på 6,4 procent, PEG-kontrollen där källan hamnar under konventionen (0,71), seriens första dubbelmätta fastighetspost (två mätpunkter 13 dagar isär som samstämmer till tiondelen), NCAV-pedagogiken med ett mått negativt per konstruktion, femteplats-formen i branschtabellen och 3x3-scenarioruta i ren aritmetik. Utbildning i metod, aldrig råd.",
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: "2026-10-23",
  readingMinutes: Math.max(3, Math.round(ord / 600)),
  tags: ["kvartalsrapport", "Fastighets AB Balder", "fastighet", "nyckeltal", "läspaket", "Sverige"],
  body,
};
const SOKVAG = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-balder-q3-2026.json";
fs.writeFileSync(SOKVAG, JSON.stringify(paket, null, 1) + "\n");
console.log("SKREV", SOKVAG, "| ord:", ord, "| readingMinutes:", paket.readingMinutes,
  "| tecken body:", body.length);
