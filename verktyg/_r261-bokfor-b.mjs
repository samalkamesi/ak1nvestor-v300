// r261 huvudbokföring: B29 gruv/metall levererad + pipeline + worklog + trädhygien + commit + push
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const run = (cmd, t = 90000) => {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: ROT, timeout: t }).trim();
  } catch (e) {
    console.log('FEL: ' + String(e.message || '').slice(0, 300));
    if (e.stdout) console.log('(stdout) ' + String(e.stdout).slice(0, 400));
    process.exit(1);
  }
};
const läs = (p) => fs.readFileSync(ROT + p, 'utf-8');

// ── 1) SEO-planen: B29-rad efter B28 + NOT r261 ──────────────────────────────
const seoPath = ROT + '/data/forskning/SEO-GUIDER-2026-09.md';
let seo = läs('/data/forskning/SEO-GUIDER-2026-09.md');
if (seo.includes('| B29 |')) {
  console.log('SEO: B29-rad finns — hoppar över');
} else {
  const b29rad =
    '| B29 | gruvaktier-sa-analyserar-du-gruvbolag | gruvaktier | 1397 | UTKAST v1 (2026-09-26, studio-session rond 261 via subagent i förgrund, klaimfil data/vakten/s3-b29-gruv-metall-ansprak-2026-09-26.md skriven FÖRE arbetet, disk-först; DÖD r260-dispatch övertagen — dess klaimstavning "gruvmaktier" rättad till "gruvaktier", övertagandet bokfört i båda klaimfilerna) — första av fyra nya svenska original (kursankare utan egen guide; se-20): produktionssidan av sektorn med Boliden som svenskt djupanker (oms 93 509/86 437 = +8,2 % med resultatet 9 404/12 410 = −24,2 % — intäkten växer in i gruvan utan att överskottet följer) och universumbärningen VALE/FCX/FMG/NST/S32/MT; guidens tes: malmhaltens aritmetik (50 × 40 = 2 000) och C1/AISC-trappan som kostnadshävstång (4,00 − 1,60/2,80 → marginal 2,40/1,20 → hävstång 1,67/3,33; pris ±10 % flyttar marginalen +16,7/+33,3 %), utbudströgheten (livslängd 6,0 ÷ 0,2 = 30 år), bi-metallkrediter (106 + 33 = 139, guldkrediten 33/139 ≈ 0,237), reserverna, minoritetspedagogiken (FCX 12,1/32,2 → 38 %) och utdelningens cykelkvantitet (FMG 2 529/6 699 = −62 % i bottenvåningen; bruttomarginaltrappan FMG 56,0 mot NST 14,3, spridningen +23,4 pp mot universumets egna avrundningar dokumenterad; VALE:s nettoberg 13 814/95 924 → −47,6 %/år i CAGR-fallet); avgränsad mot publicerade råvarucykelguiden (marknadssidan) genom länk, inte upprepning; checklistans sex steg; KVD GRÖN 0 FEL i 41 maskinella kontroller (verktyg/_r261-b29-gruv-kvd.mjs; OBEROENDE OMKÖRNING av huvudsessionen: ALLT GRÖNT): varumärkesgrind 26 regexer × 3 ytor 0 FEL/0 VARNING, rådverb SV+EN 0, sökord "gruvaktier" i title 38/60 (först) + description 142/155 + H1 + ingress + 2 H2, ord 1 397/1 200–1 400, korslänkar 15 mot publicerade ytor (12 kurser + 3 blogg, 0 mot utkast), externa URL:er 5/5 slutstatus 200 live i KVD:n (boliden.com + fcx.com + fortescue.com via 308/307 + sgu.se/bergsstaten + stockanalysis.com/stocks/vale; ratade källor vale.com/south32.net 403 + boliden.com/investors + fcx.com/investers 404 nämns utan URL — Ö15/Ö18-precedensen; r260-lärdomen om levande länkar tillämpad från författandet), tal 83 unika mot kursankare ∪ universum ∪ motorhärledda ∪ årtal, aritmetik 22/22 motorräknad, H2 8 ≥ 5, H1 1, readingMinutes 2 = round(1397/600), disclaimer exakt sista rad, läckor 0 (engelsk blacklist + korpusvokabulär) | data/blogg-utkast/gruvaktier-sa-analyserar-du-gruvbolag.json |';
  const rader = seo.split('\n');
  const i = rader.findIndex((l) => l.startsWith('| B28 |'));
  if (i < 0) {
    console.log('SEO: B28-rad hittades INTE — AVBRYTER (ingen blind infogning)');
    process.exit(1);
  }
  rader.splice(i + 1, 0, b29rad);
  seo = rader.join('\n');
  console.log('SEO: B29-rad infogad efter B28 (rad ' + (i + 2) + ')');
}
if (!seo.includes('NOT r261')) {
  const rader = seo.split('\n');
  let i = rader.findIndex((l) => l.includes('MAERSK-B/DSV'));
  if (i < 0) i = rader.findIndex((l) => l.includes('universumbärning sonderad r259'));
  if (i < 0) {
    console.log('SEO: NOT-ankare hittades inte — NOT r261 skippas (B29-raden bär bokföringen)');
  } else {
    rader.splice(
      i + 1,
      0,
      '',
      'NOT r261 (2026-09-26): B29 gruv/metall LEVERERAD som',
      'gruvaktier-sa-analyserar-du-gruvbolag (1 397 ord; KVD 41/41 ×2 körningar;',
      'klaimfil med dokumenterat övertagande av död r260-dispatch). Kvar i v171:',
      'tre nya original — se-18 rederi, se-21 kemi, se-23 stål.'
    );
    seo = rader.join('\n');
    console.log('SEO: NOT r261 infogad efter stycket (rad ' + (i + 1) + ')');
  }
}
fs.writeFileSync(seoPath, seo);

