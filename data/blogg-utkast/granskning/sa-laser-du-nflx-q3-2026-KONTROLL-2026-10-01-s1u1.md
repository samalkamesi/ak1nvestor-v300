# KONTROLL — sa-laser-du-nflx-q3-2026.json (oberoende granskning)

**Granskare:** fabriksagent s1-u1, manifest auto-s1-1790858103968 (2026-10-01).
**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nflx-q3-2026.json`
(byggt 2026-09-22, kommunikationgrenens åttonde paket, rappdag 2026-10-20 —
FIFO-ettan bland kontrolllösa vid granskningsstart; pivot från orderns
"m9-utkast #1" som är flerfaldigt levererad sedan 2026-09-19, jfr
data/vakten/auto-s1-1790858103968-s1-u1-ansprak.md).
**Metod:** sond `verktyg/_s1u1-nflx-q3-kontroll.mjs` — 143 maskinella kontroller,
slutläge **129 OK · 3 FEL · 11 NOT** (pass 1 bar 6 FEL varav 3 var sondens egna
buggar, rättade före slutsats — se Metodnot),
dubbelkört deterministisk (körning 1 == körning 2, identiska rader) + primärkälls-
omläsning (aktieägarbrevet, se nedan). Utkast-JSON:n ORÖRD (md5
1695fd0fbfeb13cf149123b651fc84dc) — rättningar levereras som diff + flyttklart
paket (nya filer).

**Metodnot (ärlighet om sonden):** tre FEL-rader i pass 1 var sondens egna buggar
(procentenheter i återköps- och mittrutskontrollerna, ordtoken-räkning) — rättade
före slutsats; pass 2 slutresultat 129 OK · 3 FEL, samtliga fynd bekräftade
belagga nedan. Ingen sondbugg belastar utkastet.

## Källålåsning

Textens källrad deklarerar universumraden hämtad 2026-09-03 med fil-md5
6e540c8753d28f8b905a2aab9f15b29d. Git-historiken ger exakt en sådan version:
**d7eae3bc8 (2026-09-21 22:11)** — vintage låst, md5 verifierad fullständigt.
NFLX-radens samtliga fält identiska vintage↔dagens fil (0 drift) — alla domslut
drift-säkra. Primärkällan (Q2 2026 Shareholder Letter på s22.q4cdn.com) omläst
i sin helhet 2026-10-01 (HTTP 200) — kvartalsserien, balansräkning, kassaflöde,
regioner och guider kontrollerade tal för tal.

## GRÖNT (kärnan håller)

- **Källtalsparitet 19/19 exakt** mot vintagen: kurs 82,73 · mcap 344,483 mdr ·
  P/E 25,377 · P/B 11,425 · EV/EBIT 21,801 · PEG 1,49 · FCF-yield 7,4 % ·
  ROE 49,5 % · ROIC 34,5 % · brutto 49,1 % · EBIT 33,4 % · netto 28,22 % ·
  FCF-marginal 52,5 % · skuld/EK 0,55 · omsCAGR 12,6 % · resCAGR 34,7 % ·
  TTM +13,4 % · prognos +6,43 % · insiderköp 18. Serier 2022–2025 exakta
  (oms 31 616/33 723/39 001/45 183 · res 4 492/5 408/8 712/10 981 MUSD).
  Fotnoterna (fyra år, prognos = EPS-tillväxt, räntetäckning osatt,
  ROIC-proxy) återgivna ärligt i texten.
- **Medianer 12/12 exakta** mot vintagen med korrekta n: P/E 16,2 (n=21) ·
  P/B 2,27 (23) · EV/EBIT 14,5 (23) · PEG 1,49 (17) · ROE 16,3 % (23) ·
  ROIC 10,7 % (23) · brutto 47,8 % (23) · EBIT 18,1 % (23) · netto 11,5 % (23) ·
  skuld 1,28 (23) · omsCAGR 3,3 % (23) · FCF-marginal 12,6 % (22).
- **Rang 11/11 exakta**: P/E femte högst av 21 · P/B näst högst av 23 ·
  EV/EBIT fjärde högst av 23 · ROE högst av 23 · ROIC tredje högst av 23 ·
  EBIT näst högst av 23 (bakom Meta 34,8 %) · netto tredje högst av 23 ·
  skuld åttonde lägst av 23 · omsCAGR sjätte högst av 23 · FCF-marginal högst
  av 22 · PEG exakt på medianen av 17 (NFLX värde = medianvärdet).
- **Primärkällan (brevet) exakt på i princip varenda tal**: kvartalsserien
  (intäkter 11 079/11 510/12 051/12 250/12 560/12 860F · y/y 15,9–11,7 ·
  rörelseresultat 3 775→4 268F · marginaler 34,1→33,2 · EPS 0,72/0,59/0,56/
  1,23/0,80/0,82F · aktier 4 349→4 261) · engångsposten 2 852,166 ·
  vinst-före-skatt Q1 6 547 · Q1-netto 5 283 · Q2-skattesats 16,40 % ·
  balansräkningen (kassa 9 099 · innehåll 33 838 = 57,9 % ≈ 58 % av tillgångar ·
  EK 30 152 · skuld 14 309) · FCF-kvartalen 2 660+1 872+5 094+1 525 = 11 151 ·
  återköp Q2 4 714 ("största kvartalet någonsin" är brevets egen formulering) ·
  H1 5 985 · regionerna 5 432/4 034/1 584/1 510 med tillväxt 10/14/21/16 ·
  guider (51,0–51,4 · marginal 31,5 mot 29,5 · FCF ~12,5 · annons ~3,0 ·
  rörelseresultat +20 % årligen) · 97 mdr timmar (+2 %) · live ~5 % av
  innehållsbudgeten mot ~1 % av timmarna · AI ~300 titlar · "Warner Bros.
  termination fee"-noten ordagrant. Splittens datum (30/10–17/11 2025) och
  "(approaching 1B people)"-formuleringen spårar brevets/källans egen text.
- **Aritmetik ~70 poster** (tolerans 0,05–1 %): engångspostkedjan
  (6 547−2 852 = 3 695 → ×0,836 = 3 089 → delta 2 194 → TTM 11 456) ·
  marginalpar 28,2/23,7 · identitetstestet 344 483/25,377 = 13 573,5 med gap
  exakt 0,56 % ("seriens tajtaste klass" håller) · TTM-summor 48 371/14 355 ·
  P/B-stängningen via aktiebas 4 163,9 → BVPS 7,24 → 11,43 mot fältet 11,425 ·
  DuPont 12,6 mot 11,4 (gap 10,0 %) · slut-EK-ROE 45,3 · EV-kedjan 349,7 →
  24,4 mot fältets 21,8 med implicerad EBIT-bas exakt 16 040 · skuldkvot 0,47 ·
  CAGR-replikering 12,64/34,71 · PEG-världarna (3,9 konventionellt, 17,0
  implicit) · kursglidningen 8,8 % med P/E-paret 23,1/27,4 · FCF-paret
  23,05/3,24/24,4/2,3 · sex kvartalsmarginaler · EPS-mekaniken 1,088×1,021 =
  +11,1 % · regionsumman 12 560 · scenariorutan 9/9 celler korrekta OCH rätt
  placerade (rader = intäkter × kolumner = marginaler) med mittrutan 21,0 %
  mot årsbasen 13 329 och bolagets 20-procentslinje · känsligheter 512/1 536
  med vikten 3:1 · split-identiteterna. Avvikelser: se fynden — övrigt grönt.
- **Juridik 2007:528 REN**: varumärkesgrinden 0/26 fraser på title+description+body ·
  rådordsträffar samtliga i legitim kontext (negerad disclaimer, "köper
  multipeln"-metafor, "bör du veta" epistemiskt, "insiderköp" fältnamn,
  "återköp" fakta-term) · exakt en lagrumsfamilj (2007:528 + 2 kap 5 §) ·
  disclaimer med lagrum + R2 sist i bodyn · utbildningsramen bärande
  ("övningar i metod", "så läser du").
- **911-referenser: 0.**
- **Länkar**: 14 unika interna (/dataset/kommunikation/* ×11, /kurser,
  /transparens, /kallor) — samtliga HTTP 200 mot localhost:3000; extern
  aktieägarbrevs-PDF 200. FCF-radens länk till /fcf-avkastning bärs av en sida
  som även redovisar marginal-innehåll (etiketten "FCF-marginal" med värdet
  52,5 försvarbar; källkritiken redovisar båda fältvärdena öppet).
- **Kalender**: rappdagen 2026-10-20 är en tisdag · utlysningen 2026-09-14 med
  kommuné ~13:01 PT (22:01 svensk) och intervju 13:45 PT (22:45) — tidszons-
  aritmetiken CEST+2/PDT−7 = 9 timmar korrekt · publishedAt = rappdagen ·
  korsreferenser belagda: P&G-gallran (ordagrant i pg-filen, jfr fynd C8),
  Truecaller-precedensen (pg-filen), MTG som grenens sjunde paket, NVDA 17/11
  tredjepartsklassad, de sju föregångarna (AT&T/Tele2/Telia/Meta/Disney/
  Verizon/MTG) på disk.
- **Formatering**: title 298 tkn ≤ 314 (wihlborgs-taket) · 2 788 ord → rm 5 ✓ ·
  slug/tags konventionsenliga.

## FYND (rättningar — samtliga verkställda i flyttklart paket)

### B-klass (talfel/fakta — 4 st)

- **B1 — "45 miljoner för hela första halvåret 2025"**: brevets komparativ är
  90 529 tkr ≈ **91 MUSD**; 45 är en halveringsslupp. → D1 (91).
- **B2 — "Meta bär grenens högsta P/B"**: vintagens trappa är SPOT 11,940 ·
  NFLX 11,425 · IVSO.ST 9,030 · META 5,783 — **Spotify** bär toppen, Meta är
  fyra. Netflix "näst högst" (tabell + title) förblir sant. Metas rätta
  superlativ — grenens högsta EBIT-marginal 34,8 % — sattes in i rightningen
  ("näst högst bakom bara Meta" i nyckeltalsavsnittet var redan korrekt). → D2.
- **B3 — "styrelsen har auktoriserat 27,1 miljarder till"**: brevet: +25,0 mdr
  ny auktorisation i april på toppen av 6,8; 27,1 = **kvarvarande totala
  kapacitet**. Title/description ("auktoriserat kvar") var korrekta — endast
  bodyn conflatede. → D3.
- **B4 — "valutan drog i Latinamerika och hjälpte i Asien"**: brevet: LATAM
  +21 % rapporterat mot +16 % valutaneutralt (valutan HJÄLPTE) · APAC +16 mot
  +18 (valutan DRAG) — **riktningen var omvänd**. → D11.

### C-klass (precision/språk/aktualitet — 7 fynd, 8 satser)

- **C4 — "(21–22 mätvärden per mått)"**: faktiskt spann 17–23 (PEG 17, P/E 21,
  FCF 22, övriga 23) — på två ytor (avsnitt + källrad, tankstreck varianterna).
  Tabellens per-mått-n är samtliga korrekta. → D4a+D4b.
- **C5 — "fem steg"/"fem hela multiplar"**: steget är 4,69 (30,07−25,38) →
  "nästan fem" på två ytor. AT&T-rondens F3-klass. → D5a+D5b.
- **C6 — "balansradsPOST"**: versal-artefakt → "balansradspost" (sammanförd
  med D5b).
- **C7 — "approaching en miljard tittare"**: källblödning från brevets
  engelska → "nära nog en miljard". → D7.
- **C8 — P&G-citatet var parafras i citattecken**: rättat till ordagrant
  lydelse ur pg-filen. → D8.
- **C9 — "ASM International 27/10 är MarketScreener-källa"**: sant vid
  byggtiden 09-22, men bolagsbekräftat 30/9 (asm.com) — aktualiserat för
  publiceringsdatumet 20/10. → D9.
- **C10 — "telik men inte tele-tung"**: oklar bildning → "tele-lik". → D10.

### NOT (dokumenterade, ingen rättning)

- **N1 — kalenderfilens NFLX-klass föråldrad**: kalender-kommunikation.json
  (hämtad 09-15) kallar datumet "estimat/obekräftat" trots utlysningen 14/9 —
  bolagskällan äger (Stora Enso-precedensen); patch för vidarebefordran i
  diff-jsonen (V1) — filen lämnas orörd av granskaren.
- **N2 — brev-/sökbelagda tal ej maskinellt omverifierade här**: Q2-guiden
  32,6 % (ur Q1-brevet), "EPS 0,79 väntat", IR-widgeten 75,42 (17/9),
  splitdatumen — internt konsistenta och källrade; diff-jsonen V2.
- **N3 — "sex av de tio starkaste nyteckningsdagarna"**: brevet qualifierar
  "over the last five years" — utelämnad tidsram försvagar ej påståendet.
- **N4 — description 831 tkn**: seriekonventionens längd, ingen maskinell gräns.
- **N5 — ordinalen "omkring 87:e på disk"**: diskretionär bokföring, accepterad.

## DOM

**GRÖN GRUND → FLYTTKLAR EFTER 12 RÄTTNINGAR.** Kärnan (källfält, medianer,
rang, ~70 aritmetikposter, juridik, 911, länkar, kalender) är helgrön och
primärkällan bekräftar brevtalen nästan utan undantag — fynden är två jämförelse-
sluppar (45→91, Meta→Spotify), en auktoriserings-conflation, en omvänd
valutariktning samt språk-/precisionsdetailjer. Paketet efterverifierat:
gamla felsträngar 0 · samtliga 12 nya på plats · varumärke 0 · 911 = 0 ·
en lagrumsfamilj · title 298 · ord 2 825 → rm 5 · invarianter (slug, title,
description, publishedAt, readingMinutes, tags) oförändrade. Publicering =
kundens beslut (R2).

## Kö-notis för spåret (nästa kontrolllösa, FIFO enligt rappdag)

sap (21/10 kl 22:05 — kvällsrapporten) → 22:a-klustrets resterande: swedbank ·
castellum · nokia (bär AT&T-rondens vidarebefordrade publishedAt-not) · yara ·
seb · pg · newmont — essity levererat av syskon u2 och tesla av syskon u3 samma
dag. Vidarebefordras även: kalenderpatch V1 (kalender-kommunikation.json
NFLX-klass) till nästa kalenderägande rond.
