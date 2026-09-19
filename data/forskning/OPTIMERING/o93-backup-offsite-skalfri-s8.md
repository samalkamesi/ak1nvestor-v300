# o93 — backup-offsite SKALFRI (spår 8: kvalitet & säkerhet, s8-u2 omgång 2026-09-19)

**Datum:** 2026-09-19 · **Agent:** s8-u2 (manifest auto-s8-1789821900404, vakt 2/3) ·
**Företrädare:** o15 (Mimosa-läxan), o55 (instrumentkuren), o59/o73 (verktygsdomänens
CHILD_PROC_INTERP-jakter), o80 §sidofynd (bokade detta objekt), o85/o86 (kölistor).

## §0 Val, pivot och duplikatkontroll

- **Ursprungsval** (klaim 12:47:10Z, disk-först): o86 §4 systemiska skenfynd-klassen —
  den namngivna huvudköposten. **PIVOT 12:52Z:** duplikatkontrollen EFTER klaim visade
  att kuren REDAN var levererad av förra omgångens s8-u3 som o86-granssnitt-driftblindhet
  (basHalsa {sida,css} + driftVerdiktor-tak EFTER svepet, svit 45 PASS, wired i
  granssnittsvakt.mjs:759–781). Duplikat = förlorat arbete ⇒ avstånd taget, klaimfilen
  omskriven med pivot-notis, nästa namngivna öppna post vald.
