/**
 * AI-MENTORN 2.0 — MODERNA RISKTYPER-FÖRHÅNDSFRÅGOR (manifest
 * auto-s6-1789912510460, byggare s6-u3, spår 6, 2026-09-20).
 *
 * Tre källmärkta förhandsfrågor om riskens modernaterritorier —
 * regulatorisk risk, GDPR/datarisk och ESG-risk — speglar rk-06, rk-13
 * och rk-14, som enligt lagerlucksonden (_s6u3-sond-lagerluckor.mjs,
 * 2026-09-20) ALDRIG nämndes i något av de 65 befintliga lagren:
 *
 *   1. Regulatorisk risk  (regelverkens makt — rk-06 + V18)
 *   2. GDPR och datarisk  (personuppgifternas pris — rk-13 + rk-06)
 *   3. ESG-risk           (miljö, socialt, bolagsstyrning — rk-14 + pf-13)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL mot samtliga lager + basmotorn
 * (sond _s6u3-sond-disjunktion.mjs: 0 kärnordskollisioner):
 *   · basen äger naket «risk»/«risken» — därför ligger DETTA lager
 *     FÖRE basen i kedjan (efter extra): frågor som «vad är regulatorisk
 *     risk?» innehåller ju ordet risk och skulle annars falla på basens
 *     generella risk-monster FÖRE alla senare risklager (doktrin: mekanik/
 *     speciallagret före det generella — samma resonemang som våg 210).
 *   · basen behåller katalysator-familjen («katalysator», «kursdrivare»);
 *     «myndighetsbeslut» är basens PROSA i katalysator-monstret men deras
 *     aldrig kärnord — detta lager äger RISKSIDAN av myndighetsvärlden,
 *     och näkter «regulatorisk»/«regulatoriska» bär EJ som kärnord just
 *     för att inte stjäla basens «vad är regulatoriska katalysatorer?»
 *     (endast fraserna «regulatorisk risk»/«regulatoriska risker»).
 *   · riskdjup äger «svart svan»/«svansrisk», riskadress äger
 *     «leverantörsrisk»/«modellrisk»/«personalrisk», kontrahent äger
 *     motparts-familjen — deras frågor bärs här som knappar, aldrig
 *     kärnord.
 *
 * KEDJEPLACERING: EFTER extra, FÖRE bas — tredje motorn. Kärnorden är
 * disjunkta mot makro och extra (de äger ränte-/inflations- respektive
 * kassaflödes-/moat-familjerna), platsen är tie-brytning.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som samtliga
 * syskonlager). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall (B) och determinismfall (C). Driftvarning: ändras
 * motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   … ?? svaraLokaltExtra(q, KURSREGISTER)
 *     ?? svaraLokaltModernaRisker(q, KURSREGISTER)
 *     ?? svaraLokalt(q, KURSREGISTER) ?? …
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur riskerna fungerar — inga
 * omdömen om enskilda bolag, inga undvik-/köpråd, inga bedömningar av
 * myndigheters beslut. Aritmetiken bär tydligt markerade exempelvärden.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-modernarisk.mjs kan köra filen direkt i Node.
 * Källkurserna (rk-06, rk-13, rk-14, v18-regulatoriska, pf-13) finns i
 * KURSREGISTER — inga fantomlänkar (testfall D vaktar).
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som syskonlagren: speglade rena funktioner, bevisade
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

/** Kategoriräknare — registerdrivna tal i svaren (testfall D2 vaktar). */
function rkAntal(register: RegisterRad[]): number {
  return register.filter((r) => r.kategori === "RISKHANTERING").length;
}

// ── De tre moderna risktyps-frågorna ────────────────────────────────────────

