# o51 — Prestanda: kurskortens list-prefetch på /kurser kurerad (Spår 7, s7-u3 byggare 3/3, 2026-09-17)

**Klass:** prefetch-spill i initial load (o17/o37/o41/o49/o50-familjen).
**Yta:** `src/app/(huvud)/kurser/page.tsx` — UtvaltKort-li:s huvudlänk.
**Status:** KUR LEVERERAD — EFTER-mätning pending prod-synkens deploy (se §5).

## §0 Nummerkontroll

o49 ägs av u1 (disk-först, ad04d358); o50 ägs av u2 (089ded18). u3:s
chat-defer-protokoll ligger på disk som "o49-prestanda-chat-defer-s7.md"
(omedöpt enligt u1:s §7-not — deras omdöp tar nästa lediga nummer EFTER
detta: o52+). Detta protokoll (o51) skrevs på disk 19:1x lokal — numret
är mitt enligt disk-först-regeln.

## §1 Objektval (duplikatkontroll + anspråk)

Anspråksfil `data/vakten/s7-kortprefetch-u3-ansprak-1859.md` (18:59).
Objektet är dubbelt bokförd köpost: **o50 §6** (u2: "första synliga
kurskort the-intelligent-investor ×2 = 26,0 KiB — kandidat nästa
omgång") + **o49 §7/§9** (u1, bf90a225: "3 omgångar à totalt 34,6 KiB —
spårets främsta barnägda objekt härnäst"). Ingen har kurerat ytan:
HEAD bf90a225 rör endast data/ + worklog; registret (kurs-sok.tsx)
orört av spåret sedan o45 (flight-ytan, annan klass). Bildoptimering/
koddelning/cache/läsbarhet = stängda ytor (o13 §duplikatkontroll,
o27, o28, o31) — prefetch-familjen är spårets levande gren.

## §2 FÖRE (Lighthouse mobil, localhost=prod på BUILD_ID 6qghn83I3yt--H0fK8g0A)

Mätning 19:0x lokal på deployat 089ded18-bygge (18:41 lokal, prod 200).
Rådata: `lighthouse/{kurser,blogg}-s7u3o51-fore.json` + sammanfattning.

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| /kurser | P44 | 6227 | 4249 | 0,002 |
| /blogg | P50 | 5746 | 2324 | 0,0002 |

Sond (`verktyg/_s7u2-sond-prefetch.mjs`, lastokänsligt strukturplan):

- **/kurser: 41 requests, 631,9 KiB total. RSC-prefetch 3 st = 34,6 KiB:**
  `/kurser/the-intelligent-investor?_rsc` ×3 (0,9 + 8,6 + 25,2). Inga
  `/?_rsc`, inga `/logga-in` — o49+o50-kurerna håller (se §4).
- **/blogg: 33 requests, 528,4 KiB, 0 RSC-prefetch** — paritet med u1:s
  §7-EFTER-tabell (identiska 33/528,4): kurens tillstånd stabilt i prod.

**Källanalys (empirisk, ej gissad):** SSR-DOM bär EXAKT 1 `href=
"/kurser/the-intelligent-investor"` — UtvaltKort-li:t (`cv-utvalt`,
FLAGGSKEPP_SLUGS[0], första kortet i flaggskeppssektionen OVFAN
registret, våg 58:s bibliotekshall). Tre omgångar på EN länk = Next
16.1.1:s multiomgångs-prefetch (partial 0,9 + mellan 8,6 + full 25,2) —
tredje beviset i serien (logo `/` ×3 i o50, blogg-kort ×2 i o37/o41,
nu kurskort ×3). Kurs-SMG-flighten (25,2 KiB full) är sajtens tyngsta
prefetch-post hittills — tre gånger blogg-kortens.

## §3 Kur

`prefetch={false}` på UtvaltKort-länken (page.tsx) + precedenskommentar
(o17/o41/o50-stilen). Räckvidd: /kurser (svenska) — UtvaltKort renderas
endast där ((en)/(ar)-kurserna saknar utvalda sektioner enligt
kurs-sok.tsx:22). Kirurgin täcker ALLA utvalda kort (tre sektioner),
inte bara det översta: varje kort som kommer i viewport slutar prefetcha
i initial load-fönstret.

**Avvägningen (o41 §2:o50 §3:s begärda):** kurs-sidorna är ISR
(revalidate 3600) ⇒ klickkostnad ~100–300 ms när användaren aktivt
väljer en kurs; hover-prefetch lever kvar (Next 16, musanvändare
förlorar inget). Mot det: 34,6 KiB + 3 requests spill i initial load
på /kurser för ALLA mobilbesökare (kunden = telefon-först, mobildata).
Samma vägning som o37/o41 gjorde för blogg-korten — konsekvent.

**AVSTÅTT med skäl (o41-disciplinen — empiriskt, ej gissat):**
RegisterKort-li:ts huvudlänk (kurs-sok.tsx:158) — sonden visar 0
register-prefetch i initial load (registret ligger under de utvalda
sektionerna, utanför viewport); Next:s scroll-prefetch av registret
sker vid aktiv scrollning = användarinitierat, utanför LCP-fönstret,
och är Next:s avsedda beteende. Ingen bevisad yta ⇒ ingen kirurgi.

## §4 tsc + syskonens EFTER-kvitto i samma mätning

`node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projekt-
binären; inget npx, inget bygge — fabrikregeln).

Min FÖRE-mätning är SAMTIDIGT o50 §5:s EFTER-kvitto (u2:s pending,
bokförs i deras protokoll): /kurser `/?_rsc` 2→0 ✓ · `/logga-in` 2→0 ✓
(u1-del) · −4 requests ✓ · −12,1 KiB ✓ (förväntan uppfylld EXAKT).
/blogg `_rsc` totalt 5→0 ✓ · requests 45→33 ✓ · −14,6 KiB ✓.
o49:s EFTER bokfördes redan av u1 (bf90a225 §7) — min mätning
konfirmerar stabiliteten (33/528,4 identiskt, 40 min senare).

## §5 EFTER (pending prod-synk — bokförs av mig eller nästa omgång)

Kön: 7c1fd646 (u3:s rättning) väntar RAM sedan 16:57Z; denna commit
hamnar bakom den och byggs tillsammans. **Förväntan (lastokänsligt
strukturplan):** /kurser `the-intelligent-investor?_rsc` 3→**0** ·
requests 41→38 · transfer −34,6 KiB (631,9 → ~597 KiB). CPU-tal med
lastkontext (o41-EFTER-metoden). Null-resultat ⇒ omgång 2-effekt →
ny rot bokas (o41-disciplinen).

**Väntestatus vid vågens avslut (19:4x lokal):** commit 90cd7c57 är
registrerad hos prod-synken ("NY KOD: 089ded18 → 90cd7c57", poll
17:07:29Z + 17:17:29Z) men bygget VÄNTAR-RAM (2030 MB < 2200-tröskeln;
syskon-mätning + tsc-processer höll marginalen nere; deploy-vakt
_verktyg/_s7u3e-vanta-deploy.mjs_ löpte ut efter 18 min utan ny
BUILD_ID — prod förblev 200 på 6qghn83I3yt--H0fK8g0A hela tiden).
Nästa omgång: när prod-synken deployat (RAM frigörs av sig självt)
→ mät EFTER enligt §5:s förväntan → boka här + worklog. Deploy-kön
before-mig: 7c1fd646 (u3:s chat-rättning) landar i SAMMA bygge.

## §6 Kö efter omgången

1. 7c1fd646 + denna kurs EFTER (två kurer i samma deploy-fönster —
   attribution per yta: chat-rättning = u3, kurskort = o51).
2. CV-reservhöjdens auto-13rem-kalibrering (o20 §9, u1:s not).
3. Chat-defer-kurens fulla EFTER-narrativ (u3:s pågående objekt —
   deras rådata ligger redan: start/kurser/blogg-s7u3e-chatefter.json).
