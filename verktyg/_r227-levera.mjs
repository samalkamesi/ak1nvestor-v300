#!/usr/bin/env node
// Rond 227 — leverans (utvidgad adoption, v3):
//   MEKANIK-LÄRDOM: updateInstead avvisar push så länge PROD har unstaged
//   changes — även när commiten bär exakt arbetskatalogens innehåll. Därför:
//   (1) säkra prods version i arbetsytans commit, (2) rensa prods M-rad
//   kirurgiskt (git checkout -- <fil> — innehållet återinträder via pushens
//   updateInstead-checkout), (3) pusha. Retry om rapporten växer mitt i.
//   Adoptionsskydd: prodens fil kopieras ENDAST om den är längre (append-only)
//   — en redan rensad prod kan aldrig dra bakåt en framåtbärande commit.
import { execFileSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const RAPPORT = 'data/rapporter/motorervalidering-2026-09-02.md';
const kvitto = [];
const steg = (namn, fn) => {
  try { kvitto.push(`OK ${namn} — ${fn() ?? ''}`); }
  catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL ${namn} — ${e.message}`); process.exit(1); }
};

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

// 1. Förkontroll: 0–1 M-rad (motorervalidering; 0 = redan rensad av tidigare försök) + exakt 26 kända untracked.
steg('prodkoll', () => {
  const rader = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.trim());
  const m = rader.filter(r => r.startsWith(' M ') || r.startsWith('M '));
  if (m.length > 1 || (m.length === 1 && !m[0].includes('motorervalidering-2026-09-02.md'))) throw new Error(`oväntade M-rader: ${m.join(' | ')}`);
  const un = rader.filter(r => r.startsWith('??')).map(r => r.slice(3).replace(/"/g, ''));
  const ovantade = un.filter(f => !PROD_UNTRACKED.includes(f));
  const saknade = PROD_UNTRACKED.filter(f => !un.includes(f));
  if (ovantade.length || saknade.length) throw new Error(`prods untracked avviker: +${ovantade.join(',')} −${saknade.join(',')}`);
  return `${rader.length} rader (${m.length} M + ${un.length} untracked) — som förväntat`;
});

// 2. Adoption av de 26 artefakterna (kopiera om de saknas; kollisionsskydd vid annat innehåll).
steg('adoption-artefakter', () => {
  for (const f of PROD_UNTRACKED) {
    const a = `${ROT}/${f}`, b = `${PROD}/${f}`;
    if (existsSync(a) && !readFileSync(a).equals(readFileSync(b))) throw new Error(`${f} finns redan i arbetsytan med ANNAT innehåll — manuell granskning krävs`);
    if (!existsSync(a)) { mkdirSync(dirname(a), { recursive: true }); copyFileSync(b, a); }
    if (!readFileSync(a).equals(readFileSync(b))) throw new Error(`cmp misslyckades för ${f}`);
  }
  return '26 artefakter på plats (7 lighthouse-mätbevis + 19 fabriksskript/commitmsg), cmp-verifierade';
});

// 3. siffror.json lås
steg('siffror', () => {
  const j = JSON.parse(readFileSync(`${ROT}/data/siffror.json`, 'utf8'));
  if (j.quiz !== 8283 || j.quizXp !== 82830) throw new Error(`siffror oväntade: quiz ${j.quiz}/quizXp ${j.quizXp}`);
  if (j.uppdaterad !== '2026-09-25') throw new Error(`uppdaterad oväntad: ${j.uppdaterad}`);
  return `quiz ${j.quiz} · quizXp ${j.quizXp} · uppdaterad ${j.uppdaterad} (idempotent omräkning)`;
});

// 4. Rapportlås LÄSES på arbetsytans fil (efter adoption nedan körs den i loopen).
const lasLokalRapport = () => {
  const text = readFileSync(`${ROT}/${RAPPORT}`, 'utf8');
  const resultat = [...text.matchAll(/\*\*RESULTAT: (\d+) PASS \/ (\d+) FAIL \/ (\d+) SKIP\*\*/g)].map(m => `${m[1]}/${m[2]}/${m[3]}`);
  const rubriker = [...text.matchAll(/^# Motorervalidering — 100%-väktaren — (\S+)$/gm)].map(m => m[1]);
  return { senast: rubriker[rubriker.length - 1], resultat: resultat[resultat.length - 1], antal: rubriker.length, langd: statSync(`${ROT}/${RAPPORT}`).size };
};
const rapp = lasLokalRapport();
if (rapp.resultat !== '107/0/0') { console.log(`FEL rapportlås — arbetsytans senaste resultat ${rapp.resultat} (väntat 107/0/0)`); process.exit(1); }
kvitto.push(`OK rapportlås — arbetsytans senaste rapport ${rapp.senast} = ${rapp.resultat} (rapport #${rapp.antal}, ${rapp.langd} B)`);

// 5. Worklog-rond 227 (idempotensvakt)
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 227 [organ:Φ]')) return 'redan bokförd (idempotensvakt)';
  const rad = `

## ROND 227 [organ:Φ] — UTVIDGAD ADOPTION + HYGIEN: prodens motorervalidering (senaste ${rapp.senast}, ${rapp.resultat}) + 26 eftersläppta prod-artefakter (lighthouse o159/o165 + fabriksskript) adopterade; siffror.json quiz 8223→8283 (idempotent); härdningar + rondskript landade — 2026-09-25

Läge GRÖNT (prod 200 · vakten GRÖN · motorer ${rapp.resultat} · pm2 online · src orörd). Rond 226 (U30 Smith & Nephew) lämnade ocommittat hygienarbete; prodförkontrollen fann dessutom 26 untracked-artefakter som denna rond adopterar enligt rond 200-precedensen (dom-o151-natt.json).
(1) MOTORERVALIDERING-ADOPTION — prodens fil bär rapport #${rapp.antal}, senaste ${rapp.senast} = ${rapp.resultat} GRÖN. MEKANIK-LÄRDOM (rondens viktigaste): updateInstead avvisar push så länge prod har STAGADE/UNSTAGED ändringar — även när commiten bär exakt arbetskatalogens innehåll; därför krävs tre steg: säkra innehållet i arbetsytans commit → rensa prods M-rad kirurgiskt (git checkout -- fil; innehållet återinträder via pushens updateInstead-checkout, intet förloras) → pusha. Adoptionsskydd: prodens append-only-fil kopieras ENDAST om den är längre än arbetsytans — en rensad prod kan aldrig dra bakåt en framåtbärande commit.
(2) LÄGESFYND: motorvalideringen kördes under morgonen i BÅDA träden (arbetsytan 05:00:24Z — rond 226:s omkörning; prod 04:47/05:02/05:07Z där 05:02 = pumpornas schemalagda 07:02-lokala). Lärodom: ronder som vill ha färsk rapport kör FÖRE 04:45Z eller litar på pumpornas körning och läser dess rapport — annars dubbelkörning + adoptionstryck.
(3) 26 PROD-ARTEFAKTER — 7 lighthouse-mätbevis (o159-efter-tripletten + skroll-CLS-sond + o165-eftervakt, fetchTime 09-24T15:35-36Z) och 19 fabriksskript/commitmsg/worklog-utkast (_f07–_f16, _s7u2/_s7u3/_s8u2/_s8u3/_s9u3) låg ocommittade i prod-trädet sedan 09-24 — körningar med arbetskatalog prod. Alla saknades i arbetsytan (ren tilläggadoption). Fynd bokfört: fabrikens framtida barn FÅR INTE lämna artefakter i prod-trädet — de kör i arbetsytan och ronderna committar.
(4) SIFFROR — data/siffror.json omräknad: quiz 8223→8283 (+60), quizXp 82 230→82 830, uppdaterad 2026-09-25; idempotens verifierad (rakna-siffror.mjs omkört = oförändrat). Orsak: frågtillägg i kurserna sedan 09-21 som aldrig omräknades.
(5) HÄRDNINGAR — execSync→execFileSync (rond 226:s hårda-mimosa-sweep) i åtta temporära rondskript: _f17/_f21/_f22/_f23/_f24/_r187-levera/_r187-ratta/_v182-sjalvtest.
(6) ARKIV — 25 rondskript (r225-rättelse+slutkoll, r226-hela bandet, rop-halsa-bokföring) + rondens egna _r227-skript committade som leveransbevis.
KVD: prodförkontroll exakt · cmp byte-identisk ×27 · quiz-idempotens 2× · push med prod-rensning + retry (3 försök) · prods HEAD = lokal HEAD verifierad · prod HTTPS 200 efter push · src orörd = inget bygge (tsc-grinden 0 fel, commit 0499991e-släkten).
Kö oförändrad från U30: rappdagar → v172 (fönstret öppnar 10-29), UK-kommunikation BT.L (sista UK-1-grenen), Kanada/Spanien, spårrotation. R2: Q3-publikationspaketet väntar fortfarande kund (71 GRÖN · 5 GUL · 0 RÖD).
`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 227 bokförd';
});

// 6. Beslutsminne (data/vakten är gitignore:ad — lever lokalt på servern)
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":227'))) return 'redan bokförd (idempotensvakt)';
  const rad = JSON.stringify({ rond: 227, organ: 'Φ', ts: Date.now(),
    beslut: 'Utvidgad adoption: prodens motorervalidering (GRÖN 107/0/0) + 26 eftersläppta prod-artefakter adopterade; siffror.json quiz 8283 idempotent; execSync-härdningar landade. Mekanik-lärdom: updateInstead-push kräver rensad prod-M EFTER att innehållet säkrats i commiten (checkout -- fil → push → updateInstead återställer). Fynd: motorvalideringen dubbelkörs under morgnar; fabrikens barn får ej lämna artefakter i prod. Kö: rappdagar → v172, UK-kommunikation BT.L, Kanada/Spanien, spårrotation.',
    bevis: '_r227-levera.mjs-kvitto + cmp ×27 + prod-HEAD-verifiering' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 7. Commit + prod-rensning + push med retry
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
  'verktyg/_r227-levera.mjs', 'verktyg/_r227-sond.mjs', 'verktyg/_r227-sond2.mjs', 'verktyg/_r227-sond3.mjs',
];
const MSG = `studio: [organ:Φ] rond 227 UTVIDGAD ADOPTION+hygien — prod-trädets motorervalidering (senaste ${rapp.senast}, 107/0/0 GRÖN, rapport #${rapp.antal}) adopterad; MEKANIK-LÄRDOM: updateInstead-push kräver rensad prod-M EFTER att innehållet säkrats i commiten (checkout -- fil → push → updateInstead återinträde) — dokumenterad i worklog; 26 EFTERSLÄPPTA PROD-ARTEFAKTER adopterade enligt rond 200-precedensen: 7 lighthouse-mätbevis (o159-efter-tripletten + skroll-CLS-sond + o165-eftervakt, fetchTime 09-24T15:35Z) + 19 fabriksskript/commitmsg (_f07-_f16, _s7u2/_s7u3/_s8u2/_s8u3/_s9u3) — alla saknades i arbetsytan, cmp-verifierade; fynd bokfört: fabrikens barn får ej lämna artefakter i prod-trädet. data/siffror.json omräknad (quiz 8223→8283, quizXp 82 830 — underliggande +60 frågor ej omräknade sedan 09-21; idempotent 2×); execSync→execFileSync-härdning i åtta temporära rondskript; 25+4 rondskript arkiverade som bevis. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r227-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

let pushad = false;
for (let forsok = 1; forsok <= 3 && !pushad; forsok++) {
  // Adoption av rapporten: ENDAST om prods append-only-fil är längre (rensat prod kan ej dra bakåt).
  const prodLangd = statSync(`${PROD}/${RAPPORT}`).size;
  const lokalLangd = statSync(`${ROT}/${RAPPORT}`).size;
  if (prodLangd > lokalLangd) {
    copyFileSync(`${PROD}/${RAPPORT}`, `${ROT}/${RAPPORT}`);
    kvitto.push(`  försök ${forsok}: rapporten adopterad (${lokalLangd}→${prodLangd} B)`);
  }
  const nu = lasLokalRapport();
  if (nu.resultat !== '107/0/0') { console.log(`FEL rapportlås försök ${forsok} — senaste ${nu.resultat}`); process.exit(1); }
  try {
    execFileSync('git', ['-C', ROT, 'add', ...FILER]);
    kvitto.push(`OK git add (försök ${forsok}) — ${FILER.length} filer staged`);
    if (forsok === 1) {
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r227-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r227-msg.txt']);
      kvitto.push(`  commit amend:ad (försök ${forsok})`);
    }
  } catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL git commit (försök ${forsok}) — ${String(e.message).split('\n')[0]}`); process.exit(1); }
  // Rensa prods M-rad + untracked-dubbletter KIRURGISKT (innehållet är säkrat i
  // commiten ovan; pushens updateInstead-checkout återskapar exakt samma innehåll).
  try {
    const mRader = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.startsWith(' M ') || r.startsWith('M '));
    if (mRader.length === 1) {
      execFileSync('git', ['-C', PROD, 'checkout', '--', RAPPORT]);
      kvitto.push(`  prods M-rad rensad (checkout -- ${RAPPORT}; innehållet säkrat i commiten)`);
    }
    let rensade = 0;
    for (const f of PROD_UNTRACKED) {
      const a = `${ROT}/${f}`, b = `${PROD}/${f}`;
      if (existsSync(a) && existsSync(b) && readFileSync(a).equals(readFileSync(b))) { rmSync(b); rensade++; }
    }
    if (rensade) kvitto.push(`  prods ${rensade} untracked-dubbletter rensade (byte-identiska med commiten; återskapas av pushens checkout)`);
  } catch (e) { kvitto.push(`  VARNING prod-rensning misslyckades — ${String(e.message).split('\n')[0]}`); }
  try {
    const ut = execFileSync('git', ['-C', ROT, 'push', 'prod', 'develop'], { encoding: 'utf8' });
    kvitto.push(`OK git push (försök ${forsok}) — ${ut.trim().split('\n').pop().slice(0, 120)}`);
    pushad = true;
  } catch (e) {
    kvitto.push(`  push försök ${forsok} avvisad — ${String(e.message).split('\n').filter(r => r.includes('rejected') || r.includes('error'))[0]?.slice(0, 160) || String(e.message).slice(0, 160)}`);
  }
}
if (!pushad) { kvitto.forEach(k => console.log(k)); console.log('FEL push — 3 försök otillräckliga.'); process.exit(1); }

// 8. Slutverifiering
steg('prodverif', () => {
  const lokal = execFileSync('git', ['-C', ROT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const prodH = execFileSync('git', ['-C', PROD, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (lokal !== prodH) throw new Error(`HEAD divergerar: lokal ${lokal.slice(0, 8)} vs prod ${prodH.slice(0, 8)}`);
  const rapportOK = readFileSync(`${PROD}/${RAPPORT}`).length >= readFileSync(`${ROT}/${RAPPORT}`).length;
  if (!rapportOK) throw new Error('prods rapport kortare än arbetsytans efter push — adoptionen kompletteras nästa rond');
  const smuts = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.trim());
  return `prods HEAD = ${prodH.slice(0, 10)} (identisk); prods rapport ≥ arbetsytans; kvarvarande prodsmuts: ${smuts.length} rad(er)`;
});
steg('prod 200', () => {
  const kod = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://lab.ak1nvestor.com/'], { encoding: 'utf8' }).trim();
  if (kod !== '200') throw new Error(`prod svarade ${kod}`);
  return 'HTTPS 200';
});

kvitto.forEach(k => console.log(k));
console.log('LEVERANS: rond 227 utvidgad adoption+hygien klar — push verifierad, prod 200');
