/**
 * TESTA MOTOR — KLIENTKONTEXTEN (v213b-u6, fabriksvåg: 10 otestade motorer).
 *
 * Kör:  npx --yes tsx verktyg/testa-motor-klientkontext.mjs
 *       (ren node kan dö på ändelselös .ts-import — ERR_MODULE_NOT_FOUND är
 *       VÄNTAT; testaggregatorns tsx-återfall hanterar det, se u5/R107.)
 *
 * Kontraktssvit för src/lib/klientkontext.ts — BARA rena kontrakt:
 *   A  Exporter             — modulens yta: INTRESSE_KURS + fem funktioner
 *   B  INTRESSE_KURS        — fyra spår (teknisk/fundamental/portfölj/
 *                             beteende), full form per spår, unika slugs,
 *                             täcker tracerns INTRESSE_NYCKLAR (korsmodul)
 *   C  toppIntresseUrProfil — högsta positiva poängen vinner; tom/zero/
 *                             negativ ⇒ null; oavgjort ⇒ första nyckeln;
 *                             godtyckliga nycklar utan validering
 *   D  paborjadKurs         — null för icke-kurssidor, undervägar, tom
 *                             slug och klarade kurser; slug/lank/titel-form,
 *                             versalisering, eftersläpande slash, URL-avkodning
 *   E  detekteraLasTillstand — trappan: nivå ≥ 25 ⇒ fas2-redo (dominerar),
 *                             > 10 kurser OCH > 70 % ⇒ avancerad (strikt >
 *                             på båda), ≥ 3 kurser ⇒ växande, < 60 % ⇒
 *                             nybörjare, annars växande
 *   F  lasKlientkontext      — SSR i ren node: kraschfri, exakt 13 fält,
 *                             ny-elev-värden, lasTillstand härledet,
 *                             larvag ALDRIG gissad lokalt, determinism
 *   G  lasKlientkontext      — aggregeringen med mockad localStorage i
 *                             processen: namn/email, xp→nivå→tillstånd,
 *                             streak, klara kurser, målet, tracerns fält
 *                             (quiz i %, sekunder→minuter, sanering),
 *                             /min-sida hoppas i senasteSida + integration
 *   H  predikteraNastaSteg   — returform (sakerhet 0–100) och hela
 *                             prioriteringskedjan med kanter: streak ≤ 0 ⇒
 *                             Dagens Pass, påbörjad kurs ⇒ nästa kapitel,
 *                             0 < träff < 50 ⇒ repetition, toppintresse ⇒
 *                             flaggskepp (om ej klar + bara kända spår),
 *                             fas2-redo ⇒ Fas 2-nudge, fallback till
 *                             kurstips (V01 för ny elev) och sista
 *                             utvägen biblioteket när ALLT är klarat
 *
 * Deterministisk: INGEN server, INGET nätverk, INGEN prod, INGA
 * miljöberoenden. localStorage mockas i processen (samma mönster som
 * u5 — motorn rör globalThis endast inuti funktionerna); ingen disk,
 * inga data/-filer rörs.
 *
 * Vägar utanför ren nodes räckvidd (dokumenterade i protokollet):
 * tracer-rapportfunktionerna (behöver riktiga window-händelser) och
 * berikaLarvag i larvag-klient.ts (asynkron serverberikning via
 * /api/larvag — annat modulägarskap). Här testas kontexten som ren modul.
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

let motor;
let tracerModul;
let kurstipsModul;
try {
  motor = await import(pathToFileURL(join(ROT, "src/lib/klientkontext.ts")).href);
  tracerModul = await import(pathToFileURL(join(ROT, "src/lib/tracer.ts")).href);
  kurstipsModul = await import(pathToFileURL(join(ROT, "src/lib/kurstips.ts")).href);
} catch (e) {
  console.error(
    "FEL: import av src/lib/klientkontext.ts misslyckades — .ts-import kräver tsx; " +
      "kör sviten med: npx --yes tsx verktyg/testa-motor-klientkontext.mjs",
  );
  console.error(e); // rå fel bevarar ERR_MODULE_NOT_FOUND-markören för aggregatorns tsx-återfall
  process.exit(1);
}

const {
  INTRESSE_KURS,
  toppIntresseUrProfil,
  paborjadKurs,
  detekteraLasTillstand,
  lasKlientkontext,
  predikteraNastaSteg,
} = motor;
const { INTRESSE_NYCKLAR } = tracerModul;
const { V_SPÅR, FLAGGSKEPP, FORBEREDELSE } = kurstipsModul;

// ── Testharness (husets kontroll-mönster) ───────────────────────────────────
let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log("PASS  " + namn + (detalj ? "  — " + detalj : ""));
  } else {
    fail++;
    console.log("FAIL  " + namn + (detalj ? "  — " + detalj : ""));
  }
}

const t0 = Date.now();

function lika(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function arFunktion(f) {
  return typeof f === "function";
}
function ickeTomStrang(s) {
  return typeof s === "string" && s.length > 0;
}

/** Kontext-fabrik — KlientKontext-formen ur motorn, med ny-elev-defaults. */
function kontext(over = {}) {
  return {
    namn: null,
    niva: 1,
    xp: 0,
    streak: 1,
    klaraKurser: [],
    mal: null,
    intresseProfil: {},
    aktivTid: 0,
    typiskaTimmar: [],
    quizTraff: 0,
    verktygsVanor: {},
    senasteSida: "",
    lasTillstand: "nybörjare",
    ...over,
  };
}

