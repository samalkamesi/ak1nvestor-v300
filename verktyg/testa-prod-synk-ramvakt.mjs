#!/usr/bin/env node
/**
 * TESTSVIT — RAM-VAKTENS BYGGUTRYMME i prod-synk.mjs (vaccin 3, spår 8)
 * ====================================================================
 * DRIFTSBOKEN 2026-09-17 17:42–17:47Z (o53 §4): 17:27/17:37-byggena
 * OMM-dödades när gränssnittsvaktens chrome-cron (~1 GB) + fabrikens
 * barn delade minnet med bygget — "RAM-vaktens tröskel bör räkna med
 * byggheap + cron, inte bara ledig RAM". Svitens kontrakt:
 *   · bedomByggUtrymme: bas (MIN_RAM_MB byggheap) + klassreserv —
 *     chrome-cron levande ⇒ +1024; zcode-barn ⇒ +300/st med cap 4;
 *     kombinationer adderas; ramMB null ⇒ ok (fail-open, oförändrat)
 *   · raknaTungaProcesser: SMALA klasser (o55 F2-läxan) — chrome-klassen
 *     matchar endast första token (körbara filen), zcode-klassen kräver
 *     ".zcode"-sökväg i args; pm2:s "next start", "npm ci"-prompterrader
 *     och "grep chrome" kan ALDRIG träffa
 *   · strukturkontrakt (ordagranna): korSynk ropar raknaTungaProcesser +
 *     bedomByggUtrymme i RAM-vaktssteget och VÄNTAR-RAM-loggen bär
 *     behov + reserv
 * Körning: node verktyg/testa-prod-synk-ramvakt.mjs  (exit 0 = GRÖN)
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raknaTungaProcesser, bedomByggUtrymme } from "./prod-synk.mjs";

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

console.log("== reserv: fabrikens zcode-barn (300/st, cap 4) ==");
{
  const tva = bedomByggUtrymme({ ramMB: 2800, tunga: { zcodeBarn: 2 } });
  kolla("2 zcode-barn → behov 2200+600=2800, gränsen inklusiv ok", tva.ok === true && tva.behovMB === 2800);
  const under = bedomByggUtrymme({ ramMB: 2799, tunga: { zcodeBarn: 2 } });
  kolla("2799 MB med 2 barn → inte ok", under.ok === false && under.detalj.includes("2 zcode-barn"));
  const svarm = bedomByggUtrymme({ ramMB: 3400, tunga: { zcodeBarn: 12 } });
  kolla("cap 4: 12-barnssvärm ⇒ behov 2200+1200=3400 (inte 5800)", svarm.behovMB === 3400 && svarm.ok === true);
}

console.log("== kombination + fail-open ==");
{
  const kombi = bedomByggUtrymme({ ramMB: 3824, tunga: { chrome: 2, zcodeBarn: 2 } });
  kolla("chrome + 2 barn adderas: 2200+1024+600=3824", kombi.behovMB === 3824 && kombi.ok === true && kombi.detalj.includes("chrome-cron levande (+1024)") && kombi.detalj.includes("2 zcode-barn (+600)"));
  const omatbart = bedomByggUtrymme({ ramMB: null, tunga: { chrome: 1 } });
  kolla("ramMB null ⇒ ok (fail-open — målfel vårdar aldrig deployer i evighet)", omatbart.ok === true);
  const saknad = bedomByggUtrymme({ ramMB: 100, tunga: undefined });
  kolla("tunga undefined → togs som 0/0 (basen gäller)", saknad.behovMB === 2200 && saknad.ok === false);
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
  kolla("konstanterna dokumenterade vid deklarationen", kalla.includes("RAM_RESERV_MB = { chrome: 1024, zcodeBarn: 300 }"));
}

// ── Sammanfattning ─────────────────────────────────────────────────────
if (fail) {
  console.error(`\nFALL ${fail} av ${fail + pass}:\n  - ${felsakad.join("\n  - ")}`);
  process.exit(1);
}
console.log(`\nPASS ${pass}/${pass} — RAM-vakten räknar med byggheap + tunga klasser (vaccin 3, 17:42-OOM:ens formel)`);
