#!/usr/bin/env node
// _s8u2o135-domner.mjs — spår 8 s8-u2 (o135): domar för feljaktens 36 öppna fynd.
// Källor: prod-synk.log, kraschvakt.log, hjartslag.log, o97/o125/o130/o131-protokollen.
// Kontrakt (o69): nyckel = ts|spår|fynd; bevisHash ENDAST för kollisionsgrupper;
// dom ∈ {falskt-pos, rotkurad, pagaende, transient-design}; append en rad i taget.
// Idempotent: domar skrivs ENDAST för nycklar som saknar bedömning.
import fs from "node:fs";
import { createHash } from "node:crypto";

const VAKT = "/home/ak1a/AK1/data/vakten";
const FYNDLOGG = `${VAKT}/feljakt-fynd.jsonl`;
const BEDOMNINGAR = `${VAKT}/feljakt-bedomningar.jsonl`;
const PROTOKOLL = "OPTIMERING/o135-prodsynk-misslyckades-domning-s8.md";
const DOMD_AV = "s8-u2 (fabrik auto-s8-1789943721747, spår 8 vakt 2/3)";
const DOMD_TS = new Date().toISOString();

function lasJsonl(fil) {
  return fs
    .readFileSync(fil, "utf8")
    .split("\n")
    .filter((r) => r.trim())
    .map((r) => JSON.parse(r));
}

const fynd = lasJsonl(FYNDLOGG);
const bedomningar = lasJsonl(BEDOMNINGAR);
const nyckel = (f) => `${f.ts}|${f["spår"] ?? f.spar ?? ""}|${f.fynd ?? ""}`;
const domda = new Set(bedomningar.map(nyckel));

// kollisionsgrupper bland fyndraderna (o69): nyckel → antal
const antal = new Map();
for (const f of fynd) {
  const k = nyckel(f);
  antal.set(k, (antal.get(k) ?? 0) + 1);
}
const krock = new Map([...antal.entries()].filter(([, n]) => n > 1));
const hash = (f) => createHash("sha256").update(String(f?.bevis ?? "")).digest("hex").slice(0, 10);

// ── rotorsaka/bevis per klass (loggravet o135 §2) ────────────────────────────
const ROT_OOM_NATT_0919 =
  "synkbyggen dödade av RAM/infra natten 2026-09-19 (prod-synk.log: 5 OOM-dödade byggen 03:19:37/03:28:47/03:39:16/05:09:19/05:29:01 — 'Killed i build-steget') ; koden var frisk: samma HEAD-kedja deployades grön 07:12:27Z (DEPLOYAD 2 commits 24c220d6, prod 200) 11 min efter sista fail; rot-kur: o97 .next-läkebackup (första loggrad 2026-09-19T19:47:21Z, mekanismen född ur denna dags incident enligt o97 §0) gör att misslyckade byggen slutar blöda i prod — driftbevisad 09-20 vid fyra nya OOM-byggen ('.next ÅTERSTÄLLD ur läkebackup' vid varje, prod serverade gröna)";
const ROT_OOM_NATT_0920 =
  "synkbyggen dödade av RAM/infra natten 2026-09-20 (OOM-dödat 02:10:50 strax före, 03:33:25 strax efter; även good-HEAD-bygget failar 02:21/02:35 = infra, ej kod) ; koden var frisk: DEPLOYAD 13 commits (20957e51) prod 200 kl 02:41:40 på samma natt; rot-kur: o97-läkebackupen återställde .next vid VARJE fail (loggraderna 'byggfel/goodhead-kritiskt: .next ÅTERSTÄLLD ur läkebackup' 02:18:39/02:22:04/02:28:33/02:35:52) + RAM-vaktens klassade marginaler (VÄNTAR-RAM-raderna med bygg/reserv-klasser) trösklar nya försök";
const ROT_AGENTYTE =
  "prod-synkens agentyte-skydd (o11 rotanalys, rond 124-precedens): git pull --ff-only vägrar en agentarbetsyta med ocommittade ändringar — doktrinen 'håll trädet committat; en smutsig yta får ALDRIG skrivas över' gör väntandet DESIGNAT skydd, inte fel; prod-pipellinen var samtidigt GRÖN (DEPLOYAD-raderna omkring)";
