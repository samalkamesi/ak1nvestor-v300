#!/usr/bin/env node
/**
 * _s2u2o22-kontrakt-korning.mjs — kör verktyg/testa-dataset-aspekter.mjs
 * OFÖRÄNDRAT genom en node-loader som (a) löser extensionless TS-importer
 * ("./ordlista" → "./ordlista.ts", tsx-beteende) och (b) transpilerar .ts
 * via projektets egna typescript-binär (node_modules/typescript — läsning,
 * ingen installation). Bakgrund: omg21 körde testet via cachad tsx-CLI;
 * cachen är rensad och tsx finns ej i node_modules — denna korning ger
 * samma semantik (ren ESM, mod.aspekter synlig) utan att röra testfilen.
 */
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ts from "../node_modules/typescript/lib/typescript.js";

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (e) {
      if (specifier.startsWith(".") || specifier.startsWith("/")) {
        for (const suffix of [".ts", ".tsx", "/index.ts"]) {
          try { return nextResolve(specifier + suffix, context); } catch { /* nästa */ }
        }
      }
      throw e;
    }
  },
  load(url, context, nextLoad) {
    if (url.endsWith(".ts") || url.endsWith(".tsx")) {
      const kalla = readFileSync(fileURLToPath(url), "utf8");
      const ut = ts.transpileModule(kalla, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          verbatimModuleSyntax: false,
          isolatedModules: true,
        },
      }).outputText;
      return { format: "module", source: ut, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

await import(pathToFileURL(path.resolve("verktyg/testa-dataset-aspekter.mjs")).href);
