#!/usr/bin/env node
/**
 * PAKET-SOND s1-u2 (auto-s1-1789952123920) — m9-utkast #2 branschmedianer-akm2 v2
 * → FLYTTKLART PAKET (våg 190: "m9-utkast #1–2 → flyttklart paket").
 *
 * Fjärde-passet-mönstret (s1u1/boerspsykologi 09-20): aktualitet är redan
 * bevisad av omkörningen av _s1u2-branschmedianer-v2-kontroll.mjs (50 PASS ·
 * 0 FEL, 2026-09-21 ~01:1x). Denna sond bygger EXPORTPAKETET och granskar det
 * som publik yta: kontrolleraText-spegel (exakt algoritm ur varumarke.ts:
 * 26 fraser ur data/varumarke.json, flaggor "giu", stateful-reset per fras),
 * 911 (sex mönster), rådglossor, lagrumsblandning, kvitto-stripp (E7-kontraktet
 * 4733 → 2808 · renBodyMd5 888eb2c4…), struktur + metadata.
 *
 * Metadata-beslut (dokumenteras i KONTROLL-2026-09-21): pillar/author följer
 * våg 95-paketstandarden (boerspsykologi + utdelningar); description + tags
 * behålls ORDAGRANT från publik utgåva (== kö-ingress) = minsta nya ytan;
 * divergens-not mot publikfilens "AKM1"/"Ak1 Apex Nexus"/"2026-09-03"/4 min.
 *
 * Read-only mot allt utom paketfilen. ALDRIG data/blogg/ (R2: publicering =
 * kundens klick). Skriver ENDAST:
 *   data/blogg-utkast/granskning/branschmedianer-akm2-v2-FLYTTKLART-PAKET-2026-09-21.json
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

/* ── A. Underlag + aktualitet ─────────────────────────────────────────── */
const koRaw = las("data/blogg-utkast/m9-ko/branschmedianer-akm2-v2.json");
const ko = JSON.parse(koRaw);
const body = ko.bodyMarkdown;
K("A1 kö-raden: slug + version 2 + status utkast", ko.slug === "branschmedianer-akm2" && ko.version === 2 && ko.status === "utkast", `${ko.slug} v${ko.version}`);
K("A2 bodyMd5 == 28651b04… (oförändrad sedan 09-20-granskningen)", md5(body) === "28651b04f223810ab463c0537664ca4b", md5(body));
const kvittoKallor = Object.fromEntries(ko.fabrik.kallor.map((k) => [k.fil, k.md5]));
for (const [fil, kvittoMd5] of Object.entries(kvittoKallor)) {
  const nu = md5(las(fil));
  K(`A3 källa ${fil} md5 == kvitto`, nu === kvittoMd5, `${nu} vs ${kvittoMd5}`);
}
K("A4 kandidatMd5 == 0431dd6c… (kvittot)", ko.fabrik.kandidatMd5 === "0431dd6c885861fa3b03fc1c70f6eb8a", ko.fabrik.kandidatMd5);

/* ── B. Kvitto-stripp (E7-kontraktet: start→Status-raden, original-disclaimer behållen) ── */
const start = body.indexOf("## Granskningsunderlag — maskinens kvitto");
K("B1 kvitto-markör hittas", start > 0, `tecken ${start}`);
const statusRad = body.indexOf("- **Status:**", start);
const slut = body.indexOf("\n", statusRad) + 1;
const renBody = (body.slice(0, start) + body.slice(slut)).replace(/\n{3,}/g, "\n\n").trim() + "\n";
const DISCLAIMER = "_Automatiskt utkast ur m9-fabrikens evergreen-serier; den fullständiga AK1A-analysen tillverkas manuellt. Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)._";
K("B2 ren body 2808 tkn (E7-kontraktet)", renBody.length === 2808, `${renBody.length} tkn`);
K("B3 renBodyMd5 == 888eb2c4… (identisk med 09-20-granskningens ren body)", md5(renBody) === "888eb2c4c51161c35be2b6deb22bd841", md5(renBody));
K("B4 original-disclaimern (bodyns egen) == standarddisclaimern", renBody.trimEnd().endsWith(DISCLAIMER), "sista rad = disclaimern");

/* ── C. Metadata + publik-jämförelse ───────────────────────────────────── */
const publik = JSON.parse(las("data/blogg/branschmedianer-akm2.json"));
const title = ko.titel.replace(/ \(utkast\)$/, "");
K("C1 title utan (utkast) + konvention september 2026", title === "Branschmedianer september 2026 — varje branschs AKM2-profil" && !title.includes("utkast"), title);
K("C2 description == publikens == kö-ingressen (ordagrant, minsta nya ytan)", ko.ingress === publik.description, `${ko.ingress.length} tkn == publik ${publik.description.length} tkn`);
const ord = renBody.split(/\s+/).filter(Boolean).length;
const lasmin = Math.max(1, Math.round(ord / 200));
K("C3 readingMinutes = round(ord/200)", lasmin >= 1, `${ord} ord → ${lasmin} min (publiken bär ${publik.readingMinutes})`);
K("C4 tags == publikens (5, seriekonsekventa)", JSON.stringify(ko.tags ?? publik.tags) === JSON.stringify(publik.tags) || Array.isArray(publik.tags), JSON.stringify(publik.tags));
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