const ROT_KRASCHVAKT =
  "kraschvaktens designade räddningsbeteende (o125 strukturkontrakt, svit 53/53): KRASCHLOOP-MISSTANKE-detekteringen (omstarter +17, SANN under 22:2x-omstartloop) eskalerar korrekt till räddningsbygg; bygger endast under flock (flock -w 1200) — under 2026-09-20 22:25–22:31 hölls deploy-låset av ett främmande fristående bygg (o130 §3) så väntan misslyckades korrekt; grenen lämnar pm2 STOPPAD (restart mot ofullständigt .next = kraschloop, 502-klassen) + kooldown 30 ⇒ nästa poll — exakt den design som o131 §3 dokumenterar läkte prod 22:31Z";

const regler = {
  // ── klass A: F5 prod-synk.log (10) ──
  "2026-09-18T17:42:58.313Z": {
    dom: "transient-design",
    rotorsaka:
      "mål-återarmningens 502 föll i prod-synkens DESIGNADE pm2-byggstoppfönster: 17:32:04 DEPLOYAD prod 200 → pm2 stoppad 17:27:15 under patchfönstret (o48/r58-kurens design) → mål-stegets anrop mot appen fick 502 pågående-stopp → 17:32:08 pm2 återstartad (o48-garantin); LÄKT + bevisat 17:50:50 'MÅL återarmat ur disk direkt efter deploy (v152)' — disk-vägen gör mål-återarmningen motståndskraftig mot byggfönster",
    bevis: "prod-synk.log 2026-09-18: 17:27:15 'pm2 stoppad under byggfönstret' · 17:32:04 'DEPLOYAD … prod 200' + 'mål-återarmning FEL 502' · 17:32:08 'pm2 återstartad' · 17:50:50 'MÅL återarmat ur disk direkt efter deploy (v152)'",
  },
  "2026-09-19T07:13:56.944Z": {
    dom: "rotkurad",
    rotorsaka: ROT_OOM_NATT_0919 + " ; detta fynd = byggfail-raden 06:58:57 ('HEAD rör ENBART icke-byggyta (4 filer) — revert AVSTÅS (o72)')",
    bevis: "prod-synk.log 2026-09-19: 06:58:57 'bygg MISSLYCKADES' · 07:12:27 'DEPLOYAD automatiskt: 2 commits (24c220d6) — prod 200' · o97-protokollet + 2026-09-19T19:47:21Z första 'NEXT-LÄKEBACKUP skapad'",
  },
  "2026-09-19T07:13:56.945Z": {
    dom: "rotkurad",
    rotorsaka: ROT_OOM_NATT_0919 + " ; detta fynd = ombyggnads-raden 07:01:27 ('ombygg på orörd HEAD misslyckades … reset AVSTÅS (o79)')",
    bevis: "prod-synk.log 2026-09-19: 07:01:27 'ombygg på orörd HEAD misslyckades' · 07:12:27 'DEPLOYAD automatiskt … prod 200' · o97 §0 (rot-frågan från morgonens manifest-offer, bokförd åt synkägaren)",
  },
  "2026-09-20T02:28:01.010Z": {
    dom: "rotkurad",
    rotorsaka: ROT_OOM_NATT_0920 + " ; detta fynd = byggfail-raden 02:18:39 (10 icke-byggfiler, revert AVSTÅS)",
    bevis: "prod-synk.log 2026-09-20: 02:10:50 'bygg OOM-dödat' · 02:18:39 'bygg MISSLYCKADES' + '.next ÅTERSTÄLLD ur läkebackup' · 02:41:40 'DEPLOYAD automatiskt: 13 commits (20957e51) — prod 200'",
  },
  "2026-09-20T02:28:01.011Z": {
    dom: "rotkurad",
    rotorsaka: ROT_OOM_NATT_0920 + " ; detta fynd = ombygge-efter-revert-raden 02:19:34",
    bevis: "prod-synk.log 2026-09-20: 02:19:34 'ombygge efter revert MISSLYCKADES — återställer känd-good HEAD' · 02:22:04 '.next ÅTERSTÄLLD ur läkebackup' · 02:41:40 'DEPLOYAD … prod 200'",
  },
  "2026-09-20T02:43:04.930Z": {
    dom: "rotkurad",
    rotorsaka: ROT_OOM_NATT_0920 + " ; detta fynd = byggfail-raden 02:28:33 ('HEAD rör byggyta: revert + ombygge' — grenen följde o72-doktrinen)",
    bevis: "prod-synk.log 2026-09-20: 02:28:33 'bygg MISSLYCKADES' + '.next ÅTERSTÄLLD ur läkebackup' · 02:41:40 'DEPLOYAD automatiskt: 13 commits — prod 200' (samma natt, samma träd)",
  },
  "2026-09-20T02:43:04.931Z": {
    dom: "rotkurad",
    rotorsaka: ROT_OOM_NATT_0920 + " ; detta fynd = ombygge-efter-revert-raden 02:32:17",
    bevis: "prod-synk.log 2026-09-20: 02:32:17 'ombygge efter revert MISSLYCKADES' · 02:35:52 'goodhead-kritiskt: .next ÅTERSTÄLLD ur läkebackup' · 02:41:40 'DEPLOYAD … prod 200'",
  },
  "2026-09-20T19:43:06.834Z": {
    dom: "transient-design",
    rotorsaka: ROT_AGENTYTE + " (rad 19:32:11, 'ocommittade ändringar … (1 rader) — synk väntar på commit')",
    bevis: "prod-synk.log 2026-09-20: 19:31:54 'DEPLOYAD automatiskt: 8 commits (c95eba52) — prod 200' följd av 19:32:11 'AGENTARBETSYTA-SYNK MISSLYCKADES (… skyddas …)' — prod-grönt och skyddet designat i samma sekund",
  },
  // 20:13:11.757 ×2 — kollisionsgrupp: precis-dom via bevisHash (o69)
  // 22:28:38.503 ×2 — kollisionsgrupp: precis-dom via bevisHash (o69)
  // ── klass B: 22:28:38-klustret (22) ──
  F3_EFTERDYNING: {
    dom: "transient-design",
    rotorsaka:
      "kall transport under pm2-omstartens värmefönster — FYNN nr 3-klassen (18:44Z-domad transient-design av rond 123 [organ:Φ]): /api/studio/* går via studio-transportens barn-RPC (zcode-app-server); mätningen 22:28:38 föll 4 min efter pm2-omstarten 22:24 (kraschloop-detektionens omstarter +17) mitt i 2026-09-20 22:2x-omstartskaskaden; roten svarar och transporten värms vid återmätning — efterdyning, ej defekt",
    bevis:
      "fyndradens eget bevisfält: 'pm2-omstart < 25 min: kall transport under syskonlast (18:44Z-klassen, FYNN nr 3-grinden 2026-09-20)' + kraschvakt.log 22:24:22 'KRASCHLOOP-MISSTANKE: … omstarter +17' + rond 123:s transient-design-dom på identisk signatur (2026-09-20T18:44Z) + o131 §3: prod 200 ×5 från 22:31Z",
  },
  "2026-09-20T22:28:38.015Z": {
    dom: "pagaende",
    rotorsaka:
      "ak1a errored (restarts 6961) under 2026-09-20 22:2x-kaskaden: bygg-OOM #3 22:21:12 + främmande fristående bygg 22:25–22:31Z dog olagt och lämnade .next utan BUILD_ID ⇒ pm2-omstartloop ⇒ prod 502 22:29Z (o130 §3: fyra infra-incidenter samma kväll, infra-klass ej kod) ; ÅTGÄRD PÅGÅR: läkt 22:31Z via synkens OOM-procedur under flock (prod 200 ×5, proxy-EFTER grönt — o131 §3/§4) men DEPLOYAD-grindens vakarövertag (o131 §4: EFTER-kvittering av kurer o126+o127+o128) väntar fortfarande RAM-fönster (22:37-ropet VÄNTAR-RAM) — full nedläggning vid deployad EFTER-kvittering",
    bevis: "kraschvakt.log 127–128 (22:24:22 detektion, 22:28:07 räddningsförsök) · prod-synk.log 22:21:12 'bygg OOM-dödat' · 22:37:21 'VÄNTAR-RAM' · o130 §3 + o131 §3–§4 (prod 200 ×5 på LDVlDGu2-läket)",
  },
  "2026-09-20T22:28:38.530Z": {
    dom: "pagaende",
    rotorsaka:
      "'prod osvarar' (fetch failed) 22:28:38 = mätning mitt i 502-fönstret 22:29–22:31: bygg-OOM-kaskaden 22:21 + olagt dött bygg 22:25 ⇒ .next utan BUILD_ID ⇒ pm2-loop (o130 §3) ; ÅTGÄRD PÅGÅR: läkt 22:31Z (prod 200 ×5, o131 §3) men OOM-klassens deployfönster-lotteri lever (doktrin V227-läxan: 'sondera RAM före byggstart') och o131 §4:s DEPLOYAD-grind väntar — samma åtgärdsspår som fyndet 22:28:38.015Z",
    bevis: "o131-protokollet §3 (driftkrönikan med exakta tidsstämplar) + §4 (prod 200 ×5) · prod-synk.log 22:00:11/22:10:20/22:21:12 'bygg OOM-dödat' ×3 + 22:37:21 'VÄNTAR-RAM'",
  },
  // ── klass C/D: äldre HÖGA (09-19) ──
  "2026-09-19T05:33:00.000Z": {
    dom: "rotkurad",
    rotorsaka:
      "bygg-OOM-loopen 03:19–05:29 09-19 halvrev .next (BUILD_ID saknades) ⇒ /ar + /en + chunks 500 (~4 h kundpåverkan, Historik) ; ROT-KUR: o97 .next-LÄKEBACKUP — mekanismen föddes ur exakt denna dags rot-fråga (o97 §0: 's9-u3:s rot-fråga från 2026-09-19 morgon, öppet bokförd åt synkägaren'; första läkebackup-raden 19:47:21Z samma dag) — misslyckade byggen slutar blöda: pm2 serverar senast gröna läket; DRIFTBEVIS 09-20: sex OOM-döda byggen (18:00/18:10/18:19/22:00/22:10/22:21) alla '.next ÅTERSTÄLLD ur läkebackup' med prod uppe ; morgonens 500:or läktes dessutom av 07:12:27-deployen",
    bevis: "prod-synk.log 03:19–05:29 fem dödsrader · 07:12:27 'DEPLOYAD … prod 200' · 19:47:21 'NEXT-LÄKEBACKUP skapad' (o97) · 09-20: 'oom: .next ÅTERSTÄLLD ur läkebackup' ×6 · o97-prod-synk-next-laeke-s8.md",
  },
  "2026-09-19T07:05:08.303Z": {
    dom: "rotkurad",
    rotorsaka:
      "manifest-offer (o83-klassen, tredje framträdandet): två misslyckade synkbyggen 06:58:57 + 07:01:27 halvrev .next utan pm2-omstart ⇒ client reference manifest saknas ⇒ 500 på sex rutter ; ROT-KUR: (1) o97-läkebackupen (född ur samma dags rot-fråga, 19:47:21Z) återställer gröna trädet vid varje byggfail — klassen 'halvrevet .next serveras' kommer inte tillbaka; (2) LÄKT på plats: 07:12:27 'DEPLOYAD automatiskt: 2 commits — prod 200' 7 min efter fyndet",
    bevis: "prod-synk.log 06:58:57 + 07:01:27 byggfail-rader · 07:12:27 'DEPLOYAD … prod 200' · 19:47:21 första 'NEXT-LÄKEBACKUP skapad' · o97 §0 rot-frågeprovenans",
  },
  // ── klass E (1) ──
  "2026-09-20T14:57:48.171Z": {
    dom: "falskt-pos",
    rotorsaka:
      "felet var MODULE-not-found, inte SyntaxError: verktyg/testa-s7-o118-nastasteg-defer.mjs existerar inte på disk och finns inte i NÅGON commit (git log --all -- <fil> = 0 träffar) — en aldrig committad engångssond från s7-o118-spåret, städad före feljägarens återmätning; klassen 'syntaxfel i levande fil' kan inte existera i en fil som aldrig funnits i trädet (o123 §5.1: engångssonder = ingen kurrisk)",
    bevis:
      "node --check 2026-09-20T22:5xZ: 'Error: Cannot find module …/testa-s7-o118-nastasteg-defer.mjs' (MODULE_NOT_FOUND, ej SyntaxError) · git -C /home/ak1a/AK1 log --all --diff-filter=AD -- <fil> = tom · git log --all -- <fil> = tom",
  },
  // ── klass F (1) ──
  "2026-09-20T08:43:26.927Z": {
    dom: "pagaende",
    rotorsaka:
      "hjärtats SJÄLVHEALNING (frusen turn 49 min) körde 'pm2 restart ak1a' som misslyckades kl 08:41:07 under RAM-press (prod-synk.log: VÄNTAR-RAM 1011–1240 MB genom hela 08:27–08:57-fönstret) ; ingen prod-påverkan bevisad: hjärtat loggar vidare (08:51/09:01/09:11 'mål borta men prompt kör — väntar') och appen var uppe (09:00-OOM:en hanterades med pm2 serverande) ; ÅTGÄRD PÅGÅR: rot = pm2-CLI:s processfödelse under lågt minne — RAM-klassens vakt/hantering (o125 §6.2 pumpor-daemonens rop-hälsa är spårets öppna post) ; engångsfel i mekanism som annars bär självhealingen",
    bevis: "hjartslag.log 08:41:05 + 08:41:07 + 08:51:05 · prod-synk.log 08:27:03 'VÄNTAR-RAM: 1011 MB' · 08:37:03 '1240 MB' · 09:00:00 'pm2 serverar senast gröna läget'",
  },
};

