#!/usr/bin/env node
// Testsvit — AI-MENTORN omgång 26: BALANSDJUP — lagervärderingen +
// obeskattade reserver (s6-u2, manifest auto-s6-1789890903364).
// Mönster: testa-ai-mentor-multipel.mjs (omgång 25). Kör filen direkt:
//   node verktyg/testa-ai-mentor-balansdjup.mjs
// Node >= 22.18 kör .ts-importer direkt (type stripping).
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { svaraLokaltBalansdjup, BALANSDJUP_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-balansdjup-fragor.ts")).href
);
const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

const R = KURSREGISTER;
let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — källmärke (flerkällsformat på båda monstren)");
for (const m of BALANSDJUP_MONSTER) {
  const s = m.bygga(R);
  ok(`A:${m.id} bär 📖`, s.text.includes("📖 Källor (") || s.text.includes("📖 Källa:"));
  ok(`A:${m.id} ≥3 källor (numrerad lista)`, s.kallor.length >= 3 && s.text.includes(`📖 Källor (${s.kallor.length})`));
  ok(`A:${m.id} primärkällan först`, s.kallor[0].slug === (m.id === "lagervardering" ? "bk-07-lagret-och-lagervarderingen" : "bk-06-obeskattade-reserver-och-avsattningar"));
}

console.log("A2 — wiring i kedjetestets MOTORDEFS (63:e motorn, FÖRE marknadsrytm som förblir SIST)");
{
  const kedja = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  ok("A2:1 MOTORDEFS-rad finns", kedja.includes('{ namn: "balansdjup", fil: "ai-mentor-balansdjup-fragor.ts", fn: "svaraLokaltBalansdjup", arr: "BALANSDJUP_MONSTER", antal: 2 }'));
  const defs = kedja.slice(kedja.indexOf("const MOTORDEFS"), kedja.indexOf("];", kedja.indexOf("const MOTORDEFS")));
  const namn = [...defs.matchAll(/namn: "([^"]+)"/g)].map((m) => m[1]);
  const iBalans = namn.indexOf("balansdjup");
  const iRytm = namn.indexOf("marknadsrytm");
  ok(`A2:2 balansdjup före marknadsrytm (SIST) av ${namn.length} motorer; riskadress (${namn.indexOf("riskadress")}) före balansdjup`, iRytm === namn.length - 1 && iBalans !== -1 && iBalans < iRytm && namn.indexOf("riskadress") < iBalans);
}

console.log("B — felstavningstolerans (motorns semantik: långa ord tål 1–2 fel)");
ok("B1 lagervärdering (1 fel: lagervardring)", !!svaraLokaltBalansdjup("vad är lagervardring?", R));
ok("B2 lagerdagar naturlig form (lagerdagarna: +2)", !!svaraLokaltBalansdjup("vad är lagerdagarna?", R));
ok("B3 skatteuppskov naturlig form (skatteuppskovet: +2)", !!svaraLokaltBalansdjup("vad är skatteuppskovet?", R));
ok("B4 lagerrullning naturlig form (lagerrullningen: +2)", !!svaraLokaltBalansdjup("vad är lagerrullningen?", R));
ok("B5 obeskattade naturlig form (obeskattad: −1)", !!svaraLokaltBalansdjup("vad är obeskattad?", R));
ok("B6 fifo exakt kort ord", !!svaraLokaltBalansdjup("vad är fifo?", R));

console.log("C — determinism (samma fråga ⇒ bitidentiskt svar)");
const q1 = "vad är lagervärdering?";
ok("C1 bitidentisk (lagret)", JSON.stringify(svaraLokaltBalansdjup(q1, R)) === JSON.stringify(svaraLokaltBalansdjup(q1, R)));
const q2 = "vad är obeskattade reserver?";
ok("C2 bitidentisk (reserverna)", JSON.stringify(svaraLokaltBalansdjup(q2, R)) === JSON.stringify(svaraLokaltBalansdjup(q2, R)));

