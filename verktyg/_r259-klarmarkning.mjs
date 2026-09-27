// Rond 111 (r257): 21 kris-slugs bevis + uppdrag-klart-markering + SEO-objektsond
import fs from 'node:fs';

const slugs = ['engi-pa','eoan-de','fnt-de','hei-de','ifx-de','li-pa','muv2-de','ng-l','ntr','pson-l','pub-pa','puig-mc','rci-b','ree-mc','rr-l','saf-pa','sge-l','sgo-pa','shl-de','sn-l','td'];
const status = {};
let fel = 0;
for (const s of slugs) {
  try { const r = await fetch('http://localhost:3000/bolag/' + s, { redirect: 'manual' }); status[s] = r.status; if (r.status !== 200) fel++; }
  catch (e) { status[s] = 'FEL'; fel++; }
}
// extra: de två nya Indien-sidorna + rot/dataset igen för samma bevisrad
for (const s of ['apollohosp-ns','hal-ns']) {
  try { const r = await fetch('http://localhost:3000/bolag/' + s, { redirect: 'manual' }); status[s] = r.status; } catch { status[s] = 'FEL'; }
}
console.log('SLUGS:', JSON.stringify(status));
console.log('FEL:', fel);

if (fel === 0) {
  const nu = Date.now();
  const klart = {
    sammanfattning: '404-krisen (84 fynd, 21 bolagssidor) helkedje-läkt: roten = dataleveranser utan bygge, kurerad med deploy-protokoll (r247-lärdomen + r255-receptet pm2-stop), sista bevisade 2026-09-25 23:07-bygget (BUILD_ID på 5902867f, 311 bolag) — samtliga 21 kris-slugar + apollohosp-ns + hal-ns = 200, gränssnittsvakten GRÖN 0 fynd/180 (23:26-rapporten mot nya bygget).',
    bevis: 'https://lab.ak1nvestor.com/bolag/apollohosp-ns + /bolag/hal-ns = 200 (r258-sond); 21/21 kris-slugar localhost 200 (r259-skript); granssnitt-2026-09-25T232614.json 0 fynd; deploykedja flock-låst, statusfil /tmp/r255-repair-status.txt R255-REPAIR-KLAR.',
    ts: nu
  };
  fs.writeFileSync('/home/ak1a/agent/ak1/data/vakten/uppdrag-klart.json', JSON.stringify(klart, null, 1));
  console.log('UPPDRAG-KLART skriven.');
} else {
  console.log('AVVIKELSE — uppdrag-klart EJ skriven,', fel, 'sidor svarar ej 200.');
}

// SEO-objektsond: finns B24-B28 översättningar redan på disk?
const k = '/home/ak1a/agent/ak1/data/blogg-utkast/';
const kand = ['medtechaktier-sa-analyserar-du-medicintekniska-bolag-en','vardaktier-sa-analyserar-du-vardbolag-en','skogsaktier-sa-analyserar-du-skogsbolag-en','byggaktier-sa-analyserar-du-byggbolag-en','investmentbolag-sa-analyserar-du-investmentbolag-en'];
for (const c of kand) console.log(c, fs.existsSync(k + c + '.json') ? 'FINNS' : 'saknas');
// arabiska läget: räkna -ar-filer
const ar = fs.readdirSync(k).filter(f => f.endsWith('-ar.json'));
console.log('AR-filer:', ar.length, ar.slice(-6));
// senaste anspråksfiler (race-skydd)
const vakten = '/home/ak1a/agent/ak1/data/vakten/';
const ansprak = fs.readdirSync(vakten).filter(f => f.includes('ansprak')).sort();
console.log('Senaste anspråk:', ansprak.slice(-4));
