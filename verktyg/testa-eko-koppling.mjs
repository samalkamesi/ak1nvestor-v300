#!/usr/bin/env node
// Testsvit — EKO-KOPPLING (våg 213 del b / o106): de rena kontrakten —
// renSlugLista (API-query-validering), raknaKallsystem och Fas 2-porten —
// nätverksfritt (Supabase-env stryks FÖRE import; lasSignaler-grenarna ägs
// av live-drift och mockas ej här).
// Kör: node verktyg/testa-eko-koppling.mjs  (Node ≥ 22.18: type stripping)
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

const ENV_NYCKLAR = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const SPARAD_ENV = Object.fromEntries(ENV_NYCKLAR.map((k) => [k, process.env[k]]));
for (const k of ENV_NYCKLAR) delete process.env[k];

const { renSlugLista, raknaKallsystem, EKO_FAS2_NIVA, raknaEkoInsikter } = await import(
  pathToFileURL(join(ROT, "src/lib/eko-koppling.ts")).href
);

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — renSlugLista: API-query-valideringen ( samma regler båda väggar)");
ok("A1 icke-array ⇒ []", renSlugLista("inte-array", 5).length === 0);
ok("A2 null ⇒ []", renSlugLista(null, 5).length === 0);
ok("A3 giltiga slugs behålls", JSON.stringify(renSlugLista(["v01-forsaljningstillvaxt", "v04-ps"], 10)) === JSON.stringify(["v01-forsaljningstillvaxt", "v04-ps"]));
ok("A4 ogiltiga (slash, mellanslag, tomma) filtreras", renSlugLista(["a/b", "med mellanslag", "", "okej-slug"], 10).length === 1);
ok("A5 icke-strängar hopphas", renSlugLista([42, { x: 1 }, "god-slug"], 10).length === 1);
ok("A6 max-tak respekteras", renSlugLista(["a1", "b2", "c3", "d4"], 2).length === 2);
ok("A7 åäö tillåtna (svenska kursslugs)", renSlugLista(["svensk-årsredovisning-övning"], 3).length === 1);
ok("A8 överlång slug (>80) avvisas", renSlugLista(["x".repeat(81)], 3).length === 0);
ok("A9 determinism", JSON.stringify(renSlugLista(["m", "m", "z"], 5)) === JSON.stringify(renSlugLista(["m", "m", "z"], 5)));

console.log("B — raknaKallsystem: rapportera VILKA system som bidrog");
ok("B1 null ⇒ []", raknaKallsystem(null).length === 0);
ok("B2 källa med + delas", JSON.stringify(raknaKallsystem([{ kalla: "tracer+kurstips" }, { kalla: "navigationsminne" }])) === JSON.stringify(["tracer", "kurstips", "navigationsminne"]));
ok("B3 duplikat i källor ger EN post (första förekomst)", JSON.stringify(raknaKallsystem([{ kalla: "tracer" }, { kalla: "tracer" }])) === JSON.stringify(["tracer"]));
ok("B4 tom/ogiltig källa bidrar inte", raknaKallsystem([{ kalla: "" }, { kalla: null }, {}]).length === 0);
ok("B5 ordning = första förekomst (dokumenterat kontrakt)", raknaKallsystem([{ kalla: "b+x" }, { kalla: "a" }])[0] === "b");

console.log("C — Fas 2-porten");
ok("C1 EKO_FAS2_NIVA = 25 (paritet med klientkontextens niva ≥ 25-port)", EKO_FAS2_NIVA === 25);

console.log("D — raknaEkoInsikter nätverksfritt (SSR/elev utan data)");
const insikter = await raknaEkoInsikter(null);
ok("D1 ingen krasch med null-kontext (graceful)", Array.isArray(insikter));
ok("D2 varje insikt bär omrade/kalla/prioritet-form", insikter.every((i) => typeof i.omrade === "string" && typeof i.kalla === "string"));
ok("D3 sortering prioritet stigande", insikter.every((i, j) => j === 0 || insikter[j - 1].prioritet <= i.prioritet));

for (const [k, v] of Object.entries(SPARAD_ENV)) { if (v !== undefined) process.env[k] = v; }
console.log(`\nSVIT EKO-KOPPLING: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
