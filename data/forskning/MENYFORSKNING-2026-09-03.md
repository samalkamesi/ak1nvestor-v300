# MENYFORSKNING 2026-09-03 — Informationsarkitektur för AK1A:s alla menyer

Uppdrag: kundens direktiv — "rätt fin menyn och inga upprepningar, den ska vara smart
och superintelligent och förstå alla klienter, anpassa sig till alla klienters behov…
samma standard hos alla menyer och i telefon lika som via datorn, vertikalt lika som
horisontellt." Detta dokument sammanfattar den forskning/branschbest practice som
styr ombyggnaden av navigationen till ETT register (`src/lib/meny-register.ts`).

---

## 1. Hick's lag — färre val per beslutspunkt

**Fynd.** Beslöstiden ökar (logaritmiskt) med antalet alternativ per beslutspunkt.
Varje extra menyalternativ har ett pris i millisekunder — och priset förvärras när
listan redan är lång (5→6 punkter kostar mindre än 30→31). Motverket är **gruppering**:
kategoriserade menyer håller kognitiva lasten nere samtidigt som totala innehållet kan vara stort.

**Regler för AK1A.**
- R1. Max **4 toppnivåer** i navigationen (LÄRA · ANALYSERA · PRAKTIK · OM AK1A).
- R2. En panel visar **5–11 punkter**, uppdelade i 2–5 avdelare — aldrig en platt lista över 8+.
- R3. Hela menysystemet ≤ **36 länkar totalt** (NN/g-referensbudget för megamenyer: 28–36).

Källor:
- https://www.nngroup.com/videos/hicks-law-long-menus/
- https://dovetail.com/ux/hicks-law/
- https://www.designorate.com/hicks-law-building-usable-navigations/
- https://ux.stackexchange.com/questions/42323/confusions-about-applying-hick-hyman-law-in-user-interface-design

## 2. NN/g om megamenyer — gruppera, men visa varje val ENDAST en gång

**Fynd (Nielsen Norman Group, "Mega Menus Work Well for Site Navigation").**
Megamenyer fungerar när: allt syns samtidigt (igenkänning > återkallelse), alternativen
är **chunkade i relaterade grupper med medelgranularitet** (inte jättestora, inte många
pyttelilla), etiketter är koncisa, frontloaded och deskriptiva — inga påhittade termer,
inga nästan-identiska etiketter. Kritiskt citat: **"Show each choice only once —
duplication confuses users."** Vidare: viktigaste gruppen övre-vänster, hover med
intent-fördröjning (ökna inom 0,1 s efter ~0,5 s stillastående pekare; stäng ~0,5 s
efter att pekaren lämnat), aldrig täck hela skärmen, håll innehållet enkelt (inga
komplexa widgetar/gömd sökning). NN/g:s menychecklist (17 riktlinjer) bekräftar:
samma sak ska inte heta olika i olika menyer — konsekvens mellan ytor.

**Regler för AK1A.**
- R4. **Länk-unikhet:** varje destination får existera exakt EN gång i registret —
  aldrig "Kurser" + "Kursbiblioteket" + "Bokmaster" + "Short-Seller" (alla → kursväsen).
- R5. **Etikettdisciplin:** frontloaded, etablerade ord; förbjud nästan-identiska par
  på samma nivå ("Analyser" vs "Analysera" som TVÅ toppval) — ANALYSERA är sektionen,
  "Analyser" är en punkt med beskrivningen "Rapportbank".
- R6. Desktop-paneler: max-höjd 70vh med scroll (täcker aldrig skärmen), hover-stäng
  180 ms (AK1A:s befintliga värde ≈ NN/g-intent), viktigaste avdelaren först.

Källor:
- https://www.nngroup.com/articles/mega-menus-work-well/
- https://www.nngroup.com/articles/menu-design/
- https://designstack.co.uk/mega-menu-design/ (NN/g-tolkning: 3–4 kolumner, 28–36 länkar)

## 3. Hub-and-spoke — en hubb per innehållsmängd, inga djuplänkar i menyn

**Fynd.** För stora, löst relaterade innehållsmängder fungerar hub-and-spoke bäst:
en central hubbsida från vilken ekrarna (objekten) nås, med stark internal linking
tillbaka. DJUPLÄNKAR till enskilda objekt från huvudmenyn skadar överblicken och
skapar dubbletter (NN/g:s kundtjänstmodell; IxDF:s mobilnavigationsgenomgång).

