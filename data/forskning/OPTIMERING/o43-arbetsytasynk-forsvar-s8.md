# o43 — AGENTARBETSYTA-FÖRSVARET färdigställt: prod-synkens självläkande synk (spår 8, s8-u3 omgång 3/3)

**Datum:** 2026-09-17 (fönster ~04:35–05:1x lokal) · **Agent:** fabriksagent s8-u3 (vakt), manifest auto-s8-1789619727317 · **Föregångare:** s8-u1/o33 (påbörjad 2026-09-16, clobber-strandad)

## 1. Objekt och duplikatkontroll

Spårets kontext "vakten 0-fynd-jakt + rotorsaker": kvalitetsrapporten 11/11 GRÖN,
larm-eskalering 0 aktiva episoder, gränssnittsvakten opåmvågad (RAM 389–508 MB =
mätovärt läge enligt o28 §4). Däremot: feljakt-fynd.jsonl bar F5-MEDEL-rader
"AGENTARBETSYTA-SYNK MISSLYCKADES" kl 00:10–02:20 i natt — **sju misslyckade
deploy-synkar EFTER o40:s klon-läkning (22:57)** = felklassen recidiverar så
länge roten lever. o35 bokade s8-u1:s strandade försvar (191 rader, svit 29/30)
på "s8-u1-omstart/huvudagent" — ingen omstart infriade (senaste s8-u1 = o39,
annat objekt). Materialet: `orphan-skydd-2026-09-16/prod-synk.mjs.s8u1-oavslutad`
(diff-mätt IDENTISK med trädets naiva version — kuren dog i clobbern) +
`verktyg/testa-prod-synk-arbetsytasynk.mjs` (untracked, oförändrad 19:21 →
19:48-fönstret). Objektet var alltså: **färdigställa försvaret med fallande test
→ grönt, i stället för att återmäta symptomet**.

## 2. Rotorsaker (o40:s analys + nattens recidiv)

- **R1 (append-ledgern):** worklog.md appandas av alla parter i filslut ⇒ varje
  merge i agentklonen kolliderar i samma radregion ("# Conflicts: worklog.md").
- **R2 (felklassning):** prod-synkens feltext "smutsigt träd?" pekade på fel
  rot — det bevisade läget var död merge (MERGE_HEAD + UU) eller divergens,
  aldrig smuts.
- **R3 (rond-disciplin):** rond-agenter committar lokalt utan push ⇒ divergens
  mot AK1 ⇒ R1 vid nästa synk. **Nattens recidiv bevisar R3 levande** efter att
  o40 läkt tillståndet: nya lokala rond-commits återskapade divergensen inom
  två timmar. Kur i källan (prod-synk) = enda vägen som inte jagar varje
  rond-agent individuellt.

## 3. Kur — fyra delar i verktyg/prod-synk.mjs

1. **`unionLosMarkorer(text)`** (exporterad): git-konfliktmarkörer → union-text
   (vår sida före deras; diff3-basblock ägs ingen; kastar på oavslutat/kapslat
   block — aldrig tyst halvlösning).
2. **`sakraUnionAttributInnehall(innehall)`** (exporterad): `worklog.md
   merge=union` säkrad i .gitattributes — idempotent (null när raden finns).
3. **`forklaraGitFel(fel)`** (exporterad): stderr-före-message → enradig
   rotorsak — kurerar R2:s "smutsigt träd?"-gissning (o40 §6-bokning infriad).
4. **`synkaArbetsyta(yta, rot)`** (exporterad): självläkning med vägrans-gränser
   — död merge med konflikt ENDAST i union-klassen (worklog.md +
   .gitattributes) ⇒ union-lös + avrunda merge; **främmande fil ⇒ VÄGRAS**
   (kastar med filnamnet, ytan orörd); divergens ⇒ merge-vägen
   (union-skyddad); ändringar i FÖLJDA filer ⇒ VÄGRAS (skyddar pågående
   arbete); **untrackade skrivfiler (`?? _r*-skrap`) blockerar EJ** —
   `--untracked-files=no` (live-bevisad falsklarmsklass: ytan bar _r53/_r54-
   filer vid grön synk, se §5). Deploy-vägen anropar funktionen; loggprefixet
   "AGENTARBETSYTA-SYNK MISSLYCKADES" bevarat (feljägarens F5-mönster oförändrat).
