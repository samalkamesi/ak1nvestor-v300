// _s1u3-m9kassa-paket-kontroll.mjs — m9-3 kassaflodesanalys-101 FJÄRDE PASSET
// (aktualitet + FLYTTKLART-PAKET-grund), manifest auto-s1-1789952123920 s1-u3.
// Körs: node verktyg/_s1u3-m9kassa-paket-kontroll.mjs
// Läser: data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json,
//        data/varumarke.json, data/portfolj-system/bolagsunivers.json,
//        git-show f3f56268 (09-03-originalet av bolagsunivers) via barnprocess,
//        src/lib/larvag-karta.ts + data/blogg/v19-…json (statiska länkbevis),
//        http://localhost:3000 (levande länkar, loopback whitelistad).
// Skriver: /tmp/s1u3-paket-kontroll-utfall.json (maskinellt underlag).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const ROD = '/home/ak1a/AK1';
process.chdir(ROD);
const md5 = (p) => crypto.createHash('md5').update(readFileSync(p)).digest('hex');
const md5s = (s) => crypto.createHash('md5').update(s, 'utf8').digest('hex');
const kontroller = [];
const notiser = [];
const K = (namn, vante, faktiskt) =>
  kontroller.push({ namn, vante, faktiskt, ok: String(vante) === String(faktiskt) });
const N = (namn, vardet) => notiser.push({ namn, vardet });

// ── A. Källor & aktualitet ────────────────────────────────────────────────
const V1 = 'data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json';
const KALLA = 'data/portfolj-system/bolagsunivers.json';
const VARUMARKE = 'data/varumarke.json';
const v1 = JSON.parse(readFileSync(V1, 'utf8'));
const kvittoKallor = Object.fromEntries(v1.fabrik.kallor.map((k) => [k.fil, k]));

K('A1 varumarke.json md5 == kvitto (oförändrad även 09-21)', kvittoKallor[VARUMARKE].md5, md5(VARUMARKE));

const dagensUniversMd5 = md5(KALLA);
const dagensUnivers = JSON.parse(readFileSync(KALLA, 'utf8'));
K('A2 bolagsunivers: dagens fil SKILJER från v1-underlaget (rörelse sedan 09-03 → v2-spår)', true, dagensUniversMd5 !== kvittoKallor[KALLA].md5);
N('A2 dagens bolagsunivers', `md5 ${dagensUniversMd5} · ${dagensUnivers.length} bolag`);

// Original (09-03-vintagen, 100 bolag) återvunnet ur git — read-only:
const origRå = execFileSync('git', ['show', 'f3f56268:data/portfolj-system/bolagsunivers.json'], { cwd: ROD, maxBuffer: 128 * 1024 * 1024 }).toString('utf8');
const origMd5 = md5s(origRå);
K('A3 original bolagsunivers ur git f3f56268: md5 == v1-kvittot EXAKT', kvittoKallor[KALLA].md5, origMd5);
const univ = JSON.parse(origRå);
K('A4 original-universum: 100 bolag', 100, univ.length);
const hamtat = new Set(univ.map((b) => b.hamtat));
K('A5 samtliga rader hamtat=2026-09-03 (en vintage, redovisad i text)', 1, hamtat.size);

// ── B. Filintegritet & determinism ────────────────────────────────────────
const headRå = execFileSync('git', ['show', `HEAD:${V1}`], { cwd: ROD }).toString('utf8');
K('B1 utkastfilen == HEAD (working tree ren)', readFileSync(V1, 'utf8'), headRå);
const sistaCommit = execFileSync('git', ['log', '--format=%h', '-1', '--', V1], { cwd: ROD }).toString().trim();
K('B2 sista commit som rör filen = 5f659b52 (09-14 rättningen) — orörd sedan dess', '5f659b52', sistaCommit);

const bodyHela = String(v1.bodyMarkdown || '');
const kvittoStart = bodyHela.indexOf('## Granskningsunderlag — maskinens kvitto');
K('B3 kvitto-avsnitt påträffat i body (strippbart för paket)', true, kvittoStart >= 0);
const mallBody = kvittoStart >= 0 ? bodyHela.slice(0, kvittoStart).trim() : bodyHela;
// montera() i m9-fabrik.mjs: body = innehåll + kvitto, disclaimer bärs SIST i hela
// bodyn (efter kvittot). Paketet återlägger den sist på mall-bodyn.
const disclaimerRad = bodyHela.trim().split('\n').pop().trim();
K('B4 disclaimer: exakt sista rad i HELA bodyn, och EJ redan i strippad mall-body', true,
  /aldrig investeringsrådgivning \(lagen 2007:528\)/.test(disclaimerRad) && !mallBody.includes(disclaimerRad));

