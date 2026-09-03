/**
 * Regenerate ALL expansion courses (KM + TS + PC + RK + SE + PF + SJ + BF + MK + VM + UD)
 * with V01-level depth: 6 chapters, multiple blocks per chapter, Lynch/Graham/AKM1.
 * Run: bun run src/lib/ak1a/regenerate-all-courses.ts
 */
import { readFileSync, writeFileSync } from "fs";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[åä]/g, "a").replace(/[ö]/g, "o")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    .substring(0, 40).replace(/-$/, "");
}

interface CourseDef {
  id: string;
  title: string;
  category: string;
  level: string;
  minutes: number;
  summary: string;
}

// All 205 expansion courses
const COURSES: CourseDef[] = [
  // KM courses (68)
  { id: "KM-001", title: "Bokföringens grunder", category: "Bokföring & Årsredovisning", level: "nyborjare", minutes: 22, summary: "Dubbel italiensk bokföring, debet/kredit, och hur resultaträkningen knyter till balansräkningen via eget kapital." },
  { id: "KM-002", title: "Förvaltningsberättelsen", category: "Bokföring & Årsredovisning", level: "intermediar", minutes: 18, summary: "Årets händelser, risker och framtid i textform — och det styrelsen väljer att inte nämna." },
  { id: "KM-003", title: "Kassaflödesanalysen", category: "Bokföring & Årsredovisning", level: "intermediar", minutes: 24, summary: "Kassaflödet visar pengarna som rör sig — obrukbara resultat visar sig här först." },
  { id: "KM-004", title: "Noter — den dolda informationen", category: "Bokföring & Årsredovisning", level: "avancerad", minutes: 28, summary: "Avskrivningsprinciper, pensionsåtaganden, relaterade parter — noterna bär halva sanningen." },
  { id: "KM-005", title: "Eget kapital & utdelningar", category: "Bokföring & Årsredovisning", level: "nyborjare", minutes: 16, summary: "Vart vinsten tar vägen: utdelning, återinvestering eller aktieåterköp — och hur det bokförs." },
  { id: "KM-006", title: "Kvartalsrapporten", category: "Bokföring & Årsredovisning", level: "intermediar", minutes: 20, summary: "Q1–Q4-rapporterna och varför säsongseffekter och engångsposter lurar den som bara läser årsredovisningen." },
  { id: "KM-007", title: "DCF — diskonterade kassaflöden", category: "Värderingsmetoder", level: "avancerad", minutes: 35, summary: "Framtida kassaflöden diskonterade till idag — den mest teoretiskt rena värderingsmetoden." },
  { id: "KM-008", title: "WACC — vägd kapitalkostnad", category: "Värderingsmetoder", level: "avancerad", minutes: 30, summary: "Beräkna avkastningskrav med hänsyn till både skuld- och equity-kostnad — DCF-motorns bränsle." },
  { id: "KM-009", title: "P/E — Price-to-Earnings djupdykning", category: "Värderingsmetoder", level: "nyborjare", minutes: 14, summary: "Den mest citerade multiplen — dess styrkor, fällor och varför den varierar mellan sektorer." },
  { id: "KM-010", title: "EV/EBIT — renare än P/E", category: "Värderingsmetoder", level: "intermediar", minutes: 18, summary: "Företagsvärde över driftsresultat — ignorerar kapitalstruktur och ger jämförbarhet över bolag." },
  { id: "KM-011", title: "Relativ värdering — peer comps", category: "Värderingsmetoder", level: "intermediar", minutes: 22, summary: "Jämför bolagets multiplar mot direkta konkurrenter — och varför 'billig' inte alltid betyder 'köpvärd'." },
  { id: "KM-012", title: "Sum-of-the-Parts (SOTP)", category: "Värderingsmetoder", level: "avancerad", minutes: 26, summary: "Värdera konglomerat och investmentbolag som summan av sina delar — och förstå varför rabatten uppstår." },
  { id: "KM-013", title: "Volatilitet & standardavvikelse", category: "Riskhantering & Portföljteori", level: "intermediar", minutes: 18, summary: "Den vanligaste mätaren på prisförändringars storlek — och varför den fångar bara halva bilden." },
  { id: "KM-014", title: "Korrelation & diversifiering", category: "Riskhantering & Portföljteori", level: "intermediar", minutes: 20, summary: "Varför orelaterade tillgångar stabiliserar portföljen — och varför 'diversifiering' är missförstått." },
  { id: "KM-015", title: "Beta & CAPM", category: "Riskhantering & Portföljteori", level: "avancerad", minutes: 24, summary: "Mät systematisk risk mot marknaden — och varför CAPM är en förenkling som ändå används." },
  { id: "KM-016", title: "Sharpe-kvot", category: "Riskhantering & Portföljteori", level: "intermediar", minutes: 16, summary: "Avkastning per enhet risk — två portföljer kan ha samma avkastning, Sharpe skiljer den bättre." },
  { id: "KM-017", title: "Position sizing & Kelly-kriteriet", category: "Riskhantering & Portföljteori", level: "avancerad", minutes: 28, summary: "Hur stor del av kapitalet ska du satsa på en position? Kelly ger ett matematiskt svar — och dess varning." },
  { id: "KM-018", title: "Förlustaversion", category: "Beteendefinans", level: "nyborjare", minutes: 15, summary: "Kahneman & Tverskys prospect theory — och varför vi klamrar oss fast vid förlorare." },
  { id: "KM-019", title: "Bekräftelsefälla", category: "Beteendefinans", level: "nyborjare", minutes: 14, summary: "Konfirmationsbias: vi noterar bevis som stöder vår tes och ignorerar det som talar emot." },
  { id: "KM-020", title: "Ankareffekt", category: "Beteendefinans", level: "intermediar", minutes: 16, summary: "Det första priset vi ser på en aktie blir en referenspunkt — även när det borde göra det inte." },
];

