// Rond 170 bokföring: worklog-append + beslutsminne + PIPELINE + sond + FABRIKÄNDRING — allt i en commit
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const WS = '/home/ak1a/agent/ak1';

fs.appendFileSync(WS + '/worklog.md', `

## ROND 170 [organ:Φ] — EVIGHETSVERKSTÄLLAN: agentfabrikens REGISTERHÄRDNING levererad — 2026-09-24 ~14:5x lokal
Evighetsmotor-kick (iteration 3 stillastående 20 min). Pågående vågor konstaterades levande: poll instans 5 (väntar rent prod-fönster, 1 spårad rad — barnets motorervalidering), prod-synkens bygg (dataset-eyebrow på ingång), v164-omgången "pågår". Rondens leverans = rond 162:s fynd kurat i roten: fabriksomstarten tappade pågående omgångs register (föräldralösa 12:25-barn alstrade dubbelrisk). TVÅ SKYDD i agentfabrik.mjs: (1) ÅTERBOKFÖRING — köad uppgift vars deklarerade filer (u.filer) alla redan finns i trädet bokförs klar (kod -1, "återfunnen") och körs aldrig om — registret läker ur artefakterna; (2) DUBBELALSTRINGSSKYDD — lever främmande fabriksbarn (föräldralösa eller barn till låsstulen fabrik) ⇒ status "vantar-barn" + avslut, processgruppen ÄR det levande registret, pumporna återupptar när barnen gått ut (reapern städar fastkörda). KVD: node --check OK, fabrikens egen --torr OK (plan läst, inget rörd), mimosa-mönster ren (existsSync + lasProcesser, ingen interpolation). Deploy via pollens push — aktiveras vid fabriksnästa plock. Pipeline: v164 SLÄPPT+PLOCKAT ✓, v165 väntar härden, v170 bokad+levererad.`);

const bm = WS + '/data/vakten/beslutsminne.jsonl';
fs.appendFileSync(bm, JSON.stringify({ ts: new Date().toISOString(), rond: 98, beslut: 'Rond 170 [Φ]: agentfabrikens registerhärdning levererad (rond 162:s fynd) — återbokföring av föräldralösa leveranser via deklarerade filer + dubbelalstringsskydd (vantar-barn) — omstarts-föräldralösheten kan inte längre alstra dubbelbarn; v164 plockat och byggs, v165 (vakt 13/13) väntar härde-push', landat: 'a42933df+248f1055 (pushade) + rundens fabrikäkring-commit' }) + '\n');

execFileSync('git', ['add', 'verktyg/agentfabrik.mjs', 'data/forskning/PIPELINE-KO.md', 'verktyg/_r170-lage.mjs', 'verktyg/_r170-fabriktest.mjs', 'verktyg/_r170-bokfor.mjs', 'worklog.md'], { cwd: WS, encoding: 'utf8', timeout: 60000 });
execFileSync('git', ['commit', '-m', 'studio: rond 170 [organ:Φ] — agentfabrikens REGISTERHÄRDNING: återbokföring av föräldralösa leveranser (filer=registret) + dubbelalstringsskydd (vantar-barn) — rond 162:s omstarts-fynd kurat i roten; syntax+torr gröna'], { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
console.log('HEAD:', execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: WS, encoding: 'utf8' }).trim());
console.log('yta:', execFileSync('git', ['status', '--porcelain'], { cwd: WS, encoding: 'utf8' }).trim() || 'REN');
console.log('poll:', fs.readFileSync('/tmp/r167-pushpoll-status.txt', 'utf8').trim().split('\n').slice(-1)[0]);
