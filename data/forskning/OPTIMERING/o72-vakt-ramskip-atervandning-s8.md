# o72 — Vaktsystemets RAM-skip-blindhet: återförsök inom fönstret (spår 8, s8-vakt)

**Datum:** 2026-09-18 · **Agent:** auto s8-u1 (fabrik, spår 8: kvalitet & säkerhet) · **Roll:** VAKT
**Förekomst-nummer:** o72 (o71 taget av s7-u1 trädbantningen; ls-koll före skrivandet — o65-läxan).

## 1. FYND — 6-timmarsblindheten efter RAM-skip

Beviskedja (allt maskinellt avläst under rondens fönster 17:0x–17:2xZ):

- `data/vakten/cron.log`: `2026-09-18T1317 SKIPPAD — RAM-grind stängd (minnet
  för tomt för mätning)` — dagens 13:17-svep dog i RAM-grinden (fabrikens
  dagbarn under 1 100 MB; tre parallella barn ≈ 0,8 GB/st enligt våg 146).
- Crontab: `17 1,7,13,19 * * *` — nästa rop 19:17 ⇒ **6 h mätblindhet mitt
  på dagen**, exakt när kunden är vaken. Kunddirektivet bakom vakten (våg 105):
  layoutfel ska ALDRIG nå kundens ögon — skyddet var AV i 6 h per skip.
- Tidslinje-reda (för protokollets skull, ur rapportfilers mtime + innehåll):
  - o68:s rotationskur (057f8446) commitades **11:33:51Z** — efter dagens båda
    morgonsvep, som alltså körde gamla urvalet.
  - 05:24-rapporten (176 kombinationer, 0 fel, GRÖN) = 01:17-svepets slut;
    journalen (264 rader) skrevs 05:24:52Z — senaste organiska journalskrivning.
  - 07:17 loggade cron-loggen `GRÖN — 0 fynd` men VARKEN rapportfil eller
    journal följde efter 05:24 ⇒ svepet nådde aldrig mätklart läge (VÅG 142:s
    exit-0-doktrin: uppskjuten/avbruten för deploy = exit 0). **Köpost §6.**
  - 11:35-rapporten = s8-u2:s RIKTADE `--sidor=/superanalys,/kalkylator`-svep
    (8 kombinationer; deras o68-efterbokning dcd3e279) — roterar ej journalen.
  - 13:17 SKIPPAD (ovan) ⇒ **o68:s bokning (1), organiskt cron-live-bevis av
    nya urvalet, kunde inte lösas vid 13:17 — första äkta chans = 19:17.**

Rotbedömning: skip-policyn "cron ropar igen om 6 h" var rimlig när grinden
skyddade mot F6-roten (chrome+bygg+pm2 = prod osvarar), men den ignorerade att
**orsaken till stängningen (fabriksomgångar) lever ~25 min** — minnet öppnar
ofta inom timmen, och då VET det: `free -m` visade 1 919 → 1 177 MB tillgängligt
inom loppet av denna rond. 6 timmars ge-upp för ett ~25-minutersproblem är
rotorsakan; felet satt i wrapperns frånvarande återförsök, inte i grinden.

## 2. KUR — återförsöksslinga i `data/infra/contabo/granssnittsvakt-cron.sh`

- Vid stängd grind: polla igen **var 5:e min (POLL_SEK=300), sammanlagt upp
  till 60 min (VANTA_MIN=60), ≈ 10 ronder** innan SKIP. Varje rond går genom
  **samma fail-safe-grind** (`verktyg/ram-grind.mjs`) — öppnar minnet aldrig är
  slutbeteendet oförändrat: SKIP-loggrad ordagrant + exit 75.
- Rund-logg per misslyckad rond (`RAM-grind stängd (rond N/M av X min) —
  väntar Ys på fabrikens fönster`) + `RAM-fönster öppnade sig på rond N/M —
  mäter nu` när återförsöket bär — driftsläsaren SER nu varför ett svep kom
  sent i stället för att söka i tystnad.
- Överridningsbart för svit: `GRANSSNITT_RAM_MIN` (default 1100) ·
  `GRANSSNITT_POLL_SEK` (300) · `GRANSSNITT_VANTA_MIN` (60) ·
  `GRANSSNITT_GRIND_TAK` (60) · `GRANSSNITT_TORRKORNING=ja` (ekar beslutet,
  mäter ALDRIG) · `GRANSSNITT_KATALOG` (tmp-rapportkatalog — skarp
  `data/vakten/` rörs aldrig av sviten).
