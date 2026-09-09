# A4-KVARTAL-KONTRAKT — "AK1A Kvartalsdata" (FRONT A, punkt A5)

Forskningsagent A4-KVARTAL, 2026-09-07. Mandat: STYRELSE-AI-INNOVATION.md
FRONT A (A5: "kvartalsvisa DATA-rapporter — länkvärda, citerbara"). Bygger på
A2-DATASET-KONTRAKT.md:s gränsdragning (§1) och dateringsprinciper (§5).
Ingen src berörs av A4 — detta är kontraktet vågen bygger mot.

**Idé:** en fruset-ögonblick-publication per kvartal — webbens svar på ISSN-
tidskrift: beständig URL, daterad utgåva, md5-kontrollsumma, CC-BY-licens.
Journalister/bloggare/AI-motorer citerar utgåvan, inte "läget just nu" —
citatet åldras aldrig fel. Det slår Avanzas försprång: domänauktoritet byggs
på det som LÄNKAS, och länkar följer beständiga, daterade datapunkter.

---

## 1. FORMAT — sidan `/kvartalsdata/<q><n>-<åååå>`

- Route: `src/app/(huvud)/kvartalsdata/[kvartal]/page.tsx` (dynamisk statisk;
  giltiga värden q1–q4 + år ≥ 2026; ogiltigt → notFound). Landskods-spegling
  (en/ar) = våg-fråga, som A2 §2. Indexsida `/kvartalsdata` listar utgåvorna
  (nyast först) + "nästa utgåva fryses <datum>".
- Täckande sektioner per utgåva (samma ordning varje kvartal — citaterbar
  förutsägbarhet): 1) Kärntal i ingressen (definitive-answer-format), 2)
  Forskningsläget (statusfördelning G/G/R, datatackning), 3) Regim (AKM3,
  etikett + indikatorer + trösklar), 4) Vågstatistik (träff-% per horisont ×
  klass, protokollversion, n), 5) Branschmedianer (P/E, EV/EBIT, P/B, ROE,
  EBIT-marginal, n-redovisat), 6) Utbildningsstatistik (räknare), 7) Metod-
  bilaga (källor, dom-protokoll, gränsdragning) + licens + checksumma.
- **ISSN-andan utan ISSN:** varje utgåva bär "AK1A Kvartalsdata, utgåva
  Q3 2026, fryst 2026-09-30 · md5 <hash> · CC BY 4.0". Utgåvan är OFÖRÄNDERLIG
  efter frys (uppdateringar = ny utgåva/errata-not, aldrig tyst omredigering).
- **PDF-export — utredning print-CSS:** server-PDF (puppetrer) avvisas (vikt,
  underhåll, byggtid). Slutsats: ren `@media print`-stilmall räcker — A4,
  `page-break-before` per sektion, gömd navigation, URL:er trycks ut som
  fotnoter, "Spara som PDF"-knapp (`window.print()`). Browser-native PDF =
  noll beroenden, samma innehåll, samma md5-värde.
- **Licens CC BY 4.0 på aggregeringen:** "Datat i denna utgåva får återanvändas
  med angivande 'AK1A Research Lab' + länk till utgåvans URL." Rådata är
  publik marknadsdata (Yahoo/MarketStack); licensen gäller AK1A:s aggregat,
  urval (10×10-universumet) och sammanställning — det gör citering juridiskt
  krångelfri, vilket ÄR poängen.

## 2. AUTOMATISERING — frys-cron (serverns crontab)

- **Fryst fil:** `data/rapporter/kvartal/<q><n>-<åååå>.json`, schema
  `ak1a-kvartalsdata/1`. Sidan renderar ENDAST ur fryst fil — aldrig live-
  muterande källor (AILM: rapporten är kvitto, inte dashboard).
- **Cron:** route `src/app/api/cron/kvartalsfrys` (runtime nodejs, samma
  auth-mönster som befintliga crons), triggad från SERVERNS CRONTAB (tidigare leverantör-
  boxen, ej Vercel-cron — kvartalskadens + manuell kontroll före publicering):
  `15 2 1-7 1,4,7,10 * curl -fsS https://lab.ak1nvestor.com/api/cron/kvartalsfrys`
  Frysfönster = dag 1–7 i nya kvartalet; fryser senast tillgängliga snapshot
  per källa. IDEMPOTENT: finns filen → no-op (write-once, ALDRIG omfrys).
- **Determinism:** kanonisk serialisering ( sorterade nycklar, fast decimal-
  precision, inga väggklocks-tidsstämplar i payloaden); `frysDatum` = kvartalets
  sista kalenderdag (ren funktion av kvartals-ID); `md5` beräknas över kanonisk
  JSON utan md5-fältet och redovisas i filen + index + på sidan (journalisten
  kan verifiera). Filinnehåll = kopior av aggregationer enligt §4 — inga
  per-bolagsfält med AKM-poäng (A2 §1:s NEJ-rader gäller oförändrat).
