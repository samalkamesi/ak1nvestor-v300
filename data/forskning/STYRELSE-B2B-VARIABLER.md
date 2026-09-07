# STYRELSE — B2B-grind + variabelregister (våg 77, kunddirektiv 2026-09-07)

**Kunddirektiv:** (1) "Följ B2B från allmänheten — företagare ska ej se allt,
vi är inte klara där; när vi är klara kan vi integrera den delen."
(2) "Bygg högsta integration i hela hemsidan — som Excel: ändra siffra i A
så ändras det i hela hemsidan; beroende för högsta autonomi, slippa ändra
ord för ord/siffra för siffra. Detta saknas helt." (3) Styrelsen konsulteras
före bygge; därefter finslipning + felfokus.

## ROND 1 — Analys (lägeskoll mot kod 2026-09-07)

**B2B-läge:** /pro med cockpit (5 rutter + priser) är HELT publik —
toppväxeln länkar rakt in, footer+⌘K visar "AK1A PRO", ingen
aktiveringsflagga finns. G2 (juristpaket) är INTE klar → exponeringen
riskerar halvfärdigt intryck + policy-mässig otidighet.

**Variabelläge:** src/lib/siffror.ts täcker ENDAST 8 kurs/bok/quiz-tal
(build-time ur data/siffror.json — bra mönster men smalt). Priser är
hårdkodade på minst 3 ställen (privat: prenumerationsflödet; B2B:
/pro/priser/page.tsx; ev. CTA-copy) — ändra ett pris = flera filer =
kundens kärnproblem. Ingen vaktrule mot hårdkodade pris-siffror.

## ROND 2 — Beslut (ordförandesynes, forskarunderlag: B2B-BESLUT §3,
siffror.ts-kontraktet, o1/m9-dokumenten)

### B1 — B2B-GRIND (aktiveringsflagga, INTE radering)
- Ny gemensam källa src/lib/b2b-status.ts: `b2bAktiv()` läser
  `process.env.B2B_AKTIV === "1"` — DEFAULT AV i prod tills kunden slår på.
- AV-läge: toppväxeln visar ENDAST Privatperson (Företag-segmentet dolt),
  "AK1A PRO"-länkar döljs i footer + ⌘K-paletten, /pro-rutterna renderar
  en gemensam "Under uppbyggnad"-vy (noindex, inga cockpit-data, ingen
  inloggningsyta) — koden och alla PRO-komponenter finns kvar oskadda.
- PÅ-läge (senare, env-ändring i Vercel — noll kodändring): allt återställs
  som idag. Motivering: kundens "när vi är klara så kan vi integrera".
- Juridik: bygred-sidan är neutral (inga prislöften, inga personuppgifter).

### B2 — VARIABELREGISTRET (Excel-beroendet, steg 1: tal + priser)
- Ny src/lib/variabler.ts = ENDA källan: PRISER (privat Fas 2/3 månad+år,
  B2B 499/1 499/4 999 + onboarding 9 900) + re-export av SIFFROR +
  kanonik-tal (27 kategorier, 25 flaggskepp osv. efter hand).
- ALL copy/logik interpolerar ur registret (prenumeration.ts räknar ur
  registrets priser; /pro/priser + alla CTA-ytor läser registret).
- Kvalitetsvakten utökas: hårdkodade pris-siffror (249|449|799|499|1499|
  4999|9 900) i src-copy = FEL (undantag: sel/testfiler + registret självt).
- Propageringsmodellen (ärlig "Excel" för SSG): ändra ETT värde i
  registret → `npm run build` → hela sajten uppdaterad; dokumenteras i
  registrets filhuvud + worklog. Klientreaktiva ytor (kalkylatorn) räknar
  redan live ur samma källa.
- Steg 2 (senare våg, dokumenteras som kö): kanoniska STRÄNGAR
  (mejl, org.namn, sociala URL:er) i registret + ev. CMS-panel.

### B3 — Process
- Byggordning: grinden (små src-edits, main) → registret + svep (main +
  ev. agent för CTA-ytor) → tsc/motorer/vakten → push. Finslipningsrond
  (kundens "läsa många problem") = nästa våg med systematisk
  genomläsningsslista.

## ROND 3 — Risker
- Grinden döljer inte gamla cachade sidor → noindex + sw-hygien finns;
  robots för /pro stängs i gated-läge (robots.ts läser b2bAktiv).
- Pris-svep får INTE röra betalningslogikens bindning mot ev. framtida
  Stripe-produkt-ID:n (finns ej ännu — rent läge).
