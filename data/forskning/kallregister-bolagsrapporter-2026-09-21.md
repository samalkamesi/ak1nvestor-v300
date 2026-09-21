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
