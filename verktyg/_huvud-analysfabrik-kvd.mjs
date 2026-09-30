// KVD-sond för analysfabriksutvidgningen — verifierar leveransen INNAN commit.
import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const REPO = "/home/ak1a/agent/ak1";
const DIR = REPO + "/data/forskningsbiblioteket";

const filer = readdirSync(DIR).filter((f) => f.endsWith(".json"));
console.log("1. FILANTAL:", filer.length, "(förväntat 76)");

// 2. Skillnad mot git (nya vs ändrade)
const git = (args) =>
  execFileSync("git", ["-C", REPO, ...args], { encoding: "utf8", timeout: 60_000 });
const status = git(["status", "--porcelain", "--", "data/forskningsbiblioteket"]);
const nya = status.split("\n").filter((l) => l.startsWith("??")).length;
const andrade = status.split("\n").filter((l) => l.startsWith(" M")).length;
console.log("2. GIT: nya filer", nya, "· ändrade befintliga", andrade, "(förväntat 54 nya + 22 ändrade)");

// 3. Juridikgrind — rådsverb får ALDRIG förekomma i genererad text.
//    Vitlista: återköp (V20-term), "ej rådgivning"-disclaimerns egen text.
const RADMÖNSTER = [
  [/\bköpa?\b(?!\s+(tillbaka|in))/i, "köp"],
  [/\bsälja?\b/i, "sälj"],
  [/\brekommendera(r|t|de)?\b/i, "rekommendera"],
  [/råd\s+till\s+att\s+(köpa|sälja)/i, "råd till att"],
  [/\bbör\s+du\b/i, "bör du"],
  [/investera\s+i\s+(denna|detta|aktien)/i, "investera i denna"],
];
const träffar = [];
for (const f of filer) {
  const text = readFileSync(DIR + "/" + f, "utf8");
  const ren = text
    .replaceAll("återköp", "X").replaceAll("Återköp", "X")
    .replaceAll("rådgivning", "Y").replaceAll("rådgivare", "Y");
  for (const [re, namn] of RADMÖNSTER) {
    const m = ren.match(re);
    if (m) träffar.push(`${f}: "${namn}" → ${text.slice(Math.max(0, text.search(re) - 40), text.search(re) + 60).replace(/\s+/g, " ")}`);
  }
}
console.log("3. JURIDIKGRIND:", träffar.length === 0 ? "0 träffar — GRÖN" : träffar.length + " TRÄFFAR:");
träffar.slice(0, 10).forEach((t) => console.log("   ", t));

// 4. Schemastickprov — samtliga filer bär analysfabrik-v1 + disclaimer + etikett
let schemaFel = 0;
for (const f of filer) {
  const j = JSON.parse(readFileSync(DIR + "/" + f, "utf8"));
  if (j.schema !== "analysfabrik-v1") { schemaFel++; console.log("   ", f, "fel schema:", j.schema); }
  if (!j.disclaimer?.includes("ej rådgivning") && !j.disclaimer?.includes("aldrig investeringsrådgivning")) { schemaFel++; console.log("   ", f, "disclaimer saknas"); }
  if (!Array.isArray(j.risker) || j.risker.length < 3) { schemaFel++; console.log("   ", f, "för få risker:", j.risker?.length); }
  if (!Array.isArray(j.falsifiering) || j.falsifiering.length < 3) { schemaFel++; console.log("   ", f, "för få falsifieringsvillkor"); }
  if (j.versionsdatum !== "2026-09-30") { schemaFel++; console.log("   ", f, "versionsdatum:", j.versionsdatum); }
}
console.log("4. SCHEMA (76 filer):", schemaFel === 0 ? "ALLA GRÖNA (v1 + disclaimer + ≥3 risker + ≥3 villkor + dagens datum)" : schemaFel + " FEL");

// 5. Befintliga 22: innehållsskillnad utöver versionsdatum?
const diffStat = git(["diff", "--numstat", "--", "data/forskningsbiblioteket"]);
const rader = diffStat.trim().split("\n").filter(Boolean);
let baraDatum = 0, talÄndrade = 0;
for (const rad of rader) {
  const [add, del] = rad.split("\t")[0].split(" ").map(Number);
  // versionsdatum + ev. underlagSenastKontrollerad ≈ 1-2 rader per fil i kompakt JSON (1 rad? fil skrivs med indent 1)
  if (add <= 4 && del <= 4) baraDatum++;
  else talÄndrade++;
}
console.log("5. DIFF DE 22:", rader.length, "ändrade · smådiff (≈datum):", baraDatum, "· STORRE DIFF (tal rörda):", talÄndrade);
if (talÄndrade > 0) console.log("   (större diffar är förväntade om korstabellens tal ändrats sedan våg 57 — deterministiskt ur samma källor)");
