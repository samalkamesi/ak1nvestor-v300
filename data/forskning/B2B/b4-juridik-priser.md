# B4 — Juridik och priser för B2B-lanseringen (/pro)

**Datum:** 2026-09-04 · **Uppdrag:** Vad gäller juridiskt när AK1A säljer forskningsverktyg till reglerade rådgivare, vad kräver GDPR för klientdata, och hur ska prismodellen se ut? · **Underlag:** data/portfolj-system/priser.json (privat 249/449/799 kr/mån), src/app/pro/page.tsx (499/1 499/4 999 kr/mån/seat), data/rapporter/forskning-b2b.md (2026-09-01), src/app/villkor/page.tsx (12 sektioner, konsumentfokus), src/app/privacy-policy, src/app/transparens, webbforskning med källor nedan. · **Beslutanderätt:** prisnivåer och avtalsslut hos kundägaren — detta är underlag.

**Kärnslutsats:** AK1A kan sälja /pro som verktygs-/forskningsleverantör till reglerade rådgivare utan FI-tillstånd — rådgivaren är och förblir den reglerade parten, lämplighetsansvaret är hennes och kan inte avtalas bort (ESMA). Men tre saker SAKNAS innan lansering: (1) separata B2B-villkor (dagens villkor är konsumenträttsliga), (2) personuppgiftsbiträdesavtal DPA enligt GDPR art 28, (3) uppdaterat behandlingsregister + publicerad underbiträdeslista. Prismässigt är transparent flat per seat rätt modell — bekräftat av både marknadsforskning (AUM-prissättning är branschens stötesten) och compliance (oberoende rådgivare får inte ta emot tredjepartsersättningar).

---

## DEL 1 — B2B-regulering: verktygsleverantör vs rådgivningsleverantör

### 1.1 Utgångsläget (etablerat i forskning-b2b.md del 4, bekräftas av nya sökningar)

- **Investeringsrådgivning = personliga rekommendationer** enligt LVF (2007:528)/MiFID II. AK1A:s metodik-utdata är generisk (samma vågklass för samma data, oavsett läsare) och riktar sig inte till en namngiven slutklients ekonomi → inte personliga rekommendationer. ESMA:s uppdaterade vägledning om rådgivningsbegreppet (supervisory briefing, vidareutveckling av CESR/10-373 Q&A): **substansen avgör, inte etiketten** — "detta är inte rådgivning"-disclaimers flyttar inte en tjänst som i sak lämnar personliga rekommendationer. Vårt skydd är därför *designen* (generisk utdata), inte disclaimer-texten i sig.
- **Att sälja prenumerationsverktyg till reglerade rådgivare kräver inget tillstånd** från Finansinspektionen. Rådgivaren (värdepappersinstitutet) svarar för sin rådgivning och sin lämplighetsprövning — oavsett leveranssätt (ESMA:s lämplighetsriktlinjer ESMA35-43-3172 gäller "firman", dvs. rådgivaren, i full utsträckning även vid digitala/verktygsstödda processer).
- **Oberoende rådgivning = förbud att ta emot/behålla tredjepartsersättningar** (FI, Reglerna i korthet; MiFID II). Konsekvenser för AK1A: (a) vi betalar aldrig remunerations-/referral-avgifter till rådgivare, (b) vår faktura mot rådgivaren ska vara transparent flat-fee — aldrig rev-share kopplad till klientens affärer eller AUM.
- **Svensk avtalsrätt B2B:** konsumentlagarna (2022:260, 2022:261 om digitalt innehåll) gäller INTE mellan näringsidkare. B2B = avtalsfrihet, med 36 § avtalslagen (oskäliga villkor) som spärr; EU:s Data Act inför kommande krav på skäliga villkor i vissa B2B-dataavtal. Dagens /villkor (ångerrätt, 90-dagarsgaranti, konsumenttvistlösning) är byggda för konsumentledet — **/pro behöver egna B2B-villkor**.

### 1.2 White-label-rapporter: disclaimer-krav (tre lager)

