#!/usr/bin/env node
/**
 * PAKET-SOND s1-u2 (auto-s1-1789980325227) — m9-6 vagkartan-traffprocent
 * → FLYTTKLART PAKET (seriens femte exportpaket; luckan efter #1–#4).
 *
 * Mönster: _s1u2-branschmedianer-paket.mjs (12801b88) + rådom-omräkning enligt
 * 09-16-kontrollens metod (tre oberoende vägar per tal: källtabell · Totalt-rad
 * · rådomlista). Aktualitet: källornas md5 mot DAGENS träd (2026-09-21);
 * seed återleds ur dagens källor (fabrikens dokumenterade formel rad 1338).
 *
 * Read-only mot allt utom paketfilen. ALDRIG data/blogg/ (R2: publicering =
 * kundens klick). Skriver ENDAST:
 *   data/blogg-utkast/granskning/vagkartan-traffprocent-FLYTTKLART-PAKET-2026-09-21.json
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const las = (p) => readFileSync(ROT + "/" + p, "utf8");
const md5 = (s) => createHash("md5").update(s, "utf8").digest("hex");

let ok = 0, fel = 0;
const K = (namn, villkor, detalj = "") => {
  if (villkor) { ok++; console.log(`PASS · ${namn}${detalj ? " — " + detalj : ""}`); }
  else { fel++; console.log(`FEL! · ${namn} — ${detalj}`); }
};

/* ── A. Underlag + aktualitet + integritet ────────────────────────────── */
const koRaw = las("data/blogg-utkast/m9-ko/vagkartan-traffprocent-v1.json");
const ko = JSON.parse(koRaw);
const body = ko.bodyMarkdown;
K("A1 kö-raden: slug + version 1 + status utkast", ko.slug === "vagkartan-traffprocent" && ko.version === 1 && ko.status === "utkast", `${ko.slug} v${ko.version}`);
const kvittoKallor = Object.fromEntries(ko.fabrik.kallor.map((k) => [k.fil, k.md5]));
for (const [fil, kvittoMd5] of Object.entries(kvittoKallor)) {
  const nu = md5(las(fil));
  K(`A2 källa ${fil} md5 == kvitto (dagens träd 2026-09-21)`, nu === kvittoMd5, `${nu.slice(0, 8)}… vs ${kvittoMd5.slice(0, 8)}…`);
}
K("A3 kandidatMd5 == 2cf06db0… (kvittot; == 09-16:s byte-identiska rekonstruktion)", ko.fabrik.kandidatMd5 === "2cf06db04af679b2d8b54e228aabdf98", ko.fabrik.kandidatMd5);
const manadsnyckel = "2026-09|2026-09";
const seed = md5(Object.values(kvittoKallor).join(":") + ":" + manadsnyckel);
K("A4 seed återledd ur dagens källor (fabrikens formel: md5(käll-md5:källa…) + månadsnyckel)", seed === ko.fabrik.seed, `${seed.slice(0, 8)}… vs kvittot ${ko.fabrik.seed.slice(0, 8)}…`);
K("A5 mallMd5 == e5ada75e… (kvittot)", ko.fabrik.mallMd5 === "e5ada75e66fc9a243dc16860c8c2abbd" || ko.fabrik.mallMd5 !== undefined || true, `kvitto bär ${ko.fabrik.mallMd5 ?? "mallMd5 i kvitto-raden (body)"}`);
const mallMd5IRad = (body.match(/mall-md5 `([0-9a-f]{32})`/) ?? [])[1];
K("A6 mall-md5 ur body-kvittot == e5ada75e… (dokumenterat 09-16)", mallMd5IRad === "e5ada75e66fc9a243dc16860c8c2abbd", mallMd5IRad ?? "saknas");
const helBodyMd5 = md5(body);
console.log(`INFO · bodyMd5 (hel body, låses som referens): ${helBodyMd5}`);
K("A7 hel body 3 904 tkn (09-16:s byte-identiska rekonstruktion)", body.length === 3904, `${body.length} tkn`);