export const MODERNA_RISK_MONSTER: FragMonster[] = [
  {
    id: "regulatoriskrisk",
    karnord: [
      "regulatorisk risk", "regulatoriska risker", "regelverk", "regelverket",
      "regelverken", "tillsyn", "tillsynen", "tillsynsmyndighet",
      "tillsynsmyndigheten", "myndighetsbeslut", "myndighetsrisk",
      "kapitalkrav", "kapitalkraven",
    ],
    starkord: ["risk", "bolag", "bank", "banker", "myndighet", "myndigheter", "lagar", "bestämmelser", "regler", "finansinspektionen"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "rk-06-regulatorisk-risk", "Läroplanen — riskhantering, regulatorisk risk"),
        kursKalla(reg, "v18-regulatoriska", "Läroplanen — AKM1, V18 katalysator-dimensionen"),
      ];
      const k = kallor[0];
      return {
        text:
          `Regulatorisk risk är risken att regelverk, tillsynsmyndigheter eller myndighetsbeslut förändrar ett bolags spelregler — inte för att bolaget gör fel, utan för att OMVÄRLDEN skriver om villkoren. Tre delar bär mekaniken:\n\n1. MEKANIKEN — politiken sätter ramarna och tillsynen driver dem. Räkneexempel: en bank med 100 miljoner i utlåning och ett kapitalkrav på 4 procent måste hålla 4 miljoner eget kapital. Höjs kravet till 6 procent har banken två vägar: skjuta till kapital till 6 miljoner — eller krympa utlåningen till 4 ÷ 0,06 ≈ 66,7 miljoner, alltså en tredjedel mindre affär utan att en enda kund släppts. Regeländringen flyttade kassaflödet; ingen marknad var inblandad.\n2. DE BINÄRA UTFALLEN — många myndighetsbeslut är ja eller nej: ett läkemedel godkänns eller avslås, en licens beviljas eller dras in, ett frekvensblock tilldelas i auktion. Utfallet flyttar ofta kursen mer än nyhetens storlek — mekaniken som katalysator-dimensionen (V18) beskriver; där ägs själva kursreaktionsläran.\n3. VAR RISKEN BOR — exponeringen är sektorspecifik: finansbolag bär kapitalkrav och konsumentskyddsregler, läkemedelsbolag godkännandeprocesser, telekom- och energibolag auktioner och utsläppsrättningar, plattformar dataspår. I årsredovisningens riskavsnitt redovisar bolaget själva sina regulatoriska risker — att läsa det avsnittet är en färdighet kursen om riskläsning tränar.\n\nKategorin riskhantering (${rkAntal(reg)} kurser) äger ämnet — att LÄSA regelverkens makt är utbildning; vad någon ÄGER är deras eget beslut.` +
          kallradFler(kallor),
        amne: "regulatorisk risk",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Regulatorisk risk", lank: "/kurser/rk-06-regulatorisk-risk", ikon: "⚖️", beskrivning: "Regelverkens makt över kassaflödet" },
          { text: "Kursen V18: Regulatoriska katalysatorer", lank: "/kurser/v18-regulatoriska", ikon: "🏛️", beskrivning: "Myndighetsbesluten som kursrörare" },
          { text: "Vad är en katalysator?", lank: "fragor:" + encodeURIComponent("vad är en katalysator?"), ikon: "⚡", beskrivning: "Kursreaktionens mekanik" },
        ],
        motfraga: { text: "Vad är GDPR för risk?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-06-regulatorisk-risk" },
      };
    },
  },
  {
    id: "datarisk",
    karnord: [
      "gdpr", "dataskydd", "dataskyddet", "datarisk", "datarisken",
      "dataintrång", "personuppgifter", "personuppgifterna",
      "integritetsrisk", "cyberrisk",
    ],
    starkord: ["risk", "data", "böter", "bolag", "lag", "integritet", "intrång", "it"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "rk-13-gdpr-och-datarisk", "Läroplanen — riskhantering, GDPR och data-risk"),
        kursKalla(reg, "rk-06-regulatorisk-risk", "Läroplanen — riskhantering, regelverkens mekanik"),
      ];
      const k = kallor[0];
      return {
        text:
          `GDPR och datarisk är den moderna sidan av regulatorisk risk: personuppgifternas dubbla natur — affärens råvara och regelverkets anspråk. Tre delar:\n\n1. REGELVERKET — dataskyddsförordningen (EU 2016/679) ger varje person rättigheter kring sina personuppgifter (informeras, få tillgång, radering) och ger varje bolag som behandlar uppgifter skyldigheter. För en verksamhet är datan samtidigt TILLGÅNG (kundregister, beteendedata, matchning) och SKULD (skyldighet att skydda, informera och kunna radera).\n2. ARITMETIKEN I SIFFROR — sanktionstaket är det högre av 4 procent av den globala årsomsättningen eller 20 miljoner euro. Räkneexempel: ett bolag med 1 000 miljoner kronor i omsättning har ett tak på 40 miljoner — mot en årsvinst på 80 miljoner är det teoretiskt hälften av vinsten. Väntevärdet är ett annat: de flesta avgöranden landar långt under taket, och intrångets verkliga kostnad (ersättning, kundbortfall, förtroende) följer ingen tabell. TAKET är aldrig PRIS — det är ett tak.\n3. LÄSNINGEN — datarisken mognar i två steg: VAR finns personuppgifterna (kundregister, HR-system, leverantörskedjor, register i andra länder) och VAD händer vid ett intrång (stängning, omhändertagande, information till drabbade). Ett bolag vars hela affärsmodell vilar på data bär en helt annan profil än ett bolag med ett litet kundregister — samma regel, olika exponering.\n\nMekaniken är utbildning; att bedöma enskilda bolags datahygien är aldrig frågan.` +
          kallradFler(kallor),
        amne: "gdpr och datarisk",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: GDPR och data-risk", lank: "/kurser/rk-13-gdpr-och-datarisk", ikon: "🔐", beskrivning: "Personuppgifternas pris och mekanik" },
          { text: "Kursen: Regulatorisk risk", lank: "/kurser/rk-06-regulatorisk-risk", ikon: "⚖️", beskrivning: "Dataskyddet som en gren av regelverken" },
          { text: "Vad är regulatorisk risk?", lank: "fragor:" + encodeURIComponent("vad är regulatorisk risk?"), ikon: "📜", beskrivning: "Paraplymekaniken" },
        ],
        motfraga: { text: "Vad är ESG-risk?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-13-gdpr-och-datarisk" },
      };
    },
  },
  {
    id: "esg",
    karnord: [
      "esg", "esg-risk", "esg-risker", "esgrisk", "hållbarhetsrisk",
      "hållbarhetsrisken", "miljörisk", "miljörisker", "klimatrisk",
      "klimatrisker", "övergångsrisk", "social risk", "sociala risker",
    ],
    starkord: ["risk", "miljö", "social", "bolagsstyrning", "klimat", "hållbarhet", "utsläpp", "koldioxid"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "rk-14-esgrisk", "Läroplanen — riskhantering, ESG-riskens tre fält"),
        kursKalla(reg, "pf-13-esgportfolj", "Läroplanen — portföljhantering, ESG i portföljen"),
      ];
      const k = kallor[0];
      return {
        text:
          `ESG-risk är de kassaflödesrisker som bor i miljön (E), det sociala (S) och bolagsstyrningen (G) — tre bokstäver som alla betyder konkreta kronor, inte etiketter. Tre fält:\n\n1. MILJÖN — klimatrisken kommer i två sorter. FYSISK risk: torka, översvämning och stormar mot anläggningar och skördar (försäkringsbolagens premiumpress är samma mekanik sedd från andra sidan). ÖVERGÅNGSRISK: priset på utsläppen. Räkneexempel: en anläggning som släpper ut 100 ton koldioxid per år vid ett pris av 1 000 kronor per ton bär 100 tusen kronor i årlig kostnad — höjs priset till 2 000 kronor fördubblas notan till 200 tusen, ett direkt hål i marginalen som ingen sålt mindre.\n2. DET SOCIALA — arbetsrätt, leveranskedjans villkor och varumärkets förtroende. Mekaniken är kundmaktens: en skandal i leveranskedjan kan flytta intäkter snabbare än någon regel — konsumenten är en tillsynsmyndighet utan tak.\n3. BOLAGSSTYRNINGEN (G) — ägarstruktur, styrelsens oberoende och ersättningsmodeller: systemen som avgör hur de två första fälten hanteras. En bolagsstämma där rösterna aldrig används är en sovande riskpost — mekaniken bakom ägandets röstvärde.\n\nKategorin riskhantering (${rkAntal(reg)} kurser) bär djupet och portföljsidan finns i ESG-portföljkursen — läsning av risk, aldrig ett omdöme om vad någon bör äga.` +
          kallradFler(kallor),
        amne: "esg-risk",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: ESG-risk — miljö och sociala", lank: "/kurser/rk-14-esgrisk", ikon: "🌱", beskrivning: "Tre bokstäver, tre konkreta riskfält" },
          { text: "Kursen: ESG-portfölj", lank: "/kurser/pf-13-esgportfolj", ikon: "🧺", beskrivning: "Portföljsidan av samma kunskap" },
          { text: "Vad är regulatorisk risk?", lank: "fragor:" + encodeURIComponent("vad är regulatorisk risk?"), ikon: "📜", beskrivning: "Grannmekaniken: regelverken" },
        ],
        motfraga: { text: "Vad är regulatorisk risk?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-14-esgrisk" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre moderna risktyps-mönstren — eller null
 * (då prövar widgeten nästa lager i kedjan). Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltModernaRisker(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of MODERNA_RISK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
