// s9-u1 omgång 12 — E26 Admin-panelen återdiff i SYSTEMKARTAN + worklog-append.
// Clobber-kur: varje ersättning verifierar EXAKT EN träff, EN skrivning per fil,
// abort utan skrivning vid avvikelse. Worklog appendas ENDAST om kartan skrevs.
import fs from 'node:fs';

const KARTA = '/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md';
const WORKLOG = '/home/ak1a/AK1/worklog.md';

const ersattningar = [
  // 1) E26-rubrikens stämpel
  [
    '## E26. Admin-panelen — LEVER — 8/10 *(uppdaterad 2026-09-15)*',
    '## E26. Admin-panelen — LEVER — 8/10 *(uppdaterad 2026-09-17)*',
  ],
  // 2) Nyckelfilernas ruttantal: räknekorrigering 24 → 25
  [
    'src/app/api/admin/** (24 rutter)',
    'src/app/api/admin/** (25 rutter — räknekorrigering 09-17: 0 nya ruttfiler i git sedan 09-15, 09-15-notisens 24 var räkneavvikelse)',
  ],
  // 3) GAP 5: FP-kön fördubblad 8 → 17 + FLYTTKLAR 21 → 63
  [
    '(5) NY: juridikgrind-vaktens ordlista ger 8 FP-VARNINGAR\n  på meta-texter som CITERAR förbudsorden (t.ex. gransknings-MD:er som\n  redovisar "0 träffar på köp/sälj-råd") — grinden lär sig skilja citat\n  från råd; (6) NY: publicera-vägen',
    '(5) SKÄRPT 09-17: FP-kön FÖRDUBBLAD — 8 → 17 VARNINGAR (larmfilens\n  senaste körning 11:37Z; 0 FEL kvar) på meta-texter som CITERAR\n  förbudsorden; FLYTTKLAR-strängen i utkastkön 21 → 63 filer sedan 09-15 —\n  granskningskön växer rakt in i vakten, grinden lär sig skilja citat\n  från råd; (6) NY: publicera-vägen',
  ],
  // 4) Ny sektionsnotis efter 09-15-notisen (ankare: E26:ets unika Vad-rad)
  [
    '- **Vad:** "WordPress på långt håll": 15+ flikar',
    `*Uppdatering 2026-09-17 (s9-u1 omgång 12, andra varvet): ÅTERDIFFAD med\negna mått — 09-15-läget bekräftat och STÄRKT: audit-loggen 68,7 KB →\n258 969 byte / 1 008 rader (301 unika aktörer; 357 uppgift_start +\n334 uppgift_klar + 162 modellkatalog-synk + 143 deploy + 8 tier3-\nkomprimeringar + 1 fabrikskirurgi + 1 beslut + 1 deploy_revert) =\nfabrikens FAKTISKA driftlogg, span 09-14 23:19:59Z → levande (sista\nraden = fabriksbarns start 11:55:28Z idag); admin-sessionssviten 14/14\nGRÖN i egen körning igen; requireAdmin MÄTT LIVE (401 på\n/api/admin/variabler och /api/studio/godkannande utan auth); /admin-\nsidans 500 = o47-driftklassen (samma sekund: /kurser + /blogg 500, /\n200 — SSR-felet, ej admin-specifikt; API-lagret oskadat). Skärpningar:\njuridikgrindens FP-kön 8 → 17 VARNINGAR + FLYTTKLAR 21 → 63 utkastfiler\n(gap 5 brittare); R2-knappen orörd — godkannande-val.json finns\nfortfarande ej (flödet kodbevisat, ej körbevisat); paneler 16 +\nadmin-auth.ts 245 r oförändrade; sessionStorage-resterna lever (77\nträffar x-admin-password i src/); rate-limit på 8 av 25 rutter, IP-block\n0 träffar; GDPR-DATAKARTA.md lever (24 026 B). Score 8 kvar.*

- **Vad:** "WordPress på långt håll": 15+ flikar`,
  ],
  // 5) ÖVERSIKT-raden för E26
  [
    '| E26 | Admin-panelen ("WordPress-drömmen") | Styrning | LEVER | 8 | Godkännandeyta + audit + mekanisk juridikgrind LEVER (mega-beslut spår 1–2, mätt 2026-09-15); kvar: manuell spegling, juridik-FP på meta-texter, publicera-E2E (R2-knapp orörd) |',
    '| E26 | Admin-panelen ("WordPress-drömmen") | Styrning | LEVER | 8 | Audit-loggen 3,8× aktivare på 2 dygn (258 969 B / 1 008 rader / 301 aktörer / 143 deploy — fabrikens faktiska driftlogg, mätt 09-17); sviten 14/14 grön igen + requireAdmin 401 live båda ytorna; /admin-500 = o47-driftklassen (API oskadat); juridik-FP 8→17 + FLYTTKLAR 21→63 (gap 5 brittare); kvar: manuell spegling, publicera-E2E (R2-knapp orörd — val-filen finns ej), IP-block |',
  ],
  // 6) Snitt-historikens tillägg efter u3 omgång 11-meningen
  [
    'A3 korsvaliderat mot u2 omgång 8 med identiska oberoende tal (24 lager/80 monsters/E01 358/390).',
    'A3 korsvaliderat mot u2 omgång 8 med identiska oberoende tal (24 lager/80 monsters/E01 358/390). s9-u1 omgång 12 (09-17, andra varvet) återdiffade E26 utan poängrörelse — audit-loggen 3,8× aktivare (1 008 rader/301 aktörer/143 deploy = fabrikens faktiska driftlogg), sviten 14/14 grön igen, requireAdmin 401 live på båda ytor, /admin-500 = o47-driftklassen (API oskadat), juridik-FP 8→17 + FLYTTKLAR 21→63 (gap 5 brittare), 25 rutter (räknekorrigering, 0 nya i git sedan 09-15); R2-knappen orörd som väntat.',
  ],
  // 7) Nytt UPPDATERING-block före ÖVERSIKT-rubriken
  [
    '## ÖVERSIKT — 38 system',
    `## UPPDATERING 2026-09-17 (dokvåg s9-u1 omgång 12 — E26 Admin-panelen återdiffad; andra varvet)

| Yta | Kartan sa (09-15) | Verkligheten MÄTT 2026-09-17 (~14:0x lokal) |
|---|---|---|
| Audit-loggen (E26) | 68 677 byte aktiv | **258 969 byte / 1 008 rader** (3,8×) — 301 unika aktörer; åtgärder: 357 uppgift_start · 334 uppgift_klar · 162 modellkatalog-synk · 143 deploy · 8 komprimering_tier3 · 1 fabrikskirurgi · 1 beslut · 1 deploy_revert · 1 g2-fullbordande; span 09-14 23:19:59Z → LEVANDE (sista raden = fabriksbarns start 11:55:28Z idag) — mega-beslut spår 2 är fabrikens FAKTISKA driftlogg |
| Admin-sessionssviten (E26) | 14/14 (mätt 09-15) | **14/14 KÖRD GRÖN igen** (egen körning: rollmatris, v79-500-gren, ekar-aldrig-lösenordet) |
| Admin-API-rutter (E26) | 24 rutter | **25 route.ts** — räknekorrigering: git diff-filter=A sedan 09-15 = 0 nya ruttfiler (09-15-notisens 24 var räkneavvikelse, ej tillväxt) |
| requireAdmin i prod (E26) | antaget | **MÄTT LIVE**: /api/admin/variabler utan auth ⇒ 401 · /api/studio/godkannande utan auth ⇒ 401; /admin-sidans 500 ÄR o47-driftfelet (samma sekund: /kurser + /blogg 500, / 200 — SSR-klassen, ej admin-specifikt; API-lagret oskadat) |
| Juridikgrind-vakten (E26 gap 5) | GUL 0 FEL / 8 FP-VARNINGAR | **GUL 0 FEL / 17 VARNINGAR** (larmfilens senaste körning 11:37:28Z idag) — FP-kön FÖRDUBBLAD på 2 dygn; FLYTTKLAR-strängen nu i **63** utkastfiler (21 vid 09-15-mätningen) = granskningskön växer rakt in i vakten |
| Godkännandeval-filen (E26 gap 6) | saknas (R2-knappen orörd) | **FINNS FORTFARANDE EJ** — kundens publiceringsknapp förblir orörd; flödet kodbevisat, ej körbevisat |
| Övriga ytor (E26) | — | paneler 16 oförändrade · admin-auth.ts 245 r oförändrad · audit-logg.ts 130 r · sessionStorage-rester lever (77 träffar x-admin-password i src/) · rate-limit 8 av 25 rutter · IP-block 0 träffar · GDPR-DATAKARTA.md lever (24 026 B, mtime 09-15) |

| E26 | LEVER 8 → **LEVER 8** | Preciseringsdokvåg utan poängrörelse (E33/B14-precedensen): styrkorna bekräftade med färska egna mått (audit 3,8× aktivare, sviten grön, vakten 401 live) men juridik-FP-kön fördubblad (8→17) + FLYTTKLAR 21→63 gör gap 5 BRITTARE — vakten drunknar gradvis i granskningsköns meta-texter; publicera-E2E förblir kundens (R2). Kö till huvudagenten: juridikgrindens citat-vs-råd-kur hastas (63 väntande filer), IP-block förblir öppet |

## ÖVERSIKT — 38 system`,
  ],
];

