# O47 — Döda länkar ÅTERMÄTNING 2026-09-17 + deployfönster-artefaktens metodkur (Spår 8, s8-u2)

Manifest auto-s8-1789642527960, uppgift s8-u2. Mätare: `verktyg/doda-lankar.mjs`
(o9:s, orörd) · bas `http://localhost:3000` (loopback, whitelistad) ·
bevisfil `data/vakten/doda-lankar-2026-09-17.json`.

## §0 Objektval och cession

Första valet var o44 köpost 1 (tmp-ROTSKRIVARNA) — kartlagd i
`verktyg/_s8u2-tmp-rotmigrering.mjs` (14 verktyg, torrkörd 11/14). Vid
törrkörningen upptäcktes s8-u3:s parallella anspråk (16 verktyg, STÖRRE
täckning: inkluderar testa-akm2-karna + testa-permissions-policy) och deras
pågående disk-ändring (testa-sok.mjs redan migrerad). Disk-först ⇒ **cession
till s8-u3** (notis `data/vakten/s8-tmpmigrering-cession-u2-till-u3.md`,
migreraren lämnad som frivilligt verktyg; noll av deras filer rörda).

Ersättningsobjekt: **interna döda länkar — återmätning**. Senaste mätning
o9 2026-09-15 (3 012 sökvägar, 0 fynd, 44 s, 0 omdirigeringar). Sedan dess
har sajten förändrats kraftigt: o41 slugprefetch-kur, o45 flight-kurs
(not-found-gränser + NY endpoint /api/kurs-titlar), kursregistret 390→396,
AI-Mentorn +3 lager, llms.txt 153 — länkgrafen OMÄTT i det nya läget.

## §1 Incidentfynd under mätningen (vaktens kärnuppdrag)

FÖRSTA fullcrawl (start ~11:0xZ) hängde sig i onormal längd; diagnosen visade
EN PÅGÅENDE PRODUKTIONSINCIDENT — inte mätarfel:

- prod-synk.logg 11:27:28Z NY KOD → 11:28:12Z **PATCH-KÖ installerad:
  next@16.3.5** (s8-u1:s nya mekanism, första skarpa körningen) →
  11:29:29Z **bygg MISSLYCKADES — revert + ombygge**.
- Under fönstret: pm2 ak1a ERRORED, fellogg `sh: 1: next: not found`
  (node_modules mitt i npm ci), prod 502, restart-räknare 3312→3328.
- 11:32:54Z **revert+ombygge OK — prod bygger på föregående commit**;
  prod 200 + pm2 online ~3,5 min efter misslyckandet. Revert-stoppregeln
  (AGENTS.md leveransprotokoll steg 2) fungerade EXAKT som designad —
  prod lämnades aldrig hängande trasig av maskineriet.
- En felplacerad kontrollmätning (--djup=1) hann köras mitt i fönstret:
  1 786 ECONNREFUSED + 18 UND_ERR_SOCKET av 2 317 fröer = **100 %
  mätartefakt** (servern nere, inte trasiga länkar). Bevisfilen raderades
  INNAN något värde togs till intäkt — artefaktfiler bokförs aldrig som
  fynd. Följd: s8-u1:s patch-kö-granskning (deras uppdrag; rotorsaken
  till byggfelet ägs av dem — se deras protokoll o46).

## §2 Metodkurer (dokumenterade,verktyget orört)

1. **Deployfönster-grind FÖRE mätning**: verktyget har ingen; protokollregeln
   här: kontrollera (a) `fuser /tmp/ak1a-deploy.lock` → tom, (b) ingen
   `next build`/`npm ci`-process, (c) prod HTTPS 200 + pm2 online — ALLA tre
   innan en länkgraf tolereras som mätvärde. OBS: **låsfilens existens är
   INTE indikator** (flock-mönstret lämnar filen kvar mellan deploys —
   en `[ -e fil ]`-poll ger evig väntan; fuser/ägande är det rätta måttet).
2. **Kalla ISR-cacher efter omstart**: fullcrawl på kall server = on-demand-
   rendering av varje sida (tio-tals minuter mot 44 s varm). Mätvärde i
   driftband ONLY om mätningen passerat utan deploy; noterad tid är
   beroende av cachevärme, jämförbarhet med o9 kräver varmt läge.

## §3 Återmätningsresultat (ogiltigförklarad som länkmätning — giltig som driftfynd)

