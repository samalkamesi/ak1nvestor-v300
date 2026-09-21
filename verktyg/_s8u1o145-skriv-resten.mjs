#!/usr/bin/env node
// _s8u1o145-skriv-resten.mjs — ENGÅNGSDRIV (o145 §6): domna de sista öppna
// fynden (F5-logg 9 rader via 7 domer — två kollisionsgrupper täcks av
// basnyckel enligt o69-kontraktet; F1-kod 1; F3-api 1) via skrivgrinden.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GRIND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "feljakt-skriv-dom.mjs");

const domer = [
  // REDAN SKRIVNA i första försöket (före kollisionsgrupp-kuren): agentfabrik
  // falskt-pos + arbetsyta transient-design — tas ej dubbel.
  /*
  [
    "--fynd", "2026-09-20T23:13:23.552Z|F5-logg|agentfabrik/logg.jsonl: felmönster på ny rad",
    "--dom", "falskt-pos",
    "--rotorsaka", "F5-mönstret /misslyckades/i träffade ORDEN I ETT FILNAMN: loggraden är s8-u2:s LYCKADE leverans (uppgift-klar kod 0, 1148 s) vars leveransfält listar data/forskning/OPTIMERING/o135-prodsynk-MISSLYCKADES-domning-s8.md — mönsterträffen i substansen 'misslyckades-domning' är ett namn, inte ett fel. Fabriken loggade aldrig något misslyckande",
    "--kur", "Domen stänger raden; STRUKTURELL köpost bokförs i o145 §7: feljägarens F5-gren bör exkludera träffar som kommer enbart från leverans-/filnamnsfält (FYNN-ägarens yta — V235-precedensen visar vaccinationen är organets beslut)",
    "--bevis", "agentfabrik/logg.jsonl 23:06:28.446Z: uppgift-klar · auto-s8-1789943721747 · s8-u2 · kod 0 · leverans börjar 'data/vakten/feljakt-bedomningar.jsonl, …/o135-prodsynk-misslyckades-domning-s8.md' — ordet 'misslyckades' finns ENDAST i filnamnet",
    "--protokoll", "o145 §6 (egen gravning)",
  ],
  // F5: arbetsyta-synkens designskydd + grönt kvitto 9 min senare
  [
    "--fynd", "2026-09-20T23:43:42.659Z|F5-logg|prod-synk.log: felmönster på ny rad",
    "--dom", "transient-design",
    "--rotorsaka", "AGENTARBETSYTA-SYNK MISSLYCKADES 23:43:31Z är prod-synkens DESIGNSKYDD: ocommittade ändringar i agent-ytan (2 rader) skyddas från att raderas — synken väntar på commit i stället för att förstöra arbete (o83-klassens läxa, inbyggd)",
    "--kur", "Skyddet verkade och flödet helades av sig självt: 23:52:09Z 'AGENTARBETSYTA synkad (redan ikapp + AGENTS.md) — agenten lever i aktuell kod'; deploykedjan omkring gröna: DEPLOYAD 23:43:19 (35 commits, prod 200) före, NY KOD 23:47:22 efter",
    "--bevis", "prod-synk.log 23:43:31Z (skyddsraden med orsak 'ocommittade ändringar skyddas') → 23:52:09Z (synkad-kvitto) · DEPLOYAD 23:43:19Z prod 200",
    "--protokoll", "o145 §6 + o135:s agentyte-skydd-domar (precedens)",
  ], */
  // F5: hjärtat ×2 (kollisionsgrupp 02:43:25.053 — basdom täcker båda)
  [
    "--fynd", "2026-09-21T02:43:25.053Z|F5-logg|hjartslag.log: felmönster på ny rad",
    "--dom", "transient-design",
    "--rotorsaka", "Nattens OOM-kedja (o130/o131-krönikan, 09-21-upplagan): byggfel 02:28:44 + ombyggfel 02:32:01 under RAM-svält (VÄNTAR-RAM 158 MB 02:37:30) ⇒ pm2-omstartloop ⇒ hjärtats fetch failed 02:31:13 + 02:41:12 — BÅDA raderna samma fönster (basdom täcker kollisionsgruppen enligt o69)",
    "--kur", "Hjärtats EGEN design verkade: 'WEB-VAKT: appen osvarar — pm2-restartar ak1a'; kraschvakten helade: ÅTERSTÄLLD grön 03:14:30Z (omstarter +0) och RÄDDNING KLAR 05:31:04Z; strukturella kur V235 (rond 133) + VÄNTAR-RAM-grinden sekvenserar tunga klasser",
    "--bevis", "hjartslag.log 02:31:13 + 02:41:12 (båda med WEB-VAKT-raden = designat omstartsbeteende) · prod-synk.log 02:28:44 bygg MISSLYCKADES → 02:37:30 VÄNTAR-RAM 158 MB · kraschvakt.log 03:14:30.382Z ÅTERSTÄLLD svarar=true (grön) · 05:31:04.990Z RÄDDNING KLAR",
    "--protokoll", "o145 §6 + o130/o131-krönika + rond 141 (syskonfyndet domnat 09:43Z)",
  ],
  // F5: kraschvakt ×2 (kollisionsgrupp 02:43:25.054)
  [
    "--fynd", "2026-09-21T02:43:25.054Z|F5-logg|kraschvakt.log: felmönster på ny rad",
    "--dom", "transient-design",
    "--rotorsaka", "Samma OOM-kedja: KRASCHLOOP-MISSTANKE 02:34:30 (omstarter +76) var DETEKTORNS korrekta larm — appen svarade ej under .next-ombyggnad; RÄDDNINGSBYGG MISSLYCKADES 02:39:05 (flock-fönstret + RAM-svält; artefakt-okänd-grenens design: lämna senast gröna) — detektor + räddning arbetade båda som designade",
    "--kur", "Kedjan helade sig själv: oom-återställningar var ~10:e minut 02:52–03:40, sedan ÅTERSTÄLLD grön 03:14:30 (incidentläke friskt) och 05:31:04 RÄDDNING KLAR (kooldown 120 min, mål kunden märker max ~10-15 min)",
    "--bevis", "kraschvakt.log 02:34:30.489Z KRASCHLOOP-MISSTANKE svarar=false omstarter +76 ⇒ RÄDDNINGSBYGG · 02:39:05.465Z RÄDDNINGSBYGG MISSLYCKADES (flock-w-1200, artefakt okänd) · 03:14:30.382Z ÅTERSTÄLLD (grön) · prod 200 genom dagen (o141-u2 återmätning 2026-09-21)",
    "--protokoll", "o145 §6 + o125 strukturkontrakt (kraschvaktens designade beteende)",
  ],
  // F5: prod-synk 02:28:44
  [
    "--fynd", "2026-09-21T02:43:25.058Z|F5-logg|prod-synk.log: felmönster på ny rad",
    "--dom", "transient-design",
    "--rotorsaka", "Byggfel 02:28:44Z under RAM-svältnatten: HEAD rörde ENBAST icke-byggyta (4 filer) — därför AVSTÅR synken revert (o72) och bygger om på orörd HEAD; .next ÅTERSTÄLLD ur läkebackup i samma andetag (pm2 serverar senast gröna läget) — misslyckandet hanterat av synkens egen procedur",
    "--kur", "OOM-grenens läkebackup-procedur (o97-klassen) verkade vid VARJE dött bygg; dagen läkt: DEPLOYAD d401d719 02:12:24 prod 200 före, ny DEPLOYAD-flöde + ÅTERSTÄLLD 03:14 efter; V235 sekvenserar framtida fönster",
    "--bevis", "prod-synk.log 02:28:44Z 'byggfel: .next ÅTERSTÄLLD ur läkebackup' + 'bygg MISSLYCKADES … revert AVSTÅS (o72), ombygg på orörd HEAD' · 02:00:02Z + 02:52:12Z–03:40:35Z oom-återställningsserien · kraschvakt 03:14:30Z ÅTERSTÄLLD",
    "--protokoll", "o145 §6 + o97-läkebackup-precedens",
  ],
  // F5: prod-synk 02:32:01
  [
    "--fynd", "2026-09-21T02:43:25.059Z|F5-logg|prod-synk.log: felmönster på ny rad",
    "--dom", "transient-design",
    "--rotorsaka", "Ombygget på orörd HEAD misslyckades 02:32:01Z (samma RAM-svält); kedjan goodHead..HEAD rörde enbart icke-byggyta ⇒ goodHead-ombygg vore identiskt: reset AVSTÅS (o79) — synkens EGEN räddningslogik som lämnade HEAD orört och .next återställd (02:32:32Z o79-avsta-raden)",
    "--kur", "Nytt försök nästa poll + oom-grenens läkebackuper; läkt med ÅTERSTÄLLD 03:14 + RÄDDNING KLAR 05:31; VÄNTAR-RAM-grinden (02:37:30 158 MB) bevisar sekvenseringen vakade",
    "--bevis", "prod-synk.log 02:32:01Z 'ombygg på orörd HEAD misslyckades … reset AVSTÅS (o79), HEAD orörd, nytt försök nästa poll' · 02:32:32Z 'o79-avsta: .next ÅTERSTÄLLD ur läkebackup' · 02:37:30Z VÄNTAR-RAM 158 MB",
    "--protokoll", "o145 §6 + o79-avstå-regeln",
  ],
  // F5: kraschvakt 05:24
  [
    "--fynd", "2026-09-21T05:28:20.177Z|F5-logg|kraschvakt.log: felmönster på ny rad",
    "--dom", "transient-design",
    "--rotorsaka", "Nattens sista missbruksfönster: KRASCHLOOP-MISSTANKE 05:24:17.536Z (omstarter +30) — detektorns KORREKTA larm på samma OOM-krönika; räddningsbygget SLUTFÖRDES denna gång",
    "--kur", "RÄDDNING KLAR 05:31:04.990Z (svarar=true, kooldown 120 min) — kraschvaktens designade livcykel detektera→rädda→kvittera fullföljd; processen stabil sedan 05:31 (rond 141-domens färsksonder)",
    "--bevis", "kraschvakt.log 05:24:17.536Z ⇒ 05:31:04.990Z RÄDDNING KLAR · syskonfyndet 05:28:19.389Z 'ak1a = errored' domnat transient-design 09:43:34.452Z med 'processen stabil sedan 05:31 · prod-synk.log VÄNTAR-RAM-rader = sekvenseringen vakar'",
    "--protokoll", "o145 §6 + rond 141",
  ],
  // F1: node --check-timeout — omkollad GRÖN
  [
    "--fynd", "2026-09-20T23:28:23.403Z|F1-kod|okontrollerad (timeout): verktyg/_r103-v209-manifest.mjs",
    "--dom", "transient-design",
    "--rotorsaka", "Kontrollens EGEN 10 s-tak (ej filen): node --check på _r103-v209-manifest.mjs hann inte klart under nattens höga last — fyndraden själv konstaterar 'lastrelaterat, omkollas nästa jakt'",
    "--kur", "Omkoll GRÖN 2026-09-21 16:2xZ: node --check körde klart felfritt på filen (timeout 15 s) — inget kodfel finns",
    "--bevis", "node --check verktyg/_r103-v209-manifest.mjs = exit 0 vid omkoll (o145 §6, egen körning); filen orörd sedan 09-20",
    "--protokoll", "o145 §6",
  ],
  // F3: /anvandning självläkt
  [
    "--fynd", "2026-09-21T15:16:04.647Z|F3-api|/anvandning övergående nätverksfel — självläkt",
    "--dom", "transient-design",
    "--rotorsaka", "Övergående nätverksfel (första försöket TimeoutError: The operation was aborted) — fyndradens eget bevis 'omtest OK efter 20 s'; klass = kall transport i eftermiddagens fabriks-/mätningsfönster",
    "--kur", "Självläkt vid omtest (20 s); färsk sond 2026-09-21 16:2xZ: GET /api/studio/anvandning via localhost → 401 (auth-kontraktet LEVER — endpointen svarar)",
    "--bevis", "fyndradens bevisfält 'omtest OK efter 20 s' · färsk curl-sond 401 via localhost:3000 (o145 §6, egen körning)",
    "--protokoll", "o145 §6",
  ],
];

for (const args of domer) {
  const ut = execFileSync("node", [GRIND, ...args], { encoding: "utf8" });
  console.log(ut.trim());
}
