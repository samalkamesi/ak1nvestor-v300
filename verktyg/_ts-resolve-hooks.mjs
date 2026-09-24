// Resolver-hook för node type stripping (V213b, s8-u2 2026-09-20).
// Körs i hooks-tråden via module.register från verktyg/ts-import.mjs —
// se det filhuvudet för motiv. Endast två översättningar:
//   "@/lib/x"      → <rot>/src/lib/x.ts      (tsconfig paths)
//   "./x" i .ts    → ./x.ts | ./x/index.ts   (bundlarkonvention utan ändelse)
// Allt annat faller igenom till nodes egna lösning.
import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROT = join(dirname(fileURLToPath(import.meta.url)), "..");

function arFil(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

function kandidater(bas) {
  return [bas + ".ts", bas + ".tsx", join(bas, "index.ts"), join(bas, "index.tsx")];
}

export async function resolve(specifier, context, nextResolve) {
  // "@/<x>" → <rot>/src/<x>(.ts)
  if (specifier.startsWith("@/")) {
    const bas = join(ROT, "src", specifier.slice(2));
    for (const k of [bas, ...kandidater(bas)]) {
      if (arFil(k)) return { url: pathToFileURL(k).href, shortCircuit: true };
    }
    throw new Error(`ts-resolve: "@/…"-importen ${specifier} hittar ingen fil under src/`);
  }
  // Relativ utan filändelse (endast inifrån en fil i trädet — aldrig_entrypunkter_)
  if (
    (specifier === "." || specifier === ".." || specifier.startsWith("./") || specifier.startsWith("../")) &&
    !/\.[a-zA-Z0-9]+$/.test(specifier)
  ) {
    try {
      const forelder = context.parentURL ? dirname(fileURLToPath(context.parentURL)) : ROT;
      const bas = join(forelder, specifier);
      for (const k of kandidater(bas)) {
        if (arFil(k)) return { url: pathToFileURL(k).href, shortCircuit: true };
      }
    } catch {
      // ogiltig parentURL etc — fall igenom till standardlösningen
    }
  }
  return nextResolve(specifier, context);
}