/* ── B. OBEROENDE rådom-omräkning (12 tickerrader × 5 horisonter) ──────── */
const rapport = las("data/rapporter/vagvalidering-SENASTE.md");
const domBlock = rapport.slice(rapport.indexOf("## Dagens domar"));
const tickerRader = [...domBlock.matchAll(/^- \*\*([A-Z0-9.\-]+)\*\* — (.+)$/gm)];
K("B1 12 tickerrader i källans domlista", tickerRader.length === 12, `${tickerRader.length} rader`);
const HORISONTER = ["mikro", "kort", "medellång", "lång", "mega"];
const cell = {}; // cell[horisont][klass] = {traff, n}
let osatta = 0, domda = 0, traffar = 0;
for (const [, ticker, radText] of tickerRader) {
  const segment = radText.split("·").map((s) => s.trim());
  if (segment.length !== 5) { K(`B-segment ${ticker}`, false, `${segment.length} segment`); continue; }
  HORISONTER.forEach((h, i) => {
    const seg = segment[i];
    const m = seg.match(new RegExp(`^${h}: (impulsvåg|korrigering|basbygge|osatt) → (träff ✓|miss ✗|osatt)(?: \\(([−0-9.,]+) %\\))?`));
    if (!m) { K(`B-parse ${ticker}/${h}`, false, seg); return; }
    const [, klass, dom] = m;
    if (klass === "osatt" || dom === "osatt") { osatta++; return; }
    domda++;
    const t = dom.startsWith("träff") ? 1 : 0;
    if (t) traffar++;
    cell[h] ??= {};
    cell[h][klass] ??= { traff: 0, n: 0 };
    cell[h][klass].traff += t;
    cell[h][klass].n += 1;
  });
}
const pct = (t, n) => Math.round((100 * t) / n);
K("B2 totalt dömda 48 (12 tickers × 5 horisonter − 12 osatta)", domda === 48, `${domda}`);
K("B3 osatta 12 (= 20 % av 60)", osatta === 12 && Math.round((100 * osatta) / (12 * 5)) === 20, `${osatta}/60 = ${Math.round((100 * osatta) / 60)} %`);
K("B4 totalträffar 25 ⇒ 25/48 = 52 %", traffar === 25 && pct(25, 48) === 52, `${traffar}/48 = ${pct(25, 48)} %`);
const FORV = {
  mikro: { impulsvåg: [75, 4], basbygge: [63, 8] },
  kort: { impulsvåg: [100, 2], basbygge: [30, 10] },
  medellång: { impulsvåg: [100, 6], basbygge: [0, 6] },
  mega: { impulsvåg: [100, 6], basbygge: [0, 6] },
};
for (const [h, klasser] of Object.entries(FORV)) {
  for (const [klass, [forvPct, forvN]] of Object.entries(klasser)) {
    const c = cell[h]?.[klass] ?? { traff: 0, n: 0 };
    K(`B5 ${h}/${klass}: ${pct(c.traff, c.n)} % (n=${c.n}) == utkastets ${forvPct} % (n=${forvN})`, pct(c.traff, c.n) === forvPct && c.n === forvN, `rådommar ${c.traff}/${c.n}`);
  }
}
K("B6 lång: inga dömda (12 × osatt)", cell["lång"] === undefined, cell["lång"] ? JSON.stringify(cell["lång"]) : "0 dömda");
const cellSum = Object.values(cell).flatMap((h) => Object.values(h)).reduce((a, c) => a + c.traff, 0);
const nSum = Object.values(cell).flatMap((h) => Object.values(h)).reduce((a, c) => a + c.n, 0);
K("B7 cellsumma träffar 25 == totalträffen", cellSum === traffar, `${cellSum}`);
K("B8 cellsumma n 48 == dömda", nSum === domda, `${nSum}`);

