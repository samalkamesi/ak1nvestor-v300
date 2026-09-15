/**
 * AI-MENTORN 2.0 — SVARMOTOR (våg 106 H2, beslut D3).
 *
 * Regelbaserad motor som svarar på nybörjarfrågor UTAN API-kostnad: ~15
 * förhandsfrågor + generiskt V01–V20-uppslag, allt källmärkt ur kursregistret
 * (ai-mentor-register.ts). chat-widget.tsx frågar motorn FÖRE nätanropet —
 * matchar den svarar vi lokalt (0 kr), annars faller vi tillbaka på
 * /api/chatbot precis som förr.
 *
 * Spår 6 (våg 158, fabrik auto-s6): u2 lade rapportläsning + nyckeltal/P-E
 * (b63bf978) och u1 la utdelning, lärväg, beteende och skatt sist i MONSTER —
 * alla svar kan bära FLERA källor (LokaltSvar.kallor + numrerad Källor-rad
 * via kallradFler). u3:s extra-lager (ec7331f4) prövas FÖRE motorn i widgeten.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ─────────────────────────────────────────
 * All formulering är PEDAGOGISK utbildning. Motorn innehåller aldrig och kan
 * aldrig producera investeringsråd ("köp", "sälj", "detta är värt att äga") —
 * frågan "ger ni råd?" besvaras med ett ärligt nej + laghänvisning.
 *
 * ── DETERMINISM (våg 106 H2) ────────────────────────────────────────────────
 * Inga slumpval, inga tidsberoenden, ingen miljöberoende sortering (kodpunkts-
 * ordning). Samma fråga ⇒ bitidentiskt svar, i webbläsaren som i testet.
 *
 * ── DEPENDENCY-INJECTION (våg 106 H2) ───────────────────────────────────────
 * Registret skickas IN som parameter (ingen värdeimport av registermodulen —
 * endast `import type` — så att verktyg/testa-ai-mentor.mjs kan köra denna
 * fil direkt i Node utan bundlar).
 */

import type { RegisterRad } from "./ai-mentor-register";

// ── Typer (speglar widgetens Meddelande-form) ───────────────────────────────

export type LokalHandling = { text: string; lank: string; ikon: string; beskrivning?: string };
export type LokalMotfraga = { text: string; kategori: string };
export type LokalKalla = { slug?: string; titel: string; lagrow: string };

export type LokaltSvar = {
  text: string;
  /** Ämnes-id — sätts som senasteAmne i widgeten (förstås av /api/chatbot). */
  amne: string;
  /** Källmärke: kursslug och/eller läge i läroplanen — på varje svar. */
  kalla: LokalKalla;
  /** Spår 6 (våg 158): samtliga källor, primärkällan först — flerkällskällmärkning. */
  kallor?: LokalKalla[];
  handlings: LokalHandling[];
  motfraga: LokalMotfraga;
  fordjupa: { text: string; lank: string };
};

// ── Normalisering ───────────────────────────────────────────────────────────

/**
 * Normalisera till jämförbart plan: gemener, skiljetecken → mellanslag,
 * kollapsade mellanrum. Åäö BEVARAS (de är bokstäver, \p{L}) — det svenska
 * alfabetet ska inte söndras av normaliseringen (våg 106 H2).
 */
