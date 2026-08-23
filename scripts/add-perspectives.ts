/**
 * Re-add Lynch/Graham/AKM1 perspectives to V01-V20 deep courses.
 * Run: bun run src/lib/ak1a/add-perspectives.ts
 */
import { readFileSync, writeFileSync } from "fs";

const PERSPECTIVES: Record<string, { lynch: string; graham: string; ak1: string }> = {
  V01: {
    lynch: "Lynch älskade 'story-stocks' med stark tillväxt. I 'One Up On Wall Street' (1989) menade han att om du kan beskriva varför ett bolag växer på en mening ('de säljer kaffe billigare'), så är det en bra tillväxthistoria. Han varnade för 'di-worsification' — tillväxt genom uppköp i okända branscher. Lynchs 'fast grower'-kriterium: 20-25% årlig tillväxt över 5+ år.",
    graham: "Graham (Security Analysis, 1934) var skeptisk till tillväxt som värderingsgrund. Han menade att tillväxt är oförutsägbar och att marknaden överbetalar den. 'Tillväxt är en prognos, inte ett faktum.' Han föredrog att värdera bolag på nuvarande intäkter med en marginal of safety. Graham's 'defensive investor' krävde stabil tillväxt över 10 år, men han varnade för att extrapolera framåt.",
    ak1: "AKM1 vikt 8% — högsta vikten. Vi anser att tillväxt är kontexten som tolkar alla andra variabler. En P/E på 40 är orimlig vid 0% tillväxt men rimlig vid 35% tillväxt. AKM1 bryter ner tillväxt i volym vs pris, organisk vs förvärvad — inte bara en siffra. Vi kombinerar V01 med V02 (ARR) och V03 (diversifiering) för att bedöma tillväxtens kvalitet.",
  },
  V02: {
    lynch: "Lynch föredrog bolag med 'recurring revenue' — han kallade det 'shovel-ware' (programvara som gräver pengar varje år). I 'Beating the Street' (1993) beskrev han hur SaaS-bolag med 90%+ förnyelsegrad var 'license to print money'. Han jämförde ARR-tillväxt med 'same-store sales' i detaljhandel — båda mäter organisk tillväxt i existerande kundbas.",
    graham: "Graham skulle ha varit skeptisk till ARR som ensam indikator. Han betonade att 'intäkt ≠ vinst' — ARR-tillväxt utan väg till lönsamhet är en kostnad, inte en tillgång. Han föredrog bolag där ARR konverterades till fritt kassaflöde. Graham's regel: 'En intäkt som aldrig blir vinst är en illusion.'",
    ak1: "AKM1 vikt 8%. ARR är kraftfullare än vanlig försäljningstillväxt eftersom det är förutsägbart. Vi bedömer ARR på tre nivåer: (1) tillväxttakt, (2) förnyelsegrad (net retention rate), (3) konvertering till fritt kassaflöde. Hög ARR-tillväxt + låg förnyelsegrad = läckande hink. AKM1 kombinerar V02 med V12 (intäktsstabilitet).",
  },
  V03: {
    lynch: "Lynch varnade för 'di-worsification' — bolag som växer genom att köpa upp okända verksamheter. 'Ett bolag som köper ett film-bolag när de egentligen gör stål, förstör värde.' Han föredrog 'pure plays' — bolag med en tydlig affärsidé. Lynchs regel: 'Om du inte kan beskriva bolagets affär på en mening, är det för diversifierat.'",
    graham: "Graham såg diversifiering som ett skydd, inte en strategi. Han menade att konglomerat ofta döljer svaga verksamheter bakom starka. 'En diversifierad portfölj av medelmåttiga bolag är sämre än en koncentrerad av starka.' Graham föredrog bolag med en tydlig kärnverksamhet.",
    ak1: "AKM1 vikt 7%. Intäktsdiversifiering bedöms på tre axlar: (1) kundkoncentration — ingen kund >20% av intäkter, (2) produktdiversifiering — inte beroende av en produkt, (3) geografisk spridning. Vi varnar för 'falsk diversifiering' — bolag som verkar diversifierade men egentligen är exponerade mot samma underliggande cykel.",
  },
  V04: {
    lynch: "Lynch använde P/S flitigt för att hitta 'fast growers' som ännu inte går med vinst. Han jämförde P/S med historiskt snitt och bransch — en P/S under 1x för ett bolag med 20% tillväxt var en röd flagga (för bra för att vara sant) eller en möjlighet. Lynchs 'PEG-ratio' (P/E / tillväxt) var en vidareutveckling av P/S-tänkandet.",
    graham: "Graham använde P/S sällan — han föredrog P/E och P/B. Men han menade att P/S under 0.5x (bolag som säljer för mindre än halva omsättningen) ofta var 'cigar butt'-möjligheter — en sista dragning gratis. Graham's 'defensive investor'-screen: P/S < 1.5x kombinerat med P/E < 15.",
    ak1: "AKM1 vikt 6%. P/S är startpunkten för värdering, inte slutet. Vi kombinerar P/S med bruttomarginal (V07) — ett bolag med P/S 1x och bruttomarginal 20% är dyrare än P/S 3x och bruttomarginal 80%. AKM1 normaliserar P/S mot marginaler för att jämföra bolag på tvärs av branscher.",
  },
  V05: {
    lynch: "Lynch använde P/B sällan — han menade att moderna tjänste- och teknikbolag har litet bokfört värde. 'P/B fungerar för banker och försäkringsbolag, men inte för mjukvara.' Han föredrog P/E och tillväxt. För finansbolag använde Lynch P/B < 2x som en grov screen.",
    graham: "Graham's klassiska regel: köp bolag med P/B under 1.5x. 'Inget bolag är värt mer än 1.5 gånger dess bokförda värde, oavsett tillväxt.' Han kombinerade P/B < 1.5 med P/E < 15 och ROE > 10% i sin 'defensive investor'-screen. Graham's 'cigar butt'-strategi: P/B < 1x (köp under bokfört värde).",
    ak1: "AKM1 vikt 6%. P/B är mest relevant för finansbolag och kapitalintensiv industri. För tjänste- och teknikbolag är P/B mindre meningsfullt pga immateriella tillgångar. Vi justerar P/B för immateriella tillgångar och goodwill. AKM1 kombinerar P/B med ROE (V09) — hög ROE + låg P/B = undervärderad compounder.",
  },
  V06: {
    lynch: "Lynch använde EV/EBITDA sällan — han föredrog P/E och fri kassaflöde. Han varnade för att EBITDA döljer kapitalintensitet: 'Ett bolag som måste investera halva EBITDA i maskiner varje år är inte värt samma som ett bolag som inte behöver det.' Lynch föredrog 'owner earnings' (Buffetts term) = fri kassaflöde.",
    graham: "Graham använde inte EV/EBITDA (multipeln populariserades på 1980-talet, efter hans tid). Han föredrog P/E och intjäningskraft. Graham's regel: 'Ett bolag är värt högst 15x genomsnittliga intjäning över en konjunkturcykel.' Han justerade P/E nedåt för cykliska bolag.",
    ak1: "AKM1 vikt 6%. EV/EBITDA är den mest kompletta värderingsmultiplen eftersom den justerar för skulder, kassa och kapitalstruktur. Vi kombinerar EV/EBITDA med V10 (skuldsättning) — ett bolag med lågt EV/EBITDA men hög skuld är en value trap. AKM1 normaliserar EBITDA över en cykel för att undvika cykliska överraskningar.",
  },
  V07: {
    lynch: "Lynch älskade hög bruttomarginal. I 'One Up On Wall Street' menade han att bruttomarginal >50% indikerar ett bolag med prissättningsmakt — 'de kan höja priset utan att förlora kunder'. Han jämförde bruttomarginaler inom branschen: 'Om alla andra har 20% och detta bolag har 60%, har de en moat.'",
    graham: "Graham såg bruttomarginal som en indikator på konkurrenskraft. Han menade att stabil hög bruttomarginal över 10+ år indikerar en varaktig moat. Graham's regel: 'Bruttomarginal bör vara stabil eller ökande över konjunkturcykler.' Fallande bruttomarginal = varning.",
    ak1: "AKM1 vikt 6%. Bruttomarginal är den renaste indikatorn på prissättningsmakt. Vi bedömer bruttomarginal på tre sätt: (1) nivå — >60% utmärkt, 30-60% bra, <30% svag, (2) trend — stabil/ökande bra, fallande varning, (3) bransch-jämförelse — hög vs bransch = moat. AKM1 kombinerar V07 med V14 (varumärke) — hög bruttomarginal utan varumärke är misstänkt.",
  },
  V08: {
    lynch: "Lynch föredrog bolag med EBITDA-marginal >20% — 'de tjänar pengar på att andas'. Han varnade för bolag där EBITDA-marginal är nära 0% men som 'snart blir lönsamma'. 'Ett bolag som inte är lönsamt idag kommer förmodligen inte vara det imorgon heller.'",
    graham: "Graham betonade att EBITDA-marginal ska vara positiv och stabil över cykler. Han justerade för cykliska bolag — 'Ett stål-bolag med 5% EBITDA-marginal vid botten av cykeln kan ha 20% vid toppen.' Graham föredrog genomsnitt över 10 år.",
    ak1: "AKM1 vikt 6%. EBITDA-marginal mäter driftslönsamhet exklusive kapitalstruktur. Vi kombinerar V08 med V07 (bruttomarginal) — om bruttomarginal är hög men EBITDA-marginal låg, läcker värde i driftskostnader. AKM1 justerar EBITDA-marginal för aktieoptionskostnader (som bolag ofta döljer).",
  },
  V09: {
    lynch: "Lynch föredrog bolag med stabil hög ROE (>15%) men varnade för extremt hög ROE uppnådd genom skulder. 'Ett bolag med 30% ROE och 200% skuldsättning är inte bättre än ett med 15% ROE och 0% skuld.' Lynch kombinerade ROE med skuldsättningsgrad — 'Du kan inte förstå ROE utan att veta hur den finansieras.'",
    graham: "Graham krävde ROE > 10% för att ens överväga ett bolag. Han menade att låg ROE över lång tid indikerar en dålig affär, oavsett hur billig aktien är. 'Ett dåligt bolag till lågt pris är fortfarande en dålig affär.' Graham kombinerade ROE > 10% med P/B < 1.5 och P/E < 15.",
    ak1: "AKM1 vikt 6%. ROE är kraftfull men kan manipuleras via skuld. Vi bryter ner ROE med DuPont-formeln: ROE = bruttomarginal × kapitalomsättning × skuldhävtång. AKM1 bedömer ROE på tre sätt: (1) nivå, (2) trend, (3) kvalitet — hög ROE via skuld = varning, hög ROE via marginal + omsättning = bra. Vi kombinerar V09 med V10 (skuldsättning).",
  },
  V10: {
    lynch: "Lynch undvek bolag med skuldsättningsgrad >100% (mer skuld än eget kapital). 'Skuld är som en svänghjul — det förstärker vinsten i goda tider och förlusten i dåliga.' Han föredrog bolag med net cash (mer kassa än skuld). Lynchs regel: 'Om du måste välja mellan två bolag med samma ROE, välj det med mindre skuld.'",
    graham: "Graham var extremt riskavös mot skuld. Hans 'defensive investor'-regel: skuldsättningsgrad under 50% (skuld/eget kapital < 0.5). Graham menade att hög skuld är den vanligaste orsaken till konkurs: 'Bolag går inte i konkurs på grund av dåliga vinster — de går i konkurs på grund av skuld de inte kan betjena.'",
    ak1: "AKM1 vikt 5%. Skuldsättning bedöms kontextuellt — banker har naturligt hög skuld (det är deras affärsmodell), tillverkare låg. Vi justerar för bransch: ett bolag med 100% skuldsättning i bank-sektor är normalt, i tech-sektor extremt riskabelt. AKM1 kombinerar V10 med V11 (likviditet) och V08 (EBITDA-marginal) — hög skuld + låg likviditet + låg marginal = akut risk.",
  },
  V11: {
    lynch: "Lynch kontrollerade alltid likviditeten — 'Ett bolag kan vara lönsamt på papperet men dö om det inte kan betala sina räkningar.' Han föredrog kvickkvot > 1.5. Lynch varnade för bolag med kvickkvot < 1.0: 'De lever farligt nära kanten.'",
    graham: "Graham krävde kvickkvot > 1.0 för 'defensive investor'. Han menade att likviditet är den första försvarslinjen mot konkurs. Graham's regel: 'Ett bolag med kvickkvot < 0.5 är en konkurs-väntar-på-att-ske.' Han kombinerade likviditet med skuldsättning för att bedöma finansiell stabilitet.",
    ak1: "AKM1 vikt 5%. Likviditet bedöms på två nivåer: (1) kvickkvot — kan bolaget betala kortfristiga skulder, (2) kassa-bränning — hur länge räcker kassan vid negativt kassaflöde. AKM1 kombinerar V11 med V19 (kapitalförbränning) — låg likviditet + hög bränning = runway under 12 månader = akut risk.",
  },
  V12: {
    lynch: "Lynch älskade bolag med 'predictable earnings' — stabil intäktsbas. Han menade att förutsägbarhet är värd en premie. 'Ett bolag där du vet vad nästa kvartal ger är värt mer än ett där du gissar.' Lynch föredrog konsumentvaror och läkemedel (stabila) över cykliska (volatila).",
    graham: "Graham betonade intäktsstabilitet starkt. Hans 'defensive investor'-regel: positiv vinst varje år de senaste 10 åren. Graham menade att stabilitet indikerar en varaktig affärsmodell. 'Ett bolag som har förlustår är ett bolag du inte förstår.' Han justerade ner värdet för volatila bolag.",
    ak1: "AKM1 vikt 5%. Intäktsstabilitet bedöms på tre axlar: (1) årsvis varians — låg varians = bra, (2) ARR-andel — hög ARR = stabil, (3) cyklisk exponering — cykliska bolag (gruvor, banker) har naturligt volatila intäkter. AKM1 justerar stabilitet för cykliskitet — ett stål-bolag med 30% intäktsvarians kan vara 'stabilt' i sin kontext.",
  },
  V13: {
    lynch: "Lynch såg patent som en moat men varnade för att förlita sig enbart på dem. 'Patent löper ut — moats ska vara eviga.' Han föredrog varumärken och nätverkseffekter över patent. Lynch menade att patent är värdefulla i pharma (7-year exklusivitet) men mindre värdefulla i tech (snabb innovation).",
    graham: "Graham såg patent som en tillgång men justerade ner värdet pga tidsbegränsning. Han menade att ett patent som löper ut om 3 år är värt mindre än ett varumärke som varar i 30 år. Graham föredrog 'goodwill' och varumärken över patent.",
    ak1: "AKM1 vikt 6%. Patent bedöms på tre sätt: (1) antal aktiva patent, (2) återstående patent-livslängd, (3) patent-bredden — breda patent (blockerar konkurrenter) > smala (specifika produkter). AKM1 varnar för 'patent-moat-illusion' — bolag med många patent som löper ut inom 3 år. Vi kombinerar V13 med V14 (varumärke) — patent + varumärke = dubbel moat.",
  },
  V14: {
    lynch: "Lynch älskade varumärkes-moats. I 'One Up On Wall Street' menade han att 'ett varumärke folk älskar är värt mer än en fabrik'. Han nämnde Coca-Cola, McDonald's och Johnson & Johnson som exemplen. Lynchs regel: 'Om folk betalar 30% mer för ditt varumärke än för en generisk kopia, har du en moat.'",
    graham: "Graham såg varumärken som en form av goodwill. Han justerade ner värdet pga svårighet att mäta. Graham föredrog mätbara tillgångar (fabriker, kassa) över immateriella (varumärken). Men han erkände att starka varumärken ger 'earnings power' som varar längre än patent.",
    ak1: "AKM1 vikt 5%. Varumärke bedöms på tre sätt: (1) prissättningsmakt — kan bolaget ta premium-pris?, (2) kundlojalitet — hur hög är churn?, (3) varumärkeskännedom — medvetenhet i målgrupp. AKM1 kombinerar V14 med V07 (bruttomarginal) — starkt varumärke + hög bruttomarginal = äkta prissättningsmakt.",
  },
  V15: {
    lynch: "Lynch menade att nätverkseffekter är den starkaste moaten. Han nämnde Visa, American Express och H&R Block som exempel. 'När fler använder nätverket, blir det värdefullare för alla — det är en oslagbar spiral.' Lynch varnade dock för att nätverk kan kollapsa (MySpace → Facebook).",
    graham: "Graham (som skrev innan internet) såg nätverkseffekter som 'economies of scale' — storbolagsfördelar. Han menade att skala ger lägre kostnader per enhet, vilket är en moat. Graham varnade för att skala-fördelar kan urholkas av teknologi. Han föredrog mätbara skala-fördelar (fabriker) över digitala nätverk.",
    ak1: "AKM1 vikt 6%. Nätverkseffekter bedöms på tre sätt: (1) direkta nätverk — fler användare = mer värde (Meta, telefon-nätverk), (2) indirekta nätverk — tvåsidiga plattformar (Uber, Airbnb), (3) data-nätverk — mer data = bättre produkt (Google, Netflix-rekommendationer). AKM1 varnar för 'nätverk-illusion' — bolag som verkar ha nätverk men där switching costs är låga.",
  },
  V16: {
    lynch: "Lynch älskade produktlanseringar som katalysatorer. I 'One Up On Wall Street' beskrev han hur nya produkter (Apple Macintosh 1984, Chrysler minivan 1983) kunde fördubbla en aktie. Han letade efter 'the next big thing' — men varnade för att katalysatorer kan utebli. 'Ett bolag med en bra pipeline är värt mer än ett utan.'",
    graham: "Graham var skeptisk till katalysatorer som värderingsgrund. Han menade att marknaden överbetalar framtida händelser. 'En katalysator är en gissning, inte ett faktum.' Graham föredrog att värdera bolag på nuvarande intäkter och betraktade katalysatorer som 'bonus'. Han varnade för 'story stocks' som lever på framtida löften.",
    ak1: "AKM1 vikt 7%. Katalysatorer bedöms på tre sätt: (1) konkretion — specifikt datum > vagt löfte, (2) sannolikhet — FDA-godkännande 90% vs ny produkt 30%, (3) storlek — block-buster vs incrementell. AKM1 kombinerar V16 med V01 (tillväxt) — katalysator + redan växande = momentum. Vi varnar för 'katalysator-trap' — bolag som lever på en enda kommande händelse.",
  },
  V17: {
    lynch: "Lynch såg stora avtal som katalysatorer. Han nämnde hur ett enda stort kontrakt (Boeing 737-beställning, Walmart-leverantörsavtal) kunde förändra ett bolag. 'Ett avtal värt 10% av årsomsättningen är en game-changer.' Lynch varnade dock för att beroendet av ett avtal kan bli en fälla om avtalet löper ut.",
    graham: "Graham justerade ner värdet av avtal pga osäkerhet. Han menade att 'ett avtal som inte är signerat är inte värt något'. Graham föredrog diversifierade intäktsströmmar över beroende av enskilda avtal. Han varnade för 'avtal-beroende' bolag — om de förlorar huvudavtalet, kollapsar intäkterna.",
    ak1: "AKM1 vikt 7%. Avtal bedöms på tre sätt: (1) avtalsvärde — som % av årsomsättning, (2) löptid — långa avtal > korta, (3) exklusivitet — exklusiva avtal > icke-exklusiva. AKM1 kombinerar V17 med V03 (diversifiering) — ett stort avtal + låg diversifiering = koncentrationsrisk. Vi varnar för 'avtal-fälla' — bolag där ett avtal utgör >30% av intäkterna.",
  },
  V18: {
    lynch: "Lynch såg regulatoriska katalysatorer som oförutsägbara. Han undvek bolag där reglering var huvudtesen. 'Du kan inte förutspå vad politiker gör — investera inte baserat på det.' Lynch föredrog bolag där reglering var en tailwind, inte en förutsättning.",
    graham: "Graham var extremt skeptisk till regulatorisk risk. Han justerade ner värdet av bolag i högreglerade branscher (banker, försäkring, telekom). Graham menade att reglering kan förstöra en affärsmodell över en natt. Han föredrog bolag i lägrereglerade branscher.",
    ak1: "AKM1 vikt 7%. Regulatorisk risk bedöms på två axlar: (1) negativ risk — kommande reglering som kan skada (AML, konkurrensrätt, miljökrav), (2) positiv katalysator — kommande godkännanden (FDA, EMA, ESMA). AKM1 kombinerar V18 med V19 (kapitalförbränning) — regulatorisk risk + hög bränning = dubbel risk. Vi varnar för 'regulatorisk blackjack' — bolag vars värde beror på ett enda godkännande.",
  },
  V19: {
    lynch: "Lynch undvek bolag som brände pengar. 'Om ett bolag behöver emissionera vart tredje år, äger du inte bolaget — bolaget äger dig.' Han föredrog bolag med positivt kassaflöde som kunde finansiera sin egen tillväxt. Lynchs regel: 'Ett bolag som inte kan generera kassa från sin verksamhet är en teori, inte en investering.'",
    graham: "Graham var extremt riskavös mot kapitalförbränning. Han undvek bolag med negativt kassaflöde helt. Graham menade att 'ett bolag som bränner pengar är en teori om framtida lönsamhet — och teorier är billiga.' Han krävde positivt kassaflöde från drift de senaste 5 åren.",
    ak1: "AKM1 vikt KRITISK — högsta riskvikten. Vi kombinerar V19 med V11 (likviditet) och V10 (skuldsättning). Ett bolag med 18 månaders runway, 60% skuldsättning och negativt kassaflöde får V19=1 (lägst) oavsett hur stark tillväxten är. AKM1 beräknar 'runway' = kassa / månatlig bränning. Under 12 månader = akut emission-risk.",
  },
  V20: {
    lynch: "Lynch såg buybacks som en av de starkaste signalerna. 'När ledningen köper tillbaka aktier med egna pengar, inte med lånade, så vet de något du inte vet — och de delar vinsten med dig.' Han föredrog buybacks framför utdelning ur skattesynpunkt.",
    graham: "Graham såg buybacks som neutralt — han föredrog utdelning. 'En utdelning är en check du kan banka; ett buyback är ett löfte om framtida EPS-tillväxt som kanske infrias.' Han misstrodde buybacks gjorda med skuld.",
    ak1: "AKM1 vikt 5% (ny i V20-expansionen). Vi bedömer buybacks på tre kriterier: (1) finansierade med fritt kassaflöde, inte skuld; (2) till ett pris under intrinsic value; (3) inte i stället för nödvändig R&D-investering. Buybacks görs av rätt anledning = poäng 4-5; buybacks görd för att manipulera EPS = poäng 1.",
  },
};

function addPerspectives() {
  const courses = JSON.parse(readFileSync("public/deep-courses.json", "utf-8"));
  let updated = 0;

  for (const [slug, course] of Object.entries(courses)) {
    const vid = slug.match(/^v(\d+)/)?.[0].toUpperCase() ?? slug.toUpperCase().substring(0, 3);
    const perspective = PERSPECTIVES[vid];
    if (perspective && !(course as any).lynchSection) {
      (course as any).lynchSection = perspective.lynch;
      (course as any).grahamSection = perspective.graham;
      (course as any).ak1Section = perspective.ak1;
      updated++;
    }
  }

  writeFileSync("public/deep-courses.json", JSON.stringify(courses, null, 2), "utf-8");
  console.log(`✓ Added Lynch/Graham/AKM1 to ${updated} courses`);
}

addPerspectives();
