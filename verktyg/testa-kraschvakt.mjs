#!/usr/bin/env node
// TEST: kraschvaktens beslutstabell (s8-u2-kuren 2026-09-16) — ren logik,
// ingen IO: varje scenario mappas mot ett bevisat fall ur kraschvakt.log
// 2026-09-14→15 (7 feltriggrade räddningsbygg, alla omstarter +0).
// Körs: node verktyg/testa-kraschvakt.mjs → "PASS n/n" och exit 0.
//
// VACCIN 2 (s8-u1, DRIFTSBOKEN 2026-09-17 17:42Z): misslyckat
// räddningsbygg startade pm2 UTAN artefaktgrind — rm -rf .next skedde
// FÖRE bygger ⇒ restart mot saknad/partiell artefakt = ENOENT-kraschloop
// (↺ 3 700+, nginx 502). Nu: planeraStartEfterMisslyckatBygg + struktur-
// kontrakt på felgrenens ordning (grind FÖRE restart, kort kooldown).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { planeraAtguard, tolkaPm2, kooldownAktiv, planeraStartEfterMisslyckatBygg, planeraOrtvard, planeraAterstallning } from "./kraschvakt.mjs";
import { arAttling } from "./process-trad.mjs";

let pass = 0;
const fel = [];
function krav(namn, villkor) {
  if (villkor) pass++;
  else fel.push(namn);
}

// ── Friskt läge: tyst pass (våg 137:s huvudspår, oförändrat) ────────────
krav(
  "1 frisk: svarar+online+oknad0 → pass",
  planeraAtguard({ okNu: true, status: "online", oknad: 0, lasUpptagen: false }).typ === "pass"
);

// ── Omstartssnurr (våg 137:s kärna): ≥4 nya omstarter → bygg, även om
//    appen råkar svara just nu (758-omstarts-loopen 2026-09-13) ─────────
krav(
  "2 omstartssnurr: oknad 4 → omstartssnurr",
  planeraAtguard({ okNu: true, status: "online", oknad: 4, lasUpptagen: false }).typ === "omstartssnurr"
);

// ── Död app (våg 137:s kärna): errored + svarar ej → bygg.
//    Loggens 11:34/11:44 (status=errored) = de ENDA legitima byggobjekten.
krav(
  "3 död app: errored → dod-app",
  planeraAtguard({ okNu: false, status: "errored", oknad: 0, lasUpptagen: false }).typ === "dod-app"
);
krav(
  "4 död app: stopped → dod-app",
  planeraAtguard({ okNu: false, status: "stopped", oknad: 0, lasUpptagen: false }).typ === "dod-app"
);

// ── KUR (1) deploy-lås-medvetenhet: loggens 01:24-trigg mitt i prod-
//    synkens byggfönster (deploy klar 01:29:50) stoppade en online-app
//    och köade ett andra fullbygge. Nu: vika, oavsett status ──────────
krav(
  "5 deploy pågår + online + svarar ej → vantad-deploy (INTE bygg)",
  planeraAtguard({ okNu: false, status: "online", oknad: 0, lasUpptagen: true }).typ === "vantad-deploy"
);
krav(
  "6 deploy pågår + errored → vantad-deploy (deployn startar appen)",
  planeraAtguard({ okNu: false, status: "errored", oknad: 0, lasUpptagen: true }).typ === "vantad-deploy"
);
krav(
  "7 deploy väger tyngst även vid omstartssnurr? — NEJ: snurr är appens fel, bygg",
  planeraAtguard({ okNu: false, status: "online", oknad: 5, lasUpptagen: true }).typ === "omstartssnurr"
);

// ── KUR (2) designs-anpassat villkor för online+svarar=false (6 av 7
//    feltriggar i loggen): först omkolla … ──────────────────────────────
krav(
  "8 online+svarar ej (1:a koll) → transient-koll (mät igen, INTE bygg)",
  planeraAtguard({ okNu: false, status: "online", oknad: 0, lasUpptagen: false }).typ === "transient-koll"
);
// … 2:a kollen grön = last (typiska byggfönster-falskarna) → pass …
krav(
  "9 omkoll grön → transient (ingen åtgärd)",
  planeraAtguard({ okNu: false, status: "online", oknad: 0, lasUpptagen: false, omkollaSvarar: true }).typ === "transient"
);
// … 2:a kollen röd men processen LEVER → billig pm2-restart före bygge
krav(
  "10 omkoll röd + online → restart (bygge ej första val)",
  planeraAtguard({ okNu: false, status: "online", oknad: 0, lasUpptagen: false, omkollaSvarar: false }).typ === "restart"
);

