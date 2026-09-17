#!/usr/bin/env node
/**
 * GENERERAD av verktyg/ — dokvåg s9-u3 omgång 13: kartredigering via node-kanal
 * (clobber-kuren: en-träff-verifiering per ersättning, abort utan skrivning,
 * EN skrivning, omedelbar commit).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FIL = 'data/forskning/SYSTEMKARTAN.md';
let text = readFileSync(FIL, 'utf8');

const A2_NOTIS = `*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 13): ÅTERDIFFAD efter s5-spårets
lärvägsdjup-vågor — registret 352 → 396 kurser (+44) sedan 09-16-passningen;
slutrebasten (9e3bbf76, "358→396") stängde E01-registergapet atomärt (karta +
sökindex + speglar + siffror + llms i EN commit). ALLT EGENMÄTT 09-17:
larvag-karta.ts 435 r med LARVAG_ANTAL_KURSER = 396 i koden; larvag.ts 458 r
OFÖRÄNDRAD sedan våg 99 (deterministiska kärnan orörd genom hela tillväxten);
larvag-synk EGEN KÖRNING GRÖN 396=396=396 · 21 profilkurser · 0 fantomer;
LarvagKort lever på min-sida (rad 857); /laroplan 200 + /api/larvag 200
(loopback). FRONT B-leveransbevisen växt till 16 frontb-skript (senaste
_s5u3o11) men gap 1 lever: ingen EGEN regressionssvit för raknaLarvag-reglerna
(varför-rads-prioriteten kan regressera tyst); gap 3 lever (E2E med levande
inloggning overifierad). Score LEVER 7 kvar — kvantitativ tillväxt, kärnan
orörd, gapen oförändrade (E33/B14-precedensen).*`;

const E31_NOTIS = `*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 13): ÅTERDIFFAD (kartans äldsta
stämpel, 09-15). Motorvalidering EGEN KÖRNING: 107 PASS / 0 FAIL / 0 SKIP
(7,2 s) — MÖS-lagrets tredje dokumenterade gröna (09-13, 09-15, 09-17); notis:
rapporten skrivs till FAST filnamn motorervalidering-2026-09-02.md (vilseledande
namn, färskt innehåll — köpost: datumstämpel). Nyckelfilerna OFÖRÄNDADE i src
(motor 820 r · lager 890 r · termbank 540 r · kalla 346 r · kontroller 342 r)
men ordlista.ts 2 154 → 2 745 r (+591). Fallback-kön 320 poster OFÖRÄNDRAD;
termbank-tillagg.json TOM (0 poster). Speglar: 18 page.tsx per språk (en/ar);
rörelsen sedan 09-15 är PRESTANDAKurer från s7-spåret (bloggspegel-listornas
prefetch-kur 8fa5f0ce + CV-kur cd2b68ac), inga innehållsändringar i
översättningsskiktet. TIER-SPEGLARNA PRECISERADE (D23-korsnotis, egen find):
prenumeration + medlemskap HAR speglar (en/ar) men portfölj-ytorna SAKNAS
fortfarande — gap 4 lever med exakt yta. I1-auditen OPÅBÖRJAD (0 artefakter,
mätt igen). Läge PÅGÅR (I1) och score 7 kvar — auditen ÄR I1-läget.*`;

const B13_NOTIS = `*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 13): ÅTERDIFFAD efter s2-spårets
dataset-djup-vågor — bolagsunivers.json 120 → 153 bolag (+33; 458 144 B,
senaste skrivning 09-17 09:49) sedan 09-16-passningen. Båda egna sviterna
GRÖNA igen i egen körning (riskportfölj 32/0 + uppföljning 50/0, exit 0 —
tredje dokumenterade gången). SKÄRPNING: korstabell-grunden fortfarande FRUSEN
(mtime 09-10 16:33, 83 582 B, 100 rader) medan universum nått 153 — glidningen
FÖRDJUPAD till 53 bolag utan korstabellrad; gap 1 akutare (cadans/rop vid
universumsväxt). member/portfolio fortfarande UTAN lasMedlemSession (grep tomt
— gap 3 lever). Uppföljnings-cronen DUBBELT driven (/etc/crontab + vercel.json,
mätt) men 0 fundamental/akm2/akm3-cacher på disk (endast vagfundament-VOLV_B
09-14 = B7:s kända) — månadsronden 09-01 fyllde ej, nästa 10-01. KORSNOTIS A3:
mentorns nya lager portfoljgrund + portfoljbalans konsumerar universumet —
B13:s underlag matar numera AI-Mentorn direkt. Score LEVER 8 kvar
(preciseringsdokvåg).*`;

const NYSEKTION = `## UPPDATERING 2026-09-17 (dokvåg s9-u3 omgång 13 — A2 + E31 + B13 återdiffade; störst rörelse sedan passning + SSR-läkningen bokförd)

Objektval enligt varv-regeln "störst verklighetsrörelse sedan senaste
passning": A2 (17 src-commits på larvag-karta.ts sedan 09-16 — hela
s5-spårets lärvägsdjup låg EFTER passningen), E31 (kartans äldsta stämpel
09-15 + D23:s ointegrerade speglar-fakta), B13 (31 loggträffar;
bolagsunivers 14 commits). Allt EGENMÄTT i arbetsytan 09-17 (egna
svitkörningar med sanna exitkoder, node-läsning av JSON, find/grep,
loopback-curl, git log) — aldrig worklog. DRIFTFYND: förra omgångens AKUTA
SSR-500 (/kurser /analyser /blogg) är LÄKT — /kurser 200 · /blogg 200 ·
/laroplan 200 · /api/larvag 200 (egna loopback-sonder): prod-synkens
RAM-blockerade bygge landade; omgång 12:s kö 1 kan avbokas.

| System | Före (passning) | Nu (mätt 09-17) | Domkraft |
|---|---|---|---|
| A2 | 352 kurser, synk GRÖN (09-16) | 396 kurser; synk EGEN GRÖN 396=396=396 · 21 profiler · 0 fantomer; karta 435 r (konstant 396); larvag.ts 458 r orörd sedan v99; 16 frontb-sonder; /laroplan 200 | E01-rebasten stängde registergapet; gap 1 (regressionssvit) + gap 3 (E2E) lever |
| E31 | MÖS 107/0/0 (09-15); kön 320; speglar omätta | MÖS EGEN 107/0/0 (7,2 s, tredje gröna); ordlista 2 154→2 745 r; kön 320 oförändrad; termbankstillägg 0 poster; 18+18 speglar; tier-speglar preciserade (prenumeration/medlemskap FINNS, portfölj-ytorna SAKNAS); I1 0 artefakter | rapportnamn fast 2026-09-02 (vilseledande); D23-korsnotis integrerad |
| B13 | univers 120; sviter 32/0 + 50/0 (09-16) | univers 153 (+33); sviter EGEN 32/0 + 50/0 exit 0; korstabell-grund frusen 09-10 (100 r) = 53 bolag efter; member/portfolio fortfarande vaktlös; cron dubbel-driven, 0 cacher (nästa rond 10-01) | glidningen fördjupad; A3-korsnotis (portfoljgrund/balans-lagren) |

Poäng: A2 LEVER 7 · E31 PÅGÅR (I1) 7 · B13 LEVER 8 — OFÖRÄNDADE
(preciseringsdokvågor, E33/B14-precedensen). Snitt 7,5 / 286 / 38
oförändrat. Sidofixar: A1/A2-tabellradernas kurstal 390→396 (föråldrat av
9e3bbf76:s rebake; samma sidofix-klass som 223140e1:s 381→390).

Kö: (1) korstabell-cadansen (rop eller auto vid universumsväxt — 53 bolag
väntar); (2) regressionssvit för raknaLarvag (16 frontb-sonder att hämta
mönster ur); (3) motorvalideringsrapportens datumstämpel; (4)
member/portfolio-sessionsvakt (B13 gap 3); (5) I1-audit (E31:s eget mål).

`;

const ersattningar = [
  {
    namn: 'A2-stämpel+notis',
    hitta: '## A2. Lärvägen + läroplanen — LEVER — 7/10 *(uppdaterad 2026-09-16)*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 4):',
    ersatt: '## A2. Lärvägen + läroplanen — LEVER — 7/10 *(uppdaterad 2026-09-17)*\n\n' + A2_NOTIS + '\n\n*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 4):',
  },
  {
    namn: 'E31-stämpel+notis',
    hitta: '## E31. Flerspråkighet: MÖS + termbank + speglar — PÅGÅR (I1) — 7/10 *(uppdaterad 2026-09-15)*\n\n*Uppdatering 2026-09-15 (s9-u2 omgång 3):',
    ersatt: '## E31. Flerspråkighet: MÖS + termbank + speglar — PÅGÅR (I1) — 7/10 *(uppdaterad 2026-09-17)*\n\n' + E31_NOTIS + '\n\n*Uppdatering 2026-09-15 (s9-u2 omgång 3):',
  },
  {
    namn: 'B13-stämpel+notis',
    hitta: '## B13. Portföljforskning — LEVER — 8/10 *(uppdaterad 2026-09-16)*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 5):',
    ersatt: '## B13. Portföljforskning — LEVER — 8/10 *(uppdaterad 2026-09-17)*\n\n' + B13_NOTIS + '\n\n*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 5):',
  },
  {
    namn: 'A2-tabellrad',
    hitta: '| A2 | Lärvägen + läroplanen | Utbildning | LEVER | 7 | H1 stängt sedan v99 (kartan efter); 390 kurser, paritetssynk GRÖN 390=390=390 (egen körning 09-17), front-B-bevis; regressionssvit för rekommendationsreglerna saknas |',
    ersatt: '| A2 | Lärvägen + läroplanen | Utbildning | LEVER | 7 | Registret 396 (rebake stängde E01); synk EGEN GRÖN 396=396=396 · 21 profiler (09-17); kärnan larvag.ts orörd sedan v99; 16 front-B-sonder; regressionssvit för rekommendationsreglerna + E2E-inloggning saknas |',
  },
  {
    namn: 'A1-tabellrad sidofix 390→396',
    hitta: '| A1 | Kursplattformen (390 kurser, quiz, XP, case) |',
    ersatt: '| A1 | Kursplattformen (396 kurser, quiz, XP, case) |',
  },
  {
    namn: 'E31-tabellrad',
    hitta: '| E31 | Flerspråkighet (MÖS + termbank + speglar) | Styrning | PÅGÅR (I1) | 7 | MÖS-röden i motorvalideringen BORTA (107/0/0 mätt 2026-09-15 — gamla fyndet historik); I1-kvalitetsaudit + tier-spegel-gap kvar |',
    ersatt: '| E31 | Flerspråkighet (MÖS + termbank + speglar) | Styrning | PÅGÅR (I1) | 7 | MÖS grönt tredje gången (107/0/0 egen 09-17); ordlista 2 154→2 745 r; kön 320 låst; tier-speglar preciserade (prenumeration/medlemskap finns, portfölj-ytorna saknas); I1-audit opåbörjad; rapportnamn fast 2026-09-02 |',
  },
  {
    namn: 'B13-tabellrad',
    hitta: '| B13 | Portföljforskning (korstabell, risk, uppföljning, byggare) | Analys | LEVER | 8 | Sviter 32/0 + 50/0 gröna (mätt 09-16); korstabell-grund frusen 09-03 (100 r) mot bolagsunivers 120; member/portfolio UTAN sessionsvakt på publik yta (/min-portfolj, mätt); peer-median = designbeslut (AKM3 §10.10) |',
    ersatt: '| B13 | Portföljforskning (korstabell, risk, uppföljning, byggare) | Analys | LEVER | 8 | Sviter 32/0 + 50/0 gröna (egen 09-17); korstabell-grund frusen 09-10 (100 r) mot bolagsunivers 153 — glidningen 53 bolag; member/portfolio utan sessionsvakt; universumet matar numera A3:s portföljlager |',
  },
  {
    namn: 'ny UPPDATERING-sektion före ÖVERSIKT',
    hitta: '## ÖVERSIKT — 38 system',
    ersatt: NYSEKTION + '## ÖVERSIKT — 38 system',
  },
];

let fel = 0;
for (const e of ersattningar) {
  const n = text.split(e.hitta).length - 1;
  if (n !== 1) {
    console.error('ABORT — "' + e.namn + '" har ' + n + ' träffar (krav: 1)');
    fel = 1;
    break;
  }
}
if (fel) {
  console.error('Ingen skrivning gjord.');
  process.exit(1);
}
for (const e of ersattningar) {
  text = text.replace(e.hitta, e.ersatt);
  console.log('OK — ' + e.namn);
}
writeFileSync(FIL, text);
console.log('SKREV — ' + FIL + ' (' + text.length + ' tecken)');
