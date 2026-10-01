// v228 — beviskedjan för mimosa-kuren (node_modules-forra/.next-forra exkluderas).
// Kör: syntax ×2 → svitregression → EFTER-mätning mot PROD-trädet med
// kvalitetsvaktens EXAKTA flaggor. Skriver rapport till data/vakten/.
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const ROT = "/home/ak1a/agent/ak1";
const MIMOSA = join(ROT, "verktyg", "mimosa-paritet.mjs");
const SVIT = join(ROT, "verktyg", "testa-mimosa-paritet.mjs");
const PROD = "/home/ak1a/AK1";
const ut = [];

// 1) Syntax ×2 (execFileSync-arrayform — doktrinen)
for (const f of [MIMOSA, SVIT]) {
  execFileSync(process.execPath, ["--check", f], { encoding: "utf8" });
  ut.push(`SYNTAX OK: ${f.split("/").pop()}`);
}

// 2) Svitregression (hepa: ALLA PASS förväntat)
let svitUtgang = -1;
let svitStd = "";
try {
  svitStd = execFileSync(process.execPath, [SVIT], { encoding: "utf8", timeout: 120_000 });
  svitUtgang = 0;
} catch (e) {
  svitStd = String(e.stdout ?? "") + String(e.stderr ?? "");
  svitUtgang = e.status ?? -1;
}
ut.push(`SVIT exit=${svitUtgang}: ${svitStd.trim().split("\n").slice(-3).join(" | ")}`);

// 3) EFTER-mätning: kurerad skanner mot PROD-trädet, kvalitetsvaktens flaggor
//    (--doman . --hoppa-over testa-mimosa-paritet\.mjs$) — FÖRE = nattens
//    07:02-rapport: 2 fynd (GUL) i node_modules-forra.
const radata = join(PROD, "data", "vakten", "mimosa-fullscan-v228-EFTER.json");
const efter = spawnSync(process.execPath, [
  MIMOSA, "--katalog", PROD, "--doman", ".", "--hoppa-over", "testa-mimosa-paritet\\.mjs$", "--json", radata, "--tyst",
], { encoding: "utf8", timeout: 300_000 });
ut.push(`EFTER (prod-trädet) exit=${efter.status ?? -1}`);
try {
  const rap = JSON.parse(spawnSync(process.execPath, ["-e",
    `console.log(JSON.stringify(require(${JSON.stringify(radata)})))`],
    { encoding: "utf8" }).stdout.toString());
  const fynd = rap.fyndPoster ?? [];
  ut.push(`EFTER: skannadeFiler=${rap.skannadeFiler} fynd=${fynd.length} (FÖRE 07:02: 7537 filer / 2 fynd GUL)`);
  for (const f of fynd) ut.push(`  FYND KVAR: ${f.klass} ${f.fil}:${f.rad ?? "-"}`);
} catch (e) {
  ut.push(`EFTER: kunde ej läsa rådata (${e.message})`);
}

// 3b) EFTER-mätning mot ARBETSYTAN (där _v226-sondens fynd levde) — samma flaggor
const radata2 = join(ROT, "data", "vakten", "mimosa-fullscan-v228-ARBETSYTA.json");
const efter2 = spawnSync(process.execPath, [
  MIMOSA, "--katalog", ROT, "--doman", ".", "--hoppa-over", "testa-mimosa-paritet\\.mjs$", "--json", radata2, "--tyst",
], { encoding: "utf8", timeout: 300_000 });
ut.push(`EFTER (arbetsytan) exit=${efter2.status ?? -1}`);
try {
  const rap2 = JSON.parse(spawnSync(process.execPath, ["-e",
    `console.log(JSON.stringify(require(${JSON.stringify(radata2)})))`],
    { encoding: "utf8" }).stdout.toString());
  const fynd2 = rap2.fyndPoster ?? [];
  ut.push(`EFTER (arbetsytan): skannadeFiler=${rap2.skannadeFiler} fynd=${fynd2.length} (väntat 0 — _v226-sonden kurerad till arrayform)`);
  for (const f of fynd2) ut.push(`  FYND KVAR: ${f.klass} ${f.fil}:${f.rad ?? "-"}`);
} catch (e) {
  ut.push(`EFTER (arbetsytan): kunde ej läsa rådata (${e.message})`);
}

// 4) Kontrastmätning: gamla (okurerade) skannerns exkluderingslista får INTE
//    styra — beviset att exkluderingen bär: kör kurad skanner på bara forra-
//    katalogens innehåll? Nej — enkelt kontraktsvittne i stället: listan.
const kalla = spawnSync(process.execPath, ["-e",
  `const t = require("node:fs").readFileSync(${JSON.stringify(MIMOSA)}, "utf8"); ` +
  `const m = t.match(/\\[\"\\.git\"[^\\]]*\\]/); ` +
  `console.log(m ? m[0] : "LISTA SAKNAS");`],
  { encoding: "utf8" });
ut.push(`EXKLUDERINGSLista i kurad skanner: ${kalla.stdout.toString().trim().slice(0, 200)}`);

const rapport = ut.join("\n");
writeFileSync(join(ROT, "data", "vakten", "v228-mimosa-kur-bevis.txt"), `${new Date().toISOString()}\n${rapport}\n`);
console.log(rapport);
