# O8 — Mobil läsbarhet ≥52 px: första mätningen + kirurgiska fixar (Spår 7, s7-u2)

Datum: 2026-09-15 · Mätare: `verktyg/mobil-lasbarhet.mjs` (NY — CDP mot
headless Chrome, mobil 390×844, iPhone-UA) · Mål: prod
(https://lab.ak1nvestor.com) · Bevis: `lasbarhet-fore-2026-09-15.json`.

## Varför detta objekt

Spårets fyra ytor: bildoptimering togs av syskonet (Lighthouse-harness +
"före"-mätning i `data/forskning/OPTIMERING/lighthouse/`), koddelning var
redan levererad (lasy-global.tsx, v96-mönstret), cache-headrar granskade
(se §4). **Mobil läsbarhet ≥52 px-target hade ALDRIG mätts** — gränsnitts-
vakten fångar kontrast/överflöd/klippning men inte tryckytor, och
52 px-standarden (våg 93 C3) fanns bara i studio-komponenterna.

## 1. Verktyget

`verktyg/mobil-lasbarhet.mjs` — ingen installation (node ≥22 WebSocket +
/usr/bin/google-chrome), RAM-vakt 700 MB, egen CDP-port 9337. Mäter:
- **Tryckmål**: interaktiva element med min(bredd,höjd) < 52 px.
  Prosa-länkar (`display:inline` i löpande text) räknas som berättigade
  undantag (WCAG 2.5.8-spåret).
- **Input-zoom**: input/select/textarea med font-size < 16 px (iOS
  auto-zoomar vid fokus).
- Kraschtålig: about:blank-mellanlandning per sida (renderer-byte) +
  omförsök vid tom DOM — dokumenterat i verktyget.

## 2. FÖRE-läge (prod, 6 sidor) — 255 tryckmål + 2 zoomfällor

| Sida | Interaktiva | Under 52 px | Zoomfällor |
|---|---|---|---|
| `/` | 59 | 41 | 0 |
| `/kurser` | 109 | 59 | 1 (select 12 px) |
| `/blogg` | 119 | 61 | 0 |
| `/portfolj-forskning` | 42 | 33 | 1 (input 14 px) |
| `/forskningsbiblioteket` | 38 | 13 | 0 |
| `/kurser/the-intelligent-investor` | 77 | 48 | 0 |

Återkommande förbrytare (aggregerat): headerns 6 kontroller på ALLA sidor
(logotyp 32 px, tema 32, meny 36, språk 44, "Sign in" 28, "Phase 2
Application" 28), bloggens "Fortsätt djupare"-länkar (~30 st à 29 px),
footerns kolumnlänkar (20 px), AI-Mentor/ShortSeller-monteringsknappar
(44 px).

## 3. Fixarna (denna commit — max-md-skyddade, desktop orörd)

Alla ändringar är `max-md:`-variant = träder i kraft <768 px, datorvy
oförändrad. `npx tsc --noEmit` = 0.

| Fil | Vad |
|---|---|
| `src/components/ak1a/header.tsx` | sök/tema/meny-knappar 32→52², drawerns stäng-knapp 36→52², meny-rader (MegaRad) får min-h 52 — inkl. "Phase 2 Application"-raden |
| `src/components/ak1a/tema-vaxlare.tsx` | temaknapp 32→52² |
| `src/components/ak1a/sprak-vaxlare.tsx` | språkpill 44→52 (min-h + min-bredd) |
| `src/components/ak1a/inloggad-knapp.tsx` | "Logga in"/"Logga ut" 28→52 (min-h) |
| `src/components/ak1a/varumarkes-logo.tsx` | logotyp-tryckyta min-h 52 |
| `src/app/(huvud)/blogg/page.tsx` | "Fortsätt djupare"-länkar block + min-h 52 (~30 st) |
| `src/components/ak1a/kurs-sok.tsx` | sorterings-select: 12→16 px + min-h 52 (dödar iOS-zoom) |
| `src/components/ak1a/portfolj-forskning/korstabell.tsx` | sök-input: 14→16 px + min-h 52 (dödar iOS-zoom) |

**Medvetet kvar till rond 2** (bokade, inte glömda): footerns kolumnlänkar
(20 px — behöver genomtänkt radhöjd, inte enklassfix), AI-Mentor/-
ShortSeller-monteringsknappar (44 px — nära målet, ägs av widget-filerna),
"Se medlemskap"-länken (38 px).

## 4. Cache-header-granskningen (spårsobjekt 3 — bokas här)

Mätt med curl/HEAD mot prod 2026-09-15:

| Resurs | Cache-Control | Dom |
|---|---|---|
| `/_next/static/*` (JS+fonter) | `public, immutable, max-age=31536000` | GRÖN — hashat innehåll |
| `/sok-index.json` (76 kB) | `max-age=3600` + ETag | GRÖN |
| `/llms.txt` | `max-age=86400` | GRÖN |
| `/og/*` (meta-bilder) | `max-age=2592000` | GRÖN |
| `/kurser` (HTML) | `s-maxage=3600, swr=1 år` | GRÖN — sunt ISR-mönster |
| `/sw.js` | `max-age=0` | GRÖN — korrekt för SW-uppdatering |
| `/`, `/portfolj-forskning` (HTML) | `s-maxage=31536000` utan swr | GUL — latent: ingen delad cache finns i kedjan (nginx = ren reverse-proxy, ingen proxy_cache verifierad i sites-enabled/ak1a), men om CDN läggs framför låses HTML årslånt. Rekommendation: sätt `staleTimes`/revalidate-mönster som /kurser vid tillfälle |
| `/deep-courses.json` (17,5 MB) | `public, max-age=0` | GUL — hämtas bara som fall-back när sok-index.json saknas (sokindex.ts), men om den väl hämtas omvalideras 17,5 MB. Förslag: headers()-regel i next.config med max-age=3600 |
| `/api/notiser` | saknas | ℹ — dynamisk, innehåll dagställt; våg 78-gating håller redan låg frekvens. Marginalvinst |

**Dom:** cache-landskapet är i stort friskt — de två GUL-posterna är
dokumenterade förslag, inga akuta skador. next.config.ts rördes INTE
(kollisionsrisk med syskonens bildoptimering — images-sektionen).

## 5. EFTER-protokoll

Fixarna är kodleverans (fabriksregler: inget bygge här). Nästa prod-bygge
(kraschvakten/prod-synken äger det) gör dem live — kör sedan:

```bash
node verktyg/mobil-lasbarhet.mjs https://lab.ak1nvestor.com \
  data/forskning/OPTIMERING/lasbarhet-efter-<datum>.json
```

Förväntat: headerns 6 kontroller + ~30 blogglänkar + 2 zoomfällor försvinner
ur listan (≈ −50 fynd/sida på tunga sidor, −41 på startsidan); footer +
widgetknappar kvarstår till rond 2. Jämför mot
`lasbarhet-fore-2026-09-15.json` (samma sidordning).

## 6. EFTER rond 1 (s7 våg 4, 2026-09-15) — ROND 1 BEVISAT LIVE

Mätt mot localhost:3000 (= prod-bygget, deploy 50095d0e 11:29:58 byggde
44f977d1). Rådata: `lasbarhet-efter-rond1-2026-09-15.json`.

| Sida | FÖRE under 52 | EFTER rond 1 | Delta |
|---|---|---|---|
| / | 41 | 38 | −3 (headerns kontroller borta; footer kvar dominerar) |
| /kurser | 59 | 55 | −4 + zoomfella select KVAR (se rotorsaken) |
| /blogg | 61 | **9** | −52 — blogglänkarna + headern bevisar deployen |
| /portfolj-forskning | 33 | 29 | −4, zoomfella input BORTA ✓ |
| /forskningsbiblioteket | 13 | 10 | −3 |
| /kurser/the-intelligent-investor | 48 | 45 | −3 |
| **Totalt** | **255** | **186** | **−69** |

**Rotorsaksfynd (varför zoomfällan på /kurser överlevde rond 1):**
`globals.css` bär OLAGRADE override-regler `.text-\[11px\] { font-size: 12px }`
(ovenför 9/10/11 px — kundens +1px-läsbarhetspump). Olagrad CSS slår ALLA
Tailwind-lager i kaskaden ⇒ rond 1:s `max-md:text-base` på selecten kunde
ALDRIG vinna mot `text-[11px]` på samma element (computed 12 px trots
min-h-52 som verkade). **Kur: byt basklass till `text-xs`** (lagenlig
utility, 12 px desktop) — då vinner `max-md:text-base` (16 px mobil).
Lärdom för spåret: aldrig lägga `max-md:text-*` bredvid `text-[9-11px]`.

## 7. Rond 2 (s7 våg 4, 2026-09-15) — footer + widgetknappar + CTA-rader

CDP-sond gav facit på de kvarvarande klustrena; fixarna (alla `max-md:`,
datorvy orörd):

| Fil | Vad |
|---|---|
| `footer.tsx` | kontakt-länkar ×2 + sociala ikoner ×4 + kolumnlänkar ×21 (flex + min-h 52) + till-toppen-knappen |
| `chat-widget.tsx` | AI-Mentor-trigger 44→52² |
| `notis-center.tsx` | klock-knappen 44→52² |
| `tema-vaxlare.tsx` | `shrink-0` — flex-shrink kramade knappen 52→50 px (rotorska, inte storleksklass) |
| `mobilmeny.tsx` | hamburgerknappen 35→52² + shrink-0 (samma shrink-rot) |
| `sidfooter.tsx` | guldknapps-badge (28 px, "Phase 2 Application" på alla sidor) + kolumnlänkar → min-h 52 |
| `kurs-sok.tsx` | rotorsaksfixen: `text-[11px]`→`text-xs` (label + select) — zoomfällan dör |
| `bygg-portfolj-kort.tsx` | Logga in gratis + Se medlemskap 44→52 |
| `kurser/[slug]/page.tsx` | Öppna AK1A + Se medlemskap → inline-flex min-h 52 |
| `portfolj-forskning/page.tsx` | AKM1-kalkylatorn + Portföljbyggaren + Se medlemskap → min-h 52 |

**Medvetna undantag (dokumenterade, inte glömda):**
- ShortSeller-dölj-kryss (44², overlay-badge på 60 px-bärarknappen): 52 px
  skulle täcka bärarknappen helt; 44 px uppfyller Apple HIG 44 pt + WCAG
  2.5.8 med god marginal. Lämnad medvetet.
- Kakbannerns tre knappar (44 px) + kurssidans quiz-svarsknappar (44 px) +
  /kurser filter/pagineringsknappar (40–44 px) + LarvagKort-chips (26–42 px)
  + hero-länken "see the memberships" (30 px) = **rond 3-kö** nedan.

### Kö rond 3 (nästa våg i delspåret)
1. /kurser: filterknappar + paginering (kurs-sok.tsx) — 44→52.
2. Kurssidor: quiz-svarsknappar (kurs-renderare) + relaterade-chips —
   stor yta (343 kurser), mät först.
3. Kakbanner-knapparna 44→52 (kakvakt-komponenten).
4. Hero-länken "see the memberships" (spa-hem) 30 px.

## 8. Rond 3 (s7 våg 5, 2026-09-15 17:30) — KÖN TOM: allt fyran ovan fixat

Alla fyra köposter + LarvagKort-raderna (undantagslistan) i en våg —
samtliga `max-md:`-kirurgi (mobil <768 px, datorvy orörd), tsc 0:

| Fil | Vad |
|---|---|
| `kurs-sok.tsx` | hero-chips ("Alla (343)" + 8 kategorier), kategoriväggens ~30 chips, rensa-filter-knappen, pagineringens föregående/nästa + numrerade knappar (min-h 52; de numrerade även min-w 52) |
| `cookie-consent.tsx` | bannerns 4 knappar (Godkänn alla / Spara mitt val / Inställningar / Endast nödvändiga) 44→52 |
| `kurs-quiz.tsx` | quiz-svarsknapparna (fullbreddsrader) min-h 52 — stor yta: 8 223 quiz över 343 kurser |
| `kurser/[slug]/page.tsx` | relaterade-kursers chips (inline-flex + min-h 52 + py-0) |
| `sections/home-section.tsx` | verktygschipsen ("The AKM1 Calculator/Vave Foundation/Confluence Radar", 26 px) + Fas 2-textlänkarna "Bli certifierad"/"Se medlemskapen" (30 px — köpost 4) |
| `larvag-kort.tsx` | kortraderna min-h 52 (syskonets undantagspost) |

Noterat under vågen: de flesta 44 px-mätvärdena kommer av globals.css:529
globala golvet `min-height: 44px` för knappar <640 px — golvet lämnas
medvetet orört (ett lyft till 52 skulle förstora VARE knapp oglatt,
inklusive ShortSeller-dölj-krysset som bara får 44 av samma golv);
husstandarden nås kirurgiskt per komponent i stället.

**Driftfynd (fabriksoperativ):** prod-synkens "AGENTARBETSYTA synkad"
(15:33:10) återställer trädspårade filer till HEAD — under pågående
våg revs 4 av 6 filers ostagade redigeringar (s2-u2:s strukturfynd i
praxis igen). Kur: skriv → tsc → commit PER filgrupp i ett fönster;
om-applikation från diff kosta 6 min. Del 1 (larvag-kort +
home-section, 3d25e4f5) hann deployas 15:32:53 prod 200 före revningen;
del 2 (3b2aab63) deployas av nästa poll.

### EFTER rond 3 — bokförd 18:04 av s7 våg 6 (deploy 1f5b165a 18:00:38, prod 200)

Mätt på localhost mot levande bygget (0643-wave 04303dd8 kaskadkuren
inkluderad — alla fyra rond-3-köposter + del 1-2 i trädet). Samma
verktyg, mobil 390×844, jämfört med rond 2:s EFTER-facit 186:

| Sida | Interaktiva | Under 52 | Rond-2-värde |
|---|---|---|---|
| / | 61 | 2 | (del av 157) |
| /kurser | 110 | 56 | — |
| /blogg | 146 | 1 | (del av 157; var 61) |
| /portfolj-forskning | 69 | 18 | 29 |
| /forskningsbiblioteket | 65 | 2 | (del av 157) |
| /kurser/the-intelligent-investor | 77 | 45 | — |
| **Totalt** | 528 | **124** | **186** |

**186 → 124 = −62 (−33 %).** Knappklustren som rond 3 målade är borta
ur toppen: kvar i "värsta"-listorna finns INGA kakbanner-/quiz-/chips-
knappar längre — kvarvaranden är ett ANNAT kluster:

1. **TextLÄNKAR (rond 4-huvudspår):** Phase 2→/Phase 3→ (59×20),
   brödsmulan 🔹Startsidan (328×32), korstabellens bolagsrader
   (312×44), "Se alla källor →" (89×16), bokchips (238–293×26),
   "Till korstabellen →" (136×34). Länkar får INTE globals-golvet
   (syskonet 04303dd8:s notering "länkar opåverkade — inget golv
   bekräftad mätning") — husstandarden 52 kräver antingen per-yta
   kirurgi (py/min-h på länkarna) eller ett designbeslut om länkunntag.
2. **Dokumenterade undantag (medvetna):** ShortSeller-dölj-korset 44×44
   (o8 §8) + "To the top" 99×44 på /.
3. **Nytt rond 4-gräv:** pagineringens numrerade "1"-knapp mäter fortfarande
   31×44 TROTS kaskadkurens min-w! — kolla vilken klass som förlorar
   kaskaden (ev. aria-current-varianten eller annan Tailwind-v4-syntax).
4. **1 NY zoomfälla på /kurser** (input/select <16 px font) — rond 1
   kurade korstabellens inputs (portfolj-forskning 0 zoom ✓), /kurser:s
   select föll utanför — rond 4.

Rådata: `/tmp/lasbarhet-efter-rond3-2026-09-15.json` (kopieras till
data/vakten är ej gjord — tmp räcker som arbetsminne, nästa våg mäter om).

## 9. DEFINITIV EFTER rond 3 (s7 våg 5 = s7-u3, 2026-09-15 18:05–18:12, PROD — rättar våg 6:s localhost-tal)

Våg 6:s EFTER (18:04) mätte mot localhost medan 1f5b165a-bygget (med
kaskadkuren 04303dd8) pågick — deras knapprester (paginering 31×44, ny
zoomfälla) är PRE-BANG-artefakter. Denna mätning körde mot
https://lab.ak1nvestor.com EFTER deploy 18:00:38 (prod 200):

| Sida | FÖRE | rond 1 | DEFINITIVT | Kvar (klassificering) |
|---|---|---|---|---|
| / | 41 | 38 | **2** | dölj-badget (undantag §7) + till-toppen 44² |
| /kurser | 59 | 55 | **5**¹ | 2×faslänkar "Phase 2→/3→" 20 px, brödsmula (inline-undantag), dölj, "Utforska kurserna" 46 px |
| /blogg | 61 | 9 | **1** | dölj-badget |
| /portfolj-forskning | 33 | 29 | **18** | korstabell-cellytor (rond 4) · zoom 0 ✓ |
| /forskningsbiblioteket | 13 | 10 | **2** | dölj + lås-rad 310×44 |
| /kurser/the-intelligent-investor | 48 | 45 | **32** | kurskroppens bokrader/källor (rond 4) |
| **Totalt** | **255** | **186** | **60**² | **−76 %** · **zoomfällor 2 → 0** (våg 6:s \"/kurser-select zoom\" var pre-bang: full om-mätning = 0) |

¹ Helkörningens /kurser-pass dog (7 interaktiva = partial render, verktygets
kända svaghet) — ärligom-mätning enskild sida: **136 interaktiva, 5 under
52, 0 zoom**; chips, paginering (även aria-current-varianten — våg 6:s
oro var ogrundad), numrerade knappar och select ALLA ≥52. ² Verktygets
hel-total 59 bygger på partial-passet; 60 är den korrigerade räkningen.

Beviskedja: bang-cure 04303dd8 → deploy 1f5b165a 18:00:38 (prodbygge
nyare än commit) → prod 200 → mätning ovan. Rådata:
`lasbarhet-efter-rond3-2026-09-15.json` (denna mapp, committad) +
`data/vakten/lasbarhet-efter-rond3.json` + `/tmp/kurser-om.json`.

**Kvarvarande röror för rond 4** (våg 6:s lista kompletterad):
våg 6:s punkt 1-2 (textlänkar: faslänkar, bokrader, brödsmulan,
källor-länk, korstabellrader) + till-toppen !-lyft + Utforska-kurserna
46→52 + lås-raden på /forskningsbiblioteket. Inga knappkluster kvar
förutom dokumenterade undantag — knapparnas 52-standard är UPPNÅDD på
kärnytorna; delspåret går vidare på länkytor (rond 4).


## 10. Rond 4 (s7-u1 omgång 3, 2026-09-15 ~21:4x) — FÖRE-mätning + knapphalvan (kaskadkuren)

**FÖRE-mätning** (mobil-lasbarhet.mjs mot localhost = aktuellt prod-bygg,
390×844, 0 zoomfällor): **34 tryckmål** kvar (efter rond 3:s bokförda 60):

| Sida | rond 3 (§9, prod 18:05) | FÖRE rond 4 (aktuellt bygg) | Not |
|---|---|---|---|
| / | 2 | 2 | till-toppen 44 (KASKADFÄLLA, se nedan) + dölj-undantag |
| /kurser | 5 | 6 | faslänkar ×2 (59×20), 🔹-fortsattrader ×2 (328×32), Utforska 46, dölj |
| /blogg | 1 | 1 | dölj-undantag |
| /portfolj-forskning | 18 | 18 | Till korstabellen 34, topp-3-rader 44, Forska-knapp 44, AKM1/AKM2-filter 44, branschgrupper ×10 (44), dölj |
| /forskningsbiblioteket | 2 | 2 | lås-raden 44 + dölj |
| /kurser/the-intelligent-investor | 32 | **5** | **quiz-knapparna mäter NU 52** — §9:s 18:05-tal bar pre-restart-artefakter (bygget/pm2-genomstart ej landat vid mättillfället); kvar: Se alla källor 16, Courses-brödsmula 20, markeraKlar 44, Unlock 44, dölj |

Rådata: `lasbarhet-fore-rond4-2026-09-15.json` (denna mapp) +
`data/vakten/lasbarhet-fore-rond4.json`.

**KOLKLISION — delat objekt:** samtidigt syskon tog textlänkhalvan
(brodkrumma, kallkort, kurs-sok-faslänkar, social-proof,
forskningslage-kort topp-3 + "Till korstabellen" + ~29 sidfiler, vanlig
`max-md:min-h-[52px]` på a-element = korrekt, länkar har inget golv).
Denna våg levererade KOMPLETTERANDE knapphalva (commit 84ba52ed, exakt
6 filer, 0 överlapp) — knappar behöver `!`-suffixet:

| Fil | Yta | Kur |
|---|---|---|
| `footer.tsx` | "Till toppen" 99×44 | `max-md:min-h-[52px]!` — ROTORSAKA: rond 2:s vanliga klass förlor mot globals.css olagrade button-44-golv (04303dd8-mönstret, nu applicerat på sista kända golv-förloraren) |
| `riskval-panel.tsx` | "Forska fram portfölj →" 171×44 | `max-md:min-h-[52px]!` (bar egen min-h-[44px]-utility) |
| `korstabell.tsx` | branschgrupper ▸Teknik… (mobil kortvy, ×10) | `max-md:min-h-[52px]!` |
| `kurs-gate.tsx` | "Unlock (member)" 162×44 + "Markera kursen klar" 328×44 | `max-md:min-h-[52px]!` ×2 |
| `fortsatt-panel.tsx` | 🔹-fortsattrader 328×32 | `max-md:min-h-[52px]` (a flex, inget golv) |
| `min-sida.tsx` | "Logga in gratis" + "Utforska kurserna" | `max-md:inline-flex max-md:min-h-[52px]! max-md:items-center` |

**Kvar i kön efter båda halvorna** (mät om efter deploy): AKM1/AKM2-
filterknapparna på /portfolj-forskning (80×44/96×44 — hemvist ej
belägen i korstabell.tsx/page.tsx vid detta fönster, grävas), ev.
rester av syskonets ytor som mäter <52 trots vanlig klass. tsc 0
(projektbinär). EFTER-mätning: `node verktyg/mobil-lasbarhet.mjs
http://localhost:3000 <utfil>` när prod-synken byggt BÅDA halvorna —
jmför mot lasbarhet-fore-rond4 (samma sidordning).

## 11. Rond 4 LÄNKHALVAN (s7-u2, 2026-09-15 ~23:1x) — 6 ytor + AKM1/AK2-hemvisten + worklog-konfliktlagen reparerad

**Leverans 1 — länkhalvan** (a-element ⇒ vanlig `max-md:min-h-[52px]`,
inget globals-golv för a — §10:s klassregel bekräftad; inline-block/block
-länkar fick även `inline-flex items-center` för centrering). Sex ytor:

| Fil | Yta | FÖRE (prod-mätning) |
|---|---|---|
| `brodkrumma.tsx` | brödsmulornas Link — täcker /kurser sv (🔹Startsidan 328×32) OCH /en/kurser ("Courses" 52×20) | 32/20 px |
| `kurs-sok.tsx` | faslänkarna "Fas 2 →/Fas 3 →" (ksok.fas2/3Lank) | 59×20 |
| `social-proof.tsx` | "Utforska kurserna" 170×46 + "Gå med gratis" (förebyggande, samma par) | 46 px |
| `kallkort.tsx` | "Se alla källor →" inline-block | 89×16 |
| `forskningslage-kort.tsx` | "Till korstabellen →" 136×34 + topp-3-bolagsraderna (Link → /forskningsbiblioteket/[ticker]) 312×44 | 34/44 px |
| `forskningsbiblioteket/page.tsx` | lås-raden "Forskning Plus låser AKM2-poängbasen" 310×44 — **levererarad via syskonet s7-u3:s b77699ba** (delad fil: deras revalidate-rad + min klass i samma diff, ärligt bokfört) | 44 px |

**Leverans 2 — AKM1/AK2-hemvisten BELAGEN** (§10:s öppna gravning):
poängbas-tabbar = `bygg-portfolj-kort.tsx:174` (("akm1","akm2")-map,
`min-h-[44px]`) — kurerad med `max-md:min-h-[52px]!` (button ⇒ important
enligt kaskadstandarden). Rundans sista kända knapp-par.

**Leverans 3 — worklog-konfliktlagen reparerad** (bokföringshygien):
worklog.md bar en COMMITTAD, trasig merge-konflikt (nästlade
`<<<<<<<`/`=======` 10861/10873/10874/10937, tre dubblettblock, ingen
avslutande markör — rond 36:s "worklog-merge löst" läkte innehållet men
lämnade markörerna). Reparerad med 3 kirurgiska Edits: 0 markörer,
varje avsnitt exakt en gång, kronologin rond 34 → våg 6 → rond 35 →
s7-u3 → rond 36 → s8-u1 → s8-u3 → rond 37 → s8-u2 → s9-u3 → ROND 38
intakt. Verifierat: grep 0 träffar, dubblettcount 1/1/1.

**FÖRE-korsvalidering (prod, oberoende av §10:s localhost-tal):**
mobil-lasbarhet.mjs mot https://lab.ak1nvestor.com 23:05 = **34
tryckmål** (2/6/1/18/2/5 — per sida IDENTISKT med §10:s localhost-tabell;
/kurser/the-intelligent-investor 32→5 bekräftad = quiz-pre-restart-
artefakt-teorin håller). Rådata: `lasbarhet-fore-rond4-prod-2026-09-15.json`
(denna mapp). Språkresolvens-not: mätningen ser EN-etiketter
("Phase 2 →", "Courses") i sv-vy — känt CLS-spår (syskonvåg, o5 §EFTER2),
ytorna är desamma.

**Rättelse till §10:** "samtidigt syskon tog … ~29 sidfiler" är en
feltolkning — länkhalvan är 5 komponentfiler + 1 sidfil (lås-raden, via
b77699ba). Ingen massändring av sidfiler skedde i rond 4.

tsc 0 (projektbinär). EFTER-mätning enligt §10:s bokning — när prod-
synken byggt BÅDA halvorna + denna våg; jämför mot 34.

### EFTER rond 4 — DEFINITIV (s7-u2, 2026-09-15 23:2x, PROD efter deploy 23:08)

Prod-synken byggde båda halvorna + cache-rond 2 (BUILD_ID 23:08, prod 200).
Första helkörningen visade 27 — men tvÅ ISR-artefakter fångade och kurades
i mätningen: /kurser partial render (7 interaktiva, verktygets kända
svaghet) OCH stale HTML på ISR-sidorna (x-nextjs-cache: HIT — s7-u3:s
revalidate=3600 gör att nybyggda sidor serverar GAMMAL HTML tills
stale-while-revalidate hunnit revalidera; lärdom: **EFTER-mätning på
ISR-sidor kräver 2 curl-triggar + ~8 s innan mätvärdena är sanna**).

Efter revalideringstriggar + om-mätning per drabbad sida:

| Sida | FÖRE rond 4 | EFTER | Kvar |
|---|---|---|---|
| / | 2 | **1** | dölj-undantaget |
| /kurser | 6 | **1** | dölj |
| /blogg | 1 | **1** | dölj |
| /portfolj-forskning | 18 | **1** | dölj |
| /forskningsbiblioteket | 2 | **1** | dölj |
| /kurser/the-intelligent-investor | 5 | **1** | dölj |
| **Totalt** | **34** | **6** | **6 × ShortSeller-dölj = dokumenterat undantag §8** |

**34 → 6 (−82 %). Kvarvarande = ENBART det medvetna ShortSeller-undantaget
(en per sida). 52-standarden UPPNÅDD på alla övriga ytor.** Spårets totala
resa: 255 (FÖRE rond 1) → 186 → 60 → 34 → **6** (−97,6 %), zoomfällor 2 → 0.
Knapparnas OCH länkarnas 52-standard: klart. Råd till nästa våg: dölj-
undantaget förblir (medvetet, §8); nya ytor mäts in med verktyget före leverans.

Rådata: `lasbarhet-efter-rond4-prod-2026-09-15.json` (helkörning 27,
partial-styrd) + tre om-mätningar (`-kurser-om`, `-pf-om`, `-kurs-om`,
alla "1 = dölj"). Beviskedja: commits 84ba52ed + 7aee6ff6 (+ b77699ba:s
lås-rad) → deploy 23:08 → prod 200 → mätningarna ovan.
