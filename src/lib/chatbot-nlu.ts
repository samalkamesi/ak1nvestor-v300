/**
 * CHATBOT-NLU — deterministisk naturlig-språksförståelse för AI-Mentorn.
 *
 * Ren matematik och tabeller — inga nätverksanrop, inga slumpgenererade
 * tolkningar. Modulen gör en människas fråga ("Vadd är P/E??", "och ps?",
 * "hur räknar man bruttomarginal ju liksom") sökbar mot mentorns ämnesregister:
 *
 *   1. FRASTOLKNING  — "va e" / "vadä" / "p/e" / "mr market" blir enkla ord
 *   2. ACCENTER      — å/ä/ö → a/a/o så att "vaget" ≈ "våget" ≈ "våg"
 *   3. INTERPUNKTION — borta ("P/E?" och "pe" matchar samma)
 *   4. FYLLNADSORD   — "ju", "liksom", "typ", "man kan ju", "hur mycket" …
 *   5. SYNONYMER     — "brask"/"börset" → börsen, "vallgrav" → moat …
 *   6. STAVFEL       — Levenshtein-avstånd ≤ 1 på nyckelord (≥ 4 tecken),
 *                      med svensk suffix-stamning ("bruttomarginalen" →
 *                      "bruttomarginal")
 *
 * Utdata är en normaliserad sträng + tokens + det ämne (AmnesNyckel) som
 * frågan handlar om, samt huruvida frågan är en FÖLJDFRÅGA ("och P/E?" efter
 * ett samtal om ROE). Ämnesregistret (AMNESORDNING) är ordnat: specifika
 * ämnen (v08 "EBITDA-marginal") testas före generella (v06 "EBITDA").
 */

// ── Ämnesnycklar — måste täckas av V_REGISTRET i /api/chatbot ───────────────

export type AmnesNyckel =
  | "v01" | "v02" | "v03" | "v04" | "v05" | "v06" | "v07" | "v08" | "v09"
  | "v10" | "v11" | "v12" | "v13" | "v14" | "v15" | "v16" | "v17" | "v18"
  | "v19" | "v20"
  | "pe" | "moat" | "sakerhetsmarginal" | "mrmarket" | "ekosystem"
  | "kalkylator" | "portfolj" | "tillvaxt" | "risk" | "utdelning" | "borsen";

export type NormaliseradFraga = {
  /** Originalfrågan, klippt och klippt till gemener. */
  rå: string;
  /** Normaliserad sträng: gemener, accenter bort, fyllnadsord borta. */
  ren: string;
  /** Tokens ur den normaliserade strängen. */
  tokens: string[];
};

// ── 1. Frastolkning — innan interpunktionen försvinner ──────────────────────

const FRASER_FORE: Array<[RegExp, string]> = [
  [/\bvadd\b/g, "vad"],
  [/\bva e\b/g, "vad är"],
  [/\bvadä\b/g, "vad är"],
  [/\bvad e\b/g, "vad är"],
  [/\bä e de\b/g, "är det"],
  [/\bp\s*\/\s*e(-tal)?\b/gi, " pe "],
  [/\bp\s*\/\s*s(-tal)?\b/gi, " ps "],
  [/\bp\s*\/\s*b(-tal)?\b/gi, " pb "],
  [/\bev\s*\/\s*ebitda\b/gi, " evebitda "],
  [/\bm+r\.?\s*market\b/gi, "mrmarket"],
  [/\bherr marknad\b/g, "mrmarket"],
  [/\bmarginal of safety\b/gi, "sakerhetsmarginal"],
  [/\bbrutto marginal\b/g, "bruttomarginal"],
];

// ── 2. Accenter (å/ä/ö varianter: "våg" ≈ "vag" ≈ "vàg") ─────────────────────

const ACCENTER: Record<string, string> = {
  å: "a", ä: "a", ö: "o", é: "e", è: "e", ê: "e", á: "a", à: "a",
  â: "a", û: "u", ï: "i", ü: "u", ë: "e", ç: "c", ñ: "n",
};

function strackAccenter(s: string): string {
  return s.replace(/[åäöéèêáàâûïüëçñ]/g, (c) => ACCENTER[c] ?? c);
}

// ── 3+4+5. Fyllnadsord och synonymer (token-nivå, efter accenter) ───────────

/** Fraser som strippas helt — direktiv: "hur mycket/kanske/man kan ju". */
const FYLLNADSFRASER = [
  /\bhur mycket\b/g,
  /\bman kan ju\b/g,
  /\bman kan\b/g,
  /\bjag undrar\b/g,
  /\bkan du (bara )?(säga|berätta|förklara)\b/g,
  /\bvet du\b/g,
  /\bså att säga\b/g,
  /\ballt sånt där\b/g,
];

