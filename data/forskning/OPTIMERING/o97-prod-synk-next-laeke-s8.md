# o97 — prod-synkens .next-LÄKEBACKUP: misslyckade byggen slutar blöda i prod (spår 8, s8-u1)

## §0 Objektval och duplikatkontroll

VAL (anspråk disk-först, data/vakten/auto-s8-1789845906116-s8-u1-ansprak.md ~21:4x lokal):
s9-u3:s rot-fråga från 2026-09-19 morgon, öppet bokförd "åt synkägaren" i DRIFTSBOKEN
07:15Z-notisen — och synkägaren är spår 8 (prod-synk-kurerna o47 → o50 → o67 → o72 → o79).

AVSTÅTT efter kontroll (duplikat = förlorat arbete):
- OG-bilderna 113 st: REDAN kurerade av rond 97 våg 207 (2848c519, "OG-beståndet 446/446").
- Systemiska-skenfynd-klassen (o86 §4): REDAN levererad av o86-granssnitt-driftblindhet —
  driftVerdiktor + drift-tak lever i granssnittsvakt.mjs (759-781); s8-u2/o93 bekräftade.
- skalfri-vakt isAbsolute (o93 Kö 3): syskon u3:s anspråk 21:2x (deras protokoll landade som
  o98-skalfri-isabsolute-s8.md under mitt fönster).
- migrerar-E-regeln (o72): mest bokade posten = högst sannolik u2-val; lämnad ifred.
- "OVÄNTAD EXIT 0" (o85): villkorad, förkastad i o95 (villkoret ej uppfyllt).

## §1 Fyndet och roten

BEVIS (tre oberoende källor samma dag):
1. DRIFTSBOKEN 07:15Z (s9-u3): två misslyckade synkbyggen 06:58:57Z + 07:01:27Z halvrev
   .next UTAN pm2-omstart ⇒ /kurser /portfolj-forskning /portfoljbyggare /rapporter
   /llms-full-txt /_not-found 500 (4 380 felloggrader; / och /blogg gröna — bas-200
   maskerade). LÄKT först 07:12:37Z av 07:07-pollens lyckade bygg ⇒ ~14 min kundsynlig skada.
2. prod-synk.log 19:11:39Z: "bygg OOM-dödat — HEAD orört, nytt försök nästa poll" — .next
   kan återigen ha halvskrivits under ett levande pm2; läkning dröjd till 19:21:40-deployen.
3. prod-synk.mjs eget kontrakt: felgrenen = "revert + ombygge ⇒ … pm2 orörd" och artefakt-
   stoppet "pm2 EJ omstartad … ombygge nästa poll" — inget enda utfall återställer .next.

ROT: next build skriver progressivt direkt i prod-trädets .next (tömmer först, skriver
BUILD_ID + manifests + chunks mot slutet). pm2 (next start) läser filerna från disk per
request. Ett fallit/OOM-dödat bygg lämnar alltså ett blandat gammalt/halvnytt läge som pm2
troget serverar tills NÄSTA poll lyckas bygga klart — designen offrar ~10-15 minuters
prod-hälsa per fallit byggfönster.

## §2 Kuren (beteendet vid lyckat bygg oförändrat = noll extra nedtid)

- `skapaNextLaekebackup({nextKatalog, laekeKatalog})` ropas FÖRE byggstart i korSynk:
  - LAEKE (.next-laeke, gitignorad) skrivs ENDAST när den saknas — "finns-sedan" bevarar
    senast-grönt; ett halvskrivet .next från föregående fönster kan ALDRIG ersätta den.
  - Grönhets-guard: BUILD_ID + build-manifest.json + prerender-manifest.json krävs
    ("icke-gron" annars — bevisat 2026-09-17 11:39: BUILD_ID borta i fallit läge).
  - cache/ (~999 MB ISR) exkluderas — regenererbar vid första träffen.
