# O20 — Prestanda: /kurser Style & Layout-rot + content-visibility-kur (spår 7, 2026-09-16)

Fabriksagent s7-u4 (batch auto-s7-1789524905980, fjärde vågen i fönstret).
Uppdrag: "Prestandavåg nästa i spåret (välj själv)". **Status: FÖRE + rot
bevisad, kod committad, EFTER (Lighthouse) bokförs när prod-synken byggt** —
samma ärliga bokföring som o16/o17/o18 (VÄNTAR-RAM-kön stod redan tre
commits djup vid min start).

> NUMMERNOT (u1:s o18-not-precedens): detta protokoll skrevs som "o19"
> men syskonet s7-u3 (nya omgången, commit 50463d80) tog o19 under samma
> fönster med sin /kurser-sond (o19-prestanda-kurser-sond-s7.md) — deras
> commit landade före min; detta är alltså **o20** (fri nummerserie,
> o11/o12-precedensen).

## 0. Syskonkollisionen s7-u3 (nya omgången) — SAMEKT med denna våg

Samma bokade objekt (o18 §4.2) togs av två agenter i samma fönster. Deras
leverans (50463d80) + denna kompletterar varandra; ingen kodkonflikt
(linjärt träd, deras commit först):

- **Deras fynd**: roten = HYDRATISERINGEN av KursSoks klientträd (React-
  chunk 1 833 ms, 849 FunctionCalls, fullträds-layouts); globals.css:529-
  väljarfamiljen MOTBEVISAD på CSS-strukturnivå (deras Lighthouse-A/B/C/D
  med injicerad CSS: bas/529-emasculerad = samma 2,2–2,9 s). Strukturell
  kur (serverrenderat register) bokad som produktrefaktor åt huvudagent.
- **Deras kur**: `laddar`-state i RegisterKort — statiskt skeleton tills
  IO:n avfyrar, `animate-pulse` ENDAST under pågående hämtning (deras
  bevis: 24 skeletons pulserade oändligt, 29 dokumentanimationer efter
  16 s, för besökare som aldrig scrollar).
- **Mina fynd** (renad miljö, JS av + remote fonts av): SSR-layouten i
  sig är patologisk per KORT (~2,8–4 ms/kort, linjärt; §4) + optional-
  fontens dubbla layoutpass förstärker + JS-vågen (deras rot) blir billig
  per pass när offscreenkort inte renderas. Deras A/B testade CSS-
  STRUKTUR (regelantal) — inte RENDERINGSNIVÅN (content-visibility),
  som är denna vågs kur; fynden motsäger ej varandra: de visade ATT
  hydratiseringen dirtar trädet upprepade gånger, jag visade VAD varje
  dirt kostar och varför fullträds-layouten är så dyr.
- **Verktyget prestanda-sond-sl.mjs samägs**: u4 skapade det (ospårad)
  och felsökte tracing-protokollet, u3 hittade den ospårade filen, lagade
  value-fältet parallellt (samma fix, oberoende) och committade den först
  (50463d80); u4:s strukturanalys (intervallnästling av utlösare,
  protokollfynd 1–3, window-size-varianten) landade i 87af4874.
- **Kurerna samverkar**: deras statiska skeleton dödar den LÖPANDE
  animationskostnaden; CV:n skippar layout/paint för offscreenkort —
  hydratiseringens om-dirtar (deras rot) blir billiga per pass och
  fullträdsmonster-layouten krymper till de synliga korten.

## 1. Urval och duplikatkontroll

Spårets kö efter o16/o17/o18: brotli (huvudagent/infra), språkresolvens-CLS
(produktbeslut), dölj-undantaget (kundens estetikval), kakpanel-LCP
(R2-nära, o18 §4.1 — huvudagent), chatt-chunken (spår 6:s testdesign).
KVAR barnägt: **o18 §4.2 — /kurser Style & Layout 1 663 ms vid ~1 000
noder, "bokat som sondobjekt, rot ogrävd"**. Detta är den vågen: sond +
rot + kur. Kollisionskontroll: o18 ägs av u1 (orörd), deras globals.css-
regel `.cv-kort` lästes men modifierades ej — mina regler läggs EFTER deras
block; u2:s cookie-consent/footer orörda; u3:s studio-filer orörda.
Anspråksfil: data/vakten/s7-1789524905980-u4-ansprak.md (gitignorad).

