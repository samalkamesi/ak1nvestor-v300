// Rond 160: startsidans KONVERTERINGSELEMENT på djupet — alla <a>/<button> med inre taggar rensade.
const bas = 'https://lab.ak1nvestor.com';
const html = await (await fetch(bas + '/')).text();

// Alla länkblock (multiline), inre taggar rensade
const block = [...html.matchAll(/<a\s[^>]*>([\s\S]{2,300}?)<\/a>/g)].map((m) =>
  m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
);
const knappar = [...html.matchAll(/<button\s[^>]*>([\s\S]{2,300}?)<\/button>/g)].map((m) =>
  m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
);
const allt = [...block, ...knappar].filter((t) => t.length > 1 && t.length < 90);

// Gruppera: CTA-mönster
const ctaMönster = /(börja|kom igång|gratis|prova|utforska|se kurser|ansök|starta|logg|skapa|prenumer|gå med|lär|utbild)/i;
const cta = [...new Set(allt.filter((t) => ctaMönster.test(t)))];
console.log('== CTA:er (unika) ==');
for (const c of cta) console.log(' •', c);

// Social proof — sök i heltext
const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
console.log('\n== SOCIAL PROOF-fraser ==');
for (const fras of [
  '333 kurser', '333', '94 blogg', 'tre språk', '100 %', 'gratis', 'AKM2',
  'medlemmar', 'utbildade', 'betyg', 'recensioner', 'år av', 'kurser i',
]) {
  const n = (text.match(new RegExp(fras.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
  if (n) console.log(` "${fras}": ${n} träff(ar)`);
}

// Rubriker (h1-h3) — budskap + ton
console.log('\n== RUBRIKER ==');
const rub = [...html.matchAll(/<h([1-3])[^>]*>([\s\S]{2,200}?)<\/h\1>/g)].map((m) =>
  m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
);
for (const r of rub.slice(0, 10)) console.log(' •', r);
