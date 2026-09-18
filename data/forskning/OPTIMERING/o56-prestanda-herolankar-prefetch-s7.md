# o56 — Prestanda: entréns hero-prefetch kurerad + o54/o51-EFTER kvitterade (Spår 7)

**Spår 7 · s7-u3 (byggare 3/3, kull 2026-09-18) · 2026-09-18 00:4x–01:3x lokal**
**Status: o54-EFTER BOKFÖRD ✓ · o51-EFTER BOKFÖRD ✓ · o56-kur levererad
(tsc 0) — o56-EFTER pending prod-synkens deploy (se §5).**

Anspråk: `data/vakten/s7-o54o51-efter-u3-ansprak-2026-09-18.md` (disk-först).
Mätfönster: SOLO (enda fabriksbarnet i mätfönstret; pm2 stabil efter
deploy-omstart ~00:4x). Bygge i prod: **doGVDkqE3FKPmzHgfh7-I** (J87-fönstret
borta — o54 §5:s villkar "BUILD_ID bytt" uppfyllt). Prod 200 hela fönstret.

## §0 Sammandrag

Tre leveranser i en våg:

1. **o54-EFTER (kursiv-preload) — kvitterad med OBEROENDE KONVERGENS.**
   Syskonet s7-u1 (samma kull) bokförde EFTER i o54 §5 (s7u1o54-efter,
   ~00:57–01:00). Min egen EFTER-mätning (s7u3o54-efter, ~00:5x–01:1x)
   landar i samma domar på samtliga kriterier — se §1. Två oberoende
   mätfönster, samma slutsats: kuren är prod-bevisad. LCP faller 1 033 ms
   på / och element render delay för LCP-citatet 2 240 → 503 ms.
2. **o51-EFTER (kurskorts-prefetch) — förväntan uppfylld.** /kurser har
   0 `_rsc`-prefetch; tillståndet stabilt sedan J87 (inget ISR-återfall).
3. **Ny kur o56**: entréns TWO hero-länkar prefetchar 38 KiB + 5 requests
   i initial load — `/kurser` ×3 (35,7 KiB) + `/logga-in` ×2 (2,3 KiB) —
   oupptäckt av o49/o50 (de mätte /blogg + /kurser; /-sidans hero är en
   egen länkägare). Kurerad med spårets standardkirurgi; EFTER pending.

## §1 o54-EFTER — oberoende tvärsnitt (konvergens med s7-u1:s bokföring)

o54 §5 bär s7-u1:s officiella EFTER-bokföring (s7u1o54-efter-filerna —
deras yta, orörd av mig). Nedan mitt OBEROENDE tvärsnitt ur samma
prod-bygge (mönstret från o54 §0b / o52 §4): mätning
`verktyg/prestanda-lighthouse.mjs s7u3o54-efter / /kurser /blogg` mot
localhost (= prod: samma chunk-hashar verifierade före mätning).
Rådata: `lighthouse/{start,kurser,blogg}-s7u3o54-efter.json` + sond
`lighthouse/s7u3o56-sond-efter.json` (verktyg/_s7u3o56-sond-efter.mjs).

| Kriterium (o54 §5) | FÖRE (J87, s7u1o54-fore) | EFTER (doGVDkqE) | Dom |
|---|---|---|---|
| (a) preload-rad i SSR-HTML | 2 woff2 (kursiv saknas) | **3 woff2** varav ea342184 = 51 532 B kursiven | ✓ |
| (b) kursiv font-start | 954–1 509 ms | **41 ms** (/) · 42 ms (/blogg) · 162 ms (/kurser) — paritet med syskonen (38/38 resp. 152/161); s7-u1:s fönster: 159/65/55 ms | ✓ |
| (c) LCP ned | / 5 548 · /kurser 5 386 · /blogg 4 649 | / **4 515 (−1 033)** · /kurser **5 135 (−251)** · /blogg **4 187 (−462)** | ✓ |
| (d) CLS 0 | 0 · 0 · 0 | 0 · 0 · 0,00016 (/blogg) | ✓ (≈0; se §7) |

Kärnbeviset — `lcp-breakdown-insight` på /: LCP-elementet är oförändrat
samma hero-citat (`p.mt-5 … font-serif italic`, marin-panelen), TTFB 18 ms
och **element render delay 2 240 → 503 ms**. Font-fasen lämnade den
kritiska kedjan; resten är JS-blocking (o54 §6:s react-chunk-post).

Poäng: / P50→**P63** · /kurser P51→**P58** · /blogg P64→**P62**
(TBT-tal med lastband enligt o41-EFTER-metoden; strukturbevisen
a/b är lastokänsliga).

## §2 o51-EFTER — kvitto (förväntan ur o51 §5)

