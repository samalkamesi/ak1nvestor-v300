/**
 * AI-MENTORN 2.0 — VALUTAMEKANIK-FÖRHÅSFRÅGOR (våg 210 — spår 6, PIPELINE-KO
 * ombokad rond 103, levererad av studion 2026-09-19).
 *
 * Tio källmärkta förhandsfrågor om VALUTANS MEKANIK — PPP, ränteparitet,
 * realväxelkursen, kronstyrka, devalvering, hedging och valutamarknadens
 * byggnad — speglar ma-07 (Valutakursens mekanik — PPP, ränteparitet och
 * exportörens vind) och rk-07 (Valutarisk), som fram till denna våg saknade
 * eget förhandsfrågelager.
 *
 *   1. Köpkraftsparitet  (PPP — ma-07)
 *   2. Ränteparitet      (ränteskillnadens valutadrag — ma-07 + ma-03)
 *   3. Realväxelkurs     (inflationsjusterad kurs — ma-07; REER ägs av
 *                         realekonomi-lagret och hänvisas endast)
 *   4. Kronstyrka        (stark/svag krona — ma-07 + rk-07)
 *   5. Devalvering       (fast kurs böjs — ma-07 + rk-07)
 *   6. Hedging           (säkra valutarisk — rk-07)
 *   7. Exportörens vind  (vinstmarginal vs kurs — ma-07)
 *   8. Reservvaluta      (dollarns roll, safe haven — ma-07)
 *   9. Valutamarknaden   (marknadens byggnad och valutapar — ma-07)
 *  10. Valutalån         (låna i annan valuta — rk-07)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL mot SAMTLIGA 56 befintliga lager
 * (kärnorden lästa ur serverns aktuella filer 2026-09-19, rond 105):
 *   · portfoljgrund äger valuta-GRUNDERNA (kärnorden "valuta", "valutan",
 *     "valutarisk", "valutakurs*", "växelkurs*", "dollar", "dollarn",
 *     "euro") — detta lager äger MEKANIKEN och rör ALDRIG de nakna
 *     grundorden: "vad är valutarisk?" förblir portfoljgrunds fråga
 *     (kedjevaktens kanoniska rad motor 9 vaktar gränsen).
 *   · realekonomi äger "reer" och handelsbalansfamiljen — realväxelkurs-
 *     monstret använder det svenska compound-ordet och hänvisar till REER
 *     som prosa, aldrig som kärnord.
 *   · makro äger "köpkraft" (naket) — "köpkraftsparitet" (16 tecken,
 *     editavstånd 8) träffar aldrig makro; gränsen vaktas i testfall G2.
 *   · overlevnadsdjup äger "konkursrisk" (editavstånd 3 från "kursrisk" —
 *     utanför motorns 2-feltak; "kursrisk" används därför ej som kärnord
 *     här alls, endast som prosa).
 *   Verifierat mekaniskt av testfall K (kärnorden läses LIVE ur samtliga
 *   src/lib/ai-mentor-*-fragor.ts vid varje körning) och testfall G
 *   (antistöld mot tidigare lagers kanoniska frågor).
 *
 * KEDJEPLACERING: EFTER praktik, FÖRE portfoljgrund — samma doktrin som
 * våg 189:s marknadsmekanik (mekaniklagret före det generella): frågor om
 * valutans BYGGGNAD ska inte falla på portfoljgrundens korta
 * valutarisk-svar. Kärnorden är disjunkta — platsen är tie-brytning.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som samtliga
 * syskonlager). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   … ?? svaraLokaltPraktik(q, KURSREGISTER)
 *     ?? svaraLokaltValutamekanik(q, KURSREGISTER)
 *     ?? svaraLokaltPortfoljgrund(q, KURSREGISTER) ?? …
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur valutamekanikerna fungerar —
 * inga växelkursprognoser, inga val av valuta eller säkringsstrategi,
 * inga omdömen om enskilda valutor. Aritmetiken bär tydligt markerade
 * exempelvärden, aldrig aktuella kurser.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-valutamekanik.mjs kan köra filen direkt i Node.
 * Källkurserna (ma-07, rk-07, ma-01, ma-03) finns i KURSREGISTER — inga
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

/** Kategoriräknare — registerdrivna tal i svaren (testfall D2 vaktar). */
function maAntal(register: RegisterRad[]): number {
  return register.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
}

function rkAntal(register: RegisterRad[]): number {
  return register.filter((r) => r.kategori === "RISKHANTERING").length;
}

