/**
 * AI-MENTORN 2.0 — GRUNDMULTIPLARNA: P/S OCH P/B (omgång 25, manifest
 * auto-s6-1789864506792 — spår 6, byggare s6-u2 försök 2, 2026-09-20).
 *
 * Två källmärkta förhandsfrågor om värderingens två grundmultiplar —
 * intäktskronans och det bokförda kapitalets — speglar v04-ps (P/S
 * Price-to-Sales) och v05-pb (P/B Price-to-Book): VÄRDERING-kategorins
 * två mentorväglösa grundmultiplar (sondlista omgång 25; kategorins tredje
 * mentorväglösa vr-08 Tobins Q bärs här som KÄLLA och lämnas som
 * frågeterritorium åt framtida lager).
 *
 *   1. PsTal   (intäktskronans pris — v04-ps primär; källor v06, vr-03)
 *   2. PbTal   (det bokförda kapitalets pris — v05-pb primär; källor
 *               vr-08, vr-06)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL mot SAMTLIGA befintliga motorer /
 * 171 monsters / 1 764 kärnord (LIVE-lästa ur serverns filer 2026-09-20,
 * sond verktyg/_s6u2b-sond-omg25.mjs):
 *   · Rond 1: PS-familjen TOTALT NULL genom kedjan (ps-tal / ps /
 *     pris per omsättning / price to sales / omsättningsmultipel /
 *     omsättningstal). PB-familjen NULL med två dokumenterade gränser:
 *     «p/b för en bank» → SEKTORNS banklager, «substansvärde» →
 *     NÄSTAS investmentbolag — båda ordens ägare respekterade.
 *   · Rond 2: 0 kärnordskollisioner (mina 11 kärnord RENTA mot samtliga
 *     lager + basmotorn, exakt testfall-K-logik).
 *   · Rond 3: råa «p/s»/«p/b» med skavatt är SUBSTRING-FARLIGA —
 *     «köp svenska aktier» normaliseras till «kop svenska aktier» som
 *     INNEHÅLLER sekvensen «p s». Därför: korta exakta ORD «ps»/«pb»
 *     (ordgranularitet, aldrig substring).
 *
 * STRUKNA kärnord (dokumenterade gränser):
 *   · "p/s"/"p/b" — substring-faran ovan; kursens egna sammansättningar
 *     «ps-tal»/«pb-tal» normaliseras till ord och fångas av «ps»/«pb»,
 *     medan «vad är p/s?»-formen (orden «p» och «s» separeras av
 *     normaliseringen) lämnas åt widgetens narmasteKurser-fallback —
 *     samma dokumenterade gräns som u1:s naketa «arbitrage».
 *   · "substansvärde" — nästa-lagrets investmentbolag (sond rond 1:
 *     träff, ämne investmentbolag).
 *   · "bokfört värde"/"eget kapital" — bokförings- och kapitalfamiljernas
 *     kärnterritorium (bärs i text, aldrig som kärnord — kontrahent-
 *     precedensens «ccp»-mönster).
 *   · "roe" — lösamhets- och värderingslagrens ord (P/B = P/E × ROE-
 *     algebran bärs i text).
 *   · "bank" — sektor-lagrets (p/b FÖR EN BANK är deras kanoniska fråga).
 *
 * KEDJEPLACERING: 61:a motorn (av 62), FÖRE marknadsrytm — deras
 * SIST-deklaration i widgeten + deras testfall L01 (SISTA ledet) respekteras.
 * Multiplarorden är mekaniskt disjunkta mot samtliga tidigare lager.
 * Verifieras av kedjetestets fall G + detta lagers testfall K (kärnorden
 * läses LIVE ur samtliga src/lib/ai-mentor-*-fragor.ts vid varje körning)
 * och testfall G/G2 (antistöld mot hela kedjan, härledd ur kärnorden).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som samtliga
 * syskonlager). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   … ?? svaraLokaltKontrahent(q, KURSREGISTER)
 *     ?? svaraLokaltMultipel(q, KURSREGISTER)
 *     ?? svaraLokaltMarknadsrytm(q, KURSREGISTER)   ← SIST (deras deklaration)
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur multiplarna räknas, läses och
 * fälls — AKM1:s tröskelpoäng presenteras som METODENS sätt att väga ett
 * värderingstal, aldrig som köp- eller säljsignal. Aritmetiken bär tydligt
 * markerade exempelvärden ur kursernas eget underlag (våg 192).
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-multipel.mjs kan köra filen direkt i Node.
 * Källkurserna (v04-ps, v06-ev-ebitda, vr-03-multipelns-anatomi, v05-pb,
 * vr-08-tobins-q, vr-06-jamforelsebolagen) finns i KURSREGISTER — inga
 * fantomlänkar (testfall D vaktar).
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

/** Kategoriräknare — registerdrivna tal i svaret (testfall D2 vaktar). */
function varderingAntal(register: RegisterRad[]): number {
  return register.filter((r) => r.kategori === "VÄRDERING").length;
}

