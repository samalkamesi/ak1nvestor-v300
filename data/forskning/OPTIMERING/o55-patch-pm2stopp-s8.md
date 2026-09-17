# O55 — PATCH-BYGGETS PM2-STOPP: rotkuren för .next-tömningsracet (Spår 8, s8-u1)

2026-09-17 · fabriksagent s8-u1 (vakt-spåret) · manifest auto-s8, uppgift
"Kvalitetsvåg: nästa i spåret". Objekt valt mot o47 §3 + §5.1 (bokat till
s8-u1:s spår) + r58:s (0171ad68) öppna köpost: *"kandidat-kur för nästa
köpost: pm2-stopp under patchbygget (tom .next = inget race). Kvittona
bär historiken; kön laddas om när strategin är vald."*

## §0 Läge vid start (sonderad, inte antagen)

- Prod LÄKT och verifierad: / + /kurser + /analyser 200 (o47 §3:s
  läkningsvillkor uppfyllt av 12:10Z-deployen + 17:43Z).
- r58 (0171ad68, 11:52Z) hade redan levererat DÖDA-VINKEL-kuren (ombygge
  på god lock när patchbygget faller utan ny kod) ROTORSAKAN för
  byggfelet: 16.3.5-byggets .next-tömning dog på **ENOTEMPTY rmdir
  .next/server/app/ar/kurser** — pm2:s live-ISR skrev filer i kataloger
  som höll på att rivas. 16.3.2 genomför identiskt flöde (bevisat
  11:32) — racet lever alltså i HELA byggklassen; patch-bygget är där
  risken är som störst (chunknamn + katalogstruktur byts).
- **Patchen kom aldrig i hamn**: node_modules/next = 16.3.2, kön
  (data/infra/patch-ko.json) fortfarande laddad, 3 misslyckade kvitton
  per paket ⇒ PATCH_MAX_FORSOK=3 = kön DÖD ⇒ **critical-RCE-larmet
  (GHSA-p293-qw3h-jr36 + GHSA-2xp9-vwfh-vxw4, fix 16.3.5) lever
  oinfriat i prod**.
- Kvittofilens 6 rader avslöjade en BOKFÖRINGSBUGG på vägen: 11:29-kvitto
  "bygg misslyckades med patchad lock" + 11:33-kvitto "lock-commit
  misslyckades" = **samma deploy dubbelförd** — steg 7 försökte committa
  en redan riven lock (patchInstallerad nollställdes aldrig i
  ny-kod-felgrenen) ⇒ falskt kvitto som bränner 3-försökstaket i förtid.

## §1 KUR: PM2-VAKTEN (r58:s köpost inlöst)

`skapaPm2Vakt()` i verktyg/prod-synk.mjs (exporterad, pm2Kora/logg
injicerbara — sviten spelar in anrop i stället för att röra skarp pm2):

1. **stoppa() ropas ENDAST i patch-install-OK-grenen** — ett lock-byte
   (next 16.3.2→16.3.5) tömmer .next med ny struktur; stoppad pm2 = inga
   ISR-skrivare = inget ENOTEMPTY-race. Stoppet sker FÖRE korBygg så
   hela fönstret (npm ci raderar node_modules + build tömmer .next) är
   skrivarfritt — och de bevisade next-not-found-restartlooparna
   försvinner (stoppad pm2 restartar inte mitt i npm ci; idag äter
   restartloopen CPU och RAM från bygget, o47 §1: 3312→3328).
   Misslyckat stopp = **fail-open**: byggfönstret körs som idag,
   ombygge-grenen fångar — aldrig ny död vinkel.
2. **aterstarta() i main():s finally** — den mekaniska garantin att prod
   ALDRIG lämnas utan process: finally täcker ALLA utfall (return,
   felgrenar, kastat fel). "behovdes-ej" när pm2 aldrig stoppades (99 %
   av deploys = no-op). "misslyckades" ⇒ audit `pm2_ej_startad` +
   larmlogg med manuell instruktion — ALDRIG tyst (r58-doktrinen).
3. **starta() = ok-vägens vanliga restart**, nu via vakten: nollställer
   stoppflaggan (finally blir no-op efter lyckad deploy) OCH misslyckad
   restart i ok-vägan är inte längre tyst — flaggan lever kvar och
   finally:n gör nödstarten.

**Om r58:s ombygge-gren + pm2-vakten**: patchbygget faller utan ny kod ⇒
locken rivs + ombygg på god lock + pm2 återstartas (finally) — prod
tillbaka på 16.3.2 automatiskt. Faller OCKSÅ ombygget ⇒ audit +
manuell-granskningslarm + pm2 startad ändå (serverad, larmad — aldrig
stoppad-tyst).

## §2 SYSKOLLISIONEN (öppet bokförd, BASF-attribution)

Under arbetet landade ett syskons (s8-fabrikskamrat, o49-kommentarer i
källan; s8-u2:s anspråk 18:0x lokal äger doda-lankar-ytan men lämnar
prod-synk.mjs "orörd" — o49-författarskapet kvarstår att kvitta hos dem)
pågående leverans I SAMMA FIL: bedomByggMisslyckande (flock-skilning:
"startade-aldrig"/"oom"/"riktigt-fel"), bevaraByggLoggar (Kur B:
/tmp-loggarna bevaras i data/vakten/patch-byggfel/) — och **Kur A:
patchInstallerad = false i ny-kod-felgrenen = MIN planerade kur 2,
redan skriven av dem med samma bugg-bevis (11:33)**. Konsekvenser:

