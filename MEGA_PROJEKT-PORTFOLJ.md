# MEGA-PROJEKT: Portföljforskningssystemet enligt AK1A-ekosystemet

> Direktiv från kundägaren (2026-09-01): samla info A–Ö, kontrollera cache-databasen,
> analysera med Python, hitta bolag som växer på kort/medellång/lång/Mega-sikt
> (mikro mindre viktigt), bygga portföljsystem enligt vågar + fundamental våganalys
> + golv + rätt värde enligt AKM1-metodik, spara analyser för återanvändning,
> risknivå-val för klienten, månads-/kvartalsuppföljning med "då vs nu"-sidor +
> notiser, ersättningsförslag när strikta krav bryts, 10 bästa bolag × 10 branscher
> i fullständiga korstabeller (AKM1 + fundamental och teknisk vågdynamik),
> prenumeration med 20 % rabatt för Fas 2/3. **30–40 agenter parallellt.**
> **Forskningsbaserade analyser — ALDRIG investeringsrådgivning (lagen 2007:528).**

## Grundregel: typkontraktet

**ALLA agenter och motorer ÄRVER `src/lib/portfolj-forskning/typer.ts`.**
JSON-nycklar utan åäö. Vågklasser: impulsvag|korrigering|basbygge|osatt.
Horisonter: mikro|kort|medellang|lang|mega (mikro viktas lägst = 0.05).
Motorn gissar aldrig — "osatt" är ett hedervärt svar.

## Fasplan

| Fas | Innehåll | Status |
|---|---|---|
| **P0 Arkitektur** | Typkontrakt + detta dokument + agentplan | ✅ KLAR |
| **P1 Datainsamling** | Python: Yahoo + MarketStack, 10 branscher × 10 bolag, dubbelkällor, cache `data/cache/fundamental-{T}.json`, univers `data/portfolj-system/bolagsunivers.json`, validerare | 🔄 agent pågår |
| **P2 Fundamental vågmotor** | `fundamental-vagmotor.ts`: per AKM1-variabel vågklass + dynamik ("var vi är på väg"), trippelmetod-majoritetsröstning, per-horisont aggregering | 🔄 agent pågår |
| **P3 Riskportfölj** | `riskportfolj.ts`: 3 risknivåer × 3 tillväxttakter, poängsättning, strikta krav (KravKontroll), ersättningsmotor, `data/portfolj-system/priser.json` | 🔄 agent pågår |
| **P4 Korstabell + dashboard** | `korstabell.tsx` (10×10 AKM1 + vågklasser × 10 horisonter), `portfolj-djupvy.tsx` (då-vs-nu), `riskval-panel.tsx`, fixtures | 🔄 agent pågår |
| **P5 Uppföljning** | Månad/kvartal-omanalys: snapshot-generator, "då vs nu"-jämförelse, notis-typ "portfolj", vercel.json-cron, förändringsdetektor (AKM1-delta, vågklassbyte, pris %) | ⏳ kö |
| **P6 AKM1-bedömare** | Python/TS: beräkna AKM1-poäng (V01–V20 med motivering) ur nyckeltal + skriv `data/portfolj-system/akm1-{T}.json` | ⏳ kö |
| **P7 Integration** | Rutter: `/portfolj-forskning` (korstabell), kundportal-vy, riskval-flöde, bygga portfölj → spara i Supabase, gating mot prenumeration | ⏳ kö |
| **P8 Prenumeration** | Prissida + Stripe/klarna-flöde (eller manuellt), rabattlogik Fas 2/3 = 20 %, `/transparens`-juridik: forskning ≠ rådgivning | ⏳ kö |
| **P9 Kvalitet** | Kvalitetsvakten-sektion, tester, tsc, prod-deploy + H1-verifiering | ⏳ kö |

## Dataflöde

```
Yahoo + MarketStack (P1, Python)
   → data/cache/fundamental-{T}.json (rådata, dubbelkollat)
   → AKM1-bedömare (P6) → akm1-{T}.json (poäng + motivering)
   → fundamental-vagmotor (P2) → fvag-{T}.json (vågklass + dynamik per variabel)
   → analys-motor (befintlig, teknisk) → tvag per horisont
   → korstabell-aggregat (P4) → data/portfolj-system/korstabell.json
   → riskportfolj (P3) → PortfoljForslag per risknivå-kombination
   → uppföljning (P5) → snapshots + notiser → kundens portföljsida (då vs nu)
```

## Kända beslut

- **Spara analyser för återanvändning**: varje analys-steg skriver JSON i
  `data/portfolj-system/` + `data/cache/` med datum + källa — samma struktur som
  `data/analyses/*.json` (PREC, VOLCAR-B etc.) men utbyggd med vågfält.
- **Mikro minst viktat**: HORIZONTER_VIKT = mikro 0.05, kort 0.20,
  medellang 0.25, lang 0.30, mega 0.20.
- **Golv-typer**: ncav | reim | tillgangstung | ingen | osatt — beräknas där
  data finns, aldrig gissat.
- **Prisförslag** (väntar kundägarens beslut): se priser.json-platshållare.
- **Serialisering av deep-courses.json**: språkbatcher skriver
  SAMMA fil — en agent i taget per fil (lärdom från expert C).

## Agentkö (nästa vågor när P1–P4 landar)

1. P5 uppföljnings-motor + notis-typ (1 agent)
2. P6 AKM1-bedömare Python (1 agent)
3. P7 integration: rutter + Supabase-persistens + gating (2 agenter)
4. P8 pris-/prenumerationssidor + juridik (1 agent)
5. P9 testbatteri + Kvalitetsvakten + deploy (1 agent + moder)
