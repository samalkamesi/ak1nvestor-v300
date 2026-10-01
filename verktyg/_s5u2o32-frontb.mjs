#!/usr/bin/env node
// FRONT B för s5-u2 o32 — rekommendationsmaskinen (raknaLarvag) mot de två
// nya kurserna: kategori-fortsättning med nivåmatch · STARTER-skydd ·
// syskonkurser oskadda · determinism bitidentisk · register-paritet.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
// larvag.ts importerar relativa moduler ÄNDELSÖT — tempkopia med .ts-ändelser
// (samma trick som _s5u2o29-frontb.mjs; UTANFÖR repot så tsc ser allt under verktyg/).
const TEMP = join("/tmp", "s5u2o32-frontb-lib");
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
const stKat = register["st-09-konkursordningen"].category;
const stSlugs = Object.keys(register).filter((s) => register[s].category === stKat && s !== "st-09-konkursordningen");
const vmKat = register["vm-12-reverserad-dcf"].category;
const vmSlugs = Object.keys(register).filter((s) => register[s].category === vmKat && s !== "vm-12-reverserad-dcf");
OK("förvilla STABILITET-kategorin", stSlugs.length >= 10 && stSlugs.includes("st-08-bindningsrisken"), stSlugs.length + " st klarade (st-09 oklar)");
OK("förvilla VÄRDERINGSMETODER-kategorin", vmSlugs.length >= 20 && vmSlugs.includes("vm-11-waccfallor"), vmSlugs.length + " st klarade (vm-12 oklar)");

// ── 1. Kategori-fortsättning med nivåmatch ×2 (BAS 86 + 4) ───────────────────
const simSt = raknaLarvag(
  { xp: 6000, klaraKurser: stSlugs },
  { lasTillstand: "växande", fas: 1, streak: 2, svagheter: {} },
  { antal: 10 },
);
const st09 = simSt.find((r) => r.slug === "st-09-konkursordningen");
OK("st-09 nominerad", !!st09, st09 ? "i listan" : "SAKNAS");
if (st09) {
  OK("st-09 kategori-fortsättning", st09.regel === "kategori-fortsattning", "regel: " + st09.regel);
  OK("st-09 poäng 90 (86+nivåmatch Intermediär/växande)", st09.poäng === 90, "poäng " + st09.poäng);
  OK("st-09 varför-rad personlig", /Du är igång i (stabilitet|skatt)/i.test(st09.varför), "«" + st09.varför.slice(0, 70) + "…»");
  OK("st-09 titel/minuter från registret", st09.titel === register["st-09-konkursordningen"].title && st09.minuter === 24, st09.titel.slice(0, 34) + " · " + st09.minuter + " min");
}

const simVm = raknaLarvag(
  { xp: 6000, klaraKurser: vmSlugs },
  { lasTillstand: "avancerad", fas: 1, streak: 2, svagheter: {} },
  { antal: 10 },
);
const vm12 = simVm.find((r) => r.slug === "vm-12-reverserad-dcf");
OK("vm-12 nominerad", !!vm12, vm12 ? "i listan" : "SAKNAS");
if (vm12) {
  OK("vm-12 kategori-fortsättning", vm12.regel === "kategori-fortsattning", "regel: " + vm12.regel);
  OK("vm-12 poäng 90 (86+nivåmatch Avancerad/avancerad)", vm12.poäng === 90, "poäng " + vm12.poäng);
  OK("vm-12 varför-rad personlig", /Du är igång i (värderingsmetoder|värdering)/i.test(vm12.varför), "«" + vm12.varför.slice(0, 70) + "…»");
  OK("vm-12 titel/minuter från registret", vm12.titel === register["vm-12-reverserad-dcf"].title && vm12.minuter === 24, vm12.titel.slice(0, 34) + " · " + vm12.minuter + " min");
}

