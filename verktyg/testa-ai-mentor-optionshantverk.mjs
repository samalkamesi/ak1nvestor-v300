#!/usr/bin/env node
// Testsvit — AI-MENTORN omgång 26: OPTIONSHANTVERK (tre förhandsfrågor:
// binomialträdet/replikeringen + straddlen + deltat/positionen efter
// bygget). Mönster: testa-ai-mentor-kontrahent.mjs (omgång 25). Kör:
//   node verktyg/testa-ai-mentor-optionshantverk.mjs
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

const { svaraLokaltOptionshantverk, OPTIONSHANTVERK_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-optionshantverk-fragor.ts")).href
);
const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

const R = KURSREGISTER;
let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — källmärke (flerkällsformat på alla tre monstren)");
for (const m of OPTIONSHANTVERK_MONSTER) {
  const s = m.bygga(R);
  ok(`A:${m.id} bär 📖`, s.text.includes("📖 Källor (") || s.text.includes("📖 Källa:"));
  ok(`A:${m.id} ≥3 källor (numrerad lista)`, s.kallor.length >= 3 && s.text.includes(`📖 Källor (${s.kallor.length})`));
}
{
  const s1 = OPTIONSHANTVERK_MONSTER.find((m) => m.id === "binomialtradet").bygga(R);
  const od05 = s1.kallor.some((k) => k.slug === "od-05-utdelningen-och-optionen");
  ok("A2:od-05 aktiverad som källa (OPTIONS & DERIVAT 8/8-villkoret)", od05);
}

console.log("A3 — kedjetestets MOTORDEFS speglar lagret (fall G:s förutsättning)");
{
  const kedje = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  ok("A3:1 motordef med antal 3", kedje.includes('namn: "optionshantverk"') && /namn: "optionshantverk"[^\n]*antal: 3/.test(kedje));
}

console.log("B — felstavningstolerans (motorns semantik: långa ord tål 1–2 fel)");
ok("B1 replikringen (1 fel)", !!svaraLokaltOptionshantverk("vad är replikringen?", R));
ok("B2 stradel (1 fel)", !!svaraLokaltOptionshantverk("vad är en stradel?", R));
ok("B3 deltta (1 fel)", !!svaraLokaltOptionshantverk("vad är deltta?", R));
ok("B4 strangl (1 fel)", !!svaraLokaltOptionshantverk("vad är en strangl?", R));
ok("B5 hedgekvotn (1 fel)", !!svaraLokaltOptionshantverk("vad är hedgekvotn?", R));
ok("B6 binomialträd (grundform utan bestämd artikel)", !!svaraLokaltOptionshantverk("vad är ett binomialträd?", R));

console.log("C — determinism (samma fråga ⇒ bitidentiskt svar)");
const q1 = "vad är binomialträdet?";
ok("C1 bitidentisk", JSON.stringify(svaraLokaltOptionshantverk(q1, R)) === JSON.stringify(svaraLokaltOptionshantverk(q1, R)));
const q2 = "vad är en straddle?";
ok("C2 bitidentisk (straddle)", JSON.stringify(svaraLokaltOptionshantverk(q2, R)) === JSON.stringify(svaraLokaltOptionshantverk(q2, R)));
const q3 = "vad är delta?";
ok("C3 bitidentisk (delta)", JSON.stringify(svaraLokaltOptionshantverk(q3, R)) === JSON.stringify(svaraLokaltOptionshantverk(q3, R)));

