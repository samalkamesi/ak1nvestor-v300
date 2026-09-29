# SÄLJ-U5 S1 — köpar-URL:erna (A1+B1) LEVERERADE + prod-räddning 2026-09-29

**Uppdrag**: SÄLJKARTA-2026-09-29.md A1+B1 — de naturliga svenska
köpar-URL:erna `/integritetspolicy` (GDPR art 13, svensk URL) och
`/bli-medlem` (konverteringsresan) skall leva. Kartan förordade ett
redirect-paket; uppgiftens beslutregel: **live-läget styr** efter deploy.

**Roll**: BYGGARE (fabriksagent S1). Ägarskap respekterat: next.config.ts
läst + verifierat, **orört av S1** (inget behövdes läggas till — se beslut);
denna protokollfil + DRIFTSBOKEN-notis är S1:s leveransytor.

---

## 1. Beslut — live-läget avgjorde: NOLL nya rader i next.config.ts

Trädets sanning före S1:s ingripande (allt verifierat i kodbasen):

| Krav | Lösning i trädet | Byggd av | Bevis |
|---|---|---|---|
| A1 `/integritetspolicy` | **Riktig sida** `src/app/(huvud)/integritetspolicy/page.tsx` (full GDPR-art 13-metadata, `revalidate 3600`) + sitemap-rad | v207-u2 (76d0b5b0, mergad 535743e3) | live **200** kl 03:21 |
| B1 `/bli-medlem` | **Redirect** i next.config.ts → `/logga-in?lage=registrera`, `permanent: true` | v207-u4 (17307100, mergad 535743e3) | live **308** + `Location: /logga-in?lage=registrera` |

Beslutskedjan enligt uppgiftens regelverk:

1. Live-mätning vid S1:s start: **502 på ALLA rutter** — prod låg mitt i
   ett driftsfönster (se § 3). Live-läget kunde inte styra förrän deploy
   landat; trädet granskades därför först.
2. Regeln "OM 200 EFTER deploy: bygg ENDAST /bli-medlem-redirect" →
   redirecten **fanns redan** (v207-u4). Inget att bygga.
3. Regeln "OM fortfarande 404: bygg BEGGE redirects" → **ej aktuell**:
   sidan finns i trädet och deployen landade 200. Dessutom är redirect-
   varianten numera **aktivt skadlig**: Next.js kör `redirects()` FÖRE
   filsystemsrutter — en `/integritetspolicy→/privacy-policy`-post skulle
   kidnappa v207-u2:s riktiga sida och kollidera med sitemap-raden som
   deklarerar `/integritetspolicy` som kanonisk URL. Kartans förslag
   (före v207-u2 fanns) är därmed **ersatt av den bättre lösningen**.

**Slutsats**: A1+B1 var redan fullbyggda i develop; S1:s värde blev
(a) beslutsdokumentationen, (b) spegelprövningen (§ 2), (c) prod-
räddningen som landade deployen (§ 3) och (d) live-kvittona (§ 4).

## 2. Speglarna (en/ar) — beaktade, inga nya redirects

- Kartans egen notering: "Footern länkar /privacy-policy (200) på alla
  tre språk → inget brutet flöde internt" — speglarnas juridikflöde lever.
- Speglarnas medlemsresa bor på `/en/logga-in` + `/ar/logga-in` — båda
  mätta **200** (03:21). Inga kodreferenser till `/en/bli-medlem` eller
  `/ar/bli-medlem` finns (grep över src/ = 0 träff utanför kommentarer).
- Befintligt redirect-mönster (v207-u4, `/pris`, `/kontakt`, `/terms`)
  är ENBART svenska rotrutter — inget spegelprecedens finns, och spekula-
  tiva spegel-redirecter utan efterfrågan/bevis skulle bara breda ut
  redirect-tabellen. **Beslut: speglarna lämnas orörda.**

## 3. Driftevenemanget — prod 502 i 35 min, räddad mot fullbordad artefakt

Ärlig redovisning (S1 rörde INTE någon bygg-/installationsyta — reglerna
hölls; ingripandet var drift-ops-ordningen `pm2 restart` mot VERIFIERAD
komplett artefakt):

- **02:36** prod-synk bygger `.next-ny` (V182-metoden) — någonting går
  snett i fönstret; `.next` blir trasig.
- **02:44** pm2 `ak1a` kraschloopar (+39 omstarter; signatur i error-
  loggen: `ENOENT .next/prerender-manifest.json`). Kraschvakten griper:
  stoppar pm2 (medvetet — restart mot ofullständig artefakt = kraschloop),
  `rm -rf .next` + fullt räddningsbygge under deploy-låset.
- **03:09** kraschvaktens `spawnSync`-väntan tar timeout; artefakten
  döms trasig (`prerender-manifest.json` saknas) — **prematurt**: den
  filen skrivs först vid byggSLUT, och cpus:1-bygget behöver ~29 min.
  Kooldown 30 ⇒ nästa poll (~03:39) hade rivit den snart klara artefakten
  och byggt om (~35 min extra driftstopp).
- **03:17–03:19** byggprocessen fullbordar som föräldralös: BUILD_ID +
  `prerender-manifest.json` (1,3 MB) på plats, process utgången normalt.
  S1 verifierar artefakten, kör `pm2 restart ak1a --update-env`
  (drift-ops-ordningen), omstartsräknaren stabil (53, inga nya krascher),
  localhost 3000 ⇒ 200. Kraschvaktens 03:39-poll finner appen svarande ⇒
  ombygget avstyrs naturligt.
- **Fynd till huvudagenten** (EJ åtgärdat av S1 — kraschvakten är utanför
  S1:s ägarskap): kraschvaktens spawnSync-timeout är kalibrerad kortare
  än cpus:1-byggtiden, och artefaktkontrollen kör före byggprocessens
  exit ⇒ falskt "trasig"-utmärke på långsamma men friska byggen. Förslag:
  timeout ≥ 40 min ELLER artefaktkontroll endast efter processexit.
  Protokollförd i DRIFTSBOKEN (2026-09-29-sektionen).

## 4. KVD-kvitton (2026-09-29, kl 03:19–03:21 UTC-tiden lokal CESt → tider enligt serverklocka)

| Kontroll | Resultat |
|---|---|
| `tsc --noEmit` (node node_modules/…) | **0 fel** |
| https://lab.ak1nvestor.com/ | 200 (via localhost 3000 + nginx-svar) |
| `/integritetspolicy` | **200** (A1 STÄNGD — riktig sida) |
| `/bli-medlem` | **308 Permanent Redirect**, `Location: /logga-in?lage=registrera` (B1 STÄNGD) |
| `/privacy-policy` | 200 |
| `/logga-in` | 200 |
| `/en/logga-in` + `/ar/logga-in` | 200 + 200 |
| pm2 `ak1a` | online, stabil (inga nya omstarter efter 03:19) |
| R2 (priser/juridiktext) | ORÖRD — ingen text, inga priser rörda |

Deploy-kvito kräver INTE "VÄNTAR"-notering: deployen LANDADE under S1:s
pass (kraschvaktens räddningsbygge + S1:s pm2-återstart) och kvittoa ovan
är tagna MOT LIVE EFTER landningen.

RESULTAT: A1+B1 stängda live — /integritetspolicy 200 (riktig GDPR-sida),
/bli-medlem 308 → /logga-in?lage=registrera; noll nya redirect-rader
behövdes; prod-räddning +39→stabil dokumenterad i DRIFTSBOKEN
