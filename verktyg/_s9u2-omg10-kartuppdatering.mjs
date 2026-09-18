// _s9u2-omg10-kartuppdatering.mjs — dokvåg omgång 10: B9 + A4 återdiff i SYSTEMKARTAN.md
// Mönster: en-träff-ersättningar med abort-grind (0 träff eller >1 träff => ingen skrivning).
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/forskning/SYSTEMKARTAN.md";
let txt = readFileSync(FIL, "utf8");

const byten = [];

// 1) Ny UPPDATERING-sektion mellan u3 o13:s kö-lista och ÖVERSIKT
byten.push([
  `(5) I1-audit (E31:s eget mål).

## ÖVERSIKT — 38 system`,
  `(5) I1-audit (E31:s eget mål).

## UPPDATERING 2026-09-17 (dokvåg s9-u2 omgång 10 — B9 + A4 återdiffade; andra varvet + mätblindhet under planerat patch-bygge)

Objektval enligt varv-2-regeln "störst verklighetsrörelse sedan senaste
passning" mot kollisionskontroll (senaste kart-commits c70adaab · 93f43878 ·
4fd4242e; arbetsytan ren vid anspråk, data/vakten/auto-s9-u2-ansprak-omg10.md):
B9 och A4 — aldrig återdiffade sedan 09-16, båda med dagligen rörlig
verklighet (B8-korsnotisen i 8b90113d "B9-gränsfyndet åldras vidare").
DRIFTFÖRHÅLLANDE FÖR MÄTNINGEN: prod ligger i PLANERAT patch-byggfönster —
prod-synk.logg 18:37Z "PATCH-KÖ aktiv: next@16.3.5" + pm2 stoppad medvetet
enligt o48/r58-kuren + .next under ombyggnad (BUILD_ID saknas, lock satt;
återstart garanteras av main():s finally) ⇒ alla live-sonder (loopback +
HTTPS) svarade 502/connection refused i fönstret — dokvågen äger ej
läkningen och lämnar den åt synken; fil-, kod-, cron-, arkiv- och
svitmätningar opåverkade.

| System | Före (passning 09-16) | Nu (mätt 09-17) | Domkraft |
|---|---|---|---|
| B9 | "Contabo-crontaben saknar vagscan" (u3 omg 4); skans 09-15 05:05:22Z; svit 57/57 | KARTFEL RÄTTAT: /etc/crontab rad 24 (fil-mtime 09-08) kör vagscan 06:30 lokal DAGLIGEN + vercel 05:00Z = dubbel drivning på pappret — MEN arkivbeviset visar att Contabo-körningen FALLERAR TYST: system-events-full-2026-09-16.json.gz (export 05:24Z) bär ENDA vagscan-raden 05:05:24Z "206 impulsvågor, 90 korrigeringar (12/12)" = Vercel-minuten (i linje med 09-15:s 05:05:22), Contabo-fönstret 04:30Z lämnade 0 spår, koden skriver skans-raden utan daglig dedupe (två lyckade körningar = två rader) och curl:as till /dev/null 2>&1 = rotobevisbarhet inbyggd; vagvalidering fortfarande OSPEGELAD på Contabo (båda crontab-källor mätta); SENASTE-rapporten domar 09-04 (13 dagar), mtime 09-10 oförändrad; svit EGEN 57/57 exit 0; universum fast 12 | gap 4 skärpt: "raden saknas" → "raden finns men tyst fallerande (okörbevisad)"; kontinuiteten bevisad till 09-16 |
| A4 | determinism prod-bevisad 09-16 (SHB-B.ST dubbelanrop); 0 sviter | Rotationsalgoritmen OBEROENDE verifierad OFFLINE: FNV-1a (salt 1) ombereknad ur route.ts ger 2026-09-16 → ROTATION[4] = SHB-B.ST = EXAKT passningens prod-bevis ⇒ algoritm + sanning bevisad utan nät; 09-17 → ROTATION[3] = SAND.ST (rotationens nya väntade värde); NY KOPPLING: ROTATION = samma 12-bolags AKM1-universum som vagscan-cronen (dagens-pass tränar i B9:s skannade universum); alla 8 nyckelfiler orörda sedan 09-16 (git log); gap 1 lever: 0 sviter (lasStreak member-local.ts:69 orörd, inga testa-{streak,dagens,veckoplan,briefing}-verktyg); /dagens-pass ej sonderbar (byggfönstret) | determinismen nu DUBBELBEVISAD (prod + offline); gap 1 orört |

Poäng: B9 LEVER 8 · A4 LEVER 7 — OFÖRÄNDADE (preciseringsdokvågor,
E33/B14-precedensen: kartfel rättat + gap skärpt, inget stängt).
Snitt 7,5 / 286 / 38 oförändrat.

Kö: (1) Contabo-vagscan-cronens TYSTA FALLERANDE — körbevis/loggning
(pumpor-kanalen loggar; curl >/dev/null gör det inte) eller kvitto-rad i
system_events; (2) vagvalidering fortfarande ospeglad på Contabo — samma
kedjekrav som B8:s (annars frusna prod-loggar till molnronden 2026-10-02);
(3) SENASTE-rapportens förnyelse (kvarstående); (4) A4 streak/XP-svit
(lasStreak är ren funktion — lätt första svit).

## ÖVERSIKT — 38 system`,
]);

// 2) A4-stämpel
byten.push([
  `## A4. Daglig träning — LEVER — 7/10 *(uppdaterad 2026-09-16)*`,
  `## A4. Daglig träning — LEVER — 7/10 *(uppdaterad 2026-09-17)*`,
]);