1. **AK1A-lagret (skyddar oss):** varje exporterad rapport bär en mal-låst metod- och ansvarsdeklaration — "framtaget med AK1A-metodiken; pedagogisk analys/forskning, ej personlig rekommendation från AK1A; rådgivaren svarar för sin rådgivning och lämplighetsbedömning". White-label ändrar logo/färger/kolofon men kan aldrig radera detta block (redan designregel i pro-sidans mallar).
2. **Rådgivarlagret (skyddar inte oss — skyddar rådgivaren):** ESMA är tydlig med att en rådgivare inte kan friskriva sig från lämplighetskraven genom disclaimer. Vår mall bör därför INTE innehålla formuleringar som inbjuder rådgivaren att skjula ansvaret på AK1A ("verktyget har valt") — det vore att stödja bypass av hennes regler. Rätt ton: verktyget levererar analysunderlag; rådgivaren fattar och motiverar beslutet.
3. **Data/t.o.m.-lagret:** data-t.o.m.-deklaration och falsifierbarhetsrad (metodens hårda regel 5) förblir mal-låsta — de är både varumärke och ansvarsskydd.

### 1.3 Tre ringar-riskbilden (forskning-b2b 4.2 gäller fortfarande)

Producent (låg risk) · verktygsleverantör till rådgivare (medel — white-label ändrar dokumentets avsändare, motverkat av mal-låst deklaration + B2B-villkors klausul om rådgivarens eget institutansvar) · forskningsleverantör till förvaltare (låg-medel — faktura per seat/år underlättar deras MiFID-forskningsbudgetering; 2024 års MiFIR-översyn mjukat joint payments; undvik success fee).

---

## DEL 2 — GDPR för klientdata: rådgivaren ansvarig, AK1A biträde

### 2.1 Rollfördelningen

- **Rådgivaren = personuppgiftsansvarig** för sina klientuppgifter hon laddar in i /pro. **AK1A = personuppgiftsbiträde** — vi behandlar enbart på hennes räkning och instruktioner. Detta gäller redan när en enda klientportfölj med identifierbara uppgifter passerar systemet.
- **DPA är tvingande (art 28.3):** den ansvarige får bara anlita biträden som ger tillräckliga garantier, och relationen ska regleras i **skriftligt avtal**. Utan DPA på plats är varje behandling av rådgivarens klientdata en överträdelse — för båda parter. IMY:s vägledning: biträdet ska kunna *visa* att art 28 följts.

### 2.2 DPA-mallen — minimuminnehåll (art 28.3, punkt för punkt)

1. **Ändamål + instruktioner:** behandling enbart för att leverera /pro-tjänsten, enligt rådgivarens dokumenterade instruktioner; AK1A meddelar om instruktionen bryter mot GDPR.
2. **Konfidentialitet:** personal med åtkomst är sekretessbelagd/tränad.
3. **Tekniska/organisatoriska åtgärder** (art 32): kryptering i vila/transit, åtkomstkontroll, loggning.
4. **Underbiträden (sub-processors):** aktuell lista (se 2.4), förhandsgodkännande eller anmälan med invändningsrätt, samma förpliktelser flödar nedåt (EDPB).
5. **Registrerades rättigheter:** AK1A stödjer rådgivarens svar på tillgång/rättelse/radering m.m.
6. **Radering/återlämnande** vid avtalsslut — definiera vad som gallras när (t.ex. portföljdata raderas 30 dagar efter uppsägning).
7. **Revisionsrätt:** rådgivaren (eller revisor) får granska; documentation av åtgärder på begäran.
8. **Tredjelandsöverföring:** ingen utan rådgivarens skriftliga godkännande + lämplig mekanism (EU-standardklausuler). Niätta: välj EU-region i leverantörspanel från dag 1.
9. **Ansvarsfördelning** vid skada (art 82) + meddelande av personuppgiftsincident till rådgivaren utan dröjsmål (art 33-flöde: AK1A → rådgivare → IMY).

### 2.3 Dataminimering i design (byggs, inte skrivs)

