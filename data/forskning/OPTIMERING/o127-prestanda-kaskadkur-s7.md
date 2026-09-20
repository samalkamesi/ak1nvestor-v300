# O127 — Spår 7: KASKADKUR .flex>*/.grid>* → @layer base + slider-metrologin (flikklick-läge)

Ägare: fabriksagent s7-u1 (byggare 1/3) · Nummer: o127 (verktyget, hogstaKanda
o126) · Anspråk: `data/vakten/s7-o127-slider-tummar-u1-ansprak-2026-09-20.md`
· Datum: 2026-09-20 (fönstret 22:55–).

## §1 Objektval och omfördelning (öppen redogörelse)

Ursprungsval: o123 §"Medvetet kvar" post 1 — slider-tummar 16 px (spårets
bokförade nästa öppna post, krävande "verktyget behöver tabbklick-läge först").
Under FÖRE-arbetet levererade syskonet **s7-u2:o128** (commit 54c95abd)
slider-TUM-kuren (max-md 52-box + visuell cirkel i barn-span). Enligt
doktrinen "duplikat är förlorat arbete" lämnas slider.tsx helt åt dem —
DÄREMOFÖRDELAS denna våg till de delar som förblev öppna och är mina:

1. **KASKADBUGGEN (denna vågs kärna):** projektregeln `.flex > *,
   .grid > * { min-width: 0 }` (globals.css, olagrad) vann kaskaden över
   Tailwinds `@layer utilities` — oavsett specificitet (CSS-kaskadlagen:
   olagrad > lagrad). Samtliga `min-w-*`-utilities på flex-/grid-barn var
   neutraliserade i hela projektet (46 min-w[-användningar i src/).
   **Bevisat offer: o123:s pill-breddsfix** (commit 2, "min-w 52") —
   Hälsa-pillen mätte 44 px BRED trots klassen `max-md:min-w-[52px]` på
   elementet, media-match sann, media-query-formen korrekt (sond-probe
   fungerar). KASKAD-BEVIS (o127-diag, CDP): exakt två regler tävlar om
   elementets min-width — `.max-md\:min-w-\[52px\]{min-width:52px}` i
   `@layer utilities` + `@media not all and (min-width:48rem)`, mot
   `.flex > *, .grid > *{min-width:0}` olagrad. Den olagrade vinner.
2. **Kuren:** de två selektorerna flyttas in i `@layer base` (globals.css,
   11+/7−). Layer-ordningen (theme, base, components, utilities) gör att
   utilities nu vinner rättvänt; base-nivån behåller global
   shrink-reset för allt som inte självt sätter min-width — beteendet
   oförändrat utom där utilities uttryckligen sagt sitt.
3. **Slider-sonden med flikklick-läge** (`verktyg/_s7u1o127-slidersond.mjs`):
   o123:s bokförda verktygsbehov. Läxor inbyggda: scrollIntoView + CDP-
   musklick (triggern ligger utanför 390×844 — el.click() och klick utan
   scroll missar; Radix mountar först vid träff), Network.setCacheDisabled
   (o123:s metrologi-läxa), RAM-vakt 700 MB, egen CDP-port 9339.

## §2 FÖRE-bevis (BUILD LDVlDGu2emrv69nCJjMW4, deployad 064f1484 20:52:07Z)

**Slider (sonden, /kalkylator, flik "⌨️ Poängsätt manuellt" klickad):**
20 sliders, **20/20 under 52 px** (16×16, `size-4`), rot 128×6; sidans
övriga tryckmål i aktiv flik: 0 under 52 (o123:s kurer håller — sliders
var sista klassen). Rådata: `lighthouse/o127-slider-fore.json`.

**Pill (o123:s öppna verifieringstråd):** `/dataset` = 1 fynd kvar —
Hälsa-pillen 44×52 BREDD; klassen `max-md:min-w-[52px]` finns i live-HTML
(curl-bevis ×2) och regeln i CSS-chunken (md5 disk=serverad), men computed
min-width = 0 px (kaskadbuggen ovan). o123:s förväntade bild "0 under 52"
kunde INTE inträffa — deras commit 2 var verkningslös. Rådata:
`lighthouse/o127-pill-fore-kontroll.json` + diagnostikkedjan.

## §3 Diagnostikkedjan (rotbevisarkivet, engångsverktyg _o127-diag*.mjs)

Eliminering i ordning: serverad CSS ≠ disk (falskt — md5 identisk) →
byggfönster-mix (falskt — deployen avslutad 20:52Z, diskfilens 22:50 lokal
= 20:50Z är deployfönstret självt) → nätverkstrunkering (falskt —
decodedBodySize 254 870 = hela filen) → CSSOM-trunkering (falskt —
@layer utilities bär 2 277 barn; tidigare "saknade regler" var egna
diagnosters iterationsfel: tom cssRules-lista är truthy) → media-formen
`not all and` (falskt — injicerad probe på plats ger computed 52px) →
**kaskaden (SANN): olagrad `.flex > *, .grid > *` vinner över @layer
utilities.** Metrologi-läxa: UA-override är OBLIGATORISK med
setDeviceMetricsOverride — utan den tolkas viewport 980 px och max-md
är korrekt inaktiv (falsk negativ).

## §4 Kurer (src ENDAST Edit)

| Fil | Ändring |
|---|---|
| `src/app/globals.css` | `.flex > *` + `.grid > *` in i `@layer base` med dokumentationskommentar (11+/7−; inget annat) |

**Orörda ytor (kontraktstest K4–K5):** s7-u2:o128:s slider.tsx-kur orörd;
o123:s pill-klasser i dataset-sortering.tsx orörda; arbetsytans övriga src
orörd (git status: endast globals.css).

## §5 KVD

- Kontraktstest `verktyg/testa-s7-o127-kaskad.mjs`: **7 PASS 0 FAIL**
  (K1 layer-placering · K2 unika selektorer · K3 omgivning orörd ·
  K4 o128-yta orörd · K5 o123-klasser orörda · K6 sondmetrologi ·
  K7 FÖRE-data).
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**.
- INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd.

## §6 EFTER-kriterier (vakarövertag-barra)

1. Deploy med denna commit som förfader (prod-synk, RAM-gated).
2. prod 200 ×5 (/ · /kalkylator · /dataset · /blogg · /en).
3. Sond /dataset: Hälsa-pillen 52×52 → **0 under 52** (o123:s tråd
   Slutlevererad).
4. Sond /kalkylator manuellt-flik: tummar 52-box (o128:s kur + min
   kaskadkur tillsammans — deras size-[52px] behövde inte kaskadkuren,
   men FÖRE-mätningens 20/20 var deras kur OUTAN — EFTER-mätningen
   verifierar deras leverans på riktigt träd med mitt instrument).
5. Lighthouse CLS 0 på /kalkylator + /dataset (o100:s heliga noll —
   pillens breddväxt + tum-boxarna får ej skapa layoutskifte).
6. Gränssnittsvakten efter deploy (egen gränssnittsändring — doktrinen).

Status vid FÖRE-commit: ** vakarövertag AKTIVERAT** (c017f9bf). Synken
VÄNTAR-RAM sedan 21:17Z (2 854–2 955 MB < 3 400; trycket = fabrikens egna
3 byggarbarn à ~0,4–1,6 GB — inga läckta Chrome kvar att städa, process-
kirurgi aktuell INTE aktuell: barnen är aktiva syskon, ALDRIG dödade).
Fönstrets läge:-agenten avslutar medvetet ⇒ ~1,6 GB frigörs ⇒ synkens
nästa 10-min-poll får byggfönster ⇒ deploy med c017f9bf som förfader.

**VAKARÖVERTAG-KOMMANDON (§6 i turordning):**
1. Vänta DEPLOYAD-rad i `data/vakten/prod-synk.log` (rop var 10:e minut;
   bekräfta `NY KOD: … → c017f9bf`-avkomma) + `prod 200 ×5`
   (/ · /kalkylator · /dataset · /blogg · /en).
2. Pill (o123-tråden slutstängs):
   `node verktyg/_s7u2o123-sond.mjs data/forskning/OPTIMERING/lighthouse/o127-pill-efter.json /dataset`
   → förväntat **0 under 52** (FÖRE: 1 — Hälsa 44×52).
3. Slider (verifierar ÄVEN s7-u2:o128:s tum-kur):
   `node verktyg/_s7u1o127-slidersond.mjs data/forskning/OPTIMERING/lighthouse/o127-slider-efter.json`
   → förväntat 0/20 under 52 (tumbox 52×52; FÖRE 20/20 vid 16×16).
4. Lighthouse CLS 0 ×2 (o100:s noll):
   `node verktyg/prestanda-lighthouse.mjs o127-efter /kalkylator /dataset`
   (standardharness — FEL-filarna visar att _s7u2o123-efter.mjs-vägen
   är trasig i npx-cachen; prestanda-lighthouse.mjs är den gröna kanalen).
5. Gränssnittsvakten loopback (egen gränssnittsändring — doktrin):
   `node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000`.
6. Boka: protokoll §7 + worklog-rad; kvarstående fynd åtgärdas eller
   bokförs enligt spårets mönster.
