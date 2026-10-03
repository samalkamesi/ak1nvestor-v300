# VBOUT API-KARTA — verifierad av arbetsstation 2 (2026-10-01, alla anrop EGENMÄTTA)

Kundens kanal: VBOUT (app.vbout.com), konto "AK1 Apex Nexus" (ak1nvestor,
License Tier 4, Europe/Stockholm). Whitelabel vbt.ak1nvestor.com → ssl.vbt.io
secured. Kortlänkar: /goto /r /s /t (redirect-koden levererad separat).

## Autentisering (BEVISAT)

- API User Key som **query-parameter**: `?key=<nyckeln>` (POST-body `key`/`swkey`
  samt headers FUNGERAR INTE — 401). Nyckel i serverns env: EMAIL_API_KEY.
- **Hastighetstak: 10 anrop/fönster** (retry_after 2 s) — adaptern MÅSTE pacinga
  (≥2–3 s) och ha retry vid rate-reached.

## Bas-URL och stil

`https://api.vbout.com/1/<Modul>/<Metod>` — PascalCase-moduler. Allowlist i
adaptern: ENDAST api.vbout.com (Mimosa-regeln: fast https-värd, aldrig
request-styrd destination).

## Verifierade endpointar (HTTP 200 egetmätta)

| Endpoint | Resultat |
|---|---|
| `/app/me.json` | Kontoinfo (business, package, limits) |
| `/EmailMarketing/GetLists` | 8 befintliga listor (se nedan) |
| `/EmailMarketing/AddList` | **skapade "AK1A Systemnotiser" id 197006** |
| `/EmailMarketing/AddContact` | **skapat kontakt id 233811071** (samalkamesi1@gmail.com — KUNDEN) |
| `/EmailMarketing/GetContactTimelineByEmailAddress` | tidslinje per e-post (list-subscription syns) |
| `/EmailMarketing/AddCampaign` | kampanj id 387582 skapad |
| `/EmailMarketing/EditCampaign` | uppdatering kräver ALLA fält (name/subject/body/fromemail/from_name/reply_to) |
| `/EmailMarketing/GetCampaign` | status/ämne/body |

## VIKTIG SEMANTIK — så skickas mejl (fynd från testen)

- **Ingen "skicka enstaka mejl"-endpoint finns.** E-post levereras via:
  (a) **kampanjer** — AddCampaign(type standard, audiences=<listid>) + SÄNDNING
  via schemaläggare: EditCampaign med isscheduled=true + isdraft=false +
  scheduled_datetime (MM/DD/YYYY HH:MM; konto-tz Europe/Stockholm sannolikt).
  Direkt-sändning vid skapande skedde INTE (tidslinjen bevisade ingen
  mail-sent förrän schemaläggning satte). TESTMEJLET 387582 schemalagt —
  bekräfta i tidslinjen (key: mail-sent/email-sent) att det landat.
  (b) **list-automations** — kundensVBOUT-app har automationer; AddContact på
  en lista med kopplad automation avfyrar dennas flöden (kunden uppmanas berätta
  vilka automationer som finns för Systemnotiser-listan om de vill använda den vägen).
- Kampanjer till listan 197006 når ENDAST kunden (1 kontakt) — perfekt som
  systemnotis-kanal: aldrig spam-risk, ingen annan mottagare.

## Befintliga listor (före testet)

167303 AK1nvestor Founders Club · 157798 AK1A aktiesignaler · 129671 AK1A
(Bronze) Väntelista · 125915 AK1A Bronze Light · 120236 AK1nvestor Sverige
(veckobrev) · 120235 AK1nvestor Sverige (webinar) · 100305 AK1nvestor Sverige
API via Adilo · 86188 AK1nvestor Leads (dubbeloptin). **NY: 197006 AK1A
Systemnotiser** = systemets kanal.

## Källor

developers.vbout.com (docs JS-renderad — bröt mot det) · OpenAPI-spek(ar):
github.com/api-evangelist/vbout (vbout-email-marketing-api-openapi.yml m.fl.
— fullständiga parameterlistor) · egna sonder med kundens nyckel.

## Adapter-order (organismen)

Bygg vbout-adaptern i email-sandare mot DETTA kort: query-auth, pacing ≥3 s,
send = AddCampaign + EditCampaign(scheduled) till lista 197006 (kundens
kontakt). Notifieringspolicyns utlösare (R2-väntar/root-behov/UPPDRAG KLART)
och morgonbrevet går via listan.Verifiera testmejl 387582 i tidslinjen.
