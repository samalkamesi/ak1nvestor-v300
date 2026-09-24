#!/usr/bin/env node
/** nyckeltals-urval.mjs — SEKTIONSURVAL + NYCKELTALSIDENTIFIERING per bolag.
 * Rond 144 (organ Σ) — steget EFTER karantän-intaget (r143): ur 3 836 sektioner
 * väljs varje bolags finansiella nyckelsektioner fram (regelbaserat, ärligt),
 * och nyckeltalsfamiljernas första värdefynd extraheras med källhänvisning.
 *
 * In- data/rapportintag/leveranser/<ticker>-2025.json (r143:s leveranser)
 * Ut- data/rapportintag/nyckeltal/<ticker>-2025.json + sammanstallning.json
 *
 * Juridik: utbildningsmaterial — nyckeltal ur publika årsredovisningar med
 * källa per fynd (lagen 2007:528 2 kap 5 §: så fungerar metoden, aldrig råd).
 *
 * CLI: node verktyg/nyckeltals-urval.mjs [--max=<urvalPerBolag>] */
import fs from 'node:fs';
import path from 'node:path';

const ROT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const IN = path.join(ROT, 'data', 'rapportintag', 'leveranser');
const UT = path.join(ROT, 'data', 'rapportintag', 'nyckeltal');
const MAX = Number((process.argv.find(a => a.startsWith('--max=')) || '--max=12').slice(6));

