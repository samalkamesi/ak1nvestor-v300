#!/usr/bin/env node
// ROND 102 — oberoende KVD: m9 #1 boerspsykologi-fallstugor · #4 branschmedianer-akm2 v2 · #5 forskningslaget-grona-av-100
import { readFileSync } from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const r = [];
const R = (grupp, namn, vante, faktiskt, okExtra = true) => r.push({ grupp, namn, vante: String(vante), faktiskt: String(faktiskt), dom: String(vante) === String(faktiskt) && okExtra ? 'OK' : 'FEL' });
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const num = (sv) => parseFloat(String(sv).replace('−', '-').replace(',', '.'));

const vv = JSON.parse(readFileSync(`${ROT}/data/rapporter/vagvalidering-SENASTE.json`, 'utf-8'));
const kt = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/korstabell-grund.json`, 'utf-8'));
const vm = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, 'utf-8'));
const ut = (f) => JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/m9-ko/${f}.json`, 'utf-8'));

// ═══ A. boerspsykologi-fallstugor-v1 ═══
const A = ut('boerspsykologi-fallstugor-v1');
R('A', 'totalt träffprocent', 52, vv.totalt.traffProcent);
R('A', 'totalt n dömda', 48, vv.totalt.nDomda);
R('A', 'osatt andel %', 20, vv.totalt.osattAndelProcent);
const hk = (h, k) => vv.perHorisontKlass.find((x) => x.horisont === h && x.klass === k);
const kortImp = hk('kort', 'impulsvåg');
R('A', 'kort/impulsvåg träff %', 100, kortImp?.traffProcent, kortImp?.nDomda === 2);
R('A', 'kort/impulsvåg n', 2, kortImp?.nDomda);
const mb = [hk('medellång', 'basbygge'), hk('mega', 'basbygge')].filter(Boolean);
const mbN = mb.reduce((s, x) => s + x.nDomda, 0);
const mbTraff = mb.reduce((s, x) => s + (x.traffProcent ?? 0) * x.nDomda / 100, 0);
R('A', 'medellång+mega/basbygge n', 12, mbN);
R('A', 'medellång+mega/basbygge träffar', 0, mbTraff);
R('A', 'P(2/2|slant) %', 25, 100 * 0.5 ** 2);
R('A', 'P(0/12|slant) % (avrundat)', '0,02', (100 * 0.5 ** 12).toLocaleString('sv-SE', { maximumFractionDigits: 2, minimumFractionDigits: 2 }));
const protokoll = 'osatt klass döms ALDRIG';
const mdText = readFileSync(`${ROT}/data/rapporter/vagvalidering-SENASTE.md`, 'utf-8');
R('A', 'protokollregeln i källan (ordagrant)', 'finns', mdText.includes(protokoll) ? 'finns' : 'saknas');
const aText = (A.titel + ' ' + A.ingress + ' ' + A.bodyMarkdown);
R('A', 'sannolikhetstal i bodyn (25 %)', 'finns', aText.includes('25 %') ? 'finns' : 'saknas');
R('A', 'sannolikhetstal i bodyn (0,02 %)', 'finns', aText.includes('0,02 %') ? 'finns' : 'saknas');

// ═══ B. branschmedianer-akm2-v2 ═══
const B = ut('branschmedianer-akm2-v2');
R('B', 'universum rader', 100, kt.rader.length);
const perBransch = {};
for (const rad of kt.rader) (perBransch[rad.bransch] ||= []).push(rad.akm2);
R('B', 'tio branscher', 10, Object.keys(perBransch).length);
R('B', 'alla branscher n=10', 'ja', Object.values(perBransch).every((a) => a.length === 10) ? 'ja' : 'nej');
const Bpåståenden = [ ['teknik', 61, 37, 78], ['konsument', 60.5, 19, 70], ['industri', 60, 51, 85], ['kommunikation', 60, 39, 68], ['energi', 58, 31, 77],
  ['hälsa', 56.5, 46, 66], ['fastighet', 50, 42, 60], ['tillväxt', 43, 25, 58], ['material', 42, 31, 79], ['finans', 41, 30, 80] ];
