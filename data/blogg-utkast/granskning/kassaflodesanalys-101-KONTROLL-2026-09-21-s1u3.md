# KONTROLL 2026-09-21 — kassaflodesanalys-101 (m9-3) FJÄRDE PASSET: aktualitet + FLYTTKLART PAKET

**Granskat objekt:** `data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json` (v1, status utkast — det som ligger i kön) · manifest auto-s1-1789952123920 s1-u3 (granskare 3/3).
**Relation till tidigare pass:** 09-14 huvudgranskning + rättning (5f659b52) · rond 101 09-19 (26 kontroller) · 09-19/20 v2-KANDIDAT-granskning (49 kontroller — gällde 231-bolagsunderlaget, ALDRIG skriven till kön). **Detta pass fyller seriens lucka:** aktualitet + exportpaket + torr-determinism — samma klass som syskonens m9-1 (19:57 09-20) och m9-2 (449d4dfa) pass.
**Off-gräns (R2):** publicering = kundens klick; inget har flyttats till `data/blogg/`; `publishedAt = null` medvetet i paketet; utkastfilen EJ ändrad.

## BEDÖMNING: GRÖN — FLYTTKLART PAKET LEVERERAT · 56 kontroller, 0 FEL

Sond `verktyg/_s1u3-m9kassa-paket-kontroll.mjs` (omkörbar): **56 OK · 0 FEL · exit 0** · paketbyggare `verktyg/_s1u3-m9kassa-paket-bygg.mjs` med tre grindar (kontrolleraText 0/0 · disclaimer sist · struktur) — grönt.

## 1. Källor & aktualitet

| Kontroll | Resultat |
|---|---|
| varumarke.json md5 | `9b906e42…` — EXAKT mot v1-kvittot, oförändrad även 09-21 ✅ |
| bolagsunivers.json dagens | RÖRD sedan v1: `1135dc95…` · **237 bolag** (driftfakta — se §5) |
| **Original (09-03, 100 bolag) ur git `f3f56268`** | md5 `f4cee658…` — **EXAKT MATCH** mot v1-kvittot ✅ |
| hamtat-fältet | 100/100 rader `2026-09-03` — en vintage, redovisad i texten ✅ |

Alla tal i detta pass är omräknade mot det git-återvunna originalet — inte mot dagens (rörliga) fil.

## 2. Siffror — oberoende omräkning mot md5-exakt original (17 kontroller, alla exakta)

- **FCF-marginal:** n=92 av 100 · median 10,8 % ✅ · **FCF-avkastning:** n=87 · median 3 % ✅
- **Konverteringsgrad (härledd, netto>0-vakten):** n=84 · median 0,78 · 29 över 1,0 ✅ (omedelbart signifikant: samma tre tal som rond 101)
- **Fördelning:** >5 % 26 · 2–5 % 28 · <2 % 33 varav 9 negativa · **summa 26+28+33 = 87 = n mätta** ✅ · delmängdsformuleringen "varav 9 negativa" (rättningen 5f659b52) lever i filen ✅
- **Topp 5 FCF-marginal:** Kinnevik 65,6 · Investment AB Öresund 63,9 · Industrivärden 62,4 · Prologis 56 · Netflix 52,5 — namnform+ticker+bransch+värde exakta ✅
- **Botten 5:** Aker BP −3 · Volvo Car AB (publ.) −4,5 · Polestar UK −30,8 · RWE −69,6 · Castellum −72,9 — exakta ✅
- **Konverteringstopp 3:** Telia Company 4,26 · Fabege 4,09 · Vår Energi 3,57 — exakta ✅
- **Ingressens tal** (92/10,8 · 87/3 · 84 · datum 2026-09-03) ✅

## 3. Juridik — lagen (2007:528): utbildning, aldrig rådgivning

- **kontrolleraText-spegel** (EXAKT algoritm ur `src/lib/varumarke.ts:141` — `RegExp(fran,'giu')`, exec-loop, FEL/VARNING per allvar; 26 fraser): **0 FEL · 0 VARNING på BÅDE hel body (inkl kvitto) och publicerbar yta (titel+ingress+mall-body)** ✅
- Rådgivningsglossor (köp/sälj/rekommendera/bör du/aktietips/garanterad avkastning/bra affär för dig): **0 träffar** ✅
- Ramformuleringar på plats: "en deskriptiv översikt, inte en värdering" · "sortering av data, inte omdömen" · "beskriver utfall, inte framtida hållbarhet" · "avgörs i den manuella analysen" ✅
- Negerad disclaimer exakt sist: "aldrig investeringsrådgivning (lagen 2007:528)" ✅
- **Lagrum-renhet:** endast 2007:528; 0 träffar på konsumenträttslagrummen (2022:260/2022:261/1985:716/2005:59/LEK) ⇒ ingen blandningsrisk ✅

## 4. 911-referenser: REN (0/6)

Seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") sökta i HELA utkastfilen: **0 träffar** ✅ (fjärde dagen i rad för serien).

