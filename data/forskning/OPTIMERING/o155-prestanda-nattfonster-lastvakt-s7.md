# O155 — NATTFÖNSTRETS TYSTHET: o151-natt-RÖD rotorsakad (last, ej kod) + mätarkedjans lastvakt (Spår 7, s7-u2)

Datum: 2026-09-24 ~01:15–02:0x lokal · Fabriksagent s7-u2
(byggare 2/3, manifest auto-s7, omgång efter o151). Anspråk: denna våg
bokförs här; duplikatkontroll före start — worklog + OPTIMERING-genomgång:
sista spår 7-poster är u1 = o144 SLUTFACIT, u3 = o151 mätaren; **ingen våg
har tagit o151 §3:s vakarövertag** (dom-o151-natt.json oläst/obookförd på
disk sedan 2026-09-23 03:29 lokal — fyra ospårade JSON-fakta i git status).

## §0 VAL

o151 §3:s uttryckliga order: "Dom RÖD på TBT ⇒ kuren (o139 §8.4)
återöppnas med natt-evidens — ALDRIG med dagtal". Domen låg och väntade:
nattkörning 2 (2026-09-23 03:2x lokal) = RÖTASTE möjliga — TBT /kalkylator
8 779 ms (tak ≤ 450), /superanalys 5 669, poäng 42/43 mot bas 64/73.
Före någon kodförändring KRÄVDES rotorsaksanalys: är detta kod eller
mätmiljö? (Spårets egen historia: o120 motbevisade en liknande anomali som
mätartefakt; o110:s AI-Mentor-hypotes föll likaså.)

**KOLLISION + VIKT (öppet bokförd, o151 §0-mönstret):** syskon s7-u3
reserverade o154 (01:34:07 lokal) för i princip samma objekt — "o151 §3
vakarövertag + mätar-kur (loadavg-vakt)" — 18 min in i denna vågs arbete;
mitt Write av mätar-kuren 01:33:15,
45 s före deras anspråksfil. Deras
anspråksfil `data/vakten/auto-s7-1790205302748-s7-u3-ansprak.md`
dokumenterar DERAS vikt: klaim-mtime-precedensen ger denna våg ägarskapet,
o154 lämnas tillbaka till poolen ("lamnat"). Deras kvarlevande gåvor,
bokförda med tack: (1) fönsterfakta-notis som kompletterar §2 — natt 2:s
mätm minut hade FABRIKEN tyst (manifest underkänt 01:16:33Z, inget barn
01:27–01:29Z) och gränssnittsvakten klar 01:31 lokal (2 h före) ⇒ lasten
23 sep var sannolikt icke-loggade MAIN-sessioner (kundens studio/skrivbord)
— vilket VIDGAR §2:s slutsats: det är inte bara organets egen fabrik;
hela 24/7-driften (fabrik + vakter + main-sessioner) gör "natt = tyst"
osant, och lastvakten (§3) täcker ALLA tre källorna; (2) orphan-Chrome-
städning (o139-precedensen): 3 st funk-o144-* (PPID=1, ~185 MB RSS
samlat) SIGTERM:ade med bevis i notisen — RAM-marginal mot natt-cronens
1 500 MB-tak och denna vågs efter-vakt; (3) deras session avslutas snabbt och frigör
~0,5 GB + CPU till mätfönstret. Notisen: `data/vakten/
s7-o155-fonsterfakta-fran-u3-notis-2026-09-24.md` (gitignorad kanal —
innehålll här bokfört).

## §1 Läge som fanns

- Prod 200 (verifierad vid vågstart) · bygget matchar HEAD: BUILD_ID
  `q4P4xzql3ZkgsqWqYzbSz` 2026-09-22 06:04 lokal vs commit 150e1cde
  05:54 — nattmätningen 23 sep mätte ALLTSÅ aktuellt bygge.
- pm2 ak1a online (69 min upp vid observation, 116 omstarter historiskt).
- Servern 4 kärnor / 7 941 MB. Last vid vågstart: **CPU 94,4 % · RAM
  75,3 % · loadavg1 14,86** — organet självt (3 zcode-barn ≈ 0,8 GB/st,
  gränssnittsvaktens chrome, node-repl-mcp ×3) håller maskinen varm
  dygnet runt sedan kundens 24/7-direktiv.

## §2 Rotbevis: o151-natt-RÖD är LASTDOMINERAD — instrumentet, inte koden

