# O139 — Spår 7: CV-WIDGET — verktygssidornas monster-layout kurad (/superanalys + /kalkylator) + giltig LH-baslinje för 5 verktygssidor

**Spår:** 7 — PRESTANDA & MOBILPOLISH · **Roll:** byggare 2/3 (manifest
auto-s7-1789968917148) · **Datum:** 2026-09-21 07:45–08:3x lokal ·
**Reservation:** o139 (data/vakten/protokollnummer.json) · **Anspråk disk-först:**
data/vakten/s7-o139-tbt-superanalys-u2-ansprak-2026-09-21.md (07:45 lokal, FÖRE all mätning).

## §0 — Objektval och duplikatkontroll

Fabriksuppdrag: "Prestandavåg nästa i spåret (välj själv): mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd." Syskonens anspråk lästa
FÖRE val: u1 (o137) = äkta deploy-EFTER av läsbarhetskurer · u3 (o138) =
o129 §6-§7 blogg-EFTER. Spårets klassiker STÄNGDA: bildoptimering (o66
§7.2/o101) · cache-headers (o10/o13/o66/o70) · koddelning (o27/o119/o121)
· 52 px-läsbarhet (o8×4 + o123). **Valt gap:** o123 lämnade OGILTIGA
Lighthouse-mätningar för /superanalys + /kalkylator (FEL-filerna — deras
eget verktygs hårdkodade chrome-launcher-import; kanoniska prestanda-
lighthouse.mjs fungerar) och dess n=1-tal (superanalys TBT 1 276 ms!)
var obevisliga — ingen baslinje fanns för någon verktygssida. Vågen:
giltig baslinje + rotjakt + kur.

## §1 — Läge och kanal

Serverande bygg saMxYAzLaPfd23cJkKKAI (05:29:36Z; räddningsbygget efter
bygg-OOM-serien — o138:s kronika). KANALBEVIS (lighthouse/kanalbevis-
s7u2o139-fore.json): kurens CSS-signaturer bevisade i serverande chunk
2nfdpgrzmuor8.css (o126 min-width:52px! ×2 · o127 .flex>*,.grid>* ·
o128 size-[52px] + width:52px;height:52px ×2) · kur-commits 96bd416b/
c017f9bf/54c95abd/87483e9a/2e6efd22 alla förfäder till HEAD 1ea8ccb8 ·
prod 200 + localhost 200 ×6. Syskonens Chrome-sonder inväntades (u1/u3
mätte 07:42–08:00; u3:s övergivna idle-chrome på port 9349 lämnad orörd).

## §2 — Giltig FÖRE-baslinje (o123:s eftersläpning läkt)

Lighthouse mobil (4G-sim, n=1, cache-disabled, verktyg/prestanda-lighthouse.mjs
— o139-fore-sammanfattning.json + 5 fulla rapporter):

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| /superanalys | 73 | 4 355 | 375 | 0 |
| **/kalkylator** | **64** | **4 812** | **582** | 0 |
| /konfluens | 76 | 4 168 | 336 | 0 |
| /dataset | 74 | 4 316 | 372 | 0 |
| /netnet | 77 | 4 334 | 321 | 0 |

**Dom:** superanalens o123-värde 1 276 ms var MÄTBRUS (o123 mätte mitt i
gårdagens deploy-störningar) — sidan ligger i linje med syskonen. Den
verkliga anomalien är **/kalkylator: TBT 582 ms = +66 % över syskonsnittet
351, sämsta LCP (4 812) och poäng (64)**. Konfluens/netnet/dataset fick
sina första LH-mätningar NÅGONSIN (referensbasen).

## §3 — Rotjakt (longtask-CDP, 4×-drossel, o118-sonden)

- Payload utesluten: kalkylator 1 039 KB klient-JS (20 chunkar, +123 KB
  utöver konfluens-basen) men superanalys bara 933 KB (+17 KB) — TBT-
  skillnaden följer ej JS-vikten; basal-bördan ~900 KB gemensam.
- Longtaskprofil (longtasksond-o139-fore/-ref.json): /kalkylator bär EN
  **monster-layout i hydratiserings-committen: longtask 681 ms varav
  Layout 504 + UpdateLayoutTree 136** — 551 ms efter FCP (i TBT-fönstret).
  Layout-totaler: kalkylator 593+235 · superanalys 576+65 · konfluens
  264+85 · dataset 299+65 (ms) — de två förra har ~2× layout-arbete.
- DOM-antal utesluter (superanalys 241 element med näst högst layout).
- A/B differentiell (SOND_INJECT_CSS): demo-strip dold = ingen ändring
  (1 475 ms fönster — demo-stripen ej rotorn).
