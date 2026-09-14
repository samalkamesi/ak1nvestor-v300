/**
 * DATASET-ASPEKTER — NYCKELTAL A (våg 150 u1, fas A, bransch-teman tema 1)
 * =======================================================================
 * Sex nyckeltalsaspekter för kommande rutten /dataset/[bransch]/[aspekt]:
 * roe, roic, netto-marginal, brutto-marginal (andelar, visas som procent)
 * samt ev-ebit, peg (multipler). Varje modul filtrerar lasAspektUniversum()
 * på bransch, räknar med SAMMA sammanfatta som dataset-medianer och bygger
 * en AspektSida med pedagogiska texter — utbildning, aldrig råd (2007:528).
 *
 * Gränsdragning (kontraktets filhuvud, tvingande): ENBART publika fält ur
 * bolagsunivers.json — inga bolagsnamn/tickers (typen bär dem inte), inga
 * AKM-poäng, vågklasser, status eller golv; data/stocks/** och korstabellen
 * läses aldrig. Alla siffror i texterna interpoleras ur sammanfatta —
 * modulen hårdkodar ingen statistik. Gränsregeln (matta < MIN_MATTA ⇒
 * opublicerad) fattas av slutledet; generera räknar alltid ärligt och
 * returnerar null för okänd bransch (404) SAMT sedan u5:s vit-test även
 * när matta < MIN_MATTA (dubbelgrind mot få-observations-medianer).
 *
 * Universumets notering om ROIC (approximerad proxy: EBIT före skatt /
 * (skuld + bokfört EK); finansbolag lämnas osatta) återges i roic-modulens
 * saRaknas/saLaserDu — samma sak som dataägaren skrivit i källfilen.
 */
import {
  hittaKurslankar,
  lasAspektUniversum,
  MIN_MATTA,
  sammanfatta,
  type AspektModule,
  type AspektSida,
  type AspektStat,
  type AspektUniversumRad,
} from "../dataset-aspekter-kontrakt";
import { branschNamn as branschVisningsnamn } from "../dataset-medianer";

// ── Visningshjälpare (svenska decimaler; null ⇒ "osatt" — sådana sidor
//    publiceras ändå aldrig av slutledets gränsregel) ─────────────────────────

function svTal(v: number | null): string {
  return v === null ? "osatt" : String(v).replace(".", ",");
}

function svProcent(v: number | null): string {
  return v === null ? "osatt" : `${svTal(v)} %`;
}

function svMultipl(v: number | null): string {
  return v === null ? "osatt" : `${svTal(v)}×`;
}

/** Statistikmening med mätta/median/kvartiler/min–max — alla tal ur sammanfatta. */
function statMening(namn: string, s: AspektStat, fmt: (v: number | null) => string): string {
  return `Bland universumets bolag inom ${namn} har ${s.matta} bolag ett mätt värde: medianen ligger på ${fmt(
    s.median,
  )}, den mittersta halvan mellan ${fmt(s.p25)} och ${fmt(s.p75)}, och hela spridningen från ${fmt(
    s.min,
  )} till ${fmt(s.max)}.`;
}

// ── Modultext per nyckeltal ──────────────────────────────────────────────────

type NyckeltalText = {
  /** Nyckeltalets namn i titel-mönstret från bransch-teman §4. */
  kortNamn: string;
  /** Meta-description ≤ 160 tecken (parametern = branschens visningsnamn). */
  beskrivning: (namn: string) => string;
  /** Ingress — 2–3 meningar Du-form med siffror ur statistiken. */
  ingress: (namn: string, stat: AspektStat) => string;
  /** "Så räknas talet" — 3–6 reproducerbara steg. */
  saRaknas: string[];
  /** "Så läser du det" — 3–6 punkter, jämförbarhetsfällor inkluderade. */
  saLaserDu: string[];
  /** 2–4 vanliga misstolkningar (pedagogiskt, aldrig råd). */
  fellerAttUndvika: string[];
  /** 2–4 sökord till hittaKurslankar (3–5 länkar per sida). */
  sokord: string[];
};

// ── Byggare — en metod för alla sex moduler ─────────────────────────────────

