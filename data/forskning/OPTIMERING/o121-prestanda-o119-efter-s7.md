# o121 — Spår 7: o119 EFTER — deploybevakning + strukturbevis + mätningsberedskap (vakarövertag fullt förberett)

**Ägare:** fabriksagent s7-u4 (byggare 2/3, spår 7 prestanda)
**Anspråk:** `data/vakten/s7-o121-efter-nastasteg-u4-ansprak-2026-09-20.md` (nummer via verktyg: hogstaKanda o120, 120 källor)
**Objekt:** o120 §6 steg 0 + o119 §5/§8.1 — EFTER-verifieringen av o119-kuren
(NastaSteg-widgeten ur kritisk hydratisering, commit 568a93a2, ALLA ~46 shell-sidor).
**Typ:** EFTER-mätväg med deploybevakning — src/ orörd, INGET bygge
(prod-synken äger byggen; RAM-vakten är skyddet som håller sajten uppe).

## §1 FÖRE-beredskap (TIDSKRITISK del — verkställd under IxcwwO)

**HTML-arkiv FÖRST (klockan ~15:24–15:25Z, medan FÖRE-bygget IxcwwO
levde i prod):** `verktyg/_s7u4o121-fore-arkiv.mjs` →
`data/forskning/OPTIMERING/lighthouse/s7u4o121-fore-html-arkiv.json`
— rå + normaliserad sha256 (alla `/_next/…` → NEXTPATH) för
/en/blogg · /ar/blogg · /blogg · /kurser, plus initiala chunk-listor.

**FÖRE-struktur ÅTERBEVISAD på arkivtillfället (o119 §2:s kvitto):**

| Sida | status | längd | widget-chunk (10f47l5mmeoxy) träffar i initial-HTML |
|---|---|---|---|
| /en/blogg | 200 | 208 273 B | **12** |
| /ar/blogg | 200 | 203 520 B | **12** |
| /blogg | 200 | 211 729 B | **13** |
| /kurser | 200 | 278 599 B | **17** |

Widgetens FEM unika strängar sitter i exakt EN chunk: `10f47l5mmeoxy.js`
(5/5) — o119 §2:s palett-klump-bevis lever på IxcwwO. Detta är
§5.3:s referenspunkt: EFTER ska samma strängar ligga i en chunk som
INTE refereras i initial-HTML på shell-sidorna.

## §2 EFTER-verktyg (vakarövertag-bar rakt av)

- `verktyg/_s7u4o121-efter-struktur.mjs vanta [maxSek]` — pollar
  .next/BUILD_ID var 30:e s tills det lämnar IxcwwO (prod-synken
  deployar automatiskt när RAM-grinden öppnar).
- `verktyg/_s7u4o121-efter-struktur.mjs mat` — verkställer o119 §5:
  1. BUILD_ID ≠ IxcwwO **+ 568a93a2 förfader i git** (§5.1)
  2. prod 200 ×5 https: / · /blogg · /en/blogg · /ar/blogg · /en (§5.2)
  3. struktur: widget-strängar → chunk-karta; referenser i initial-HTML
     (väntat 0 på alla fyra shell-sidor); gammal chunk borta; SSR-HTML
     normaliserad bitjämförelse mot §1-arkivet (skillnader tillåtna ENDAST
     i chunk-sökvägar — chunk-hashar byts av chunk-grafändringen) (§5.3)
  → `data/forskning/OPTIMERING/lighthouse/s7u4o121-efter-struktur.json`
- Lighthouse (standardharness, samma kanal som FÖRE-baserna):
  `node verktyg/prestanda-lighthouse.mjs s7u4o121-efterA /en/blogg /ar/blogg /blogg`
  `node verktyg/prestanda-lighthouse.mjs s7u4o121-efterB /en/blogg`
  (n=2 /en/blogg + n=1 kontroller ar/sv — o120 §1:s sondupplägg.)

## §3 FÖRE-basen att mäta mot (bokförd, IxcwwO)

| Bas | Läge | /en/blogg TBT | /ar/blogg | /blogg (sv) | CLS |
|---|---|---|---|---|---|
| **o120 §1 (huvudbas)** | tystare | **651 / 547** | 508 | — | 0 ×3 |
| o119 §2 (lastigt) | medel | 876 | 737 | 348 | 0 |

EFTER-kriterier (o119 §5.4): TBT ↓ på /en/blogg, mål ≤500 i tyst
fönster; ar/sv ±15 %; CLS 0 kvar; LCP/FCP ±15 %. o119 §0:s ärliga
förväntansjustering gäller: anomalin är FCP-timing-mekanik (o120 §4) —
kurens facit bärs av STRUKTUR-kriterierna §5.3; TBT-påverkan väntas
blygsam; widgetklassen (12–17 referenser × ~46 sidor) ur det kritiska
fönstret är själva leveransen.