console.log("D — fantomlänkar + registerdrivna tal + aritmetik");
const slugs = new Set(R.map((r) => r.slug));
let allaLankar = 0, braLankar = 0;
for (const m of BALANSDJUP_MONSTER) {
  const s = m.bygga(R);
  for (const h of s.handlings ?? []) {
    if (h.lank?.startsWith("/kurser/")) { allaLankar++; if (slugs.has(h.lank.replace("/kurser/", ""))) braLankar++; }
  }
  for (const k of s.kallor ?? []) ok(`D:${m.id} källslug ${k.slug} äkta`, slugs.has(k.slug));
  if (s.fordjupa?.lank?.startsWith("/kurser/")) ok(`D:${m.id} fordjupa äkta`, slugs.has(s.fordjupa.lank.replace("/kurser/", "")));
}
ok(`D1 samtliga kurslänkar äkta (${braLankar}/${allaLankar})`, allaLankar > 0 && allaLankar === braLankar);
const ba = R.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
const sLager = BALANSDJUP_MONSTER.find((m) => m.id === "lagervardering").bygga(R);
const sReserv = BALANSDJUP_MONSTER.find((m) => m.id === "obeskattade-reserver").bygga(R);
ok(`D2 registerdrivet tal (BOKFÖRING & ÅRSREDOVISNING ${ba} kurser i båda svaren)`, sLager.text.includes(`(${ba} kurser)`) && sReserv.text.includes(`(${ba} kurser)`));
const bk07 = R.find((r) => r.slug === "bk-07-lagret-och-lagervarderingen");
const bk06 = R.find((r) => r.slug === "bk-06-obeskattade-reserver-och-avsattningar");
ok(`D2b registerdrivna kursegenskaper (bk-07 ${bk07.minuter} min · ${bk07.kapitel} kap; bk-06 ${bk06.minuter} min · ${bk06.kapitel} kap)`, sLager.text.includes(`${bk07.minuter} minuter · ${bk07.kapitel} kapitel`) && sReserv.text.includes(`${bk06.minuter} minuter · ${bk06.kapitel} kapitel`));
// D03 — aritmetikkontroller (oberoende omräknade i testet, ej bara strängmatch)
{
  const T = (x) => Number(x.replace(",", "."));
  // Monster 1: principen
  ok("D03a NFV god säsong 1500 − 150 = 1350 ≥ 800", Math.abs((1500 - 150) - 1350) < 1e-9 && sLager.text.includes("1 350"));
  ok("D03b NFV rea 690 − 90 = 600 < 800", Math.abs((690 - 90) - 600) < 1e-9 && sLager.text.includes("690 − 90 = 600"));
  ok("D03c nedskrivning 800 − 600 = 200/jacka × 10 000 = 2,0 Mkr; balansrad 8,0 → 6,0", Math.abs((800 - 600) * 10000 - 2.0e6) < 1 && sLager.text.includes("200 kronor per jacka") && sLager.text.includes("2,0 miljoner") && sLager.text.includes("8,0 till 6,0"));
  // Monster 1: rullningen
  ok("D03d rullning 1800 ÷ (480+420)/2 = 4,0 varv; 365 ÷ 4 = 91 dagar", Math.abs(1800 / ((480 + 420) / 2) - 4.0) < 1e-9 && Math.abs(365 / 4.0 - 91.25) < 1e-9 && Math.round(365 / 4.0) === 91 && sLager.text.includes("4,0 varv") && sLager.text.includes("91 lagerdagar"));
  ok("D03e dagsförbrukning 1800 ÷ 365 ≈ 4,9 → 450 ÷ 4,9 ≈ 91 (två vägar)", Math.abs(1800 / 365 - 4.93) < 0.01 && Math.abs(450 / (1800 / 365) - 91.25) < 0.01 && sLager.text.includes("4,9"));
  ok("D03f Norrull 1800 ÷ 300 = 6,0 varv = 61 dagar; 150 Mkr mindre", Math.abs(1800 / 300 - 6.0) < 1e-9 && Math.abs(365 / 6.0 - 60.8) < 0.1 && Math.round(365 / 6.0) === 61 && sLager.text.includes("6,0 varv = 61 dagar") && sLager.text.includes("450 − 300 = 150"));
  ok("D03g grottan 20 ÷ 5 = 4,0 mot 2,0; 1890 ÷ 540 = 3,5 ≈ 104 dagar", Math.abs(20 / 5 - 4.0) < 1e-9 && Math.abs(1890 / 540 - 3.5) < 1e-9 && Math.abs(365 / 3.5 - 104.3) < 0.1 && sLager.text.includes("4,0") && sLager.text.includes("3,5 varv ≈ 104 dagar") && sLager.text.includes("2,0"));
  ok("D03h NFV-fall 540 × 0,05 = 27 Mkr; kassabindning +90", Math.abs(540 * 0.05 - 27) < 1e-9 && Math.abs(540 - 450 - 90) < 1e-9 && sLager.text.includes("540 × 0,05 = 27 miljoner") && sLager.text.includes("90 miljoner"));
  ok("D03i butiksspektrum 730/20=36,5→10 d; /60≈12,2→30 d; /120≈6,1→60 d; 10 % → 2,0/6,0/12,0", Math.abs(730 / 20 - 36.5) < 1e-9 && Math.abs(365 / 36.5 - 10) < 1e-9 && Math.abs(20 * 0.10 - 2.0) < 1e-9 && Math.abs(120 * 0.10 - 12.0) < 1e-9 && sLager.text.includes("2,0 · 6,0 · 12,0 miljoner"));
  // Monster 2: uppskovet
  ok("D03j bokfört 100−50−20=30; taxerad 100−50−40=10", Math.abs(100 - 50 - 20 - 30) < 1e-9 && Math.abs(100 - 50 - 40 - 10) < 1e-9 && sReserv.text.includes("30,0") && sReserv.text.includes("10,0"));
  ok("D03k betald skatt 0,20×10=2,0; bokförd 0,20×30=6,0; netto 24,0", Math.abs(0.2 * 10 - 2.0) < 1e-9 && Math.abs(0.2 * 30 - 6.0) < 1e-9 && Math.abs(30 - 6 - 24) < 1e-9 && sReserv.text.includes("2,0") && sReserv.text.includes("6,0") && sReserv.text.includes("24,0"));
  ok("D03l kassa 100−50−2=48 mot 44; uppskov 4,0 = 0,20×(40−20)", Math.abs(100 - 50 - 2 - 48) < 1e-9 && Math.abs(48 - 44 - 4) < 1e-9 && Math.abs(0.2 * (40 - 20) - 4.0) < 1e-9 && sReserv.text.includes("48,0") && sReserv.text.includes("44,0") && sReserv.text.includes("0,20 × (40,0 − 20,0)"));
  ok("D03m reservökning 30−10=20,0", Math.abs(30 - 10 - 20) < 1e-9 && sReserv.text.includes("30,0 − 10,0 = 20,0"));
  ok("D03n justerat EK 180+250−50=380; latent 0,20×250=50; 25 % av 1 000", Math.abs(180 + 250 - 50 - 380) < 1e-9 && Math.abs(0.2 * 250 - 50) < 1e-9 && Math.abs(250 / 1000 - 0.25) < 1e-9 && sReserv.text.includes("380,0") && sReserv.text.includes("50,0"));
  ok("D03o per aktie 380/10=38,0 mot 180/10=18,0", Math.abs(380 / 10 - 38) < 1e-9 && Math.abs(180 / 10 - 18) < 1e-9 && sReserv.text.includes("38,0 kronor per aktie") && sReserv.text.includes("18,0 rapporterat"));
  ok("D03p P/B 30/18=1,67; 30/38=0,79; kvot ≈2,1", Math.abs(30 / 18 - 1.667) < 0.001 && Math.abs(30 / 38 - 0.789) < 0.001 && Math.abs(1.667 / 0.789 - 2.11) < 0.01 && sReserv.text.includes("1,67") && sReserv.text.includes("0,79") && sReserv.text.includes("2,1"));
}

