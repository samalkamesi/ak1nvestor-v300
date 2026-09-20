#!/usr/bin/env node
// KONTRAKTSSVIT — EKO-KOPPLINGEN (våg 213b / u8): motor src/lib/eko-koppling.ts
//
// Kontrakt som testas (lästa ur motorfilen — aldrig påhittade):
//   · renSlugLista(): slug-listsanering — icke-array ⇒ [], trim, svenska
//     tecken åäöÅÄÖ giltiga, charset [a-zA-Z0-9åäöÅÄÖ-], max 80 tecken,
//     icke-strängar hoppas över, taket (max) boundar FÖRE push
//   · lasKlientkontext(): SSR utan window ⇒ gästens form (nivå 1, tomt);
//     med window ⇒ member-local-nycklarna ("ak1a-xp" → niva =
//     floor(xp/100)+1 klamrad 1–100, "ak1a-klara-kurser" → slug-sanering,
//     "ak1a-streak" → { antal } med tak 3650) + tracerns profil flödar in
//     (aktivTid, quiz, intresseProfil, toppIntresse vid oavgjort = första
//     spåret i INTRESSE_NYCKLAR-ordning); portföljfälten lämnas ALLTID
//     tomma av klientläsaren (servern fyller i); trasig JSON ⇒ tyst default
//   · lasPortfoljForMedlem(): fail-safe { antal: 0, sektorer: [] } utan
//     konfig, tomt id, !ok, icke-array-json och fetch-kast; transport-
//     kontraktet under stub: client_portfolios?member_id=eq.<id, max 64,
//     encodeURIComponent>&select=id&order=created_at.desc&limit=1 →
//     client_holdings?portfolio_id=eq.<pid>&select=ticker,sector&limit=50;
//     sektorer unika + gemener + trimmade med tak 24
//   · raknaEkoInsikter(): R1 tracer+kurstips (intresse + noll klarade i
//     spåret; pass-regler ts-/ak1ts, v\d{2}-, pf-/portfolj-, bf-/km-03[5-7];
//     första-kurs-länkarna per spår), R2 vagkarta+portfolj (impulsvågor >
//     korrigeringar + innehav > 0 + ingen värdesektor — substring-matching
//     båda vägar; vågkarta ur system_events.universumSammanfattning med
//     renTal-sanering och summa-vakt, el. signal-regex "N impulsvågor …
//     M korrigeringar"), R3 quiz+veckoplan (träff < 50 % vid underlag ≥ 3;
//     exakt 50 % ⇒ tyst), R4 signal-bus+notiser (SIGNAL_INTRESSE-match mot
//     toppintresset, mottagar-synligheten, extern länk i signalen avvisas
//     redan i bussen ⇒ fallback-dörren /min-sida, ikon från signalen,
//     område beteende/marknad), R5 fas2
//     (nivå ≥ 25 ⇒ nådd prio 1 + länk /fas2-ansok; annars "N kurs/kurser
//     kvar" med prio 1 då stegKvar ≤ 5 el. 4; textens mätare nivå/klara/
//     minuterText "N minuter"/"N timmar"/bredd "av 4 spår"); gästens
//     andning (fyllnad när < 2 insikter); sort prioritet ≤, dedupe på
//     rubrik, ALDRIG kast
//   · raknaKallsystem(): "+ "-split, första förekomst, renStr (trim,
//     kollaps, max 40), null-säker
//   · EKO_FAS2_NIVA === 25
//
// Miljöklass: DETERMINISTISK — Supabase-env stryks FÖRE import (inga skarpa
// anrop kan ske: getSupabaseRest ⇒ null; lasSignaler faller tillbaka på de
// statiska signalerna); transport/E2E-testerna kör en lokal fetch-stub mot
// ogiltig fake-konfig (ekotest-fake.supabase.co + uppdiktad nyckel — nåbar
// endast av stubben, aldrig riktigt nätverk). Ingen server, inga timers som
// överlever processen, inga externa processer.
// Kör: node verktyg/testa-motor-eko-koppling.mjs
// (Node ≥ 22.18: type stripping via _o106-hooken; tsx-återfall fungerar också)
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping (behöver ≥ 22.18).");
  process.exit(1);
}

const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "_o106-ts-import.mjs")).href);
aktiveraTsImport();

// Nätverksfri miljö (organ-bus-precedensen): Supabase-env stryks FÖRE import —
// motor-kärnan ska visa sina graceful-fall mot statiska signaler, aldrig göra
// skarpa anrop. getSupabaseRest läser process.env vid ANROPSTID men stryk-
// ningen står kvar tills transportsektionen medvetet installerar sin fake-konfig.
const ENV_NYCKLAR = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
for (const k of ENV_NYCKLAR) delete process.env[k];

const { renSlugLista, lasKlientkontext, lasPortfoljForMedlem, raknaEkoInsikter, raknaKallsystem, EKO_FAS2_NIVA } =
  await import(pathToFileURL(join(ROT, "src/lib/eko-koppling.ts")).href);