// ── KUR: pm2-timeout särskiljs från saknas (04:04:41-radens falska
// "ak1a finns inte i pm2" vid 59 MB RAM) ────────────────────────────
// o125: fixturen i VERKLIG pm2 jlist-form — restart_time bor i pm2_env
// (toppnivåfältet existerar ej; våg 137:s läsning = evig nolla).
const pm2Lista = [
  { name: "ak1a-test", restart_time: 3, pm2_env: { status: "online", restart_time: 3 } },
  { name: "ak1a", pm2_env: { status: "online", restart_time: 7 } },
];
krav(
  "11 tolkaPm2 hittar ak1a bland flera processer (restarts 7 ur pm2_env, online)",
  JSON.stringify(tolkaPm2(pm2Lista)) === JSON.stringify({ restarts: 7, status: "online" })
);
krav(
  "11b o125 rot: pm2_env.restart_time vinner över felaktig toppnivå (våg 137:s eviga nolla botad)",
  (() => {
    const r = tolkaPm2([{ name: "ak1a", restart_time: 0, pm2_env: { status: "online", restart_time: 4324 } }]);
    return r.restarts === 4324;
  })()
);
krav(
  "11c o125: toppnivå-fallback kvarstår för äldre pm2-format utan pm2_env.restart_time",
  tolkaPm2([{ name: "ak1a", restart_time: 5, pm2_env: { status: "online" } }]).restarts === 5
);
krav(
  "12 tolkaPm2 utan ak1a → saknas",
  tolkaPm2([{ name: "pulsvakt" }]).saknas === true
);
krav(
  "13 tolkaPm2 tål null/empty → saknas",
  tolkaPm2([]).saknas === true && tolkaPm2(null).saknas === true
);

// ── KUR (4) nyanserad kooldown: 14:24-fallet lämnade appen död i 2 h
//    efter "RÄDDNING KLAR: svarar=false" ───────────────────────────────
const nu = Date.now();
krav(
  "14 kooldown 120 aktiv vid 119 min",
  kooldownAktiv({ senasteRaddning: nu - 119 * 60_000, kooldownMin: 120 }, nu) === true
);
krav(
  "15 kooldown 120 utlöpt vid 121 min",
  kooldownAktiv({ senasteRaddning: nu - 121 * 60_000, kooldownMin: 120 }, nu) === false
);
krav(
  "16 kort kooldown 20 utlöpt vid 25 min (vantad-deploy/restart-läkning)",
  kooldownAktiv({ senasteRaddning: nu - 25 * 60_000, kooldownMin: 20 }, nu) === false
);
krav(
  "17 kort kooldown 20 fortfarande aktiv vid 15 min",
  kooldownAktiv({ senasteRaddning: nu - 15 * 60_000, kooldownMin: 20 }, nu) === true
);
krav(
  "18 default 120 när kooldownMin saknas (våg 137-kompatibel state)",
  kooldownAktiv({ senasteRaddning: nu - 100 * 60_000 }, nu) === true
);
krav(
  "19 ingen senasteRaddning → ingen kooldown",
  kooldownAktiv({}, nu) === false
);

// ── VACCIN 2 (DRIFTSBOKEN 17:42Z): start-beslut efter misslyckat
//    räddningsbygg — artefaktgrind FÖRE pm2, ALDRIG bara retry ─────────
krav(
  "20 misslyckat bygg + artefakt gron → startaPm2 (restart-bar trots felet)",
  (() => {
    const r = planeraStartEfterMisslyckatBygg("gron");
    return r.startaPm2 === true && r.kooldownMin === 30;
  })()
);
krav(
  "21 misslyckat bygg + artefakt trasig → pm2 STOPPAD (kraschloop-klassen död)",
  (() => {
    const r = planeraStartEfterMisslyckatBygg("trasig");
    return r.startaPm2 === false && r.kooldownMin === 30 && r.meddelande.includes("STOPPAD");
  })()
);
krav(
  "22 misslyckat bygg + artefakt okand → pm2 STOPPAD (försiktighet: omätbart ≠ restart-bar)",
  (() => {
    const r = planeraStartEfterMisslyckatBygg("okand");
    return r.startaPm2 === false && r.kooldownMin === 30;
  })()
);
krav(
  "23 kooldown 30 även vid gron artefakt (osäkert läge — bygget misslyckades ju; kurens (4))",
  kooldownAktiv({ senasteRaddning: nu - 15 * 60_000, kooldownMin: planeraStartEfterMisslyckatBygg("gron").kooldownMin }, nu) === true
);

