# KÄLLREGISTER — 10-BOLAGSPROVET (PDF-sektionsextraktion, RAPPORTAKADEMIN)

Datum: 2026-09-21 · Rond 137 · Organ: Σ (forskning)
Uppdrag: källforskning FÖRE karantän-intag av årsredovisningar (kunduppdrag punkt 2:
"PDF-sektionsextraktion verifierad på ~10 bolag FÖRE innehållsproduktion").

## URVAL

Universumet (data/analyses/, 11 bolag). Precise Biometrics förbigås — 3 rapporter
finns redan på disk. Urval = 10 bolag nedan. NOTERA: VOLCAR-B = **Volvo Cars AB**
(inte Volvo Group) — källsidan är investors.volvocars.com.

## REGISTRY (landningssidor + kända URL-mönster)

| # | Bolag (symbol) | Rapport 2025 | Källsida (officiell IR) | Publ. | Direkt-PDF |
|---|---|---|---|---|---|
| 1 | ABB (ABB.ST) | Integrated Report 2025 + Financial Report 2025 (142 s) | abb.com → Annual Reporting Suite Archive; filer på library.e.abb.com | 2026-02-19 | EJ extraherad |
| 2 | Atlas Copco (ATCO-A.ST) | Annual Report 2025 (incl. sustain.+governance) | atlascopcogroup.com/en/investors → Reports and presentations | 2026-03-20 | EJ extraherad |
| 3 | AstraZeneca (AZN.ST) | Annual Report and Form 20-F Information 2025 | astrazeneca.com/investors | ~2025-12-10 (Ovanligt tidigt — VERIFIERAS vid extraktion) | EJ extraherad |
| 4 | Ericsson (ERIC-B.ST) | Annual Report 2025 (en/sv) | ericsson.com/en/investors → Financial reports | 2026-03-04 | EJ extraherad |
| 5 | Evolution (EVO.ST) | Annual Report 2025 | evolution.com/investors/financial-publications/reports; filer på cdn.evolution.com/uploads/ | 2026-04-01 | EJ extraherad |
| 6 | H&M (HM-B.ST) | Annual and Sustainability Report 2025 (bokår dec–nov) | hmgroup.com → Investors → Reports and presentations | ~2026-03 | EJ extraherad |
| 7 | Industrivärden (INDU-C.ST) | Årsredovisning 2025 | industrivarden.se/en-gb/reports-and-presentations/; mönster: globalassets/arsredovisningar/engelska/2025-X.pdf | 2026-02/03 (VD-ord ute: NAV 191,6 mdr SEK) | EJ extraherad |
| 8 | Sandvik (SAND.ST) | Annual Report 2025 (integrerad) | home.sandvik.com/investors → Reports & presentations | ~2026-03 (VERIFIERAS) | EJ extraherad |
| 9 | SKF (SKF-B.ST) | Annual and Sustainability Report 2025 | skf.com/group/investors/financials/annual-reports | 2026-03-06 | EJ extraherad |
| 10 | Volvo Cars (VOLCAR-B) | Annual and Sustainability Report 2025 | investors.volvocars.com | 2026-03-05 | EJ extraherad |

## LEVERANSREGISTER — DIREKTA PDF-URL:ER (rond 142, [organ:Σ])

Alla url:er HEAD-verifierade 2026-09-21: https + content-typ application/pdf +
(known size ≤ 40 MB). Karantän-intaget gör full källverifiering + sha256 vid hämtning.

