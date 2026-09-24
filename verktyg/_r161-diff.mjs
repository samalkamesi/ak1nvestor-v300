// Rond 161: diffa översättningsluckor — original utan -en/-ar i B-ordning.
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = '/home/ak1a/agent/ak1/data/blogg-utkast';
const filer = readdirSync(dir).filter((f) => f.endsWith('.json'));
const original = filer.filter((f) => !/-en\.json$|-ar\.json$/.test(f)).sort();

console.log('original utan komplett en/ar-par:');
for (const f of original) {
  const bas = f.replace(/\.json$/, '');
  const en = existsSync(join(dir, bas + '-en.json'));
  const ar = existsSync(join(dir, bas + '-ar.json'));
  if (!en || !ar) console.log(` ${f.padEnd(55)} en:${en ? '✓' : 'SAKNAS'}  ar:${ar ? '✓' : 'SAKNAS'}`);
}
console.log('\ntotalt original:', original.length, '| översättningar:', filer.length - original.length);
