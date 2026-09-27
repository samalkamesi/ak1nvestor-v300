// _v182-emottag.mjs — v167-emottag: fragmentkontroll + atomär integration i public/deep-courses.json
// Lägen:  node _v182-emottag.mjs status     — kontrollera fragment på disk, uppdatera V167-GRANSKNING.md (VID LEVERANS)
//         node _v182-emottag.mjs integrera  — 20/20 GRÖNA krävs: append + formatvakt + KVD + rapport (commit gör huvudagenten)
// Kontrakt: data/forskning/KURS-FAS2/DESIGN-v167-ovningskapitel.md
// v170-kurer (KVD-läxorna rond 180/182): KURSBLOCK byggs om per körning (senaste mätningen
// gäller — gamla block ERSÄTTS, appendades förr vilket lämnade RÖDA pre-kurka-block kvar) ·
// levererad-tidsstämpel ur fragmentets mtime (väntar-listans dubbelarbetes-synlighet) ·
// STÄNGDVAKT: status/integrera vägrar röra en stängd vågs granskningsfil (bevisbevarande).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROT = process.env.EMOTTAG_ROT || '/home/ak1a/agent/ak1'; // sandbox-overrid för självtest
const FRAGDIR = ROT + '/data/forskning/KURS-FAS2/v167-fragment';
const DC = ROT + '/public/deep-courses.json';
const GRANSK = ROT + '/data/forskning/KURS-FAS2/V167-GRANSKNING.md';

const KURSER = [
  ['v01-forsaljningstillvaxt', 'indikatorer-01-10.md', '## V01 — Försäljningstillväxt (Tillväxt)', 12],
  ['v02-arr-tillvaxt', 'indikatorer-01-10.md', '## V02 — ARR-tillväxt (Tillväxt)', 12],
  ['v03-intaktsdiversifiering', 'indikatorer-01-10.md', '## V03 — Intäktsdiversifiering (Tillväxt)', 12],
  ['v04-ps', 'indikatorer-01-10.md', '## V04 — P/S, pris/omsättning (Värdering)', 12],
  ['v05-pb', 'indikatorer-01-10.md', '## V05 — P/B, pris/eget kapital (Värdering)', 12],
  ['v06-ev-ebitda', 'indikatorer-01-10.md', '## V06 — EV/EBITDA (Värdering)', 12],
  ['v07-bruttomarginal', 'indikatorer-01-10.md', '## V07 — Bruttomarginal (Lönsamhet)', 12],
  ['v08-ebitda-marginal', 'indikatorer-01-10.md', '## V08 — EBITDA-marginal (Lönsamhet)', 12],
  ['v09-roe', 'indikatorer-01-10.md', '## V09 — ROE, avkastning på eget kapital (Lönsamhet)', 12],
  ['v10-skuldsattningsgrad', 'indikatorer-01-10.md', '## V10 — Skuldsättningsgrad (Stabilitet)', 12],
  ['v11-likviditet', 'indikatorer-11-20.md', '## V11 — Likviditet · Stabilitet', 12],
  ['v12-intaktsstabilitet', 'indikatorer-11-20.md', '## V12 — Intäktsstabilitet · Stabilitet', 12],
  ['v13-patent-ip', 'indikatorer-11-20.md', '## V13 — Patent & IP · Moat', 12],
  ['v14-varumarke', 'indikatorer-11-20.md', '## V14 — Varumärke & Kundlojalitet · Moat', 12],
  ['v15-natverkseffekter', 'indikatorer-11-20.md', '## V15 — Nätverkseffekter · Moat', 12],
  ['v16-produktlanseringar', 'indikatorer-11-20.md', '## V16 — Produktlanseringar · Katalysator', 12],
  ['v17-avtal-partnerskap', 'indikatorer-11-20.md', '## V17 — Avtal & Partnerskap · Katalysator', 12],
  ['v18-regulatoriska', 'indikatorer-11-20.md', '## V18 — Regulatoriska katalysatorer · Katalysator', 12],
  ['v19-kapitalforbranning', 'indikatorer-11-20.md', '## V19 — Kassatäckning — nyemissionsrisk · Risk & kapitalstruktur (KRITISK)', 14],
  ['v20-aterekop-egna-aktier', 'indikatorer-11-20.md', '## V20 — Återköp av egna aktier · Risk & kapitalstruktur', 12],
];

