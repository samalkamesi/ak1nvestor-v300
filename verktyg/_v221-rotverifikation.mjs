// _v221-rotverifikation.mjs — bevisa: deep-courses.json har de sex, .next saknar deras HTML
import fs from 'node:fs';

const PROD = '/home/ak1a/AK1';
const kurser = ['am-10-insynslistan', 'bk-10-verkligt-varde-hierarkin', 'kt-12-vd-bytet', 'mt-10-erfarenhetskurvan', 'st-09-konkursordningen', 'vm-12-reverserad-dcf'];

const djup = JSON.parse(fs.readFileSync(`${PROD}/public/deep-courses.json`, 'utf8'));
const slugs = Object.keys(djup);
console.log('deep-courses.json kurser totalt:', slugs.length);
for (const k of kurser) console.log(`  ${k}:`, slugs.includes(k) ? 'FINNS' : 'SAKNAS');
const st = fs.statSync(`${PROD}/public/deep-courses.json`);
console.log('deep-courses.json mtime:', st.mtime.toISOString());

console.log('\n== .next statiska HTML för kurser ==');
const htmlDir = `${PROD}/.next/server/app/kurser`;
const finns = fs.existsSync(htmlDir) ? fs.readdirSync(htmlDir).filter(f => f.endsWith('.html')) : [];
console.log('antal kurs-HTML i .next:', finns.length);
for (const k of kurser) console.log(`  ${k}.html:`, finns.includes(`${k}.html`) ? 'FINNS' : 'SAKNAS');
const jamfor = ['winning-the-losers-game.html', 'zero-to-one.html'];
for (const j of jamfor) console.log(`  (jämförelse) ${j}:`, finns.includes(j) ? 'FINNS' : 'SAKNAS');

console.log('\n== sitemap dynamisk? ==');
const sm = fs.readFileSync(`${PROD}/src/app/sitemap.ts`, 'utf8');
console.log('använder new Date():', sm.includes('new Date()'));

console.log('\n== build-ID-mtime vs deep-courses mtime ==');
const bid = fs.statSync(`${PROD}/.next/BUILD_ID`);
console.log('BUILD_ID:', bid.mtime.toISOString(), '| deep-courses:', st.mtime.toISOString());
console.log('deep-courses YNGRE än bygget =', st.mtime > bid.mtime ? 'JA → rot bevisad (innehåll landade efter senaste bygget)' : 'NEJ');