function nyckeltalsModul(
  slug: string,
  iProcent: boolean,
  hamtaVarde: (r: AspektUniversumRad) => number | null | undefined,
  text: NyckeltalText,
): AspektModule {
  const gorTitel = (n: string): string =>
    `${text.kortNamn} inom ${n} — median, spridning och hur du läser det`;
  return {
    slug,
    titel: gorTitel,
    generera: (branschSlug: string): AspektSida | null => {
      const rader = lasAspektUniversum().rader.filter((r) => r.bransch === branschSlug);
      if (rader.length === 0) return null; // okänd bransch ⇒ rutten svarar 404
      const stat = sammanfatta(rader.map(hamtaVarde), iProcent);
      // Dubbelgrind (u5:s vit-test): under MIN_MATTA mätta returneras ingen
      // sida — slutledet publicerar den heller inte, och få-observations-
      // medianer kan aldrig nå utdata från denna modul.
      if (stat.matta < MIN_MATTA) return null;
      const namn = branschVisningsnamn("sv", branschSlug);
      return {
        aspekt: slug,
        bransch: branschSlug,
        titel: gorTitel(namn),
        beskrivning: text.beskrivning(namn),
        ingress: text.ingress(namn, stat),
        matta: stat.matta,
        median: stat.median,
        p25: stat.p25,
        p75: stat.p75,
        min: stat.min,
        max: stat.max,
        enhet: iProcent ? "procent" : "multipl",
        saRaknas: text.saRaknas,
        saLaserDu: text.saLaserDu,
        fellerAttUndvika: text.fellerAttUndvika,
        kurslankar: hittaKurslankar(text.sokord),
      };
    },
  };
}

// ── Texter ───────────────────────────────────────────────────────────────────

const roeText: NyckeltalText = {
  kortNamn: "ROE",
  beskrivning: (n) =>
    `ROE inom ${n}: median, kvartiler och spridning bland universumets mätta bolag — så räknas avkastningen på eget kapital, steg för steg.`,
  ingress: (n, s) =>
    `Avkastningen på eget kapital visar hur mycket resultat ett bolag skapar per enhet ägarkapital. ${statMening(
      n,
      s,
      svProcent,
    )} Jämför alltid inom branschen — och läs spridningen som information, inte som facit.`,
  saRaknas: [
    "Börja med nettoresultatet för senaste räkenskapsåret — resultatet efter alla kostnader, räntor och skatt.",
    "Dividera resultatet med det egna kapitalet i balansräkningen; många analytiker använder snittet av årets första och sista ställning för att släta ut förändringar under året.",
    "Universumet lagrar talet som en rå andel mellan noll och ett; på den här sidan visas det som procent med en decimal.",
    "Medianen är det mittersta värdet när gruppens mätta bolag sorteras; kvartilerna p25 och p75 omfamnar den mittersta halvan.",
    "Bolag utan ändligt mätt värde räknas aldrig som noll — de syns i stället som ett lägre antal mätta bolag.",
  ],
  saLaserDu: [
    "Jämför inom branschen: hur mycket kapital verksamheten binder skiljer sig mellan branscher, så samma ROE kan vara stark i tillverkning och svag i mjukvara.",
    "Belåning lyfter ROE: skulder minskar det egna kapitalet och höjer avkastningen på det som återstår — läs talet tillsammans med gruppens soliditet.",
    "Återköp minskar det egna kapitalet och kan höja ROE utan att lönsamheten i själva verksamheten har förbättrats.",
    "Investmentbolag mäter framgång i substansvärdets tillväxt, inte i driftsresultat — deras ROE är inte jämförbar med driftsbolagens (substans, inte drift).",
    "Ett negativt minvärde betyder att minst ett mätt bolag haft förlustår — spridningen säger lika mycket som medianen.",
  ],
  fellerAttUndvika: [
    "Lita inte på ett enskilt års ROE: engångsposter, nedskrivningar och konjunkturläge svänger talet från år till år.",
    "Sammanjämför inte bolag med vitt skilda redovisningsprinciper och skatteregimer rakt av — definitionen av eget kapital varierar mellan länder.",
    "Låt inte ett högt ROE i sig fungera som kvalitetsstämpel — fråga alltid hur kapitalstrukturen och årets poster påverkar talet.",
  ],
  sokord: ["roe", "lönsamhet", "eget kapital"],
};