let pass = 0, fail = 0;
const kontroll = (namn, villkor) => {
  if (villkor) { pass++; console.log("  PASS " + namn); }
  else { fail++; console.log("  FAIL " + namn); }
};

// Gästens kontext — motorfilens egen gästform (dokumenterad i gastKontext)
const GAST = {
  niva: 1, klaraKurser: [], streakAntal: 0, aktivTidSek: 0, toppIntresse: null,
  intresseProfil: {}, "quiz ratt": 0, "quiz fel": 0, portfoljAntal: 0, portfoljSektorer: [],
};
// Alla insikter samlas för invariantkontrollen (J) i slutet.
const samlat = [];

// window-stub för D-sektionen (lasKlientkontext är window-vaktad; node har ingen)
function medWindow(store, fn) {
  const forrige = globalThis.window;
  globalThis.window = { localStorage: { getItem: (k) => (k in store ? store[k] : null) } };
  try { return fn(); } finally {
    if (forrige === undefined) delete globalThis.window;
    else globalThis.window = forrige;
  }
}

console.log("A — modulkontraktet: exporterna finns");
kontroll("A1 samtliga fem exporterade funktioner är funktioner",
  [renSlugLista, lasKlientkontext, lasPortfoljForMedlem, raknaEkoInsikter, raknaKallsystem].every((f) => typeof f === "function"));
kontroll("A2 EKO_FAS2_NIVA === 25 (dokumenterad tröskel, speglar fas2Upplast)", EKO_FAS2_NIVA === 25);

console.log("B — renSlugLista: slug-listsanering (ren kärna)");
kontroll("B1 icke-array-indata ⇒ [] (null, undefined, sträng, tal, objekt)",
  [null, undefined, "v01-x", 42, { 0: "v01-x" }].every((v) => renSlugLista(v, 10).length === 0));
kontroll("B2 giltiga slugs passerar ordnat och trimmade",
  JSON.stringify(renSlugLista([" v01-grund ", "ts-02-djup"], 10)) === JSON.stringify(["v01-grund", "ts-02-djup"]));
kontroll("B3 icke-strängar hoppas över (tal, null, objekt, inre array)",
  JSON.stringify(renSlugLista(["v01-x", 42, null, {}, ["v02-y"], true], 10)) === JSON.stringify(["v01-x"]));
kontroll('B4 ogiltiga former sorteras bort ("", "-start", "med mellanrum", "_under", "punkt.kurs", 81 tecken)',
  JSON.stringify(renSlugLista(["", "-start", "med mellanrum", "a_b", "a.b", "a".repeat(81), "v01-ok"], 10)) === JSON.stringify(["v01-ok"]));
kontroll("B5 svenska tecken åäöÅÄÖ är giltiga i slugs",
  JSON.stringify(renSlugLista(["åäö-ÅÄÖ-kurs12"], 10)) === JSON.stringify(["åäö-ÅÄÖ-kurs12"]));
kontroll("B6 taket boundar FÖRE push: fem giltiga med max 3 ⇒ exakt de tre första",
  JSON.stringify(renSlugLista(["a1", "b2", "c3", "d4", "e5"], 3)) === JSON.stringify(["a1", "b2", "c3"]));
kontroll("B7 max 0 ⇒ tom lista (nolltak är respekterat)", renSlugLista(["a1", "b2"], 0).length === 0);

console.log("C — lasKlientkontext i SSR (node utan window): gästens form");
const c1 = lasKlientkontext();
kontroll("C1 gästvärden: nivå 1, tomt överallt, quiz 0/0, portfölj tom",
  c1.niva === 1 && c1.klaraKurser.length === 0 && c1.streakAntal === 0 && c1.aktivTidSek === 0 &&
  c1.toppIntresse === null && Object.keys(c1.intresseProfil).length === 0 &&
  c1["quiz ratt"] === 0 && c1["quiz fel"] === 0 && c1.portfoljAntal === 0 && c1.portfoljSektorer.length === 0);
kontroll("C2 fältuppsättningen är exakt de tio dokumenterade nycklarna",
  JSON.stringify(Object.keys(c1).sort()) === JSON.stringify(
    ["aktivTidSek", "intresseProfil", "klaraKurser", "niva", "portfoljAntal", "portfoljSektorer", "quiz fel", "quiz ratt", "streakAntal", "toppIntresse"]));

console.log("D — lasKlientkontext med lokal profil (window-stub: member-local + tracer)");
kontroll("D1 xp 250 ⇒ nivå 3 (floor(250/100)+1 — speglar nivaFranXP)",
  medWindow({ "ak1a-xp": "250" }, () => lasKlientkontext().niva) === 3);
kontroll("D2 nivå-gränser: 99 ⇒ 1, 100 ⇒ 2, 9900 ⇒ 100, 1e18 ⇒ 100 (klamp 1–100, xp-tak 1e8)",
  medWindow({ "ak1a-xp": "99" }, () => lasKlientkontext().niva) === 1 &&
  medWindow({ "ak1a-xp": "100" }, () => lasKlientkontext().niva) === 2 &&
  medWindow({ "ak1a-xp": "9900" }, () => lasKlientkontext().niva) === 100 &&
  medWindow({ "ak1a-xp": JSON.stringify(1e18) }, () => lasKlientkontext().niva) === 100);
