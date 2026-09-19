# BRANDGENOMGÅNG 2026-09 — alla publika ytor (våg 191, skiftets fokus 1)

**Uppdrag:** kunddirektivet 2026-09-18 — "branding djupare på ALLA sidor".
**Metod:** varje sida hämtad LIVE från produktionssajten (localhost:3000, 2026-09-18
sent) och granskad på första intryck, ton, tydlighet: title, meta-beskrivning,
H1/H2, ingresser och CTA:er. Inget är gissat ur minnet — allt nedan är citerat
ur serverns eget svar.
**Juridikgrind:** alla förslag nedan är utbildningsformulerade — "så fungerar
metoden", aldrig "köp denna aktie" (2007:528). R2-markerade förslag verkställs
ALDRIG autonomt.

## helhetsintryck (dom)

Varumärkeskärnan är STARK och konsekvent: "institutionell metodik för
privatpersoner" går igenom på alla sex ytor, juridikgrinden lyser ("pedagogisk
analys — aldrig investeringsråd", "Vad detta är — och inte är"), och prisvänligheten
("Hela biblioteket. Noll kronor. Byggt för att du faktiskt ska förstå.") är
äkta och tydlig. Svagheterna är lokala: en 404 på den mest förväntade pris-URL:en,
en garanti-text som krockar med det strategiska skiftet, och tre sidor som
slösar sin H1 på namn i stället för löfte.

## fynden, prioriterade (P1 = säljkritiskt)

### P1 — `/pris` är 404 (säljkritisk väg)
Kundens vanligaste fråga ("vad kostar det?") möts av en felsida; prisvägen
heter `/medlemskap`. **Förslag (kodvåg):** permanent redirect `/pris` →
`/medlemskap` (next.config redirects) + länk i menyn "Pris" pekar dit.
Identifierad av besökarens beteende, inte av oss.

### P1 — garantitexten på `/medlemskap` krockar med det strategiska skiftet ⚠ R2
Sidans löftesrad idag: *"Du kommer att bli nöjd — det garanterar vi. Annars
betalar du ingenting … betalning sker först efter 90 dagar, och bara om du
förblir nöjd. Villkoren (sektion 5–6) ger garantin sin juridiska hemvist."*
Skiftet säger: garantitexterna bort, Fas 3 = "under byggnation — förbered dig
till Fas 3". Texten är samflätad med VILLKOREN (juridisk utfästelse) och
priset ⇒ **ändringen är R2: väntar kund.** Förslag till ny riktning när
kunden godkänner: "Fas 3 är under byggnation. Bygg din analysförmåga steg för
steg — vi publicerar när det håller vår kvalitetsgräns." (inget resultatlöfte).

### P2 — Fas 3 presenteras som bredd, skiftet kräver djup
"De avancerade kurserna — 18 fundamentala i Fas 2, 24 i Fas 3" säljer antal.
Skiftet: INGA nya kurser, fördjupa de 20 indikatorerna. **Förslag:**
omformulera till djup ("Fas 2: de 20 fundamentalindikatorerna på djupet —
läsa, tolka och räkna på riktiga årsredovisningar"). Kopplar till våg 192.

### P2 — bloggens H1 slösas på ett namn
H1 "AK1A Blogg" säger inget. Ingressen REDAN har den bästa rubriken på sajten:
"Institutionell metodik, förklarad för privatpersoner." **Förslag (kodvåg):**
H1 = "Institutionell metodik, förklarad för privatpersoner" och "AK1A Blogg"
som skuggtext/eyebrow överst.

### P2 — datasetets H1 låter som ett filnamn
"Dataset — branschmedianer för nyckeltal" är teknisk. **Förslag (kodvåg):**
H1 = "Jämför nyckeltal med branschens median" med underrubrik "189 bolag ·
10 branscher · observerat och daterat — pedagogiskt riktmärke, inte råd".

### P3 — kursväggens H2 klistrar ihop rubrik + underrubrik
"Registrethela biblioteket" och "Kategoriväggen27 kategorier" — två element
utan mellanrum renderas som en sträng. **Förslag (kodvåg):** semantisk
separation (rubrik-element + undertext-element) — hjälper också skärmläsare.

### P3 — hemsidans första stycke är navigationskräp
Första `<p>` på `/` är "PrivatpersonSVA · K · 1 · AR E S E A R C HL A B"
(meny-logotypen). Sökmotorer och skärmläsare möter skräp före budskapet.
**Förslag (kodvåg):** logotypen som aria-hidden/dekorelement, inte stycke.

### P3 — räknaren "0 kurser" i vyn utan javascript
Hero-kortet renderar "0kurser" i statisk HTML (siffran hydreras i klienten).
Första intrycket förcrawler/no-JS = "0 kurser". **Förslag (kodvåg):** server-
rendera siffran ur samma källa som sidan räknar (426) eller dolt till hydrering.

### P3 — `/kontakt` saknas (404)
Kontaktuppgifter finns under Om oss → Kontakt. **Förslag (kodvåg):** redirect
`/kontakt` → `/om-oss#kontakt`.

## per yta — behåll (det som REDAN är rätt)

| Yta | Behåll ordagrant | Varför |
|---|---|---|
| Hem | H1 "Bli analytikern som ser vad andra missar." | Löftet i fokus — sajtens bästa mening |
| Hem | "En komplett utbildning i aktieanalys — inte en ström av tips." | Positioneringen i en rad |
| Hem | "Fas 1 för alltid 0 kr · Alla kurser upplåsta direkt · Inget kort krävs" | Tre tvivel raderade på en rad |
| Kurser | "Börja här" + "Flaggskeppen" | Guidar nybörjaren rätt |
| Dataset | "Vad detta är — och inte är" | Juridikgrindens bästa implementering — förebild |
| Blogg | "Fortsätt djupare: kursen …" -länkarna | Blogg → kurser-korspollineringen |
| Om oss | "…en rättighet — inte en tjänst reserverad för bankers och fondförvaltares analytiker" | Värderingsgrunden, autentisk |
| Medlemskap | "Hela biblioteket. Noll kronor. Byggt för att du faktiskt ska förstå." | Generositeten bevisad, inte påstådd |

## CTA-inventering (nästa steg i spåret)

Befintliga primära CTA:er är få och bra ("Bli medlem — gratis →", "Utforska
kurserna", "Ansök om Fas 2 → kostnadsfritt, 2 minuter", "Gå med gratis — det
tar 30 sekunder"). Gap: dataset- och blogg-ytorna saknar egen primär CTA —
besökaren lämnas utan nästa steg. **Förslag (kodvåg, våg 193-fönstret):**
dataset → "Lär dig läsa nyckeltal — kursvägen" ; blogg → "Börja med grunderna
— gratis".

## verkställnadsordning (bokning)

1. **Kodvåg A (små redirect-fixar):** /pris + /kontakt redirects — låg risk,
   direkt värde. Bokas i PIPELINE-KO som våg 194.
2. **Kodvåg B (H1-lyft + separationer):** blogg + dataset H1, kursväggs-H2,
   hem-stycke, 0-kurser. Bokas som våg 195.
3. **R2-paket (väntar kund):** garanti/Fas 3-omformulering på /medlemskap —
   presenteras för kunden med denna handling som underlag; ALDRIG autonomt.
4. **Fas 2-djupcopy:** levereras av våg 192:s underlag (indikator 1–5) och
   förs in i kurser/medlemskap-copy när underlaget finns.

*Källa: verktyg/_r69-brandsond.mjs (live-hämtning 2026-09-18, 8 URL:er,
sparad rådata _r69-brandsidor.json). Dokumentet är dataleverans — src/ orörd.*
