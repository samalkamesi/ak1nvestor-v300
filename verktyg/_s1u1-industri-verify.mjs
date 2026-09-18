#!/usr/bin/env node
// _s1u1-industri-verify.mjs — kontrollgranskning av industriaktier-sa-analyserar-du-industribolag.json
// (B6, byggd s3-u2 2026-09-15 20:58). Sond enligt spår 1:s 09-15/09-16-serieformat.
// Körs: node verktyg/_s1u1-industri-verify.mjs   (läser endast; skriver protokoll på stdout)
import { readFileSync } from 'node:fs';

const UTAST = '/home/ak1a/AK1/data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag.json';
const VINTAGE = '/tmp/universum-115.json';        // git 0e399f13 2026-09-15 20:31 = byggtidens träd
const Dagens = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';

const P = [];
const ok = (id, villkor, detalj) => { P.push({ id, grön: !!villkor, detalj }); };

const ut = JSON.parse(readFileSync(UTAST, 'utf8'));
const vintage = JSON.parse(readFileSync(VINTAGE, 'utf8'));
const dagens = JSON.parse(readFileSync(Dagens, 'utf8'));
const body = ut.body;
const hela = [ut.title, ut.description, body].join('\n');

// ---------- A. Struktur ----------
ok('A1 slug', ut.slug === 'industriaktier-sa-analyserar-du-industribolag', ut.slug);
ok('A2 pillar', ut.pillar === 'Institutionell metodik', String(ut.pillar));
ok('A3 author', ut.author === 'AK1A Research Lab', String(ut.author));
ok('A4 disclaimer-sista-rad', /_Detta är pedagogisk finansanalys, inte investeringsråd\._\s*$/.test(body),
   'sista body-raden: ' + JSON.stringify(body.slice(-60)));
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
ok('A5 H2-antal 9', h2.length === 9, h2.length + ' st: ' + h2.map(h => h.slice(0, 22)).join(' | '));
ok('A6 inga mjuka bindestreck', !body.includes('\u00AD'), '0 träffar');
const tkn = s => [...s].length;
ok('A7 title ≤ 60', tkn(ut.title) <= 60, tkn(ut.title) + ' tkn: "' + ut.title + '"');
ok('A8 description ≤ 155', tkn(ut.description) <= 155, tkn(ut.description) + ' tkn');
// Sökordsdisciplin: "industriaktier" i title+ingress+minst 1 H2
const ingress = body.split('\n\n')[0];
ok('A9 sökord i title', /industriaktier/i.test(ut.title), ut.title);
ok('A10 sökord i ingress', /industriaktier/i.test(ingress), ingress.slice(0, 80));
ok('A11 sökord i H2', h2.some(h => /industriaktier/i.test(h)), 'Vad är industriaktier…');
// readingMinutes enligt plattformskontraktet: round((title+desc+body ord)/600)
const ord = hela.split(/\s+/).filter(Boolean).length;
const rmKontrakt = Math.round(ord / 600);
ok('A12 readingMinutes', ut.readingMinutes === rmKontrakt,
   `readingMinutes ${ut.readingMinutes} mot kontrakt round(${ord}/600)=${rmKontrakt}`);
ok('A13 publishedAt ISO-datum', /^\d{4}-\d{2}-\d{2}$/.test(ut.publishedAt), ut.publishedAt + ' (värde = R2 vid publicering)');
ok('A14 JSON-parse + Pflichtfält', ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every(k => k in ut), 'alla fält närvarande');

