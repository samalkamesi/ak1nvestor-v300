/**
 * SOND omgång 25 (s6-u1, manifest auto-s6-1789864506792) — rond 2+3:
 * grannkontroll av etfmekanik-kandidaternas kärnord mot hela kedjans
 * inventarie (data/vakten/_s6u1-sond-omg25-karnord.json — 1 688 kärnord
 * insamlade LIVE ur widgetens kompositionsordning i rond 1).
 *
 * Metod: för varje kandidat-kärnord (diafri-normaliserat) mäts
 * redigeringstavståndet mot ALLA syskonkärnord med motorns egna
 * toleransregler (≤ 3 tecken: exakt · ≤ 7: 1 fel · övriga: 2 fel) plus en
 * extra säkerhetsmarginal på +1 i längdskillnad. GRANNE = risken att en
 * syskonfråga skulle fångas (stöld) eller tvärtom.
 *
 * Utfall (2026-09-20): ALLA FRITTA — hela etfmekanik-familjen (se listan)
 * har 0 grannar. Upptagna och respekterade (resulat ur körningen):
 *   naket index/indexet/indexfond(er)/etf(etfs) → praktik/index
 *   nav/substansvärde → nästa/investmentbolag
 *   termin → nästa/options
 *   hävstång → basens kapitalstruktur-monster
 *   multipel → djup/multipel · «p e» → basens nyckeltal
 * Utöver grannkontrollen KASTADES två ord medvetet efter regressionstestets
 * G2-upptäckt: «ombalansering» (tavstånd 2 mot «rebalansering» — portfölj-
 * praktikens territorium, deras fråga hade stulits) och «etf-arbitrage»
 * (praktikens nakna korta kärnord «etf» matchar varje fråga där «etf» står
 * som fristående ord och praktiken ligger FÖRE i kedjan — kärnordet här
 * hade varit dödvikt). Båda orden förekommer endast i lagrets svartext.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const inv = JSON.parse(readFileSync(join(ROT, "data/vakten/_s6u1-sond-omg25-karnord.json"), "utf8"));
const ord = inv.karnord.map((x) => x[0]);

function tav(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (!n) return m; if (!m) return n;
  let fo = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      nu[j] = Math.min(nu[j - 1] + 1, fo[j] + 1, fo[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    fo = [...nu];
  }
  return fo[m];
}

// Lagrets slutliga kärnord (efter rond 3:s rensning — «ombalansering» borta)
const MINA = [
  "indexomläggning", "indexomläggningen", "indexomläggnings",
  "omläggning", "omläggningen", "omläggningar",
  "effektdag", "effektdagen",
  "tillkännagivande", "tillkännagivandet",
  "börshandlad fond", "börshandlade fonder",
  "auktoriserad deltagare", "ap-deltagare",
  "skapelse", "skapelsen", "skapelser",
  "inlösen", "inlösningen", "inlösningar",
  "contango", "backwardation",
  "hävstångsetf", "hävstångsetfs",
  "spårningsavvikelse", "spårningsavvikelsen",
  "flashdagen", "inre mekanik", "2x",
];

// Kontrollfall: ord som FÅR vara upptagna (dokumentation av gränserna)
const RESPEKTERADE = ["index", "indexet", "indexfond", "indexfonder", "etf", "etfs",
  "nav", "substansvärde", "termin", "hävstång", "multipel"];

const diafri = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();

let alltFritt = true;
for (const mk of MINA) {
  const d = diafri(mk);
  const max = d.length <= 3 ? 0 : (d.length <= 7 ? 1 : 2);
  const kand = d.includes(" ")
    ? []
    : ord.filter((o) => Math.abs(o.length - d.length) <= Math.max(max, 1) && tav(o, d) <= Math.max(max, 1));
  if (kand.length) { alltFritt = false; console.log("GRANNE: " + mk + " ← " + kand.join(", ")); }
}
console.log(alltFritt
  ? "ROND 2+3: samtliga " + MINA.length + " kärnord FRITTA mot " + ord.length + " syskonkärnord"
  : "ROND 2+3: se grannar ovan");

for (const r of RESPEKTERADE) {
  const d = diafri(r);
  const h = inv.karnord.find((x) => x[0] === d);
  console.log("  respekterat: " + r.padEnd(14) + (h ? "→ " + h[1] : "— (fritt, ändå ej kärnord här)"));
}