// ── C. Siffror — oberoende omräkning mot git-återvunna 09-03-originalet ───
const m = (v) => v != null && Number.isFinite(v);
const fcfM = univ.map((b) => b.lonksamhet?.fcfMarginal).filter(m);
const fcfY = univ.map((b) => b.vardering?.fcfYield).filter(m);
const pct = (x) => x * 100;
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
const sv = (x) => (Math.round(x * 10) / 10).toString(10).replace('.', ',');
const sv2 = (x) => (Math.round(x * 100) / 100).toFixed(2).replace('.', ',');

K('C1 FCF-marginal: n mätta', 92, fcfM.length);
K('C2 FCF-marginal: median', '10,8', sv(pct(median(fcfM))));
K('C3 FCF-avkastning: n mätta', 87, fcfY.length);
K('C4 FCF-avkastning: median', '3', sv(pct(median(fcfY))));

const par = univ.filter((b) => m(b.lonksamhet?.fcfMarginal) && m(b.lonksamhet?.nettoMarginal));
const parPos = par.filter((b) => b.lonksamhet.nettoMarginal > 0);
const konv = (b) => b.lonksamhet.fcfMarginal / b.lonksamhet.nettoMarginal;
K('C5 konverteringsgrad: n båda mätta + netto>0', 84, parPos.length);
K('C6 konverteringsgrad: median', '0,78', sv2(median(parPos.map(konv))));
K('C7 konverteringsgrad: antal > 1,0', 29, parPos.filter((b) => konv(b) > 1).length);

const antal = (f) => fcfY.filter(f).length;
const foerd = { over5: antal((x) => x > 0.05), m25: antal((x) => x > 0.02 && x <= 0.05), u2: antal((x) => x <= 0.02), neg: antal((x) => x < 0) };
K('C8 fördelning: >5 %', 26, foerd.over5);
K('C9 fördelning: 2–5 %', 28, foerd.m25);
K('C10 fördelning: <2 % (inkl negativa)', 33, foerd.u2);
K('C11 fördelning: negativa (delmängd av <2 %)', 9, foerd.neg);
K('C12 fördelning: summa 26+28+33 == n mätta (87)', fcfY.length, foerd.over5 + foerd.m25 + foerd.u2);
K('C13 texten bär delmängdsformuleringen "varav 9 negativa" (rättningen 5f659b52 lever)', true, /varav 9 negativa/.test(bodyHela));

// v1-mallens namnvisning (rond 101 dömd OK): källnamnet strippat på (publ)-
// varianter / inledande AB / slut-suffix — men v1 lämnade "Volvo Car AB (publ.)"
// ostruket. Acceptabel form = rånamnet ELLER någon känd strippform av det.
const namnformer = (namn) => {
  const former = new Set([namn]);
  const steg1 = namn.replace(/\s*\(publ\.?\)/i, '');
  former.add(steg1);
  former.add(steg1.replace(/^AB\s+/, ''));
  former.add(steg1.replace(/^AB\s+/, '').replace(/,?\s*(Inc|Corp|Corporation|PLC|plc|Ltd|Co|ASA|Aktiengesellschaft|AB)\.?$/i, '').replace(/,,$/, '').trim());
  former.add(namn.replace(/^AB\s+/, '').replace(/,?\s*(Inc|Corp|Corporation|PLC|plc|Ltd|Co|ASA|Aktiengesellschaft|AB)\.?$/i, ''));
  return former;
};
const branschVisning = (s) => (s === 'tillvaxt' ? 'tillväxt' : s);
const sortFCF = [...univ.filter((b) => m(b.lonksamhet?.fcfMarginal))].sort((a, b) => b.lonksamhet.fcfMarginal - a.lonksamhet.fcfMarginal);
const vanteTopp = ['Kinnevik|KINV-B.ST|tillväxt|65,6', 'Investment AB Öresund|ORES.ST|finans|63,9', 'Industrivärden|INDU-C.ST|industri|62,4', 'Prologis|PLD|fastighet|56', 'Netflix|NFLX|kommunikation|52,5'];
const vanteBotten = ['Aker BP|AKRBP.OL|energi|-3', 'Volvo Car AB (publ.)|VOLCAR-B.ST|konsument|-4,5', 'Polestar Automotive Holding UK|PSNY|tillväxt|-30,8', 'RWE|RWE.DE|energi|-69,6', 'Castellum|CAST.ST|fastighet|-72,9'];
sortFCF.slice(0, 5).forEach((b, i) =>
  K(`C14 topp${i + 1} FCF-marginal (namnform+ticker+bransch+värde)`, vanteTopp[i],
    namnformer(b.namn).has(vanteTopp[i].split('|')[0]) ? `${vanteTopp[i].split('|')[0]}|${b.ticker}|${branschVisning(b.bransch)}|${sv(pct(b.lonksamhet.fcfMarginal))}` : `NAMNFORM SAKNAS: ${b.namn}`));
