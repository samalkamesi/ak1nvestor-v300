// s9-u3 (manifest auto-s9-1789777515719) — SYSTEMKARTAN-redigering 2026-09-19
// A4 + C16 + E32: UPPDATERING-sektion + 3 detaljblock + 3 ÖVERSIKT-rader.
// Mönster: en-träff-ersättningar med abort-grind, EN atomär skrivning.
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
let text = readFileSync(FIL, "utf8");

// [namn, från, till, förväntat antal träffar (exakt), flexibelt?]
const R = [];
const ersatt = (namn, fran, till, exakt = 1, flexibel = false) => R.push({ namn, fran, till, exakt, flexibel });

// ── A4-detaljblock ──
const a4Block = `
*Uppdatering 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789777515719 — tredje
verifieringsvarvet): kodstilla men levande — 0 commits på samtliga 9 nyckelfiler
sedan 09-16 (git log tom) medan /api/dagens-pass levererar färsk data: 09-19 →
SWED-A.ST (Swedbank, pris 396,7 SEK, 52v-position 0,994). Rotationen
oberoende verifierad för TREDJE gången, nu med exakt prod-match samma dag:
FNV-1a (salt 1) ombereknad ur route.ts:s äkta ROTATION-array ger 09-19 →
SWED-A.ST = dagens API-svar EXAKT; historiken står sig (09-16 SHB-B.ST ·
09-17 SAND.ST). NY PRECISION: 09-19 OCH 09-20 ger BÅDA SWED-A.ST —
datumhash % 12 kan repetera närliggande dagar; "roterande lista" är ett
deterministiskt DAGSURVAL utan repetitions-skydd (ej fel, men värt veta när
kunden frågar "samma bolag igen?" — kur = dags-lookup-tabell, designbeslut).
Gap 1 lever oförändrat: 0 sviter (grep verktyg/ 09-19: 0 träffar på
dagens/veckoplan/briefing/kunskap/streak/flashcard); lasStreak orörd
(member-local.ts:69). Quiz-frusenheten når A4: dagens quiz (+10 XP)
betjänar det gamla beståndet — quiz-totalen 8 223 frusen sedan 09-15 medan
kurserna växt 396→432 (samma rot som A5/D21/D38-bokföringarna). Score
7 kvar (kodstatis + verifierad determinism, inget gap rört — B13-precedensen).*
`;
ersatt("A4-block", "- **Vad:** Dagens Pass (5-minutersritual", a4Block + "\n- **Vad:** Dagens Pass (5-minutersritual");
ersatt("A4-rubrik", "## A4. Daglig träning — LEVER — 7/10 *(uppdaterad 2026-09-17)*", "## A4. Daglig träning — LEVER — 7/10 *(uppdaterad 2026-09-19)*");
ersatt("A4-observation", "Inga tester (mätt igen\n  09-16: 0 träffar i verktyg/).", "Inga tester (mätt igen\n  09-19: 0 träffar i verktyg/).");

