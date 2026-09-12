# FORSKNINGSUNDERLAG: Autonoma agentsystem — läget 2026 (V112)

**Kundens stående direktiv:** "forska alltid djupt för att bygga enligt
forskningar." Detta dokument grundar organismsystemets nästa steg i aktuell
forskning; varje byggt steg hänvisar hit. Uppdateras vid varje forskningsvåg.

---

## 1. Självläkande agentramverk — VALIDERAR VÅRT SPÅR

- **A Self-Healing Framework for Reliable LLM-Based Software Agents**
  (arXiv 2605.06737, 2026): felupptäckt + återhämtning som RAMVERK, inte
  ad-hoc. ⇒ Våra vakter (gränssnittsvakten, målhjärtslaget, bygg-lägesvakten)
  + självläkningen (kilad turn → omstart) ligger i forskningsfronten.
  **Nästa steg enligt pappret:** formella återhämtningskontrakt — varje fel
  har en dokumenterad väg tillbaka (vårt: regelverk § 3 + loggarna).
- **Autonomous Multi-Agent System for Integrated SRE** (ICSSSM-25):
  självläkande multi-agenter för drift. ⇒ Ronder som SRE-pass stödjs.

## 2. Trace-driven optimering — redan implementerat hos oss

- **Adaptive: Self-Healing AI Agents** (Medium, 2026): agenter analyserar
  produktionsspår (traces) och optimerar kontinuerligt.
  ⇒ Vårt mönster: vaktens rapporter + worklog = spåren; ronden = analysen;
  organismen = optimeringen. **Förstärkning:** ronden ska citera konkreta
  spår (logg-rader) i varje beslut — protokollet kräver det sedan våg 109.

## 3. Evolutionära algoritmer på LLM-agenter — GRUNDAR KOSTNADS-FITNESS

- **Automated Prompt Engineering for Cost-Effective Code** (arXiv
  2408.11198): populationsbaserade metaheurister (naturligt urval) för
  KOSTNADSEFFEKTIV kodgenerering. ⇒ **KOSTNADS-FITNESS (våg 112,
  implementerad):** tokens per landad commit mäts per rond i
  organ-registret; organismens ekonomi blir evolutionsfaktor.
- **A Toolbox for Improving Evolutionary Prompt Search** (ACL 2025,
  Grieβhaber m.fl.): LLM som svart låda; populations-sökning över prompts.
  ⇒ **PROMPT-EVOLUTION (nästa steg):** organs UPPDRAGSTEXSTER är prompts —
  barnorgan ärver + muterar förälderns uppdrag (mikro-fokus), och döda
  organs bokstavsbokstav återanvänds. Framtida steg: LLM-refinerade
  mutationer av uppdragstexter (crossover mellan topporgan).
- **The What & When of Self-Evolving Agents** (Tu, 2026 — 3×3-ramverk):
  VAD som utvecklas (prompts/verktyg/minne) × NÄR uppdateringar består.
  ⇒ Vårt register = "persistens"-axeln: evolutionen landar i fil (våg 109),
  aldrig bara i minnet — forskningsrådet följs.

## 4. Robusthet — varning att ta på allvar

- **LLMs instantiate evolutionarily robust strategies** (PNAS Nexus, 2026):
  granska agenter även i OFF-Ekvilibrium-läge (oväntade situationer).
  ⇒ Vakten mäter oväntade tillstånd (konsolfel, överflöd) — komplettera
  med Oväntat-läge-test i DR-ronder (kvartalsvis, som DR-provet våg 98).

## Beslutstabell — forskning ⇒ byggt/nästa

| Forskning | Status i AK1A | Nästa |
|---|---|---|
| Självläkningsramverk (2605.06737) | ✅ 4 pumpar + självläkning | återhämtningskontrakt i § 3 |
| Trace-driven optimering | ✅ vakt+rond | spår-citat i protokoll |
| Kostnadseffektiv EA (2408.11198) | ✅ våg 112 kostnads-fitness | kr-prissättning (kundens R2) |
| Prompt-evolution (ACL 2025) | 🔄 barn ärver uppdrag | LLM-muterade uppdragstexter |
| 3×3 persistence (Tu 2026) | ✅ registret i fil | — |
| Off-ekvilibrium (PNAS 2026) | 🔄 vaktens oväntade-läge | kvartals-DR av organismen |

*Källor sökta 2026-09-12 via webbsökning; länkar i protokollet.*
