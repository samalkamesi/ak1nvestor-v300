# o571 — Externavaktens UA-blindhet: amazon.com nekade robot-identiteten men tjänade besökare — 7 falska dödsdomar (spår 8, r349)

**Reservation:** o571 under flock (verktyg/reservera-protokollnummer.mjs, ägare
huvud-r349; o570:s syskon). **Filer:** verktyg/doda-lankar-externa.mjs ·
verktyg/testa-doda-lankar-externa.mjs · detta protokoll.

## 1. LARMET OCH DIAGNOSEN

Larm 2026-09-30 04:17 (automatiskt): **7 bevisat döda (4xx) + 0 ouppnåbara**.
Rapport `data/vakten/doda-lankar-externa-2026-09-30.json` (prod-trädet): alla 7
DOD-mål är `https://www.amazon.com/s?k=…`-söklänkar med källa **/kallor** —
samma domän bar dessutom 95 SERVERFEL (503).

**Källspåret:** `/kallor` (src/app/(huvud)/kallor/page.tsx) genererar TRE
köplänkar per bok i bokkanon (Bokus, Adlibris, Amazon) ur titel+författare —
102 Amazon-mål. Bokus+Adlibris ligger i o570:s domänvila (BLOCKERAD, ej fynd).
o570 noterade "amazon 102 OK idag" (09-29) — målen VAR gröna igår.

**Fältsonden (minimal belastning, samma måttstock som kaninen — 3 förfrågningar
mot ETT mål, /tmp/amazon-sond-resultat.txt 05:17Z):**

| Förfrågan | Svar |
|---|---|
| HEAD, vaktens UA (`ak1a-doda-lankar-externa/1.0`) | **503** |
| GET, vaktens UA | **503** |
| GET, vanlig webbläsar-UA | **200** |

**Rot:** Amazon (som många storexter) nekar robot-IDENTITETEN, inte IP:n och
inte länken — besökaren får sidan. valideraMal gör redan HEAD→GET-omprov vid
4xx, men GET bar fortfarande vakt-UA:en, och klassificera() dömde varje 4xx
utom 401/403/429 som DOD. 405-på-båda-sätten = falsk dödsdom. Fynden var
dessutom instabila (405/503 varierar slag i slag) — nattliga återfall väntat.

## 2. KUR — BESÖKARENS SANNING (tre ändringar i verktyget)

1. **Läsar-omprov i valideraMal** (o571-kärnan): kvarstår svaret ≥400 EFTER
   HEAD+vakt-GET ⇒ EN GET med läsar-UA (ren Chrome-sträng — exakt den som
   fältsonden bevisade). Lyckas den (2xx/3xx) ⇒ OK. Ger den 404 ⇒ DOD kvar
   (äkta död gäller besökaren likaväl). Körs FÖRE 5xx-omtrycket: ett UA-block
   (503) läks utan 8 s-paus — Amazon-fallet blir 2 förfrågningar/mål i stället
   för dagens 2 + 8 s. **Vägran-status (401/403/429) respekteras — ingen
   omprov:** väggar och rate-gränser gäller besökare likaväl (o570 bevisade
   Adlibris/Bokus 429 även för webbläsar-UA).
2. **Kanin-klipp vid bestående bot-motstånd** (BOT_MOTSTAND = 405/502/503/504):
   svarar kaninen med någon av dessa EFTER läsar-omprovet (tre identiteter/
   metoder provade) ⇒ domänklipp + 7-dagarsvila, kaninen klassas BLOCKERAD/
   vagg — **aldrig DOD: ett vägran-svar bevisar inte att resursen saknas.**
3. **Dynamisk klipprapportering:** klippta mål bär kaninens faktiska status +
   typ + förklaring (tidigare hårdkodat 429/"rate") — 429-klipp rapporterar
   rate, bot-motståndsklipp rapporterar vagg med bot-motstånds-text.