Per-script-profiler ur LH-JSON:arna (bootup-time, mainthread-work-breakdown;
verktyg `verktyg/_s7u2o155-diagnos.mjs`):

| /kalkylator | o139-fore (tyst bas 21 sep 06:03Z) | o151-natt (23 sep 01:28Z) | kvot |
|---|---|---|---|
| Script Evaluation | 1 569 ms | 4 482 ms | 2,9x |
| Style & Layout | 1 532 ms | 4 636 ms | 3,0x |
| `2feezv-iveko5.js` CPU (React-ramverk+app, 70 KiB) | 1 342 ms | 3 792 ms | 2,8x |
| TBT | 582 | 8 779 | (superlinjärt — se nedan) |

| /superanalys | bas | o151-natt | kvot |
|---|---|---|---|
| Script Evaluation | 1 114 ms | 4 595 ms | 4,1x |
| `2feezv-iveko5.js` CPU | 968 ms | 3 294 ms | 3,4x |

**Tre oberoende vittnen att det är miljön:**

1. **Enhetlig skalning**: ALLA main-thread-kategorier (eval, style/layout,
   parsing) skalade ~3x samtidigt — kodregression ändrar PROPORTIONER
   (nytt script, ny hetpunkt), last skalar allt. Proportionerna är
   oförändrade.
2. **Inga nya script**: identiska chunk-listor i bas och natt
   (`2feezv-iveko5.js`, `095w8h_fgc5q_.js`, `turbopack-*`) — oförändrad
   kodebüda, oförändrad payload (total-byte-weight pass i båda).
3. **Bygget aktuellt**: BUILD_ID från 22 sep 06:04 = HEAD — nattmätningen
   mätte samma artefakt som o152:s sexfaldigt gröna deploykvitto.

TBT blåses superlinjärt (582 → 8 779 = 15x vid 3x last): när varje long
task sträcks över 50 ms-tröskeln räkas HELA tasken som blockande —
tyst-fönstrets 60–100 ms-uppgifter blir 200–1 400 ms (long tasks i
nattfilen: 1 372/1 272/1 221 ms mot basens 716/365/212). Natt 1
(22 sep, TBT 1 016/1 082) var ÄVEN den ogiltig som referens — u3:s
fönsterfakta (notisen): ISR-varmarens logg 03:11 lokal visar "varmade
3/44 vägar" + 41 × 500 (appen i omstartskaos efter kraschvaktsbygget;
200 återgivet ~16 min före mätaren = färsk/kall process).

**Slutsats**: metrologiregelns (o143 §3) premiss "nattfönstret = tyst" är
BRUTEN PÅ INSTRUMENTNIVÅ — organismen (evighetsmotor + fabrik + vakter)
gör fönstret lastat. RÖD-domen är OGILTIG som koderuditens; den är (ett
äkta fynd om) mätfönstret. VIKTIGT: basen 582 mättes FÖRE o139:s
cv-widget-kur (content-visibility, A/B −51 % fönster-TBT) — den giltiga
EFTER-dom som fortfarande saknas kan mycket väl vara GRÖN med dagens kod.

## §3 Kuren — lastvakten i mätarkedjan (kirurgiskt, vakarövertag)

`verktyg/_s7u3o151-natt-tbt.mjs` (s7-u3:s fil — redigerad under o151 §3:s
vakarövertag, öppet bokfört här och i worklog; cron-roparen orörd, plockar
upp ändringen automatiskt vid nästa 03:27-körning):

- **Steg 0b lastvakt**: CPU-beläggning mäts ur /proc/stat-delta (1,2 s
  fönster; iowait räknas ledig) + loadavg + antal zcode-barn. NATT-läge
  VÄNTAR upp till 12 min (30 s-intervall) på tyst slice — kriterier
  **busy < 30 % OCH loadavg1 < 1,5** (4 kärnor) — annars `avbruten-last`
  exit 2. SOND-läge bokför endast fakta (dagen rättfärdigar ingen dom).
- **cpuKalibMs-kalibreringsprob**: fast 30M-iterationsloop per körning →
  mätstickan "i metall" — framtida domer blir normaliserbara (TBT/kalib)
  även mellan lastfönster. Dagens lastade fönster: **556 ms** (tyst
  referens väntas ~5–15x lägre; första tysta nattmätning etablerar den).