console.log("D — fantomlänkar + registerdrivna tal + aritmetik");
const slugs = new Set(R.map((r) => r.slug));
let allaLankar = 0, braLankar = 0;
for (const m of OPTIONSHANTVERK_MONSTER) {
  const s = m.bygga(R);
  for (const h of s.handlings ?? []) {
    if (h.lank?.startsWith("/kurser/")) { allaLankar++; if (slugs.has(h.lank.replace("/kurser/", ""))) braLankar++; }
  }
  for (const k of s.kallor ?? []) ok(`D:${m.id} källslug ${k.slug} äkta`, slugs.has(k.slug));
  if (s.fordjupa?.lank?.startsWith("/kurser/")) ok(`D:${m.id} fordjupa äkta`, slugs.has(s.fordjupa.lank.replace("/kurser/", "")));
}
ok(`D1 samtliga kurslänkar äkta (${braLankar}/${allaLankar})`, allaLankar > 0 && allaLankar === braLankar);
const od = R.filter((r) => r.kategori === "OPTIONS & DERIVAT").length;
const sBin = OPTIONSHANTVERK_MONSTER.find((m) => m.id === "binomialtradet").bygga(R);
// Fönster 31 (s6-u3, _s6u3o31-): 12 → 13 — spår 5 födde od-09
// försäkringsskrivandet 2026-09-20 (mentorväglös; kategorin 12/13 nådda).
// Omgång 35 (s6-u2, _s6u2o35-): D2:s frysta od === 13 kurade till tak —
// registret växte till 15 (od-10 kreditderivatet aktiverad omgång 33,
// od-11 ränteswapen källaktiverad ×2 sedan omgång 34, primärt ledig);
// modulen är redan registerdriven (odAntal) och bär det levande talet.
ok(`D2 registerdrivet tal (OPTIONS & DERIVAT ${od} — registerdrivet tak)`, od >= 14 && sBin.text.includes(`(${od} kurser)`));
// D03 — aritmetikkontroller (oberoende omräknade i testet, ej bara strängmatch)
const sStr = OPTIONSHANTVERK_MONSTER.find((m) => m.id === "straddlen").bygga(R);
const sDel = OPTIONSHANTVERK_MONSTER.find((m) => m.id === "deltat").bygga(R);
{
  const hk = (20 - 0) / (120 - 80);
  ok("D03a hedgekvot (20−0)÷(120−80) = 0,5", hk === 0.5 && sBin.text.includes("= 0,5"));
  const lan = 40 / 1.02;
  ok("D03b lånet 40÷1,02 = 39,22", Math.round(lan * 100) / 100 === 39.22 && sBin.text.includes("39,22"));
  const pris = 0.5 * 100 - lan;
  ok("D03c priset 50 − 39,22 = 10,78", Math.round(pris * 100) / 100 === 10.78 && sBin.text.includes("10,78"));
  const lan4 = 40 / 1.04, pris4 = 0.5 * 100 - lan4;
  ok("D03d räntespåret 4 %: 38,46 ⇒ 11,54", Math.round(lan4 * 100) / 100 === 38.46 && Math.round(pris4 * 100) / 100 === 11.54 && sBin.text.includes("38,46") && sBin.text.includes("11,54"));
  const q = (1.02 - 0.8) / (1.2 - 0.8), qpris = (q * 20 + (1 - q) * 0) / 1.02;
  ok("D03e q = 0,55 ⇒ (0,55×20)÷1,02 = 10,78", Math.round(q * 100) / 100 === 0.55 && Math.round(qpris * 100) / 100 === 10.78 && sBin.text.includes("= 0,55"));
  const p1 = 4 + 4;
  ok("D03f straddle 100: premie 8, BE 92/108", p1 === 8 && 100 - 8 === 92 && 100 + 8 === 108 && sStr.text.includes("premie 8") && sStr.text.includes("92") && sStr.text.includes("108"));
  const p2 = 2 + 2;
  ok("D03g strangle 90/110: premie 4, BE 86/114", p2 === 4 && 90 - 4 === 86 && 110 + 4 === 114 && sStr.text.includes("premie 4") && sStr.text.includes("86") && sStr.text.includes("114"));
  const d0 = 10 * 100 * 0.04, d1 = 10 * 100 * 0.26;
  ok("D03h nettodelta +0,04 → 40 · +0,26 → 260 · +220", d0 === 40 && d1 === 260 && d1 - d0 === 220 && sDel.text.includes("40 aktier") && sDel.text.includes("260 aktier") && sDel.text.includes("+220"));
  const hyra = 1000 * 0.5, skord = 0.5 * 0.02 * 8 * 8 * 1000;
  ok("D03i hyra 500 · skörd 640 · netto +140", hyra === 500 && Math.round(skord) === 640 && skord - hyra === 140 && sDel.text.includes("500 kr") && sDel.text.includes("640") && sDel.text.includes("+140"));
  const be = Math.sqrt(2 * 0.5 / 0.02);
  ok("D03j break-even √50 ≈ 7,1 kr ≈ 4,7 % av 150", Math.round(be * 10) / 10 === 7.1 && Math.round((be / 150) * 1000) / 10 === 4.7 && sDel.text.includes("7,1") && sDel.text.includes("4,7"));
}

