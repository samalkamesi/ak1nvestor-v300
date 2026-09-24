// Rond 161: kvalitetsgranska v159-leveranserna (ord per indikator + auditens förslag).
import { readFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';

console.log('== FAS2-DJUP: ord per indikator ==');
for (const fil of ['data/kurser/fas2-djup/indikatorer-01-10.md', 'data/kurser/fas2-djup/indikatorer-11-20.md']) {
  const txt = readFileSync(`${ws}/${fil}`, 'utf8');
  console.log(`\n-- ${fil} (${txt.length} tkn totalt) --`);
  const sektioner = txt.split(/\n(?=##?\s)/).filter((s) => /\bV\d{2}\b/.test(s.split('\n')[0] || ''));
  for (const s of sektioner) {
    const rubrik = s.split('\n')[0].replace(/^#+\s*/, '').slice(0, 60);
    const ord = s.split(/\s+/).filter(Boolean).length;
    const hasFacit = /[Ff]acit/.test(s);
    const hasExempel = /[Rr]äkneexempel|låtsas|räkna/.test(s);
    console.log(` ${rubrik.padEnd(62)} ${String(ord).padStart(5)} ord | facit:${hasFacit ? '✓' : '✗'} exempel:${hasExempel ? '✓' : '✗'}`);
  }
  if (!sektioner.length) console.log(' (inga V##-rubriker hittade — kontrollera format)');
}

console.log('\n== BRANDING-AUDIT: struktur + toppförslag ==');
const audit = readFileSync(`${ws}/data/forskning/BRANDING-AUDIT-2026-09.md`, 'utf8');
console.log('längd:', audit.length, 'tkn');
const rubriker = audit.split('\n').filter((r) => /^#{1,3}\s/.test(r));
for (const r of rubriker.slice(0, 15)) console.log(' ', r.slice(0, 90));
// Åtgärdsposter (nummerlista eller tabellrader)
const post = audit.split('\n').filter((r) => /^\d+[.)]\s|^\|\s*\d/.test(r.trim()));
console.log('\nåtgärdsposter (första 12):');
for (const p of post.slice(0, 12)) console.log(' ', p.trim().slice(0, 150));
