---
description: Kör AK1A:s kvalitetsverifiering KVD (tsc, motorer, vakten, prod)
---

Kör leveranskontroll-färdighetens fyra kontroller i arbetsytan:

1. `npx tsc --noEmit` — baslinje 34 fel (grep -c "error TS"), 0 NYA accepteras
2. `node verktyg/validera-motorer.mjs` — mål 107/0/0 (PASS/FAIL/SKIP)
3. `node verktyg/kvalitetsvakt.mjs --kör-motorer` — mål GRÖN
4. `curl -s -o /dev/null -w "%{http_code}" https://lab.ak1nvestor.com/` — mål 200

Rapportera som vågkvitto på svenska:
"tsc N · motorer X/Y/Z · vakten FÄRG · prod KOD" + ev. avvikelser och
åtgärdsförslag. $ARGUMENTS
