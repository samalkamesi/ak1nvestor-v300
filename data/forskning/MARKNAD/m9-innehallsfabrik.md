# m9-innehallsfabrik — SEO-innehållsfabrik: bloggposter AUTO-genererade ur forskningsdata

**Forskare:** m9 (MARKNAD, omgång 13) · **Datum:** 2026-09-04 · **Status:** forskning + design, BYGG EJ
**Fråga:** Kan en innehållsfabrik månadsvis generera "V07-branschöversikt: bruttomarginalens
medianer"-poster ur korstabellen — mappad mot ORGANISK-TILLVAXT-PLANens 20 long-tail-ämnen,
med kvalitetsgrind (kontrolleraText) och mänsklig granskning?

Kort svar: **JA — maskindelen är redan möjlig med dagens data (67 av 100 bolag har råa
nyckeltal i fundamental-cachen; korstabellen bär 10×10 branschstruktur; analysfabriken är
färdigt mönster), men publiceringen är VILLKORAD på våg 2:s kontrolleraText (under byggnad —
icke-committad arbetskopia finns) + mänsklig granskning per post.** Fabriken producerar
UTKAST till data/blogg-fabrik/ — aldrig direktpublicerat innehåll.

---

## 0. Oföränderliga utgångspunkter (MARKNADS-BESLUT §0 — gäller också denna fabrik)

P1 öppen delning (aldrig väggar) · P2 2007:528 (marknad får ALDRIG bli rådgivning —
branschöversikter beskriver DATA, aldrig "köpvärda branscher") · P3 gratis heligt ·
P4 äkthet (tal ur data med datering, mätfel skrivs ut) · P5 tipsa aldrig tvinga ·
**P6 GDPR-by-design: INGA nya spår/pixels — fabriken läser forskningsdata, ingen
besöksdata** · P7 tal ur SIFFROR för plattformens egna tal; **fabrikens datatal ur
korstabellen/fundamental-cachen med `hamtat`-datering** (de är forskningstal, inte
plattformstal). Våg 4-regeln lyder rakt av: "AI-genererade texter MÅSTE passera
kontrolleraText + mänskligt godkännande."

## 1. Nulägeskarta — vad som finns (kodläst 2026-09-04)

| Tillgång | Var | Betydelse för fabriken |
|---|---|---|
| 100-bolagskorstabell, 10 branscher × 10 | `data/portfolj-system/korstabell-grund.json` (`skapad` 2026-09-03) | Branschgrupperna (n=10) + urvalsreferens |
| Råa nyckeltal per bolag med datum + källa | `data/cache/fundamental-{TICKER}.json` (67 st; t.ex. AZN: bruttoMarginal 0,8169, hamtat 2026-09-03, kallor[0] Yahoo Finance) | RÅ-medianer per bransch — "medianer" i rubriken blir äkta tal, inte poäng |
| Per-variabelpoäng 0–5 + motiveringar | `data/cache/akm1-{TICKER}.json` (100 st) | Poäng-medianer + rankningar (peer.ts logik) |
| Branschmedian/midrank-redan-byggt | `src/lib/portfolj-forskning/peer.ts` (PEER_MIN_GRUPP=5; median över icke-osatta) | Återanvänd gränsreglerna: grupp < 5 ⇒ "för få mätta" — ALDRIG gissning |
| Fabriksföregång med ärlighetslinjer | `verktyg/kor-analysfabrik.mjs` (våg 56) + `src/lib/analysfabrik.ts` | MÖNSTER: read-only källor, deterministisk, motiveringar ordagrant, osatt=osatt, disclaimer — innehållsfabriken är våg 56-andans bloggsidor |
| Bloggformat | `data/blogg/*.json` (slug/title/description/pillar/author/publishedAt/readingMinutes/tags/body) | Fabrikens utdataformat — IDENTISKT, ingen ny form |
| OG-bilder per slug | `scripts/og-generate.mjs` + `public/og/blogg/{slug}.png` (VÅG 1a, byggd) | Publicerad post får automatiskt delningsbild |
| 20 long-tail-ämnen + kursmappning | `data/forskning/ORGANISK-TILLVAXT-PLAN.md` §3 | Fabrikens interna länkmål — se §4 |
| **kontrolleraText** | `src/lib/varumarke.ts` — **UNDER BYGGNAD** (våg 2; icke-committad arbetskopia med `kontrolleraText()` finns 2026-09-04) | Publiceringsledet kopplas in när våg 2 landat — fabriken bygger inte på en annan agents icke-committade fil-domän |

