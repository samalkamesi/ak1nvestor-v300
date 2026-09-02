# Integrationsaudit — AK1A Research Lab

**Datum:** 2026-09-02
**Uppdrag:** "Många sidor jobbar för sig själva — kontrollera hur vi kan integrera sidorna med varandra och maximera nyttan."
**Metod:** Genomläsning av alla verktygssidor (kalkylator, superanalys, vagfundament, konfluens, netnet, portfoljbyggare, dagens-pass) + min-sida + kurser + rapporter; kartläggning av kontextuella länkar (innehållslänkar, ej globala menyn/sidfoten); fix av de tre största gapen.

**Viktigt förram:** Global navigation finns redan — megamenyn (huvudmeny.tsx) listar alla verktyg och varje sida får den generiska `NastaSteg`-modulen (personlig, XP-baserad) + Sidfooter. Problemet är inte att sidorna är onåbara, utan att **innehållslänkarna mellan verktygen saknas**: eleven som just gjort klart ett verktyg får ingen kontextuell bro till nästa. Det är det klagomålet bekräftas.

---

## 1. Karta — utgående kontextuella länkar per sida (före fix)

| Sida | Fil | Kontextuella utgående länkar | Betyg |
|---|---|---|---|
| Kalkylatorn | `akm1-calculator.tsx` | ✅ V-kurs per variabel (`/kurser/${v.slug}`), V09-kurs + ROE-artikel, komplett guide | Bra — enda verktyget som länkar kurssystematiskt |
| Superanalysen | `superanalys.tsx` | ❌ **INGA** (0 st) | Återvändsgränd |
| Vågfundament | `vagfundament/page.tsx` | ❌ Inga ("Min portfölj" nämns i text — utan länk) | Svag |
| Konfluensradarn | `konfluens/page.tsx` | ✅ "Fortsätt i ekosystemet": Vågfundament, Net-net, Kalkylatorn | Bäst i klassen — saknar bara Superanalysen + egen kurs |
| Net-net-skannern | `netnet-skanner.tsx` | ❌ **INGA** (0 st) | Återvändsgränd |
| Portföljbyggaren | `portfoljbyggare.tsx` | ❌ **INGA** (0 st) | Återvändsgränd |
| Dagens Pass | `dagens-pass.tsx` | ❌ **INGA** (0 st) | Hubben som inte distribuerar |
| Min Sida | `min-sida.tsx` | ✅ Verktygsgatan (4 verktyg), kurser, badges, certifikat, topplista | Halvgod — 5 av 9 verktyg saknas |
| Rapporter | `rapportbyggare.tsx` | ✅ Superanalysen + Konfluens (vid tom analysbank) | OK |

**Kursbiblioteket** (297 kurser i `public/deep-courses.json`) innehåller redo material som verktygen aldrig länkar till: `v01`–`v20` (variabelkurser), `the-intelligent-investor` + `vm-01-grahams-formel` (Graham), `pf-01-portfoljbyggande` + `portfolj-ekosystemet` (portföljteori), `konfluens-varde-moter-vagor`, `vagfundament-variablerna-som-tidsserier`.

**Analys-pipelinen som bryts:** Superanalys → (Portföljbyggare) → Min portfölj → Rapporter är systemets naturliga arbetssätt, men kedjan har inga länkar mellan stegen. Elevens 100-XP-moment (fullbordad superanalys) slutar i en vägg.

---

## 2. De 5 största integrationsgapen

1. **Superanalysen är en återvändsgränd (0 länkar).** Flaggskeppet — 24 steg, analys-kort, +100 XP — och ändå leder resultatet inte vidare till Konfluensradarn (korsläsning), Portföljbyggaren (poängen får vikt) eller Rapportbyggaren (redovisning). Störst trafikförlust per besökare.
2. **Net-net-skannern kopplas aldrig till Graham (0 länkar).** Sidan undervisar om Grahams 2/3-regel men länkar inte kursen *The Intelligent Investor* som finns i biblioteket — och en träff leder inte vidare till Superanalysen för att skilja värdefälla från fynd.
3. **Portföljbyggaren slutar i luften (0 länkar).** Elevens gissade AKM1-poäng per position uppmanas aldrig att bytas mot ett riktigt 24-stegsbetyg; ingen bro till Min portfölj (verkliga innehav, 5×5×4-djupanalys) eller till kursen bakom färdscenerna.
4. **Dagens Pass — den dagliga hubben — har 0 kontextuella länkar.** Sidan som eleven besöker varje dag (streak-mekanik) distribuerar ingen trafik till verktyg eller kurser; endast generisk NastaSteg.
5. **Min Sida "Verktygsgatan" listar bara 4 av 9 verktyg.** Konfluensradarn, Vågfundament, Net-net, Portföljbyggaren och Rapporter saknas på dashboardsidan som utlovar "allt samlat på ett ställe".

