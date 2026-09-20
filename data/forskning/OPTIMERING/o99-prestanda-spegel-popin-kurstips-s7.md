# o99 — Spår 7: SPEGEL-POP-IN — KVITTODOKUMENT (konvergens bokförd; kuren bars av u2:s o100)

**Ägare:** fabriksagent s7-u1 (byggare 1/3, manifest auto-s7-1789867506896, omgång 26-fönstret 2026-09-20)
**Anspråk:** `data/vakten/s7-o99-spegel-popin-u1-ansprak-2026-09-20.md` (disk-först 01:29:08Z FÖRE mätstart och src-ändring)
**Status:** STÄNGT GENOM KONVERGENS — köposten o89 §5 (spårets äldsta öppna) är kurad och
A/B-bevisad av syskonet s7-u2 (commit **9da2912c**, nr o100 efter tresyskonkollisionen;
worklog-rad 94eb8734). Detta dokument kvitterar u1:s andel: FÖRE-mätningarna + höjd-
kalibreringstäckningen + protokollmallen — och bokför öppet vad som blev av den egna kur-designen.

## §0 Tresyskonkollisionen (öppet bokförd — s6-precedens) + instansnotisen

Racet om o89 §5: **u1 01:29:08Z** (detta anspråk) → **u3 01:29:52Z** (44 s senare; felnummer
o98 — ägs av spår 8) → **u2 01:32:00Z**. u1:s sonder fastnade i RAM-låst fönster (367–412 MB
tillgängligt; vakten väntade ut det) medan u2 hann bevisa kuren färdig och commit:a först —
trefönster-precedensen ger leveransen åt u2 («deras kvitto deras»; u3 ställde ned och levererade
o101: oberoende dubbelbevis av roten + flagg-30.75-verifikation GRÖN).

INSTANSNOTIS: u1-sloten körde denna omgång med TVÅ parallella instanser (fabrikens redispatch
överlappade en levande instans). Instans 1:s leverans landade som **d9e14cca** (»o102 —
spegel-pop-in MÄTBACKBEN«: kalibringskurvan 9 sondpunkter, kurens dubbelbevis, kantregimer +
ramp-kurdesign) och bar s7u1o99-*-rådata. Detta dokument (instans 2) kvitterar ANSPRÅKETS
o99-öde och bär tablet-gap-leveransen o103 — noll ytoverlap med d9e14cca (den: kurstips/
spegel; denna: utvalt/kurser-svenska). u1:s original-o99-dok (raderat i fönstrets städning)
är återskapat HÄR med slutläget ifyllt.

## §1 Roten (källäsning + sond — oförändrad slutsats, oberoende bekräftad av u3)

`kurstips-kort.tsx` är klientkomponent med `if (tips.length === 0) return null` — SSR-passet
renderar INGET; `useEffect` fyller 3 tips vid hydratisering. På SPEGLARNA sitter tipsen
OVANFÖR vecket (tipsY 596/en · 524/ar mot svenska ~2 700 px) där content-visibility:s
platshållare aldrig gäller (onscreen renderas normalt): hydratiseringen fyller +364/+344 px
och knuffar KursSok-gridden utom synhåll = två skift à 0,1028/0,1017 (en) och 0,1396/0,1305
(ar). Svenska /kurser: samma fyllning men under vecket ⇒ CLS 0 (immunmekanismen).

## §2 FÖRE-mätningar (u1:s andel — BUILD_ID 9RBeu-wernShtKHNVQ6LI, giltighetsgrindad)

**Kanon-LH (u1, kanonverktyget `verktyg/prestanda-lighthouse.mjs`, belastat fönster):**
/en/kurser P54/LCP 4 479/TBT 1 353/CLS 0,1028 · /ar/kurser P38/LCP 5 646/TBT 7 082/
CLS 0,1396 (s7u1o99-fore-sammanfattning.json; CLS BITIDENTISKA med sondens skift A —
roten bekräftad oavsett fönsterbelastning; TBT/P är belastningskänsliga och ersätts som
referens av u2:s vilofönstertal P59/4 456/771 och P48/4 556/1 448, se 9da2912c).

**Blocksond-tvärsnitt (`_s7u1o99-kurstips-sond.mjs`, CDP + PerformanceObserver,
10 provpunkter t300–t3000):** wrapper (`div.mt-6.cv-kurstips`) 0 → 364 px (en) / 344 px (ar)
vid hydrat; griddens toppknuff dokumenterad; svenska kontroll Σ0. Rådata:
kurstips-s7u1o99-fore-{mobil,tablet,desktop,mobil360,500,600}-{en,ar}.json.

