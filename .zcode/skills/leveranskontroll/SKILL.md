---
name: leveranskontroll
description: AK1A:s KVD — kvalitetsverifiering före/efter leverans. Typkontroll mot baslinje 34, motorvalidering 107/0/0, kvalitetsvakten GRÖN, prod 200. Använd före push av kod, efter deploy, vid kvalitetsmisstanke eller "värsta fallen"-kontroll. Nyckelord: KVD, kvalitet, kontrollera, verifiera, motorer, vakten.
---

# Leveranskontroll (KVD) — kvalitetsgrinden

KVD = de fyra kontroller som varje våg landas med. Kör före push av kod
och efter varje deploy.

## Kontroll 1 — Typkontroll

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # → 34 (baslinjen)
```

34 = befintliga fel (OK). **Endast 0 nya fel accepteras.** Räkna skillnaden
mot baslinjen — nya fel åtgärdas FÖRE leverans.

**Baslinjens sanning (korrigerad 2026-09-12 av våg-agent V2, [organ:Θ]):**
exakt `grep -c "error TS"` = **34** fel (kört 2026-09-12 21:20 UTC på
commit 436ad6f7). Det gamla talet 36 var TOTALA utdatarader (34 fel + 2
indragna fortsättningsrader från seed-cases-combinations.ts) — räkna
ALLTID med grep på "error TS", aldrig wc -l. Läsningen gällde trädet FÖRE
våg-agent V1:s filåterställningar — kör om baslinjen efter V1:s landning.

## Kontroll 2 — Motorerna (100 %-väktaren)

```bash
node verktyg/validera-motorer.mjs
```

Läs RESULTAT-raden: **107/0/0** (PASS/FAIL/SKIP) är målet. SKIP är
FÖRBJUDET ("kontroller för att allt ska få 100 % är obligatoriska") —
ett SKIP är ett FEL. ~5–10 s körtid.

## Kontroll 3 — Kvalitetsvakten

```bash
node verktyg/kvalitetsvakt.mjs --kör-motorer
```

Ger GRÖN/GUL/RÖD + skriver `data/rapporter/kvalitetsrapport-SENASTE.md`.
- GRÖN = 0 fel, högst 99 manuella granskningar → leverera.
- GUL = 1–9 fel eller många manuella granskningar → bedöm: är felen mina?
  Åtgärda mina; främmande fel rapporteras.
- RÖD = >9 fel eller ogiltig JSON → STOPPA, åtgärda, kör om.

Sju kontroller ingår (mangling, förbjudna fraser, JSON, länkar,
kursdata, sitemap, motorer). Sista stdout-raden `RESULTAT_JSON={...}`
är maskinläsbar.

## Kontroll 4 — Prod

```bash
curl -s -o /dev/null -w "%{http_code}" https://lab.ak1nvestor.com/
```

**200** efter deploy. Kolla även deep-links om ändringen rör en specifik
väg (t.ex. /kurser, /dataset, /studio).

## Snurra

1. Kontroll 1–3 lokalt i arbetsytan FÖRE push.
2. Leverera (se `leverera-kod` / `leverera-data`).
3. Kontroll 4 mot prod EFTER deploy.
4. Notera resultatet i worklog-raderna ("tsc 34 · motorer 107/0/0 ·
   vakten GRÖN · prod 200") — det är vågens kvitto.

Specialfall: schema/SEO-ändringar → kör även
`node verktyg/testa-schema-kurser.mjs`. Studio-ändringar →
`node verktyg/testa-studio-tabbar.mjs`. Matcha testet mot vågens yta.