const roicText: NyckeltalText = {
  kortNamn: "ROIC",
  beskrivning: (n) =>
    `ROIC inom ${n}: median och spridning bland mätta bolag — hur den approximerade proxyn räknas och hur du läser avkastningen på sysselsatt kapital.`,
  ingress: (n, s) =>
    `Avkastning på sysselsatt kapital visar hur mycket driftsresultat ett bolag skapar per enhet kapital — oavsett om kapitalet är lån eller eget. ${statMening(
      n,
      s,
      svProcent,
    )} Talet här är en approximerad proxy — läs hur den räknas nedan.`,
  saRaknas: [
    "Universumets ROIC är en approximerad proxy: EBIT före skatt dividerat med (skuld + bokfört eget kapital).",
    "Täljaren är driftsresultatet före finansnetto och skatt — alltså utfallet innan kapitalstrukturen gör skillnad.",
    "Nämnaren är allt sysselsatt kapital: lån plus bokfört eget kapital.",
    "Talet lagras som rå andel och visas här som procent med en decimal.",
    "För finansbolag lämnas ROIC osatt i universumet — skuld och kapital betyder något annat i bank- och försäkringsrörelse, och talen vore inte jämförbara.",
  ],
  saLaserDu: [
    "ROIC gör bolag jämförbara oberoende av belåning — det är talets största pedagogiska styrka gentemot ROE.",
    "Proxy-definitionen skiljer sig från lärobokens ROIC (ofta EBIT efter skatt på justerat kapital): jämför bara tal som räknats på samma sätt.",
    "Bokfört eget kapital är en historik: gamla anläggningstillgångar kan pressa eller lyfta nämnaren utan att verksamheten förändrats.",
    "Investmentbolag hör inte hemma i ROIC-jämförelser — deras avkastning kommer från substansförvaltning, inte drift.",
    "Ett smalt kvartilsavstånd betyder jämnare kapitalavkastning i gruppen; ett brett betyder att affärsmodellerna skiljer sig åt.",
  ],
  fellerAttUndvika: [
    "Mixa inte ROIC från olika källor — definitionerna av investerat kapital varierar, och proxy-tal är inte utbytbara mot fullständiga beräkningar.",
    "Anta inte att hög kapitalavkastning består: konjunktur, priskrig och stora investeringsprogram kan falla talet snabbt.",
    "Glöm inte nämnarens skuld: två bolag med samma drift kan visa olika ROIC beroende på ägande kontra leasing av tillgångar.",
  ],
  sokord: ["roic", "lönsamhet", "kapital"],
};

const nettoMarginalText: NyckeltalText = {
  kortNamn: "Nettomarginal",
  beskrivning: (n) =>
    `Nettomarginal inom ${n}: median, kvartiler och spridning bland mätta bolag — så räknas vinstmarginalen och vilka jämförelsefällor du bör undvika.`,
  ingress: (n, s) =>
    `Nettomarginalen visar hur mycket av omsättningen som blir kvar som vinst efter alla kostnader — drift, räntor och skatt. ${statMening(
      n,
      s,
      svProcent,
    )} Jämför inom branschen och läs skillnaderna som information om affärsmodellerna.`,
  saRaknas: [
    "Nettomarginalen är nettoresultatet dividerat med omsättningen — resultatet efter samtliga kostnadsposter i resultaträkningen.",
    "Talet visar hur mycket av varje omsatt valutaenhet som blir kvar som vinst.",
    "Universumet lagrar talet som rå andel; här visas det som procent med en decimal.",
    "Median, kvartiler, min och max räknas endast på bolag med ändligt mätt värde — saknad data blir aldrig noll.",
  ],
  saLaserDu: [
    "Nettomarginalen summerar hela verksamheten — drift, finansiering och skatt i ett tal — men just därför påverkas den också av mycket utanför driften.",
    "Universumet spänner över flera länder med olika bolagsskatter: samma drift kan ge olika nettomarginal i olika länder.",
    "Läs nettomarginalen tillsammans med bruttomarginalen (separat sida): gapet mellan dem visar hur mycket som äts upp av rörelsekostnader, finansiering och skatt.",
    "Investmentbolags resultat styrs av värdeförändringar i innehav, inte av försäljning — deras marginaler är inte jämförbara med driftsbolagens (substans, inte drift).",
    "En negativ median betyder att fler än hälften av de mätta bolagen gick med förlust under perioden — en lägesbeskrivning, inte en rekommendation.",
  ],
  fellerAttUndvika: [
    "Engångsposter — avyttringar, nedskrivningar, engångsskatteeffekter — kan ge ett års nettomarginal som inte speglar driften.",
    "En hög nettomarginal är ingen kvalitetsstämpel i sig; den kan spegla en nisch som håller på att förändras.",
    "Blanda inte marginaler räknade på olika resultatbegrepp (EBITDA-, EBIT- och nettomarginal) — fråga alltid vilket som avses.",
  ],
  sokord: ["nettomarginal", "vinstmarginal", "lönsamhet"],
};

