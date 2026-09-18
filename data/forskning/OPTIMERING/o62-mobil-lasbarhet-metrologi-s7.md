# o62 — Mobil läsbarhet 52 px: ROND 4 = METROLOGI-KUR (fantomfyndens rot)

**Spår 7 · s7-u1 (manifest auto-s7-1789706100114, byggare 1/3) · 2026-09-18**
**Status: KLAR — delspårets rond 4-kö (o8 §8) verifierad REDAN KURERAD i prod
(samtliga köns mål ≥52 px i settlat läge); FÖRE-mätningens 18 fynd bevisade
som mätfantomer; mätverktyget härdat (settle-vänta + stabilitetspass);
EFTER-härdad: 6 fynd på 6 sidor = EN dokumenterad undantagskomponent.
Prod 200 · build c7v5uV6wUzTJn051hQFgW.**

## §0 Sammandrag (o62)

o8 §8 bokade rond 4 som textlänks-kirurgi (brödsmula, Phase-länkar,
korstabellens bolagsrader, bokchips, paginerings-"1"-anomalin, /kurser-zoom).
Denna vågs FÖRE-mätning (06:44, bygge stE6SSt) verkade bekräfta kön: 19 fynd
varav 18 på /portfolj-forskning. Tre oberoende CDP-sonder visade sedan att
samma element i ett settlat, fullt stylat webbläsarläge mäter **52 px** —
fynden var **stylesheet-/layout-race-fantomer** taggade av verktygets fasta
4,5 s-vänta medan servern bar syskonens Lighthouse-mätningar. Kuren blev
därför metrologisk: `verktyg/mobil-lasbarhet.mjs` väntar nu på riktigt settle
(readyState complete + alla stylesheet-länkar laddade + webfonter klara +
1 s omflöde) och mäter med stabilitetspass (två identiska pass krävs, annars
flaggas raden `ostabilMatning`). Härdad omätning på stabilt prod-bygge:
**6 fynd på 6 sidor — samtliga ShortSeller-döljknappen 44×44, o8 §8:s
dokumenterade medvetna undantag.** Delspårets kön är därmed SLUTEN: rond 1–3:s
kirurgi + defer-vågorna (o49–o57) löste samtliga barnägda objekt.

## §1 FÖRE-mätning (instabil metod, bygge stE6SSt, 06:44 lokal)

`node verktyg/mobil-lasbarhet.mjs http://localhost:3000 …lasbarhet-fore-rond4-2026-09-18.json`

| Sida | Interaktiva | Under 52 | Zoomfällor |
|---|---|---|---|
| / | 57 | 0 | 0 |
| /kurser | 135 | 0 | 0 |
| /blogg | 142 | 0 | 0 |
| /portfolj-forskning | 69 | **18** | 0 |
| /forskningsbiblioteket | 61 | 0 | 0 |
| /kurser/the-intelligent-investor | 7 (!) | 1 | 0 |
| **Totalt** | | **19** | **0** |

Notera två larm redan här: kurssidan med bara **7** interaktiva element
(104 i härdad omätning = ofullständig hydratisering i mätögonblicket) och
/portfolj-forsknings 18 fynd exakt formar o8 §8:s rond 4-kön. Jämfört med
o8 rond 3:s EFTER (124 fynd) var läget redan misstänkt bra — 0 fynd på
/kurser mot 56 tre dagar tidigare (defer-vågorna o49–o57 tömde
tjänsteknapparna ur mätfönstret är en riktig förbättring, men 18:orna på
/portfolj-forskning betedde sig inte som ett stabil läge).

## §2 Rotanalys — tre sonder, tre olika svar för SAMMA element

| Sond (verktyg/_s7u1o62-sond-*.mjs) | Villkor | Sektorraden ▸Teknik |
|---|---|---|
| sond-cdp (6 s, Chrome-UA) | settlat | **52 px** (computed min-height 52, klass `max-md:min-h-[52px]!` korrekt applicerad; globals-golvet 44 funnet men slaget) |
| sond-timing (4,5 s + 10 s, iPhone-UA) | verktygets flöde | **21 px** (element ur synkroniserat layoutläge) |
| FÖRE-mätning (4,5 s, iPhone-UA) | under syskonlast | **44 px** (exakt globals-golvets nivå) |

Tre olika höjder för samma knapp i samma viewport (390×844) = mätögonblicket,
inte sidan, är variabeln. Verktyget mätte efter fast 4,5 s — stilmallar och
webfonter kan under samtidig serverlast appliceras/omflöda EFTER det
ögonblicket (sido-not: sidan hydratiserar dessutom klart vid olika tidpunkter;
kurssidans 7 element i FÖRE är samma symtom). CSS-faktan är entydig:
`.max-md\:min-h-\[52px\]\!{min-height:52px!important}` genererad i
1ddmx3_d2et4v.css inuti `@media not all and (min-width:48rem)`, klass närvarande
i SSR-HTML — regeln finns, appliceras och vinner (sond-cdp). o8 §8:s
paginerings-"1"-anomali (31×44 "trots min-w") bedöms tillhöra samma
fantomklass — den är borta ur varje härdad mätning.

## §3 Kuren — metrologisk (commit denna våg)

`verktyg/mobil-lasbarhet.mjs`:

