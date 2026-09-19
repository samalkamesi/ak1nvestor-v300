# o86 — Gränsnittsvaktens driftblindhet: tillgångshälsa i basen + drift-tak (spår 8, s8-u3)

Datum: 2026-09-19 · Agent: fabriksbarn s8-u3 (vakt 3/3, manifest
auto-s8-1789797929474) · Anspråk (disk-först, FÖRE kur):
`data/vakten/auto-s8-1789797929474-s8-u3-ansprak-o86.md` (gitignorerad
diskkonvention).

## §0 Sammanfattning

Gränsnittsvaktens cron larmade 2026-09-19 07:17 lokal (05:17Z) med 100+
"gränsnittsfynd" som var 100 % driftartefakter: svepet mätte mitt i det
halvtrasiga .next-fönstret (OOM-serien 03:19–05:44Z, DRIFTSBOKEN-noten
förutsåg själv "vaktracet kommer flagga") och dömde varje trasig sida till
ÄKTA fynd eftersom bas-kollen bara mäter bassidans HTTP-kod — pm2 serverade
gamla HTML-skal (200) medan ALLA chunkar svarade 500. Denna våg kurerar
blindheten i roten med två lager (o55:s artefaktdoktrin, slutligen buren till
gränsnittsvakten): tillgångshälsa i basen (HTML 200 räcker inte — basens
första CSS-tillgång måste svara 200) + drift-tak EFTER svepet (dominerar
infra-klassen på ≥ 30 % av kombinationerna över ≥ 3 olika sidor ⇒ hela
svepet kasseras som artefakt, exit 0, inget fynd-larm). Bevis: svit 45/0 med
replay av dagens artefaktrapport (drift) och o81:s äkta fyndsvep (ej drift),
levande SNABB-svep på läkt prod 12/12 grönt exit 0, regression 14/14 × 2,
tsc 0.

## §1 Fyndet — dagens artefakt-larm, tidslinje och rådata

- **05:17–05:20Z**: cron-svep (07:17 lokal) mäter 24 sidor × 4 kombinationer.
  Rapport `data/vakten/granssnitt-2026-09-19T0520.json`: 96 kombinationer,
  184 "fel", statusfördelning **88 "stil-lös sida (CSS ej laddad)" + 8
  "http 500 (serverfel)"** (/studio + /admin), `status: "ok"`, `fel: 184`.
- Konsolrådata i rapporten: `/_next/static/chunks/141v07yf1uzq3.css → 500`
  och woff-media → 500 — **samma CSS-fil svarar 200/246 365 B på läkt prod
  efter 05:44Z-deployn** (egen sondering 06:0xZ: blogg-sidorna 200 + båda
  CSS-länkarna 200).
- **05:44Z**: prod-synkens läkande deploy landar (o84: BUILD_ID PfDDwk,
  https 200 ×5). Svepet mätte alltså 27 minuter FÖRE läkningen.
- Cron-logg: `2026-09-19T0717 FYND-larm` — molnagent-session alarmerad med
  100+ skenfynd under en driftincident som redan var dokumenterad
  (DRIFTSBOKEN + feljakt HÖG 05:33Z). (Föregående natts 01:17-larm bar
  o81:s ÄKTA kontrastfynd — det larmet var rätt; detta var fel.)

## §2 Rotorsakan — tre blindhetssikt i verktyget (granssnittsvakt.mjs)

1. **`basHalsa()` mätte ENDAST `BAS + "/"` HTTP-kod.** Under ett trasigt
   .next-fönster svarar gamla HTML-skal 200 medan tillgångsserveringen är
   död ⇒ "frisk bas" är uppnådd trots CSS-död sajt (dagens bevis).
2. **`deployPagar()` = lås ELLER bas-sjuk.** Med den blinda basen och ett
   ledigt lås (OOM-dödade byggen mellan försöken) döms sidfel ÄKTA
   (grenarna rad ~491/523) i stället för drift.
3. **Inget drift-tak EFTER svep.** o55 byggde mätfönster-grind + drift-tak
   för döda-länkar-verktyget; gränsnittsvakten fick aldrig doktrinen — ett
   svep där 100 % av kombinationerna bär infra-klassen larmade som
   gränsnittsdefekter.

## §3 Kuren — två lager, ren modul + tunn wiring

**Ny ren modul `verktyg/granssnitt-drift.mjs`** (konsol/urval-precedensen —
sviten importerar DEN RIKTIGA koden offline):

- `urlForstaCss(html)` — första stylesheet-href ur Next-HTML (attribut-
  ordningsrobust); null när markören saknas (dömer ALDRIG blockerande).
- `ärInfraStatus(status)` — infra-klassens statusordförråd ur vaktens egna
  grenar: `http 5xx` · `stil-lös` · `delresurs-fel` · `icke-sida (json 5xx)`
  · `net::ERR_/ERR_CONNECTION/ECONNREFUSED`. ÄKTA klasser (ok, kontrast/
  överflöd/klippt via felAntal, 429/json 2xx, sidspecifik timeout) räknas
  EJ.
