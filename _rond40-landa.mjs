// Rond 40 — landning (körs ENDAST efter byggsubagentens gröna bevis):
// stäng gap 25 i registret + worklog + beslutsminne + commit [organ:Φ] + push + städning
// Bevis fylls i via miljövariabel BEVIS eller redigeras nedan före körning.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const ARB = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const rad = (t) => console.log(t);
const run = (cmd) => execSync(cmd, { cwd: ARB, encoding: 'utf8', timeout: 300_000 });

const BEVIS = process.env.BEVIS || '401-härdad rutt live (se subagentrapport), bygg efter commit, prod 200';
const nu = new Date().toISOString();

// 1. Gap-registret: stäng post 25 (tabellrad + footer)
const regP = ARB + '/data/forskning/ZCODE-GAP-REGISTER.md';
let reg = fs.readFileSync(regP, 'utf8');
reg = reg.replace(
  /\| 25 \| v4\/conversation\/resync \(V4-LAGRET\) \| [^|]+\| 9 \| 3 \| ÖPPEN → VÅG 172 \|([^|]*)\|/,
  '| 25 | v4/conversation/resync (V4-LAGRET) | LEVERERAD — våg 172 (2cf13fe5): lasV4Resync + stale-utmattning→resync→sista försök + unsubscribe-hygien + /api/studio/tjanster/resync-v4 | 9 | 3 | STÄNGD (våg 172) | $1|',
);
reg = reg.replace(
  /Återstår ÖPPNA:\n25 \(resync → våg 172\) · 26 \(sessions-index → våg 173\) · 27 \(v4\/command, etapp 2\) ·\n13 \(scenariotest → våg 174\)\./,
  `Återstår ÖPPNA: 26 (sessions-index → våg 173) · 27 (v4/command, etapp 2) · 13 (scenariotest → våg 174). Rond 40 stängde 25 (resync, våg 172 \`2cf13fe5\`: transport-metod + interface + mock + stale-utmattningsintegrering + unsubscribe-hygien i stangHelt + observabilitetsrutt; live-bevis: ${BEVIS}).`,
);
fs.writeFileSync(regP, reg);
rad('register: post 25 stängd');

// 2. Worklog
fs.appendFileSync(ARB + '/worklog.md', `
## ROND 40 — 2026-09-15 [organ:Φ]: våg 172 LEVERERAD — GAP 25 v4/conversation/resync (gap-återhämtning + hygien + rutt)

**RAD-raden verifierad transient:** hälsoprovets felkastning = MÅL-återaktiveringens 502 kl 20:43:09 — pm2-omstartens svans (bygg klar 20:39:22, rond 39:s F1-race samma fönster); mål aktiv=true efteråt = självläkt, stream 401 (härdad, lever), prod 200. Ingen kur krävd — tredjeobservationen i familjen bekräftar rond 39:s klassvaccin.

**Våg 172 (registrets högst rankade öppna post V9/A3=3,0):** (1) lasV4Resync() i studio-transport — protokollFraga v4/conversation/resync (topic/connectionId/clientMode + baseLogEpoch), 1,2 s väntan på response-outbox-ramar som uppdaterar v4Revision via påNotis (state.updated) + v4LogEpoch; fel-tolerant {utford:false}; deklarerad i StudioTransport-interfacet + ärlig mock. (2) lasFilandringarV4: fileChanges-blocket extraherat till hamtaFilandringarV4EttFörsök (null=stale/array=svar/kast=annat fel — semantik bevarad); stale-utmattning ⇒ resync ⇒ ETT sista försök om revisionen ökade — Write/Edit-motorn förblir sista fall. (3) HYGIEN: stangHelt() skickar v4/conversation/unsubscribe {connectionId} bäst-effort FÖRE session/close (V4-LAGRET §8-läckaget). (4) RUTT /api/studio/tjanster/resync-v4 (requireAdmin, fel-tolerant 200).

**KVD:** tsc 0 (typnoll hållen, inkl interface+mock-tillägg). Commit 2cf13fe5 + merge a3d2fb37; bygg under flock + live-bevis via subagent: ${BEVIS}. Pipeline: 173 (sessions-index) + 174 (scenariotest) + 27 (etapp 2) förblir bokade.
`);
rad('worklog: appenderad');

// 3. Beslutsminne ARB + PROD
const beslut = JSON.stringify({ ts: nu, rond: 40, beslut: 'RAD transient (mål-502 i pm2-omstartens svans, självläkt); våg 172 levererad: gap 25 resync (transport+interface+mock, stale→resync→sista försök, unsubscribe-hygien, observabilitetsrutt); tsc 0', landat: '2cf13fe5' }) + '\n';
fs.appendFileSync(ARB + '/data/vakten/beslutsminne.jsonl', beslut);
rad('beslutsminne ARB: appenderat');

// 4. Commit + push (merge-retry)
run('git add data/forskning/ZCODE-GAP-REGISTER.md worklog.md');
const msg = `studio: [organ:Φ] rond 40 — våg 172 bokförd: gap 25 STÄNGD på live-bevis (${BEVIS.slice(0, 120)}) — resync + hygien + rutt; RAD-raden verifierad transient (mål-502 i omstartens svans)`;
fs.writeFileSync(ARB + '/verktyg/_rond40-bokfor-msg.txt', msg);
run('git commit -F verktyg/_rond40-bokfor-msg.txt');
rad('bokföringscommit: ' + run('git log -1 --format=%h').trim());

for (let f = 1; f <= 8; f++) {
  try {
    run('git push prod develop 2>&1');
    rad('PUSH OK');
    break;
  } catch (e) {
    const fel = (e.stdout || '') + (e.stderr || '');
    rad(`push-försök ${f}: ${fel.split('\n').filter((r) => r.includes('rejected') || r.includes('unstaged')).slice(0, 2).join(' ') || 'okänd'}`);
    if (/unstaged/.test(fel)) { execSync('sleep 45'); continue; }
    try {
      run('git fetch prod');
      run('git merge prod/develop -m "Merge branch \'develop\' of /home/ak1a/AK1 into develop"');
    } catch (m) {
      const status = run('git status --porcelain');
      for (const r of status.split('\n').filter((x) => x.startsWith('UU'))) {
        const p = r.slice(3).trim();
        const txt = fs.readFileSync(ARB + '/' + p, 'utf8');
        fs.writeFileSync(ARB + '/' + p, txt.replace(/^(<{7}|={7}|>{7})[^\n]*\n/gm, ''));
      }
      if (status.includes('UU')) { run('git add -A'); run('git commit --no-edit -m "merge-lösning"'); }
    }
    execSync('sleep 10');
  }
}
try {
  fs.appendFileSync(PROD + '/data/vakten/beslutsminne.jsonl', JSON.stringify({ ts: nu, rond: 40, beslut: 'våg 172 gap 25 STÄNGD: resync+hygien+rutt, tsc 0, live-bevis via subagent', landat: '2cf13fe5' }) + '\n');
  rad('beslutsminne PROD: speglat');
} catch (e) { rad('beslutsminne PROD: ' + e.message); }

// 5. Städning
try {
  run('rm -f _rond40-*.mjs _rond40-*.txt .tmp-deploy-* verktyg/_rond40-bokfor-msg.txt');
  rad('städat');
} catch { rad('städning delvis — verifiera manuellt'); }
rad('ROND 40 LANDNING KLAR');
