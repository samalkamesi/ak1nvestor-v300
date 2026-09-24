# RAPPORTAKADEMIN — R2-beslutsunderlag för kunden (två frågor, enkla svar)

> Skapat av arbetsstationen 2026-09-21. Två punkter är enligt styrelse-regelverket
> (R2) KUNDENS veto — organismen bygger vidare men aktiverar aldrig dessa autonomt.
> Svara med val bokstav per fråga i studion (eller mot arbetsstationen).

## FRÅGA 1 — GDPR: hur länge sparas elevens prestationsprofil?

Rapportakademin lagrar per övning: vilken fråga, rätt/fel, elevens siffra, tid.
Det gör det möjligt att hämta tillbaka elevens EGNA fel vid rätt tillfälle
(forskningspelaren "spacing"). Profilen är personuppgift — därför din reglering:

- **A (rekommenderad):** Profilen sparas så länge prenumerationen är aktiv + 12
  månader därefter, sedan automatisk radering. Balanserar inlärningsvärdet
  (upprepning med mellanrum) mot integriteten.
- **B (striktast):** 90 dagar efter varje övning raderas den posten — profilen
  lever bara medan du är aktiv.
- **C (kortast möjliga):** Spara ingenting mellan sessioner — spacing-pelaren
  avsägs (förlorar en av fem forskningspelare).

Oavsett val: information vid första övningen (GDPR art 13), endast nödvändig
data, rätt att få ut och radera sina data.

## FRÅGA 2 — Citattak: hur mycket får citeras ur bolagens rapporter?

Styrelsens juridikorgan har redan satt ramen: KORTA citat med källa och länk till
bolagets original (citaträtten, upphovsrättslagen), nyckeltal och fakta är fria
(data är inte upphovsrätt), hela PDF:er hostas aldrig. Valet gäller taket:

- **A (rekommenderad):** Max 200 ord sammanhängande text per sektion, alltid med
  källa + länk. Ger mentorn riktig text att arBeta med vid sidhänvisningar.
- **B (strikt):** Max 100 ord per sektion.
- **C (maximalt försiktig):** Endast nyckeltal och siffror — inga textcitat alls
  (mentorn beskriver mekanismen i egna ord).

## Status för bygget (per 2026-09-21)

Styrelsen: GODKÄNT (utbildningsundantaget 2007:528 2 kap 5 §; utbyggnad PÅ
AI-Mentorn — inget parallellsystem; fem faser; vertikalt snitt först; vaktlinjer
är godkännandevillkor inbyggda från dag ett). Kunduppdrag registrerat som
organismens mål (data/vakten/kunduppdrag.json). Fas 1 (vertikalt snitt ABB +
PDF-verifiering ~10 bolag) påbörjad av organismen; arbetsstationen bygger
parallellt på filjeslutna ytor.

Båda valen ovan implementeras som KONFIGURATION (omslag i env/rutt), inte
hårdkodat — kunden kan ändra sitt val senare utan ombyggnad.
