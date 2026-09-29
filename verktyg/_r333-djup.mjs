// r333 djup: exakt motoridentifiering + fulla URL-faser (initial/scroll) på / + /kurser
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { chromeSokvag } from '/home/ak1a/agent/ak1/verktyg/chrome-sokvag.mjs';

const YTA = '/home/ak1a/agent/ak1';
const CHUNKDIR = '/home/ak1a/AK1/.next/static/chunks';

console.log('=== ARTEFAKT-LÄGE ===');
console.log('BUILD_ID-mtime: ' + fs.statSync('/home/ak1a/AK1/.next/BUILD_ID').mtime.toISOString());

console.log('\n=== CHUNK-ANALYS (exakta grepp) ===');
const rader = [];
for (const f of fs.readdirSync(CHUNKDIR).filter(f => f.endsWith('.js'))) {
  const txt = fs.readFileSync(path.join(CHUNKDIR, f), 'utf8');
  const st = fs.statSync(path.join(CHUNKDIR, f)).size;
  rader.push({
    fil: f,
    kb: Math.round(st / 1024),
    monteCarlo: /monteCarlo|MonteCarlo/.test(txt),
    kelly: /kelly|Kelly/.test(txt),
    bayes: /bayes|Bayes/.test(txt),
    superanalys: /superanalys|Superanalys/.test(txt),
  });
}
rader.sort((a, b) => b.kb - a.kb);
for (const r of rader.filter(r => r.monteCarlo || r.superanalys)) console.log(`MOTOR-SÄKER: ${r.fil} ${r.kb} kB (monteCarlo=${r.monteCarlo} superanalys=${r.superanalys} kelly=${r.kelly})`);
console.log('övriga kelly/bayes-träffar (möjliga text-falska):');
for (const r of rader.filter(r => (r.kelly || r.bayes) && !r.monteCarlo && !r.superanalys).slice(0, 5)) console.log(`  ${r.fil} ${r.kb} kB (kelly=${r.kelly} bayes=${r.bayes})`);

const motorSakra = new Set(rader.filter(r => r.monteCarlo || r.superanalys).map(r => r.fil));
console.log(`motorSÄKRA set: ${motorSakra.size} st`);

// ── browser med fulla URL:er och faser ──
const browser = await puppeteer.launch({
  executablePath: chromeSokvag(),
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
async function fasMät(url) {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const händelser = [];
  page.on('response', resp => {
    const u = resp.url();
    if (u.includes('/_next/static/') && u.endsWith('.js')) händelser.push({ fas: 'initial', u: u.replace('http://localhost:3000', '') });
  });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 1500));
  const initialAntal = händelser.length;
  page.on('response', resp => {
    const u = resp.url();
    if (u.includes('/_next/static/') && u.endsWith('.js')) händelser.push({ fas: 'scroll', u: u.replace('http://localhost:3000', '') });
  });
  await page.evaluate(async () => {
    const steg = Math.ceil(document.body.scrollHeight / 8);
    for (let y = 0; y <= document.body.scrollHeight; y += steg) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 350));
    }
  });
  await new Promise(r => setTimeout(r, 6000));
  await page.close();
  console.log(`\n=== ${url} (initial ${initialAntal} js) ===`);
  const motor = händelser.filter(h => motorSakra.has(h.u.split('/').pop().split('?')[0]));
  motor.forEach(m => console.log(`  MOTOR ${m.fas}: ${m.u}`));
  const scrollNya = händelser.slice(initialAntal).filter(h => h.fas === 'scroll' && h.u.includes('/chunks/'));
  console.log(`scroll-fasens chunk-url:er (${scrollNya.length}):`);
  scrollNya.slice(0, 12).forEach(h => console.log('  ' + h.u));
  if (motor.length === 0 && scrollNya.length === 0) console.log('  (inga nya chunks i scroll-fasen)');
}
await fasMät('http://localhost:3000/');
await fasMät('http://localhost:3000/kurser');
await browser.close();
console.log('\nKLAR djup');
