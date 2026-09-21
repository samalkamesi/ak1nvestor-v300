// Rond 149-leverans: tsc → (idempotent) bokföring + commit + push med retry
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 300); } };
const blockerare = () => S(P, 'git', ['status', '--porcelain'], 30000).trim().split('\n').filter(r => r && !r.startsWith('??'));
const ut = { nu: new Date().toISOString() };

// (0) idempotensvakt: redan levererad denna rond?
const headAmne = S(A, 'git', ['log', '--oneline', '-1'], 30000);
if (/rond 149/.test(headAmne)) { ut.hoppa = 'rond 149 redan i HEAD'; console.log(JSON.stringify(ut, null, 1)); process.exit(0); }

// (1) tsc
ut.tsc = S(A, 'node', ['node_modules/typescript/bin/tsc', '--noEmit'], 300000).trim();
ut.tscOK = ut.tsc === '';
if (!ut.tscOK) { console.log(JSON.stringify(ut, null, 1)); process.exit(1); }

// (2) worklog + beslutsminne (EN gång — idempotensvakten ovan skyddar)
const wl = [
  '',
  '## ROND 149 [organ:Ω] — BRANDING VÅG 1: RAPPORTAKADEMIN OSYNLIG I SAJTENS ENTRÉ — KURAD.',
  'Kartläggning: strategiska skiftets prioritet 1 (BRANDING) + kärnfokus "räkna på RIKTIGA bolag",',
  'men kunduppdragets övningsyta hade NOLL träffar i meny-register, ordlista, header och startsida —',
  'endast direkt URL. Hero-underrubriken lovar "från första årsredovisningen" utan att länka dit man övar.',
  'KUR (3 kirurgiska punkter): (1) meny-register: post i PRAKTIK-panelen (📑 · gäst · "Öva på riktiga',
  'årredovisningar — bedöm först, expertläsningen efteråt" — övar i praktik-panel + ⌘K + sidfot via',
  'registret; passet självt grindas kvar server-side mot Fas 2); (2) ordlista: nav.rapportakademin',
  'sv/en/ar; (3) startsidan: chip FÖRST i verktygsraden. R3 inom tak (29 länkar), PRAKTIK 6 punkter',
  'inom R2-band. tsc 0. Publicering av läsguide-innehåll = kundens R2 — detta är endast navigation.',
  ''
].join('\n');
fs.appendFileSync(A + '/worklog.md', wl);
const rad = JSON.stringify({
  ts: ut.nu, rond: 149,
  beslut: 'Branding våg 1: Rapportakademin saknades i ALL navigation (0 träffar i meny-register/ordlista/header/startsida — endast direkt URL) — kurerad med meny-post i PRAKTIK (gäst, 📑), ordlistenyckel ×3 språk och chip först i startsidans verktygsrad; Fas 2-grinden i API:t orörd; tsc 0',
  landat: 'commit (se worklog)'
}) + '\n';
for (const t of [A + '/data/vakten/beslutsminne.jsonl', P + '/data/vakten/beslutsminne.jsonl']) { try { fs.appendFileSync(t, rad); ut['minne:' + (t === P ? 'prod' : 'agent')] = 'OK'; } catch (e) { ut.minneFEL = e.message.slice(0, 60); } }

// (3) commit + push (retry mot aktiv fabrikagent)
const msg = 'studio: rond 149 [organ:Ω] — BRANDING våg 1: Rapportakademin ur osynligheten — 0 träffar i ALL navigation (meny-register/ordlista/header/startsida), nu: PRAKTIK-panel-post (📑 gäst, öva på riktiga årsredovisningar) + nav-nyckel sv/en/ar + chip först i startsidans verktygsrad; Fas 2-grinden i pass-API:t orörd (skyddet oförändrat), R3 29 länkar inom tak, tsc 0';
fs.writeFileSync(A + '/verktyg/_r149-commitmsg.txt', msg);
S(A, 'git', ['add', '-A'], 60000);
ut.commit = S(A, 'git', ['commit', '-F', 'verktyg/_r149-commitmsg.txt'], 300000).split('\n').find(r => /files changed|develop/i.test(r)) || 'OK';
for (let i = 1; i <= 5; i++) {
  if ((blockerare() || []).length === 0) {
    S(A, 'git', ['fetch', 'prod', 'develop'], 60000);
    const bakom = +(S(A, 'git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim() || '0');
    if (bakom > 0) S(A, 'git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 149)'], 120000);
    const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
    if (!/FEL/.test(push)) { ut.pushad = true; ut.push = push.split('\n').filter(r => /develop|->/.test(r)).join(' ').slice(0, 120); break; }
    ut['retry' + i] = push.slice(0, 100);
  } else { ut['vantar' + i] = blockerare().slice(0, 2); }
  if (i < 5) await new Promise(r => setTimeout(r, 60000));
}
ut.head = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 70);
console.log(JSON.stringify(ut, null, 1));
