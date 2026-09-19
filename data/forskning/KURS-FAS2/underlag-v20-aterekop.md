# V20 — Återköp av egna aktier (Kapitalstruktur, 6 % vikt)

Underlag till Fas 2-fördjupningen · våg 199 · 2026-09-19
Kursreferens: slug `v20-aterekop-egna-aktier` · Modell: AKM1 V20

## 1. Vad indikatorn innebär i praktiken

Återköpen mäter **om bolaget köper tillbaka sina egna aktier — och med
vilken kraft**: aktieantalets förändring. Återköp och nyemissioner är
samma mynts två sidor: köper bolaget tillbaka ägs mer av kvarvarande
ägare per aktie (alla nyckeltal per aktie stiger mekaniskt); emitterar
det, späds ägarna ut. Indikatorn ligger i kategorin Kapitalstruktur —
den handlar om hur vinsten förs tillbaka till ägarna.

## 2. Läsa det i en faktisk årsredovisning

1. **Not om eget kapital / antal aktier:** aktieantalet vid årets
   början och slut — differensen ÄR indikatorn (modellens fält:
   `aterkop.andelUtestande`, minskning som decimal, 0,02 = 2 %).
2. **Not/kommentar om återköp:** belopp, programmandat, genomfört under
   året (modellens reservfält `aterkop.senasteArMdr`).
3. **Insiderköp:** VD/styrelseköp redovisas hos
   Finansinspektionen/aktieägartjänster — kompletterande observation
   (`aterkop.insiderkopSenaste6man`).
4. **Optioner och personalprogram i egenkapitalnoten:** utspädning
   från program kan äta upp återköpen — nettoändringen i
   aktieantalet är det enda ärliga talet.
5. Kontrollfråga: återköpsbeloppet är *volym* — andelen av
   aktieantalet är *verkning*. Poängen kräver verkan.

## 3. Räkneexempel på riktiga bolag (ur universumets 195)

Datakontraktets läge (källa: `bolagsunivers.json`, hämtat 2026-09-03):
`andelUtestande` och återköpsbelopp är tomma hos samtliga —
`insiderkopSenaste6man` är ifyllt hos 108 bolag, flest:

| Bolag | Insiderköp 6 mån | AKM1-poäng (reservgren) | Not |
|---|---|---|---|
| Apple | 10 | 2 | återköper i verkligheten stort — fältet saknar andelen |
| Microsoft | 6 | 2 | dito |
| övriga 106 | 0 | osatt | ingen gren träffar |

**Datavaktens läxa i praktiken:** Apple och Microsoft hör till
marknadens största återköpare, men eftersom kontraktet saknar
aktieantalsändringen träffar reservgrenen "insiderköp ≥ 3 ⇒ 2" —
poängen **underdriver** det verkliga återköpsvärdet. Det är inte
modellens fel; det är kontraktets gräns, och det är precis därför
modellen dokumenterar sina reservgrenar i motiveringstexterna. För
handläggning: läs aktieantalsdiffen direkt ur egenkapitalnoten när
årsredovisningen finns — då sätts huvudkurvan, inte reserven.

## 4. Kritiskt tänkande — fällor

- **Återköp till vilken kurs?** Att köpa tillbaka över inre värde
  överför värde från kvarvarande ägare till såljare — återköp är
  värdeskapande endast under värderingen (koppla V04/V05).
- **Optionsutspädning äter återköp:** bruttoåterköp kan vara netto
  noll — nettoändringen i aktieantalet är domstolen.
- **Insiderköp är en svagare signal:** små absoluta belopp, och
  insiderköp "≥ 3" kan vara schablonmässiga planpjässer — kolla
  belopp per köp.
- **Cykel-återköp** (toppens överskott) köper dyrt; de bästa
  återköpen sker när kursen är pressad och bolaget har kassan —
  modellens poäng säger hur mycket, inte hur klokt.
- **Skuldfinansierade återköp** höjer V10:s skuldsättningsgrad —
  läs V20 alltid tillsammans med V10 och V19 (kassatäckningen).

## 5. Koppling till AKM1 — modellens trösklar

Ur kärnan (`scorV20` — rak, dokumenterad tröskel på aktieantalets
ändring):

| Aktieantalets ändring/år | Poäng |
|---|---|
| minskning ≥ 5 % | 5 |
| minskning ≥ 3 % | 4 |
| minskning ≥ 1,5 % | 3 |
| minskning > 0 men < 1,5 % | 2 |
| 0 % (inget av det) | 1 |
| ökning (utspädning) | 0 |

**Reservgrenar när andelen saknas** (dokumenterade i kärnan):
återköpsbelopp > 0 utan andel ⇒ 3 (mittskikt) · insiderköp ≥ 3 ⇒ 2
(kompletterande observation) · nyemissioner utan återköp ⇒ 0
(utspädning) · inget av detta ⇒ osatt. Andel > 1 (procent i stället
för decimal) vägras som utom intervall — osatt, inte fel.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