- **CSV-regeln (hård):** import = instrument + vikt/antal — aldrig personnummer, namn eller skuldlistor. Designregeln från forskning-b2b 4.2 blir GDPR-artikel 5.1 c i praktiken.
- **Cockpit-pseudonym:** rådgivarens klientvy visar klient-ID/etikett ("Klient A-12"), inte namn — om namn inte behöver passera AK1A:s system ska de inte göra det. Pseudonymisering är dessutom art 32-säkerhetsåtgärd.
- **Rapportutdata:** PDF:en bär metodik-utdata (klasser/poäng/grindstatus), inte rådata-serier — minimerar både GDPR- och data-redistribution-exponeringen.
- **Befintlig policy-gap:** nuvarande integritetspolicy/villkor sektion 11 beskriver endast konsumentledet (e-post, ingen spårning) och nämner inte biträdesrollen — den måste kompletteras med en B2B-/biträdesdel vid lansering.

### 2.4 Underbiträdeslista (preliminär, ska publiceras)

| Kategori | Exempel i AK1A-stack | Roll |
|---|---|---|
| Hosting/DB | Vercel, Supabase | Drift, lagring |
| Betalning | Stripe | Fakturering (endast rådgivarens egna kontakt-/fakturauppgifter) |
| E-post/infra | Resend/liknande, Cloudflare | Leverans, nät |

Listan hålls publicerad (t.ex. /pro/dpa-sida), med ändringsavisering 30 dagar i förväg och rätt att säga upp vid ny kritisk underbiträde.

---

## DEL 3 — Prismodell: forskning och tre alternativ

### 3.1 Vad forskningen säger (WebSearch 2026-09-04 + tidigare prisrapport)

- **Per seat dominerar rådgivarledet:** wealth-plattformar typ $150–400/advisor/mån; Kitces: bransch-CRM ~$500–1 000/advisor/år; Orion ~$13 000–28 000 USD/år; Addepar ~$34 000+ USD/år med **AUM-/klientantalsskalad, opak prissättning** — just den opaciteten är kundernas största irritationsmoment och en differentieringslucka.
- **AUM-pris = friktionspunkt + compliance-optik:** växer kostnaden med klientframgång uppfattas det som straff; för oberoende rådgivare vill vi dessutom ha helt rent flat-fee-flöde (inget som liknar intresse i klientens affärer). Undantag: kapitalförvaltarens inköp av forskning budgetteras enligt MiFID-forskningsreglerna — årsfaktura per seat är deras enklaste compliance.
- **Onboarding-/implementeringsavgift är standard i B2B SaaS** (Paddle; bank/fintech-implementeringar 3–9 mån, Backbase) — ofta avklippt mot längre bindningstid. Vanlig hybrid 2025–2026: fast bas + usage-trappa (Koyfin: 10/200 rapporter per mån; T3 2025: per-plan-pris ~$150).
- **Referenskorridor kvar:** TIKR Pro ~550 kr/mån · Koyfin Premium ~820 · Koyfin Advisor ~2 200–3 100 · YCharts ~3 100–5 200. AK1A:s 499/1 499/4 999 ligger i nedre-mittre segmentet med white-label — underprisat mot Advisor-referensen på Studio-nivån, rimligt som introduktion.

### 3.2 Tre prisalternativ (kundägaren beslutar slutligt)

| | A. Flat per seat + onboarding på Institution (REK) | B. Hybrid: lägre bas + rapportvolym-trappa | C. AUM-band endast på Institution |
|---|---|---|---|
| Analytiker | 499 kr/mån (oförändrat) | 399 kr/mån + 25 rapporter, därefter 5 kr/rapport | 499 kr/mån |
| Studio | 1 499 kr/mån (oförändrat) | 1 199 kr/mån + 125 rapporter, 5 kr/styck över | 1 499 kr/mån |
| Institution | 4 999 kr/mån + engångs-onboarding 9 900 kr (avklippt vid 2-årsbindning) | 3 999 kr/mån + 7 500 rapporter, därefter 2 kr/rapport + onboarding 9 900 kr | Bas 4 999 + årsband per klient-AUM-intervall (offert) |
| Passar | Predictability, compliance-renhet, enkel säljstory | Marginal följer levererat värde; naturlig uppgraderingstrigg | Värdefångst från stora förvaltare |
| Risk | Lämnar värde på bordet vid tunga användare | Administrativt; kvot-stress i support | Rev-share-optik mot oberoende rådgivare; opak — mot vår transparenstrad |
| Källa-logik | Koyfin/Morningstar-mönstret "white-label höjer priset"; Paddle/Backbase om onboarding | T3 2025 usage-trend; Koyfin 10/200-trappa | Addepar-modellen — branschens kritiserade variant |

