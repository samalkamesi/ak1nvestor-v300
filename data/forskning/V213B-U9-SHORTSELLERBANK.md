# V213B-U9 — Kontraktssvit: shortseller-bank

**Datum:** 2026-09-20 · **Agent:** fabriksagent u9 (BYGGARE) · **Våg:** v213b (10 otestade motorer → minimala kontraktssviter)

## Uppdrag

En kontraktssvit för motorn `src/lib/shortseller-bank.ts` (Agent 3 — The
Short-Seller, v2-banken): 30 attackfrågor över 10 ämnen med svårighetsgrad
1–3, varav 8 beräknings-attacker, plus urvals-/rangordningsfunktionerna
`valAttack`, `valBerakningsAttack`, `kontextuellInledning`, `historisktFallFor`,
`amneFranTes` och `forsvarsFragor`. Juridikkänslig domän (blankning) — sviten
testar KODENS kontrakt och mekaniskt att all text förblir utbildningsframing
(frågor om metoden, aldrig råd; 2007:528).

## Leverans

- `verktyg/testa-motor-shortseller-bank.mjs` — 43 kontroller i 7 sektioner
  (A konstanter & bankform, B valAttack, C valBerakningsAttack,
  D kontextuellInledning, E historisktFallFor, F amneFranTes, G forsvarsFragor).
- Deterministisk: ingen server, inget nätverk, ingen prod, inga data/-filer,
  ingen localStorage (motorn är ren data + rena funktioner). Kör på 10 ms.
- Metod-notering: banken (interndata `ATTACKER`) är ej exporterad, men
  exkluderingsmekaniken i `valAttack` (bas = osedda; aldrig en osedd fråga
  ospelad) gör att en exkluderingsloop inventerar den FULLT deterministiskt —
  därav hårda tal (30/3 per ämne/8 räknefall) i stället för gissningar.
  `Math.random` testas via invarianta egenskaper över många dragningar; där
  `nivaPool` gör urvalet entydigt testas exakta utfall (B5/B6/C3/G8).
- Kör under tsx: `npx --yes tsx verktyg/testa-motor-shortseller-bank.mjs`
  (ren node dör på .ts-importen — ERR_MODULE_NOT_FOUND är VÄNTAT, se
  aggregatorns tsx-återfall R107).

## Viktiga kontrakt som verifieras (ur koden, inte påhittade)

- **nivaPool-fallbacken (P8):** exakt nivå → inom nivån → hela poolen —
  inget innehåll låses; beräkningspoolen saknar svårighet 1 och öppnas då
  helt (både 2:or och 3:or spelas på nivå 1).
- **Exkludera-tillbakafall:** helt exkluderad pool ⇒ fråga ändå (graceful).
- **kontextuellInledning-prioritering:** pågående kurs > klarad kurs > null;
  okänd kursRef-titel ⇒ null.
- **forsvarsFragor-reglerna:** mager tes ⇒ exakt 2 (`|| 2`), 1 ämne ⇒ 1,
  en fråga per ämne i träffordning, maxAntal-respekt, tak 5, inga
  dubbletter, ENBART sokratiska (berakning hör till attack-läget).
- **amneFranTes:** substring-match, skiftlägesokänslig, rangordning efter
  antalet nyckelordsträffar (fallande).
- **Utbildningsframing (mekanisk):** alla 30 frågor är frågor ("?"); ingen
  rådsformulering ("köp denna aktie" etc.) i någon av 108 texter.

## KVD

`node --check` = SYNTAX OK · sviten körd under tsx, tak 60 s, kör 10 ms ·
exit 0 · **RESULTAT: 43/43 PASS**. Inga motorfel påträffade — src/ orörd.

### Utdata (komplett)

