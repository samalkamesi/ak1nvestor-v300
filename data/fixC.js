/*
 * Språkexpert pass 1, batch C — kirurgiska rättningar i public/deep-courses.json
 * Omfattning: de 84 kurserna keys.sort().slice(168,252).
 * Varje rättning: exakt sträng (med kontext) + förväntat antal träffar inom kursen.
 */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'deep-courses.json');
const raw = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

// Round-trip-kontroll: pretty 2-space med ev. avslutande radbrytning (filen skrivs av andra agenter)
const trailingNL = /\n$/.test(raw);
const body = raw.replace(/\n+$/, '');
const FMT = (JSON.stringify(data, null, 2) === body) ? 2
  : (JSON.stringify(data) === body ? 0 : null);
if (FMT === null) {
  console.error('FEL: round-trip matchar inte kompakt eller 2-space pretty. Avbryter.');
  process.exit(1);
}
console.log('Formatdetekterat:', FMT === 2 ? 'pretty 2-space' : 'kompakt', '| avslutande NL:', trailingNL);

const allKeys = Object.keys(data).sort();
const BATCH = new Set(allKeys.slice(168, 252));
console.log('Batch C-kurser:', BATCH.size, '| totalt i filen:', Object.keys(data).length);

// ---------- ersättningsmotor ----------
const applied = [];
const missed = [];
function countIn(str, find) { let n = 0, i = -1; while ((i = str.indexOf(find, i + 1)) >= 0) n++; return n; }
function applyTo(obj, find, replace, key, label, expect) {
  // obj: kursobjekt; arbetar på JSON-strängen av kursen och skriver tillbaka via eval-fri metod:
  // vi gör stringreplace på JSON.stringify(obj) och parsar tillbaka (säkert: find/replace är literaltext)
  const before = JSON.stringify(obj);
  const n = countIn(before, find);
  if (n === 0) { missed.push(key + ' | ' + (label || find)); return 0; }
  const after = before.split(find).join(replace);
  const parsed = JSON.parse(after);
  Object.keys(obj).forEach(k => delete obj[k]);
  Object.assign(obj, parsed);
  applied.push({ key, find: label || find, n, expect });
  return n;
}
function applyRegexTo(obj, re, replace, key, label) {
  const before = JSON.stringify(obj);
  const after = before.replace(re, replace);
  if (after === before) { missed.push(key + ' | ' + label); return 0; }
  const parsed = JSON.parse(after);
  Object.keys(obj).forEach(k => delete obj[k]);
  Object.assign(obj, parsed);
  applied.push({ key, find: label, n: (before.match(re) || []).length, expect: null });
  return 1;
}

