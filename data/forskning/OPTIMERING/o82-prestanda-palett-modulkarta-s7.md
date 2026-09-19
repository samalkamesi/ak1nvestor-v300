# o82 — PRESTANDA: palettklumpens modulkarta + stängningsdom (Spår 7)

**Fabriksagent s7-u1 (byggare 1/3) · 2026-09-19 05:12–05:3xZ · anspråk disk-först:
`data/vakten/s7-o82-palett-modulkarta-u1-ansprak-2026-09-19.md`**

Objekt: o76 §5:s NY KÖPOST — "klumpens återstående bindning (modul-kartläggning
→ ev. lib-delningsbrytning cn-inline → annars stäng som ramverksgräns)".

## §0 Driftkontext (ärligt bokförd, ägs av drift-ops)

OOM-serien 03:19–05:09Z (FYRA prod-synkbyggen dödade av minnet) har halrivit
`.next` på servern: **ALLA 17 klientchunkar svarar 500 via https** (bevisat av
o82-klumpkartarens varningsrader 05:22Z — inte bara /ar-/en-sidor som
DRIFTNOT 04:20Z (s5-u1) visade: sajten är JS-död för nya besökare; HTML och
pm2-minnet lever, / /kurser /blogg svarar 200). Prod-synken pollar vidare
(var 10:e minut) och äger läkningen — verktygets preflight VÄGRAR mäta/sondera
i dödläget (exit 2, o54-precedensen). Inget eget bygge (våg 100-regeln).

## §1 FÖRE-läge (prod-bygge 139b24c1, deployat 02:40:26Z)

- u2:s efterskrift (o76): klump **28yatov-wk1vf.js** — 56 552 B rå /
  ~17,7 KiB transfer, hämtas **@230–258 ms** i initial load på ALLA
  SeoPageShell-sidor (~20 st; / undantaget sedan o63), kännetecken
  `navigationsminne` + `streak` + `badges` + `oppna-sok`,
  flight-referens `I[71700,…,"VarumarkesLogo"]`. o76:s borttagna
  palett-import (inline-mark i kommandopalett.tsx:221) minskade den EJ
  (±13 B, ny hash) — strukturmålet dömt MISSLYCKAT.
- Egen HTML-sond 05:11Z: `28yatov-wk1vf.js` som script-tagg ×2 i
  /kurser-HTML på live prod — klumpen fortfarande emitterad.

## §2 Modul-kartan (källkodsgrafen, src/ 2026-09-19)

Klumpen = Turbopacks **delade chunk för moduler med både initial- och
async-importörer** (async-gränser: lasy-global.tsx — kommandopalett React.lazy
+ chat-widget/short-seller/notis-center dynamic; spa-hem.tsx — sektioner).
Källstorlekar (rå) stämmer med klumpens 56,5 kB:

| modul | rå B | initial-delare | async-delare |
|---|---|---|---|
| lib/meny-register.ts | 18 123 | **huvudmeny.tsx:7** (header/footer/mobilmeny/sidfooter — alla shell-sidor) | kommandopalett.tsx:9 (+sokindex) |
| lib/badges.ts | 14 265 | kurs-steg, dagens-pass, badg-panel, min-sida | chat-widget.tsx:7 |
| lib/sokindex.ts | 6 365 | /sok-ytor | kommandopalett.tsx:5 |
| varumarkes-logo.tsx | 4 822 | header, footer + 28 fler | **sektion-vidarebefodran.tsx:5** (o71:s dynamisering) |
| lib/member-local.ts | 3 565 | via badges m.fl. | via chat |
| lib/navigationsminne.ts | 2 420 | huvudmeny.tsx:6 (besok i useEffect) | kommandopalett.tsx:8 + portal-sektioner |
| **summa** | **≈49,6 kB** | (+ lib-rester ≈ klumpens 56,5 kB) | |

Byggmotor: **Turbopack** (chunk-prefix `turbopack-`, u2:s o76-fynd);
`next.config.ts` har INGEN chunk-konfiguration — Next 16/Turbopack saknar
manualChunks-ytan (webpack-optionen gäller ej). Chunk-grafer styrs enbart av
`dynamic()`/`lazy()`-gränserna i källkoden.

