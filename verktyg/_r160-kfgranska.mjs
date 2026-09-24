// Rond 160: granska kf2 (startsida CTA/social proof) + kf3 (Fas 2, 20 indikatorer) LIVE.
const bas = 'https://lab.ak1nvestor.com';

console.log('== STARTSIDAN (kf2) ==');
const startsida = await (await fetch(bas + '/')).text();
console.log('html-längd:', startsida.length);
// CTA-texter i länkar
const lankar = [...startsida.matchAll(/<a[^>]*>([^<]{2,60})<\/a>/g)].map((m) => m[1].trim());
const ctaOrd = /(börja|kom igång|gratis|prova|utforska|se kurserna|ansök|läs mer|starta)/i;
const cta = [...new Set(lankar.filter((t) => ctaOrd.test(t)))];
console.log('CTA-kandidater (unika):', cta.slice(0, 12));
// social proof-element
for (const ord of ['333', '94', 'medlemmar', 'kurser', 'utbildade', 'betyg', 'recension', 'redan']) {
  const n = (startsida.match(new RegExp(ord, 'gi')) || []).length;
  if (n) console.log(`social-proof-träff "${ord}":`, n);
}

console.log('\n== FAS 2-SIDAN (kf3) ==');
const fas2 = await (await fetch(bas + '/fas2')).text();
console.log('html-längd:', fas2.length);
const vnum = new Set([...fas2.matchAll(/\bV(\d{2})\b/g)].map((m) => 'V' + m[1]));
console.log('unik V##-märkning:', vnum.size, '| lista:', [...vnum].sort().join(', ').slice(0, 200));
console.log('"kundgrupper" live (kommer med 3fa731d8):', fas2.includes('kundgrupper'));
console.log('"kunder," fortfarande (gaml bygget):', fas2.includes('Spridningen över kunder'));
// indikatornamn stickprov
for (const namn of ['Försäljningstillväxt', 'ROE', 'Skuldsättningsgrad', 'Intäktsdiversifiering']) {
  console.log(`indikator "${namn}":`, fas2.includes(namn));
}
