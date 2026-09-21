# o140 — TICK-SVÄLT-INSTRUMENTET: pumpor-daemonens puls får mätögon (spår 8, s8-u1)

**Datum:** 2026-09-21 · **Ägare:** s8-u1 (manifest auto-s8-1789972517251, vakt 1/3)
**Nummer:** o140 (reserverat under flock, hogstaKanda o139, 139 källor — o117-doktrinen)
**Kedja:** o136 §6 post 3 (bokad "egen våg") · rot FYND från o136 §5

## §0 — SAMMANFATTNING

Pumpor-daemonens rop-gap (o136: organ-gap 100–146 s på automation-motorn,
hel-tystnad 94–205 s, korrelerade med bygg/höglastfönster) kunde inte
rotorsaksdömas — tre hypoteser lever samtidigt: (a) event-loop-blockering
i daemonen, (b) CPU/IO-svält (hela servern), (c) pm2-pipe-backpressure.
o136 §5 konstaterade: "kausaliteten kräver instrument". Denna våg bygger
instrumentet och aktiverar det LIVE i prod-daemonen.

## §1 — VAD SOM LEVERERATS

**Modul `verktyg/pumpor-tick-matning.mjs`** (ren biblioteksmodul, o80
main-guard — import startar aldrig mätning):

- **DRIFT** — start-till-start-avstånd minus schemalagt intervall
  (30 000 ms) per tick. Normalt några ms; tröskel 2 000 ms.
  Fångar fördröjning oavsett orsak (a) och (b).
- **LOOP** — `perf_hooks.monitorEventLoopDelay`-histogram (resolution
  20 ms), max/medel sedan förra tick; fönstret RESETAS varje tick.
  Hög loop-max med låg drift = kort blockering som schemat hann ikapp —
  fångar (a) direkt. NaN på tomt histogram härdas till 0
  (Number.isFinite — `??` fångar ej NaN; funnet av sonden, testfixat i L).
- **RESURS** — vid tröskelträff ENDAST: MemAvailable, loadavg 1 min,
  daemon-RSS. Ren filläsning ur /proc (inga barnprocesser — mimosa-ren
  från födelsen). Skiljer (b) resurs-svält från (a)/(c).
- **Utdata-kontrakt:** EN maskinläsbar rad vid träff —
  `TICK-SVÄLT {"driftMs":…,"loopMaxMs":…,"loopMedelMs":…,"memTillgangligMB":…,"load1":…,"rssMB":…}`
  via daemonens logga() ⇒ pm2-ut-loggen = SAMMA kanal rop-hälsa.mjs
  läser. Radkontrakt mot rop-hälsan: inget `▶ `, inte
  `PUMPOR-DAEMONEN…startar` ⇒ dess parsning opåverkad (svitfall C).
- **Daemon-säkerhet:** tick() kastar ALDRIG — histogram, resursläsning
  och loggning bärs av try/catch; död loggkanal ⇒ tyst, aldrig kast
  (svitfall G/H).

**Daemon-edit (kirurgisk, 3 ingrepp):** import + `tickMatning.tick()`
som FÖRSTA rad i tick() (FÖRE schemat — tick-callbackens egen puls mäts
ren; schemakörningarna är asynkrona spawn:ar, callbacken är mikrosekunder)
+ aktiveringsrad vid start: `TICK-MÄTNING aktiv (o140) — trösklar:
drift 2000 ms · event-loop 1000 ms …` (live-bevis i pm2-loggen).

**Svit `verktyg/testa-pumpor-tick.mjs`** — 25 PASS · 0 FAIL:
A första tick (drift null) · B normal drift inga rader + driftvärden ·
C drift-träff: radformat/JSON/fält/resurs/rop-hälsa-kontrakt · D
loop-träff med drift under tröskel · E båda över ⇒ EN rad · F reset per
tick + enable en gång · G resurs-kast ⇒ resursFel-fält, tick kastar ej ·
H död loggkanal ⇒ tick kastar ej · I trösklar overridabara · K
standardtrösklar protokollförda · L NaN-histogram ⇒ 0 · O äkta sond
mot riktiga /proc.

