/**
 * TESTA AI-MENTORN 2.1 — modellager (mentor-svar.ts), 0 beroenden utöver Node.
 *
 * Kör:  node verktyg/testa-mentor-modell.mjs
 * Krav: Node >= 22.18 (type stripping default — mönstret ur testa-ai-mentor.mjs).
 *
 * E2E-FÖRKLARING: hela kedjan medlem → /api/mentor/fraga → generateText kan
 * inte köras som äkta HTTP här — ruttens medlemsvakt verifierar den httpOnly-
 * kakan ak1a_medlem mot Supabase/GoTrue LIVE (lasMedlemSession), och en äkta
 * inloggad medlems-session kräver riktiga kontouppgifter (R2-yta). Testet
 * kör därför ALL ruttlogik UTOM kakverifieringen: den RIKA modulen +
 * register + mock-transport + räknarfilens semantik (samma fs-format som
 * rutten skriver) i en temporärkatalog. Felvägen (503 → fallback),
 * dagstaket (429) och rollbacken verifieras på logiknivå.
 *
 * Fall:
 *   A  frågekontroll    — tom/for lång/ok + konservativ tokenskattning
 *   B  prompt           — juridikgrind + ekosystem + fråga + kontext inbakat
 *   C  modellsvar       — källmärke "AI-Mentorn modell", disclaimer,
 *                         registerlänkar, tom modelltext ⇒ null
 *   D  svarstak         — långt svar kapas mjukt vid 2 000 tkn
 *   E  rate-limit-grind — visaMentorBruk/dag/sökväg/återställning
 *   F  RUTTSIMULATION   — 10 ok → 11:e nekas; transportfel ⇒ rollback av kvoten
 *   G  juridik          — prompt OCH svar innehåller lagrum + nekande råd
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
    "Kör med: node --experimental-strip-types verktyg/testa-mentor-modell.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Importerar den RIKTIGA koden ur src/ (ingen duplikation i testet).
const mentor = await import(pathToFileURL(join(ROT, "src/lib/mentor-svar.ts")).href);
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { narmasteKurser } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);

let pass = 0;
const fel = [];
function kontroll(namn, villkor) {
  if (villkor) {
    pass++;
    console.log("  ✓ " + namn);
  } else {
    fel.push(namn);
    console.log("  ✗ " + namn);
  }
}

console.log("AI-MENTORN 2.1 — modellagrets test (" + KURSREGISTER.length + " kurser i registret)\n");

// ── A: frågekontroll + tokenskattning ────────────────────────────────────────
console.log("A · Frågekontroll och tokenskattning");
kontroll("tom fråga nekas", mentor.kontrolleraFraga("   ").fel === "tom");
kontroll("normal fråga passeras", mentor.kontrolleraFraga("Vad är ROE?").ok === true);
kontroll(
  "fråga över 500 tkn (≈1 501 tecken) nekas",
  mentor.kontrolleraFraga("a".repeat(1501)).fel === "for_lang",
);
kontroll("fråga på exakt takgräns (1 500 tecken = 500 tkn) passeras", mentor.kontrolleraFraga("a".repeat(1500)).ok === true);
kontroll("tokenskattning är konservativ (3 tecken/tkn)", mentor.beraknaToken("abcdef") === 2 && mentor.beraknaToken("") === 0);

// ── B: prompten — juridikgrind + ekosystem + fråga ───────────────────────────
console.log("B · Promptbyggnad");
const fraga = "Hur räknar man ut ROE och varför spelar det roll?";
const prompt = mentor.byggMentorPrompt(fraga, "variabel-V09");
kontroll("innehåller elevens fråga", prompt.includes(fraga));
kontroll("innehåller lagrummet 2007:528", prompt.includes("2007:528"));
kontroll("förbjuder investeringsråd explicit", /ALDRIG investeringsråd/i.test(prompt) && /aldrig.*köpas, säljas|inte investeringsråd/i.test(prompt));
kontroll("bär ekosystemkunskap (AKM1 + AK1TS + konfluens)", prompt.includes("AKM1") && prompt.includes("AK1TS") && prompt.includes("konfluens"));
kontroll("kontext följer med (sammanhanget)", prompt.includes("variabel-V09"));
kontroll("utan kontext: ingen kontextrad", !mentor.byggMentorPrompt(fraga).includes("Sammanhang"));
kontroll("systemprompten är deterministisk", mentor.mentorSystemPrompt() === mentor.mentorSystemPrompt());

// ── C: modellsvar — källmärke, disclaimer, registerlänkar ────────────────────
console.log("C · Modellsvar (mock-transport)");
const modellText =
  "ROE — avkastning på eget kapital — visar hur effektivt bolaget förvandlar ägarnas pengar till vinst. " +
  "Räkna: nettoresultat ÷ eget kapital. Ett bolag med 12 MSEK vinst på 100 MSEK eget kapital har ROE 12 %. " +
  "I AKM1 är detta V09 — en stabilt hög ROE genom konjunkturcykeln signalerar en stark affär. " +
  "Nästa steg: läs kursen V09 och räkna ROE själv för ett bolag du följer.";
const braTransport = { genereraText: async () => ({ text: modellText, råSvar: { mock: true } }) };
const naraC = narmasteKurser(fraga, KURSREGISTER, 2); // rutten DI:ar precis så här
const svarC = await mentor.hamtaMentorModellSvar(fraga, braTransport, naraC);
kontroll("svar levereras", svarC !== null);
kontroll("källmärket är 'AI-Mentorn modell'", svarC?.kalla.titel === mentor.MENTOR_MODELL_KALLA);
kontroll("disclaimern är alltid sist i svaret", (svarC?.text ?? "").endsWith(mentor.MENTOR_DISCLAIMER));
kontroll("disclaimern nämner lagrummet", mentor.MENTOR_DISCLAIMER.includes("2007:528"));
kontroll("handlingsknappar ur registret (/kurser/-länkar)", (svarC?.handlings ?? []).every((h) => h.lank.startsWith("/kurser/")) && (svarC?.handlings ?? []).length === 2);
kontroll("motfråga + fördjupa finns (pedagogiken består)", Boolean(svarC?.motfraga?.text) && Boolean(svarC?.fordjupa?.lank));
kontroll("ämnet sätts ('modell') för följdfrågor", svarC?.amne === "modell");
const tomTransport = { genereraText: async () => ({ text: "", råSvar: {} }) };
kontroll("tom modelltext ⇒ null (503-vägen)", (await mentor.hamtaMentorModellSvar(fraga, tomTransport, naraC)) === null);

// ── D: svarstak — mjuk kapning vid 2 000 tkn ─────────────────────────────────
console.log("D · Svarstak (2 000 tkn)");
const langPunkt = "Mening. ".repeat(1600); // 11 200 tecken, slutar med mening
const kapadPunkt = mentor.kapaMentorSvar(langPunkt);
kontroll("långt svar kapas till ≤ 2 000 tkn", kapadPunkt !== null && mentor.beraknaToken(kapadPunkt) <= mentor.MENTOR_SVAR_TAK_TKN);
kontroll("kapningen sker vid meningsgräns (ej mitt i)", kapadPunkt !== null && kapadPunkt.trim().endsWith("."));
const kortSvar = mentor.kapaMentorSvar("Kort svar.");
kontroll("kort svar passeras oändrat", kortSvar === "Kort svar.");
kontroll("whitespace-rättad tomtext ⇒ null", mentor.kapaMentorSvar("   \n  ") === null);

// ── E: rate-limit-grinden (ren logik) ────────────────────────────────────────
console.log("E · Rate-limit-grind");
kontroll("ingen räknare ⇒ tillåtet", mentor.visaMentorBruk(null) === true);
kontroll("9 frågor ⇒ tillåtet (nästa är den 10:e)", mentor.visaMentorBruk({ antal: 9 }) === true);
kontroll("10 frågor ⇒ NEKAT", mentor.visaMentorBruk({ antal: 10 }) === false);
kontroll("ogiltiga värden (−1) behandlas som under taket", mentor.visaMentorBruk({ antal: -1 }) === true);
kontroll("dag är ISO-datum (YYYY-MM-DD)", /^\d{4}-\d{2}-\d{2}$/.test(mentor.mentorDag(new Date("2026-09-15T13:37:00Z"))));
kontroll(
  "sökväg: <bas>/<dag>/<hash>.json",
  mentor.mentorBrukSokvag("/srv/data/vakten/mentor-bruk/", "2026-09-15", "abc123def456") ===
    "/srv/data/vakten/mentor-bruk/2026-09-15/abc123def456.json",
);
const midnatt = mentor.aterstallSekTillMidnatt(new Date("2026-09-15T23:59:30Z"));
kontroll("återställning 30 s före midnatt ⇒ ~30 s", midnatt >= 1 && midnatt <= 60);

// ── F: RUTTSIMULATION — exakt ruttens algoritm mot riktiga filer ─────────────
console.log("F · Ruttsimulation (räknarfil i tempkatalog, ruttens algoritm)");
const bas = mkdtempSync(join(tmpdir(), "mentor-bruk-test-"));
const dag = mentor.mentorDag(new Date());
const sokvag = mentor.mentorBrukSokvag(bas, dag, "testhash000111");
// Speglar rutten: lasBruk → visaMentorBruk → öka FÖRE anrop → rollback vid fel.
function lasBrukTest() {
  try {
    const rå = JSON.parse(readFileSync(sokvag, "utf8"));
    return typeof rå.antal === "number" ? { antal: rå.antal } : null;
  } catch {
    return null;
  }
}
function skrivBrukTest(bruk) {
  // Speglar rutten: mkdir recursive före skrivning (dagen är en underkatalog).
  mkdirSync(dirname(sokvag), { recursive: true });
  writeFileSync(sokvag, JSON.stringify(bruk), "utf8");
}
const felTransport = { genereraText: async () => { throw new Error("modellen nere"); } };
let levereradeSvar = 0;
let nekat = 0;
let felaktigaAnrop = 0;
for (let i = 0; i < 12; i++) {
  const bruk = lasBrukTest();
  if (!mentor.visaMentorBruk(bruk)) {
    nekat++;
    continue;
  }
  const nytt = { antal: (bruk?.antal ?? 0) + 1 };
  skrivBrukTest(nytt);
  try {
    const svar = await mentor.hamtaMentorModellSvar(fraga, braTransport, naraC);
    if (svar) {
      levereradeSvar++;
    } else {
      skrivBrukTest({ antal: nytt.antal - 1 }); // rollback (tom modelltext)
      felaktigaAnrop++;
    }
  } catch {
    skrivBrukTest({ antal: nytt.antal - 1 }); // rollback (transportfel)
    felaktigaAnrop++;
  }
}
kontroll("exakt 10 modellsvar levereras (11:e och 12:e nekas)", levereradeSvar === 10 && nekat === 2);
kontroll("räknarfilen står på 10 efter dagen", lasBrukTest()?.antal === 10);
// Transportfel efter full kvot: NEKAS vid grinden (räknaren får inte växa)
if (!mentor.visaMentorBruk(lasBrukTest())) {
  nekat++;
}
kontroll("full kvot + transportfel ⇒ fortfarande nekat vid grinden", lasBrukTest()?.antal === 10 && nekat === 3);
// Transportfel MIDAGEN: rollback ⇒ kvoten består (testar rollback-grenen)
skrivBrukTest({ antal: 5 });
try {
  await mentor.hamtaMentorModellSvar(fraga, felTransport, naraC);
} catch {
  skrivBrukTest({ antal: 5 }); // ruttens catch: rulla tillbaka 6 → 5
}
kontroll("transportfel rullar tillbaka kvoten (5 förblir 5)", lasBrukTest()?.antal === 5);
// Fel-meddelandet propagerar (rutten mappar det till 503 → klientens fallback)
let kastade = false;
try {
  await mentor.hamtaMentorModellSvar(fraga, felTransport, naraC);
} catch {
  kastade = true;
}
kontroll("transportfel KASTAS till rutten (503-vägen)", kastade === true);
rmSync(bas, { recursive: true, force: true });

// ── G: juridiken — rådgivningsfrågor möts av nekande systemprompt ────────────
console.log("G · Juridikgrind (lagen 2007:528)");
const radFraga = "Ska jag köpa Volvo-aktien nu?";
const radPrompt = mentor.byggMentorPrompt(radFraga);
kontroll(
  "rådgivningsfråga: prompten kräver utbildningsformulering + ärligt nej",
  radPrompt.includes("utbildar och inte rådgiver") && radPrompt.includes("specifik aktie bör köpas, säljas"),
);
kontroll("varje levererat svar bär disclaimern (C-fallet)", (svarC?.text ?? "").includes("inte investeringsråd"));

// ── Sammanfattning ───────────────────────────────────────────────────────────
console.log("");
if (fel.length === 0) {
  console.log("KLAR: " + pass + " kontroller gröna — modellagret är leveransfärdigt.");
  process.exit(0);
}
console.error("FEL: " + fel.length + " kontroller röda: " + fel.join("; "));
process.exit(1);