kontroll("D3 trasig/ogatlig xp-json ⇒ tyst nivå 1 (lasJson fångar, renTal nollställer)",
  medWindow({ "ak1a-xp": "{ogiltig json" }, () => lasKlientkontext().niva) === 1 &&
  medWindow({ "ak1a-xp": '"inte ett tal"' }, () => lasKlientkontext().niva) === 1);
kontroll("D4 klara kurser saniteras genom slug-reglerna (trim, svenska tecken, skräp bort)",
  JSON.stringify(medWindow({ "ak1a-klara-kurser": '[" v01-grund ", "med mellanrum", 42, "åäö-kurs"]' },
    () => lasKlientkontext().klaraKurser)) === JSON.stringify(["v01-grund", "åäö-kurs"]));
kontroll("D5 streak: { antal: 12 } ⇒ 12; tal-form ⇒ 0; 'många' ⇒ 0; tak 3650",
  medWindow({ "ak1a-streak": '{"antal": 12}' }, () => lasKlientkontext().streakAntal) === 12 &&
  medWindow({ "ak1a-streak": "7" }, () => lasKlientkontext().streakAntal) === 0 &&
  medWindow({ "ak1a-streak": '{"antal": "många"}' }, () => lasKlientkontext().streakAntal) === 0 &&
  medWindow({ "ak1a-streak": '{"antal": 9999}' }, () => lasKlientkontext().streakAntal) === 3650);
kontroll("D6 tracerns profil flödar in: aktivTid, quiz 8/2, toppintresse fundamental (4 slår 2)",
  (() => {
    const k = medWindow({ "ak1a-tracer-v1": JSON.stringify({ aktivTid: 5400, "quiz ratt": 8, "quiz fel": 2, intresseProfil: { teknisk: 2, fundamental: 4 } }) },
      () => lasKlientkontext());
    return k.aktivTidSek === 5400 && k["quiz ratt"] === 8 && k["quiz fel"] === 2 &&
      k.toppIntresse === "fundamental" && k.intresseProfil.teknisk === 2 && k.intresseProfil.fundamental === 4;
  })());
kontroll("D7 toppintresse vid oavgjort ⇒ första spåret i INTRESSE_NYCKLAR-ordning (teknisk)",
  medWindow({ "ak1a-tracer-v1": JSON.stringify({ intresseProfil: { teknisk: 3, beteende: 3 } }) },
    () => lasKlientkontext().toppIntresse) === "teknisk");
kontroll("D8 portföljfälten lämnas ALLTID tomma av klientläsaren (servern fyller i — främmande nycklar ignoreras)",
  medWindow({ "ak1a-portfolj": '{"antal": 9}', "ak1a-xp": "500" },
    () => { const k = lasKlientkontext(); return k.portfoljAntal === 0 && k.portfoljSektorer.length === 0; }));

console.log("E — lasPortfoljForMedlem: fail-safe utan konfig");
kontroll("E1 utan Supabase-env ⇒ { antal: 0, sektorer: [] } utan kast",
  JSON.stringify(await lasPortfoljForMedlem("u-1")) === JSON.stringify({ antal: 0, sektorer: [] }));
kontroll("E2 tomt memberId ⇒ { antal: 0, sektorer: [] } (renStr tömmer)",
  JSON.stringify(await lasPortfoljForMedlem("   ")) === JSON.stringify({ antal: 0, sektorer: [] }));

console.log("F — raknaEkoInsikter: deterministisk kärna (env borta, statisk andning)");
const f1 = await raknaEkoInsikter(null);
samlat.push(...f1);
kontroll("F1 gäst (null) ⇒ exakt 2: fas2-kvar (prio 4) + eko-koppling-fyllnad (prio 5), sorterad",
  f1.length === 2 && f1[0].kalla === "fas2" && f1[0].prioritet === 4 &&
  f1[0].rubrik.startsWith("Du är 24 kurser från Fas 2-beredskap") &&
  f1[1].kalla === "eko-koppling" && f1[1].prioritet === 5 && f1[1].omrade === "verktyg");
const f2 = await raknaEkoInsikter();
kontroll("F2 utan argument (undefined) ⇒ samma gästläge som null",
  JSON.stringify(f2.map((i) => i.rubrik)) === JSON.stringify(f1.map((i) => i.rubrik)));
kontroll("F3 motorn är aldrig tom: gäst, rik och fientlig kontext ⇒ alla ≥ 1 insikt",
  f1.length >= 1 && f2.length >= 1 &&
  (await raknaEkoInsikter({ ...GAST, toppIntresse: "teknisk", niva: 30 })).length >= 1 &&
  (await raknaEkoInsikter({ ...GAST, "quiz ratt": -5, "quiz fel": -5, niva: 0 })).length >= 1);

