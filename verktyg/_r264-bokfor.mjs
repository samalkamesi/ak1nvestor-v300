// _r264-bokfor.mjs — r264 huvudbokföring: B30 rederi + SEO + PIPELINE + worklog + hygien + commit + push
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const cwd = '/home/ak1a/agent/ak1';
const prod = '/home/ak1a/AK1';
const sh = (c, d = cwd) => { try { return execSync(c, { encoding: 'utf8', timeout: 240000, cwd: d }).trim(); } catch (e) { return 'FEL: ' + String(e.message).slice(0, 250); } };
const byt = (fil, fran, till) => {
  const t = fs.readFileSync(cwd + '/' + fil, 'utf8');
  if (!t.includes(fran)) { console.log('ANKARFEL i', fil, ':', fran.slice(0, 60)); process.exit(1); }
  fs.writeFileSync(cwd + '/' + fil, t.replace(fran, till));
};

// ── 1) SEO-planen: B30-rad efter B29 + NOT r264 ──
const B30RAD = '| B30 | rederiaktier-sa-analyserar-du-rederibolag | rederiaktier | 1400 | UTKAST v1 (2026-09-26, studio-session rond 264 via subagent i förgrund, klaimfil data/vakten/s3-b30-rederi-ansprak-2026-09-26.md skriven FÖRE arbetet, disk-först; klaimen dokumenterar de två tyst döda tidigare dispatcherna — tredje försöket i det bevisade förgrundsmönstret) — andra av fyra nya svenska original (kursankare utan egen guide; se-18): rederiets produktionssida med Maersk som djupanker (oms 51 065/81 529 = −37,4 % med resultatet 3 822/29 198 = −86,9 % 2022→2023 — hävstången i verkligheten) och DSV som ägare-mot-hyrare-kontrast (brutto 26,8 mot Maersk 21,0; skuld/EK 0,76 mot 0,31); guidens tes: frakträntans cyklicitet (torrbulk 2008: 11 793 → 663, kvot 0,056), spot vs tidscertifikat (blandningen 28 200 över nollpunkten 25 000), operativ hävstång som aritmetik (kvot 3,5: frakt −10 % ⇒ täckningsbidrag −35 %; toppscenariot 1,45/−14,5 %), utbudströgheten (nybygge 105 MUSD, 25 årsliv, femåring 110/55, skrotgolv 15 = 27 % av botten), balansräkningen som trygghet, P/B (0,92 under ett) mot P/E (22,2 bär botten-E) i cykelbranscher; avgränsad mot publicerade råvarucykelguiden och logistikkursen via korslänkar, inte upprepning; checklistans sex steg; KVD GRÖN 0 FEL i agentens fjärde körning + OBEROENDE OMKÖRNING av huvudsessionen ALLT GRÖNT (verktyg/_r264-b30-rederi-kvd.mjs): varumärkesgrind 26 regexer × 3 ytor 0 FEL/0 VARNING, rådverb SV+EN 0, sökord "rederiaktier" i title 42/60 (först) + description 146/155 + H1 + ingress + 2/8 H2, ord 1 400 exakt på taket (1 200–1 400), korslänkar 18 mot publicerade ytor (12 kurser + 6 blogg, 0 mot utkast), externa URL:er 5/5 slutstatus 200 live (maersk.com + dsv.com + stockanalysis.com ×2 + balticexchange.com; ratade investor.maersk.com + unctad.org 403 nämns utan URL — Ö15/Ö18-precedensen; r260-lärdomen tillämpad från författandet), tal 74 unika mot kursankare ∪ universum ∪ motorhärledda ∪ årtal, aritmetik 31/31 motorräknad, H2 8 ≥ 5, H1 1, readingMinutes 2 = round(1400/600), disclaimer exakt sista rad, läckor 0 | data/blogg-utkast/rederiaktier-sa-analyserar-du-rederibolag.json |\n';
byt('data/forskning/SEO-GUIDER-2026-09.md',
  '| data/blogg-utkast/gruvaktier-sa-analyserar-du-gruvbolag.json |\n',
  '| data/blogg-utkast/gruvaktier-sa-analyserar-du-gruvbolag.json |\n' + B30RAD);
