# Beroendehälsa — 2026-09-15T09:14:42.526Z

**9 sårbarheter (critical 1 · high 2 · moderate 6 · low 0) · 15 uppdateringar inom deklarerat intervall · 12 major-steg.**

Vakten mäter — installation ägs av prod-synken under deploy-låset.

## Sårbarheter

- **[critical] next** (direkt beroende) — **fix inom intervall** (prod-synk: `npm install <paket>` räcker)
  - Next.js: Unauthenticated Remote Code Execution on windows-hosted servers (>=16.0.0 <16.3.3) — https://github.com/advisories/GHSA-p293-qw3h-jr36
  - Next.js: Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used (>=16.0.0 <16.3.3) — https://github.com/advisories/GHSA-2xp9-vwfh-vxw4
- **[high] js-yaml** — fix kräver major: @mdxeditor/editor@4.2.5
  - JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases (>=4.0.0 <=4.1.1) — https://github.com/advisories/GHSA-h67p-54hq-rp68
  - js-yaml: YAML merge-key chains can force quadratic CPU consumption (>=4.0.0 <4.3.0) — https://github.com/advisories/GHSA-52cp-r559-cp3m
  - JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported (>=4.0.0 <4.3.1) — https://github.com/advisories/GHSA-5p4m-2wfm-xmqj
  - js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources (>=4.0.0 <4.3.2) — https://github.com/advisories/GHSA-2883-xcg3-v3hh
- **[high] sharp** (direkt beroende) — fix kräver major: sharp@0.35.4
  - sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 (<0.35.0) — https://github.com/advisories/GHSA-f88m-g3jw-g9cj
  - sharp: Vulnerabilities in libheif: GHSA-g89c-p67h-r497 and GHSA-2jg2-4ch7-h545 (<0.35.4) — https://github.com/advisories/GHSA-rgj7-g3m4-5g8c
- **[moderate] @mdxeditor/editor** (direkt beroende) — fix kräver major: @mdxeditor/editor@4.2.5
- **[moderate] fflate** — fix kräver major: satori@0.32.0
  - fflate unzipSync can enter an infinite loop when parsing malformed ZIP64 archives (>=0.7.0 <0.7.5) — https://github.com/advisories/GHSA-px8p-9vwx-vf98
- **[moderate] prismjs** — fix kräver major: react-syntax-highlighter@16.1.1
  - PrismJS DOM Clobbering vulnerability (<1.30.0) — https://github.com/advisories/GHSA-x7hr-w5r2-h6wg
- **[moderate] react-syntax-highlighter** (direkt beroende) — fix kräver major: react-syntax-highlighter@16.1.1
- **[moderate] refractor** — fix kräver major: react-syntax-highlighter@16.1.1
- **[moderate] satori** (direkt beroende) — fix kräver major: satori@0.32.0

## Uppdateringar inom deklarerat intervall (låg risk)

- @reactuses/core: 6.5.5 → 6.5.8 (patch) — latest 6.5.8
- @supabase/supabase-js: 2.112.3 → 2.116.0 (minor) — latest 2.116.0
- @tanstack/react-query: 5.102.0 → 5.102.8 (patch) — latest 5.102.8
- @types/react: 19.2.18 → 19.3.0 (minor) — latest 19.3.0
- @types/react-dom: 19.2.4 → 19.3.0 (minor) — latest 19.3.0
- bun-types: 1.4.0 → 1.4.2 (patch) — latest 1.4.2
- eslint-config-next: 16.3.2 → 16.3.5 (patch) — latest 16.3.5
- next: 16.3.2 → 16.3.5 (patch) — latest 16.3.5
- next-intl: 4.13.7 → 4.14.5 (minor) — latest 4.14.5
- puppeteer-core: 25.10.0 → 25.11.0 (minor) — latest 25.11.0
- react: 19.2.8 → 19.3.0 (minor) — latest 19.3.0
- react-dom: 19.2.8 → 19.3.0 (minor) — latest 19.3.0
- react-hook-form: 7.86.0 → 7.88.0 (minor) — latest 7.88.0
- tailwind-merge: 3.6.0 → 3.7.0 (minor) — latest 3.7.0
- zod: 4.4.3 → 4.6.5 (minor) — latest 4.6.5

## Major-steg (köas, kräver beslut/test)

- @mdxeditor/editor: 3.55.0 → latest 4.2.5 (major)
- @tanstack/react-table: 8.21.3 → latest 9.2.4 (major)
- eslint: 9.39.5 → latest 10.10.0 (major)
- framer-motion: 12.43.0 → latest 13.3.0 (major)
- lucide-react: 0.563.0 → latest 1.46.0 (major)
- react-day-picker: 9.14.0 → latest 10.0.1 (major)
- react-resizable-panels: 3.0.6 → latest 4.12.4 (major)
- react-syntax-highlighter: 15.6.6 → latest 16.1.1 (major)
- recharts: 2.15.4 → latest 3.10.1 (major)
- sharp: 0.34.5 → latest 0.35.4 (minor)
- typescript: 5.9.3 → latest 7.0.2 (major)
- uuid: 11.1.1 → latest 14.0.2 (major)

_Genererad av `verktyg/beroende-vakt.mjs` (spår 8). Stdut-slutraden RESULTAT_JSON är maskinläsbar; avslutskod 1 vid critical/high = cron-larm._

---

## UPPDATERING 2026-09-15 18:20 (s8-vaktpost — mätning, ej installation)

**next är fortfarande 16.3.2 INSTALLERAT i prod-trädet** (node_modules/next
mätt 18:17) — CRITICAL-advisorierna lever alltså ~9 h efter rapports
mätning. Patchen (16.3.5, inom ^16.1.1, `npm install next
eslint-config-next`) ägs av prod-synken under deploylåset — fabriksbarn är
förbjudna installation. **LARM till huvudagenten: inkludera patchen i nästa
deploy; beroende-vakten larmar (exit 1) tills dess.**
