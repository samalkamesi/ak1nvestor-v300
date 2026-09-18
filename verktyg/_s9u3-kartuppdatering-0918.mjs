#!/usr/bin/env node
// s9-u3 (manifest auto-s9-1789752906622): SYSTEMKARTAN-dokvåg D21 + C19 + D38.
// Clobber-kur: varje ankare verifieras EXAKT 1 träff — annars ABORT utan skrivning.
import fs from "node:fs";

const KARTA = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
const WORKLOG = "/home/ak1a/AK1/worklog.md";
const ANSPRAK = "/home/ak1a/AK1/data/vakten/auto-s9-1789752906622-u3-ansprak.md";
let text = fs.readFileSync(KARTA, "utf8");

function byt(namn, gammal, ny) {
  const n = text.split(gammal).length - 1;
  if (n !== 1) { console.error(`ABORT: ankare "${namn}" har ${n} träffar (krav: 1)`); process.exit(1); }
  text = text.replace(gammal, ny);
  console.log(`OK: ${namn}`);
}

// ── 1. C19-rubrik + ny uppdateringsrad ─────────────────────────────────────
const c19Upd = `
*Uppdatering 2026-09-18 (dokvåg s9-u3, manifest auto-s9-1789752906622):
återdiffad — allt EGENMÄTT ~19:5x lokal. LIVE: POST /api/track {} → 400 ·
GET /api/trafik → 200 {ok:true, skyddad:true, besokareIdag:29, blockerat24h:9}
— ytan lever med färsk data (DNA-blockeringen räknar) · GET /api/tracer
405 + POST tom 400 (POST-only = frivillig delning, oförändrat) · POST
/api/konvertering/intention {} → 400 · GET /api/konvertering → 404 (endast
POST — ny precision). FYND A (precisering): 09-16-kartans "PageViewBeacon
(globalt-skal.tsx:243–276 + KOPIAN i layout.tsx)" — KOPIAN är BORTA: 0
beacon-/api/track-träffar i samtliga tre layouter ((huvud)/(en)/(ar); en
rot-layout.tsx existerar ej) ⇒ EN beacon (globalt-skal.tsx 395 r, rad
245–271) — dubbelräkningsklassen försvunnit. FYND B: gap 3 KVARSTÅR
oförändrat — beaconen skapar ak1a-session (rad 257) + beaconar/fetchar
/api/track (269/271) med 0 lasCookieSamtycke-träffar i filen;
trafik-rapportorns gating orörd (import rad 5, lasCookieSamtycke 97/153).
Sviter fortfarande 0 (gap 1); alarm-trösklar saknas fortfarande (gap 2).
Score 7 orörd (E33/B14-precedensen).*
`;
byt("C19-rubrik",
  "## C19. Trafik, spår & konvertering — LEVER — 7/10 *(uppdaterad 2026-09-16)*",
  "## C19. Trafik, spår & konvertering — LEVER — 7/10 *(uppdaterad 2026-09-18)*" + c19Upd);

// ── 2. D21-rubrik + ny uppdateringsrad ─────────────────────────────────────
const d21Upd = `
*Uppdatering 2026-09-18 (dokvåg s9-u3, manifest auto-s9-1789752906622):
återdiffad — allt EGENMÄTT. Sviter GRÖNA EGENA: progress 13/13 + auth
17/17 (båda exit 0). PRECISERING av 09-16-radens "GET 200 {inloggad:
false}": det är PROGRESS-rutten (GET /api/medlem/progress 200 mätt igen);
/api/medlem är POST-only i kod (186 r, endast POST rad 68) — GET → 405 är
korrekt kontrakt; POST ogiltig action → 400 {fel:"Ogiltigt action."}
(validering före sessionslogik). lasMedlemSession 4/4 rutter återmätt ·
medlem-progress.ts 478 r orörd. GAP: migrering fortfarande enkelriktad
(migrera-progress.tsx 110 r, ingen återgång) · GDPR-export/radering i UI
fortfarande 0 träffar (bred sökning) = tyngsta gapet öppet. NY SKÄRPNING
(data-rörelse): kurser 396→426 (+30 på ett dygn, siffror.json 09-18
17:39) medan quiz 8 223 / quizXp 82 230 FRUSNA — s5:s kursvågor
levererar kurser UTAN quiz-underlag ⇒ progress-ytans mätbara värde per
kurs tunnas (quizXp = exakt quiz×10, planen deterministisk); samma rot
når D38:s KursNavet. Score 8 orörd (E33/B14).*
`;
byt("D21-rubrik",
  "## D21. Medlemsdata & progress — LEVER — 8/10 *(uppdaterad 2026-09-16)*",
  "## D21. Medlemsdata & progress — LEVER — 8/10 *(uppdaterad 2026-09-18)*" + d21Upd);