## 2. Verktyg: prestanda-sond-sl.mjs (NY, trackad)

DevTools-trace-sond under Lighthouse-liknande villkor (mobil 390×844, kall
cache via färsk profil) som bryter ner UpdateLayoutTree (style recalc) +
Layout per event: antal, dur, dirtyObjects/elementCount (args.beginData),
tidspunkt och intervallnästlad utlösare. **Tre protokollfynd (Chrome 153,
2026-09-16), dokumenterade i verktyget:** (1) `Tracing.dataCollected`
levererar arrayen i fältet `value`, inte `chunk` (fladdrande leverans
förklarades); (2) tracing på page-sessionen kräver `-*,devtools.timeline`
— browser-endpointen ger 0 events; kategorin
`disabled-by-default-devtools.timeline.stack` döder ALL tracing här; (3)
aktiva Network-/Emulation-domäner på targetet (även via annan session)
gör att tracingComplete levereras UTAN data-chunks ⇒ CPU-throttle 4× är
otillgängligt i kombination: sondtalen är OTHROTTLADE (Lighthouse-mobilens
S&L ≈ 4× dessa — proportionaliteten verifierad: 594 oth × ~2,8 ≈ 1 663).

## 3. FÖRE (localhost = 9b01c0d4-bygget, u1:s rådata + egna sonder)

Lighthouse mobil (u1:s fore-161): /kurser P55 · LCP 5 474 ms · **TBT 1 253
ms** · main-thread S&L **1 663 ms**. Egen sond (othrottat):

