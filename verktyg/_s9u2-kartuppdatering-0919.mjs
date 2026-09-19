#!/usr/bin/env node
// s9-u2 (manifest auto-s9-1789777515719) — SYSTEMKARTAN-dokvåg 2026-09-19: A1 + E31.
// Node-kanal (skalkvoten); en-träff-ankare med abort-grind; EN atomär skrivning.
import { readFileSync, writeFileSync } from "node:fs";

const KARTA = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
let text = readFileSync(KARTA, "utf8");

const UPPDATERING = `## UPPDATERING 2026-09-19 (dokvåg s9-u2, manifest auto-s9-1789777515719 — A1 + E31 diffade mot verkligheten; nattens s7-prestandavåg bokförd)

Objektval (anspråk disk-först 02:26 lokal): E31 + A1 — båda passade 09-17 och
båda direkt rörliga av nattens s7-prestandavåg (o75 speglarnas prefetch-spill /
o78 /kurser CV-kurer). Syskonen kollisionsfria: u1 B7 · u3 A4+C16+E32 (deras
anspråk 02:27; deras sektioner orörda — u3:s E32-vinkel delar siffror.json-talen
men äger guldkällesektionen).

### A1 — 396 → 432 kurser (+36 på två dygn); quiz frusna; nattens prestandavåg landad med ÄRLIG DELVIS NEGATIV dom

- TALEN (guldkällan data/siffror.json, mtime 09-18 21:52Z): **432 kurser**
  (D21-passningen 09-18 såg 426 kl 17:39 → +6 på kvällen = s5 omgång 17:s sex
  kurser rs-07, rs-08, od-06, ma-06, ek-06, od-07); quiz 8 223 / quizXp 82 230
  FRUSNA; fas2 18 / fas3 24 oförändrade. deep-courses.json 432 nycklar /
  19,7 MB / mtime 09-18 21:52 — disk = träd = guldkälla.
- larvag-synk EGEN KÖRNING GRÖN: register 432 = karta 432 = konstant 432;
  21 profiler; 0 fantomer; exit 0.
- Underlagsglidningen fördjupad: +36 kurser sedan 09-17-passningen utan EN ny
  quizfråga — D21:s tunnrot (progress-värdet per kurs) och A5:s bränslefrys
  (quiz/XP) är samma rot, nu på 432-kursnivå.
- /labb: 201 case EXAKT (data/export/case-studies.json, mtime 09-10 — fruset
  9 dygn; gap 4 lever). Notis: metadatatiteln hårdkodar "201"
  (src/app/(huvud)/labb/page.tsx:14) medan sidan renderar cases.length —
  okopplad siffra om casen växer.
- /kurser-500-fyndet (09-17, o47-klassen) är läkt sedan länge: live-sond
  loopback 200 (13,9 ms); data/vakten/senaste-deployad.txt = HEAD 30850791
  (00:20:41Z) = nattens hela vågkedja deployad.
- NATTENS RÖRELSE (s7, bokförs här med korsnotis till spår 7:s protokoll):
  o78 CV-kurer på /kurser — content-visibility:auto + höjdreservation på fem
  under-vecks-sektioner (kategoriväggen 76rem träffar /en|/ar via kurs-sok);
  o76 palett-klumpen ÄRLIGT DELVIS NEGATIV — klumpen lever under ny hash
  28yatov (Turbopack binder VarumarkesLogo via delade lib-beroenden; s7:s
  köpost: modul-karta → lib-brytning); Lighthouse EFTER /kurser P79 LCP 4364
  TBT 150 mot FÖRE P61/4982/841 — kundens största kursyta väsentligt snabbare.
- Gap-läge: (1) kurs-access-svit 0 träffar i verktyg/ (mätt igen — lever);
  (2) kurs-CMS lever; (3) quiz-entropin omätare (samma rot som
  underlagsglidningen); (4) labb-pipelinen frusen. Score LEVER 8 kvar
  (E33/B14-precedensen: talrättning + prestandabokföring, inget gap stängt).

### E31 — nattens spegel-prefetch-kur (o75) bokförd; MÖS FJÄRDE gröna; kärnan kodstilla; I1 fortfarande läget

- Motorvalidering EGEN KÖRNING: 107 PASS / 0 FAIL / 0 SKIP (5,7 s) — MÖS-lagrets
  FJÄRDE dokumenterade gröna (09-13, 09-15, 09-17, 09-19); tmp-skyddet höll
  (tmp_motor_koll.ts raderad i egen körning — s9-u1:s kur verifierad live).
- Rapportfilens FASTA namn lever: motorervalidering-2026-09-02.md (mtime
  00:28:27Z idag = färskt innehåll i vilseledande namn) — köposten kvar.
- Nyckelfiler OFÖRÄNDADE exakt: motor 820 · lager 890 · termbank 540 · kalla
  346 · kontroller 342 · ordlista 2 745 r — översättningsskiktet kodstilla;
  ytan enda rörelse är s7:s prestandakurer.
- Fallback-kön 320 poster (filen uppdaterad 09-04 — låst); termbank-tillagg
  0 poster (filen bär metadata + tom posterlista; Supabase type=termbank_tillagg
  är sanningen enligt egen notering).
- NATTENS o75 (deployad 00:20Z, E31:s kärnyta): prefetch={false} på 7
  länkställen per spegelrot (/en + /ar: hero-CTA-paret, sifferbandet, vision,
  sektionslistans djuplänkar, slut-CTA, mikro-raden) — s7-u1:s FÖRE-bevisning:
  6 _rsc-flygningar ≈ 48,5 KiB per kall mobil entré per spegel, STÄNGD.
  Mätning nu: 15 prefetch={false} per språk i 4 filer (bloggspegel-listornas
  8 ställen från 8fa5f0ce + o75:s 7).
- o77-klargörande med E31-relevans: hamtaSprak()s hydrat-språkbyte kurat —
  detektteraSprak() kvar exporterad med vägledning: framtida auto-detekt
  ENDAST SSR-konsistent (middleware Accept-Language → spegelredirect), aldrig
  via klient-hydrat; speglar (prop-lang) + SprakVäxlaren opåverkade.
- Tier-spegelgapet (gap 4) LEVER: prenumeration + medlemskap speglade,
  portfölj-ytorna SAKNAS (find-mätt: 18 kataloger/språk, ingen portfolj).
- I1-auditen OPÅBÖRJAD (0 artefakter; data/forskning/-auditräffarna tillhör
  andra spår). Speglar LIVE: /en /ar /en/kurser /ar/kurser alla 200 (loopback
  27–44 ms).
- Score PÅGÅR (I1) 7 kvar — prefetch-kuren är prestanda på spegelytorna, ej
  översättningskvalitet; auditen ÄR I1-läget.

KVD: endast SYSTEMKARTAN + worklog + anspråksfil + detta skript — INGET
bygge (deploy ägs av prod-synken); src/ orörd (tsc-baslinjen bärs av
pre-commit-grinden); R2 orörd; data/blogg/ orörd; syskonens ytor orörda
(u1 B7 · u3 A4/C16/E32). Snitt 7,6 / 288 / 38 oförändrat.

`;

