---
name: parallell-dispatch
description: AK1A:s system för parallella agenter — dispatchlista, promptmall med projektkontext, KVD-krav per agent och taket R4 (~9 agenter). Använd vid megauppdrag, självständiga delblock, bakgrundsexekvering. Nyckelord: parallella agenter, dispatch, subagent, bakgrund, mega.
---

# Parallell dispatch — många agenter, ett projekt

Megauppdrag delas i SJÄLVSTÄNDIGA block som körs parallellt (R3: autonomt
med full access). Taket är R4: **~9 parallella agenter** — kundens
plattformstak; reservera marginal, 6–7 aktiva är säkert.

## Före dispatch

1. Dela upp i block med **foga överlapp** — två agenter får ALDRIG skriva
   samma fil (särskilt inte `ordlista.ts`, `sokindex.ts`, samlingar).
2. Skriv blocken till `data/forskning/PIPELINE-KO.md` (dispatchlistan) så
   att vågen är spårbart definierad.
3. Bestäm KVD per block (vilka test-skript som gäller).

## Promptmall (varje agentprompt innehåller ALLT detta)

```
KONTEXT: AK1A (lab.ak1nvestor.com) — svensk plattform för finansiell
UTBILDNING (aldrig investeringsråd). Prod = Contabo, gren develop,
remote prod=/home/ak1a/AK1. Sanningshierarki: AGENTS.md > data/forskning/
STYRELSE-*.md > worklog.md. Läs AGENTS.md först.
UPPGIFT: <blockets mål, exakta sökvägar, filformat>
REGLER: rör INTE <andra blockets filer>. svenska UI-texter. tre språk.
Juridik: utbildningsformuleringar alltid.
KVD: npx tsc --noEmit (0 nya fel; baslinje 34) + <blockets test-skript>.
LEVERANS: commit "studio: <block> — <vad>" UTAN push; huvudagenten
pushar och bygger. Rapportera klart/fel i slutmeddelandet.
```

## Under körning

- Körs agenter i bakgrund: samla resultat, döda fastkörda
  (TaskStop), låt ALDRIG en tyst agent blockera vågen.
- Konflikt (samma fil, samma namn): först till kvarn, tvåan omarbetar
  mot det nya läget — aldrig tvärtom.

## Efter körning

1. Verifiera varje agents KVD-lovande i MAIN (lita inte blint):
   kör `leveranskontroll`-färdigheten.
2. Bunta commits, ÉN push `git push prod develop`, ÉN build per våg
   (KVD: tsc 34 · motorer 107/0/0 · vakten GRÖN · prod 200).
3. Uppdatera PIPELINE-KO (stryk färdiga rader) + worklog + STYRELSE-
   ADMIN-MEGA.md (vågsektion).

## Känt fallgärn

Server-OOM vid för många tunga bygg-agenter samtidigt (våg 85:
prod 13/14 sista kontrollen). Bygg ALDRIG parallellt i /home/ak1a/AK1 —
byggandet är huvudagentens ensamrätt.