// ── VACCIN 2 strukturkontrakt (ordagranna, pm2vakt-svitens mönster):
//    felgrenen mäter artefakten FÖRE start-beslut, restart bara bakom
//    grinden, kort kooldown sparas i felgrenen ─────────────────────────
{
  const kalla = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "kraschvakt.mjs"), "utf8");
  const loggPos = kalla.indexOf("RÄDDNINGSBYGG MISSLYCKADES:");
  const felStart = loggPos >= 0 ? kalla.lastIndexOf("catch (e) {", loggPos) : -1;
  const felSlut = kalla.indexOf("process.exit(1);", loggPos);
  const felgren = felStart >= 0 && felSlut > felStart ? kalla.slice(felStart, felSlut) : "";
  krav(
    "24 felgrenen ropar verifieraArtefakt + planeraStartEfterMisslyckatBygg",
    felgren.includes("verifieraArtefakt(") && felgren.includes("planeraStartEfterMisslyckatBygg(")
  );
  krav(
    "25 pm2-restart ENDAST bakom if (start.startaPm2) i felgrenen",
    felgren.includes("if (start.startaPm2)") && felgren.indexOf("if (start.startaPm2)") < felgren.indexOf('"pm2 restart ak1a --time"')
  );
  krav(
    "26 felgrenen sparar kort kooldown (120-kvarvarande bussen botad)",
    felgren.includes("sparaState(") && felgren.includes("kooldownMin: start.kooldownMin")
  );
}

// ── F2-ORT-PORTVAKTEN (2026-09-20, prodincident 06:10–06:37 lokal):
//    deploy-omstarten orphande pm2:s gamla app-träd som behöll port 3000
//    — pm2 errored i EADDRINUSE-slinga medan ORTEN svarade 200, såväl
//    prod-synkens HTTPS-kontroll som vaktens okNu mätte grönt mot fel
//    process. Nu: portägaren MÅSTE vara pm2-ättling ────────────────────
krav(
  "27 F2-fallet: ort på 3000 + errored + inget lås → ort-port (reclaim, ALDRIG bygg)",
  planeraOrtvard({ status: "errored", portFinns: true, agarePid: 3410755, agareArPm2Attling: false, lasUpptagen: false }).typ === "ort-port"
);
krav(
  "28 ort doms oavsett pm2-status (online + främman ägare = ändå ort)",
  planeraOrtvard({ status: "online", portFinns: true, agarePid: 123, agareArPm2Attling: false, lasUpptagen: false }).typ === "ort-port"
);
krav(
  "29 frisk: ägaren ÄR pm2-ättling → pass (falska positiva får aldrig störa)",
  planeraOrtvard({ status: "online", portFinns: true, agarePid: 555, agareArPm2Attling: true, lasUpptagen: false }).typ === "pass"
);
krav(
  "30 port fri → pass (övriga vaktlogiken styr)",
  planeraOrtvard({ status: "errored", portFinns: false, agarePid: null, agareArPm2Attling: false, lasUpptagen: false }).typ === "pass"
);
krav(
  "31 ss hemlighåller pid (agarePid null) → pass (försiktigt — omätbart ≠ ort)",
  planeraOrtvard({ status: "errored", portFinns: true, agarePid: null, agareArPm2Attling: false, lasUpptagen: false }).typ === "pass"
);
krav(
  "32 ort + deploy-lås upptaget → vantad-deploy (deployn äger portövertagandet)",
  planeraOrtvard({ status: "errored", portFinns: true, agarePid: 123, agareArPm2Attling: false, lasUpptagen: true }).typ === "vantad-deploy"
);

