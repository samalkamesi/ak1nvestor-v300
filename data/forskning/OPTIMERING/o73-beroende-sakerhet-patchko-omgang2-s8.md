# o73 — Beroende-säkerhetens omgång 2 + bevisarkivets ms-kollision + mimosa-regression (spår 8, s8-u3 vakt)

Datum: 2026-09-18 (fönster ~17:0x–17:2xZ) · Barn: auto-s8 vakt 3/3 · Föregångare: o46 (patch-kön), o50 (köns tysta död), o55 (pm2-vakten), s8-u2 2026-09-18 (mimosa verktyg 3→0)

## 1. OBJEKT (duplikatkontroll före start)

Spår 8-temat "beroendeuppdateringar (patch)" + "vakten 0-fynd-jakt": next-RCE-klassen
är stängd (16.3.5 deployad 2026-09-18, kvitto EFTERBOKFÖRT av s8-u3-retry), patch-kön
`data/infra/patch-ko.json` = `[]`, men `npm audit --omit=dev` visar **8 sårbarheter
(2 high · 6 moderate)** och beroende-hälsorapporten var 3 dagar gammal (09-15, med
död next-critical kvar i texten = bokföringshygien-gapet). Ingen pågående session äger
ytan (trädet rent vid start). Nummer: o72 var reserverat i prod-synk.mjs-kod av blind-
revert-vakten (commit 920c3221) → detta protokoll tog **o73** (worklog/OPTIMERING fria,
o65-läxan tillämpad).

## 2. FÄRSK MÄTNING (instrumentet levandegjort)

`node verktyg/beroende-vakt.mjs` 17:11:28Z → `data/rapporter/beroende-halsa-SENASTE.md`
omskriven: **critical 0** (next-fixen bevisad i mätningen) · **high 2** (sharp, js-yaml)
· moderate 6. Audit-karta med fixvägar maskinellt kartlagd (npm audit --json --omit=dev).

## 3. PATCH-KÖN OMGÅNG 2 — sharp@0.35.4 (enda kirurgiska posten)

`data/infra/patch-ko.json` = `[{ "paket": "sharp", "version": "0.35.4" }]`

Motivering (o46-kontraktet: exakt semver, endast befintliga deps, max 10):
- **HIGH**: 4 ärvda libvips-CVE (2026-33327/33328/35590/35591, GHSA-f88m-g3jw-g9cj) +
  libheif-GHSA:er (GHSA-rgj7-g3m4-5g8c, fix <0.35.4). sharp driver next/image-
  bildoptimeringen i prod — exponerad yta (jfr AVIF-klassen GHSA-2xp9).
- **Kompatibilitet bevisad i trädet**: Next 16.3.5:s EGNA optionalDependencies
  deklarerar `sharp: ^0.35.4` — vår pin `^0.34.3` höll ramverket på det sårbara
  spåret. 0.35.4 är exakt den version Next självt begär.
- engines node >=20.9.0 mot serverns v22.23.2 ✓ (registry-verifierad).
- Installationen ägs ENDAV prod-synken (regel orubbad): nästa :x7-rop med RAM ≥2200 MB
  installerar + bygger + deployar + kvitterar (o55-pm2-vakten + o50-felklass-skiljning
  + o67-RAM-tak alla i kedjan). Bevisning EFTER: prod-synk.log "PATCH-KÖ aktiv:
  sharp@0.35.4", patch-kvitton.jsonl, node_modules/sharp = 0.35.4, prod 200.

## 4. ROTFYND A — bevisarkivets millisekundskollision (prod-synk.mjs)

Symptom: patchkö-sviten 50/1 intermittent i "idempotens: ny anrop sparar NY
uppsättning" (o50/o55 hade 51/51 — ms-lottot). Rot: `bevaraByggLoggar` nycklade
filnamn ENBART på millisekund-ISO ⇒ två anrop inom samma ms fick identiska namn ⇒
copyFileSync ÖVERSKREV diagnosen. **Mikro-repro FÖRE: 200 anropspar → 171
kollisioner (400 anrop → 211 filer)** — bevisförlust exakt när täta misslyckanden
sker (när diagnosen behövs som mest). KUR: monoton per-process-sekvens i filnamnet
(`<stampel>-<sekvens>-<namn>`, padStart 3). **Mikro-repo EFTER: 0/200 kollisioner,
400/400 filer.** Svit utökad med deterministiskt unikhetstest (30 tight-loop-anrop,
Set-storlek = antal) + regex uppdaterad ⇒ svit 52/0 stabilt grönt.

