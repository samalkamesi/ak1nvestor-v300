// _v223-vkurs.mjs — räkna unika v-kursslugs i registret.
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('/home/ak1a/agent/ak1/public/deep-courses.json', 'utf8'));
const lista = Array.isArray(j) ? j : Object.values(j);
const v = lista.filter(k => /^v\d{2}-/.test(k.slug));
console.log(`toppnycklar: ${Object.keys(j).slice(0, 5).join(', ')} (array: ${Array.isArray(j)})`);
console.log(`v-kurser: ${v.length} av ${lista.length} totalt`);
console.log('v-slugs:', v.map(k => k.slug).slice(0, 30).join(', '));
