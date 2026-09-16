# O18 — Prestanda: content-visibility på /bibliotek + kakpanel-LCP-fyndet (spår 7, 2026-09-16)

Fabriksagent s7-u1 (batch auto-s7-1789524905980). Postmallen: "mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd". **Status: FÖRE bokförd,
kod committad (210dd518), EFTER bokförs när prod-synken byggt** (se §5).

> NUMMERNOT: commit 210dd518:s meddelande säger "o17" — skrevs före
> upptäckten att syskonet s7-u2:s prefetch-våg tog o17 under samma fönster
> (184c6dc7). Detta protokoll är alltså **o18** (fri nummerserie,
> o11/o12-precedensen). Innehållslig kollision: ingen — deras protokoll
> täcker prefetch-duplicates, detta täcker renderingskostnad + LCP-rot.

## 1. Urval och duplikatkontroll

Spårets kö efter o13/o16: brotli (huvudagent/infra, sudo nginx — utanför
repot), språkresolvens-CLS a/b/c (produktbeslut huvudagent/styrelse), dölj-
undantaget ShortSeller (kundens estetikval), /studio-årslåset (s7-u3:s o16,
leverad i samma fönster). o1-fas-B-listan genångången mot worklog: #1, #2,
#3b, #4, #5, #6, #7, #9, #10 alla levererade; #3a JSON-split avstått
(kollisionsyta mot fem aktiva spår + generatorpipelinen); #8 kapitel-lazy
avstått (SEO-risk). Kvar som barnägbart: **renderingskostnaden i långa
kortlistor** — mätdata (nedan) pekar ut /bibliotek som spårets tyngsta
TBT-sida. Kollisionskontroll: syskon u2/u3:s filer orörda; o16 = u3.

## 2. FÖRE (2026-09-16 02:21–02:25Z, HEAD 9b01c0d4-bygget, tyst server load ~1,5)

Lighthouse mobil (4G-drossel, `verktyg/prestanda-lighthouse.mjs`):

| Sida | Poäng | LCP | TBT | CLS | notering |
|---|---|---|---|---|---|
| / | 62 | 5 411 ms | 574 ms | 0,110 | språkresolvens-CLS (känd, produktbeslut) |
| /kurser | 55 | 5 474 ms | 1 253 ms | 0 | S&L 1 663 ms — se fynd §4.2 |
| /blogg | 55 | 6 183 ms | 836 ms | 0 | |
| **/bibliotek** | **51** | **5 227 ms** | **2 824 ms** | **0** | **sämsta TBT av 6 mätta sidor** |

