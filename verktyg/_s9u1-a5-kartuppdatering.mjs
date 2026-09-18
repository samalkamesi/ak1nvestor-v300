#!/usr/bin/env node
/**
 * _s9u1-a5-kartuppdatering.mjs — dokvåg s9-u1 (manifest auto-s9-1789709700201)
 * A5 Gamification återdiff: 6 en-träff-ersättningar i SYSTEMKARTAN.md +
 * worklog-append. Abort-grind: matchar ett ankare 0 eller 2+ gånger → exit 1
 * UTAN skrivning (clobber-kuren). EN skrivning per fil, omedelbar commit därefter.
 */
import fs from "node:fs";

const KARTA = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
const WORKLOG = "/home/ak1a/AK1/worklog.md";

let text = fs.readFileSync(KARTA, "utf8");
const fore = text.length;

function byt(namn, fran, till) {
  const n = text.split(fran).length - 1;
  if (n !== 1) {
    console.error(`ABORT ${namn}: ${n} träffar (kräver exakt 1) — INGEN skrivning`);
    process.exit(1);
  }
  text = text.replace(fran, till);
  console.log(`OK ${namn}: 1 träff, bytt`);
}

// 1. Rubrikens uppdateringsdatum
byt(
  "rubrikdatum",
  "# SYSTEMKARTAN — AK1A Research Lab (2026-09-11 · uppdaterad 2026-09-17)",
  "# SYSTEMKARTAN — AK1A Research Lab (2026-09-11 · uppdaterad 2026-09-18)",
);

// 2. A5-sektionshuvudets stämpel
byt(
  "a5-stampel",
  "## A5. Gamification — LEVER — 7/10 *(uppdaterad 2026-09-16)*",
  "## A5. Gamification — LEVER — 7/10 *(uppdaterad 2026-09-18)*",
);

// 3. Nytt italiskt uppdateringsblock FÖRE 09-16-blocket
byt(
  "a5-nytt-block",
  "*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 6): gap 3 SKÄRPT och gap 2 BESVARAT",
  `*Uppdatering 2026-09-18 (dokvåg s9-u1, manifest auto-s9-1789709700201 — A5 återdiffad, andra varvet): HELT KODSTILLA men RÖRELSE I BRÄNSLET. Samtliga A5-filer orörda i git sedan 09-16 (api/topplista 129 r · certifikat.tsx 242 r · topplista.tsx 136 r · badg-panel.tsx 235 r; badges.ts 326 r orörd sedan 02c0920d 09-01) — 0 commits, mätt. /badges /certifikat /topplista 200 på loopback+HTTPS (egna sonder). Topplistan FORTFARARDE TOM (GET {"topplista":[],"antal":0} — 0 xp_sync i fönstret) ⇒ gap 3 lever med "inget utnyttjat" intakt; sessionsvakten ÅTERVERIFIERAD SAKNAS I KOD (auth-grep 0 träffar; e-post ur klient-body rad 34; caps orörda rad 38–40: xp ≤ 10 M · nivå ≤ 100 · kurser ≤ 1 000). TVÅ NYA PRECISIONER I GAP 3: (a) POST-svaret läcker {rank,total} till oautentiserad anropare (rad 63–83) — vem som helst kan posta en främmande e-post och läsa av dennas placering, samma klass som impersonationen; (b) GET aggregerar ENBART senaste 500 xp_sync-händelserna (rad 97) — en elev som synkat längre bak faller AV listan helt. BRÄNSLEFYND: siffror.json (uppdaterad 09-18 06:01 av s5-vågorna) bär 414 kurser (+18 sedan A1:s 09-17-mätning 396) men quiz 8 223 · quizXp 82 230 OFÖRÄNDADE — nya kurser (tx-04, ma-05, ek-05, od-05 …) bär INGA quiz: topplistens bränsle fruset medan kursflödet växer (spegelbild av A6:s underlagsfynd). Badges preciserade 29 troféer (28 flaggskepp f3a56fc9 + Ritualstartad 02c0920d, båda 09-01). Gap 1 lever: 0 egna sviter (ingen badge/topplista/certifikat-svit i verktyg/, mätt). certId orörd kollisionsbar (certifikat.tsx:57). Score 7 orörd — kodstasis + skärpta precisioner utan stängning (B13-precedensen). Sidofynd åt A1:s nästa dokvåg: ÖVERSIKT-radernas kurstal 396 föråldrat (414 i siffror+deep-courses, mätt 09-18 — A1:s yta, lämnad orörd här).*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 6): gap 3 SKÄRPT och gap 2 BESVARAT`,
);

