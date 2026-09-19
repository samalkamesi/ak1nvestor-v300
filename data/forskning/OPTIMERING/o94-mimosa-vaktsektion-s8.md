# o94 — Kvalitetsvaktens mimosa-sektion: full-scan-baslinjen mekaniserad (spår 8, s8-u3)

**Datum:** 2026-09-19 · **Agent:** s8-u3 (manifest auto-s8-1789821900404, vakt 3/3)
**Föregångare:** o15/o21/o23 (paritetens uppbyggnad), o29 (v178 full-scan 906/0 +
§5.1-varningen), o59 (senaste domänmätning 09-18), o92 (återmätning — med
metodnot, se §2 R2), o93 (u2:s backup-kur).

## §0 Objektval, trekollision och pivot

Ursprungsobjekt: PIPELINE-KO våg 205 "Mimosa full-scan återmätning + ny
referensbas". Tre vakter i manifestfönstret siktade på samma fyndklass
simulatan (klaim-mtimes: u2 12:47:10Z · u3 12:47:27Z · u1 12:47:47Z —
fönstret dokumenterar o86-klassen på spårets EGEN pipeline). Läge vid pivot
(~13:0xZ): u1 hade levererat o92-filen på disk, u2 hade levererat o93
(backup-offsite, commit 6e5c1bc1). Duplikat = förlorat arbete ⇒ **pivot till
systemrotorsakan** (o86-precedensen): Mimosa-pariteten var ett MANUELLT
instrument — kvalitetsvakten (cron 07:02) saknade mimosa-sektion helt
(grep-belagt: 0 träffar i 1 150 rader), varför baslinjeglidning lever osynlig
mellan manuella spår 8-vågor. Tre kolliderande vakter ÄR beviset för att
instrumentet saknades. Anspråk + pivot redovisas i
data/vakten/auto-s8-1789821900404-s8-u3-ansprak.md.

## §1 FÖRE-mätning (full träddomän, o29-kontraktet `--doman .`)

`node verktyg/mimosa-paritet.mjs --doman . --hoppa-over 'testa-mimosa-paritet\.mjs$'
--json data/forskning/OPTIMERING/fullscan-fore-2026-09-19.json`
→ **1 542 filer, 6 high-fynd** (exit 1). Baslinjen v178 906/0 BRUTEN —
tillväxten +636 skannbara filer (s1–s7-vågornas engångsskript, KVD:er, sonder)
innehöll sex ohärdade mönster:

| # | Fil | Klass | Art |
|---|---|---|---|
| 1 | verktyg/_s1u1b-np3-kontroll.mjs:83 | CHILD_PROC_INTERP | `git log`-mallsträng (R konstant) |
| 2 | verktyg/_s1u1b-np3-kontroll.mjs:86 | CHILD_PROC_INTERP | `git show ${vcommit…}` — DATASTYRT (git-utdata) |
| 3 | verktyg/_s2u1omg18-commit.mjs:23 | CHILD_PROC_INTERP | `git add ${PATHS.join(" ")}` — datastyrt |
| 4 | verktyg/backup-offsite.mjs:82 | CHILD_PROC_INTERP | DR-kritiska backupverktyget (o80 §sidofynd) |
| 5 | .zcode/granskning-s1u3-saas.mjs:15 | CHILD_PROC_INTERP | `git show ${v}:` (VINT-konstantarray) |
| 6 | .zcode/granskning-mx1-konsument.mjs:98 | SSRF_INTERPOLERAD_FETCH | `fetch("https://"+e+"/")` — host ur markdown-data |

## §2 Rotorsaker

**R1 — Instrumentet var manuellt (den systemiska roten).** o29 §5.1 krävde
"baslinjen SKAL återmätas efter varje våg som tillför filer utanför src/"
— men ingen mekanism utförde kravet; återmätningen skedde endast när en
spår 8-agent råkade välja det manuella verktyget. Fynd #1–#6 levde osynliga
09-17 → 09-19 trots daglig kvalitetsvakt-cron och gränssnittsvakt-cron.