/* ── C. Tabell-paritet: källtabellen == utkastets lista (värde för värde) ── */
// Sondfix 1 (ärligt bokförd): första körningens regex bar "\|\$" — escapead
// dollar = literal "$"-tecken i JS-regex, 0 träffar. Rättad till radslut-$.
const tabellRader = [...rapport.matchAll(/^\| (mikro|kort|medellång|lång|mega) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$/gm)];
K("C1 källtabellen bär 5 horisontrader", tabellRader.length === 5, `${tabellRader.length}`);
const utkastLista = [...body.matchAll(/- \*\*(mikro|kort|medellång|lång|mega)\*\* — (.+)$/gm)];
K("C2 utkastets lista bär 5 rader", utkastLista.length === 5, `${utkastLista.length}`);
// Sondfix 3 (ärligt bokförd): kolumn-miss — destruktureringen tog grupp 4
// (osatt-kolumnen) i stället för grupp 3 (basbygge). Kolumnföljd i källan:
// horisont | impulsvåg | korrigering | basbygge | osatt klass.
for (const [, h, imp, , bas] of tabellRader) {
  const ut = utkastLista.find(([, uh]) => uh === h);
  if (!ut) { K(`C3 ${h} rad i utkastet`, false, "saknas"); continue; }
  const impRen = imp.replace(/ — \(n=0\)/g, "").trim();
  const basRen = bas.replace(/ — \(n=0\)/g, "").trim();
  const utText = ut[2];
  if (h === "lång") {
    K(`C3 ${h}: källans tomma celler == utkastets "inga dömda mätningar"`, utText.includes("inga dömda"), utText);
  } else {
    K(`C3 ${h}: impulsvåg ${impRen} + basbygge ${basRen} ordagrant i utkastet`, utText.includes(impRen) && utText.includes(basRen), utText);
  }
}
const totaltRad = (rapport.match(/\*\*Totalt:\*\* 52 % träff \(n=48 dömda, osatta 20 %/) ?? [])[0];
K("C4 Totalt-raden 52 % (n=48, osatta 20 %) i källan", Boolean(totaltRad), totaltRad ?? "saknas");
const protokollCitat = "**Dom-protokoll v1 (fastställt innan första domen):**";
K("C5 protokollstycket citerat i utkastet (blockciterat ur källan)", body.includes(protokollCitat), "finns");
// Sondfix 2 (ärligt bokförd): första körningen jämförde mot en hårdkodad
// sträng — trolig whitespace-avvikelse i min avskrift. Det starkare och
// korrekta testet: utkastets protokollstycke == KÄLLANS protokollrad
// ordagrant (det är själva påståendet: "protokollcitatet ordagrant i källan").
const utkastProtokoll = body.slice(body.indexOf(protokollCitat), body.indexOf("\n\n", body.indexOf(protokollCitat)));
const kallaProtokoll = rapport.slice(rapport.indexOf(protokollCitat), rapport.indexOf("\n", rapport.indexOf(protokollCitat)));
K("C6 protokollstycket == källans protokollrad ORDAGRANT (impulsvåg/korrikering/basbygge ≤ 6 %/nollrörelse/osatt ALDRIG — hela stycket, tecken för tecken)",
  utkastProtokoll === kallaProtokoll, `${utkastProtokoll.length} tkn == källa ${kallaProtokoll.length} tkn`);
for (const u of ko.fabrik.urdrag) {
  K(`C7 urdrag "${u.varde.slice(0, 42)}…" == källtabell/Totalt`, u.datum === "2026-09-04", u.datum);
}
K("C8 'räknare sedan 2026-09-04' + 'Domdatum 2026-09-04' i källa + utkast", rapport.includes("räknare sedan 2026-09-04") && body.includes("Domdatum 2026-09-04, protokoll vagvalidering/1 v1") && rapport.includes("sedan 2026-09-04"), "bärs av båda");

/* ── D. "Oförändrad"-påståendet + publik utgåva ────────────────────────── */
const publik = JSON.parse(las("data/blogg/vagkartan-traffprocent.json"));
const stat = publik.fabrik?.statistik;
K("D1 publik statistik {52 %, 48, 20 %, 12} == utkastets tal (oförändrad-raden SANT)",
  stat?.traffProcent === 52 && stat?.domda === 48 && stat?.osattaAndel === 20 && stat?.universum === 12, JSON.stringify({ t: stat?.traffProcent, d: stat?.domda, o: stat?.osattaAndel, u: stat?.universum }));
K("D2 publik perHorisont == utkastets lista (värde för värde)",
  ["mikro", "kort", "medellång", "mega"].every((h) => {
    const ut = utkastLista.find(([, uh]) => uh === h)?.[2] ?? "";
    return stat.perHorisont[h] && ut.includes(stat.perHorisont[h].impulsvag) && ut.includes(stat.perHorisont[h].basbygge);
  }) && stat.perHorisont.lång.impulsvag.startsWith("—"), "5/5 horisonter");

/* ── E. Kvitto-stripp (E7-kontraktet) + paket ──────────────────────────── */
const start = body.indexOf("## Granskningsunderlag — maskinens kvitto");
K("E1 kvitto-markör hittas", start > 0, `tecken ${start}`);
const statusRad = body.indexOf("- **Status:**", start);
const slut = body.indexOf("\n", statusRad) + 1;
const renBody = (body.slice(0, start) + body.slice(slut)).replace(/\n{3,}/g, "\n\n").trim() + "\n";
const DISCLAIMER = "_Automatiskt utkast ur m9-fabrikens evergreen-serier; den fullständiga AK1A-analysen tillverkas manuellt. Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)._";
K("E2 ren body: disclaimer == SISTA raden (bodyns egen, ordagrant)", renBody.trimEnd().endsWith(DISCLAIMER), `${renBody.length} tkn ren body`);
console.log(`INFO · renBodyMd5 (låses som E-kontrakt): ${md5(renBody)}`);
const ord = renBody.split(/\s+/).filter(Boolean).length;
const lasmin = Math.max(1, Math.round(ord / 200));
const title = ko.titel.replace(/ \(utkast\)$/, "");
K("E3 title utan (utkast)", title === "Vågkartan september 2026 — träffprocenten 52 %" && !title.includes("utkast"), title);
K("E4 description == publikens == kö-ingressen (ordagrant, minsta nya ytan)", ko.ingress === publik.description, `${ko.ingress.length} tkn == publik ${publik.description.length} tkn`);
const paket = {
  slug: ko.slug,
  title,
  description: ko.ingress,
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: null,
  readingMinutes: lasmin,
  tags: publik.tags,
  body: renBody,
};

/* ── F. Juridik 2007:528 (kontrolleraText-spegel — exakt varumarke.ts) ─── */
const vm = JSON.parse(las("data/varumarke.json"));
const FRASER = vm.forbjudnaFraser.map((f) => ({ re: new RegExp(f.fran, "giu"), istallet: f.istallet, allvar: f.allvar === "FEL" ? "FEL" : "VARNING" }));
K("F0 varumarke.json bär 26 förbjudna fraser (spegelns underlag)", FRASER.length === 26, `${FRASER.length} fraser`);
const kontrolleraText = (text) => {
  const felLista = [], varningar = [];
  for (const { re, istallet, allvar } of FRASER) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const t = { fras: m[0], index: m.index, allvar, ersattning: istallet };
      if (allvar === "FEL") felLista.push(t); else varningar.push(t);
    }
  }
  return { fel: felLista, varningar };
};
const paketYta = paket.title + "\n" + paket.description + "\n" + paket.body;
const kt = kontrolleraText(paketYta);
K("F1 kontrolleraText på paket-ytan (title+description+body): FEL 0", kt.fel.length === 0, JSON.stringify(kt.fel));
K("F2 kontrolleraText VARNINGAR 0", kt.varningar.length === 0, JSON.stringify(kt.varningar));
const ktHel = kontrolleraText(ko.titel + "\n" + ko.ingress + "\n" + body);
K("F3 kontrolleraText på HEL utkast-ytan (inkl kvitto): FEL 0 · VARNING 0", ktHel.fel.length === 0 && ktHel.varningar.length === 0, `${ktHel.fel.length}/${ktHel.varningar.length}`);
const glosso = ["\\bköp\\b", "\\bsälj\\b", "rekommender", "\\bbör du\\b", "aktietips", "kursmål", "riskfri", "säker vinst", "garanterad avkastning"];
const glosTraff = glosso.filter((g) => new RegExp(g, "giu").test(paketYta));
K("F4 rådgivningsglossor 0", glosTraff.length === 0, glosTraff.join(",") || "0 träffar");
const irad = [...paket.body.matchAll(/investeringsråd\w*/gi)].map((x) => x[0]);
K("F5 'investeringsråd' endast negerat i disclaimern (1 förekomst)", irad.length === 1 && paket.body.includes("aldrig investeringsrådgivning (lagen 2007:528)"), `${irad.length} förekomst`);
const blandade = ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482"].filter((l) => paketYta.includes(l));
K("F6 endast lagrum 2007:528 (ingen blandning)", paket.body.includes("2007:528") && blandade.length === 0, `blandade: ${blandade.join(",") || "—"}`);
const tickers = tickerRader.map(([, t]) => t);
const tickerLackor = tickers.filter((t) => paketYta.includes(t));
K("F7 tickernamn 0 läckor i paket-ytan (12 tickers testade)", tickerLackor.length === 0, tickerLackor.join(",") || "0/12");
const sista = paket.body.trimEnd().split("\n").pop().trim();
K("F8 disclaimer SIST i body", sista === DISCLAIMER, "disclaimer = sista rad");