const A1NOTIS = `*Återdiff 2026-09-19 (dokvåg s9-u2): **432 kurser** (siffror.json mtime 09-18
21:52Z; +36 sedan 09-17-passningen; larvag-synk EGEN GRÖN 432=432=432 · 21
profiler · 0 fantomer · exit 0); quiz 8 223 / XP 82 230 FRUSNA (underlagsglidning
djupare — D21/A5:s rot); /labb 201 case exakt (fruset sedan 09-10); /kurser 200
läkt (13,9 ms loopback; deployad = HEAD 00:20:41Z); nattens s7-våg bokförd (o78
CV-kurer, o76 delvis negativ — se UPPDATERING-sektionen). Gap 1 återmätt lever:
kurs-access-svit 0 träffar.*

`;

const E31NOTIS = `*Uppdatering 2026-09-19 (dokvåg s9-u2): nattens o75 bokförd — prefetch={false}
7 ställe/spegelrot (6 _rsc-flygningar ≈ 48,5 KiB/kall entré/spegel STÄNGD; nu 15
per språk i 4 filer med blogglistorna); o77:s språkdetekt-klargörande (auto-detekt
endast SSR-konsistent); motorvalidering EGEN 107/0/0 (5,7 s) = FJÄRDE gröna;
kärnan kodstilla exakt (820/890/540/346/342/2 745 r); kön 320 + termbank 0 poster
oförändrade; tier-spegelgapet lever (portfölj-ytor saknas); I1 0 artefakter;
speglar LIVE 200. Score PÅGÅR (I1) 7 kvar — prestandakur ändrar ej I1-läget.*

`;

