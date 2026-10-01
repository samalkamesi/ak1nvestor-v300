// _v222-mergea.mjs — hämta + merga prod/develop in i lokal develop (node-kanal).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function ko(kommando, takSek = 90) {
  try { return execFileSync('bash', ['-c', kommando], { encoding: 'utf8', timeout: takSek * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); }
  catch (e) { return 'FEL:\n' + String(e.stdout || '') + String(e.stderr || ''); }
}

// Koordineringsstatusfil FÖRE merge (v221-regeln)
fs.writeFileSync('data/vakten/v222-merge-status.md', `# v222 merge-status (koordinering)\n\nSkriven FÖRE merge: ${new Date().toISOString()}\n\n- Lokal: 890de2d5 (v222 rundleverans: zcode-exkludering i kvalitetsvakt.mjs + worklog + _v221/_v222-verktyg)\n- Prod:   b55660a45 (fabrik auto-s8-u1: SAMMA zcode-exkludering + byggartefaktkur + 2,5 GB-städning)\n- Plan: git fetch prod && git merge prod/develop — konflikt i verktyg/kvalitetsvakt.mjs förväntas\n  (båda sidor lade /zcode i SITEMAP_EXKLUDERA); lösning = behåll EN /zcode-rad (innehållsligt identisk ändring),\n  ta övrigt från båda. Konfliktmarkeringar i worklog.md löses med union (min v222-sektion + deras rader).\n`);

console.log('== FETCH ==');
console.log(ko('git fetch prod develop 2>&1', 120));
console.log('\n== MERGE ==');
console.log(ko('git merge prod/develop --no-edit 2>&1 | tail -15', 120));
console.log('\n== STATUS ==');
console.log(ko('git status --short | head -15'));
console.log('\n== KONFLIKTMARKÖRER I KVALITETSVAKT ==');
try {
  const src = fs.readFileSync('verktyg/kvalitetsvakt.mjs', 'utf8');
  const antal = (src.match(/<<<<<<</g) || []).length;
  const zcode = (src.match(/\/zcode/g) || []).length;
  console.log(`konfliktblock: ${antal} · /zcode-förekomster: ${zcode}`);
  if (antal === 0) {
    const rad = src.split('\n').find(r => r.includes('SITEMAP_EXKLUDERA'));
    console.log('EXKLUDERA-raden: ' + rad);
  }
} catch (e) { console.log('(läsfel ' + e.message.split('\n')[0] + ')'); }
