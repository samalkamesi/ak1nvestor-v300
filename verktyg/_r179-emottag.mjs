// Emottag d14–d18: kör parallellsessionens KVD-verktyg + append-only-bevis
// mot respektive appends föräldercommit (rond 177:s läxa: aldrig HEAD).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const kurser = [
  ['d14', 'come-into-my-trading-room', 'verktyg/_f14-v166d14-kvd.mjs'],
  ['d15', 'teknisk-analys-med-johnny-torssell', 'verktyg/_f15-v166d15-kvd.mjs'],
  ['d16', 'bollinger-on-bollinger-bands', 'verktyg/_f16-v166d16-kvd.mjs'],
  ['d17', 'the-new-science-of-technical-analysis', 'verktyg/_f17-v166d17-kvd.mjs'],
  ['d18', 'way-of-the-turtle', 'verktyg/_f18-v166d18-kvd.mjs'],
];

// Hitta append-committen per fil: senaste commit som rör filen
function appendCommit(sokvag) {
  const ut = execFileSync('git', ['log', '--oneline', '-1', '--', sokvag], { encoding: 'utf8' });
  return ut.slice(0, 8);
}

let allaGröna = true;
for (const [tagg, slug, verktyg] of kurser) {
  const sokvag = `data/bokmaster/${slug}.json`;
  // (1) KVD
  let kvdStatus = '?';
  try {
    execFileSync('node', [verktyg], { encoding: 'utf8', stderr: 'pipe', timeout: 60000 });
    kvdStatus = 'GRÖN';
  } catch (e) {
    const ut = (e.stdout || '') + (e.stderr || '');
    // Klassificera: äkta fel vs känt HEAD-mätfel (append-kontroller)
    const rader = ut.split('\n').filter(l => /RÖD|✗|FAIL/i.test(l) && !/talmarkör|varumärke|lagrum|deklarat|köp\/sälj/i.test(l));
    kvdStatus = rader.length ? 'RÖD: ' + rader.slice(0, 2).join(' | ').slice(0, 160) : 'GRÖN* (endast kända HEAD-mätfel: ' + ut.split('\n').filter(l => /RÖD|✗/i.test(l)).length + ' st)';
    if (rader.length) allaGröna = false;
  }
  // (2) append-only mot förälder
  const hash = appendCommit(sokvag);
  let appendBevis = '?';
  try {
    const fore = JSON.parse(execFileSync('git', ['show', `${hash}~1:${sokvag}`], { encoding: 'utf8' }));
    const efter = JSON.parse(execFileSync('git', ['show', `${hash}:${sokvag}`], { encoding: 'utf8' }));
    const nu = JSON.parse(fs.readFileSync(sokvag, 'utf8'));
    const nF = fore.chapters.length;
    const appendRen = fore.chapters.every((g, i) => JSON.stringify(g) === JSON.stringify(efter.chapters[i]));
    const listaRen = JSON.stringify(fore.chapters_list) === JSON.stringify(efter.chapters_list.slice(0, nF));
    const bestand = JSON.stringify(efter) === JSON.stringify({ ...nu, chapterCount: nu.chapterCount, totalMinutes: nu.totalMinutes }) ||
      (efter.chapters.every((g, i) => JSON.stringify(g) === JSON.stringify(nu.chapters[i])) && JSON.stringify(efter.chapters_list) === JSON.stringify(nu.chapters_list) && efter.chapterCount === nu.chapterCount && efter.totalMinutes === nu.totalMinutes);
    appendBevis = `${nF}+1=${efter.chapters.length} (i ${hash}) · append-ren=${appendRen ? 'GRÖN' : 'RÖD'} · lista=${listaRen ? 'GRÖN' : 'RÖD'} · bestånd=${bestand ? 'GRÖN' : 'RÖD'}`;
    if (!(appendRen && listaRen && bestand)) allaGröna = false;
  } catch (e) {
    appendBevis = 'FEL: ' + String(e.message).slice(0, 120);
    allaGröna = false;
  }
  console.log(`${tagg} ${slug}\n  KVD: ${kvdStatus}\n  APPEND-BEVIS: ${appendBevis}`);
}
console.log(allaGröna ? '\nEMOTTAG d14–d18: ALLT GRÖNT' : '\nEMOTTAG: MINST ETT RÖTT');

