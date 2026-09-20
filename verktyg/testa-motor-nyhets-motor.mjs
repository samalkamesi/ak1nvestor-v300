/**
 * TESTA MOTOR — NYHETSMOTORN (v213b-u1, fabriksvåg: 10 otestade motorer).
 *
 * Kör:  npx --yes tsx verktyg/testa-motor-nyhets-motor.mjs
 *       (ren node dör på motorns ändelselösa "./datacache"-import —
 *       ERR_MODULE_NOT_FOUND är VÄNTAT; testaggregatorns tsx-återfall
 *       hanterar det, se verktyg/kor-alla-tester.mjs R107.)
 *
 * Kontraktssvit för src/lib/nyhets-motor.ts — BARA rena kontrakt:
 *   A  parsRssXml          — RSS 2.0/Atom-parsning, CDATA/entiteter,
 *                             https-länkregel, datumsyntaxer, maxAntal-tak,
 *                             trasiga items hophas, determinism
 *   B  valideraRssUrl      — SSRF-grinden: https-krav, privata/reserverade
 *                             IPv4+IPv6, numeriska/hex-värdar, *.local/
 *                             *.internal/localhost, inloggningsuppgifter,
 *                             längdgränser — och publika värdar släpps
 *   C  raknaPaverkan       — bas 10 + nyckelordsvikter + kontextbonus,
 *                             bud/budget-lookahead, 0–100-clamp, determinism
 *   D  raknaAk1aNot        — null vid ingen träff, max 2 V-variabler,
 *                             specificitetsordning (ev/ebitda→V06 före
 *                             V08), frågeform (ALDRIG råd — juridik 2007:528)
 *   E  STANDARD_AMNESKANALER — form, unika id, https + egen SSRF-grind
 *   F  hämtarnas nätverksfria kontrakt — ogiltiga indata ger tom array
 *                             FÖRE någon hämtning; hamtaNyhetsFlode kastar
 *                             ALDRIG (P8-graceful) och normaliserar konfigen
 *
 * Deterministisk: INGEN server, INGET nätverk, INGEN prod, INGA
 * miljöberoenden. Enda diskroken: hamtaNyhetsFlode({}) cachar tom array i
 * data/cache/ (gitignorerad accelerator) — inga nätverksanrop sker eftersom
 * alla källistor är tomma vid normaliserade ogiltiga indata.
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

let motor;
try {
  motor = await import(pathToFileURL(join(ROT, "src/lib/nyhets-motor.ts")).href);
} catch (e) {
  console.error(
    "FEL: import av src/lib/nyhets-motor.ts misslyckades — motorn importerar " +
      '"./datacache" ändelselöst; kör sviten under tsx: npx --yes tsx verktyg/testa-motor-nyhets-motor.mjs',
  );
  console.error(e); // rå fel bevarar ERR_MODULE_NOT_FOUND-markören för aggregatorns tsx-återfall
  process.exit(1);
}

const {
  parsRssXml,
  valideraRssUrl,
  raknaPaverkan,
  raknaAk1aNot,
  hamtaRssTicker,
  hamtaYahooNews,
  hamtaAllmantRss,
  hamtaNyhetsFlode,
  STANDARD_AMNESKANALER,
} = motor;

// ── Testharness (husets kontroll-mönster) ───────────────────────────────────
let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log("PASS  " + namn + (detalj ? "  — " + detalj : ""));
  } else {
    fail++;
    console.log("FAIL  " + namn + (detalj ? "  — " + detalj : ""));
  }
}

const t0 = Date.now();

// ── FALL A: parsRssXml — RSS 2.0/Atom-parsning ─────────────────────────────

const RSS_TVÅ = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Test</title>
<item>
  <title>Bolaget presenterar kvartalsrapport</title>
  <link>https://exempel.se/rapport</link>
  <pubDate>Thu, 18 Sep 2026 08:00:00 GMT</pubDate>
</item>
<item>
  <title><![CDATA[Aktie &amp; &#65; &#x42; nyheter]]></title>
  <link>http://exempel.se/osakert</link>
  <pubDate>inte ett datum</pubDate>
</item>
</channel></rss>`;

const a1 = parsRssXml(RSS_TVÅ, 12);
kontroll(
  "A1 parsRssXml: två giltiga items levereras (RSS 2.0)",
  Array.isArray(a1) && a1.length === 2,
  "fick " + (Array.isArray(a1) ? a1.length : "ej array"),
);
kontroll(
  "A2 parsRssXml: rubrik + https-länk + parsat datum (RFC 822)",
  a1.length === 2 &&
    a1[0].rubrik === "Bolaget presenterar kvartalsrapport" &&
    a1[0].lank === "https://exempel.se/rapport" &&
    a1[0].tid === Date.parse("Thu, 18 Sep 2026 08:00:00 GMT"),
  a1[0] ? JSON.stringify(a1[0]) : "inget item",
);
kontroll(
  "A3 parsRssXml: CDATA + entiteter avkodade (&amp; &#65; &#x42;)",
  a1.length === 2 && a1[1].rubrik === "Aktie & A B nyheter",
  a1[1] ? JSON.stringify(a1[1].rubrik) : "inget item",
);
kontroll(
  "A4 parsRssXml: http-länk underkänns (endast https) → lank null",
  a1.length === 2 && a1[1].lank === null,
  a1[1] ? String(a1[1].lank) : "inget item",
);
kontroll(
  "A5 parsRssXml: ogiltigt datum → tid null (aldrig kast)",
  a1.length === 2 && a1[1].tid === null,
  a1[1] ? String(a1[1].tid) : "inget item",
);

const RSS_FEM = Array.from(
  { length: 5 },
  (_, i) =>
    `<item><title>Nyhet nummer ${i + 1}</title><link>https://exempel.se/n${i + 1}</link></item>`,
).join("");
const a6 = parsRssXml(RSS_FEM, 3);
kontroll(
  "A6 parsRssXml: maxAntal-tak respekteras (5 items, tak 3)",
  a6.length === 3 && a6[0].rubrik === "Nyhet nummer 1" && a6[2].rubrik === "Nyhet nummer 3",
  "fick " + a6.length + " i dokumentordning",
);

const RSS_SAKNAD_TITEL = `<item><link>https://exempel.se/x</link></item>
<item><title>Den ende med titel</title><link>https://exempel.se/y</link></item>`;
kontroll(
  "A7 parsRssXml: item utan titel hophas — resten levereras",
  parsRssXml(RSS_SAKNAD_TITEL, 12).length === 1,
);

const ATOM_EN = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<entry>
  <title>Atomnyhet om emissionen</title>
  <link rel="self" href="https://exempel.se/feed"/>
  <link rel="alternate" href="https://exempel.se/atomnyhet"/>
  <published>2026-09-15T09:30:00Z</published>
</entry>
</feed>`;
const a8 = parsRssXml(ATOM_EN, 12);
kontroll(
  "A8 parsRssXml: Atom-entry med rel=alternate-företråde + ISO-datum",
  a8.length === 1 &&
    a8[0].rubrik === "Atomnyhet om emissionen" &&
    a8[0].lank === "https://exempel.se/atomnyhet" &&
    a8[0].tid === Date.parse("2026-09-15T09:30:00Z"),
  a8[0] ? JSON.stringify(a8[0]) : "inget item",
);

kontroll("A9 parsRssXml: tom sträng → []", parsRssXml("", 12).length === 0);
kontroll(
  "A10 parsRssXml: skräptext utan items → []",
  parsRssXml("detta är inte xml alls <html><body>hej</body></html>", 12).length === 0,
);
kontroll(
  "A11 parsRssXml: default maxAntal = 12 (13 items → 12)",
  parsRssXml(RSS_FEM + RSS_FEM + RSS_FEM, undefined).length === 12,
);
kontroll(
  "A12 parsRssXml: determinism — samma XML två gånger ⇒ bitidentiskt",
  JSON.stringify(parsRssXml(RSS_TVÅ, 12)) === JSON.stringify(parsRssXml(RSS_TVÅ, 12)),
);

// ── FALL B: valideraRssUrl — SSRF-grinden ───────────────────────────────────

const BRA_URLS = [
  "https://example.com/rss.xml",
  "https://feeds.finance.yahoo.com/rss/2.0/headline?s=VOLV-B.ST",
  "https://8.8.8.8/feed.xml",
  "https://172.32.0.1/feed.xml",
  "https://[2600::1]/feed.xml",
];
const braFel = BRA_URLS.filter((u) => valideraRssUrl(u).ok !== true);
kontroll(
  "B1 valideraRssUrl: publika https-värdar godkänns (domän, publik IPv4 utanför privata intervall, publik IPv6)",
  braFel.length === 0,
  braFel.length === 0 ? BRA_URLS.length + " st ok" : "underkända: " + braFel.join(", "),
);

const BLOCKERADE_VARDNAMN = [
  "https://localhost/rss",
  "https://app.localhost/rss",
  "https://skrivare.local/rss",
  "https://tjanst.internal/rss",
];
const namnFel = BLOCKERADE_VARDNAMN.filter((u) => valideraRssUrl(u).ok !== false);
kontroll(
  "B2 valideraRssUrl: localhost/*.localhost/*.local/*.internal blockeras",
  namnFel.length === 0,
  namnFel.length === 0 ? BLOCKERADE_VARDNAMN.length + " st blockerade" : "släppta: " + namnFel.join(", "),
);

const BLOCKERADE_IPV4 = [
  "https://127.0.0.1/rss",
  "https://10.0.0.1/rss",
  "https://192.168.1.1/rss",
  "https://172.16.0.1/rss",
  "https://169.254.169.254/rss",
  "https://100.64.1.1/rss",
];
const ipv4Fel = BLOCKERADE_IPV4.filter((u) => valideraRssUrl(u).ok !== false);
kontroll(
  "B3 valideraRssUrl: privata/reserverade IPv4 blockeras (127/10/192.168/172.16/169.254/CGNAT 100.64)",
  ipv4Fel.length === 0,
  ipv4Fel.length === 0 ? BLOCKERADE_IPV4.length + " st blockerade" : "släppta: " + ipv4Fel.join(", "),
);

const BLOCKERADE_IPV6 = [
  "https://[::1]/rss",
  "https://[::]/rss",
  "https://[::ffff:127.0.0.1]/rss",
  "https://[fe80::1]/rss",
  "https://[fd12::1]/rss",
];
const ipv6Fel = BLOCKERADE_IPV6.filter((u) => valideraRssUrl(u).ok !== false);
kontroll(
  "B4 valideraRssUrl: IPv6 loopback/ULA/link-local/mappad-IPv4 blockeras",
  ipv6Fel.length === 0,
  ipv6Fel.length === 0 ? BLOCKERADE_IPV6.length + " st blockerade" : "släppta: " + ipv6Fel.join(", "),
);

const BLOCKERADE_NUMERISKA = ["https://2130706433/rss", "https://0x7f.0.0.1/rss"];
const numFel = BLOCKERADE_NUMERISKA.filter((u) => valideraRssUrl(u).ok !== false);
kontroll(
  "B5 valideraRssUrl: numeriska/hex-värdar blockeras (2130706433 = 127.0.0.1)",
  numFel.length === 0,
  numFel.length === 0 ? BLOCKERADE_NUMERISKA.length + " st blockerade" : "släppta: " + numFel.join(", "),
);

kontroll(
  "B6 valideraRssUrl: http underkänns — endast https",
  valideraRssUrl("http://example.com/rss").ok === false,
  JSON.stringify(valideraRssUrl("http://example.com/rss")),
);
kontroll(
  "B7 valideraRssUrl: inloggningsuppgifter i URL underkänns",
  valideraRssUrl("https://user:pass@example.com/rss").ok === false,
);
kontroll(
  "B8 valideraRssUrl: tom/skräp/överlång URL underkänns (tak 2000 tecken)",
  valideraRssUrl("").ok === false &&
    valideraRssUrl("inte-en-url").ok === false &&
    valideraRssUrl("https://a.se/" + "x".repeat(2000)).ok === false,
);
kontroll(
  "B9 valideraRssUrl: svaret bär felmeddelande vid avvisning",
  (() => {
    const r = valideraRssUrl("https://127.0.0.1/rss");
    return r.ok === false && typeof r.fel === "string" && r.fel.length > 0;
  })(),
);

// ── FALL C: raknaPaverkan — intelligent påverkanspoäng ─────────────────────

kontroll(
  "C1 raknaPaverkan: tyst rubrik utan tickers ⇒ baspoäng 10",
  raknaPaverkan({ rubrik: "Stilla dagar på börsen" }) === 10,
  String(raknaPaverkan({ rubrik: "Stilla dagar på börsen" })),
);
kontroll(
  "C2 raknaPaverkan: konkurs väger 50 ⇒ 60",
  raknaPaverkan({ rubrik: "Bolaget i konkurs" }) === 60,
  String(raknaPaverkan({ rubrik: "Bolaget i konkurs" })),
);
kontroll(
  "C3 raknaPaverkan: 'bud' träffar men 'budget' gör det inte (lookahead)",
  raknaPaverkan({ rubrik: "Bud på bolaget lagt" }) === 50 &&
    raknaPaverkan({ rubrik: "Budget i balans" }) === 10,
  "bud=" + raknaPaverkan({ rubrik: "Bud på bolaget lagt" }) + " budget=" + raknaPaverkan({ rubrik: "Budget i balans" }),
);
kontroll(
  "C4 raknaPaverkan: versalokänslig rubrik matchar ändå (lowercase internt)",
  raknaPaverkan({ rubrik: "KONKURS HOTAR BOLAGET" }) === 60,
  String(raknaPaverkan({ rubrik: "KONKURS HOTAR BOLAGET" })),
);
kontroll(
  "C5 raknaPaverkan: alla vikter tillsammans clampas till 100",
  raknaPaverkan({
    rubrik:
      "Konkurs bud uppköp rättighetsteckning rapport nedskrivning vd utdelning prognos",
  }) === 100,
  String(
    raknaPaverkan({
      rubrik:
        "Konkurs bud uppköp rättighetsteckning rapport nedskrivning vd utdelning prognos",
    }),
  ),
);
kontroll(
  "C6 raknaPaverkan: portföljträff +20, bevakning +10, båda +30 (versalokänslig matchning)",
  raknaPaverkan({ rubrik: "Stilla dagar", tickers: ["volv-b.st"] }, { portfolj: ["VOLV-B.ST"] }) === 30 &&
    raknaPaverkan({ rubrik: "Stilla dagar", tickers: ["eric-b.st"] }, { bevakning: ["ERIC-B.ST"] }) === 20 &&
    raknaPaverkan(
      { rubrik: "Stilla dagar", tickers: ["volv-b.st", "eric-b.st"] },
      { portfolj: ["VOLV-B.ST"], bevakning: ["ERIC-B.ST"] },
    ) === 40,
);
kontroll(
  "C7 raknaPaverkan: kontext utan tickerräff ger ingen bonus",
  raknaPaverkan({ rubrik: "Stilla dagar" }, { portfolj: ["VOLV-B.ST"], bevakning: ["ERIC-B.ST"] }) === 10,
);
kontroll(
  "C8 raknaPaverkan: poäng ligger alltid i 0–100 (sanningsenlig mängd)",
  [0, 10, 25, 60, 100].every((n) => n >= 0 && n <= 100) &&
    raknaPaverkan({ rubrik: "" }) >= 0 &&
    raknaPaverkan({ rubrik: "" }) <= 100,
);
kontroll(
  "C9 raknaPaverkan: determinism — samma anrop två gånger ⇒ samma poäng",
  (() => {
    const n = { rubrik: "Rapport med utdelning och prognos", tickers: ["AAA-B.ST"] };
    const k = { portfolj: ["AAA-B.ST"] };
    return raknaPaverkan(n, k) === raknaPaverkan(n, k);
  })(),
);

// ── FALL D: raknaAk1aNot — pedagogisk V-koppling ────────────────────────────

kontroll(
  "D1 raknaAk1aNot: tom/oträffad rubrik ⇒ null",
  raknaAk1aNot("") === null && raknaAk1aNot("Vädret blev fint idag") === null,
);
kontroll(
  "D2 raknaAk1aNot: enkel träff ⇒ en V-variabel + reflekterande FRÅGA",
  (() => {
    const not = raknaAk1aNot("Bolaget gör ett större förvärv");
    return (
      not !== null &&
      not.vVariables.length === 1 &&
      not.vVariables[0] === "V14" &&
      typeof not.tanke === "string" &&
      not.tanke.endsWith("?")
    );
  })(),
  JSON.stringify(raknaAk1aNot("Bolaget gör ett större förvärv")),
);
kontroll(
  "D3 raknaAk1aNot: max 2 V-variabler även vid 3+ träffar (ordning hålls)",
  (() => {
    const not = raknaAk1aNot("Återköp och nyemission och lansering av produkt");
    return not !== null && not.vVariables.length === 2 &&
      not.vVariables[0] === "V20" && not.vVariables[1] === "V19";
  })(),
  JSON.stringify(raknaAk1aNot("Återköp och nyemission och lansering av produkt")),
);
kontroll(
  "D4 raknaAk1aNot: specificitet — ev/ebitda ger V06 FÖRE V08 (ebitda)",
  (() => {
    const not = raknaAk1aNot("EV/EBITDA-multipeln diskuteras");
    return not !== null && not.vVariables.includes("V06") && !not.vVariables.includes("V08");
  })(),
  JSON.stringify(raknaAk1aNot("EV/EBITDA-multipeln diskuteras")),
);
kontroll(
  "D5 raknaAk1aNot: V-variabler är välformade ur V01–V20",
  (() => {
    const rubriker = [
      "Större återköp av aktier",
      "Nyemission genomförs",
      "Lansering av ny produkt",
      "Patent beviljas",
      "Nätverkseffekter stärks",
      "Uppköp bekräftat",
      "Skulderna växer",
      "Bruttomarginalen pressas",
      "Ev/ebitda i fokus",
      "P/s multipeln",
      "Värderingen ifrågasatt",
      "Marginalen förbättras",
      "Ebitda stiger",
      "Arr växer",
      "Omsättningen tillväxer",
    ];
    const re = /^V(0[1-9]|1[0-9]|20)$/;
    return rubriker.every((r) => {
      const not = raknaAk1aNot(r);
      if (not === null) return false;
      return not.vVariables.every((v) => re.test(v));
    });
  })(),
);
kontroll(
  "D6 raknaAk1aNot: juridikgrind — tanken är fråga, aldrig köp/sälj-råd (2007:528)",
  (() => {
    const rubriker = [
      "Bolaget gör ett större förvärv",
      "Återköp och nyemission och lansering av produkt",
      "Skulderna växer för bolaget",
      "Omsättningen tillväxer kraftigt",
    ];
    return rubriker.every((r) => {
      const not = raknaAk1aNot(r);
      if (not === null) return false;
      return (
        not.tanke.endsWith("?") &&
        !/^\s*(köp|sälj|säll)\b/i.test(not.tanke) &&
        !/\b(köp|sälj) (aktier|nu|direkt)\b/i.test(not.tanke)
      );
    });
  })(),
);
kontroll(
  "D7 raknaAk1aNot: determinism — samma rubrik två gånger ⇒ identisk not",
  JSON.stringify(raknaAk1aNot("Utdelningen och värderingen diskuteras")) ===
    JSON.stringify(raknaAk1aNot("Utdelningen och värderingen diskuteras")),
);

// ── FALL E: STANDARD_AMNESKANALER — förvalda ämneskanaler ──────────────────

kontroll(
  "E1 STANDARD_AMNESKANALER: array med fyra kanaler och unika id",
  Array.isArray(STANDARD_AMNESKANALER) &&
    STANDARD_AMNESKANALER.length === 4 &&
    new Set(STANDARD_AMNESKANALER.map((k) => k.id)).size === 4,
  Array.isArray(STANDARD_AMNESKANALER) ? STANDARD_AMNESKANALER.map((k) => k.id).join(", ") : "ej array",
);
kontroll(
  "E2 STANDARD_AMNESKANALER: varje kanal har icke-tomma strängfält (id/namn/url/beskrivning)",
  STANDARD_AMNESKANALER.every(
    (k) =>
      typeof k.id === "string" && k.id.length > 0 &&
      typeof k.namn === "string" && k.namn.length > 0 &&
      typeof k.url === "string" && k.url.length > 0 &&
      typeof k.beskrivning === "string" && k.beskrivning.length > 0,
  ),
);
kontroll(
  "E3 STANDARD_AMNESKANALER: egna URL:ar passerar motorns EGEN SSRF-grind (https + publik värd)",
  STANDARD_AMNESKANALER.every((k) => valideraRssUrl(k.url).ok === true),
  STANDARD_AMNESKANALER.filter((k) => valideraRssUrl(k.url).ok !== true).map((k) => k.id).join(", ") || "alla ok",
);

// ── FALL F: hämtarnas nätverksfria kontrakt (ogiltiga indata ⇒ tom array) ──

kontroll(
  "F1 hamtaRssTicker: ogiltig ticker ⇒ [] före varje hämtning (regexvallen)",
  (await hamtaRssTicker("!!!")) .length === 0 && (await hamtaRssTicker("")).length === 0,
);
kontroll(
  "F2 hamtaYahooNews: ogiltig ticker ⇒ [] före varje hämtning",
  (await hamtaYahooNews("har mellanslag")).length === 0,
);
kontroll(
  "F3 hamtaAllmantRss: SSRF-blockerad/icke-https-URL ⇒ [] före varje hämtning",
  (
    await Promise.all([
      hamtaAllmantRss("http://example.com/rss"),
      hamtaAllmantRss("https://localhost/rss"),
      hamtaAllmantRss("https://127.0.0.1/rss"),
      hamtaAllmantRss("inte-en-url"),
      hamtaAllmantRss(""),
    ])
  ).every((r) => Array.isArray(r) && r.length === 0),
);
kontroll(
  "F4 hamtaNyhetsFlode: tom konfig ⇒ array (P8-graceful, kastar ALDRIG)",
  Array.isArray(await hamtaNyhetsFlode({})),
);
kontroll(
  "F5 hamtaNyhetsFlode: normaliserar bort ogiltiga indata ⇒ [] utan kast",
  Array.isArray(
    await hamtaNyhetsFlode({
      tickers: ["!!!"],
      amnen: ["finns-ej"],
      rssUrls: ["http://exempel.se/rss"],
    }),
  ) &&
    (await hamtaNyhetsFlode({
      tickers: ["!!!"],
      amnen: ["finns-ej"],
      rssUrls: ["http://exempel.se/rss"],
    })).length === 0,
);
kontroll(
  "F6 hamtaNyhetsFlode: undefined/null-handtag ⇒ [] (P8-graceful)",
  (await hamtaNyhetsFlode(undefined)).length === 0 &&
    (await hamtaNyhetsFlode(null)).length === 0,
);

// ── Resultat ────────────────────────────────────────────────────────────────

const sek = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`Tid: ${sek} s (${pass + fail} kontroller)`);
if (fail > 0) {
  console.log("ÄRLIGT RÖTT: " + fail + " kontroll(er) misslyckades — se FAIL-raderna ovan.");
}
console.log(`RESULTAT: ${pass}/${pass + fail} PASS`);
process.exit(fail === 0 ? 0 : 1);
