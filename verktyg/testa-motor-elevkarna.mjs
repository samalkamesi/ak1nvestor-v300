/**
 * TESTA MOTOR — ELEVKÄRNAN (v213b-u5, fabriksvåg: 10 otestade motorer).
 *
 * Kör:  npx --yes tsx verktyg/testa-motor-elevkarna.mjs
 *       (ren node kan dö på .ts-importen — ERR_MODULE_NOT_FOUND är VÄNTAT;
 *       testaggregatorns tsx-återfall hanterar det, se verktyg/kor-alla-tester.mjs R107.)
 *
 * Kontraktssvit för src/lib/elevkarna.ts — BARA rena kontrakt:
 *   A  Konstanter           — MAX_INTRESSEN/MAX_VALFARD, tre fasta
 *                             alternativlistor (form, unikhet, längd)
 *   B  lasElevKarna         — grundform: null vid tom/trasig/kastande butik,
 *                             full roundtrip, inga extrafält läcker in,
 *                             mal utanför listan → ""
 *   C  horisontAr-sanering  — clamp 1–15, avrundning, 0/NaN → 1,
 *                             numerisk sträng koerceras
 *   D  tidPerVecka-sanering — clamp 0–3000, avrundning, NaN → 0,
 *                             0 är TILLÅTEN (skillnad från horisonten)
 *   E  intressen-sanering   — exakt listmatchning, ogiltiga filtreras,
 *                             max 3 (första giltiga behålls), icke-array → []
 *   F  valfard-sanering     — exakt listmatchning, max 2, icke-array → []
 *   G  sparad-sanering      — giltig timestamp bevaras, ogiltig → 0
 *   H  spara/rensa          — exakt en nyckel ("ak1a-elevkarna-v1"), råvärdet
 *                             är JSON, spara→las roundtrip, rensa tömmer,
 *                             kvot-/åtkomstfel sväljs utan kast (P8-graceful)
 *   I  valfardsGrad         — gradtrappan 0–3: tom kärna → 0, ett välfärdsmål
 *                             → 1 (längd styr FÖRE kompletthet), två mål +
 *                             ofullständig resten → 2, komplett → 3; fyra
 *                             distinkta uppmuntrande texter, determinism
 *
 * Deterministisk: INGEN server, INGET nätverk, INGEN prod, INGA
 * miljöberoenden. localStorage mockas i processen (motorn rör globalThis
 * endast inuti funktionerna) — ingen disk, inga data/-filer rörs.
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

let motor;
try {
  motor = await import(pathToFileURL(join(ROT, "src/lib/elevkarna.ts")).href);
} catch (e) {
  console.error(
    "FEL: import av src/lib/elevkarna.ts misslyckades — .ts-import kräver tsx; " +
      "kör sviten med: npx --yes tsx verktyg/testa-motor-elevkarna.mjs",
  );
  console.error(e); // rå fel bevarar ERR_MODULE_NOT_FOUND-markören för aggregatorns tsx-återfall
  process.exit(1);
}

const {
  lasElevKarna,
  sparaElevKarna,
  rensaElevKarna,
  valfardsGrad,
  MAX_INTRESSEN,
  MAX_VALFARD,
  MAL_ALTERNATIV,
  INTRESSEN_ALTERNATIV,
  VALFARD_ALTERNATIV,
} = motor;

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

// ── localStorage-mock (i processen; motorn läser globalThis vid anrop) ──────
const NYCKEL = "ak1a-elevkarna-v1";

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

function sättButik(b) {
  try {
    globalThis.localStorage = b;
  } catch {
    Object.defineProperty(globalThis, "localStorage", {
      value: b,
      writable: true,
      configurable: true,
    });
  }
}

/** Så en rå sträng under nyckeln och läs tillbaka med motorn. */
function läsMedRå(rå) {
  const b = skapaButik();
  b.setItem(NYCKEL, rå);
  sättButik(b);
  return lasElevKarna();
}

