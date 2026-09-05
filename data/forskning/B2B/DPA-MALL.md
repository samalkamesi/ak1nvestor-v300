# PERSONUPPGIFTSBITRÄDESAVTAL (DPA) — AK1A PRO

**Dokument-id:** DPA-AK1A-PRO · **Version:** utkast 1.0 (2026-09-04) · **Status: UTKAST — under juristgranskning (K-B2B:1)**

Detta dokument är AK1A:s mall för personuppgiftsbiträdesavtal enligt
dataskyddsförordningen (EU) 2016/679 ("GDPR") artikel 28. Det ingår i
G2-juridikpaketet (B2B-BESLUT steg 5; underlag: b4-juridik-priser DEL 2) och
publiceras som dokument (serveras på `/api/pro/dpa-mall`, länkas från
`/pro/priser` och från villkorens PRO-sektion P7). **Ett signerat exemplar
krävs innan någon klientuppgift — även pseudonymiserad — läses in i AK1A PRO
(G3-grinden).** Mallen kompletterar, och är en bilaga till, AK1A PRO:s
företagsvillkor (PRO-sektionen P1–P9 på `/villkor`).

---

## Parter

| Roll | Part |
|---|---|
| **Personuppgiftsansvarig** ("Kunden") | [FIRMANAMN], org.nr [ORGANISATIONSNR] — värdepappersinstitut, rådgivare, kapitalförvaltare eller analysföretag som tecknat AK1A PRO |
| **Personuppgiftsbiträde** ("Biträdet") | AK1A Research Lab, org.nr [ORGANISATIONSNR], info@ak1nvestor.com |

**Ingående.** Avtalet ingås skriftligen eller via e-signatur i samband med
tecknandet av AK1A PRO och gäller från båda parters undertecknande tills
huvudavtalet upphör, varefter punkt 6 (radering/återlämnande) fullgörs.

---

## De nio punkterna — GDPR art 28.3 punkt för punkt

### 1. Ändamål och instruktioner (art 28.3 ingressen och a)

1.1 Biträdet behandlar personuppgifter **enbart för att leverera AK1A
PRO-tjänsten** (morgonrond, screening, klientvy, mötespaket, Rapportverkstan)
enligt de närmare bestämmelserna i **Bilaga A** — och enbart enligt Kundens
**dokumenterade instruktioner**. Biträdet vidtar ingen behandling för eget
konto och gör inga egna ändamålsändringar.

1.2 Anser Biträdet att en instruktion bryter mot GDPR eller annan
unionsrättslig eller medlemsstatlig dataskyddslagstiftning, ska Biträdet
**omedelbart informera Kunden** innan behandlingen fortsätter (art 28.3
sista meningen).

1.3 Biträdet biträder Kunden med råd om instruktionsformulering när Kunden
efterfrågar det, men designen av behandlingen — inklusive den tekniska
spärren att import enbart sker som instrument och vikt/antal — är en del av
tjänsten och kan inte kringgås av Biträdet ens på Kundens begäran.

### 2. Konfidentialitet (art 28.3 b)

2.1 Personer hos Biträdet med åtkomst till personuppgifter är
**sekretessbelagda** genom avtalsenlig tystnadsplikt och har utbildats i
dataskydd och säker hantering.

2.2 Åtkomst beviljas enligt principen om minsta behov ("need-to-know") och
återkallas när arbetsuppgiften upphör.

### 3. Tekniska och organisatoriska åtgärder (art 28.3 c; art 32)

3.1 Biträdet vidtar och upprätthåller lämpliga tekniska och organisatoriska
åtgärder, specificerade i **Bilaga C**, däribland: kryptering i transit och
i vila, åtkomstkontroll med minsta privilegium, loggning av åtkomst och
ändringar, samt pseudonymisering och dataminimering som design (klientkod i
stället för namn; CSV-regeln).

3.2 Åtgärdernas nivå prövas mot risken med behandlingen (art 32.1) och
omprövas vid väsentliga förändringar av tjänsten.

### 4. Underbiträden (art 28.2, 28.3 d)

4.1 Biträdet anlitar enbart följande **underbiträden** (sub-processors),
specificerade med behandling och region i **Bilaga B**: **Vercel**
(hosting/drift) och **Supabase** (databas/lagring) — båda med **EU-region
verifierad**.

4.2 **Nya underbiträden:** Biträdet meddelar Kunden skriftligt (e-post
räcker) **minst 30 dagar innan** ett nytt underbiträde börjar behandla
personuppgifter. Kunden har **invändningsrätt** mot tillägget; kan parterna
inte enas, har Kunden rätt att säga upp den berörda delen av avtalet — och
vid biträdesledets kärna hela avtalet — utan kostnad för återstående period.

