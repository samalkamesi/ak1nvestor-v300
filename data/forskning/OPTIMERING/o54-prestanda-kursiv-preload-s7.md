# o54 — Prestanda: serif-kursiv preloadad (LCP-fonten ur den kritiska kedjan)

**Spår 7 · s7-u1 (manifest auto-s7-1789661728938, byggare 1/3) · 2026-09-17**
**Status: KUR LEVERERAD + EFTER BOKFÖRD 2026-09-18 (s7-u1, omgång
2026-09-18 ~00:5x–01:1x) — kriterierna (a)(b)(d) gröna, (c) grön på
/kurser + /blogg, / oförändrad med NY ROT (skriptbunden FCP, §6).**

## §0 Sammandrag (o54)

Kursiv serif-variantens woff2 (51 KiB) var den ENDA av sajtenens fyra
typsnitt utan preload (`preload: false`, beslutat våg 68/o1 #9 under
antagandet "kursiv används först i löptext långt ner"). Trace på prod
bevisar motsatsen: **hero-citatet på /, /en och /ar — sajtens entré —
är kursiv serif och är LCP-elementet** (p.font-serif.text-lg.italic,
"Lär dig läsa bolag som en analytiker…"). Konsekvensen i Lighthouse
Lantern-kedjan: fonten upptäcks via style-resolution först 954–1 509 ms
in i navigationen (de preloadade syskonfonterna: 80–133 ms), mitt i
JS-kön, och med `display: "optional"` (s7-u3-beslutet) rejas den om den
inte hunnit fram — LCP-elementets **element render delay 2 203–2 240 ms
vid TTFB 41–56 ms** (all tid är render-fördröjning; ingen resurslast).
Kuren: preloaden på sourceSerifKursiv återinförs (o1 #9:s undantag
upphävs) — font-fetchen startar i <head> vid ~80 ms som syskonen och
font-fasen lämnar LCP-kedjan på alla tre språkstartsidorna.

## §0b Medförd kvittering: o53/o51-EFTER (väntestatus 1c969cf6 infriad)

Syskonvågen bokförde o53-EFTER (d50de52d) och o52-EFTER (b84ce6f5) på
samma prod-bygge under min session — tabellen nedan är mitt OBEROENDE
tvärsnitt ur s7u1o54-fore-rundan (prod-bygge J87oNXS1k5w1NAMDS1rpJ,
kraschvaktens + prod-synkens byggen 19:36–19:45, develop 1c969cf6):

| Sida | o53 FÖRE (qDivc) | o54-mätning (J87) | Delta |
|---|---|---|---|
| / | P45 · LCP 5 543 · TBT 2 412 | P50 · LCP 5 548 · TBT **1 406** | TBT **−1 006 ms** |
| /kurser | P40 · LCP 5 967 · TBT 3 787 | P51 · LCP **5 386** · TBT **1 164** | LCP −581 · TBT **−2 623 ms** |

TBT-fallet är chat-defer-kurens (o53 §3, d75bf2f8 + 7c1fd646:s
rIDLE-tak) mekaniska kvitto: 106 K chat-chunk hämtas ej längre alls
under mätfönstret. o51:s kurskorts-kur (90cd7c57) bidrar till
LCP-nedgången på /kurser (prefetch-spill ur initial load). Lastband:
kraschvaktsbygge körde under mätningen (~1 kärna) — TBT-talen bär ett
deklarerat osäkerhetsband, men −2,6 s ligger vida utanför bandet.

## §1 FÖRE-mätning (prod-bygge J87-fönstret, 2026-09-17 19:47–19:56 lokal)

Solo-agentläge (enda fabriksagenten i ps); deploy-bygge i bakgrunden
(deklareras). Verktyg: `verktyg/prestanda-lighthouse.mjs s7u1o54-fore
/ /kurser /blogg`. Rådata: `lighthouse/{start,kurser,blogg}-s7u1o54-fore.json`
+ `s7u1o54-fore-sammanfattning.json` (3 sidor sammanförda).

| Sida | Poäng | FCP | LCP | TBT | CLS | TTI | SI |
|---|---|---|---|---|---|---|---|
| / | P50 | 1 897 | **5 548** | 1 406 | 0 | — | 4 523 |
| /kurser | P51 | 2 210 | **5 386** | 1 164 | 0 | — | 4 488 |
| /blogg | P64 | 1 885 | **4 649** | 677 | 0 | 4 887 | 3 963 |

