// r334: lista .next-roten i AK1 efter manifestfiler
import fs from 'node:fs';
const next = '/home/ak1a/AK1/.next';
console.log(fs.readdirSync(next).join('\n'));
