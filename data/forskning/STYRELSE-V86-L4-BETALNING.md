# STYRELSE — V86-L4 BETALNING: nivåkarta, betalsätt, rekommendation

Forskarunderlag av V86-BETAL (2026-09-07) inför FAS L4 i STYRELSE-INLOGGNING-ADMIN
("NIVÅER + BETALNINGAR — kräver kundbeslut"). Källor: data/portfolj-system/priser.json,
src/lib/prenumeration.ts (läst, ej rörd), data/forskning/STYRELSE-B2B-VARIABLER.md,
data/forskning/B2B/B2B-BESLUT.md, data/forskning/MARKNAD/MARKNADS-BESLUT.md,
/villkor sektion 5–6 + P-sektionen, worklog våg 61 (B4 juridik) + våg 66 (G2).
Avgifter webbverifierade 2026-09-07 med länkar i slutet. Beslutanderätt: kundägaren.

## A. NIVÅKARTA — alla säljbara ytor och priser idag

### A1. Privata prenumerationsnivåer (SEK, inkl. 25 % moms — priser.json)
| Nivå (id) | Namn | Pris/mån | Pris/år | Nivåordning |
|---|---|---|---|---|
| forskning | Portföljforskning Grund | 249 | 2 490 (2 mån gratis) | 1 — lägst |
| forskning-plus | Portföljforskning Plus | 449 | 4 490 (2 mån gratis) | 2 — AKM2-poängbasen kräver denna+ |
| portfolj-hyra | Portföljhyra (forskningstjänst) | 799 | 7 990 (2 mån gratis) | 3 — högsta |

- Fas 2/3-medlemmar: 20 % rabatt automatiskt (priser.json rabattFas).
- Gating idag: KLIENTSIDIG — aktiveringsintention i localStorage
  (ak1a-prenumeration-intention-v1) + mailto-aktivering till info@ak1nvestor.com
  (mänsklig aktivering; betalflödet saknas). L4 ändrar detta till authId-kopplad,
  serververifierad nivå (prenumeration.ts:nivåRang bevaras som ordningskälla).

### A2. Fas-engångspriser (SEK, inkl. moms — priser.json fas)
| Produkt | Pris | Period | Villkor |
|---|---|---|---|
| Fas 2-utbildningen | 9 999 | 12 mån åtkomst | 90 dagars nöjd-kund-garanti: betalning först dag 90, endast om nöjd; garantiperioden räknas inom de 12 mån |
| Fas 3-utbildningen | 13 999 | 12 mån åtkomst | Samma 90-dagars-garanti |

### A3. B2B-paketet AK1A PRO (SEK, EXKL. moms — priser.json b2b, P3)
| Nivå | Pris | Seats |
|---|---|---|
| Pro Analytiker | 499 kr/mån | 1 |
| Pro Studio | 1 499 kr/mån | upp till 5 |
| Pro Institution | 4 999 kr/mån | 10+ (årsbindning) |
| Onboarding Institution | 9 900 kr engång | avklippt vid 2-årsbindning |
| Fas 3-certifierad intro | 299 kr/mån första året (Pro Analytiker) | 1 |

B2B-grinden (STYRELSE-B2B-VARIABLER B1): /pro dolt tills kunden slår på
B2B_AKTIV=1. P3 säger redan: faktura med 30 dagars betalningstid — B2B
betalar INTE via kortflödet i G2 (Stripe-per-seat = fas 3/G4).

## B. BETALSÄTTS-JÄMFÖRELSE (svensk verksamhet, SEK)

Uppgiftens "~2,9 % + 2 kr" gäller internationella kort — svenska EES-kort är
billigare (1,5 % + 1,80 kr), se verifiering nedan.

