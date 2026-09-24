// Rond 153 — vakt-sidsond: sitemap + journal för /rapportakademin
import fs from 'node:fs';
const u = {};
try {
  const sm = await (await fetch('http://localhost:3000/sitemap.xml')).text();
  u.sitemap = { rapportakademin: sm.includes('rapportakademin'), langd: sm.length };
} catch (e) { u.sitemap = { fel: String(e).slice(0, 120) }; }
try {
  const fil = '/home/ak1a/AK1/data/vakten/granssnitt-journal.json';
  const j = fs.readFileSync(fil, 'utf8');
  u.journal = { finns: true, rapportakademin: j.includes('rapportakademin'), strl: j.length };
  if (j.includes('rapportakademin')) {
    const jobj = JSON.parse(j);
    for (const [k, v] of Object.entries(jobj)) {
      if (String(k).includes('rapportakademin') || JSON.stringify(v).includes('rapportakademin')) {
        u.journalPost = { nyckel: k, varde: v };
      }
    }
  }
} catch (e) { u.journal = { fel: String(e).slice(0, 120) }; }
console.log(JSON.stringify(u, null, 1));
fs.writeFileSync('/home/ak1a/agent/ak1/data/vakten/r153-vaktsond.json', JSON.stringify(u, null, 1));
