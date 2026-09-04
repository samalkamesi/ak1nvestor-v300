# m10-referral — Elev-för-elev: DelaKort-evolution med referral-attribuering (GDPR-ren)

**Forskare:** m10 (MARKNAD, omgång 14) · **Datum:** 2026-09-04 · **Status:** forskning + design, BYGG EJ
**Fråga:** Hur kan DelaKort utvecklas till elev-för-elev med referral-attribuering — GDPR-ren
(uppdraget säger "anonym hash"), juridiskt korrekt i Sverige, och designat UTAN FOMO?

Kort svar: **Attribuering med slumpmässig referenskod är GDPR-renare än hash och rekommenderas
— en e-posthash är enligt gällande vägledning PSEUDONYM personuppgift, inte anonym data.**
Lösningen lagrar INTE vem som tipsat vem (ingen social graf) — bara ett aggregerat heltal hos
tipsgivaren. Juridiken i SE kräver: inga dragningar (lotterilagen), tydlig kommersiell
identifikation (marknadsföringslagen), uppdaterad integritetspolicy + ändamålsbegränsning
(GDPR). Designen belönar med TACK, aldrig med lås, deadlines eller räknare som tickar.

---

## 0. Utgångspunkter som styr designen (MARKNADS-BESLUT)

- P5 "Tipsa, tvinga aldrig": delning är ett erbjudande. A2: FOMO/knapphet AVSLAGET —
  inga countdowns, "platser kvar", eskalerande CTA. §3 tabellen: FOMO i CTA:er = FEL.
- P6 GDPR-by-design: INGA nya spår, pixels, cookies för attribuering. Attribueringen
  sker server-side vid registreringen — aldrig via besöksspårning.
