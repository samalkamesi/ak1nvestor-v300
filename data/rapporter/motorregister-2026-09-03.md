# Motorregistret 2026-09-03

**Våg 49 · Agent 1** — fullständig karta över sajtens egna intelligenser (deterministiska motorer) och var de används respektive saknas. Källdata: `data/motorregister.json`.

**Kunddirektivet som utgångspunkt:** alla system ska nyttja sina egna intelligenser i hela hemsidan, autonomt, helst utan AI. Registret visar var den egna intelligensen faktiskt driver innehåll — och var den står oanvänd.

## Summering

| Nyckeltal | Värde |
|---|---|
| Identifierade motorer | **42** |
| Testade i `verktyg/validera-motorer.mjs` | **4** (analys, vagfundament, netnet, konfluens\*) |
| Testade i något verktyg totalt | **10** |
| **Helt utan test** | **32** |
| Autonomi via **cron** (vercel.json) | 8 |
| Autonomi via **klient-puls** (setInterval/useEffect) | 3 |
| Autonomi via **organ-event** | 3 |
| **Ingen autonomi-kanal alls** | **28** |
| Motorer utan enda produktionsyta | **7** (hela AKM2-stacken, fundamental-vagmotor, dynamic-catalog, eko-koppling) |

\* Konfluens kontrolleras endast villkorligt (om fält finns i svaret) — partiell täckning.

## A. Servermotorer (analys och data)

| Motor | Fil | Görs i en rad | Monterad på | Autonomi | Test |
|---|---|---|---|---|---|
| analys-motorn | `src/lib/analys-motor.ts` | 5×5×4 teknisk analys per aktie: vågklass, momentum, fib, fundamentproxy | cron-datacache, cron-portfolj-uppfoljning, /api/dagens-pass, /api/member/portfolio/djupanalys (+ indirekt konfluens, portfolj-vagor) | cron | validera-motorer |
| vagfundament-motorn | `src/lib/vagfundament-motor.ts` | 20×5 fundamental vågmatris per aktie ur egna tidsserier | cron-vagscan, cron-datacache, /api/vagfundament, /api/vagkon, /api/pro/analys, vagkarta-kort | cron | validera-motorer |
| konfluens-motorn | `src/lib/konfluens-motor.ts` | fem dimensioner → deterministisk konfluenspoäng 0–100 | /api/konfluens, /api/pro/analys, cron-datacache, konfluens-tabell (/konfluens, /pro), csv-import | cron | partiellt |
| netnet-motorn | `src/lib/netnet-motor.ts` | Grahams net-net: kurs mot NCAV med 2/3-tröskel | /api/netnet, cron-datacache, netnet-skanner (/netnet) | cron | validera-motorer |
| vagkon | `src/lib/vagkon.ts` | deterministisk fan chart, percentilband ∝ √t | /api/vagkon, vagkon-graf (/konfluens, /vagfundament) | ingen | nej |
| portfolj-vagor | `src/lib/portfolj-vagor.ts` | portföljens viktade vågprofil per horisont | ENDAST komponent portfolj-vagprofil — som är **oanvänd**; speglad logik i /api/member/portfolio/djupanalys | ingen | nej |
| superanalys | `src/lib/superanalys.ts` | 24 steg, V01–V20 0–5p, kategoriviktning → max 100 | /superanalys, /rapporter, /fas3, /nyheter, fas3-cert, rapportbyggare, analysbank | ingen | nej |
| analysbank | `src/lib/analysbank.ts` | elevens samlade verk som gemensam råvara | rapportbyggare (/rapporter, /pro) | ingen | nej |
| nyhets-motorn | `src/lib/nyhets-motor.ts` | hämtning + ranking + påverkanspoäng + AK1A-not | /api/nyheter, /api/nyheter/scan (cron 08:00), nyhets-central | cron | nej |
| datacache | `src/lib/datacache.ts` | lasEllerHamta: egen databas före nätverket | cron-datacache + /api/dagens-pass, /api/netnet, /api/notiser, /api/vagfundament | cron | nej |
| signal-bus | `src/lib/signal-bus.ts` | organens gemensamma signalström (event-carried) | skrivs i 6 rutter; läses av /api/signal (enda konsument: prenumerationsaktivering) | organ | nej |
| organ-event | `src/lib/organ-event.ts` | nervsystemets enhetliga händelsekonvention | skrivs i 7 rutter; konsumeras av /api/kropp → kroppsvy (Min Sida) + admin | organ | nej |
| autonom/organ | `src/lib/autonom/organ.ts` | bounded daglig hälsorond (kill-switch, 500-tak) | cron-autonom (00:00), /api/autonom/status, /api/organ/runda, /api/styrelse/beslut | cron | nej |
| autonom/organ-bus | `src/lib/autonom/organ-bus.ts` | styrelsens orkestrering av mikro-organ via meddelanden | /api/organ/runda | organ | nej |
| autonom/styrelse | `src/lib/autonom/styrelse.ts` | autonom beslutsmotor för utvecklingsprioritering | /api/styrelse/beslut | ingen | nej |
| **akm2-kärnan** | `src/lib/akm2/karna.ts` | raknaAKM1 + AKM2-syntes med projektionsinvarianten | **INGEN** — bara verktyg/testa-akm2-karna | ingen | eget verktyg |
| **akm2-dynamik** | `src/lib/akm2/dynamik.ts` | vågor → Φ-justering per variabel (lager 3) | **INGEN** | ingen | eget verktyg |
| **akm2-moduler** | `src/lib/akm2/moduler/*` | branschstyrda V21–V29 (lager 2) | **INGEN** | ingen | eget verktyg |
| **akm2-vikter** | `src/lib/akm2/vikter.ts` | namngivna viktsamlingar (lager 4) | **INGEN** | ingen | indirekt |
| **riskportfolj** | `src/lib/portfolj-forskning/riskportfolj.ts` | risknivå + tillväxttakt → deterministisk portfölj | /api/portfolj-forskning, bygg-portfolj-kort, riskval-panel | ingen | eget verktyg |
| **fundamental-vagmotor** | `src/lib/portfolj-forskning/fundamental-vagmotor.ts` | FVag: AKM1-variabler som vågor med trippelkontroll | **INGEN** i produktion (endast verktyg kor-fvag/test + inaktiverad AKM2-kedja) | ingen | eget verktyg |
| **uppfoljning** | `src/lib/portfolj-forskning/uppfoljning.ts` | månatlig då-vs-nu med max tre notistexter | cron-portfolj-uppfoljning (1:a mån 07:00) → publiceraSignal | cron | eget verktyg |

