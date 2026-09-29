#!/usr/bin/env node
/**
 * MÄRK FRAMTIDS-BLOGGPLATSER 404 (v211 r332 — soft-404-kuren)
 * =====================================================================
 * ROTEN (r327:s utredning): /blogg/[slug] genererar medvetet platser
 * ÄVEN för framtidsdiskade inlägg (publishedAt > idag) — S2-designen:
 * ett schemalagt inlägg vaknar live AV SIG SJÄLVT vid nästa ISR-
 * omrendering (revalidate 3600) när publiceringsdagen kommer, utan
 * deploy. Rendering med getBlogPost ⇒ null ⇒ notFound() ger rätt
 * 404-KROPP — men Next 16.3.6 skriver ingen "status" i .meta för
 * platser som nått notFound via generateStaticParams (den globala
 * _not-found.meta HAR status: 404 — skillnaden är mekanismen), och
 * next start serverar därför platserna med HTTP 200 = SOFT-404:
 * länkbara/indexerbara men innehållslösa.
 *
 * KUREN: detta postbuild-steg sätter "status": 404 i .meta för varje
 * statisk bloggplats vars inlägg ännu inte är publicerat. När dagen
 * kommer omrenderar ISR sidan med riktigt innehåll och Next skriver
 * färsk meta UTAN 404-status ⇒ 200 — S2-autopubliceringen bevaras
 * exakt som designad.
 *
 * Installerat som npm "postbuild" (package.json) — varje `npm run
 * build` märker platserna automatiskt. Idempotent; skriver ALDRIG utan
 *för .next; exit 0 alltid (ett postbuild-steg får ALDRIG bryta bygget).
 *
 * REST (bokförd v211): /en/ och /ar/-speglarna är on-demand (inga
 * statiska platser att märka) — deras soft-404 kvarstår till dagen;
 * innehållslösa skal, ingen läcka.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROT, ".next", "server", "app");

/** Dagens datum YYYY-MM-DD i svensk tidszon — content.ts bloggDagensDatum(). */
function dagensDatumSv() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", dateStyle: "short" }).format(new Date());
}

try {
  if (!fs.existsSync(APP)) {
    console.log("[marke-framtids-404] ingen .next/server/app — hoppar (ok i torrmiljö)");
    process.exit(0);
  }
  const idag = dagensDatumSv();
  const dir = path.join(ROT, "data", "blogg");
  if (!fs.existsSync(dir)) {
    console.log("[marke-framtids-404] ingen data/blogg — hoppar");
    process.exit(0);
  }

  const framtida = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const post = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      const d = String(post.publishedAt ?? "").slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d > idag && typeof post.slug === "string") {
        framtida.push(post.slug);
      }
    } catch {
      /* ogiltig json — konfigvaktens klass, inte vår */
    }
  }

  let märkta = 0;
  for (const slug of framtida) {
    const meta = path.join(APP, "blogg", `${slug}.meta`);
    if (!fs.existsSync(meta)) continue; // plats saknas (t.ex. on-demand) — inget att märka
    try {
      const j = JSON.parse(fs.readFileSync(meta, "utf8"));
      if (j.status === 404) continue; // redan märkt (idempotens)
      j.status = 404;
      fs.writeFileSync(meta, JSON.stringify(j, null, 2) + "\n");
      märkta++;
      console.log(`[marke-framtids-404] ${slug}: status 404 märkt (publiceras senare)`);
    } catch (e) {
      console.log(`[marke-framtids-404] ${slug}: kunde ej märka (${String(e?.message ?? e).slice(0, 60)}) — hoppar`);
    }
  }
  console.log(`[marke-framtids-404] klar: ${märkta} av ${framtida.length} framtidsplats(er) märkta 404 (idag ${idag})`);
} catch (e) {
  console.log(`[marke-framtids-404] fel (ej fatalt): ${String(e?.message ?? e).slice(0, 100)}`);
}
process.exit(0);
