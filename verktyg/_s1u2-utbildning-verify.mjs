#!/usr/bin/env node
// s1-u2 (manifest auto-s1-1789880702768) — granskningssond för B23
// utbildningsaktier-sa-analyserar-du-utbildningsbolag.json.
// Kör EXAKT samma förbjuden- fras-regexer (data/varumarke.json, "giu") som
// kontrolleraText (src/lib/varumarke.ts) på title+description+body — ingen
// egen juridiktolkning, maskinen är sanningen. Dessutom: aritmetik, 911-scan,
// struktur (title/OG/H2/disclaimer/ord), sifferparitet mot byggnotisen,
// korslänkar mot publicerade ytor.
import { readFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const ut = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/utbildningsaktier-sa-analyserar-du-utbildningsbolag.json`, "utf8"));
const vm = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, "utf8"));

let pass = 0, fel = 0, varn = 0;
const r = (ok, namn, detalj) => {
  if (ok) { pass++; console.log(`PASS ${namn}${detalj ? " — " + detalj : ""}`); }
  else { fel++; console.log(`FEL ${namn}${detalj ? " — " + detalj : ""}`); }
};
const v = (ok, namn, detalj) => {
  if (ok) pass++; else varn++;
  console.log(`${ok ? "PASS" : "VARNING"} ${namn}${detalj ? " — " + detalj : ""}`);
};

const body = ut.body;
const hela = [ut.title, ut.description, body].join("\n\n");

// ── A. Juridik/varumärke — kontrolleraText-likvor ────────────────────────────
console.log("== A. JURIDIK/VARUMÄRKE (data/varumarke.json, flaggor giu) ==");
for (const f of vm.forbjudnaFraser) {
  const re = new RegExp(f.fran, "giu");
  re.lastIndex = 0;
  const traff = [...hela.matchAll(re)];
  if (traff.length > 0) {
    const ctx = traff.slice(0, 3).map((t) => hela.slice(Math.max(0, t.index - 30), t.index + 40).replace(/\n/g, " "));
    if (f.allvar === "FEL") fel++; else varn++;
    console.log(`${f.allvar} ${f.fran} ×${traff.length} :: ${JSON.stringify(ctx)}`);
  } else pass++;
}
console.log(`(A summa: ${vm.forbjudnaFraser.length} fraser köpta; träffar ovan)`);

// Disclaimer: negerad investeringsråd som SISTA rad i body
const rader = body.trimEnd().split("\n");
const sista = rader[rader.length - 1];
r(/detta är pedagogisk finansanalys, inte investeringsråd\._?\s*$/i.test(sista), "A-disclaimer-sista-rad", JSON.stringify(sista.slice(0, 60)));
{
  const forekomster = [...body.matchAll(/investeringsråd/gi)];
  const onegerade = forekomster.filter((m) => /(inte|aldrig|ej)\s+(pedagogisk\s+finansanalys,\s+)?[a-zåäö\s]{0,30}investeringsråd/i.test(body.slice(Math.max(0, m.index - 45), m.index + 20)));
  r(forekomster.length === onegerade.length, "A-investeringsrad-endast-onegerat", `${forekomster.length} förekomst(er), ${onegerade.length} onegerad(e)`);
}

// Rådverb-manuell scan (extra skärpa utöver varumarke.json) — deskriptiva
// bolagsverb ("Pearson säljer examination") är falska positiva: rådgivning
// riktar sig till LÄSAREN ("du bör köpa"), inte till bolagets affärsmodell.
{
  const kandidater = [...body.matchAll(/\b(köpa|köper|sälja|säljer|rekommenderar|undvik|bör du|skynda)\b/gi)];
  const riktade = kandidater.filter((m) => /\bdu\b|[.]?\s*din/i.test(body.slice(Math.max(0, m.index - 60), m.index + 60)) && !/säljer (examination|undervisning|läromedel)/i.test(body.slice(Math.max(0, m.index - 40), m.index + 40)));
  v(riktade.length === 0, "A-radverb-0", `${kandidater.length} träff(ar) varav ${riktade.length} läsarro ärmade; övriga = bolagsbeskrivningar`);
}

// ── B. 911-mönster ───────────────────────────────────────────────────────────
console.log("== B. 911-MÖNSTER ==");
const p911 = [...hela.matchAll(/\b911\b/gi)].length + [...hela.matchAll(/11\s+september/gi)].length + [...hela.matchAll(/september\s+2001/gi)].length + [...hela.matchAll(/nine[- ]?eleven/gi)].length;
r(p911 === 0, "B-911-nollmönster", `${p911} träffar`);

// ── C. Aritmetik ────────────────────────────────────────────────────────────
console.log("== C. ARITMETIK (motorräknad) ==");
const n = (x) => x;
r(Math.abs(20360 / 19021 - 1.070) < 0.001, "C1-tillvaxt-7,0", `${(20360 / 19021 - 1).toFixed(4)}`);
r(Math.abs(1947 / 1752 - 1.111) < 0.001, "C2-ebit-11,1", `${(1947 / 1752 - 1).toFixed(4)}`);
r(Math.abs(1752 / 19021 - 0.092) < 0.0005, "C3-marginal-9,2", `${(1752 / 19021).toFixed(4)}`);
r(Math.abs(1947 / 20360 - 0.096) < 0.0005, "C4-marginal-9,6", `${(1947 / 20360).toFixed(4)}`);
r(Math.abs(115270 / 111290 - 1.036) < 0.001, "C5-volym-3,6", `${(115270 / 111290 - 1).toFixed(4)}`);
r(Math.abs(1.070 / 1.036 - 1.033) < 0.001, "C6-dekomponering-3,3", `${((1.070 / 1.036 - 1) * 100).toFixed(2)} %`);
r(Math.abs(20360e6 / 115270 - 176629) < 50, "C7-proxy-177-tkr", `${Math.round(20360e6 / 115270)} kr ≈ textens "cirka 177 000"`);
r(Math.abs(5 / 40 - 0.125) < 1e-9, "C8-belaggning-12,5", "5/40 = 12,5 %");
// Pearson marginal intern konsistens + Laureate Q1-föregående år
r(Math.abs((272.6 / 1.15) - 237.0) < 0.5, "C9-laureate-q1-baklanges", `Q1-25 ≈ ${(272.6 / 1.15).toFixed(1)} M$`);
// Textens egna talpar: +7,0 & +3,6 & +3,3 i SAMMANFATTNINGEN stämmer med mekanikstycket
r(body.includes("+7,0 procent") && body.includes("3,6 procent") && body.includes("3,3 procent"), "C10-siffersymmetri-text");

// ── D. Struktur ─────────────────────────────────────────────────────────────
console.log("== D. STRUKTUR ==");
r(ut.title.length <= 60, "D1-title-le-60", `${ut.title.length} tkn`);
r(ut.description.length <= 155, "D2-og-le-155", `${ut.description.length} tkn`);
const h2 = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
r(h2.length >= 2, "D3-h2-ge-2", `${h2.length} st: ${h2.join(" | ").slice(0, 120)}`);
r(/utbildningsaktier/i.test(ut.title), "D4-sokord-title");
const ingress = body.split(/^## /m)[0];
r(/utbildningsaktier/i.test(ingress), "D5-sokord-ingress");
const h2med = h2.filter((h) => /utbildningsaktier/i.test(h));
r(h2med.length >= 2, "D6-sokord-2-h2", `${h2med.length} st`);
const ord = body.split(/\s+/).filter(Boolean).length;
r(ord >= 1000 && ord <= 1400, "D7-ord-mal", `${ord} ord (mål ~1200)`);
const rm600 = Math.round(ord / 600), rm200 = Math.round(ord / 200);
v(ut.readingMinutes === rm600, "D8-readingminutes-600-konvention", `field=${ut.readingMinutes} /600=${rm600} /200=${rm200}`);
r(ut.pillar === "Institutionell metodik" && ut.author === "AK1A Research Lab", "D9-pillar-author");
r(/^\d{4}-\d{2}-\d{2}$/.test(ut.publishedAt), "D10-publishedAt-iso", ut.publishedAt);

// ── E. Korslänkar mot publicerade ytor ─────────────────────────────────────
console.log("== E. KORSLÄNKAR ==");
const lankar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
const bloggSlugs = new Set();
for (const f of ["v12-intaktsstabilitet-analys", "komplett-guide-svensk-aktieanalys-2026"]) {
  r(existsSync(`${ROT}/data/blogg/${f}.json`), `E-blogg-${f}`);
}
const dc = JSON.parse(readFileSync(`${ROT}/public/deep-courses.json`, "utf8"));
const kursIds = new Set();
(function walk(o) {
  if (Array.isArray(o)) { o.forEach(walk); return; }
  if (o && typeof o === "object") {
    for (const [k, val] of Object.entries(o)) {
      if ((k === "id" || k === "slug" || k === "kursId") && typeof val === "string") kursIds.add(val);
      walk(val);
    }
  }
})(dc);
for (const l of lankar) {
  if (l.startsWith("/kurser/")) {
    const id = l.replace("/kurser/", "");
    r(kursIds.has(id), `E-kurs-${id}`);
  } else if (l.startsWith("/blogg/")) {
    const slug = l.replace("/blogg/", "");
    r(existsSync(`${ROT}/data/blogg/${slug}.json`), `E-bloggpost-${slug}`);
  } else r(false, `E-okand-bas-${l}`);
}
r(lankar.length === 8, "E-antal-8", `${lankar.length} korslänkar`);

// ── F. Sifferparitet mot byggnotisen (worklog 14013 + SEO-GUIDER B23) ───────
console.log("== F. SIFFERPARITET ==");
const tal = ["20 360", "7,0", "1 947", "11,1", "9,6", "115 270", "3,6", "5 658", "10,6", "11,8", "119 430", "5,2", "19 021", "1 752", "9,2", "111 290", "3 577", "17,2", "16,9", "1,702", "8,6", "272,6"];
const saknas = tal.filter((t) => !body.includes(t));
r(saknas.length === 0, "F-paritet-notis", saknas.length ? `saknas: ${saknas.join(", ")}` : `${tal.length}/${tal.length} närvarande`);

console.log(`\nSUMMA: ${pass} PASS · ${varn} VARNING · ${fel} FEL`);
process.exit(fel > 0 ? 1 : 0);