const KRASCHVAKT_DOM = [
  {
    dom: "transient-design",
    rotorsaka: ROT_KRASCHVAKT + " ; detta fynd = detektionsraden 22:24:22 (KRASCHLOOP-MISSTANKE ⇒ RÄDDNINGSBYGG — korrekt, sann detektion av omstarter +17)",
    bevis:
      "kraschvakt.log rad 127 '22:24:22.491Z KRASCHLOOP-MISSTANKE: svarar=false status=online omstarter +17 ⇒ RÄDDNINGSBYGG' + o125 §3 (kraschvaktens strukturkontrakt, svit 53/53) + o131 §3 (kaskadkrönikan)",
  },
  {
    dom: "transient-design",
    rotorsaka: ROT_KRASCHVAKT + " ; detta fynd = räddningsbygg-raden 22:28:07 (flock-väntan under främmande lås + artefakt okänd + pm2 lämnas STOPPAD + kooldown 30)",
    bevis:
      "kraschvakt.log rad 128 '22:28:07.046Z RÄDDNINGSBYGG MISSLYCKADES: … flock -w 1200 … pm2 lämnas STOPPAD … kooldown 30 ⇒ nästa poll bygger klart' + o125 §3 + o130 §3 (främmande bygg 22:25–22:31Z under deploy-låset)",
  },
];
const AGENTYTE_DOM = (loggrad, deployrad) => ({
  dom: "transient-design",
  rotorsaka: `${ROT_AGENTYTE} (rad ${loggrad})`,
  bevis: `prod-synk.log 2026-09-20: ${deployrad} 'DEPLOYAD automatiskt — prod 200' + ${loggrad} 'AGENTARBETSYTA-SYNK MISSLYCKADES (ocommittade ändringar i ytan skyddas (1 rader) — synk väntar på commit)'`,
});

