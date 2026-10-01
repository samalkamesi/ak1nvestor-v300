// _s1u1-nflx-q3-paket.mjs — genererar FLYTTKLART-PAKET för sa-laser-du-nflx-q3-2026
// ur ORÖRT utkast + 12 verifierade satser (EXAKT-EN-TRÄFF per sats).
// Fabriksagent s1-u1, manifest auto-s1-1790858103968 (2026-10-01).

import fs from 'node:fs';
import crypto from 'node:crypto';

const ROT = '/home/ak1a/AK1';
const KALLA = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nflx-q3-2026.json`;
const MAL = `${ROT}/data/blogg-utkast/granskning/sa-laser-du-nflx-q3-2026-FLYTTKLART-PAKET-2026-10-01-s1u1.json`;

// Satser D1–D12 (gamla strängen → nya strängen). Källa: KONTROLL 2026-10-01-s1u1.
const SATSER = [
  ['D1', 'B1: H1-25-räntor/övrigt 45→91 (brevets komparativ 90 529 tkr)',
    '52 miljoner i Q2 och 45 miljoner för hela första halvåret 2025',
    '52 miljoner i Q2 och 91 miljoner för hela första halvåret 2025'],
  ['D2', 'B2: högsta P/B = Spotify (11,94), ej Meta (5,78 — Meta bär högsta EBIT-marginalen)',
    'Meta bär grenens högsta P/B — reklamens två världar där Netflix annonsmotor precis startat sin dubblering',
    'Spotify bär grenens högsta P/B (11,9 mot Netflix 11,4) och Meta grenens högsta EBIT-marginal — reklamens två världar, där Netflix annonsmotor precis startat sin dubblering'],
  ['D3', 'B3: 27,1 = kvarvarande auktoriseringskapacitet (ny auktorisation i april var 25,0 på toppen av 6,8)',
    'och styrelsen har auktoriserat 27,1 miljarder till',
    'och kvar i auktoriseringarna står 27,1 miljarder till'],
  ['D4a', 'C4a: n-spannet 21–22→17–23 (tabellens per-mått-n är korrekta)',
    'beräknade ur samma universumfil, 21–22 mätvärden per mått',
    'beräknade ur samma universumfil, 17–23 mätvärden per mått — tabellen redovisar n för varje mått'],
  ['D4b', 'C4b: samma rättning i källraden (där med bindestreck)',
    'med 21-22 mätvärden per mått',
    'med 17-23 mätvärden per mått'],
  ['D5a', 'C5a: P/E-steget är 4,69 — "fem steg"→"nästan fem steg"',
    'och engångsposten som flyttar P/E fem steg',
    'och engångsposten som flyttar P/E nästan fem steg'],
  ['D5b', 'C5b+C6: "fem hela multiplar"→"nästan fem" + versal-artefakten balansradsPOST',
    'fem hela multiplar på en enda balansradsPOST',
    'nästan fem multiplar på en enda balansradspost'],
  ['D7', 'C7: källblödning "approaching"→svenska',
    'världens största strömmingtjänst, approaching en miljard tittare enligt bolaget självt',
    'världens största strömmingtjänst, nära nog en miljard tittare enligt bolaget självt'],
  ['D8', 'C8: P&G-citatet ordagrant (utforskarens parafras stod i citattecken)',
    'med motiveringen "20/10 rent tredjepartsestimat + kommunikationgrenen rikligt täckt"',
    'med motiveringen "20/10, tredjepartsestimat med fönster — serien levererar inte på rena estimat, och kommunikationgrenen är sedan länge rikligt täckt"'],
  ['D9', 'C9: ASM-datumklassen bolagsbekräftad 30/9 (asm.com) — aktualitet vid publicering 20/10',
    'ASM International 27/10 är MarketScreener-källa',
    'ASM International 27/10 var vid byggtiden MarketScreener-källa, bolagsbekräftad 30/9 via asm.coms kalender'],
  ['D10', 'C10: oklar bildning "telik"→"tele-lik"',
    'balansräkningen är telik men inte tele-tung',
    'balansräkningen är tele-lik men inte tele-tung'],
  ['D11', 'B4: valutariktningen omvänd — LATAM hjälpt (+21 mot +16), APAC dragen (+16 mot +18)',
    'valutan drog i Latinamerika och hjälpte i Asien',
    'valutan hjälpte i Latinamerika och drog i Asien'],
];

const raw = fs.readFileSync(KALLA, 'utf8');
const pkg = JSON.parse(raw);
const rapport = { generator: 'verktyg/_s1u1-nflx-q3-paket.mjs', kalla: KALLA, utkastMd5: crypto.createHash('md5').update(raw).digest('hex'), satser: [], avvisade: [] };

for (const [id, beskrivning, gammal, ny] of SATSER) {
  // Träffkontroll på parsade ytor (title+description+body) — citattecken är escapat i råfilen
  const yta = [pkg.title, pkg.description, pkg.body].join('\u0000');
  const n = yta.split(gammal).length - 1;
  if (n !== 1) { rapport.avvisade.push({ id, antalTraffar: n }); console.log(`AVVISAD ${id}: ${n} träffar (kräver exakt 1)`); continue; }
  const iBody = pkg.body.split(gammal).length - 1;
  if (iBody !== 1) { rapport.avvisade.push({ id, bodyTraffar: iBody }); console.log(`AVVISAD ${id}: ${iBody} träffar i body`); continue; }
  pkg.body = pkg.body.replace(gammal, ny);
  rapport.satsER = rapport.satsER || [];
  rapport.satser.push({ id, beskrivning, traffar: 1, verkstald: true });
  console.log(`VERKSTÄLLD ${id}: ${beskrivning}`);
}

// Efterverifiering: gamla felsträngar = 0, nya = 1
const gamlaKvar = SATSER.filter(([, , g]) => pkg.body.includes(g));
const nyaBorta = SATSER.filter(([, , , n]) => !pkg.body.includes(n));
if (gamlaKvar.length || nyaBorta.length || rapport.avvisade.length) {
  console.log(`FEL: gamla kvar=${gamlaKvar.length} nya borta=${nyaBorta.length} avvisade=${rapport.avvisade.length} — paket skrivs INTE`);
  process.exit(1);
}
// Strukturinvarianter: title/description orörda, slug/publiktionsdatum oförändrade
const orig = JSON.parse(raw);
const invarianter = ['slug', 'title', 'description', 'publishedAt', 'readingMinutes', 'tags', 'pillar', 'author'];
for (const k of invarianter) if (JSON.stringify(orig[k]) !== JSON.stringify(pkg[k])) { console.log(`FEL: invariant ändrad: ${k}`); process.exit(1); }
// Title-taket fortfarande inom gräns
if ([...pkg.title].length > 314) { console.log('FEL: title > 314'); process.exit(1); }

fs.writeFileSync(MAL, JSON.stringify(pkg, null, 2) + '\n');
const nyMd5 = crypto.createHash('md5').update(fs.readFileSync(MAL)).digest('hex');
console.log(`\nPAKET SKRIVET: ${MAL}`);
console.log(`satser verkställda: ${rapport.satser.length}/12 · utkast orört md5 ${rapport.utkastMd5} · paket md5 ${nyMd5}`);
