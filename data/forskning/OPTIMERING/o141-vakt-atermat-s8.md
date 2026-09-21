# o141 — VAKT-ÅTERMÄTNING EFTER FABRIKHELGEN (spår 8, s8-u2, manifest auto-s8-1789972517251)

Datum: 2026-09-21 · Agent: fabriksagent s8-u2 (vakt 2/3) · Nummer: o141 (reserverat i
protokollnummer.json; o140 = s8-u1, o142 = s8-u3 — ytor respekterade hela vågen).

## 1. Uppdrag och valgång

Spårets stående kärna: tsc-baslinjens överlevnad, vakten 0-fynd-jakt, Mimosa-fyndens
rotorsaker, döda länkar. VAL (anspråk disk-först 07:33Z lokal,
`data/vakten/auto-s8-1789972517251-s8-u2-ansprak-o141-vakt-atermat.md`): **återmätning av
båda storskaliga referensbaserna** — Mimosa full-scan och intern länkcrawl — efter två
dygns intensivaste fabriksdrift sedan senaste mätningar (Mimosa-bas 1 772/0 satt 2026-09-20
~05Z av föregående s8-u2; länkcrawl-bas 3 743/0 satt 2026-09-19 av s8-u3b). Mellan baserna
och nu: manifest s1–s7 (21 barn) levererat, OOM-natt med fyra döda synkbyggen + läkecykler
2026-09-19→20, räddningsbygg 2026-09-20 22:2xZ, kraschloop med restarts 6961 — dvs exakt
den typ av miljö där baslinjer riskerar att ha brustit tyst.

Friktionskontroll: u1 äger tick-svält-instrumentet o140 (deras ocommittade
`andringar/route.ts`-diff märkt o140 lämnades orörd); u3 äger döda externa nattfönster o142
(deras `doda-lankar-externa*.mjs`-diffar orörda). Beroende-patch = blockerat av fabrikregler
(ALDRIG npm). F1-syntaxfyndet (`testa-s7-o118-nastasteg-defer.mjs`) visade sig
**inaktuellt**: filen existerar ej på disk och har ingen git-historik = ocommittad skrotfil
sedan buren bort; feljagarens bedömningsfil är u1:s aktiva skrivyta just nu, därför lämnad
att dömas av nästa feljaktskörning istället (fyndet självläker vid återmätning — verktyget
sonderar disk, inte registret).

## 2. Mätningar — utfall

### 2.1 tsc-baslinjen (NOLL sedan våg 133)

`node node_modules/typescript/bin/tsc --noEmit` → **0 fel** (projektbinär, läsning — inget
bygge, inget npx). Baslinjen överlevde fabrikshelgen.

### 2.2 Mimosa full-scan — NY REFERENSBAS 2 250/0

Kvalitetsvaktens exakta anrop (rad 1065 i verktyg/kvalitetsvakt.mjs):
`node verktyg/mimosa-paritet.mjs --doman . --hoppa-over "testa-mimosa-paritet\.mjs$" --json <radata>`

- **2 250 filer skannade · 0 fynd · exit 0** (07:19:40Z, verktyg v1.6)
- Tillväxt sedan förra basen: 1 772 → 2 250 filer (**+478, +27 %**) — helheten höll under
  tillväxten: SSRF_INTERPOLERAD_FETCH 154 träffar varav **154 härdade** (förra basen 146),
  SHELL_URL_VARIABEL 1/1 härdad, PATH_API 1/1 härdad; loopback-/externa-literaler och
  CHILD_PROC_STRANG_LITERAL = tillåtna kontexter enligt v1.4-domänerna (oförändrad domän).
- Rådata: `/tmp/mimosa-fullscan-s8u2-o141.json` (skannadeFiler=2250, fyndPoster=[], exit=0).

### 2.3 Intern länkcrawl — NY JÄMFÖRELSEBAS 4 056/0

`node verktyg/doda-lankar.mjs --bas=http://localhost:3000` (o55-instrumentet med egna
mätfönster-grindarna):

- Mätfönster **grunder gröna** (fuser-ÄGANDE, byggmonster, hälsogrind) före crawl.
- Sitemap-frö: **2 604** (2 420 vid senaste crawlen 09-19).
- **4 056 unika sökvägar kontrollerade på 810 s · DÖDA 0 · OMDIRIGERINGAR 0 · exit 0**
- Tillväxt sedan 09-19: 3 743 → 4 056 (**+313, +8,4 %**) med 0 döda = länkgrafen sluten
  och hel trots tre dagars innehållsleveranser (s1–s7:s kurser/utdelningar/dataset).
- Rapport: `data/vakten/doda-lankar-2026-09-21.json` (gitignorerad per konvention —
  diskbeviset bevaras; filskyddet med klockslagssuffix aktivt).

### 2.4 Prod

Loopback-sonder under vågen: `/` = 200, `/kurser` = 200.

## 3. Rotorsaksfix?

Ingen påkallad — **noll fynd i båda domänerna**. Vaktens uppdrag omfattar att BEVISA
frånvaron, inte bara fixa närvaron: helhetsbeviset (0 fynd genom +478 skannade filer och
+313 nya sökvägar i exakt det driftfönster som producerade OOM-nätter och kraschloopar) ÄR
leveransen; rotorsaksfix vore att fabricera arbete. Öppna fynd som GRANSKADES och lämnades
med motivering: F1-syntaxfyndet (inaktuellt, se §1 — filen borta, ingen git-historik);
AGENTARBETSYTA-SYNK "ocommittade (1 rad)" (rotorsaka = u1:s pågående o140-diff — deras
bokföring när den landar); F3-api-efterdyningar 22:28Z (kraschloopens kalla transport,
redan klassad av FYNN nr 3-grinden).

## 4. KVD

- src/ orörd · INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd.
- Syskonytor orörda: `andringar/route.ts` + `feljagaren.mjs` + `feljakt-bedomningar.jsonl`
  (u1), `doda-lankar-externa*.mjs` + `_s8u1o140-omstart.mjs` (u1/u3).
- Commit: explicit pathspec (anspråk + protokoll + protokollnummer.json + worklog-append);
  protokollnummer.json bärs med syskonens redan disk-reserverade poster (o140/o142) —
  additiv bokföring, inget arbete övertaget.
- Beviskedja: mimosa exit 0 (2 250/0) · crawl exit 0 (4 056/0, grunder gröna i logg) ·
  tsc 0 · prod 200 ×2 · node --check på orörda verktyg (feljagaren OK).

## 5. Kö till nästa vaktvåg

1. Feljaktskörning bör döma F1-syntaxfyndet läkt (fil borta) — u1:s skrivyta först klar.
2. Nya referensbaser: Mimosa 2 250/0 · länkgraf 4 056/0 (2026-09-21) — nästa återmätning
   mäter mot dessa.
3. Externa länkar: u3:s o142 nattfönster pågår — deras domän.
4. Observation från o95 (BLOCKERADE-andelens dygnsvariation hos externa värdar) förblir
   öppen hos externa ytan.
