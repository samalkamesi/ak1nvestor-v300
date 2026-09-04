# r7-modulinduktion — Kan NYA moduler (V30+) induceras ur data? ESG-modulen + V29-villkoret

**Forskare:** r7 (AKM3, omgång 12) · **Datum:** 2026-09-04 · **Status:** forskning + design, BYGG EJ
**Fråga:** Kan nya moduler V21+ induceras ur befintlig data — och vad krävs för att t.ex. en
ESG-modul ska vara ärlig, respektive för att V29 (insider) villkoret ska kunna aktiveras?

Kort svar: **Statistisk induktion av HELT nya variabel-ID:n ur våra data: NEJ (avslag —
n=100 med ~30 satta variabler är multipel-test-brus). Designburen expansion med datagrund:
JA, längs en femstegstrappa** där V29 är närmast aktivering (FI:s insynsregister är offentlig,
exporterbar data — grunden FINNS) och ESG-modulen är mogen som LÄSLAGER men omogen som
poängsatt modul (leverantörsdivergensen bryter mot determinismkulturen tills EN kanonisk
källa kontrakteras).

---

## 0. Två betydelser av "induktion" — skillnaden är hela domen

1. **Statistisk induktion:** låta data (100 bolag × akm1-poäng × vågklasser × AKM2-cacher)
   "upptäcka" nya faktorer/moduler genom korrelation, clustering eller ML. → **AVSLAG**
   (§2.1: Harvey–Liu–Zhu-logiken — varje ytterligare testad faktor på små n är nästan säkert
   falskt positiv; kundkultur P5: varje parameter ska förtjäna sin plats).
2. **Designburen expansion:** en variabel DESIGNAS ur litteratur (som V21–V28 i R1),
   implementeras med osatt-skydd, och "induceras" sedan i meningen ATT AKTIVERAS när
   (a) datagrund procurerats, (b) täckning mätts, (c) prediktionsloggen/Bana B dömer, (d)
   styrelsen beslutar. → **GENOMFÖRBART** — och praxis finns redan i repot.

## 1. Nulägeskarta — modulernas faktiska status (kodläst 2026-09-04)

| Variabel | Status | Skäl / saknad data |
|---|---|---|
| V21 ROIC, V22 FCF-avk., V24 räntetäckn., V25 utspädning, V28 EV/EBIT | **Beräkningsbar** (fält eller dokumenterad approximation) | `karna-moduler.ts` |
| V23 redovisningskvalitet | **Osatt alltid** | Saknar CFO, totala tillgångar, kundfordringar, bruttovinstserie (Sloan/Beneish kräver 2-årig balans+räkning) |
| V26 kapitalcykel | **Osatt alltid** | Saknar CapEx-serie + totaltillgångsserie |
| V27 utdelningskontinuitet | **Osatt alltid** | Saknar utdelningshistorik |
| V29 insider | **Inaktiv** (`INSIDER_MODUL_AKTIV = false`) | Kräver manuell data ur FI:s insiderregister — "Yahoo-data är opålitlig för .ST-listan" (R1 spår 13) |
| Modulregistret | 6 branschmoduler (SAAS/BANK/CYKLISK/TILLGÅNGSTUNG/TILLVÄXT/STANDARD) | `moduler/index.ts` — V29 "ingår aldrig — villkorad och inaktiv" |

Data-tillgångar som KAN bära aktivering (alla read-only, deterministiska):
`data/cache/akm1-{TICKER}.json` (100 st, poäng per variabel), `data/cache/akm2-{TICKER}.json`
(100 st), `data/portfolj-system/korstabell-grund.json` (100 rader, 10 branscher × 10),
`vagvalidering_dom` (Bana B live sedan VÅG 59, protokoll v2), prediktionsloggen
(akm3-spåret live, ännu 0 rader).

## 2. Forskning

### 2.1 Varför statistisk induktion avvisas (etablerad metodik)
Harvey–Liu–Zhu ("…and the Cross-Section of Expected Returns", Review of Financial Studies
2016) visar att med hundratals testade faktorer krävs t ≥ 3,0 för nyupptäckter — vårt
universum (100 bolag, 12 vågmätta, ~2,5 år serier) ger ingen power i den ligam. Samma
försvar anlades i r5 §1 (faktorzoo-försvaret) och gäller a fortiori för modul-UPPTÄCKT.
McLean & Pontiff (2016, JF) visar dessutom att publika faktor-premier faller ~50 % post-
publikation — "upptäckta" mönster i liten data är som klass värre än det.