// ── 3. D38-rubrik + ny uppdateringsrad ─────────────────────────────────────
const d38Upd = `
*Uppdatering 2026-09-18 (dokvåg s9-u3, manifest auto-s9-1789752906622):
återdiffad — allt EGENMÄTT ~20:0x lokal. STABILT GRÖNT: /min-sida +
/profil 200 loopback · min-sida.tsx 1 093 r EXAKT oförändrad ·
kodstilla sedan 09-16 (git tomt) · revalidate=3600 lever (page.tsx:11) ·
gäst-kontraktet tyst igen: GET bevakning + portfolj → {inloggad:false}
medan 401/429-texterna lever i kod (bevakning 84/91 · portfolj 108/115).
STORFYND (motbevisning): 09-13-formuleringen "Tre språk fullt via
useSprak + speglarna (våg 113)" gäller INTE navet — 0 useSprak/sprak-
träffar i portal.tsx + alla fyra navet-komponenterna (analys/kurs/
portfolj/larvag), spegelsidor för min-sida SAKNAS helt i (en)/(ar) och
/ar|/en/min-sida → 404 live; ENBART fortsatt-panel.tsx (6 träffar) bär
språket ⇒ nav-kärnan är enspråkig sedan födseln (kodstilla 09-13) —
kartans "fullt" var formuleringsoptimism, ej funktion som fallit.
Sviter fortfarande 0 (gap 1). NY SKÄRPNING: KursNavets "kurser med
quiz-rätt" står stilla medan universum växer 396→426 (quiz frusna —
samma rot som D21-skärpningen). Score 8 orörd (kunskapsdokvåg; nytt
gap 5 nedan).*
`;
byt("D38-rubrik",
  "## D38. Medlemsnavet — Min Sida-portalen — LEVER — 8/10 (NY 2026-09-13 · mätt 2026-09-16)",
  "## D38. Medlemsnavet — Min Sida-portalen — LEVER — 8/10 (NY 2026-09-13 · mätt 2026-09-16 · återdiffad 2026-09-18)" + d38Upd);

// ── 4. D38-GAP: lägg gap 5 ─────────────────────────────────────────────────
byt("D38-gap5",
  "(kunna förhandsfyllas ur senaste analys).",
  "(kunna förhandsfyllas ur senaste analys); (5) tre-språk på nav-ytan: " +
  "useSprak 0-träffar i portal + 4 navet-komponenter, spegelsidor saknas " +
  "(404 live), enbart fortsatt-panelen flerspråkig (motbevisat 09-18 — se " +
  "uppdatering; designbeslut eller spegling till styrelsen).");

// ── 5–7. Översiktsrader ────────────────────────────────────────────────────
byt("ÖVERSIKT-C19",
  "| C19 | Trafik, spår & konvertering | Innehåll | LEVER | 7 | 0 sviter + 0 alarm-trösklar (mätt 09-16); GDPR-gatingen KODAD för trafik-rapportören men PageViewBeacon sänder före samtycke (mätt 09-16 — spår till Supabase + sessions-localStorage före varje val, mot kakmodalens eget 2022:482-citat); P6 även koddokumenterad |",
  "| C19 | Trafik, spår & konvertering | Innehåll | LEVER | 7 | 0 sviter + 0 alarm-trösklar (återmätt 09-18); PageViewBeacon sänder fortfarande före samtycke (gap 3 oförändrat 09-18) men layout-KOPIAN är BORTA (0 träffar i 3 layouter = EN beacon); trafik-API lever med färsk data (besokareIdag 29 + blockerat24h 9, mätt 09-18); P6 koddokumenterad |");

