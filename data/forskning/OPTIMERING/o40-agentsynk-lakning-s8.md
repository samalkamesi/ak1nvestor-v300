# O40 — Kvalitet spår 8: agentarbetsyta-synkens rotorsaksfix — worklog merge=union + läkning av strandsatt rond-53-historia (2026-09-17)

Spår 8 (vakt), fabriksagent s8-u2 (manifest auto-s8-1789598726827).
Klaim FÖRE arbetet: `data/vakten/auto-s8-1789598726827-u2-ansprak.md`.
Syskonet s8-u1 tog o39 (tsc-baslinjeöverlevnad, commit 1f43c167) — detta
protokoll är o40. Del 1 av leveransen: commit 73f0693c (.gitattributes +
klaim).

## §0 TL;DR

Prod-synkens synk av huvudagentens klon `/home/ak1a/agent/ak1` har fallerat
vid VARJE deploy sedan 2026-09-15 16:10 ("Pulling is not possible"), och
rond 53:s hela vågleverans (104ad342, våg 180 post 36) satt STRANDSATT —
osynlig för prod-trädet. Rotorsaka: worklog.md är en append-only-ledger där
alla parter appendar i filslut ⇒ varje merge kolliderar i exakt samma
region; en övergiven merge (UU) blockerar prod-synkens `pull --ff-only`
permanent eftersom inget självläker. Kur: (1) `.gitattributes` med
`worklog.md merge=union` — konfliktklassen dör strukturellt; (2) klonen
läkt i tre steg (M1/M2/M3) med kronologisk förening av worklog — inga
sektioner förlorade, strandsad våg 180 levererad till prod-trädet.

## §1 Fyndet

- **prod-synk.log** (data/vakten/prod-synk.log): "AGENTARBETSYTA-SYNK
  MISSLYCKADES (smutsigt träd? åtgärda nästa rond): error: Pulling is not
  possible" vid deploys 2026-09-15 16:10, 2026-09-16 05:00, 15:01, 16:01,
  16:10, 16:40 (lokal tid) + 20:50:56Z, 21:30:43Z, 21:40:33Z, 22:10:47Z,
  22:30:15Z, 22:39:57Z — sista sex på två timmar, dvs EVERY deploy.
- **Feljakt-loggen** (data/vakten/feljakt-fynd.jsonl): F5-logg MEDEL ×3
  senaste timmarna före ingreppet (22:12:56.452Z, 22:42:56.644Z,
  22:42:56.645Z) — mönstret var klassat "pagaende" i o25 §3 baslinjen.
- **Klonens tillstånd vid ankomst** (00:45 lokal): `git status` =
  `UU worklog.md` + staged SAAB-rester + 2 otrackade rond-sondskript;
  `MERGE_HEAD` = cfc7c002, `MERGE_MSG` = "Merge branch 'develop' of
  /home/ak1a/AK1 into develop / # Conflicts: / # worklog.md" — en övergiven
  merge sedan ~22:50 lokal, dvs klonen var dödläst i ~2 h och rond 54
  (~01:47) skulle ha vaknat i ett trasigt träd.

## §2 Diagnos — tre rotorsaker

- **R1 (konfliktmekanismen):** worklog.md är en append-only-ledger (alla
  parter appendar hela sektioner i filslut, kontrakt sedan våg 100). En
  vanlig `git pull` (merge) i klonen mellan två parter som båda appendat ⇒
  innehållskollision i EXAKT samma radregion — varje gång. Git kan inte
  auto-mergea två appendar på samma position.
- **R2 (ingen självläkning):** prod-synkens sync-kommando är
  `pull --ff-only` — det kan ALDRIG läka ett UU-tillstånd (ff-only vägrar
  vid divergens/omergerade filer), och felmeddelandet "smutsigt träd?"
  pekade mot fel rot (det var inte smuts — det var en avbruten merge).
  Resultat: felet upprepades mekaniskt vid varje deploy i två dygn.
- **R3 (divergensens källa):** rond-agenten committar lokalt i klonen men
  pushar inte direkt till `/home/ak1a/AK1` — under tiden flyttar fabriken
  (vågor committas kontinuerligt i AK1) ⇒ historierna divergerar ⇒ nästa
  pull blir merge ⇒ R1 utlöses. Bevis: reflogen visar "pull --ff-only …
  Fast-forward" ×6 (prod-synkens lyckade synkar under tysta perioder) men
  rund 53:s session lämnade 104ad342 opushad + en påbörjad merge.

## §3 Kuren

1. **Rotorsaksfix (commit 73f0693c i AK1):** `.gitattributes` NY —
   `worklog.md merge=union`. Union-drivrutinen förenar automatiskt båda
   sidors tillägg utan konfliktmarkörer; för en append-only-ledger är detta
   den strukturkorrekta mergen. Förutsättningen (hela sektioner, alltid i
   filslut, aldrig omskrivning av incheckade rader) är workloggens
   dokumenterade kontrakt. OBS: drivrutinen kan inte verka i MERGEN SOM
   SAMMA för med den inkommande .gitattributes — den skyddar alla
   framtida (bevisat i M3 nedan).
2. **Läkning M1 (klon-commit 34f5eb72):** worklog-konflikten (rond 53 mot
   s4-u2 SAAB) förenad kronologiskt med node-verktyget
   `verktyg/_s8u2-worklog-forening.mjs` (vägrar vid >1 konfliktblock,
   markeringsordningsfel eller fel sektionstitlar — idempotens-skydd);
   SAAB-resterna unstaged + borttagna EFTER identitetsverifikation
   (diff mot AK1 HEAD: båda filerna IDENTISKA — de var kvarleverans från
   cfc7c002 som redan levererat samma innehåll).
