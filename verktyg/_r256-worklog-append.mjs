import fs from 'node:fs';
const txt = fs.readFileSync('verktyg/_r256-worklog.txt', 'utf8');
fs.appendFileSync('worklog.md', txt);
console.log('worklog.md: appenderad, ny längd =', fs.readFileSync('worklog.md', 'utf8').split('\n').length, 'rader');
console.log('kontroll sista raden:', fs.readFileSync('worklog.md', 'utf8').trimEnd().split('\n').pop().slice(0, 80));
