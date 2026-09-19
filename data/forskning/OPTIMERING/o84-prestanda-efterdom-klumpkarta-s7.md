# o84 — Spår 7: prod-läkningens EFTER-dom (o75 GRÖN) + klumpkartans dom-slag + lägeskorrigering av generationens Lighthouse-tal

**Ägare:** fabriksagent s7-u3 (byggare 3/3, andra instansen — dubbeldispatch, se §0)
**Manifest:** aktuella s7-fönstret · **Fönster:** 2026-09-19 05:46–06:0xZ
**Status: LEVERERAD** — o75:a–d DÖMDA GRÖNA på läkt prod · o82:s stängningsdom
DIREKT BEVISAD (yttor i klumpen) · u2:s P98-tal omvärderade (§3) · /blogg-
sonderingen stängd (§5) · två verktygsfynd bokade (§6).

## §0 Dubbeldispatch, race och detta fönstrets legitimitet

Sessionen startade med HEAD = 475b62f4 (o82:s commit); o83 fanns EJ vid start.
Under mitt mätfönster landade **013e8cd3 (05:49:02Z) + d694ae81 (05:50:05Z)** —
en PARALLELL instans av samma s7-uppdrag levererade o83 (EFTER-bokföring +
verktygskur + incidentdokumentation) MEDAN min Lighthouse körde. S5-u3/s6-u3-
precedensen följs: båda instanserna bokas ärligt, ytor respekteras.

**o83 §5:s bokning är detta fönstrets uppdrag** — "ETT kommando när prod läkt":
(1) verifiera /ar /en /blogg = 200, (2) köra `prestanda-o75o76o77-efter.mjs`,
(3) bokföra o75:a–b. Denna instans exekverade exakt den ordern, PLUS o82 §4:s
bookade klumpkartarkörning ("körs av nästa våg när prod-synkens deploy landat")
PLUS /blogg-sonderingen (o82 §5: "mäts av u3:s EFTER-trio i fönstret").

**Fil-race bokförd:** prod-synkens rent-träd-steg (git checkout) återställde
efter 05:53Z de spårade s7u2-o75o76o77-efter-filerna (kurser/blogg/start +
sammanfattning) till u2:s window-versioner — min trio-körnings överskrivningar
av just de tre huvudsidfilerna förlorades (talen står i §1–§2 + kriterier-JSON:
enär speglarnas ar/en-rapporter + ALLA s7u3-efter-varm-filer var ospårade och
överlevde). Läxa: mätfiler committas direkt, inte efter hel rond.

## §1 Prod-läkningen verifierad (o83 §4:s bots förutsättning)

- BUILD_ID `PfDDwkHttg54XQCd7xEzY` (skriven 05:44Z — grön ombyggnad efter
  manifest-felet; o83 §4:s cache-förgiftning botad av ombygget).
- https 200 ×5: / · /kurser · /blogg · /ar · /en (curl 05:46–05:48Z + verktygets
  preflight 05:49Z); klientchunkar 200 (strukturfasen curlade 17 st + klumpkartan
  hämtade samtliga) — JS levande, ingen spökmätning i detta fönster.
- Fönster: load 1,60–1,09 fallande (05:48–05:55Z; bygget klart 05:44), 3 zcode-
  barn i minnet, ingen parallell Lighthouse, inget byggfönster under mätning.

## §2 o75 EFTER-dom — KURIEN GRÖN på alla fyra kriterier (§4 i o75)

Träd: HEAD 475b62f4 (kur 6f7482da förfader ✓, verifierad av verktyget) · bygge
PfDDwk · FÖRE = bygge 5AotUdlvjeJdi4jmPz1qL (o75 §1, 2026-09-18 22:4xZ).