**Regler för AK1A.**
- R7. `/kurser` är navet för ALLT kursinnehåll — "Bokmaster" (djuplänk till en enda
  kurs) och "Short-Seller" (widget i kursytan) tas bort ur menyn och beskrivs i
  stället i hubbens menytext ("…även Bokmaster & Short-Seller"). Kvar i ⌘K-indexet,
  som är sökens yta — inte navigationens.
- R8. Spegla inte samma länk i flera paneler för "säkerhets skull" — det är den
  upprepning forskningen varnar för.

Källor:
- https://www.nngroup.com/articles/customer-service-model/
- https://ixdf.org/literature/article/show-me-the-way-to-go-anywhere-navigation-for-mobile-applications
- https://terrahq.com/en/blog/a-guide-to-the-hub-and-spoke-content-model-with-examples/

## 4. Task-based IA > audience-based — organisera efter vad klienten ska GÖRA

**Fynd.** NN/g rekommenderar MOT audience-baserad navigation ("Nybörjare"/"Pro"/
"Studerande"): den tvingar användaren att klassificera sig själv (kognitiv friktion),
fungerar dåligt när man tillhör flera grupper och bryter när etiketten är oklar.
Task/topic-baserad IA — gruppera efter användarens mål och arbetsflöde — är den
hållbara strukturen och håller över tid (intranät-trendstudier; UX-undersökningar).

**Regler för AK1A.**
- R9. Fyra sektioner speglar elevens arbetsflöde: **LÄRA** (ta sig in i ämnet) →
  **ANALYSERA** (verktygsflödet grund → skannar → fördjupning → portfölj) →
  **PRAKTIK** (daglig träning, progression) → **OM AK1A** (förtroende & handel).
- R10. Inga målgruppsspår i menyn ("Nybörjare", "Pro-spår") — anpassning sker i
  stället via publik-nivå + personliga chips (se §6), aldrig via ännu en kolumn.

Källor:
- https://www.nngroup.com/articles/audience-based-navigation/
- https://www.nngroup.com/articles/intranet-information-architecture-ia/
- https://ux.stackexchange.com/questions/4855/when-should-you-use-task-based-navigation-over-topic-based-navigation

## 5. Mobil drawer — tumzon, accordion, progressive disclosure

**Fynd.** Fullskärms-drawer är rätt mönster för sajtmenyer i mobil, men: primära
interaktioner ska ligga i **tumzonen** (undre ~40–50 % av skärmen), tryckytor ska
vara generösa (≥44–48 px; accordion-rubriker med minst ~12 px vertikal padding och
16–18 px text), sök längst upp (16 px text mot iOS auto-zoom), och långa listor
fälls ut med **accordion/progressive disclosure** så att översikten alltid syns.
Endast en grupp öppen i taget håller vyn kort och förutsägbar.

**Regler för AK1A.**
- R11. Mobil-drawern = samma 4 sektioner som desktop, som **vertikal accordion**
  (endast en öppen åt gången; sektion som innehåller aktiv sida öppnas automatiskt).
- R12. Raderna ≥48 px (py-3.5 + 16 px titel), sökfältet överst (text-base),
  status-CTA (inloggning) LÄNGST NER i tumzonen.
- R13. Horisontell mobil (915×412): drawerns max-w-lg + overflow-y-auto ser till
  att innehållet scrollar lodrätt istället för att svämma över — inga fasta
  höjder som antar porträtt.

Källor:
- https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/
- https://www.uxpin.com/studio/blog/mobile-navigation-examples/
- https://www.poper.ai/blog/mobile-accordion-design/
- https://uxplanet.org/one-handed-use-of-tab-bar-bottom-navigation-best-practices-for-reachability-73376377444b

## 6. Adaptiva menyer — recency/frekvens + åtkomst, aldrig omordning

**Fynd.** Studier av anpassningspolicyer i menyer visar att användare föredrar
**recency-/frekvensbaserad** prioritering (senaste/frekvent använda först) framför
omordning eller döljande av basnavigation; förutsägbarhet är kärnan — positioner
ska inte flyttas om. Åtkomstbaserad synlighet (visa medlem/fas-ytor först när
behörighet finns) är välkommet progressiv avslöjande: gästen slipper döda val,
medlemmen slipper filtrera.

**Regler för AK1A ("superintelligent"-delen).**
- R14. Registret bär `publik: gast | medlem | fas2 | admin` per punkt; ALLA meny-
  ytor filtrerar med samma funktion — gäst ser aldrig fas2/admin-ytor, medlem
  ser medlem-ytor, admin ser allt.