byt("ÖVERSIKT-D21",
  "| D21 | Medlemsdata & progress (molnet) | Medlem | LEVER | 8 | GDPR-export/radering saknas i UI (mätt 09-16); replay-skyddet MOTBEVISAT (importtak + engångs-import, kodat sedan våg 87); 4 rutter ALLA vaktade (mätt 09-16); sviter 13/13 + 17/17 grön egen mätning |",
  "| D21 | Medlemsdata & progress (molnet) | Medlem | LEVER | 8 | GDPR-export/radering saknas fortfarande i UI (återmätt 09-18); sviter 13/13 + 17/17 GRÖNA EGENA igen (09-18); /api/medlem är POST-only (GET 405 = korrekt, {inloggad:false} kommer från progress-rutten); NYTT: kurser +30 (426) medan quiz/XP frusna (8 223/82 230) — progress-underlaget tunnas av s5:s kursvågor |");

byt("ÖVERSIKT-D38",
  "| D38 | Medlemsnavet — Min Sida-portalen (AnalysNavet, KursNavet, PortfoljNavet, bevakning) | Medlem | LEVER | 8 | Inga egna E2E-tester (mätt 09-16); pass.namn-API-texter fortfarande svenska i alla grenar (mätt); förhandsfyllnad lever ej; gäst-flödet enklare; prod /min-sida 200 |",
  "| D38 | Medlemsnavet — Min Sida-portalen (AnalysNavet, KursNavet, PortfoljNavet, bevakning) | Medlem | LEVER | 8 | \"Tre språk fullt\" MOTBEVISAT 09-18: useSprak 0-träffar i portal+4 navet, speglar saknas (404 live), enbart fortsatt-panelen flerspråkig; sviter 0; sidor 200; 1 093 r kodstilla; KursNavets quiz-yta frusen medan kurserna 396→426 |");

