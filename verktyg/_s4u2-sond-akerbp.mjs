import fs from "node:fs";
const uni = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const lista = Array.isArray(uni) ? uni : uni.bolag;
for (const b of lista) {
  if (b.ticker !== "AKRBP.OL") continue;
  console.log("SERIER:", JSON.stringify(b.serier, null, 1));
  console.log("GOLV:", JSON.stringify(b.golv));
  const clone = { ...b };
  for (const k of ["kallor","serier","golv","tillvaxt","lonksamhet","stabilitet","aterkop","moat","vardering"]) delete clone[k];
  console.log("ÖVRIGT:", JSON.stringify(clone, null, 1).slice(0, 1200));
}
const k = JSON.parse(fs.readFileSync("data/blogg-utkast/kvartal/2026-q3/kalender-energi.json", "utf8"));
for (const x of k.bolag) if (x.ticker === "AKRBP.OL") console.log("KALENDERPOST:", JSON.stringify(x, null, 1));
// energigrenens alla poster — för medianmetadatan
const energi = lista.filter(b => b.bransch === "energi").map(b => ({ t: b.ticker, n: b.namn, pe: b.vardering?.pe, pb: b.vardering?.pb, evEbit: b.vardering?.evEbit, roe: b.lonksamhet?.roe, ebit: b.lonksamhet?.ebitMarginal }));
console.log("ENERGIGRENEN:", JSON.stringify(energi, null, 1));
