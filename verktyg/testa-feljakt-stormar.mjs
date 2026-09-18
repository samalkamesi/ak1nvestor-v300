#!/usr/bin/env node
/**
 * TESTA FELJÄKT-STORMAR (spår 8, o34; kollisionslager o69) — offline scenariotest
 * Körs: node verktyg/testa-feljakt-stormar.mjs  (exit 0 = alla PASS)
 * Testar kärnorna i feljakt-stormar.mjs: klustrings-, kontext-,
 * familje- och valideringslogiken mot syntetiska data i tempkatalog —
 * aldrig mot den levande journalen. Sektion 6–7: nyckelkontraktet
 * (o69) — kollisionsgrupper, precis dom via bevisHash, legacy bas-dom.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { klustra, hamtaKontext, forslagFamilj, valideraBedomning, lasJsonl, nyckel, bevisHash, effektivNyckel, radEffektivNyckel, kollisionsGrupper, DOMER } from "./feljakt-stormar.mjs";

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

// ── 6. nyckelkontraktet (o69): kollisionsgrupper + precis dom ──────────────
// Speglar o65 §5 F1:s bevisade fall: två fyndrader, identisk (ts, spår,
// fynd), olikt bevis (olika matchrad i bevisfältet).
{
  const A = { ts: "2026-09-17T11:43:04.406Z", "spår": "F5-logg", allvar: "MEDEL", fynd: "prod-synk.log: felmönster på ny rad", bevis: "/misslyckades/i → PATCH-KÖ: lock-commit MISSLYCKADES" };
  const B = { ts: "2026-09-17T11:43:04.406Z", "spår": "F5-logg", allvar: "MEDEL", fynd: "prod-synk.log: felmönster på ny rad", bevis: "/FEL[: ]/ → mål-återarmning FEL 502" };
  const krock = kollisionsGrupper([A, B]);
  kontroll("kollision: gruppen detekteras (basnyckeln, 1 grupp)", krock.size === 1 && krock.has(nyckel(A)));
  kontroll("kollision: bevisHash är 10 hex och skiljer raderna", /^[0-9a-f]{10}$/.test(bevisHash(A)) && bevisHash(A) !== bevisHash(B));
  kontroll("kollision: effektiv nyckel bär #hash-suffix",
    effektivNyckel(A, krock) === `${nyckel(A)}#${bevisHash(A)}` && effektivNyckel(A, krock) !== effektivNyckel(B, krock));

  const oppnaEffektiva = new Set([nyckel(A), `${nyckel(A)}#${bevisHash(A)}`, `${nyckel(A)}#${bevisHash(B)}`]);
  const ledgerEffektiva = new Set();
  const bas = { ...A, dom: "rotkurad", rotorsaka: "r", bevis: "b", protokoll: "o69", domdAv: "test" };
  const precis = { ...bas, bevisHash: bevisHash(A) };
  kontroll("kollision: bas-dom (legacy, utan bevisHash) godtas fortfarande",
    valideraBedomning(bas, oppnaEffektiva, ledgerEffektiva).length === 0);
  kontroll("kollision: precis dom (bevisHash) godtas mot effektiv nyckel",
    valideraBedomning(precis, oppnaEffektiva, ledgerEffektiva).length === 0);
  kontroll("kollision: precis dom vägras när hashen matchar ingen öppen kollisionsrad",
    valideraBedomning({ ...precis, bevisHash: "0000000000" }, oppnaEffektiva, ledgerEffektiva).some((f) => f.includes("bevisHash matchar ingen")));
  kontroll("kollision: felaktigt bevisHash-format vägras med tydligt fel",
    valideraBedomning({ ...precis, bevisHash: "XYZ" }, oppnaEffektiva, ledgerEffektiva).some((f) => f.includes("bevisHash fel format")));
  kontroll("kollision: precis dom vägras om nyckeln redan finns i ledgern (re-dom = ny våg)",
    valideraBedomning(precis, oppnaEffektiva, new Set([`${nyckel(A)}#${bevisHash(A)}`])).some((f) => f.includes("redan i ledgern")));
  kontroll("kollision: radEffektivNyckel härleds ur radens eget bevisHash-fält",
    radEffektivNyckel(precis) === `${nyckel(A)}#${bevisHash(A)}` && radEffektivNyckel(bas) === nyckel(bas));
}

// ── 7. bekrafta end-to-end med kollisionspar i isolerad tempkatalog ───────
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "stormkrock-"));
  const VAKT = path.join(tmp, "vakten");
  fs.mkdirSync(VAKT, { recursive: true });
  const FYNDTEXT = "prod-synk.log: felmönster på ny rad";
  const X1 = { ts: "2026-09-17T11:43:04.406Z", "spår": "F5-logg", allvar: "MEDEL", fynd: FYNDTEXT, bevis: "/misslyckades/i → PATCH-KÖ: lock-commit MISSLYCKADES" };
  const X2 = { ...X1, bevis: "/FEL[: ]/ → mål-återarmning FEL 502" };
  fs.writeFileSync(path.join(VAKT, "feljakt-fynd.jsonl"), [X1, X2].map((f) => JSON.stringify(f)).join("\n") + "\n");
  fs.writeFileSync(path.join(VAKT, "feljakt-bedomningar.jsonl"), "");

  const { execFileSync } = await import("node:child_process");
  const rot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const kör = (args) => {
    try { return { kod: 0, ut: execFileSync("node", [path.join(rot, "verktyg", "feljakt-stormar.mjs"), ...args], { encoding: "utf8", env: process.env }).toString() }; }
    catch (e) { return { kod: e.status ?? 1, ut: String(e.stdout ?? "") }; }
  };

  // precis dom av BÅDA raderna i paret (olika domklasser — kollisionens poäng)
  const bedFil = path.join(tmp, "krock.jsonl");
  fs.writeFileSync(bedFil, [
    { ...X1, dom: "rotkurad", rotorsaka: "patch-köns kedja", bevis: "o50", protokoll: "o69", domdAv: "test", bevisHash: bevisHash(X1) },
    { ...X2, dom: "transient-design", rotorsaka: "deployfönster", bevis: "NY KOD 11:42", protokoll: "o69", domdAv: "test", bevisHash: bevisHash(X2) },
  ].map((r) => JSON.stringify(r)).join("\n") + "\n");

  const torr = kör([`--vaktkatalog=${VAKT}`, "--torr", `--bekrafta=${bedFil}`]);
  kontroll("krock-bekrafta: torrsim 2 GRÖNA (olika domklasser på samma basnyckel)",
    torr.kod === 0 && torr.ut.includes("2 GRÖNA") && torr.ut.includes("SKULLE"));

  const skarp = kör([`--vaktkatalog=${VAKT}`, `--bekrafta=${bedFil}`]);
  const ledgerEfter = lasJsonl(path.join(VAKT, "feljakt-bedomningar.jsonl"));
  kontroll("krock-bekrafta: skarp append av 2 precis-domer, öppet läge 0",
    skarp.kod === 0 && ledgerEfter.length === 2 && skarp.ut.includes("nytt öppet läge: 0"));

  // legacy-vägen på ett nytt par: bas-dom täcker BÅDA raderna (o65:s läge)
  const VAKT2 = path.join(tmp, "vakten2");
  fs.mkdirSync(VAKT2, { recursive: true });
  fs.writeFileSync(path.join(VAKT2, "feljakt-fynd.jsonl"), [X1, X2].map((f) => JSON.stringify(f)).join("\n") + "\n");
  fs.writeFileSync(path.join(VAKT2, "feljakt-bedomningar.jsonl"), "");
  const basFil = path.join(tmp, "bas.jsonl");
  fs.writeFileSync(basFil, JSON.stringify({ ...X1, dom: "rotkurad", rotorsaka: "samma klass båda raderna", bevis: "o65", protokoll: "o69", domdAv: "test" }) + "\n");
  const basKör = kör([`--vaktkatalog=${VAKT2}`, `--bekrafta=${basFil}`]);
  kontroll("krock-bekrafta: bas-dom utan bevisHash godtas och täcker hela paret (läge 0)",
    basKör.kod === 0 && basKör.ut.includes("nytt öppet läge: 0"));

  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log("");
if (misslyckade.length) {
  console.log(`SAMLAD: ${pass} PASS · ${misslyckade.length} FAIL`);
  process.exit(1);
}
console.log(`SAMLAD: ${pass} PASS · 0 FAIL · domklasser ${DOMER.length}`);
