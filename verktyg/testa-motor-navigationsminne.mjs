/**
 * TESTA MOTOR — NAVIGATIONSMINNE (v213b-u7, fabriksvåg: 10 otestade motorer).
 *
 * Kör:  node verktyg/testa-motor-navigationsminne.mjs
 *       (node v22.23.2 tolkar .ts-importen direkt; fungerar det inte i en
 *       framtida miljö: npx --yes tsx verktyg/testa-motor-navigationsminne.mjs —
 *       ERR_MODULE_NOT_FOUND på .ts-import är VÄNTAT, se verktyg/kor-alla-tester.mjs R107.)
 *
 * Kontraktssvit för src/lib/navigationsminne.ts — BARA rena kontrakt:
 *   A  Exporter           — registreraBesok, besok, titelFranSida
 *   B  Fönsterlös grundform — SSR-vakten: besok() → [] utan window,
 *                             registreraBesok kastar inte (tyst fail-safe),
 *                             titelFranSina är rent fönsterlöst
 *   C  Kända titlar       — alla 22 tabelltitlar exakt
 *   D  Derivat & okända   — /kurser/* och /blogg/* (bindestreck→mellanslag,
 *                             %-avkodning), okända sökvägar orörda,
 *                             prefixliknande utan slash, tomma prefix-rester
 *   E  registreraBesok    — given titel, titelFranSida-fallback, tid ≈ nu,
 *                             nyast först, dubblett djupare i listan flyttas
 *                             upp, direkt upprepning = no-op (tid oförändrad),
 *                             tom/undefined sida = no-op utan kast
 *   F  MAX_BESOK          — 30 registreringar ⇒ exakt 24 kvar, de äldsta
 *                             kapade, [0] = senaste, formkorrekt
 *   G  Butiksform         — exakt en nyckel "ak1a:navigationsminne",
 *                             råvärdet JSON-array med exakt sida/titel/tid
 *   H  Fail-safe          — korrupt JSON → [], kastande butik → [] utan kast
 *                             (både läs och skriv), återhämtning efter korrupt
 *                             data, samt två ÄRLIGA KANTFYND: sådd "null"
 *                             respektive icke-array bryter besok():s
 *                             Besok[]-returtypslöfte (rapporteras, src orörd)
 *   I  Fönster återborttaget + determinism
 *
 * Deterministisk: INGEN server, INGET nätverk, INGEN prod, INGA
 * miljöberoenden. window.localStorage mockas i processen med en enkel
 * Map-butik (motorn rör globalThis endast inuti funktionerna) — ingen disk,
 * inga data/-filer rörs. Riktiga DOM-/window-funktioner utöver localStorage
 * finns inte i motorn och testas därmed inte.
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

let motor;
try {
  motor = await import(pathToFileURL(join(ROT, "src/lib/navigationsminne.ts")).href);
} catch (e) {
  console.error(
    "FEL: import av src/lib/navigationsminne.ts misslyckades — .ts-import kräver tsx; " +
      "kör sviten med: npx --yes tsx verktyg/testa-motor-navigationsminne.mjs",
  );
  console.error(e); // rå fel bevarar ERR_MODULE_NOT_FOUND-markören för aggregatorns tsx-återfall
  process.exit(1);
}

const { registreraBesok, besok, titelFranSida } = motor;

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

// ── window.localStorage-mock (i processen; motorn läser window i funktionerna)
const NYCKEL = "ak1a:navigationsminne";

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
    antal() {
      return data.size;
    },
    nycklar() {
      return [...data.keys()];
    },
    rå(n) {
      return data.has(n) ? data.get(n) : null;
    },
  };
}

function kastandeButik() {
  const kasta = () => {
    throw new Error("butiken otillgänglig (kvot/åtkomst)");
  };
  return { getItem: kasta, setItem: kasta, removeItem: kasta };
}

function sättFönster(butik) {
  globalThis.window = { localStorage: butik };
}

function taBortFönster() {
  delete globalThis.window;
}

function kastaInte(fn) {
  try {
    fn();
    return { ok: true };
  } catch (e) {
    return { ok: false, fel: e && e.message ? e.message : String(e) };
  }
}

// ── FALL A: Exporter ────────────────────────────────────────────────────────

kontroll(
  "A1 modulen exporterar registreraBesok, besok, titelFranSida som funktioner",
  [registreraBesok, besok, titelFranSida].every((f) => typeof f === "function"),
);

// ── FALL B: Fönsterlös grundform (körs FÖRE någon mock — node har ingen window)
kontroll(
  "B1 utan window ⇒ besok() returnerar exakt [] (SSR-vakten)",
  Array.isArray(besok()) && besok().length === 0,
  "typeof window === " + '"' + typeof window + '"',
);

{
  const r = kastaInte(() => registreraBesok("/kurser", "Kurser"));
  kontroll(
    "B2 utan window ⇒ registreraBesok kastar inte (spara sväljer felet tyst)",
    r.ok,
    r.ok ? "" : "kast: " + r.fel,
  );
}

kontroll(
  "B3 utan window ⇒ besok() fortfarande [] efter misslyckad registrering",
  Array.isArray(besok()) && besok().length === 0,
);

kontroll(
  "B4 titelFranSida är fönsterlöst rent kontrakt: /kurser → Alla kurser",
  titelFranSida("/kurser") === "Alla kurser",
);

// ── FALL C: Kända titlar — hela tabellen ur källkoden ───────────────────────

const KÄNDA = {
  "/": "Startsidan",
  "/manifest": "Manifestet",
  "/laroplan": "Läroplanen",
  "/kurser": "Alla kurser",
  "/bibliotek": "Biblioteket",
  "/certifikat": "Certifikat",
  "/kalkylator": "AKM1-kalkylatorn",
  "/superanalys": "Superanalysen",
  "/min-portfolj": "Min portfölj",
  "/analyser": "Analyser",
  "/diagnos": "AI-Diagnos",
  "/labb": "Labbar",
  "/min-sida": "Min Sida",
  "/dagens-pass": "Dagens Pass",
  "/topplista": "Topplistan",
  "/badges": "Badges & meriter",
  "/fas2-ansok": "Fas 2-ansökan",
  "/medlemskap": "Medlemskap",
  "/blogg": "Bloggen",
  "/om-oss": "Om oss",
  "/logga-in": "Logga in",
  "/profil": "Kognitiv profil",
};

{
  const fel = Object.entries(KÄNDA)
    .filter(([sida, titel]) => titelFranSida(sida) !== titel)
    .map(([sida, titel]) => sida + " → " + JSON.stringify(titelFranSida(sida)) + " (väntat " + JSON.stringify(titel) + ")");
  kontroll(
    "C1 alla " + Object.keys(KÄNDA).length + " kända sökvägar ger exakt tabelltiteln",
    fel.length === 0,
    fel.join("; "),
  );
}

// ── FALL D: Derivat och okända sökvägar ─────────────────────────────────────

kontroll(
  "D1 /kurser/mera-for-miljarder → mera for miljarder (bindestreck→mellanslag)",
  titelFranSida("/kurser/mera-for-miljarder") === "mera for miljarder",
  JSON.stringify(titelFranSida("/kurser/mera-for-miljarder")),
);

kontroll(
  "D2 /kurser/kassaflodesanalys-101 → kassaflodesanalys 101 (flera bindestreck)",
  titelFranSida("/kurser/kassaflodesanalys-101") === "kassaflodesanalys 101",
  JSON.stringify(titelFranSida("/kurser/kassaflodesanalys-101")),
);

kontroll(
  "D3 /kurser/%C3%B6vningar-i-fonder → övningar i fonder (%-avkodad åäö)",
  titelFranSida("/kurser/%C3%B6vningar-i-fonder") === "övningar i fonder",
  JSON.stringify(titelFranSida("/kurser/%C3%B6vningar-i-fonder")),
);

kontroll(
  "D4 /blogg/valpokuten → Blogg: valpokuten",
  titelFranSida("/blogg/valpokuten") === "Blogg: valpokuten",
  JSON.stringify(titelFranSida("/blogg/valpokuten")),
);

kontroll(
  "D5 /blogg/det-stora-bankraaset → Blogg: det stora bankraaset",
  titelFranSida("/blogg/det-stora-bankraaset") === "Blogg: det stora bankraaset",
  JSON.stringify(titelFranSida("/blogg/det-stora-bankraaset")),
);

kontroll(
  "D6 /blogg/%C3%A5rsvinst → Blogg: årsvinst (%-avkodad å; ä täcks av D3)",
  titelFranSida("/blogg/%C3%A5rsvinst") === "Blogg: årsvinst",
  JSON.stringify(titelFranSida("/blogg/%C3%A5rsvinst")),
);

kontroll(
  "D7 okänd /xyz/abc returneras oförändrad",
  titelFranSida("/xyz/abc") === "/xyz/abc",
  JSON.stringify(titelFranSida("/xyz/abc")),
);

kontroll(
  "D8 prefixliknande utan slash (/kurserxyz) röras inte — startsWith(«/kurser/») är falskt",
  titelFranSida("/kurserxyz") === "/kurserxyz",
  JSON.stringify(titelFranSida("/kurserxyz")),
);

kontroll(
  "D9 kant /kurser/ → tom rest efter prefix ger exakt \"\" (dokumenterat faktiskt beteende)",
  titelFranSida("/kurser/") === "",
  JSON.stringify(titelFranSida("/kurser/")),
);

kontroll(
  "D10 kant /blogg/ → exakt \"Blogg: \" (dokumenterat faktiskt beteende)",
  titelFranSida("/blogg/") === "Blogg: ",
  JSON.stringify(titelFranSida("/blogg/")),
);

{
  const r = kastaInte(() => titelFranSida("/kurser/100%"));
  kontroll(
    "D11 ogiltig %-kodning (/kurser/100%) sväljs utan kast — P8-andan för ogiltiga indata",
    r.ok,
    r.ok ? "" : "kast URIError: " + r.fel + " (decodeURIComponent utan try/catch — rot: titelFranSida)",
  );
}

// ── FALL E: registreraBesok grundform (med fönster-mock) ────────────────────

{
  const b = skapaButik();
  sättFönster(b);
  registreraBesok("/kurser/mera-for-miljarder", "Mera för miljarder");
  const lista = besok();
  kontroll(
    "E1 given titel används exakt: [0].titel, [0].sida",
    lista.length === 1 &&
      lista[0].sida === "/kurser/mera-for-miljarder" &&
      lista[0].titel === "Mera för miljarder",
    JSON.stringify(lista[0]),
  );
}

{
  const b = skapaButik();
  sättFönster(b);
  registreraBesok("/kurser");
  kontroll(
    "E2 utan titel ⇒ titelFranSida-fallback (/kurser → Alla kurser)",
    besok()[0].titel === "Alla kurser",
    JSON.stringify(besok()[0]),
  );
}

{
  const b = skapaButik();
  sättFönster(b);
  const tFöre = Date.now();
  registreraBesok("/labb");
  const post = besok()[0];
  const tEfter = Date.now();
  kontroll(
    "E3 tid är number inom nu-fönstret (Date.now() vid registreringen)",
    typeof post.tid === "number" && post.tid >= tFöre && post.tid <= tEfter,
    "tid=" + post.tid + " fönster " + tFöre + "–" + tEfter,
  );
}

{
  const b = skapaButik();
  sättFönster(b);
  registreraBesok("/a", "A");
  registreraBesok("/b", "B");
  registreraBesok("/c", "C");
  kontroll(
    "E4 nyast först: A,B,C ⇒ exakt [C,B,A]",
    JSON.stringify(besok().map((x) => x.sida)) === JSON.stringify(["/c", "/b", "/a"]),
    JSON.stringify(besok().map((x) => x.sida)),
  );
}

{
  const b = skapaButik();
  sättFönster(b);
  registreraBesok("/a", "A");
  registreraBesok("/b", "B");
  registreraBesok("/a", "A igen");
  const lista = besok();
  kontroll(
    "E5 dubblett djupare i listan flyttas upp (ej duplicerad): A,B,A ⇒ [/a,/b]",
    lista.length === 2 && lista[0].sida === "/a" && lista[1].sida === "/b",
    JSON.stringify(lista.map((x) => x.sida)),
  );
  kontroll(
    "E5b flyttad dubblett får ny tid och angiven titel",
    lista[0].titel === "A igen" && typeof lista[0].tid === "number",
    JSON.stringify(lista[0]),
  );
}

{
  const b = skapaButik();
  sättFönster(b);
  registreraBesok("/a", "A");
  const tid1 = besok()[0].tid;
  registreraBesok("/a", "A");
  const lista = besok();
  kontroll(
    "E6 direkt upprepning (samma sida som [0]) är no-op: längd 1, tid OFÖRÄNDRAD",
    lista.length === 1 && lista[0].tid === tid1,
    "längd=" + lista.length + " tid=" + lista[0].tid + " (tid1=" + tid1 + ")",
  );
}

{
  const b = skapaButik();
  sättFönster(b);
  registreraBesok("/a", "A");
  const r1 = kastaInte(() => registreraBesok(""));
  const r2 = kastaInte(() => registreraBesok(undefined));
  kontroll(
    "E7 tom sträng och undefined sida ⇒ no-op utan kast, listan orörd",
    r1.ok && r2.ok && besok().length === 1 && besok()[0].sida === "/a",
    r1.ok && r2.ok ? "" : "kast: " + (r1.fel || r2.fel),
  );
}

// ── FALL F: MAX_BESOK-trunkering (24) ───────────────────────────────────────

{
  const b = skapaButik();
  sättFönster(b);
  for (let i = 1; i <= 30; i++) {
    registreraBesok("/s" + String(i).padStart(2, "0"));
  }
  const lista = besok();
  kontroll(
    "F1 30 registreringar ⇒ exakt 24 kvar i minnet (MAX_BESOK-trunkering)",
    lista.length === 24,
    "längd=" + lista.length,
  );
  kontroll(
    "F2 [0] = senaste (s30) och [23] = s7 — de 6 äldsta (s1–s6) kapade",
    lista[0].sida === "/s30" && lista[23].sida === "/s07",
    "[0]=" + lista[0].sida + " [23]=" + lista[23].sida,
  );
  const formOK = lista.every(
    (x) =>
      typeof x.sida === "string" &&
      typeof x.titel === "string" &&
      typeof x.tid === "number",
  );
  const unika = new Set(lista.map((x) => x.sida)).size === 24;
  kontroll(
    "F3 alla 24 är formkorrekta Besok och sidorna unika",
    formOK && unika,
    "formOK=" + formOK + " unika=" + unika,
  );
  kontroll(
    "F4 hela listan i strikt omvänd registreringsordning s30…s07",
    lista.every((x, i) => x.sida === "/s" + String(30 - i).padStart(2, "0")),
    lista.map((x) => x.sida).slice(0, 3).join(",") + " …",
  );
}

// ── FALL G: Butiksform — nyckel och råformat ────────────────────────────────

{
  const b = skapaButik();
  sättFönster(b);
  registreraBesok("/kurser", "Alla kurser");
  registreraBesok("/labb");
  kontroll(
    "G1 exakt en nyckel i butiken med namnet ak1a:navigationsminne",
    b.antal() === 1 && b.nycklar()[0] === NYCKEL,
    JSON.stringify(b.nycklar()),
  );
  let rå = b.rå(NYCKEL);
  let parse = null;
  try {
    parse = JSON.parse(rå);
  } catch {
    parse = null;
  }
  const fältOK =
    Array.isArray(parse) &&
    parse.every(
      (x) =>
        x !== null &&
        typeof x === "object" &&
        Object.keys(x).sort().join(",") === "sida,tid,titel",
    );
  kontroll(
    "G2 råvärdet är JSON-array med exakt fälten sida/titel/tid (inga extrafält)",
    typeof rå === "string" && fältOK,
    "rå=" + (typeof rå === "string" ? rå.slice(0, 80) : rå),
  );
}

// ── FALL H: Fail-safe mot trasig och fientlig butik ─────────────────────────

{
  const b = skapaButik();
  b.setItem(NYCKEL, "{trasigt json");
  sättFönster(b);
  kontroll(
    "H1 korrupt JSON i butiken ⇒ besok() → [] (catch-grenen i las)",
    Array.isArray(besok()) && besok().length === 0,
    JSON.stringify(besok()),
  );

  registreraBesok("/kurser");
  kontroll(
    "H2 återhämtning: registrering efter korrupt data skriver över och fungerar",
    besok().length === 1 && besok()[0].sida === "/kurser",
    JSON.stringify(besok()),
  );
}

{
  sättFönster(kastandeButik());
  kontroll(
    "H3 kastande butik ⇒ besok() → [] utan kast (läs-fail-safe)",
    Array.isArray(besok()) && besok().length === 0,
  );
  const r = kastaInte(() => registreraBesok("/kurser"));
  kontroll(
    "H4 kastande butik ⇒ registreraBesok utan kast (skriv-fail-safe, privat läge)",
    r.ok,
    r.ok ? "" : "kast: " + r.fel,
  );
}

{
  // ÄRLIGT RÖTT — kantfynd 1: sådd "null" (giltig JSON, fel typ) i butiken.
  // las(): rå ? JSON.parse(rå) : [] — "null" är truthy, parse ger null som
  // returneras rakt av. Returtypslöftet Besok[] i signaturen bryts.
  const b = skapaButik();
  b.setItem(NYCKEL, "null");
  sättFönster(b);
  const res = besok();
  kontroll(
    "H5 sådd \"null\" i butiken ⇒ besok() håller Besok[]-löftet (väntar array)",
    Array.isArray(res),
    "fick: " + (Array.isArray(res) ? "array" : JSON.stringify(res)) +
      " — rot: las() returnerar JSON.parse(rå) okontrollerat när rå är truthy",
  );

  // ÄRLIGT RÖTT — samma rot, andra typen: icke-array-objekt.
  const b2 = skapaButik();
  b2.setItem(NYCKEL, '{"sida":"/x","titel":"t","tid":1}');
  sättFönster(b2);
  const res2 = besok();
  kontroll(
    "H6 sått icke-array-objekt ⇒ besok() håller Besok[]-löftet (väntar array)",
    Array.isArray(res2),
    "fick: " + (Array.isArray(res2) ? "array" : JSON.stringify(res2)) +
      " — samma rot som H5",
  );
}

// ── FALL I: Fönster borttaget igen + determinism ────────────────────────────

{
  const b = skapaButik();
  sättFönster(b);
  registreraBesok("/kurser");
  taBortFönster();
  kontroll(
    "I1 window borttagen efter data ⇒ besok() → [] (SSR-vakten igen)",
    Array.isArray(besok()) && besok().length === 0,
  );
}

{
  const sekvens = (b) => {
    sättFönster(b);
    registreraBesok("/kurser", "Kurser");
    registreraBesok("/blogg");
    registreraBesok("/kurser", "Kurser");
    registreraBesok("/labb");
    return besok().map(({ sida, titel }) => ({ sida, titel }));
  };
  const b1 = skapaButik();
  const b2 = skapaButik();
  kontroll(
    "I2 determinism: identisk sekvens på två färska butiker ⇒ identiskt minne (sida+titel)",
    JSON.stringify(sekvens(b1)) === JSON.stringify(sekvens(b2)),
    JSON.stringify(sekvens(b1)),
  );
}

// ── Slutsummering ──────────────────────────────────────────────────────────

const sek = ((Date.now() - t0) / 1000).toFixed(1);
console.log("Tid: " + sek + " s (" + (pass + fail) + " kontroller)");
console.log("RESULTAT: " + pass + "/" + (pass + fail) + " PASS");
process.exit(fail === 0 ? 0 : 1);
