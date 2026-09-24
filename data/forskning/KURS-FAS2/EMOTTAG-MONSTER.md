# EMOTTAG-MÖNSTER — mall för kursvågarnas emottag (v170, 2026-09-24)

Referensimplementering: `verktyg/_v182-emottag.mjs` (v167-emottaget, kurerat v170)
+ självtest `verktyg/_v170-sjalvtest.mjs` (7 PASS · 0 FEL, sandbox). Nästa vågs
emottag kopierar mönstret och anpassar KURSER-tabellen + kontraktet.

## Grundmodellen (v167, bevisad)

1. **Leverantörer skriver fragment** (`data/forskning/KURS-FAS2/<våg>-fragment/<slug>.json`)
   — exklusivt filägarskap per leverantör (fabriksbarn el. session), ALDRIG direkt
   i `public/deep-courses.json`.
2. **Emottaget äger granskningsfilen och integrationen** — kontroll per fragment,
   atomär append i deep-courses.json ENDAST vid samtliga GRÖNA, commit av huvudagenten.

## Bindande regler (v166/v167-läxorna — maskinellt kurerade i v170)

1. **Väntar-listan uppdateras VID LEVERANS.** Disk-läget är sanningen: finns
   fragmentet är kursen LEVERERAD och syns det i LÄGE-raden med tidsstämpel.
   Roten till v166:s tre dubbelarbeten (d13/d19/d22) var att listan speglade
   granskningsläget, inte leveransläget. PRAKTISKT: levererande session ropar
   `node <emottag>.mjs status` som SISTA steg i sin leverans — fabriks-
   manifestprompten SKA innehålla det steget explicit.
2. **KURSBLOCK byggs om per körning — senaste mätningen gäller.** Block
   ERSÄTTS, appendas aldrig (v170-kur: block från mätningar före mätkurkor
   låg kvar i v167:s fil och skilde sig från slutläget). Dubbelkörning ska
   vara bitidentisk — självtestet mäter det.
3. **STÄNGDVAKT.** En stängd vågs granskningsfil (SAMMANFATTNING-raden bär
   STÄNGD) är arkiverat bevis: status lämnar filen orörd, integrera vägrar
   (dubbelappend-skydd).
4. **Integrationens måttkedja** (v167:s bevisade kappa): formatvakt rondtrip
   bitidentisk på original → append mäts mot läget-före-append (HEAD före
   commit, dvs. commit~1 efteråt — ALDRIG mot ett senare HEAD) → chapters_list
   orörd → övriga kurser orörda → parse-bar skrivning.
5. **Integrera vägrar vid saknade eller RÖDA** — inga undantag, inga "nästan".

## Hanterade läxor med beslut (bokförda, ej kodkurerade)

- **Fem historiska d-KVD-verktyg med skört HEAD-mått** (v166: d-verktygen;
  mätfelsklassen d10/d11/d14/d15/d18): historiska engångsverktyg — deras röda
  eftersattes med föräldrar-bevis (rond 177/179). Emottaget bär det rätta
  måttet (regel 4). Kurera inte historik; skriv rätt mönster från början.
- **d16-KVD:s /tmp-beroende** (okörbar utan rensad backupfil): samma klass —
  engångsverktyg, neutral granskning användes istället.

## Vid vågstart (checklista)

- [ ] Kopiera emottaget + självtestet, anpassa KURSER (slug, underlagsfil, sektionsrubrik, kapitelnummer) + kontrakt
- [ ] Kör självtestet mot sandbox — GRÖN krävs innan vågen öppnas
- [ ] Manifestprompterna (om fabriken används) bär: fragmentfilens exakta sökväg, "status-rop som sista steg", juridikdeklarationerna, LEVERANS-radskrav
- [ ] Granskningsfilen skapas med PROCESREGLER-sektionen (se V167-GRANSKNING.md)