(Lighthouse 13.4.1, mobil-emulering; två tidigare /blogg-försök dog i
lighthouse-processen under pm2-omstartsfönstret 19:44–19:45 — tredje
försöket gick när pm2 var stabil.)

## §2 Rotanalys (trace-bevisat)

`lcp-breakdown-insight` (start): LCP-element = `div.mx-auto > div.marin-panel
> div.relative > p.mt-5` — hero-citatet, bounding 300×146 @ y 324.
Subparts: **TTFB 56 ms · element render delay 2 240 ms**. Nätverkstiming:

| Resurs | Start | Slut |
|---|---|---|
| serif-normal woff2 48 KiB (preloadad) | 133 ms | 190 ms |
| inter woff2 50 KiB (preloadad) | 132 ms | 188 ms |
| **serif-KURSIV woff2 51 KiB (preload:false)** | **1 509 ms** | 1 660 ms |
| CSS 37 KiB | 152 ms | 460 ms |

/kurser samma mönster: kursiv-font start 954 ms (preloadade: 80 ms),
element render delay 2 203 ms. Observerat (odrosslat) FCP = LCP =
2 244–2 297 ms — elementet målas vid FCP; hela det simulerade LCP-gapet
är font-discovery i JS-kön + CPU-blocking. Kedja av två äldre beslut:
våg 68 (preload:false "kursiv behövs senare") × s7-u3 (display:optional
= rejs om inte framme vid första layouten). Kursiv-serif i hero fanns
redan 2026-09-01 (varumärkesbeslutet) — antagandet var aldrig sant för
startsidorna.

## §3 Kuren

`src/lib/typografi.ts` (AKTIV källa sedan våg 85: GlobaltSkal sätter
`typografiKlasser` på body i alla tre rot-layouterna):
`sourceSerifKursiv` förlorar `preload: false` — Next genererar
<link rel=preload> för kursiv-woff2:n i alla dokument. Filhuvudets
föråldrade "DÖD KOD"-varning rättas samtidigt (filen är aktiv sedan
våg 85; varningen bjöd till att missleda nästa våg). Konfiguration i
övrigt orörd (subsets/weights/display enligt s7-u3-beslutet).

Kostnad/avvägning: +51 KiB preload på kalla sidvisningar utan kursiv
text ovanför vecket; fonterna serveras lokalt med lång cache-ttl och
parallellhämtas (HTTP/2) — hindrar ej JS-nedladdningen. Mot detta:
LCP-elementets font-fas försvinner ur den kritiska kedjan på sajtens
tre entrésidor. Inom spårets beslutsyta (o1 #9-undantaget upphävs med
trace-bevis; inget R2-rörande).

## §4 Leverans

- `src/lib/typografi.ts` — preload:true (raden borttagen) + dokumentation
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**
- Bygge: NEJ (prod-synken äger) — commit + push prod develop; EFTER
  mäts när nästa prod-bygge landat (BUILD_ID-byte + kursiv-woff2 i
  preload-listan verifieras före mätning).

## §5 EFTER-mätning — BOKFÖRD 2026-09-18 (s7-u1, bygge doGVDkqE3FKPmzHgfh7-I)

Väntan bröts: prod-synken landade kur-commiten (772b67f9 i trädet,
BUILD_ID byte J87oNXS1 → **doGVDkqE3FKPmzHgfh7-I**). Mätning
2026-09-18 ~00:57–01:00 lokal (load 0,54 vid start, stigande till
2,06 under fönstret — syskonkull vaknade; deklarerat band), verktyg
`verktyg/prestanda-lighthouse.mjs s7u1o54-efter / /kurser /blogg`,
rådata `lighthouse/{start,kurser,blogg}-s7u1o54-efter.json` +
`s7u1o54-efter-sammanfattning.json`.

**Kriterierna:**

- **(a) preload-rad i SSR-HTML: GRÖN.** / bär `<link rel=preload …
  ea3421846039b7f3-s.p.23jyvdx2mwxjn.woff2>` — hashen verifierad mot
  @font-face-blocket `font-family:"Source Serif 4";font-style:italic`
  (latin-subsetet) i CSS-chunken. Tre font-preloads i dokumentet
  (kursiv + inter + serif-normal).
- **(b) kursiv-fontens nätverksstart: GRÖN, i syskontakt.**

  | Sida | FÖRE font-start | EFTER font-start | Syskonfonter EFTER |
  |---|---|---|---|
  | / | 1 509 ms | **159 ms** | 150/159 ms |
  | /kurser | 954 ms | **55 ms** | 54/54 ms |
  | /blogg | (ej separat mätt) | **65 ms** | 62/65 ms |

  Font-fasen är UR LCP-kedjan på samtliga tre sidor — lastokänsligt
  nätverksbevis (o54 §7-metoden).
