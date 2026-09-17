# KONTROLL 2026-09-17 — sa-tolkar-du-utdelningskalendern (våg 171-tillskott #1)

**Objekt:** `data/blogg-utkast/sa-tolkar-du-utdelningskalendern.json` (huvudagentens våg 171, commit `4ce26f70` 2026-09-15 23:59; md5 `b0464afa74b382e98d79e1c4dd02bcef`; utkast-JSON:en orörd av granskaren)
**Granskare:** agentfabrik auto-s1-u3 (omgång auto-s1-1789673729457, 2026-09-17 kväll)
**Anspråk:** `data/vakten/auto-s1-1789673729457-u3-ansprak.md` — satt FÖRE arbetet (E29-lärdomen)
**Val enligt köregeln:** uppdragstitelns "m9-utkast #3" = auto-platthållare — gamla m9-ko-serien komplett sedan 2026-09-16 14:35 (8448ef77); förra omgångens uttryckliga NOTIS erbjöd "våg 171 #1 sa-tolkar-du-utdelningskalendern OCLAIMAT — till nästa omgång" = detta objekt, denna omgång. Kollisionskontroll: 0 granskningsfiler för slugen, 0 syskon-utdata för omgången vid anspråk.

**NAMNOTIS (medveten avvikelse från syskonens filnamn):** denna rapport heter `sa-tolkar-du-utdelningskalendern.md` — exakt slug, gammal konvention — inte `-KONTROLL-2026-09-17.md`. Skälet är maskinellt: `verktyg/juridikgrind-vakt.mjs` härleder granskningsposters slug ur FILNAMNET (kodrad 171) och vänder utkastets `flyttklar`-flagga endast vid exakt träff + bedömningsrad. Syskonens flagga 1 (substansrabatt-rapporten) dokumenterade egenskapen; med exakt-slug-namn stängs den för detta objekt utan verktygsändring (kvitto: vakten omkörd efter leverans, se §10). Datum och KONTROLL-märkning bärs i denna rubrik i stället för i filnamnet.

---

## BEDÖMNING: FLYTTKLAR — 0 juridikfynd, 0 sifferfel mot källorna, 1 frivillig LÅG-komplettering (C1) + 2 frivilliga förslag (C2, C4) + 2 notiser (C3, N1)

**38 enskilda kontroller: 9 käll- och kalenderkontroller · 8 siffer-/mekanikkontroller · 8 juridikkontroller (därav varumärkesgrind 26 regexer × 3 ytor = 0/0) · 9 911-mönster (6 serie + 3 utökade) · 5 länkkontroller · 8 struktur-/fältkontroller — 1 frivillig komplettering, allt annat grönt.**

---

## 1. Kalendertabellen — källorna

Utkastets tabell ("Tre riktiga kalendrar") verifierad rad för rad mot AK1A:s kvartalsunderlag (`data/blogg-utkast/kvartal/2026-q3/kalender-fastighet.json` och `kalender-industri.json`, båda `genererad: 2026-09-15`, samtliga källrader `hamtdatum: 2026-09-15`):

| Utkastets påstående | Källrad | Dom |
|---|---|---|
| Wallenstam (fastighet), rapport **15 oktober** | `rapportfenster: "2026-10-15"` (kalender-fastighet.json, WALL-B.ST) | ✓ |
| Wallenstam, **X-dag 27 oktober — tolv dagar senare** | notera: "X-dag för utdelning till 2026-10-27" (Cision-rapportpaketet, officiellt) · 27−15 = **12 kalenderdagar** egenomräknat | ✓ tal + differens |
| SKF (industri), rapport **21 oktober** | `rapportfenster: "2026-10-21"` (kalender-industri.json, SKF-B.ST) | ✓ |
| SKF, **preliminär avstämningsdag dagen före rapporten** | notera: "preliminär avstämningsdag för utdelning dagen före" | ✓ ordagrant stöd |
| Atlas Copco (industri), rapport **22 oktober** | `rapportfenster: "2026-10-22 (ca kl 12:00 CEST …)"` (ATCO-A.ST) | ✓ |
| Atlas Copco, **halvårsutdelning samma dag som rapporten** | notera: "Halvårsutdelning och rapport hamnar samma dag i kalendern" | ✓ ordagrant stöd |
| "officiella IR-kalendrar, lästa 2026-09-15" | hämtdatum 2026-09-15 på samtliga sex källrader (wallenstam.se ×2, marketscreener, skf.com, atlascopcogroup.com) | ✓ |
| "datum kan vara preliminära — alltid den officiella IR-kalendern som källa" | källdokumentens egen försiktighet ("preliminär") återges ärligt | ✓ |

