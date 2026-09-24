# o120 — Spår 7: /en/blogg longtask-sond + TBT-fönstrets mekanik — anomalin rotförklarad, widget-hypotesen avförd

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1789915506445, fönster 2026-09-20 ~16:45–17:1x lokal)

## §0 Nummerbyte och kollision (öppet)

Anspråket skrevs ~16:46–16:47 som «s7-o118» (disk-först) — men s7-u2 reservede samtidigt o118 för sin CDP-longtasksond (u1:s o119-bokföring: «verktygsreservation 16:47») och s7-u1 levererade 16:58:28 KUREN som o119 (NastaSteg-widgeten ur kritisk hydratisering, 568a93a2 — «KOMPLEMENT till s7-u2:s o118-sond — detta är KUREN»). Denna våg omnumreras därför till **o120** (reservationsverktygets nummerkanal är enda vägen — läxan u1 bokförde ägs nu även här). Ingen duplikat: u2:o118 = rå CDP-sond med cpu-profiler (pågår), u1:o119 = KUREN (defer), denna våg o120 = trace-attribution + flight-sond + hypotesprövning med motbevis + FCP-timing-mekaniken + FÖRE-basen (651/547 på IxcwwO) som u1:s EFTER-kriterier (vakarövertag-barra) kan mätas mot.
**Anspråk (disk-först, FÖRE val):** `data/vakten/s7-o120-enblogg-longtask-sond-u3-ansprak-2026-09-20.md (skrivet som o118 ~16:46, omnumrerat i §0)`
**Objekt:** o110 §4.1:s bokförade köpost — "riktad /en/blogg-sond på vilofönster (longtask-snapshot per chunk, CDP) + ev. A/B med AI-Mentors-widgeten avstängd; hypotes: widgetens motorregister-hämtning i hydratiseringsfasen".
**Typ:** MÄT- OCH KARTLÄGGNINGSVÅG (o109-mönstret) — src orörd, INGET bygge; anomalin visade sig delvis självläkt och den kvarvarande skulden är arkitekturnivå (produktpåverkan) ⇒ öppet bokförd köpost, inte autonom kur.

## §1 Mätläge och FÖRE-tal

- Bygge i mätningstillfället: **IxcwwO_QWK5g7r0rfK5_M** (16:40, bär HEAD e4588c57) — nyare än o110:s W2XS0Ey.
- prod 200 ×5 https (/ · /blogg · /en/blogg · /ar/blogg · /en) ✓ · /en/blogg: `x-nextjs-prerender: 1`, `x-nextjs-cache: HIT` (force-static + revalidate 3600 lever).
- Lighthouse mobil 4G (npx, cache:ad — noll projektberoenden), localhost (loopback-regeln), sond enligt o110:s variant: kontrollmätning /ar/blogg i SAMMA fönster (kontamination träffar båda lika — o110:s eget /ar-blogg-argument).

| Sida | o110 (W2XS0, n=2–3) | **o120 (IxcwwO)** | Kriterium ≤500 |
|---|---|---|---|
| /en/blogg | 1 125/1 133/1 091 | **651 / 547** (n=2) | ✗ (nära) |
| /ar/blogg | 441/247 | **508** (kontroll) | ✗ (gräns) |
| CLS | 0 ×15 | **0** ×3 | ✓ |

Anomalins nivå (en−ar 786 ms i o110) är på aktuellt bygge **~90–140 ms** — huvuddelen av skillnaden har försvunnit med commit-strömmen mellan W2XS0→IxcwwO (fönstret bär bl.a. AI-Mentorn-vågorna, men dåsom DATAFILER — attribution ej isolerbar; ärligt bokfört). Ingen egen kur har landat mellan mätningarna: förloppet är drift/attributionsläge, inte orsakskedja.

## §2 Sonden — metod

Tre verktyg (prefix `_s7u3o120-`, oreviterat råmaterial i `verktyg/_o118-trace-tmp/` 16 MB — ej git; summeringar + fulla rapporter committade):

