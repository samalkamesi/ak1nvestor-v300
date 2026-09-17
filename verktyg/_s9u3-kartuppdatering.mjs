#!/usr/bin/env node
/**
 * GENERERAD av verktyg/ — dokvåg s9-u3 omgång 12: kartredigering via node-kanal
 * (clobber-kuren: unika ankarsträngar, EN läsning→EN skrivning, omedelbar commit).
 * Raderas efter commit (worklog-mönstret).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FIL = 'data/forskning/SYSTEMKARTAN.md';
let txt = readFileSync(FIL, 'utf8');
const gjorda = [];

function ersatt(old, ny, label) {
  const n = txt.split(old).length - 1;
  if (n !== 1) {
    throw new Error(`[${label}] förväntade 1 träff, fick ${n} — ABORTERAR utan skrivning`);
  }
  txt = txt.replace(old, ny);
  gjorda.push(label);
}

// ── A1: rubrikdatum ──
ersatt(
  '## A1. Kursplattformen — LEVER — 8/10 *(uppdaterad 2026-09-15)*',
  '## A1. Kursplattformen — LEVER — 8/10 *(uppdaterad 2026-09-17)*',
  'A1-rubrik',
);

// ── A1: ny återdiff-notis efter notiskedjan ──
ersatt(
  '· 21 profiler; quiz 8 223 fortfarande oförändrat).',
  `· 21 profiler; quiz 8 223 fortfarande oförändrat).

*Återdiff 2026-09-17 (s9-u3 omgång 12): talen 390 → **396 kurser** (siffror.json
uppdaterad 2026-09-17 · deep-courses.json 396 nycklar/18,8 MB mtime 11:39 idag ·
larvag-synk EGEN körning GRÖN: register 396 = karta 396 = konstant 396, 21
profiler, 0 fantomer, exit 0); quiz 8 223 / XP 82 230 / fas-set 18+24 bekräftade
oförändrade i guldkällan (data/bokmaster/ bär 105 filer mot siffrorns 103 —
kosmetisk diskrepans, köpost); s5-spåret levererar vidare (idag pe-03 + mt-04).
DRIFTFYND I FÖNSTRET: /kurser och /kurser/[slug] svarar HTTP 500 i prod (localhost
+ https, egna sonder ~12:0xZ) — ChunkLoadError: server/chunks/ssr/_1tjfn0y._.js
SAKNAS på disk (pm2-loggen 12:00Z); rot: patch-köns bygge 11:39Z föll utan ny kod
och felgrenen "revert hoppas" lämnade .next halvtrasigt (prod-synk.loggen —
o47:s felgren ÅTER, r58-kuren greppte ej) medan läkningen är RAM-blockerad
(prod-synken 11:57Z VÄNTAR-RAM 872<2200, agentfabriken håller minnet) — ytan
onåbar för kunden tills synkens nästa bygge landar; statiskt / 200. Gap 1
oförändrat (kurs-access-testsvit: 0 träffar i verktyg/, mätt).*`,
  'A1-notis',
);

// ── A1: Vad-raden 352 → 396 ──
ersatt(
  '- **Vad:** Plattformens ryggrad: 352 kurser × 3 språk',
  '- **Vad:** Plattformens ryggrad: 396 kurser × 3 språk',
  'A1-vad',
);

// ── C17: rubrikdatum ──
ersatt(
  '## C17. Dataset-citeringsmagneterna — LEVER — 9/10 *(uppdaterad 2026-09-15)*',
  '## C17. Dataset-citeringsmagneterna — LEVER — 9/10 *(uppdaterad 2026-09-17)*',
  'C17-rubrik',
);

// ── C17: ny återdiff-notis ──
ersatt(
  'testtäckningen föll tyst — netto noll.*',
  `testtäckningen föll tyst — netto noll.*

*Återdiff 2026-09-17 (s9-u3 omgång 12): kvartalsunderlaget 28 → **40 Kön-filer**
(ls-mätt: 30 bolagspaket sa-laser-du-* + 10 branschkalendrar i
data/blogg-utkast/kvartal/2026-q3) men /kvartalsdata-src fortfarande 0 filer —
H3 orört, gap 1 växer bara tyngre av eget underlag. Gap 0 BEKRÄFTAD oförändrad:
testa-dataset-aspekter.mjs dör fortfarande OFÅNGAT (ERR_MODULE_NOT_FOUND
'./ordlista' importeras ändelselöst av dataset-medianer.ts — egen körning ~12:0xZ,
identiskt med 09-15-fyndet). Läckagevakten v98 GRÖN i egen körning (exit 0):
0 träffar, 153 tickers + 153 namn sökta i 3 utdatafiler — kontraktet §1 håller.
DRIFTFYND: /dataset, /dataset/energi och aspektrutten svarar HTTP 500 i prod
(egna sonder; vid 09-15-mätningen 200) — chunk-roten, se A1-notisen; ytan
omätbar grön tills läkningen. Score 9 kvar — fynden är drift + oförändrade gap.*`,
  'C17-notis',
);

// ── C18: rubrikdatum ──
ersatt(
  '## C18. SEO/schema/llms.txt — LEVER — 9/10 *(uppdaterad 2026-09-15)*',
  '## C18. SEO/schema/llms.txt — LEVER — 9/10 *(uppdaterad 2026-09-17)*',
  'C18-rubrik',
);

// ── C18: ny återdiff-notis ──
ersatt(
  'Kursantalet i G1-gapet rättat 333 → 337. Score 9 kvar.*',
  `Kursantalet i G1-gapet rättat 333 → 337. Score 9 kvar.*

*Återdiff 2026-09-17 (s9-u3 omgång 12): sitemap 1 998 → **2 239 URL:er**
(localhost /sitemap.xml 200, loc-räknat, egen sond); sok-index.json FÄRSK: 396
poster genererade 2026-09-17 (public/, mtime 11:39 — kopplingen lever men
förblir manuell disciplin, gap 3 kvar); llms.txt + llms-full-txt + robots.txt
200 (egna sonder); seo.tsx 841 r oförändrad; OG-deploy-kopling fortfarande 0
träffar i deploya-contabo.sh (gap 2 kvar). SVITFYND: testa-schema-kurser
UNDERKÄNT med SANN exit 1 (egen körning, exitkod fångad utan pipe) — men ALLA
sidfel är HTTP 500 på localhost-kurssidor: DRIFT, ej schema-kod (444/0-grönt
09-15 gällde när ytan svarade; inget schema har ändrats). Searchbot-hälsan:
/kurser /analyser /blogg /labb /dataset bär 500 i prod JUST NUPT (chunk-roten,
se A1-notisen) medan statiska SEO-ytor (/, llms×2, robots, sitemap) är gröna.
Score 9 kvar — felen är drift, inte systemets kod; gap-listan oförändrad.*`,
  'C18-notis',
);

// ── Epilog: diff-cykelkrönikan ──
ersatt(
  'A3 korsvaliderat mot u2 omgång 8 med identiska oberoende tal (24 lager/80 monsters/E01 358/390).',
  `A3 korsvaliderat mot u2 omgång 8 med identiska oberoende tal (24 lager/80 monsters/E01 358/390); u2 omgång 9 (09-17) diffade D22/D23 read-only (R2-ytorna, deras sektion). u3 omgång 12 (09-17, tredje varvet — de mest mogna 09-15-systemen) återdiffade A1/C17/C18 utan poängrörelser: A1 396 kurser (larvag GRÖN egen körning) + DRIFTFYND /kurser 500 (chunk _1tjfn0y saknas, patch-köns felgren igen, läkning RAM-blockerad), C17 kvartalskö 40 filer + gap 0 oförändrad + v98 GRÖN + /dataset 500, C18 sitemap 2 239 + sok-index färskt 396 + schemasvit UNDERKÄNT AV DRIFT.`,
  'epilog',
);

// ── Ny UPPDATERING-sektion före ÖVERSIKT ──
const nySektion = `## UPPDATERING 2026-09-17 (dokvåg s9-u3 omgång 12 — A1 + C17 + C18 återdiffade; tredje varvet + AKUT DRIFTFYND: prod SSR-ytor 500)

Val (anspråk FÖRE byggstart, data/vakten/auto-s9-1789646128050-u3-ansprak.md):
spårets mogenhet-regel — diffade 2026-09-15 i första varvet, ALDRIG
återdiffade, rankade på störst rörelse: A1 (kurser 352→396 sedan dess), C17
(kvartalskön 22→28→40 + guldkällans två vågor), C18 (prod-incidenten + döda
länkar-återmätningen). Syskonrace: u2 omgång 9 (D22+D23) landade under
fönstret — deras sektion orörd (s10-u3-kuren); u1:s logg tom vid anspråk.
Allt MÄTT i arbetsytan (node-läsning av guldkällor, egna svitkörningar med
SANN exitkod, curl-sonder localhost + https, pm2-loggen, prod-synk.loggen,
fuser-grind mot deployfönster enligt o47 §2) — aldrig worklog-läsning.

A1 LEVER 8 kvar: 396 kurser bevisat tre vägar (siffror.json 09-17 ·
deep-courses 396 nycklar · larvag-synk EGEN GRÖN 396=396=396, 21 profiler,
0 fantomer, exit 0); quiz 8 223 / XP 82 230 / fas 18+24 oförändrade;
bokmaster-diskrepans 105 filer på disk mot 103 i siffror (kosmetik, köpost);
gap 1 oförändrad (kurs-access-svit 0 träffar). C17 LEVER 9 kvar: kvartalskön
40 filer (30 paket + 10 kalendrar) mot H3 = 0 src-filer; gap 0 BEKRÄFTAD
(aspektsviten dör OFÅNGAT på './ordlista'-importbro, identiskt 09-15); v98
GRÖN 0 träffar (153+153 × 3 utdatafiler). C18 LEVER 9 kvar: sitemap 2 239 ·
sok-index färskt 396 (09-17 11:39) · llms×2 + robots 200 · OG-kopling 0
träffar kvar · schemasviten UNDERKÄNT sann exit 1 = 100 % driftfel (500).

DRIFTFYND (AKUT, bokförd i alla tre sektionerna): prod-SSR-ytor 500
(/kurser /analyser /blogg /labb /dataset × båda nivåerna; localhost OCH
https, egna sonder 12:0xZ) medan statiskt / 200. ROT: ChunkLoadError —
server/chunks/ssr/_1tjfn0y._.js SAKNAS på disk (pm2-loggen 12:00Z);
kedjan: patch-kön (next@16.3.5) föll 11:39Z "bygg misslyckades utan ny
kod … (revert hoppas: koden är deployad sedan tidigare)" = o47:s felgren
ÅTER — .next lämnades halvtrasigt och pm2 startad 11:39 kör döda
chunk-referenser; LÄKNINGEN BLOCKERAD: prod-synken 11:57Z VÄNTAR-RAM
872<2200 MB medan agentfabriken (3 barn/omgång) håller minnet — prod
trasig tills RAM frigörs och synkens bygge landar. PARADOX-köpost: en
grön vakthelkörning rapporterades 11:50:11Z (o48:s bevisrad) medan
/kurser var 500 vid 12:00 — gränsnittsvaktens SSR-500-detektering ses
över. r58-kuren ("OMBYGG på god lock när patchbygget faller utan ny
kod") greppte ej i 11:39-fallet — verkade eller täckte ej patch-grenen.

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A1 | LEVER 8 → **LEVER 8** | Talen 352→396 (tre oberoende källor + synk GRÖN egen) men inga gap stängda/öppnade i koden; /kurser-500 är drift (chunk-roten), ej systemgap — ingen poängrörelse (E33/B14-precedensen) |
| C17 | LEVER 9 → **LEVER 9** | Lägesbekräftelse: v98 GRÖN, kö 28→40, gap 0+1 oförändrade; /dataset-500 = drift — ingen poängrörelse |
| C18 | LEVER 9 → **LEVER 9** | Sitemap 2 239 + sok-index färskt = kunskap tillförd; svitens UNDERKÄNT = drift (500), ingen kodförändring; gap 2+3 kvar — ingen poängrörelse |

Snittscore **7,5** (286 poäng / 38 system — oförändrad; tre
preciseringsdokvågor, syskonens ev. poängrörelser räknas i deras sektioner).

Kö till huvudagenten: (1) **AKUT**: prod-SSR 500 — påskynda prod-synkens
RAM-fönster (fabriksmellanrum) så läkningsbygget landar; (2) o47:s
felgren "revert hoppas vid fall utan ny kod" fortfarande levande i
patch-köfallet trots r58 — rotorsaka igen med 11:39Z-loggen som bevis;
(3) gränsnittsvaktens SSR-500-detektering (grön 11:50Z mot röd verklighet
12:00Z); (4) C17 gap 0: importbro './ordlista' (v82-mönstret); (5)
siffrorns bokmaster 103 vs diskens 105 i nästa rakna-siffror-rebake.

`;
ersatt('## ÖVERSIKT — 38 system', nySektion + '## ÖVERSIKT — 38 system', 'UPPDATERING-sektion');

writeFileSync(FIL, txt);
console.log('KARTA UPPDATERAD —', gjorda.length, 'ersättningar:', gjorda.join(' · '));