// ── C16-detaljblock ──
const c16Block = `
*Uppdatering 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789777515719 — andra
varvet): kön 175 → 235 filer på två dygn (+60 ≈ +30/dygn — avmattning från
+51/dygn men stark tillväxt): rot 63 (61 JSON + 2 MD) · m9-ko 7 (oförändrad
sedan 09-15) · granskning 107 (var 77; 11 sa-laser + färska KONTROLL-filer
09-18: spelaktier, försvar, tillväxt, SaaS, Goldman Sachs Q3) · kvartal 58.
Kvartalshierarkin kvartal/2026-q3/ är FULLVUXEN: 13 (09-15) → 33 (09-16) →
43 (09-17) → 58 (09-19) = 10 kalendrar + 48 Q3-läspaket — s4-serien (Carlsberg
senaste 1b85f722, JPMorgan "seriens 47:e", Fortum, SSAB, UPM) är kön nya
tillväxtmotor medan m9-fabriken själv är kodstilla sedan våg 96 (bf9e06af):
"C16-fabriken" är numera ett ekosystem av flera leverantörer. Sammanställningen
FERSK igen: data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md (den bor i
blogg-utkast-roten — kartans äldre lösa referens utan sökväg preciserad här)
förynad 09-18 23:08 och TRIPPLERAD på tre dygn (55 691 B 09-16 22:58 →
173 697 B) — "åldrande vy"-gapet hålls stängt mekaniskt av paketflödet självt.
data/blogg/ står på 55 publicerade oförändrade (publiceringsuttaget = kundens
R2-klick, fortfarande flaskhalsen). Gap 2 (hårdkodad serie-lista) och gap 3
(schemalagd re-run saknas) lever. Score 8 kvar (B13-precedensen).*
`;
ersatt("C16-block", "- **Vad:** Evergreen-utkastfabrik", c16Block + "\n- **Vad:** Evergreen-utkastfabrik");
ersatt("C16-rubrik", "## C16. M9-innehållsfabriken — LEVER — 8/10 *(uppdaterad 2026-09-17)*", "## C16. M9-innehållsfabriken — LEVER — 8/10 *(uppdaterad 2026-09-19)*");

// ── E32-detaljblock ──
const e32Block = `
*Uppdatering 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789777515719 — andra
varvet): guldkällan i rörelse — siffror.json 432 kurser (09-18 23:52;
381→432 sedan 09-17-stämpeln via s5-vågornas register-tillväxt, senaste
044d1f47 med clobberläkning 429→432) medan quiz/quizXp FORTFARANDE FRUSNA
(8 223/82 230, oförändrade sedan 09-15) — +51 kurser utan nytt quiz-bränsle;
E32 bär nu samma frusenhetstal som A5/D21/D38-klasserna. KÄLLÖVERENS-
STÄMMELSEN BEVISAD I BÅDA ÄNDAR (09-19): public/deep-courses.json = 432
objekt (node-räknat) = siffror.json = startsidans LEVERERADE live-HTML
("432 kurser, 102 kanonböcker, 8 223 quiz") ⇒ siffror-live och siffror.json
överensstämmer i runtime VID MÄTTILLFÄLLET — gap 2 mjukas ytterligare (vakten
PASSAR fil-kontrollen + runtime överens mätt) men den mekaniska
divergensvakt som SLÅR LARM saknas fortfarande (överens idag ≠ vakt).
priser.json innehållsorörd sedan fbfb135f (våg 78) — speglingsfönstret 12
dygn (09-07→09-19), det längsta sedan mätstart; fil-mtime 09-10 är
git-checkout-beröring, ej innehåll (git log tom sedan fbfb135f).
variabler/variabler-lagring/siffror/siffror-live kodstilla sedan våg 82
(1be25f14); /api/variabler 200 live med samtliga 14 registefält (mätt).
ÖVERSIKT-radens "320 poster i översättnings-fallback-kön" var ett E31/E33-
ämne som fastnat i E32-raden — rätat här till E32-egna fakta (E31 är syskonet
u2:s yta i samma manifest, deras sektion orörd). Score 8 kvar (B13-precedensen).*
`;
ersatt("E32-block", "- **Vad:** Pris- och tal-sanningen", e32Block + "\n- **Vad:** Pris- och tal-sanningen");
ersatt("E32-rubrik", "## E32. Guldkällorna (variabler + siffror) — LEVER — 8/10 *(uppdaterad 2026-09-17)*", "## E32. Guldkällorna (variabler + siffror) — LEVER — 8/10 *(uppdaterad 2026-09-19)*");

// ── ÖVERSIKT-rader ──
ersatt("A4-översikt",
  "| A4 | Daglig träning (dagens pass, veckoplan, kunskapsflöde) | Utbildning | LEVER | 7 | 0 egna sviter; streak/XP (member-local lasStreak) ej validerad — kartens determinism- och vagscan-gap MOTBEVISADE i kod+prod (mätt 09-16) |",
  "| A4 | Daglig träning (dagens pass, veckoplan, kunskapsflöde) | Utbildning | LEVER | 7 | 0 egna sviter (återmätt 09-19); determinismen TREDJE verifieringen: offline-hash = prod-svar exakt samma dag (09-19 SWED-A.ST); hashen kan repetera dagar (09-19+09-20 båda SWED-A.ST — dagsurval, ej rotationsgaranti); kodstilla sedan 09-16; dagens quiz betjänar frusna quiz-beståndet (8 223 sedan 09-15) |");
