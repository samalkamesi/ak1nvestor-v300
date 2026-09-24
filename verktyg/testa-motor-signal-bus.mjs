#!/usr/bin/env node
// KONTRAKTSSVIT — SIGNAL-BUS (våg 213b / u3): motor src/lib/signal-bus.ts
//
// Kontrakt som testas (lästa ur motorfilen — aldrig påhittade):
//   · konstanter SIGNAL_TYPER / SIGNAL_MOTTAGARE (vokabulär-låset mot fritext)
//   · statiskaSignaler(): dagens andning — fyra pedagogiska signaler (en per
//     huvudorgan) med deterministisk tid = dagens LOKALA midnatt
//   · lasSignaler/lasSignalerForElev: SYNLIHET-monotonin (gäst ser "alla",
//     fas2 ser alla+fas2, admin ser allt; okänd mottagarsträng ⇒ "alla"),
//     kalla-/typ-filter, maxAntal-clamp 1..100 — och fail-safe-kontraktet:
//     UTAN Supabase-konfig returneras de statiska signalerna, filtrerade
//     på samma sätt (bussen andas alltid)
//   · publiceraSignal + de fem trigg-hjälparna: fail-safe — kastar ALDRIG,
//     löser med dokumenterade returvärden även utan konfig och med vakttäckta
//     indata (rader ?? [], sum?., info?., insikt?. är skrivna vaktgrenar)
//   · raknaStreakRisk/byggStreakRiskSignal: ren midnattsmatematik givet nu
//     (aktiv/risk/bruten, timmarKvar 0–24 med en decimal, MIN_STREAK_FOR_RISK
//     = 3 dagar, signalen är LOKAL och publiceras aldrig)
//
// Miljöklass: DETERMINISTISK — Supabase-env stryks FÖRE import (inga skarpa
// anrop kan ske: getSupabaseRest ⇒ null), inga timers, ingen server, inget
// nätverk. Kör: node verktyg/testa-motor-signal-bus.mjs
// (Node ≥ 22.18: type stripping; tsx-återfall fungerar också)
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping (behöver ≥ 22.18).");
  process.exit(1);
}

const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "ts-import.mjs")).href);
aktiveraTsImport();

// Nätverksfri miljö (organ-bus-precedensen): Supabase-env stryks FÖRE import —
// publicera-/läsgrenarna ska visa sina graceful-fall, aldrig göra skarpa anrop.
// getSupabaseRest läser process.env vid ANROPSTID så strykningen räcker hela vägen.
const ENV_NYCKLAR = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const SPARAD_ENV = Object.fromEntries(ENV_NYCKLAR.map((k) => [k, process.env[k]]));
for (const k of ENV_NYCKLAR) delete process.env[k];

const {
  SIGNAL_TYPER,
  SIGNAL_MOTTAGARE,
  statiskaSignaler,
  lasSignaler,
  lasSignalerForElev,
  publiceraSignal,
  publiceraKonfluensSignaler,
  publiceraVagkartaSignal,
  publiceraNetnetSignaler,
  publiceraCacheFylltSignal,
  publiceraTracerInsiktSignal,
  raknaStreakRisk,
  byggStreakRiskSignal,
} = await import(pathToFileURL(join(ROT, "src/lib/signal-bus.ts")).href);

