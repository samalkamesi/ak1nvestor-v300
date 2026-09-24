#!/usr/bin/env node
// Rond 187 — leverans av v171:s första SEO-objekt (Ö26 byggaktier-en) + bokföring
import { execSync } from 'node:child_process';
import { appendFileSync, writeFileSync, readFileSync } from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const kvitto = [];

function steg(namn, fn) {
  try {
    const r = fn();
    kvitto.push(`OK ${namn}${r ? ' — ' + r : ''}`);
  } catch (e) {
    kvitto.push(`FEL ${namn} — ${e.message}`);
    console.log(kvitto.join('\n'));
    process.exit(1);
  }
}

// 1. Worklog-rond 187
const rond = `
## ROND 187 [organ:Φ] — v171 SEO VÅGEN ÖPPNAD: Ö26 byggaktier-en LEVERERAD med KVD GRÖN 31/31 — 2026-09-24 ~22:3x lokal
PIPELINE-KO v171 (SEO-rotation spår 3) verkställt: disk-inventeringen visade att dokumentet låg efter diskens verklighet (B24–B27-en och B26-ar redan levererade av syskon) — de VERKLIGA luckorna var exakt fyra: bygg-en (B27), medtech-ar (AR24), vård-ar (AR25), bygg-ar (AR27). Första objekt = B27 byggaktier-en enligt spårets konvention (-en i B-ordning först). LEVERANS: data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-en.json (engelsk spegling av B27, klaimfil data/vakten/s3-b27-en-bygg-ansprak-2026-09-24.md skriven FÖRE arbetet, disk-först) — samma talbas och räkneexempel som originalet (orderstockstäckning 257,9/176,7 = 1,46 år, fastpristrappan 10,0/2,8/−0,8/6,4, IFRS 15-broexemplet 480/36/7,5 %, Skanska-serien +8,3 % intäkt mot −30,9 % resultat, TTM-bilden 2026-09-15). KVD GRÖN 0 FEL i 31 maskinella kontroller (verktyg/_v171-b27-en-kvd.mjs, mall _s3u2-energi-en-kvd): varumärkesgrind 26 regexer × 3 ytor 0/0 · rådverb SV+EN 0 · sökord "construction stocks" title+ingress+1 H2 · title 60/60 · OG 146/155 · ord 1383/1400 · korslänkar 12/12 MULTISET-identiska · externa 3/3 · TAL-PARITET 99/99 språkmedveten multiset (körning 1 fångade Q-kvartalsartefakten "42025" — SYMMETRISKT kurerad i skriptet med Q-normalisering, guidetexten orörd; AR8/Ö14-klassen) · aritmetik 17/17 motorräknad · H2-paritet 7=7 · svenska läckor 0 · disclaimer engelsk form. DOKUMENTATION: Ö26-rad + ikapningsnotis i SEO-GUIDER-2026-09.md (dokumentet ikappat med diskens verklighet: -en-omgången KOMPLETT för samtliga 25 original) + klaimkvitto. Ren dataleverans — src orörd, inget bygge. NÄSTA i spåret: AR24 medtech-ar (därefter AR25 vård-ar, AR27 bygg-ar), därefter v172 kvartalsrapporter (Q3 slutar 09-30) enligt PIPELINE-KO.
`;
steg('worklog append', () => appendFileSync(`${ROT}/worklog.md`, rond, 'utf8') || 'rond 187 bokförd');

// 2. Commit-meddelande
const msg = `studio: [organ:Φ] v171 Ö26 byggaktier-en LEVERERAD — KVD GRÖN 31/31 (tal-paritet 99/99, aritmetik 17/17, korslänkar 12/12 MULTISET-identiska med B27). Engelsk spegling av B27 i -en-omgångens B-ordning; disk-inventeringen ikappad i SEO-GUIDER (Ö26-rad + notis: -en KOMPLETT för 25 original; verkliga kvarvarande luckor = AR24 medtech-ar, AR25 vård-ar, AR27 bygg-ar). KVD-skript _v171-b27-en-kvd.mjs committat som bevis (Q-kvartalsnormaliseringen dokumenterad). Klaimfil FÖRE arbetet, disk-först. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync('/tmp/r187-msg.txt', msg, 'utf8');
kvitto.push('OK commitmsg skriven');

// 3. git add + commit + push
steg('git add', () => execSync(`git -C ${ROT} add data/forskning/SEO-GUIDER-2026-09.md data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-en.json verktyg/_v171-b27-en-kvd.mjs verktyg/_r187-levera.mjs`, { encoding: 'utf8' }) || 'staged');
const commit = execSync(`git -C ${ROT} commit -F /tmp/r187-msg.txt`, { encoding: 'utf8' });
const hash = (commit.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd';
kvitto.push(`OK commit — ${hash} genom tsc-grinden`);
const push = execSync(`git -C ${ROT} push prod develop 2>&1`, { encoding: 'utf8' });
kvitto.push(`OK push — ${push.trim().split('\n').pop()}`);

// 4. Beslutsminne med verklig hash
const beslut = { ts: new Date().toISOString(), rond: 187, beslut: 'v171 SEO öppnad: Ö26 byggaktier-en levererad KVD GRÖN 31/31; -en-omgången komplett för 25 original; nästa AR24/AR25/AR27 i -ar-spåret', landat: hash };
steg('beslutsminne', () => appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify(beslut) + '\n', 'utf8') || JSON.stringify(beslut));

// 5. Slutverifiering: prod-trädet bär filen
try {
  execSync(`git -C /home/ak1a/AK1 cat-file -e HEAD:data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-en.json`);
  kvitto.push('OK prod-trädet bär Ö26-filen i HEAD');
} catch { kvitto.push('VARNING prod-trädet saknar filen i HEAD (synken kan ligga efter)'); }

writeFileSync('/tmp/r187-kvitto.txt', kvitto.join('\n') + '\n', 'utf8');
console.log(kvitto.join('\n'));
