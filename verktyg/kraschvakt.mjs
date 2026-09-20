#!/usr/bin/env node
// KRASCHLOOP-VAKTEN (våg 137) — bevisat behov 2026-09-13 ~22:12 lokal:
// ak1a fastnade i kraschloop (758 pm2-omstarter; "client reference
// manifest for route /studio does not exist" = korrupt .next efter en
// avbruten/krockad bygg). WEB-VAKTENS pm2-restart kan ALDRIG bota ett
// trasigt bygg — den snurrar bara (758 bevis). Denna vakt räknar
// omstarter mellan körningar: stiger räknaren med ≥4 på 10 min ELLER
// appen svarar inte medan processen är död/errored ⇒ RÄDDNINGSBYGG:
// stopp → rm -rf .next → npm ci + build under deploy-låset → restart →
// verifiera 200. Kooldown efter varje räddning (inte slåss med
// pågående deploy/läkning). State i data/vakten/ (deploy-säkert).
//
// S8-U2-KUREN 2026-09-16 (protokoll OPTIMERING/o24-kraschvakt-feltriggar-s8.md):
// våg 137:s kod triggade vid ENDA misslyckad hälsokoll — loggen
// 09-14→09-15 visar 7 räddningsbygg, ALLA med omstarter +0 och 6/7
// status=online, flest under prod-synkens byggfönster (vakten stoppade
// en levande men långsam app och köade ett ANDRA fullbygge bakom
// deploy-låset; 01:24-fallet rm -rf .next på ett färskt bygge, sedan
// dog vakten hårt utan state-sparning ⇒ re-trigg 02:54). Kur, fyra
// delar:
//   (1) deploy-lås-medvetenhet: är /tmp/ak1a-deploy.lock upptaget görs
//       INGEN räddning — appen lämnas åt deployn som startar om den;
//   (2) designs-anpassat triggvillkor: räddningsBYGG endast vid
//       omstartssnurr (≥4) eller död process (status ≠ online).
//       svarar=false + online = LAST/uppstart: omkolla en gång, sedan
//       pm2-restart (billig) innan något bygge överhuvudtaget;
//   (3) state-atomitet: senasteRaddning sparas FÖRE första åtgärden —
//       en hårt dödad vakt (OOM under bygget, bevis 01:24+11:34) kan
//       aldrig längre orsaka omedelbar re-trigg;
//   (4) nyanserad kooldown: lyckad räddning 120 min, osäkert läge 30,
//       deploy-avvaktran/restart-läkning 20 (f.d. fast 120 som lämnade
//       appen död i 2 h trots "RÄDDNING KLAR: svarar=false", 14:24).
// Beslutstabellen bor i ren funktion planeraAtguard() — exporteras och
// testas av verktyg/testa-kraschvakt.mjs (import skyddas av AR_MAIN).
//
// S8-U2 ÅTERSTÄLLNINGSBEVIS (o125, 2026-09-20): larm-eskaleringen bar 2
// "aktiva nivå 3"-episoder sedan 09-18 22:04 (kraschloop-misstanke +
// raddningsbygg-misslyckades) fast appen var frisk — incidenten läktes
// av prod-synkens deploy, men vakten skriver grön ENDAST via "RÄDDNING
// KLAR"/"PM2-RESTART LÄKTE", dvs bara när VAKTEN själva läkt. En episod
// som annan kanal läker kan aldrig stängas ⇒ eskaleringsskiktet ropar
// "KRITISK (AVSTANNAD) — appkoll påkallad" i all oändlighet (41 h vid
// upptäckten) utan att någon gör appkollen. KUR: state bär incidentOppnar
// (sätts vid varje larmklass-gren, nollställs bara vid verifierat friskt
// eget läke) — och pass-grenen SKRIVER då "ÅTERSTÄLLD: …" som grön-rad.
// Appkollen markeraAvstannade ropar efter finns redan i pollen: den som
// KAN mäta appen (denna vakt) skriver återställningsbeviset. Ärlighet:
// ÅTERSTÄLLD kräver okNu+online+oknad ≤ 0 — stiger omstarter under
// "läkt"-fönstret är läget INTE friskt och grön uteblir.
import { execSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifieraArtefakt } from "./artefakt-verifiering.mjs";
import { hamtaPortagare, arAttling, hittaOrtRot, dodaDeltrad } from "./process-trad.mjs";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.join(ROT, "data", "vakten");
const STATE = path.join(KATALOG, "kraschvakt-state.json");
const LOGG = path.join(KATALOG, "kraschvakt.log");
const DEPLOY_LAS = "/tmp/ak1a-deploy.lock";

