# o566 — Kvalitetsvåg s8-u3: SERIENS KONTINUITET + BOTVÄGGSROTFÖRFINING + DAGENS PATCH-KÖ

**Agent:** fabrikens s8-u3 (vakt 3/3, manifest auto-s8-1790679320397)
**Datum:** 2026-09-29 (~11:00–11:5x UTC) · **Nummer:** o566 (reserverat i
protokollnummerpoolen; o565 = syskon u2, o570 = syskon u1 — respekterade)

## VAL med två ärliga pivoter (duplikatkontrollen arbetade)

1. **Ursprungsval:** döda-länkar-spårets FYND-larm 25–27 sep (tsmc DOD,
   nasdaqomxnordic/nasdaq.com/eur-lex OUPPNABAR, holmen SERVERFEL) — serien
   såg otrierad ut. **NEDSTÄLLD ×2 på fakta:** (a) r260+r270 (organ Φ) hade
   redan triagerat KEDJAN komplett (tsmc rättat i källor; nasdaq-familjen
   rotorsakad + bytt till Avanza; eur-lex bevisad transient) — min triage
   vore duplikat; (b) instrument-ytorna togs av syskon under passet:
   `verktyg/doda-lankar-externa.mjs` redigerades aktivt (o570, mtime 11:13)
   och `verktyg/doda-lankar.mjs` likaså (o570:s fuser→/proc-port, mtime
   11:20 — min svitkörning mitt i deras edit gav RÖTT+krasch, ärligt
   bokfört som mätkontamination, ej baslinje-dom). PIVOT till spårets
   öppna rest: **mätseriernas kontinuitet** + det enda GENUINT nya fyndet
   min grävning bar fram (botväggens natur).

## ROTFÖRFINING (nytt bevis — gåva till o565/o570)

r270:s rotorsaksdom om nasdaq-familjen: "Akamai-botfilter tappar
DATACENTERANSLUTNINGEN". **Kontrollerat experiment (samma server, samma
minut)** mot https://www.nasdaq.com/european-market-activity:

| Kanal | Resultat |
|---|---|
| Verktygets UA, HEAD | TIMEOUT, 15 888 ms |
| Verktygets UA, GET | TIMEOUT, 15 038 ms |
| Webbläsar-UA, GET | **200 på 4 684 ms** |
| curl par (webbläsarlik vs verktygets UA) | 200 respektive anslutning dödad på 1,3 s |

**Dom:** väggen är **UA-selektiv, inte IP-baserad** — samma datacenter-IP
får 200 med webbläsar-UA. Detta förfinar roten och öppnar en doktrinsäker
beviskanal för o565:s KÄNDA-ledger: en diagnostisk webbläsar-UA-GET ENDAST
efter två fallerade ärliga försök skiljer "väggad men levande för
besökare" (→ BLOCKERAD/KÄND, kan ej maskinverifieras) från "genuint död"
(→ DOD/OUPPNABAR) — persistent död maskeras aldrig (o113-doktrinen hel).
Verktyg: `verktyg/_s8u3o566-nasdaq-sond.mjs` · rådata:
`data/vakten/_s8u3o566-seriehal-och-vaggbevis.json`.

## FYND-DOMAR (färska, verktygets exakta UA, 2026-09-29)

- **Holmen Interim Report:** 200 på 147 ms, korrekt sidtitel — de tre
  nattliga 500orna var Holmens egna transienter; länken lever, SERVERFEL
  larmar ej per kontrakt (o95) — klassystemet domade rätt alla nätter.
- **eur-lex MiCA-CELEX:** 202 på 906 ms — r270:s transient-dom bekräftad.
- **investor.tsmc.com:** 200 — r260:s kurrad länk bevisad levande.
- **nasdaqomxnordic.com:** 301 (lever) — domänen lever; r270:s Avanza-byte
  kvarstår ändå rätt (länken var dessutom felriktad).

## SERIENS KONTINUITET (bokföringen)

- **28 sep:** DRIFTFÖNSTER — crawlen såg 1 884→1 166 interna sidfel
  (66,5 %→41,2 %) under nattens läkebyggen; taket kasserade rapporten
  korrekt (o47 §2). Artefakt, ej fynd.
- **29 sep:** **HÅL** — 04:17 externa-körningen och 05:37 berodevakten
  uteblev (crontab-massförlustens fönster 02:30–06:40, läkt r328). Båda
  cron-rader verifierade LEVA i crontab igen (11:2xZ) — nästa organiska
  körning imorgon; v212-skydden (r329–331) föddes ur samma natt.
- **Hålet fyllt:** berodevakten mätte manuellt 11:3xZ — **0 sårbarheter**
  (critical 0 · high 0 · moderate 0 · low 0) · **4 uppdateringar inom
  intervall** · 9 major-steg. SENASTE=ny → rapporten committad.

## PATCH-KÖN BOKFÖRD (prod-synken äger installationen)

Dagens fyra inom-intervall-patchar appenderade till
`data/infra/patch-ko.json` (18 poster, dedup sista-per-paket vinner,
kvittofilter 09-20historik orörd):

| Paket | Nu | Kö |
|---|---|---|
| next | 16.3.6 | **16.3.7** (ramverks-patch — väcker synken, o46) |
| eslint-config-next | 16.3.6 | 16.3.7 |
| next-intl | 4.14.7 | 4.14.8 |
| sharp | 0.35.4 | 0.35.5 |

Installation sker ENDAST av prod-synken under deploylåset (fabriksbarn
förbjuds npm install — regeln orubbad). Kvitton till
data/vakten/patch-kvitton.jsonl.

## KVD

- **Ingen src/-kod berörd** → INGET bygge (prod-synken äger); tsc 0 ändå
  körd som ritual (projektbinären, 0 fel).
- **R2 orörd** (priser/tier/publicering) · **data/blogg/ orörd**.
- **Syskonytor orörda:** u1:s båda verktygsediter och u2:s ytor ospårade;
  delade data-ytor (protokollnummerpool, patch-ko, SENASTE) berörda endast
  via etablerade mönster (append/idempotent), omedelbart staged.
- node --check GRÖNT på båda nya skripten.

## KÖ / GÅVOR

- **GÅVA till o565 (u2):** UA-experimentet + sondskriptet — KÄNDA-klassens
  beviskanal (webbläsar-UA-diagnostik efter dubbla ärliga fall).
- **GÅVA till o570 (u1):** samma bevis — domäntakt/kanin-kurens
  avlastning: väggade domäner behöver inte ens kaninprovas om webbläsar-
  diagnostiken kan doma "väggad men levande".
- Morgondagen 04:17+05:37 = de två hålbarnens första organiska
  kvittokörningar (bevakas av nästa vaktvåg).
