// Sond v227: translatorn mot PROD:s riktiga pulsvakt-larm.log + episodbygge
import { readFileSync } from 'node:fs';
import { oversattPulsvaktRader, byggEpisoder, kopplaGronTillEpisoder, bedomEpisod } from './larm-eskalering.mjs';

const text = readFileSync('/home/ak1a/AK1/data/vakten/pulsvakt-larm.log', 'utf8');
const oversatt = oversattPulsvaktRader(text);
console.log('raderTotalt:', oversatt.raderTotalt, '| översatta:', oversatt.rader.length, '| senasteRadTs:', oversatt.senasteRadTs);

const episoder = byggEpisoder(oversatt.rader);
kopplaGronTillEpisoder(episoder, oversatt.rader);
console.log('aktiva episoder:', episoder.aktiva.length, '| klara:', episoder.klara.length);
for (const e of episoder.aktiva) {
  const b = bedomEpisod(e, Date.now());
  console.log(`AKTIV: ${e.nyckel} · ${e.upprepningar} larm · nivå ${b.niva} ${b.etikett} · aktiv i ${b.varaktighetMin} min (sedan ${e.forstaTs})`);
}

// Negativkontroll: app-nivåns "aterstall" (06:43) får INTE stänga kant-episoden
const appGrönFinns = oversatt.rader.some((r) => r.medd === 'aterstall');
console.log('app-aterstall översatt (SKA vara false):', appGrönFinns);
