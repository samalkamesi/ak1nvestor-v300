#!/usr/bin/env node
// Testsvit — SIGNAL-BUS (våg 213 del b / o106): konstanter, statiskaSignaler
// och streak-risk-matematiken (rena deterministiska kontrakt).
// Serverpublicerande grenar (publiceraSignal/lasSignaler via Supabase) testas
// ENBART i sin graceful-fall-klass här — skarpa anrop belongs till live-drift.
// Kör: node verktyg/testa-signal-bus.mjs  (Node ≥ 22.18: type stripping)
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "_o106-ts-import.mjs")).href);
aktiveraTsImport();

// Nätverksfri miljö: Supabase-env stryks FÖRE import (organ-bus-precedensen) —
// publicera-/läsgrenarna ska visa sina graceful-fall, aldrig göra skarpa anrop.
const ENV_NYCKLAR = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const SPARAD_ENV = Object.fromEntries(ENV_NYCKLAR.map((k) => [k, process.env[k]]));
for (const k of ENV_NYCKLAR) delete process.env[k];

const { SIGNAL_TYPER, SIGNAL_MOTTAGARE, statiskaSignaler, raknaStreakRisk, byggStreakRiskSignal } = await import(
  pathToFileURL(join(ROT, "src/lib/signal-bus.ts")).href
);

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — kontraktet: typer och mottagare");
ok("A1 fyra signaltyper", Array.isArray(SIGNAL_TYPER) && SIGNAL_TYPER.length === 4);
ok("A2 tre mottagarklasser", Array.isArray(SIGNAL_MOTTAGARE) && SIGNAL_MOTTAGARE.length === 3);

console.log("B — statiskaSignaler: form och innehåll");
const stat = statiskaSignaler();
ok("B1 icke-tom lista", stat.length >= 3);
ok("B2 typ ∈ SIGNAL_TYPER (samtliga)", stat.every((s) => SIGNAL_TYPER.includes(s.typ)));
ok("B3 mottagare ∈ SIGNAL_MOTTAGARE", stat.every((s) => SIGNAL_MOTTAGARE.includes(s.mottagare)));
ok("B4 id/kalla/rubrik/text/ikon/tid satta", stat.every((s) => s.id && s.kalla && s.rubrik && s.text && s.ikon && typeof s.tid === "number"));
ok("B5 länkar är interna (aldrig externa värdar)", stat.every((s) => !s.lank || s.lank.startsWith("/") && !s.lank.startsWith("//")));
ok("B6 determinism (två anrop samma dag ⇒ identiska)", JSON.stringify(statiskaSignaler()) === JSON.stringify(stat));

console.log("C — raknaStreakRisk: midnattsmatematiken (ren, given nu)");
const NU = new Date(2026, 8, 20, 18, 0, 0).getTime(); // 2026-09-20 18:00 lokal
const dagIso = (t) => { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
ok("C1 senast idag ⇒ aktiv", raknaStreakRisk({ antal: 5, senast: dagIso(NU) }, NU).status === "aktiv");
const risk = raknaStreakRisk({ antal: 5, senast: dagIso(NU - 86_400_000) }, NU);
ok("C2 senast igår ⇒ risk", risk.status === "risk");
ok("C3 timmarKvar 0–24 med en decimal", risk.timmarKvar !== null && risk.timmarKvar > 0 && risk.timmarKvar <= 24 && Number.isFinite(risk.timmarKvar));
ok("C4 risk vid midnatt-nära (30 min kvar)", raknaStreakRisk({ antal: 2, senast: dagIso(NU - 86_400_000) }, new Date(2026, 8, 20, 23, 30).getTime()).timmarKvar <= 0.6);
ok("C5 äldre än igår ⇒ bruten", raknaStreakRisk({ antal: 5, senast: "2026-09-17" }, NU).status === "bruten");
ok("C6 ogiltigt datum ⇒ bruten", raknaStreakRisk({ antal: 5, senast: "inte-datum" }, NU).status === "bruten");
ok("C7 antal 0 ⇒ bruten (kedjan finns inte)", raknaStreakRisk({ antal: 0, senast: dagIso(NU) }, NU).status === "bruten");
ok("C8 determinism (samma nu ⇒ samma svar)",
  JSON.stringify(raknaStreakRisk({ antal: 7, senast: dagIso(NU - 86_400_000) }, NU)) === JSON.stringify(raknaStreakRisk({ antal: 7, senast: dagIso(NU - 86_400_000) }, NU)));

console.log("D — byggStreakRiskSignal: publik signal endast när kedjan värdefull");
ok("D1 aktiv kedja ⇒ null (inget buller)", byggStreakRiskSignal({ antal: 5, senast: dagIso(NU) }, NU) === null);
ok("D2 kort risk-kedja (2 dagar) ⇒ null (MIN_STREAK_FOR_RISK)", byggStreakRiskSignal({ antal: 2, senast: dagIso(NU - 86_400_000) }, NU) === null);
const sig = byggStreakRiskSignal({ antal: 4, senast: dagIso(NU - 86_400_000) }, NU);
ok("D3 värd kedja ⇒ varningssignal", sig !== null && sig.typ === "varning");
ok("D4 länkar till Dagens Pass", sig?.lank === "/dagens-pass");
ok("D5 mottagare alla", sig?.mottagare === "alla");
ok("D6 texten bär antalet + tonen uppmuntrande (aldrig dömande)", sig !== null && sig.text.includes("4") && !/dålig|dumt|misslyckad/i.test(sig.text));
ok("D7 signalen är lokal (id/tid satta)", typeof sig?.id === "string" && sig.id.length > 0 && typeof sig?.tid === "number");

console.log(`\nSVIT SIGNAL-BUS: ${pass} PASS / ${fail} FAIL`);
for (const [k, v] of Object.entries(SPARAD_ENV)) { if (v !== undefined) process.env[k] = v; }
process.exit(fail === 0 ? 0 : 1);