console.log("E — kanonisk träff (rätt monster, rätt ämne)");
const kanon = {
  "vad är binomialträdet?": "binomialträdet",
  "hur får optionen sitt pris?": "binomialträdet",
  "vad är replikering?": "binomialträdet",
  "vad är replikeringsportföljen?": "binomialträdet",
  "vad är hedgekvoten?": "binomialträdet",
  "vad är riskneutral sannolikhet?": "binomialträdet",
  "vad är en straddle?": "straddlen",
  "vad är en strangle?": "straddlen",
  "vad är kombinerade optionspositioner?": "straddlen",
  "vad är delta?": "deltat",
  "vad är aktieekvivalenter?": "deltat",
  "vad är thetans hyra?": "deltat",
  "vad är förfallodagen?": "deltat",
};
for (const [q, amne] of Object.entries(kanon)) {
  const s = svaraLokaltOptionshantverk(q, R);
  ok(`E:${q} → ${amne}`, s !== null && s.amne === amne);
}

console.log("F — null-cases (dokumenterade gränser: andras ord lämnas ifred)");
for (const q of [
  "vad är en collar?",            // portföljgrundens (dollar tav 1)
  "vad är prisspridning?",        // basens (riskspridning tav 2)
  "vad är ex-dagen?",             // utdelningskalenderns
  "vad är hedging?",              // valutamekanikens (omhedging är ALDRIG kärnord)
  "vad är optioner?",             // nästas
  "vad är en köpoption?",         // optionsdjupets
  "vad är implicit volatilitet?", // optionsdjupets källfamilj
  "vad är warranter?",            // warrant-lagrets
  "vad är en termin?",            // nästas
  "vad är styrräntan?",           // makros
  "vad är valutarisk?",           // portföljgrundens + valutamekanikens
  "vad är kassaflödesanalys?",    // extrats
]) {
  ok(`F:${q} → null`, svaraLokaltOptionshantverk(q, R) === null);
}

console.log("G — grannfrågor (optionsfamiljens grannar: detta lager stjäl inte)");
for (const q of [
  "vad är en put?",               // optionsdjupets säljoptionsspegel
  "vad är teckningsoptioner?",    // warrantens
  "vad är emissionsrätter?",      // warrantens
  "vad är terminskontraktet?",    // kontrahentens källa
  "vad är utdelningsfällor?",     // utdelningsdjupets
  "vad är utdelningar?",          // utdelningsfamiljens
  "vad är stop loss?",            // marknadsmekanikens orderfamilj
]) {
  ok(`G:${q} → null`, svaraLokaltOptionshantverk(q, R) === null);
}

