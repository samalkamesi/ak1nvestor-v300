// AK1A — scenariotest-suite för studions flöden (våg 174, gap 13)
// E2E-kontrakt på HTTP-nivå mot körande prod (localhost är whitelistat).
// Körning: node verktyg/scenariotest/scenariotest.mjs   (env BAS=tex http://localhost:3000)
// Journal: data/vakten/scenariotest/journal.jsonl (appendas per körning)
// Principer: oautentiserat anrop får ALDRIG 200 på skyddad yta; 401 = härdad,
// 404 = ostängd, 5xx = fel. 429 räknas som AVVISNING: svaret kommer inifrån
// requireAdmin:s brutforce-grind (FÖRE lösenordskontrollen) — bevis på att
// väggen är monterad. Autentiserade flöden kräver session och testas
// utanför denna suite (dokumenterat i worklog — ärlig avgränsning).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BAS = process.env.BAS || 'http://localhost:3000';
const ROTT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const JOURNAL = ROTT + '/data/vakten/scenariotest/journal.jsonl';

const result = [];
const scenario = async (namn, beskrivning, fn) => {
  await vanta(400);
  try {
    const r = await fn();
    result.push({ namn, beskrivning, ...r, pass: r.pass === true });
  } catch (e) {
    result.push({ namn, beskrivning, pass: false, fel: e.message });
  }
};
const kod = async (url, init) => {
  // x-real-ip deklarerar svitens FAKTISKA källa: direkt loopback-anslutning
  // till app-porten (nginx sätter headern för proxierad trafik; utan den blir
  // utvinnIp()="okand" och frekvensvaktens delade okänd-bucket slår till —
  // loopback-vårdnadstrafik är avsiktligt undantagen enligt middleware v105).
  const res = await fetch(url, { redirect: 'manual', ...init, headers: { 'user-agent': 'AK1A-scenariotest/1.0 (studio-E2E, driftskanal)', 'x-real-ip': '127.0.0.1', ...(init?.headers || {}) } });
  return { status: res.status, contentType: res.headers.get('content-type') || '', body: await res.text().catch(() => '') };
};
// Pacing: sviten håller lagom tempo som en välordnad klient.
const vanta = (ms) => new Promise((l) => setTimeout(l, ms));

// S0 — bastjänster: sajten och studion svarar
await scenario('S0 bastjänster', '/ och /studio svarar 200 på körande prod', async () => {
  const hem = await kod(BAS + '/');
  const studio = await kod(BAS + '/studio');
  const faktiskt = `hem ${hem.status}, studio ${studio.status}`;
  return { expect: 'GET / = 200, GET /studio = 200', faktiskt, pass: hem.status === 200 && studio.status === 200 };
});

// Pacing för auth-fel: varje 401-svar matar requireAdmin:s delade
// fel-bucket (10 fel/min, modul-singelton över ALLA admin-rutter —
// src/lib/admin-auth.ts:51). 7 s mellan fel-producerande anrop håller
// bucketen ≤9 i det rullande 60 s-fönstret; sviten testar VÄGGEN, inte
// brutforce-skyddets tak.
const VANTA_MELLAN_FEL = 7000;
const AVVISAD = (status) => status === 401 || status === 429;

// S1 — 401-väggen: oautentiserad GET på skyddade studio-rutter
// (halsa är AVSIKTLIGT publik — våg 90 K1-beslut, driftkoll utan hemligheter —
// och testas i S6; sessions/mal har endast underrutter: disk resp. status)
const GET_RUTTER = [
  'stream', 'sessions/disk', 'mal/status', 'modeller', 'minne', 'fardigheter',
  'uppladdning', 'anvandning', 'tjanster/usage-v4', 'tjanster/resync',
];
await scenario('S1 401-väggen (GET)', `oautentiserad GET på ${GET_RUTTER.length} skyddade rutter → 401 (429 = rate-vägg, också avvisad; ej 200/404/5xx)`, async () => {
  const rader = [];
  let alla = true;
  for (const r of GET_RUTTER) {
    await vanta(VANTA_MELLAN_FEL);
    const s = await kod(`${BAS}/api/studio/${r}`);
    rader.push(`${r}:${s.status}`);
    if (!AVVISAD(s.status)) alla = false;
  }
  return { expect: 'alla 401|429', faktiskt: rader.join(' '), pass: alla };
});

