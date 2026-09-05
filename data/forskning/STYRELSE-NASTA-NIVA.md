# STYRELSE-NASTA-NIVA — Lägesanalys + nästa nivå-beslut (våg 65)

**Dokument:** AI-styrelsens ordförande, AK1A Research Lab · **Datum:** 2026-09-04
**Direktiv:** "Fortsätt fråga ai styrelse med max agenter kapacitet parallellt."
**Underlag:** worklog.md våg 59–64 · data/forskning/ (AKM3, MARKNAD, B2B, OPTIMERING) ·
data/motorregister.json (42 motorer) · verktyg/kor-oversatt-batch.mjs --status (2026-09-04).
**Status:** normativ vägledning för våg 66–68. INGET COMMITTAT.

---

## ROND 1 — LÄGESANALYS: LEVERERAT vs ÖPPET

### 1.1 Levererat (bevisat i worklog + verifierat mot status)

| Område | Levererat | Bevis |
|---|---|---|
| **Översättning (MÖS)** | UI **100 %** (295/295 × en+ar) · grundkurser **V01–V10 komplett** med perfekt kvalitet (100 p, 0 nekade) · batchmotor + kvalitetsgrind + täckningstabell i admin · visuell-block-buggen fixad | --status: 2 196 unika objekt, 2 155 publicerade, 32 utkast; våg 64 |
| **AKM3** | Sex mogna steg BYGGDA: ensemble+prediktionslogg (hash-kedjad), Bana B + tröskel v2, osäkerhetsintervall, peer-läger, regimindikator (hysteres+2-snapshot), kalibreringscron med LÅST grind (ΔΦ=0) | svit 105/0/0; AKM3-BESLUT §11 steg 1–6 ✓ |
| **B2B-cockpit (/pro)** | Separationsväxel + PRO-nav (5 rutter) · tenant-kontrakt + mal-låst disclaimer (fientligt test nekat) · morgonrond med RIKTIG data · screening 100 bolag + CSV · demoklient + mötespaket-A4 + Rapportverkstan print-först · priser alternativ A | våg 61 komplett; 0 nya tabeller, 0 personuppgifter |
| **Marknad våg 1–3** | 389 OG-bilder (deterministiska) + openGraph.url-bugg · varumärke som KOD (26 förbjudna fraser, tonvakt 2b) · del-rad + generaliserat DelaKort + CTA-luckor | kvalitetsvakten GRÖN |
| **Optimering våg 1** | 3 prod-kraschar fixade · requireAdmin på 6 ytor · prevHash-fallback (äkta kedjor på prod) · ⌘K-fetch 16,6 MB→75 kB (−99,6 %) · korstabell 2 266→413 kB (−82 %) · return-URL + prenum-CTA + Fas 2-CTA + hreflang-reciprocitet · 4 första long-tail-guiderna | tsc 44→34 · sitemap 887→897 |
| **Forskning** | 20 rapporter (AKM3 r1–r7, MARKNAD m6–m10, B2B b1–b5, OPT o1–o4) + 3 normativa beslut | data/forskning/ |

### 1.2 Öppet (per område, med ägare)

| Område | Öppet | Siffra/ställning |
|---|---|---|
| **Översättning** | Kursblock utöver V01–V10 + hela bloggen | 2 196/139 164 objekt ≈ **1,6 %** (publicerade 1,55 %; kursblock ~1,1 %, blogg **0 %**). Not: kundens "~4 %" gäller sannolikt annan nämnare — styrelsen redovisar exakta tal. Kvar: **136 968 objekt** (~24,5 M tecken) |
| **AKM3 steg 7–9** | Villkorade av data, ej byggbart | Steg 7 (Φ-ändring): n_eff ≥ 20 episoder ≈ 8–12 kvartal. Steg 8 (regimprofiler ~2028). Steg 9 horisontvyer: V1/V2/V3 — men **reglaget moget NU** (r6 §6: kräver bara steg 3-chippet) |
| **B2B** | **G2-juridikpaketet saknas** = enda blockeraren till första betalande kund | Cockpiten demo-färdig (G1); G2 kräver B2B-villkor + DPA-mall + behandlingsregister + underbiträdeslista + jurist + faktura/moms |
| **Organiskt** | 16 av 20 long-tail-guider · FAQPage-schema · llms.txt-frågekarta · /en+/ar orphan (ingen språkväljare) | 0/20 → 4/20; hreflang fixat men speglarna saknar ingång |
| **Prestanda rest** | Kall TTFB 459–936 ms (17,4 MB bootstrap-parse) · 9 globala klientkomponenter · font-preload | o1 topp 3–5 kvar |
| **Robusthet rest** | 16 oanvända deps · dubbla lockfiler · tre menyimplementationer | o4 §3–4, icke-kritiskt |
| **m10 referral** | Belöningssystem blockerat av kundpolicy J1–J2 | QR-attribuering (slumpkod) mogen att bygga |
| **Vågmotor** | Kalibrering samlar (ΔΦ=0) — croner matar Bana B automatiskt | Ingen agentinsats nyttig före ~2028 |

