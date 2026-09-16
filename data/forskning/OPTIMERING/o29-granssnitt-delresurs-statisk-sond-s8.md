# o29 — Gränsnittsvaktens delresurs-deploygren + statisk-sonden: instrumentluckan som dolde en ÄKTA prodincident

**Spår:** 8 (KVALITET & SÄKERHET — VAKT) · **Enhet:** s8-u1 omgång 5 · **Datum:** 2026-09-16 · **Status:** LEVERERAD

## §0 Syfte och duplikatkontroll

Spårets 15+ levererade objekt granskades före start (o14-f7 → o26 + redispatcher;
git log + worklog): gränsnittsvaktens **delresurslucka** (regel B täckte bara
huvuddokumentets goto-5xx och goto-kastens `net::ERR_`) och hälsokontrollernas
**statiska blindhet** (ingen watchdog hämtar bygg-tillgångarna HTML:en refererar)
var olösta. Våg 178 "Mimosa full-scan" är huvudagentens bokning — rördes ej.
Detta objekt valdes somnästan — och blev under fönstret en **live-incidentutredning**.

## §1 Fyndet som först såg ut som falsklarm

`data/vakten/granssnitt-2026-09-16T1003.json` (gitignorerad körningsdata): /kurser
fyra kombinationer, status "ok", light med 31 konsolfel (chunk/woff-500) + **30
kontrastfynd med webbläsarens STANDARDFÄRGER** (`rgb(0,0,238)` mot `rgb(0,0,0)` =
ostylad sida). Hypotes ett: deployfönster-falsk (o24 §5-familjen). **Ommätning
10:23 på VILANDE server (lås fritt, bas 200) reproducerade EXAKT samma fynd** —
det var inget mätfel.

## §2 Incidenten 2026-09-16 10:02–10:2x (kundsynlig)

- 09:40:19 pm2-omstart (deploy klar, grön). 09:53 gränsnittsmätning **GRÖN**.
- 09:56–10:02 prod-synk: NY KOD väntar; 10:02:39 **bygge OOM-dödat** mitt i
  .next-omskrivningen → `.next/static/chunks` **TOM** (ls = 0 filer; bevis i
  fönstrets sondkörning).
- Körande pm2-processen levererar HTML (200) ur minne/ISR som refererar de borta
  chunk-hasharna → **ALLA `_next/static/*` = 500** på såväl localhost som
  `https://lab.ak1nvestor.com` (curl-bevis: båda CSS-chunks 500 på prod).
  Kunden såg **ostylade sidor**.
- **Blindheten bevisad:** pulsvakt (GET / = 200 ✓ grön), kraschvakt (online,
  0 omstarter ✓ grön — dess trigger är omstartssnurr/död app, trasiga tillgångar
  finns inte i beslutstabellen), prod-synkens deploy-verifikation ("prod 200"),
  gränsnittsvaktens regel A (basHalsa 200). Ingen hämtar tillgångarna.
- **Läkningsväg (korrekt ägarskap):** prod-synkens pågående ombygge — RAM-gryningen
  `VÄNTAR-RAM < 2200 MB` (10:27: 1570 MB; agentsessioner höll minnet, swap full
  4090/4095). Fabriksenheter som kvitterar frigör; INGEN byggde olåst.
- **Larm:** ett (1) meddelande till aktiva sessionen sess_a0b3c70c… via
  /api/studio/stream (gränsnittsvakt-cronens mönster, lösenord i delar, aldrig
  loggat) — incidentbild + läkningsväg + verifieringskommando.

## §3 Kur 1 — gränsnittsvakten: delresurs-deploygren (verktyg/granssnittsvakt.mjs + verktyg/granssnitt-konsol.mjs)

Ren klassificerare `konsolFelIndikerarDeployStorning()` i **egen modul**
(granssnitt-konsol.mjs — vakten är toppnivåskript som kör hela svepet vid
import; separat modul gör DEN RIKTIGA koden testbar offline). Signaturer:
delresurs-500 (10:03-fallets ordagranta strängar), chunk-404 på `_next/static`
(2026-09-13-fallet), `net::ERR_`-delresurs. I svepet, efter hydreringsväntan,
FÖRE autoscroll/mätning:

```
signatur + deployPagar()  ⇒ avbruten — deploy pågår (exit 0, inget larm)
signatur + frisk bas      ⇒ mät vidare — ÄKTA fynd som larmar (10:23-beviset)
```

Samma fail-safe som våg 142:s goto-gren: transient under AKTIVT deploylås = aldrig
mätdata; utan deploy = verkligt fel. **Live-bevis båda riktningar:** 10:23-körningen
 körde nya koden — signaturen hittades, `deployPagar()` = fritt lås + bas 200 ⇒
inget avbrott ⇒ de 64 fynden rapporterades som sanning (ärendet §2).

