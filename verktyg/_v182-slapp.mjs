// släpp v167-manifestet till prod-ko (cp hängde i studioskalet — node är kurkanalen)
import { copyFileSync, existsSync, statSync } from 'node:fs';
const src = '/home/ak1a/agent/ak1/data/vakten/agentfabrik/ko/v167-ovningskapitel-1790264500820.json';
const dst = '/home/ak1a/AK1/data/vakten/agentfabrik/ko/v167-ovningskapitel-1790264500820.json';
if (!existsSync(src)) { console.error('KÄLLA SAKNAS'); process.exit(1); }
copyFileSync(src, dst);
const s = statSync(dst);
console.log('SLÄPPT TILL PROD-KO:', dst, s.size, 'byte');
// verifiera parse i prod-trädet också
const m = JSON.parse(await import('node:fs').then(fs => fs.readFileSync(dst, 'utf8')));
console.log('parse OK · uppgifter:', m.uppgifter.length, '· id:', m.id);
