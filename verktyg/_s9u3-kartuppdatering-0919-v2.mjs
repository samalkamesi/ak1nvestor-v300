#!/usr/bin/env node
// s9-u3 (manifest auto-s9-1789800329491) — SYSTEMKARTAN-uppdatering: B8 + B13 + C18
// Regler: en-träff-ankare, abort-grind (INGET skrivs om något ankare ej är unikt),
// EN atomär skrivning. Pivot: D20+B9 avstådda till syskonen (u1 levererade D20,
// u2 mäter B9) — deras sektioner RÖRS EJ.
import fs from "node:fs";

const KARTA = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
let text = fs.readFileSync(KARTA, "utf8");

const UPPDATERING = `## UPPDATERING 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789800329491 — B8 + B13 + C18 diffade mot verkligheten; D24-PIVOT efter samma-minut-anspråk + AKUT DRIFTFYND under fönstret)

Fabriksagent s9-u3 (byggare 3/3). Ursprungsval B8+D20+B9 (anspråk på disk
08:47 lokal) landade SAMMA minut som syskonens (u1 D20 · u2 D20+B9) — u1
LEVERERADE D20 under fönstret (deras sektion orörd, respekterad) och u2:s
B9-mätning var igång ⇒ D24-pivot-precedensen: D20+B9 AVSTÅNDA; mina tagna
värden för båda bokförs här som OBEROENDE KORSVALIDERING + B9-gåva på disk
(data/vakten/auto-s9-1789800329491-s9-u3-b9-gava.md). Nyval enligt
mogenhetsregeln: B8 (09-16, äldsta fria) + B13 + C18 (09-17-klassen, fria).
Allt EGENMÄTT 06:50–07:05Z.

KORSVALIDERING D20 (u1:s leverans bekräftad exakt): svit 17/17 grön ·
medlem-auth.ts 556 r kodstilla sedan d83915fb 09-11 · medlem-inloggning.tsx
301 r (10f7b75f 09-12 — kartans "220 r" var inaktuellt; u1 rättade samma tal)
· speglarna /en/logga-in + /ar/logga-in 200 (korrekta lang/dir) · GET
/api/medlem 405 + POST ogiltig action 400 {"fel":"Ogiltigt action."}.

KORSVALIDERING B9 (u2:s sektion — talen deras att bokföra): skans genererad
2026-09-19T05:05:21.478Z (12/12 tickers) · svit 57/57 · SENASTE-domar 09-04
(filer 09-10) serveras live av /api/data/vagstatistik · STORFYND: natt-
exporterna 09-17/18/19 saknar ALLA vagscan-rader (09-16-filen: rad
05:05:24Z) trots fönster som täcker senare körningar — medan tabellen
bevisat bär DAGENS rad (senaste-ruten läser system_events); två grenar
(tysta Vercel-skrivfel 09-17+18 ELLER export-källan skiljer sig — E33:s
tväprojektsklass); avgörs av nattens 09-20-export ⇒ KÖPOST E33.

AKUT DRIFTFYND (mät-fönstret 07:0xZ, eskalerad HÖG i feljakt-ledgern +
DRIFTSBOKEN-notis): två misslyckade synkbyggen (06:58:57Z + 07:01:27Z)
halvrev .next (mtime 07:00:21Z) utan pm2-omstart ⇒ manifest-offerklassen
(o83 §4) TREDJE fönstret idag: /_not-found + /portfolj-forskning +
/portfoljbyggare + /rapporter + /llms-full-txt + /kurser 500 (växande)
medan / /blogg /ar /min-portfolj /sitemap /llms.txt /robots gröna; bot =
synkens nästa gröna bygg (RAM fritt 07:04Z) — ALDRIG eget (våg 100);
rot-fråga bokförd hos synkägaren (misslyckade byggen SKRIVER i .next).
Schema-sviten EJ körd under aktivt driftbrott (09-17-precedensen: drift,
ej kod).

| System | Kartans påstående | Verkligheten (mätt) | Dom |
|---|---|---|---|
| B8 | regimen frusen 09-03 (14 d); Contabo-crontab saknar rad; svit 55/55 | regime-logg 1 rad 09-03 + kalibrering-logg 1 rad 09-04 + /api/forskningslage EXAKT genesis-tal (100/7/76/17, 16 d); /etc/crontab (mtime 09-08) + tom användar-crontab: ingen akm3/vagvalidering-rad; vercel 10-02; 55/55 exit 0 EGEN; lib 2 113 r stilla 09-04 | KVARSTÅR (16 d) |
| B13 | universum 153, glidning 53; sviter 32/50; member/portfolio utan vakt | universum 195 (+42 på 2 d; 09-19 02:09Z), korstabell FRUSEN 100 r (09-10) ⇒ glidning 95; 32/0 + 50/0 EGENA (fjärde); member/portfolio 0 lasMedlemSession (108 r); 0 fundamental/akm2/akm3-cacher (data/cache 40 f); lib stilla 09-09 | GLIDNINGEN 53→95 |
| B13 | (publika ytor) | /portfolj-forskning + /portfoljbyggare + /rapporter 500 (manifest-offer, drift) · /min-portfolj 200 | DRIFT, ej kod |
| C18 | sitemap 2 239; sok-index 396 (09-17); llms×2+robots 200 | sitemap 2 420 (+181); sok-index 440 kurser genererat 09-19 (FÄRSKAST); llms.txt 200 (205 kB) + robots 200 (6,2 kB) MEN llms-full-txt 500 (drift); seo.tsx 842 r (1245141e 09-15); schema-kurser.ts 193 r; og-generate 0 träffar i deploy-skriptet | TILLVÄXT; gap 2+3+G1 kvar |
| C18 | schema-svit | EJ körbar under aktivt driftbrott (/kurser 500) — 09-17-precedensen | DRIFT-paus |

Poäng: INGA poängrörelser (E33/B14-precedensen); snitt 7,6/287/38. Kö:
(1) E33: nattexportens vagscan-skillnad (09-20-dumpen avgör) + 09-16-radens
försvinnande ur 09-17-filen; (2) synkägaren: .next-skrivning vid misslyckat
bygge (DRIFTSBOKEN-notisen); (3) B13: korstabell-cadans/rop vid universumsväxt
(glidningen 95); (4) B8-cur: Contabo-rad för akm3-kalibrering/vagvalidering.
KVD: endast SYSTEMKARTAN + worklog + anspråk + kartskript + DRIFTSBOKEN-notis
+ ledger-rad (data/vakten gitignorerad) — INGET bygge; src/ orörd; R2 orörd;
data/blogg/ orörd; syskonens ytor orörda.

`;

