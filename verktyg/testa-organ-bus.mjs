#!/usr/bin/env node
// Testsvit — AUTONOM/ORGAN-BUS (våg 213 del b / o106): mikroRapporter (ren,
// deterministisk) + korRunda/skicka/lasSenaste i nätverksfri miljö (Supabase-
// env stryks FÖRE import ⇒ graceful-fall: false/tom array, ALDRIG kast).
// Kör: node verktyg/testa-organ-bus.mjs  (Node ≥ 22.18: type stripping)
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

const { mikroRapporter, korRunda, skicka, lasSenaste } = await import(
  pathToFileURL(join(ROT, "src/lib/autonom/organ-bus.ts")).href
);

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — mikroRapporter: fem organ, mätta värden, deterministiska");
const frisk = mikroRapporter({ kurser: 226, bloggAntal: 12, bloggDagarSedan: 1, analyser: 8, besokare7d: 40, konvertering: 9, medlemmar: 4 });
ok("A1 fem organ rapporterar", frisk.length === 5);
ok("A2 organnamn unika", new Set(frisk.map((r) => r.organ)).size === 5);
ok("A3 status ∈ {ok, varning, atgardar}", frisk.every((r) => ["ok", "varning", "atgardar"].includes(r.status)));
ok("A4 mätta värden satta (mätvärden, inte känslor)", frisk.every((r) => Object.keys(r.matt).length > 0));
ok("A5 varje organ föreslår nåt", frisk.every((r) => r.forslag.length >= 1));
ok("A6 frisk indata ⇒ kurs-organet ok på mål 226", frisk.find((r) => r.organ === "Kurs-organet")?.status === "ok");
ok("A7 retention-organet alltid varning (mätning väntar)", frisk.find((r) => r.organ === "Retention-organet")?.status === "varning");
ok("A8 determinism", JSON.stringify(mikroRapporter({ kurser: 226, bloggAntal: 12, bloggDagarSedan: 1, analyser: 8, besokare7d: 40, konvertering: 9, medlemmar: 4 })) === JSON.stringify(frisk));

console.log("B — mikroRapporter: trösklarna (statuslogiken)");
const svag = mikroRapporter({ kurser: 100, bloggAntal: 3, bloggDagarSedan: 6, analyser: 2, besokare7d: 4, konvertering: 2, medlemmar: 0 });
ok("B1 blogg > 3 dagar sedan ⇒ atgardar", svag.find((r) => r.organ === "Blogg-organet")?.status === "atgardar");
ok("B2 analyser < 5 ⇒ atgardar", svag.find((r) => r.organ === "Analys-organet")?.status === "atgardar");
ok("B3 besökare < 10 ⇒ atgardar", svag.find((r) => r.organ === "Marknad-organet")?.status === "atgardar");
ok("B4 förslagen bär räkningen (100 kurser ⇒ 126 kvar)", (svag.find((r) => r.organ === "Kurs-organet")?.forslag[0] ?? "").includes("126"));
ok("B5 kurs-organet under mål ⇒ fortfarande ok-status men fyllpå-förslag", svag.find((r) => r.organ === "Kurs-organet")?.forslag[0]?.includes("Fyll på") === true);

console.log("C — prioriteringen: korRunda utan nät (bounded, deterministisk)");
const rond = await korRunda({ kurser: 100, bloggAntal: 3, bloggDagarSedan: 6, analyser: 2, besokare7d: 4, konvertering: 2, medlemmar: 0 });
ok("C1 resultatform (timestamp/fråga/rapporter/beslut/ko)", typeof rond.timestamp === "string" && rond["makroFråga"].length > 0 && rond.rapporter.length === 5 && Array.isArray(rond.delegationsKo));
ok("C2 exakt tre beslut (bounded)", rond.beslut.length === 3);
const poang = { atgardar: 3, varning: 2, ok: 1 };
ok("C3 beslut sorterade atgardar(3) > varning(2) > ok(1)",
  rond.beslut.every((b, i) => i === 0 || poang[rond.beslut[i - 1].alignatMed ? rond.rapporter.find((r) => r.organ === rond.beslut[i - 1].alignatMed)?.status ?? "ok" : "ok"] >= poang[rond.rapporter.find((r) => r.organ === b.alignatMed)?.status ?? "ok"]));
ok("C4 score = poäng × 10", rond.beslut.every((b) => b.score === poang[rond.rapporter.find((r) => r.organ === b.alignatMed)?.status ?? "ok"] * 10));
ok("C5 delegationsKo speglar besluten", JSON.stringify(rond.delegationsKo) === JSON.stringify(rond.beslut.map((b) => b.titel)));
ok("C6 med tre atgardar vinner de alla tre delegationerna", rond.beslut.every((b) => rond.rapporter.find((r) => r.organ === b.alignatMed)?.status === "atgardar"));

console.log("D — transportens graceful-fall (nätverksfri miljö)");
const skickat = await skicka({ fran: "test", till: "test", typ: "rapport", innehall: { x: 1 } });
ok("D1 skicka utan Supabase ⇒ false (aldrig kast)", skickat === false);
const läst = await lasSenaste(10);
ok("D2 lasSenaste utan Supabase ⇒ tom array", Array.isArray(läst) && läst.length === 0);

for (const [k, v] of Object.entries(SPARAD_ENV)) { if (v !== undefined) process.env[k] = v; }
console.log(`\nSVIT ORGAN-BUS: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
