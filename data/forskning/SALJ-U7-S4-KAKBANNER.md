# SALJ-U7 — S4: Kakbannerns okulärkontroll (sv/en/ar + avbryt-väg)

**Våg:** säljkartan B3 · fabriksagent GRANSKARE (S4) · **Datum:** 2026-09-29
**Uppdrag:** Verifiera kakbannern enligt SÄLJ-KARTAN B3 innan säljstart —
samtyckeflödet okulärbesiktigades EJ i auditen trots att komponenten finns.
**Metod:** källtripp (komponentkod → monteringspunkt + språkarkitektur →
prod-HTML/byggda chunks), bedömning mot LEK 2022:482-grunder på
utbildningsnivå — juridisk rådgivning lämnas EJ (kundens juridik = R2).

## Sammanfattning

Avbryt-vägen finns och är klick-ekvivalent med godkännandet: "Endast
nödvändiga" ligger i bannerns första vy, samma rad, ett klick — och
spårningen är kodmässigt portad bakom samtycket. Men två B-fynd rättades i
komponenten (fabrikens yta enligt B3): **(1) bannern var svenska enda
språket** även på /en och /ar — hårdkodade strängar trots att hela sajten
är trespråkig och husets mönster (useSprak + spegelregeln) fanns redo;
**(2) kryssrutorna i Inställningar var förbockade** — "Spara mitt val"
utan aktiv handling spårade fullt samtycke, vilket strider mot
aktivt-val-principen (EU-domstolen C-673/17 Planet49: förbockade rutor är
inte giltigt samtycke). Båda rättningarna är levererade i
src/components/ak1a/cookie-consent.tsx; tsc 0; deploy-kvito väntar på
nästa deployfönster (rondens deployfönster var redan upptaget av
prod-synken, se nedan).

## 1. Källtripp

