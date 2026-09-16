# O28 — Prestanda: mätkalibrering — r5u2-fore kontaminerad, blogg-TBT-skulden stängd som artefakt (spår 7, 2026-09-16)

Fabriksagent s7-u2 (manifest auto-s7-1789551912972, uppgift 2/3).
Uppdrag: "Prestandavåg nästa i spåret (välj själv): mät före/efter,
prod 200, mätning bokförd." **Status: LEVERERAD — en mätvåg utan
kodändring; fyndet ÄNDRAR spårets sanningsbild och o27:s EFTER-tolkning.**

> Nummernot: skrevs som nästa fria siffra efter o27 (fri nummerserie,
> o11/o12- och o18/o19/o20-precedenserna). Anspråksfil:
> data/vakten/s7-1789551912972-u2-ansprak.md (gitignorad).

## 1. Urval och vändelsen (ärligt bokförd)

Första val = **/blogg TBT 5 267 ms** — o27:s notering "spårets största
öppna prestandaskuld efter denna våg — kandidat för nästa koddelningsvåg
(blogglistans klientkomponenter)". Rotjakten DROG IGÅNG och gav ett
mönster som inte stämde:

- Long-tasks: 1 417 ms i chunk 327cduvy_2_u9 + 1 110+665 ms i 3tc9l_yj
  (react-dom-kandidat) — chunkar SOMME DELAS MED /, som ändå mätte
  TBT 1 121. Samma chunk 92 ms på / och 1 417 ms på /blogg = koden gör
  per-instansarbete ELLER mätningen är fel.
- Chunk-diff /blogg mot /: fyra små blogg-unika chunkar (2–20 KiB),
  inget av de dyra namnen. Tunga libs (recharts, @mdxeditor, satori,
  react-syntax-highlighter) har INGA klientimportörer alls — dödvikt i
  package.json, ej i bunten.
- Strukturmotbeviset: **/kurser — samma SeoPageShell-skal, STÖRRE DOM
  (899 vs 653 element) och hydratiserande kursregister — mätte TBT 1 343
  mot /blogg:s 5 267.** En statisk länklista ska inte vara 4× dyrare än
  den interaktiva grannen.

Då landade u1:s r4b2 (ren om-mätning, o20 §9:s bokade rest) — och
förklarade allt. SLUTGILTIGT VAL = **mätvåg**: bevisa artefakten med en
egen tredje mätning, stäng skulden, kalibrera spårets sanningstabell.

## 2. Beviset: tre mätfamiljer, SAMMA bygge

Alla sex runer nedan mäter **cda6c4b6-bygget** (deploy 09:40:26 UTC,
BUILD_ID 11:39:21 lokal; OOM-dödade 10:02:39 ändrade inget — pm2
fortsatte servera samma bygge ur minnet). Ingen kod bytte mellan runerna.

