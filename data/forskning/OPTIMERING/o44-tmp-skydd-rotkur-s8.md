# o44 — TMP-SKYDDETS ROTKUR: generering ur repo-roten + exit-mossningen + .tmp-zonens sopare (spår 8, s8-u1, 2026-09-17)

SYSTEMKARTAN gap 5 köpost 1 (dokvåg s9-u1 omgång 10) — *"tmp-skydd mekaniseras i
vakt/grind"* — levererad i **två komplementära halvor** efter live-kollision i
manifest auto-s8-1789619727317 (kollisionsnotis
`data/vakten/s8-tmpskydd-kollisions-notis-u2.md`):

| Lager | Ägare | Leverans |
|---|---|---|
| 1. ROT: tmp-generering ur roten → `.tmp/` | **s8-u1 (detta protokoll)** | 2 svitverktyg migrerade + exit-mossningskur |
| 2. tsconfig-exkludering | **s8-u1** | `.tmp` + `tmp_*.ts` |
| 3. VAKT/GRIND-städare | **s8-u2** | `verktyg/tmp-stad.mjs` (rot-zonens ägare) + pre-commit + sektion 11 — se `TMP-SKYDD-VAKT-GRIND-2026-09-17.md` |

Nummerflytt: u2:s notis reserverade o43 för rot-lagret, men s8-u3 (prod-synk-
arbetsytasynken) hade redan bokat o43 — detta protokoll blev **o44** (dubbel-
bokning upptäckt i tid; o43 ägs av u3).

## §1 Rotorsakan (kod- och körningsverifierad)

Kedjan som låste organismen 2026-09-17 01:19 lokal (23:19Z): svitverktyg
genererar tmp-TS **i repo-roten** (15 körskript, identisk första-rads-signatur
`// tmp_<namn> — GENERERAD av verktyg/<skript>.mjs. Raderas efter körning.`),
tsconfig include `**/*.ts` typar rot-filen ⇒ tsc exit 1 ⇒ pre-commit-grinden
blockerade ALL commit (falsklarm: mätkollision i arbetsTRÄDET, ej kodbrott).

**NYTT FYND under kurerandet — den ANDRA läckvägen (oanmäld i alla tidigare
kartor):** `process.exit()` inuti try **mossar finally i Node** —
`testa-morgonrond-data.mjs` anropade process.exit(0)/exit(1) INUTI try-blocket
⇒ unlinkSync i finally kördes ALDRIG ⇒ verktyget läckte tmp-filen vid **varje**
körning, inte bara vid SIGKILL. Bevisat live: efter en lyckad 19/19-körning
låg `.tmp/tmp_morgonrond_koll.ts` kvar; `testa-demoklient-data.mjs` läckte på
fail-vägen (G1:s kända fail). SIGKILL (fabrikens 25-min-tak/RAM-vakten) förblir
den tredje vägen; alla tre mossar/slår slecket om unlink.

## §2 Kuren (s8-u1:s lager)

1. **Genereringen flyttad ur roten** (`testa-demoklient-data.mjs` +
   `testa-morgonrond-data.mjs`): tmp-filen skrivs i `.tmp/` (våg 150:s
   gitignorerade engångsyta) med `mkdirSync recursive` + idempotent
   överskrivning (nästa körning täcker en eventuell läcka) + importerna en
   nivå upp (`../src/…`). tsx hittar tsconfig via cwd=REPO ⇒ `@/`-aliasen i
   demoklient-data.ts löser som förut (bevis: sviterna gröna, se §4).
2. **Exit-mossningskur**: wrapper-exiten flyttad EFTER finally
   (`slutkod`-variabel; exit sker när filen redan är städad) — läckan vid
   normala körningar stängd i roten.
3. **tsconfig exclude** `[".tmp", "tmp_*.ts"]`: `.tmp` dokumenterar kontraktet
   explicit (dot-kataloger matchas visserligen aldrig av include-globrar —
   se §5 fynd 2), `tmp_*.ts` stänger **hela den historiska klassen** — de 13
   rot-skrivande verktyg som ännu inte migrerats (kor-akm2-berika, kor-fvag,
   kor-oversatt-batch, importera-oversattning, testa-akm2-dynamik/-moduler/
   -karna/-snapshot, testa-akm3-kalibrering, testa-fundamental-vagmotor,
   testa-permissions-policy, testa-pro-screening, testa-sok,
   validera-motorer, testa-riskportfolj) kan aldrig mer låsa grinden.
4. **NY `verktyg/stada-tmp-ts.mjs` — .tmp-zonens sopare** (zonsopare; rot-zonen
   ägs ENLIGT ZONAVTAL av u2:s tmp-stad.mjs — denna röR ALDRIG repo-roten):
   sopar gamla signaturbärande `tmp_*.ts` i `.tmp/` när äldre än 6 h (default;
   `--alder-ms`/`--torr`/`--json`). Trippelskydd mot främmande filer: namnreg
   `^tmp_[a-z0-9_]+\.ts$` (fabrikens v150-/s2-KVD-skript matchar ALDRIG namnet)
   + signaturkrav (prefix `// tmp_` + EXAKT `GENERERAD av verktyg/` +
   `Raderas efter körning` — partiell signatur skonas, bevisat test 10) +
   åldersgräns (pågående svits fil, tsx-timeout 240 s, skonas). Svit
   `verktyg/testa-stada-tmp-ts.mjs` **12/12 PASS** (fixturer i OS-tempkatalog,
   ALDRIG i repot).

