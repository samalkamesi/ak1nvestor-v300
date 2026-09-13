# ORGANISM-KITET (våg 123 D3, Ω-organet) — Fas C:s grund

**Syfte (kundens vision):** "ett fullt automatiserat system som bygger
sidor från a till ö, hyrbart för alla." Detta dokument definierar
organism-stackens gränssnitt så att en hyresgäst blir KONFIGURATION —
inte ett nybygge.

## Komponenter och deras kontrakt

| Komponent | Fil | Kontrakt |
|---|---|---|
| **Pumpor-daemon** | verktyg/pumpor-daemon.mjs | pm2-process `ak1a-pumpor`; schemalägger allt; spawnar skript (kraschtåligt); pm2 supervisor |
| **Målhjärta** | verktyg/mal-hjartslag.mjs | var 10:e min: väcker sovande mål; SJÄLVHEALNING kilad turn (2 studs → pm2-omstart + mål återställs, max 1/2h); återställer borttappat mål |
| **Styrelserond** | verktyg/styrelse-rond.mjs | var 3:e h: bygg-lägesvakt → mål-återaktivering → organ-evolution → statusmatning → HÅRT leveransprotokoll (commit ELLER blocker) |
| **Organ-fabrik** | verktyg/organ-fabrik.mjs | fitness = landade commits (tagg [organ:X]); död efter 2 tomma ronder; födslar A-Ö med mutationer (v1 deterministiska, v2 LLM ur organ-mutationer.json); mekaniskt beslutsminne; kostnadsdeltan |
| **Gränssnittsvakt** | verktyg/granssnittsvakt.mjs | var 6:e h: publikt + INLOGGAT (admin+studio) svep; WCAG/överflöd/utanför i DOM; 0 fynd = grönt; larmar agenten |
| **Prod-synk** | verktyg/prod-synk.mjs | var 10:e min: GitHub origin → auto-deploy med stoppregler (flock/revert/good-HEAD); versionsloggen |
| **Hälsoprov** | verktyg/organism-halsa.mjs | alla självläkningsvägar mekaniskt: RAD = rondens topprioritet |
| **Data-hygien** | verktyg/data-hygien.mjs | söndagar: gc, retention, arkiv av registret |
| **Registret** | data/vakten/organ-registret.json | evolutionens sanning (runtime, deploy-säkert) |
| **Minnet** | data/vakten/{beslutsminne,kostnad-log,versionsloggen} | långtidsminne + telemetri (runtime) |
| **Konstitutionen** | data/forskning/STYRELSE-REGELVERK.md | §§ beslutsrätt, R2-vetorätt, parallell-doctrin |
| **Ytorna** | studio Organismen-panel + admin 🧬 | kundens fönster: rond, organ, ekonomi, landningar |

## Vid hyresgäst (Fas C) — vad som isoleras per kund

1. Egen katalog: `/home/<kund>/AK1` (eget repo, egen pm2-stack: `<kund>-pumpor`)
2. Eget registret + minnen (data/vakten/ per kund)
3. Egen subdomän + egen .env (egna nycklar — kundens Z.AI-konto)
4. Egen ekonomi-tak (tokens/dygn budget i hjärtat — F: framtida)
5. DELAT: verktygen (samma kit), forskningsdokumenten, federations-lärandet (framtida)

## Federationskrok (framtida, Fas D)

organ-mutationer.json per kund kan exportera ANONYMA framgångs-uppdrag till
en gemensam pool — populationen lär över tenants (forskningsunderlag § 3).
