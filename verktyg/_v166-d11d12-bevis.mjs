// Bevisappend-only i originalmening: d11:s kapitel 1–15 + chapters_list 1–15
// mot d11-committens FÖRÄLDER (2fa60ee4~1) — den fråga d11-KVD ställde vid leveransen.
// Dessutom d12:s motsvarighet (hittar d12-commit först). Samma substans som
// d10/d13-KVD:ns every-index-mönster men mot föräldern i stället för HEAD.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const git = (rev, path) => execFileSync('git', ['show', `${rev}:${path}`], { encoding: 'utf8' });

function bevisa(namn, sokvag, appendCommit) {
  const fore = JSON.parse(git(`${appendCommit}~1`, sokvag));
  const efter = JSON.parse(git(appendCommit, sokvag));
  const nu = JSON.parse(fs.readFileSync(sokvag, 'utf8'));
  const nFore = fore.chapters.length;
  const nEfter = efter.chapters.length;
  // (1) appenden själva: före-kapitel orörda av appenden i efter-trädet
  const appendRen = fore.chapters.every((g, i) => JSON.stringify(g) === JSON.stringify(efter.chapters[i]));
  const listaRen = JSON.stringify(fore.chapters_list) === JSON.stringify(efter.chapters_list.slice(0, nFore));
  // (2) bestånd: efter-trädets alla kapitel + lista identiska med dagens arbetsyta
  const bestand = efter.chapters.every((g, i) => JSON.stringify(g) === JSON.stringify(nu.chapters[i])) &&
    JSON.stringify(efter.chapters_list) === JSON.stringify(nu.chapters_list);
  console.log(`${namn}: ${nFore}+1=${nEfter} kapitel · append-ren=${appendRen ? 'GRÖN' : 'RÖD'} · chapters_list-append-ren=${listaRen ? 'GRÖN' : 'RÖD'} · bestånd-mot-idag=${bestand ? 'GRÖN' : 'RÖD'}`);
  return appendRen && listaRen && bestand;
}

const d11 = bevisa('d11 martin-pring', 'data/bokmaster/martin-pring-on-market-momentum.json', '2fa60ee4');

// d12: hitta commit
const d12log = execFileSync('git', ['log', '--oneline', '-2', '--', 'data/bokmaster/the-master-swing-trader.json'], { encoding: 'utf8' });
const d12hash = d12log.split('\n')[0].slice(0, 8);
const d12 = bevisa(`d12 master-swing (${d12hash})`, 'data/bokmaster/the-master-swing-trader.json', d12hash);

console.log(d11 && d12 ? '\nAPPEND-ONLY BEVISAD: båda' : '\nMINST ETT RÖTT');
process.exit(d11 && d12 ? 0 : 1);
