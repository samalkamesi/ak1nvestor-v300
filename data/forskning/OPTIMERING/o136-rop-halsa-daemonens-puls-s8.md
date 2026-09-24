# o136 — ROP-HÄLSAN: daemonens puls synliggjord (spår 8, s8-u1, 2026-09-20/21)

## §1 VAL med pivot (öppet bokförd)

- **Ursprungsval:** o123 §etapp-2 "organens skalform" — anspråk disk-först
  2026-09-21T00:41 lokal (data/vakten/auto-s8-kurbatch2-organ-arrayform-s8-u1-ansprak-o136.md),
  nummer o136 reserverat under flock (hogstaKanda o135).
- **NEDSTÄLLNING (s7-precedensen):** syskon i parallellmanifestet
  auto-s8-1789943721747 anspråk SAMMA objekt TIDIGARE på disk — s8-u3 22:38Z,
  s8-u2 22:39Z (min 00:41 lokal = 22:41Z) — och deras kur låg REDAN i trädet
  (feljagaren.mjs + kraschvakt.mjs modifierade, mtime 22:42:02Z). Mitt FÖRE-mått
  (22:39:45Z, 2 142 filer / 0 fynd / 70 STRANG — baslinjen 67 GLIDIT +3 på ~4 h,
  organinventering 31 poster i 9 filer) lämnades som GÅVA i anspråksfilen;
  deras våg äger etapp 2 och EFTER-basen.
- **Pivot till fritt objekt:** o125 §6 post 2 "pumpor-daemonens rop-hälsa
  (tystnadsfönstret 02:54→12:44Z)" — den enda namngivna öppna posten utan
  ägare (post 1 stängd av rond 124, post 3 av rond 125, post 4 färskhetströskel
  inte nådd: rapporten 07:02, tröskel 26 h).

## §2 ROTFYND (egen mätning 2026-09-20T22:3x–22:5xZ, pm2-ut-logggravning)

1. **o125 post 2 STÄNGD MED BEVIS — daemonen var aldrig tyst.** Under hela det
   påstådda tystnadsfönstret 09-20 02:04–12:54: **66/66 kraschvakt-rop**
   (kadens 600 s, max avstånd 615 s, samtliga exit kod=0). Tystnaden låg i
   KRASCHVAKTENS design (frisk app ⇒ ingen loggrad) — inte i daemonen.
   o125:s R1-kur (ÅTERSTÄLLD-grön) täcker stängningsvägen; posten var
   felriktad, inte obevisad.