// ── 2) PIPELINE-KO: v171-rad + rotationloggsrad ─────────────────────────────
const plPath = ROT + '/PIPELINE-KO.md';
let pl = läs('/PIPELINE-KO.md');
const förut = pl;
pl = pl.replace(/fyra nya/g, 'tre kvar av fyra nya (B29 gruv/metall LEVERERAD r261)');
if (pl !== förut) {
  console.log('PIPELINE: v171-raden uppdaterad (fyra→tre kvar, B29 levererad)');
} else {
  console.log('PIPELINE: "fyra nya" hittades inte (kanske redan uppdaterad) — fortsätter');
}
if (!pl.includes('r261 (Φ)')) {
  console.log('— PIPELINE sista 3 raderna före append —');
  console.log(pl.trimEnd().split('\n').slice(-3).join('\n'));
  pl =
    pl.trimEnd() +
    '\n- 2026-09-26 r261 (Φ): v171 B29 gruv/metall LEVERERAD (1 397 ord, KVD 41/41 ×2). Tre original kvar (se-18 rederi, se-21 kemi, se-23 stål); v172 rappdagar 10-20→11-04; v175 DR-prov Q3 bokad. Tre vågor börsda.\n';
  fs.writeFileSync(plPath, pl);
  console.log('PIPELINE: rotationloggsrad r261 appenderad');
}

// ── 3) Worklog: ROND 261-sektion ────────────────────────────────────────────
const wlPath = ROT + '/worklog.md';
const wl = läs('/worklog.md');
if (wl.includes('## ROND 261')) {
  console.log('worklog: ROND 261 finns — hoppar över');
} else {
  const sektion = `

## ROND 261 [organ:Φ] — v171 B29 gruv/metall LEVERERAD (första av fyra nya original) + r260 efterhandsbokförd — 2026-09-26
- r261a (6c48e6ba): ROND 260-sektionen + beslutsminnesraden efterhandsbokförda (trådpunktens bokföring klipptes efter push). Hash-dubletten uppklarad: 6eac2052 (r260 direkt på ef46649a) övergavs när trådpunktens nyare segment bokförde nattens o151-lighthouse-mätdata (5850408b) och återskapade r260-committen som f235d817 med identiskt innehåll — prod och yta synka på 6c48e6ba, ingen förlust.
- B29 gruv/metall: död r260-dispatch omstartad som förgrunds-subagent; klaimfil disk-först med dokumenterat övertagande (döda dispatchens "gruvmaktier"-stavning rättad till "gruvaktier", bokfört i båda klaimfilerna).
- Leverans: data/blogg-utkast/gruvaktier-sa-analyserar-du-gruvbolag.json (1 397 ord, gräns 1 200–1 400) + KVD verktyg/_r261-b29-gruv-kvd.mjs + klaimfil data/vakten/s3-b29-gruv-metall-ansprak-2026-09-26.md.
- KVD: 41/41 GRÖN i subagentens körning + OBEROENDE OMKÖRNING GRÖN (doktrinen: agentrapporter verifieras, antas inte) — sökord "gruvaktier" i title 38/60 (först) + description 142/155 + H1 + ingress + 2 H2 · H2 8 (≥5), H1 1 · korslänkar 15 mot publicerade ytor (12 kurser + 3 blogg, 0 mot utkast) · EXTERNA 5/5 LEVANDE slutstatus 200 (boliden.com, fcx.com, fortescue.com via 308/307, sgu.se/bergsstaten, stockanalysis.com/stocks/vale) — ratade källor (vale.com/south32.net 403, /investors-varianter 404) nämns utan URL enligt Ö15/Ö18-precedensen; r260-lärdomen om levande länkar tillämpad från författandet · varumärkesgrind 26×3 ytor 0/0 · rådverb SV+EN 0 · tal 83 unika mot kursankare ∪ universum ∪ motorhärledda ∪ årtal · aritmetik 22/22 motorräknad (malmhalt 50×40=2 000, C1-trappan 4,00−1,60/2,80 → hävstång 1,67/3,33, pris±10 %-marginalerna +16,7/+33,3 %, guldkrediten 33/139≈0,237, livslängden 6,0÷0,2=30, Boliden +8,2/−24,2, FMG 2 529/6 699=−62 %, NST +23,4 pp toleransdokumenterad, VALE −47,6 %/år, FCX minoriteter 38 %) · läckor 0 · publishedAt 2026-09-26.
- Innehåll: produktionssidan (malmhaltens aritmetik, C1/AISC-trappan, utbudströghet, bi-metallkrediter, reserver, minoritetspedagogik) med Boliden som svenskt djupanker och VALE/FCX/FMG/NST/S32/MT ur universumet; avgränsad mot publicerade råvarucykelguiden genom länk, inte upprepning.
- v171-status: tre original kvar (se-18 rederi, se-21 kemi, se-23 stål).
KVD: ren dataleverans (utkast publiceras ej — granskningskön äger data/blogg-utkast/), src orörd, tsc via grinden vid commit, inget bygge. Kö: v171 tre original → v172 rappdagar 10-20→11-04 · v175 DR-prov Q3.`;
  fs.writeFileSync(wlPath, wl.trimEnd() + '\n' + sektion.trimStart().replace(/^\n/, '\n'));
  console.log('worklog: ROND 261-sektionen appanderad');
}

