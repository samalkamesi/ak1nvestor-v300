// r326: deployvakt — väntar in synkens omdeploy (senaste-deployad ≠ 22df62aa),
// pushar bokföringen (merge vid non-ff) när prod-trädet är byggfritt, tar slutkvitto.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const GAMLA = '22df62aa';

function kort(cmd, timeoutMs = 60_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const deployad = () => { try { return fs.readFileSync(`${PROD}/data/vakten/senaste-deployad.txt`, 'utf8').trim(); } catch { return '(saknas)'; } };

function forsokPush() {
  let p = kort(`git -C ${ROT} push prod develop`, 120_000);
  if (p.kod !== 0 && /fetch first|fast-forward/i.test(p.ut)) {
    kort(`git -C ${ROT} fetch prod develop`, 60_000);
    const m = kort(`git -C ${ROT} merge --no-ff prod/develop -m "Merge remote-tracking branch 'prod/develop' into develop"`, 120_000);
    console.log(`  merge vid non-ff: ${m.kod === 0 ? 'OK — ' + kort(`git -C ${ROT} log --oneline -1`).ut.slice(0, 90) : 'FEL: ' + m.ut.slice(0, 200)}`);
    if (m.kod === 0) p = kort(`git -C ${ROT} push prod develop`, 120_000);
  }
  return p.kod === 0 ? { ok: true } : { ok: false, varför: /unstaged/i.test(p.ut) ? 'prod-trädet smutsigt (fabrik arbetar)' : p.ut.slice(-160) };
}

let pushad = false;
for (let i = 0; i < 16; i++) {
  const d = deployad();
  const d8 = d.slice(0, 8);
  const bygger = /next build/.test(kort(`ps aux | grep 'next build' | grep -v grep || true`).ut);
  const ren = kort(`git -C ${PROD} status --porcelain`).ut === '';

  // Push-fönster: byggfritt (prod-trädet får gärna vara smutsigt av fabrik — updateInstead kräver rent,
  // men merge+push vid non-ff är poängen; smutsigt prod-träd vägras och väntas ut)
  if (!pushad && ren && !bygger) {
    const r = forsokPush();
    pushad = r.ok;
    console.log(`${new Date().toISOString()} PUSH-fönster: ${pushad ? 'BOKFÖRINGEN PUSHAD' : 'vägras — ' + r.varför}`);
  }

  if (d8 !== GAMLA) {
    console.log(`${new Date().toISOString()} DEPLOY BOKFÖRD: ${GAMLA} → ${d8} (${d}) — tar kvitto…`);
    await sleep(8_000); // låt pm2 andas efter omstart
    const framtid = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://lab.ak1nvestor.com/blogg/sa-laser-du-holm-q3-2026`).ut;
    const startsida = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://lab.ak1nvestor.com/`).ut;
    const kurser = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://lab.ak1nvestor.com/kurser`).ut;
    const lokal = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://localhost:3000/`).ut;
    const pm = fs.existsSync(`${PROD}/.next/prerender-manifest.json`) ? `${Math.round(fs.statSync(`${PROD}/.next/prerender-manifest.json`).size / 1024)} KB` : 'SAKNAS';
    const bid = fs.readFileSync(`${PROD}/.next/BUILD_ID`, 'utf8').trim();
    const bidMtime = fs.statSync(`${PROD}/.next/BUILD_ID`).mtime.toISOString();
    console.log(`KVITO: framtidslug=${framtid} (väntat 404) · /=${startsida} · /kurser=${kurser} · localhost=${lokal} (väntat 200)`);
    console.log(`ARTEFAKT: BUILD_ID ${bid} (${bidMtime}) · prerender-manifest ${pm}`);

    if (!pushad && !bygger) {
      const r = forsokPush();
      pushad = r.ok;
      console.log(`EFTER-DEPLOY PUSH: ${pushad ? 'BOKFÖRINGEN PUSHAD' : 'vägras — ' + r.varför}`);
    }

    // Slutgrind: integritetsvakten ur prod-trädet (exit 0 = grönt, ingen larm-prompt)
    const vakt = kort(`node ${PROD}/verktyg/integritetsvakt.mjs`, 120_000);
    console.log(`INTEGRITETSVAKT: exit ${vakt.kod}`);
    console.log(vakt.ut.split('\n').slice(-6).join('\n'));

    const ok = framtid === '404' && startsida === '200' && kurser === '200' && lokal === '200' && pm !== 'SAKNAS' && vakt.kod === 0;
    console.log(ok ? `\nALLT GRÖNT — byggrace-glappet stängt, deploy bokförd ${d8}, pushad=${pushad}` : `\nAVVIKELSE i kvitot — se ovan (pushad=${pushad})`);
    process.exit(ok ? 0 : 1);
  }

  if (i % 4 === 0) {
    const svans = kort(`tail -3 ${PROD}/data/vakten/prod-synk.log`).ut;
    console.log(`${new Date().toISOString()} väntar… deployad=${d8} · bygg=${bygger ? 'pågår' : 'nej'} · prod-trädet ${ren ? 'rent' : 'smutsigt (fabrik)'} · pushad=${pushad}`);
    console.log('  synken: ' + svans.split('\n').slice(-1)[0].slice(0, 160));
  }
  await sleep(30_000);
}
console.log(`${new Date().toISOString()} inget deploy-fönster inom ~8 min (deployad=${deployad().slice(0, 8)}, pushad=${pushad}) — kör skriptet igen`);
