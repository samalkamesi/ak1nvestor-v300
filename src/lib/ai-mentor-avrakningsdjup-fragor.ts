/**
 * AI-MENTORN 2.0 — AVKASTNINGSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 15, s6-u2).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de tjugosju committade
 * lagren (86 monsters): VÄRDERING-familjens två ännu mentorväglösa kurser —
 * vr-familjens kröning och dess tvärsnittspelare:
 *   1. Avkastningens tre källor (vr-04 primär + vr-03 + kt-02 + ud-09) —
 *      varifrån kommer aktiens avkastning: vinsttillväxten tjänad +
 *      utdelningen beslutad + multipelförändringen tillskänkt (Bogles
 *      påtagligt mot lånat), med spegelparet och trapptestets oköpbara post
 *   2. Tvärsnittet mellan bolag (vr-01 primär + vr-02 + km-027-pegratio +
 *      v06-ev-ebitda) — multipelgapet som påståesesats: att jämföra bolag
 *      kontrollräknat i stället för i intryck
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u2-sond-omg15.mjs, otrackad diskbevis:
 * 27 motorer, 86 monsters, 897 kärnord LIVE-lästa med den riktiga matchern,
 * tre ronder): hela avkastningsformuleringsfamiljen var NULL genom kedjan
 * ("vad är avkastning?" · "var kommer avkastningen ifrån?" · "vad är
 * totalavkastning?" · "prisavkastning" · "hur delas avkastningen upp?") och
 * tvärsnittsfamiljen likaså ("vad är tvärsnittsanalys?" · "hur jämför jag
 * bolag?" · "jämförelse mellan bolag" · "varför handlas lika bolag olika?").
 * Kärnordsgrannar inom tolerans: inga för "tvärsnitt", "bolagjämförelse",
 * "vinsttillväxt", "totalavkastning", "prisavkastning", "avkastningskällor"
 * (plural; singularen "avkastningskälla" ligger redigering 2 från
 * utdelningsdjupets "avkastningsfälla" och lämnas därmed åt utdelningsdjupet
 * — medvetet utan detta lager).
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; emission/V19-
 * precedensen — källägande ≠ kärnordsägande):
 *   • Djup-lagret äger MULTIPEL-ORDEN i praktiken: sonden bevisar att
 *     "vad är multipelgapet?" och "vad är multipelns resa?" FÅNGAS av djupet
 *     ("multipelvalet" ligger redigering 2 från "multipelgapet"). Detta
 *     lager bär därför INGA multipelgap-/multipelres-kärnord — vr-01 och
 *     vr-04 nås via tvärsnitts- och avkastningsformuleringarna, som sonden
 *     visar att kedjan lämnar null på. Kurserna är primära KÄLLOR och
 *     knappmål; formuleringarna ägs av dem som fångar dem först.
 *   • Basens tillväxt-monster äger "organisk tillväxt" och V16-monstret äger
 *     "produktlanseringar" — detta lagers "vinsttillväxt" är avkastnings-
 *     dekompositionens POST (vinstens resa mellan två datum), inte
 *     tillväxtanalysen, och singular "tillväxt" bärs inte här.
 *   • Värderingsjusteringen (u2 omgång 14) äger normalisering/CAPE —
 *     vr-02 länkas som KÄLLA, aldrig som eget kärnord.
 *   • "relativ värdering" och "värdera genom jämförelse" ägs av nästa-
 *     lagret (sond rond 2) — detta lager bär inte heller dem.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras
 * motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro ?? svaraLokaltExtra ?? svaraLokalt ?? svaraLokaltNasta
 *   ?? svaraLokaltKapitalmekanik ?? svaraLokaltSektor ?? svaraLokaltCase
 *   ?? svaraLokaltPraktik ?? svaraLokaltPortfoljgrund ?? svaraLokaltAgande
 *   ?? svaraLokaltRedovisningsdjup ?? svaraLokaltDjup ?? svaraLokaltHistoria
 *   ?? svaraLokaltLonsamhetsdjup ?? svaraLokaltTsdjup ?? svaraLokaltSkattedjup
 *   ?? svaraLokaltBeteendedjup ?? svaraLokaltRiskdjup ?? svaraLokaltRiskmattsdjup
 *   ?? svaraLokaltUtdelningsdjup ?? svaraLokaltForvantningsdjup
 *   ?? svaraLokaltPortfoljbalans ?? svaraLokaltStabilitetsdjup
 *   ?? svaraLokaltGrahamgolv ?? svaraLokaltVarderjustering
 *   ?? svaraLokaltOptionsdjup ?? svaraLokaltRisklasningsdjup
 *   ?? svaraLokaltAvkastningsdjup
 * Detta lager levererades SIST och kan därför aldrig stjäla en fråga från
 * ett tidigare lager; det fångar bara frågor som alla 27 lager före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas
 * av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur avkastningsdekompositionen och
 * multipeljämförelsen DEFINIERAS och RÄKNAS som metod — inga köp-/sälj-
 * signaler, inga placeringstips, inga omdömen om enskilda bolag eller
 * värdepapper. Aritmetiken illustrerar mekaniken med kursfilernas påhittade
 * exempelbolag (Svea Stolar AB) och påhittade jämförelsetal, aldrig
 * utfästelser om avkastning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-avrakningsdjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (vr-04-avkastningens-tre-kallor, vr-01-multipelgapet,
 * vr-03-multipelns-anatomi, kt-02-forvantningsanalys-och-kalibrering,
 * ud-09-utdelningens-hallbarhet, vr-02-normaliserade-multipler,
 * km-027-pegratio, v06-ev-ebitda) finns i KURSREGISTER (verifierat mot
 * 402-registret; kursKalla faller tillbaka på "Läroplanen" om ett framtida
 * register läcker en slug).
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som syskinlagren: speglade rena funktioner, bevisade
// likvärdiga av regressionstestet (fall B + C).

function normalisera(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

function diafri(s: string): string {
  return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}

function redigeringstavstand(a: string, b: string): number {
  if (a === b) return 0;
  const n = a.length;
  const m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array<number>(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
    }
    fore = [...nu];
  }
  return fore[m];
}

function traff(fragaOrd: string[], fragaStr: string, nyckelord: string): boolean {
  const nk = diafri(nyckelord);
  if (!nk) return false;
  if (nk.includes(" ")) return fragaStr.includes(nk); // flerordsfras
  if (nk.length <= 3) return fragaOrd.includes(nk); // korta ord: exakt
  const max = nk.length <= 7 ? 1 : 2; // längre ord tål 1–2 fel
  return fragaOrd.some((o) => redigeringstavstand(o, nk) <= max);
}

/** Källrad som avslutar varje svar — KÄLLMÄRKT (samma format som motorn). */
function kallrad(k: LokalKalla): string {
  return `\n\n📖 Källa: ${k.titel}${k.slug ? ` (${k.slug})` : ""} — ${k.lagrow}.`;
}