const f4 = await raknaEkoInsikter({ ...GAST, toppIntresse: "fundamental" });
samlat.push(...f4);
const f4r1 = f4.find((i) => i.kalla === "tracer+kurstips");
kontroll("F4 R1: toppintresse fundamental + oöppnat spår ⇒ tracer+kurstips, utbildning, prio 2, dörren /kurser/v01-forsaljningstillvaxt",
  f4r1 !== undefined && f4r1.omrade === "utbildning" && f4r1.prioritet === 2 &&
  f4r1.lank === "/kurser/v01-forsaljningstillvaxt" &&
  f4r1.rubrik === "Ditt intresse ligger på fundamental analys — nästa kurs väntar" && f4r1.ikon === "🏛️");
kontroll("F5 R1 blockad: klarad kurs i spåret (v01-…) ⇒ ingen tracer+kurstips",
  (await raknaEkoInsikter({ ...GAST, toppIntresse: "fundamental", klaraKurser: ["v01-forsaljningstillvaxt"] }))
    .every((i) => i.kalla !== "tracer+kurstips"));
kontroll("F6 R1 första-kurs-länkar per spår: teknisk ts-01-elliott-wave, portfölj pf-01-portfoljbyggande, beteende bf-01-tillganglighetsfalla",
  (await Promise.all([
    raknaEkoInsikter({ ...GAST, toppIntresse: "teknisk" }),
    raknaEkoInsikter({ ...GAST, toppIntresse: "portfölj" }),
    raknaEkoInsikter({ ...GAST, toppIntresse: "beteende" }),
  ])).every((r, idx) => {
    samlat.push(...r);
    const r1 = r.find((i) => i.kalla === "tracer+kurstips");
    return r1 !== undefined && r1.lank === ["/kurser/ts-01-elliott-wave", "/kurser/pf-01-portfoljbyggande", "/kurser/bf-01-tillganglighetsfalla"][idx];
  }));
kontroll("F7 R1 pass-regler: ak1ts/ts- blockerar teknisk (ej v01-), v\\d{2}- blockerar fundamental (ej ts-), portfolj- blockerar portfölj, km-036/bf- blockerar beteende (ej km-034-)",
  (await Promise.all([
    raknaEkoInsikter({ ...GAST, toppIntresse: "teknisk", klaraKurser: ["ak1ts-djup"] }),
    raknaEkoInsikter({ ...GAST, toppIntresse: "teknisk", klaraKurser: ["v01-x"] }),
    raknaEkoInsikter({ ...GAST, toppIntresse: "fundamental", klaraKurser: ["v12-kassaflode"] }),
    raknaEkoInsikter({ ...GAST, toppIntresse: "fundamental", klaraKurser: ["ts-01-elliott-wave"] }),
    raknaEkoInsikter({ ...GAST, toppIntresse: "portfölj", klaraKurser: ["portfolj-grund"] }),
    raknaEkoInsikter({ ...GAST, toppIntresse: "beteende", klaraKurser: ["km-036-x"] }),
    raknaEkoInsikter({ ...GAST, toppIntresse: "beteende", klaraKurser: ["km-034-x"] }),
  ])).every((r, idx) => {
    const har = r.some((i) => i.kalla === "tracer+kurstips");
    return idx === 1 || idx === 3 || idx === 6 ? har : !har;
  }));

const f8 = await raknaEkoInsikter({ ...GAST, "quiz ratt": 1, "quiz fel": 3 });
const f8r3 = f8.find((i) => i.kalla === "quiz+veckoplan");
kontroll("F8 R3: quiz 1/4 (25 %) ⇒ quiz+veckoplan, utbildning, prio 2, texten '25 % träff'",
  f8r3 !== undefined && f8r3.omrade === "utbildning" && f8r3.prioritet === 2 &&
  f8r3.lank === "/min-sida" && f8r3.text.includes("25 % träff"));
kontroll("F9 R3-gränser: exakt 50 % (2/2) ⇒ tyst; underlag < 3 (0/2) ⇒ tyst (motorn gissar aldrig); 0/3 ⇒ synlig med '0 % träff'",
  (await raknaEkoInsikter({ ...GAST, "quiz ratt": 2, "quiz fel": 2 })).every((i) => i.kalla !== "quiz+veckoplan") &&
  (await raknaEkoInsikter({ ...GAST, "quiz ratt": 0, "quiz fel": 2 })).every((i) => i.kalla !== "quiz+veckoplan") &&
  (await raknaEkoInsikter({ ...GAST, "quiz ratt": 0, "quiz fel": 3 })).some((i) => i.kalla === "quiz+veckoplan" && i.text.includes("0 % träff")));