## B. Klientmotorer (elevens upplevelse)

| Motor | Fil | Görs i en rad | Monterad på | Autonomi | Test |
|---|---|---|---|---|---|
| kurstips | `src/lib/kurstips.ts` | rätt kurs ur spåret + balans + BOKMASTER + tid | /kurser (+ assistent, briefing, klientkontext) | ingen | nej |
| veckoplan | `src/lib/veckoplan.ts` | veckosignatur-hash + lokaldata → studieschema | Min Sida | ingen | nej |
| dashfraga | `src/lib/dashfraga.ts` | deterministisk intent-matchning mot egna data | Min Sida (dashfraga-kort) | ingen | nej |
| briefing | `src/lib/briefing.ts` | morgonkort: nivå, streak, tips, planrad | Min Sida + kunskaps-flode | ingen | nej |
| assistent | `src/lib/assistent.ts` | prediktiva förslag + hälsning + frustration + studietid | Min Sida (assistent-panel) | ingen | nej |
| omtanke-motor | `src/lib/omtanke-motor.ts` | härleder tillstånd, agerar före frågan, max 1/24h | vagvisare (startportal + Min Sida), notiser | **puls** | nej |
| notiser | `src/lib/notiser.ts` | automatnotiser, max en per typ per dag | notis-center → layout (**globalt**) | **puls** | nej |
| spaced-repetition | `src/lib/spaced-repetition.ts` | SM-2/Ebbinghaus-schemaläggning av 100 kort | chat-widget, /dagens-pass, Min Sida | ingen | nej |
| badges | `src/lib/badges.ts` | händelsestyrt meritsystem i fem kategorier | /badges, chat-widget, dagens-pass, kurs-steg, Min Sida | ingen | nej |
| elevkarna | `src/lib/elevkarna.ts` | elevens varför: mål, horisont, intressen, tid | Min Sida (formulär), klientkontext | ingen | nej |
| klientkontext | `src/lib/klientkontext.ts` | EN samlad bild av eleven (EN källa, EN sanning) | assistent-panel (enda konsumenten) | ingen | nej |
| tracer | `src/lib/tracer.ts` | passiv beteendemönsterigenkänning → insikter | tracer-mount → layout (**global puls**), Min Sida, /api/eko, /api/admin/betende | **puls** | nej |
| navigationsminne | `src/lib/navigationsminne.ts` | var eleven var → nästa steg | fortsatt-panel (/kurser, /min-portfolj), huvudmeny, kommandopalett m.fl. | ingen | nej |
| chatbot-nlu | `src/lib/chatbot-nlu.ts` | deterministisk NLU → ämnesregister | /api/chatbot | ingen | nej |
| chat-minne | `src/lib/chat-minne.ts` | konversationsminne (60 turer, 12 som historik) | chat-widget | ingen | nej |
| **eko-koppling** | `src/lib/eko-koppling.ts` | väver samman ALLA system till insikter (R1–R5) | /api/eko — **noll komponentkonsumenter** | ingen | nej |
| shortseller-bank | `src/lib/shortseller-bank.ts` | 30 kontextuella attackfrågor + räknefall + progression | /api/shortseller + short-seller → layout (**globalt**) | ingen | nej |
| pedagogik | `src/lib/pedagogik.ts` | den gemensamma rösten (principer) | 4 komponenter (assistent, kognitiv-profiler, short-seller, social-proof) | ingen | nej |
| sokindex | `src/lib/sokindex.ts` | kommandopalettens sökbara index | kommandopalett → layout (**globalt**) | ingen | nej |
| dynamic-catalog | `src/lib/ak1a/dynamic-catalog.ts` | deterministisk kurskatalogsgenerator (2 896 rader) | **INGEN** — cron/expand-courses kör egen fil-logik | ingen | nej |