// ── De 2 multipel-frågorna ──────────────────────────────────────────────────

export const MULTIPEL_MONSTER: FragMonster[] = [
  {
    id: "ps-tal",
    karnord: [
      "ps", "price to sales", "pris per omsättning", "pris/omsättning",
      "omsättningsmultipel", "omsättningstal",
    ],
    starkord: ["multipel", "värdering", "omsättning", "intäkt", "marginal", "räkna", "billig"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "v04-ps", "Läroplanen — värdering, P/S-talet (V04)"),
        kursKalla(reg, "v06-ev-ebitda", "Läroplanen — värdering, EV-måttet som tar skulderna"),
        kursKalla(reg, "vr-03-multipelns-anatomi", "Läroplanen — värdering, vad ett värderingstal innehåller"),
      ];
      const k = kallor[0];
      return {
        text:
          `P/S-talet — price to sales — svarar på en enda fråga: hur många kronor betalar marknaden per krona intäkt? Det räknas som börsvärde ÷ nettoomsättning (senaste tolv månader). P/S är värderingsfamiljens robustaste medlem när vinsten sviker: ett bolag i vändning eller kris kan ha negativ eller meningslös P/E — men det har alltid en P/S, för intäkterna finns kvar även när vinsten gjort paus. Tre delar:\n\n1. MARGINALFÄLLAN — en intäktskrona är inte värd lika mycket i alla branscher. Hos ett mjukvarubolag blir 80–90 öre av intäktskronan bruttovinst; hos en distributör blir det 5–15 öre. Samma P/S är alltså radikalt olika dyr beroende på marginalstruktur — därför läses P/S alltid tillsammans med lönsamheten.\n2. TABELLEN SOM ÄR HELA LEKTIONEN — räkna själv med universumets tal (börsvärde ÷ omsättning, hämtat 2026-09-03): Sinch 31 757 ÷ 27 080 = 1,17 med EBIT-marginal 2,5 % · Alfa Laval 231 545 ÷ 69 674 = 3,32 med 16,2 % · Atlas Copco 984 018 ÷ 168 343 = 5,85 med 20,6 % · Microsoft 3 689 160 ÷ 331 839 = 11,12 med 45,1 %. Sinch är «billigast» på P/S — och har sämst marginal; Microsoft är «dyrast» — och gör 45 öre EBIT per intäktskrona. Marknaden betalar mer per intäktskrona när fler öre blir vinst.\n3. FÄLLORNA — låg P/S på lågmarginalverksamhet är sällan en fyndkarta: distributörer och handelsbolag handlas strukturellt kring 0,1–0,5, inte för att de är glömda utan för att intäktskronan bär så lite vinst. Vid konjunkturtopp är intäkterna rekordhöga och P/S ser låg ut precis när marginalerna står inför fall. Uppköpt omsättning sväller nämnaren utan att aktien blev billigare per organisk krona — kontrollera organisk tillväxt i förvaltningsberättelsen. Och P/S ignorerar skulder: två bolag med P/S 2 där det ena är nettokassa och det andra högt belånat är inte samma affär — det är EV-måttens jobb.\n\nMETODENS TRÖSKLAR (AKM1:s sätt att väga V04): P/S under 1 ger 5 poäng, under 2 ger 4, under 3 ger 3, under 5 ger 2, på eller över 5 ger 1. Med tabellens tal: Sinch 1,17 → 4 p · Alfa Laval 3,32 → 2 p · Atlas Copco 5,85 → 1 p · Microsoft 11,12 → 1 p. Men poängen läses alltid mot marginaler och tillväxt — 5 p i V04 med 1 p i lönsamhet är ett mönster att förstå (tradarens lågmarginalbolag), inte en gratis lunch. Värderingskategorin (${varderingAntal(reg)} kurser) äger djupet — hur någon BÖR värdera ett bepamt bolag är en rådgivningsfråga vi aldrig besvarar.` +
          kallradFler(kallor),
        amne: "ps-tal",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: P/S (Price-to-Sales)", lank: "/kurser/v04-ps", ikon: "📏", beskrivning: "Multipeln som överlever vinstsviket" },
          { text: "Kursen: EV/EBITDA", lank: "/kurser/v06-ev-ebitda", ikon: "🧮", beskrivning: "Skuldernas plats i bilden" },
          { text: "Vad är pb-talet?", lank: "fragor:" + encodeURIComponent("vad är pb-talet?"), ikon: "📐", beskrivning: "Syskonmultipeln — kronor per bokfört kapital" },
        ],
        motfraga: { text: "Vad är P/B-talet?", kategori: "vardering" },
        fordjupa: { text: k.titel, lank: "/kurser/v04-ps" },
      };
    },
  },
  {
    id: "pb-tal",
    karnord: [
      "pb", "price to book", "pris per bokfört värde", "pris/bokfört värde",
      "pris per eget kapital",
    ],
    starkord: ["multipel", "värdering", "balansräkning", "kapital", "återköp", "goodwill"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "v05-pb", "Läroplanen — värdering, P/B-talet (V05)"),
        kursKalla(reg, "vr-08-tobins-q", "Läroplanen — värdering, marknadsvärdet mot återanskaffningspriset"),
        kursKalla(reg, "vr-06-jamforelsebolagen", "Läroplanen — värdering, urvalet bakom varje multipel"),
      ];
      const k = kallor[0];
      return {
        text:
          `P/B-talet — price to book — svarar på: vad betalar marknaden per krona bokfört eget kapital? Det räknas som börsvärde ÷ eget kapital (balansräkningens nedre del). Det egna kapitalet är det aktieägarna har kvar av allt bolaget äger minus allt det är skyldigt — bokföringens återstående värde. P/B är värderingens äldsta mått, och det fungerar bäst där balansräkningen speglar affären: banker, försäkring, kapitaltunga industrier, fastigheter. För kunskapsbolag är det svagare — det viktigaste (varumärke, kod, kunnande) står inte i balansräkningen. Tre delar:\n\n1. DE FEM TALEN SOM BETYDER FEM OLIKA SAKER (ur universumet, fält för P/B): Sinch 1,38 efter att nedskrivningar rensat kapitalet (ROE 1,9 %) · Ericsson B 3,09 (ROE 26,1 %) · Atlas Copco A 9,26 (ROE 25,7 % — högt ROE driver multipeln) · Kambi 29,18 (ROE 7,0 %, bruttomarginal 98,9 % — mjukvaruvärdet bor inte i balansräkningen) · Apple 44,15 (ROE 148,8 % — återköpsmaskinen har krympt nämnaren tills eget kapital blivit en restpost). Fem «P/B-tal», fem olika läsningar.\n2. FÄLLORNA — återköpsfällan: eget kapital krymper av återköp, så P/B och ROE stiger mekaniskt utan att affären förändrats — hög P/B på en återköpsmaskin är inte samma sak som dyr aktie. Goodwillfällan: eget kapital uppblåst av aldrig-testad köpeskilling ser rimligt ut medan reella värden är lägre — kontrollera goodwill-andelen av tillgångarna och nedskrivningshistoriken. Negativt eget kapital: tunga återköp och utdelningar kan driva kapitalet under noll — då är P/B oläsligt (negativt), inte aktien «gratis»; byt mått. Och omvärderingsreserver (fastigheter) gör kapitalet känsligt för värderingsantaganden — notens fotnoter bär sanningen.\n3. ALGEBRAN SOM KNYTER IHOP FAMILJEN — P/B = P/E × ROE. Pris per bokfört krona är alltså samma tal som vinstmultipeln gånger avkastningen på kapitalet: därför kan Apple ha P/B 44 och ändå inte vara «dyrare» än ett bolag med P/B 2 och ROE 3 %. Det är också därför metoden aldrig ger P/B ensamt sista ordet.\n\nMETODENS TRÖSKLAR (AKM1:s sätt att väga V05): P/B under 1 ger 5 poäng, under 2 ger 4, under 3 ger 3, under 5 ger 2, på eller över 5 ger 1. Med tabellens tal: Sinch 1,38 → 4 p · Ericsson 3,09 → 2 p · Atlas Copco 9,26 → 1 p · Kambi 29,18 → 1 p · Apple 44,15 → 1 p. Och här visar metoden sin egen gräns: Apple får 1 p trots ROE 148,8 % — den som läser V05 blint straffas av återköpsdriven kapitalkrympning, så V05 läses alltid tillsammans med lönsamheten och goodwill-noten. Värderingskategorin (${varderingAntal(reg)} kurser) äger djupet — hur någon BÖR värdera är en rådgivningsfråga vi aldrig besvarar.` +
          kallradFler(kallor),
        amne: "pb-tal",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: P/B (Price-to-Book)", lank: "/kurser/v05-pb", ikon: "📚", beskrivning: "Det äldsta måttet — och dess fällor" },
          { text: "Kursen: Tobins Q", lank: "/kurser/vr-08-tobins-q", ikon: "⚖️", beskrivning: "Marknadsvärdet mot återanskaffningspriset" },
          { text: "Vad är ps-talet?", lank: "fragor:" + encodeURIComponent("vad är ps-talet?"), ikon: "📏", beskrivning: "Syskonmultipeln — kronor per intäkt" },
        ],
        motfraga: { text: "Vad är P/S-talet?", kategori: "vardering" },
        fordjupa: { text: k.titel, lank: "/kurser/v05-pb" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två multipel-mönstren — eller null
 * (då prövar widgeten nästa lager i kedjan). Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltMultipel(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of MULTIPEL_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
