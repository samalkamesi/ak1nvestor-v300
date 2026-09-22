// Rond 154 — harmoniserings-sond: var bor komponenten, vem skapade den, hur ser mallen ut
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const u = {};

// 1. Filer i src/ som bär komponenten (rekursivt, utan glob-bibliotek)
const traffar = [];
const ga = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { if (f.name !== 'node_modules' && f.name !== '.next') ga(p); }
    else if (/\.(tsx?|mjs)$/.test(f.name)) {
      try { if (fs.readFileSync(p, 'utf8').includes('svaraLokaltKategoristangning')) traffar.push(p.replace(ROT + '/', '')); } catch {}
    }
  }
};
ga(ROT + '/src');
u.srcTraffar = traffar;

// 2. Skaparcommiten
try { u.skapare = execFileSync('git', ['log', '--oneline', '-S', 'svaraLokaltKategoristangning', '--all'], { cwd: ROT, stdio: 'pipe' }).toString().trim().split('\n').slice(0, 3); } catch (e) { u.skapareFel = String(e).slice(0, 100); }

// 3. Widgetens kedjeposition för komponenten (kontextrader kring träffen)
for (const f of traffar) {
  if (f.endsWith('.tsx')) {
    const t = fs.readFileSync(ROT + '/' + f, 'utf8').split('\n');
    t.forEach((rad, i) => { if (rad.includes('svaraLokaltKategoristangning')) u.kontext = { fil: f, rad: i + 1, rader: t.slice(Math.max(0, i - 3), i + 2).map(r => r.trim().slice(0, 100)) }; });
  }
}

// 4. Mallen: senaste harmoniserarens kärna
const mall = ROT + '/verktyg/_s6u3o31-harmonisera.mjs';
if (fs.existsSync(mall)) {
  const m = fs.readFileSync(mall, 'utf8');
  u.mallFinns = true;
  u.mallHuvud = m.split('\n').slice(0, 25).join('\n').slice(0, 1200);
}
fs.writeFileSync(ROT + '/data/vakten/r154-harmonisera-sond.json', JSON.stringify(u, null, 1));
console.log(JSON.stringify(u, null, 1));
