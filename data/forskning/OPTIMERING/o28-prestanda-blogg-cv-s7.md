# O28 — Prestanda spår 7: /blogg-skuldens artefaktdiagnos + CV-kur på blogglistorna (2026-09-16)

**Ägare:** fabriksagent s7-u1 (byggare 1/3) · **Status:** KOD LEVERERAD (denna
commit) · tsc 0 · EFTER-mätning bokad enligt o17 §METOD (se §6)

## §0 Objektval + duplikatkontroll

Uppdrag: nästa prestandaobjekt i spåret. Kontroll före val (worklog +
OPTIMERING-katalogen): läsbarhet 52px STÄNGT (o8, prod-verifierat 255→6),
cache 2 ronder (o10+o13), koddelning o5+o27 (o27:s EFTER väntar deploy —
vakarens yta), CV /bibliotek (o18) + /kurser (o20) slutbehandlade, prefetch
(o17) EFTER-infriad, /studio-årslås (o16), bildoptimering avförd (o27
§OBJEKTVAL: inga bildauditer flaggas), chatt-chunk avstått (spår 6:s
testgrep). o27 §Noteringar lämnar exakt Två öppna barnägda objekt:
(1) "/blogg TBT 5 267 ms = spårets största öppna skuld", (2) recharts-
deprekeringskopplingen. Denna våg tar båda — och (1) visar sig vara ett
diagnosfynd, inte en kodbudget (§1).

## §1 ARTEFAKTDIAGNOS: skulden är mätartefakt, inte kod

o27:c FÖRE-tal för /blogg (TBT 5 267 ms, P49) kommer ur `blogg-r5u2-fore.json`
(09:45). Samma kod, **vilande server** (r4b2, 10:07 — 0 lighthouse-processer,
ISR-trigga före, 11163-metoden):

| Mätning | /blogg poäng | LCP | TBT | CLS | mainthread |
|---|---|---|---|---|---|
| r5u2-fore 09:45 (fabriksbarn + parallell Lighthouse på servern) | 49 | 5 134 ms | 5 267 ms | ~0 | 11,1 s |
| **r4b2 10:07 (vilande)** | **92** | **1 800 ms** | **336 ms** | **0** | **1,8 s** |
| r4b-efter 11:50 (syskon-kontaminerad, last 4,5) | — | 5 159 ms | 2 500 ms | 0 | 7,1 s |

r4b2 togs dessutom FÖRE prefetch-kurens deploy (~11:40) — /blogg var alltså
P92/TBT 336 redan före den kuren. **Slutsats: "TBT 5 267 ms" är 100 %
last-artefakt** (samma fyndklass som o17/o18:s dokumenterade "larmad server";
c4491ece bokför redan risken). Spårets "största öppna skuld" stängs HÄR med
bevis: /blogg är mätbart friskt på vilande server. Prefetch-kurens äkta
/kurser-vinster (28881255) förblir orörda av denna omvärdering.

**Metodregel för spåret (bokförs):** FÖRE-baslinjer mot localhost FÅR endast
värderas om servern verifierats vilande (pgrep lighthouse, load) — r5u2-fore-
klassens tal ska aldrig mer kunna öppna ett "största skuld"-objekt utan
vilande om-mätning.

## §2 Recharts = dödimport (0 konsumenter)

`grep -rln 'ui/chart"' src/**` → **noll träffar**: recharts-wrapper
`src/components/ui/chart.tsx` importeras av ingen. Recharts bundlas därmed
i ingen chunk (Next tree-shake:ar oimporterade moduler) — npm ci:s
"recharts 2.x deprekerad"-varning är kosmetisk, noll runtime-påverkan.
Borttagning ur package.json = beroendeförändring (npm-förbudet + vaktkontrakt)
→ bokas som fristående städning till huvudagent, INTE denna våg. o27:s
"om diagrammen sitter i blogg/analys-ytor" besvaras: de gör det inte.

## §3 Kvarvarande ÄKTA /blogg-kostnad → CV-kur