- Geometri (verktyg/_s7u2o139-geometri.mjs, 412×823): kalkylatorns
  widget-container **top 2 412 · höjd 4 361 px** (helt under vecket,
  158 barn, 20 sliders + 21 inputs) — superanalens top 411 · 638 px.

## §4 — Kuren (committad): content-visibility på widget-containern

| Fil | Ändring |
|---|---|
| `src/app/globals.css` | `.cv-widget-super` / `.cv-widget-kalk` — `content-visibility:auto` + `contain-intrinsic-size:auto 40rem/272.5rem` (sondade sluthöjder 638/4 361 px — o78/o92-disciplinen "reservation ≈ mätt höjd"), enbart mobil ≤640 px (o123:s avgränsning; dator orörd) |
| `src/app/(huvud)/superanalys/page.tsx` | widget-diven `mt-10` → `mt-10 cv-widget-super` |
| `src/app/(huvud)/kalkylator/page.tsx` | widget-diven `mt-10` → `mt-10 cv-widget-kalk` |

Mekanik: webbläsaren hoppar över layout/rendering av offscreen-innehåll
tills scrollen närmar sig — monster-layouten vid hydratisering försvinner
ur TBT-fönstret för första besökare (mobil = kundens telefon-först).

## §5 — Bevis

**A/B (identisk kanal, SOND_INJECT_CSS):** /superanalys fönster-TBT
1 568→776 ms (−51 %), longtasks 24→12, Layout 576→278. /kalkylator med
demo-cv också: ingen ytterligare vinst (1 461) — demon lämnad orörd.

**Parad A/B /kalkylator (o139-par-kontroll/-kur, back-to-back i samma
lastläge load≈2,9 — eliminerar lastbruset):**

| | tasks | fönster-TBT | Layout |
|---|---|---|---|
| kontroll | 28 | 1 708 ms | **1 213 ms** |
| kur | 23 | 1 437 ms | **227 ms (−81 %)** |

**Proxy-EFTER:** superanalys med kurvärde 40rem: Layout 445, tasks 18
(FunctionCall-brus 342→753 mellan körningar dokumenterat — Layout är den
stabila signatur; sondens absoluttal är lastkänsliga, LH-EFTER är det
kanoniska måttet). Kvarvarande TBT-drivare efter kur: framework-eval
(FunctionCall 2feezv ~600-1 100 ms) = basal-bördan, koddelningsspåret
STÄNGT (o27/o119/o121) — utanför denna vågs räckvidd, bokförs.

## §6 — KVD

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** · INGET
  bygge/installation (prod-synken äger — deploy sker vid dess nästa
  RAM-fönster; grunden för OOM-serien är drift/konfig-ägandes).
- src/ ENDAST via Write/Edit · R2 orörd · data/blogg/ orörd · syskonens
  filer/verktyg orörda (deras sonder KÖRDES endast) · orphan-chrome
  (port 9349) lämnad ifred.
- Resterande o123-FEL-filer lämnade kvar som historik (deras innehåll
  refereras i §0).

## §7 — EFTER-kriterier (vakarövertag när prod-synken deployat o139-avkomma)

1. Deploy-bevis: DEPLOYAD-rad i data/vakten/prod-synk.log med denna commit
   som förfader + prod 200 ×2 på /superanalys + /kalkylator.
2. **Lighthouse-EFTER (kanoniskt):** `node verktyg/prestanda-lighthouse.mjs
   o139-efter /superanalys /kalkylator` — dom: TBT /kalkylator ≤ ~450
   (fönster-vinsten flyttar monster-layouten ut), /superanalens poäng
   oförändrad ±, **CLS 0 ×2 (o100-nivån helig — content-visibility får
   ej skapa skift)**, LCP ±15 % (doktrinen).
3. Skroll-CLS-kontroll: verktyg/_s7u2o139-geometri.mjs visar platshållar-
   höjderna; vid ev. CLS > 0 i steg 2: höj intrinsic-värdena mot sondade
   sluthöjder (40/272.5rem) — aldrig bredare regel.
4. Gränssnittsvakten 0 fynd (egen gränsnittsändring — doktrinen).
5. Bokför i detta protokolls §8 + worklog.

## §8 — EFTER-facit (fylls av vakarövertag)

(väntar deploy)

## LEVERANS (denna commit)

globals.css (cv-widget-kur) · superanalys/page.tsx · kalkylator/page.tsx ·
o139-protokollet (denna fil) · verktyg/_s7u2o139-geometri.mjs · 5 LH-FÖRE-
rapporter + sammanfattning · 9 longtask-/A/B-/par-JSON + geometri-JSON +
kanalbevis-JSON · anspråksfilen · protokollnummersreservationen · worklog-rad.
