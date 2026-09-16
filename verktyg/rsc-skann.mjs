#!/usr/bin/env node
/**
 * RSC-SKANNEN (spår 8, s8-u1 försök 2 — o33 §6 bokning 3, evolutionsposten) — 2026-09-16
 * ====================================================================
 * BEVISAT behov (samma E34-familj som artefakt-verifieringen, o33): ett
 * RAM-svält bygg kan emittera HTML vars kontrakt mäts grönt medan
 * RSC-payloaderna (`.next/server/app`-trädets `*.rsc`-filer — flight-data som
 * klientnavigeringar hämtar vid varje länkklick) refererar chunks som
 * aldrig emitterades. Skadan är BLIND för hela befintliga kedjan: HTML
 * svarar 200 (httpsOk/varm passerar), artefaktgrinden (o33) mäter ENDAST
 * HTML:er — men första klicket på en trasig sida får sin navigering
 * nekade skript/stilar. Ytan är 5× HTML-ytan (6519 .rsc mot 1304 HTML,
 * 2026-09-16-mätning) och 783 109 referenser — samtliga i
 * `/_next/static`-familjen (kontraktet är rent: noll /_next/image- eller
 * andra runtime-familjer i korpusen, mätt med grep över hela trädet).
 *
 * Kontraktet som mäts: VARJE `/_next/static/…`-referens i varje
 * `.rsc`-fil under `.next/server/app/` MÅSTE finnas på disk under
 * `.next/static/`. Kärnan (lasRefs/refsokVag) ÅTERANVÄNDS från
 * artefakt-verifiering.mjs — samma regex, samma %-avkodning, samma
 * kontraktssemantik; detta verktyg äger bara .rsc-ytan. Ren fs-läsning
 * — noll child-processer, noll nätverk; korpusen 55,8 MB à en fil i
 * taget = några sekunder, RAM-trogen i deployfönstret.
 *
 * Status (o24 §5: "måttobjekt trasigt" ≠ "kunde inte mäta"):
 *   gron    exit 0 — samtliga referenser finns
 *   trasig  exit 1 — ≥1 referens saknas på disk (E34-klassen i .rsc)
 *   okand   exit 2 — gick inte att mäta (inga .next/server/app, 0 .rsc)
 *
 * Fristående: `node verktyg/rsc-skann.mjs [--json] [--katalog <.next-rot>]
 * [--max <n>]` — skriver data/vakten/rsc-skann-SENASTE.json som
 * rondläs-yta. Integration i prod-synk/kraschvakt ÄR avsiktligt EJ
 * gjord här (deploykedjan ägs av prod-synkens ägare; bokning i o36 §6).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lasRefs, refsokVag } from "./artefakt-verifiering.mjs";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Rekursiv walk av .next/server/app → deterministiskt sorterade .rsc-vägar.
 * lasfel=true om någon katalog ej gick att läsa (okänd > gissning). */
export function samlaRscFiler(katalog) {
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
      else if (p.isFile() && p.name.endsWith(".rsc")) ut.push(hel);
    }
  }
  ut.sort();
  return { rsc: ut, lasfel };
}

/**
 * Kärnan. alternativ: { rot (=repo), nextKatalog (=".next"), maxRsc (=10000),
 * skrivLage (=true) }. Returnerar { status, meddelande, rscFiler,
 * referenser, unikaReferenser, saknade: [{sida, ref}], trunkerad,
 * varaktighetMs }. maxRsc 10000: korpusen 6519 (2026-09-16) får växa
 * 50 % innan trunkeringsflaggan varnar — taket är ärlighetsgräns, ej gräns
 * för vad som hävdas mätt.
 */
export async function verifieraRsc(alternativ = {}) {
  const start = Date.now();
  const rot = alternativ.rot ?? ROT;
  const nextKatalog = alternativ.nextKatalog ?? path.join(rot, ".next");
  const serverApp = path.join(nextKatalog, "server", "app");
  const resultat = {
    status: "okand",
    meddelande: "",
    rscFiler: 0,
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
  const { rsc: alla, lasfel } = samlaRscFiler(serverApp);
  if (lasfel) {
    resultat.meddelande = "kunde inte läsa .next/server/app (kunde inte mäta, inte grön)";
    resultat.varaktighetMs = Date.now() - start;
    return resultat;
  }
  const tak = Math.max(1, alternativ.maxRsc ?? 10000);
  const filer = alla.slice(0, tak);
  resultat.trunkerad = alla.length > filer.length;
  if (filer.length === 0) {
    resultat.meddelande = "0 .rsc-filer i .next/server/app — tom artefakt är inte grön (kunde inte mäta, inte grön)";
    resultat.varaktighetMs = Date.now() - start;
    return resultat;
  }

  const unika = new Set();
  for (const fil of filer) {
    let innehall;
    try { innehall = fs.readFileSync(fil, "utf8"); } catch { continue; }
    resultat.rscFiler += 1;
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
      ? `${resultat.rscFiler} .rsc-filer, ${unika.size} unika referenser — samtliga finns på disk`
      : `${resultat.saknade.length} saknade referenser i ${new Set(resultat.saknade.map((s) => s.sida)).size} .rsc-filer (E34-klassen i navigeringslagret: flight-data pekar på aldrig emitterade filer)`;
  resultat.varaktighetMs = Date.now() - start;

  if (alternativ.skrivLage !== false) {
    try {
      const vakt = path.join(rot, "data", "vakten");
      fs.mkdirSync(vakt, { recursive: true });
      fs.writeFileSync(
        path.join(vakt, "rsc-skann-SENASTE.json"),
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
const RS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (RS_MAIN) {
  const arg = (namn) => {
    const i = process.argv.indexOf(`--${namn}`);
    return i >= 0 ? process.argv[i + 1] : undefined;
  };
  const nextKatalog = arg("katalog");
  const maxRsc = arg("max") ? Number(arg("max")) : undefined;
  const r = await verifieraRsc({
    ...(nextKatalog ? { nextKatalog: path.resolve(nextKatalog) } : {}),
    ...(Number.isFinite(maxRsc) ? { maxRsc } : {}),
  });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    const ikon = r.status === "gron" ? "GRÖN" : r.status === "trasig" ? "TRANSIG" : "OKÄND";
    console.log(`rsc-skann: ${ikon} — ${r.meddelande} (${r.varaktighetMs} ms)`);
    for (const s of r.saknade.slice(0, 25)) console.log(`  saknas: ${s.sida} → ${s.ref}`);
    if (r.saknade.length > 25) console.log(`  … samt ${r.saknade.length - 25} till`);
  }
  process.exit(r.status === "gron" ? 0 : r.status === "trasig" ? 1 : 2);
}
