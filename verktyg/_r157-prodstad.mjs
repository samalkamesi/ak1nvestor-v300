// rond 157: städa avslutat auto-s9-barns efterlämnade prod-yta (barnen klara 3/3 — ytan är ingen pågående yta)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const P = '/home/ak1a/AK1';
const ut = [];
const steg = (namn, fn) => {
  try { fn(); ut.push(`[${namn}] OK`); return true; }
  catch (e) { ut.push(`[${namn}] FEL: ${String(e.message || e).slice(0, 300)}`); return false; }
};

// säkerhetsgrind: inget manifest får vara aktivt (pågående barns yta städas ALDRIG)
let aktivt = null;
try {
  const dir = P + '/data/vakten/agentfabrik/status';
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    try {
      const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
      if (j.status && j.status !== 'klar') aktivt = `${f}(${j.status})`;
    } catch {}
  }
} catch (e) { ut.push('manifestkatalog-fel: ' + String(e.message).slice(0, 100)); }
if (aktivt) {
  ut.push('AVBRYTER: aktivt manifest ' + aktivt);
  console.log(ut.join('\n'));
  process.exit(1);
}
ut.push('grind: inga aktiva manifest — städ tillåten');

const msg = P + '/data/vakten/r157-prodstad-msg.txt';
fs.writeFileSync(msg, 'studio: rond 157 [organ:Φ] städ — avslutat auto-s9-barns (1790210106768, 3/3 klara) efterlämnade prod-yta landad: 17 fabriks-commitmsg/kvitto-filer i verktyg/ + 5 o155-efter-vakt-lighthouse-mätningar + motorervalideringsrapportens växt (väktarens dagliga skrivning) + uppdrag-klart.json-radering (hjärtats återställning) — ytan REN så prod-synkens pull och rundens push kan gå fram; inga aktiva manifest vid städen (grind i skriptet); allt bevarat i historiken, inget raderat utom hjärtats egna borttag');

steg('add', () => execFileSync('git', ['-C', P, 'add', '-A'], { stdio: 'pipe' }));
const fore = execFileSync('git', ['-C', P, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
steg('commit', () => execFileSync('git', ['-C', P, 'commit', '-F', msg], { encoding: 'utf8', timeout: 480000 }));
const efter = execFileSync('git', ['-C', P, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
ut.push(`prod HEAD: ${fore.slice(0, 8)} → ${efter.slice(0, 8)} (${fore === efter ? 'INGEN ÄNDRING' : 'städ-commit landad'})`);
const smuts = execFileSync('git', ['-C', P, 'status', '--porcelain'], { encoding: 'utf8' }).trim();
ut.push('prod-yta efter: ' + (smuts === '' ? 'REN ✓' : smuts.split('\n').slice(0, 5).join(' | ')));

console.log(ut.join('\n'));
fs.writeFileSync('/home/ak1a/agent/ak1/data/vakten/r157-prodstad.txt', ut.join('\n'));
