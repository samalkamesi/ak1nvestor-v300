#!/usr/bin/env node
// _s9u1-kartinjektion-0920.mjs — omapplikering av E35-dokvågens kartediteringar
// efter u2:s fullfil-commit (4719bfa7) klippte dem (s9-u2 09-19-precedensen:
// "ALLT omapplikerat och commit:tat direkt efter deras commit").
// Säkerhet: varje ankare måste finnas EXAKT en gång — annars abort utan skrivning.
import { readFileSync, writeFileSync } from "node:fs";

const KARTA = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
const WORKLOG = "/home/ak1a/AK1/worklog.md";

const SEKTION = `
## UPPDATERING 2026-09-20 (dokvåg s9-u1, manifest auto-s9-1789874113441 — E35 Kvalitetssystemet diffad mot verkligheten; de tre restgapen stängda på ett dygn)

Fabriksagent s9-u1 (byggare 1/3). VAL (anspråk disk-först ~05:2x lokal,
data/vakten/auto-s9-1789874113441-s9-u1-ansprak-e35-kvalitetssystem.md —
manifest-id + ämnesord i namnet, s8-u2:s processfynd): E35, sjunde
passningen — u3:s 09-19-passning efterlämnade TRE namngivna restgap och
samtliga tre har störtats av nattens rond 107 (VÅG 212), s8-vågorna (o106/o107/o108)
och rond 109 (v213a). Syskonen valde disjunkt (u2: E36+D24; u3: A2+A6+B14 —
anspråk lästa och respekterade). Varje rad MÄTT i arbetsytan 05:19–05:35
lokal 2026-09-20 — inte läst ur worklog.

| Mått | Kartan 09-19 | Verkligheten 09-20 (mätning) |
|---|---|---|
| Motorregistret | fruset 09-03 (dag 16) | **STÄNGT — levande igen**: rond 107 (ef3f1d5d 00:11) regen 106/106/0; s8-u3 o108 (e36facda 05:19) gallrade spökposten dynamic-catalog transparent (regen-kur: poster vars fil saknas på disk gallras med utdata + fältet gallradeUrRegistret, aldrig tyst) ⇒ **105 motorer · 105 testdade · 0 otestade i HEAD** (egen JSON-läsning: 105 poster, samtliga testad===true med testverktyg) |
| Aggregatorn | "123 sviter = provtagning, VÄXER" | **MEKANISERAD (VÅG 212 + v213a)**: verktyg/kor-alla-tester.mjs upptäcker ALLA testa-*.mjs automatiskt — sekventiellt, RAM-vakt 900 MB (tak 20 min/svit), timeout 900 s (SIGTERM⇒SIGKILL), tsx-återfall för ändelselösa TS-imports, kvitto-rad ur sviternas EGNA utdata; FÖRSTA HELSVEPET 124 sviter 71 GRÖNA/53 RÖDA (rond 107 — de 53 röda kurades samma rond = provtagningsbeviset); v213a miljöklasser i fasordning billigast→dyrast med --klass-filter + klasssumma (ALDRIG nivåsänkande): dagens **139 sviter** = DETERMINISTISK 129 · DEV-FÖNSTER 3 · PROD-NÄRA 6 · TUNG-TILLSTÅND 1 (egen ls-räkning + klassregex); styrelsesvitens två landminor kurade (port 3000 = prod ⇒ eget dev-fönster 3117/mock; ADMIN_PASSWORD-arv ⇒ trions hårdkodade kontrakt) — klassbevis 1/1 GRÖN |
| Vaktrapports-stoppet i deploy | "0 träffar i prod-synk" | **STÄNGT I KOD**: prod-synk.mjs:255–355+948 — RÖD kvalitetsrapport ⇒ deploy_stoppad_vaktrapport; obestämbär rapport ⇒ fail-open + detached omätning (deadlock-skydd); kontraktstest verktyg/testa-prod-synk-vaktrapport.mjs (grep-mätt) |
| SENASTE-helsvepsbeviset | fanns ej (inget svep kört) | **SAKNAS FÖR DAGENS BESTÅND**: testaggregator-SENASTE.* ej på disk (rond 109:s mini-svep --klass=tung arkiverade/återställde; r108-fullsvepets rapport finns ej kvar) ⇒ 139-svitors helsvep = KÖ (r109 bokade uttryckligt "fullsvep med klassordning" efter v213(b)-mottag) |
| Motorvalidering | 107/0/0 | **107 PASS / 0 FAIL / 0 SKIP (6,8 s) EGEN körning** |
| Vaktrapporten | 13/13 GRÖN 19:35:51Z | **oförändrad SENASTE** (13 kontroller ALLA PASS · FEL 0 · MANUELLA 0 · GRÖN; dagens 07:02-vaktpumpa väntar vid mättillfället) |
| Mimosa-basen | 1 624/0 @ 19:34:58Z | kontroll 13 i SENASTE-rapporten: **1 625 filer / 0 fynd**; s8-u2 förnyade basen 09-20: **1 772/0**; korskontrollsvit ALLA PASS EGEN. METODNOTIS: direkt CLI-anrop utan vakten härdningslista ger 4 high-fynd — samtliga i testa-mimosa-paritet.mjs:s EGNA fixtures (farlig-exec-exemplen) ⇒ kanon förblir kvalitetsvaktens anrop |
| Skalfri-vakten (o98) | första sviten 22/0 | **AUTOMATISK I DRIFT**: skalfri-senaste.json färsk 03:06:13Z samma natt — 490 filer · 0 fynd · 174 härdade |
| Typbaslinjen | 0 | **0 rader, exit 0 EGEN körning** (node node_modules/typescript/bin/tsc --noEmit) |
| Patch-köns tsc-grind (ny, o106/s8-u1) | — | kodad: npm install && tsc i SAMMA flock-fönster, tsc-fel river låsen FÖRE byggsteget (projektbinär, aldrig npx); omgång 3 react-familjen (react/react-dom/@types/react/@types/react-dom 19.3.0) lastad i data/infra/patch-ko.json och väntar första :x7-rop med RAM — LIVE-beviset outstanding; sharp 0.35.4 kvar i filen men ok-kvitterat (aktivPatchPlan filtrerar) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E35 | LEVER 9 → **LEVER 9** | Tre namngivna restgap stängda på ett dygn — aggregatorn mekaniserad (VÅG 212 + v213a), motorregistret levande med gallringskur (105/105/0), vaktrapportsstoppet i deploykod med kontraktstest — MEN helsvepsbeviset för DAGENS 139 sviter saknas (SENASTE-rapporten borta; aggregatorn saknar dessutom egen svit) och mimosa-basen kräver härdning per tillväxtvåg. Kört kapabilitet, inte färdigbevisat helgrönt bälte = inte 10-läge; rad-965-/E33-B14-precedensen. Score 9 kvar |

Snittscore **7,5** orörd (284 poäng / 38 system — ingen poängrörelse i denna dokvåg).

Kö/sidofynd: (a) KÖR fullsvepet — 139 sviter i klassordning, --fortsatt vid
RAM-avbrott; beviset tillhör SENASTE-konventionen och är r109:s bokade nästa
steg; (b) aggregatorn förtjänar en egen kontraktssvit (klassregex + kvitto-
parsning + återupptagning); (c) mimosa-direktanropets fixture-fynd kan härdas
i sviten själv (en --hoppa-over-rad) så CLI-kanon blir mindre avgörande.

`;