let pass = 0, fail = 0;
const kontroll = (namn, villkor) => {
  if (villkor) { pass++; console.log("  PASS " + namn); }
  else { fail++; console.log("  FAIL " + namn); }
};
const dagIso = (t) => {
  const d = new Date(t);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

console.log("A — modulkontraktet: exporterna finns");
kontroll("A1 SIGNAL_TYPER/SIGNAL_MOTTAGARE är arrayer", Array.isArray(SIGNAL_TYPER) && Array.isArray(SIGNAL_MOTTAGARE));
kontroll(
  "A2 samtliga elva exporterade funktioner är funktioner",
  [statiskaSignaler, lasSignaler, lasSignalerForElev, publiceraSignal, publiceraKonfluensSignaler,
    publiceraVagkartaSignal, publiceraNetnetSignaler, publiceraCacheFylltSignal, publiceraTracerInsiktSignal,
    raknaStreakRisk, byggStreakRiskSignal].every((f) => typeof f === "function"),
);

console.log("B — vokabulär-låset: konstanter exakta");
kontroll('B1 SIGNAL_TYPER = ["info","varning","mojlighet","beslut"]',
  JSON.stringify(SIGNAL_TYPER) === JSON.stringify(["info", "varning", "mojlighet", "beslut"]));
kontroll('B2 SIGNAL_MOTTAGARE = ["alla","fas2","admin"]',
  JSON.stringify(SIGNAL_MOTTAGARE) === JSON.stringify(["alla", "fas2", "admin"]));

console.log("C — statiskaSignaler: dagens andning (fallback-kontraktet)");
const midFöre = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
const stat = statiskaSignaler();
const midEfter = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
kontroll("C1 exakt fyra signaler (en per huvudorgan)", stat.length === 4);
kontroll('C2 källor ["vagscan","konfluens","netnet","datacache"]',
  JSON.stringify(stat.map((s) => s.kalla)) === JSON.stringify(["vagscan", "konfluens", "netnet", "datacache"]));
kontroll('C3 mottagarspridning ["alla","fas2","fas2","admin"]',
  JSON.stringify(stat.map((s) => s.mottagare)) === JSON.stringify(["alla", "fas2", "fas2", "admin"]));
kontroll("C4 typ ∈ SIGNAL_TYPER (samtliga)", stat.every((s) => SIGNAL_TYPER.includes(s.typ)));
kontroll("C5 tid = dagens lokala midnatt (deterministisk, känns aktuell varje dag)",
  stat.every((s) => s.tid === midFöre || s.tid === midEfter));
kontroll("C6 välformade + unika id:n (id/kalla/rubrik/text/ikon icke-tomma, tid number)",
  stat.every((s) => typeof s.id === "string" && s.id.length > 0 && s.kalla && s.rubrik && s.text && s.ikon && typeof s.tid === "number")
  && new Set(stat.map((s) => s.id)).size === 4);
kontroll("C7 länkar exakta och enbart interna relativa",
  stat[0].lank === "/vagfundament" && stat[1].lank === "/konfluens" && stat[2].lank === "/netnet" && stat[3].lank === undefined);
kontroll("C8 determinism (två anrop samma dag ⇒ identiska)", JSON.stringify(statiskaSignaler()) === JSON.stringify(stat));

console.log("D — lasSignaler utan konfig: SYNLIHET-monotonin + filter + clamp");
kontroll("D1 returnerar Promise<Signal[]> (formkontraktet)", lasSignaler() instanceof Promise);
const d2 = await lasSignaler();
kontroll("D2 gäst-vy (default): bara publika — 1 signal, källa vagscan", d2.length === 1 && d2[0].kalla === "vagscan");
kontroll("D3 fas2: publikt + fas2 — 3 signaler (admin exkluderad)", (await lasSignaler({ mottagare: "fas2" })).length === 3);
kontroll("D4 admin: allt — 4 signaler", (await lasSignaler({ mottagare: "admin" })).length === 4);
kontroll('D5 okänd mottagarsträng ⇒ fallback "alla"-synlighet (1)', (await lasSignaler({ mottagare: "zombie" })).length === 1);
kontroll("D6 lasSignalerForElev(false) = gäst-vyn (1)", (await lasSignalerForElev(false)).length === 1);
kontroll("D7 lasSignalerForElev(true) = fas2-vyn (3) — admin syns ALDRIG för elever",
  (await lasSignalerForElev(true)).length === 3 && (await lasSignalerForElev(true)).every((s) => s.mottagare !== "admin"));
const d8 = await lasSignaler({ kalla: "netnet", mottagare: "admin" });
kontroll("D8 kalla-filter: netnet ⇒ 1 med rätt källa", d8.length === 1 && d8[0].kalla === "netnet");
kontroll("D9 typ-filter: mojlighet + fas2 ⇒ 2", (await lasSignaler({ typ: "mojlighet", mottagare: "fas2" })).length === 2);
kontroll("D10 typ-filter utan träff ⇒ [] (tomt är tomt — aldrig filter-bypass)",
  (await lasSignaler({ typ: "varning", mottagare: "admin" })).length === 0);
kontroll("D11 maxAntal 0 ⇒ clampas till 1", (await lasSignaler({ mottagare: "admin", maxAntal: 0 })).length === 1);
kontroll("D12 maxAntal -5 ⇒ clampas till 1", (await lasSignaler({ mottagare: "admin", maxAntal: -5 })).length === 1);
kontroll("D13 maxAntal 2 ⇒ 2 (gällande tak)", (await lasSignaler({ mottagare: "admin", maxAntal: 2 })).length === 2);
const d14 = await lasSignaler({ mottagare: "admin" });
kontroll("D14 resultat är saniterad Signal-form (typ/mottagare ∈ vokabulären)",
  d14.every((s) => SIGNAL_TYPER.includes(s.typ) && SIGNAL_MOTTAGARE.includes(s.mottagare)));

console.log("E — publiceraSignal: fail-safe (kastar ALDRIG utan konfig)");
let e1 = "kastade";
try { await publiceraSignal({}); e1 = "löste"; } catch { /* dokumenterat omöjligt */ }
kontroll('E1 tom indata ⇒ löser void (renSignals dokumenterade standardvärden)', e1 === "löste");
let e2 = "kastade";
try { await publiceraSignal({ kalla: "v213b", typ: "info", rubrik: "Svit", text: "Kontraktssvitens andetag.", ikon: "📡", lank: "/vagfundament" }); e2 = "löste"; } catch { /* omöjligt */ }
kontroll("E2 full indata ⇒ löser void (skrivningen no-op utan konfig)", e2 === "löste");
let e3 = "kastade";
try { await publiceraSignal({ kalla: "x", typ: "ogiltig", rubrik: "javascript:alert(1)", text: "t", ikon: "" }); e3 = "löste"; } catch { /* omöjligt */ }
kontroll("E3 ogiltiga fältvärden ⇒ löser (sanering faller aldrig utanför vokabulären)", e3 === "löste");

console.log("F — trigg-hjälparna: dokumenterade returvärden utan konfig");
const KONFLUENSKLASS = "Konfluens — värde möter vändande vågor";
kontroll("F1 publiceraKonfluensSignaler([]) ⇒ 0 (inga träffar ⇒ ingen signal)", (await publiceraKonfluensSignaler([])) === 0);
kontroll("F2 publiceraKonfluensSignaler(null) ⇒ 0 (rader ?? []-vakten)", (await publiceraKonfluensSignaler(null)) === 0);
kontroll("F3 rader utan konfluensklass ⇒ 0",
  (await publiceraKonfluensSignaler([{ ticker: "X.ST", konfluens: 90, klass: "Ingen konfluens" }])) === 0);
kontroll("F4 två träffar (varav en utan namn ⇒ ticker, konfluens null) ⇒ 2",
  (await publiceraKonfluensSignaler([
    { ticker: "VOLV-B.ST", namn: "Volvo B", konfluens: 82, klass: KONFLUENSKLASS },
    { ticker: "ATCO-A.ST", konfluens: null, klass: KONFLUENSKLASS },
  ])) === 2);
kontroll("F5 publiceraVagkartaSignal(giltig summa) ⇒ true",
  (await publiceraVagkartaSignal({ impulsvag: 12, korrigering: 5, basbygge: 3, osatt: 2, totalBolag: 22 })) === true);
let f6 = "kastade";
try { await publiceraVagkartaSignal(null); f6 = "löste"; } catch { /* sum?. är skriven vakt */ }
kontroll("F6 publiceraVagkartaSignal(null) ⇒ löser true (sum?-vakten)", f6 === "löste");
kontroll("F7 publiceraNetnetSignaler([]) ⇒ 0", (await publiceraNetnetSignaler([])) === 0);
kontroll("F8 publiceraNetnetSignaler(null) ⇒ 0 (rader ?? []-vakten)", (await publiceraNetnetSignaler(null)) === 0);
kontroll('F9 klass "nära" räknas ej (endast "net-net") ⇒ 0',
  (await publiceraNetnetSignaler([{ ticker: "X.ST", forhallande: 0.9, klass: "nära" }])) === 0);
kontroll("F10 en net-net-träff ⇒ 1",
  (await publiceraNetnetSignaler([{ ticker: "FING-B.ST", namn: "Fingerprint", forhallande: 0.55, klass: "net-net" }])) === 1);
let f11 = "kastade";
try { await publiceraCacheFylltSignal({ totaltSparade: 120, misslyckade: 0, raderTotalt: 450 }); f11 = "löste"; } catch { /* omöjligt */ }
kontroll("F11 publiceraCacheFylltSignal(kvitto) ⇒ löser void", f11 === "löste");
let f12 = "kastade";
try { await publiceraCacheFylltSignal(null); f12 = "löste"; } catch { /* info?. är skriven vakt */ }
kontroll("F12 publiceraCacheFylltSignal(null) ⇒ löser (info?-vakten)", f12 === "löste");
let f13 = "kastade";
try { await publiceraTracerInsiktSignal({ rubrik: "Mönster", text: "Sammanfattad nivå.", aktivTidSek: 600 }); f13 = "löste"; } catch { /* omöjligt */ }
kontroll("F13 publiceraTracerInsiktSignal(insikt) ⇒ löser void", f13 === "löste");
let f14 = "kastade";
try { await publiceraTracerInsiktSignal(null); f14 = "löste"; } catch { /* insikt?. är skriven vakt */ }
kontroll("F14 publiceraTracerInsiktSignal(null) ⇒ löser (insikt?-vakten)", f14 === "löste");

console.log("G — raknaStreakRisk: midnattsmatematiken (ren, given nu)");
const NU = new Date(2026, 8, 20, 18, 0, 0).getTime(); // 2026-09-20 18:00 lokal
kontroll("G1 senast idag ⇒ aktiv, timmarKvar null",
  (() => { const r = raknaStreakRisk({ antal: 5, senast: dagIso(NU) }, NU); return r.status === "aktiv" && r.timmarKvar === null; })());
kontroll("G2 senast i framtiden ⇒ aktiv (≥ idag-kontraktet)",
  raknaStreakRisk({ antal: 5, senast: "2026-09-24" }, NU).status === "aktiv");
const g3 = raknaStreakRisk({ antal: 5, senast: dagIso(NU - 86_400_000) }, NU);
kontroll("G3 senast igår ⇒ risk, timmarKvar 0 < t ≤ 24",
  g3.status === "risk" && g3.timmarKvar !== null && g3.timmarKvar > 0 && g3.timmarKvar <= 24);
kontroll("G4 timmarKvar med högst en decimal (avrundat 0.1)",
  g3.timmarKvar !== null && Math.abs(g3.timmarKvar * 10 - Math.round(g3.timmarKvar * 10)) < 1e-6);
const g5 = raknaStreakRisk({ antal: 5, senast: dagIso(NU - 86_400_000) }, new Date(2026, 8, 20, 23, 30).getTime());
kontroll("G5 30 minuter till midnatt ⇒ ≈ 0.5 h kvar",
  g5.status === "risk" && g5.timmarKvar !== null && Math.abs(g5.timmarKvar - 0.5) < 0.05);
kontroll("G6 äldre än igår ⇒ bruten, timmarKvar null",
  (() => { const r = raknaStreakRisk({ antal: 5, senast: "2026-09-17" }, NU); return r.status === "bruten" && r.timmarKvar === null; })());
kontroll('G7 ogiltigt datumformat ("inte-datum") ⇒ bruten',
  raknaStreakRisk({ antal: 5, senast: "inte-datum" }, NU).status === "bruten");
kontroll("G8 antal 0 ⇒ bruten (kedjan finns inte)", raknaStreakRisk({ antal: 0, senast: dagIso(NU) }, NU).status === "bruten");
kontroll("G9 negativt antal ⇒ bruten (Math.max(0, …)-golvet)", raknaStreakRisk({ antal: -3, senast: dagIso(NU) }, NU).status === "bruten");
kontroll("G10 null-indata ⇒ bruten (s?.-vakten, aldrig kast)", raknaStreakRisk(null, NU).status === "bruten");
kontroll("G11 determinism (samma nu ⇒ byte-identiskt svar)",
  JSON.stringify(raknaStreakRisk({ antal: 7, senast: dagIso(NU - 86_400_000) }, NU))
  === JSON.stringify(raknaStreakRisk({ antal: 7, senast: dagIso(NU - 86_400_000) }, NU)));

console.log("H — byggStreakRiskSignal: lokal signal endast när kedjan är värd att rädda");
kontroll("H1 aktiv kedja ⇒ null (inget buller)", byggStreakRiskSignal({ antal: 5, senast: dagIso(NU) }, NU) === null);
kontroll("H2 bruten kedja ⇒ null", byggStreakRiskSignal({ antal: 5, senast: "2026-09-01" }, NU) === null);
kontroll("H3 risk-kedja med 2 dagar ⇒ null (MIN_STREAK_FOR_RISK = 3)",
  byggStreakRiskSignal({ antal: 2, senast: dagIso(NU - 86_400_000) }, NU) === null);
const h4 = byggStreakRiskSignal({ antal: 3, senast: dagIso(NU - 86_400_000) }, NU);
kontroll("H4 risk-kedja med 3 dagar ⇒ signal (gränsen är ≥ 3)", h4 !== null && h4 !== undefined);
kontroll('H5 signalform: kalla "streak", typ "varning", mottagare "alla", länk "/dagens-pass"',
  h4 != null && h4.kalla === "streak" && h4.typ === "varning" && h4.mottagare === "alla" && h4.lank === "/dagens-pass");
kontroll("H6 tid = inmatat nu (determinist, inte Date.now())", h4 != null && h4.tid === NU);
kontroll("H7 id är icke-tom sträng (lokal signal, publiceras aldrig)", h4 != null && typeof h4.id === "string" && h4.id.length > 0);
kontroll("H8 texten bär antalet dagar och uppmuntran (aldrig dömande ton)",
  h4 != null && h4.text.includes("3 dagar") && !/dålig|dumt|misslyckad|lat/i.test(h4.text));

// ── kvitto ───────────────────────────────────────────────────────────────────
const totalt = pass + fail;
console.log(`\nSVIT MOTOR SIGNAL-BUS: ${pass} PASS / ${fail} FAIL av ${totalt} kontroller`);
for (const [k, v] of Object.entries(SPARAD_ENV)) { if (v !== undefined) process.env[k] = v; }
console.log("RESULTAT: " + pass + "/" + totalt + " PASS");
process.exit(fail === 0 ? 0 : 1);