function normalisera(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

/**
 * Diakritikafritt plan (å→a, ä→a, ö→o, é→e …) för felstavningstolerans:
 * "impulsvag" och "impulsvåg" ska jämföras som samma ord. NFD-sönderdelning
 * + strippning av kombinerande tecken (\p{M}) — standard, ingen miljöosa.
 */
export function diafri(s: string): string {
  return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}

/**
 * Klassiskt redigeringstavstånd (Levenshtein) — iterativ tvåraders-DP,
 * deterministisk. Används som "enkel likhetspoäng": ett felstavat ord ska
 * fortfarande träffa sitt nyckelord.
 */
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

/** Träffar nyckelordet frågans ord? (våg 106 H2: redigeringstavstånd tillåtet) */
export function traff(fragaOrd: string[], fragaStr: string, nyckelord: string): boolean {
  const nk = diafri(nyckelord);
  if (!nk) return false;
  if (nk.includes(" ")) return fragaStr.includes(nk); // flerordsfras
  if (nk.length <= 3) return fragaOrd.includes(nk); // korta ord: exakt (annars träffar "ps" i "tips")
  const max = nk.length <= 7 ? 1 : 2; // längre ord tål 1–2 fel
  return fragaOrd.some((o) => redigeringstavstand(o, nk) <= max);
}

// ── Närmaste kurser (fallback + boktips) ────────────────────────────────────

/** Vanliga svenska frågeord som aldrig ska rangordna kurser. */
const STOPPORD = new Set([
  "vad", "är", "en", "ett", "och", "hur", "jag", "det", "den", "de", "dem",
  "ska", "skall", "till", "med", "for", "fran", "om", "pa", "av", "i", "vi",
  "ni", "man", "kan", "vill", "har", "mitt", "min", "din", "dig", "mig",
  "börjar", "borjar", "lära", "lara", "mig", "snälla", "snalla", "tack",
  "fungerar", "betyder", "förklara", "forklara", "explain", "please",
]);

/**
 * De n kurser som ligger närmast frågans ord — deterministisk poäng:
 * ordöverlapp mot titel+kategori+slug (redigeringstavstånd tillåtet), ties
 * bryts på slug (kodpunktsordning). Ur kursregistret, aldrig gissat.
 */
export function narmasteKurser(fraga: string, register: RegisterRad[], n = 3): RegisterRad[] {
  const alla = diafri(fraga).split(" ").filter((o) => o.length >= 3 && !STOPPORD.has(o));
  if (alla.length === 0) return register.slice(0, n); // tom fråga → registrets börn
  const poang = register.map((r) => {
    const indexOrd = diafri(`${r.titel} ${r.kategori} ${r.slug.replace(/-/g, " ")}`).split(" ");
    let p = 0;
    for (const f of alla) {
      for (const k of indexOrd) {
        if (k.length < 3) continue;
        const max = k.length <= 7 ? 1 : 2;
        if (f === k) p += 2;
        else if (redigeringstavstand(f, k) <= max) p += 1;
      }
    }
    return { r, p };
  });
  return poang
    .sort((a, b) => b.p - a.p || (a.r.slug < b.r.slug ? -1 : a.r.slug > b.r.slug ? 1 : 0))
    .slice(0, n)
    .map((x) => x.r);
}

// ── Hjälpbyggare ────────────────────────────────────────────────────────────

/** Källrad som avslutar varje svar — KÄLLMÄRKT (våg 106 H2-krav). */
export function kallrad(k: LokalKalla): string {
  return `\n\n📖 Källa: ${k.titel}${k.slug ? ` (${k.slug})` : ""} — ${k.lagrow}.`;
}

export function kursKalla(register: RegisterRad[], slug: string, lagrow: string): LokalKalla {
  const r = register.find((x) => x.slug === slug);
  return r
    ? { slug: r.slug, titel: r.titel, lagrow }
    : { titel: "Läroplanen", lagrow };
}

/**
 * Flerkällskällmärke (spår 6, våg 158): en källa ⇒ kallrad-format, flera ⇒
 * numrerad Källor-lista. Skrivs in i svarets text — widgeten behöver ingen
 * ändring för att visa den.
 */
function kallradFler(kallor: LokalKalla[]): string {
  if (kallor.length === 0) return "";
  if (kallor.length === 1) return kallrad(kallor[0]);
  const rader = kallor
    .map((k, i) => `${i + 1}. ${k.titel}${k.slug ? ` (${k.slug})` : ""} — ${k.lagrow}`)
    .join("\n");
  return `\n\n📖 Källor (${kallor.length}):\n${rader}`;
}

// ── De 15 förhandsfrågorna ──────────────────────────────────────────────────

export type FragMonster = {
  id: string;
  /** Kärnord: minst EN träff krävs för att mönstret ska vara kandidat. */
  karnord: string[];
  /** Stärkande ord: ger extra poäng men krävs inte. */
  starkord?: string[];
  bygga: (register: RegisterRad[]) => LokaltSvar;
};

// Exporterad sedan s6-u3 omgång 3: regressionstesternas fall K läser
// kärnorden LIVE ur modulen (verktyg/testa-ai-mentor-nasta.mjs) så att
// kärnordsdisjunktionen bevisas mot basen också — inte bara mot syskonlagren.
export const MONSTER: FragMonster[] = [
  {
    id: "akm1",
    karnord: ["akm1", "akm 1", "20 variabler", "tjugo variabler", "fundamental modell", "kontroversiella modellen"],
    starkord: ["variabler", "modell", "analysmodell"],
    bygga: (reg) => {
      const k = kursKalla(reg, "akm1-den-kontroversiella-modellen", "Läroplanen — AKM1, V01–V20");
      return {
        text:
          "AKM1 är vårt sätt att värdera ett bolag med tjugo mätbara variabler — V01 till V20. De täcker åtta dimensioner: tillväxt, värdering, lönsamhet, stabilitet, moat, katalysator, risk och kapitalstruktur. Ingen variabel är en rekommendation — det är ett pedagogiskt verktyg som lär dig dela upp ett bolag i delar och rösta först när du förstår helheten.\n\nVarje variabel har en egen kurs (V01–V20 i läroplansspåret), och du kan pröva modellen på ett riktigt bolag i kalkylatorn." +
          kallrad(k),
        amne: "akm1",
        kalla: k,
        handlings: [
          { text: "Läs superdjupet om AKM1", lank: "/kurser/akm1-den-kontroversiella-modellen", ikon: "🏛️", beskrivning: "20 kapitel om hela modellen" },
          { text: "Räkna på ett bolag (20 variabler)", lank: "/kalkylator", ikon: "🧮", beskrivning: "Pröva AKM1 i praktiken" },
          { text: "Vad är V09?", lank: "fragor:" + encodeURIComponent("vad är V09?"), ikon: "📊", beskrivning: "Möt en enskild variabel" },
        ],
        motfraga: { text: "Vad är AK1TS?", kategori: "ekosystem" },
        fordjupa: { text: k.titel, lank: "/kurser/akm1-den-kontroversiella-modellen" },
      };
    },
  },
  {
    id: "borja",
    karnord: ["börjar", "borja", "börja", "kom igång", "komma igång", "helt ny", "nybörjare", "nyborjare", "första kursen", "första steget", "var ska jag börja", "lära mig aktieanalys", "lara mig aktieanalys", "starta"],
    starkord: ["aktieanalys", "aktier", "utbildning", "lära"],
    bygga: (reg) => {
      const k = kursKalla(reg, "v01-forsaljningstillvaxt", "Läroplanen — Fas 1, steget du står på nu");
      return {
        text:
          "Välkommen — du börjar precis rätt: med grunden. Läroplanen är byggd som ett spår i fem nivåer, och steget ett är variabelkurserna V01–V20 (grundbiblioteket, gratis för alltid). V01 Försäljningstillväxt är den naturliga starten: kort, konkret och den lär dig det första frågetecknet varje analys börjar med — växer bolaget?\n\nEtt tips från mentorn: läs ett kapitel, gör quiz:et (+10 XP per rätt svar) och gå vidare i spåret. Ingen stress — spåret finns kvar imorgon också." +
          kallrad(k),
        amne: "borja",
        kalla: k,
        handlings: [
          { text: "Börja: kursen V01", lank: "/kurser/v01-forsaljningstillvaxt", ikon: "🌱", beskrivning: "Din första kurs — nybörjarnivå" },
          { text: "Se hela läroplanen", lank: "/laroplan", ikon: "🗺️", beskrivning: "Fem nivåer till självständighet" },
          { text: "Testa din profil först", lank: "/profil", ikon: "🧠", beskrivning: "3-minuters test — hur lär du dig bäst?" },
        ],
        motfraga: { text: "Vad kostar det?", kategori: "orientering" },
        fordjupa: { text: k.titel, lank: "/kurser/v01-forsaljningstillvaxt" },
      };
    },
  },
  {
    id: "impulsvag",
    karnord: ["impulsvåg", "impulsvag", "impuls våg", "impuls", "5-vågs", "fem vågor", "elliot"],
    starkord: ["våg", "vag", "korrigering", "elliott", "våglära", "vaglara"],
    bygga: (reg) => {
      const k = kursKalla(reg, "ts-01-elliott-wave", "Läroplanen — AK1TS våglära, impuls kurs 1");
      return {
        text:
          "En impulsvåg ▲ är marknadens sätt att röra sig i huvudriktningen: fem vågor där våg 1, 3 och 5 driver priset framåt och våg 2 och 4 pullar tillbaka. Efter en komplett impuls kommer en korrektion ▼ (drippande tre-vågsrörelse) innan något nytt kan byggas. I vågfundamentet läser vi AKM1-variablerna som tidsserier — impulser i värderingsvariabler är det intressantaste en värdeinvesterare kan se: det är där värde möter vågor (konfluens).\n\nVill du se vågorna i praktiken börjar du med Elliott-kursen — den är avancerad, så ta V01–V20 först om du är helt ny." +
          kallrad(k),
        amne: "impulsvåg",
        kalla: k,
        handlings: [
          { text: "Kursen: Elliott Wave — 5-vågs impuls", lank: "/kurser/ts-01-elliott-wave", ikon: "🌊", beskrivning: "Impulsvågens anatomi" },
          { text: "Vågfundamentet (20×5-matrisen)", lank: "/vagfundament", ikon: "📊", beskrivning: "Variablerna som tidsserier" },
          { text: "Vad är vågfundamentet?", lank: "fragor:" + encodeURIComponent("vad är vågfundamentet?"), ikon: "🗺️", beskrivning: "Helheten först" },
        ],
        motfraga: { text: "Vad är en korrektion?", kategori: "våglära" },
        fordjupa: { text: k.titel, lank: "/kurser/ts-01-elliott-wave" },
      };
    },
  },
  {
    id: "kostnad",
    karnord: ["vad kostar", "kostar det", "kostar", "pris", "priser", "prisad", "gratis", "betala", "betalning", "dyrt", "billigt", "avgift", "medlemskap", "abonnemang", "prenumeration", "hur mycket kostar"],
    starkord: ["fas", "faser", "kort", "kortet"],
    bygga: (reg) => {
      const k = kursKalla(reg, "v01-forsaljningstillvaxt", "Läroplanen — Fas 1 är gratis, för alltid");
      return {
        text:
          "Kortversionen: Fas 1 — hela grundbiblioteket med läroplanen, V01–V20, bokkanonens grundnivåer, quiz, XP och certifikat — är GRATIS, för alltid. Du betalar alltså ingenting för att börja lära dig aktieanalys på allvar.\n\nFas 2 och Fas 3 är frivilliga fördjupningar (engångspris — exakta belopp står på medlemskapssidan så att du alltid ser aktuell information där). Ingen dold prenumerationsfälla i Fas 1." +
          kallrad(k),
        amne: "kostnad",
        kalla: k,
        handlings: [
          { text: "Se hela medlemskapet", lank: "/medlemskap", ikon: "💛", beskrivning: "Fas 1 gratis · Fas 2 · Fas 3" },
          { text: "Börja gratis nu: V01", lank: "/kurser/v01-forsaljningstillvaxt", ikon: "🌱", beskrivning: "Första kursen kostar inget" },
          { text: "Skapa gratis konto (20 sek)", lank: "/logga-in", ikon: "🔑", beskrivning: "Lås upp XP och certifikat" },
        ],
        motfraga: { text: "Vad är skillnaden mellan faserna?", kategori: "medlemskap" },
        fordjupa: { text: "Medlemskapet", lank: "/medlemskap" },
      };
    },
  },
  {
    id: "rad",
    karnord: ["ger ni råd", "investeringsråd", "rådgivning", "råd", "ska jag köpa", "köpa", "kopa", "sälja", "sälja aktier", "köptips", "aktietips", "tipsa", "rekommendera", "vilken aktie", "var ska jag lägga"],
    starkord: ["aktie", "aktier", "portfölj", "portfolio"],
    bygga: (reg) => {
      const k = kursKalla(reg, "akm1-den-kontroversiella-modellen", "Läroplanen — vi utbildar, vi rådgiver inte");
      return {
        text:
          "Nej — och det är ett medvetet beslut, inte en brist. Enligt lagen (2007:528) om värdepappersmarknaden krävs tillstånd för att lämna personliga investeringsråd, och det har AK1A inte och vill inte ha. Vi är en utbildning, inte en rådgivare.\n\nVad vi INTE gör: säger åt dig att köpa eller sälja en viss aktie. Vad vi GÖR: lär dig analysera själv — tjugo variabler, våglära, riskhantering — så att dina beslut blir dina egna, genomtänkta och förstådda. Det är hela idén med läroplanen." +
          kallrad(k),
        amne: "råd",
        kalla: k,
        handlings: [
          { text: "Lär dig analysera själv (AKM1)", lank: "/kurser/akm1-den-kontroversiella-modellen", ikon: "🏛️", beskrivning: "Istället för råd: metoden" },
          { text: "Räkna på ett bolag", lank: "/kalkylator", ikon: "🧮", beskrivning: "Dina egna siffror, dina egna slutsatser" },
          { text: "Se läroplanen", lank: "/laroplan", ikon: "🗺️", beskrivning: "Vägen till oberoende analys" },
        ],
        motfraga: { text: "Hur börjar jag lära mig?", kategori: "utbildning" },
        fordjupa: { text: k.titel, lank: "/kurser/akm1-den-kontroversiella-modellen" },
      };
    },
  },
  {
    id: "teknisk",
    karnord: ["teknisk analys", "tekniska analyser", "candlestick", "rsi", "macd", "bollinger", "trendlinje", "trendlinjer", "moving average", "glidande medel", "chart", "graf", "grafer", "diagram", "stöd och motstånd"],
    starkord: ["indikator", "indikatorer", "mönster", "monster", "trading"],
    bygga: (reg) => {
      const k = kursKalla(reg, "ts-10-ak1ts-25cellers-matris", "Läroplanen — AK1TS, teknisk analys i 25 celler");
      return {
        text:
          "Teknisk analys är läran om pris och volym i tid — att läsa vad marknaden gör i stället för att gissa vad den kommer göra. Hos oss lever den i AK1TS: ett system där 25 tekniker (trend, momentum, volym, Fibonacci, mönster…) ordnas i en 25-cellers matris över fem tidshorisonter.\n\nViktigaste nybörjarregeln: teknisk analys ALDRIG står ensam — den möter fundamental värdering i konfluens. Priset visar WHEN, värderingen visar WHY.\n\nGrundkurserna: stöd/motstånd och trendlinjer (nybörjarnivå), candlestick-mönster och moving averages. Standardverket på svenska är Torssell-boken i BOKMASTER." +
          kallrad(k),
        amne: "teknisk analys",
        kalla: k,
        handlings: [
          { text: "Kursen: 25-cellers matrisen", lank: "/kurser/ts-10-ak1ts-25cellers-matris", ikon: "🔢", beskrivning: "AK1TS-kärnan" },
          { text: "Börja enkelt: stöd och motstånd", lank: "/kurser/ts-16-stod-och-motstand", ikon: "📏", beskrivning: "Nybörjarnivå" },
          { text: "Torssell — svenska standardverket", lank: "/kurser/teknisk-analys-med-johnny-torssell", ikon: "📚", beskrivning: "BOKMASTER, kapitel för kapitel" },
        ],
        motfraga: { text: "Vad är konfluens?", kategori: "ekosystem" },
        fordjupa: { text: k.titel, lank: "/kurser/ts-10-ak1ts-25cellers-matris" },
      };
    },
  },
  {
    id: "risk",
    karnord: ["risk", "risken", "risker", "riskhantering", "förlust", "forlust", "förluster", "stop loss", "volatilitet", "drawdown", "kelly", "position sizing", "skydda"],
    starkord: ["hantera", "minska", "kontroll", "exponering"],
    bygga: (reg) => {
      const k = kursKalla(reg, "pf-02-position-sizing", "Läroplanen — portföljhantering, risken börjar med storleken");
      return {
        text:
          "Riskhantering börjar INTE med att hitta farliga bolag — den börjar med hur stor varje platsning får vara. Tre nybörjargrundpelare:\n\n1. Position sizing — ingen enskild aktie ska kunna skada dig ordentligt (portföljbyggaren varnar vid 40 % koncentration).\n2. Diversifiering — över sektorer och riskkällor (men inte så mycket att du slutar förstå vad du äger).\n3. Koncentration till bolag som bränner kapital — V19 kapitalförbränning är den farligaste variabeln i AKM1.\n\nVill du gå på djupet: Kelly-kriteriet och stress-testing (avancerat) — börja med de två nybörjarkurserna nedan." +
          kallrad(k),
        amne: "risk",
        kalla: k,
        handlings: [
          { text: "Kursen: Position sizing", lank: "/kurser/pf-02-position-sizing", ikon: "⚖️", beskrivning: "Nybörjarnivå — storleken först" },
          { text: "Kursen: Koncentrationsrisk", lank: "/kurser/rk-09-koncentrationsrisk", ikon: "🎯", beskrivning: "Nybörjarnivå — ägg och korgar" },
          { text: "V19: kapitalförbränning", lank: "fragor:" + encodeURIComponent("vad är V19?"), ikon: "🔥", beskrivning: "Den farligaste variabeln" },
        ],
        motfraga: { text: "Hur bygger jag en portfölj?", kategori: "portfölj" },
        fordjupa: { text: k.titel, lank: "/kurser/pf-02-position-sizing" },
      };
    },
  },
  {
    id: "portfolj",
    karnord: ["portfölj", "portföljen", "portfolj", "bygga portfölj", "portföljbyggande", "investeringssparkonto", "aktieportfölj", "sprida", "riskspridning", "rebalansera"],
    starkord: ["bygga", "starta", "månadsspara", "sparande"],
    bygga: (reg) => {
      const k = kursKalla(reg, "pf-01-portfoljbyggande", "Läroplanen — portföljhantering, kurs 1");
      return {
        text:
          "En portfölj byggs rad för rad — och den viktigaste regeln står FÖRE den första aktien: bestämma hur många bolag du orkar följa (5–15 är en vanlig pedagogisk ram) och hur stor varje platsning maximalt får vara. Sedan: sektorspridning, rebalansering och en plan för kriser — innan krisen kommer.\n\nPå sajten finns portföljbyggaren (fem dimensioner per rad, 40 %-varning vid koncentration) och kursen om 5×5×4-ekosystemet som binder ihop aktie → portfölj → helhet." +
          kallrad(k),
        amne: "portfölj",
        kalla: k,
        handlings: [
          { text: "Kursen: Portfölj-byggande", lank: "/kurser/pf-01-portfoljbyggande", ikon: "🏗️", beskrivning: "Nybörjarnivå — grunderna" },
          { text: "Ekosystem-kursen 5×5×4", lank: "/kurser/portfolj-ekosystemet", ikon: "📊", beskrivning: "Från aktie till portfölj" },
          { text: "Prova portföljbyggaren", lank: "/portfoljbyggare", ikon: "🧱", beskrivning: "Bygg rad för rad" },
        ],
        motfraga: { text: "Hur hanterar jag risk?", kategori: "risk" },
        fordjupa: { text: k.titel, lank: "/kurser/pf-01-portfoljbyggande" },
      };
    },
  },
  {
    id: "bocker",
    karnord: ["böcker", "bocker", "bok", "läsa", "lasa", "lästips", "läslistan", "biblioteket", "boktips", "bokkanon", "intelligent investor", "graham"],
    starkord: ["läsa", "rekommendera", "bäst", "basta", "klassiker"],
    bygga: (reg) => {
      const bokmaster = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const k = kursKalla(reg, "the-intelligent-investor", `Läroplanen — BOKMASTER (${bokmaster} böcker kapitel för kapitel)`);
      return {
        text:
          `Bokmaster-biblioteket har ${bokmaster} investeringsklassiker som KURSER — varje kapitel blir en lektion med quiz. Tre flaggskepp att börja i:\n\n1. The Intelligent Investor (Graham) — value-investingens grundlag; kapitel 8 och 20 är den mest citerade visdomen i branschen.\n2. Tänka snabbt och långsamt (Kahneman) — varför dina egna hjärnspöken är din största risk.\n3. The Psychology of Money (Housel) — mjuka sanningar om beteende som håller i decennier.\n\nVill du ha den tekniska vägen är Torssells svenska standardverk komplett i biblioteket.` +
          kallrad(k),
        amne: "böcker",
        kalla: k,
        handlings: [
          { text: "The Intelligent Investor", lank: "/kurser/the-intelligent-investor", ikon: "🏛️", beskrivning: "Börja här — gratis i Fas 1" },
          { text: "Hela bokmaster-biblioteket", lank: "/kurser", ikon: "📚", beskrivning: `${bokmaster} böcker som kurser` },
          { text: "Bokkanonen (läsordning)", lank: "/bibliotek", ikon: "📖", beskrivning: "Guidad väg genom klassikerna" },
        ],
        motfraga: { text: "Vilken bok ska jag börja med?", kategori: "läsning" },
        fordjupa: { text: k.titel, lank: "/kurser/the-intelligent-investor" },
      };
    },
  },
  {
    id: "quiz-xp",
    karnord: ["quiz", "xp", "poäng", "poang", "nivå", "niva", "level", "streak", "certifikat", "flashcard", "flashcards", "repetera", "spaced repetition"],
    starkord: ["tjäna", "tjana", "få", "fa", "hur fungerar", "belöning"],
    bygga: (reg) => {
      const quizTotalt = reg.reduce((s, r) => s + r.quiz, 0);
      const k = kursKalla(reg, "v01-forsaljningstillvaxt", "Läroplanen — quiz och XP lever i kurserna");
      return {
        text:
          `Så fungerar belöningssystemet:\n\n🧠 Quiz — varje kapitel avslutas med ett quiz: +10 XP per rätt svar.\n🃏 Flashcards — spaced repetition (glömskekurvan bestämmer när kortet kommer igen): +5 XP per bra svar.\n⭐ Nivåer — XP lyfter din nivå, och nivå + kurser + XP styr betyget (A–D) på ditt certifikat.\n🔥 Streak — dagens pass räcker för att hålla kedjan levande.\n\nTotalt ${quizTotalt} quizfrågor väntar i ${reg.length} kurser — och allt sparas lokalt när du är inloggad (gratis konto räcker).` +
          kallrad(k),
        amne: "quiz-xp",
        kalla: k,
        handlings: [
          { text: "Testa dig: första quiz:et", lank: "/kurser/v01-forsaljningstillvaxt", ikon: "🧠", beskrivning: "+10 XP per rätt svar" },
          { text: "Repetera flashcards nu", lank: "#", ikon: "🃏", beskrivning: "Startar i chatten" },
          { text: "Se ditt certifikat", lank: "/certifikat", ikon: "🎓", beskrivning: "Betyg A–D, delbart" },
        ],
        motfraga: { text: "Vad är Fas 1, 2 och 3?", kategori: "medlemskap" },
        fordjupa: { text: "Läroplanen", lank: "/laroplan" },
      };
    },
  },
  {
    id: "faser",
    karnord: ["fas 1", "fas 2", "fas 3", "fas1", "fas2", "fas3", "faserna", "skillnaden mellan faserna", "vilka faser", "medlemsnivåer", "grundbiblioteket"],
    starkord: ["skillnad", "skillnaden", "ingår", "få", "coachning", "ekosystemet"],
    bygga: (reg) => {
      const k = kursKalla(reg, "ak1ts-vaglarans-hierarki", "Läroplanen — Fas 1 gratis · Fas 2 fundamental · Fas 3 ekosystem");
      return {
        text:
          "Tre faser, en filosofi: utbildning i din takt, aldrig råd.\n\n🌱 FAS 1 (gratis, för alltid) — hela grundbiblioteket: läroplanen, V01–V20, bokkanonens grundnivåer, quiz, XP, certifikat.\n🎓 FAS 2 (engångspris) — den snabba FUNDAMENTALA vägen till oberoende analytiker: avancerad värdering, bokslutsanalys, redovisning — plus coaching-gemenskapen och representantvägen.\n🌊 FAS 3 (engångspris) — det dynamiska ekosystemet: AKM1 × AK1TS, vågfundamentet, konfluensradarn, teknisk analys på mästarnivå, rapporter och framtida utvecklingar.\n\nFas 1 kräver ingenting — börjar du där lär du dig samma grunder som faserna bygger på." +
          kallrad(k),
        amne: "faser",
        kalla: k,
        handlings: [
          { text: "Se hela medlemskapet", lank: "/medlemskap", ikon: "💛", beskrivning: "Vad varje fas innehåller" },
          { text: "Börja i Fas 1 (gratis)", lank: "/kurser/v01-forsaljningstillvaxt", ikon: "🌱", beskrivning: "Första kursen nu" },
          { text: "Ekosystemets kärna (Fas 3-förhandstitt)", lank: "/kurser/ak1ts-vaglarans-hierarki", ikon: "🌊", beskrivning: "Vad som väntar" },
        ],
        motfraga: { text: "Vad kostar det?", kategori: "medlemskap" },
        fordjupa: { text: "Medlemskapet", lank: "/medlemskap" },
      };
    },
  },
  {
    id: "konfluens",
    karnord: ["konfluens", "konfluensradarn", "fem dimensioner", "värde möter vågor", "varde moter vagor", "samstämmighet"],
    starkord: ["radar", "dimensioner", "signaler"],
    bygga: (reg) => {
      const k = kursKalla(reg, "konfluens-varde-moter-vagor", "Läroplanen — konfluens, den sammansatta metoden");
      return {
        text:
          "Konfluens betyder att flera oberoende sanningar pekar samma håll — och det är hjärtat i vår metod: FUNDAMENTALT VÄRDE (AKM1: är bolaget bra och rimligt prissatt?) möter VÅGOR (AK1TS: vad gör marknaden just nu?) i Konfluensradarn.\n\nNyckelregeln: EN dimension räcker ALDRIG. Billigt + fallande kniv är inte konfluens. Dyr + stigande våg är det inte heller. Först när värde, våg, risk, katalysator och beteende talar samman finns det en pedagogiskt intressant situation — och även då är det utbildning, inte råd." +
          kallrad(k),
        amne: "konfluens",
        kalla: k,
        handlings: [
          { text: "Kursen: Konfluens — värde möter vågor", lank: "/kurser/konfluens-varde-moter-vagor", ikon: "🧭", beskrivning: "Den sammansatta metoden" },
          { text: "Öppna Konfluensradarn", lank: "/konfluens", ikon: "📡", beskrivning: "Se dimensionerna i praktiken" },
          { text: "Vad är vågfundamentet?", lank: "fragor:" + encodeURIComponent("vad är vågfundamentet?"), ikon: "🌊", beskrivning: "Våg-sidan av konfluensen" },
        ],
        motfraga: { text: "Vad är AKM1?", kategori: "ekosystem" },
        fordjupa: { text: k.titel, lank: "/kurser/konfluens-varde-moter-vagor" },
      };
    },
  },
  {
    id: "vagfundament",
    karnord: ["vågfundamentet", "vagfundamentet", "vågfundament", "vagfundament", "20×5", "20x5", "tidsserier", "vågklasser", "vagklasser", "basbygge"],
    starkord: ["matris", "variabler", "vågor", "vagor"],
    bygga: (reg) => {
      const k = kursKalla(reg, "vagfundament-variablerna-som-tidsserier", "Läroplanen — ekosystemet, vågfundamentet");
      return {
        text:
          "Vågfundamentet är idéerna bakom vår läsning av tid: varje AKM1-variabel (V01–V20) behandlas som en TIDSSERIE, inte ett engångstal — en ROE som håller genom cykeln är en annan historia än en spik. Tillsammans blir det en 20×5-matris: tjugo variabler × fem tidshorisonter.\n\nTre vågklasser att känna igen:\n▲ IMPULSVÅG — huvudrörelsen (fem vågor)\n▼ KORRIGERING — motrörelsen (tre vågor)\n◼ BASBYGGE — sidledes ackumulation där tålamod byggs\n\nPå vågfundament-sidan mäter systemet autonomt var variablerna står." +
          kallrad(k),
        amne: "vågfundament",
        kalla: k,
        handlings: [
          { text: "Kursen: Vågfundament — tidsserier", lank: "/kurser/vagfundament-variablerna-som-tidsserier", ikon: "📊", beskrivning: "12 kapitel om 20×5-matrisen" },
          { text: "Öppna vågfundament-sidan", lank: "/vagfundament", ikon: "🌊", beskrivning: "Den autonoma mätningen" },
          { text: "Vad är en impulsvåg?", lank: "fragor:" + encodeURIComponent("vad är en impulsvåg?"), ikon: "▲", beskrivning: "Vågklasserna i detalj" },
        ],
        motfraga: { text: "Vad är konfluens?", kategori: "ekosystem" },
        fordjupa: { text: k.titel, lank: "/kurser/vagfundament-variablerna-som-tidsserier" },
      };
    },
  },
  {
    id: "ak1ts",
    karnord: ["ak1ts", "våglära", "vaglara", "våglärans", "vaglarans", "25-cellers", "25 cellers", "tidshorisonter"],
    starkord: ["hierarki", "matris", "teknisk"],
    bygga: (reg) => {
      const k = kursKalla(reg, "ak1ts-vaglarans-hierarki", "Läroplanen — AK1TS, våglärans hierarki");
      return {
        text:
          "AK1TS är den tekniska halvan av ekosystemet — våglärans hierarki. Kortmodell:\n\n• 25 tekniker ordnas i en matris över FEM tidshorisonter (från sväng till sekulär).\n• Varje horisont bedöms för sig — en kort våg kan vara stigande medan den långa korrigerar, och det är inte en motsägelse utan information.\n• Hierarkin: den LÅNGA horisonten väger tyngst. Vågor på fel nivå är brus.\n\nAKM1 svarar på VARFÖR (fundamentalt värde), AK1TS på NÄR (timing) — och först tillsammans (konfluens) blir det meningsfullt." +
          kallrad(k),
        amne: "ak1ts",
        kalla: k,
        handlings: [
          { text: "Superdjupet: våglärans hierarki", lank: "/kurser/ak1ts-vaglarans-hierarki", ikon: "🌊", beskrivning: "20 kapitel" },
          { text: "25-cellers matrisen", lank: "/kurser/ts-10-ak1ts-25cellers-matris", ikon: "🔢", beskrivning: "AK1TS-kärnan komprimerad" },
          { text: "Vad är AKM1?", lank: "fragor:" + encodeURIComponent("vad är AKM1?"), ikon: "🏛️", beskrivning: "Den andra halvan" },
        ],
        motfraga: { text: "Vad är konfluens?", kategori: "ekosystem" },
        fordjupa: { text: k.titel, lank: "/kurser/ak1ts-vaglarans-hierarki" },
      };
    },
  },
  // ── s6-u2 (fabrik auto-s6): rapportläsning + nyckeltal/P-E ─────────────────
  // Källmärkta ur kursregistret med registerdriven fakta: kapitel/quiz/minuter
  // läses ur RegisterRad VID SVARSTID — inga hårdkodade siffror som kan bli
  // lögn(er) när registret växer. Regressionstest: verktyg/testa-ai-mentor-u2.mjs
  {
    id: "rapport",
    karnord: [
      "kvartalsrapport", "kvartalsrapporten", "kvartalsrapporter", "delårsrapport",
      "årsredovisning", "årsrapport", "bokslut", "resultaträkning", "balansräkning",
      "rapportläsning", "läsa rapporter",
    ],
    starkord: ["läsa", "läser", "rapport", "tolka", "förstå", "siffror"],
    bygga: (reg) => {
      const huvud = reg.find((r) => r.slug === "km-006-kvartalsrapporten");
      const kassa = reg.find((r) => r.slug === "km-003-kassaflodesanalysen");
      const balans = reg.find((r) => r.slug === "bk-01-balansrakningen");
      const ars = reg.find((r) => r.slug === "pf-12-arsrapportering");
      const fa = (r: RegisterRad | undefined) =>
        r ? `${r.kapitel} kapitel · ${r.quiz} quizfrågor · ${r.minuter} min` : "kursregistret";
      const k = kursKalla(reg, "km-006-kvartalsrapporten", "Läroplanen — bokföring & årsredovisning, kursen om rapporten");
      return {
        text:
          `En rapport läses i tre steg — alltid i samma ordning, alltid som utbildning (aldrig som köp-signal):\n\n1️⃣ INTÄKTEN — växer försäljningen? Jämför med samma kvartal FÖRRA året (säsongen gör kvartalen olika — Q4 är inte Q2).\n2️⃣ MARGINALEN — vad blir kvar av varje intjänad krona? En försvinnande marginal äter en växande intäkt.\n3️⃣ KASSAFLÖDET — den ärligaste raden: vinst är en bedömning, kassaflöde är ett faktum. Här avslöjas bolag som rapporterar vinst men bränner pengar.\n\nI kursen Kvartalsrapporten går vi igenom detta kapitel för kapitel (${fa(huvud)}) — och kassaflödesanalysen har sin egen kurs (${fa(kassa)}).\n\nKom ihåg: en rapport beskriver det som HÄNT — din analysutbildning handlar om att förstå varför, inte att förutsäga nästa kvartal.` +
          kallrad(k),
        amne: "rapportläsning",
        kalla: k,
        handlings: [
          { text: `Kursen: Kvartalsrapporten${huvud ? ` — ${huvud.minuter} min` : ""}`, lank: "/kurser/km-006-kvartalsrapporten", ikon: "📊", beskrivning: `${fa(huvud)} · nivå ${(huvud?.niva || "intermediär").toLowerCase()}` },
          { text: `Kursen: Kassaflödesanalysen${kassa ? ` — ${kassa.minuter} min` : ""}`, lank: "/kurser/km-003-kassaflodesanalysen", ikon: "💰", beskrivning: "Den ärligaste raden på djupet" },
          ...(balans
            ? [{ text: "Kursen: Balansräkningen — bolagets karta", lank: `/kurser/${balans.slug}`, ikon: "🗺️", beskrivning: "Rapportens tredje del — nybörjarnivå" }]
            : []),
          ...(ars
            ? [{ text: "Årsrapporten som portfölj-review", lank: `/kurser/${ars.slug}`, ikon: "🔁", beskrivning: "Årlig genomgång av det du äger — utbildningsupplägg" }]
            : [{ text: "Se alla kurser om bokföring", lank: "/kurser", ikon: "📚", beskrivning: "Hela kategorin bokföring & årsredovisning" }]),
        ],
        motfraga: { text: "Vad är nyckeltal?", kategori: "värdering" },
        fordjupa: { text: k.titel, lank: "/kurser/km-006-kvartalsrapporten" },
      };
    },
  },
  {
    id: "nyckeltal",
    karnord: [
      "nyckeltal", "nyckeltalen", "nyckeltalet", "p/e", "pe tal", "pe talet",
      "price to earnings", "värderingsmultiplikator",
    ],
    starkord: ["aktie", "aktier", "bolag", "värdera", "värdering"],
    bygga: (reg) => {
      const pe = reg.find((r) => r.slug === "km-009-pe");
      const evebit = reg.find((r) => r.slug === "km-010-evebit");
      const fa = (r: RegisterRad | undefined) =>
        r ? `${r.kapitel} kapitel · ${r.quiz} quizfrågor · ${r.minuter} min` : "kursregistret";
      const k = kursKalla(reg, "km-009-pe", "Läroplanen — värderingsmetoder, kursen om P/E");
      return {
        text:
          `P/E (price-to-earnings) = aktiekursen ÷ vinst per aktie — alltså hur många kronor du betalar för varje intjänad krona. Ett P/E på 20 betyder: tjugo kronor pris per krona årsvinst. Det är en prismärkning på förväntningar: högt P/E = marknaden förväntar tillväxt, lågt = marknaden tvivlar.\n\nTre nybörjarregler:\n1️⃣ Lågt P/E är INTE automatiskt billigt — det kan vara en värdefälla (därför finns kursen om fällor i läroplanen).\n2️⃣ Jämför alltid inom branschen och mot bolagets egen historia — ett bygg-P/E och ett teknikkonsult-P/E lever i olika världar.\n3️⃣ EN siffra räcker ALDRIG — därför bygger AKM1 på tjugo variabler i stället för ett ensamt nyckeltal.\n\nRenare syskon: EV/EBIT (${fa(evebit)}) som tar hänsyn till skuld. P/E-djupdykningen är en hel kurs (${fa(pe)}).` +
          kallrad(k),
        amne: "nyckeltal",
        kalla: k,
        handlings: [
          { text: `Kursen: P/E-djupdykningen${pe ? ` — ${pe.minuter} min` : ""}`, lank: "/kurser/km-009-pe", ikon: "⚖️", beskrivning: `${fa(pe)} · nivå ${(pe?.niva || "nybörjare").toLowerCase()}` },
          { text: "Kursen: EV/EBIT — renare än P/E", lank: "/kurser/km-010-evebit", ikon: "🧮", beskrivning: "Nyckeltalet som räknar in skulden" },
          { text: "Vad är AKM1?", lank: "fragor:" + encodeURIComponent("vad är AKM1?"), ikon: "🏛️", beskrivning: "Tjugo variabler — ett nyckeltal räcker aldrig" },
        ],
        motfraga: { text: "Hur läser jag en kvartalsrapport?", kategori: "rapport" },
        fordjupa: { text: k.titel, lank: "/kurser/km-009-pe" },
      };
    },
  },
  // ── Spår 6, byggare u1 (våg 158, fabrik auto-s6): fyra mönster till ──────
  // Ämnena koordinerade mot syskonen i samma omgång (u2 b63bf978: rapport +
  // nyckeltal; u3 ec7331f4: kassaflöde + fundamental + moat) — inga duplikat.
  // Alla svar bär FLERA källor (kallor + numrerad Källor-rad) och ≥3
  // kurslänkar. Striktpoängregeln + sist-position ⇒ kan aldrig stjäla en
  // fråga från tidigare mönster (regressionssäkert, se testa-ai-mentor-spar6).
  {
    id: "utdelning",
    karnord: [
      "utdelning", "utdelningar", "utdelningsaktie", "utdelningsaktier",
      "aktieutdelning", "utdelningsstrategi", "utdelningsvägen",
      "direktavkastning", "dividend", "dividender", "payout ratio",
      "återinvestering",
    ],
    starkord: ["aktier", "portfölj", "passiv inkomst", "väg", "uthållig"],
    bygga: (reg) => {
      const antal = reg.filter((r) => r.kategori === "UTDELNINGSSTRATEGI").length;
      const kallor = [
        kursKalla(reg, "km-063-direktavkastning", "Läroplanen — utdelningsstrategi, kurs 1 (nybörjarnivå)"),
        kursKalla(reg, "pf-05-utdelningsstrategi", "Läroplanen — portföljhantering, utdelning i en hel portfölj"),
        kursKalla(reg, "ud-04-utdelningsfallor", "Läroplanen — utdelningsstrategi, fällorna att känna igen"),
      ];
      const k = kallor[0];
      return {
        text:
          `Utdelning är när ett bolag delar med sig av sin vinst till aktieägarna — en summa per aktie, oftast en eller fyra gånger per år. Nyckelbegreppet är DIREKTAVKASTNING: utdelningen i förhållande till aktiepriset. Det är ett jämförelsemått att lära sig, inte ett köpkriterium vi ger dig.\n\nTre grundläggande lärdomar ur utdelningsstrategins ${antal} kurser:\n\n1. PAYOUT RATIO — hur stor del av vinsten som delas ut. En rimlig andel lämnar utrymme att både dela och växa.\n2. ÅTERINVESTERING — utdelningens verkliga kraft uppstår när den återinvesteras och får växa vidare (ränta-på-ränta; kursen om DRIP förklarar mekaniken).\n3. FÄLLOR — en extra hög direktavkastning kan vara en varningssignal (prisfall på grund av problem) snarare än en gåva.\n\nSom alltid hos oss: detta är utbildning i hur metoden fungerar — aldrig råd om vilka aktier du ska äga.` +
          kallradFler(kallor),
        amne: "utdelning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Direktavkastning", lank: "/kurser/km-063-direktavkastning", ikon: "💰", beskrivning: "Kurs 1 — nybörjarnivå, 16 min" },
          { text: "Kursen: Payout ratio", lank: "/kurser/ud-01-payout-ratio", ikon: "🥧", beskrivning: "Hur mycket av vinsten delas ut?" },
          { text: "Kursen: Utdelnings-fällor", lank: "/kurser/ud-04-utdelningsfallor", ikon: "⚠️", beskrivning: "När hög avkastning är en varning" },
          { text: "Utdelning i en portfölj", lank: "/kurser/pf-05-utdelningsstrategi", ikon: "🏗️", beskrivning: "Portföljhantering-perspektivet" },
        ],
        motfraga: { text: "Hur fungerar skatt på utdelningar?", kategori: "utdelning" },
        fordjupa: { text: k.titel, lank: "/kurser/km-063-direktavkastning" },
      };
    },
  },
  {
    id: "lärväg",
    karnord: [
      "lärväg", "lärvägar", "lärvägen", "inlärningsväg", "utbildningsspår",
      "kunskapsspår", "vilken ordning", "läroplan", "läroplanen",
    ],
    starkord: ["kurser", "profil", "följa", "struktur", "333"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "v01-forsaljningstillvaxt", "Läroplanen — Fas 1, starten på det guidade spåret"),
        kursKalla(reg, "ak1ts-vaglarans-hierarki", "Läroplanen — ekosystemet, målet spåret mynnar ut i"),
      ];
      const k = kallor[0];
      return {
        text:
          `Du behöver inte välja bland ${reg.length} kurser på egen hand — det finns tre vägar in:\n\n1. LÄROPLANEN — det guidade spåret i fem nivåer: variabelkurserna V01–V20 först, sedan fördjupning, till sist ekosystemet (AKM1 × AK1TS). Börja här om du är osäker.\n2. DIN PROFIL — gör profiltestet på tre minuter: din profil matchas mot kurerade lärvägar (fundamentet, utdelningsvägen, vägvisaren), och "Din nästa kurs" visas sedan på Min sida.\n3. BOKKANONEN — om du lär dig bäst genom böcker: klassikerna som kurser, kapitel för kapitel, med quiz.\n\nAlla tre vägar leder till samma mål: att du kan analysera självständigt. Välj den som får dig att vilja fortsätta imorgon också.` +
          kallradFler(kallor),
        amne: "lärväg",
        kalla: k,
        kallor,
        handlings: [
          { text: "Testa din profil (3 min)", lank: "/profil", ikon: "🧠", beskrivning: "Matchas mot kurerade lärvägar" },
          { text: "Se hela läroplanen", lank: "/laroplan", ikon: "🗺️", beskrivning: "Fem nivåer till självständighet" },
          { text: "Börja med V01 (gratis)", lank: "/kurser/v01-forsaljningstillvaxt", ikon: "🌱", beskrivning: "Första steget på spåret" },
          { text: "Målet: våglärans hierarki", lank: "/kurser/ak1ts-vaglarans-hierarki", ikon: "🌊", beskrivning: "Ekosystemet spåret mynnar ut i" },
          { text: "Bokkanon-exempel: Housel", lank: "/kurser/the-psychology-of-money", ikon: "📚", beskrivning: "Klassikern som kurs — kapitel för kapitel" },
        ],
        motfraga: { text: "Hur börjar jag lära mig aktieanalys?", kategori: "orientering" },
        fordjupa: { text: "Läroplanen — fem nivåer", lank: "/laroplan" },
      };
    },
  },
  {
    id: "beteende",
    karnord: [
      "psykologi", "beteende", "beteendefinans", "bias", "kognitiv bias",
      "känslor", "känsla", "panik", "rädsla", "girighet", "flockbeteende",
      "hjärnan", "dunning", "halo-effekt", "sunk cost", "tänka snabbt",
      "psykologin", "beteendevetenskap",
    ],
    starkord: ["misstag", "fel", "disciplin", "hjärta", "kontroll"],
    bygga: (reg) => {
      const antal = reg.filter((r) => r.kategori === "BETEENDEFINANS").length;
      const kallor = [
        kursKalla(reg, "km-035-flockbeteende", "Läroplanen — beteendefinans, varför flocken drar med dig"),
        kursKalla(reg, "bf-02-sunk-cost", "Läroplanen — beteendefinans, nybörjarkurs om sunk cost"),
        kursKalla(reg, "the-psychology-of-money", "Läroplanen — BOKMASTER, Housels klassiker kapitel för kapitel"),
      ];
      const k = kallor[0];
      return {
        text:
          `Beteendefinans är läran om varför smarta människor gör dumma pengabeslut — och den kan vara den viktigaste utbildningen du går, för din största risk är ofta du själv. Tre klassiska fynd att känna igen hos sig själv:\n\n1. FLOCKBETEENDE — vi gör som alla andra, särskilt när marknaden stressar. Det är motorn bakom bubblor och paniker.\n2. SUNK COST — vi håller kvar i en felbedömning för att vi redan lagt tid och pengar på den. Priset du betalat är borta; frågan är bara vad som är rätt FRAMÅT.\n3. HALO-EFFEKTEN — en produkt vi gillar får oss att också tro på siffrorna. Därför mäter AKM1 tjugo variabler i stället för att fråga magkänslan.\n\nI biblioteket finns ${antal} beteendekurser och två kompletta bokmaster: Tänka snabbt och långsamt (Kahneman) samt The Psychology of Money (Housel).\n\nMentorns tumregel: känslan är DATA — men aldrig beslutsunderlag.` +
          kallradFler(kallor),
        amne: "beteende",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Flockbeteende", lank: "/kurser/km-035-flockbeteende", ikon: "🐑", beskrivning: "Varför flocken drar med dig" },
          { text: "Kursen: Sunk cost", lank: "/kurser/bf-02-sunk-cost", ikon: "🕳️", beskrivning: "Nybörjarnivå — den vanligaste fällan" },
          { text: "Housel: The Psychology of Money", lank: "/kurser/the-psychology-of-money", ikon: "💰", beskrivning: "BOKMASTER — 14 kapitel + quiz" },
          { text: "Kahneman: Tänka snabbt och långsamt", lank: "/kurser/tanka-snabbt-och-langsamt", ikon: "🧠", beskrivning: "BOKMASTER — system 1 och 2" },
        ],
        motfraga: { text: "Hur hanterar jag risk?", kategori: "beteende" },
        fordjupa: { text: k.titel, lank: "/kurser/km-035-flockbeteende" },
      };
    },
  },
  {
    id: "skatt",
    karnord: [
      "skatt", "skatten", "skatter", "beskattning", "beskattas", "isk",
      "kapitalvinstskatt", "investeringssparkonto", "schablonskatt",
      "schablonintäkt", "utdelningsskatt", "källskatt", "kallskatt",
      "3:12-reglerna", "skattefritt",
    ],
    starkord: ["aktier", "fonder", "konto", "spara", "utdelning"],
    bygga: (reg) => {
      const antal = reg.filter((r) => r.kategori.includes("SKATT")).length;
      const kallor = [
        kursKalla(reg, "km-052-isk", "Läroplanen — svensk bolagsskatt & juridik, ISK och schablonbeskattning"),
        kursKalla(reg, "km-051-kapitalvinstskatt", "Läroplanen — svensk bolagsskatt & juridik, vinst vid försäljning"),
        kursKalla(reg, "sj-05-kapitalforsakring-vs-isk", "Läroplanen — skatt & juridik, kontotyperna jämförda som utbildning"),
      ];
      const k = kallor[0];
      return {
        text:
          `Skatt på sparande är ett eget kunskapsområde — och eftersom regler och satser förändras lär kurserna PRINCIPERNA, medan aktuella tal alltid verifieras hos Skatteverket. Tre grundbegrepp för svenska sparare:\n\n1. KAPITALVINSTSKATT — vinsten beskattas när du säljer med vinst (kursen km-051 går igenom räknelogan).\n2. ISK — investeringssparkonto beskattas med en schablonintäkt på kontots värde i stället för på varje enskild affär. Hur modellen passar olika sparande är en lärofråga vi visar beräkningar kring — aldrig ett råd om ditt val.\n3. UTDELNINGSSKATT — utdelningar beskattas som inkomst av kapital; för utländska aktier tillkommer källskatt (kursen sj-01).\n\nI spåret finns ${antal} skatte- och juridikkurser. Vi lämnar aldrig individuella skatteråd — Skatteverket och en rådgivare är rätt instanser för din situation.` +
          kallradFler(kallor),
        amne: "skatt",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: ISK — schablonskatt", lank: "/kurser/km-052-isk", ikon: "🏦", beskrivning: "Hur schablonmodellen fungerar" },
          { text: "Kursen: Kapitalvinstskatt", lank: "/kurser/km-051-kapitalvinstskatt", ikon: "📈", beskrivning: "Vinst vid försäljning" },
          { text: "Kursen: Utdelningsskatt", lank: "/kurser/km-050-utdelningsskatt-30", ikon: "💰", beskrivning: "Utdelningars beskattning" },
          { text: "Kapitalförsäkring vs ISK", lank: "/kurser/sj-05-kapitalforsakring-vs-isk", ikon: "⚖️", beskrivning: "Kontotyperna jämförda" },
        ],
        motfraga: { text: "Vad är direktavkastning?", kategori: "skatt" },
        fordjupa: { text: k.titel, lank: "/kurser/km-052-isk" },
      };
    },
  },
  // ── Spår 6, omgång 2, byggare u2 (fabrik auto-s6): kapitalstruktur + tillväxt
  // Ämnesval EFTER kollisionskontroll mot basens 20 + extra-lagrets 3 + makro-
  // lagrets 2 mönster (u1 cb1dc540, körs FÖRE basen): kärnordsfamiljerna
  // "skuld/kapitalstruktur/soliditet/hävstång" och "tillväxt/organisk/förvärv"
  // är verifierat fria — de förekommer bara i andra monsters SVARSTEXTER,
  // aldrig som kärnord. Backas av spår 5:s sex nya kurser som rebakades in
  // i registret i samma leverans (337 → 343, bastestets E01 grönt igen).
  // Sist i MONSTER + strikt poängregel ⇒ kan aldrig stjäla en fråga från
  // tidigare deklarerade mönster (rad/kostnad/risk förblir säkrade).
  // Regressionstest: verktyg/testa-ai-mentor-s6u2-omg2.mjs
  {
    id: "kapitalstruktur",
    karnord: [
      "kapitalstruktur", "kapitalstrukturen", "skuld", "skulder", "skuldsättning",
      "skuldsatt", "soliditet", "hävstång", "belåning", "eget kapital",
      "kapitalallokering",
    ],
    starkord: ["bolag", "balansräkning", "låna", "finansiera", "källa"],
    bygga: (reg) => {
      const grunder = reg.find((r) => r.slug === "ks-01-kapitalstruktur-grunder");
      const allokering = reg.find((r) => r.slug === "ks-02-kapitalallokering");
      const balans = reg.find((r) => r.slug === "bk-01-balansrakningen");
      const fa = (r: RegisterRad | undefined) =>
        r ? `${r.kapitel} kapitel · ${r.minuter} min${r.quiz ? ` · ${r.quiz} quizfrågor` : ""}` : "kursregistret";
      const kallor = [
        kursKalla(reg, "ks-01-kapitalstruktur-grunder", "Läroplanen — kapitalstruktur, grunderna (nybörjarnivå)"),
        kursKalla(reg, "ks-02-kapitalallokering", "Läroplanen — kapitalstruktur, styrelsens fem vägar"),
        kursKalla(reg, "rk-03-skuldfalla", "Läroplanen — riskhantering, när skulden blir en fälla"),
      ];
      const k = kallor[0];
      return {
        text:
          `Kapitalstruktur är svaret på frågan varifrån bolagets pengar kommer — och det finns bara två källor: EGET KAPITAL (ägarna har skjutit till eller låtit vinsten stanna kvar) och SKULD (lånade pengar med ränta och återbetalningskrav). Nyckeltalet SOLIDITET visar hur stor del av balansräkningen som bärs av eget kapital.\n\nPedagogiken i balansgången: skuld är inte dum i sig — den är en HÄVSTÅNG. Går verksamheten bra förstärker den avkastningen på det egna kapitalet; går den sämre gör samma räntekostnad fallet brantare. Därför läses kapitalstruktur som en riskfråga: klarar bolaget en dålig cykel utan att tvingas låna mer eller emittera? (Det är risken V19 kapitalförbränning mäter.)\n\nOch pengarna som TJÄNAS har också en struktur: KAPITALALLOKERINGEN — styrelsens fem vägar för det fria kassaflödet (reinvestera i verksamheten, förvärva, dela ut, köpa tillbaka aktier, amortera) är en egen kurs.\n\nSom alltid: detta är utbildning i att LÄSA en balansräkning — aldrig ett omdöme om enskilda bolag.` +
          kallradFler(kallor),
        amne: "kapitalstruktur",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Kapitalstruktur — grunder${grunder ? ` — ${grunder.minuter} min` : ""}`, lank: "/kurser/ks-01-kapitalstruktur-grunder", ikon: "🏗️", beskrivning: `${fa(grunder)} · nivå ${(grunder?.niva || "nybörjare").toLowerCase()}` },
          { text: `Kursen: Kapitalallokering — fem vägar${allokering ? ` — ${allokering.minuter} min` : ""}`, lank: "/kurser/ks-02-kapitalallokering", ikon: "🧭", beskrivning: fa(allokering) },
          { text: "Kursen: Skuldfällan", lank: "/kurser/rk-03-skuldfalla", ikon: "⚠️", beskrivning: "När skulden blir en fälla — riskhantering" },
          ...(balans
            ? [{ text: "Kursen: Balansräkningen — bolagets karta", lank: `/kurser/${balans.slug}`, ikon: "🗺️", beskrivning: `${fa(balans)} · nybörjarnivå` }]
            : []),
          { text: "Vad är V19?", lank: "fragor:" + encodeURIComponent("vad är V19?"), ikon: "🔥", beskrivning: "Kapitalförbränning — kopplingsvariabeln" },
        ],
        motfraga: { text: "Vad är V19?", kategori: "risk" },
        fordjupa: { text: k.titel, lank: "/kurser/ks-01-kapitalstruktur-grunder" },
      };
    },
  },
  {
    id: "tillvaxt",
    karnord: [
      "tillväxt", "tillväxten", "tillväxtaktie", "tillväxtaktier", "tillväxtbolag",
      "tillväxtbolagen", "organisk tillväxt", "förvärvad tillväxt", "organisk",
      "organiskt", "förvärv", "förvärvad", "förvärvat", "förvärvstillväxt",
    ],
    starkord: ["bolag", "aktier", "försäljning", "intäkter", "källa"],
    bygga: (reg) => {
      const tx = reg.find((r) => r.slug === "tx-01-organisk-mot-forvarvad-tillvaxt");
      const v01 = reg.find((r) => r.slug === "v01-forsaljningstillvaxt");
      const v03 = reg.find((r) => r.slug === "v03-intaktsdiversifiering");
      const fa = (r: RegisterRad | undefined) =>
        r ? `${r.kapitel} kapitel · ${r.minuter} min${r.quiz ? ` · ${r.quiz} quizfrågor` : ""}` : "kursregistret";
      const kallor = [
        kursKalla(reg, "tx-01-organisk-mot-forvarvad-tillvaxt", "Läroplanen — tillväxt, kursen om källan (intermediär)"),
        kursKalla(reg, "v01-forsaljningstillvaxt", "Läroplanen — AKM1, V01 försäljningstillväxt (nybörjarnivå)"),
        kursKalla(reg, "v03-intaktsdiversifiering", "Läroplanen — AKM1, V03 intäktsdiversifiering"),
      ];
      const k = kallor[0];
      return {
        text:
          `Tillväxt är den första dimensionen i AKM1 (V01–V03) — men den nybörjarlektion som oftast glöms bort är KÄLLAN: tillväxten är antingen ORGANISK (fler kunder, mer försäljning, högre priser — växer inifrån) eller FÖRVÄRVAD (bolaget köper en annan verksamhet — växer utifrån).\n\nVarför källan spelar pedagogisk roll:\n1️⃣ ORGANISK tillväxt är billigare och mer hållbar — men långsammare.\n2️⃣ FÖRVÄRVAD tillväxt är snabb — men kostar kapital, integrationsarbete och ofta goodwill som kan behöva skrivas ned.\n3️⃣ FÄLLAN: en stigande intäktskurva kan dölja en kärna som står stilla — då finns tillväxten bara i senaste förvärvet. I rapporten spårar du källan i noterna och segmentuppgifterna (ÅRL 1995:1554 kräver att intäkterna delas upp där det behövs för förståelsen).\n\nOch kopplingen framåt: tillväxt UTAN moat äts så småningom upp av konkurrensen — därför står V01–V03 aldrig ensamma i en analys.\n\nSom alltid: detta är utbildning i att läsa KÄLLAN bakom siffrorna — inte en uppfattning om vilka bolag som växer bäst.` +
          kallradFler(kallor),
        amne: "tillväxt",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Organisk vs förvärvad tillväxt${tx ? ` — ${tx.minuter} min` : ""}`, lank: "/kurser/tx-01-organisk-mot-forvarvad-tillvaxt", ikon: "🌱", beskrivning: `${fa(tx)} · nivå ${(tx?.niva || "intermediär").toLowerCase()}` },
          { text: `Kursen V01: Försäljningstillväxt${v01 ? ` — ${v01.minuter} min` : ""}`, lank: "/kurser/v01-forsaljningstillvaxt", ikon: "📈", beskrivning: `${fa(v01)} · nybörjarnivå` },
          { text: `Kursen V03: Intäktsdiversifiering${v03 ? ` — ${v03.minuter} min` : ""}`, lank: "/kurser/v03-intaktsdiversifiering", ikon: "🧺", beskrivning: fa(v03) },
          { text: "Vad är en moat?", lank: "fragor:" + encodeURIComponent("vad är en moat?"), ikon: "🛡️", beskrivning: "Varför tillväxt behöver ett försvar" },
        ],
        motfraga: { text: "Vad är ARR-tillväxt?", kategori: "tillväxt" },
        fordjupa: { text: k.titel, lank: "/kurser/tx-01-organisk-mot-forvarvad-tillvaxt" },
      };
    },
  },
];