### 1.3 Kundkrav som BLOCKERAR (befintliga, ej nya)

| # | Krav | Blockerar | Kostnad för kunden |
|---|---|---|---|
| K-SÄK:1 | **CRON_SECRET i Vercel** (12 schemalagda rutter öppna — spam/kvot-vektor) | Säkerhet, prod-cronerna | minuter |
| K-SÄK:2 | **SQL-index** (ALTER-system_events-composite.sql i Supabase-editorn) | Prestanda på 45k-rader-läsningar | minuter |
| K-Ö:1 | **DeepL pro-key** (frivillig accelerator: registret på ~17 h i stället för veckor) | Takten på 100 % — ej själva vägen | abonnemang |
| K-B2B:1 | **Juristgranskning** av G2-paketet (agent DRAFTAR — se satsning 2) | Första betalande kunden (G2) | timmar, inte veckor |
| K-B2B:2 | **Prisbeslut** alternativ A (499/1 499/4 999 + onboarding 9 900) | Skarp copy + teckningsflöde | ett beslut |
| K-B2B:3 | **Faktura/moms-uppgifter** (exkl. moms, SE vs reversed charge) | G2:s fakturadel | beslut + uppgifter |
| K-B2B:5 | **Underbiträdes-bekräftelse** (Vercel+Supabase+Stripe, EU-region) | DPA-mallens publicering | godkännande |
| K-B2B:6 | Pilotkunds DPA-signatur | G3 klientregistret (fas 2) | signerat avtal |
| K-M10:J1–J2 | Referral-policy + ROMP-rad | Belöningssystemet (ej QR-attribueringen) | policy-beslut |

**Slutsats rond 1:** Plattformen är tekniskt i toppskick (tsc 34, svit 105/0/0, vakten GRÖN,
0 personuppgifter i MVP). De två värdeskapande luckorna är (i) 98,4 % av översättnings-
registret och (ii) G2-juridiken som står mellan cockpiten och första intäkten. Ingen av
dem kräver ny arkitektur — bara agentkapacitet + kundens pappersarbete.

---

## ROND 2 — NÄSTA NIVÅ-BESLUT: rankning av 8 satsningar

Rankningskriterier: (1) värde mot kundens egna direktiv, (2)(agent-)parallelliserbarhet,
(3) beroende av kundinput, (4) beslutsenlighet (bryter inget fattat beslut).