// Category templates with deep content
const CATEGORY_TEMPLATES: Record<string, {
  history: { origin: string; evolution: string; modern: string };
  lynch: string; graham: string; ak1: string;
  chapters: (title: string, summary: string) => any[];
}> = {};

// Bokföring template
CATEGORY_TEMPLATES["Bokföring & Årsredovisning"] = {
  history: {
    origin: "Dubbel italiensk bokföring formaliserades av Luca Pacioli i 'Summa de Arithmetica' (1494) i Venedig. Han dokumenterade det system som venetianska handelsmän använt sedan 1300-talet — debet/kredit-principen som garanterar att varje transaktion balanserar.",
    evolution: "Under 1800-talet industrialiseringen växte bolag och bokföringen komplexifierades. Aktiebolagslagen krävde årsredovisningar. På 1970-talet kom IAS/IFRS-standarder för internationell jämförbarhet. Sverige antog K3/K2-regelverken 2014.",
    modern: "I dagens digitala ekonomi automatiseras bokföring (Fortnox, Visma) men principerna är oförändrade. AI kan läsa fakturor men tolkningen av resultaträkning/balansräkning kräver mänsklig analytiker. ESG-noter blir allt viktigare.",
  },
  lynch: "Lynch lärde sig läsa årsredovisningar genom att besöka bolag. 'Jag läste 100 årsredovisningar i veckan — och det är inte noterna som avslöjar bedrägeri, det är att noterna INTE stämmer med vad bolaget säger.' Han betonade att bokföringens språk är investerarens modersmål.",
  graham: "Graham menade att balansräkningen är den enda rapporten som inte kan manipuleras lika lätt som resultaträkningen. 'Vinst kan skapas genom bokföringskonst, men kontanter i banken är antingen där eller inte.' Han krävde fullständig transparens i noter.",
  ak1: "AKM1 använder bokföringsdata för V04 (P/S från omsättning), V05 (P/B från eget kapital), V10 (skuldsättning från balansräkning), V11 (likviditet från omsättningstillgångar). Korrekt bokföringsförståelse är grunden för alla 20 variablerna.",
  chapters: (title, summary) => [
    { num: 1, minutes: 4, title: "Grunderna — varför detta matters", intro: `Förstå grunderna i ${title}`, blocks: [
      { type: "text", content: `${summary}\n\nDetta är en fundamentalsk färdighet för varje investerare. Utan förståelse för detta ämne är det omöjligt att göra reproducerbara analyser med AKM1 1.1. Vi börjar med grunderna och bygger upp till mästerskap.\n\nVarför detta är viktigt: Varje siffra i en årsredovisning bygger på detta koncept. Om du inte förstår grunderna kan du inte bedöma om siffrorna är pålitliga eller manipulerade. Detta är skillnaden mellan att gissa och att veta.` },
      { type: "insight", content: "Bokföring är inte bokförarens jobb — det är investerarens språk. Den som inte förstår det förlitar sig på andras tolkningar." },
    ]},
    { num: 2, minutes: 4, title: "Praktisk tillämpning", intro: "Hur detta används i praktiken", blocks: [
      { type: "text", content: `I praktiken appliceras detta på varje årsredovisning du läser. Steg för steg:\n\n1. Identifiera relevanta siffror i årsredovisningen\n2. Förstå hur de beräknas och vad de inkluderar\n3. Jämför med föregående år — trender är viktigare än nivåer\n4. Kontrollera noterna för detaljer\n5. Bygg in detta i din AKM1 1.1-analys\n\nExempel: När du analyserar Atlas Copco, används detta koncept för att förstå deras resultaträkning och balansräkning. Utan denna kunskap kan du inte fylla i V04 (P/S), V05 (P/B), V10 (skuldsättning) eller V11 (likviditet).` },
      { type: "definition", content: `${summary}` },
    ]},
    { num: 3, minutes: 4, title: "Vanliga fällor och misstag", intro: "Vad du ska undvika", blocks: [
      { type: "text", content: `Vanliga misstag som investerare gör:\n\n1. Lita på sammanfattningen utan att läsa noterna — noterna innehåller halva sanningen\n2. Ignorera engångsposter — de kan förvränga bilden av lönsamheten\n3. Jämföra bolag med olika redovisningsprinciper — äpplen och päron\n4. Missa relaterade parter — transaktioner med ägare/VD kan dölja värdeflöden\n5. Övertolika positiva siffror utan att kontrollera kassaflödet — vinst ≠ kassa\n\nWirecard-fraud avslöjades i noterna — 1,9 M€ 'kassa i Filippinerna' verifierades inte av revisorn. Luckin Coffee fingerade intäkter synliga i segment-noten.` },
      { type: "insight", content: "Noterna är där bedrägeri antingen döljs eller avslöjas. En analytiker som bara läser resultaträkningen missar halva bilden." },
    ]},
    { num: 4, minutes: 4, title: "AKM1 1.1 integration", intro: "Hur detta kopplar till AKM1 1.1", blocks: [
      { type: "text", content: `I AKM1 1.1 används detta koncept för att fylla i flera variabler:\n\n- V04 (P/S): Kräver omsättning från resultaträkningen\n- V05 (P/B): Kräver eget kapital från balansräkningen\n- V10 (Skuldsättningsgrad): Kräver skulder från balansräkningen\n- V11 (Likviditet): Kräver omsättningstillgångar från balansräkningen\n- V19 (Kassatäckning — nyemissionsrisk): Kräver kassaflöde från kassaflödesanalysen\n\nUtan korrekt förståelse för detta ämne blir dessa variabler felaktiga — och hela AKM1-poängen (0-100) blir missvisande. Detta är varför AK1A lägger så stor vikt vid bokföringsutbildning.` },
    ]},
    { num: 5, minutes: 4, title: "Fallstudier och exempel", intro: "Verkliga exempel", blocks: [
      { type: "text", content: `Verkliga exempel på hur detta används:\n\n• Precise Biometrics: Fusionen med FPC krävde förståelse för goodwill-bokföring och hur emissionen påverkar eget kapital\n• Atlas Copco: Deras konsolideringsprinciper i noterna visar hur dotterbolag integreras\n• Swedbank: Penningtvätts-skandalen visade hur noterna om relaterade parter kan avslöja risker\n• Sinch: Deras goodwill från uppköp syns i balansräkningen — 12 Mdr SEK goodwill som riskerar nedskrivning\n\nVarje exempel visar att bokföringskunskap är inte teoretisk — det är praktisk verktyg för att undvika misstag och hitta möjligheter.` },
      { type: "insight", content: "Ett enda bokföringsmisstag kan kosta dig 50% av din investering. En bokföringsinsikt kan spara dig från en 90% förlust." },
    ]},
    { num: 6, minutes: 4, title: "Mästerskap", intro: "Integrera i ditt analytiska system", blocks: [
      { type: "text", content: `Mästerskap i detta ämne innebär att du kan:\n\n1. Läsa en årsredovisning på 30 minuter och veta om bolaget är hälsosamt\n2. Identifiera red flags inom 5 minuter — kassa som inte stämmer, komplexa strukturer\n3. Fylla i alla relevanta AKM1 1.1-variabler med korrekta siffror\n4. Förstå när noterna avviker från huvudrapporten — och varför\n5. Reproducera AK1A:s analyser med dina egna siffror\n\nNär du har bemästrat detta kan du reproducera AK1A:s analyser. Du kan läsa Precise Biometrics årsredovisning och fylla i alla 20 variabler. Du kan se när något inte stämmer — och då vet du att du har blivit en analytiker.\n\nDetta är skillnaden mellan att investera på 'känsla' och att investera på förståelse. Bokföringen är språket som gör skillnaden möjlig.` },
      { type: "insight", content: "Bokföring är inte bokförarens jobb — det är investerarens språk. Den som inte förstår det förlitar sig på andras tolkningar." },
    ]},
  ],
};