## 2. Forskning — policy och mönster (WebSearch 2026-09-04)

1. **Googles "scaled content abuse"-policy (mars 2024).** Google straffar innehåll som
   massproduceras för att manipulera ranking — oavsett om det skapas av människor eller
   AI ([Google Search Central](https://developers.google.com/search/blog/2024/03/core-update-spam-policies);
   [Google blogg](https://blog.google/products-and-platforms/products/search/google-search-update-march-2024/)).
   SAMTIDIGT belönas kvalitet "oavsett hur den producerats". Skillnaden: vårt innehåll är
   **datadrivet och unikt per post** (medianerna ÄNDRA(r)s mellan månader) med mänsklig
   granskning — det är det mönster Google uttryckligen tillåter; "en mall × 20 tunna sidor
   utan ny data" är det som straffas. Riskkontroll i §5.
2. **GEO — vad generativa motorer citerar.** Konkreta tal, raka svar tidigt,
   frågeformaterade rubriker (KDD 2024, citerad i ORGANISK-TILLVAXT-PLAN §1) —
   branschöversiktens första stycke SKA vara svaret (medianerna), inte en inledningsanos.
3. **Datajournalistik som länkmagnet.** Planen §5.1 ("Årsredovisningsbarometern —
   journalister älskar rankningar; data ur egna motorer = unikt, citerbart") —
   branschöversikterna är barometerns månatliga little brother: samma datakraft,
   lägre produktionkostnad, återkommande färskhetssignaler.
4. **Beständiga URL:ar vs färskhet.** SEO-praxis: månatliga dataposters landningssida ska
   vara en EVERGREEN kanonisk sida som UPPDATERAS (år/månad i titeln skapar kanonisering-
   splittring) — designen (§3) väljer därför EN slug per V-variabel med daterat avsnitt
   inuti, i stället för oändliga `-2026-09`-kopior. (Avvikelser dokumenteras i AC.)

## 3. Design — innehållsfabriken (byggfärdig skiss)

**Arkitektur (tre led, ägarskap enligt MARKNADS-BESLUT §5-andan):**
```
LED 1 · GENERERING (deterministiskt, inget LLM-tecken i basen)
  verktyg/kor-innehallsfabrik.mjs  (mönstret kor-analysfabrik.mjs)
  in: korstabell-grund.json + fundamental-/akm1-/akm2-cacher + peer.ts-regler
  ut: data/blogg-fabrik/{slug}.json  = UTKAST (schema blogg-v1 + fabrikfält, se nedan)
  läge: --m = månadsserie (20 poster), --v=V07 = enskild, --torr = endast statistik-JSON

LED 2 · KVALITETSGRIND
  a) kontrolleraText(body + title + description) → FEL ⇒ utkastet kan INTE flyttas
     (publikt statusfält " sperrend: blockad", orsak列表 radas — AC speglar våg 4:2)
  b) strukturell validator: disclaimer-token, datering, osatt-not, internlänkar,
     FAQ-schema, n-per-bransch — allt maskinkontrollerat

LED 3 · MÄNSKLIG GRANSKNING + PUBLICERING
  granskarparen fyller granskadAv + granskadDatum + diff-anteckning i utkastet,
  flyttar till data/blogg/*.json (eller redigerar först), kör og-generate — klart.
```

**Posttyp 1 — månadsserien "Branschöversikt" (kärnan i uppdraget):**
- Slug: `branschoversikt-v07-bruttomarginal` (evergreen; se §2.4). Titel:
  "V07-branschöversikt: bruttomarginalens medianer per bransch".
- Kroppens block (mall, ALLT i samma ordning):
  1. **Rakt svar** (första stycket): median-tabell per bransch ur fundamental-cachen
     (råvärden där n_rå ≥ 5, annars poäng-median märkt "poängskala 0–5"), daterat
     "underlag hämtat {hamtat}, 100-bolagsuniversum, {n} mätta".
  2. Vad variabeln mäter + formeln (ordagrant ur VARIABEL_NAMN/motiveringskulturen).
  3. Median-tabellen + störst/minst observation (bolag NÄMNS vid namn — offentlig data —
     men ALWAYSdeskriptivt: "högst median: hälsa 78 %", aldrig värderande).
  4. **Ändring sedan förra månaden** — färskhetssignalen: "teknik +1,2 pp (nya underlag
     för 3 bolag); ingen förändring i 6 branscher". Ingen ändring ⇒ "oförändrat" (ärligt).
  5. **Osatt-not**: "likviditet/bransch X: för få mätta bolag (n=3) — därför saknas rad"
     (peer.ts:s PEER_MIN_GRUPP=5 återanvänds som kanon).
  6. Internlänkar: long-tail-guiden (#mappning §4) + kursen + /kalkylator.
  7. FAQPage-schema 2–3 frågor ("Vad är bruttomarginal?", "Vilken bransch har högst
     median — och varför?", "Hur ofta uppdateras översikten?").
  8. Signatur + disclaimer (2007:528) + "öppet kvitto om det förflutna — aldrig garanti
     om framtiden"-formuläret från forskningskulturen.
- **Determinism (P1-kultur):** samma cachefil ⇒ bitidentiskt utkast (två körningar =
  md5-jämförelse i AC). Datum kommer från data (`hamtat`/`skapad`), aldrig klockan.
- **Fabrikfält i utkastet** (nya, additive): `fabrik: { version, kallor: [fil+md5],
  statistik: { perBransch: … }, genereradUr: "kor-innehallsfabrik" }` — full spårbarhet
  från publicerad text till datafil (P4-äkthet: varje tal kan granskas bakåt).

**Posttyp 2 — "Störst förändring denna månad" (1 post, endast om någon variabels
branschmedian rörde sig > tröskel):** datajournalistik med mänsklig vinkel — kandidat
väljs av LÖPANDE regel (störst absolut förändring), inte av redaktörsgillande.

**Vad fabriken ALDRIG gör:** skriver värderings-/rekofraser (grind a fångar), nämner
"köpvärt/undvik", publicerar utan granskadAv, genererar mer än 20+1 poster per månad,
eller hämtar besökar-/persondata (P6 — läsning är ENBART forskningsdata).

## 4. Mappning mot de 20 long-tail-ämnen (ORGANISK-TILLVAXT-PLAN §3)

Fabriken BYGGER PÅ planen — den ersätter inte de manuella guider som redan publiceras
(`v07-bruttomarginal-analys.json` finns; guiderna är och förblir handskrivna kanoniska
frågesidor). Varje branschöversikt länkar SIN guidelåsning:

| V | Long-tail-ämne (plan #) | Kurs (intern länk) | Fabrikens serie-slug |
|---|---|---|---|
| V07 | #4 "Vad är bruttomarginal…?" | /kurser/v07-bruttomarginal | branschoversikt-v07-bruttomarginal |
| V08 | #10 "EBITDA-marginal: bra nivåer per bransch" | /kurser/v08-ebitda-marginal | branschoversikt-v08-ebitda-marginal |
| V09 | #1 "Hur räknar man ROE?" | /kurser/v09-roe | branschoversikt-v09-roe |
| V04/V05/V06 | #5/#19/#2 (P/S, P/B, EV/EBITDA) | respektive kurs | …v04-ps · …v05-pb · …v06-ev-ebitda |
| V10/V11 | #6/#7 (skuldsättning, likviditet) | v10/v11-kurserna | …v10-skuldsattningsgrad · …v11-likviditet |
| V01/V02/V03 | (#9/#8 ARR/diversifiering ingår i djupanalysen) | v01–v03 | …v01-forsaljningstillvaxt m.fl. |
| V12–V20 | #11–#20 (återköp, kassatäckning, moat- och katalysatorämnen) | v12–v20 | …v12-intaktsstabilitet … v20-aterekop |
| V21–V28 | (utöver planen — modulvariablerna) | saknas kurs | SENARE: endast om kurser tillkommer (fabriken följer kurserna, aldrig tvärtom) |

Not: kvalitativa V13–V18 har ofta strukturellt osatta poäng (D1) — deras branschöversikter
renderar "osatt hos X av 10 bolag" som sin huvudinfo (det ÄR informationen; osatt=osatt).
V16–V18-posterna SKJUTS upp tills täckningen växt (speglar r6 §3 V2 — samma mätare).

## 5. Risker + kontroller

| Risk | Kontroll |
|---|---|
| Scaled-content-abuse (§2.1) | Max 20+1 poster/månad; varje post bär NY data (medianer/delta); granskadAv-tvång; unik evergreen-slug (ingen sidokloning); inga doorway-sidor (varje post har egen datastory) |
| Rådgivningsglidning i bolagsnämningar | Grind a + strukturreditor: bolag nämns ENDAST i median/jämförelse-sammanhang, aldrig med verb ur FORBJUDNA_FRASER |
| Inaktuella tal | `hamtat`-datering i varje tabell + regeln "publicera endast om underlag ≤ 45 dagar gammalt" (fabriken vägrar annars — status rapporteras) |
| Skenet av att data är "sanningen" | kallor-fält med md5 + osatt-not + "urvalsberoende: 100-bolagsuniversum" (peer.ts:s referens-form) |
| Våg 2 under byggnad | Publiceringsledet kopplas in först när våg 2 landat (kontrolleraText
  finns som icke-committad arbetskopia — våg 2 AC5 designade den exakt för denna pipeline) |

## 6. Tre rekommendationer

1. **Bygg LED 1 + LED 2-maskindelen nu (de är beroendefria), lås LED 3 på våg 2.**
   `kor-innehallsfabrik.mjs` + statistik-JSON kan byggas och testas direkt (determinism,
   n-regler, datering) — när våg 2 landar kopplas kontrolleraText in som sista grind och
   första månadsserien kan granskas. Tidsåtgång.generering: minuter/månad.
2. **Starta serien med V07 + V08 + V09 (tre poster) i stället för alla 20.** Tre
   månadsuppdateringar ger Search Console-data (impressions på motsvarande long-tail-fras,
   plan §7 KPI) innan volymen skalar — om data visar intresse rullas resterande 17 in;
   annars har kostnaden varit tre utkast. Detta är planens egen prioriteringslogik (vecka
   1–4: #1, #2, #6, #7) tillämpad på fabriken.
3. **Låt granskningsparet använda fabrikfältet som granskningsunderlag.** Statistik-JSON
   (perBransch med råvärden och antal mätta) gör den mänskliga granskningen till ett
   verifieringsjobb ("stämmer tabellen mot källorna?") i stället för ett skrivjobb — det
   håller kvaliteten hög när serien växer och skyddar P4 (äkthet) mekaniskt.

**Dom: VILLKORAT — moget att bygga genereringsledet NU; publicering först när våg 2:s
kontrolleraText är landat (arbetskopia finns redan — verifiera AC innan koppling) OCH
granskningsrutinen (granskadAv-tvång) är beslutad. Ingen del av fabriken publicerar
autonomt.**

---
*Källor kod: data/forskning/ORGANISK-TILLVAXT-PLAN.md (§1–§7) · MARKNADS-BESLUT (§0, §2 våg 2
AC5, våg 4 AC2, §3) · verktyg/kor-analysfabrik.mjs + src/lib/analysfabrik.ts (mönstret) ·
src/lib/portfolj-forskning/{peer.ts, korstabell-data.ts} · data/portfolj-system/korstabell-grund.json ·
data/cache/fundamental-AZN_ST.json (råvärden + hamtat + kallor) · data/blogg/v07-bruttomarginal-
analys.json (format) · scripts/og-generate.mjs (VÅG 1a). Webbkällor se §2: [Google Search Central
2024](https://developers.google.com/search/blog/2024/03/core-update-spam-policies) · [Google
blogg 2024](https://blog.google/products-and-platforms/products/search/google-search-update-march-2024/).
Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).*