function logga(rad) {
  fs.mkdirSync(KATALOG, { recursive: true });
  const ts = new Date().toISOString();
  fs.appendFileSync(LOGG, `${ts} ${rad}\n`);
  console.log(`${ts.slice(11, 19)} ${rad}`);
}
function lasState() {
  try {
    return JSON.parse(fs.readFileSync(STATE, "utf8"));
  } catch {
    return {};
  }
}
function sparaState(s) {
  fs.mkdirSync(KATALOG, { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(s, null, 2));
}

/** pm2 jlist rådata → vaktrad. Särskiljer "saknas" från "pm2 svarade
 * inte" (jlist-timeout vid minnetopplast felrapporterades 2026-09-16
 * 04:04 som "ak1a finns inte i pm2" — vilseledande i felsökning).
 * o125-ROT FYND 2: omstarts Räknare bor i pm2_env.restart_time —
 * pm2 jlist har INGET toppnivåfält (verifierat 2026-09-20: top-level
 * undefined medan pm2_env bar 6 921). Våg 137 läste p.restart_time ⇒
 * restarts blev ALLTID 0 ⇒ oknad alltid +0 ⇒ omstartssnurr-triggern
 * (kärnan, byggd på 09-13:s 758-omstarsloop) har ALDRIG varit kopplad
 * — hela journalen (18 rader) visar "+0", 09-18 räddades av dod-app-
 * grenen (status=errored) som tur var. pm2_env först, toppnivå som
 * fallback för äldre format — aldrig omvänt. */
export function tolkaPm2(lista) {
  const p = (lista ?? []).find((x) => x && x.name === "ak1a");
  if (!p) return { saknas: true };
  return { restarts: p.pm2_env?.restart_time ?? p.restart_time ?? 0, status: p.pm2_env?.status ?? "?" };
}
function ak1aRad() {
  try {
    const lista = JSON.parse(execSync("pm2 jlist", { timeout: 15_000, encoding: "utf8" }));
    // pid läggs till HÄR (inte i tolkaPm2 — dess returform är ett testat
    // kontrakt, testa-kraschvakt.mjs krav 11): F2-ort-vakten behöver
    // ak1a-processens pid för ättlingskontrollen av portägaren.
    const rad = Array.isArray(lista) ? lista.find((x) => x && x.name === "ak1a") : null;
    return { ...tolkaPm2(lista), pid: rad?.pid ?? null };
  } catch {
    return { okand: true };
  }
}

export async function svarar(tidsgransMs = 10_000) {
  try {
    const r = await fetch("http://localhost:3000/", { signal: AbortSignal.timeout(tidsgransMs) });
    return r.status < 500;
  } catch {
    return false;
  }
}

/** Nonblock-test av deploy-låset (samma idiom som feljägaren): true =
 * en deploy/bygg håller låset — vaktens räddning måste vika. */
export function lasUpptagen() {
  try {
    execFileSync("flock", ["-n", DEPLOY_LAS, "-c", "true"], { timeout: 5_000, stdio: "pipe" });
    return false;
  } catch {
    return true;
  }
}

/** Kooldown aktiv? kooldownMin (minuter) nyanseras per utgång — se
 * huvudflödet; default 120 = våg 137:s original. */
export function kooldownAktiv(state, nu = Date.now()) {
  if (!state.senasteRaddning) return false;
  const min = state.kooldownMin ?? 120;
  return nu - state.senasteRaddning < min * 60_000;
}

/** Beslutstabell (ren — ingen IO, testas av testa-kraschvakt.mjs).
 * IN: okNu (hälsokoll 1), status (pm2), oknad (omstartsstegring sedan
 * förra körningen), lasUpptagen (deploy-lås), omkollaSvarar (2:a
 * hälsokollen efter 20 s vila — undefined = inte mätt än).
 * UTFALL:
 *   pass           — friskt, tyst lämnar
 *   transient-koll — svarar=false+online+inget lås: mät en gång till,
 *                    anropa igen med omkollaSvarar
 *   transient      — 2:a kollen grön: last, ingen åtgärd
 *   restart        — 2:a kollen röd men processen lever: pm2-restart
 *                    (billig) innan något bygge
 *   vantad-deploy  — svarar=false och deploy-låset upptaget: vik,
 *                    appen lämnas åt deployn som startar om den
 *   dod-app        — svarar=false + status ≠ online (errored/stopped):
 *                    räddningsbygg (våg 137:s kärna)
 *   omstartssnurr  — oknad ≥ 4: räddningsbygg (våg 137:s kärna) */
export function planeraAtguard({ okNu, status, oknad, lasUpptagen: upptagen, omkollaSvarar }) {
  if (oknad >= 4) return { typ: "omstartssnurr" };
  if (okNu) return { typ: "pass" };
  if (upptagen) return { typ: "vantad-deploy" };
  if (status === "online") {
    if (omkollaSvarar === undefined) return { typ: "transient-koll" };
    return omkollaSvarar ? { typ: "transient" } : { typ: "restart" };
  }
  return { typ: "dod-app" };
}

/** o125-ÅTERSTÄLLNINGSBEVIS (ren — samma mönster som planeraAtguard, testas
 * av testa-kraschvakt.mjs): pass-läge MED öppen incident i state ⇒ grön-rad.
 *   pass       — ingen öppen incident (vakten tyst, våg 137-beteende) ELLER
 *                läget inte helt friskt (svarar ej / ej online / omstarter
 *                stiger) — grön utblir, incidenten får vänta på sitt bevis
 *   aterstall  — incident i state + appen verifierat frisk: logga
 *                "ÅTERSTÄLLD: …" (grön-klass i larm-eskaleringen) och
 *                nollställ flaggan — episoden stängs med eget mätbevis. */
export function planeraAterstallning({ okNu, status, oknad, incidentOppnar }) {
  if (!incidentOppnar) return { typ: "pass" };
  if (okNu && status === "online" && oknad <= 0) {
    return {
      typ: "aterstall",
      meddelande: `ÅTERSTÄLLD: appen svarar=true status=online omstarter +${oknad} — tidigare incidentläke verifierat friskt (grön)`,
    };
  }
  return { typ: "pass" };
}

/** VACCIN 2 (DRIFTSBOKEN 2026-09-17 17:42Z, o53 §4): beslutstabell för
 * misslyckat räddningsbygg. rm -rf .next skedde FÖRE npm ci+build ⇒ ett
 * misslyckat/avbrutet/OOM-dödat bygg lämnar artefakten saknad eller
 * partiell, och pm2-restart mot den = ENOENT-kraschloop som pm2 aldrig
 * hämtar sig från (bevis: ↺ 3 700+, nginx 502 ~5 min). Rätt ordning är
 * stop → bygga KLART → start — ALDRIG bara retry. verifieraArtefakt
 * (o50:s KRITISKA_FILER-kontrakt) är domaren: först när artefakten är
 * restart-bar får appen startas; annars lämnas pm2 stoppad med KORT
 * kooldown (kurens (4) osäkert-läges-doktrin) så nästa poll bygger
 * klart istället för att snurra appen mot saknade manifest. */
export function planeraStartEfterMisslyckatBygg(artefaktStatus) {
  if (artefaktStatus === "gron") {
    return { startaPm2: true, kooldownMin: 30, meddelande: "artefakten hel — appen startas (restart-bar trots byggfelet)" };
  }
  return {
    startaPm2: false,
    kooldownMin: 30,
    meddelande: `artefakt ${artefaktStatus} — pm2 lämnas STOPPAD (restart mot ofullständigt .next = kraschloop, 502-klassen 17:42); kooldown 30 ⇒ nästa poll bygger klart`,
  };
}

/** F2-ORT-PORTVAKTEN (2026-09-20, prodincident 06:10–06:37 lokal): pm2:s
 * gamla app-träd kan överleva en deploy-omstart som föräldralös ort
 * ("sh -c next start -p 3000" → next-server, PPid 1) och behålla port
 * 3000 — pm2 errored i EADDRINUSE-slinga medan ORTEN svarade 200, så
 * såväl prod-synkens HTTPS-kontroll som denna vakts okNu mätte grönt
 * mot fel process (27 min kundsynlig risk: en omstart/OOM hade tyst
 * dödat sajten). Räddningsbygget hade varit verkningslöst — pm2 restart
 * krockar med orten igen. Rätt kur är PORT-RECLAIM: döda ort-trädet +
 * pm2 restart (billigt, artefakten är orörd). Tabellen (ren — samma
 * mönster som planeraAtguard, testas av testa-kraschvakt.mjs):
 *   pass         — port fri/okänd ägare/ägaren ÄR pm2-ättling: övriga
 *                  vaktlogiken styr (falska positiva får aldrig störa)
 *   vantad-deploy — ort men deploy-låset upptaget: vik (samma doktrin
 *                  som övriga grenar — deployn startar appen själv)
 *   ort-port     — reclaim: döda ort-trädet + pm2 restart. */
export function planeraOrtvard({ status, portFinns, agarePid, agareArPm2Attling, lasUpptagen: upptagen }) {
  if (!portFinns) return { typ: "pass" };
  if (agarePid == null) return { typ: "pass" };
  if (agareArPm2Attling) return { typ: "pass" };
  if (upptagen) {
    return { typ: "vantad-deploy", meddelande: `ort pid ${agarePid} på port 3000 men deploy-låset upptaget (status=${status})` };
  }
  return {
    typ: "ort-port",
    meddelande: `port 3000 hålls av ort pid ${agarePid} — inte ättling till pm2:s ak1a (status=${status})`,
  };
}

/** F2-reclaim: döda ort-trädet (cmdline-verifierat via process-trad),
 * pm2 restart, verifiera att porten återtagits av pm2-ättling. ALDRIG
 * bygg — roten är portkidnappningen, artefakten orörd. State sparas
 * FÖRE första åtgärden (samma atomitetsdoktrin som räddningsbygget). */
async function ortLakning(p, state, agarePid, meddelande) {
  sparaState({ ...state, restarts: p.restarts, senasteRaddning: Date.now(), kooldownMin: 20, incidentOppnar: true });
  logga(`ORT-PORT (F2): ${meddelande} ⇒ reclaim: döda ort-trädet + pm2 restart`);
  const rot = hittaOrtRot(agarePid);
  const dodade = await dodaDeltrad(rot);
  logga(`ORT-PORT: ${dodade.length ? `SIGTERM→SIGKILL-trappa mot ${dodade.join(", ")}` : "ort-trädet redan borta"}`);
  try {
    execSync("pm2 restart ak1a --time", { timeout: 60_000, stdio: "ignore" });
  } catch {
    /* pm2 avgör — utfallet döms av verifieringen nedan */
  }
  const frisk = await varm();
  const efter = hamtaPortagare(3000);
  const p2 = ak1aRad();
  const atlingEfter =
    !efter.okand && efter.finnas && efter.pid != null && p2.pid != null && arAttling(efter.pid, p2.pid);
  sparaState({
    ...lasState(),
    restarts: Number.isFinite(p2.restarts) ? p2.restarts : p.restarts,
    senasteRaddning: Date.now(),
    kooldownMin: frisk && atlingEfter ? 120 : 20,
    incidentOppnar: !(frisk && atlingEfter),
  });
  logga(`ORT-RECLAIM KLAR: svarar=${frisk} portägare-är-pm2-ättling=${atlingEfter} (kooldown ${frisk && atlingEfter ? 120 : 20} min)`);
  process.exit(frisk && atlingEfter ? 0 : 1);
}

/** Uppvärmning: nät mätningar à 20 s — första svaret vinner. Nybyggd
 * kall app (ISR) behöver mer än våg 137:s fasta 15 s: 21:34-fallet
 * mätte false vid 15 s men appen svarade vid 21:44. */
export async function varm(forsok = 5) {
  for (let i = 0; i < forsok; i++) {
    if (i > 0) await new Promise((sov) => setTimeout(sov, 20_000));
    if (await svarar(15_000)) return true;
  }
  return false;
}

/** Räddningsbygg (våg 137 oförändrad sekvens) med kurens (1)+(3):
 * lås-respekt FÖRRE pm2 stop, state FÖRRE första åtgärden. */
async function raddningsbygg(p, state, oknadOrsak) {
  // (3) state-atomitet: kooldown gäller från BESLUTET — dör vakten hårt
  // mitt i (OOM 01:24/11:34-bevisen) kan nästa poll aldrig re-trigga.
  // o125: incidentOppnar sätts HÄR (samma atomitetsgaranti) — pass-grenens
  // ÅTERSTÄLLD-grön blir skyldig från beslutets sekund.
  sparaState({ ...state, restarts: p.restarts, senasteRaddning: Date.now(), kooldownMin: 120, incidentOppnar: true });
  if (lasUpptagen()) {
    logga(`RÄDDNING AVSTYRD: deploy-låset upptaget (svarar=false status=${p.status} omstarter +${oknadOrsak}) — appen lämnas åt pågående deploy`);
    // o125: incidenten lever vidare (avstyrda beslut är inget läke) —
    // lasState() plockar beslutssparningens flagga; deployns läke kräver
    // fortfarande pass-grenens ÅTERSTÄLLD-bevis.
    sparaState({ ...lasState(), restarts: p.restarts, senasteRaddning: Date.now(), kooldownMin: 20, incidentOppnar: true });
    process.exit(0);
  }
  logga(`KRASCHLOOP-MISSTANKE: svarar=false status=${p.status} omstarter +${oknadOrsak} ⇒ RÄDDNINGSBYGG`);
  try {
    execSync("pm2 stop ak1a", { timeout: 60_000, stdio: "ignore" });
  } catch {
    /* redan stoppad/errored */
  }
  try {
    execSync(
      `exec flock -w 1200 ${DEPLOY_LAS} bash -c ${JSON.stringify(
        `cd ${JSON.stringify(ROT)} && rm -rf .next && npm ci --no-audit --no-fund --loglevel=error && npm run build`
      )}`,
      { timeout: 1_500_000, stdio: "inherit" }
    );
  } catch (e) {
    // VACCIN 2 (DRIFTSBOKEN 17:42Z): rm -rf .next skedde FÖRE bygger —
    // misslyckat bygg lämnar artefakten saknad/partiell och pm2-restart
    // mot den = ENOENT-kraschloop (↺ 3 700+-beviset). Artefaktgrind FÖRE
    // start + kort kooldown — ALDRIG bara retry.
    const artefakt = await verifieraArtefakt();
    const start = planeraStartEfterMisslyckatBygg(artefakt.status);
    logga(
      `RÄDDNINGSBYGG MISSLYCKADES: ${String(e).slice(0, 120)} — ${start.meddelande} (artefakt: ${artefakt.meddelande.slice(0, 80)})`
    );
    if (start.startaPm2) {
      try {
        execSync("pm2 restart ak1a --time", { timeout: 60_000, stdio: "ignore" });
      } catch {
        /* pm2 avgör */
      }
    }
    sparaState({
      ...lasState(),
      restarts: (ak1aRad() ?? p).restarts ?? p.restarts,
      senasteRaddning: Date.now(),
      kooldownMin: start.kooldownMin,
      incidentOppnar: true,
    });
    process.exit(1);
  }
  // ÄRLIGHETSGRIND (2026-09-16, prodincidentens 10:51-räddning): den
  // byggde om men artefakten blev ÅTER inkomplett, och varm() mätte grön
  // (HTML 200) på ett oläkt läge ⇒ "RÄDDNING KLAR" + 120-min kooldown =
  // 20 min kundsynlig blindhet. Appen STARTAS fortfarande (den är
  // stoppad och servern läser .next från disk oavsett), men friskt döms
  // först när artefaktens kontrakt också är hel — kort kooldown ger
  // nästa poll ett ärligt nytt försök.
  const artefakt = await verifieraArtefakt();
  if (artefakt.status !== "gron") {
    logga(`ARTEFAKT ${artefakt.status.toUpperCase()} efter räddningsbygget — ${artefakt.meddelande} · appen startas men läget är INTE läkt (HTML-200 säger inget om chunks)`);
  }
  try {
    execSync("pm2 restart ak1a --time", { timeout: 60_000, stdio: "ignore" });
  } catch {
    /* pm2 avgör */
  }
  const friskEfter = (await varm()) && artefakt.status === "gron";
  // (4) osäkert läge = KORT kooldown: "RÄDDNING KLAR: svarar=false"
  // (14:24/21:34) lämnade appen oglad i 2 h — nu omprövar nästa poll.
  // o125: incidentOppnar nollställs ENDAST vid HELT läkt läge — annars
  // blir pass-grenens ÅTERSTÄLLD skyldig vid nästa friska poll.
  sparaState({ ...lasState(), restarts: (ak1aRad() ?? p).restarts ?? p.restarts, senasteRaddning: Date.now(), kooldownMin: friskEfter ? 120 : 30, incidentOppnar: !friskEfter });
  logga(`RÄDDNING KLAR: appen svarar=${friskEfter} (kooldown ${friskEfter ? 120 : 30} min; mål: kunden märker max ~10-15 min)`);
  process.exit(friskEfter ? 0 : 1);
}

async function huvud() {
  const state = lasState();
  const nu = Date.now();
  const p = ak1aRad();
  if (p.okand) {
    logga("pm2 jlist svarade inte (timeout?) — försiktigt pass, nästa poll om 10 min");
    process.exit(0);
  }
  if (p.saknas) {
    logga("ak1a finns inte i pm2 — lämnar över till daemonen");
    process.exit(0);
  }

  // F2-ORTPORTVAKTEN: körs FÖRE kooldown-grenen — ort-läget (prod
  // betjänad av en process UTANFÖR pm2:s kontroll) är en egen faroklass;
  // en 120-min kooldown från ett orelaterat räddningsbygg fick aldrig
  // blinka igen (incidentens 27 min). Deploy-låset respekteras alltid —
  // under deployn äger den portövertagandet (vantad-deploy-doktrinen).
  const portagare = hamtaPortagare(3000);
  if (!portagare.okand) {
    const agareArPm2Attling =
      portagare.finnas && portagare.pid != null && p.pid != null ? arAttling(portagare.pid, p.pid) : false;
    const ortplan = planeraOrtvard({
      status: p.status,
      portFinns: portagare.finnas,
      agarePid: portagare.pid ?? null,
      agareArPm2Attling,
      lasUpptagen: lasUpptagen(),
    });
    if (ortplan.typ === "vantad-deploy") {
      logga(`ORT-VAKT: ${ortplan.meddelande} — vik, deployn startar appen`);
      sparaState({ ...state, restarts: p.restarts, senasteRaddning: nu, kooldownMin: 20 });
      process.exit(0);
    }
    if (ortplan.typ === "ort-port") await ortLakning(p, state, portagare.pid, ortplan.meddelande);
  }

  const okNu = await svarar();
  const prevRestarts = typeof state.restarts === "number" ? state.restarts : p.restarts;
  const oknad = p.restarts - prevRestarts;

  // Kooldown efter en tidigare räddning: logga läget, håll räknaren färsk, gå.
  if (kooldownAktiv(state, nu)) {
    logga(
      `kooldown ${Math.round((nu - state.senasteRaddning) / 60000)} min (av ${state.kooldownMin ?? 120}) — svarar=${okNu} status=${p.status} omstarter+${oknad}`
    );
    sparaState({ ...state, restarts: p.restarts });
    process.exit(0);
  }

  const plan = planeraAtguard({ okNu, status: p.status, oknad, lasUpptagen: lasUpptagen() });

  if (plan.typ === "pass") {
    // o125: öppen incident i state + fullt friskt läge ⇒ ÅTERSTÄLLD-grön —
    // appkollen som avstannad-detekten ropar efter, skriven av den som kan
    // mäta appen. Logga FÖRE state-spara: dör vakten emellan blir nästa
    // poll en (harmlös) extra ÅTERSTÄLLD — aldrig ett tappat bevis.
    const aterstall = planeraAterstallning({ okNu, status: p.status, oknad, incidentOppnar: state.incidentOppnar === true });
    if (aterstall.typ === "aterstall") {
      logga(aterstall.meddelande);
      sparaState({ restarts: p.restarts, senasteRaddning: state.senasteRaddning ?? null, kooldownMin: state.kooldownMin ?? null });
      process.exit(0);
    }
    sparaState({ ...state, restarts: p.restarts });
    process.exit(0);
  }
  if (plan.typ === "vantad-deploy") {
    logga(`DEPLOY PÅGÅR (låset upptaget): svarar=false status=${p.status} omstarter +${oknad} — räddning avvaktar, appen startas av deployn`);
    sparaState({ ...state, restarts: p.restarts, senasteRaddning: nu, kooldownMin: 20 });
    process.exit(0);
  }
  if (plan.typ === "transient-koll") {
    await new Promise((sov) => setTimeout(sov, 20_000));
    const omkoll = await svarar(15_000);
    const plan2 = planeraAtguard({ okNu, status: p.status, oknad, lasUpptagen: false, omkollaSvarar: omkoll });
    if (plan2.typ === "transient") {
      logga(`TRANSIENT LAST: svarar=false vid 1:a koll, grön vid 2:a (status=${p.status} omstarter +${oknad}) — ingen åtgärd`);
      sparaState({ ...state, restarts: p.restarts });
      process.exit(0);
    }
    // plan2 = restart: processen lever men svarar två gånger — billig
    // läkning först, state sparat FÖRE åtgärd (atomitet).
    sparaState({ ...state, restarts: p.restarts, senasteRaddning: nu, kooldownMin: 20, incidentOppnar: true });
    logga(`SVARAR INTE 2 GÅNGER men status=online omstarter +${oknad} ⇒ PM2-RESTART (bygge ej motiverat ännu)`);
    try {
      execSync("pm2 restart ak1a --time", { timeout: 60_000, stdio: "ignore" });
    } catch {
      /* pm2 avgör */
    }
    const lakt = await varm();
    if (lakt) {
      logga("PM2-RESTART LÄKTE appen — räddningsbygge onödigt (våg 137-bygget sparat)");
      sparaState({ ...lasState(), restarts: (ak1aRad() ?? p).restarts ?? p.restarts, senasteRaddning: Date.now(), kooldownMin: 20, incidentOppnar: false });
      process.exit(0);
    }
    logga("PM2-RESTART RÄCKTE INTE ⇒ räddningsbygg");
    await raddningsbygg(p, lasState(), oknad);
  }
  // omstartssnurr | dod-app
  await raddningsbygg(p, state, oknad);
}

const AR_MAIN = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (AR_MAIN) await huvud();
