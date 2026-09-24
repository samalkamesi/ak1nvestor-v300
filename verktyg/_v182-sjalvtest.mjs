// _v182-sjalvtest.mjs — bevisa emottagets kontroller med ett syntetiskt v01-fragment ( byggs ur underlaget, körs, raderas, granskningsfilen återställs )
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const FRAG = ROT + '/data/forskning/KURS-FAS2/v167-fragment/v01-forsaljningstillvaxt.json';

// bygg testfragment ur underlagets riktiga sektioner
const txt = readFileSync(ROT + '/data/kurser/fas2-djup/indikatorer-01-10.md', 'utf8');
const start = txt.indexOf('## V01 — Försäljningstillväxt (Tillväxt)');
const sektion = txt.slice(start, txt.indexOf('\n## V02'));
const d = sektion.slice(sektion.indexOf('### d)'), sektion.indexOf('### e)'));
const e = sektion.slice(sektion.indexOf('### e)'), sektion.indexOf('### f)'));
const f = sektion.slice(sektion.indexOf('### f)'));

const frag = {
  slug: 'v01-forsaljningstillvaxt',
  kapitel: {
    num: 12, minutes: 8, title: 'Från teorin till egen räkning',
    intro: 'Du har läst teorin om försäljningstillväxt — nu räknar du själv på NorrTekniks låtsas-siffror.',
    blocks: [
      { type: 'text', content: 'NorrTeknik AB är ett konstruerat bolag — låtsas-årsredovisningens tal är påhittade för övningens skull.\n\n' + d.trim() + '\n\nUtbildningsmaterial — beskriver hur metoden läser och räknar; inga investeringsråd (2007:528).' },
      { type: 'utmaning', content: 'Stopp — svara skriftligen i din analysjournal FÖRE du läser facit i nästa stycke.\n\n' + f.split('Facit')[0].trim() },
      { type: 'text', content: f.trim() },
      { type: 'text', content: 'Kort om fallgroparna: kortsiktiga svängar, engångsposter och olika jämförelseperioder kan snedvrida tillväxttalet — läs stycket om fallgropar i kapitel 10 igen innan du drar slutsatser.' },
      { type: 'insikt', content: 'Övningen du just gjorde är exakt hur AKM1:s trösklar läser försäljningstillväxten, hur nyckeltalsguiden poängsätter den, hur AKM2 använder den som analysvittne, hur AI-Mentorn förhöjer dig i den och hur portföljmotorn följer den över tid.' },
    ],
    quiz: [
      { q: 'Försäljningstillväxten beräknas alltid på nettoomsättningen, inte bruttoomsättningen.', alternativ: ['påstående A', 'påstående B', 'påstående C', 'påstående D'], ratt: 2, tips: 'Se beräkningssteget i kapitlet.' },
      { q: 'Engångsposter kan snedvrida tillväxttalet om de inte rensas ut.', alternativ: ['a', 'b', 'c', 'd'], ratt: 0, tips: 'Se fallgropspåminnelsen.' },
      { q: 'Räkneexemplens bolag NorrTeknik AB är verkligt och börsnoterat.', alternativ: ['a', 'b', 'c', 'd'], ratt: 1, tips: 'Se deklarationen i räkneexemplet.' },
    ],
  },
};
writeFileSync(FRAG, JSON.stringify(frag, null, 2));
console.log('testfragment skrivet');

// kör status
const ut = execSync('node ' + ROT + '/verktyg/_v182-emottag.mjs status', { cwd: ROT }).toString();
console.log(ut.trim());
const granskFöre = readFileSync(ROT + '/data/forskning/KURS-FAS2/V167-GRANSKNING.md', 'utf8');
const v01block = granskFöre.includes('### v01-forsaljningstillvaxt — GRÖN');
console.log('v01 GRÖN-block i granskningsfilen:', v01block);
const talrad = (granskFöre.match(/✓ talmarkörer [^\n]+/g) || []).join(' | ');
console.log('talmarkörrad:', talrad);

// städa: radera fragment + ta bort testblocket ur granskningsfilen + kör status igen
unlinkSync(FRAG);
let g = readFileSync(ROT + '/data/forskning/KURS-FAS2/V167-GRANSKNING.md', 'utf8');
const a = g.indexOf('\n### v01-forsaljningstillvaxt');
if (a >= 0) {
  const bMatch = g.slice(a + 1).match(/\n### |\n$/);
  const b = bMatch ? a + 1 + bMatch.index : g.length;
  g = g.slice(0, a) + g.slice(b);
}
g = g.replace(/^## LÄGE:.*$/m, '## LÄGE: 0 levererade · 20 väntar: v01-forsaljningstillvaxt, v02-arr-tillvaxt, v03-intaktsdiversifiering, v04-ps, v05-pb, v06-ev-ebitda, v07-bruttomarginal, v08-ebitda-marginal, v09-roe, v10-skuldsattningsgrad, v11-likviditet, v12-intaktsstabilitet, v13-patent-ip, v14-varumarke, v15-natverkseffekter, v16-produktlanseringar, v17-avtal-partnerskap, v18-regulatoriska, v19-kapitalforbranning, v20-aterekop-egna-aktier');
g = g.replace(/^## SAMMANFATTNING:.*$/m, '## SAMMANFATTNING: 0 PASS · 0 FEL (vågen inleds)');
writeFileSync(ROT + '/data/forskning/KURS-FAS2/V167-GRANSKNING.md', g);
const ut2 = execSync('node ' + ROT + '/verktyg/_v182-emottag.mjs status', { cwd: ROT }).toString();
console.log('efter städning:', ut2.trim());
console.log('fragment borta:', !existsSync(FRAG));
console.log(v01block ? 'SJÄLVTEST GRÖNT — kontrollerna godkänner korrekt format' : 'SJÄLVTEST RÖTT — v01 blev inte GRÖN');