**R2 — Domänförväxling i o92 (metodfynd, gårva till o92-ägaren).** o92
("Mimosa full-scan ÅTERMÄTNING", stängde våg 205 via ROND 94) kördes UTAN
`--doman .` ⇒ 725 filer = standarddomänen (src/ + data/infra/), men
jämfördes mot v178:s 906 som VAR `--doman .` — "fildeltat 906→725" är två
olika populationer, och fynd #1–#6 (alla i verktyg/ + .zcode) var osynliga
för mätningen. GRÖN-domen var sann för standarddomänen men rubriken och
jämförelseplanen säger "full-scan". ROND 94 stängde våg 205 på detta.

**R3 — Vågorna föder skalsträngar (o29 §5.2:s policy-följdfråga igen).**
Engångsskripten (s1/s2-vågorna) skrevs med execSync-mallsträngar trots att
o59-doktrinen ("execFile/spawn med array-argument är per definition utan
skal") varit etablerad sedan 09-18 — kur skedde reaktivt per fynd, aldrig
förebyggande. R1:s sektion gör fortsättningsvis varje regression DAGLIGT
synlig inom 24 h.

## §3 Kur

1. **Sektion 13 i verktyg/kvalitetsvakt.mjs** (huvudleveransen): kör
   mimosa-pariteten som subprocess med `--doman .` (o29-kontraktet — hela
   trädet; sektionens källkommentar dokumenterar o92:s 725≠906-fälla),
   ENDAST det dokumenterade fixture-undantaget
   `--hoppa-over 'testa-mimosa-paritet\.mjs$'`, rådata till gitignorerad
   data/vakten/mimosa-fullscan-SENASTE.json (cron skall inte smutsa git),
   timeout 240 s, exitkodsgrenar: 0=PASS-info med filantal, 1=varje FYND-rad
   → sektions-FEL (klass+allvarlighet+bevis, tak 40+räknare), 2=argumentfel →
   MANUELL (instrumentfel ≠ kodfel), spawn-fel/timeout → OMÄTT (vakten ger
   aldrig tyst PASS — tsc-sektionens kontrakt). Sektioner-listan 12→13 +
   rapportens kontrollista i sidfoten.
2. **Fyndkurer (o59-doktrinen, execFileSync-array):**
   - _s1u1b-np3-kontroll.mjs 83/86 → execFileSync("git", […]) med `--`-
     separator; rad 86:s datastyrda hash som rena arrayelement.
   - _s2u1omg18-commit.mjs 23 → execFileSync("git", ["add", ...PATHS]).
   - .zcode/granskning-s1u3-saas.mjs 15 → execFileSync('git', ['show', …]).
   - .zcode/granskning-mx1-konsument.mjs 98 → HOST_RE-vitlista
     (`/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test`) inom
     skannerns vittnesfönster — endast ren hostname når fetch (lokal kur,
     o59-precedensen: .zcode är gitignorerat sessionsavfall, ingen git add -f).
   - backup-offsite.mjs:82 → u2:s o93 (deras yta, deras kur — här endast
     mätt och dömt GRÖN i EFTER-scanen).
3. **tsc-svitens antalskontroll 11→13** (testa-kvalitetsvakt-tsc.mjs):
   kontrollen var eftersläpande sedan SSR-livssonden tillkom som sektion 12
   (rapporten hade 12 rader, sviten krävde 11 = permanent FAIL-läge) —
   rättad till 13 med dokumentationsdetalj.

## §4 Bevis

- **FÖRE/EFTER full-scan (`--doman .`):** 1 542 filer / 6 high-fynd (exit 1)
  → **1 546 filer / 0 fynd (exit 0, "GRÖN — inga ohärdade fynd")** —
  rådata fullscan-fore/efter-2026-09-19.json. NY TRÄDREFERENSBAS: 1 546/0.
- **Nya sviten verktyg/testa-kvalitetsvakt-mimosa.mjs: 12 PASS / 0 FAIL**
  (statiskt kontrakt ×6: koppling, --doman ., fixture-undantagets
  enskildhet, gitignorerad rådata, exitkodsgrenar, OMÄTT-grenar + full
  vaktkörning ×6: exit 0, sektion 13 finns/PASS, 13 rader, mimosa 0 fel,
  RESULTAT_JSON GRÖN-eller-GUL-tolerans endast för icke-mimosa-driftfynd).
- **Regression tsc-sviten: 11 PASS / 0 FAIL** (numret 13 + GRÖN-domen —
  SSR-livssonden PASSar igen; 07:02-rapportens 2 fel var drift-transienter
  från förmiddagens synkfönster).
- **Regression mimosa-paritetens egen svit: ALLA PASS** (verktyget orört).
- **Kvalitetsrapporten: ANTAL FEL 0 | STATUS GRÖN** med 13 sektioner, alla
  PASS — sektion 13s inforad: "1 546 filer … 0 fynd, baslinjen lever".
- `node node_modules/typescript/bin/tsc --noEmit` = **0** · node --check ×6
  (kvalitetsvakt, båda sviterna, _s1u1b, _s2u1omg18, .zcode ×2).
- **Rent-träd-fällan dokumenterad ×2:** prod-synkens `git checkout -- .`
  raderade mina UNSTAGED ändringar under deployfönstret (kvalitetsvakt.mjs
  12:57Z + _s1u1b-np3-kontroll.mjs) — o87-läxan mekaniserad hårdare igen:
  Write/Edit + OMEDELBART git add (staged innehåll överlever; index-versionen
  skrivs ut), commit med explicit pathspec. EFTER-scanen fångade den första
  rullningen (2 fynd kvar) och verifierar den andra omgången (0 fynd).

## §5 Bokningar / läxor

1. **Morgondagens 07:02-cron är första organiska live-beviset** för sektion
   13 (förväntat: PASS, ~1 546+ filer). o92:s 725-rad förblir sann för
   standarddomänen men bör ej längre användas som "full-scan"-referens —
   den mekaniska referensen är nu data/vakten/mimosa-fullscan-SENASTE.json
   + sektionens rapportrad.
2. o29 §5.2:s policy ("kör-verktyg föds i verktyg/ direkt") förblir öppen
   på processplanet; sektion 13 gör avvikelser synliga inom 24 h men
   förhindrar dem inte — ev. pre-commit-utvidgning är separat våg (ej tagen
   här: pre-commit-kroken äger tsc+R2-grinden, våg 138-kontraktet).
3. .zcode-kurerna är lokala (filerna saneras med katalogen enligt våg 149-
   hygienen; u2:s o93 noterar sanering) — så länge filerna lever mäts de
   gröna av sektionen.
4. u2:s o93 SIDOFYND (skalfri-vakt.mjs isAbsolute-buggen) lämnas åt
   ägarspåret — öppet bokfört hos dem.

## §6 Syskonnotiser

- **u1 (våg 205-objektet):** ride-along-kurer av _s1u1b + _s2u1omg18 är
  MITT arbete (bokfört här + i anspråket); u2:s commit-meddelande
  noterade dem som "parallellsanering — komplementärt". FÖRE-rådatan
  (fullscan-fore-2026-09-19.json) lämnas som gåva: 6 fynd med exakta
  fil:rad-bevis för deras protokollskontinuitet. o92-domänoten (§2 R2)
  är en metodgåva, inte kritik av mätvärdena.
- **u2 (o93):** deras kur mättes GRÖN i min EFTER-scan (backup-offsite
  UR fyndlistan) — oberoende dubbelsignum på deras leverans.
- Noll övrigt filöverlapp: mina ytor = kvalitetsvakt.mjs, båda
  kvalitetsvakt-sviterna (tsc-sviten endast antalskontrollen), 2
  engångsskript, 2 .zcode-lokaler, fullscan-fore/efter-JSON, o94,
  worklog-rad, anspråk (disk).

R2 orörd (inga priser/tier/publicering) · data/blogg/ orörd · src/ orörd =
INGET bygge (prod-synken äger) · .env*-filer orörda.
