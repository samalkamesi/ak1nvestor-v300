# KONTROLLGRANSKNING m9 #1 · #4 · #5 — boerspsykologi-fallstugor (v1) · branschmedianer-akm2 (v2) · forskningsläget-gröna-av-100 (v1) — 2026-09-19

**Objekt:** `data/blogg-utkast/m9-ko/boerspsykologi-fallstugor-v1.json` · `branschmedianer-akm2-v2.json` · `forskningslaget-grona-av-100-v1.json` (samtliga status utkast, m9-fabriken, skapade 2026-09-11)
**Granskad:** 2026-09-19 av huvudagenten (rond 102 [Φ], våg 208 del 2) — OBEROENDE omräkning enligt kassaflodesanalys-mönstret (rond 101).
**Off-gräns:** publicering = kundens beslut (R2) — inga filer flyttade till `data/blogg/`, databasen orörd.

## BEDÖMNING: samtliga tre GRÖNA — FLYTTKLARA — 56 maskinella kontroller, 0 FEL

Sonden `verktyg/_r102-kvd-tre.mjs` (rondens leverans, committad): **56 OK · 0 FEL · exit 0** (A=11 · B=25 · C=13 · juridik/form ×3 = 7).

## Källor — md5 mot kvitto (samtliga MATCHAR dagens träd, ingen git-återvinning behövdes)

| Källa | Kvitto-md5 | Status 2026-09-19 |
|---|---|---|
| `data/rapporter/vagvalidering-SENASTE.json` | `42970c1a…` | **MATCH** |
| `data/rapporter/vagvalidering-SENASTE.md` | `b7194627…` | **MATCH** |
| `data/portfolj-system/korstabell-grund.json` | `33fe62a0…` | **MATCH** |
| `data/varumarke.json` | `9b906e42…` | **MATCH** |

## #1 boerspsykologi-fallstugor — GRÖN (11 kontroller)

- **Totalt-blocket** (JSON-spegeln): träffprocent **52 %** · n dömda **48** · osatta **20 %** — exakta mot `vagvalidering.totalt`.
- **Fallstudie 1:** kort/impulsvåg **100 % på n=2** — exakt mot `perHorisontKlass[kort/impulsvåg]`; sannolikhetspedagogiken **P(2/2 | slant) = 25 %** = 0,5² ✓ och talet förekommer i bodyn.
- **Fallstudie 2:** medellång+mega/basbygge **0 träffar på n=12** — summor av klassens två rader exakta; **P(0/12 | slant) ≈ 0,02 %** = 0,5¹² = 0,0244 % avrundat ✓, talet i bodyn.
- **Fallstudie 3:** protokollregeln citeras ordagrant ur källan — **"osatt klass döms ALDRIG"** förekommer exakt i `vagvalidering-SENASTE.md` ✓.

## #4 branschmedianer-akm2 (v2) — GRÖN (25 kontroller)

- **Universum:** 100 rader · **tio branscher · samtliga n=10** ✓ (korstabell-grund).
- **Samtliga tio branschpåståenden** (median AKM2 + spridning min–max): teknik 61 (37–78) · konsument 60,5 (19–70) · industri 60 (51–85) · kommunikation 60 (39–68) · energi 58 (31–77) · hälsa 56,5 (46–66) · fastighet 50 (42–60) · tillväxt 43 (25–58) · material 42 (31–79) · finans 41 (30–80) — **tjugo värden, samtliga exakta mot egna omräkningar.**
- NOT utan fel: filen är **version 2** — v1 är supersederad och finns inte kvar i m9-ko (kvitto-kedjan går via v2:s egna källor, samtliga md5-låsta).

## #5 forskningsläget-gröna-av-100 — GRÖN (13 kontroller)

- **Statusfördelningen:** **7 gröna · 76 gula · 17 röda · 0 osatta** (summa 100) — exakta räkningar mot korstabellens 100 rader; andel gröna **7 %** · andel röda **17 %** ✓.
- **Tre gröna toppbolag:** INDU-C.ST 58,1/67 (industri — branschens enda gröna) · NEM 55,1/71,1 (material — branschens högsta gröna, framför NHY.OL 53,4) · INVE-B.ST 54/62,9 (finans — branschens enda gröna) — värden, grön-status och toppbolags-position alla verifierade.
- **Regimslutet "magert":** trösklarna (rikt ≥10 % och ≤30 % · magert <8 % eller >35 %) är **utkastets eget analysram, definierat i bodyn** — inte ett källcitat. Slutsatsen är internt konsistent med källan: andel gröna 7 % < 8 % ⇒ magert ✓. Ärligt redovisat som analysram i texten.

## Juridik + form (×3)

- **forbjudnaFraser** (varumarke.json regex-mönster, titel+ingress+body): **0 träffar** · **rådgivningsglossor: 0** · **disclaimer sist: ja** — samtliga tre.
- Form-observationer (inga fel, serieformat): titlar 74/68/56 tkn (C under 60 även med "(utkast)"-suffix) · omslag null (tillkommer vid publiceringssteget) · bodyar 4 565–4 995 tkn.

## Konklusion

**Samtliga tre GRÖNA — FLYTTKLARA för kundens publiceringsbeslut (R2).** m9-familjen är därmed **komplett granskad 6/6 FLYTTKLARA** — våg 208 stängs. Determinism-sektionen (fabrikens kandidatMd5-återbyggnad) är liksom rond 101 utanför scope; tal-täckningen är ekvivalent (samtliga urdragspåståenden omräknade mot md5-exakta källor).
