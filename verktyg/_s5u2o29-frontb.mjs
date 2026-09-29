#!/usr/bin/env node
// FRONT B för s5-u2 o29 — rekommendationsmaskinen (raknaLarvag) mot de två
// nya kurserna: kategori-fortsättning med nivåmatch · STARTER-skydd ·
// syskonkurser oskadda · determinism bitidentisk.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
// larvag.ts importerar relativa moduler ÄNDELSÖT ("./larvag-karta") — node:s
// typstrippning kräver .ts-ändelser. Bygg en tempkopia med omskrivna
// specifiers (samma trick som testa-ai-mentor.mjs löser andra vägen: det
// importerar en modul UTAN relativa beroenden).
const TEMP = join("/tmp", "s5u2o29-frontb-lib"); // UTANFÖR repot — tsc ser allt under verktyg/
mkdirSync(TEMP, { recursive: true });
for (const f of ["larvag.ts", "larvag-karta.ts", "kurstips.ts", "member-local.ts"]) {
  const t = readFileSync(join(HÄR, "..", "src", "lib", f), "utf8")
    .replace(/(from "\.\/[a-z-]+)"/g, '$1.ts"');
  writeFileSync(join(TEMP, f), t);
}
const { raknaLarvag } = await import(pathToFileURL(join(TEMP, "larvag.ts")).href);
const { LARVAG_KARTA } = await import(pathToFileURL(join(TEMP, "larvag-karta.ts")).href);

let pass = 0, fel = 0;
const OK = (namn, villkor, bevis = "") => {
  if (villkor) { pass++; console.log("PASS " + namn + (bevis ? " — " + bevis : "")); }
  else { fel++; console.log("FEL " + namn + (bevis ? " — " + bevis : "")); }
};

const register = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
const peKat = register["pe-09-utdelningsrekapitaliseringen"].category;
const vmSlugs = Object.keys(register).filter((s) => register[s].category === peKat && s !== "pe-09-utdelningsrekapitaliseringen"); // hela PE-kategorin klarad utom pe-09
const udKat = register["ud-10-ex-dagens-mekanik"].category;
const udSlugs = Object.keys(register).filter((s) => register[s].category === udKat && s !== "ud-10-ex-dagens-mekanik"); // hela kategorin klarad utom ud-10
OK("förvilla pe-kategorin", vmSlugs.length >= 8 && vmSlugs.includes("pe-08-avgiftsmaskinen"), vmSlugs.length + " st klarade (pe-09 oklar)");
OK("förvilla ud-kategorin", udSlugs.length >= 9 && udSlugs.includes("ud-09-utdelningens-hallbarhet"), udSlugs.length + " st klarade (ud-10 oklar)");

// ── 1. Kategori-fortsättning med nivåmatch ×2 (BAS 86 + 4) ────────────────────
const simVm = raknaLarvag(
  { xp: 6000, klaraKurser: vmSlugs },
  { lasTillstand: "avancerad", fas: 1, streak: 2, svagheter: {} },
  { antal: 10 },
);
const vm12 = simVm.find((r) => r.slug === "pe-09-utdelningsrekapitaliseringen");
OK("vm-12 nominerad", !!vm12, vm12 ? "i listan" : "SAKNAS");
if (vm12) {
  OK("pe-09 kategori-fortsättning", vm12.regel === "kategori-fortsattning", "regel: " + vm12.regel);
  OK("pe-09 poäng 90 (86+nivåmatch)", vm12.poäng === 90, "poäng " + vm12.poäng);
  OK("pe-09 varför-rad personlig", /Du är igång i private equity/i.test(vm12.varför), "«" + vm12.varför.slice(0, 60) + "…»");
  OK("pe-09 titel/minuter från kartan", vm12.titel === register["pe-09-utdelningsrekapitaliseringen"].title && vm12.minuter === 24, vm12.titel.slice(0, 30) + " · " + vm12.minuter + " min");
}

const simUd = raknaLarvag(
  { xp: 6000, klaraKurser: udSlugs },
  { lasTillstand: "växande", fas: 1, streak: 2, svagheter: {} },
  { antal: 10 },
);
const ud10 = simUd.find((r) => r.slug === "ud-10-ex-dagens-mekanik");
OK("ud-10 nominerad", !!ud10, ud10 ? "i listan" : "SAKNAS");
if (ud10) {
  OK("ud-10 kategori-fortsättning", ud10.regel === "kategori-fortsattning", "regel: " + ud10.regel);
  OK("ud-10 poäng 90 (86+nivåmatch)", ud10.poäng === 90, "poäng " + ud10.poäng);
  OK("ud-10 varför-rad personlig", /Du är igång i utdelningsstrategi/.test(ud10.varför), "«" + ud10.varför.slice(0, 60) + "…»");
  OK("ud-10 titel/minuter från kartan", ud10.titel === register["ud-10-ex-dagens-mekanik"].title && ud10.minuter === 22, ud10.titel.slice(0, 30) + " · " + ud10.minuter + " min");
}

// ── 2. STARTER-skydd: default-läget orört av nya kurser ───────────────────────
const simDefault = raknaLarvag(
  { xp: 0, klaraKurser: [] },
  { lasTillstand: "nybörjare", fas: 1, streak: 0, svagheter: {} },
);
OK("default = 3 STARTER-kurser", simDefault.length === 3, simDefault.map((r) => r.slug).join(" · "));
OK("default etta = v01 (spar-nasta)", simDefault[0]?.slug === "v01-forsaljningstillvaxt", simDefault[0]?.regel);
OK("nya kurser ej STARTER", !simDefault.some((r) => ["pe-09-utdelningsrekapitaliseringen", "ud-10-ex-dagens-mekanik"].includes(r.slug)), "borta från default");

// ── 3. Syskonkurser oskadda i kartan ──────────────────────────────────────────
for (const syskon of ["vr-10-enhetsmultiplar", "kt-11-indexinklusionen", "mt-09-regleringsmoat", "bk-09-valutadifferenserna"]) {
  const i = LARVAG_KARTA.findIndex((k) => k.slug === syskon);
  const reg = register[syskon];
  OK("syskon i karta " + syskon, i >= 0 && !!reg, i >= 0 && reg ? "karta@" + i + " + register" : "saknas (ev. ej landad ännu)");
}
const kartaSlugs = new Set(LARVAG_KARTA.map((k) => k.slug));
const fantomer = [...kartaSlugs].filter((s) => !(s in register));
const saknade = Object.keys(register).filter((s) => !kartaSlugs.has(s));
OK("karta↔register paritet", fantomer.length === 0 && saknade.length === 0, LARVAG_KARTA.length + " = " + Object.keys(register).length + " · 0 fantomer · 0 saknade");

// infogningen bevarar parvis ordning: existerande kurser får aldrig byta plats
const idx = (arr, s) => arr.indexOf(s);
const regOrdning = Object.keys(register);
const kartOrdning = LARVAG_KARTA.map((k) => k.slug);
const utANya = regOrdning.filter((s) => !["pe-09-utdelningsrekapitaliseringen", "ud-10-ex-dagens-mekanik", "vr-10-enhetsmultiplar", "kt-11-indexinklusionen", "mt-09-regleringsmoat", "bk-09-valutadifferenserna"].includes(s));
const kartUtan = kartOrdning.filter((s) => !["pe-09-utdelningsrekapitaliseringen", "ud-10-ex-dagens-mekanik", "vr-10-enhetsmultiplar", "kt-11-indexinklusionen", "mt-09-regleringsmoat", "bk-09-valutadifferenserna"].includes(s));
OK("infogning bevarar ordning", utANya.every((s, i) => kartUtan[i] === s), "existerande kurser i oförändrad sekvens");

// ── 4. Determinism ×2 bitidentisk ────────────────────────────────────────────
const vmIgen = raknaLarvag({ xp: 6000, klaraKurser: vmSlugs }, { lasTillstand: "avancerad", fas: 1, streak: 2, svagheter: {} }, { antal: 10 });
const udIgen = raknaLarvag({ xp: 6000, klaraKurser: udSlugs }, { lasTillstand: "växande", fas: 1, streak: 2, svagheter: {} }, { antal: 10 });
const defIgen = raknaLarvag({ xp: 0, klaraKurser: [] }, { lasTillstand: "nybörjare", fas: 1, streak: 0, svagheter: {} });
OK("determinism vm ×2", JSON.stringify(vmIgen) === JSON.stringify(simVm), "bitidentisk");
OK("determinism ud ×2", JSON.stringify(udIgen) === JSON.stringify(simUd), "bitidentisk");
OK("determinism default ×2", JSON.stringify(defIgen) === JSON.stringify(simDefault), "bitidentisk");

console.log("══════════════════════════════════");
console.log("FRONT B: " + pass + " PASS · " + fel + " FEL");
process.exit(fel ? 1 : 0);