// ── 4) Trädhygien: nio engångssonder bort (resultat bokförda i worklog/DRIFTSBOKEN) ──
for (const f of [
  '_r257-integritet-sond.mjs',
  '_r257-rot-spad.mjs',
  '_r260-dr-sond.mjs',
  '_r260-dr-sond2.mjs',
  '_r260-git.mjs',
  '_r260-lanksond.mjs',
  '_r260-righta.mjs',
  '_r261-sond.mjs',
  '_r261-spad.mjs',
]) {
  const p = ROT + '/verktyg/' + f;
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('trädhygien: ' + f + ' raderad');
  }
}

// ── 5) Huvudcommit + push ───────────────────────────────────────────────────
const msg = [
  'studio: [organ:Φ] r261 v171 B29 — gruv/metall-original LEVERERAT (första av fyra nya)',
  '',
  'gruvaktier-sa-analyserar-du-gruvbolag 1 397 ord · subagent i förgrund (död r260-dispatch',
  'övertagen, klaim dokumenterar) · KVD 41/41 GRÖN + oberoende omkörning grön (sökord i',
  'title/description/H1/ingress/2 H2, korslänkar 15 publicerade ytor, externa 5/5 LEVANDE',
  '200 — r260-lärdomen, tal 83 mot ankare ∪ universum, aritmetik 22/22, rådverb 0, läckor',
  '0) · SEO-planens B29-rad + NOT r261 · PIPELINE: tre original kvar (se-18/21/23) → v172',
  '+ v175 · r260 efterhandsbokförd i r261a (6c48e6ba) — hash-dubletten 6eac2052/f235d817',
  'uppklarad · trädhygien: nio engångssonder raderade',
].join('\n');
const msgPath = ROT + '/verktyg/_r261-msg-b.txt';
fs.writeFileSync(msgPath, msg);
console.log('\n— git add + huvudcommit (tsc-grinden kör) —');
console.log(
  run(
    'git add data/blogg-utkast/gruvaktier-sa-analyserar-du-gruvbolag.json verktyg/_r261-b29-gruv-kvd.mjs data/forskning/SEO-GUIDER-2026-09.md PIPELINE-KO.md worklog.md && git commit -F verktyg/_r261-msg-b.txt',
    300000
  )
);
console.log(run('git push prod develop', 120000));
fs.unlinkSync(msgPath);

// ── 6) Pyttecommit: bokföringsskriptet självt (utenför sin egen fillista) ────
const msg2 = 'studio: [organ:Φ] r261 tillägg — bokföringsskriptet självt (utenför sin egen fillista, trädhygien)';
const msg2Path = ROT + '/verktyg/_r261-msg-c.txt';
fs.writeFileSync(msg2Path, msg2);
console.log('\n— pyttecommit —');
console.log(run('git add verktyg/_r261-bokfor-b.mjs && git commit -F verktyg/_r261-msg-c.txt', 300000));
console.log(run('git push prod develop', 120000));
fs.unlinkSync(msg2Path);

// ── 7) Beslutsminne + slutstatus ────────────────────────────────────────────
const bmPath = ROT + '/data/vakten/beslutsminne.jsonl';
const bm = läs('/data/vakten/beslutsminne.jsonl');
if (!bm.includes('"rond":261')) {
  const rad = JSON.stringify({
    ts: new Date().toISOString(),
    rond: 261,
    beslut:
      'r261: v171 B29 gruv/metall-original levererat (1 397 ord, KVD 41/41 ×2; första av fyra nya original — kvar rederi/kemi/stål); r260 efterhandsbokförd (hash-dublett uppklarad); trädhygien nio sonder',
    landat: 'SE_HUVUDCOMMIT',
  });
  fs.writeFileSync(bmPath, bm.trimEnd() + '\n' + rad + '\n');
  console.log('beslutsminne: r261-rad appanderad');
}
console.log('\n— senaste commits —');
console.log(run('git log --oneline -3'));
console.log('\n— git status —');
console.log(run('git status --porcelain') || '(rent)');
console.log('\n— prod-puls —');
console.log(run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://lab.ak1nvestor.com/'));
console.log('\nKLAR: r261 huvudbokföring landad');
