// v206 (r312): mekanisk infogning av prefetch={false} på sidspecifika tunga
// Link-platser. Validerar innehåll (ej radnummer), räknar träffar, redovisar.
import fs from 'node:fs';

// [fil, href, förväntatAntal]
const PLATSER = [
  ['src/app/(ar)/ar/fas3/page.tsx', '/superanalys', 1],
  ['src/app/(ar)/ar/prenumeration/page.tsx', '/vagfundament', 1],
  ['src/app/(ar)/ar/prenumeration/page.tsx', '/konfluens', 1],
  ['src/app/(en)/en/fas3/page.tsx', '/superanalys', 1],
  ['src/app/(en)/en/prenumeration/page.tsx', '/vagfundament', 1],
  ['src/app/(en)/en/prenumeration/page.tsx', '/konfluens', 1],
  ['src/app/(huvud)/analyser/[ticker]/[variabel]/page.tsx', '/kalkylator', 2],
  ['src/app/(huvud)/data/nyckeltalsguide/page.tsx', '/portfolj-forskning', 1],
  ['src/app/(huvud)/fas3/page.tsx', '/superanalys', 1],
  ['src/app/(huvud)/forskningsbiblioteket/[ticker]/page.tsx', '/konfluens', 1],
  ['src/app/(huvud)/forskningsbiblioteket/[ticker]/page.tsx', '/kalkylator', 2],
  ['src/app/(huvud)/forskningsbiblioteket/[ticker]/page.tsx', '/vagfundament', 1],
  ['src/app/(huvud)/prenumeration/page.tsx', '/vagfundament', 1],
  ['src/app/(huvud)/prenumeration/page.tsx', '/konfluens', 1],
  ['src/app/(huvud)/pro/admin/page.tsx', '/pro', 1],
  ['src/app/(huvud)/pro/analys/page.tsx', '/pro', 1],
  ['src/app/(huvud)/pro/layout.tsx', '/pro', 1],
  ['src/components/ak1a/akm2-dashboard.tsx', '/forskningsbiblioteket', 1],
  ['src/components/ak1a/aktie-nyheter.tsx', '/vagfundament', 1],
  ['src/components/ak1a/nyhets-central.tsx', '/vagfundament', 1],
  ['src/components/ak1a/nyhets-central.tsx', '/konfluens', 1],
  ['src/components/ak1a/pro/rapportverkstan.tsx', '/pro/klienter', 1],
  ['src/components/ak1a/toppvaxel.tsx', '/pro', 1],
];

let totalt = 0;
let fel = 0;
for (const [fil, href, vantat] of PLATSER) {
  const txt = fs.readFileSync(fil, 'utf8');
  // <Link följt av href="..." — infoga prefetch={false} precis efter href
  const monster = new RegExp(`(<Link\\s+href="${href.replace(/\//g, '\\/')}")([\\s/>])`, 'g');
  const traff = [...txt.matchAll(monster)];
  if (traff.length !== vantat) {
    console.log(`NEKAD ${fil} ${href}: ${traff.length} träffar (väntat ${vantat}) — fil ORÖRD`);
    fel++;
    continue;
  }
  if (traff.some((t) => txt.slice(t.index, t.index + 300).includes('prefetch='))) {
    console.log(`HOPPAR ${fil} ${href}: redan prefetch — orörd`);
    continue;
  }
  const ny = txt.replace(monster, '$1 prefetch={false}$2');
  fs.writeFileSync(fil, ny);
  totalt += traff.length;
  console.log(`KURERAD ${fil} ${href} ×${traff.length}`);
}
console.log(`\nTOTALT infogade: ${totalt} · nekade: ${fel}`);
process.exit(fel ? 1 : 0);
