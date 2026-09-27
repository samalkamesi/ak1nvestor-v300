import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/cache/bolags-publicerade.json', 'utf8'));
const arr = Array.isArray(j) ? j : (j.slugs || Object.values(j)[0]);
console.log('antal slugs:', arr.length);
console.log('Indien-relaterade:', arr.filter((s) => /apollo|indus|tcs|infosys|sun-pharma|ongc|itc|hdfc|icici|bharti|reliance|lars|hindustan/i.test(s)).join('\n'));