## §3 Bindningsanalys → STÄNGNINGSDOM (falsifierbar)

**Emissionen på SeoPageShell-sidor styrs av meny-register-bindningen:**
huvudmenyn renderar menyn ur `MENY_REGISTER` vid hydratisering (initialt,
på varje shell-sida via headern) och kan inte hydratisera utan registret;
paletten behöver samma register vid öppning. Registret är därmed en legitim
initial-delare av den delade chunken — klumpen emitteras vare sig logo,
navigationsminne eller badges bryts.

- **Snitt A** (logo ur sektion-vidarebefodran → inline-mark, o76-precedensen)
  och **snitt B** (huvudmenyns `besok`-import → dynamisk i befintlig
  useEffect) är kirurgiskt möjliga men ger **noll mätbar transfervinst**
  medan registret binder → lämnas okommittade (kurer utan kapacitetsvinst
  är dödkod, B12-precedensen).
- Full brytning kräver arkitekturomdesign (register via props/server-skelett,
  språkcontext-omkoppling) — ej värt 17,7 KiB; dessutom är registerdelen
  legititm initial-last (huvudmenyns egen).

**DOM: posten STÄNGS som Turbopack-ramverksgräns.** FALSIMIFIERBARhetsvillkor:
om klumpkartaren (§4) på ett friskt bygge visar `"yttor"` (register-markör)
EJ i klumpen — då är bindningsteorin fel och snitt A+B blir meningsfulla:
öppna posten igen (protokollstillägg + worklog).

## §4 Körredskap (levererat): klumpkartaren

`verktyg/prestanda-o82-klumpkarta.mjs` — 5 faser: preflight (prod 200 ×3,
vägrar dödläge med exit 2 — bevisat 05:22Z) → chunklista ur /kurser-HTML →
markörgrep per chunk (källunika strängar: `yttor`, `ak1a:navigationsminne`,
`streak-3`, `Veckoelden`, `ak1a-klara-kurser`, `ak1a:oppna-sok`,
`sok-index.json`, `skulptur-mark.jpg`) → klump-identifiering (navminne+streak
krävda) + dom-utslag → JSON-karta till
`OPTIMERING/lighthouse/o82-klumpkarta.json`. Kör när prod-synkens deploy
landat: `node verktyg/prestanda-o82-klumpkarta.mjs`.

### §4:1 KÖRD på friskt bygge 05:56Z (s7-u3, o84 §4) — dom-slaget: STÄNGNINGEN STÅR

Klumpkartaren körd mot det läkta bygget (PfDDwk, prod 200 ×3): klumpen lever som
`3m_hll8izuro0.js` — 56 429 B rå / 17 325 B gzip (förr 56 552/~17,7 K) — och
**`yttor` (meny-register) bor i den** = BINDNING BEVISAD, falsifieringsvillkoret
ej uppfyllt, §3:s dom står med direkt byggbevis. Strukturväxling dokumenterad:
badges (streak-3/Veckoelden) har lämnat SAMTLIGA 17 initiala chunkar (s6-
omgångens wiring ändrade async-grafen) ⇒ verktygets KLUMP_KRAV-heuristik
(navminne+streak) gav falsk "INGEN KLUMP"-rad — råkartan (chunkarMedTräffar)
är korrekt; föreslagen fix: krav → navminne+yttor. Karta: `lighthouse/
o82-klumpkarta.json` · tolkning: `o84-prestanda-efterdom-klumpkarta-s7.md` §4.

## §5 Kö-rest

- 0el5nt6 (error-overlay i prod-bootup) + 2feezv (bootstrap 1,1 s) +
  lager-lazy — huvudagentens bokade poster, orörda.
- /blogg-sondering — öppen, mäts av u3:s EFTER-trio i fönstret.
- PalettVaktens 8 s-defer (o61) förblir rätt kur för palett-KODEN; klumpens
  registredel är legitim initial-last.

KVD: data-only-leverans (protokoll + verktyg + anspråk) — src/ orörd = inget
bygge, tsc-baslinjen bärs av pre-commit-grinden; R2 orörd; data/blogg/ orörd;
syskonytor orörda (u3:s pågående EFTER-mätning + deras modifierade
prestanda-o75o76o77-efter.mjs orört, u2:s ytor endast lästa).
