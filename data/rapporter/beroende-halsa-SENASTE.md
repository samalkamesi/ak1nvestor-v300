# Beroendehälsa — 2026-09-24T13:28:55.609Z

**7 sårbarheter (critical 0 · high 1 · moderate 6 · low 0) · 7 uppdateringar inom deklarerat intervall · 11 major-steg.**

Vakten mäter — installation ägs av prod-synken under deploy-låset.

## Sårbarheter

- **[high] js-yaml** — fix kräver major: @mdxeditor/editor@4.2.5
  - JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases (>=4.0.0 <=4.1.1) — https://github.com/advisories/GHSA-h67p-54hq-rp68
  - js-yaml: YAML merge-key chains can force quadratic CPU consumption (>=4.0.0 <4.3.0) — https://github.com/advisories/GHSA-52cp-r559-cp3m
  - JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported (>=4.0.0 <4.3.1) — https://github.com/advisories/GHSA-5p4m-2wfm-xmqj
  - js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources (>=4.0.0 <4.3.2) — https://github.com/advisories/GHSA-2883-xcg3-v3hh
- **[moderate] @mdxeditor/editor** (direkt beroende) — fix kräver major: @mdxeditor/editor@4.2.5
- **[moderate] fflate** — fix kräver major: satori@0.32.0
  - fflate unzipSync can enter an infinite loop when parsing malformed ZIP64 archives (>=0.7.0 <0.7.5) — https://github.com/advisories/GHSA-px8p-9vwx-vf98
- **[moderate] prismjs** — fix kräver major: react-syntax-highlighter@16.1.1
  - PrismJS DOM Clobbering vulnerability (<1.30.0) — https://github.com/advisories/GHSA-x7hr-w5r2-h6wg
- **[moderate] react-syntax-highlighter** (direkt beroende) — fix kräver major: react-syntax-highlighter@16.1.1
- **[moderate] refractor** — fix kräver major: react-syntax-highlighter@16.1.1
- **[moderate] satori** (direkt beroende) — fix kräver major: satori@0.32.0

## Uppdateringar inom deklarerat intervall (låg risk)

- @supabase/supabase-js: 2.116.0 → 2.117.1 (minor) — latest 2.117.1
- @tanstack/react-query: 5.103.1 → 5.103.2 (patch) — latest 5.103.2
- eslint-config-next: 16.3.5 → 16.3.6 (patch) — latest 16.3.6
- next: 16.3.5 → 16.3.6 (patch) — latest 16.3.6
- next-intl: 4.14.5 → 4.14.7 (patch) — latest 4.14.7
- puppeteer-core: 25.11.0 → 25.12.0 (minor) — latest 25.12.0
- satori: 0.33.4 → 0.33.5 (patch) — latest 0.33.5

## Major-steg (köas, kräver beslut/test)

- @mdxeditor/editor: 3.55.0 → latest 4.2.5 (major)
- @tanstack/react-table: 8.21.3 → latest 9.2.4 (major)
- eslint: 9.39.5 → latest 10.11.0 (major)
- framer-motion: 12.43.0 → latest 13.4.3 (major)
- lucide-react: 0.563.0 → latest 1.48.0 (major)
- react-day-picker: 9.14.0 → latest 10.0.1 (major)
- react-resizable-panels: 3.0.6 → latest 4.13.3 (major)
- react-syntax-highlighter: 15.6.6 → latest 16.1.1 (major)
- recharts: 2.15.4 → latest 3.10.1 (major)
- typescript: 5.9.3 → latest 7.0.2 (major)
- uuid: 11.1.1 → latest 14.0.2 (major)

_Genererad av `verktyg/beroende-vakt.mjs` (spår 8). Stdut-slutraden RESULTAT_JSON är maskinläsbar; avslutskod 1 vid critical/high = cron-larm._