## C. Infrastruktur (ej motorer)

`utils`, `content`, `seo`, `siffror`, `ak1a-store`, `db/supabase/supabase-rest/data-access`, `member-local`, `kurs-access`, `prenumeration`, `email-mallar` (gränsfall), `nyhetskanaler` (gränsfall — speglar nyhets-motorn), `ekosystem` (konfigauktoritet), `zai` (extern AI-brygga), `ak1a/`-datafiler, `portfolj-forskning/typer + korstabell-data`, `akm2/typer`.

## Autonomi-kanalerna i siffror

- **Cron (vercel.json, 9 st):** autonom 00:00 · vagscan 05:00 · seo-refresh 03:00 · datacache 06:00 · kvalitet 07:00 · email 06:30 · expand-courses 12:00 · nyheter/scan 08:00 · portfolj-uppfoljning månadens 1:a 07:00.
- **Klient-puls:** tracer-mount (hjärtat), vagvisare (omtanke-intervallet), notis-center (mount), kroppsvy-kort (60 s poll av /api/kropp), social-proof.
- **Organ-event:** skrivs i 7 rutter, konsumeras av /api/kropp → kroppsvy (endast Min Sida) + admin/ekosystem-panel.
- **28 motorer har ingen kanal alls** — de körs endast när en vy råkar renderas (eller aldrig).

## Topp-10 integrationsgap (sorterat efter kundnytta)

