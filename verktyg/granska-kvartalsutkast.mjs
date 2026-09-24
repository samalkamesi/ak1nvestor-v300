#!/usr/bin/env node
/** granska-kvartalsutkast.mjs — OBEROENDE GRANSKNINGSPROV av kvartalsutkast (r146, [organ:Θ]).
 * KVD-klass: juridikgrind (rådverb), disclaimer, källfält, struktursanity.
 * Granskar ett urval — fabriken kör sin egen KVD per leverans; detta är det
 * oberoende stickprovet som kontrakterar att självgranskningen håller.
 * CLI: node verktyg/granska-kvartalsutkast.mjs <fil.json>... (default: 5 äldsta) */
import fs from 'node:fs';
import path from 'node:path';

const ROT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BAS = path.join(ROT, 'data', 'blogg-utkast', 'kvartal', '2026-q3');

// rådverb enligt KVD-konventionen (juridikgrinden — lagen 2007:528)
const RADVERB = [
  /\bk[öo]p\b[^.]{0,25}\baktie/i, /\bs[äa]lj\b[^.]{0,25}\baktie/i,
  /\brekommenderar?\b/i, /\brekommendation\b/i,
  /\bb[öo]r du (k[öo]pa|s[äa]lja|investera)\b/i,
  /\b(du )?(borde|skulle) (k[öo]pa|s[äa]lja|investera)\b/i,
  /\btips(a|ar)? (p[åa])? ?(att )?(k[öo]pa|k[öo]p)\b/i,
  /\binvestera i (denne|detta|aktien) bolag/i,
  /\bnu [äa]r det (dags|ett bra tillf[äa]lle)\b/i,
  /\bb[äa]sta k[öo]p(et)?\b/i, /\bstrong (buy|sell)\b/i, /\bstock to (buy|sell)\b/i,
];

function granska(fil) {
  const j = JSON.parse(fs.readFileSync(fil, 'utf8'));
  const ytor = [j.title || '', j.description || '', j.ingress || '', j.beskrivning || '', j.metabeskrivning || ''];
  const brodText = typeof j.body === 'string' ? j.body : (j.brodtext || j.innehall || j.sektioner || []);
  const allText = ytor.join('\n') + '\n' + brodText;
  const fynd = [];
  for (const re of RADVERB) {
    const m = re.exec(allText);
    if (m) {
      // negeringsfönster: disclaimerns "inte en rekommendation att…" är GRÖN text
      const fonsterFöre = allText.slice(Math.max(0, m.index - 45), m.index);
      if (/\b(inte|ingen|ej|aldrig|utg[öo]r (ingen|aldrig)|varken)\b[^.]{0,40}$/i.test(fonsterFöre)) continue;
      fynd.push({ regex: re.source, traff: allText.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\s+/g, ' ') });
    }
  }
  const disclaimer = /utbildning|informationssyfte|ej (personlig )?(investerings|r[åa]d)|inte (utg[öo]ra|r[åa]d)|ljus improceditor|s[åa] fungerar metoden|education(al)? purposes/i.test(allText);
  const ord = allText.trim().split(/\s+/).length;
  const kallor = (allText.match(/k[äa]lla|source|enligt (bolagets|rapporten|IR)|bolagets (egen )?(Q|rapp)|IR-(sida|kalender)|Cision|MFN|pressrelease/i) || []).length
    + (allText.match(/\]\(https?:\/\//g) || []).length; // markdown-källänkar = källmarkörer
  const h2 = (brodText.match(/^## /gm) || []).length;
  return {
    fil: path.basename(fil), bolag: j.bolag || (j.title || '').slice(0, 60),
    dom: {
      radverb: fynd.length === 0 ? 'GRÖN (0 träffar)' : `RÖD (${fynd.length})`,
      radverbFynd: fynd,
      disclaimer: disclaimer ? 'GRÖN (finns)' : 'RÖD (saknas)',
      kallfalt: kallor >= 4 ? `GRÖN (${kallor} källmarkörer)` : kallor >= 1 ? `MEDEL (${kallor})` : 'RÖD (0)',
      struktur: `ord ${ord} · H2 ${h2} · title ${String(j.title || '').length}/60`,
    },
    slutdom: fynd.length === 0 && disclaimer && kallor >= 1 ? 'FLYTKLAR-KANDIDAT (granskad r146)' : 'ÅTER (se dom)',
  };
}

const filer = process.argv.length > 2
  ? process.argv.slice(2).map(f => path.resolve(f))
  : ['sa-laser-du-volvo-car-q3-2026.json', 'sa-laser-du-ericsson-q3-2026.json', 'sa-laser-du-hm-b-q3-2026.json', 'sa-laser-du-skf-b-q3-2026.json', 'sa-laser-du-industrivarden-q3-2026.json'].map(f => path.join(BAS, f));

const resultat = filer.map(granska);
for (const r of resultat) {
  console.log(`\n${r.fil} — ${r.slutdom}`);
  for (const [k, v] of Object.entries(r.dom)) console.log(`  ${k}: ${typeof v === 'string' ? v : JSON.stringify(v).slice(0, 150)}`);
}
const grona = resultat.filter(r => r.slutdom.startsWith('FLYTKLAR')).length;
fs.writeFileSync(path.join(ROT, 'data', 'blogg-utkast', 'GRANSKNING-r146-kvartal-prov.json'), JSON.stringify({ ts: new Date().toISOString(), rond: 146, organ: 'Θ', urval: resultat.map(r => r.fil), resultat }, null, 2));
console.log(`\n═══ ${grona}/${resultat.length} flytklar-kandidater · rapport: data/blogg-utkast/GRANSKNING-r146-kvartal-prov.json`);