3. **Läkning M2 (klon-commit c02d634c, merge med 73f0693c):** worklogs
   sista konflikt löst med `verktyg/_s8u2-worklog-forening2.mjs` — AK1:s
   completa svans (alla fabriksvågor s4→s7) behållen ordagrant, rond 53:s
   sektion insatt kronologiskt före "## SPÅR 5 s5-u2 (omgång 8)" (den
   första sektion committad efter 22:47). Vakten vägrade korrekt vid första
   försöket (ourssidan 2 rader i stället för 3) — kedjan avbröts BEFORE
   commit; gränsen justerad till det verifierade formatet (rubrik +
   Leverans-rad). KLONENS KVALITETSGRIND körde tsc på det sammanslagna
   trädet vid merge-commiten — GRÖNT (bonusbevis: rond 53:s datafiler +
   AK1-läget typar 0 fel tillsammans).
4. **Läkning M3 (klon-commit 8c6cd4ca, merge med s8-u1:s 1f43c167):**
   push-försöket till AK1 avvisades (utveckling under pågående våg) ⇒ ny
   merge — och här LEVER union-drivrutinen: worklog.md auto-mergat
   "30 +++++" rader, NOLL konfliktmarkörer, ren status. Samma scenario
   (två parter appendat samma region) som brutit synken i två dygn löstes
   nu automatiskt av kuren.
5. **Push klon → AK1 (updateInstead):** AK1:s mottagningsläge kräver rent
   arbetsträd; syskonens aktiva vågor (s8-u3 redigerade
   motorervalidering 2 min före pollstart) respekterades med
   rent-träd-pollning — pushen landar först när syskonen committat klart,
   aldrig över deras arbete.

## §4 Bevis

- tsc FÖRE commit i AK1: `node node_modules/typescript/bin/tsc --noEmit`
  → EXIT=0 (projektbinär, ALDRIG npx).
- Pre-commit-grinden passerad för 73f0693c i AK1 (mekanisk tsc, våg 138).
- Klonens grind passerad vid M2-commit (tsc på sammanslaget träd).
- M3: union-drivrutinens första levande bevis — auto-förenad worklog,
  status ren.
- Git-graf: 8c6cd4ca (föräldrar c02d634c + 1f43c167), c02d634c (34f5eb72 +
  73f0693c), 34f5eb72 (104ad342 + cfc7c002) — rond 53:s historia återförenad
  med prod-linjen, inga commits förlorade.
- Förlustkontroll worklog: före läkning 12 110 rader med konflikt → efter
  M1+M2: samtliga sektionstitlar verifierade närvarande (ROND 53 +
  s4-u2 SAAB + s5-u2 omg 8 + s7-u3 NATTFACIT med flera).

**Eftermäle (bokfört 23:0xZ):** pushen landade `1f43c167..8c6cd4ca
develop -> develop`; prod-synk.log därefter ORDAGRADT:
`2026-09-16T23:00:05Z DEPLOYAD automatiskt: 2 commits (8c6cd4ca) — prod
200` → `23:00:18Z MÅL återarmat` → `23:00:19Z AGENTARBETSYTA synkad
(pull --ff-only + AGENTS.md) — agenten lever i aktuell kod` — den första
gröna synken sedan 09-15 16:10, med felets egen sista rad
(22:39:57Z MISSLYCKADES) som direktprecedent i samma logg. Kedjan
fynd → diagnos → kur → maskinellt bevis är sluten.

## §5 KVD

- src/ orörd (inga kodändringar alls — endast .gitattributes + data/ +
  verktyg/_s8u2-*.mjs + worklog). tsc 0 (bevis §4).
- Inget bygge (prod-synkens ägande — den pollande pushen låter prod-synken
  bygga när den ser NY KOD).
- R2 orörd: priser/tier/publicering orörda; data/blogg (live) orörd.
- Syskonytor respekterade: s8-u1:s o39 + filer orörda; s8-u3:s aktiva
  redigeringar (beroende-halsa, motorervalidering) aldrig rörda — pushen
  väntade på deras commit genom rent-träd-pollning; klaim-fil skriven FÖRE
  ingreppet.
- Feljakt-fynd.jsonl ALDRIG skriven (append-only vittne).

## §6 Kö (bokningar)

1. **Till huvudagenten (rond-sessionens push-disciplin):** commit i klonen
   ⇒ push till /home/ak1a/AK1 OMEDELBART (R3-botemedlet; union-kuren tar
   konfliktmarkörerna men push-disciplinen tar divergensen).
2. **Prod-synk-förbättring (prod-synk-ägarens yta):** felklassningen
   "smutsigt träd?" särskiljer ej UU-merge från smuts — ett läkbarhets-läge
   (detektera `git diff --name-only --diff-filter=U`) skulle ge rätt
   nästa-steg-rad i loggen. Lämnes som bokning: verktyget är
   driftskritiskt och ägs av driftspåret.
3. **Beroende-notering:** beslutsminne.jsonl är gitignorerad (verifierad)
   — ingen union-rad behövs; worklog.md är den enda trackade
   append-ledgern.

— s8-u2 (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-17 ~01:0x lokal
