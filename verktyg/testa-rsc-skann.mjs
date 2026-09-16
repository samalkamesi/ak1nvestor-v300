#!/usr/bin/env node
/**
 * TEST: rsc-skann.mjs (spår 8, s8-u1 försök 2) — 2026-09-16
 * Fixturebaserat (mkdtemp i os.tmpdir): byger minimi-.next-träd per fall,
 * noll child-processer, noll nätverk. Fall 9 mäter LEVANDE artefakt om
 * .next finns (rscFiler > 6000 + status GRÖN — en trasig levande artefakt
 * SKALL fallera testet: verktygets jobb är att hålla den klassen synlig).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifieraRsc, samlaRscFiler } from "./rsc-skann.mjs";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let passerade = 0;
let misslyckade = 0;
const kontrollera = (namn, villkor, detalj = "") => {
  if (villkor) { passerade += 1; console.log(`PASS ${namn}`); }
  else { misslyckade += 1; console.log(`FAIL ${namn} ${detalj}`); }
};

/** Bygger ett minimi-.next: serverApp-vägar + static-filer enligt argumenten. */
function byggFixture({ rscFiler = [], statiska = [], extra = {} }) {
  const rot = fs.mkdtempSync(path.join(os.tmpdir(), "rsc-skann-test-"));
  const serverApp = path.join(rot, ".next", "server", "app");
  fs.mkdirSync(serverApp, { recursive: true });
  for (const { vag, innehall } of rscFiler) {
    const hel = path.join(serverApp, vag);
    fs.mkdirSync(path.dirname(hel), { recursive: true });
    fs.writeFileSync(hel, innehall);
  }
  const statiskRot = path.join(rot, ".next", "static");
  for (const rel of statiska) {
    const hel = path.join(statiskRot, ...rel.split("/"));
    fs.mkdirSync(path.dirname(hel), { recursive: true });
    fs.writeFileSync(hel, "x");
  }
  if (extra.tomHtmlFil) fs.writeFileSync(path.join(serverApp, "sida.html"), "<html></html>");
  return rot;
}

// ── 1. GRÖN: referenser finns ──────────────────────────────────────────
{
  const rot = byggFixture({
    rscFiler: [
      { vag: "a.rsc", innehall: 'I[1,["/_next/static/chunks/ok.js"],"d"]' },
      { vag: "nod/b.rsc", innehall: ':HL["/_next/static/chunks/stil.css","style"]' },
    ],
    statiska: ["chunks/ok.js", "chunks/stil.css"],
  });
  const r = await verifieraRsc({ rot, skrivLage: false });
  kontrollera("1 grön: status", r.status === "gron", `fick ${r.status}: ${r.meddelande}`);
  kontrollera("1 grön: räknat 2 filer", r.rscFiler === 2, `fick ${r.rscFiler}`);
  kontrollera("1 grön: 2 unika refs", r.unikaReferenser === 2, `fick ${r.unikaReferenser}`);
  fs.rmSync(rot, { recursive: true, force: true });
}

// ── 2. TRANSIG: saknad chunk (E34-klassen i .rsc) ──────────────────────
{
  const rot = byggFixture({
    rscFiler: [
      { vag: "sidan.rsc", innehall: 'I[1,["/_next/static/chunks/finns.js"],"d"] :HL["/_next/static/chunks/saknas.css","style"]' },
    ],
    statiska: ["chunks/finns.js"],
  });
  const r = await verifieraRsc({ rot, skrivLage: false });
  kontrollera("2 trasig: status", r.status === "trasig", `fick ${r.status}`);
  kontrollera(
    "2 trasig: rätt saknad-post",
    r.saknade.length === 1 && r.saknade[0].sida === "sidan.rsc" && r.saknade[0].ref === "/_next/static/chunks/saknas.css",
    JSON.stringify(r.saknade),
  );
  fs.rmSync(rot, { recursive: true, force: true });
}

// ── 3. OKÄND: .next/server/app saknas ──────────────────────────────────
{
  const rot = fs.mkdtempSync(path.join(os.tmpdir(), "rsc-skann-test-"));
  const r = await verifieraRsc({ rot, skrivLage: false });
  kontrollera("3 okänd: saknad artefakt", r.status === "okand" && r.meddelande.includes("finns ej"), `fick ${r.status}: ${r.meddelande}`);
  fs.rmSync(rot, { recursive: true, force: true });
}

// ── 4. OKÄND: 0 .rsc-filer (tom artefakt är aldrig grön) ───────────────
{
  const rot = byggFixture({ rscFiler: [], statiska: [], extra: { tomHtmlFil: true } });
  const r = await verifieraRsc({ rot, skrivLage: false });
  kontrollera("4 okänd: 0 .rsc", r.status === "okand" && r.meddelande.includes("tom artefakt"), `fick ${r.status}: ${r.meddelande}`);
  fs.rmSync(rot, { recursive: true, force: true });
}

