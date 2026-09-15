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

## Tillägg (s8 omgång 2, 2026-09-15 18:20): typkontrollens DETERMINISM — npx-fallgropen kurad i fyra väktare

FYND: s8-u1 bevisade grinden blockerande — men själva typKONTROLLEN var
icke-deterministisk. Fem väktare körde `npx tsc --noEmit`, och npx-cachen
(`~/.npm/_npx/1d6e82a4126006c4`) bär dummy-paketet **tsc@2.0.4** (community-
paketet "tsc", INTE TypeScript; projektets version är 5.9.3). När prod-synkens
`npm ci` river `node_modules/.bin` (vid varje deploy — .bin/tsc:s mtime
18:08 idag) kan npx resolva "tsc" till cache-träffen; npx kör cache-träffar
utan prompt i non-tty. Utfall i deployfönster: TS-2.0.4 (från 2016) mot
Next.js 16-kodbasen = tusentals vilseledande fel, eller npx-abrott med
kryptiskt fel. Live-observationer: s7 våg 6 (18:05) "npx tsc träffar fel
binär på servern"; agentfabriken härdade sin EGEN kedja 04:57 (kommentar
rad ~215) men lämnade övriga väktare.

KUR (samma commit — alla kör projektets egna binär
`node node_modules/typescript/bin/tsc --noEmit`):
1. `verktyg/hooks/pre-commit` — AKTIV via core.hooksPath. Saknad binär ⇒
   node:s "Cannot find module" + blockering: tydligt fail-safe (regeln
   "vänta 3 min vid upptaget deploylås" gäller redan).
2. `verktyg/kvalitetsgrind.mjs` (sekundär node-hook) — samma binär +
   explicit existsSync-avslag med "deploy pågår?"-diagnos.
3. `verktyg/agent-status.mjs` — DJUP-mätningen + ROTORSAKSBUGG nr 2:
   `TSC_BASLINJE = 34` (pre-våg-133-värdet, commit 436ad6f7) medan
   sanningen sedan våg 133 är 0 — formeln `nya: max(0, n − 34)` kunde
   maskera upp till 34 VERKLIGA fel som "nya: 0" i hälsorapporten.
   Rättad till 0.
4. `verktyg/agentfabrik.mjs` — KVD-kärnan var redan härdad (04:57);
   promptreglerna till barnen (leveranskriterier + ALDRIG-raden) pekar
   nu också på den deterministiska binären.

BEVIS:
- `node node_modules/typescript/bin/tsc --noEmit` = exit 0 (nya kanalen).
- `node --check` × 3 (.mjs) + `bash -n` (hook) = OK — fabrikens nästa
  rop laddar de härdade filerna fritt.
- Commiten passerar SIN EGEN härdade grind (samma slutbevis som s8-u1).
- Cachens dummy på disk: `_npx/1d6e82a4126006c4/node_modules/tsc`
  package.json → name "tsc", version 2.0.4.

FYND I SPE (bokförs, ej denna vågs objekt): next fortfarande 16.3.2
installerat i prod-trädet (mätt 18:17) — CRITICAL (GHSA-2xp9-vwfh-vxw4,
GHSA-p293-qw3h-jr36) lever ~9 h efter s8-u2:s upptäckt. Installation ägs
av prod-synken under deploylåset (fabriksbarn förbjudet) — larmnotis i
`data/rapporter/beroende-halsa-SENASTE.md`.
