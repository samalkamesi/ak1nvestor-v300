// _v221-prodstatus2.mjs — varför listar prod-sitemap kurser som 404:ar?
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const PROD = '/home/ak1a/AK1';
const MIN = '/home/ak1a/agent/ak1';
const kurser = ['am-10-insynslistan', 'bk-10-verkligt-varde-hierarkin', 'kt-12-vd-bytet', 'mt-10-erfarenhetskurvan', 'st-09-konkursordningen', 'vm-12-reverserad-dcf'];

console.log('== data/kurser-tillagg i PROD ==');
const tillaggProd = `${PROD}/data/kurser-tillagg`;
console.log('katalog finns:', fs.existsSync(tillaggProd));
if (fs.existsSync(tillaggProd)) {
  const filer = fs.readdirSync(tillaggProd);
  console.log('antal filer:', filer.length);
  for (const k of kurser) console.log(`${k}.json:`, filer.includes(`${k}.json`) ? 'FINNS' : 'SAKNAS');
}

console.log('\n== register i PROD src ==');
for (const f of ['src/lib/ai-mentor-register.ts', 'src/lib/larvag-karta.ts']) {
  const txt = fs.existsSync(`${PROD}/${f}`) ? fs.readFileSync(`${PROD}/${f}`, 'utf8') : '';
  console.log(`${f}: am-10-insynslistan ${txt.includes('am-10-insynslistan') ? 'FINNS' : 'SAKNAS'}`);
}

console.log('\n== git-läge PROD ==');
try {
  console.log('HEAD:', execFileSync('git', ['log', '--oneline', '-3'], { encoding: 'utf8', cwd: PROD, timeout: 15000 }).trim());
  const st = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8', cwd: PROD, timeout: 15000 }).trim();
  console.log('smutsig yta (första 15 rader):');
  console.log(st.split('\n').slice(0, 15).join('\n') || '(ren)');
} catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== sitemap-källa i MIN yta ==');
const kand = ['src/app/sitemap.ts', 'src/app/sitemap.xml/route.ts', 'src/app/(huvud)/sitemap.ts'];
for (const k of kand) console.log(`${k}:`, fs.existsSync(`${MIN}/${k}`) ? 'FINNS' : '-');

console.log('\n== sitemap innehåller de sex? (live hämtning) ==');
try {
  const xml = execFileSync('curl', ['-s', '--max-time', '20', 'http://localhost:3000/sitemap.xml'], { encoding: 'utf8', timeout: 25000 });
  for (const k of kurser) console.log(`${k}:`, xml.includes(`kurser/${k}`) ? 'LISTAD' : 'ej listad');
  const antal = (xml.match(/kurser\//g) || []).length;
  console.log('totalt kurser/ i sitemap:', antal);
} catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== .next byggdatum PROD ==');
try {
  const st = fs.statSync(`${PROD}/.next/BUILD_ID`);
  console.log('BUILD_ID mtime:', st.mtime.toISOString());
  console.log('BUILD_ID:', fs.readFileSync(`${PROD}/.next/BUILD_ID`, 'utf8').trim());
} catch (e) { console.log('FEL: ' + e.message); }