for (const [bransch, medV, minV, maxV] of Bpåståenden) {
  const nyckel = bransch === 'hälsa' ? 'halso' : bransch === 'tillväxt' ? 'tillvaxt' : bransch;
  const a = perBransch[nyckel] || [];
  R('B', `${bransch} median`, medV, median(a));
  R('B', `${bransch} spridning`, `${minV}–${maxV}`, `${Math.min(...a)}–${Math.max(...a)}`);
}

// ═══ C. forskningslaget-grona-av-100-v1 ═══
const C = ut('forskningslaget-grona-av-100-v1');
const statusRaknare = { gron: 0, gul: 0, rod: 0 };
for (const rad of kt.rader) statusRaknare[rad.status] = (statusRaknare[rad.status] || 0) + 1;
R('C', 'gröna', 7, statusRaknare.gron);
R('C', 'gula', 76, statusRaknare.gul);
R('C', 'röda', 17, statusRaknare.rod);
R('C', 'osatta', 0, kt.rader.filter((x) => x.status === 'osatt').length);
R('C', 'summa 100', 100, kt.rader.length);
R('C', 'andel gröna %', 7, Math.round(100 * statusRaknare.gron / kt.rader.length));
R('C', 'andel röda %', 17, Math.round(100 * statusRaknare.rod / kt.rader.length));
const grona = kt.rader.filter((x) => x.status === 'gron');
const topp = (tk, akm1, max, bransch, nyckel) => {
  const rad = kt.rader.find((x) => x.ticker === tk);
  const gronaIBranschen = grona.filter((x) => x.bransch === nyckel);
  const arToppen = gronaIBranschen.length && Math.max(...gronaIBranschen.map((x) => x.akm1Totalt)) === rad.akm1Totalt;
  R('C', `${tk} AKM1 ${akm1}/${max} grön ${bransch}`, `${akm1}/${max}`, `${rad.akm1Totalt}/${rad.akm1MaxMojligt}`, rad.status === 'gron' && arToppen);
};
topp('INDU-C.ST', 58.1, 67, 'industri', 'industri');
topp('NEM', 55.1, 71.1, 'material', 'material');
topp('INVE-B.ST', 54, 62.9, 'finans', 'finans');
const cText = (C.titel + ' ' + C.ingress + ' ' + C.bodyMarkdown);
const magertDef = cText.includes('magert') && cText.includes('rikt');
R('C', 'regim-termer (rikt/magert) i bodyn', 'finns', magertDef ? 'finns' : 'saknas');
const gronAndel = 100 * statusRaknare.gron / kt.rader.length;
R('C', 'regimslut magert (andel gröna < 8 %)', 'magert', gronAndel < 8 ? 'magert' : 'annat');

// ═══ Juridik + form: alla tre ═══
const fraser = vm.kontrolleraText?.forbjudnaFraser || [];
const glossor = ['köp ', 'sälj ', 'rekommendera', 'bör du', 'aktietips', 'kursmål', 'riskfri', 'säker vinst', 'garanterad avkastning', 'investera i denna'];
for (const [bokstav, U] of [['A', A], ['B', B], ['C', C]]) {
  const text = (U.titel + ' ' + U.ingress + ' ' + U.bodyMarkdown).toLowerCase();
  let ft = [];
  for (const f of fraser) { try { if (new RegExp(f.fran, 'i').test(text)) ft.push(f.fran); } catch {} }
  const gt = glossor.filter((g) => text.includes(g));
  const sist = U.bodyMarkdown.trimEnd().split('\n').pop();
  R(bokstav, 'forbjudnaFraser 0', 0, ft.length);
  R(bokstav, 'rådgivningsglossor 0', 0, gt.length);
  R(bokstav, 'disclaimer sist', 'ja', /utkast|AK1A-analy/i.test(sist) ? 'ja' : `nej: ${sist.slice(0, 40)}`);
  console.log(`[FORM ${bokstav}] titel ${U.titel.length} tkn · ingress ${U.ingress.length} tkn · body ${U.bodyMarkdown.length} tkn · omslag ${U.omslagUrl}`);
}

// ═══ Dom ═══
const fel = r.filter((x) => x.dom === 'FEL');
console.log(`\nKONTROLLER: ${r.length - fel.length}/${r.length} OK`);
for (const x of r) console.log(`  ${x.dom === 'OK' ? '✓' : '✗ FEL'} [${x.grupp}] ${x.namn}: väntat ${x.vante} · räknat ${x.faktiskt}`);
process.exit(fel.length ? 2 : 0);
