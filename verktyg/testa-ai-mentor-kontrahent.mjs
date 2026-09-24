#!/usr/bin/env node
// Testsvit — AI-MENTORN omgång 25: KONTRAHENT (två förhandsfrågor)
// Mönster: testa-ai-mentor-valutamekanik.mjs (våg 210). Kör filen direkt:
//   node verktyg/testa-ai-mentor-kontrahent.mjs
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

const { svaraLokaltKontrahent, KONTRAHENT_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-kontrahent-fragor.ts")).href
);
const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

const R = KURSREGISTER;
let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — källmärke (flerkällsformat på båda monstren)");
for (const m of KONTRAHENT_MONSTER) {
  const s = m.bygga(R);
  ok(`A:${m.id} bär 📖`, s.text.includes("📖 Källor (") || s.text.includes("📖 Källa:"));
  ok(`A:${m.id} ≥3 källor (numrerad lista)`, s.kallor.length >= 3 && s.text.includes(`📖 Källor (${s.kallor.length})`));
}

console.log("B — felstavningstolerans (motorns semantik: långa ord tål 1–2 fel)");
ok("B1 kontrahentrsik (1 fel)", !!svaraLokaltKontrahent("vad är kontrahentrsik?", R));
ok("B2 clearinghus (1 fel: cleeringhus)", !!svaraLokaltKontrahent("vad är ett cleeringhus?", R));
ok("B3 garantifond (1 fel: garantifond→garantifund)", !!svaraLokaltKontrahent("vad är en garantifund?", R));
ok("B4 motpart (1 fel: modpart)", !!svaraLokaltKontrahent("vem är modparten?", R));

console.log("C — determinism (samma fråga ⇒ bitidentiskt svar)");
const q1 = "vad är kontrahentrisk?";
ok("C1 bitidentisk", JSON.stringify(svaraLokaltKontrahent(q1, R)) === JSON.stringify(svaraLokaltKontrahent(q1, R)));
const q2 = "vad är ett clearinghus?";
ok("C2 bitidentisk (clearinghus)", JSON.stringify(svaraLokaltKontrahent(q2, R)) === JSON.stringify(svaraLokaltKontrahent(q2, R)));

console.log("D — fantomlänkar + registerdrivna tal + aritmetik");
const slugs = new Set(R.map((r) => r.slug));
let allaLankar = 0, braLankar = 0;
for (const m of KONTRAHENT_MONSTER) {
  const s = m.bygga(R);
  for (const h of s.handlings ?? []) {
    if (h.lank?.startsWith("/kurser/")) { allaLankar++; if (slugs.has(h.lank.replace("/kurser/", ""))) braLankar++; }
  }
  for (const k of s.kallor ?? []) ok(`D:${m.id} källslug ${k.slug} äkta`, slugs.has(k.slug));
  if (s.fordjupa?.lank?.startsWith("/kurser/")) ok(`D:${m.id} fordjupa äkta`, slugs.has(s.fordjupa.lank.replace("/kurser/", "")));
}
ok(`D1 samtliga kurslänkar äkta (${braLankar}/${allaLankar})`, allaLankar > 0 && allaLankar === braLankar);
const rk = R.filter((r) => r.kategori === "RISKHANTERING").length;
const sKontrahent = KONTRAHENT_MONSTER.find((m) => m.id === "kontrahentrisk").bygga(R);
ok(`D2 registerdrivet tal (RISKHANTERING ${rk})`, sKontrahent.text.includes(`(${rk} kurser)`));
// D03 — aritmetikkontroller (oberoende omräknade i testet, ej bara strängmatch)
const sClearing = KONTRAHENT_MONSTER.find((m) => m.id === "clearinghus").bygga(R);
{
  const netto = 8 - 5 + 2, brutto = 8 + 5 + 2;
  ok("D03a netting +8−5+2 = +5 / brutto 15", netto === 5 && brutto === 15 && sKontrahent.text.includes("brutto 15") && sKontrahent.text.includes("netto +5"));
  const trappa = 28 + 8 + 4;
  ok("D03b trappan 28+8+4 = 40", trappa === 40 && sClearing.text.includes("28 + 8 + 4 = 40"));
  ok("D03c trappandelar 70/20/10", Math.round((28 / 40) * 100) === 70 && Math.round((8 / 40) * 100) === 20 && Math.round((4 / 40) * 100) === 10 && sClearing.text.includes("70 procent") && sClearing.text.includes("20 procent") && sClearing.text.includes("10 procent"));
  const aktiepant = 50000 / 0.8;
  ok("D03d aktiepant 50 000 ÷ 0,80 = 62 500", aktiepant === 62500 && sClearing.text.includes("62 500"));
  ok("D03e haircuts 100/98/80 per 100", sClearing.text.includes("100, statspapper som 98") && sClearing.text.includes("aktier som 80"));
}

