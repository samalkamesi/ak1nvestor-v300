# o60 — Efterbokföring: patch-köns sanna slutleverans + u1:s bokade EFTER-mätningar (spår 8, s8-u3-retry)

**Datum:** 2026-09-18 00:0x–00:3xZ · **Agent:** s8-u3-retry (manifest
auto-s8-1789687529759, 3/3 — retry parallel med u3-originalet, se §0) · **Roll:** vakt
**Anspråk:** data/vakten/auto-s8-1789687529759-u3-ansprak.md (§2, skrivet före verkställighet)

## §0 Fabrikskollisionsfyndet (dokumenterat, inte dolt)

Retry-sessionen (denna) startade medan u3-ORIGINALET fortfarande levde och
arbetade: originalet levererade ActivityRow-kur 1 (37071551) + ScrollArea-kur 2
(5d8bbd1f 23:58Z) och BOKFÖRDE (013c782d 00:15:08Z: protokoll + worklog med
slutbevisning 0/22 + 0/88) MEDAN retry:n kartlade. Fabrikens statusfil markerade
manifestet klart 00:15-ish. Retry:n:s objektval gjordes därför om i realtid till
de delar originalet INTE rört (nedan) — originalets filer orörda (deras protokoll,
domsond, commitmsg3, worklog-rader). Lärdom till fabriken: retry FÖRE
leveranskontroll av originalet skapar dubbla sessioner; statusfilens "klar" är
sanningsägaren — läs den före eget val.

## §1 Objekt 1 — patch-köns SLUTBOKFÖRING (critical-RCE:n är fixad i drift, men bokföringen ljög)

**FÖRE-läge (mätt 00:1xZ):** node_modules/next = **16.3.5** och committad lock
(HEAD) = 16.3.5 — men patch-kvitton.jsonl slutade på TRE "misslyckad"-rader
(18:32/18:41/18:50Z, klass "lock-commit misslyckades") och kön
data/infra/patch-ko.json lever med båda posterna = mekaniskt avstängd
(3-försökstaket) medan verkligheten var: LEVERERAD.

**Sanningskedjan (ur prod-synk.loggen rader 1270–1288 + git):**
1. 18:15Z: o55-pm2stopp återaktiverade kön (kvittofil arkiverad, räknare nollad).
2. Tre cykler: väckt → "PATCH-KÖ installerad: next@16.3.5 eslint-config-next@16.3.5
   — package-lock uppdaterad i arbetsytan" (~18:28Z + 18:37:35Z + 18:47:33Z) →
   bygge med pm2-vakt → "lock-commit MISSLYCKADES (git commit -F …)" ×2 per cykel.
3. ROT TILL DE TRE SPEURIOUS-KVITTONA: s8-u2:s commit **957272f8 18:30:22Z** tog
   med package.json + package-lock.json (index-fönster-kollision, dokumenterad i
   s8u2-o55-patchko-lockcommit-notis.md) — materialet var REDAN committat när
   patch-köns eget commit-steg körde ⇒ "nothing to commit" exit 1 ⇒ misslyckad-
   kvitto utan att patchen fått skulden. Exakt o50 §2.2:s spurious-klass, ny
   orsakssökväg (syskonscommit i stället för revert-väg).
4. Prod byggde därför på patchad arbetslock redan 18:41Z-cykeln och på COMMITTAD
   lock vid 00:07–00:10:09Z (5d8bbd1f, prod 200). pm2 startad 00:10:20, eslint-
   config-next = 16.3.5, node_modules/next = 16.3.5.

**Bokförd åtgärd (o50-precedensen "bokförd ingripande, inte tyst dataåndring"):**
- Gamla kvittofilen ARKIVERAD intakt → `data/vakten/patch-kvitton-arkiv-2026-09-18T00Z.jsonl`.
- Ny kvittofil: **ok-kvitto per post** med hela beviskedjan i detalj-fältet
  (maskinens kontraktsformat: ts/paket/version/resultat/detalj — "resultat":"ok"
  gör posten inaktiv i aktivPatchPlan).
- Kön `data/infra/patch-ko.json` TÖMD (`[]`) — posterna är levererade.
- **Funktionellt verifierat med prod-synkens EGNA exporter:** lasPatchKo([]) = 0
  fel · lasPatchKvitton = 2 ok · **aktivPatchPlan = 0 aktiva** — kön väcker
  aldrig synken i onödan, ok-kvittona respekteras.

