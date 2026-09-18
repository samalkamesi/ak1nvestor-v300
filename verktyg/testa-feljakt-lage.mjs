#!/usr/bin/env node
/**
 * testa-feljakt-lage.mjs (o22; kollisionslager o69) — offline scenariotest för feljakt-lage.mjs
 *
 * Åtta fall mot en fejkad vakt-katalog i /tmp (aldrig äkta data/vakten):
 *   1. bedömt fynd (falskt-pos) lämnar det öppna och hamnar i perDom
 *   2. obemannat fynd förblir ÖPPET ÄKTA
 *   3. öppet HÖG-fynd räknas i oppnaHogaKritiska
 *   4. två bedömningar på samma nyckel — senaste domdTs vinner
 *   5. änkel-bedömning (inget matchande fynd) varnas + ogiltig domklass ignoreras
 *   6. saknad bedömningsfil ⇒ alla fynd öppna (graceful) + ogiltig JSON-rad hoppas över
 *   7. nyckelkollision (o65 §5 F1): precis dom (bevisHash) täcker EN rad —
 *      systerraden förblir öppen; kollisionsgruppen rapporteras
 *   8. legacy bas-dom täcker hela kollisionsparet; precis dom med nyare
 *      domdTs vinner på sin egen rad (precedens: senaste vinner, oavgjot ⇒ precis)
 * Körs: node verktyg/testa-feljakt-lage.mjs  →  PASS x/8 eller FAIL med detalj.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERKTYG = path.join(ROT, "verktyg", "feljakt-lage.mjs");

let pass = 0;
const fail = [];
function kontroll(nr, namn, villkor, detalj) {
  if (villkor) {
    pass++;
    console.log(`PASS ${nr} — ${namn}`);
  } else {
    fail.push(nr);
    console.log(`FAIL ${nr} — ${namn}${detalj ? ` (${detalj})` : ""}`);
  }
}

function kora(katalog) {
  const ut = execFileSync(process.execPath, [VERKTYG, `--vaktkatalog=${katalog}`], {
    encoding: "utf8",
    timeout: 30_000,
  });
  const resultatRad = ut.split("\n").find((r) => r.startsWith("RESULTAT_JSON="));
  const rapportFil = path.join(katalog, "feljakt-lage-SENASTE.json");
  const rapport = fs.existsSync(rapportFil) ? JSON.parse(fs.readFileSync(rapportFil, "utf8")) : null;
  return { ut, resultat: resultatRad ? JSON.parse(resultatRad.slice("RESULTAT_JSON=".length)) : null, rapport };
}

// ── arrangemang ────────────────────────────────────────────────────────────
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "feljakt-lage-test-"));
const F1 = { ts: "2026-09-15T11:08:11.714Z", "spår": "F7-security", allvar: "KRITISK", fynd: "admin-nyckel i vakt-loggar!", bevis: "" };
const F2 = { ts: "2026-09-16T03:00:00.000Z", "spår": "F6-drift", allvar: "HÖG", fynd: "prod osvarar", bevis: "TypeError: fetch failed" };
const F3 = { ts: "2026-09-16T03:05:00.000Z", "spår": "F5-logg", allvar: "MEDEL", fynd: "hjartslag.log: felmönster i svansen", bevis: "x" };
const B1 = { ts: F1.ts, "spår": F1["spår"], fynd: F1.fynd, dom: "falskt-pos", rotorsaka: "födelseminutens grep-fel", bevis: "460 filer 0 träffar", protokoll: "o14", domdAv: "test", domdTs: "2026-09-16T04:00:00.000Z" };
const B1_GAMMAL = { ...B1, dom: "rotkurad", domdTs: "2026-09-16T03:00:00.000Z" };
const B2 = { ts: "2099-01-01T00:00:00.000Z", "spår": "F9-test", fynd: "änkel utan fynd", dom: "falskt-pos", domdTs: "2026-09-16T04:00:00.000Z" };
const B_OGILTIG = { ts: "2026-09-16T03:05:00.000Z", "spår": "F5-logg", fynd: "hjartslag.log: felmönster i svansen", dom: " kanske ", domdTs: "2026-09-16T04:00:00.000Z" };

// ── test 1–5: full katalog ─────────────────────────────────────────────────
fs.writeFileSync(path.join(TMP, "feljakt-fynd.jsonl"), [F1, F2, F3].map((f) => JSON.stringify(f)).join("\n") + "\n");
fs.writeFileSync(path.join(TMP, "feljakt-bedomningar.jsonl"), [B1_GAMMAL, B1, B2, B_OGILTIG].map((b) => JSON.stringify(b)).join("\n") + "\n");
const r1 = kora(TMP);

kontroll(1, "bedömt falskt-pos lämnar öppna (perDom falskt-pos=1)", r1.resultat?.bedomda === 1 && r1.resultat?.oppna === 2 && r1.rapport?.perDom?.["falskt-pos"] === 1, JSON.stringify(r1.resultat));
kontroll(2, "obemannade fynd förblir ÖPPNA (F6 + F5 i listan)", r1.rapport?.oppnaLista?.some((f) => f.fynd === "prod osvarar") && r1.rapport?.oppnaLista?.some((f) => f.fynd === F3.fynd));
kontroll(3, "öppet HÖG räknas i oppnaHogaKritiska (KRITISK-fyndet bedömt)", r1.resultat?.oppnaHogaKritiska === 1, JSON.stringify(r1.resultat));
kontroll(4, "senaste domdTs vinner (falskt-pos, ej rotkurad)", r1.ut.includes("Bedömda per klass: falskt-pos: 1 · rotkurad: 0"));
kontroll(5, "änkel varnas + ogiltig dom ignoreras", r1.ut.includes("änkel: 2099-01-01") && r1.ut.includes("1 bedömningsrad(er) utan giltig domklass ignorerades"));

// ── test 6: saknad bedömningsfil + ogiltig JSON-rad i fyndloggen ───────────
const TMP2 = fs.mkdtempSync(path.join(os.tmpdir(), "feljakt-lage-test2-"));
fs.writeFileSync(path.join(TMP2, "feljakt-fynd.jsonl"), JSON.stringify(F2) + "\n{ ogiltig json rad\n");
const r2 = kora(TMP2);
kontroll(6, "saknad ledger ⇒ alla öppna + ogiltig rad hoppas över", r2.resultat?.totalt === 1 && r2.resultat?.oppna === 1 && r2.resultat?.oppnaHogaKritiska === 1 && r2.ut.includes("bedömningsledger saknas") && r2.ut.includes("ogiltig JSON hoppas över"), JSON.stringify(r2.resultat));

// ── test 7–8: nyckelkollisioner (o65 §5 F1 / o69-kontraktet) ───────────────
const X1 = { ts: "2026-09-17T11:43:04.406Z", "spår": "F5-logg", allvar: "MEDEL", fynd: "prod-synk.log: felmönster på ny rad", bevis: "/misslyckades/i → PATCH-KÖ: lock-commit MISSLYCKADES" };
const X2 = { ...X1, bevis: "/FEL[: ]/ → mål-återarmning FEL 502" };
const hash10 = (f) => createHash("sha256").update(String(f.bevis ?? "")).digest("hex").slice(0, 10);

// test 7: precis dom (bevisHash) täcker EN rad i paret — systern förblir öppen
const TMP3 = fs.mkdtempSync(path.join(os.tmpdir(), "feljakt-lage-krock-"));
fs.writeFileSync(path.join(TMP3, "feljakt-fynd.jsonl"), [F1, F2, F3, X1, X2].map((f) => JSON.stringify(f)).join("\n") + "\n");
fs.writeFileSync(path.join(TMP3, "feljakt-bedomningar.jsonl"), [B1, { ...X1, dom: "falskt-pos", rotorsaka: "grep-fälla", bevis: "protokoll X", protokoll: "o69", domdAv: "test", domdTs: "2026-09-18T05:00:00.000Z", bevisHash: hash10(X1) }].map((b) => JSON.stringify(b)).join("\n") + "\n");
const r3 = kora(TMP3);
kontroll(7, "kollision: precis dom täcker EN rad (X1 bedömd, X2 öppen) + gruppen rapporteras",
  r3.resultat?.totalt === 5 && r3.resultat?.bedomda === 2 && r3.resultat?.oppna === 3 &&
  r3.rapport?.nyckelkollisioner?.length === 1 && r3.rapport?.nyckelkollisioner?.[0]?.tackerAvBedomning === 1 &&
  r3.ut.includes("nyckelkollision") && r3.rapport?.oppnaLista?.some((f) => f.fynd === X1.fynd),
  JSON.stringify(r3.resultat));

// test 8: legacy bas-dom täcker paret; nyare precis dom vinner på sin rad
fs.writeFileSync(path.join(TMP3, "feljakt-bedomningar.jsonl"), [
  B1,
  { ...X1, dom: "rotkurad", rotorsaka: "samma klass båda raderna", bevis: "o65", protokoll: "o69", domdAv: "test", domdTs: "2026-09-18T04:00:00.000Z" },
  { ...X1, dom: "falskt-pos", rotorsaka: "grep-fälla", bevis: "protokoll X", protokoll: "o69", domdAv: "test", domdTs: "2026-09-18T05:00:00.000Z", bevisHash: hash10(X1) },
].map((b) => JSON.stringify(b)).join("\n") + "\n");
const r4 = kora(TMP3);
kontroll(8, "kollision: bas-dom täcker paret (3 bedömda) och nyare precis dom vinner på X1 (falskt-pos: 2 · rotkurad: 1)",
  r4.resultat?.bedomda === 3 && r4.resultat?.oppna === 2 &&
  r4.rapport?.perDom?.["falskt-pos"] === 2 && r4.rapport?.perDom?.rotkurad === 1 &&
  r4.ut.includes("2 täckta av bedömning"),
  JSON.stringify(r4.resultat));

// ── städning + utfall ──────────────────────────────────────────────────────
fs.rmSync(TMP, { recursive: true, force: true });
fs.rmSync(TMP2, { recursive: true, force: true });
fs.rmSync(TMP3, { recursive: true, force: true });
if (fail.length) {
  console.log(`\nUTFALL: ${pass}/8 PASS — FAIL: ${fail.join(", ")}`);
  process.exit(1);
}
console.log(`\nUTFALL: 8/8 PASS`);
