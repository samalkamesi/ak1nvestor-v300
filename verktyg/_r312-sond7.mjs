// r312-sond7: kontext för /superanalys + /konfluens i startsidans HTML
import { execSync } from 'node:child_process';
const html = execSync('curl -s http://localhost:3000/', { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
for (const ruta of ['/superanalys', '/konfluens', '/kalkylator']) {
  let ix = -1;
  let n = 0;
  while ((ix = html.indexOf(`href="${ruta}"`, ix + 1)) >= 0 && n < 4) {
    n++;
    const snitt = html.slice(Math.max(0, ix - 160), ix + 120).replace(/\s+/g, ' ');
    console.log(`--- ${ruta} #${n} ---`);
    console.log(snitt.slice(-260));
  }
  if (!n) console.log(`--- ${ruta}: saknas`);
}
