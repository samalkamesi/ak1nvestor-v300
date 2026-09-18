#!/usr/bin/env node
// KVD för Ö16 forsakringsaktier-en (s3-u1, manifest auto-s3-1789740301420) — 0/0-krav.
// Läser endast: originalet B16, översättningen, data/varumarke.json. Skriver inget.
import { readFileSync } from "node:fs";

const bas = "/home/ak1a/AK1";
const org = JSON.parse(readFileSync(`${bas}/data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag.json`, "utf8"));
const en = JSON.parse(readFileSync(`${bas}/data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag-en.json`, "utf8"));
const vm = JSON.parse(readFileSync(`${bas}/data/varumarke.json`, "utf8"));

const r = [];
const ok = (namn, villkor, info = "") => r.push(`${villkor ? "GRÖN" : "RÖD"} ${namn}${info ? " — " + info : ""}`);

// 1. Struktur: samma fältuppsättning som originalet (BlogPost-formen)
const falt = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
ok("struktur: alla BlogPost-fält", falt.every((f) => f in en));
ok("slug = originalets + -en", en.slug === org.slug + "-en");

// 2. Längder: title ≤ 60, OG-description ≤ 155 (sökordsdisciplinen)
ok("title ≤ 60 tkn", en.title.length <= 60, `${en.title.length} tkn`);
ok("description ≤ 155 tkn", en.description.length <= 155, `${en.description.length} tkn`);

// 3. Ord i body 800–1 400 (raw-metoden: whitespace-tokens)
const ord = (t) => t.trim().split(/\s+/).length;
const ordEn = ord(en.body), ordOrg = ord(org.body);
ok("ord 800–1 400", ordEn >= 800 && ordEn <= 1400, `${ordEn} ord (originalet ${ordOrg})`);

// 4. readingMinutes = round(ord/600)
ok("readingMinutes = round(ord/600)", en.readingMinutes === Math.round(ordEn / 600), `${en.readingMinutes} mot ${Math.round(ordEn / 600)}`);