sortFCF.slice(-5).forEach((b, i) =>
  K(`C15 botten${i + 1} FCF-marginal (namnform+ticker+bransch+värde)`, vanteBotten[i],
    namnformer(b.namn).has(vanteBotten[i].split('|')[0]) ? `${vanteBotten[i].split('|')[0]}|${b.ticker}|${branschVisning(b.bransch)}|${sv(pct(b.lonksamhet.fcfMarginal))}` : `NAMNFORM SAKNAS: ${b.namn}`));

const sortKonv = [...parPos].sort((a, b) => konv(b) - konv(a));
const vanteKonv = ['Telia Company|TELIA.ST|4,26', 'Fabege|FABG.ST|4,09', 'Vår Energi|VAR.OL|3,57'];
sortKonv.slice(0, 3).forEach((b, i) =>
  K(`C16 topp${i + 1} konverteringsgrad (namnform+ticker+värde)`, vanteKonv[i],
    namnformer(b.namn).has(vanteKonv[i].split('|')[0]) ? `${vanteKonv[i].split('|')[0]}|${b.ticker}|${sv2(konv(b))}` : `NAMNFORM SAKNAS: ${b.namn}`));

// Ingressens tal (publicerbar yta):
const ing = v1.ingress;
K('C17 ingress: 92/10,8 + 87/3 + 84 + datum', true, /92 av 100 bolag \(median 10,8 %\).*87 \(median 3 %\).*för 84\. Underlag hämtat 2026-09-03/.test(ing));

// ── D. Juridik (2007:528) — kontrolleraText-EXAKT spegel ur varumarke.ts ──
// Algoritmen (src/lib/varumarke.ts:141): RegExp(fran, 'giu'), exec-loop,
// FEL/VARNING per allvar; proYta-ej aktuellt här.
const raa = JSON.parse(readFileSync(VARUMARKE, 'utf8'));
const kontrolleraText = (text) => {
  const fel = [], varningar = [];
  for (const f of raa.forbjudnaFraser) {
    const re = new RegExp(f.fran, 'giu');
    re.lastIndex = 0;
    let t;
    while ((t = re.exec(text)) !== null) {
      (f.allvar === 'FEL' ? fel : varningar).push({ fras: t[0], index: t.index });
    }
  }
  return { fel, varningar };
};
const pubYta = `${v1.titel}\n${ing}\n${mallBody}`;
const rHel = kontrolleraText(bodyHela);
const rPub = kontrolleraText(pubYta);
K('D1 kontrolleraText HEL body (inkl kvitto): 0 FEL', 0, rHel.fel.length);
K('D2 kontrolleraText HEL body (inkl kvitto): 0 VARNING', 0, rHel.varningar.length);
K('D3 kontrolleraText PUBLICERBAR yta (titel+ingress+mall-body): 0 FEL', 0, rPub.fel.length);
K('D4 kontrolleraText PUBLICERBAR yta: 0 VARNING', 0, rPub.varningar.length);
N('D antal fraser i grinden', raa.forbjudnaFraser.length);