r4b2:s mainthread-fördelning på /blogg: **styleLayout 835 ms** (största
posten) · other 621 · scriptEval 127 · parseHTML 91. Dokumentet
(/blogg-HTML) 1 139 ms total. Orsak: listan renderar **alla 55 inlägg i
initial HTML** (~653 elementnoder, 228 KB HTML) — precis det mönster o18
(/bibliotek) och o19/o20 (/kurser) kurade med content-visibility. /blogg:s
tre speglar saknade kuren (bekräftat: inga cv-klasser i blogg-listorna).

## §4 KUR (denna commit)

- `globals.css`: `.cv-bloggkort { content-visibility: auto;
  contain-intrinsic-size: auto 22rem; }` — en höjdnivå (kortens höjd varierar
  mindre mellan brytpunkter än registerkortens); auto-nyckeln minns senaste
  riktiga höjd per kort (o18/o20-mekaniken, prod-bevisad CLS 0).
- Klassen på kort-div:en i `(huvud)/blogg/page.tsx` + `(en)/en/blogg/` +
  `(ar)/ar/blogg/` (egna page.tsx per spegel —三个 ytor, samma klass).
- DOM, SEO-text, hydratisering, tillgänglighetsträd orörda — webbläsaren
  hoppar bara över style/layout/paint för offscreenkort (≈46 av 55 kort på
  mobil-1-kolumn; ≈49 av 55 desktop-3-kolumn).
- [slug]-artikelsidorna avstås: ett inlägg per sida, ingen kortlista.

## §5 FÖRE-baslinje

FÖRE = `lighthouse/blogg-r4b2.json` (P92 · LCP 1 800 · **TBT 336** · CLS 0 ·
styleLayout 835 ms · doc 1 139 ms). Ärlighet: r4b2 togs före prefetch-
deployen; den kurens /blogg-effekt är nätverksside (färre RSC-hämtningar),
inte styleLayout — baslinjen för CV-isoleringen är giltig på /blogg-koden
före denna commit (inga andra src-ändringar rört blogglistorna sedan r4b2).

## §6 EFTER — INFRIAD 2026-09-16 ~18:2x (fabriksagent s7-u3 3/3, vakarövertag)

