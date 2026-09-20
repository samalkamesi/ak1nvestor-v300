// sond mot 464-registret: vilka kandidater har 0 kursägare?
// söker ALLA textfält i public/deep-courses.json (registerposten = allt som appen läser)
import { readFileSync } from 'node:fs';

const reg = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const slugs = Object.keys(reg);

function allText(post) {
  const parts = [post.slug, post.title, post.titel, post.summary, post.why, post.level,
    Array.isArray(post.learn) ? post.learn.join(' ') : post.learn,
    Array.isArray(post.chapters_list) ? post.chapters_list.join(' ') : post.chapters_list,
    post.history, post.lynchSection, post.grahamSection, post.ak1Section];
  if (Array.isArray(post.chapters)) {
    for (const ch of post.chapters) {
      parts.push(ch.title, ch.titel, ch.content);
      if (Array.isArray(ch.blocks)) for (const b of ch.blocks) parts.push(typeof b === 'string' ? b : (b.content || ''));
    }
  }
  return (parts.filter(Boolean).join(' ')).toLowerCase();
}

const texts = slugs.map(s => ({ slug: s, text: allText(reg[s]) }));

const termer = {
  'rp-06-kandidater': ['volatilitetsdrag', 'variansdränering', 'geometrisk avkastning', 'geometriska medel', 'tidsdiversifiering', 'rebalanseringspremie', 'återbalansering', 'rebalansering'],
  'pe-07-kandidater': ['carried interest', 'vattenfall', 'hurdle', 'fastställningsränta', 'zombie', 'co-investering', 'fond-i-fond', 'fund of funds', 'management fee', 'förvaltningsavgift'],
  'gränser': ['volatilitet', 'aritmetiskt', 'onoterad', 'avgift']
};

for (const [grupp, ord] of Object.entries(termer)) {
  console.log('=== ' + grupp);
  for (const t of ord) {
    const traffar = texts.filter(x => x.text.includes(t));
    console.log(`  "${t}": ${traffar.length} träffar${traffar.length > 0 && traffar.length <= 6 ? ' → ' + traffar.map(x => x.slug).join(', ') : traffar.length > 6 ? ' → (många: ' + traffar.slice(0, 6).map(x => x.slug).join(', ') + ' …)' : ' → RENT'}`);
  }
}