1. **Settle-vänta** i stället för fast 4,5 s: sidan ska vara `complete`, ALLA
   `link[rel=stylesheet]` laddade (`l.sheet !== null`) och `document.fonts.
   status === "loaded"` (poll 300 ms, tak ~12 s) + 1 s omflödesmarginal.
2. **Stabilitetspass**: omätning efter 1,5 s; oförändrad geometri (tagg +
   bredd×höjd för hela elementlistan) krävs för grönt mätvärde — två
   avvikande pass i rad ⇒ sista passet gäller och raden flaggas
   `ostabilMatning: true` (ärlighet över siffror).
3. Tom-DOM-omförsöket och prosa-länksundantaget (WCAG 2.5.8) orörda.

Ingen src/-ändring: rond 4-köns element var redan kurerade av rond 1–3
(`max-md:min-h-[52px]!`-kirurgin på korstabellens rader, AKM-tabbarna,
"Forska fram portfölj →" m.fl. — verifierade i SSR-HTML + sond-cdp) —
därför krävs inget bygge för denna vågs skull och tsc berörs ej
(verktyg/.mjs ligger utanför tsconfig; typnollen orörd).

## §4 Deploy-fönstret (ärlighetsnot)

Mitt FÖRE mättes på bygge stE6SStzZBTMJTmZjka2y. Under den härdade
omätningen bytte prod-synken BUILD_ID till **c7v5uV6wUzTJn051hQFgW**
(syskonens o61-kurer — PalettVakt-defern; deras bokföring äger innehållet)
med pm2-omstart mitt i serien: första försöksserien mätte 2 interaktiva
element på fyra sidor (avbruten hydratisering under omstarten — kasserad,
omitten i samma namnrymd ersatt av omätning efter stabilisering, ~5 min
efter omstart). Alla bokförda tal i §5 är från det stabila c7v5uV6-läget:
`https://lab.ak1nvestor.com/` = 200, `http://localhost:3000/` = 200.

## §5 EFTER-mätning — härdad metod, stabilt bygge (BOKFÖRD)

`node verktyg/mobil-lasbarhet.mjs http://localhost:3000 …lasbarhet-hardad-2026-09-18.json`

| Sida | Interaktiva | Under 52 | Zoomfällor | Ostabil |
|---|---|---|---|---|
| / | 61 | 1 | 0 | nej |
| /kurser | 139 | 1 | 0 | nej |
| /blogg | 146 | 1 | 0 | nej |
| /portfolj-forskning | 69 | 1 | 0 | nej |
| /forskningsbiblioteket | 65 | 1 | 0 | nej |
| /kurser/the-intelligent-investor | 104 | 1 | 0 | nej |
| **Totalt** | | **6** | **0** | |

Samtliga sex fynd är **samma element**: ShortSeller-döljknappen 44×44
("Dölj Short-Seller-bubblan i 24 timmar") — o8 §8:s dokumenterade medvetna
undantag (52 px skulle täcka bärarknappen; 44 uppfyller Apple HIG + WCAG
2.5.8). Att den nu mäts på ALLA sidor (tidigare 2) ärdefer-vågornas
konsekvens: den monteras först vid ~8 s + idle (o57) och det härdade
verktyget mäter lagom sent för att träffa den — ett MÄTBART bevis på att
o57:s tvåstegs-basfall håller monteringen ur TBT-fönstret men inom
mätbart fönster.

## §6 Kvarstående observationer

- **52 px-delspåret: SLUTET för barnägda ytor.** Kvar = två designbeslut
  (ej barn-agentens att ensam fatta): (a) prosa-länkar i löpande text
  (4–12 per sida, verktygets WCAG-undantag) om huset vill gå längre än
  standarden; (b) ShortSeller-korset 44². Boka hos huvudagenten/styrelsen
  om spåret vill deklarera "noll undantag".
- Instabil-mätflaggan (`ostabilMatning`) finns nu som diagnostik: ett
  framtida `true`-värde betyder layout i rörelse — mät igen i vilofönster
  innan kur beslutas (denna vågs kärnlärdom).
- o8 §8:s "1-knapp 31×44"-anomali: hänförd till fantomklassen, borta i
  härdade mätningar — ingen kodkur krävd.

## §7 Metod och ärlighet

FÖRE (instabil metod) och EFTER (härdad) mäts på OLIKA byggen (stE6SSt →
c7v5uV6, syskon-deploy i fönstret, §4) — skillnaden 19 → 6 är därför
METODENS verk (fantombortfall), inte byggets; att köns mål var kurade
redan på stE6SSt bevisas oberoende av bygget av sond-cdp (computed style
på stE6SSt-bygget: 52 px) och SSR-HTML-klasserna. Tidsband: FÖRE under
syskonlast (deklarerat), EFTER i viloläge efter deploy-stabilisering.
Syskonkollisioner: u2 + u3 claimade båda PalettVakt/o61 (deras bokföring);
detta valdes och claimades 06:45 lokal (disk-först,
data/vakten/s7-o62-lasbarhet-rond4-u1-ansprak-2026-09-18.md) efter att
deras anspråk sett — noll yta delad med dem. R2 orörd (inga priser/tier/
publicering); data/blogg/ orörd; inget bygge (prod-synken äger); src/
orörd — leveransen är verktyg + data + bokföring.
