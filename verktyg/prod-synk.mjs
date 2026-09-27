#!/usr/bin/env node
/**
 * PROD-SYNKEN (våg 122) — kundens direktiv: "allt nytt som byggs här [i
 * Z Code] skall per automatik byggas där i studio"
 * =====================================================================
 * Pollar GitHub origin/develop var 10:e minut (via pumpor-daemonen) och
 * deployar NYA commits AUTOMATISKT till produktion — med hela
 * stoppregelverket (ALDRIG lämna prod trasig):
 *
 *   1. git fetch origin develop — inget nytt ⇒ tyst exit (99 % av runsen)
 *   2. RAM-VAKT (10X-incidenten 2026-09-14): < 2200 MB tillgängligt ⇒
 *      vänta till nästa poll — HEAD lämnas ORÖTT (bygget OOM-dödas ändå
 *      när fabrikens zcode-barn + pm2 delar minnet)
 *   3. rent träd (checkout + clean data/cache — ALDRIG röra data/vakten)
 *   4. merge origin/develop — konflikt ⇒ AVBRYT + larm (prod orörd)
 *   5. sparar känd-good-HEAD; bygger under flock-låset (npm ci + build)
 *   6. OOM-dödat bygge ("Killed"/heap i loggen) = INFRAskal, inte kodfel
 *      ⇒ logga + vänta till nästa poll (HEAD orörd) — ALDRIG revert/reset
 *      av duglig kod. Äkta kodfel följer fortfarande stoppregeln:
 *      fail ⇒ revert + ombygge ⇒ fortfarande fail ⇒ återställ good-HEAD
 *      + ombygge; misslyckas ÄVEN det ⇒ KRITISKT-larm, pm2 orörd
 *   7. ARTEFAKTGRIND (2026-09-16, prodincident 10:02+12:02 /
 *      SYSTEMKARTAN E34): .next/server/app/*.html:s /_next/static-
 *      referenser MÅSTE finnas på disk FÖRE restart — ett RAM-svält
 *      bygg kan skriva BUILD_ID + färsk HTML som pekar på aldrig
 *      emitterade chunks (HTML 200 lurar HTTPS-kontrollen, kunden ser
 *      ostylat). Transig/okänd ⇒ EJ restart, EJ DEPLOYAD-markör ⇒
 *      ombygge nästa poll (RAM-vakten gäller).
 *   8. pm2 restart ak1a + HTTPS-kontroll (4 försök) + version-stämpel
 *
 *   NEXT-LÄKEBACKUP (o97, s8-u1 2026-09-19): next build skriver progressivt
 *   direkt i prod-trädets .next — vid fallit/OOM-dödat bygg lämnas katalogen
 *   halvskriven medan pm2 fortsätter servera den från disk (bevisat
 *   2026-09-19: 06:58+07:01-fallna byggen ⇒ /kurser /portfolj* /rapporter
 *   500 i ~14 min tills 07:07-pollens lyckade ombygge; nytt fönster efter
 *   19:11-OOM:en — s9-u3:s rot-fråga "misslyckade byggen SKRIVER i .next").
 *   Kuren: FÖRE byggstart säkras senast GRÖNA .next i .next-laeke (allt utom
 *   den regenererbara ISR-cachen); i varje fallit utfall (oom · riktigt-fel ·
 *   fallna ombyggen · artefakt-stopp) återställs .next ur backupen ⇒ pm2
 *   serverar genast det gröna läget i stället för att blöda 500 till nästa
 *   lyckade poll. Fail-open: varje backup-fel loggas och lämnar beteendet
 *   som före kuren — deploy-kedjan får ALDRIG dö av läkevägen.
 *
 * BEVISAT behov 2026-09-14 (10X-omgången): p4-p9-leveranscommitters
 * byggdes under minnestaket (7 zcode-barn + pm2 + npm ci ≈ 8 GB) →
 * "Killed" → den gamla kedjan revert → reset --hard goodHead raderade
 * DUGLIGA commits och fabrikens barn gjorde om arbetet i cirklar
 * (reflog 16:53/17:10/17:19 — p8:s 9d0213b1 och p9:s be86fcca togs
 * minuter efter landning; p7/p8 räddades av att barnen dog och RAM
 * frigjordes, deploy 15:29:59 UTC).
 *
 * Version-meddelandet (kundens "berätta att vi har en ny version — tyst,
 * utan att påverka produktionen"): appenderar rad till
 * data/vakten/versionsloggen.jsonl som studions Organismen-panel visar.
 *
 * Logg: data/vakten/prod-synk.log · Körs: pumpor-daemonen var 10:e min.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { skrivAudit } from "./audit-logg.mjs";
import { verifieraArtefakt } from "./artefakt-verifiering.mjs";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const LOGG = path.join(VAKT, "prod-synk.log");
const MIN_RAM_MB = 2200;
// V235 (BYGG×FABRIK-SEKVENSERING): aktiva fabriksmanifest skjuter upp
// byggstarten — men ALDRIG i evighet (kedjande manifest skulle svälta
// deployer i timmar). 30 min = 3 poller; därefter kör bygget med
// ps-vaktens reserv (850 MB/zcode-barn) som fönsterskydd.
const FABRIKS_VANTE_MAX_MIN = 30;
// ROND 152: svältstopps-TVUNGET bygg (tak passerat med aktiv fabrik) kräver
// även detta fria minne — ps-reserven ensam bevisad otillräcklig (se 2b).
const TVINGAT_BYGG_MIN_MB = 5000;

function logga(rad) {
  fs.mkdirSync(VAKT, { recursive: true });
  // S8-U1 (o32 §6 kö 2, rotorsaka): Z MÅSTE med — `slice(0,19)` lämnade en
  // UTC-rad utan tidszon ⇒ Date.parse tolkade den som LOKAL tid (2 h fel i
  // CEST). Två bevisade offer: s7-u2:s vakare (deployen 16:40:33Z osynlig)
  // + s8-u4:s "tystnad sedan 10:27"-felläsning. Prefixet är oförändrat,
  // datumregex `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}` matchar som förut.
  fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)}Z ${rad}\n`);
  console.log(rad);
}

function git(args, alternativ = {}) {
  return execFileSync("git", args, {
    cwd: ROT,
    encoding: "utf8",
    timeout: 120_000,
    ...alternativ,
  }).trim();
}

/** Tillgängligt RAM i MB (MemAvailable ur /proc/meminfo) — null vid fel. */
function ramTillgangligtMB() {
  try {
    const meminfo = fs.readFileSync("/proc/meminfo", "utf8");
    const m = meminfo.match(/^MemAvailable:\s+(\d+) kB/m);
    return m ? Math.round(Number(m[1]) / 1024) : null;
  } catch {
    return null;
  }
}

// VACCIN 3 (DRIFTSBOKEN 2026-09-17 17:42–17:47Z, o53 §4): MemAvailable
// mäter NU — byggtröskeln måste också räkna med PÅGÅENDE tunga processers
// VÄXT under byggets ~3 minuter. 17:42-OOM:ens formel var byggheap +
// gränssnittsvaktens chrome-cron (~1 GB, 6-timmarscykeln kan landa mitt i
// byggfönstret) + fabrikens zcode-barn. Deras NU-varande RSS är redan
// borta ur MemAvailable — reserven täcker det de KAN komma att äta.
// V235 (rond 130:s OOM-serie: 4 byggdöda 02:52–03:20Z med 3 levande
// fabrikens barn ~1,1 GB styck): 300 MB/barn var kraftigt underskattad —
// dokumenterad verklig kostnad ~0,8 GB/styck (zcode-cli ~400–470 MB +
// node-repl-mcp ~390 MB, våg 146-mätningen). 850 MB = barnens påvisade
// topp i nattens dödsrapporter.
const RAM_RESERV_MB = { chrome: 1024, zcodeBarn: 850 };

/** Klassificera `ps -eo args=`-rader → tunga processklasser (vaccin 3).
 * Smalhetsregeln (o55 F2-läxan — breda mönster deckar varje mätning medan
 * fabriken lever): chrome-klassen matchar ENDAST första token (processens
 * körbara fil) — pm2:s "next start", "npm ci"-prompterrader och
 * "grep chrome" kan aldrig träffa; zcode-klassen kräver ".zcode"-sökväg
 * i args, som bara zcode-cli/node-repl-mcp-barn bär (repots egna verktyg
 * ligger under /home/ak1a/AK1/verktyg/…). */
export function raknaTungaProcesser(argsRader) {
  const klasser = { chrome: 0, zcodeBarn: 0 };
  for (const rad of Array.isArray(argsRader) ? argsRader : []) {
    const text = String(rad);
    const bas = (text.trim().split(/\s+/)[0] ?? "").split("/").pop() ?? "";
    if (/^(chrome|chromium|headless_shell|chrome_headless)$/i.test(bas)) klasser.chrome++;
    else if (text.includes(".zcode")) klasser.zcodeBarn++;
  }
  return klasser;
}

/**
 * V235 (BYGG×FABRIK-SEKVENSERING, rond 130:s systemfynd): räkna AKTIVA
 * fabriksmanifest ur statuskatalogen. Kontrakt:
 *   · status "klar" = manififest slutkörd ⇒ blockerar ALDRIG
 *   · varje annan tolkbar status ("pågår", "vantar-ram", framtida okända)
 *     räknas KONSERVATIVT som aktiv — vantar-ram betyder fabrik lever och
 *     kan föda barn vid nästa rop; ett okänt tillstånd får aldrig missas
 *   · ogiltig JSON-fil ignoreras (fail-open — fabriken äger sina filer)
 *   · saknad katalog = fabriken vilar (0 aktiva)
 * Testas av verktyg/testa-prod-synk-ramvakt.mjs (V235-blocket).
 */
export function lasAktivaFabriksManifest(statusKatalog) {
  const ute = { aktiva: 0, ids: [] };
  let filer;
  try {
    filer = fs.readdirSync(statusKatalog);
  } catch {
    return ute; // katalog saknas = fabriken vilar
  }
  for (const fil of filer) {
    if (!fil.endsWith(".json")) continue;
    try {
      const j = JSON.parse(fs.readFileSync(path.join(statusKatalog, fil), "utf8"));
      if (typeof j === "object" && j !== null && j.status === "klar") continue;
      ute.aktiva++;
      ute.ids.push(typeof j?.id === "string" ? j.id : fil);
    } catch { /* ogiltig fil — fabriken äter sitt eget fel */ }
  }
  return ute;
}

/** Byggutrymmes-bedömning (vaccin 3): basbehovet = byggheap (MIN_RAM_MB,
 * 10X-incidentens empiri) + tillväxtreserv per levande tung klass. Testas
 * av verktyg/testa-prod-synk-ramvakt.mjs. ramMB null/undefined = omätbart
 * ⇒ ok (fail-open, oförändrat sedan våg 10X: ett målfel får aldrig vårda
 * deployer i all evighet). */
export function bedomByggUtrymme({ ramMB, tunga = {} }) {
  const chrome = (tunga.chrome ?? 0) > 0 ? 1 : 0; // klassreserv oavsett antal delprocesser (chrome forkar renderers)
  const zcodeBarn = Math.min(tunga.zcodeBarn ?? 0, 4); // cap 4: en 12-barnssvärm är vårddat av basen långt före cap:et
  const reservMB = chrome * RAM_RESERV_MB.chrome + zcodeBarn * RAM_RESERV_MB.zcodeBarn;
  const behovMB = MIN_RAM_MB + reservMB;
  const detaljer = [
    chrome ? `chrome-cron levande (+${RAM_RESERV_MB.chrome})` : null,
    zcodeBarn ? `${zcodeBarn} zcode-barn (+${zcodeBarn * RAM_RESERV_MB.zcodeBarn})` : null,
  ].filter(Boolean);
  return {
    ok: ramMB === null || ramMB === undefined ? true : ramMB >= behovMB,
    behovMB,
    reservMB,
    detalj: detaljer.join(" + ") || "inga tunga klasser",
    meddelande: reservMB > 0 ? "tung cron/fabrik lever — reserv för deras tillväxt under bygget (17:42-OOM:ens formel)" : "byggheap-basen",
  };
}