console.log("E — kanonisk träff (rätt monster, rätt ämne)");
const kanon = {
  "vad är lagervärdering?": "lagervardering",
  "vad är lagervarderingen?": "lagervardering",
  "hur räknar man nettoförsäljningsvärdet?": "lagervardering",
  "vad är nettoförsäljningsvärde?": "lagervardering",
  "vad är lägsta värdets princip?": "lagervardering",
  "vad är lagerdagar?": "lagervardering",
  "vad är lagerrullning?": "lagervardering",
  "vad är lagergrottan?": "lagervardering",
  "vad är fifo?": "lagervardering",
  "vad är avfo?": "lagervardering",
  "vad är lagrets värde?": "lagervardering",
  "vad är lagret värt?": "lagervardering",
  "vad är obeskattade reserver?": "obeskattade-reserver",
  "vad är en obeskattad reserv?": "obeskattade-reserver",
  "vad betyder obeskattade?": "obeskattade-reserver",
  "vad är skatteuppskov?": "obeskattade-reserver",
  "vad är latent skatt?": "obeskattade-reserver",
  "vad är justerat eget kapital?": "obeskattade-reserver",
  "vad är en avsättning?": "obeskattade-reserver",
  "vad är balansens tvegift?": "obeskattade-reserver",
};
for (const [q, amne] of Object.entries(kanon)) {
  const s = svaraLokaltBalansdjup(q, R);
  ok(`E:${q} → ${amne}`, s !== null && s.amne === amne);
}