| # | Bolag | Direkt-PDF (verifierad) | Storlek | Källa/kommentar |
|---|---|---|---|---|
| 1 | ABB | https://library.e.abb.com/public/b32991481e8b4418a5c5261c5ff25440/ABB%20Financial%20Report%202025.pdf | okänd | Officiell library.e.abb.com; Financial Report = registrets 142-s-dokument. Integrated Report har fördunklad sökväg (JS-vägg) —Financial Report används i provet |
| 2 | Atlas Copco | https://www.atlascopcogroup.com/content/dam/atlas-copco/group/documents/investors/financial-publications/english/20260320-annual-report-2025-incl-sustainability-report-and-corporate-governance-report-copy-of-the-official-ESEF-format.pdf | okänd | Officiell IR (ESEF-kopia av tryckta rapporten) |
| 3 | AstraZeneca | https://www.annualreports.com/HostedData/AnnualReports/PDF/LSE_AZN_2025.pdf | 11,2 MB | **SPEGLAD** — officiell IR 403-blockad (Cloudflare), SEC-inlämning (0001104659-26-019130, 2026-02-24) har 449 filer men 0 PDF (ren iXBRL). Spegeln dokumenteras i proveniensloggen; publikt åtkomlig spegel av officiella rapporten (232 s). Dec-2025-datering bekräftad |
| 4 | Ericsson | https://mb.cision.com/Main/15448/4316310/3963269.pdf | 5,1 MB | Officiell Cision-bilaga till releasesidan "Ericsson Annual Report 2025 published" (news.cision.com/ericsson/r/…,c4316310) |
| 5 | Evolution | https://mb.cision.com/Main/12069/4329954/4021102.pdf | 8,9 MB | Officiell Cision-Main-bilaga (är mer direkt än mfn.se-proxyn) |
| 6 | H&M | https://hmgroup.com/wp-content/uploads/2026/03/HM-Group-Annual-and-sustainability-report-2025.pdf | 9,5 MB | Officiell hmgroup.com (wp-content) |
| 7 | Industrivärden | https://storage.mfn.se/a/industrivarden/082602e9-f145-4919-915e-d3581856b071/ab-industrivarden-arsredovisning-2025.pdf | okänd | Officiell MFN-lagring, länkad från pressmeddelandet "Publicering av Industrivärdens årsredovisning och hållbarhetsrapport 2025" (2026-02-26). Engelsk version finns på samma release-sida om behövs |
| 8 | Sandvik | https://mb.cision.com/Main/208/4318236/3973881.pdf | 8,0 MB | Officiell Cision-distribution (pressrelease "Sandvik AB Annual Report 2025", 2026-03-09/10) |
| 9 | SKF | https://mb.cision.com/Main/637/4317545/3969621.pdf | 7,3 MB | Officiell Cision-Main-bilaga till "SKF publishes Annual and Sustainability Report 2025" (c4317545) |
| 10 | Volvo Cars | https://vp272.alertir.com/afw/files/press/volvocar/202603050673-1.pdf | 15,1 MB | Officiell AlertIR-finansvärd (Volvo Cars IR-distribution); fil-ID matchar publiceringsdatum 2026-03-05 |

**Källmetodik (rond 142):** WebFetch var transport-blockerad hela dagen; extraktionen
kördes server-side via node (landningssidor → pdf-grep, sitemaps, Cision-newsrooms,
EDGAR index.json) + WebSearch/DDG för releasesidor. Bot-skydd (403) bemöttes med
Cision/AlertIR/MFN-officiella distributionskanaler — alla utom AZ:s spegel är
förstahandskällor från bolagens egna distributionssystem.

## KONTRAKT MOT KARANTÄN-INTAGET (rond 136, 8abf541e)

- Intaget kräver EXAKTA https-PDF-url:er (källverifiering: https + content-typ +
  40 MB-tak FÖRE hämtning) — landningssidor räcker INTE.
- Nästa steg: extrahera direkta PDF-url:er per källsida (WebFetch), för in i
  intagsmanifest, kör rapport-intag-karantan.mjs per bolag.
- PDF:er hostas ALDRIG publikt — karantän under data/rapportintag/karantan/
  (gitignorerad), provenienslogg per fil (källa+tid+sha256).

## KÄLLOR (sökningar 2026-09-21)

Officiella IR-sidor enligt tabellen; sökresultat bekräftar samtliga 2025-rapporter
publicerade feb–apr 2026 utom AstraZeneca (dec 2025, verifieras) och Sandvik
(mars 2026 förväntat, verifieras).
