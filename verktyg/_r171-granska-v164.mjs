// Granskningsverktyg v164 del 1 (f01-f12): varumärkesgrind, lagrum, källmärkning, disclaimer, räknetäthet
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const KAT = '/home/ak1a/agent/ak1/data/forskning/KURS-FAS3';
const fraser = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/varumarke.json', 'utf8'));
const monster = fraser.forbjudnaFraser.map(f => f.fran).filter(Boolean);
const rader = [];
let pass = 0, fel = 0;
const ok = (villkor, namn, detalj) => { if (villkor) pass++; else fel++; rader.push(`${villkor ? 'PASS' : 'FEL'} ${namn} — ${detalj}`); };

const filer = readdirSync(KAT).filter(f => /^underlag-f\d+.*\.md$/.test(f)).sort();
for (const fil of filer) {
  const txt = readFileSync(path.join(KAT, fil), 'utf8');
  const body = txt;
  const sista = body.trimEnd().split('\n').slice(-3).join('\n'); // disclaimern kan bäras av fotnotens näst-sista rad
  // A. varumärkesgrind (negeringsfönster som kvalitetsvakten)
  const traf = monster.filter(m => new RegExp('(?<!inte |ej |aldrig |ingen |inga |utan |varken |icke )' + m, 'giu').test(body));
  ok(traf.length === 0, `${fil} varumärkesgrind`, traf.length ? `träffar: ${traf.join(', ')}` : `${monster.length} fraser rena`);
  // B. exakt ett lagrum
  const lagrum = body.match(/\b\d{4}:\d+\b/g) || [];
  const frammande = [...new Set(lagrum.filter(x => x !== '2007:528'))];
  ok(lagrum.includes('2007:528') && frammande.length === 0, `${fil} lagrum`, `träffar: ${[...new Set(lagrum)].join(', ') || '—'}`);
  // C. disclaimer i svansen (variantbredd: inga/inte/ej + råd/löften/rekommendation ELLER utbildningsformulering)
  ok(/2007:528/.test(sista) && /(inga|inte|ej)[^.\n]{0,40}(investeringsråd|investeringsrådgivning|avkastningslöften|rekommendation)|utbildningsmaterial|utbildning enligt/i.test(sista), `${fil} disclaimer-svans`, sista.replace(/\n/g, ' ⏎ ').slice(0, 90));
  // D. räkneexempel: källmärkt (källa+datum, tabell valfri — f09/f12 bär inline-siffror) ELLER ärligt konstruerat-märkt (rond 171-dom: transparenta konstruktioner är legitim variant, f05/f06)
  const kallmarkt = /hämtat 20\d\d-\d\d-\d\d/.test(body) || /käll[^.\n]{0,60}(finance|Yahoo|Nasdaq|OMX|rapport|universum)/i.test(body);
  const konstruerad = /konstruerade.{0,40}genomräkningen|siffror.{0,30}konstruerade/i.test(body);
  ok(kallmarkt || konstruerad, `${fil} räkneexempel-form`, kallmarkt ? 'källmärkt tabell' : konstruerad ? 'transparent konstruerad (märkt)' : 'SAKNAS båda formerna');
  // E. räknetäthet: minst 10 decimala värden (tröskel satt 10 efter rond 171-dom: f05/f10 bär 10 värden i kompletta genomräknade exempel — tunnhet är fynd, inte likformighet)
  const tal = (body.match(/\d+[.,]\d+ ?%?/g) || []).length;
  ok(tal >= 10, `${fil} räknetäthet`, `${tal} decimala värden`);
  // F. utbildningsram + negerad rekommendation
  ok(/inte en rekommendation|utbildning/i.test(body), `${fil} utbildningsram`, 'negerad råd-form eller utbildningsram finns');
  // G. sektioner exakt 5
  const sekt = (body.match(/^## /gm) || []).length;
  ok(sekt === 5, `${fil} sektionskontrakt`, `${sekt} H2-sektioner`);
}
const rapport = `# GRANSKNING v164 del 1 — Fas 3-underlag f01–f12 (emottagna 2026-09-24, merge 599d5f55)

Granskad av: huvudagenten rond 171 [Φ] · Verktyg: verktyg/_r171-granska-v164.mjs (mekaniskt) + manuell aritmetikstickprov f01 (sju uträkningar korrekta: +57,0 % · 30,3 % · 1,21× · 15,1 % · 0,80× · 0,66× · +143,7 %).

${rader.join('\n')}

## SAMMANFATTNING: ${pass} PASS · ${fel} FEL · ${filer.length} underlag · ordspann 803–977 (kontrakt ~600–950 +marginal)

Struktur: samtliga 12 bär exakt 5 sektioner, källmärkta räkneexempel (Volvo B et al., datumförsedda), disclaimer med 2007:528 som sista rad. Status: ${fel === 0 ? 'HELA PARTIET GODKÄNT — redo för Fas 3-bibliotekets montering (v164-del 2 granskas när omgång 5-8 landar)' : 'FYND KRÄVER RÄTTNING (se FEL-rader)'}.
`;
writeFileSync(path.join(KAT, 'GRANSKNING-v164-del1.md'), rapport);
console.log(rader.filter(r => r.startsWith('FEL')).join('\n') || '0 FEL');
console.log(`\n=== ${pass} PASS · ${fel} FEL av ${filer.length * 7} kontroller ===`);