const E35_NOT = `*Uppdatering 2026-09-20 (dokvåg s9-u1, manifest auto-s9-178987411341;
sjunde passningen): de TRE restgapen från 09-19-passningen stängda på ett
dygn — allt EGENMÄTT 05:19–05:35 lokal: (1) **MOTORREGISTRET LEVANDE**:
rond 107 (VÅG 212) regenererade 106/106/0; s8-u3 o108 gallrade spökposten
dynamic-catalog transparent (regen-kur: fil-saknas-på-disk ⇒ gallras med
utdata + gallradeUrRegistret-fält) ⇒ **105 motorer · 105 testdade · 0
otestade i HEAD**. (2) **AGGREGATORN MEKANISERAD** (VÅG 212 + v213a):
kor-alla-tester.mjs kör HELA bältet sekventiellt med RAM-vakt 900 MB,
timeout SIGTERM⇒SIGKILL, tsx-återfall; första helsvepet 124 sviter 71/53
(provtagningsbeviset — 53 röda kurades samma rond); miljöklasser i
fasordning (DETERMINISTISK 129 · DEV-FÖNSTER 3 · PROD-NÄRA 6 · TUNG-TILLSTÅND
1 av dagens **139 sviter**) med --klass-filter, klasssumma, aldrig
nivåsänkande; styrelsesvitens landminor kurade (dev-fönster 3117/mock +
lösenordskontrakt). (3) **VAKTRAPPORTS-STOPPET I DEPLOYKOD**: prod-synk.mjs
stoppar deploy vid RÖD rapport (deploy_stoppad_vaktrapport), obestämbär ⇒
fail-open + detached omätning, kontraktstest finns. Motorvalidering
**107/0/0 EGEN (6,8 s)** · vaktrapporten 13/13 GRÖN oförändrad SENASTE ·
mimosa kontroll 13: 1 625/0 + s8-u2:s nya bas **1 772/0** (korskontrollsvit
ALLA PASS; metodnotis: CLI-direktanrop ser svitens egna fixtures = 4 high —
kanon är vakten anrop) · skalfri-vakten AUTOMATISK (03:06Z: 490 filer/0
fynd/174 härdade) · **tsc 0 rader exit 0 EGEN** · patch-köns tsc-grind
(o106) kodad med react-familjen lastad och väntar LIVE-bevis. Score 9
KVARSTÅR: helsvepsbeviset för dagens 139 sviter saknas (SENASTE-rapporten
borta efter mini-svepets arkivering), aggregatorn utan egen svit. Se
diff-tabellen i UPPDATERING-sektionen.*

`;

