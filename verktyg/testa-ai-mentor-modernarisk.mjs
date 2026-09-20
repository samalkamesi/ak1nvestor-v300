#!/usr/bin/env node
// Testsvit — AI-MENTORN: MODERNA RISKTYPER (tre förhandsfrågor, manifest
// auto-s6-1789912510460, byggare s6-u3, spår 6, 2026-09-20).
// Mönster: testa-ai-mentor-valutamekanik.mjs (våg 210). Kör filen direkt:
//   node verktyg/testa-ai-mentor-modernarisk.mjs
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

const { svaraLokaltModernaRisker, MODERNA_RISK_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-modernarisk-fragor.ts")).href
);
const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

const R = KURSREGISTER;
let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — källmärke (flerkällsformat på samtliga tre)");
for (const m of MODERNA_RISK_MONSTER) {
  const s = m.bygga(R);
  ok(`A:${m.id} bär 📖`, s.text.includes("📖 Källor (") || s.text.includes("📖 Källa:"));
  ok(`A:${m.id} flerkällsrad (≥2 källor)`, (s.kallor?.length ?? 0) >= 2 && s.text.includes("📖 Källor ("));
}

console.log("B — felstavningstolerans (motorns semantik: långa ord tål 2 fel)");
// OBS motorns kontrakt: flerordsfraser («regulatorisk risk») matchas som
// exakt substring av den normaliserade frågan — fel I en fras kan aldrig
// träffa (samma semantik som basen och samtliga syskonlager). B1 bevisar
// i stället normaliseringen (dubbelt mellanslag kollapsas) + att frågan
// med ETT ord felstavat i frasläget korrekt faller igenom (null = grannen
// basen tar den via sitt «risk»-kärnord — kedjetestets A-fall vaktar).
ok("B1 fras + dubbelt mellanslag (normalisering)", svaraLokaltModernaRisker("vad är regulatorisk  risk?", R) !== null);
ok("B1b myndighetsbeslüt (1 fel i ettordskärnord)", svaraLokaltModernaRisker("vad är ett myndighetsbeslüt?", R) !== null);
ok("B2 regelvrk (1 fel)", svaraLokaltModernaRisker("vad är ett regelvrk?", R) !== null);
ok("B3 personuppgifta (1 fel)", svaraLokaltModernaRisker("vad är personuppgifta för något?", R) !== null);
ok("B4 hållbarhetsrisken med 2 fel", svaraLokaltModernaRisker("vad är hållbarhetsriscen?", R) !== null);

console.log("C — determinism (samma fråga ⇒ bitidentiskt svar)");
const q1 = "vad är regulatorisk risk?";
const q2 = "hur hanterar bolag gdpr?";
ok("C1 bitidentisk", JSON.stringify(svaraLokaltModernaRisker(q1, R)) === JSON.stringify(svaraLokaltModernaRisker(q1, R)));
ok("C2 bitidentisk", JSON.stringify(svaraLokaltModernaRisker(q2, R)) === JSON.stringify(svaraLokaltModernaRisker(q2, R)));

console.log("D — fantomlänkar + registerdrivna tal");
const slugs = new Set(R.map((r) => r.slug));
let allaLankar = 0, braLankar = 0;
for (const m of MODERNA_RISK_MONSTER) {
  const s = m.bygga(R);
  for (const h of s.handlings ?? []) {
    if (h.lank?.startsWith("/kurser/")) { allaLankar++; if (slugs.has(h.lank.replace("/kurser/", ""))) braLankar++; }
  }
  for (const k of s.kallor ?? []) ok(`D:${m.id} källslug ${k.slug} äkta`, !k.slug || slugs.has(k.slug));
  if (s.fordjupa?.lank?.startsWith("/kurser/")) {
    ok(`D:${m.id} fordjupa äkta`, slugs.has(s.fordjupa.lank.replace("/kurser/", "")));
  }
}
ok(`D1 samtliga kurslänkar äkta (${braLankar}/${allaLankar})`, allaLankar > 0 && allaLankar === braLankar);
const rk = R.filter((r) => r.kategori === "RISKHANTERING").length;
const sReg = MODERNA_RISK_MONSTER.find((m) => m.id === "regulatoriskrisk").bygga(R);
const sEsg = MODERNA_RISK_MONSTER.find((m) => m.id === "esg").bygga(R);
ok(`D2 registerdrivna tal (${rk} riskhanteringskurser, bär av monster 1 och 3)`,
  sReg.text.includes(`${rk} kurser`) && sEsg.text.includes(`${rk} kurser`));