// ── arAttling (process-trad): ättlingskedjan med injicerbar PPid-läsare ─
const karta = new Map([
  [101, 100], // next-server → sh
  [100, 7],   // sh → pm2:s ak1a-app-pid
  [7, 1],     // ak1a-app → init (pm2-daemonens fäste)
]);
const lasPpidFake = (pid) => (karta.has(pid) ? karta.get(pid) : null);
krav(
  "33 arAttling: next-server(101) är ättling till ak1a(7) via sh(100)",
  arAttling(101, 7, lasPpidFake) === true
);
krav(
  "34 arAttling: främmande process (99, PPid 1) är INTE ättling — F2-ortens signatur",
  arAttling(99, 7, (pid) => (pid === 99 ? 1 : lasPpidFake(pid))) === false
);
krav(
  "35 arAttling: cirkulär kedja (a→b→a) hänger ej (maxDjup bryter)",
  arAttling(1, 999, (pid) => (pid === 1 ? 2 : 1)) === false
);
krav(
  "36 arAttling: borta pid (null-läsning) → false, ej kast",
  arAttling(50, 7, () => null) === false
);

// ── F2-strukturkontrakt (ordagranna, Vaccin-2-mönstret): reclaimen
//    dödar ort-trädet FÖRE pm2-restart, state sparas FÖRE första
//    åtgärden, huvudflödet konsulterar ort-vakten FÖRE kooldown ────────
{
  const kalla = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "kraschvakt.mjs"), "utf8");
  const ortStart = kalla.indexOf("async function ortLakning");
  const ortgren = ortStart >= 0 ? kalla.slice(ortStart, kalla.indexOf("process.exit(frisk && atlingEfter", ortStart)) : "";
  krav(
    "37 ortLakning: state FÖRE åtgärd + döda ort FÖRE pm2-restart (atomitetsdoktrinen)",
    ortgren.indexOf("sparaState(") >= 0 &&
      ortgren.indexOf("dodaDeltrad(") >= 0 &&
      ortgren.indexOf("dodaDeltrad(") < ortgren.indexOf('"pm2 restart ak1a --time"')
  );
  krav(
    "38 huvudflödet: ort-vakten FÖRE kooldown-grenen (120-min kooldown får aldrig blinda ort-läget)",
    (() => {
      const huvudStart = kalla.indexOf("async function huvud()");
      return (
        huvudStart >= 0 &&
        kalla.indexOf("F2-ORTPORTVAKTEN", huvudStart) >= 0 &&
        kalla.indexOf("F2-ORTPORTVAKTEN", huvudStart) < kalla.indexOf("kooldownAktiv(state, nu)", huvudStart)
      );
    })()
  );
}

// ── o125 ÅTERSTÄLLNINGSBEVIS: pass + öppen incident ⇒ grön-rad ─────────
// Bevisat fall: 09-18 22:04/22:07-episoderna (kraschloop-misstanke +
// raddningsbygg-misslyckades) läktes av prod-synkens deploy — vakten
// skrev aldrig grön och larm-eskaleringen bar "aktiv nivå 3" i 41 h.
krav(
  "39 aterställning: ingen flagga → pass (vakten tyst, våg 137-beteende)",
  planeraAterstallning({ okNu: true, status: "online", oknad: 0, incidentOppnar: false }).typ === "pass"
);
krav(
  "40 aterställning: flagga + friskt (svarar+online+oknad 0) → aterstall med grön-meddelande",
  (() => {
    const r = planeraAterstallning({ okNu: true, status: "online", oknad: 0, incidentOppnar: true });
    return r.typ === "aterstall" && r.meddelande.startsWith("ÅTERSTÄLLD:");
  })()
);
krav(
  "41 aterställning: omstarter stiger (oknad 2) → pass — INTE friskt, grön uteblir",
  planeraAterstallning({ okNu: true, status: "online", oknad: 2, incidentOppnar: true }).typ === "pass"
);
krav(
  "42 aterställning: appen svarar ej → pass (annan gren äger läget, grön får aldrig gissa)",
  planeraAterstallning({ okNu: false, status: "online", oknad: 0, incidentOppnar: true }).typ === "pass"
);
krav(
  "43 aterställning: status ej online → pass",
  planeraAterstallning({ okNu: true, status: "errored", oknad: 0, incidentOppnar: true }).typ === "pass"
);
krav(
  "44 aterställning: negativ oknad (state-restarts högre, manuell minskning) → fortfarande aterstall",
  planeraAterstallning({ okNu: true, status: "online", oknad: -3, incidentOppnar: true }).typ === "aterstall"
);