console.log("F — null-cases (dokumenterade gränser: andras ord lämnas ifred)");
for (const q of [
  "hur ligger laget?",            // «laget» avstånd 1 från «lagret» — FARA VAKTAD
  "vad säger lagen om utdelning?", // «lagen» avstånd 1 från «lager» — d:o
  "vad är lageromsättningen?",     // kapitalbindningens «lageromsattning» (diafri-samma)
  "vad är eget kapital?",          // kapitalmekanikens (multipel-precedensen)
  "vad är skatt?",                 // skattedjupens
  "vad är bolagsskatten?",         // km-049/skattedjupens territorium (källa här)
  "vad är balansräkningen?",       // basens karta
  "vad är substansvärde?",         // nästas investmentbolag
  "vad är kassaflödesanalys?",     // extras
  "vad är avskrivningar?",         // redovisningsdjupets
  "vad är soliditet?",             // st-01-familjens
  "vad är pb-talet?",              // multipelens (syskonet FÖRE mig i kedjan)
  "vad är riskens anatomi?",       // riskadressens/basens (fönstrets syskon u1)
  "vad är avsättningar?",          // naken plural: «avkastningar» ligger avstånd 2 —
                                   // frasen «en avsättning» bär istället (exakt substring),
                                   // nakna pluralen lämnas åt widgetens fallback (dokumenterad gräns)
  "vad är pensionssparande?",      // portföljpraktikens («pension» deras kärnord; de ligger
                                   // FÖRE mig i kedjan — «…en avsättning för pension?» är
                                   // lagligen deras svar i kedjan, min fras är reservat)
  "vad är styrräntan?",            // makros
]) {
  ok(`F:${q} → null`, svaraLokaltBalansdjup(q, R) === null);
}

console.log("G — antistöld LIVE (samtliga syskonkärnord som frågor → 0 fångster)");
{
  const libFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-balansdjup-fragor.ts").concat(["ai-mentor-svar.ts"]);
  const fragor = [];
  for (const f of libFiler) {
    const txt = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const m of txt.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
      for (const o of [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1])) {
        const ren = o.replace(/[?!.,]/g, "").trim();
        if (ren.length <= 40 && !ren.includes("  ")) fragor.push("vad är " + ren + "?");
      }
    }
  }
  const unika = [...new Set(fragor)];
  const stolder = unika.filter((q) => svaraLokaltBalansdjup(q, R) !== null);
  ok(`G:0 stölder av ${unika.length} kärnordsderivat`, stolder.length === 0);
  if (stolder.length) console.log("   STÖLD:", stolder.join(" · "));
}

console.log("G2 — syskonmotorerna fångar inte mina kanoniska (omvänd stöld)");
{
  const MINA_KANONISKA = Object.keys(kanon);
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const fns = [...new Set([...widget.matchAll(/svaraLokalt\w+\(/g)].map((m) => m[0].slice(0, -1)))].filter((f) => f !== "svaraLokaltBalansdjup");
  const fnTillFil = {};
  for (const f of readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragors?\.ts$/.test(f))) {
    const src = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const m of src.matchAll(/export function (svaraLokalt\w+)\(/g)) fnTillFil[m[1]] = f;
  }
  fnTillFil["svaraLokalt"] = "ai-mentor-svar.ts";
  fnTillFil["svaraLokaltExtra"] = "ai-mentor-extra-fragor.ts";
  const fangster = [];
  for (const fn of fns) {
    const fil = fnTillFil[fn];
    if (!fil) continue;
    const modul = await import(pathToFileURL(join(ROT, "src/lib", fil)).href);
    if (typeof modul[fn] !== "function") continue;
    for (const q of MINA_KANONISKA) if (modul[fn](q, R) !== null) fangster.push(`${fn} fångade «${q}»`);
  }
  ok(`G2:0 av ${fns.length} syskonmotorer fångar mina ${MINA_KANONISKA.length} kanoniska`, fangster.length === 0);
  if (fangster.length) console.log("   FÅNGST:", fangster.join(" · "));
}

