---
name: sessionstart
description: AK1A-sessionens startsnitt — kör vid ny session, otydligt läge eller efter paus. Samlar aktuell vågstatus, sanningshierarkin, dokumentkartan och ett snabbt lägesläge via agent-status. Nyckelord: ny session, läge, status, våg, börja, var står vi.
---

# Sessionstart — AK1A Research Lab

Du är AK1A-agenten i studion (lab.ak1nvestor.com). Denna färdighet ger dig
situation awareness på under en minut — INGEN grävning i worklog krävs.

## Steg 1 — Kör lägesrapporten (10–15 s)

```bash
node verktyg/agent-status.mjs
```

Ger: gren + trädstatus, senaste commits, senaste våg ur worklog,
prod-hälsa (HTTPS 200?), pm2-läge, kvalitetsvaktens senaste status,
verktygsbältets skick.

## Steg 2 — Sanningshierarkin (ALDRIG bryt ordningen)

1. `AGENTS.md` — briefing, aktuell sanning.
2. `data/forskning/STYRELSE-*.md` — beslut + vågstatus (senaste = sant).
3. `worklog.md` — historik (10k+ rader; sök, läs inte hela).
4. Övriga rot-docs (`MEGA_PLAN*.md`, `ZAI_NATIVE_PLAN.md`, …) —
   **HISTORISKA 2026-08–09**. Använd ALDRIG som sanning.

## Steg 3 — Dokumentkarta (vart jag tar vägen för vad)

| Behov | Fil |
|---|---|
| Styrelsens beslut/vågkontrakt | `data/forskning/STYRELSE-ADMIN-MEGA.md` (rubriker per våg) |
| Styrelsens mötesprotokoll | `data/forskning/STYRELSE-BESLUT.md` |
| Dispatchlista för pipelinen | `data/forskning/PIPELINE-KO.md` |
| Drift (backup, DR-prov, ISR) | `data/DRIFTSBOKEN.md` |
| Kvalitetsrapport | `data/rapporter/kvalitetsrapport-SENASTE.md` |
| Leveransprotokoll i detalj | skills `leverera-kod` / `leverera-data` |

## Steg 4 — Kännetecken på projektet (minns dessa)

- Svensk plattform för finansiell **utbildning** — ALDRIG investeringsråd
  (se färdighet `juridikgrind`).
- Prod = Contabo-servern (5.189.162.162): Next.js (pm2 `ak1a`, port 3000)
  + app-server + nginx. Gren: **develop**. Remote `prod` = `/home/ak1a/AK1`.
- Kundens priser/domän/juridik = R2 (väntar kund) — ALDRIG autonomt.
- TSC-baslinje: 34 befintliga fel = OK (korrigerad 2026-09-12; 36 var
  totalrader inkl. 2 fortsättningsrader); endast 0 **nya** fel accepteras.

## När läget avviker

- agent-status visar RÖD/GUL kvalitet → läs rapporten, åtgärda först.
- Prod ≠ 200 → driftfall: se färdighet `drift-ops`.
- Osäker på prioritet → fråga styrelsen (färdighet `styrelsemote`).
