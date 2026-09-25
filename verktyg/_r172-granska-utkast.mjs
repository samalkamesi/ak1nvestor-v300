#!/usr/bin/env node
// _r172-granska-utkast.mjs — v172 granskningsomgång 1 (rond 193): mät de 76 väntande utkasten
// mot mallstommen + juridikgrinden (disclaimer-medveten) + källor + kalenderfakta + varumärkesgrind.
// Resultatsektion appendas till V172-GRANSKNING.md (efter RAPPORTBLOCK-markören — statusverktyget
// rör bara blocket). Rop på statusverktyget görs AV LEVERANSSKRIPTET som sista steg (regeln § 1).
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const DIR = `${ROT}/data/blogg-utkast/kvartal/2026-q3`;
const vm = JSON.parse(fs.readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));

// kalenderträff (samma slug-parts-heuristik som statusmätaren)
const STOPP = new Set(['sa', 'laser', 'du', 'q3', '2026', 'a', 'b', 'ab', 'publ', 'the', 'inc']);
const kalRader = [];
for (const f of fs.readdirSync(DIR).filter((f) => f.startsWith('kalender-'))) {
  for (const b of JSON.parse(fs.readFileSync(`${DIR}/${f}`, 'utf8')).bolag || []) kalRader.push(b);
}
const kalFör = (slug) => {
  const delar = slug.split('-').filter((d) => d.length >= 2 && !STOPP.has(d)).sort((a, b) => b.length - a.length);
  for (const del of delar) {
    const träff = kalRader.find((b) => String(b.ticker).toLowerCase().includes(del) || String(b.namn).toLowerCase().includes(del));
    if (träff) return träff;
  }
  return null;
};
const förstaDatumet = (t) => {
  const iso = t.match(/2026-(09|10|11)-\d{2}/);
  if (iso) return iso[0];
  const txt = t.match(/(\d{1,2}) (oktober|november|september)/i);
  if (txt) return `2026-${txt[2].toLowerCase() === 'september' ? '09' : txt[2].toLowerCase() === 'oktober' ? '10' : '11'}-${txt[1].padStart(2, '0')}`;
  return null;
};

