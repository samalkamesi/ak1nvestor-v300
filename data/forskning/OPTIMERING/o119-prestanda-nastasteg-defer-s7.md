# o119 — Spår 7: NASTASTEG UR KRITISK HYDRATISERING — /en/blogg-anomalins KUR (o105 §6 post 3; o71 SearchModal-mönstret)

**Ägare:** fabriksagent s7-u1 (byggare 1/3)
**Anspråk:** `data/vakten/s7-o119-nastasteg-defer-u1-ansprak-2026-09-20.md`
**Commit:** 568a93a2 (pre-commit-grinden grön: tsc 0)
**FÖRE-träd:** BUILD_ID IxcwwO (deployad 14:43:23Z, 21 commits e4588c57)

## §0 Nummer-racet (öppen redogörelse)

Manuellt valt "o118" i anspråksfil 16:49:48 lokal — 2,8 min efter syskonet
s7-u2:s verktygsreservation (16:47, `data/vakten/protokollnummer.json`:
"longtask-sond CDP + widget-A/B", o110 §4.1-köposten). Disk-äger +
reservationsverktygets legitimitet: numret deras; jag omreserverade via
`verktyg/reservera-protokollnummer.mjs --nästa --ägare s7-u1` → **o119**
(högsta kända o118, 118 källor skannade). Kollisionsnotis:
`data/vakten/s7-o118-KOLLISION-notis-u1-till-u2.md`. Detta är s8:o117 §1:s
systematik i levande handling (sjätte fallet, FÖRHINDRAT denna gång av
verktyget): manuell disk-först-anspråksfil räcker INTE för nummerlås.

**Förhållande till s7-u2:o118 — komplement, ej duplikat:** deras våg =
attributionen (longtask-sond CDP + widget-A/B); denna våg = KUREN
(källändringen). Deras A/B på trädet med 568a93a2 som förfader får den
rena verifieringen: widget-rader ur det kritiska fönstret,
bootstrap-chunkarna (2feezv-familjen, deras trace-fynd) orörda.

**s7-u2:o118 SLUTLEVERERADES under detta fönster** (worklog + protokoll
OPTIMERING/o118-prestanda-enblogg-longtask-s7.md) med tre fynd som
nyanserar denna kurs EFTER-förväntan — bokfört ärligt: (1) deras
widget-hypotes gällde LasyChatWidget (CHATTEN — en annan widget än
NastaSteg) och motbevisades; (2) anomalins mekanik = FCP-timing (en når
FCP 1 241–1 665 ms mot ar 2 238 ⇒ fler tidiga eval-tasks i
TBT-fönstret) + framework-eval (React 70 + i18n 47 + App-Router 42 KiB,
allt ramverk, noll döda chunkar); (3) delat en−ar-gap 786 ms (o110) är
redan ~90–140 ms på IxcwwO (en 651/547 · ar 508 · CLS 0 ×3). Slutsats
för o119: kurens facit bärs av de STRUKTURELLA kriterierna (§5.3 —
widget-klassen ur kritiskt fönster på ~46 sidor); TBT-påverkan på
/en/blogg väntas BLYGSAM då anomalin är FCP-timing-mekanik. o105 §6
post 3:s motiv (widgetens hydratisering som kvarvarande börda) kvarstår
som klass-rättfärdigande — FÖRE-beviset §2 (fem strängar i 57 kB-chunk,
12–17 initial-referenser/sida) är oberoende av deras attribution.

## §1 Objekt och rot

- **o105 §6 post 3:** "NastaSteg-widgeten (klient under shellen) —
  kandidat för samma serverbindning om EFTER visar kvarvarande TBT-halva."
- **o109:s facit:** "/en/blogg:s gap tyst↔lastigt (~325 tyst mot ~1 100
  under last) bekräftar o105 §6.3-kandidaten som nästa kur."
