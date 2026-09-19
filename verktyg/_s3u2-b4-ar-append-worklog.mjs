// s3-u2: appenda AR4-worklog-raden (node = den pålitliga kanalen enligt skal-kvoten)
import { appendFileSync, readFileSync } from 'node:fs';
const rad = readFileSync('/home/ak1a/AK1/verktyg/_s3u2-b4-ar-worklog.txt', 'utf8');
if (!rad.endsWith('\n')) throw new Error('worklog-raden saknar avslutande radbrytning');
appendFileSync('/home/ak1a/AK1/worklog.md', rad);
const sist = readFileSync('/home/ak1a/AK1/worklog.md', 'utf8').slice(-120);
console.log('OK — worklog slut:', JSON.stringify(sist.slice(-60)));
