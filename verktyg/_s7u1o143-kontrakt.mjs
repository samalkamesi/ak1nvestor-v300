#!/usr/bin/env node
/**
 * AK1A — KONTRAKT o143 (Spår 7, s7-u1): kurkontrakt för /dataset-CLS-kuren
 * + manifest-ikon-sidokuren. Statiska strängkontroller mot källfilerna +
 * live-HTTP mot localhost. 0 FAIL krävs för leverans.
 *
 * node verktyg/_s7u1o143-kontrakt.mjs
 */
import { readFileSync } from "node:fs";

const sortering = readFileSync("src/components/ak1a/dataset-sortering.tsx", "utf8");
const sidor = readFileSync("src/components/ak1a/dataset-sidor.tsx", "utf8");
const manifest = readFileSync("public/manifest.json", "utf8");

let pass = 0, fail = 0;
const koll = (id, villkor, beskrivning) => {
  if (villkor) { pass++; console.log(`PASS ${id}: ${beskrivning}`); }
  else { fail++; console.log(`FAIL ${id}: ${beskrivning}`); }
};

koll("C1", !sortering.includes("useSearchParams(") && !sortering.includes('useSearchParams }') && !/^import .*useSearchParams/m.test(sortering), "dataset-sortering.tsx KOD använder inte useSearchParams (suspensionsroten borta; dokumenterande kommentarer får nämna den)");
koll("C2", sortering.includes('new URLSearchParams(window.location.search).get("sortera")') && sortering.includes('addEventListener("popstate"', ), "?sortera= läses ur window.location + popstate-listener (bakåt/framåt)");
koll("C3", /<button[^>]*type="button"[^>]*onClick=\{\(\) => valj\(v\.id\)\}/.test(sortering), "pillarna är type=button med onClick-valj");
koll("C4", sortering.includes("max-md:min-h-[52px]") && (sortering.match(/max-md:min-h-\[52px\]/g) || []).length >= 2, "o126:s 52px-tryckytetest klasser bevarade på båda pillvarianterna");
koll("C5", sortering.includes('router.push("?sortera=" + id, { scroll: false })'), "adressbar-länken bevarad: router.push + scroll:false");
koll("C6", !sidor.includes("<Suspense") && !sidor.includes("{ Suspense }"), "dataset-sidor.tsx: ingen Suspense-import och ingen gräns kvar i KOD (kommentarer får nämna)");
koll("C7", sidor.includes("<DatasetSorteradLista rader={sorterbara} etiketter={etiketter} prefix={prefix} />"), "DatasetSorteradLista används direkt (prop-signatur oförändrad)");
koll("C8", sortering.includes("export type SorterbarBransch") && sortering.includes("export type SorteringsEtiketter") && sortering.includes("export function DatasetSorteradLista"), "exporter + komponentnamn orörda (gränssnittet mot sidorna intakt)");
koll("C9", sortering.includes('function tolkaSortera(') && sortering.includes("function sorteraRader(") && sortering.includes('localeCompare(b.namn, "sv")'), "deterministisk sorteringslogik orörd (sv-kollation, null sist)");
koll("C10", manifest.includes('"/ak1a/ikon-192.png"') && manifest.includes('"/ak1a/ikon-maskable-512.png"') && !manifest.includes("/ak1a/logo/"), "manifest.json pekar på de tre äkta ikonerna (inga /ak1a/logo/-referenser kvar)");

const live = await fetch("http://localhost:3000/manifest.json").then((r) => r.text());
koll("C11", live.includes('"/ak1a/ikon-192.png"') && !live.includes("/ak1a/logo/"), "LIVE: serverad /manifest.json bär kuren (public/ från disk, inget bygge)");
for (const p of ["/ak1a/ikon-192.png", "/ak1a/ikon-512.png", "/ak1a/ikon-maskable-512.png"]) {
  const kod = await fetch("http://localhost:3000" + p).then((r) => r.status);
  koll("C12-" + p, kod === 200, `LIVE: ${p} svarar 200 (${kod})`);
}
const trasig = await fetch("http://localhost:3000/ak1a/logo/ikon-192.png").then((r) => r.status);
koll("C13", trasig === 404, "gamla trasiga sökvägen refereras ej längre (själv 404, väntat)");

console.log(`\n${pass} PASS · ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