## §3 Samexistens med s8-u2:s lager 3 (bevisad, ej antagen)

u2:s `tmp-stad.mjs` ropas av pre-commit + vakten sektion 11 (deras yta —
orörd av mig); min städare är fristående utan driftkoppling ⇒ "pre-commit och
sektion 11 ropar EN städare" (notisens villkor) uppfyllt. Zonerna: rot = u2,
`.tmp` = u1. Båda signaturkirurgiska och idempotenta.

## §4 Bevis (sanna exitkoder, egna körningar 04:4x–04:5x lokal)

- `testa-stada-tmp-ts.mjs` **12/12 PASS** exit 0 (zonavtal, ålder, torr,
  partiell signatur, namnklass, determinism, CLI, tomt läge).
- `testa-morgonrond-data.mjs` **19/19 PASS** exit 0 — via `.tmp/`, filen
  **städad efter körning** (ls: saknas; före exit-kuren låg den kvar).
- `testa-demoklient-data.mjs` 16 PASS / 1 FAIL — G1 ("AKM2Resultat saknas i
  demodata") är den FÖREBEFINTLIGA, två gånger bokförda demodata-bristen
  (worklog 12247: "demoklient-G1 fortfarande röd 16/1") — INGEN regression:
  alla importberoende test gröna via `.tmp/`; **fail-vägen städar nu sin
  tmp-fil** (ls: saknas — exit-kurens andra bevis).
- `node node_modules/typescript/bin/tsc --noEmit` **exit 0** efter
  tsconfig-ändringen (.exclude grön; projektbinär, ALDRIG npx).
- **FALSKLARMSREPETITIONEN** (01:19-händelsen återskapad): signaturkorrekt
  `tmp_demoklient_koll.ts` planterad i roten → `bash verktyg/hooks/pre-commit`
  DIREKT: u2:s TMP-STÄD raderade läckan → tsc → **HOOK_EXIT=0**. Före
  dagens kurer låste samma situation ALLA commits (tsc fail); nu självläker
  grinden. Kontrafaktiskt rotlager-bevis: signaturläcka i `.tmp/` + tsc ⇒
  **exit 0** (zonen osynlig) + zonsoparen: `--torr` SKONAR (ung), `--alder-ms 0`
  STÄDAR signaturverifierat, filen borta, noll-läge "trädet rent".
- **Kvalitetsvakten helkörning** (u2:s sektion 11 + mina ändringar samtidigt
  aktiva): **11/11 PASS · ANTAL FEL 0 · MANUELLA 0 · GRÖN** exit 0
  (04:51:21Z) — samexistensen mätt, inte antagen.
- `node --check` × 5 gröna (stada-tmp-ts, testa-stada-tmp-ts, båda sviterna,
  tmp-stad).
- u2:s svit `testa-tmp-stad.mjs` 15/15 PASS i min körning (deras leverans
  orörd och levande — vävbeviset från min sida).

## §5 Metodfynd

1. **process.exit-inom-try mossar finally** — Node-doktrinerat men oupptäckt i
   15 verktyg; klassen av "städar i finally"-mönster är opålitlig i alla tre
   lägena SIGKILL/exit-inom-try/timeout. Presedens för alla framtida
   engångsfilsskrivare: exit EFTER finally + skriv i zon utanför
   mätytorna (`.tmp/`).
2. **Dot-kataloger matchas inte av tsconfig include-globrar** — `.tmp/` var
   redan tsc-osynligt (därför `.next/` explicit include:as); exclude-raden
   `.tmp` är dokumenterat kontraktsstöd, `tmp_*.ts` är det lastbärande
   rot-skyddet för de 13 omigrerade verktygen.
3. **Levande kollisionshantering fungerar**: u2:s notis + min anspråksfil +
   stagar-disciplin ⇒ noll förlorat arbete; zonavtal (rot/`.tmp`) gjorde två
   signaturkirurgiska städare komplementära i stället för dubbelt.

## §6 KVD

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (två gånger:
  före plantering + efter alla ändringar).
- INGET bygge (prod-synken äger); src/ orörd (endast verktyg/ + tsconfig +
  data/); R2 orörd (inga priser/tier/publicering); data/blogg/ orörd.
- Syskonytor orörda: u2:s tmp-stad/pre-commit/kvalitetsvakt-lager lästa +
  deras svit körd grön, ALDRIG redigerad; u3:s prod-synk-yta orörd; deras
  staged commits lämnas åt dem.
- Falsklarmklassen: 0 fynd i driftläget (vaktkörning GRÖN + trädet rent).

## §7 Kö (bokningar)

1. **Migrering av de 13 kvarvarande rot-skrivarna** till `.tmp/` +
   exit-efter-finally-kur (mönster: denna leverans §2; läckor sopas redan av
   u2:s grind-städare + tsconfig-globben håller tsc borta — inget brådskar;
   en kommande våg kan ta hela klassen i ett svep).
2. Demoklient-G1 (AKM2Resultat i demodata) — kvarstår som bokad (huvudagent-
   kö, worklog 12247); MIN commit ändrar inte demodata.

— s8-u1 (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-17 ~04:5x lokal