// OBS (våg 106 H2): AKM1-variablerna (V01–V20) har inget mönster här — de
// besvaras DATA-DRIVET ur registret (se variabelSvar) efter mönstersteget,
// så att t.ex. "vad är risk?" får riskhanteringssvaret (mönster) medan
// "vad är kapitalförbränning?" får V19-kursens fakta (registeruppslag).

/**
 * Nyckelord för V-uppslag, genererade ur registret (våg 106 H2: motorn ska
 * inte hårdkoda kurser — registret är sanningen). Per variabelkurs: slug-stammen
 * (t.ex. "roe" ur "v09-roe") + titelns ord (≥3 tecken).
 */
function variabelNyckelord(register: RegisterRad[]): Array<{ rad: RegisterRad; ord: string[] }> {
  return register
    .filter((r) => r.variabel)
    .sort((a, b) => (a.variabel! < b.variabel! ? -1 : 1))
    .map((r) => {
      const stam = r.slug.replace(/^v\d{2}-/, "").split("-").join(" ");
      const titelOrd = diafri(r.titel)
        .split(" ")
        .filter((o) => o.length >= 3);
      return { rad: r, ord: [diafri(stam), ...titelOrd] };
    });
}

/**
 * Data-drivet svar för en AKM1-variabelkurs — ALLT ur registret: titel,
 * kategori, kapitel, quiz, minuter, nivå. Detta är AI-Mentorn 2.0:s kärna:
 * frågan om V09 och frågan om ROE ger samma källmärkta fakta.
 */
