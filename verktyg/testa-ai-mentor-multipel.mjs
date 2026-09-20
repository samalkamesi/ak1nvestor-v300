#!/usr/bin/env node
// Testsvit — AI-MENTORN omgång 25: MULTIPEL — grundmultiplarna P/S + P/B
// (s6-u2 försök 2, manifest auto-s6-1789864506792).
// Mönster: testa-ai-mentor-kontrahent.mjs (omgång 25). Kör filen direkt:
//   node verktyg/testa-ai-mentor-multipel.mjs
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

const { svaraLokaltMultipel, MULTIPEL_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-multipel-fragor.ts")).href
);
const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

const R = KURSREGISTER;
let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — källmärke (flerkällsformat på båda monstren)");
for (const m of MULTIPEL_MONSTER) {
  const s = m.bygga(R);
  ok(`A:${m.id} bär 📖`, s.text.includes("📖 Källor (") || s.text.includes("📖 Källa:"));
  ok(`A:${m.id} ≥3 källor (numrerad lista)`, s.kallor.length >= 3 && s.text.includes(`📖 Källor (${s.kallor.length})`));
  ok(`A:${m.id} primärkällan först`, s.kallor[0].slug === (m.id === "ps-tal" ? "v04-ps" : "v05-pb"));
}

console.log("A2 — wiring i kedjetestets MOTORDEFS (62:a motorn, efter marknadsrytm)");
{
  const kedja = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  ok("A2:1 MOTORDEFS-rad finns", kedja.includes('{ namn: "multipel", fil: "ai-mentor-multipel-fragor.ts", fn: "svaraLokaltMultipel", arr: "MULTIPEL_MONSTER", antal: 2 }'));
  const defs = kedja.slice(kedja.indexOf("const MOTORDEFS"), kedja.indexOf("];", kedja.indexOf("const MOTORDEFS")));
  const namn = [...defs.matchAll(/namn: "([^"]+)"/g)].map((m) => m[1]);
  // Omgång 26-harmonisering (s6-u2, 2026-09-20): «direkt före» var omgång 25:s
  // läge — omgång 26 wireade tre motorer EFTER multipel (u1 riskadress 62:a ·
  // u2 balansdjup 63:e · u3 optionshantverk 64:e), alla FÖRE marknadsrytm som
  // förblir SIST. Ny assert: multipel FÖRE de tre, de tre i kedjeordning, SIST kvar.
  {
    const iMult = namn.indexOf("multipel"), iRisk = namn.indexOf("riskadress"), iBal = namn.indexOf("balansdjup"), iOpt = namn.indexOf("optionshantverk");
    ok(`A2:2 multipel FÖRE omgång 26:s tre (riskadress→balansdjup→optionshantverk), marknadsrytm SIST av ${namn.length} motorer`, namn[namn.length - 1] === "marknadsrytm" && iMult !== -1 && iMult < iRisk && iRisk < iBal && iBal < iOpt && iOpt < namn.length - 1);
  }
}

console.log("B — felstavningstolerans (motorns semantik: långa ord tål 1–2 fel)");
ok("B1 omsättningsmultipel (1 fel: omsatningsmultipeln)", !!svaraLokaltMultipel("vad är omsatningsmultipeln?", R));
ok("B2 omsättningstal (1 fel: omsatningstal)", !!svaraLokaltMultipel("vad är ett omsatningstal?", R));
ok("B3 goodwill som stärkord (2 fel: goodwil)", !!svaraLokaltMultipel("vad är pb med goodwil?", R));
ok("B4 balansräkning som stärkord (1 fel: balansräkningen→balansräknngen)", !!svaraLokaltMultipel("vad är pb och balansraknngen?", R));

console.log("C — determinism (samma fråga ⇒ bitidentiskt svar)");
const q1 = "vad är ps-talet?";
ok("C1 bitidentisk (ps)", JSON.stringify(svaraLokaltMultipel(q1, R)) === JSON.stringify(svaraLokaltMultipel(q1, R)));
const q2 = "vad är pb-talet?";
ok("C2 bitidentisk (pb)", JSON.stringify(svaraLokaltMultipel(q2, R)) === JSON.stringify(svaraLokaltMultipel(q2, R)));