function lika(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Återanvändbara giltiga värden UR motorns egna listor (aldrig hardcode-antaganden)
const MAL0 = MAL_ALTERNATIV[0];
const INT0 = INTRESSEN_ALTERNATIV[0];
const INT1 = INTRESSEN_ALTERNATIV[1];
const INT2 = INTRESSEN_ALTERNATIV[2];
const INT3 = INTRESSEN_ALTERNATIV[3];
const VAL0 = VALFARD_ALTERNATIV[0];
const VAL1 = VALFARD_ALTERNATIV[1];
const VAL2 = VALFARD_ALTERNATIV[2];

// ── FALL A: Konstanter och fasta listor ─────────────────────────────────────

kontroll(
  "A1 MAX_INTRESSEN = 3 (dokumenterat tak för intressen)",
  MAX_INTRESSEN === 3,
  "fick " + String(MAX_INTRESSEN),
);

kontroll(
  "A2 MAX_VALFARD = 2 (dokumenterat tak för välfärdsmål)",
  MAX_VALFARD === 2,
  "fick " + String(MAX_VALFARD),
);

function ÄrListaAvUnikaSträngar(lista) {
  return (
    Array.isArray(lista) &&
    lista.length > 0 &&
    lista.every((s) => typeof s === "string" && s.trim().length > 0) &&
    new Set(lista).size === lista.length
  );
}

kontroll(
  "A3 MAL_ALTERNATIV: 5 unika icke-tomma strängar",
  MAL_ALTERNATIV.length === 5 && ÄrListaAvUnikaSträngar(MAL_ALTERNATIV),
  MAL_ALTERNATIV.length + " alternativ",
);

kontroll(
  "A4 INTRESSEN_ALTERNATIV: 6 unika icke-tomma strängar",
  INTRESSEN_ALTERNATIV.length === 6 && ÄrListaAvUnikaSträngar(INTRESSEN_ALTERNATIV),
  INTRESSEN_ALTERNATIV.length + " alternativ",
);

kontroll(
  "A5 VALFARD_ALTERNATIV: 5 unika icke-tomma strängar",
  VALFARD_ALTERNATIV.length === 5 && ÄrListaAvUnikaSträngar(VALFARD_ALTERNATIV),
  VALFARD_ALTERNATIV.length + " alternativ",
);

// ── FALL B: lasElevKarna — grundkontraktet ──────────────────────────────────

sättButik(skapaButik());
kontroll(
  "B1 tom butik ⇒ null (ingen kärna sparad)",
  lasElevKarna() === null,
);

kontroll(
  "B2 trasig JSON ⇒ null (catch-grenen)",
  läsMedRå("{ inte json") === null,
);

kontroll(
  "B3 JSON-null ('null') ⇒ null (egenskapsläsning kastar → catch)",
  läsMedRå("null") === null,
);

sättButik(kastandeButik());
kontroll(
  "B4 kastande getItem ⇒ null (graceful, aldrig kast)",
  lasElevKarna() === null,
);

const HELT =
  '{"mal":"' + MAL0 + '","horisontAr":7,"intressen":["' + INT0 + '","' + INT1 +
  '"],"tidPerVecka":180,"valfard":["' + VAL0 + '","' + VAL1 + '"],"sparad":1234567890}';
const heltFörväntat = {
  mal: MAL0,
  horisontAr: 7,
  intressen: [INT0, INT1],
  tidPerVecka: 180,
  valfard: [VAL0, VAL1],
  sparad: 1234567890,
};
kontroll(
  "B5 fullt giltig kärna ⇒ exakt kopia (alla sex fält)",
  lika(läsMedRå(HELT), heltFörväntat),
  JSON.stringify(läsMedRå(HELT)),
);

const medExtra = JSON.parse(HELT);
medExtra.extra = "läckage";
medExtra.djup = { hemlighet: true };
const medExtraResultat = läsMedRå(JSON.stringify(medExtra));
kontroll(
  "B6 extrafält läcker INTE in i resultatet (exakt nyckelmängd)",
  medExtraResultat !== null &&
    JSON.stringify(Object.keys(medExtraResultat).sort()) ===
      JSON.stringify(
        ["horisontAr", "intressen", "mal", "sparad", "tidPerVecka", "valfard"].sort(),
      ),
  Object.keys(medExtraResultat || {}).join(","),
);

kontroll(
  "B7 mal utanför listan ⇒ '' (saneras vid läsning)",
  läsMedRå('{"mal":"Kör optioner","horisontAr":5,"intressen":[],"tidPerVecka":60,"valfard":[],"sparad":1}')?.mal === "",
);

kontroll(
  "B8 saknat mal (undefined) ⇒ ''",
  läsMedRå('{"horisontAr":5,"intressen":[],"tidPerVecka":60,"valfard":[],"sparad":1}')?.mal === "",
);

// ── FALL C: horisontAr — clamp 1–15, avrundning, NaN-återfall ───────────────

function horisont(v) {
  return läsMedRå(JSON.stringify({ horisontAr: v }))?.horisontAr;
}

kontroll("C1 saknad horisontAr ⇒ 1 (NaN-återfall)", horisont(undefined) === 1);
kontroll("C2 0 ⇒ 1 (noll är inte ett giltigt perspektiv)", horisont(0) === 1);
kontroll("C3 -5 ⇒ 1 (clamp nedåt)", horisont(-5) === 1);
kontroll("C4 100 ⇒ 15 (clamp uppåt)", horisont(100) === 15);
kontroll("C5 2.4 ⇒ 2 (avrundning nedåt)", horisont(2.4) === 2);
kontroll("C6 2.6 ⇒ 3 (avrundning uppåt)", horisont(2.6) === 3);
kontroll("C7 '7' som sträng ⇒ 7 (numerisk koercion)", horisont("7") === 7);
kontroll("C8 'abc' ⇒ 1 (NaN → standardperspektiv)", horisont("abc") === 1);

// ── FALL D: tidPerVecka — clamp 0–3000, 0 är TILLÅTEN ──────────────────────

function tid(v) {
  return läsMedRå(JSON.stringify({ tidPerVecka: v }))?.tidPerVecka;
}

kontroll("D1 saknad tidPerVecka ⇒ 0", tid(undefined) === 0);
kontroll("D2 -50 ⇒ 0 (clamp nedåt)", tid(-50) === 0);
kontroll("D3 5000 ⇒ 3000 (clamp uppåt)", tid(5000) === 3000);
kontroll("D4 45.6 ⇒ 46 (avrundning till närmsta heltal)", tid(45.6) === 46);
kontroll("D5 'abc' ⇒ 0 (NaN-återfall)", tid("abc") === 0);
kontroll("D6 0 ⇒ 0 (noll är giltig tid — skillnad från horisontens 0→1)", tid(0) === 0);

// ── FALL E: intressen — exakt matchning, max 3 ──────────────────────────────

kontroll(
  "E1 ogiltiga intressen filtreras bort, giltiga behålls",
  lika(
    läsMedRå(JSON.stringify({ intressen: [INT0, "kryptodaghandel", INT1, 42] }))?.intressen,
    [INT0, INT1],
  ),
);

kontroll(
  "E2 fyra giltiga ⇒ exakt de tre första (MAX_INTRESSEN, ordning bevaras)",
  lika(
    läsMedRå(JSON.stringify({ intressen: [INT0, INT1, INT2, INT3] }))?.intressen,
    [INT0, INT1, INT2],
  ),
);

kontroll("E3 icke-array (null) ⇒ []", lika(läsMedRå(JSON.stringify({ intressen: null }))?.intressen, []));

kontroll(
  "E4 exakt listmatchning: 'Svenska bolag ' (mekanismfel) räknas EJ",
  lika(
    läsMedRå(JSON.stringify({ intressen: ["Svenska bolag ", INT0] }))?.intressen,
    [INT0],
  ),
);

kontroll("E5 tom array ⇒ []", lika(läsMedRå(JSON.stringify({ intressen: [] }))?.intressen, []));

// ── FALL F: valfard — exakt matchning, max 2 ────────────────────────────────

kontroll(
  "F1 ogiltiga filtreras + tre giltiga ⇒ två första (MAX_VALFARD)",
  lika(
    läsMedRå(JSON.stringify({ valfard: ["Miljardär på en månad", VAL0, VAL1, VAL2] }))?.valfard,
    [VAL0, VAL1],
  ),
);

kontroll("F2 icke-array (sträng) ⇒ []", lika(läsMedRå(JSON.stringify({ valfard: VAL0 }))?.valfard, []));

kontroll(
  "F3 ett giltigt välfärdsmål bevaras oskadat",
  lika(läsMedRå(JSON.stringify({ valfard: [VAL2] }))?.valfard, [VAL2]),
);

// ── FALL G: sparad — timestamp-fältet ───────────────────────────────────────

kontroll(
  "G1 giltig timestamp bevaras",
  läsMedRå(JSON.stringify({ sparad: 1758381600000 }))?.sparad === 1758381600000,
);

kontroll("G2 ogiltig timestamp ('abc') ⇒ 0", läsMedRå(JSON.stringify({ sparad: "abc" }))?.sparad === 0);

// ── FALL H: spara/rensa — butiksprotokollet ────────────────────────────────

const butikH = skapaButik();
sättButik(butikH);
sparaElevKarna(heltFörväntat);
kontroll(
  "H1 spara skriver EXAKT en nyckel: " + NYCKEL,
  butikH.antal() === 1 && lika(butikH.nycklar(), [NYCKEL]),
  butikH.nycklar().join(","),
);

kontroll(
  "H2 råvärdet parsar till samma objekt (JSON-serialisering)",
  lika(JSON.parse(butikH.rå(NYCKEL)), heltFörväntat),
);

kontroll(
  "H3 spara→las roundtrip: giltig kärna överlever oskadad",
  lika(läsMedRå(butikH.rå(NYCKEL)), heltFörväntat),
);

const butikH4 = skapaButik();
sättButik(butikH4);
sparaElevKarna(heltFörväntat);
rensaElevKarna();
kontroll(
  "H4 rensa ⇒ butiken tom + las ⇒ null",
  butikH4.antal() === 0 && lasElevKarna() === null,
);

sättButik(kastandeButik());
let svaldeSpara = false;
try {
  sparaElevKarna(heltFörväntat);
  svaldeSpara = true;
} catch {
  svaldeSpara = false;
}
kontroll("H5 spara sväljer kvot-/åtkomstfel utan kast (P8-graceful)", svaldeSpara);

let svaldeRensa = false;
try {
  rensaElevKarna();
  svaldeRensa = true;
} catch {
  svaldeRensa = false;
}
kontroll("H6 rensa sväljer butiksfel utan kast (P8-graceful)", svaldeRensa);

// ── FALL I: valfardsGrad — gradtrappan 0–3 ─────────────────────────────────

function kärna(ändringar) {
  return Object.assign(
    { mal: MAL0, horisontAr: 5, intressen: [INT0], tidPerVecka: 120, valfard: [VAL0, VAL1], sparad: 1 },
    ändringar,
  );
}

const gNull = valfardsGrad(null);
kontroll(
  "I1 null ⇒ grad 0 + icke-tom uppmuntrande text",
  gNull.grad === 0 && typeof gNull.text === "string" && gNull.text.length > 0,
);

kontroll(
  "I2 valfard [] ⇒ grad 0 (kärnan ännu oskriven)",
  valfardsGrad(kärna({ valfard: [] })).grad === 0,
);

kontroll(
  "I3 ETT välfärdsmål ⇒ grad 1 även med fullt ifylld resten (längd styr FÖRE kompletthet)",
  valfardsGrad(kärna({ valfard: [VAL0] })).grad === 1,
);

kontroll(
  "I4 två mål + mal saknas ('') ⇒ grad 2",
  valfardsGrad(kärna({ mal: "" })).grad === 2,
);

kontroll(
  "I5 två mål + intressen [] ⇒ grad 2",
  valfardsGrad(kärna({ intressen: [] })).grad === 2,
);

kontroll(
  "I6 två mål + tidPerVecka 0 ⇒ grad 2",
  valfardsGrad(kärna({ tidPerVecka: 0 })).grad === 2,
);

kontroll(
  "I7 två mål + komplett kärna ⇒ grad 3 (fullt formad)",
  valfardsGrad(kärna({})).grad === 3,
);

kontroll(
  "I8 direkt anrop med TRE välfärdsmål (ej möjligt via las, som kapar vid 2) ⇒ grad 3 när komplett",
  valfardsGrad(kärna({ valfard: [VAL0, VAL1, VAL2] })).grad === 3,
);

const texter = [
  valfardsGrad(null).text,
  valfardsGrad(kärna({ valfard: [VAL0] })).text,
  valfardsGrad(kärna({ mal: "" })).text,
  valfardsGrad(kärna({})).text,
];
kontroll(
  "I9 fyra grader ⇒ fyra distinkta icke-tomma texter (en röst per steg)",
  texter.every((t) => typeof t === "string" && t.length > 0) &&
    new Set(texter).size === 4,
);

kontroll(
  "I10 determinism: samma input två gånger ⇒ identiskt resultat",
  lika(valfardsGrad(kärna({})), valfardsGrad(kärna({}))) &&
    lika(läsMedRå(HELT), läsMedRå(HELT)),
);

// ── Slutsummering ──────────────────────────────────────────────────────────

const sek = ((Date.now() - t0) / 1000).toFixed(1);
console.log("Tid: " + sek + " s (" + (pass + fail) + " kontroller)");
console.log("RESULTAT: " + pass + "/" + (pass + fail) + " PASS");
process.exit(fail === 0 ? 0 : 1);
