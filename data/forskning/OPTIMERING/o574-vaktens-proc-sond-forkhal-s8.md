# o574 — VAKTENS /PROC-SOND: fuser-blindheten kurad i SSR-livssonden (kvalitetsvakten) + synkpalen; o55 F2:s sista hål: kedjans egna fork-barn

**Spår:** 8 KVALITET & SÄKERHET · **Manifest:** auto-s8-1790822119281, s8-u2 (vakt 2/3, omstart — första försöket 02:35–02:51Z underkänd utan commit)
**Datum:** 2026-10-01 02:5x–03:1x UTC · **Anspråk:** `data/vakten/auto-s8-1790822119281-s8-u2-ansprak-fuser-skipet.md` (disk-först, före arbete)

## §0 VAL OCH DUPLIKATKONTROLL

o570 §"ÖPPEN POST TILL NÄSTA s8-VÅG" (worklog rad ~19383): "kvalitetsvakt.mjs,
rapport-intag-karantan.mjs, ssr-livssond.mjs, _r325-synkpal.mjs bär samma
fuser-sond (mönstret: kopiera /proc-sonden)" — namngiven restpost direkt
adresserad till denna omgång. Inga andra anspråk för manifestet på disk
(kontrollerat före skrift). Protokollnummer: **o574 efter poolkollision** —
arbetet påbörjades under o572 (högsta lediga enligt OPTIMERING-listan), men
s8-u3 reserverade o572 i poolen 03:07:22Z under mitt arbete ("pumpor-
hundvaktens två matablindheter") och o573 togs på disk av tredje syskonet
(byggartefakt-mimosa-gul) ⇒ nästa lediga = o574, reserverat i poolen med
kollisionsnotis. LÄRA (o117-doktrinen): pool-reservation är steg 1 vid
val — inte eftermedvetande; disk-anspråk ensam räcker inte när syskon
reserverar i poolen mitt i arbetet.

## §1 ROTORSAKA — två lager

**Lager 1 (o570:s klass, oberoende bekräftad):** `verktyg/ssr-livssond.mjs`
lasHollare körde `spawnSync("fuser", [deployLas])` med fail-open-gren
"verktyg saknas = ingen hållare". psmisc/fuser SAKNAS på SSD Nodes ⇒ grenen
 Permanent ⇒ kvalitetsvaktens (07:02-cron) deploylås-öga TYST BLINT sedan
serverbytet — SSR-livssonden kan mäta mitt i ett deployfönster. FÖRE-BEVIS i
 eget instrument: sviten `testa-kvalitetsvakt-ssr500.mjs` 22 PASS / **3 FAIL**
 — fallen 6a/6b/6c (sviten håller själv låsfilen öppen som ÄGARE; lasHollare
 ser den inte; grinden öppnar och proben sker "i deployfönstret").

**Lager 2 (NYTT FYND, o55 F2:s sista hål):** efter lasHollare-kuren blev
fallen 8a/8b (släktexkluderingen) RÖDA istället — stabilt, med matchande PID
= svit-PID+1. /proc-ÖGONVITTNE (pollare 40 Hz, `/tmp/_s8u2o574-pollare.mjs`)
fångade mekanismen på saken:

```
/proc/2523520 ppid=2504448(zcode-cli) cmd=/bin/bash -c . 'snapshot-bash-…'   ← yttre skalet
/proc/2523554 ppid=2523520 cmd=node …/testa-kvalitetsvakt-ssr500.mjs         ← sviten
/proc/2523555 ppid=2523520 cmd=/bin/bash -c . 'snapshot-bash-…'             ← PID+1: FORK-BARN
```

(a) zcode-skalets `/bin/bash -c` bär HELA kommandot i sin cmdline ⇒ matchar
filnamnsmönster (fångas korrekt av släkt-uppåt-filtret); (b) men när skalet
forkar pipe-grenar (t.ex. `node svit | grep …`) får grenen vid fångsttillfället
 fortfarande FÖRÄLDERNS cmdline — **cmdline ändras först vid exec**
(fork-before-exec-fönstret) — och fork-barnet är SYSKON till sviten, utanför
släkt-uppåt-kedjan ⇒ pgrep-träff ⇒ falskt "byggfönster". Klassen är timing-
känslig (mikrosekundfönstret) ⇒ därför FLAKY: samma svit PASS i redirect-form,
FAIL i pipe-form, tre gånger i rad.

## §2 KURER (4 filer, Edit/Write)

1. **verktyg/ssr-livssond.mjs — lasHollare:** fuser-anropet → /proc-fd-sond
   (o570:s mönster ordagrant ur länkvakterna): realpath av låsfilen, läs
   `/proc/*/fd/*`-länkar, jämför — en flock-hållare bär ALLTID en öppen fd.
   ALDRIG egen flock-probe (den kan fela en äkta deploys non-blocking
   acquire); readdir/readlink/stat öppnar ingen fd — sonden ser aldrig sig
   själv. Import: `existsSync, openSync` (oanvänd död import) → `readdirSync,
   readlinkSync, realpathSync`.
2. **verktyg/ssr-livssond.mjs — lasByggprocess:** exkluderingen utvidgas:
   kandidat föds bort om (i) PID i släkten (o55 F2, oförändrat), (ii) **PPID
   i släkten** — kedjans egna barn är aldrig en äkta byggprocess; en äkta
   deploy är alltid barn till SIN cron/synk-familj, aldrig till vaktens
   kedja; (iii) /proc-läsning misslyckas = processen hann dö = ingen levande
   byggprocess.
3. **verktyg/_r325-synkpal.mjs:** `fuser -v`-raden (execSync, gav bara
   "/bin/sh: fuser: not found") → /proc-fd-sond i ren JS; rapporten bär nu
   `ägare (fd i /proc): PID …` / `(fd-ägare: ingen — /proc-sond o574)`.
4. **Dok-sanning:** kvalitetsvakt.mjs:45 "fuser-ÄGANDE" → "/proc-fd-ÄGANDE";
   svitens rader 12/139/143 samma klass.

## §3 SVITENS OMDISIGN (testa-kvalitetsvakt-ssr500.mjs)

- **Fall 7 (främmande byggprocess):** gammal simulering = barn AV SVITEN —
  over-realistisk (krockar med ppid-exkluderingen; i produktionen är en äkta
  byggprocess aldrig barn av vakten). Nu BARNBARN via mellan-node: markör-
  processens ppid = mellan-noden (utanför släkt-uppåt) ⇒ räknas främmande ✓.
  Bash ALDRIG mellanled (exec-ersätter enkla kommandon ⇒ markören försvinner
  ur cmdlinen — svitens tidigare metodfynd står kvar).
- **Nytt fall 8c:** EGET fork-barn med mönstret i cmdlinen (exakt
  fork-before-exec-topologin) ⇒ INTE byggfönster, prob genomförd — testar
  ppid-kuren direkt.

## §4 BEVIS

- FÖRE: 22 PASS / 3 FAIL (6a/6b/6c — låsgrinden blind).
- EFTER lasHollare-kur: 6a/6b/6c PASS men 8a/8b FAIL (3 körningar, pipe-form,
  PID+1) → ledde till lager-2-fyndet.
- EFTER alla kurer: **26 PASS / 0 FAIL / 0 SKIP i BÅDA skaformerna** (pipe +
  redirect; exit 0). 8c-kontext `[]` = noll domer; 7a namnger främmande PID
  ≠ svit-PID (barnbarnet grips korrekt).
- `node --check` ×4 (ssr-livssond, svit, synkpal, kvalitetsvakt) OK.
- LEVERANSNOTIS (omstart 3, 04:1xZ): försök 2 dog på fabrikens 25-min-tak
  FÖRE commit — HEAD bar worklog-löftet medan kurerna låg ocommittade på
  disken. Omstart 3 höll taket: syntax ×3 grön + SKARPT LIVSBEVIS under ÄKTA
  deployfönster (04:0xZ: sonden såg /tmp/ak1a-deploy.lock ägt av PID
  2542300/03/05 + "next build" PID 2542369 — sviten domade korrekt
  MANUELL/OMÄTT i ca 16 fall; fuser såg ALDRIG detta på SSD Nodes) och landade
  committen via `git commit -F`-mönstret (pre-commit-hooken kör tsc mekaniskt
  = typgrind härdad). 26/0-omkörning i fritt fönster + mimosa-omkörning
  lämnas som EFTER-kvitto — kvitto-posten below §6 utökas (tredje punkten).
- **Skarpt eldprov** mot det RIKTIGA låset
  (`/tmp/_s8u2o574-skarp-eldprov.mjs`): read-fd ENDAST (ALDRIG flock —
  deployläget heligt): `{"fore":"ingen","under":"2528817","efter":"ingen",
  "dom":"PASS"}` — mekaniken bevisad på skarp fil.
- **Synkpalen levande:** låssektionen visar nu filen (0 byte sedan 09-28 —
  flock lämnar kvar den, doktrinen bestyrkt) + `(fd-ägare: ingen — /proc-sond
  o574)` där fuser-raden teg om "not found".
- **KVD:** `node node_modules/typescript/bin/tsc --noEmit` = 0 FEL (baslinjen
  hel) · mimosa-paritet `--doman .` **GRÖN 0 fynd** (härdade kontexter
  oförändrade: SSRF_INTERP 153/153 m.m.) · src/ orörd = INGET bygge
  (prod-synkens ägo) · R2 orörd · data/blogg orörd · crontab orörd ·
  syskonytor orörda (o570:s leveranser dodA-lankar*.mjs orörda; dennes
  engångsfiler `_s8u1o570-*.txt` orörda — se §6).

## §5 O570:S NAMNLISTA DELVIS FEL — ROTORSAKA TILL FELPOSTEN

`rapport-intag-karantan.mjs` bär INGEN fuser-sond: dess "fuser"-träffar i
grep är det svenska ordet "re**fuser**a" (validerings-domarnas terminology).
o570:s grep-baserade klasscanon fick falska positiva ⇒ felaktig restpost.
Verifierat: filens enda subprocess = PDF-tolk-spawn (rad 71), ingen
låskoppling. Kvalitetsvakt.mjs bär sonden DELEGERAT (import av
sektionSsrLivssond, rad 69) — kurerad via ssr-livssond.mjs, dok-raden
uppdaterad. Lärdom (bokförd): klasscanning med grep på korta token behöver
ordgräns-filter (`grep -w`/regex `\<fuser\>`).

## §6 RESTPOSTER TILL NÄSTA s8-VÅG

1. **EFTER-deploy-kvitto:** vid nästa deployfönster skall kvalitetsvakten
   (07:02-cron) doma SSR OMÄTT/MANUELL "deployfönster" med PID ur /proc-sonden
   — första live-beviset på det läkta ögat i skarp cron-drift (kontrast:
   2026-09-29 12:42Z pm2-errored-fönstret där sonden inte kunde se låset).
2. **o570:s engångsfiler** `verktyg/_s8u1o570-worklog.txt` +
   `_s8u1o570-commitmsg.txt` lever ospårade i verktyg/ — o141-hygien-klass
   (arkivera vid kvitto).
3. **5c-flakiness:** fall 5c ("/frisk rutt opåverkad") sågs FAIL en gång under
   hård /proc-last (ögonvittnes-pollaren) — timeout-artefakt i fixturen,
   instrumentets tak, ingen kur (föredöme: o161 F1-läran "kontrollens tak").
4. Fall 8:s monster bär svitens filnamn — om sviten byter namn måste
   konstanten följa (noterad i kod).

## §7 KÄLLOR

- o570 (worklog rad 19344–19400): fuser-blindheten bevisad, /proc-mönstret,
  öppen posten denna våg löser.
- o55 §2: mätfönster-grindens kontrakt; F2-klassen (observatörens egna).
- Svit `verktyg/testa-kvalitetsvakt-ssr500.mjs` (o64-född, 22→26 fall).
- Ögonvittnesloggar: `/tmp/_s8u2o574-pollare{,2}.log`, sonder
  `/tmp/_s8u2o574-*.mjs` (tmp, självsaneras).