// ── o125 strukturkontrakt (ordagranna, Vaccin-2-mönstret): flaggan sätts
//    vid varje larmgren, nollställs ENDAST vid eget verifierat läke, och
//    pass-grenen loggar ÅTERSTÄLLD FÖRE state-spara (död vakten emellan
//    ⇒ harmlös extra grön nästa poll, aldrig tappat bevis) ───────────────
{
  const kalla = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "kraschvakt.mjs"), "utf8");
krav(
  "45 räddningsbygg-beslutet sätter incidentOppnar (atomitet: från beslutets sekund)",
  (() => {
    const f = kalla.indexOf("async function raddningsbygg");
    const s = kalla.indexOf("KRASCHLOOP-MISSTANKE:", f);
    return f >= 0 && s > f && kalla.slice(f, s).includes("incidentOppnar: true");
  })()
);
krav(
  "45b RÄDDNING AVSTYRD (deploy-lås) behåller incidenten öppen — avstyrt beslut är inget läke",
  (() => {
    const s = kalla.indexOf("RÄDDNING AVSTYRD:");
    const e = kalla.indexOf("process.exit(0);", s);
    return kalla.slice(s, e).includes("incidentOppnar: true");
  })()
);
  krav(
    "46 felgrenen behåller incidentOppnar öppen (misslyckat bygg = fortfarande incident)",
    (() => {
      const s = kalla.indexOf("RÄDDNINGSBYGG MISSLYCKADES:");
      const e = kalla.indexOf("process.exit(1);", s);
      return kalla.slice(s, e).includes("incidentOppnar: true");
    })()
  );
  krav(
    "47 RÄDDNING KLAR nollställer endast vid helt läkt (incidentOppnar: !friskEfter)",
    (() => {
      const s = kalla.indexOf("RÄDDNING KLAR: appen svarar=");
      const spara = kalla.lastIndexOf("sparaState(", s);
      return kalla.slice(spara, s).includes("incidentOppnar: !friskEfter");
    })()
  );
  krav(
    "48 PM2-RESTART LÄKTE nollställer (eget läke = eget bevis)",
    (() => {
      const s = kalla.indexOf("PM2-RESTART LÄKTE appen");
      const e = kalla.indexOf("process.exit(0);", s);
      return kalla.slice(s, e).includes("incidentOppnar: false");
    })()
  );
  krav(
    "49 pass-grenen: logga(ÅTERSTÄLLD) FÖRE sparaState (beviset kan aldrig tappas)",
    (() => {
      const s = kalla.indexOf('if (plan.typ === "pass")');
      const e = kalla.indexOf("if (plan.typ === \"vantad-deploy\")", s);
      const gren = kalla.slice(s, e);
      return (
        gren.includes("planeraAterstallning(") &&
        gren.indexOf("logga(aterstall.meddelande)") >= 0 &&
        gren.indexOf("logga(aterstall.meddelande)") < gren.indexOf("sparaState(")
      );
    })()
  );
  krav(
    "50 ortLakning: upptäkt sätter flaggan, reclaim nollställer endast vid frisk+ättling",
    (() => {
      const s = kalla.indexOf("async function ortLakning");
      const e = kalla.indexOf("process.exit(frisk && atlingEfter", s);
      const gren = kalla.slice(s, e);
      return (
        gren.indexOf("incidentOppnar: true") >= 0 &&
        gren.indexOf("incidentOppnar: !(frisk && atlingEfter)") > gren.indexOf("incidentOppnar: true")
      );
    })()
  );
}

// ── Sammanfattning ─────────────────────────────────────────────────────
if (fel.length) {
  console.error(`FALL ${fel.length} av ${fel.length + pass}:\n  - ${fel.join("\n  - ")}`);
  process.exit(1);
}
console.log(`PASS ${pass}/${pass} — kraschvaktens beslutstabell grön (7 feltriggar i loggen kan inte återkomma)`);