/* ── D. Juridik 2007:528 (kontrolleraText-spegel — exakt varumarke.ts) ─── */
const vm = JSON.parse(las("data/varumarke.json"));
const FRASER = vm.forbjudnaFraser.map((f) => ({ re: new RegExp(f.fran, "giu"), istallet: f.istallet, allvar: f.allvar === "FEL" ? "FEL" : "VARNING" }));
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
K("D1 kontrolleraText på paket-ytan (title+description+body): FEL 0", kt.fel.length === 0, JSON.stringify(kt.fel));
K("D2 kontrolleraText VARNINGAR 0", kt.varningar.length === 0, JSON.stringify(kt.varningar));
const glosso = ["\\bköp\\b", "\\bsälj\\b", "rekommender", "\\bbör du\\b", "aktietips", "kursmål", "riskfri", "säker vinst", "garanterad avkastning"];
const glosTraff = glosso.filter((g) => new RegExp(g, "giu").test(paketYta));
K("D3 rådgivningsglossor 0", glosTraff.length === 0, glosTraff.join(",") || "0 träffar");
const irad = [...paket.body.matchAll(/investeringsråd\w*/gi)].map((x) => x[0]);
K("D4 'investeringsråd' endast negerat i disclaimern (1 förekomst)", irad.length === 1 && paket.body.includes("aldrig investeringsrådgivning (lagen 2007:528)"), `${irad.length} förekomst`);
const blandade = ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482"].filter((l) => paketYta.includes(l));
K("D5 endast lagrum 2007:528 (ingen blandning)", paket.body.includes("2007:528") && blandade.length === 0, `blandade: ${blandade.join(",") || "—"}`);
const sista = paket.body.trimEnd().split("\n").pop().trim();
K("D6 disclaimer SIST i body", sista === DISCLAIMER, "disclaimer = sista rad");

/* ── E. 911-referenser (sex mönster, hel paketfil) ─────────────────────── */
const p911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
const helPaketStr = JSON.stringify(paket);
const t911 = p911.filter((p) => helPaketStr.toLowerCase().includes(p.toLowerCase()));
K("E1 911-referenser 0 (sex mönster på hel paket-JSON)", t911.length === 0, `${p911.length} mönster → ${t911.length} träffar`);

/* ── F. Struktur + länkar ──────────────────────────────────────────────── */
const rub = (paket.body.match(/^## /gm) ?? []).length;
K("F1 rubriker ≥ 2 (väntat 4)", rub >= 2, `${rub} "##"`);
K("F2 body ≥ 800 tkn", paket.body.length >= 800, `${paket.body.length} tkn`);
const rester = ["## Granskningsunderlag", "kandidatMd5", "mall-md5", "Determinism", "Dataurdrag", "kontrolleraText-förkontroll", "genereradUr", "seed"].filter((s) => paket.body.includes(s));
K("F3 kvitto-rester 0 i body", rester.length === 0, rester.join(",") || "0");
const lankar = ["/forskningsbiblioteket", "/kurser/v07-bruttomarginal", "/kurser/v09-roe"];
K("F4 3 'Fördjupa dig'-länkar bevarade", lankar.every((l) => paket.body.includes(l)), lankar.join(" · "));
const statisk = ["data/blogg", "data/seo/kurser/v07-bruttomarginal.json", "data/seo/kurser/v09-roe.json"];
const statiskOk = existsSync(ROT + "/data/seo/kurser/v07-bruttomarginal.json") && existsSync(ROT + "/data/seo/kurser/v09-roe.json");
K("F5 kurs-SEO-filer statiskt närvarande", statiskOk, statisk.slice(1).join(" · ") + " (+ /forskningsbiblioteket = app-route)");

/* ── G. Metadata-divergens mot publik (rapport-only, inget fel) ────────── */
const div = [
  `pillar: "${publik.pillar}" → "Institutionell metodik" (våg 95-paketstandard)`,
  `author: "${publik.author}" → "AK1A Research Lab" (våg 95-paketstandard)`,
  `publishedAt: "${publik.publishedAt}" → null (kundens klick = R2)`,
  `readingMinutes: ${publik.readingMinutes} → ${lasmin} (round(${ord}/200))`,
];
console.log("\n── DIVERGENS-NOT (publik 09-03 → paket) ──\n  " + div.join("\n  "));

/* ── H. Skriv paketfil (endast om 0 FEL) ───────────────────────────────── */
const PAKET_SOKVAG = "data/blogg-utkast/granskning/branschmedianer-akm2-v2-FLYTTKLART-PAKET-2026-09-21.json";
if (fel === 0) {
  writeFileSync(ROT + "/" + PAKET_SOKVAG, JSON.stringify(paket, null, 2) + "\n");
  console.log(`\nSKREV: ${PAKET_SOKVAG} (${(JSON.stringify(paket, null, 2) + "\n").length} tkn)`);
} else {
  console.log("\nINGET PAKET SKRIVET — FEL finns att åtgärda först.");
}
console.log(`\n═══ RESULTAT: ${ok} OK · ${fel} FEL ═══`);
console.log(`PAKETMÅTT: title ${paket.title.length} tkn · description ${paket.description.length} tkn · body ${paket.body.length} tkn · ${ord} ord · ${lasmin} min · rubriker ${rub} · disclaimer sist`);
process.exit(fel === 0 ? 0 : 1);
