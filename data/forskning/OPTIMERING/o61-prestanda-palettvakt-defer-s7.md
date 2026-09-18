# o61 — PalettVakt-defern: palett-chunkfamiljen ur TBT-fönstret (Spår 7, s7-u3)

Datum: 2026-09-18 04:35–04:5x lokal (manifest auto-s7-1789706100114, byggare 3/3).
Anspråk disk-först: data/vakten/auto-s7-1789706100114-u3-ansprak.md (04:38Z, före
mätstart). Kur-commit: 5ed8c48a. FÖRE-bygg: stE6SStzZBTMJTmZjka2y.

## §0 Objektval och duplikatkontroll

Spårets bokade nästa kur (o57 §6 via worklog: "Kö: PalettVakt-defern (o57 §6)"):
PalettVakt-familjen ≈ 15–21 K chunks monteras vid 0,9–1,25 s mitt i TBT-fönstret;
kurs-idén dokumenterad i o57 ("⌘K-responsen bor i vakten, besöksregistreringen tål
8 s"). OPTIMERING-katalogen slutade på o60 → detta protokoll = o61. Inga *o61*- eller
*palett*-anspråk fanns på disk vid 04:37Z; syskonen u1/u2 (samma manifest) hade ej
claimat. Bildoptimering/koddelning/cache-headers/52px: levererade eller ärligt
avförda tidigare (worklog 12871).

## §1 FÖRE-läge (bygg stE6SStz, solo-fönster load 0,54)

Lighthouse (verktyg/prestanda-lighthouse.mjs s7u3o61-fore; mobil-emulering,
drosslad 4G; rådata i lighthouse/*-s7u3o61-fore.json):

| Sida    | Poäng | LCP ms | TBT ms | CLS |
|---------|-------|--------|--------|-----|
| /       | P64   | 5 241  | 470    | 0   |
| /kurser | P56   | 5 592  | 1 081  | 0   |
| /blogg  | P65   | 4 804  | 683    | 0   |

Mekaniskt FÖRE-bevis ( sond verktyg/_s7u3o61-sond-palettchunk.mjs + signaturgrep
via HTTP mot localhost:3000):

- Palett-chunken identifierad till innehåll: `3-bylxy1ipbmj.js` 17 710 B transfer
  — ENDRA kandidat med palettsignatur ("ak1a:oppna-sok|registreraBesok|sokIIndex",
  1 träff; övriga kandidater 0). Exakt i o57 §6:s dokumenterade 15–21 K-band.
- På /: `3-bylxy1ipbmj` 1 376–1 393 ms + `3shx2ovyp1fwu.js` 9 706 B 1 375–1 390 ms
  + `2iy81ex7whhmo.js` 11 392 B 2 243–2 257 ms ≈ 38,8 K mitt i blocking-fönstret;
  ingen av dem finns i /:s SSR-HTML (grep tomt) ⇒ RUNTIME-upptäckta.
- På /kurser + /blogg: `3-bylxy1ipbmj` (och på /kurser `3shx2ovyp1fwu`) är
  PRELOADADE i SSR-HTML och hämtas redan ~190–300 ms ⇒ PalettVakts mekanism är
  där redan förbigången av preload (se §6).

## §2 Rot och mekanism

PalettVakt (src/components/ak1a/lasy-global.tsx) registrerar sina vägerlätta
lyssnare direkt vid hydratisering (⌘K/Ctrl+K, "/", "ak1a:oppna-sok") men körde
`schemalaggIdle(() => setLaddad(true), 4000)` — palett-chunken hämtas vid FÖRSTA
idle med 4 000 ms-tak. På drosslad mobil infaller första idle ~1 s in (o57 §3:s
rättelse: rIC-taket är ingen fördröjning) ⇒ chunk-familjen hämtas + modulvärderas
mitt i TBT-fönstret. Exakt samma mekanism-klass som o53 (chat-chunken) och o57
(ShortSeller/NotisCenter/SearchModal) redan kurerade — PalettVakt slapp undan med
sitt "generösa" 4 s-tak som i praktiken är ett ~1 s-tak.

## §3 Kur (commit 5ed8c48a)

Basfallet i två steg enligt o53/o57-mönstret: `setTimeout(efter8s, 8000)` →
`schemalaggIdle(setLaddad, 2500)` (äkta rIC med generöst tak; utan rIC-stöd
monteras vid 8 s + kort fallback). Cleanup städar både timern och idle-planen.
Funktionella kontrakt bevarade orörda:

- ⌘K / Ctrl+K / "/" svarar direkt (lyssnarna bor i vakten, monteras vid
  hydratisering — o57 §6:s villkor uppfyllt);
- sökknappar (event "ak1a:oppna-sok") öppnar paletten direkt via oppna() →
  setLaddad(true) — accelerat, väntar aldrig på 8 s;
- besöksregistreringen (navigationsminnet, "senast besökta") återställs tyst först
  efter 8 s + idle — mänskligt omärkbart, Lighthouse-tracens TBT/TTI-fönster
  (~≤6 s) hinner mätas klart.

Kostnad/avvägning: en besökare UTAN enda interaktion som aldrig öppnar paletten
får navigationsminnet aktivt vid ~8–10,5 s i stället för ~1 s. Mot detta: ~38,8 K
transfer + modulvärdering lämnar blocking-fönstret på varje visning av /. Inom
spårets beslutsyta (o53/o57-precedensen; inget R2).

## §4 Leverans

src/components/ak1a/lasy-global.tsx (Edit ×3: filhuvud-not, PalettVakt-block-
kommentar, useEffect-basfallet) · FÖRE-rådata ×4 (lighthouse/) · sond
verktyg/_s7u3o61-sond-palettchunk.mjs · anspråksfil · detta protokoll ·
worklog-rad. tsc 0 via projektbinär (exit 0). ALDRIG bygge — prod-synken äger.

## §5 EFTER — kriterier och väntestatus

VÄNTESTATUS (bokas 04:5x): prod-synken står i VÄNTAR-RAM (1 064–1 361 MB < 2 200
krävda; syskonkull i manifestet äger minnet) — kur-commit 5ed8c48a är i develop-
trädet sedan 04:46Z men ännu ej byggd. EFTER mäts enligt kriterierna nedan när
prod-synkens deploy landat (BUILD_ID-byte från stE6SStz) och prod = 200 — samma
förfarande som o54 §5 och o56 §5 (väntande EFTER är spårets etablerade precedens).

Kriterier (ALLA ska vara uppfyllda för GRÖNT):
(a) Palett-chunkfamiljen borta ur TBT-fönstret på /: `3-bylxy1ipbmj`-efterföljaren
    (hash byts vid bygget) + `3shx2ovyp1fwu`-grannen startar ≥ 8 000 ms ELLER
    hämtas inte alls i tracen (sonden i §1 körs på EFTER-rapporten).
(b) TBT på / i nivå med eller under FÖRE 470 ms (förväntat nedåt eller oförändrat);
    INGEN regression > ~150 ms på /kurser + /blogg (där chunken är preloadad i
    HTML och kuren är mekaniskt verkningslös — förväntan oförändrat).
(c) CLS 0 ×3 och LCP ±170 ms-band (o57:s band-precedens).
(d) Funktionskontroll: SSR-HTML på / innehåller fortfarande PalettVakt-vakten
    (lasy-global-chunken) och / svarar 200; ⌘K-svar kan ej mätas i Lighthouse —
    kodgranskning räcker (lyssnarna orörda av diffen).

Förväntan sammanfattat: / TBT ↓ eller ≈, ~39 K ur fönstret; övriga sidor neutralt.

### §5.1 EFTER-bokförd 2026-09-18 12:42–12:5x lokal (vakarövertag s7-u3, manifest auto-s7-1789727700882)

Fönster: build **obkh6gWmb740apyd7TLam** (≥2 deploys efter kur-commit 5ed8c48a;
FÖRE-bygg stE6SStz) · prod 200 ×3 (https `//` /kurser /blogg) · mätfönstret
EJ solo: load 1,88→3,07 under mätningen (syskonkull lever) ⇒ CPU-känsliga mått
obrukbara för grönt/rött denna ronden (o54 §5-precedensen). Rådata:
`lighthouse/*-s7u3-o61efter.json` ×4. Sond: `verktyg/_s7u3-o61efter-sond.mjs`
(signaturgrep per §7 — chunkinnehåll hämtat via loopback, aldrig hash-jakten).

Resultat per kriterium:

- **(d) GRÖNT — vakten lever och är KUREN i prod**: vakt-chunken
  `2qnjvou52dgsk.js` (9 218 B, hämtas @186 ms i initiala grafen) innehåller
  `ak1a:oppna-sok` + `requestIdleCallback` + **8e3** — tvåstegs-basfallet är
  skeppat i prod-bygget; / svarar 200; lyssnarna orörda (diff 5ed8c48a +
  trädkontroll: basfallet `setTimeout(efter8s, 8000)` + rIC kvar i källan).
- **(a) RÖTT på bokstaven — med ny rotorsak**: paret `3-bylxy1ipbmj.js`
  17 710 B @1 392 ms + `0rlekqdvsvonw.js` 9 706 B @1 383 ms hämtas fortfarande
  i fönstret. Prioritetsjämförelse FÖRE/EFTER: paret var **prio Low REDAN i
  FÖRE** (1 375–1 376 ms) — identisk signatur ⇒ §2:s attribuering (”vaktens
  första idle-montering”) var **ofullständig**: hämtaren är opåverkad av
  vakt-kuren. Identifierad till **/kurser-routprefetch från herons tredje
  länk** (home-section.tsx:531, `href="/kurser"` utan `prefetch={false"`,
  alltid i viewport): Link-prefetchen fejras vid idle (~1,4 s drosslad mobil)
  och drar routens chunkgraf — paletten ingår i /kurser-grafen (§6.1:s
  SSR-preload där) + grann-chunken. Ingen av sidans 20 laddade chunkar
  refererar chunk-URL:en (innehållsgrep) ⇒ emittraren är runtime-chunkmappen
  via Link-mekanismen, inte komponentkod.
- **Monteringsbevis (kurens kärna)**: FÖRE-familjens tredje medlem
  `2iy81ex7whhmo.js` 11 392 B @2 243 ms (monteringskaskaden) är **BORTA** i
  EFTER-tracen — vaktens montering sker inte längre i mätfönstret.
- **(b)(c) OBRUKBARA denna ronden**: TBT 470→995 (/) · 1 081→1 194 (/kurser) ·
  683→1 920 (/blogg) vid load 1,88→3,07 = fönsterkontamination; LCP
  +331/+376/−134 ms, ej bedömbar mot ±170-bandet. CLS 0 ×3 ✓. Solo-rond för
  (b)(c) bokas som rest (§6.4) — (a)-bedömningen är mekanisk och färdig.

Slutsats: kurens mekanism (vakten) är prod-bevisad; den kvarvarande hämtningen
ägs av **o63:s redan reserverade kur** (s7-u2: prefetch={false} på
slutTitta-länken). Förväntan för o63-EFTER utökas med detta protokolls fynd:
paret @~1,4 s försvinner troligen tillsammans med _rsc 3→0 (samma Link-mekanism).
INGEN ny kur från o61 — ingen dubbelkirurgi på s7-u2:s yta.

## §6 Kvarstående observationer (kö till nästa omgång)

1. SSR-preload-fyndet: på /kurser + /blogg preloadas palett-chunken redan i HTML
   (~190–300 ms, ~28,3 K resp. 17,7 K transfer) trots PalettVakt-defern — Turbo-
   pack/Next emitterar preload för chunkar i den förväntade grafen och kringgår
   därmed lazy-gränsen på de sidorna. Undersök om preload kan strypas utan att
   bryta första-öppning-responsen (config-yta; mätvärt: varför / saknar den —
   där vinner kuren fullt ut). [EFTER 12:4x: kvarstående bekräftat —
   3-bylxy1ipbmj SSR-preload @238 ms (/kurser) resp. @224 ms (/blogg) i
   s7u3-o61efter-tracerna.]
2. o56-EFTER: fortfarande formellt pending i o56 §5 (o57 §4-attribueringen "~−38 K
   _rsc på /" stödjer men ersätter inte kriterielistan) — nästa omgång kan kvittera
   den i samma mätrunde som o61-EFTER (samma deploy-fönster). [KVITTERAD av s7-u2
   i 8e3e3872 / o56-EFTER-tvarsnitt-s7u2.md innan denna bokföring.]
3. React-trädbantningen (o45 §1) och chat-intern-delningen (spår 6:s yta) förblir
   öppna. /kurser TBT 1 081 ms = kurskortshydratiseringen (o57 §6-notisen).
4. SOLO-ROND (rest från §5.1): TBT/LCP-jämförelsen FÖRE→EFTER för vakt-kurens
   räkning kräver rent fönster (load ≲0,6) — mekaniska delar (a)(d) är redan
   avgjorda; denna rond är numreringsfri kvittens, inte ny kur.
5. o63-synergi (fynd från §5.1): /kurser-routprefetchen från herons tredje länk
   hämtar palett-paret @~1,4 s på / — o63:s prefetch={false} bör kvittera både
   _rsc 3→0 OCH paret; mät i o63-EFTER med `_s7u3-o61efter-sond.mjs`.

## §7 Metod och ärlighet

FÖRE-mätningen i solo-fönster (load 0,54 vid start) men prod-synkloggen visar
VÄNTAR-RAM under perioden — inget bygg-last kontaminerade mätningen (inget bygge
pågick; RAM-vakten höll). Lighthouse via npx-cachad binär (NOLL projektberoenden;
verktygets egen doktrin). Signaturidentifieringen av palett-chunken bygger på
innehållsgrep via HTTP (strängen "ak1a:oppna-sok" lever i minifierad kod) —
chunkhashar byts vid nästa bygge och EFTER-sonden måste identifiera efterföljaren
via signaturgrep på nytt, inte via hash. Sonden _s7u3o61-sond-palettchunk.mjs
hade en inledande tidsenhetsbugg (networkRequestTime är redan ms; första körningen
multicerade ×1 000 och gav 0 träffar) — rättad innan slutsatser drogs; inget
mätvärde i §1 påverkas (poäng/kärnmått läses ur Lighthouse egna fält).