ersatt("C16-översikt",
  "| C16 | M9-innehållsfabriken (granskningskön) | Innehåll | LEVER | 8 | B2-knapp lever (v82); kön 175 filer (+51/dygn: rot 48 · m9-ko 7 · granskning 77 · kvartal 43, mätt 09-17) med sammanställningen FÖRNYAD 16:58 + 3 oberoende kontrollgranskningar/dygn (maskinella paket); flaskhals = publiceringsuttaget (55 frysta, kundens klick R2); schemalagd re-run saknas |",
  "| C16 | M9-innehållsfabriken (granskningskön) | Innehåll | LEVER | 8 | kön 235 filer (+60 på 2 dygn, mätt 09-19: rot 63 · m9-ko 7 · granskning 107 · kvartal/2026-q3 58); kvartalshierarkin fullvuxen 13→33→43→58 och s4:s Q3-läspaket är nya tillväxtmotorn (m9-fabriken stilla sedan v96 = ekosystem av leverantörer); sammanställningen färsk 09-18 23:08 OCH trippelrad 55→174 kB (bor i blogg-utkast-roten); KONTROLL-filer 09-18 ×5; flaskhals = publiceringsuttaget (55 frysta, R2); schemalagd re-run saknas |");
ersatt("E32-översikt",
  "| E32 | Guldkällorna (variabler + siffror) | Grund | LEVER | 8 | 320 poster i översättnings-fallback-kön; speglingsfönster manuell |",
  "| E32 | Guldkällorna (variabler + siffror) | Grund | LEVER | 8 | kurser 432 (s5-vågorna; 381→432 på 2 dygn) men quiz/XP frusna sedan 09-15 (8 223/82 230); källöverensstämmelse bevisad i båda ändar 09-19 (deep-courses = siffror.json = live-HTML) men larmande divergensvakt saknas; speglingsfönstret 12 dygn = längsta sedan mätstart; priser.json orörd sedan v78 |");