**Motivering av rekommendation A:** (1) pro-sidans löfte är redan "transparent flat-fee, aldrig rev-share" — alternativ C skulle bryta varumärkeslöftet dagen före lansning; (2) flat-fee är det compliance-renaste mot oberoende rådgivare (inga incitaments-/inducement-diskussioner i deras tillsyn); (3) onboarding-avgiften fångar det verkliga arbetet (analysavdelningens uppstart) utan att röra månadspriset; (4) alternativ B kan läggas på senare som mätvärdena mognar — A blockerar inte B. Privatsidans 249/449/799 berörs inte av B2B-modellen (skilda världar enligt arkitekturen); underhåll endast avseende Fas 2/3-rabattens avgränsning till privatledet.

---

## DEL 4 — Checklista: juridiskt MÅSTE före B2B-lansering

- [ ] **B2B-villkor för /pro** (egen sida/dokument): tjänstens omfattning (verktyg + forskning, ej rådgivning), seats/faktura/bindning, ansvarsbegränsning anpassad B2B (36 §-standard), klausul om rådgivarens eget institut-/lämplighetsansvar, immaterialrätt/metodik-licens, mal-låst deklarationskrav, uppsägning, svensk lag + allmän domstol. Konsumentdelarna (ångerrätt, 90-dagar) ska INTE blandas in.
- [ ] **DPA-mall enligt art 28** (2.2 ovan) — signerbar, lämpligen via e-signaturflöde.
- [ ] **Behandlingsregister-uppdatering:** AK1A:s interna register får poster för (a) eget ansvars- och konsumentled (befintligt), (b) biträdesledet /pro med ändamål, kategorier, underbiträden, retention.
- [ ] **Publicerad underbiträdeslista** + ändringsprocess (2.4).
- [ ] **Integritetspolicy-komplement:** biträdesrollen beskriven; länk DPA.
- [ ] **Mal-låsning verifierad i koden:** disclaimer-blocket kan tekniskt inte redigeras bort i white-label-flödet (test-case i sviten).
- [ ] **Disclaimer-texterna granskade en gång av jurist** (timmar, inte veckor — forskning-b2b 4.2) innan första rådgivarkund; därefter versionslåsta.
- [ ] **Faktura-/momsflöde B2B:** reversed charge eller SE-moms per kundkategori; priser exkl. moms i B2B-avtal (nuvarande "inkl. moms"-regel i priser.json är en konsumentregel).
- [ ] **Inga referral-/remunerationsbetalningar** till rådgivare — kontrollera att affiliate-/referenslogik aldrig når /pro-ledet (oberoende-rådgivares förbud mot tredjepartsersättningar).

---

## TRE REKOMMENDATIONER

1. **Blockerarna först:** separata B2B-villkor + DPA-mall + behandlingsregister + underbiträdeslista innan första rådgivarkund; engångs-juristgranskning av disclaimer-texterna. Utan detta är varje /pro-kund en GDPR- och avtalsrisk — med detta är AK1A verksamhetsskyddat i verktygsrollen.
2. **Prisalternativ A:** behåll 499/1 499/4 999 flat per seat, lägg engångs-onboarding 9 900 kr på Institution (avklippt mot 2-årsbindning), avstå från AUM-prissättning i nivå 1–2 — compliance-renhet och transparenslöftet är värt mer än värdefångsten vid lanseringsskedet. (Slutligt beslut: kundägaren.)
3. **Dataminimering hårdkodad:** CSV-regeln (instrument + vikt, aldrig personuppgifter) och cockpit-pseudonymisering implementeras som tekniska spärrar, inte policytext — det minimerar DPA-ytan, gör rådgivarens tillitsfråga trivial och bibehåller metodik-IP:s renhet.

---

## KÄLLOR (besökta 2026-09-04 om ej annat anges)