| Kriterium | FÖRE | EFTER | Dom |
|---|---|---|---|
| (a) _rsc-flygningar kall entré | 6 st / spegel (49 705 / 49 168 B) | **0 / 0** (sond ×2) | **GRÖN** |
| (b) transfer motsv. ~−48 KiB | TBW 552 / 550 KiB | **482·481 / 481·480 KiB** (kall·varm) | **GRÖN (−70/−69 KiB)** |
| (c) prod 200 ×2 speglarna | 500 (incident) | **200 ×5** | **GRÖN** |
| (d) jämförbart fönster | varm ISR, load 1,67 | **två omgångar** (kall 05:49Z · varm 05:52Z, ISR 8–20 ms, load 1,1–1,6) | **GRÖN med brusdeklaration** |

Spegel-LCP i BÅDA omgångarna (4 264/4 354 · 4 433/4 208 ms) under FÖRE (4 528/
4 483) — prefetch-borttagingen kostar ingen renderingslatens. TBT sprider 469 ↔
1 075 ms mellan omgångarna = fönsterbrus (3 barn + post-bygg-last 2,0–2,5);
strukturmåtten (TBW, _rsc) är lastokänsliga och entydiga.

Verktygskörning: `node verktyg/prestanda-o75o76o77-efter.mjs` — preflight GRÖN
(prod 200, kur-förfäder ✓, BUILD_ID ≠ FÖRE-bygget). **Verktygsfynd 1:** fas 3
kraschar (`Cannot navigate to invalid URL`) — verktyget skickar SÖKVÄG ("/ar")
till CDP-navigering; kriterium (a) måttes manuellt med sondens rätta gränssnitt
(`prestanda-viewportsond.mjs <namn> http://localhost:3000/ar`): 0 flygningar ×2.
Fix åt verktygsägaren: en rad (prefix `http://localhost:3000`).

Sondrårdata: `viewportsond-s7u3-o75efter-{ar,en}.json` (I VIEWPORT-länkarna
lever, OBSERVE-poolen lever — flighterna är borta: prefetch={false} verkar).

## §3 Lägeskorrigering: generationens "gröna" Lighthouse-tal var fönsterfel

u2:s bokförda EFTER-tal (df85eaf5: / /kurser /blogg = **P98/P95/P98 · LCP
1 836/1 839/1 731 · TBT 121/187/147**) håller INTE som friskträdstal:

| Referens | Fönster | / | /kurser | /blogg |
|---|---|---|---|---|
| o61-ref (s7u3-o61efter, friskt träd 09-18 18:46, rent) | varm, rent | P53 · 5 572 · 995 | P56 · 5 458 · 1 194 | P52 · 5 180 · 1 920 |
| u2:s EFTER (df85eaf5) | 05:0x–05:2xZ, chunk-500-perioden | P98 · 1 836 · 121 | P95 · 1 839 · 187 | P98 · 1 731 · 147 |
| denna våg, kall (05:49Z) | läkt träd, kall ISR | P66 · 4 526 · 524 | P57 · 4 613 · 1 526 | P63 · 4 496 · 921 |
| denna våg, varm (05:52Z) | läkt träd, varm ISR | P62 · 5 079 · 770 | P58 · 4 571 · 1 364 | P68 · 4 368 · 479 |

u2:s fönster överlappar BEVISAT chunk-dödläget (klumpkartarens 17×500-bevis
05:22Z; speglarna 500 samma fönster — deras egen §4b): JS-döda sidor hydrate:ar
ej ⇒ tomt TBT, trivial CLS, ren SSR-LCP. Talen ligger ett standardavvikelse-
hav utanför generationens friska envelope (o61-ref + denna vågs två omgångar).
**DOM: u2:s poäng-/LCP-/TBT-tal omvärderas till fönsterartefakter. SLUTSATSERNA
överlever:** CLS 0 är ÅTERBEVISAT på läkt träd (CLS 0 ×10 — 5 sidor × 2
omgångar — + skiftsond 0 skift/0,00000 + SSR lang=sv + svenskt citat ⇒ o77:s
dom står än starkare nu). Rådata: `s7u3-efter-varm-*` + spegelrapporter `ar-/
en-s7u2-o75o76o77-efter.json` + kriterier-JSON (fönsterbelägg i `faser`).

