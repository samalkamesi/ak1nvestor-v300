/**
 * Sond 3 för s6-u3: kärnordsdisjunktion — mina kandidat-kärnord för
 * MODERNA RISKTYPER (regulatorisk/gdpr/esg) mot samtliga lager + basen.
 * Samma dist-logik som testfall K i syskonsviterna.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROT = "/home/ak1a/AK1";

const MINA = {
  regulatoriskrisk: [
    "regulatorisk risk", "regulatoriska risker", "regelverk", "regelverket",
    "regelverken", "tillsyn", "tillsynen", "tillsynsmyndighet",
    "tillsynsmyndigheten", "myndighetsbeslut", "myndighetsrisk",
    "kapitalkrav", "kapitalkraven",
  ],
  datarisk: [
    "gdpr", "dataskydd", "dataskyddet", "datarisk", "datarisken",
    "dataintrång", "personuppgifter", "personuppgifterna",
    "integritetsrisk", "cyberrisk",
  ],
  esg: [
    "esg", "esg-risk", "esg-risker", "esgrisk", "hållbarhetsrisk",
    "hållbarhetsrisken", "miljörisk", "miljörisker", "klimatrisk",
    "klimatrisker", "övergångsrisk", "social risk", "sociala risker",
  ],
};

const dist = (a, b) => {
  const n = a.length, m = b.length;
  if (!n) return m; if (!m) return n;
  let f = Array.from({ length: m + 1 }, (_, j) => j), nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, f[j] + 1, f[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    f = [...nu];
  }
  return f[m];
};

const libFiler = readdirSync(join(ROT, "src/lib"))
  .filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-modernarisk-fragor.ts")
  .concat(["ai-mentor-svar.ts"]);

let kollisioner = 0;
for (const f of libFiler) {
  const txt = readFileSync(join(ROT, "src/lib", f), "utf8");
  for (const m of txt.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
    for (const o of [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1].toLowerCase())) {
      for (const [grupp, ord] of Object.entries(MINA).flatMap(([g, arr]) => arr.map((w) => [g, w]))) {
        if (o.includes(" ") || ord.includes(" ")) {
          if (o === ord) { kollisioner++; console.log(`EXAKT ${f}:"${o}" == ${grupp}:"${ord}"`); }
          continue;
        }
        const kort = Math.min(o.length, ord.length) <= 3;
        if (kort ? o === ord : dist(o, ord) <= (Math.min(o.length, ord.length) <= 7 ? 1 : 2) && Math.abs(o.length - ord.length) <= 2) {
          kollisioner++;
          console.log(`NÄRA  ${f}:"${o}" ≈ ${grupp}:"${ord}" (tav=${dist(o, ord)})`);
        }
      }
    }
  }
}
console.log(kollisioner === 0 ? "GRÖN: 0 kärnordskollisioner mot samtliga lager + basen" : `RÖD: ${kollisioner} kollisioner`);
process.exit(kollisioner === 0 ? 0 : 1);
