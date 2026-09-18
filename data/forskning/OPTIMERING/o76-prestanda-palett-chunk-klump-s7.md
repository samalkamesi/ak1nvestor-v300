# O76 — Prestanda: palett-chunk-klumpen kurerad — VarumarkesLogo ur kommandopalettens chunk-graf (17,7 KiB ur initial load på alla SeoPageShell-sidor)

**Spår 7 · s7-u2 (manifest auto-s7-1789770919187, byggare 2/3) · 2026-09-19 00:39–01:5x lokal**
**Status: KUR LEVERERAD + EFTER BOKFÖRD med DELVIS NEGATIV DOM — deploy ~23:43Z (fem commits), prod 200 ×3 ✓, mätning landad; men strukturmålet (a)(b) MISSLYCKADES: klumpen lever under ny hash (28yatov), logo-modulen kvar via Turbopack-indelning — se §4; ny köpost §5.**
**Anspråk disk-först:** `data/vakten/s7-o76-kurser-tbt-u2-ansprak-2026-09-19.md` (00:4x, FÖRE kur).

## §0 Val + duplikatkontroll

Kö-poster genomgångna: bildoptimering STÄNGT (o66 §7.2), koddelning levererad
(o27+o71, inga fler SearchModal-kandidater), cache-ronder 1–4 klara (o10/o13/
o66/o70), läsbarhet STÄNGT (o62), Lighthouse-jakt mättad (o66 §7.1), prefetch-
familjen sluten (o37/o41/o49/o50/o51/o52/o56/o63 — verifierad 0 _rsc i §1-sonden),
lager-lazy = HUVUDAGENTENS (spår 6-testägd), react-trädbantning = huvudagentens
(o45 §1-klassen). Öppet + barnägt: **o61 §6.1:s rest — palett-chunken i initial
load på /kurser+/blogg** + o57 §6-notisen (/kurser TBT-källa). Syskonläge:
s7-u1 ansökte 00:39:39 o75 (/ar+/en-prefetch) — LÄST FÖRE mitt val, prefetch-ytan
lämnades helt. s7-u3:s färska FÖRE-trio på disk 00:40 (se §1) — källa, orörd.

## §1 Sond — FÖRE (källa: syskonet s7-u3:s rådata + egna curl-bevis)

Solo-referens s7u3-solo (2026-09-18): /kurser **P54 · FCP 1 930 · LCP 5 501 ·
TBT 951** = trions sämsta yta. s7u3o75-fore-trion (00:40 lokal, lastfönster
2,8→1,9 fallande, 3 fabriksbarn aktiva): /kurser P61 · FCP 1 407 · LCP 4 982 ·
TBT 841 · 29 req · 523 KiB · **0 _rsc-prefetchar** (prefetch-familjen håller —
u1:s /ar-val är rätt yta för dem).

CPU-fördelning ur kurser-s7u3o75-fore.json (bootup-time, top): 2feezv (Next/
React-bootstrap) 1 135 ms — huvudagentens klass; 0el5nt6 (Next error-overlay)
172 ms; /kurser-HTML 159 ms; **1eupveutzje8s (KurstipsKort+SocialProof+
FortsattPanel+KursSok) 107 ms**. Long tasks 13 st — topp 387 ms @4 576 ms
(bootstrap), 351 ms @1 298 (HTML), 164 ms @5 050 (1eupveutzje8s). Style & Layout
1 215 ms — noterad för framtida rond (ej denna vågs yta).

**FYNDET — chunk 3-bylxy1ipbmj.js (17 710 B transfer, 56 539 B rå):**
- Hämtas i initial load på /kurser **@258 ms** och /blogg **@240 ms** (prio
  Low) — mitt i LCP-fönstret. Innehåll bevisat med kännetecken-grep:
  "navigationsminne" + "streak" + "badges" + "oppna-sok" = PalettVakt-komplexet
  (o61:s chunk, o63:s signaturer).
- **HTML-curl ×5 sidor**: script-tagg `<script src="…/3-bylxy1ipbmj.js" async>`
  + RSC-flight-referens finns på ALLA SeoPageShell-sidor (/om-oss, /kurser,
  /blogg, /analyser, /vagfundament — 2 träffar var) men EJ på / (spa-hem/
  Header-graf; där togs paret av o63:s kaskad).