**Regulering rådgivning/verktyg:** [FI — Vägledning](https://www.fi.se/sv/marknad/vagledning/) · [FI — Reglerna i korthet MiFID/MiFIR](https://www.fi.se/sv/marknad/vardepappersmarknad-mifidmifir/reglerna-i-korthet/) · [ESMA — uppdaterad vägledning om rådgivningsbegreppet](https://www.esma.europa.eu/press-news/esma-news/esma-updates-its-guidance-definition-advice-supervisory-briefing) · [ESMA — lämplighetsriktlinjer 2023 (svenska)](https://www.esma.europa.eu/sites/default/files/2023-04/ESMA35-43-3172_Guidelines_on_certain_aspects_of_the_MiFID_II_suitability_requirements_SV.pdf) · [Better Regulation — disclaimers kan inte friskriva lämplighetsansvar](https://service.betterregulation.com/document/817397) · [Latham & Watkins — robo-advice under MiFID II](https://www.lw.com/thoughtLeadership/lw-policing-the-robots-robo-advice-under-miFID-II) · [SvD — rådgivning i gråzonen](https://www.svd.se/a/PJMG0/radgivning-i-grazonen-undslipper-fis-regler) · [LVF 2007:528 via Skatteverket](https://www4.skatteverket.se/rattsligvagledning/edition/2026.12/2546.html)

**Svensk B2B-avtalsrätt:** [lagen.nu — konsumentköplagen 2022:260 (B2C-omfattning)](https://lagen.nu/2022:260) · [EUR-Lex — direktiv 2019/770 sammanfattning](https://eur-lex.europa.eu/SV/legal-content/summary/contracts-for-the-supply-of-digital-content-and-digital-services.html) · [Setterwalls — ny konsumenträttsreglering](https://setterwalls.se/artikel/ny-reglering-pa-konsumentratsomradet-har-ar-de-viktigaste-lagarandringarna/) · [Advokaten.ai — B2B-SaaS-avtal och 36 § avtalslagen](https://advokaten.ai/skills/e-handel-avtal/) · [Dagens Juridik — Data Act och oskäliga B2B-villkor](https://www.dagensjuridik.se/debatt/eus-data-act-spelregler-for-en-rattvis-dataekonomi-eller-innovationshammande-detaljreglering-del-2/)

**GDPR/DPA:** [IMY — personuppgiftsbiträdesavtal](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/personuppgiftsansvariga-och-personuppgiftsbitraden/personuppgiftsbitradesavtal/) · [Artikel 28 lagtext](https://www.privacy-regulation.eu/sv/28.htm) · [EDPB — ansvarig eller biträde (svenska)](https://www.edpb.europa.eu/sme/learn-the-basics/data-controller-or-data-processor_sv) · [Morlings — vanliga brister i biträdesavtal](https://morlings.se/blogg/vanliga-brister-personuppgiftsbitradesavtal-gdpr/)

**Prissättning:** [Kitces — hur rådgivare betalar för fintech](https://www.kitces.com/blog/how-advisors-pay-for-fintech-cost-of-revenue-vs-overhead-vs-clients/) · [G2 — Orion priser](https://www.g2.com/products/orion-advisor-technology/pricing) · [FundCount — Addepar vs Envestnet](https://fundcount.com/addepar-vs-envestnet-comparison/) · [Kubera — Addepar vs Black Diamond (AUM-opacitet)](https://www.kubera.com/blog/addepar-vs-black-diamond) · [Paddle — SaaS-prismodeller och avgifter](https://www.paddle.com/blog/saas-pricing-models-strategies-fltr) · [Backbase — onboarding-mjukvara banker](https://www.backbase.com/blog/customer-onboarding-software-for-banks) · [WealthTech Today — T3 2025 trender](https://wealthtechtoday.com/2025/03/10/the-great-ai-awakening-7-technology-trends-from-the-t3-2025-conference/) · [FTI — Beyond Subscriptions SaaS-prissättning](https://www.fticonsulting.com/insights/white-papers/beyond-subscriptions-saas-pricing) · [Market Research Future — wealth platform-marknad](https://www.marketresearchfuture.com/reports/wealth-management-platform-market-6299)

**Internt:** data/rapporter/forskning-b2b.md (2026-09-01, marknads- och compliance-grunden) · data/portfolj-system/priser.json · src/app/pro/page.tsx · src/app/villkor/page.tsx · src/app/privacy-policy/page.tsx · src/app/transparens/page.tsx