**Säkerhetsvärde:** next 16.3.2 → 16.3.5 i drift = critical-RCE
GHSA-p293-qw3h-jr36 + GHSA-2xp9-vwfh-vxw4 fixad, nu även SANN i bokföringen.

**REST (bokas, ägs av prod-synkens ägare):** idempotensgrind i prod-synk.mjs —
ett lock-commit-steg vars diff redan är committad ("nothing to commit") bör
bokföras som ok (jämför index-mot HEAD) i stället för misslyckad; klassen har
nu tröttat kön två gånger (o50 §2.2 revert-vägen + denna syskonvägen).

## §2 Objekt 2 — u1:s bokade kedjesond: l=0 v=390 (INFRIAD)

u1:s bokning (o58): "kedjesond _s8u1-strippmatning.mjs → l=0 v=390". Sonden
kraschar i prod-DOM — dess selektor `div.-mx-4.overflow-x-auto` frågar
FÖRE-klassen som kuren bytte ut (getComputedStyle(null); kraschen i sig ett
sekundärbevis: utbrytarklassen finns inte längre). Instrumentet efterföljdes av
egen sond `verktyg/_s8u3-tabrad-efter.mjs` (u1:s fil orörd — deras leverans),
mäter den KURADE raden:

```
klass: -mx-[0.875rem] overflow-x-auto px-4 …
l=0 · v=390 · hö=390 · mar=0px -14px (= 0.875rem i 390-vy — matchar mobilens px-4)
sw=2228 · cw=390  (flikinnehållet avsiktligt scrollbart i overflow-x-auto)
gammalKlassFinns: false · body l=0 v=390 sw=390 · docOverflod 0
VAKTMÅL tabrad: l=0 v=390 → GRÖN
```

Exakt o58:s aritmetik: barnet landar (0,390). Kördes i STILLA fönster (deploy
00:20:05Z klar, lås fritt, prod 200) — mitt i ett deployfönster ger ogiltiga
mätvärden (bevisat: första försöket mitt i 00:17-fönstret returnerade
inloggnings-DOM utan admin-tabrad; o55:s fönstergrind gäller ALLA chrome-mätare,
inte bara länkcrawlern).

## §3 Objekt 3 — DRIFTSBOKEN-rättningen (u1:s bokning, INFRIAD)

Rad ~1732 punkt (3) "»/admin 2px överflöd i mobil« är ett konstant normalmönster
… inte ett fel, jaga det inte" RÄTTAD med hänvisning: defekt i tre lager,
kurerat, slutmätt 0/88 GRÖN (deploy 5d8bbd1f 00:10Z) + "GRÖN 13:17"-slutsatsen
var mätblindhet (klippt dokument-scroll 0px med element utanför) + regeln: jaga
ALLTID utanfor-signalen. Historik bevarad som RÄTTAD, inte raderad
(loggboksprinzip).

## §4 Extra: oberoende tredje vaktkörning

`granssnittsvakt.mjs --bas=http://localhost:3000 --sidor=/admin` (00:14–00:16Z,
stillt fönster efter 00:10-deployen): **0 fynd / 88 kombinationer** —
granssnitt-2026-09-18T0016.json. Overensstämmer med originalets 0/22 + 0/88
(00:12/00:14) — grön med tre oberoende körningar på två byggen (5d8bbd1f +
013c782d).

## §5 KVD-sammanfattning

- tsc: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (src/ orörd
  av denna våg — mät-/bokföringsvåg).
- Inga egna byggen/installationer: två deployfönster (00:07–00:10, 00:17–00:20)
  väntades ut under flock-ägande; prod 200 × verifierad efter varje.
- R2 orörd (priser/tier/publicering orörda) · data/blogg/ orörd · .env läst
  ENDAST av u1:s etablerade sondmönster för lokal inloggning (aldrig skriven).
- Syskonens ytor orörda (u1:s strippmatning orörd; originalets 3+1 filer orörda;
  prod-synk.mjs orörd — resten i §1 bokas åt ägaren).

## §6 Duplikatkontroll

- Vakten 0/88: originalet bokförde SIN körning (00:12+00:14); min 00:16-körning
  redovisas här som oberoende EXTRA-bevis, ej som ursprungsleverans.
- Kedjesond + DRIFTSBOKEN + patch-bokföring: fanns i INGEN levererad fil
  (originalets 013c782d rörde endast protokoll+commitmsg+worklog; u1/u2 kvittade
  klara) — spårets öppna poster vid verkställighetstillfället.
