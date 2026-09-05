# B2B-BESLUT — syntes av b1–b5 (normativt för byggagenter)
Skrivet av AI-styrelsens ordförande 2026-09-04 efter djupgranskning i tre rundor
av fem forskarrapporter i data/forskning/B2B/ (b1-plattformar, b2-persona-vaxling,
b3-rådgivardashboard, b4-juridik-priser, b5-arv-och-nya) + kodläsning av
src/app/pro/{page,layout}.tsx, src/lib/meny-register.ts, seo-page-shell.tsx.
DETTA dokument är vad byggagenterna följer. Version: **B2B.2026.09**. Ärlighet
framför entusiasm: konflikter och avslag dokumenteras med skäl (§2, §6). Full
evidens i respektive rapport. Kunddirektivet som dömer allt: *"/pro ska vara på
annan plats som hör till B2B jämfört med alla privatsidor… intelligent knapp
'Privatperson' vs 'B2B'… gör separationen Mega… bygg B2B vidare med exceptionella
system, dashboard exceptionell för rådgivare."*

## 0. Definition — B2B-världen Är
AK1A PRO (/pro) = den skilda B2B-världen inom samma domän: ett skal (marin vägg,
PRO-badge, egen nav, inga privata menyer), ett verkstadsflöde i rådgivarens
arbetsordning (morgonrond → screening → klientmöte → rapport) och en identitet
som **verktygs- och forskningsleverantör till reglerade rådgivare** — aldrig
själv rådgivare (2007:528). Privatsidan är och förblir ett annat land: papper,
pedagogik, öppen generositet. Separationen är produkt, inte dekor: olika verktyg,
olika priser, olika juridik — växeln mellan dem ska vara intelligent och tydlig.

## 1. Kundprinciperna (domskäl i samtliga rundor)
P1 **Determinism** — samma indata ⇒ JSON-identiskt utdata; white-label ändrar
avsändare, ALDRIG innehåll. Inga klockor/slump i lib.
P2 **2007:528 även i B2B** — AK1A levererar pedagogiskt underlag; rådgivaren
(bär tillståndet) svarar för sin rådgivning och lämplighetsprövning. Substans
över etikett (ESMA): designen — generisk utdata — är skyddet, inte disclaimern.
P3 **Dataminimering som teknisk spärr** — instrument + vikter, ALDRIG
personuppgifter i import; klienten bärs av kod/alias; PUB-avtal (art 28) är
GRIND före varje klientregister. Det billigaste juridiska skyddet: att inte ha data.
P4 **B2C-heligt förblir heligt** — gratis Fas 1, öppen generositet, inga
share-walls: orörda. Separationen skyddar båda världar: B2B-ytor får vara
kommersiella, men får ALDRIG degradera privat-upplevelsen eller läcka in i den.
P5 **Ärv hellre än bygg** — ~70–80 % av B2B-värdet finns som rena,
deterministiska bibliotek och klient-säkra komponenter (b1 §3, b3 §Kärnslutsats).
P6 **Ingen ny spårning** — inga pixels, retargeting eller nya datapunkter på
B2B-ytorna (ärvs från MARKNADS-BESLUT P6).
P7 **Svenska med åäö i UI; JSON-nycklar åäö-fria; inga nya tunga beroenden i
MVP** (PDF-vägen väntar — print räcker).

## 2. Rond 1 — granskning mot principerna + konflikternas domar
Allmän dom först: samtliga fem rapporter håller kundprinciperna; b4:s juridiska
blockerare och b3:s GDPR-fasning är serieus och bör bli norm. Konflikterna:

| # | Konflikt | Dom | Skäl |
|---|---|---|---|
| K1 | b1 "PDF-rapportgeneratorn först (gap #1)" vs b3 "morgonrond + screening först" | **b3 vinner** | Morgonrond+screening bygger på existerande data/API:er: 0 nya tabeller, 0 nya beroenden; PDF kräver ny beroendeväg (package.json saknar den) och levererar inte rådgivarens DAG. Rapporten levereras print-först (se K7). Cockpiten bevisar "exceptionell dashboard"-direktivet; rapporten förädlar den |
| K2 | b1 "dashboard är gap #2, efter rapporten" vs b5 "mötespaketet är första produkten" | **b5+b3 förenade** | Mötespaketet (b5 §2d) samlar åtta FÄRDIGA motorer till ett A4 — billigast kundnytta per timme; det bor I klientvyn och gör den exceptionell. Rapportvägen print-först |
| K3 | b2 "URL-separationen först (nav-lager)" vs b5 "tenant-grunden först (data-lager)" | **b2 först, b5 som KONTRAKT** | Inte äkta konflikt (olika lager), men ordning krävs: växeln är kunddirektivets "separationen Mega", billigast och synligast. b5:s tenant-grund byggs som TypeScript-KONTRAKT + renderingslager (steg 2), INTE som databastabell — pro_-tabellerna väntar i fas 2 bakom DPA-grinden (b3 §DEL 3, b4 §2). Kontraktet är det som förhindrar ombygge vid kund nr 2 |
| K4 | b2:s rutter (/pro/klienter, /pro/analys, /pro/rapporter, /pro/priser) vs b3:s /pro/cockpit/* | **b2:s ruttstruktur vinner** | EN B2B-nav, inte två. Cockpiten är INNEHÅLLET i vyerna: /pro = morgonronden, /pro/analys = screening, /pro/klienter = klientvy (demoklient i MVP), /pro/rapporter = Rapportverkstan. Namnkonflikt mot privat /rapporter löses med etiketten "Rapportverkstan" (b2 §2.3) |
| K5 | b5 "disclaimern konfigureras per tenant" vs b4 "mal-låst, tre lager" | **b4 vinner på substans** | Tenant konfigurerar AVSÄNDAREN (logo/färger/kolofon) och kan LÄGGA TILL egen juridik. AK1A:s metod- + ansvarsdeklaration + data-t.o.m.-rad är mal-låsta: kan aldrig suddas, mjukas eller kortas — inte ens av Institution. b5:s formulering skärps därmed |
| K6 | b4:s 9 blockerare "före lansering" vs byggglädjen | **Blockerare = lanseringsgrindar, inte bygggrindar** | Allt personuppgiftsfritt får byggas, demas och visas FÖRE dokumenten. Grinden gäller: första betalande kund, första klientuppgiften, första fakturan (§5) |
| K7 | Pris-trappan lovar "20/100/obegränsat PDF-rapporter/mån" men PDF-väg saknas | **Copy-justeras NU; server-PDF i fas 3** | Ärlighet i löfte vs leverans (P4-kultur): nivåtexterna säger "20/100/obegränsat rapporter/mån — utskriftsklassat dokument (PDF-export på väg)" tills @react-pdf/renderer byggs i fas 3 när volymen motiverar (b3 §DEL 4) |
| K8 | b5: varumarke-vaktens "kunder"-VARNING (A8) träffar B2B-ytor | **Yta-regel i vakten** | B2B har faktiskt kunder; elever har elever. Vakten får undantag för /pro + admin-filer — dokumenteras som del av steg 2, annars drunknar manuella granskningar |
| K9 | b3 "ADMIN_PASSWORD som cockpit-auth i MVP" | **Accepterad interimsform** | Demo-läge bakom befintlig låsrad är ärligt och personuppgiftsfritt; riktiga seats kommer i fas 2. NOTERA: aldrig som långsiktig lösning |

## 3. Rond 2 — ETT beslut i fyra delar
**(1) SEPARATIONSDESIGNEN — exakt (b2 R1–R3 antagna i helhet):**
- **Toppväxel "Privatperson | Företag"** — ren länk-separation, URL:n är läget,
  INGEN cookie (b2 §1.3: SSG-säker, delbar, crawlbart). Segmented control i
  utility-raden på ALLA privatsidor (seo-page-shell.tsx + SPA-header) BREDVID
  InloggadKnapp: aktiv sida = icke-länk med aria-current; andra sidan = länk
  (Företag → /pro; på /pro: Privatperson → /). Mobil: egen rad överst i
  mobilmeny-drawern + i PRO-skalets mobilheader. Etiketter via ordlistan
  (nav.privatperson, nav.foretag — våg 51-mönstret).
- **Registret**: AK1A PRO-raden (meny-register.ts ~395) får `yttor:
  ["footer","sok"]` — ur menypanelerna (växeln äger B2B-ingången), kvar i
  sidfotens sitemap (SEO-internlänk) och sökbar i ⌘K.
- **PRO-skalets B2B-nav** (pro/layout.tsx): `AK1A [PRO] — Översikt · Klienter ·
  Analys · Rapportverkstan · Priser — [Boka demo]` med rutterna /pro, /pro/klienter,
  /pro/analys, /pro/rapporter, /pro/priser. Marina väggar, guldbadge, style-taggen
  som döljer AI-Mentor/Short-Seller, force-static på alla publika PRO-sidor.
  **Footerfix: /terms → /villkor (dödlänk → 404 idag — bugg).**
- **Delade ytor** (b2 §3c): /blogg, /villkor, /privacy-policy, /transparens,
  /om-oss, /manifest förblir delade — EN juridisk sanningskälla; B2B-villkoren
  blir PRO-sektion på /villkor, aldrig kopia. LÄRA/PRAKTIK/kurser/kalkylatorer:
  B2B-naven länkar ALDRIG dit. /fas3 = gränssida med explicit PRO-CTA.
- **CTA-flödet** (b2 R3): tre diskreta "Är du rådgivare?"-block (/fas3-avslut,
  Superanalysen, Dina rapporter) + footer-länken. Guldknapps-logik, copy via
  kontrolleraText, aldrig blinkande banner.

**(2) B2B-BYGGORDNINGEN — tenant-grund + cockpit-MVP FÖRENÅGÅENDE (b3 §DEL 4
MVP-rad + b5 steg 0–1):** MVP:n = morgonronden (/pro) + screening med sparade
filter (/pro/analys) + klientvy på DEMOKLIENT (/pro/klienter) + mötespaket v1 +
Rapportverkstan print-först (/pro/rapporter) + /pro/priser. **0 nya
databastabeller.** Tenant-grunden = kontraktet (pro_-liknande typer + white-label-
renderingslager) — persistensen (pro_organisation, pro_seat, pro_klient, …)
kommer i fas 2 bakom DPA-grinden. Demoklienten = medföljande forskningsportfölj
(icke-person); rådgivarens egen CSV körs i sessionen utan persistens.

**(3) JURIDISKA BLOCKERARE SOM BYGGGRINDAR (b4 §DEL 4 blir grindtabell, §5):**
- FÅ BYGGAS FÖRE (personuppgiftsfritt): hela MVP:n ovan, växeln, white-label-
  rendering, demo/boka demo-flödet, pris-sidorna, B2B-villkors-UTKAST.
- FÅ EJ FÖRE GRINDEN: (a) klientregister — även pseudonymiserat — kräver
  signerad DPA (art 28) + B2B-villkor publicerade; (b) första fakturan kräver
  B2B-villkor + moms-/fakturaflöde (priser exkl. moms i B2B); (c) Stripe-per-seat
  och server-PDF = fas 3; (d) behandlingsregister + publicerad underbiträdeslista
  (Vercel, Supabase, Stripe; EU-region verifierad) ska finsa FÖRE go-live;
  (e) mal-låsningen verifieras som TEST i sviten (disclaimer-blocket kan tekniskt
  inte redigeras bort); (f) engångs-juristgranskning av disclaimer-texter innan
  första rådgivarkund.
- REFERRAL-SPÄRR: affiliate-/referenslogik når ALDRIG /pro-ledet (oberoende
  rådgivares förbud mot tredjepartsersättningar) — permanent FORBUD.

**(4) PRISBESLUT-REKOMMENDATION till kundägaren (b4 alternativ A):** behåll
499 / 1 499 / 4 999 kr/mån/seat flat + engångs-onboarding 9 900 kr på Institution
(avklippt vid 2-årsbindning). AUM-/rev-share-pris AVRÅTT (transparenslöftet +
compliance-renhet mot oberoende rådgivare); hybrid B (rapportvolym-trappa) kan
läggas på senare — A blockerar inte B. Fas 3-certifierades 299 kr första året
kvar. Privatsidans 249/449/799 orörd. Slutligt beslut: kundägaren (K-B2B:2).

## 4. Cockpit-MVP — normativt (vy för vy)
Alla vyer i PRO-skalet, låsrad på varje vy: "Pedagogisk forskning — inte
investeringsrådgivning (2007:528)." Auth: befintlig ADMIN_PASSWORD-låsrad (K9).
**(a) MORNONRONDEN — /pro (översikten):** fyra kort i radial grid
(trafik-sakerhet-panelens kort-grid-DNA): 1) vågvalideringens träff-% per
(horisont, klass) ur cron-loggen; 2) regimen + N-vakt-status (AKM3-regim-chippet
— marknadens läge FÖRE klienternas); 3) veckans research + kalibreringens
Φ-status; 4) dina screeningar + nattens klassbyten mot gårdagens snapshot.
5-sekunderstestet gäller (NN/g).
**(b) SCREENING — /pro/analys:** korstabell-mönstret (100 bolag, sök, sortering
AKM1/AKM2/peer, branschgruppering) + filterfält på befintliga fält (status,
vågklass per horisont, täckning, golv-%) + NAMNGIVNA screeningar (localStorage i
MVP) + befordran till demoklientens bevakning / länk till djupanalys. CSV-importen
(csv-import.tsx) monteras här — instrument+vikter-regeln gäller oförändrad.
**(c) KLIENTVYN — /pro/klienter (DEMOKLIENT i MVP):** korthuvud (alias, nästa
uppföljning), portföljöversikt (innehav × vikt + aggregerad vågprofil),
AKM2-radar + profiljämförelse på tunga innehav (prop-drivna — ren import),
VagCell-rader per horisont, differens-chip "ändrat sedan sist". **MÖTESPAKETET
(b5 §2d) är klientvys-knappen**: regim-chip + forskningsläge + vågprofil +
senaste då-vs-nu + topp-3 nyheter med påverkanspoäng + peer för de tre största
innehaven → EN utskriftbar A4. Alla delmotorer byggda; vyn samlar bara.
**(d) RAPPORTVERKSTAN — /pro/rapporter:** Rapportbyggare-motorn (window.print +
@media print) bakom inloggning, med white-label-blocket I DOKUMENTET (omslagsband
"[firmnamn] × AK1A-metodik", tenant-fälten ur pro-admin-kontraktet) + mal-låst
metod-/risk-sida. Tre mallar (Portföljöversikt 20×5-värmematris, Djupanalys-kort,
Konfluens-sida) renderas ur /api/pro/analys-svaret. Rapportkvot-räknare i
localStorage i MVP (äkta i fas 2). Server-PDF: fas 3.
**(e) /pro/priser:** lyft ur #priser-ankaret till indexbar långsida; copy enligt
K7 (rapportkvoternas formulering). Landningssidans hero + tre ben + CsvImport
behålls som /pro-översiktens introduktion OVANFÖR morgonronden.

## 5. Grindtabellen — vad som låser vad
| Grind | Kräver | Låser upp |
|---|---|---|
| G1 Demo-läge (MVP) | inget — personuppgiftsfritt | hela cockpiten + Rapportverkstan + mötespaket på demoklient |
| G2 Första betalande kund | B2B-villkor publicerade (PRO-sektion /villkor) + juristgranskning av disclaimers + faktura-/momsflöde + behandlingsregister + underbiträdeslista publicerad | teckningsbara avtal, onboarding-faktura |
| G3 Klientregister (fas 2) | **signerad DPA (art 28)** + G2 | pro_-tabellerna, riktiga klienter (kod/alias), seats, bevakning, nästa uppföljning, system_events-spår, äkta rapportkvoter |
| G3.5 Compliance-export | G3 (per-tenant logg) | hash-kedjat rapportversionsspår + vem-såg-vad-export (b5 c) |
| G4 Institution-volym (fas 3) | G2+G3 + betalande volym | server-PDF, Stripe-per-seat, API-nycklar + rate-limit (b5 e — byggs när första kunden frågar) |

## 6. FORBUD — vad som ALDRIG får ske
1. Personuppgifter i MVP:n: klientnamn, personnummer, skuldlistor, identifierbara
   klientportföljer — FÖRBJUDET tills DPA signerad (G3). CSV-regeln (instrument +
   vikt/antal) är en teknisk spärr, inte policytext.
2. Referral-/remunerations-/affiliate-betalning till rådgivare: ALDRIG (obberoende
   rådgivares förbud mot tredjepartsersättningar — FI/MiFID II).
3. AUM-/rev-share-prissättning i nivå 1–2: AVRÅTT permanent; den bryter
   transparenslöftet och ger inducement-optik i kundernas tillsyn.
4. Cookie-styrd menyväxel: FÖRBJUDEN — URL:n är läget, alltid (SSG, delbarhet, crawl).
5. Personliga rekommendationer, klient-omdömen, signalverb (köp/sälj/öka/undvik)
   på B2B-ytor: FÖRBJUDNA (2007:528 ärvs rakt in i B2B). Metod-blocket är
   generiskt: samma portfölj ⇒ samma klasser oavsett läsare eller tenant.
6. White-label får ALDRIG sudda, mjuka eller korta AK1A:s metod- +
   ansvarsdeklaration, data-t.o.m.-rad eller falsifierbarhetsrad. Tenant LÄGGER
   TILL sin info — aldrig subtraherar (K5).
7. Klientöverblick byggd på persondata (Morningstar/FactSet-vägen): FÖRBJUDDEN
   som arkitektur — anonym portföljidentitet (kod + tickers + vikter) är produkten.
8. B2B-naven länkar ALDRIG till LÄRA/PRAKTIK/kurser/kalkylatorer; privata menyer
   renderas ALDRIG i PRO-skalet.
9. Legacy AI-organ-tabellerna (350+): rörs ALDRIG — fas 2 bygger enbart i ny
   pro_-namnrymd (17,7M-raders-krisen är skälet nog).
10. Ny spårning/pixels/retargeting på B2B-ytor: FÖRBJUDET (P6). A8-"kunder"-
    lexikonet gäller elevytor — B2B/admin behöver yta-regeln i vakten (K8).
11. Slump, klocka eller Date.now i nya lib-funktioner: FÖRBJUDET (P1) — samma
    portfölj ⇒ JSON-identiskt utdata oavsett tenant, tid och körning.
12. Konsumentvillkor (ångerrätt, 90-dagars-garanti) blandas ALDRIG in i B2B-
    villkoren — skilda avtalsvärldar (2022:260/261 gäller inte B2B).

## 7. Byggordning med acceptanskriterier
| # | Steg | Bygger | Acceptanskriterier (ALLA ska passera) |
|---|---|---|---|
| 1 | **Separationsväxeln** (b2 R1+R2) | toppväxel-komponent, utility-rader (seo-page-shell + SPA-header), mobil-rader, register-rad `yttor:["footer","sok"]`, PRO-skalets 5-rutters nav, footerfix /terms→/villkor | (i) växeln syns på varje privatsida + varje PRO-sida, aktivt läge aria-markerat; (ii) AK1A PRO ur alla menypaneler, kvar i sidfot + ⌘K; (iii) ingen cookie styrrnar skalet (test: direktlänk /pro renderar PRO-skal i ren HTML); (iv) /terms-returnerar aldrig 404-länk; (v) tsc --noEmit 0 nya fel; force-static kvar på /pro-sidorna |
| 2 | **Tenant-kontraktet + white-label-lager** (b5 steg 0, K3-dom) | pro-typer.ts (organisation, white-label-fält, disclaimer-konfig), renderingslager som läser admin-kontraktet (pro-admin-v1 → kontraktstyp), mal-låsnings-TEST, yta-regel i varumarke-vakten (K8) | (i) kontraktet täcker firmnamn/logotyp-URL/färgtema + LÄGG-TILL-juridik; (ii) test bevisar: disclaimer-blocket kan inte renderas bort (negativ test-case); (iii) vakten ger 0 FEL på /pro-ytor med "kunder"; (iv) determinism: samma kontrakt + samma portfölj ⇒ identiskt utdata; (v) 0 nya tabeller |
| 3 | **Cockpit-MVP: morgonrond + screening** (b3 a+b) | /pro-översiktens fyra kort, /pro/analys med korstabell-filter + namngivna screeningar (localStorage) + CSV-import monterad | (i) morgonronden laddar < 5 s med riktiga data (träff-%, regim, research, screeningar); (ii) sparad screening återskapas bitidentiskt efter omladdning; (iii) varje vy bär 2007:528-låsraden; (iv) 0 nya tabeller, 0 nya beroenden; (v) ADMIN_PASSWORD-låsrad på cockpit-ytorna |
| 4 | **Demoklient + mötespaket + Rapportverkstan** (b3 c+d, b5 §2d) | /pro/klienter (demoklient = medföljande forskningsportfölj), mötespaket-A4, /pro/rapporter (print-motor + white-label-block + 3 mallar), /pro/priser | (i) klientvyn visar radar + VagCell-rader + differens-chip på demoklienten UTAN någon personuppgift (test på datakontraktet); (ii) mötespaketet samlar regim + forskningsläge + vågprofil + då-vs-nu + topp-3 nyheter + peer på ETT utskriftbart A4; (iii) utskriften bär "[firmnamn] × AK1A-metodik" + mal-låst sida; (iv) pris-copy justerad enligt K7 (inget PDF-löfte som ej levereras); (v) 0 nya tabeller |
| 5 | **Juridikpaketet — G2-grinden** (b4) | PRO-sektion på /villkor (B2B-villkors-utkast: omfattning, seats/bindning, ansvarsbegränsning 36 §-standard, rådgivarens institutansvar, metodik-licens, mal-låst deklarationskrav, uppsägning, svensk lag), DPA-mall (9 punkter), policy-komplement (biträdesroll), underbiträdeslista-sida, behandlingsregister-poster | (i) B2B-villkoren innehåller INGA konsumentklausuler (FORBUD 12); (ii) DPA-mallen täcker art 28.3 alla 9 punkter inkl. underbiträdeslista + incidentflöde; (iii) integritetspolicyn beskriver biträdesrollen med länk till DPA; (iv) underbiträdeslistan publicerad med 30-dagars-avisering; (v) mal-låsning + referral-spär (FORBUD 2) har maskinella test |
| 6 | **VILLKORAD fas 2 — klientregistret** (b3 DEL 3, b5 steg 2–4) | pro_-tabellerna (pro_organisation, pro_seat, pro_klient med klientkod, pro_klientinnehav, pro_screening), seats, bevakning, äkta rapportkvoter, system_events-spår, compliance-export | KRÄVER: (α) signerad DPA med första kund; (β) G2-grinden passerad; (γ) RLS org_id-scoping testad; (δ) mjuk radering (raderad_vid) + registrerades-rättigheter-flöde testat; (ε) 0 skrivningar till legacy-tabeller. Compliance-export (G3.5) och MÖS-klientrapporter (sv/en/ar) följer efter — B2B-API (b5 e) byggs när första kunden frågar |

Steg 1–2 kan parallelliseras (olika fil-domäner); steg 3–4 sekvenseras inom
cockpiten. Prioritet vid konkurrens = tabellordningen. Varför växeln först:
kunddirektivet dömer — separationen är det Mega som allt annat vilar på; utan den
är cockpiten en privatverkstad med fel meny. Varför tenant-kontraktet som tvåa:
varje vy i steg 3–4 konsumerar det — bygg EN gång (b5 rek 1).

## 8. Krav på KUNDEN (blockerande input — K-B2B)
| ID | Krav | Leverans | Låser upp |
|---|---|---|---|
| K-B2B:1 | Juristgranskning (timmar, inte veckor) av B2B-villkor + DPA-mall + de tre disclaimer-lagren | granskat/ godkänt dokument | G2-grinden — första betalande kund |
| K-B2B:2 | Prisbeslut: bekräfta/ändra alternativ A — 499/1 499/4 999 flat/seat + onboarding 9 900 kr Institution (avklippt vid 2-årsbindning) | skriftligt beslut | /pro/priser skarp copy + teckningsflöde |
| K-B2B:3 | Fakturerings-/moms-uppgifter: exkl. moms-redovisning, SE-moms vs reversed charge, fakturaväg (manuell i fas 2 / Stripe i fas 3) | beslut + uppgifter | G2-grindens fakturadel |
| K-B2B:4 | White-label-demounderlag: demofirmans namn + logotyp-URL + färgtema (för demot; kan vara påhittad demo-firma) | fil/URL | Rapportverkstans white-label-demo (steg 4) |
| K-B2B:5 | Underbiträdes-bekräftelse: Vercel + Supabase + Stripe (EU-region verifierad) listas i DPA + publicerad lista | godkännande | DPA-mallen (steg 5) |
| K-B2B:6 | Första pilotkunds identitet + DPA-signatur (fas 2) | signerat avtal | G3-grinden — klientregistret, seats, äkta kvoter |

## 9. Byggregler (fil-domäner — INGEN agent rör en annans filer)
- Växel + utility-rader: src/components/ak1a/{seo-page-shell, header,
  mobilmeny}.tsx + ny toppvaxel-komponent.
- Register: src/lib/meny-register.ts (ENDAST yttor-raden för AK1A PRO).
- PRO-skalet/nav: src/app/pro/layout.tsx; rutter: src/app/pro/{klienter, analys,
  rapporter, priser}/page.tsx; cockpit-komponenter: src/components/ak1a/pro/.
- Tenant-kontrakt: src/lib/pro/typer.ts + renderingslager; mallar renderas ur
  /api/pro/analys-svaret (utökas additivt, aldrig brytande).
- Juridiksidor: src/app/villkor/page.tsx (PRO-sektion) + ny underbiträdes-sida;
  DPA-mall som dokument i data/ eller docs/.
- Arv-regeln: importera endast `import type` mellan domäner; AKM2/AKM3-lib
  (src/lib/{akm2,akm3}/) läses av cockpit-komponenter men RÖRS ALDRIG i B2B-
  vågorna. `npx tsc --noEmit` = 0 nya fel per steg. Testfil i verktyg/ per nytt
  modul (100 %-mönstret). JSON-nycklar utan åäö. ALLT på svenska med korrekta
  åäö i UI-texter. ALDRIG investeringsråd-formuleringar (2007:528). Committa
  inget utan moderagentens godkännande.

## 10. Mätning — vad som dömer arbetet
Direktivet har två mätbara ansikten: (1) separationen — en besökare ska på 5 s
förstå vilken värld hon är i och kunna växla med ETT klick från varje sida;
(2) cockpiten — en rådgivare ska på morgonronden förstå marknadens läge, sina
screeningars rörelser och nästa mötes underlag INNAN kaffet är klart. Fas 2
döms av pilotkundens faktiska veckorutim (inte av entusiasm): utan tecknad
pilot inom 2 kvartal efter G2 omprövas byggordningen öppet i nytt
styrelsebeslut. Formuleringen består i alla led: "öppet kvitto om det förflutna
— aldrig garanti om framtiden."

---
*Källor: data/forskning/B2B/{b1-plattformar, b2-persona-vaxling,
b3-rådgivardashboard, b4-juridik-priser, b5-arv-och-nya}.md ·
data/forskning/AKM3/AKM3-BESLUT.md · data/forskning/MARKNAD/MARKNADS-BESLUT.md ·
src/app/pro/{page,layout}.tsx · src/lib/meny-register.ts ·
src/components/ak1a/seo-page-shell.tsx. Pedagogisk forskning — ALDRIG investeringsråd.*
