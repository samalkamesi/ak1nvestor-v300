// _s4u2-fabege-slutsteg.mjs — worklog-append + slutkontroller före commit
import fs from "node:fs";

// 1. Worklog-append (idempotens: hoppa om raden redan finns)
const append = fs.readFileSync("verktyg/_s4u2-fabege-worklog-append.txt", "utf8");
const wl = fs.readFileSync("worklog.md", "utf8");
if (wl.includes("FABEGE Q3-LÄSPAKET levererat")) {
  console.log("worklog redan bokförd — hoppar");
} else {
  fs.writeFileSync("worklog.md", wl.replace(/\n*$/, "\n\n") + append.replace(/\n*$/, "\n"));
  console.log("worklog bortförd klart: +" + append.length + " tecken");
}

// 2. Slutliga livskontroller
const p = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-fabege-q3-2026.json";
const d = JSON.parse(fs.readFileSync(p, "utf8"));
console.log("paketet levererar: " + d.slug + ", " + d.body.length + " tecken body, " + d.tags.length + " taggar");
const ko = fs.readFileSync("data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md", "utf8");
const n = (ko.match(/sa-laser-du-fabege-q3-2026\.json/g) || []).length;
console.log("granskningskö-förekomster av fabege-filen: " + n + " (väntat ≥ 3: huvudtabell länk ×1, slugtabell ×0 filnamn — kontroll)");
const live = fs.readdirSync("data/blogg").filter(f => /fabege/i.test(f));
console.log("live-mappen data/blogg/: " + (live.length ? "FEL " + live.join(",") : "orörd av fabege (R2 OK)"));