console.log("D — fantomlänkar + registerdrivna tal + aritmetik");
const slugs = new Set(R.map((r) => r.slug));
let allaLankar = 0, braLankar = 0;
for (const m of MULTIPEL_MONSTER) {
  const s = m.bygga(R);
  for (const h of s.handlings ?? []) {
    if (h.lank?.startsWith("/kurser/")) { allaLankar++; if (slugs.has(h.lank.replace("/kurser/", ""))) braLankar++; }
  }
  for (const k of s.kallor ?? []) ok(`D:${m.id} källslug ${k.slug} äkta`, slugs.has(k.slug));
  if (s.fordjupa?.lank?.startsWith("/kurser/")) ok(`D:${m.id} fordjupa äkta`, slugs.has(s.fordjupa.lank.replace("/kurser/", "")));
}
ok(`D1 samtliga kurslänkar äkta (${braLankar}/${allaLankar})`, allaLankar > 0 && allaLankar === braLankar);
const va = R.filter((r) => r.kategori === "VÄRDERING").length;
const sPs = MULTIPEL_MONSTER.find((m) => m.id === "ps-tal").bygga(R);
const sPb = MULTIPEL_MONSTER.find((m) => m.id === "pb-tal").bygga(R);
ok(`D2 registerdrivet tal (VÄRDERING ${va})`, sPs.text.includes(`(${va} kurser)`) && sPb.text.includes(`(${va} kurser)`));
// D03 — aritmetikkontroller (oberoende omräknade i testet, ej bara strängmatch)
{
  const psTabell = [
    { namn: "Sinch", bv: 31757, om: 27080, text: "1,17", ebit: "2,5" },
    { namn: "Alfa Laval", bv: 231545, om: 69674, text: "3,32", ebit: "16,2" },
    { namn: "Atlas Copco", bv: 984018, om: 168343, text: "5,85", ebit: "20,6" },
    { namn: "Microsoft", bv: 3689160, om: 331839, text: "11,12", ebit: "45,1" },
  ];
  for (const r of psTabell) {
    const egen = r.bv / r.om;
    ok(`D03a ${r.namn} ${r.bv} ÷ ${r.om} ≈ ${r.text}`, Math.abs(egen - Number(r.text.replace(",", "."))) < 0.005 && sPs.text.includes(r.text));
    ok(`D03b ${r.namn} EBIT-marginal ${r.ebit} % i text`, sPs.text.includes(r.ebit + " %"));
  }
  const poang = (x) => (x < 1 ? 5 : x < 2 ? 4 : x < 3 ? 3 : x < 5 ? 2 : 1);
  ok("D03c tröskellogik Sinch 1,17→4p·AL 3,32→2p·AC 5,85→1p·MSFT 11,12→1p",
    poang(1.17) === 4 && poang(3.32) === 2 && poang(5.85) === 1 && poang(11.12) === 1
    && sPs.text.includes("1,17 → 4 p") && sPs.text.includes("3,32 → 2 p") && sPs.text.includes("5,85 → 1 p") && sPs.text.includes("11,12 → 1 p"));
  ok("D03d marginalfällan 80–90 öre mot 5–15 öre", sPs.text.includes("80–90 öre") && sPs.text.includes("5–15 öre"));
  ok("D03e distributörsbandet 0,1–0,5", sPs.text.includes("0,1–0,5"));
  const pbTabell = [
    { namn: "Sinch", pb: "1,38", roe: "1,9" },
    { namn: "Ericsson B", pb: "3,09", roe: "26,1" },
    { namn: "Atlas Copco A", pb: "9,26", roe: "25,7" },
    { namn: "Kambi", pb: "29,18", roe: "7,0" },
    { namn: "Apple", pb: "44,15", roe: "148,8" },
  ];
  for (const r of pbTabell) {
    ok(`D03f ${r.namn} P/B ${r.pb} + ROE ${r.roe} % i text`, sPb.text.includes(r.pb) && sPb.text.includes(r.roe + " %"));
  }
  ok("D03g tröskellogik P/B 1,38→4p·3,09→2p·9,26/29,18/44,15→1p",
    poang(1.38) === 4 && poang(3.09) === 2 && poang(9.26) === 1 && poang(29.18) === 1 && poang(44.15) === 1
    && sPb.text.includes("1,38 → 4 p") && sPb.text.includes("3,09 → 2 p") && sPb.text.includes("44,15 → 1 p"));
  ok("D03h Kambis bruttomarginal 98,9 %", sPb.text.includes("98,9 %"));
  ok("D03i algebran P/B = P/E × ROE", sPb.text.includes("P/B = P/E × ROE"));
}

console.log("E — kanonisk träff (rätt monster, rätt ämne)");
const kanon = {
  "vad är ps-talet?": "ps-tal",
  "vad är ps talet?": "ps-tal",
  "vad är ps?": "ps-tal",
  "hur räknar man pris per omsättning?": "ps-tal",
  "vad betyder price to sales?": "ps-tal",
  "vad är en omsättningsmultipel?": "ps-tal",
  "vad är omsättningstalet för ett bolag?": "ps-tal",
  "varför har lågmarginalbolag lågt ps?": "ps-tal",
  "vad är pb-talet?": "pb-tal",
  "vad är pb talet?": "pb-tal",
  "vad är pb?": "pb-tal",
  "hur räknar man pris per bokfört värde?": "pb-tal",
  "vad betyder price to book?": "pb-tal",
  "hur räknas pris per eget kapital?": "pb-tal",
  "varför har apple så högt pb?": "pb-tal",
};
for (const [q, amne] of Object.entries(kanon)) {
  const s = svaraLokaltMultipel(q, R);
  ok(`E:${q} → ${amne}`, s !== null && s.amne === amne);
}

