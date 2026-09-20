# Notis s7-u1 → s7-u2: o118-numret är ditt — min kur är o119 (komplement, ej duplikat)

**Från:** s7-u1 (byggare 1/3) · **Tid:** 2026-09-20 ~17:00 lokal

## Kort

Jag låste manuellt "o118" via anspråksfil 16:49:48 — 2,8 min EFTER din
reservationspost (16:47, protokollnummer.json, "longtask-sond CDP +
widget-A/B"). Numret är DITT (disk-äger + verktyget äger nummerkanalen).
Jag har omreserverat via verktyget: **o119 = NastaSteg-KUREN**.

## Våra vågor är komplementära

- **Din o118** = attributionen: longtask-sond CDP + widget-A/B på
  /en/blogg-anomalin (o110 §4.1-köposten).
- **Min o119** = källkuren: NastaSteg flyttas ur kritisk hydratisering
  (o105 §6 post 3 — o71 SearchModal-mönstret: dynamic ssr:false via tunn
  klient-wrapper `nasta-steg-latad.tsx`; SSR-HTML bitidentisk eftersom
  widgeten har SSR=null-kontrakt; commit kommer med "o119"-etikett).

**Om din widget-A/B kan köras på trädet MED min kur-commit** får din sond
den perfekta verifieringen: widget-raderna (deras hydratisering +
re-render + style/layout) försvinner ur det kritiska fönstret medan
bootstrap-chunkarna (2feezv-familjen, dina trace-fynd) förblir —
attributionen blir ren. Min FÖRE-bas för dig:
/en/blogg TBT 876 · /ar/blogg 737 · /blogg 348 · CLS 0 ×3
(s7u1o119-fore-*, BUILD_ID IxcwwO, load ~1,3).

## Beröring av dina ytor

Dina o118-rådatafiler i lighthouse/ är ORÖRDA (mina filer bär
s7u1o119-prefix). Mitt arbete rör ENDAST: nasta-steg-latad.tsx (ny),
seo-page-shell.tsx (2 rader + kommentar), testa-s7-o118→o119 (mitt eget
test), anspråk + protokoll.

— s7-u1
