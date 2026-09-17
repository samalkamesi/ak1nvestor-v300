# o47 — TMP-ROTSKRIVARNA MIGRERADE: sista 16 verktygen slutar generera tmp_*.ts i repo-roten (spår 8, s8-u3, 2026-09-17)

NUMMERFLYTT (o44-precedensen): detta protokoll skrevs som o46 men syskonet
s8-u1 landade sitt PATCH-KÖ-protokoll som o46 (commit 52734f74) under mitt
fönster — dubbelbokning upptäckt i tid, detta blev o47 (o46 ägs av u1).

o44 §6:s bokade köpost ("migrering av de 13 kvarvarande rot-skrivarna") —
levererad SOM HELT spårobjekt: **alla 16 kvarvarande tmp_*.ts-rotsskrivare**
(kartläggningen fann 16, ej 13 — testa-uppfoljning saknades i o44:s lista)
genererar numera i **`.tmp/`** (våg 150:s gitignorerade engångsyta,
tsconfig-exkluderad), och de två verktyg som bar den AKTIVA
exit-mossningen (o44 §5:1) fick slutkod-kuren. **Ingen kod genererar längre
tmp_*.ts i repo-roten — klassen är sluten i roten, inte bara sopad.**

Levande motiv vid start: kvalitetsrapport-SENASTE.md 05:09:35Z sektion 11
städade signaturverifierat `tmp_kalibrering_koll.ts` ur ROTTEN — klassen
läckte fortfarande i skarp drift varje gång verktygen kördes.

## §1 Omfattning (16 verktyg, tre strukturella varianter)

| Variant | Verktyg | Kur |
|---|---|---|
| A: spawnSync + unlink-före-exit (exit-säker) | testa-akm2-dynamik, testa-akm2-moduler, testa-akm3-kalibrering, testa-fundamental-vagmotor, kor-fvag | sökvägsflytt + mkdirSync + `../src` |
| B: process.exitCode + finally (exit-säker) | testa-akm2-karna, testa-akm2-snapshot, testa-riskportfolj, testa-uppfoljning, kor-akm2-berika | sökvägsflytt + mkdirSync + `../src` |
| C: **process.exit INUTI try** (mossar finally — o44 §5:1 aktiv) | **testa-sok, testa-pro-screening** | sökvägsflytt + mkdirSync + `../src` + **slutkodEFTERfinally-kur** |
| Manifest-burna (tmp-TS + tmp-manifest-JSON i roten) | kor-oversatt-batch, importera-oversattning | båda filerna → .tmp, argv-relativa sökvägar `.tmp/`-prefixade |
| Väktaren (async spawn + 34 dynamiska importer) | validera-motorer | sökvägsflytt + mkdirSync + `import("../src/…")` ×34 |
| Absolut-sökvägs-args (skalfri arrayform o21) | testa-permissions-policy | sökvägsflytt + mkdirSync + `../src` |

Enhetlig transform per verktyg (o44:s bevisade mönster, identiskt med
testa-demoklient-data/testa-morgonrond-data):
1. `const TMP_KAT = path.join(REPO, ".tmp")` + tmp-sökväg under TMP_KAT
   (manifest-JSON:er med — rotlLuckan gäller ALLA engångsfiler, ej bara tsc-synliga).
2. `mkdirSync(TMP_KAT, { recursive: true })` före writeFileSync (idempotent —
   nästa körning täcker en eventuell SIGKILL-läcka).
3. Genererad kods importspecifiers `"./src/…"` → `"../src/…"` (ATS: kartläggningen
   verifierade att INGA andra `"./`-referenser finns i genererad kod; cwd-relativa
   läsningar som `readFileSync("data/cache/…")` är opåverkade — barnet kör cwd=REPO).
4. tsx-args `.tmp/<namn>` (relativa, cwd=REPO; absoluta args orörda där de redan
   användes).
5. Variant C: `process.exit` flyttad EFTER finally via `slutkodWrapper`-variabeln.
6. Signaturraden `// tmp_… — GENERERAD av verktyg/… Raderas efter körning.` ORÖRD
   i alla 16 (städarnas kontrakt) + docblock-sanning ("i repots rot" → ".tmp/").

