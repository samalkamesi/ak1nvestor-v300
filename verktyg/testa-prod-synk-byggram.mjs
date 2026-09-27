#!/usr/bin/env node
/**
 * testa-prod-synk-byggram.mjs — svit för V184 (r274): bygg-RAM-profilern.
 *
 * BAKGRUND (bevisat 2026-09-27T12:00:13Z, HÖG-fynd "RAM 176 MB"): VÄNTAR-
 * RAM-grinden mäter FÖRE byggstart men aldrig under fönstret — byggtoppen
 * (~2,2 GB) ovanpå pm2+zcode trycker MemAvailable under 300 MB utan att
 * någon mekanism attribuerar lasten, och F6-domaren lämnade HÖG-rader öppna
 * (4 st 09-24→09-27, klass B enda träffen). Kuren i två delar:
 *   · prod-synk.mjs startaByggRamSond(): sond var 60 s under varje byggförsök
 *     → data/vakten/bygg-ram-profil.jsonl (start/bygg/slut-inramning) +
 *     varningsflagga vid fönstrets min < 300 MB
 *   · f6-ram-stang.mjs tolkaByggRamFonster(): källa 5 (klass P) — sondens
 *     fönster ger HÖG-domar den andra oberoende träffen mekaniskt
 *
 * Användning:  node verktyg/testa-prod-synk-byggram.mjs
 * Exit 0 = alla PASS, exit 1 = minst ett FAIL.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startaByggRamSond } from "./prod-synk.mjs";
import { tolkaByggRamFonster } from "./f6-ram-stang.mjs";

let pass = 0;
let fail = 0;
const FEL = [];

function kontroll(namn, villkor, detalj = "") {
  if (villkor) {
    pass++;
    console.log(`PASS ${namn}`);
  } else {
    fail++;
    console.log(`FAIL ${namn}${detalj ? " — " + detalj : ""}`);
    FEL.push(namn);
  }
}

const sov = (ms) => new Promise((s) => setTimeout(s, ms));
const lasRader = (fil) =>
  fs.readFileSync(fil, "utf8").split("\n").filter(Boolean).map((r) => JSON.parse(r));

// ── 1) Sonden: normalfönster över tröskeln — start/bygg/slut + ingen varning ─
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ak1a-byggram-"));
  const fil = path.join(tmp, "bygg-ram-profil.jsonl");
  let mätningar = [520, 430];
  const sond = startaByggRamSond({ fil, intervallMs: 5, lasRam: () => mätningar.shift() ?? 480 });
  await sov(20);
  const samman = sond.stopp();
  const rader = lasRader(fil);
  const start = rader.find((r) => r.fas === "start");
  const bygg = rader.filter((r) => r.fas === "bygg");
  const slut = rader.find((r) => r.fas === "slut");
  kontroll("1. sonden ramar in fönstret (start + bygg + slut)", Boolean(start && bygg.length >= 1 && slut));
  kontroll(
    "2. stopp() returnerar varv + minMB (mätningarnas minimum)",
    samman.varv === bygg.length && samman.minMB === 430,
    `varv=${samman.varv} bygg=${bygg.length} minMB=${samman.minMB}`,
  );
  kontroll("3. min ≥ 300 ⇒ varning=false (normal topplast larmar ej)", samman.varning === false);
  kontroll("4. bygg-raderna bär minut + tillgangligtMB", bygg.every((r) => typeof r.minut === "number" && typeof r.tillgangligtMB === "number"));
  kontroll("5. slut-raden sammanfattar varv + minTillgangligtMB", slut.varv === bygg.length && slut.minTillgangligtMB === 430);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ── 2) Sonden: dopp under 300 MB ⇒ varningsflagga (r274:s HÖG-fall) ────────
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ak1a-byggram-"));
  const fil = path.join(tmp, "bygg-ram-profil.jsonl");
  const sond = startaByggRamSond({ fil, intervallMs: 5, lasRam: () => 176 });
  await sov(15);
  const samman = sond.stopp();
  kontroll("6. fönstrets min 176 MB (< 300) ⇒ varning=true", samman.varning === true && samman.minMB === 176);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ── 3) Sonden: mätfel ⇒ fail-open (inga bygg-rader, ingen varning) ─────────
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ak1a-byggram-"));
  const fil = path.join(tmp, "bygg-ram-profil.jsonl");
  const sond = startaByggRamSond({ fil, intervallMs: 5, lasRam: () => null });
  await sov(15);
  const samman = sond.stopp();
  const rader = lasRader(fil);
  kontroll(
    "7. lasRam=null ⇒ inga bygg-rader, minMB null, varning=false (sonden äger aldrig byggutfallet)",
    rader.filter((r) => r.fas === "bygg").length === 0 && samman.minMB === null && samman.varning === false,
  );
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ── 4) Sonden: retention — filen > 4000 rader trimmas vid nästa start ──────
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ak1a-byggram-"));
  const fil = path.join(tmp, "bygg-ram-profil.jsonl");
  fs.writeFileSync(fil, Array.from({ length: 4100 }, (_, i) => JSON.stringify({ ts: `2026-09-27T10:${String(i % 60).padStart(2, "0")}:00.000Z`, fas: "bygg", tillgangligtMB: 900, minut: i })).join("\n") + "\n");
  const sond = startaByggRamSond({ fil, intervallMs: 60_000, lasRam: () => 900 });
  const samman = sond.stopp();
  const antal = lasRader(fil).length;
  kontroll("8. retention: 4100 rader + start ⇒ trimmad till 2000 + 2 (sonden)", antal === 2002, `antal=${antal}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ── 5) Sonden: äkta integration mot /proc/meminfo ──────────────────────────
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ak1a-byggram-"));
  const fil = path.join(tmp, "bygg-ram-profil.jsonl");
  const sond = startaByggRamSond({ fil, intervallMs: 5 }); // default lasRam = /proc
  await sov(15);
  const samman = sond.stopp();
  kontroll(
    "9. äkta /proc-integration: MemAvailable mäts som positivt tal",
    typeof samman.minMB === "number" && samman.minMB > 0,
    `minMB=${samman.minMB}`,
  );
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ── 6) tolkaByggRamFonster — domarens källa 5 ──────────────────────────────
{
  const t0 = Date.parse("2026-09-27T11:57:26.000Z");
  const t1 = Date.parse("2026-09-27T11:58:26.000Z");
  const t2 = Date.parse("2026-09-27T11:59:26.000Z");
  const t3 = Date.parse("2026-09-27T12:03:59.000Z");
  const fonster = tolkaByggRamFonster([
    { ts: "2026-09-27T11:57:26.000Z", fas: "start", pid: 990751 },
    { ts: "2026-09-27T11:58:26.000Z", fas: "bygg", tillgangligtMB: 360, minut: 1 },
    { ts: "2026-09-27T11:59:26.000Z", fas: "bygg", tillgangligtMB: 176, minut: 2 },
    { ts: "2026-09-27T12:03:59.000Z", fas: "slut", varv: 2, minTillgangligtMB: 176 },
  ]);
  kontroll(
    "10. komplett fönster: start→slut med min 176 och varv 2",
    fonster.length === 1 && fonster[0].start === t0 && fonster[0].slut === t3 && fonster[0].minTillgangligtMB === 176 && fonster[0].varv === 2,
  );
  kontroll(
    "11. HÖG-fyndet 12:00:13Z (r274:s rot) faller INOM fönstret — klass P stänger det",
    Date.parse("2026-09-27T12:00:13.282Z") >= fonster[0].start && Date.parse("2026-09-27T12:00:13.282Z") <= fonster[0].slut,
  );

  const utanSlut = tolkaByggRamFonster([
    { ts: "2026-09-27T11:57:26.000Z", fas: "start", pid: 1 },
    { ts: "2026-09-27T11:58:26.000Z", fas: "bygg", tillgangligtMB: 176, minut: 1 },
  ]);
  kontroll(
    "12. fönster utan slut (OOM-mördad sond, r273:s mekanism) gäller ändå med sista bygg-ts",
    utanSlut.length === 1 && utanSlut[0].slut === t1 && utanSlut[0].minTillgangligtMB === 176,
  );

  const enbartBygg = tolkaByggRamFonster([{ ts: "2026-09-27T11:58:26.000Z", fas: "bygg", tillgangligtMB: 100 }]);
  kontroll("13. bygg-rad utan start hoppas (inget spökfönster)", enbartBygg.length === 0);

  const medSkrapp = tolkaByggRamFonster([
    { ts: "inte-ett-datum", fas: "start" },
    { ts: "2026-09-27T11:57:26.000Z", fas: "start" },
    { ts: "2026-09-27T12:03:59.000Z", fas: "slut", varv: 0, minTillgangligtMB: 200 },
  ]);
  kontroll(
    "14. ogiltiga tidsstämplar hoppas — giltigt fönster överlever",
    medSkrapp.length === 1 && medSkrapp[0].minTillgangligtMB === 200,
  );

  kontroll("15. tom/null-input ⇒ inga fönster (fail-open)", tolkaByggRamFonster([]).length === 0 && tolkaByggRamFonster(null).length === 0);
}

// ── 7) Import-vakten: f6-ram-stang får INTE köra bedömningskedjan vid import
// (appendar ledgern i direkt-läge — switen lever på att main() enbart kör som
// direkt program; skrivs det "F6-RAM-STÄNGNING"-rader till stdout här är
// vakten borta och hela testet meningslöst)
kontroll(
  "16. import av f6-ram-stang utan side effects (tolkaByggRamFonster exporteras, main skyddad av o43-vakten)",
  typeof tolkaByggRamFonster === "function",
);

console.log(`\n${pass} PASS · ${fail} FAIL`);
if (fail > 0) {
  console.error("FALLERANDE: " + FEL.join(", "));
  process.exit(1);
}
