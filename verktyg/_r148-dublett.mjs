// Rond 148-dublettrensning: worklog-block + beslutsminnes-rader (endast EXAKTA dubbletter)
import fs from 'node:fs';

const A = '/home/ak1a/agent/ak1';
const ut = {};

// (1) worklog: identiska "## ROND 148 [organ:Δ]"-block — behåll första
const wlPath = A + '/worklog.md';
const wl = fs.readFileSync(wlPath, 'utf8');
const marker = '## ROND 148 [organ:Δ]';
const forst = wl.indexOf(marker);
const andra = wl.indexOf(marker, forst + 1);
ut.worklogDublett = andra > -1;
if (andra > -1) {
  // blocket slutar vid nästa ##-rubrik eller EOF
  const slutA = (() => { const n = wl.indexOf('\n## ', forst + 10); return n > -1 ? n : wl.length; })();
  const slutB = (() => { const n = wl.indexOf('\n## ', andra + 10); return n > -1 ? n : wl.length; })();
  const blockA = wl.slice(forst, slutA);
  const blockB = wl.slice(andra, slutB);
  if (blockA.trim() === blockB.trim()) {
    fs.writeFileSync(wlPath, wl.slice(0, andra) + wl.slice(slutB));
    ut.worklogRensat = 'identiskt block borttaget';
  } else { ut.worklogRensat = 'blocken skiljer — lämnade, manuell granskning nästa rond'; }
}

// (2) beslutsminne: rader med samma rond+beslut — behåll senaste ts
for (const p of [A + '/data/vakten/beslutsminne.jsonl', '/home/ak1a/AK1/data/vakten/beslutsminne.jsonl']) {
  try {
    const rader = fs.readFileSync(p, 'utf8').split('\n').filter(Boolean);
    const sesenaste = new Map();
    for (const r of rader) {
      try { const o = JSON.parse(r); sesenaste.set(String(o.rond) + '|' + String(o.beslut).slice(0, 80), r); }
      catch { sesenaste.set('oparsad:' + r.slice(0, 40), r); }
    }
    const rensade = [...sesenaste.values()];
    ut[p.includes('AK1/') ? 'prod' : 'agent'] = rader.length + '→' + rensade.length;
    fs.writeFileSync(p, rensade.join('\n') + '\n');
  } catch (e) { ut[p] = 'FEL ' + e.message.slice(0, 60); }
}
console.log(JSON.stringify(ut, null, 1));