RÖRDA EJ (zonavtal o44 §3): verktyg/tmp-stad.mjs (rot-zonen, u2),
verktyg/stada-tmp-ts.mjs (.tmp-zonens sopare, u1), verktyg/testa-demoklient-data.mjs
+ testa-morgonrond-data.mjs (redan migrerade av o44), verktyg/kvalitetsvakt.mjs,
tsconfig.json (o44:s exclude består — skyddsLAGER kvar, se §4), src/**.

## §2 Bevis (sanna exitkoder, egna körningar 2026-09-17 ~10:5x–11:2xZ)

13 av 16 körda fullt (de två kor-berikarna + importläget SKRIVER
produktionsdata och fullkörs ej som test — se §3):

| Verktyg | Resultat | Rot | .tmp efteråt |
|---|---|---|---|
| testa-sok | ALLA PASS, exit 0 | tom | städad |
| testa-pro-screening | 26 PASS 0 FAIL, exit 0 | tom | städad |
| testa-akm2-dynamik | 55/55, exit 0 | tom | städad |
| testa-akm2-moduler | 64/64, exit 0 | tom | städad |
| testa-akm3-kalibrering | 55/55, exit 0 | tom | städad (dagens 05:09Z-läckkälla — kan ej läcka i roten längre) |
| testa-fundamental-vagmotor | 57/57, exit 0 | tom | städad |
| testa-akm2-karna | invarianten håller, exit 0 | tom | städad |
| testa-akm2-snapshot | 11/12, exit 1 — **FAIL 11 BEFINTLIG**: HEAD-versionen (git show > kör > jämför) misslyckas IDENTISKT = noll regression, bokförd köpost §5:2 | tom | städad |
| testa-riskportfolj | 32/32, exit 0 | tom | städad |
| testa-uppfoljning | 50/50, exit 0 | tom | städad |
| testa-permissions-policy | 63/63, exit 0 | tom | städad |
| **validera-motorer** (100%-väktaren) | **107 PASS / 0 FAIL / 0 SKIP, exit 0** (10,0 s) | tom | städad |
| importera-oversattning --kontrollera | FULLSTÄNDIG analys 104 filer/90,4 s/860 notiser, exit 1 = innehålls-poäng (nekad poster 65 p — verktygets design); **HEAD-versionen dog tyst vid tsx-steget i samma fönster** ("Ingen tolkbar JSON-utdata", tom stderr — rot-vägens brist, .tmp-vängen fullföljer: strikt bättre) | tom | städad + manifest städad |
| kor-oversatt-batch --status | mekanism GRÖN (generering + manifest + budget + städning); körningen passerade sitt EGNA 240 s-tak vid lagerräkningen = prestanda-köpost §5:3, ej migrering | tom | städad + manifest städad |

- `node --check` ×16 GRÖNA.
- `node node_modules/typescript/bin/tsc --noEmit` = **exit 0** (projektbinär, ALDRIG npx).
- **Kvalitetsvakten helkörning 11:22:50Z: 11/11 PASS · ANTAL FEL 0 · MANUELLA 0 · GRÖN, exit 0** — sektion 8 ropade DEN MIGRERADE validera-motorer (subprocess exit 0: 107/0/0 via .tmp) och sektion 11 tsc 0 fel på 9,3 s — **utan tmp-städningsrad**: roten ren I KONSTRUKTION (morgonens rapport 05:09Z behövde städa tmp_kalibrering_koll.ts; nu finns inget att städa).

## §3 Varför kor-fvag + kor-akm2-berika + batch-/importläget inte fullkörs

De skriver produktionsdata (fvag-{TICKER}.json ×100 i data/cache,
korstabell-grund.json-berikning, översättningslagret i Supabase) — en
migreringstest får inte ändra data-tillstånd (berika-pipelinen står Still
13 dagar enligt SYSTEMKARTAN; att trigga den är ett eget beslut, ej en
biverkning). Deras bevis: node --check + att wrapper-edits är formidentiska
med de 13 körda (samma TMP_KAT/mkdirSync/spawn-arg-form) + o44:s
morgonrond/demoklient-precedens för exakt denna form. Batchens tsx-steg är
dessutom INOM mekanismen bevisat av --status-läget och importens
--kontrollera-läge (samma generering+manifest+argv-mekanism).

## §4 Försvar på djupet — nu FYRA lager (varav detta är rot-nollan)

0. **(NY) Ingen generering i roten** — alla 18 tmp-skrivare (16 här + 2 i o44) bor i .tmp/.
1. tsconfig exclude `tmp_*.ts` + `.tmp` (o44) — historiska läckor syns ej för tsc.
2. pre-commit TMP-STÄD (u2) — signaturverifierad sopning FÖRE tsc i commit-vägen.
3. stada-tmp-ts.mjs (u1) — .tmp-zonens sopare (>6 h).
Lagren 1–3 består orörda: migreringen tar bort ATTACKYTAN, soparna kvarstår som
försvar för historiska/externa läckor. Morgondagens sektion 11-rapport förväntas
UTAN städningsrad — det är det nya normala (och om en rad DYKER upp = ny extern
läckkälla att jaga, se §5:4).

## §5 Köposter / fynd till spåret

1. **snapshot FAIL 11 (skriv-validering)** — befintlig (HEAD-bevisat), 11/12.
   Enda röda i hela verktygsparken; ägs av akm2-snapshot-lagringens validerings-
   gren — nästa kvalitetsvågs kandidat.
2. **importfilerna**: v86post-vad-ar-roe-kalla.json saknar kurs-slug + nekad
   poster (65 p) i v68bg.json (ar) — innehållsFYND från --kontrollera-körningen,
   data/källor-yta (ej denna vågs ändring).
3. **kor-oversatt-batch --status passerar 240 s-taket** — lagerräkningen växer
   med lagret; statusläget behöver pagineringsgrind eller eget tak (batchens
   tidsbudget är AVSEDD för motorarbete, ej lägeskoll).
4. **Gamla rot-vägens tysta död** (importera HEAD-körningen): tsx-barnet utan
   markörer OCH utan stderr — barnprocess-dödshypotes (OOM-killer?), ej
   diagnostiserbar post-hoc; noteras därför att "exec i roten" bar en dold
   felklass utöver tsc-exponeringen.

## §6 KVD

- `node node_modules/typescript/bin/tsc --noEmit` = 0 fel.
- Kvalitetsvakten GRÖN 0/0 (11:22:50Z), motorvalidering 107/0/0.
- INGET bygge (prod-synken äger); src/ orörd (endast verktyg/ + data/);
  R2 orörd; data/blogg/ orörd; .env orörda; syskonytor orörda
  (u1/u2:s anspråk lästa före start — ingen av dem äger verktygsparks-tmp-ytan;
  zonavtalen o44 §3 respekterade).

Anspråk: data/vakten/auto-s8-1789642527960-u3-ansprak.md (disk-först 10:57Z).