const f10 = await Promise.all([
  raknaEkoInsikter({ ...GAST, niva: 25 }),
  raknaEkoInsikter({ ...GAST, niva: 24 }),
  raknaEkoInsikter({ ...GAST, niva: 19 }),
]);
samlat.push(...f10.flat());
kontroll("F10 R5: nivå 25 ⇒ 'Fas 2-beredskapen är nådd' prio 1 + /fas2-ansok; 24 ⇒ '1 kurs' (singular) prio 1; 19 ⇒ '6 kurser' prio 4",
  f10[0].find((i) => i.kalla === "fas2").rubrik === "Fas 2-beredskapen är nådd" &&
  f10[0].find((i) => i.kalla === "fas2").prioritet === 1 && f10[0].find((i) => i.kalla === "fas2").lank === "/fas2-ansok" &&
  f10[1].find((i) => i.kalla === "fas2").rubrik === "Du är 1 kurs från Fas 2-beredskap" &&
  f10[1].find((i) => i.kalla === "fas2").prioritet === 1 &&
  f10[2].find((i) => i.kalla === "fas2").rubrik === "Du är 6 kurser från Fas 2-beredskap" &&
  f10[2].find((i) => i.kalla === "fas2").prioritet === 4);
const f11 = await raknaEkoInsikter({ ...GAST, niva: 10, klaraKurser: ["a1", "b2", "c3"], aktivTidSek: 5400, intresseProfil: { teknisk: 2, skral: 9 } });
const f11t = f11.find((i) => i.kalla === "fas2").text;
kontroll("F11 fas2-textens mätare: 'nivå 10 av 25', '3 klara kurser', '2 timmar aktiv närvaro' (5400 s), '1 av 4 spår' (skräpnycklar räknas ej)",
  f11t.includes("nivå 10 av 25") && f11t.includes("3 klara kurser") && f11t.includes("2 timmar aktiv närvaro") && f11t.includes("1 av 4 spår"));
kontroll("F11b minuterText-gränsen: 1800 s ⇒ '30 minuter aktiv närvaro' (under 60 ⇒ minuter)",
  (await raknaEkoInsikter({ ...GAST, aktivTidSek: 1800 })).find((i) => i.kalla === "fas2").text.includes("30 minuter aktiv närvaro"));
kontroll("F12 R2 kräver vågkarta: utan konfig är kartan saknad ⇒ ingen vagkarta+portfolj ens med 5 innehav utan värdesektorer",
  (await raknaEkoInsikter({ ...GAST, portfoljAntal: 5, portfoljSektorer: ["tech"] }))
    .every((i) => i.kalla !== "vagkarta+portfolj"));
const f13 = await raknaEkoInsikter({ ...GAST, toppIntresse: "fundamental" });
samlat.push(...f13);
const f13r4 = f13.find((i) => i.kalla === "signal-bus+notiser");
kontroll("F13 R4 mot statisk andning: toppintresse fundamental matchas av statiska vagscan-signalen ⇒ marknad, prio 4, 🌊, /vagfundament",
  f13r4 !== undefined && f13r4.omrade === "marknad" && f13r4.prioritet === 4 && f13r4.ikon === "🌊" &&
  f13r4.lank === "/vagfundament" && f13r4.rubrik === "Vågkartan andas varje dag — lyfts fram för din skull" &&
  f13r4.text.includes("Signal-bussen andas"));
kontroll("F14 R4 kräver match: toppintresse teknisk ⇒ tyst (statiska konfluens/netnet är fas2-dolda, tracern admin-dold)",
  (await raknaEkoInsikter({ ...GAST, toppIntresse: "teknisk" })).every((i) => i.kalla !== "signal-bus+notiser"));
kontroll("F15 sortering + dedupe: prioritet-array icke-avtagande, rubriker unika (F4/F13-körningarna)",
  f4.map((i) => i.prioritet).every((p, idx, a) => idx === 0 || a[idx - 1] <= p) &&
  new Set(f13.map((i) => i.rubrik)).size === f13.length);
let f16ok = true;
try {
  const f16 = await raknaEkoInsikter({ ...GAST, niva: 0, streakAntal: -1, aktivTidSek: NaN, intresseProfil: { "@@@": 1e9 }, "quiz ratt": -5, "quiz fel": -5 });
  samlat.push(...f16);
  f16ok = Array.isArray(f16) && f16.length >= 1;
} catch { f16ok = false; }
kontroll("F16 ALDRIG kast: fientlig (men typad) kontext — negativa quiz, nivå 0, NaN-tid, skräp-nycklar ⇒ levererar array", f16ok);

console.log("G — lasPortfoljForMedlem: transportkontrakt under fetch-stub + ogiltig fake-konfig");
const riktigFetch = globalThis.fetch;
let stubAnrop = [];
let stubRutter = {};
const EKO_FAKE_URL = "https://ekotest-fake.supabase.co";
const EKO_FAKE_NYCKEL = "eko-funktionell-testnyckel";
globalThis.fetch = async (url, init) => {
  const u = String(url);
  stubAnrop.push({ url: u, init });
  for (const [nyckel, hanterare] of Object.entries(stubRutter)) {
    if (u.includes(nyckel)) return hanterare(u, init);
  }
  return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
};
process.env.NEXT_PUBLIC_SUPABASE_URL = EKO_FAKE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = EKO_FAKE_NYCKEL;
const svar = (kropp, status = 200) => new Response(JSON.stringify(kropp), { status, headers: { "Content-Type": "application/json" } });