/**
 * Flerkällskällmärke — spegling av motorns kallradFler (modulprivat där):
 * en källa ⇒ kallrad-format, flera ⇒ numrerad Källor-lista. Formatet vakas
 * av testfall A ("📖 Källor (").
 */
function kallradFler(kallor: LokalKalla[]): string {
  if (kallor.length === 0) return "";
  if (kallor.length === 1) return kallrad(kallor[0]);
  const rader = kallor
    .map((k, i) => `${i + 1}. ${k.titel}${k.slug ? ` (${k.slug})` : ""} — ${k.lagrow}`)
    .join("\n");
  return `\n\n📖 Källor (${kallor.length}):\n${rader}`;
}

function kursKalla(register: RegisterRad[], slug: string, lagrow: string): LokalKalla {
  const r = register.find((x) => x.slug === slug);
  return r
    ? { slug: r.slug, titel: r.titel, lagrow }
    : { titel: "Läroplanen", lagrow };
}

// ── De 2 avkastningsdjupfrågorna ────────────────────────────────────────────

export const AVKASTNINGSDJUP_MONSTER: FragMonster[] = [
  {
    id: "avkastningskallor",
    karnord: [
      "avkastningskällor", "avkastningskällorna",
      "avkastningens källor", "avkastningens tre källor",
      "varifrån kommer avkastningen", "varifrån kommer aktiens avkastning",
      "var kommer avkastningen ifrån",
      "vad består avkastningen av", "tre källor",
      "vinsttillväxt", "vinsttillväxten",
      "multipelförändring", "multipelförändringen",
      "totalavkastning", "totalavkastningen",
      "prisavkastning", "prisavkastningen",
      "bogle",
    ],
    starkord: [
      "avkastning", "utdelning", "multipel", "källor",
      "resa", "resor", "tjänad", "lånad", "lånat",
      "påtagligt", "period", "år", "procent", "vinst", "dekomposition",
    ],
    bygga: (reg) => {
      const vrAntal = reg.filter((r) => r.kategori === "VÄRDERING").length;
      const kallor = [
        kursKalla(reg, "vr-04-avkastningens-tre-kallor", "Läroplanen — VÄRDERING: var avkastningen kom ifrån, källa för källa"),
        kursKalla(reg, "vr-03-multipelns-anatomi", "Läroplanen — VÄRDERING: vad ett värderingstal innehåller"),
        kursKalla(reg, "kt-02-forvantningsanalys-och-kalibrering", "Läroplanen — KATALYSATOR: ex ante-spegeln, vad som redan står i kursen"),
        kursKalla(reg, "ud-09-utdelningens-hallbarhet", "Läroplanen — UTDELNING: källan som betalas ut längs vägen"),
      ];
      const k = kallor[0];
      const vr4 = reg.find((r) => r.slug === "vr-04-avkastningens-tre-kallor");
      return {
        text:
          `Frågan varifrån avkastningen kommer har ett bestämt svar: tre källor, inte en. (1) VINSTTILLVÄXTEN — bolagets arbete, vinsten per aktie som växer med verksamheten; (2) UTDELNINGEN — bolagets beslut, kronor som lämnas ut till ägarna och är avkastning redan när de landar; (3) MULTELFÖRÄNDRINGEN — marknadens omprissättning, priset per vinstkrona som flyttas mellan två datum. John Bogle kallade de två första produktion och den tredje spekulativavgång — kursens svenska översättning är PÅTAGLIG avkastning (tjänad eller beslutad av bolaget) mot LÅNAD (tillskänkt av marknadens sinnesstämning). Allt nedan är utbildning i redovisningsmetoden — ingen kommentar om något enskilt bolag:\n\n1️⃣ IDENTITETEN SOM BARER ALLT — pris = vinst × multipel, alltså är prisförändring = vinstförändring × multipelförändring. Kursens genomgående exempel är det påhittade Svea Stolar AB: vinsten per aktie växer fem år i rad från 10,00 till 16,00 kronor (+60 procent) och bolaget lämnar 40 procent av vinsten i utdelning — sammanlagt 26,00 kronor på perioden. SPEGELPARET: börjar resan på P/E 20,0 och slutar på 12,5 blir priset 200,0 → 200,0 kronor, ty 1,60 × 0,625 = 1,000 — noll procent prisavkastning trots att företaget lyckades; aktieägaren stod stilla, och med utdelningen blir totalen 26,00 ÷ 200,0 = +13,0 procent. Spegelvänt (P/E 12,5 → 20,0) blir priset 125,0 → 320,0: 1,60 × 1,60 = 2,56, alltså +156 procent, och med utdelningen på lägre insats 221,0 ÷ 125,0 = 1,768 — totalt +176,8 procent. Samma bolag, samma vinstväg, +163 procentenheters skillnad: ETT enda tal — multipelresans riktning — stod för skillnaden, och ingen krona av den delen var bolagets förtjänst.\n2️⃣ DEN ADDITIVA BLUFFEN OCH TRAPPUTPROVET — procent verkar på procent, aldrig bredvid varandra: att lägga ihop 60 − 37,5 = 22,5 är den vanligaste multipelfelen; sanningen är 1,60 × 0,625 = 1,000. Framåt vänds pappret med trapptestet: vad krävs för 10 procent per år i tio år? Med uppskattad tillväxt 6 procent och utdelning 2 procent bär de påtagliga källorna 1,06 × 1,02 = 1,0812 alltså 8,1 procent per år; resten kräver 1,10 ÷ 1,0812 = 1,017 — multipeln måste stiga 1,7 procent per år, varje år, i tio år (samlat 1,017¹⁰ ≈ 1,19). Den posten är OKÖPBAR: bolaget kan inte besluta om den, aktieägaren kan inte tjäna ihop den — den finns bara om framtida köpare värderar bolaget annorlunda. En framåtkalkyl som skriver in multipelutvidgning som en post man räknar med är inte en kalkyl utan ett hopp med siffror på.\n3️⃣ REDOVISNINGSDISCIPLINEN — metoden har fyra steg: välj två datum (fem år är lagom), hämta vinst per aktie på båda och utdelningarna för varje år (utdelningen är den enda källan som betalas ut längs vägen och ska summeras), räkna P/E på båda datumen, multiplicera resorna och KONTROLLERAT mot den faktiska prisförändringen — slutar identiteten inte ihop är något tal felhämtat (vanligast olika vinstdefinitioner eller en emission mitt i perioden). Före dekompositionen kommer vinstkvaliteten: EPS-växt från återköp eller engångsposter dekomponerar troget det den matas med. Gränsen mot förväntningsanalysen hålls skarp: den frågar ex ante vad marknaden redan prissatt, dekompositionen redovisar ex post vad som faktiskt hände.\n\nI värderings-kategorin finns ${vrAntal} kurser — avkastningens tre källor (${vr4 ? vr4.minuter + " min, intermediär nivå" : "i registret"}) är familjens tidsaxel: vr-03 äger vad multipeln är, denna kurs äger vad som hände mellan två datum och var det kom ifrån. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "avkastningens källor",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Avkastningens tre källor", lank: "/kurser/vr-04-avkastningens-tre-kallor", ikon: "🧮", beskrivning: "Dekompositionen källa för källa" },
          { text: "Kursen: Multipelns anatomi", lank: "/kurser/vr-03-multipelns-anatomi", ikon: "🔬", beskrivning: "Vad ett värderingstal innehåller" },
          { text: "Kursen: Förväntningsanalys", lank: "/kurser/kt-02-forvantningsanalys-och-kalibrering", ikon: "🎯", beskrivning: "Ex ante-spegeln — vad står redan i kursen?" },
          { text: "Kursen: Utdelningens hållbarhet", lank: "/kurser/ud-09-utdelningens-hallbarhet", ikon: "💧", beskrivning: "Källan som betalas ut längs vägen" },
          { text: "Vad är förväntningsanalys?", lank: "fragor:" + encodeURIComponent("vad är förväntningsanalys?"), ikon: "🎯", beskrivning: "Spegeln framåt — förväntningsdjupet" },
        ],
        motfraga: { text: "Vad är multipelns anatomi?", kategori: "värdering" },
        fordjupa: { text: k.titel, lank: "/kurser/vr-04-avkastningens-tre-kallor" },
      };
    },
  },
  {
    id: "tvarsnitt",
    karnord: [
      "tvärsnitt", "tvärsnittet", "tvärsnitten",
      "tvärsnittsanalys", "tvärsnittsanalysen",
      "tvärsnittsjämförelse", "tvärsnittsjämförelsen",
      "bolagjämförelse", "bolagjämförelsen",
      "jämföra bolag", "jämför jag bolag", "jämför man bolag",
      "jämförelse mellan bolag",
      "lika bolag", "varför handlas lika bolag olika",
    ],
    starkord: [
      "multipler", "multipel", "gap", "jämföra",
      "jämförelse", "bolag", "bransch", "värdera",
      "värdering", "ränta", "band", "peg", "tillväxt", "risk",
    ],
    bygga: (reg) => {
      const vrAntal = reg.filter((r) => r.kategori === "VÄRDERING").length;
      const kallor = [
        kursKalla(reg, "vr-01-multipelgapet", "Läroplanen — VÄRDERING: varför lika bolag handlas olika"),
        kursKalla(reg, "vr-02-normaliserade-multipler", "Läroplanen — VÄRDERING: räkna bort cykeln före jämförelsen"),
        kursKalla(reg, "km-027-pegratio", "Läroplanen — multipeln satt i relation till tillväxten"),
        kursKalla(reg, "v06-ev-ebitda", "Läroplanen — måttet som ser skulden som P/E inte ser"),
      ];
      const k = kallor[0];
      const vr1 = reg.find((r) => r.slug === "vr-01-multipelgapet");
      return {
        text:
          `Tvärsnittsanalys — att ställa bolag sida vid sida — är värderingsarbetets mest vardagliga rörelse och dess mest förklarade missbruk. Utgångspunkten: multipelgapet mellan två bolag är sällan godtycke, det är en PÅSTÅESESATS som prissätter tre skillnader — TILLVÄXTEN (fler och större framtida vinstkronor förtjänar mer per dagens), KAPITALÅTERKOMSTEN (tillväxt finansierad till avkastning över kapitalkostnaden skapar värde, under den förstör det — P/B och P/E hänger ihop via ROE), och RISKEN (osäkerheten i kassaflödena och balansräkningens robusthet). Uppgiften är att räkna EFTER gapet: stämmer priset på skillnaden? (Allt nedan är utbildning i jämförelsemetoden — inga omdömen om enskilda bolag; exemplens bolag A och B är påhittade.)\n\n1️⃣ KONTROLLRÄKNINGEN — ett arbetsexempel: bolag A handlas till P/E 20, bolag B till P/E 13 — B ser billigare ut. Tre justeringar innan jämförelsen är en jämförelse: först ENGÅNGSPOSTERNA (innehåller B:s vinst en såld division eller skatteeffekt är den underliggande multipeln högre än 13 — rensa basen tills den speglar löpande verksamhet). Sedan TILLVÄXTEN: växer A:s vinst 12 procent om året och B:s 3 procent är A:s multipel delvis en tillväxtprissättning — PEG-logiken: 20 ÷ 12 = 1,7 mot 13 ÷ 3 = 4,3, och plötsligt är det A som ser billigare mot sin tillväxt. Till sist SKULDEN: bär B högre nettoskuld ska EV-måttet räknas för båda — P/E straffar inte skuld, EV/EBITDA gör det, och gapet kan vända tecken vid växling av mått. Checklistan: rensa basen, samma multipel för båda, minst två multipler (en vinstbaserad och en kapitalbaserad), notera tillväxt- och ROE-skillnaderna som förklaringskandidater. Ofta är gapet efter kontrollen mindre än det såg ut — och en jämförelse utan kontroll är inte analys utan intryck.\n2️⃣ RÄNTAN SOM GEMENSAMT GRUNDVATTEN — alla multipler är förenklade diskonteringsuttryck, och en enkel utdelningsmodell visar mekaniken: växer utdelningen 4 procent om året och avkastningskravet är 6 procent blir värdet utdelningen ÷ (0,06 − 0,04) = femtio gånger utdelningen; stiger kravet en enda procent till 7 blir nämnaren 0,03 och värdet trettiotre gånger — en procents ränteförändring pressar den berättigade multipeln med en tredjedel utan att bolaget förändrats en millimeter. Två följdregler: räntkänsligheten växer med hur långt ut i tiden kassaflödena ligger, och jämförelser mellan dagens multipel och tio år gamla är meningslösa utan räntekontext — en multipel som var dyr vid nollränta kan vara rimlig vid hög ränta.\n3️⃣ BANDET OCH FYRA FÄLLOR — en multipels historia rör sig i band (P10–P90): var i bandet står den idag, och vilka antaganden förtjänar platsen i toppen? Fällorna på vägen: TVÄRBRANSCHJÄMFÖRELSEN (en bank och ett teknikkonglomerat vid P/E 14 mäter olika verkligheter — jämför inom bransch eller avstå), DEN FALLANDE VINSTBASEN (låg P/E på en vinst som aldrig infaller är ingen rabatt — kontrollera basens bärighet och normalisera cykeln först), MULTIPEL FÖRVÄXLAD MED VÄRDE (P/E 30 → 20 utan att bli billigare om vinsten samtidigt halverats — läs multipel och bas tillsammans), och MEDELVÄRDESÅTERGÅNGEN SOM LÖFTE (banden själva kan förflyttas av ränteläge, struktur och ägarbild — den som behandlar dagens band som en naturlag har bytt statistik mot tro).\n\nI värderings-kategorin finns ${vrAntal} kurser — multipelgapet (${vr1 ? vr1.minuter + " min, avancerad nivå" : "i registret"}) bygger jämförelsen steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "tvärsnittsanalys",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Multipelgapet", lank: "/kurser/vr-01-multipelgapet", ikon: "📐", beskrivning: "Varför lika bolag handlas olika" },
          { text: "Kursen: Normaliserade multipler", lank: "/kurser/vr-02-normaliserade-multipler", ikon: "🌊", beskrivning: "Räkna bort cykeln före jämförelsen" },
          { text: "Kursen: PEG-ratio", lank: "/kurser/km-027-pegratio", ikon: "⚖️", beskrivning: "Multipeln mot tillväxten" },
          { text: "Kursen: EV/EBITDA", lank: "/kurser/v06-ev-ebitda", ikon: "🏦", beskrivning: "Måttet som ser skulden" },
          { text: "Vad är WACC?", lank: "fragor:" + encodeURIComponent("vad är wacc?"), ikon: "🧯", beskrivning: "Diskonteringsmekaniken i full längd — lönsamhetsdjupet" },
        ],
        motfraga: { text: "Vad är normalisering?", kategori: "värdering" },
        fordjupa: { text: k.titel, lank: "/kurser/vr-01-multipelgapet" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två avkastningsdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltAvkastningsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of AVKASTNINGSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
