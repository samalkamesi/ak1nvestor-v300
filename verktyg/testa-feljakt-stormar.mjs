#!/usr/bin/env node
/**
 * TESTA FELJÄKT-STORMAR (spår 8, o34) — offline scenariotest
 * Körs: node verktyg/testa-feljakt-stormar.mjs  (exit 0 = alla PASS)
 * Testar kärnorna i feljakt-stormar.mjs: klustrings-, kontext-,
 * familje- och valideringslogiken mot syntetiska data i tempkatalog —
 * aldrig mot den levande journalen.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { klustra, hamtaKontext, forslagFamilj, valideraBedomning, lasJsonl, nyckel, DOMER } from "./feljakt-stormar.mjs";

let pass = 0;
const misslyckade = [];
function kontroll(namn, villkor, detalj = "") {
  if (villkor) { pass++; console.log(`PASS ${pass}: ${namn}`); }
  else { misslyckade.push(namn); console.log(`FAIL: ${namn} ${detalj}`); }
}

// ── 1. klustringskärnan ────────────────────────────────────────────────────
{
  const fynd = [
    { ts: "2026-09-15T11:42:04.528Z", spår: "F2-process", fynd: "ak1a = errored" },
    { ts: "2026-09-15T11:42:04.700Z", spår: "F3-api", fynd: "/puls nätverksfel" },
    { ts: "2026-09-15T11:42:04.844Z", spår: "F6-drift", fynd: "prod osvarar" },
    { ts: "2026-09-15T11:53:04.000Z", spår: "F6-drift", fynd: "prod osvarar" }, // 11 min → ny salv
    { ts: "2026-09-16T08:17:05.809Z", spår: "F6-drift", fynd: "prod osvarar — deploybygg pågår" },
  ];
  const salvor = klustra(fynd);
  kontroll("kluster: 3 salvor av 5 fynd vid 10-min-gap", salvor.length === 3, `fick ${salvor.length}`);
  kontroll("kluster: osorterad inmatning sorteras (första salvens start = äldsta)",
    salvor[0].start === "2026-09-15T11:42:04.528Z");
  kontroll("kluster: salv-id serienummeras", salvor.map((s) => s.id).join(",") === "salv-1,salv-2,salv-3");
  kontroll("kluster: gränsfyndet 11:53 hamnar i egen salv", salvor[1].rader.length === 1);
}

// ── 2. kontextkärnan ───────────────────────────────────────────────────────
{
  const logg = [
    "2026-09-15T11:33:16 NY KOD: a → b",
    "2026-09-15T11:38:00 VARNING: deployad men HTTPS ej verifierad",
    "2026-09-15T12:00:00 senare händelse",
  ];
  const inom = hamtaKontext(logg, "2026-09-15T11:42:04.528Z", "2026-09-15T11:42:04.844Z");
  kontroll("kontext: marginal ±15 min fångar 11:33/11:38 men ej 12:00",
    inom.length === 2 && inom[0].includes("11:33:16"));
  const utan = hamtaKontext(logg, "2026-09-15T14:00:00.000Z", "2026-09-15T14:05:00.000Z");
  kontroll("kontext: fönster utanför allt ger tomt", utan.length === 0);
}

// ── 3. familjeförslaget (heuristik dokumenterad i filhuvudet) ─────────────
{
  kontroll("familj: deploybygg-märke i fyndtext vinner",
    forslagFamilj({ start: "2026-09-16T08:17:05.654Z", slut: "2026-09-16T08:17:05.809Z", rader: [{ fynd: "/puls ej mätbar (deploybygg pågår)", bevis: "" }] }, []).startsWith("deploybygg"));
  kontroll("familj: agentträd-smutsigt känns igen",
    forslagFamilj({ start: "2026-09-16T05:12:48.041Z", slut: "2026-09-16T05:12:48.041Z", rader: [{ fynd: "prod-synk.log: felmönster på ny rad", bevis: "2026-09-16T05:00:34 AGENTARBETSYTA-SYNK MISSLYCKADES (smutsigt träd? åtgärda nästa rond)" }] }, []).includes("agentträd"));
  kontroll("familj: KRASCHLOOP-kontext ger kraschvakt-familj",
    forslagFamilj({ start: "2026-09-15T11:42:04.528Z", slut: "2026-09-15T11:42:04.844Z", rader: [{ fynd: "ak1a = errored", bevis: "" }] }, ["2026-09-15T11:44:04.508Z KRASCHLOOP-MISSTANKE: svarar=false ⇒ RÄDDNINGSBYGG"]).includes("kraschvakt"));
  kontroll("familj: okänd när ingen kontext",
    forslagFamilj({ start: "2026-09-16T16:27:42.701Z", slut: "2026-09-16T16:27:42.701Z", rader: [{ fynd: "RAM 446 MB", bevis: "" }] }, []).startsWith("ram ("));
}

// ── 4. valideringskärnan ───────────────────────────────────────────────────
{
  const oppna = new Set(["2026-09-15T11:42:04.528Z|F2-process|ak1a = errored"]);
  const ledger = new Set(["2026-09-15T11:08:11.714Z|F7-security|admin-nyckel i vakt-loggar!"]);
  const bra = { ts: "2026-09-15T11:42:04.528Z", spår: "F2-process", fynd: "ak1a = errored", dom: "rotkurad", rotorsaka: "r", bevis: "b", protokoll: "p", domdAv: "våg" };
  kontroll("validering: komplett rad mot öppet fynd godtas", valideraBedomning(bra, oppna, ledger).length === 0);
  kontroll("validering: ogiltig domklass vägras", valideraBedomning({ ...bra, dom: "strunt" }, oppna, ledger).some((f) => f.includes("okänd domklass")));
  kontroll("validering: änkel (inget matchande öppet fynd) vägras", valideraBedomning({ ...bra, fynd: "finns ej" }, oppna, ledger).some((f) => f.includes("inget ÖPPET")));
  kontroll("validering: redan bedömd nyckel vägras",
    valideraBedomning({ ...bra, ts: "2026-09-15T11:08:11.714Z", spår: "F7-security", fynd: "admin-nyckel i vakt-loggar!" }, oppna, ledger).some((f) => f.includes("redan i ledgern")));
  kontroll("validering: saknat bevis-fält vägras", valideraBedomning({ ...bra, bevis: "" }, oppna, ledger).some((f) => f.includes("saknar bevis")));
}

// ── 5. bekrafta-läget end-to-end mot isolerad tempkatalog ─────────────────
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "stormtest-"));
  const VAKT = path.join(tmp, "vakten");
  fs.mkdirSync(VAKT, { recursive: true });
  fs.writeFileSync(path.join(VAKT, "feljakt-fynd.jsonl"),
    JSON.stringify({ ts: "2026-09-16T10:00:00.000Z", spår: "F6-drift", allvar: "MEDEL", fynd: "prod osvarar", bevis: "" }) + "\n");
  fs.writeFileSync(path.join(VAKT, "feljakt-bedomningar.jsonl"), "");

  const bedFil = path.join(tmp, "b.jsonl");
  fs.writeFileSync(bedFil, JSON.stringify({ ts: "2026-09-16T10:00:00.000Z", spår: "F6-drift", fynd: "prod osvarar", dom: "transient-design", rotorsaka: "deployfönster", bevis: "prod-synk NY KOD 09:59", protokoll: "o34", domdAv: "test" }) + "\n");

  const { execFileSync } = await import("node:child_process");
  const rot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const kör = (args) => {
    try { return { kod: 0, ut: execFileSync("node", [path.join(rot, "verktyg", "feljakt-stormar.mjs"), ...args], { encoding: "utf8", env: process.env }).toString() }; }
    catch (e) { return { kod: e.status ?? 1, ut: String(e.stdout ?? "") }; }
  };

  const torr = kör([`--vaktkatalog=${VAKT}`, "--torr", `--bekrafta=${bedFil}`]);
  kontroll("bekrafta: torrsim exit 0 och SKULLE-rad", torr.kod === 0 && torr.ut.includes("SKULLE"));
  kontroll("bekrafta: torrsim skriver INGET till ledgern", lasJsonl(path.join(VAKT, "feljakt-bedomningar.jsonl")).length === 0);

  const skarp = kör([`--vaktkatalog=${VAKT}`, `--bekrafta=${bedFil}`]);
  const ledgerEfter = lasJsonl(path.join(VAKT, "feljakt-bedomningar.jsonl"));
  kontroll("bekrafta: skarp körning appendar 1 rad med domdTs", skarp.kod === 0 && ledgerEfter.length === 1 && typeof ledgerEfter[0].domdTs === "string");
  kontroll("bekrafta: nytt öppet läge rapporteras som 0", skarp.ut.includes("nytt öppet läge: 0"));

  const igen = kör([`--vaktkatalog=${VAKT}`, `--bekrafta=${bedFil}`]);
  kontroll("bekrafta: samma rad igen FROSTAS (redan i ledgern) och exit ≠ 0",
    igen.kod !== 0 && igen.ut.includes("redan i ledgern") && lasJsonl(path.join(VAKT, "feljakt-bedomningar.jsonl")).length === 1);

  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log("");
if (misslyckade.length) {
  console.log(`SAMLAD: ${pass} PASS · ${misslyckade.length} FAIL`);
  process.exit(1);
}
console.log(`SAMLAD: ${pass} PASS · 0 FAIL · domklasser ${DOMER.length}`);
