#!/usr/bin/env node
// _s1u1-boerspsykologi-paket.mjs — bygger FLYTTKLART PAKET för m9-utkast #1 (boerspsykologi-fallstugor v1)
// Striper kvitto-avsnittet (M9-GRANSKNING §1:6) ur bodyMarkdown och skriver exportklar post.
// Metadata enligt våg 95-kontraktet (pillar "Institutionell metodik", author "AK1A Research Lab").
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const REPO = "/home/ak1a/AK1";
const ut = JSON.parse(readFileSync(REPO + "/data/blogg-utkast/m9-ko/boerspsykologi-fallstugor-v1.json", "utf8"));
const vm = JSON.parse(readFileSync(REPO + "/data/varumarke.json", "utf8"));
const DISCLAIMER = "_Automatiskt utkast ur m9-fabrikens evergreen-serier; den fullständiga AK1A-analysen tillverkas manuellt. Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)._";

const body = ut.bodyMarkdown;
const ix = body.indexOf("## Granskningsunderlag — maskinens kvitto");
if (ix < 0) { console.error("kvitto-markör saknas — avbryter"); process.exit(1); }
const mallDel = body.slice(0, ix).replace(/\n+$/, "");
const renBody = mallDel + "\n\n" + DISCLAIMER;

// Slutverifiering AV paketets publicerbara yta
function kontrolleraText(text) {
  const f = [], v = [];
  for (const { fran, allvar } of vm.forbjudnaFraser) {
    const re = new RegExp(fran, "giu");
    let m; while ((m = re.exec(text)) !== null) { (allvar === "FEL" ? f : v).push(m[0]); if (m.index === re.lastIndex) re.lastIndex++; }
  }
  return { f, v };
}
const title = ut.titel.replace(" (utkast)", "");
const yta = title + "\n" + ut.ingress + "\n" + renBody;
const r = kontrolleraText(yta);
const rester = ["## Granskningsunderlag", "kandidatMd5", "mall-md5", "Determinism", "Dataurdrag", "kontrolleraText-förkontroll", "genereradUr", "kvitto-avsnitt", "**Status:**"].filter((s) => renBody.includes(s));
const sista = renBody.trimEnd().split("\n").pop().trim();
const ord = renBody.split(/\s+/).filter(Boolean).length;
const paket = {
  slug: ut.slug,
  title,
  description: ut.ingress,
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: null,
  readingMinutes: Math.max(1, Math.round(ord / 200)),
  tags: ["börspsykologi", "vågvalidering", "träffprocent", "sannolikhet", "beteendeekonomi"],
  body: renBody,
};
const utFil = REPO + "/data/blogg-utkast/granskning/boerspsykologi-fallstugor-FLYTTKLART-PAKET-2026-09-20.json";
writeFileSync(utFil, JSON.stringify(paket, null, 2) + "\n");

console.log(`paket: ${utFil}`);
console.log(`title: ${paket.title}`);
console.log(`body: ${body.length} → ${renBody.length} tkn · ${ord} ord · ${paket.readingMinutes} min`);
console.log(`kontrolleraText (title+description+body): FEL ${r.f.length} · VARNINGAR ${r.v.length}`);
console.log(`kvitto-rester: ${rester.length} · disclaimer sist: ${sista === DISCLAIMER} · rubriker: ${(renBody.match(/^## /gm) ?? []).length}`);
console.log(`md5(paketfil): ${createHash("md5").update(readFileSync(utFil)).digest("hex")}`);
process.exit(r.f.length === 0 && r.v.length === 0 && rester.length === 0 && sista === DISCLAIMER ? 0 : 1);