- **o110 §4.1:** /en/blogg TBT 1 129 mot kriterium ≤500, script-last
  identisk 15/254 KiB FÖRE/EFTER — ej payload; anomalin öppet bokförd.

**Rot (varför widgeten kostar):** NastaSteg är en klientkomponent i
SeoPageShell-trädet på ALLA ~46 SEO-sidor. Den medför (1) modulkod i
shellens delade initial-chunk, (2) React-hydratisering av komponenten,
(3) efter mount: member-local-läsning + setState-re-render + DOM-insert +
style/layout — allt innan TTI-mätningens slut. Widgeten har dock
**SSR=null-kontrakt** ("Klientside-safe: tomt första passt"): den
renderar ALDRIG något i server-HTML och inget synligt förrän useEffect
kört — exakt o71:s RefMottagare-klass.

## §2 FÖRE-bevis (BUILD_ID IxcwwO)

**Struktur (RAM-fri, grep i .next + SSR-HTML):** chunk `10f47l5mmeoxy.js`
(56 982 B rå / 17 354 B gzip) bär widgetens FEM unika strängar ("Håll
streaken levande" · "Fortsätt läroplanen" · "Testa hela analysflödet" ·
"Räkna på ett nytt case" · "Djupdyk i dina innehav") och refereras i
initial load (SSR-HTML:ns script/flight-referenser): **12 ggr /en/blogg ·
12 ggr /ar/blogg · 13 ggr /blogg · 17 ggr /kurser** — o76:s
palett-klump-klass: en shell-komponents kod tvingad med på alla sidor.
(Grannchunk 1g-ao94v8_dwk.js = annan komponent — bara "dagens-pass"-
länkar, ej widgetens.)

**Lighthouse FÖRE (mobil 4G-simulering, localhost, load ~1,3, RAM-grind
grön 1 989 MB, 2026-09-20 16:53 lokal):**

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| /en/blogg | P67 | 4 059 | **876** | 0 |
| /ar/blogg | P66 | 4 561 | 737 | 0 |
| /blogg (sv) | P75 | 4 232 | 348 | 0 |

Paritet med o110:s EFTER-fönster (sv 329,5): mätningen bär anomalin i
ett medel-lastigt fönster — /en/blogg:s 876 sitter mellan o109:s tysta
325 och lastiga ~1 100.

## §3 Kuren (src/ ENDAST Write/Edit)

| Fil | Roll |
|---|---|
| `src/components/ak1a/nasta-steg-latad.tsx` | NY — tunn "use client"-wrapper: `export const NastaStegLatad = dynamic(() => import("@/components/ak1a/nasta-steg").then(m => ({ default: m.NastaSteg })), { ssr: false })` |
| `src/components/ak1a/seo-page-shell.tsx` | EDIT — konsumentbyte till wrappern (2 rader) + o118/o119-precedensnot i dokumentationsblocket |
| `verktyg/testa-s7-o119-nastasteg-defer.mjs` | NYTT — kontraktstest |

**Varför inte o105:s serverbindning:** widgeten är personlig
(localStorage-statistik) — serverbindning vore ett brutet kontrakt. Men
SSR=null-kontraktet gör SearchModal-mönstret (o71) kirurgiskt: dynamic
ssr:false (i klient-wrapper — App Router förbjuder ssr:false direkt i
serverkomponenter som SeoPageShell) flyttar modulen till egen chunk som
hämtas först efter sidans kritiska hydratisering.

**Kontrakt-matrix:**
- SSR-HTML: **bitidentisk** (fallback null = förra null-renderen; inga
  DOM-ändringar alls på servern)
- No-JS: orört (widgeten syntes aldrig utan JS)
- Eleven: ser sektionen vid samma logiska tidpunkt (efter mount; chunk-
  hämtning ~10–50 ms lokalt, sektionen ligger under vecket i
  cv-nasta-steg-containern — osynlig fördom)
- MGTM/o105-spegelgrenar: orörda (kontraktstest B5)
- nasta-steg.tsx: orörd fil (kontraktstest C1–C4)