### RANK 1 — (a) ÖVERSIKTIONSBLITZEN till 100 % (dagens dagliga agentpaket)
- **Värde:** kundens eget direktiv ("varenda ord översätts") + största differentieringen
  (sv/en/ar i världsklass — B2B-arv #4 MÖS, arabiska nästan omatchat av konkurrenter).
  SEO: varje komplett kurs = nytt indexerbart språkkluster.
- **Kostnad:** ~0 nytt bygge — v64b-pipelinen (extrahera/memo/bygg/kontroll/diffa i
  tool-results/) är KURSOBEROENDE, bevisad på 384 poster × 2 språk med 100 p/0 nekade.
- **Agentbehov:** **högsta parallelliserbarheten av alla satsningar** — 4–6 ÖA-agenter/dag,
  varje agent ~60–90 block (kursvis uppdelning: inga filkonflikter, unika
  grundpaket-N.json per agent) + 1 motorbatch (MyMemory 10x-variant) som nattfyllnad.
- **Vad krävs av kunden:** INGET. DeepL pro-key accelererar (valfritt). Granskningskön
  (32 utkast) hanteras i panelen löpande.
- **Takt:** 2 agenter gav +1 052 publicerade/dag (våg 64, agent+motor) ⇒ 6 agenter ≈
  +2 500–3 000/dag ⇒ **hela registret ~7–8 veckor utan DeepL; dagar med DeepL pro**.
- **Prioriteringsordning inom spåret:** V11–V20 (kvarvarande AKM1-variabelkurser) →
  KM/TS/PC/RK/PF/SE/SJ/BF/MK/VM/UD (ämneskurserna) → blogg 1 016 kortkällor →
  bokpaketen → resten.
- **DOM: MOGET NU — satsning nummer ett.**

### RANK 2 — (d) G2-JURIKDIKPAKETET B2B (agent-draftat, kund-juristgranskat)
- **Värde:** enda vägen till INTÄKT. Cockpiten är demo-färdig sedan våg 61; B2B-BESLUT
  §7 steg 5 är redan beslutat men OUTBYGGT. B2B-BESLUT.md §2/K6: juridiken är
  lanseringsgrind, inte bygggrind — paketet kan DRAFTAS av agent och granskas av kundens
  jurist (K-B2B:1 "timmar, inte veckor").
- **Leveranser:** B2B-villkors-utkast (PRO-sektion på /villkor: omfattning, seats/bindning,
  ansvarsbegränsning 36 §, rådgivarens institutansvar, metodik-licens, mal-låst
  deklarationskrav, uppsägning, svensk lag — INGA konsumentklausuler, FORBUD 12) ·
  DPA-mall art 28 (9 punkter enl. b4) · underbiträdeslista-sida · behandlingsregister-
  poster · policy-komplement (biträdesroll i integritetspolicyn).
- **Kostnad:** låg — dokument + en monottering på /villkor. Mal-låsning + referral-spärr
  har REDAN maskinella test (svitens tenant-block) = acceptans (v) delvis klar.
- **Agentbehov:** 1–2 agenter (draft + kodmontering), 1 våg.
- **Vad krävs av kunden:** juristgranskning (K-B2B:1) + prisbeslut (K-B2B:2) + moms/
  faktura (K-B2B:3) + underbiträdes-godkännande (K-B2B:5). Publicering sker först efter
  grönt ljus — drafen kortar kundens väg från veckor till timmar.
- **DOM: MOGET NU — högsta intäktsmultiplikatorn per agenttimme.**

### RANK 3 — (b)+(h) ORGANISKA TILLVÄXT-KOMBINATET: innehållsfabriken m9 + synlighetsresten
- **Värde:** 0/20 → 4/20 long-tail-guider; fabriken gör forskningsdata (67/100 bolag
  råa nyckeltal) till evergreen-branschöversikter — unikt, citerbart innehåll (GEO/
  KDD-mönstret) till nästan noll marginalkostnad. SYNERGI med blitz: varje komplett
  språkvy växer fabriken in i.
- **Leveranser:** kor-innehallsfabrik.mjs (kor-analysfabrik-mönstret: deterministisk,
  peer.ts n≥5, osatt=osatt) → data/blogg-fabrik/UTKAST (evergreen slug per V) ·
  kvalitetsgrind kontrolleraText ( LANDAT våg 60 — m9:s villkor är UPPFYLLT) ·
  FAQPage-schema på blogg/[slug] · llms.txt-frågekarta · **språkväljare /en|ar**
  (orphan-fix — annars syns inte blitzens arbete i Google!) · pilot V07+V08+V09.
- **Agentbehov:** 1 byggagent + 2–3 innehållsagenter (guider skrivs bättre än genereras;
  fabriken tar data-posterna, agenterna taggar med källa).
- **Vad krävs av kunden:** mänskligt godkännande per publicerad fabrikspost (m9 §0 —
  granskadAv-tvång; bulk-godkännande i panelen är OK).
- **DOM: MOGET NU (genereringsledet); publicering villkorat på granskningsrutin.**

### RANK 4 — (c) KALKYLATORREGLAGET r6 ("Vad händer vid full data?")
- **Värde:** pedagogisk USP som gör osäkerheten (steg 3, byggd) INTERAKTIV:
  K(x) = K + 20·(1−t)·x, port-klipp 45, avstängt i manuellt läge. Byggfärdig design
  i r6 §6 — reglaget kräver INTE V1/V2 (ren pedagogik över redan beräknat intervall).
- **Kostnad:** låg — 1 agent, ren UI + osakerhet.ts, inga nya data.
- **Agentbehov:** 1 agent, parallelliserbar med allt (egen fil-domän).
- **Vad krävs av kunden:** inget.
- **DOM: MOGET NU (styrelsens tidigarelåsning av steg 9:s andra halva, enligt r6 §6).**

### RANK 5 — (h) PRESTANDA/ROBUSTHET våg 2 (redan utsatt i våg 63-epilogen)
- **Värde:** kall TTFB-cache (17,4 MB bootstrap — varje kall besökare), lazy-load av 9
  globala klientkomponenter (ChatWidget 1 118 r, ShortSeller 804 r), font-preload,
  deps-städning (16 paket, dubbla lockfiler).
- **Agentbehov:** 1–2 agenter.
- **Vad krävs av kunden:** inget (K-SÄK:1–2 hänger med i kommuniken).
- **DOM: MOGET NU — men underordnat värdespåren; körs som utfyllnadskapacitet.**

### RANK 6 — (g) COMMUNITY/REFERRAL m10 — ENDAST QR-attribueringsdelen
- **Värde:** mättillväxt; men del-rad + DelaKort redan levererade (våg 60) och
  belöningssystemet blockerat av kundpolicy J1–J2.
- **Byggbart nu:** slumpkod (?ref=AB12CD9F, crypto-random, spärrbar, opt-in) +
  aggregate-only (antalTipsade INT) + ref-parameter-tvätt — juristsäkert enligt m10.
- **Agentbehov:** 1 agent.
- **Vad krävs av kunden:** J1–J2 innan BELÖNING visas; tack-badgen kan ligga dold.
- **DOM: VILLKORAT (belöning); QR-attribuering moget men låg prioritet just nu.**

### RANK 7 — (e) B2B-API:ET
- **DOM: VILLKORAT TILLS FÖRSTA KUNDEN FRÅGAR (G4).** B2B-BESLUT §7 steg 6 + b5 e:
  "API-nycklar byggs när första kunden frågar". Att bygga nu bryter fattat beslut utan
  efterfrågan — datacache-mönstret gör endpoints billiga ATT bygga sen. KUNDKRAVET
  K-B2B:6 (pilot-DPA) kommer före. **RANKAS MEDVETET NER; ett utkast kan förberedas i
  G2-paketets bilaga (prissatt API-trappa) utan kod.**

### RANK 8 — (f) VÅGMOTOR-FÖRBÄTTRINGAR vid kalibreringsdata
- **DOM: LÅST av design.** Steg 7 kräver n_eff ≥ 20 episoder; kalibreringscronen samlar
  (ΔΦ=0, grinden nekar även när villkor uppfyllda — GRIND_LASAD). Cronschemat
  (vagscan 05:00 → vagvalidering 05:30 → kalibrering dag 2) matar Bana B automatiskt —
  **enda legitima åtgärden nu är att INTE röra motorn** (projektionsinvarianten).
  Omprövning ~Q2–Q3 2027 när episoderna finns. **AVSLÅ byggnation nu.**

---

## REKOMMENDERAD VÅGPLAN 66–68 (3 dagar, max parallellitet)

**Format:** 8 agenter/våg (precedens: våg 61 körde 10). Varje våg avslutas med
main-verifiering: tsc ≤ 34 · svit 105/0/0 · kvalitetsvakten GRÖN · worklog. En dev-server
per träd (växlande portar, "döda efteråt").

### VÅG 66 — "Blitzdag 1 + intäktsdörren öppnas" (8 agenter)
| Agent | Uppdrag | Satsning |
|---|---|---|
| ÖA-1 | V11–V13 komplett (extrahera→bygg→kontroll→import) | (a) |
| ÖA-2 | V14–V16 komplett | (a) |
| ÖA-3 | V17–V20 komplett ⇒ **AKM1-variabelkurserna 100 %** | (a) |
| ÖA-4 | Bloggen: 1 016 kortkällor (ui-mall, högsta SEO-ROI/tecken) | (a) |
| JUR-1 | G2-PAKET-DRAFT: B2B-villkor + DPA-mall + underbiträdeslista + behandlingsregister → LEVERERAS KUNDEN för juristgranskning | (d) |
| M9-1 | Innehållsfabriken byggs + pilotutkast V07/V08/V09 i data/blogg-fabrik/ | (b) |
| R6-1 | Kalkylatorreglaget (osakerhet.ts-grund, port-klipp, manuellt-läge-av) | (c) |
| MAIN | Motorbatch (MyMemory 10x) + samlingsverifiering + worklog + KUNDKOMMUNIKÉ: K-SÄK:1–2 + K-B2B:1–5 + DeepL-val | alla |

### VÅG 67 — "Blitzdag 2 + synligheten" (8 agenter)
| Agent | Uppdrag | Satsning |
|---|---|---|
| ÖA-1 | KM+TS kompletta | (a) |
| ÖA-2 | PC+RK kompletta | (a) |
| ÖA-3 | PF+SE kompletta | (a) |
| ÖA-4 | SJ+BF kompletta | (a) |
| SEO-1 | Språkväljare /en|ar (orphan-fix) + FAQPage-schema + llms.txt-frågekarta | (h) |
| INH-1 | Guidpaket: 4 handskrivna long-tail-guider (kontrolleraText-grind) | (b) |
| M9-2 | Fabriksutkast → granskningskö i panel + bulk-godkännandeflöde | (b) |
| MAIN | Motorbatch + G2-montering: PRO-sektionen på /villkor i DOLT/granskat läge (publicering väntar jurist) + verifiering | (d) |

### VÅG 68 — "Blitzdag 3 + mätning" (8 agenter)
| Agent | Uppdrag | Satsning |
|---|---|---|
| ÖA-1 | MK+VM kompletta | (a) |
| ÖA-2 | UD + bokpaket del 1 | (a) |
| ÖA-3 | Bokpaket del 2 + påbörja restkurser | (a) |
| PERF-1 | Kall TTFB-cache (bootstrap-cachning av content.ts-data-access) | (h) |
| PERF-2 | Lazy-load globala klientkomponenter + font-preload | (h) |
| INH-2 | Guidpaket: 4 guider till (≈ 12/20 totalt) | (b) |
| JUR-2 | Integritetspolicy biträdesroll + /transparens-registerposter (om kundsignal; annars m10-QR-attribuering) | (d)/(g) |
| MAIN | Motorbatch + STYRELSEMÄTNING: täckningstabell, tsc, svit, vakten + vågplan 69–71 + ekvivalent KUNDKOMMUNIKÉ | alla |

### Efter 3 dagar (prognos om kunden ej levererar input)
- Översättning: ~2 200 → ~9 000–11 000 publicerade objekt (**8–13 %**; variabelkurser +
  blogg + 10 ämneskurser + bokpaket del 1 kompletta) — spåret mot 100 % etablerat i takt.
- G2-paketet på kundens juristbord = intäktsstart på timmar i stället för veckor.
- 12 long-tail-guider + fabriken pilot + språkväljare = organiskt machine på gång.
- Om kund LEVERERAR DeepL pro-key under väg: öka motorbatchen, agenter flyttas till
  gransknings-/kontrolljobb (kvoten försvinner som flaskhals).

### Tre fasta regler för våg 66–68
1. **Ingen agent rörs vid** akm2/karna, vagfundament-motor, privata korstabellen eller
   fattade beslut (B2B-API, Φ-grinden, G3 innan DPA).
2. **Fil-domäner deklareras** i varje agent-uppdrag (våg 61-mönstret: skilda paket-N.json
   per ÖA-agent = noll konflikter).
3. **Kundblockerarna kommuniceras DAG 1** (K-SÄK:1–2 är minuter; K-B2B:1–3 är vägen till
   första intäkten) — agentarna jobbar parallellt OBEROENDE av dem.

*Signerat: AI-styrelsens ordförande, våg 65 — "max kapacitet på det som skapar värde;
grindarna respekteras; kunden får sitt pappersarbete serverat färdigdraftat."*
