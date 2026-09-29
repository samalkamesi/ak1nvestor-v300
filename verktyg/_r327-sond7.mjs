// r327 sond 7: äkta publika slugar + okänd slug (våg 81-kur intakt?) + next-version
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 25000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};

console.log('=== NÄSTA VERSION ===');
console.log(sh("node -e \"console.log(require('/home/ak1a/AK1/node_modules/next/package.json').version)\""));

// Tre äkta publika poster ur data/blogg (publishedAt <= idag)
const dir = '/home/ak1a/AK1/data/blogg';
const idag = '2026-09-29';
const filer = fs.readdirSync(dir).filter(f => f.endsWith('.json')).slice(0, 200);
const publika = [];
for (const f of filer) {
  try {
    const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
    const d = String(j.publishedAt || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d <= idag) publika.push(j.slug);
  } catch {}
}
console.log(`\npublika poster i data/blogg: ${publika.length} st`);

console.log('\n=== KONTROLL: tre äkta publika slugar (väntat 200 + äkta titel) ===');
for (const slug of publika.slice(0, 3)) {
  const kod = sh(`curl -s -o /dev/null -w '%{http_code}' -m 10 http://localhost:3000/blogg/${slug}`);
  const titel = sh(`curl -s -m 10 http://localhost:3000/blogg/${slug} | grep -o '<title>[^<]*' | head -1`);
  console.log(`${slug}: ${kod} | ${titel.slice(0, 70)}`);
}

console.log('\n=== OKÄND SLUG (våg 81: väntat ÄKTA 404) ===');
for (const url of [
  'http://localhost:3000/blogg/finns-inte-12345',
  'http://localhost:3000/en/blogg/finns-inte-12345',
  'http://localhost:3000/ar/blogg/finns-inte-12345',
]) {
  console.log(`${url.replace('http://localhost:3000', '')}: ${sh("curl -s -o /dev/null -w '%{http_code}' -m 10 '" + url + "'")}`);
}
