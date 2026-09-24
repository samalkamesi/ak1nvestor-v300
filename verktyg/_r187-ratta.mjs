// Rond 187 rättning — commit + push via node-kanalen
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
writeFileSync('/tmp/r187-ratta.txt', 'studio: [organ:Φ] rond 187 rättning — dubbelradden i worklog borttagen (första körningens append överlevde skriptfelet); engångsverktyg committat', 'utf8');
const out = [];
out.push(execSync(`git -C ${ROT} add worklog.md verktyg/_r187-dublett.mjs verktyg/_r187-ratta.mjs`, { encoding: 'utf8' }) || 'staged');
const c = execSync(`git -C ${ROT} commit -F /tmp/r187-ratta.txt`, { encoding: 'utf8' });
const hash = (c.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd';
out.push(`commit ${hash}`);
const p = execSync(`git -C ${ROT} push prod develop 2>&1`, { encoding: 'utf8' });
out.push('push: ' + p.trim().split('\n').pop());
console.log(out.join('\n'));
