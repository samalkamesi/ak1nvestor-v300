# V213B-U4 — Kontraktssvit organ-bus (fabriksleverans)

**Datum:** 2026-09-20 · **Våg:** 213b (uppgift u4 av 10) · **Resultat: 63/63 PASS — GRÖN**

## Vad som levererats

`verktyg/testa-motor-organ-bus.mjs` — kontraktssvit för motorn
`src/lib/autonom/organ-bus.ts` (organsystemets kommunikationsprotokoll,
F1 i MEGASYSTEM-planen: makro-organet orkestrerar mikro-organ via
meddelanden i `system_events`). V212:s motorregister konstaterade 102
motorer men bara 92 testade — denna våg (V213B) ger de 10 otestade
minimala kontraktssviter; detta är den fjärde.

## Metod

1. Motorfilen lästes FÖRST, rad för rad — sviten testar dess faktiskt
   exporterade kontrakt (`skicka`, `lasSenaste`, `mikroRapporter`,
   `korRunda`), aldrig påhittat beteende.
2. Miljöklass DETERMINISTISK: Supabase-env (`NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) stryks
   FÖRE import — `getSupabaseRest()` ⇒ null och inget skarpt anrop kan
   ske. Transportkontrakten (POST/GET mot `/rest/v1/system_events`)
   verifieras istället under en kontrollerad `globalThis.fetch`-stub med
   ogiltig fake-konfig (`fake-ref.supabase.co` + uppdiktad nyckel):
   riktigt nätverk är onåbart, stubben registrerar varje anrop och svarar
   deterministiskt. Ingen server, inga timers som överlever
   `process.exit`, inga externa processer.
3. TS-import via `verktyg/_o106-ts-import.mjs` (resolve-hook, Node ≥
   22.18 type stripping) — körs i REN node, tsx-återfall behövdes ej.

## Kontrollområden (63 kontroller)

- **A — modulkontraktet** (1): exporterna finns och är funktioner.
- **B — mikroRapporter, ren kärna** (28): exakt fem organ i fast
  ordning (Kurs, Blogg, Analys, Marknad, Retention); status-vokabulär
  {ok, varning, atgardar}; matt/forslag-form; varje organs trösklar
  mot koden — kurser 226 (räkneförslag under målet, status alltid ok),
  bloggDagarSedan > 3 ⇒ atgardar (gräns 3/4 provad), analyser < 5,
  besokare7d < 10, konvertering < 8 ⇒ "Stärk CTA", sitemap-raden alltid;
  retention alltid varning med notering om mätstart > 10 medlemmar;
  nollsignal; determinism (byte-identiskt vid omkörning).
- **C — fail-safe utan konfig** (8): `skicka` ⇒ false, `lasSenaste` ⇒
  [] (aldrig null, aldrig kast), `korRunda` levererar HELT
  RondResultat — timestamp parsbar ISO, exakt makroFråga-sträng,
  rapporter byte-identiska med kärnan.
- **D — transportkontrakt under stub** (17): URL/metod/headers
  (Content-Type, Prefer return=minimal, apikey/Authorization), kroppens
  form (type "organ_msg", severity "info", source "organ-bus",
  details = hela meddelandet), message-prefix `[från→till:typ]` och
  trunkering av JSON-delen vid exakt 300 tecken; felvägar (!ok ⇒
  false, fetch-kast ⇒ false, json-null ⇒ [], aldrig delvis data);
  lasSenastes GET-URL med type=eq.organ_msg + limit (default 40) +
  vaktfilter (details null / utan fran avvisas).
- **E — korRunda som protokoll** (9): exakt 7 transportanrop per rond
  (1 fråga MAKRO→ALLA, 5 rapporter från organen i kärnans ordning,
  1 delegation MAKRO→BYGGAGENT med kön = beslutens titlar) —
  rubrikens bounded-löfte "~15 meddelanden per rond" håller med god
  marginal; prioriteringen atgardar(3) > varning(2) > ok(1) med stabil
  sortering (KASSTRÖFEL ⇒ tre atgardar-organ score 30; HELT_OK ⇒
  retention 20 före Kurs/Blogg 10); delegationsKo = beslutens titlar.

## Kördata (KVD)

- `node --check` ⇒ OK.
- Körning: **63/63 PASS**, exit 0, körtid **0,13 s** (tak 60 s).
- Ren node v22.23.2 (type stripping + _o106-hooken) — ERR_MODULE_NOT_FOUND
  uppstod ej, tsx-återfall outnyttjat men tillgängligt.
- Senaste raden exakt `RESULTAT: 63/63 PASS` (fabrikens kvittoformat).

## Ärligt rött

Inga äkta motorfel funna — samtliga kontrakt i motorfilen håller vad
de lovar (fail-safe-grenar, bounded-meddelanden, deterministisk
prioritering). Inget test sänkt, ingen tröskel mjukad. `src/` orörd —
hela leveransen är testfilen + detta protokoll.

## Juridik

Protokollet och sviten beskriver plattformens interna
kvalitets- och driftsystem (utbildningstjänstens egen drift), inga
finansiella råd — lagen (2007:528) rör ej denna text, och
marknadsorganets förslag rör plattformens egna CTA:er, inte
värdepappersrekommendationer.