// ── localStorage-mock (i processen; käll-libens globalThis/window-vakter) ───
const K = {
  medlem: "ak1a-member",
  xp: "ak1a-xp",
  streak: "ak1a-streak",
  klara: "ak1a-klara-kurser",
  karna: "ak1a-elevkarna-v1",
  tracer: "ak1a-tracer-v1",
  nav: "ak1a:navigationsminne",
};

function skapaButik() {
  const data = new Map();
  return {
    getItem(n) {
      return data.has(n) ? data.get(n) : null;
    },
    setItem(n, v) {
      data.set(n, String(v));
    },
    removeItem(n) {
      data.delete(n);
    },
  };
}

function installeraButik(butik) {
  try {
    globalThis.localStorage = butik;
  } catch {
    Object.defineProperty(globalThis, "localStorage", {
      value: butik,
      writable: true,
      configurable: true,
    });
  }
  globalThis.window = { localStorage: butik }; // tracer + navigationsminne läser window.localStorage
}

function avinstalleraButik() {
  delete globalThis.window;
  delete globalThis.localStorage;
}

/** Kör fn med en förögd butik (JSON-värden), återställ alltid SSR-läget. */
function medButik(data, fn) {
  const butik = skapaButik();
  for (const [n, v] of Object.entries(data)) butik.setItem(n, typeof v === "string" ? v : JSON.stringify(v));
  installeraButik(butik);
  try {
    return fn();
  } finally {
    avinstalleraButik();
  }
}

// ══ A. Exporter ═════════════════════════════════════════════════════════════

kontroll("A1 INTRESSE_KURS exporterad som objekt", INTRESSE_KURS !== null && typeof INTRESSE_KURS === "object");
kontroll("A2 toppIntresseUrProfil exporterad som funktion", arFunktion(toppIntresseUrProfil));
kontroll("A3 paborjadKurs exporterad som funktion", arFunktion(paborjadKurs));
kontroll("A4 detekteraLasTillstand exporterad som funktion", arFunktion(detekteraLasTillstand));
kontroll("A5 lasKlientkontext exporterad som funktion", arFunktion(lasKlientkontext));
kontroll("A6 predikteraNastaSteg exporterad som funktion", arFunktion(predikteraNastaSteg));

// ══ B. INTRESSE_KURS — intressespårens flaggskepp ═══════════════════════════

const SPÅR = ["teknisk", "fundamental", "portfölj", "beteende"];
kontroll(
  "B1 exakt fyra spår: teknisk, fundamental, portfölj, beteende",
  Object.keys(INTRESSE_KURS).length === 4 && SPÅR.every((s) => s in INTRESSE_KURS),
);

const formOK = SPÅR.every((s) => {
  const k = INTRESSE_KURS[s];
  return k && ["slug", "titel", "omrade", "ikon", "text"].every((f) => ickeTomStrang(k[f]));
});
kontroll("B2 varje spår: slug/titel/omrade/ikon/text är icke-tomma strängar", formOK);

kontroll(
  "B3 slugs unika över spåren (fyra distinkta kurser)",
  new Set(SPÅR.map((s) => INTRESSE_KURS[s].slug)).size === 4,
);