// S6 — publik hälsorutt: 200 med driftdata, utan hemligheter (våg 90 K1)
await scenario('S6 publik hälsorutt', 'GET /api/studio/halsa → 200, JSON med driftdata, inga hemlighetsmarkörer', async () => {
  const s = await kod(BAS + '/api/studio/halsa');
  let json = null;
  try { json = JSON.parse(s.body); } catch { /* ej json */ }
  const kroppen = s.body.slice(0, 2000);
  const lackor = [/ADMIN_PASSWORD/i, /sk-/, /Bearer /, /apikey/i].filter((re) => re.test(kroppen));
  const driftdata = !!(json && (json.barn || json.antalBarnprocesser !== undefined));
  return { expect: '200 + JSON-driftdata + 0 läckor', faktiskt: `${s.status}, driftdata=${driftdata ? 'ja' : 'nej'}, läckor=${lackor.length}`, pass: s.status === 200 && driftdata && lackor.length === 0 };
});

// S2 — chatt-SSE-kontraktet: oautentiserad ström släpps inte in och läcker inte SSE
await scenario('S2 chatt-SSE-kontrakt', 'GET /api/studio/stream oautentiserat → 401 (429 = rate-vägg), inget text/event-stream-läckage', async () => {
  await vanta(VANTA_MELLAN_FEL);
  const s = await kod(BAS + '/api/studio/stream');
  const lacker = s.contentType.includes('text/event-stream');
  return { expect: '401|429 utan SSE content-type', faktiskt: `${s.status} (${s.contentType})`, pass: AVVISAD(s.status) && !lacker };
});

// S3 — komprimeringsflödet: compact-action kräver admin
await scenario('S3 komprimeringsknappen', 'POST /api/studio/session {action:"compact"} utan admin-header → 401 (429 = rate-vägg)', async () => {
  await vanta(VANTA_MELLAN_FEL);
  const s = await kod(BAS + '/api/studio/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'compact' }) });
  return { expect: '401|429', faktiskt: String(s.status), pass: AVVISAD(s.status) };
});

// S4 — bilduppladdningsflödet: uppladdning avvisas oautentiserat
// (401 = auth-vägg; 429 = rate-grinden AVFÄRDAR före auth — båda är avvisning)
await scenario('S4 bilduppladdning', 'POST /api/studio/uppladdning med fil utan admin-header → 401 eller 429 (avvisad, aldrig 200)', async () => {
  await vanta(VANTA_MELLAN_FEL);
  const fd = new FormData();
  fd.append('fil', new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }), 'sond.png');
  const s = await kod(BAS + '/api/studio/uppladdning', { method: 'POST', body: fd });
  return { expect: '401|429', faktiskt: String(s.status), pass: AVVISAD(s.status) };
});

// S5 — metodkontrakt: resync-rutten är GET-härdad (POST avvisas mekaniskt av
// Next-routern FÖRE requireAdmin — matar inte fel-bucketen)
await scenario('S5 metodkontrakt resync', 'POST /api/studio/tjanster/resync → 405 (rutt monterad, metoden avvisad)', async () => {
  const s = await kod(BAS + '/api/studio/tjanster/resync', { method: 'POST' });
  return { expect: '405', faktiskt: String(s.status), pass: s.status === 405 };
});

// Rapport
const pass = result.filter((r) => r.pass).length;
const tabell = result.map((r) => `${r.pass ? 'PASS' : 'FAIL'}  ${r.namn}: ${r.faktiskt || r.fel || ''} (väntat: ${r.expect})`).join('\n');
console.log(`SCENARIOTEST ${pass}/${result.length} PASS — ${new Date().toISOString()}\n${tabell}`);

try {
  fs.mkdirSync(path.dirname(JOURNAL), { recursive: true });
  fs.appendFileSync(JOURNAL, JSON.stringify({ ts: new Date().toISOString(), bas: BAS, pass, total: result.length, resultat: result.map(({ namn, pass, faktiskt, expect }) => ({ namn, pass, faktiskt, expect })) }) + '\n');
  console.log('journal: ' + JOURNAL);
} catch (e) { console.log('journal-fel: ' + e.message); }
process.exit(pass === result.length ? 0 : 1);
