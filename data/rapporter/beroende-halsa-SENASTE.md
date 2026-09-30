# Beroendehälsa — 2026-09-30T05:37:47.828Z

**1 sårbarheter (critical 0 · high 1 · moderate 0 · low 0) · 4 uppdateringar inom deklarerat intervall · 9 major-steg.**

Vakten mäter — installation ägs av prod-synken under deploy-låset.

## Sårbarheter

- **[high] brace-expansion** — **fix inom intervall** (prod-synk: `npm install <paket>` räcker)
  - brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service (<1.1.21) — https://github.com/advisories/GHSA-q2hr-2g5m-vwhr
  - brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service (>=4.0.0 <5.0.12) — https://github.com/advisories/GHSA-q2hr-2g5m-vwhr
  - brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion (<1.1.20) — https://github.com/advisories/GHSA-qhr7-859c-m2p7
  - brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion (>=4.0.0 <5.0.11) — https://github.com/advisories/GHSA-qhr7-859c-m2p7
  - brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion (<1.1.19) — https://github.com/advisories/GHSA-6j4f-fj2g-mc7p
  - brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion (>=4.0.0 <5.0.10) — https://github.com/advisories/GHSA-6j4f-fj2g-mc7p

## Uppdateringar inom deklarerat intervall (låg risk)

- eslint-config-next: 16.3.6 → 16.3.7 (patch) — latest 16.3.7
- next: 16.3.6 → 16.3.7 (patch) — latest 16.3.7
- next-intl: 4.14.7 → 4.14.8 (patch) — latest 4.14.8
- sharp: 0.35.4 → 0.35.5 (patch) — latest 0.35.5

## Major-steg (köas, kräver beslut/test)

- @tanstack/react-table: 8.21.3 → latest 9.2.4 (major)
- eslint: 9.39.5 → latest 10.11.0 (major)
- framer-motion: 12.43.0 → latest 13.4.6 (major)
- lucide-react: 0.563.0 → latest 1.49.0 (major)
- react-day-picker: 9.14.0 → latest 10.0.1 (major)
- react-resizable-panels: 3.0.6 → latest 4.14.1 (major)
- recharts: 2.15.4 → latest 3.10.1 (major)
- typescript: 5.9.3 → latest 7.0.2 (major)
- uuid: 11.1.1 → latest 14.0.2 (major)

_Genererad av `verktyg/beroende-vakt.mjs` (spår 8). Stdut-slutraden RESULTAT_JSON är maskinläsbar; avslutskod 1 vid critical/high = cron-larm._
