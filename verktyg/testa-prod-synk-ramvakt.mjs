#!/usr/bin/env node
/**
 * TESTSVIT — RAM-VAKTENS BYGGUTRYMME + V235 FABRIKS-SEKVENSERING i prod-synk.mjs
 * ====================================================================
 * DRIFTSBOKEN 2026-09-17 17:42–17:47Z (o53 §4): 17:27/17:37-byggena
 * OMM-dödades när gränssnittsvaktens chrome-cron (~1 GB) + fabrikens
 * barn delade minnet med bygget. V235 (rond 130:s OOM-serie 02:52–03:20Z):
 * 300 MB/barn var underskattat (verklig topp ~0,8–1,1 GB) OCH manifest som
 * föder barn MITT I byggfönstret syns aldrig i ps — därför två lager:
 *   · bedomByggUtrymme: bas (MIN_RAM_MB byggheap) + klassreserv —
 *     chrome-cron levande ⇒ +1024; zcode-barn ⇒ +850/st med cap 4
 *   · lasAktivaFabriksManifest: status "klar" blockerar aldrig; pågår/
 *     vantar-ram/okänd = aktiv (konservativ); ogiltig fil ignoreras;
 *     saknad katalog = fabriken vilar
 *   · korSynk: VÄNTAR-FABRIK skjuter upp byggstart ≤ FABRIKS_VANTE_MAX_MIN
 *     (svältstopp — kedjande manifest svälter aldrig deployer i evighet)
 *   · raknaTungaProcesser: SMALA klasser (o55 F2-läxan) — opåverkad
 * Körning: node verktyg/testa-prod-synk-ramvakt.mjs  (exit 0 = GRÖN)
 */
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raknaTungaProcesser, bedomByggUtrymme, lasAktivaFabriksManifest } from "./prod-synk.mjs";

let pass = 0;
let fail = 0;
const felsakad = [];

function kolla(namn, villkor) {
  if (villkor) {
    pass++;
    console.log(`  PASS ${namn}`);
  } else {
    fail++;
    felsakad.push(namn);
    console.log(`  FAIL ${namn}`);
  }
}

console.log("== bedomByggUtrymme: basen (byggheap, oförändrad sedan 10X) ==");
{
  const under = bedomByggUtrymme({ ramMB: 2199, tunga: {} });
  kolla("2199 MB utan tunga klasser → inte ok (basen 2200 kvar)", under.ok === false && under.behovMB === 2200 && under.reservMB === 0);
  const grans = bedomByggUtrymme({ ramMB: 2200, tunga: {} });
  kolla("2200 MB utan tunga klasser → ok (gränsen inklusiv)", grans.ok === true && grans.detalj === "inga tunga klasser");
}

console.log("== reserv: chrome-cron levande (17:42-formeln: bygg + cron) ==");
{
  const behov = bedomByggUtrymme({ ramMB: 3224, tunga: { chrome: 7 } });
  kolla("chrome-klass levande (7 delprocesser = 1 klassreserv) → behov 3224", behov.ok === true && behov.behovMB === 3224 && behov.reservMB === 1024);
  const under = bedomByggUtrymme({ ramMB: 3223, tunga: { chrome: 1 } });
  kolla("3223 MB med chrome-cron → inte ok (bygger inte i OOM-fällan)", under.ok === false && under.behovMB === 3224);
  kolla("detalj nämnar chrome-cron + meddelande bär 17:42-formeln", under.detalj.includes("chrome-cron") && under.meddelande.includes("17:42"));
}

console.log("== reserv: fabrikens zcode-barn (V235: 850/st — dokumenterad topp ~0,8–1,1 GB, cap 4) ==");
{
  const ett = bedomByggUtrymme({ ramMB: 3050, tunga: { zcodeBarn: 1 } });
  kolla("1 zcode-barn → behov 2200+850=3050, gränsen inklusiv ok", ett.ok === true && ett.behovMB === 3050);
  const under = bedomByggUtrymme({ ramMB: 3049, tunga: { zcodeBarn: 1 } });
  kolla("3049 MB med 1 barn → inte ok (nattens 3-barnsläge hade behövt 4750)", under.ok === false && under.detalj.includes("1 zcode-barn"));
  const tva = bedomByggUtrymme({ ramMB: 3900, tunga: { zcodeBarn: 2 } });
  kolla("2 zcode-barn → behov 2200+1700=3900", tva.behovMB === 3900 && tva.ok === true);
  const svarm = bedomByggUtrymme({ ramMB: 5600, tunga: { zcodeBarn: 12 } });
  kolla("cap 4: 12-barnssvärm ⇒ behov 2200+3400=5600 (inte 2200+10200)", svarm.behovMB === 5600 && svarm.ok === true);
}

console.log("== kombination + fail-open ==");
{
  const kombi = bedomByggUtrymme({ ramMB: 4924, tunga: { chrome: 2, zcodeBarn: 2 } });
  kolla("chrome + 2 barn adderas: 2200+1024+1700=4924", kombi.behovMB === 4924 && kombi.ok === true && kombi.detalj.includes("chrome-cron levande (+1024)") && kombi.detalj.includes("2 zcode-barn (+1700)"));
  const omatbart = bedomByggUtrymme({ ramMB: null, tunga: { chrome: 1 } });
  kolla("ramMB null ⇒ ok (fail-open — målfel vårdar aldrig deployer i evighet)", omatbart.ok === true);
  const saknad = bedomByggUtrymme({ ramMB: 100, tunga: undefined });
  kolla("tunga undefined → togs som 0/0 (basen gäller)", saknad.behovMB === 2200 && saknad.ok === false);
}