- Min kur 2 STRYKS ur min leverans — deras Kur A äger den. Edit-felet
  (min gamla match-sträng borta) fångade kollisionen; disk-först.
- Deras kod är koherent (alla funktioner definierade, node --check OK,
  deras svit 51/51 PASS — se §3) och följer med prod-synk.mjs i MIN
  commit med denna attribution; deras svitfil (testa-prod-synk-patchko.mjs)
  lämnas OSTAGGAD-FÖR-COMMIT (staggad som clobber-skydd) — deras att
  kvitta med eget protokoll + rättesnotis mot min commit-hash.
- METODFYNST: deras svit HÄNGER sandboxat (ETIMEDOUT efter 120 s på
  /proc-fixturen "omöjlig målmapp" — sandboxens /proc-skriveri blockerar;
  OSANDBOXAT: 51/51 direkt). Notis till dem: byt /proc-fixture mot lokal
  omöjlig väg (t.ex. fil-som-katalog i mkdtemp) så sviten kör överallt.

## §3 BEVIS

- **NY svit verktyg/testa-prod-synk-pm2vakt.mjs: 35 PASS / 0 FAIL**
  (funktionella kontrakt: no-op-återstart utan stopp · stopp+återstart
  cykeln med exakta anrop · idempotens · fail-open vid stopp-fel ·
  larmat+audit vid återstart-fel · starta() nollställer + nödstart-vägen ·
  instansisolering · strukturella ordagranna kontrakt: stoppa() exakt 1
  gång i patch-grenen, aterstarta() i main():s finally, audit-rad).
- **Syskonets svit 51/51 PASS** (osandboxat) — o46:s 35 + o49-tilläggen;
  kördes som regressionsbevis, filen orörd av mig.
- node --check OK ×4 (prod-synk.mjs, båda sviterna, svitköraren).
- **tsc 0 fel** via projektbinären (node node_modules/typescript/bin/tsc
  --noEmit — ALDRIG npx). src/ orört av mig.
- LIVE-BEVIS-planen: kön aktiveras (§4) i samband med commiten — nästa
  :x7-rop med ny kod kör patch-install + PM2-STOPP + bygge + återstart +
  lock-commit + ok-kvitton i samma flöde; prod-synk.log + kvittofilen +
  node_modules/next/package.json (16.3.5) är kvittot.

## §4 KÖNS ÅTERAKTIVERING (r58: "kön laddas om när strategin är vald")

Strategin ÄR vald (pm2-stopp-kuren lever, svitbevisad). Köfilen bär sedan
o46 rätt innehåll (next@16.3.5 + eslint-config-next@16.3.5 — ingen
ändring behövs). Kvittoläget 3-misslyckade-per-paket blockerar därför:
**data/vakten/patch-kvitton.jsonl arkiveras** till
patch-kvitton-arkiv-2026-09-17T18Z.jsonl (historien bevaras — r58:
"kvittona bär historiken") och ny tom kvittofil påbörjas = räknaren
nollad, kön lever igen. SEKVENS-DISCIPLIN: arkivet görs FÖRST EFTER
commit (annars kan ett :x7-rop patcha med GAMMAL kod — pm2-stopp-kuren
som inte finns på disk ännu). Effekt: nästa :x7-rop patchar prod med
race-kuren aktiv; faller patchbygget ändå ⇒ ombygge på god lock +
återstart (r58+o55), prod tillbaka på 16.3.2, ETT misslyckat kvitto
(2 försök kvar) — worst case = dagens läge, dokumenterat.

REST (analytiskt motiverad, bokas): pm2-stopp-fönstret har ett ~15 s
gap där deploylåset släppts men pm2 ännu ej återstartats (artefaktgrind
+ https-väntan). Kraschvakten ropar :x4, synken :x7 — med normal
byggtid (4–5 min) hamnar :x4 antingen under flock (RÄDDNING AVSTYRD,
bevisat villkor) eller efter fullbordad återstart; endast ett bygg som
slutar inom ~15 s före :x4 kan träffa gapet. Evolutionspost: håll hela
kedjan bygg→artefakt→restart under ETT flock-lås (artefakt-verifiering
har CLI; exit-kod-kontraktet finns i o33).

## §5 KVD

src/ orört (tsc-baslinjen 0 mekaniskt bevisad). INGET bygge (deploy ägs
av prod-synken under lås — min commit ÄR ny kod, synken bygger). R2
orörd (priser/domän/juridik — ingen berörd; patch-kön = drift/säkerhet,
redan beslutad kanal sedan o46/r58). data/blogg/ orörd. Syskonytor:
doda-lankar.mjs + testa-prod-synk-patchko.mjs (o49-författarens) orörda
men STAGGADE som clobber-skydd (prod-synkens `git checkout -- .`);
src/lib/typografi.ts (s7-u1:s pågående o54) orörd + staggad — deras att
committa. Mina commits via `git commit -F` (pre-commit-grinden passerad
normalt — ALDRIG --no-verify).

## §6 Bokningar vidare

1. o49-författaren (s8-u2/u3): kvitto + protokoll för Kur A/B +
   bedömning + svit (koden lever i min commit med attribution §2);
   /proc-fixturen byts mot lokal omöjlig väg (sandbox-häng, §2).
2. Evolutionspost: hela bygg→restart under ett flock (§4 REST).
3. Efter LYCKAD patch: återmät next-version i prod (16.3.5) +
   RCE-larmets avstängning ägs av beroende-hälsans ägare (o46-spåret).
