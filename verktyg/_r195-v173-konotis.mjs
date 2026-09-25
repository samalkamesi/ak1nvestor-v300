#!/usr/bin/env node
// _r195-v173-konotis.mjs — senaste protokollen + körnotiser (nästa lediga kandidater)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

// 1. V209-protokoll + senaste s2-protokoll
ut.push('=== data/forskning: V209 + senaste OMG/UTOKNING-protokoll ===');
const proto = fs.readdirSync(`${ROT}/data/forskning`).filter((f) => /V209|UTOKNING|UTVIDG/i.test(f)).sort();
ut.push(proto.join('\n'));

// 2. Könotiser i worklog (senaste "lediga"/"nästa" kandidatnotiser)
ut.push('\n=== worklog: senaste universum-expansionsrader (grep "universum" + "ledig", sista 40 träffraderna) ===');
try {
  const wl = fs.readFileSync(`${ROT}/worklog.md`, 'utf8').split('\n');
  const träff = wl.map((l, i) => ({ l, i })).filter((x) => /ledig|notis|nästa (bolag|kandidat|objekt)/i.test(x.l) && /univers|bolag|kandidat|V209|omg2[0-9]|omg3[0-9]/i.test(x.l));
  ut.push(`(${träff.length} träffar — sista 15)`);
  for (const t of träff.slice(-15)) ut.push(`rad ${t.i + 1}: ${t.l.slice(0, 220)}`);
} catch (e) { ut.push('fel: ' + e.message); }

// 3. Universumets aktuella läge per land (Japan-bristen?)
const u = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
ut.push(`\n=== universum: ${u.length} bolag — Japan-poster ===`);
ut.push(u.filter((b) => b.land === 'Japan').map((b) => `${b.ticker} ${b.namn} (${b.bransch})`).join('\n'));
ut.push('\nhämta-datum: ' + u.reduce((h, b) => (b.hamtat > (h ?? '') ? b.hamtat : h), ''));

// 4. V209-protokollets innehåll (om det finns — läs det senaste V209-dokumentet)
const v209 = proto.filter((f) => /V209/.test(f)).pop();
if (v209) {
  ut.push(`\n=== ${v209} (sista 3500 tecknen — leveranser + notiser) ===`);
  ut.push(fs.readFileSync(`${ROT}/data/forskning/${v209}`, 'utf8').slice(-3500));
}

fs.writeFileSync('/tmp/r195-konotis.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r195-konotis.txt');
