#!/usr/bin/env node
// KVD för s3-u1: lyxaktier-guide — kontrolleraText-replik + mallens strukturregler
import { readFileSync, readdirSync } from "node:fs";

const fil = "data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag.json";
const p = JSON.parse(readFileSync(fil, "utf8"));
const { title, description, body, slug } = p;
const hela = title + "\n" + description + "\n" + body;

let fel = 0;
const sa = (ok, msg) => { console.log((ok ? "OK  " : "FEL ") + msg); if (!ok) fel++; };

// 1. Ord rådata (whitespace-split, som syskonen räknar)
const ord = body.trim().split(/\s+/).length;
sa(ord >= 800 && ord <= 1400, `ord i body: ${ord} (span 800–1400, mål 1200)`);

// 2. Title ≤ 60, OG-desc ≤ 155
sa(title.length <= 60, `title ${title.length} tkn (≤60): "${title}"`);
sa(description.length <= 155, `OG-desc ${description.length} tkn (≤155)`);

// 3. Slug-format
sa(/^[a-z0-9-]+$/.test(slug), `slug-format: ${slug}`);

// 4. Sökordsdisciplin: primärt i H1(title)+ingress(P1)+1 H2
const p1 = body.split("\n\n")[0];
const h2r = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
sa(/lyxaktier/i.test(title), "primärt sökord i H1/title");
sa(/lyxaktier/i.test(p1), "primärt sökord i ingressen (P1)");
sa(h2r.some((h) => /lyxaktier/i.test(h)), `primärt sökord i H2: "${h2r.find((h) => /lyxaktier/i.test(h))}"`);

// 5. Varumärkesgrinden: data/varumarke.jsons egna regexer på titel+desc+body
const vm = JSON.parse(readFileSync("data/varumarke.json", "utf8"));
for (const f of vm.forbjudnaFraser) {
  const re = new RegExp(f.fran, "giu");
  re.lastIndex = 0;
  // negerings-lookbehind-frasen ("investeringsråd") körs som den är — koden gör samma
  const m = hela.match(re);
  sa(m === null, `${f.allvar || "FEL"}-fras "${f.fran}" ${m === null ? "0 träff" : "TRÄFF: " + JSON.stringify(m.slice(0, 3))}`);
}

// 6. Rådverb-scanning (juridikgrinden: inga råd-konstruktioner)
const rad = hela.match(/\b(köp|sälj|sälja|rekommenderar|rekommendera|borde|råder|råda dig|tipsar dig att|du bör)\b/gi);
sa(rad === null, `rådverb ${rad === null ? 0 : rad.length} träffar: ${rad ?? "—"}`);

// 7. Korslänkar: ENDAST publicerade kurser + poster, 0 mot utkast
const kurser = new Set(Object.keys(JSON.parse(readFileSync("public/deep-courses.json", "utf8"))));
const slugs = new Set(readdirSync("data/blogg").filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync("data/blogg/" + f, "utf8")).slug));
const lnk = [...body.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map((m) => m[1]);
let dl = 0;
for (const l of lnk) {
  const seg = l.replace(/^\//, "").split("/");
  const ok = seg[0] === "kurser" ? kurser.has(seg[1]) : slugs.has(seg[1]);
  if (!ok) dl++;
  sa(ok, `länk ${l}`);
}
sa(lnk.length >= 8, `antal korslänkar: ${lnk.length}`);
sa(dl === 0, `döda/otillåtna länkar: ${dl}`);

// 8. Struktur: ≥2 H2, ≥800 tkn, disclaimer-sista-rad identisk mallens
sa(h2r.length >= 2, `H2-rubriker: ${h2r.length}`);
sa(body.length >= 800, `body ${body.length} tkn (≥800)`);
const sista = body.trimEnd().split("\n").pop().trim();
sa(sista === "_Detta är pedagogisk finansanalys, inte investeringsråd._", "disclaimer-sista-rad identisk");

// 9. Mjuka bindestreck och andra osynliga felkällor
sa(!/\u00AD/.test(JSON.stringify(p)), "mjuka bindestreck (U+00AD): 0");
sa(!/[\u200B-\u200D\uFEFF]/.test(body), "osynliga whitespace-tecken: 0");

// 10. BlogPost-form: alla fält
for (const k of ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"])
  sa(p[k] !== undefined && p[k] !== null && p[k] !== "", `fält ${k}`);
sa(/^\d{4}-\d{2}-\d{2}$/.test(p.publishedAt), `publishedAt ISO-dag: ${p.publishedAt}`);

console.log(fel === 0 ? `\nKVD: ${fel} fel — GRÖN` : `\nKVD: ${fel} fel — RÖD`);
process.exit(fel === 0 ? 0 : 1);
