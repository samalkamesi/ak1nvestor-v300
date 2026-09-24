#!/usr/bin/env node
// _r161-verifiera.mjs — väntar in det kurade bygget, verifierar hela v160-kedjan
// live + kör färsk kvalitetsvakt. Skriver /tmp/r161-verifiering.txt.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const PROD = '/home/ak1a/AK1';
const UT = '/tmp/r161-verifiering.txt';
const rader = [];
const logg = (m) => { rader.push(m); writeFileSync(UT, rader.join('\n') + '\n'); };

logg('START ' + new Date().toISOString());

// ── Fas V: vänta in bygget (max 30 min) ──
let byggKlar = false;
for (let i = 0; i < 60; i++) {
  const st = existsSync('/tmp/r160-bygg-status.txt') ? readFileSync('/tmp/r160-bygg-status.txt', 'utf8').trim() : 'saknas';
  if (/^KLAR/.test(st)) { byggKlar = true; logg('BYGG-KLAR: ' + st); break; }
  if (/BYGGFEL|LOCK_UPPTAGT/.test(st)) { logg('BYGG-PROBLEM: ' + st); break; }
  await new Promise((r) => setTimeout(r, 30000));
}
if (!byggKlar) { logg('AVBRYTER: bygget ej klart inom 30 min'); process.exit(1); }

await new Promise((r) => setTimeout(r, 20000)); // ISR-värme

// ── Sidor 200 ──
for (const url of ['/', '/fas2', '/fas3', '/medlemskap', '/prenumeration', '/cookiepolicy', '/privacy-policy',
  '/logga-in', '/topplista', '/bibliotek', '/analyser', '/konfluens', '/vagfundament', '/kalkylator',
  '/portfoljbyggare', '/netnet', '/profil', '/kurser']) {
  try { const r = await fetch('http://localhost:3000' + url); logg(`SIDA ${url} -> ${r.status}`); }
  catch (e) { logg(`SIDA ${url} -> ERR ${e.message}`); }
}

// ── Sitemap ──
try {
  const body = await (await fetch('http://localhost:3000/sitemap.xml')).text();
  logg('SITEMAP /fas2: ' + (body.includes('/fas2') ? 'JA' : 'NEJ'));
} catch (e) { logg('SITEMAP: ERR ' + e.message); }

// ── Live-bevis per delvåg ──
const prober = [
  ['P1 fas2 signatur-knapp', '/fas2', 'btn-guld-signatur'],
  ['P1 fas3 signatur-knapp', '/fas3', 'btn-guld-signatur'],
  ['P2 medlemskap eyebrow', '/medlemskap', 'AK1A Research Lab'],
  ['P2 cookiepolicy 4xl', '/cookiepolicy', 'font-serif text-4xl font-bold">Cookiepolicy'],
  ['P2.5 analyser SektionsCta', '/analyser', 'Börja gratis'],
  ['P2.5 konfluens SektionsCta', '/konfluens', 'Börja gratis'],
  ['P2.5 kalkylator SektionsCta', '/kalkylator', 'Börja gratis'],
  ['P3.1 fas2 beige-token', '/fas2', 'text-beige-hero'],
  ['P3.1 start guld-hero-token', '/', 'guld-hero'],
];
for (const [namn, url, needle] of prober) {
  try {
    const body = await (await fetch('http://localhost:3000' + url)).text();
    logg(`BEVIS ${namn}: ` + (body.includes(needle) ? 'JA' : 'NEJ'));
  } catch (e) { logg(`BEVIS ${namn}: ERR ${e.message}`); }
}

// ── Färsk kvalitetsvakt (prod-trädet) ──
try {
  execFileSync('node', ['verktyg/kvalitetsvakt.mjs'], { cwd: PROD, timeout: 300000, stdio: 'ignore' });
  const rap = readFileSync(`${PROD}/data/rapporter/kvalitetsrapport-SENASTE.md`, 'utf8');
  const rad = rap.split('\n').filter((l) => /ANTAL FEL/.test(l)).pop();
  const gen = rap.split('\n').filter((l) => /[Gg]enererad/.test(l)).pop();
  logg('KVALITETSVAKT: ' + (gen || '?') + ' | ' + (rad || '?'));
} catch (e) { logg('KVALITETSVAKT: FEL ' + e.message.slice(0, 200)); }

logg('SLUT ' + new Date().toISOString());