1. `_s7u3o120-analys.mjs` + `_s7u3o120-djup2.mjs` — djupanalys av o110:s BEFINTLIGA rapporter (noll ny last): longtasks per URL, mainthread-kategorier, nät, tidslinje relativt FCP.
2. `_s7u3o120-trace-sond.mjs` — äkta Chrome-trace via `--save-assets` (en n=2, ar n=1) + `_s7u3o120-trace-analys3.mjs` — normaliserad attribution: varje main-thread-task >60 ms med toppbarn (FunctionCall/EvaluateScript/ParseHTML/Layout/GC) inklusive url+rad; Lighthouse-gathererns EGET arbete (`_lighthouse-eval.js`, LocalWindowProxy/ScriptCatchup) filtrat som artefakt.
3. `_s7u3o120-flight-sond.mjs` — inline-RSC-flighten avescapad ur live-HTML (o45-mönstret) med läcksökare.

## §3 Fynd 1 — o110:s widget-hypotes är MOTBEVISAD (tre oberoende bevis)

Hypotesen var att AI-Mentors-widgetens motorregister-hämtning i hydratiseringsfasen orsakade /en/blogg:s monster-task:

1. **Nätverket:** identiskt mellan speglarna i samtliga rapporter (o110 + o118): endast `/api/medlem` (334 B) + `/api/trafik` (402 B) + manifest/favicon. INGEN motorregister-hämtning förekommer alls i mätningarna.
2. **Monteringstidpunkten:** `LasyChatWidget` (lasy-global.tsx) monteras först vid första interaktionen eller 8 s + requestIdleCallback — i Lighthouse-mätningen (inga interaktioner) tidigast ~8 s. o110:s monster-task låg vid 1,2–1,5 s och återsågs aldrig efter ~2 s. Widgeten kan strukturellt inte ha orsakat den.
3. **Attributionen:** monster-tasken (801/938 ms "Unattributable" i o110-generationen) låg i dokumentets eval-fas (inline-flight + tidig bootstrap), FÖRE React-hydrat-commit (2feezv-tasks ~3,9–4,6 s i samtliga pass).

A/B-delen av köposten (widget avstängd) blev därmed meningslös att köra: det finns inget widget-nätarbete att blockera i fönstret.

## §4 Fynd 2 — TBT-fönstrets mekanik: FCP-timing, inte payload

Pass-vis data (o118, samma träd, samma sekvens):

| Pass | FCP | TBT | Tidiga dokument-tasks som hamnar INOM fönstret |
|---|---|---|---|
| en-1 | 1 665 | 651 | @802/151, @1086/162, @1397/80, @1477/61, @1538/303 … |
| en-2 | 1 241 | 547 | @1242/234, @1000/82 … |
| ar-1 | 2 238 | 508 | @1500/76, @1668/226 … (fler tasks totala, men många FÖRE FCP räknas ej) |

TBT räknar endast tasks mellan FCP och TTI: en-spegeln når FCP tidigare (mindre HTML + latin-font), vilket lägger FLER av de tidiga eval-tasksen i fönstret. ar:s senare FCP (större dokument 37,6 KB + arabisk font-path) "skyddar" den inte — den fördröjer bara samma arbete. Dela en↔ar är delvis mätmekanik: en är FAKTISKT snabbast till innehåll (FCP 1 241–1 665 mot ar 2 238) men får högre TBT-siffra. o101 §3.4:s en↔ar-ordningsinstabilitet förklaras av samma mekanism + pass-brus i den tidiga eval-tasken (o110: 938/801 ms enskilt; o118: 303/234 ms max).

## §5 Fynd 3 — flight- och script-konstitutionen: identisk, ren, kurbar yta = arkitektur

