#!/usr/bin/env node
// RAM-GRINDEN (rond 33 / våg 169 — vaccin efter F6-incidenten 2026-09-15)
// =====================================================================
// ROT-fynd (Lag 2): prod osvarar 16:42 lokal när fabrikens AI-Mentorn-barn
// (58 min, ~0,8 GB) sammanföll med pm2-omstartar och bygg på 8 GB-servern
// med swap redan använd — next build (~2 GB peak) blev "Killed" (13:31,
// rond32-deploy.log) och hela servern svultgick kort (fetch failed).
//
// VACCIN (Lag 6): ALLA `npm run build` passerar denna grind via prebuild.
// Den väntar tills MemAvailable ≥ tröskel INNAN next build får börja äta.
// Detta skyddar KLASSEN (tyst OOM-död vid sammanfallande tunga körningar),
// inte ett symptom. Körs endast på Contabo-servern (path-markören) —
// kundens arbetsstation och CI påverkas aldrig.
//
// Argument: --min MB  (default 1600)   --tak sekunder (default 900)
// Exit: 0 = öppnad · 1 = stängd efter tak (bygget avbryts med tydlig logg,
//           vilket är PÅSKRIVET misslyckande — bättre än tyst "Killed").
import fs from "node:fs";
import path from "node:path";

const arg = (namn, standard) => {
  const i = process.argv.indexOf(`--${namn}`);
  return i >= 0 && process.argv[i + 1] ? parseInt(process.argv[i + 1], 10) : standard;
};
const MIN_MB = arg("min", 1600);
const TAK_SEK = arg("tak", 900);

// Endast Contabo: kundens dator och andra miljöer passerar fritt.
const paServern = fs.existsSync("/home/ak1a/AK1") && fs.existsSync("/proc/meminfo");
if (!paServern) process.exit(0);

function lasTillgangligtMB() {
  const rader = fs.readFileSync("/proc/meminfo", "utf8");
  const m = rader.match(/^MemAvailable:\s+(\d+)\s+kB/m);
  return m ? Math.round(+m[1] / 1024) : null;
}

function logga(text) {
  const rad = `${new Date().toISOString()} ${text}\n`;
  process.stdout.write(rad);
  try {
    const katalog = path.join(process.cwd(), "data", "vakten");
    fs.mkdirSync(katalog, { recursive: true });
    fs.appendFileSync(path.join(katalog, "ram-grind.logg"), rad);
  } catch { /* loggning får ALDRIG döda bygget */ }
}

const start = Date.now();
let vanteRader = 0;
for (;;) {
  const mb = lasTillgangligtMB();
  if (mb === null) process.exit(0); // meminfo oläsbar → återhämtningsbart pass
  if (mb >= MIN_MB) {
    if (vanteRader > 0) logga(`RAM-GRIND ÖPPNAD efter ${Math.round((Date.now() - start) / 1000)}s — ${mb} MB tillgängligt (krav ${MIN_MB})`);
    process.exit(0);
  }
  const sek = Math.round((Date.now() - start) / 1000);
  if (sek >= TAK_SEK) {
    logga(`RAM-GRIND STÄNGD efter ${sek}s — ${mb} MB tillgängligt, krav ${MIN_MB} MB ej uppnått; bygget avbryts PÅSKRIVET (vaccin mot tyst OOM-död, våg 169)`);
    process.exit(1);
  }
  if (vanteRader === 0) logga(`RAM-GRIND väntar — ${mb} MB tillgängligt, krav ${MIN_MB} MB (tak ${TAK_SEK}s)`);
  vanteRader++;
  const somoSek = Math.min(20, Math.max(1, TAK_SEK - sek));
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, somoSek * 1000); // sömnlös, tak-medveten
}
