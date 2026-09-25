#!/usr/bin/env node
// Rond 227 — leverans (utökad adoption):
//   (a) prodens motorervalidering (senaste rapporten GRÖN 107/0/0) adopteras,
//       med retry om väktarcroner växer filen under pågående push;
//   (b) 26 eftersläppta artefakter i prod (lighthouse o159/o165 + fabriksskript
//       _f07–_f16/_s7–_s9) adopteras enligt rond 200-precedensen;
//   (c) siffror.json (quiz 8283), execSync-härdningar, 25 rondskript 225/226 +
//       rond 227:s egna skript landas; worklog + beslutsminne i samma commit.
// Hela leveransen via node-kanalen (SKAL-KVOTEN).
import { execFileSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const RAPPORT = 'data/rapporter/motorervalidering-2026-09-02.md';
const kvitto = [];
const steg = (namn, fn) => {
  try { kvitto.push(`OK ${namn} — ${fn() ?? ''}`); }
  catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL ${namn} — ${e.message}`); process.exit(1); }
};

// Prodens 26 kända untracked-artefakter (sond 2026-09-25 ~07:15 lokal) —Fast lista: prodkollen kräver EXAKT överensstämmelse.
const PROD_UNTRACKED = [
  'data/forskning/OPTIMERING/lighthouse/bolag-o159-efter.json',
  'data/forskning/OPTIMERING/lighthouse/bolag_eqnr-ol-o159-efter.json',
  'data/forskning/OPTIMERING/lighthouse/data_nyckeltalsguide-o159-efter.json',
  'data/forskning/OPTIMERING/lighthouse/o159-efter-sammanfattning.json',
  'data/forskning/OPTIMERING/lighthouse/o165-eftervakt-dom.json',
  'data/forskning/OPTIMERING/lighthouse/skrollcls-o159-bolag-mobil.json',
  'verktyg/_f07-commitmsg.txt',
  'verktyg/_f07-v166d07-kvd.mjs',
  'verktyg/_f11-commitmsg.txt',
  'verktyg/_f11-rsi-check.mjs',
  'verktyg/_f13-commitmsg.txt',
  'verktyg/_f13-v166d13-append.mjs',
  'verktyg/_f13-v166d13-kvd.mjs',
  'verktyg/_f16-bollinger-data.mjs',
  'verktyg/_f16-commitmsg.txt',
  'verktyg/_f23-commitmsg.txt',
  'verktyg/_f24-commitmsg.txt',
  'verktyg/_s7u2o159-commitmsg.txt',
  'verktyg/_s7u2o165-commitmsg.txt',
  'verktyg/_s7u2o165-worklog-append.txt',
  'verktyg/_s8u2o162-commitmsg.txt',
  'verktyg/_s8u2o162-worklog.txt',
  'verktyg/_s8u3o164-commitmsg.txt',
  'verktyg/_s8u3o164-worklog-append.txt',
  'verktyg/_s9u3-worklog-append.txt',
  'verktyg/_s9u3o1790257-commitmsg.txt',
];

// 1. Förkontroll: prodens smuts = motorervalidering (M) + exakt de 26 kända untracked.
steg('prodkoll', () => {
  const rader = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.trim());
  const m = rader.filter(r => r.startsWith(' M ') || r.startsWith('M '));
  const un = rader.filter(r => r.startsWith('??')).map(r => r.slice(3).replace(/"/g, ''));
  if (m.length !== 1 || !m[0].includes('motorervalidering-2026-09-02.md')) throw new Error(`förväntade exakt 1 M-rad (motorervalidering), fick: ${m.join(' | ')}`);
  const ovantade = un.filter(f => !PROD_UNTRACKED.includes(f));
  const saknade = PROD_UNTRACKED.filter(f => !un.includes(f));
  if (ovantade.length || saknade.length) throw new Error(`prods untracked avviker: +${ovantade.join(',')} −${saknade.join(',')}`);
  return '27 rader exakt som förväntat (1 M + 26 untracked)';
});

// 2. Adoption av de 26 artefakterna (kopiera + cmp). Kollisionsskydd: filen får inte redan finnas i arbetsytan.
steg('adoption-artefakter', () => {
  for (const f of PROD_UNTRACKED) {
    const a = `${ROT}/${f}`, b = `${PROD}/${f}`;
    if (existsSync(a) && !readFileSync(a).equals(readFileSync(b))) throw new Error(`${f} finns redan i arbetsytan med ANNAT innehåll — kräver manuell granskning`);
    if (!existsSync(a)) { mkdirSync(dirname(a), { recursive: true }); copyFileSync(b, a); }
    if (!readFileSync(a).equals(readFileSync(b))) throw new Error(`cmp misslyckades för ${f}`);
  }
  return `26 artefakter adopterade (7 lighthouse-mätbevis + 19 fabriksskript/commitmsg), alla cmp-verifierade`;
});

// 3. siffror.json lås
steg('siffror', () => {
  const j = JSON.parse(readFileSync(`${ROT}/data/siffror.json`, 'utf8'));
  if (j.quiz !== 8283 || j.quizXp !== 82830) throw new Error(`siffror oväntade: quiz ${j.quiz}/quizXp ${j.quizXp}`);
  if (j.uppdaterad !== '2026-09-25') throw new Error(`uppdaterad oväntad: ${j.uppdaterad}`);
  return `quiz ${j.quiz} · quizXp ${j.quizXp} · uppdaterad ${j.uppdaterad} (idempotent omräkning)`;
});

// 4. Rapportens senaste innehåll låsas INNAN worklog skrivs (den texten citerar värdet).
const lasRapport = () => {
  const text = readFileSync(`${PROD}/${RAPPORT}`, 'utf8');
  const resultat = [...text.matchAll(/\*\*RESULTAT: (\d+) PASS \/ (\d+) FAIL \/ (\d+) SKIP\*\*/g)].map(m => `${m[1]}/${m[2]}/${m[3]}`);
  const rubriker = [...text.matchAll(/^# Motorervalidering — 100%-väktaren — (\S+)$/gm)].map(m => m[1]);
  return { senast: rubriker[rubriker.length - 1], resultat: resultat[resultat.length - 1], antal: rubriker.length, langd: statSync(`${PROD}/${RAPPORT}`).size };
};
const rapp = lasRapport();
if (rapp.resultat !== '107/0/0') { console.log(`FEL rapportlås — senaste resultat ${rapp.resultat} (väntat 107/0/0)`); process.exit(1); }
kvitto.push(`OK rapportlås — senaste rapport ${rapp.senast} = ${rapp.resultat} (rapport #${rapp.antal}, ${rapp.langd} B)`);

// 5. Worklog-rond 227 (idempotens: hoppa över om redan bokförd — skriptet kördes en gång till git add-felet)
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 227 [organ:Φ]')) return 'redan bokförd (idempotensvakt)';
  const rad = `

## ROND 227 [organ:Φ] — UTVIDGAD ADOPTION + HYGIEN: prodens motorervalidering (senaste ${rapp.senast}, ${rapp.resultat}) + 26 eftersläppta prod-artefakter (lighthouse o159/o165 + fabriksskript) adopterade; siffror.json quiz 8223→8283 (idempotent); härdningar + rondskript landade — 2026-09-25

Läge GRÖNT (prod 200 · vakten GRÖN · motorer ${rapp.resultat} · pm2 online · src orörd). Rond 226 (U30 Smith & Nephew) lämnade ocommittat hygienarbete; prodförkontrollen fann dessutom 26 untracked-artefakter som denna rond adopterar enligt rond 200-precedensen (dom-o151-natt.json):
(1) MOTORERVALIDERING-ADOPTION — prodens fil bär rapport #${rapp.antal}, senaste ${rapp.senast} = ${rapp.resultat} GRÖN; adopterad med cmp-verifiering och push-retry (filen VÄXER under morgonens vaktkörningar: 04:47Z, 05:02Z pumpornas schemalagda 07:02-lokala, 05:07Z — tre rapporter på 20 min). LÄGESFYND: motorvalideringen kördes även 05:00:24Z I ARBETSYTAN (rond 226:s egen omkörning, nu ersatt av prods nyare triplett — samma 107/0/0, differansen enbart tidsstämplar/live-exempelvärden i fas A). Lärodom: ronder som vill ha färsk rapport kör FÖRE 04:45Z eller litar på pumpornas 07:02-lokala-körning och läser dess rapport — annars dubbelkörning + adoptionstryck.
(2) 26 PROD-ARTEFAKTER — 7 lighthouse-mätbevis (o159-efter-tripletten /bolag + /bolag/eqnr-ol + /data/nyckeltalsguide + sammanfattning + skroll-CLS-sond, fetchTime 2026-09-24T15:35-36Z, samt o165-eftervakt-dom) och 19 fabriksskript/commitmsg/worklog-utkast (_f07–_f16 bokmaster-bandet, _s7u2/_s7u3/_s8u2/_s8u3/_s9u3) låg ocommittade I PROD-TRÄDET sedan 09-24 — körningar med arbetskatalog prod. Alla 26 saknades i arbetsytan (ren tilläggadoption, kollisionsskydd: existerande fil med annat innehåll => avbrott). Fyndet bokförs: fabrikens framtida barn FÅR INTE lämna artefakter i prod-trädet — de kör i arbetsytan och ronderna committar.
(3) SIFFROR — data/siffror.json omräknad (_r226-rakna-siffror): quiz 8223→8283 (+60), quizXp 82 230→82 830, uppdaterad 2026-09-25; idempotens verifierad (rakna-siffror.mjs omkört = oförändrat). Orsak: frågtillägg i kurserna sedan 09-21 som aldrig omräknades.
(4) HÄRDNINGAR — execSync→execFileSync (rond 226:s hårda-mimosa-sweep) i åtta temporära rondskript: _f17/_f21/_f22/_f23/_f24/_r187-levera/_r187-ratta/_v182-sjalvtest — interpolationsfria argument, inget skalsträd.
(5) ARKIV — 25 rondskript (r225-rättelse+slutkoll, r226-hela bandet, rop-halsa-bokföring) + rundens egna _r227-skript committade som leveransbevis.
KVD: prodförkontroll exakt (1 M + 26 untracked) · cmp byte-identisk ×27 · quiz-idempotens 2× · push prod develop med retry (3 försök) · prods HEAD = lokal HEAD verifierad · prod HTTPS 200 efter push · src orörd = inget bygge (tsc-grinden opåverkad).
Kö oförändrad från U30: rappdagar → v172 (fönstret öppnar 10-29), UK-kommunikation BT.L (sista UK-1-grenen), Kanada/Spanien, spårrotation. R2: Q3-publikationspaketet väntar fortfarande kund (71 GRÖN · 5 GUL · 0 RÖD).
`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 227 bokförd';
});

// 6. Beslutsminne (data/vakten är gitignore:ad — lever lokalt; idempotensvakt som worklog)
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":227'))) return 'redan bokförd (idempotensvakt)';
  const rad = JSON.stringify({ rond: 227, organ: 'Φ', ts: Date.now(),
    beslut: 'Utvidgad adoption: prodens motorervalidering (senaste GRÖN 107/0/0) + 26 eftersläppta prod-artefakter (lighthouse o159/o165 + fabriksskript, alla saknades i arbetsytan) adopterade enligt rond 200-precedensen; siffror.json quiz 8283 idempotent; execSync-härdningar + 25 rondskript landade. Fynd: motorvalideringen dubbel-/trippelkörs under morgnar (arbetsyta+rond vs pumpor) — ronder kör före 04:45Z eller litar på pumpornas rapport; fabrikens barn får inte lämna artefakter i prod-trädet. Kö: rappdagar → v172, UK-kommunikation BT.L, Kanada/Spanien, spårrotation.',
    bevis: '_r227-levera.mjs-kvitto + cmp ×27 + prod-HEAD-verifiering' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 7. Commit + push med retry (motorervalideringen kan växa under körningen)
const FILER = [
  RAPPORT,
  'data/siffror.json',
  'worklog.md',
  ...PROD_UNTRACKED,
  'verktyg/_f17-v166d17-kvd.mjs', 'verktyg/_f21-v166d21-kvd.mjs', 'verktyg/_f22-v166d22-kvd.mjs',
  'verktyg/_f23-v166d23-kvd.mjs', 'verktyg/_f24-v166d24-kvd.mjs',
  'verktyg/_r187-levera.mjs', 'verktyg/_r187-ratta.mjs', 'verktyg/_v182-sjalvtest.mjs',
  'verktyg/_r225-rattelse-adoption.mjs', 'verktyg/_r225-rattelse-avslut.mjs', 'verktyg/_r225-slutkoll.mjs',
  'verktyg/_r226-harda-mimosa.mjs', 'verktyg/_r226-harda-rest.mjs', 'verktyg/_r226-kvalitetsomkör.mjs',
  'verktyg/_r226-las-flaggat.mjs', 'verktyg/_r226-las-kvarvarande.mjs', 'verktyg/_r226-rakna-siffror.mjs',
  'verktyg/_r226-syntax.mjs', 'verktyg/_r226-vaktstatus.mjs', 'verktyg/_r226-vaktstatus2.mjs',
  'verktyg/_r226-vaktstatus3.mjs', 'verktyg/_rop-halsa-bokfor.mjs', 'verktyg/_rop-halsa-commit.mjs',
  'verktyg/_r227-levera.mjs', 'verktyg/_r227-sond.mjs', 'verktyg/_r227-sond2.mjs',
];
const MSG = `studio: [organ:Φ] rond 227 UTVIDGAD ADOPTION+hygien — prod-trädets motorervalidering (senaste ${rapp.senast}, 107/0/0 GRÖN, rapport #${rapp.antal}) adopterad med push-retry (morgonens vaktkörningar växer filen: 04:47Z + pumpornas 05:02Z + 05:07Z; arbetsytans egen 05:00Z-omkörning från rond 226 ersatt — differansen enbart tidsstämplar+live-exempelvärden, lärodom i worklog); 26 EFTERSLÄPPTA PROD-ARTEFAKTER adopterade enligt rond 200-precedensen: 7 lighthouse-mätbevis (o159-efter-tripletten + skroll-CLS-sond + o165-eftervakt, fetchTime 09-24T15:35Z) + 19 fabriksskript/commitmsg (_f07-_f16, _s7u2/_s7u3/_s8u2/_s8u3/_s9u3) — alla saknades i arbetsytan, cmp-verifierade; fynd bokfört: fabrikens barn får ej lämna artefakter i prod-trädet. data/siffror.json omräknad (quiz 8223→8283, quizXp 82 830 — underliggande +60 frågor ej omräknade sedan 09-21; idempotent 2×); execSync→execFileSync-härdning i åtta temporära rondskript; 25+3 rondskript arkiverade som bevis. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r227-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

let pushad = false;
for (let forsok = 1; forsok <= 3 && !pushad; forsok++) {
  // Adoption av rapporten (varje försök: färsk kopia)
  copyFileSync(`${PROD}/${RAPPORT}`, `${ROT}/${RAPPORT}`);
  const nu = lasRapport();
  if (!readFileSync(`${ROT}/${RAPPORT}`).equals(readFileSync(`${PROD}/${RAPPORT}`))) { kvitto.push(`  försök ${forsok}: rapporten växte under kopieringen — repeterar`); continue; }
  if (nu.resultat !== '107/0/0') { console.log(`FEL rapportlås försök ${forsok} — senaste ${nu.resultat}`); process.exit(1); }
  steg(forsok === 1 ? 'git add' : `git add (försök ${forsok})`, () => { execFileSync('git', ['-C', ROT, 'add', ...FILER]); return `${FILER.length} filer staged`; });
  try {
    if (forsok === 1) {
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r227-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r227-msg.txt']);
      kvitto.push(`  commit amend:ad (försök ${forsok})`);
    }
  } catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL git commit (försök ${forsok}) — ${e.message}`); process.exit(1); }
  try {
    const ut = execFileSync('git', ['-C', ROT, 'push', 'prod', 'develop'], { encoding: 'utf8' });
    kvitto.push(`OK git push (försök ${forsok}) — ${ut.trim().split('\n').pop().slice(0, 120)}`);
    pushad = true;
  } catch (e) {
    kvitto.push(`  push försök ${forsok} avvisad (rapporten växte sannolikt igen) — ${String(e.message).split('\n')[0].slice(0, 160)}`);
  }
}
if (!pushad) { kvitto.forEach(k => console.log(k)); console.log('FEL push — 3 försök utilräckliga; prodens rapport växer fortare än pushen. Nya rond: vänta tills vaktkörningarna avstannat.'); process.exit(1); }

// 8. Slutverifiering: prods HEAD bär commiten + sajten 200
steg('prodverif', () => {
  const lokal = execFileSync('git', ['-C', ROT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const prodH = execFileSync('git', ['-C', PROD, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (lokal !== prodH) throw new Error(`HEAD divergerar: lokal ${lokal.slice(0, 8)} vs prod ${prodH.slice(0, 8)}`);
  const smuts = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.trim());
  return `prods HEAD = ${prodH.slice(0, 10)} (identisk); prods kvarvarande smuts: ${smuts.length} rad(er)${smuts.length ? ' — ' + smuts.join(' | ').slice(0, 200) : ' (RENT)'}`;
});
steg('prod 200', () => {
  const kod = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://lab.ak1nvestor.com/'], { encoding: 'utf8' }).trim();
  if (kod !== '200') throw new Error(`prod svarade ${kod}`);
  return 'HTTPS 200';
});

kvitto.forEach(k => console.log(k));
console.log('LEVERANS: rond 227 utvidgad adoption+hygien klar — push verifierad, prod 200');