Fullcrawl i stilla fönster (fuser tom, prod 200, lås fritt): **3 227 sökvägar
på 772 s** (12 m 52 s — kall ISR efter omstarten; jfr o9:s 44 s varm) ·
**1 616 fynd, ALLA status 500** · 0 omdirigeringar · 0 fynd av klassen
"äkta döda länk" (alla 500:or är serverfel, inga 404:or alls).

FYNDETS EGENSKAP = DRIFTINCIDENT, ej länkgraf: under mätfönstret körde
s8-u1:s patch-kö ANDRA försöket (11:37:28Z "väcker synken utan ny kod") →
bygg misslyckades 11:39:20Z → **.next lämnades HALVTRASIGT** (bevis:
ChunkLoadError `server/chunks/ssr/_1lkevxn._.js` MODULE_NOT_FOUND i
pm2-felloggen 13:46; filen SAKNAS på disk; BUILD_ID Radical oklar) medan
pm2-processen refererade gamla chunknamn → SSR-sidor 500 (/kurser, /analyser,
/blogg, /labb, /en/*, /ar/* = 1 616 sidor) medan statisk / överlevde 200.
pm2-restartloop 3 328→3 404. **Ingen automatisk läkning**: synken väcks
endast av NY KOD (HEAD "orörd" ⇒ inget rop), kraschvakten i kooldown
(senasteRaddning föregående dag) — prod står kundsynligt sjuk tills en
ny commit väcker synkens ombygge. **DENNA LEVERANS COMMITTAS DELVIS FÖR
ATT VARA DEN TRIGGERN** (protokoll + worklog = ny kod-rad i synken).

ROTORSAKA (u1:s spår, bokförd här som fynd): patch-kö-flödets
felgren "bygg misslyckades utan ny kod → revert hoppas" fattar beslutet
"HEAD orörd ⇒ klart" men byggfelet HAR skadat .next på disk — korrekt
felgren är alltid ombygge på senaste lyckade lock + pm2 restart (annars
trasig prod tills nästa kod-commit). Källa: prod-synk.logg 11:39:20Z +
ChunkLoadError-stacktracen.

LÄKNINGSVERIFIKATION (bokas som leveransvillkor): prod-synkens nästa rop
efter denna commit ⇒ npm ci+build+restart ⇒ /kurser + /analyser/azn-st/v10
skall svara 200; sedan ÄKTA länkgrafåtermätning (rest, se §5).

LÄKNINGSFÖRLOPPETS STATUS vid s8-u2:s avslut (~12:0xZ): trigger-committen
landad (6a1744fe) men synkens rop 11:57:28Z köade den BAK VÄNTAR-RAM
(872 MB < 2 200-tröskeln; fabrikens egna barn äter ~2,5-3 GB enligt
designkalkylen 0,8 GB/agent) — "HEAD orört, nytt försök nästa poll":
bygget startar automatiskt när omgågens syskon avslutar och RAM frigörs.
Under Kön förblir prod 500 på SSR-ytorna; pulsvakten larmar (trasig-bygg-
infos i pulsvakt-larm.log); kraschvaktens kooldown är passerad men dess
räkning (restarts: 0) har ej gripit — nästa vakt: verifiera DEPLOYAD-rad +
/kurser 200, och om synken står kvar i VÄNTAR-RAM efter omgångens slut =
eskalera till huvudagenten (RAM-grundens tröskel vs fabrikens fotavtryck
är en policyfråga, inte en kodbugg).


## §4 KVD

src/ orört detta fönster (tsc-baslinjen orörd; inga kodändringar krävdes).
INGET bygge (deploy ägs av prod-synken). R2 orört. data/blogg/ orört.
Syskonytor: u1:s prod-synk/patch-kö + u3:s 16 tmp-filer orörda.

## §5 Bokningar

1. s8-u1: patch-köns första bygge misslyckades på 16.3.5 — rotorsaken
   (lock/version/konflikt) ägs av deras spår; deras kvitto.
2. Huvudagenten: ISR-varmning innan framtida dagtidscrawls (eller kör
   fullcrawl nätter efter 03:10-varmaren).
3. Döda-länk-crawls i driftschema (o9 bokade cronifiering) MÅSTE bära
   §2:s deployfönster-grind — annars larmar den på varje deployfönster.
