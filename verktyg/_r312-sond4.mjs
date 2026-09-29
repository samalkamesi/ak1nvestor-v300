// r312-sond4: vilka prefetch-hinter serveras i prod-HTML på tunga + lätta sidor?
import { execSync } from 'node:child_process';

const bas = 'http://localhost:3000';
const sidor = ['/', '/kurser', '/blogg', '/superanalys', '/kalkylator', '/konfluens', '/dataset'];
for (const s of sidor) {
  try {
    const html = execSync(`curl -s ${bas}${s}`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const hints = [...html.matchAll(/<link[^>]*rel="prefetch"[^>]*>/g)].map((m) => m[0]);
    const tunga = hints.filter((h) => /superanalys|konfluens|kalkylator|monte|kelly|41n3ihu/i.test(h));
    const hrefs = hints.map((h) => (h.match(/href="([^"]+)"/) || [])[1]).filter(Boolean);
    console.log(`\n=== ${s} — ${hints.length} prefetch-hinter ===`);
    for (const h of hrefs) console.log('   ', h.split('/').pop());
    // även script-taggar (sidans egna buntar) som bär motor-namn
    const skript = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1].split('/').pop());
    console.log('   script-src:', skript.join(' '));
  } catch (e) {
    console.log(`\n=== ${s} FEL: ${e.message.slice(0, 100)}`);
  }
}