9/9 gröna. Tabellen citerar inte källordagrant utan tolkar — varje tolking har ordagrant stöd i notera-fälten.

## 2. Siffror och mekanik — egna omräkningar

| Påstående | Omräkning | Dom |
|---|---|---|
| 100 kr aktie, 4 kr utdelning → notering "runt 96" på x-dagen | 100 − 4 = 96 | ✓ |
| "96 i aktie + 4 i kassa = samma förmögenhet som 100 dagen innan" | 96 + 4 = 100 | ✓ |
| "Faller kursen med 3 [med 4 kr utdelning] är det i praktiken en oförändrad aktie" | teoretisk ex-kurs 96; faktisk 97 = +1 mot teoretin | ✓ logiken |
| "faller den med 8 är det något annat som hänt" | 92 = −4 mot teoretin | ✓ logiken |
| X-dagen = "första handelsdagen då aktien noteras utan rätt till utdelningen" | Euroclear Sveriges definition, ordagrant konsistent | ✓ |
| "senaste dagen du kan köpa aktien och ändå få utdelningen normalt dagen före x-dagen" | Euroclears egen formulering ("senaste köpdag = dagen före x-dagen"); "normalt"-hedging korrekt — texten undviker klok nog att påstå en exakt offset mot avstämningsdagen | ✓ |
| "Säljer du … på själva x-dagen behåller du rätten till utdelningen" | korrekt: säljaren på x-dagen var ägare vid dagens början; köparen på x-dagen får inget | ✓ |
| "Betaldag … ofta dagar, ibland veckor, efter avstämningsdagen" | Wallenstams egna 12 dagar (tabellen) bär påståendet | ✓ |

8/8 gröna. Räkneexemplena är korrekt märkta "med valda tal (inte ur underlaget)" — mallens ärlighetskonvention följs.

## 3. Ärlighetsnoten om bolagsuniversumet — båda lägena

Kontrollerad mot våg 171:s bygversion (git `4ce26f70`) OCH dagens träd:

| Påstående | Vintage 4ce26f70 | Dagens träd | Dom |
|---|---|---|---|
| "115 bolag" | exakt 115 rader | 159 rader (växt under dagen) | ✓ vintage-anknutet, sant |
| "levereras inga per-bolags utdelningsbelopp" | 0 av 115 rader har utdelnings-/dividendfält | 0 av 159 | ✓ båda lägena |
| "återköpsfältet är mätt i 0 av 115 rader" | `aterkop.senasteArMdr`/`andelUtestande` = null i 115 av 115 (fältet FINNS överallt, mätvärde saknas överallt — precis vad meningen säger) | 0 av 159 | ✓ båda lägena |
| "insamling 2026-09-03" | 100 rader hamtat 2026-09-03 (Yahoo Finance + MarketStack) **+ 15 rader 2026-09-15 (StockAnalysis)** | 100/16/22/21 (09-03/09-15/09-16/09-17) | **delvis — se C1**: huvudinsamlingens namn är seriekonvention (syskonet u3 behöll samma formulering i rörelsekapital), men källnoten kompletteras lämpligen med tilläggsradernas källa och datum |

Substansen i noten — källbristen på utdelningsbelopp och återköpsmätningar, som motiverar guidens val att lära ut mekanik i stället för att lista belopp — är sann i BÅDA lägena. Detta är notens bärande syfte och det håller.

## 4. Juridik — lagen (2007:528) om värdepappersrörelser

1. **Mekanisk grind:** `verktyg/juridikgrind-vakt.mjs --json` på objektet: **fynd 0, grund true** (utbildnings-grunden närvarande; totalvyns 18 fynd berör andra objekt).
2. **Varumärkesgrind** (replik av `data/varumarke.json` `forbjudnaFraser`, samtliga 26 regexer "giu" mot title + description + varje bodyrad): **0 FEL, 0 VARNINGAR**.
3. **Rådgivningsglossor manuellt:** åtta träffar på köp-/säljstammar — samtliga i mekanikbeskrivande eller negerad kontext: "du kan köpa aktien och ändå få utdelningen" (mekanik), "den som köper den dagen får ju inte de 4 kronorna" (exempel), "senaste köpdag" / "återköpsfältet" (substantiv), "Säljer du däremot på själva x-dagen" (mekanik), "många ägare säljer kring x-dagen" (marknadsbeskrivning). Ingen träff är ett råd.
4. **Investeringsråd endast negerat:** "Det är utbildning i mekanik — inte investeringsråd" (ingressen) + "_Detta är pedagogisk finansanalys, inte investeringsråd._" (sista raden — disclaimer-sista-rad-kontraktet ✓).
5. **Lagrum:** 0 åberopade i texten → 0 risk för den förbjudna lagrumsblandningen (2007:528 styr granskarens dom; texten behöver inte citera det — samma dom som rörelsekapital § juridik).
6. **Skatt-hänvisningen** ("hör hemma hos Skatteverket och deklarationen, inte i börsens kalender") — korrekt avgränsning, inget råd lämnas.
7. **GDPR/kakor:** inga personuppgifter, inga formulär, inget berört.
8. **R2:** inga priser, ingen tier, ingen publicering — orörd.

