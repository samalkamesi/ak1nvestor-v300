/**
 * AI-MENTORN 2.0 — KONVERTIBEL-FÖRHANDSFRÅGOR (spår 6, omgång 22, s6-u1).
 *
 * Ett källmärkt förhandsfråga-monster ovanpå de fyrtiosex föregående lagren —
 * kedjans fråga för mellanformerna: konvertibler och hybridkapital, skulden
 * som kan bli eget kapital (ks-06 primär + ks-07 + rk-02 + rk-08 + ma-05).
 *
 * Aktiverar TVÅ mentorväglösa kurser — KATEGORIN KAPITALSTRUKTUR blir fullt
 * länkad (5/7 → 7/7) med ks-06-konvertibler-och-hybridkapital som primär
 * (Intermediär, 24 min) och ks-07-kapitalstrukturens-avvagning som källa
 * (Avancerad) — spårets mål "fler kurslänkar per svar", utan API-kostnad.
 *
 * ÄMNESVAL EFTER SOND I TRE RONDER (verktyg/_s6u1-sond-omg22.mjs, otrackad
 * diskbevis; anspråk data/vakten/s6-omg22-u1-ansprak.md FÖRE byggstart):
 * hela den svenska konvertibel-familjen var NULL genom kedjans 46 motorer /
 * 125 monsters («vad är en konvertibel?» · «vad är konvertibler?» · «vad är
 * hybridkapital?» · «hur fungerar en konvertibel?» · «varför ger bolag ut
 * konvertibler?» · «vad är en konverteringskurs?» · «vad är
 * konverteringspremien?» · «vad är paritetsvärdet?») och preferens-/stämpel-
 * familjen likaså («vad är en preferensaktie?» · «vad är stämpelordningen?» ·
 * «vad är kapitaltrappan?» · «vad är at1-kapital?» · «vad är additional
 * tier 1?»); kärnorden konvertibel/konverteringskurs/konverteringspremie/
 * paritetspris/paritetsvärde/hybridkapital/hybridlån/preferensaktie/preferens/
 * stämpelordning/kapitaltrapp/bytesrätt/evighetsränta RENTA mot kedjans
 * unika syskonkärnord (0 grannar inom tavstånd 4; motorns tolerans är 2).
 * Prototyp-stöldprovet: 0 fångster av syskonens kanoniska frågor.
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; V19-precedensen —
 * källägande ≠ kärnordsägande):
 *   • Basen äger kapitalstruktur-helhetsfrågan («vad är kapitalstrukturen?»
 *     FÅNGAS av basen — sondbevisat) och konkurs-orden («vem betalas först i
 *     konkurs?»); bärs här som fragor:-knapp respektive endast text.
 *   • Makro äger obligation/epi-orden («vad är epi-obligationer?» FÅNGAS av
 *     makro) — obligations-orden är här ENDAST stärkord, aldrig kärnord.
 *   • Optionsdjupet äger optionens premie och order («vad är en köpoption?»
 *     är deras — knapp); konvertibelns inre option nämns endast i text.
 *   • Kapitalmekaniken äger emission-familjen («vad är utspädning?» är
 *     deras) — emission/utspädning här ENDAST stärkord + källkursen rk-02.
 *   • Kreditdjupet äger kreditpris-familjen (ma-05 bärs här ENDAST som
 *     källa + knapp); rk-08 (ränterisk/duration) och rk-02 bärs som källor.
 *   • Naket «konvertering» bärs INTE (granne «kurvinvertering» på tavstånd
 *     4 — avkastningskurvans territorium); detta lager bär endast
 *     sammansättningarna konverteringskurs/-premie/-rätt.
 *   • «at1» är kort-exakt (≤ 3 tecken kräver exakt träff; grannarna akm1/
 *     fas1 på tavstånd 2 kan aldrig nämnas av en fråga som exakt säger at1).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx): detta lager ligger SIST i kedjan (lager
 * 49 av 49, efter bokmastar → riskbudget — omgång 22:s trefönsterordning:
 * tre syskinlager wireades i samma fönster, detta sist) och kan därför aldrig
 * stjäla en fråga från tidigare lager; omvänt vaktar testfall H på att denna
 * fråga INTE fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur mellanformerna DEFINIERAS, RÄKNAS
 * och LÄSES — inga köp-/säljsignaler, inga placeringstips, inga omdömen om
 * enskilda värdepapper. Aritmetiken återger kursens egna exempeltal
 * (1 000 ÷ 125 = 8 aktier · 8 × 160 = 1 280 = +28,0 % · 8 × 125 = 1 000 ·
 * 5,0 − 2,0 = 3,0 procentenheter = 30 kronor per tusen · 6,50 ÷ 0,065 =
 * 100,0 · 6,50 ÷ 0,078 = 83,3 = −16,7 % · stämpelordningen 70/60/25/40 med
 * andelarna 100 %/40 %/0 % · trappans 50/20/65 kronor · AT1:s 16 miljarder
 * francs) — och kursens sista budskap bärs med i texten: hybridens risk är
 * inte ett naturfenomen att gissa sig till utan en konstruktion att läsa ut
 * ur villkoren.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-konvertibel.mjs kan köra filen direkt i Node.
 * Alla källkurser (ks-06-konvertibler-och-hybridkapital,
 * ks-07-kapitalstrukturens-avvagning, rk-02-emissionrisk, rk-08-ranterisk,
 * ma-05-kreditpremien) finns i KURSREGISTER (verifierat mot levande
 * register; kursKalla faller tillbaka på "Läroplanen" om ett framtida
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

// ── Det 1 konvertibel-monstret ──────────────────────────────────────────────

export const KONVERTIBEL_MONSTER: FragMonster[] = [
  {
    id: "konvertibler",
    karnord: [
      "konvertibel", "konvertibler", "konvertibeln", "konvertibla",
      "konverteringskurs", "konverteringskursen",
      "konverteringspremie", "konverteringspremien",
      "konverteringsrätt", "konverteringsrätten",
      "paritetspunkt", "paritetspunkten", "paritetspris", "paritetsvärdet",
      "hybridkapital", "hybridlån", "hybridpapper", "hybridinstrument",
      "preferensaktie", "preferensaktier", "preferensaktien",
      "preferensutdelning", "preferensutdelningen",
      "preferenser", "preferens",
      "stämpelordning", "stämpelordningen",
      "kapitaltrappa", "kapitaltrappan",
      "nollskrivning", "nollskrivningar",
      "at1", "additional tier 1",
      "bytesrätt", "bytesrätten",
      "evighetsränta", "evighetsräntan",
    ],
    starkord: [
      "aktie", "aktier", "aktiens", "lån", "lånet", "låna", "skuld", "skulden",
      "obligation", "obligationer", "obligationslån", "kupong", "kupongen",
      "ränta", "räntan", "räntekänslighet", "utdelning", "utdelningen",
      "fast", "fasta", "nominell", "emission", "emittera", "utspädning",
      "utspädningsrisk", "inlösen", "kurs", "kursen", "värde", "värdet",
      "pris", "priset", "golv", "option", "optionen", "valrätt", "valrätten",
      "kapital", "kapitalet", "kapitalstruktur", "balansräkning",
      "kassaflöde", "kassaflödet", "konkurs", "kris", "bank", "banken",
      "basel", "prospekt", "villkor", "villkoren",
    ],
    bygga: (reg) => {
      const ksAntal = reg.filter((r) => r.kategori === "KAPITALSTRUKTUR").length;
      const kallor = [
        kursKalla(reg, "ks-06-konvertibler-och-hybridkapital", "Läroplanen — KAPITALSTRUKTUR: skulden som kan bli eget kapital"),
        kursKalla(reg, "ks-07-kapitalstrukturens-avvagning", "Läroplanen — KAPITALSTRUKTUR: tre teorier om skuldens rättvikt"),
        kursKalla(reg, "rk-02-emissionrisk", "Läroplanen — RISKHANTERING: utspädningsmekaniken konverteringen utlöser"),
        kursKalla(reg, "rk-08-ranterisk", "Läroplanen — RISKHANTERING: durationstanken bakom evighetsräntans pris"),
        kursKalla(reg, "ma-05-kreditpremien", "Läroplanen — MAKROEKONOMI & RÄNTA: låntagarens pris som sätter kupongen"),
      ];
      const k = kallor[0];
      const ks6 = reg.find((r) => r.slug === "ks-06-konvertibler-och-hybridkapital");
      return {
        text:
          `En konvertibel är ett obligationslån med en inbyggd rättighet: långivaren får, till ett på förhand bestämt pris, byta lånet mot aktier — skuldens säkerhet med en bit av aktiens uppsida. Tillsammans med preferensaktien kallas familjen hybridkapital: instrument som lår av skulden och lånar av aktien. Allt nedan är utbildning i hur mellanformerna är byggda och räknas — inga råd om placering:\n\n1️⃣ KONVERTIBELN — lånet med valrätt — kursens exempletal: ett bolag emitterar konvertibelt obligationslån med lösenbelopp 1 000 kronor, årlig kupong 2,0 procent och konverteringskurs 125 kronor — rätten att byta varje lån mot 1 000 ÷ 125 = 8 aktier. Varför låna ut till 2,0 procent när vanliga obligationer för samma bolag ger 5,0? Därför att kupongen bara är halva ersättningen; den andra halvan är valrätten. Utfärdarens besparing — 5,0 − 2,0 = 3,0 procentenheter, eller 30 kronor om året per tusen — är priset bolaget betalar för optionen. De tre slutlägena, räknade färdigt: går aktien till 160 konverterar innehavaren och får 8 × 160 = 1 280 kronor, en avkastning på 28,0 procent på lösenbeloppet; stannar aktien på 100 är lånet värt mer än aktierna (8 × 100 = 800) och betalas tillbaka till 1 000 — golvet i strukturen; mitt emellan ligger paritetspunkten där aktie 125 ger 8 × 125 = 1 000, exakt lånets värde. Konvertibeln i en mening: en obligation med golvet kvar och en bit av aktiens tak, betald med lägre kupong.\n2️⃣ PREFERENSAKTIEN — utdelningen utan slutdatum — en aktie med två ordningar bytta: utdelningen är FAST (ett bestämt belopp per år, inte styrelsens år från år) och kön är FRAMFÖR de vanliga aktieägarna — men EFTER alla långivare. Utan slutdatum blir prissättningen en evighetsränta: pris = årlig utdelning ÷ avkastningskrav. Kursens exempel: nominellt 100 kronor och utdelning 6,50 kronor om året — när marknadens krav är 6,5 procent blir priset 6,50 ÷ 0,065 = 100,0 kronor; höjs kravet till 7,8 procent (en höjning med 1,3 procentenheter) faller priset till 6,50 ÷ 0,078 = 83,3 kronor — en nedgång på 16,7 procent UTAN att utdelningskronan ändrats en enda öre. Det är evighetsräntans lag i praktiken: den som söker fast avkastning har bytt en osäkerhet (utdelningsbeslutet) mot en annan (ränterörelsen — durationstanken, rk-08), och den skillnaden syns inte i utdelningstabellen utan i prisrutan vid räntevändningen.\n3️⃣ STÄMPELORDNINGEN — vem betalas först — bolagets betalningsordning är en kö, och hybrider definieras genom sin plats i den: först ränta och amortering till långivarna, sedan preferensutdelningen, först därefter vanlig utdelning. Kursens räkneexempel: fritt kassaflöde 70 miljoner kronor, räntekostnad 60, planerad preferensutdelning 25, hoppad vanlig utdelning 40. Långivarna tar 60 av 70 — 100 procent, 10 kvar; preferensägarna får 10 av 25 — 40 procent, 0 kvar; vanliga aktieägare 0 procent. Goda tider gömmer kön, men kapitaltrappan syns alltid i kronkostnaden per tusen: obligationen kostar 50 kronor ränta om året, konvertibeln 20 (men med framtida aktieleverans om kursen går), preferensen 65 i all oändlighet, vanliga aktien allt som blir över. Historiens läxa om att den SKRIVNA ordningen inte är sista instansen: när finanskrisen 2008 visade att bankers kapital kan ätas upp snabbare än utdelningarna stängs skrev Basel III in AT1-papper (additional tier 1) med automatisk verkan vid kapitalbrist — och i mars 2023, när UBS övertog Credit Suisse under en helg, nollskrevs cirka 16 miljarder francs AT1-kapital medan aktieägarna lämnades ett bud i aktier: hierarkin bröts, legalt men omtumlande. Hybridens fyra risker att lära sig läsa: utspädningsrisken (konverteringen levererar nya aktier under marknadskurs — befintliga ägare bär den, rk-02 räknar mekaniken), inlösenrisken (utfärdaren köper tillbaka när det passar den), räntekänsligheten (−16,7 procent i exemplet) och mellanformsfällan (faller som aktie, betalar som skuld). Kursens tre frågor till varje villkorsdokument: var i kön står anspråket, vad är fast och vad är öppet, vem kan ändra spelet?\n\nI kategorin kapitalstruktur finns ${ksAntal} kurser — konvertibler och hybridkapital (${ks6 ? ks6.minuter + " min, " + ks6.niva.toLowerCase() + " nivå" : "i registret"}) är familjens sjätte steg: kapitalstrukturens grunder (ks-01), allokeringen (ks-02) och skuldens anatomi (ks-03) föregår, kapitalstrukturens avvägning (ks-07) är teorikröningen — och denna kurs är mellanformerna mellan dem. Som alltid: detta är utbildning i hur instrumenten fungerar — inga placeringstips, och hybridens risk är en konstruktion att läsa ur villkoren, inte ett naturfenomen att gissa sig till.` +
          kallradFler(kallor),
        amne: "konvertibler",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Konvertibler och hybridkapital", lank: "/kurser/ks-06-konvertibler-och-hybridkapital", ikon: "🔀", beskrivning: "Lånet med valrätt, evighetsräntan och stämpelordningen" },
          { text: "Kursen: Kapitalstrukturens avvägning", lank: "/kurser/ks-07-kapitalstrukturens-avvagning", ikon: "⚖️", beskrivning: "Tre teorier om skuldens rättvikt" },
          { text: "Kursen: Emission-risk — utspädning", lank: "/kurser/rk-02-emissionrisk", ikon: "💧", beskrivning: "Mekaniken konverteringen utlöser" },
          { text: "Vad är kapitalstrukturen?", lank: "fragor:" + encodeURIComponent("vad är kapitalstrukturen?"), ikon: "🏗️", beskrivning: "Basens fråga — hela finansieringen i en bild" },
          { text: "Vad är kreditpremien?", lank: "fragor:" + encodeURIComponent("vad är kreditpremien?"), ikon: "🏦", beskrivning: "Kreditdjup-lagrets fråga — låntagarens pris" },
          { text: "Vad är en köpoption?", lank: "fragor:" + encodeURIComponent("vad är en köpoption?"), ikon: "🎛️", beskrivning: "Optionsdjupets fråga — valrättens moderskap" },
        ],
        motfraga: { text: "Vad är kapitalstrukturen?", kategori: "kapitalstrukturen" },
        fordjupa: { text: k.titel, lank: "/kurser/ks-06-konvertibler-och-hybridkapital" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med konvertibel-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger SIST i
 * widgetens kedja (lager 49 av 49, efter bokmastar → riskbudget) och kan
 * därför aldrig stjäla en fråga från tidigare lager; deras frågor lämnas
 * ifred (kärnorden
 * mekaniskt disjunkta — testfall J/G2 vaktar). Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltKonvertibel(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of KONVERTIBEL_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