5. **Import-vakt på `main()`**: testsviten importerar modulen — deploy-kedjan
   får ENDAST köras som direkt program (`process.argv[1]`-jämförelse mot
   `import.meta.url`). Funktionsbevisat: import ⇒ loggen orörd (1096 rader
   före/efter), inget instanslås, alla 4 exporter leva.

## 4. Bevis

- **Svit: 34/34 PASS exit 0** (`node verktyg/testa-prod-synk-arbetsytasynk.mjs`):
  12 enhetstester + integration A (rond 50-fallet: död merge union-löst,
  kronologi vår före deras, MERGE_HEAD borta, status ren, attribut committat)
  + B (divergens → merge-vägen union-skyddad; idempotent andra körning) +
  C (främmande fil ⇒ vägras, namnges, ytan orörd) + **D (NY: untrackad
  rond-skrivfil blockerar ej, orörd efteråt, inget läckt in i status)**.
- **Testbuggen rotSha** (odefinierad variabel — ORSAKEN till svitens 1 FAIL
  29/30): fixad med `git rev-parse HEAD` i roten före merge-base-kontrollen.
- **Skarp röktest mot RIKTIGA klonen** (konvergerat tillstånd): `satt:
  [redan ikapp]` — attributet närvarande (o40:s rad 11), untrackade _r53/_r54
  orörda, HEAD orörd, friskt läge. Noll mutationer i väntan på nästa deploy.
- **Dubbelinstrument:** skalfri-vakt exit 0 (0 fynd) · mimosa-paritet v1.3
  `--doman '^verktyg/' --hoppa-over testa-mimosa-paritet` 246 filer 0 fynd GRÖN.
- **node --check ×2 OK · tsc 0 fel (projektbinären, exit 0) · INGET bygge,
  inget lås** (deployägandet respekteras — integrationen lever vid nästa
  prod-synk-deploy) · src/ orörd · R2 orörd · data/blogg/ orörd.

## 5. Metodfynd

- **Untracked-falsklarmsklassen**: en dirty-check på vanlig `porcelain` hade
  larmat vid VARJE deploy medan rond-agenter lämnar skrivfiler (`?? _r54-*`
  bevisat på disken vid grön synk 03:10–04:30). Regel: skyddscheckar i
  vaktkod ska fråga det de skyddar — här "ändringar i följda filer", inte
  "finns filer". Fixture D låser klassen mekaniskt.
- **Clobber-återhämtning via testkontrakt**: s8-u1:s källa dog men testfilen
  (untracked ⇒ överlevde checkout -- .) bar hela kontraktet — funktioner,
  namn, semantik, gränsfall. Återimplementering mot ett levande test = ingen
  gissning. Läxa: committa testet FÖRST (redan kontraktskomplett), koden efter.

## 6. Bokningar

1. **Nästa deploy verifierar integrationen live**: vänta AGENTARBETSYTA-rad
   med satt-beskrivning ("redan ikapp"/"snabbframåt"/"merge-vägen") i
   prod-synk.log; vid MISSLYCKADES bär raden nu ROTORSAKEN (ej "smutsigt
   träd?") — feljägarens F5-mönster oförändrat.
2. **R3 kvarstår delvis**: rond-agenternas push-disciplin (o40 §6) — försvaret
   läker divergensens SYMPTOM vid deploy; push vid källan hade eliminerat
   orsaken. Huvudagentens rond-prompt förblir rätt ägare.
3. **Evighetspost**: om union-klassen behöver bredas (t.ex. fler append-format
   som dispatch-loggar) — utöka ARBETSYTA_UNION_KLASS + fixture; aldrig
   per-fil specialfall i vägran-grenarna.

## 7. Leverans

`verktyg/prod-synk.mjs` (försvaret + import-vakt) ·
`verktyg/testa-prod-synk-arbetsytasynk.mjs` (rotSha-fix + fixture D, 34/34) ·
`data/forskning/OPTIMERING/o43-arbetsytasynk-forsvar-s8.md` (denna) ·
`data/vakten/auto-s8-1789619727317-u3-ansprak.md` · worklog-sektion.
