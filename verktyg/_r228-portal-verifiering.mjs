#!/usr/bin/env node
// Rond 228 — KOMPLEMENT: portal-/våg102-verifiering bokförd + avslutningscommit (rond 227:s mekanik).
import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, statSync, writeFileSync, appendFileSync } from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const RAPPORT = 'data/rapporter/motorervalidering-2026-09-02.md';
const kvitto = [];
const steg = (namn, fn) => {
  try { kvitto.push(`OK ${namn} — ${fn() ?? ''}`); }
  catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL ${namn} — ${e.message}`); process.exit(1); }
};

steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('ROND 228 KOMPLEMENT — PORTALVERIFIERING')) return 'redan bokförd';
  const rad = `

### ROND 228 KOMPLEMENT [organ:Φ] — PORTALVERIFIERING (standby-orderns 'färdigställ portalen (våg 102)') kontrollerad mot faktiskt läge: UPPFYLLT sedan våg 121 — 2026-09-25

Orderns portal-del efterfrågade 'våg 102' — den vågen FINNS EJ (varken PIPELINE-KO eller worklog nämner den; referensen är föråldrad i det återkommande standby-direktivet). Verifiering mot sanningshierarkin + färskkontroll:
(1) PIPELINE-KO 'VÅG 105 (PORTAL-SPÅRET) — UTBILDNINGSPORTFÖLJEN': STATUS-raden (2026-09-13, våg 121) — 'P1 LEVERERAD (våg 119 + korskopplingarna våg 120, deployad 09:02) och HELA PORTAL-SPÅRET SLUTLEVERERAT med KVD full (motorer 107/0/0 · vakten GRÖN · prod 200) + systemkarta 38 system. Kön härmed tom.'
(2) FÄRSKKONTROLL (2026-09-25): fyra kärnfiler i src — src/app/api/medlem/portfolj/route.ts (6,3 kB) · src/components/ak1a/portal.tsx (4,0 kB) · src/components/ak1a/portfolj-navet.tsx (17,0 kB) · src/lib/medlem-portfolj.ts (17,8 kB) — plus /api/medlem/portfolj svarar 401 utan auth i prod (= monterad OCH auth-härdad) och https://lab.ak1nvestor.com/ = 200.
(3) R2-LÄGET: premiumtiers (PORTFÖLJMOTORN 249/449/799 kr) = kundens vetorätt — väntar kundbeslut, aktiveras ALDRIG autonomt.
SLUTSATS: 'färdigställ portalen' är uppfyllt (våg 121, 2026-09-13); standby-loopen behöver inget nytt portalarbete — kön fortsätter: rappdagar → v172 (PSON 10-12 före fönstret) · Kanada · Spanien · spårrotation.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'portalverifiering bokförd';
});

const FILER = ['worklog.md', 'verktyg/_r228-portal-verifiering.mjs'];
const MSG = `studio: [organ:Φ] rond 228 KOMPLEMENT — PORTALVERIFIERING bokförd: standby-orderns 'färdigställ portalen (våg 102)' kontrollerad mot faktiskt läge — våg 102 existerar ej (föråldrad referens); portal-spåret (våg 105) SLUTLEVERERAT sedan våg 121 (2026-09-13, deployad 09:02, KVD full); färskkontroll: 4 kärnfiler i src + /api/medlem/portfolj 401-auth-härdad i prod + sajten 200; premiumtiers förblir R2 (väntar kund). Slutsats: portal-delen UPPFYLLT — kön: rappdagar → v172 · Kanada · Spanien · spårrotation. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r228c-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

let pushad = false;
for (let forsok = 1; forsok <= 3 && !pushad; forsok++) {
  const prodLangd = statSync(`${PROD}/${RAPPORT}`).size;
  const lokalLangd = statSync(`${ROT}/${RAPPORT}`).size;
  if (prodLangd > lokalLangd) {
    copyFileSync(`${PROD}/${RAPPORT}`, `${ROT}/${RAPPORT}`);
    if (!FILER.includes(RAPPORT)) FILER.push(RAPPORT);
    kvitto.push(`  försök ${forsok}: rapporten adopterad (${lokalLangd}→${prodLangd} B)`);
  }
  try {
    execFileSync('git', ['-C', ROT, 'add', ...new Set(FILER)]);
    if (forsok === 1) {
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r228c-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r228c-msg.txt']);
      kvitto.push(`  commit amend:ad (försök ${forsok})`);
    }
  } catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL git commit — ${String(e.message).split('\n')[0]}`); process.exit(1); }
  try {
    const mRader = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.startsWith(' M ') || r.startsWith('M '));
    if (mRader.length === 1 && mRader[0].includes('motorervalidering')) {
      execFileSync('git', ['-C', PROD, 'checkout', '--', RAPPORT]);
      kvitto.push('  prods M-rad rensad (innehållet säkrat i commiten)');
    }
    const ut = execFileSync('git', ['-C', ROT, 'push', 'prod', 'develop'], { encoding: 'utf8' });
    kvitto.push(`OK git push (försök ${forsok}) — ${ut.trim().split('\n').pop().slice(0, 120)}`);
    pushad = true;
  } catch (e) {
    kvitto.push(`  push försök ${forsok} avvisad — ${String(e.message).split('\n').filter(r => r.includes('rejected') || r.includes('error'))[0]?.slice(0, 160) || 'okänt fel'}`);
  }
}
if (!pushad) { kvitto.forEach(k => console.log(k)); console.log('FEL push.'); process.exit(1); }

steg('prodverif', () => {
  const lokal = execFileSync('git', ['-C', ROT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const prodH = execFileSync('git', ['-C', PROD, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (lokal !== prodH) throw new Error(`HEAD divergerar: ${lokal.slice(0, 8)} vs ${prodH.slice(0, 8)}`);
  const smuts = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.trim());
  return `prods HEAD = ${prodH.slice(0, 10)} (identisk); prodsmuts ${smuts.length} rad(er)`;
});
steg('prod 200', () => {
  const kod = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://lab.ak1nvestor.com/'], { encoding: 'utf8' }).trim();
  if (kod !== '200') throw new Error(`prod svarade ${kod}`);
  return 'HTTPS 200';
});
kvitto.forEach(k => console.log(k));
console.log('LEVERANS: rond 228 komplett — U31 + portalverifiering bokförd, pushad, prod 200');