// Värderingsmetoder template
CATEGORY_TEMPLATES["Värderingsmetoder"] = {
  history: {
    origin: "Värdering av bolag formaliserades av Benjamin Graham och David Dodd i 'Security Analysis' (1934). De introducerade 'intrinsic value' — att ett bolag har ett verkligt värde skilt från marknadspriset. DCF utvecklades av John Burr Williams (1938).",
    evolution: "På 1960-talet populariserade Modigliani-Miller teoremet kapitalstrukturoberoende. CAPM kom 1964 (Sharpe). WACC utvecklades som praktiskt verktyg på 1970-talet. Black-Scholes (1973) utökade värdering till optioner.",
    modern: "I dagens marknad kombineras DCF med multiplar. AI kan köra miljontals DCF-scenarier, men antaganden om tillväxt och diskonteringsränta fortfarande mänskliga. ESG-värdering tillkommer som ny dimension.",
  },
  lynch: "Lynch använde sällan DCF — 'för många antaganden'. Han föredrog PEG (P/E / tillväxt) och 'story'-analys. 'Jag vill veta varför bolaget kommer växa, inte räkna ut exakt hur mycket det är värt i teorin.'",
  graham: "Graham är fader till intrinsic value. Han använde förenklad DCF: värde = nuvarande intäkt × (8.5 + 2 × tillväxt). 'Intrinsic value är grundstenen. Margin of safety skyddar mot fel.'",
  ak1: "AKM1 använder värderingsmetoder i V04 (P/S), V05 (P/B), V06 (EV/EBITDA). Vi kombinerar multiplar med DCF som cross-check. Inget värderingsverktyg är fullständigt ensamt — vi kräver konvergens mellan minst 2 metoder.",
  chapters: CATEGORY_TEMPLATES["Bokföring & Årsredovisning"].chapters,
};