| Run (UTC) | Kontext | / P·TBT | /kurser P·TBT | /blogg P·TBT | CLS ×3 |
|---|---|---|---|---|---|
| r5u2-fore 09:51–52 | **kontaminerad** | P52 · 1 121 | P47 · 1 343 | P49 · 5 267 | 0/0/**0,110** |
| r4b2 10:06–07 (u1) | lugnare | P99 · 76 | P93 · 279 | P92 · 336 | 0·0·0 |
| r7u2kal 12:19–21 (denna) | load 0,75→2,3 | P92 · 327 | P76 · 1 095 | P89 · 442 | 0·0·0 |

**Kontamineringsbeviset för r5u2-fore:**

1. **Tidsöverlapp, dokumenterat av tre parter**: u3:s worklog-rad —
   "båda körde r4b-efter överlappande 11:49–11:51" (lokal tid; =
   09:49–09:51 UTC) med pgrep-bevis på syskonets `npm exec lighthouse`
   50 % CPU och load 4,5. blogg-r4b-efter fetchTime **09:50:50** →
   start-r5u2-fore fetchTime **09:51:32** → den förra s7-u2-agentens
   FÖRE-mätning startade MEDAN u1:s Lighthouse fortfarande körde, och
   blogg-r5u2-fore (09:52:36) följde 20 s senare.
2. **benchmarkIndex vittnar om CPU-svält**: blogg-r5u2-fore = 1 170
   mot start-r5u2-fore = 1 550 (25 % tröttare maskin under just den
   runen — Lighthouses egna kalibreringsmätning fångar konkurrensen).
3. **15,7× TBT-skillnad utan kodändring** mellan r5u2-fore och r4b2 på
   /blogg; 14,8× på /. FCP rörde sig marginalt (1,6→1,3 s) — TBT är
   CPU-throttle-simuleringens mest lastkänsliga mät och blåses upp när
   konkurrerande processer tar kärnorna (samma fyndklass som o17
   "lab-straffet" och o18 EFTER3 "larmad server" — denna våg flyttar
   den från notis till uppmätt kvot).

r7u2kal (denna vågs egen mätning, `node verktyg/prestanda-lighthouse.mjs
r7u2kal / /kurser /blogg`, last 0,75 vid start, 2,26 under /kurser-runen)
bekräftar oberoende: /blogg TBT 442 — **5 267 reproduceras inte i någon
lugnare miljö**. Samtidigt visar /kurser 1 095 (mot r4b2:s 279) att
TBT på denna delade 8 GB-server fluktuerar ~4× även mellan "rimliga"
lägen — se §4 protokoll.

## 3. Konsekvenser för spåret (detta dokumentets värde)

1. **Blogg-TBT-skulden STÄNGD som artefakt.** Ingen koddelningsvåg på
   /blogg-listan mot TBT 5 267 — kur mot artefakt = spökjakt (den denna
   agent höll på att börja bygga; vändelsen bokförd i anspråksfilen).
   /blogg är i lugnare lägen P89–92 · LCP 1 577–1 800 · TBT 336–442 ·
   CLS 0. Blogglistans struktur (55 kort, 137 länkar, 653 element) är
   FRISK — ingen patologisk klientkostnad finns.
2. **CLS-fluktuationsteorin STÄNGD** (o27-noteringen "0 → 0,110 mellan
   mätruns utan kodändring — sondera före regressionsdöm"): CLS 0,110
   förekommer ENDAST i den kontaminerade r5u2-fore; r4b2 + r7u2kal = 0
   ×6. Ingen kod-CLS att jaga. (r4b-efter-rondens 0,0023 = CV-reservens
   försumbara netto, redan stängt i o20 §9.)
3. **o27:s FÖRE-tabell är en lastspiegel, inte en kodbaslinje.** Alla
   siffror i r5u2-fore-tabellen (P52/P47/P49, TBT 1121/1343/5267, CLS
   0,110) ska läsas som "mätt under CPU-kontamination". Koddelningskuren
   (35b240d7) är fortfarande RÄTT — dess grund var OCKSÅ strukturell
   (grep-verifierad ivrig bundling av ~190 kB källkod som aldrig
   renderas; unused-JS-poäng 0 med 83–122 KiB spill i tre rapporter) —
   men EFTER-tolkningen måste mot rätt referens:
4. **Tolkningsdirektiv för vakarens r5u2-efter** (o27:s EFTER-tabell
   fylls av nästa omgång): jämför INTE mot r5u2-fore. Ärlig FÖRE för
   koddelningskurens deploy-bygge = r4b2 + r7u2kal (samma kodbas):
   / P92–99 · LCP 1 770–1 887 · TBT 76–327 · /kurser P76–93 · TBT
   279–1 095 · /blogg P89–92 · TBT 336–442 · CLS 0. Kurens förväntade
   signatur är bootup-time/unused-JS/byte-weight-rörelse (kritisk bunt
   −~190 kB källkod), INTE TBT-poäng (som drunknar i lastbrus, §4).
   Notera: r4b2:s unused-javascript-audit lämnade TOM coverage
   (poäng 1 utan items) — den auditen kan varken be- eller motbevisas
   i r4b2; kurens unused-JS-bevis bär strukturanalysen + EFTER-runens
   egna siffror.
5. **/kurser-tolkning**: r7u2kal:s 1 095 vs r4b2:s 279 (samma bygge,
   CV-kur + skelettkur båda live sedan cda6c4b6) visar att TBT-intervallet
   är brett även i "normaldrift". o20:s strukturella bevis (S&L-events
   128→12, funktionssond GRÖN) är de lastokänsliga bärarna — exakt
   rätt metod, behåll den.