stubRutter = {
  "client_portfolios": () => svar([{ id: "p-9" }]),
  "client_holdings": () => svar([{ ticker: "AAA", sector: "tech" }]),
};
stubAnrop = [];
await lasPortfoljForMedlem("u-123");
kontroll("G1 portfölj-GET: exakt URL member_id=eq.u-123 + select/order/limit=1, apikey-header, cache no-store",
  stubAnrop[0].url === EKO_FAKE_URL + "/rest/v1/client_portfolios?member_id=eq.u-123&select=id&order=created_at.desc&limit=1" &&
  stubAnrop[0].init.headers.apikey === EKO_FAKE_NYCKEL && stubAnrop[0].init.headers.Authorization === "Bearer " + EKO_FAKE_NYCKEL &&
  stubAnrop[0].init.cache === "no-store");
kontroll("G2 holdings-GET efter p-9: portfolio_id=eq.p-9 + select=ticker,sector + limit=50",
  stubAnrop[1] !== undefined && stubAnrop[1].url === EKO_FAKE_URL + "/rest/v1/client_holdings?portfolio_id=eq.p-9&select=ticker,sector&limit=50");

stubRutter["client_holdings"] = () => svar([
  { ticker: "AAA", sector: " Finans " }, { ticker: "BBB", sector: "finans" },
  { ticker: "CCC", sector: "Bank" }, { ticker: "DDD", sector: "  " },
]);
const g3 = await lasPortfoljForMedlem("u-123");
kontroll("G3 sektormappning: antal = 4 rader, sektorer unika+gemener+trimmade ⇒ ['finans','bank'] (tom sektor hoppas)",
  g3.antal === 4 && JSON.stringify(g3.sektorer) === JSON.stringify(["finans", "bank"]));
stubRutter["client_holdings"] = () => svar(Array.from({ length: 30 }, (_, i) => ({ ticker: "T" + i, sector: "sektor-" + i })));
const g4 = await lasPortfoljForMedlem("u-123");
kontroll("G4 sektor-tak 24: 30 unika ⇒ 24 i första-förekomst-ordning ('sektor-0' först, 'sektor-24' saknad)",
  g4.sektorer.length === 24 && g4.sektorer[0] === "sektor-0" && !g4.sektorer.includes("sektor-24"));

stubRutter["client_portfolios"] = () => svar([{}]);
stubAnrop = [];
const g5a = await lasPortfoljForMedlem("u-1");
stubRutter["client_portfolios"] = () => svar([]);
const g5b = await lasPortfoljForMedlem("u-1");
kontroll("G5 portfölj-rad utan giltigt id ({} och []) ⇒ { 0, [] } och INGET holdings-anrop (1 anrop per körning)",
  JSON.stringify(g5a) === JSON.stringify({ antal: 0, sektorer: [] }) &&
  JSON.stringify(g5b) === JSON.stringify({ antal: 0, sektorer: [] }) && stubAnrop.length === 2 &&
  stubAnrop.every((a) => !a.url.includes("client_holdings")));
stubRutter["client_portfolios"] = () => svar([{ id: "p-1" }]);
stubRutter["client_holdings"] = () => svar({ inte: "en array" });
kontroll("G6 holdings-svar utan array-form ⇒ { 0, [] } (array-vakten)",
  JSON.stringify(await lasPortfoljForMedlem("u-1")) === JSON.stringify({ antal: 0, sektorer: [] }));
stubRutter["client_portfolios"] = () => svar({ error: "autentisering" }, 401);
kontroll("G7 !res.ok (401) ⇒ { 0, [] } utan kast",
  JSON.stringify(await lasPortfoljForMedlem("u-1")) === JSON.stringify({ antal: 0, sektorer: [] }));
stubRutter["client_portfolios"] = () => { throw new Error("nätverksfel"); };
kontroll("G8 fetch kastar ⇒ tyst fångst ⇒ { 0, [] }",
  JSON.stringify(await lasPortfoljForMedlem("u-1")) === JSON.stringify({ antal: 0, sektorer: [] }));
stubRutter["client_portfolios"] = () => svar([{ id: "p-9" }]);
stubAnrop = [];
await lasPortfoljForMedlem("u".repeat(70));
kontroll("G9 memberId längre än 64 ⇒ trunkeras till 64 tecken i URL:en (renStr-tak)",
  stubAnrop[0].url.includes("member_id=eq." + "u".repeat(64)) && !stubAnrop[0].url.includes("u".repeat(65)));
stubAnrop = [];
await lasPortfoljForMedlem("a&?b");
kontroll("G10 memberId specialtecken ⇒ encodeURIComponent i URL:en ('a%26%3Fb')",
  stubAnrop[0].url.includes("client_portfolios?member_id=eq.a%26%3Fb&"));