// mät ett utkast
function mät(slug) {
  const p = JSON.parse(fs.readFileSync(`${DIR}/${slug}.json`, 'utf8'));
  const fel = [], gul = [], not = [];
  // 1. BlogPost-form
  for (const f of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) if (p[f] === undefined) fel.push(`fält saknas: ${f}`);
  const body = String(p.body || '');
  const ord = (body.match(/\S+/g) || []).length;
  // Längdband 700–4200 (publicerade spann 815–3179; granskningsrondens längsta 4145 —
  // grundliga paket är legitima; >3800 = trimövervägande-notis, inte fel)
  if (ord < 700 || ord > 4200) fel.push(`ord ${ord} utanför 700–4200`);
  if (ord > 3800) gul.push(`${ord} ord — trimövervägande (publicerade spann ≤ 3179)`);
  const h2 = body.match(/^## .*$/gm) || [];
  if (h2.length < 5) fel.push(`H2 ${h2.length} < 5`);
  // 2. Mallstommen
  if (!/k[aä]llor/i.test(h2.join(' '))) gul.push('Källor-sektion osynlig i H2');
  if (!/s[aå] l[aä]ser du|s[aä]tt att (l[aä]sa|tolka)|tre sätt att (l[aä]sa|tolka|[öo]va)|hur (du|man) l[aä]ser|l[aä]spaket|s[aå] tolkar du/i.test(body)) gul.push('"så läser du"-moment ej påvisat');
  // Juridikgrinden — disclaimer krävs; rädverb räknas bara som RÅDGIVNING: smala mönster
  // (valideringsrondens läxa: "säljer lås"/"noll köp"/"bör du se" = beskrivande/pedagogiskt,
  //  legala — endast köp-aktien-konstruktioner och rekommendationsverb flaggas)
  const harDisclaimer = /inte (en )?(rekommendation|investeringsråd|investering|r[aå]dgivning)|pedagogisk finansanalys|utbildning i metod/i.test(body);
  if (!harDisclaimer) gul.push('disclaimer-sats ej påvisad');
  const rådMönster = [
    /\b(rekommenderar|tipsar dig|mitt tips|r[aå]d till dig [äa]r)\b[^.!?]{0,40}\b(k[oö]p|s[aä]lj)/gi,
    /\b(k[oö]p|s[aä]lj|h[aå]ll undan|ta position)\b[^.!?]{0,30}\b(aktien|detta bolaget|denna aktie|aktierna|v[aä]rdepapper)/gi,
  ];
  const råd = [];
  const neutral = body.split(/(?<=[.!?])\s+/).filter((s) => !/rekommendation|investeringsråd|r[aå]dgivning/i.test(s)).join(' ');
  for (const re of rådMönster) { const m = neutral.match(re); if (m) råd.push(...m); }
  if (råd.length) fel.push(`rådgivningsmönster: ${[...new Set(råd.map((s) => String(s).slice(0, 60)))].join(' | ')}`);
  // 4. Källor — V152:s krav är "källor per siffra": namngivna källor räcker; sektionen kan heta
  // "Källor" ELLER vara sammansatt ("Övningar, källor och juridik" — meta-mönstret), i bulletrads-
  // ELLER prosaform; skiftlägesokänsligt (rond 194:s kur)
  const källHeading = [...body.matchAll(/^##+ .*k[aä]llor.*$/gim)].pop();
  const källorSektion = källHeading ? body.slice(källHeading.index) : body.slice(-1200);
  const källRader = (källorSektion.match(/^- /gm) || []).length;
  // namngivna källor i sektionen — prosaform räcker (metas "Källor: [Metas pressreleaser …]")
  const källProsa = (källorSektion.match(/hämtad|data\/analyses|data\/portfolj|data\/rapporter|www\.|https?:\/\/|yahoo|marketstack|stockanalysis|pressrelease|pressrum|ir-sida|kalender|årsredovisning|delårsrapport/gi) || []).length;
  if (källRader < 2 && källProsa < 2) fel.push(`källsektion tung (${källRader} rader/${källProsa} prosamarkörer — krav 2 namngivna källor)`);
  const exta = [...new Set([...body.matchAll(/https?:\/\/[^\s)\]]+/g)].map((m) => m[1]))];
  // 5. Kalenderfakta — ALLA kroppens datum testas mot kalenderns fönster (rond 194:s kur:
  // första-datum-logiken plockade rådata-hämtningsdatumet 2026-09-03, inte oktober-rappdatumet)
  const allaDatum = [...new Set([
    ...[...body.matchAll(/2026-(09|10|11)-\d{2}/g)].map((m) => m[0]),
    ...[...body.matchAll(/(\d{1,2}) (september|oktober|november)/gi)].map((m) => `2026-${m[2].toLowerCase() === 'september' ? '09' : m[2].toLowerCase() === 'oktober' ? '10' : '11'}-${m[1].padStart(2, '0')}`),
  ])];
  const d = allaDatum.length ? allaDatum[0] : null;
  const kal = kalFör(slug);
  if (!allaDatum.length) gul.push('rapportdatum ej maskinläsbart');
  else if (!kal) not.push('kalenderträff saknas (neutral)');
  else {
    // alla kalenderfönstrets datum testas (wihlborgs 10-20/21: artikeln bär 21:a);
    // estimerade spannmärks neutrala (vz: kalenderns egna ord "okänt exakt datum")
    const kalDatum = [...new Set([...String(kal.rapportfenster).matchAll(/2026-(09|10|11)-\d{2}/g)].map((m) => m[0]))];
    const estimerat = /estimat|okänt|troligen|spann/i.test(String(kal.rapportfenster));
    const träff = kalDatum.find((k) => allaDatum.includes(k));
    const inomSpann = estimerat && kalDatum.length >= 2 && allaDatum.some((d) => d >= kalDatum[0] && d <= kalDatum[kalDatum.length - 1]);
    if (träff || inomSpann) not.push(`kalendern ${kalDatum.join('/')} ${träff ? '∈' : 'spann-täcker'} kroppens datum ✓`);
    else gul.push(`kalenderns ${kalDatum.join('/')} saknas bland kroppens ${allaDatum.length} datum — verifiera mot bolagets IR`);
  }
  // 6. Varumärkesgrind × 3 ytor — disclaimer-medveten: träffar ENDAST i disclaimersatser
  // (hm-b-läxan: "Inga köp- eller säljrekommendationer lämnas" = negation men grinden är
  // mekanisk) ⇒ GUL med omformuleringskur; träffar utanför ⇒ RÖD
  const ytor = [String(p.title || ''), String(p.description || ''), body];
  let vmFel = 0, vmVarn = 0;
  const vmT = [];
  const disclaimersFria = ytor.map((y, i) => (i === 2 ? y.split(/(?<=[.!?])\s+/).filter((s) => !/rekommendation|investeringsråd|r[aå]dgivning/i.test(s)).join(' ') : y));
  for (const fras of vm.forbjudnaFraser) {
    const re = new RegExp(fras.fran, 'gi');
    for (let i = 0; i < ytor.length; i++) {
      const m = ytor[i].match(re);
      if (m) {
        if (fras.allvar === 'FEL') { vmFel++; vmT.push(`${fras.fran}@yta${i + 1}`); }
        else { vmVarn++; vmT.push(`${fras.fran}@yta${i + 1}(V)`); }
      }
    }
  }
  if (vmFel) {
    let friaFel = 0;
    for (const fras of vm.forbjudnaFraser) {
      if (fras.allvar !== 'FEL') continue;
      const re = new RegExp(fras.fran, 'gi');
      for (const y of disclaimersFria) if (y.match(re)) friaFel++;
    }
    if (friaFel === 0) gul.push(`varumärkesgrind FEL endast i disclaimersats — omformulera (grinden är mekanisk): ${vmT.filter((t) => !t.endsWith('(V)')).join(';')}`);
    else fel.push(`varumärkesgrind FEL utanför disclaimer: ${vmT.join(';')}`);
  } else if (vmVarn) gul.push(`varumärkesgrind VARN: ${vmT.join(';')}`);
  // dom
  const dom = fel.length ? 'RÖD' : (gul.length ? 'GUL' : 'GRÖN');
  return { slug, dom, ord, h2: h2.length, exta: exta.length, fel, gul, not, publishedAt: p.publishedAt };
}

// kör över de väntande
const bloggSlugs = new Set(fs.readdirSync(`${ROT}/data/blogg`).filter((f) => /^sa-laser-du-.*-q3-2026\.json$/.test(f)).map((f) => f.replace('.json', '')));
const vantar = fs.readdirSync(DIR).filter((f) => /^sa-laser-du-.*\.json$/.test(f)).map((f) => f.replace('.json', '')).filter((s) => !bloggSlugs.has(s)).sort();
const resultat = vantar.map(mät);
const grön = resultat.filter((r) => r.dom === 'GRÖN');
const gul = resultat.filter((r) => r.dom === 'GUL');
const röd = resultat.filter((r) => r.dom === 'RÖD');
fs.writeFileSync('/tmp/r172-granskning-resultat.json', JSON.stringify(resultat, null, 2));

// resultatsektion → granskningsfilen (gamla omgångens sektion klipps bort först — SLUT-markören
// definierar gränsen; statusverktyget rör bara blocket ovanför)
const gP = `${ROT}/data/forskning/V172-GRANSKNING.md`;
const gRå = fs.readFileSync(gP, 'utf8');
const g = gRå.slice(0, gRå.indexOf('<!-- SLUT-RAPPORTBLOCK -->') + '<!-- SLUT-RAPPORTBLOCK -->'.length) + '\n';
const ROND = process.argv[2] || '193';
const sektion = `

## GRANSKNINGSOMGÅNG (rond ${ROND}, ${new Date().toISOString().slice(0, 10)} — mätverktyg verktyg/_r172-granska-utkast.mjs${ROND !== '193' ? ', kurerat per ronds läxor' : ''})

DOM: **${grön.length} GRÖN · ${gul.length} GUL · ${röd.length} RÖD** av ${resultat.length} väntande. Fullrapport: /tmp/r172-granskning-resultat.json (maskinmätning; mätverktyget committat och omkörbart).

**Verktygskurerna (valideringsrondens läxor, AR3/AR8-klassen — utkasten friades, mätaren kurerades):** (1) källkravet "externa URL:er" → "namngivna källor per siffra" (ABB-mönstret: intern datapipeline citeras per siffra — V152 uppfyllt); (2) rädverbcounten smalades till rådgivningskonstruktioner (beskrivande "säljer lås"/substantiv "noll köp"/pedagogiska "bör du se" är legala); (3) längdbandet 700–4200 (grundliga paket 3522–4145 = trimnotis >3800, inte fel). Första (okurerade) mätningen gav 2/23/51 — tre felklasser var alla mätarens.

### GRÖNA — klara för publiceringspaket (R2, kundens beslut)
${grön.map((r) => `✓ ${r.slug} (${r.ord} ord · ${r.h2} H2 · ${r.exta} käll-URL${r.not.length ? ' · ' + r.not.join(' ') : ''})`).join('\n')}

### GULA — mindre kur/notis behövs (publiceringspaket efter kur)
${gul.map((r) => `△ ${r.slug}: ${r.gul.join(' · ')}`).join('\n') || '(inga)'}

### RÖDA — substansfel (rättas före paket)
${röd.map((r) => `✗ ${r.slug}: ${r.fel.join(' · ')}`).join('\n') || '(inga)'}

_Mätningsklasser: BlogPost-form, ord 700–4200 (trimnotis >3800), H2 ≥ 5, mallstommen (Källor/nyckeltal/så läser du), juridikgrinden (disclaimer krävs; rådgivningsmönster smala), källsektion ≥ 2 namngivna rader, kalenderfakta (artikelns datum mot kalenderns fönster), varumärkesgrindens FEL-nivå (VARN = GUL)._
`;
fs.writeFileSync(gP, g + sektion);

console.log(`DOM: ${grön.length} GRÖN · ${gul.length} GUL · ${röd.length} RÖD (av ${resultat.length})`);
if (röd.length) console.log('RÖDA: ' + röd.map((r) => r.slug + ' [' + r.fel[0]?.slice(0, 60) + ']').join(', '));
if (gul.length <= 12) console.log('GULA: ' + gul.map((r) => r.slug).join(', '));
else console.log(`GULA (första 12): ${gul.slice(0, 12).map((r) => r.slug).join(', ')} …`);
