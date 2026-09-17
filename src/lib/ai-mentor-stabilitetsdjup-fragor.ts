/**
 * AI-MENTORN 2.0 — STABILITETSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 13, s6-u2).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de tjugotvå tidigare
 * lagren (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa,
 * kapitalmekanik, sektor, case, praktik, portfoljgrund, ägande,
 * redovisningsdjup, djup, historia, lönsamhetsdjup, tsdjup, skattedjup,
 * beteendedjup, riskdjup, riskmåttsdjup, utdelningsdjup, förväntningsdjup
 * + omgång 13:s syskon u1: portfoljbalans):
 *   1. Känslighetsanalys & stresstest (st-02 primär + the-intelligent-
 *      investor + st-01 + margin-of-safety) — att RÄKNA vad som händer
 *      med måtten när en variabel böjs, FÖRE verkligheten gör det
 *   2. Soliditetsgrad & balansstyrka (st-01 primär + security-analysis +
 *      v10-skuldsattningsgrad + interpretation-of-financial-statements) —
 *      eget kapital i procent av balansomslutningen; hävstångens aritmetik
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (verktyg/_s6u2-sond-omg13.mjs +
 * _s6u2-sond2-omg13.mjs; 810 kärnord LIVE-lästa ur samtliga 22 lager med
 * den riktiga matcharen, inkl syskon u1:s portfoljbalans på disk i samma
 * fönster — disk-läge-presedensen): samtliga 13 kärnord nedan ligger
 * UTANFÖR felstavningstoleransen mot varje befintligt kärnord (0
 * träffar), och de kanoniska frågorna "vad är känslighetsanalys?",
 * "vad är stresstest?", "vad är känslighetstest?", "vad är
 * soliditetsgrad?", "vad är balansstyrka?" är HELT fria (NULL genom
 * hela kedjan). ÄMNESLUCKA: kategorin STABILITET
 * (5 kurser: st-01, st-02, V10–V12) hade inget eget lager — men grundorden
 * var tagna: "soliditet" och "hävstång" ägs av basens kapitalstruktur-
 * monster (starkord), "skuldsättningsgrad"/"kvick"/"intäktsstabilitet" är
 * V-KURSTITLAR som basens variabeluppslag äger, "likviditet" ägs av basens
 * aktiemarknads-monster, och riskdjup-lagrets skuldfälla fångar
 * "vad är räntetäckningsgrad?" via starkord. Detta lager äger därför
 * FAMILJEORDEN ingen annan bär (känslighetsanalys, stresstest,
 * känslighetstest, soliditetsgrad, balansstyrka) — samma ansvarsfördelning
 * som förväntningsdjup-lagrets katalysator-familj.
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; testfallen G2/J
 * bevisar båda vägarna):
 *   • Basen äger GRUNDORDEN (soliditet, hävstång, likviditet, V-titelorden
 *     skuldsättningsgrad/kvick/intäktsstabilitet): detta lagrets kärnord är
 *     FAMILJEORDEN basens uppslag saknar. Källor och kurslänkar FÅR peka på
 *     basens kärnordskurser (v10-skuldsattningsgrad är här KÄLLA, aldrig
 *     kärnord) — källägande ≠ kärnordsägande (emission/V19-precedensen).
 *   • Riskdjup-lagret äger SKULDFÄLLAN och räntetäckning som starkord
 *     (st-01 är deras fjärde källa): räntetäckningsgraden är här endast
 *     GRANNMÅTT i text och RÄNEEXEMPEL — aldrig kärnord.
 *   • Kapitalmekanik-lagret äger emission/goodwill: näms ej.
 *   • Klarman- och Graham-bokkurserna delas med basens bokmonster som
 *     KÄLLOR (boktitlarna är ingen kärnordsfamilj här).
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som förväntningsdjup-
 * lagrets tsdjup-fälla): frågan "hur stresstestar jag en balansräkning?"
 * fångas av basens rapportläsnings-monster via dess balansräknings-ord —
 * basen existerade före denna leverans och ordet är deras granne. Mina
 * kanoniska frågor bär SAMMANSÄTTNINGARNA (känslighetsanalys, stresstest,
 * känslighetstest, soliditetsgrad, balansstyrka) som ligger ≥ 3 ifrån allt —
 * fällan vakas av testfallet B7 (dokumenterat utfall, inte ett fel att
 * rätta).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx): kedjan enligt förväntningsdjup-lagrets
 * dokumentation med syskon u1:s portfoljbalans och detta lager tillagda
 * SIST:
 *   … ?? svaraLokaltRiskmattsdjup ?? svaraLokaltUtdelningsdjup
 *   ?? svaraLokaltForvantningsdjup ?? svaraLokaltPortfoljbalans
 *   ?? svaraLokaltStabilitetsdjup(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla andra lämnar null
 * på. Omvänt vaktar testfall I på att dessa frågor INTE fångas av kedjan
 * utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur stabilitetsmått RÄKNAS och
 * LÄSAS som metod — inga köp-/säljsignaler, inga placeringstips, inga
 * omdömen om enskilda bolag eller värdepapper. Aritmetiska illustrationer
 * (täckningspar, soliditetsfall, hävstångstrappor) är mekanikens
 * räkneexempel, aldrig utfästelser om utfall.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-stabilitetsdjup.mjs kan köra filen direkt i
 * Node. Alla källkurser (st-02-kanslighetsanalys-och-stresstest,
 * st-01-soliditet-och-rantetackning, the-intelligent-investor,
 * margin-of-safety, security-analysis, v10-skuldsattningsgrad,
 * interpretation-of-financial-statements) finns i KURSREGISTER
 * (verifierat i 358-registret — spår 5:s rebake lägger TILL kurser,
 * slugarna består; kursKalla faller tillbaka på "Läroplanen" om ett
 * framtida register läcker en slug).
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

/** Källrad som avslutar varje svar — KÄLLMÄRT (samma format som motorn). */
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