- `börAvstaMätning({lasUpptagen, basSida, basCss})` — pre-gate-dom med
  orsakstext ("deploylås upptaget" · "bassidan svarar N" · "basens CSS
  svarar N (tillgångslagret sjukt)" · "basens CSS kunde inte hämtas").
- `driftVerdiktor({kombinationer, takProcent=30, minSidor=3})` — tak-dom:
  andel infra-KOMBINATIONER ≥ tak PÅ ≥ minSidor OLIKA sidor (·-split för
  admin-flikrader) ⇒ artefakt.

**Tunn wiring i `verktyg/granssnittsvakt.mjs`**:

1. `basHalsa()` → `{sida, css}`: sidan 200 + första CSS-länk hämtas; CSS
   non-200/kast = SJUK bas. `deployPagar()`/`vantaPaFriskBas()` går igenom
   `börAvstaMätning` — ett låsfritt fönster med CSS-död tillgångsservering
   är nu avbrottstecken, inte fyndgrund.
2. Pre-gate/avbrottsstatus ÄRLIGA: `uppskjuten — drift (orsak)` /
   `avbruten — drift (orsak)` när orsaken inte är låset — nyckelorden
   UPPSKJUTEN/AVBRUTEN bevaras i stdout/status så cron-wrapperns klassläsning
   (o85, syskonens yta) fungerar orörd.
3. **Drift-tak EFTER svep**: ≥ `GRANSSNITT_DRIFT_TAK` % (default 30) infra-
   kombinationer på ≥ `GRANSSNITT_DRIFT_MIN_SIDOR` (default 3) sidor ⇒
   `rapport.status = "driftartefakt — …"`, `rapport.drift`-block (andel/
   sidor/tak för driftsläsaren), `rapport.fel = 0`, tydlig DRIFTARTEFAKT-rad
   på stdout, exit 0 (våg 142-doktrinen: drift larmar ej som defekter).
   Rådata bevaras i kombinationer; journalförda ok-sidor står kvar (de är
   faktiskt mätta).

## §4 Bevis

- **Svit `verktyg/testa-granssnitt-drift.mjs`: 45 PASS · 0 FAIL, exit 0.**
  Inkl. REPLAY: D1 dagens rotfall (96 kombos, 100 % infra, 24 sidor ur
  rapportens verkliga sidlista) ⇒ drift; D2 o81:s äkta fyndsvep T2330
  (81 ok + 66 admin-flik + 5 timeout, 0 infra) ⇒ EJ drift; D3 grönt svep
  ⇒ EJ drift; D4 ÄKTA enstaka siddefekt (1 sida av 24) ⇒ EJ drift — taket
  maskerar ALDRIG en äkta siddefekt; D5 tröskel exakt 30,0 %/3 sidor ⇒
  drift; D6 småsvep 67 % på 2 sidor ⇒ EJ drift (sidglovet); D9 admin-flik-
  rader ·-splittas till 1 sida. Källkontrakt W1–W8: import, driftVerdiktor-
  anrop, överridningar, urlForstaCss i basHalsa, UPPSKJUTEN/AVBRUTEN-
  nyckelord (o85-kompabilitet), DRIFTARTEFAKT-rad, fel-nollställning.
- **Regression**: testa-granssnitt-urval 14/14 · testa-granssnitt-konsol
  14/14 (båda gröna, oförändrade).
- **Levande bevis på läkt prod** (RAM-fönster öppet 1 249 MB via
  ram-grind): SNABB-svep mot localhost `--tema=bada` = **0 fynd bland 12
  kombinationer, exit 0** — nya pre-gaten felar inte frisk prod (CSS-
  markören hittad + 200), taket triggar inte. Rapport
  `granssnitt-2026-09-19T0621.json`.
- `node --check` × 3 (modul, svit, vakt) · `node node_modules/typescript/
  bin/tsc --noEmit` = exit 0 (src/ orörd).

## §5 Gränser, medvetna val

- Drift-taket kasserar svepet men dömer INTE orsaken — tillgångsfel ägs av
  prod-synk/kraschvakten (byggen får fabriksbarn ej äga). Rapporten bär
  rådata + drift-block för driftsläsaren; DRIFTSBOKEN-noten (nedan) är
  hänvisningspunkten.
- Basens CSS-markör saknas (t.ex. framtida CSS-arkitektur utan link-taggar)
  ⇒ pre-gaten dömer ALDRIG blockerande (A5) — taket efter svepet tar
  restrisken. Fail-safe-riktning: mät hellre än hoppa över.
- Ett svep med 2 trasiga sidor under taket larmar fortfarande som fynd —
  medvetet (småsvep/riktade mätningar ska inte kasseras av glovet).

## §6 Bokningar (ej ägda här)

1. **Till o85-ägaren (cron-wrappern)**: lägg gärna en grep-rad för
   `GRÄNSSNITTSVAKTEN: DRIFTARTEFAKT` — annars loggas artefaktsvep som
   "GRÖN — 0 fynd (fullt svep)" (klassen exit 0 är korrekt, texten
   missvisande). Wrapperns yta lämnad orörd (syskon double-claimar o85).
2. Pre-gatens "uppskjuten — drift"-status loggas av dagens wrapper som
   "deploy pågår"-text — kosmetik, klassen (inget mätt) stämmer.

## §7 Kollisionsreda

o85 double-claimat av syskon u2 (grannmanifest, 06:12Z) och u1 (mitt
manifest) — deras ytor (granssnittsvakt-cron.sh, testa-granssnitt-cron-*)
rörda INTE av denna våg; noll filöverlapp. o81:s äkta fyndkurer (kontrast)
berörs ej — D2-replayen bevisar att den klassen fortfarande larmar.
Nummerläsning före reservation: o84 senast committade, o85 reserverat på
disk, o86 ledigt.
