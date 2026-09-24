#!/usr/bin/env node
/**
 * AK1A — o155 (Spår 7, s7-u2): FRISTÅENDE VAKTAD EFTER-KÖRNING av
 * natt-TBT-mätaren. O151 §3:s dom RÖD visade sig lastdominerad (o155 §2) —
 * denna wrapper fångar första TYSTA slice inom sitt fönster och kör då det
 * kanoniska mätverktyget i NATT-läge (med lastvakten från o155). Backstopp =
 * natt-cronen 03:27 som alltid äger den kanoniska domfilen.
 *
 * JSON-fakta ENDAST (o144 §10 — bakgrundsprocess bokför ALDRIG): status till
 * data/forskning/OPTIMERING/lighthouse/o155-efter-vakt-status.json; dom av
 * levande våg enligt o151 §3 / o155 §5.
 *
 * Användning: nohup node verktyg/_s7u2o155-efter-vakt.mjs &
 * Exit: 0 = dom levererad (grön ELLER röd — domen äger siffran) ·
 *       2 = fönster slut utan tyst slice · 3 = pipelinefel.
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const FÖRSÖK = 5;
const MELLAN_MS = 10 * 60_000;
const NAMN = "o155-efter-vakt";
const STATUSFIL = "data/forskning/OPTIMERING/lighthouse/o155-efter-vakt-status.json";

const status = { start: new Date().toISOString(), forsok: [], klar: false };
function spara(extra) {
  Object.assign(status, extra || {});
  writeFileSync(STATUSFIL, JSON.stringify(status, null, 2));
}

const deployfönster = () =>
  new Promise((res) => {
    const p = spawn("bash", ["-c", "fuser /tmp/ak1a-deploy.lock >/dev/null 2>&1 && echo ja || echo nej"]);
    let ut = "";
    p.stdout.on("data", (d) => (ut += d));
    p.on("close", () => res(ut.trim()));
  });

for (let i = 1; i <= FÖRSÖK; i++) {
  if ((await deployfönster()) === "ja") {
    status.forsok.push({ nr: i, ts: new Date().toISOString(), not: "deployfönster aktivt — hoppat över" });
    spara();
    await new Promise((r) => setTimeout(r, MELLAN_MS));
    continue;
  }
  const kod = await new Promise((res) => {
    const p = spawn("node", ["verktyg/_s7u3o151-natt-tbt.mjs", `--namn=${NAMN}`], { cwd: process.cwd() });
    let ut = "";
    p.stdout.on("data", (d) => (ut += d));
    p.stderr.on("data", (d) => (ut += d));
    p.on("close", (k) => {
      status.forsok.push({ nr: i, ts: new Date().toISOString(), exit: k, svans: ut.split("\n").slice(-4) });
      res(k);
    });
  });
  spara();
  if (kod === 0 || kod === 1) { spara({ klar: true, domfil: `dom-${NAMN}.json` }); process.exit(0); } // dom levererad
  if (kod === 3) { spara({ fel: "pipelinefel" }); process.exit(3); }
  if (i < FÖRSÖK) await new Promise((r) => setTimeout(r, MELLAN_MS)); // kod 2 = RAM/last — nytt försök
}
spara({ not: "fönster slut utan tyst slice — natt-cronen 03:27 är backstopp (o155 §5)" });
process.exit(2);