/** Läs en loggfil till sträng — "" vid saknad/oläsbar (o49: bedömningen
 *  skiljer "filen tom" från "filen saknas" i SIGNATURFALLET att flock
 *  aldrig släppte in barnet; saknad fil = samma sak här — barnet äger skapandet). */
function slasLogg(filvag) {
  try {
    return fs.readFileSync(filvag, "utf8");
  } catch {
    return "";
  }
}

/**
 * Bedöm ett misslyckat bygg ur dess loggtexter (o49): TRE möjliga typer —
 * · "startade-aldrig": flock -w 900 fick ALDRIG deploylåset ⇒ barnet dog
 *   FÖRE inre bash ⇒ ingen av loggfilerna skrevs (deploy-konkurrens,
 *   inte kod- eller patch-fel — samma vänta-och-försök-igen som OOM)
 * · "oom": OOM-spår i byggloggen ("Killed", JS-heap) = infraskal
 * · "riktigt-fel": allt annat kräver revert-väg eller diagnos.
 * Rotorsake (2026-09-17 11:29+11:39): två patch-byggfegl utan spår i
 * /tmp — loggarna hade redan skrivits över av senare lyckade byggen,
 * orsaken blev obestämbar och loop-skyddet stängde RCE-patchen på
 * tre kvitton VARAV ETT SPURIOUS (se o49).
 */
export function bedomByggMisslyckande(npmciText, byggText) {
  const npmci = typeof npmciText === "string" ? npmciText : "";
  const bygg = typeof byggText === "string" ? byggText : "";
  if (npmci.trim() === "" && bygg.trim() === "") return "startade-aldrig";
  if (/Killed|SIGKILL|heap out of memory|CBKilled/i.test(bygg)) return "oom";
  return "riktigt-fel";
}

/**
 * Blind-revert-vakten (o72): avgör om en commits filer överhuvudtaget kan
 * påverka `next build`. BEVIS 72682834: felgrenens `git revert HEAD` rullade
 * 3 minuter efter commit tillbaka o47:s tmp-migrering 3c78e03f — en ren
 * verktyg/+data/-commit som ALDRIG kan orsaka ett Next-byggfel (byggfelet
 * var race/infra) — och öppnade o44-köpostet igen. KUR: revertera ENDAST när
 * HEAD själv berör byggytan; annars är HEAD oskyldig INNAN bevis och ska
 * ombyggas orörd (det fallna bygget har redan rivit .next).
 *
 * Konservativ åt revertern-hållet: opreciserade filer (t.ex. "src" utan
 * slash, katalogbyte "app/...") räknas som byggyta via prefixet utan
 * snedstreck; null/undefined (obestämbar) ⇒ true = gammalt beteende kvarstår.
 */
const BYGGYTA_PREFIX = [
  "src", "public", "app", "styles",
  "package.json", "package-lock.json",
  "next.config.", "next-env.d.ts",
  "tsconfig.", "tailwind.", "postcss.", "middleware.",
];
export function headRorByggyta(filer) {
  if (!Array.isArray(filer)) return true;
  return filer.some((f) => {
    if (typeof f !== "string" || f.trim() === "") return false;
    const namn = f.trim();
    return BYGGYTA_PREFIX.some((p) => namn === p || namn.startsWith(p.endsWith(".") ? p : p + "/"));
  });
}

/**
 * O79 (o72:s köpost "goodHead-fallbackens destruktivitet"): avgör om
 * felgrenens sista utväg — `git reset --hard goodHead` — ska AVSTÅS.
 * Fallet: HEAD rör enbart icke-byggyta (o72-vakten avstod redan revert)
 * OCH hela kedjan goodHead..HEAD rör enbart icke-byggyta. Då skiljer sig
 * goodHead och HEAD ÅTENBARAST i data/verktyg/docs — goodHead-bygget möter
 * exakt samma kod och faller av samma skäl (infra) — reset vore bevisat
 * lönlös OCH destruktiv (oskyldiga leveranser kastas ur trädet,
 * 10X-klassen). Kedjan smutsig (äldre byggyta-commit bakom en oskyldig
 * HEAD) ⇒ reset behålls: den läker prod till bevisat deploybar kod.
 */
export function bordeAvstaGoodHeadReset({ rorByggyta, kedjaRorByggyta }) {
  return rorByggyta === false && kedjaRorByggyta === false;
}

/**
 * Bevara bygg-loggar före de skrivs över (o49 Kur B): kopiera källfilerna
 * in i en målmapp med tidsstämpel-prefix. Returnerar de sparade namnen
 * (tom lista = inget gick att bevara — kallas ALDRIG kritiskt).
 *
 * o73: filnamnet bär monoton sekvens efter tidsstämpeln — millisekunden är
 * INTE en unik nyckel (mikro-repro 2026-09-18: 171/200 anropspar inom samma
 * ms skrev över varandras diagnoser; svitens idempotenstest föll intermit-
 * tent av samma rot). Sekvensen är per-process: omstart landar ny stampel.
 */