- **(c) LCP ned: GRÖN på /kurser och /blogg, EJ på / (ny rot, §6).**

  | Sida | FÖRE P/LCP/TBT | EFTER P/LCP/TBT | renderDelay | observerat FCP→LCP |
  |---|---|---|---|---|
  | /kurser | P51 · 5 386 · 1 164 | **P58 · 5 097 · 1 026** | 2 203 → **1 271** (−932) | 2 244 → 1 197/1 298 |
  | /blogg | P64 · 4 649 · 677 | P55 · 4 582 · 2 378* | 2 203 → **941** (−1 262) | 2 224 → **301/984** |
  | / | P50 · 5 548 · 1 406 | P50 · 5 613 · 1 397 | 2 240 → 2 236 (±0) | 2 297 → 2 299 (±0) |

  */blogg simTBT 2 378 är KONTAMINERAT (load steg 0,54→2,06 under
  fönstret; obsFCP 301/obsLCP 984 — det snabbaste någonsin uppmätta
  på sidan — bevisar att sidan själv inte långsammare; solo-rond i
  vilofönster = bokad rest).*
- **(d) CLS 0: GRÖN** på samtliga tre sidor (optional målar en gång).

**Slutsats:** preload-kuren gjorde exakt vad den kunde — font-fasen
försvann ur den kritiska kedjan överallt och /kurser//blogg tog hem
LCP/FCP-nedgångar. Att / inte rörde sig (obsFCP 2 297 → 2 299 ms)
beror på att dess första målning är STYRT av JS-huvudtråden, inte av
fonten: Script Evaluation 3 480 ms (observerat) på / mot 2 220 ms på
/kurser; sista synkrona chunkarna slutar 2 360–2 369 ms = FCP:ns
plats. Fonten var en av två rötter (o54 §2:s "font-discovery + CPU-
blocking") — nu återstår den strukturella (§6-köpost).

FÖRE-fönstrets eget band (o54 §1: kraschvaktsbygge deklarerat) och
EFTER-fönstrets (syskon-last stigande) bokförs öppet — nätverks- och
strukturbevisen bär slutsatsen, CPU-talen deklareras med kontext.

## §6 Kvarstående observationer

- **NY KÖPOST (2026-09-18, EFTER-rundan): /:s FCP är skriptbunden.**
  Chunks unika för / (mot /kurser, EFTER-tracen): Turbopack-runtime-
  chunk (1c3hmq2wqhl4q, 9 KiB, slut 2 369 ms) + lucide-icon-chunk
  (1qvevmz_r67hk, 7 KiB, slut 2 366 ms) + tre tidiga ~12–13 KiB-chunks
  (slut 726–786 ms). Script Evaluation 3 480 ms på / mot 2 220 på
  /kurser; obsFCP = 2 297 ms genom hela kuren (fonten borta ur kedjan
  men målningen väntar på JS-kön). Strukturell trädbantning av
  startsidans hydratisering = samma klass som o45 §1 (React-chunkens
  59 %-dominans) — huvudagentens område; barnägda delfynd att sonda:
  vilka klientkomponenter i spa-hem-kedjan som kan följa SearchModal-
  mönstret (dynamic + LasyGlobal).
- React-chunkens hydratiseringsdominans (o45 §1: 59 % av blocking) —
  allt öppet, strukturell trädbantning (o53 §6-observation kvarstår).
- Chat-chunkens intern-vektdelning — AI-mentor-spårets yta (o53 §6).
- /blogg har LCP 4 582 utan kursiv-hero — drivs av CPU-blocking;
  kurens +51 KiB-preload deklarerad ovan (marginell).
- REST (bokad): solo-rond på /blogg i vilofönster för ett rent
  simTBT-tal (2026-09-18-fönstret var kontaminerat, se §5*).

## §7 Metod och ärlighet

FÖRE-mätningarna skedde med kraschvaktsbygge i bakgrunden (CPU-band
deklarerat); observed==simulated-jämförelsen (FCP=LCP observerat) gör
font-beviset lastokänsligt. EFTER mättes 2026-09-18 ~00:57 i det bästa
tillgängliga fönstret (load 0,54 vid start, inga byggen igång; steg
till 2,06 under fönstret när syskonkullen vaknade — deklarerat i §5,
det lastokänsliga font-/preload-beviset bär slutsatsen). R2 orörd;
data/blogg/ orörd; inget bygge av mig.
