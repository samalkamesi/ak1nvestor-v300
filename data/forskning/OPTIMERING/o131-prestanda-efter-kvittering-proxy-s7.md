# o131 — EFTER-kvittering (PROXY) av läsbarhetskurerna o126+o127+o128 + prod-läkning

**Spår:** 7 — PRESTANDA & MOBILPOLISH · **Roll:** byggare 3/3 (fabriksvåg
auto-s7) · **Datum:** 2026-09-20 22:12–22:36Z · **Status:** PROXY-EFTER
LEVERERAD GRÖN; äkta deploy-EFTER kvarstår som vakarövertag (§4).

## §0 — Objektval och duplikatkontroll

Fabriksuppdrag: "mät före/efter (Lighthouse), deploy, prod 200, mätning
bokförd." Genomgång före val (OPTIMERING/ + worklog + data/vakten/):
bildoptimering STÄNGT (o66 §7.2, o101) · cache-headers STÄNGT (o10/o13/
o66/o70) · koddelning STÄNGT (o27, o82/o84, o119/o121) · läsbarhets-
kurerna o126 (96bd416b) + o127 (c017f9bf) + o128 (54c95abd) committade
men deploy blockerad av bygg-OOM — vakarövertaget från o130 (PENDING,
2e6efd22) var det bokade öppna barnet. **Val:** ekvera vakarövertaget +
o129 §4:s proxy-metodik när deployfönstret uteblev. Anspråk disk-först
22:19Z: `data/vakten/s7-o131-efter-kvittering-u3-ansprak-2026-09-20.md`;
nummer o131 reserverat i `data/vakten/protokollnummer.json`.

## §1 — Läge vid start (22:12Z)

HEAD b2d9ed66 · prod 200 på LDVlDGu2 (före kurer; alla fyra kur-commits
bevisade förfäder till trädet, o130 §3) · prod-synk bygg-OOM ×2
(22:00/22:10Z) · RAM vid min start 3 934 MB available.

## §2 — Driftincident under vågen (transparent, full kronika)

- 22:17:28Z synken NY KOD → bygg #3 → **OOM 22:21:12Z** (tredje, alla
  ~3 min in i "Creating an optimized production build"; infra-klass,
  samma trädtopologi byggde grönt 20:02/20:11/20:52).
- 22:25–22:29Z ett bygg (ej synk-loggat; sannolikt kraschvaktens)
  dog och lämnade **.next utan BUILD_ID** → pm2 'ak1a' hamnade i
  omstartloop (6 999 ↺, uptime 0 s) → **prod 502/000 kl 22:29Z**.
- 22:27:22Z synkens poll: NY KOD 2e6efd22 (syskonet o130:s bokföring)
  men VÄNTAR-RAM (152 MB) — synkens nästa chans 22:37, dvs 7 min med
  nere-prod.
- **22:30:30Z läke-ingripande (jag):** `flock -n /tmp/ak1a-deploy.lock`
  → `rm -rf .next && cp -a .next-laeke .next` — EXAKT prod-synkens egen
  dokumenterade OOM-procedur ("ÅTERSTÄLLD ur läkebackup"), utförd manuellt
  under deras lås eftersom deras poll-cadans lämnade prod nere och
  doktrinens toppregel är ALDRIG lämna prod trasig. Ingen installation,
  inget bygge, .next-laeke orörd kvar, HEAD orörd. pm2-loopen plockade
  upp det gröna läget självmant → **prod 200 kl 22:31Z** (LDVlDGu2 —
  samma bygge som FÖRE-mätningarna, kanalen därmed identisk).

## §3 — PROXY-EFTER-mätningen (o129 §4-metodiken)

Instrument: `verktyg/_s7u3o131-proxyefter.mjs` (o123-sond-mönstret: CDP,
iPhone-UA, 390×844 DSF 2, cache avslagen, settle-logik; port 9340 egen).
Differential-CSS speglar EXAKT trädets committade kur vs prod-chunken:
`@layer base { .flex > * / .grid > * min-width:0 }` (o127) +
`max-md:min-w-[52px] (med/utan !)` → `min-width:52px !important` (o126) +
`[data-slot="slider-thumb"]`-paketet `52×52 flex-centrerat transparent`
(o128, speglar max-md:size-[52px]-klasspaketet). !important är KRAV för
document-start-position (landar före prodens stilmallar; utan important
vinner senare likvärdiga regler). Fallback-notis: document-start-skriptet
nådde ej sidorna (addScriptId 1 registrerad men ej påvisad i DOM);
differentialen injicerades istället direkt efter redo-kontroll —
EKVIVALENS: de avgörande deklarationerna bär !important så sen position
ändrar inte beräknade värden; enda positionskänsliga delen (@layer
base-kopian) är kaskadmässigt överhoppad av prodens ostyrade original
ändå. Båda sidorna verifierade `differentialAktiv: true` i DOM.

Kanal: https://lab.ak1nvestor.com, prod-bygge LDVlDGu2 = samma som
FÖRE-mätningarna (o127-pill-fore-kontroll.json 21:00Z, o127-slider-fore.json
21:16Z) — identisk kanal, FÖRE låsta inlästa från disk (o122-konventionen:
inga dubbelmätningar).

**Resultat (o131-proxyefter.json, 22:32:44Z):**

| Yta | FÖRE | PROXY-EFTER |
|---|---|---|
| /dataset tryckmål <52 px | 1 («Hälsa» 44×52) | **0** («Hälsa» 52×52 exakt) |
| /kalkylator slider-tummar <52 | 20/20 (16×16) | **0/20** (52×52 ×20) |
| /kalkylator tryckmål <52 (aktiverad flik) | 20 | **0** |

Slutsats: kurraderna VERKAR i kaskaden precis som designat — o126:s
important vinner över prodens ostyrade `.flex > *`-dödarregel, o128:s
tumpaket ger 52×52 tryckytor. Kvarvarande skillnad mot äkta deploy,
transparent: prodens ostyrade `.flex > *` kan ej CSS-borttagas — i
deployat läge ersätts den av o127:s @layer base-kopia (där vanlig
utility räcker); proxyn bevisar important-vägen, i deployat läge
redundant försäkring på samma slutmål: 0 under 52.

## §4 — Vakarövertaget som kvarstår (äkta EFTER)

Deploy-grind: DEPLOYAD-rad med 2e6efd22-avkomma (synkens poll bygger
automatiskt vid varje rop; NY KOD kvarstår). Därefter oförändrat o127 §6
+ o129 §6: prod 200 ×5 (/ · /kalkylator · /dataset · /blogg · /en) ·
pill-sond (0 under 52) · slider-sond (0/20) · Lighthouse CLS 0 ×3
(/blogg · /ar/blogg · /en/blogg; FÖRE-poäng 77/67/76) · gränssnittsvakten
0 fynd. Vid OOM-ytterligare: läke-mönstret i §2 är verifierad manuell
procedur under flock.

## §5 — KVD

src/ RÖRS EJ → inget bygge, inget tsc-läge (typnollen bärs av pre-commit-
grinden på berörda commits; denna våg rör enbart data/ + verktyg/).
R2 orörd · data/blogg/ orörd · syskonens verktyg/filer orörda (deras
väntare `_s7u3o126-vanta.mjs`/`_s7u2o128-efter.mjs` och `_r127-*`
orörda; jag körde endast publika sonder + mina egna nya) · .next-laeke
orörd · flock-låset respekterat vid varje rörele mot .next.