- **Valt objekt:** `verktyg/backup-offsite.mjs:82` CHILD_PROC_INTERP [high] — öppen
  bokförd i TRE ställ: o80 §sidofynd ("DR-spårets fil orörd, args-citering skall bedömas
  av ägande spår"), o85-kön ("backup-offsite-INTERP åt DR-spåret") och o86 §5 kölista
  post 4. DR-spåret hade ej plockat den (~13 h efter bokning; inget DR-protoklop rör
  filen); Mimosa-fyndens rotorsaker är spår 8:s kärntema och posten står i spårets EGEN
  kölista ⇒ tas här med ägarskapsmotivet protokollfört.
- **ParallellSanering noterad:** engångsskripten `verktyg/_s1u1b-np3-kontroll.mjs` +
  `verktyg/_s2u1omg18-commit.mjs` kurerades till execFileSync-array av syskon (mtime
  14:52:17, 90 s före min EFTER-mätning) — KOMPLEMENTÄRA kurer, noll filöverlapp;
  deras leverans är deras.

## §1 Fyndet och roten

`execSync(\`cd ${JSON.stringify(ROT)} && tar -czf ${JSON.stringify(sökväg + ".tar.gz")} ${args}\`)`
— förstahandsargumentet är en interpolerad skalsträng (Mimosa CHILD_PROC_INTERP high,
skalfri-vakt FYND). I DR-kritiska filen som pumporna kör var 6:e timme. Praktisk risk
i nuläget låg (ROT + delar är interna värden), men klassen är doktrinens: skal tolkar
värdet, och verktygsdomänens enda DRIFTSVERKTYG med ohärdad form stannade här —
övriga fynd i dagens domänrapport var engångsskript (nu sanerade av syskon), testfixturer
(testa-mimosa-paritets EGEN ggrund — undantag sedan o15) och gitignorat sessionsavfall.

## §2 Kuren (beteendeidentitet bevarad)

1. `execFileSync("tar", byggTarArgv(delar, sökväg + ".tar.gz"), { cwd: ROT, … })` —
   program + argument-array; ROT når processen via `cwd` i stället för interpolerad `cd`.
2. `execFileSync("git", ["push", "origin", "develop"], { cwd: ROT, … })` — skal-pipen
   `2>&1 | head -2` bort (utdatat lästes aldrig; felutdata trunkeras redan i loggen).
3. Ren exporterad funktion `byggTarArgv(delar, malFil)` — svitens importyta
   (konsol/urval/drift-precedensen).
4. **Main-guard** (feljagar-precedensen o80): `main()` körs endast som entry — pumpornas
   rop `node verktyg/backup-offsite.mjs` är orört, men import startar ALDRIG skarp
   backup + git push.
5. **Dubbelsuffixet `.tar.gz.tar.gz` bevarat medvetet**: diskens samtliga arkiv
  (ak1a-offsite-*.tar.gz.tar.gz sedan våg 172), rensningsfiltret
  (`.endsWith(".tar.gz")`) och kundens hämtningsflöde är konsekventa — härdningen
   ändrar angreppsytan, inte beteendet. Dokumenterat i källan + svitkontrakt.

## §3 Bevis

| Kontroll | Resultat |
|---|---|
| Svit `verktyg/testa-backup-offsite.mjs` (ny) | **12 PASS · 0 FAIL** — källkontrakt ×7 (härdade former, inga skal-mallar kvar) + ren funktion ×4 (ordning, ingen suffix-mutation, specialtecken = ett element) + main-guard (skarp logg orörd av import) |
| skalfri-vakt FÖRE (HEAD:s version i tmp) | **1 FYND** — rad 82, ordagrant Mimosa-fyndet |
| skalfri-vakt EFTER (kurad) | **0 fynd · 1 härdad (arrayform) · GRÖN** |
| Mimosa verktygsdomän EFTER (2026-09-19T12:53:48Z) | `backup-offsite` **ur fyndlistan**; CHILD_PROC_INTERP i trackade verktyg = **0** (1 kvar i gitignorat .zcode-sessionsavfall — o59-hygienklassen) |
| node --check × 2 | OK |
| `node node_modules/typescript/bin/tsc --noEmit` | **0 FEL** (projektbinär) |
| Grannregression `testa-pumpor-scheman.mjs` | **8 PASS · 0 FAIL** (pumpornas rop-kontrakt orört) |

FÖRE-bevis: `data/forskning/OPTIMERING/mimosa-paritet-verktygdoman-2026-09-19.json`
(12:47:54Z, 9 CHILD_PROC_INTERP varav backup-offsite.mjs:82 som ENDA driftverktyget).
EFTER: `mimosa-paritet-verktygdoman-EFTER-o93-2026-09-19.json`.

**Skarpkörningsprohibition (självpålagd):** verktyget kör `git push origin` vid main()
— ALDRIG skarp körning i vågen (GitHub-spegling ägs av kundens arbetsstation); bevisen
är funktionella + statiska + dubbelinstrument, inga exekverade backuper.

## §4 Sidofynd (bokade, ej ägda)

1. **skalfri-vakt.mjs args-tolkning:** `statSync(rot).isAbsolute` är alltid undefined
   (fs.Stats saknar egenskapen — avsett var `path.isAbsolute(rot)`) ⇒ absoluta
   katalogargument bryts mot `join(cwd, rot)`. Kringgås med cwd+relativ arg. Kur är
   en rad + svitfall; lämnas åt verktygets ägarspår.
2. .zcode-sessionsavfallets 2 kvarvarande fynd (granskning-mx1-konsument SSRF +
   granskning-s1u3-saas CHILD_PROC) — gitignorat sedan våg 149, hygienklassen o59:
   saneras med katalogen, härdas ej.

## §5 Kö (spår 8)

1. migrerar-E-regeln (o72) — oförändrat öppen.
2. "OVÄNTAD EXIT 0"-jakten (o85) — villkorad av live-återkomst.
3. skalfri-vakt isAbsolute-kur (§4.1) — en-radsläkt.
4. nästa Mimosa-återmätning av verktygsdomänen när vågor tillför verktyg
  (nya EFTER-referensen: 2 fynd, båda i .zcode).

## KVD

src/ orörd = **INGET bygge** (prod-synken äger) · R2 orörd (priser/tier/publicering ej
berörda) · data/blogg/ orörd · syskonytor orörda (engångsskriptsaneringen var deras) ·
Write + omedelbar git add (o87-läxan) · commit med -F.
