---
name: styrelsemote
description: Konkalla AK1A:s AI-styrelse (5 roller: ordförande, teknik, säkerhet, juridik, tillväxt) enligt styrelseregel R1, tolka beslut, tillämpa R2-grinden (existentiellt väntar kund) och protokollföra. Använd vid prioriteringsfrågor, tvivel, riskbedömningar, större beslut. Nyckelord: styrelsen, möte, beslut, R1, R2, konkalla.
---

# Styrelsemöte — AI-styrelsen som lag

Styrelsen (våg 91 A2) är 5 organsessioner: ORDFÖRANDE, TEKNIK, SÄKERHET,
JURIDIK, TILLVÄXT. Mötet körs asynkront av styrelsemotorn och överlever
requesten.

## Reglerna R1–R4 (permanenta)

- **R1:** Varje kundfråga kan konkallera styrelsen.
- **R2:** Beslut tillämpas OMEDELBART — utom existentiellt (domän,
  priser, betalning, extern publicering, juridik/GDPR, radering,
  API-nycklar) = **VÄNTAR KUND**.
- **R3:** Mega-projekt körs autonomt med full access.
- **R4:** ~9 parallella agenter max.

## Konkalla (motor + API)

Studiens UI kör mot `POST /api/studio/styrelse` med `{fraga}` — svaret är
`{id}` direkt, mötet pågår asynkront; polla `GET ?id=<id>` (inkrementellt
`&senast=<N>`). Rutten är admin-skyddad (sessionscookie `ak1a_admin`
eller `x-admin-password`). Agenten når samma motor via
`src/lib/studio/styrelse.ts`; test: `node verktyg/testa-styrelse.mjs`.

Praktiskt för mig som agent: kundens fråga i /studio besvaras ofta BÄST
genom att jag (a) formulerar frågan skarpt med projektkontext, (b) låter
motorn mötas, (c) tolkar beslutet, (d) tillämpar det enligt R2.

## Utdata (vad mötet ger)

- `beslut`, `motivering`, `atgarder[]`, `existential` (true → väntar kund)
- `atgardsStatus`: `KORS_DIREKT` | `VANTAR_KUND`
- `pipelineRader` → skrivs automatiskt till `data/forskning/PIPELINE-KO.md`
- Protokoll förs automatiskt i `data/forskning/STYRELSE-BESLUT.md`
  (dubletter vid omkörningar är kända — rensa inte autonomt, de är spår).

## Efter mötet

1. `KORS_DIREKT` → börja utföra åtgärderna direkt (R2), dokumentera i
   worklog + STYRELSE-ADMIN-MEGA.md med vågnummer.
2. `VANTAR_KUND` → formulera kundbeslutet TYDLIGT (2–4 alternativ,
   konsekvenser, min rekommendation) i svaret till kunden.
3. Byggkontrakt för större vågar skrivs som "TILLÄGG VÅG N" i
   STYRELSE-ADMIN-MEGA.md: mål, block (bokstavsnummer), KVD-rad.

## Tveka aldrig

Existentiellt (juridik, priser, domän, radering) utanför R2-listan?
Behandla det SOM IFALL existen�tiellt — fråga kunden. Styr aldrig upp
beslut bakom kundens rygg.