console.log("J — juridikgrinden (lagen 2007:528 — ingen rådgivning)");
const forbudna = ["köp denna", "sälj denna", "vi rekommenderar", "borde du köpa", "investera i", "satsa på", "vi råder", "billig aktie just nu", "köp aktien", "placera i"];
let juridikOk = true;
for (const m of BALANSDJUP_MONSTER) {
  const s = m.bygga(R);
  if (forbudna.some((f) => s.text.toLowerCase().includes(f))) { juridikOk = false; console.log("  FYND i", m.id); }
}
ok("J1 noll förbjudna fraser", juridikOk);
const pahttade = BALANSDJUP_MONSTER.map((m) => m.bygga(R).text.includes("PÅHITTADE"));
ok("J2 PÅHITTADE-tal markerade i båda svaren (kursernas konvention)", pahttade.every(Boolean));

console.log("K — kärnordsdisjunktion LIVE (samtliga lager + basmotorn läses från disk)");
const mina = BALANSDJUP_MONSTER.flatMap((m) => m.karnord.map((k) => k.toLowerCase()));
const dist = (a, b) => { const n = a.length, m = b.length; if (!n) return m; if (!m) return n; let f = Array.from({ length: m + 1 }, (_, j) => j), nu = new Array(m + 1); for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, f[j] + 1, f[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); f = [...nu]; } return f[m]; };
const kolliderar = [];
const libFilerK = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragors?\.ts$/.test(f) && f !== "ai-mentor-balansdjup-fragor.ts").concat(["ai-mentor-svar.ts"]);
for (const f of libFilerK) {
  const txt = readFileSync(join(ROT, "src/lib", f), "utf8");
  for (const m of txt.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
    for (const o of [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1].toLowerCase())) {
      for (const mk of mina) {
        if (o.includes(" ") || mk.includes(" ")) {
          if (o === mk) kolliderar.push(`${f}:"${o}" == min:"${mk}"`);
          continue;
        }
        const kort = Math.min(o.length, mk.length) <= 3;
        if (kort ? o === mk : dist(o, mk) <= (Math.min(o.length, mk.length) <= 7 ? 1 : 2) && Math.abs(o.length - mk.length) <= 2) kolliderar.push(`${f}:"${o}" ≈ min:"${mk}"`);
      }
    }
  }
}
ok(`K1 noll kärnordskollisioner (${kolliderar.length})`, kolliderar.length === 0);
if (kolliderar.length) console.log("  ", kolliderar.join(" · "));

console.log("L — widget-synk (wiring i chat-widget.tsx speglar exporten)");
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  ok("L1 import finns", widget.includes('from "@/lib/ai-mentor-balansdjup-fragor"'));
  // L2: balansdjup FÖRE marknadsrytm (deras SIST-deklaration) — positions-
  // kontroll på kompositionsraden, robust mot syskons rewires i tidigare led.
  const rad = widget.split("\n").find((l) => l.includes("const lokalt = "));
  const iBalans = rad ? rad.indexOf("svaraLokaltBalansdjup(q, KURSREGISTER)") : -1;
  const iRytm = rad ? rad.indexOf("svaraLokaltMarknadsrytm(q, KURSREGISTER)") : -1;
  ok("L2 balansdjup i kedjeraden, FÖRE marknadsrytm (SIST-deklarationen respekteras)", rad !== undefined && iBalans !== -1 && iRytm !== -1 && iBalans < iRytm && rad.trimEnd().endsWith("?? svaraLokaltMarknadsrytm(q, KURSREGISTER);"));
}

console.log(`\nSVIT BALANSDJUP: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