const ersattningar = [
  // 1. Ny UPPDATERING-sektion före ÖVERSIKT
  ["## ÖVERSIKT — 38 system", UPPDATERING + "## ÖVERSIKT — 38 system"],
  // 2. A1-stämpel
  ["## A1. Kursplattformen — LEVER — 8/10 *(uppdaterad 2026-09-17)*",
   "## A1. Kursplattformen — LEVER — 8/10 *(uppdaterad 2026-09-19)*"],
  // 3. A1-notis före 09-17-återdiffen
  ["*Återdiff 2026-09-17 (s9-u3 omgång 12): talen 390 → **396 kurser**",
   A1NOTIS + "*Återdiff 2026-09-17 (s9-u3 omgång 12): talen 390 → **396 kurser**"],
  // 4. A1-Vad-rad: 396 → 432
  ["- **Vad:** Plattformens ryggrad: 396 kurser × 3 språk (deep-courses.json,",
   "- **Vad:** Plattformens ryggrad: 432 kurser × 3 språk (deep-courses.json,"],
  // 5. E31-stämpel
  ["## E31. Flerspråkighet: MÖS + termbank + speglar — PÅGÅR (I1) — 7/10 *(uppdaterad 2026-09-17)*",
   "## E31. Flerspråkighet: MÖS + termbank + speglar — PÅGÅR (I1) — 7/10 *(uppdaterad 2026-09-19)*"],
  // 6. E31-notis före 09-17-notisen
  ["*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 13): ÅTERDIFFAD (kartans äldsta",
   E31NOTIS + "*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 13): ÅTERDIFFAD (kartans äldsta"],
  // 7. ÖVERSIKT A1-rad
  ["| A1 | Kursplattformen (396 kurser, quiz, XP, case) | Utbildning | LEVER | 8 | Fullständigt kurs-CMS saknas; kurs-access utan egen testsvit |",
   "| A1 | Kursplattformen (432 kurser, quiz, XP, case) | Utbildning | LEVER | 8 | Fullständigt kurs-CMS saknas; kurs-access utan egen testsvit (0 sviter, mätt 09-19); quiz frusna 8 223 under +36 kurser (09-19) |"],
  // 8. ÖVERSIKT E31-rad
  ["| E31 | Flerspråkighet (MÖS + termbank + speglar) | Styrning | PÅGÅR (I1) | 7 | MÖS grönt tredje gången (107/0/0 egen 09-17); ordlista 2 154→2 745 r; kön 320 låst; tier-speglar preciserade (prenumeration/medlemskap finns, portfölj-ytorna saknas); I1-audit opåbörjad; rapportnamn fast 2026-09-02 |",
   "| E31 | Flerspråkighet (MÖS + termbank + speglar) | Styrning | PÅGÅR (I1) | 7 | MÖS grönt fjärde gången (107/0/0 egen 09-19); kärnan kodstilla; kön 320 låst; o75 prefetch-kur deployad (48,5 KiB/entré stängd); tier-speglar: portfölj-ytorna saknas fortfarande; I1-audit opåbörjad; rapportnamn fast 2026-09-02 |"],
];

for (const [oldS, newS] of ersattningar) {
  const n = text.split(oldS).length - 1;
  if (n !== 1) {
    console.error(`ABORT: ankare med ${n} träffar (krav: exakt 1): ${oldS.slice(0, 70)}…`);
    process.exit(1);
  }
}

for (const [oldS, newS] of ersattningar) {
  text = text.replace(oldS, newS);
}

writeFileSync(KARTA, text, "utf8");
console.log("OK: 8 ersättningar applicerade atomärt på", KARTA);