- **Flight:** en 116 926 B · ar 128 068 B · sv 115 889 B — samma innehåll: **110 kort** × full text (titel, ingress, datum, lästid) serialiseras för router-navigering. o45:s not-found-kursläcka är **borta i alla tre** (0 `"kurser":[{"slug"`-träffar — o45-kurens beständighetskvitto). EN bär 55 "Read the {pillar} deep-dive — {title} →"-CTA-rader (ar/sv: 0) ≈ 3–5 KB — designyta (våg 201-brandgenomgången), ej rörd autonomt.
- **Script:** 15 st / 254 KiB, IDENTISKA familjer mellan en/ar (enda differensen: sidspegelns egen 8 KiB-chunk). Topp: 2feezv 70 KiB (React/next-klient) · 02vzzrg 47 KiB (språkcontext+i18n) · 095w8h 42 KiB (App Router-runtime: callServer/dispatchAppRouterAction) — allt framework/runtime, inga tredjepartsbibliotek, inga döda chunkar att strypa (LH "unused-javascript 50 KiB" = App Router-falspositiv på runtime-delar).
- **Longtask-botten (o120-attribution, sonsk rensade):** dokument-inline-eval (blogg-attribution 303/234 ms) + runtime-init (095w8h 357 ms @4,0 s, turbopack 244 ms @3,9 s) + hydrat-commit (2feezv 181/119/151/142 ms). Samma familjer på ar.

## §6 Köpost till spåret (nästa våg — ARKITEKTNIVÅ, kräver produktpåverkan-bedömning)

**Uppdatering efter kartläggningen:** s7-u1 levererade 16:58:28 (568a93a2) **kuren o119 — NastaSteg-widgeten ur kritisk hydratisering** på alla ~46 shell-sidor (o105 §6 post 3; FÖRE enligt u1: en 876 · ar 737 · sv 348 på IxcwwO under lastigt läge). Stegordning: (0) **o119 deployas + EFTER-mätning mot detta protokolls FÖRE-bas på IxcwwO** (en 651/547 · ar 508 · CLS 0, tystare läge) — u1:s EFTER-kriterier är uttryckligen vakarövertag-barra; därefter, om TBT > 500 kvarstår, arkitekturnivån:

Kvarvarande TBT-drivare (alla tre speglar ~500–650): hydratisering av **110 kort** + 117–128 KB flight-eval + 254 KiB framework-JS på en list-sida. Inga mikrokurvar kvar i transportlagret (prefetch redan av, flight ren, AI-Mentor-widgeten redan idle). De tre verkliga spåren, i storleksordning:

1. **Initiell listlängd (t.ex. 24–36 kort + "visa fler" / paginering)** — största väntade effekten (flight −60–75 %, hydrat-proportionell). Ändrar kundupplevelse på tre språk ⇒ **bokas med öppet produktbeslut i nästa rond** (inte fabriksautonomt — spårets kurar hittills har varit transport, ej beteende).
2. **content-visibility: auto + contain-intrinsic-size på korten** — render/layout-uppskjutning utanför viewport; riskerar CLS om intrinsic-size avviker (o100:s CLS 0-nivå är helig) ⇒ kräver noggrann EFTER-verifiering; mindre vinst än #1.
3. **Vila och mät om i solo-fönster** — anomalin har redan krympt 1 129→547–651 med commit-strömmen; drifbandet (o28/o45:s mätdisciplin) kan ligga över en del av resterna.

## §7 KVD-slutläge

src orörd (tsc ej aktuellt — inget bygge, projektbinärens noll-baslinje orörd) · R2 orörd · data/blogg/ orörd · syskonytor orörda (u1/u2 levererade ej under mitt fönster — deras objekt förblir deras) · prod 200 ×5 https + BUILD_ID IxcwwO dokumenterat · råmaterial 16 MB kvar på disk i `verktyg/_o118-trace-tmp/` (oreviterat, ej git — kvitto-användning cittras ur committade summeringar ovan).

LEVERANS: 5 sond-/analysverktyg + 10 mät-JSON (o120-namnrymd) (3 fulla rapporter, 3 tracesummeringar, attribution, flight-sond, 2 djupanalyser av o110-rådata) + detta protokoll + anspråk + worklog-rad.
