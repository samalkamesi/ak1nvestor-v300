// Dokvåg s9-u2 (manifest auto-s9, 2/3, 2026-09-17): E32 + C15 diffade mot
// verkligheten — sektion + kirurgiska talrättningar i EN skrivning
// (clobber-kuren bb47685f: node-kanal + omedelbar commit).
import { readFileSync, writeFileSync } from "node:fs";

const P = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
let t = readFileSync(P, "utf8");
const fore = t.length;

// --- 1. Sidofixar: tal rättade i ÖVERSIKT + detaljblock (u1:4-precedensen) ---
const fix = [
  ["| A1 | Kursplattformen (352 kurser, quiz, XP, case) |",
   "| A1 | Kursplattformen (381 kurser, quiz, XP, case) |"],
  ["H1 stängt sedan v99 (kartan efter); 352 kurser, paritetssynk GRÖN",
   "H1 stängt sedan v99 (kartan efter); 381 kurser, paritetssynk GRÖN"],
  ["Ännu senare (s9-u2 2/3-mätning 2026-09-16): **352 kurser** (mx-vågorna kväll 09-15; quiz 8 223 oförändrad — nya kurser bär inga quiz).",
   "Ännu senare (s9-u2 2/3-mätning 2026-09-16): **352 kurser** (mx-vågorna kväll 09-15; quiz 8 223 oförändrad — nya kurser bär inga quiz). Senast (s9-u2 dokvåg 2026-09-17): **381 kurser** (s5:s kvällsvåg 09-16, 896c91ca; quiz 8 223 fortfarande oförändrad — larvag-synk GRÖN 381=381=381 · 0 fantomer, mätt)."],
  ["siffror.json (352 kurser, 8 223 quiz ...)",
   "siffror.json (381 kurser, 8 223 quiz ...)"],
  ["på alla 343 kurser × 3 språk",
   "på alla 381 kurser × 3 språk (mätt 2026-09-17)"],
];
for (const [a, b] of fix) {
  if (!t.includes(a)) throw new Error("ANKAR SAKNAS: " + a.slice(0, 70));
  t = t.split(a).join(b);
}

