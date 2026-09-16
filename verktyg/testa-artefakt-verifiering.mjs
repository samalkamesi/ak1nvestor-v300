#!/usr/bin/env node
/**
 * Testsvit för verktyg/artefakt-verifiering.mjs — grenarna mappade mot
 * VERKLIGA fallet 2026-09-16 (kulturen från testa-kraschvakt.mjs):
 *   12:02-klassen = byggets egna prerender-HTML (index.html FÄRSK,
 *   skriven strax efter BUILD_ID) refererade 12 chunks som aldrig
 *   emitterats — HTML 200 lurade httpsOk()+varm() medan kunden såg
 *   ostylade sidor i 20+ min (SYSTEMKARTAN E34).
 * Noll nätverk, noll child-processer; fixturer i os.tmpdir() städas själv.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { samlaHtmlFiler, lasRefs, refsokVag, verifieraArtefakt } from "./artefakt-verifiering.mjs";

let pass = 0;
const misslyckade = [];
function koll(nr, vad, fn) {
  try {
    fn();
    pass += 1;
    console.log(`PASS ${nr}: ${vad}`);
  } catch (e) {
    misslyckade.push(nr);
    console.error(`FAIL ${nr}: ${vad} — ${String(e?.message ?? e).slice(0, 200)}`);
  }
}
async function kollAsync(nr, vad, fn) {
  try {
    await fn();
    pass += 1;
    console.log(`PASS ${nr}: ${vad}`);
  } catch (e) {
    misslyckade.push(nr);
    console.error(`FAIL ${nr}: ${vad} — ${String(e?.message ?? e).slice(0, 200)}`);
  }
}

// Fixturbyggare: en minimal .next-artefakt under tmp.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "artefakt-test-"));
function byggFixtur({ htmlFiler = [], statiska = [] } = {}) {
  const next = path.join(tmp, `next-${Math.random().toString(36).slice(2, 8)}`);
  fs.mkdirSync(path.join(next, "server", "app"), { recursive: true });
  fs.mkdirSync(path.join(next, "static", "chunks"), { recursive: true });
  fs.writeFileSync(path.join(next, "BUILD_ID"), "testbuild\n");
  for (const [namn, innehall] of htmlFiler) {
    const hel = path.join(next, "server", "app", namn);
    fs.mkdirSync(path.dirname(hel), { recursive: true });
    fs.writeFileSync(hel, innehall);
  }
  for (const rel of statiska) {
    const hel = path.join(next, "static", ...rel.split("/"));
    fs.mkdirSync(path.dirname(hel), { recursive: true });
    fs.writeFileSync(hel, "x");
  }
  return next;
}
const HTML = (refs) =>
  `<!doctype html><html><head>${refs
    .map((r) => `<script src="${r}" defer></script>`)
    .join("")}</head><body>AK1A</body></html>`;

try {
  // ═══ Grenar mot verkliga incidenten ═══
  const gron = byggFixtur({
    htmlFiler: [["index.html", HTML(["/_next/static/chunks/a1.js", "/_next/static/chunks/s1.css"])]],
    statiska: ["chunks/a1.js", "chunks/s1.css"],
  });
  await kollAsync(1, "grön artefakt: alla referenser finns ⇒ status gron", async () => {
    const r = await verifieraArtefakt({ nextKatalog: gron, skrivLage: false });
    assert.equal(r.status, "gron");
    assert.equal(r.saknade.length, 0);
    assert.equal(r.unikaReferenser, 2);
  });

  const transig = byggFixtur({
    htmlFiler: [
      [
        "index.html",
        HTML([
          "/_next/static/chunks/finns.js",
          "/_next/static/chunks/0dkvqmwqb0ena.css",
          "/_next/static/chunks/saknad-app.js",
        ]),
      ],
    ],
    statiska: ["chunks/finns.js"],
  });
  await kollAsync(2, "12:02-klassen: färsk HTML refererar aldrig emitterade filer ⇒ trasig + per-sida-bevis", async () => {
    const r = await verifieraArtefakt({ nextKatalog: transig, skrivLage: false });
    assert.equal(r.status, "trasig");
    assert.equal(r.saknade.length, 2);
    assert.ok(r.saknade.every((s) => s.sida === "index.html"));
    assert.ok(r.saknade.some((s) => s.ref.endsWith("0dkvqmwqb0ena.css"))); // E34:s ostylade CSS-chunk
  });

  await kollAsync(3, "okänd: .next/server/app saknas ⇒ kunde inte mäta (aldrig grön på blindhet)", async () => {
    const r = await verifieraArtefakt({ nextKatalog: path.join(tmp, "finns-ej"), skrivLage: false });
    assert.equal(r.status, "okand");
  });

  const tom = byggFixtur({ htmlFiler: [], statiska: ["chunks/a.js"] });
  await kollAsync(4, "tom artefakt (0 HTML) ⇒ okand — o24 §5: mätblindhet är inte grönt", async () => {
    const r = await verifieraArtefakt({ nextKatalog: tom, skrivLage: false });
    assert.equal(r.status, "okand");
  });

  // ═══ Strukturgarantier ═══
  koll(5, "lasRefs: escapade flight-JSON-referenser (\\\"…\\\") fångas — prerender bär RSC-payload inline", () => {
    const refs = lasRefs(
      String.raw`<script>self.__next_f.push([1,"a:license\":\"/_next/static/chunks/flyg.js\""])</script>`,
    );
    assert.ok(refs.includes("/_next/static/chunks/flyg.js"));
  });
  koll(6, "lasRefs: query-sträng klipps, /_next/image-url:er ignoreras, dubbletter dedupliceras", () => {
    const refs = lasRefs(
      '<link href="/_next/static/chunks/a.js?v=9"><img src="/_next/image?url=%2Fbild.png&w=640"><script src="/_next/static/chunks/a.js?v=9"></script>',
    );
    assert.deepEqual(refs, ["/_next/static/chunks/a.js"]);
  });
  koll(7, "refsokVag: BUILD_ID-prefixerade referenser (_buildManifest) mappas till static/<BUILD_ID>/", () => {
    const next = byggFixtur({ statiska: ["testbuild/_buildManifest.js"] });
    const vag = refsokVag(next, "/_next/static/testbuild/_buildManifest.js");
    assert.equal(fs.existsSync(vag), true);
  });
  koll(8, "refsokVag: %-kodad referens avkodas i reserv", () => {
    const next = byggFixtur({ statiska: ["media/bild med mellanslag.png"] });
    assert.equal(fs.existsSync(refsokVag(next, "/_next/static/media/bild%20med%20mellanslag.png")), true);
  });

  const mangfald = byggFixtur({
    htmlFiler: [
      ["index.html", HTML(["/_next/static/chunks/a.js"])],
      [path.join("(huvud)", "blogg.html"), HTML(["/_next/static/chunks/a.js", "/_next/static/chunks/b.css"])],
      [path.join("(en)", "blogg", "[slug]", "x.html"), HTML(["/_next/static/media/m.png"])],
    ],
    statiska: ["chunks/a.js", "chunks/b.css", "media/m.png"],
  });
  await kollAsync(9, "nästlade språk-/ruttkataloger ((huvud), (en), [slug]) mäts — sida-redan relativa", async () => {
    const r = await verifieraArtefakt({ nextKatalog: mangfald, skrivLage: false });
    assert.equal(r.status, "gron");
    assert.equal(r.htmlFiler, 3);
  });

  await kollAsync(10, "maxHtml-tak: trunkerad flaggas ärligt (aldrig tyst delmått som helmått)", async () => {
    const r = await verifieraArtefakt({ nextKatalog: mangfald, maxHtml: 1, skrivLage: false });
    assert.equal(r.htmlFiler, 1);
    assert.equal(r.trunkerad, true);
  });

  koll(11, "samlaHtmlFiler: deterministiskt sorterad (samma artefakt ⇒ samma mått)", () => {
    const { html } = samlaHtmlFiler(path.join(mangfald, "server", "app"));
    assert.deepEqual(html, [...html].sort());
    assert.equal(html.length, 3);
  });

  await kollAsync(12, "senaste-saknade prioriteras inte bort: trasig sida DJUPT i trädet hittas också", async () => {
    const djup = byggFixtur({
      htmlFiler: [
        ["index.html", HTML(["/_next/static/chunks/a.js"])],
        [path.join("kurser", "sv", "many", "z.html"), HTML(["/_next/static/chunks/djup-saknad.js"])],
      ],
      statiska: ["chunks/a.js"],
    });
    const r = await verifieraArtefakt({ nextKatalog: djup, skrivLage: false });
    assert.equal(r.status, "trasig");
    assert.equal(r.saknade[0].sida, path.join("kurser", "sv", "many", "z.html"));
  });
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(`\n${pass}/${pass + misslyckade.length} PASS${misslyckade.length ? " — MISSLYCKADE: " + misslyckade.join(",") : ""}`);
process.exit(misslyckade.length === 0 ? 0 : 1);
