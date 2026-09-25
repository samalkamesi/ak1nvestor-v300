#!/usr/bin/env node
/** _r246-stada.mjs — ta bort temporär commitmeddelandefil via node (rm hänger i studioskalet). */
import { rmSync, existsSync } from "node:fs";
rmSync(".r246-commitmsg.txt", { force: true });
console.log(existsSync(".r246-commitmsg.txt") ? "FINNS KVAR" : "BORTTAGEN");
