# DESIGN v167 — FAS 2-ÖVNINGSKAPITELEN (V01–V20)

Grundat rond 181 [organ:Φ] på V167-KARTA.md (cc6ed6c8), struktursonder
verktyg/_v167-sond{1..5}.mjs och PIPELINE-KO rad 367 (v159:s
indikatorunderlag → V01–V20, v166:s designmönster).

**Mål:** v159:s 20 indikatorunderlag (data/kurser/fas2-djup/
indikatorer-{01-10,11-20}.md) binds till variabelkurserna V01–V20 i
`public/deep-courses.json`. V200 integrerade redan underlagens a–e som
kompakta kapitel 7–11 (à 3 min, ~1 000–1 500 tecken) med v203:s
utmaningar — det som SAKNAS i kurserna är underlagens **d) fulla
räkneexempel** (steg för steg med NorrTeknik-talen) och **f) tre
övningsfrågor med facit**. v167 levererar dem som ett avslutande
övningskapitel per kurs.

## Designdom: ETT övningskapitel 12 per V-kurs

Titel: **"Från teorin till egen räkning"** (num = 12, minutes 7–9).
Underlagets sektioner mappas på kursens etablerade blocktyper:

| Underlagets sektion | Block |
|---|---|
| a) vad indikatorn mäter (kärnan) | `intro` (2–3 meningar) + inledande `text` |
| d) räkneexempel NorrTeknik | `text` med steg+talen ORDAGRANT + konstruerad-bolag-deklaration |
| f) övningsfrågor 1–3 | `utmaning` (frågorna ordagrant; journal-inramning: svara skriftligt FÖRE facit) |
| f) facit med motiveringar | `text` (faciten ordagrant) |
| e) fallgropar | `text` (kompakterad påminnelse — kap 10 bär fallen) |
| ekosystemkoppling | `insikt` (kap 11:s AKM1-trösklar + nyckeltalsguiden + AKM2-vittnet + AI-Mentorn + portföljmotorn) |

Blockstruktur: `text, utmaning, text, text, insikt` (5 block).

## Kontrakt per kurs (mekaniskt verifierbart)

1. `chapters` appendas med kapitel 12; `chapterCount` 11→12;
   `totalMinutes` = Σ kapitelminuter (V01: 44→52 vid minutes 8, etc.).
2. **Quiz = 3** i format `{q, alternativ[4], ratt, tips}` — påståendeform
   om metoden (V-kursernas kap 1–6 bär 3 var; kap 7–11 saknar quiz —
   kontraktet tillåter båda, det nya kapitlet följer kap 1–6:s mönster).
3. **chapters_list RÖRS EJ** — sonderad ofullständig (8 poster för 11
   kapitel i v09, historisk v200-artefakt) och utan renderarkonsument
   (endast typdefinitioner i src/lib/content.ts + deep-courses-data.ts
   och regeneratorn som bygger om den); röra den vore icke-append-only.
4. Filformat: ren `JSON.stringify(x, null, 2)` + slutecken (bevisat av
   sond 4/5: 20 814 286 tecken bitidentiska rondtrip) — append-skriptet
   BÄR formatvakt (rondtrip-fail ⇒ avbryt, d13-mönstret).
5. **Befintliga kapitel 1–11 + chapters_list bit-identiska** (append-only;
   KVD mäter mot `commit~1`, ALDRIG HEAD — v166:s mätfelsläxa).
6. JURIDIKGRIND (2007:528): underlagets deklaration "Utbildningsmaterial —
   beskriver hur metoden läser och räknar; inga investeringsråd (2007:528)"
   ORDAGRANT i kapitlet; NorrTeknik är påhittat bolag (underlagets egen
   deklaration "låtsas-årsredovisningen … (påhittat bolag)" överförs);
   inga köp/sälj-formuleringar; varumärkesgrind (data/varumarke.json) 0
   träffar; inga blandade lagrum (2022:260/261, 1985:716, 2022:482,
   2005:59).
7. R2 orörd: inga pris-, tier- eller publiceringsändringar.
8. ai-mentor-register.ts ("kapitel: 11, minuter: 44") lämnas orörd denna
   våg — registret är AI-Mentorns inventory (kedjevakten 193/193 mäter
   mot det); harmonisering av registrets kapiteltal = separat våg.

## Leveransarkitektur — fragmentmönstret (v203, BEVISAT)

`public/deep-courses.json` (20,8 MB) är DELAD av 495 kurser — fabriksbarn
får ALDRIG skriva den direkt (filägarskapsregeln). Istället:

1. **Fabriksmanifest, 20 uppgifter** (en per V-kurs): varje barn skriver
   ENDAST `data/forskning/KURS-FAS2/v167-fragment/<slug>.json` med
   kapitelobjektet `{num, minutes, title, intro, blocks, quiz}` + kör
   EGEN kontroll (quiz-format, deklarationer, talmarkörer mot underlaget)
   + LEVERANS-rad. Granskningsfilen V167-GRANSKNING.md rörs EJ av barnen
   (huvudagenten äger — v166:s dubbelarbetesrot kuras här: läget
   uppdateras VID LEVERANS, inte först vid granskning).
2. **Huvudagentens atomära integration**: läsa samtliga 20 fragment →
   appenda i JSON under ETT skript med formatvakt → KVD per kurs →
   commit med pathspec → push. Bygge behövs EJ (data-väg: API-rutten
   src/app/api/kurs/[slug]/route.ts läser filen från disk per anrop).

## KVD per kurs (huvudagentens emottag)

JSON-parse (hela filen) ✓ · chapterCount == len · totalMinutes == Σ ·
quiz=3 + format + unika ratt-lägen · blockstruktur enligt tabellen ·
talmarkörer från underlagets d+f ≥ 80 % (överföringsbevis) · kärntal
(från d-exempel + f-facit) · deklarationer ordagrant · varumärkesgrind
0 · inga blandade lagrum · append-only mot commit~1 · chapters_list
orörd.

## Sekvens och ägarskap

- Manifestet släpps till ko/ först EFTER design-pushen landat (rond 167:s
  sekvensregel) — push-kedjan är grön sedan v166-stängningen (d972dbf2).
- Ägarskap: v167-utförande = agentfabriken via detta manifest + studions
  atomära emottag (NOTIS d22:s arbetsfördelning: parallella sessioner
  avstår från direkt-append i deep-courses.json under vågen).
- Modellroutning: barnen körs på GLM-5.3-Flash (formattrogen
  transformering av granskade underlag), design/KVD/emottag = GLM-5.3.

## Beslut

Design FASTSTÄLLD rond 181 [organ:Φ] enligt kundprioritet 3 (kursdjup:
räkna på riktiga — här låtsas-redovisningens — material, facit och
kritiskt tänkande). Manifest: 20 uppgifter, omgångar om 3 (7 omgångar),
fragmentfil per kurs.