## §4 Kontraktstest + typ

`node verktyg/testa-s7-o119-nastasteg-defer.mjs` → **15 PASS 0 FAIL**:
A1–A4 wrapper (use client-direktiv, dynamic ssr:false, import+named
export) · B1–B6 shell (konsumentbyte, direktimport borta, renderplats,
serverkomponent kvar, o105-grenar orörda, precedensnot) · C1–C4 widgetens
kontrakt orört · D1 exklusivt ägarskap (nasta-steg importeras ENDAST av
wrappern i hela src/ — koddelningen håller).

`node node_modules/typescript/bin/tsc --noEmit` → **exit 0** (0 fel).

## §5 EFTER-kriterier (vakarövertag-barra)

1. prod-synken deployad med 568a93a2 som förfader (BUILD_ID lämnar IxcwwO).
2. prod 200 ×5: / · /blogg · /en/blogg · /ar/blogg · /en.
3. Struktur: widgetens kännetecken EJ i initial-chunkarna på shell-sidor;
   egen chunk hämtad efter kritiskt fönster; SSR-HTML bitjämförbar.
4. Lighthouse n=2 /en/blogg: TBT ↓ (mål ≤500 i tyst fönster); /ar/blogg +
   sv /blogg ±15 %; CLS 0 kvar (o100-nivån); LCP/FCP ±15 %.

**Status vid fönstrets slut:** se §6 — deployen RAM-gated (1 575 MB vid
17:00 mot synkens 2 200-krav; synkloggen 14:43:37Z visade dessutom att
arbetsytasynken väntade på just denna commit — nästa RAM-fönster deployar).

## §6 Driftläge + deploybevakning

- 14:29:49Z: OOM-dödat bygg i synken (infra, känt mönster) → 14:37 ny
  kod → 14:43:23Z DEPLOYAD (IxcwwO — FÖRE-trädet för denna våg).
- 14:43:37Z: arbetsytasynk väntade på commit ("ocommittade ändringar i
  ytan skyddas (2 rader)") — det var denna vågs kurfiler; commit
  568a93a2 löste blockeringen.
- Bevakning pågick till fönstrets slut; EFTER-status bokförs här + i
  worklog-radens slutläge. Om deployen landade: EFTER-mätning n=1–2 om
  RAM-grinden öppnade; annars lämnas kriterierna §5 till vakarövertag
  (o105 §4-precedensen: EFTER-vågen mäter n=2 mot denna FÖRE-tabell).

## §7 KVD

- src/ ENDAST Write/Edit (2 filer: 1 ny wrapper + 1 edit) · tsc 0 via
  projektbinär · kontraktstest 15/0 · INGET bygge (prod-synken äger —
  bevisat igen 14:43Z) · R2 orörd (ingen pris-/tier-/publiceringsyta) ·
  data/blogg/ orörd · nasta-steg.tsx orörd · syskonytor orörda (s7-u2:s
  o118-rådatafiler orörda; deras sond kan validera kuren på nya trädet) ·
  commit med `git commit -F` (pre-commit-grinden passerad med tsc 0).

## §8 Kö vidare

1. **EFTER-mätning av denna kur** (vakarövertag): §5 kriterier.
2. s7-u2:o118:s köpost (deras §6): transportlagrets kur är slut — nästa
   /en/blogg-steg är listlängd 24–36 + visa-fler (flight −60–75 %) men
   ÄNDRAR kundupplevelse tre språk = ÖPPET PRODUKTBESLUT i nästa rond,
   ALDRIG fabriksautonomt; alt. content-visibility bär CLS-risk mot
   o100:s heliga noll. (Deras FCP-timing-mekanik = anomalins rot — inte
   botbar av widget-defer.)
3. o105 §6 post 3 därmed STÄNGD som leverans (kuren levererad; facit
   väntar EFTER-mätningen).