kontroll(
  "B4 spåren täcker tracerns INTRESSE_NYCKLAR (korsmodul: toppintresset kan alltid slås upp)",
  INTRESSE_NYCKLAR.every((n) => n in INTRESSE_KURS),
  "intresseprofilens nycklar är sanerade till just dessa spår",
);

// ══ C. toppIntresseUrProfil ═════════════════════════════════════════════════

kontroll("C1 tom profil ⇒ null", toppIntresseUrProfil({}) === null);
kontroll("C2 alla poäng noll ⇒ null (bara positiva räknas)", toppIntresseUrProfil({ teknisk: 0, fundamental: 0 }) === null);
kontroll(
  "C3 högsta poängen vinner",
  toppIntresseUrProfil({ teknisk: 2, fundamental: 5, portfölj: 3 }) === "fundamental",
);
kontroll("C4 negativa poäng ⇒ null (aldrig ett toppintresse på minus)", toppIntresseUrProfil({ teknisk: -5 }) === null);
kontroll(
  "C5 oavgjort ⇒ första nyckeln i insättningsordning",
  toppIntresseUrProfil({ teknisk: 3, fundamental: 3 }) === "teknisk",
);
kontroll(
  "C6 godtyckliga nycklar utanför spåren fungerar (ingen nyckelvalidering)",
  toppIntresseUrProfil({ svenska: 2, usa: 7 }) === "usa",
);

// ══ D. paborjadKurs ═════════════════════════════════════════════════════════

kontroll(
  "D1 icke-kurssidor ⇒ null (startsidan, Min Sida, Superanalysen, utan ledande slash, tom)",
  ["/", "/min-sida", "/superanalys", "kurser/xyz", ""].every((s) => paborjadKurs(kontext({ senasteSida: s })) === null),
);

const d2 = paborjadKurs(kontext({ senasteSida: "/kurser/v04-ps" }));
kontroll(
  "D2 enkel kurslug ⇒ { slug, titel, lank } med lank = /kurser/ + slug",
  d2 !== null && d2.slug === "v04-ps" && d2.lank === "/kurser/v04-ps" && ickeTomStrang(d2.titel),
  JSON.stringify(d2),
);

const d3 = paborjadKurs(kontext({ senasteSida: "/kurser/the-intelligent-investor" }));
kontroll(
  "D3 titeln versaliserings per ord (the-intelligent-investor ⇒ The Intelligent Investor)",
  d3 !== null && d3.titel === "The Intelligent Investor",
  JSON.stringify(d3),
);

kontroll(
  "D4 redan klarad kurs ⇒ null",
  paborjadKurs(kontext({ senasteSida: "/kurser/v04-ps", klaraKurser: ["v04-ps"] })) === null,
);

kontroll(
  "D5 kursdjup underväg (innehåller '/') ⇒ null",
  paborjadKurs(kontext({ senasteSida: "/kurser/v04-ps/kapitel-2" })) === null,
);

const d6 = paborjadKurs(kontext({ senasteSida: "/kurser/grundkursen/" }));
kontroll(
  "D6 eftersläpande slash kryps bort ⇒ giltig slug",
  d6 !== null && d6.slug === "grundkursen" && d6.lank === "/kurser/grundkursen",
  JSON.stringify(d6),
);

kontroll(
  "D7 bar /kurser/ (tom slug) och /kurser utan slash ⇒ null",
  paborjadKurs(kontext({ senasteSida: "/kurser/" })) === null && paborjadKurs(kontext({ senasteSida: "/kurser" })) === null,
);

const d8 = paborjadKurs(kontext({ senasteSida: "/kurser/caf%C3%A9-bolag" }));
kontroll(
  "D8 URL-kodad slug avkodas (caf%C3%A9-bolag ⇒ café-bolag, titel Café Bolag)",
  d8 !== null && d8.slug === "café-bolag" && d8.titel === "Café Bolag" && d8.lank === "/kurser/café-bolag",
  JSON.stringify(d8),
);

// ══ E. detekteraLasTillstand — trappan ══════════════════════════════════════

const ELVA = ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "k9", "k10", "k11"];
const TIO = ELVA.slice(0, 10);
const TRE = ELVA.slice(0, 3);
const TVÅ = ELVA.slice(0, 2);