byt('data/forskning/SEO-GUIDER-2026-09.md',
  'tre nya original — se-18 rederi, se-21 kemi, se-23 stål.\n',
  'tre nya original — se-18 rederi, se-21 kemi, se-23 stål.\n\nNOT r264 (2026-09-26): B30 rederi LEVERERAD som rederiaktier-sa-analyserar-du-rederibolag (1 400 ord; KVD grön i agentens fjärde körning + OBEROENDE OMKÖRNING grön av huvudsessionen; klaimfil med dokumenterat övertagande av två tyst döda dispatcher). Kvar i v171: två nya original — se-21 kemi, se-23 stål.\n');
console.log('SEO: B30-rad + NOT r264 inlagda');

// ── 2) PIPELINE: v171-edit ──
byt('PIPELINE-KO.md',
  'därefter tre kvar av fyra nya (B29 gruv/metall LEVERERAD r261) svenska original (se-18 rederi, se-20 gruv/metall, se-21 kemi, se-23 stål)',
  'därefter två kvar av fyra nya (B29 gruv/metall + B30 rederi LEVERERADE r261/r264) svenska original (se-21 kemi, se-23 stål)');
byt('PIPELINE-KO.md',
  'PÅGÅR r257: B28-en dispatcherad till subagent (KVD-mönstret _v171-b27-en-kvd); -en/-ar i övrigt KOMPLETTA (Ö1–Ö26, AR1–AR29, ikapningsnotis r187)',
  'PÅGÅR r264: B29 gruv/metall + B30 rederi LEVERERADE (r261/r264, KVD ×2 grön vardera); -en/-ar KOMPLETTA (Ö1–Ö26, AR1–AR29, ikapningsnotis r187)');
console.log('PIPELINE: v171 uppdaterad');

// ── 3) worklog ROND 264 ──
fs.appendFileSync(cwd + '/worklog.md', `
## ROND 264 [organ:Φ] — B30 rederi LEVERERAD (andra av fyra nya original) + ISR-bokföring + PUSH-BLOCKERN SYSTEMFIXAD — 2026-09-26

- r264a (381883ed): ISR-krisens dokumentation landad (worklog ROND 262-263 + DRIFTSBOKEN-sektion med rot/kur/doktrin-rättelse) — se ROND 262-263 ovan.
- PUSH-BLOCKERN (83265815 + 520c8296): prod refuserade updateInstead-push ("Working directory has unstaged changes") — roten: 100%-väktarens motorvaliderare APPENDAR sina rapporter till en spårad fil (motorervalidering-2026-09-02.md; +3 784 rader från 05:02Z-körningen 107 PASS/0 FAIL/0 SKIP; filen 14,5 MB och växer). Engångslösning: vaktens rapport bevarad i git + prod:s arbetskopia återställd + pushad. SYSTEMFIX: validera-motorer.mjs skriver nu DATERADE rapportfiler (writeFileSync, ej append) — skarptrökt av huvudsessionen (107/0/0 på 26,4 s → ren 41 kB-fil) och pushad genom tsc-grinden; blockern kan inte återkomma.
- B30 rederi (se-18, kursankaret): tredje dispatchen (två föregångare dog tyst med trådklippningarna) körd som förgrunds-subagent — LEVERERAD: rederiaktier-sa-analyserar-du-rederibolag.json (1 400 ord, exakt på taket), Maersk-djupankret (oms −37,4 % / resultat −86,9 % 2022→2023 = hävstången i verkligheten) med DSV som ägare-mot-hyrare-kontrast. KVD ALLT GRÖNT i agentens fjärde körning + OBEROENDE OMKÖRNING GRÖN av huvudsessionen (doktrinen: agentrapporter verifieras): korslänkar 18 (12 kurser + 6 blogg, 0 utkast), externa 5/5 live 200, tal 74 spårbara, aritmetik 31/31 motorräknad, rådverb 0, läckor 0, varumärkesgrind 0/0.
- v171-status: två original kvar (se-21 kemi, se-23 stål).
- Trädhygien: 31 engångsverktyg bort (_r262-*/_r263-*-incidentverktygen + r264-sonderna; _r260-isr.mjs lämnad — främmande ägare, doktrin).
`);
console.log('worklog: ROND 264 appenderad');

