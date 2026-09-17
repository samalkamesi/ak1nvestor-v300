/**
 * AI-MENTORN 2.0 — DJUPFÖRHANDSFRÅGOR (spår 6, omgång 8, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + extra, makro, nästa,
 * kapitalmekanik, sektor, case, praktik, portfoljgrund — och syskonen
 * agande & redovisningsdjup som skrevs parallellt i detta fönster):
 *   1. Värderingsmultiplar & multipel-val (vm-03 primär + km-011 +
 *      km-010 + vm-04) — värderingsdjupet: pris per enhet fundament
 *   2. FOMO & förlustaversion (km-018 primär + bf-12 + km-035 +
 *      tanka-snabbt-och-langsamt) — beteendedjupet: prospektteorin
 *   3. Mästarna Buffett/Lynch/Fisher (the-warren-buffett-way primär +
 *      mina-basta-investeringar + common-stocks-uncommon-profits +
 *      value-investing-from-graham-to-buffett) — mästarbiblioteket
 *
 * OMSTARTS-BOKFÖRING (omgång 8 är en omstart av samma uppgift): ett
 * tidigare försök av s6-u3 i detta manifest skrev denna fil med
 * AVSKRIVNINGAR som fråga 1 + anspråksfil (s6-omg8-u3-ansprak.md).
 * Försöket dog före test/wiring/commit — och under fönstret levererade
 * syskonet s6-u1 (redovisningsdjup, km-021 primär) samma kärnordsfamilj:
 * deras lager ligger FÖRE detta lager i kedjan och hade stulit varenda
 * avskrivningsfråga ("vad är avskrivningar?" → redovisningsdjup,
 * bevisat LIVE). Ärvda fråga 1 är därför UTBYTT mot MULTIPLAR
 * (portfoljgrund-omgång 7:s AVSTÅENDE-precedens: kärnordskollision
 * med ett tidigare lager = byt ämne, dubbla aldrig). Fråga 2–3 ärvs
 * oförändrade i ämne, polerade i text.
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (559 kärnord LIVE-lästa ur samtliga
 * elva lager på disk, mekaniskt, med den riktiga matcharen): multipl-
 * familjen (multipel/multipler/värderingsmultipel/jämförelsebolag) är
 * helt fri — basen äger "värderingsmultiplikator" men på avstånd 4
 * (toleransen 2), och P/E-ytan via "pe tal"/"p e". VÄRDERINGSMETODER
 * är registrets största helt otäckta kategori (21 kurser); BETEENDE-
 * FINANS (18) och BOKMASTER (103) bär fråga 2–3. Varje svar bär FyRA
 * kurslänkar (spårets "fler kurslänkar per svar") — noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt, testfall H/I
 * bevisar båda vägarna):
 *   • Basen äger värderings-GRUNDORDEN ("värdering", "värdera", "dcf",
 *     "substansvärde", "pe tal", "p e") — detta lagrets kärnord är
 *     familjeorden basen saknar (multipel, värdemultipel, jämförelsebolag).
 *     Svaret nämner P/E, EV/EBIT och EV/Sales i TEXT men bär dem inte som
 *     kärnord; fragor:-knappen "Vad är P/E?" länkar medvetet till basens
 *     svar (bevisat LIVE: "vad är p/e?" → basen).
 *   • Basen äger beteende-GRUNDORDEN (psykologi, bias, känslor, panik,
 *     flockbeteende) — detta lagers kärnord är familjeord basen saknar:
 *     fomo, prospektteori, förlustaversion, kahneman, tversky,
 *     beteendefälla. km-035-flockbeteende används ENDAST som källa och
 *     kurslänk, aldrig som kärnord (samma mönster som portfoljgrund-
 *     lagrets källskatt-notis).
 *   • Basen äger bok-ytan (böcker, bok, lästips, graham, intelligent
 *     investor) — mästarfrågans handlingsknapp ("Vilka böcker ska jag
 *     läsa?") länkar medvetet dit (bevisat LIVE → basen). Mina kärnord
 *     är författar- och titelorden (buffett, lynch, fisher, snowball,
 *     hagstrom …).
 *   • Extra-lagret äger "moat" — mästarsvaret NÄMNER moat-begreppet i
 *     text (Buffetts kärna) men bär det inte som kärnord.
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som case-lagrets
 * "case"/"base"-notis): kärnordet "lynch" (5 tecken, tål 1 fel) kan
 * teoretiskt fånga "lunch" — avstånd 1. Antistöldtestet kör verkliga
 * frågeformuleringar utan träff; risken är domänmässigt försumbar.
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och
 * var död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det.
 * Detta lager kopplas in SIST — och testfall L läser widgetens kedjerad
 * MEKANISKT ur filen (tolv lager i ordning + import) så att "lager utan
 * inkoppling" aldrig kan återkomma tyst.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de
 * rena funktionerna speglas hit). Semantisk likhet med motorn BEVISAS
 * av testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? svaraLokaltExtra(q, KURSREGISTER)
 *     ?? svaraLokalt(q, KURSREGISTER)
 *     ?? svaraLokaltNasta(q, KURSREGISTER)
 *     ?? svaraLokaltKapitalmekanik(q, KURSREGISTER)
 *     ?? svaraLokaltSektor(q, KURSREGISTER)
 *     ?? svaraLokaltCase(q, KURSREGISTER)
 *     ?? svaraLokaltPraktik(q, KURSREGISTER)
 *     ?? svaraLokaltPortfoljgrund(q, KURSREGISTER)
 *     ?? svaraLokaltAgande(q, KURSREGISTER)
 *     ?? svaraLokaltRedovisningsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltDjup(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en
 * fråga från tidigare lager — det fångar bara frågor som alla andra
 * lager lämnar null på. Omvänt vaktar testfall I på att dessa frågor
 * INTE fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur multiplar, prospektteorin
 * och mästarnas analysfilosofier FUNGERAR — inga köp-/säljsignaler,
 * inga placeringstips, inga omdömen om enskilda bolag eller värdepapper.
 * Multipel-svaret visar hur TALET byggs och läses, aldrig vilken nivå
 * som är "rätt"; mästarfrågan beskriver tre historiska investerares
 * METODER som undervisningsmaterial, inte som en uppmaning att placera
 * som någon av dem.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-djup.mjs kan köra filen direkt i Node.
 * Alla källkurser (vm-03-multipelval, km-011-relativ-vardering,
 * km-010-evebit, vm-04-cyklisk-justering, km-018-forlustaversion,
 * bf-12-prospektteori, km-035-flockbeteende, tanka-snabbt-och-langsamt,
 * the-warren-buffett-way, mina-basta-investeringar,
 * common-stocks-uncommon-profits, value-investing-from-graham-to-buffett)
 * finns i KURSREGISTER (verifierat i 364-registret; kursKalla faller
 * tillbaka på "Läroplanen" om ett framtida register läcker en slug).
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

// ── De 3 djupfrågorna ───────────────────────────────────────────────────────

export const DJUP_MONSTER: FragMonster[] = [
  {
    id: "multipel",
    karnord: [
      "multipel", "multipler", "multipeln", "multipelvalet",
      "värderingsmultipel", "värderingsmultiplar",
      "värdemultipel", "värdemultiplar",
      "jämförelsebolag", "jämförelsebolagen", "jämförbara bolag",
    ],
    starkord: [
      "aktier", "bolag", "bolagen", "pris", "priset", "jämföra", "jämför",
      "rapporten", "vinst", "tillväxt",
    ],
    bygga: (reg) => {
      const vmAntal = reg.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
      const kallor = [
        kursKalla(reg, "vm-03-multipelval", "Läroplanen — värderingsmetoder, kursen om multipel-valet"),
        kursKalla(reg, "km-011-relativ-vardering", "Läroplanen — värderingsmetoder, jämförelsebolagens konst"),
        kursKalla(reg, "km-010-evebit", "Läroplanen — värderingsmetoder, multipeln som rensar skuldbilden"),
        kursKalla(reg, "vm-04-cyklisk-justering", "Läroplanen — värderingsmetoder, cykeln i nämnaren"),
      ];
      const k = kallor[0];
      const vm = reg.find((r) => r.slug === "vm-03-multipelval");
      return {
        text:
          `En värderingsmultipel är ett pris per enhet fundament: aktiekursen (eller hela företagsvärdet) delat med något i rapporten. Som räkneövning med två påhittade bolag med samma totala vinst: bolag A kostar 100 kr per aktie och tjänar 5 kr per aktie — 20 gånger vinsten; bolag B kostar 80 kr och tjänar 10 kr — 8 gånger vinsten. Samma industri, vinst i kronor, två mycket olika prislappar per vinstkrona. Multipeln gör den skillnaden synlig i ett enda tal — resten är hantverket:\n\n1️⃣ VAL AV NÄMNARE ÄR VAL AV BERÄTTELSE — vinstmultipeln (P/E, basens eget ämne) passar bolag med stabil, meningsfull vinst; företagsvärdets variant (EV/EBIT) räknar även nettoskulden in i täljaren och gör skuldtynga och skuldfria bolag jämförbara; omsättningsmultiplar (EV/Sales) används när vinsten ännu är negativ eller mycket ung; och cykliskt justerade multiplar (Shiller-spåret) lägger en hel cykels medelvinst i nämnaren så att konjunkturläget inte vrider talet. Multipel-valet är alltså frågan om vilken del av rapporten som bäst beskriver just den verksamheten.\n2️⃣ JÄMFÖRELSEBOLAGEN STYR SVARET — relativ värdering betyder att multipeln sätts mot jämförelsebolag (peer comps): samma bransch, liknande tillväxt och risk. Byt ut ett jämförelsebolag och den "rätta" nivån flyttar — konsten ligger lika mycket i urvalet av spegelbilder som i talet självt.\n3️⃣ MULTIPELEN ÄR EN SAMTALSSTARTARE, INTE ETT FACIT — att ett bolag handlas under sina jämförelsebolag är en OBSERVATION, inte en slutsats: skillnaden kan vara en risk som priset redan räknat med, eller en fördom marknaden hunnit glömma. Frågan "varför handlas just detta bolag annorlunda?" är där multipelarbetet börjar — och det är den egna analysen som svarar, inte talet.\n\nI kategorin värderingsmetoder finns ${vmAntal} kurser — från DCF och WACC till relativa värderingar, PEG, reverse DCF och säkerhetsmarginal. Multipel-valskursen (${vm ? vm.minuter + " min" : "i registret"}) går igenom när vilken multipel passar. Som alltid: detta är utbildning i hur verktyget BYGGS och LÄSES — aldrig en nivå att handla efter.` +
          kallradFler(kallor),
        amne: "multipel",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Multipel-val", lank: "/kurser/vm-03-multipelval", ikon: "📐", beskrivning: "Intermediär — när använda vilken" },
          { text: "Kursen: Relativ värdering", lank: "/kurser/km-011-relativ-vardering", ikon: "🪞", beskrivning: "Intermediär — jämförelsebolagens konst" },
          { text: "Kursen: EV/EBIT", lank: "/kurser/km-010-evebit", ikon: "⚖️", beskrivning: "Intermediär — rensar skuldbilden" },
          { text: "Kursen: Cyklisk justering", lank: "/kurser/vm-04-cyklisk-justering", ikon: "🔄", beskrivning: "Intermediär — cykeln i nämnaren" },
          { text: "Vad är P/E?", lank: "fragor:" + encodeURIComponent("vad är p/e?"), ikon: "🔢", beskrivning: "Grannmekaniken — basens genomgång" },
        ],
        motfraga: { text: "Vad är P/E?", kategori: "värderingsmetoder" },
        fordjupa: { text: k.titel, lank: "/kurser/vm-03-multipelval" },
      };
    },
  },
  {
    id: "fomo",
    karnord: [
      "fomo", "fear of missing out",
      "prospektteori", "prospektteorin",
      "förlustaversion", "förlustaversionen",
      "kahneman", "tversky",
      "beteendefälla", "beteendefällor", "beteendefällan",
      "dispositionseffekt", "dispositionseffekten", "disposition effect",
    ],
    starkord: [
      "psykologi", "känslor", "panik", "rädsla", "beteende",
      "aktier", "köpa", "sälja", "sparande", "uppgång", "fallande",
    ],
    bygga: (reg) => {
      const beteendeAntal = reg.filter((r) => r.kategori === "BETEENDEFINANS").length;
      const kallor = [
        kursKalla(reg, "km-018-forlustaversion", "Läroplanen — beteendefinans, kursen om förlustens övervikt"),
        kursKalla(reg, "bf-12-prospektteori", "Läroplanen — beteendefinans, Kahneman & Tverskys värdefunktion"),
        kursKalla(reg, "km-035-flockbeteende", "Läroplanen — beteendefinans, flocken som dragkraft"),
        kursKalla(reg, "tanka-snabbt-och-langsamt", "Läroplanen — bokmästaren, Kahnemans bok som KOMPLETT-kurs"),
      ];
      const k = kallor[0];
      const bf = reg.find((r) => r.slug === "bf-12-prospektteori");
      return {
        text:
          `FOMO — rädslan att missa när andra tjänar — är inte ett karaktärsfel utan en dokumenterad mekanik i beslutsforskningen, och den har en matematisk kärna:\n\n1️⃣ FÖRLUSTAVERSIONEN — prospektteorin (Kahneman & Tversky, Nobelpris 2002) visar att förluster väger ungefär DUBBELT så tungt som lika stora vinster. Det förklarar det asymmetriska beteendet: vi håller kvar i fallande positioner för att inte "realisera" förlusten, och jagar in oss i stigande för att inte stå utanför vinsten. Samma vri i psyket, två symtom.\n2️⃣ FOMO = flockmekanik + jämförelse — när alla omkring oss verkar tjäna aktiveras flockbeteendets gamla program (den som lämnade gruppen riskerade historiskt att dö; den som följde den riskerade att felbedöma). Börsen belönar ofta det omvända: att kunna sitta still.\n3️⃣ DISPOSITIONSEFFEKTEN — systern till FOMO: sälja vinnarna för tidigt och behålla förlorarna för länge. Prospektteorin förutsäger exakt detta mönster — det är inget nybörjarfel, det är standardprogrammeringen som beteendefinans-kurserna tränar bort med regler och checklistor.\n\nI kategorin beteendefinans finns ${beteendeAntal} kurser — från förlustaversion och ankareffekt till Dunning-Kruger och den kompletta bias-listan. Prospektteorikursen (${bf ? bf.minuter + " min" : "i registret"}) går igenom värdefunktionen på djupet. Som alltid: detta är utbildning i hur tankefallen FUNGERAR — aldrig ett svar på vad just du bör göra.` +
          kallradFler(kallor),
        amne: "fomo",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Förlustaversion", lank: "/kurser/km-018-forlustaversion", ikon: "⚖️", beskrivning: "Nybörjare — förlustens dubbla vikt" },
          { text: "Kursen: Prospektteori", lank: "/kurser/bf-12-prospektteori", ikon: "📉", beskrivning: "Intermediär — värdefunktionens kurva" },
          { text: "Kursen: Flockbeteende", lank: "/kurser/km-035-flockbeteende", ikon: "🐑", beskrivning: "Intermediär — gruppens dragkraft" },
          { text: "Boken som kurs: Tänka snabbt och långsamt", lank: "/kurser/tanka-snabbt-och-langsamt", ikon: "🧠", beskrivning: "Kahnemans KOMPLETT-kurs" },
          { text: "Hur påverkar psykologin mitt sparande?", lank: "fragor:" + encodeURIComponent("hur påverkar psykologin mitt sparande?"), ikon: "🔄", beskrivning: "Baskursen i beteende" },
        ],
        motfraga: { text: "Hur påverkar psykologin mitt sparande?", kategori: "beteendefinans" },
        fordjupa: { text: k.titel, lank: "/kurser/km-018-forlustaversion" },
      };
    },
  },
  {
    id: "mastarna",
    karnord: [
      "buffett", "warren buffett", "lynch", "peter lynch",
      "fisher", "philip fisher", "snowball", "the snowball",
      "hagstrom", "schroeder", "one up on wall street",
      "mästare", "mästarna", "mästarnas",
    ],
    starkord: [
      "böcker", "bok", "läsa", "graham", "värdeinvestering",
      "investera", "investering", "filosofi", "skolor",
    ],
    bygga: (reg) => {
      const bokAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const kallor = [
        kursKalla(reg, "the-warren-buffett-way", "Läroplanen — bokmästaren, Hagstroms genomgång av Buffetts metod"),
        kursKalla(reg, "mina-basta-investeringar", "Läroplanen — bokmästaren, Lynch själv om sina investeringar"),
        kursKalla(reg, "common-stocks-uncommon-profits", "Läroplanen — bokmästaren, Fishers klassiker om kvalitetstillväxt"),
        kursKalla(reg, "value-investing-from-graham-to-buffett", "Läroplanen — bokmästaren, Greenwald binder samman traditionen"),
      ];
      const k = kallor[0];
      const wbw = reg.find((r) => r.slug === "the-warren-buffett-way");
      return {
        text:
          `Warren Buffett, Peter Lynch och Philip Fisher är tre av värdeinvesteringens mest lästa röster — och de kompletterar varandra som tre olika dörrar in i samma hantverk (allt nedan är deras METODER som undervisningsmaterial, inte en uppmaning att placera som någon av dem):\n\n1️⃣ BUFFETT — cirkeln av kompetens och moat-tänket: förstå bara bolag vars verksamhet du faktiskt kan bedöma, och villkor som gör att fördelen håller (begreppet moat har sin egen kurs i grundspåret). Hagstroms The Warren Buffett Way (${wbw ? wbw.minuter + " min" : "i registret"}) plockar isär resonemangen; biografin The Snowball ger tiden runt dem.\n2️⃣ LYNCH — "investera i det du förstår": hans poäng i Mina bästa investeringar är att vardagskunskap kan vara ett analysverktyg — det du ser i butiken, använder på jobbet, hör av dina barn. Ett argument för nyfikenhet som metod, inte för aktieköp på känsla.\n3️⃣ FISHER — scuttlebutt och kvalitetstillväxt: Common Stocks and Uncommon Profits argumenterar för att lära känna få bolag på djupet — kunder, leverantörer, konkurrenter, ledning — hellre än många på ytan. Koncentrerad kunskap som komplement till Grahams siffergrund.\n\nTråden mellan dem drar Greenwalds Value Investing: From Graham to Buffett and Beyond — från Grahams säkerhetsmarginal till moderna tillämpningar. I bokmästar-kategorin finns ${bokAntal} KOMPLETT-kurser (hela böcker som kurser med quiz) — använd dem som läsordning, inte som placeringstips.` +
          kallradFler(kallor),
        amne: "mastarna",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: The Warren Buffett Way", lank: "/kurser/the-warren-buffett-way", ikon: "🧢", beskrivning: "Hagstrom — metoderna systematiserade" },
          { text: "Kursen: Mina bästa investeringar", lank: "/kurser/mina-basta-investeringar", ikon: "📗", beskrivning: "Lynch — själv om sina investeringar" },
          { text: "Kursen: Common Stocks and Uncommon Profits", lank: "/kurser/common-stocks-uncommon-profits", ikon: "🔍", beskrivning: "Fisher — few but deep" },
          { text: "Kursen: Value Investing: Graham to Buffett", lank: "/kurser/value-investing-from-graham-to-buffett", ikon: "🧵", beskrivning: "Greenwald — tråden genom traditionen" },
          { text: "Vilka böcker ska jag läsa?", lank: "fragor:" + encodeURIComponent("vilka böcker ska jag läsa?"), ikon: "📚", beskrivning: "Boklistan från grunden" },
        ],
        motfraga: { text: "Vilka böcker ska jag läsa?", kategori: "bokmästaren" },
        fordjupa: { text: k.titel, lank: "/kurser/the-warren-buffett-way" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre djup-mönstren — eller null (då har
 * hela kedjan före redan lämnat null och API-flödet tar över som förr).
 * Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltDjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of DJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