const JURIDIK = 'Utbildningsmaterial — beskriver hur metoden läser och räknar; inga investeringsråd (2007:528).';
const FORBJUDNA_LAGRUM = ['2022:260', '2022:261', '1985:716', '2022:482', '2005:59'];
const RADFRASER = ['du bör köpa', 'du bör sälja', 'rekommenderar köp', 'rekommenderar sälj', 'köp denna aktie', 'sälj denna aktie', 'investera i denna aktie', 'mina rekommendationer är att köpa'];

function underlagsSektion(fil, rubrik) {
  const txt = readFileSync(ROT + '/data/kurser/fas2-djup/' + fil, 'utf8');
  const start = txt.indexOf(rubrik);
  if (start < 0) throw new Error('sektion saknas: ' + rubrik);
  const resten = txt.slice(start + rubrik.length);
  const nastH2 = resten.indexOf('\n## ');
  return (nastH2 < 0 ? resten : resten.slice(0, nastH2));
}
function stycke(txt, fran, till) {
  const a = txt.indexOf(fran);
  if (a < 0) return '';
  const b = txt.indexOf(till, a);
  return b < 0 ? txt.slice(a) : txt.slice(a, b);
}
// sektionsmarkörer: del 1 (indikatorer-01-10) bär "### a)–f)", del 2 (11-20) bär utskrivna rubriker
function markorerFor(fil) {
  return fil.includes('11-20')
    ? { d: '### Räkneexempel', e: '### Fallgropar', f: '### Övningar med facit' }
    : { d: '### d)', e: '### e)', f: '### f)' };
}
function talMarkorer(text) {
  // normaliserade tal: "1 952,21" → "1952.21" ; "44 %" → "44" ; listnummer/meningspunkt "1."/"1 350." rensas
  const rå = text.match(/\d[\d\s\u00a0]*[.,]?\d*/g) || [];
  return [...new Set(rå.map(t => t.replace(/[\s\u00a0]/g, '').replace(',', '.').replace(/\.$/, '')).filter(t => t.length))];
}
function forbjudnaMonster() {
  // v166:s bevisade varumärkesgrind (rond 175, 24 kurser GRÖNA): forbjudnaFraser[].fran som regex.
  // Undantag: \bkunder\b (allvar VARNING, motiv A8) är en YTA-regel för elev-/marknadstexter —
  // i kursinnehåll om bolags kundbas är "kunder" legitim domänterminologi (samma logik som
  // pro-ytornas B2B-undantag i vakten). Övriga 25 innehållsregler gäller fullt ut.
  try {
    const v = JSON.parse(readFileSync(ROT + '/data/varumarke.json', 'utf8'));
    return (v.forbjudnaFraser || []).map(f => f.fran).filter(m => m && m !== '\\bkunder\\b');
  } catch { return []; }
}
const VM = forbjudnaMonster();