console.log("H — raknaEkoInsikter E2E under stub: vågkarta (system_events) + signal-bussen");
const iso = new Date().toISOString();
let vagscanRad = [];
let signalRader = [];
stubRutter = {
  "client_portfolios": () => svar([{ id: "p-9" }]),
  "client_holdings": () => svar([]),
  "system_events?type=eq.vagscan": () => svar(vagscanRad),
  "system_events?type=eq.signal": () => svar(signalRader),
};
const universum = (impulsvag, korrigering) => [{
  details: { universumSammanfattning: { impulsvag, korrigering, basbygge: 0, osatt: 0 } },
  created_at: iso,
}];
const signalRad = (d) => [{ details: d, created_at: iso }];

vagscanRad = universum(206, 84);
signalRader = [];
const h1 = await raknaEkoInsikter({ ...GAST, niva: 5, portfoljAntal: 3, portfoljSektorer: ["tech"] });
samlat.push(...h1);
const h1r2 = h1.find((i) => i.kalla === "vagkarta+portfolj");
kontroll("H1 R2 positiv: 206 impulsvågor mot 84 + 3 innehav utan värdesektorer ⇒ marknad, prio 3, /min-portfolj, texten räknar 206/84 + '3 innehav'",
  h1r2 !== undefined && h1r2.omrade === "marknad" && h1r2.prioritet === 3 && h1r2.lank === "/min-portfolj" &&
  h1r2.text.includes("206 impulsvågor mot 84 korrigeringar") && h1r2.text.includes("Din portfölj (3 innehav)"));
kontroll("H2 värdesektor-blockaden: 'finans' (exakt), 'storbank' (sek innehåller bank), 'ban' (bank innehåller sek) ⇒ tyst; ['tech','healthcare'] ⇒ synlig",
  (await Promise.all([
    raknaEkoInsikter({ ...GAST, portfoljAntal: 2, portfoljSektorer: ["finans"] }),
    raknaEkoInsikter({ ...GAST, portfoljAntal: 2, portfoljSektorer: ["storbank"] }),
    raknaEkoInsikter({ ...GAST, portfoljAntal: 2, portfoljSektorer: ["ban"] }),
    raknaEkoInsikter({ ...GAST, portfoljAntal: 2, portfoljSektorer: ["tech", "healthcare"] }),
  ])).every((r, idx) => {
    const har = r.some((i) => i.kalla === "vagkarta+portfolj");
    return idx === 3 ? har : !har;
  }));
vagscanRad = universum(84, 206);
kontroll("H3 R2-grindarna: impulsvågor 84 < korrigeringar 206 ⇒ tyst; portfoljAntal 0 ⇒ tyst",
  (await raknaEkoInsikter({ ...GAST, portfoljAntal: 3, portfoljSektorer: ["tech"] })).every((i) => i.kalla !== "vagkarta+portfolj") &&
  (await raknaEkoInsikter({ ...GAST, portfoljAntal: 0, portfoljSektorer: [] })).every((i) => i.kalla !== "vagkarta+portfolj"));

vagscanRad = [];
signalRader = signalRad({ id: "s1", kalla: "vagscan", typ: "info", rubrik: "Dagens vågkarta är ritad", text: "Vågkartan andas: 12 impulsvågor mot 5 korrigeringar och 2 basbyggen över 30 bolag", ikon: "🌊", mottagare: "alla" });
const h4 = await raknaEkoInsikter({ ...GAST, portfoljAntal: 3, portfoljSektorer: ["tech"] });
const h4r2 = h4.find((i) => i.kalla === "vagkarta+portfolj");
kontroll("H4 vågkartans signal-fallback: system_events-rad utan universum ⇒ regex ur vagscan-signalen '12 impulsvågor mot 5 korrigeringar'",
  h4r2 !== undefined && h4r2.text.includes("12 impulsvågor mot 5 korrigeringar"));
vagscanRad = universum("206", 84);
const h5a = await raknaEkoInsikter({ ...GAST, portfoljAntal: 3, portfoljSektorer: ["tech"] });
kontroll("H5a universum-sanering: impulsvag som talsträng '206' accepteras av renTal ⇒ R2 med 206",
  h5a.some((i) => i.kalla === "vagkarta+portfolj" && i.text.includes("206 impulsvågor")));
vagscanRad = universum(-50, 84);
kontroll("H5b negativ impulsvag ⇒ renTal nollställer ⇒ ingen R2",
  (await raknaEkoInsikter({ ...GAST, portfoljAntal: 3, portfoljSektorer: ["tech"] })).every((i) => i.kalla !== "vagkarta+portfolj"));
vagscanRad = universum(0, 0);
signalRader = [];
kontroll("H6 summa-vakt: universum 0/0 lämnas aldrig ⇒ fallback utan match ⇒ ingen R2",
  (await raknaEkoInsikter({ ...GAST, portfoljAntal: 3, portfoljSektorer: ["tech"] })).every((i) => i.kalla !== "vagkarta+portfolj"));