8/8 gröna.

## 5. 911-kontroll

Seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "Terrordåd") mot title + description + body: **0 träffar**. Rörelsekapitalets utökade tre ("september 11", "nine-eleven", "9-1-1"): **0 träffar**. Sammanlagt 9 mönster, hel filen ren. Guiden är datumtät (oktoberdatum) utan en enda september-2001-anknuting — m9-familjens datumfälla finns inte här.

## 6. Länkar — levande sajten

| Länk | HTTP mot localhost | Kursregister |
|---|---|---|
| /kurser/sj-03-bolagsstamma-och-rostratt | 200 | ✓ |
| /kurser/km-063-direktavkastning | 200 | ✓ |
| /kurser/km-064-utdelningstillvaxt | 200 | ✓ |
| /kurser/km-005-eget-kapital-utdelningar | 200 | ✓ |
| /kurser/ud-06-svenska-utdelningsaktier | 200 | ✓ |

5/5 gröna; 0 länkar mot outgivna utkast; inga externa länkar i bodyn (källorna namnges i källnoten utan URL:er — kalenderguidens källor är bolagens IR-sidor, korrekt refererade). Not: tre av fem kurser (km-063/km-064/km-005) är samma mål som m9-familjens utdelningar-101 granskade — konsekvent kursväv.

## 7. Struktur och fält

- **BlogPost-form:** exakt 9 fält (slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body) ✓
- **Rubriker:** 5 H2 + ingress (85 ord) + sammanfattning; källnot näst sista raden, disclaimer allra sista ✓
- **Tabell:** 3 kolumner × 3 bolagsrader välformad ✓
- **Mjuka bindestreck (U+00AD): 0 · U+00A0: 0** ✓
- **Ord:** 853 (title + body) — inom SEO-mallens span 800–1 400 ✓
- **Tags:** 6 st, samtliga ämnesbärande, primära sökordet först ✓

### Fält mot publicerad familjepraxis — metoddebatten u2↔u3 avgörd för detta objekt

Syskonen i våg 171-granskningarna har motsatta domar om fälttaken (u3 dömde mot SEO-GUIDER-kontraktet ≤60/≤155/round(ord/600); u2 mätte 55 publicerade poster och fann annan praxis). Denna granskning har gjort en **egen, pillar-för-finare mätning** av `data/blogg/` (55 poster):

| Fält | Objektet | Publicerad praxis | Dom |
|---|---|---|---|
| readingMinutes | 5 vid 853 ord (ord/rm = 171) | **Pillar Grunderna (4 st): ord/rm 145–192, median 188** (1014→7, 1090→6, 1126→6, 1149→6); samtliga övriga pillrar median 88–203; **0 av 55** följer ord/600 | **KONSISTENT — inget fynd.** 171 ligger mitt i Grunderna-spannet |
| title | 76 tkn | 13 av 55 > 60; max 84 | **Inom praxis** — se ändå C4 (frivillig kortkandidat) |
| description | 162 tkn | median 159; 29 av 55 > 155; max 240 | **Inom praxis — inget fynd** |

**Slutsats (bärande för kön):** våg 171:s tillskott är BlogPost i **blogg-familjen** (pillar Grunderna), och blogg-familjens publicerade praxis är mänsklig lästakt ~ord/200 — inte SEO-GUIDER-seriens round(ord/600), som är den seriens eget kontrakt för sina 800–1 400-ordsguider. u2:s dom bekräftas nu på pillar-nivå (Grunderna-medianen 188 ligger där u2:s familjemedian ~200 pekade). **Flagga åt rörelsekapitalets paketägare (deras fil — ändras ej här):** deras B3 ("readingMinutes 5→1 enligt kontraktet") och i förlängningen B1/B2 vilar på ord/600 och SEO-taken applicerade på en bloggpost; den pillar-fina mätningen talar för omprövning, i linje med u2:s reservation. För DETTA objekt krävs ingen fältändring alls.

## 8. Fynd och förslag