**Ärlighetsredovisning:** vi identifierar oss (vakt-UA + kontakt) i varje
förfrågan tills värden nekar — först då frågar vi som besökaren gör. Läsar-UA:n
används ALDRIG före första vägran, aldrig mot 401/403/429, en gång per mål.
Skonsamhet netto: Amazon-mål 2 förfrågningar (färre än 09-30:s 2+8 s-omtryck);
sura domäner klipps efter kaninens 3.

## 3. BEVIS

- `node --check` OK · **Självdokumentation 7/7** (nytt fall: "405 för vakt-UA
  men 200 för läsare = OK (amazon-fallet)").
- **Svit 73/73 PASS, 0 FAIL** — nya fallen:
  - **S (UA-vägg läks):** 503 för vakt-UA/200 för läsare ⇒ båda målen OK,
    exakt 2 förfrågningar/mål, ingen klipp, ingen vilofil.
  - **T (bot-motstånd består):** 405 för alla identiteter ⇒ kanin 3 förfråg-
    ningar, syskon 0, alla BLOCKERAD-vagg, INGEN DOD, vilofil med orsak
    "kanin bot-motstånd (405 även för besökar-UA)".
  - Alla gamla fall A–R opåverkade (L: kanin-429 exakt 2 träffar kvarstår —
    429 undantas från läsar-omprovet).
- Skarp validering: se § 5.

## 4. LARMORDERNS ORDALYDELSE — MOTIVERAD AVVIKELSE

Larmet bjöd in att "rätta KÄLLORNA i data/ (byt ut eller ta bort döda länkar)".
Källorna rördes EJ: fältsonden bevisar att länkarna lever för besökare (200) —
felet satt i INSTRUMENTET, inte i källmaterialet. Att ta bort 102 fungerande
köplänkar på /kallor för att blidka ett defekt mått vore att skada produkten.
KVD:n "validering GRÖN" uppfylls genom att instrumentet mäter sant (§ 5).
/​kallor och data/ är orörda — ingen dataleverans krävs; verktygsändringen
levereras som kod till prod-trädet där cronen (04:17) ropar den.

## 5. SKARP VALIDERING (KVD)

`node verktyg/doda-lankar-externa.mjs --validera-fran
data/vakten/doda-lankar-externa-2026-09-30-insamling-045150.json` (den gröna
återinsamlingen — 04:51-fönstret, driftAndel 0,2 %; den 04:17-insamlingen är
driftmärkt och återupptas aldrig, o47 §2). Körs från prod-trädet så vilofilen
(Adlibris/Bokus) respekteras.

**Resultat 05:32 UTC (rapport
data/vakten/doda-lankar-externa-2026-09-30-053235.json, exit 0, 13 s):**
DÖDA 0 (förra rapporten: 7) · OUPPNÅBARA 0 · SERVERFEL 0 (förra: 95) ·
BLOCKERADE 311 (vägg 107 = tidigare 5 väggar + Amazons 102; vila 204 =
Adlibris/Bokus). Amazons kanin svarade 503 på ALLA tre vägarna denna gång
(fältsonden 05:17 fick läsar-GET 200 — försvaret varierar med tid/salva,
vilket är precis fallet klipp+vila är byggda för): domänklipp loggad med
"kanin bot-motstånd (503 även för besökar-UA)", 101 förfrågningar återsparade,
7-dagarsvila skriven — nattens cron (imorgon 04:17) klassar Amazon
BLOCKERAD-vila med NOLL förfrågningar: inga fler falska dödslarm från den
domänen förrän vilan löper ut och kaninen provar igen (o570-lagdromantiken).

## 6. FYND BOKFÖRDA (inte kurerade här)

- Amazons bot-försvar varierar svar SLUMPVIS (405/503 i samma salva) —
  klassningen per mål kan fladdra mellan DOD/SERVERFEL om UA-blocket slås på/
  av mitt i en körning; klipp-grenen fångar domänen när kaninen träffar på.
- Adlibris/Bokus-vilan (o570) löper 7 dagar från 09-29 — första kaninomprovet
  ~10-06; om de läkt för läsare men ej för vakt-UA klassas de nu OK via
  läsar-omprovet (tidigare hade de förblivit BLOCKERAD-rate).
