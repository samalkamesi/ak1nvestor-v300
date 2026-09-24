/**
 * o105-testets resolve-hook: mappar TS-aliaset "@/" → <rot>/src/ så att
 * node kan köra src/lib/*.ts direkt (samma trick som behövs eftersom
 * sprak.ts importerar "@/lib/ordlista"). Endast för offline-test —
 * appens egen bundler påverkas inte.
 */
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    let mal = path.join(ROT, "src", specifier.slice(2));
    // TS-importer i rep saknar ändelse ("@/lib/ordlista") — node ESM kräver den
    if (!/\.(ts|tsx|mjs|js|json|css)$/.test(mal) && existsSync(`${mal}.ts`)) {
      mal = `${mal}.ts`;
    }
    return next(pathToFileURL(mal).href, context);
  }
  return next(specifier, context);
}
