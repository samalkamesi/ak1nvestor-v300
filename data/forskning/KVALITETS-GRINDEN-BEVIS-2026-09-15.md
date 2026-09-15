# KVALITETSGRINDEN — MEKANISKT BEVIS + R2-HÄRDNING (s8-u1, 2026-09-15)

Spår 8 (kvalitet & säkerhet), fabrikens manifest auto-s8-1789463119633,
uppgift s8-u1. Objekt: **tsc-baslinjens överlevnad** — spårets första
kontextord: grunden (våg 138) var MEKANISK, men ingen hade någonsin bevisat
att den faktiskt blockerar. Detta dokument är det beviset, plus en härdning
av ett bevisat hål.

## Läge före (sond 11:0x)

- `git config core.hooksPath` = `verktyg/hooks` — grinden ÄR aktiverad.
- `verktyg/hooks/pre-commit` körbar (775), ägd av våg 138 (ca19a742),
  senaste ändring committad 2026-09-14 — fritt att överta för kirurgi.
- `npx tsc --noEmit` = **0 fel** (baslinjen lever, mätt tre gånger under
  testerna nedan: A, B2, D2 — alla exit 0).

## Mekaniska bevistester (exit-koder, körda 2026-09-15 ~11:2x)

| Test | Tillstånd | Förväntat | Resultat |
|---|---|---|---|
| A | Rent träd, hook direkt | exit 0 | **0** ✅ |
| B | `src/__s8u1_hooktest_typfel.ts` (sträng→number) i trädet | exit 1 + feltext | **1** + TS2322 + grindens meddelande ✅ |
| B2 | Samma fil borttagen | exit 0 | **0** ✅ |
| C | Fejk-`.pem` stegad i **isolerat tmp-index** (GIT_INDEX_FILE) | exit 1 + R2-text | **1** ✅ |
| D | `.p12` + `.kdbx` stegade (isolerat index), FÖRE härdning | önskade exit 1 | **0** ❌ — **HÅL BEVISAT** |
| D1 | Samma, EFTER härdning | exit 1 | **1** ✅ |
| D2 | Endast oskyldig `.txt` stegad | exit 0 | **0** ✅ (ingen överblockering) |
| D3 | `.pem` igen (regression) | exit 1 | **1** ✅ |

Isoleringsmetod (C/D-serien): `git read-tree --index-output=$TMP HEAD` +
`git update-index --add <fil>` + hook med `GIT_INDEX_FILE=$TMP` — riktiga
indexet och historiken rördes ALDRIG; testfilerna togs bort efteråt och
`git status` verifierades ren. (Första C-körningen var felaktig — env
saknades på själva hook-anropet — omkördes korrekt; dokumenterat för
ärlighet.)

## Rotorsaksfyndet: R2-regexet saknade helgömda nyckelformat

Originalmönstret täckte `.env*`/`.pem`/`.key`/`id_rsa`/`id_ed25519`/
`secrets?.` men lät **`.p12`, `.pfx`, `.jks`, `.kdbx`, `.htpasswd`**
passera okontrollerade — filformat där HELA filen är nyckelmaterial
(PKCS#12/PKCS#7, Java-keystore), lösenordsvalv (KeePass) eller
autentiseringshashar (htpasswd). En .p12 med privat nyckel kunde alltså
committas av misstag medan en .pem blockerades.

**Kur (samma commit som detta dokument):** regexet utökas med
`\.p12$|\.pfx$|\.jks$|\.kdbx$|\.htpasswd$` + meddelandetexten uppdaterad.
`.gpg` medvetet UTE (publika nycklar är legitimt repo-innehåll —
falskpositiv-blockering vore värre än risken). Bevis: D1 blockerar,
D2 passerar, D3 regressionssäker.

## Kända egenskaper (dokumenterade, ej fel — beslutsunderlag)

1. **tsc mäter ARBETSYTAN, inte bara stegat tillstånd.** En commit
   blockeras även om typfelet ligger i en OSTEGAD fil (t.ex. ett annat
   parallellt barns pågående arbete). Det är striktare än strikt —
   doktrinen "typnollen gäller hela repet" är uppfylld mekaniskt, men
   samtidiga fabriksbarn kan kollidera i commit-fönstret. Pragmatisk
   regel tills vidare: commit direkt när eget arbete är grönt; liggande
   främmande halvfil i src/ → vänta en omgång. (Att bygga
   stegat-tillstånd-tsc i tmp-utrullning bedömdes som överarkitektur
   med nya felkällor — avstått medvetet.)
2. **Merge-committar skippar tsc-grenen** (MERGE_HEAD-förkortning,
   våg 138:s design: grenarna typgranskades; arbetsstationen kör tsc
   efter varje merge). Oförändrad.
3. **Ansvarsfördelning filnamn vs innehåll:** denna hook stoppar
   hemlighets-LIKNANDE FILNAMN på serverns commit-yta. Hårdkodade
   hemligheter INOM vanliga filer skannas av kundens Mimosa på
   arbetsstationens push — två skikt, olika ytor.

## Syskonsortiumet i samma manifest (dokumenterat för kommande ronder)

- s8-u2/uX äger **döda länkar-svepet** (otrackad `verktyg/doda-lankar.mjs`
  11:09) — denna uppgift lämnade ytan orörd.
- Syskon äger **beroendesäkerheten** (`verktyg/beroende-vakt.mjs` 11:14,
  next 16.3.2 CRITICAL RCE-advisory m.fl.) — spårets "beroendeuppdateringar
  (patch)" är deras leverans, verkställande ägs av prod-synken.
- Vaktdiagnos från denna sond: rapporten `granssnitt-2026-09-15T0600.json`
  med `status: "avbruten — deploy pågår"` + `fel: 21` är DESIGNAT beteende
  (vakten rad ~149: 5xx + deploy-tecken ⇒ avbryt utan larm; de 21 var
  transienta 5xx under deploystart). Cron-ronden 07:17 är GRÖN
  (granssnitt-2026-09-15T0524.json: 176 kombinationer, fel 0) — ROND 30:s
  "0 fynd" höll, men sambandet var oprotokollerat: framtida ronder ska
  inte jaga de 21 som spökefynd.
- 404-ytan är löst sedan våg 86 (`global-not-found.js` — verifierad
  levererad: marin panel, svensk text, kursförslag, noindex): INGET nytt
  arbete där (duplikat undveks i sonden).

## Bevis för leveransen

- Fyra gröna tester (A, B2, D1–D3 enligt tabellen) med exit-koder i
  sessionens logg + detta dokument.
- `npx tsc --noEmit` = 0 efter härdningen (hook är bash — påverkar ej
  typytan, mätt ändå).
- Commit: `studio: auto s8-u1 kvalitetsgrindens mekaniska bevis + R2-härdning`
  (hook + detta dokument + worklog-rad). Commiten passerar SIN EGEN härdade
  grind — slutbeviset.