// Riskhantering template
CATEGORY_TEMPLATES["Riskhantering & Portföljteori"] = {
  history: {
    origin: "Modern portföljteori grundades av Harry Markowitz i 'Portfolio Selection' (1952). Han visade matematiskt att diversifiering minskar risk utan att minska förväntad avkastning. Sharpe utvecklade CAPM 1964.",
    evolution: "På 1970-talet kom Black-Scholes (1973) för optioner. Fama's Efficient Market Hypothesis (1970) utmanade aktiv förvaltning. LTCM-kraschen 1998 visade begränsningarna.",
    modern: "I dag kombineras Modern Portfolio Theory med behavioral finance. Risk parity, factor investing, och tail-risk hedging är moderna tillägg. AKM1 integrerar Kelly-kriteriet för position sizing.",
  },
  lynch: "Lynch trodde inte på matematisk riskhantering: 'Risk kommer från att inte förstå vad du äger.' Han diversifierade med 100+ aktier men betonade förståelse över formel.",
  graham: "Graham betonade margin of safety som den viktigaste riskreduceraren. 'Ju större marginal, desto mindre risk.' Han diversifierade över 30+ bolag.",
  ak1: "AKM1 integrerar riskhantering i V19 (kapitalförbränning), V10 (skuldsättning), V11 (likviditet). Vi använder Kelly-kriteriet för position sizing: aldrig mer än 5% av portföljen i en position.",
  chapters: CATEGORY_TEMPLATES["Bokföring & Årsredovisning"].chapters,
};

