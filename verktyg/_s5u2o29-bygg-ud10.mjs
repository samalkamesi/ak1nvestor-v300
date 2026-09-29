#!/usr/bin/env node
// Byggare för s5-u2 o29: ud-10-ex-dagens-mekanik.json (kurskälla). Påhittade tal.
import { writeFileSync } from "node:fs";

const kurs = {
  slug: "ud-10-ex-dagens-mekanik",
  category: "UTDELNINGSSTRATEGI",
  weight: "—",
  chapterCount: 6,
  totalMinutes: 22,
  title: "Ex-dagen — avstämningsdagen, kursfallet och mekaniken ingen förlorar på",
  summary:
    "Utdelningsfamiljens tionde steg tar den mest frågade av alla mekaniker: varför föll aktien på ex-dagen — förlorade jag pengar? Sonden mot 495-registret visar det vita fältet: kalendern ägs av ud-07 och optionens paritet av od-05, men utdelningens PRISMEKANIK — avstämningsdagen, ex-spärren, den teoretiska ex-kursen — står utan ägare. Kursen bygger det påhittade Lindvalls Livs AB och räknar datumens aritmetik: kursen 120,00 som justeras till 115,50 av utdelningen 4,50, frukosthandelns courtage-matematik som landar på minus 98 kronor, den korta positionen som betalar 112,50, prisindex som faller medan totalavkastningsindex räknar tillbaka — och skillnaden mellan mekanik och budskap. Pedagogisk kurs i läskonst — inte investeringsråd.",
  minutes: 22,
  xp: 50,
  level: "Intermediär",
  why: "Familjens nio första steg har läst utdelningen som policy och innehåll: ud-01 utdelningskvoten, ud-02 återinvesteringen, ud-03 aristokraterna, ud-04 fällorna, ud-05 DRIP:en, ud-06 de svenska bolagen, ud-07 kalendern, ud-08 de speciella utdelningarna och ud-09 hållbarheten. Tionde steget läser utdelningen som HÄNDELSE i kursen: datumen som bestämmer äganderätten och prisfallet som inte är ett budskap. Gränserna mot grannarna: ud-07 utdelningskalendern äger DATUMEN och deras kalender — denna kurs äger MEKANIKEN kring dem (avstämningsdag mot ex-dag, den teoretiska ex-kursen, betalningsflödet); od-05 äger ex-dagen för OPTIONER — paritetens justering, här endast en gränsnot; am-06 äger kortläget och utlåningsmekaniken — här endast konsekvensen att den korta erlägger utdelningen; am-07 äger indexomläggningarna (medlemmarnas byte) — här utdelningsjusteringen av indexnivån; km-052 äger ISK:ens beskattning — här en enda mening; ks-04 rör avstämningsdagar i emissionssammanhang (teckningsrätternas datum) — där ägs de av emissionen, här av utdelningen; ud-09 äger hållbarheten i kronorna — denna kurs äger dagen de betalas. Sond mot 495-registret 2026-09-29: «avstämningsdag» två träffar utanför familjen (ks-04, od-05, båda förbipasserande), «äganderätt dag» noll, «teoretisk ex» två utanför familjen — ex-dagsprismekaniken saknar kursägare. Om du kan bolagets utdelning men inte varför kursen föll på ex-dagen: du kan inte skilja mekanik från budskap.",
  learn: "Avstämningsdagen äger rätten: den som står i aktieboken den dagen får utdelningen — inga undantag · Ex-dagen är spärren: den som köper på ex-dagen får ingen utdelning; med T+2-clearing (sedan hösten 2018) ligger ex-dagen en bankdag före avstämningsdagen · Teoretisk ex-kurs: Lindvalls Livs (påhittat) 120,00 − 4,50 = 115,50 — kursen justeras ned med exakt utdelningen, inget värde försvinner · Frukosthandelns matte: 100 aktier, in 12 049 (12 000 + 49 courtage), ut 11 951 (11 550 − 49 + 450 utdelning) — netto minus 98 kronor = −0,82 procent, exakt de två courtagen · Direktavkastningen 4,50/120,00 = 3,75 procent tas UR kursen, inte utöver den · Betalningen (utdelningsdagen) kommer inom några bankdagar efter avstämningsdagen — handelsplatsen håller reda, mottagaren behöver inte anmäla sig · Den korta positionen betalar: 25 utlånade aktier × 4,50 = 112,50 kronor i skyldighet på ex-dagen (am-06 äger kortläget) · Prisindex faller med utdelningen på ex-dagen, totalavkastningsindex (GI) räknar tillbaka den — am-07 äger omläggningarna, här ägs justeringen · Kvartalsutdelare har fyra ex-dagar om året — mekaniken återkommer, kalendern ägs av ud-07",
  history: {
    origin:
      "Mekaniken är äldre än börsens elektronik. När aktier var papper var ägandet en fysisk handling: att sälja var att överlämna ett certifikat, och att få utdelning var att klippa en kupong i papperets hörn och lösa in den — därifrån kommer uttrycket att «klippa kuponger». Avstämningsdagen föddes ur samma behov: bolaget måste kunna veta, med ett beslutsdatum, vem som äger och ska betalas. Från början kunde handel och omregistrering ta veckor, och datumens betydelse var därför desto större: den som sålt dagen före avstämning men inte hunnit registrera överlåtelsen kunde i värsta fall stå utan både aktier och utdelning.",
    evolution:
      "Dematerialiseringen — i Sverige VPC-systemet från 1990-talet, sedermera Euroclear Sweden — flyttade ägarförteckningen till data: avstämning blev en ögonblicksblick i ett register, och kupongerna försvann. Däremot levde tidsgapet kvar: en affär behövde fortfarande dagar på sig att clearea och betalas. Allt eftersom clearingcyklerna kortades — från veckor till dagar — flyttade ex-dagen närmare avstämningsdagen: under T+3 låg spärren två bankdagar före, och när Europa och Sverige gick till T+2 hösten 2018 flyttade den till en bankdag före. Samma mekanik, allt snävare tolerans.",
    modern:
      "I dag sköter handelsplattformarna det mesta osynligt: utdelningen krediteras kontot, kalendern finns i plattformen, och indexen justeras automatiskt. Men frågan som kursen svarar på är fortfarande bland de vanligaste hos nya aktiesparare: aktien «föll» på ex-dagen — är det någon som vet något? Svaret är aritmetik, inte information: kursen justerades ned med utdelningen, och den som vill veta vad marknaden TYCKER måste mäta mot den justerade nivån, inte mot gårdagens osjusterade kurs. I USA kortades clearing till T+1 under 2024, vilket förde deras ex-dag närmare avstämningsdagen — samma rörelse, snävare gap.",
  },
  chapters_list: [
    { num: 1, title: "Grunderna — två datum, en äganderätt", minutes: 4 },
    { num: 2, title: "Tidslinjen — T+2 och dagen som flyttade", minutes: 4 },
    { num: 3, title: "Praktisk tillämpning — teoretisk ex-kurs och frukosthandelns courtage", minutes: 4 },
    { num: 4, title: "Det som syns i kursen — justering, återhämtning och indexens två ansikten", minutes: 4 },
    { num: 5, title: "Fällor och missvisningar — jakt, kortläge, optioner och schablonen", minutes: 4 },
    { num: 6, title: "Mästerskap — datumen som ram för utdelningshantverket", minutes: 2 },
  ],
  lynchSection:
    "Peter Lynch tränade sina läsare i konsten att skilja bolagets historia från aktiens kurs — och ex-dagen är den renaste träningssituationen: kursen faller ett exakt belopp utan att bolaget förändrats en millimeter. Lynch-läxan i kursen är att den som förväxlar mekanisk justering med en signal kommer att läsa alla kurser fel: först sorteras aritmetiken bort (utdelningen ur kursen), sedan kan det som återstår tolkas. Att fråga «vad händer med bolaget?» före «vad hände med kursen?» är hela hans hantverk i en enda ordning.",
  grahamSection:
    "Benjamin Grahams Mr Market bjuder varje dag priser utan förnuftig grund — utom en dag, då priset är rent mekaniskt: ex-dagen. Kursnedgången är där inte humör utan subtraktion, och säkerhetsmarginalen påverkas inte ett ögonblick: värdet av bolaget efter utdelningen är summan av verksamheten och kontanter som lämnat den. Grahams läxa i kursen är att skilja de två fallen — marknadens sinaningar och systemets justeringar — eftersom bara det första bär information; det andra bär aritmetik.",
  ak1Section:
    "I AK1A:s metodik är ex-dagen utdelningsdimensionens kalibreringspunkt: datumens logik (avstämning mot spärr), den teoretiska ex-kursens räknelära, courtage-matematiken i ex-dagsjakten och källkritiken mot berättelsen om «gratis utdelning». Kursen korsar medvetet gränserna till ud-07 (kalendern), ud-05 (återinvesteringens exekveringsdag), am-06 (kortläget), od-05 (optionens paritet) och am-07 (indexens justering) — varje korsning noteras, ingen grannkurs lärs om. Utbildning i läskonst — mekaniken undervisas, aldrig någon handelsuppmaning.",
  chapters: [
    {
      num: 1,
      minutes: 4,
      title: "Grunderna — två datum, en äganderätt",
      intro: "Utdelningen är en överföring mellan två parter — och systemet behöver exakt en dag för att veta vilka de är.",
      blocks: [
        {
          type: "text",
          content:
            "Styrelsen beslutar utdelning med tre datum knutna till sig: avstämningsdagen (den dag äganderätten bestäms), utdelningsdagen eller betalningsdagen (den dag pengarna betalas ut) och — som en ren konsekvens av handelns teknik — ex-dagen, den första handeldag då köparen inte längre har rätt till utdelningen. Av dessa tre är det avstämningsdagen som juridiskt äger rätten: den som är registrerad ägare i aktieboken när dagen är avstämd får utdelningen. Punkt. Varken god vilja, courtage eller snabb handel ändrar på det.\n\nEx-dagen är inte ett eget beslut utan en spärr som clearingtiden skapar. En affär är inte klar i ögonblicket du trycker — den ska cleareas och betalas, och i Sverige tar det sedan hösten 2018 två bankdagar (T+2). Räknat baklänges: för att en köpare ska hinna stå i aktieboken på avstämningsdagen måste affären vara klar senast en bankdag dessförinnan. Ex-dagen är därför avstämningsdagen minus en bankdag — den sista handeldagen med utdelningsrätt är dagen före ex-dagen, och ett förvärv på ex-dagen hamnar ett steg för sent i systemet. Det är hela mysteriet. Kursens exempelbolag genom hela kapitlet är Lindvalls Livs AB — påhittat, med påhittade tal — med helårsutdelningen 4,50 kronor och kursen 120,00 dagen före ex-dagen.\n\nVärt att minnas från första läsningen: utdelningen tas ur kursen, inte utöver den. Den som säljer på ex-dagen har behållit sin utdelningsrätt (affären cleareas på avstämningsdagen); den som köper på ex-dagen köper bolaget UTAN kommande utdelning — och priset har redan justerats därefter. Marknaden gör inga gåvor, bara överföringar.",
        },
        {
          type: "definition",
          content:
            "Avstämningsdagen (record day): dagen då äganderätten till utdelningen bestäms — den som står i aktieboken denna dag får utdelningen. Ex-dagen (efter latinets ex, «utanför»): första handeldag då köparen köper utan rätt till den aktuella utdelningen; med T+2-clearing en bankdag före avstämningsdagen. Utdelningsdagen (betalningsdagen): dagen kontanterna betalas ut, vanligtvis inom några bankdagar efter avstämningen.",
        },
        {
          type: "insight",
          content:
            "Avstämningsdagen äger rätten, ex-dagen spärrar tillträdet, utdelningsdagen flyttar pengarna — tre datum, en överföring, och kursen justerar sig vid det mellersta.",
        },
      ],
    },
    {
      num: 2,
      minutes: 4,
      title: "Tidslinjen — T+2 och dagen som flyttade",
      intro: "Var ex-dagen ligger är inte en regel utan en räknekonsekvens av hur många dagar en affär behöver för att bli klar.",
      blocks: [
        {
          type: "text",
          content:
            "Tidslinjen för Lindvalls Livs vårutdelning, med påhittade datum: torsdag den 7 maj handlas aktien sista dagen MED utdelningsrätt — affären cleareas och betalas T+2, det vill säga måndag den 11 maj, som också är avstämningsdagen. Fredag den 8 maj är ex-dag: handelsplatsen räknar om kursen med utdelningen subtraherad, och alla nyinköp från och med nu kommer för sent för denna utdelning. Betalningen landar på kontot utdelningsdagen, säg onsdag den 13 maj — inom några bankdagar efter avstämningen, exakt när bestämmer bolagets beslut, och informationen levereras av handelsplattformen.\n\nAtt ex-dagen ligger precis en bankdag före avstämning är alltså aritmetik: T+2 baklänges. Därför flyttade också ex-dagen när clearingtiden förkortades — under T+3 (före hösten 2018) låg spärren två bankdagar före avstämningsdagen, och den som läst äldre litteratur om utdelningsdatum möter därför en annan räkneordning än dagens. I USA kortades clearing till T+1 under 2024, vilket förde deras ex-dag ända inpå avstämningsdagen. Samma mekanik överallt: spärrens avstånd till avstämningen är clearingtidens längd, ett plus en minus.\n\nEn detalj som skiljer Sverige från vissa andra marknader: svenska bolag betalar utdelningen i pengar till kontot, och registreringen sköts automatiskt av förvarare och central värdepappersförvarare — ingen kupong ska skickas in, ingen anmälan göras. Den enda handling som krävs av ägaren är att INTE sälja — eller rättare: att ägandet stå kvar över avstämningsdagen.",
        },
        {
          type: "tabell",
          content:
            "Tidslinjen för en utdelning (Lindvalls Livs, påhittade datum och tal): TORS 7 MAJ — sista handeldag med utdelningsrätt; affär cleareas T+2 · FRE 8 MAJ — EX-DAG: kursen justeras med 4,50 (120,00 → 115,50 teoretisk ex-kurs); köpare från och med nu utan rätt · MÅN 11 MAJ — AVSTÄMNINGSDAG: aktieboken fotas; dessa ägare betalas · ONS 13 MAJ — UTDELNINGSDAG: 4,50 per aktie krediteras kontot · REGELN — ex-dag = avstämningsdag minus en bankdag under T+2; minus två under T+3 (före 2018) · LÄSANVISNINGEN — datumen är en kö av systemhändelser; endast den som fattar beslut om att förvärva eller avyttra känner av dem, och kursen registrerar dem i sin justering.",
        },
        {
          type: "insight",
          content:
            "Ex-dagens läge är clearingtidens skugga: förkortas tiden ett steg flyttar spärren ett steg närmare avstämningen — mekaniken är oförändrad, bara klockan är annorlunda.",
        },
      ],
    },
    {
      num: 3,
      minutes: 4,
      title: "Praktisk tillämpning — teoretisk ex-kurs och frukosthandelns courtage",
      intro: "Nu räknas mekaniken i kronor: en justering som ser ut som ett fall och en strategi som ser ut som en gåva.",
      blocks: [
        {
          type: "text",
          content:
            "Den teoretiska ex-kursen är subtractionen själv: gårdagens slutkurs 120,00 minus utdelningen 4,50 ger 115,50. Handelsplatsen publicerar den som referens inför ex-dagens öppning, och öppningsauktionen kan landa var som helst kring den — marknadens sinningar läggs ovanpå justeringen, inte i stället för den. Att läsa ex-dagskursen rätt är därför en tvåstegsrörelse: först den mekaniska justeringen (minus 4,50), sedan det verkliga kurssvaret (avvikelsen från 115,50). Den som jämför morgondagens kurs med gårdagens osjusterade 120,00 och utbrister «minus 3,8 procent!» har läst subtraktion som nyhet.\n\nSedan frukosthandeln — idén att köpa dagen före ex-dag, ta utdelningen och sälja dagen efter: «gratis utdelning». Räkneexemplet med 100 Lindvalls-aktier och ett courtage på 49 kronor per affär (påhittad plattformsnivå, endast för aritmetiken): inköp torsdagen kostar 12 000 + 49 = 12 049. På onsdag landar 450 kronor i utdelning (100 × 4,50). Försäljning till ex-kursnivån 115,50 ger 11 550 − 49 = 11 501. Summa in: 11 501 + 450 = 11 951. Netto: 11 951 − 12 049 = MINUS 98 KRONOR — exakt de två courtagen, en avkastning på −0,82 procent. Överföringen var nollsumma: kursfallet betalade utdelningen till punkten och prick, och den enda som tog betalt var plattformen, två gånger.\n\nFallets generella form: utdelningsjakt runt ex-dagar har inget positivt väntevärde av själva mekaniken — den är omsorgsfullt neutral. Det som kan finnas är kursernas beteende runt ex-dagar (den som vill studera dem mäter mot den justerade nivån), och där slutar aritmetikens territorium och empirins börja. Detta är utbildning i mekanik — ingen handelsstrategi rekommenderas, och de som söker system i ex-dagsövergångar gör det på egen risk, med risken att courtage och spread äter mer än mekaniken någonsin ger.",
        },
        {
          type: "tabell",
          content:
            "Frukosthandelns räknelära (Lindvalls Livs, påhittade tal): INKÖP TORS 7 MAJ — 100 aktier × 120,00 = 12 000 + 49 courtage = 12 049 · UTDDELNING — 100 × 4,50 = 450 på utdelningsdagen · FÖRSÄLJNING TILL TEORETISK EX-KURS — 100 × 115,50 = 11 550 − 49 courtage = 11 501 · NETTO — 11 501 + 450 − 12 049 = MINUS 98 kronor = −0,82 procent · FÖRKLARINGEN — överföringen är nollsumma: kursjusteringen betalade exakt utdelningen; courtagen är enda säkra utfallet · DIREKTAVKASTNINGEN — 4,50/120,00 = 3,75 procent, men UR kursen, inte utöver den · LÄSANVISNINGEN —kursen räknar konsekvenserna av mekaniken, den rekommenderar aldrig en handel.",
        },
        {
          type: "insight",
          content:
            "Frukosthandelns facit är minus två courtagen — mekaniken är byggd för att vara neutral, och den som letar en gåva i subtraktionen betalar för att få leta.",
        },
      ],
    },
    {
      num: 4,
      minutes: 4,
      title: "Det som syns i kursen — justering, återhämtning och indexens två ansikten",
      intro: "Efter ex-dagen börjar det intressanta: vad betyder det att kursen «går tillbaka» — och vad ser indexen?",
      blocks: [
        {
          type: "text",
          content:
            "En vanlig läsning efter ex-dagen är återhämtningen: kursen som under dagarna eller veckorna efter klättrar tillbaka mot nivån före utdelningen. Det finns ingen mekanik som kräver det — och ingen som förbjuder det. Kursen rör sig som vanligt runt den justerade nivån, och om bolaget levererar som vanligt är det inte märkligt att priset återfinner sin gamla bana: utdelningen togs ut, värdet byggdes tillbaka. För en utdelningsinvesterare med lång horisont är återhämtningstakten därför en empirisk fråga — inte en mekanisk garanti. Mät alltid mot 115,50, inte mot 120,00.\n\nIndexen visar mekanikens två ansikten. Prisindex — som mäter kurserna utan utdelningar — faller mekaniskt på ex-dagen med utdelningens vikt; totalavkastningsindex (i Sverige ofta betecknat GI, gross index) räknar utdelningen tillbaka som återinvestering samma dag. Två index, samma verklighet, olika frågor: prisindex svarar på «vad kostar korgen?», totalavkastningen på «vad har ägaren fått?». Den som jämför svensk kursutveckling över tid utan att veta vilket index hen tittar på kan misstolka en utdelning som ett fall — tvärs genom alla bolag som delar ut. (Indexens omläggningar — när bolag tillkommer och försvinner — ägs av am-07; här ägs bara utdelningsjusteringen.)\n\nFör Lindvalls Livs betyder ex-dagen i indexvärlden: prisindex backar med 4,50 delat med bolagets vikt i indexet — ett litet hack i en stor korg, ett tydligare hack för tunga utdelningsbetalande bolag. Totalavkastningsindex noterar ingenting alls: överföringen var intern.",
        },
        {
          type: "tabell",
          content:
            "Indexens två ansikten vid en utdelning (Lindvalls Livs, påhittade tal): PRISINDEX — faller på ex-dagen med utdelningens vikt; hacket är mekanik, inte budskap · TOTALAVKASTNINGSINDEX (GI) — räknar utdelningen tillbaka som återinvestering samma dag; noterar ingen förändring · SVAR PÅ OLIKA FRÅGOR — prisindex: «vad kostar korgen?» · totalavkastning: «vad fick ägaren?» · ÅTERHÄMTNINGEN — ingen mekanisk garanti; en empirisk fråga mätt mot den justerade nivån 115,50 · LÄSANVISNINGEN — veta vilket index man läser är grundläggande källkritik; mekaniken sorteras bort före tolkningen.",
        },
        {
          type: "insight",
          content:
            "Prisindex faller där utdelningen lämnar korgen, totalavkastningen ser ingenting — samma dag, samma bolag, två sanna tal som svarar på två olika frågor.",
        },
      ],
    },
    {
      num: 5,
      minutes: 4,
      title: "Fällor och missvisningar — jakt, kortläge, optioner och schablonen",
      intro: "Fyra grannskap där ex-dagen spelar in — och där gränserna mot grannkurserna är som tydligast.",
      blocks: [
        {
          type: "text",
          content:
            "Fälla ett: ex-dagsjakten som strategi. Kapitel tre räknade frukosthandelns minus 98 kronor; fällans djupare form är tanken att utdelningen vore avkastning UTAN att kursen betalade för den. Direktavkastningen 3,75 procent är ett mått på utdelningens storlek relativt kursen — inte en på förhand säker avkastning, eftersom ex-dagen subtraherar den ur priset. Utdelningsfällorna i bredare mening (utdelningar som hotas, kvasi-avkastning som äts av kursfall) ägs av ud-04 — här ägs bara datumsmekaniken.\n\nFälla två: kortläget. Den som sålt aktier han inte äger — genom att låna dem — står på motsatt sida av överföringen: på ex-dagen erläggs utdelningen av den korta positionen, 25 utlånade aktier i Lindvalls ger 25 × 4,50 = 112,50 kronor i skyldighet. I praktiken sköts detta av lånepartens kompensationsmekanik (utlåningsavgiften justeras), och hela kortlägets värld ägs av am-06 — här är det konsekvensen som hör hemma: ex-dagen är en överföring mellan lång och kort, inte bara ett kurshack.\n\nFälla tre: optionerna. En option på Lindvalls justeras inte som aktien — försäljning av utdelningsstorleken sker i stället genom optionens paritet och lösenprisens behandling, och hela det grannskapet ägs av od-05 (ex-dagen, pariteten, det glömda kassaflödet). Gränsnot räcker: samma datum, andra instrument, andra regler — den som blandar mekanikerna läser båda fel. Fälla fyra: schablonen. På investeringssparkonto och kapitalförsäkring beskattas inte utdelningen som inkomst — kapitalunderlaget och schablonen bär den (km-052 äger hela beskattningsläran; kursen noterar bara att utdelningens DAG ser likadan ut ovanför alla kontotyper). Gemensamt för de fyra: ex-dagen är alltid en överföring och aldrig en gåva — oavsett vilken sida av den man står på.",
        },
        {
          type: "tabell",
          content:
            "Fällorna vid ex-dagen (grannkursernas gränser): EX-DAGSJAKTEN — mekaniken nollsumma, courtagen säkra kostnader (kapitel tre: minus 98 kronor); bredare fällor ägs av ud-04 · KORTLÄGET — den korta erlägger utdelningen: 25 × 4,50 = 112,50 kronor; kortlägets mekanik ägs av am-06 · OPTIONERNA — paritet och lösenprisbehandling, hela fältet ägs av od-05; samma datum, andra regler · SCHABLONEN — ISK/KF: ingen separat utdelningsbeskattning, kapitalunderlaget bär den; läran ägs av km-052 · KVARTALSUTDELARNA — fyra ex-dagar per år; kalendern ägs av ud-07 · LÄSANVISNINGEN — fyra grannskap, fyra gränsnoter; kursen äger överföringen och dess aritmetik.",
        },
        {
          type: "insight",
          content:
            "Ex-dagen är en överföring mellan lång och kort, mellan korg och kontant, mellan konto och konto — aldrig en gåva, och den som glömmer det betalar för minnesluckan.",
        },
      ],
    },
    {
      num: 6,
      minutes: 2,
      title: "Mästerskap — datumen som ram för utdelningshantverket",
      intro: "När mekaniken sitter blir datumen vad de alltid varit: ramen som utdelningshantverket hänger i.",
      blocks: [
        {
          type: "text",
          content:
            "Utdelningsfamiljens kurser samlas kring dessa datum från var sitt håll: ud-07 bygger kalendern av dem, ud-05 låter återinvesteringen löpa på dem, ud-08 skiljer de speciella utdelningarnas datumsmönster från de ordinarie, ud-09 stressar kronorna som betalas och ud-01 mäter andelen av resultatet de får. Tionde steget lärde det systemet datumens inre liv: avstämningen som äger rätten, spärren som clearingtiden ritar, justeringen som ser ut som ett fall. Den som behärskar båda halvorna — innehållet och mekaniken — läser en utdelningsbörs utan att förväxla subtraktion med signal.\n\nFem frågor till varje utdelningsdatum: När är avstämningsdagen — och därmed ex-dagen? Hur stor är den teoretiska justeringen i kronor och procent? Hur mycket av direktavkastningen tas ur kursen? Vilken sida av överföringen står min position på — och vad kostar den mig i courtage att byta? Och: mäter jag kursens fortsatta väg mot den justerade nivån, eller mot gårdagens siffra? Frågorna är samma varje gång; det är svarens kvalitet som skiljer hantverket.",
        },
        {
          type: "text",
          content:
            "Övningen som avslutar kursen använder verkliga datum — men i utbildningens syfte: att träna läsningen av mekaniken, inte att styra någon handel.",
        },
        {
          type: "utmaning",
          content:
            "Din utmaning: välj ett börsbolag med kommande utdelning (verkliga datum i övningen, påhittade i kursen) och följ det runt ex-dagen. Notera avstämningsdag och ex-dag, kontrollera att avståndet är en bankdag, räkna ut den teoretiska ex-kursen och jämför med faktisk öppningskurs — avvikelsen är marknadens röst, justeringen är systemets. Skriv en mening om vad direktavkastningen blev efter justeringen och en om vad ex-dagsförlopet sa om mekanik contra budskap. Detta är en övning i läskonst — ingen uppmaning att köpa, sälja eller tajma något.",
        },
      ],
    },
  ],
};

writeFileSync("/home/ak1a/AK1/data/kurser-tillagg/ud-10-ex-dagens-mekanik.json", JSON.stringify(kurs, null, 2) + "\n");
console.log("SKREV ud-10-ex-dagens-mekanik.json:", JSON.stringify(kurs).length, "tecken,", kurs.chapters.length, "kapitel");