- **Index:** `data/rapporter/kvartal/INDEX.json` (utgåva · md5 · frysDatum ·
  kärntal) — apparaten bakom /kvartalsdata-index + sitemap.

## 3. LANSERINGSRITUAL (per kvartal, checklista i kontraktet)

1. Cron fryser utgåvan (§2) → sidan live på beständig URL.
2. **Bloggpost** samma dag: "AK1A Kvartalsdata Q3 2026: median P/E 20,5 —
   teknik dyrast (31,9), finans billigast (13,4)" — kärntalen först (A4:s
   definitive-answer-stil), länkar utgåvan + /data-sidorna (A2).
3. **Nyhetsbrev** via mejl-stacken när kund-leverantören är klar (B2/FRONT C);
   mall: kärntal + 3 tabellrader + länk.
4. **Crawler-ping:** sitemap.ts lägger in utgåvans URL med `lastModified` =
   frysDatum (INTE "nu" — beständighetssignalen är att utgåvan inte ändras);
   IndexNow-ping (Bing/Yandex/Naver) + Google via vanlig sitemap-refresh.
   robots/llms.txt (A1) uppdateras med utgåve-URL + kärntal i citatsektionen.
5. (Framtida, FRONT C) sociala manus ur m9-fabriken per kärntal.

## 4. FÖRSTA UTGÅVAN — Q3-2026: exakta frysmängder (status 2026-09-07)

| Fryspost | Källa (fil) | Innehåll Q3-2026 | Fryst värde |
|---|---|---|---|
| Branschmedianer | `bolagsunivers.json` (hamtat 2026-09-03) | 10 rader: bransch · n · median P/E · EV/EBIT · P/B · ROE · EBIT-marginal + totalt | t.ex. teknik 31,9 · finans 13,4 · totalt 20,5 (n=92/100) |
| Universumdeklaration | samma | 10×10-struktur, urvalskriterier, råkällor (Yahoo/MarketStack), hämtdatum | 100 bolag, 2026-09-03 |
| Forskningsläge | `korstabell-grund.json` → forskningslagets aggregat | grön/gul/röd-andel, n, datatackning, senastKontrollerad | G 0,07 · R 0,17 (2026-09-03) |
| Regim | `regime-logg.json` sista raden (hash-kedjad) | etikett, indikatorer, modellversion, logg-hash | "magert" (AKM3.2026.09, G 0,07/R 0,17) |
| Vågstatistik | vagvalidering-rapporten (JSON-spegel enl. A2 §3.2 alt a) | träff-% per horisont × klass, totalt, n, osatt-andel, protokoll v1-historik + v2-räknare | 52 % (n=48, v1) · 20 % osatta · 12 vågbolag |
| Utbildningsstatistik | `data/siffror.json` (2026-09-03) | kurser/quiz/bokmaster/kanon/fas-räknare | 333 · 8 211 · 103 · 102 (96) · 18+24 |

Not: regimens EGNA kadens är redan kvartal (regim.ts: snapshot-identiteten =
senastKontrollerad) — kvartalsutgåvan och regimesnapshoten faller ihop naturligt;
utgåvan är regimenäs officiella publiceringsyta. Fryspunktsval Q3-2026: frys vid
fönstret 2026-10-01→07 på då färskaste universum; om ingen refresh skett fryses
2026-09-03-snapshoten med ärlig datering (treskiktat: hamtat · fryst · publicerat).

## 5. ÄRLIGHET + JURIDIK (ärvs rakt av A2 §5)

Samma block på varje utgåva: transparens-disclaimer (lagen 2007:528 — pedagogisk
forskning, ej rådgivning), metod-länk /transparens, treskiktad datering, n-
transparens ("osatt är information, inte fel"), inga superlativ-garantier (träff-%
= kvitto). Tillagt för kvartalsformatet: versionshistorik per utgåva + errata-
princip + CC BY 4.0-attributionsrad. VERSIONSVAKT gäller: vågstatistik visar
aktiva v2-räknare + v1 märkt "historik (nollställt 2026-09-04)" — aldrig blandade
protokoll i samma tal.

## 6. Fas-gating

0 gating — utgåvan är förvärvs- och citeringsyta (A2 §6 oförändrat). Per-bolag-
AKM-poäng, poängmedianer per bransch och ersättningsförslag förekommer ALDRIG i
frysta filer; framtida fält som bär poäng styltas "prenumeration" vid kontrakts-
ändring. Utgåvan länkar TILL /portfolj-forskning som nästa steg (konvertering).
