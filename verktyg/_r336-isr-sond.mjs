// r336 ISR-sond: bevarar ISR-omrenderingen vår 404-märkning? (r335:s bokade uppföljning)
// Övervakar http://localhost:3000/blogg/sa-laser-du-ericsson-q3-2026 + .meta-filen:
// var 60:e s: HTTP-kod + .meta {status, mtime}. Omrendering belagas av .meta-mtime-
// ändring (Next skriver meta vid omrendering) eller HTTP-övergång. Dom vid: omrendering
// sedd ⇒ 404 bevarad? annars tak 12:45 UTC. Logg: data/vakten/r336-isr-sond.log + dom-JSON.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const LOGG = `${YTA}/data/vakten/r336-isr-sond.log`;
const DOMFIL = `${YTA}/data/forskning/OPTIMERING/lighthouse/r336-isr-meta-beteende.json`;
const SLUG = 'sa-laser-du-ericsson-q3-2026';
const META = `/home/ak1a/AK1/.next/server/app/blogg/${SLUG}.meta`;
const URL = `http://localhost:3000/blogg/${SLUG}`;
const TAK = new Date('2026-09-29T12:45:00Z').getTime();

const logga = (rad) => { fs.appendFileSync(LOGG, `${new Date().toISOString().slice(11, 19)}Z ${rad}\n`); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const lasMeta = () => {
  try {
    const st = fs.statSync(META);
    const j = JSON.parse(fs.readFileSync(META, 'utf8'));
    return { status: j.status ?? 200, mtime: st.mtime.toISOString() };
  } catch { return { status: null, mtime: null }; }
};
const httpKod = () => {
  try { return execSync(`curl -s -o /dev/null -w '%{http_code}' ${URL}`, { timeout: 15000, shell: '/bin/bash' }).toString().trim(); }
  catch { return 'FEL'; }
};

const startMeta = lasMeta();
logga(`ISR-SOND start · slug=${SLUG} · startläge HTTP=${httpKod()} meta=${JSON.stringify(startMeta)}`);
let foregaende = { kod: null, meta: startMeta };
let omrenderingSedd = false;

while (Date.now() < TAK) {
  await sleep(60000);
  const kod = httpKod();
  const meta = lasMeta();
  const metaBytt = meta.mtime !== foregaende.meta.mtime;
  const kodBytt = kod !== foregaende.kod;
  if (metaBytt || kodBytt) {
    logga(`ÄNDRING http=${kod} (förra ${foregaende.kod}) · meta=${JSON.stringify(meta)} (förra ${JSON.stringify(foregaende.meta)})`);
  }
  if (metaBytt) {
    omrenderingSedd = true;
    // ge ISR 5 s att skriva klart, läs igen
    await sleep(5000);
    const efter = lasMeta();
    const slutKod = httpKod();
    const dom = {
      slug: SLUG, ts: new Date().toISOString(),
      händelse: 'omrendering belagd (.meta-mtime ändrad)',
      metaFore: foregaende.meta, metaEfter: efter,
      httpFore: foregaende.kod, httpEfter: slutKod,
      fyrtioFyraBevarad: efter.status === 404,
      dom: efter.status === 404
        ? 'GRÖN — ISR-omrenderingen bevarar .meta-404 (eller skriver egen 404): ingen vakt behövs, postbuild+r335-märkning räcker'
        : 'RÖD — omrenderingen skrev meta utan status 404 ⇒ sidan blir soft-200 igen: VAKANDE LAGER behövs (marke-verktyget cron/på begäran)',
    };
    fs.writeFileSync(DOMFIL, JSON.stringify(dom, null, 2) + '\n');
    logga(`DOM: ${dom.dom}`);
    logga(`ISR-SOND klar (exit 0)`);
    process.exit(0);
  }
  foregaende = { kod, meta };
}
logga(`TAK utan omrendering (ingen .meta-mtime-ändring — ISR kan kräva längre fönster eller skriver ej meta vid notFound-omrendering)`);
fs.writeFileSync(DOMFIL, JSON.stringify({
  slug: SLUG, ts: new Date().toISOString(),
  händelse: 'tak utan omrendering',
  metaSista: foregaende.meta, httpSista: foregaende.kod,
  dom: 'Ingen .meta-omskrivning inom 2,5 h ⇒ bevisad-fromvarå av meta-skrivning vid framtida omrendering är SVAG — default-såkerhet: behåll vakande lager som hypotes, ompröva vid nästa deploy',
}, null, 2) + '\n');
logga('ISR-SOND klar (exit 0)');
process.exit(0);