kontroll(
  "E1 nivå 25 ⇒ fas2-redo även med 0 kurser och 0 % träff (nivån dominerar)",
  detekteraLasTillstand(kontext({ niva: 25 })) === "fas2-redo",
);
kontroll(
  "E2 nivå 24 + 11 kurser + 100 % ⇒ avancerad (nivåblocket gäller bara ≥ 25)",
  detekteraLasTillstand(kontext({ niva: 24, klaraKurser: ELVA, quizTraff: 100 })) === "avancerad",
);
kontroll(
  "E3 11 kurser + 71 % ⇒ avancerad",
  detekteraLasTillstand(kontext({ klaraKurser: ELVA, quizTraff: 71 })) === "avancerad",
);
kontroll(
  "E4 11 kurser + 70 % ⇒ växande (träffgränsen är strikt > 70)",
  detekteraLasTillstand(kontext({ klaraKurser: ELVA, quizTraff: 70 })) === "växande",
);
kontroll(
  "E5 10 kurser + 100 % ⇒ växande (antalsgränsen är strikt > 10)",
  detekteraLasTillstand(kontext({ klaraKurser: TIO, quizTraff: 100 })) === "växande",
);
kontroll(
  "E6 exakt 3 kurser ⇒ växande (även med 0 % träff)",
  detekteraLasTillstand(kontext({ klaraKurser: TRE, quizTraff: 0 })) === "växande",
);
kontroll(
  "E7 2 kurser + 59 % ⇒ nybörjare (tunn träff)",
  detekteraLasTillstand(kontext({ klaraKurser: TVÅ, quizTraff: 59 })) === "nybörjare",
);
kontroll(
  "E8 2 kurser + 60 % ⇒ växande (stark träff växer redan — aldrig bristperspektiv)",
  detekteraLasTillstand(kontext({ klaraKurser: TVÅ, quizTraff: 60 })) === "växande",
);
kontroll(
  "E9 nivå 100 + 0 kurser + 0 % ⇒ fas2-redo (nivån alltid först)",
  detekteraLasTillstand(kontext({ niva: 100 })) === "fas2-redo",
);

// ══ F. lasKlientkontext — SSR i ren node (serverkontraktet) ═════════════════

let kSSR;
let kastade = false;
try {
  kSSR = lasKlientkontext();
} catch (e) {
  kastade = true;
  console.error("    ofångat fel från lasKlientkontext i SSR-läge:", e);
}
kontroll(
  "F1 SSR-läge utan fönster/butik ⇒ kraschfri och objekt (aldrig krasch, aldrig nät)",
  !kastade && kSSR !== null && typeof kSSR === "object",
);

const FÄLT = [
  "namn",
  "niva",
  "xp",
  "streak",
  "klaraKurser",
  "mal",
  "intresseProfil",
  "aktivTid",
  "typiskaTimmar",
  "quizTraff",
  "verktygsVanor",
  "senasteSida",
  "lasTillstand",
];
kontroll(
  "F2 exakt 13 namngivna fält — larvag frånvarande (berikas enbart asynkront)",
  lika(Object.keys(kSSR).sort(), [...FÄLT].sort()),
  Object.keys(kSSR).length + " nycklar",
);

kontroll(
  "F3 ny elev: namn null, nivå 1, xp 0, streak 0, klara kurser [], mal null",
  kSSR.namn === null && kSSR.niva === 1 && kSSR.xp === 0 && kSSR.streak === 0 &&
    lika(kSSR.klaraKurser, []) && kSSR.mal === null,
);

kontroll(
  "F4 ny elev: tom tracer (intressen {}, 0 min, inga timmar, 0 %, inga verktyg) och senasteSida \"\"",
  lika(kSSR.intresseProfil, {}) && kSSR.aktivTid === 0 && lika(kSSR.typiskaTimmar, []) &&
    kSSR.quizTraff === 0 && lika(kSSR.verktygsVanor, {}) && kSSR.senasteSida === "",
);

kontroll(
  "F5 lasTillstand härledet till nybörjare (0 kurser + träff under 60)",
  kSSR.lasTillstand === "nybörjare",
);

kontroll(
  "F6 larvag === undefined — ALDRIG gissad lokalt (kärnan bor på servern)",
  kSSR.larvag === undefined,
);