console.log("== V235: lasAktivaFabriksManifest — statuskatalogens kontrakt ==");
{
  const kat = mkdtempSync(path.join(tmpdir(), "v235-status-"));
  try {
    const klar = path.join(kat, "klar.json");
    writeFileSync(klar, JSON.stringify({ id: "a-klar", status: "klar", klara: [] }));
    mkdirSync(path.join(kat, "sub"), { recursive: true }); // störningar: underkatalog + icke-json + ogiltig json
    writeFileSync(path.join(kat, "anteckning.txt"), "inte json");
    writeFileSync(path.join(kat, "trasig.json"), "{ ogiltig");
    const pagar = path.join(kat, "pagaar.json");
    writeFileSync(pagar, JSON.stringify({ id: "auto-s9-x", status: "pågår", klara: [] }));
    const vantar = path.join(kat, "vantar.json");
    writeFileSync(vantar, JSON.stringify({ id: "auto-s9-y", status: "vantar-ram" }));

    const m = lasAktivaFabriksManifest(kat);
    kolla("klar blockerar ALDRIG; pågår + vantar-ram = 2 aktiva; txt/trasig/underkatalog ignoreras", m.aktiva === 2 && m.ids.includes("auto-s9-x") && m.ids.includes("auto-s9-y") && !m.ids.includes("a-klar"));
    const okand = path.join(kat, "okand-status.json");
    writeFileSync(okand, JSON.stringify({ id: "auto-s9-z", status: "framtida-tillstand" }));
    const m2 = lasAktivaFabriksManifest(kat);
    kolla("OKÄND status räknas aktiv (konservativ — får aldrig missas)", m2.aktiva === 3 && m2.ids.includes("auto-s9-z"));
    const vilar = lasAktivaFabriksManifest(path.join(kat, "finns-ej"));
    kolla("saknad katalog → 0 aktiva (fabriken vilar, fail-open)", vilar.aktiva === 0 && vilar.ids.length === 0);
  } finally {
    try { rmSync(kat, { recursive: true, force: true }); } catch { /* tmp */ }
  }
}

console.log("== raknaTungaProcesser: smala klasser mot serverns processverklighet (o55 F2) ==");
{
  const rader = [
    "/opt/google/chrome/chrome --headless=new --no-sandbox about:blank",
    "/home/ak1a/.cache/puppeteer/chrome-headless-shell/headless_shell --remote-debugging-pipe",
    "chromium --headless --dump-dom https://lab.ak1nvestor.com/",
    "node /home/ak1a/.zcode/cli/zcode.js --mode=agent",
    "/usr/bin/node /home/ak1a/.zcode/cli/plugins/node-repl-mcp/server.mjs",
    // ── F2-klassens bevisade falska vänner — NONE får träffa:
    "npm run start",                       // pm2 'ak1a' bär detta DAGLIGEN
    "next start",                          // pm2-barnet
    "node /home/ak1a/AK1/verktyg/pumpor-daemon.mjs", // repots egna verktyg (ingen .zcode-väg)
    "bash -c npm ci --no-audit --no-fund", // fabriksprompters regeltext i cmdlinen
    "grep chrome /var/log/syslog",         // första token = grep, ej körbar chrome
    "vi /home/ak1a/AK1/verktyg/chrome-anteckning.txt",
  ];
  const k = raknaTungaProcesser(rader);
  kolla("chrome-klassen: chrome+headless_shell+chromium = 3, ALDRIG npm/next/grep/vi", k.chrome === 3);
  kolla("zcode-klassen: .zcode-sökvägar = 2, repots verktyg = 0", k.zcodeBarn === 2);
  const tomt = raknaTungaProcesser([]);
  const noll = raknaTungaProcesser(null);
  kolla("tom/null-inmatning → 0/0 (fail-open)", tomt.chrome === 0 && tomt.zcodeBarn === 0 && noll.chrome === 0 && noll.zcodeBarn === 0);
}

console.log("== strukturkontrakt (ordagranna mot prod-synk.mjs-källan) ==");
{
  const kalla = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "prod-synk.mjs"), "utf8");
  const steg2 = kalla.indexOf("// 2) RAM-VAKT");
  const steg3 = kalla.indexOf("// 3) rent träd");
  const zon = steg2 >= 0 && steg3 > steg2 ? kalla.slice(steg2, steg3) : "";
  kolla("RAM-vaktssteget ropar raknaTungaProcesser + bedomByggUtrymme", zon.includes("raknaTungaProcesser(") && zon.includes("bedomByggUtrymme("));
  kolla("VÄNTAR-RAM-loggen bär behov + reserv (vaktkön läser formatet)", zon.includes("${utrymme.behovMB}") && zon.includes("${utrymme.reservMB}") && zon.includes("VÄNTAR-RAM"));
  kolla("V235: steg 2b ropar lasAktivaFabriksManifest + VÄNTAR-FABRIK + svältstopp", zon.includes("lasAktivaFabriksManifest(") && zon.includes("VÄNTAR-FABRIK") && zon.includes("FABRIKS_VANTE_MAX_MIN"));
  kolla("konstanterna dokumenterade vid deklarationen (850 = V235-rättningen)", kalla.includes("RAM_RESERV_MB = { chrome: 1024, zcodeBarn: 850 }") && kalla.includes("const FABRIKS_VANTE_MAX_MIN = 30"));
}

// ── Sammanfattning ─────────────────────────────────────────────────────
if (fail) {
  console.error(`\nFALL ${fail} av ${fail + pass}:\n  - ${felsakad.join("\n  - ")}`);
  process.exit(1);
}
console.log(`\nPASS ${pass}/${pass} — RAM-vakten räknar byggheap + tunga klasser (850/barn) OCH V235-fabrikssekvensering med svältstopp`);
