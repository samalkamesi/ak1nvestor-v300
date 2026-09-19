# o77 — Prestanda: CLS-roten på / dödad — hydrat-språkbytet (navigator-detekt ur auto-init)

**Ägare:** fabriksagent s7-u3 (byggare 3/3) · **Datum:** 2026-09-19
**Status: KUR LEVERERAD (commit dea2d366, tsc 0 projektbinär) — EFTER väntar
prod-synkens deploy av BUILD 5AotUdlvjeJdi4jmPz1qL → ny (o66/o71-precedensen);
kriterier i §5.**

## §0 Sammandrag

FÖRE-mätningens CLS 0,106 på / (Lighthouse mobil, load 0,66) rotdiagnoserades
med tredelad sond till **hydrat-språkbytet**: SSR renderar alltid svenska
(`lasServerSprak() = "sv"`), men `hamtaSprak()` konsulterade
`detekteraSprak()` (navigator) — en kall en-US-besökare utan sparat val fick
sina UI-texter utbytta VID HYDRATISERINGEN, efter första paint. Hero-citatets
engelska rad är längre än den svenska ⇒ radbrytning +1 ⇒ hero-p 117→146 px ⇒
hela sidan under flyttas 30 px ⇒ CLS 0,106. Kuren: navigator-leden ur
`hamtaSprak()` (localStorage ⇒ sv) — SSR = klient ⇒ MGTM-svepet blir no-op ⇒
noll textbyte efter paint. `detekteraSprak()` behålls exporterad med
vägledning: framtida auto-detekt ENDAST SSR-konsistent (middleware
Accept-Language → spegelredirect /en|/ar) — aldrig via klient-hydrat.

**FÖRE:** P57 · LCP 4 321 · TBT 1 357 · **CLS 0,106406** (/ · load 0,66 ·
s7u3o77-fore) — /kurser P61 CLS 0, /blogg P59 CLS 0 (texterna där bryter samma
antal rader i sv/en — skiftet osynligt, inte frånvarande).

## §1 Rotdiagnos — tredelad beviskedja

1. **Lighthouse FÖRE** (`start-s7u3o77-fore.json`): CLS 0,106, enda
   layout-shift-källa = hero-p (`font-serif text-lg italic`-citatet).
2. **CDP-skiftsond** (`verktyg/prestanda-skiftspar.mjs`, Lighthouse-miljö:
   412×823 dpr 1,75 · 4× CPU · slow 4G): score 0,10641, tre konsekutiva
   körningar, t = 2 315–3 997 ms — skevet är reproducerbart och Race-bundet.
3. **Geometri-diff-probe** (engångs-CDP, poll 200 ms, diff VID skevet):
   hero-p y 291 h **117→146** (+1 rad, ~29 px text-lg leading-relaxed);
   CTA-div y 440→470; alla containers +30. Orsaken sitter alltså I hero-p
   självt — texten blir längre efter paint.
4. **Font-uteslutning**: `Network.setBlockedURLs` på `*_s.p.woff2` — skevet
   kvarstår (0,0777, t 2 026) utan NÅGON laddad font. Fonterna (optional +
   preload, s7-u3 2026-09-15 / o54) är därmed inte roten; skiljen 0,106 vs
   0,0777 = font-appliceringens Geometri-läge, inte orsak.
5. **Språkbevis**: SSR-HTML (`curl localhost:3000/`, `lang="sv"`) bär
   "Lär dig läsa bolag som en analytiker — från första årsredovisningen …"
   medan sondens DOM EFTER skevet bär "Learn to read companies like an
   analyst — from you[r …]" — texten byts sv→en vid hydratiseringen.
   Mekanism: `useSyncExternalStore(prenumerera, lasKlientSprak,
   lasServerSprak)` + MGTM (sprak-leverantor.tsx) — designad som "enbart
   textnoder byter", men radbrytningen ändras ⇒ layoutskift.

## §2 Kuren (src — Write/Edit-kanalerna)

- `src/lib/sprak.ts` — `hamtaSprak()`: `lasSprak() ?? "sv"` (navigator-leden
  borta). `detekteraSprak()` kvar exporterad med o75-dokumentation: SSR-
  konsistent auto-detekt (middleware → spegelredirect) är den enda
  skiftfria vägen om auto-detekt önskas igen. Filhuvudets resolution-rad
  uppdaterad.
- `src/components/ak1a/sprak-leverantor.tsx` — dokumentationsraderna för
  resolutions-kedjan uppdaterade (3 st). Ingen kodändring därutöver.

**Opåverkade:** speglar /en|/ar (`SpegelSprakLeverantor` prop-lang = SSR =
hydrat, noll skev sedan våg 81), sparat elevval (localStorage),
`SprakVäxlaren`, `setSprak`-flödet. Beteendeförändringen är EXAKT den
filens eget dokumenterade kunddirektiv: "standardspråket på en svensk-
språkig sajt är svenska tills eleven själv väljer" — navigator-detekteringen
strider mot den raden; kuren återställer den. Speglarna är indexbara så
söktrafik på en/ar landar rätt oavsett.

## §3 Underspår som STÄNGS med väljesonddetaljer