// ── De 10 valutamekanik-frågorna ────────────────────────────────────────────

export const VALUTAMEKANIK_MONSTER: FragMonster[] = [
  {
    id: "ppp",
    karnord: ["ppp", "köpkraftsparitet", "köpkraftspariteten"],
    starkord: ["valuta", "kurs", "olika priser", "dyrt", "billigt", "fungerar", "betyder"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, valutakursens mekanik"),
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, valutariskens grunder"),
      ];
      const k = kallor[0];
      return {
        text:
          `Köpkraftsparitet (PPP, purchasing power parity) är idén att samma varukorg över tid borde kosta detsamma mätt i en gemensam valuta — annars är det som att jämföra två butikers priser utan att titta på växlingskursen. Tre delar bär mekaniken:\n\n1. IDÉN — om en korg kostar 100 kronor i Sverige och 10 dollar i USA pepar kursen 10 kronor per dollar på att köpkraften står i paritet. Slår kursen iväg från det talet blir den ena korgen "dyr" och den andra "billig" — mätt i samma valuta.\n2. KORGEN OCH VERKLIGHETEN — PPP förutsätter frihandel, likadana varor och inga transportkostnader. Verkligheten bär tullar, hyror och lokala löner: en frisyr kan inte köpas i ett annat land. Därför gäller PPP bäst för varor som handlas över gränser och som LÅNGSIKTIG gravitation — inte som kortsiktig prognos.\n3. ANVÄNDNINGEN — index som justerar BNP per capita efter köpkraft jämför levnadsstandard mellan länder med olika prisnivåer; utan justering blir dyra länder konstigt "rika" enbart för att priserna är höga.\n\nPPP är ett måttverk, inte en växelkursprognos — vad en kurs KOMMER att göra är aldrig frågan här.` +
          kallradFler(kallor),
        amne: "köpkraftsparitet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "PPP, ränteparitet och exportörens vind" },
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "🛡️", beskrivning: "Risk-sidan av samma mekanik" },
          { text: "Vad är ränteparitet?", lank: "fragor:" + encodeURIComponent("vad är ränteparitet?"), ikon: "⚖️", beskrivning: "Syskonmekaniken — räntans drag" },
        ],
        motfraga: { text: "Vad är ränteparitet?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-07-valutakursens-mekanik" },
      };
    },
  },
  {
    id: "ranteparitet",
    karnord: ["ränteparitet", "räntepariteten", "ränteparitetsteoremet"],
    starkord: ["ränta", "räntor", "valuta", "skillnad", "kurs", "fungerar"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, ränteparitetens valutadrag"),
        kursKalla(reg, "ma-03-realrantan", "Läroplanen — makroekonomi & ränta, pengars tidsvärde efter inflation"),
      ];
      const k = kallor[0];
      return {
        text:
          `Ränteparitet är mekaniken som binder samman två länders räntor med deras valutors kurser — kapitalet söker avkastning, och skillnaden i ränta visar sig i valutamarknadens priser. Tre byggstenar:\n\n1. IDÉN — ett belopp kan placeras i kronor till svensk ränta eller i dollar till amerikansk ränta. För att båda alternativen skall ge samma förväntade utfall måste valutakursens förändring äta upp ränteskillnaden — annars flyttar kapitalet tills den gör det.\n2. TVÅ VARANTER — täckt ränteparitet (båda benen låses idag med terminer; aritmetik utan prognos) och otäck paritet (spotkursen förväntas röra sig; ett antagande, ingen garanti — namnet till trots). Räkneexempel: ränteskillnad 2 procentenheter ⇒ mekaniken pekar på att valutan med den höga räntan förväntas försvagas cirka 2 procent mot den andra — en gravitation, inte en lag.\n3. SAMBANDET MED REALRÄNTAN — inflationen skiljer nominell ränta från real; två länders REALräntor är den mer hållbara jämförelsen, och kursens långa svängar följer ofta realräntegapen snarare än det nominella.\n\nMekaniken förklarar varför räntenyheter rubbar valutor — vad du själv bör göra är aldrig frågan.` +
          kallradFler(kallor),
        amne: "ränteparitet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "Pariteten som del av kursens mekanik" },
          { text: "Kursen: Realräntan", lank: "/kurser/ma-03-realrantan", ikon: "⏳", beskrivning: "Nominell mot real — paritetens rätta mått" },
          { text: "Vad är köpkraftsparitet?", lank: "fragor:" + encodeURIComponent("vad är köpkraftsparitet?"), ikon: "🧺", beskrivning: "Syskonmekaniken — varukorgens gravitation" },
        ],
        motfraga: { text: "Vad är realräntan?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-07-valutakursens-mekanik" },
      };
    },
  },
  {
    id: "realvx",
    karnord: ["realväxelkurs", "realväxelkurser", "realväxelkursen"],
    starkord: ["valuta", "inflation", "kurs", "prisnivå", "justerad", "betyder"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, den reala kursen"),
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, vad en real kurs innebär för risken"),
      ];
      const k = kallor[0];
      return {
        text:
          `Realväxelkursen är den vanliga växelkursen justerad för skillnaden i prisnivå mellan två länder — kursen mätt i vad den faktiskt KÖPER, inte bara vad den byts till. Tre punkter:\n\n1. RÄKNINGEN — ta den nominella kursen och justera för inflationsskillnaden. Räkneexempel: sjunker kronans nominella kurs 5 procent mot euron samma år som Sveriges prisnivå stiger 2 procentenheter mer än euroområdets, har den REALA kursen bara fallit cirka 3 procent — köpkraften rörde sig mindre än kurvan visade.\n2. VARFÖR DEN SPELAR ROLL — konkurrenskraften avgörs realt: en exportör vars valuta faller 5 procent medan löner och priser hemma stiger lika mycket har inte vunnit någonting. Den nominella kursen är rubriken, den reala är verkligheten.\n3. SLÄKTSKAPET — Riksbankens vägda, inflationsjusterade kurs mot handelspartners (REER) är realväxelkursens korg-variant; det begreppet ägs av kursen om realekonomin och dess handelsfönster — här noteras bara släktskapet.\n\nAtt LÄSA reala kurser är makroekonomisk utbildning — att handla dem är inte vår fråga.` +
          kallradFler(kallor),
        amne: "realväxelkurs",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "Den reala kursens plats i mekaniken" },
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "🛡️", beskrivning: "Real mot nominell i riskmåttet" },
          { text: "Vad betyder stark krona?", lank: "fragor:" + encodeURIComponent("vad betyder stark krona?"), ikon: "🇸🇪", beskrivning: "Kronläsningens nästa steg" },
        ],
        motfraga: { text: "Vad betyder stark krona?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-07-valutakursens-mekanik" },
      };
    },
  },
  {
    id: "kronstyrka",
    karnord: [
      "stark krona", "svag krona", "kronan stärks", "kronan försvagas",
      "kronstyrka", "kronförsvagning", "kronuppskattning", "stark valuta",
      "svag valuta",
    ],
    starkord: ["kronan", "valuta", "betyder", "export", "import", "inverkan"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, kronstyrkans två sidor"),
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, kronrörelsers riskverkan"),
      ];
      const k = kallor[0];
      return {
        text:
          `Stark och svag krona är inte betyg — de är riktningar, och varje riktning har vinnare och förlorare på BÅDA sidorna av ekonomin:\n\n1. STARK KRONA — utlandets varor och resor blir billigare att köpa, men exportörernas produkter blir dyrare mätt i utländsk valuta. En exporterande tillverkare med pris i euro som ser kronan stärkas 10 procent får — allt annat lika — 10 procent mindre kronor per såld enhet, en direkt press på marginalen.\n2. SVAG KRONA — spegelbilden: exporten blir lättare att sälja och utlandskonkurrenter dyrare, medan importerade varor, råvaror och resor blir dyrare. Ett importberoende bolag bär samma mekanik i motsatt riktning.\n3. DRIVKRAFTERNA — kronans svängar styrs av samma mekanik som alla valutor: ränteskillnader, handelsbalans, inflation och riskaptit i världen (i oroliga tider söker kapital ofta till större valutor — då kan mindre valutor som kronan pressas, utan att något svenskt fundament förändrats).\n\nStyrka är alltså ett tvåsidigt mått — vad det betyder för ett BOLAG avgörs av var dess intäkter och kostnader bor. Det är läsning, inte råd.` +
          kallradFler(kallor),
        amne: "kronstyrka",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "Kronstyrkans mekanik från grunden" },
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "🛡️", beskrivning: "Kronrörelser som riskpost" },
          { text: "Vad är exportörens vind?", lank: "fragor:" + encodeURIComponent("hur påverkar valutan en exportör?"), ikon: "🌬️", beskrivning: "Företagssidan av samma vind" },
        ],
        motfraga: { text: "Hur påverkar valutan en exportör?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-07-valutakursens-mekanik" },
      };
    },
  },
  {
    id: "devalvering",
    karnord: ["devalvering", "devalveringar", "devalverad", "devalveringen", "revalvering"],
    starkord: ["kronan", "valuta", "fast kurs", "historia", "betyder", "Riksbanken"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, fasta kursers böjning"),
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, politisk valutarisk"),
      ];
      const k = kallor[0];
      return {
        text:
          `Devalvering är när ett land med FAST växelkurs medvetet sänker sin valutas värde mot ankaret — ett politiskt beslut, inte en marknadens rörelse. Tre saker att förstå:\n\n1. MEKANIKEN — en fast kurs är ett löfte att hålla valutan inom ett band. Ett devalveringsbeslut flyttar bandet nedåt i ett steg: säg 10 procent. Alla som håller valutan äger från det ögonblicket en tillgång värd 10 procent mindre mätt i ankaret.\n2. HISTORISK FÖRANKRING — Sverige devalverade upprepade gånger under 1970- och 80-talens fasta-kurs-period; den sista stora devalveringen 1982 (16 procent) följdes av beslutet att låta kronan flyta 1992, varvid marknaden — inte politiken — sätter kursen. Sedan dess är plötsliga svenska devalveringsbeslut historia, men mekaniken lever i alla länder som förvaltar fasta eller styrd kurser.\n3. RISKSIDAN — för en placerare är devalvering exempel på politisk valutarisk: risken att ett beslut, inte en marknad, förändrar värdet över en natt. Kursen om valutarisk äger den sidan.\n\nHistorielektionen är mekanikförståelse — aldrig en satsning på nästa beslut.` +
          kallradFler(kallor),
        amne: "devalvering",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "Fasta kursers historia och böjning" },
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "🛡️", beskrivning: "Politisk risk som riskpost" },
          { text: "Vad betyder stark krona?", lank: "fragor:" + encodeURIComponent("vad betyder stark krona?"), ikon: "🇸🇪", beskrivning: "Kronläsningens grunder" },
        ],
        motfraga: { text: "Vad betyder svag krona?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-07-valutakursens-mekanik" },
      };
    },
  },
  {
    id: "hedging",
    karnord: ["hedga", "hedging", "valutahedging", "säkra valutarisken", "valutasäkring", "kurs säkrad"],
    starkord: ["valuta", "risk", "valutarisk", "kostnad", "fungerar", "bolag"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, säkring av valutarisk"),
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, vad säkring gör med mekaniken"),
      ];
      const k = kallor[0];
      return {
        text:
          `Att hedga valutarisk är att medvetet ta bort — eller minska — valutarörelsens inflytande över ett värde man redan äger eller väntar: en mekanik för förutsägbarhet, inte för vinst. Tre byggstenar:\n\n1. IDÉN — ett svenskt bolag ska ha 1 miljon dollar om sex månader. Kursen kan röra sig åt båda hållen. Genom att idag binda framtida kronbelopp med en termin eller liknande konstruktion låses beloppet: vad kronan än gör däremellan är summan bestämd. Priset för vissheten är att båda riktningarna försvinner — stiger dollarn efteråt står säkringen som förlust mot en vinst i underlaget.\n2. KOSTNADEN — säkring kostar; terminens pris avspeglar ränteskillnaden mellan valutorna (räntepariteten igen — mekanikerna hör ihop). En säkring är alltså aritmetik plus en avgift, inte ett gratis skydd.\n3. VAD DET INTE ÄR — hedging är inte en kursprognos och inte en satsning; det är beslutet att inte vilja spekulera alls. Vem som BÖR säkra, hur mycket och när, är en placérings- och företagsfråga vi aldrig besvarar — här får du mekaniken, och valutarisk-kursen ger djupet.\n\nFörutsägbarhet har ett pris — det är hela redskapet.` +
          kallradFler(kallor),
        amne: "hedging",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "🛡️", beskrivning: "Säkringens hela hantverk" },
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "Pariteten bakom säkringspriset" },
          { text: "Vad är ränteparitet?", lank: "fragor:" + encodeURIComponent("vad är ränteparitet?"), ikon: "⚖️", beskrivning: "Varför terminen kostar som den gör" },
        ],
        motfraga: { text: "Vad är valutarisk?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-07-valutarisk" },
      };
    },
  },
  {
    id: "exportor",
    karnord: ["exportörens", "exportörer", "exportvinster", "valutavinden", "exportvinden"],
    starkord: ["valuta", "kronan", "marginal", "intäkter", "bolag", "påverkar"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, exportörens vind"),
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, valutaexponeringens ursprung"),
      ];
      const k = kallor[0];
      return {
        text:
          `Exportörens vind är valutakursens dubbla verkning på ett bolag som säljer utomlands — kursen blåser i både seglen och skrovet samtidigt:\n\n1. INTÄKTSSIDAN — en svensk exportör som fakturerar i euro får fler kronor per euro när kronan försvagas. Räkneexempel: en order på 1 miljon euro vid kursen 10,00 kronor blir 10,0 miljoner kronor; sjunker kronan till 10,50 blir samma order 10,5 miljoner — en marginalvind på 5 procent utan att en enda enhet sålts mer.\n2. KOSTNADSSIDAN — samma vind blåser baklänges på importen: komponenter, råvaror och energi som betalas i utländsk valuta blir dyrare i kronor. Ett bolag med utländska kostnader och svenska intäkter upplever spegelbilden. Den NETTO-effekten avgörs av var intäkter och kostnader bor — det är bolagets valutasalens struktur som avgör hur hårt det blåser.\n3. TRÖGHETEN — valutaskillnader slår igenom i resultaten med eftersläpning: kontrakt, priser och lager skyddar eller fördröjer verkningen ett par kvartal. Därför kan en kvartalsrapport bära valutavinden från en kursrörelse som skedde halvåret före.\n\nKategorin makroekonomi & ränta (${maAntal(reg)} kurser) och riskhanteringen (${rkAntal(reg)} kurser) delar på djupet — läsning, aldrig råd om vilka bolag som vindgynnas.` +
          kallradFler(kallor),
        amne: "exportör",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "Vindens två sidor i detalj" },
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "🛡️", beskrivning: "Exponeringens ursprung och mått" },
          { text: "Vad betyder stark krona?", lank: "fragor:" + encodeURIComponent("vad betyder stark krona?"), ikon: "🇸🇪", beskrivning: "Vindens riktning, förklarad" },
        ],
        motfraga: { text: "Vad är valutahedging?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-07-valutakursens-mekanik" },
      };
    },
  },
  {
    id: "reservvaluta",
    karnord: ["reservvaluta", "flyktvaluta", "safe haven", "trygg hamn"],
    starkord: ["dollar", "valuta", "kris", "centralbank", "betyder", "roll"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, valutahierarkin"),
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, flyktens riskmönster"),
      ];
      const k = kallor[0];
      return {
        text:
          `Reservvaluta är den valuta som världens centralbanker och stora placerare håller som buffert och skyddsnät — en roll som ger valutan egenskaper ingen enskild marknad kan ge den:\n\n1. ROLLEN — dollarn har sedan Bretton Woods-epoken varit världens dominerande reservvaluta: handeln med olja och många råvaror faktureras i den, centralbankernas krigskassor ligger till stor del i den, och lån i dollar ges över hela världen. Euro och yen bär roller i skala därunder.\n2. MEKANISKEN "FLYKT TILL KVALITET" — när världen blir orolig söker kapital ofta mot reservvalutan (och statspapper i den): den som säljer tillgångar i små valutor behöver ofta köpa dollar för att reglera — vilket kan pressa mindre valutor (som kronan) nedåt i exakt de stunder då ingen inhemsk grundändring skett. Rubrikernas "krongan trycks av oroligheter" är denna mekanik, inte ett svenskt bud.\n3. KONSEKVENSEN FÖR LÄSNING — valutornas rörelser under kriser bär INFORMATION om varifrån risken kommer och vart kapitalet flyr — en läsbar karta, inget att handla på.\n\nHierarkin är struktur — vad någon ÄGER i valutor är alltid deras eget beslut.` +
          kallradFler(kallor),
        amne: "reservvaluta",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "Valutahierarkin och dess rötter" },
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "🛡️", beskrivning: "Flyktens mönster som risk" },
          { text: "Hur fungerar valutamarknaden?", lank: "fragor:" + encodeURIComponent("hur fungerar valutamarknaden?"), ikon: "🌐", beskrivning: "Marknaden bakom rollerna" },
        ],
        motfraga: { text: "Hur fungerar valutamarknaden?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-07-valutakursens-mekanik" },
      };
    },
  },
  {
    id: "valutamarknad",
    karnord: ["valutamarknaden", "valutamarknad", "valuthandeln", "valutahandel"],
    starkord: ["fungerar", "valuta", "största", "par", "handlas", "bank"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, marknadens byggnad"),
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, marknadens sidor"),
      ];
      const k = kallor[0];
      return {
        text:
          `Valutamarknaden är världens största marknad — en decentraliserad, bankdriven plats utan en enda börs, där världens valutor byts dygnet runt. Tre kännetecken:\n\n1. BYGGNADEN — handeln går mellan storbanker (interbank-marknaden), centralbanker, företag och fonder — via nätverk, inte genom en orderbok som en börs. Det gör marknaden djup men också OPAK: kurserna citeras i alla riktningar samtidigt, och "marknadens pris" är ett samsynspris mellan handelsbanker snarare än en enda matchning.\n2. VALUTAPARET — valutor handlas alltid i par: euron mot dollarn, kronan mot euron. En kurs är alltså aldrig en egenskap hos EN valuta utan ett RELATIONStal mellan två — kronan kan stärkas mot dollarn samma dag den försvagas mot euron, om de två rör sig olika mot kronan.\n3. VOLYMEN OCH RÖRELSEN — dagliga omsättningar i storleksordningen biljoner dollar gör marknaden flytande, men kurserna svänger ändå kraftigt på räntebeslut, inflationstal och riskstämning — drivkrafterna som paritetsmekanikerna beskriver.\n\nMarknadens byggnad är utbildning — att handla på den är alltid läsarens eget val.` +
          kallradFler(kallor),
        amne: "valutamarknad",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "Marknaden och dess mekanik" },
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "🛡️", beskrivning: "Marknadens risk-sida" },
          { text: "Vad är ett valutapar?", lank: "fragor:" + encodeURIComponent("vad är köpkraftsparitet?"), ikon: "💱", beskrivning: "Par-begreppets andra sida" },
        ],
        motfraga: { text: "Vad är köpkraftsparitet?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-07-valutakursens-mekanik" },
      };
    },
  },
  {
    id: "valutalan",
    karnord: ["valutalån", "valutalånet", "låna i utländsk valuta", "lån i dollar", "lån i euro", "lån i schweiziska franc"],
    starkord: ["låna", "lån", "ränta", "valuta", "risk", "kostnad"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, valutalånets mekanik"),
        kursKalla(reg, "ma-07-valutakursens-mekanik", "Läroplanen — makroekonomi & ränta, ränteskillnadens lockelse"),
      ];
      const k = kallor[0];
      return {
        text:
          `Valutalån är ett lån i annan valuta än ens egna — lockelsen är ränteskillnaden, mekaniken är att skulden följer kursen. Tre delar:\n\n1. LOCKELSEN — om en utländsk ränta ligger lägre än den egna ser lånet billigare ut. Men räntepariteten (kursens mekanik) varnar redan här: den lägre räntan avspeglar ofta förväntad försvagning av den valutan — skillnaden är inte ett gratis överskott, utan ett pris på en förväntan.\n2. MEKANIKEN — skulden är denominerad i utländsk valuta. Räkneexempel: ett lån på 100 000 dollar vid kursen 10,00 kostar 1,0 miljon kronor att reglera; stärks kronan till 9,00 kostar samma skuld 0,9 miljoner — men försvagas den till 11,00 blir priset 1,1 miljoner. Lånet är alltså en stor, låst position i en valuta — med eller utan avsikt.\n3. LÄRAN — när schweiziska francen plötsligt losskopplades från euron i januari 2015 steg francen på minuter med knappa 20 procent mot euron — och hushåll med franc-lån såg sina skulder göra samma rörelse över en natt. Det är valutalånets kärna: räntevinsten är begränsad, kursrisken är inte.\n\nMekaniken är utbildning; om någon BÖR låna i vilken valuta är en rådgivningsfråga vi aldrig närmar oss.` +
          kallradFler(kallor),
        amne: "valutalån",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "🛡️", beskrivning: "Valutalånets riskmekanik" },
          { text: "Kursen: Valutakursens mekanik", lank: "/kurser/ma-07-valutakursens-mekanik", ikon: "💱", beskrivning: "Ränteskillnadens bakgrund" },
          { text: "Vad är ränteparitet?", lank: "fragor:" + encodeURIComponent("vad är ränteparitet?"), ikon: "⚖️", beskrivning: "Varför den lägre räntan inte är gratis" },
        ],
        motfraga: { text: "Vad är ränteparitet?", kategori: "makroekonomi" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-07-valutarisk" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tio valutamekanik-mönstren — eller null
 * (då prövar widgeten nästa lager i kedjan). Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltValutamekanik(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of VALUTAMEKANIK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
