// _v222-vanta2.mjs — robust väntan: prod-yta ren ELLER ny prod-HEAD → hämta, merga, pusha.
import { execFileSync } from 'node:child_process';

function ko(kommando, takSek = 30, cwd = '/home/ak1a/agent/ak1') {
  try { return execFileSync('bash', ['-c', kommando], { encoding: 'utf8', timeout: takSek * 1000, cwd }).trim(); }
  catch (e) { return null; }
}
const kort = (h) => (h || '').slice(0, 8);

let prodHead = kort(ko('git log --format=%h -1', 15, '/home/ak1a/AK1'));
console.log('start: prod=' + prodHead + ' · lokal=' + kort(ko('git log --format=%h -1')));

let framme = false;
for (let i = 0; i < 30 && !framme; i++) {
  await new Promise(r => setTimeout(r, 30000));
  const head = kort(ko('git log --format=%h -1', 15, '/home/ak1a/AK1'));
  const statusUt = ko('git status --short | head -4', 15, '/home/ak1a/AK1');
  const ren = statusUt === null || statusUt === '';
  if (head && head !== prodHead) { console.log(`[${(i + 1) * 0.5} min] prod gick framåt: ${prodHead} → ${head}`); prodHead = head; framme = true; }
  else if (ren) { console.log(`[${(i + 1) * 0.5} min] prod-ytan REN`); framme = true; }
  else if (i % 4 === 0) console.log(`[${(i + 1) * 0.5} min] väntar …`);
}

if (!framme) console.log('TAK 15 MIN — prod-ytan fortfarande upptagen; avbryter push (fabriken äger ytan)');

// Hämta prod-läget och avgör: bakom oss → pusha; före oss → merga + pusha
console.log('\n== FETCH ==');
console.log(ko('git fetch prod develop 2>&1 | tail -2', 120));
const prodKort = kort(ko('git rev-parse prod/develop', 15));
const minKort = kort(ko('git rev-parse HEAD', 15));
console.log(`lokal=${minKort} · prod-ref=${prodKort}`);

if (prodKort === minKort) {
  console.log('\n== PUSH (ytan ren, samma ref) ==');
  console.log(ko('git push prod develop 2>&1 | tail -3', 180));
} else if (prodKort !== minKort) {
  // finns prod-refen i vår historik? (fast-forward-bar)
  const arFar = ko(`git merge-base --is-ancestor ${prodKort} HEAD && echo JA`, 20);
  if (arFar === 'JA') {
    console.log('\n== PUSH (fast-forward) ==');
    console.log(ko('git push prod develop 2>&1 | tail -3', 180));
  } else {
    console.log('\n== MERGE KRAVS — prod har egen commit ==');
    console.log(ko('git merge prod/develop --no-edit 2>&1 | tail -5', 120));
    const konf = ko('git status --short | grep -c "^UU"', 15);
    if (konf && konf !== '0') {
      console.log('KONFLIKT (' + konf + ' filer) — lämnar merge öppen för manuell lösning');
    } else {
      console.log(ko('git push prod develop 2>&1 | tail -3', 180));
    }
  }
}
console.log('\nSLUT: prod=' + kort(ko('git log --format=%h -1', 15, '/home/ak1a/AK1')) + ' · lokal=' + kort(ko('git log --format=%h -1', 15)));
