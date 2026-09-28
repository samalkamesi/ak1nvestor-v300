#!/usr/bin/env node
/**
 * o558 EFTERVAKT (s7-u3, o165-mönstret) — migreringens prestanda-EFTER,
 * /bolag-familjen: väntar ut deploy-bygget (fc545155, start 18:27:28Z) och
 * ett tyst lastfönster (loadavg1 < 2.5 två poller i rad, 4 kärnor), kör
 * DÅ skroll-CLS-sond + Lighthouse ×3 med CHROME_PATH och domar.
 *
 * Dom-regler (o558-protokollet §5): struktur dom-bar = CLS 0 ×3 +
 * skrollsumma < 0,01 + prod 200; TBT/LCP/poäng = laststämplad referens
 * (natt-cronen 03:27 äger TBT-slutdomen — o158 §6). Vid nätavbrott /
 * deploy på gång: vänta kvar. Tak 4 h, därefter avsluta med status
 * "tidsgrans" (ALDRIG oändlig loop).
 *
 * Användning: setsid nohup node verktyg/_s7u3o558-eftervakt.mjs &
 * Engångsverktyg — städas när dom är bokförd (o165-precedensen).
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, openSync, readFileSync, writeFileSync } from "node:fs";

const LOCK = "/tmp/ak1a-o558-eftervakt.lock";
const DOMFIL = "data/forskning/OPTIMERING/lighthouse/o558-eftervakt-dom.json";
const LOGFIL = "data/vakten/_s7u3o558-eftervakt.log";
const SYNKLOGG = "data/vakten/prod-synk.log";
const CHROME = "/home/ak1a/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome";
const BYGGSTART = "2026-09-28T18:27:28Z";
const TAK_MS = 4 * 60 * 60 * 1000;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
const loadavg = () => Number(readFileSync("/proc/loadavg", "utf8").split(" ")[0]);
const log = (s) => {
  try {
    appendFileSync(LOGFIL, `${new Date().toISOString()} ${s}\n`);
  } catch {}
  console.error(s);
};

// Single-instans: O_EXCL — pågår redan? avsluta tyst.
try {
  openSync(LOCK, "wx");
} catch {
  console.error("vakt pågår redan (lås finns) — avslutar");
  process.exit(0);
}

const deployad = () => {
  if (!existsSync(SYNKLOGG)) return false;
  const rader = readFileSync(SYNKLOGG, "utf8").split("\n");
  for (let i = rader.length - 1; i >= 0; i--) {
    const rad = rader[i];
    if (rad.includes("BYGGER FRÅN")) return false; // pågående/instiftat bygge efter sista DEPLOYAD
    if (rad.includes("DEPLOYAD") && rad > BYGGSTART) return true;
  }
  return false;
};

const prod200 = () => {
  try {
    const kod = execFileSync(
      "curl",
      ["-s", "-o", "/dev/null", "-w", "%{http_code}", "http://localhost:3000/bolag"],
      { encoding: "utf8", timeout: 15000 }
    ).trim();
    return kod === "200";
  } catch {
    return false;
  }
};

const start = Date.now();
let tystaPoller = 0;
let fas = "vantar-deploy";

try {
  while (Date.now() - start < TAK_MS) {
    if (fas === "vantar-deploy") {
      if (deployad()) {
        fas = "vantar-last";
        log("DEPLOYAD-kriterium uppfyllt — väntar tyst last");
      } else {
        await SLEEP(60_000);
        continue;
      }
    }
    if (fas === "vantar-last") {
      const l = loadavg();
      if (l < 2.5) tystaPoller++;
      else tystaPoller = 0;
      log(`last ${l.toFixed(2)} — tysta poller ${tystaPoller}/2`);
      if (tystaPoller >= 2) {
        fas = "mäter";
      } else {
        await SLEEP(60_000);
        continue;
      }
    }
    if (fas === "mäter") {
      if (!prod200()) {
        log("prod inte 200 — avbrott, väntar nytt fönster");
        fas = "vantar-last";
        tystaPoller = 0;
        await SLEEP(60_000);
        continue;
      }
      log("prod 200 — kör skroll-CLS-sond + Lighthouse ×3 (CHROME_PATH)");
      const lastFore = loadavg();
      try {
        execFileSync(
          "node",
          ["verktyg/prestanda-skroll-cls.mjs", "/bolag", "data/forskning/OPTIMERING/lighthouse/skrollcls-o558-bolag.json"],
          { env: { ...process.env, CHROME_PATH: CHROME }, stdio: "inherit", timeout: 120_000 }
        );
      } catch (e) {
        log("skroll-CLS-sond FEL: " + e.message);
      }
      try {
        execFileSync(
          "node",
          ["verktyg/prestanda-lighthouse.mjs", "o558-efter-ren", "/bolag", "/bolag/eqnr-ol", "/data/nyckeltalsguide"],
          { env: { ...process.env, CHROME_PATH: CHROME }, stdio: "inherit", timeout: 540_000 }
        );
      } catch (e) {
        log("lighthouse FEL: " + e.message);
      }
      const lastEfter = loadavg();

      // Läs resultat och doma.
      let skroll = null;
      try {
        skroll = JSON.parse(readFileSync("data/forskning/OPTIMERING/lighthouse/skrollcls-o558-bolag.json", "utf8"));
      } catch {}
      let sammanfattning = null;
      try {
        sammanfattning = JSON.parse(
          readFileSync("data/forskning/OPTIMERING/lighthouse/o558-efter-ren-sammanfattning.json", "utf8")
        );
      } catch {}
      const sidor = (sammanfattning?.sidor || []).map((s) => ({
        sokvag: s.sokvag,
        poang: s.poang ? Math.round(s.poang.prestanda * 100) : null,
        LCP: s.karnmattMs?.LCP ?? null,
        TBT: s.karnmattMs?.TBT ?? null,
        CLS: s.karnmattMs?.CLS ?? null,
      }));
      const clsNoll = sidor.length > 0 && sidor.every((s) => s.CLS === 0);
      const skrollOK = skroll ? skroll.summaShifts < 0.01 : false;
      const dom = {
        ts: new Date().toISOString(),
        protokoll: "o558",
        fas: "klar",
        uppdrag: "migreringens prestanda-EFTER /bolag-familjen (mät före/efter, deploy, prod 200, mätning bokförd)",
        deployEfter: BYGGSTART + " (fc545155-bygget)",
        lastFonster: { lastFore: lastFore, lastEfter: lastEfter, karnor: 4 },
        skroll,
        sidor,
        dom: {
          struktur: clsNoll && skrollOK && prod200() ? "GRÖN" : "RÖD",
          clsNoll,
          skrollOK,
          prod200: prod200(),
          obs: "TBT/LCP/poäng = laststämplad referens (o143 §3); TBT-slutdom ägs av natt-cronen 03:27 (o158 §6)",
        },
        vidare: "Bokför i o558-protokoll §6 + worklog; committa mätfiler + dom.",
      };
      writeFileSync(DOMFIL, JSON.stringify(dom, null, 2));
      log("DOM skriven: " + DOMFIL + " — struktur " + dom.dom.struktur);
      fas = "klar";
      break;
    }
  }
  if (fas !== "klar") {
    writeFileSync(DOMFIL, JSON.stringify({ ts: new Date().toISOString(), protokoll: "o558", fas: "tidsgrans", vidare: "omstart av vakten vid nästa rond" }, null, 2));
    log("tidsgräns — dom-fil med fas tidsgrans");
  }
} finally {
  try {
    if (existsSync(LOCK)) execFileSync("rm", ["-f", LOCK]);
  } catch {}
  process.exit(0);
}
