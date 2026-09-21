// _s1u3-m9kassa-paket-bygg.mjs — bygger FLYTTKLART-PAKET för m9-3
// kassaflodesanalys-101 (v1, det som ligger i kön) ur utkastfilen själv:
// body = mall-body (kvitto strippat) + disclaimer sist. GRIND innan skriv:
// kontrolleraText (exakt spegel) på title+description+body = 0 FEL/0 VARNING,
// disclaimer sist, JSON giltig. Körs: node verktyg/_s1u3-m9kassa-paket-bygg.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import crypto from 'node:crypto';

process.chdir('/home/ak1a/AK1');
const v1 = JSON.parse(readFileSync('data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json', 'utf8'));
const bodyHela = String(v1.bodyMarkdown || '');
const kvittoStart = bodyHela.indexOf('## Granskningsunderlag — maskinens kvitto');
if (kvittoStart < 0) throw new Error('kvitto-avsnitt saknas');
const mallBody = bodyHela.slice(0, kvittoStart).trim();
const disclaimerRad = bodyHela.trim().split('\n').pop().trim();
const paketBody = mallBody + '\n\n' + disclaimerRad;

const TITLE = 'Kassaflödesanalys 101 september 2026 — fria kassaflöden och konverteringsgrad';
const DESCRIPTION = 'Tre kassaflödesmått förklarade med universumets egna tal: FCF-marginal mätt för 92 av 100 bolag (median 10,8 %), FCF-avkastning för 87 (median 3 %) och härledd konverteringsgrad för 84 — en deskriptiv översikt, inte en värdering. Underlag hämtat 2026-09-03.';

// GRIND 1: kontrolleraText (exakt spegel av src/lib/varumarke.ts:141)
const raa = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));
const kontrolleraText = (text) => {
  const fel = [], varningar = [];
  for (const f of raa.forbjudnaFraser) {
    const re = new RegExp(f.fran, 'giu');
    re.lastIndex = 0;
    let t;
    while ((t = re.exec(text)) !== null) (f.allvar === 'FEL' ? fel : varningar).push({ fras: t[0], index: t.index });
  }
  return { fel, varningar };
};
const grind = kontrolleraText(`${TITLE}\n${DESCRIPTION}\n${paketBody}`);
if (grind.fel.length || grind.varningar.length) {
  console.error(`GRIND NEKAR: ${grind.fel.length} FEL · ${grind.varningar.length} VARNING`, JSON.stringify(grind).slice(0, 600));
  process.exit(1);
}
// GRIND 2: disclaimer = paketkroppens exakta sista rad
if (paketBody.trim().split('\n').pop().trim() !== disclaimerRad || !/aldrig investeringsrådgivning \(lagen 2007:528\)/.test(disclaimerRad)) {
  console.error('GRIND NEKAR: disclaimer inte exakt sist');
  process.exit(1);
}
// GRIND 3: struktur
if ((mallBody.match(/^## /gm) || []).length < 2 || mallBody.length < 800) {
  console.error('GRIND NEKAR: struktur (rubriker/längd)');
  process.exit(1);
}

const paket = {
  slug: v1.slug,
  title: TITLE,
  description: DESCRIPTION,
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: null,
  readingMinutes: 3,
  tags: ['kassaflödesanalys', 'fritt kassaflöde', 'FCF-marginal', 'konverteringsgrad', 'portföljforskning'],
  body: paketBody,
};
const ut = 'data/blogg-utkast/granskning/kassaflodesanalys-101-FLYTTKLART-PAKET-2026-09-21.json';
writeFileSync(ut, JSON.stringify(paket, null, 2) + '\n');
writeFileSync('/tmp/s1u3-paket-grind.json', JSON.stringify({
  grind: { fel: 0, varningar: 0, fraser: raa.forbjudnaFraser.length },
  langder: { helaBodyn: bodyHela.length, kvitto: bodyHela.length - kvittoStart, mallBody: mallBody.length, paketBody: paketBody.length },
  md5Paket: crypto.createHash('md5').update(JSON.stringify(paket), 'utf8').digest('hex'),
  ut,
}, null, 2));
console.log(`PAKET GRÖNT (kontrolleraText 0/0 på ${raa.forbjudnaFraser.length} fraser · disclaimer sist · struktur ok)`);
console.log(`hela bodyn ${bodyHela.length} tkn → kvitto strippat ${bodyHela.length - kvittoStart} tkn → paket-body ${paketBody.length} tkn`);
console.log(`→ ${ut}`);
