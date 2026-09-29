// r335 markera: om-märk AKTUELLA prod-artefaktens framtids-bloggplatser 404
// (r332-drifttest-mönstret: skriver ENDAST .next-meta i /home/ak1a/AK1 — gitignerad
// artefakt, aldrig git-ytan; logik identisk med verktyg/marke-framtids-404.mjs)
import fs from 'node:fs';
import path from 'node:path';

const AK1 = '/home/ak1a/AK1';
const APP = path.join(AK1, '.next', 'server', 'app');

function dagensDatumSv() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', dateStyle: 'short' }).format(new Date());
}

if (!fs.existsSync(APP)) { console.log('ingen artefakt — avbryt'); process.exit(1); }
const idag = dagensDatumSv();
const dir = path.join(AK1, 'data', 'blogg');

const framtida = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json')) continue;
  try {
    const post = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const d = String(post.publishedAt ?? '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d > idag && typeof post.slug === 'string') framtida.push(post.slug);
  } catch { /* ogiltig json — hoppa */ }
}
console.log(`idag ${idag} · ${framtida.length} framtidsdiskade inlägg i data/blogg`);

let märkta = 0, saknade = 0;
for (const slug of framtida) {
  const meta = path.join(APP, 'blogg', `${slug}.meta`);
  if (!fs.existsSync(meta)) { saknade++; continue; }
  const j = JSON.parse(fs.readFileSync(meta, 'utf8'));
  if (j.status === 404) continue;
  j.status = 404;
  fs.writeFileSync(meta, JSON.stringify(j, null, 2) + '\n');
  märkta++;
  console.log(`${slug}: status 404 märkt`);
}
console.log(`KLAR: ${märkta} märkta · ${saknade} utan statisk plats (on-demand — v211-rest)`);