4.3 Biträdet ingår skriftliga avtal med varje underbiträde som ålägger
samma dataskyddsförpliktelser som detta avtal (flow-down). Biträdet svarar
fullt ut för underbiträdenas fullgörande i den utsträckning Biträdet inte
kan visa att Biträdet inte kan lastas för skadan (art 82.2).

4.4 **Notering — betalningsflödet:** betalleverantör (Stripe) behandlar
endast Kundens egna kontakt- och fakturauppgifter, alltså **utanför
klientregistret**, och redovisas därför i Bilaga B som notering i stället
för som underbiträde i klientledet. Skulle behandlingen ändras gäller
punkt 4.2.

### 5. Registrerades rättigheter (art 28.3 e–f)

5.1 Biträdet **stödjer Kunden** i att fullgöra dennes skyldigheter mot
registrerade — tillgång, rättelse, radering, begränsning, dataportabilitet
och invändning (art 15–21) — genom att utan dröjsmål leverera underlag ur
systemet enligt Kundens instruktion.

5.2 Biträdet biträder även Kunden vid prövning av dataskyddskonsekvenser
(DPIA, art 35) i den mån behandlingen i Bilaga A kräver det.

5.3 Kommer en begäran från registrerad direkt till Biträdet, vidarebefordras
den inte; registreraden hänvisas till Kunden.

### 6. Radering och återlämnande (art 28.3 g)

6.1 Vid avtalets slut **raderas portfölj- och klientdata senast 30 dagar**
efter att uppsägningen fått verkan, om inte Kunden tidigare begärt
**återlämning i maskinläsbart format** — återlämning sker inom samma period,
varefter data raderas när Kunden bekräftat mottagandet.

6.2 Undantag utgör uppgifter som lagstiftning (bokföringslagen (1999:1078)
m.fl.) ålägger Biträdet att lagra: dessa gallras först när gallringsfristen
löpt och behandlas under tiden inte för andra ändamål.

### 7. Revisionsrätt (art 28.3 h)

7.1 Biträdet lämnar Kunden all information som behövs för att visa att
förpliktelserna i art 28 följs, och gör **dokumentation av åtgärderna
(Bilaga C) tillgängliga på begäran**.

7.2 Kunden — eller en revisor den utser och som är under sekretess — får
**granska** Bitrådets fullgörande: efter överenskommelse, med minst 30 dagars
varsel, under normal kontorstid och med hänsyn till Bitrådets verksamhet.
Revisionsunderlag och resultat hanteras konfidentiellt.

7.3 Biträdet lämnar årligen en enkel skriftlig redovisning av: ändringar i
underbiträdeslistan, inträffade incidenter samt väsentliga förändringar av
de tekniska och organisatoriska åtgärderna.

### 8. Tredjelandsöverföring (art 28.3 a; GDPR kap. V)

8.1 Biträdet **överför aldrig** personuppgifter till tredjeland eller
internationell organisation utan Kundens **förhandsgodkännande i skriftlig
form** samt en lämplig mekanism (art 46) — huvudalternativet är
kommisionens standardavtalsklausuler (2021/914) med tillägg och en
dokumenterad överföringsbedömning.

8.2 **Huvudregeln är EU-region** från dag ett: regionvalen för
underbiträdena redovisas i Bilaga B och har verifierats av Biträdet.

### 9. Ansvarsfördelning och incidentflöde (art 33–34, 82)

9.1 **Ansvarsfördelning (art 82).** Varje part svarar för den del av skadan
som orsakats av dess egen otillbörliga efterlevnad av GDPR; Biträdet svarar
för skada som orsakats av endast Bitrådets åsidosättanden, Kunden för skada
som orsakats av dess instruktioner och sin roll som personuppgiftsansvarig.
Detta påverkar inte Kundens ansvar mot sina registrerade.

9.2 **Incidentflöde (art 33).** Vid personuppgiftsincident (art 4.12) gäller
följande steg:

| Steg | Vem | Vad | Frist |
|---|---|---|---|
| 1 | Biträdet | Upptäcker, stoppar och dokumenterar incidenten internt (logg: tid, art, omfattning, åtgärd) | Omedelbart vid upptäckt |
| 2 | Biträdet → Kunden | Meddelar Kundens utsedda kontaktperson per e-post och telefon med innehållet i art 33.3: arten av incidenten, kategorier och omfattande antal registrerade/uppgifter, troliga konsekvenser, vidtagna/planerade åtgärder samt kontaktpunkt | **Utan dröjsmål, senast 24 timmar** efter upptäckt |
| 3 | Kunden | Anmäler till Integritetsskyddsmyndigheten (IMY) — ansvaret för anmälan inom 72 timmar (art 33.1) ligger på Kunden som personuppgiftsansvarig; Biträdet lämnar underlag och biträder | 72 timmar (Kundens skyldighet) |
| 4 | Parterna gemensamt | Om risken är hög för registrerades rättigheter och friheter: samråd om underrättelse till registrerade (art 34) — Kunden fattar beslutet, Biträdet lämnar underlag | Utan dröjsmål |
| 5 | Biträdet | Dokumenterar samtliga incidenter internt (art 33.5) och redovisar dem i den årliga rapporteringen (punkt 7.3) | Löpande; sparas minst 2 år |

