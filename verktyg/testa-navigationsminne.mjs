#!/usr/bin/env node
// Testsvit — NAVIGATIONSMINNE (våg 213 del b / o106): titelFranSida (ren) +
// registreraBesok/besok mot mockad localStorage + SSR-säkerhet.
// Kör: node verktyg/testa-navigationsminne.mjs  (Node ≥ 22.18: type stripping)
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "_o106-ts-import.mjs")).href);
aktiveraTsImport();

// ── localStorage-mock (ärlig Map + JSON-gränssnitt) ──────────────────────────
class MockStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}
const mock = new MockStorage();
const mockWindow = { localStorage: mock };

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — titelFranSida: mänskliga titlar (ren funktion)");
const { titelFranSida, registreraBesok, besok } = await import(
  pathToFileURL(join(ROT, "src/lib/navigationsminne.ts")).href
);
ok("A1 kända vägar får fast titel", titelFranSida("/kurser") === "Alla kurser" && titelFranSida("/") === "Startsidan");
ok("A2 kursslag renderas läsbart", titelFranSida("/kurser/vaglarans-hierarki") === "vaglarans hierarki");
ok("A3 bloggslag prefixas", titelFranSida("/blogg/kassaflodets-hemlighet") === "Blogg: kassaflodets hemlighet");
ok("A4 okänd väg återkommer som den är", titelFranSida("/framtida-sida") === "/framtida-sida");
ok("A5 determinism", titelFranSida("/kurser/abc-def") === titelFranSida("/kurser/abc-def"));

console.log("B — SSR-säkerhet: utan window kraschar inget");
ok("B1 besok() utan window ⇒ []", Array.isArray(besok()) && besok().length === 0);

console.log("C — registreraBesok: nyast först, dubbletter flyttas upp, tak 24");
globalThis.window = mockWindow;
mock.map.clear();
registreraBesok("/kurser", "Alla kurser");
registreraBesok("/blogg");
ok("C1 två besök nyast först", besok().length === 2 && besok()[0].sida === "/blogg");
registreraBesok("/kurser", "Alla kurser");
ok("C2 dubblett flyttas upp UTAN kopia", besok().length === 2 && besok()[0].sida === "/kurser");
registreraBesok("/kurser", "Alla kurser");
ok("C3 samma sida i rad ⇒ ignoreras (ingen tidsstämpel-drift)", besok().length === 2 && besok()[0].titel === "Alla kurser");
ok("C4 titel härleds ur sökvägen när ingen anges", besok()[1].titel === "Bloggen");
ok("C5 tidsstämplar är epok-ms i ordning", besok()[0].tid >= besok()[1].tid && Number.isFinite(besok()[0].tid));
for (let i = 0; i < 30; i++) registreraBesok("/sida-" + i);
ok("C6 tak 24 besök (MAX_BESOK)", besok().length === 24);
ok("C7 senaste besöket är det nyaste registrerade", besok()[0].sida === "/sida-29");
ok("C8 nyckeln är namnrymdad (ak1a:navigationsminne)", [...mock.map.keys()].includes("ak1a:navigationsminne"));

console.log("D — förorenad storage tåljs (privat läge/korrupt JSON)");
mock.map.set("ak1a:navigationsminne", "{inte json");
ok("D1 korrupt JSON ⇒ tomt minne, ingen krasch", besok().length === 0);
mock.map.set("ak1a:navigationsminne", JSON.stringify([{ sida: "/x", titel: "X", tid: 1 }, null, "skräp"]));
ok("D2 delvis korrupt rad levereras som den kan", besok().length >= 1);

delete globalThis.window;
console.log(`\nSVIT NAVIGATIONSMINNE: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
