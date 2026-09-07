#!/usr/bin/env node
/**
 * AK1A — Testsvit för MEDIEBIBLIOTEKETS VALIDERINGSLOGIK (src/lib/mediabibliotek.ts,
 * VÅG 81 / ADMIN-MEGA steg 3 — kontraktets sektion A7).
 *
 * REN LOGIK UTAN NÄTVERK: modulen importerar endast ./supabase-rest (ren
 * host-vakt utan nät), så den kan importeras DIREKT av node ≥ 22.18 (type
 * stripping) — inga tmp-filer, inga tsx-nedladdningar, inga Storage-anrop.
 * Nätverksvägarna täcks genom (a) NEXT_PHASE-hermetiken (fetch är stubbad +
 * räknas — ETT anrop = FAIL) och (b) den rena host-vitlistan
 * (hamtaSupabaseOrigin tar råvärdet som argument, aldrig nät).
 *
 * Kontroller (≥ 10 enligt kontraktet A7):
 *   (1)     Filändelse-tillåtlista: alla 5 (jpg/jpeg/png/webp/avif) igenkänns.
 *   (2)     SVG-FÖRBUDET: .svg avvisas i såväl ändelsesvep som valideraFil.
 *   (3)     Normalisering + skräpändelser: versaler → gemener, dubbla/mystiska
 *           ändelser, saknad ändelse ⇒ null.
 *   (4)     2 MB-gränsen: MAX_BYTES+1 avvisas ("2 MB" i feltexten), exakt
 *           MAX_BYTES med giltig magic godtas (inkluderande gräns).
 *   (5–8)   Magic-byte per format: JPEG / PNG / WEBP / AVIF — rätt signatur
 *           godtas, fel signatur AVVISAS (formatskuldnad dör här).
 *   (9)     Tom fil (0 bytes) avvisas av magic-kontrollen.
 *   (10)    uuid-nyckelformatet: byggObjektNyckel matchar MEDIA_NYCKEL_RE,
 *           500 nycklar unika, icke-vitlistade ändelser ⇒ null.
 *   (11)    Kundfilnamnet blir ALDRIG del av nyckeln (path-traversal dött
 *           vid födseln — kontrakt A1).
 *   (12)    mime-kartläggningen: jpg/jpeg → image/jpeg, png/webp/avif → …
 *   (13)    mediaUrl: exakt publik URL för giltig nyckel; ogiltig nyckel
 *           och/eller saknad miljö ⇒ "" (ALDRIG en gissad URL).
 *   (14)    arGiltigMediaNyckel: uuid-formatvakten för radering/URL.
 *   (15)    SSRF-host-vitlistan: endast https://<en-label>.supabase.co.
 *   (16)    NEXT_PHASE-hermetiken: phase-production-build ⇒ tomma svar med
 *           FETCHEN ALDRIG ANROPAD (listan/ladda/radera + mediaKonfigurerat).
 *   (17)    Ej konfigurerat: utan miljövariabler ⇒ ärligt fel, tom lista.
 *   (18)    Import-ytan = endast ./supabase-rest (aldrig db.ts/deps).
 *
 * Användning:  node verktyg/testa-mediabibliotek.mjs   (node ≥ 22.18)
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODUL_SOKVAG = path.join(REPO, "src", "lib", "mediabibliotek.ts");

// ── Testram (mönstret från verktyg/testa-akm2-karna.mjs, förenklat) ─────────
const RADER = [];
function kolla(namn, ok, detalj = "") {
  RADER.push({ namn, ok: !!ok, detalj });
}

// ── Fixture-hjälpare ─────────────────────────────────────────────────────────
const KODARE = new TextEncoder();
function ascii(text) {
  return KODARE.encode(text);
}
function ihop(...delar) {
  const langd = delar.reduce((s, d) => s + d.length, 0);
  const ut = new Uint8Array(langd);
  let pos = 0;
  for (const d of delar) {
    ut.set(d, pos);
    pos += d.length;
  }
  return ut;
}
function fil(namn, bytes) {
  return new File([bytes], namn, { type: "application/octet-stream" });
}

// Signaturer enligt kontraktet A1 (magic-byte-tabellen i modulen).
const JPEG_MAGIC = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]);
const PNG_MAGIC = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP_MAGIC = ihop(ascii("RIFF"), new Uint8Array([0x24, 0x08, 0x00, 0x00]), ascii("WEBPVP8 "));
const AVIF_MAGIC = ihop(new Uint8Array([0x00, 0x00, 0x00, 0x20]), ascii("ftypavif"));

// ── Miljöhantering (testerna styr process.env — modulen läser den LAZY) ─────
const ENV_NYCKLAR = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PHASE"];
const SPARAD_ENV = Object.fromEntries(ENV_NYCKLAR.map((k) => [k, process.env[k]]));
function rensaEnv() {
  for (const k of ENV_NYCKLAR) delete process.env[k];
}
function aterstallEnv() {
  for (const [k, v] of Object.entries(SPARAD_ENV)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

async function main() {
  // Modulen importeras via en importbro (node ≥ 22.18:type stripping av .ts).
  // Bron behövs för att källans TS-kanoniska import "./supabase-rest" (utan
  // ändelse — Next/tsc kräver .ts-lösning) ska köras i node, som kräver
  // ändelse: källan läses, importen skrivs om till absolut file://-URL på
  // supabase-rest.ts och resultatet cachedunkas i tool-results/ (gitignorad
  // hjälpfil — aldrig i src/, aldrig tmp_-namngiven).
  let media;
  const { writeFileSync, unlinkSync, mkdirSync } = await import("node:fs");
  const { pathToFileURL } = await import("node:url");
  const broSokvag = path.join(REPO, "tool-results", "v81-mediabibliotek-importbro.ts");
  try {
    mkdirSync(path.dirname(broSokvag), { recursive: true });
    const kalla = readFileSync(MODUL_SOKVAG, "utf8");
    const absolut = pathToFileURL(path.join(REPO, "src", "lib", "supabase-rest.ts")).href;
    const transformerad = kalla.replace('from "./supabase-rest"', `from "${absolut}"`);
    writeFileSync(broSokvag, transformerad);
    media = await import(pathToFileURL(broSokvag).href);
  } catch (e) {
    console.error("[testa-mediabibliotek] KUNDE INTE IMPORTERA MODULFILEN: " + (e && e.message ? e.message : String(e)));
    process.exitCode = 1;
    return;
  } finally {
    try { unlinkSync(broSokvag); } catch { /* redan borta */ }
  }
  const {
    narFilAndelse, arMagicBytesOK, byggObjektNyckel, valideraFil, arGiltigMediaNyckel,
    hamtaSupabaseOrigin, mediaUrl, mediaKonfigurerat, listaMedia, laddaUppMedia, raderaMedia,
    MEDIA_NYCKEL_RE, MAX_BYTES, TILLATNA_ANDSELSER,
  } = media;

  rensaEnv(); // deterministisk start: inga miljövariabler påverkAR testerna nedan

  // ── (1) Filändelse-tillåtlista ──────────────────────────────────────────────
  const AllaFem = TILLATNA_ANDSELSER.every((a) => narFilAndelse(`bild.${a}`) === a);
  kolla(
    "Filändelse-tillåtlista: jpg+jpeg+png+webp+avif igenkänns (5/5)",
    TILLATNA_ANDSELSER.length === 5 && AllaFem,
    TILLATNA_ANDSELSER.join("/") + " — allt annat avvisas",
  );

  // ── (2) SVG-FÖRBUDET (A1: script-inuti-SVG = XSS-vektor) ───────────────────
  const svgSvep = narFilAndelse("logga.svg");
  const svgVal = await valideraFil(fil("logga.svg", ascii("<svg onload=alert(1)>")));
  kolla(
    "SVG-FÖRBUDET: .svg avvisas i ändelsesvepet OCH valideraFel-texten nämner SVG",
    svgSvep === null && svgVal.ok === false && /SVG/i.test(svgVal.fel),
    "svep=" + String(svgSvep) + ", fel: " + (svgVal.ok ? "" : svgVal.fel.slice(0, 70) + "…"),
  );

  // ── (3) Normalisering + skräpändelser ───────────────────────────────────────
  const norm =
    narFilAndelse("SOMMAR.BILD.JPG") === "jpg" &&
    narFilAndelse("bild.jpg.exe") === null &&
    narFilAndelse("bild") === null &&
    narFilAndelse("bild.") === null &&
    narFilAndelse("bild.jpeg/png") === null &&
    narFilAndelse(".jpg") === "jpg"; // dold fil = ändelse ändå (ofarligt: metadata)
  kolla("Normalisering: versaler→gemener; .exe/.saknad/.skräp ⇒ null", norm, "BILD.JPG→jpg, bild.jpg.exe→null, bild→null, bild.→null, bild.jpeg/png→null");

  // ── (4) 2 MB-gränsen (Vercel-marginalen) ────────────────────────────────────
  const forStor = new Uint8Array(MAX_BYTES + 1);
  forStor.set(PNG_MAGIC, 0);
  const storSvar = await valideraFil(fil("stor.png", forStor));
  const maxFil = new Uint8Array(MAX_BYTES); // exakt taket SKA gå igenom
  maxFil.set(PNG_MAGIC, 0);
  const maxSvar = await valideraFil(fil("max.png", maxFil));
  kolla(
    "2 MB-gränsen: " + (MAX_BYTES / 1024 / 1024) + " MB+1 avvisas (feltext nämner 2 MB), exakt taket godtas",
    !storSvar.ok && /2 MB/.test(storSvar.fel) && maxSvar.ok === true,
    (storSvar.ok ? "" : storSvar.fel.slice(0, 60) + "…") + " | gränsfil " + String(maxFil.length) + " bytes: ok=" + String(maxSvar.ok),
  );

  // ── (5–8) Magic-byte per format ─────────────────────────────────────────────
  const magiJpegOk = arMagicBytesOK(JPEG_MAGIC, "jpg") && arMagicBytesOK(JPEG_MAGIC, "jpeg");
  const magiJpegFel = !arMagicBytesOK(ihop(PNG_MAGIC, new Uint8Array(64)), "jpg"); // PNG-magic i .jpg
  kolla("Magic JPEG: FF D8 FF godtas (jpg+jpeg); PNG-magic i .jpg-fil avvisas", magiJpegOk && magiJpegFel, "formatskuldnad dör i magic-kontrollen");

  const pngOk = arMagicBytesOK(PNG_MAGIC, "png");
  const pngFel = !arMagicBytesOK(JPEG_MAGIC, "png");
  kolla("Magic PNG: 89 50 4E 47 godtas; JPEG-magic i .png-fil avvisas", pngOk && pngFel, "");

  const webpOk = arMagicBytesOK(WEBP_MAGIC, "webp");
  const webpFel = !arMagicBytesOK(ihop(ascii("RIFF"), new Uint8Array(4), ascii("WEBX")), "webp") && !arMagicBytesOK(ascii("RIFXWEBP"), "webp");
  kolla('Magic WEBP: "RIFF"+…+"WEBP" vid offset 8 godtas; WEBX/RIFX avvisas', webpOk && webpFel, "");

  const avifOk = arMagicBytesOK(AVIF_MAGIC, "avif");
  const avifFel = !arMagicBytesOK(ihop(new Uint8Array(4), ascii("FTPXavif")), "avif");
  kolla('Magic AVIF: "ftyp" vid offset 4 godtas; FTPX-signatur avvisas', avifOk && avifFel, "");

  // ── (9) Tom fil ─────────────────────────────────────────────────────────────
  const tomSvar = await valideraFil(fil("tom.png", new Uint8Array(0)));
  kolla("Tom fil (0 bytes) avvisas av magic-kontrollen", !tomSvar.ok, tomSvar.ok ? "FEL: tomt godkäntes" : "fel: " + tomSvar.fel.slice(0, 60) + "…");

  // ── (10) uuid-nyckelformatet ────────────────────────────────────────────────
  const provNycklar = [];
  for (let i = 0; i < 500; i += 1) {
    const n = byggObjektNyckel(TILLATNA_ANDSELSER[i % TILLATNA_ANDSELSER.length]);
    if (n === null || !MEDIA_NYCKEL_RE.test(n)) provNycklar.push(n);
    provNycklar.push(n); // unikhetssamlingen
  }
  const unika = new Set(provNycklar.filter((n) => typeof n === "string"));
  const slagning =
    byggObjektNyckel("svg") === null &&
    byggObjektNyckel("exe") === null &&
    byggObjektNyckel("") === null; // versaler normaliseras — kontroll via `versal` nedan
  const versal = byggObjektNyckel("PNG");
  kolla(
    "uuid-nyckel: 500 nycklar matchar " + String(MEDIA_NYCKEL_RE) + " och är unika; svg/exe/\"\" ⇒ null",
    provNycklar.filter((n) => typeof n !== "string" || !MEDIA_NYCKEL_RE.test(n)).length === 0 && unika.size === 500 && slagning && versal !== null && versal.endsWith(".png"),
    unika.size + " unika nycklar; versal-normalisering PNG→.png: " + String(versal),
  );

  // ── (11) Kundfilnamnet blir ALDRIG nyckeln (A1) ─────────────────────────────
  const kundNamn = "min-hemliga-bild.jpg";
  const nyckelUrKallfil = byggObjektNyckel(narFilAndelse(kundNamn));
  const basNamn = kundNamn.slice(0, -4); // "min-hemliga-bild"
  kolla(
    "Kundfilnamnet blir ALDRIG del av nyckeln (path-traversal dött vid födseln)",
    nyckelUrKallfil !== null && !nyckelUrKallfil.includes(basNamn) && MEDIA_NYCKEL_RE.test(nyckelUrKallfil),
    "nyckel: " + String(nyckelUrKallfil) + " (filnamnet är metadata, bärs av revisionsraden)",
  );

  // ── (12) mime-kartläggningen ────────────────────────────────────────────────
  const mimePar = [
    ["bild.jpg", JPEG_MAGIC, "image/jpeg"],
    ["bild.jpeg", JPEG_MAGIC, "image/jpeg"],
    ["bild.png", PNG_MAGIC, "image/png"],
    ["bild.webp", WEBP_MAGIC, "image/webp"],
    ["bild.avif", AVIF_MAGIC, "image/avif"],
  ];
  let mimeOK = true;
  const mimeDetaljer = [];
  for (const [namn, magic, vantan] of mimePar) {
    const svar = await valideraFil(fil(namn, ihop(magic, new Uint8Array(32))));
    const ratt = svar.ok === true && svar.mime === vantan && svar.andelse === narFilAndelse(namn);
    if (!ratt) mimeOK = false;
    mimeDetaljer.push(namn + "→" + (svar.ok ? svar.mime : "FEL"));
  }
  kolla("mime-kartläggning: jpg/jpeg→image/jpeg, png/webp/avif→rätt mime via valideraFil", mimeOK, mimeDetaljer.join(", "));

  // ── (13) mediaUrl (publik URL — aldrig gissad) ──────────────────────────────
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://ak1a-testproj.supabase.co";
  const giltigNyckel = byggObjektNyckel("png");
  const urlRatt = mediaUrl(giltigNyckel) === `https://ak1a-testproj.supabase.co/storage/v1/object/public/media/${giltigNyckel}`;
  const urlSkrap = mediaUrl("../../hack.svg") === "" && mediaUrl("bild.jpg") === "" && mediaUrl("") === "";
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  const urlUtanEnv = mediaUrl(giltigNyckel) === "";
  kolla(
    "mediaUrl: exakt /storage/v1/object/public/media/<uuid.ext> för giltig nyckel; ogiltig nyckel/utan env ⇒ \"\"",
    urlRatt && urlSkrap && urlUtanEnv,
    urlRatt ? "ogiltiga (" + "../../hack.svg, bild.jpg) → \"\"" : "FEL: " + mediaUrl(giltigNyckel),
  );

  // ── (14) arGiltigMediaNyckel (raderings-vakten) ─────────────────────────────
  const uuid4 = "123e4567-e89b-42d3-a456-426614174000"; // kanonisk v4-form
  kolla(
    "arGiltigMediaNyckel: uuidv4.png sann; bild.jpg/../x/versal-uuid/svg-ändelse falska",
    arGiltigMediaNyckel(`${uuid4}.png`) === true &&
      arGiltigMediaNyckel("bild.jpg") === false &&
      arGiltigMediaNyckel(`../${uuid4}.png`) === false &&
      arGiltigMediaNyckel("123E4567-E89B-42D3-A456-426614174000.png") === false &&
      arGiltigMediaNyckel(`${uuid4}.svg`) === false,
    "endast servergenererade uuid v4-nycklar + vitlistad ändelse passerar",
  );

  // ── (15) SSRF-host-vitlistan (ren — tar råvärdet, aldrig nät) ───────────────
  const hostar = [
    ["https://projref.supabase.co", "https://projref.supabase.co"],
    ["https://projref.supabase.co/storage/v1", "https://projref.supabase.co"],
    ["http://projref.supabase.co", null], // http avvisas
    ["https://evil.com", null],
    ["https://localhost", null],
    ["https://127.0.0.1", null],
    ["https://a.b.supabase.co", null], // djup subdomän avvisas (en label krävs)
    ["https://supabase.co", null], // bart domän-primärtom
    ["inte-en-url", null],
  ];
  let hostOK = true;
  const hostDetaljer = [];
  for (const [ra, vantan] of hostar) {
    const fick = hamtaSupabaseOrigin(ra);
    if (fick !== vantan) hostOK = false;
    hostDetaljer.push(ra + "→" + String(fick));
  }
  kolla("SSRF-host-vitlista: endast https://<en-label>.supabase.co; http/evil/localhost/IP/djup subdomän ⇒ null", hostOK, hostDetaljer.join(" · "));

  // ── (16) NEXT_PHASE-hermetiken (våg 79 — ALDRIG nät under next build) ──────
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://ak1a-testproj.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-nyckel-inte-echt";
  process.env.NEXT_PHASE = "phase-production-build";
  const riktigFetch = globalThis.fetch;
  let fetchAnrop = 0;
  globalThis.fetch = function () {
    fetchAnrop += 1;
    throw new Error("NÄTVERK ANROPAT UNDER HERMETISK BYGGFAS");
  };
  let hermOK = true;
  const hermDetaljer = [];
  try {
    const l = await listaMedia();
    if (!(Array.isArray(l.poster) && l.poster.length === 0 && l.fel === undefined)) hermOK = false;
    hermDetaljer.push("listaMedia→" + JSON.stringify(l));
    const u = await laddaUppMedia(fil("bild.png", ihop(PNG_MAGIC, new Uint8Array(16))), "test");
    if (!(u.post === undefined && typeof u.fel === "string" && u.fel.length > 0)) hermOK = false;
    hermDetaljer.push("laddaUppMedia→fel: " + (u.fel || "SAKNAS"));
    const r = await raderaMedia(`${byggObjektNyckel("png")}`, "test");
    if (!(r.ok === false && typeof r.fel === "string")) hermOK = false;
    hermDetaljer.push("raderaMedia→ok:" + String(r.ok));
    if (mediaKonfigurerat() !== true) hermOK = false; // rent miljökoll — sant utan nät
  } finally {
    globalThis.fetch = riktigFetch;
  }
  kolla(
    "NEXT_PHASE-hermetik: phase-production-build ⇒ tomma svar (lista/ladda/radera) med fetch ALDRIG anropad",
    hermOK && fetchAnrop === 0,
    fetchAnrop + " fetch-anrop (krav: 0); " + hermDetaljer.join(" | ").slice(0, 160),
  );

  // ── (17) Ej konfigurerat (MÖS: ärligt fel, aldrig krasch) ───────────────────
  rensaEnv();
  const oconfig = await listaMedia();
  kolla(
    "Ej konfigurerat: utan env ⇒ poster [] + ärligt fel (\"konfigurer\"), mediaKonfigurerat() falskt",
    Array.isArray(oconfig.poster) && oconfig.poster.length === 0 && typeof oconfig.fel === "string" && /konfigurer/i.test(oconfig.fel) && mediaKonfigurerat() === false,
    (oconfig.fel || "SAKNAT FEL").slice(0, 90) + "…",
  );

  // ── (18) Modulens import-yta: ENDAST vedertagna ./supabase-rest (våg 81:
  //        origin delegeras dit — Mimosa-länken bryts på modulgränsen) ───────
  const kalltext = readFileSync(MODUL_SOKVAG, "utf8");
  const importRader = kalltext.match(/^\s*import[\s{"'].*$/gm) ?? [];
  const otillatna = importRader.filter((r) => !/from\s+["']\.\/supabase-rest["']/.test(r));
  kolla(
    "Import-ytan = endast ./supabase-rest (aldrig deprecated db.ts, aldrig tunga deps)",
    importRader.length === 1 && otillatna.length === 0,
    importRader.join(" · ") || "0 import-rader",
  );

  aterstallEnv();

  // ── Sammanställning (akm2-mönstret) ─────────────────────────────────────────
  let fail = 0;
  let nr = 0;
  for (const r of RADER) {
    nr += 1;
    const status = r.ok ? "PASS" : "FAIL";
    if (!r.ok) fail += 1;
    console.log(`${status}  ${String(nr).padStart(2)} · ${r.namn}${r.detalj ? " — " + r.detalj : ""}`);
  }
  console.log("");
  const grona = RADER.length - fail;
  console.log(`[testa-mediabibliotek] ${grona}/${RADER.length} kontroller gröna${fail ? ", " + fail + " FAIL" : ""}.`);
  if (!fail) {
    console.log("[testa-mediabibliotek] Kontrakt A7: valideringslogiken REN — SVG-förbud, 2 MB-tak, magic-byte, uuid-nyckel, hermetik.");
  }
  process.exitCode = fail ? 1 : 0;
}

main().catch((e) => {
  aterstallEnvSnapshot();
  console.error("[testa-mediabibliotek] FEL: " + (e && e.message ? e.message : String(e)));
  process.exitCode = 1;
});

// Fallback-återställning om main kastar före sin egen aterstallning.
function aterstallEnvSnapshot() {
  for (const [k, v] of Object.entries(SPARAD_ENV)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}