9.3 Biträdet meddelar även Kunden vid dataintrång i egen infrastruktur
som **kan** komma att bli en personuppgiftsincident, med samma flöde —
dröjsmål tillåts aldrig av att omfattningen ännu inte är kartlagd (då
meddelas det kända, och komplettering följer).

---

## Bilaga A — Behandlingens närmare bestämmelser (art 28.3 ingressen)

| Beståmmelse | Innehåll |
|---|---|
| **Omfattning och ämne** | Drift av AK1A PRO: analys och rendering av rapporter för Kundens räkning på lab.ak1nvestor.com/pro |
| **Varaktighet** | Huvudavtalets (PRO-villkoren P1–P9) löptid + gallringsperioden i punkt 6 |
| **Art och ändamål** | Analys av portföljer och instrument mot AK1A:s metodik; produktion av utskriftsklassade rapporter; administration av Kundens seat-konton |
| **Kategorier av registrerade** | (i) Kundens slutklienter — identifierade endast genom klientkod/etikett; (ii) Kundens anställda och uppdragstagare med seat |
| **Kategorier av personuppgifter** | Klientkod/etikett (Kundens val), instrument-id (ticker/ISIN), vikt eller antal, användarkonto per seat (namn, e-post, roll), användningsloggar, ev. fria anteckningar som användaren skriver i verktyget. **Namn, personnummer och skuldlistor läses aldrig in (teknisk spärr).** |
| **Särskilda kategorier (art 9)** | Förekommer aldrig — importvägen tillåter dem inte och tjänsten kräver dem inte |

## Bilaga B — Underbiträdeslista (publicerad; ändras enligt punkt 4.2)

| Kategori | Underbiträde | Behandling | Region |
|---|---|---|---|
| Hosting/drift | **Vercel** | Drift och leverans av webbplattformen | **EU** (verifierat regionval) |
| Databas/lagring | **Supabase** | Databas och lagring av tjänstedata | **EU** (verifierat regionval) |
| Betalning (notering) | Stripe | Fakturering — **endast Kundens egna kontakt-/fakturauppgifter**, utanför klientregistret (se 4.4) | Redovisas i teckningsunderlaget |
| E-postleverans (planerad) | Resend el. motsv. | Transaktionsmejl — aktiveras först vid leverantörsbeslut; tillkännages 30 dagar i förväg enligt 4.2 | EU efterlever krav |

Ändringsprocess: 30 dagars skriftlig avisering, Kundens invändningsrätt och
rätt att säga upp (punkt 4.2). Listan publiceras i detta dokument (offentlig
spegel: `/api/pro/dpa-mall`).

## Bilaga C — Tekniska och organisatoriska åtgärder (art 32)

- **Pseudonymisering och dataminimering som design:** klienten bärs av
  klientkod/etikett; import sker enbart som instrument + vikt/antal.
- **Kryptering:** TLS i transit; kryptering i vila hos databasleverantör.
- **Åtkomstkontroll:** minsta privilegium, separata tjänstekonton,
  tvåfaktorautentisering för administrativa konton.
- **Loggning:** åtkomst och ändringar loggas; loggar gallras rullande.
- **Integritet och tillgänglighet:** dagliga backup-rutiner hos
  databasleverantören; test av återställning.
- **Ändringshantering:** väsentliga ändringar dokumenteras och ingår i den
  årliga redovisningen (punkt 7.3).

---

## Undertecknande

| | Kunden (personuppgiftsansvarig) | Biträdet (AK1A Research Lab) |
|---|---|---|
| Ort/datum | ______________________ | ______________________ |
| Namnförtydligande | ______________________ | ______________________ |
| Funktion | ______________________ | ______________________ |

**Versionsspår:** utkast 1.0 (2026-09-04) — första versionen i
G2-juridikpaketet. Slutlig version fastställs efter kundens juristgranskning
(K-B2B:1) och låses därefter; ändringar sker enligt PRO-villkoren P8.

*Dokumentet är ett utkast som levereras för granskning — det blir
avtalspart först i undertecknad form. Pedagogisk forskning — aldrig
investeringsrådgivning (2007:528).*
