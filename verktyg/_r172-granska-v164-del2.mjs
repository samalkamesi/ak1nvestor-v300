// Granskningsverktyg v164 DEL 2 (f13+): samma domregler som del 1 (rond 171)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const KAT = '/home/ak1a/agent/ak1/data/forskning/KURS-FAS3';
const fraser = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/varumarke.json', 'utf8'));
const monster = fraser.forbjudnaFraser.map(f => f.fran).filter(Boolean);
const rader = [];
let pass = 0, fel = 0;
const ok = (villkor, namn, detalj) => { if (villkor) pass++; else fel++; rader.push(`${villkor ? 'PASS' : 'FEL'} ${namn} — ${detalj}`); };

const filer = readdirSync(KAT).filter(f => /^underlag-f(1[3-9]|2\d)/.test(f)).sort();
for (const fil of filer) {
  const body = readFileSync(path.join(KAT, fil), 'utf8');
  const sista = body.trimEnd().split('\n').slice(-3).join('\n');
  const traf = monster.filter(m => new RegExp('(?<!inte |ej |aldrig |ingen |inga |utan |varken |icke )' + m, 'giu').test(body));
  ok(traf.length === 0, `${fil} varumärkesgrind`, traf.length ? `träffar: ${traf.join(', ')}` : `${monster.length} fraser rena`);
  const lagrum = body.match(/\b\d{4}:\d+\b/g) || [];
  const frammande = [...new Set(lagrum.filter(x => x !== '2007:528'))];
  ok(lagrum.includes('2007:528') && frammande.length === 0, `${fil} lagrum`, `träffar: ${[...new Set(lagrum)].join(', ') || '—'}`);
  ok(/2007:528/.test(sista) && /(inga|inte|ej)[^.\n]{0,40}(investeringsråd|investeringsrådgivning|avkastningslöften|rekommendation)|utbildningsmaterial|utbildning enligt/i.test(sista), `${fil} disclaimer-svans`, sista.replace(/\n/g, ' ⏎ ').slice(0, 90));
  const kallmarkt = /hämtat 20\d\d-\d\d-\d\d/.test(body) || /käll[^.\n]{0,60}(finance|Yahoo|Nasdaq|OMX|rapport|universum)/i.test(body);
  const konstruerad = /konstruerade.{0,40}(genomräkningen|tal)|siffror.{0,30}konstruerade|låtsassiffror|på antaganden|ingen hämtad serie/i.test(body);
  ok(kallmarkt || konstruerad, `${fil} räkneexempel-form`, kallmarkt ? 'källmärkt' : konstruerad ? 'deklarerad övningsform (konstruerad/antaganden)' : 'SAKNAS båda formerna');
  // E. räknetäthet: decimaler ≥10 (teknisk analys-klass) ELLER totala tal ≥60 (psykologiklassens heltalsaritmetik — rond 172-dom: f19-f21 bär 74-107 talmarkörer i kompletta genomräkningar)
  const tal = (body.match(/\d+[.,]\d+ ?%?/g) || []).length;
  const talAlla = (body.match(/\d+/g) || []).length;
  ok(tal >= 10 || talAlla >= 60, `${fil} räknetäthet`, `${tal} decimala + ${talAlla} totala värden`);
  ok(/inte en rekommendation|utbildning/i.test(body), `${fil} utbildningsram`, 'negerad råd-form eller utbildningsram finns');
  const sekt = (body.match(/^## /gm) || []).length;
  ok(sekt === 5, `${fil} sektionskontrakt`, `${sekt} H2-sektioner`);
}
const rapport = `# GRANSKNING v164 del 2 — Fas 3-underlag f13+ (emottagna 2026-09-24, merge f6ca23fb)

Granskad av: huvudagenten rond 172 [Φ] · Verktyg: verktyg/_r172-granska-v164-del2.mjs (del 1:s domregler: disclaimerfönster 3 rader, källa+datum utan tabelltvång, konstruerad-märkt accepterad, räknetäthet ≥10).

${rader.join('\n')}

## SAMMANFATTNING: ${pass} PASS · ${fel} FEL · ${filer.length} underlag

Status: ${fel === 0 ? 'PARTI GODKÄNT' : 'FYND KRÄVER RÄTTNING (se FEL-rader)'}.
`;
writeFileSync(path.join(KAT, 'GRANSKNING-v164-del2.md'), rapport);
console.log(rader.filter(r => r.startsWith('FEL')).join('\n') || '0 FEL');
console.log(`\n=== ${pass} PASS · ${fel} FEL · ${filer.length} filer ===`);
