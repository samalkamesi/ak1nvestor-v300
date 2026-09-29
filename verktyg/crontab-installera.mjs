#!/usr/bin/env node
/**
 * CRONTAB-INSTALLATÖREN (v212(c) r331 — installatörsskyddet)
 * =====================================================================
 * DEN SANNA VÄGEN att lägga rader i användar-crontaben. Roten till
 * 2026-09-29:s massförlust (r328): en installatör ERSATT hela crontaben
 * med sina egna rader i stället för att APPEND:a — nattens DR-kedja dog.
 * Detta verktyg gör den felförloppsklassen omöjlig:
 *
 *   1. APPEND-ALDRIG-ERSÄTT — befintliga rader (även kommentarer och
 *      okända rader) kopieras orörda; nya rader läggs SIST.
 *   2. BACKUP FÖRE ÄNDRING — /tmp/crontab-install-backup-<ts>.txt
 *      (u5-installatörens mönster, nu mekaniskt garanterad).
 *   3. REFERENSEN I SAMMA ANROP — varje ny AKTIV rad appendas till
 *      data/infra/konfig-referens/crontab.reference med kommentarblock,
 *      exakt som referensens eget ändringsprotokoll kräver (annars
 *      larmar konfigintegritetsvakten på okända rader vid nästa :x9).
 *   4. IDEMPOTENS — rader som redan finns (radforms-match, platshållare
 *      = joker) hoppas; verktyget kan köras flera gånger utan skada.
 *   5. VERIFIERING EFTERÅT — crontab -l skall innehålla det nya läget;
 *      misslyckande ⇒ utdata + exit 1 (ändringen är fortfarande säker:
 *      append påverkar aldrig befintliga rader).
 *
 * Användning:
 *   node verktyg/crontab-installera.mjs --rad '<cron-schema> <kommando>' \
 *        --beskrivning 'kort vad-radens-gör (våg-referens)'
 *   node verktyg/crontab-installera.mjs --fil sokvag/till/rader.txt \
 *        --beskrivning '...'           # filen: kommentarer + aktiva rader
 *   --torr = plan utan ändring (exit 0)
 *
 * Test-yta (ALDRIG mot äkta crontab): AK1A_CRONTAB_BIN (emulator) +
 * AK1A_CRONTAB_REF (testreferens) + AK1A_INSTALL_TMP (tmp-katalog).
 * Fabriksbarn och vågs-installatörer styrs hit via agentfabrik-prefixet
 * och crontab.reference:s INSTALLATÖRSPROTOKOLL.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CRONTAB_BIN = process.env.AK1A_CRONTAB_BIN || "crontab";
const CRONTAB_REF = process.env.AK1A_CRONTAB_REF || path.join(ROT, "data", "infra", "konfig-referens", "crontab.reference");
const TMP = process.env.AK1A_INSTALL_TMP || "/tmp";

function kör(bin, args) {
  let r = spawnSync(bin, args, { timeout: 30_000, encoding: "utf8" });
  if (r.error && r.error.code === "ENOENT") {
    r = spawnSync("bash", ["-lc", `${bin} ${args.join(" ")}`], { timeout: 30_000, encoding: "utf8" });
  }
  return r;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Referensrad-form (med platshållar-joker) → regex, konfigvaktens logik. */
function radTillRegex(rad) {
  return new RegExp("^" + escapeRegExp(rad).replace(/<[^>]+>/g, ".+?") + "$");
}

// ── argument ──
const argv = process.argv.slice(2);
const raderAttLägga = [];
let beskrivning = "(ingen beskrivning angiven)";
let torr = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--rad") raderAttLägga.push(String(argv[++i] ?? ""));
  else if (argv[i] === "--fil") raderAttLägga.push(...fs.readFileSync(String(argv[++i]), "utf8").split("\n").map(r => r.replace(/\r$/, "").trimEnd()).filter(r => r.trim().length > 0));
  else if (argv[i] === "--beskrivning") beskrivning = String(argv[++i] ?? beskrivning);
  else if (argv[i] === "--torr") torr = true;
  else {
    console.error(`okänt argument: ${argv[i]} (se --huvud i filkällan)`);
    process.exit(1);
  }
}
if (raderAttLägga.length === 0) {
  console.error("inget att installera: ge --rad '...' eller --fil <sökväg>");
  process.exit(1);
}