/** Nyckeltalsfamiljer: id → matchmönster (sv+en, versalokänsligt). */
const FAMILJER = [
  { id: 'nettoomsattning', vikt: 3, re: /net\s*sales|nettooms[aä]ttning|revenues?\b|int[aä]kter\b/i },
  { id: 'rorelseresultat', vikt: 3, re: /operating\s*(income|profit|result)|rorelseresultat|ebit\b/i },
  { id: 'ebitda', vikt: 2, re: /ebitda/i },
  { id: 'rorelsemarginal', vikt: 2, re: /operating\s*margin|rorelsemarginal|ebit\s*margin/i },
  { id: 'nettoresultat', vikt: 3, re: /net\s*(income|profit|earnings)|nettoresultat|profit\s*for\s*the\s*year/i },
  { id: 'eps', vikt: 2, re: /earnings\s*per\s*share|resultat\s*per\s*aktie|\beps\b/i },
  { id: 'eget-kapital', vikt: 2, re: /shareholders'??\s*equity|eget\s*kapital|total\s*equity/i },
  { id: 'tillgangar', vikt: 2, re: /total\s*assets|totala\s*tillgångar|balance\s*sheet\s*total/i },
  { id: 'kassaflode', vikt: 2, re: /cash\s*(flow\s*from\s*operations?|flow)|kassafl[öo]de|fritt\s*kassafl[öo]de|free\s*cash\s*flow/i },
  { id: 'utdelning', vikt: 2, re: /dividend(s|\b)|utdelning/i },
  { id: 'rantabilitet', vikt: 2, re: /\broe\b|return\s*on\s*equity|r[aä]ntabilitet\s*p[aå]\s*eget/i },
  { id: 'skuld', vikt: 1, re: /net\s*debt|nettoskuld|total\s*debt|skulder/i },
  { id: 'anstallda', vikt: 1, re: /employees|anst[aä]llda|headcount|fte/i },
  { id: 'ordning', vikt: 1, re: /order(s|\b)\s*(intake|book)|orderingg[aå]ng/i },
  { id: 'investeringar', vikt: 1, re: /capital\s*expenditure|capex|investeringar/i },
];

/** Hitta första värdefyndet per familj: siffra i kontextfönstret kring matchen. */
function vardeFynd(text, familj) {
  const m = familj.re.exec(text);
  if (!m) return null;
  const start = Math.max(0, m.index - 10);
  const fonster = text.slice(start, m.index + m[0].length + 120);
  // tal med tusentalståls, decimaler, valuta, MSEK/kr/%-suffix
  const tal = /(\d[\d\s.,]{2,18}\d|\d+)\s*(%|MSEK|SEK|mkr|kr|GBP|USD|€|£|MDKR|mbn|bn|million|billion|MUSD)?/i.exec(fonster.slice(m[0].length));
  if (!tal) return null;
  return { kontext: fonster.replace(/\s+/g, ' ').slice(0, 160), varde: tal[0].trim() };
}

function analysera(levFil) {
  const j = JSON.parse(fs.readFileSync(levFil, 'utf8'));
  const sektioner = j.sektioner || [];
  const bedomda = sektioner.map((s, i) => {
    const text = s.text || '';
    const familjer = FAMILJER.filter(f => f.re.test(text)).map(f => f.id);
    const siffror = (text.match(/\d/g) || []).length;
    const familjevikt = FAMILJER.filter(f => f.re.test(text)).reduce((a, f) => a + f.vikt, 0);
    return { i, rubrik: s.rubrik || `Sektion ${i}`, familjer, siffror, poang: familjevikt + Math.min(20, siffror / 20), text };
  });
  const urval = bedomda
    .filter(b => b.familjer.length > 0 && b.siffror >= 8)
    .sort((a, b) => b.poang - a.poang)
    .slice(0, MAX)
    .map(({ i, rubrik, familjer, siffror, poang }) => ({ i, rubrik: rubrik.slice(0, 120), familjer, siffror, poang: +poang.toFixed(1) }));

  // nyckeltalsfynd: första värde per familj i hela dokumentet (prioriterat i urvalsordning)
  const fynd = [];
  const sedda = new Set();
  for (const b of [...urval.map(u => bedomda[u.i]), ...bedomda]) {
    for (const f of FAMILJER) {
      if (sedda.has(f.id)) continue;
      if (!f.re.test(b.text)) continue;
      const v = vardeFynd(b.text, f);
      if (v) { fynd.push({ familj: f.id, varde: v.varde, kontext: v.kontext, sektion: b.i, kalla: j.sektioner[b.i].kalla }); sedda.add(f.id); }
    }
  }
  return {
    bolag: j.bolag, ar: j.ar, proveniensSha: j.proveniensSha,
    sammanfattning: { sektionerTotalt: sektioner.length, urval: urval.length, nyckeltalsFamiljerTraffade: fynd.length, avTotaltFamiljer: FAMILJER.length },
    urval, nyckeltalsfynd: fynd,
  };
}

// ── kör ──
fs.mkdirSync(UT, { recursive: true });
const filer = fs.readdirSync(IN).filter(f => f.endsWith('-2025.json')).sort();
const alla = [];
for (const f of filer) {
  const r = analysera(path.join(IN, f));
  fs.writeFileSync(path.join(UT, f), JSON.stringify(r, null, 2));
  alla.push({ bolag: r.bolag, ...r.sammanfattning, urvalFamiljer: r.urval.slice(0, 3).map(u => u.familjer.slice(0, 4)) });
  console.log(`${r.bolag}: ${r.sammanfattning.urval} urval av ${r.sammanfattning.sektionerTotalt} · ${r.sammanfattning.nyckeltalsFamiljerTraffade}/${r.sammanfattning.avTotaltFamiljer} familjer träffade`);
}
const totalUrval = alla.reduce((a, b) => a + b.urval, 0);
const totalFamiljer = alla.reduce((a, b) => a + b.nyckeltalsFamiljerTraffade, 0);
fs.writeFileSync(path.join(UT, 'sammanstallning-r144.json'), JSON.stringify({ ts: new Date().toISOString(), rond: 144, bolag: alla, totalt: { bolag: alla.length, urvalSektioner: totalUrval, familjefynd: totalFamiljer } }, null, 2));
console.log(`\nTOTALT: ${alla.length} bolag · ${totalUrval} urvalssektioner · ${totalFamiljer} familjefynd`);
console.log(`Ut: data/rapportintag/nyckeltal/ (per-bolag + sammanstallning-r144.json)`);