const bruttoMarginalText: NyckeltalText = {
  kortNamn: "Bruttomarginal",
  beskrivning: (n) =>
    `Bruttomarginal inom ${n}: median, kvartiler och spridning bland mätta bolag — så räknas prissättningskraften och hur du läser talet.`,
  ingress: (n, s) =>
    `Bruttomarginalen visar vad som blir kvar av omsättningen när de direkta kostnaderna för sålda varor och tjänster är betalda — ett mått på prissättningsmakt. ${statMening(
      n,
      s,
      svProcent,
    )} Nivån styrs hårt av affärsmodellen, så jämför inom branschen.`,
  saRaknas: [
    "Bruttomarginalen är (omsättning minus kostnad för sålda varor och tjänster) dividerat med omsättningen.",
    "Talet visar överskottet efter direkta produktions- och leveranskostnader — före personal, marknadsföring och administration.",
    "Universumet lagrar rå andel; sidan visar procent med en decimal.",
    "Median, kvartiler, min och max gäller bara bolag med ändligt mätt värde — modulen gissar aldrig.",
  ],
  saLaserDu: [
    "Bruttomarginalen är ett grovt mått på prissättningsmakt: hur mycket kunden betalar över den direkta kostnaden.",
    "Affärsmodellen sätter nivån — mjukvara utan fysisk vara har strukturellt andra bruttomarginaler än tillverkning och råvaror. Jämför därför inom branschen, inte mellan branscher.",
    "Fastighetsbolags hyresintäkter har ingen kostnad för sålda varor i traditionell mening — läs deras marginaler som ett specialfall, inte som samma mått.",
    "Följ utvecklingen över tid: ett växande gap mellan brutto- och nettomarginal pekar på stigande rörelsekostnader eller finansieringsbörda.",
    "Spridningen min–max påminner om att även en bransch sällan är en enda affärsmodell.",
  ],
  fellerAttUndvika: [
    "Betygssätt inte branscher efter brutomarginalnivå — nivån är affärsmodellberoende, inte ett mått på kvalitet.",
    "Vad som räknas som direkt kostnad skiljer sig mellan bolag och länder — läs noterna i rapporten, inte bara talet.",
    "En hög bruttomarginal skyddar inte automatiskt: konkurrens, råvarupriser och teknikskiften kan pressa den snabbt.",
  ],
  sokord: ["bruttomarginal", "marginal", "lönsamhet"],
};

const evEbitText: NyckeltalText = {
  kortNamn: "EV/EBIT",
  beskrivning: (n) =>
    `EV/EBIT inom ${n}: median och spridning bland mätta bolag — så räknas den kapitalstrukturneutrala multiplen och hur du läser den.`,
  ingress: (n, s) =>
    `EV/EBIT sätter hela företagsvärdet — börsvärde plus nettoskuld — i relation till driftsresultatet, vilket gör multiplen oberoende av bolagets belåning. ${statMening(
      n,
      s,
      svMultipl,
    )} Multiplen är en utgångspunkt för ditt eget resonemang — inte en rekommendation.`,
  saRaknas: [
    "Räkna först fram företagsvärdet (EV): börsvärde plus skuld minus likvida medel — allt kapital som kräver avkastning, oavsett ägare.",
    "Dividera EV med EBIT, driftsresultatet, för senaste räkenskapsåret.",
    "Svaret är en multipel: hur många gånger driftsresultatet som hela kapitalbasen är prissatt till.",
    "Multiplar visas med en decimal; median, kvartiler, min och max gäller bara bolag med ändligt mätt värde.",
  ],
  saLaserDu: [
    "EV/EBIT är neutral mot kapitalstrukturen: till skillnad från P/E påverkas den inte av hur kapitalet delats mellan lån och eget kapital — därav lämpen för jämförelser mellan olika belåningsgrader.",
    "Skillnaden mellan ett bolags P/E och EV/EBIT är en lektion i belåningens inverkan: skuldtunga bolag ser dyrare ut i P/E än i EV/EBIT.",
    "Investmentbolag värderas på substansen, inte på driftsresultatet — EV/EBIT säger därför lite om dem (substans, inte drift).",
    "Negativt eller nästan noll EBIT gör multiplen meningslös — sådana värden lämnar underlaget i stället för att synas som missvisande tal.",
    "Läs medianen som en referenspunkt för ditt eget resonemang — inte som en gräns mellan rimligt och orimligt.",
  ],
  fellerAttUndvika: [
    "Blanda inte ihop EV/EBIT med EV/EBITDA — skillnaden är avskrivningarna, och i kapitaltunga branscher är den stor.",
    "En multipel under branschmedianen är inte automatisk fördelaktig — den kan spegla fallande orderingång, svagare lönsamhet eller högre risk.",
    "Engångsposter i EBIT kan pressa multiplen för ett år — kontrollera alltid vad driftsresultatet innehåller.",
  ],
  sokord: ["ev/ebit", "multipel", "värdering"],
};