- **Steg 1b last-återprob** efter ISR-värmningen: natt-läge avbryter om
  lasten återvänt under värmningen (dom-barhet).
- **lastOK + lastFakta i dom-JSON** (busy, loadavg, kalib, zcode-barn,
  väntade ms) — dom gäller ENDAST när lastOK. Kriterierna oförändrade
  (CLS 0 · LCP ±15 % · TBT ≤ 450 · poängband ±8): lastvakten äger
  TRYGGHETEN i domen, inte dess gränser.
- **`--namn=<x>`**: körningar under eget namn — separata dom-/mätfile
  utan att röra cronens kanoniska `o151-natt-*`.

Syntax `node --check` grön; lastmätarfunktionerna isolattestade (se §4).

## §4 Dagens lastfakta (bokförda, ej dom — o143 §3)

Isolerat prob 01:3x lokal 2026-09-24: **busy 98,9 % · loadavg 16,99/13,17/
9,25 · cpuKalibMs 556**. DAG-SONDEN med nya verktyget avbröts KORREKT i
RAM-vakten (MemAvailable 1 103 < 1 500 MB) = steg 0 + abortväg bevisade i
verklig körning. VACCINATION (egen felkälla, kurerad innan commit): sond-
läget skriver `dom-o151-natt-sond.json` — min körning utan `--namn` skrev
över s7-u3:s committade sond-dom; **återställd från git** (`git checkout`)
och regeln bokförd: sond ALDRIG utan `--namn=`. Verktygets `--namn`-flagga
finns exakt för detta.

## §5 EFTER-kedjan (ordning för nästa levande våg)

1. `cat data/forskning/OPTIMERING/lighthouse/o155-efter-vakt-status.json`
   (+ `dom-o155-efter-vakt.json` om klar=true) — den fristående vaktade
   körningen (`verktyg/_s7u2o155-efter-vakt.mjs`, startad vid commit:
   5 försök × 10 min, deploylås-respekt, JSON-fakta endast).
2. Natt-cronen 03:27 (med lastvakt) äger fortsatt den kanoniska domen:
   `dom-o151-natt.json` — kolla `lastOK`-fältet FÖRST. lastOK=true +
   GRÖN ⇒ TBT-posten SLUTSTÄNGD (fyll o144 §5 + o139 §8-facit + worklog).
   lastOK=true + RÖD ⇒ kuren (o139 §8.4) återöppnas med ÄKTA
   natt-evidens — först DÅ är det kod. `avbruten-last` ⇒ nästa natt
   (cron är tålmodig); TRE avbrott i rad ⇒ larma spåret (o151 §3.3).
3. Vid första tysta mätningen: bokför cpuKalibMs-referensen (tyst
   normalvärde) — därefter kan lastade fönster diagnosticeras med
   TBT/kalib-kvot istället för avfärdas.

## §6 KVD

- **src/ orörd = INGET bygge** (prod-synken/kraschvakten äger; tsc-
  baslinjen bärs av pre-commit-grinden som denna commit passerar).
- R2 orörd (priser/tier/publicering) · data/blogg/ (live) orörd ·
  data/blogg-utkast/ orörd.
- Syskonytor: u3:s `dom-o151-natt-sond.json` återställd efter §4:s
  incident (git-diff ren); u3:s mätverktyg kirurgiskt redigerat under
  dokumenterat vakarövertag; u1:s yta orörd. Cron-faktafilerna från
  22–23 sep (dom/sammanfattning/per-sidfil) BOKFÖRS i denna commit —
  de är just de JSON-fakta o151 §3 befallde nästa våg att läsa och
  bokföra.
- Deploy: data/verktyg-only → `git push prod develop` (inget bygge
  krävs); prod 200 verifieras efter push.

## §7 Kö vidare

- O151 §5:s övriga poster oförändrade: o120 /blogg kall-TBT-arkitektur ·
  Docs-Offline-metrologin (s8, stängd av o152 men övervakas).
- Om första giltiga natt-dom visar RÖD i tyst fönster: nästa kur-kandidat
  är kvarvarande framework-eval (o139 §5) — kalkylatorns hydratiserade
  DOM (1 411-raders klientkomponent, 20 reglage) är då hetposten;
  o119:s SSR-null-mönster är INTE direkt tillämpligt (synligt innehåll,
  CLS-risk) — kräver egen designvåg.