| Kriterium | 1) Stripe (kort+Swish+Klarna via) | 2) Swish handel (bank/teknisk leverantör) | 3) Manuell faktura | 4) PayPal |
|---|---|---|---|---|
| Kostnad/transaktion | Kort EES 1,5 % + 1,80 kr (premiumkort 2,8 %; utanför EES 3,15 % + 1,80). Swish via Stripe 1 % + 3 kr (max 7 kr). Klarna via Stripe 2,99 % + 4 kr. 0 kr/mån | Bank: ca 40–85 kr/mån + 1,50–3,50 kr/transaktion (Swedbank 1 000 kr anslutning); Nordea Swish Handel 720 kr/år + 1,50 kr + 0,3 % (max 10 kr) | 0 kr transaktionsavgift; egen PDF + bankgiro (bankens avgifter); arbete per faktura | Officiellt SE-handel ca 1,90 % + fast avgift (äldre uppgifter 2,9 % + 3,25 kr); valutaväxling tillkommer 3–4 % |
| Abonnemang-stöd | JA — Subscriptions inbyggt (mån/år, automatisk förnyelse, dunning, SCA/3DS) | NEJ — endast engångsbetalningar (QR/API); "prenumeration" = manuell omstart | Manuell förnyelse per period (villkoren kräver opt-in + påminnelse 30 d) | Finns (Billing plans) men klumpigare i SEK |
| Svensk konsumentvana | Hög: kort + Swish + Klarna i samma flöde; Swishär vane-kungen men engångsbaserad | Mycket hög (8+ mn användare), MEN förväntas för snabba belopp — 9 999/13 999 kr engång via Swish är ovanligt | Neutral — förväntas i B2B; i B2C känns förlegat | Medel — ses som utländsk/extern i Sverige |
| Integration mot Next API + Supabase | Liten: officiell node-SDK, webhooks → /api/betalning/webhook; Checkout-länkar kräver ingen känslig kod; Stripe redan i DPA-bilagan | Medel–stor: Swish Certificate-hantering, egen callback-mottagning, QR-rendering; bankerna-API:er varierar | Minimal kod (orderbekräftelse + PDF) men manuell drift: påminnelser, avstängning vid utebliven betalning | Medel: SDK + webhooks; extra konto, SEK-utbetalningar |
| Juristkrav (villkor sektion 5 + P-sektionen) | Villkoren säger REDAN "kort via extern betaltjänstleverantör (Stripe)" — 0 ändring för kort; Swish/Klarna till = mindre villkorsuppdatering. Stripe = underbiträde (DPA Bilaga B), EU-registrerad | Nytt avtal med bank; villkoren måste nämna Swish som betalsätt | P3 (B2B) är redan skriven för faktura 30 dagar — passar | Ny underbiträdeslista-post + villkorsändring |

### B:son. Kommentar per alternativ
1. **Stripe** — täcker kort, Swish och Klarna via ETT konto, ETT avtal, EN
   webhook-väg; avgiften för svenska kort (1,5 % + 1,80 kr) är lägst av de
   automatiska alternativen. Engångspriser blir Payment Links; abonnemang blir
   Subscriptions med årspriset (2 mån gratis) som Stripe-coupon/pris.
2. **Swish direkt via bank** — billigast per krona men bara engångsbetalningar;
   inga abonnemang, ingen automatisk förnyelse; certifikathantering (Swish
   Certificate) är en egen driftsbörda. VIA STRIPE fås Swish (1 % + 3 kr, max
   7 kr) utan egen bankintegration — därmed faller huvudargumentet för direkt-
   anslutning. Kvar som läge endast om kunden vill slippa PSP helt.
3. **Manuell faktura** — redan B2B:s väg (P3). För privat: möjlig startpunkt
   för Fas 2/3 (ändå 90 dagar till betalning — naturligt fakturatillfälle) men
   skalar inte vid volym och skapar manuellt förnyelsearbete.
4. **PayPal** — ingen svensk vane-fördel, högre effektiv avgift vid växling,
   ännu en underbiträdeskedja. AVSLAGS som huvudspår; kan aktiveras senare
   via Stripe-adaptern om utlandsefterfrågan uppstår.

## C. REKOMMENDATION — Stripe som enda betalmotor för privat; B2B kvar på faktura

Dom: **Stripe (kort + Swish + Klarna via Stripe) för alla privata produkter —
abonnemang OCH engång — medan B2B (AK1A PRO) behåller manuell faktura enligt
P3 tills G4 Institution-volym motiverar Stripe-per-seat.** Skäl: (i) enda
alternativet med äkta abonnemangsmotor (prenumerationernas kärna); (ii) Swish
och Klarna fås i svenska konsumenters favoritformer UTAN egen bankcertifikat-
drift; (iii) villkoren nämner redan Stripe som betalpartner (0 juridisk
ombyggnad för kort); (iv) ETT webhook-flöde → ETT system_events-spår;
(v) engångs-Swish direkt via bank adderar kostnad/komplexitet utan ny förmåga
som Stripe inte redan ger.