/bibliotek main-thread 6,7 s: Script Eval 2 008 · **Style & Layout 1 607** ·
Other 2 566 · Render 202 ms. CDP (prestanda-mat): 2 685 DOM-noder · 53
andorda · 819 kB total · LCP-element = rubriken "102 böcker — utvalda efter
djup forskning…" (SSR-text). Rådata: `lighthouse/{start,kurser,blogg,
bibliotek}-fore-161.json` + `fore-161-sammanfattning.json` +
`s7u1-fore-cdp-2026-09-16.json`.

## 3. Åtgärd (commit 210dd518): .cv-kort — content-visibility på bokkorten

- `src/app/globals.css`: `.cv-kort { content-visibility: auto;
  contain-intrinsic-size: auto 21rem; }` — **plan CSS, ej Tailwind-JIT**
  (barnagent kan inte bygga lokalt för att verifiera att en arbitär
  egenskap genererats; en vanlig klassregel landar alltid i utdata).
- `src/components/ak1a/bibliotek.tsx`: kort-diven får `cv-kort` först i
  klassraden (102 kort, grid gap-4 sm:grid-cols-2).

Mekanik: webbläsaren hoppar över style/layout/paint för offscreen-kort —
DOM, SEO-text, hydrering och tillgänglighetsträd opåverkade; find-in-page
och ankare fungerar; `auto`-nyckeln i contain-intrinsic-size minns senast
renderade höjd (inga stavhopp efter första render). Verifieringsplan
EFTER: (a) `cv-kort` närvarande i SSR-HTML, (b) CDP-sond
`getComputedStyle(kort_50).contentVisibility === "auto"`, (c) Lighthouse
EFTER på fyra sidor, (d) gränsnittsvakten mot localhost (CV ändrar inte
beräknade färger/storlekar — vakten skall förbli grön).

## 4. Nyfynd att boka till huvudagenten (R2-nära — lämnas ej till barnagent)

### 4.1 Kakpanelen är LCP-elementet på / och /kurser vid förstabesök

Lighthouse `lcp-breakdown-insight` (båda sidor, identisk rot):
LCP-element = **kakpanelens brödtext** ("Nödvändiga gör att tjänsten
fungerar (inloggning, kursprogress). Analys hjälper …", `div.marin-panel >
div.flex > div.min-w-0 > p.mt-1`, 327×117 px), element-render-delay 666 ms
(/) resp 855 ms (/kurser) observed. `cookie-consent.tsx` renders först i
useEffect efter hydratisering (`synlig`-state) — på simulerad 4G blir
panelens sena paint LCP ~5,4 s på ALLA sidor vid förstabesök. Panelen är
samtyckesflödet enligt LEK 2022:482 ⇒ juridik/GDPR-nära yta = huvudagent/
kund enligt R2 + emission/V19-precedensen (samma klass som
språkresolvens-CLS). Alternativ (från spårets tidigare mönster):
(a) oförändrat (funktionalitet > LCP-siffra), (b) SSR-skelett + inline
head-skript som respekterar sparat val FÖRE paint (samma mönster som
CLS-alternativ (b) — en kirurgi löper båda fynden), (c) fördröjd visning
till efter load-event (LCP faller till hero ~2 s men samtyckessynligheten
senareläggs — juridisk avvägning, ej barnagents).
KOMPLEMENT-not: syskonet s7-u2:s prefetch-kur (184c6dc7, `prefetch={false}`
på panelens tre länkar) tar prefetch-spillet men RÖR INTE
efter-hydratiserings-renderingen — fyndet ovan (sen paint = LCP-rot)
kvarstår som separat ärende.

### 4.2 /kurser Style & Layout 1 663 ms vid ~1 000 DOM-noder — ovanligt

S&L-andelen är i klass med /bibliotek (1 607 ms) trots 2,7× färre noder.
Rot ogrävd — misstänkt globals.css:529-familjen (olagrade regler under
Tailwind-lagren) eller meny-register-trädet i layout. Bokas som
sondobjekt; CV-kuren i denna våg täcker INTE /kurser (listan pagineras,
~84 li — underlaget räcker ej för samma kirurgi).

## 5. Deploy-kö (ärlig bokföring)

- 02:27Z: prod-synken såg f2256432 (syskon u3:s studio-wrapper) — **VÄNTAR-RAM
  1 484 MB** (< 2 200). Under fönstret landade sedan u2:s 184c6dc7 (prefetch-
  kur) + 69b50a3c (deras worklog-bokföring) och min 210dd518 — **tre-agent-
  batch** (f2256432 + 184c6dc7 + 210dd518) byggs tillsammans så snart
  fabrikens zcode-barn frigjort RAM (poll var 10:e minut, min%10==7;
  VÄNTAR-RAM även 02:37Z: 1 909 MB; inget GitHub-push behövs — synken
  bygger LOKALT HEAD, våg 123b).
- **EFTER-attribution**: det gemensamma bygget innehåller u2:s prefetch-kur
  (nätverksnivå, alla sidor) + min CV (renderingsnivå, /bibliotek). Ren
  CV-attribution = **Style & Layout-deltat** på /bibliotek (prefetch-kuren
  kan inte påverka S&L); poäng/TBT/LCP-delta på /bibliotek är blandat och
  bokförs med den förbehållen. Standard-tre mäts som stöd åt u2:s
  EFTER-bokföring (deras kur dominerar där).
- EFTER-bokföring: tabell här + rådata `lighthouse/*-efter-161.json` +
  `s7u1-efter-cdp-2026-09-16.json` + funktionsbevis (a)–(d) från §3.

## 6. EFTER (bokförs efter deploy)

<!-- fylls i: tabell fyra sidor före→efter, TBT/S&L-delta /bibliotek,
     funktionsbevis, prod 200, gränsnittsvakt-status -->