// ── 2. STARTER-skydd: nybörjare får inte st-09/vm-12 tvingade (omvänd riktning) ─
const simNy = raknaLarvag(
  { xp: 0, klaraKurser: [] },
  { lasTillstand: "nyborjare", fas: 1, streak: 0, svagheter: {} },
  { antal: 10 },
);
const nySlugs = simNy.map((r) => r.slug);
OK("STARTER: st-09 ej först för nybörjare", !(nySlugs[0] === "st-09-konkursordningen"), "etta: " + nySlugs[0]);
OK("STARTER: vm-12 ej först för nybörjare", !(nySlugs[0] === "vm-12-reverserad-dcf"), "etta: " + nySlugs[0]);

// ── 3. Syskonkurser oskadda: am-10 (u1) fortfarande nominerbar i sin kategori ─
const amKat = register["am-10-insynslistan"]?.category;
if (amKat) {
  const amSlugs = Object.keys(register).filter((s) => register[s].category === amKat && s !== "am-10-insynslistan");
  const simAm = raknaLarvag(
    { xp: 6000, klaraKurser: amSlugs },
    { lasTillstand: "växande", fas: 1, streak: 2, svagheter: {} },
    { antal: 10 },
  );
  const am10 = simAm.find((r) => r.slug === "am-10-insynslistan");
  OK("syskonet am-10 fortfarande nominerad i sin kategori", !!am10 && am10.regel === "kategori-fortsattning", am10 ? "poäng " + am10.poäng : "saker");
}

// ── 4. Kartordning: st-09 efter st-08, vm-12 efter vm-11 (serieordning bevarad) ─
const kartSlugs = LARVAG_KARTA.map((k) => k.slug ?? k).filter((s) => typeof s === "string");
const ixSt08 = kartSlugs.indexOf("st-08-bindningsrisken"), ixSt09 = kartSlugs.indexOf("st-09-konkursordningen");
const ixVm11 = kartSlugs.indexOf("vm-11-waccfallor"), ixVm12 = kartSlugs.indexOf("vm-12-reverserad-dcf");
OK("kartordning st-08 < st-09", ixSt08 !== -1 && ixSt09 !== -1 && ixSt08 < ixSt09, ixSt08 + " < " + ixSt09);
OK("kartordning vm-11 < vm-12", ixVm11 !== -1 && ixVm12 !== -1 && ixVm11 < ixVm12, ixVm11 + " < " + ixVm12);

// ── 5. Determinism: två körningar bitidentiska ────────────────────────────────
const a = JSON.stringify(raknaLarvag({ xp: 6000, klaraKurser: stSlugs }, { lasTillstand: "växande", fas: 1, streak: 2, svagheter: {} }, { antal: 10 }));
const b = JSON.stringify(raknaLarvag({ xp: 6000, klaraKurser: stSlugs }, { lasTillstand: "växande", fas: 1, streak: 2, svagheter: {} }, { antal: 10 }));
OK("determinism bitidentisk", a === b);

// ── 6. Register-paritet: nivå/kategori stämmer mot källfilerna ────────────────
const stKalla = JSON.parse(readFileSync("/home/ak1a/AK1/data/kurser-tillagg/st-09-konkursordningen.json", "utf8"));
const vmKalla = JSON.parse(readFileSync("/home/ak1a/AK1/data/kurser-tillagg/vm-12-reverserad-dcf.json", "utf8"));
OK("register st-09 == källfil", JSON.stringify(register["st-09-konkursordningen"]) === JSON.stringify(stKalla));
OK("register vm-12 == källfil", JSON.stringify(register["vm-12-reverserad-dcf"]) === JSON.stringify(vmKalla));
OK("nivåer", stKalla.level === "Intermediär" && vmKalla.level === "Avancerad", stKalla.level + " · " + vmKalla.level);

console.log("\n═ FRONT B SLUT: " + pass + " PASS · " + fel + " FEL ═");
process.exit(fel === 0 ? 0 : 1);
