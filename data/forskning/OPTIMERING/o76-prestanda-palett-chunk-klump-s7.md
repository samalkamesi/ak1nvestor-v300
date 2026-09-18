# O76 — Prestanda: palett-chunk-klumpen kurerad — VarumarkesLogo ur kommandopalettens chunk-graf (17,7 KiB ur initial load på alla SeoPageShell-sidor)

**Spår 7 · s7-u2 (manifest auto-s7-1789770919187, byggare 2/3) · 2026-09-19 00:39–0:5x lokal**
**Status: KUR LEVERERAD (commit 295ce77c, tsc 0, grinden grön) — EFTER pending prod-synken.**
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

## §4 Deploy + EFTER (pending)

- Commit **295ce77c** på develop; pre-commit-grinden passerade.
- Push: `git push prod develop` felade — **remote "prod" existerar ej**
  (remotar: contabo/origin; AGENTS.md:s push-mönster är arv). Verifierad
  mekanism: prod-synken pullar `--ff-only /home/ak1a/AK1 develop` (syskon-
  loggar: "NY KOD: → ny commit") — **commit i trädet räcker**; inget eget
  bygge (fabriksregeln hölls).
- EFTER-kriterier när synken deployat: (a) script-taggen 3-bylxy1ipbmj BORTA
  ur HTML på /kurser+/blogg+/om-oss; (b) palett-koden hämtas först vid
  8 s+idle/öppning (nätverkstid i EFTER-trace); (c) prod 200 ×3 https;
  (d) Lighthouse /kurser+/blogg i jämförbart fönster (SEQ-grind chrome=0;
  förväntan: −1 request, −17,7 KiB transfer; CPU-tal med lastband).

## §5 Rest + läxor

- Om Turbopack ändå behåller en klump (t.ex. via lib/meny-register som delas
  med Huvudmeny): nästa steg = samma kirurgi på meny-register-gränsytor —
  men först EMPIRISK EFTER-koll (o63-disciplinen: data före skalpell).
- 0el5nt6 (Next error-overlay, 12,9 KiB rå, ~350 ms CPU i lastfönster)
  emitteras med fetchPriority=low i prod — konfig-yta, bokas till drift/
  huvudagent (ramverkets egna).
- Style & Layout 1 215 ms på /kurser (mainthread) — sonderingsvärd köpost.
- 2feezv-bootstrap 1 135 ms scripting = o45 §1-klassen (huvudagenten).

## §6 Metod och ärlighet

FÖRE-källa delad ärligt: s7-u3:s 00:40-trio (deras namnrymd, orörd av mig) +
egna HTML-curl ×6 + chunk-grep; mitt fönster var lastigt (syskonmätning
pågick — SEQ-respekterad, egna Lighthouse väntades men utrymme togs av
kirurgin; före-talen bärs av strukturbevisen som är lastokänsliga:
script-taggens närvaro/frånvaro + transferstorlek). Deployägarskap:
prod-synken (ALDRIG eget bygge). R2 orörd; data/blogg/ orörd; syskonytor
orörda (u1:s /ar-prefetch, u3:s rådatafiler).
