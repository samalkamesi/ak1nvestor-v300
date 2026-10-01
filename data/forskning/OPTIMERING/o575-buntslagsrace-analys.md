# O575 — BUNTSLAGSRACE-ANALYSEN: prod-trädets tre skrivare och byggfönstret

**Datum:** 2026-10-01 (rond v223, organ:Φ)
**Klass:** Systemdesign-notis → föreslaget beslut för styrelseronden
**Status:** ANALYS + REKOMMENDATION (ingen kodändrad — maskineriets filer ägs av pågående fabrik/synk)

## FYNDET — tre race-händelser på ett dygn, samma rot

| Händelse | Tid (Z) | Vad hände | Kostnad |
|---|---|---|---|
| v221 ko-incidenten | 01:54 | Två sessioner löste SAMMA merge-konflikt parallellt; theirs-lösningen skrev över en färdig tsc-grön union och committade | En läkningscykel (91bf24c5) + sex kurser tyst borta ur registren i ~1 h |
| zcode-dubbelleveransen | 03:0x–03:2x | v222-sessionen och fabrikens s8-u1 levererade samma GUL-rätting oberoende; push-avvisning + merge krävdes | En extra merge (ccac7fbd) + push-fördröjning ~50 min |
| buntslagsracet | 04:19:55 | Fabrikens s8-u2 committade (df893563) medan prod-synk byggde från b55660a4 — "trädet flyttade under bygget", dubbelbyte avbröts | HELA deploy-bygget (03:27→04:19, ~52 min) på ombyggs-kö |

**Gemensam rot:** prod-trädet (/home/ak1a/AK1) har MINST tre samtidiga skrivare
(huvudsessioner, fabriksbarn, prod-synkens egna bokföringar) och ingen gemensam
"byggfönster-semafor" — varje skrivare upptäcker de andra först EFTERÅT
(push-avvisning, merge, buntslagsabort).

## NUVARANDE SKYDD (redan bevisat säkra — analysen ändrar INTE detta)

1. **updateInstead-spärren:** push vägrar smutsig/kolliderande yta — stoppar
   skriv-förlust (bevisat v221: fabrikens ocommittade leverans blockerade pushen
   korrekt tills trädägaren bokförde).
2. **prod-synkens buntslagskontroll:** trädet flyttade under bygget ⇒ dubbelbyte
   avbryts ⇒ ombygg. Prod serverar ALDRIG ett bud mot ett annat träd (säkert).
3. **fabrikens V235-sekvens:** ett manifest i taget; prod-synk VÄNTAR-FABRIK
   (tak 30 min) — men "hungrande deploy"-undantaget (03:24:24Z: "tak passerat —
   bygger NU med ps-reserven") bygger MED fabriken igång = race-rutan öppen.

## RISKBILDEN OM OFÖRÄNDRAT

- Varje "hungrande deploy + aktivt fabriksskri" ⇒ sannolik ~50 min extra
  deploy-fördröjning per race (ombyggs-cykeln). I natt: fabrikens s8-omgång
  (3 barn × omstarter) kan teoretiskt loopa avbryten om varje ombygg startar
  medan nästa barn committar — I NATT ÄNDLIGT (s8-u3 är sista barnet), men
  nästa 12-uppgifters-manifest + hungrig deploy = upp till flera race i rad.
- Push-kön (huvudsessionens leveranser) skjuts bakom varje ombygg.

## REKOMMENDATION (minimal åtgärd, för styrelsens beslut)

**R-lösning (rad): prod-synken lär sig av avbrutet byte.** Efter en
BUNTSLAGSRACE-abort: vänta FABRIK-TYST (samma V235-villkor som före bygget)
innan ombygg — inte bara nästa poll. Idag: `ombygg nästa poll` (10 min)
oavsett fabrikens läge = ombygget kan starta rakt in i nästa barn-commit.
Ägande: verktyg/prod-synk.mjs (EGEN ägo — ingen annan skriver den filen;
konfliktrisk låg men ändringen bokas som våg när fabrik+synk är tysta).

**K-lösning (kommunicera via statusfiler — v221-regeln generaliserad):** varje
skrivare som avser commit i prod-trädet låser en INTENT-fil
(data/vakten/prod-intent.json: {aktör, bas-HEAD, ts}) FÖRE commit och
plockar bort den efter commit. Kostnad: liten; vinst: skrivarna SER
varandra i förväg i stället för via git-avvisningar efteråt.
(Fortfarande komplement — git-spärrarna är sista försvarslinjen som
ALDRIG tas bort.)

**NI-lösning (avstå):** acceptera ombyggs-cykeln som priset för enkelhet.
Motargument: kundens "dagar ska ta mindre än timmar" — 50 min per race är
dyrt just vid stora skillnadsleveranser.

## FÖRSLAG PÅ BOKNING

v223 (denna not) → v224: R-lösningen i prod-synk.mjs (litet, egen fil,
fönsterkrav: fabrik tyst + lås fritt) → v219 fortsätter vara gated på
fabrik-tyst. Ordningen R→v219 för att R-lösningen minskar v219-fönstrets
egen race-risk (uppdateringskörningen startar pm2-omstart — ett avbrutet
bygg mittemot = exakt den klass R-lösningen stänger).

**Bevislänkar:** prod-synk.logg 04:19:55Z (abort-raden) · factory-status
auto-s8 (klara 2/3 vid abort-tidpunkten) · worklog v222 §dubbelleveransen ·
worklog v221 §ko-incidenten.
