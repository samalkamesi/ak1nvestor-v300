/**
 * Sond för spår 6, omgång 13, s6-u2: kollisionskontroll av kandidat-
 * förhandsfrågor mot HELA kedjan (21 motorer, 74 monsters) med motorns
 * riktiga matchare. Kör: node verktyg/_s6u2-sond-omg13.mjs
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
    if (s) return { namn: m.namn, amne: s.amne };
  }
  return null;
}

const kandidater = [
  // STABILITET-familjen (st-01/st-02 + V10-V12)
  "vad är soliditet?",
  "vad är räntetäckningsgrad?",
  "vad är räntetäckning?",
  "vad är känslighetsanalys?",
  "vad är stresstest?",
  "vad är ett stresstest?",
  "vad är stresstestning?",
  "vad är likviditet?",
  "vad är likviditetsgrad?",
  "vad är kvick?",
  "vad är skuldsättningsgrad?",
  "vad är intäktsstabilitet?",
  "vad är soliditetsgrad?",
  "hur stresstestar jag en balansräkning?",
  "vad är balansstyrka?",
  // OPTIONER-familjen (km-059..km-062 + od-kurser i framtida register)
  "vad är en option?",
  "vad är optioner?",
  "vad är en aktieoption?",
  "vad är en termin?",
  "vad är en warrant?",
  "vad är hävstång?",
  "vad är premien?",
  "vad är strike?",
  "vad är lösenpris?",
  "vad är underliggande?",
  // Referens: dokumenterat tagna (ska träffas av rätt motor)
  "vad är en svart svan?",
  "vad är utdelningsfällor?",
  "vad är kalibrering?",
];

console.log("=== KEDJESOND (vänster = vinnande motor) ===");
for (const f of kandidater) {
  const r = kedja(f);
  console.log(
    (r ? `TRÄFF  ${r.namn.padEnd(18)} (${r.amne})` : "FRITT  NULL genom hela kedjan") + "  «" + f + "»"
  );
}

// Redigeringstavstånd: mina blivande kärnord mot ALLA kärnord i kedjan.
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

const allaKarnord = [];
for (const m of MOTORER) {
  for (const mo of m.monster) for (const ko of mo.karnord) allaKarnord.push([m.namn, mo.id, diafri(ko)]);
}
console.log("\n=== FELSTAVNINGSTOLERANS: kandidat-kärnord mot samtliga " + allaKarnord.length + " kärnord ===");
const mina = [
  "soliditet", "soliditetsgrad", "soliditetsläget", "räntetäckningsgrad",
  "räntetäckning", "känslighetsanalys", "stresstest", "stresstesta",
  "stresstestning", "stresstestar", "balansstyrka",
];
for (const mk of mina) {
  const d = diafri(mk);
  const max = d.length <= 7 ? 1 : 2;
  const farliga = allaKarnord
    .filter(([namn, id, ko]) => ko !== d && tavstand(d, ko) <= max)
    .map(([namn, id, ko]) => namn + "/" + id + "«" + ko + "»d" + tavstand(d, ko));
  console.log(
    "«" + mk + "» " + (farliga.length ? "KROCKAR: " + farliga.join(", ") : "fritt (≥ " + (max + 1) + " ifrån allt)")
  );
}
