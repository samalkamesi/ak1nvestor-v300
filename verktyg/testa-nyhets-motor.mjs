#!/usr/bin/env node
// Testsvit — NYHETS-MOTORN (våg 213 del b / o106): deterministiska kontrakt
// för parsRssXml, valideraRssUrl (SSRF), raknaPaverkan och raknaAk1aNot.
// Nätberoende hämtare (hamtaRssTicker m.fl.) testas EJ här — transport ägs
// av live-driften; denna svit låser de rena beräkningarna.
// Kör: node verktyg/testa-nyhets-motor.mjs  (Node ≥ 22.18: type stripping)
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { parsRssXml, valideraRssUrl, raknaPaverkan, raknaAk1aNot } = await import(
  pathToFileURL(join(ROT, "src/lib/nyhets-motor.ts")).href
);

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

console.log("A — parsRssXml: RSS 2.0");
const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>Test</title>
<item><title>Bolag X röstar igenom emission</title><link>https://exempel.se/a1</link><pubDate>Mon, 20 Sep 2026 08:00:00 GMT</pubDate></item>
<item><title>Ingen länk här</title><pubDate>Mon, 20 Sep 2026 07:00:00 GMT</pubDate></item>
<item><title>Ogiltigt datum</title><link>https://exempel.se/a3</link><pubDate>inte ett datum</pubDate></item>
<item><title></title><link>https://exempel.se/a4</link></item>
</channel></rss>`;
const r1 = parsRssXml(rss, 12);
ok("A1 tre items (tom rubrik hopphas)", r1.length === 3);
ok("A2 rubriker i ordning", r1[0]?.rubrik === "Bolag X röstar igenom emission");
ok("A3 länk läst ur <link>", r1[0]?.lank === "https://exempel.se/a1");
ok("A4 datum parsat till epok-ms", typeof r1[0]?.tid === "number" && r1[0].tid === Date.parse("Mon, 20 Sep 2026 08:00:00 GMT"));
ok("A5 ogiltigt datum ⇒ tid null (inte krasch)", r1[2]?.tid === null);
const r2 = parsRssXml(rss, 1);
ok("A6 maxAntal-respekterat (cap 1)", r2.length === 1);
ok("A7 skräp-XML ⇒ tom array", parsRssXml("hej hopp").length === 0);

console.log("B — parsRssXml: Atom");
const atom = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
<entry><title>Atomrubrik</title><link rel="alternate" href="https://exempel.se/atom1"/><updated>2026-09-19T10:00:00Z</updated></entry>
</feed>`;
const b1 = parsRssXml(atom, 12);
ok("B1 atom-entry parsad", b1.length === 1 && b1[0]?.rubrik === "Atomrubrik");
ok("B2 atom-länk ur href-attribut", b1[0]?.lank === "https://exempel.se/atom1");
ok("B3 <updated> respekterad som tid", typeof b1[0]?.tid === "number");

console.log("C — valideraRssUrl: SSRF-vakten (säkerhetskritisk)");
ok("C1 https-publik värd ok", valideraRssUrl("https://feeds.example.com/rss").ok === true);
ok("C2 http nekas", valideraRssUrl("http://feeds.example.com/rss").ok === false);
ok("C3 loopback-IP nekas", valideraRssUrl("https://127.0.0.1/rss").ok === false);
ok("C4 10/8 nekas", valideraRssUrl("https://10.1.2.3/rss").ok === false);
ok("C5 192.168/16 nekas", valideraRssUrl("https://192.168.0.5/rss").ok === false);
ok("C6 172.16/12 nekas", valideraRssUrl("https://172.16.0.1/rss").ok === false);
ok("C7 169.254 link-local nekas", valideraRssUrl("https://169.254.169.254/rss").ok === false);
ok("C8 CGNAT 100.64 nekas (djupledsförsvar)", valideraRssUrl("https://100.64.0.1/rss").ok === false);
ok("C9 0.0.0.0 nekas", valideraRssUrl("https://0.0.0.0/rss").ok === false);
ok("C10 numerisk värd 2130706433 nekas", valideraRssUrl("https://2130706433/rss").ok === false);
ok("C11 hex-värd 0x7f.0.0.1 nekas", valideraRssUrl("https://0x7f.0.0.1/rss").ok === false);
ok("C12 localhost nekas", valideraRssUrl("https://localhost/rss").ok === false);
ok("C13 *.local nekas", valideraRssUrl("https://skrivare.local/rss").ok === false);
ok("C14 *.internal nekas", valideraRssUrl("https://db.internal/rss").ok === false);
ok("C15 IPv6 ::1 nekas", valideraRssUrl("https://[::1]/rss").ok === false);
ok("C16 IPv6 ULA fd00:: nekas", valideraRssUrl("https://[fd00::1]/rss").ok === false);
ok("C17 IPv6-mappad ::ffff:127.0.0.1 nekas", valideraRssUrl("https://[::ffff:127.0.0.1]/rss").ok === false);
ok("C18 inloggningsuppgifter i URL nekas", valideraRssUrl("https://user:pass@feeds.example.com/rss").ok === false);
ok("C19 publik IPv4 tillåts (8.8.8.8)", valideraRssUrl("https://8.8.8.8/rss").ok === true);
ok("C20 ogiltig URL-sträng nekas", valideraRssUrl("inte en url").ok === false);

