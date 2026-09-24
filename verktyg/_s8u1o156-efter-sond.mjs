#!/usr/bin/env node
/**
 * o156 (s8-u1) EFTER-sond — nyckeltalsguide-upptäckbarhet.
 *
 * Kurer (o156, commit i samma våg):
 *   A) sitemap.ts bär /data/nyckeltalsguide (okonditionell ISR-rutt,
 *      lastModified = datasetDatum).
 *   B) DatasetIndexVy + detaljvy (/dataset, /dataset/[bransch], sv/en/ar)
 *      länkar till guiden — nyckel dataset.guideLank ×3 språk.
 *
 * Sonden mäter LIVE-prod (localhost, loopback-whitelistad):
 *   1. /data/nyckeltalsguide → 200 (guiden lever)
 *   2. /en/data/nyckeltalsguide + /ar/data/... → 404 (DOM enbart-sv vid
 *      design, våg 87; speglar = bokad restpost, får ALDRIG lovas i
 *      sitemap förrän de byggs — o146-läran)
 *   3. sitemap.xml → EXAKT 1 nyckeltalsguide-träff (0 = VÄNTAR-DEPLOY:
 *      prod-synkens bygge har inte aktiverat koden ännu — ALDRIG fejkgrön)
 *   4. /dataset + /en/dataset + /ar/dataset → ≥1 guidlänk var
 *   5. /dataset/[en bransch] ×3 språk → ≥1 guidlänk var
 *
 * Exit: 0 = GRÖN (alla aktiva krav). 1 = FEL. 2 = VÄNTAR-DEPLOY
 * (krav 3/4 ännu inte aktiva — kör igen efter nästa grönt prod-bygge).
 * Källkoll utan server: grep -c "nyckeltalsguide" src/app/sitemap.ts ⇒ ≥1.
 */
import { readFileSync } from "node:fs";

const BAS = process.env.BAS ?? "http://localhost:3000";

async function hamta(sokvag) {
  try {
    const r = await fetch(BAS + sokvag, { redirect: "manual" });
    const text = r.status < 300 ? await r.text() : "";
    return { status: r.status, text };
  } catch (e) {
    return { status: 0, text: "", fel: String(e) };
  }
}

let fel = 0;
let vantar = 0;
const rad = (ok, meddelande) => {
  if (!ok) fel++;
  console.log(`${ok ? "PASS" : "FEL "} ${meddelande}`);
};

// Källkoll — alltid möjligt, oberoende av deploy-läge.
const sitemapKalla = readFileSync(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");
const komponentKalla = readFileSync(
  new URL("../src/components/ak1a/dataset-sidor.tsx", import.meta.url),
  "utf8",
);
const ordlistaKalla = readFileSync(new URL("../src/lib/ordlista.ts", import.meta.url), "utf8");
rad(sitemapKalla.includes("/data/nyckeltalsguide"), `K1 källkod: sitemap.ts bär /data/nyckeltalsguide`);
rad(
  (komponentKalla.match(/href="\/data\/nyckeltalsguide"/g) ?? []).length === 2,
  `K2 källkod: dataset-sidor.tsx bär exakt 2 guidlänkar (index+detalj)`,
);
rad(
  /"dataset\.guideLank"[\s\S]{0,600}?(sv:|en:|ar:)[\s\S]{0,600}?(?=\n  "|\n  \/\/)/.test(ordlistaKalla) &&
    (ordlistaKalla.match(/dataset\.guideLank/g) ?? []).length >= 1,
  `K3 källkod: ordlistan bär dataset.guideLank`,
);

// Live-prod.
const guide = await hamta("/data/nyckeltalsguide");
rad(guide.status === 200, `L1 /data/nyckeltalsguide → 200 (fick ${guide.status})`);

for (const p of ["/en/data/nyckeltalsguide", "/ar/data/nyckeltalsguide"]) {
  const r = await hamta(p);
  rad(r.status === 404, `L2 ${p} → 404 enligt enbart-sv-design (fick ${r.status})`);
}

const sitemap = await hamta("/sitemap.xml");
if (sitemap.status !== 200) {
  rad(false, `L3 sitemap.xml → 200 (fick ${sitemap.status})`);
} else {
  const antal = (sitemap.text.match(/nyckeltalsguide/g) ?? []).length;
  if (antal === 1) rad(true, `L3 sitemap.xml annonserar guiden exakt 1 gång`);
  else if (antal === 0) {
    vantar++;
    console.log("VÄNTAR-DEPLOY sitemap.xml har inte guiden ännu (prod-synkens bygge äger aktiveringen)");
  } else rad(false, `L3 sitemap.xml → exakt 1 väntat, fick ${antal} (dublett?)`);
}

const SPEGEL_SIDOR = ["/dataset", "/en/dataset", "/ar/dataset", "/dataset/teknik", "/en/dataset/teknik", "/ar/dataset/teknik"];
for (const sida of SPEGEL_SIDOR) {
  const r = await hamta(sida);
  if (r.status !== 200) {
    rad(false, `L4 ${sida} → 200 (fick ${r.status})`);
    continue;
  }
  const antal = (r.text.match(/href="\/data\/nyckeltalsguide"/g) ?? []).length;
  if (antal >= 1) rad(true, `L4 ${sida} bär ${antal} guidlänk(ar)`);
  else {
    vantar++;
    console.log(`VÄNTAR-DEPLOY ${sida} bär inte guidlänken ännu`);
  }
}

console.log(
  vantar > 0
    ? `\nDOM: VÄNTAR-DEPLOY (${vantar} krav ej aktiva, ${fel} fel) — kör igen efter nästa grönt prod-bygge`
    : fel > 0
      ? `\nDOM: RÖD (${fel} fel)`
      : "\nDOM: GRÖN — o156-kontraktet lever i prod",
);
process.exit(fel > 0 ? 1 : vantar > 0 ? 2 : 0);