### MVP-integrationsskiss mot medlemssystemet (FAS L1–L3 byggd grund)
1. Stripe-konto (SE/SEK); produkter/priser skapas speglande ur priser.json
   (ägande: moderagenten vid bygge; priser ALDRIG hårdkodade i src — vakten).
   Hemligheter ENDAST server-side env (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET).
2. Köpflöde: /prenumeration + /medlemskap → /api/betalning/checkout (server):
   Stripe Checkout Session — mode=subscription för nivåer (mån eller år),
   mode=payment för Fas 2/3-engång. client_reference_id=authId; metadata =
   produkt + nivå + period + rabattandels-flagga. Ingen kortdata på vår sida.
3. FÖRE omdirigering till Stripe: ångerrätts-steget (se E1) — kryssruta för
   avstående loggas i system_events (type=betalning, subtype=angeravstand).
4. Webhook /api/betalning/webhook (force-dynamic, signaturverifierad,
   idempotent på event.id): checkout.completed, invoice.paid,
   customer.subscription.updated/deleted → skriv system_events type=betalning
   (details: authId, nivå, period, giltigt-till, status — INGA kortuppgifter,
   P6 gäller) + uppdatera members-profilen: nivå, period, giltigtTill, status.
5. Nivå-upplåsning: nytt serveruppslag lasMedlemNiva(authId) ersätter
   localStorage-intentionen som sanning; harPrenumerationsNiva-funktionerna
   behåller namn/logik men matas av session + profil (L4:s kärna). Fas 2/3-
   flödet: garantiorder utan kort → betallänk (Stripe Payment Link) skickas
   ca dag 85 → webhook aktiverar 12-månadersperioden; utebliven betalning =
   åtkomst upphör (villkor sektion 5 "Dröjsmål och fel").
6. Admin: betalningsstatus per medlem i L3:s Medlemmar-flik (läs ur profil +
   system_events); konverteringsvyns steg "betalande" blir ÄKTA (idag
   "manuell" enligt MARKNADS-BESLUT våg 1b AC3).
7. Omfattning: 2–3 vågor (L4a: privat köpflöde + webhook + nivålås; L4b:
   Fas-garantiflödet; L4c: admin/konvertering + avstängning vid upphörda
   prenumerationer).

## D. KUNDBESLUT-LISTA — exakt vad kunden måste bestämma
1. **Betalsätt privat (K1):** godkänns Stripe som enda betalmotor — kort
   alltid på; Swish (1 % + 3 kr, max 7 kr) och Klarna (2,99 % + 4 kr) på/av?
   (Alternativ: eget Swish-direct via bank — avrått, se C.)
2. **Betalningsmodell prenumerationer (K2):** automatisk förnyelse med opt-in
   + 30-dagarspåminnelse (villkoren) — bekräfta att Stripe-autoförnyelse är
   önskat, eller manuell omförhandling per period?
3. **Första produkter i ordning (K3):** (a) de tre prenumerationsnivåerna först,
   (b) Fas 2/3-engång (kräver garanti-flödet L4b) först, eller båda samtidigt?
4. **Moms (K4, EV.):** bekräfta momsregistrering + vem som redovisar
   (privatpriser redan inkl. 25 % moms i priser.json; B2B exkl.); EV. moms-
   registreringens läge om försäljning påbörjas innan trösklar.
5. **Bokföring (K5, EV.):** vem tar emot Stripe:s månads-/dagsrapporter och
   bokför (se E3 — småföretagsregeln EV.); ev. redovisningsbyrå kontaktas.
6. **Kortuppgiftsansvar/kontoägande (K6):** vem öppnar och äger Stripe-kontot
   (org-nummer, bankkonto för utbetalning, 2FA)?
7. **B2B bekräftas (K7):** AK1A PRO kvar på manuell faktura (P3) tills vidare
   — Stripe-per-seat först vid G4; ja/nej.