2. **Det RIKTIGA gapet: daemonens puls är obevakad.** organism-hälsan ser bara
   pm2-boolesen "online" (organism-halsa.mjs:52) — en HÄNGD/fryst daemon
   (event loop blockerad av resurs_svält) är osynlig tills den DÖR. Bevis i
   aktuell epok (09-18 20:09:54Z → 09-21 00:44, 21 917 rop):
   - **6 hel-tystnadsgap** (ALLA rop tysta, 94–203 s): 09-19 01:21 (164 s) ·
     01:43 (205 s) · 06:05 (151 s) · 21:10 (94 s) · 09-20 14:37 (116 s) ·
     23:58 (99 s).
   - **20 automation-motor-missar** (väntad kadens 60 s, v166:s "FÅR ALDRIG
     missa en cron-minut"): 71–205 s.
   - Korrelation: gapen 14:37 (bygge 14:37–14:43 enligt prod-synk.log) och
     23:58 (OOM-byggserien) sitter MITT i byggfönster; 01:21/01:43/06:05 på
     09-19 ligger i höglastnatten FÖRE byggstart (agentvågor + npm ci-era).
     Rotklass: **resurs_svält fördröjer daemonens tick** — v2:s klockdesign
     självläker (inget schema tappat > 3,5 min), men utan mätning kan en
     TIMMAR lång tystnad döljas bakom "pm2 online". pm2-alarm under epoken: 0.
3. **Kraschvaktens snurr-räknare BEVISAD i drift** (o125 R2:s kur): 22:24:22Z
   "omstarter +17 ⇒ KRASCHLOOP-MISSTANKE" — första gången i journalhistorien
   (18 tidigare rader bar alla "+0"); triggern LEVER.

## §3 KUR

1. **verktyg/rop-halsa.mjs** — sonden: läser daemonens pm2-ut-logg (ren
   filläsning: inga barnprocesser, ingen nät — född mimosa-ren, o123-doktrinen),
   detekterar epok (sista startar-raden), hel-tystnadsgap (> 120 s),
   per-organ missade slotar (1,5× väntad kadens; täta scheman endast:
   automation-motor 60 s · :x-organ 600 s · feljagaren 900 s), och omstarter
   (startar-rad med bevisade rop FÖRE sig — nyloggens första start räknas
   aldrig). Klassning: GRÖN · OBSERVATION (1–4 mikro-gap/enstaka am-miss —
   höglast-trend, ej larmvärd) · FYND (omstart i fönstret | hel-tystnad
   ≥ 600 s | > 4 gap | ≥ 5 am-missar = persistent loop-svält). Exit 0/1/2,
   klassrad "ROP-HÄLSA: <klass> — …" för wrapper-klassläsning (o85),
   --json-rapport, exporterad kärna + main-guard (o80).
2. **verktyg/testa-rop-halsa.mjs** — 44 PASS: källkontrakt (main-guard, rent
   instrument, klassrad, exporterad kärna) · funktionellt (parsning, epok,
   gap-matematik, lookback-gräns 1 h, organ-domslut ≥ 2 rop, samtliga
   klassvägar, epokens EGEN start-rad ≠ omstart — gränsbuggen sviten FANN,
   mid-fönster-omstart ⇒ FYND, fönster-respekt 24/54 h) · CLI (exitkontrakt,
   JSON-nycklar, determinism, import-säkerhet).
3. **data/infra/contabo/rop-halsa-cron.sh + crontab 27 6 * * *** — tunn
   wrapper (o95-mönstret): klassläsning ur verktygets EGEN utdata, sju ärliga
   loggklasser (GRÖN · OBSERVATION · FYND-larm · VAKTFEL-larm · OVÄNTAD EXIT 0
   · larmvägen bruten), larmväg = våg 103/105-mönstret med dummy-env-lås,
   retention 200 rader. Installerad+verifierad (backup
   /tmp/crontab-backup-o136.txt, idempotent; slotten 06:27 lokal = efter
   externa vakten 04:17, FÖRE kvalitetsvakten 07:02).
4. **verktyg/testa-rop-halsa-cron.mjs** — 20 PASS: mock-kommando + dummy-env
   (skarpt larm ALDRIG möjligt), L1 GRÖN · L2 OBSERVATION · L2b FYND (larm-
   vägen låst) · L3 VAKTFEL · L4 OVÄNTAD EXIT 0 · L5 retention · L6 skarp
   cron.log orörd · L7 crontab-radens kontrakt.

## §4 BEVIS

- Sviter: **rop-halsa 44 PASS · 0 FAIL** · **rop-halsa-cron 20 PASS · 0 FAIL**
  (sviten FANN en äkta epok-gränsbugg före skarp drift: första versionen
  räknade epokens start-rad som omstart AND dolde mid-fönster-omstarter —
  två omräkningskurer, båda testfixerade).
- **Skarp epok-mätning** (54 h, data/vakten/rop-halsa-epok-2026-09-20.json):
  FYND — 5 794 rop · 3 tystnadsgap (värst 205 s) · 5 organ-gap · 1 omstart
  (= epokstarten 09-18 20:09:54Z SJÄLV — en äkta pm2-väckning, historiskt
  sant, därför ärligt räknad; jfr §2). **Skarp 24 h (cron-läge):** OBSERVATION
  — 2 747 rop · 0 hel-tystnad · 1 am-miss (146 s, 14:36-byggfönstret) ·
  exit 0 utan larm = korrekt klass.
- **Första skarpa wrapper-körning 00:55 lokal:** loggrad
  "OBSERVATION — … 1 organ-gap … (höglast-klass, trenddata)" — exit 0.
- mimosa-paritet: verktyg-scope **GRÖN 0 fynd**; mina filer **0 poster**
  (födda rena). tsc: `node node_modules/typescript/bin/tsc --noEmit` = 0
  (src orörd — kvitto). node --check ×3.
- KVD: INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd ·
  syskonytor orörda — s8-u2/u3:s pågående etapp-2-ändringar (feljagaren,
  kraschvakt m.fl.) lämnade EXAKT som de låg (commit med explicit pathspec;
  deras filer varken addas eller commitas här).

## §5 ÄRLIGHET — begränsningar

- **Tidsstämplar:** sonden läser pm2-prefixet (lokal tid, CEST) som om det
  vore UTC — konsekvent internt (skillnadsmatematik offset-neutral), men
  fönsterkanterna får ±2 h DST-skew och rapportens tidsstämplar är loggens
  LOKALA klockslag utan zon-suffix (dokumenterat i verktyget).
- **Hel-tystnad under fönsterstart:** gap mäts bara om föregångare ligger
  ≤ 1 h före fönstret — en tystnad som börjar före fönstret syns först när
  den ÖVERSKRIDER fönsterkanten (konservativt: underskattar aldrig, men kan
  missa starttiden).
- **Rotorsaken bakom tick-svälten** (event-loop-blockering vs CPU/IO-svält
  vs pm2-pipe-backpressure) är INTE dömd — gapen är korrelerade mot
  bygg/höglastfönster men kausaliteten kräver instrument (t.ex. tick-längd-
  loggning i daemonen = egen våg, pumpor-daemon.mjs berörs ej här).
- **23:04Z-bevakningen:** kraschvaktens kooldown efter 22:28-räddningsbygget
  löper 30 min; om 23:04-pollens pass-gren inte skriver ÅTERSTÄLLD-grön på
  den manuellt läkta incidenten (o125:s kur, första LIVA testet på äkta
  incident) är det ett gap i KUREN — kraschvakt.mjs ägs dock av syskonens
  pågående våg; fyndet bokas vidare, inte fixas här.

## §6 KÖ

1. Första organiska cron-körning **06:27 lokal 2026-09-21** — förväntad
   klass: OBSERVATION eller GRÖN (epokens gap åldras ur 24 h-fönstret successivt;
   nattens 23:58-gap syns tills ~23:58 imorgon).
2. 23:04Z-kraschvaktspollen (§5): stänger o125-kuren incidenten?
3. Rotjakt tick-svält: tick-längd-loggning i pumpor-daemon.mjs (egen våg).
4. Syskonens etapp-2-EFTER: STRANG-basen ska falla 70 → <39 (31 organposter
   i min FÖRE-inventering — gåvan i anspråksfilen).

Nummer: o136 reserverat under flock (o117-doktrinen) — "din: true" kontrollerat
före commit. LEVERANS: verktyg/rop-halsa.mjs, verktyg/testa-rop-halsa.mjs,
verktyg/testa-rop-halsa-cron.mjs, data/infra/contabo/rop-halsa-cron.sh,
data/forskning/OPTIMERING/o136-rop-halsa-daemonens-puls-s8.md, worklog.md.

## §7 TILLÄGG (2026-09-20T23:05Z) — §5:s 23:04Z-bevakning INFRIAD MED LIVE-BEVIS

23:04:22Z-pollen skrev "ÅTERSTÄLLD: appen svarar=true status=online omstarter
+0 — tidigare incidentläke verifierat friskt (grön)" — o125:s R1-kur stängde
nattens ÄKTA incident (22:24 KRASCHLOOP-MISSTANKE → misslyckat räddningsbygg →
manuell läkning 22:31 → maskinell stängning 23:04, 40 min efter detektion).
State återställd (incidentOppnar borta, kooldown slut). Kurens första
live-stängning på äkta incident = bevisad i drift. Prod 200.
