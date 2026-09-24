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

### Påbörjat 2026-09-21 14:4x–15:0x lokal — s7-u3 (manifest auto-s7-1790001325956): deploy spärrad, rot orsak kurad, verkställande förberett

**Status: INTE SLUTFÖRT — deploy av e27ef394 hade ej skett vid vågslut;
mätning är spökmätningsskyddad tills kanalbevis finns.** Kronologi:

1. **Deploy-läge vid vågstart (14:35Z):** senaste DEPLOYAD 02:12:24Z
   d401d719 — FÖRE kurcommitten e27ef394 (08:28 lokal). Tre efterföljande
   byggförsök (08:20/08:30/08:40Z) OOM-dödade; .next = läkebackup utan
   kurens CSS (grep "cv-widget" i .next/static/chunks/*.css = 0 — därför
   mättes INTE: spökmät-skyddet, o139 §1:s kanalbevisdisciplin).
2. **Rot orsak 1 — orphan-chrome, KURAD:** PID 139018 (headless Chrome,
   --remote-debugging-port=9349) = u1/u3:s övergivna mätsond från 07:42
   (o139 §1 nämner den "lämnad orörd"). Vid vågstart 9 h gammal, PPID=1
   (orphan, ägandesession död), NOLL TCP-anslutningar på 9349 — men
   prod-synkens RAM-vakt räknade den som "chrome-cron levande (+1024 MB
   reserv)". Städad 14:46Z (kill → verifierat 0 chrome-processer,
   +~1 GB låströskel). Detta var NÖDVÄNDIGT men EJ TILLRÄCKLIGT:
3. **Rot orsak 2 — fabrikens egen omgång (struktur, ej fel):** med 2–3
   parallella zcode-barn (~0,85 GB/st) kräver prod-synken 2200+1700 =
   3900 MB tillgängligt; 14:47:25Z-pollen: 3069 MB ⇒ VÄNTAR-RAM kvar.
   Deploy av e27ef394 kan ske först när omgången (start 14:35Z) avslutar
   + nästa poll (var 10:e min) + ~7 min bygg ⇒ tidigast ~15:1xZ.
4. **Verkställande redo (exakt, för nästa fönster):**
   - bekräfta `DEPLOYAD` i data/vakten/prod-synk.log med e27ef394 som
     förfader (`git merge-base --is-ancestor e27ef394 <deployad-hash>`);
   - kanalbevis: `grep -l "cv-widget" .next/static/chunks/*.css` + curl
     prod-CSS innehåller `.cv-widget-super`/`.cv-widget-kalk`;
   - `node verktyg/prestanda-lighthouse.mjs o139-efter /superanalys
     /kalkylator` (dom enligt §7: CLS 0 ×2, TBT /kalkylator ≤ ~450,
     LCP ±15 %, poäng ±) + `LH_JAMFOR=o139-fore`;
   - gränssnittsvakten `--bas=http://localhost:3000` 0 fynd;
   - fyll facit ovan + worklog. Anspråk:
     data/vakten/s7-o139-vakarotag-efter-u3-ansprak-2026-09-21.md.

**Levererat denna våg:** bygglås-diagnostik + orphan-chrome-kur (prod-
synkens spärr "+1024 chrome-cron" borta) + detta facit-underlag. §7:s
mätdom SLUTSTÄNGS av nästa fönster ovan.

*Tillägg 14:58Z:* 14:57-pollen: krav 6624 MB (NY chrome + syskonens
AKTIVA sond — PID 468441 ägd av zcode-cli 451104, pågående syskonarbete,
FÅR EJ städas) + 4 zcode-barn, tillgängligt 1114 — deploy sker när
omgången + syskonens sonder avslutat; RAM-vakten sköter det autonomt.
Ingen ytterligare kur från denna vågs sida: låset är korrekt beteende
(OOM-lärdomarna), ej fel.


### DEL 2 — s7-u2 (samma manifest, anspråk 14:40Z): instrument levererade, deploy fortfarande spärrad vid vågslut — slutstängning = 5-minutersjobb nästa fönster

Kronologi 14:40–15:5xZ: u3:s DEL 1 läst + arvet accepterat (u2:s anspråksfil
på disk, uppdaterad 15:0x). Deploy-jakten: 15:07:25Z "bygger NU" (V235-tak
100 min passerat) → **15:14:24Z bygg OOM-dödat** (läkebackup serverar;
andra OOM-ronden på dygnet) → 15:17:26Z nytt V235-spär (0/30) → 15:27 (9/30)
· 15:37 (19/30) · **15:47:26Z VÄNTAR-RAM 3540 < 3900** (2 klassade
zcode-barn: u2 + fabrikens u2-försök-2-linje 15:15Z, samt kundens studio-
session "zcode app-server" 15:41Z med egen zcode-familj ~2,2 GB — orörbar)
→ tidigaste verkställande = 15:57-pollen ENDAST om RAM ≥ tak när fabrikens
barn avslutat, dvs först efter detta vågslut. Deployen är STRUKTURELLT
låst bakom fabrikens parallellism + kundsessionen: korrekt beteende
(OOM-lärdomarna + V235), ingen kur möjlig eller önskvärd från agentplanet.

**Levererat (committat):** HELA mätpipelinen — `verktyg/_s7u2o139efter-kor.mjs`
(6-stegs körare: DEPLOYAD-parsring + merge-base e27ef394-kontroll
(spökmätningsskydd) → prod 200 ×2 → CSS-kanalbevis → ISR-värmning ×3 →
Lighthouse-EFTER med LH_JAMFOR=o139-fore → geometri+skroll-CLS → maskinell
dom mot §7.2-kriterierna) · `verktyg/_s7u2o139efter-geometri.mjs` (sond-kopia
PORT 9363 + egen utfil, o139:s original orört; UTÖKAD med §7.3 skroll-CLS =
layout-shift-observer under kontrollerad bottenrullning). Körning:
`node verktyg/_s7u2o139efter-kor.mjs` — exit 0 = dom GRÖN; JSON landar i
lighthouse/ (kanalbevis-s7u2o139efter.json + dom-s7u2o139efter.json).
Därefter endast: vakten riktad (--bas=http://localhost:3000 --snabb
--sidor=/superanalys,/kalkylator) + §8-tal + worklog.

### DEL 3 — SLUTFACIT 2026-09-21 23:1xZ (s7-u1, byggare 1/3, nytt manifest; stegen körda autonomt av verkställaren _s7u2o144 17:52–17:56Z)

§7-kriterierna dömda ur verkställarens JSON-utfilar + färskt kanalbevis
(o144 §3-§5 = detaljboken):

1. **Deploy-bevis ✓:** 17:52:11Z DEPLOYAD 27a582a0 (136 commits,
   e27ef394 förfader JA) + prod 200 ×2 — och kuren kanalbevisad VIDARE
   på 22:28:54Z-trädet 496466f6 (merge-base SANT, cv-widget-CSS i
   435i0cybhscm5.css, 200 ×6).
2. **LH-EFTER:** CLS 0 ×2 UPPFYLLD (o100-nivån helig) · LCP +5,2 % /
   −1,1 % (±15 % UPPFYLLD ×2) · poäng 73→57 / 64→56 = lastfönster
   (dag vs nattbas) · **TBT ≤ ~450: ej bedömbart i dagfönster** —
   1 312 dagmätt mot nattmätt 582-bas; metrologiregeln (o143 §3:
   ~6,5× dag/natt) ⇒ kräver nattmätning. Kurens evidens bär A/B-
   parbevisen i §5 (−51 % fönster-TBT · −81 % Layout). Köpost: natt-LH
   om TBT-spåret öppnas igen.
3. **Skroll-CLS 0 ×2 ✓** under bottenrullning; platshållarna bär
   (widget 4 360 px på kalkylatorn) — ingen intrinsic-justering behövdes.
4. Gränssnittsvakten: cron-kadansen (RAM-disciplin, o144 §10).
5. Bokförd här + i o144 §3-§6 + worklog. **SLUTSTÄNGD med
   metrologifotnot** (TBT-villkoret omnämt till nattmätning).

## LEVERANS (denna commit)

globals.css (cv-widget-kur) · superanalys/page.tsx · kalkylator/page.tsx ·
o139-protokollet (denna fil) · verktyg/_s7u2o139-geometri.mjs · 5 LH-FÖRE-
rapporter + sammanfattning · 9 longtask-/A/B-/par-JSON + geometri-JSON +
kanalbevis-JSON · anspråksfilen · protokollnummersreservationen · worklog-rad.
