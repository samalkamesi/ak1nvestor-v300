#!/usr/bin/env node
/** V231 — aggregatorns EGEN kontraktssvit (E35:s namngivna restgap, SYSTEM-
 *  KARTAN rad 2686 + åttonde passningen rad 5407: "aggregatorn saknar EGEN
 *  kontraktssvit (klassregex + kvittoparsning + återupptagning)").
 *
 *  Metod: NÄSTLADE FILTRADE aggregator-körningar (egna V229-suffixrapporter —
 *  huvudcheckpointen rörs aldrig) mot två engångsfixtures som sviten föder
 *  och städar själv. Inga tunga sviter avfyras: alla monster är förankrade,
 *  och klassfilter-testet är "beväpnat" med den harmlösa 4-s-viten
 *  testa-styrelse-v214 (mislyckas klassningen körs en billig svit — aldrig
 *  styrelsemötet). Kontrakt som mäts:
 *   C1  V229 sond-suffix      — huvudcheckpointen byte-identisk genom alla körningar
 *   C2  V229 suffix-rapport   — filtrerad körning skriver -<tagg>.json med rätt innehåll
 *   C3  V228 checkpoint       — rapport lever MITT I körningen (status PÅGÅENDE)
 *   C4  kvittoparsning        — sista PASS-raden blir kvitto; RÖD svit bär sistaFel
 *   C5  statusvärden          — slutstatus ∈ {PÅGÅENDE, AVBRUTEN, GRÖN, RÖD} (RÖD-fall mätbart)
 *   C6  återupptagning        — --fortsatt mäter OM only saknade sviter (räknarbevis)
 *   C7  klassregex + filter   — klassSumma bär alla fyra klasser; --klass=tung exkluderar
 *                               en DETERMINISTISK svit (v214) utan att köra den
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AGG = path.join(REPO, "verktyg", "kor-alla-tester.mjs");
const VAKTEN = path.join(REPO, "data", "vakten");
const HUVUD = path.join(VAKTEN, "testaggregator-SENASTE.json");
const FIX_A = path.join(REPO, "verktyg", "testa-zz-kontrakt-a.mjs");
const FIX_B = path.join(REPO, "verktyg", "testa-zz-kontrakt-b.mjs");
const MONSTER_AB = "^testa-zz-kontrakt-[ab]\\.mjs$";

const resultat = [];
const kontroll = (id, namn, ok, detalj) => {
  resultat.push({ id, namn, ok: !!ok, detalj: detalj ?? "" });
  console.log(`  ${ok ? "PASS" : "FAIL"} ${id} — ${namn}${detalj ? ` (${detalj})` : ""}`);
};
const lasJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const hashFil = (p) => (fs.existsSync(p) ? createHash("sha256").update(fs.readFileSync(p)).digest("hex") : "(saknas)");

function korAggregator(argh, takSek = 120) {
  const r = spawnSync(process.execPath, [AGG, "--tak=" + takSek, ...argh], {
    cwd: REPO, encoding: "utf8", timeout: 200_000,
  });
  return { kod: r.status, ut: String(r.stdout || ""), fel: String(r.stderr || "") };
}
function suffixRapport(delim) {
  // senaste -<tagg>.json vars namn innehåller delim (taggen föds ur monster-källan)
  const kand = fs.readdirSync(VAKTEN).filter((f) => f.startsWith("testaggregator-SENASTE-") && f.endsWith(".json") && f.includes(delim))
    .map((f) => ({ f, m: fs.statSync(path.join(VAKTEN, f)).mtimeMs })).sort((a, b) => b.m - a.m);
  return kand.length ? path.join(VAKTEN, kand[0].f) : null;
}

// ── fixtures + räknare ──────────────────────────────────────────────────────
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ak1a-kontrakt-"));
const raknareA = path.join(tmp, "a.json");
const raknareB = path.join(tmp, "b.json");
fs.writeFileSync(FIX_A, `#!/usr/bin/env node
import fs from "node:fs";
const P = ${JSON.stringify(raknareA)};
let n = 0; try { n = JSON.parse(fs.readFileSync(P, "utf8")).n || 0; } catch {}
n += 1; fs.writeFileSync(P, JSON.stringify({ n }));
await new Promise((r) => setTimeout(r, 3000)); // fönster för checkpoint-sampling
console.log("FIXTURE A: rad före kvitto");
console.log("SAMMANFATTNING: PASS (kontraktfixture A, körning " + n + ")");
process.exit(0);
`);
fs.writeFileSync(FIX_B, `#!/usr/bin/env node
import fs from "node:fs";
const P = ${JSON.stringify(raknareB)};
let n = 0; try { n = JSON.parse(fs.readFileSync(P, "utf8")).n || 0; } catch {}
n += 1; fs.writeFileSync(P, JSON.stringify({ n }));
await new Promise((r) => setTimeout(r, 2500)); // breder PÅGÅENDE-fönstret (C3)
console.log("FIXTURE B: rad före felet");
console.error("FIXTURE B: avsiktligt fel (kontrakt)");
console.log("RESULTAT: FAIL (kontraktfixture B, körning " + n + ")");
process.exit(1);
`);
try {
  // städa eventuella rapporter från tidigare körningar av denna svit
  for (const f of fs.readdirSync(VAKTEN)) {
    if (f.startsWith("testaggregator-SENASTE-") && (f.includes("kontrakt") || f.includes("v214"))) {
      fs.rmSync(path.join(VAKTEN, f), { force: true });
    }
  }
  const huvudFore = hashFil(HUVUD);

  // ── R1: grön+röd fixture i EN filtrerad körning (C2–C5, C7 klassSumma) ──
  let pagaendeSett = false;
  const barn1 = spawn(process.execPath, [AGG, "--tak=90", `--monster=${MONSTER_AB}`], { cwd: REPO, stdio: ["ignore", "ignore", "ignore"] });
  // lyssnaren FÖRE samplingen — annars kan close-eventet förloras om barnet
  // hinner dö medan pollingloopen fortfarande letar (bevisat: exit 13)
  const klar1 = new Promise((res) => { barn1.on("close", res); barn1.on("error", () => res(-9)); });
  const samplingStart = Date.now();
  while (Date.now() - samplingStart < 90_000) {
    const p = suffixRapport("kontrakt");
    if (p) {
      try {
        const j = lasJson(p);
        if (j.matta >= 1 && j.status === "PÅGÅENDE") { pagaendeSett = true; break; }
      } catch { /* halvskriven fil mitt i IO — sampling fortsätter */ }
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  const r1v = await klar1;
  const rap1 = suffixRapport("kontrakt");
  let j1 = null;
  try { j1 = rap1 ? lasJson(rap1) : null; } catch {}
  kontroll("C3", "V228 checkpoint lever mitt i körningen (status PÅGÅENDE)", pagaendeSett, pagaendeSett ? "samplad medan aggregatorn levde" : "såg aldrig PÅGÅENDE");
  kontroll("C2", "V229 filtrerad körning skriver suffixrapport", !!j1 && j1.upptackta === 2 && j1.matta === 2, j1 ? `${path.basename(rap1)} matta=${j1.matta}/${j1.upptackta}` : "ingen rapport");
  if (j1) {
    const a = j1.sviter.find((s) => s.fil === "testa-zz-kontrakt-a.mjs");
    const b = j1.sviter.find((s) => s.fil === "testa-zz-kontrakt-b.mjs");
    kontroll("C4a", "kvittoparsning: sista PASS-raden blir gröna svitens kvitto", !!a && /SAMMANFATTNING: PASS/.test(a.kvitto || ""), a ? a.kvitto : "fixture A saknas");
    kontroll("C4b", "röd svit: status RÖD + sistaFel ur stderr", !!b && b.status === "RÖD" && /avsiktligt fel/.test(b.sistaFel || ""), b ? `${b.status} sistaFel="${b.sistaFel}"` : "fixture B saknas");
    kontroll("C5", "statusvärden: slutstatus ur {PÅGÅENDE, AVBRUTEN, GRÖN, RÖD}", ["PÅGÅENDE", "AVBRUTEN", "GRÖN", "RÖD"].includes(j1.status) && j1.status === "RÖD", `status=${j1.status} (grön+röd fixture ⇒ RÖD)`);
    const klassNycklar = Object.keys(j1.klassSumma || {}).sort().join(",");
    kontroll("C7a", "klassSumma bär alla fyra miljöklasser", klassNycklar === "DETERMINISTISK,DEV-FÖNSTER,PROD-NÄRA,TUNG-TILLSTÅND" && j1.klassSumma.DETERMINISTISK.upptackta === 2, `klasser=${klassNycklar} · DETERMINISTISK.upptäckta=${j1.klassSumma?.DETERMINISTISK?.upptackta}`);
    kontroll("C0", "körningen avbröts ej av RAM-vakt (miljön tillät mätning)", !j1.avbrutenRam, j1.avbrutenRam ? "avbrutenRam=true — omkör vid ledigare minne" : "oavbruten");
  }
  if (r1v !== 0 && !j1) kontroll("C2", "V229 filtrerad körning skriver suffixrapport", false, `aggregator-exit ${r1v}`);

  // ── R2: återupptagning — simulera död mitt i (fäll rapporten till A-endast) ──
  const nA_fore = fs.existsSync(raknareA) ? lasJson(raknareA).n : 0;
  const nB_fore = fs.existsSync(raknareB) ? lasJson(raknareB).n : 0;
  if (rap1 && j1) {
    const stump = { ...j1, matta: 1, omatta: 1, status: "AVBRUTEN", sviter: j1.sviter.filter((s) => s.fil === "testa-zz-kontrakt-a.mjs") };
    fs.writeFileSync(rap1, JSON.stringify(stump, null, 2) + "\n");
    korAggregator(["--fortsatt", `--monster=${MONSTER_AB}`]);
    let j2 = null; try { j2 = lasJson(rap1); } catch {}
    const nA_efter = fs.existsSync(raknareA) ? lasJson(raknareA).n : 0;
    const nB_efter = fs.existsSync(raknareB) ? lasJson(raknareB).n : 0;
    kontroll("C6", "återupptagning: --fortsatt mäter OM bara saknade sviter",
      !!j2 && j2.lage === "fortsatt" && j2.matta === 2 && nA_efter === nA_fore && nB_efter === nB_fore + 1,
      j2 ? `lage=${j2.lage} matta=${j2.matta} · A ${nA_fore}→${nA_efter} (omätas om) · B ${nB_fore}→${nB_efter} (mättes om)` : "ingen rapport efter --fortsatt");
  } else {
    kontroll("C6", "återupptagning: --fortsatt mäter OM bara saknade sviter", false, "R1 saknade rapport — underlag saknas");
  }

  // ── R3: klassfilter-testet — v214 (DETERMINISTISK) exkluderas ur TUNG ──
  korAggregator(["--klass=tung", "--monster=^testa-styrelse-v214\\.mjs$"], 60);
  const rap3 = suffixRapport("v214");
  let j3 = null; try { j3 = rap3 ? lasJson(rap3) : null; } catch {}
  kontroll("C7b", "klassregex: --klass=tung exkluderar DETERMINISTISK svit utan att köra den",
    !!j3 && j3.upptackta === 0 && j3.matta === 0 && j3.status === "GRÖN",
    j3 ? `upptäckta=${j3.upptackta} mätta=${j3.matta} status=${j3.status}` : "ingen rapport");

  // ── C1: huvudcheckpointen orörd genom ALLT ──────────────────────────────
  kontroll("C1", "V229 sond-suffix: huvudcheckpointen byte-identisk", hashFil(HUVUD) === huvudFore, huvudFore === "(saknas)" ? "saknades före och efter" : "sha256 oförändrad");
} finally {
  fs.rmSync(FIX_A, { force: true });
  fs.rmSync(FIX_B, { force: true });
  fs.rmSync(tmp, { recursive: true, force: true });
}

const pass = resultat.filter((r) => r.ok).length;
console.log(`SAMMANFATTNING: ${pass === resultat.length ? "PASS" : "FAIL"} (${pass}/${resultat.length} kontrakt — V231 aggregatorns egna kontraktssvit)`);
process.exit(pass === resultat.length ? 0 : 1);
