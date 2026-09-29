# SALJ-U4 — Konverteringsresan: besökare → provare → medlem

**Våg:** v207-u4 (fabriksagent BYGGARE) · **Datum:** 2026-09-29
**Uppdrag:** Bygg besökarens VÄG till medlemskap — utan att röra priser (R2).
**Metod:** källa först, återanvänd komponenter — inget nytt system.

## Sammanfattning

Läckan var inte knapparnas antal — startsidan hade redan en tydlig primär
"Börja gratis"-knapp (guldsignatur). Läckan var VÄGEN: varje klick landade i
/logga-in:s **inloggningsläge**, och besökaren fick själv hitta växellänken
"Ny här? Skapa ett gratis konto" — ett extra beslut på väg till registrering.
Denna våg gör två saker: (1) öppnar formuläret direkt i **Skapa konto-läget**
via `?lage=registrera` på varje befintlig CTA, och (2) ger kurssidan en
kontextuell konto-CTA som svarar på "varför ett konto?" med framstegssparning.
Dessutom kvitterar `/bli-medlem` (naturlig säljlänk) som tidigare gav 404.

## Före → Efter per yta

| Yta | Före | Efter |
|---|---|---|
| `/bli-medlem` | **404** (sond localhost 2026-09-29) | **308** → `/logga-in?lage=registrera` (next.config, samma mekanism som `/pris` — som svarar 308 på den körande instansen; träder i kraft vid nästa deploy) |
| `/logga-in` (mottagare) | Landar alltid i "Logga in"-läget; registrering kräver klick på växellänk | `?lage=registrera\|skapa` läses vid mount ⇒ formuläret öppnas direkt i Skapa konto-läget (recovery-hash äger läget före paramen) |
| Startsida · hero | "Börja gratis" → `/logga-in` (inloggningsläge) | → `/logga-in?lage=registrera` (knappen fanns — synligheten stärktes på VÄGEN enligt uppdraget) |
| Startsida · stigen steg 1 | "Skapa kontot" → `/logga-in` | → `/logga-in?lage=registrera` |
| Startsida · slut-CTA | "Bli medlem — gratis" → `/logga-in` | → `/logga-in?lage=registrera` |
| SektionsCta (delad) | "Börja gratis" → `/logga-in` | → `/logga-in?lage=registrera` (gäller alla sidor som bär komponenten: startsidans stripar + /kurser-botten m.fl.) |
| `/kurser` + `/en/kurser` + `/ar/kurser` | Sidospalten bar bara FortsattPanel (renderar null för nya besökare) | **NY SparaFramstegPanel** vid kurserna: "Spara ditt framsteg" + "Skapa konto — gratis" → `/logga-in?lage=registrera`; döljs för inloggade medlemmar (ak1a-member); texter ur ordlistan sv/en/ar |
| Social proof | Fanns redan — ingen ny yta byggd | Dokumenterat nedan |

## Social proof — läget före var redan starkt (dokumentation)

Uppdraget: "OM data finnes (antal kurser/rörelser — ur källans räknare)".
Data och yta fanns båda:

- **Startsidan** bär `home.socialProof`-raden under heron ("{kurser} kurser ·
  {artiklar} artiklar · 3 språk") + sifferbandet med fem mätta tal
  (kurser, quiz-frågor, böcker, verktyg, 0 kr) — kurser/quiz/böcker ur
  `SIFFROR` (src/lib/siffror.ts = guldkällan, räknas av
  verktyg/rakna-siffror.mjs), artiklar = mätta publicerade data/blogg/*.json.
- **/kurser** bär SocialProof-komponenten (STATSTIK ur SIFFROR: kurser,
  böcker, quizfrågor, "100 % gratis i Fas 1" + elevröster med angiven nivå).

Slutled: inga påhittade tal tillfördes; ytan stärks indirekt av att dess
CTA:er nu leder rätt (SektionsCta + panelen ovan).

## R2 — priser rörs ej

- Inga prisbelopp, inga tier-ändringar, ingen publicering.
- "gratis" / "0 kr · en minut" / "Fas 1 för alltid 0 kr" är befintlig
  etablerad copy som återanvänds ordagrant — inga nya kr-påståenden.
- Registreringsmekaniken o-rörd: POST /api/medlem action:signup via
  befintlig MedlemInloggning; endast lägesstarten tillkom.

## KVD

- `node node_modules/typescript/bin/tsc --noEmit` → **0 fel** (exit 0).
- Redirect-mekanismbevis: `curl localhost:3000/pris` → **308** → /medlemskap
  (samma next.config-mekanism som /bli-medlem).
- `/bli-medlem` före: **404** (före-commit-sond). Efter: 308 vid nästa
  deploy (byggen ägs av prod-synken/kraschvakten — fabriksagenten bygger ej).
- Speglar: en/ar bär SparaFramstegPanel + ordlistenycklar i alla tre språk;
  CTA-länkarna är gemensamma i HomeSection/SektionsCta (sitter därmed i
  speglarna automatiskt).

## Filer

- `next.config.ts` — redirect /bli-medlem (308)
- `src/components/ak1a/medlem-inloggning.tsx` — ?lage-läsning vid mount
- `src/components/ak1a/sections/home-section.tsx` — hero + stig + slut-CTA
- `src/components/ak1a/sektions-cta.tsx` — delad CTA-knapp
- `src/components/ak1a/spara-framsteg-panel.tsx` — NY panel
- `src/app/(huvud)/kurser/page.tsx`, `src/app/(en)/en/kurser/page.tsx`,
  `src/app/(ar)/ar/kurser/page.tsx` — montering av panelen
- `src/lib/ordlista.ts` — nycklar kurser.sparaRubrik/sparaText/sparaKnapp

## Nästa steg (för huvudsessionen)

1. Deploy (prod-synkens bygge) ⇒ verifiera `curl -s -o /dev/null -w '%{http_code}'`
   på `/bli-medlem` = **308** → destination `/logga-in?lage=registrera`.
2. Gränsnittsvakten efter deploy (nya panelen på tre kurssidor).