Förutsättningarna prövades i ordning: deploy KLAR (35b240d7 + denna kürs
commit i HEAD; prod-HTML bär `cv-bloggkort` ×55, BUILD_ID 18:09,
JS-chunks 200 = §7:s incident läkt) — vakaren DÖD sedan 12:39 utan
mätning (`/tmp/s7u2-vakare.log`: "TAK: deploy av 35b240d7 ej klar på
40 min — EFTER-mätning ej körd") ⇒ övertag utan kontaminationsrisk
(0 lighthouse/chrome-processer verifierat före varje körning).

1. **Funktionssond GRÖN** (verktyg/_s7u3-bloggcv-funktionssond.mjs, CDP
   390×844, rådata `lighthouse/s7u3-funktionssond-bloggcv-EFTER-2026-09-16.json`):
   55/55 kort bär klassen · `contentVisibility "auto"` på första OCH
   sista · reserv `auto 352px` (22rem korrekt) · 0 dokumentanimationer
   vid last · efter scroll: 55/55 textfyllda, sista kortet 348 px
   (verklig höjd), cv fortfarande auto · DOM totalt 704 noder.
2. **Lighthouse** (ISR-trigga ×2 + 8 s enligt 11163; instrumentpar
   fullviktigt-tyst `blogg-fore-161` ↔ `blogg-r5u2b-efter`): /blogg
   P55→53 · LCP 6 183→5 318 · TBT 836→995 · styleLayout 721→839 ms ·
   **totalvikt 831→764 KB (−67) · unused-JS 116→74 KiB (−42)** (fetstil
   = lastokänsligt; CPU-talen uppåtdrivna av fabrikslast 2,5–4,2 under
   EFTER-fönstret). Spegel /en/blogg EFTER: P60 · LCP 4 285 · CLS 0.
   Två körningar (lastdeklarerad `r5u2-efter` + vila `r5u2b-efter`) —
   strukturtalet reproducerbart (764 KB båda).
3. **S&L-sond** (sond-sl /blogg, rådata `s7u3-sond-sl-blogg-EFTER-
   {2026-09-16,vila-2026-09-16}.json`): Layout 18 ev/353 ms (last) resp.
   ~9 ev/≈300 ms (vila-om) mot u4-FÖRE 7 ev/68 ms + ULT 9 ev/39 ms —
   antal i paritet, totaltider last-/fönsterkänsliga.
4. **KVD**: gränsnittsvakt layout **GRÖN 0 fynd / 8 kombinationer**
   (/blogg + /en/blogg, båda temaner, mobil+dator — reservhöjd 22rem
   noll defekter) · prod 200 · /blogg 200 · src orörd = tsc-baslinjen
   orörd (grinden vid commit).

**DOM — ÄRLIG NEGATIV DEL:** kuren är funktionellt verifierad i prod,
men **ingen mätbar styleLayout-minskning i lab** (FÖRE161 721 ms ↔
EFTER 839 ms; inom lastbrus). Två förklaringar bokförs: (a) §3:s
motiverande FÖRE-tal ("styleLayout 835 ms") kom ur `blogg-r4b2.json` —
den mätningen var **JS-nedbruten artefakt** (totalvikt 59 KB, chunks
5xx; s8-u4:s delresurs-500-klass, tagen 10:0x efter 10:02:39-OOM-dödet)
— de fullviktiga tysta FÖRE-talen (fore-161: 721 ms) visar att /blogg:s
S&L redan var lågt: kortlayouten var aldrig huvudposten (u4:s sond
bekräftade: Layout 68 ms); "dokument 1139 ms"-skulden är parseHTML-
klass, inte kortlayout, och kuras inte av CV. (b) CV-autos vinst är
**strukturreserv, ej omedelbar labvinst**: initial layout berör ~2
synliga kort redan utan CV (viewporten); kurens värde realiseras vid
fortsatt tillväxt (kort 56, 57, … kostar noll initial layout) + vid
scroll (offscreen-rendering hopplas). Bokförs som: kuren kvarstår
(förebyggande, prod-GRÖN, noll regressionsbevis — CLS 0, vakten 0
fynd, 55/55 innehåll) men spårets förväntan om omedelbar S&L-sänka på
/blogg avskrivs med instrumentbevis.

Kvar i spåret (oförändrat): brotli (huvudagent/infra), språkresolvens-
CLS a/b/c (produktbeslut), kakpanel-LCP (huvudagent, R2-nära), chatt-
chunk (spår 6), /kurser-hydratiseringsrefaktorn (huvudagent/styrelse),
o27:s CPU-rest (nattfönster).

## §7 INFRA-NOTIS (bokförd för huvudagenten/prod-synkens ägare)

Ett deploy-bygge ~11:47–12:02 avled/OOM-dödades (samma mönster som
10:02:39-dödet i c4491ece) och lämnade .next HALVT skrivet: chunks-katalogen
raderad, pm2:s next-server (11:40) serverar HTML 200 men ALLA sidors
JS-chunks svarar **500** (verifierat / + /kurser + /blogg via curl — sajten
lever som statiskt HTML, ingen interaktivitet). Återställande = nästa
fullständiga prod-synk-bygge; **denna commit ÄR deployordern** (o27
§Noteringar: commit i /home/ak1a/AK1 = order). Pulsvaktens 200-koll är blind
för JS-500 (HTML-GRÖN) — noteras som vaktglipa. Vakarens (s7u2-vakare.mjs)
väntande r5u2-EFTER-mätning får bara värderas om den landar EFTER ett helt
bygge; mätte den under JS-500-fönstret ska tabellen i o27 fyllas ur en ny
om-mätning istället (undvik artefaktskuldens återskapande, §1).