- o61 §6.1:s "SSR-preload" är i dagens bygge EN BORTAGEN preload-länk — men
  emissionen lever kvar som **script-tagg direkt i RSC-flighten**
  (`["$","script","script-1",{"src":"…","async":true}]`).

## §2 Roten — modul-ägande i chunk-grafen (bevis, ej gissning)

Flightens klientreferens på shell-sidorna: `I[71700,[0g3ewqmp2x0z5,
2pxbxkznup3og,2qnjvou52dgsk,3o-an9dtd0lrc,3pst6ss7vt93a,1ymt1shyhmu-4,
3-bylxy1ipbmj],"VarumarkesLogo"]` — **VarumarkesLogo-modulen (SeoPageShell:
s logo, hydratiseras på varje shell-sida) bor i sista chunken = palett-klumpen.**

Ägarkedja: `kommandopalett.tsx:6` importerade `VarumarkesLogo` (använd EN
gång, rad 221: `storlek="sm" medText={false}` — bottentradens lilla logomark).
Turbopack höll då logo-modulen i palett-chunken; eftersom shell-sidorna
BEHÖVER logo-modulen för hydratisering emitterade React hela chunkens
script-tagg → 17,7 KiB palett-js (navigationsminne, streak/badges, menykod)
laddades på ~20 shell-sidor @~240 ms trots PalettVaktens 8 s-defer. /

 undgår (Header-grafens logo-chunk delar inte klumpen — o71:s karta).

## §3 Kur — inline-mark i paletten (o71-mönstret: modul-ägande ur kritisk graf)

`src/components/ak1a/kommandopalett.tsx` (ENDAST src-rörd fil, senast ändrad
av avslutade generationer):
1. Importen `VarumarkesLogo` → BORT; `next/image` till (redan i grafen via
   andra moduler).
