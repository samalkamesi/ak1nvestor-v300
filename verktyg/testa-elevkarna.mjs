#!/usr/bin/env node
// Testsvit — ELEVKÄRNAN (våg 213 del b / o106): sanering vid läsning, roundtrip
// och välfärdsgradens ton (alltid uppmuntrande) mot mockad localStorage.
// Kör: node verktyg/testa-elevkarna.mjs  (Node ≥ 22.18: type stripping)
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "ts-import.mjs")).href);
aktiveraTsImport();

class MockStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}
const mock = new MockStorage();
globalThis.localStorage = mock;

const { lasElevKarna, sparaElevKarna, rensaElevKarna, valfardsGrad, MAX_INTRESSEN, MAX_VALFARD, MAL_ALTERNATIV, INTRESSEN_ALTERNATIV, VALFARD_ALTERNATIV } = await import(
  pathToFileURL(join(ROT, "src/lib/elevkarna.ts")).href
);

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — alternativlistorna (fasta, unika)");
ok("A1 max-tak 3 intressen / 2 välfärdsmål", MAX_INTRESSEN === 3 && MAX_VALFARD === 2);
ok("A2 listor icke-tomma och unika", [MAL_ALTERNATIV, INTRESSEN_ALTERNATIV, VALFARD_ALTERNATIV].every((l) => l.length > 0 && new Set(l).size === l.length));

console.log("B — lasElevKarna: sanering av allt som inte hör hemma");
ok("B1 tomt lagrat ⇒ null", lasElevKarna() === null);
mock.map.set("ak1a-elevkarna-v1", "{korrupt json");
ok("B2 korrupt JSON ⇒ null (aldrig krasch)", lasElevKarna() === null);
mock.map.set("ak1a-elevkarna-v1", JSON.stringify({
  mal: "Ej existerande mål", horisontAr: 99, intressen: ["Svenska bolag", "något olagligt", "Risk & kriser", "Värdeinvestering", "Vågor & timing"],
  tidPerVecka: -50, valfard: ["Sömn utan ekonomisk oro", "Frihet att välja liv", "Trygghet för familjen"], sparad: 123,
}));
const sant = lasElevKarna();
ok("B3 ogiltigt mål saneras till tom sträng", sant?.mal === "");
ok("B4 horisont clampas 1–15", sant?.horisontAr === 15);
ok("B5 intressen: ogiltiga bort + max 3", sant?.intressen.length === 3 && sant.intressen.every((i) => INTRESSEN_ALTERNATIV.includes(i)));
ok("B6 negativ tid clampas till 0", sant?.tidPerVecka === 0);
ok("B7 välfärd max 2 (alla giltiga dock)", sant?.valfard.length === 2);

console.log("C — spara/las/rensa: roundtrip och nyckelhygien");
const karna = { mal: MAL_ALTERNATIV[0], horisontAr: 7, intressen: [INTRESSEN_ALTERNATIV[0]], tidPerVecka: 120, valfard: [VALFARD_ALTERNATIV[0]], sparad: 456 };
sparaElevKarna(karna);
const tillbaka = lasElevKarna();
ok("C1 roundtrip bitidentisk", JSON.stringify(tillbaka) === JSON.stringify(karna));
ok("C2 nyckeln är versionerad (ak1a-elevkarna-v1)", [...mock.map.keys()].includes("ak1a-elevkarna-v1"));
rensaElevKarna();
ok("C3 rensa tar bort kärnan", lasElevKarna() === null);

console.log("D — valfardsGrad: grad 0–3, tonen alltid uppmuntrande");
ok("D1 null-kärna ⇒ grad 0 med välkomsttext", valfardsGrad(null).grad === 0 && valfardsGrad(null).text.length > 10);
ok("D2 ett välfärdsmål ⇒ grad 1", valfardsGrad({ ...karna, valfard: [VALFARD_ALTERNATIV[1]] }).grad === 1);
ok("D3 två mål men tom kärna-övrig ⇒ grad 2", valfardsGrad({ mal: "", horisontAr: 1, intressen: [], tidPerVecka: 0, valfard: VALFARD_ALTERNATIV.slice(0, 2), sparad: 0 }).grad === 2);
ok("D4 full kärna (två mål + mal + intressen + tid) ⇒ grad 3", valfardsGrad({ ...karna, valfard: VALFARD_ALTERNATIV.slice(0, 2) }).grad === 3);
const allaTexter = [null, { ...karna, valfard: [VALFARD_ALTERNATIV[1]] }, { mal: "", horisontAr: 1, intressen: [], tidPerVecka: 0, valfard: VALFARD_ALTERNATIV.slice(0, 2), sparad: 0 }, karna].map(valfardsGrad).map((v) => v.text);
ok("D5 aldrig dömande ord (skam/dålig/borde)", allaTexter.every((t) => !/skam|dålig|borde|misslycka/i.test(t)));

delete globalThis.localStorage;
console.log(`\nSVIT ELEVKÄRNA: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