*Hedersomnämnanden:* Vågfundament-sidan saknar helt utgående sektion (AK1TS-kurs, Konfluens); Konfluensradarn länkar inte till Superanalysen eller sin egen kurs `konfluens-varde-moter-vagor`; Kalkylatorn saknar "nu kör du hela analysen"-länk till Superanalysen.

---

## 3. Utförda fixar (3 filer, kirurgiskt)

### Fix 1 — `src/components/ak1a/superanalys.tsx`
Nytt avsnitt **"Nästa steg i ekosystemet"** på resultatsidan (steg 24, efter Åtgärder-kortet):
- → **Konfluensradarn** — korsläs analysen mot radarns fem oberoende källor
- → **Portföljbyggaren** — ge poängen vikt och se risk/spridning i realtid
- → **Dina rapporter** — väv sparade analyser till utskriftbar redovisningsrapport

*Låser upp pipelinen Superanalys → Portfölj → Rapport i en enda sekvens på själva slutsidan.*

### Fix 2 — `src/components/ak1a/netnet-skanner.tsx`
Nytt avsnitt **"Fördjupa dig"** efter disclaimern:
- → **Kursen The Intelligent Investor** (`/kurser/the-intelligent-investor`) — cigar-butts, NCAV, margin of safety från källan
- → **Konfluensradarn** — värdegolvet mot vändande vågor
- → **Superanalysen** — 24 steg på träffen: värdefälla eller fynd?

*Kopplar screening till både ursprungskunskap och fördjupningsflöde.*

### Fix 3 — `src/components/ak1a/portfoljbyggare.tsx`
Nytt avsnitt **"Nästa steg"** efter disclaimern:
- → **Min portfölj** — faktiska innehav + djupanalys (5×5×4), jämför med utkastet
- → **Superanalysen** — byt gissad AKM1-poäng mot riktigt 24-stegsbetyg
- → **Kursen Portfölj-byggande** (`/kurser/pf-01-portfoljbyggande`) — teorin bakom färdscenerna och varningarna

Alla tre avsnitt följer Konfluenssidans etablerade "Fortsätt i ekosystemet"-mönster (guld-rubrik + 3 kort, `sm:grid-cols-3`, hover-toning) — visuellt och tekniskt konsekvent med befintlig design. `Link` från `next/link` importerad i alla tre filerna (klientkomponenter — fungerar fint).

**Verifiering:** `tsc --noEmit` → 0 fel i de tre redigerade filerna. Projektet har 75 förhandsbefintliga TS-fel i orörda filer (scripts/, visuellt-bibliotek, kurser/page m.fl.) — oförändrade av denna ändring.

---

## 4. Kvarstående rekommendationer (ej fixade — nästa batch)

1. **Dagens Pass:** lägg "Dagens verktyg"-rotation (länk till ett verktyg/dag, t.ex. vag Lt. konfluens vid låg streak) i `dagens-pass.tsx`.
2. **Min Sida:** utöka VERKTYG-arrayen i `min-sida.tsx` med Konfluensradarn, Vågfundament, Net-net, Portföljbyggaren, Rapporter (5 rader konstantsdata).
3. **Vågfundament:** spegla Konfluensens "Fortsätt"-sektion (AK1TS-kursen `ts-10-ak1ts-25cellers-matris`, kursen `vagfundament-variablerna-som-tidsserier`, Konfluensradarn).
4. **Konfluensradarn:** lägg Superanalysen + egen kurs bland de tre befintliga länkarna.
5. **Kalkylatorn:** "Nästa steg: kör hela analysen" → Superanalysen.
6. **Kurssidor → verktyg:** lägg verktygs-CTA i kursbenchmark ("Testa V09 i Kalkylatorn") — omvänd riktning är idag nästan obefintlig.

**Prioriterad ordning enligt pipeline-nytta:** 1 → 2 → 3.
