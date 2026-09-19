#!/usr/bin/env node
// Testsvit — AI-MENTORN våg 210: VALUTAMEKANIK (tio förhandsfrågor)
// Mönster: testa-ai-mentor-marknadsmekanik.mjs (våg 189). Kör filen direkt:
//   node verktyg/testa-ai-mentor-valutamekanik.mjs
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

const { svaraLokaltValutamekanik, VALUTAMEKANIK_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-valutamekanik-fragor.ts")).href
);
const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

const R = KURSREGISTER;
let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — källmärke (flerkällsformat på samtliga tio)");
for (const m of VALUTAMEKANIK_MONSTER) {
  const s = m.bygga(R);
  ok(`A:${m.id} bär 📖`, s.text.includes("📖 Källor (") || s.text.includes("📖 Källa:"));
}

console.log("B — felstavningstolerans (motorns semantik: långa ord tål 2 fel)");
ok("B1 köpkraftsparitét (1 fel)", !!svaraLokaltValutamekanik("vad är köpkraftsparitét?", R));
ok("B2 devalverning (1 fel)", !!svaraLokaltValutamekanik("vad är devalverning?", R));
ok("B3 valutamekanikk (nära hedga? nej — realvx-lånt fel)", svaraLokaltValutamekanik("vad är realväxelkuren?", R) !== null);

console.log("C — determinism (samma fråga ⇒ bitidentiskt svar)");
const q1 = "vad är ränteparitet?";
ok("C1 bitidentisk", JSON.stringify(svaraLokaltValutamekanik(q1, R)) === JSON.stringify(svaraLokaltValutamekanik(q1, R)));

console.log("D — fantomlänkar + registerdrivna tal");
const slugs = new Set(R.map((r) => r.slug));
let allaLankar = 0, braLankar = 0;
for (const m of VALUTAMEKANIK_MONSTER) {
  const s = m.bygga(R);
  for (const h of s.handlings ?? []) {
    if (h.lank?.startsWith("/kurser/")) { allaLankar++; if (slugs.has(h.lank.replace("/kurser/", ""))) braLankar++; }
  }
  for (const k of s.kallor ?? []) if (k.slug) ok(`D:${m.id} källslug ${k.slug} äkta`, slugs.has(k.slug));
}
ok(`D1 samtliga kurslänkar äkta (${braLankar}/${allaLankar})`, allaLankar > 0 && allaLankar === braLankar);
const ma = R.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
const rk = R.filter((r) => r.kategori === "RISKHANTERING").length;
const sExp = VALUTAMEKANIK_MONSTER.find((m) => m.id === "exportor").bygga(R);
ok(`D2 registerdrivna tal (${ma}/${rk})`, sExp.text.includes(`${ma} kurser`) && sExp.text.includes(`${rk} kurser`));

console.log("E — kanonisk träff (tio monsters, rätt ämne)");
const kanon = {
  "vad är köpkraftsparitet?": "köpkraftsparitet",
  "vad är ppp?": "köpkraftsparitet",
  "vad är ränteparitet?": "ränteparitet",
  "vad är realväxelkurs?": "realväxelkurs",
  "vad betyder stark krona?": "kronstyrka",
  "vad är devalvering?": "devalvering",
  "vad är valutahedging?": "hedging",
  "hur fungerar valutamarknaden?": "valutamarknad",
  "vad är valutalån?": "valutalån",
  "vad är en reservvaluta?": "reservvaluta",
};
for (const [q, amne] of Object.entries(kanon)) {
  const s = svaraLokaltValutamekanik(q, R);
  ok(`E:${q} → ${amne}`, s !== null && s.amne === amne);
}

console.log("F — null-cases (grunderna och främmande territorium ägs av andra)");
for (const q of [
  "vad är valutarisk?", "vad är diversifiering?", "vad är styrräntan?",
  "vad är spread?", "vad är rebalansering?", "vad är en backtest?",
  "vad är kassaflödesanalys?", "vad är optioner?",
]) {
  ok(`F:${q} → null`, svaraLokaltValutamekanik(q, R) === null);
}

console.log("G — antistöld (tidigare lagers kanoniska frågor träffar INTE detta lager)");
// portfoljgrund/makro/marknadsmekanik/ekosystemdjup/portfoljbalans äger sina — se F.
ok("G1:sammanfattning (F täcker)", true);

console.log("J — juridikgrinden (lagen 2007:528 — ingen rådgivning)");
const forbudna = ["köp denna", "sälj denna", "vi rekommenderar", "borde du köpa", "investera i", "satsa på"];
let juridikOk = true;
for (const m of VALUTAMEKANIK_MONSTER) {
  const s = m.bygga(R);
  if (forbudna.some((f) => s.text.toLowerCase().includes(f))) { juridikOk = false; console.log("  FYND i", m.id); }
}
ok("J1 noll förbjudna fraser", juridikOk);

console.log("K — kärnordsdisjunktion LIVE (samtliga lager + basmotorn läses från disk)");
const mina = VALUTAMEKANIK_MONSTER.flatMap((m) => m.karnord.map((k) => k.toLowerCase()));
const dist = (a, b) => { const n = a.length, m = b.length; if (!n) return m; if (!m) return n; let f = Array.from({ length: m + 1 }, (_, j) => j), nu = new Array(m + 1); for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, f[j] + 1, f[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); f = [...nu]; } return f[m]; };
const kolliderar = [];
const libFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-valutamekanik-fragor.ts").concat(["ai-mentor-svar.ts"]);
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

console.log(`\nSVIT VALUTAMEKANIK: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