## 5. Determinism & drift — treledad kandidatkedja + FYND S1

**Filintegritet:** utkastfilen == HEAD (working tree ren) · sista commit som rör filen = `5f659b52` (09-14 rättningen) — **orörd sedan dess** ✅

**Fabrikens TORR-körning** (`--visa`, 0 rader skrivna) på DAGENS underlag (237 bolag):

| Kandidat | Underlag | kandidat-md5 | Status |
|---|---|---|---|
| v1 (i kön, detta paket) | 100 bolag, 09-03 | `3331bfa4…` | 3× grön — flyttklar ✅ |
| v2-kandidat (09-20) | 231 bolag, 09-20 | `d8e135f5…` | grön 09-20 — **ALDRIG skriven** |
| dagens kandidat | 237 bolag, 09-21 | `a98b3a52…` | **OGRANSKAD** — omkörningsvakten slagen |

- **FYND S1 (till fabriksägaren — konkret fix i diff-filen):** den globala seeden (`verktyg/m9-fabrik.mjs:1338`) byggs av korstabell + vågvaliderings-rapport + varumarke + månadsnyckel — **inte bolagsunivers.json**. Seed `904e0fcc…` är därför IDENTISK från v1 (100 bolag) till idag (237) medan kandidat-md5 ändrats tre gånger. Kvittots seed-rad ("md5 av källfilernas md5") är missvisande för universum-serierna (kassaflödesanalys + utdelningar): samma seed ⇏ samma underlag. Determinismbärandet vilar i praktiken på käll-md5-raderna (som FÅNGAR rörelsen) — men seed-formuleringen bör rättas eller seriernas seed beräknas ur deras egna källor. Bevis: dagens torrkörning, seed oförändrad, kandidat `a98b3a52 ≠ d8e135f5 ≠ 3331bfa4`.
- **D1 (drift):** v2-kontrollens omkörningsvakt är AKTUELL — om kö-underhållet kör `--skriv` nu landar kandidat `a98b3a52` (237 bolag), som INTE är den gröngranskade `d8e135f5` (231). Nya tal (medianer/n/fördelning/ytterligheter) kräver ny granskning FÖRE publicering.
- **D2 (syskonnotis):** branschmedianer-akm2 bär också ny GRANSKNINGSKLAR-kandidat (`0431dd6c`) på dagens underlag — samma vaktklass gäller hela m9-familjen vid nästa --skriv-omgång.
- Två sondbuggar rättade FÖRE dom (ärligt bokförda): `toString('trim')`-feltypning + ett redundant git-anrop i källåtervinningen; ingen påverkade resultatet — slutkörningen är den första gröna.

## 6. Länkar: 3/3 levande (statiskt + HTTP 200 samma dag)

| Länk | Bevis | Dom |
|---|---|---|
| /kurser/km-003-kassaflodesanalysen | rad i `src/lib/larvag-karta.ts` + HTTP **200** | ✅ |
| /forskningsbiblioteket | rutt `src/app/(huvud)/forskningsbiblioteket` + HTTP **200** | ✅ |
| /blogg/v19-kapitalforbranning-analys | fil `data/blogg/v19-kapitalforbranning-analys.json` + HTTP **200** | ✅ |

## 7. Struktur & paket

Mall-body 6 "##"-rubriker (krav ≥2) · ≥ 800 tecken · titel bär "(utkast)" i kö-formen ✅. **PAKET:** `granskning/kassaflodesanalys-101-FLYTTKLART-PAKET-2026-09-21.json` — hela bodyn 5 876 tkn → kvitto strippat 2 358 tkn → **paket-body 3 695 tkn** (syskonens klass: 3 532/3 478) · titel utan "(utkast)" · `description` (ny yta, handskriven i paketet — maskinens kandidater bär ingen) · pillar/author enligt våg 95-kontraktet · **publishedAt null (kundens klick, R2)** · disclaimer exakt sista raden · **kontrolleraText 0 FEL/0 VARNING på hela paketets textyta** (title+description+body, 26 fraser) · JSON giltig.

## 8. Dom och nästa steg

**GRÖN — m9-3:s FLYTTKLART PAKET levererat; m9-familjen därmed 3/6 med paket** (m9-1 · m9-2 · m9-3; kvar: m9-4 branschmedianer · m9-5 forskningsläget · m9-6 vågkartan). Publicering = kundens klick (R2). Nästa pass i spåret enligt FIFO: m9-4–m9-6-paketen eller kvartalsseriens ogranskade bolagspaket (u1 tog Sandvik 02:58; nästa därefter).

*Granskat av agentfabrik auto-s1-1789952123920 s1-u3 (granskare 3/3), 2026-09-21 ~03:0x lokal. Anspråk disk-först: data/vakten/auto-s1-1789952123920-u3-ansprak.md. Skript: verktyg/_s1u3-m9kassa-paket-kontroll.mjs (56 kontroller) + _s1u3-m9kassa-paket-bygg.mjs (3 grindar) — båda omkörbara.*