- P1/P3 intakta: referral belönar aldrig med innehåll (inga lås, inga "lås upp genom att
  värva") — Fas 1 är gratis oavsett om man är tipsad eller inte.
- A8: terminologi "elev", aldrig "kunder" — komponenten heter därför elev-för-elev.
- DelaKort-kulturen (dela-kort.tsx huvudkommentar): "allt sker lokalt i webbläsaren —
  ingen data skickas någonstans". Evolutionen FÅR inte bryta detta för den som delar;
  den nya koden är passiv data I QR:en, inte telemetri.

## 1. Nulägeskarta (kodläst 2026-09-04)

| Faktum | Var | Betydelse |
|---|---|---|
| DelaKort ritas 100 % klient-side (SVG→canvas→PNG), QR-kodare inbyggd (GF(256)+RS, EC M, v1–6) | `src/components/ak1a/dela-kort.tsx` | QR kan koda VALFRI URL ≤ ~100 tecken utan ny kod — `lab.ak1nvestor.com/?ref=AB12CD9F` får plats (v3) |
| QR pekar idag på statisk `LAB_URL` | samma fil (r 24) | Enkilly ändrad till personlig kod-URL |
| Medlem: `{id, email, namn}` i localStorage (v1 — ingen serverauth) | `src/lib/member-local.ts` | Server-medlemskap finns i spåret (members-tabellen, våg 1b konverteringsvyn) — koden ska lagras där, inte lokalt |
| Kortet bär namn/nivå/kurser/streak + "Skanna — gå med gratis" | byggKortSvg | Evolution: samma kort + diskret "Tipsad av [förnamn]?"-rad på startmottagarsidan, ALDRIG på kortet (kortet är elevens, inte kampanjens) |
| Web Share API + Kopiera länk + subtil del-rad | dela-kort.tsx + del-rad.tsx (våg 3) | Delningsytorna finns — referral är en FÖRLÄNGNING, inte en ny yta |
| system_events med ANONYMISERADE events (A4-precedenset: prenumerationsintention utan persondata) | aktivera-panel + våg 1b | Precedens för "aggregat, aldrig individ" — återanvänds som designprincip |

## 2. Forskning — juridik i Sverige (WebSearch 2026-09-04)

1. **Hash av e-post = personuppgift.** Vägledande praxis (spanska dataskyddsmyndigheten +
   EDPS om hashning; [sammanfattning](https://www.insideprivacy.com/data-privacy/spanish-supervisory-authority-and-edps-release-guidance-on-hashing-for-data-pseudonymization-and-anonymization-purposes/)):
   en hash av en e-postadress kan i regel återskapas (brute force/ordbok mot kända domäner)
   ⇒ den är PSEUDONYMISERAD personuppgift, inte anonymiserad. EU-nivå: EDPB:s riktlinjer om
   anonymisering (öppen konsultation 02/2026) drar samma linje; IMY (Integritetsskyddsmyndig-
   heten) vägleder om [kryptering](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/informationssakerhet/kryptering/)
   och [personuppgifter i e-post](https://www.imy.se/verksamhet/dataskydd/vi-guidar-dig/personuppgifter-i-e-post/).
   SLUTSATS för oss: "anonym hash" är en paradox — om vi HASHAR något personligt bär det
   fortfarande GDPR-skydd. Renare: hasha INGET — använd en slumpkod (§3).
   OM styrelsen ändå kräver hash (t.ex. för korsmatching mot en extern lista): ENDAST
   HMAC-SHA256 med serverhemlighet (pepper), dokumenterat som pseudonymisering — aldrig
   osaltad SHA-256.
2. **Lotterilagen (1994:1000) 3 §.** Lotteri = verksamhet där deltagare MED ELLER UTAN
   INSATS kan få vinst högre än vad de samlat betalat ([lagtext](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lotterilag-19941000_sfs-1994-1000/)).
   DRAGNING bland tipsare (även utan insats) kan utgöra lotteri och kräva tillstånd/
   registrering ([Spelinspektionen](https://www.spelinspektionen.se/spelare/spelform/lotteri/),
   [Gulliksson om lotteri i marknadsföring](https://www.gulliksson.se/en/new-gambling-act-opens-a-small-window-for-lotteries-and-gaming-in-advertising/)).
   KONTROLL: belöningen är DETERMINISTISK (per genomförd tipswervning) ⇒ inget slumpmoment
   ⇒ inget lotteri. Inga "vinna"-mekanik i designen — punkt.
3. **Marknadsföringslagen (2008:48) — identifierbar kommersiell handling.** Den som delar
   med en belöning i bakhuvudet rekommenderar kommersiellt: länken ska inte dölja sitt
   ursprung. Vår kontroll: länken är öppet "en väns inbjudan till en gratis utbildning" +
   integritetsraden "om din vän går med gratis tackas hen — inget krav, inget lås".
4. **ePrivacy/cookies.** URL-parameter (?ref=) är INTE en cookie och kräver inget samtycke
   — men fältet ska försvinna ur adressfältet efter läsning (history-replace) så koden inte
   läcker vidare i delade länkar, och ALDRIG skrivas till tredjepartsloggar via pixels (P6).

## 3. Design — tre attribueringsalternativ, ett rekommenderat

| Alt | Mekanik | GDPR-dom | Dom |
|---|---|---|---|
| A. E-posthash i länken | `?ref=sha256(email)` | Personuppgift i URL (läcker i loggar/historik överallt) + brute-force-bar | **AVSLAG** — smutsigast möjliga variant |
| B. HMAC-hash server-side | koden = HMAC(serverhemlighet, email) | Pseudonymisering — OK men onödigt: fortfarande personuppgifts-behandling, kräver dokumentation | Villkorad fallback (endast om extern korsmatching krävs) |
| C. Slumpad referenskod | `?ref=AB12CD9F` — crypto-random vid medlemskap, spärrbar, återkallningsbar | Koden är FRAMSTÄLLD identifierare kopplad till kontot — behandlas korrekt som kontodata, men inga nya datakategorier, ingen hash, återkallelig | **REKOMMENDERAD** |

**Alt C — datamodell (minimal, aggregate-only):**
```
members.kod            CHAR(8)  — slumpkod, unik, NULL tills eleven GENERERAR den
                                (opt-in: DelaKort → "Skapa din tipskod" — ej automatisk)
members.antalTipsade   INT      — AGGREGAT: antal registreringar som angav koden.
                                Ingen tabell "vem tipsade vem" LAGRAS ALDRIG (ingen
                                social graf — dataminimering; A4-precedenset)
registreringstillfället: ref-kod läses EN gång ur URL, matchas, räknas upp,
                                kastar sedan FÄLTET (behålls ej på den nya eleven).
```
- Determinism/revision: räkne-stegen skrivs som anonymiserade system_events
  (type=referral, details={framgang:true}) — grövre tal för konverteringsvyn (våg 1b),
  aldrig individ.
- Spärr/återkallning: eleven kan radera/k Förnya sin kod på Min Sida (radering = koden
  slutar fungera; antalTipsade-behålls som ett eget tal hos eleven tills hen begär export/
  radering enligt GDPR — det är elevens egen statistik).

**DelaKort-ändring (liten, lokalitet bevarad):**
1. QR: `qrModuler(LAB_URL + (kod ? "?ref=" + kod : ""))` — samma inbyggda kodare,
   v3 räcker gott för 41 tecken.
2. Kortets bild OFÖRÄNDRAD (elevens prestation, inte kampanj). Delningstexten får en
   rad: "Gå med gratis (om du vill): länk" — ingen belöningslöftes-text i delningen
   ("tipsa och få X" i delningsytan = tryck mot mottagaren).
3. Mottagarsidan (startsidan med ?ref): EN diskret rad "Du kom via en väns tips — tack,
   [förnamn-avlös] ingen" (ingen annan personalisering), kod=tvättas ur URL, raden försvinner
   vid nästa klick. Nybliven elev ser ALDRIG press: ingen rabatt-klocka, ingen "din vän
   väntar".

**Belöning UTAN FOMO (designkontrakt):**
- Tipsgivaren: ett TACK (toast + notis "En elev hittade hit via ditt kort — grattis, du
  mentorar") + valfri badge "Mentor" i profilen efter 1/5/10. Badges är synliga ENDAST för
  eleven själv (ingen offentlig topplista — jämförelsetryck = FOMO:s kusin).
- DEN NYA eleven: ingen belöning alls behövs (Fas 1 gratis för alla) — ev. en vänlig rad
  "din vän [X] får se att du hittat hit" (OPT-IN checkbox vid registrering; default AV).
- FÖRBJUDET i komponenten (kodkommentarer + kontrolleraText-vakt): " bara X kvar",
  "dela inom 24 h", "du ligger efter", progress-bar mot belöning, "lås upp genom att
  värva", påminnelser om att tipsa (A7-andan: ingen nudge utan explicit opt-in).

## 4. Vad som krävs juridiskt i SE — checklista (blockerande input till kund/jurist)

| # | Krav | Status i designen |
|---|---|---|
| J1 | Rättslig grund för behandlingen: kod + räknare = kontodata i syfte "elev-för-elev-tack"; intresseavvägning/avtal — dokumenteras i registret över behandlingar | Kräver kundaktion (policy-uppdatering + ROMP-rad) |
| J2 | Informationsplikt: integritetspolicy nämner tipskoden + att endast aggregat lagras | Kräver kundaktion (text) |
| J3 | Dataminimering + lagringstid: ingen social graf; antalTipsade = elevator egna tal, raderas vid kontoradering | INBYGGT i modellen (§3) |
| J4 | Lotteri: inga dragningar/slumpvinster — deterministiskt tack endast | INBYGGT (§2.2) |
| J5 | Marknadsföringslagen: länkens kommersiella natur tydlig; inga oskäliga villkor (belöningen har inga villkor alls) | INBYGGT (§2.3) |
| J6 | ePrivacy: ingen ny cookie/pixel; ref-parameter tvättas ur URL efter läsning | INBYGGT (§2.4) |
| J7 | Om hash-variant (alt B) väljs: DPIA-likt riskdokument + HMAC-pepper i hemlighetshantering | Endast fallback |

## 5. Acceptanskriterier (utkast till byggvåg)

1. AC1: QR avkodas till `https://lab.ak1nvestor.com/?ref={kod}` och koden matchar elevens
   lagrade kod (pixeljämförelse mot qrMatris-mönstret — VÅG 1a-testets återanvändning).
2. AC2: Registrering med ref ⇒ tipsgivarens antalTipsade +1, INGEN rad med den nya elevens
   identitet lagras (test: tabellscan efter körning), ref-fältet kastas.
3. AC3: KontrolleraText på ALL ny copy: 0 FEL; komponent-test nekar strängar från §3:s
   förbudslista (FOMO-mönstren ur MARKNADS-BESLUT §3).
4. AC4: Utan kod fungerar DelaKort EXAKT som idag (bakåtkompatibel — kod är opt-in).
5. AC5: `npx tsc --noEmit` = 0 nya fel; inga nya runtime-endpoints; allt klient-side
   utöver registrerings-POST:en (som redan finns).
6. AC6: Badges syns endast för eleven själv (DOM-test: ingen topplista renderas).

## 6. Tre rekommendationer

1. **Välj slumpkoden (alt C) — lägg "anonym hash" formulationen till handlingarna.**
   Uppdragets "GDPR-ren, anonym hash" uppfylls bäst av att INTE hasha: koden är framställd,
   spärrbar och skapar ingen personuppgifts-kategori utöver kontot. Hash-varianten (B)
   dokumenteras som fallback med HMAC-krav, ifall framtida extern korsmatching önskas.
2. **Bygg först DelaKort-kod-QR:n + mottagarraden (J4–J6 är redan uppfyllda av designen);
   belöningssystemet (badges/notis) i steg 2 EFTER kundens policy-uppdatering (J1–J2).**
   Steg 1 är oberoende av juridiska kundåtgärder (attribuering utan belöning = ren statistik
   i konverteringsvyn) och kan leverera mätvärde direkt: "hur många kommer via korten?".
3. **Frys FOMO-förbudslistan i kontrolleraTexts VARNING-klass (våg 2) med referral-specifika
   mönster** ("tipsa inom", "din vän väntar", "X plats kvar", progress-bar-mot-belöning) —
   då kan ingen framtida våg av misstag bygga pressmekanik i elev-för-elev-ytorna.

**Dom: VILLKORAT — designen moget nu (alt C är byggfärdig skiss); aktivering av
belöningssystemet väntar på kundens integritetspolicy-uppdatering (J1–J2) + våg 2:s
kontrolleraText som FOMO-vakt. Alt A (e-posthash i länk) AVSLAGET.**

---
*Källor kod: src/components/ak1a/dela-kort.tsx (QR-kodare, byggKortSvg, del-flödet) ·
src/lib/member-local.ts · MARKNADS-BESLUT (§0 P5/P6, §1 A2/A7/A8, §2 våg 1b A4-precedenset,
§3 förbjudna mönster) · ORGANISK-TILLVAXT-PLAN §6 (community-kultur) · src/lib/qr.ts (VÅG 1a).
Webbkällor se §2: [Lotterilag 1994:1000](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lotterilag-19941000_sfs-1994-1000/) ·
[Spelinspektionen om lotteri](https://www.spelinspektionen.se/spelare/spelform/lotteri/) ·
[Gulliksson om lotteri i marknadsföring](https://www.gulliksson.se/en/new-gambling-act-opens-a-small-window-for-lotteries-and-gaming-in-advertising/) ·
[EDPS/AEPD om hashning](https://www.insideprivacy.com/data-privacy/spanish-supervisory-authority-and-edps-release-guidance-on-hashing-for-data-pseudonymization-and-anonymization-purposes/) ·
[IMY om kryptering](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/informationssakerhet/kryptering/) ·
[IMY om personuppgifter i e-post](https://www.imy.se/verksamhet/dataskydd/vi-guidar-dig/personuppgifter-i-e-post/).
Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).*