**Höjdkalibreringstäckning (proxy-ramp + golvtest, `kurstips-s7u1o99-proxy-*.json`):**
wrap-höjd per bredd 360/412/600 (en) — kalibreringsunderlag för mobilgolvets sluthöjder.
Ärlighet: "u2golv"-körningarna fick EJ in golvet i proxyn (injekterad: false i rådata) —
de värderas som ren höjdramp, INTE som oberoende CLS-bevis; det oberoende dubbelbeviset
levererade u3 (o101 §2, LHS-bitidentiskt). Inga slutsatser i detta dokument vilar på
golvtestfilerna.

## §3 Kur — levererad av u2:s o100 (9da2912c), konvergens med u1:s design

u1:s kur-design (o99-dok §1 originally): ny klass `.cv-kurstips-spegel` på SSR-wrappers +
`min-height`-glov i globals.css, kalibrerat per språk×bredd. **u2:s leverans nådde samma
mål med renare medel:** lang-scopat golv direkt på `.cv-kurstips` (html[lang="en"] 22.75rem
· html[lang="ar"] 21.5rem · md+ 15.5rem) — inga page.tsx-ändringar alls, samma höjdvärden
(u1:s ramp: 376@412-en ligger över u2:s 364-golv = över-skott, doktrinens föredragna fel).
A/B-bevis (u2): noll layout-shifts på båda speglarna; kanon-LH via proxy CLS 0/0.
**u1:s design är därmed supercederad — inget dubbelgolv liggers i trädet** (u1:s page.tsx-
editer återställda av u3:s nedställning; verifierat: `git status` ren på båda speglarna).

## §4 EFTER-kriterier (överlämnade till u2:s protokoll §5 — vakarövertag-barra)

1. Deploy-villkor: prod-synken deployad med 9da2912c som förfader; BUILD_ID lämnar
   9RBeu-wernShtKHNVQ6LI.
2. prod 200 ×5 https: / · /kurser · /blogg · /en/kurser · /ar/kurser.
3. Kurstips-sond EFTER båda speglarna: 0 layout-shifts med kurstips-källor.
4. Lighthouse speglarna: CLS ≤ 0,01; /kurser CLS 0 kvar (svenska kontrollen).
5. Gränssnittsvakten 0 fynd på nya bygget.

Verkställighetskommandon: se 9da2912c:s protokoll (o100-prestanda-spegel-cls-kurstipsgolv-s7.md §5).

## §5 KVD (u1:s andel)

- src/ rördes EJ av u1 i slutläget (kur-design supercederad; trädet rent på kurser-ytorna).
- tsc: ej krävt (ingen src-ändring); commit-pass via pre-commit-grinden (mekanisk typnoll).
- R2 orörd · data/blogg/ orörd · syskonens leveransfiler orörda (u3:s sond-JSON:er lämnade
  untracked — deras att bära; u2:s allt committat i 9da2912c/94eb8734).

## §6 Kö vidare

1. **TABLET-GAPET (o97 §6.3 → o101-flagg §6.3)** — utvalt-kortens 768–1 024-läge: TAGET AV
   u1 som **o103** (anspråk `data/vakten/s7-o102-tabletgap-utvalt-u1-ansprak-2026-09-20.md`
   med nr-precisering, protokoll o103-prestanda-tabletgap-utvalt-s7.md, samma fönster;
   arbetsnamnet o102 avsatt efter d9e14cca-kollisionen — se §0 instansnotisen).
2. o100-EFTER (deploy-villkoret §4) — vakarövertag enligt u2:s protokoll när prod-synken landar.
3. Register-SSR (o19 §3.1 + o97 §6.1) — huvudagentens bord, RÖRS EJ av fabriksbyggare.

## §7 Slutstatus

STÄNGT GENOM KONVERGENS 2026-09-20. Köposten o89 §5 (född 2026-09-19, bekräftad levande av
o96 §5.1 + retractionen + o97 §6.2) är kurad (u2:o100, 9da2912c) och dubbelbevisad (u3:o101
+ u1-instans-1:s mätbackben d9e14cca + FÖRE-tvärdata i detta dokument §2). EFTER-mätning
väntar deploy-villkoret (§4) — vakarövertag-barra.
