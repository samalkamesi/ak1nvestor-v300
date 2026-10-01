#!/usr/bin/env node
// _s2u1o34-llms.mjs — s2-u1 (manifest auto-s2-1790861711679): llms.txt
// Dataset-sektion HELREGEN ur diskens FAKTISKA träd (331 rader — min Celltrion
// + syskonens SU.PA/LR.PA). Läker ÄRVSLÄCKAN: sektionen bar 311-läget/2026-09-25
// och saknade nyttovalt-raderna medan sajten publicerat 11 branscher data-drivet.
// Mall: ordagrann radtext från 311-eran, talen räknade med lasBranschMedianer-
// percentil-logiken (linjär interpolering, _s2u3o33-medianer.mjs).
import { readFileSync, writeFileSync } from "node:fs";

const RÅDATA = "2026-10-01";
const FIL = "public/llms.txt";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));

const median = (v) => {
  const r = v.filter(x => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentil = (v, p) => {
  const r = v.filter(x => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
};
const nAv = (v) => v.filter(x => typeof x === "number" && Number.isFinite(x)).length;
const tal = (x) => {
  const s = x.toFixed(1).replace(".", ",");
  return s.endsWith(",0") ? s.slice(0, -2) : s;
};
const pct = (x) => `${tal(x * 100)} %`;

const fPe = b => b.vardering?.pe ?? null;
const fPb = b => b.vardering?.pb ?? null;
const fEbit = b => b.lonksamhet?.ebitMarginal ?? null;
const fFcf = b => b.lonksamhet?.fcfMarginal ?? null;
const fOms = b => b.tillvaxt?.omsattningTillvaxtTTM ?? null;
const fCagr = b => b.tillvaxt?.resultatCAGR5ar ?? null;

const totalPe = median(u.map(fPe));
const nTotalPe = nAv(u.map(fPe));
const totalCagr = median(u.map(fCagr));
const nTotalCagr = nAv(u.map(fCagr));

const BRANSCHER = [
  ["energi", "Energi"], ["fastighet", "Fastighet"], ["finans", "Finans"],
  ["halso", "Hälsa"], ["industri", "Industri"], ["kommunikation", "Kommunikation"],
  ["konsument", "Konsument"], ["material", "Material"], ["teknik", "Teknik"],
  ["tillvaxt", "Tillväxt"], ["nyttovalt", "Nyttovalt"],
];

const rader = [];
rader.push(`- [Dataset — branschmedianer](https://lab.ak1nvestor.com/dataset): Median P/E per bransch i AK1A:s universum (${u.length} bolag i ${BRANSCHER.length} branscher, rådata ${RÅDATA}) — totalt median P/E ${tal(totalPe)} (n=${nTotalPe} av ${u.length} bolag med mätt P/E). Med P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch.`);

for (const [slug, namn] of BRANSCHER) {
  const b = u.filter(r => r.bransch === slug);
  if (!b.length) { console.error(`VAKT: branschen ${slug} har 0 rader — avbryter`); process.exit(1); }
  const pe = b.map(fPe), pb = b.map(fPb), ebit = b.map(fEbit), fcf = b.map(fFcf), oms = b.map(fOms), cagr = b.map(fCagr);
  rader.push(`- [Dataset ${namn} — branschmedianer](https://lab.ak1nvestor.com/dataset/${slug}): Medianerna för ${namn} i AK1A:s universum (${b.length} bolag i branschen, rådata ${RÅDATA}): P/E ${tal(median(pe))} med kvartilspridning P25–P75 ${tal(percentil(pe, 0.25))}–${tal(percentil(pe, 0.75))} (n=${nAv(pe)}) · P/B ${tal(median(pb))} · EBIT-marginal ${pct(median(ebit))} · FCF-marginal ${pct(median(fcf))} · omsättningstillväxt ${pct(median(oms))}. Jämförd med universumet: median P/E ${tal(totalPe)} för samtliga ${u.length} bolag.`);
  rader.push(`- [Dataset ${namn} — Resultattillväxt (CAGR 5 år)](https://lab.ak1nvestor.com/dataset/${slug}/resultat-cagr-5ar): Resultattillväxten (CAGR) inom ${namn} i AK1A:s universum (rådata ${RÅDATA}): median ${pct(median(cagr))} per år med kvartilspridning P25–P75 ${pct(percentil(cagr, 0.25))}–${pct(percentil(cagr, 0.75))} (n=${nAv(cagr)} bolag med mätt resultat-CAGR). Jämförd med universumet: median ${pct(totalCagr)} för samtliga ${nTotalCagr} bolag med mätt resultat-CAGR. Pedagogisk referens — inte investeringsrådgivning.`);
}

const ingress = `AK1A:s publika dataset: median P/E, P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch, räknat ur det fasta universumet på ${u.length} bolag i ${BRANSCHER.length} branscher (rådata ${RÅDATA}). Observationsantal (n) redovisas per nyckeltal. Varje branschsida redovisar dessutom kvartilspridningen (P25–P75) per nyckeltal och jämför branschens medianer med hela universumets medianer. Under varje bransch finns dessutom aspektsidor — ett nyckeltal per sida (P/E, P/B, ROE, ROIC, EV/EBIT, PEG, marginaler, tillväxt m.fl.) — där varje sida redovisar median, kvartiler och spridning för branschen samt samma mått för hela universumet som jämförelserad. Pedagogisk referens — inte investeringsrådgivning.`;

const sektion = `## Dataset — branschmedianer\n\n${ingress}\n\n${rader.join("\n")}\n\n`;

const txt = readFileSync(FIL, "utf8");
const start = txt.indexOf("## Dataset");
if (start === -1) { console.error("VAKT: hittar inte ## Dataset"); process.exit(1); }
const slut = txt.indexOf("\n## ", start + 1);
const ny = slut === -1 ? txt.slice(0, start) + sektion : txt.slice(0, start) + sektion + txt.slice(slut + 1);

// verifiera FÖRE skrivning: radantal, inga bolagsnamn, totaltal
const vRader = ny.split("\n").filter(l => l.startsWith("- [Dataset"));
if (vRader.length !== 1 + BRANSCHER.length * 2) { console.error(`VAKT: ${vRader.length} Dataset-rader ≠ ${1 + BRANSCHER.length * 2}`); process.exit(1); }
if (!ny.includes(`på ${u.length} bolag i ${BRANSCHER.length} branscher`)) { console.error("VAKT: ingressens total saknas"); process.exit(1); }
for (const r of u) {
  if (r.ticker && new RegExp(`(?<![A-Za-z0-9ÅÄÖåäö])${r.ticker.replace(/[.$-]/g, "\\$&")}(?![A-Za-z0-9ÅÄÖåäö])`).test(ny.slice(start, start + sektion.length))) {
    console.error(`VAKT: tickerläckage ${r.ticker} i nya sektionen`); process.exit(1);
  }
}

writeFileSync(FIL, ny);
// läs-tillbaka
const tb = readFileSync(FIL, "utf8");
const tbS = tb.indexOf("## Dataset");
console.log(`llms.txt: Dataset-sektion regenererad — ${u.length} bolag · ${BRANSCHER.length} branscher · ${vRader.length} rader · total P/E ${tal(totalPe)} (n=${nTotalPe}) · CAGR ${pct(totalCagr)} (n=${nTotalCagr})`);
console.log(`läs-tillbaka: "på ${u.length} bolag" ${tb.includes(`på ${u.length} bolag`) ? "JA" : "NEJ"} · prefix-före-sektion bitidentisk ${tb.slice(0, start) === txt.slice(0, start) ? "JA" : "NEJ"} · efterpart bevarad ${slut === -1 ? "(filslut)" : tb.slice(tb.indexOf("\n## ", tbS + 1)) === txt.slice(slut + 1) ? "JA" : "NEJ"}`);
console.log("halso-raden: " + tb.split("\n").find(l => l.includes("Dataset Hälsa — branschmedianer")).slice(0, 240));
