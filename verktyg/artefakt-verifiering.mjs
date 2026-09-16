#!/usr/bin/env node
/**
 * ARTEFAKT-VERIFIERINGEN (spår 8, s8-u2 — E34-köpost 1) — 2026-09-16
 * ====================================================================
 * BEVISAT behov (prodincident 10:02 + 12:02 lokal, SYSTEMKARTAN-dokvågen
 * E34): ett OOM-dödat/RAM-svält bygg kan skriva BUILD_ID och färska
 * prerender-HTML (`.next/server/app/*.html`) som refererar chunks som
 * ALDRIG emitterades till `.next/static/` — HTML svarar 200 (och lurar
 * såväl prod-synkens httpsOk som kraschvaktens varm()) medan ALLA
 * saknade resurser är kundsynligt 404/ostylade i 20+ min, två gånger
 * samma dag. Ingen länk i deploy-kedjan kontrollerade artefaktens interna
 * kontrakt FÖRE pm2-restart.
 *
 * Kontraktet som mäts: VARJE `/_next/static/…`-referens i varje
 * prerenderad HTML under `.next/server/app/` MÅSTE finnas på disk under
 * `.next/static/`. Ren fs-läsning — noll child-processer, noll nätverk
 * (naturskalfritt; läsning av ~160 MB HTML à en fil i taget = några
 * sekunder, RAM-trogen även i deployfönstret).
 *
 * Status (o24 §5 metodfynd: "måttobjekt trasigt" ≠ "kunde inte mäta"):
 *   gron    exit 0 — samtliga referenser finns
 *   trasig  exit 1 — ≥1 referens saknas på disk (12:02-klassen)
 *   okand   exit 2 — gick inte att mäta (inga .next/server/app, 0 HTML)
 *
 * Anropas av prod-synk.mjs FÖRE pm2-restart (deploygrind) och av
 * kraschvakt.mjs efter räddningsbygg (ärlighetsgrind: HTML-200 lurar
 * varm()); fristående: `node verktyg/artefakt-verifiering.mjs [--json]
 * [--katalog <.next-rot>] [--max <n>]` — skriver
 * data/vakten/artefakt-verifiering-SENASTE.json som rondläs-yta.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REF_MONSTER = /\/_next\/static\/[A-Za-z0-9._@+-]+(?:\/[A-Za-z0-9._@+-]+)*/g;

/** Rekursiv walk av .next/server/app → deterministiskt sorterade HTML-vägar.
 * lasfel=true om någon katalog ej gick att läsa (okänd > gissning). */
export function samlaHtmlFiler(katalog) {
  const ut = [];
  let lasfel = false;
  const stack = [katalog];
  while (stack.length) {
    const nu = stack.pop();
    let poster;
    try { poster = fs.readdirSync(nu, { withFileTypes: true }); } catch { lasfel = true; continue; }
    for (const p of poster) {
      const hel = path.join(nu, p.name);
      if (p.isDirectory()) stack.push(hel);
      else if (p.isFile() && p.name.endsWith(".html")) ut.push(hel);
    }
  }
  ut.sort();
  return { html: ut, lasfel };
}

/** HTML-innehåll → unika /_next/static-referenser (query/fragment klipps). */
export function lasRefs(innehall) {
  const trafdar = innehall.match(REF_MONSTER) ?? [];
  return [...new Set(trafdar.map((r) => r.replace(/[.]+$/, "")))];
}

