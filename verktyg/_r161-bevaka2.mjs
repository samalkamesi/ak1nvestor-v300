// Rond 161: slutbevakare — DEPLOYAD → sitemap /fas2 → kvalitetsvakt → GRÖN-bevis.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const prod = '/home/ak1a/AK1';
const deadline = Date.now() + 9 * 60 * 1000;

while (Date.now() < deadline) {
  const svans = readFileSync(`${prod}/data/vakten/prod-synk.log`, 'utf8').trim().split('\n').slice(-3);
  const deployad = svans.find((r) => r.includes('DEPLOYAD automatiskt'));
  if (deployad) {
    console.log('DEPLOY LANDAT:', deployad);
    await new Promise((r) => setTimeout(r, 30000));

    const bas = 'https://lab.ak1nvestor.com';
    const sm = await (await fetch(bas + '/sitemap.xml')).text();
    console.log('LIVE-SITEMAP /fas2:', sm.includes('<loc>' + bas + '/fas2</loc>'), '| storlek:', sm.length);
    const f2 = await (await fetch(bas + '/fas2')).text();
    console.log('/fas2 "kundgrupper" (3fa731d8-kuren live):', f2.includes('kundgrupper'));

    console.log('\n== KVALITETSVAKTEN (manuell körning i prod) ==');
    try {
      const vakt = execFileSync('node', ['verktyg/kvalitetsvakt.mjs'], {
        cwd: prod,
        encoding: 'utf8',
        timeout: 300000,
        maxBuffer: 16 * 1024 * 1024,
      });
      const rader = vakt.split('\n');
      for (const r of rader.filter((r) => /ANTAL FEL|STATUS:|FAIL|RÖD/.test(r)).slice(0, 8)) console.log(' ', r.trim().slice(0, 160));
    } catch (e) {
      console.log('vaktkörningsfel:', String(e.stdout || e.message).slice(0, 400));
    }
    process.exit(0);
  }
  console.log(new Date().toISOString().slice(11, 19), '| svans:', svans[svans.length - 1].slice(0, 100));
  await new Promise((r) => setTimeout(r, 120000));
}
console.log('fönster utgick — deploy fortfarande på gång');
