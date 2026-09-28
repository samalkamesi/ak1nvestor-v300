#!/usr/bin/env node
// kolla-site.mjs — Växthuset Fas 1:s innehållsvalidator (körs av
// hyresgästsagenten efter varje ändring enligt TENANT-AGENTS.md kontrakt 3).
// Användning: node verktyg/kolla-site.mjs [sökvag-till-site.json]
// (default: ./innehall/site.json) · Exit 0 = giltig, exit 1 = fel med orsak.
import fs from "node:fs";
import path from "node:path";

const fil = process.argv[2] ?? path.join("innehall", "site.json");
const SLUG = /^[a-z0-9-]+$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const TYPER = new Set(["rubrik", "text", "bild", "knapp"]);

try {
  const site = JSON.parse(fs.readFileSync(fil, "utf8"));
  const fel = [];
  if (typeof site.namn !== "string" || !site.namn.trim()) fel.push("namn saknas/tom");
  if (typeof site.tagline !== "string") fel.push("tagline saknas (får vara tom sträng)");
  if (!Array.isArray(site.sidor) || site.sidor.length === 0) fel.push("sidor: minst en sida krävs");
  else {
    site.sidor.forEach((s, i) => {
      const pref = `sidor[${i}]`;
      if (!SLUG.test(s.slug ?? "")) fel.push(`${pref}.slug ogiltig ("${s.slug}" — a-z/0-9/bindestreck)`);
      if (typeof s.titel !== "string" || !s.titel.trim()) fel.push(`${pref}.titel saknas`);
      if (!Array.isArray(s.sektioner)) fel.push(`${pref}.sektioner saknas`);
      else
        s.sektioner.forEach((k, j) => {
          const p = `${pref}.sektioner[${j}]`;
          if (!TYPER.has(k.typ)) fel.push(`${p}.typ ogiltig ("${k.typ}" ∈ rubrik/text/bild/knapp)`);
          if (k.typ === "rubrik" && !(k.rubrik ?? "").trim()) fel.push(`${p}: rubrik-text saknas`);
          if (k.typ === "text" && !(k.text ?? "").trim()) fel.push(`${p}: text saknas`);
          if (k.typ === "bild" && !(k.bild ?? "").startsWith("https://")) fel.push(`${p}.bild måste vara https-URL`);
          if (k.typ === "knapp" && !(k.knappText ?? "").trim()) fel.push(`${p}: knappText saknas`);
        });
    });
    const slugs = new Set(site.sidor.map((s) => s.slug));
    if (slugs.size !== site.sidor.length) fel.push("sidor: dubbla slug-värden");
  }
  const st = site.stilar ?? {};
  for (const nyckel of ["primarFarg", "bakgrundsFarg", "textFarg"]) {
    if (!HEX.test(st[nyckel] ?? "")) fel.push(`stilar.${nyckel} ogiltig ("${st[nyckel]}" — hex #rrggbb)`);
  }
  if (fel.length) {
    console.log("OGILTIG — " + fel.length + " fel:");
    fel.forEach((f) => console.log("  · " + f));
    process.exit(1);
  }
  console.log(
    `GILTIG — ${site.sidor.length} sidor (${site.sidor.map((s) => s.slug).join(", ")}) · ${site.sidor.reduce((a, s) => a + s.sektioner.length, 0)} sektioner · ${site.namn}`,
  );
  process.exit(0);
} catch (e) {
  console.log("OGILTIG — JSON-läsfel: " + String(e.message));
  process.exit(1);
}
