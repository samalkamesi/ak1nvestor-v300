# AI-DRIVEN FINANSUTBILDNING — Master Specification
## Från pedagogisk plattform till adaptiv marknadsoperatör-utbildning

> Källa: Grundarens vision + AI-styrelsens arkitekturanalys
> Status: Specifikation komplett · Byggnation påbörjad
> Målgrupp: BÅDE nybörjare (Fas 1, gratis) OCH proffs (Fas 2/3, betalt)

---

## NULÄGE vs VISION (ärlig karta)

| Fas | Vision | Vi HAR | Vi SAKNAR | Byggbarhet |
|---|---|---|---|---|
| **F1: Kognitiv profilering** | Interaktivt scenario-test → riskprofil | /diagnos (5 frågor), XP-system, quiz-data | AI-analys av svar, psykologisk profil | ✅ 70% — utöka diagnos till scenario-spel |
| **F2: Adaptiv innehållsmotor** | Realtidsgenerering, DDA, multimodalt | RikText, 227 kurser, Python-motor (Yahoo+MarketStack) | LLM-API, vektordatabas, röst-syntes | ⚠️ 40% — arkitekturen finns, AI-saknas |
| **F3: Adversarial AI-mmentor** | Sokratisk dialog, stress-simulering, rolls-spel | Chatbot (kunskapsbas), quiz med coachning | LLM för dialog, ElevenLabs för röst | ⚠️ 30% — UI + logik byggbar, AI väntar |
| **F4: Osynliga ekosystemet** | Churn-prevention, spaced repetition | Besöksstatistik, aktivitetsspårning, retention-organ | SMS/push-infrastruktur, glömskekurva-algoritm | ⚠️ 35% — datan finns, automation saknas |

---

## TEKNISK ARKITEKTUR — vad som REDAN finns

```
VI HAR REDAN:
├── Python Analysis Engine (Yahoo + MarketStack + Stooq) ← LIVE-DATA-KÄRNA
├── Quiz + XP-system (63 frågor i Graham, +10 XP per rätt) ← BETEENDESPÅRNING
├── AI-chatbot (/api/chatbot) ← KUNSKAPSBAS (inget LLM)
├── RikText-renderare (227 kurser) ← VISUELL ADAPTIVITET
├── Besöksstatistik + retention-organ ← CHURN-DATA
├── Diagnostest (/diagnos) ← STARTPUNKT FÖR PROFILERING
└── AI-organ-styrelse (OrganBus) ← ORKESTRERING

VI BEHÖVER (externa tjänster):
├── LLM-API (OpenAI GPT-4o / Claude / Z-ai) → personligt innehåll, dialog
├── Vektordatabas (Pinecone / Supabase pgvector) → kunskapsatomer
├── Röst-API (ElevenLabs) → ljudsammanfattningar, stress-röst
└── Push/SMS (Twilio / Telegram) → spaced repetition
```

---

## BYGGNATIONSPLAN — konkret och mätbar

### SPRINT 1: F1 Kognitiv profilering (byggbar NU)
- [ ] Utöka /diagnos till interaktivt scenario-spel (10 val → riskprofil)
- [ ] Spara profil i localStorage + Supabase (member-profil)
- [ ] Koppla profil till kursrekommendationer (läroplanen anpassas)
- [ ] Mät: svarstid, ändringar, konfidens → riskaptit-score

### SPRINT 2: F2 Adaptiv motor (UI + logik, AI plugbar senare)
- [ ] DDA: quiz-svar → svårighetsgrad justeras (enkelt: poäng-trösklar)
- [ ] Multimodalt: detektera läsning → erbjuda sammanfattning → övning
- [ ] Personliga analogier: kurskategori → exempel från elevens intresse
- [ ] Live-data injection: Python-motorn → kurs-exempel i realtid

### SPRINT 3: F3 Adversarial AI (rolls-spel + grillning)
- [ ] Sokratisk mod i chatbot: ALDRIG direkta svar, bara motfrågor
- [ ] Scenario-spel: "Centralbanken höjer 50bp — din position faller 14% — vad gör du?"
- [ ] Blankar-mod: AI attackerar elevens tes med motargument
- [ ] Investera-möte-simulering: AI agerar skeptisk styrelseordförande

### SPRINT 4: F4 Osynliga ekosystemet
- [ ] Glömskekurva-algoritm: Ebbinghaus → när skickas repetition?
- [ ] Churn-detektion: inaktivitet > 3 dagar → intervention
- [ ] Micro-frågor via chatbot: "Inflation kom högt — vad händer med obligationer?"
- [ ] Personaliserad motivations-modul vid avhoppsrisk

---

## MÅLGRUPP — båda nivåer

| Nivå | Målgrupp | Vad de får | Pris |
|---|---|---|---|
| **Fas 1** | Nybörjare → medel | AI-profilering, adaptiva kurser, simuler- ingar, quiz, portfölj-analys | GRATIS (rättighet) |
| **Fas 2** | Avancerad → proffs | Personlig AI-mmentor 24/7, Adversarial AI, hedgefond-simulering, certifi- cering | 9 999 kr |
| **Fas 3** | Proffs → expert | Realtids-data, API-åtkomst, metodik-licens, representant-status | 13 999 kr |

**Nyckelinsikt:** Fas 1 lockar massorna med gratis AI-driven utbildning. De som vill ha Adversarial AI-mmentorn och hedgefond-simuleringen betalar för Fas 2. Detta är världens första AI-driven finansutbildning med adversarial inlärning.

---

## KRITISKA BESLUT (behöver grundarens input)

1. **LLM-val:** OpenAI GPT-4o? Claude? Z-ai? → påverkar kostnad/kvalitet
2. **Vektordatabas:** Pinecone ($70/mån) vs Supabase pgvector (gratis)?
3. **Röst:** ElevenLabs ($5/mån start) → för Adversarial röst-meddelanden?
4. **Prioritet:** Vilken sprint först? F1 (profilering) eller F3 (Adversarial)?

---

## WHAT SUCCESS LOOKS LIKE

Elev öppnar kurs → AI känner igen: "Du är visuell, risk-aversion hög, bäst på morgonen" → kursen anpassas → quiz anpassas → fel svar → AI coachar → rätt svar → svårare → trött → ljudsammanfattning → nästa dag → SMS: "Glömde du ROE-formeln?" → klar → certifiering → Fas 2.

**Detta är inte en kurs. Det är en AI-mmentor som utbildar marknadsoperatörer.**
