// Rond 174: generera manifest-v166-fas3-djupintegrering.json (PARKERAT — släpps efter push-kvitto)
import fs from 'node:fs';
import path from 'node:path';

const KAT = '/home/ak1a/agent/ak1/data/forskning/KURS-FAS3';
const BM = '/home/ak1a/agent/ak1/data/bokmaster';
const v164 = JSON.parse(fs.readFileSync(`${KAT}/manifest-v164-fas3-djup.json`, 'utf8'));

const uppgifter = v164.uppgifter.map(u => {
  const slug = u.prompt.match(/slug ([a-z0-9-]+)/)[1];
  const underlag = u.prompt.match(/underlag-f\d+-([a-z0-9-]+)\.md/)[0];
  const id = u.id.replace(/^f/, 'd'); // d01..d24
  return {
    id,
    titel: `${u.titel.replace(/^F\d+ /, '')} — djupkapitel`,
    prompt: `Läs data/forskning/KURS-FAS3/DESIGN-v166-djupintegrering.md (KONTRAKTET — följ exakt) och data/forskning/KURS-FAS3/${underlag} (granskat underlag). Öppna data/bokmaster/${slug}.json och APPENDA exakt ETT nytt avslutande kapitel "Från boken till egen analys" (num = sista+1) enligt designens sektionsmappning: intro + text (kärnan), text (praktisk läsning), utmaning (övningen), text ELLER tabell (räkneexemplet — underlagets tal ÖVERFÖRS ORDAGRANT med käll-/övningsdeklaration, inga nya tal), text (fallgropar), insikt (ekosystemkopplingen). Quiz exakt 3 frågor {q, alternativ[4], ratt, tips} — påståenden om metoden, ALDRIG handlingsråd. minutes 11-14. Uppdatera append-only: chapters, chapters_list ({num,title,minutes}), chapterCount=len, totalMinutes=Σ. Befintliga kapitel/fält RÖRS EJ. JURIDIKGRIND: 2007:528 — utbildning aldrig råd, inga avkastningslöften, varumärkesgrindens fraser förbjudna. KVD: JSON giltig + Σ-konsistens + quiz=3 + varumärke 0 träffar; tsc orörd (data-väg, INGET bygge). Commit 'studio: auto v166-${id} ${slug}' med explicit pathspec + LEVERANS:-rad.`,
  };
});

const manifest = {
  id: 'v166-fas3-djupintegrering',
  titel: 'Fas 3-djupintegrering — 24 djupkapitel ur v164-underlagen',
  skapad: Date.now(),
  parked: true,
  notering: 'SLÄPPREGEL: kopieras till data/vakten/agentfabrik/ko/ FÖRST när push-kedjan (mimosa-härden + v164-stängningen) landat i prod MED prod-vakt 0 fynd GRÖN (kvitto i /tmp/r174-dirigent2.log + worklog). Sekvensregeln rond 167: push FÖRE fabriksmanifest.',
  uppgifter,
};
fs.writeFileSync(`${KAT}/manifest-v166-fas3-djupintegrering.json`, JSON.stringify(manifest, null, 2));
console.log(`manifest skrivet: ${uppgifter.length} uppgifter (parked)`);
console.log('exempel d01:', uppgifter[0].titel);