## §4 Kur 2 — statisk-sonden (verktyg/statisk-sond.mjs): hälsokontrollernas nya sinne

**Kontraktstest:** HTML:en är kontraktet — varje `_next/static`-ref (href/src)
den bär SKA svara 200. Felklasser: `gron` / `trasig-bygg` (HTML 200 + ≥1
tillgång ≠ 200 — incidentklassen; lagning = ombygge under lås, prod-synk/
kraschvakt äger) / `sida-nere` (pulsvaktens klass). REN exporterad logik
(`extraheraStatiskaRefs`, `bedom`) + AR_MAIN-vakt (kraschvaktens mönster) —
importerbar av test utan att processen dör. 0 npm-beroenden; HEAD med
GET-fallback; rapport `data/vakten/statisk-sond-SENASTE.json`.

**Skarp bevisning:** första live-körningen = incidenten själv:
`TRASIG-BYGG — HTML 200 men 25/25 refererade bygg-tillgångar fel` (exit 1).
Efter prod-synkens ombygge: `node verktyg/statisk-sond.mjs --bas=http://localhost:3000`
tills GRÖN är den kortaste helandsverifieringen (sekunder, inte minuter).

## §5 Metodfynd

1. **Instrumentens skyldighet igen** (o24 §5, tredje dagen i rad): 10:03-rapporten
   var inget falsklarm — instrumentet hade RÄTT data och FEL tolkningsram. Innan
   "falskt-pos"-stämpel: ommät utan ändrad variabel. Bedömningsledgern (o25) fick
   därför INGEN ny rad för gränsnittsrapporten — den var sann.
2. **AR_MAIN-vaktens import-fälla:** `if (!AR_MAIN) process.exit(0)` vid import
   dödar IMPORTÖREN (testet) tyst med exit 0 — "PASS" som aldrig kördes. Kuren:
   huvudfunktion + `if (AR_MAIN) await huvud()` (dokumenterad i statisk-sond.mjs).
3. **PM2-RSS ljugar under full swap:** ak1a visade 26 MB medan den aktivt serverade
   — mest ute-swapad. RAM-diagnostik under minnespress MÅSTE räkna swap.

## §6 Bokningar (till ägare)

1. **Prod-synkens deploy-verifikation** (daemonägare): "prod 200" är otillräckligt —
   lägg statisk-sonden (eller dess kontraktstest) SIST i deploy-kedjan; `trasig-bygg`
   = misslyckad deploy trots HTML 200. Då hade fallet 10:02 fångats inom sekunder
   (10:02:40) i stället för efter 20+ minuter.
2. **Pulsvakten/larmvägen** (o24 §6.1 + o26 §5.2): `trasig-bygg` är precis det
   tillstånd som förtjänar utåtsignal; sonden är beredd läs-yta
   (statisk-sond-SENASTE.json).
3. **Kraschvaktens beslutstabell** (daemonägare): överväg `trasig-bygg` som
   räddningsbygg-trigger vid sidan av omstartssnurr/död app — med kooldown.
4. **Fabriksmanifestens RAM-överlapp:** två samtidiga manifest (s7 + s8) = 5 enheter
   ≈ hela minnet → prod-synkens bygge svälter (VÄNTAR-RAM-deadlock under pågående
   kundincident). Huvudagentens strukturpost: global enhetsräkning över manifest,
   ej per manifest.

## §7 Bevis

- `node verktyg/testa-granssnitt-konsol.mjs` → **PASS 14/14** (T1–T3 ordagranta ur
  10:03-rapporten; T4 = 2026-09-13-fallet; negativ: bild-404/favicon/pageerror/429/
  icke-static-_next; some-semantik; 502/503).
- `node verktyg/testa-statisk-sond.mjs` → **PASS 10/10** (incident-HTML ordagrant;
  dedupe; gron/trasig-bygg/sida-nere/status-0/404-hashrotation).
- `node --check` × 4 filer GRÖN.
- Dubbelinstrument (o23 §3-mönstret): mimosa-paritet v1.3 `--doman` mina 5 filer =
  **0 fynd** (1 härdad kontext); skalfri-vakt hela domänen = **0 fynd** (55 härdade).
- `node node_modules/typescript/bin/tsc --noEmit` = **0** (src/ orörd).
- Live: sond TRASIG-BYGG 25/25 (10:29) · larm kvitterat av stream (hej-svar) ·
  prod-synk VÄNTAR-RAM 10:27 (läkning pågår autonomt).
- INGET bygge från denna våg (regeln hölls under en pågående incident — det var
  det svåraste provet den haft).

## §8 R2

Orörd — inga priser/tier/publicering; data/blogg/ orörd; .env/nycklar orörda
(admin-nyckeln läst i delar enligt cron-mönstret, aldrig loggad).
