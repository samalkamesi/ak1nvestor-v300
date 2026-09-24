/**
 * Kärnordsdisjunktionssond omgång 33 (s6-u1, manifest auto-s6-1789999525797):
 * banksekorns kandidat-kärnord mot SAMTLIGA befintliga lagers kärnord
 * (samma logik som _s6u1o31-karnord.mjs). Tav-tolerans enligt motorn:
 * ≤3 tecken = exakt, ≤7 = 1, annars 2.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LIB = "/home/ak1a/AK1/src/lib";

const MINA = [
  //familjen: sektorn + maskinen
  "banksektorn", "bankbranschen", "bankräkning", "bankräkningen", "bankbolag",
  "nätlånet", "nätlån", "nätlånsintäkt", "nätlånsintäkten", "nätlånsintäkter",
  "räntenätet", "räntenät", "räntenätets",
  "inlåningsfranchisen", "inlåningsfranchise", "inlåningsandelen",
  "deposit-beta", "deposit betan", "inlåningsbetan",
  "inlåningsräntan", "inlåningsränta",
  "kreditförlust", "kreditförlusten", "kreditförluster", "kreditförlusterna",
  "kreditförlustnivå", "kreditförlustnivån",
  "förlusttrappan", "förlusttrappor", "förlusttrapporna",
  "K/I-talet", "KI-talet", "kostnads-intäktskvoten",
  "kapitaltäckning", "kapitaltäckningen",
  "kärnprimärkapitalrelationen", "kärnprimärkapital",
  "riskvägda tillgångar", "utdelningsekvationen",
  "riskjusterat räntenät", "riskjusterade räntenätet",
  "räntesvängen", "räntesväng",
  "inlåning", "inlåningen", "utlåning", "utlåningen", "utlåningsboken",
  "penningmarknadsfinansiering", "belåningsgraden",
  "Sveabolån", "Kreditia", "Fondia",
  "bankens hävstång", "reglerade hävstången",
  "sparkontot", "lönekontot",
  "provisionscykel", "provisionscykeln",
  "växa eller dela",
];

function diafri(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim()
    .normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
function tavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (!n) return m; if (!m) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
    }
    fore = [...nu];
  }
  return fore[m];
}

const minaDia = MINA.map((w) => ({ raw: w, d: diafri(w) }));
const filer = readdirSync(LIB).filter((f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts"));
const kallor = [...filer.map((f) => ({ f, t: readFileSync(join(LIB, f), "utf8") })),
  { f: "ai-mentor-svar.ts", t: readFileSync(join(LIB, "ai-mentor-svar.ts"), "utf8") }];

const kollisioner = [];
let antalOrd = 0;
for (const { f, t } of kallor) {
  for (const block of t.matchAll(/karnord: \[([^\]]+)\]/g)) {
    for (const om of block[1].matchAll(/"([^"]+)"/g)) {
      antalOrd++;
      const a = diafri(om[1]);
      for (const b of minaDia) {
        if (a === b.d) { kollisioner.push("EXAKT: " + f + " «" + om[1] + "» = «" + b.raw + "»"); continue; }
        if (a.includes(" ") || b.d.includes(" ")) continue;
        const tolerans = Math.max(a.length, b.d.length) <= 3 ? 0 : (Math.min(a.length, b.d.length) <= 7 ? 1 : 2);
        const d = tavstand(a, b.d);
        if (d <= Math.min(tolerans, 2)) kollisioner.push("tav " + d + ": " + f + " «" + om[1] + "» ~ «" + b.raw + "»");
      }
    }
  }
}
console.log("Mina kandidater: " + MINA.length + " · mot " + antalOrd + " befintliga kärnord i " + kallor.length + " filer");
console.log("KOLLISIONER: " + kollisioner.length);
for (const k of kollisioner) console.log("  " + k);
if (kollisioner.length === 0) console.log("GRÖN — samtliga kärnord renta.");