const kSSR2 = lasKlientkontext();
kontroll(
  "F7 determinism + fälttyper: två SSR-anvod strukturellt identiska",
  lika(kSSR, kSSR2) &&
    typeof kSSR.niva === "number" && typeof kSSR.xp === "number" &&
    typeof kSSR.aktivTid === "number" && typeof kSSR.quizTraff === "number" &&
    Array.isArray(kSSR.klaraKurser) && Array.isArray(kSSR.typiskaTimmar) &&
    typeof kSSR.intresseProfil === "object" && typeof kSSR.verktygsVanor === "object",
);

// ══ G. lasKlientkontext — aggregeringen med mockad butik ════════════════════

const g1 = medButik({ [K.medlem]: { id: "u1", email: "x@y.se", namn: "Anna Andersson" } }, () => lasKlientkontext());
kontroll(
  "G1 medlem med namn ⇒ namn vinner över email",
  g1.namn === "Anna Andersson",
);

const g2 = medButik({ [K.medlem]: { id: "u1", email: "anna.b@exempel.se", namn: "" } }, () => lasKlientkontext());
kontroll(
  "G2 tomt namn ⇒ email-prefix före @",
  g2.namn === "anna.b",
);

const g3 = medButik({ [K.xp]: "2500" }, () => lasKlientkontext());
kontroll(
  "G3 xp 2500 ⇒ nivå 26 ⇒ lasTillstand fas2-redo (hela kedjan xp→nivå→tillstånd)",
  g3.xp === 2500 && g3.niva === 26 && g3.lasTillstand === "fas2-redo",
);

const g4 = medButik({ [K.streak]: { antal: 7, basta: 9, senast: "2026-09-19" } }, () => lasKlientkontext());
kontroll(
  "G4 streak ur butiken förs vidare (antal 7)",
  g4.streak === 7,
);

const g5 = medButik(
  { [K.klara]: ["v01-forsaljningstillvaxt", "v02-arr-tillvaxt", "v03-intaktsdiversifiering"] },
  () => lasKlientkontext(),
);
kontroll(
  "G5 klara kurser förs vidare — 3 st ⇒ dessutom lasTillstand växande",
  lika(g5.klaraKurser, ["v01-forsaljningstillvaxt", "v02-arr-tillvaxt", "v03-intaktsdiversifiering"]) &&
    g5.lasTillstand === "växande",
);

const g6 = medButik(
  {
    [K.karna]: {
      mal: "Förstå mina aktier djupare",
      horisontAr: 5,
      intressen: ["Värdeinvestering"],
      tidPerVecka: 120,
      valfard: ["Lugn i beslut"],
      sparad: 1234567890,
    },
  },
  () => lasKlientkontext(),
);
kontroll(
  "G6 huvudmålet ur elevkärnan förs vidare (elevens varför)",
  g6.mal === "Förstå mina aktier djupare",
);

const g7 = medButik(
  {
    [K.tracer]: {
      aktivTid: 3660,
      "quiz ratt": 7,
      "quiz fel": 3,
      typiskaTimmar: [21, 9],
      intresseProfil: { teknisk: 4, fundamental: 2, strunt: 9 },
      verktygsAnvandning: { superanalys: 3, kalkylatorn: 1 },
    },
  },
  () => lasKlientkontext(),
);
kontroll(
  "G7 tracern: 7/3 quiz ⇒ 70 %, 3660 s ⇒ 61 min, timmar sorteras, bara de fyra spåren läcker, verktyg vidare",
  g7.quizTraff === 70 && g7.aktivTid === 61 && lika(g7.typiskaTimmar, [9, 21]) &&
    lika(g7.intresseProfil, { teknisk: 4, fundamental: 2 }) &&
    lika(g7.verktygsVanor, { superanalys: 3, kalkylatorn: 1 }),
);
kontroll(
  "G7b stark träff växer redan: 70 % + 0 kurser ⇒ lasTillstand växande",
  g7.lasTillstand === "växande",
);

const g8 = medButik(
  { [K.nav]: [{ sida: "/min-sida", titel: "Min Sida", tid: 2 }, { sida: "/kurser/v04-ps", titel: "v04 ps", tid: 1 }] },
  () => lasKlientkontext(),
);
kontroll(
  "G8 senasteSida hoppar /min-sida (nyast-först-minne)",
  g8.senasteSida === "/kurser/v04-ps",
);

const g9 = medButik({ [K.nav]: [{ sida: "/min-sida", titel: "Min Sida", tid: 1 }] }, () => lasKlientkontext());
kontroll(
  "G9 minne med enbart /min-sida ⇒ senasteSida \"\" (fallback till tomt)",
  g9.senasteSida === "",
);