console.log("G2 — antistöld LIVE (kedjetestets samtliga kanoniska frågor mot detta lager)");
{
  const kedjeSrc = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const kanoniskaBlock = kedjeSrc.slice(kedjeSrc.indexOf("const KANONISKA = ["), kedjeSrc.indexOf("\n];", kedjeSrc.indexOf("const KANONISKA = [")));
  const KANONISKA = [...kanoniskaBlock.matchAll(/\{ fraga: "([^"]+)",\s*motor: (\d+) \}/g)].map((m) => ({ fraga: m[1], motor: Number(m[2]) }));
  const minaFragestall = new Set(["vad är binomialträdet?", "vad är en straddle?", "vad är delta?"]);
  const mina = KANONISKA.filter((x) => minaFragestall.has(x.fraga));
  ok("G2:0 mina 3 kanoniska finns i kedjetestet", mina.length === 3);
  const andras = KANONISKA.filter((x) => !minaFragestall.has(x.fraga));
  const stolder = andras.filter((x) => svaraLokaltOptionshantverk(x.fraga, R) !== null);
  ok(`G2:0 stölder av ${andras.length} främmande kanoniska`, stolder.length === 0);
  if (stolder.length) console.log("   STÖLD:", stolder.map((x) => x.fraga).join(" · "));
}

console.log("J — juridikgrinden (lagen 2007:528 — ingen rådgivning)");
const forbudna = ["köp denna", "sälj denna", "vi rekommenderar", "borde du köpa", "investera i", "satsa på", "vi råder", "du bör köpa", "du bör sälja"];
let juridikOk = true;
for (const m of OPTIONSHANTVERK_MONSTER) {
  const s = m.bygga(R);
  if (forbudna.some((f) => s.text.toLowerCase().includes(f))) { juridikOk = false; console.log("  FYND i", m.id); }
}
ok("J1 noll förbjudna fraser", juridikOk);
{
  const s = sBin.text.toLowerCase();
  ok("J2 utbildningsframing närvarande", s.includes("utbildning") || s.includes("aldrig besvarar") || s.includes("rädgivningsfråga"));
}

console.log("K — kärnordsdisjunktion LIVE (samtliga lager + basmotorn läses från disk)");
const mina = OPTIONSHANTVERK_MONSTER.flatMap((m) => m.karnord.map((k) => k.toLowerCase()));
const dist = (a, b) => { const n = a.length, m = b.length; if (!n) return m; if (!m) return n; let f = Array.from({ length: m + 1 }, (_, j) => j), nu = new Array(m + 1); for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, f[j] + 1, f[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); f = [...nu]; } return f[m]; };
const kolliderar = [];
const libFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-optionshantverk-fragor.ts").concat(["ai-mentor-svar.ts"]);
for (const f of libFiler) {
  const txt = readFileSync(join(ROT, "src/lib", f), "utf-8");
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
  ok("L1 import finns", widget.includes('from "@/lib/ai-mentor-optionshantverk-fragor"'));
  ok("L2 komposition FÖRE marknadsrytm (deras SIST-deklaration)", widget.includes("svaraLokaltOptionshantverk(q, KURSREGISTER) ?? svaraLokaltPengarstid(q, KURSREGISTER) ?? svaraLokaltVolatilitetsmekanik(q, KURSREGISTER) ?? svaraLokaltCoinvest(q, KURSREGISTER) ?? svaraLokaltTvangsmekanik(q, KURSREGISTER) ?? svaraLokaltHandelsemotor(q, KURSREGISTER) ?? svaraLokaltLonsamhetsgrund(q, KURSREGISTER) ?? svaraLokaltKemisektor(q, KURSREGISTER) ?? svaraLokaltStalsektor(q, KURSREGISTER) ?? svaraLokaltCasepraktik(q, KURSREGISTER) ?? svaraLokaltBeteendefallor(q, KURSREGISTER) ?? svaraLokaltKategoristangning(q, KURSREGISTER) ?? svaraLokaltBanksektorn(q, KURSREGISTER) ?? svaraLokaltNotlasning(q, KURSREGISTER) ?? svaraLokaltNykull(q, KURSREGISTER) ?? svaraLokaltNyfodda(q, KURSREGISTER) ?? svaraLokaltSkuldordning(q, KURSREGISTER) ?? svaraLokaltValideringsfonster(q, KURSREGISTER) ?? svaraLokaltEnhetsekonomi(q, KURSREGISTER) ?? svaraLokaltNatverkseffekter(q, KURSREGISTER) ?? svaraLokaltSlutstenarna(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);"));
  // Fönster 31 (s6-u3, _s6u3o31-): u1 stålsektor + u2 casepraktik + u3
  // beteendefallor mellan kemisektor och marknadsrytm — substrängen följer.
  ok("L3 komposition EFTER balansdjup", widget.includes("svaraLokaltBalansdjup(q, KURSREGISTER) ?? svaraLokaltOptionshantverk(q, KURSREGISTER)"));
}

console.log(`\nSVIT OPTIONSHANTVERK: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