1. **AKM2-stacken (kärna + dynamik + moduler + vikter) är helt omonterad.** Byggd, forskningsunderbyggd, testad i egna verktyg — men ingen route eller komponent beräknar AKM2. Nästa generations analysmotor driver inte en enda pixel på sajten.
2. **eko-kopplingen når ingen vy.** /api/eko har noll komponentkonsumenter (grep-verifierat). Detta är motorregistrets tydligaste brott mot kunddirektivet "alla system DELAR sin kunskap och reagerar på varandra".
3. **signal-bus → notiser saknas.** Sex rutter publicerar signaler (vågkarta, konfluens, kvalitet, portföljuppföljning, nyheter) men NotisCenter/Min Sida läser aldrig /api/signal — hela den autonoma strömmen slutar i en prenumerationspanel.
4. **fundamental-vagmotorn driver ingen produktionyta.** FVagAnalys körs bara via verktyg; /portfolj-forskning bygger på statisk korstabell-fil i stället för live-analys.
5. **portfolj-vagprofil-komponenten oanvänd.** Motorn portfolj-vagor når eleven enbart som spegling i djupanalys-routen; den pedagogiska visualiseringen är dockad ingenstans (/min-portfolj är den naturliga platsen).
6. **nyhets-motorn förbipås på Min Sida.** aktie-nyheter-komponenten hämtar egna nyheter (Yahoo direkt) — eleven får orankat flöde utan påverkanspoäng och AK1A-not där; scan-cronen skriver dessutom inte "ak1a-nyheter-top" som notismotorn läser.
7. **kurstips bara på /kurser.** /laroplan, /bibliotek, /badges och startsidans kurser-section saknar motorn; nasta-steg på SEO-sidor duplicerar logiken.
8. **Min Sida-ghettot.** dashfraga, briefing, assistent, veckoplan, kroppsvy och insikter lever bara bakom inloggad Min Sida — startsidans portal, /dagens-pass och verktygssiderna får ingen av dem.
9. **/api/konfluens utan datacache + konfluens saknas på /topplista.** Dagligen cachad data hämtas ändå på nätet vid besök; konfluenspoängen syns inte där värdegolv + vågor vore den naturliga sammanfattningen.
10. **organ-bussen andas bara manuellt.** /api/organ/runda ligger i ingen cron och /api/autonom/status har inget UI — styrelsen togs dessutom bort från publik yta 2026-09-02.

## Topp-5 rekommendationer för main-agenten (fixa direkt)

1. **Montera eko-kopplingen** — hämta `/api/eko` i assistent-panelen (Min Sida) och/eller admin/ekosystem-panelen. Motorn är färdig; en fetch + render återaktiverar kundens kärndirektiv.
2. **Koppla signal-bus → notis-center** — låt `genereraAutomatiskaNotiser` (eller notis-centerns useEffect) hämta `/api/signal` och fästa dagens högsta signal som notistyp "signal". Detta öppnar också uppföljningsmotorns (gap 3 i register) och netnet-signalernas väg till eleven.
3. **Montera portfolj-vagprofil på /min-portfolj** — komponenten finns, motorn är speglad i djupanalys-routen; en import ger portföljens vågmatris sin pedagogiska yta.
4. **Dirigera Min Sidas aktie-nyheter via nyhets-motorn** — byt komponentens direkthämtning mot `/api/nyheter` (motorn har redan 30-min-cache via datacache) så ranking, påverkanspoäng och AK1A-not når hela sajten.
5. **kurstips på /laroplan + startsidans kurser-section** — motorn är ren klientlogik; återanvänd kurstips-kortet i stället för nasta-steg-dubbletten på SEO-ytorna.

**Bonus (större lyft, planera hellre än fika):** montera AKM2 bakom flagga i `/api/pro/analys` (projektionsinvarianten gör risken nästan noll — neutrala defaults ger exakt AKM1) och låt fundamental-vagmotorn mata /portfolj-forskning live.

## Metod & reproducerbarhet

- Genomgång av alla `src/lib/*.ts` (exkl. infrastruktur enligt uppdrag), `src/lib/akm2/`, `src/lib/portfolj-forskning/`, `src/lib/autonom/`.
- Montering: grep av importer i `src/app/**` + `src/components/**` + `src/hooks/**`, följt av spårning page → section → komponent (t.ex. omtanke-motorn når startsidan via spa-hem → portal-section → client-portal → vagvisare).
- Autonomi: `vercel.json` crons + `setInterval/useEffect` i komponenter + organ-event/signal-bus-konsumenter.
- Test: `verktyg/validera-motorer.mjs` (primärt mått) + övriga `verktyg/testa-*.mjs`.
- Registret som maskinläsbar data: `data/motorregister.json`.