// 3) A4-notis efter 09-16-blocket
byten.push([
  `huvudgapet orört. Ytan stabil sedan 09-01–09-03; /dagens-pass 200 loopback+HTTPS
med färsk live-data (pris, 52v-position, ATR).*`,
  `huvudgapet orört. Ytan stabil sedan 09-01–09-03; /dagens-pass 200 loopback+HTTPS
med färsk live-data (pris, 52v-position, ATR).*

*Uppdatering 2026-09-17 (dokvåg s9-u2 omgång 10, återdiff): rotationen
OBEROENDE verifierad OFFLINE — FNV-1a-datumhashen (salt 1) ombereknad ur
route.ts:s ROTATION ger 2026-09-16 → SHB-B.ST = EXAKT passningens
prod-dubbelanrop (algoritm + sanning bevisad utan nät) och 2026-09-17 →
SAND.ST (rotationen lever vidare; prod-sond blockerad av dagens
patch-byggfönster — se UPPDATERING-sektionen). NY KOPPLING BOKFÖRD:
ROTATION är samma 12-bolags AKM1-universum som vagscan-cronen (B9) —
dagens-pass-gissningen tränar i det universum vågkartan skannar dagligen.
Alla 8 nyckelfiler orörda sedan 09-16 (git log); gap 1 lever: fortfarande
0 sviter för streak/XP (lasStreak i member-local.ts:69 orörd). Score
7 kvar.*`,
]);

// 4) B9-stämpel
byten.push([
  `## B9. Vågsystemet AK1TS — LEVER — 8/10 *(uppdaterad 2026-09-16)*`,
  `## B9. Vågsystemet AK1TS — LEVER — 8/10 *(uppdaterad 2026-09-17)*`,
]);

// 5) B9-notis efter 09-16-blocket
byten.push([
  `serverar den åldrade rapporten — Vercel read-only fs kan inte förnya filen
på disk. Score 8 kvar — inga gap stängda, se diff-tabellen.*`,
  `serverar den åldrade rapporten — Vercel read-only fs kan inte förnya filen
på disk. Score 8 kvar — inga gap stängda, se diff-tabellen.*

*Uppdatering 2026-09-17 (dokvåg s9-u2 omgång 10, återdiff): KARTFEL RÄTTAT
+ SKÄRPNING. Kontinuitet bevisad i arkivet: system-events-full-2026-09-16
.json.gz (export 05:24Z) bär vagscan-raden 05:05:24Z "Vågkarta: 206
impulsvågor, 90 korrigeringar (12/12 bolag mätta)" = Vercel-cronens minut,
i linje med 09-15:s 05:05:22Z. Contabo-bilden RÄTTAD: /etc/crontab rad 24
(filens mtime 09-08) kör vagscan 06:30 lokal DAGLIGEN (curl med Host-header
mot 127.0.0.1) — kartans "Contabo-crontaben saknar raderna" läste fel källa
(användar-crontab) och motbevisades redan i worklog 09-16 men inarbetades
ej i sektionen; MEN arkivbeviset SKÄRPER gap 4: Contabo-fönstret 04:30Z
lämnade 0 spår i 09-16:s export — koden skriver skans-raden UTAN daglig
dedupe (två lyckade körningar = två rader; dedupe gäller bara
kvartalssnapshoten) ⇒ Contabo-körningen FALLERAR TYST, och curl:as till
/dev/null 2>&1 = rotobevisbarhet inbyggd. vagvalidering är fortfarande
OSPEGELAD på Contabo (båda crontab-källor mätta). SENASTE-rapporten
oförändrad (domar 09-04 = 13 dagar, mtime 09-10 16:33); /api/data/
vagstatistik läser den från disk (route.ts:30–31); 0 sid-/
komponentkonsumenter (gap 3 lever). Svit EGEN 57/57 PASS exit 0 (09-17);
universum fast 12 tickers (vagscan route.ts:36–38, oförändrat). Live-
sonder (/api/vagscan/senaste · vagstatistik · /vagfundament) blockerade av
patch-byggfönstret. Score 8 kvar.*`,
]);

// 6) B9 gap 4-omskrivning
byten.push([
  `); (4) **cron-spegling**: vagscan +
  vagvalidering körs enbart av vercel-cron (mätt: Contabo-crontaben saknar
  raderna) — spegling till server-cron/pumpor krävs för Contabo-oberoende
  drift;`,
  `); (4) **cron-spegling — SKÄRPT 09-17**:
  /etc/crontab KÖR vagscan 06:30 lokal dagligen (rad 24; kartans "saknar
  raderna" läste fel källa) men körningen FALLERAR TYST (arkivbevis 09-16:
  0 spår av 04:30Z-fönstret; curl till /dev/null utan logg); vagvalidering
  är fortfarande ENBART vercel-cron (båda Contabo-källor mätta) — körbevis
  + loggning krävs;`,
]);

for (const [i, [gammal]] of byten.entries()) {
  const n = txt.split(gammal).length - 1;
  if (n !== 1) {
    console.error(`ABORT: byte ${i + 1} har ${n} träffar (kräver exakt 1) — ingen skrivning gjord.`);
    process.exit(1);
  }
}
for (const [gammal, ny] of byten) txt = txt.replace(gammal, ny);
writeFileSync(FIL, txt);
console.log(`OK: ${byten.length} byten tillämpade, ${txt.length} byte skrivna till ${FIL}`);
