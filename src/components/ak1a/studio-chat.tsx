"use client";

import * as React from "react";
import Link from "next/link";

import {
  ArrowDown,
  ArrowUp,
  Bell,
  BellRing,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleStop,
  Clock,
  Command,
  Diff,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FilePen,
  FileText,
  FileArchive,
  FileCode,
  FileImage,
  FolderSearch,
  FolderTree,
  FolderUp,
  Globe,
  History,
  Link2,
  ListChecks,
  Loader2,
  MessageCircleQuestion,
  Moon,
  MoreVertical,
  Paperclip,
  Pencil,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Shrink,
  SquarePen,
  Star,
  Sun,
  Target,
  Terminal,
  Trash2,
  UploadCloud,
  Wrench,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import { adminHeaders, adminJsonHeaders } from "@/lib/admin-klient";
import { STUDIO_KOMMANDON, kommandoHjalp, parsaKommando, type StudioKommando } from "@/lib/studio/kommandon";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { byggChatHtml } from "@/components/ak1a/studio-html-export";
import { StudioMinnePanel } from "@/components/ak1a/studio-minne-panel";
import { StudioAdminPanel } from "@/components/ak1a/studio-admin-panel";
import {
  StudioFardigheterPanel,
  type FardighetMcp,
  type FardighetPlugin,
  type FardighetSkill,
} from "@/components/ak1a/studio-fardigheter-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * STUDIO-CHAT — /studio:s webchat-mot-Y (VÅG 81 WEBCHAT-STUDIO,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 81", kunddirektiv "exceptionell design,
 * uppmana allt — bilder till mappar, exakt som Z, max kapacitet").
 *
 * DNA: paper-botten, marin rubrikrad med VarumarkesLogo, guld-accenter,
 * serif-rubriker. Meddelanden: användare marin vänster / agent paper höger
 * med guldkant. Markdown enligt bloggens egen tolkning (## rubriker,
 * listor, inline länk/fet/kursiv — utökad med ```-kodblock eftersom agenten
 * skriver kod). Mobil-först: sticky composer, kompakt marinrad.
 *
 * STRÖM: POST /api/studio/stream {prompt} → SSE-events (status/delta/
 * verktyg/klart/fel/kontext) läses med fetch+reader (EventSource kan ej
 * POST). UPLOADS: POST /api/studio/uppladdning multipart — drag-och-släpp
 * på hela ytan, paste-bild i skrivfältet, filknapp, mappknapp
 * (webkitdirectory → relativa sökvägar följer med → servern
 * rekonstruerar mappstrukturen). Klickbara chips infogar "Titta på
 * uploads/..." i prompten.
 *
 * VÅG 82 STUDIO V2 ("Z-portalen i molnet"): MODELLRULLISTA i headern
 * (GET/POST /api/studio/modeller — listan härledd ur zcode-config.json,
 * aldrig hårdkodad; byte = kassera + session/create MED model-param,
 * protokollväg bevisad i tool-results/v82-protokoll.md) + KONTEXTRAD
 * "📊 X tkn denna runda · ~Y totalt · Z % av taket" (klart-eventets
 * tokenCount + session/read-projektionen via kontext-SSE-eventet;
 * protokollets contextWindow = taket, 1M endast reserv) med
 * guld-varning ≥ 80 % + knappar "Ny session"/"Komprimera"
 * (session/compact är bevisat stött) + sessionslista (session/list).
 *
 * VÅG 83 MEGA B4 (STUDIO=Z — "Z-portaLens fysiska yta"): FILTRÄD över
 * agentens arbetsyta (GET /api/studio/filer — maxdjup 3, 500 noder,
 * node_modules/.next/.git/uploads exkludera) i höger drawer: klicka mapp
 * = öppna/stäng, klicka fil = förhandsgranskning (text/kod monospace
 * ≤ 20 kB, bilder som <img>, övrigt = nedladdningslänk) + uploads-sektion
 * med datum och "Töm uploads" (DELETE /api/studio/filer). BILDER I
 * CHATTEN: hänvisar ett användarmeddelande till en uppladdad bild
 * ("uploads/<datum>/<namn>.png" — sökvägen finns i uploads/) visas
 * miniatyrer direkt i bubblan via &bild=1 (säker serving, admin-cookie).
 * SNABBKOMMANDON: rad som börjar med "/" parsas LOKALT före sändning
 * (src/lib/studio/kommandon.ts) — /help /ny /modell <id> /komprimera
 * /filer; API-vägarna anropar bryggan, resten är lokal hjälp.
 *
 * VÅG 83 MEGA B1 (STUDIO=Z — Z-portalens kärna): KOMPLETT STREAMING-
 * VISUALISERING. Varje verktygskall = EXPANDBART KORT i chattflödet
 * (SSE-typ "verktyg_kort" ur tool.updated: "▶ Bash: ls uploads/" → klicka
 * ut för argument+resultat i monospace; ikon per verktyg; spinner medan
 * verktyget kör (korts steg planerad/startar/kör); fel RÖTT). LIVE-INPUT
 * ("verktyg_input" ur model.streaming tool_input_delta) visar agentens
 * argument MEDAN de skrivs ("läser fil X…"). Rundstatistik ("runda" ur
 * turn.started/completed: varaktighet + resultatTyp + verktygsantal) i
 * bubblans fot. DIFF: "ändringar" (SSE efter klart + GET /api/studio/
 * andringar) renderar "Ändringar"-panelen per turn — +N GRÖNT / −N RÖTT
 * per fil, klicka ut filen för rad-diff (Write → +N rader, Edit → exakt
 * −N/+N ur old_string/new_string; v4/conversation/fileChanges = dokumenterad
 * uppgraderingsväg i studio-transport.ts).
 *
 * VÅG 83 MEGA B2 (STUDIO=Z — Z-portaLens GODKÄNANDEFLÖDE): PERMISSION-
 * DIALOG i chattflödet (SSE-typ "interaktion" ur protokollets server→
 * klient-request interaction/requestPermission): marin kort med verktygs-
 * namn + risk-badge + argument-summary + knapparna ur eventets options —
 * Tillåt en gång / Tillåt för projektet / Neka (allow_project ⇒ protokoll-
 * svaret permissionUpdates addRules). Svaret går via POST /api/studio/
 * interaktion; "interaktionsKlar" stänger kortet (t.ex. eskalering när
 * inget svar kom inom 30 s — sessionen hänger aldrig). FRÅGEKORT (interaction/
 * requestUserInput): prompt + svarsalternativ-knappar (choices) ELLER
 * fritext + Svara/Avbryt. LÄGESVÄXLARE (session/setMode — build/plan) +
 * TANKESTYRKA (session/setThoughtLevel — nothink/high/max) som dropdowns
 * bredvid modellrullistan (POST /api/studio/session {action:"läge"|
 * "tankestyrka"}). E2E-AVGRÄNSNING: i build-läge auto-godkänner servern
 * låg/medel risk (protokollkartan §3) — dialogen visas när läget kräver
 * det (t.ex. plan); hela kedjan är körbar i dev via mockens simulerade
 * dialog.
 *
 * VÅG 84 STUDIO 100x block C (PERMISSION-UPPGRADERING):
 * (1) DIFF-FÖRHANDSVISNING — interaktion-eventets nya fält "diff" (beräknat
 * ur protokollets RÅA input i transportens diffUrInput: Write → +N, Edit →
 * exakt −N/+N ur old_string/new_string, MultiEdit → edits[]) renderas i
 * dialogen som FÄRGKODADE rader (gröna +/röda −, exakt som "Ändringar"-
 * panelen) INNAN användaren väljer; verktyg utan filargument visar
 * argument-summary som förr. (2) MINNESREGLER — localStorage
 * "ak1a-studio-regler": [{verktyg, omfattning:"alltid"}]; en matchande
 * permission besvaras automatiskt (allow_once) + notis i flödet
 * "auto-godkänd enligt din regel"; hanteringspanel (lista + ta bort) +
 * "Alltid tillåta <verktyg>"-knapp i dialogen. (3) NOTIS VID LÅNGA
 * KÖRNINGAR — turn > 60 s ⇒ Web Notification (om tillåtet; klockknappen
 * i verktygsraden begär rättigheten) + titelväxling "⏳ Agenten arbetar…";
 * vid klart ⇒ "✓ Klar (N tkn)". (4) RISKBADGE — verktygsklassning
 * (Bash/Write/Edit=orange "skrivande", Read/Glob/Grep=grön "läsande",
 * WebSearch/WebFetch=gul "nät", övriga neutralt) visas bredvid protokoll-
 * risk-badgen i dialogen.
 *
 * VÅG 84 STUDIO 100x BLOCK A (VISUELL Z-PARITET): TEMA-VÄXLARE — "dark"-klass
 * på studions ROTELEMENT (class-strategin: @custom-variant dark (&:is(.dark *))
 * + .dark-variablerna i globals.css ger marin natt + luminöst guld för hela
 * subträdet utan att html berörs) med localStorage-persistens ("studio-tema"),
 * knapp 🌙/☀️ i headern ELLER tangent T (ej i inmatningsfält). GENVÄGAR:
 * Enter=skicka + Skift+Enter=nyrad (befintligt, verifierat) samt Ctrl/Cmd+K =
 * KOMMANDOPALETT (sök bland /help /ny /modell /komprimera /filer + "Byt
 * modell X" + "Tema" — registret STUDIO_KOMMANDON är källan). AUTO-SCROLL:
 * flickerfri "vid botten"-spårning (onScroll + ref) — scrollar bara när
 * användaren är vid botten; annars flytande "↓ Nytt"-knapp (hoppa ner +
 * räknare av olästa). MEDDELANDESÖKNING: sökikon → fält i headern →
 * highlight av träffar (även i StudioMarkdown + kodblock), räknare "x/y" +
 * ↑/↓-pilnavigering (Enter nästa, Skift+Enter föregående, Esc stänger).
 * EXPORTCHATT: "⬇ Exportera" laddar ner hela chatten som markdown (datum i
 * filnamnet; agent-meddelanden som block, användare som blockcitat).
 * TOKENRÄKNARE (A6): kontextradens 📊-rad är nowrap — syns på mobil.
 *
 * VÅG 85 STUDIO V3 F2 (FÄRDIGHETER ⚡ — "vad agenten KAN"): knappen i
 * verktygsraden öppnar en drawer i filträdets stil (ytan i studio-
 * fardigheter-panel.tsx, state/fetch här — våg 84 D:s parallellmerge-
 * mönster) med TRE sektioner ur GET /api/studio/fardigheter: SKILLS
 * (skills/referenceCatalog — varje skill som kort med namn + beskrivning
 * + scope-badge), PLUGINS (plugins/list — aktiva med GRÖN PRICK +
 * version, tillgängliga grå under) och MCP-VERKTYG (mcp/list — anslutna
 * tjänster med verktygsantal, t.ex. android-emulator 23 verktyg; namn-
 * lista visas när protokollet bär den). Ömsesidig stängning mot filträdet
 * + Minne 🧠; /fardigheter-kommandot (lokalt) öppnar samma drawer.
 *
 * VÅG 85 STUDIO V3 F4+F5 (INLINE-KODVY — chattens diff-kort blir en FIL-
 * VY): klicka en fil i "Ändringar"-panelen → EXPANDERAD KODVY som läser
 * filen från disk via GET /api/studio/filer?sokvag=… (absolut agentsökväg
 * görs relativ mot arbetsytan) —
 *   · SYNTAXMARKERING (enkel tokenisering, kundspec-färger): nyckelord
 *     GULD, strängar GRÖN, kommentarer GRÅ, tal LILA (JS/TS/JSON/CSS;
 *     markdown: rubriker/fetstil guld, `kod`/länkar grönt);
 *   · DE ÄNDRADE RADERNA GULA (bg-yellow): exakta positioner ur v4-
 *     diffens patch-hunkar (transportens punkter, våg 85 F4 — filhuvudet
 *     i studio-transport.ts dokumenterar hela v4-flödet); utan punkter
 *     matchas diff-motorns +rader sekventiellt mot filen; rena
 *     borttagningar (newLines 0) visas som RÖDA spökrader;
 *   · max 200 rader ("… N rader till"), radnummer i gulmålat gutter;
 *   · REDIGERA (ENDAST plan-läge — kontext.läge/arbetsyta-info):
 *     textarea med koden → Spara → POST /api/studio/filer (inneslutnings-
 *     vaktad, endast textändelser, ≤ 200 kB) → notis "filen sparad —
 *     nästa agent-turn ser ändringen". Detta är kundens sätt att styra
 *     koden UTAN TERMINAL: editorn skriver rakt in i agentens workspace.
 *
 * VÅG 86 G1/G2 (STUDIO COMPLETE — SKRIVFÄLTETS MINNE): G1 SLASH-
 * AUTOCOMPLETE — "/" som första tecken öppnar en dropdown OVANFÖR
 * skrivfältet med ALLA matchande kommandon ur STUDIO_KOMMANDON (prefix på
 * namnet): syntax + beskrivning + kategoribadge (API/lokal); ↑↓ navigerar,
 * Enter infogar + KÖR kommandot, Tab kompletterar namnet (med argument-
 * plats), Esc stänger tills frasen ändras, mus över highlightar, klick
 * väljer; första mellanslaget (argumentet börjar) stänger listan. G2
 * PROMPTBIBLIOTEK ⭐ — knappen bredvid skicka sparar fältets text i
 * localStorage "ak1a-studio-prompter" [{text, skapad}] (tomt fält öppnar
 * biblioteket istället); dropdownen visar sista 10 — klick infogar i
 * fältet, papperskorgen tar bort; /sparad [text] gör samma sak. G2
 * PROMPTHISTORIK — pil-upp i tomt fält återkallar senaste skickade raden
 * (bläddra upp/ned som terminalen; redigering avslutar bläddringen),
 * sista 50 i localStorage "ak1a-studio-prompthistorik". Mobil-först:
 * max-h-48-scroll och ≥44 px tryckytor i alla listor.
 *
 * VÅG 86 STUDIO COMPLETE G6 (NOTISHISTORIK + SNABBMENY): varje Web
 * Notification (⏳ >60 s-påminnelsen + "✓ Klar (N tkn)" + fel) loggas i
 * localStorage "ak1a-studio-notiser": [{text, typ:"lang"|"klar"|"fel",
 * tid}] — sista 50. 🔔-knappen öppnar NOTISPANELEN (drawer i filträdets
 * stil): lista med typ-ikon + tidsstämpel, "Slå på notiser" när
 * rättigheten saknas, Töm-knapp. "?"-TANGENT (utanför inmatningsfält)
 * öppnar GENVÄGSÖVERSIKTEN — tabell med alla kortkommandon (Enter,
 * Skift+Enter, Ctrl/Cmd+K, T, /, ↑, ?, Esc).
 *
 * VÅG 86 STUDIO COMPLETE G7 (SESSION-EXPORT HTML): "🖨 Exportera HTML"
 * bredvid ⬇ Exportera genererar en FRISTÅENDE HTML-fil (AK1A-CSS inline:
 * marin header med logo-ordmärke, användare marin / agent paper med
 * guldkant, kodblock monospace, diff-sektioner grönt/rött, rundstatistik
 * i foten) via Blob-download — printbar (@media print: brytningar +
 * färgbevarande). MOBIL: export-knapparna bor i kebabmenyn (⋮).
 *
 * VÅG 86 STUDIO COMPLETE G3+G4 (INPUT-EDITOR + WEBB-VISUALISERING):
 * G3 RIKTIG INPUT-EDITOR — skrivfältet växer automatiskt (min 1 rad
 * = 44 px, max 8 rader ≈ 205 px, därefter intern överscroll; hojdpassaYta
 * körs direkt i onChange + en prompt-effekt som även fångar program-
 * matiska setPrompt: send-tömning, tabbyte, chip-infogning), 👁-toggle
 * renderar utkastet som markdown (StudioMarkdown — rubriker, **fetstil**,
 * ```-kodblock) i en scrollbar preview-yta OVANFÖR fältet, teckenräknare
 * "n/2000" diskret i hörnet (guld ≥ 1800, rött vid taket; maxLength
 * 2000) och placeholdern ROTERAR på focus ("Fråga agenten…", "Beskriv
 * en uppgift…", "Klistra in en länk…" + tangent-hinten). G4 WEBB-VERKTYG
 * VISUALISERING — verktygskorten för WebFetch/WebSearch parsar argu-
 * menten (webVerktygInfo: JSON-fält url/query med regex-fallback på råa/
 * partiella argument + live-input): WebFetch visar KLICKBAR länk +
 * domän-ikon (Google s2-favicon, Globe-fallback vid motstånd) och
 * WebSearch ett "🔍 sökte efter: …"-chip; resultatet truncas 300 tkn med
 * "hela resultatet"-knapp → kortets vanliga expander-visning. Webb-raden
 * syns även kollapsat (samma filosofi som live-input-raden).
 *
 * VÅG 86 STUDIO COMPLETE G5 (CHECKPOINT/REWIND — "⟲ Gå tillbaka hit"):
 * varje FÄRDIG agentbubbla bär en liten ⟲-knapp (title: "Gå tillbaka hit —
 * sessionen forkas vid denna punkt"). Klick ⇒ confirm-dialog ⇒ POST
 * /api/studio/session {action:"rewind", turnIndex} (huvudtabben) eller
 * {action:"rewind", turnIndex, sessionId} (egen tabb) ⇒ transport.
 * rewindTillTurn: session/fork {kind:"turn", turnIndex} (LIVE-bevisat
 * 2026-09-09, sond tool-results/v86-g5-forksond.mjs: turn-target löses
 * internt till turnens SISTA assistant-meddelande och kräver INGEN
 * workspace-checkpoint — protokollet bär INGET checkpoint-id per turn,
 * turn-forken är dess motsvarighet och dokumenteras i studio-transport.ts)
 * + den forkade sessionen ÖPPNAS och blir den aktiva. Toast "Sessionen
 * har forkats från iteration N" + chatten börjar om från punkten (serverns
 * historik bär en synthetisk user-notis om forken); föräldern lever kvar
 * i Sessioner-listan. turnIndex räknas i turnIndexKarta (user-poster
 * räknar upp — protokollets egna e8i-räkning). latestCheckpoint-forken
 * (kräver filändring) lever kvar som action "fork" i API:t.
 *
 * VÅG 87 H1 (ÅTERKOPPLING — studions största UX-brott; kundrapporten
 * "sparar ej info, fortsätter ej när jag är utanför sidan"): servern +
 * barnprocessen fortsätter ARBETA när användaren lämnar /studio — VID MOUNT
 * anropas GET /api/studio/stream UTAN sessionId, som nu bär
 * {senastAktivSessionId, senastAktivHistorik, aktivtMal} (kartan lever på
 * DISK på servern — H2 — och överlever pm2-omstart). Finns en senast aktiv
 * session MED historik AUTO-LADDAS den: huvudtabben om det är default-
 * sessionen, annars tabben som äger den (ur sessionStorage) eller en ny
 * "Åter …"-tabb — användaren ser ALLT som hände under frånvaron utan att
 * klicka. BORTA-BANNER "📌 Agenten har arbetat medan du var borta — N nya
 * svar [Visa]" (antalet = nya assistant-poster mot den lokala bufferten;
 * [Visa] = mjuk scroll till senaste). RECONNECT-POLL: är fliken öppen men
 * SSE:t tappat ⇒ GET var 15:e sekund vid AKTIVT mål, annars var 30:e
 * (VÅG 88 I3; visibilitychange + självgenererande timer,
 * PAUSAD när fliken är dold) — en session som arbetar på SERVERN utan
 * levande lokal ström markeras i sin tabb och synkas (GET ?sessionId=)
 * när den slutar; ett aktivt mål återöppnar mål-strömmen själv.
 * localStorage "ak1a-studio-senaste-sessionId" skrivs vid varje sändning
 * och läses vid mount som PRIORITERAD kandidat (om den matchar serverns
 * senast aktiva).
 *
 * VÅG 87 H3 (DESIGN-POLISH — Z-kvalitet): animationslager i globals.css
 * under studio-*-klasser — (1a) .studio-fade-in på VARJE meddelandebubbla
 * (opacity 0→1 + translateY 8→0, 200ms ease-out — mount-tid, streaming-
 * re-renders startar aldrig om den), (1b) .studio-lift hover-lift på
 * primära knappar (translateY(-1px) + shadow-md, active:scale-95; i
 * pekläge scale-0.97), (1c) .studio-cursor — blinkande ▊-block i agentens
 * sista delta-rad (1 s oändlig blink). Typografi: rubriker tracking-tight,
 * brödtext leading-relaxed, småetiketter uppercase tracking-[0.15em],
 * siffror tabular-nums (kontextraden). Gradient-accenter: agent-bubblor
 * .studio-bubbla-agent (card→paper ≈ paper/95-känsla; natt lager-på-lager
 * marin), användar-bubblor bibehåller marin-panel-gradienten (marin→
 * marin/95) + .studio-grupp-divider guld-våglinje mellan turgrupper.
 * Empty-state: Serena-emblem 64px guld + "Välkommen till AK1A Studio" +
 * 3 klickbara förslag (mål-dialog / filväljare / fokus i fältet).
 * Loading-skeletons: 3 animerade paper/50-bubblor (animate-pulse, olika
 * bredder + stagger) medan den första GET /api/studio/stream laddar.
 *
 * VÅG 87 H4 (MOBIL-POLISH): viewport-fit=cover i studio-page.tsx +
 * .studio-safe-top på headern / .studio-safe-bottom på composern (env
 * (safe-area-inset-*)); composern är sticky bottom-0 och sitter alltid
 * ovanför tangentbordet; .studio-root ger tap-highlight transparent +
 * tryck-skala på ALLA knappar i pekläge (hover:none); .studio-chatt på
 * chattytan = smooth scroll + overscroll-behavior:contain (pull-refresh
 * förhindras) — programmatiska ström-scrollar använder behavior:"instant"
 * så mjukheten aldrig kampar mot delta-flödet.
 *
 * VÅG 88 I2 (ADMIN I STUDIO — "kunden styr HELA systemet från ETT ställe"):
 * "Verktyg"-knappen (🔧, guldtonad) i ikonraden öppnar VERKTYG-DRAWERN
 * (studio-admin-panel.tsx — helt egen yta + state, drawer i filträdets
 * stil) med TRE sektioner: VARIABLER 📊 (alla 13 kanoniska prisnycklar,
 * grupperade som i admin-panelen, nu-värde + filvärde + inline-edit via
 * GET/POST /api/admin/variabler — våg 79-kontraktet), BLOGG ✍️ (utkast-
 * listan + ny/redigera med flödet Kontrollera → Skicka till granskning
 * (0-FEL-grinden) → Exportera (Läge A-paketet) via /api/admin/blogg) och
 * MINNE 🧠 (navigering till studions befintliga Minne-panel — inget
 * dubbeldriv). Studion kräver redan admin ⇒ sektionen alltid synlig;
 * ömsesidig stängning mot alla övriga drawers.
 *
 * VÅG 88 I3 (CACHE-OPTIMERING — STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 88"):
 * (1) RECONNECT-POLLENS TAKT är målberoende — AKTIVT mål ⇒ GET var 15:e
 * sekund, annars var 30:e (självomarmande setTimeout-länk som läser
 * malStatusRef vid varje omarming; se poll-effekten). (2) CHATT-HISTORIK
 * cachas i IndexedDB (db "ak1a-studio", store "historik", key = sessionId —
 * RÅA API:et, inget lib) vid VARJE "klart"-event: sessionens meddelanden
 * (ström-closurens snapshot + rundan) skrivs + CACHE-META {sessionId,
 * sistSparad, antalMeddelanden} i localStorage ("ak1a-studio-historik-meta")
 * för snabb lookup utan att öppna IndexedDB. (3) VID MOUNT: localStorage
 * pekar på en session OCH GET svarade ⇒ jämför antal meddelanden — cachen
 * har FLER (agenten svarade medan användaren var borta + GET:s spegel är
 * kortare) ⇒ DEN CACHADE versionen renderas + toast "Visar cachad historik".
 * Allt fel-tolerant: privat läge/quota = ingen cache, chatten oförändrad.
 *
 * SKYDD: sidan (page.tsx) visar lås-vy; API-rutterna kräver admin — här
 * bär adminHeaders() lösenordet i lösenordsläget (session-cookien åker
 * med automatiskt). INGA hemligheter renderas.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Typer ────────────────────────────────────────────────────────────────────

// ── VÅG 83 B1: verktygskort + ändringar + rundstatistik ─────────────────────

/** Ett verktygskalls livscykelkort i chattflödet (merge:as på id). */
interface VerktygKort {
  /** Protokollets toolCallId (eller transportens fallback-id). */
  id: string;
  namn: string;
  steg: "planerad" | "startar" | "kör" | "resultat" | "fel";
  /** Argument som JSON-sträng (truncat av transporten). */
  argument?: string;
  beskrivning?: string;
  resultat?: string;
  fel?: string;
  varaktighetMs?: number;
  /** Live-progress (elapsedMs + stdout/stderr-svans). */
  framsteg?: { elapsedMs?: number; utdata?: string };
  /** Ackumulerad live-input (model.streaming tool_input_delta). */
  liveInput?: string;
  /** Expanderat läge (klick på kortet). */
  öppen?: boolean;
}

/** Filändring i turnens "Ändringar"-panel — ±N rader per fil. */
interface Filandring {
  sokvag: string;
  plus: number;
  minus: number;
  rader: { typ: "+" | "-"; text: string }[];
  /**
   * VÅG 85 F4: v4/conversation/fileChanges patch-hunkar MED RADNUMMER
   * (transportens rika källa) — kodvyn markerar newStart…(+newLines) GULT
   * och visar rena borttagningar (newLines 0) som RÖD spökrad. Saknas för
   * Write/Edit-parsad diff (kodvyn matchar då +radernas text mot filen).
   */
  punkter?: { oldStart: number; oldLines: number; newStart: number; newLines: number; rader: string[] }[];
  /** Expanderat läge (klick på filraden). */
  öppen?: boolean;
}

/** Rundstatistik ur turn.started/turn.completed (bubblans fot). */
interface RundStatistik {
  varaktighetMs?: number;
  resultatTyp?: string;
  verktygAntal?: number;
}

interface Meddelande {
  id: string;
  roll: "user" | "assistant";
  text: string;
  /** Strömmar pågående (agentbubbla utan guldkant-fade). */
  strömmande?: boolean;
  /** V83 B1: verktygskort i ankomstordning (merge på id). */
  verktygKort?: VerktygKort[];
  /** V83 B1: senaste turnens filändringar (ändringar-SSE/GET). */
  ändringar?: Filandring[];
  /** V83 B1: rundstatistik (varaktighet · resultat · verktyg). */
  rundStatistik?: RundStatistik;
  /** VÅG 85 F1: autonom iteration (mål-loopen) — badge i agentbubblan. */
  malIteration?: number;
  fel?: boolean;
}

interface Uppladdning {
  sokvag: string;
  typ: string;
  storlek: number;
}

// ── VÅG 84 B: MULTI-SESSION-TABBAR (Z-portaLens flerfönster) ─────────────────

/**
 * En sessionstabb — huvudtabben (huvud=true) kör DEFAULT-transporten (alla
 * header-kontroller: modell/läge/tankestyrka/ny session/komprimera/mål);
 * egna tabbar (huvud=false) bär varsi per-session-transport på servern
 * (POST {prompt, sessionId|nyckel} — egen zcode-barnprocess på prod).
 * Buffrade meddelanden lever I tabben så inaktiva tabbar fortsätter samla
 * SSE i bakgrunden (strömmens fetch-läsare skriver via rörTabb oavsett
 * vilken tabb som är aktiv — vid tabbyte renderas tabbens buffert).
 */
interface Tabb {
  /** Klient-side id ("tabb-huvud" för den första — sedan nyttId()). */
  id: string;
  /** true = huvudsessionen (default-transporten — våg 81/82/83-flödet). */
  huvud: boolean;
  /** zcode-sessionens id — null tills "hej"-eventet/resume-sidaloaden. */
  sessionId: string | null;
  /** Kortnamn — första orden i senaste prompten (tabbadgens text). */
  titel: string;
  /** Buffrad chatt (användare + agent + verktygskort + diff). */
  meddelanden: Meddelande[];
  /** Composer-utkastet (prompt-rutan är per tabb). */
  utkast: string;
  /** Agenten arbetar i DENNA tabben (ON-GÅENDE-pricken i tabbadgen). */
  strömmar: boolean;
  /** Strömstatus ("Agenten arbetar…") — tabbens tomma agentbubbla. */
  status: string;
  /** Senaste resonemangssvansen (reasoning_delta) per tabb. */
  tankar: string;
  /** Kontextsanning (session/read-projektionen) per tabb. */
  kontext: KontextInfo | null;
  rundaTkn: number | null;
  ackumulerat: number;
  /** Server-historik hämtad (resume-sidaload en gång per session). */
  historikLasad: boolean;
}

/** Friska tabb-defaults (allt utom identiteten id/huvud/sessionId/titel). */
function tabbGrund(): Pick<
  Tabb,
  "meddelanden" | "utkast" | "strömmar" | "status" | "tankar" | "kontext" | "rundaTkn" | "ackumulerat" | "historikLasad"
> {
  return {
    meddelanden: [],
    utkast: "",
    strömmar: false,
    status: "",
    tankar: "",
    kontext: null,
    rundaTkn: null,
    ackumulerat: 0,
    historikLasad: false,
  };
}

/** Kortnamn ur en prompt — första tre orden, max ~20 tecken. */
function kortNamn(text: string): string {
  const ren = text.trim().replace(/^\/\S+\s*/, "");
  const ord = ren.split(/\s+/).filter(Boolean);
  if (ord.length === 0) return "Ny tabb";
  const namn = ord.slice(0, 3).join(" ");
  return namn.length > 20 ? `${namn.slice(0, 20)}…` : namn;
}

/** Modellsuffix för tabbadgen — "zai/glm-5.3" → "glm-5.3", "mock/demo" → "demo". */
function modellBadge(modell?: string): string {
  if (!modell) return "—";
  const delar = modell.split("/");
  return (delar.length > 1 ? delar.slice(1).join("/") : modell).slice(0, 16);
}

/**
 * VÅG 88 I1: kort beskrivning per modell i Inställningar-drawern. Listan är
 * HÄRLEDD ur config.json (aldrig hårdkodad) — kända id:n får sin etikett,
 * okända en neutral fallback så nya modeller alltid renderas prydligt.
 */
function modellBeskrivning(id: string): string {
  const lag = id.toLowerCase();
  if (lag.includes("5.3-flash")) return "Snabb och lätt — vardagsuppgifter till lägsta kostnad";
  if (lag.includes("5.3")) return "Kraftfullaste — max resonemang för krävande arbete";
  if (lag.includes("5.2")) return "Föregående generation — stabil fullstor modell";
  if (lag.includes("5.1")) return "Äldre generation — pålitlig och beprövad";
  if (lag.includes("turbo")) return "Turbo — fart före djup, bra för enkla jobb";
  if (lag.includes("mock") || lag.includes("demo")) return "Demonstration — ingen riktig modell ansluten";
  return "zai-modell";
}

/** sessionStorage-nyckel: tabbar + buffrade meddelanden (överlever refresh). */
const TABB_LAGRING = "ak1a-studio-tabbar";

// ── VÅG 87 H1: ÅTERKOPPLINGSPEKARE — senaste session i localStorage ──────────

/** localStorage-nyckel: senaste session-id (mount-återkopplingens kandidat). */
const SENASTE_SESSION_LAGRING = "ak1a-studio-senaste-sessionId";

/**
 * Läs senaste-session-pekaren — null vid ogiltigt/privat läge. Skrivs vid
 * varje sändning (+ "hej") och vid öppnad/återkopplad session; läses vid
 * mount som PRIORITERAD kandidat (om den matchar serverns senast aktiva).
 */
function lasSenasteSessionId(): string | null {
  try {
    const v = window.localStorage.getItem(SENASTE_SESSION_LAGRING);
    return typeof v === "string" && v.startsWith("sess_") ? v : null;
  } catch {
    return null;
  }
}

/** Skriv senaste-session-pekaren (tyst vid privat läge/quota). */
function sparaSenasteSessionId(sessionId: string | null): void {
  try {
    if (sessionId) window.localStorage.setItem(SENASTE_SESSION_LAGRING, sessionId);
    else window.localStorage.removeItem(SENASTE_SESSION_LAGRING);
  } catch {
    // privat läge — pekaren lever bara denna sidad
  }
}

// ── VÅG 88 I3: INDEXEDDB-HISTORIK + CACHE-META ───────────────────────────────
// Chatt-historiken cachas i webbläsarens BESTÄNDIGA lagring (db "ak1a-studio",
// store "historik", key = sessionId) vid varje "klart"-event — IndexedDB
// överlever FLIKSTÄNGNING (sessionStorage överlever bara refresh). Vid mount
// jämförs antalet meddelanden mot GET-svaret: cachen har FLER ⇒ agenten
// svarade medan vi var borta och serverns spegel är kortare (GET:s
// historik-hämtning misslyckades där) ⇒ den cachade versionen visas + toast
// "visar cachad historik". RÅA IndexedDB-API:et — inget bibliotek. Allt är
// valfri lyx: varje steg är tyst fel-tolerant (privat läge/quota = ingen
// cache, chatten fungerar ändå).

/** localStorage-nyckel: cache-metadata (snabb lookup utan att öppna IndexedDB). */
const HISTORIK_META_LAGRING = "ak1a-studio-historik-meta";

/** Cache-posten i store "historik" (keyPath "sessionId"). */
interface HistorikCachePost {
  sessionId: string;
  meddelanden: { roll: "user" | "assistant"; text: string }[];
  sistSparad: number;
}

/** I3.4 CACHE-META: {sessionId, sistSparad, antalMeddelanden} i localStorage. */
interface HistorikMeta {
  sessionId: string;
  sistSparad: number;
  antalMeddelanden: number;
}

/** Öppna (eller skapa) db "ak1a-studio" v1 med store "historik" — null vid fel. */
function oppnaHistorikDb(): Promise<IDBDatabase | null> {
  return new Promise((los) => {
    try {
      const req = indexedDB.open("ak1a-studio", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("historik")) {
          req.result.createObjectStore("historik", { keyPath: "sessionId" });
        }
      };
      req.onsuccess = () => los(req.result);
      req.onerror = () => los(null);
      req.onblocked = () => los(null);
    } catch {
      los(null); // Ingen IndexedDB (äldre webbläsare m.m.) — cachen är lyx
    }
  });
}

/** Skriv sessionens meddelanden till IndexedDB + CACHE-META till localStorage. */
async function sparaHistorikCache(
  sessionId: string,
  meddelanden: { roll: "user" | "assistant"; text: string }[],
): Promise<void> {
  if (!sessionId || meddelanden.length === 0) return;
  const db = await oppnaHistorikDb();
  if (!db) return;
  try {
    await new Promise<void>((los, avvisa) => {
      const tx = db.transaction("historik", "readwrite");
      tx.objectStore("historik").put({ sessionId, meddelanden, sistSparad: Date.now() });
      tx.oncomplete = () => los();
      tx.onerror = () => avvisa(tx.error ?? new Error("IndexedDB-skrivning misslyckades"));
      tx.onabort = () => avvisa(tx.error ?? new Error("IndexedDB-transaktionen avbröts"));
    });
    try {
      window.localStorage.setItem(
        HISTORIK_META_LAGRING,
        JSON.stringify({ sessionId, sistSparad: Date.now(), antalMeddelanden: meddelanden.length }),
      );
    } catch {
      // privat läge/quota — metan är lyx, IndexedDB-posten räcker
    }
  } catch {
    // skrivskyddad lagring — cachen är lyx, chatten fungerar ändå
  } finally {
    db.close();
  }
}

/** Läs sessionens cachade meddelanden — null vid fel/saknad/tom post. */
async function lasHistorikCache(sessionId: string): Promise<HistorikCachePost | null> {
  if (!sessionId) return null;
  const db = await oppnaHistorikDb();
  if (!db) return null;
  try {
    return await new Promise<HistorikCachePost | null>((los) => {
      const req = db.transaction("historik", "readonly").objectStore("historik").get(sessionId);
      req.onsuccess = () => {
        const post = req.result as HistorikCachePost | undefined;
        los(post && Array.isArray(post.meddelanden) && post.meddelanden.length > 0 ? post : null);
      };
      req.onerror = () => los(null);
    });
  } catch {
    return null;
  } finally {
    db.close();
  }
}

/** Läs CACHE-META ur localStorage — tolvfältsskyddad, null vid ogiltigt. */
function lasHistorikMeta(): HistorikMeta | null {
  try {
    const rå = window.localStorage.getItem(HISTORIK_META_LAGRING);
    if (!rå) return null;
    const m = JSON.parse(rå) as Partial<HistorikMeta>;
    if (
      typeof m.sessionId !== "string" ||
      typeof m.sistSparad !== "number" ||
      typeof m.antalMeddelanden !== "number"
    ) {
      return null;
    }
    return m as HistorikMeta;
  } catch {
    return null;
  }
}

// ── VÅG 86 G1/G2: skrivfältets minne — promptbibliotek + prompthistorik ─────

/** localStorage-nyckel: promptbiblioteket ⭐ (sista 50, dropdown visar 10). */
const PROMPT_LAGRING = "ak1a-studio-prompter";

/** localStorage-nyckel: prompthistoriken (sista 50 skickade — pil-upp bläddrar). */
const PROMPT_HISTORIK_LAGRING = "ak1a-studio-prompthistorik";

/** Tak för prompt-minnena (bibliotek + historik — localStorage-quota är öm). */
const MAX_PROMPTER = 50;
const MAX_PROMPT_HISTORIK = 50;

/** En sparad prompt i biblioteket (VÅG 86 G2: {text, skapad}). */
interface SparadPrompt {
  text: string;
  skapad: number;
}

/** Läs promptbiblioteket ur localStorage — tyst [] vid ogiltigt/privat läge. */
function lasPrompter(): SparadPrompt[] {
  try {
    const rå = localStorage.getItem(PROMPT_LAGRING);
    if (!rå) return [];
    const pars = JSON.parse(rå) as unknown;
    if (!Array.isArray(pars)) return [];
    return pars
      .filter(
        (p): p is SparadPrompt =>
          !!p && typeof (p as SparadPrompt).text === "string" && (p as SparadPrompt).text.trim() !== "",
      )
      .map((p) => ({ text: p.text, skapad: typeof p.skapad === "number" ? p.skapad : 0 }))
      .slice(0, MAX_PROMPTER);
  } catch {
    return [];
  }
}

/** Läs prompthistoriken ur localStorage — tyst [] vid ogiltigt/privat läge. */
function lasPromptHistorik(): string[] {
  try {
    const rå = localStorage.getItem(PROMPT_HISTORIK_LAGRING);
    if (!rå) return [];
    const pars = JSON.parse(rå) as unknown;
    if (!Array.isArray(pars)) return [];
    return pars
      .filter((t): t is string => typeof t === "string" && t.trim() !== "")
      .map((t) => t.trim())
      .slice(0, MAX_PROMPT_HISTORIK);
  } catch {
    return [];
  }
}

/** Tak för det som persistas per tabb (sessionStorage-quota är öm). */
const MAX_TABB_MEDDELANDEN = 200;
const MAX_TABB_TEXT = 20_000;

/** Serialisera tabbar — strömmar ALWAYS false (strömmar överlever ingen refresh). */
function sparaTabbar(tabbar: Tabb[], aktivTabbId: string): void {
  try {
    sessionStorage.setItem(
      TABB_LAGRING,
      JSON.stringify({
        version: 1,
        sparad: Date.now(),
        aktivTabbId,
        tabbar: tabbar.map((t) => ({
          ...t,
          utkast: t.utkast.slice(0, 5_000),
          strömmar: false,
          status: "",
          tankar: "",
          meddelanden: t.meddelanden.slice(-MAX_TABB_MEDDELANDEN).map((m) => ({
            ...m,
            text: m.text.slice(0, MAX_TABB_TEXT),
            verktygKort: m.verktygKort?.map((k) => ({
              ...k,
              argument: k.argument?.slice(0, 2_000),
              resultat: k.resultat?.slice(0, 2_000),
              fel: k.fel?.slice(0, 2_000),
              liveInput: k.liveInput?.slice(-500),
              öppen: false,
            })),
            ändringar: m.ändringar?.map((f) => ({
              ...f,
              rader: f.rader.slice(0, 50),
              // VÅG 85 F4/F5: v4-punkterna följer med (cap — quota är öm)
              punkter: f.punkter?.slice(0, 20).map((p) => ({ ...p, rader: p.rader.slice(0, 40) })),
              öppen: false,
            })),
          })),
        })),
      }),
    );
  } catch {
    // quota/privat läge — tabbar lever i minnet, refresh börjar friskt
  }
}

/** Återställ tabbar ur sessionStorage — null när inget/tomt/ogiltigt sparat. */
function lasTabbar(): { aktivTabbId: string; tabbar: Tabb[] } | null {
  try {
    const rå = sessionStorage.getItem(TABB_LAGRING);
    if (!rå) return null;
    const pars = JSON.parse(rå) as { version?: number; aktivTabbId?: string; tabbar?: Tabb[] };
    if (pars.version !== 1 || !Array.isArray(pars.tabbar) || pars.tabbar.length === 0) return null;
    const tabbar = pars.tabbar
      .filter((t) => typeof t?.id === "string" && t.id)
      .map((t) => ({ ...tabbGrund(), ...t, strömmar: false, status: "", tankar: "" }));
    if (tabbar.length === 0) return null;
    // Exakt EN huvudtabb — annars promotar den första sig (robusthet).
    if (!tabbar.some((t) => t.huvud)) tabbar[0].huvud = true;
    const aktiv =
      typeof pars.aktivTabbId === "string" && tabbar.some((t) => t.id === pars.aktivTabbId)
        ? pars.aktivTabbId
        : tabbar[0].id;
    return { aktivTabbId: aktiv, tabbar };
  } catch {
    return null;
  }
}

/** Modellpost ur GET /api/studio/modeller (härledd ur config.json — aldrig hårdkodad). */
interface ModellPost {
  id: string;
  namn: string;
}

/** Kontextsanning ur session/read-projektionen (via /api/studio/stream). */
interface KontextInfo {
  modell?: string;
  contextUsed?: number;
  contextWindow?: number;
  totalTokenCount?: number;
  turnCount?: number;
  /** V83 B2: projection.mode — lägesväxlarens sanning. */
  lage?: string;
  /** V83 B2: settings.thoughtLevel.current — tankestyrkans sanning. */
  tankeNiva?: string;
}

// ── VÅG 83 B2: Z-portaLens interaktioner (permission + fråga) ────────────────

/** Alternativ i permission-dialogens options[] (optionId + visningsnamn). */
interface PermissionAlternativ {
  optionId: string;
  namn: string;
  beskrivning?: string;
}

/** Väntande permission-dialog (interaction/requestPermission). */
interface PermissionDialog {
  requestId: string;
  verktyg: string;
  risk: string;
  skäl?: string;
  sammanfattning: string;
  alternativ: PermissionAlternativ[];
  /** V84 C: diff-förhandsvisning (Write/Edit/MultiEdit) — innan valet. */
  diff?: Filandring;
}

/** Väntande frågekort (interaction/requestUserInput). */
interface FragaDialog {
  requestId: string;
  fråga: string;
  inputTyp?: string;
  val?: string[];
}

/** UI-etiketter för protokollets bevisade optionId (kartan §3). */
const PERMISSION_ETIKETT: Record<string, string> = {
  allow_once: "Tillåt en gång",
  allow_project: "Tillåt för projektet",
  deny: "Neka",
};

/** Risk-badge-färg per riskLevel (low/medium/high/critical, kartan §3). */
function riskFarg(risk: string): string {
  switch (risk) {
    case "low":
      return "bg-emerald-400/15 text-emerald-300";
    case "medium":
      return "bg-gold/15 text-gold";
    case "high":
      return "bg-orange-400/15 text-orange-300";
    case "critical":
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-white/10 text-[#EDE6D6]/70";
  }
}

// ── VÅG 84 C: verktygsriskklassning + minnesregler + långkörningsnotis ──────

/** Klassning per verktygstyp (dialogens andra badge — bredvid protokoll-risken). */
interface Verktygsrisk {
  etikett: string;
  farg: string;
  /** Kort förklaring i title-attributet. */
  forklaring: string;
}

/**
 * Klassa verktyget i risknivå (KVD block C): Bash/Write/Edit = orange
 * "skrivande" (ändrar filer/kör kommandon), Read/Glob/Grep = grön "läsande"
 * (bara läser), WebSearch/WebFetch = gul "nät" (lämnar maskinen), övriga
 * (t.ex. mcp__*) = neutralt "annat". Matchar namnet gemener + kända alias.
 */
function verktygsriskKlass(verktyg: string): Verktygsrisk {
  const n = verktyg.toLowerCase();
  if (
    n === "bash" ||
    n === "write" ||
    n === "edit" ||
    n === "multiedit" ||
    n === "notebookedit" ||
    n === "notebookeditcell" ||
    n.startsWith("bash")
  ) {
    return {
      etikett: "skrivande",
      farg: "bg-orange-400/15 text-orange-300",
      forklaring: "Skrivande verktyg — ändrar filer eller kör kommandon (Bash/Write/Edit = orange)",
    };
  }
  if (n === "read" || n === "glob" || n === "grep" || n === "ls" || n === "listfiles") {
    return {
      etikett: "läsande",
      farg: "bg-emerald-400/15 text-emerald-300",
      forklaring: "Läsande verktyg — ändrar ingenting (Read/Glob/Grep = grön)",
    };
  }
  if (n === "websearch" || n === "webfetch" || n === "websearchquery" || n === "webreader") {
    return {
      etikett: "nät",
      farg: "bg-gold/15 text-gold",
      forklaring: "Nätverkverktyg — hämtar från webben (WebSearch/WebFetch = gul)",
    };
  }
  return {
    etikett: "annat",
    farg: "bg-white/10 text-[#EDE6D6]/70",
    forklaring: "Oklassat verktyg (t.ex. MCP) — klassas som varken läsande eller skrivande",
  };
}

/** Minnesregel "alltid tillåt" (localStorage ak1a-studio-regler). */
interface PermissionRegel {
  /** Verktygsnamn EXAKT som protokollet bär det (matchas skiftlägesokänsligt). */
  verktyg: string;
  omfattning: "alltid";
  /** Sparad tidpunkt (ms) — visas i hanteringspanelen. */
  skapad: number;
}

/** localStorage-nyckel för "alltid tillåt"-reglerna (KVD block C). */
const REGEL_NYCKEL = "ak1a-studio-regler";

/**
 * Läs reglerna ur localStorage — tolvfältsskyddad (ogiltig JSON/annat format
 * ⇒ tomt register, ALDRIG krasch). Körs endast i effekter (klient).
 */
function lasReglerUrLagring(): PermissionRegel[] {
  try {
    const rader = window.localStorage.getItem(REGEL_NYCKEL);
    if (!rader) return [];
    const parsad = JSON.parse(rader) as unknown;
    if (!Array.isArray(parsad)) return [];
    const ut: PermissionRegel[] = [];
    for (const r of parsad) {
      const p = r as { verktyg?: unknown; omfattning?: unknown; skapad?: unknown };
      if (typeof p?.verktyg === "string" && p.verktyg && p?.omfattning === "alltid") {
        ut.push({ verktyg: p.verktyg, omfattning: "alltid", skapad: typeof p.skapad === "number" ? p.skapad : Date.now() });
      }
    }
    return ut;
  } catch {
    return [];
  }
}

/** Tröskel för långkörningsnotis (KVD block C: "om en turn pågår > 60 s"). */
const TURN_NOTIS_TRAOSKEL_MS = 60_000;

// ── VÅG 86 G6: NOTISHISTORIK — persistent lista av alla Web Notifications ────

/** En skickad notis i historiken (localStorage ak1a-studio-notiser). */
interface NotisPost {
  /** Notisens rubrik/text ("Agenten arbetar… (>60 s)", "✓ Klar (12,4k tkn)"). */
  text: string;
  /** Kategori: "lang" = >60 s-påminnelse, "klar" = rundan klar, "fel" = fel. */
  typ: "lang" | "klar" | "fel";
  /** Unix-ms när notisen skickades. */
  tid: number;
}

/** localStorage-nyckel för notishistoriken (V86 G6). */
const NOTIS_LAGRING = "ak1a-studio-notiser";

/** Tak för notishistoriken (KVD: "längst till 50"). */
const MAX_NOTISER = 50;

/** Läs notishistoriken ur localStorage — tolvfältsskyddad (ogiltigt ⇒ tomt). */
function lasNotiserUrLagring(): NotisPost[] {
  try {
    const rader = window.localStorage.getItem(NOTIS_LAGRING);
    if (!rader) return [];
    const parsad = JSON.parse(rader) as unknown;
    if (!Array.isArray(parsad)) return [];
    const ut: NotisPost[] = [];
    for (const r of parsad) {
      const p = r as { text?: unknown; typ?: unknown; tid?: unknown };
      if (typeof p?.text === "string" && p.text && (p?.typ === "lang" || p?.typ === "klar" || p?.typ === "fel")) {
        ut.push({ text: p.text, typ: p.typ, tid: typeof p.tid === "number" ? p.tid : Date.now() });
      }
    }
    return ut.slice(-MAX_NOTISER);
  } catch {
    return [];
  }
}

/** Post ur GET /api/studio/session (session/list, v83 B3-berikad). */
interface SessionPost {
  sessionId: string;
  titel?: string;
  status?: string;
  arbetsyta?: string;
  uppdaterad?: string;
  /** v83 B3: qBe.model ur session/list ("zai/glm-5.3"). */
  modell?: string;
  /** v83 B3: projection.turnCount (session/read-berikning). */
  turns?: number;
  /** v83 B3: projection.totalTokenCount (session/read-berikning). */
  tokens?: number;
}

/** v83 B3: bakgrundsagent ur session/subagents (körande + avslutade). */
interface SubagentPost {
  barnSessionId: string;
  titel: string;
  typ?: string;
  status: string;
  startad?: string;
  avslutad?: string;
  sammanfattning?: string;
}

/** v83 B3: workspaceinfo ur workspace/readState (via GET /api/studio/session). */
interface ArbetsytaInfo {
  arbetsyta: string;
  lage?: string;
  modell?: string;
  tankeNiva?: string;
  behorighet?: string;
  modellerTillgangliga?: number;
  kommandon?: number;
}

interface StreamEvent {
  typ:
    | "hej"
    | "status"
    | "delta"
    | "verktyg"
    | "verktyg_kort"
    | "verktyg_input"
    | "runda"
    | "interaktion"
    | "interaktionsKlar"
    | "klart"
    | "fel"
    | "kontext"
    | "ändringar"
    // ── VÅG 85 F1: mål-läget (POST /api/studio/mal/stream) ──
    | "mal_status"
    | "mal_iteration"
    | "mal_pausad";
  kanal?: "text" | "tankar";
  text?: string;
  namn?: string;
  händelse?: "start" | "slut";
  svar?: string;
  meddelande?: string;
  transport?: string;
  sessionId?: string | null;
  tokenCount?: number;
  kontext?: KontextInfo | null;
  // ── V83 B1: verktygskort + live-input + runda + ändringar ──
  id?: string;
  steg?: "planerad" | "startar" | "kör" | "resultat" | "fel";
  argument?: string;
  beskrivning?: string;
  resultat?: string;
  fel?: string;
  varaktighetMs?: number;
  framsteg?: { elapsedMs?: number; utdata?: string };
  fas?: "start" | "slut";
  resultatTyp?: string;
  verktygAntal?: number;
  filer?: Filandring[];
  // ── VÅG 85 F1: mål-lägets fält (mal_status/mal_iteration/mal_pausad) ──
  /** mal_status: loopen KÖR / målet är pausat. */
  aktiv?: boolean;
  pausad?: boolean;
  /** Transportens iterationsräknare. */
  iteration?: number;
  /** mal_status: måltexten (null = rensat). */
  mal?: string | null;
  // ── V83 B2: interaktioner (permission + fråga) ──
  interaktion?:
    | ({
        typ: "permission";
        requestId: string;
        verktyg: string;
        risk: string;
        skäl?: string;
        sammanfattning: string;
        alternativ: PermissionAlternativ[];
        /** V84 C: diff-förhandsvisning ur verktygsargumenten (transportens diffUrInput). */
        diff?: Filandring;
      } & { val?: undefined; fråga?: undefined; inputTyp?: undefined })
    | ({
        typ: "fråga";
        requestId: string;
        fråga: string;
        inputTyp?: string;
        val?: string[];
      } & { verktyg?: undefined; risk?: undefined; skäl?: undefined; sammanfattning?: undefined; alternativ?: undefined });
  requestId?: string;
  beslut?: string;
  skäl?: string;
}

/** KVD-reservtak när protokollet tiger (zai/GLM svarade 200 000 vid v82-beviset). */
const KONTEXT_TAK_RESERV = 1_000_000;
/** Guld-varningströskel (KVD: kontext-optimering > 80 % av taket). */
const KONTEXT_VARNING_PROCENT = 80;

/** Formattera tokens kompakt (12 345 → "12,3k"). */
function tkn(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

/** Formattera bytes läsbart (15 360 → "15 kB"). */
function byteStorlek(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} kB`;
  return `${n} B`;
}

// ── VÅG 83 B3: tidsformat + agentstatus-badge ──────────────────────────────

/** Kompakt relativ tid ("nu" · "5 min" · "3 h" · "2 d" · annars datum). */
function tidSen(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace("T", " ");
  const min = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (min < 1) return "nu";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const dagar = Math.floor(h / 24);
  if (dagar < 7) return `${dagar} d`;
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

/** Badge-färg per subagent-status (session/subagents). */
function agentStatusFarg(status: string): string {
  switch (status) {
    case "running":
      return "bg-emerald-400/15 text-emerald-300";
    case "waiting":
      return "bg-gold/15 text-gold";
    case "blocked":
      return "bg-red-400/15 text-red-300";
    case "success":
      return "bg-emerald-400/10 text-emerald-300/80";
    case "failed":
    case "lost":
      return "bg-red-500/10 text-red-300/80";
    default:
      return "bg-white/10 text-[#EDE6D6]/60"; // cancelled m.fl.
  }
}

/** Svensk etikett per subagent-status. */
function agentStatusText(status: string): string {
  const tabell: Record<string, string> = {
    running: "kör",
    waiting: "väntar",
    blocked: "blockerad",
    success: "klar",
    failed: "fel",
    cancelled: "avbruten",
    lost: "förlorad",
  };
  return tabell[status] ?? status;
}

// ── VÅG 83 B4: filträd + bildminiatyrer ─────────────────────────────────────

/** Nod ur GET /api/studio/filer (trädgren 1). */
interface TradNod {
  namn: string;
  typ: "mapp" | "fil";
  storlek: number;
  sokvag: string;
  barn?: TradNod[];
}

/** Svar ur GET /api/studio/filer?sokvag=… (förhandsgranskningsgren). */
interface FilVisning {
  namn: string;
  sokvag: string;
  typ?: string;
  storlek: number;
  andrad?: number;
  forhandsgranskning:
    | { slag: "text"; innehåll: string }
    | { slag: "bild"; url: string }
    | { slag: "nedladdning"; url: string; orsak?: string }
    | { slag: "blockerad"; meddelande: string }
    | { slag: "mapp" };
  fel?: string;
}

// ── VÅG 84 D: agentens minne (Minne 🧠-panelen) ─────────────────────────────

/**
 * Minnespost ur GET /api/studio/minne — agentens zcode-minne
 * (MEMORY.md-index + faktafiler) + AGENTS.md som egen post. Listans
 * innehåll är en ≤ 8 kB förhandsvisning (trunkerad-flaggan) — full text
 * hämtas med GET ?namn= vid klick.
 */
interface MinnePost {
  namn: string;
  storlek: number;
  uppdaterad?: number;
  /** Ur frontmatter (description:) — VAD agenten minns om filen. */
  beskrivning?: string;
  /** "index" = MEMORY.md · "agents" = AGENTS.md · "minne" = faktafil. */
  typ: "index" | "agents" | "minne";
  innehåll: string;
  trunkerad?: boolean;
}

/** Ny minnesfils frontmatter-mall (samma form som agentens egna filer). */
const MINNES_MALL = (namn: string) =>
  [
    "---",
    `name: ${namn}`,
    "description: Kort beskrivning av vad agenten ska minnas",
    "metadata:",
    "  node_type: memory",
    "  type: project",
    "---",
    "",
    "Faktum/text som agenten ska minnas — kunden kan rätta rader här.",
    "",
  ].join("\n");

/** Mall för AGENTS.md (skapas från panelen när filen saknas). */
const AGENTS_MALL = [
  "---",
  "description: Stående instruktioner till agenten i denna arbetsyta",
  "---",
  "",
  "# Instruktioner till agenten (AGENTS.md)",
  "",
  "Det agenten ska veta/lämna sig till i VARJE session — utan att kunden",
  "behöver chatta fram det. Exempel:",
  "",
  "- Svara alltid på svenska.",
  "- Pedagogisk plattform — aldrig investeringsråd.",
  "",
].join("\n");

/** Minnesfilnamn i UI:t — samma mönster som servern validerar. */
const MINNES_NAMN_RE = /^[a-z0-9][a-z0-9\-]*\.md$/;

/** Frontmatter av för läsbar markdownvy (visar kroppen utan --- blocket). */
function rensaFrontmatter(text: string): string {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trimStart();
}

/**
 * Bildreferenser i en text — matchar agentens upload-sökvägar
 * ("uploads/<datum>/<namn>.png"). Dedupe i tur- och ordning. Existens
 * verifieras av servern (trasig bild gömmer sig via onError).
 */
function bildRefsUrText(text: string): string[] {
  const ut: string[] = [];
  const re = /uploads\/[\w\-./ ]+?\.(?:png|jpe?g|webp|gif)\b/gi;
  for (const träff of text.matchAll(re)) {
    const sokvag = träff[0].trim().replace(/\/+$/, "");
    if (sokvag && !ut.includes(sokvag)) ut.push(sokvag);
  }
  return ut;
}

/** Säker bild-URL mot filer-rutten (admin-cookien åker med automatiskt). */
function bildUrl(sokvag: string): string {
  return `/api/studio/filer?sokvag=${encodeURIComponent(sokvag)}&bild=1`;
}

// ── VÅG 84 A: kommandopalett + sök-highlight ───────────────────────────────

/** Rad i kommandopaletten (Ctrl/Cmd+K) — kommando, modellbyte eller tema. */
interface PalettPost {
  id: string;
  etikett: string;
  beskrivning: string;
  grupp: "Kommandon" | "Modeller" | "Utseende";
  ikon: "kommando" | "modell" | "tema";
  /** Sökbar text (lowercase) — frasen matchas mot denna. */
  sokbar: string;
  kor: () => void;
}

/** En träff i meddelandesökningen — vilken förekomst i vilket meddelande. */
interface SokTräff {
  meddelandeId: string;
  /** 0-baserad förekomst-ordinal INOM meddelandet (i textordning). */
  forekomst: number;
}

/** Räknare som följer mark-renderingens ordning (dokumentordning). */
interface MarkRaknare {
  n: number;
}

/**
 * Text med sökträffar → noder med <mark>. Räknaren delas med anroparen så
 * "aktiv förekomst" kan markeras starkt (bg-gold-chip med marin text —
 * läsbart på cream-, marin- och natt-botten i båda temana).
 */
function markeraVanlig(
  text: string,
  fras: string,
  aktivForekomst: number,
  raknare?: MarkRaknare,
): React.ReactNode[] | string {
  if (!fras) return text;
  const hojd = text.toLowerCase();
  const f = fras.toLowerCase();
  if (f === "" || !hojd.includes(f)) return text;
  const ut: React.ReactNode[] = [];
  let pos = 0;
  let i = hojd.indexOf(f, pos);
  while (i >= 0) {
    if (i > pos) ut.push(text.slice(pos, i));
    const nummer = raknare ? raknare.n++ : 0;
    ut.push(
      <mark
        key={`mark-${i}`}
        className={
          nummer === aktivForekomst
            ? "rounded-sm bg-[#c9a84c] px-0.5 font-semibold text-[#0E1B2E]"
            : "rounded-sm bg-gold/35 px-0.5 text-inherit"
        }
      >
        {text.slice(i, i + f.length)}
      </mark>,
    );
    pos = i + f.length;
    i = hojd.indexOf(f, pos);
  }
  if (pos < text.length) ut.push(text.slice(pos));
  return ut;
}

/** Räkna förekomster (skiftlägesokänsligt) — sökindexets ground truth. */
function raknaForekomster(text: string, fras: string): number {
  if (!fras) return 0;
  return text.toLowerCase().split(fras.toLowerCase()).length - 1;
}

// ── Markdown (bloggens tolkning + kodblock) ──────────────────────────────────

/** Inline-markdown → noder (samma mönster som blogg-spegel-sida.tsx).
 * V84 A: valfri sökkontext highlightar träffar i vanlig löptext. */
function renderInline(
  text: string,
  keyPrefix: string,
  sok?: { fras: string; aktiv: number; raknare: MarkRaknare },
): React.ReactNode[] {
  const ut: React.ReactNode[] = [];
  const segments = text.split(
    /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|`[^`]+`|_[^_]+_|\*[^*\n]+\*)/g,
  );
  segments.forEach((seg, i) => {
    if (!seg) return;
    if (seg.startsWith("[") && seg.includes("](")) {
      const label = seg.slice(1, seg.indexOf("]"));
      const href = seg.slice(seg.indexOf("](") + 2, -1);
      // Endast säkra protokoll — aldrig javascript: m.fl.
      const säker = /^(https?:\/\/|\/|#)/i.test(href);
      ut.push(
        säker ? (
          <Link key={`${keyPrefix}-a${i}`} href={href} className="text-gold underline hover:opacity-80" target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
            {label}
          </Link>
        ) : (
          <span key={`${keyPrefix}-a${i}`}>{label}</span>
        ),
      );
    } else if (seg.startsWith("**") && seg.endsWith("**")) {
      ut.push(<strong key={`${keyPrefix}-b${i}`}>{seg.slice(2, -2)}</strong>);
    } else if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 2) {
      ut.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {seg.slice(1, -1)}
        </code>,
      );
    } else if ((seg.startsWith("_") && seg.endsWith("_")) || (seg.startsWith("*") && seg.endsWith("*"))) {
      ut.push(<em key={`${keyPrefix}-i${i}`}>{seg.slice(1, -1)}</em>);
    } else if (sok && sok.fras) {
      // V84 A: vanlig löptext — dela på sökfrasen och markera träffarna.
      const markerad = markeraVanlig(seg, sok.fras, sok.aktiv, sok.raknare);
      if (typeof markerad === "string") {
        ut.push(markerad);
      } else {
        markerad.forEach((nod, j) => ut.push(<React.Fragment key={`${keyPrefix}-s${i}-${j}`}>{nod}</React.Fragment>));
      }
    } else {
      ut.push(seg);
    }
  });
  return ut;
}

/** Block-markdown: kodblock, rubriker, listor, stycken.
 * V84 A: markera highlightar sökträffar (även i kodblock) — aktiv-
 * förekomstordinalen räknas i renderingsordning via delad räknare. */
function StudioMarkdown({
  text,
  markera,
}: {
  text: string;
  markera?: { fras: string; aktivForekomst: number };
}): React.JSX.Element {
  const block = React.useMemo(() => {
    const delar: React.ReactNode[] = [];
    const sok =
      markera && markera.fras
        ? { fras: markera.fras, aktiv: markera.aktivForekomst, raknare: { n: 0 } as MarkRaknare }
        : undefined;
    // Dela på kodblock först (``` ... ```).
    const segment = text.split(/```/);
    segment.forEach((seg, i) => {
      if (i % 2 === 1) {
        // Kodblock: första raden kan vara språktagg.
        const rader = seg.replace(/^\n/, "").split("\n");
        const första = rader[0]?.trim() ?? "";
        const sprak = /^[a-zA-Z0-9+-]{0,20}$/.test(första) && första !== "" ? första : "";
        const kropp = (sprak ? rader.slice(1) : rader).join("\n").replace(/\n$/, "");
        delar.push(
          <pre
            key={`kod-${i}`}
            className="mt-3 overflow-x-auto rounded-md border border-gold/20 bg-muted/70 p-3 font-mono text-xs leading-relaxed"
          >
            {sprak && <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gold">{sprak}</div>}
            <code>{sok ? markeraVanlig(kropp, sok.fras, sok.aktiv, sok.raknare) : kropp}</code>
          </pre>,
        );
        return;
      }
      // Vanliga block: rubriker, listor, stycken.
      const rader = seg.split("\n");
      let listBuffert: string[] = [];
      const spolaLista = (nyckel: string) => {
        if (listBuffert.length === 0) return;
        delar.push(
          <ul key={nyckel} className="mt-3 list-disc space-y-1 pl-5">
            {listBuffert.map((l, j) => (
              <li key={j} className="leading-relaxed">
                {renderInline(l, `${nyckel}-${j}`, sok)}
              </li>
            ))}
          </ul>,
        );
        listBuffert = [];
      };
      rader.forEach((rad, j) => {
        const ren = rad.trimEnd();
        if (ren.startsWith("## ")) {
          spolaLista(`l${i}-${j}`);
          delar.push(
            <h3 key={`h-${i}-${j}`} className="mt-4 font-serif text-lg font-bold">
              {renderInline(ren.slice(3), `h${i}-${j}`, sok)}
            </h3>,
          );
        } else if (ren.startsWith("### ")) {
          spolaLista(`l${i}-${j}`);
          delar.push(
            <h4 key={`h4-${i}-${j}`} className="mt-3 font-serif text-base font-bold">
              {renderInline(ren.slice(4), `h4${i}-${j}`, sok)}
            </h4>,
          );
        } else if (/^[-*] /.test(ren)) {
          listBuffert.push(ren.slice(2));
        } else if (ren === "") {
          spolaLista(`l${i}-${j}`);
        } else {
          spolaLista(`l${i}-${j}`);
          delar.push(
            <p key={`p-${i}-${j}`} className="mt-3 leading-relaxed first:mt-0">
              {renderInline(ren, `p${i}-${j}`, sok)}
            </p>,
          );
        }
      });
      spolaLista(`sista-${i}`);
    });
    return delar;
  }, [text, markera]);
  return <div className="text-sm">{block}</div>;
}

// ── VÅG 83 B4: filträdsrad (rekursiv) ───────────────────────────────────────

// ── VÅG 88 I1: Inställningar-drawerns radioregel (48 px tryckyta) ───────────

/**
 * En valbar rad i Inställningar-drawern (⚙️) — radio-cirkel + titel +
 * beskrivning. min-h-12 = 48 px tryckyta (kundens mobilbild: klickmålen i
 * headerns dropdowns var för små — här är varje alternativ en hel rad).
 */
function InstallningarRad({
  vald,
  titel,
  beskrivning,
  val,
  onClick,
  disabled,
  jobbar,
}: {
  vald: boolean;
  titel: string;
  beskrivning?: string;
  val?: string;
  onClick: () => void;
  disabled?: boolean;
  jobbar?: boolean;
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={vald}
      onClick={onClick}
      disabled={disabled}
      title={val ? `${titel} (${val})` : titel}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
        vald ? "bg-gold/15" : "hover:bg-white/10",
        disabled && "cursor-default opacity-50",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          vald ? "border-gold" : "border-[#EDE6D6]/30",
        )}
        aria-hidden
      >
        {vald && <span className="h-2 w-2 rounded-full bg-gold" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-semibold", vald ? "text-gold" : "text-[#EDE6D6]")}>
          {titel}
        </span>
        {beskrivning && (
          <span className="mt-0.5 block leading-snug text-[11px] text-[#EDE6D6]/55">{beskrivning}</span>
        )}
      </span>
      {jobbar && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-gold" />}
    </button>
  );
}

/** Filikon per ändelse (bilder/arkiv/text — guldtonad som resten av ytan). */
function filIkon(namn: string): React.ReactNode {
  const andelse = namn.toLowerCase().split(".").pop() ?? "";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(andelse)) {
    return <FileImage className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  }
  if (andelse === "zip") return <FileArchive className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  return <FileText className="h-3.5 w-3.5 shrink-0 text-gold/60" />;
}

/** En rad i filträdet — mapp växlar öppen/stängd, fil öppnar förhandsgranskning. */
function TradRad({
  nod,
  djup,
  oppna,
  onVaxla,
  onFil,
}: {
  nod: TradNod;
  djup: number;
  oppna: Set<string>;
  onVaxla: (sokvag: string) => void;
  onFil: (sokvag: string) => void;
}): React.JSX.Element {
  if (nod.typ === "mapp") {
    const arOppen = oppna.has(nod.sokvag);
    return (
      <div>
        <button
          onClick={() => onVaxla(nod.sokvag)}
          className="flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-[12px] text-[#EDE6D6]/90 transition-colors hover:bg-white/10"
          style={{ paddingLeft: 6 + djup * 14 }}
          title={nod.sokvag}
        >
          {arOppen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gold" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gold" />
          )}
          <span className="truncate font-medium">{nod.namn}</span>
        </button>
        {arOppen &&
          nod.barn?.map((b) => (
            <TradRad key={b.sokvag} nod={b} djup={djup + 1} oppna={oppna} onVaxla={onVaxla} onFil={onFil} />
          ))}
      </div>
    );
  }
  return (
    <button
      onClick={() => onFil(nod.sokvag)}
      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[12px] text-[#EDE6D6]/75 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
      style={{ paddingLeft: 10 + djup * 14 }}
      title={`${nod.sokvag} — ${byteStorlek(nod.storlek)}`}
    >
      {filIkon(nod.namn)}
      <span className="min-w-0 flex-1 truncate">{nod.namn}</span>
      <span className="shrink-0 font-mono text-[9px] text-[#EDE6D6]/35">{byteStorlek(nod.storlek)}</span>
    </button>
  );
}

// ── VÅG 83 B1: verktygskortets rubrik, ikon, tid + kort-/diff-komponenter ───

/** Formattera millisekunder läsbart (1234 → "1,2 s"; 456 → "456 ms"). */
function msText(ms: number): string {
  if (ms >= 1000) return (ms / 1000).toFixed(1).replace(".", ",") + " s";
  return Math.round(ms) + " ms";
}

/** Verktygsikon per namn (Bash=terminal, Read=filsymbol, Write=penndokument…). */
function verktygsIkon(namn: string): React.ReactNode {
  const n = namn.toLowerCase();
  if (n === "bash" || n.includes("terminal")) return <Terminal className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.startsWith("read")) return <FileText className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.startsWith("write") || n === "edit" || n === "multiedit" || n.includes("notebook")) {
    return <FilePen className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  }
  if (n.includes("grep")) return <Search className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.includes("glob")) return <FolderSearch className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.includes("todo")) return <ListChecks className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.includes("websearch")) return <Globe className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.includes("webfetch") || n.includes("fetch")) return <Link2 className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  return <Wrench className="h-3.5 w-3.5 shrink-0 text-gold/70" />;
}

/**
 * Kortrubrik av argumenten: plockar det mest läsbara fältet ur JSON:en —
 * "Bash: ls uploads/", "Read: src/lib/…", "Grep: finans*". Faller på
 * beskrivning, sedan första raden, sedan bara namnet.
 */
function kortRubrik(kort: VerktygKort): string {
  if (kort.argument) {
    try {
      const p = JSON.parse(kort.argument) as Record<string, unknown>;
      for (const nyckel of ["command", "file_path", "path", "pattern", "url", "query", "prompt", "description"]) {
        const v = p[nyckel];
        if (typeof v === "string" && v) {
          const kortV = v.length > 72 ? v.slice(0, 72) + "…" : v;
          return kort.namn + ": " + kortV;
        }
      }
    } catch {
      // rå text — första raden nedan
    }
    const första = kort.argument.split("\n")[0];
    if (första && första !== kort.argument) return kort.namn + ": " + (första.length > 72 ? första.slice(0, 72) + "…" : första);
  }
  if (kort.beskrivning) return kort.namn + ": " + kort.beskrivning.slice(0, 72);
  return kort.namn;
}

/** Status-ikon höger i kortet: spinner kör / bock klar / kryss rött fel. */
function kortStatus(kort: VerktygKort): React.ReactNode {
  if (kort.steg === "fel") return <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />;
  if (kort.steg === "resultat") return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />;
  return <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-gold" />;
}

// ── VÅG 86 G4: WEBB-VERKTYGENS VISUALISERING (WebFetch/WebSearch) ────────────

/**
 * Plocka webb-info ur ett verktygskorts argument: WebFetch → {typ:"fetch",
 * url}, WebSearch → {typ:"search", fråga}, annars null. Läser JSON-fälten
 * url/link/uri/href resp. query/q/fråga/search; faller på regex i råa
 * texten (argumentet truncas av transporten ⇒ JSON:en kan vara partial)
 * och till sist på live-inputen så raden växer fram MEDAN agenten skriver.
 */
function webVerktygInfo(kort: VerktygKort): { typ: "fetch"; url: string } | { typ: "search"; fråga: string } | null {
  const n = kort.namn.toLowerCase();
  // "Search" i Z Code är FILSÖKNING — endast "websearch" räknas som nät.
  const arSok = n.includes("websearch");
  const arFetch = n.includes("webfetch") || n.includes("fetch") || n.includes("webreader");
  if (!arSok && !arFetch) return null;
  const kalla = kort.argument || kort.liveInput || "";
  if (!kalla) return null;
  let url = "";
  let fråga = "";
  try {
    const p = JSON.parse(kalla) as Record<string, unknown>;
    const falt = (...nycklar: string[]): string => {
      for (const k of nycklar) {
        const v = p[k];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
      return "";
    };
    url = falt("url", "link", "uri", "href");
    fråga = falt("query", "q", "fråga", "search");
  } catch {
    // Rå/partiell text — regexa ut det läsbara (sökfrågan får gärna vara
    // halvfärdig: raden uppdateras allteftersom live-inputen växer).
    const um = kalla.match(/https?:\/\/[^\s"'<>)]+/i);
    if (um) url = um[0];
    const qm = kalla.match(/"query"\s*:\s*"([^"]*)/i);
    if (qm) fråga = qm[1];
  }
  if (arSok) return fråga ? { typ: "search", fråga } : null;
  return url ? { typ: "fetch", url } : null;
}

/** Domän-ikon för en URL — Google s2-favicon (32 px, skalad 18) med
 *  Globe-fallback när bilden saknas/inte kan laddas. VÅG 86 G4. */
function FaviconIkon({ url }: { url: string }): React.JSX.Element {
  const [fel, setFel] = React.useState(false);
  let domän = "";
  try {
    domän = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname;
  } catch {
    domän = "";
  }
  if (fel || !domän) return <Globe className="h-[18px] w-[18px] shrink-0 text-gold/80" aria-hidden />;
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domän)}&sz=32`}
      alt={domän}
      width={18}
      height={18}
      loading="lazy"
      onError={() => setFel(true)}
      className="h-[18px] w-[18px] shrink-0 rounded-sm"
    />
  );
}

/**
 * Verktygskortet — expanderbar rad i agentbubblan. Kollapsad: ▶ + ikon +
 * rubrik + status; live-input syns guld-tonat även kollapsat ("läser fil
 * X…"). Expanderad: argument + live-progress + resultat/fel i monospace.
 */
function VerktygsKortVy({
  kort,
  onVaxla,
}: {
  kort: VerktygKort;
  onVaxla: (id: string) => void;
}): React.JSX.Element {
  const kör = kort.steg === "planerad" || kort.steg === "startar" || kort.steg === "kör";
  // VÅG 86 G4: webb-verktyg (WebFetch/WebSearch) — länk+favicon / sök-chip
  // + resultattruncat (300 tkn) medan kortet är kollapsat; expanderat visas
  // hela resultatet som vanligt nedan.
  const web = webVerktygInfo(kort);
  const webResultat =
    web && kort.resultat && !kort.öppen
      ? kort.resultat.length > 300
        ? kort.resultat.slice(0, 300) + "…"
        : kort.resultat
      : "";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border text-left",
        kort.steg === "fel" ? "border-red-500/40 bg-red-500/5" : "border-gold/25 bg-muted/40",
      )}
    >
      <button
        onClick={() => onVaxla(kort.id)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors hover:bg-muted/70"
        title={kort.beskrivning ?? kortRubrik(kort)}
      >
        {kort.öppen ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        {verktygsIkon(kort.namn)}
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] leading-tight text-foreground/90">
          {kortRubrik(kort)}
        </span>
        {typeof kort.varaktighetMs === "number" && !kör && (
          <span className="shrink-0 font-mono text-[9px] text-muted-foreground/70">{msText(kort.varaktighetMs)}</span>
        )}
        {kortStatus(kort)}
      </button>
      {/* Live-input medan agenten skriver argumenten — syns även kollapsat. */}
      {kör && kort.liveInput && (
        <p className="truncate border-t border-gold/15 px-2.5 py-1 font-mono text-[10px] leading-tight text-gold/90">
          {kort.liveInput.slice(-96)}
          <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-gold align-text-bottom" />
        </p>
      )}
      {/* VÅG 86 G4: webb-verktygets visualisering — syns även kollapsat
          (samma filosofi som live-input-raden ovan). WebFetch: KLICKBAR
          länk + domän-ikon (Google s2-favicon, Globe-fallback). WebSearch:
          chip "🔍 sökte efter: …". Resultatet truncas 300 tkn — "hela
          resultatet"-knappen (eller kortets egen ▶-vron) expanderar. */}
      {web && (
        <div className="space-y-1 border-t border-gold/15 px-2.5 py-1.5">
          {web.typ === "fetch" ? (
            <a
              href={web.url}
              target="_blank"
              rel="noopener noreferrer"
              title={web.url}
              className="flex min-w-0 items-center gap-1.5 rounded-md py-0.5"
            >
              <FaviconIkon url={web.url} />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-gold underline decoration-gold/40 underline-offset-2">
                {web.url}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 text-gold/60" />
            </a>
          ) : (
            <p className="flex min-w-0 items-center gap-1.5" title={web.fråga}>
              <span className="shrink-0 text-[11px]" aria-hidden>
                🔍
              </span>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground/70">sökte efter:</span>
              <span className="min-w-0 flex-1 truncate rounded-full border border-gold/25 bg-gold/5 px-2 py-0.5 font-mono text-[11px] text-gold/90">
                {web.fråga}
              </span>
            </p>
          )}
          {webResultat && (
            <p className="whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-muted-foreground/80">
              {webResultat}{" "}
              {(kort.resultat?.length ?? 0) > 300 && (
                <button
                  onClick={() => onVaxla(kort.id)}
                  className="font-sans font-semibold text-gold underline underline-offset-2"
                  title="Expandera kortet (samma växling som ▶-vronen)"
                >
                  hela resultatet
                </button>
              )}
            </p>
          )}
        </div>
      )}
      {kort.öppen && (
        <div className="space-y-2 border-t border-gold/15 px-2.5 py-2">
          {kort.argument && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Argument</p>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-muted/70 p-2 font-mono text-[10px] leading-relaxed">{kort.argument}</pre>
            </div>
          )}
          {kör && kort.framsteg?.utdata && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Live{typeof kort.framsteg.elapsedMs === "number" ? " · " + msText(kort.framsteg.elapsedMs) : ""}
              </p>
              <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words rounded bg-muted/70 p-2 font-mono text-[10px] leading-relaxed">{kort.framsteg.utdata}</pre>
            </div>
          )}
          {kort.resultat && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Resultat</p>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded bg-muted/70 p-2 font-mono text-[10px] leading-relaxed">{kort.resultat}</pre>
            </div>
          )}
          {kort.fel && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-500/80">Fel</p>
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded bg-red-500/10 p-2 font-mono text-[10px] leading-relaxed text-red-600 dark:text-red-400">{kort.fel}</pre>
            </div>
          )}
          {!kort.argument && !kort.resultat && !kort.fel && !kort.framsteg?.utdata && (
            <p className="text-[10px] text-muted-foreground/60">Väntar på att verktyget ska börja…</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── VÅG 85 F5: INLINE-KODVY — syntaxmarkering + ändringsmarkering ───────────

/**
 * Enkel tokenisering (kundspec F5: "nyckelord=guld, strängar=grön,
 * kommentarer=grå, tal=lila") för JavaScript/TypeScript/JSON/CSS +
 * markdown-rubriker/fetstil/kod. PER RAD (blockkommentarer markeras där
 * de börjar/ändar — enkelhet är specen; inget tokenizer-bibliotek).
 */
const KOD_NYCKELORD = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
  "import", "from", "export", "default", "async", "await", "class", "extends",
  "new", "type", "interface", "enum", "public", "private", "protected", "readonly",
  "static", "throw", "try", "catch", "finally", "switch", "case", "break",
  "continue", "typeof", "instanceof", "in", "of", "as", "null", "undefined",
  "true", "false", "void", "never", "this", "super", "yield", "implements",
]);

/** Färgklasser per token-slag (ljus + marin natt via dark:-varianterna). */
const KOD_FARGER = {
  nyckelord: "text-gold",
  strang: "text-emerald-700 dark:text-emerald-400",
  kommentar: "text-muted-foreground/70",
  tal: "text-purple-700 dark:text-purple-400",
  rubrik: "text-gold font-bold",
} as const;

/** Tokenisera EN kodrad till färgade React-noder (id + klass per träff). */
function markeraKodRad(rad: string, typ: string, nyckel: string): React.ReactNode[] {
  // Markdown: rubriker guld, `kod` + [länkar] gröna, **fetstil** guld.
  if (typ === "md") {
    if (/^\s*#{1,6}\s/.test(rad)) {
      return [
        <span key={`${nyckel}-h`} className={KOD_FARGER.rubrik}>
          {rad}
        </span>,
      ];
    }
    const delar = rad.split(/(`[^`]*`|\*\*[^*]+\*\*|\[[^\]]*\]\([^)]*\))/g);
    return delar.map((d, i) =>
      d.startsWith("`") || d.startsWith("[") ? (
        <span key={`${nyckel}-m${i}`} className={KOD_FARGER.strang}>
          {d}
        </span>
      ) : d.startsWith("**") ? (
        <span key={`${nyckel}-m${i}`} className={KOD_FARGER.rubrik}>
          {d}
        </span>
      ) : (
        <span key={`${nyckel}-m${i}`}>{d}</span>
      ),
    );
  }
  // JS/TS/JSON/CSS: kommentar → sträng → tal → nyckelord (första träff vinner).
  const re =
    /(\/\/.*$|\/\*.*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][A-Za-z0-9_$]*)/g;
  const ut: React.ReactNode[] = [];
  let sist = 0;
  let n = 0;
  for (let m = re.exec(rad); m !== null; m = re.exec(rad)) {
    if (m.index > sist) ut.push(<span key={`${nyckel}-t${n++}`}>{rad.slice(sist, m.index)}</span>);
    const [träff, kommentar, strang, tal, ord] = m;
    let klass: string | undefined;
    if (kommentar) klass = KOD_FARGER.kommentar;
    else if (strang) klass = KOD_FARGER.strang;
    else if (tal) klass = KOD_FARGER.tal;
    else if (ord && KOD_NYCKELORD.has(ord)) klass = KOD_FARGER.nyckelord;
    ut.push(
      klass ? (
        <span key={`${nyckel}-k${n++}`} className={klass}>
          {träff}
        </span>
      ) : (
        <span key={`${nyckel}-k${n++}`}>{träff}</span>
      ),
    );
    sist = m.index + träff.length;
  }
  if (sist < rad.length) ut.push(<span key={`${nyckel}-t${n++}`}>{rad.slice(sist)}</span>);
  return ut;
}

/** Absolut agentsökväg → arbetsytans relativa (API:t kräver relativ form). */
function relativSokvag(sokvag: string, arbetsyta?: string): string {
  if (!sokvag.startsWith("/")) return sokvag;
  const rot = arbetsyta?.replace(/\/+$/, "");
  if (rot && sokvag.startsWith(`${rot}/`)) return sokvag.slice(rot.length + 1);
  return sokvag; // utan känd rot: API:t svarar ärligt (avvisar absoluta)
}

/** Ändelse → kodvy-språk (tokeniseringens vägval). */
function kodSprak(namn: string): string {
  const ande = (namn.toLowerCase().split(".").pop() ?? "").trim();
  return ande === "md" || ande === "markdown" ? "md" : "kod";
}

/**
 * VÅG 85 F5: EXPANDERAD KODVY för en fil i "Ändringar"-panelen —
 *   · hämtar filen via GET /api/studio/filer?sokvag=… (≤ 20 kB text);
 *   · syntaxmarkerad (guld/grön/grå/lila enligt kundspec);
 *   · DE ÄNDRADE RADERNA GULA: exakta positioner ur v4-punkterna
 *     (newStart…+newLines); utan punkter matchas diff-motorns +rader
 *     sekventiellt mot filen;
 *   · rena borttagningar (newLines 0) visas som RÖDA spökrader;
 *   · max 200 rader ("…" + antal gömda);
 *   · REDIGERA (endast plan-läge): textarea → POST /api/studio/filer →
 *     notis "filen sparad — nästa agent-turn ser ändringen" (kundens
 *     sätt att styra koden UTAN TERMINAL — detta ÄR agentens workspace).
 */
function KodvyFil({
  fil,
  arbetsyta,
  planLage,
}: {
  fil: Filandring;
  arbetsyta?: string;
  planLage: boolean;
}): React.JSX.Element {
  const relativ = relativSokvag(fil.sokvag, arbetsyta);
  const [innehall, setInnehall] = React.useState<string | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(true);
  const [redigerar, setRedigerar] = React.useState(false);
  const [utkast, setUtkast] = React.useState("");
  const [sparar, setSparar] = React.useState(false);
  const [notis, setNotis] = React.useState("");

  React.useEffect(() => {
    let aktiv = true;
    setLaddar(true);
    setFel("");
    setNotis("");
    (async () => {
      try {
        const res = await fetch(`/api/studio/filer?sokvag=${encodeURIComponent(relativ)}`, {
          headers: adminHeaders(),
        });
        const data = (await res.json()) as {
          fel?: string;
          forhandsgranskning?: { slag?: string; innehåll?: string; meddelande?: string; orsak?: string };
        };
        if (!aktiv) return;
        if (data.fel) {
          setFel(data.fel);
        } else if (
          data.forhandsgranskning?.slag === "text" &&
          typeof data.forhandsgranskning.innehåll === "string"
        ) {
          setInnehall(data.forhandsgranskning.innehåll);
        } else {
          setFel(
            data.forhandsgranskning?.meddelande ??
              data.forhandsgranskning?.orsak ??
              "Filen kan inte förhandsgranskas.",
          );
        }
      } catch (e) {
        if (aktiv) setFel(e instanceof Error ? e.message.slice(0, 160) : "Filen kunde ej hämtas.");
      } finally {
        if (aktiv) setLaddar(false);
      }
    })();
    return () => {
      aktiv = false;
    };
  }, [relativ]);

  /** Markera ändrade rader (1-baserade) + spök-borttagningar per position. */
  const markerade = React.useMemo(() => {
    const gula = new Set<number>();
    const roda = new Map<number, number>(); // rad → antal borttagna före den
    const rader = (innehall ?? "").split("\n");
    if (fil.punkter && fil.punkter.length > 0) {
      // V4-punkter: EXAKTA positioner (transportens rika diff, våg 85 F4).
      for (const p of fil.punkter) {
        if (p.newLines > 0) {
          for (let i = 0; i < p.newLines; i++) gula.add(p.newStart + i);
        } else if (p.oldLines > 0) {
          roda.set(p.newStart, Math.max(roda.get(p.newStart) ?? 0, p.oldLines));
        }
      }
    } else {
      // Write/Edit-motorn: matcha +raderna sekventiellt mot filens rader
      // (första opåverkade träffen vinner — ärlig heuristik utan positioner).
      let pekare = 0;
      for (const r of fil.rader) {
        if (r.typ !== "+") continue;
        const mal = r.text.trim();
        if (!mal) continue;
        for (let i = pekare; i < rader.length; i++) {
          if (rader[i].trim() === mal) {
            gula.add(i + 1);
            pekare = i + 1;
            break;
          }
        }
      }
    }
    return { gula, roda };
  }, [innehall, fil]);

  const spara = async (): Promise<void> => {
    setSparar(true);
    setNotis("");
    try {
      const res = await fetch("/api/studio/filer", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ sokvag: relativ, innehall: utkast }),
      });
      const data = (await res.json()) as { fel?: string; spara?: string; storlek?: number };
      if (data.fel) {
        setNotis(`Kunde ej spara: ${data.fel}`);
      } else {
        setInnehall(utkast);
        setRedigerar(false);
        setNotis(`✓ Filen sparad (${data.storlek ?? utkast.length} B) — nästa agent-turn ser ändringen.`);
      }
    } catch (e) {
      setNotis(`Kunde ej spara: ${e instanceof Error ? e.message.slice(0, 140) : "nätverksfel"}`);
    } finally {
      setSparar(false);
    }
  };

  const sprak = kodSprak(fil.sokvag.split("/").pop() ?? "");
  const allaRader = (innehall ?? "").split("\n");
  const MAX_VISADE = 200;
  const visade = allaRader.slice(0, MAX_VISADE);
  const gömda = allaRader.length - visade.length;

  return (
    <div className="border-t border-gold/10 bg-muted/40">
      {laddar ? (
        <p className="flex items-center gap-1.5 px-2.5 py-2 text-[10px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-gold" /> Läser filen…
        </p>
      ) : fel ? (
        <p className="px-2.5 py-2 text-[10px] leading-relaxed text-muted-foreground">
          Kodvy ej tillgänglig: {fel}
        </p>
      ) : redigerar ? (
        <div className="p-2">
          <textarea
            value={utkast}
            onChange={(e) => setUtkast(e.target.value)}
            spellCheck={false}
            rows={14}
            className="w-full resize-y rounded-md border border-gold/40 bg-black/20 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-foreground outline-none focus:border-gold/70"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => void spara()}
              disabled={sparar}
              className="flex items-center gap-1 rounded-md border border-gold/50 bg-gold/10 px-2 py-1 text-[10px] font-semibold text-foreground transition-colors hover:bg-gold/20 disabled:opacity-50"
            >
              {sparar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Spara
            </button>
            <button
              onClick={() => {
                setRedigerar(false);
                setNotis("");
              }}
              disabled={sparar}
              className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
            >
              Avbryt
            </button>
            <span className="text-[9px] text-muted-foreground/70">
              Skrivs till agentens workspace — nästa turn ser ändringen.
            </span>
          </div>
          {notis && (
            <p
              className={cn(
                "mt-1.5 text-[10px]",
                notis.startsWith("✓") ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
              )}
            >
              {notis}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 border-b border-gold/10 px-2.5 py-1">
            <FileCode className="h-3 w-3 shrink-0 text-gold/80" />
            <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground" title={relativ}>
              {relativ}
            </span>
            <span className="shrink-0 text-[9px] text-muted-foreground/70">{allaRader.length} rader</span>
            {planLage && innehall !== null && (
              <button
                onClick={() => {
                  setUtkast(innehall);
                  setNotis("");
                  setRedigerar(true);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border border-gold/50 bg-gold/10 px-1.5 py-0.5 text-[9px] font-semibold text-foreground transition-colors hover:bg-gold/20"
                title="Redigera filen (endast plan-läge) — sparas till agentens workspace"
              >
                <Pencil className="h-3 w-3" /> Redigera
              </button>
            )}
          </div>
          <pre className="max-h-72 overflow-auto px-2.5 py-1.5 font-mono text-[10px] leading-relaxed">
            {visade.map((rad, i) => {
              const nummer = i + 1;
              const gul = markerade.gula.has(nummer);
              return (
                <span
                  key={i}
                  className={cn(
                    "flex gap-2 whitespace-pre-wrap break-all rounded-sm px-1",
                    gul && "bg-yellow-200/70 dark:bg-yellow-500/20",
                  )}
                >
                  <span className="w-8 shrink-0 select-none text-right text-muted-foreground/50">{nummer}</span>
                  <span className="min-w-0 flex-1">{markeraKodRad(rad, sprak, `r${i}`)}</span>
                </span>
              );
            })}
            {[...markerade.roda.entries()].map(([pos, antal]) =>
              pos <= MAX_VISADE ? (
                <span
                  key={`ghost-${pos}`}
                  className="flex gap-2 rounded-sm bg-red-200/60 px-1 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                  title={`${antal} borttagna rader (diff-motorn)`}
                >
                  <span className="w-8 shrink-0 select-none text-right opacity-60">{pos}</span>
                  <span className="min-w-0 flex-1">
                    − {antal} borttagen{antal > 1 ? "a rader" : " rad"} (existerar ej i filen)
                  </span>
                </span>
              ) : null,
            )}
            {gömda > 0 && (
              <span className="block px-1 pt-1 text-muted-foreground/60">
                … {gömda} rader till (kodvyn visar max {MAX_VISADE})
              </span>
            )}
          </pre>
          {notis && (
            <p
              className={cn(
                "border-t border-gold/10 px-2.5 py-1.5 text-[10px]",
                notis.startsWith("✓") ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
              )}
            >
              {notis}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Ändringspanelen per turn — filrader med +N (grönt) / −N (rött), klicka
 * ut filen för KODVY (VÅG 85 F5: filen på disk, syntaxmarkerad, ändrade
 * rader GULA, borttagna RÖDA) + rad-diff i monospace under.
 */
function AndringsPanel({
  andringar,
  onVaxlaFil,
  arbetsyta,
  planLage,
}: {
  andringar: Filandring[];
  onVaxlaFil: (sokvag: string) => void;
  /** Agentens arbetsyterot (absoluta diff-sökvägar → relativa API-sökvägar). */
  arbetsyta?: string;
  /** true = plan-läge (kontext.läge) — redigera-knappen visas bara då. */
  planLage: boolean;
}): React.JSX.Element {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-gold/25 bg-muted/30">
      <p className="flex items-center gap-1.5 border-b border-gold/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
        <Diff className="h-3.5 w-3.5 text-gold" />
        Ändringar denna rundan ({andringar.length} {andringar.length === 1 ? "fil" : "filer"})
      </p>
      <ul>
        {andringar.map((f) => (
          <li key={f.sokvag} className="border-b border-gold/10 last:border-b-0">
            <button
              onClick={() => onVaxlaFil(f.sokvag)}
              className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors hover:bg-muted/60"
              title={f.sokvag}
            >
              {f.öppen ? (
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              )}
              <FilePen className="h-3 w-3 shrink-0 text-gold/70" />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/90">
                {f.sokvag.split("/").slice(-2).join("/")}
              </span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+{f.plus}</span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-red-600 dark:text-red-400">−{f.minus}</span>
            </button>
            {f.öppen && (
              <>
                {/* VÅG 85 F5: filen på disk — syntax + GULA ändringsrader. */}
                <KodvyFil fil={f} arbetsyta={arbetsyta} planLage={planLage} />
                {f.rader.length > 0 && (
                  <pre className="max-h-64 overflow-auto border-t border-gold/10 bg-muted/60 px-2.5 py-1.5 font-mono text-[10px] leading-relaxed">
                    {f.rader.map((r, i) => (
                      <span
                        key={i}
                        className={cn(
                          "block whitespace-pre-wrap break-all",
                          r.typ === "+" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
                        )}
                      >
                        {r.typ === "+" ? "+" : "−"} {r.text || " "}
                      </span>
                    ))}
                  </pre>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * V84 C: DIFF-FÖRHANDSVISNING i permission-dialogen — exakt vad Write/Edit
 * kommer att ändra, FÄRGKODAT (gröna +rader/röda −rader, samma rendition som
 * "Ändringar"-panelen) INNAN användaren väljer. Filrad + ärliga ±N i
 * rubriken; raderlista med radlängdstak från transporten.
 */
function DiffForhandsvisning({ diff }: { diff: Filandring }): React.JSX.Element {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-gold/30 bg-black/30">
      <p className="flex items-center gap-1.5 border-b border-gold/20 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/80">
        <Diff className="h-3.5 w-3.5 text-gold" />
        Diff-förhandsvisning
      </p>
      <div className="flex items-center gap-1.5 border-b border-gold/10 bg-black/20 px-2.5 py-1.5" title={diff.sokvag}>
        <FilePen className="h-3 w-3 shrink-0 text-gold/70" />
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[#EDE6D6]/90">
          {diff.sokvag.split("/").slice(-2).join("/")}
        </span>
        <span className="shrink-0 font-mono text-[10px] font-bold text-emerald-400">+{diff.plus}</span>
        <span className="shrink-0 font-mono text-[10px] font-bold text-red-400">−{diff.minus}</span>
      </div>
      <pre className="max-h-56 overflow-auto px-2.5 py-1.5 font-mono text-[10px] leading-relaxed">
        {diff.rader.map((r, i) => (
          <span
            key={i}
            className={cn(
              "block whitespace-pre-wrap break-all",
              r.typ === "+" ? "text-emerald-300" : "text-red-300",
            )}
          >
            {r.typ === "+" ? "+" : "−"} {r.text || " "}
          </span>
        ))}
      </pre>
    </div>
  );
}

// ── VÅG 86 G3: SKRIVFÄLTETS INPUT-EDITOR — mått + placeholder-rotation ──────

/** Min-höjd 1 rad = 44 px (text-sm × leading-relaxed + py-2.5 + ram);
 *  tak 8 rader ≈ 205 px — därefter scrollar fältet internt (overflowY). */
const YTA_MIN_HOJD = 44;
const YTA_MAX_HOJD = 205;

/** Höjdpassa skrivytan: resize:none i CSS + denna funktion i onChange
 *  (och i en prompt-effekt — programmatiska setPrompt som send-tömning,
 *  tabbyte och chip-infogning passerar aldrig onChange). */
function hojdpassaYta(yta: HTMLTextAreaElement | null): void {
  if (!yta) return;
  yta.style.height = "auto";
  const behov = yta.scrollHeight;
  yta.style.height = `${Math.max(YTA_MIN_HOJD, Math.min(YTA_MAX_HOJD, behov))}px`;
  yta.style.overflowY = behov > YTA_MAX_HOJD ? "auto" : "hidden";
}

/** Placeholdern ROTERAR på focus — tips i stället för en statisk rad
 *  (sista varianten behåller tangent-hinten så den återkommer). */
const SKRIV_PLACEHOLDERS = [
  "Fråga agenten…",
  "Beskriv en uppgift…",
  "Klistra in en länk…",
  "Skriv till agenten… (Enter skickar, Skift+Enter ny rad — / visar kommandon, ↑ återkallar)",
];

// ── VÅG 87 H3 4: SERENA-EMBLEM — empty-state:ns illustration ────────────────

/**
 * SERENA — studions agent-emblem (VÅG 87 H3: empty-state "stor illustration
 * 64px guld"). Två koncentriska guldringar + en fyruddig gnista med
 * cream-hjärtpunkt och två banade prickar — AK1A:s guld-familj i SVG, ingen
 * extern fil, skalar fritt (standard 64px).
 */
function SerenaEmblem({ storlek = 64 }: { storlek?: number }): React.JSX.Element {
  return (
    <svg
      width={storlek}
      height={storlek}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Serena — AK1A Studio-agenten"
      className="mx-auto block"
    >
      <defs>
        <linearGradient id="serena-guld" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C766" />
          <stop offset="100%" stopColor="#a8862a" />
        </linearGradient>
      </defs>
      {/* Yttre hårlinje-ring */}
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#serena-guld)" strokeWidth="1" opacity="0.55" />
      {/* Inre ring */}
      <circle cx="32" cy="32" r="24" fill="none" stroke="url(#serena-guld)" strokeWidth="0.75" opacity="0.35" />
      {/* Central fyruddig gnista (Serena) */}
      <path
        d="M32 12 C34.5 24 40 29.5 52 32 C40 34.5 34.5 40 32 52 C29.5 40 24 34.5 12 32 C24 29.5 29.5 24 32 12 Z"
        fill="url(#serena-guld)"
      />
      {/* Hjärtpunkt */}
      <circle cx="32" cy="32" r="3" fill="#fffdf7" opacity="0.9" />
      {/* Banade prickar */}
      <circle cx="32" cy="5.5" r="1.4" fill="#E8C766" opacity="0.8" />
      <circle cx="58.5" cy="32" r="1" fill="#E8C766" opacity="0.5" />
    </svg>
  );
}

// ── Huvudkomponent ───────────────────────────────────────────────────────────

let idRäknare = 0;
const nyttId = () => `m${++idRäknare}-${Date.now().toString(36)}`;

export function StudioChat({ hem }: { hem: () => void }) {
  // ── VÅG 84 B: MULTI-SESSION-TABBAR — per-tabb-livet lever i `tabbar` ─────
  // (meddelanden/strömmar/tankar/kontext/rundaTkn/ackumulerat härleds ur den
  // AKTIVA tabben nedan — JSX:ets gamla namn lever kvar oförändrade).
  const [tabbar, setTabbar] = React.useState<Tabb[]>(() => [
    { id: "tabb-huvud", huvud: true, sessionId: null, titel: "Huvudsession", ...tabbGrund() },
  ]);
  const [aktivTabbId, setAktivTabbId] = React.useState("tabb-huvud");
  const [prompt, setPrompt] = React.useState("");
  const [statusText, setStatusText] = React.useState("Ansluter…");
  const [live, setLive] = React.useState<"live" | "demo" | "ned">("ned");
  const [uppladdningar, setUppladdningar] = React.useState<Uppladdning[]>([]);
  const [laddarUpp, setLaddarUpp] = React.useState(false);
  const [draÖver, setDraÖver] = React.useState(false);
  // ── VÅG 87 H3 5: LOADING-SKELETONS — true tills den första GET
  // /api/studio/stream (historiken) besvarats; tom chatt + laddar ⇒ 3
  // animerade paper/50-bubblor i stället för tomrum (Z-känsla direkt).
  const [laddarHistorik, setLaddarHistorik] = React.useState(true);
  // ── VÅG 86 G3: INPUT-EDITOR — 👁 markdown-förhandsvisning + roterande
  // placeholder (index växlar på varje focus av skrivfältet).
  const [previewOppen, setPreviewOppen] = React.useState(false);
  const [placeholderIx, setPlaceholderIx] = React.useState(0);

  // ── V2 STUDIO: modellval + kontextrad + sessioner ─────────────────────────
  const [modeller, setModeller] = React.useState<ModellPost[]>([]);
  const [valdModell, setValdModell] = React.useState("");
  const [byterModell, setByterModell] = React.useState(false);
  const [sessioner, setSessioner] = React.useState<SessionPost[]>([]);
  const [visaSessioner, setVisaSessioner] = React.useState(false);
  const [sessionJobbar, setSessionJobbar] = React.useState<"" | "ny" | "compact" | "resume" | "stang">("");
  const [toast, setToast] = React.useState<{ text: string; ton: "guld" | "fel" } | null>(null);
  /** VÅG 86 G5: en rewind (fork) kör — låser ⟲-knapparna under rundan. */
  const [rewindJobbar, setRewindJobbar] = React.useState(false);

  // ── VÅG 83 B3: sessions- och workspace-hantering (Z-portaLens) ──────────
  const [aktivSession, setAktivSession] = React.useState("");
  const [mal, setMal] = React.useState<string | null>(null);
  const [malSparar, setMalSparar] = React.useState(false);
  const [subagenter, setSubagenter] = React.useState<SubagentPost[]>([]);
  const [visaAgenter, setVisaAgenter] = React.useState(false);
  const [agenterLaddar, setAgenterLaddar] = React.useState(false);
  const [agenterFel, setAgenterFel] = React.useState("");
  const [arbetsytaInfo, setArbetsytaInfo] = React.useState<ArbetsytaInfo | null>(null);

  // ── VÅG 85 F1: MÅL-LÄGET — autonom utvecklingsloop ("live utveckling
  // som Z": dialog → Starta → gul badge "MÅL AKTIVT" + iterationsräknare
  // i headern, gul autonom banner ovanför chatten, varje iteration = en
  // KOMPLETT turn i chatten via mål-SSE-strömmen POST /api/studio/mal/stream). ──
  /** Den STORA mål-dialogen (textarea "Beskriv utvecklingsmålet…"). */
  const [malDialogOppen, setMalDialogOppen] = React.useState(false);
  const [malDialogText, setMalDialogText] = React.useState("");
  const [malStartar, setMalStartar] = React.useState(false);
  /** true = mål-strömmen SKA vara öppen (efter Starta tills rensa). */
  const [malStrömOppen, setMalStrömOppen] = React.useState(false);
  /** Transportens snapshot (mal_status-eventet) — badge/banner-tilståndet. */
  const [malStatus, setMalStatus] = React.useState<{ aktiv: boolean; pausad: boolean; iteration: number } | null>(null);
  /** VÅG 88 I3: mål-status som ref — reconnect-pollens takt läser färskt
   * värde vid varje omarming (aktivt mål ⇒ 15 s, annars 30 s). */
  const malStatusRef = React.useRef<{ aktiv: boolean; pausad: boolean; iteration: number } | null>(null);
  React.useEffect(() => {
    malStatusRef.current = malStatus;
  }, [malStatus]);
  /** Iterationsräknaren (SSE mal_iteration/mal_status). */
  const [malIteration, setMalIteration] = React.useState(0);
  const [malPausar, setMalPausar] = React.useState(false);
  /** Den PÅGÅENDE iterationens agentbubbla-id (huvudtabben). */
  const malBubblaRef = React.useRef<string | null>(null);
  /** Mål-strömmens AbortController. */
  const malAbortRef = React.useRef<AbortController | null>(null);
  /** Huvudtabbens id som ref — mål-effektens closures ser färskt värde. */
  const huvudTabbIdRef = React.useRef("tabb-huvud");

  // ── VÅG 83 B4: filträd + förhandsgranskning ──────────────────────────────
  const [visaFiler, setVisaFiler] = React.useState(false);
  const [trad, setTrad] = React.useState<TradNod[] | null>(null);
  const [tradLaddar, setTradLaddar] = React.useState(false);
  const [tradFel, setTradFel] = React.useState("");
  const [tradTrunkerad, setTradTrunkerad] = React.useState(false);
  const [arbetsytaNamn, setArbetsytaNamn] = React.useState("");
  const [oppnaMappar, setOppnaMappar] = React.useState<Set<string>>(new Set());
  const [filVisning, setFilVisning] = React.useState<FilVisning | null>(null);
  const [visningLaddar, setVisningLaddar] = React.useState(false);
  const [tommerUploads, setTommerUploads] = React.useState(false);

  // ── VÅG 84 D: agentens minne — Minne 🧠-panelen (drawer som filträdet) ──
  const [visaMinne, setVisaMinne] = React.useState(false);
  const [minneFiler, setMinneFiler] = React.useState<MinnePost[] | null>(null);
  const [minneLaddar, setMinneLaddar] = React.useState(false);
  const [minneFel, setMinneFel] = React.useState("");
  const [minneRotVisning, setMinneRotVisning] = React.useState("");
  const [minneVald, setMinneVald] = React.useState<MinnePost | null>(null);
  const [minneDetaljLaddar, setMinneDetaljLaddar] = React.useState(false);
  const [minneRedigerar, setMinneRedigerar] = React.useState(false);
  const [minneText, setMinneText] = React.useState("");
  const [minneSparar, setMinneSparar] = React.useState(false);
  const [minneRaderar, setMinneRaderar] = React.useState(false);
  const [minneNy, setMinneNy] = React.useState(false);
  const [minneNyttNamn, setMinneNyttNamn] = React.useState("");

  // ── VÅG 85 F2: Färdigheter ⚡ — skills/plugins/MCP (drawer som filträdet) ──
  const [visaFardigheter, setVisaFardigheter] = React.useState(false);
  const [fardigheterSkills, setFardigheterSkills] = React.useState<FardighetSkill[] | null>(null);
  const [fardigheterPlugins, setFardigheterPlugins] = React.useState<FardighetPlugin[] | null>(null);
  const [fardigheterMcp, setFardigheterMcp] = React.useState<FardighetMcp[] | null>(null);
  const [fardigheterVerktyg, setFardigheterVerktyg] = React.useState(0);
  const [fardigheterLaddar, setFardigheterLaddar] = React.useState(false);
  const [fardigheterFel, setFardigheterFel] = React.useState("");

  // ── VÅG 88 I2: Verktyg 🔧 — ADMIN-KOMMANDON (drawer som filträdet). Ytan +
  //    allt admin-state (variabler/priser, blogg-publicering, minne-navigering)
  //    ägs av studio-admin-panel.tsx — hit kommer endast öppna/stäng/navigera.
  const [visaAdmin, setVisaAdmin] = React.useState(false);

  // ── VÅG 83 B2: Z-portaLens — dialoger + läge/tankestyrka ─────────────────
  const [permission, setPermission] = React.useState<PermissionDialog | null>(null);
  const [fraga, setFraga] = React.useState<FragaDialog | null>(null);
  const [fragSvar, setFragSvar] = React.useState("");
  const [svarJobbar, setSvarJobbar] = React.useState(false);
  const [lage, setLage] = React.useState("");
  const [tanka, setTanka] = React.useState("");
  const [lageJobbar, setLageJobbar] = React.useState(false);

  // ── VÅG 84 C: minnesregler + långkörningsnotiser ─────────────────────────
  /** "alltid tillåt"-regler (localStorage ak1a-studio-regler). */
  const [regler, setRegler] = React.useState<PermissionRegel[]>([]);
  /** Regler som ref — auto-godkännandet läser färskt värde mitt i ström. */
  const reglerRef = React.useRef<PermissionRegel[]>([]);
  /** Hanteringspanelen (lista regler + ta bort). */
  const [visaRegler, setVisaRegler] = React.useState(false);
  /** Web Notification-rättigheten ("default"|"granted"|"denied"|"stöds ej"). */
  const [notisRattighet, setNotisRattighet] = React.useState("default");
  /** Turnens start (ms) — null när ingen turn pågår. */
  const turnStartRef = React.useRef<number | null>(null);
  /** True när långkörningsnotisen gått ut (styrräknare). */
  const turnNotiseradRef = React.useRef(false);
  /** Senaste turnens tokenantal (klart-notisens "✓ Klar (N tkn)"). */
  const turnTknRef = React.useRef<number | null>(null);
  /** Titelväxlarens interval-id (null = ingen växling pågår). */
  const titleVaxlingRef = React.useRef<number | null>(null);
  /** Dokumentets ordinarie titel (återställs när turnen klart). */
  const grundTitelRef = React.useRef<string | null>(null);

  // ── VÅG 86 G6: NOTISHISTORIK + SNABBMENY — paneler + genvägs-overlay ──────
  /** Notishistoriken (localStorage ak1a-studio-notiser, sista 50). */
  const [notiser, setNotiser] = React.useState<NotisPost[]>([]);
  /** Notispanelen — drawer i filträdets stil (🔔-knappen). */
  const [visaNotiser, setVisaNotiser] = React.useState(false);
  /** Tangentbordsgenvägs-översikten ("?"-tangenten). */
  const [visaGenvagar, setVisaGenvagar] = React.useState(false);
  /** Mobil-kebabmenyn (⋮) — export-knapparna bor där under sm. */
  const [kebabOppen, setKebabOppen] = React.useState(false);

  // ── VÅG 88 I1: MENY-KONSOLIDERING — ⚙️ Inställningar-drawer ────────────────
  /** Inställnings-drawern (modell/läge/tankestyrka/tema i LISTA-form —
   *  headerns scroll-rad med 3 dropdowns + tema-knapp är borttagen). */
  const [installningarOppen, setInstallningarOppen] = React.useState(false);

  // ── VÅG 84 A: VISUELL Z-PARITET — tema + palett + sök + auto-scroll ──────
  /** Tema: "dark"-klass på ROTELEMENTET (localStorage "studio-tema"). SSR
   *  startar ljus (ingen hydrationsskillnad) — persistens läses i effect. */
  const [morkLage, setMorkLage] = React.useState(false);
  /** Kommandopalett (Ctrl/Cmd+K) — sök + ↑↓ + Enter. */
  const [palettOppen, setPalettOppen] = React.useState(false);
  const [palettFras, setPalettFras] = React.useState("");
  const [palettIndex, setPalettIndex] = React.useState(0);
  /** Meddelandesökning — highlight + räknare + pilnavigering. */
  const [sokOppen, setSokOppen] = React.useState(false);
  const [sokFras, setSokFras] = React.useState("");
  const [sokIndex, setSokIndex] = React.useState(0);
  /** Auto-scroll: användaren vid botten? + olästa sedan uppscrollning. */
  const [vidBotten, setVidBotten] = React.useState(true);
  const [nyaSedanUpp, setNyaSedanUpp] = React.useState(0);

  // ── VÅG 87 H1: ÅTERKOPPLING — borta-banner + server-arbetar-synk ──────────
  /** "Agenten har arbetat medan du var borta"-banner (nya assistant-svar). */
  const [bortaBanner, setBortaBanner] = React.useState<{
    antalTurner: number;
    sessionId: string | null;
    malKorer: boolean;
  } | null>(null);
  /** Sessioner där SERVERN arbetar men den lokala SSE-strömmen är borta. */
  const serverSynkRef = React.useRef<Set<string>>(new Set());

  // ── VÅG 86 G1/G2: SKRIVFÄLTETS MINNE — slash-autocomplete + bibliotek ────
  /** G1: Esc stänger slash-dropdownen tills frasen ändras (true = stängd). */
  const [slashStangd, setSlashStangd] = React.useState(false);
  /** G1: markerad rad i slash-dropdownen (↑↓ navigerar, Enter kör, Tab fyller). */
  const [slashIndex, setSlashIndex] = React.useState(0);
  /** G2: promptbiblioteket ⭐ (localStorage ak1a-studio-prompter) + dropdown. */
  const [prompter, setPrompter] = React.useState<SparadPrompt[]>(() => lasPrompter());
  const [prompterOppen, setPrompterOppen] = React.useState(false);
  /** G2: prompthistoriken (localStorage, sista 50) — pil-upp i tomt fält bläddrar. */
  const [promptHistorik, setPromptHistorik] = React.useState<string[]>(() => lasPromptHistorik());

  const sokInputRef = React.useRef<HTMLInputElement | null>(null);
  const palettInputRef = React.useRef<HTMLInputElement | null>(null);
  const vidBottenRef = React.useRef(true);
  const foreLangdRef = React.useRef(0);
  /** Element-refs per meddelande — sökträffar scrollas fram (block:center). */
  const meddelandeRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  /** Element-refs per palettrad — tangentnavigering scrollar fram vald rad. */
  const palettRadRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  /** G1: element-refs per slash-rad — vald rad scrollas fram (block:nearest). */
  const slashRadRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  /** G2: var i historiken bläddringen står (null = ej i bläddringsläge). */
  const historikIndexRef = React.useRef<number | null>(null);
  /** G2: fältets innehåll innan historikbläddringen (återställs vid pil-ner-på-sista). */
  const historikUtkastRef = React.useRef("");

  const blattraRef = React.useRef<HTMLDivElement | null>(null);
  const ytaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const filInputRef = React.useRef<HTMLInputElement | null>(null);
  const mappInputRef = React.useRef<HTMLInputElement | null>(null);
  /** V84 B: en AbortController per TABB (stäng tabb = abort ⇒ session/stop). */
  const tabbAbortRef = React.useRef<Map<string, AbortController>>(new Map());
  /** V84 B: aktiv tabb som ref — ström-closures läser färskt värde. */
  const aktivTabbIdRef = React.useRef("tabb-huvud");
  /** V84 B: senaste tabbar+aktiv för beforeunload-spolning. */
  const tabbarRef = React.useRef<{ tabbar: Tabb[]; aktivTabbId: string }>({ tabbar: [], aktivTabbId: "tabb-huvud" });
  /** V84 B: throttle-mätare för sessionStorage-sparningen. */
  const senasteSparaRef = React.useRef(0);
  const sparaTimerRef = React.useRef<number | null>(null);

  // ── V84 B: TABB-MUTERING + HÄRLEDDA VY-VÄRDEN ─────────────────────────────
  /** Rör en tabb funktionellt — strömmar skriver ofta, även i bakgrunden. */
  const rörTabb = React.useCallback((id: string, rör: (t: Tabb) => Tabb) => {
    setTabbar((alla) => alla.map((t) => (t.id === id ? rör(t) : t)));
  }, []);

  /** Aktiv + huvudtabb (huvud = default-transportens tabb). */
  const aktivTabb = tabbar.find((t) => t.id === aktivTabbId) ?? tabbar[0];
  const huvudTabb = tabbar.find((t) => t.huvud) ?? tabbar[0];
  /** Härledda vy-värden — JSX:ets gamla namn (meddelanden, strömmar, …) lever kvar. */
  const meddelanden = aktivTabb?.meddelanden ?? [];
  const strömmar = aktivTabb?.strömmar ?? false;
  const tankar = aktivTabb?.tankar ?? "";
  const kontext = aktivTabb?.kontext ?? null;
  const rundaTkn = aktivTabb?.rundaTkn ?? null;
  const ackumulerat = aktivTabb?.ackumulerat ?? 0;
  /** Huvudtabbens ström (header-kontroller vakar på DEFAULT-transporten). */
  const strömmarHuvud = huvudTabb?.strömmar ?? false;
  /** NÅGON tabb strömmar — långkörningsnotisen + titelväxlingens villkor. */
  const nagotStrömmar = tabbar.some((t) => t.strömmar);
  /** Den aktiva tabben är huvudtabben (kontroller som styr default-sessionen). */
  const arHuvudAktiv = Boolean(aktivTabb?.huvud);
  // ── VÅG 86 G5: CHECKPOINT/REWIND — turnIndex per agentbubbla ───────────────
  // Protokollets räkning (vendor/zcode.cjs fn e8i, LIVE-sond v86-g5-forksond):
  // user-meddelanden räknar upp turnen (0-baserad); en agentbubbla tillhör
  // den SENASTE user-posten framför den. Kartan är serverns spegelbild —
  // samma sekvens renderas som session/messages returnerar (historik + nya
  // turner i ankomstordning), så turnIndex stämmer med session/fork.
  const turnIndexKarta = React.useMemo(() => {
    const karta = new Map<string, number>();
    let turn = -1;
    for (const m of meddelanden) {
      if (m.roll === "user") turn += 1;
      else karta.set(m.id, turn);
    }
    return karta;
  }, [meddelanden]);
  // ── VÅG 85 F1: mål-lägets härledda vy-värden ─────────────────────────────
  /** Mål-loopen KÖR (badge pulserar + bannern visas). */
  const malKör = mal !== null && malStatus?.aktiv === true && !malStatus.pausad;
  /** Målet finns men är pausat (raden visar Återuppta). */
  const malPausat = mal !== null && malStatus !== null && !malStatus.aktiv;

  // Ref-synk: ström-closures (skicka) + beforeunload ser färskt aktiv-tabbar.
  // VÅG 85 F1: huvudtabbens id som ref — mål-strömmens iterationer landar
  // ALLTID i huvudtabben (målet äger default-sessionen) oavsett aktiv tabb.
  React.useEffect(() => {
    aktivTabbIdRef.current = aktivTabbId;
    tabbarRef.current = { tabbar, aktivTabbId };
    huvudTabbIdRef.current = tabbar.find((t) => t.huvud)?.id ?? "tabb-huvud";
  }, [aktivTabbId, tabbar]);

  /** Bekräftelse-toast — försvinner av sig själv efter 4,5 s. */
  const visaToast = React.useCallback((text: string, ton: "guld" | "fel" = "guld") => {
    setToast({ text, ton });
    window.setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 4_500);
  }, []);

  // ── V84 A1: TEMA — läs persistens, växla med knapp eller tangent T ──────
  React.useEffect(() => {
    try {
      if (window.localStorage.getItem("studio-tema") === "mörk") setMorkLage(true);
    } catch {
      // privat läge m.fl. — temat blir ljus, allt fungerar
    }
  }, []);

  const vaxlaTema = React.useCallback(() => {
    setMorkLage((nu) => {
      const ny = !nu;
      try {
        window.localStorage.setItem("studio-tema", ny ? "mörk" : "ljus");
      } catch {
        // sparning är lyx — växlingen lever i state
      }
      return ny;
    });
  }, []);

  // ── VÅG 84 C: regler ur localStorage + notisrättighet + ref-synk ─────────

  // Uppstart: läs "alltid tillåt"-reglerna + notisrättighetens nuläge.
  React.useEffect(() => {
    const lista = lasReglerUrLagring();
    reglerRef.current = lista; // ref direkt — auto-godkännandet ser reglerna samma tick
    setRegler(lista);
    setNotisRattighet(typeof Notification === "undefined" ? "stöds ej" : Notification.permission);
  }, []);

  // Reglerna hålls även i ref — mottagenPermission läser färskt värde mitt
  // i en pågående ström (state-closure blir annars gammal).
  React.useEffect(() => {
    reglerRef.current = regler;
  }, [regler]);

  // ── VÅG 86 G6: NOTISHISTORIK — läs upp + appenda varje skickad notis ──────
  React.useEffect(() => {
    setNotiser(lasNotiserUrLagring());
  }, []);

  /**
   * Appenda en notis till historiken (state + localStorage, längst till 50).
   * Anropas VARJE GÅNG en Web Notification skickas (⏳ >60 s, ✓ Klar) samt
   * när en ström felar (typ "fel" — historiken samlar även utan OS-notis).
   */
  const loggaNotis = React.useCallback((text: string, typ: NotisPost["typ"]) => {
    setNotiser((gamla) => {
      const nya = [...gamla, { text, typ, tid: Date.now() }].slice(-MAX_NOTISER);
      try {
        window.localStorage.setItem(NOTIS_LAGRING, JSON.stringify(nya));
      } catch {
        // privat läge — historiken lever bara i state
      }
      return nya;
    });
  }, []);

  /** V86 G6: Töm notishistoriken (state + localStorage). */
  const tomNotiser = React.useCallback(() => {
    setNotiser([]);
    try {
      window.localStorage.removeItem(NOTIS_LAGRING);
    } catch {
      // tyst
    }
  }, []);

  /** V86 G6: Öppna notispanelen (stänger övriga drawers först — som Filer). */
  const oppnaNotiser = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaFardigheter(false);
    setVisaMinne(false);
    setInstallningarOppen(false); // VÅG 88 I1: ömsesidig stängning
    setVisaAdmin(false); // VÅG 88 I2: ömsesidig stängning
    setVisaNotiser(true);
  }, []);

  /** VÅG 88 I1: Öppna Inställningar-drawern (stänger övriga drawers först). */
  const oppnaInstallningar = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaFardigheter(false);
    setVisaMinne(false);
    setVisaNotiser(false);
    setVisaAdmin(false); // VÅG 88 I2: ömsesidig stängning
    setInstallningarOppen(true);
  }, []);

  /** V84 C: be om notisrättigheten (klockknappen i verktygsraden). */
  const begraNotisRattighet = React.useCallback(async () => {
    if (typeof Notification === "undefined") {
      visaToast("Webbläsaren saknar stöd för notiser.", "fel");
      return;
    }
    if (Notification.permission === "granted") {
      visaToast("Notiser är redan påslagna — långa rundor (>60 s) pingar dig.");
      return;
    }
    if (Notification.permission === "denied") {
      visaToast("Notiser är blockerade — tillåt ak1nvestor.com i webbläsarens inställningar.", "fel");
      return;
    }
    try {
      const svar = await Notification.requestPermission();
      setNotisRattighet(svar);
      visaToast(
        svar === "granted"
          ? "Notiser på — du får veta när agenten arbetat över 60 s och när den är klar."
          : "Inga notiser — titelväxlingen fungerar ändå.",
      );
    } catch {
      visaToast("Notisrättigheten kunde ej begäras.", "fel");
    }
  }, [visaToast]);

  /**
   * V84 C: LÅNGKÖRNINGSVAKT — medan en turn strömmar: efter 60 s ⇒ Web
   * Notification (om tillåtet) + titelväxling "⏳ Agenten arbetar…" var
   * 1,5 s. Cleanup (turnen klart/avbruten/unmount): stoppa växlingen,
   * återställ titeln och — OM notisen gått ut — "✓ Klar (N tkn)".
   * V84 B: vakten lyssnar på NÅGON tabb (agenten arbetar även i bakgrunden).
   */
  React.useEffect(() => {
    if (!nagotStrömmar) return;
    turnStartRef.current = Date.now();
    turnNotiseradRef.current = false;
    turnTknRef.current = null;
    grundTitelRef.current = document.title;
    const vakt = window.setInterval(() => {
      const start = turnStartRef.current;
      if (!start || turnNotiseradRef.current) return;
      if (Date.now() - start < TURN_NOTIS_TRAOSKEL_MS) return;
      turnNotiseradRef.current = true;
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification("⏳ Agenten arbetar…", {
            body: "Rundan har pågått över 60 sekunder — studion fortsätter själv. Du kan lämna fliken öppen.",
            tag: "ak1a-studio-turn",
          });
          loggaNotis("Agenten arbetar… (rundan >60 s)", "lang"); // V86 G6
        } catch {
          // vissa plattformar kräver ServiceWorker-registrering — tyst
        }
      }
      if (titleVaxlingRef.current === null) {
        const grund = grundTitelRef.current ?? "AK1A Studio";
        let visaVaxel = false;
        titleVaxlingRef.current = window.setInterval(() => {
          visaVaxel = !visaVaxel;
          document.title = visaVaxel ? "⏳ Agenten arbetar…" : grund;
        }, 1_500);
      }
    }, 2_000);
    return () => {
      window.clearInterval(vakt);
      const start = turnStartRef.current;
      turnStartRef.current = null;
      if (titleVaxlingRef.current !== null) {
        window.clearInterval(titleVaxlingRef.current);
        titleVaxlingRef.current = null;
      }
      if (grundTitelRef.current !== null) document.title = grundTitelRef.current;
      const antal = turnTknRef.current;
      const paminerad = turnNotiseradRef.current;
      turnNotiseradRef.current = false;
      if (start !== null && paminerad && typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(`✓ Klar${typeof antal === "number" ? ` (${tkn(antal)} tkn)` : ""}`, {
            body: "Agenten är klar — öppna studion för att läsa svaret.",
            tag: "ak1a-studio-turn",
          });
          loggaNotis(`Klar${typeof antal === "number" ? ` (${tkn(antal)} tkn)` : ""}`, "klar"); // V86 G6
        } catch {
          // tyst
        }
      }
    };
  }, [nagotStrömmar, loggaNotis]);

  // ── V84 B: TABBHANTERING — ny tabb, växla, stäng (confirm vid arbete) ────
  // TAK: 8 tabbar (servern = 1 Next-process + N zcode-barnprocesser; RAM-
  // taket på Contabo är 8 GB — beviset i STYRELSE-ADMIN-MEGA våg 84 block B).
  const MAX_TABBAR = 8;

  /** [+] — ny egen tabb (frisk session föds vid första prompten via nyckel). */
  const nyTabb = () => {
    if (tabbar.length >= MAX_TABBAR) {
      visaToast(`Max ${MAX_TABBAR} tabbar — stäng en först (serverns RAM-tak).`, "fel");
      return;
    }
    const ny: Tabb = { id: nyttId(), huvud: false, sessionId: null, titel: "Ny tabb", ...tabbGrund() };
    setTabbar((alla) => [...alla, ny]);
    setAktivTabbId(ny.id);
    setPrompt("");
    ytaRef.current?.focus();
  };

  /** Växla aktiv tabb — vyn byter buffert, utkastet följer med, scrolla ner. */
  const valjTabb = (id: string) => {
    if (id === aktivTabbId) return;
    const t = tabbar.find((x) => x.id === id);
    if (!t) return;
    setAktivTabbId(id);
    setPrompt(t.utkast);
    requestAnimationFrame(() => {
      const yta = blattraRef.current;
      // VÅG 87 H4 4: instant — tabbytet skall visa botten direkt.
      if (yta) yta.scrollTo({ top: yta.scrollHeight, behavior: "instant" as ScrollBehavior });
    });
  };

  /**
   * Stäng tabb — pågående arbete ⇒ confirm "Agenten arbetar — avbryta?"
   * (ja = abort ⇒ req.signal ⇒ session/stop på servern; nej = stanna kvar).
   * Sista tabben stängd ⇒ en frisk huvudtabb föds.
   */
  const stangTabb = (id: string) => {
    const t = tabbar.find((x) => x.id === id);
    if (!t) return;
    if (t.strömmar && !window.confirm("Agenten arbetar — avbryta?")) return;
    tabbAbortRef.current.get(id)?.abort(); // ärligt avbrott (session/stop)
    tabbAbortRef.current.delete(id);
    const kvar = tabbar.filter((x) => x.id !== id);
    if (kvar.length === 0) {
      const ny: Tabb = { id: nyttId(), huvud: true, sessionId: null, titel: "Huvudsession", ...tabbGrund() };
      setTabbar([ny]);
      setAktivTabbId(ny.id);
      setPrompt("");
      return;
    }
    setTabbar(kvar);
    if (aktivTabbId === id) {
      setAktivTabbId(kvar[0].id);
      setPrompt(kvar[0].utkast);
    }
  };

  /**
   * Öppna session ur listan i en NY TABB (resume — block B: "sessionslistan
   * används för att resume tidigare sessioner i nya tabbar"). Redan öppen ⇒
   * växla bara. Sidoloadseffekten hämtar historiken (GET ?sessionId=).
   */
  const oppnaITabb = (sessionId: string, titel?: string) => {
    sparaSenasteSessionId(sessionId); // VÅG 87 H1: öppnad session = nya pekaren
    const befintlig = tabbar.find((t) => t.sessionId === sessionId);
    if (befintlig) {
      valjTabb(befintlig.id);
      setVisaSessioner(false);
      return;
    }
    if (tabbar.length >= MAX_TABBAR) {
      visaToast(`Max ${MAX_TABBAR} tabbar — stäng en först (serverns RAM-tak).`, "fel");
      return;
    }
    const ny: Tabb = {
      id: nyttId(),
      huvud: false,
      sessionId,
      titel: titel && titel.trim() ? kortNamn(titel) : `Session ${sessionId.slice(5, 13)}`,
      ...tabbGrund(),
    };
    setTabbar((alla) => [...alla, ny]);
    setAktivTabbId(ny.id);
    setPrompt("");
    setVisaSessioner(false);
  };

  // ── V84 B: PERSISTENS — tabbar + buffert i sessionStorage ─────────────────
  // (överlever refresh; strömmar nollställs ärligt — en avbruten ström kan ej
  // fortsätta i en ny sidad). Throtclad till ~1,5 s + spolning vid unload.
  React.useEffect(() => {
    const spara = () => {
      senasteSparaRef.current = Date.now();
      sparaTabbar(tabbar, aktivTabbId);
    };
    if (Date.now() - senasteSparaRef.current > 1_500) {
      spara();
      return;
    }
    if (sparaTimerRef.current !== null) return;
    sparaTimerRef.current = window.setTimeout(() => {
      sparaTimerRef.current = null;
      spara();
    }, 1_500);
    return () => {
      if (sparaTimerRef.current !== null) {
        window.clearTimeout(sparaTimerRef.current);
        sparaTimerRef.current = null;
      }
    };
  }, [tabbar, aktivTabbId]);

  React.useEffect(() => {
    const vidStang = () => sparaTabbar(tabbarRef.current.tabbar, tabbarRef.current.aktivTabbId);
    window.addEventListener("beforeunload", vidStang);
    return () => window.removeEventListener("beforeunload", vidStang);
  }, []);

  // Composer-utkastet följer den aktiva tabben (per-tabb draft).
  React.useEffect(() => {
    if (!aktivTabb || aktivTabb.utkast === prompt) return;
    rörTabb(aktivTabb.id, (t) => ({ ...t, utkast: prompt }));
    // avsiktligt smal dep: endast prompt — tabbyte sätter prompt separat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  // VÅG 86 G3: höjdpassa skrivytan (1–8 rader) — onChange sköter tangent-
  // trycken; denna effekt fångar ÄVEN programmatiska setPrompt (send-
  // tömning, tabbyte, bild-chip-infogning) som onChange aldrig ser.
  React.useEffect(() => {
    hojdpassaYta(ytaRef.current);
  }, [prompt]);

  // ── VÅG 84 C: permission-svar + minnesregler + auto-godkännande ──────────
  // (Ligger FÖRE uppstartseffekten — dess deps refererar mottagenPermission.)

  /**
   * Skicka permission-svar till bryggan (POST /api/studio/interaktion) —
   * delad väg för knappen OCH auto-godkännandet (regler). tyst = ingen
   * framgångs-toast (auto-fallet har sin egen notis i flödet); FEL tostar
   * alltid (t.ex. 409 = redan besvarad/eskalerad).
   */
  const skickaPermissionSvar = React.useCallback(
    async (requestId: string, alternativId: string, tyst = false) => {
      try {
        const res = await fetch("/api/studio/interaktion", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ typ: "permission", requestId, alternativ: alternativId }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; beslut?: string; fel?: string };
        // Stäng kortet oavsett — 409 = redan besvarad/eskalerad.
        setPermission((p) => (p?.requestId === requestId ? null : p));
        if (res.ok && data.ok) {
          if (!tyst) visaToast(`Verktyget ${data.beslut ?? "besvarat"}`);
        } else {
          visaToast(data.fel || "Begäran var redan besvarad (30 s-gränsen).", "fel");
        }
      } catch {
        visaToast("Nätverksfel — svaret gick ej fram.", "fel");
      }
    },
    [visaToast],
  );

  /** Svara permission-dialog (POST /api/studio/interaktion typ permission). */
  const svaraPermission = React.useCallback(
    async (requestId: string, alternativId: string) => {
      if (svarJobbar) return;
      setSvarJobbar(true);
      try {
        await skickaPermissionSvar(requestId, alternativId);
      } finally {
        setSvarJobbar(false);
      }
    },
    [svarJobbar, skickaPermissionSvar],
  );

  /**
   * V84 C: Spara en "alltid tillåt"-regel (localStorage ak1a-studio-regler)
   * — dedupe på verktygsnamnet (skiftlägesokänsligt). Ref:en är sannings-
   * källan (uppdateras direkt) så returvärdet är sant endast när regeln
   * VERKLIGEN lades till och spårningar i snabb följd inte dubbellagrar.
   */
  const sparaRegel = React.useCallback((verktyg: string): boolean => {
    const namn = verktyg.trim();
    if (!namn) return false;
    if (reglerRef.current.some((r) => r.verktyg.toLowerCase() === namn.toLowerCase())) return false;
    const nya = [...reglerRef.current, { verktyg: namn, omfattning: "alltid" as const, skapad: Date.now() }];
    reglerRef.current = nya;
    setRegler(nya);
    try {
      window.localStorage.setItem(REGEL_NYCKEL, JSON.stringify(nya));
    } catch {
      // privat läge/utrymme — regeln lever bara denna session
    }
    return true;
  }, []);

  /** V84 C: Ta bort en regel (state + ref + localStorage). */
  const tabortRegel = React.useCallback((verktyg: string) => {
    const nya = reglerRef.current.filter((r) => r.verktyg !== verktyg);
    reglerRef.current = nya;
    setRegler(nya);
    try {
      window.localStorage.setItem(REGEL_NYCKEL, JSON.stringify(nya));
    } catch {
      // se sparaRegel
    }
  }, []);

  /**
   * V84 C: en permission anlände (SSE eller sidload) — matchar en
   * "alltid tillåt"-regel ⇒ AUTO-GODKÄNN (allow_once) + liten notis i
   * flödet; annars visas dialogen. Läser reglerna ur ref:en så ett beslut
   * mitt i en ström ser färskt register (setState i callback är för sent).
   */
  const mottagenPermission = React.useCallback(
    (p: PermissionDialog) => {
      const match = reglerRef.current.find((r) => r.verktyg.toLowerCase() === p.verktyg.toLowerCase());
      if (match) {
        // V84 B: notisen landar i den AKTIVA tabben (permission-dialogerna är
        // globala — svaret går till rätt transport oavsett tabb).
        rörTabb(aktivTabbIdRef.current, (t) => ({
          ...t,
          meddelanden: [
            ...t.meddelanden,
            {
              id: nyttId(),
              roll: "assistant" as const,
              text: `🛡 **${p.verktyg}** auto-godkänd enligt din regel (_alltid tillåt_${p.diff ? ` · diff: +${p.diff.plus}/−${p.diff.minus}` : ""}) — hantera regler via verktygsraden.`,
            },
          ],
        }));
        void skickaPermissionSvar(p.requestId, "allow_once", true);
        return;
      }
      setPermission(p);
    },
    [skickaPermissionSvar, rörTabb],
  );

  /**
   * Uppdatera sessionlistan (GET /api/studio/session) — v83 B3: bär även
   * aktiv session, målet (session/goal) och workspaceinfo (readState).
   */
  const lasSessioner = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/session", { headers: adminHeaders() });
      if (res.ok) {
        const data = (await res.json()) as {
          sessioner?: SessionPost[];
          aktiv?: string | null;
          mal?: { mal: string | null; meddelande: string; aktiv?: boolean } | null;
          arbetsyta?: ArbetsytaInfo | null;
        };
        if (data.sessioner) setSessioner(data.sessioner);
        if (typeof data.aktiv === "string") setAktivSession(data.aktiv);
        if (data.mal) {
          setMal(data.mal.mal);
          // VÅG 85 F1: ett LEVANDE mål efter refresh ⇒ mål-strömmen öppnas
          // (iterationerna fortsätter renderas; sonden på servern åter-
          // aktiverar transportens mål-läge efter pm2-omstart).
          if (data.mal.mal) {
            setMalStrömOppen(true);
            if (typeof data.mal.aktiv === "boolean") {
              setMalStatus((s) => (s ? s : { aktiv: data.mal!.aktiv === true, pausad: false, iteration: 0 }));
            }
          }
        }
        if (data.arbetsyta) setArbetsytaInfo(data.arbetsyta);
      }
    } catch {
      // listan är lyx
    }
  }, []);

  /** Uppdatera modellistan + aktuell modell (GET /api/studio/modeller). */
  const lasModeller = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/modeller", { headers: adminHeaders() });
      if (res.ok) {
        const data = (await res.json()) as { modeller?: ModellPost[]; standard?: string; vald?: string };
        if (data.modeller) setModeller(data.modeller);
        setValdModell(data.vald ?? data.standard ?? "");
      }
    } catch {
      // modellistan är lyx i dev (mock) — livsviktig på prod
    }
  }, []);

  // ── V84 A3: AUTO-SCROLL — bara när användaren VILJEFRIA är vid botten.
  // Ref = sanning under snabba scroll-event; state = knappens synlighet.
  const paScrollChatt = React.useCallback(() => {
    const yta = blattraRef.current;
    if (!yta) return;
    const nuVid = yta.scrollHeight - yta.scrollTop - yta.clientHeight < 90;
    vidBottenRef.current = nuVid;
    setVidBotten((nu) => (nu === nuVid ? nu : nuVid));
  }, []);

  React.useEffect(() => {
    const yta = blattraRef.current;
    if (!yta) return;
    // VÅG 87 H4 4: chattytan har CSS scroll-behavior:smooth — strömmens
    // delta-scrollar tvingas "instant" så varje delta landar direkt
    // (mjukheten syns bara där den hör hemma: ↓ Nytt-knappen m.fl.).
    if (vidBottenRef.current) {
      yta.scrollTo({ top: yta.scrollHeight, behavior: "instant" as ScrollBehavior });
    }
  }, [meddelanden, tankar, statusText, permission, fraga]);

  // Olästa meddelanden sedan användaren lämnade botten ("↓ Nytt"-badgen).
  React.useEffect(() => {
    const nu = meddelanden.length;
    const skillnad = nu - foreLangdRef.current;
    foreLangdRef.current = nu;
    if (skillnad > 0 && !vidBottenRef.current) {
      setNyaSedanUpp((n) => n + skillnad);
    } else if (vidBottenRef.current && skillnad !== 0) {
      setNyaSedanUpp(0);
    }
  }, [meddelanden.length]);

  /** "↓ Nytt"-klick: hoppa ner mjukt + återuppta autoscroll. */
  const hoppaNerChatt = React.useCallback(() => {
    const yta = blattraRef.current;
    if (yta) yta.scrollTo({ top: yta.scrollHeight, behavior: "smooth" });
    vidBottenRef.current = true;
    setVidBotten(true);
    setNyaSedanUpp(0);
  }, []);

  // Uppstart: ÅTERSTÄLL TABBAR + status + historik + kontext + modeller +
  // sessioner + uploads. V84 B: tabbar ur sessionStorage hydreras FÖRST
  // (synkront i denna effekt) så historiken landar i RÄTT tabb — huvudtabben
  // får default-sessionens historik; egna tabbar hämtar sin via
  // sidoloadseffekten (GET ?sessionId=) när de är aktiva/tomma.
  React.useEffect(() => {
    let levande = true;
    // ── V84 B: hydrera sparade tabbar (sessionStorage → state) ──
    const sparad = lasTabbar();
    if (sparad) {
      setTabbar(sparad.tabbar);
      setAktivTabbId(sparad.aktivTabbId);
      aktivTabbIdRef.current = sparad.aktivTabbId;
      const aktiv = sparad.tabbar.find((t) => t.id === sparad.aktivTabbId) ?? sparad.tabbar[0];
      setPrompt(aktiv?.utkast ?? "");
    }
    const malTabbId = sparad
      ? (sparad.tabbar.find((t) => t.id === sparad.aktivTabbId) ?? sparad.tabbar[0]).id
      : "tabb-huvud";
    const malArHuvud = sparad
      ? (sparad.tabbar.find((t) => t.id === malTabbId) ?? sparad.tabbar[0]).huvud
      : true;
    const huvudId = sparad ? (sparad.tabbar.find((t) => t.huvud) ?? sparad.tabbar[0]).id : "tabb-huvud";
    (async () => {
      try {
        const res = await fetch("/api/studio/stream", { headers: adminHeaders() });
        if (res.ok) {
          const data = (await res.json()) as {
            transport?: string;
            live?: boolean;
            sessionId?: string | null;
            historik?: { roll: "user" | "assistant"; text: string }[];
            kontext?: KontextInfo | null;
            // ── VÅG 87 H1: återkopplingen (GET utan sessionId bär nu den
            // senast aktiva sessionen + hela dess historik + mål-snapshot). ──
            senastAktivSessionId?: string | null;
            senastAktivHistorik?: { roll: "user" | "assistant"; text: string }[];
            aktivtMal?: { aktiv: boolean; pausad: boolean; iteration: number; mal: string | null } | null;
            interaktioner?: (
              | {
                  typ: "permission";
                  requestId: string;
                  verktyg: string;
                  risk: string;
                  skäl?: string;
                  sammanfattning: string;
                  alternativ: PermissionAlternativ[];
                  /** V84 C: diff-förhandsvisning (Write/Edit/MultiEdit). */
                  diff?: Filandring;
                }
              | { typ: "fråga"; requestId: string; fråga: string; inputTyp?: string; val?: string[] }
            )[];
          };
          if (!levande) return;
          setLive(data.live ? (data.transport === "mock" ? "demo" : "live") : "ned");
          setStatusText(data.live ? (data.transport === "mock" ? "Demo-läge (mock-transport)" : "Sessionen lever") : "Agenten kunde ej nås");
          // Historik/kontext tillhör DEFAULT-sessionen — ENDAST huvudtabben
          // (egna tabbar fylls av sidoloadseffekten per session, se nedan).
          if (malArHuvud && data.historik?.length) {
            rörTabb(malTabbId, (t) => ({
              ...t,
              meddelanden: data.historik!.map((h) => ({ id: nyttId(), roll: h.roll, text: h.text })),
            }));
          }
          if (data.kontext) {
            if (malArHuvud) {
              rörTabb(malTabbId, (t) => ({
                ...t,
                kontext: data.kontext ?? null,
                ackumulerat:
                  typeof data.kontext?.totalTokenCount === "number" ? data.kontext.totalTokenCount : t.ackumulerat,
              }));
            }
            // V83 B2: läge + tankestyrka ur sessionens projektion/snapshot —
            // växlarna startar på protokollets sanning (fallback build/av).
            setLage(data.kontext.lage ?? "build");
            setTanka(data.kontext.tankeNiva ?? "");
          }
          // V83 B2: väntande dialoger efter t.ex. en siduppdatering mitt i
          // en permission-väntan — kortet återkommer direkt. V84 C: reglerna
          // får först titta (auto-godkännande innan dialogen ens syns).
          for (const i of data.interaktioner ?? []) {
            if (i.typ === "permission") {
              mottagenPermission({
                requestId: i.requestId,
                verktyg: i.verktyg,
                risk: i.risk,
                skäl: i.skäl,
                sammanfattning: i.sammanfattning,
                alternativ: i.alternativ ?? [],
                diff: i.diff,
              });
            } else {
              setFraga({ requestId: i.requestId, fråga: i.fråga, inputTyp: i.inputTyp, val: i.val });
              setFragSvar("");
            }
          }
          // ── VÅG 87 H1: ÅTERKOPPLING — auto-ladda senast aktiva session ──
          // Servern + barnprocessen fortsatte arbeta under frånvaron; GET
          // bär den senast aktiva sessionen + HELA dess historik + mål-
          // snapshot. localStorage-pekaren är PRIORITERAD kandidat när den
          // matchar serverns senast aktiva (annars vinner serverns sanning).
          const aktivtMal = data.aktivtMal ?? null;
          if (aktivtMal) {
            setMal(aktivtMal.mal);
            setMalStatus({ aktiv: aktivtMal.aktiv, pausad: aktivtMal.pausad, iteration: aktivtMal.iteration });
            setMalIteration(aktivtMal.iteration);
            // Ett LEVANDE mål ⇒ mål-strömmen öppnas direkt (iterationerna
            // fortsätter renderas; sonden på servern självläker pm2-omstart).
            if (aktivtMal.mal) setMalStrömOppen(true);
          }
          const senastAktivSessionId =
            typeof data.senastAktivSessionId === "string" && data.senastAktivSessionId ? data.senastAktivSessionId : null;
          const senastAktivHistorik = Array.isArray(data.senastAktivHistorik) ? data.senastAktivHistorik : [];
          const sparadSid = lasSenasteSessionId();
          const kandidat = sparadSid && sparadSid === senastAktivSessionId ? sparadSid : senastAktivSessionId;
          // ── VÅG 88 I3: INDEXEDDB-JÄMFÖRELSE — localStorage pekar på en
          // session OCH GET svarade ⇒ jämför antal meddelanden mot IndexedDB-
          // cachen (CACHE-META först — snabb lookup, IndexedDB öppnas bara
          // när metan pekar på samma session). Cachen har FLER ⇒ agenten
          // svarade medan vi var borta och serverns spegel är kortare (GET:s
          // historik-hämtning misslyckades där) ⇒ den CACHADE versionen
          // används + toast "visar cachad historik" (ALDRIG tyst byte).
          // Jämförelsen sker mot listan GET:s historik tillhör: default-
          // sessionens historik (data.historik) eller senast-aktivas spegel.
          let aktivHistorik = senastAktivHistorik;
          let cacheTrumfar = false;
          if (levande && sparadSid && sparadSid === kandidat) {
            const meta = lasHistorikMeta();
            if (meta && meta.sessionId === sparadSid) {
              const serverLista =
                typeof data.sessionId === "string" && sparadSid === data.sessionId
                  ? (Array.isArray(data.historik) ? data.historik : [])
                  : senastAktivHistorik;
              const cache = await lasHistorikCache(sparadSid);
              if (cache && cache.meddelanden.length > serverLista.length) {
                aktivHistorik = cache.meddelanden;
                cacheTrumfar = true;
              }
            }
          }
          if (levande && kandidat && aktivHistorik.length > 0) {
            sparaSenasteSessionId(kandidat);
            const arDefault = typeof data.sessionId === "string" && kandidat === data.sessionId;
            const tillMeddelanden = (lista: { roll: "user" | "assistant"; text: string }[]) =>
              lista.map((h) => ({ id: nyttId(), roll: h.roll, text: h.text }));
            const nyaSvar = aktivHistorik.filter((h) => h.roll === "assistant").length;
            if (arDefault) {
              // Default-sessionen ägs av HUVUDTABBEN — fyll den (även när en
              // annan tabb var aktiv vid mount) + visa den direkt. Prompt-
              // fältet följer måltabbens utkast (samma som valjTabb gör).
              const forr = sparad?.tabbar.find((t) => t.huvud) ?? null;
              const forrSvar = forr ? forr.meddelanden.filter((m) => m.roll === "assistant").length : 0;
              rörTabb(huvudId, (t) => ({
                ...t,
                meddelanden: tillMeddelanden(aktivHistorik),
                historikLasad: true,
              }));
              setAktivTabbId(huvudId);
              setPrompt(forr?.utkast ?? "");
              if (nyaSvar > forrSvar) {
                setBortaBanner({ antalTurner: nyaSvar - forrSvar, sessionId: kandidat, malKorer: aktivtMal?.aktiv === true });
              }
            } else {
              // Egen session (per-session-tabb): tabben som äger den (ur
              // sessionStorage) uppdateras; annars föds en ÅTERKOPPLAD tabb.
              const äger = sparad?.tabbar.find((t) => t.sessionId === kandidat) ?? null;
              const forrSvar = äger ? äger.meddelanden.filter((m) => m.roll === "assistant").length : 0;
              if (äger) {
                rörTabb(äger.id, (t) => ({
                  ...t,
                  meddelanden: tillMeddelanden(aktivHistorik),
                  historikLasad: true,
                }));
                setAktivTabbId(äger.id);
                setPrompt(äger.utkast);
              } else {
                const nyTabbId = nyttId();
                setTabbar((alla) => [
                  ...alla,
                  {
                    id: nyTabbId,
                    huvud: false,
                    sessionId: kandidat,
                    titel: `Åter ${kandidat.slice(5, 13)}`,
                    ...tabbGrund(),
                    meddelanden: tillMeddelanden(aktivHistorik),
                    historikLasad: true,
                  },
                ]);
                setAktivTabbId(nyTabbId);
                setPrompt("");
              }
              if (nyaSvar > forrSvar) {
                setBortaBanner({ antalTurner: nyaSvar - forrSvar, sessionId: kandidat, malKorer: aktivtMal?.aktiv === true });
              }
            }
          }
          if (cacheTrumfar) {
            visaToast("Visar cachad historik — webbläsarens kopia hade fler meddelanden än servern.");
          }
        } else if (res.status === 401) {
          if (levande) setStatusText("Logga in igen — sessionen har löpt ut.");
        }
      } catch {
        if (levande) setStatusText("Nätverksfel — agenten kunde ej nås.");
      }
      // VÅG 87 H3 5: historik-GET:en är besvarad (oavsett utfall) —
      // skeletons släcks, ev. empty-state/tom chat visas ärligt.
      if (levande) setLaddarHistorik(false);
      void lasModeller();
      void lasSessioner();
      // V83 B1: senaste turnens filändringar — visas på sista agentbubblan
      // även efter omladdning (GET /api/studio/andringar — DEFAULT-sessionen,
      // därför skrivs diffen till HUVUDTABBENS sista agentbubbla).
      try {
        const res = await fetch("/api/studio/andringar", { headers: adminHeaders() });
        if (res.ok) {
          const data = (await res.json()) as { filer?: Filandring[] };
          if (levande && Array.isArray(data.filer) && data.filer.length > 0) {
            rörTabb(huvudId, (t) => {
              for (let i = t.meddelanden.length - 1; i >= 0; i--) {
                if (t.meddelanden[i].roll === "assistant") {
                  const kopia = [...t.meddelanden];
                  kopia[i] = { ...t.meddelanden[i], ändringar: data.filer };
                  return { ...t, meddelanden: kopia };
                }
              }
              return t;
            });
          }
        }
      } catch {
        // diff vid uppslag är lyx
      }
      try {
        const res = await fetch("/api/studio/uppladdning", { headers: adminHeaders() });
        if (res.ok) {
          const data = (await res.json()) as { filer?: (Uppladdning & { andrad?: number })[] };
          // GET svarar med sökväg relativt uploads-roten ("<datum>/<namn>") —
          // normalisera till agentens fulla relativa sökväg "uploads/…".
          if (levande && data.filer) {
            setUppladdningar(
              data.filer.map((f) => ({
                ...f,
                sokvag: f.sokvag.startsWith("uploads/") ? f.sokvag : `uploads/${f.sokvag}`,
              })),
            );
          }
        }
      } catch {
        // uploads-listan är lyx
      }
    })();
    return () => {
      levande = false;
    };
  }, [lasModeller, lasSessioner, mottagenPermission, rörTabb, visaToast]);

  // ── V84 B: EGEN TABB-SIDALOAD — resume tidigare sessioner ─────────────────
  // När en egen tabb med sessionId blir aktiv (eller föds ur sessionslistan)
  // och är tom: hämta historiken + kontexten via GET /api/studio/stream
  // ?sessionId= (per-session-transport — resume sker på servern).
  React.useEffect(() => {
    const t = tabbar.find((x) => x.id === aktivTabbId);
    if (!t || t.huvud || !t.sessionId || t.historikLasad || t.meddelanden.length > 0) return;
    rörTabb(t.id, (x) => ({ ...x, historikLasad: true })); // en gång räcker
    let levande = true;
    (async () => {
      try {
        const res = await fetch(`/api/studio/stream?sessionId=${encodeURIComponent(t.sessionId!)}`, {
          headers: adminHeaders(),
        });
        if (!res.ok || !levande) return;
        const data = (await res.json()) as {
          historik?: { roll: "user" | "assistant"; text: string }[];
          kontext?: KontextInfo | null;
          fel?: string;
        };
        if (!levande) return;
        if (Array.isArray(data.historik) && data.historik.length > 0) {
          rörTabb(t.id, (x) => ({
            ...x,
            meddelanden: data.historik!.map((h) => ({ id: nyttId(), roll: h.roll, text: h.text })),
          }));
        }
        if (data.kontext) {
          rörTabb(t.id, (x) => ({
            ...x,
            kontext: data.kontext ?? null,
            ackumulerat:
              typeof data.kontext?.totalTokenCount === "number" ? data.kontext.totalTokenCount : x.ackumulerat,
          }));
        }
        if (data.fel) visaToast(data.fel, "fel");
      } catch {
        // nätverksfel — tabben börjar tom; nästa prompt resumear ändå
      }
    })();
    return () => {
      levande = false;
    };
  }, [aktivTabbId, tabbar, rörTabb, visaToast]);

  // ── VÅG 87 H1: RECONNECT-POLL — SSE tappat men fliken öppen ────────────────
  // Servern fortsätter arbeta när strömmen dör (nätverksblippa, proxy-timeout
  // — chattens POST-läsare kan sluta medan transporten + barnprocessen lever).
  // Så länge fliken är SYNLIG: GET /api/studio/stream (utan sessionId) var
  // 15:e sekund vid AKTIVT mål (VÅG 88 I3 — autonoma iterationer syns
  // snabbare), annars var 30:e — sessionskartan + mål-snapshot håller vyn
  // sann. En session
  // som arbetar på SERVERN utan levande lokal ström markeras i sin tabb
  // (spinner + status) och synkas (GET ?sessionId= — resume) när den slutar;
  // ett aktivt mål återöppnar mål-strömmen själv. DOLD flik ⇒ paus
  // (visibilitychange pollar direkt vid återkomst — "pausa när dold").
  const pollAterkopplingRef = React.useRef<() => Promise<void>>(async () => undefined);
  const pollAterkoppling = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/stream", { headers: adminHeaders() });
      if (!res.ok) return;
      const data = (await res.json()) as {
        sessionId?: string | null;
        senastAktivSessionId?: string | null;
        aktivtMal?: { aktiv: boolean; pausad: boolean; iteration: number; mal: string | null } | null;
        sessionskarta?: Record<string, { aktiv?: boolean }>;
      };
      // Mål-reconnect: aktivt mål men mål-strömmen är stängd ⇒ öppna igen
      // (transportens MAL_BUFFERT spolar det som missades under avbrottet).
      if (data.aktivtMal) {
        setMal(data.aktivtMal.mal);
        setMalStatus({
          aktiv: data.aktivtMal.aktiv,
          pausad: data.aktivtMal.pausad,
          iteration: data.aktivtMal.iteration,
        });
        setMalIteration(data.aktivtMal.iteration);
        if (data.aktivtMal.aktiv && !malStrömOppen) setMalStrömOppen(true);
      }
      const karta = data.sessionskarta ?? {};
      const malPaDefault = data.aktivtMal?.aktiv === true;
      // Sessioner där SERVERN arbetar men inga lokala strömmar lever ⇒
      // markera tabben (spinner + status) så användaren ser att agenten
      // inte är klar. Mål-loopen på default-sessionen hoppas över — mål-
      // strömmen (som återöppnades ovan) äger huvudtabben där.
      for (const [sid, kort] of Object.entries(karta)) {
        if (!kort?.aktiv) continue;
        if (malPaDefault && sid === data.sessionId) continue;
        const tb = tabbarRef.current.tabbar.find((t) => t.sessionId === sid);
        if (tb && !tb.strömmar && !serverSynkRef.current.has(sid)) {
          serverSynkRef.current.add(sid);
          rörTabb(tb.id, (t) => ({ ...t, strömmar: true, status: "Agenten arbetar (återkopplad)…" }));
        }
      }
      // Markerade sessioner som SLUTAT arbeta ⇒ avmarkera + synka historiken
      // (GET ?sessionId= — resume på servern) + borta-banner vid nya svar.
      for (const sid of [...serverSynkRef.current]) {
        const kort = karta[sid];
        if (kort?.aktiv) continue;
        serverSynkRef.current.delete(sid);
        const tb = tabbarRef.current.tabbar.find((t) => t.sessionId === sid);
        if (!tb) continue;
        rörTabb(tb.id, (t) => ({ ...t, strömmar: false, status: "" }));
        try {
          const r2 = await fetch(`/api/studio/stream?sessionId=${encodeURIComponent(sid)}`, {
            headers: adminHeaders(),
          });
          if (!r2.ok) continue;
          const d2 = (await r2.json()) as { historik?: { roll: "user" | "assistant"; text: string }[] };
          if (!Array.isArray(d2.historik) || d2.historik.length === 0) continue;
          const forrSvar = tb.meddelanden.filter((m) => m.roll === "assistant").length;
          const nyaSvar = d2.historik.filter((h) => h.roll === "assistant").length;
          rörTabb(tb.id, (t) => ({
            ...t,
            meddelanden: d2.historik!.map((h) => ({ id: nyttId(), roll: h.roll, text: h.text })),
            historikLasad: true,
          }));
          if (nyaSvar > forrSvar) setBortaBanner({ antalTurner: nyaSvar - forrSvar, sessionId: sid, malKorer: false });
        } catch {
          // nästa poll (30 s) försöker igen
        }
      }
    } catch {
      // nätverksfel — nästa poll försöker igen
    }
  }, [malStrömOppen, rörTabb]);

  React.useEffect(() => {
    pollAterkopplingRef.current = pollAterkoppling;
  }, [pollAterkoppling]);

  // Interval + visibilitychange: pollar ENDAST när fliken syns (dold = paus).
  // VÅG 88 I3 CACHE-OPTIMERING: takten är MÅLBEROENDE — ett AKTIVT mål
  // (malStatusRef: aktiv + ej pausad) ⇒ 15 s (autonoma iterationer ska synas
  // snabbt), annars 30 s (vila). Timern är SJÄLV-OMARMANDE (setTimeout-länk
  // som läser malStatusRef vid VARJE omarming) så mål-start/paus byter takt
  // vid nästa cykel utan att effekten kör om eller state behövs i deps.
  React.useEffect(() => {
    const kanske = () => {
      if (document.visibilityState === "visible") void pollAterkopplingRef.current();
    };
    let tid: number | undefined;
    const arma = () => {
      const aktivtMal = malStatusRef.current?.aktiv === true && malStatusRef.current.pausad !== true;
      tid = window.setTimeout(() => {
        kanske();
        arma();
      }, aktivtMal ? 15_000 : 30_000);
    };
    arma();
    document.addEventListener("visibilitychange", kanske);
    return () => {
      if (tid !== undefined) window.clearTimeout(tid);
      document.removeEventListener("visibilitychange", kanske);
    };
  }, []);

  // ── V2 STUDIO: modellbyte / ny session / komprimering ─────────────────────

  const bytModell = React.useCallback(
    async (modellId: string) => {
      if (!modellId || modellId === valdModell || byterModell || strömmarHuvud) return;
      const namn = modeller.find((m) => m.id === modellId)?.namn ?? modellId;
      setByterModell(true);
      try {
        const res = await fetch("/api/studio/modeller", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ modell: modellId }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          sessionId?: string;
          modell?: string;
          fel?: string;
        };
        if (res.ok && data.sessionId) {
          setValdModell(modellId);
          // V84 B: modellbytet kasserar DEFAULT-sessionen — huvudtabben
          // börjar friskt (historiken lever kvar i sessionslistan).
          rörTabb(huvudTabb?.id ?? "tabb-huvud", (t) => ({
            ...t,
            sessionId: null,
            meddelanden: [],
            kontext: null,
            rundaTkn: null,
            ackumulerat: 0,
            historikLasad: false,
          }));
          visaToast(`Modell bytt till ${data.modell ?? namn} — ny session skapad`);
          void lasSessioner();
        } else {
          visaToast(data.fel || "Modellbytet misslyckades.", "fel");
        }
      } catch {
        visaToast("Nätverksfel under modellbytet.", "fel");
      } finally {
        setByterModell(false);
      }
    },
    [modeller, strömmarHuvud, visaToast, lasSessioner, valdModell, byterModell, rörTabb, huvudTabb],
  );

  const startaNySession = React.useCallback(async () => {
    if (sessionJobbar || strömmarHuvud) return;
    setSessionJobbar("ny");
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "ny" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        sessionId?: string;
        kontext?: KontextInfo | null;
        fel?: string;
      };
      if (res.ok && data.sessionId) {
        // V84 B: "Ny session" gäller DEFAULT-sessionen ⇒ HUVUDTABBEN börjar
        // friskt med den nya sessionens kontext.
        rörTabb(huvudTabb?.id ?? "tabb-huvud", (t) => ({
          ...t,
          sessionId: null,
          meddelanden: [],
          kontext: data.kontext ?? null,
          rundaTkn: null,
          ackumulerat: data.kontext?.totalTokenCount ?? 0,
          historikLasad: false,
        }));
        visaToast("Ny session — frisk kontext (1M-fönstret börjar om)");
        void lasSessioner();
      } else {
        visaToast(data.fel || "Kunde ej skapa ny session.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — kunde ej skapa ny session.", "fel");
    } finally {
      setSessionJobbar("");
    }
  }, [sessionJobbar, strömmar, visaToast, lasSessioner]);

  // ── VÅG 86 G5: CHECKPOINT/REWIND — "⟲ Gå tillbaka hit" ──────────────────────

  /**
   * Forka sessionen vid DENNA agentbubbla (confirm → POST action "rewind"
   * {turnIndex, sessionId?} → session/fork {kind:"turn"} på servern, LIVE-
   * bevisat utan checkpoint-krav). Svaret bär den FORKADE sessionens
   * historik + kontext — tabben byter till den (chatten börjar om från
   * punkten, nästa prompt fortsätter där) och föräldern lever kvar i
   * Sessioner. Huvudtabben rewind:ar DEFAULT-transporten (ingen sessionId
   * i anropet); egna tabbar bär sitt sessionId (per-session-transport).
   */
  const gaTillbakaHit = React.useCallback(
    async (bubblaId: string) => {
      const tabb = aktivTabb;
      if (!tabb || rewindJobbar) return;
      if (tabb.strömmar) {
        visaToast("Agenten arbetar i tabben — vänta tills den är klar.", "fel");
        return;
      }
      const turnIndex = turnIndexKarta.get(bubblaId) ?? -1;
      if (turnIndex < 0) return; // bubbla utan föregående user-post — ingen turn att fork:a
      const iteration = turnIndex + 1;
      if (
        !window.confirm(
          `Gå tillbaka till iteration ${iteration}?\n\nSessionen forkas vid denna punkt — den nya sessionen börjar från detta svar och nästa prompt fortsätter där. Den gamla sessionen finns kvar i Sessioner.`,
        )
      ) {
        return;
      }
      setRewindJobbar(true);
      setStatusText("Forkar sessionen…");
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({
            action: "rewind",
            turnIndex,
            ...(tabb.huvud ? {} : tabb.sessionId ? { sessionId: tabb.sessionId } : {}),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          sessionId?: string;
          iteration?: number;
          historik?: { roll: "user" | "assistant"; text: string }[];
          kontext?: KontextInfo | null;
          meddelande?: string;
          fel?: string;
        };
        if (res.ok && data.sessionId) {
          // Den nya (forkade) sessionen blir AKTIV i tabben — chatten börjar
          // om från fork-punkten (serverns historik inkluderar en synthetisk
          // user-notis om forken — ärlig spårbarhet).
          rörTabb(tabb.id, (t) => ({
            ...t,
            sessionId: data.sessionId!,
            titel: t.titel === "Ny tabb" ? `Fork ${data.iteration ?? iteration}` : t.titel,
            meddelanden: (data.historik ?? []).map((h) => ({ id: nyttId(), roll: h.roll, text: h.text })),
            kontext: data.kontext ?? null,
            rundaTkn: null,
            ackumulerat:
              typeof data.kontext?.totalTokenCount === "number" ? data.kontext.totalTokenCount : 0,
            historikLasad: true,
          }));
          visaToast(`Sessionen har forkats från iteration ${data.iteration ?? iteration}`);
          setStatusText("");
          void lasSessioner(); // föräldern + forken syns i Sessioner-listan
        } else {
          setStatusText("");
          visaToast(data.fel || "Rewinden misslyckades.", "fel");
        }
      } catch {
        setStatusText("");
        visaToast("Nätverksfel under rewinden.", "fel");
      } finally {
        setRewindJobbar(false);
      }
    },
    [aktivTabb, rewindJobbar, turnIndexKarta, rörTabb, visaToast, lasSessioner],
  );

  const komprimera = React.useCallback(async () => {
    if (sessionJobbar || strömmarHuvud) return;
    setSessionJobbar("compact");
    setStatusText("Komprimerar kontexten…");
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "compact" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: "klar" | "redan_körs" | "tom";
        meddelande?: string;
        kontext?: KontextInfo | null;
        fel?: string;
      };
      if (res.ok) {
        if (data.kontext) {
          // V84 B: komprimeringen gäller DEFAULT-sessionen ⇒ huvudtabbens rad.
          rörTabb(huvudTabb?.id ?? "tabb-huvud", (t) => ({
            ...t,
            kontext: data.kontext ?? null,
            ackumulerat: data.kontext?.totalTokenCount ?? 0,
          }));
        }
        visaToast(data.meddelande ?? "Kontexten komprimerad.");
      } else {
        visaToast(data.fel || "Komprimeringen misslyckades.", "fel");
      }
    } catch {
      visaToast("Nätverksfel under komprimeringen.", "fel");
    } finally {
      setSessionJobbar("");
      setStatusText(live === "demo" ? "Demo-läge (mock-transport)" : "Sessionen lever");
    }
  }, [sessionJobbar, strömmarHuvud, visaToast, live, rörTabb, huvudTabb]);

  // ── VÅG 83 B3: sessions- och workspace-hantering (Z-portaLens) ──────────
  // V84 B: sessioner öppnas NUMERA I EGA TABBAR (oppnaITabb) — den gamla
  // in-place-resumen är ersatt av tabbflödet (resume sker per-session på
  // servern via GET/POST /api/studio/stream ?sessionId).

  /** Stäng session (session/close) — lever kvar i listan men svarar ej. */
  const stangSessionen = React.useCallback(
    async (sessionId: string) => {
      if (sessionJobbar || strömmarHuvud) return;
      setSessionJobbar("stang");
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "stang", sessionId }),
        });
        const data = (await res.json().catch(() => ({}))) as { stangd?: boolean; fel?: string };
        if (res.ok && data.stangd) {
          // V84 B: sessioner som ÄR öppna i tabbar återställs (deras nästa
          // prompt föder frisk session via nyckel-vägen); default-sessionen
          // (huvudtabben) töms + målet rensas som förr.
          if (sessionId === aktivSession) setMal(null);
          setTabbar((alla) =>
            alla.map((t) =>
              t.sessionId === sessionId || (t.huvud && sessionId === aktivSession)
                ? {
                    ...t,
                    sessionId: null,
                    meddelanden: [],
                    kontext: null,
                    rundaTkn: null,
                    ackumulerat: 0,
                    historikLasad: false,
                  }
                : t,
            ),
          );
          visaToast("Sessionen stängd — finns kvar i listan (arkiverad).");
          void lasSessioner();
        } else {
          visaToast(data.fel || "Kunde ej stänga sessionen.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — kunde ej stänga sessionen.", "fel");
      } finally {
        setSessionJobbar("");
      }
    },
    [sessionJobbar, strömmarHuvud, visaToast, lasSessioner, aktivSession],
  );

  // ── VÅG 85 F1: MÅL-LÄGET — dialog → Starta → autonom loop ────────────────
  // (sattMal/rensaMaler anropar /api/studio/session; loopens events lever
  // via mål-SSE-strömmen POST /api/studio/mal/stream — se lyssnaMal-effekten.)

  /** Öppna den stora mål-dialogen (textarea förhandsfylls med nuvarande mål). */
  const oppnaMalDialog = React.useCallback(() => {
    setMalDialogText(mal ?? "");
    setMalDialogOppen(true);
  }, [mal]);

  /**
   * STARTA MÅL-LÄGET (dialogens knapp): session/goal set — protokollet
   * börjar mata turner AUTOMATISKT (v83 B3-bevis). malStrömOppen slås på
   * FÖRE requesten så SSE-strömmen hinner öppna (transportens buffert
   * fångar startens event även i ras-fallet).
   */
  const startaMal = React.useCallback(async () => {
    const texten = malDialogText.trim();
    if (!texten || malStartar) return;
    setMalStartar(true);
    setMalStrömOppen(true);
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "malSatt", mal: texten }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        mal?: string | null;
        meddelande?: string;
        fel?: string;
      };
      if (res.ok) {
        setMal(typeof data.mal === "string" ? data.mal : texten);
        setMalStatus({ aktiv: true, pausad: false, iteration: 0 });
        setMalIteration(0);
        setMalDialogOppen(false);
        visaToast(data.meddelande || "Målet satt — agenten börjar arbeta mot det.");
      } else {
        visaToast(data.fel || "Målet kunde ej sparas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej sparas.", "fel");
    } finally {
      setMalStartar(false);
    }
  }, [malDialogText, malStartar, visaToast]);

  /** PAUSA MÅLLOOPEN (session/stop — LIVE-bevisat v83 B3). */
  const pausaMal = React.useCallback(async () => {
    if (malPausar) return;
    setMalPausar(true);
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "malPausa" }),
      });
      const data = (await res.json().catch(() => ({}))) as { meddelande?: string; fel?: string };
      if (res.ok) {
        setMalStatus((s) => ({ aktiv: false, pausad: true, iteration: s?.iteration ?? 0 }));
        visaToast(data.meddelande || "Målet pausat — iterationerna stannar.");
      } else {
        visaToast(data.fel || "Målet kunde ej pausas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej pausas.", "fel");
    } finally {
      setMalPausar(false);
    }
  }, [malPausar, visaToast]);

  /** ÅTERUPPTA pausat mål (session/goal resume). */
  const aterupptaMal = React.useCallback(async () => {
    if (malPausar) return;
    setMalPausar(true);
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "malAteruppta" }),
      });
      const data = (await res.json().catch(() => ({}))) as { meddelande?: string; fel?: string };
      if (res.ok) {
        setMalStatus((s) => ({ aktiv: true, pausad: false, iteration: s?.iteration ?? 0 }));
        visaToast(data.meddelande || "Målet återupptaget — loopen fortsätter.");
      } else {
        visaToast(data.fel || "Målet kunde ej återupptas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej återupptas.", "fel");
    } finally {
      setMalPausar(false);
    }
  }, [malPausar, visaToast]);

  /** Rensa målet (session/goal clear) — mål-läget släcks HELT. */
  const rensaMaler = React.useCallback(async () => {
    if (malSparar) return;
    if (malKör && !window.confirm("Mål-loopen kör — rensa målet och stoppa agenten?")) return;
    setMalSparar(true);
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "malRensa" }),
      });
      const data = (await res.json().catch(() => ({}))) as { meddelande?: string; fel?: string };
      if (res.ok) {
        setMal(null);
        setMalStatus(null);
        setMalIteration(0);
        setMalStrömOppen(false);
        visaToast(data.meddelande || "Målet rensat.");
      } else {
        visaToast(data.fel || "Målet kunde ej rensas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej rensas.", "fel");
    } finally {
      setMalSparar(false);
    }
  }, [malSparar, malKör, visaToast]);

  /**
   * VÅG 85 F1: MÅL-STRÖMMEN — den autonoma loopens SSE (POST
   * /api/studio/mal/stream, fetch+reader som chatten). Öppnas så snart
   * mål-läget startas (malStrömOppen — slås på FÖRE mål-set i startaMal)
   * och stängs vid rensa/unmount. Varje iteration blir en KOMPLETT agent-
   * bubbla I HUVUDTABBEN (målet äger default-sessionen): mal_iteration
   * (start) öppnar bubblan med iterations-badge → delta/verktyg_kort/
   * verktyg_input/runda strömmar in (samma renderare som chattade turner)
   * → mal_iteration (slut) färdigställer + kontext/ändringar (diff) följer
   * efter. mal_status håter badge/banner-tilståndet ärligt mot servern.
   */
  React.useEffect(() => {
    if (!malStrömOppen) {
      malAbortRef.current?.abort();
      malAbortRef.current = null;
      return;
    }
    const abort = new AbortController();
    malAbortRef.current = abort;

    /** Rör iterationens bubbla i huvudtabben (malBubblaRef pekar ut den). */
    const rörBubbla = (rör: (m: Meddelande) => Meddelande) => {
      const id = malBubblaRef.current;
      if (!id) return;
      rörTabb(huvudTabbIdRef.current, (t) => ({
        ...t,
        meddelanden: t.meddelanden.map((m) => (m.id === id ? rör(m) : m)),
      }));
    };
    /** Verktygskorts-merge på id (samma logik som skickaPrompt). */
    const uppdateraKort = (id: string, rör: (k: VerktygKort) => VerktygKort) => {
      rörBubbla((m) => {
        const korta = m.verktygKort ? [...m.verktygKort] : [];
        const i = korta.findIndex((k) => k.id === id);
        if (i >= 0) korta[i] = rör(korta[i]);
        else korta.push(rör({ id, namn: "verktyg", steg: "planerad" }));
        return { ...m, verktygKort: korta };
      });
    };

    (async () => {
      try {
        const res = await fetch("/api/studio/mal/stream", {
          method: "POST",
          headers: adminJsonHeaders(),
          signal: abort.signal,
        });
        if (!res.ok || !res.body) return;
        const läsare = res.body.getReader();
        const avkodare = new TextDecoder();
        let buffert = "";
        // Strömmen lever TILLS målet rensas/klienten lämnar (abort) —
        // läs-loopen har ingen "färdig": nya iterationer kommer av sig själva.
        for (;;) {
          const { done, value } = await läsare.read();
          if (done) break;
          buffert += avkodare.decode(value, { stream: true });
          let gräns = buffert.indexOf("\n\n");
          while (gräns >= 0) {
            const block = buffert.slice(0, gräns);
            buffert = buffert.slice(gräns + 2);
            gräns = buffert.indexOf("\n\n");
            const dataRad = block.split("\n").find((r) => r.startsWith("data: "));
            if (!dataRad) continue; // heartbeat-kommentarer osv.
            let event: StreamEvent;
            try {
              event = JSON.parse(dataRad.slice(6)) as StreamEvent;
            } catch {
              continue;
            }
            switch (event.typ) {
              case "mal_status":
                setMalStatus({
                  aktiv: event.aktiv ?? false,
                  pausad: event.pausad ?? false,
                  iteration: event.iteration ?? 0,
                });
                setMalIteration(event.iteration ?? 0);
                if (typeof event.mal === "string") setMal(event.mal);
                else if (event.mal === null && !event.aktiv && !event.pausad) setMal(null);
                break;
              case "mal_iteration":
                if (event.fas === "start") {
                  // Ny autonom iteration = NY agentbubbla med iterations-badge.
                  const iteration = event.iteration ?? 0;
                  setMalIteration(iteration);
                  const id = nyttId();
                  malBubblaRef.current = id;
                  rörTabb(huvudTabbIdRef.current, (t) => ({
                    ...t,
                    tankar: "",
                    status: `Autonom iteration ${iteration}…`,
                    meddelanden: [
                      ...t.meddelanden,
                      {
                        id,
                        roll: "assistant" as const,
                        text: "",
                        strömmande: true,
                        verktygKort: [],
                        malIteration: iteration,
                      },
                    ],
                  }));
                } else {
                  // KVD-pixeln: iterationen klar — färdigställ bubblan.
                  setMalIteration(event.iteration ?? 0);
                  rörBubbla((m) => ({
                    ...m,
                    text: event.svar && event.svar.trim() ? event.svar : m.text || "(tom iteration)",
                    strömmande: false,
                    rundStatistik: {
                      varaktighetMs: event.varaktighetMs,
                      resultatTyp: event.resultatTyp,
                      verktygAntal: event.verktygAntal,
                    },
                  }));
                  malBubblaRef.current = null;
                }
                break;
              case "delta":
                if (event.kanal === "tankar") {
                  rörTabb(huvudTabbIdRef.current, (t) => ({ ...t, tankar: (t.tankar + (event.text ?? "")).slice(-260) }));
                } else {
                  rörBubbla((m) => ({ ...m, text: m.text + (event.text ?? "") }));
                }
                break;
              case "verktyg_kort":
                if (event.id) {
                  uppdateraKort(event.id, (k) => ({
                    ...k,
                    namn: event.namn ?? k.namn,
                    steg: event.steg ?? k.steg,
                    argument: event.argument ?? k.argument,
                    beskrivning: event.beskrivning ?? k.beskrivning,
                    resultat: event.resultat ?? k.resultat,
                    fel: event.fel ?? k.fel,
                    varaktighetMs: event.varaktighetMs ?? k.varaktighetMs,
                    framsteg: event.framsteg ?? k.framsteg,
                  }));
                }
                break;
              case "verktyg_input":
                if (event.id) {
                  uppdateraKort(event.id, (k) => ({
                    ...k,
                    liveInput: (k.liveInput ?? "") + (event.text ?? ""),
                  }));
                }
                break;
              case "runda":
                if (event.fas === "slut") {
                  rörBubbla((m) => ({
                    ...m,
                    rundStatistik: {
                      varaktighetMs: event.varaktighetMs,
                      resultatTyp: event.resultatTyp,
                      verktygAntal: event.verktygAntal,
                    },
                  }));
                }
                break;
              case "status":
                rörTabb(huvudTabbIdRef.current, (t) => ({
                  ...t,
                  status: event.text || "Agenten utvecklar autonomt…",
                }));
                break;
              case "kontext":
                if (event.kontext) {
                  rörTabb(huvudTabbIdRef.current, (t) => ({
                    ...t,
                    kontext: event.kontext ?? null,
                    ackumulerat:
                      typeof event.kontext?.totalTokenCount === "number"
                        ? event.kontext.totalTokenCount
                        : t.ackumulerat,
                  }));
                }
                break;
              case "ändringar":
                if (Array.isArray(event.filer)) {
                  const filer = event.filer;
                  rörBubbla((m) => ({ ...m, ändringar: filer }));
                }
                break;
              case "mal_pausad":
                rörBubbla((m) => ({ ...m, strömmande: false, text: m.text || "(pausad)" }));
                malBubblaRef.current = null;
                setMalStatus((s) => (s ? { ...s, aktiv: false, pausad: true } : s));
                visaToast("Målet pausat — den autonoma loopen stannar.");
                break;
              case "fel":
                visaToast(event.meddelande || "Mål-strömmen felade.", "fel");
                break;
              default:
                break;
            }
          }
        }
      } catch {
        // AbortError vid nedstängning är tyst; nätverksfel återförs av
        // användarens näppa (Starta/Återuppta) — mal_status-tystnad visar.
      }
    })();

    return () => {
      abort.abort();
      if (malAbortRef.current === abort) malAbortRef.current = null;
    };
  }, [malStrömOppen, rörTabb, visaToast]);

  /** Hämta bakgrundsagenter (session/subagents). */
  const lasAgenter = React.useCallback(async () => {
    setAgenterLaddar(true);
    setAgenterFel("");
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "subagenter" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        subagenter?: SubagentPost[];
        fel?: string;
      };
      if (res.ok && Array.isArray(data.subagenter)) {
        setSubagenter(data.subagenter);
      } else {
        setAgenterFel(data.fel || "Bakgrundsagenterna kunde ej listas.");
      }
    } catch {
      setAgenterFel("Nätverksfel — bakgrundsagenterna kunde ej listas.");
    } finally {
      setAgenterLaddar(false);
    }
  }, []);

  /** Avbryt bakgrundstask (session/cancelBackgroundTask). */
  const avbrytAgent = React.useCallback(
    async (taskId: string) => {
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "avbrytTask", taskId }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          avbruten?: boolean;
          meddelande?: string;
          fel?: string;
        };
        if (res.ok && data.avbruten) {
          visaToast(data.meddelande || "Tasken avbruten.");
        } else {
          visaToast(data.meddelande || data.fel || "Kunde ej avbryta tasken.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — kunde ej avbryta tasken.", "fel");
      }
      void lasAgenter();
    },
    [visaToast, lasAgenter],
  );

  // ── VÅG 83 B4: filträd + förhandsgranskning + töm uploads ────────────────

  /** Hämta trädet (GET /api/studio/filer) — tvingas via ?frisk=1 vid uppdatering. */
  const lasTrad = React.useCallback(async (frisk = false) => {
    setTradLaddar(true);
    setTradFel("");
    try {
      const res = await fetch(`/api/studio/filer${frisk ? `?frisk=${Date.now()}` : ""}`, {
        headers: adminHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as {
        arbetsyta?: string;
        trad?: TradNod[];
        trunkerad?: boolean;
        fel?: string;
      };
      if (res.ok && data.trad) {
        setTrad(data.trad);
        setTradTrunkerad(Boolean(data.trunkerad));
        setArbetsytaNamn((data.arbetsyta ?? "").split("/").filter(Boolean).pop() ?? "");
      } else {
        setTradFel(data.fel || "Filträdet kunde ej hämtas.");
      }
    } catch {
      setTradFel("Nätverksfel — filträdet kunde ej hämtas.");
    } finally {
      setTradLaddar(false);
    }
  }, []);

  /** Öppna drawern (laddar trädet vid behov) — also /filer-kommandot. */
  const oppnaFiltrad = React.useCallback(() => {
    setInstallningarOppen(false); // VÅG 88 I1: ömsesidig stängning
    setVisaAdmin(false); // VÅG 88 I2: ömsesidig stängning
    setVisaFiler(true);
    void lasTrad();
  }, [lasTrad]);

  /** Klicka fil → hämta förhandsgranskning (GET ?sokvag=…). */
  const visaFil = React.useCallback(async (sokvag: string) => {
    setFilVisning(null);
    setVisningLaddar(true);
    try {
      const res = await fetch(`/api/studio/filer?sokvag=${encodeURIComponent(sokvag)}`, {
        headers: adminHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as FilVisning;
      if (res.ok) {
        setFilVisning(data);
      } else {
        setFilVisning({ namn: sokvag.split("/").pop() ?? sokvag, sokvag, storlek: 0, forhandsgranskning: { slag: "blockerad", meddelande: data.fel || "Filen kunde ej visas." } });
      }
    } catch {
      setFilVisning({ namn: sokvag.split("/").pop() ?? sokvag, sokvag, storlek: 0, forhandsgranskning: { slag: "blockerad", meddelande: "Nätverksfel — filen kunde ej hämtas." } });
    } finally {
      setVisningLaddar(false);
    }
  }, []);

  /** Töm uploads (DELETE /api/studio/filer) — rensar även chips-listan. */
  const tomUploads = React.useCallback(async () => {
    if (tommerUploads) return;
    if (!window.confirm(`Tömma uploads? Alla ${uppladdningar.length ? `${uppladdningar.length}+ ` : ""}uppladdade filer raderas (äldre än 7 dagar rensas ändå automatiskt).`)) return;
    setTommerUploads(true);
    try {
      const res = await fetch("/api/studio/filer", { method: "DELETE", headers: adminHeaders() });
      const data = (await res.json().catch(() => ({}))) as { raderade?: number; fel?: string };
      if (res.ok) {
        setUppladdningar([]);
        visaToast(`Uploads tömda — ${data.raderade ?? 0} filer raderade.`);
      } else {
        visaToast(data.fel || "Kunde ej tömma uploads.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — kunde ej tömma uploads.", "fel");
    } finally {
      setTommerUploads(false);
    }
  }, [tommerUploads, uppladdningar.length, visaToast]);

  /** Klicka mapp = växla öppen/stängd (Set i state — ny referens varje gång). */
  const vaxlaMapp = React.useCallback((sokvag: string) => {
    setOppnaMappar((gamla) => {
      const nya = new Set(gamla);
      if (nya.has(sokvag)) nya.delete(sokvag);
      else nya.add(sokvag);
      return nya;
    });
  }, []);

  // Escape stänger förhandsgranskning + drawern (mjuk lokal hjälppunkt).
  React.useEffect(() => {
    if (!visaFiler && !filVisning) return;
    const påTangent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilVisning(null);
        setVisaFiler(false);
      }
    };
    window.addEventListener("keydown", påTangent);
    return () => window.removeEventListener("keydown", påTangent);
  }, [visaFiler, filVisning]);

  // ── VÅG 84 D: agentens minne — läs/redigera/radera ─────────────────────

  /** Hämta minneslistan (GET /api/studio/minne) — alla filer + AGENTS.md. */
  const lasMinne = React.useCallback(async () => {
    setMinneLaddar(true);
    setMinneFel("");
    try {
      const res = await fetch(`/api/studio/minne?frisk=${Date.now()}`, { headers: adminHeaders() });
      const data = (await res.json().catch(() => ({}))) as {
        rot?: string;
        filer?: MinnePost[];
        agentsFinns?: boolean;
        fel?: string;
      };
      if (res.ok && Array.isArray(data.filer)) {
        setMinneFiler(data.filer);
        setMinneRotVisning(data.rot ?? "");
      } else {
        setMinneFel(data.fel || "Minnet kunde ej hämtas.");
      }
    } catch {
      setMinneFel("Nätverksfel — minnet kunde ej hämtas.");
    } finally {
      setMinneLaddar(false);
    }
  }, []);

  /** Öppna Minne-drawern (laddar listan) — stänger filträdet först.
   *  VÅG 88 I2: anropas även av Verktyg 🔧-drawerns Minne-sektion. */
  const oppnaMinne = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaFardigheter(false);
    setInstallningarOppen(false); // VÅG 88 I1: ömsesidig stängning
    setVisaAdmin(false); // VÅG 88 I2: ömsesidig stängning
    setMinneVald(null);
    setMinneRedigerar(false);
    setMinneNy(false);
    setVisaMinne(true);
    void lasMinne();
  }, [lasMinne]);

  /** Klicka minnesfil → full text (GET ?namn= — listan bär bara 8 kB). */
  const oppnaMinnesfil = React.useCallback(async (namn: string) => {
    setMinneRedigerar(false);
    setMinneNy(false);
    setMinneVald(null);
    setMinneDetaljLaddar(true);
    try {
      const res = await fetch(`/api/studio/minne?namn=${encodeURIComponent(namn)}`, {
        headers: adminHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as MinnePost & { fel?: string };
      if (res.ok && data.namn) {
        setMinneVald(data);
        setMinneText(data.innehåll);
      } else {
        visaToast(data.fel || "Minnesfilen kunde ej läsas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — minnesfilen kunde ej hämtas.", "fel");
    } finally {
      setMinneDetaljLaddar(false);
    }
  }, [visaToast]);

  /**
   * Spara en minnesfil (PUT {namn, innehåll}) — gäller både redigering och
   * "Ny minnesfil"/"Skapa AGENTS.md". Servern backar upp gammalt innehåll.
   */
  const sparaMinnesfil = React.useCallback(
    async (namn: string, innehåll: string) => {
      if (minneSparar || !namn) return false;
      setMinneSparar(true);
      try {
        const res = await fetch("/api/studio/minne", {
          method: "PUT",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ namn, innehåll }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          namn?: string;
          skapad?: boolean;
          backup?: string;
          fel?: string;
        };
        if (res.ok && data.namn) {
          visaToast(
            data.skapad
              ? `"${namn}" skapad i agentens minne.`
              : `"${namn}" sparad${data.backup ? ` — backup: ${data.backup}` : ""}.`,
          );
          setMinneRedigerar(false);
          setMinneNy(false);
          void lasMinne();
          // Uppdatera detaljvyn på plats (full text = det vi precis skrev).
          setMinneVald((v) =>
            v && v.namn === namn
              ? { ...v, innehåll, trunkerad: false }
              : v,
          );
          return true;
        }
        visaToast(data.fel || "Minnesfilen kunde ej sparas.", "fel");
        return false;
      } catch {
        visaToast("Nätverksfel — minnesfilen kunde ej sparas.", "fel");
        return false;
      } finally {
        setMinneSparar(false);
      }
    },
    [minneSparar, visaToast, lasMinne],
  );

  /** Radera en minnesfil (DELETE {namn}) — confirm + backup-notis. */
  const raderaMinnesfil = React.useCallback(
    async (namn: string) => {
      if (minneRaderar || !minneVald || namn !== minneVald.namn) return;
      if (namn === "MEMORY.md") {
        visaToast("MEMORY.md-indexet kan inte raderas — agenten bygger om det automatiskt.", "fel");
        return;
      }
      if (
        !window.confirm(
          `Radera "${namn}" ur agentens minne?\n\nEn backup-kopia sparas i .minnes-backup/ först — agenten glömmer fakten tills du återskapar den.`,
        )
      )
        return;
      setMinneRaderar(true);
      try {
        const res = await fetch("/api/studio/minne", {
          method: "DELETE",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ namn }),
        });
        const data = (await res.json().catch(() => ({}))) as { raderad?: boolean; backup?: string; fel?: string };
        if (res.ok && data.raderad) {
          setMinneVald(null);
          setMinneRedigerar(false);
          visaToast(`"${namn}" raderad — backup: ${data.backup ?? "?"} (.minnes-backup/).`);
          void lasMinne();
        } else {
          visaToast(data.fel || "Minnesfilen kunde ej raderas.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — minnesfilen kunde ej raderas.", "fel");
      } finally {
        setMinneRaderar(false);
      }
    },
    [minneRaderar, minneVald, visaToast, lasMinne],
  );

  // OBS: Escape-hantering för Minne 🧠-drawern ägs av studio-minne-panel.tsx.

  // ── VÅG 85 F2: Färdigheter ⚡ — skills/plugins/MCP ur bryggan ───────────

  /** Hämta färdigheterna (GET /api/studio/fardigheter) — tre sektioner. */
  const lasFardigheter = React.useCallback(async () => {
    setFardigheterLaddar(true);
    setFardigheterFel("");
    try {
      const res = await fetch(`/api/studio/fardigheter?frisk=${Date.now()}`, {
        headers: adminHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as {
        skills?: FardighetSkill[];
        plugins?: FardighetPlugin[];
        mcp?: FardighetMcp[];
        mcpVerktyg?: number;
        fel?: string;
      };
      if (res.ok) {
        setFardigheterSkills(Array.isArray(data.skills) ? data.skills : []);
        setFardigheterPlugins(Array.isArray(data.plugins) ? data.plugins : []);
        setFardigheterMcp(Array.isArray(data.mcp) ? data.mcp : []);
        setFardigheterVerktyg(typeof data.mcpVerktyg === "number" ? data.mcpVerktyg : 0);
      } else {
        setFardigheterFel(data.fel || "Färdigheterna kunde ej hämtas.");
      }
    } catch {
      setFardigheterFel("Nätverksfel — färdigheterna kunde ej hämtas.");
    } finally {
      setFardigheterLaddar(false);
    }
  }, []);

  /** Öppna Färdigheter-drawern (laddar listan) — stänger filträdet först. */
  const oppnaFardigheter = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaMinne(false);
    setInstallningarOppen(false); // VÅG 88 I1: ömsesidig stängning
    setVisaAdmin(false); // VÅG 88 I2: ömsesidig stängning
    setVisaFardigheter(true);
    void lasFardigheter();
  }, [lasFardigheter]);

  /** VÅG 88 I2: Öppna Verktyg 🔧-drawern (admin-kommandon — stänger övriga
   *  drawers först). Datat hämtas lasy av panelen per sektion. */
  const oppnaAdmin = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaMinne(false);
    setVisaFardigheter(false);
    setVisaNotiser(false);
    setInstallningarOppen(false); // VÅG 88 I1: ömsesidig stängning
    setVisaAdmin(true);
  }, []);

  // ── VÅG 83 B2: dialogsvar + läges-/tankestyrkeväxlare ────────────────────
  // (V84 C:s permission-funktioner ligger FÖRE uppstartseffekten ovan.)

  /** Svara frågekortet — knappval/fritext eller avbryt. */
  const svaraFraga = React.useCallback(
    async (requestId: string, varde?: string, avbryt = false) => {
      if (svarJobbar) return;
      setSvarJobbar(true);
      try {
        const res = await fetch("/api/studio/interaktion", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify(
            avbryt
              ? { typ: "fråga-avbryt", requestId }
              : { typ: "fråga", requestId, varde: varde ?? "" },
          ),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; fel?: string };
        setFraga((f) => (f?.requestId === requestId ? null : f));
        setFragSvar("");
        if (res.ok && data.ok) {
          visaToast(avbryt ? "Frågan avbröts." : "Svaret skickat till agenten.");
        } else {
          visaToast(data.fel || "Frågan var redan besvarad (30 s-gränsen).", "fel");
        }
      } catch {
        visaToast("Nätverksfel — svaret gick ej fram.", "fel");
      } finally {
        setSvarJobbar(false);
      }
    },
    [svarJobbar, visaToast],
  );

  /** Byt agentläge (session/setMode — POST /api/studio/session action läge). */
  const byteLage = React.useCallback(
    async (nytt: string) => {
      if (!nytt || nytt === lage || lageJobbar || strömmar) return;
      const gammalt = lage;
      setLage(nytt);
      setLageJobbar(true);
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "läge", lage: nytt }),
        });
        const data = (await res.json().catch(() => ({}))) as { lage?: string; fel?: string };
        if (res.ok && data.lage) {
          setLage(data.lage);
          visaToast(`Agentläge: ${data.lage}${data.lage === "plan" ? " — godkännandedialoger aktiveras" : ""}`);
        } else {
          setLage(gammalt);
          visaToast(data.fel || "Läget kunde ej sättas.", "fel");
        }
      } catch {
        setLage(gammalt);
        visaToast("Nätverksfel — läget kunde ej sättas.", "fel");
      } finally {
        setLageJobbar(false);
      }
    },
    [lage, lageJobbar, strömmar, visaToast],
  );

  /** Byt tankestyrka (session/setThoughtLevel — action tankestyrka). */
  const byteTanke = React.useCallback(
    async (ny: string) => {
      if (!ny || ny === tanka || lageJobbar || strömmar) return;
      const gammal = tanka;
      setTanka(ny);
      setLageJobbar(true);
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "tankestyrka", niva: ny }),
        });
        const data = (await res.json().catch(() => ({}))) as { niva?: string; fel?: string };
        if (res.ok && data.niva) {
          setTanka(data.niva);
          visaToast(`Tankestyrka: ${data.niva}`);
        } else {
          setTanka(gammal);
          visaToast(data.fel || "Tankestyrkan kunde ej sättas.", "fel");
        }
      } catch {
        setTanka(gammal);
        visaToast("Nätverksfel — tankestyrkan kunde ej sättas.", "fel");
      } finally {
        setLageJobbar(false);
      }
    },
    [tanka, lageJobbar, strömmar, visaToast],
  );

  // ── Uppladdning ────────────────────────────────────────────────────────────

  const laddaUpp = React.useCallback(async (filer: File[], relativa?: string[]) => {
    if (filer.length === 0) return;
    setLaddarUpp(true);
    try {
      const form = new FormData();
      for (const fil of filer) form.append("fil", fil);
      if (relativa) for (const sok of relativa) form.append("sokvag", sok);
      const res = await fetch("/api/studio/uppladdning", {
        method: "POST",
        headers: adminHeaders(),
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as {
        sokvagar?: Uppladdning[];
        fel?: string;
      };
      if (res.ok && data.sokvagar) {
        setUppladdningar((gamla) => [...data.sokvagar!, ...gamla].slice(0, 50));
      } else {
        setStatusText(data.fel || "Uppladdningen misslyckades.");
      }
    } catch {
      setStatusText("Nätverksfel under uppladdningen.");
    } finally {
      setLaddarUpp(false);
    }
  }, []);

  // Paste: bilder ur urklippet åker rakt upp + sökväg infogas.
  const påPaste = React.useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const filer = Array.from(e.clipboardData?.files ?? []);
      if (filer.length === 0) return;
      e.preventDefault();
      const res = await (async () => {
        setLaddarUpp(true);
        try {
          const form = new FormData();
          for (const fil of filer) form.append("fil", fil);
          const r = await fetch("/api/studio/uppladdning", { method: "POST", headers: adminHeaders(), body: form });
          return (await r.json().catch(() => ({}))) as { sokvagar?: Uppladdning[]; fel?: string };
        } catch {
          return { fel: "Nätverksfel under uppladdningen." } as { sokvagar?: Uppladdning[]; fel?: string };
        } finally {
          setLaddarUpp(false);
        }
      })();
      if (res.sokvagar?.length) {
        setUppladdningar((gamla) => [...res.sokvagar!, ...gamla].slice(0, 50));
        const sista = res.sokvagar[res.sokvagar.length - 1];
        setPrompt((p) => `${p}${p && !p.endsWith(" ") ? " " : ""}Titta på bilden ${sista.sokvag} — `);
        ytaRef.current?.focus();
      } else {
        setStatusText(res.fel || "Uppladdningen misslyckades.");
      }
    },
    [],
  );

  // ── Skicka (SSE över fetch) ────────────────────────────────────────────────

  // ── VÅG 86 G1/G2: SKRIVFÄLTETS MINNE ───────────────────────────────────────

  /** G2: spara en prompt i biblioteket (dublett = flytt överst, tak 50). */
  const sparaPrompt = React.useCallback((text: string): boolean => {
    const t = text.trim();
    if (!t) return false;
    setPrompter((lista) => [{ text: t, skapad: Date.now() }, ...lista.filter((p) => p.text !== t)].slice(0, MAX_PROMPTER));
    return true;
  }, []);

  /** G2: ta bort en sparad prompt (identifierad av skapad-tidsstämpeln). */
  const tabortPrompt = React.useCallback((skapad: number) => {
    setPrompter((lista) => lista.filter((p) => p.skapad !== skapad));
  }, []);

  /** G2: öppna bibliotekets dropdown (mutuellt uteslutande med slash-listan). */
  const oppnaPrompter = React.useCallback(() => {
    setSlashStangd(true);
    setPrompterOppen(true);
  }, []);

  /** G2: bokför en skickad rad i prompthistoriken (dedupe påföljd, tak 50). */
  const pushaHistorik = React.useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    historikIndexRef.current = null; // ny sändning avslutar pågående bläddring
    historikUtkastRef.current = "";
    setPromptHistorik((lista) => (lista[0] === t ? lista : [t, ...lista.filter((h) => h !== t)].slice(0, MAX_PROMPT_HISTORIK)));
  }, []);

  // Persistens: biblioteket + historiken lever kvar över refresh (tyst vid quota).
  React.useEffect(() => {
    try {
      localStorage.setItem(PROMPT_LAGRING, JSON.stringify(prompter));
    } catch {
      // privat läge/quota — minnet lever bara i denna session
    }
  }, [prompter]);

  React.useEffect(() => {
    try {
      localStorage.setItem(PROMPT_HISTORIK_LAGRING, JSON.stringify(promptHistorik));
    } catch {
      // privat läge/quota — minnet lever bara i denna session
    }
  }, [promptHistorik]);

  /**
   * V84 A2: kör ett snabbkommando — DELAD väg för skrivfältets "/"-rader
   * och kommandopaletten (Ctrl/Cmd+K): samma echo i chatten, samma API-
   * anrop. Registreringen lever i STUDIO_KOMMANDON (kommandon.ts).
   * V84 B: echot landar i den AKTIVA TABBENS buffert.
   */
  const korKommando = React.useCallback(
    async (kommando: string, argument = "") => {
      const tabbId = aktivTabbIdRef.current;
      const pushAssistant = (t: string) =>
        rörTabb(tabbId, (tb) => ({
          ...tb,
          meddelanden: [...tb.meddelanden, { id: nyttId(), roll: "assistant" as const, text: t }],
        }));
      rörTabb(tabbId, (tb) => ({
        ...tb,
        meddelanden: [
          ...tb.meddelanden,
          { id: nyttId(), roll: "user" as const, text: `/${kommando}${argument ? ` ${argument}` : ""}` },
        ],
      }));
      switch (kommando) {
        case "help":
          pushAssistant(kommandoHjalp());
          return;
        case "ny":
          await startaNySession();
          pushAssistant("Ny session — kontexten börjar om (gamla sessioner finns kvar i listan).");
          return;
        case "komprimera":
          await komprimera();
          pushAssistant("Komprimering körd — se kontextraden för färsk tokenräkning.");
          return;
        case "filer":
          oppnaFiltrad();
          pushAssistant("Filträdet är öppet — klicka dig ner i arbetsytan och förhandsgranska filer.");
          return;
        case "fardigheter":
          oppnaFardigheter();
          pushAssistant(
            "Färdigheter ⚡ är öppet — agentens skills, aktiva plugins och anslutna MCP-verktyg.",
          );
          return;
        case "sparad": {
          // VÅG 86 G2: /sparad = promptbiblioteket. Utan argument öppnas
          // dropdownen; med text sparas texten OCH dropdownen öppnas så
          // sparandet syns direkt (⭐-knappen gör samma sak).
          const sparade = argument ? sparaPrompt(argument) : false;
          oppnaPrompter();
          pushAssistant(
            sparade
              ? "Prompten sparad i biblioteket ⭐ — klicka en rad för att infoga den i skrivfältet."
              : "Promptbiblioteket ⭐ är öppet — klicka en sparad prompt för att infoga den, papperskorgen tar bort. Spara nya med ⭐-knappen bredvid skicka.",
          );
          return;
        }
        case "modell": {
          const id = argument.split(/\s+/)[0] ?? "";
          const listaText =
            modeller.length > 0
              ? `Tillgängliga: ${modeller.map((m) => `\`${m.id}\``).join(", ")}.`
              : "Modellistan är ej hämtad (demo-läge) — modellbyte kräver riktig anslutning.";
          if (!id) {
            pushAssistant(`Använd: **/modell <id>** — ${listaText}`);
            return;
          }
          if (modeller.length > 0 && !modeller.some((m) => m.id === id)) {
            pushAssistant(`Okänd modell \`${id}\`. ${listaText}`);
            return;
          }
          if (id === valdModell) {
            pushAssistant(`\`${id}\` är redan vald — ingen session kasseras.`);
            return;
          }
          await bytModell(id);
          pushAssistant(`Modellbyte till **${id}** kört — ny session skapad med modellen.`);
          return;
        }
        default:
          pushAssistant(`Okänt kommando \`${kommando}\` — skriv **/help** för alla kommandon.`);
          return;
      }
    },
    [modeller, valdModell, startaNySession, komprimera, bytModell, oppnaFiltrad, oppnaFardigheter, sparaPrompt, oppnaPrompter, rörTabb],
  );

  // ── Skicka (SSE över fetch) — V84 B: PER TABB ─────────────────────────────
  //
  // skickaPrompt(tabbId, text) äger hela strömmen: ALLA skrivningar går via
  // rörTabb(tabbId, …) så en INAKTIV tabb fortsätter buffra i bakgrunden —
  // vid tabbyte renderas tabbens historik som den är. POST-kroppen väljer
  // transport på servern:
  //   huvudtabb          → {prompt}           (default-transporten)
  //   egen tabb + session → {prompt, sessionId} (per-session-transport, resume)
  //   egen tabb, första   → {prompt, nyckel}    (frisk session, re-nycklas)
  const skickaPrompt = React.useCallback(
    async (tabbId: string, text: string) => {
      const tabb = tabbarRef.current.tabbar.find((t) => t.id === tabbId);
      if (!tabb || tabb.strömmar) return;
      const kropp: { prompt: string; sessionId?: string; nyckel?: string } = { prompt: text };
      if (!tabb.huvud) {
        if (tabb.sessionId) kropp.sessionId = tabb.sessionId;
        else kropp.nyckel = tabb.id; // första prompten i en ny tabb
      }
      // VÅG 87 H1: sessions-pekaren skrivs vid varje sändning (huvudtabben
      // får sitt id i "hej"-eventet nedan) — mount-återkopplingens kandidat.
      if (tabb.sessionId) sparaSenasteSessionId(tabb.sessionId);
      // VÅG 88 I3: sessionens id i ström-closuren — "hej" berikar (huvudtabben
      // föds utan id), "klart" skriver IndexedDB-cachen med det.
      let streamSessionId: string | null = tabb.sessionId;

      // Agentbubblans id skapas FÖRST (stabilt genom hela strömmen — alla
      // senare händelser merge:ar på detta id via rörAgent).
      const agentId = nyttId();
      rörTabb(tabbId, (t) => ({
        ...t,
        tankar: "",
        status: "Skickar…",
        strömmar: true,
        // Tabbens kortnamn = första orden i senaste prompten (huvudtabben
        // behåller sitt namn tills första egna prompten).
        titel: t.huvud ? t.titel : kortNamn(text),
        meddelanden: [
          ...t.meddelanden,
          { id: nyttId(), roll: "user" as const, text },
          { id: agentId, roll: "assistant" as const, text: "", strömmande: true, verktygKort: [] },
        ],
      }));

      const abort = new AbortController();
      tabbAbortRef.current.set(tabbId, abort);

      /** Uppdatera agentbubblan funktionellt (strömmen skriver ofta). */
      const rörAgent = (rör: (m: Meddelande) => Meddelande) => {
        rörTabb(tabbId, (t) => ({
          ...t,
          meddelanden: t.meddelanden.map((m) => (m.id === agentId ? rör(m) : m)),
        }));
      };
      /** Tabbstatus (per-tabb "Agenten arbetar…" — den tomma bubblan). */
      const sattStatus = (status: string) => {
        rörTabb(tabbId, (t) => ({ ...t, status }));
      };

      // ── V83 B1: verktygskort-merge (funktionell uppdatering på id) ──
      const uppdateraKort = (id: string, rör: (k: VerktygKort) => VerktygKort) => {
        rörAgent((m) => {
          const korta = m.verktygKort ? [...m.verktygKort] : [];
          const i = korta.findIndex((k) => k.id === id);
          if (i >= 0) {
            korta[i] = rör(korta[i]);
          } else {
            korta.push(rör({ id, namn: "verktyg", steg: "planerad" }));
          }
          return { ...m, verktygKort: korta };
        });
      };

      try {
        const res = await fetch("/api/studio/stream", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify(kropp),
          signal: abort.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { fel?: string };
          throw new Error(data.fel || `Bryggan svarade ${res.status}.`);
        }

      const läsare = res.body.getReader();
      const avkodare = new TextDecoder();
      let buffert = "";
      let färdig = false;
      while (!färdig) {
        const { done, value } = await läsare.read();
        if (done) break;
        buffert += avkodare.decode(value, { stream: true });
        let gräns = buffert.indexOf("\n\n");
        while (gräns >= 0) {
          const block = buffert.slice(0, gräns);
          buffert = buffert.slice(gräns + 2);
          gräns = buffert.indexOf("\n\n");
          const dataRad = block.split("\n").find((r) => r.startsWith("data: "));
          if (!dataRad) continue; // heartbeat-kommentarer osv.
          let event: StreamEvent;
          try {
            event = JSON.parse(dataRad.slice(6)) as StreamEvent;
          } catch {
            continue;
          }
          switch (event.typ) {
            case "hej":
              setLive(event.transport === "mock" ? "demo" : "live");
              // V84 B: hej bär sessionens id — tabben minns sin session så
              // nästa prompt (och sideload efter refresh) träffar rätt tabb.
              // VÅG 87 H1: pekaren skrivs även (localStorage) — huvudtabbens
              // session blir mount-återkopplingens prioriterade kandidat.
              if (event.sessionId) sparaSenasteSessionId(event.sessionId);
              if (event.sessionId) streamSessionId = event.sessionId; // VÅG 88 I3
              if (event.sessionId && !tabb.sessionId) {
                rörTabb(tabbId, (t) => ({ ...t, sessionId: event.sessionId ?? t.sessionId }));
              }
              break;
            case "status":
              sattStatus(event.text || "Agenten arbetar…");
              break;
            case "delta":
              if (event.kanal === "tankar") {
                rörTabb(tabbId, (t) => ({ ...t, tankar: (t.tankar + (event.text ?? "")).slice(-260) }));
              } else {
                rörAgent((m) => ({ ...m, text: m.text + (event.text ?? "") }));
                sattStatus("Svarar…");
              }
              break;
            case "verktyg":
              // V83 B1: den gamla verktygs-raden lever bara som tabbstatus —
              // korten (med argument+resultat) kommer via "verktyg_kort".
              sattStatus(`${event.händelse === "start" ? "Kör" : "Klart"}: ${event.namn ?? "verktyg"}`);
              break;
            case "verktyg_kort":
              // tool.updated-kartläggningen: merge:a kortet på id (senare
              // events berikar — argument → resultat → varaktighet).
              if (event.id) {
                uppdateraKort(event.id, (k) => ({
                  ...k,
                  namn: event.namn ?? k.namn,
                  steg: event.steg ?? k.steg,
                  argument: event.argument ?? k.argument,
                  beskrivning: event.beskrivning ?? k.beskrivning,
                  resultat: event.resultat ?? k.resultat,
                  fel: event.fel ?? k.fel,
                  varaktighetMs: event.varaktighetMs ?? k.varaktighetMs,
                  framsteg: event.framsteg ?? k.framsteg,
                }));
                sattStatus(
                  event.steg === "fel"
                    ? `${event.namn ?? "Verktyg"} misslyckades`
                    : event.steg === "resultat"
                      ? `${event.namn ?? "Verktyg"} klart${
                          typeof event.varaktighetMs === "number" ? ` (${msText(event.varaktighetMs)})` : ""
                        }`
                      : `${event.steg === "kör" ? "Kör" : "Förbereder"}: ${event.namn ?? "verktyg"}`,
                );
              }
              break;
            case "verktyg_input":
              // model.streaming tool_input_delta — argumenten strömmas LIVE.
              if (event.id) {
                uppdateraKort(event.id, (k) => ({
                  ...k,
                  liveInput: (k.liveInput ?? "") + (event.text ?? ""),
                }));
                sattStatus(
                  `Skriver verktygsargument: ${event.namn ?? (event.text ?? "").slice(0, 24)}`,
                );
              }
              break;
            case "runda":
              // turn.started/completed — rundstatistiken i bubblans fot.
              if (event.fas === "slut") {
                rörAgent((m) => ({
                  ...m,
                  rundStatistik: {
                    varaktighetMs: event.varaktighetMs,
                    resultatTyp: event.resultatTyp,
                    verktygAntal: event.verktygAntal,
                  },
                }));
              } else {
                sattStatus("Agenten arbetar…");
              }
              break;
            case "interaktion":
              // V83 B2: dialogkort väntar på användarens val — permission
              // (godkännande) eller fråga (requestUserInput). V84 C:
              // mottagenPermission kör reglerna först (auto-godkännande
              // med notis i flödet) — annars visas dialogen (med diff).
              // V84 B: dialogerna är GLOBALA (syns i aktiv vy) — svaret går
              // till rätt transport på servern oavsett tabb; en bakgrundstabb
              // som drabbas tostar så användaren märker det.
              if (tabbId !== aktivTabbIdRef.current) {
                visaToast("En tabb i bakgrunden väntar på ditt svar…");
              }
              if (event.interaktion?.typ === "permission") {
                mottagenPermission({
                  requestId: event.interaktion.requestId,
                  verktyg: event.interaktion.verktyg,
                  risk: event.interaktion.risk,
                  skäl: event.interaktion.skäl,
                  sammanfattning: event.interaktion.sammanfattning,
                  alternativ: event.interaktion.alternativ ?? [],
                  diff: event.interaktion.diff,
                });
                sattStatus("Väntar på ditt godkännande…");
              } else if (event.interaktion?.typ === "fråga") {
                setFraga({
                  requestId: event.interaktion.requestId,
                  fråga: event.interaktion.fråga,
                  inputTyp: event.interaktion.inputTyp,
                  val: event.interaktion.val,
                });
                setFragSvar("");
                sattStatus("Agenten frågar…");
              }
              break;
            case "interaktionsKlar":
              // V83 B2: löst (svar/avbruten/eskalerad) — stäng kortet.
              if (event.requestId) {
                setPermission((p) => (p?.requestId === event.requestId ? null : p));
                setFraga((f) => (f?.requestId === event.requestId ? null : f));
                if (event.beslut === "eskal") {
                  visaToast("Tidsgränsen löpte ut (30 s) — begäran eskalerades till agenten.", "fel");
                }
              }
              break;
            case "klart":
              rörAgent((m) => ({
                ...m,
                text: event.svar && event.svar.trim() ? event.svar : m.text || "(tomt svar)",
                strömmande: false,
              }));
              if (typeof event.tokenCount === "number" && event.tokenCount > 0) {
                // V84 C: klart-notisens "✓ Klar (N tkn)" (långa körningar).
                turnTknRef.current = event.tokenCount;
                rörTabb(tabbId, (t) => ({
                  ...t,
                  rundaTkn: event.tokenCount ?? null,
                  ackumulerat:
                    typeof event.tokenCount === "number"
                      ? (t.ackumulerat > 0 ? t.ackumulerat + event.tokenCount : event.tokenCount)
                      : t.ackumulerat,
                }));
              }
              // VÅG 88 I3: skriv sessionens meddelanden till IndexedDB vid
              // varje klart — beständig cache som överlever flikstängning +
              // CACHE-META ({sessionId, sistSparad, antalMeddelanden}) i
              // localStorage. Historiken byggs ur ström-closuren (sänd-
              // tidens tabb-snapshot + denna runda) — INTE ur React-state
              // som ej hunnit commit:as. Fire-and-forget: cachen är lyx.
              if (streamSessionId) {
                void sparaHistorikCache(streamSessionId, [
                  ...tabb.meddelanden.map((m) => ({ roll: m.roll, text: m.text })),
                  { roll: "user" as const, text },
                  {
                    roll: "assistant" as const,
                    text: event.svar && event.svar.trim() ? event.svar : "(tomt svar)",
                  },
                ]);
              }
              färdig = true;
              break;
            case "kontext":
              // V2: färsk projektion efter rundan — TABBENS kontextrad.
              if (event.kontext) {
                rörTabb(tabbId, (t) => ({
                  ...t,
                  kontext: event.kontext ?? null,
                  ackumulerat:
                    typeof event.kontext?.totalTokenCount === "number"
                      ? event.kontext.totalTokenCount
                      : t.ackumulerat,
                }));
              }
              break;
            case "fel":
              rörAgent((m) => ({
                ...m,
                strömmande: false,
                fel: true,
                text: m.text || event.meddelande || "Okänt fel.",
              }));
              loggaNotis(`Fel: ${event.meddelande || "okänt fel"}`.slice(0, 120), "fel"); // V86 G6
              färdig = true;
              break;
            case "ändringar":
              // V83 B1: senaste turnens filändringar (SSE efter klart +
              // kontext) — "Ändringar"-panelen per turn (i DENNA tabben).
              if (Array.isArray(event.filer)) {
                const filer = event.filer;
                rörAgent((m) => ({ ...m, ändringar: filer }));
              }
              break;
          }
        }
      }
      rörAgent((m) => ({ ...m, strömmande: false }));
      } catch (fel) {
        if ((fel as Error).name !== "AbortError") {
          rörAgent((m) => ({
            ...m,
            strömmande: false,
            fel: true,
            text: m.text || (fel instanceof Error ? fel.message : "Bryggfel."),
          }));
        } else {
          rörAgent((m) => ({ ...m, strömmande: false, text: m.text || "(avbruten)" }));
        }
      } finally {
        rörTabb(tabbId, (t) => ({ ...t, strömmar: false, tankar: "", status: "" }));
        tabbAbortRef.current.delete(tabbId);
        setStatusText((nuvarande) =>
          nuvarande.startsWith("Sessionen") || nuvarande.startsWith("Demo")
            ? nuvarande
            : live === "demo"
              ? "Demo-läge (mock-transport)"
              : "Sessionen lever",
        );
      }
    },
    [live, visaToast, mottagenPermission, rörTabb, loggaNotis],
  );

  /** Skicka från skrivfältet —Kommandon först, sedan prompten i AKTIVA tabben. */
  const skicka = React.useCallback(async () => {
    const text = prompt.trim();
    if (!text || strömmar) return;
    setPrompterOppen(false); // G2: skickad rad = bibliotekets dropdown stängs

    // ── VÅG 83 B4: snabbkommandon parsas LOKALT före sändning ──
    // (rad som börjar med "/" lämnar ALDRIG browsern som prompt; de med
    // API-väg anropar bryggan här, resten är lokal hjälp).
    const kommando = parsaKommando(text);
    if (kommando) {
      setPrompt("");
      if (!kommando.kommando) return; // bart "/" — avfärdat utan brus
      pushaHistorik(text); // G2: även kommandon återkallas med pil-upp (som terminal)
      await korKommando(kommando.kommando, kommando.argument);
      return;
    }

    // VÅG 85 F1: mål-loopen kör — en manuell prompt kan kollidera med en
    // pågående mål-turn (serverns -32010 "prompt already running"). Fråga
    // ÄRLIGT i stället för att låta fel-eventet förklara.
    if (malKör && !window.confirm("Mål-loopen kör — skicka prompten ändå? Agenten kan vara mitt i en iteration (vänta i så fall).")) {
      return;
    }

    setPrompt("");
    pushaHistorik(text); // G2: prompthistoriken (pil-upp återkallar)
    await skickaPrompt(aktivTabbIdRef.current, text);
  }, [prompt, strömmar, korKommando, skickaPrompt, malKör, pushaHistorik]);

  /** Stoppa DEN AKTIVA TABBENS ström (session/stop via serverns abort-signal). */
  const stoppa = React.useCallback(() => {
    tabbAbortRef.current.get(aktivTabbIdRef.current)?.abort();
  }, []);

  // ── V84 A5: EXPORTCHATT — hela chatten som markdown-fil (datum i namnet;
  // agent-meddelanden som block, användare som blockcitat) ─────────────────
  const exporteraChat = React.useCallback(() => {
    if (meddelanden.length === 0) {
      visaToast("Chatten är tom — inget att exportera än.", "fel");
      return;
    }
    const nu = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const datum = `${nu.getFullYear()}-${pad(nu.getMonth() + 1)}-${pad(nu.getDate())}`;
    const tid = `${pad(nu.getHours())}${pad(nu.getMinutes())}`;
    const rader: string[] = [
      `# AK1A Studio — chatt ${datum}`,
      "",
      `- **Exporterad:** ${nu.toLocaleString("sv-SE")}`,
      kontext?.modell ? `- **Modell:** ${kontext.modell}` : "",
      `- **Meddelanden:** ${meddelanden.length}`,
      "",
      "---",
      "",
    ].filter((r) => r !== "");
    for (const m of meddelanden) {
      if (m.roll === "user") {
        rader.push(m.text.split("\n").map((rad) => `> ${rad}`).join("\n") || ">");
      } else {
        rader.push(m.text || "_(tomt svar)_");
      }
      rader.push("");
    }
    const blob = new Blob([rader.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-chatt-${datum}-${tid}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
    visaToast("Chatten exporterad som markdown.");
  }, [meddelanden, kontext, visaToast]);

  // ── V86 G7: EXPORTCHATT SOM HTML — fristående AK1A-stilad fil (printbar);
  // motorn (byggChatHtml: marin header, agent-bubblor i papper-stil, kodblock
  // monospace, diff grönt/rött) lever i studio-html-export.ts ────────────────
  const exporteraChatHtml = React.useCallback(() => {
    if (meddelanden.length === 0) {
      visaToast("Chatten är tom — inget att exportera än.", "fel");
      return;
    }
    const nu = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const datum = `${nu.getFullYear()}-${pad(nu.getMonth() + 1)}-${pad(nu.getDate())}`;
    const tid = `${pad(nu.getHours())}${pad(nu.getMinutes())}`;
    const blob = new Blob([byggChatHtml(meddelanden, kontext?.modell)], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-chatt-${datum}-${tid}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
    visaToast("Chatten exporterad som HTML — öppna filen och skriv ut direkt.");
  }, [meddelanden, kontext, visaToast]);

  // ── V84 A4: MEDDELANDESÖKNING — träfflista i dokumentordning ────────────
  const sokTräffar = React.useMemo<SokTräff[]>(() => {
    const fras = sokFras.trim();
    if (!fras || !sokOppen) return [];
    const ut: SokTräff[] = [];
    for (const m of meddelanden) {
      for (let f = 0; f < raknaForekomster(m.text, fras); f++) {
        ut.push({ meddelandeId: m.id, forekomst: f });
      }
    }
    return ut;
  }, [meddelanden, sokFras, sokOppen]);

  // Håll indexet inom intervallet när frasen/träffantalet ändras.
  React.useEffect(() => {
    setSokIndex((i) => Math.min(Math.max(0, i), Math.max(0, sokTräffar.length - 1)));
  }, [sokTräffar.length]);

  /** Aktiv träff — stark highlight + scroll till meddelandet (centrerat). */
  const aktivTräff = sokTräffar.length > 0 ? sokTräffar[Math.min(sokIndex, sokTräffar.length - 1)] : null;
  React.useEffect(() => {
    if (!aktivTräff) return;
    const el = meddelandeRefs.current.get(aktivTräff.meddelandeId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [aktivTräff]);

  /** Pilnavigering bland träffar (cyklisk — som Z: runt, runt). */
  const hoppaSok = React.useCallback(
    (steg: 1 | -1) => {
      if (sokTräffar.length === 0) return;
      setSokIndex((i) => (i + steg + sokTräffar.length) % sokTräffar.length);
    },
    [sokTräffar.length],
  );

  // ── V84 A2: KOMMANDOPALETTEN (Ctrl/Cmd+K) — poster ur registret ─────────
  const palettPoster = React.useMemo<PalettPost[]>(() => {
    const poster: PalettPost[] = STUDIO_KOMMANDON.map((k) => ({
      id: `cmd-${k.namn}`,
      etikett: k.syntax,
      beskrivning: k.beskrivning,
      grupp: "Kommandon" as const,
      ikon: "kommando" as const,
      sokbar: `${k.syntax} ${k.namn} ${k.beskrivning}`.toLowerCase(),
      kor: () => void korKommando(k.namn),
    }));
    for (const m of modeller) {
      poster.push({
        id: `modell-${m.id}`,
        etikett: `Byt modell — ${m.namn}`,
        beskrivning: `/modell ${m.id} — ny session skapas med modellen`,
        grupp: "Modeller",
        ikon: "modell",
        sokbar: `byt modell ${m.id} ${m.namn} /modell`.toLowerCase(),
        kor: () => void bytModell(m.id),
      });
    }
    poster.push({
      id: "tema",
      etikett: morkLage ? "Tema — växla till ljus (paper)" : "Tema — växla till mörk (marin natt)",
      beskrivning: "Studions tema med AK1A-guld på båda bottnarna — också tangent T",
      grupp: "Utseende",
      ikon: "tema",
      sokbar: "tema mörk ljus dark light växla utseende t".toLowerCase(),
      kor: vaxlaTema,
    });
    const f = palettFras.trim().toLowerCase();
    if (!f) return poster;
    return poster.filter((p) => p.sokbar.includes(f));
  }, [modeller, palettFras, morkLage, korKommando, bytModell, vaxlaTema]);

  // Nollställ markeringen när filtreringen ändras / paletten öppnas.
  React.useEffect(() => {
    setPalettIndex(0);
  }, [palettFras, palettOppen]);

  // Tangentnavigering i listan — vald rad scrollas fram (block:nearest).
  React.useEffect(() => {
    const p = palettPoster[palettIndex];
    if (!p || !palettOppen) return;
    palettRadRefs.current.get(p.id)?.scrollIntoView({ block: "nearest" });
  }, [palettIndex, palettPoster, palettOppen]);

  // ── VÅG 86 G1: SLASH-AUTOCOMPLETE — "/" som första tecken i skrivfältet
  // öppnar en dropdown ovanför fältet med ALLA matchande kommandon ur
  // STUDIO_KOMMANDON (prefix på namnet). Första mellanslaget (argumentet
  // börjar) stänger listan; Esc stänger tills frasen ändras igen. ─────────
  const slashFras = React.useMemo(() => {
    if (!prompt.startsWith("/")) return null;
    const rest = prompt.slice(1);
    if (rest.includes(" ")) return null; // argumentet skrivs — listan stängd
    return rest.toLowerCase();
  }, [prompt]);

  const slashPoster = React.useMemo(
    () => (slashFras === null ? [] : STUDIO_KOMMANDON.filter((k) => k.namn.startsWith(slashFras))),
    [slashFras],
  );

  // Ömsesidigt uteslutande: bibliotekets dropdown vinner över slash-listan.
  const slashSynlig = slashFras !== null && !slashStangd && !prompterOppen && slashPoster.length > 0;

  // Ny fras = listan börjar om: Esc-låset glöms och markeringen återgår till topp.
  React.useEffect(() => {
    setSlashIndex(0);
    setSlashStangd(false);
  }, [slashFras]);

  // Vald slash-rad scrollas fram när piltangenterna rör sig (mobil: max-h-48).
  React.useEffect(() => {
    if (!slashSynlig) return;
    const k = slashPoster[slashIndex];
    if (k) slashRadRefs.current.get(k.namn)?.scrollIntoView({ block: "nearest" });
  }, [slashIndex, slashPoster, slashSynlig]);

  /** G1: välj en slash-träff (Enter/klick) — infogar kommandot OCH kör det. */
  const valjSlash = React.useCallback(
    (k: StudioKommando) => {
      setSlashStangd(true);
      setPrompt("");
      void korKommando(k.namn);
    },
    [korKommando],
  );

  /** G1: Tab kompletterar markerad träff till fältet (med argumentplats, utan att köra). */
  const kompletteraSlash = React.useCallback((k: StudioKommando) => {
    historikIndexRef.current = null; // G2: programmatisk ifyllning avslutar historikbläddring
    setPrompt(`/${k.namn} `);
    setSlashStangd(true); // första ordet klart — argumentet skrivs utan listan
    ytaRef.current?.focus();
  }, []);

  /**
   * G2: bläddra i prompthistoriken — som terminalen. riktning 1 = upp mot
   * äldre (startar bara från tomt fält), -1 = ner mot nyare (förbi senaste
   * återställs fältets innehåll före bläddringen). false = pilen får flytta
   * markören som vanligt (fältet har text / historiken är tom).
   */
  const blattraHistorik = React.useCallback(
    (riktning: 1 | -1): boolean => {
      if (promptHistorik.length === 0) return false;
      const nu = historikIndexRef.current;
      if (riktning === 1) {
        if (nu === null) {
          if (prompt.trim() !== "") return false; // endast tomt fält startar
          historikUtkastRef.current = prompt;
          historikIndexRef.current = 0;
          setPrompt(promptHistorik[0]);
          return true;
        }
        if (nu + 1 >= promptHistorik.length) return true; // redan äldst — stanna
        historikIndexRef.current = nu + 1;
        setPrompt(promptHistorik[nu + 1]);
        return true;
      }
      if (nu === null) return false;
      if (nu - 1 < 0) {
        historikIndexRef.current = null;
        setPrompt(historikUtkastRef.current);
        return true;
      }
      historikIndexRef.current = nu - 1;
      setPrompt(promptHistorik[nu - 1]);
      return true;
    },
    [promptHistorik, prompt],
  );

  /** Öppna paletten (knapp eller Ctrl/Cmd+K). */
  const oppnaPalett = React.useCallback(() => {
    setPalettFras("");
    setPalettIndex(0);
    setPalettOppen(true);
  }, []);

  // ── V84 A1/A2: GLOBALA GENVÄGAR — Ctrl/Cmd+K (palett), T (tema),
  // Esc (stäng palett/sök). T ignoreras i inmatningsfält + med modifier. ──
  React.useEffect(() => {
    const paTangent = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalettOppen((v) => {
          if (v) return false;
          setPalettFras("");
          setPalettIndex(0);
          return true;
        });
        return;
      }
      if (e.key === "Escape") {
        if (palettOppen) {
          setPalettOppen(false);
        } else if (sokOppen) {
          setSokOppen(false);
          setSokFras("");
        } else if (prompterOppen) {
          // VÅG 86 G2: Esc stänger även promptbibliotekets dropdown
          setPrompterOppen(false);
        }
        // V86 G6/G7: Esc stänger alltid öppna paneler/overlay/kebab (no-op
        // när dom redan är stängda — samma mönster som paletten ovan).
        setVisaGenvagar(false);
        setVisaNotiser(false);
        setInstallningarOppen(false); // VÅG 88 I1: inställnings-drawern
        setKebabOppen(false);
        return;
      }
      const mal = e.target as HTMLElement | null;
      const iRedigerbart =
        !!mal &&
        (mal.tagName === "INPUT" ||
          mal.tagName === "TEXTAREA" ||
          mal.tagName === "SELECT" ||
          mal.isContentEditable);
      if (iRedigerbart || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        vaxlaTema();
      } else if (e.key === "?") {
        // V86 G6: "?" visar tangentbordsgenvägarna (ovanför palett/sök i
        // Esc-kedjan — samma skärm-tangent som Z:s hjälpkort).
        e.preventDefault();
        setVisaGenvagar((v) => !v);
      }
    };
    window.addEventListener("keydown", paTangent);
    return () => window.removeEventListener("keydown", paTangent);
  }, [palettOppen, sokOppen, prompterOppen, vaxlaTema]);

  // Fokus i sökfältet när det öppnas (autofocus räcker ej vid återöppning).
  React.useEffect(() => {
    if (sokOppen) sokInputRef.current?.focus();
  }, [sokOppen]);

  // Fokus i palettens sökrad när den öppnas (Ctrl/Cmd+K + knapp).
  React.useEffect(() => {
    if (palettOppen) palettInputRef.current?.focus();
  }, [palettOppen]);

  /** Infoga en uppladdad sökväg i prompten ("Titta på …"). */
  const infogaSokvag = (sokvag: string, typ: string) => {
    const led = typ === "bild" ? `Titta på bilden ${sokvag} — ` : `Läs filen ${sokvag} — `;
    setPrompt((p) => (p.includes(sokvag) ? p : `${p}${p && !p.endsWith(" ") ? " " : ""}${led}`));
    ytaRef.current?.focus();
  };

  const prickFärg =
    live === "live" ? "bg-emerald-500" : live === "demo" ? "bg-gold-soft" : "bg-red-500";
  const prickText = live === "live" ? "LIVE" : live === "demo" ? "DEMO" : "NED";

  // VÅG 88 I1: vald modells VISNINGSNAMN — headerns etikett ("AK1A Studio ·
  // GLM-5.3") + Inställningar-drawerns radio-etikett. Listan bär namnet ur
  // config.json; utan träff faller modellBadge (id:t trimmat).
  const modellEtikett = React.useMemo(
    () =>
      modeller.find((m) => m.id === valdModell)?.namn ??
      (valdModell ? modellBadge(valdModell) : "—"),
    [modeller, valdModell],
  );

  // Kontextberäkning (V2): protokollets ÄRLIGA contextWindow är taket
  // (200 000 för zai/GLM vid v82-beviset); 1 000 000 endast som reserv.
  const kontextTak =
    typeof kontext?.contextWindow === "number" && kontext.contextWindow > 0
      ? kontext.contextWindow
      : KONTEXT_TAK_RESERV;
  const kontextAnvänt =
    typeof kontext?.contextUsed === "number" && kontext.contextUsed > 0
      ? kontext.contextUsed
      : ackumulerat;
  const kontextProcent = kontextAnvänt > 0 ? Math.min(100, (kontextAnvänt / kontextTak) * 100) : null;

  return (
    <div
      className={cn(
        // VÅG 87 H3+H4: .studio-root scope:ar focus-ring (guld/40) +
        // touch-feedback (tap-highlight transparent + tryck-skala).
        "studio-root paper-texture flex h-[100dvh] flex-col",
        morkLage && "dark",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDraÖver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDraÖver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDraÖver(false);
        const filer = Array.from(e.dataTransfer?.files ?? []);
        if (filer.length > 0) void laddaUpp(filer);
      }}
    >
      {/* Bekräftelse-toast (modellbyte / ny session / komprimering) */}
      {toast && (
        <div
          role="status"
          className={cn(
            "fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-xl border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur",
            toast.ton === "fel"
              ? "border-red-500/40 bg-red-950/90 text-red-100"
              : "border-gold/50 bg-[#10233F]/95 text-[#EDE6D6]",
          )}
        >
          {toast.ton === "guld" && <span className="mr-1.5 text-gold">✦</span>}
          {toast.text}
        </div>
      )}

      {/* Marin rubrikrad — VÅG 88 I1 MENY-KONSOLIDERING: headern är ENRADIG
            och REN (logo | Studio-titel + modell | status-prick | ⚙️) —
            dropdowns (modell/läge/tanke) + tema-knapp bor numera i
            Inställningar-drawern (stora tryckytor på mobil). Kontextraden
            (tokens + verktygsrad) lever kvar under. */}
      {/* VÅG 87 H4 1: studio-safe-top = pt-safe (env(safe-area-inset-top) —
          viewport-fit=cover i page.tsx ger env() värden under notch/statusrad). */}
      <header className="marin-panel studio-safe-top sticky top-0 z-20 border-b border-gold/25 shadow-md">
        <div className="mx-auto w-full max-w-3xl px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <VarumarkesLogo storlek="sm" medText={false} onClick={hem} />
            <div className="min-w-0 flex-1">
              {/* VÅG 88 I1: vald modell som etikett vid titeln — "AK1A Studio · GLM-5.3". */}
              <h1 className="min-w-0 truncate font-serif text-base font-bold leading-tight tracking-tight text-[#EDE6D6] sm:text-lg">
                AK1A <span className="text-gold">Studio</span>
                <span
                  className="ml-1.5 whitespace-nowrap align-middle font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#EDE6D6]/55 sm:text-[11px]"
                  title={`Vald modell: ${modellEtikett} — byt under ⚙️ Inställningar`}
                >
                  · {modellEtikett}
                </span>
              </h1>
            </div>
            {/* VÅG 88 I1: status-pricken — liten prick i titelraden, ingen egen
                badge-rad (title/aria-label bär LIVE/DEMO/NED-texten). */}
            <span
              className={cn("h-2 w-2 shrink-0 animate-pulse rounded-full", prickFärg)}
              role="status"
              aria-label={`${prickText}: ${statusText}`}
              title={`${prickText} — ${statusText}`}
            />
            {/* VÅG 85 F1: MÅL-BADGE — guldpulserande när loopen kör +
                iterationsräknare; klick öppnar mål-dialogen. */}
            {mal && (
              <button
                onClick={oppnaMalDialog}
                title={
                  malKör
                    ? `MÅL AKTIVT — agenten utvecklar autonomt (iteration ${malIteration}) · klicka för att se/ändra målet`
                    : malPausat
                      ? `MÅL PAUSAT efter ${malIteration} iterationer · klicka för att återuppta`
                      : "Mål satt — klicka för att öppna mål-läget"
                }
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 transition-colors",
                  malKör
                    ? "animate-pulse border-gold/70 bg-gold/20 text-gold"
                    : malPausat
                      ? "border-gold/30 bg-black/20 text-[#EDE6D6]/75"
                      : "border-gold/40 bg-gold/10 text-gold/90",
                )}
              >
                <Target className="h-3 w-3 shrink-0" />
                <span className="text-[9px] font-bold tracking-wider">
                  {malKör ? "MÅL AKTIVT" : malPausat ? "MÅL PAUSAT" : "MÅL"}
                </span>
                <span className="rounded-full bg-black/40 px-1.5 text-[9px] font-bold tabular-nums text-gold">
                  {malIteration}
                </span>
              </button>
            )}
            {/* VÅG 88 I1: ⚙️ Inställningar — ALLA kontroller (modell, läge,
                tankestyrka, tema) i EN drawer med stora tryckytor. h-9 w-9 =
                mobilvänligt klickmål i headerns enda rad. */}
            <button
              onClick={() => (installningarOppen ? setInstallningarOppen(false) : oppnaInstallningar())}
              title="Inställningar — modell, läge, tankestyrka och tema"
              aria-label="Inställningar (modell, läge, tankestyrka, tema)"
              aria-expanded={installningarOppen}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-black/25 text-gold transition-colors hover:border-gold/60 hover:bg-black/40"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* KONTEXTRAD (V2 → VÅG 88 I1 förenklad): "📊 X tkn · Y%" — inget mer.
            Progressbaren och totalen bor i Inställningar-drawern (⚙️) —
            headerns rad ska läsas på en sekund även på mobil. */}
        <div className="border-t border-gold/15 bg-black/15">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-1.5 sm:px-4">
            <span
              className="whitespace-nowrap text-[11px] tabular-nums text-[#EDE6D6]/85"
              title={`Denna runda: ${rundaTkn !== null ? `${tkn(rundaTkn)} tkn` : "—"} · totalt ~${tkn(ackumulerat)} tkn${kontextProcent !== null ? ` · ${kontextProcent.toFixed(kontextProcent < 10 ? 1 : 0)}% av taket (${tkn(kontextTak)})` : ""} — detaljer under ⚙️ Inställningar`}
            >
              📊 {tkn(ackumulerat)} tkn
              {kontextProcent !== null && (
                <span className={cn("ml-1 font-semibold", kontextProcent >= KONTEXT_VARNING_PROCENT ? "text-gold" : "text-[#EDE6D6]/60")}>
                  · {kontextProcent.toFixed(kontextProcent < 10 ? 1 : 0)}%
                </span>
              )}
            </span>
            <span className="ml-auto flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* V84 100x-mobilfix: horisontell ikonrad — text-etiketterna
                  göms under sm (ikon + title kvar), raden scrollar aldrig
                  sidan utan rullar i sig själv. */}
              {/* V84 A4: sök i chatten — highlight + räknare + pilnavigering */}
              <button
                onClick={() => {
                  const ny = !sokOppen;
                  setSokOppen(ny);
                  if (!ny) setSokFras("");
                }}
                title="Sök i chatten (highlight + pilnavigering)"
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-colors hover:bg-white/10",
                  sokOppen ? "text-gold" : "text-[#EDE6D6]/85 hover:text-[#EDE6D6]",
                )}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sök</span>
              </button>
              {/* V84 A2: kommandopaletten — även på mobil (ingen Ctrl där) */}
              <button
                onClick={oppnaPalett}
                title="Kommandopalett (Ctrl/Cmd+K)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <Command className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">⌘K</span>
              </button>
              {/* V84 A5 + V86 G7: exportera chatten — markdown + HTML.
                  Mobil (<sm): knappen bor i kebabmenyn (⋮) i stället. */}
              <button
                onClick={exporteraChat}
                title="Exportera chatten som markdown-fil (datum i filnamnet)"
                className="hidden items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] sm:flex"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exportera</span>
              </button>
              {/* V86 G7: HTML-exporten — snygg fristående fil, printbar */}
              <button
                onClick={exporteraChatHtml}
                title="Exportera chatten som fristående HTML-fil i AK1A-stil (printbar — öppna och skriv ut)"
                className="hidden items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] sm:flex"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exportera HTML</span>
              </button>
              {/* V86 G7: kebabmeny (⋮) — export-knapparna på mobil */}
              <button
                onClick={() => setKebabOppen((v) => !v)}
                title="Exportera — markdown eller HTML (Genvägar finns också här)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] sm:hidden"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setVisaMinne(false);
                  setMinneVald(null);
                  setMinneRedigerar(false);
                  setMinneNy(false);
                  setVisaFardigheter(false);
                  setVisaNotiser(false); // V86 G6: ömsesidig stängning
                  if (visaFiler) setVisaFiler(false);
                  else oppnaFiltrad();
                }}
                title="Filträdet — agentens arbetsyta (förhandsgranska filer och bilder, töm uploads)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <FolderTree className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filer</span>
              </button>
              {/* VÅG 84 D: Minne 🧠 — agentens minnesfiler, redigerbara */}
              <button
                onClick={() => {
                  setVisaNotiser(false); // V86 G6: ömsesidig stängning
                  if (visaMinne) setVisaMinne(false);
                  else oppnaMinne();
                }}
                title="Minne — vad agenten kommer ihåg (minnesfiler + stående instruktioner, redigerbara)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <Brain className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Minne</span>
                {minneFiler && minneFiler.length > 0 && (
                  <span className="rounded-full bg-gold/20 px-1.5 text-[9px] font-bold text-gold">
                    {minneFiler.length}
                  </span>
                )}
              </button>
              {/* VÅG 85 F2: Färdigheter ⚡ — skills/plugins/MCP ("vad agenten KAN") */}
              <button
                onClick={() => {
                  setVisaNotiser(false); // V86 G6: ömsesidig stängning
                  if (visaFardigheter) setVisaFardigheter(false);
                  else oppnaFardigheter();
                }}
                title="Färdigheter — vad agenten KAN (skills/referenceCatalog + plugins/list + mcp/list)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Färdigheter</span>
                {fardigheterSkills && fardigheterSkills.length > 0 && (
                  <span className="rounded-full bg-gold/20 px-1.5 text-[9px] font-bold text-gold">
                    {fardigheterSkills.length}
                  </span>
                )}
              </button>
              {/* VÅG 88 I2: Verktyg 🔧 — admin-kommandon (variabler/priser,
                  blogg-publicering, minne) — kunden styr hela systemet
                  från ETT ställe; studion kräver redan admin ⇒ alltid synlig. */}
              <button
                onClick={() => {
                  if (visaAdmin) setVisaAdmin(false);
                  else oppnaAdmin();
                }}
                title="Verktyg — admin-kommandon (variabler/priser, blogg-publicering, minne)"
                aria-label="Verktyg (admin-kommandon)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-gold/90 transition-colors hover:bg-gold/15 hover:text-gold"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Verktyg</span>
              </button>
              <button
                onClick={() => void startaNySession()}
                disabled={sessionJobbar !== "" || strömmarHuvud || !arHuvudAktiv}
                title="Kassera sessionen och börja en frisk kontext (1M-fönstret börjar om — gamla sessioner finns kvar i listan)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
              >
                {sessionJobbar === "ny" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SquarePen className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Ny session</span>
              </button>
              <button
                onClick={() => void komprimera()}
                disabled={sessionJobbar !== "" || strömmarHuvud || !arHuvudAktiv}
                title="Komprimera kontexten (session/compact — agenten sammanfattar och fönstret frias)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
              >
                {sessionJobbar === "compact" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shrink className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Komprimera</span>
              </button>
              {/* VÅG 83 B3 + VÅG 85 F1: MÅL (session/goal — öppnar den STORA
                  mål-dialogen: beskriv utvecklingsmålet → Starta → autonom
                  loop) + BAKGRUNDSAGENTER (subagents) */}
              <button
                onClick={oppnaMalDialog}
                title="Mål-läge (session/goal) — beskriv ett utvecklingsmål och agenten itererar autonomt tills du pausar"
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-colors hover:bg-white/10",
                  malKör ? "text-gold" : "text-[#EDE6D6]/85 hover:text-[#EDE6D6]",
                )}
              >
                <Target className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mål</span>
                {malKör ? (
                  <span className="rounded-full bg-gold/20 px-1.5 text-[9px] font-bold tabular-nums text-gold" title={`Autonom iteration ${malIteration} kör`}>
                    {malIteration}
                  </span>
                ) : (
                  mal && <span className="h-1.5 w-1.5 rounded-full bg-gold" title="Mål satt" />
                )}
              </button>
              <button
                onClick={() => {
                  const ny = !visaAgenter;
                  setVisaAgenter(ny);
                  if (ny) void lasAgenter();
                }}
                title="Bakgrundsagenter (session/subagents) — status + avbryt"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <Bot className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Agenter</span>
              </button>
              <button
                onClick={() => {
                  const ny = !visaSessioner;
                  setVisaSessioner(ny);
                  if (ny) void lasSessioner();
                }}
                title="Sessioner (session/list) — klicka en session för att öppna den (session/resume)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sessioner</span>
                {sessioner.length > 0 && <span className="rounded-full bg-gold/20 px-1.5 text-[9px] font-bold text-gold">{sessioner.length}</span>}
              </button>
              {/* V84 C: REGLER — "alltid tillåt"-minnet (localStorage) med
                  hanteringspanel; NOTISER — Web Notification vid >60 s-turner. */}
              <button
                onClick={() => setVisaRegler((v) => !v)}
                title="Minnesregler — ”alltid tillåt” per verktyg (localStorage ak1a-studio-regler); matchande begäranden godkänns automatiskt"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Regler</span>
                {regler.length > 0 && (
                  <span className="rounded-full bg-gold/20 px-1.5 text-[9px] font-bold text-gold">{regler.length}</span>
                )}
              </button>
              {/* V86 G6: 🔔 öppnar NOTISPANELEN (historik + på/av + töm) —
                  rättigheten begärs numera inuti panelen, inte på klicket. */}
              <button
                onClick={() => (visaNotiser ? setVisaNotiser(false) : oppnaNotiser())}
                title={
                  notisRattighet === "granted"
                    ? `Notishistorik — rundor över 60 s pingar och ”✓ Klar (N tkn)” loggas (${notiser.length} i historiken)`
                    : `Notishistorik (${notiser.length}) — slå på notiser inuti panelen: rundor över 60 s pingar när agenten är klar`
                }
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-colors hover:bg-white/10",
                  notisRattighet === "granted" ? "text-emerald-300" : "text-[#EDE6D6]/85 hover:text-[#EDE6D6]",
                )}
              >
                {notisRattighet === "granted" ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Notiser</span>
                {notiser.length > 0 && (
                  <span className="rounded-full bg-gold/20 px-1.5 text-[9px] font-bold text-gold">{notiser.length}</span>
                )}
              </button>
            </span>
          </div>

          {/* V84 C: REGELPANEL — "alltid tillåt"-minnet (lista + ta bort). */}
          {visaRegler && (
            <div className="border-t border-gold/15 bg-black/25">
              <div className="mx-auto max-h-44 w-full max-w-3xl overflow-y-auto px-3 py-2 sm:px-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/50">
                  Minnesregler — {regler.length === 0 ? "inga sparade" : `${regler.length} ${regler.length === 1 ? "regel" : "regler"}`}
                </p>
                {regler.length === 0 ? (
                  <p className="text-[11px] leading-relaxed text-[#EDE6D6]/50">
                    Inga ”alltid tillåt”-regler än — spara en direkt i godkännandedialogen
                    (”⛨ Alltid tillåta &lt;verktyg&gt;”) så godkänns framtida begäranden för
                    verktyget automatiskt med en notis i flödet. Reglerna lever i denna
                    webbläsare (localStorage) och påverkar aldrig serverns egna regler.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {regler.map((r) => (
                      <li
                        key={r.verktyg}
                        className="group flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px] text-[#EDE6D6]/80"
                        title={`${r.verktyg} — sparad ${new Date(r.skapad).toLocaleString("sv-SE")}`}
                      >
                        {(() => {
                          const klass = verktygsriskKlass(r.verktyg);
                          return (
                            <span
                              className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider", klass.farg)}
                              title={klass.forklaring}
                            >
                              {klass.etikett}
                            </span>
                          );
                        })()}
                        <span className="min-w-0 flex-1 truncate font-mono">{r.verktyg}</span>
                        <span className="shrink-0 text-[9px] uppercase tracking-wider text-emerald-300/80">alltid tillåt</span>
                        <button
                          onClick={() => {
                            tabortRegel(r.verktyg);
                            visaToast(`Regeln för ${r.verktyg} borttagen — framtida begäranden visar dialogen igen.`);
                          }}
                          title="Ta bort regeln"
                          className="shrink-0 rounded p-0.5 text-[#EDE6D6]/40 transition-colors hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* V84 A4: SÖKFÄLT — highlight i chatten + räknare + pilnavigering
              (Enter = nästa träff, Skift+Enter = föregående, Esc = stäng). */}
          {sokOppen && (
            <div className="border-t border-gold/15 bg-black/25">
              <div className="mx-auto flex w-full max-w-3xl items-center gap-1.5 px-3 py-1.5 sm:px-4">
                <Search className="h-3.5 w-3.5 shrink-0 text-gold" />
                <input
                  ref={sokInputRef}
                  value={sokFras}
                  onChange={(e) => setSokFras(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      hoppaSok(e.shiftKey ? -1 : 1);
                    }
                  }}
                  placeholder="Sök i chatten…"
                  maxLength={120}
                  className="min-w-0 flex-1 rounded-md border border-gold/40 bg-black/30 px-2.5 py-1 text-[11px] text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70"
                />
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-[#EDE6D6]/60" aria-live="polite">
                  {sokFras.trim()
                    ? sokTräffar.length > 0
                      ? `${Math.min(sokIndex, sokTräffar.length - 1) + 1}/${sokTräffar.length}`
                      : "0 träffar"
                    : ""}
                </span>
                <button
                  onClick={() => hoppaSok(-1)}
                  disabled={sokTräffar.length === 0}
                  title="Föregående träff (Skift+Enter)"
                  className="shrink-0 rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-40"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => hoppaSok(1)}
                  disabled={sokTräffar.length === 0}
                  title="Nästa träff (Enter)"
                  className="shrink-0 rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-40"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setSokOppen(false);
                    setSokFras("");
                  }}
                  title="Stäng sök (Esc)"
                  className="shrink-0 rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* VÅG 85 F1: MÅL-RADEN (headerns meny) — målet visas när det finns
              med iterationsräknare + Pausa/Återuppta + Redigera (dialog) +
              Rensa. När loopen kör bygger den autonoma bannern (ovanför
              chatten) vidare på samma status. */}
          {mal && (
            <div className="border-t border-gold/15 bg-black/10">
              <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-1.5 sm:px-4">
                <Target className="h-3.5 w-3.5 shrink-0 text-gold" />
                <span
                  className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#EDE6D6]/90"
                  title={mal}
                >
                  {mal}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums",
                    malKör ? "bg-gold/20 text-gold" : "bg-white/10 text-[#EDE6D6]/70",
                  )}
                  title={`Iterationer sedan målet sattes: ${malIteration}`}
                >
                  iter {malIteration}
                </span>
                {malSparar || malPausar ? (
                  <Loader2 className="h-3 w-3 shrink-0 animate-spin text-gold" />
                ) : malKör ? (
                  <button
                    onClick={() => void pausaMal()}
                    title="Pausa målet (session/stop — den pågående iterationen avbryts)"
                    className="shrink-0 rounded-md border border-gold/40 px-1.5 py-0.5 text-[10px] font-semibold text-gold transition-colors hover:bg-gold/15"
                  >
                    Pausa
                  </button>
                ) : malPausat ? (
                  <button
                    onClick={() => void aterupptaMal()}
                    title="Återuppta målet (session/goal resume) — agenten fortsätter mot målet"
                    className="shrink-0 rounded-md border border-emerald-400/40 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/15"
                  >
                    Återuppta
                  </button>
                ) : null}
                <button
                  onClick={oppnaMalDialog}
                  title="Redigera målet (mål-dialogen — session/goal set)"
                  className="shrink-0 rounded p-0.5 text-[#EDE6D6]/60 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => void rensaMaler()}
                  disabled={malSparar}
                  title="Rensa målet (session/goal clear)"
                  className="shrink-0 rounded p-0.5 text-[#EDE6D6]/60 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Guld-varning: kontexten > 80 % av taket (KVD kontext-optimering) */}
          {kontextProcent !== null && kontextProcent >= KONTEXT_VARNING_PROCENT && (
            <div className="border-t border-gold/30 bg-gold/10">
              <p className="mx-auto w-full max-w-3xl px-3 py-1.5 text-[11px] font-semibold text-gold sm:px-4">
                ⚠ Överväg ny session — kontexten närmar sig taket ({kontextProcent.toFixed(0)} % av {tkn(kontextTak)})
              </p>
            </div>
          )}

          {/* Sessionslista (V2 + V83 B3): modell · vändor · tokens · tid —
              klicka = session/resume (historiken återkommer i chatten). */}
          {visaSessioner && (
            <div className="border-t border-gold/15 bg-black/25">
              <div className="mx-auto max-h-56 w-full max-w-3xl overflow-y-auto px-3 py-2 sm:px-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/50">
                  Sessioner {sessioner.length === 0 && "— ingen lista ännu"} · klicka = öppna i NY TABB
                </p>
                {arbetsytaInfo && (
                  <p
                    className="mb-1.5 truncate text-[10px] text-[#EDE6D6]/45"
                    title={`${arbetsytaInfo.arbetsyta}${arbetsytaInfo.behorighet ? ` · behörighet ${arbetsytaInfo.behorighet}` : ""}${typeof arbetsytaInfo.kommandon === "number" ? ` · ${arbetsytaInfo.kommandon} kommandon` : ""}`}
                  >
                    Arbetsyta {arbetsytaInfo.arbetsyta.split("/").filter(Boolean).pop() ?? arbetsytaInfo.arbetsyta}
                    {arbetsytaInfo.lage && ` · läge ${arbetsytaInfo.lage}`}
                    {arbetsytaInfo.modell && ` · ${arbetsytaInfo.modell}`}
                    {arbetsytaInfo.tankeNiva && ` · tanke ${arbetsytaInfo.tankeNiva}`}
                    {typeof arbetsytaInfo.modellerTillgangliga === "number" &&
                      ` · ${arbetsytaInfo.modellerTillgangliga} modeller`}
                  </p>
                )}
                <ul className="space-y-1">
                  {sessioner.map((s) => (
                    <li
                      key={s.sessionId}
                      className="group flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[11px] text-[#EDE6D6]/80 transition-colors hover:bg-white/10"
                      title={s.sessionId}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          s.status === "idle"
                            ? "bg-emerald-400"
                            : s.status === "completed" || s.status === "error"
                              ? "bg-red-400/80"
                              : "bg-gold",
                        )}
                      />
                      <button
                        onClick={() => oppnaITabb(s.sessionId, s.titel)}
                        disabled={sessionJobbar !== ""}
                        className="flex min-w-0 flex-1 flex-col items-start text-left disabled:cursor-default"
                        title={
                          tabbar.some((t) => t.sessionId === s.sessionId)
                            ? "Sessionen är redan öppen i en tabb — växla dit"
                            : `Öppna ${s.sessionId} i en NY TABB (resume) — historiken hämtas ur sessionen`
                        }
                      >
                        <span className="w-full truncate font-medium">
                          {s.titel || s.sessionId.slice(0, 18) + "…"}
                          {s.sessionId === aktivSession && (
                            <span className="ml-1.5 rounded-full bg-gold/20 px-1.5 text-[9px] font-bold text-gold">AKTIV</span>
                          )}
                        </span>
                        <span className="w-full truncate text-[9px] text-[#EDE6D6]/45">
                          {[
                            s.modell?.includes("/") ? s.modell.split("/").slice(1).join("/") : s.modell,
                            typeof s.turns === "number" ? `${s.turns} vändor` : null,
                            typeof s.tokens === "number" ? `${tkn(s.tokens)} tkn` : null,
                            tidSen(s.uppdaterad) || null,
                          ]
                            .filter(Boolean)
                            .join(" · ") || s.sessionId.slice(5, 13)}
                        </span>
                      </button>
                      <span className="shrink-0 font-mono text-[9px] text-[#EDE6D6]/40">
                        {s.sessionId.slice(5, 13)}
                      </span>
                      <button
                        onClick={() => void stangSessionen(s.sessionId)}
                        disabled={sessionJobbar !== "" || strömmarHuvud}
                        title="Stäng sessionen (session/close) — finns kvar i listan men svarar ej"
                        className="shrink-0 rounded p-0.5 text-[#EDE6D6]/40 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-300 focus:opacity-100 group-hover:opacity-100 disabled:opacity-30"
                      >
                        {sessionJobbar === "stang" ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* VÅG 83 B3: BAKGRUNDSAGENTER (session/subagents) — badge + avbryt */}
          {visaAgenter && (
            <div className="border-t border-gold/15 bg-black/25">
              <div className="mx-auto max-h-44 w-full max-w-3xl overflow-y-auto px-3 py-2 sm:px-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/50">
                    Bakgrundsagenter {subagenter.length > 0 && `(${subagenter.length})`}
                  </p>
                  <button
                    onClick={() => void lasAgenter()}
                    disabled={agenterLaddar}
                    title="Uppdatera (session/subagents)"
                    className="rounded p-0.5 text-[#EDE6D6]/50 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
                  >
                    <RefreshCw className={cn("h-3 w-3", agenterLaddar && "animate-spin")} />
                  </button>
                </div>
                {agenterFel && <p className="text-[11px] text-red-300">{agenterFel}</p>}
                {!agenterFel && subagenter.length === 0 && !agenterLaddar && (
                  <p className="text-[11px] leading-relaxed text-[#EDE6D6]/50">
                    Inga bakgrundsagenter just nu — när agenten delegerar arbete i bakgrunden
                    syns barnagenterna här med status och avbryt-knapp.
                  </p>
                )}
                <ul className="space-y-1">
                  {subagenter.map((a) => {
                    const kör =
                      a.status === "running" || a.status === "waiting" || a.status === "blocked";
                    return (
                      <li
                        key={a.barnSessionId}
                        className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px] text-[#EDE6D6]/80"
                        title={`${a.barnSessionId}${a.startad ? ` · startad ${tidSen(a.startad)} sedan` : ""}${a.avslutad ? ` · avslutad ${tidSen(a.avslutad)} sedan` : ""}${a.sammanfattning ? ` — ${a.sammanfattning}` : ""}`}
                      >
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                            agentStatusFarg(a.status),
                          )}
                        >
                          {agentStatusText(a.status)}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {a.titel}
                          {a.typ && <span className="ml-1.5 text-[9px] text-[#EDE6D6]/40">{a.typ}</span>}
                        </span>
                        {kör && (
                          <button
                            onClick={() => void avbrytAgent(a.barnSessionId)}
                            title="Avbryt (session/cancelBackgroundTask)"
                            className="shrink-0 rounded-md border border-red-500/30 px-1.5 py-0.5 text-[10px] text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200"
                          >
                            Avbryt
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* VÅG 84 B: SESSIONSTABBAR — rad av tabbar ovanför chatten.
          [+] = ny tabb (egen session på servern — frisk session föds vid
          första prompten). Varje tabb = modell-badge + kortnamn (första
          orden i senaste prompten) + stäng-X + ON-GÅENDE-prick (gul,
          pulserande — agenten arbetar i tabben). Aktiv tabb = chattvyn;
          INAKTIVA tabbar fortsätter samla SSE i bakgrunden (bufferten
          renderas vid tabbyte). Stäng pågående tabb ⇒ confirm "Agenten
          arbetar — avbryta?" (ja = abort ⇒ session/stop). */}
      <nav
        aria-label="Sessionstabbbar"
        className="z-10 border-b border-gold/20 bg-[#0D1B31]/95 backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-1 overflow-x-auto px-3 py-1.5 sm:px-4 [scrollbar-width:thin]">
          {tabbar.map((t) => {
            const arAktiv = t.id === (aktivTabb?.id ?? "");
            return (
              <div
                key={t.id}
                className={cn(
                  "group flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors",
                  arAktiv
                    ? "border-gold/60 bg-gold/15 text-[#EDE6D6]"
                    : "border-transparent bg-white/5 text-[#EDE6D6]/70 hover:bg-white/10 hover:text-[#EDE6D6]",
                )}
                title={`${t.titel}${t.sessionId ? ` · ${t.sessionId}` : " · ingen session ännu"}${t.huvud ? " · huvudsessionen" : " · egen session"}${t.strömmar ? " · agenten arbetar…" : ""}`}
              >
                {/* ON-GÅENDE-prick: gul + pulserande medan agenten arbetar. */}
                {t.strömmar ? (
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-gold" aria-label="Agenten arbetar" />
                ) : (
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      t.huvud ? "bg-emerald-400/80" : "bg-white/25",
                    )}
                  />
                )}
                <button
                  onClick={() => valjTabb(t.id)}
                  className="flex min-w-0 items-center gap-1.5 text-left"
                  aria-current={arAktiv ? "page" : undefined}
                >
                  {/* Modell-badge — sessionens egen modell (kontext-projektionen). */}
                  <span className="shrink-0 rounded-full bg-black/30 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-gold/90">
                    {modellBadge(t.kontext?.modell)}
                  </span>
                  <span className="max-w-[110px] truncate text-[11px] font-medium">
                    {t.titel}
                    {t.huvud && <span className="ml-1 text-[9px] text-[#EDE6D6]/40">●</span>}
                  </span>
                </button>
                <button
                  onClick={() => stangTabb(t.id)}
                  title={t.strömmar ? "Stäng tabben (agenten arbetar — avbryta?)" : "Stäng tabben"}
                  className="shrink-0 rounded-full p-0.5 text-[#EDE6D6]/40 transition-colors hover:bg-red-500/25 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          {/* [+] ny tabb — frisk session (max 8: RAM-taket på servern). */}
          <button
            onClick={nyTabb}
            title={`Ny tabb — frisk agent-session (${tabbar.length}/${MAX_TABBAR} · egen zcode-process på servern)`}
            className="flex shrink-0 items-center gap-1 rounded-full border border-gold/30 bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-gold transition-colors hover:border-gold/60 hover:bg-gold/10"
          >
            <Plus className="h-3 w-3" />
            Ny tabb
          </button>
          {tabbar.length > 1 && (
            <span className="ml-auto shrink-0 pl-2 text-[9px] italic text-[#EDE6D6]/35">
              inaktiva tabbar fortsätter arbeta i bakgrunden
            </span>
          )}
        </div>
      </nav>

      {/* VÅG 85 F1: AUTONOM BANNER — gul, ovanför chatten, medan mål-loopen
          kör: "🎯 Agenten utvecklar autonomt — iteration N · [Pausa]". Ny
          turn matas av protokollet självt (v83 B3); paus = session/stop. */}
      {malKör && (
        <div role="status" aria-live="polite" className="z-10 border-b border-gold/40 bg-gold/15">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-2 sm:px-4">
            <Target className="h-4 w-4 shrink-0 animate-pulse text-gold" />
            <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-gold">
              🎯 Agenten utvecklar autonomt — iteration {malIteration}
              <span className="ml-1.5 hidden font-normal text-[#EDE6D6]/70 sm:inline">
                nya turner matas automatiskt mot målet
              </span>
            </p>
            <button
              onClick={() => void pausaMal()}
              disabled={malPausar}
              title="Pausa målet (session/stop) — den pågående iterationen avbryts inom sekunder"
              className="flex shrink-0 items-center gap-1 rounded-full border border-gold/50 bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
            >
              {malPausar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CircleStop className="h-3.5 w-3.5" />}
              Pausa
            </button>
          </div>
        </div>
      )}

      {/* VÅG 84 D: MINNE-PANEL 🧠 — agentens minnesfiler + AGENTS.md,
          redigerbara (state/actions här, ytan i studio-minne-panel.tsx). */}
      <StudioMinnePanel
        oppen={visaMinne}
        stang={() => setVisaMinne(false)}
        lasa={lasMinne}
        filer={minneFiler}
        laddar={minneLaddar}
        fel={minneFel}
        rotVisning={minneRotVisning}
        vald={minneVald}
        detaljLaddar={minneDetaljLaddar}
        redigerar={minneRedigerar}
        text={minneText}
        sparar={minneSparar}
        raderar={minneRaderar}
        ny={minneNy}
        nyttNamn={minneNyttNamn}
        setVald={setMinneVald}
        setRedigerar={setMinneRedigerar}
        setText={setMinneText}
        setNy={setMinneNy}
        setNyttNamn={setMinneNyttNamn}
        oppnaFil={oppnaMinnesfil}
        spara={sparaMinnesfil}
        radera={raderaMinnesfil}
      />

      {/* VÅG 85 F2: FÄRDIGHETER-PANEL ⚡ — skills/plugins/MCP ("vad agenten
          KAN"; state/actions här, ytan i studio-fardigheter-panel.tsx). */}
      <StudioFardigheterPanel
        oppen={visaFardigheter}
        stang={() => setVisaFardigheter(false)}
        lasa={lasFardigheter}
        laddar={fardigheterLaddar}
        fel={fardigheterFel}
        skills={fardigheterSkills}
        plugins={fardigheterPlugins}
        mcp={fardigheterMcp}
        mcpVerktyg={fardigheterVerktyg}
      />

      {/* VÅG 88 I2: VERKTYG-PANEL 🔧 — admin-kommandon (variabler/priser,
          blogg-publicering, minne-navigering). HELT egen yta + state i
          studio-admin-panel.tsx (självbärande — äger sina fetch-anrop mot
          /api/admin/variabler + /api/admin/blogg med admin-sessionen). */}
      <StudioAdminPanel
        oppen={visaAdmin}
        stang={() => setVisaAdmin(false)}
        oppnaMinne={() => {
          setVisaAdmin(false);
          oppnaMinne();
        }}
      />

      {/* VÅG 83 B4: FILTRÄDSDRAWER — agentens arbetsyta, klicka dig ner */}
      {visaFiler && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setVisaFiler(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Filträd över agentens arbetsyta"
            className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[380px] flex-col border-l border-gold/30 bg-[#0D1B31] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-gold/25 bg-black/25 px-3 py-2.5">
              <FolderTree className="h-4 w-4 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-sm font-bold text-[#EDE6D6]">Filträdet</h2>
                <p className="truncate text-[10px] text-[#EDE6D6]/55">
                  {arbetsytaNamn ? `arbetsyta: ${arbetsytaNamn}` : "agentens arbetsyta"}
                </p>
              </div>
              <button
                onClick={() => void lasTrad(true)}
                disabled={tradLaddar}
                title="Uppdatera trädet"
                className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", tradLaddar && "animate-spin")} />
              </button>
              <button
                onClick={() => setVisaFiler(false)}
                title="Stäng (Esc)"
                className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2 [scrollbar-width:thin]">
              {tradLaddar && !trad && (
                <div className="flex items-center gap-2 px-2 py-3 text-[11px] text-[#EDE6D6]/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                  Läser arbetsytan…
                </div>
              )}
              {tradFel && <p className="px-2 py-3 text-[11px] text-red-300">{tradFel}</p>}
              {trad && trad.length === 0 && !tradLaddar && (
                <p className="px-2 py-3 text-[11px] text-[#EDE6D6]/60">Arbetsytan är tom.</p>
              )}
              {trad?.map((nod) => (
                <TradRad
                  key={nod.sokvag}
                  nod={nod}
                  djup={0}
                  oppna={oppnaMappar}
                  onVaxla={vaxlaMapp}
                  onFil={(s) => void visaFil(s)}
                />
              ))}
              {tradTrunkerad && (
                <p className="mt-2 border-t border-gold/15 px-2 pt-2 text-[10px] leading-relaxed text-[#EDE6D6]/45">
                  Trädet är avkortat vid 500 noder (maxdjup 3) — node_modules/.next/.git/uploads
                  visas aldrig. Övriga filer når agenten via chatten.
                </p>
              )}
            </div>

            {/* Uploads-sektion: datum + töm-knapp (>7 dgr rensas automatiskt) */}
            <div className="border-t border-gold/25 bg-black/25 px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/55">
                  Uploads {uppladdningar.length > 0 && `(${uppladdningar.length}${uppladdningar.length >= 50 ? "+" : ""})`}
                </p>
                <button
                  onClick={() => void tomUploads()}
                  disabled={tommerUploads || uppladdningar.length === 0}
                  title="Töm uploads — filer äldre än 7 dagar rensas annars automatiskt"
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200 disabled:opacity-40"
                >
                  {tommerUploads ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Töm uploads
                </button>
              </div>
              {uppladdningar.length === 0 ? (
                <p className="text-[10px] leading-relaxed text-[#EDE6D6]/45">
                  Inga filer de senaste 7 dagarna — släpp filer på chattytan eller använd
                  filknappen. Filer äldre än 7 dagar rensas automatiskt.
                </p>
              ) : (
                <ul className="max-h-28 space-y-1 overflow-y-auto [scrollbar-width:thin]">
                  {uppladdningar.slice(0, 10).map((u) => {
                    const andrad = (u as Uppladdning & { andrad?: number }).andrad;
                    return (
                      <li
                        key={u.sokvag}
                        className="flex items-center gap-1.5 text-[10px] text-[#EDE6D6]/70"
                        title={u.sokvag}
                      >
                        {filIkon(u.sokvag)}
                        <span className="min-w-0 flex-1 truncate">{u.sokvag.split("/").slice(2).join("/") || u.sokvag}</span>
                        <span className="shrink-0 font-mono text-[9px] text-[#EDE6D6]/35">
                          {andrad
                            ? `${new Date(andrad).toLocaleDateString("sv-SE")} · ${byteStorlek(u.storlek)}`
                            : byteStorlek(u.storlek)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </>
      )}

      {/* VÅG 83 B4: FÖRHANDSGRANSKNING — text monospace, bild, nedladdning */}
      {filVisning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
          onClick={() => setFilVisning(null)}
        >
          <div
            className="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gold/30 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-gold/25 bg-[#10233F] px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-semibold text-[#EDE6D6]">{filVisning.namn}</p>
                <p className="truncate text-[10px] text-[#EDE6D6]/55">
                  {filVisning.sokvag} · {byteStorlek(filVisning.storlek)}
                </p>
              </div>
              <button
                onClick={() => setFilVisning(null)}
                title="Stäng (Esc)"
                className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {visningLaddar && (
                <div className="flex items-center gap-2 px-4 py-6 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  Läser filen…
                </div>
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "text" && (
                <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed">
                  {filVisning.forhandsgranskning.innehåll}
                </pre>
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "bild" && (
                 
                <img
                  src={filVisning.forhandsgranskning.url}
                  alt={filVisning.namn}
                  className="mx-auto max-h-[72dvh] w-auto max-w-full object-contain"
                />
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "nedladdning" && (
                <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
                  <Download className="h-8 w-8 text-gold" />
                  <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                    {filVisning.forhandsgranskning.orsak ?? "Binärt format — ladda ner för att öppna."}
                  </p>
                  <a
                    href={filVisning.forhandsgranskning.url}
                    download={filVisning.namn}
                    className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20"
                  >
                    Ladda ner {filVisning.namn} ({byteStorlek(filVisning.storlek)})
                  </a>
                </div>
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "blockerad" && (
                <p className="px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground">
                  {filVisning.forhandsgranskning.meddelande}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meddelandelista — V84 A3: relativ wrapper bär "↓ Nytt"-knappen. */}
      <div className="relative min-h-0 flex-1">
      {/* VÅG 87 H1: BORTA-BANNER — agenten arbetade medan du var borta
          (historiken är redan auto-laddad; [Visa] scrollar mjukt till
          senaste svaret — användaren kan sitta kvar uppe i läsandet). */}
      {bortaBanner && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-3">
          <div className="studio-fade-in pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-gold/50 bg-[#10233F]/95 px-4 py-2 text-xs font-semibold text-[#EDE6D6] shadow-lg backdrop-blur">
            <span className="truncate">
              📌 Agenten har arbetat medan du var borta — {bortaBanner.antalTurner} nya svar
              {bortaBanner.malKorer ? " · mål-loopen kör fortfarande" : ""}
            </span>
            <button
              onClick={() => {
                setBortaBanner(null);
                hoppaNerChatt();
              }}
              className="studio-lift shrink-0 rounded-full bg-[#c9a84c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0E1B2E] transition-colors hover:bg-gold"
            >
              Visa
            </button>
            <button
              onClick={() => setBortaBanner(null)}
              title="Stäng notisen"
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      <div
        ref={blattraRef}
        onScroll={paScrollChatt}
        className="studio-chatt mx-auto h-full w-full max-w-3xl overflow-y-auto px-3 py-4 sm:px-4"
      >
        {/* VÅG 87 H3 5: LOADING-SKELETONS — 3 animerade bubblor (bg-paper/50
            animate-pulse, olika bredder + staggerad delay) medan den första
            historik-GET:en laddar — aldrig ett blinkande tomrum. */}
        {meddelanden.length === 0 && laddarHistorik && (
          <div role="status" aria-label="Laddar chatten" className="mx-auto mt-10 max-w-md space-y-3">
            <div className="flex justify-end">
              <div className="h-10 w-3/5 animate-pulse rounded-2xl bg-paper/50" />
            </div>
            <div className="flex justify-end">
              <div className="h-16 w-5/6 animate-pulse rounded-2xl bg-paper/50 [animation-delay:150ms]" />
            </div>
            <div className="flex justify-start">
              <div className="h-12 w-2/5 animate-pulse rounded-2xl bg-paper/50 [animation-delay:300ms]" />
            </div>
          </div>
        )}
        {/* VÅG 87 H3 4: EMPTY-STATE — Serena-emblem 64px guld + välkomstord
            + 3 KICKBARA förslag (mål-dialogen, filväljaren, fokus i fältet). */}
        {meddelanden.length === 0 && !laddarHistorik && (
          <div className="studio-fade-in mx-auto mt-8 max-w-md text-center">
            <SerenaEmblem storlek={64} />
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              Din agent i molnet
            </p>
            <h2 className="mt-1.5 font-serif text-2xl font-bold tracking-tight">Välkommen till AK1A Studio</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Skriv, klistra in en bild eller släpp filer här — agenten bygger, läser
              och utvecklar rakt i arbetsytan. Mappar laddas upp med mappknappen.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setMalDialogOppen(true)}
                title="Öppna mål-dialogen — beskriv ett utvecklingsmål och agenten itererar autonomt"
                className="studio-lift flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-2 text-xs font-semibold text-gold transition-colors hover:border-gold/70 hover:bg-gold/20"
              >
                <Target className="h-3.5 w-3.5" />
                Sätt ett mål
              </button>
              <button
                onClick={() => filInputRef.current?.click()}
                title="Ladda upp filer (png/jpg/pdf/zip/txt/md/json/csv, max 30 MB/fil)"
                className="studio-lift flex items-center gap-1.5 rounded-full border border-gold/30 bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-gold/60"
              >
                <UploadCloud className="h-3.5 w-3.5 text-gold" />
                Ladda upp en fil
              </button>
              <button
                onClick={() => ytaRef.current?.focus()}
                title="Fokusera skrivfältet — fråga agenten vad som helst"
                className="studio-lift flex items-center gap-1.5 rounded-full border border-gold/30 bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-gold/60"
              >
                <MessageCircleQuestion className="h-3.5 w-3.5 text-gold" />
                Fråga agenten
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {meddelanden.map((m, ix) => {
            // VÅG 87 H3 3: GULD-DIVIDER MELLAN GRUPPER — tunn guld-våglinje
            // när turordningen växlar (user-grupp → agent-grupp och omvänt);
            // aldrig före det första meddelandet.
            const nyGrupp = ix > 0 && meddelanden[ix - 1].roll !== m.roll;
            return (
              <React.Fragment key={m.id}>
                {nyGrupp && <div className="studio-grupp-divider" aria-hidden />}
                {m.roll === "user" ? (
              <div
                ref={(el) => {
                  if (el) meddelandeRefs.current.set(m.id, el);
                  else meddelandeRefs.current.delete(m.id);
                }}
                className="studio-fade-in flex justify-start"
              >
                <div className="marin-panel marin-scope max-w-[85%] rounded-2xl rounded-tl-sm border border-gold/25 px-4 py-2.5 shadow-sm sm:max-w-[75%]">
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {sokFras.trim()
                      ? markeraVanlig(m.text, sokFras.trim(), aktivTräff?.meddelandeId === m.id ? aktivTräff.forekomst : -1)
                      : m.text}
                  </p>
                  {/* VÅG 83 B4: uppladdade bilder som refereras i texten →
                      miniatyrer direkt i bubblan (säker serving &bild=1). */}
                  {bildRefsUrText(m.text).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {bildRefsUrText(m.text).map((sokvag) => (
                         
                        <img
                          key={sokvag}
                          src={bildUrl(sokvag)}
                          alt={sokvag.split("/").pop() ?? sokvag}
                          loading="lazy"
                          className="h-24 w-24 cursor-pointer rounded-lg border border-gold/30 object-cover transition-opacity hover:opacity-90"
                          onClick={() => void visaFil(sokvag)}
                          onError={(e) => {
                            // Filen finns inte (rensad/rensat) — göm stiligt.
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                ref={(el) => {
                  if (el) meddelandeRefs.current.set(m.id, el);
                  else meddelandeRefs.current.delete(m.id);
                }}
                className="studio-fade-in flex justify-end"
              >
                <div
                  className={cn(
                    // VÅG 87 H3 3: GRADIENT-ACCENT — agent-bubblan får subtil
                    // card→paper-lutning (globals.css; natt: marin-lager).
                    "studio-bubbla-agent max-w-[92%] rounded-2xl rounded-tr-sm border px-4 py-3 shadow-sm sm:max-w-[80%]",
                    m.fel ? "border-red-500/40" : "border-gold/40",
                  )}
                >
                  {/* VÅG 85 F1: autonom iteration-badge — mål-loopens turner
                      märks (🎯 Iteration N) så de skiljs från chattade svar. */}
                  {typeof m.malIteration === "number" && (
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                      <Target className="h-3 w-3 shrink-0" />
                      Autonom iteration {m.malIteration}
                    </p>
                  )}
                  {/* V83 B1: varje verktygskall = expanderbart kort i flödet. */}
                  {m.verktygKort && m.verktygKort.length > 0 && (
                    <div className="mb-2 space-y-1.5">
                      {m.verktygKort.map((k) => (
                        <VerktygsKortVy
                          key={k.id}
                          kort={k}
                          onVaxla={(id) =>
                            rörTabb(aktivTabb?.id ?? "", (tb) => ({
                              ...tb,
                              meddelanden: tb.meddelanden.map((mm) =>
                                mm.id === m.id
                                  ? {
                                      ...mm,
                                      verktygKort: (mm.verktygKort ?? []).map((k2) =>
                                        k2.id === id ? { ...k2, öppen: !k2.öppen } : k2,
                                      ),
                                    }
                                  : mm,
                              ),
                            }))
                          }
                        />
                      ))}
                    </div>
                  )}
                  {m.text ? (
                    <StudioMarkdown
                      text={m.text}
                      markera={
                        sokFras.trim()
                          ? { fras: sokFras.trim(), aktivForekomst: aktivTräff?.meddelandeId === m.id ? aktivTräff.forekomst : -1 }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                      {/* V84 B: strömstatus ur DEN AKTIVA TABBEN (fallback: global). */}
                      {aktivTabb?.status || statusText}
                    </div>
                  )}
                  {/* VÅG 87 H3 1c: STREAMING CURSOR — blinkande ▊-block (1 s
                      oändlig blink) i agentens sista delta-rad; syns bara på
                      den strömmande bubblan (m.strömmande). */}
                  {m.strömmande && m.text && (
                    <span
                      aria-hidden
                      className="studio-cursor ml-0.5 inline-block h-4 w-[9px] rounded-[1.5px] bg-gold align-text-bottom"
                    />
                  )}
                  {/* V83 B1 + VÅG 85 F5: ändringspanelen — +N/−N per fil,
                      expanderbar KODVY (syntax + gula ändringsrader) +
                      redigering i plan-läge (kundens terminal-fria kontroll). */}
                  {m.ändringar && m.ändringar.length > 0 && (
                    <AndringsPanel
                      andringar={m.ändringar}
                      onVaxlaFil={(sokvag) =>
                        rörTabb(aktivTabb?.id ?? "", (tb) => ({
                          ...tb,
                          meddelanden: tb.meddelanden.map((mm) =>
                            mm.id === m.id
                              ? {
                                  ...mm,
                                  ändringar: (mm.ändringar ?? []).map((f) =>
                                    f.sokvag === sokvag ? { ...f, öppen: !f.öppen } : f,
                                  ),
                                }
                              : mm,
                          ),
                        }))
                      }
                      arbetsyta={arbetsytaInfo?.arbetsyta}
                      planLage={(aktivTabb?.kontext?.lage ?? arbetsytaInfo?.lage) === "plan"}
                    />
                  )}
                  {/* V83 B1: rundstatistik — varaktighet · resultat · verktyg. */}
                  {m.rundStatistik && !m.strömmande && (
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground/70">
                      {typeof m.rundStatistik.varaktighetMs === "number" && (
                        <span title="Turnens varaktighet (turn.completed.duration)">
                          ⏱ {msText(m.rundStatistik.varaktighetMs)}
                        </span>
                      )}
                      {typeof m.rundStatistik.verktygAntal === "number" && (
                        <span title="Verktygskall denna turn (turn.completed.toolCallCount)">
                          🛠 {m.rundStatistik.verktygAntal}
                        </span>
                      )}
                      {m.rundStatistik.resultatTyp && (
                        <span
                          className={cn(
                            m.rundStatistik.resultatTyp === "success"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400",
                          )}
                          title="Turnens resultat (turn.completed.resultType)"
                        >
                          {m.rundStatistik.resultatTyp === "success" ? "✓ lyckad" : "⚠ " + m.rundStatistik.resultatTyp}
                        </span>
                      )}
                    </p>
                  )}
                  {/* VÅG 86 G5: CHECKPOINT/REWIND — "⟲ Gå tillbaka hit" på varje
                      FÄRDIG agentbubbla (ej under strömning, ej utan turn).
                      Klick ⇒ confirm ⇒ POST rewind {kind:"turn"} ⇒ sessionen
                      forkas vid punkten och den nya blir aktiv. */
                  (() => {
                    const ti = turnIndexKarta.get(m.id);
                    if (m.strömmande || ti === undefined || ti < 0) return null;
                    return (
                      <div className="mt-1.5 flex justify-end">
                        <button
                          onClick={() => void gaTillbakaHit(m.id)}
                          disabled={rewindJobbar}
                          title={`Gå tillbaka hit — sessionen forkas vid denna punkt (iteration ${ti + 1})`}
                          aria-label={`Gå tillbaka till iteration ${ti + 1} — fork:a sessionen här`}
                          className="rounded-full border border-gold/25 px-2 py-0.5 text-[11px] leading-none text-muted-foreground/80 transition-colors hover:border-gold/60 hover:text-gold disabled:opacity-50"
                        >
                          ⟲
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
                )}
              </React.Fragment>
            );
          })}
          {/* VÅG 83 B2 + V84 C: PERMISSION-DIALOG (Z-portaLens) — marin kort
              med verktygsnamn + protokollrisk-badge + VERKTYGSRISK-BADGE
              (skrivande/läsande/nät) + DIFF-FÖRHANDSVISNING för Write/Edit
              (annars argument-summary) + options-knappar + "Alltid tillåta".
              Byggd ur protokollets interaction/requestPermission-options
              (allow_once/allow_project/deny); svaret går via
              /api/studio/interaktion. 30 s utan svar ⇒ eskalering. */}
          {permission && (
            <div className="flex justify-end">
              <div className="marin-panel marin-scope max-w-[92%] rounded-2xl rounded-tr-sm border border-gold/50 px-4 py-3 shadow-md sm:max-w-[80%]">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                    Begäran om godkännande
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      riskFarg(permission.risk),
                    )}
                    title={`Protokollets risknivå: ${permission.risk}`}
                  >
                    {permission.risk}
                  </span>
                  {/* V84 C: verktygsklassningen — Bash/Write/Edit=orange,
                      Read/Glob/Grep=grön, WebSearch/WebFetch=gul, övrigt neutralt. */}
                  {(() => {
                    const klass = verktygsriskKlass(permission.verktyg);
                    return (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider",
                          klass.farg,
                        )}
                        title={klass.forklaring}
                      >
                        {klass.etikett}
                      </span>
                    );
                  })()}
                  {svarJobbar && <Loader2 className="h-3 w-3 animate-spin text-gold" />}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#EDE6D6]">
                  Verktyget <span className="font-semibold text-gold">{permission.verktyg}</span> vill köras
                </p>
                {permission.skäl && (
                  <p className="mt-1 text-xs leading-relaxed text-[#EDE6D6]/70">{permission.skäl}</p>
                )}
                {/* V84 C: DIFF-FÖRHANDSVISNING — exakt vad Write/Edit ändrar,
                    FÄRGKODAT innan valet; utan diff faller kortet på summary. */}
                {permission.diff ? (
                  <DiffForhandsvisning diff={permission.diff} />
                ) : (
                  <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-md border border-gold/20 bg-black/30 p-2 font-mono text-[10px] leading-relaxed text-[#EDE6D6]/85">
                    {permission.sammanfattning}
                  </pre>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {permission.alternativ.map((a) => (
                    <button
                      key={a.optionId}
                      onClick={() => void svaraPermission(permission.requestId, a.optionId)}
                      disabled={svarJobbar}
                      title={a.beskrivning || a.namn}
                      className={cn(
                        // VÅG 87 H3 1b: hover-lift på godkännande-valen.
                        "studio-lift rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
                        a.optionId === "deny"
                          ? "border border-red-400/50 text-red-200 hover:bg-red-500/20"
                          : a.optionId === "allow_project"
                            ? "border border-gold/50 text-gold hover:bg-gold/15"
                            : "bg-gold text-background hover:bg-gold/90",
                      )}
                    >
                      {PERMISSION_ETIKETT[a.optionId] ?? a.namn}
                    </button>
                  ))}
                  {/* V84 C: spara minnesregel + tillåt — nästa request för
                      verktyget godkänns automatiskt (notis i flödet). */}
                  <button
                    onClick={() => {
                      const ny = sparaRegel(permission.verktyg);
                      visaToast(
                        ny
                          ? `Regel sparad: ${permission.verktyg} tillåts alltid (ta bort under Regler).`
                          : `En regel för ${permission.verktyg} finns redan.`,
                      );
                      void svaraPermission(permission.requestId, "allow_once");
                    }}
                    disabled={svarJobbar}
                    title={`Spara en "alltid tillåt"-regel för ${permission.verktyg} i denna webbläsare (localStorage) och tillåt denna begäran`}
                    className="rounded-full border border-emerald-400/50 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/15 disabled:opacity-50"
                  >
                    ⛨ Alltid tillåta {permission.verktyg}
                  </button>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-[#EDE6D6]/50">
                  Svar inom 30 s — annars eskaleras begäran automatiskt så agenten inte fastnar.
                  {" "}Regler gäller i denna webbläsare och hanteras under Regler i verktygsraden.
                </p>
              </div>
            </div>
          )}

          {/* VÅG 83 B2: FRÅGEKORT (interaction/requestUserInput) — knappval
              ur choices ELLER fritext + Svara/Avbryt. */}
          {fraga && (
            <div className="flex justify-end">
              <div className="max-w-[92%] rounded-2xl rounded-tr-sm border border-gold/40 bg-card px-4 py-3 shadow-sm sm:max-w-[80%]">
                <div className="flex items-center gap-2">
                  <MessageCircleQuestion className="h-4 w-4 shrink-0 text-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                    Agenten frågar
                  </span>
                  {svarJobbar && <Loader2 className="h-3 w-3 animate-spin text-gold" />}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{fraga.fråga}</p>
                {fraga.val && fraga.val.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fraga.val.map((v) => (
                      <button
                        key={v}
                        onClick={() => void svaraFraga(fraga.requestId, v)}
                        disabled={svarJobbar}
                        className="rounded-full border border-gold/50 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/15 disabled:opacity-50"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex items-end gap-2">
                    <textarea
                      value={fragSvar}
                      onChange={(e) => setFragSvar(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void svaraFraga(fraga.requestId, fragSvar.trim());
                        }
                      }}
                      rows={1}
                      placeholder="Svara agenten… (Enter skickar)"
                      className="max-h-28 min-h-[38px] flex-1 resize-none rounded-lg border border-gold/30 bg-background px-2.5 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/60"
                    />
                    <Button
                      onClick={() => void svaraFraga(fraga.requestId, fragSvar.trim())}
                      disabled={!fragSvar.trim() || svarJobbar}
                      className="h-9 shrink-0 rounded-lg bg-gold px-3 text-xs text-background hover:bg-gold/90"
                    >
                      Svara
                    </Button>
                  </div>
                )}
                <button
                  onClick={() => void svaraFraga(fraga.requestId, undefined, true)}
                  disabled={svarJobbar}
                  className="mt-2 text-[10px] text-muted-foreground underline transition-colors hover:text-foreground disabled:opacity-50"
                >
                  Avbryt frågan
                </button>
              </div>
            </div>
          )}
          {tankar && (
            <div className="flex justify-end pr-1">
              <p className="max-w-[80%] truncate text-right text-[11px] italic text-muted-foreground/70">{tankar}</p>
            </div>
          )}
        </div>
        {/* V84 A3: "↓ Nytt" — flytande knapp när användaren scrollat upp
            (klick = mjuk hopp ner + återupptagen autoscroll + badge med
            antal olästa som anlände under uppehållet). */}
        {!vidBotten && meddelanden.length > 0 && (
          <button
            onClick={hoppaNerChatt}
            title="Hoppa till senaste — autoscrollen återupptas"
            className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gold/50 bg-[#10233F]/95 px-3.5 py-1.5 text-xs font-semibold text-[#EDE6D6] shadow-lg backdrop-blur transition-colors hover:border-gold"
          >
            <ArrowDown className="h-3.5 w-3.5 text-gold" />
            Nytt
            {nyaSedanUpp > 0 && (
              <span className="rounded-full bg-[#c9a84c] px-1.5 text-[10px] font-bold text-[#0E1B2E]">
                {nyaSedanUpp}
              </span>
            )}
          </button>
        )}
      </div>
      </div>

      {/* Uppladdnings-chips */}
      {uppladdningar.length > 0 && (
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 [scrollbar-width:thin]">
            {uppladdningar.slice(0, 12).map((u) => (
              <button
                key={u.sokvag}
                onClick={() => infogaSokvag(u.sokvag, u.typ)}
                title={`${u.sokvag} — klicka för att infoga i prompten`}
                className="studio-lift flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-card px-2.5 py-1 text-[11px] transition-colors hover:border-gold/60"
              >
                {u.typ === "bild" ? (
                  <FileImage className="h-3.5 w-3.5 text-gold" />
                ) : u.typ === "zip" ? (
                  <FileArchive className="h-3.5 w-3.5 text-gold" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-gold" />
                )}
                <span className="max-w-[160px] truncate">{u.sokvag.split("/").slice(2).join("/") || u.sokvag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skrivfält — VÅG 87 H4 2: sticky bottom-0 (sitter alltid ovanför
          tangentbordet) + studio-safe-bottom = pb-[env(safe-area-inset-bottom)]
          så iOS-hem-rad aldrig täcker skicka-knappen (viewport-fit=cover). */}
      <div className="studio-safe-bottom sticky bottom-0 z-10 border-t border-gold/20 bg-paper/95 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-3 py-2.5 sm:px-4 sm:py-3">
          {draÖver && (
            <div className="mb-2 rounded-lg border-2 border-dashed border-gold/60 bg-gold/5 px-3 py-2 text-center text-xs text-gold">
              Släpp filerna här — de hamnar i uploads/ och agenten kan läsa dem
            </div>
          )}
          {/* VÅG 86 G1/G2: SKRIVFÄLTETS MINNE — dropdownerna svävar ovanför
              fältet (absolute bottom-full): slash-autocomplete + bibliotek. */}
          <div className="relative">
          {slashSynlig && (
            <div
              role="listbox"
              aria-label="Kommandoautocomplete"
              className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-gold/40 bg-card shadow-2xl"
            >
              <ul className="max-h-48 overflow-y-auto py-1">
                {slashPoster.map((k, i) => (
                  <li key={k.namn}>
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) slashRadRefs.current.set(k.namn, el);
                        else slashRadRefs.current.delete(k.namn);
                      }}
                      onMouseDown={(e) => e.preventDefault()} // behåll fokus i skrivfältet
                      onMouseEnter={() => setSlashIndex(i)}
                      onClick={() => valjSlash(k)}
                      className={cn(
                        "flex min-h-[44px] w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                        i === slashIndex ? "bg-gold/15" : "hover:bg-muted/60",
                      )}
                    >
                      <Terminal className="h-4 w-4 shrink-0 text-gold/80" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-xs font-semibold text-foreground">{k.syntax}</span>
                        <span className="block truncate text-[11px] leading-snug text-muted-foreground/80">{k.beskrivning}</span>
                      </span>
                      <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground/70">
                        {k.kalla === "api" ? "API" : "lokal"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="border-t border-gold/20 px-3 py-1.5 text-[10px] text-muted-foreground/70">
                ↑↓ välj · Enter infogar + kör · Tab fyller i · Esc stänger
              </p>
            </div>
          )}

          {prompterOppen && (
            <>
              {/* Klick-utanför stänger biblioteket (mobil: tappa var som helst). */}
              <div className="fixed inset-0 z-10" aria-hidden onClick={() => setPrompterOppen(false)} />
              <div
                role="dialog"
                aria-label="Promptbiblioteket"
                className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-gold/40 bg-card shadow-2xl"
              >
                <div className="flex items-center gap-2 border-b border-gold/20 px-3 py-2">
                  <Star className="h-3.5 w-3.5 shrink-0 text-gold" />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Promptbiblioteket{prompter.length > 0 ? ` — ${Math.min(prompter.length, 10)} av ${prompter.length}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPrompterOppen(false)}
                    title="Stäng (Esc)"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {prompter.length === 0 ? (
                  <p className="px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                    Inga sparade prompts än — skriv något i fältet och tryck ⭐ (eller kör{" "}
                    <span className="font-mono">/sparad din text</span>) för att spara det här.
                  </p>
                ) : (
                  <ul className="max-h-48 overflow-y-auto py-1">
                    {prompter.slice(0, 10).map((p, i) => (
                      <li key={`${p.skapad}-${i}`} className="flex items-stretch">
                        <button
                          type="button"
                          onClick={() => {
                            historikIndexRef.current = null; // G2: infogad prompt = ny redigering
                            setPrompt(p.text);
                            setPrompterOppen(false);
                            ytaRef.current?.focus();
                          }}
                          title={p.text}
                          className="flex min-h-[44px] min-w-0 flex-1 items-center px-3 py-2 text-left transition-colors hover:bg-muted/60"
                        >
                          <span className="line-clamp-2 min-w-0 flex-1 whitespace-pre-wrap break-words text-xs leading-snug text-foreground">
                            {p.text}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => tabortPrompt(p.skapad)}
                          title="Ta bort prompten ur biblioteket"
                          aria-label="Ta bort prompten"
                          className="flex w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="border-t border-gold/20 px-3 py-1.5 text-[10px] text-muted-foreground/70">
                  klicka = infoga i skrivfältet · papperskorg = ta bort — sista 10 visas
                </p>
              </div>
            </>
          )}

          {/* VÅG 86 G3: 👁 markdown-förhandsvisning — skrivfältets innehåll
              renderat som markdown (rubriker, **fetstil**, kodblock) i en
              scrollbar yta OVANFÖR fältet (mobil: max-h + överscrollning). */}
          {previewOppen && (
            <div className="mb-2 max-h-44 overflow-y-auto overscroll-contain rounded-lg border border-gold/25 bg-muted/50 px-3 py-2">
              <p className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <Eye className="h-3 w-3" />
                Förhandsvisning (markdown)
              </p>
              {prompt.trim() ? (
                <div className="text-sm">
                  <StudioMarkdown text={prompt} />
                </div>
              ) : (
                <p className="text-xs italic leading-relaxed text-muted-foreground/60">
                  Skriv i fältet — **fetstil**, ## rubriker och kodblock förhandsvisas här medan du skriver.
                </p>
              )}
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              ref={ytaRef}
              value={prompt}
              maxLength={2000}
              onChange={(e) => {
                historikIndexRef.current = null; // G2: redigering avslutar historikbläddringen
                setPrompt(e.target.value);
                hojdpassaYta(e.target); // G3: auto-växande höjd direkt i onChange
              }}
              onFocus={() => {
                // VÅG 86 G3: placeholdern roterar på focus — nytt tips varje gång
                setPlaceholderIx((i) => (i + 1) % SKRIV_PLACEHOLDERS.length);
              }}
              onPaste={(e) => void påPaste(e)}
              onKeyDown={(e) => {
                // VÅG 86 G1: slash-dropdownen äger pilar/Enter/Tab/Esc först
                if (slashSynlig) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSlashIndex((i) => Math.min(i + 1, slashPoster.length - 1));
                    return;
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSlashIndex((i) => Math.max(i - 1, 0));
                    return;
                  }
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const k = slashPoster[slashIndex];
                    if (k) valjSlash(k);
                    return;
                  }
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const k = slashPoster[slashIndex];
                    if (k) kompletteraSlash(k);
                    return;
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation(); // den globala Esc-hanteraren får inte blanda sig i
                    setSlashStangd(true);
                    return;
                  }
                }
                // VÅG 86 G2: prompthistoriken — pil-upp i tomt fält återkallar,
                // pil-ner bläddrar framåt (samma känsla som terminalen)
                if (e.key === "ArrowUp" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                  if (blattraHistorik(1)) e.preventDefault();
                  return;
                }
                if (e.key === "ArrowDown" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                  if (blattraHistorik(-1)) e.preventDefault();
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void skicka();
                }
              }}
              rows={1}
              placeholder={SKRIV_PLACEHOLDERS[placeholderIx]}
              title="Enter skickar · Skift+Enter ny rad · / visar kommandon · ↑ återkallar senaste prompten"
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-gold/30 bg-card px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/60"
            />
            {/* VÅG 86 G2: ⭐ Spara prompt — med text i fältet sparas texten,
                tomt fält öppnar biblioteket (samma som /sparad). */}
            <Button
              onClick={() => {
                if (prompt.trim()) {
                  if (sparaPrompt(prompt)) {
                    visaToast("Prompten sparad i biblioteket ⭐ — den ligger nu överst i listan.");
                    oppnaPrompter();
                  }
                } else {
                  oppnaPrompter();
                }
              }}
              variant="outline"
              className="studio-lift h-11 w-11 shrink-0 rounded-xl border-gold/40 p-0 text-gold hover:bg-gold/10 hover:text-gold"
              title={prompt.trim() ? "Spara prompten i biblioteket (⭐)" : "Visa promptbiblioteket ⭐ (samma som /sparad)"}
            >
              <Star className="h-5 w-5" />
            </Button>
            {strömmar ? (
              <Button
                onClick={stoppa}
                variant="outline"
                className="studio-lift h-11 w-11 shrink-0 rounded-xl border-red-500/40 p-0 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                title="Stoppa agenten"
              >
                <CircleStop className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={() => void skicka()}
                disabled={!prompt.trim()}
                className="studio-lift h-11 w-11 shrink-0 rounded-xl bg-gold p-0 text-background hover:bg-gold/90"
                title="Skicka"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <input
              ref={filInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.zip,.txt,.md,.json,.csv"
              onChange={(e) => {
                const filer = Array.from(e.target.files ?? []);
                if (filer.length) void laddaUpp(filer);
                e.target.value = "";
              }}
            />
            <input
              ref={(el) => {
                mappInputRef.current = el;
                if (el) {
                  el.setAttribute("webkitdirectory", "");
                  el.setAttribute("directory", "");
                }
              }}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const input = e.target;
                const filer = Array.from(input.files ?? []);
                // webkitRelativePath sitter på varje File — servern bygger om
                // mappstrukturen ur de relativa sökvägarna.
                const relativa = filer.map(
                  (f) => (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
                );
                if (filer.length) void laddaUpp(filer, relativa);
                input.value = "";
              }}
            />
            <button
              onClick={() => filInputRef.current?.click()}
              disabled={laddarUpp}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              title="Ladda upp filer (png/jpg/webp/gif/pdf/zip/txt/md/json/csv, max 30 MB/fil)"
            >
              {laddarUpp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
              Fil
            </button>
            <button
              onClick={() => mappInputRef.current?.click()}
              disabled={laddarUpp}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              title="Ladda upp en hel mapp (strukturen bevaras)"
            >
              <FolderUp className="h-3.5 w-3.5" />
              Mapp
            </button>
            {/* VÅG 86 G3: 👁-toggle — markdown-förhandsvisning av skrivfältet. */}
            <button
              type="button"
              onClick={() => setPreviewOppen((v) => !v)}
              aria-pressed={previewOppen}
              title={
                previewOppen
                  ? "Stäng markdown-förhandsvisningen"
                  : "Förhandsvisning: rendera skrivfältet som markdown (rubriker, fetstil, kodblock)"
              }
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors hover:bg-muted",
                previewOppen ? "font-semibold text-gold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {previewOppen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Förhandsvisning</span>
            </button>
            <span className="ml-auto hidden items-center gap-1 text-[10px] text-muted-foreground/70 sm:flex">
              <UploadCloud className="h-3 w-3" />
              dra & släpp eller klistra in en bild
            </span>
            <span className="ml-auto max-w-[45%] truncate text-[10px] text-muted-foreground/70 sm:hidden">
              {statusText}
            </span>
            {/* VÅG 86 G3: teckenräknare — diskret i hörnet (tak 2000 tkn;
                guld-varning ≥ 1800, rött vid taket). */}
            <span
              className={cn(
                "shrink-0 font-mono text-[10px] tabular-nums",
                prompt.length >= 2000
                  ? "font-bold text-red-500"
                  : prompt.length >= 1800
                    ? "text-gold"
                    : "text-muted-foreground/60",
              )}
              title="Tecken i skrivfältet (tak 2000)"
            >
              {prompt.length}/2000
            </span>
          </div>
        </div>
      </div>

      {/* VÅG 85 F1: MÅL-DIALOG — det STORA "🎯 Mål-läge"-flödet (KVD 2):
          textarea "Beskriv utvecklingsmålet…" → Starta ⇒ session/goal set ⇒
          autonom loop börjar (badge + banner + iterationer i chatten). */}
      {malDialogOppen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[2px]"
          onClick={() => setMalDialogOppen(false)}
        >
          <div
            role="dialog"
            aria-label="Mål-läge — autonom utveckling"
            className="flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gold/40 bg-[#0D1B31] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-gold/25 bg-black/25 px-4 py-3">
              <Target className="h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-base font-bold text-[#EDE6D6]">🎯 Mål-läge</h2>
                <p className="text-[11px] text-[#EDE6D6]/60">
                  Autonom utveckling — agenten itererar själv mot målet tills du pausar
                </p>
              </div>
              <button
                onClick={() => setMalDialogOppen(false)}
                title="Stäng (Esc)"
                className="shrink-0 rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <label htmlFor="mal-dialog-text" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#EDE6D6]/60">
                Beskriv utvecklingsmålet
              </label>
              <textarea
                id="mal-dialog-text"
                value={malDialogText}
                onChange={(e) => setMalDialogText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    void startaMal();
                  }
                }}
                rows={5}
                maxLength={500}
                autoFocus
                placeholder="Beskriv utvecklingsmålet… t.ex. &quot;Lista alla .md-filer i workspacet och håll sammanfattningen uppdaterad&quot;"
                className="w-full resize-none rounded-lg border border-gold/40 bg-black/30 px-3 py-2.5 text-sm leading-relaxed text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70"
              />
              <p className="mt-1.5 text-right text-[10px] tabular-nums text-[#EDE6D6]/40">{malDialogText.length}/500</p>
              <p className="mt-2 text-[10px] leading-relaxed text-[#EDE6D6]/50">
                När du startar börjar agenten arbeta mot målet på egen hand — protokollet
                matar nya turner automatiskt (bevisat våg 83). Varje iteration syns LIVE i
                chatten med verktygskort, diff och streaming, och headern visar en pulserande
                <span className="mx-1 font-semibold text-gold">MÅL AKTIVT</span>-badge med
                iterationsräknare. Pausa när du vill — sessionen och målet lever kvar.
              </p>
              {mal && (
                <p className="mt-2 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2 text-[10px] leading-relaxed text-[#EDE6D6]/70">
                  Ett mål är redan satt{malKör ? " och loopen KÖR just nu" : malPausat ? " (pausat)" : ""} — att
                  starta igen ersätter målet med texten ovan
                  {malKör ? " (pausa först om agenten är mitt i en iteration)" : ""}.
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gold/25 bg-black/20 px-4 py-3">
              <button
                onClick={() => setMalDialogOppen(false)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                Avbryt
              </button>
              <button
                onClick={() => void startaMal()}
                disabled={!malDialogText.trim() || malStartar}
                className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-bold text-[#0E1B2E] transition-colors hover:bg-gold/90 disabled:opacity-50"
                title="Starta mål-läget (session/goal set) — den autonoma loopen börjar"
              >
                {malStartar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Starta mål-läge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* V86 G6: GENVÄGSÖVERSIKT — "?"-tangenten (utanför inmatningsfält)
          visar ALLA kortkommandon i tabellform. Esc/klick utanför stänger. */}
      {visaGenvagar && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[2px]"
          onClick={() => setVisaGenvagar(false)}
        >
          <div
            role="dialog"
            aria-label="Tangentbordsgenvägar"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gold/40 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-gold/20 px-3.5 py-2.5">
              <MessageCircleQuestion className="h-4 w-4 shrink-0 text-gold" />
              <h2 className="min-w-0 flex-1 font-serif text-sm font-bold">Tangentbordsgenvägar</h2>
              <button
                onClick={() => setVisaGenvagar(false)}
                title="Stäng (Esc)"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold/15 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  <th className="px-3.5 py-1.5 font-semibold">Tangent</th>
                  <th className="px-3.5 py-1.5 font-semibold">Vad den gör</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Enter", "Skicka prompten till agenten"],
                    ["Skift+Enter", "Ny rad i skrivfältet (flerradsprompt)"],
                    ["Ctrl/Cmd+K", "Kommandopaletten — sök kommandon, modellbyten och tema"],
                    ["T", "Växla tema (marin natt / paper) — ej i inmatningsfält"],
                    ["/", "Kommandomenyn i skrivfältet (snabbkommandon med autocomplete)"],
                    ["↑", "Föregående prompt ur historiken (i tomt skrivfält); ↑/↓ navigerar även palett och sök"],
                    ["?", "Denna genvägsöversikt"],
                    ["Esc", "Stäng palett, sök, paneler och dialoger"],
                  ] as const
                ).map(([tangent, beskrivning]) => (
                  <tr key={tangent} className="border-b border-border/60 last:border-b-0">
                    <td className="whitespace-nowrap px-3.5 py-1.5">
                      <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                        {tangent}
                      </kbd>
                    </td>
                    <td className="px-3.5 py-1.5 text-muted-foreground">{beskrivning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-gold/20 px-3.5 py-1.5 text-[10px] text-muted-foreground/70">
              Tryck ? igen eller Esc för att stänga — musen funkar förstås också.
            </p>
          </div>
        </div>
      )}

      {/* V86 G7: MOBIL-KEBAB (⋮) — export-knapparna (markdown + HTML) bor här
          under sm; skrivbordet visar dom inline i verktygsraden. */}
      {kebabOppen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setKebabOppen(false)}
            aria-hidden
          />
          <div
            role="menu"
            aria-label="Exportera"
            className="fixed right-3 top-36 z-50 w-52 overflow-hidden rounded-xl border border-gold/40 bg-[#10233F] shadow-2xl sm:hidden"
          >
            <p className="border-b border-gold/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/50">
              Exportera chatten
            </p>
            <button
              role="menuitem"
              onClick={() => {
                setKebabOppen(false);
                exporteraChat();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-[#EDE6D6]/90 transition-colors hover:bg-white/10"
            >
              <Download className="h-4 w-4 shrink-0 text-gold/80" />
              Markdown (.md)
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setKebabOppen(false);
                exporteraChatHtml();
              }}
              className="flex w-full items-center gap-2 border-t border-gold/10 px-3 py-2.5 text-left text-xs text-[#EDE6D6]/90 transition-colors hover:bg-white/10"
            >
              <Printer className="h-4 w-4 shrink-0 text-gold/80" />
              HTML (printbar)
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setKebabOppen(false);
                setVisaGenvagar(true);
              }}
              className="flex w-full items-center gap-2 border-t border-gold/10 px-3 py-2.5 text-left text-xs text-[#EDE6D6]/90 transition-colors hover:bg-white/10"
            >
              <MessageCircleQuestion className="h-4 w-4 shrink-0 text-gold/80" />
              Genvägar (?)
            </button>
          </div>
        </>
      )}

      {/* V86 G6: NOTISPANEL — drawer i filträdets stil. Historik ur
          localStorage ak1a-studio-notiser (sista 50), typ-ikon + tidsstämpel,
          "Slå på notiser" när rättigheten saknas, Töm-knapp. Esc stänger. */}
      {visaNotiser && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setVisaNotiser(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Notishistorik"
            className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[380px] flex-col border-l border-gold/30 bg-[#0D1B31] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-gold/25 bg-black/25 px-3 py-2.5">
              {notisRattighet === "granted" ? (
                <BellRing className="h-4 w-4 shrink-0 text-emerald-300" />
              ) : (
                <Bell className="h-4 w-4 shrink-0 text-gold" />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-sm font-bold text-[#EDE6D6]">Notishistorik</h2>
                <p className="truncate text-[10px] text-[#EDE6D6]/55">
                  {notiser.length === 0 ? "inga notiser än" : `${notiser.length} ${notiser.length === 1 ? "notis" : "notiser"} (max 50)`}
                </p>
              </div>
              <button
                onClick={() => setVisaNotiser(false)}
                title="Stäng (Esc)"
                className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Rättighetsraden — begärs numera här (V86 G6), inte på 🔔-klicket */}
            <div className="border-b border-gold/15 bg-black/15 px-3 py-2">
              {notisRattighet === "granted" ? (
                <p className="flex items-center gap-1.5 text-[10px] leading-relaxed text-emerald-300/85">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Notiser på — rundor över 60 s pingar och ”✓ Klar (N tkn)” kommer när agenten är färdig.
                </p>
              ) : notisRattighet === "denied" ? (
                <p className="flex items-center gap-1.5 text-[10px] leading-relaxed text-red-300/85">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  Notiser blockerade — tillåt ak1nvestor.com i webbläsarens inställningar.
                </p>
              ) : notisRattighet === "stöds ej" ? (
                <p className="text-[10px] leading-relaxed text-[#EDE6D6]/50">
                  Webbläsaren saknar stöd för notiser — historiken lever ändå kvar här.
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 text-[10px] leading-relaxed text-[#EDE6D6]/60">
                    Slå på notiser — agentens långa rundor pingar när den är klar.
                  </p>
                  <button
                    onClick={() => void begraNotisRattighet()}
                    className="shrink-0 rounded-full bg-gold px-3 py-1 text-[10px] font-bold text-[#0E1B2E] transition-colors hover:bg-gold/90"
                  >
                    Slå på
                  </button>
                </div>
              )}
            </div>

            {/* Historiken — nyast överst, typ-ikon + tidsstämpel */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 [scrollbar-width:thin]">
              {notiser.length === 0 ? (
                <p className="px-2 py-3 text-[11px] leading-relaxed text-[#EDE6D6]/60">
                  Ingen historik än — varje Web Notification (⏳ rundor över 60 s, ✓ när agenten
                  är klar, fel) loggas här och sparas i webbläsaren (sista 50).
                </p>
              ) : (
                <ul className="space-y-1">
                  {[...notiser].reverse().map((n) => (
                    <li
                      key={n.tid}
                      className="flex items-start gap-2 rounded-md bg-white/5 px-2 py-1.5 text-[11px] text-[#EDE6D6]/85"
                      title={new Date(n.tid).toLocaleString("sv-SE")}
                    >
                      {n.typ === "lang" ? (
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      ) : n.typ === "klar" ? (
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                      ) : (
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-300" />
                      )}
                      <span className="min-w-0 flex-1 break-words leading-relaxed">{n.text}</span>
                      <span className="shrink-0 whitespace-nowrap font-mono text-[9px] text-[#EDE6D6]/40">
                        {new Date(n.tid).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Töm-knapp + förklaringsrad */}
            <div className="flex items-center justify-between gap-2 border-t border-gold/25 bg-black/25 px-3 py-2.5">
              <p className="text-[10px] leading-relaxed text-[#EDE6D6]/45">
                Spelas i denna webbläsare (localStorage ak1a-studio-notiser, sista 50).
              </p>
              <button
                onClick={() => {
                  tomNotiser();
                  visaToast("Notishistoriken tömd.");
                }}
                disabled={notiser.length === 0}
                title="Töm notishistoriken"
                className="flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200 disabled:opacity-40"
              >
                <Trash2 className="h-3 w-3" />
                Töm
              </button>
            </div>
          </aside>
        </>
      )}

      {/* VÅG 88 I1: INSTÄLLNINGAR-DRAWER ⚙️ — modell/läge/tankestyrka/tema i
          LISTA-form (48 px tryckytor) i stället för headerns dropdowns.
          Esc stänger; öppning stänger övriga drawers (ömsesidigt). Kontextens
          progressbar bor här (kontextraden visar bara "📊 X tkn · Y%"). */}
      {installningarOppen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setInstallningarOppen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Inställningar"
            className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[380px] flex-col border-l border-gold/30 bg-[#0D1B31] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-gold/25 bg-black/25 px-3 py-2.5">
              <Settings className="h-4 w-4 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-sm font-bold text-[#EDE6D6]">Inställningar</h2>
                <p className="truncate text-[10px] text-[#EDE6D6]/55">modell · läge · tankestyrka · tema</p>
              </div>
              <button
                onClick={() => setInstallningarOppen(false)}
                title="Stäng (Esc)"
                className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2 py-3 [scrollbar-width:thin]">
              {/* MODELL — radio-knappar för hela listan (härledd ur config.json,
                  aldrig hårdkodad). Byte = kassera + session/create med modellen. */}
              <section aria-label="Modell">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#EDE6D6]/50">
                  Modell
                </p>
                {modeller.length === 0 ? (
                  <p className="px-3 py-2 text-[11px] leading-relaxed text-[#EDE6D6]/55">
                    Ingen modellista ännu (GET /api/studio/modeller) — listan härleds ur
                    zcode-config.json på servern.
                  </p>
                ) : (
                  modeller.map((m) => (
                    <InstallningarRad
                      key={m.id}
                      vald={m.id === valdModell}
                      titel={m.namn}
                      beskrivning={modellBeskrivning(m.id)}
                      val={m.id}
                      jobbar={byterModell && m.id === valdModell}
                      disabled={byterModell || strömmarHuvud || !arHuvudAktiv}
                      onClick={() => void bytModell(m.id)}
                    />
                  ))
                )}
                <p className="mt-1 px-3 text-[10px] leading-relaxed text-[#EDE6D6]/40">
                  Byte skapar en ny session med modellen — gamla sessioner lever kvar
                  i Sessioner-listan.
                </p>
              </section>

              {/* LÄGE — build (kör fritt) / plan (godkännandedialoger). */}
              <section aria-label="Agentläge" className="border-t border-gold/15 pt-3">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#EDE6D6]/50">
                  Läge
                </p>
                {!lage && (
                  <p className="px-3 py-2 text-[11px] leading-relaxed text-[#EDE6D6]/55">
                    Läser sessionens läge (session/setMode)…
                  </p>
                )}
                <InstallningarRad
                  vald={lage === "build"}
                  titel="Build"
                  beskrivning="Agenten kör fritt — låg/medel risk godkänns automatiskt"
                  val="build"
                  disabled={!lage || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && lage === "build"}
                  onClick={() => void byteLage("build")}
                />
                <InstallningarRad
                  vald={lage === "plan"}
                  titel="Plan"
                  beskrivning="Verktyg kräver godkännande — diff förhandsvisas i dialogen"
                  val="plan"
                  disabled={!lage || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && lage === "plan"}
                  onClick={() => void byteLage("plan")}
                />
              </section>

              {/* TANKESTYRKA — resonemangets djup (session/setThoughtLevel). */}
              <section aria-label="Tankestyrka" className="border-t border-gold/15 pt-3">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#EDE6D6]/50">
                  Tankestyrka
                </p>
                {!tanka && (
                  <p className="px-3 py-2 text-[11px] leading-relaxed text-[#EDE6D6]/55">
                    Läser tankestyrkan (session/setThoughtLevel)…
                  </p>
                )}
                <InstallningarRad
                  vald={tanka === "nothink"}
                  titel="Av"
                  beskrivning="Snabbast — inget synligt resonemang"
                  val="nothink"
                  disabled={!tanka || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && tanka === "nothink"}
                  onClick={() => void byteTanke("nothink")}
                />
                <InstallningarRad
                  vald={tanka === "high"}
                  titel="Hög"
                  beskrivning="Djupt resonemang för krävande uppgifter"
                  val="high"
                  disabled={!tanka || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && tanka === "high"}
                  onClick={() => void byteTanke("high")}
                />
                <InstallningarRad
                  vald={tanka === "max"}
                  titel="Max"
                  beskrivning="Maximalt resonemang — långsammare men grundligast"
                  val="max"
                  disabled={!tanka || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && tanka === "max"}
                  onClick={() => void byteTanke("max")}
                />
              </section>

              {/* TEMA — switch (mörk/ljus); tangent T växlar även utanför. */}
              <section aria-label="Tema" className="border-t border-gold/15 pt-3">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#EDE6D6]/50">
                  Tema
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={morkLage}
                  onClick={vaxlaTema}
                  title="Växla mörkt/ljust tema — tangent T"
                  className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
                >
                  {morkLage ? (
                    <Moon className="h-4 w-4 shrink-0 text-gold" />
                  ) : (
                    <Sun className="h-4 w-4 shrink-0 text-gold" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#EDE6D6]">
                      {morkLage ? "Mörkt tema" : "Ljust tema"}
                    </span>
                    <span className="mt-0.5 block leading-snug text-[11px] text-[#EDE6D6]/55">
                      {morkLage ? "Marin natt med luminöst guld" : "Paper med guldkant"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                      morkLage ? "bg-gold" : "bg-white/20",
                    )}
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                        morkLage ? "left-[22px]" : "left-0.5",
                      )}
                    />
                  </span>
                </button>
              </section>

              {/* KONTEXT — progressbaren + totalerna (flyttad från kontextraden). */}
              <section aria-label="Kontext" className="border-t border-gold/15 pt-3">
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#EDE6D6]/50">
                  Kontext
                </p>
                <div className="rounded-lg bg-black/25 px-3 py-2.5">
                  <p className="text-[11px] tabular-nums leading-relaxed text-[#EDE6D6]/80">
                    {rundaTkn !== null ? `${tkn(rundaTkn)} tkn denna runda · ` : ""}
                    ~{tkn(ackumulerat)} totalt
                    {kontextProcent !== null &&
                      ` · ${kontextProcent.toFixed(kontextProcent < 10 ? 1 : 0)}% av taket (${tkn(kontextTak)})`}
                    {kontext?.modell && ` · ${kontext.modell}`}
                  </p>
                  {kontextProcent !== null && (
                    <span className="relative mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
                      <span
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all",
                          kontextProcent >= KONTEXT_VARNING_PROCENT ? "bg-gold" : "bg-emerald-400/80",
                        )}
                        style={{ width: `${Math.min(100, kontextProcent)}%` }}
                      />
                    </span>
                  )}
                  <p className="mt-1.5 text-[10px] leading-relaxed text-[#EDE6D6]/40">
                    Kontextraden i headern visar bara "📊 X tkn · Y%" — detaljerna bor här.
                  </p>
                </div>
              </section>
            </div>
          </aside>
        </>
      )}

      {/* V84 A2: KOMMANDOPALETT (Ctrl/Cmd+K) — sök bland snabbkommandona,
          "Byt modell X" och Tema. Registret STUDIO_KOMMANDON är källan;
          ↑↓ navigerar, Enter kör, Esc stänger. Även knapp "⌘K" (mobil). */}
      {palettOppen && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-[2px]"
          onClick={() => setPalettOppen(false)}
        >
          <div
            role="dialog"
            aria-label="Kommandopalett"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-gold/40 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-gold/20 px-3.5 py-2.5">
              <Command className="h-4 w-4 shrink-0 text-gold" />
              <input
                ref={palettInputRef}
                value={palettFras}
                onChange={(e) => setPalettFras(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setPalettIndex((i) => Math.min(i + 1, palettPoster.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setPalettIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const p = palettPoster[palettIndex];
                    if (p) {
                      setPalettOppen(false);
                      p.kor();
                    }
                  }
                }}
                placeholder="Sök kommandon, modellbyten och tema…"
                maxLength={80}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
              <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                Esc
              </kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto py-1.5">
              {palettPoster.length === 0 && (
                <li className="px-4 py-3 text-xs text-muted-foreground">Inga träffar — prova "modell" eller "tema".</li>
              )}
              {palettPoster.map((p, i) => (
                <li key={p.id}>
                  <button
                    ref={(el) => {
                      if (el) palettRadRefs.current.set(p.id, el);
                      else palettRadRefs.current.delete(p.id);
                    }}
                    onClick={() => {
                      setPalettOppen(false);
                      p.kor();
                    }}
                    onMouseEnter={() => setPalettIndex(i)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors",
                      i === palettIndex ? "bg-gold/15" : "hover:bg-muted/60",
                    )}
                  >
                    {p.ikon === "kommando" ? (
                      <Terminal className="h-4 w-4 shrink-0 text-gold/80" />
                    ) : p.ikon === "modell" ? (
                      <Bot className="h-4 w-4 shrink-0 text-gold/80" />
                    ) : morkLage ? (
                      <Sun className="h-4 w-4 shrink-0 text-gold/80" />
                    ) : (
                      <Moon className="h-4 w-4 shrink-0 text-gold/80" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{p.etikett}</span>
                      <span className="block truncate text-[10px] text-muted-foreground/80">{p.beskrivning}</span>
                    </span>
                    <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground/70">
                      {p.grupp}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-gold/20 px-3.5 py-1.5 text-[10px] text-muted-foreground/70">
              ↑↓ välj · Enter kör · Esc stänger — samma kommandon som /help
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