// ── De 2 stabilitetsdjupfrågorna ────────────────────────────────────────────

export const STABILITETSDJUP_MONSTER: FragMonster[] = [
  {
    id: "kanslighetsanalys",
    karnord: [
      "känslighetsanalys", "känslighetsanalysen", "känslighetstest",
      "känslighetstestet", "stresstest", "stresstesta", "stresstestning",
      "stresstestar",
    ],
    starkord: [
      "scenarie", "scenarier", "chock", "chocker", "marginal", "marginalen",
      "variabel", "variabler", "balansräkning", "tålig", "brottgräns",
      "säkerhetsmarginal",
    ],
    bygga: (reg) => {
      const katAntal = reg.filter((r) => r.kategori === "STABILITET").length;
      const kallor = [
        kursKalla(reg, "st-02-kanslighetsanalys-och-stresstest", "Läroplanen — stabilitetsspåret: känslighetsanalysen som metod, en variabel i taget"),
        kursKalla(reg, "the-intelligent-investor", "Bokmastern — Graham: The Intelligent Investor, säkerhetsmarginalens räknelära"),
        kursKalla(reg, "st-01-soliditet-och-rantetackning", "Läroplanen — de svenska standardmåtten som testas (grannmåttet räntetäckningsgrad ägs av riskdjup-lagret)"),
        kursKalla(reg, "margin-of-safety", "Bokmastern — Klarman: Margin of Safety, marginalen som pris på osäkerhet"),
      ];
      const k = kallor[0];
      const st02 = reg.find((r) => r.slug === "st-02-kanslighetsanalys-och-stresstest");
      const graham = reg.find((r) => r.slug === "the-intelligent-investor");
      return {
        text:
          `Känslighetsanalys är metoden att RÄKNA vad som händer med nyckeltalen när ett antagande böjs — en variabel i taget — och stresstestet är dess förhärdade kusin: flera böjningar SAMTIDIGT i ett obehagligt scenario. Poängen är att göra räkningen FÖRE verkligheten gör den åt en (allt nedan är utbildning i hur metoden byggs — inga prognoser om något enskilt bolag):\n\n1️⃣ EN VARIABEL I TAGET — aritmetisk illustration med räntetäckningsgraden (rörelseresultat ÷ räntekostnad — grannmåttet som riskdjup-lagret äger): ett bolag med rörelseresultat 400 och räntekostnad 100 har täckning 4,0. Böj A: räntekostnaden stiger 50 % (100→150) ⇒ 400/150 = 2,7. Böj B: rörelseresultatet faller 25 % (400→300) med oförändrad ränta ⇒ 3,0. Böj C, stresstestet: BÅDA samtidigt ⇒ 300/150 = 2,0. Tre rader, tre olika verkligheter — och skillnaden mellan 4,0 och 2,0 är skillnaden mellan "marginal" och "ingen marginal" utan att EN nyhet hunnit inträffa.\n2️⃣ VARFÖR DET ÄR SÄKERHETSMARGINALENS RÄKNEFORM — Graham lärde att marginalen inte är en känsla utan ett AVSTÅND: mellan normalfallet och fallet där det bryter. Känslighetsanalysen mäter exakt det avståndet: böj variablerna tills måttet når sin brottgräns och läs av hur mycket utrymme som återstår. Klarman för prislappen på samma lära: marginalen kostar avkastning i det normala fallet och BETALAR i det onormala — att veta vilken man köper är själva övningen.\n3️⃣ SÅ BYGGS TESTET PÅ RIKTIGA MÅTT — kursen stresstestar balansräkningen mot de svenska standardmåtten: soliditetsgraden (stockmåttet — detta lagrets andra monster), räntetäckningen (flödesmåttet), skuldsättningsgraden och likviditeten (AKM1:s V10–V12 bär deras kurser). Konsten är valet av BÖJNINGAR: räntehöjning, valutarörelse, efterfrågefall — inte för att spå dem, utan för att mäta hur mycket tryck konstruktionen tål innan måtten sjunker under nivåerna där besluten tvingas fram.\n\nI kategorin stabilitet finns ${katAntal} kurser — känslighetsanalys-kursen (${st02 ? st02.minuter + " min" : "i registret"}) bygger testet steg för steg, och Grahams bokkurs (${graham ? graham.minuter + " min" : "i registret"}) bär säkerhetsmarginalens bakgrund. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "kanslighetsanalys",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Känslighetsanalys", lank: "/kurser/st-02-kanslighetsanalys-och-stresstest", ikon: "🧪", beskrivning: "Stresstesta balansräkningen" },
          { text: "Kursen: Soliditet & räntetäckning", lank: "/kurser/st-01-soliditet-och-rantetackning", ikon: "⚖️", beskrivning: "De svenska standardmåtten" },
          { text: "Bokmastern: The Intelligent Investor", lank: "/kurser/the-intelligent-investor", ikon: "📚", beskrivning: "Graham — säkerhetsmarginalen" },
          { text: "Bokmastern: Margin of Safety", lank: "/kurser/margin-of-safety", ikon: "🛡️", beskrivning: "Klarman — marginalens pris" },
          { text: "Vad är soliditetsgrad?", lank: "fragor:" + encodeURIComponent("vad är soliditetsgrad?"), ikon: "🧱", beskrivning: "Stockmåttet som testas — detta lagret" },
        ],
        motfraga: { text: "Vad är soliditetsgrad?", kategori: "stabilitet" },
        fordjupa: { text: k.titel, lank: "/kurser/st-02-kanslighetsanalys-och-stresstest" },
      };
    },
  },
  {
    id: "soliditetsgrad",
    karnord: [
      "soliditetsgrad", "soliditetsgraden", "soliditetsläget",
      "balansstyrka", "balansstyrkan",
    ],
    starkord: [
      "eget kapital", "skuld", "skulder", "balansräkning", "balansomslutning",
      "finansiering", "hävstång", "defensiv",
    ],
    bygga: (reg) => {
      const katAntal = reg.filter((r) => r.kategori === "STABILITET").length;
      const kallor = [
        kursKalla(reg, "st-01-soliditet-och-rantetackning", "Läroplanen — stabilitetsspåret: svensk standard, måttet och dess grannar"),
        kursKalla(reg, "security-analysis", "Bokmastern — Graham & Dodd: Security Analysis, balansräkningen som försvarsmur"),
        kursKalla(reg, "v10-skuldsattningsgrad", "Läroplanen — AKM1 V10, spegelmåttet skuld/eget kapital (titelordet ägs av basens variabeluppslag)"),
        kursKalla(reg, "interpretation-of-financial-statements", "Bokmastern — Graham: The Interpretation of Financial Statements, den korta balansläran"),
      ];
      const k = kallor[0];
      const st01 = reg.find((r) => r.slug === "st-01-soliditet-och-rantetackning");
      const sa = reg.find((r) => r.slug === "security-analysis");
      return {
        text:
          `Soliditetsgraden är andelen av balansräkningen som är finansierad med ägarnas eget kapital — eget kapital ÷ balansomslutning — och därmed det mest svenska svaret på frågan hur stark konstruktionen är (allt nedan är utbildning i hur måttet läses — inga omdömen om enskilda bolag):\n\n1️⃣ MÅTTET OCH HÄVSTÅNGENS ARITMETIK — illustration: balansomslutning 1 000, skulder 600, eget kapital 400 ⇒ soliditet 40,0 %. Faller nu tillgångsvärdena 10 % (1 000→900) med skulderna oförändrade krymper det egna kapitalet till 300 — soliditeten 33,3 %. Ett tio-procentigt fall i tillgångarna blev ett TJUGOFEM-procentigt fall i ägarnas kapital: det är hävstången, och den är inget trick utan bråkets mekanik (täljaren är en restpost). Spegelmåttet skuldsättningsgrad (AKM1 V10: skuld ÷ eget kapital) går samtidigt från 1,5 till 2,0 — samma händelse, två mått.\n2️⃣ BROTTGRÄNSERNA — fortsätt trappan: tillgångarna måste falla 40 % (ner till skuldernas 600) innan det egna kapitalet är NOLL — det är måttets hela budskap: soliditeten säger hur djupt fallet får vara innan ägarna är ur spelet. Och med 20 % soliditet (ek 200 av 1 000) räcker ett fall på 20 %. Marginellt olika siffror på pappret, dramatiskt olika brottavstånd — därför läser proffset måttet som AVSTÅND, inte som aktningsvärde.\n3️⃣ GRAHAMS BALANSLÄRA — Security Analysis lärde generationer att läsa balansräkningen som bolagets försvarsmur: hur mycket av den som är mur (eget kapital) och hur mycket som är ställningar (skuld). Två förbehåll följer med från Traditionen: värdena är BOKFÖRDA (inte marknadsvärden), och det egna kapitalet kan bära immateriella poster som inte går att sälja. Därför är soliditetsgraden ett START-mått — känslighetsanalysen (detta lagrets första monster) visar hur den rör sig när verkligheten böjer variablerna.\n\nI kategorin stabilitet finns ${katAntal} kurser — soliditetskursen (${st01 ? st01.minuter + " min" : "i registret"}) går igenom det svenska standardmåttet, och Graham & Dodds bokkurs (${sa ? sa.minuter + " min" : "i registret"}) balansläran i sin helhet. Som alltid: detta är utbildning i hur måttet läses — inga placeringstips.` +
          kallradFler(kallor),
        amne: "soliditetsgrad",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Soliditet & räntetäckning", lank: "/kurser/st-01-soliditet-och-rantetackning", ikon: "⚖️", beskrivning: "Svensk stabilitetsstandard" },
          { text: "Bokmastern: Security Analysis", lank: "/kurser/security-analysis", ikon: "🏛️", beskrivning: "Graham & Dodd — balansräkningen som mur" },
          { text: "Kursen: Skuldsättningsgrad", lank: "/kurser/v10-skuldsattningsgrad", ikon: "🪞", beskrivning: "AKM1 V10 — spegelmåttet" },
          { text: "Bokmastern: Interpretation of Financial Statements", lank: "/kurser/interpretation-of-financial-statements", ikon: "📖", beskrivning: "Graham — den korta balansläran" },
          { text: "Vad är känslighetsanalys?", lank: "fragor:" + encodeURIComponent("vad är känslighetsanalys?"), ikon: "🧪", beskrivning: "Testa måttet mot böjningar — detta lagret" },
        ],
        motfraga: { text: "Vad är känslighetsanalys?", kategori: "stabilitet" },
        fordjupa: { text: k.titel, lank: "/kurser/st-01-soliditet-och-rantetackning" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två stabilitetsdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltStabilitetsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of STABILITETSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