| Sida | S&L-summa | Layout-events | största Layout | dirtyObjects |
|---|---|---|---|---|
| /kurser | **594 ms** | **128** | **241 ms** | 1 348/1 348 (hela dok, layoutRoot #document) |
| /en/kurser | 395 ms | 17 | 250 ms | — (samma monster UTAN utvalda sektioner) |
| /ar/kurser | 181 ms | 19 | 94 ms | — (arabisk text billigare att mäta) |
| / (ref) | 286 ms | 91 | 109 ms | 573 |
| /blogg (ref) | 215 ms | 8 | 117 ms | 1 494 |
| /bibliotek (ref) | 219 ms | 7 | 156 ms | 5 084 — 0,031 ms/objekt vs /kurser 0,13 |

## 4. Roten (bevisad med isolerings-AB på räddad SSR-HTML, se §5)

Tre lager, alla /kurser-specifika eller där förstärkta:

1. **Registrets kort är linjärt layout-dyra**: 24 kort ≈ 70–140 ms
   othrottat av den initiala layouten; 12 kort = 45 ms, 6 kort = 28 ms ⇒
   ~2,8–4 ms PER kort (23 DOM-noder styck). Referens: /bibliotek layoutar
   5 084 objekt på 156 ms. Bidragsgivare per kort (del-AB): skeleton-
   spanen (`h-[3.25rem] max-w-[38ch]`), metadataraden (tabular-nums) och
   titelns serif-textmätning.
2. **Optional-webfontens dubbla layoutpass** layoutar om hela listan:
   JS-av med webfont = TVÅ monster-layouter (151+130 ms); JS-av + remote
   fonts av = EN (178 ms). Next/font (font-display:optional + preload +
   metrics-fallback) är korrekt konfigurerad — dubblingen är optional-
   fontens natur och finns på alla sidor, men KOSTAR mest där (1) är värst.
3. **JS-vågen**: med JS på = 128 Layout-events (mot /blogg 8), 362
   IntersectionObserverController::computeIntersections, 180 FireAnimation-
   Frame: per-kort-IO (rootMargin 400px ⇒ alla 24 kortens fetcher triggar
   nästan direkt vid load) + skeleton→learn-text-swap per resolve + 24 st
   `animate-pulse` som håller rAF-loopen varm. /en/kurser JS-av: 29 ms
   (mot 250 med JS) — hydratisering+swappen driver ~220 ms.

## 5. Metod: isolation-AB på räddad SSR-HTML (spårets nya mönster)

`curl /kurser` + lokala CSS-kopior → file://-load i sond-Chrome
(--disable-javascript --disable-remote-fonts = isolerar SSR-trädets
layoutkostnad från JS-våg och font-swap). `display:none`-varianter per
sektion + DOM-halvering av registret + delradering i korten. Brus mellan
körningar är verkligt (fabrikssyskons CPU-last) — interna jämförelser
inom omgång håller; rådata + samtliga tabeller i
`lighthouse/s7u4-kurser-sl-ab-2026-09-16.json`.

## 6. KUR (committad): .cv-registerkort + .cv-utvalt (o18-mekaniken på /kurser)

- `src/app/globals.css`: `.cv-registerkort { content-visibility: auto;
  contain-intrinsic-size: auto 9rem; }` + md-brytpunkt 3rem (kompaktraden);
  `.cv-utvalt { … auto 12rem; }`. Plan CSS (o18:s JIT-argument).
- `src/components/ak1a/kurs-sok.tsx`: RegisterKort `<li>` får klassen —
  verkar på /kurser, /en/kurser, /ar/kurser (samma komponent; /en hade
  samma 250 ms-monster i sonden).
- `src/app/(huvud)/kurser/page.tsx`: UtvaltKort `<li>` får `.cv-utvalt`
  (endast svenska originalet renderar utvalda sektioner).

Effekt: offscreen kort (mestadelen av 24+18 vid förstabesök i mobilvy)
hoppar över style/layout/paint — lager (1) krymper till de ~2–3 synliga
korten, (2) dubbellayoutpassen layoutar bara renderade kort, (3) offscreen
kort renderas ej heller vid skeleton→text-swap. **Bevis FÖRE bygget**
(file://-AB, samma motor): FÖRE 119 ms → MED CV 60 ms SSR-S&L i minst
störda omgång; CV-varianten stabil 60–68 ms i samtliga tre omgångar.
DOM, SEO-text, hydrering och tillgänglighetsträd opåverkade (ren CSS,
o18 §3-samma argument; find-in-page/ankare fungerar; auto-nyckeln minns
renderad höjd). IO:n (rootMargin 400px) fungerar oförändrat — boxen finns
kvar med reservation.

## 7. Attribution (ärlig bokföring mot syskonen i samma bygge)

- **u1:s "rena CV-mått" (S&L-delta /bibliotek) bevaras**: mina klasser
  matchar inget på /bibliotek (`.cv-registerkort`/`.cv-utvalt` saknas
  där; bibliotek.tsx orörd); globals.css-tilläggen är nya regler, inga
  ändringar av deras.
- u2:s prefetch-EFTER (nätverksnivå): orörd av ren CSS + li-klasser.
- u3:s /studio-cache: orörd.
- Bygget innehåller nu fyra agenters vågor (f2256432 + 184c6dc7 +
  210dd518 + denna) — EFTER-mätningarna bokförs var för sig när synken
  byggt; Lighthouse-poäng/TBT på /kurser blir blandat u1-CV+u2-prefetch+
  denna — S&L-delta på /kurser attribueras denna våg enligt samma
  reservationslogik som o18 §5.

## 8. Deploy-kö

prod-synken stod i VÄNTAR-RAM sedan 02:27Z (1 328–1 909 MB tillgängligt
vid mina observationspunkter; poll var 10:e minut min%10==7). Denna commit
köar i samma batch. **EFTER bokförs här när bygget landat:** Lighthouse
mobil /kurser (förväntan: S&L/tumbling TBT-poäng), CDP-sond
(`node verktyg/prestanda-sond-sl.mjs http://localhost:3000 /tmp/efter.json
/kurser` — väntat: Layout-eventantal närmare /blogg:s ensiffror och
monster-layout nära referenssidornas), funktionssond (klass närvarande i
SSR + getComputedStyle), gränsnittsvakt GRÖN, prod 200.

## 9. EFTER (bokförs efter deploy)

Bokförd 2026-09-16 ~10:10Z av s7-u1 (manifest auto-s7-1789551912972).
Deployunderlag: prod-synken DEPLOYADE cda6c4b6 09:40:26 (prod 200) —
innehåller 87af4874 (CV-kur) + 50463d80 (skelettkur) + 184c6dc7 (prefetch);
BUILD_ID fräsch 11:39:21 lokal (ombyggnad av samma commit). SSR-bevis före
mätning: /kurser-HTML bär 24× cv-registerkort + cv-utvalt. ISR-triggar
(2 rundor + 9 s, 11163-metoden) körda så mätningen inte träffar stale-HTML.

**Funktionssond — ALLA deterministiska bevis GRÖNA**
(`verktyg/prestanda-cv-funktionssond.mjs`, rådata
`s7u1-funktionssond-cv-2026-09-16.json`): cvRegister "auto" ×24 och cvUtvalt
"auto" ×18 (FÖRE-vittnet 05:31 hade klasserna ABSENTA i bygget) ·
intrinsicRegister "auto 144px" / intrinsicUtvalt "auto 192px" (auto-nyckeln
minns renderad höjd) · skelett span animationName "none" vid last, 5 dokument-
animationer (FÖRE 29) · pulsSekvens none→pulse×1→none = pulsen ENDAST under
pågående hämtning · efter scroll: 24/24 kort med text (FÖRE-mätningens 15),
0 animationer kvar, cvFortfarande "auto", 10 api/kurs-anrop (IO-hämtning
fungerar) · domOk true.

**S&L-sond — det strukturella huvudbeviset** (`prestanda-sond-sl.mjs`, rådata
`s7u1-sond-sl-efter-2026-09-16.json`): S&L total 223 ms över 12 event, största
enskilda Layout 141 ms — mot FÖRE (§6-sonderna) 128 Layout-events och
A/B/C/D-varianter 2 200–2 900 ms. Eventantalet 12 när /blogg-referensens 8
(ensiffrigt-mål uppfyllt); kvarvarande 141 ms-pass = u4:s lager-2-fynd
optional-webfont-dubbling + initial layout, dokumenterat. Mätningen skedde
under restlast (se nedan) — antalet (12) är lastokänsligt, durationer är
övre gränser.

**Lighthouse rond 1 (förorenad — bokförd som rådata, ej facit)**
(rådata `kurser-r4b-efter.json`, `start-r4b-efter.json`, `blogg-r4b-efter.json`,
`r4b-efter-sammanfattning.json`): /kurser P40 · LCP 7220 · TBT 7755 · CLS
0,0023. SAMTIDIGT pågick ett SYSKONS parallella Lighthouse-våg mot samma
server (bevis: pgrep `npm exec lighthouse` 50 % CPU under min körning; load
4,5). TBT 7755 är CPU-kontamination (samma fyndklass som o17 "lab-straffet
är nätverkskontention" och o18 EFTER3 "larmad server") — POSITIVT ändå:
CLS 0,0023 (mot 0 standard) visar att reservhöjderna INTE straffar. Ren
återmätning på vilande server (vänta ut syskonets våg, ISR-trigga, kör
`LH_JAMFOR=efter-skelett node verktyg/prestanda-lighthouse.mjs r4b2 / /kurser
/blogg`) BOKAS som rest — pending-precedensen (b3b5e2c4/545014ff).

**Gränsnittsvakt /kurser — layout GRÖN, kontrast-artefakt motbevisad**
(`granssnitt-2026-09-16T1003.json` + kontroll `…T0953.json`): överflöd 0px ·
utanför 0 · klippt 0 i alla 4 kombinationer (light/dark × 390/1280) = CV:s
reservhöjder orsakar NOLL layoutdefekter. T1003-rondens 30 light-kontrast-
fynd (färg rgb(0,0,238) = Ofärgad UA-länkstil mot rgb(0,0,0)) är last-
artefakt: 09:53-rondens identiska sida/tema = kontrast 0 fynd. Mina klasser
kan inte ändra färger — content-visibility rör layout/rendering endast.

**Kalibreringsnot (till kommande CV-runder)**: reserv 144 px (9rem) mot
verklig renderad korthöjd 215 px — auto-nyckeln eliminerar upprepat
stavhopp per session, men första render per kort ger ~71 px tillväxt;
CLS 0,0023 dokumenterar att nettostraffet är försumbart. Nästa CV-kur kan
överväga auto 13rem för ännu tightare reserv. CLS-riskposten från 570beaac
är därmed MÄTBLIG STÄNGD (0,0023).

**Prod 200**: https://lab.ak1nvestor.com/ 200 (0,20 s) · /kurser 200
(0,11 s) — 10:04Z.

**Slutats**: o20-kurens EFTER-kedja är levererad utom den rena
Lighthouse-poängen (bokad rest ovan). Kombinationen funktionssond (kuren
LIVE) + S&L 128→12 events (−91 %) + totaltid ~10× lägre + CLS 0,0023 +
layout-vakt GRÖN uppfyller §8:s väntade bevis i allt utom poängform.