const pegText: NyckeltalText = {
  kortNamn: "PEG",
  beskrivning: (n) =>
    `PEG inom ${n}: median och spridning bland mätta bolag — så räknas den tillväxtjusterade multiplen och varför prognosen gör den osäker.`,
  ingress: (n, s) =>
    `PEG sätter P/E-talet i relation till väntad resultattillväxt och försöker göra multipler jämförbara mellan bolag med olika tillväxttakt. ${statMening(
      n,
      s,
      svMultipl,
    )} Nämnaren är en prognos — läs talet med det i minnet.`,
  saRaknas: [
    "PEG är P/E-talet dividerat med den förväntade tillväxttakten i resultatet.",
    "I det här universumet är tillväxttalet prognostiserad vinst per aktie ett år framåt enligt analytikerkonsensus (earningsTrend) — inte ett historiskt faktum.",
    "Talet visar hur många multiplenheter som betalas per procentenhet väntad tillväxt.",
    "Båda ingående talen måste vara mätta och ändliga: saknas P/E eller prognos lämnas PEG osatt, och bolaget räknas bort ur underlaget.",
  ],
  saLaserDu: [
    "Idén med PEG är att snabbväxande bolag rimligen bär högre multipler — talet försöker synliggöra den skillnaden.",
    "Eftersom nämnaren är en konsensusprognos är PEG ett av de osäkraste nyckeltalen: slår prognosen fel faller hela talet.",
    "Negativt eller nollresultat gör både P/E och PEG meningslösa — kontrollera alltid vinsten före multipeljämförelsen.",
    "Läs PEG tillsammans med P/E och EV/EBIT (separata sidor): tre multipler som belyser samma prislapp från olika håll.",
    "Spridningen inom branschen kan vara enorm — medianen döljer både mycket låga och mycket höga PEG-tal.",
  ],
  fellerAttUndvika: [
    "Ett lågt PEG är ingen automatisk signal: det kan lika gärna spegla en prognos som marknaden inte litar på, eller en tillfällig vinsttopp.",
    "Använd inte PEG på bolag med förlust eller mycket liten vinst — små nämnare ger absurt stora tal.",
    "Blanda inte PEG räknad på historisk tillväxt med PEG på prognos — det är olika tal med olika betydelse.",
  ],
  sokord: ["peg", "tillväxt", "multipel"],
};

// ── Modulerna (EXAKT 6 slugs — fas A nyckeltalsaspekter) ────────────────────

export const aspekter: AspektModule[] = [
  nyckeltalsModul("roe", true, (r) => r.lonksamhet?.roe, roeText),
  nyckeltalsModul("roic", true, (r) => r.lonksamhet?.roic, roicText),
  nyckeltalsModul("netto-marginal", true, (r) => r.lonksamhet?.nettoMarginal, nettoMarginalText),
  nyckeltalsModul(
    "brutto-marginal",
    true,
    (r) => r.lonksamhet?.bruttoMarginal,
    bruttoMarginalText,
  ),
  nyckeltalsModul("ev-ebit", false, (r) => r.vardering?.evEbit, evEbitText),
  nyckeltalsModul("peg", false, (r) => r.vardering?.peg, pegText),
];