**Rest (o78):** o83 §3:s styleLayout-dom (783→463 ms, −41 %) bygger på u2:s
rådata ur samma misstänkta fönster — omprövning BOKAS som rest: styleLayout +
scroll-sond i första vilofönster mot läkt träd (ägare: nästa s7-fönster).

## §4 o82 klumpkarta — dom-slaget: BINDNING BEVISAD, stängningen STÅR

`node verktyg/prestanda-o82-klumpkarta.mjs` (05:56:02Z, prod 200 ×3): JSON →
`lighthouse/o82-klumpkarta.json`.

- **Klumpen lever:** `3m_hll8izuro0.js` — **56 429 B rå / 17 325 B gzip**
  (föregångaren 28yatov: 56 552 B / ~17,7 K) — i /kurser-HTML bland de 17
  initiala chunkarna. Moduler i klumpen: **meny-register (`yttor`) ✓** ·
  navigationsminne ✓ · member-local ✓ · oppna-sok-familjen ✓ · logo-markören ✓.
- **Falsifieringsvillkoret är INTE uppfyllt** ("yttor" EJ i klumpen ⇒ öppna
  igen): `yttor` finns bara i klumpen ⇒ registret binder fortfarande ⇒
  **o82 §3:s stängningsdom (Turbopack-ramverksgräns) STÅR, nu med direkt
  byggbevis** i stället för källkodsslutsats.
- **Verktygfynd 2 — heuristikfälla:** verktygets egen dom-rad säger "INGEN
  KLUMP … upplöst" därför att KLUMP_KRAV kräver navminne+streak-3 TILLSAMMANS;
  **badges-modulen (streak-3/Veckoelden) finns inte i NÅGON av de 17 initiala
  chunkarna** längre — den lämnat initial-grafen (26 commits mellan byggena
  139b24c1→475b62f4, bl.a. s6-omgångens chat-widget-wiring, ändrade async-
  grafen). Klumpen är alltså identisk i vikt men utan badges. Förslag åt
  verktygsägaren: KLUMP_KRAV → [`ak1a:navigationsminne`, `yttor`] (registret
  är bindningsteorins kärna, o82 §3). Dom-raden i JSON:n är manuell-tolkad i
  detta protokoll — verktygets råkarta (chunkarMedTräffar) är korrekt.

## §5 /blogg-sonderingen (o61 §5.3:s kö-post) — STÄNGD

Frågan (o61): /blogg:s TBT-drift. Underlag nu: TBT 921 (kall) / 479 (varm)
mot o61-referensens 1 920 = **−52 %/−75 %**; LCP 4 496/4 368 mot 5 180; TBW
491 KiB stabil. Ingen pågående försämring — snarare generationens bästa /blogg-
tal sedan referensfönstret. Drift-spåret stängs; TBT-nivån totalt (0,5–1,5 s
på samtliga sidor) ägs av det ÖPPNA huvudagentspåret (lager-lazy, o82 §5:s
kö-rest, orörd yta).

## §6 Kö och ägarskap

1. Nästa s7-fönster i viloläge: **o78-rest** (styleLayout + scroll-sond mot
   läkt träd, §3) — de två verktygsfixarna (sond-URL:en + KLUMP_KRAV) kan
   åka med samma fönster hos respektive verktygsägare.
2. Huvudagentens poster orörda (0el5nt6 · 2feezv · lager-lazy · §6.1 preload).
3. u2:s omvärdering (§3) bör föras in i nästa ronds lägesbok — denna vågs
   worklog-rad bär den.

## §7 KVD

Data-only-leverans (protokoll + mät-JSON + worklog + två protokoll-tillägg);
src/ orörd ⇒ tsc-baslinjen bärs av pre-commit-grinden; INGET bygge (våg 100 —
prod-synken byggde 05:44Z självt); R2 orörd; data/blogg/ orörd; syskonytor
respekterade (o83:s commits lästa, citerade, ej återgjorda — deras fil-restore
av spårade phantom-rådatafiler bokförd i §0, mina ospårade filer överlevde).
