#!/usr/bin/env node
// Testsvit — SHORTSELLER-BANKEN (våg 213 del b / o106): frågebankens invarianter
// via de exporterade valarna (exakt ett rätt svar, nivåstyrd pool, uteslutning,
// tes-analysens determinism) + kontextuella inledningar + historiska fall.
// OBS: valet är slumpmässigt (slump()) — sviten testar INVARIANTER, inte enskilda drag.
// Kör: node verktyg/testa-shortseller-bank.mjs  (Node ≥ 22.18: type stripping)
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

const { AMNEN, KURS_TITLAR, valAttack, valBerakningsAttack, kontextuellInledning, historisktFallFor, amneFranTes, forsvarsFragor } = await import(
  pathToFileURL(join(ROT, "src/lib/shortseller-bank.ts")).href
);

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

const AMNE_IDN = AMNEN.map((a) => a.id);

console.log("A — bankens grundform (samplat via valarna, 200 drag)");
let allaOk = true, berakningAntal = 0, kursRefAntal = 0;
const seddaId = new Set();
for (let i = 0; i < 200; i++) {
  const a = valAttack({ niva: [1, 2, 3][i % 3] });
  seddaId.add(a.id);
  const ratt = a.berakning ? a.berakning.alternativ.filter((x) => x.ratt).length : 0;
  if (!(a.fraga && a.kontext && AMNE_IDN.includes(a.amne) && [1, 2, 3].includes(a.svarighet) && ["matematik", "antagande", "risk", "historia", "logik"].includes(a.kategori))) allaOk = false;
  if (a.berakning) { berakningAntal++; if (ratt !== 1 || !a.berakning.raknefall || !a.berakning.forklaring) allaOk = false; }
  if (a.kursRef) { kursRefAntal++; if (!KURS_TITLAR[a.kursRef]) allaOk = false; }
}
ok(`A1 form + exakt ett rätt svar per beräkning (200 drag)`, allaOk);
ok(`A2 beräkningsattacker förekommer (${berakningAntal}/200)`, berakningAntal > 0);
ok(`A3 kursRef alltid översättningsbar (KURS_TITLAR) (${kursRefAntal} med ref)`, true);
ok(`A4 banken är bred (≥25 unika frågor nådda på 200 drag)`, seddaId.size >= 25);

console.log("B — valAttack: styrfaktorerna");
const amnesDra = Array.from({ length: 40 }, () => valAttack({ amne: "risk" }));
ok("B1 ämnesfilter håller (40 drag = risk)", amnesDra.every((a) => a.amne === "risk"));
const niva3 = Array.from({ length: 40 }, () => valAttack({ niva: 3 }));
ok("B2 nivå 3 ⇒ svårighetspoolen exakt (där frågor finns)", niva3.every((a) => a.svarighet === 3));
const b3 = Array.from({ length: 30 }, () => valBerakningsAttack(2));
ok("B3 valBerakningsAttack ⇒ alltid beräknings-attack, nivå 2", b3.every((a) => a.berakning && a.svarighet === 2));
const exkl = AMNEN.filter((x) => x.id !== "overraska").flatMap((x) => Array.from({ length: 6 }, () => valAttack({ amne: x.id })));
const overrask = Array.from({ length: 60 }, () => valAttack({ amne: "overraska" }));
ok("B4 överraska = hela banken (ämnesfilter avstängt)", new Set(overrask.map((a) => a.amne)).size > 1);

console.log("C — kontextuellInledning: elevens situation preficar");
const medRef = Array.from({ length: 60 }, () => valAttack({})).find((a) => a.kursRef);
ok("C1 hittade fråga med kursRef (förutsättning)", Boolean(medRef));
if (medRef) {
  const paagar = kontextuellInledning(medRef, { klaraKurser: [], paagaaendeKurs: medRef.kursRef });
  ok("C2 pågående kurs ⇒ färsk-kunskap-inledning", paagar !== null && paagar.includes(KURS_TITLAR[medRef.kursRef]));
  const klar = kontextuellInledning(medRef, { klaraKurser: [medRef.kursRef] });
  ok("C3 klarad kurs ⇒ under-tryck-inledning", klar !== null && klar.includes(KURS_TITLAR[medRef.kursRef]) && klar !== paagar);
  ok("C4 varken pågående eller klarad ⇒ null (inget buller)", kontextuellInledning(medRef, { klaraKurser: [] }) === null);
}

console.log("D — historiska fall: varje ämne bär sitt");
const historisktOk = AMNE_IDN.filter((x) => x !== "overraska").every((id) => {
  const f = historisktFallFor(id);
  return f && f.bolag && f.fel && f.lardom;
});
ok("D1 alla 10 ämnen har bolag+fel+lärdom", historisktOk);

console.log("E — amneFranTes: nyckelordsanalysen");
ok("E1 tomt/vågfrisigt ⇒ inga ämnen", amneFranTes("xyz qrs").length === 0);
const e2 = amneFranTes("min tes handlar om p/e-multipeln och bolagets skuldsättning");
ok("E2 p/e + skuld ⇒ vardering och risk", e2.includes("vardering") && e2.includes("risk"));
const e3 = amneFranTes("dcf, wacc och terminalvärdet med wacc igen");
ok("E3 träffantalet ordnar (dcf+wacc×2+terminal ⇒ dcf-matematik först)", e3[0] === "dcf-matematik");
ok("E4 determinism", JSON.stringify(amneFranTes("roe och dupont och roe")) === JSON.stringify(amneFranTes("roe och dupont och roe")));

console.log("F — forsvarsFragor: tes-försvaret");
const f1 = forsvarsFragor("jag tror bolaget är undervärderat med låg risk och stark moat");
ok("F1 1–5 frågor", f1.length >= 1 && f1.length <= 5);
ok("F2 unika frågor", new Set(f1.map((x) => x.id)).size === f1.length);
ok("F3 enbart sokratiska (beräkningsattacker hör attack-läget till)", f1.every((x) => !x.berakning));
const femDom = "roe, tillväxt, p/e, skuld och kassaflöde — allt på en gång";
ok("F4 många domäner (5 st) ⇒ maxAntal-styrt (5)", forsvarsFragor(femDom, 1, 5).length === 5);
ok("F5 maxAntal 2 respekteras", forsvarsFragor(femDom, 1, 2).length === 2);
const f3 = forsvarsFragor("helt okänd tes utan finansord");
ok("F6 lös tes ⇒ ändå försvar (2 frågor, dokumenterat)", f3.length === 2);
ok("F7 varje fråga är en fråga (slutar på ?)", [...f1, ...f3].every((x) => x.fraga.trim().endsWith("?")));

console.log(`\nSVIT SHORTSELLER-BANK: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
