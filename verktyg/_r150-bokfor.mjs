// Rond 150-bokföring: DoD-säkringsbevakare + kö-läge — worklog + beslutsminne + commit + push
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 250); } };
const blockerare = () => S(P, 'git', ['status', '--porcelain'], 30000).trim().split('\n').filter(r => r && !r.startsWith('??'));
const ut = { nu: new Date().toISOString() };

if (/rond 150/.test(S(A, 'git', ['log', '--oneline', '-2'], 30000))) { ut.hoppa = 'redan bokförd'; console.log(JSON.stringify(ut, null, 1)); process.exit(0); }

fs.appendFileSync(A + '/worklog.md', '\n## ROND 150 [organ:Ψ] — EVIGHETSMOTORN: pågående våg fortsatt (kunduppdragets slutled). PIPELINE-KO verified rik (våg 232/233 + spår 7/8/9 + R2-paket väntar kund) — ingen ny bokning behövs; granskningskön förblir PAUSAD enligt strategiska skiftet. KRITISKT TIDSLÄGE KURAT: synkens 30-min-svältstopp (~20:27Z, VÄNTAR-FABRIK 20/30 mot auto-s2) sammanföll med DoD-bevakare 1:s 90-min-tak — bevakare 2 lanserad (100-min-tak, speglar utfall till r148:s filnamn om den ej skrivit) så att DoD-stängningen (gränssnittsvakt grön på /rapportakademin = kunduppdragets sista krav enligt PIPELINE rad 342) inte tappas i gapet mellan timeout och grönt bygg. Byggloopen förblir synkens ensamrätt (rond 149:s vaccin: ALDRIG manuellt bygg under aktiv fabrik).\n');
const rad = JSON.stringify({
  ts: ut.nu, rond: 150,
  beslut: 'Evighetsmotorn: pågående våg (rapportakademins DoD-slutled) fortsatt; DoD-bevakare 2 lanserad som säkring (tak-kollision mellan bevakare 1:s timeout och synkens svältstopsbygg ~20:27Z); PIPELINE-KO rik — inga nya bokningar; manuella bygg förblir förbjudna under aktiv fabrik',
  landat: '_r150-bevakare2.mjs (bakgrund) + worklog'
}) + '\n';
for (const t of [A + '/data/vakten/beslutsminne.jsonl', P + '/data/vakten/beslutsminne.jsonl']) { try { fs.appendFileSync(t, rad); } catch (e) { ut.minneFEL = e.message.slice(0, 60); } }

S(A, 'git', ['add', '-A'], 60000);
ut.commit = S(A, 'git', ['commit', '-m', 'studio: rond 150 [organ:Ψ] — DoD-säkring: bevakare 2 (100-min-tak) täcker gapet mellan bevakare 1:s timeout och synkens svältstopsbygg ~20:27Z; PIPELINE-KO verified rik (232/233 + spår), pågående våg = kunduppdragets slutled (vakt grön på /rapportakademin)'], 300000).split('\n').find(r => /files changed|develop/i.test(r)) || 'OK';
for (let i = 1; i <= 4; i++) {
  if ((blockerare() || []).length === 0) {
    S(A, 'git', ['fetch', 'prod', 'develop'], 60000);
    const bakom = +(S(A, 'git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim() || '0');
    if (bakom > 0) S(A, 'git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 150)'], 120000);
    const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
    if (!/FEL/.test(push)) { ut.pushad = true; break; }
    ut['retry' + i] = push.slice(0, 90);
  } else { ut['vantar' + i] = blockerare().slice(0, 2); }
  if (i < 4) await new Promise(r => setTimeout(r, 50000));
}
ut.head = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 70);
console.log(JSON.stringify(ut, null, 1));