- **Bildoptimering (spårets kontext-post 1)**: SLUTET på djupare nivå än
  o66 — publik standardvy bär EN bildrequest (logotypen 1–2 KiB webp via
  next/image w=64/96); 0/55 bloggposter har `omslagUrl`; skulptur-original-
  filerna (1,16 MiB skulptur-3.jpg m.fl.) är oanvända källmaterial med NOLL
  request:or. **AVIF sonderat och avvisat**: sharp 0.35.4 KAN koda AVIF
  (aom 3.15.0 + heif 1.23.2; `.avif()` verifierad) men `formats`-aktivering
  i next.config vore kontraproduktiv — AVIFs header-overhead gör 1–2 KiB-
  pyttbilderna STÖRRE (test: 32×32 px → webp 120 B vs avif 461 B), och
  sajten har inga fotostora next/image-ytor. Aktivera först när mediabiblio-
  tekets bucket-bilder syns i publik vy.
- **Cache på /_next/image**: `Cache-Control: public, max-age=86400,
  must-revalidate` (Next default TTL) — noterad, orörd (o66/o70 äger
  cache-ytorna).

## §4 Syskonkontext (samtidig omgång)

s7-u1:o75 (/ar+/en-prefetch-kur, commit 6f7482da) och s7-?:o76 (palett-chunk)
väntar samma deploy-fönster — EFTER-mätningen mäter KOMBINATIONEN deras +
min kur. Attribution: mina kriterier (§5) är CLS + hero-geometri (deras yta
är requests/transfer) — inga överlapp.

## §5 EFTER-kriterier (mäts när prod-synken deployat ny BUILD_ID)

1. Lighthouse mobil `/` (solo-läge om möjligt): **CLS = 0** och hero-p
   oförändrad i sond-diff (117 → 117). Sond: 0 skevt.
2. `/kurser` `/blogg`: CLS 0 kvarstår; requests/transfer-jämförelse bokförs
   som o75-syskonets tal (deras kur).
3. Prod 200 ×3 (/, /kurser, /blogg) + `curl`-svenska SSR kvarstår
   (lang="sv", svenskt citat) — ingen syntax-ROI.
4. Väntar deploy utöver fönstret: väntestatus i worklog (o71-precedensen),
   mätning tas av nästa omgång.

## §5b EFTER-DOM — BOKFÖRD GRÖN 2026-09-19 05:12–05:21Z (s7-u2 fn2)

Mätt mot prod-trädet som bär kuren: deploy 23:43Z (69d926ef-familjen,
prod-HTML /kurser bär nya palett-hashen 28yatov-wk1vf.js ×17, gamla
3-bylxy borta — samma träd som o76 §4 mätte; `.next/BUILD_ID` saknas
p.g.a. OOM-byggen se §5b.2, därför bärs bygge-beviset av HTML-hashen).
Namnrymd `s7u2-o75o76o77-efter`, localhost = prod-träd, SEQ.

1. **/ CLS = 0 ✓ + sond 0 skevt ✓** — Lighthouse: CLS 0, P98, LCP
   1 836 ms, TBT 121 ms, FCP 1 090 ms, SI 2 244. Skiftsond 15 s:
   `0 skift, CLS-summa 0,00000`. FÖRE: 0,10641 → EFTER: 0 (dubbel-
   bevisat: Lighthouse + oberoende PerformanceObserver-sond).
2. **/kurser CLS 0 ✓ · /blogg CLS 0 ✓** — P95 (LCP 1 839 · TBT 187 ·
   FCP 1 239) resp. P98 (LCP 1 731 · TBT 147 · FCP 1 077); båda
   sidornas kärnmättärgård bevarad. (Requests/transfer-tal = o75-
   syskonets kriterier, se deras §4b-väntestatus.)
3. **Prod 200 ×3 ✓ (https /, /kurser, /blogg) + SSR-svenska ✓**
   (lang="sv" + «Lär dig läsa bolag» i curl-HTML).

**DOM: o77 KURERAD OCH PROD-BEVISAD — alla §5-kriterier GRÖNA.**

### §5b.2 Ärlighet + fönstrets metodfynd

- Lastfönstret var INTE solo: chrome-cron (gränsnittsvakten) körde
  parallellt + syskon-fabriksbarn. CLS 0 reproduceras ändå i två
  oberoende instrument (Lighthouse-trace + CDP-PerformanceObserver) —
  o56-r4b2-lastband-talen (P/LCP/TBT) bokförs med denna deklaration.
- **METODFYND (fälla, F2-klassen):** `pkill -f <mönster>` där mönstret
  finns i den egna kommandoraden dödar DET EGNA skalet — två körningar
  försvann spårlöst (fil skrevs aldrig). Kur: `pgrep -f "[a]k1a-…"`
  -klammertricket eller PID-lista. Bokförs för nästa våg.
- Verktygsläxa: `prestanda-lighthouse.mjs` skriver OM sammanfattningen
  vid retry med delmängd sidor (förra körningens sidor försvinner ur
  sammanfattningen — per-sid-filerna lever). Återskapad sammanfattning
  ur sidfilerna commitas med denna våg.
- INGET eget bygge (våg 100-regeln hölls); R2 orörd; data/blogg/ orörd.

## §6 Filer

- Protokoll: denna fil.
- Rådata FÖRE: `lighthouse/{start,kurser,blogg}-s7u3o77-fore.json` +
  `s7u3o77-fore-sammanfattning.json` (namnrymd o77).
- Rådata EFTER: `lighthouse/{start,kurser,blogg}-s7u2-o75o76o77-efter.json`
  + `s7u2-o75o76o77-efter-sammanfattning.json` (återskapad ur sidfiler).
- Kur: commit dea2d366 (2 filer, +25/−6).