**Omstart-wrapper `verktyg/_s8u1o140-omstart.mjs`** — V216-doktrinen
följd för daemonen (modulen är app-specifik): deploy-grind (flock-probe)
⇒ journalkontroll (annan kanal < 3 min vägras) ⇒ journal FÖRE pm2 ⇒
`pm2 restart ak1a-pumpor` i execFileSync-arrayform (o116 K2-mall) ⇒
tyst minut :x2/:x3/:x6 (aldrig roptung slot-minut) ⇒ live-bevis-poll:
ny start-rad + TICK-MÄTNING-aktiv + nästa ▶-rop.

## §2 — VARFÖR DETTA ÄR ROTORSAKSARBETE (inte bara mätning)

o136 kunde konstatera KORRELATION (gap ↔ bygg/höglast) men inte SKILJA
hypoteserna. Med TICK-SVÄLT-raderna blir skillnaden mätbar:

| Signatur i raden | Dom |
|---|---|
| drift hög · loopMax hög · load/mem normal | (a) event-loop-blockering i daemonen |
| drift hög · loopMax hög · load hög / mem låg | (b) CPU/IO-svält — servern, inte daemonen |
| drift hög · loopMax låg · raden kommer i kluster vid höglast | (c) misstänkt pipe-backpressure (loop fri men tick försenas) — kräver fler rader för dom |
| drift låg · loopMax hög | kort blockering som schemat hann ikapp — tidsserie behövs |

Instrumentet DÖMER ALDRIG åt oss (o136-filosofin) — det gör skillnaden
mätbar. Rotdomen förs i protokoll när första äkta raderna finns (§4).

## §3 — BEVIS

- Svit: **25 PASS · 0 FAIL** (tre omgångar under utveckling: 20→24→25 —
  fyra tidiga FAIL var SVITENS egna förväntningsfel (drift räknad på fel
  tick), modulen orörd av dem; NaN-härdningen var ett äkta modulfynd).
- node --check ×4 (daemon, modul, svit, wrapper) — gröna.
- Engångs-sond `node verktyg/pumpor-tick-matning.mjs`: levande värden
  (mem 1 333–1 383 MB, load 1,87–2,03, rss 46 MB) — /proc-läsning bevisad.
- mimosa domän-scan på de tre berörda filerna: **3 skannade / 0 fynd**.
- mimosa-paritet HELA sviten: **ALLA PASS**.
- tsc projektbinär `node node_modules/typescript/bin/tsc --noEmit`:
  **0 fel** (src orörd — kvitto; ALDRIG npx, ALDRIG bygge).
- src/ orörd · R2 orörd (priser/tier/publicering) · data/blogg/ orörd.
- **LIVE-AKTIVERING:** se §5 (appendas efter omstarten).

## §4 — KÖ (till nästa våg i spåret)

1. **Första äkta TICK-SVÄLT-rader** ⇒ rotdom enligt §2:s tabell i nytt
   protokoll (grep `TICK-SVÄLT` i ak1a-pumpor-out.log).
2. rop-hälsa-cronen 06:27 2026-09-22: omstarten (§5) syns som
   "omstart"-fynd inom 24 h-fönstret — VÄNTAT och här förklarat; dagen
   efter åter OBSERVATION/GRÖN normal.
3. o133:s arkiveringsrond (8 engångssonder + 16 .zcode-speglar + 15
   skrap-arkiv) — fortsatt öppen.
4. Ev. tröskelkalibrering: första veckans rader avgör om 2 000/1 000 ms
   är rätt känslighet (för högt brus ⇒ höj; inga rader alls under
   påvisad höglast ⇒ sänk).

## §5 — LIVE-AKTIVERINGEN (appendas efter verkställelse)

(Placeholderrad — fylls med faktiska tidsstämplar och bevis när
omstartswrappern körts klart.)