const g10 = medButik({ [K.streak]: { antal: 0, basta: 0, senast: "" } }, () =>
  predikteraNastaSteg(lasKlientkontext()),
);
kontroll(
  "G10 integration: riktig kontext med streak 0 ⇒ Dagens Pass-grenen",
  g10.lank === "/dagens-pass" && g10.sakerhet === 88,
  JSON.stringify(g10),
);

// ══ H. predikteraNastaSteg — form + prioriteringskedjan ═════════════════════

const batteri = [
  kontext({ streak: 0 }),
  kontext({}),
  kontext({ quizTraff: 30 }),
  kontext({ senasteSida: "/kurser/v04-ps" }),
  kontext({ intresseProfil: { teknisk: 5 } }),
  kontext({ niva: 25, lasTillstand: "fas2-redo" }),
  kontext({ intresseProfil: { ovanskt: 9 } }),
];
const formfel = [];
for (const [i, k] of batteri.entries()) {
  const s = predikteraNastaSteg(k);
  if (
    !s || lika(Object.keys(s).sort(), ["ikon", "lank", "sakerhet", "suggestion"]) === false ||
    !ickeTomStrang(s.suggestion) || !ickeTomStrang(s.lank) || !ickeTomStrang(s.ikon) ||
    !Number.isInteger(s.sakerhet) || s.sakerhet < 0 || s.sakerhet > 100
  ) {
    formfel.push(i + ": " + JSON.stringify(s));
  }
}
kontroll(
  "H1 returform i hela batteriet: exakt { suggestion, lank, ikon, sakerhet }, icke-tomma strängar, sakerhet heltal 0–100",
  formfel.length === 0,
  formfel.join(" | "),
);

const h2 = predikteraNastaSteg(kontext({ streak: 0 }));
kontroll(
  "H2 gren 1: streak 0 ⇒ Dagens Pass (🔥, 88 %)",
  h2.lank === "/dagens-pass" && h2.ikon === "🔥" && h2.sakerhet === 88 && h2.suggestion.includes("dagens pass"),
  JSON.stringify(h2),
);

const h3 = predikteraNastaSteg(kontext({ streak: -3 }));
kontroll(
  "H3 gren 1: negativ streak räknas som bruten ⇒ Dagens Pass",
  h3.lank === "/dagens-pass" && h3.sakerhet === 88,
);

const h4 = predikteraNastaSteg(kontext({ streak: 0, senasteSida: "/kurser/v04-ps" }));
kontroll(
  "H4 prioritet: streak 0 vinner över påbörjad kurs",
  h4.lank === "/dagens-pass" && h4.sakerhet === 88,
);

const h5 = predikteraNastaSteg(kontext({ streak: 0, quizTraff: 30 }));
kontroll(
  "H5 prioritet: streak 0 vinner över tunn quiz-träff",
  h5.lank === "/dagens-pass" && h5.sakerhet === 88,
);

const h6 = predikteraNastaSteg(kontext({ senasteSida: "/kurser/v04-ps" }));
kontroll(
  "H6 gren 2: påbörjad kurs ⇒ nästa kapitel (📖, 82 %, titeln i förslaget)",
  h6.lank === "/kurser/v04-ps" && h6.ikon === "📖" && h6.sakerhet === 82 && h6.suggestion.includes('"V04 Ps"'),
  JSON.stringify(h6),
);

const h7 = predikteraNastaSteg(kontext({ senasteSida: "/kurser/v04-ps", quizTraff: 30 }));
kontroll(
  "H7 prioritet: påbörjad kurs vinner över tunn quiz-träff",
  h7.lank === "/kurser/v04-ps" && h7.sakerhet === 82,
);

const h8 = predikteraNastaSteg(kontext({ senasteSida: "/kurser/v04-ps", intresseProfil: { teknisk: 5 } }));
kontroll(
  "H8 prioritet: påbörjad kurs vinner över toppintresset",
  h8.lank === "/kurser/v04-ps" && h8.sakerhet === 82,
);

const h9 = predikteraNastaSteg(kontext({ quizTraff: 49 }));
kontroll(
  "H9 gren 3: 0 < träff 49 < 50 ⇒ repetition (🔁, 68 %)",
  h9.lank === "/dagens-pass" && h9.ikon === "🔁" && h9.sakerhet === 68,
);