| ID | Grad | Fynd | Åtgärd |
|---|---|---|---|
| C1 | LÅG (frivillig komplettering, källfullständighet) | Källnoten anger "(Yahoo Finance och MarketStack, insamling 2026-09-03)" — men 15 av vintagefilens 115 rader är hämtade 2026-09-15 från **StockAnalysis** (mätt i git 4ce26f70). Källnoten täcker huvudinsamlingen men inte tilläggen; doktrinen "fabrikens tal är alltid spårbara till källa" gillar helheten. (Samma fyndfamilj som rörelsekapital-C2; bodyns "insamling 2026-09-03" lämnas orörd enligt serieprecedensen — huvudinsamlingens namn) | Diff-post C1: byt källnotssträngen (verifierad unik) |
| C2 | LÅG (frivilligt förslag, sökordshygien) | Primära sökordet "utdelningskalendern" finns i title ✓ och ingress ✓ men i **ingen H2** — publicerade Grunderna-poster bär ämnesordet i H2 (t.ex. "Riv isär ROE med Du Pont") | Diff-post C2: "Tre riktiga kalendrar — tre olika mönster" → "Tre riktiga **utdelningskalendrar** — tre olika mönster" (unik sträng) |
| C4 | LÅG (frivilligt förslag) | Title 76 tkn ligger i familjens tyngsta tredjedel (13/55 > 60, max 84) — ingen regel bryts, men korta titlar klipps mer sällan i mobila sökresultat | Diff-post C4: kandidat "Utdelningskalendern: stämma, avstämningsdag, x-dag, betaldag" (59 tkn, behåller alla fyra sökordsleden) — ägarens val |
| C3 | Notis (ingen åtgärd) | publishedAt 2026-09-15 = byggdatum (seriekonvention, energiaktier-D3-precedensen); publiceringsdatum sätts vid kundens export | R2-neutral notis |

0 A-fynd. 0 B-fynd. **Ingen rättning krävs för flyttklarthet** — C1–C4 är frivilliga förbättringar.

## 9. Notiser och systemfynd

- **N1 (aktualisering, fabriksägaren):** bolagsuniversumet växte 115→159 rader bara under granskningsdagen (hamtat-fördelning 09-03/09-15/09-16/09-17 = 100/16/22/21). Ärlighetsnotens FÄLTPÅSTÅENDEN gäller oförändrat i dagens fil (0 mätta återköp, 0 utdelningsbelopp), men antalet "115" är vintage-anknutet — samma cadans-fråga som syskonen bokfört; regeneration tillhör fabriksägaren.
- **SYSTEMFYND (koordinering, ej objektbundet):** fältmetoddebatten ovan — pillar-fina mätningen (Grunderna 145–192 ord/rm) bör ingå i nästa omgångs granskningsunderlag; SEO-GUIDER-kontraktet bör inte åberopas mot blogg-familjeobjekt utan uttryckligt släktskapsbeslut.
- **Vakten-egenskapen (verktygsägaren, redan känd):** flyttklar-flipp kräver exakt-slug filnamn — denna rapport bär exakt slug och kvitteras med vakten omkörd (se §10); syskonens `-KONTROLL-2026-09-17.md`-filer når inte flaggan.

## 10. Diff-fil och verkställning

`sa-tolkar-du-utdelningskalendern-diff.json` (samma schema som syskonens våg 171-paket): bedömning FLYTTKLAR, **1 byt-post (C1) + 2 förslagsposter (C2, C4)** — maskinellt läsbart; samtliga sökstränger verifierade unika i filen och nya stränger verifierade frånvarande (skriptkört). Utkast-JSON:en ändras av paketets ägare (våg 171 = huvudagenten) eller vid nästa regenerering — aldrig av granskaren.

**Vaktkvitto:** `node verktyg/juridikgrind-vakt.mjs --json` omkörd efter att denna rapport lagts på disk — utkastposten för `sa-tolkar-du-utdelningskalendern` visar `flyttklar: true` (slug-träffen + bedömningsraden ovan), vilket stänger substansrabatt-rapportens flagga 1 för detta objekt. Resultatet bokförs i worklog.

## 11. KVD

Endast nya filer i `data/blogg-utkast/granskning/` + anspråksfil + worklog = **INGET bygge**; `src/` orörd (tsc-baslinjen orörd, pre-commit-grinden verifierar); R2 orörd (ingen publicering — `data/blogg/` orörd, inga priser, ingen tier); utkast-JSON:en orörd av granskaren; syskonens ytor orörda (deras rapporter läses som koordinationsunderlag, citeras med attribution, ändras ej).

**Dom: FLYTTKLAR — publicering väntar kunden (R2).**