function variabelSvar(rad: RegisterRad, register: RegisterRad[]): LokaltSvar {
  const totalQuiz = register.reduce((s, r) => s + r.quiz, 0);
  const k: LokalKalla = {
    slug: rad.slug,
    titel: rad.titel,
    lagrow: `Läroplanen — AKM1, ${rad.variabel} av V01–V20 (${rad.kategori.toLowerCase()})`,
  };
  return {
    text:
      `${rad.variabel} — ${rad.titel} — är en av de tjugo variablerna i AKM1, i dimensionen ${rad.kategori.toLowerCase()}.\n\nKursen i registret: ${rad.kapitel} kapitel · ${rad.quiz} quizfrågor (+10 XP per rätt) · ${rad.minuter} minuter · nivå ${rad.niva.toLowerCase()}.\n\nKom ihåg: en variabel är ett LÄRANDE, inte en rekommendation — den får sin betydelse först tillsammans med de andra nitton. I kalkylatorn kan du mata in alla tjugo för ett riktigt bolag (${totalQuiz} quizfrågor väntar totalt i hela biblioteket).` +
      kallrad(k),
    amne: `variabel-${rad.variabel}`,
    kalla: k,
    handlings: [
      { text: `Läs kursen ${rad.variabel}: ${rad.titel}`, lank: `/kurser/${rad.slug}`, ikon: "📊", beskrivning: `${rad.minuter} min · ${rad.kapitel} kapitel` },
      { text: "Räkna med alla 20 i kalkylatorn", lank: "/kalkylator", ikon: "🧮", beskrivning: "AKM1 i praktiken" },
      { text: "Vad är AKM1?", lank: "fragor:" + encodeURIComponent("vad är AKM1?"), ikon: "🏛️", beskrivning: "Helhetsmodellen" },
    ],
    motfraga: { text: `Vad är ${rad.variabel === "V09" ? "V10" : "V09"}?`, kategori: "variabler" },
    fordjupa: { text: rad.titel, lank: `/kurser/${rad.slug}` },
  };
}