/** Enstaka fyllnadsord — tas bort ur matchningssträngen. */
const FYLLNADSORD = new Set([
  "ju", "liksom", "typ", "alltså", "faktiskt", "egentligen", "bara",
  "väldigt", "riktigt", "jätte", "kanske", "väll", "vla", "hmm", "eh",
  "öhh", "mann", "okej", "ok", "okey", "hehe", "snälla", "tacka",
]);

/** Synonymer på token-nivå (accentfria former). */
const SYNONYMER: Record<string, string> = {
  e: "är", o: "och", de: "det",
  brask: "borsen", borset: "borsen", bors: "borsen", aktier: "borsen",
  vallgrav: "moat", konkurrensfordel: "moat",
  skulder: "v10", skuld: "v10", skuldsattning: "v10",
  emission: "v19", nyemission: "v19", forbranning: "v19", runway: "v19",
  utdelningar: "utdelning", dividend: "utdelning",
  aktiemarknad: "borsen", marknaden: "borsen",
};

// ── 6. Levenshtein — stavfelstolerans ≤ 1 på nyckelord ──────────────────────

/** Klassiskt avstånd (DP, två rader). Används bara på korta strängar. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 2; // snabbavvisning: över gränsen
  let förra = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const nu = [i];
    for (let j = 1; j <= b.length; j++) {
      nu[j] = Math.min(
        förra[j] + 1,
        nu[j - 1] + 1,
        förra[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    förra = nu;
  }
  return förra[b.length];
}

/** Svensk suffix-stamning: "bruttomarginalen" → "bruttomarginal" (bundet-testas). */
function stam(tx: string): string[] {
  const ut = [tx];
  for (const suffix of ["en", "et", "na", "er", "ar", "n", "s", "a"]) {
    if (tx.length - suffix.length >= 5 && tx.endsWith(suffix)) {
      ut.push(tx.slice(0, tx.length - suffix.length));
    }
  }
  return ut;
}

/** Matchar en token mot ett nyckelord: exakt, stavfel (≤1) eller stam. */
function tokenMatchar(token: string, nyckelord: string): boolean {
  if (token === nyckelord) return true;
  if (nyckelord.length >= 4) {
    for (const t of stam(token)) {
      if (levenshtein(t, nyckelord) <= 1) return true;
    }
  }
  return false;
}

// ── Normalisering ────────────────────────────────────────────────────────────

export function normaliseraFraga(fraga: string): NormaliseradFraga {
  const rå = String(fraga || "").toLowerCase().slice(0, 300).trim();
  let s = rå;
  for (const [re, ersatt] of FRASER_FORE) s = s.replace(re, ersatt);
  s = strackAccenter(s);
  s = s.replace(/[^a-z0-9\s]/g, " "); // interpunktion bort
  for (const re of FYLLNADSFRASER) s = s.replace(re, " ");
  const tokens = s
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => {
      // Direkt träff — annars genitiv/ bestämd form-stam ("brasken" → "brask")
      if (SYNONYMER[t]) return SYNONYMER[t];
      if (t.length > 5 && /(?:en|ern|na)$/.test(t)) {
        const stamnad = SYNONYMER[t.replace(/(?:en|ern|na)$/, "")];
        if (stamnad) return stamnad;
      }
      return t;
    })
    .filter((t) => !FYLLNADSORD.has(t));
  return { rå, ren: tokens.join(" "), tokens };
}

// ── Ämnesigenkänning ─────────────────────────────────────────────────────────

type AmnesPost = {
  nyckel: AmnesNyckel;
  /** Enords-nyckelord — testas med stavfelstolerans. */
  ord?: string[];
  /** Flerordsfraser — testas som delsträngar i den normaliserade frågan. */
  fraser?: string[];
};

/**
 * Ämnesordningen är prioritetsordningen: specifikt före generellt
 * ("ebitda marginal" → v08 innan "ebitda" → v06, "skuldsättningsgrad" →
 * v10 innan kombinationen "risk").
 */