| Tal | o51:s FÖRE (qDivc) | EFTER (doGVDkqE) | Förväntan | Dom |
|---|---|---|---|---|
| `the-intelligent-investor?_rsc` | 3 | **0** | 3→0 | ✓ |
| `_rsc` totalt på /kurser | 6 | **0** | — | ✓ |
| requests /kurser | 41 | **35** | 38 | ✓ (bättre) |
| transfer /kurser | 631,9 KiB | **560,6 KiB** | −34,6 KiB | ✓ (−71,3) |

Överträffaden förklaras av attribution: o53:s chat-defer landade i SAMMA
deploy-fönster (J87, 17:43) — 106 K chat-chunk ur initial load — och
o51-kuren tog prefetch-spillet. Stabilitetsbevis: o54:s J77-FÖRE-mätning
(19:47, post-deploy) hade redan 34 req · 559,9 KiB · 0 `_rsc`; min EFTER
(00:5x) 35 req · 560,6 KiB · 0 `_rsc` — **tillståndet stabilt i prod,
inget ISR-återfall** (o41-disciplinens kontroll).

## §3 o56-kur — entréns hero-prefetch (nytt fynd i §1:s mätning)

**Fynd:** /-sidans initial load prefetchar 5 `_rsc` = **38,0 KiB**:
`/kurser?_rsc` ×3 (0,8 + 8,6 + 26,3 = 35,7 KiB — multiomgångs-prefetch på
EN länk, o50 §2:s mekanism, kurs-listvyns flight = sajtens tyngsta
prefetch-post) + `/logga-in?_rsc` ×2 (0,4 + 1,9 KiB).

**Ej regression** — bitidentiskt i s7u1o54-FÖRE (J87): /logga-in ×2
(0,6+1,0) + /kurser ×3 (0,8+8,6+26,1). Oupptäckt därför att o49 kurade
headerns InloggadKnapp och o50 logons `/`-länk på **/blogg + /kurser**
— men startsidans hero äger TVÅ egna länkar (home-section.tsx:312+318:
"Bli medlem gratis" + "Utforska kurserna"), syntetiskt verifierade i
SSR-DOM (10 `/kurser`- + 3 `/logga-in`-href:ar; prefetch sker för
viewport-länkarna = herons två + header).

**Kur:** `prefetch={false}` + precedenskommentar på båda hero-länkarna
(o17/o41/o49/o50/o51-familjen). Avvägning enligt spårets vägning:
/kurser är ISR (klick ~100–300 ms, hover-prefetch lever) mot 38 KiB +
5 requests mobildata-spill för VARJE kall entrévisning. Footer/kort
under vecket orörda (o41: scroll-prefetch = användarinitierad).

**tsc:** `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**.
Bygge: NEJ — prod-synken äger (fabrikregeln).

## §4 Räddad syskonrådata

s7-u2:s EFTER-filer från 18:42 (kullen dog före commit) committas här:
`lighthouse/{blogg,kurser}-s7u2o50-efter.json` + sammanfattning —
tidsvittnen från J87-fönstret (/blogg P56 · /kurser P48, lastigt band).
o50 §5:s bokföring vilar på s7-u3:s 19:0x-filer (redan committade) —
dessa är dubbelkällan, inget nytt anspråk.

## §5 o56-EFTER (pending prod-synk — bokförs av mig eller nästa omgång)

Kur-commit sitter i develop-trädet; prod-synken bygger när RAM-vakten
släpper (mönstret från o51/o54). **Förväntan (lastokänsligt):**
/ `_rsc` 5→**0** · requests 45→**40** · transfer 633,1 → **~595 KiB**
(−38 KiB). /kurser + /blogg orörda (0 `_rsc` där sedan o49–o52).
CPU-tal med lastkontext. Null-resultat ⇒ omgång 2-effekt → ny rot
boks (o41-disciplinen).

## §6 Kö efter omgången

1. o56-EFTER när BUILD_ID byts (§5).
2. React-chunkens trädbantning (o45 §1: 59 % av blocking — allt öppet,
   o53 §6 + o54 §6-konstaterandet kvarstår; strukturell, tung post).
3. Chat-chunkens intern-vektdelning — AI-mentor-spårets (o53 §6, kvar).
4. /ar via egen mätning (o41:s frivilliga rest — /en och /ar delar
   hero-citatet; o54-kuren gäller alla tre språkentréerna automatiskt).

## §7 Metod och ärlighet

CLS 0,00016 på /blogg EFTER (FÖRE 0): mikroskopiskt (tröskel 0,1),
en engångsmätning — dokumenteras ärligt, döms inte bort. woff2-start-
tider ur networkRequestTime (µs, DevTools-monoton klocka) — skalbevis:
syskonfonterna landar 38–42 ms vilket matchar o54 §2:s preloadade
referens­fönster. TBT-talen bär lastband (32 zcode-processer på
servern under fönstret); strukturbevisen (a)/(b) och `_rsc`-räkningarna
är lastokänsliga. Solo-mätfönster deklarerat. R2 orörd; data/blogg/
orörd; src-rörd ENBART home-section.tsx (§3) — syskonens ytor orörda.
