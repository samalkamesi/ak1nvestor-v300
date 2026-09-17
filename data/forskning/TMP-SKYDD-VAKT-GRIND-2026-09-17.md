# TMP-SKYDD I VAKT/GRIND — SIGKILL-läckeklassen mekanisert oskadliggjord (spår 8, s8-u2, 2026-09-17)

SYSTEMKARTAN gap 5 köpost 1 (dokvåg s9-u1 omgång 10, db5a6be7): *"tmp-skydd
mekaniseras — vaktens sektion 11 och/eller pre-commit-grinden städar eller ropar
ut tmp_*_koll.ts i trädet FÖRE mätning; annars kan varje SIGKILL-dödad
svitkörning låsa ALLA commits tills manuell städning"*. Denna leverans stänger
köposten via den andra halvan (vakt/grind); första halvan (rot-flytt till
`.tmp/`) ägs av syskon s8-u1 enligt deras anspråk — se kollisionsnotis
`data/vakten/s8-tmpskydd-kollisions-notis-u2.md`.

## 1. Rotorsaka (kodverifierad)

**Kedjan som låste organismen 2026-09-17 01:19:**

1. **Femton körskript** genererar tmp-TS-filer i REPO-ROTen och städar dem i
   `finally`: `kor-akm2-berika.mjs` (tmp_akm2_berika.ts), `kor-fvag.mjs`
   (tmp_fvag_kor.ts), `kor-oversatt-batch.mjs` (tmp_kor_oversatt_batch.ts +
   manifest), `importera-oversattning.mjs` (tmp_import_oversattning.ts +
   manifest), `testa-akm2-dynamik/-karna/-moduler/-snapshot.mjs`,
   `testa-akm3-kalibrering.mjs`, `testa-demoklient-data.mjs`,
   `testa-fundamental-vagmotor.mjs`, `testa-morgonrond-data.mjs`,
   `testa-pro-screening.mjs`, `testa-riskportfolj.mjs`, `testa-sok.mjs` —
   samtliga med identisk första-rads-signatur:
   `// tmp_<namn> — GENERERAD av verktyg/<skript>.mjs. Raderas efter körning.`
2. **`finally` överlever inte SIGKILL.** Fabrikens 25-min-tak, RAM-vakten och
   manuell kill avslutar processen utan att finally-blocket körs → filen blir
   kvar i roten (bevisat: tmp_demoklient_koll.ts, 01:19, untracked).
3. **tsconfig inkluderar `"**/*.ts"`** (rad 34) → rot-nivåns läcka typas av
   tsc → TS2345 i tmp-filen → `node node_modules/typescript/bin/tsc --noEmit`
   exit 1.
4. **Pre-commit-grinden (våg 138) kör samma tsc** → ALL commit i trädet
   blockerad tills manuell städning. Mätt i kedjan av dokvågen: vaktsektion 11
   GUL 23:19Z + tsc exit 1 + svit 9/2 FAIL.

Felklassen är falsklarmsdoktrinens gråzon: vakten mätte ett ÄKTA fel med FEL
ROT — mätkollision (trasigt arbetsTRÄD), inte kodbrott i src/.

## 2. Kuren — signaturverifierad städning i två mekanismer

**NY `verktyg/tmp-stad.mjs`** — kirurgisk, aldrig blint raderande. En fil
raderas ENDAST om ALLA fyra villkor gäller:

1. ligger DIREKT i repo-roten (underkataloger rörs aldrig),
2. namn matchar `tmp_*.ts|.mts|.cts` ELLER `tmp_*_manifest.json`
   (generatörernas två filklasser; JSON kan inte bära kommentarsignatur),
3. är INTE git-trackad/staggad (`git ls-files`) — git-sanningen rörs aldrig,
4. ts-filer: första raden bär `GENERERAD av verktyg/`-signaturen (okända
   filer lämnas åt tsc, som blockerar TYDLIGT).

**Mekanism 1 — `verktyg/hooks/pre-commit` FÖRE tsc:** varje commit självläker
kända läckor innan typmätningen → en SIGKILL-dödad svitkörning kan ALDRIG mer
låsa commit-taket. Städarens eget fel låser aldrig commit (`|| echo`-fallback)
— tsc förblir den hårda grinden. CLI:t är tyst + exit 0 vid noll fynd
(pre-commit ska inte brusa).

**Mekanism 2 — `kvalitetsvakt.mjs` sektion 11 FÖRE tsc:** den dagliga
07:02-pumpan självläker trädet; städningen rapporteras TRANSPARENT i
sektionens info-rader (o26-doktrinen: vakten döljer aldrig) och tsc mäter det
städade trädet. Skonade filer (trackade/signaturlösa) listas också — de syns i
tsc-utdata om de bryter baslinjen.

**Samverkan med s8-u1:s rot-kur** (parallellt pågående): deras flytt av
tmp-generering till `.tmp/` (gitignorerad, tsconfig-exkluderad) gör FRAMTIDA
läckor strukturellt omöjliga; min städare sopar GAMLA roten-läckor som
lever kvar från före flytten. Gapet stängt i båda ändar.

## 3. Bevis

| Bevis | Resultat |
|---|---|
| Svit `verktyg/testa-tmp-stad.mjs` (15 fall, fixtures i mkdtemp under OS-tmp — sviten är själv immun mot sin klass) | **15 PASS / 0 FAIL** första körningen: torr-läge raderar ej; äkt läcka städas; idempotens; staggad/signaturlös/underkatalog/manifest-staggad/vanlig-fil ALLA skonas; CLI-kontrakt (torr/raderar/tyst-noll); levande repo-sond välformad |
| `node node_modules/typescript/bin/tsc --noEmit` | **exit 0** (projektbinären, ALDRIG npx) |
| Full vaktkörning `node verktyg/kvalitetsvakt.mjs` | **11/11 PASS · FEL 0 · MANUELLA 0 · GRÖN** (04:42:44Z) med städningen inbyggd i sektion 11 |
| `node --check` ×3 + `bash -n` pre-commit | OK |
| Levande gränsbevis: äkta signaturläcka `tmp_gransbevis_koll.ts` lagd i roten FÖRE commit | pre-commit-grinden städade den UNDER commiten (TMP-STÄD-rad i hook-utdata) — commit passerade, filen borta efteråt: den bevisade incidenten (01:19) kan inte upprepa sig |

## 4. Drift & regler

- Endast `verktyg/` + `data/` berörda — **src/ orörd, INGET bygge** (deploy
  ägs av prod-synken/kraschvakten under /tmp/ak1a-deploy.lock).
- Syskonytan `testa-demoklient-data.mjs` (s8-u1:s pågående rot-kur, ostaggad)
  orörd av mig — deras att committa.
- R2 orörd (priser/tier/publicering). `data/blogg/` orörd.
- Svitens fixtures lever i OS-tmp: en SIGKILL-dödad svitkörning kan inte
  läcka något som tsc typar — sviten är immun mot sin egen fyndklass.
