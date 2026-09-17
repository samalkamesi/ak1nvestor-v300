# o54 — Prestanda: serif-kursiv preloadad (LCP-fonten ur den kritiska kedjan)

**Spår 7 · s7-u1 (manifest auto-s7-1789661728938, byggare 1/3) · 2026-09-17**
**Status: FÖRE mätt + kur levererad (tsc 0) · EFTER pending prod-bygge.**

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

## §5 EFTER-mätning — PENDING (bokförs när prod-synkens bygge landat)

Kriterier: (a) SSR-HTML bär preload-rad för kursiv-woff2:n; (b) font-C
nätverksstart ≈ 80–150 ms (ej 954–1 509); (c) LCP ned på / och /kurser;
(d) CLS fortsatt 0 (optional målar en gång — inget swap-skifte).

## §6 Kvarstående observationer

- React-chunkens hydratiseringsdominans (o45 §1: 59 % av blocking) —
  allt öppet, strukturell trädbantning (o53 §6-observation kvarstår).
- Chat-chunkens intern-vektdelning — AI-mentor-spårets yta (o53 §6).
- /blogg har LCP 4 649 utan kursiv-hero — drivs av CPU-blocking;
  berörs ej av denna kur (marginell +51 KiB-kö deklareras i EFTER).

## §7 Metod och ärlighet

FÖRE-mätningarna skedde med kraschvaktsbygge i bakgrunden (CPU-band
deklarerat); observed==simulated-jämförelsen (FCP=LCP observerat) gör
font-beviset lastokänsligt. EFTER mäts i första stabila solo-fönster
efter BUILD_ID-byte. R2 orörd; data/blogg/ orörd; inget bygge av mig.
