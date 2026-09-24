// sond: v167-manifestförberedelse — blockformat, quizformat, indikatormappning
import { readFileSync } from 'node:fs';

// 1. deep-courses.json — V01:s struktur
const dc = JSON.parse(readFileSync('/home/ak1a/agent/ak1/public/deep-courses.json', 'utf8'));
const v01 = dc['v01-forsaljningstillvaxt'];
console.log('== v01 nycklar:', Object.keys(v01).join(', '));
console.log('== chapterCount-fält?:', 'chapterCount' in v01 ? v01.chapterCount : '(saknas — len=' + v01.chapters.length + ')');
console.log('== totalMinutes:', v01.totalMinutes, '· chapters:', v01.chapters.length);
const k1 = v01.chapters[0];
console.log('== kap1 nycklar:', Object.keys(k1).join(', '));
console.log('== kap1 num/title/minutes:', k1.num, '|', k1.title, '|', k1.minutes);
console.log('== kap1 block[0] nycklar:', Object.keys(k1.blocks[0]).join(', '));
console.log('== kap1 blocktyper:', k1.blocks.map(b => b.typ || b.type || '?').join(','));
console.log('== kap1 quiz[0]:', JSON.stringify(k1.quiz ? k1.quiz[0] : null).slice(0, 300));
const k11 = v01.chapters[10];
console.log('== kap11 num/title/minutes:', k11.num, '|', k11.title, '|', k11.minutes, '| quiz:', k11.quiz ? k11.quiz.length : 'SAKNAS');
console.log('== kap11 blocktyper:', k11.blocks.map(b => b.typ || b.type || '?').join(','));
// hitta ett utmaning-block i V-kurserna (v203)
for (const slug of ['v01-forsaljningstillvaxt', 'v04-ps', 'v09-roe']) {
  const c = dc[slug];
  for (const kap of c.chapters) {
    for (const b of kap.blocks) {
      const t = b.typ || b.type;
      if (t === 'utmaning' || (b.rubrik || '').toLowerCase().includes('utmaning')) {
        console.log('== utmaning-block i', slug, 'kap', kap.num, 'nycklar:', Object.keys(b).join(', '));
        console.log('   text-snutt:', String(b.text || b.innehall || '').slice(0, 150));
        t && console.log('   typ-fält:', JSON.stringify({ typ: b.typ, type: b.type }));
      }
    }
  }
}
// insikt-block?
const v04k11 = dc['v04-ps'].chapters[10];
console.log('== v04 kap11 sista block:', JSON.stringify(Object.keys(v04k11.blocks[v04k11.blocks.length - 1])), 'typ:', v04k11.blocks[v04k11.blocks.length - 1].typ);
console.log('== v04 kap11 blocks[0] full:', JSON.stringify(v04k11.blocks[0]).slice(0, 400));

// 2. indikatorunderlagens rubriker
for (const f of ['indikatorer-01-10.md', 'indikatorer-11-20.md']) {
  const txt = readFileSync('/home/ak1a/agent/ak1/data/kurser/fas2-djup/' + f, 'utf8');
  const heads = txt.split('\n').filter(l => /^##?\s/.test(l));
  console.log('==', f, 'rubriker (' + heads.length + '):');
  heads.slice(0, 40).forEach(h => console.log('   ', h.slice(0, 90)));
}
