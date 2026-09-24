/**
 * Kärnordsdisjunktionssond fönster 31 (s6-u1): mina kandidat-kärnord mot
 * SAMTLIGA befintliga lagers kärnord ( samma logik som kedjetestets J-fall,
 * men före byggstart). Tav-tolerans enligt motorn: ≤3 tecken = exakt,
 * ≤7 = 1, annars 2.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LIB = "/home/ak1a/AK1/src/lib";

const MINA = [
  "stålsektorn", "stålindustrin", "stålverket", "stålverk", "stålbolag", "stålbolaget",
  "stålcykeln", "stålräkning", "stålräkningen",
  "kapacitetsutnyttjande", "kapacitetsutnyttjandet", "utnyttjandegrad", "utnyttjandegraden",
  "kapacitetsloppet",
  "masugn", "masugnen", "masugnar",
  "ljusbågsugn", "ljusbågsugnen", "skrotverk", "skrotverket",
  "malmvägen", "skrotvägen",
  "järnmalmspris", "järnmalmspriset", "grossistpris", "grossistpriset",
  "skrotpris", "skrotpriset",
  "kärnplåt", "kärnplåten", "transformatorstål", "transformatorstålet",
  "elektriskt stål",
  "förädlingstrappan", "förädlingstrappa",
  "kontraktspris", "kontraktspriset", "kvartalsskuggan", "kvartalsskugga",
  "valsverk", "valsverket",
  "bessemerprocessen", "syrgasprocessen",
  "ugnens hävstång", "kapacitetens hävstång",
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

const minaDia = MINA.map(diafri);
const filer = readdirSync(LIB).filter((f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts"));
// Också basmotorn ai-mentor-svar.ts har MONSTER med karnord.
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
        if (a === b) { kollisioner.push("EXAKT: " + f + " «" + om[1] + "» = «" + b + "»"); continue; }
        if (a.includes(" ") || b.includes(" ")) continue;
        const tolerans = Math.max(a.length, b.length) <= 3 ? 0 : (Math.min(a.length, b.length) <= 7 ? 1 : 2);
        const d = tavstand(a, b);
        if (d <= Math.min(tolerans, 2)) kollisioner.push("tav " + d + ": " + f + " «" + om[1] + "» ~ «" + b + "»");
      }
    }
  }
}
console.log("Mina kärnord: " + MINA.length + " · mot " + antalOrd + " befintliga kärnord i " + kallor.length + " filer");
console.log("KOLLISIONER: " + kollisioner.length);
for (const k of kollisioner) console.log("  " + k);
if (kollisioner.length === 0) console.log("GRÖN — samtliga kärnord renta.");