// --- 2. Ny sektion före ÖVERSIKT ---
const sektion = `## UPPDATERING 2026-09-17 (dokvåg s9-u2, manifest auto-s9 2/3 — E32 + C15 diffade mot verkligheten)

Objektval mot duplikat EFTER kollisionskontroll: senaste kart-commits
(f4bdbd03 E34+C16 · bb47685f A3+E37 · bdaaeacb E33, samtliga 09-16 kväll)
lästa — E32 och C15 FRIA, och med dagens största verklighetsglapp:
E32 diffad 09-15 men guldkällan rördes två vågor efteråt (352→375→381),
C15 diffad 09-15 men granskningskön fördubblad sedan dess. Redigering via
node-kanal + omedelbar commit (clobber-kuren — tredje kartclobbern
dokumenterad i bb47685f). Varje rad MÄTT i arbetsytan 2026-09-17 00:5x–01:2x
lokal (node-läsning av JSON, find/ls/wc/grep/stat, git log) — aldrig worklog:

| Mått | Kartan | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| siffror.json (E32) | 337 (not 09-15) / 352 (Vad-raden) | **381 kurser · 8 223 quiz · uppdaterad 2026-09-16 · kanonSomKurs 96** (node-mätt) — s5:s kvällsvåg 378→381 (896c91ca); kartans båda tal eftersläpade, rättade här |
| registerparitet (E32) | omätt | **larvag-synk GRÖN 381=381=381 · 0 fantomer · 21 unika profilsugs** (data/vakten/larvag-synk.json, ts 2026-09-16T21:36Z) — leveranskedjan atomär: karta/register/konstant |
| sökindex | "friskt 09-15" (C18-not) | **friskt 2026-09-16 23:32** (public/sok-index.json mtime) — synkat med 381-vågen |
| priser.json (E32) | orörd sedan 2026-09-07 (fbfb135f) | **fortfarande orörd** (git-mätt; 10 dagar) — registret stabilt, speglingsfönstret ej utlöst |
| variabler/siffror-filer (E32) | variabler 133 r · lagring 362 r | **oförändrade** (wc-mätt; siffror.ts 37 r · siffror-live.ts 110 r) |
| gap 2: sifferkonsistens (E32) | "ingen aktiv divergensmätning" | **DELVIS STÄNGD MÄTBART**: kvalitetsvaktens kontroll 10 "Sifferkonsistens (rakna-siffror + föråldrade tal i copy)" = **PASS 0 fel** i senaste rapporten (genererad 2026-09-16T22:55:18Z; dagligen 07:02) — guldkällan kontrolleras MEKANISKT mot rakna-omkörning + föråldrade copy-tal; samma rapport: kontroll 6 kursdata 105 kurser PASS, kontroll 8 motorer 107/0/0, kontroll 11 tsc 0 fel/6,8 s. KVAR: runtime-divergens för siffror-live (requestlägets läsning ur lagret) mäts ej — kontrollen täcker FIL-guldkällan |
| registerparitet mot mentor (A3-gränsmått) | E01 RÖD 358/375 (u2 omgång 7) | **gapet VUXIT: 358/381** — registret fortfarande inbakat 358 (senaste rebake b3b5e2c4, git-mätt; ingen ny sedan), källan 381 ⇒ 23 kurser osynliga för mentorns källmärke; A3:s område lämnas orört, kö bokförs |
| bloggutkast-trädet (C15) | "11 publiceringsklara JSON i roten" (09-15) | **135 filer** (find-mätt: rot 36 = 34 JSON + 2 MD · m9-ko 7 · granskning 59 · kvartal 33) — 124→135 sedan u3 omgång 9:s C16-mätning kvällen 09-16; branschguide-serien (B18) + Q3-paketen driver |
| publicerade (C15) | 55 | **55 oförändrade**; senaste fil-mtime **2026-09-14** (vad-ar-skuldsattningsgrad.json) — 3 dygn utan publicering medan kön växer (publiceringsbeslutet = kundens, R2 — bokförs, ej rörd) |
| GRANSKNINGSKO-SAMMANSTALLNINGEN (C15) | "åldras" (C15/C16-not) | **MOTBEVISAD**: 55 691 B, uppdaterad **2026-09-16 22:58** — leverantörerna registrerar sig själva vid leverans nu (s4-u3 c0684b79 registrerade Iberdrola-raden); kö-vyn LEVER |
| B2-publiceringsvägen (C15) | byggd våg 82, E2E overifierad | **koden orörd-funktionell** (grep-mätt): publiceraMedPaket i src/lib/blogg-utkast.ts (deklarerad i filhuvudet :18, :553) + knappen "Publicera (skickar till agent)" i blogg-panel.tsx:335 (syns ENBART på granskade utkast); E2E fortfarande overifierat — R2-knappen är kundens |
| gransknings-underkatalogen (C15) | 17 MD + diff-JSON (09-15) | **59 filer** — KONTROLL-ärenden tillkomna (boerspsykologi-fallstugor-KONTROLL-2026-09-16.md + branschmedianer-akm2-KONTROLL-2026-09-16.md): m9-GRANSKNING-guidens levande hållning förankrad i trädet — kontroll körs VID LEVERANS, inte bara när dokvågen tittar |
| kvartalsmassan (C15/C16) | 13 i kvartal/2026-q3 (09-15) | **33** — universumets 12 bolag fullbordade (SAAB 12/12) + Iberdrola-serien + branschkalendrarna; rappfönstret 20–23 oktober nära |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E32 | LEVER 8 → **LEVER 8** | Guldkällan är FÄRSK och paritetsgrön (381=381=381, 0 fantomer, sökindex synkat) + den DAGLIGA sifferkonsistenskontrollen (kontroll 10 PASS 0 fel) mjukar gap 2 från "ingen aktiv mätning" till "mekanisk fil-kontroll — runtime-livet återstår"; men gap 1 (speglingsfönstret manuellt) och gap 3 (priser.json utan schema-validering) orörda — inga bevis som motiverar poängrörelse (B13-precedensen). Talen i ÖVERSIKT/detaljblock rättade 352/343 → 381 |
| C15 | LEVER 8 → **LEVER 8** | Flödet friskt och DOKUMENTERAT levande: B2-vägen orörd-funktionell, sammanställningen uppdaterad av leverantörerna själva (motbevisar "åldras"-noten), kön 135 och växande med KONTROLL-ärenden i trädet — men publiceringsstocken (55 sedan 09-14) är kundens R2-beslut och inga nya tester/E2E-bevis tillkommit: ingen score-rörelse |

Snittscore **7,5** (285 poäng / 38 system — oförändrad av denna dokvåg; inga
poängrörelser, endast läges- och talrättningar med egna mätbevis).

Kö till huvudagenten/nästa dokvåg från fynden: (1) **registerrebake 358→381**
(spår 6:s bokförda kö — gapet vuxit 17→23 kurser sedan u2 omgång 7 mätte det;
E01 grönt krävs); (2) publiceringsbeslutet för 135-filkön = kundens (R2) —
sammanställningen lever och får fortsätta användas som beslutsunderlag;
(3) E32 gap 1+3 lever (speglingsfönster + priser.json-schema); (4) runtime-
divergens för siffror-live som rest av gap 2 (E2E-mätning vid tillfälle).

`;

const ankare = "## ÖVERSIKT — 38 system";
if (!t.includes(ankare)) throw new Error("ÖVERSIKT-ankar saknas");
t = t.replace(ankare, sektion + ankare);
writeFileSync(P, t, "utf8");
console.log("OK: " + fore + " → " + t.length + " byte (+" + (t.length - fore) + ")");
