// _r264-bokfor-a.mjs — r264a: bokför ISR-krisens dokumentation (worklog r262-263 + DRIFTSBOKEN) + trädhygien + commit + push
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const cwd = '/home/ak1a/agent/ak1';
const sh = c => execSync(c, { encoding: 'utf8', timeout: 180000, cwd });

// 1) append DRIFTSBOKEN + worklog från förskrivna staging-filer
fs.appendFileSync(cwd + '/data/DRIFTSBOKEN.md', fs.readFileSync(cwd + '/verktyg/_r264-driftsbok-isr.txt', 'utf8'));
fs.appendFileSync(cwd + '/worklog.md', fs.readFileSync(cwd + '/verktyg/_r264-worklog-r262.txt', 'utf8'));
console.log('append: DRIFTSBOKEN + worklog ROND 262-263 OK');

// 2) trädhygien: staging-filer + sond bort (bokföringsskriptet självt pyttecommittas efteråt)
for (const f of ['verktyg/_r264-driftsbok-isr.txt', 'verktyg/_r264-worklog-r262.txt', 'verktyg/_r264-sond.mjs']) {
  fs.unlinkSync(cwd + '/' + f);
}
console.log('trädhygien: 3 engångsfiler bort');

// 3) commit via -F-mönstret (tsc-grinden körs av pre-commit-kroken)
fs.writeFileSync(cwd + '/verktyg/_r264a-msg.txt',
  'studio: [organ:Φ] r264a — ISR-krisen (r262-263) bokförd: rot tre mekanismer (Turbopack-persistent cache + ISR-staleness nollställd av pm2-omstarter + dynamicParams=false ger 404 vid cache-radering) + kuren (rent bygge 08:53 + omstart 09:51, bevisat grön: tre sidor 200 med nya länkarna, vakten 0/180) + DOKTRIN-RÄTTELSE i DRIFTSBOKEN: publicerade bloggsidor är prerenderade — dataändringar kräver bygge i samma andetag; worklog ROND 262-263\n');
sh('git add data/DRIFTSBOKEN.md worklog.md && git commit -F verktyg/_r264a-msg.txt');
console.log('commit:', sh('git log -1 --format="%h %s"').slice(0, 100));
fs.unlinkSync(cwd + '/verktyg/_r264a-msg.txt');

// 4) push prod + beslutsminne
const push = sh('git push prod develop 2>&1');
console.log('push:', push.trim().split('\n').slice(-2).join(' | ').slice(0, 160));
const hash = sh('git log -1 --format=%h').trim();
fs.appendFileSync(cwd + '/data/vakten/beslutsminne.jsonl',
  JSON.stringify({ ts: new Date().toISOString(), rond: 114, beslut: 'ISR-krisen r262-263 bokförd: rot tre mekanismer + kur rent bygge (bevisat grön) + doktrin-rättelse (publicerade bloggdata kräver bygge); B30 rederi omstartad som förgrunds-subagent', landat: hash }) + '\n');
console.log('beslutsminne rond 114:', hash);
