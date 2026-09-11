---
name: leverera-data
description: AK1A:s dataleveransprotokoll — innehållsfiler (data/**, markdown, JSON) som appar läser från disk. Commit + push prod, INGET bygge. Använd vid ändringar i data/, blogg, kurser, dokumentation. Nyckelord: datafil, innehåll, publicera text, leverera data.
---

# Leverera data — data/** och innehåll

Datafiler behöver INGET bygge: apparna läser dem från disk.

## Protokoll

```bash
# 1. Commit (svenska, "studio:"-prefix)
git add data/<fil> && git commit -m "studio: <vad + varför>"

# 2. Push till prod — klart, ingen omstart behövs
git push prod develop
```

Remote `prod` = `/home/ak1a/AK1` (lokal sökväg på servern,
`receive.denyCurrentBranch=updateInstead` — pushen uppdaterar arbetsträdet
direkt). Kräver rent träd där; avvisas pushen: städa serverns träd
(`git checkout -- .` + `git clean -fd data/cache` i /home/ak1a/AK1) och
pusha om.

## Vilka filer räknas som data

- `data/forskning/*.md`, `data/blogg/*.json`, `data/bokmaster/*.json`,
  `data/rapporter/*`, `data/DRIFTSBOKEN.md`, `data/varumarke.json`
- `worklog.md`, styrelsens dokument
- `verktyg/*.mjs` (fristående skript, ej importerade av appen)
- `.zcode/skills/**`, `.zcode/commands/**` (verktygsbältet)

## Tänk på

- JSON MÅSTE vara giltigt — kvalitetsvakten (kontroll 3) parsar ALLA
  `data/*.json`. Kör `node verktyg/kvalitetsvakt.mjs` efter större
  dataleveranser.
- Dataset-innehåll: ALDRIG per-bolagsdata i klartext (kontrakten i
  `data/forskning/A2-DATASET-KONTRAKT.md` — medianer/aggregat tillåtna).
- Kursinnehåll på tre språk (sv/en/ar): leverera alla tre i samma commit
  — annars sjunker översättningskorpusens täckning.
- Bilder från kunden hamnar i `uploads/` — läses med Read (visuellt)
  BEFORE svar om dem. Committa inte kundbilder till data/ utan behov.