// ── Huvudingången ───────────────────────────────────────────────────────────

/**
 * Svara lokalt på frågan — eller null om ingen förhandsfråga matchar (då
 * fortsätter widgeten till /api/chatbot som vanligt). Två steg (våg 106 H2:
 * mönster FÖRE registeruppslag — se kommentaren under MONSTER):
 *   1. Mönstermatchning mot de femton förhandsfrågorna (kärnords-krav +
 *      poäng; redigeringstavstånd tillåter felstavningar)
 *   2. V-nummer eller variabelnamn i frågan → data-drivet registersvar
 * Deterministiskt: samma fråga ger bitidentiskt svar.
 */
export function svaraLokalt(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");

  // ── Steg 1: mönstermatchning (förhandsfrågorna) ──
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
    // Oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt)
  }
  if (bast) return bast.svar;

  // ── Steg 2: V-nummer eller variabelnamn (data-drivet ur registret) ──
  // V-nummer matchas EXAKT (inget redigeringstavstånd: v09→v10 är ett steg,
  // och fel variabel är värre än inget svar — våg 106 H2).
  for (const ord of fragaOrd) {
    const m = ord.match(/^v(\d{1,2})$/);
    if (m) {
      const n = Number(m[1]);
      const kanon = `V${String(n).padStart(2, "0")}`;
      const rad = register.find((r) => r.variabel === kanon);
      if (rad) return variabelSvar(rad, register);
    }
  }
  // Variabelnamn (slug-stam eller titelord, t.ex. "roe", "bruttomarginal")
  const vNyckel = variabelNyckelord(register);
  for (const { rad, ord } of vNyckel) {
    for (const nyckel of ord) {
      if (nyckel.length < 3) continue;
      if (traff(fragaOrd, fragaStr, nyckel)) return variabelSvar(rad, register);
    }
  }

  return null;
}