const B8_RUBRIK_GAMMAL = "## B8. AKM3 (regim, kalibrering, ensemble) — PÅGÅR — 7/10 *(uppdaterad 2026-09-16)*";
const B8_RUBRIK_NY = `## B8. AKM3 (regim, kalibrering, ensemble) — PÅGÅR — 7/10 *(uppdaterad 2026-09-19)*

*Uppdatering 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789800329491, återdiff
tredje varvet): fruset återmätt med egna mätningar — kalibrering-loggen 1 rad
(09-04, ΔΦ=0, 0 episoder, alla faser "vantar-grind") · regime-loggen 1 rad
(genesis 09-03, "magert", grön 7 %/röd 17 %) och /api/forskningslage levererar
EXAKT genesis-talen live (100/7/76/17 — 16 d fruset; chipet åldrar osynligt för
eleven) · /etc/crontab (mtime 09-08) + tom användar-crontab: fortfarande INGEN
akm3-kalibrering/vagvalidering-rad (gap 4 orörd) · vercel.json "20 5 2 * *" ⇒
nästa molnrond 2026-10-02 · sviten 55/55 PASS exit 0 EGEN (femte dokumenterade
gröna; 09-17:s engångsfall visade sig ej) · lib 2 113 r EXAKTA (172/1 161/144/
472/164), kodstilla sedan e9a75fab 09-04 (15 d). Score 7 kvar, PÅGÅR kvar.*`;

const B13_RUBRIK_GAMMAL = "## B13. Portföljforskning — LEVER — 8/10 *(uppdaterad 2026-09-17)*";
const B13_RUBRIK_NY = `## B13. Portföljforskning — LEVER — 8/10 *(uppdaterad 2026-09-19)*

*Uppdatering 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789800329491):
GLIDNINGEN FÖRDJUPAD — bolagsunivers.json 153 → 195 bolag (+42 på två dygn;
621 502 B, skrivet 09-19 02:09Z) medan korstabell-grunden är FRUSEN på 100
rader (83 582 B, 09-10 14:33Z) ⇒ 95 bolag utan korstabellrad (53→95) — gap 1
akutare igen (cadans/rop vid universumsväxt). Sviter 32/0 + 50/0 GRÖNA EGENA
(fjärde dokumenterade gången). member/portfolio-rutten fortfarande UTAN
lasMedlemSession (0 träffar, 108 r — gap 3 lever). Uppföljnings-cronen
dubbelt driven kvar (/etc/crontab "0 7 1 * *" + vercel.json) men 0
fundamental/akm2/akm3-cacher på disk (data/cache 40 filer: netnet/analys/
vagfundament-klasserna). Lib-kodstilla 023e9f95 09-09 (10 d). DRIFT I
MÄT-FÖNSTRET: /portfolj-forskning + /portfoljbyggare + /rapporter 500
(manifest-offerklassen — se UPPDATERING-sektionen; /min-portfolj 200; ej kod).
Score 8 kvar.*`;

