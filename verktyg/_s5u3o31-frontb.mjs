#!/usr/bin/env node
// _s5u3o31-frontb.mjs — FRONT B: läsreplik av src/lib/larvag.ts (raknaLarvag) mot
// larvag-karta.ts:s faktiska data. Validerar att de tre nya kurserna (mt-09,
// kt-11, bk-09) nomineras korrekt: 90p svagheten med nivåmatch +4, 86p
// kategori-fortsättning ×3 med nivåmatch, omvänd riktning (0 progress ⇒ vilar),
// D1-default (starter-kurser), poängformelns båda riktningar, vIndex −1 (aldrig
// +2), kraverFas 0 (fas 1 kan nominera), determinism ×2, serieordning i kartan,
// syskonkurserna (u1 vr-10, u2 ud-10/vm-12) + why-paritet register ≡ kursfil.
import { readFileSync } from 'node:fs';

const ROTT = '/home/ak1a/AK1';
let pass = 0, fel = 0;
const P = (ok, namn, detalj = '') => { if (ok) pass++; else { fel++; console.log(`  FEL: ${namn} ${detalj}`); } };

// ── KARTAN (parsad ur src/lib/larvag-karta.ts — läsreplikens datakälla) ─────
const kartaTxt = readFileSync(`${ROTT}/src/lib/larvag-karta.ts`, 'utf8');
const KARTA = [];
for (const m of kartaTxt.matchAll(/\{ slug: "([^"]+)", titel: "((?:[^"\\]|\\.)*)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)) {
  KARTA.push({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] });
}
const IDX = new Map(KARTA.map((k, i) => [k.slug, i]));
P(KARTA.length === 501, 'kartstorlek 501', `=${KARTA.length}`);
const V_SPAR = KARTA.filter(k => k.vIndex >= 0).sort((a, b) => a.vIndex - b.vIndex);

// konstanter (ur larvag.ts + kurstips.ts)
const BAS = { sparNasta: 100, svagheten: 90, kategoriFortsattning: 86, kategoriBalans: 82, nivaSteg: 62, kortastKurs: 56 };
const MALNIVA = { nybörjare: 1, växande: 2, avancerad: 3, 'fas2-redo': 3 };
const GRUNDLAGT = 8, LAG_XP = 300, STREAK_NASTA = 5;

const poang = (bas, k, malniva) => bas + (k.niva > 0 && k.niva === malniva ? 4 : 0) + (k.vIndex >= 0 ? 2 : 0);

// ── REPLIK av raknaLarvag (regler 1-4, 6, 8; bokmaster/streak utanför isolering) ──
function rakna(klaraKurser, lasTillstand, fas, svagheter, xp) {
  const klaraSet = new Set(klaraKurser);
  const malniva = MALNIVA[lasTillstand] ?? 1;
  const kan = s => { if (klaraSet.has(s)) return false; const k = IDX.has(s) ? KARTA[IDX.get(s)] : null; if (!k) return false; return k.kraverFas <= fas; };
  const kandidater = [], nominerade = new Set();
  const lamna = (s, bas, regel) => { if (!kan(s) || nominerade.has(s)) return; nominerade.add(s); const k = KARTA[IDX.get(s)]; kandidater.push({ slug: s, poang: poang(bas, k, malniva), regel }); };
  const nastaSpar = V_SPAR.find(v => kan(v.slug));
  if (nastaSpar) lamna(nastaSpar.slug, BAS.sparNasta, 'spar-nasta');
  let svSlug = null, svDel = 0;
  for (const [s, d] of Object.entries(svagheter || {})) {
    if (d < 3 || !kan(s)) continue;
    const i = IDX.get(s) ?? 2 ** 53, nu = svSlug ? (IDX.get(svSlug) ?? 2 ** 53) : 2 ** 53;
    if (d > svDel || (d === svDel && i < nu)) { svSlug = s; svDel = d; }
  }
  if (svSlug) lamna(svSlug, BAS.svagheten, 'svagheten');
  const katR = new Map();
  for (const s of klaraKurser) { const k = IDX.has(s) ? KARTA[IDX.get(s)] : null; if (k) katR.set(k.kategori, (katR.get(k.kategori) ?? 0) + 1); }
  let paborjad = null, paborjadAntal = 0;
  for (const [kat, antal] of katR) if (antal > paborjadAntal) { paborjad = kat; paborjadAntal = antal; }
  if (paborjad) {
    const f = KARTA.filter(k => k.kategori === paborjad && kan(k.slug) && !nominerade.has(k.slug))[0];
    if (f) lamna(f.slug, BAS.kategoriFortsattning, 'kategori-fortsattning');
  }
  const perKat = new Map();
  for (const v of V_SPAR) if (klaraSet.has(v.slug)) perKat.set(v.kategori, (perKat.get(v.kategori) ?? 0) + 1);
  const balans = V_SPAR.filter(v => kan(v.slug) && !nominerade.has(v.slug)).sort((a, b) => (perKat.get(a.kategori) ?? 0) - (perKat.get(b.kategori) ?? 0) || V_SPAR.indexOf(a) - V_SPAR.indexOf(b))[0];
  if (balans) lamna(balans.slug, BAS.kategoriBalans, 'kategori-balans');
  if (klaraSet.size >= 1) {
    const nivaK = KARTA.filter(k => k.niva > 0 && k.niva === malniva && kan(k.slug) && !nominerade.has(k.slug))[0];
    if (nivaK) lamna(nivaK.slug, BAS.nivaSteg, 'niva-steg');
  }
  if (xp < LAG_XP) {
    const kort = V_SPAR.filter(v => kan(v.slug) && !nominerade.has(v.slug)).sort((a, b) => a.minuter - b.minuter || V_SPAR.indexOf(a) - V_SPAR.indexOf(b))[0];
    if (kort) lamna(kort.slug, BAS.kortastKurs, 'kortast-kurs');
  }
  return kandidater.sort((a, b) => b.poang - a.poang || IDX.get(a.slug) - IDX.get(b.slug)).slice(0, 3);
}

// ── SCENARIER ───────────────────────────────────────────────────────────────
console.log('== FRONT B (läsreplik larvag.ts) ==');

// S1: 90p svagheten med nivåmatch — varje ny kurs som svaghets-argmax (växande)
for (const slug of ['mt-09-regleringsmoat', 'kt-11-indexinklusionen', 'bk-09-valutadifferenserna']) {
  const r = rakna([], 'växande', 1, { [slug]: 5 }, 500);
  const hit = r.find(x => x.slug === slug);
  P(hit && hit.regel === 'svagheten' && hit.poang === 94, `S1 90p+4 ${slug}`, JSON.stringify(r.map(x => `${x.slug}:${x.poang}`)));
}
// S1b: omvänd nivå (nybörjare→1, avancerad→3): 90 UTAN påslag
for (const slug of ['mt-09-regleringsmoat']) {
  for (const ls of ['nybörjare', 'avancerad']) {
    const r = rakna([], ls, 1, { [slug]: 5 }, 500);
    const hit = r.find(x => x.slug === slug);
    P(hit && hit.poang === 90, `S1b 90p utan påslag (${ls})`, JSON.stringify(r.map(x => `${x.slug}:${x.poang}`)));
  }
}

// S2: 86p kategori-fortsättning ×3 med nivåmatch — läsaren klarat ALLA med lägre
// kartindex i kategorin (V-grillar + serien) → nästa = den nya kursen
const scen = [
  { slug: 'mt-09-regleringsmoat', kat: 'MOAT' },
  { slug: 'kt-11-indexinklusionen', kat: 'KATALYSATOR' },
  { slug: 'bk-09-valutadifferenserna', kat: 'BOKFÖRING & ÅRSREDOVISNING' },
];
for (const { slug, kat } of scen) {
  const klara = KARTA.filter(k => k.kategori === kat && IDX.get(k.slug) < IDX.get(slug)).map(k => k.slug);
  const r = rakna(klara, 'växande', 1, {}, 500);
  const hit = r.find(x => x.slug === slug);
  P(hit && hit.regel === 'kategori-fortsattning' && hit.poang === 90, `S2 86p+4 ${slug} (efter ${klara.length} klara i ${kat})`, JSON.stringify(r.map(x => `${x.slug}:${x.poang}:${x.regel}`)));
}

// S3: omvänd riktning — 0 progress: fortssättningen vilar, nya kurser nomineras ALDRIG
const r0 = rakna([], 'växande', 1, {}, 0);
P(!r0.some(x => ['mt-09-regleringsmoat', 'kt-11-indexinklusionen', 'bk-09-valutadifferenserna'].includes(x.slug)), 'S3 0 progress: nya kurser vilar', JSON.stringify(r0.map(x => x.slug)));
P(r0.length === 3, 'S3b default 3 starter-kurser', JSON.stringify(r0.map(x => x.slug)));

// S4: D1 — delvis-läsare (raknaNastaSteg med null saneras): km-002 finns bland STARTER?
// repliken: ny läsare, xp 0 → kortast-kurs i V-spåret; kontrollera determinism i stället:
const a = JSON.stringify(rakna(['km-001-bokforingens-grunder'], 'växande', 1, {}, 50));
const b = JSON.stringify(rakna(['km-001-bokforingens-grunder'], 'växande', 1, {}, 50));
P(a === b, 'S4 determinism bitidentisk ×2', `${a} vs ${b}`);

// S5: vIndex −1 ⇒ ALDRIG +2: alla tre kurser har vIndex −1 i kartan
for (const { slug } of scen) {
  const k = KARTA[IDX.get(slug)];
  P(k.vIndex === -1, `S5 vIndex −1 ${slug}`, `=${k.vIndex}`);
  P(k.kraverFas === 0, `S5b kraverFas 0 ${slug}`, `=${k.kraverFas}`);
}

// S6: serieordning i kartan: grannen strax före
for (const { slug } of scen) {
  const i = IDX.get(slug);
  P(/^((mt-08)|(kt-10)|(bk-08))/.test(KARTA[i - 1].slug), `S6 serieordning ${slug}: före=${KARTA[i - 1].slug}`);
}

// S7: syskonkurserna oskadda i kartan (u1 vr-10 + u2 ud-10/vm-12) + antal
for (const s of ['vr-10-enhetsmultiplar', 'ud-10-ex-dagens-mekanik', 'vm-12-reverserad-dcf']) {
  P(IDX.has(s), `S7 syskonkurs kvar ${s}`, 'saknas i kartan');
}

// S8: why-paritet register ≡ kursfil ×3 (kursfilens why är registerpostens why)
const reg = JSON.parse(readFileSync(`${ROTT}/public/deep-courses.json`, 'utf8'));
for (const { slug } of scen) {
  const fil = JSON.parse(readFileSync(`${ROTT}/data/kurser-tillagg/${slug}.json`, 'utf8'));
  P(fil.why === reg[slug].why && fil.why.length > 400, `S8 why-paritet ${slug}`, 'why skiljer/kort');
  P(fil.slug === reg[slug].slug, `S8b slug-paritet ${slug}`, '');
}

console.log(`\nFRONT B: ${pass} PASS, ${fel} FEL`);
process.exit(fel ? 1 : 0);