const h10 = predikteraNastaSteg(kontext({ quizTraff: 50 }));
kontroll(
  "H10 kant: träff exakt 50 ⇒ INTE gren 3 (fäller till fallback V01, 50 %)",
  h10.lank === "/kurser/v01-forsaljningstillvaxt" && h10.sakerhet === 50,
  JSON.stringify(h10),
);

const h11 = predikteraNastaSteg(kontext({ quizTraff: 0 }));
kontroll(
  "H11 kant: träff exakt 0 ⇒ INTE gren 3 (fallback V01, 50 %)",
  h11.lank === "/kurser/v01-forsaljningstillvaxt" && h11.sakerhet === 50,
);

const h12 = predikteraNastaSteg(kontext({ intresseProfil: { teknisk: 5 } }));
kontroll(
  "H12 gren 4: topp teknisk ⇒ AK1TS-flaggskeppet (🌊, 62 %)",
  h12.lank === "/kurser/ak1ts-vaglarans-hierarki" && h12.ikon === "🌊" && h12.sakerhet === 62 &&
    h12.suggestion.includes("AK1TS"),
  JSON.stringify(h12),
);

const h13 = predikteraNastaSteg(kontext({ intresseProfil: { fundamental: 5 }, klaraKurser: ["the-intelligent-investor"] }));
kontroll(
  "H13 gren 4-kant: toppkursen redan klarad ⇒ faller igenom till fallback (V01, 50 %)",
  h13.lank === "/kurser/v01-forsaljningstillvaxt" && h13.sakerhet === 50,
);

const h14 = predikteraNastaSteg(kontext({ intresseProfil: { ovanskt: 9 } }));
kontroll(
  "H14 gren 4-kant: topp utanför INTRESSE_KURS ⇒ vakthandlingen faller vidare utan krasch",
  h14.sakerhet === 50 && h14.lank === "/kurser/v01-forsaljningstillvaxt",
);

const h15 = predikteraNastaSteg(kontext({ niva: 25, lasTillstand: "fas2-redo", intresseProfil: { teknisk: 5 } }));
kontroll(
  "H15 prioritet: toppintresset vinner över fas2-redo",
  h15.lank === "/kurser/ak1ts-vaglarans-hierarki" && h15.sakerhet === 62,
);

const h16 = predikteraNastaSteg(kontext({ niva: 25, lasTillstand: "fas2-redo" }));
kontroll(
  "H16 gren 5: fas2-redo utan intresse/påbörjad/träff ⇒ Fas 2-nudge (🏛️, 55 %)",
  h16.lank === "/fas2-ansok" && h16.ikon === "🏛️" && h16.sakerhet === 55,
);

const h17 = predikteraNastaSteg(kontext({}));
kontroll(
  "H17 fallback: ny elev (streak 1, tomt) ⇒ kurstips V01 (50 %, titeln i förslaget)",
  h17.lank === "/kurser/v01-forsaljningstillvaxt" && h17.sakerhet === 50 &&
    h17.suggestion.includes("Försäljningstillväxt"),
  JSON.stringify(h17),
);

const ALLT_KLARAT = [
  ...V_SPÅR.map((v) => v.slug),
  ...FLAGGSKEPP.map((f) => f.slug),
  ...FORBEREDELSE.map((f) => f.slug),
];
const h18 = medButik(
  {
    [K.klara]: ALLT_KLARAT,
    [K.xp]: "1500",
  },
  () =>
    predikteraNastaSteg(
      kontext({ klaraKurser: ALLT_KLARAT, quizTraff: 100, lasTillstand: "avancerad" }),
    ),
);
kontroll(
  "H18 sista utvägen: ALLT klarat i butiken (spår + flaggskepp + förberedelser) ⇒ biblioteket (🧭, 45 %)",
  h18.lank === "/kurser" && h18.ikon === "🧭" && h18.sakerhet === 45 && h18.suggestion.includes("biblioteket"),
  ALLT_KLARAT.length + " klara slugs; " + JSON.stringify(h18),
);

// ── Slutsummering ──────────────────────────────────────────────────────────

const sek = ((Date.now() - t0) / 1000).toFixed(1);
console.log("Tid: " + sek + " s (" + (pass + fail) + " kontroller)");
console.log("RESULTAT: " + pass + "/" + (pass + fail) + " PASS");
process.exit(fail === 0 ? 0 : 1);