// 4. A5 GAP-lista
byt(
  "a5-gap",
  `- **GAP:** (1) badge-reglerna (trösklar) saknar test; (2) certifikatens
  unikhet BESVARAD 09-16: certId kollisionsbart (ingen medlemshash, inget
  register) — verifierbarhet saknas; (3) SKÄRPT 09-16: xp_sync-POST utan
  sessionsvakt på publik rutt — impersonationsbar tills vakt finns (kö till
  huvudagenten; topplistan tom = inget utnyttjat).`,
  `- **GAP:** (1) badge-reglerna (trösklar) saknar test (mätt 09-18: 0 egna
  sviter i verktyg/); (2) certifikatens unikhet BESVARAD 09-16, orörd 09-18:
  certId kollisionsbart (certifikat.tsx:57, AK1A-år-XP utan medlemshash, inget
  register) — verifierbarhet saknas; (3) SKÄRPT 09-16, ÅTERMÄTT ÖPPEN 09-18:
  xp_sync-POST utan sessionsvakt på publik rutt — impersonationsbar tills vakt
  finns (kö till huvudagenten; topplistan fortfarande tom = inget utnyttjat);
  09-18-tillägg: POST-svaret läcker {rank,total} till oautentiserad anropare
  och GET aggregerar endast senaste 500 händelserna (äldre synkar faller av).`,
);

// 5. ÖVERSIKT-rad A5
byt(
  "oversikt-a5",
  "| A5 | Gamification (badges, certifikat, topplista) | Utbildning | LEVER | 7 | 0 egna sviter; SKÄRPT (mätt 09-16): /api/topplista POST utan sessionsvakt (e-post ur klient-body, senaste-vinner); certId kollisionsbart (AK1A-år-XP, ingen medlemshash) |",
  "| A5 | Gamification (badges 29 troféer, certifikat, topplista) | Utbildning | LEVER | 7 | 0 egna sviter (mätt 09-18); gap 3 ÅTERMÄTT ÖPPEN 09-18: POST utan sessionsvakt + läcker {rank,total} till oautentiserad anropare (topplistan fortfarande tom = inget utnyttjat), GET-fönster 500 händelser; certId kollisionsbart (certifikat.tsx:57); bränslet fruset: quiz 8 223/XP 82 230 oförändrade medan kurserna växte 396→414 |",
);

// 6. Ny UPPDATERING-sektion före ÖVERSIKT-huvudet
byt(
  "uppdatering-sektion",
  "## ÖVERSIKT — 38 system",
  `## UPPDATERING 2026-09-18 (dokvåg s9-u1, manifest auto-s9-1789709700201 — A5 Gamification återdiffad mot verkligheten)

Andra varvet för A5 (förra passningen 09-16, dokvåg s9-u3 omgång 6). Varje
rad MÄTT i arbetsytan 2026-09-18 05:39–06:05Z — inte läst ur worklog. Anspråk
FÖRE mätstart (data/vakten/auto-s9-1789709700201-u1-ansprak.md, HEAD e5eca448);
syskon u3:s anspråk (E35+E26/E37) respekterat.

| Mått | Kartan 2026-09-16 | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| A5-kod i git | passningens läge 09-16 | **0 commits sedan 09-16** — api/topplista 129 r · certifikat.tsx 242 r · topplista.tsx 136 r · badg-panel.tsx 235 r · badges.ts 326 r (orörd sedan 02c0920d 09-01): HELT STILLA |
| Publika ytor | /badges /certifikat /topplista 200 | **200 på loopback OCH HTTPS** (egna sonder) |
| Topplistan live | TOM | **FORTFARANDE TOM** (GET {"topplista":[],"antal":0}) — 0 xp_sync i fönstret ⇒ gap 3 "inget utnyttjat" intakt |
| Sessionsvakt POST | saknas (e-post ur klient-body rad 34) | **ÅTERVERIFIERAD SAKNAS** (auth-grep 0 träffar; caps orörda rad 38–40: xp ≤ 10 M · nivå ≤ 100 · kurser ≤ 1 000) |
| NYTT: POST-svaret | ej noterat 09-16 | **läcker {rank,total} till oautentiserad anropare** (rad 63–83) — placering av främmande e-post läsbar av vem som helst |
| NYTT: GET-fönstret | ej noterat 09-16 | **aggregerar endast senaste 500 xp_sync** (rad 97) — äldre synkar faller av listan helt |
| certId | kollisionsbart (certifikat.tsx:57) | **OFÖRÄNDRAD** konstruktion AK1A-år-XP-pad-6 — gap 2 lever |
| Badges | trösklar som okompilerad data | **29 troféer** i badges.ts (28 flaggskepp f3a56fc9 + Ritualstartad 02c0920d, båda 09-01) |
| Gap 1 (sviter) | 0 egna sviter | **0 fortfarande** (ingen badge/topplista/certifikat-svit i verktyg/, mätt) |
| Bränslet (SIDOFYND) | quiz 8 223 · XP 82 230 (A1 09-17) | kurser **414** (+18 sedan 09-17; s5-vågorna tx-04/ma-05/ek-05/od-05 …) men quiz **8 223** · quizXp **82 230** OFÖRÄNDADE (siffror.json uppdaterad 09-18 06:01) — nya kurser bär INGA quiz |

Score A5 LEVER 7 orörd — kodstasis + skärpta precisioner utan gap-stängning
(B13-precedensen). Snitt 7,6 / 288 / 38 OFÖRÄNDRAT. Kö: (1) sessionsvakt +
rank-läcka på /api/topplista (huvudagenten); (2) A1/A2-ÖVERSIKT-radernas
kurstal 396 föråldrat (414 mätt 09-18 — A1:s yta, lämnad orörd här);
(3) quiz-tillväxt för nya kurser (A1/s5-spåret).

## ÖVERSIKT — 38 system`,
);