/** Referens → filsökväg under .next/static, med %-avkodning i reserv. */
export function refsokVag(nextRot, ref) {
  const relativ = ref.replace(/^\/_next\/static\//, "");
  let vag = path.join(nextRot, "static", ...relativ.split("/"));
  if (!fs.existsSync(vag) && relativ.includes("%")) {
    try {
      vag = path.join(nextRot, "static", ...decodeURIComponent(relativ).split("/"));
    } catch { /* ogiltig kodning — orginalvägen gäller */ }
  }
  return vag;
}

/**
 * Kärnan. alternativ: { rot (=repo), nextKatalog (=".next"), maxHtml (=5000),
 * skrivLage (=true) }. Returnerar { status, meddelande, htmlFiler,
 * referenser, unikaReferenser, saknade: [{sida, ref}], trunkerad,
 * varaktighetMs }.
 */
export async function verifieraArtefakt(alternativ = {}) {
  const start = Date.now();
  const rot = alternativ.rot ?? ROT;
  const nextKatalog = alternativ.nextKatalog ?? path.join(rot, ".next");
  const serverApp = path.join(nextKatalog, "server", "app");
  const resultat = {
    status: "okand",
    meddelande: "",
    htmlFiler: 0,
    referenser: 0,
    unikaReferenser: 0,
    saknade: [],
    trunkerad: false,
    varaktighetMs: 0,
  };
  if (!fs.existsSync(serverApp)) {
    resultat.meddelande = `${path.relative(rot, serverApp) || serverApp} finns ej — ingen artefakt att mäta (kunde inte mäta, inte grön)`;
    resultat.varaktighetMs = Date.now() - start;
    return resultat;
  }
  const { html: alla, lasfel } = samlaHtmlFiler(serverApp);
  if (lasfel) {
    resultat.meddelande = "kunde inte läsa .next/server/app (kunde inte mäta, inte grön)";
    resultat.varaktighetMs = Date.now() - start;
    return resultat;
  }
  const tak = Math.max(1, alternativ.maxHtml ?? 5000);
  const filer = alla.slice(0, tak);
  resultat.trunkerad = alla.length > filer.length;
  if (filer.length === 0) {
    resultat.meddelande = "0 HTML-filer i .next/server/app — tom artefakt är inte grön (kunde inte mäta, inte grön)";
    resultat.varaktighetMs = Date.now() - start;
    return resultat;
  }

  const unika = new Set();
  for (const fil of filer) {
    let innehall;
    try { innehall = fs.readFileSync(fil, "utf8"); } catch { continue; }
    resultat.htmlFiler += 1;
    for (const ref of lasRefs(innehall)) {
      unika.add(ref);
      resultat.referenser += 1;
      if (!fs.existsSync(refsokVag(nextKatalog, ref))) {
        resultat.saknade.push({ sida: path.relative(serverApp, fil), ref });
      }
    }
  }
  resultat.unikaReferenser = unika.size;
  resultat.status = resultat.saknade.length === 0 ? "gron" : "trasig";
  resultat.meddelande =
    resultat.saknade.length === 0
      ? `${resultat.htmlFiler} HTML-filer, ${unika.size} unika referenser — samtliga finns på disk`
      : `${resultat.saknade.length} saknade referenser i ${new Set(resultat.saknade.map((s) => s.sida)).size} HTML-filer (12:02-klassen: HTML pekar på aldrig emitterade filer)`;
  resultat.varaktighetMs = Date.now() - start;

  if (alternativ.skrivLage !== false) {
    try {
      const vakt = path.join(rot, "data", "vakten");
      fs.mkdirSync(vakt, { recursive: true });
      fs.writeFileSync(
        path.join(vakt, "artefakt-verifiering-SENASTE.json"),
        JSON.stringify(
          { ts: new Date().toISOString(), ...resultat, saknade: resultat.saknade.slice(0, 25) },
          null,
          2,
        ) + "\n",
      );
    } catch { /* lägesfil får vänta — utdata bär sanningen */ }
  }
  return resultat;
}

// ── CLI ────────────────────────────────────────────────────────────────
const AR_MAIN = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (AR_MAIN) {
  const arg = (namn) => {
    const i = process.argv.indexOf(`--${namn}`);
    return i >= 0 ? process.argv[i + 1] : undefined;
  };
  const nextKatalog = arg("katalog");
  const maxHtml = arg("max") ? Number(arg("max")) : undefined;
  const r = await verifieraArtefakt({
    ...(nextKatalog ? { nextKatalog: path.resolve(nextKatalog) } : {}),
    ...(Number.isFinite(maxHtml) ? { maxHtml } : {}),
  });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    const ikon = r.status === "gron" ? "GRÖN" : r.status === "trasig" ? "TRANSIG" : "OKÄND";
    console.log(`artefakt: ${ikon} — ${r.meddelande} (${r.varaktighetMs} ms)`);
    for (const s of r.saknade.slice(0, 25)) console.log(`  saknas: ${s.sida} → ${s.ref}`);
    if (r.saknade.length > 25) console.log(`  … samt ${r.saknade.length - 25} till`);
  }
  process.exit(r.status === "gron" ? 0 : r.status === "trasig" ? 1 : 2);
}
