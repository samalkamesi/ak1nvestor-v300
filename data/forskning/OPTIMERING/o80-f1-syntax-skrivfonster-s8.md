# o80 — F1-syntaxens engångsdom: aktivt-skrivfönster-klassen (spår 8, s8-u3)

**Datum:** 2026-09-19 (fönster 2026-09-18 23:5x–00:2x lokal)
**Agent:** s8-u3 (fabrik, manifest auto-s8-1789775715600, vakt 3/3)
**Objekt:** duplikatkontroll före start — spårets 15+ levererade objekt granskade
(worklog + OPTIMERING/o58–o78): F5-återleverans (o11), timeout-åtskillnad
(o21), tsc-determinism, feljakt-ledger (o25/o69), stormtriage (o65) —
**F1-syntaxfel orsakade av AKTIVT SKRIVFÖNSTER var okurerade**: engångsmätning
dömer fil som syskon skriver just då. Anspråk filad före start
(data/vakten/auto-s8-1789775715600-s8-u3-ansprak.md).

## §1 FYNDET

Feljagarens F1-spår kör node --check på samtliga verktyg/*.mjs var 15:e
minut (numera 582 filer). Faller kontrollen bokfördes "syntaxfel" DIREKT —
ingen återmätning. Men repot är en levande fabrik: syskon skriver om
verktygsfiler kontinuerligt, och en halvskriven fil ger ett KORREKT fel
just då men ett FALSKT fynd på träd-nivån.

**Bevisad salvor (två fall, samma dygn):**

1. **25-fyndssalvan 2026-09-18T10:12:01–10:12:36Z** — samtliga
   `syntaxfel: verktyg/testa-ai-mentor-*.mjs` (25 unika filer), exakt medan
   spår 6 svitharmoniserade AI-mentor-sviten (s6-u3:s fönster pågick; deras
   commit 5f9b4536 12:53 lokal = 41 min efter salvan; omgång 20–21 skrev
   över hela svitens 46 filer). Alla 25 fanns git-spårade sedan före fönstret
   (skapelser 2026-09-16 → 09-18 06:28 lokal — klassen är OMskrivning, ej
   skapelse).
2. **_s2u2o16-append-itub-abev.mjs 19:57:36Z** — filen var s2-u2:s EGNA
   leveransskript, provat av feljägaren mitt i deras skrivfönster
   (commit 667d1fd8 samma kväll).

**Falskhetens bevis:** node --check GRÖN på samtliga 26 vid ommätning
2026-09-18T23:58:20Z; fynden ALDRIG återkomna i journalen (journaltotalen
för sviten = exakt salvans 25 rader). Men fynden stod som "öppna äkta" i
feljakt-läge (F1-kod 26 öppna — spårets näst största post) och varje rond
tvingades gravlägga dem på nytt.

## §2 ROTORSAKA

F1-syntax dömde på **engångsmätning i ett system med samtidiga skrivare**.
Filens egna spår hade redan kurat samma naturlag på två andra ställen —
F3:s omtest-fönster (rond 50: nätverksfel omtestas efter 20 s) och tsc:s
andra chans (r39-vaccinet: TS2688/2307 vid partiell node_modules sover 75 s
och mäts om) — men syntaxgrenen saknade motsvarande skydd.

## §3 KUREN (verktyg/feljagaren.mjs)

1. **Loopkärnan exporterad**: `jagaVerktygSyntax(filer, beroenden)` — ren
   funktion med injicerbara kontroll/sov/bokför/grön (kraschvaktens
   planeraAtguard-mönster). jagaKod blir async och anropar kärnan med de
   verkliga instrumenten; `main()` får huvudmodulvakt
   (`argv[1] === import.meta.url`) så testverktyg kan importera kärnan utan
   att jakten startar — pumpornas anrop (`node verktyg/feljagaren.mjs`,
   cwd=ROT) opåverkat.
2. **Återmätningsgrenen**: vid icke-timeout-fel väntar jakten 15 s och
   provar filen EN gång till. Bestående fel ⇒ bokförs "syntaxfel" med
   beviset "misslyckades även vid återmätning". Självläkt fil ⇒ GRÖN
   stdout-not "transient syntax — återhämtad vid återmätning (aktivt
   skrivfönster, inget fynd)" — **ingen journalrad**: en halvskriven fil har
   ingen kundpåverkan att bokföra (till skillnad från F3:s nere-endpoint,
   där rond 50 medvetet bokför MEDEL självläkt). Timeout-klassen (o21) går
   orörd igenom — den återmäts ej, bara klasskonverteras.

## §4 LEDGER — 26 bedömningar falskt-pos

`data/vakten/feljakt-bedomningar.jsonl` +26 rader (engångsskript
`verktyg/_s8u3-ledger-append.mjs`: matchar EXAKTA ts+spår+fynd ur journalen,
idempotent). Enligt o25-filosofin bedöms ledger av grävande våga, aldrig av
upptäckaren — feljägaren själv har inte rört bedömningarna.

**Verkan mätt med verktyg/feljakt-lage.mjs:**
ÖPPNA ÄKTA 106 → **81** · F1-kod 26 → **0** · falskt-pos 2 → 28.

## §5 BEVIS

- test `verktyg/testa-feljakt-f1-atermatning.mjs` — **5/5 PASS**
  (A återhämtad⇒inget fynd+sov×1 · B bestående⇒bokförd med
  återmätningsbevis · C ren⇒totalrad utan väntan · D timeout⇒okontrollerad
  UTAN återmätning · E blandad sväng⇒exakt 1 syntaxfel, totalrad uteblir)
- **LIVE-körning** `node verktyg/feljagaren.mjs` (00:02 lokal): F1 GRÖN
  "582 verktyg syntax-OK" med nya kärnan; samtliga 7 spår GRÖNA
  (pm2 4/4 · API 18/18 · prod 200 · RAM 1201 MB · disk 29 % · F7 ren ×2)
- `node --check` ×3 (feljagaren, testet, engångsskriptet) GRÖN
- **tsc 0** (projektbinär `node node_modules/typescript/bin/tsc --noEmit`)
- **dubbelinstrument** (o23 §3-mönstret): mimosa-paritet --doman '^verktyg/'
  — feljagaren.mjs 0 fynd (kuren skalfri ren)
- ÄKTA-fel-demo in vivo: engångsskriptets egen födelsesyntax (bakåt-citat
  i template-literal) var ett BESTÅENDE syntaxfel som återmätningen inte
  läkt — gren B gör sitt jobb; fixat + grönkört.

## §6 SIDOFYND OCH BOKNINGAR

1. **SIDOFYND (ägs ej här)**: mimosa-paritet --doman '^verktyg/' rapporterar
   `backup-offsite.mjs:82 CHILD_PROC_INTERP` (execSync med interpolerade
   JSON.stringify-citerade sökvägar + args-variabel) — DR-spårets verktyg,
   lämnat orört; till ägande spårs nästa våg (bedöm args-citeringen).
   Övriga 4 fynd = testa-mimosa-paritet.s egna dokumenterade fixturer
   (o40 §5-undantaget).
2. **METODFYND**: min sed-rätting av ledger-filnamnet o79→o80 skedde EFTER
   26 rader skrivits — håll protokollnumrets ls-koll FÖRE första skrivningen
   till delade ytor (s7-u4-precedensen återspeglad).
3. **EVOLUTIONSPOT**: feljakt-lage kollisioner 3 (bevisHash-fälten, o69)
   oförändrade; F3-api 56 öppna varav många "ej mätbar (deploybygg pågår)"
   — värdiga transient-design-klassning av en framtida grävning.

## §7 KOLLISIONER

- Protokollnummer: o79 togs under fönstret av syskon (o79-goodhead-fallback,
   = o72:s köpost) ⇒ detta blev o80; ledger-rader + kodkommentarer +
   anspråksfil omdöpta MEKANISKT före commit (grep-kvitto 26/26 o80, 0 o79).
- Syskon-ytor orörda: u1/u2:s pågående fönster (o79-goodhead) — inga filer
  gemensamma; endast egna filer stegades.
- Deploylåset verifieras fritt FÖRE commit (s8-u1:s rättesläxa).

R2 orörd — inga priser/tier/publicering. data/blogg/ orörd. src/ orörd.
INGET bygge (prod-synken äger installation/byggen).