const AMNESORDNING: AmnesPost[] = [
  { nyckel: "v01", ord: ["v01"], fraser: ["forsaljningstillvaxt", "omsattningsvaxt", "omsattnings tillvaxt"] },
  { nyckel: "v02", ord: ["v02", "arr"], fraser: ["arr tillvaxt", "arr vaxt"] },
  { nyckel: "v03", ord: ["v03"], fraser: ["diversifiering", "storkund", "kundkoncentration"] },
  { nyckel: "v04", ord: ["v04", "ps"], fraser: ["pris omsattning"] },
  { nyckel: "v05", ord: ["v05", "pb"], fraser: ["pris per bokfort", "pris eget kapital"] },
  { nyckel: "v07", ord: ["v07", "brutto", "bruttomarginal"], fraser: ["bruttomarginal", "bruttovinst", "gross marginal"] },
  // v08 FÖRE v06: "EBITDA-marginal" är ett eget ämne — "EBITDA" ensamt är v06
  { nyckel: "v08", ord: ["v08"], fraser: ["ebitda marginal", "rorelsemarginal", "vinstmarginal"] },
  { nyckel: "v06", ord: ["v06", "evebitda", "ebitda"], fraser: ["enterprise value"] },
  { nyckel: "v09", ord: ["v09", "roe"], fraser: ["avkastning pa eget kapital", "lonsamhet", "buffett"] },
  { nyckel: "v10", ord: ["v10", "skuldsattningsgrad"], fraser: ["skuldsattning", "balanserat"] },
  { nyckel: "v11", ord: ["v11"], fraser: ["likviditet", "kvickkvot", "kvinlikviditet"] },
  { nyckel: "v12", ord: ["v12"], fraser: ["intaktsstabilitet", "stabilitet", "staliga intakter"] },
  { nyckel: "v13", ord: ["v13"], fraser: ["patent", "immaterialratt", "ip rall"] },
  { nyckel: "v14", ord: ["v14"], fraser: ["varumarke", "brand"] },
  { nyckel: "v15", ord: ["v15"], fraser: ["natverkseffekt", "natverk"] },
  { nyckel: "v16", ord: ["v16"], fraser: ["produktlansering", "lansering", "pipeline"] },
  { nyckel: "v17", ord: ["v17"], fraser: ["partnerskap", "avtal"] },
  { nyckel: "v18", ord: ["v18"], fraser: ["regulatorisk", "myndighetsbeslut", "godkannande"] },
  { nyckel: "v19", ord: ["v19"], fraser: ["kassateckning", "kassatackning", "kapitalforbrukning", "nyemission"] },
  { nyckel: "v20", ord: ["v20"], fraser: ["aterekop", "insiderkop"] },
  { nyckel: "pe", ord: ["pe"], fraser: ["vinstmultipl", "pris per vinst", "vinst per aktie"] },
  { nyckel: "moat", ord: ["moat"], fraser: ["vallgrav", "konkurrensfordel", "varaktig konkurrensfordel"] },
  { nyckel: "sakerhetsmarginal", fraser: ["sakerhetsmarginal", "sakerhets marginal", "mos"] },
  { nyckel: "mrmarket", ord: ["mrmarket"], fraser: ["mr market", "herr market"] },
  { nyckel: "utdelning", ord: ["utdelning"], fraser: ["utdelningar"] },
  { nyckel: "tillvaxt", ord: ["tillvaxt", "vaxer"], fraser: ["vaxer bolaget", "vaxtakraft"] },
  { nyckel: "risk", ord: ["risk", "risker"], fraser: ["farlig", "osaker"] },
  { nyckel: "ekosystem", ord: ["ekosystem", "akm1", "ak1ts"], fraser: ["5x5x4", "hur hanger ihop"] },
  { nyckel: "kalkylator", ord: ["kalkylator"], fraser: ["rakna pa en aktie", "rakna pa aktie"] },
  { nyckel: "portfolj", ord: ["portfolj", "innehav"], fraser: ["min portfolj", "bygga portfolj", "aktieportfolj"] },
  { nyckel: "borsen", ord: ["borsen"], fraser: ["aktie marknad", "borshandel", "borshandla"] },
];

/** Det ämne frågan handlar om — eller null om inget känns igen. */
export function hamtaAmne(n: NormaliseradFraga): AmnesNyckel | null {
  for (const post of AMNESORDNING) {
    for (const fras of post.fraser ?? []) {
      if (n.ren.includes(fras)) return post.nyckel;
    }
    for (const nyckelord of post.ord ?? []) {
      for (const token of n.tokens) {
        if (tokenMatchar(token, nyckelord)) return post.nyckel;
      }
      // Även fraser som hamnat som delsträng av ett långt ord ("brutmarginal")
      if (nyckelord.length >= 7 && n.ren.includes(nyckelord)) return post.nyckel;
    }
  }
  return null;
}

// ── Följdfrågedetektering — "och P/E?" efter ett samtal om ROE ───────────────

const FRAGEORD = new Set([
  "vad", "hur", "var", "när", "vem", "vilken", "vilket", "varför",
  "kan", "ska", "bör", "är", "stämmer", "förklara", "beskriv",
]);

/**
 * En följdfråga börjar med "och"/"sen"/"sedan"/"också" — eller är så kort att
 * den bara kan bygga på förra ämnet ("ps?", "och bruttomarginal?").
 * Krav: frågan måste innehålla ett känt ämne (anroparen kontrollerar det).
 */
export function arFoljdfraga(n: NormaliseradFraga): boolean {
  const t = n.tokens;
  if (t.length === 0) return false;
  const förled = t[0];
  if (["och", "sen", "sedan", "ocks", "i", "fortsatt", "fortsattning"].includes(förled) && t.length >= 2) {
    return true;
  }
  // Kort fråga utan frågeord: "ps?" / "roe?" / "brutto?" — bygger på sammanhanget
  if (t.length <= 3 && !t.some((w) => FRAGEORD.has(w))) return true;
  return false;
}