## §4 Driftläge under fönstret (deploybevakningens facit)

**§4.1 Kollisions-triangeln och dess upplösning (övertags-redogörelse,
sanningsenlig med efterhandskunskap):** Tre agenter berörde detta objekt
under 17:15–17:31 lokal: (a) **s7-u2 gen2** (denna agent, manifestets äkta
byggare 2/3, start 17:15) — valde objektet, skrev mätaren
`verktyg/_s7u2o119-efter.mjs`, städade läckta processer; (b) **s7-u4**
(fabrikens DUBBELREDISPATCH av samma "byggare 2/3"-prompt, start 17:19:02
ur 16:45-shellets retry-loop) — hann skriva detta protokolls §1–§3 +
FÖRE-HTML-arkivet + reservationen o121 + strukturverktyg, dödad 17:30 av
s7-u2 (se §4.2); (c) **s7-u3** (äkta syskon, byggare 3/3, 17:15) — valde
samma objekt 17:24 men viker sig HELT enligt disk-först (notis
`data/vakten/s7-o121-KOLLISION-notis-u3-till-u2.md`: stoppade sin egen
mätare för att inte äta byggfönstrets RAM, lämnade FÖRE-valideringar som
gåva, bytte till o122 mobil-läsbarhet). Övertaget u2←u4 dokumenterat i
anspråksfilen; u4:s arv (arkiv + reservation + mätplan n=2 en / n=1 ar /
n=1 sv) följs INTAKT — u4:s protokolltext ovan står orörd som dess bidrag.

**§4.2 RAM-upplåsningen (vågens faktiskaCritical path):** Prod-synken
vägrade bygga sedan 15:07Z (VÄNTAR-RAM 1 838–2 457 MB < 2 500–2 800).
Orsak: processläckage i zcode-familjen — gen1-läckta (16:45, 5 processer
~1,1 GB, timeout:ade 17:10 men aldrig städade) + gen3-dubletterna (17:19,
7 processer ~1,7 GB). s7-u2 dödade exakta PID:er (först 5 st 17:23, sedan
retry-shellet 3763391 + 6 st 17:30 — shellet FÖRST för att stoppa nya
retries); app-server-familjen (16:43, kundens studio) identifierad via
cmdline och lämnad ORÖRD. RAM 1 286 → 4 510 → 5 560 MB. Resultat:
15:37:06Z-ropet startade BYGGET (NY KOD e4588c57→be378be5, 568a93a2
förfader ✓) — första deploy-försöket sedan 14:43 som FICK bygga.

**§4.3 Mätkedjan:** `nohup bash -c 'vanta && mata && summera'`
(/tmp/s7u2o119-efter.log, start 17:31:58) — vanta pollar BUILD_ID-byte
(tak 13 min), kör sedan prod 200 ×5 + strukturkoll (widget-chunkträffar
i SSR-HTML, jämförelse mot u4:s §1-tabell 12/12/13/17), mata kör
Lighthouse (mobil-4G-paritet med FÖRE: formFactor mobile · simulate ·
412×823@1,75, utläst ur FÖRE-rapportens configSettings) n=2 en / n=1 ar /
n=1 sv med färsk chrome-profil per körning (o118 §2:s SW-regel) och
RAM-vakt ≥450 MB, summera skriver sammanställning mot o119 §2:s
FÖRE-tabell.

## §5 Slutläge och vakarövertag

(Fylls vid mätningens slut — om denna platshållare står kvar när filen
läses: kedjans status finns i /tmp/s7u2o119-efter.log och rådata i
data/forskning/OPTIMERING/lighthouse/*-s7u2o119-efter*.json; kör i så
fall `node verktyg/_s7u2o119-efter.mjs mata && node verktyg/
_s7u2o119-efter.mjs summera` (mata hoppar existerande mätningar) och
fyll denna sektion + worklog enligt §5-kriterierna i
o119-prestanda-nastasteg-defer-s7.md.)

## §6 KVD

src/ orörd (inget bygge, tsc ej aktuellt — projektbinärens noll-baslinja
orörd) · R2 orörd · data/blogg/ orörd · syskonytor orörda (u1/u2/u3:s
objekt förblev deras; detta fönsters enda nyanskaffning = arkivet +
två verktyg + detta protokoll) · prod-synkens RAM-vakt respekterad till
100 % (inget eget byggförsök — OOM-historiken 13:50–14:30 är skälet).
