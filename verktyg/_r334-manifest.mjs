// r334: mappa motorchunkar → rutter (turbopack build-manifest)
import fs from 'node:fs';

const next = '/home/ak1a/AK1/.next';
const m = JSON.parse(fs.readFileSync(next + '/build-manifest.json', 'utf8'));
console.log('nycklar i build-manifest:', Object.keys(m).join(', '));
const dir = next + '/static/chunks';
const motor = new Set();
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const t = fs.readFileSync(dir + '/' + f, 'utf8');
  if (/monteCarlo|MonteCarlo/.test(t) || /superanalys|Superanalys/.test(t)) motor.add(f);
}
console.log('\nmotorchunkar (monteCarlo|superanalys): ' + [...motor].join(', '));

// sök alla värden i manifestet efter motorchunk-namn
const txt = fs.readFileSync(next + '/build-manifest.json', 'utf8');
for (const namn of motor) {
  const ix = txt.indexOf(namn);
  console.log('\n' + namn + ' hittad i build-manifest: ' + (ix >= 0));
  if (ix >= 0) console.log(txt.slice(Math.max(0, ix - 300), ix + namn.length + 50));
}
