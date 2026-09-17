import { readFileSync, readdirSync } from "node:fs";
const dir = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/";
const kal = {};
for (const f of readdirSync(dir).filter((f) => f.startsWith("kalender-"))) {
  const j = JSON.parse(readFileSync(dir + f, "utf8"));
  for (const b of j.bolag) kal[b.ticker] = { namn: b.namn.split(" ")[0], fenster: b.rapportfenster };
}
const paket = readdirSync(dir).filter((f) => f.startsWith("sa-laser-du-") && f.endsWith(".json")).map((f) => f.replace("sa-laser-du-", "").replace("-q3-2026.json", ""));
const map = { "abb":"ABB.ST","alfa-laval":"ALFA.ST",astrazeneca:"AZN.ST","atlas-copco":"ATCO-A.ST",castellum:"CAST.ST",ericsson:"ERIC-B.ST",essity:"ESSITY-B.ST",evolution:"EVO.ST",handelsbanken:"SHB-A.ST","hm-b":"HM-B.ST",holm:"HOLM-B.ST",iberdrola:"IBE.MC",industrivarden:"INDU-C.ST",nike:"NKE",nordea:"NDA-SE.ST",np3:"NP3.ST","precise-biometrics":"PREC-B.ST",saab:"SAAB-B.ST",sandvik:"SAND.ST","skf-b":"SKF-B.ST",swedbank:"SWED-A.ST",tele2:"TEL2-B.ST",telia:"TELIA.ST","volvo-car":"VOLCAR-B.ST","volvo-group":"VOLV-B.ST",wallenstam:"WALL-B.ST",yara:"YAR.OL" };
const res = {};
for (const p of paket) {
  const t = map[p];
  if (!t) { console.log("OBEKANT SLUG:", p); continue; }
  const k = kal[t];
  if (!k) { console.log("SAKNAS I KALENDER:", p, t); continue; }
  const m = (k.fenster.match(/2026-10-(\d\d)/) || [])[1];
  if (m && +m >= 20 && +m <= 23) { (res[m] = res[m] || []).push(p); }
}
for (const d of Object.keys(res).sort()) console.log("10-" + d + ":", res[d].length, "paket:", res[d].join(", "));
console.log("TOTAL 20-23:", Object.values(res).flat().length);