const C18_RUBRIK_GAMMAL = "## C18. SEO/schema/llms.txt — LEVER — 9/10 *(uppdaterad 2026-09-17)*";
const C18_RUBRIK_NY = `## C18. SEO/schema/llms.txt — LEVER — 9/10 *(uppdaterad 2026-09-19)*

*Uppdatering 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789800329491):
sitemap 2 239 → 2 420 loc (localhost 200, 443 810 B — speglarna med) ·
sok-index FÄRSKAST: 440 kurser, genererat 2026-09-19 (public/sok-index.json,
09-19 04:28Z — kopplingen lever men disciplinen förblir manuell: gap 3) ·
llms.txt 200 (204 973 B) + robots.txt 200 (6 181 B) MEN llms-full-txt 500 =
AKTIVT DRIFTBROTT (manifest-offerklassen, se UPPDATERING-sektionen — ej kod) ·
seo.tsx 842 r (senaste ändring 1245141e 09-15, oförändrad sedan; kartans
"841 r" var en rad fel) + schema-kurser.ts 193 r · OG-deploy-kopling
fortfarande 0 träffar i deploya-contabo.sh (gap 2) · schema-sviten EJ körd
under driftbrottet (09-17-precedensen: /kurser 500 = drift, ej schema-kod) ·
G1-slutverifiering (Google rich-results live) återstår. Score 9 kvar.*`;

const B8_OVER_GAMMAL = "| B8 | AKM3 (regim, kalibrering, ensemble) | Analys | PÅGÅR | 7 | Konstruktion topp (55/55 ×3 återmätningar 09-17 + LÅST grind ΔΦ=0, hash-kedjor); men kalibreringen ENBART Vercel-cron-driven (nästa molnrond 2026-10-02; Contabo-crontab saknar fortfarande raden, mätt 09-17), regimen FROSEN på genesis 09-03 (14 d; genesis-talen lever live i /api/forskningslage), ensemble-vy 0/22; n_eff-målet 8–12 kvartal bort |";
const B8_OVER_NY = "| B8 | AKM3 (regim, kalibrering, ensemble) | Analys | PÅGÅR | 7 | Konstruktion topp (55/55 egen 09-19, femte gröna; LÅST grind ΔΦ=0); fruset oförändrat: kalibrering-logg 1 rad 09-04 · regimen genesis 09-03 (16 d; /api/forskningslage bär EXAKT genesis-tal 7/100/17) · Contabo-crontab utan akm3/vagvalidering-rad · nästa molnrond 10-02; ensemble 0/22; kodstilla 15 d |";

const B13_OVER_GAMMAL = "| B13 | Portföljforskning (korstabell, risk, uppföljning, byggare) | Analys | LEVER | 8 | Sviter 32/0 + 50/0 gröna (egen 09-17); korstabell-grund frusen 09-10 (100 r) mot bolagsunivers 153 — glidningen 53 bolag; member/portfolio utan sessionsvakt; universumet matar numera A3:s portföljlager |";
const B13_OVER_NY = "| B13 | Portföljforskning (korstabell, risk, uppföljning, byggare) | Analys | LEVER | 8 | Sviter 32/0 + 50/0 gröna (egen 09-19, fjärde); GLIDNINGEN FÖRDJUPAD: bolagsunivers 195 (+42/2 d) mot korstabell frusen 100 r = 95 bolag utan rad; member/portfolio utan sessionsvakt (återmätt); 0 fundamental/akm2/akm3-cacher; /portfolj*+/rapporter 500 = aktivt driftbrott (manifest-klass, ej kod) |";

const C18_OVER_GAMMAL = "| C18 | SEO/schema/llms.txt | Innehåll | LEVER | 9 | G1-slutverifikation (Google rich-results live) återstår |";
const C18_OVER_NY = "| C18 | SEO/schema/llms.txt | Innehåll | LEVER | 9 | sitemap 2 420 (+181) + sok-index FÄRSKAST 440 kurser (09-19); llms.txt+robots 200 men llms-full-txt 500 = aktivt driftbrott (manifest-klass, ej kod); G1-slutverifikation (Google rich-results live) återstår; OG-deploy-kopling 0 träffar |";

const bygg = [
  ["## ÖVERSIKT — 38 system", UPPDATERING + "## ÖVERSIKT — 38 system"],
  [B8_RUBRIK_GAMMAL, B8_RUBRIK_NY],
  [B13_RUBRIK_GAMMAL, B13_RUBRIK_NY],
  [C18_RUBRIK_GAMMAL, C18_RUBRIK_NY],
  [B8_OVER_GAMMAL, B8_OVER_NY],
  [B13_OVER_GAMMAL, B13_OVER_NY],
  [C18_OVER_GAMMAL, C18_OVER_NY],
];

// abort-grind: varje ankare exakt EN träff
for (const [gammal] of bygg) {
  const n = text.split(gammal).length - 1;
  if (n !== 1) {
    console.error(`ABORT: ankare ej unikt (${n} träffar): ${gammal.slice(0, 80)}…`);
    process.exit(1);
  }
}
for (const [gammal, ny] of bygg) text = text.replace(gammal, ny);
fs.writeFileSync(KARTA, text); // EN atomär skrivning
console.log(`OK: ${bygg.length} ersättningar skrivna atomärt till SYSTEMKARTAN (${text.length} tecken)`);