- R15. Personlig anpassning = "Fortsätt"-chip (recency ur navigationsminnet) +
  XP/nivå/streak-chips + publik-filter. Basnavigationens ordning är IDENTISK för
  alla — intelligensen ligger i tilläggen, aldrig i omstökning.
- R16. SSR-rendering visar gast-vyn; hydrering utökar till medlem/fas/admin —
  samma mönster som befintlig InloggadKnapp (ingen hydration-krock).

Källor:
- https://www.engineegroup.com/articles/TCSIT-8-162.php (recency-frequency föredras)
- https://www.humanfactors.com/newsletters/adaptive_menu_design.asp
- https://scholarsarchive.byu.edu/etd/3536/
- https://userpilot.com/blog/navigation-ux/ (progressive disclosure)

---

## Topp 5-reglerna (sammanfattning)

1. **4 toppnivåer, ≤36 länkar totalt, 5–11 punkter per panel i avdelare** (Hick + NN/g).
2. **Varje destination exakt en gång i hela registret** — dölj inte dubbletter, ta bort dem (NN/g).
3. **Task-based struktur efter elevens flöde** — aldrig audience-spår (NN/g).
4. **Hub-and-spoke:** `/kurser` är kursnavet; inga objekt-djuplänkar i menyn (NN/g/IxDF).
5. **Mobil: accordion + tumzon-CTA + 48 px-rader; samma register som desktop** (Smashing/UXPin).

## Diagnos av gamla menyn (vad forskningen ogillar)

| Problem | Var | Forskningsbrott |
|---|---|---|
| "Alla kurser" + "Bokmaster" (djuplänk till EN kurs) + "Biblioteket" i samma panel | Lär-panelen | R4, R7 (dubletter + djuplänk) |
| "Repetera" → /min-sida OCH "Min Sida" → /min-sida i samma vy | Träna-panelen | R4 (samma länk två gånger) |
| "Short-Seller" → /kurser plus "Alla kurser" → /kurser | mobil Träna | R4, R7 |
| "Medlemskap", "Blogg", "Fas 2" i Träna-panelen (9 punkter, blandade uppgifter) | Träna-panelen | R2, R9 (task-blandning) |
| /profil listad som BÅDE "AI-Diagnos" och "Kognitiv profil" | sökindex | R5 (nästan-identiska etiketter) |
| SPA-drawern: "Sektioner" + "Mer" (samma sektioner igen) + "Fler sider" (Kurser tredje gången) | header.tsx mobil | R4 (Kurser ×3 i samma vy) |
| "Analyser" (SPA-sektion) vs "Analysera" (panel) vs "Superanalysen" oklar hierarki | startsidan | R5 (kundens "varför analys som huvudanalys?") |
| 12 rader i Analysera-panelen med portföljverktyg utspridda i 3 grupper | huvudmeny | R2 (portfölj-gruppering saknades) |

## Nya IA (implementerad i src/lib/meny-register.ts)

- **LÄRA 🎓** — Läroplanen · Alla kurser (hub, "även Bokmaster & Short-Seller") · Biblioteket · Labbar · Certifikat
- **ANALYSERA 🔬** — *Grundanalys:* Kalkylatorn, Vågfundamentet · *Skannar:* Konfluensradarn, Net-net-skannern, Nyhetscentralen · *Fördjupning:* Superanalysen, Analyser (rapportbank) · *Portfölj & profil:* Portföljbyggaren, Min portfölj, Portföljforskning, Kognitiv profil
- **PRAKTIK 🎯** — Min Sida (medlem) · Dagens Pass · Topplistan · Badges & meriter · Fas 3-certifiering (medlem)
- **OM AK1A 🏛️** — Manifestet · Medlemskap · Prenumeration · AK1A PRO · Bloggen · Om oss · Fas 2-ansökan (guld-CTA) · (Logga in endast footer/⌘K · Dina rapporter = fas2 · Admin = admin)

Borttaget/omflyttat: Bokmaster-djuplänken, Short-Seller-menyposten, "Repetera"-dubletten,
AI-Diagnos-dubletten, "Mer"-listan i SPA-drawern, FLER_SIDER-listan, medlemskap/blogg ur
Träna, Manifestet+Certifikat behöll sina rätta sektioner. Totalsumma: 27 länkar.