const glossMönster = [
  [/\bköpa?\b|\bköper\b/i, 'köp-formulering'],
  [/\bsälja?\b|\nsälj/i, 'sälj-formulering'],
  [/rekommender/i, 'rekommendera'],
  [/bör du/i, 'bör du'],
  [/aktietips/i, 'aktietips'],
  [/garanterad avkastning/i, 'garanterad avkastning'],
  [/bra affär för dig/i, 'bra affär för dig'],
];
K('D5 rådgivningsglossor på publicerbar yta: 0 träffar', 0, glossMönster.filter(([re]) => re.test(pubYta)).length);
K('D6 "inte en värdering" (inledande ram) finns', true, /inte en värdering/i.test(pubYta));
K('D7 negerad disclaimer exakt sist', true, /aldrig investeringsrådgivning \(lagen 2007:528\)\.?_?$/.test(bodyHela.trim()));
K('D8 endast 2007:528 — inga konsumenträttslagrum (blandningsgrinden)', 0, (bodyHela.match(/2022:260|2022:261|1985:716|2005:59|LEK 2022/g) || []).length);

// ── E. 911-referenser: sex mönster på HELA utkastet ───────────────────────
const råFilen = readFileSync(V1, 'utf8');
const m911 = ['911', '11 september', 'september 2001', '9/11', 'terror', 'terrordåd'];
const t911 = m911.filter((p) => råFilen.toLowerCase().includes(p.toLowerCase()));
K('E1 911-referenser (6 mönster, hela filen): 0', 0, t911.length);

// ── F. Länkar: 3 interna — statiskt bevis + HTTP 200 ──────────────────────
const lankar = [
  { url: '/kurser/km-003-kassaflodesanalysen', statisk: 'src/lib/larvag-karta.ts innehåller km-003-kassaflodesanalysen' },
  { url: '/forskningsbiblioteket', statisk: 'src/app/(huvud)/forskningsbiblioteket finns' },
  { url: '/blogg/v19-kapitalforbranning-analys', statisk: 'data/blogg/v19-kapitalforbranning-analys.json finns' },
];
K('F1 statiskt: km-003 i larvag-karta.ts', true, readFileSync('src/lib/larvag-karta.ts', 'utf8').includes('km-003-kassaflodesanalysen'));
K('F2 statiskt: forskningsbiblioteket-rutten', true, existsSync('src/app/(huvud)/forskningsbiblioteket'));
K('F3 statiskt: v19-bloggfilen', true, existsSync('data/blogg/v19-kapitalforbranning-analys.json'));
const httpResultat = [];
for (const l of lankar) {
  try {
    const svaret = await fetch(`http://localhost:3000${l.url}`, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    httpResultat.push({ url: l.url, status: svaret.status });
    K(`F-http ${l.url} = 200`, 200, svaret.status);
  } catch (e) {
    httpResultat.push({ url: l.url, fel: String(e) });
    K(`F-http ${l.url} = 200`, 200, 'FEL');
  }
}

// ── G. Struktur & paketgrund ──────────────────────────────────────────────
K('G1 mall-body "##"-rubriker (krav ≥2)', 6, (mallBody.match(/^## /gm) || []).length);
K('G2 mall-body ≥ 800 tecken', true, mallBody.length >= 800);
K('G3 titel bär "(utkast)" (kö-formen; paketet tar bort)', true, /\(utkast\)/.test(v1.titel));
K('G4 slug', 'kassaflodesanalys-101', v1.slug);
K('G5 version 1 · status utkast (kunden äger statusbytet)', 'utkast', v1.status);

// ── Rapport ───────────────────────────────────────────────────────────────
const fel = kontroller.filter((k) => !k.ok);
console.log(`KONTROLL: ${kontroller.length} kontroller · ${fel.length} FEL · ${notiser.length} notiser`);
for (const k of kontroller) console.log(`${k.ok ? '✓' : '✗'} ${k.namn}\n    vante: ${k.vante}\n    faktiskt: ${typeof k.faktiskt === 'string' && k.faktiskt.length > 120 ? k.faktiskt.slice(0, 120) + '…' : k.faktiskt}`);
for (const n of notiser) console.log(`ℹ ${n.namn}: ${n.vardet}`);
writeFileSync('/tmp/s1u3-paket-kontroll-utfall.json', JSON.stringify({
  kontroller, fel: fel.length, notiser, httpResultat,
  mallBodyLängd: mallBody.length, disclaimerRad,
}, null, 2));
console.log('\nUtfall → /tmp/s1u3-paket-kontroll-utfall.json');
process.exit(fel.length ? 1 : 0);