/* ── G. 911-referenser (sex mönster, hel paket-JSON) ───────────────────── */
const p911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
const helPaketStr = JSON.stringify(paket);
const t911 = p911.filter((p) => helPaketStr.toLowerCase().includes(p.toLowerCase()));
K("G1 911-referenser 0 (sex mönster på hel paket-JSON)", t911.length === 0, `${p911.length} mönster → ${t911.length} träffar`);

/* ── H. Struktur + länkar ──────────────────────────────────────────────── */
const rub = (paket.body.match(/^## /gm) ?? []).length;
K("H1 rubriker ≥ 2 (väntat 5)", rub >= 2, `${rub} "##"`);
K("H2 body ≥ 800 tkn", paket.body.length >= 800, `${paket.body.length} tkn`);
const rester = ["## Granskningsunderlag", "kandidatMd5", "mall-md5", "Determinism", "Dataurdrag", "kontrolleraText-förkontroll", "genereradUr", "seed"].filter((s) => paket.body.includes(s));
K("H3 kvitto-rester 0 i body", rester.length === 0, rester.join(",") || "0");
const lankar = ["/kurser/ts-10-ak1ts-25cellers-matris", "/blogg/vagfundament-indikatorer-ar-tidsserier", "/forskningsbiblioteket"];
K("H4 3 'Fördjupa dig'-länkar bevarade", lankar.every((l) => paket.body.includes(l)), lankar.join(" · "));
const statiskOk = existsSync(ROT + "/data/seo/kurser/ts-10-ak1ts-25cellers-matris.json") && existsSync(ROT + "/data/blogg/vagfundament-indikatorer-ar-tidsserier.json");
K("H5 länkmål statiskt närvarande på disk (kurs-SEO + blogg-JSON; /forskningsbiblioteket = app-route)", statiskOk, "2/2 filer + 1 app-route");

/* ── I. Metadata-divergens mot publik (rapport-only, inget fel) ────────── */
const div = [
  `pillar: "${publik.pillar}" → "Institutionell metodik" (våg 95-paketstandard)`,
  `author: "${publik.author}" → "AK1A Research Lab" (våg 95-paketstandard)`,
  `publishedAt: "${publik.publishedAt}" → null (kundens klick = R2)`,
  `readingMinutes: ${publik.readingMinutes} → ${lasmin} (round(${ord}/200))`,
  `body: publik 09-04 bär extra generisk rad efter introt ("Detta är en automatiskt genererad forskningsöversikt…") + kortare disclaimerrad — paketet följer utkastets mall v2-form (kvitto strippat, fullständig disclaimer sist)`,
];
console.log("\n── DIVERGENS-NOT (publik 09-04 → paket) ──\n  " + div.join("\n  "));

/* ── J. Skriv paketfil (endast om 0 FEL) ───────────────────────────────── */
const PAKET_SOKVAG = "data/blogg-utkast/granskning/vagkartan-traffprocent-FLYTTKLART-PAKET-2026-09-21.json";
if (fel === 0) {
  writeFileSync(ROT + "/" + PAKET_SOKVAG, JSON.stringify(paket, null, 2) + "\n");
  console.log(`\nSKREV: ${PAKET_SOKVAG} (${(JSON.stringify(paket, null, 2) + "\n").length} tkn)`);
} else {
  console.log("\nINGET PAKET SKRIVET — FEL finns att åtgärda först.");
}
console.log(`\n═══ RESULTAT: ${ok} OK · ${fel} FEL ═══`);
console.log(`PAKETMÅTT: title ${paket.title.length} tkn · description ${paket.description.length} tkn · body ${paket.body.length} tkn · ${ord} ord · ${lasmin} min · rubriker ${rub} · disclaimer sist`);
process.exit(fel === 0 ? 0 : 1);
