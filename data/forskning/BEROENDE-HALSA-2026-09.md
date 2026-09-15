# BEROENDEHÄLSA 2026-09-15 — spår 8-kvalitetsvåg (s8-u2)

**FYND: 1 CRITICAL + 2 HIGH sårbarheter, varav critical-fixen ligger INOM
package.json-intervallet (ren patch).** Upptäckt av `verktyg/beroende-vakt.mjs`
(ny, upprepningsbar — se nedan). Fullt register: `data/rapporter/beroende-halsa-SENASTE.md`.

## 1. Fynden med exponeringsanalys (bevisade mot DENNA konfiguration)

### CRITICAL — next 16.3.2 (installerad) sårbar 16.0.0–16.3.2

Två advisories, fix i 16.3.3+; `npm outdated` visar wanted **16.3.5** inom `^16.1.1`.

| Advisory | Innebörd | Tillämplig här? |
|---|---|---|
| [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36) | Oautentiserad RCE på **windows**-värdar | **NEJ** — prod = Linux (Contabo, pm2+nginx) |
| [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) | Oautentiserad RCE i Image Optimization API **vid AVIF** | **LÅG, inte noll** — se bevis nedan |

Bevis för AVIF-bedömningen (insamlade 2026-09-15 mot prod):

- `/_next/image` är levande och publik: `GET /_next/image?url=%2Fog%2Fanalys.png&w=128&q=75` → **200 image/png**.
- `images.formats` är EJ satt i `next.config.ts` → default (webp); AVIF är opt-in och avstängt.
- `remotePatterns` = EXAKT en post: egen Supabase-buckets `media/**` (inga wildcards på host) →
  angriparstyrd bildinput kräver uppladdning till EGEN bucket = autentiserad yta.
- SVG avvisas av optimeraren (sond → 400) — känd genomströmningsvektor stängd.

Slutsats: praktisk exponering i dagens konfiguration är låg, men förutsättningarna
(media-konfig, framtida AVIF-aktivering) kan ändras av en enda framtida commit —
och patchen är en rad inom intervallet. **Patcha omedelbart vid nästa prod-synk.**

### HIGH — sharp 0.34.5 (libvips/libheif-CVE:er, fix 0.35.4)

Input till sharp = egna OG-bilder + mediebiblioteket (auth-krävande uppladdning) →
låg praktisk risk. 0.x-steg (beteendebrytande möjlert) → **köas till major-pass**, ej akut.

### HIGH — js-yaml 4.1.1 (kvadratisk DoS) via @mdxeditor/editor 3.55

Klient-redigerarens beroende; angripare måste mata kvaver YAML in i redigeraren →
låg. Fix = @mdxeditor 4.2.5 (major) → **köas**.

### MODERATE ×6

@mdxeditor, fflate (via satori), prismjs/refractor/react-syntax-highlighter — alla
låsta bakom major-steg (satori 0.32.0, react-syntax-highlighter 16.1.1, @mdxeditor 4.2.5).
Samlas i ett gemensamt major-pass (nedan) i stället för sex enskilda beslut.

## 2. ROTORSAK + KUR

**Rotorsak: npm audit körs aldrig i rutin.** Sårbarheten satt i prod tills denna
våg mätte — ingen mekanism hade upptäckt den (gränsnittsvakten mäter UI,
kvalitetsvakten mäter innehåll/länkar/motorer, prestandamätaren mäter last).

**Kur (levererad): `verktyg/beroende-vakt.mjs`** — kör `npm audit --json` +
`npm outdated --json`, klassar fix-i-intervall vs major-steg, skriver
`data/rapporter/beroende-halsa-SENASTE.md` + fullregister i data/vakten,
slutar med maskinläsbar `RESULTAT_JSON={...}` och **exit 1 vid critical/high**
(klarar av att npm audit själv exiterar 1 när fynd finns — det är vaktens jobb).

**Förslag (huvudagenten äger crontab):** veckorad
`22 6 * * 1 cd /home/ak1a/AK1 && node verktyg/beroende-vakt.mjs >> data/vakten/beroende-cron.log 2>&1`
— kritiska fynd syns då i loggen med exit-kod; kan senare kopplas till vaktprompt.

## 3. FIX-KÖ — prod-synkens exakta kommandon (installationsrätten ägs av prod-synken)

### A. OMEDELBART: critical-patch (inom intervall, package.json förblir `^16.1.1`)

```bash
exec flock -n /tmp/ak1a-deploy.lock bash -c \
  'cd /home/ak1a/AK1 && npm update next eslint-config-next && npm run build && pm2 restart ak1a'
```

- `npm update` respekterar befintliga intervall → lockfilen går till next 16.3.5
  + eslint-config-next 16.3.5 (samma familj), package.json-orörda.
- Verifiera efteråt: `https://lab.ak1nvestor.com/` = 200 ·
  `/_next/image?url=%2Fog%2Fanalys.png&w=128&q=75` = 200 ·
  `node verktyg/beroende-vakt.mjs` → critical 0 (exit 0 kräver även high=0 —
  se B; interim: sammanfattningen visar critical 0).
- Fel bygge: `git checkout package.json package-lock.json` + bygg om (revert-regeln).
- Commit av uppdaterade låsfil+ev. package.json görs av prod-synken med dess rutin.

### B. Planerat patch-pass (låg risk, 13 övriga inom intervall)

`npm update` för @supabase/supabase-js, @tanstack/react-query, next-intl,
react, react-dom, zod m.fl. (se SENASTE-rapporten) — kör under deploy-låset
med KVD efteråt. Ej brådskande; samlas gärna med nästa ordinarie beroendepass.

### C. Major-pass "höststädning" (kräver regressionstest: vakten + KVD + tsc)

sharp 0.35.4 · @mdxeditor/editor 4.2.5 · react-syntax-highlighter 16.1.1 ·
satori 0.32.0 — stänger 2 high + 6 moderate på fyra beslut i stället för åtta.

## 4. Bevis

- `data/rapporter/beroende-halsa-SENASTE.md` — genererad rapport (committad).
- Stdut-slutrad: `RESULTAT_JSON={"sårbarheter":9,"critical":1,"high":2,"moderate":6,"inomIntervall":15,"majorSteg":12}`, exit 1.
- Konfigbevis: `next.config.ts` (images/formats/remotePatterns), prod-sonder 200/400 ovan.
- Installerade versioner ur package-lock.json: next 16.3.2, sharp 0.34.5, js-yaml 4.1.1, @mdxeditor 3.55.0.

— s8-u2 (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-15
