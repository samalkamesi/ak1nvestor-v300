// r334: ÄKTA motorchunk-signaturer + granskning av de 4 rapporterade chunkarna
import fs from 'node:fs';
import path from 'node:path';

const CHUNKDIR = '/home/ak1a/AK1/.next/static/chunks';
const AKTA = /skannaKonfluens|AKM1_VARIABLER|ak1tsTolkning|raknaKategorier|valideraKonfluens|MAX_TICKER_KONFLUENS/;
const rapporterade = ['0w188-0nasg92.js', '1qvevmz_r67hk.js', '1vzidlm-45ju_.js', '41n3ihu_gg2zl.js'];

const aktaTräffar = [];
for (const f of fs.readdirSync(CHUNKDIR).filter(f => f.endsWith('.js'))) {
  const txt = fs.readFileSync(path.join(CHUNKDIR, f), 'utf8');
  if (AKTA.test(txt)) aktaTräffar.push({ f, kb: Math.round(txt.length / 1024) });
}
console.log('ÄKTA motorchunkar (kod-signatur):');
for (const t of aktaTräffar) console.log(`  ${t.f}  ${t.kb} kB`);
console.log(`totalt: ${aktaTräffar.length} st, summa ${aktaTräffar.reduce((a, t) => a + t.kb, 0)} kB`);

console.log('\n── granskning av rapportens 4 "motorchunkar" ──');
for (const namn of rapporterade) {
  const p = path.join(CHUNKDIR, namn);
  if (!fs.existsSync(p)) { console.log(`${namn}: FINNS EJ (bytt vid nytt byggge)`); continue; }
  const txt = fs.readFileSync(p, 'utf8');
  const akta = AKTA.test(txt);
  const kelly = /kelly|Kelly/.test(txt);
  const bayes = /bayes|Bayes/.test(txt);
  const monte = /monteCarlo|MonteCarlo|Monte Carlo/.test(txt);
  console.log(`${namn}: ${Math.round(txt.length / 1024)} kB · ÄKTA-motorsignatur=${akta} · monte=${monte} kelly=${kelly} bayes=${bayes}`);
  // varför felträff? visa kontext
  for (const re of [/kelly/i, /bayes/i, /Monte Carlo/i]) {
    const m = txt.match(re);
    if (m) {
      const ix = txt.indexOf(m[0]);
      console.log(`   kontext "${m[0]}": …${txt.slice(Math.max(0, ix - 60), ix + 60).replace(/\n/g, ' ')}…`);
    }
  }
}