vagscanRad = universum(206, 84);
signalRader = signalRad({ id: "k1", kalla: "konfluens", typ: "mojlighet", rubrik: "Konfluensträff: X", text: "T".repeat(300), ikon: "🎯", lank: "https://evil.example", mottagare: "alla" });
const h7 = await raknaEkoInsikter({ ...GAST, toppIntresse: "teknisk" });
samlat.push(...h7);
const h7r4 = h7.find((i) => i.kalla === "signal-bus+notiser");
kontroll("H7 R4 E2E: konfluens-signal matchar teknisk ⇒ signalens rubrik+🎯; text trunkeras vid 220; signalens EXTERNA länk avvisas redan i bussen ⇒ insikten får fallback-dörren /min-sida (aldrig extern)",
  h7r4 !== undefined && h7r4.rubrik === "Konfluensträff: X — lyfts fram för din skull" && h7r4.ikon === "🎯" &&
  h7r4.text.includes("T".repeat(220)) && !h7r4.text.includes("T".repeat(221)) && h7r4.lank === "/min-sida");
signalRader = signalRad({ id: "k2", kalla: "konfluens", typ: "mojlighet", rubrik: "Dold", text: "x", ikon: "🎯", mottagare: "fas2" });
kontroll("H8 mottagar-synlighet: konfluens-signal med mottagare fas2 dold för 'alla' ⇒ ingen R4 (rader lästa men filtrerade)",
  (await raknaEkoInsikter({ ...GAST, toppIntresse: "teknisk" })).every((i) => i.kalla !== "signal-bus+notiser"));
signalRader = [
  { details: { id: "t1", kalla: "tracer", typ: "info", rubrik: "Tracern ser ett mönster", text: "x", ikon: "🔭", mottagare: "alla" }, created_at: iso },
  { details: { id: "v1", kalla: "vagscan", typ: "info", rubrik: "Vågkort", text: "y", ikon: "🌊", mottagare: "alla" }, created_at: iso },
];
const h9 = await raknaEkoInsikter({ ...GAST, toppIntresse: "beteende" });
samlat.push(...h9);
kontroll("H9 R4-området: tracer-signal + toppintresse beteende ⇒ område 'beteende'; vagscan-signal + fundamental ⇒ 'marknad'",
  h9.find((i) => i.kalla === "signal-bus+notiser")?.omrade === "beteende" &&
  (await raknaEkoInsikter({ ...GAST, toppIntresse: "fundamental" })).find((i) => i.kalla === "signal-bus+notiser")?.omrade === "marknad");

// Stubben rivs: env stryks igen, riktiga fetch återställs — resten är rena funktioner.
globalThis.fetch = riktigFetch;
for (const k of ENV_NYCKLAR) delete process.env[k];

console.log("I — raknaKallsystem: källsystem-urval (ren funktion)");
kontroll("I1 '+ '-split med dedupe i första förekomst: tracer+kurstips, vagkarta+portfolj, fas2 ⇒ fem namn i ordning",
  JSON.stringify(raknaKallsystem([{ kalla: "tracer+kurstips" }, { kalla: "vagkarta+portfolj" }, { kalla: "fas2" }])) ===
  JSON.stringify(["tracer", "kurstips", "vagkarta", "portfolj", "fas2"]));
kontroll("I2 null och undefined ⇒ [] (null-säker)",
  raknaKallsystem(null).length === 0 && raknaKallsystem(undefined).length === 0);
kontroll("I3 tomma/skräp-källor hoppas över: '', '   ', '+++', saknad kalla ⇒ []",
  JSON.stringify(raknaKallsystem([{ kalla: "" }, { kalla: "+++" }, { kalla: "   " }, {}])) === JSON.stringify([]));
kontroll("I4 mellanslag kollapsas: 'a  +  b' ⇒ ['a','b'] (renStr runt varje del)",
  JSON.stringify(raknaKallsystem([{ kalla: "a  +  b" }])) === JSON.stringify(["a", "b"]));
kontroll("I5 käll-del längre än 40 tecken trunkeras (renStr-tak)",
  raknaKallsystem([{ kalla: "x".repeat(45) }])[0] === "x".repeat(40));

console.log("J — EkoInsikt-invarianter över alla körningar (" + samlat.length + " insikter)");
const OMRADE = ["utbildning", "verktyg", "beteende", "marknad", "fas2"];
kontroll("J1 varje insikt: område ∈ vokabulären, strängfält icke-tomma, prioritet heltal 1–5",
  samlat.every((i) => OMRADE.includes(i.omrade) &&
    typeof i.rubrik === "string" && i.rubrik.length > 0 &&
    typeof i.text === "string" && i.text.length > 0 &&
    typeof i.kalla === "string" && i.kalla.length > 0 &&
    typeof i.ikon === "string" && i.ikon.length > 0 &&
    Number.isInteger(i.prioritet) && i.prioritet >= 1 && i.prioritet <= 5));
kontroll("J2 länkar endast interna relativa: börjar på '/', aldrig '//', ≤ 200 tecken — annars saknas nyckeln",
  samlat.every((i) => i.lank === undefined ||
    (i.lank.startsWith("/") && !i.lank.startsWith("//") && i.lank.length <= 200)));

console.log("RESULTAT: " + pass + "/" + (pass + fail) + " PASS");
process.exit(fail === 0 ? 0 : 1);