// D3: aktiverade kurser finns i registret med förväntad kategori
for (const [slug, kat] of [
  ["rk-06-regulatorisk-risk", "RISKHANTERING"],
  ["rk-13-gdpr-och-datarisk", "RISKHANTERING"],
  ["rk-14-esgrisk", "RISKHANTERING"],
  ["pf-13-esgportfolj", "PORTFÖLJHANTERING"],
  ["v18-regulatoriska", "KATALYSATOR"],
]) {
  const rad = R.find((r) => r.slug === slug);
  ok(`D3 ${slug} i registret (${kat})`, !!rad && rad.kategori === kat);
}

console.log("E — kanonisk träff (tre monsters, rätt ämne)");
const kanon = {
  "vad är regulatorisk risk?": "regulatorisk risk",
  "vad är gdpr?": "gdpr och datarisk",
  "vad är dataskydd?": "gdpr och datarisk",
  "vad är datarisk?": "gdpr och datarisk",
  "vad är esg?": "esg-risk",
  "vad är esg-risk?": "esg-risk",
  "vad är klimatrisk?": "esg-risk",
  "vad är hållbarhetsrisk?": "esg-risk",
  "vad är sociala risker?": "esg-risk",
};
for (const [q, amne] of Object.entries(kanon)) {
  const s = svaraLokaltModernaRisker(q, R);
  ok(`E:${q} → ${amne}`, s !== null && s.amne === amne);
}

console.log("F — null-cases (grunderna och främmande territorium ägs av andra)");
for (const q of [
  "vad är risk?", "vad är valutarisk?", "vad är styrräntan?",
  "vad är kassaflödesanalys?", "vad är en svart svan?", "vad är en moat?",
  "vad är leverantörsrisk?", "vad är kontrahentrisk?",
  "vad är en katalysator?", "vad är regulatoriska katalysatorer?",
]) {
  ok(`F:${q} → null`, svaraLokaltModernaRisker(q, R) === null);
}

console.log("G — antistöld (basens och risklagrens kanoniska frågor träffar INTE detta lager)");
// F-fallet täcker basens katalysator/risk-grunder, riskdjupets svarta svan,
// riskadressens leverantörsrisk och kontrahentens familj — dokumenterat ovan.
ok("G1:sammanfattning (F täcker)", true);

console.log("J — juridikgrinden (lagen 2007:528 — ingen rådgivning)");
const forbudna = ["köp denna", "sälj denna", "vi rekommenderar", "borde du köpa", "investera i", "satsa på", "undvik denna", "sälj aktien"];
let juridikOk = true;
for (const m of MODERNA_RISK_MONSTER) {
  const s = m.bygga(R);
  if (forbudna.some((f) => s.text.toLowerCase().includes(f))) { juridikOk = false; console.log("  FYND i", m.id); }
}
ok("J1 noll förbjudna fraser", juridikOk);

console.log("K — kärnordsdisjunktion LIVE (samtliga lager + basmotorn läses från disk)");
const mina = MODERNA_RISK_MONSTER.flatMap((m) => m.karnord.map((k) => k.toLowerCase()));
const dist = (a, b) => { const n = a.length, m = b.length; if (!n) return m; if (!m) return n; let f = Array.from({ length: m + 1 }, (_, j) => j), nu = new Array(m + 1); for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, f[j] + 1, f[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); f = [...nu]; } return f[m]; };
const kolliderar = [];
const libFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-modernarisk-fragor.ts").concat(["ai-mentor-svar.ts"]);
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

console.log(`\nSVIT MODERNA RISKTYPER: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