// ── UPPDATERING-sektion (före ÖVERSIKT) ──
const updSektion = `
## UPPDATERING 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789777515719 — A4 + C16 + E32 diffade mot verkligheten)

Anspråk på disk FÖRE mätstart (data/vakten/auto-s9-1789777515719-s9-u3-ansprak.md,
00:27Z; syskonet u2:s anspråk E31 + A1 landade minuterna FÖRE och respekteras —
deras sektioner orörda; u1 obestämd vid mätstart, D20 lämnades öppen som
rimligaste enkel-pick, u2:s reserver B7/D20 orörda). Allt EGENMÄTT 00:27–00:5x
lokal (loopback-sonder, node-räkningar, git log, filstat):

| System | Före (senaste passning) | Efter (mätt 09-19) |
|---|---|---|
| A4 | determinism 2× verifierad (09-16 prod-dubbelanrop, 09-17 offline); 0 sviter; kodstilla | TREDJE verifieringen med exakt prod-match SAMMA DAG: offline FNV-1a ur äkta ROTATION ger 09-19 → SWED-A.ST = dagens API-svar (pris 396,7, pos52 0,994); historiken 09-16 SHB-B · 09-17 SAND står sig; NY PRECISION: 09-19 OCH 09-20 ger BÅDA SWED-A.ST — hash%12 repeterar närliggande dagar utan skydd ("rotation" = dagsurval, ej garanti); 0 commits på 9 nyckelfiler sedan 09-16; 0 sviter återmätt; lasStreak orörd (:69); dagens quiz betjänar frusna beståndet (8 223 sedan 09-15, kurser 396→432) |
| C16 | kön 175 filer (09-17, +51/dygn); sammanställning förynad 09-17 16:58; m9-fabriken stilla sedan v96 | kön 235 (+60/2 dygn ≈ +30/dygn): rot 63 · m9-ko 7 · granskning 107 (11 sa-laser, KONTROLL-filer 09-18 ×5: spelaktier/försvar/tillväxt/SaaS/Goldman Sachs Q3) · kvartal/2026-q3 58 (10 kalendrar + 48 Q3-läspaket; serien 13→33→43→58); s4:s Q3-läspaket är kön nya tillväxtmotor (Carlsberg 1b85f722, JPMorgan "47:e") medan m9-fabriken stilla sedan v96 = ekosystem; sammanställningen FERSK 09-18 23:08 OCH trippelrad på 3 dygn (55 691 → 173 697 B; bor i data/blogg-utkast/-roten — lösa sökvägsreferenser preciserade); data/blogg 55 oförändrade (R2); gap 2+3 lever |
| E32 | siffror 381 (09-17-stämpeln); ÖVERSIKT-raden bar E31-amnet "320 poster"; priser orörd sedan 09-07 | siffror.json 432 kurser (09-18 23:52; s5-vågorna, senaste 044d1f47 clobberläkt 429→432) medan quiz/XP FRUSNA (8 223/82 230 sedan 09-15); källöverensstämmelse bevisad i BÅDA ändar: deep-courses.json 432 objekt (node) = siffror.json = startsidans live-HTML ("432 kurser, 102 kanonböcker, 8 223 quiz") — gap 2 mjukat (runtime överens mätt) men larmande divergensvakt saknas; priser.json orörd sedan fbfb135f ⇒ speglingsfönstret 12 dygn = längsta sedan mätstart (mtime 09-10 = checkout-beröring, ej innehåll); /api/variabler 200 (14 fält); kodstilla sedan v82; E31-amnet i ÖVERSIKT-raden rätat till E32-egna fakta (E31 = u2:s yta, orörd) |

Poäng: A4 7 · C16 8 · E32 8 — samtliga oförändrade (B13/E33-precedensen:
kunskap tillförd, inget gap stängt). Snitt **7,6 / 287 / 38 OFÖRÄNDRAT**.
Kö till huvudagenten: (1) quiz-tillväxten nu E32-mätt (432 kurser utan nya
quiz — samma rot som A5/D21/D38-köposterna, fjärde oberoende observationen);
(2) C16:s publiceringsuttag: kön +30/dygn mot 55 frysta publicerade (kundens
R2-klick) — uttagsbeslut växer i aktualitet; (3) E32 gap 2: mekanisk
divergensvakt siffror-live ↔ siffror.json (överens bevisat men obevakat);
(4) A4: hashen kan upprepa bolag dagar i följd — om orepetition önskas krävs
dags-lookup-tabell (designbeslut, ej fel).

`;
ersatt("UPPDATERING-sektion", "## ÖVERSIKT — 38 system", updSektion + "## ÖVERSIKT — 38 system");

// ── Rubrikdatum (flexibelt: syskon kan ha hunnit slå om till 09-19) ──
ersatt("titel-datum", "2026-09-11 · uppdaterad 2026-09-18)", "2026-09-11 · uppdaterad 2026-09-19)", 1, true);

// ── Kör med abort-grind ──
const fel = [];
for (const r of R) {
  const n = text.split(r.fran).length - 1;
  if (n === r.exakt) {
    text = text.replace(r.fran, r.till);
    console.log(`OK   ${r.namn} (${n} träff)`);
  } else if (r.flexibel && n === 0) {
    console.log(`SKIP ${r.namn} (0 träff — redan rättat av syskon, accepterat)`);
  } else {
    fel.push(`${r.namn}: ${n} träffar (förväntat ${r.exakt})`);
  }
}
if (fel.length) {
  console.error("ABORT — inget skrivet:");
  for (const f of fel) console.error("  " + f);
  process.exit(1);
}
writeFileSync(FIL, text, "utf8");
console.log("SKRIVEN atomärt:", FIL, Math.round(text.length / 1024) + " kB");