// 5. Primärt sökord "insurance stocks" i title + ingress (första stycket) + minst en H2
const ingress = en.body.split("\n\n")[0];
const h2or = [...en.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
ok("sökord i title", /insurance stocks/i.test(en.title));
ok("sökord i ingress", /insurance stocks/i.test(ingress));
ok("sökord i ≥1 H2", h2or.some((h) => /insurance stocks/i.test(h)), `${h2or.length} H2`);

// 6. Varumärkesgrinden: SAMMA regexer som kontrolleraText (varumarke.ts), 3 ytor
const yta = en.title + "\n" + en.description + "\n" + en.body;
let fel = 0, varningar = 0; const traffade = [];
for (const f of vm.forbjudnaFraser) {
  const re = new RegExp(f.fran, "giu"); re.lastIndex = 0; let m;
  while ((m = re.exec(yta)) !== null) {
    if (f.allvar === "FEL") { fel++; traffade.push("FEL:" + m[0]); } else { varningar++; traffade.push("VARN:" + m[0]); }
  }
}
ok("varumärkesgrind 0 FEL", fel === 0, traffade.join(", ") || "0 träffar");
ok("varumärkesgrind 0 VARNING", varningar === 0, traffade.join(", ") || "0 träffar");

// 7. Rådverb EN+SV (juridikgrinden 2007:528 — imperativ rådgivning mot läsaren)
const radVerb = /\b(buy (this|the) (stock|share)|sell (this|the) (stock|share)|you should (buy|sell)|köp (aktien|denna)|sälj (aktien|denna)|du bör (köpa|sälja)|vi rekommenderar (köp|sälj)|our recommendation is)\b/gi;
const radTr = [...yta.matchAll(radVerb)].map((m) => m[0]);
ok("rådverb EN+SV 0", radTr.length === 0, radTr.join(", ") || "0 träffar");

// 8. Länkparitet: interna länkar (/kurser/ + /blogg/) MULTISET-identiska med originalet
const lank = (t) => [...t.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map((m) => m[1]).sort();
const lOrg = lank(org.body), lEn = lank(en.body);
const multiset = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
ok("korslänkar multiset-identiska", multiset(lOrg, lEn), `${lEn.length} länkar (originalet ${lOrg.length})`);

// 9. Talparitet: originalets bärande tal (SV→EN-normaliserade) finns i översättningen
const tal = ["0.24","0.34","100","74","22","96","82","104","83.6","0.7","1,485","92.2","93.4","16.4","7.8","85","136.0","33.7","18.16","2.55","−22.8","96.2","89.0","67.0","12.6","16.7","0.51","0.35","3.38","24.1","2.47","19.6","15.3","7.1","7.9","14.7","1,998","73","16.2","2.1","14.6","17.10","3.8","55","11.40","14.5","0.36","3.7","218","2022","2025"];
const saknas = tal.filter((t) => !en.body.includes(t));
ok("talparitet (50 bärande tal)", saknas.length === 0, saknas.length ? "SAKNAS: " + saknas.join(", ") : `${tal.length}/${tal.length}`);

// 10. Aritmetik: exakta uträkningar i exemplen (motorräknat, inte hämtat ur texten)
const a = [];
a.push(["74 + 22 = 96 (combined ratio vinstfallet)", 74 + 22 === 96]);
a.push(["82 + 22 = 104 (combined ratio förlustfallet)", 82 + 22 === 104]);
a.push(["100 − 96 = 4 (fyra kvar av hundra)", 100 - 96 === 4]);
a.push(["104 − 100 = 4 (teknisk förlust fyra)", 104 - 100 === 4]);
a.push(["4 % × 100 = 4 i finansresultat ⇒ resultat noll trots förlust", Math.abs(0.04 * 100 - 4) < 1e-9]);
a.push(["136.0 ÷ 33.7 ≈ 4.0 (kassan överstiger skulden fyra gånger)", Math.abs(136.0 / 33.7 - 4.036) < 0.01]);
a.push(["18.16 ÷ 2.55 ≈ 7.1 (mer än sju gånger)", Math.abs(18.16 / 2.55 - 7.12) < 0.01]);
a.push(["100 − 83.6 = 16.4 (If kvar per hundra)", Math.abs(100 - 83.6 - 16.4) < 1e-9]);
a.push(["100 − 92.2 = 7.8 (Allianz kvar per hundra)", Math.abs(100 - 92.2 - 7.8) < 1e-9]);
a.push(["24.1 ÷ 3.38 ≈ 7.1 (Sampo ROE/PB)", Math.abs(24.1 / 3.38 - 7.13) < 0.01]);
a.push(["19.6 ÷ 2.47 ≈ 7.9 (Allianz ROE/PB)", Math.abs(19.6 / 2.47 - 7.935) < 0.01]);
a.push(["(17.10 ÷ 11.40)^(1/3) ≈ 1.145 (≈ 14.5 %/år på tre år)", Math.abs((17.1 / 11.4) ** (1 / 3) - 1.1449) < 0.002]);
ok("aritmetik 12/12", a.every(([, v]) => v), a.filter(([, v]) => !v).map(([n]) => n).join(", ") || a.map(([n]) => n.split(" =")[0]).join(" · "));

// 11. Disclaimer-sista-rad: engelsk form, samma budskap
ok("disclaimer-sista-rad (EN-form)", en.body.trimEnd().endsWith("_This is educational financial analysis, not investment advice._"));

// 12. Pillar/author/external sources-paritet
ok("pillar/author identiska", en.pillar === org.pillar && en.author === org.author);
const kallorOrg = [...org.body.matchAll(/https:\/\/([^)]+)\)/g)].map((m) => m[1]).sort();
const kallorEn = [...en.body.matchAll(/https:\/\/([^)]+)\)/g)].map((m) => m[1]).sort();
ok("externa käll-URLer identiska", multiset(kallorOrg, kallorEn), `${kallorEn.length} URLer`);

console.log(r.join("\n"));
const rod = r.filter((x) => x.startsWith("RÖD")).length;
console.log(`\nSLUTDOM: ${rod === 0 ? "KVD GRÖN 0/0 — " + r.length + " kontroller" : "KVD RÖD — " + rod + " fel"}`);
process.exit(rod === 0 ? 0 : 1);