### 2.2 ESG — evidens och datagrund (WebSearch 2026-09-04)
- **Två roller:** ESG-poäng bär (i) information om fundament och (ii) preferenser —
  [Pedersen, Fitzgibbons & Pomorski 2021, "Responsible Investing: The ESG-Efficient
  Frontier", JFE](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3466417): ESG-premien
  beror på strategi; informationen om fundamenten är den roll som skulle motivera en
  POÄNGSATT modul. Det stödjer försiktighet: samma mätetal tjänar två syften och bara det
  ena är vårt.
- **Leverantörsdivergens (det avgörande hindret):** ESG-betyg från olika leverantörer
  korrelerar svagt (branschen har lågt mått på samstämmighet — känd struktur sedan
  Berg–Koelbel–Rigobon "Aggregate Confusion", 2022). Vår determinismkultur (P1: samma
  indata ⇒ identiskt utdata; kanonisk källa som siffror.ts) kräver EN kanonisk källa —
  idag finns ingen gratis, komplett, svensk, maskinläsbar sådan.
- **Datagrund som FINNS gratis:** [MSCI ESG Ratings sökverktyg](https://www.msci.com/data-and-analytics/sustainability-solutions/esg-ratings-climate-search-tool)
  (per bolag), [S&P Global ESG Scores](https://www.spglobal.com/sustainable1/en/solutions/esg-scores-data),
  Upright (net impact, ~10 000 bolag), [SEB:s hållbarhetsdata för aktier](https://seb.se/privat/spara-och-investera/spara-hallbart/hallbarhetsdata-for-aktier),
  samt primärkällorna: bolagens egna hållbarhetsrapporter via [Bolagsverket](https://bolagsverket.se/sjalvservice/etjanster.1653.html)
  / IR-sidor. **CSRD/ESRS** höjer standardiseringen dramatiskt ([PwC Sverige](https://www.pwc.se/csrd),
  [FI om hållbarhetsrapportering](https://www.fi.se/sv/hallbarhet/regler/hallbarhetrapportering/))
  — men full ESRS-täckning för våra 100 bolag är ettårs-projekt, inte en sprint.
- **2007:528-not:** ESG-beskrivning är pedagogik; en ESG-POÄNG får aldrig bli
  handelsuppmaning ("köp för att det är grönt" = samma förbjudna grammatik som vanlig rådgivning).

### 2.3 Insider (V29) — evidens och datagrund
- **Registret är offentligt och exporterbart:** FI:s [PDMR-transaktionsregister](https://www.fi.se/en/our-registers/pdmr-transactions/)
  ([svenska: Insynsregistret](https://www.fi.se/sv/vara-register/insynsregistret/)) — alla
  PDMR-transaktioner sedan 3 juli 2016 är sökbara per emittent/person/datum och kan
  exporteras; FI tillämpar [öppen data enligt PSI-direktivet](https://www.fi.se/en/about-fi/about-fi.se/open-data/).
  Inget officiellt REST-API — men [Python-biblioteket `insynsregistret`](https://github.com/djonsson/insynsregistret)
  visar att automatiserad hämtning är etablerad praxis (scrape/export).
- **Evidens:** insiders nettoKÖP bär signal; nettoförsäljning är svagt informativ —
  klassikerna (Lakonishok & Lee 2001, JF; Jeng–Metrick–Zeckhauser 2003, JPE) ligger bakom
  R1:s trösklar, inkl. alignment-zonen 5–25 % (Morck–Shleifer–Vishny 1988). R1 spår 13:s
  dom ("Yahoo opålitlig för .ST") står oomstridd — FI-registret är den ärliga källan.
- **Vad V29 KRÄVER i kod:** `InsiderData` (nettoKopSenaste6Man i kronor,
  insiderAgandeProcent, founderKvar, massaForsaljningVDcfo, mScoreFlaggad) — beräkning-
  logiken är REDAN byggd och testad i `insider-modul.ts`; det som saknas är dataflödet +
  acceptansbeslutet.

## 3. Modulinduktionsstrappan (ramverket — förslag till protokolltillägg)

Varje ny/aktiverande modul passerar FEM grindelement (inga nya fria tal på vägen):

| # | Grind | Mäts i | V29 idag | ESG idag |
|---|---|---|---|---|
| G1 | **Design med litteraturgrund + osatt-skydd** | forskningsrapport + BESLUT | KLART (R1 §5) | Utformad här (§5) |
| G2 | **Datagrund kontrakterad** (EN kanonisk källa, fält-schema, uppdateringskadens) | datakontrakt i BESLUT | FI-export, kvartalsvis | SAKNAS kanonisk källa |
| G3 | **Täckning:** ≥ 50 % av 100-bolagsuniversumet med kompletta fält | D1-rapportens årsuppdatering | Obekräftad (mätning först) | ~0 (CSRD rullar 2026+) |
| G4 | **Prediktionsspår registrerat** (modulen påverkar komposit ⇒ loggen dömer; läs-lager ⇒ friskrivet) | prediktionsloggen / protokoll | Krävs (V29 är poängsatt) | Ej aktuellt som läs-lager |
| G5 | **Styrelsebeslut + protokollversion** (villkoret uppfyllt dokumenterat) | BESLUT-version | Väntar G2–G4 | Väntar G2–G3 |

Strappan är MEDVETET identisk i ande med AKM3-BESLUT §11 steg 7–9 (n_eff ≥ 20, logg som
domare, en ändring per protokollversion) — moduler är poängpåverkande och ska dömas hårdare
än läs-lager (peer fick byggas direkt eftersom det aldrig rör poängen; jfr r3).

## 4. V29-villkoret — konkret aktiveringsförslag (datagrund + protokoll)

1. **Insamlingsverktyg** `verktyg/kor-insyn.mjs` (mönstret kor-analysfabrik.mjs):
   kvartalsrond läser FI-export (manuell CSV-nedladdning el. biblioteksmönstret), sanerar
   till `data/insider/{TICKER}.json` med `InsiderData`-schemat + `hamtat`-datum +
   källrad (transaktions-ID) — deterministiskt, append-only historik
   `data/insider/insynshistorik.json` (samma hash-tänk som prediktionsloggen är VALFRRT
   men rekommenderas).
2. **Acceptansmätning (G3):** räkna andel av korstabellens 100 bolag med komplett
   InsiderData. Rapporteras i D1-årsuppdateringen; grind ≥ 50 %.
3. **Korskoll mot befintligt svagt fält:** `aterkop.insiderkopSenaste6man` (antal köp) får
   ALDRIG driva poäng (nuvarande not) — men kan användas som varning vid avvikelse mot
   FI-nettot (antal>0 men FI-netto<0 ⇒ flagga i motiveringen, aldrig poängändring).
4. **Aktivering = protokollversion:** `INSIDER_MODUL_AKTIV` vänds till true ENDAST via ny
   BESLUT-version med deklarerad orsak + uppdaterat modulregister (V29 tillhör STANDARD-
   modulens aktivaV då — utökningen av `aktivaV` är den enda registerändringen).
   Prediktionsloggen registrerar "akm2-med-v29" som NYTT spår (G4) — gamla spår förblir
   jämförbara (§10.9-andan).
5. **Kostnadshonesti:** manuell kvartalsrond ≈ 1–2 h (100 bolag × sök i webb-UI) tills
   biblioteksmönstret automatiserar; FI publicerar med fördröjning — `hamtat` daterar allt.

## 5. ESG-modulen (V30) — designförslag: läs-lager först, poäng sist

**Steg 1 (mogen vid G2-val): ESG som LÄSLAGER** — typ `EsgLager { kalla, kallaVersion,
omfang, betygEllerIndikatorer, hamtat }` renderat i detaljsidan/korstabell som "sällskaps-
läsning" bredvid peer, MED källdeklaration och leverantörsdivergens-not ("ESG-betyg skiljer
sig mellan leverantörer — detta är [KÄLLA]s bild, inte en sanning"). Läs-lagret kräver INTE
G4 (rör aldrig poängen) och kan byggas när kund väljer källa — t.ex. MSCI:s gratissök
manuellt kuraterad per bolag i `data/esg/{TICKER}.json` (samma hand-arbete som V29:s
FI-rond; CSRD gör det billigare för varje år).
**Steg 2 (villkorat på G2+G3+G4): poängsatt V30** — kategori "Hållbarhet", 0–5 via EN
leverantörs trösklar (dokumenterade som V21–V28:s), osatt-skydd, prediktionsspår. Tvingande
villkor: EN kanonisk källa i datakontraktet + divergens-not i varje motivering. **Om kunden
inte vill binda sig åt en leverantör: förbli läs-lager permanent** — det är ett legitimt
slutläge, inte en misslyckande (P5).

## 6. FORBUD (tillämpning på modulinduktion)

1. Statistisk faktor-/modulupptäckt ur korstabellens n=100: FÖRBJUDEN (faktorzoo).
2. Ny modul utan G1–G5: FÖRBJUDEN — särskilt "aktivera V29 för att koden redan finns".
3. ESG-poäng från flera leverantörer blandade: FÖRBJUDET (bryter P1-determinismens
   kanoniska källa); "grönt = köp"-grammatik: FÖRBJUDEN (2007:528).
4. V29-poäng på Yahoo-data: FÖRBJUDD (R1 spår 13).
5. Modul som ändrar V01–V20-poäng: FÖRBJUDEN (R4-regeln, moduler/index.ts huvud).

## 7. Tre rekommendationer

1. **Aktivera V29-villkoretets DATASTEG nu (G2–G3-mätning), beslutet sedan.** Bygg
   `verktyg/kor-insyn.mjs` + mät täckningen i FI-registret för de 100 bolagen — om ≥ 50 %
   har komplett data (troligt: samtliga noterade bolag rapporterar PDMR sedan 2016) är
   V29 det första konkreta exemplet på att villkorsstyrningen FUNGERAR, och prediktions-
   loggen får ett nytt spår som kan börja ticka. Kostnad: låg. Poängpåverkan: noll tills
   styrelsen vänder flaggan.
2. **ESG: bygg läs-lagret när kund väljer källa — avslå poängsatt V30 tills EN kanonisk
   källa kontrakterats.** Divergensen mellan leverantörer är en determinismfråga, inte en
   smaksak; CSRD/ESRS gör frågan lättare om 12–24 månader. Fram tills dess är läs-lagret
   med källnot det ärliga svaret (samme logik som peer: beskriva, aldrig väga).
3. **Skriv modulinduktionsstrappan (§3) in i nästa BESLUT-version.** Fem grindelement,
   mätbara, speglar §11:s villkorsgrammatik — då blir "nya moduler" en process i stället
   för en känsla, och framtida agenter kan inte expandera modelluniversumet utan protokoll.

**Dom: VILLKORAT.** V29: moget för G2–G3-mätning NU, aktivering (poäng) först efter
täckningsmätning + nytt styrelsebeslut + nytt prediktionsspår. ESG: läs-lager villkorat på
källval (moget vid kundbeslut), poängsatt modul avslagen tills kanonisk källa finns.
Statistisk induktion av nya V-ID:n: AVSLAG.

---
*Källor kod: src/lib/akm2/moduler/{index,karna-moduler,insider-modul}.ts · AKM2-BESLUT §1 ·
AKM3-BESLUT §9–§11 · data/rapporter/d1-datatackning-2026-09-03.md · data/portfolj-system/
korstabell-grund.json · worklog VÅG 59 (Bana B + prediktionslogg live). Webbkällor se §2:
[Pedersen m.fl. 2021](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3466417) ·
[FI PDMR-register](https://www.fi.se/en/our-registers/pdmr-transactions/) ·
[FI Insynsregistret](https://www.fi.se/sv/vara-register/insynsregistret/) ·
[FI öppen data](https://www.fi.se/en/about-fi/about-fi.se/open-data/) ·
[insynsregistret (Python)](https://github.com/djonsson/insynsregistret) ·
[MSCI ESG-sök](https://www.msci.com/data-and-analytics/sustainability-solutions/esg-ratings-climate-search-tool) ·
[S&P Global ESG](https://www.spglobal.com/sustainable1/en/solutions/esg-scores-data) ·
[SEB hållbarhetsdata](https://seb.se/privat/spara-och-investera/spara-hallbart/hallbarhetsdata-for-aktier) ·
[Bolagsverket](https://bolagsverket.se/sjalvservice/etjanster.1653.html) ·
[PwC CSRD](https://www.pwc.se/csrd) · [FI hållbarhetsrapportering](https://www.fi.se/sv/hallbarhet/regler/hallbarhetrapportering/).
Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).*
