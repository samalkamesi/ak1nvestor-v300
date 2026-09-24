// Rond 153 — DoD-sond för kunduppdrag RAPPORTAKADEMIN (Lag 1: bevis före dom)
import fs from 'node:fs';
import { execSync, execFileSync } from 'node:child_process';

const PROD = '/home/ak1a/AK1';
const u = {};

// 1. Snittet LIVE (localhost = loopback-whitelistad + https-kontroll)
try {
  const r = await fetch('http://localhost:3000/rapportakademin', { redirect: 'manual' });
  u.snittLocalhost = r.status;
  const r2 = await fetch('https://lab.ak1nvestor.com/rapportakademin', { redirect: 'manual' });
  u.snittHttps = r2.status;
} catch (e) { u.snittFel = String(e).slice(0, 200); }

// 2. Bedöm-först-grindens Gästform (r148-kuren: GET 200 + kod-i-kropp, ej 401-resursfel)
try {
  const r = await fetch('http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025');
  const body = await r.json().catch(() => ({}));
  u.passGet = { status: r.status, kod: body.kod ?? null };
} catch (e) { u.passGet = { fel: String(e).slice(0, 200) }; }

// 3. Mutationens grind lever (POST utan auth = 401 — rätt status för mutation)
try {
  const r = await fetch('http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  u.passPostUtanAuth = r.status;
} catch (e) { u.passPostFel = String(e).slice(0, 200); }

// 4. Gränssnittsvaktens senaste rapport: /rapportakademin med bland 180 + 0 fynd?
try {
  const filer = fs.readdirSync(PROD + '/data/vakten').filter(f => /^granssnitt-.*\.json$/.test(f)).sort();
  const senaste = filer[filer.length - 1];
  const rapp = JSON.parse(fs.readFileSync(PROD + '/data/vakten/' + senaste, 'utf8'));
  const str = JSON.stringify(rapp);
  u.vakt = {
    fil: senaste,
    innehallerRapportakademin: str.includes('rapportakademin'),
    fynd: (rapp.fynd ?? rapp.antalFynd ?? rapp.sammanfattning?.fynd ?? 'okänd-nyckel'),
  };
} catch (e) { u.vaktFel = String(e).slice(0, 200); }

// 5. Laggrundade kur-commits anfäder i prod-HEAD?
for (const [namn, hash] of Object.entries({ citatValidator: '8abf541e', passGetKur: '141c7e77', navEntre: '443e6a2b' })) {
  try {
    execFileSync('git', ['-C', PROD, 'merge-base', '--is-ancestor', hash, 'HEAD'], { stdio: 'pipe' });
    u['anfad.' + namn] = `${hash} ✓`;
  } catch { u['anfad.' + namn] = `${hash} SAKNAS`; }
}

// 6. Fas 2-grind server-side i pass-rutten (kodens egen grindsats)
try {
  const kod = fs.readFileSync(PROD + '/src/app/api/rapportakademin/pass/route.ts', 'utf8');
  u.fas2grind = {
    requireAdmin: kod.includes('requireAdmin'),
    fas2EllerKod: /fas ?2|FAS_2|planerar|prenumeration/i.test(kod),
  };
} catch (e) { u.fas2Fel = String(e).slice(0, 200); }

// 7. Motorvalidering (gröna sviter) — senaste motorrapport
try {
  const filer = fs.readdirSync(PROD + '/data/vakten').filter(f => /motor|validering/i.test(f)).sort();
  u.motorFiler = filer.slice(-3);
} catch (e) { u.motorFel = String(e).slice(0, 120); }

fs.writeFileSync('/home/ak1a/agent/ak1/data/vakten/r153-dod-sond.json', JSON.stringify(u, null, 1));
console.log(JSON.stringify(u, null, 1));
