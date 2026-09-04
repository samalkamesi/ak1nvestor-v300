# AKM3-kalibrering — Φ-mätning med LÅST grind

**Genererad:** 2026-09-04T20:12:45.172Z · **Schema:** kalibrering/1 v1 · **Modell:** AKM3.2026.09 · **Rond:** 2026-09-04 (månad 2026-09)
**Källor:** Bana B — system_events type=vagvalidering, tabell vagvalidering_dom (per-variabel episoder) · **Dom-rader:** 0 (clean sedan 2026-09-04, FORBUD §10.5) · **Episoder:** 0
**ρ̄:** 0,45 (fallback (för få par: 0)) ⇒ tvärsnittet bär ≈ 2,2 effektiva observationer per dag (12 makrokorrelerade tickers — r1 §2.1)

> **GRINDEN LÅST (AKM3.2026.09):** denna cron SAMLAR bara data — den ändrar ALDRIG. **ΔΦ = 0.** Posteriors uppdateras varje månadsrond (billigt); tabellen fryses och versioneras. Sittande Φ-version: **design-2026-09-03** — oförändrad.
> Handlingsgrind (ALLA krävs för att Φ ska få ändras): (i) n_eff ≥ 20 episoder per fas (tvärsnittsdiskonterade — aldrig nominellt n), (ii) 90 %-kredibelt intervall helt på ena sidan 0,50, (iii) rate-limit max ±0,05 i Φ per fas och månad. Därtill kräver en ändring steg 7 (AKM3-BESLUT §11.7): walk-forward nettoförbättring mot sittande tabell, ny protokollversion, nollställda räknare och deklarerad orsak. I AKM3.2026.09 är grinden LÅST: ΔΦ = 0 — cronen samlar bara data.

## Posteriorer per fas (nivå 1 — global träff per fas)

| Fas | Φ design | T | M | episoder | n_eff | p̂ | 90 %-kredibelt intervall | Φ-förslag | (i) n_eff ≥ 20 | (ii) intervall klart | (iii) ±0,05 | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| impulsvåg bekräftad (n ≥ 2) | ×1,2 | 0 | 0 | 0 | 0 | 0,65 | [0,4, 0,87] | ×1,06 | ✗ (0/20) | ✗ | ✗ | okalibrerad (n=0/20) — vantar-grind |
| impulsvåg obekräftad (n = 1) | ×1,1 | 0 | 0 | 0 | 0 | 0,5 | [0,25, 0,75] | ×1 | ✗ (0/20) | ✗ | ✗ | okalibrerad (n=0/20) — vantar-grind |
| impulsvåg mogen (n ≥ 4) | ×1,2 | 0 | 0 | 0 | 0 | 0,45 | [0,21, 0,7] | ×0,98 | ✗ (0/20) | ✗ | ✗ | okalibrerad (n=0/20) — vantar-grind |
| basbygge | ×1 | 0 | 0 | 0 | 0 | 0,34 | [0,12, 0,59] | ×0,97 | ✗ (0/20) | ✗ | ✓ | okalibrerad (n=0/20) — vantar-grind |
| korrigering, G ≥ 3 | ×0,8 | 0 | 0 | 0 | 0 | 0,46 | [0,22, 0,71] | ×0,98 | ✗ (0/20) | ✗ | ✗ | okalibrerad (n=0/20) — vantar-grind |
| korrigering, G ≤ 2 | ×0,9 | 0 | 0 | 0 | 0 | 0,4 | [0,17, 0,66] | ×0,98 | ✗ (0/20) | ✗ | ✗ | okalibrerad (n=0/20) — vantar-grind |

_T/M = träff/miss-EPISODER (dagar räknas ALDRIG som observationer — FORBUD §10.7). n_eff = episoder diskonterade med √(1/ρ̄). p̂ = (m·q + T)/(m + T + M), m = 10, q ur Markov-priorerna._

## Osatt + korrigering utan G

- **osatt:** 0 episoder — kalibreras ALDRIG (Φ 1,00/0-bidrag är ett ärlighetskontrakt, inte en parameter; FORBUD §9.6).
- **korrigering (G okänd):** 0 episoder (0 träff, 0 miss) mäts i diagnostikpoolen — Bana B:s rader saknar grundpoäng G, och kärnans egen regel är att grenen 0,80/0,90 inte väljs utan gissning. hog_g/lag_g matas alltså INTE förrän en framtida protokollversion levererar G per episod.

## Varningar

- rho-bar: endast 0 tickerpar kunde skattas (krav ≥ 10) — dokumenterad default 0.45 används

## Versionslogg (append-only, hash-kedjad)

- v1 · 2026-09 · typ matning · ΔΦ = 0 · hash `b5400a158c0089b6…` · data/portfolj-system/kalibrering-logg.json

**Automatisk återkallning är KONTRAKT: ligger träffen för faser med ny Φ mer än 5 procentenheter LÄGRE än gamla tabellens inom 90 dagar efter främjandet (n_eff ≥ 30) ⇒ rulla tillbaka och publicera "version X återkallad öppet" (r4 §8.2-formen). Dokumenterad regimepause fryser kalibreringen (ΔΦ = 0 tills vidare).**

_Pedagogisk mätning — inte investeringsråd. Kalibreringen gör modellen mer självkonsistent; den kan inte och skall inte omvandla AKM2 till en kursprognos. "Öppet kvitto om det förflutna — aldrig garanti om framtiden."_