const E35_RAD_NY = "| E35 | Kvalitetssystemet (vakten, motorvalidering, verktygsbälte) | Grund | LEVER | 9 | DE TRE RESTGAPEN STÄNGDA på ett dygn (mätt 09-20): aggregatorn MEKANISERAD (kor-alla-tester.mjs, VÅG 212+v213a — RAM-vakt, timeout, tsx-återfall, miljöklasser 129/3/6/1 av 139 sviter i fasordning; första helsvepet 124 st 71/53), motorregistret LEVANDE (rond 107 regen + o108:s gallringskur ⇒ 105/105/0 i HEAD), vaktrapportsstoppet I DEPLOYKOD (prod-synk: RÖD ⇒ deploy-stopp, fail-open + omätning, kontraktstest) · motorvalidering 107/0/0 EGEN · vaktrapport 13/13 GRÖN SENASTE · mimosa 1 625/0 kontroll 13 + ny bas 1 772/0 (s8-u2) · skalfri AUTOMATISK 490/0 · tsc 0 EGEN · patchköns tsc-grind väntar react-LIVE-bevis; KVAR: helsvepsbeviset för dagens 139 sviter (SENASTE-rapporten borta — kör fullsvep, r109:s bokade steg), aggregatorn 0 egna sviter |";

const WORKLOG_RAD = `
## SPÅR 9 s9-u1 (byggare 1/3, manifest auto-s9-1789874113441) — 2026-09-20 ~05:4x lokal: SYSTEMKARTAN-dokvåg — E35 Kvalitetssystemet diffad (sjunde passningen); de tre restgapen stängda på ett dygn: aggregatorn mekaniserad + motorregistret levande + vaktrapportsstop i deploykod [fabrik]

Fabriksagent s9-u1. VAL (anspråk disk-först ~05:2x, gitignorerad väg data/vakten/auto-s9-1789874113441-s9-u1-ansprak-e35-kvalitetssystem.md — manifest-id + ämnesord i namnet, s8-u2:s processfynd; syskon disjunkta och lästa: u2 = E36+D24, u3 = A2+A6+B14). DIFF (allt EGENMÄTT 05:19–05:35 lokal, read-only): u3:s 09-19-passning efterlämnade tre namngivna restgap — samtliga STÄNGDA inom ett dygn av rond 107 (VÅG 212), s8-vågorna (o106/o107/o108) och rond 109 (v213a): (1) MOTORREGISTRET levande (kartan sa "fruset 09-03 dag 16") — rond 107 regen 106/106/0 + o108:s gallringskur (dynamic-catalog-spökposten gallras transparent, fält gallradeUrRegistret) ⇒ HEAD: 105 motorer · 105 testdade · 0 otestade (egen JSON-läsning). (2) AGGREGATORN mekaniserad (kartan sa "123 sviter = provtagning") — verktyg/kor-alla-tester.mjs: auto-upptäckt, sekventiellt, RAM-vakt 900 MB, SIGTERM⇒SIGKILL-timeout, tsx-återfall; FÖRSTA HELSVEPET 124 sviter 71/53 (rond 107 — de 53 röda kurades samma rond = provtagningsbeviset); v213a-miljöklasser i fasordning med --klass-filter + klasssumma (ALDRIG nivåsänkande): dagens 139 sviter = 129 DETERMINISTISK · 3 DEV-FÖNSTER · 6 PROD-NÄRA · 1 TUNG-TILLSTÅND (egna räkningar); styrelsesvitens två landminor kurade (dev-port 3117/mock + lösenordskontrakt), klassbevis 1/1 GRÖN. (3) VAKTRAPPORTS-STOPPET i deploykod (kartan sa "0 träffar i prod-synk") — prod-synk.mjs:255–355+948: RÖD ⇒ deploy_stoppad_vaktrapport, obestämbär ⇒ fail-open + detached omätning (deadlock-skydd), kontraktstest verktyg/testa-prod-synk-vaktrapport.mjs (grep-mätt). STÅENDE GRÖNT: motorvalidering 107 PASS/0 FAIL/0 SKIP EGEN (6,8 s) · vaktrapport 13/13 GRÖN SENASTE · mimosa kontroll 13: 1 625/0 + s8-u2:s nya bas 1 772/0 (korskontrollsvit ALLA PASS EGEN; metodnotis: CLI-direktanrop ser svitens egna fixtures = 4 high-fynd, kanon = vakten anrop) · skalfri-vakten AUTOMATISK färsk 03:06:13Z (490 filer/0 fynd/174 härdade) · tsc 0 rader exit 0 EGEN (projektbinär). NY KÖ: helsvepsbeviset för dagens 139 sviter saknas — testaggregator-SENASTE.* borta efter r109:s mini-sveps-arkivering; fullsvep i klassordning = r109:s bokade steg; aggregatorn 0 egna sviter; patchköns tsc-grind (o106) väntar react-familjens LIVE-bevis vid nästa :x7-rop med RAM. Score 9 KVARSTÅR (körd kapabilitet, inte färdigbevisat helgrönt bälte — rad-965-/E33-B14-precedensen); snitt 7,5/284/38 orört. KOLLISIONSHANTERING: u2:s fullfil-commit (4719bfa7) klippte redan applicerade karteredigeringar — verifierat 0 markörträffar, ALLT omapplikerat via _s9u1-kartinjektion-0920.mjs (anfare-verifierad, EN atomär skrivning) direkt efter deras landning (s9-u2 09-19-precedensen). KVD: data-only — src/ orörd = INGET bygge · R2 orörd · data/blogg/ orörd · syskonytor orörda (u2:s leverans deras — mina E35-ytor disjunkta). [fabrik]
`;

