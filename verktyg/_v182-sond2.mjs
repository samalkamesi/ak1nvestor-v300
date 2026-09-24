// sond 2: blocktyper i V-kurser + renderarens typstöd + underlagens a-f-struktur + fabriks manifestfält
import { readFileSync } from 'node:fs';

const dc = JSON.parse(readFileSync('/home/ak1a/agent/ak1/public/deep-courses.json', 'utf8'));
const typer = new Map();
for (let i = 1; i <= 20; i++) {
  const slug = Object.keys(dc).find(s => s.startsWith('v' + String(i).padStart(2, '0') + '-'));
  if (!slug) { console.log('SAKNAR V' + i); continue; }
  for (const kap of dc[slug].chapters) for (const b of kap.blocks) {
    typer.set(b.type, (typer.get(b.type) || 0) + 1);
  }
}
console.log('== distinkta blocktyper i V01-V20:', JSON.stringify([...typer.entries()]));

// renderare: hitta kurskomponenten
import { execSync } from 'node:child_process';
const grep = execSync("grep -rn \"'utmaning'\\|\\\"utmaning\\\"\\|'insikt'\\|\\\"insikt\\\"\" /home/ak1a/agent/ak1/src --include='*.tsx' --include='*.ts' -l | head -10").toString();
console.log('== filer med utmaning/insikt:', grep);

// underlagets a-f-struktur för V01
const txt = readFileSync('/home/ak1a/agent/ak1/data/kurser/fas2-djup/indikatorer-01-10.md', 'utf8');
const v1start = txt.indexOf('## V01');
const v2start = txt.indexOf('## V02');
const v1 = txt.slice(v1start, v2start);
console.log('== V01-sektionen (' + v1.length + ' tecken), struktur-rader:');
v1.split('\n').filter(l => /^\*\*[a-f]\)/.test(l.trim()) || /^###/.test(l) || /^[a-f]\)/.test(l.trim())).forEach(l => console.log('   ', l.slice(0, 100)));
console.log('== V01 första 600 tecken:');
console.log(v1.slice(0, 600));

// fabriken: manifestfält
const fab = readFileSync('/home/ak1a/agent/ak1/verktyg/agentfabrik.mjs', 'utf8');
const falt = fab.match(/uppgift\.\w+|manifest\.\w+|u\.\w+/g);
console.log('== fabrikens fältreferenser:', [...new Set(falt || [])].join(' '));
const modell = fab.match(/modell|model/gi);
console.log('== modell-stöd i fabriken:', modell ? [...new Set(modell)].join(',') : 'INGET');