/**
 * Ärlig fallback: "det vet mentorn inte än" + de tre närmaste kurserna ur
 * registret (deterministiskt). Används av widgeten när NÄTVERKET faller
 * (API-svaret når inte fram) — eleven ska aldrig mötas av en död feltext.
 * OBS: vanliga omatchade frågor går till /api/chatbot som förr; motorn
 * kapar inte API-flödet (våg 106 H2-avvägning).
 */
export function fallbackSvar(fraga: string, register: RegisterRad[]): LokaltSvar {
  const nara = narmasteKurser(fraga, register, 3);
  const k: LokalKalla = {
    titel: `Kursregistret (${register.length} kurser)`,
    lagrow: "Läroplanen — utbudet bakom svaret",
  };
  const lista = nara.map((r) => `• ${r.titel} — ${r.kategori.toLowerCase()} · ${r.kapitel} kapitel · ${r.minuter} min`).join("\n");
  return {
    text:
      `Det vet mentorn inte än — och då säger jag det rakt ut i stället för att gissa (troligen nåddes inte servern heller just nu). Här är de tre kurser i registret som ligger närmast din fråga:\n\n${lista}\n\nOmmformulera frågan så försöker den smarta mentorn på servern igen.` +
      kallrad(k),
    amne: "fallback",
    kalla: k,
    handlings: [
      ...nara.map((r) => ({
        text: r.titel,
        lank: `/kurser/${r.slug}`,
        ikon: "📚",
        beskrivning: `${r.kategori.toLowerCase()} · ${r.minuter} min`,
      })),
      { text: "Se läroplanen", lank: "/laroplan", ikon: "🗺️", beskrivning: "Hela utbildningsspåret" },
    ],
    motfraga: { text: "Vad är AKM1?", kategori: "orientering" },
    fordjupa: { text: "Läroplanen", lank: "/laroplan" },
  };
}
