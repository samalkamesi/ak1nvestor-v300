#!/usr/bin/env node
// Testsvit — KLIENTKONTEXTEN (våg 213 del b / o106): härledningarnas kontrakt
// (lästillstånd, påbörjad kurs, nästa steg-prioriteringen) + SSR-säkerhet.
// Kör: node verktyg/testa-klientkontext.mjs  (Node ≥ 22.18: type stripping)
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

const { INTRESSE_KURS, toppIntresseUrProfil, paborjadKurs, detekteraLasTillstand, predikteraNastaSteg, lasKlientkontext } = await import(
  pathToFileURL(join(ROT, "src/lib/klientkontext.ts")).href
);

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

const bas = { namn: null, niva: 1, xp: 0, streak: 1, klaraKurser: [], mal: null, intresseProfil: {}, aktivTid: 0, typiskaTimmar: [], quizTraff: 0, verktygsVanor: {}, senasteSida: "", lasTillstand: "nybörjare" };
const k = (over = {}) => ({ ...bas, ...over });

console.log("A — INTRESSE_KURS: fyra spårs flaggskepp");
ok("A1 fyra spår (teknisk/fundamental/portfölj/beteende)", ["teknisk", "fundamental", "portfölj", "beteende"].every((s) => INTRESSE_KURS[s]));
ok("A2 varje spår bär slug/titel/ikon/text", Object.values(INTRESSE_KURS).every((c) => c.slug && c.titel && c.ikon && c.text.length > 10));

console.log("B — toppIntresseUrProfil");
ok("B1 tom profil ⇒ null", toppIntresseUrProfil({}) === null);
ok("B2 nollpoäng räknas inte", toppIntresseUrProfil({ teknisk: 0 }) === null);
ok("B3 högsta vinner", toppIntresseUrProfil({ teknisk: 2, fundamental: 5, beteende: 1 }) === "fundamental");
ok("B4 lika ⇒ första i objektordning", toppIntresseUrProfil({ teknisk: 3, fundamental: 3 }) === "teknisk");

console.log("C — detekteraLasTillstand: resan, inte betyget");
ok("C1 nivå 25 ⇒ fas2-redo (porten)", detekteraLasTillstand(k({ niva: 25 })) === "fas2-redo");
ok("C2 >10 kurser + >70 % träff ⇒ avancerad", detekteraLasTillstand(k({ klaraKurser: Array.from({ length: 11 }, (_, i) => "k" + i), quizTraff: 80 })) === "avancerad");
ok("C3 11 kurser men svag träff ⇒ växande (ej avancerad)", detekteraLasTillstand(k({ klaraKurser: Array.from({ length: 11 }, (_, i) => "k" + i), quizTraff: 65 })) === "växande");
ok("C4 tre kurser ⇒ växande", detekteraLasTillstand(k({ klaraKurser: ["a", "b", "c"] })) === "växande");
ok("C5 två kurser + tunn träff ⇒ nybörjare", detekteraLasTillstand(k({ klaraKurser: ["a", "b"], quizTraff: 40 })) === "nybörjare");
ok("C6 två kurser men stark träff ⇒ växande (få men stark växer)", detekteraLasTillstand(k({ klaraKurser: ["a", "b"], quizTraff: 70 })) === "växande");

console.log("D — paborjadKurs: senaste sidan som kurs-signal");
ok("D1 icke-kurssida ⇒ null", paborjadKurs(k({ senasteSida: "/blogg" })) === null);
ok("D2 kursdjup underväg räknas inte", paborjadKurs(k({ senasteSida: "/kurser/abc/kapitel-2" })) === null);
ok("D3 klarad kurs räknas inte", paborjadKurs(k({ senasteSida: "/kurser/abc", klaraKurser: ["abc"] })) === null);
const pb = paborjadKurs(k({ senasteSida: "/kurser/vaglarans-hierarki" }));
ok("D4 påbörjad kurs ⇒ slug + länk", pb !== null && pb.slug === "vaglarans-hierarki" && pb.lank === "/kurser/vaglarans-hierarki");
ok("D5 titeln kapitaliseras läsbart", pb?.titel === "Vaglarans Hierarki");

console.log("E — predikteraNastaSteg: prioriteringskedjan (1→5 + fallback)");
ok("E1 bruten streak ⇒ Dagens Pass (sakerhet 88)", predikteraNastaSteg(k({ streak: 0 })).lank === "/dagens-pass" && predikteraNastaSteg(k({ streak: 0 })).sakerhet === 88);
const e2 = predikteraNastaSteg(k({ streak: 3, senasteSida: "/kurser/en-paborjadad" }));
ok("E2 påbörjad kurs vinner över allt utom streak", e2.lank === "/kurser/en-paborjadad" && e2.sakerhet === 82);
const e3 = predikteraNastaSteg(k({ streak: 3, quizTraff: 30 }));
ok("E3 tunn träff (0–50) ⇒ repetition", e3.lank === "/dagens-pass" && e3.ikon === "🔁");
const e4 = predikteraNastaSteg(k({ streak: 3, intresseProfil: { fundamental: 4 } }));
ok("E4 intressets topp ⇒ spårets flaggskepp", e4.lank === "/kurser/" + INTRESSE_KURS.fundamental.slug);
ok("E5 klarat flaggskeppet ⇒ faller vidare i kedjan", predikteraNastaSteg(k({ streak: 3, intresseProfil: { fundamental: 4 }, klaraKurser: [INTRESSE_KURS.fundamental.slug] })).lank !== "/kurser/" + INTRESSE_KURS.fundamental.slug);
ok("E6 fas2-redo ⇒ Fas 2-nudge", predikteraNastaSteg(k({ streak: 3, lasTillstand: "fas2-redo" })).lank === "/fas2-ansok");
const e7 = predikteraNastaSteg(k({ streak: 3 }));
ok("E7 fallback ⇒ kurstips eller bibliotek", e7.lank.startsWith("/kurser") && e7.sakerhet <= 50);
ok("E8 varje steg bår sakerhet 0–100 och ikon", [e2, e3, e4, e7].every((s) => s.sakerhet >= 0 && s.sakerhet <= 100 && s.ikon && s.suggestion.length > 5));

console.log("F — lasKlientkontext: SSR-säkert (servern ⇒ ny elevs kontext)");
const ctx = lasKlientkontext();
ok("F1 ingen krasch utan window/localStorage", true);
ok("F2 ny elev: namn null, tomma samlingar", ctx.namn === null && ctx.klaraKurser.length === 0 && ctx.senasteSida === "");
ok("F3 lasTillstand härleds (aldrig satt för hand)", ["nybörjare", "växande", "avancerad", "fas2-redo"].includes(ctx.lasTillstand));
ok("F4 talen är satta (xp/niva/streak)", ctx.xp === 0 && ctx.niva >= 1 && ctx.streak === 0);

console.log(`\nSVIT KLIENTKONTEXT: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