console.log("D — raknaPaverkan: poäng 0–100, deterministisk");
const bas = raknaPaverkan({ rubrik: "stiligt bolag håller bolagsstämma" });
ok("D1 neutral rubrik ⇒ baspoäng 10", bas === 10);
const hoy = raknaPaverkan({ rubrik: "Bolaget höjer utdelningen efter stark rapport" });
ok("D2 nyckelordsvikter höjer poängen", hoy > bas);
ok("D3 clamp vid 100", raknaPaverkan({ rubrik: "kris krasch konkurs förlust skuld utspädning emission" }) <= 100);
const p1 = raknaPaverkan({ rubrik: "rapport", tickers: ["VOLV-B.ST"] }, { portfolj: ["volv-b.st"], bevakning: [] });
const p2 = raknaPaverkan({ rubrik: "rapport", tickers: ["VOLV-B.ST"] }, { portfolj: [], bevakning: ["volv-b.st"] });
const p3 = raknaPaverkan({ rubrik: "rapport", tickers: ["VOLV-B.ST"] }, { portfolj: [], bevakning: [] });
ok("D4 portföljbonus +20 (skiftlägesokänslig)", p1 - p3 === 20);
ok("D5 bevakningsbonus +10", p2 - p3 === 10);
ok("D6 determinism (samma indata ⇒ samma poäng)", raknaPaverkan({ rubrik: "emission i sikte", tickers: ["X"] }) === raknaPaverkan({ rubrik: "emission i sikte", tickers: ["X"] }));

console.log("E — raknaAk1aNot: pedagogisk V-koppling (juridikgrind: alltid fråga, aldrig råd)");
ok("E1 tom rubrik ⇒ null", raknaAk1aNot("") === null);
ok("E2 V-lös rubrik ⇒ null", raknaAk1aNot("Bolaget sponsorar en golfturnering") === null);
const n1 = raknaAk1aNot("Storbolaget förvärvar konkurrent och belånar sig för uppköpet");
ok("E3 V-koppling träffar (V14+V10)", n1 !== null && n1.vVariables.includes("V14") && n1.vVariables.includes("V10"));
ok("E4 max 2 V-variabler", (n1?.vVariables?.length ?? 0) <= 2);
ok("E5 tanken är fråga (slutar med ?)", typeof n1?.tanke === "string" && n1.tanke.trim().endsWith("?"));
const n2 = raknaAk1aNot("Ny emission väntas samtidigt som bolaget gör återköp");
ok("E6 specificitetsordning: återköp V20 före emission V19", n2 !== null && n2.vVariables[0] === "V20" && n2.vVariables[1] === "V19");
const alla = ["utdelning höjs", "emission", "lansering av ny produkt", "patent beviljat", "nätverkseffekt", "uppköp", "skuld", "bruttomarginal", "ev/ebitda", "p/s", "värdering", "marginal", "ebitda", "arr", "tillväxt"];
const nota = alla.map((t) => raknaAk1aNot(t)).filter((x) => x !== null);
ok(`E7 samtliga nyckelordsfamiljer ger nota (${nota.length}/${alla.length})`, nota.length === alla.length);
const radTexter = [n1, n2, ...nota].map((n) => (n?.tanke ?? "") + " " + (n?.vVariables ?? []).join(" ")).join(" ").toLowerCase();
ok("E8 juridikgrind: aldrig köp/sälj-råd i noten", !/\bköp (denna )?aktie\b|sälj (denna )?aktie\b|rekommenderar att (köpa|sälja)/.test(radTexter));

console.log(`\nSVIT NYHETS-MOTOR: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
