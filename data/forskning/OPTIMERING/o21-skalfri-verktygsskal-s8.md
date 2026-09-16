# o21 — Skalfritt verktygsskal: o15 §Bokning 2 inlöst (execFile-arrayform i väktardomänen)

Spår 8 (kvalitet & säkerhet), s8-u1 omgång 4 — 2026-09-16.
Roll: vakt. Objekt valt enligt spårets kontextord "Mimosa-fyndens
rotorsaker": o15 bokade uttryckligen "verktygskatalogens CHILD_PROC_INTERP-
mönster … bokas som framtida härdning (execFile-arrayform) om spåret väljer
det" — spåret valde den denna omgång.

## Duplikatkontroll

Worklog + git-log genomsökta före start: spårets nio tidigare leveranser
(omg 1: grind/beroenden/döda länkar; omg 2: tsc-determinism/F5-rotorsaka/
0-fynd-jakt; omg 3: F7-nyckelbevakning/Mimosa-paritet/externa länkar)
rörde aldrig arrayform-härdningen. PÅGÅENDE syskonfönster respekteras:
mimosa-paritet.mjs + testa-mimosa-paritet.mjs + data/rapporter/* +
crontab.reference var modifierade på disk av syskon under hela fönstret —
orörda av denna våg (verifierat i vag102-abortlistan).

## Instrument: verktyg/skalfri-vakt.mjs (NY)

Mimosa-paritetens domän är medvetet src/ + data/infra/ (o15: "väktarnas
egen domän" lämnades utanför) — därför ny vakt som mäter SAMMA fyndklass
(CHILD_PROC_INTERP: exec*/spawn* med interpolerat första argument) i
verktyg/ + .zcode/ + .zscripts/. Ärliga begränsningar protokollförda i
filhuvudet: radvis heuristik (ingen full parser), fast-kommando-rapporteras-
ej-som-fynd (samma klassindelning som o15). Undantagsmekanism med skäl
per fil (o15 §Del 3-lärdomen: vittnen/undantag måste vara klasspecifika).

## FÖRE-mätning (rådata: skalfri-fore-2026-09-16.json)

149 filer, **8 fynd** — o15:s fem namngivna + mätinstrumentets bredare
öga fann tre till:

| Fil:rad | Innehåll | Klass |
|---|---|---|
| .zcode/v2-git.mjs:16 | `execSync(`git ${args}`)` — HELA argv som skalsträng | äkta (o15) |
| .zcode/vag102-prod-stada.mjs:33 | `git checkout -- ${JSON.stringify(f)}` | äkta (o15) |
| verktyg/agentfabrik.mjs:277 | `git log ${fore}..${nu}` | äkta (o15) |
| verktyg/feljagaren.mjs:107 | `node --check ${JSON.stringify(f)}` | äkta (o15) |
| verktyg/testa-studio-tabbar.mjs:259 | `tasklist /FI "PID eq ${pid}"` | äkta (o15) |
| verktyg/testa-permissions-policy.mjs:203 | `npx --yes tsx "${TMP_TS}"` + **shell:true** | äkta, NY (o15 missade) |
| verktyg/testa-mimosa-paritet.mjs:27+100 | farliga mönster som STRÄNGDATA | testggrund-FP → undantag |

## Härdningar (alla: execFile/spawnSync med array-argument = per
definition utan skal, o15 rad 84)

1. **v2-git.mjs** — citationstecksmedveten tokenisering i JS (enkla/dubbla
   citat, ~25 rader) + `execFileSync('git', tokens)`: metatecken i argument
   kan ALDRIG exekveras; värsta fall ger git ett synligt felmeddelande.
   Loggringen och anropar-API:t (`"<git-args>"` som ett argument) bevarat.
2. **vag102-prod-stada.mjs** — `execFileSync("git", ["checkout", "--", f])`:
   filsökvägen från git status når git som ETT argument.
3. **agentfabrik.mjs:277** — `execFileSync("git", ["log", `${fore}..${nu}`,
   "--format=%s"])`; Buffer→toString-följden bevarad (execFileSync utan
   encoding returnerar Buffer, koden har redan .toString()).