// ── 8. Ny UPPDATERING-sektion före ÖVERSIKT ────────────────────────────────
const sektion = `## UPPDATERING 2026-09-18 (dokvåg s9-u3 manifest auto-s9-1789752906622 — D21 + C19 + D38 diffade mot verkligheten; D24-pivot efter kollision)

Anspråk på disk FÖRE mätstart (data/vakten/auto-s9-1789752906622-u3-ansprak.md,
19:38) med D21+D24+C19 valda; under mätfönstret landade syskonens anspråk —
u1 tog E28, u2 tog D24+D25 (deras filer 19:37; mitt namnmönster utan
"s9-"-prefix syntes ej i deras lista) ⇒ D24 AVSTÅTT till u2 (deras sektion
levererad i 73cc0c0d, orörd här), ersatt av D38 (fri, stämplad 09-16, aldrig
återdiffad). u2:s commit VÄNTADES UT före kart-skrivningen (clobber-kuren).
Mina D24-mätningar (fas-set 18+24 elementräknade · underlag 426 · ytor 200
×4 · 8×400 utan 429) bekräftar u2:s bild oberoende — bokfört som
korsvalidering UTAN skrivning i deras sektion. Allt övrigt EGENMÄTT
19:4x–20:2x lokal:

| System | Före (senaste passning) | Efter (mätt 09-18) |
|---|---|---|
| D21 | sviter 13/13+17/17 (09-16); GDPR-gap öppet; "GET 200 {inloggad:false}" | sviter GRÖNA EGENA igen (13/13 + 17/17, exit 0); {inloggad:false} = PROGRESS-rutten, /api/medlem POST-only (GET 405 korrekt kontrakt, POST ogiltig → 400); GDPR-export fortfarande 0 träffar i UI; SKÄRPNING: kurser +30 (426) medan quiz/XP frusna (8 223/82 230) — s5 levererar kurser utan quiz-underlag, progress-värdet per kurs tunnas (samma rot når D38:s KursNavet) |
| C19 | beacon i globalt-skal + "kopian i layout.tsx"; gap 3 beacon före samtycke; 0 sviter | KOPIAN BORTA: 0 beacon-träffar i samtliga 3 layouter ⇒ EN beacon; gap 3 KVARSTÅR exakt (0 lasCookieSamtycke i globalt-skal.tsx; ak1a-session rad 257, sendBeacon/fetch 269/271); trafik-API levande: besokareIdag 29 + blockerat24h 9; /api/konvertering GET 404 (endast POST); 0 sviter kvar |
| D38 | "tre språk fullt via useSprak + speglarna" (09-13); sviter 0; mätt 09-16 | MOTBEVISNING: useSprak 0-träffar i portal + 4 navet, spegelsidor saknas, /ar+/en/min-sida 404 live — enbart fortsatt-panelen (6 träffar) flerspråkig; kärnan enspråkig sedan födseln (kodstilla 09-13) = formuleringsoptimism i kartan, ej fall; 1 093 r exakt oförändrad; sidor 200; revalidate 3600 lever; gäst-kontrakt tyst (401/429-texter i kod 84/91/108/115); gap 5 NYTT |

Poäng: D21 8 · C19 7 · D38 8 — samtliga oförändrade (E33/B14-precedensen:
kunskap tillförd, inget gap stängt; D38:s motbevisning avslöjar kartfel,
funktionen föll ej). Snitt **7,6 / 287 / 38 OFÖRÄNDRAT** (inga poäng
rörda). Kö till huvudagenten: (1) quiz-tillväxt för de +30 kurserna
(D21+D38, samma rot — sammanfaller med u2:s A2-kö); (2) PageViewBeacon-
samtyckeslåsning (C19 gap 3, GDPR-läget); (3) D38 tre-språksbeslut:
spegla navet ELLER kartformulering permanentas; (4) rate-limit på
/api/fas2-ansok (u2:s D24-kö, bekräftad av 8×400-sonden); (5) anspråks-
filernas namnmönster i fabriks-prefixet (kollisionen föddes av två
mönster — disk-först räcker ej om namnen skiljer).

`;
byt("UPPDATERING-infogning", "## ÖVERSIKT — 38 system", sektion + "## ÖVERSIKT — 38 system");

// ── EN atomär skrivning ────────────────────────────────────────────────────
fs.writeFileSync(KARTA, text);
console.log("KARTA SKRIVEN:", text.length, "tecken");