- Cron-installationen oförändrad (`17 1,7,13,19 * * *`); ingen överlappnings-
  risk: 13:17 + 60 min max ⇒ klart ~14:5x, långt före 19:17.

## 3. BEVIS

- **Svit `verktyg/testa-granssnitt-cron-retry.mjs`: 16 PASS · 0 FAIL · exit 0.**
  N1 bash -n · R1 stängd grind → exit 75 + TORR-SKIP + rondformat (1/60) ·
  R2 öppen grind → exit 0 på rond 1, ingen mätning · R3 clamp minst 1 rond
  (VANTA=0 får aldrig ge tom seq) · R4 SKIP-rad ordagrant + exit 75 utan
  torrläge + exakt 1 rond (ingen evig loop) · R5 skarp cron.log orörd (mtime+
  size före/efter) · R6 defaultvärden (1100/300/60/60) i skriptet.
- **Sviten fångade en äkta leveransdödare:** första kurversionen refererade
  `$GRANSSNITT_TORRKORNING` utan `:-` under `set -u` ⇒ skarp cron (där
  variabeln ALDRIG sätts) hade dött med `unbound variable` vid varje stängd
  rond och aldrig nått SKIP-loggen. Bevis: manuell körning utan variabeln →
  `line 54: GRANSSNITT_TORRKORNING: unbound variable`, exit 1, ingen SKIP-rad.
  Kurerad (`${GRANSSNITT_TORRKORNING:-}` ×3) + omkörning grön. **Läxa
  (o72-klass): alla nya test-överridningar i set -u-skript MÅSTE födas med
  `:-` från första raden — sviten som kör UTAN variabeln är just vittnet.**
- Manuell torrkörning av wrappern (både stängd och öppen grind) verifierad i
  skal med synlig utdata; `bash -n` ren; `node --check` på sviten ren.
- `node node_modules/typescript/bin/tsc --noEmit` = **0** (projektbinär;
  src/ orörd denna våg — baslinjen intakt och mekaniskt bevisad ändå).
- **INGET bygge** (ALDRIG — prod-synken äger); `data/blogg/` orörd; R2 orörd;
  syskonytor orörda.

## 4. VAD SOM MEDVETET INTE GJORDS (ärlig bokföring)

- **Egen fullvaktkörning avskrevs**: available sjönk till 1 177 MB under
  ronden (77 MB över grindtröskeln; chrome ≈ +500 MB). Att själv starta
  mätning där hade brutit F6-doktrinen som kuren bygger på — och varit att
  förneka eget protokoll. o68:s bokning (1) får sitt organiska bevis vid
  **19:17-cronens svep ikväll** (nu skyddat av retry-kur: även en stängd
  grind vid 19:17 pollar fönstret i 60 min i stället för att ge upp).
- expected vid 19:17+: journal 264 → ~288+, aldrig-mätta (2 053/2 314 enligt
  senaste-korning.txt:s källa-rad) börjar täckas; /kalkylator i första svepet
  enligt o68:s simulering.

## 5. BOKNINGAR (nästa vaktpost)

1. **19:17 organiskt live-bevis** (o68 bokning 1 + denna kurs retry-slinga):
   läs journalrader/nyaste timestamp + cron.log-rad; `RAM-fönster öppnade sig
   på rond N`-raden är kurens äkta signatur om fabriken fortfarande kör.
2. **UPPSKJUTEN-loggklassen**: 07:17:s `GRÖN — 0 fynd` utan rapport/journal =
   VÅG 142:s exit-0-doktrin läser rätt i cron-larmvägen men missleder i
   cron.LOGGEN (GRÖN ≠ mätt). Kur: wrappern skiljer `UPPSKJUTEN — deploy pågår,
   inget mätt` från `GRÖN — 0 fynd` via grep på senaste-korning.txt. Kräver
   testbar vaktkörningsväg (mock av vaktkörningens utdata) — ej offline idag.
3. **v86post/v68bg-importfynden** (o47:s kvarglömda köposter: kurs-slug saknas
   i v86post-vad-ar-roe-kalla.json; v68bg nekade 65 p) — oförändrat öppna,
   datainnehållsvalidering, lämnas åt innehållsspåret.

## 6. Levererade filer

- `data/infra/contabo/granssnittsvakt-cron.sh` — retry-slingan (o72-sektionen).
- `verktyg/testa-granssnitt-cron-retry.mjs` — svit 16 PASS.
- `data/forskning/OPTIMERING/o72-vakt-ramskip-atervandning-s8.md` — detta protokoll.
- `worklog.md` — rondrad.

*Utbildning, aldrig råd — juridikgrinden står vagt (inga rådfraser, inga lagrum).*