// ---------- per-kurs-tabell ----------
const F = {
  'pf-07-krishantering': [
    ['Fall 30%: panik eller opportunity?', 'Fall 30%: panik eller möjlighet?', 2],
    ['en plötslig kursfall på 30%', 'ett plötsligt kursfall på 30%', 1],
    ['uppstått med regelbundenhet, driven av en kombination', 'uppstått med regelbundenhet, drivna av en kombination', 1],
    ['deras underliggaande fundamental värde', 'deras underliggande fundamentala värde', 1],
    ['extrem volatilitet och panik sälj tenderar', 'extrem volatilitet och panikförsäljning tenderar', 1],
    ['för att undvka att sälja i panik', 'för att undvika att sälja i panik', 1],
    ['från den rådande sentimentet', 'från det rådande sentimentet', 1],
    ['en disciplinerad psykologisk approach', 'ett disciplinerat psykologiskt angreppssätt', 1],
    ['AK1M:s metodik', 'AKM1:s metodik', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'pf-08-isk-vs-aktiedepa': [
    ['en investering oavett skattekontext', 'en investering oavsett skattekontext', 1],
    ['kan en aktiedepö vara överlägsen', 'kan en aktiedepå vara överlägsen', 1],
    ['i en aktiedepö kan investeraren', 'i en aktiedepå kan investeraren', 1],
    ['en låg p/e-tal på ett bolag', 'ett lågt P/E-tal på ett bolag', 1],
    ['Sanna mästerskap uppstår', 'Sant mästerskap uppstår', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'pf-09-taxloss-harvesting': [
    ['Sälj förlorare före årsskiftet. 30-dagars regeln.', 'Sälj förlorare före årsskiftet. 30-dagarsregeln.', 2],
    ['Han menade att att medvetet realisera', 'Han menade att medvetet realisera', 1],
    ['utvecklades från koncept sedan 1990-talet och blev populärt', 'utvecklades ur koncept som växte fram under 1990-talet och blev populärt', 1],
    ['utmaningar. koncept sedan 1990-talet bidrog till vår förståelse', 'utmaningar. Utvecklingen sedan 1990-talet bidrog till vår förståelse', 6],
  ],
  'pf-10-longshort': [
    ['Han menade att att kombinera långa', 'Han menade att kombinera långa', 1],
  ],
  'pf-11-koncentrerad-portfolj': [
    ['Han menade att att äga 5–10 bolag', 'Han menade att äga 5–10 bolag', 1],
  ],
  'pf-12-arsrapportering': [
    ['sälj låg, köj hög', 'sälj låg, köp hög', 2],
  ],
  'pf-13-esgportfolj': [
    ['Han menade att att integrera hållbarhet', 'Han menade att integrera hållbarhet', 1],
    ['Esg-portfölj är en central portföljstrategi', 'ESG-portfölj är en central portföljstrategi', 1],
    ['utvecklades från UN PRI 2006', 'utvecklades ur UN PRI 2006', 1],
    ['definition: Esg-portfölj:', 'definition: ESG-portfölj:', 6],
    ['utforskar grunderna i esg-portfölj', 'utforskar grunderna i ESG-portföljen', 6],
    ['utforskar djupare förståelse av esg-portfölj', 'utforskar djupare förståelse för ESG-portföljen', 6],
    ['utforskar mästerskap i esg-portfölj', 'utforskar mästerskap i ESG-portföljen', 6],
    ['viktigt för att förstå esg-portfölj?', 'viktigt för att förstå ESG-portföljen?', 18],
  ],
  'pf-14-pensionssparande': [
    ['utvecklades från svenskt pensionssystem 2003', 'utvecklades ur det svenska pensionssystemet (2003)', 1],
    ['utmaningar. svenskt pensionssystem 2003 bidrog', 'utmaningar. Det svenska pensionssystemet (2003) bidrog', 6],
  ],
  'poor-charlies-almanack': [
    ['De alltid är dyra för mäklaren', 'De är alltid dyra för mäklaren', 1],
    ['Association bara fungerar i konsumentledet', 'Association fungerar bara i konsumentledet', 1],
  ],
  'principles-of-corporate-finance': [
    ['NPV tänkandet bakom V04–V06', 'NPV-tänkandet bakom V04–V06', 1],
    ['obligationslärans första läg: avkastning upp', 'obligationslärans första lag: avkastning upp', 1],
    ['böckvärdets berättigade multipl är rent kapital är räntan på eget kapital i jämvikt med priset', 'bokvärdets berättigade multipl är den där räntan på eget kapital är i jämvikt med priset', 1],
    ['men kursen nöjer oss med intuitionens', 'men kursen nöjer sig med intuitionens', 1],
    ['V17–V18:s och hela AK1A:s options tänkandes grund', 'grunden till V17–V18:s och hela AK1A:s optionstänkande', 1],
    ['Kursen läser kapitlet som grunden till V17–V18:s och hela AK1A:s optionstänkande', 'Kursen läser kapitlet som grunden till V17–V18:s och hela AK1A:s optionstänkandet', 1],
    ['WACC med svenska posten', 'WACC med svenska poster', 1],
  ],
  'quality-of-earnings': [
    ['det klassiska förvarningsmönstret', 'det klassiska varningsmönstret', 1],
    ['råvaror, pågående arbete och färdiga varor', 'råvaror, pågående arbeten och färdiga varor', 1],
    ['Pågående arbete som växer kan vara legitimt', 'Pågående arbeten som växer kan vara legitima', 1],
  ],
  'quantitative-value': [
    ['Vad visade backtestens av Grahams enkla regler', 'Vad visade backtesten av Grahams enkla regler', 1],
  ],
  'reminiscences-of-a-stock-operator': [
    ['en hundrårig lektion', 'en hundraårig lektion', 1],
    ['hop och rädsla är fienden inomhus', 'hopp och rädsla är fienden inomhus', 1],
    ['Reminiscences av 1923 fångar', 'Reminiscences från 1923 fångar', 1],
    ['Köper aktien vid brytpunkten uppåt är det köpare', 'Bryts aktien uppåt vid brytpunkten är det köpare', 1],
    ['ett hundra aktier', 'hundra aktier', 1],
    ['och vinster får löpå', 'och vinster får löpa', 1],
    ['låt vinnarna löpå mot trailing-kriterier', 'låt vinnarna löpa mot trailing-kriterier', 1],
    ['Kapa förluster snabbt och låt vinster löpå', 'Kapa förluster snabbt och låt vinster löpa', 1],
    ['Kör tankeexperimentet på ditt egetkonto', 'Kör tankeexperimentet på ditt eget konto', 1],
    ['med försäkringingar som måste täckas', 'med säkerhetskrav som måste täckas', 1],
  ],
  'rk-01-kapitalforbranning': [
    ['förbrukar sitt kassa- och bankmedel', 'förbrukar sina kassa- och bankmedel', 1],
    ['investeras i framtida tillväckstaktorer', 'investeras i framtida tillväxtfaktorer', 1],
    ['AK1M använder ARR', 'AKM1 använder ARR', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-02-emissionrisk': [
    ['Emissioner utspäddar.', 'Emissioner utspäder.', 2],
    ['med en avkastning överstigenande kapitaalkostnaden', 'med en avkastning överstigande kapitalkostnaden', 1],
    ['(Price-to-Earnings) får en mer realistisk bild', '(Price-to-Earnings) får man en mer realistisk bild', 1],
    ['Dessutom måste analysern granska', 'Dessutom måste analytikern granska', 1],
    ['inte bara finansierar en strategisk initiativ', 'inte bara finansierar ett strategiskt initiativ', 1],
    ['En mästarteam ser till', 'Ett mästarteam ser till', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-03-skuldfalla': [
    ['Ett tidigt varningsflagg var', 'En tidig varningsflagga var', 1],
    ['(EPS) fluktuation kraftigt', '(EPS) fluktuera kraftigt', 1],
    ['inte den direkta ränoträffen', 'inte den direkta ränteträffen', 1],
    ['kan hanera en högre kvot', 'kan hantera en högre kvot', 1],
    ['på en knivs edge', 'på knivsegg', 1],
    ['intentionen bakom skuldan utvecklas', 'intentionen bakom skulden utvecklas', 1],
    ['en cykel av skuldenedskrivningar', 'en cykel av skuldnedskrivningar', 1],
    ['Ett mästerskap analytiker ser', 'En mästaranalytiker ser', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-04-likviditetskris': [
    ['Historiska kollapsen hos företag som SVB', 'De historiska kollapserna hos företag som SVB', 1],
    ['även om underliggande verksamhet är stabil', 'även om den underliggande verksamheten är stabil', 1],
    ['Banken Lehman Brothers kollaps i september 2008 efter att misslyckats', 'Banken Lehman Brothers kollapsade i september 2008 efter att ha misslyckats', 1],
    ['AK1M:s metodik identifierar', 'AKM1:s metodik identifierar', 1],
    ['på en kommande likviditetsproblem', 'på ett kommande likviditetsproblem', 1],
    ['och granska balansens sida', 'och granska balanssidan', 1],
    ['är likviditetsrisken särskilt insidious', 'är likviditetsrisken särskilt förrädisk', 1],
    ['En likviditetskris sällan kommer som en chock', 'En likviditetskris kommer sällan som en chock', 1],
    ['En finansiell nyckeltal som mäter', 'Ett finansiellt nyckeltal som mäter', 1],
    ['tillgångar, beräknad som', 'tillgångar, beräknat som', 1],
    ['Dessutom bör analysera företagets flexibilitet', 'Dessutom bör man analysera företagets flexibilitet', 1],
    ['Den mängd kontanta medel som ett genererar', 'Den mängd kontanta medel som ett företag genererar', 1],
    ['AKM1 1:1:s kvantitativa data', 'AKM1 1.1:s kvantitativa data', 1],
    ['En extrem snabb och plötslig nedgång', 'En extremt snabb och plötslig nedgång', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-05-cykelrisk': [
    ['billigt vid en konjunktrötslag', 'billigt vid en konjunkturbotten', 1],
    ['som SKF vid konjunktrötslag', 'som SKF vid en konjunkturbotten', 1],
    ['svenska induktors konjunkturindikatorer', 'svenska industrins konjunkturindikatorer', 1],
    ['kan en analyser justera portföljens', 'kan en analytiker justera portföljens', 1],
    ['kan en analyser fastställa den mest sannolika', 'kan en analytiker fastställa den mest sannolika', 1],
    ['att bygga en flexibel ramverk', 'att bygga ett flexibelt ramverk', 1],
    ['att anpassas sig när marknaden', 'att anpassa sig när marknaden', 1],
    ['Marknader är driven av rädsla', 'Marknader drivs av rädsla', 1],
    ['Sanna mästerskap i riskhantering', 'Sant mästerskap i riskhantering', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-06-regulatorisk-risk': [
    ['där kraven ständigt skär.', 'där kraven ständigt skärps.', 1],
    ['Han skulle lette efter tecken', 'Han skulle leta efter tecken', 1],
    ['hoten mot en aktiebolags värdering', 'hoten mot ett aktiebolags värdering', 1],
    ['i en ständigt föränderlig regulatorisk landskap', 'i ett ständigt föränderligt regulatoriskt landskap', 1],
    ['eller en striktare krav på dataskydd', 'eller ett striktare krav på dataskydd', 1],
    ['för en analytiker sällan finns', 'för en analytiker finns sällan', 1],
    ['att aktivt forma sin risklandskap', 'att aktivt forma sitt risklandskap', 2],
    ['i hållbarhet och långsiktig värdeskapande', 'i hållbarhet och långsiktigt värdeskapande', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-07-valutarisk': [
    ['är valutarisk en direkt påverkan', 'har valutarisk en direkt påverkan', 1],
    ['som en valutasäkring mot den europe marknaden', 'som en valutasäkring mot den europeiska marknaden', 1],
    ['AK1A Research Lab\'s metodik', 'AK1A Research Labs metodik', 1],
    ['och företags hemvaluta', 'och företagets hemvaluta', 1],
    ['behöver aktiv hanteras', 'behöver hanteras aktivt', 1],
    ['Detta skyddar från negativa rörelser', 'Detta skyddar mot negativa rörelser', 1],
    ['en potentiell källa oförutsägbarhet', 'en potentiell källa till oförutsägbarhet', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-08-ranterisk': [
    ['den efterföllda räntevolatiliteten', 'den efterföljande räntevolatiliteten', 1],
    ['William F. Sharpe, nobelpristagare', 'William F. Sharpe, Nobelpristagare', 1],
    ['där varje flödes tidpunkt viktar med dess nuvärde', 'där varje flödes tidpunkt viktas med dess nuvärde', 1],
    ['som matchar deras riskaptit', 'som matchar sin riskaptit', 1],
    ['en tydlig och konsekrent ränteprognos', 'en tydlig och konsekvent ränteprognos', 1],
    ['den totala ränteriken är neutraliserad', 'den totala ränterisken är neutraliserad', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-09-koncentrationsrisk': [
    ['att skytta kundernas medel', 'att sköta kundernas medel', 1],
    ['den falsiska tryggheten', 'den falska tryggheten', 1],
    ['Den mest effektiva risshanteringen', 'Den mest effektiva riskhanteringen', 1],
    ['att kvantifiera den potentiavinsten', 'att kvantifiera potentialvinsten', 1],
    ['för att identifiera潜在的 sårbarheter', 'för att identifiera potentiella sårbarheter', 1],
    ['En medvetet och kvantifierad överexponering', 'En medveten och kvantifierad överexponering', 1],
    ['Sanna mästerskap i riskhantering ligger', 'Sant mästerskap i riskhantering ligger', 1],
    ['i termer av marginaler av säkerhet', 'i termer av säkerhetsmarginaler', 1],
    ['och förstöra finansiell framtid', 'och förstöra den finansiella framtiden', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-10-korrelationsrisk': [
    ['av Harry Markowitz modern portföljteori', 'av Harry Markowitz moderna portföljteori', 1],
    ['geografiskt avlägsna markader påverkades', 'geografiskt avlägsna marknader påverkades', 1],
    ['mot oförutsedga korrelationssprängningar', 'mot oförutsedda korrelationssprängningar', 1],
    ['som historiskt har samrörliga i kriser', 'som historiskt är samrörliga i kriser', 1],
    ['som vissa infrastrakturfonder', 'som vissa infrastrukturfonder', 1],
    ['i tider av marknstress', 'i tider av marknadsstress', 1],
    ['uppvisa låga eller nära noll korrelationer', 'uppvisa låga korrelationer eller korrelationer nära noll', 1],
    ['en portfölj som är inte bara robust', 'en portfölj som inte bara är robust', 1],
    ['Sanna mästerskap inom korrelationsriskhantering', 'Sant mästerskap inom korrelationsriskhantering', 1],
    ['extrema, men sannolika, händelser', 'extrema, men osannolika, händelser', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-11-bedrageririsk': [
    ['är bedrägerier ofta dolda och medvetet dolda', 'är bedrägerier ofta osynliga och medvetet dolda', 1],
    ['oavsett hur starkt affärsidén', 'oavsett hur stark affärsidén', 1],
    ['incitament att bedra,', 'incitament att bedraga,', 1],
    ['det ökar sin kundfordringar', 'det ökar sina kundfordringar', 1],
    ['Denna förmiga tolkning', 'Denna förmåga till tolkning', 1],
    ['AK1A Research Lab\'s metodik', 'AK1A Research Labs metodik', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-12-black-swanrisk': [
    ['är svanhandsrisken en existentiell fråga', 'är svanrisken en existentiell fråga', 1],
    ['den \'far till värdeinvestering\'', 'fadern till värdeinvestering', 1],
    ['oväntade, extremt händelser', 'oväntade, extrema händelser', 1],
    ['som efteråts alltid framstår', 'som i efterhand alltid framstår', 1],
    ['korrelationer kan brytas samman i kriser', 'korrelationer kan kollapsa i kriser', 1],
    ['som kan utlöka en kedjereaktion', 'som kan utlösa en kedjereaktion', 1],
    ['mot en enda dominerande narrativ eller ett geografiskt koncentration', 'mot ett enda dominerande narrativ eller en geografisk koncentration', 1],
    ['att behålla en kassa buffert', 'att behålla en kassabuffert', 1],
    ['Antifragil organisation: En system eller struktur', 'Antifragil organisation: Ett system eller en struktur', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'rk-13-gdpr-och-datarisk': [
    ['Sweden implementerade GDPR', 'Sverige implementerade GDPR', 1],
    ['har IMY gett flera miljonböter', 'har IMY utdelat flera miljonböter', 1],
    ['trädde i kraft maj 2018', 'trädde i kraft i maj 2018', 1],
    ['4% av global omsättning, beroende på vilket är högst', '4% av den globala omsättningen, beroende på vilket som är högst', 1],
    ['Genomsnittlig GDPR-böter i EU', 'Genomsnittliga GDPR-böter i EU', 1],
    ['straffen var väntat', 'straffen var väntade', 1],
    ['transparens lönär sig', 'transparens lönar sig', 1],
  ],
  'rk-14-esgrisk': [
    ['det är finansuell risk', 'det är finansiell risk', 1],
    ['det är finansiel risk', 'det är finansiell risk', 1],
    ['Sweden var tidigt ute', 'Sverige var tidigt ute', 1],
    ['har underpreparerat S&P 500', 'har underpresterat mot S&P 500', 1],
    ['viktigare än top-down betyg', 'viktigare än top-down-betyg', 1],
  ],
  'rk-15-cykelrisk': [
    ['Svenska industricolag', 'Svenska industribolag', 1],
    ['förlora 50%+ av omsättning under en recession', 'förlora 50%+ av omsättningen under en recession', 1],
    ['Vad är konjunkturcykler och hur uppstår dem.', 'Vad är konjunkturcykler och hur uppstår de.', 1],
    ['keynesianska på aggregat efterfrågan', 'keynesianska på aggregerad efterfrågan', 1],
    ['Detta är omvänd mot intuition', 'Detta är omvänt mot intuitionen', 1],
    ['med 30%+ diskontant mot beräknat intrinsic value', 'med 30%+ rabatt mot beräknat intrinsic value', 1],
    ['än att försöka tidscykeln', 'än att försöka tajma cykeln', 1],
    ['köp-och-håll av acykliska portfölj', 'köp-och-håll av en acyklisk portfölj', 1],
    ['contraction', 'kontraktion', 9],
  ],
  'se-01-saassektorn': [
    ['som en prenumerationstjänist istället för en engångsköp', 'som en prenumerationstjänst istället för ett engångsköp', 1],
    ['en analys av en SaaS-företags finansiella hälsa', 'en analys av ett SaaS-företags finansiella hälsa', 1],
    ['För aktieanalyser innebär detta', 'För aktieanalytiker innebär detta', 1],
    ['måste en analysek också utvärdera', 'måste analytikern också utvärdera', 1],
    ['företagets unika värnesätt (moat)', 'företagets unika värdesätt (moat)', 1],
    ['skapar en virtuell cirkel', 'skapar en självförstärkande cirkel', 1],
    ['en SaaS-aktors långsiktiga värde', 'en SaaS-aktörs långsiktiga värde', 1],
    ['flyttar en SaaS-aktors värde', 'flyttar en SaaS-aktörs värde', 1],
    ['AK1M använder ARR', 'AKM1 använder ARR', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'se-02-halvledarsektorn': [
    ['Moore\'s läg, som postulerar', 'Moore\'s lag, som postulerar', 1],
    ['dubblas ungefär vann annat år', 'dubblas ungefär vartannat år', 1],
    ['Denna exponentiella utveckling har möjliggör låg kostnad', 'Denna exponentiella utveckling har möjliggjort låg kostnad', 1],
    ['den extrema höga värderingen', 'den extremt höga värderingen', 1],
    ['inom allt från materialvetenskap till avancerad algoritmer', 'inom allt från materialvetenskap till avancerade algoritmer', 1],
    ['på en enskild prestandamått', 'på ett enskilt prestandamått', 1],
    ['standardssättare', 'standardsättare', 2],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'se-03-forsvarssektorn': [
    ['skulle värderat försvarsbolag', 'skulle ha värderat försvarsbolag', 1],
    ['när dera kontrakt ger', 'när deras kontrakt ger', 1],
    ['skulle betonat vikten', 'skulle ha betonat vikten', 1],
    ['betydelse sträcker långt bortom', 'betydelse sträcker sig långt bortom', 1],
    ['I en tid ökade geopolitiska spänningar', 'I en tid med ökade geopolitiska spänningar', 1],
    ['Detta gör sektoren till en källa', 'Detta gör sektorn till en källa', 1],
    ['för den som först underliggande drivkrafter', 'för den som förstår de underliggande drivkrafterna', 1],
    ['som inte bara tillverkomponent enskilda plattformar', 'som inte bara tillverkar enskilda plattformar', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'se-04-logistiksektorn': [
    ['ökade sin närvarans', 'ökade sin närvaro', 1],
    ['och konsuments beteende', 'och konsumentens beteende', 1],
    ['utan i att transportare smartare', 'utan i att transportera smartare', 1],
    ['vilket minskar kapital bundet i lager', 'vilket minskar kapitalet bundet i lager', 1],
    ['värdeaddedtjänster', 'värdeadderade tjänster', 1],
    ['utan också lockerar kunder', 'utan också lockar kunder', 1],
    ['av ett transports medskapacitet', 'av ett transportskepps lastkapacitet', 1],
    ['manifesterar sig i en organisationens förmåga', 'manifesterar sig i en organisations förmåga', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'se-05-lyxsektorn': [
    ['unik tillväxt potential', 'unik tillväxtpotential', 1],
    ['att diversifier bortom traditioniska nordiska', 'att diversifiera bortom traditionella nordiska', 1],
    ['den underliggande varumärkesstyrken', 'den underliggande varumärkesstyrkan', 1],
    ['AK1M-metoden använder', 'AKM1-metoden använder', 1],
    ['är lyxsektorn drivet av exklusivitet', 'är lyxsektorn driven av exklusivitet', 1],
    ['vilket skapar en prispåslag', 'vilket skapar ett prispåslag', 1],
    ['har kunnat öka sin lönsammarkant', 'har kunnat öka sin lönsamhet markant', 1],
    ['och operational effektivitet, snarare', 'och operativ effektivitet, snarare', 1],
    ['Operational effektivitet är en annan', 'Operativ effektivitet är en annan', 1],
    ['vilka aktörer som bäst positionerade för att dra nyt av dem', 'vilka aktörer som är bäst positionerade för att dra nytta av dem', 1],
    ['mellan datadriviena insikter', 'mellan datadrivna insikter', 1],
    ['Sanna mästerskap inom lyxanalys', 'Sant mästerskap inom lyxanalys', 1],
    ['aktieanalys av lyxsektoren kräver', 'aktieanalys av lyxsektorn kräver', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'se-06-finanssektorn': [
    ['Sekorns utveckling', 'Sektorns utveckling', 1],
    ['utmaningar. schweizisk/svensk tradition bidrog', 'utmaningar. Den schweiziska/svenska traditionen bidrog', 6],
  ],
  'se-07-detailhandel': [
    ['Detailhandel', 'Detaljhandel', 60],
    ['Sekorns utveckling', 'Sektorns utveckling', 1],
  ],
  'security-analysis': [
    ['Skriv en regel formulierad som uteslutningskriterium', 'Skriv en regel formulerad som uteslutningskriterium', 1],
  ],
  'sj-01-utlandsk-kallskatt': [
    ['inte lämnar på pengar', 'inte förlorar pengar', 1],
    ['för en efter-skatt avkastning', 'för en efter-skattad avkastning', 1],
    ['en proaktiv och systematisk approach', 'ett proaktivt och systematiskt angreppssätt', 1],
    ['skapa en heltäcknde riskanalys', 'skapa en heltäckande riskanalys', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'sj-02-cryptobeskattning': [
    ['den underliggende affärens', 'den underliggande affärens', 1],
    ['som kan skada både individuell och företagsrykte', 'som kan skada både individens och företagets rykte', 1],
    ['Varje enskild transktion', 'Varje enskild transaktion', 1],
    ['en orealiserad vinst realisares', 'en orealiserad vinst realiseras', 1],
    ['med en ny protokol eller tjänst', 'med ett nytt protokoll eller tjänst', 1],
    ['kan man undvika kostamma fel', 'kan man undvika kostsamma fel', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'sj-03-bolagsstamma-och-rostratt': [
    ['extern kapanskaffning', 'extern kapitalanskaffning', 1],
    ['tio gånger högre röstavakt', 'tio gånger högre röstvärde', 1],
    ['AK1A Research Lab metodik analyserar', 'AK1A Research Labs metodik analyserar', 1],
    ['Bolagsstämma är den högsta beslutande organet', 'Bolagsstämma är det högsta beslutande organet', 1],
    ['har rätt närvara och delta', 'har rätt att närvara och delta', 1],
    ['granskning av bolagets kallelsen', 'granskning av bolagets kallelse', 1],
    ['Även om många stämmer numera hålls digitalt', 'Även om många stämmor numera hålls digitalt', 1],
    ['hanterar stora kapitalansvar', 'hanterar stort kapitalansvar', 1],
    ['till proaktivt att designa en process', 'till att proaktivt designa en process', 1],
    ['1. Grunderna — varför detta matters', '1. Grunderna — varför detta är viktigt', 2],
  ],
  'sj-04-optionsbeskattning': [
    ['är inte definierat i läg', 'är inte definierat i lagen', 1],
    ['sälja en förlustande option', 'sälja en option med förlust', 1],
    ['och får eftergranskningar', 'och blir eftergranskade', 1],
  ],
  'sj-05-kapitalforsakring-vs-isk': [],
  'shoe-dog': [],
  'stocks-for-the-long-run': [
    ['att aktiens multiplel är högst', 'att aktiens multipel är högst', 1],
    ['aktiens multiplel (Siegels karta)', 'aktiens multipel (Siegels karta)', 1],
  ],
  'tanka-snabbt-och-langsamt': [
    ['de två jag som får dig att minns dina affärer fel', 'de två jagen som får dig att minnas dina affärer fel', 1],
    ['småskole-fyndet', 'småskolefyndet', 1],
    ['arbeta med utanförperspektet', 'arbeta med utanförperspektivet', 1],
  ],
  'technical-analysis-financial-markets': [
    ['som städär ut', 'som städar ut', 1],
  ],
  'technical-analysis-of-stock-trends': [
    ['motstånd som en utbuds zon', 'motstånd som en utbudszon', 1],
    ['vid en femtioprocentreträment', 'vid en femtioprocentretracement', 1],
  ],
  'teknisk-analys-med-johnny-torssell': [
    ['tekniken skärper när ryggen ska köpas', 'tekniken skärper när aktien ska köpas', 1],
    ['inget verktyg i boken rätt mer än ofta', 'inget verktyg i boken har rätt mer än ofta', 1],
    ['de viktigaste LÅGPLUNKTERNA', 'de viktigaste LÅGPUNKTERNA', 1],
    ['medan ett broott NEDÅT', 'medan ett brott NEDÅT', 1],
    ['Garanttera vinst', 'Garantera vinst', 1],
    ['anatomien, de viktigaste mönstren', 'anatomin, de viktigaste mönstren', 1],
    ['kurskatalog behövt just', 'kurskatalog behöver just', 1],
  ],
  'the-acquirers-multiple': [
    ['det mekaniska sållar', 'det mekaniska sållet', 1],
    ['bokens tes fick en vers', 'bokens tes fick revansch', 1],
  ],
  'the-alchemy-of-finance': [
    ['dagbok och exponeringsiffror', 'dagbok och exponeringssiffror', 1],
    ['på ett sätt vi villär ut', 'på ett sätt vi vill lära ut', 1],
    ['Köp tidigt,small size, studera bränslet', 'Köp tidigt, liten storlek, studera bränslet', 1],
  ],
  'the-big-short': [
    ['CDO-alcin som förvandlade BBB', 'CDO-alkemi som förvandlade BBB', 1],
  ],
  'the-black-swan': [
    ['Det är ingen säga om fåglar', 'Det är ingen saga om fåglar', 1],
  ],
  'the-bogleheads-guide-to-investing': [
    ['avgifts-minsräkningen', 'avgifts-minusräkningen', 2],
  ],
  'the-complete-turtletrader': [
    ['KursenDifferentierar', 'Kursen differentierar', 1],
    ['Chicago-skolans ända,', 'Chicago-skolans ände,', 1],
    ['hånade för sitt regelstyrka', 'hånade för sin regelstyrka', 1],
    ['oskolade i golvet kultur', 'oskolade i golvets kultur', 2],
    ['av golvet hantverkskunskap', 'av golvets hantverkskunskap', 1],
    ['Säga mörkaste kapitel', 'Sagans mörkaste kapitel', 1],
    ['den discipl han lärt ut', 'den disciplin han lärt ut', 1],
    ['att discipl är en egenskap', 'att disciplin är en egenskap', 1],
    ['att discipl är per domän', 'att disciplin är per domän', 1],
    ['experimentets sista datare', 'experimentets sista datapunkt', 1],
    ['handla för eget räkning', 'handla för egen räkning', 1],
    ['som Valuesidans kurs kallar', 'som värdesidans kurs kallar', 1],
  ],
  'the-dhandho-investor': [
    ['vad du vinner per insatsen dollar', 'vad du vinner per insatt dollar', 1],
    ['uppsatta b (uppsidan mot din maxförlust', 'uppskatta b (uppsidan mot din maxförlust', 1],
    ['där Kelly-ärft och värdeinvestering', 'där Kelly-arvet och värdeinvestering', 1],
    ['räntan på räntan faktiskt arbeta', 'räntan på räntan faktiskt arbetar', 1],
    ['varje gång en prognos reviseras nedåt', 'varje gång en prognos revideras nedåt', 1],
  ],
  'the-essays-of-warren-buffett': [
    ['övergiven av sin lärare Benjamin Graham jagade han', 'i lära hos sin lärare Benjamin Graham jagade han', 1],
  ],
  'the-everything-store': [
    ['det bolaget som Aktieanalytiker missförstod', 'det bolaget som aktieanalytiker missförstod', 1],
    ['hur snabbt kan vi växa med den kassa tillväxten själv genererar', 'hur snabbt kan vi växa med den kassa som tillväxten själv genererar', 1],
    ['Kassacykelns läg, andra versionen', 'Kassacykelns lag, andra versionen', 1],
    ['coordination kostar mer än specialisering sparar', 'koordinering kostar mer än specialiseringen sparar', 1],
  ],
  'the-five-rules-for-successful-stock-investing': [
    ['med Dorseyfyra moatkällor', 'med Dorseys fyra moatkällor', 1],
    ['tiominutarestetet', 'tiominutestestet', 1],
    ['är dubbelriktat likviditetsoverskott', 'är ett dubbelriktat likviditetsöverskott', 1],
    ['är den direktesta prismätaren', 'är den mest direkta prismätaren', 1],
    ['eller det kortaste rören vinner', 'eller det kortaste röret vinner', 1],
    ['poäng, i bokens ända:', 'poäng, i bokens ände:', 1],
  ],
  'the-great-crash-1929': [
    ['med ett dyggs varsel', 'med ett dygns varsel', 1],
    ['på vilket uppsägningssvarsel', 'på vilket uppsägningsvarsel', 1],
    ['stod för resten, lånad på penningmarknaden', 'stod för resten, lånade på penningmarknaden', 1],
    ['och Reglering kom först senare', 'och reglering kom först senare', 1],
  ],
  'the-hour-between-dog-and-wolf': [
    ['cortisol och stressresponen', 'cortisol och stressresponsen', 1],
    ['bara förklarar elitglov', 'bara förklarar elitgolv', 1],
    ['som tänds före saftet', 'som tänds före saften', 1],
    ['handlare som amerikansk slutauktion', 'handlare vid amerikansk slutauktion', 1],
    ['utan återhämningsresurver', 'utan återhämtningsresurser', 1],
    ['Det är kursens slutprojekt börjar här.', 'Kursens slutprojekt börjar här.', 1],
  ],
  'the-innovators-dilemma': [
    ['Förstå den fina ledarskapets paradox', 'Förstå det fina ledarskapets paradox', 1],
    ['teorin är en lins, inte en läg', 'teorin är en lins, inte en lag', 1],
    ['Skillnaden mellan disse är inte', 'Skillnaden mellan dessa är inte', 1],
    ['enklare, billigare, mindre, enklare att använda', 'enklare, billigare, mindre, bekvämare att använda', 1],
    ['på de axlar BETYDLIGASTE kunderna', 'på de axlar de viktigaste kunderna', 1],
    ['Mittensjö finns inte', 'Mittenvägen finns inte', 2],
  ],
  'the-intelligent-asset-allocator': [
    ['slutförmögenheten, uppätet av känslor', 'slutförmögenheten, uppätna av känslor', 1],
    ['den som inte spelar tajmingsspelet inte heller kan förlora det', 'den som inte spelar tajmingsspelet kan inte heller förlora det', 1],
  ],
  'the-intelligent-investor': [
    ['finans Historiens mest användbara', 'finanshistoriens mest användbara', 1],
    ['lovar säkerhet för kapitalet', 'utlovar säkerhet för kapitalet', 1],
    ['Dow Jones-industritar', 'Dow Jones-industriindex', 1],
  ],
  'the-little-book-of-value-investing': [
    ['hela den klassiska värdeinvesterings hantverk i', 'hela det klassiska värdeinvesteringshantverket i', 1],
    ['är den klassiska värdeinvesterings hantverk i pocketformat', 'är det klassiska värdeinvesteringshantverket i pocketformat', 1],
    ['Han har en avgörande egenskap till: han aldrig tar illa upp', 'Han har en avgörande egenskap till: han tar aldrig illa upp', 1],
    ['Kursen och kassaflödetavgör värdet', 'Kursen och kassaflödet avgör värdet', 1],
    ['Om du within en månad', 'Om du inom en månad', 1],
    ['bruka Mr Market — var aldrig honom', 'bruka Mr Market — bli aldrig honom', 1],
    ['svårigheten aldrig satt i formlerna', 'svårigheten aldrig låg i formlerna', 1],
  ],
  'the-little-book-that-beats-the-market': [
    ['Hantera kurvartik med förbestämda regler', 'Hantera kurvigheter med förbestämda regler', 1],
    ['en av de bästa notoriteterna i branschhistorien', 'ett av de bästa resultaten i branschhistorien', 1],
  ],
  'the-master-swing-trader': [
    ['swing:trade:r', 'swing-tradar', 13],
    ['swing-trading som folkdom med', 'swing-trading som folksport med', 1],
    ['setupar trängs och tvinar', 'setupar trängs och tunnas ut', 2],
    ['inte som kataloger att memorerar', 'inte som kataloger att memorera', 1],
    ['Fibonacci-retrakt, gap-kanter', 'Fibonacci-retracements, gap-kanter', 1],
    ['med journal och revy', 'med journal och genomgång', 1],
    ['vad marknaden bestömde över natten', 'vad marknaden bestämde över natten', 1],
    ['är inget köpsignal i sig', 'är ingen köpsignal i sig', 1],
    ['deras köpbekämpelse driver priset', 'deras täckningsköp driver priset', 1],
    ['antingen är för tränga (utkastade av brus affären hade rätt i)', 'antingen är för trånga (man kastas ut av bruset ur en affär som hade rätt)', 1],
    ['det är ingen stopp, det är en förhoppning', 'det är inget stopp, det är en förhoppning', 1],
    ['Ett mentalt stopp är ingen stopp', 'Ett mentalt stopp är inget stopp', 1],
    ['undviker stopp i efterhanden', 'undviker stopp i efterhand', 1],
  ],
  'the-money-game': [
    ['betalar för sitt voyereri', 'betalar för sin voyeurism', 1],
    ['Räntan-på-ränta-logiken', 'Ränta-på-ränta-logiken', 1],
    ['Att motsatsen till Charley ingen strategi heller är', 'Att motsatsen till Charley inte heller är någon strategi', 1],
    ['Ett dik på var sida om vägen', 'Ett dike på var sida om vägen', 1],
  ],
  'the-most-important-thing': [
    ['var teorin springer läck', 'var teorin är läck', 1],
    ['det nya ekonomin — vinsterna', 'den nya ekonomin — vinsterna', 1],
  ],
  'the-new-science-of-technical-analysis': [
    ['karriären börjad 1971', 'karriären började 1971', 1],
    ['institutionella översättningen (Jason Perls', 'den institutionella översättningen (Jason Perls', 1],
    ['sätta prisMÅL med ankarprojektion', 'sätta prismål med ankarprojektion', 1],
    ['Genöm alla toppar', 'Genom alla toppar', 1],
    ['Varför insists på nivå två', 'Varför satsa på nivå två', 1],
    ['I en trendritNING blir överköpt', 'I en trendfas blir överköpt', 1],
    ['AK1A:motorerna skiljer', 'AK1A-motorerna skiljer', 1],
    ['matchas — Annars är signalen brus', 'matchas — annars är signalen brus', 1],
    ['är sanningsen svagare', 'är sanningen svagare', 1],
    ['det ärCombo-kapitlets', 'det är Combo-kapitlets', 1],
    ['Kursens återkommande läg:', 'Kursens återkommande lag:', 1],
  ],
  'the-outsiders': [
    ['åtta VD:är', 'åtta VD:ar', 1],
    ['hans mångårige partner', 'hans mangeårige partner', 1],
  ],
  'the-psychology-of-money': [
    ['överraskningens läg', 'överraskningens lag', 1],
    ['Svansar du vinner', 'Svansar vinner du', 1],
  ],
  'the-signal-and-the-noise': [
    ['inte klokare utan lättare vilseleda', 'inte klokare utan lättare vilseledda', 1],
  ],
  'the-snowball': [
    ['— och förklarar bokens signaturmetod', '— och förklara bokens signaturmetod', 1],
    ['via post annonserad direkt', 'via post, annonserad direkt', 1],
  ],
  'the-theory-of-investment-value': [
    ['— högt belåtade kassaflöden känns räntetrycket först', '— hos högt belånade bolag känns räntetrycket först', 1],
  ],
  'the-trend-following-bible': [
    ['positioner bygggs försiktigt', 'positioner byggs försiktigt', 1],
    ['normal åndning', 'normal andning', 1],
    ['extremvinnare som får löpå', 'extremvinnare som får löpa', 1],
    ['breakouten Är beviset', 'breakouten är beviset', 1],
    ['när spannmålen vischar', 'när spannmålen piskar', 1],
    ['identifierar var styrman finns', 'identifierar var styrkan finns', 1],
    ['VAR det just nu lönär sig', 'VAR det just nu lönar sig', 1],
    ['plus kontant Insats som sjunde', 'plus kontant insats som sjunde', 1],
  ],
};

// Kör per-kurs
for (const [key, list] of Object.entries(F)) {
  if (!BATCH.has(key)) { missed.push(key + ' | NYCKEL EJ I BATCH C'); continue; }
  for (const [find, replace] of list) {
    if (find === replace) continue;
    applyTo(data[key], find, replace, key);
  }
}

// se-03: noll-förväntad kontrollpost loggas bara — ta bort ev. missvisning nedan
// (posten med expect 0 är avsiktlig platshållare som inte ska rättas)

// ---------- generiska mallrättningar (endast mallkurser) ----------
const templateCourses = [
  'pf-09-taxloss-harvesting', 'pf-10-longshort', 'pf-11-koncentrerad-portfolj', 'pf-12-arsrapportering',
  'pf-13-esgportfolj', 'pf-14-pensionssparande',
  'se-06-finanssektorn', 'se-07-detailhandel', 'se-08-media', 'se-09-bil', 'se-10-flyg', 'se-11-krypto',
  'se-12-spel', 'se-13-utbildning', 'se-14-livsmedel', 'se-15-logistik',
];
for (const key of templateCourses) {
  applyRegexTo(data[key], /Grunderna i ([^"]{2,70}?) är centralt för att förstå/g, 'Grunderna i $1 är centrala för att förstå', key, 'REGEX Grunderna … är centrala');
  applyRegexTo(data[key], /Djupare förståelse av ([^"]{2,70}?) är centralt för att förstå/g, 'Djupare förståelse av $1 är central för att förstå', key, 'REGEX Djupare förståelse … är central');
  applyTo(data[key], 'från svenska börsen', 'från den svenska börsen', key);
  applyTo(data[key], 'En systematisk approach till', 'Ett systematiskt angreppssätt till', key);
}

// ---------- helbatch: quiz-förkortningar i gemener ----------
const globalFixes = [
  ['definitionen av roa.', 'definitionen av ROA.'],
  ['definitionen av roe.', 'definitionen av ROE.'],
  ['definitionen av ebitda.', 'definitionen av EBITDA.'],
  ['definitionen av p/e.', 'definitionen av P/E.'],
  ['Roa är ett av de viktigaste', 'ROA är ett av de viktigaste'],
  ['Roe är ett av de viktigaste', 'ROE är ett av de viktigaste'],
  ['Arr är ett av de viktigaste', 'ARR är ett av de viktigaste'],
];
for (const key of BATCH) {
  for (const [find, replace] of globalFixes) applyTo(data[key], find, replace, key);
}

// ---------- rapport ----------
console.log('\n--- TILLÄMPADE RÄTTNINGAR ---');
let total = 0;
for (const a of applied) { total += a.n; console.log(`${a.key} | n=${a.n} | ${a.find.slice(0, 90)}`); }
console.log('Summa ersättningar:', total, 'i', applied.length, 'rättningsrader.');
console.log('\n--- MISSADE (0 träffar) ---');
missed.forEach(m => console.log(m));
console.log('Missade:', missed.length);

// Sparar i samma format som detekterades (bevara ev. avslutande radbrytning)
const out = (FMT === 2 ? JSON.stringify(data, null, 2) : JSON.stringify(data)) + (trailingNL ? '\n' : '');
JSON.parse(out); // parse-kontroll
fs.writeFileSync(FILE, out, 'utf8');
console.log('\nFilen skriven. Storlek:', out.length, 'tecken.');