## 4. Protokoll — mätdisciplin (processkuren, åt kommande vågor)

Fyndet generaliserar: **på denna delade server är Lighthouse-TBT inte
reproducerbart utan lastkontext** — kvoten kontaminerad/lugn = 4–15×.
Regler för spårets kommande mätningar:

1. **Före varje Lighthouse-run**: `pgrep -af lighthouse; pgrep -c
   chrome; uptime; free -m` — ingen run startar medan en annan
   Lighthouse/Chrome-våg lever, eller vid load > ~1,5 (1-min).
2. **Bokför kontexten**: fetchTime + benchmarkIndex + load före/efter
   in i sammanfattningen. benchmarkIndex < ~1 250 = varudeklaration.
3. **TBT/poäng utan lastkontext = rådata med varudeklaration** (o20 §9:s
   mönster), ALDRIG facit för kur/förslöning. Beslut om kur ska tåla
   ett lastbrustest: slutsatsen ska hålla i BÅDA ändar av det observerade
   intervallet, eller bäras av lastokänsliga bevis (strukturräkningar,
   funktionssonder, nätverksräkningar — o17/o20-mönstren).
4. **FÖRE-baslinjer för kommande kurer** mäts vid två tillfällen i
   lugnare läge; intervallet (inte punkten) är baslinjen.

## 5. Leverans + bevis

- Egen mätning: `r7u2kal` — start/kurser/blogg-JSON +
  sammanfattning (load 0,75→2,26 bokförd ovan).
- Prod 200: https://lab.ak1nvestor.com/ 200 (0,13 s) · /blogg 200
  (0,12 s) · /kurser 200 (0,11 s) — 12:2x lokal.
- Ingen src-ändring → tsc-baslinjen orörd (grinden verifierar varje
  commit). R2 orörd (inga priser/tier/publicering; inga data/blogg/-
  rörelser).

## 6. Syskonkollisionsbokföring

- u1:s r4b2-filer: LÄSTA + korsrefererade, orörda (deras leverans, deras
  namnrymd). Denna vågs fynd bygger ovanpå deras — deras "ren om-mätning
  bokad som rest" blev kuggen i denna kalibrering.
- o20/o27: orörda (ägande syskon i föregående omgångar). §3-punkterna
  3–4 är skrivna som TOLKNINGSDIREKTIV hit — nästa s7-omgång/huvudagenten
  fyller o27:s EFTER-tabell mot r4b2+r7u2kal-intervallet.
- Vakaren (/tmp/s7u2-vakare.mjs, PID 1064604 vid kontroll): LEVER,
  orörd — dess r5u2-efter-filer är fortfarande rätt EFTER-rådata; bara
  JÄMFÖRELSEPEKET ändras (mot r4b2/r7u2kal, aldrig mot r5u2-fore).
- Fabrikens manifest auto-s7-1789551912972: u3 klar (28881255), u1
  pågår (r4b2 + o20 §9), denna = u2. Worklog-append väntar in u1:s
  commit (deras rader ligger osparade i worklog.md — gemensam fil,
  append sker efter deras commit för att inte kapra deras text).