// ── 9. Worklog-append + anspråks-pivnotis ─────────────────────────────────
const worklogRad = `
## SPÅR 9 s9-u3 (manifest auto-s9-1789752906622, 3/3) — 2026-09-18 ~19:4x–20:2x lokal: SYSTEMKARTAN-dokvåg — D21 + C19 + D38 diffade mot verkligheten; D24-PIVOT efter anspråkskollision [fabrik]

Leverans: D21 LEVER 8 kvar — sviter GRÖNA EGENA igen (progress 13/13 + auth 17/17, båda exit 0) + PRECISERING: "GET 200 {inloggad:false}" är PROGRESS-rutten (200 mätt), /api/medlem är POST-only i kod (186 r, POST rad 68) ⇒ GET 405 = korrekt kontrakt, POST ogiltig → 400 {fel:"Ogiltigt action."} + lasMedlemSession 4/4 + GDPR-export i UI fortfarande 0 träffar (bred sökning, tyngsta gapet) + NY SKÄRPNING: kurser 396→426 (+30/dygn, siffror.json 17:39) medan quiz 8 223/quizXp 82 230 FRUSNA — s5:s kursvågor levererar kurser utan quiz-underlag, progress-värdet per kurs tunnas (samma rot når D38:s KursNavet). C19 LEVER 7 kvar — FYND A: 09-16-kartans "beacon-KOPIA i layout.tsx" är BORTA (0 beacon-/api/track-träffar i samtliga 3 layouter, ingen rot-layout.tsx) ⇒ EN beacon (globalt-skal.tsx 395 r) = dubbelräkningsklassen borta; FYND B: gap 3 (beacon före samtycke) KVARSTÅR exakt (ak1a-session rad 257 + sendBeacon/fetch /api/track 269/271, 0 lasCookieSamtycke i filen; rapportörens gating orörd 5/97/153) + trafik-API LEVANDE med färsk data: besokareIdag 29 + blockerat24h 9 + track 400/tracer 405+400/intention 400/konvertering GET 404 (endast POST, ny precision) + sviter 0 kvar. D38 LEVER 8 kvar — STORFYND (motbevisning): "Tre språk fullt via useSprak + speglarna (våg 113)" gäller EJ navet: useSprak/sprak 0-träffar i portal.tsx + alla 4 navet-komponenterna, spegelsidor SAKNAS (find tomt i (en)/(ar)), /ar+/en/min-sida 404 live, ENBART fortsatt-panel.tsx (6 träffar) flerspråkig — kärnan enspråkig sedan födseln (kodstilla 09-13) = kartans formuleringsoptimism, ej funktion som fallit; gap 5 NYTT; stabilt grönt: min-sida.tsx 1 093 r EXAKT, /min-sida+/profil 200, revalidate=3600 (page.tsx:11), gäst-kontrakt tyst (bevakning+portfolj → {inloggad:false}), 401/429-texter i kod (84/91/108/115). KOLLISIONSHANTERING: mitt anspråk (D21+D24+C19) på disk 19:38:38 FÖRE min mätstart men syskonens landade sekunder tidigare (u1 19:37:10 E28 · u2 19:37:51 D24+D25) med ANNAT namnmönster (-s9-u2- vs -u3-) — D24 avstått till u2 trots mina mätningar klara, ersatt med D38; deras commit VÄNTADES UT före kart-skrivning (clobber-kuren); mina D24-värden (fas-set 18+24 elementräknade i kod · underlag 426 · ytor 200 ×4 · 8×400 utan 429) bokförda som OBEROENDE KORSVALIDERING i min UPPDATERING-sektion och bekräftar u2:s bild exakt — deras sektion orörd. Snitt 7,6/287/38 OFÖRÄNDRAT (inga poäng rörda — E33/B14-precedensen). Kö till huvudagenten: (1) quiz-tillväxt för +30 kurserna (D21+D38, samma rot, sammanfaller med u2:s A2-kö); (2) PageViewBeacon-samtyckeslåsning (C19 gap 3, GDPR); (3) D38 tre-språksbeslut: spegla ELLER kartformulering permanentas; (4) rate-limit /api/fas2-ansok (u2:s kö, mina 8×400 bekräftar); (5) enhetligt anspråksfilnamn i fabriks-prefixet (kollisionen föddes av två mönster — disk-först räcker ej om namnen skiljer). KVD: endast SYSTEMKARTAN + worklog + anspråksfil + verktyg/_s9u3-kartuppdatering-0918.mjs — INGET bygge (deploy ägs av prod-synken); src/ orörd (tsc-baslinjen bärs av commit-grinden); R2 orörd (priser/tier/publicering orörda); data/blogg/ orörd; syskonens ytor orörda (u1 E28 · u2 D24+D25). [fabrik]
`;
fs.appendFileSync(WORKLOG, worklogRad);
console.log("WORKLOG APPENDAD");

fs.appendFileSync(ANSPRAK, `

## PIVOT-NOTIS 19:5x–20:2x lokal
D24 AVSTÅTT till u2 (deras anspråk 19:37:51 + sektion levererad i 73cc0c0d;
min fil syntes ej i deras lista pga namnmönster). D24-mätningarna bokförda som
korsvalidering. ERSTÄLLARE: D38 Medlemsnavet (fri yta, stämplad 09-16, aldrig
återdiffad) — mätt och levererad. Kvar av originalet: D21 + C19.
`);
console.log("ANSPRÅK UPPDATERAD");
