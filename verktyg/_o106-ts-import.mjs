#!/usr/bin/env node
// _o106-ts-import — resolve-hook för sviter som importerar src:s .ts-moduler
// DIREKT (Node ≥ 22.18 type stripping). Typstrippningen löser bara fullständiga
// specifierare: modulers interna "./andra-modul"- och "@/lib/…"-importer
// behöver denna hook. Endast för testa-*.mjs-sviter — ALDRIG för prod-kod.
// Användning:  import { aktiveraTsImport } from "./_o106-ts-import.mjs";
//              aktiveraTsImport();
//              const mod = await import(pathToFileURL("…/modul.ts").href);
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

export function aktiveraTsImport() {
  registerHooks({
    resolve(specifier, context, nextResolve) {
      let spek = specifier;
      if (spek.startsWith("@/")) {
        spek = pathToFileURL(join(ROT, "src", spek.slice(2))).href;
      }
      if (!spek.startsWith(".") && !spek.startsWith("file:")) {
        return nextResolve(spek, context);
      }
      try {
        return nextResolve(spek, context);
      } catch (fel) {
        let absolut = spek.startsWith("file:") ? spek : null;
        if (!absolut && spek.startsWith(".") && context.parentURL) {
          try { absolut = new URL(spek, context.parentURL).href; } catch { absolut = null; }
        }
        if (absolut) {
          for (const andelse of [".ts", ".tsx", "/index.ts", ".js"]) {
            const kandidat = absolut + andelse;
            if (existsSync(fileURLToPath(kandidat))) {
              return { url: kandidat, shortCircuit: true };
            }
          }
        }
        throw fel;
      }
    },
  });
}