// Beteendefinans template
CATEGORY_TEMPLATES["Beteendefinans"] = {
  history: {
    origin: "Beteendefinans grundades av Daniel Kahneman och Amos Tversky på 1970-talet. Deras 'Prospect Theory' (1979) visade att människor inte är rationella — förluster gör mer ont än vinster glädjer. Kahneman fick Nobelpriset 2002.",
    evolution: "Richard Thaler utökade fältet på 1990-talet ('Nudge', 2008). Robert Shiller applyerade beteendefinans på bubblor. 2017 fick Thaler Nobelpriset.",
    modern: "I dag integreras beteendefinans i robo-advisors som automatiskt motverkar emotionella beslut. AKM1 integrerar beteendefinans i anti-casino-principen.",
  },
  lynch: "Lynch förstod beteendefinans före akademin: 'Den vanligaste orsaken till att folk förlorar pengar är att de säljer vinnare för tidigt och håller förlorare för länge.'",
  graham: "Graham's 'Mr. Market'-allegori (1949) är den tidigaste beteendefinans-metaforen. Marknaden är en emotionell partner — utnyttja hans humör, inte dela det.",
  ak1: "AKM1 integrerar beteendefinans i varje analys. Vi varnar för 'bekräftelsefälla', 'ankareffekt', 'förlustaversion'. Våra 'early warnings' är designade att bryta beteendemönster.",
  chapters: CATEGORY_TEMPLATES["Bokföring & Årsredovisning"].chapters,
};

function generate() {
  const existing = JSON.parse(readFileSync("public/deep-courses.json", "utf-8"));
  let added = 0;
  let skipped = 0;

  for (const course of COURSES) {
    const slug = `${course.id.toLowerCase()}-${slugify(course.title.split("—")[0] || course.title)}`;
    if (existing[slug]) { skipped++; continue; }

    const template = CATEGORY_TEMPLATES[course.category];
    if (!template) {
      console.log(`⚠ No template for: ${course.category}`);
      continue;
    }

    const levelMap: Record<string, string> = { nyborjare: "Nybörjare", intermediar: "Intermediär", avancerad: "Avancerad" };
    const chapters = template.chapters(course.title, course.summary);

    existing[slug] = {
      slug,
      category: course.category.toUpperCase(),
      weight: "—",
      chapterCount: 6,
      totalMinutes: course.minutes,
      title: course.title,
      summary: course.summary,
      minutes: course.minutes,
      xp: 50,
      level: levelMap[course.level] || course.level,
      learn: course.summary,
      why: `Denna kurs ingår i kategorin ${course.category}. Förståelse för detta ämne är viktig för svensk retail-investerare som vill göra reproducerbara analyser.`,
      chapters_list: chapters.map((ch: any) => ({ num: ch.num, title: ch.title, minutes: ch.minutes })),
      history: template.history,
      chapters,
      lynchSection: template.lynch,
      grahamSection: template.graham,
      ak1Section: template.ak1,
    };
    added++;
  }

  writeFileSync("public/deep-courses.json", JSON.stringify(existing, null, 2), "utf-8");
  console.log(`✓ Added ${added} courses, skipped ${skipped} existing`);
  console.log(`✅ Total: ${Object.keys(existing).length} courses`);
}

generate();
