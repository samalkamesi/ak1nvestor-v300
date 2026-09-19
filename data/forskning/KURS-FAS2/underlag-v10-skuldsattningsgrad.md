# V10 — Skuldsättningsgrad (Stabilitet, 6 % vikt)

Underlag till Fas 2-fördjupningen · våg 197 · 2026-09-19
Kursreferens: slug `v10-skuldsattningsgrad` · Modell: AKM1 V10

## 1. Vad indikatorn innebär i praktiken

Skuldsättningsgraden mäter **balansen mellan lånade och ägarpengar i
bolaget**: skulder och övriga förpliktelser ÷ eget kapital. 1,0× betyder
att banken och ägarna finansierar hälften var; 0,5× att ägarna står för
två tredjedelar.

Varför en hel indikator för det? För att skulden är **cykelns förstärkare
i båda riktningarna**:

- I uppgång: lånad krona som tjänar mer än räntan lyfter ROE (se V09 —
  därför beräknas V10 FÖRE V09 i modellen, som hävstångskontroll).
- I nedgång: samma lån är en fast kostnad som måste betalas även när
  affären sviker — skulden bestämmer hur djupt ett bolag kan falla.
- Skuldsättningsgraden är alltså inte "bra lågt, dumt högt" utan ett
  **riskmått**: hur stor del av bolagets struktur som är okänslig för
  hur affären går (banken får betalt före ägaren, alltid).

## 2. Läsa det i en faktisk årsredovisning

1. **Eget kapital:** balansräkningens "Summa eget kapital" (inkl.
   minoritetsintresse i koncernen — annars blir graden missvisande).
2. **Skulder och övriga förpliktelser:** "Summa skulder och övriga
   förpliktelser" — hela posten, inte bara de räntebärande (graden mäter
   balansstrukturen; för EV-räkningar används de räntebärande, se V06 —
   olika frågor, olika delar av skulderna).
3. Räkna: Summa skulder ÷ Summa eget kapital.
4. Kolla **räntetäckningsgraden** i noten om finansiella poster (rörelse-
   resultat ÷ finansiella kostnader) — graden säger hur mycket lån,
   räntetäckningen hur lätt de bärs.
5. Kontrollfråga i **förvaltningsberättelsen:** finns kända
   återbetalningsprofiler/refinansieringsdatum de närmaste åren?

## 3. Räkneexempel på riktiga bolag (ur universumets 195)

Skuld/EK (källa: bolagsunivers.json, hämtat 2026-09-03; universum-
medianen 0,52×):

| Bolag | Skuld/EK | AKM1-poäng | Bild |
|---|---|---|---|
| Nintendo | 0,00 | 5 | skuldfri kassamaskin |
| Beiersdorf | 0,01 | 5 | i princip skuldfri |
| Evolution | 0,02 | 5 | utdelar överskottet |
| Industrivärden | 0,03 | 5 | förvaltning med kassabuffert |
| Alfa Laval | 0,46 | 5 | konservativ industri |
| Volvo B | 1,47 | 3 | finansieringsbolag i gruppen |
| Boeing | 7,91 | 1 | krisbelånat |
| Simon Property | 5,04 | 1 | fastighets-/REIT-struktur |
| Mastercard | 4,40 | 1 | medveten belåning |

**Träningssekvens:** skuldfria kassamaskiner som Nintendo/Evolution/
Beiersdorf (0,00–0,01×) har EN struktur som tål vad som helst — men fråga
alltid vad skuldfriheten
KOSTAR (outnyttjad hävstång är avkastning som lämnas på bordet när
affären är starkare än räntan). Volvo 1,47×: lastbilsgruppen bär en
finansieringsrörelse (kundkrediter) som mekaniskt lyfter graden — inte
samma risk som 1,47× ren driftsskuld. Boeing 7,91×: det som händer när
cykeln och krisen träffar samman. Samma siffra betyder olika saker —
noterna avgör.

## 4. Kritiskt tänkande — fällor

- **Negativt eget kapital ⇒ osatt.** Är EK under noll saknar graden
  mening (modellen sätter osatt, inte 0 — ett dokumenterat val: negativ
  nämnare ger ingen ranking). Kolla alltid EK-tecknet FÖRE du delar.
- **Banker och finansbolag:** deras balansräkning ÄR skulder (inlåning)
  — graden blir 8–15× av struktur, inte av misstag. Universumet lämnar
  dem osatta; jämför banker med kapitaltäckningsmått istället.
- **IFRS 16:** leasingåtaganden är numera skuld i balansräkningen —
  bolag med stora butiks-/flygplansleasingar "förvärrades" mekaniskt
  2019. Jämför aldrig över övergången utan not.
- **Räntan på skulden avgör bärigheten:** 3× till 2 % ränta kan vara
  lugnare än 1,5× till 8 % — komplettera alltid med räntetäckning och
  löptid.
- **Skuldfrihet är inte gratis i alla lägen:** ett starkt lönsamt bolag
  som vägrar låna när räntan ligger under dess avkastning underpresterar
  mot sin potential — därför är V10 ett riskmått (0,5×-gränsens
  5-poäng) och inte en dygdens medalj.

## 5. Koppling till AKM1 — modellens trösklar

Ur kärnan (`raknaV10`, rak linjär tröskel ur kalkylatorn):

| Skuld/EK | Poäng |
|---|---|
| < 0,5× | 5 |
| 0,5–1× | 4 |
| 1–2× | 3 |
| 2–3× | 2 |
| ≥ 3× | 1 |
| negativt EK | osatt |

Exempel ur tablån: Evolution 0,02× → 5 · Alfa Laval 0,46× → 5 (medianen
0,52× hamnar alltså precis under 4-poängsstrecket) · Volvo 1,47× → 3 ·
Mastercard 4,40× → 1 · Boeing 7,91× → 1. Och nyckelkopplingen: **V10
beräknas FÖRST i kärnan** — dess värde är hävstångskontrollen som avgör
om V09:s ROE får ge toppoäng (skuld/EK ≤ 2 krävs för 5 p). Två
indikatorer, en dom — det är modellens sätt att lära ut att avkastning
och risk aldrig läses var för sig.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