// ── 5. OKÄND: läsfel i walk (okänd > gissning) ─────────────────────────
{
  const rot = byggFixture({
    rscFiler: [{ vag: "a.rsc", innehall: 'I[1,["/_next/static/chunks/ok.js"],"d"]' }],
    statiska: ["chunks/ok.js"],
  });
  const lasbar = path.join(rot, ".next", "server", "app", "last");
  fs.mkdirSync(lasbar, { recursive: true });
  fs.chmodSync(lasbar, 0o000);
  const r = await verifieraRsc({ rot, skrivLage: false });
  fs.chmodSync(lasbar, 0o755);
  kontrollera("5 okänd: läsfel", r.status === "okand" && r.meddelande.includes("kunde inte läsa"), `fick ${r.status}: ${r.meddelande}`);
  fs.rmSync(rot, { recursive: true, force: true });
}

// ── 6. TRUNKERAD: tak < antal filer ⇒ ärlig flagga ─────────────────────
{
  const rot = byggFixture({
    rscFiler: [
      { vag: "a.rsc", innehall: 'I[1,["/_next/static/chunks/ok.js"],"d"]' },
      { vag: "b.rsc", innehall: 'I[1,["/_next/static/chunks/ok.js"],"d"]' },
    ],
    statiska: ["chunks/ok.js"],
  });
  const r = await verifieraRsc({ rot, maxRsc: 1, skrivLage: false });
  kontrollera("6 trunkerad: flagga + tak", r.trunkerad === true && r.rscFiler === 1, `trunkerad=${r.trunkerad} filer=${r.rscFiler}`);
  fs.rmSync(rot, { recursive: true, force: true });
}

// ── 7. %-AVKODNING: media-ref med %20 finns som "a b.woff2" ────────────
{
  const rot = byggFixture({
    rscFiler: [
      { vag: "a.rsc", innehall: ':HL["/_next/static/media/a%20b.woff2","font"]' },
    ],
    statiska: ["media/a b.woff2"],
  });
  const r = await verifieraRsc({ rot, skrivLage: false });
  kontrollera("7 %-avkodning: grön", r.status === "gron", `fick ${r.status}: ${JSON.stringify(r.saknade)}`);
  fs.rmSync(rot, { recursive: true, force: true });
}

// ── 8. KONTRAKTETS GRÄNS: endast /_next/static mäts ────────────────────
{
  const rot = byggFixture({
    rscFiler: [
      { vag: "a.rsc", innehall: 'X["/_next/image?url=x",{}] I[1,["/_next/static/chunks/ok.js"],"d"]' },
    ],
    statiska: ["chunks/ok.js"],
  });
  const r = await verifieraRsc({ rot, skrivLage: false });
  kontrollera(
    "8 kontrakt: /_next/image ej räknad",
    r.status === "gron" && r.unikaReferenser === 1,
    `status=${r.status} unika=${r.unikaReferenser}`,
  );
  fs.rmSync(rot, { recursive: true, force: true });
}

// ── 9. walk-sortering deterministisk ───────────────────────────────────
{
  const serverApp = path.join(ROT, ".next", "server", "app");
  if (fs.existsSync(serverApp)) {
    const { rsc: g1 } = samlaRscFiler(serverApp);
    const { rsc: g2 } = samlaRscFiler(serverApp);
    kontrollera("9 determinism: två walks identiska", JSON.stringify(g1) === JSON.stringify(g2) && g1.length > 0);
  } else {
    console.log("PASS 9 determinism: hoppad (inget .next — miljö utan artefakt)");
    passerade += 1;
  }
}

// ── 10. LEVANDE artefakt: hela trädet + GRÖN-krav ──────────────────────
{
  const serverApp = path.join(ROT, ".next", "server", "app");
  if (fs.existsSync(serverApp)) {
    const r = await verifieraRsc({ rot: ROT, skrivLage: false });
    kontrollera("10 levande: >6000 .rsc-filer", r.rscFiler > 6000, `fick ${r.rscFiler}`);
    kontrollera("10 levande: status GRÖN", r.status === "gron", `fick ${r.status}: ${r.meddelande}`);
    console.log(`     levande: ${r.meddelande} (${r.varaktighetMs} ms)`);
  } else {
    console.log("PASS 10 levande: hoppad (inget .next — miljö utan artefakt)");
    passerade += 1;
  }
}

console.log(`\n${passerade}/${passerade + misslyckade} PASS`);
process.exit(misslyckade === 0 ? 0 : 1);