function kontrolleraFragment(slug, fil, rubrik, kapNum) {
  const p = FRAGDIR + '/' + slug + '.json';
  const P = [], F = [];
  const ok = (namn) => P.push(namn);
  const fel = (namn) => F.push(namn);
  if (!existsSync(p)) return { slug, saknas: true, P, F };
  const levereradTs = new Date(statSync(p).mtime).toISOString().slice(0, 16).replace('T', ' ');
  let f;
  try { f = JSON.parse(readFileSync(p, 'utf8')); } catch (e) { fel('JSON-parse: ' + e.message.slice(0, 60)); return { slug, P, F }; }
  if (f.slug !== slug) fel('slug-match (' + f.slug + ')');
  const k = f.kapitel;
  if (!k) { fel('kapitel-objekt saknas'); return { slug, P, F }; }
  k.num === kapNum ? ok('num=' + kapNum) : fel('num=' + k.num + ' väntat ' + kapNum);
  (k.minutes >= 7 && k.minutes <= 9) ? ok('minutes=' + k.minutes) : fel('minutes=' + k.minutes);
  k.title === 'Från teorin till egen räkning' ? ok('title') : fel('title: ' + k.title);
  typeof k.intro === 'string' && k.intro.length > 40 ? ok('intro') : fel('intro');
  // blockstruktur
  const typer = (k.blocks || []).map(b => b.type);
  JSON.stringify(typer) === JSON.stringify(['text', 'utmaning', 'text', 'text', 'insikt']) ? ok('blockstruktur 5') : fel('blockstruktur: ' + typer.join(','));
  (k.blocks || []).forEach((b, i) => { if (!b.content || b.content.length < 50) fel('block ' + (i + 1) + ' content för kort'); });
  // quiz
  const q = k.quiz;
  Array.isArray(q) && q.length === 3 ? ok('quiz=3') : fel('quiz=' + (q ? q.length : 'saknas'));
  if (Array.isArray(q)) {
    q.forEach((x, i) => {
      if (!Array.isArray(x.alternativ) || x.alternativ.length !== 4 || !x.alternativ.every(a => typeof a === 'string' && a.length)) fel('quiz' + (i + 1) + ' alternativ[4]');
      if (!(Number.isInteger(x.ratt) && x.ratt >= 0 && x.ratt <= 3)) fel('quiz' + (i + 1) + ' ratt=' + x.ratt);
      if (!x.tips || !x.tips.length) fel('quiz' + (i + 1) + ' tips');
    });
    const r = q.map(x => x.ratt);
    new Set(r).size === 3 ? ok('unika ratt ' + r.join(',')) : fel('ratt ej unika: ' + r.join(','));
  }
  // deklarationer + juridik (allt = hela kapiteltexten inkl quiz — grindarna testar allt eleven ser)
  const allt = [k.intro, ...(k.blocks || []).map(b => b.content), ...((k.quiz || []).map(q => [q.q, ...(q.alternativ || []), q.tips].join(' ')))].join('\n');
  allt.includes(JURIDIK) ? ok('juridikdeklaration ordagrant') : fel('juridikdeklaration saknas/avviker');
  // bolag-deklaration: del 1 använder NorrTeknik (konstruerat), del 2 andra låtsasbolag (påhittat) — underlagets egen deklaration överförs (design punkt 6)
  /är ett (konstruerat|påhittat) bolag/i.test(allt) ? ok('bolag-deklaration (konstruerat/påhittat)') : fel('bolag-deklaration saknas');
  const lg = FORBJUDNA_LAGRUM.filter(l => allt.includes(l));
  lg.length === 0 ? ok('lagrum endast 2007:528') : fel('förbjudna lagrum: ' + lg.join(','));
  const rf = RADFRASER.filter(x => allt.toLowerCase().includes(x));
  rf.length === 0 ? ok('rådgivningsfraser 0') : fel('rådgivningsfraser: ' + rf.join(','));
  // varumärkesgrind — v166:s mönster (negerings-lookbehind mot "inte/ej/aldrig..."-formuleringar)
  const vmTräff = VM.filter(m => { try { return new RegExp('(?<!inte |ej |aldrig |ingen |inga |utan |varken |icke )' + m, 'giu').test(allt); } catch { return false; } });
  vmTräff.length === 0 ? ok('varumärkesgrind 0 (' + VM.length + ' mönster)') : fel('varumärke: ' + vmTräff.slice(0, 3).join(','));
  // talmarkörer d+f ≥ 80 %
  const sek = underlagsSektion(fil, rubrik);
  const M = markorerFor(fil);
  const dSek = stycke(sek, M.d, M.e);
  const fSek = stycke(sek, M.f, '\n## ');
  const källaTal = talMarkorer(dSek + ' ' + fSek).filter(t => parseFloat(t) >= 2 || t.includes('.'));
  const mål = talMarkorer([k.blocks[0].content, k.blocks[2].content].join(' '));
  const träff = källaTal.filter(t => mål.includes(t));
  const andel = källaTal.length ? träff.length / källaTal.length : 0;
  andel >= 0.8 ? ok('talmarkörer ' + träff.length + '/' + källaTal.length + ' = ' + Math.round(andel * 100) + '%') : fel('talmarkörer ' + träff.length + '/' + källaTal.length + ' = ' + Math.round(andel * 100) + '%');
  return { slug, P, F, k, andel, källaTal: källaTal.length, levereradTs };
}

