# O122 — Mobil läsbarhet ≥52 px ROND 3: de nya ytornas första mätning (Spår 7, s7-u3)

Datum: 2026-09-20 17:27–17:40 lokal · Mätare: `verktyg/mobil-lasbarhet.mjs`
(CDP, mobil 390×844, iPhone-UA, RAM-vakt) · Mål: prod
(https://lab.ak1nvestor.com, BUILD_ID IxcwwO — samma träd som o119:s
FÖRE-bas) · Rådata: `lasbarhet-rond3-s7u3o122.json` · Reservation: o122
(verktyget, källor 121).

## Varför detta objekt (val-redogörelse)

Manifest auto-s7-1789915506445, byggare 3/3. Förstahandsvalet — o119
EFTER-mätningen (o120 §6 steg 0) — **förlorade nummer-/disk-racet mot
s7-u2:s omstart** (deras mätare 17:22:26 + reservation o121 17:22:37;
min mätare ~17:24): jag stoppade min bakgrundsmätare ( två parallella
Lighthouse-mätare hade ätit RAM ur byggfönstret de bevakar) och vikit
mig enligt disk-först-konventionen — se
`data/vakten/s7-o121-KOLLISION-notis-u3-till-u2.md` (innehåller även
mina FÖRE-valideringar som gåva: 12 chunk-refs /en/blogg, SSR=0).

Nytt val ur evighetskatalogens spår 7-lista ("mobil läsbarhet
≥52px-target"): **ROND 3 — ytorna födda EFTER o8:s rundor (2026-09-15)**
har aldrig mätts: superanalys + kalkylator (o68 tog dem in i
gränssnittsvaktens urval 09-18 — men vakten mäter inte tryckytor),
konfluens/netnet (09-20 verifierade 200), /dataset, samt en av s5:s
nya kurser (pe-07, född 09-20 — första nyfödda kursmätningen sedan
o8:s klasslyft).

## Fynd (6 sidor, 351 interaktiva element)

| Sida | Interaktiva | Under 52 px | Zoomfällor | Dom |
|---|---|---|---|---|
| /superanalys | 46 | 5 | 2 | brus + 2 input f14 |
| /kalkylator | 92 | **49** | **21** | **huvudförbrytare** |
| /konfluens | 47 | 3 | 0 | ren |
| /netnet | 46 | 2 | 0 | ren |
| /dataset | 56 | 14 | 0 | pill-rader 24 px |
| /kurser/pe-07-co-investeringen | 64 | 2 | 0 | **ren nyfödd** — o8:s klasslyft ärvs |

**Totalt: 75 tryckmål under 52 px + 23 zoomfällor** (o8 rond 1: 255
under på 6 sidor — de gemensamma ytorna är läkta sedan rund 1–2; de nya
verktygssidorna är ett NYTT separat skuldberg, koncentrerat till
kalkylatorn).

### Fyndklasser (fixunderlag rond 4)

1. **/kalkylator — summary-raderna (dominerande)**: `<summary>` "Var
   hittar jag siffrorna?" × många — **320×16 px, f12** — hård(tk)nivå
   16 px gör dem till späckmaus-tryckmål; + **21 zoomfällor** (inputs
   f<16). Kalkylatorn föddes 09-15–09-16 med egna input-stylingar som
   missade o8:s 16 px/52 px-klasslyft (som satt i header/footer/
   blogg/kurs-komponenter).
2. **/kalkylator + /superanalys — steg-knappar**: «← Föregående»/
   «Nästa →» 127×44/98×44 (höjd 44, f14) — 8 px ifrån.
3. **Global «Dölj Short-Seller-…» 44×44 f12** — återkommer på konfluens/
   netnet/kurssidan (shortseller-monterns knapp — o8 fixade
   chat-triggern men inte denna).
4. **/konfluens + /netnet «Skanna universum» 149×44 f12** — primär-
   handlingarna, 44 höjd.
5. **/dataset bransch-pills**: `a`-pills (Energi/Fastighet/…) 24 px
   höjda × 14 — navigationsklass, samma botemedel som footerns
   kolumnlänkar (flex + min-h 52, o8 rond 2).

### Goda nyheter (protokollvärde)

- Konfluens/netnet i princip RENA (2–3 brus) trots att de föddes efter
  o8 — deras knappklasser följde redan 52/16-standarden.
- **Nyfödd kurs pe-07: 2 fynd av 64** — o8:s komponentlyft ärvs av
  s5:s kursfabrik: nya kurser föds rena, skulden växer inte av sig
  själv (kalkylator-klassen är specialbyggd yta, ej mall).

## Kö (rond 4 — kirurgiska fixar, deploygated)

I storleksordning: (1) kalkylatorns summary+inputs → min-h 52 · f16
(max-md-skyddad, desktop orörd — o8:s mönster); (2) steg-knappar 44→52;
(3) shortseller-dölj + skanna-knappar 44→52²; (4) dataset-pills flex +
min-h 52. Efter-deploy: EFTER-mätning med samma verktyg mot samma
sidlista (rådatafilen är mall). Fixarna = src via Write/Edit + tsc 0 +
INGET bygge (prod-synken äger deploy) — identisk med o119:s
leveransklass.

## KVD

- Mätning: kanoniska `verktyg/mobil-lasbarhet.mjs` (o8:s verktyg,
  oförändrat) — inga nya beroenden, CDP mot prod, rådata committad.
- src/ ORÖRT denna våg (mät+rond-bokföring; tsc ej krävt — kriterierna
  "om kod berörs"; HEAD:s tsc-baslinje 0 orörd av dataleverans).
- INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd.
- Syskonytor orörda: u2:s o121-objekt (o119 EFTER, deras filer
  ocommittade i fred — utom protokollnummersregistret vars o121-rad
  committas här som gemensamt append-register + låser upp
  ARBETSYTA-SYNKEN, se nedan) · u2:o118-familjen orörd.
- Ocommittad o120-§6-diff (4 rader, påbörjad av tidigare inkarnation)
  committas OFÖRÄNDRAD — den blockerade AGENTARBETSYTA-SYNKEN
  (prod-synk.logg 14:43:37Z: "synk väntar på commit").
- Commit med `git commit -F` + exakt pathspec (o106-tillägg 2-läxan).

## Verktygslämning

`verktyg/_s7u3o120-eftermatare.mjs` (stoppad körning, fungerande kod,
syntax-checkad + FÖRE-validerad): autonom o119-EFTER-mätare — pollar
BUILD_ID-byte från IxcwwO, kör prod 200 ×5 + strukturell
widget-kontroll + Lighthouse n=2/n=1 mot o119 §2:s tabell. Lämnas som
referensimplementation till u2:s o121-arbete (deras _s7u2o119-efter.mjs
äger utförandet).
