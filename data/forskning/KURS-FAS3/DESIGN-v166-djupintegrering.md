# DESIGN v166 — FAS 3-DJUPINTEGRERING (granskad och fastställd rond 174 [organ:Φ])

**Mål:** v164:s 24 granskade djupunderlag (f01–f24, 171 kontroller, se
GRANSKNING-v164-del1/2/3.md) binds in i respektive Fas 3-kurs i
`data/bokmaster/<slug>.json`. ALLA 24 kursposter är redan byggda (14–20
kapitel) — detta är integrering, inte nybygge.

## Designdom (rond 174): ETT avslutande djupkapitel per kurs

Varje kurs får **exakt ett nytt kapitel** sist: "Från boken till egen
analys" (num = befintligt max + 1). Underlagets fem sektioner mappas på
kursens etablerade blocktyper (bevisade i ak1ts-vaglarans-hierarki:
text, insikt, utmaning, tabell, visuell):

| Underlagets sektion | Block i djupkapitlet |
|---|---|
| 1. Kärnan | `intro` (2–3 meningar) + inledande `text` |
| 2. Praktisk läsning | `text` (konkreta steg) |
| övningen i sektion 2 | `utmaning` (journal/papper-formuleringen) |
| 3. Räkneexempel | `text` med EXAKT underlagets exempel + tabell där underlaget bär tabell (f22-stil) — källmärkta eller deklarerat konstruerade tal ÖVERFÖRS ORDAGRANT, inga nya tal hittas på |
| 4. Fallgropar | `text` (kompakterad) |
| 5. Ekosystemkoppling | `insikt` (mentorn/Fas 2-kopplingen) |

- **Quiz: 3 frågor** per kapitlet (kontrakt: quiz = kap × 1 = 3 st) i
  format `{q, alternativ[4], ratt, tips}` — alternativen formuleras som
  påståenden om metoden, ALDRIG handlingsråd.
- **minutes: 11–14** beroende på innehållsmängd (flaggskeppets median är 11).

## Kontrakt per kurs (mecaniskt verifierbart)

1. `chapters` appendas; `chapters_list` appendas med `{num, title, minutes}`.
2. `chapterCount` = len(chapters) efter append; `totalMinutes` = Σ
   kapitelminuter (vakten kontrollerar båda — konsistensbrott = RÖD).
3. JSON giltig; befintliga kapitel/rutor/fält RÖRS EJ (append-only).
4. Texter på svenska; kursernas befintliga röst och terminologi följs
   (underlagen skrevs i samma spår — harmonin är verifierad i v164).
5. JURIDIKGRIND (2007:528): räkneexempel bär underlagets käll- eller
   övningsdeklaration ORDAGRANT; inga avkastningslöften; inga
   köp/sälj-formuleringar; varumärkesgrindens fraser (data/varumarke.json).
6. R2 orörd: inga pris-, tier- eller publiceringsändringar; kurserna
   förblir låsta enligt kurs-access ("under byggnation — kommer snart").

## KVD per uppgift (fabriksbarnens leveransvillkor)

- Mekanisk efterkontroll (granskningsverktyg, skrivs rond 175):
  JSON-parse ✓ · chapterCount == len(chapters) · totalMinutes == Σ ·
  quiz = 3 i nya kapitlet · varumärkesgrind 0 träffar på Nya blocket ·
  blockstrukturen enligt tabellen · underlagets talmarkörer ≥ 80 %
  närvarande i kapitlet (överföringsbevis).
- tsc 0 (projektbinär — ingen src-ändring: data-vägen, INGET bygge).
- Commit med explicit pathspec + LEVERANS-kvitto.

## Manifestplan (släpps först när push-kedjan landat — sekvensregeln)

`manifest-v166-fas3-djupintegrering.json`, 24 uppgifter (en per kurs,
exklusivt filägarskap: endast `data/bokmaster/<slug>.json` + ev.
verktygsfil), prompts bär: läs `data/forskning/KURS-FAS3/underlag-fXX-*.md`
+ denna design + befintlig kursstruktur; append-only-regeln; KVD-listan;
juridikgrind; commit-regel. Modellmässigt: GLM-5.3-Flash räcker (format-
trogen transformering) — arkitektur/pedagogik står designen för.

## Beslut

Design FASTSTÄLLD rond 174 [organ:Φ] enligt kundprioritet 3 (kurs-
djup: räkna på riktiga bolag, kritiskt tänkande — inte bokrecensioner).
Manifest skrivs och släpps till ko/ först efter att push-kedjan
(mimosa-härd + v164-stängning) landat i prod — annars svälter pushen
bakom fabriksomgångar (rond 167:s sekvensregel).