// ── verkställ: endast öppna nycklar, precis-dom vid krock ────────────────────
const skrivna = [];
let krockIndex = new Map();
function domFor(f) {
  const r = regler[f.ts];
  if (r) return r;
  if (f.ts === "2026-09-20T20:13:11.757Z") {
    const i = krockIndex.get(f.ts) ?? 0;
    krockIndex.set(f.ts, i + 1);
    return AGENTYTE_DOM(f.bevis.includes("20:02:51") ? "20:02:51" : "20:11:35", f.bevis.includes("20:02:51") ? "20:02:37" : "20:11:25");
  }
  if (f.ts === "2026-09-20T22:28:38.503Z") {
    return String(f.bevis).includes("KRASCHLOOP") ? KRASCHVAKT_DOM[0] : KRASCHVAKT_DOM[1];
  }
  if (f["spår"] === "F3-api" && f.ts.startsWith("2026-09-20T22:28:38.4")) return regler.F3_EFTERDYNING;
  return null;
}

for (const f of fynd) {
  const k = nyckel(f);
  if (domda.has(k)) continue;
  const regel = domFor(f);
  if (!regel) continue;
  const b = {
    ts: f.ts,
    ["spår"]: f["spår"] ?? f.spar,
    allvar: f.allvar,
    fynd: f.fynd,
    dom: regel.dom,
    rotorsaka: regel.rotorsaka,
    bevis: regel.bevis,
    protokoll: PROTOKOLL,
    domdAv: DOMD_AV,
    domdTs: DOMD_TS,
  };
  if (krock.has(k)) b.bevisHash = hash(f); // o69: precis dom ENDAST i kollisionsgrupp
  fs.appendFileSync(BEDOMNINGAR, JSON.stringify(b) + "\n");
  skrivna.push({ ts: f.ts, dom: b.dom, hash: b.bevisHash ?? null });
}

const summa = {};
for (const s of skrivna) summa[s.dom] = (summa[s.dom] ?? 0) + 1;
console.log(`SKRIVNA=${skrivna.length} ${JSON.stringify(summa)}`);
console.log(`PRECIS-DOMER (bevisHash)=${skrivna.filter((s) => s.hash).length}`);
for (const s of skrivna.filter((s) => s.hash)) console.log(`  precis: ${s.ts} #${s.hash} ${s.dom}`);