4. **feljagaren.mjs F1** — två anrop: find som ren array + filtrering i JS;
   `execFileSync(process.execPath, ["--check", f])` (process.execPath =
   körande nods egen binär, immun mot PATH-shadowing).
5. **testa-studio-tabbar.mjs:259** — `execFileSync("tasklist", ["/FI",
   `PID eq ${pid}`, "/FO", "CSV", "/NH"])` (win32-gren; kan ej live-testas
   på Linux-servern — node --check + kodgranskning).
6. **testa-permissions-policy.mjs:203** — `spawnSync("npx", ["--yes",
   "tsx", TMP_TS])` med shell:true BORTTAGET.

## Sidofynd i feljägaren (båda kurade samma våg)

- **head-40-takets blinda fläck**: F1:s find-pipe körde `head -40` medan
  verktyg/ har 117 filer — 77 filer OKONTROLLERADE i varje jakt medan den
  gröna raden lurade "40 syntax-OK". Kur: taket borta (find-arrayform över
  samtliga; 118 kontroller < 15 s).
- **Verktygskontrollens tysta död**: blocket låg EFTER `if (!srcAndrad)
  return` — det krävde att src/ samtidigt ändrats för att köras alls.
  Kur: blocket flyttat FÖRE hoppar-grenen, körs i varje jakt.
- **Timeout felmärkt som syntaxfel**: första alltid-på-körningen bokförde
  "syntaxfel: kor-oversatt-batch.mjs" — filen ren vid dubbel omkolla,
  fyndet aldrig reproducerat = lasttimeout i 10 s-taket, inte syntax.
  Kur: diagnosåtskillnad i catch (e.killed/SIGTERM/ETIMEDOUT ⇒ "okontrollerad
  (timeout)" med lastrelaterad bevisning; övriga ⇒ syntaxfel). Transitoriella
  fynd är MÖJLIGA när parallella agenter skriver verktyg samtidigt — typ
  verifiering är omkollan, exakt som gjordes här.

## Bevis

- node --check × 7 (alla berörda filer): OK.
- **Funktionstest, levande**: v2-git `log --oneline -1` genom tokenisering+
  arrayform (rätt commit i target-ytan); git-log-arrayformen i exakt
  agentfabrikform (2 ämnen); vag102 ABORT exit=1 vid oväntade ändringar
  (skyddet lever, skalfria status-läsningar); permissions-policy 63/63
  PASS med shell:true borta; feljägaren "118 verktyg syntax-OK" + "src/
  oändrad — hoppar" I SAMMA jakt = alltid-på-läget bevisat.
- **EFTER-mätning (rådata: skalfri-efter-2026-09-16.json)**: 149 filer,
  **0 fynd GRÖN** — 51 arrayform + 31 fasta kommandon + 2 undantag.
- **tsc**: src/ orörd av vågen (endast verktyg/ + .zcode/ + data/); den
  mekaniska bevisningen sker av våg 138-grinden vid commitn (direktkörning
  i studio-skalet hängde — klassat skal-svarsförlust, grunden kör samma
  binär `node node_modules/typescript/bin/tsc --noEmit`).
- dev.sh: granskad-lämna — bash-programmets $(...)-idiom är korrekt inre
  citerade (dirname/date/basename), inga externa värden interpoleras.

## Bokningar

1. Fasta skalsträngar (31 rader i väktardomänen): ofarliga idag (ingen
   interpolation) men skal-burna — framtida våg kan arrayforma för
   konsekvens; protokollfört här som känt läge, ingen akutitet.
2. next 16.3.2 CRITICAL (GHSA-2xp9-vwfh-vxw4 + GHSA-p293-qw3h-jr36) lever
   fortfarande INSTALLERAD i node_modules denna dag (2:a dygnet) —
   installationen ägs av prod-synken (`npm update next eslint-config-next`
   under deploylåset enligt BEROENDE-HALSA-2026-09.md); eskaleras som
   påminnelse, ägs av beroendeobjektet (syskon/spårets u2-linje).
3. skalfri-vakt.mjs kan cronifieras av huvudagenten (crontab berörs ej
   autonomt) — verktyget är exit 1 vid fynd, klart för pumpintegring.

R2 orörd: inga priser/tier/publicering; inga .env/nyckelfiler; src/ orörd;
data/blogg/ orörd.