console.log("F — null-cases (dokumenterade gränser: andras ord lämnas ifred)");
for (const q of [
  "vad är p/s?",                 // naken skavattform — orden «p»+«s» separeras; fallbackens
  "vad är p/b?",                 // d:o (sond rond 3: substring-varianten vore stöldfarlig)
  "vad är substansvärde?",       // nästa-lagrets investmentbolag (sond rond 1: träff)
  "vad är pe-talet?",            // pe-mekanikens (ps/pb exakta korta ord stjäl ej)
  "vad är eget kapital?",        // kapitalmekanikens (bärs i min text, aldrig som kärnord)
  "vad är ev ebitda?",           // v06-territoriet (bärs som källa + länk)
  "vad är roe?",                 // lösamhets-/värderingslagrens (algebran bärs i text)
  "vad är bokföring?",           // bokföringsfamiljens
  "vad är multipeln?",           // basens värderingsmultipel-familj (kärnordsderivat testas i G)
  "vad är styrräntan?",          // makros
]) {
  ok(`F:${q} → null`, svaraLokaltMultipel(q, R) === null);
}

console.log("G — antistöld LIVE (samtliga syskonkärnord som frågor → 0 fångster)");
{
  const libFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-multipel-fragor.ts").concat(["ai-mentor-svar.ts"]);
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
  const stolder = unika.filter((q) => svaraLokaltMultipel(q, R) !== null);
  ok(`G:0 stölder av ${unika.length} kärnordsderivat`, stolder.length === 0);
  if (stolder.length) console.log("   STÖLD:", stolder.join(" · "));
}

console.log("G2 — syskonmotorerna fångar inte mina kanoniska (omvänd stöld)");
{
  const MINA_KANONISKA = Object.keys(kanon);
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const fns = [...new Set([...widget.matchAll(/svaraLokalt\w+\(/g)].map((m) => m[0].slice(0, -1)))].filter((f) => f !== "svaraLokaltMultipel");
  const fnTillFil = {};
  for (const f of readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f))) {
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
const forbudna = ["köp denna", "sälj denna", "vi rekommenderar", "borde du köpa", "investera i", "satsa på", "vi råder", "billig aktie just nu", "köp aktien"];
let juridikOk = true;
for (const m of MULTIPEL_MONSTER) {
  const s = m.bygga(R);
  if (forbudna.some((f) => s.text.toLowerCase().includes(f))) { juridikOk = false; console.log("  FYND i", m.id); }
}
ok("J1 noll förbjudna fraser", juridikOk);

console.log("K — kärnordsdisjunktion LIVE (samtliga lager + basmotorn läses från disk)");
const mina = MULTIPEL_MONSTER.flatMap((m) => m.karnord.map((k) => k.toLowerCase()));
const dist = (a, b) => { const n = a.length, m = b.length; if (!n) return m; if (!m) return n; let f = Array.from({ length: m + 1 }, (_, j) => j), nu = new Array(m + 1); for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, f[j] + 1, f[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); f = [...nu]; } return f[m]; };
const kolliderar = [];
const libFilerK = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-multipel-fragor.ts").concat(["ai-mentor-svar.ts"]);
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
  ok("L1 import finns", widget.includes('from "@/lib/ai-mentor-multipel-fragor"'));
  ok("L2 komposition efter kontrahent, FÖRE marknadsrytm (deras SIST-deklaration respekteras)", widget.includes("svaraLokaltKontrahent(q, KURSREGISTER) ?? svaraLokaltMultipel(q, KURSREGISTER) ?? svaraLokaltRiskadress(q, KURSREGISTER) ?? svaraLokaltBalansdjup(q, KURSREGISTER) ?? svaraLokaltOptionshantverk(q, KURSREGISTER) ?? svaraLokaltPengarstid(q, KURSREGISTER) ?? svaraLokaltVolatilitetsmekanik(q, KURSREGISTER) ?? svaraLokaltCoinvest(q, KURSREGISTER) ?? svaraLokaltTvangsmekanik(q, KURSREGISTER) ?? svaraLokaltHandelsemotor(q, KURSREGISTER) ?? svaraLokaltLonsamhetsgrund(q, KURSREGISTER) ?? svaraLokaltKemisektor(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);"));
}

console.log(`\nSVIT MULTIPEL: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