- `aterstallNextUrLaeke` + `lakaNext(varde)`-helper: återställer .next ur LAEKE i ALLA
  fallna utfall — oom · riktigt-fel (före ombyggs-kedjan, så pm2 är grön UNDER ombyggena) ·
  fallna ombyggar (ombygge-god-lock-fall · o79-avsta · goodhead-kritiskt) · artefakt-stopp
  (E34-klassen: bygget exit 0 men inkonsistent ⇒ gamla pm2:n behöver gamla chunks).
  Loggrad + audit next_lakt_ur_backup per läkning.
- Lyckad deploy städar LAEKE — backupen speglar alltid senaste LYCKADE deploy; nästa
  byggstart tar färsk ur det nya gröna .next.
- "startade-aldrig" orörd (flock tog aldrig låset ⇒ bygget startade ej ⇒ .next orört).
- Fail-open genomgående: fel returneras som strängar, ALDRIG kast — deploy-kedjan kan inte
  dö av läkevägen; VARNING-loggar lämnar beteendet som före kuren.
- Katalog-guards i båda funktionerna: en FIL på laeke-sökvägen är fel-sträng, inte tyst
  "finns-sedan"/"aterstallt" (cpSync hade tyst kopierat en fil som "backup" — funnet av
  svitens fail-open-test, fixat före skarp leverans).

## §3 Bevis

- NY svit verktyg/testa-prod-synk-nextlaeke.mjs: 29/29 PASS (sandbox i os.tmpdir — ALDRIG
  mot skarp .next): skapande + kärnkontrakt + cache-exkludering · finns-sedan-bevarande
  vid sabotat · icke-gron (tomt .next, BUILD_ID utan manifests) · saknas-next ·
  återställning med BUILD_ID-identitet + idempotens · ingen-backup · fail-open ×2 ·
  källkontroller för ALLA flödesanknytningar + audit + .gitignore.
- Regression (prod-synkens samtliga sviter): arbetsytasynk 34/34 · patchko 52/52 · pm2vakt
  35/35 · ramvakt 17/17 · revertgrid 34/34 · tidsstampel 12/12 = 184 PASS 0 FAIL.
- Mimosa-paritet verktygsdomän (^verktyg/, fixture-exkludering enligt full-scan-basen):
  292 filer · 0 fynd GRÖN (rädata: data/vakten/mimosa-paritet-verktygdoman-EFTER-o97-
  2026-09-19.json) — kuren tillför INGA klasser (fs.cpSync/rmSync, ingen child_process).
- node --check ×2 · tsc 0 FEL via projektbinär (src/ orörd — kvitto ändå, o86-precedensen).
- DRIFTSBOKEN 07:15Z-notisens rot-fråga EFTERBOKFÖRD STÄNGD med kur + bevis + kvarvarande
  medvetna luckor.

## §4 Bokningar / läxor

1. Första SKARPA beviset väntar på nästa fallna byggfönster: prod-synk.log-rad
   "<utfall>: .next ÅTERSTÄLLD ur läkebackup" + audit next_lakt_ur_backup — bevakas av
   nästa vaktvåg (sämsta fallet: inget fönster = inget bevis = bra drift).
2. LAEKE kostar ~700 MB disk under byggfönster (62 GB fritt vid leverans — marginalen
   bevakas av befintlig diskvakt om sådan tröskel finns; annars ren observationspost).
3. u3:s o98-protokoll var okommittat vid mitt fönsters slut — deras pipeline, ej mitt.

## §5 KVD

src/ orörd ⇒ INGET bygge (prod-synken äger; integrationen lever vid nästa prod-synk-deploy
— verktyget körs av pumpor-daemonen var 10:e min) · R2 orörd (priser/tier/publicering ej
berörda) · data/blogg/ orörd · data/vakten/-anspråket disk-först enligt konvention
(gitignorad katalog) · syskonytor orörda (skalfri-vakt.mjs = u3:s, övriga verktyg orörda;
commit med exakt pathspec).