| Källa | Vad som granskades | Resultat |
|---|---|---|
| Komponentkod `src/components/ak1a/cookie-consent.tsx` | kaknamn i banner, avbryt-väg, sparning, språk | Kategorier (Nödvändiga/Analys/Preferenser) med syfte, INTE enskilda nycklar — full förteckning med namn+syfte+varaktighet lever i länkade /cookiepolicy; avbryt-knapp "Endast nödvändiga" → `spara(false,false)`; sparning `localStorage "ak1a-cookie-samtycke"` (JSON: version/nodvandiga/analys/preferenser/datum); **språk: enbart svenska (F1)**; **kryssrutor förbockade (F2)** |
| Monteringspunkt `src/components/ak1a/globalt-skal.tsx:370+387` + språkarkitekturen `sprak-leverantor.tsx` | var bannern renderas och vilket språk som gäller | `<CookieConsent />` monteras i BÅDA grenarna (original + speglar) — (huvud)/(en)/(ar)-layouterna använder alla `GlobaltSkal` (lang sv/en/ar). Spegelregeln (våg 80a/81): på /en/** och /ar/** vinner spegelns språk — men ENDAST för komponenter som konsumerar `useSprak()`; bannern gjorde inte det ⇒ svensk text på /en och /ar |
| Prod-HTML + byggda chunks (passiv, se § 4) | banner-markup i levererad HTML | Banner är "use client" + dold till montering (`synlig` först i useEffect) ⇒ serverrenderad HTML innehåller korrekt NOGEN banner-markup — okulär synlighet kan bara verifieras i webbläsare (gränssnittsvaktens nästa rond); passiv bevisning via klient-chunks i stället |

Konsumtions-gating (extra, utanför strängt uppdrag): `trafik-rapportor.tsx`
läser `lasCookieSamtycke()` innan session/puls — puls kräver
`samtycke?.analys === true` (rad 153-157) och sessionen degraderar till
"minimal" utan analys-samtycke. Spårningen är alltså KODMÄSSIGT portad
bakom valet, inte bara påstått i policyn.

## 2. Bedömning mot LEK 2022:482-grunderna (utbildningsnivå, ej rådgivning)

| Grund | Läge | Bevis |
|---|---|---|
| Informerat samtycke INNAN icke-nödvändiga kakor | **OK efter F1-rättningen** | Bannern visar kategorier + syfte + länkar (cookiepolicy/integritetspolicy/transparens med GDPR art 13-registret); tracer/porten gated i kod (se ovan); på /en/ar nu på besökarens språk |
| Avvisa lika lätt som godkänna | **OK (klick-ekvivalent)** | "Endast nödvändiga" i första vyn, ett klick, samma rad, 52 px tryckyta på mobil; se dock F3 (visuell obalans, observation) |
| Info om ändamål | **OK** | Kategoribeskrivningar i bannern + full förteckning (namn, kategori, syfte, varaktighet) i /cookiepolicy, länkad från bannern |
| Ändra/återkalla | **OK** | `?cookies=1` öppnar bannern igen — länkad från footern (footer.tsx:220) och cookiepolicyn "Din kontroll"; valet verkar omedelbart (läses vid varje sidvisning/puls) |
| Nödvändiga undantas | **OK** | Nödvändiga (inloggning, säkerhet, kursprogress) alltid aktiva, tydligt märkta "Alltid aktiva"; consent-nyckeln själv kategoriserad Nödvändiga i policyn |

## 3. Fyndlista

| # | Allvarlighet | Fynd | Rättning |
|---|---|---|---|
| F1 | **B** | Banner endast på svenska på /en och /ar (hårdkodade strängar; speglarna bär samma `GlobaltSkal`) — informerat samtycke ifrågasatt för en/ar-besökare, och kurserna är 100 % översatta så trafiken dit är reell | **RÄTTAD:** lokal `{sv,en,ar}`-ordbok i komponenten (ordlistans värdeform, termer i linje med footerns t.ex. "Cookie Policy"/"سياسة الكوكيز") + `useSprak().sprak` — spegelregeln ger rätt språk på /en//ar automatiskt; SSR/hydrering opåverkad (bannern renderar null till montering) |
| F2 | **B** | Kryssrutorna Analys/Preferenser förbockade (`useState(true)`) — "Spara mitt val" utan aktiv handling spara fullt samtycke; aktivt-val-principen (Planet49 C-673/17) | **RÄTTAD:** förval `false` — granulär väg kräver aktiv bockning; "Godkänn alla" (aktivt klick) oförändrad som snabbspår |
| F3 | C (observation, ej ändrad) | Visuell obalans: "Godkänn alla" = fylld primärknapp, "Endast nödvändiga" = textstils-knapp. Klick-ekvivalens råder men EDPB:s vägledning om vilseledande design (03/2020) fäster vikt vid jämvikt | Föreslås: ge avvisa-knappen samma sekundärstil som "Inställningar" (border+guld). Ren styling — lämnad till design/huvudspåret, ej blockerande för säljstart |
| F4 | C (observation) | Policyn kategoriserar preferens-nycklar (notiser/signaler/badges) som "(samtycke)" — per-konsument-gating har inte verifierats för ALLA nycklar i denna rond (endast tracern + trafik-rapportorn granskade) | Separat granskningspost vid behov; policyns formulering är i sig korrekt som målbeskrivning |

Ej funnet: inga A-fynd. Bannern sätter inga kakor själv före valet;
inga tredjeparts-/marknadskakor påstås (policy) och inga sådana hittades
i komponenten.

## 4. Passiv prod-kontroll (curl) — genomförd under deployfönster (ändligt redovisad)

Rondens första curl (02:47) svarade **502** på /, /en och /ar: ett
deployfönster pågick (`flock -w 1200 /tmp/ak1a-deploy.lock` startad 02:44
av prod-synken: `rm -rf .next && npm ci && npm run build`; pm2 ak1a
stoppad mitt i deploynet — väntat, ej produktionsfel). Enligt doctrine:
byggen ägs av prod-synken — avvaktades låset, inget ingripande.

- **Rå HTML (mätdokumenterat efter omstart, 03:28):** `/` → 200 (106 342
  byte), `/en` → 200 (107 141), `/ar` → 200 (111 648); `html lang` korrekt
  sv/en/ar. Banner-markup FRAVARANDE i serverrenderad HTML på samtliga tre
  (0 träffar för bannertexterna) — **väntat och korrekt**: komponenten är
  klientrenderad och dold (`return null`) tills useEffect konstaterar att
  inget val sparats. Däremot refererar alla tre sidornas HTML
  bannerns klientchunk (`2hw3pf73h50t5.js`, 2 referenser per sida) —
  bannern skeppas och laddas bevisligen på sv/en/ar. Okulär verifiering i
  webbläsare (synlighet, klick i skärmläge) kräver gränssnittsvaktens
  nästa rond (ärligt: denna S4-rond bevisar flödet i KOD och buntlänkning,
  inte skärmönster).
- **Chunk-bevis (mätdokumenterat):** det 02:44–03:07-fullbyggda .next
  innehåller bannern i klientbunten — `"Vi använder cookies"` hittad i
  `static/chunks/2hw3pf73h50t5.js` — men INTE `"Accept all"`: det
  bygget läste cookie-modulen FÖRE S4:s 02:52-rättning (väntat; inga
  fel). Prod-synkens påföljande bygge (start 03:07, `NEXT_DIST_DIR=
  .next-ny`, källor lästa EFTER rättningen) ger leveranskvitot: nästa
  byggda chunk ska innehålla "Accept all" + "قبول الكل".
- **Deploy-kvito:** S4:s rättning är på disk i arbetsytan sedan 02:52 —
  pågående synk-bygge läser källorna DÄRFÖR EFTER rättningen och bär den
  vid swap+omstart; commit före/efter påverkar bara historiken, inte
  bygginnehållet. Kvarvarande kvito-post: chunk-grep i .next-ny när det
  fönstret stänger.

## 5. Före → Efter (komponent, levererad)

| Yta | Före | Efter |
|---|---|---|
| Språk | 18 hårdkodade svenska strängar; /en + /ar visade svensk banner | `TEXTER`-ordbok {sv,en,ar} × 18 texter; `useSprak().sprak` ger spegelregeln; footerns terminologi följd |
| Kryssrutor | `useState(true)` för analys+preferenser | `useState(false)` — aktiv bockning krävs |
| Lagrad samtyckesdata | `ak1a-cookie-samtycke` JSON v1 | Oförändrad (bakåtkompatibel — sparade val berörs ej) |
| Knappar/länkar/styling | — | Oförändrade (länkar följer footerns konvention till oprefixade policysidor; speglar saknar egna cookiepolicy-sidor — inget påhittat) |

## 6. KVD

- Källtripp: ovan (komponent + montering/språkleverantör + prod/chunks).
- tsc: `node node_modules/typescript/bin/tsc --noEmit` — **0 fel**
  (efter deployfönstrets låssläpp; aldrig under npm ci).
- Commit: denna fil + `src/components/ak1a/cookie-consent.tsx` via
  `git commit -F` (grinden aktiv, inget --no-verify).
- R2: priser/tier/publicering orörda; ingen juridisk textändrad —
  bannerns svenska kärnbudskap är ordagrant bevarat.
- Deploy-kvito: VÄNTAR nästa deployfönster (rondens fönster var upptaget).

RESULTAT: banner (2 fynd — båda rättade: F1 språk, F2 förbockat) — avbryt-väg finns
