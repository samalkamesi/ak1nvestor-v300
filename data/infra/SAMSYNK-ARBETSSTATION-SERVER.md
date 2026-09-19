# SAMSYNK ARBETSSTATION ↔ SERVER — en organism, två händer

> Skapat av arbetsstationen 2026-09-19 (kundorder: "om jag nyttjar gamla eller
> nya [datorn] båda sammansynkar och jobbar ihop för att bygga samma slutprocess
> och ai-organism"). Protokollet är BEVISAT våg 189 (rond 98).

## PRINCIPEN

- **Organismen lever på servern** (agent, fabrik, pumpor, tråd, minne) — den är
  EN. Ingen dator äger den; varje dator är en hand som bygger och styr.
- **Koden är EN repo** med sanningen i serverns develop-gren. Arbetsstationen
  håller samma träd via delta-bundles (tills SSH-nyckeln finns på plats — då
  blir kanalen vanlig git fetch/push mot prod-remoten).
- **Tråden är EN** — lab.ak1nvestor.com/studio från valfri maskin, och
  arbetsstationens ordrar via POST /api/studio/stream landar i SAMMA tråd
  (bevis: våg 189 ordern + rond 98-bokföringen).

## KANALER (i prioritetsordning)

| Riktning | Kanal | Villkor |
|---|---|---|
| server → station | `git bundle create uploads/ak1-delta-<datum>.bundle <bas>..develop` på servern; stationen laddar ner via GET /api/studio/filer?sokvag=uploads/…&nedladdning=1 och kör `git fetch <bundle> develop` | fil ≤ 30 MB (annars delas i committ-intervall) |
| station → server | POST /api/studio/filer {sokvag, innehall} (textfiler ≤ 200 kB; clobber-vakta med GET först!) + order i tråden | serverns tsc-grind + sviter äger commit/deploy |
| station → server (framtid) | `git push prod develop` med SSH-nyckeln C:\Users\Public\ak1a-contabo-key | nyckeln kopierad från gamla datorn |
| GitHub-spegling | push origin (github.com/NewUserAK/AK1) | kräver arbetsstationens GitHub-inloggning (väntar kund) |

## ARBETSSTATIONENS FÖRBEREDELSER (klara 2026-09-19)

Node 24 + git via winget · npm ci grönt (allowScripts för sharp/@swc/core/
@parcel/watcher m.fl. i package.json — arbetsstationskonfig) · `npm run build`
grönt lokalt · tsc 0 · localhost:3000 speglar samma kodbas.

## BEVISARKIV

- Våg 189 (10 förhandsfrågor marknadsmekanik): författat + 40/40 svit på
  stationen → filkanalen → serverns kedjesvit 193/193 → ROND 98 [Φ] LEVERERAD.
- Driftfynd: /api/studio/tjanster/kommando avvisar sendText (issuedAt sträng ≠
  tal, proto.invalidPayload) — rollback-vägen stream-post är den bevisade
  orderkanalen tills kurad.

## SKYDD (oföränderliga)

R2-ytor (priser, domän, nycklar, juridik, radering) beslutas ALDRIG autonomt —
 på ingen maskin. Filkanalen skriver ALDRIG .env*/pem/key (rutten nekar).
Clobber-vakt: alltid GET aktuell fil FÖRE POST-skrivning av befintlig fil.