// ── 1. läs nuläge ──
const nuläge = kör(CRONTAB_BIN, ["-l"]);
if (nuläge.error || nuläge.status !== 0) {
  console.error(`crontab -l misslyckades (${nuläge.error?.code ?? "exit=" + nuläge.status}) — verktyget vägrar utan läsbart nuläge`);
  process.exit(1);
}
const befintligaRå = String(nuläge.stdout ?? "").replace(/\n*$/, "\n");
const befintligaAktiva = befintligaRå.split("\n").filter(r => r.trim() && !r.trim().startsWith("#")).map(r => r.trim());

// ── 2. idempotens-filter ──
const nya = [];
const hoppade = [];
for (const rå of raderAttLägga) {
  const rad = rå.trim();
  const aktiv = rad.length > 0 && !rad.startsWith("#");
  if (!rad) continue;
  if (aktiv && befintligaAktiva.some(b => radTillRegex(rad).test(b) || radTillRegex(b).test(rad))) {
    hoppade.push(rad);
    continue;
  }
  nya.push(rad);
}
if (nya.length === 0) {
  console.log(`IDEMPOTENT — alla ${raderAttLägga.length} rad(er) finns redan (radforms-match); inget ändrat.`);
  process.exit(0);
}

const nyaAktiva = nya.filter(r => !r.startsWith("#"));
console.log(`Plan: APPEND ${nya.length} rad(er) (${nyaAktiva.length} aktiva) · hoppar ${hoppade.length} befintliga · befintlig crontab ${befintligaAktiva.length} aktiva rader kopieras ORÖRDA.`);
if (torr) {
  console.log("TORRKÖRNING — inget skrivet:");
  nya.forEach(r => console.log("  + " + r));
  process.exit(0);
}

// ── 3. backup + ny fil + applicering ──
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const backup = path.join(TMP, `crontab-install-backup-${ts}.txt`);
const nyFil = path.join(TMP, `crontab-install-ny-${ts}.txt`);
fs.writeFileSync(backup, befintligaRå);
fs.writeFileSync(nyFil, befintligaRå + nya.join("\n") + "\n");
const app = kör(CRONTAB_BIN, [nyFil]);
if (app.error || app.status !== 0) {
  console.error(`APPLICERING MISSLYCKADES (${app.error?.code ?? "exit=" + app.status}) — äkta crontab ORÖRD (inget skedde); backup: ${backup}`);
  process.exit(1);
}

// ── 4. verifiering ──
const efter = kör(CRONTAB_BIN, ["-l"]);
const efterAktiva = String(efter.stdout ?? "").split("\n").filter(r => r.trim() && !r.trim().startsWith("#")).map(r => r.trim());
const saknadeNya = nyaAktiva.filter(r => !efterAktiva.some(b => radTillRegex(r).test(b) || radTillRegex(b).test(r)));
if (befintligaAktiva.some(b => !efterAktiva.includes(b))) {
  console.error("VERIFIERINGSFEL: en befintlig rad saknas efteråt — APPEND-kontraktet brutet! Backup: " + backup);
  process.exit(1);
}
if (saknadeNya.length > 0) {
  console.error(`VERIFIERINGSFEL: ${saknadeNya.length} ny(a) rad(er) kom ej med — backup: ${backup}`);
  process.exit(1);
}

// ── 5. referensen i samma anrop ──
if (nyaAktiva.length > 0) {
  const block = [
    "",
    `# ── Rad (installatör ${ts}): ${beskrivning} ──`,
    "# Tillagd via verktyg/crontab-installera.mjs (append-aldrig-ersätt, v212(c) r331",
    "# — roten till 2026-09-29:s massförlust var en ersätt-installatör).",
    ...nyaAktiva,
  ].join("\n");
  fs.appendFileSync(CRONTAB_REF, block + "\n");
  console.log(`crontab.reference: +${nyaAktiva.length} rad(er) med kommentarblock (ändringsprotokollet följt i samma anrop).`);
}

console.log(`KLAR — crontab ${efterAktiva.length} aktiva rader (varav ${nyaAktiva.length} nya) · backup: ${backup}`);
console.log("Nästa :x9 (konfigintegritetsvakten) verifierar helheten — den kan AUTO-LÄKA om referensen skulle sakna något.");
process.exit(0);