let text = fs.readFileSync(KARTA, 'utf8');
for (const [fran, till] of ersattningar) {
  const n = text.split(fran).length - 1;
  if (n !== 1) {
    console.error(`ABORT: "${fran.slice(0, 60)}…" matchade ${n} gånger (krav: 1)`);
    process.exit(1);
  }
  text = text.replace(fran, till);
}
fs.writeFileSync(KARTA, text);
console.log('KARTA: 7 ersättningar OK, skriven');

const worklogRad = `
## SPÅR 9 s9-u1 omgång 12 — 2026-09-17 ~14:0x lokal: SYSTEMKARTAN dokvåg — E26 Admin-panelen återdiffad (andra varvet) [fabrik]

Leverans: E26 LEVER 8 kvar — allt MÄTT i arbetsytan (svitkörning, node-läsning av audit-loggen, grep, git log, live-sonder loopback): audit-megasystemet 3,8× aktivare på 2 dygn (68 677 → 258 969 byte / 1 008 rader / 301 unika aktörer; åtgärder 357 start + 334 klara + 162 modellkatalog-synk + 143 deploy + 8 tier3 + 1 deploy_revert = fabrikens FAKTISKA driftlogg, span 09-14 23:19:59Z → levande); admin-sessionssviten 14/14 GRÖN egen körning igen; requireAdmin MÄTT LIVE (401 på /api/admin/variabler + /api/studio/godkannande utan auth); /admin-sidans 500 klassificerad som o47-driftfelet (samma sekund /kurser + /blogg 500, / 200 — SSR-klassen, ej admin-specifikt, API-lagret oskadat). SKÄRPNINGAR: juridikgrindens FP-kön 8 → 17 VARNINGAR (larmfil 11:37Z idag, 0 FEL) + FLYTTKLAR-strängen 21 → 63 utkastfiler — granskningskön växer rakt in i vakten, gap 5 brittare. Räknekorrigering: 25 admin-rutter (09-15 sa 24; git diff-filter=A sedan 09-15 = 0 nya — avvikelse ej tillväxt). R2-knappen orörd som väntat (godkannande-val.json finns fortfarande ej = flödet kodbevisat, ej körbevisat); paneler 16 + admin-auth 245 r oförändrade; sessionStorage-rester 77 träffar; rate-limit 8/25; IP-block 0; GDPR-kartan lever. Snitt 7,5 / 286 / 38 oförändrat (preciseringsdokvåg, E33/B14-precedensen). KOLLISIONSHANTERING: s9-u2:s D22+D23-diff låg osparkad i kartan vid mätningens slut — deras sektioner orörda, denna väntade ut deras commit före skrivning (disk-först, clobber-kuren). Kö till huvudagenten: (1) juridikgrindens citat-vs-råd-kur (63 väntande filer växer); (2) IP-block på admin-ytan; (3) publicera-E2E förblir kundens första knapptryckning. Endast data/forskning/SYSTEMKARTAN.md + worklog.md + verktyg/_s9u1-e26-* = INGET bygge; src/ orörd (tsc 0 via grinden); R2 orörd — inga priser/tier/publicering rörda; data/blogg/ orörd. [fabrik]
`;
fs.appendFileSync(WORKLOG, worklogRad);
console.log('WORKLOG: 1 post appenderad');