function uppdateraGranskningsfil(resultat) {
  let g = readFileSync(GRANSK, 'utf8');
  const levererade = resultat.filter(r => !r.saknas);
  const gröna = levererade.filter(r => r.F.length === 0);
  const väntar = resultat.filter(r => r.saknas).map(r => r.slug);
  const läge = '## LÄGE: ' + levererade.length + ' levererade · ' + väntar.length + ' väntar' + (väntar.length ? ': ' + väntar.join(', ') : '');
  g = g.replace(/^## LÄGE:.*$/m, läge);
  const pass = levererade.reduce((s, r) => s + r.P.length, 0);
  const feltot = levererade.reduce((s, r) => s + r.F.length, 0);
  g = g.replace(/^## SAMMANFATTNING:.*$/m, '## SAMMANFATTNING: ' + pass + ' PASS · ' + feltot + ' FEL' + (levererade.length === 0 ? ' (vågen inleds)' : ''));
  // v170-kuren: KURSBLOCK byggs om från grunden varje körning — senaste mätningen gäller.
  // (Förra logiken hoppade över kurser som redan hade block ("idempotent") — exakt så låg
  // block från mätningar FÖRE mätkurkorna kvar och skilde sig från slutläget.)
  const block = levererade.map(r => {
    const status = r.F.length === 0 ? 'GRÖN' : 'RÖD';
    const rader = ['### ' + r.slug + ' — ' + status + ' (' + r.P.length + ' PASS · ' + r.F.length + ' FEL)' + (r.levereradTs ? ' · levererad ' + r.levereradTs : '')];
    r.P.forEach(x => rader.push('✓ ' + x));
    r.F.forEach(x => rader.push('✗ ' + x));
    return rader.join('\n');
  }).join('\n\n');
  const sektion = '## KURSBLOCK\n\n' + block + '\n';
  g = g.includes('## KURSBLOCK')
    ? g.replace(/## KURSBLOCK[\s\S]*$/, sektion) // KURSBLOCK är filens sista sektion (v167-arkitekturen)
    : g + '\n' + sektion;
  writeFileSync(GRANSK, g);
  return { levererade: levererade.length, gröna: gröna.length, pass, feltot };
}

// ---------- STÄNGDVAKT (v170): en stängd vågs granskningsfil är arkiverat bevis ----------
function vagStangd() {
  const g = readFileSync(GRANSK, 'utf8');
  return /^## SAMMANFATTNING:.*STÄNGD/m.test(g);
}

// ---------- STATUS ----------
if (process.argv[2] === 'status') {
  if (vagStangd()) { console.log('VÅG STÄNGD — emottaget arkiverat: granskningsfilen lämnas orörd (bevisbevarande, v170-kur)'); process.exit(0); }
  const resultat = KURSER.map(([slug, fil, rubrik, kapNum]) => kontrolleraFragment(slug, fil, rubrik, kapNum));
  const läget = uppdateraGranskningsfil(resultat);
  console.log('v167-LÄGE: ' + läget.levererade + '/20 levererade · ' + läget.gröna + ' GRÖNA · SAMMANFATTNING ' + läget.pass + ' PASS · ' + läget.feltot + ' FEL');
  resultat.filter(r => !r.saknas && r.F.length).forEach(r => console.log('RÖD ' + r.slug + ': ' + r.F.join(' · ')));
  process.exit(0);
}

// ---------- INTEGRERA ----------
if (process.argv[2] === 'integrera') {
  if (vagStangd()) { console.log('VÅG STÄNGD — integrera vägrar: kapitlen är redan appendade (dubbelappend-skydd, v170-kur)'); process.exit(1); }
  const resultat = KURSER.map(([slug, fil, rubrik, kapNum]) => kontrolleraFragment(slug, fil, rubrik, kapNum));
  const saknade = resultat.filter(r => r.saknas);
  const röda = resultat.filter(r => !r.saknas && r.F.length);
  if (saknade.length || röda.length) {
    console.log('INTEGRATION VÄGRAR: ' + saknade.length + ' saknade · ' + röda.length + ' röda');
    saknade.forEach(r => console.log('  saknas: ' + r.slug));
    röda.forEach(r => console.log('  röd: ' + r.slug + ' — ' + r.F.join(' · ')));
    process.exit(1);
  }
  // formatvakt: rondtrip av ORIGINAL
  const original = readFileSync(DC, 'utf8');
  const dc = JSON.parse(original);
  const slutecken = original.endsWith('\n') ? '\n' : '';
  const rondtrip = JSON.stringify(dc, null, 2) + slutecken;
  if (rondtrip !== original) { console.log('FORMATVAKT RÖD: rondtrip av original avviker (' + rondtrip.length + ' vs ' + original.length + ')'); process.exit(1); }
  console.log('FORMATVAKT GRÖN: rondtrip bitidentisk (' + original.length + ' tecken)');
  // HEAD-referens (append-only-mätning; blir commit~1 efter commit)
  let head = null;
  try { head = JSON.parse(execSync('git show HEAD:public/deep-courses.json', { cwd: ROT, maxBuffer: 1 << 28 }).toString()); } catch (e) { console.log('HEAD-läsning misslyckades: ' + e.message.slice(0, 80)); }
  // append per kurs
  const rapport = [];
  for (const r of resultat) {
    const c = dc[r.slug];
    const kapFöre = c.chapters.length;
    c.chapters.push(r.k);
    c.chapterCount = c.chapters.length;
    c.totalMinutes = c.chapters.reduce((s, k) => s + k.minutes, 0);
    // append-only + chapters_list orörd mot HEAD
    let appendOK = 'HEAD ej jämförd';
    if (head) {
      const h = head[r.slug];
      const gamla = JSON.stringify(c.chapters.slice(0, kapFöre)) === JSON.stringify(h.chapters);
      const cl = JSON.stringify(c.chapters_list) === JSON.stringify(h.chapters_list);
      const ovrigt = Object.keys(c).every(nyckel => {
        if (['chapters', 'chapterCount', 'totalMinutes'].includes(nyckel)) return true;
        return JSON.stringify(c[nyckel]) === JSON.stringify(h[nyckel]);
      });
      appendOK = (gamla && cl && ovrigt) ? 'GRÖN (kap 1–' + kapFöre + ' bit-identiska · chapters_list orörd · övriga fält orörda)' : 'RÖD';
    }
    rapport.push(r.slug + ': kap ' + kapFöre + '→' + c.chapters.length + ' · chapterCount ' + c.chapterCount + ' · totalMinutes ' + c.totalMinutes + ' · append-only ' + appendOK);
  }
  // övriga 475 kurser orörda
  let ovrigaOK = 'HEAD ej jämförd';
  if (head) {
    const ovriga = Object.keys(dc).filter(s => !KURSER.some(k => k[0] === s));
    const diff = ovriga.filter(s => JSON.stringify(dc[s]) !== JSON.stringify(head[s]));
    ovrigaOK = diff.length === 0 ? 'GRÖN (475 orörda)' : 'RÖD: ' + diff.slice(0, 5).join(',');
  }
  // skriv under formatvakt
  const ny = JSON.stringify(dc, null, 2) + slutecken;
  JSON.parse(ny); // parse-bar
  writeFileSync(DC, ny);
  console.log('SKRIVEN: ' + DC + ' · ' + original.length + ' → ' + ny.length + ' tecken');
  console.log('övriga kurser: ' + ovrigaOK);
  rapport.forEach(r => console.log(r));
  writeFileSync(ROT + '/verktyg/_v182-integrationsrapport.txt', 'v167-integration ' + new Date().toISOString() + '\nformatvakt: rondtrip GRÖN ' + original.length + '\n' + rapport.join('\n') + '\növriga: ' + ovrigaOK + '\n');
  console.log('NÄSTA STEG (huvudagenten): git add public/deep-courses.json && git commit (KVD-rapporten ovan är beviset) && push');
  process.exit(0);
}

console.log('användning: node _v182-emottag.mjs status|integrera');
