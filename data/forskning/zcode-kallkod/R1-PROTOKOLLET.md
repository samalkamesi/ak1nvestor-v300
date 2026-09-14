# R1 — PROTOKOLLET: den kompletta officiella metodytan (ur zcode.cjs-runtime)

Expedition R1, våg 152. Källa: `grep` i den installerade officiella runtimen
(vendor/zcode.cjs, ZCode Desktop 3.11.2) + vår transport (studio-transport.ts).
TODO i tabellen = studio saknar metoden idag.

## session/* (19)
| Metod | Studio | Notering |
|---|---|---|
| session/create | ✅ | persistence:"immediate" bevisat |
| session/resume | ✅ | -32031-beteende kartlagt |
| session/close | ✅ | stangd-flagga bevaras |
| session/list | ✅ | |
| session/read | ✅ | kontext-projektionen |
| session/messages | ✅ | limit 60, senaste 40 |
| session/events | ✅ | v97 E2 replay |
| session/send | ✅ | prompt-kön v142 vid -32010 |
| session/stop | ✅ | pausar mål + avbryter turn |
| session/setMode | ✅ | 4 lägen: build/edit/yolo/plan (studio UI har 2!) |
| session/setModel | ✅ | |
| session/setThoughtLevel | ✅ | tanke max i kontextraden |
| session/goal | ✅ | autonom loop (v85+) |
| session/compact | ✅ | komprimera-knappen |
| **session/fork** | ❌ TODO | FORKA SESSIONER — rewind-fork-knapparna bör verifieras mot denna |
| **session/subagents** | ❌ TODO | LISTA LEVANDE SUBAGENTER — organism-panelens barn! |
| **session/cancelBackgroundTask** | ❌ TODO | avbryta bakgrundsjobb (BAKGRUNDSJOBB-panelen!) |
| **session/updateRuntimeModelConfig** | ❌ TODO | |
| **session/requestRuntimePreferences** | ❌ TODO | |
| session/usage | ✅ | |

## workspace/* (10)
| Metod | Studio | Notering |
|---|---|---|
| workspace/readState | ✅ | |
| **workspace/generateText** | ❌ TODO | TEXTGENERERING UTAN SESSION — AI-Mentorn utan agent-overhead! |
| **workspace/cancelGenerateText** | ❌ TODO | |
| **workspace/setDefaultMode** | ❌ TODO | persistenta defaults |
| **workspace/setDefaultModel** | ❌ TODO | |
| **workspace/setDefaultThoughtLevel** | ❌ TODO | |
| **workspace/updateInteractionPreferences** | ❌ TODO | |
| **workspace/updateModelIoPreferences** | ❌ TODO | |
| **workspace/updateProviderRegistry** | ❌ TODO | provider-hantering |
| **workspace/upsertModelProvider / removeModelProvider** | ❌ TODO | |

## interaction/* (6)
| Metod | Studio | Notering |
|---|---|---|
| interaction/requestPermission | ✅ | auto-policyn v94B |
| interaction/requestUserInput | ✅ | fråga-dialoger |
| interaction/browserExecute | ✅ | (grund) |
| **interaction/browserList** | ❌ TODO | LISTA WEBBLÄSARE — webbläsarpanelens första halva! |
| **interaction/requestProviderRuntimeHeaders** | ❌ TODO | |
| **interaction/requestOfficialMcpAuthHeaders** | ❌ TODO | |

## automation/* (5)
| Metod | Studio | Notering |
|---|---|---|
| automation/create | ✅ | |
| automation/list | ✅ | |
| automation/update | ✅ | |
| automation/delete | ✅ (transport) | UI-panel saknas (V91-gap kvarstår) |
| **automation/checkTaskBinding** | ❌ TODO | |

## Övrigt
- usage/stats ✅ · mcp/list ✅ · plugins/setEnabled ✅
- v4/attachment/commit|abort ✅ (bildbilagor) + v4-events (command, command_fact, fork_start_failure — fork-felfall!)
- FALSKA POSITIVA: model/stl, model/obj m.fl. = 3D-filformat (Three.js), INTE protokoll.

## Topp 5 högst värda saknade (implementationsordning föreslås)
1. **session/subagents** → Organismen-panelen visar LEVANDE barnprocesser i realtid.
2. **interaction/browserList** → webbläsarpanel komplett (browserExecute finns).
3. **workspace/generateText + cancel** → AI-Mentorn 2.0 utan sessionskostnad (billig, snabb).
4. **session/cancelBackgroundTask** → BAKGRUNDSJOBB-panelen får Avbryt-knapp.
5. **session/fork** → verifiera rewind-forkarna mot officiell metod (om rewinden emulerar — byt till äkta fork).

## Källa till metodnamnens sanning
Launcher-källan (app-server-client.ts) är en GENERISK JSON-RPC-klient — metoder
bärs som strängar och lever ENDAST i runtimen. Extraktion: grep på "prefix/namn"
i vendor/zcode.cjs. Omfattningen ovan = alla träffar utom 3D-formatens falska
positiver; komplettering kan krävas för prefix utanför listan.
