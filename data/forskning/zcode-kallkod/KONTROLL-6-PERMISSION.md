# KONTROLL 6 — Serialiserade permission-dialoger (z code 3.11.2-24)

Datum: 2026-09-11
Kontrollant: kontrollagent (AK1A)
Källkod: `/home/ak1a/forskning/zcode-cli/packages/zcode-tui/src/permission-request-queue.ts` (14 rader, hela filen) + anropsplats `index.ts:3269-3277, 662`
Studio: `src/components/ak1a/studio-chat.tsx` + `src/lib/studio/studio-transport.ts` + `src/app/api/studio/interaktion/route.ts` (endast läsning)

## DOM: STÄMD (paritet)

Gap-registerpost 6:s påstådda saknad stämmer inte — studion HAR serialiserade
permission-dialoger med kö, tidsgräns och avvisningsväg. Posten kan avskrivas.

## Källan (z code)

`PermissionRequestQueue` är en promise-kedja: `run()` kedjar varje request på
`tail` och flyttar fram `tail` OAVSETT utfall (`result.then(() => undefined,
() => undefined)`) — strikt FIFO (dialog 2 startar inte förrän dialog 1 är
helt löst), dialoger överlappar aldrig, fel förgiftar inte kön. Ingen
djupbegränsning och ingen timeout i kön; avbrott sker via AbortSignal på
anropsplatsen (`requestPermission`, index.ts:3271-3274). ALLA
permission-/fråge-/plan-godkännanden går genom kön (index.ts:662, 3278).

## Jämförelse per kontrollpunkt

| Kontrollpunkt | z code | Studio | Dom |
|---|---|---|---|
| En i taget (serialisering) | Promise-kedja, aldrig överlappande | Single-slot-state `permission`/`fraga` (studio-chat.tsx:3785-3786) + serverregister — ett dialogkort i taget | Paritet |
| Köordning | Strikt FIFO i klienten | FIFO på SERVERN: Map-register "i ankomstordning" (studio-transport.ts:1500, 3261, 5626; `vantaInteraktioner` 5679-5681 bevarar ordning till klienten) | Paritet i arkitekturen; se kantonavvikelse nedan |
| Ködjup-begränsning | Ingen | Ingen (obegränsat Map) | Paritet |
| Timeout | Saknas i kön (AbortSignal som avbrottsväg) | 30 s server-default: permission → `{decision:"escalate"}`, fråga → cancelled (studio-transport.ts:5566, 5623-5625) + 60 s UI-varning med Avvisa-knapp (studio-chat.tsx:830-878) + interaktionsKlar-toast vid eskalering (7656-7658) | Studio ÖVERTRÄFFAR källan |
| Avvisningsväg | Fel isolerade (poison-skydd) | deny via UI, Avvisa-knapp → POST, auto-policy allow/deny-snabbventil (5509-5523), 409 "redan besvarad" (route.ts:84-85, transport 5687-5690), session-kassering → deny/cancelled för ALLA väntande (5665-5677) | Paritet |
| Felisolering | tail flyttas fram vid fel | `besvaraInteraktion` idempotent (besvarad-vakt + delete + clearTimeout, 5638-5642); nätverksfel i klient → toast, tråden låser ej (studio-chat.tsx:4564-4566) | Paritet |

Tilläggsfunktioner i studion utan motstycke i kön: re-announce av samma
requestId utan ny 30 s-räknare (5609-5613), poll-återställning av dialogkort
efter död SSE (studio-chat.tsx:5232-5252), minnesregler/auto-godkännande
(4610-4628) och mock-väg med samma 30 s-default (8235-8262).

## Noterad kantonavikkelser (ej låsande, ingen dataförlust)

Klienten saknar explicit kö vid N>1 samtidigt väntande dialoger (multi-tabb
eller samtidiga requests — exakt det TUI-kön skyddar mot):

1. `mottagenPermission` (studio-chat.tsx:4629) skriver okompenserat över en
   pågående, obesvarad dialog när en ny request anländer (SSE-event 7629 eller
   full-sync-loop 4821-4836). Den överskrivna ligger kvar i serverregistret och
   återkommer via poll-restaureringen (5242, find-first) eller löses av 30
   s-defaulten — ingen förlust, ingen låsning.
2. Urvalskonflikt: full-sync-loopen (4821-4836) låter SISTA väntande permission
   vinna setPermission, medan poll-restaureringen (5240) plockar FÖRSTA — vid
   2+ väntande kan visad dialog skilja sig mellan vägarna.
3. Efter besvarat kort visas nästa väntande först vid nästa tunga poll
   (puls/15-30 s) — ingen omedelbar "advance to next".

### Frivillig fix-skiss (strikt klient-FIFO, om kantonavvikelsen vill bort)

1. studio-chat.tsx:4629 — `setPermission((nu) => nu && nu.requestId !== p.requestId ? nu : { ...p, sedan: Date.now() });` (pågående dialog stannar; ny request köas i registret)
2. studio-chat.tsx:4821-4836 — ersätt loopen med samma `find`-urval som rad 5240 (endast äldsta permission + äldsta fråga)
3. studio-chat.tsx:4558 — efter `setPermission(null)`: `void korTungPoll();` så nästa väntande dialog syns omedelbart

## Slutsats

z code 3.11.2-24:s serialiseringsgarantier (en i taget, FIFO, felisolering) är
reproducerade i studion via single-slot-UI + serverns FIFO-register, med
tidsgräns (30 s escalate/cancelled + 60 s varning) och avvisningsvägar som är
starkare än källans. Enda avvikelsen är valfri urvals-/överskrivningsordning i
klienten vid flera samtidigt väntande dialoger — ett kantfall utan låsning
eller förlost tillstånd, med fix-skiss ovan.

STÄMD — studion har serialiserade permission-dialoger med FIFO-register, 30 s-timeout och avvisningsväg; post 6 kan avskrivas (kantonavvikelse i klient-urval vid multi-pending noterad med fix-skiss).