console.log("E — kanonisk träff (rätt monster, rätt ämne)");
const kanon = {
  "vad är kontrahentrisk?": "kontrahentrisk",
  "vad är en kontrahent?": "kontrahentrisk",
  "vem är motparten?": "kontrahentrisk",
  "vad är motpartsrisk?": "kontrahentrisk",
  "vad är netting?": "kontrahentrisk",
  "vem står på andra sidan när det blåser?": "kontrahentrisk",
  "vad är ett clearinghus?": "clearinghus",
  "vad är en clearingcentral?": "clearinghus",
  "vad är collateral?": "clearinghus",
  "vad är en garantifond?": "clearinghus",
  "vad är en haircut?": "clearinghus",
  "vad är säkerhetskrav?": "clearinghus",
  "vad är default-trappan?": "clearinghus",
};
for (const [q, amne] of Object.entries(kanon)) {
  const s = svaraLokaltKontrahent(q, R);
  ok(`E:${q} → ${amne}`, s !== null && s.amne === amne);
}

console.log("F — null-cases (dokumenterade gränser: andras ord lämnas ifred)");
for (const q of [
  "vad är initial margin?",         // basens (sond rond 1: [2 bas])
  "vad är variation margin?",       // basens
  "vad är ccc?",                    // kapitalbindningens (ccp ströks för deras skull)
  "vad är valutarisk?",             // portfoljgrund + valutamekanik
  "vad är kreditpremien?",          // kreditdjupets
  "vad är spread?",                 // marknadsmekanikens/basens
  "vad är kassakonvertringscykeln?", // kapitalbindningens (felstavning skadar ej — deras kärnord bär)
  "vad är terminsbelopp?",          // naket termin = nästas (mitt nettoavtal rör ej)
  "vad är optioner?",               // nästas
  "vad är styrräntan?",             // makros
  "vad är en backtest?",            // ekosystemdjupets
  "vad är kassaflödesanalys?",      // extrats
]) {
  ok(`F:${q} → null`, svaraLokaltKontrahent(q, R) === null);
}

console.log("G2 — antistöld LIVE (kedjans samtliga kanoniska frågor mot detta lager)");
{
  const kedjeSrc = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const kanoniskaBlock = kedjeSrc.slice(kedjeSrc.indexOf("const KANONISKA = ["), kedjeSrc.indexOf("];", kedjeSrc.indexOf("const KANONISKA = [")));
  const KANONISKA = [...kanoniskaBlock.matchAll(/\{ fraga: "([^"]+)",\s*motor: (\d+) \}/g)].map((m) => ({ fraga: m[1], motor: Number(m[2]) }));
  const mina = KANONISKA.filter((x) => x.motor === MOTORINDEX_KONTRAHENT(KANONISKA));
  const andras = KANONISKA.filter((x) => x.motor !== MOTORINDEX_KONTRAHENT(KANONISKA));
  const stolder = andras.filter((x) => svaraLokaltKontrahent(x.fraga, R) !== null);
  ok(`G2:0 stölder av ${andras.length} främmande kanoniska`, stolder.length === 0);
  if (stolder.length) console.log("   STÖLD:", stolder.map((x) => x.fraga).join(" · "));
}
function MOTORINDEX_KONTRAHENT(lista) { return Math.max(...lista.map((x) => x.motor)); }

console.log("J — juridikgrinden (lagen 2007:528 — ingen rådgivning)");
const forbudna = ["köp denna", "sälj denna", "vi rekommenderar", "borde du köpa", "investera i", "satsa på", "vi råder"];
let juridikOk = true;
for (const m of KONTRAHENT_MONSTER) {
  const s = m.bygga(R);
  if (forbudna.some((f) => s.text.toLowerCase().includes(f))) { juridikOk = false; console.log("  FYND i", m.id); }
}
ok("J1 noll förbjudna fraser", juridikOk);

console.log("K — kärnordsdisjunktion LIVE (samtliga lager + basmotorn läses från disk)");
const mina = KONTRAHENT_MONSTER.flatMap((m) => m.karnord.map((k) => k.toLowerCase()));
const dist = (a, b) => { const n = a.length, m = b.length; if (!n) return m; if (!m) return n; let f = Array.from({ length: m + 1 }, (_, j) => j), nu = new Array(m + 1); for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, f[j] + 1, f[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); f = [...nu]; } return f[m]; };
const kolliderar = [];
const libFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-kontrahent-fragor.ts").concat(["ai-mentor-svar.ts"]);
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
  ok("L1 import finns", widget.includes('from "@/lib/ai-mentor-kontrahent-fragor"'));
  ok("L2 komposition efter etfmekanik (semikolonlöst — syskon kan wireas efter)", widget.includes("svaraLokaltEtfmekanik(q, KURSREGISTER) ?? svaraLokaltKontrahent(q, KURSREGISTER)"));
}

console.log(`\nSVIT KONTRAHENT: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