fs.writeFileSync(KARTA, text);
console.log(`KARTA skriven: ${fore} → ${text.length} byte (+${text.length - fore})`);

const worklogPost = `
## SPÅR 9 s9-u1 (manifest auto-s9-1789709700201, byggare 1/3) — 2026-09-18: A5 GAMIFICATION ÅTERDIFFAD (andra varvet) — HELT KODSTILLA men bränslet fruset: quiz/XP 8 223/82 230 oförändrade medan kurserna växte 396→414; rank-läcka ny; topplistan fortfarande tom [fabrik]

OBJEKT (klaim 05:39Z FÖRE mätstart — data/vakten/auto-s9-1789709700201-u1-ansprak.md, HEAD e5eca448; syskon u3:s anspråk E35+E26/E37 respekterat): A5 senast passad 09-16 (s9-u3 omgång 6) — andra varvet, valt för staslista (09-16-stämpel, aldrig återdiffad) + säkerhetsklass-gapet (topplistan tom "ännu" = dataläget kunde ha rört sig).

MÄTNINGAR (egna, 05:39–06:05Z, aldrig worklog): (1) KODSTASIS BEVISAD — 0 git-commits i A5-filerna sedan 09-16 (api/topplista 129 r · certifikat.tsx 242 r · topplista.tsx 136 r · badg-panel.tsx 235 r · badges.ts 326 r orörd sedan 02c0920d 09-01); /badges /certifikat /topplista 200 på loopback OCH HTTPS. (2) TOPLISTAN FORTFARANDE TOM (GET {"topplista":[],"antal":0}) — 0 xp_sync i senaste-500-fönstret ⇒ gap 3 "inget utnyttjat" intakt; sessionsvakten ÅTERVERIFIERAD SAKNAS I KOD (auth-grep 0 träffar; e-post ur klient-body rad 34; caps orörda rad 38–40). (3) TVÅ NYA PRECISIONER I GAP 3: POST-svaret läcker {rank,total} till oautentiserad anropare (rad 63–83 — placering av främmande e-post läsbar av vem som helst, samma klass som impersonationen) + GET aggregerar ENBART senaste 500 händelserna (rad 97 — äldre synkar faller av listan helt). (4) BRÄNSLEFYND: siffror.json (uppdaterad 09-18 06:01 av s5-vågorna) bär 414 kurser (+18 sedan A1:s 09-17-mätning 396; tx-04/ma-05/ek-05/od-05 …) men quiz 8 223 · quizXp 82 230 OFÖRÄNDADE — nya kurser bär inga quiz: topplistens bränsle fruset medan kursflödet växer (spegelbild av A6:s underlagsfynd). (5) Badges preciserade 29 troféer i badges.ts (28 flaggskepp f3a56fc9 + Ritualstartad 02c0920d, båda 09-01); gap 1 lever (0 egna sviter, mätt i verktyg/); certId orörd kollisionsbar (certifikat.tsx:57).

KARTA: A5-sektionen (nytt uppdateringsblock + GAP-lista) + ÖVERSIKT-raden + egen UPPDATERING-sektion med diff-tabell + rubrikdatum → 09-18; score 7 orörd (kodstasis + skärpta precisioner utan stängning — B13-precedensen); snitt 7,6/288/38 OFÖRÄNDRAT. Redigering via node-kanal med 6 en-träff-ankare + abort-grind utan skrivning (clobber-kuren; syskonens sektioner orörda).

KÖ: (1) sessionsvakt + rank-läcka på /api/topplista (huvudagenten); (2) A1/A2-rådernas kurstal 396 föråldrat (414 mätt — A1:s yta, orört här); (3) quiz-tillväxt för nya kurser (s5-spåret). KVD: endast SYSTEMKARTAN + worklog + anspråksfil + _s9u1-a5-* = INGET bygge (deploy ägs av prod-synken under lås); src/ orörd (tsc-baslinjen vilar i pre-commit-grinden); R2 orörd; data/blogg/ orörd. [fabrik]
`;

const wl = fs.readFileSync(WORKLOG, "utf8");
fs.writeFileSync(WORKLOG, wl.endsWith("\n") ? wl + worklogPost : wl + "\n" + worklogPost);
console.log("WORKLOG appenderad:", worklogPost.length, "tecken");
console.log("KLAR — committa omedelbart: git add + git commit -F verktyg/_s9u1-a5-commitmsg.txt");
