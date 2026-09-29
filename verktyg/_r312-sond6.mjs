// r312-sond6: kontext kring tunga länkar i /kurser-HTML + /netnet-källor
import { execSync } from 'node:child_process';

const html = execSync('curl -s http://localhost:3000/kurser', { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
for (const ruta of ['/netnet', '/topplista', '/superanalys', '/vagfundament']) {
  const ix = html.indexOf(`href="${ruta}"`);
  if (ix < 0) { console.log(ruta, '(saknas)'); continue; }
  const snitt = html.slice(Math.max(0, ix - 220), ix + 240).replace(/\s+/g, ' ');
  console.log(`\n--- ${ruta} @${ix} ---`);
  console.log(snitt);
}
