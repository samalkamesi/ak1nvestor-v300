/**
 * Sond 2 för spår 6, omgång 13, s6-u2: SLUTGILTIGA kärnord för
 * stabilitetsdjup-lagret — kollisionskontroll (exakt + felstavningstolerans)
 * mot hela kedjan. Kör: node verktyg/_s6u2-sond2-omg13.mjs
 */
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROT = "/home/ak1a/AK1";
const LIB = pathToFileURL(join(ROT, "src/lib")).href + "/";

const MOTORDEFS = [
  ["makro", "ai-mentor-makro-fragor.ts", "svaraLokaltMakro", "MAKRO_MONSTER"],
  ["extra", "ai-mentor-extra-fragor.ts", "svaraLokaltExtra", "EXTRA_MONSTER"],
  ["bas", "ai-mentor-svar.ts", "svaraLokalt", "MONSTER"],
  ["nasta", "ai-mentor-nasta-fragor.ts", "svaraLokaltNasta", "NASTA_MONSTER"],
  ["kapitalmekanik", "ai-mentor-kapitalmekanik-fragor.ts", "svaraLokaltKapitalmekanik", "KAPITALMEKANIK_MONSTER"],
  ["sektor", "ai-mentor-sektor-fragor.ts", "svaraLokaltSektor", "SEKTOR_MONSTER"],
  ["case", "ai-mentor-case-fragor.ts", "svaraLokaltCase", "CASE_MONSTER"],
  ["praktik", "ai-mentor-praktik-fragor.ts", "svaraLokaltPraktik", "PRAKTIK_MONSTER"],
  ["portfoljgrund", "ai-mentor-portfoljgrund-fragor.ts", "svaraLokaltPortfoljgrund", "PORTFOLJGRUND_MONSTER"],
  ["agande", "ai-mentor-agande-fragor.ts", "svaraLokaltAgande", "AGANDE_MONSTER"],
  ["redovisningsdjup", "ai-mentor-redovisningsdjup-fragor.ts", "svaraLokaltRedovisningsdjup", "REDOVISNINGSDJUP_MONSTER"],
  ["djup", "ai-mentor-djup-fragor.ts", "svaraLokaltDjup", "DJUP_MONSTER"],
  ["historia", "ai-mentor-historia-fragor.ts", "svaraLokaltHistoria", "HISTORIA_MONSTER"],
  ["lonsamhetsdjup", "ai-mentor-lonsamhetsdjup-fragor.ts", "svaraLokaltLonsamhetsdjup", "LONSAMHETSDJUP_MONSTER"],
  ["tsdjup", "ai-mentor-tsdjup-fragor.ts", "svaraLokaltTsdjup", "TSDJUP_MONSTER"],
  ["skattedjup", "ai-mentor-skattedjup-fragor.ts", "svaraLokaltSkattedjup", "SKATTEDJUP_MONSTER"],
  ["beteendedjup", "ai-mentor-beteendedjup-fragor.ts", "svaraLokaltBeteendedjup", "BETEENDEDJUP_MONSTER"],
  ["riskdjup", "ai-mentor-riskdjup-fragor.ts", "svaraLokaltRiskdjup", "RISKDJUP_MONSTER"],
  ["riskmattsdjup", "ai-mentor-riskmattsdjup-fragor.ts", "svaraLokaltRiskmattsdjup", "RISKMATTSDJUP_MONSTER"],
  ["utdelningsdjup", "ai-mentor-utdelningsdjup-fragor.ts", "svaraLokaltUtdelningsdjup", "UTDELNINGSDJUP_MONSTER"],
  ["forvantningsdjup", "ai-mentor-forvantningsdjup-fragor.ts", "svaraLokaltForvantningsdjup", "FÖRVÄNTNINGSDJUP_MONSTER"],
  ["portfoljbalans", "ai-mentor-portfoljbalans-fragor.ts", "svaraLokaltPortfoljbalans", "PORTFOLJBALANS_MONSTER"],
];

const { KURSREGISTER } = await import(LIB + "ai-mentor-register.ts");
const MOTORER = [];
for (const [namn, fil, fn, arr] of MOTORDEFS) {
  const m = await import(LIB + fil);
  MOTORER.push({ namn, fnk: m[fn], monster: m[arr] });
}
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return m.namn;
  }
  return null;
}

function normalisera(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}
function diafri(s) {
  return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
function tavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
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

const MINA_KARNORD = [
  "känslighetsanalys", "känslighetsanalysen", "känslighetstest",
  "känslighetstestet", "stresstest", "stresstesta", "stresstestning",
  "stresstestar", "soliditetsgrad", "soliditetsgraden", "soliditetsläget",
  "balansstyrka", "balansstyrkan",
];

const allaKarnord = [];
for (const m of MOTORER) {
  for (const mo of m.monster) for (const ko of mo.karnord) allaKarnord.push([m.namn, mo.id, diafri(ko)]);
}

console.log("=== A) kärnordskollisioner (exakt + tavstånd inom tolerans) ===");
let krock = 0;
for (const mk of MINA_KARNORD) {
  const d = diafri(mk);
  const max = d.length <= 7 ? 1 : 2;
  const farliga = allaKarnord
    .filter(([namn, id, ko]) => tavstand(d, ko) <= max)
    .map(([namn, id, ko]) => namn + "/" + id + "«" + ko + "»" + (ko === d ? "EXAKT" : "d" + tavstand(d, ko)));
  if (farliga.length) krock++;
  console.log("«" + mk + "» " + (farliga.length ? "KROCKAR: " + farliga.join(", ") : "fritt"));
}

console.log("\n=== B) mina kanoniska + varianter som FRÅGOR genom kedjan ===");
const fragor = [
  "vad är känslighetsanalys?", "vad är ett stresstest?", "vad är stresstest?",
  "hur stresstestar jag en balansräkning?", "vad är känslighetstest?",
  "vad är soliditetsgrad?", "vad är balansstyrka?", "vad menas med soliditetsgraden?",
  "vad ar kanslighetsanalys?", "vad ar stresstest?", "vad ar soliditetsgrad?",
  "hur gor man en kanslighetsanalys?", "vad är stress test?", "vad är stress testing?",
  "vad är sensitivity analysis?",
];
for (const f of fragor) {
  const r = kedja(f);
  console.log((r ? "TRÄFF  " + r : "FRITT  null") + "  «" + f + "»");
}
console.log("\nkrockar: " + krock);