```
PASS  A1 AMNEN: 11 poster (10 ämnen + överraska) med icke-tomma id/namn/ikon  — 11 poster
PASS  A2 AMNEN: unika id:n och 'overraska' finns med  — roe, tillvaxt, vardering, risk, kassaflode, moat, v19-emission, vagor-ak1ts, portfolj, dcf-matematik, overraska
PASS  A3 Banken: 30 unika attackfrågor (inventerade via exkluderingsmekaniken)  — 30 unika id
PASS  A4 Banken: alla 10 ämnen representerade med exakt 3 frågor each  — roe, tillvaxt, portfolj, kassaflode, risk, vagor-ak1ts, dcf-matematik, v19-emission, vardering, moat
PASS  A5 Frågeform: id/fraga/kontext strängar, kategori + svårighet inom kontraktet
PASS  A6 KURS_TITLAR: varje kursRef i banken har en titel (kontraktet bakom kontextuellInledning)  — 17 frågor bär kursRef
PASS  A7 Beräknings-attacker: exakt 8, alternativ ≥ 2 med exakt ett ratt + icke-tom forklaring/raknefall  — kassaflode-2, tillvaxt-2, dcf-3, roe-2, v19-2, dcf-2, risk-2, vardering-2
PASS  A8 Utbildningsframing: alla 30 frågor är frågor (innehåller '?')
PASS  A9 Utbildningsframing: ingen rådsformulering i någon text (2007:528)  — 108 texter kontrollerade
PASS  B1 valAttack utan opts: giltig fråga ur banken
PASS  B2 valAttack amne 'overraska': ingen filtrering — hela banken (30) nås  — inventeringen fann hela poolen
PASS  B3 valAttack amne 'roe': enbart roe-frågor (3 st)
PASS  B4 valAttack exkludera-tillbakafall: poolen helt exkluderad ⇒ ändå en fråga (graceful, aldrig undefined/kast)
PASS  B5 nivaPool i fallback-läget: niva 3 + allt exkluderat ⇒ exakt svårighet 3 vinner (roe-3 varje drag)
PASS  B6 nivaPool exakt träff: amne moat niva 1 ⇒ alltid moat-1
PASS  B7 nivaPool utan exakt träff: beräkningspoolen saknar svårighet 1 ⇒ P8-fallback till hela poolen (både 2:or och 3:or spelas)  — inom ≤1 fanns inget — poolen öppnas (P8: inget låses)
PASS  B8 ogiltigt amne (utanför typen): kastar ej — tom pool ger undefined (kanten dokumenterad)
PASS  C1 default-argument: valBerakningsAttack() ⇒ fråga med berakning
PASS  C2 exkluderingsinventering: exakt 8 unika beräknings-attacker  — samma mekanik som valAttack
PASS  C3 niva 3: enda räknefallet med svårighet 3 (dcf-3) väljs varje gång
PASS  C4 exkludera-tillbakafall: alla 8 exkluderade ⇒ ändå en beräknings-attack
PASS  D1 fråga utan kursRef ⇒ null  — kassaflode-1 bär ingen kursRef
PASS  D2 kursRef utan titel i KURS_TITLAR ⇒ null
PASS  D3 pågående kurs matchar kursRef ⇒ 'Du läser just nu kursen <titel> …' med titeln inbäddad  — prefix ok
PASS  D4 klarad kurs ⇒ 'Du har klarat kursen <titel> …' med titeln inbäddad
PASS  D5 kursRef varken pågående eller klarad ⇒ null
PASS  D6 prioritering: kursen både pågående OCH klarad ⇒ pågående-varianten vinner
PASS  E1 alla 10 AmneId ⇒ historiskt fall med icke-tomma bolag/fel/lardom
PASS  E2 'overraska' är inte ett AmneId ⇒ inget fall i registret (undefined)
PASS  F1 tom tes ⇒ []
PASS  F2 tes utan nyckelord ⇒ []
PASS  F3 exakt nyckelord ⇒ ämnet ensamt
PASS  F4 rangordning efter träffar: emission+nyemission (2) före skuld (1)
PASS  F5 substring-match: 'intäkterna' träffar nyckelordet 'intäkt'
PASS  F6 skiftlägesokänslig: 'ROE och DCF' träffar roe + dcf-matematik
PASS  G1 mager tes (inga träffar) ⇒ exakt 2 frågor (|| 2-regeln)
PASS  G2 tes med 1 ämne ⇒ exakt 1 fråga ur det ämnet
PASS  G3 tre ämnen ⇒ en fråga per ämne i träffordning  — v19-emission (2 träffar) → risk → moat
PASS  G4 enbart sokratiska: berakning frågas ALDRIG i försvaret
PASS  G5 inga dubbletter bland försvars-frågorna
PASS  G6 maxAntal-respekt: 7-ämnes tes med maxAntal 3 ⇒ exakt 3
PASS  G7 tak 5: 7-ämnes tes utan maxAntal ⇒ exakt 5
PASS  G8 nivåstyrning: tes 'roe' niva 3 ⇒ exakt svårighet 3 (roe-3) varje gång

Körtid: 10 ms (tak 60 000)
RESULTAT: 43/43 PASS
```

## Noteringar

- Ett testfel under utvecklingen (inventeringen skickade inte exkluderings-
  listan) gav 5 falska FAIL — fixat i sviten, inget motorfel. Ärligt rött
  tillämpat: felet var mitt, motorn höll måttet vid korrekt körning.
- B8 dokumenterar en kanten EJ ett typkontrakt: `valAttack({amne: "finns-ej"})`
  (utanför `AmneVal`) returnerar undefined utan kast — konsumenter (komponent +
  API-route) validerar ämnet i typen och når aldrig dit.
- Juridik: sviten mäter kod; bankens texter är frågeformulerad utbildning om
  analysmetoder (DuPont, CAGR, WACC, TEK m.fl.) — inga råd, R2 orörd.
