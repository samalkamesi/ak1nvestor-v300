// Rond 154 — före-launch-kontroll för fullsvep attempt 5 (V223-villkor + ej redan löpande)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const u = {};

// 1. Löper ett svep redan?
try {
  const ps = execFileSync('ps', ['eo', 'pid,etime,args'], { stdio: 'pipe' }).toString();
  u.lopandeSvep = ps.split('\n').filter(r => /kor-alla-tester/.test(r) && !/grep/.test(r)).map(r => r.trim().slice(0, 100));
} catch (e) { u.psFel = String(e).slice(0, 100); }

// 2. Tidigare attempt-5-loggens öde
for (const fil of ['r117-fullsvep5.log', 'v224-fullsvep.log']) {
  try {
    const t = fs.readFileSync(ROT + '/data/vakten/' + fil, 'utf8').trim().split('\n');
    u[fil] = { rader: t.length, forsta: t[0]?.slice(0, 90), sista2: t.slice(-2).map(r => r.slice(0, 90)) };
  } catch { u[fil] = 'finns ej'; }
}

// 3. Senaste aggregator-rapport (genererad-tid > svepstart-regeln V227)
try {
  const r = JSON.parse(fs.readFileSync(ROT + '/data/vakten/testaggregator-SENASTE.json', 'utf8'));
  u.senasteRapport = { genererad: r.genererad ?? r.tid ?? 'okänd', grona: r.grona ?? r.sammanfattning?.grona, roda: r.roda ?? r.sammanfattning?.roda, omatta: r.omatta };
} catch (e) { u.rapportFel = String(e).slice(0, 80); }

// 4. V223 startkrav
const mem = fs.readFileSync('/proc/meminfo', 'utf8');
u.ramMB = Math.round(Number(mem.match(/MemAvailable:\s+(\d+) kB/)?.[1] ?? 0) / 1024);
u.startkrav = u.ramMB >= 3000 ? 'UPPFYLLT (≥3000 MB TUNG)' : 'UNDER';

// 5. Hur många sviter hittar aggregatorn? (torr räkning av testaggregator-journalfil)
try {
  const j = fs.readdirSync(ROT + '/data/vakten').filter(f => /^testaggregator/i.test(f));
  u.aggregatorFiler = j.slice(-4);
} catch (e) { u.jFel = String(e).slice(0, 80); }

fs.writeFileSync(ROT + '/data/vakten/r154-forlaunch.json', JSON.stringify(u, null, 1));
console.log(JSON.stringify(u, null, 1));
