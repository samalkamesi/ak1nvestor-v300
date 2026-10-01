// Sond v227: eskaleringens prod-lägesfil — bevisar källa 4 i drift
import { readFileSync } from 'node:fs';

const j = JSON.parse(readFileSync('/home/ak1a/AK1/data/vakten/larm-eskalering.json', 'utf8'));
console.log('genererad:', j.genererad);
console.log('källor:', Object.keys(j.kallor).join(', '));
if (j.pulsvakt) {
  console.log('pulsvakt rader:', j.pulsvakt.raderTotalt, '| aktiva episoder:', j.pulsvakt.episoderAktiva.length);
  for (const e of j.pulsvakt.episoderAktiva) {
    console.log(`  AKTIV ${e.nyckel} · ${e.upprepningar} larm · nivå ${e.niva} ${e.etikett} · sedan ${e.forstaTs} · ${e.varaktighetMin} min`);
  }
} else {
  console.log('pulsvakt-källa SAKNAS i lägesfilen');
}
console.log('sammanfattning.pulsvaktRader:', j.sammanfattning.pulsvaktRader, '| pulsvaktEpisoderAktiva:', j.sammanfattning.pulsvaktEpisoderAktiva);