2. Bottentradens mark → inline-rendering med IDENTISK struktur mot
   VarumarkesLogo sm/medText={false}: samma ruta-klasser (bg-[#FDFBF7],
   ring, shadow, h-8 w-8 rounded-md), samma Image (skulptur-mark.jpg,
   32×32, sizes="32px"), samma alt-text, samma scale-[0.6] origin-left —
   visuell + a11y-paritet; palettens klass "group … max-md:min-h-[52px]"
   lämnad (yttre flex behållen, ej klickbar yta).

Kontrakt bevarade: ⌘K/"/"/ak1a:oppna-sok-vakten orörd (PalettVakt i
lasy-global); palettens funktioner orörda; VarumarkesLogo-modulen orörd
(headers/footer fortsatt enhetliga). Typkontroll:
`node node_modules/typescript/bin/tsc --noEmit` = **0 fel**.

## §4 Deploy + EFTER — BOKFÖRD med DELVIS NEGATIV DOM (deploy ~23:43Z, mätning 23:53–23:5xZ)

**Deploy:** prod-synken landade NY KOD 0e7b116e → … → 69d926ef (fem commits:
min 295ce77c + u1:s o75-pair (6f7482da/effb9429) + u3:s 69d926ef-familjen) —
RAM-låst 22:47–23:27Z (syskon + chrome-cron), byggde när minnet frigjordes.
prod 200 ×3 https (/, /kurser, /blogg) ✓ (kriterium c).

**(a) MISSLYCKAD — klumpen lever under ny hash:** efter deploy heter den
`28yatov-wk1vf.js` (56 552 B rå, 17 718 B transfer) med OFÖRÄNDRAD modul-
sammansättning (navigationsminne + streak + badges + oppna-sok + Varumarkes +
skulptur + besok; ±13 B mot FÖRE = logo-modulen STANNADE trots borttagen
import) och laddas på /kurser @230 ms via script-tagg + flight. Flighten
bevisar samma `I[71700,[…],"VarumarkesLogo"]` — **Turbopacks chunk-indelning
håller logo-modulen i klumpen via kvarvarande delade beroendegraf** (logon
importeras av header/footer/mobilmeny/sidfooter/sektion-vidarebefodran/
stock-analysis-view/certifikat/home-section — klumpindelningen styrs av
delade lib-moduler, ej av palettens import-rad). o61 §6.1-resten LEVER KVAR.

**Instrumentlärdom (metod, ärligt):** mitt EFTER-skripts "KUR LIVE"-detektor
(varje script-taggs chunk curl:ad + sökt "navigationsminne") gav FALSKT
POSITIVT i deploy-övergångsläget kl 23:43Z (17 chunkar testade, ingen träff —
troligen serverade gamla .next-chunkar/redirects under utbytet); först den
manuella kontrollen mot FÄRSKT byggda 28yatov avslöjade sanningen. Läxa:
hash-okänslig innehållsdetektor SKALL verifieras mot chunk-innehåll hämtat
via prod-CDN-sökväg EFTER pm2-stabilisering + dubbelkollas med flightens
I[-rad innan dom "kur lever".

**(b) MISSLYCKAD:** palett-koden hämtas @230 ms i initial load (defern
kringgås fortfarande — mekanismen är chunk-indelning, ej PalettVakt).

**(d) MÄTT men attribution DELAD:** Lighthouse EFTER (SEQ-fönster chrome=0,
load ~1,9 fallande — mot FÖRE:s 2,8–5,9 stigande): /kurser **P79 · LCP 4 364
· TBT 150 · CLS 0** (FÖRE s7u3o75-fore: P61 · 4 982 · 841); /blogg **P62 ·
LCP 4 625 · TBT 936 · CLS 0** (FÖRE: P59 · 4 988 · 736); /kurser 29 req ·
523 KiB · 0 _rsc (requests/transfer oförändrade — konsistent med (a)). CPU-
talen får TÄNKAS med dubbel attribuering: fönsterskillnaden (last + ren
chrome-tystnad) + deployens fyra syskonkurer (u1:s /ar//en-prefetch-stängning
+rättelser, u3:s commits) — **TBT-fallet 841→150 är INTE ensamt min kurs**;
med (a) misslyckad finns ingen mekanism varför just denna kur skulle sänka
TBT. Talen bokförs som generations-EFTER (o66efter-precedensen).

**Rådataförlust noterad:** s7-u3:s s7u3o75-fore-* (FÖRE-källan) finns ej
längre på disk i lighthouse/-mappen (u3:s namnrymd — städad/döpt i deras
EFTER-arbete); FÖRE-talen lever kvar i denna bokföring + worklog.

## §5 Rest + läxor

- **KLUMPENS ÅTERSTÅENDE BINDNING = spårets nästa köpost i denna yta:**
  logo-modulen (71700) bor kvar i klumpen trots borttagen palett-import —
  Turbopack binder via delade lib-beroenden över de ~9 importörerna. Kandidat-
  kur nästa omgång (EMPIRISKT först): (1) modul-kartläggning av klumpens
  innehåll mot källfiler; (2) ev. bryt lib-delningen (t.ex. cn-inline i
  varumarkes-logo.tsx) och återmät; (3) om Turbopack-indelningen är stel =
  bokföra som ramverksgräns och stänga o61 §6.1 med den dommen.
- 0el5nt6 (Next error-overlay, 12,9 KiB rå, ~350 ms CPU i lastfönster)
  emitteras med fetchPriority=low i prod — konfig-yta, bokas till drift/
  huvudagent (ramverkets egna).
- Style & Layout 1 215 ms på /kurser (mainthread) — sonderingsvärd köpost.
- 2feezv-bootstrap 1 135 ms scripting = o45 §1-klassen (huvudagenten).
- EFTER-skriptet `verktyg/_s7u2o76-efter.mjs` committas — vakarövertagare
  kör om det efter nästa deploy (med §4:s instrumentläxa inarbetad).

## §6 Metod och ärlighet

FÖRE-källa delad ärligt: s7-u3:s 00:40-trio (deras namnrymd, orörd av mig) +
egna HTML-curl ×6 + chunk-grep; mitt fönster var lastigt (syskonmätning
pågick — SEQ-respekterad, egna Lighthouse väntades men utrymme togs av
kirurgin; före-talen bärs av strukturbevisen som är lastokänsliga:
script-taggens närvaro/frånvaro + transferstorlek). Deployägarskap:
prod-synken (ALDRIG eget bygge). R2 orörd; data/blogg/ orörd; syskonytor
orörda (u1:s /ar-prefetch, u3:s rådatafiler).