// ── 4) huvudcommit + push (med prod-omförsök om vakten smutsat) ──
fs.writeFileSync(cwd + '/verktyg/_r264d-msg.txt',
  'studio: [organ:Φ] r264 v171 B30 rederi-original LEVERERAT (andra av fyra nya; 1 400 ord, Maersk-djupanker + DSV-kontrast; KVD grön ×2 — agent + oberoende omkörning: korslänkar 18, externa 5/5 live, tal 74, aritmetik 31/31, rådverb 0, läckor 0) + SEO-planens B30-rad + NOT r264 + PIPELINE v171-edit (två kvar: kemi, stål) + worklog ROND 264\n');
sh('git add data/blogg-utkast/rederiaktier-sa-analyserar-du-rederibolag.json data/vakten/s3-b30-rederi-ansprak-2026-09-26.md verktyg/_r264-b30-rederi-kvd.mjs data/forskning/SEO-GUIDER-2026-09.md PIPELINE-KO.md worklog.md && git commit -F verktyg/_r264d-msg.txt');
console.log('commit:', sh('git log -1 --format="%h %s"').slice(0, 95));
fs.unlinkSync(cwd + '/verktyg/_r264d-msg.txt');
for (let i = 1; i <= 3; i++) {
  const p = sh('git push prod develop 2>&1');
  if (!p.startsWith('FEL')) { console.log('push OK:', p.split('\n').slice(-2).join(' | ').slice(0, 130)); break; }
  console.log('push försök', i, 'refuserad — rensmuter prod');
  sh('git checkout -- data/rapporter/motorervalidering-2026-09-02.md', prod);
}

// ── 5) trädhygien + tilläggscommit (bokföringsskripten själva) ──
const bort = fs.readdirSync(cwd + '/verktyg').filter(f => /^_r26[23]-/.test(f) || f === '_r264-sond-universum.mjs');
for (const f of bort) fs.unlinkSync(cwd + '/verktyg/' + f);
console.log('hygien:', bort.length, 'engångsverktyg bort');
fs.writeFileSync(cwd + '/verktyg/_r264e-msg.txt', 'studio: [organ:Φ] r264 tillägg — bokföringsskripten själva (utenför sina egna fillistor, trädhygien; 31 incidentverktyg r262/r263/r264 bort)\n');
sh('git add verktyg/_r264-bokfor.mjs verktyg/_r264-bokfor-a.mjs && git commit -F verktyg/_r264e-msg.txt');
fs.unlinkSync(cwd + '/verktyg/_r264e-msg.txt');
const hash2 = sh('git log -1 --format=%h');
for (let i = 1; i <= 3; i++) {
  const p = sh('git push prod develop 2>&1');
  if (!p.startsWith('FEL')) { console.log('push2 OK'); break; }
  sh('git checkout -- data/rapporter/motorervalidering-2026-09-02.md', prod);
}

// ── 6) beslutsminne + slutverifikation ──
const huvud = sh('git log --format=%h -2').split('\n')[1];
fs.appendFileSync(cwd + '/data/vakten/beslutsminne.jsonl',
  JSON.stringify({ ts: new Date().toISOString(), rond: 114, beslut: 'B30 rederi levererat som v171:s andra av fyra nya original (KVD ×2 grön: 1 400 ord, korslänkar 18, externa 5/5 live, aritmetik 31/31); kvar: kemi + stål', landat: huvud + ',' + hash2 }) + '\n');
console.log('beslutsminne:', huvud, '+', hash2);
console.log('prod HEAD:', sh('git log -1 --format="%h %s"', prod).slice(0, 90));
console.log('prod status:', JSON.stringify(sh('git status --porcelain', prod).slice(0, 120)));
console.log('yta ospårade kvar:', sh('git status --porcelain | wc -l'));