## 5. ROTFYND B — mimosa-regression i verktygsdomänen (_s4u1-kvd-ssab.mjs)

s8-u2 lämnade verktygsdomänen 0-fynd tidigare 2026-09-18; s4-u1:s engångs-KVD
(e74a0cdc 17:00, SSAB-läspaketet) reintroducerade klassen: rad 174 interpolerade
`${h}` — hämtad ur BLOGINNEHÅLLETS markdown-länkar (data-styrd!) — rakt in i en
`execSync`-shellsträng (mimosa CHILD_PROC_INTERP high: injektionsyta om innehåll
bär metatecken). KUR (rot, inte undantag): `execFileSync('curl', [array-argument])`
= per definition utan skal (mimosa:s härdade form). Verktygets beteende identiskt
(stdout → kod). Domän återmätt **GRÖN 0 fynd** (svitens egna fixturer exkluderade
enligt o40 §5:s metodnotis). Attribution: filen är s4-u1:s leveranskvitto — kuren
bokförs här, deras commit orörd i övrigt.

## 6. BEVIS (KVD)

- patchkö-svit **52/0** exit 0 · pm2vakt 35/0 · ramvakt 17/17 · arbetsytasynk 34/34 ·
  revertgrid 21/0 · tidsstampel exit 0 (samtliga prod-synk-sviter gröna på det kurerade trädet)
- mimosa '^verktyg/' GRÖN 0 fynd (exkl. dokumenterade fixture-fynd) + standarddomän GRÖN
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinär; även
  kvalitetsvakten sektion 11: 0 fel)
- node --check ×3 (prod-synk, patchkö-svit, kvd-ssab)
- kvalitetsvakten HELKÖRD 17:19:58Z: 12/12 PASS · FEL 0 · MANUELLA 0 · GRÖN
  (inkl. motorvalidering 107/0/0 + SSR-livssond 7/7)
- mikro-repro före/efter: 171/200 → 0/200 kollisioner (skript i §4, fixturer i OS-tmp)
- src/ orörd · INGET bygge (installation+deploy ägs av prod-synken) · R2 orörd ·
  data/blogg/ orörd · .env orörda · syskonytor orörda

## 7. REST-KÖ (nästa i spåret)

1. **Bevaka sharp-kvittot**: prod-synk.log + patch-kvitton.jsonl + node_modules/sharp
   vid/efter nästa :x7-rop med RAM-utrymme; faller bygg 3× → o50-loop-skyddet +
   versionbyte = nytt liv. EFTER kvitto:beroende-vakt omkörning (high 2→1).
2. **Omgång 3 (minor-tripel, efter sharp grönt)**: react/react-dom 19.3.0 +
   @types/react(-dom) 19.3.0 + ev. next-intl 4.14.5/supabase 2.116/react-query/
   react-hook-form/zod/tailwind-merge/puppeteer-core — LÄGRE riskappetit: core-runtime
   minor-steg bör delas i två omgångar (react-familjen först, sedan periferin).
3. **Major-klassen = KODLEVERANS, aldrig patch-kön**: @mdxeditor/editor 4.2.5 (stänger
   js-yaml HIGH + editor-moderate), react-syntax-highlighter 16.1.1 (stänger
   prismjs/refractor/r-s-h-moderate; SyntaxHighlighter-användning i src kartläggs
   FÖRE), satori/fflate saknar uppåtfix (npm föreslår NEDgradering 0.32.0 — väntar
   uppströms, ingen nedgradering i prod).
4. Bokföringshygien: beroende-hälsorapporten ska köras i vaktpulpan efter varje
   patch-kvitto (gapet 09-15→09-18 får inte upprepas).
