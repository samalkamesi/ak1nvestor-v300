# o148 — BOLAGSMETADATA-KONTRAKTET: /bolag:s hårdkodade "100 bolag"-löften blir datadrivna

**Spår:** 8 (KVALITET & SÄKERHET) · **Agent:** s8-u1 (manifest auto-s8-1790006726228,
redispatch) · **Datum:** 2026-09-21 · **Status:** LEVERERAD (commit se worklog)

## 1. VAL och duplikatkontroll

Redispatchen inledde mot spårets "välj själv"-uppdrag. Duplikatkontroll före start:

- **o145 (feljakt-ledgerns hälsa)** — reservationen i protokollnummer.json bars av
  en tidigare s8-u1-inkarnation som hann LEVERERA KLART (commits 28bff354 +
  fd24a1ea, fabrikslogg 18:30 med LEVERANS-rad; slutbevis 778 fynd · 778
  bedömda · 0 öppna · 0 HÖGA · 0 VARN — maskinellt omVerifierat denna session).
  Redispatchen står därmed ÖVER o145 = duplikatskyddet verkade.
- **o146 (u3: publiceringskontraktet)** och **o147 (u2: sitemap-byggsanning)**
  — bägge levererade; båda bokför dock samma öppna kvarpost.

**VALT:** kvarposten **"'100 bolag'-metadata föråldrad"** — bokförd av OBEROENDE
två källor: o146 §7 (u3:s commit 98219b5f) och o147 §6 (u2:s commit 2d253a4e:
"Kvar §6: '100 bolag'-metadata föråldrad · prod-URL-probing-mönster").
Inget syskon claimsat ytan (u3 klart, u2 klart, u1-föregångaren klart).

## 2. Fyndet

`/bolag`-metadatin lovade i title och description (git HEAD före o148):

- title: "Bolagsregister — nyckeltal för **100 bolag i tio branscher**"
- description: "Nyckeltal för **alla 100 bolag** i AK1A:s forskningsuniversum…"

Verkligheten samma dag: **249 bolag** i **10 branscher**
(data/portfolj-system/bolagsunivers.json, maskinellt räknad). Ljuget ~2,5×.
Sekundära bärare av samma klass: vy-fallbacken `"100-bolagsuniversum"` i
bolag-sidor.tsx (detaljsidans ingress då medianRad saknas) + två lib-kommentarer
som dokumenterade "100 programmatiska nyckeltalssidor".

**FÖRE-bevis (HTTP-sond mot prod, 2026-09-21):** prod-titeln bär fortfarande
"Bolagsregister — nyckeltal för 100 bolag i tio branscher" medan universumet
är 249 — fångat i testa-bolag-metadata-kontrakt.mjs:s sondutdata.

## 3. Rotorsaka (samma klass som o146:s döda länkar)

Texten var **lösgjord från sanningen den ska spegla**: talen hårdkodades vid
våg 149 (då 100 var sant) i stället för att räknas ur den källa vyn läser.
Universumet växer med varje dataleverans (o146 dokumenterade 243→249 bara
2026-09-21) — vilket hårdkodat tal som helst glider förr eller senare.
Detta är exakt den glidningsklass o146 kurade för länkarna ("live-ytorna
lovar vad rutten levererar") — här i metadata-formen: "metadatin lovar vad
registret listar".

## 4. Kur (3 filer, src/ via Edit/Write)

1. **src/app/(huvud)/bolag/page.tsx** — `export const metadata` (hårdkodad)
   → **`generateMetadata()`** som räknar `antalBolag = SIDOR.length` och
   `antalBranscher = new Set(SIDOR.map(s => s.bransch)).size` ur SAMMA
   `publiceradeBolagSidor()`-källa som vyn (o146-kontraktet: registret listar
   publicerade). Med dagens data: "…för 249 bolag i 10 branscher".
   force-static + revalidate 86400 orörda — metadatin evalueras vid build
   och ISR-regeneration, alltid koherent med vyns props.
2. **src/components/ak1a/bolag-sidor.tsx** — fallback `"100-bolagsuniversum"`
   → `` `${lasBolagsSidor().length}-bolagsuniversum` `` (serverkomponentkedja
   verifierad: endast två server-sidor importerar vyn; ingen "use client" i
   kedjan — fs-importen stannar i Node). Filhuvudskommentaren uppdaterad.
3. **src/lib/bolags-sidor.ts** — två kommentarer talar inte längre om "100"
   (v203-lärdomen: dokumentation följer kod annars släpar den).

## 5. Bevis

- **tsc:** `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**
  (projektbinären, baslinjen håller).
- **Kontraktssvit** `verktyg/testa-bolag-metadata-kontrakt.mjs` = **13 PASS
  · 0 FAIL**: K1 metadatin datadriven (generateMetadata + inga hårdkodade
  "100 bolag"/"tio branscher" i strängliteraler — grinden strippar kommentarer
  så dokumentation FÅR citera historien) · K2 vy-fallback datadriven ·
  K3 paritet mot dagens data (universum 249 · publicerade 249 med o146-fallback
  · branscher 10; titel-mallen exakt) · K4 force-static/ISR-kontrakt orört.
- **FÖRE-facit:** svitens HTTP-sond: prod bär "100 bolag i tio branscher"
  mot kodens 249/10 — ljuget fångat på fyndminuten.
- **EFTER-kvitto (ett kommando, vid nästa gröna bygge):**
  `node verktyg/testa-bolag-metadata-kontrakt.mjs` ⇒ HTTP-sond "EFTER-GRÖN —
  prod-titeln bär dagens tal". Sonden är spökmätningsskyddad (o131/o139 §1):
  VÄNTAR-DEPLOY rapporteras som varning, ALDRIG som grönt; ALDRIG byggt av
  denna svit (prod-synken äger byggen).

## 6. KVD

tsc 0 · svit 13/0 · src endast via Write/Edit · inget bygge (prod-synkens ägo) ·
R2 orörd (priser/tier/publicering ej berörda — detta är fakta-tal i befintlig
metadata, ingen ny publiceringsyta) · data/blogg orörd · syskonytor orörda
(u2:s sitemap-byggsanning + u3:s publiceringskontrakt orörda; commit med
pathspec så inga främmande filer sveps med).

## 7. Kvarposter / köposter

- **"föråldrade 100-tal i dataset-aspekttexter"** (nyckeltal-b.ts m.fl. talar
  om "100-bolagsuniversumet" i median-sammanhang): dessa är MEDIAN-underlagens
  formuleringar och rör u2/o147:s nylevererade livskontraksyta — lämnas åt
  det spåret; INTE samma klass som metadata-löftet (de beskriver beräknings-
  underlag, inte registrets innehåll).
- **EFTER-deploy-kvittering** o146 + o147 + o148 tillsammans: sond + livskontrakt
  + denna svit ⇒ alla gröna på samma bygge.
