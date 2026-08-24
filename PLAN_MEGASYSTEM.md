# MEGASYSTEM-PLAN — autonomt organ-ekosystem (styrelsens beslut 2026-08-25)

> Mandat från grundaren: organsystem som samarbetar (makro↔mikro), självoptimerar,
> söker marknadsoptimering, behåller kunder, samlar kundförståelse (med cache),
> policy-sidor, tusentals smarta system som pratar själva → blogga, sälja, automatisera.
> Styrelsens arkitekturbeslut nedan — fasat, bounded, ärligt.

## Arkitektur: Organspar VH 2.0 ("tusen system" = skalbar spärr)

```
MARKRO-ORGAN (styrelsen)  ←→  MIKRO-ORGAN (per domän)
        │  OrganBus (bounded meddelanden i system_events)  │
        ├─ MARKNAD (SEO/traffik/konvertering)              ├─ Kurs-organ
        ├─ RETENTION (kvarhållning/engagemang)             ├─ Analys-organ (motor)
        ├─ DATA/CDO (källor, kundcache)                    ├─ Portfölj-organ
        ├─ PRODUKT (admin/UX, world-class)                 └─ Blogg-organ
        └─ INTÄKT (Fas 2-flöde, automatisering)
```

**Principer (lärd av 17,7M-kollapsen):**
1. ALL kommunikation via OrganBus = system_events, type=organ_msg, KAPAT av
   retention-organet (500 rader / 30 dagar) — tusen organ kan aldrig svämma över
2. Varje organ: tillståndslöst, deterministiskt, rapporterar MÄTTA värden
3. Makro-organet orkestrerar: frågar mikro-organ → beslutar → delegerar → loggar
4. Självoptimering = mät → jämför mot mål → föreslå → (grundaren godkänner stora,
   små körs) — ALDRY blind automation av penningflöden

## Kadens (ärlighet om begränsningar)
- Hobby-plan: cron max 1×/dag per jobb → koordineringsrunda DAGLIG 03:00 +
  TRIGGBAR on-demand (/api/organ/runda) + vid varje deploy
- "10x var 2:a timme" uppnås som ARKITEKTURMÅL: varje runda måste visa minst en
  förbättringsförslag med mätt effekt; Pro-plan låser */2-cron (dokumenterat)
- Självmätning: varje runda loggar före/efter på KPI:er → 10x-trend syns i admin

## Faser
- F1 (nu): OrganBus + koordineringsrunda (makro↔mikro), policy-sidor, retention-
  signaler i analytics — SE worklog Task 87
- F2: mikro-organ per domän implementeras (kurs-, analys-, blogg-organ rapporterar
  konkreta mätetal; delegations-kö till byggagent)
- F3: kundcache (intressaprofil per session, Redis-fri: bounded Supabase-tabell
  + 90d), marketing-AB (rubrikrotation på blogg med mätt CTR-proxy)
- F4: intäktsautomation (Fas 2-flödet: ansökan→möte→mail), blogg-cadence-organ
- F5: "tusen system": organtyp-register där nya mikro-organ INSTANSIERAS per
  (domän × mål) — antalet växer med behov, varje instans bounded

## Policy (F1)
- /finansiell-policy: pedagogisk-analys-deklaration, anti-casino, teoriers status,
  reproducerbarhetslöfte, ansvar
- /privacy-policy uppdateras: cache/kundförståelse redovisas öppet (anonym session,
  90 dagar, export/radering)
