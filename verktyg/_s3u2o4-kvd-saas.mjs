#!/usr/bin/env node
// KVD för s3-u2 omgång 4: SaaS-guiden (B10) — varumärkesgrind-replik + struktur + korslänkar + universumtalskontroll
import fs from "node:fs";

const UTKAST = "/home/ak1a/AK1/data/blogg-utkast/saasaktier-sa-analyserar-du-saas-bolag.json";
const VM = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/varumarke.json", "utf8"));
const KURSER = new Set(Object.keys(JSON.parse(fs.readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"))));
const BLOGG = new Set(fs.readdirSync("/home/ak1a/AK1/data/blogg").filter(f => f.endsWith(".json")).map(f => f.replace(/\.json$/, "")));
const UNI = (() => {
  const u = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
  return Array.isArray(u) ? u : (u.bolag || u.universum || Object.values(u)[0]);
})();

const post = JSON.parse(fs.readFileSync(UTKAST, "utf8"));
const resultat = [];
let fel = 0;
const ok = (namn, detalj) => resultat.push(`GRÖN  ${namn}${detalj ? " — " + detalj : ""}`);
const nej = (namn, detalj) => { resultat.push(`RÖD   ${namn} — ${detalj}`); fel++; };

// 1. Struktur: BlogPost-form
const falt = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
const saknas = falt.filter(f => post[f] === undefined);
saknas.length === 0 ? ok("BlogPost-form", "samtliga fält närvarande") : nej("BlogPost-form", "saknas: " + saknas.join(","));

// 2. Ordantal (mål 1200, span 800–1400)
const ord = post.body.trim().split(/\s+/).length;
(ord >= 800 && ord <= 1400) ? ok("Ordantal", `${ord} ord (mål 1200, span 800–1400)`) : nej("Ordantal", `${ord} utanför spannet`);

// 3. Title ≤ 60, description ≤ 155
post.title.length <= 60 ? ok("Title-längd", `${post.title.length} tkn`) : nej("Title-längd", `${post.title.length} > 60`);
post.description.length <= 155 ? ok("OG-desc-längd", `${post.description.length} tkn`) : nej("OG-desc-längd", `${post.description.length} > 155`);

// 4. Sökordsdisciplin: "SaaS-aktier" i title + ingress + minst en H2
const sok = "SaaS-aktier";
const ingress = post.body.split(/\n\n/)[0];
post.title.includes(sok) ? ok("Sökord i H1/title") : nej("Sökord i H1/title", "saknas");
ingress.includes(sok) ? ok("Sökord i ingress") : nej("Sökord i ingress", "saknas");
const h2or = post.body.split("\n").filter(l => l.startsWith("## ")).filter(l => l.includes(sok));
h2or.length >= 1 ? ok("Sökord i H2", `"${h2or[0].replace(/^## /, "")}"`) : nej("Sökord i H2", "ingen H2 bär sökordet");

// 5. Varumärkesgrind-replik (kontrolleraText): 0 FEL krav
const hela = post.title + "\n" + post.description + "\n" + post.body;
const felTr = [], varTr = [];
for (const { fran, istallet, allvar } of VM.forbjudnaFraser) {
  const re = new RegExp(fran, "giu");
  let m;
  while ((m = re.exec(hela)) !== null) {
    const t = { fras: m[0], allvar, ersattning: istallet };
    if (allvar === "FEL") felTr.push(t); else varTr.push(t);
  }
}
felTr.length === 0 ? ok("Varumärkesgrind", `0 FEL${varTr.length ? `, ${varTr.length} VARNING(ar): ` + varTr.map(v => `"${v.fras}"`).join(", ") : ", 0 VARNING"}`) : nej("Varumärkesgrind", JSON.stringify(felTr));

// 6. Rådverb-sondering (manuell bedömning krävs vid träff)
const radm = hela.match(/\b(köp|sälj|sälja|rekommendera[r]?|undvik)\b/gi) || [];
const falsePos = radm.filter(w => /återköp/i.test(w));
resultat.push(`${radm.length === 0 ? "GRÖN  Rådverb" : "NOTIS Rådverb"} — ${radm.length} träff(ar)${radm.length ? ": " + [...new Set(radm)].join(", ") : ""}`);

// 7. Korslänkar: alla /kurser/x och /blogg/x verifieras; 0 mot utkast
const lankar = [...post.body.matchAll(/\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
const kursl = lankar.filter(l => l.startsWith("/kurser/")).map(l => l.replace("/kurser/", ""));
const blogl = lankar.filter(l => l.startsWith("/blogg/")).map(l => l.replace("/blogg/", ""));
const sakK = kursl.filter(s => !KURSER.has(s));
const sakB = blogl.filter(s => !BLOGG.has(s));
(sakK.length === 0 && sakB.length === 0)
  ? ok("Korslänkar", `${kursl.length} kurser + ${blogl.length} poster, samtliga verifierade`)
  : nej("Korslänkar", `saknas: ${[...sakK, ...sakB].join(", ")}`);
const utkastLink = lankar.filter(l => l.includes("saasaktier"));
utkastLink.length === 0 ? ok("0 länkar till utkast") : nej("Länk till utkast", utkastLink.join(", "));

// 8. Disclaimer-sista-rad exakt
const sista = post.body.trimEnd().split("\n").pop().trim();
const DISC = "_Detta är pedagogisk finansanalys, inte investeringsråd._";
sista === DISC ? ok("Disclaimer-sista-rad", "identisk mallens") : nej("Disclaimer-sista-rad", JSON.stringify(sista));

// 9. readingMinutes-kontrakt (600 ord/min)
const rm = Math.max(1, Math.round(ord / 600));
post.readingMinutes === rm ? ok("readingMinutes", `${post.readingMinutes} = Math.max(1, round(${ord}/600))`) : nej("readingMinutes", `${post.readingMinutes} ≠ ${rm}`);

// 10. Universumtalskontroll — alla citerade tal mot bolagsunivers.json
const b = t => UNI.find(x => x.ticker === t);
const n1 = (x, d = 1) => (x * 100).toFixed(d).replace(".", ",");
const kont = [];
const exp = [
  ["Kambi brutto", n1(b("KAMBI.ST").lonksamhet.bruttoMarginal), "98,9"],
  ["Palantir brutto", n1(b("PLTR").lonksamhet.bruttoMarginal), "84,8"],
  ["SAP brutto", n1(b("SAP.DE").lonksamhet.bruttoMarginal), "73,7"],
  ["Truecaller brutto", n1(b("TRUE-B.ST").lonksamhet.bruttoMarginal), "73,1"],
  ["Microsoft brutto", n1(b("MSFT").lonksamhet.bruttoMarginal), "67,9"],
  ["Sinch brutto", n1(b("SINCH.ST").lonksamhet.bruttoMarginal), "18,4"],
  ["Kambi EV/EBIT", b("KAMBI.ST").vardering.evEbit.toFixed(0), "197"],
];
for (const [namn, faktisk, citerad] of exp) {
  faktisk === citerad ? kont.push(`${namn} ${faktisk} ✓`) : nej(`Universumstal ${namn}`, `citerat ${citerad}, faktiskt ${faktisk}`);
}
const r40 = t => (b(t).tillvaxt.prognosTillvaxt * 100 + b(t).lonksamhet.fcfMarginal * 100).toFixed(1).replace(".", ",");
[["SAP.DE", "41,1"], ["MSFT", "24,3"], ["PLTR", "79,5"], ["SINCH.ST", "19,2"]].forEach(([t, c]) => {
  const f = r40(t);
  f === c ? kont.push(`R40 ${t} ${f} ✓`) : nej(`Rule of 40 ${t}`, `citerat ${c}, faktiskt ${f}`);
});
ok("Universumstal", kont.join(" · "));

// 11. Räkneexempel-aritmetik
const r = [];
[["1/0,01=100", 1 / 0.01 === 100], ["1/0,02=50", 1 / 0.02 === 50], ["800×50=40000", 800 * 50 === 40000],
 ["40000/8000=5", 40000 / 8000 === 5], ["1,02^5≈1,10", Math.abs(1.02 ** 5 - 1.104) < 0.001],
 ["17,3+23,8=41,1", Math.abs(17.3 + 23.8 - 41.1) < 0.05], ["19,3+5,0=24,3", Math.abs(19.3 + 5.0 - 24.3) < 0.05],
 ["44,4+35,1=79,5", Math.abs(44.4 + 35.1 - 79.5) < 0.05], ["13,1+6,1=19,2", Math.abs(13.1 + 6.1 - 19.2) < 0.05]
].forEach(([n, s]) => { if (s) r.push(n + " ✓"); else nej("Aritmetik " + n, "false"); });
ok("Räkneexempel", r.join(" · "));

// 12. Superlativ-sondering (B7-lärdomen — träffar kräver manuell/manuell-friad bedömning)
const sup = hela.match(/\b(högst|högre än alla|lägst|störst|största|mest av alla|enda i universumet)\b/gi) || [];
resultat.push(`${sup.length === 0 ? "GRÖN  Superlativ" : "NOTIS Superlativ"} — ${sup.length} träff(ar)${sup.length ? ": " + [...new Set(sup)].join(", ") : " (rankingfria formuleringar)"}`);

console.log(resultat.join("\n"));
console.log(`\nKVD SLUT: ${fel === 0 ? "GRÖN (0 RÖD)" : `RÖD (${fel} fel)`}`);
process.exit(fel === 0 ? 0 : 1);