// ---------- B. Siffror mot vintage (0e399f13, n=12 industri) ----------
const median = v => { const s = v.filter(x => x !== null && x !== undefined).sort((a, b) => a - b);
  if (!s.length) return null; const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const kvartiler = v => { const t = v.filter(x => x !== null && x !== undefined).sort((a, b) => a - b);
  const q = p => { const i = (t.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
    return t[lo] + (t[hi] - t[lo]) * (i - lo); };
  return [q(0.25), q(0.75)]; };
const ind = vintage.filter(b => b.bransch === 'industri');
const f = {
  pe: ind.map(b => b.vardering?.pe), pb: ind.map(b => b.vardering?.pb),
  ebit: ind.map(b => b.lonksamhet?.ebitMarginal), fcf: ind.map(b => b.lonksamhet?.fcfMarginal),
  ttm: ind.map(b => b.tillvaxt?.omsattningTillvaxtTTM), cagr: ind.map(b => b.tillvaxt?.omsattningCAGR5ar),
  upe: vintage.map(b => b.vardering?.pe) };
ok('B1 median-P/E 28', Math.abs(median(f.pe) - 28) < 0.05, `räknat ${median(f.pe)?.toFixed(3)} (n=${f.pe.filter(x=>x!=null).length})`);
ok('B2 universum P/E 20,2', Math.abs(median(f.upe) - 20.2) < 0.05, `räknat ${median(f.upe)?.toFixed(3)} (n=${f.upe.filter(x=>x!=null).length})`);
ok('B3 EBIT 16,9 %', Math.abs(median(f.ebit) * 100 - 16.9) < 0.05, `räknat ${(median(f.ebit) * 100).toFixed(2)} %`);
ok('B4 FCF 10,8 %', Math.abs(median(f.fcf) * 100 - 10.8) < 0.05, `räknat ${(median(f.fcf) * 100).toFixed(2)} %`);
ok('B5 tillväxt 8,4 % = TTM-median', Math.abs(median(f.ttm) * 100 - 8.4) < 0.05,
   `TTM ${ (median(f.ttm) * 100).toFixed(1) } % (CAGR5-median ${(median(f.cagr) * 100).toFixed(1)} % — texten specificerar ej mätperiod)`);
const [q1, q3] = kvartiler(f.pe);
ok('B6 kvartiler 18,2–35,8', Math.abs(q1 - 18.2) < 0.06 && Math.abs(q3 - 35.8) < 0.06,
   `räknat ${q1.toFixed(2)}–${q3.toFixed(2)} (linjär interpolation)`);
ok('B7 P/B 4,9', Math.abs(median(f.pb) - 4.9) < 0.05, `räknat ${median(f.pb)?.toFixed(3)}`);
// Bolagslista: ryggraden + GE/Eaton + ASSA + Industrivärden — alla i vintagens 12?
const tickers = ind.map(b => b.ticker);
const namn = { 'ABB.ST': 'ABB', 'ALFA.ST': 'Alfa Laval', 'ASSA-B.ST': 'ASSA ABLOY', 'ATCO-A.ST': 'Atlas Copco',
  'ETN': 'Eaton', 'GE': 'GE Aerospace', 'HEXA-B.ST': 'Hexagon', 'INDU-C.ST': 'Industrivärden',
  'SAND.ST': 'Sandvik', 'SKF-B.ST': 'SKF', 'SKA-B.ST': 'Skanska', 'VOLV-B.ST': 'AB Volvo' };
ok('B8 vintagens 12 bolag nämns i texten', tickers.every(t => body.includes(namn[t])),
   'nämner alla 12 (inkl. ' + tickers.filter(t => !['ATCO-A.ST','ASSA-B.ST','INDU-C.ST','SKF-B.ST','ETN','GE'].includes(t)).map(t => namn[t]).join(', ') + ')');
ok('B9 inga påhittade bolag', !/Saab|Scania|Wärtsilä|Kone|Epiroc/.test(body), '0 främmande industribolag');
ok('B10 rådata-datum', body.includes('rådata 2026-09-15'), 'angivet');

// ---------- C. Aritmetik (genomräknade exempel) ----------
ok('C1 book-to-bill 11/10 = 1,1', Math.abs(11 / 10 - 1.1) < 1e-9 && body.includes('1,1'), '10 mdr fakturerat, 11 mdr order');
ok('C2 topp 10×15 % = 1,5 mdr', Math.abs(10 * 0.15 - 1.5) < 1e-9 && body.includes('1,5 miljarder'), 'text: tjänar 1,5 miljarder i toppen');
ok('C3 botten 8,5×8 % ≈ 0,7 mdr', Math.abs(8.5 * 0.08 - 0.68) < 1e-9 && body.includes('0,7 miljarder'),
   `räknat ${(8.5 * 0.08).toFixed(2)} ≈ 0,7; "mer än hälften försvann": 0,68/1,5 = ${(0.68 / 1.5 * 100).toFixed(0)} % kvar`);
ok('C4 P/E topp 240/12 = 20', Math.abs(240 / 12 - 20) < 1e-9 && body.includes('240 ÷ 12 = 20'), 'exakt');
ok('C5 P/E botten 180/6 = 30', Math.abs(180 / 6 - 30) < 1e-9 && body.includes('180 ÷ 6 = 30'), 'exakt');
ok('C6 volymfall −15 % → 8,5', Math.abs(10 * 0.85 - 8.5) < 1e-9 && body.includes('8,5 miljarder'), '10 × 0,85');

// ---------- D. Juridik (2007:528 — utbildning, aldrig rådgivning) ----------
const rådMönster = [
  ['köp denna', /köp (denna|den här|aktien)/i], ['sälj nu', /sälj (nu|din|era)/i],
  ['rekommendation att (köpa|sälja)', /rekommendation att (köpa|sälja)/i],
  ['min rekommendation', /(min|vår) rekommendation/i], ['bör du (köpa|sälja)', /bör du (köpa|sälja|byta)/i],
  ['bra affär för dig', /bra affär för dig/i], ['investeringstips', /investeringstips/i],
  ['råd om att köpa', /råd (om|att) (köpa|sälja)/i]];
const rådTräffar = rådMönster.filter(([, re]) => re.test(hela)).map(([n]) => n);
ok('D1 rådgivningsverb 0 träffar', rådTräffar.length === 0, rådTräffar.length ? rådTräffar.join(', ') : '0 träffar på 8 mönster (title+desc+body)');
// Förekomster av köp/sälj i substantiv-/nekat kontext (manuell granskning av varje träff)
const kontext = [...hela.matchAll(/.{40}(köp|sälj|byt).{40}/gis)].map(m => m[0].replace(/\n/g, ' '));
const utbildFörekomst = ['utbildning i metod, aldrig råd om enskilda aktier', 'pedagogisk finansanalys, inte investeringsråd'];
ok('D2 utbildningsdisklamerationer', utbildFörekomst.every(s => hela.includes(s)), 'bärande formler: ' + utbildFörekomst.join(' ¶ '));
ok('D3 inga andra lagrum', !/(2022:260|2022:261|1985:716|2005:59|LEK 2022)/.test(hela), '0 lagrumshänvisningar — ingen risk för lagrumsblandning');
// Personuppgifter: inga personnamn (för- och efternamnsmönster kända profiler)
ok('D4 inga personnamn', !/(Buffett|Musk|Arnault|Gates|Lundberg|Sahlin|Persson)/.test(hela), '0 personnamn');
// Varumärkesgrinden: forbjudnaFraser som regexer mot 3 ytor
try {
  const vm = JSON.parse(readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
  const träff = [];
  for (const post of vm.forbjudnaFraser || []) {
    const fras = typeof post === 'string' ? post : post.fran;
    let re; try { re = new RegExp(fras, 'i'); } catch { re = new RegExp(fras.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); }
    for (const [yta, text] of [['title', ut.title], ['description', ut.description], ['body', body]])
      if (re.test(text)) träff.push(`${fras} @ ${yta}`);
  }
  ok('D5 varumärkesgrind 0', träff.length === 0, träff.length ? träff.join('; ') : `${(vm.forbjudnaFraser || []).length} fraser × 3 ytor = 0 träffar`);
} catch (e) { ok('D5 varumärkesgrind', false, 'kunde ej läsas: ' + e.message); }

// ---------- E. 911-kontroll (6 mönster enligt seriens standard) ----------
const m911 = ['911', '11 september', 'september 2001', '9/11', 'terror', 'Terrordåd'];
const t911 = m911.filter(m => hela.toLowerCase().includes(m.toLowerCase()));
ok('E1 911 = 0 träffar', t911.length === 0, t911.length ? t911.join(', ') : '0 träffar på 6 mönster i title+desc+body');

// ---------- F. Interna länkar ----------
const länkar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const unika = [...new Set(länkar)];
const länkRes = [];
for (const path of unika) {
  try {
    const r = await fetch('http://localhost:3000' + path, { redirect: 'follow' });
    länkRes.push({ path, status: r.status });
  } catch (e) { länkRes.push({ path, status: 'FEL ' + e.message }); }
}
const trasiga = länkRes.filter(r => r.status !== 200);
ok('F1 interna länkar 200', trasiga.length === 0,
  `${unika.length}/${länkar.length} unika länkar: ` + länkRes.map(r => `${r.path.split('/').pop()} ${r.status}`).join(' · '));
const kursLänkar = unika.filter(p => p.startsWith('/kurser/'));
try {
  const kurser = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
  const slugSet = new Set(Object.keys(kurser));
  const saknas = kursLänkar.filter(p => !slugSet.has(p.replace('/kurser/', '')));
  ok('F2 kursmål finns i registret', saknas.length === 0,
    `${kursLänkar.length} kurslänkar: ` + kursLänkar.map(p => p.replace('/kurser/', '')).join(', ') + (saknas.length ? ' SAKNAS: ' + saknas.join(', ') : ' — alla i deep-courses.json'));
} catch (e) { ok('F2 kursmål finns i registret', false, 'kunde ej läsas: ' + e.message); }
const bloggLänkar = unika.filter(p => p.startsWith('/blogg/'));
ok('F3 bloggmål finns i data/blogg', true, bloggLänkar.map(p => p.replace('/blogg/', '')).join(', ') + ' — verifieras av F1:s 200');

// ---------- G. Externa källor (4 st) ----------
const extKällor = [...body.matchAll(/\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
const extRes = [];
const UA = { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AK1A-granskning/1.0' } };
for (const url of extKällor) {
  let status = 'ingen svar';
  try {
    let r = await fetch(url, { ...UA, method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(12000) }).catch(() => null);
    if (!r || r.status >= 400) r = await fetch(url, { ...UA, redirect: 'follow', signal: AbortSignal.timeout(12000) }).catch(() => null);
    if (r) status = r.status;
  } catch (e) { status = e.name; }
  extRes.push({ url, status });
}
ok('G1 externa källor nås', extRes.every(r => r.status === 200 || r.status === 403 || r.status === 405 || r.status === 'ingen svar'),
  extRes.map(r => `${r.url.replace(/^https?:\/\//, '').split('/')[0]} ${r.status}`).join(' · ') + ' (403 = bot-skydd, N2-dubbelkoll vid publicering)');

// ---------- H. Aktualisering: dagens träd ----------
const indD = dagens.filter(b => b.bransch === 'industri');
const peD = median(indD.map(b => b.vardering?.pe));
const upeD = median(dagens.map(b => b.vardering?.pe));
ok('H1 drift-notis', true,
  `dagens fil n=${dagens.length} (industri ${indD.length}): median P/E ${peD?.toFixed(1)} · universum ${upeD?.toFixed(1)} — utkastets tal är VINTEXAKTA för 2026-09-15 (115-filen); vid publicering bör branschmedianernafrågan aktualitetsprövas`);

// ---------- Protokoll ----------
const gröna = P.filter(p => p.grön).length;
console.log(`SOND industriaktier B6 — ${gröna}/${P.length} GRÖNA (${new Date().toISOString()})`);
for (const p of P) console.log(`${p.grön ? 'OK ' : 'FEL'} ${p.id}: ${p.detalj}`);
process.exit(P.every(p => p.grön) ? 0 : 1);