// ── ankarverifiering + injektion (abort utan skrivning vid avvikelse) ────────
function assertEn(bunkas, nalar, namn) {
  const n = bunkas.split(nalar).length - 1;
  if (n !== 1) {
    console.error(`ABORT: ankare "${namn}" fanns ${n} gånger (väntat 1) — ingen skrivning`);
    process.exit(1);
  }
}

let karta = readFileSync(KARTA, "utf8");
if (karta.includes("dokvåg s9-u1, manifest auto-s9-1789874113441")) {
  console.log("sektionen finns redan — inget att göra (idempotent)");
  process.exit(0);
}
const A_OVERSIKT = "## ÖVERSIKT — 38 system";
const B_E35RAD_GAMMEL = "| E35 | Kvalitetssystemet (vakten, motorvalidering, verktygsbälte) | Grund | LEVER | 9 | 13 kontroller (sektion 13 Mimosa";
const C_E35RUB = "## E35. Kvalitetssystemet (vakten + motorvalidering + verktygsbälte) — LEVER — 9/10 *(uppdaterad 2026-09-19)*\n\n*Uppdatering 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789847706174;\nsjätte passningen)";
assertEn(karta, A_OVERSIKT, "ÖVERSIKT-rubrik");
assertEn(karta, B_E35RAD_GAMMEL, "E35-översiktsrad (gammel)");
assertEn(karta, C_E35RUB, "E35-rubrik+not-09-19");

karta = karta.replace(A_OVERSIKT, SEKTION.trimStart() + A_OVERSIKT);
karta = karta.replace(
  C_E35RUB,
  C_E35RUB.replace("*(uppdaterad 2026-09-19)*", "*(uppdaterad 2026-09-20)*") + "\n\n" + E35_NOT.trimEnd(),
);
const gammelRad = karta.split("\n").find((r) => r.startsWith(B_E35RAD_GAMMEL));
karta = karta.replace(gammelRad, E35_RAD_NY);

let worklog = readFileSync(WORKLOG, "utf8");
const WL_ANKARE = "Mätare: verktyg/_s9u2-kartuppdatering-0920.mjs (read-only, GET/HEAD endast). [fabrik]";
assertEn(worklog, WL_ANKARE, "worklog-u2-sista-rad");
worklog = worklog.replace(WL_ANKARE, WL_ANKARE + "\n" + WORKLOG_RAD.trimEnd() + "\n");

writeFileSync(KARTA, karta, "utf8");
writeFileSync(WORKLOG, worklog, "utf8");
console.log("OK: sektion + E35-not + E35-rad injicerade i kartan; worklog-rad appendixad");
console.log("markörer:", (karta.match(/dokvåg s9-u1, manifest auto-s9-1789874113441/g) || []).length, "(väntat 2: sektion+notreferens),", (karta.match(/DE TRE RESTGAPEN STÄNGDA/g) || []).length, "(väntat 1)");