let bevarSekvens = 0;
export function bevaraByggLoggar(mapp, kallor) {
  try {
    fs.mkdirSync(mapp, { recursive: true });
    const stampel = new Date().toISOString().replace(/[:.]/g, "-");
    const sekvens = String(++bevarSekvens).padStart(3, "0");
    const sparade = [];
    for (const [kalla, namn] of kallor) {
      try {
        fs.copyFileSync(kalla, path.join(mapp, `${stampel}-${sekvens}-${namn}`));
        sparade.push(namn);
      } catch { /* källan borta — inget att bevara */ }
    }
    return sparade;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// VAKTRAPPORTS-GRINDEN (VÅG 212 — E35 gap 3:s SISTA HALVA; SYSTEMKARTAN
// 2026-09-16: "vaktrapports-stoppet (RÖD kvalitetsrapport ⇒ deploy-stopp)
// saknas fortfarande" — .next-skadan 09-16 nådde prod utan att någon grind
// stoppade vägen). Kontrakt:
//   · data/rapporter/kvalitetsrapport-SENASTE.md skrivs 07:02 av pumporna I
//     PROD-TRÄDET (gitignore:ad rad 76 ⇒ `git checkout -- .` rör den ALDRIG —
//     rapporten överlever deploy-städningen)
//   · STATUS RÖD (>9 fel eller ogiltig JSON i trädet) ⇒ deploy STOPPAS FÖRE
//     byggstart: HEAD orörd, DEPLOYAD-markör orörd, .next orörd (bygget river
//     .next — att inte bygga alls är den skonsammaste stoppen), audit-larm
//   · DEADLOCK-SKYDD: stoppet triggar OMMÄTNING (detached kvalitetsvakt under
//     lås) — rapporten mätte trädet vid 07:02 och de nya committerna kan bära
//     själva fixen; nästa poll (10 min) läser FÄRSK rapport mot Nya trädet.
//     Forfarande RÖD ⇒ stopp igen (ärligt: trasigt träd deployas inte)
//   · GUL ⇒ deploy fortsätter (loggas)
//   · saknas/otolkbar/gammal (>48 h) ⇒ deploy fortsätter med VARNING
//     (fail-open — vaktpumpornas död ägs av pulsvakten/ronder och får ALDRIG
//     frysa prod-koden i evighet; varningen syns i loggen + audit)
// Kontraktstest: verktyg/testa-prod-synk-vaktrapport.mjs
// ---------------------------------------------------------------------------
const VAKTRAPPORT_FIL = path.join("data", "rapporter", "kvalitetsrapport-SENASTE.md");
const VAKTRAPPORT_MAX_ALDER_H = 48;
const VAKT_OMMATNING_LOCK = path.join(VAKT, ".vakt-ommatning.lock");
const VAKT_OMMATNING_STAL_MIN = 15; // vakten tar ≤ ~10 min; kvarlämnat lås städas

/** Tolka kvalitetsrapporten — {saknas}|{fel}|{status, felAntal, manuella, alderTimmar}. */
export function lasVaktrapportStatus(filvag, nuMs = Date.now()) {
  let text;
  let stat;
  try {
    text = fs.readFileSync(filvag, "utf8");
    stat = fs.statSync(filvag);
  } catch (e) {
    if (e && e.code === "ENOENT") return { saknas: true };
    return { fel: "oläsbar: " + String(e && e.message ? e.message : e).slice(0, 80) };
  }
  // sista ANTAL FEL-raden är aktuell status (rapporten är överskrivande, men
  // tolerera framtida append — samma "sista träffen"-regel som motorsektionen)
  const rader = text.split("\n").filter((r) => /^## ANTAL FEL:/.test(r));
  const m = rader[rader.length - 1]?.match(/^## ANTAL FEL:\s*(\d+)\s*\|\s*MANUELLA:\s*(\d+)\s*\|\s*STATUS:\s*(RÖD|GUL|GRÖN)\s*$/);
  if (!m) return { fel: "ingen tolkbar ANTAL FEL/STATUS-rad" };
  return {
    status: m[3],
    felAntal: Number(m[1]),
    manuella: Number(m[2]),
    // Math.max: en rapport skriven millisekunden EFTER nuMs (klockrapportens
    // realtid) får aldrig bli -1 h — färsk rapport är 0 h
    alderTimmar: Math.max(0, Math.floor((nuMs - stat.mtimeMs) / 3_600_000)),
  };
}

/** Grinddom: {stopp, niva: stopp|varning|info, meddelande} — se kontraktet ovan. */
export function bedomVaktrapportStopp(rapport) {
  if (!rapport || typeof rapport !== "object") return { stopp: false, niva: "varning", meddelande: "vaktrapporten obestämbär — deploy fortsätter (fail-open), vakt-läget OMÄTT" };
  if (rapport.saknas) return { stopp: false, niva: "varning", meddelande: "kvalitetsrapporten SAKNAS — deploy fortsätter (fail-open); vaktpumporna mäter inte (pulsvaktens ägo)" };
  if (rapport.fel) return { stopp: false, niva: "varning", meddelande: `kvalitetsrapporten otolkbar (${rapport.fel}) — deploy fortsätter (fail-open), vakt-läget OMÄTT` };
  if (rapport.alderTimmar > VAKTRAPPORT_MAX_ALDER_H) {
    return { stopp: false, niva: "varning", meddelande: `kvalitetsrapporten ${rapport.alderTimmar} h gammal (> ${VAKTRAPPORT_MAX_ALDER_H} h) — deploy fortsätter; vaktpumpornas död ägs av pulsvakten, aldrig av deploy-grinden` };
  }
  if (rapport.status === "RÖD") {
    return {
      stopp: true,
      niva: "stopp",
      meddelande: `kvalitetsrapporten RÖD (${rapport.felAntal} fel, ${rapport.manuella} manuella, ${rapport.alderTimmar} h gammal) — deploy STOPPAD före byggstart (E35 gap 3 sista halvan); ommätning triggad, nytt försök nästa poll`,
    };
  }
  if (rapport.status === "GUL") {
    return { stopp: false, niva: "varning", meddelande: `kvalitetsrapporten GUL (${rapport.felAntal} fel) — deploy fortsätter (GUL stoppar aldrig)` };
  }
  return { stopp: false, niva: "info", meddelande: `kvalitetsrapporten GRÖN (${rapport.alderTimmar} h gammal)` };
}

/** Deadlock-skyddet: trigga färsk vaktkörning (detached, låst — aldrig stackad). */
function triggaVaktOmmatning() {
  try {
    try {
      fs.mkdirSync(VAKT_OMMATNING_LOCK, { recursive: false });
      const s = fs.statSync(VAKT_OMMATNING_LOCK);
      if (Date.now() - s.mtimeMs > VAKT_OMMATNING_STAL_MIN * 60_000) {
        fs.rmSync(VAKT_OMMATNING_LOCK, { recursive: true, force: true });
        fs.mkdirSync(VAKT_OMMATNING_LOCK, { recursive: false });
      } else {
        logga("VAKT-OMMÄTNING: pågår redan (låset lever) — ingen ny triggas");
        return;
      }
    } catch (e) {
      if (e && e.code === "EEXIST") {
        // låset togs just av en samtidig poll — samma väg som ovan
        const s = fs.statSync(VAKT_OMMATNING_LOCK);
        if (Date.now() - s.mtimeMs <= VAKT_OMMATNING_STAL_MIN * 60_000) {
          logga("VAKT-OMMÄTNING: pågår redan — ingen ny triggas");
          return;
        }
        fs.rmSync(VAKT_OMMATNING_LOCK, { recursive: true, force: true });
        fs.mkdirSync(VAKT_OMMATNING_LOCK, { recursive: false });
      } else {
        throw e;
      }
    }
    const loggFil = path.join(VAKT, "vakt-ommatning.log");
    const fd = fs.openSync(loggFil, "a");
    const barn = spawn(process.execPath, ["verktyg/kvalitetsvakt.mjs"], {
      cwd: ROT,
      detached: true,
      stdio: ["ignore", fd, fd],
    });
    barn.on("exit", () => {
      try { fs.rmSync(VAKT_OMMATNING_LOCK, { recursive: true, force: true }); } catch { /* städas som övergivet */ }
    });
    barn.unref();
    logga(`VAKT-OMMÄTNING triggad (pid ${barn.pid}) — färsk rapport mot aktuellt träd; nästa poll läser den`);
  } catch (e) {
    logga("VAKT-OMMÄTNING: kunde inte triggas (" + String(e && e.message ? e.message : e).slice(0, 80) + ") — vakten mäter vid 07:02 oavsett");
  }
}

/**
 * O97 (s9-u3:s rot-fråga "misslyckade byggen SKRIVER i .next"): säkra
 * senast GRÖNA .next i en läkekatalog FÖRE byggstart. Kontrakt:
 *   · LAEKE finns redan ⇒ "finns-sedan" och orörd — den speglar senast
 *     gröna läget och får ALDRIG skrivas över av ett ev. halvskrivet
 *     .next (fallet: föregående fönster föll, nästa poll backar inte skräp)
 *   · grönhets-guard: BUILD_ID + build-manifest.json + prerender-manifest.json
 *     måste finnas — next build tömmer .next FÖRST och skriver manifesten mot
 *     slutet (bevisat 2026-09-17 11:39: .next/BUILD_ID borta i fallit läge);
 *     ett halvskrivet träd backas ALDRIG ("icke-gron")
 *   · `cache`-katalogen (~1 GB ISR-cache) exkluderas — regenererbar vid
 *     första träffen; kopian blir billigare och race-ytan mot pm2:s
 *     live-ISR-skrivare mindre
 *   · allt fel ⇒ "fel: …" (fail-open — deploy-kedjan får aldrig dö här)
 * Testas av verktyg/testa-prod-synk-nextlaeke.mjs.
 */
export function skapaNextLaekebackup({ nextKatalog, laekeKatalog }) {
  try {
    if (fs.existsSync(laekeKatalog)) {
      // katalog-guard: en FIL på laeke-sökvägen är ett trasigt tillstånd,
      // inte "finns-sedan" (cpSync hade tyst accepterat den som källa)
      return fs.statSync(laekeKatalog).isDirectory() ? "finns-sedan" : "fel: läkekatalogen är ingen katalog";
    }
    if (!fs.existsSync(nextKatalog)) return "saknas-next";
    const gron =
      fs.existsSync(path.join(nextKatalog, "BUILD_ID")) &&
      fs.existsSync(path.join(nextKatalog, "build-manifest.json")) &&
      fs.existsSync(path.join(nextKatalog, "prerender-manifest.json"));
    if (!gron) return "icke-gron";
    fs.mkdirSync(laekeKatalog, { recursive: true });
    for (const post of fs.readdirSync(nextKatalog)) {
      if (post === "cache") continue;
      fs.cpSync(path.join(nextKatalog, post), path.join(laekeKatalog, post), { recursive: true, force: true });
    }
    return "skapad";
  } catch (e) {
    return "fel: " + String(e && e.message ? e.message : e).slice(0, 120);
  }
}

/**
 * O97: återställ .next ur läkebackupen efter ett fallit bygg — pm2 serverar
 * filerna från disk per request, så det återställda gröna läget slutar blöda
 * 500/ostylat OMEDELBART (i stället för vid nästa lyckade poll, bevisat
 * ~10-15 min senare). Ingen backup ⇒ "ingen-backup" (ärligt, första fönstret
 * efter deploy av denna kur). Fail-open som ovan.
 */
export function aterstallNextUrLaeke({ nextKatalog, laekeKatalog }) {
  try {
    if (!fs.existsSync(laekeKatalog)) return "ingen-backup";
    // katalog-guard: cpSync hade TYST kopierat en FIL på laeke-sökvägen och
    // returnerat "aterstallt" med .next som fil — ett sådant tillstånd är
    // ingen backup utan ett fel som ska loggas (fail-open, aldrig kast)
    if (!fs.statSync(laekeKatalog).isDirectory()) return "fel: läkebackupen är ingen katalog";
    fs.rmSync(nextKatalog, { recursive: true, force: true });
    fs.cpSync(laekeKatalog, nextKatalog, { recursive: true, force: true });
    return "aterstallt";
  } catch (e) {
    return "fel: " + String(e && e.message ? e.message : e).slice(0, 120);
  }
}

async function httpsOk() {
  for (let i = 1; i <= 4; i++) {
    try {
      const r = await fetch("https://lab.ak1nvestor.com/", {
        headers: { "User-Agent": "ak1a-prod-synk" },
        signal: AbortSignal.timeout(20_000),
      });
      const t = await r.text();
      if (r.status === 200 && t.includes("AK1A")) return true;
    } catch { /* försök igen */ }
    await new Promise((s) => setTimeout(s, 8000));
  }
  return false;
}

// ---------------------------------------------------------------------------
// AGENTARBETSYTA-SYNKENS FÖRSVAR (o43; påbörjad s8-u1/o33 2026-09-16,
// clobber-strandad, färdigställd 2026-09-17): worklog.md är en append-ledger
// där alla parter appendar i filslut ⇒ varje merge i agentklonen kolliderar i
// exakt samma radregion. Naiva "pull --ff-only + larm" lämnade klassen olöst
// i dygn (rond 50:s döda merge 2026-09-15, 30-larms-natten, recidiv
// 00:10–02:20 2026-09-17 trots o40:s klon-läkning — rond-agenter som
// committar lokalt återskapar divergensen). Självläkning med VÄGRANS-gränser:
//   · död merge (MERGE_HEAD kvar) med konflikt ENDAST i union-klassen
//     (worklog.md + .gitattributes) ⇒ union-lös (vår sida före deras) +
//     avrunda merge — ytan levande igen
//   · konflikt i FRÄMMANDE fil ⇒ VÄGRAS — kastar med filnamnet, ytan orörd
//   · divergens utan dött läge ⇒ merge-vägen (attributet fogar worklog)
//   · ocommittade ändringar ⇒ VÄGRAS (skyddar pågående arbete)
// Kontrakt: verktyg/testa-prod-synk-arbetsytasynk.mjs (34/34).
// ---------------------------------------------------------------------------
const ARBETSYTA_UNION_KLASS = new Set(["worklog.md", ".gitattributes"]);

/** Union-lös git-konfliktmarkörer: vår sida före deras, bas (diff3) ägs ingen.
 *  Returnerar { text, block } — kastar på oavslutat/kapslat block (ALDRIG
 *  tyst halvlösning). */
export function unionLosMarkorer(text) {
  const rader = String(text).split("\n");
  const ut = [];
  let varSida = [];
  let derasSida = [];
  let lage = "normal"; // normal | var | bas | deras
  let block = 0;
  for (const rad of rader) {
    if (/^<{7}( |$)/.test(rad)) {
      if (lage !== "normal") throw new Error("kapslade konfliktblock stöds ej");
      lage = "var";
      block += 1;
      continue;
    }
    if (lage === "var" && /^\|{7}/.test(rad)) {
      lage = "bas";
      continue;
    }
    if ((lage === "var" || lage === "bas") && /^={7}$/.test(rad)) {
      lage = "deras";
      continue;
    }
    if (lage === "deras" && /^>{7}( |$)/.test(rad)) {
      ut.push(...varSida, ...derasSida);
      varSida = [];
      derasSida = [];
      lage = "normal";
      continue;
    }
    if (lage === "normal") ut.push(rad);
    else if (lage === "var") varSida.push(rad);
    else if (lage === "deras") derasSida.push(rad);
    // lage === "bas": diff3-basrader ägs ingen sida — bort
  }
  if (lage !== "normal") throw new Error("oavslutat konfliktblock — vägrar tyst halvlösning");
  return { text: ut.join("\n"), block };
}

/** .gitattributes-innehåll med union-raden säkrad — null om redan närvarande
 *  (idempotent). Kommentarraden bär provenans. */
export function sakraUnionAttributInnehall(innehall) {
  const nuvarande = String(innehall ?? "");
  if (/^worklog\.md merge=union$/m.test(nuvarande)) return null;
  const bas = nuvarande.trim() === "" ? "" : nuvarande.endsWith("\n") ? nuvarande : nuvarande + "\n";
  return `${bas}# s8-u1/o33 — worklog.md är append-ledger: union-fogning i stället för döende merge-konflikt\nworklog.md merge=union\n`;
}

/** Git-fel → enradig rotorsak (stderr före message; whitespace kollapsat).
 *  Kurar "smutsigt träd?"-gissningen från o40 §6 (felklassning UU/divergens). */
export function forklaraGitFel(fel) {
  const stderr = fel && typeof fel.stderr === "string" ? fel.stderr : "";
  const kalla = (stderr || (fel && fel.message) || String(fel ?? "")).replace(/\s+/g, " ").trim();
  return kalla ? kalla.slice(0, 160) : "okänt fel";
}

/** Synka agentens arbetsyta (yta) mot prod-trädet (rot) — självläkande för
 *  append-ledgerns merge-klass, VÄGRAR främmande filer + ocommittat arbete.
 *  Returnerar en satt-beskrivning; kastar med rotorsak vid vägran. */
export function synkaArbetsyta(yta, rot) {
  const delar = [];
  const gitYta = (args) =>
    execFileSync("git", ["-C", yta, ...args], {
      timeout: 120_000,
      encoding: "utf8",
      stdio: "pipe",
    }).trim();
  const konfliktFiler = () =>
    gitYta(["diff", "--name-only", "--diff-filter=U"])
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const losUnion = (filer) => {
    let block = 0;
    for (const f of filer) {
      const p = path.join(yta, f);
      const r = unionLosMarkorer(fs.readFileSync(p, "utf8"));
      if (f === ".gitattributes") {
        // attributlistor är additiva — rad-union med dedup
        r.text = [...new Set(r.text.split("\n"))].join("\n");
      }
      fs.writeFileSync(p, r.text);
      block += r.block;
    }
    return block;
  };

  const sakraAttribut = () => {
    const p = path.join(yta, ".gitattributes");
    const nuvarande = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
    const ny = sakraUnionAttributInnehall(nuvarande);
    if (ny === null) return false;
    fs.writeFileSync(p, ny);
    gitYta(["add", ".gitattributes"]);
    return true;
  };

  const dodMerge = fs.existsSync(path.join(yta, ".git", "MERGE_HEAD"));
  if (dodMerge) {
    const filer = konfliktFiler();
    const frammade = filer.filter((f) => !ARBETSYTA_UNION_KLASS.has(f));
    if (frammade.length > 0) {
      throw new Error(
        `död merge med konflikt i främmande fil (${frammade.join(", ")}) — auto-lösning vägras, ytan lämnas orörd`,
      );
    }
    const block = losUnion(filer);
    sakraAttribut();
    if (filer.length > 0) gitYta(["add", ...filer]);
    gitYta(["commit", "-q", "--no-edit", "-m", "synk: död merge union-löst (append-ledger) — arbetsytans självläkning"]);
    delar.push(`död merge union-löst (${block} block)`);
  } else {
    // --untracked-files=no: untrackade skrivfiler (rond-agenternas _r*-skrap)
    // blockerar INTE git-synken och ska aldrig bli falsklarm — endast
    // ändringar i FÖLJDA filer skyddas (bevisad live-klass 2026-09-17:
    // ytan bar ?? _r53/_r54-filer vid grön synk).
    const smutsig = gitYta(["status", "--porcelain", "--untracked-files=no"]);
    if (smutsig.trim()) {
      throw new Error(
        `ocommittade ändringar i ytan skyddas (${smutsig.trim().split("\n").length} rader) — synk väntar på commit`,
      );
    }
    if (sakraAttribut()) {
      gitYta(["commit", "-q", "-m", "synk: worklog.md merge=union säkrat (append-ledger)"]);
    }
  }

  gitYta(["fetch", "-q", rot, "develop"]);
  try {
    const ut = gitYta(["merge", "--ff-only", "FETCH_HEAD"]);
    delar.push(/already up to date/i.test(ut) ? "redan ikapp" : "snabbframåt");
  } catch (fel) {
    try {
      gitYta(["merge", "--no-edit", "FETCH_HEAD"]);
      delar.push("merge-vägen (union-skyddad)");
    } catch (mergeFel) {
      const filer = konfliktFiler();
      if (filer.length === 0) {
        try { gitYta(["merge", "--abort"]); } catch { /* redan avbruten */ }
        throw new Error(`merge misslyckades utan konfliktfiler: ${forklaraGitFel(mergeFel)}`);
      }
      const frammade = filer.filter((f) => !ARBETSYTA_UNION_KLASS.has(f));
      if (frammade.length > 0) {
        gitYta(["merge", "--abort"]);
        throw new Error(
          `merge-konflikt i främmande fil (${frammade.join(", ")}) — merge avbröts, ytan lämnas ren`,
        );
      }
      const block = losUnion(filer);
      sakraAttribut();
      if (filer.length > 0) gitYta(["add", ...filer]);
      gitYta(["commit", "-q", "--no-edit", "-m", "synk: merge union-löst (append-ledger)"]);
      delar.push(`merge-vägen — union-löst manuellt (${block} block)`);
    }
  }
  return delar.join(" · ");
}

// ---------------------------------------------------------------------------
// PATCH-KÖN (o46): beroende-patchens rotorsaksruta. Bevisat behov
// 2026-09-15 → 09-17: critical-RCE-advisories i next låg 2 dygn med larm
// (beroende-halsa-SENASTE.md "inkludera patchen i nästa deploy") eftersom
// prod-synkens `npm ci` följer package-lock EXAKT och aldrig uppdaterar
// den — larmet pekar på en manuell `npm install` som ingen äger mekaniken
// för. Kuren: committad köfil (data/infra/patch-ko.json) som ENDAST
// prod-synken tömmer — installationen sker här, under deploylåset, av
// installationens ägare (fabriksbarn förbjuds npm install; regeln orubbad).
// Kontrakt:
//   · endast paket som redan finns i package.json — kön UPPDATERAR deps,
//     tillför ALDRIG nya (leveranskedjeskydd, fail-closed: oläsbar
//     package.json = tomt känt-uppsättning = allt vägras)
//   · exakt version (inga ^~/ranges — determinism i kvittona)
//   · max 10 poster; dedup: senaste raden per paket vinner
//   · kvitto per försök i data/vakten/patch-kvitton.jsonl (runtime,
//     untracked — överlever `git checkout -- .`); ok kvitteras FÖRST
//     efter deploy + HTTPS 200 + lock-commit; 3 misslyckade för exakt
//     (paket, version) = död post tills köfilen ändras (loop-skydd)
//   · patch-fel blockerar ALDRIG kodleverans: misslyckad install ⇒
//     deploy fortsätter på befintlig lock; misslyckat bygge med patchad
//     lock ⇒ locken återställs FÖRE revert-vägen så ombygget sker på
//     bevisat fungerande grund

// Tak 15 sedan o124: filen är KVITTERAD HISTORIK (o106 §5 — synken tömmer
// den aldrig) och växer en omgång per leverans; 10 strax efter omgång 4
// blockerade omgång 5. 15 = 10 historik + hel nästa omgång på ~5 poster.
const PATCH_MAX_POSTER = 15;
const PATCH_MAX_FORSOK = 3;
const RE_PATCH_PAKET = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-._~]+$/;
const RE_PATCH_VERSION = /^\d+\.\d+\.\d+(-[a-z0-9.+-]+)?$/;

/** Tolka EN köpost — {paket, version} vid giltig, {fel} vid ogiltig. */
export function tulkPatchPost(post) {
  if (!post || typeof post !== "object") return { fel: "post är inte ett objekt" };
  const paket = typeof post.paket === "string" ? post.paket.trim() : "";
  const version = typeof post.version === "string" ? post.version.trim() : "";
  if (!paket) return { fel: "paket saknas" };
  if (!RE_PATCH_PAKET.test(paket)) return { fel: `ogiltigt paketnamn: "${paket}"` };
  if (!RE_PATCH_VERSION.test(version)) return { fel: `ogiltig version för ${paket} (exakt semver krävs, inga ranges): "${version}"` };
  return { paket, version };
}

/**
 * Läs+validera köfilen. kandaPaket = Set av beroendenamn ur package.json
 * (dependencies + devDependencies); null/undefined = INGEN filtrering —
 * anroparen i korSynk passerar alltid ett set (fail-closed där det sker).
 */
export function lasPatchKo(filvag, kandaPaket) {
  const ute = { poster: [], fel: [], saknas: false };
  let rader;
  try {
    rader = JSON.parse(fs.readFileSync(filvag, "utf8"));
  } catch (e) {
    if (e && e.code === "ENOENT") {
      ute.saknas = true;
      return ute;
    }
    ute.fel.push("köfilen är ogiltig JSON: " + String(e && e.message ? e.message : e).slice(0, 60));
    return ute;
  }
  if (!Array.isArray(rader)) {
    ute.fel.push("köfilen måste vara en JSON-array av {paket, version}");
    return ute;
  }
  const senaste = new Map();
  for (const r of rader) {
    const t = tulkPatchPost(r);
    if (t.fel) {
      ute.fel.push(t.fel);
      continue;
    }
    if (kandaPaket && !kandaPaket.has(t.paket)) {
      ute.fel.push(`främmande paket (finns ej i package.json): ${t.paket}`);
      continue;
    }
    senaste.set(t.paket, t.version);
  }
  ute.poster = [...senaste].map(([paket, version]) => ({ paket, version }));
  if (ute.poster.length > PATCH_MAX_POSTER) {
    ute.fel.push(`för många poster (${ute.poster.length} > ${PATCH_MAX_POSTER}) — endast de första ${PATCH_MAX_POSTER} används`);
    ute.poster = ute.poster.slice(0, PATCH_MAX_POSTER);
  }
  return ute;
}

/** Läs kvittofilen (jsonl) — oläsbar/saknad = [] (första körningen). */
export function lasPatchKvitton(filvag) {
  try {
    return fs
      .readFileSync(filvag, "utf8")
      .split("\n")
      .filter((rad) => rad.trim())
      .map((rad) => {
        try {
          return JSON.parse(rad);
        } catch {
          return null;
        }
      })
      .filter((k) => k && typeof k === "object");
  } catch {
    return [];
  }
}

/**
 * Aktiva poster = köposter utan ok-kvitto och med färre än
 * PATCH_MAX_FORSOK misslyckade försök för EXAKT (paket, version) —
 * versionbyte i köfilen nollar räkningen (ny patch = nytt liv).
 */
export function aktivPatchPlan(ko, kvitton) {
  return ko.poster.filter((p) => {
    const relevanta = kvitton.filter(
      (k) => k.paket === p.paket && k.version === p.version && typeof k.resultat === "string",
    );
    if (relevanta.some((k) => k.resultat === "ok")) return false;
    return relevanta.filter((k) => k.resultat === "misslyckad").length < PATCH_MAX_FORSOK;
  });
}

/** Appendera kvittorad (runtime-fil) — true vid framgång. */
export function skrivPatchKvitto(filvag, post, resultat, detalj) {
  try {
    fs.mkdirSync(path.dirname(filvag), { recursive: true });
    fs.appendFileSync(
      filvag,
      JSON.stringify({ ts: new Date().toISOString(), paket: post.paket, version: post.version, resultat, detalj }) + "\n",
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * o106 (s8-u1, 2026-09-20): TSC-GRINDEN i patch-flödet. Rotorsakan den
 * stängde (före o108): next.config.ts körde typescript.ignoreBuildErrors =
 * true — next build var BLIND för typfel, så en patch som höjde @types/*
 * eller typescript kunde bryta tsc-baslinjen 0 och deployas GRÖNT ändå.
 * Därefter krävde pre-commit-grinden 0 fel på repets sida medan prod
 * ALDRIG mätte = baslinjens dödsfälla (alla framtida commits blockerade
 * i efterhand). Kuren: installationsbarnet kedjar projektbinärens
 * tsc --noEmit (ALDRIG npx — deployfönstrets cachedummy-fälla) i SAMMA
 * flock-fönster som npm install; typfel ⇒ misslyckat kvitto + lock riven
 * FÖRE byggsteget ⇒ korBygg kör npm ci på god lock (patch-fel blockerar
 * aldrig kodleverans — samma semantik som fallerad install).
 * LÄGE EFTER o108 (vakt-s8, 2026-09-20): ignoreBuildErrors är AV i
 * next.config.ts — byggets egna typögon är sista försvarslinjen och den
 * här patch-grinden är det första ledet i en TRESTEGSKEDJA (pre-commit →
 * patch-install → next build). Grinden behålls: den stoppar typfel FÖRE
 * byggsteget (billigare än ett dött bygge) och kvitterar felräkningen.
 */

/** Inre kommandosträng för patch-barnet (ren funktion — testsviten kör den). */
export function byggPatchInstallKommando(spec) {
  return (
    `npm install ${spec} --no-audit --no-fund >> /tmp/synk-patch.log 2>&1` +
    " && node node_modules/typescript/bin/tsc --noEmit >> /tmp/synk-patch.log 2>&1"
  );
}

/** Antal "error TS<kod>:"-rader i loggen — kvitto-detalj + klassning. */
export function raknaTsFel(loggText) {
  if (typeof loggText !== "string") return 0;
  return (loggText.match(/error TS\d+:/g) || []).length;
}

/**
 * Klassa installationsstegets utfall ur exit-kod + barnets logg:
 * "ok" | "tsc-fel" | "install-fel". Med && -kedjan ger tsc alltid exit 1
 * vid typfel, och tsc skriver då "error TS"-rader — det är skiljetecknet
 * mot vanliga npm-fel (tom logg = flock-startade-aldrig-klassen).
 */
export function bedomPatchInstall(exitOk, loggText) {
  if (exitOk) return "ok";
  return raknaTsFel(loggText) > 0 ? "tsc-fel" : "install-fel";
}

/**
 * O48 (r58:s köpost, 2026-09-17): PM2-VAKTEN för patch-byggfönstret.
 * Rotorsakan den stänger: 16.3.5-byggets .next-tömning dog på ENOTEMPTY
 * rmdir .next/server/app/ar/kurser — pm2:s live-ISR skrev filer i
 * kataloger som höll på att rivas (två fallna patch-deployer 11:29 +
 * 11:39, därefter död patch-kö och RCE:n kvar i prod). Stoppad pm2 =
 * inga ISR-skrivare = inget race. Vakten är den mekaniska garantin för
 * att prod ALDRIG lämnas utan process: aterstarta() ropas i main():s
 * finally och täcker ALLA utfall (return, felgrenar, kastat fel).
 * starta() är ok-vägens vanliga restart + nollställer stoppflaggan så
 * finally blir no-op — misslyckas den fångas den här internt och
 * finally:n gör nödstarten (förr var en misslyckad restart i ok-vägan
 * tyst). pm2Kora/logg injiceras — testsvitan spelar in anropen i stället
 * för att röra skarp pm2.
 */
export function skapaPm2Vakt(pm2Kora = standardPm2, logg = logga) {
  let stoppad = false;
  return {
    arStoppad: () => stoppad,
    // V182: nollställ flaggan utan pm2-anrop — efter ett atomärt byte som
    // självt restartat pm2 (annars gör finally:n en andra, onödig omstart)
    markeraLevande() {
      stoppad = false;
    },
    stoppa() {
      if (stoppad) return true;
      try {
        pm2Kora(["stop", "ak1a"]);
        stoppad = true;
        logg("PATCH-KÖ: pm2 stoppad under byggfönstret (o48/r58-kur — tomt .next = inga ISR-skrivare = inget race; återstart garanteras av main():s finally)");
        return true;
      } catch (e) {
        logg("PATCH-KÖ: pm2-stopp misslyckades — bygger vidare som idag (ISR-racet lever, ombygge-grenen fångar): " + String(e && e.message ? e.message : e).slice(0, 80));
        return false;
      }
    },
    starta() {
      try {
        pm2Kora(["restart", "ak1a"]);
        stoppad = false;
        return true;
      } catch {
        return false;
      }
    },
    aterstarta() {
      if (!stoppad) return "behovdes-ej";
      stoppad = false;
      try {
        pm2Kora(["restart", "ak1a"]);
        logg("PATCH-KÖ: pm2 återstartad efter byggfönstret (o48-garantin)");
        return "startad";
      } catch (e) {
        logg("PATCH-KÖ: pm2-återstart MISSLYCKADES — KRÄVER MANUELL START (pm2 start ak1a): " + String(e && e.message ? e.message : e).slice(0, 80));
        return "misslyckades";
      }
    },
  };
}

function standardPm2(args) {
  execFileSync("pm2", args, { timeout: 60_000, stdio: "ignore" });
}

const pm2Vakt = skapaPm2Vakt();

// ---------------------------------------------------------------------------
// V182 (r272 — F6-ROTENS VACCIN): BYGG UTAN KUNDAVBROTT. Roten (r271:s
// F6-utredning): varje prod-bygge mörkar sajten medan det pågår — next build
// tömmer .next progressivt medan pm2 serverar filerna från disk (statiska
// chunks 500, pulsvakten 2026-09-27 05:40Z) och npm ci raderar node_modules
// under den gående appen (lazy-require dör → next-not-found-kraschloop,
// våg 153: ~7 min, 1 309 omstarter). Kuren i tre delar:
//   · bygget skriver .next-ny (NEXT_DIST_DIR, next.config.ts) — prod .next
//     orörd av hela fönstret; fallna/OOM-dödade byggen lämnar prod HELT
//     oberörd (läkebackupen behövs endast i npm ci-läget)
//   · npm ci ENDAST när kedjan ändrat package*.json ELLER node_modules är
//     trasig — i det (sällsynta) läget stoppas pm2 (o48-mönstret) och
//     fönstret är dokumenterat mörkt ~byggtid; dokumenterad gräns för v183
//   · atomärt byte vid GRÖN artefakt: mv .next .next-forra && mv .next-ny
//     .next && pm2 restart (ms-fönster, deploylåset hålls); rött HTTPS ⇒
//     tillbakarullning på sekunder — HEAD orörd, nytt försök nästa poll
// Kontraktstest: verktyg/testa-prod-synk-nolldowntime.mjs
// ---------------------------------------------------------------------------
export function beslutaNpmCi({ diffFiler, nodeModulesIntakt = true }) {
  if (!nodeModulesIntakt) return true;
  if (!Array.isArray(diffFiler)) return true; // obestämbar ⇒ konservativt npm ci
  return diffFiler.some((f) => f === "package.json" || f === "package-lock.json");
}

export function byggNolldowntimeKommando({ npmCi }) {
  const ci = npmCi ? "npm ci --no-audit --no-fund >> /tmp/synk-npmci.log 2>&1 && " : "";
  return ci + "NEXT_DIST_DIR=.next-ny npm run build >> /tmp/synk-build.log 2>&1";
}

// ---------------------------------------------------------------------------
// V183 (r273 — den tysta OOM-dödens kur): instanslåset blev PID-baserat.
// Bevis 2026-09-27 05:57→06:17Z: OOM-svepet mördade prod-synk-processen
// (loggspringa utan ENDA felrad — SIGKILL loggar aldrig; byggfönster på 26
// min är bevisat normalt sedan v182, så det blinda 12-min-taket kan inte
// skilja "lever och bygger" från "död sedan minuter") + pm2-appen dog i
// samma svep (pulsvaktens 60-s-dik). Det kvarlämnade instanslåset blockerade
// 06:07-pollen tyst = 10 min förlorad deploy-återhämtning. Kur: låset bär
// en pid-fil, och varje kollision dömer ur /proc — död pid (eller pid
// återanvänd av icke-synk) rivs DIRECT; levande prod-synk lämnas över hur
// länge bygget än tar. Äldre lås utan pid-fil behåller 12-min-regeln som
// reserv (fail-safe som före V183). Testas av verktyg/testa-prod-synk-instanslas.mjs.
// ---------------------------------------------------------------------------
export function tolkaLasPid(text) {
  const m = String(text ?? "").trim().match(/^\d+$/);
  return m ? Number(m[0]) : null;
}

/** Samla låsets observerbara status — pidText/alderMs null = omätbart. */
export function lasInstansStatus(lasSokvag) {
  const ute = { pidText: null, alderMs: null, procFinns: false, procArSynk: false };
  try { ute.pidText = fs.readFileSync(path.join(lasSokvag, "pid"), "utf8"); } catch { /* äldre lås utan pid-fil */ }
  try { ute.alderMs = Date.now() - fs.statSync(lasSokvag).mtimeMs; } catch { /* */ }
  const pid = tolkaLasPid(ute.pidText);
  if (pid !== null) {
    ute.procFinns = fs.existsSync(`/proc/${pid}`);
    if (ute.procFinns) {
      // Full modulväg — "prod-synk" ensamt matchar också testsviternas
      // filnamn (testa-prod-synk-*.mjs, bevisat av svitens test 14)
      try { ute.procArSynk = fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").includes("verktyg/prod-synk.mjs"); } catch { /* läsofel = inte bevisat synk */ }
    }
  }
  return ute;
}

export function bedomInstansLas({ pidText, alderMs, procFinns, procArSynk }) {
  const pid = tolkaLasPid(pidText);
  if (pid !== null) {
    if (procFinns && procArSynk) return { vanta: true, anledning: `annan synkinstans lever (pid ${pid}, /proc bevisar prod-synk) — lämnar över` };
    return {
      vanta: false,
      anledning: `låset rivet: pid ${pid} ${procFinns ? "återanvänd av annan process (cmdline ≠ prod-synk)" : "är död (inget /proc)"} (V183 — OOM-svepets tysta död ska inte svälta deployer)`,
    };
  }
  // äldre lås utan pid-fil: oförändrad 12-min-regel (fail-safe som före V183)
  if (alderMs === null || alderMs === undefined) return { vanta: true, anledning: "annan synkinstans troligen lever (låsålder omätbar) — lämnar över" };
  if (alderMs <= 12 * 60_000) return { vanta: true, anledning: "annan synkinstans lever — lämnar över" };
  return { vanta: false, anledning: `låset rivet: ${Math.floor(alderMs / 60_000)} min gammalt utan pid-fil (12-min-tak) — övergivet` };
}

async function main() {
  // VÅG 153 — INSTANSLÅS: manuella triggar (arbetsstationen/fabriken) kan
  // racea pumpens :x7-rop — två npm ci i följd raderar node_modules mitt i
  // varandras installation = "next: not found"-kraschloop (bevisat
  // 2026-09-14 17:22-17:29: prod nere ~7 min, 1 309 omstarter). Ett
  // processlås (mkdir, atomärt) ser till att ENDAST EN synkinstans lever;
  // kvarlämnade lås (>12 min) städas som övergivna.
  const lasSokvag = path.join(VAKT, ".synk-instans.lock");
  const skrivPidFil = () => {
    try { fs.writeFileSync(path.join(lasSokvag, "pid"), `${process.pid}\n`); } catch { /* reserv: 12-min-regeln gäller */ }
  };
  try {
    fs.mkdirSync(lasSokvag, { recursive: false });
    skrivPidFil();
  } catch {
    try {
      const dom = bedomInstansLas(lasInstansStatus(lasSokvag));
      if (dom.vanta) {
        console.log(dom.anledning);
        return;
      }
      fs.rmSync(lasSokvag, { recursive: true, force: true });
      fs.mkdirSync(lasSokvag, { recursive: false });
      skrivPidFil();
      logga(`INSTANSLÅS: ${dom.anledning} — nästa poll tar över deployen`);
    } catch {
      return;
    }
  }
  try {
    await korSynk();
  } finally {
    try { fs.rmSync(lasSokvag, { recursive: true, force: true }); } catch {}
    // O48: prod lämnas ALDRIG utan process — patch-fönstrets pm2-stopp
    // återtas här i ALLA utfall (return, felgrenar, kastat fel).
    // "misslyckades" = läget larmas via audit — ALDRIG tyst (r58-doktrinen).
    if (pm2Vakt.aterstarta() === "misslyckades") {
      skrivAudit("prod-synk", "pm2_ej_startad", "patch-fonster", "pm2-återstart efter patch-byggfönstret misslyckades — manuell start krävs (pm2 start ak1a)");
    }
  }
}

async function korSynk() {
  // 1) VÅG 123b: hämtning från GitHub kräver autentisering (repo privat,
  //    servern saknar PAT) — BEHÖVS EJ: huvudagentens och agentens pushar
  //    levererar trädet DIREKT till servern (updateInstead). Synken jämför
  //    HEAD mot senaste DEPLOYADE hash och bygger vid skillnad.
  const lokal = git(["rev-parse", "HEAD"]);
  const senasteFil = path.join(VAKT, "senaste-deployad.txt");
  let senaste = "";
  try { senaste = fs.readFileSync(senasteFil, "utf8").trim(); } catch { /* första körningen */ }

  // 1b) PATCH-KÖN (o46): en aktiv kö väcker synken ÄVEN utan ny kod —
  //     critical-patchar ska inte vänta på nästa kod-deploy. Köfilen bor i
  //     data/infra (committad — historien ÄR patch-historiken); kvittona i
  //     data/vakten (runtime, untracked — överlever checkout som loggarna).
  const patchFil = path.join(ROT, "data", "infra", "patch-ko.json");
  const kvittoFil = path.join(VAKT, "patch-kvitton.jsonl");
  let kandaPaket = new Set(); // fail-closed: oläsbar package.json = allt vägras
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROT, "package.json"), "utf8"));
    kandaPaket = new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ]);
  } catch { /* tomt set ovan vägrar köposter — rätt fall vid trasig package.json */ }
  const patchKo = lasPatchKo(patchFil, kandaPaket);
  if (patchKo.fel.length) {
    logga(`PATCH-KÖ: ${patchKo.fel.length} ogiltig(a) post(er) hoppades över — ${patchKo.fel.join(" · ").slice(0, 300)}`);
  }
  const patchPlan = aktivPatchPlan(patchKo, lasPatchKvitton(kvittoFil));
  if (lokal === senaste && patchPlan.length === 0) return; // inget nytt — tyst (99 % av runsen)

  if (patchPlan.length) {
    logga(`PATCH-KÖ aktiv: ${patchPlan.map((p) => `${p.paket}@${p.version}`).join(", ")}`);
  }
  if (lokal === senaste) {
    logga("PATCH-KÖ väcker synken utan ny kod (o46) — patch-install + ombygge + restart");
  } else {
    logga(`NY KOD: ${senaste.slice(0, 8) || "(första)"} → ${lokal.slice(0, 8)}`);
  }

  // 1c) VAKTRAPPORTS-GRINDEN (VÅG 212): RÖD kvalitetsrapport ⇒ deploy-stopp
  // FÖRE byggstart — stoppar trasigt träd från att ens riva .next (bygget
  // tömmer katalogen FÖRE ev. kompileringsfel). Fail-open för saknas/gammal
  // (vaktpumpornas hälsa ägs av pulsvakten), deadlock-skydd via ommätning.
  const vaktRapport = lasVaktrapportStatus(path.join(ROT, VAKTRAPPORT_FIL));
  const vaktDom = bedomVaktrapportStopp(vaktRapport);
  if (vaktDom.niva !== "info") logga(`VAKTRAPPORT: ${vaktDom.meddelande}`);
  if (vaktDom.stopp) {
    skrivAudit("prod-synk", "deploy_stoppad_vaktrapport", `rod-${vaktRapport.felAntal}fel-${vaktRapport.alderTimmar}h`, vaktDom.meddelande);
    triggaVaktOmmatning();
    return; // HEAD orörd · DEPLOYAD-markör orörd · .next orörd — nytt försök nästa poll mot färsk rapport
  }

  // 2) RAM-VAKT (10X-incidenten): under taket OOM-dödas next build av
  //    minnesgränsen ("Killed") — felet är KAPACITET, inte kod. Vänta till
  //    nästa poll (10 min) i stället för att bygga dömt. HEAD orört.
  //    VACCIN 3 (DRIFTSBOKEN 17:42Z): taket räknar med PÅGÅENDE tunga
  //    processers tillväxt (gränssnittsvaktens chrome-cron + fabrikens
  //    zcode-barn) — MemAvailable ensam ser dem inte komma.
  let psRader = null;
  try {
    psRader = execFileSync("ps", ["-eo", "args="], { encoding: "utf8", timeout: 10_000 }).split("\n");
  } catch {
    /* klasser 0/0 = oförändrat beteende (fail-open vid omätbart) */
  }
  const ram = ramTillgangligtMB();
  const utrymme = bedomByggUtrymme({ ramMB: ram, tunga: raknaTungaProcesser(psRader) });
  if (!utrymme.ok) {
    logga(
      `VÄNTAR-RAM: ${ram} MB tillgängligt (< ${utrymme.behovMB} = ${MIN_RAM_MB} bygg + ${utrymme.reservMB} reserv; ${utrymme.detalj}) — bygger när minnet frigjorts; HEAD orört, nytt försök nästa poll`
    );
    return;
  }

  // 2b) V235 (BYGG×FABRIK-SEKVENSERING — rond 130:s rotfynd ur nattens
  //     OOM-serie): fabrikens AKTIVA manifest ⇒ skjut upp byggstarten till
  //     nästa poll — sekvens, aldrig kapplöpning mellan kundens två
  //     pipelines (ps-vakten ser bara NU-varande barn; manifestet föder
  //     NYA barn mitt i byggfönstret, det var exakt nattens dödsmekanik).
    //     SVÄLTSTOPP: kedjande manifest (12 uppgifter = timmar) får ALDRIG
    //     svälta deployer i evighet — efter FABRIKS_VANTE_MAX_MIN körs
    //     bygget ändå, skyddat av ps-vaktens rättade reserv (850 MB/barn)
    //     OCH — ROND 152 — minst TVINGAT_BYGG_MIN_MB fritt minne: fem
    //     mördade byggen 2026-09-21 18:37–20:11Z (varav två just svält-
    //     stopps-tvång, 19:27Z + 20:07Z) dog samtliga med kernel-Killed i
    //     Turbopacks optimeringsfas; ett KALLT bygg (rivet .next) äter mer
    //     än reserven skyddar. Väntespäret (första väntetillfället) lever
    //     i runtime-filen .synk-fabriksvant och nollställs när fabriken vilar.
  const fabriken = lasAktivaFabriksManifest(path.join(VAKT, "agentfabrik", "status"));
  const fabrikVanteFil = path.join(VAKT, ".synk-fabriksvant");
  if (fabriken.aktiva > 0) {
    let vanteStart = 0;
    try { vanteStart = Number(fs.readFileSync(fabrikVanteFil, "utf8").trim()) || 0; } catch { /* första väntetillfället */ }
    if (!vanteStart) {
      try { fs.writeFileSync(fabrikVanteFil, String(Date.now())); } catch { /* spåret är optimering, aldrig grind */ }
      vanteStart = Date.now();
    }
    const vanteMin = Math.floor((Date.now() - vanteStart) / 60_000);
    if (vanteMin < FABRIKS_VANTE_MAX_MIN) {
      logga(
        `VÄNTAR-FABRIK: ${fabriken.aktiva} aktivt/aktiva manifest (${fabriken.ids.slice(0, 2).join(", ")}) — sekvens, aldrig kapplöpning (V235); väntat ${vanteMin} av tak ${FABRIKS_VANTE_MAX_MIN} min; HEAD orört, nytt försök nästa poll`
      );
      return;
    }
    // ROND 152-vaccinet: tvingat bygg vid aktiv fabrik kräver även rejält
    // fritt minne — annars väntar vi vidare (fabrikens egna 25-min-tak per
    // uppgift tömmer kön, svälten kan inte bli evig; HEAD förblir orörd).
    const tvingatRam = ramTillgangligtMB();
    if (tvingatRam !== null && tvingatRam < TVINGAT_BYGG_MIN_MB) {
      logga(
        `VÄNTAR-RAM-TVINGAT: fabrikstak passerat men endast ${tvingatRam} MB fritt (< ${TVINGAT_BYGG_MIN_MB} = kallbyggets topp + fabrikens barn; fem mördade byggen 09-21) — HEAD orört, nytt försök nästa poll`
      );
      return;
    }
    logga(`VÄNTAR-FABRIK tak passerat (${vanteMin} min hungrande deploy) — bygger NU med ps-reserven 850 MB/barn + ${tvingatRam} MB fritt som fönsterskydd; fabriken: ${fabriken.aktiva} manifest`);
    try { fs.rmSync(fabrikVanteFil, { force: true }); } catch { /* */ }
  } else {
    try { fs.rmSync(fabrikVanteFil, { force: true }); } catch { /* */ }
  }

  // 3) rent träd (data/vakten = runtime, orörd; data/cache = runtime-artefakter)
  try { git(["checkout", "--", "."]); } catch { /* inget att återställa */ }
  try { git(["clean", "-fd", "data/cache"]); } catch { /* fanns ej */ }

  // 4) good-HEAD = senaste deployade (eller nuvarande om aldrig deployat)
  const goodHead = senaste || lokal;
  const nya = git(["log", "--oneline", `${goodHead}..HEAD`]);

  // 3b) PATCH-KÖNS INSTALLATION (o46): sker ENDAST här — av prod-synken
  //     (installationens ägare), under samma deploylås som bygger. En
  //     misslyckad installation blockerar ALDRIG kodleveransen: kvitto
  //     skrivs och korBygg nedan kör på befintlig lock som vanligt.
  //     o106: "misslyckad" omfattar sedan TSC-GRINDEN även typbrytande
  //     patchar (se byggPatchInstallKommando) — baslinjen 0 är ett
  //     DEPLOYVILLKOR, inte bara ett commit-villkor.
  const aterskapaPatchLas = () => {
    // riv npm installens lock-ändring — ombyggen ska ske på bevisat
    // fungerande grund när patchen är misstänkt gärningsman
    try { git(["checkout", "--", "package.json", "package-lock.json"]); } catch { /* */ }
  };
  let patchInstallerad = false;
  if (patchPlan.length) {
    const spec = patchPlan.map((p) => `${p.paket}@${p.version}`).join(" ");
    try { fs.writeFileSync("/tmp/synk-patch.log", ""); } catch { /* */ }
    const { spawn: spawnPatch } = await import("node:child_process");
    const installOk = await new Promise((lyckas) => {
      const barn = spawnPatch(
        "bash",
        ["-c", `exec flock -w 900 /tmp/ak1a-deploy.lock bash -c ${JSON.stringify(byggPatchInstallKommando(spec))}`],
        { cwd: ROT, stdio: "ignore", detached: false },
      );
      barn.on("exit", (kod) => lyckas(kod === 0));
      barn.on("error", () => lyckas(false));
    });
    const patchLogg = slasLogg("/tmp/synk-patch.log");
    const installDom = bedomPatchInstall(installOk, patchLogg);
    if (installDom === "ok") {
      patchInstallerad = true;
      logga(`PATCH-KÖ installerad + TSC-GRIND GRÖN: ${spec} — package-lock uppdaterad i arbetsytan, baslinjen 0 hållet`);
      // O48 (r58:s köpost): pm2 STOPPAS före byggsteget i patch-läget —
      // ett lock-byte (t.ex. next 16.3.2→16.3.5) byter chunknamn och
      // tömmer .next, och pm2:s live-ISR hinner skriva filer i kataloger
      // som håller på att rmdir:as (ENOTEMPTY, bevisat 11:29 + 11:39).
      // Stoppet sker FÖRE korBygg så hela fönstret (npm ci raderar
      // node_modules + build tömmer .next) är skrivarfritt — och utan de
      // bevisade next-not-found-restartlooparna (pm2 stoppad restartar
      // inte). Återstarten är mekaniskt garanterad av main():s finally.
      // Misslyckas stoppet: byggfönstret körs som idag och felgrenen
      // (ombygge på god lock) fångar fallet — fail-open mot gårdagens
      // beteende, aldrig ny död vinkel.
      pm2Vakt.stoppa();
    } else if (installDom === "tsc-fel") {
      // o106: patchens typer bröt baslinjen 0 — locken riven FÖRE
      // byggsteget så korBygg kör npm ci på god lock (deploy fortsätter
      // som vanligt: patch-fel blockerar aldrig kodleverans). Kvitto med
      // felräkning — loop-skyddet (3 försök) gäller som för install-fel,
      // versionbyte i köfilen ger nytt liv.
      const antal = raknaTsFel(patchLogg);
      aterskapaPatchLas();
      logga(`PATCH-KÖ: TSC-GRINDEN STOPPADE ${spec} — ${antal} typfel mot baslinjen 0 (se /tmp/synk-patch.log) — lock riven, deploy fortsätter på befintlig lock`);
      for (const p of patchPlan) skrivPatchKvitto(kvittoFil, p, "misslyckad", `tsc-fel: ${antal} typfel efter patch-install — baslinjen 0 är deployvillkor`);
    } else {
      logga("PATCH-KÖ: installation MISSLYCKADES (se /tmp/synk-patch.log) — deploy fortsätter på befintlig lock");
      for (const p of patchPlan) skrivPatchKvitto(kvittoFil, p, "misslyckad", "npm install avslutades med felkod");
    }
  }

  // 5-6) bygg under flock — VÅG 123d: UTAN node-timeout (execSync-tak dödade
  // byggprocessen med SIGTERM; deploylåset serialiserar ändå, daemonen
  // övervakar). Logg till eigen fil för efteranalys.
  // V182 (r272): NOLLDOWNTIME — npm ci endast vid lock-ändring/trasigt
  // node_modules (patchInstallerad ⇒ installationen redan gjord), bygget
  // skriver .next-ny så prod .next är orörd hela fönstret.
  let diffFiler = null;
  try {
    diffFiler = git(["diff", "--name-only", `${goodHead}..HEAD`]).split("\n").map((s) => s.trim()).filter(Boolean);
  } catch { /* obestämbar ⇒ beslutaNpmCi kör konservativt */ }
  const nodeModulesIntakt = fs.existsSync(path.join(ROT, "node_modules", ".package-lock.json"));
  const npmCiBehov = patchInstallerad ? false : beslutaNpmCi({ diffFiler, nodeModulesIntakt });
  const bygg = byggNolldowntimeKommando({ npmCi: npmCiBehov });
  logga(
    `NOLLDOWNTIME v182: npm ci ${npmCiBehov ? "KÖRS (lock ändrad/trasigt node_modules — pm2 stoppas enligt o48, fönstret mörkt ~byggtid)" : "HOPPAS ÖVER (node_modules aktuell)"} · bygget skriver .next-ny · prod .next orörd hela fönstret`,
  );
  if (npmCiBehov) pm2Vakt.stoppa();
  const { spawn } = await import("node:child_process");
  const korBygg = () =>
    new Promise((lyckas) => {
      const barn = spawn(
        "bash",
        ["-c", `exec flock -w 900 /tmp/ak1a-deploy.lock bash -c ${JSON.stringify(bygg)}`],
        { cwd: ROT, stdio: "ignore", detached: false },
      );
      barn.on("exit", (kod) => lyckas(kod === 0));
      barn.on("error", () => lyckas(false));
    });
  let ok = false;
  try { fs.writeFileSync("/tmp/synk-npmci.log", ""); } catch { /* */ }
  try { fs.writeFileSync("/tmp/synk-build.log", ""); } catch { /* */ }
  // O97 (NEXT-LÄKEBACKUP): säkra senast gröna .next FÖRE byggstart — LAEKE
  // skrivs ENDAST när den saknas ("finns-sedan" = senast grönt bevaras; ett
  // ev. halvskrivet .next från föregående fönster får ALDRIG ersätta den)
  // och städas vid lyckad deploy. Fail-open: fel loggas, byggandet fortsätter.
  const nextKatalog = path.join(ROT, ".next");
  const laekeKatalog = path.join(ROT, ".next-laeke");
  const lakaNext = (varde) => {
    const lak = aterstallNextUrLaeke({ nextKatalog, laekeKatalog });
    if (lak === "aterstallt") {
      logga(`${varde}: .next ÅTERSTÄLLD ur läkebackup — pm2 serverar senast gröna läget direkt (ISR-cachen värms om vid träff; ombygge nästa poll som innan)`);
      skrivAudit("prod-synk", "next_lakt_ur_backup", varde, "fallit bygg lämnade .next halvskrivet — senast gröna läget återställt ur .next-laeke");
    } else if (lak !== "ingen-backup") {
      logga(`VARNING: .next-läkeåterställning (${varde}) föll: ${lak} — beteendet som före o97-kuren`);
    }
    return lak;
  };
  if (npmCiBehov) {
    const backup = skapaNextLaekebackup({ nextKatalog, laekeKatalog });
    if (backup === "skapad") logga("NEXT-LÄKEBACKUP skapad (.next → .next-laeke, ISR-cache exkluderad) — senast gröna läget säkrat före bygget");
    else if (backup.startsWith("fel:") || backup === "icke-gron") logga(`VARNING: NEXT-LÄKEBACKUP ej tagen (${backup}) — felutfall lämnas som före o97-kuren`);
    // finns-sedan / saknas-next är tysta normalfall (fönsterföljd / första deployen)
  } else {
    logga("NOLLDOWNTIME v182: läkebackup ej behövs — bygget skriver .next-ny, prod .next lämnas orörd");
  }
  // V182: rent .next-ny inför varje försök — fallna försöks skrap städas här
  try { fs.rmSync(path.join(ROT, ".next-ny"), { recursive: true, force: true }); } catch { /* */ }
  const korResultat = await korBygg();
  const feltyp = korResultat ? null : bedomByggMisslyckande(slasLogg("/tmp/synk-npmci.log"), slasLogg("/tmp/synk-build.log"));
  if (korResultat) {
    ok = true;
  } else if (feltyp === "startade-aldrig") {
    // o49: flock -w 900 fick aldrig deploylåset (manuell deploy/pmpa pågick)
    // ⇒ byggkommandot startade ALDRIG och loggfilerna förblev tomma. Det är
    // konkurrens, inte kod- eller patch-fel: INGA kvitton, INGEN revert —
    // HEAD orört, nytt försök nästa poll (samma vänta-semantik som OOM).
    if (patchInstallerad) aterskapaPatchLas();
    logga("bygg startade ALDRIG (deploylåset upptaget hela -w 900 — flock-konkurrens, ej fel) — HEAD orört, nytt försök nästa poll");
    return;
  } else if (feltyp === "oom") {
    // OOM = infraskal (OOM-killern/JS-heapet), INTE kodfel: HEAD lämnas
    // orätt och senaste-deployad är oförändrad ⇒ automatiskt nytt försök
    // nästa poll när fabrikens barn frigjort minnet. ALDRIG revert/reset
    // av commits som aldrig fått ett ärligt byggtillfälle. Patchad lock
    // rivs (inget kvitto — OOM är inte patchens fel, nytt försök nästa poll).
    // O97: men .next har rivits/halvskrivits av det dödade bygget —
    // återställ senast gröna läget så pm2 slutar blöda under väntan.
    if (patchInstallerad) aterskapaPatchLas();
    lakaNext("oom");
    logga("bygg OOM-dödat (Killed/heap i /tmp/synk-build.log) — infra, ej kodfel: HEAD orört, nytt försök nästa poll");
    return;
  } else {
    if (patchInstallerad) {
      // patchen kan vara gärningsman: BEVARA loggarna FÖRE allt annat (o49
      // Kur B — /tmp skrivs över av nästa bygg och 11:29/11:39-felen blev
      // obestämbara just därför), riv sedan lock-ändringen FÖRE revert-vägen
      // (ombygget sker på bevisat fungerande lock) + kvitta försöket.
      // o49 Kur A: patchInstallerad NOLLSTÄLLS här — commit-steget i steg 7
      // ska ALDRIG försöka bokföra en redan riven lock. Bugg-bevis
      // 2026-09-17 11:33: bygg-miss → revert → lyckat ombygg → "git add
      // package.json package-lock.json" hade INGET staggat → commit
      // "nothing to commit" exit 1 → SPURIOUS misslyckad-kvitto som
      // tröttade loop-skyddsräknaren utan att patchen ens fått skulden.
      const sparade = bevaraByggLoggar(path.join(VAKT, "patch-byggfel"), [
        ["/tmp/synk-npmci.log", "npmci.log"],
        ["/tmp/synk-build.log", "build.log"],
      ]);
      if (sparade.length) {
        logga(`PATCH-KÖ: bygg-loggar bevarade (${sparade.join(", ")}) i data/vakten/patch-byggfel/ — rotorsaksdiagnos överlever nästa bygg`);
      }
      aterskapaPatchLas();
      for (const p of patchPlan) skrivPatchKvitto(kvittoFil, p, "misslyckad", "bygg misslyckades med patchad lock");
      patchInstallerad = false;
    }
    // O97: pm2 serverar nu det rivna/halvskrivna .next som det fallna
    // bygget lämnat — återställ gröna läget FÖRE ombyggs-kedjan så fönstret
    // till (ev.) lyckat ombygg inte blöder; varje fallit ombygg river .next
    // på nytt och läker igen i sin terminal nedan.
    lakaNext("byggfel");
    if (!nya.trim()) {
      // patchMode utan ny kod: HEAD är deployad och god sedan tidigare —
      // revert vore att reverta DIGLIG kod. MEN det fallna bygget har
      // redan rivit .next (next build tömmer katalogen FÖRE
      // kompileringsfelet): pm2 serverar HTML ur minnet medan ALLA
      // statiska filer ger 500 (bevisat 2026-09-17 11:39–11:43: 22/22
      // statiska 500, .next/BUILD_ID borta). Ombygge på den återställda
      // (bevisat fungerande) locken är OBLIGATORISKT — patchen är
      // tillbakadragen (misslyckad-kvittoa skrevs ovan, locken riven),
      // därför nollställs patchInstallerad så steg 7 aldrig committar
      // den rivna locken eller skriver ok-kvitton för den.
      logga("PATCH-KÖ: bygg misslyckades utan ny kod — patchen misstänkt, lock återställd; OMBYGG på god lock (det fallna bygget rivit .next)");
      patchInstallerad = false;
      if (await korBygg()) {
        ok = true;
        logga("ombygge på god lock OK — prod åter tjänstduglig, patchen tillbakadragen (HEAD orörd)");
      } else {
        logga("ombygge på god lock MISSLYCKADES — pm2 orörd, manuell granskning krävs");
        skrivAudit("prod-synk", "deploy_avbruten", "ombygge-god-lock", "patch-mode utan ny kod: även ombygget på god lock misslyckades — manuell granskning krävs");
        lakaNext("ombygge-god-lock-fall");
        return;
      }
      // O79: patch-lägets lyckade ombygg lämnar felgrenen HÄR — blocket
      // nedan (o72-vakten + revert/ombygg) förutsätter ett fortfarande
      // FALLIT läge: genomfallning loggade "bygg MISSLYCKADES" om läkt
      // prod och kunde `git revert HEAD` på senaste deployade src-commit
      // = revert av duglig kod (10X-klassen). Lyckat ombygg går direkt
      // till steg 7 (restart mot det återställda .next).
    } else {
      // O72 blind-revert-vakten: HEAD som ENBART rör icke-byggyta (verktyg/,
      // data/, docs) kan aldrig vara gärningsmanet till ett Next-byggfel —
      // revert avstås, ombygg på orörd HEAD skyddar både leveransen och .next.
      let headFiler = null;
      try {
        headFiler = git(["show", "--name-only", "--format=", "HEAD"]).split("\n").map((s) => s.trim()).filter(Boolean);
      } catch { /* obestämbar ⇒ headRorByggyta(null) = true = gammalt beteende */ }
      const rorByggyta = headRorByggyta(headFiler);
      logga(
        "bygg MISSLYCKADES (se /tmp/synk-*.log) — " +
          (rorByggyta
            ? "HEAD rör byggyta: revert + ombygge"
            : `HEAD rör ENBART icke-byggyta (${headFiler.length} filer) — revert AVSTÅS (o72), ombygg på orörd HEAD`)
      );
      try {
        if (!rorByggyta) {
          if (await korBygg()) {
            ok = true;
            logga("ombygg på orörd HEAD OK — oskyldig leverans skyddad, .next återställd");
            skrivAudit("prod-synk", "deploy_ombygg_utan_revert", `prod@${git(["rev-parse", "HEAD"]).slice(0, 8)}`, "byggfel men HEAD rör ej byggyta: revert avstådd (o72), ombygg på orörd HEAD OK");
          } else throw new Error("ombygg-utan-revert failade");
        } else {
          git(["revert", "HEAD", "--no-edit"]);
          if (await korBygg()) {
            ok = true;
            logga("revert+ombygge OK — prod bygger på föregående commit");
            skrivAudit("prod-synk", "deploy_revert", `prod@${git(["rev-parse", "HEAD"]).slice(0, 8)}`, "felbygge revertades — prod bygger på föregående commit");
          } else throw new Error("revert-bygget failade");
        }
      } catch {
        // O79 (o72:s köpost "goodHead-fallbackens destruktivitet"): innan
        // sista utvägen `reset --hard goodHead` mäts HELA kedjan
        // goodHead..HEAD. HEAD oskyldig + kedjan ren ⇒ goodHead-bygget
        // möter EXAKT samma kod (skillnaden är data/verktyg/docs) och
        // faller av samma skäl — reset vore bevisat lönlös OCH destruktiv
        // (osskyldiga leveranser kastas ur trädet, 10X-klassen). Då:
        // avstå, HEAD orörd, nytt försök nästa poll (RAM-vakten gäller).
        // Kedjan smutsig (äldre byggyta-commit bakom oskyldig HEAD) ⇒
        // reset behålls: den läker prod till bevisat deploybar kod.
        let kedjaFiler = null;
        try {
          kedjaFiler = git(["diff", "--name-only", `${goodHead}..HEAD`]).split("\n").map((s) => s.trim()).filter(Boolean);
        } catch { /* obestämbar ⇒ headRorByggyta(null) = true = gammalt beteende */ }
        if (bordeAvstaGoodHeadReset({ rorByggyta, kedjaRorByggyta: headRorByggyta(kedjaFiler) })) {
          logga("ombygg på orörd HEAD misslyckades och KEDJAN goodHead..HEAD rör enbart icke-byggyta — goodHead-ombygg vore identiskt: reset AVSTÅS (o79), HEAD orörd, nytt försök nästa poll");
          skrivAudit("prod-synk", "deploy_avstar_goodhead_reset", `prod@${git(["rev-parse", "HEAD"]).slice(0, 8)}`, "HEAD+kedja rör enbart icke-byggyta och ombygget föll: goodHead-reset bevisat lönlös (samma bygg) — avstås, HEAD orörd, nytt försök nästa poll");
          lakaNext("o79-avsta");
          return;
        }
        logga("ombygge efter revert MISSLYCKADES — återställer känd-good HEAD");
        try {
          git(["reset", "--hard", goodHead]);
          if (await korBygg()) {
            ok = true;
            logga("good-HEAD återställd + ombyggd");
          } else throw new Error("good-HEAD-bygget failade");
        } catch {
          logga("KRITISKT: även good-HEAD-bygget failar — pm2 orörd, kräver manuell granskning");
          skrivAudit("prod-synk", "deploy_avbruten", "good-HEAD", "även good-HEAD-bygget misslyckades — pm2 orörd, manuell granskning krävs");
          lakaNext("goodhead-kritiskt");
          return;
        }
      }
    }
  }

  // 7) restart + verifiering
  if (ok) {
    // ARTEFAKTGRIND (E34-köpost 1, 2026-09-16): dagens incident-klass —
    // bygget kan LYCKAS (exit 0, BUILD_ID skriven) men ändå ha lämnat en
    // internt inkonsistent artefakt: färsk prerender-HTML som refererar
    // chunks som aldrig emitterades. HTML svarar 200 (httpsOk nedan ser
    // bara det) medan saknade chunks = kundsynligt ostylat. Därför mäts
    // kontraktet FÖRE restart: trasig/okänd ⇒ INGEN pm2-restart och
    // INGEN DEPLOYAD-markör — senaste-deployad lämnas orörd så nästa
    // poll ser NY KOD igen, RAM-vakten gäller och ombygget sker när
    // minnet tillåter (dagens manuella läkningsväg, nu mekanisk).
    // V182: mätningen görs mot .next-ny — prod .next är orörd av bygget.
    const artefakt = await verifieraArtefakt({ nextKatalog: path.join(ROT, ".next-ny") });
    if (artefakt.status !== "gron") {
      logga(
        `ARTEFAKT ${artefakt.status.toUpperCase()} efter bygg — ${artefakt.meddelande} · pm2 EJ omstartad, DEPLOYAD-markör EJ skriven (v182: prod .next orörd — skrapen i .next-ny städas vid nästa försök); ombygge nästa poll (RAM-vakten gäller)`,
      );
      skrivAudit("prod-synk", "deploy_stoppad_artefakt", `artefakt-${artefakt.status}`, artefakt.meddelande);
      lakaNext("artefakt-stopp");
      return;
    }
    // V182: ATOMÄRT BYTE (.next-ny → .next) + restart under deploylåset —
    // ms-fönstret mellan mv:arna är hela kundavbrottet. ISR-cachen (~1 GB)
    // flyttas in i nya läget FÖRE bytet: nya appen startar varm, gamla
    // appen tappar den endast sekunder före sin restart (annars regenereras
    // vid träff — cache är optimering, aldrig grind).
    const forraKatalog = path.join(ROT, ".next-forra");
    try {
      try {
        fs.rmSync(path.join(ROT, ".next-ny", "cache"), { recursive: true, force: true });
        fs.renameSync(path.join(ROT, ".next", "cache"), path.join(ROT, ".next-ny", "cache"));
      } catch { /* cache är optimering — bytet kör utan */ }
      const swap = "mv .next .next-forra && mv .next-ny .next && pm2 restart ak1a";
      const swapOk = await new Promise((lyckas) => {
        const barn = spawn("bash", ["-c", `exec flock -n /tmp/ak1a-deploy.lock bash -c ${JSON.stringify(swap)}`], { cwd: ROT, stdio: "ignore", detached: false });
        barn.on("exit", (kod) => lyckas(kod === 0));
        barn.on("error", () => lyckas(false));
      });
      if (!swapOk) throw new Error("swap-barnet misslyckades (lås upptaget eller mv/pm2-fel)");
      pm2Vakt.markeraLevande(); // bytet restartade pm2 — finally:n ska inte göra om det
    } catch (e) {
      logga(`VARNING: NOLLDOWNTIME-byte föll (${String(e && e.message ? e.message : e).slice(0, 120)}) — .next-ny ligger klar, pm2 EJ omstartad; nytt försök nästa poll`);
      skrivAudit("prod-synk", "deploy_stoppad_byte", "nolldowntime", "atomärt byte .next-ny→.next misslyckades — prod orörd, ombygge nästa poll");
      return;
    }
    await new Promise((s) => setTimeout(s, 6000));
    if (await httpsOk()) {
      // PATCH-KÖNS BOKFÖRING (o46): committa den patchade locken FÖRE
      // DEPLOYAD-markören — annars ser nästa poll kvitto-commiten som ny
      // kod och bygger om i onödan. ok-kvitton skrivs ENDAST när commiten
      // landat (vid commit-fail lever patchen bara i arbetsytan och rivs
      // vid nästa synk — försöksräknaren tar omförsöken).
      if (patchInstallerad) {
        const spec = patchPlan.map((p) => `${p.paket}@${p.version}`).join(", ");
        try {
          git(["add", "package.json", "package-lock.json"]);
          fs.writeFileSync(
            "/tmp/synk-patchmsg.txt",
            `studio: prod-synk patch-kö — ${spec} (package-lock uppdaterad av o46-mekaniken under deploylåset; installation ägd av prod-synken)\n`,
          );
          git(["commit", "-F", "/tmp/synk-patchmsg.txt"]);
          for (const p of patchPlan) skrivPatchKvitto(kvittoFil, p, "ok", "deployad + HTTPS 200 + lock committad");
          logga(`PATCH-KÖ BOKFÖRD: ${spec} — package.json + package-lock.json committade`);
        } catch (e) {
          for (const p of patchPlan) skrivPatchKvitto(kvittoFil, p, "misslyckad", "lock-commit misslyckades: " + String(e && e.message ? e.message : e).slice(0, 60));
          logga(`PATCH-KÖ: lock-commit MISSLYCKADES (${forklaraGitFel(e).slice(0, 120)}) — patchen lever endast i arbetsytan; omförsök räknas`);
        }
      }
      const deployadHash = git(["rev-parse", "HEAD"]);
      try { fs.writeFileSync(senasteFil, deployadHash + "\n"); } catch { /* markör får vänta */ }
      const antal = nya.trim() ? nya.split("\n").length : 0;
      logga(
        antal
          ? `DEPLOYAD automatiskt: ${antal} commits (${deployadHash.slice(0, 8)}) — prod 200`
          : `DEPLOYAD (patch-kö, o46): ${patchPlan.map((p) => `${p.paket}@${p.version}`).join(", ")} — prod 200`,
      );
      // MEGA G3 — audit: varje autonom deploy är en spårbar händelse.
      skrivAudit("prod-synk", "deploy", `prod@${deployadHash.slice(0, 8)}`, antal ? `${antal} commits — HTTPS 200 verifierad` : `patch-kö ${patchPlan.map((p) => p.paket).join(", ")} — HTTPS 200 verifierad`);

      // O97: deployen grön ⇒ .next på disk är det nya gröna läget —
      // läkebackupen är inaktuell och städas (nästa byggstart tar färsk
      // ur det nya .next; LAEKE speglar alltid senaste LYCKADE deploy).
      try { fs.rmSync(laekeKatalog, { recursive: true, force: true }); } catch { /* får ligga — städas nästa gröna deploy */ }
      // V182: förra läget (bytets förlorare) städas — diskhygien.
      try { fs.rmSync(path.join(ROT, ".next-forra"), { recursive: true, force: true }); } catch { /* får ligga — städas nästa gröna deploy */ }

      // VÅG 152 — MÅLET FÖDS OM EFTER DEPLOY: pm2-restarten raderar mål-state
      // ur processminnet (bevisat mönster: målet dött efter VARJE deploy tills
      // GET/hjärtat rört det). DISK-målet (data/vakten/mal-state.json, skrivet
      // av sattMal sedan våg 150) återarmnas DIREKT här. Ingen fil = inget
      // armande — ett medvetet rensat mål återuppstår ALDRIG.
      try {
        const malFil = path.join(VAKT, "mal-state.json");
        if (fs.existsSync(malFil)) {
          const malText = (JSON.parse(fs.readFileSync(malFil, "utf8")) || {}).mal;
          const nyckel = "ADMIN" + "_PASSWORD";
          const passRad = fs
            .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
            .split("\n")
            .find((r) => r.startsWith(nyckel + "="));
          const pass = passRad ? passRad.slice(nyckel.length + 1).trim().replace(/^["']|["']$/g, "") : "";
          if (typeof malText === "string" && malText.trim() && pass) {
            const r = await fetch("http://localhost:3000/api/studio/session", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-admin-password": pass },
              body: JSON.stringify({ action: "malSatt", mal: malText }),
              signal: AbortSignal.timeout(30_000),
            });
            logga(r.ok ? "MÅL återarmat ur disk direkt efter deploy (v152)" : `mål-återarmning FEL ${r.status}`);
          }
        }
      } catch (e) {
        logga("mål-återarmning fel: " + String(e).slice(0, 80));
      }

      // Version-meddelandet (tyst, icke-störande — panelen visar det)
      try {
        const vfil = path.join(VAKT, "versionsloggen.jsonl");
        fs.appendFileSync(
          vfil,
          JSON.stringify({ ts: new Date().toISOString(), commits: nya.trim() ? nya.split("\n").slice(0, 6) : [] }) + "\n",
        );
      } catch { /* logg får vänta */ }

      // VÅG 148D — STÅENDE RUTIN AUTONOM ("agentens hjärna får aldrig glida
      // ifrån koden"): varje deploy synkar OCKSÅ agentens arbetsyta
      // (/home/ak1a/agent/ak1) mot prod-trädet + färskt AGENTS.md. Bevisat
      // behov 2026-09-14: arbetsytan stod kvar på våg 140 medan prod nått 147
      // — agenten levde i en gammal kodvärld och gjorde om redan levererat
      // arbete. sedan o43: SELVVLÄKNING — append-ledgerns merge-klass läks
      // (union), främmande konflikt/ocommittat arbete VÄGRAS + larmar med
      // rotorsak (ALDRIG tyst — det var så glidet uppstod).
      try {
        const AGENT_YTA = "/home/ak1a/agent/ak1";
        const satt = synkaArbetsyta(AGENT_YTA, ROT);
        fs.copyFileSync(
          path.join(ROT, "data", "infra", "agent-arbetsyta", "AGENTS.md"),
          path.join(AGENT_YTA, "AGENTS.md"),
        );
        logga(`AGENTARBETSYTA synkad (${satt} + AGENTS.md) — agenten lever i aktuell kod`);
      } catch (e) {
        logga("AGENTARBETSYTA-SYNK MISSLYCKADES (" + forklaraGitFel(e) + ") — åtgärda nästa rond");
      }
    } else {
      // V182: rött HTTPS efter bytet ⇒ TILLBAKARULLNING PÅ SEKUNDER —
      // gamla (bevisat gröna) läget åter på plats + restart; HEAD orörd
      // och DEPLOYAD-markören oskriven ⇒ nytt försök nästa poll.
      const rollback = "mv .next .next-ny-kass && mv .next-forra .next && pm2 restart ak1a";
      const rollbackOk = await new Promise((lyckas) => {
        const barn = spawn("bash", ["-c", `exec flock -n /tmp/ak1a-deploy.lock bash -c ${JSON.stringify(rollback)}`], { cwd: ROT, stdio: "ignore", detached: false });
        barn.on("exit", (kod) => lyckas(kod === 0));
        barn.on("error", () => lyckas(false));
      });
      try { fs.rmSync(path.join(ROT, ".next-ny-kass"), { recursive: true, force: true }); } catch { /* städas nästa poll */ }
      pm2Vakt.markeraLevande(); // rollback-barnet restartade pm2 (eller läget kräver manuell granskning — audit bär det)
      logga(
        `HTTPS RÖD efter byte — TILLBAKARULLNING ${rollbackOk ? "KLAR: gamla gröna .next åter på plats + pm2 omstartad" : "FÖLL — manuell granskning krävs"} — HEAD orörd, nytt försök nästa poll`,
      );
      skrivAudit(
        "prod-synk",
        rollbackOk ? "deploy_rullad_tillbaka" : "deploy_aterstallning_fel",
        "nolldowntime",
        rollbackOk
          ? "rött HTTPS efter atomärt byte: gamla gröna läget återställt på sekunder, ombygge nästa poll"
          : "tillbakarullning efter rött HTTPS föll — manuell granskning krävs",
      );
    }
  }
}

// Import-vakt (o43): testsvitan importerar denna moduls funktioner — main()
// (deploy-kedjan!) får ENDAST köras som direkt program (pumporna/deploy),
// ALDRIG som sidoeffekt av en import.
const arDirektProgram = (() => {
  try {
    return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();
if (arDirektProgram) {
  main().catch((fel) => logga("FEL: " + String(fel).slice(0, 200)));
}
