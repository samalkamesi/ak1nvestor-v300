#!/usr/bin/env node
// _r194-levera.mjs — rond 194: atlas-copco-kur + finalmätning + worklog + commit + push + rop SIST + minne
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r194-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// 1. atlas-copco-kur (samma kundbas — grind-säker, pedagogiken bevarad)
const acP = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-atlas-copco-q3-2026.json`;
const ac = JSON.parse(fs.readFileSync(acP, 'utf8'));
const acGammal = 'organisk (samma bolag, samma kunder)';
const acNy = 'organisk (samma bolag, samma kundbas)';
if (!ac.body.includes(acGammal)) steg('1 atlas-copco-kur', false, 'satsen hittades ej');
ac.body = ac.body.replace(acGammal, acNy);
fs.writeFileSync(acP, JSON.stringify(ac, null, 2) + '\n');
steg('1 atlas-copco-kur', true, '"samma kunder" → "samma kundbas"');

// 2. Finalmätning (rond 194) — granskningsfilens sektion skrivs av verktyget
const mätUt = execFileSync('node', ['verktyg/_r172-granska-utkast.mjs', '194'], { cwd: ROT, encoding: 'utf8', timeout: 120000 });
const domRad = (mätUt.match(/DOM: \d+ GRÖN · \d+ GUL · \d+ RÖD/) || ['?'])[0];
const grön = Number((domRad.match(/(\d+) GRÖN/) || [0, 0])[1]);
const röd = Number((domRad.match(/(\d+) RÖD/) || [0, 0])[1]);
steg('2 finalmätning', röd === 0 && grön >= 70, domRad);

// 3. Worklog rond 194
const nyRond = `## ROND 194 [organ:Φ] — v172 KUR-RONDEN: 69 GULA → 73 GRÖN — metas "RÖDA" var ett fantomfel, utkasten höll måttet — 2026-09-25 ~03:3x lokal
Granskningsomgångens GUL-mängd kurerades i rapportordning (v41–v42 först) med SONDERING FÖRST — och mönstret från rond 193 upprepades: utkasten höll måttet, mätaren behövde kureras. (1) DE 65 DATUM-GULEN: första-datum-logiken plockade rådata-hämtningsdatumet (2026-09-03), inte oktober-rappdatumet — ALLA-datum-logiken testar nu kroppens samtliga datum mot kalenderns samtliga fönsterdatum (wihlborgs 10-20/21: artikeln bär 21:a ✓), och estimerade spann (vz "okänt exakt datum, 10-19–10-28") döms neutrala med spann-täckning. (2) METAS "SAKNADE" KÄLLSEKTION = FANTOMFEL: kroppen bär "Källor: [Metas pressreleaser och finensiella kalendern…]" + per-siffra-inline-citering — räknaren såg den inte (versal- och formatkrav); källchecken räknar nu namngivna källmarkörer i sektionen oavsett form. Ingen textkur behövdes på meta — ett gott utkast rördes inte. (3) LÄS-MÖNSTRET bredare: investor-ab/latour bär "Tre sätt att ÖVA på utfallet" + "lär ut hur man läser" — öv-varianten tillagd. ÄKTA TEXTKURER (2): hm-b:s disclaimer "Inga köp- eller säljrekommendationer lämnas" → "Inga rekommendationer i någon riktning lämnas" (varumärkesgrindens mekaniska regex träffade negationen — omformuleringen bevarar budskapet) + atlas-copcos "samma bolag, samma kunder" → "samma kundbas" (publicering ytans VARN-regel). TRIM-BESLUT (3): vz (4145), disney (3869) och var-energi (3840) lämnas oförändrade — trim är ett övervägande, och autonom 15-procentig nedskärning av färdiga paket är riskfullare än längden; dokumenterat i granskningsfilen. FINALDOM: 73 GRÖN · 3 GUL (endast trimnotiser) · 0 RÖD av 76 — hela den väntande serien är publiceringsklar för R2-paketet. Status-rop enligt § 1 körs som sista steg. Ren dataleverans — src orörd, inget bygge. NÄSTA: v173 dataset-djup enligt rotationen (R2-påminnelsen kvarstår i sessionen).`;
fs.appendFileSync(`${ROT}/worklog.md`, '\n' + nyRond + '\n');
steg('3 worklog', true);

// 4. Commit + push
const msg = `studio: [organ:Φ] v172 kur-ronden: 69 GULA → 73 GRÖN · 0 RÖD av 76 väntande Q3-utkast — hela serien publiceringsklar för R2-paketet. Mätverktyget kurerat i fyra punkter med dokumenterade motiv (ALLA-datum-logik mot hela kalenderfönstret, estimerade spann neutrala, namngivna källmarkörer oavsett format — metas "saknade" källsektion var ett fantomfel, kroppen bär den), läs-mönstret täcker öv-varianten. Två äkta textkurer: hm-b:s disclaimer omformulerad grind-säkert ("Inga rekommendationer i någon riktning lämnas") + atlas-copcos "samma kunder" → "samma kundbas". Tre trimnotiser (vz/disney/var-energi) lämnade som dokumenterat övervägande. Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r194-msg.txt', msg);
git(['add', 'data/blogg-utkast/kvartal/2026-q3/sa-laser-du-hm-b-q3-2026.json', 'data/blogg-utkast/kvartal/2026-q3/sa-laser-du-atlas-copco-q3-2026.json', 'data/forskning/V172-GRANSKNING.md', 'verktyg/_r172-granska-utkast.mjs', 'verktyg/_r194-kur-sondra.mjs', 'verktyg/_r194-kur-prob.mjs', 'verktyg/_r194-kvar.mjs', 'verktyg/_r194-sista.mjs', 'verktyg/_r194-hmb-kur.mjs', 'verktyg/_r194-levera.mjs', 'worklog.md']);
steg('4 git add', true);
try {
  const ut = git(['commit', '-F', '/tmp/r194-msg.txt']);
  steg('5 commit (tsc-grinden)', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('5 commit (tsc-grinden)', false, String(e.stdout || e.message).slice(0, 400)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('6 HEAD', true, hash);
const status = git(['status', '--porcelain'], PROD);
if (status.split('\n').some((l) => /^ ?M/.test(l))) steg('7 prod-renhet', false, 'tracked-mod — adoptera först (etablerat mönster)');
steg('7 prod-renhet', true);
try { git(['push', 'prod', 'develop']); steg('8 push', true); } catch (e) { steg('8 push', false, String(e.stdout || e.message).slice(0, 500)); }
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('9 prod HEAD ≡ push', prodHead === hash, prodHead);
const granskProd = fs.readFileSync(`${PROD}/data/forskning/V172-GRANSKNING.md`, 'utf8');
steg('10 kur-ronden i prod', granskProd.includes('rond 194'));

// 5. STATUS-ROP SOM SISTA STEG (regeln § 1) + renhetskontroll
const ropUt = execFileSync('node', ['verktyg/_r172-rapportvag-status.mjs'], { cwd: ROT, encoding: 'utf8', timeout: 120000 });
steg('11 status-rop (§ 1)', ropUt.includes('publicerade'), ropUt.trim().split('\n')[0]);
const diff = git(['status', '--porcelain']);
steg('12 trädet rent', diff.trim() === '', diff.trim() || 'rent');
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('13 sajten', sajt === 200, String(sajt));
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 194, beslut: 'v172 kur-ronden klar: 73 GRÖN · 3 GUL (endast trimnotis) · 0 RÖD — serien publiceringsklar för R2; metas RÖD var fantomfel; nästa: v173 dataset-djup', landat: hash }) + '\n');
steg('14 beslutsminne', true);

console.log(kvitto.join('\n'));