8. **Villkorsuppdatering (K8, EV.):** om Swish/Klarna aktiveras — godkänns
   mindre lydelseändring i sektion 5 "Betalsätt" (till "kort, Swish och Klarna
   via betalpartner") + ev. juristkvickkoll tillsammans med K-B2B:1.

## E. Juridik-noter (våg 61 B4 + våg 66 G2 + villkor)
- **E1 Distansavtalslagen (2005:59) — ångerrätt 14 dagar.** Digitalt innehåll:
  ångerrätten upphör ENDAST om konsumenten uttryckligen begärt omedelbar
  åtkomst OCH samtyckt till att ångerrätten därmed upphör (2 kap 11 § 1 st
  11 p; rättad lagrumskedja worklog våg 37). Detta kräver en EXPLICIT
  kryssruta i köpflödet INNAN betalning (villkoren sektion 6 lovar den —
  tekniken finns inte än; L4 måste bygga den + lagra samtycket). Order-
  bekräftelsen ska ge pris inkl. moms, åtkomstperiodens längd och hur
  betalningen sker (garantin) — sektion 4-kraven är uppfyllda i copy.
- **E2 Garanti ∥ ångerrätt.** 90-dagars garantin ersätter ALDRIG ångerrätten
  (sektion 6: "två olika skydd"); ångerrätten löper från omedelbar åtkomst
  oavsett när betalning sker (dag 90). Automatisk förnyelse av en
  prenumerationsperiod påverkar inte detta — samma kryssruta krävs.
- **E3 Bokföring/skatt.** Alla affärshändelser ska löpande bokföras; handlingar
  sparas 7 år (Skatteverket). Kort-/e-betalning utan KONTANT försäljning →
  inget krav på certifierat kassaregister. Sammanlagd bokföring av småkvitton
  enligt Bokföringsnämndens regler: f.d. 5 000 kr, numera upp till 25 000 kr
  per dag och verksamhetsgren (BFN:s ändringar från 1 juli 2024 — BEKRÄFTAS
  bäst med byrån, se K5). Stripe levererar månads-/dagssammandrag +
  momsunderlag som verifikationsgrund. Momsmässigt: privatpriser anges inkl.
  moms (konsumenträttens krav — worklog våg 42-fixen står fast).
- **E4 B2B-distinktion.** FORBUD 12 står: inga konsumentklausuler (ångerrätt,
  garanti, ARN) i P-sektionen; B2B = faktura 30 dagar, dröjsmålsränta enligt
  räntelagen (1975:635), omvänd skattskyldighet avgörs i teckningsunderlaget.
  Betalflödet i L4 rör ENDAST privatsidans produkter.
- **E5 GDPR.** Stripe tillkommer som (under)biträde — redan noterad i DPA-
  mallens Bilaga B (våg 66); dataminimering i metadata (authId + nivå, inga
  kortuppgifter, P6: logga aldrig tokens/signaturer).

## Källor (avgifter, hämtade 2026-09-07)
- Stripe SE prislista (kort 1,5 % + 1,80 kr EES; premium 2,8 %; utanför EES
  3,15 % + 1,80): [stripe.com/se/pricing](https://stripe.com/se/pricing) ·
  lokala metoder (Swish 1 % + 3 kr max 7 kr; Klarna Norden 2,99 % + 4 kr;
  intro 1,5 % + 1,80 kr första 2 mån): [stripe.com/se/pricing/local-payment-methods](https://stripe.com/se/pricing/local-payment-methods)
- Swish handel via bank: [Handelsbanken](https://www.handelsbanken.se/sv/foretag/konton-betalningar/ta-betalt/swish-for-foretag)
  (85 kr/mån + 1,95 kr) · [Nordea](https://www.nordea.se/foretag/produkter/betala/swish-for-foretagare.html)
  (720 kr/år + 1,50 kr + 0,3 % max 10 kr) · [Swedbank](https://www.swedbank.se/foretag/betala-och-ta-betalt/swish/swish-handel.html)
  · [developer.swish.nu/api](https://developer.swish.nu/api)
- PayPal SE: [paypal.com/se/business/paypal-business-fees](https://www.paypal.com/se/business/paypal-business-fees)
  (officiellt ca 1,90 % + fast avgift; tredjepartsuppgift 2,9 % + 3,25 kr:
  [Ekonomipiloten](https://ekonomipiloten.se/guider/betalningar/paypal-business-guide))
- Bokföring: [Skatteverket — bokföring vad kräver lagen](https://www.skatteverket.se/foretag/drivaforetag/bokforingochbokslut/bokforingvadkraverlagen.4.18e1b10334ebe8bc80005195.html)
  · [Bokföringsnämndens vägledning 2024](https://www.bfn.se/wp-content/uploads/remiss-vagledning-bokforing-2024.pdf)

— Forskningsagent V86-BETAL · inget byggt, inget committat, src orörd.
