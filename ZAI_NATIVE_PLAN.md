# Z.AI NATIVE ARCHITECTURE — Master Plan
## Tre AI-agenter som bygger världens första autonomt finansutbildnings-system

> Källa: Grundarens vision (komprimerad) + AI-styrelsen
> AI-motor: Z.ai GLM-5.3 (Reasoning Mode + 1M kontext + Z-Code cache)
> Tidsplan: Komprimerad från 8 veckor → kontinuerlig autonom byggnation
> Nyckel: ALLT körs "Z.ai Native" — inget LangChain, ingen Pinecone, ingen middleware

---

## TRE AGENTER — hela systemet

### AGENT 1: Behavioral Tracer (Profilagenten)
**Roll:** Ligger i skuggan, mäter varje interaktion
**Implementation i vår kodbase:**
- `/profil` → scenario-test (✅ LIVE)
- Beacon → sidvisningsspårning (✅ LIVE)
- Quiz-svar → XP/beteendedata (✅ LIVE: 3573 frågor)
- Chatbot → frågeanalys (✅ LIVE)
** Saknas:** LLM-analys av beteendemönster → dynamisk JSON-profil

### AGENT 2: Live Market Engine (Marknadsagenten)
**Roll:** Hämtar live-data, skapar "Zero-Day" case
**Implementation i vår kodbase:**
- Python-motor: Yahoo + MarketStack + Stooq (✅ LIVE)
- 5×5×4 analys: 25 celler per bolag (✅ LIVE)
- Portföljsystem: AKM1 + vågor (✅ LIVE)
- Kalkylator: 20 variabler (✅ LIVE)
** Saknas:** Automatisk injektion av live-rapporter i kursexempel

### AGENT 3: Short-Seller (Grillningsagenten)
**Roll:** Sokratisk motpart som attackerar elevens analys
**Implementation i vår kodbase:**
- Chatbot: kunskapsbas (✅ LIVE — men BARA hjälpsam)
- Quiz: fel svar → coachning (✅ LIVE — men inte sokratisk)
** Saknas:** Adversarial mode, Reasoning Mode, röst

---

## VAD JAG BYGGER NU — Agent 3 Short-Seller

Agenten byggs som en ny mod i chatboten som AKTIVT attackerar:
1. Eleven lämnar in en analys (eller besvarar en fråga)
2. Short-Seller hittar svagheter och utmanar
3. Sokratisk dialog — ALDRIG direkta svar

**System-Prompt (förberedd för Z.ai GLM-5.3):**

```
Du är "The Short-Seller" — en cynisk, erfaren blankare på en hedgefond.
Din uppgift är att förstöra studentens investeringstes genom att:

1. Hitta matematiska fel (fel WACC, fel diskonteringsfaktor, fel terminal value)
2. Utmana antaganden ("Du antar 22% bruttomarginal — varför inte 18%?")
3. Peka på risker eleven missat ("Vad händer om kunden lämnar?")
4. Jämföra med historiska misslyckanden ("Det här liknar Sinch 2021...")

REGEL: Du ger ALDRIG direkta svar. Du ställer bara motfrågor som tvingar
eleven att tänka djupare. Om eleven ger ett svagt svar: "Det räcker inte.
Försvara din siffra."

TONALITET: Respektfullt aggressiv. Som en chef som vill att du ska växa,
inte krossas. "Jag frågar inte för att vara elak — jag frågar för att
du ska klara den verkliga världen."

FORMAT: Kort, slagkraftig. Max 2 meningar per attack. Vänta på svar.
```

---

## IMPLEMENTATIONSPLAN — vad som sker NU

| Steg | Vad | Hur | Status |
|---|---|---|---|
| 1 | Short-Seller mode i chatbot | Ny endpoint + UI-knapp "🎯 Utmana mig" | BYGGER NU |
| 2 | Scenario-baserad grillning | Kopplar till kognitiv profil | Kö |
| 3 | Live-data injektion | Python-motor → kurs-exempel | Kö |
| 4 | Spaced repetition | Glömskekurva → micro-frågor | Kö |
| 5 | Bloomberg-UX | Terminal-layout | Kö |

---

## AFFÄRSMODELLEN

| Produkt | Pris | VAD de får |
|---|---|---|
| Fas 1 | GRATIS | Profiler + kurser + quiz + portfölj |
| Fas 2 | 9 999 kr | + AI-mmentor 24/7 + Short-Seller + simuleringar |
| Fas 3 | 13 999 kr | + API + metodik-licens + representant-status |
| B2B | 35 000 kr/år | Helt team + Corporate upskilling |

**Skalbarhet:** GLM-5.3 körs dygnet runt, rättar alla analyser autonomt,
anpassar svårighetsgrad per elev. 10 000 studenter utan en enda mänsklig lärare.
